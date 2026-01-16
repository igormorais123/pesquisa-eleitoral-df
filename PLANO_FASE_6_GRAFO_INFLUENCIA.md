# FASE 6: GRAFO DE INFLUÊNCIA SOCIAL

## Documento de Implementação Detalhado

**Dependências**: Fase 5 (opcional)
**Estimativa**: 7-10 dias de desenvolvimento
**Risco**: Médio (mais complexo conceitualmente)

---

## OBJETIVO

Criar um modelo de grafo social que simula como eleitores influenciam uns aos outros, permitindo identificar formadores de opinião locais e simular cascatas de influência (efeito Word of Mouth).

---

## CONCEITO

```
┌─────────────────────────────────────────────────────────────────┐
│                   GRAFO DE INFLUÊNCIA                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INSIGHT: Eleitores não votam isolados - são influenciados      │
│  por família, vizinhos, colegas de trabalho, igreja, etc.       │
│                                                                 │
│  MODELO:                                                        │
│  ├─ Cada eleitor é um NÓ no grafo                              │
│  ├─ Conexões são ARESTAS (vizinhança, trabalho, religião)      │
│  ├─ Alguns nós são HUBS (formadores de opinião)                │
│  └─ Opiniões se propagam através das conexões                  │
│                                                                 │
│  SIMULAÇÕES:                                                    │
│  ├─ Cascata: "Se X mudar de voto, quem mais muda?"             │
│  ├─ Contágio: "Mensagem viral atinge quantos em 3 saltos?"     │
│  └─ Influenciadores: "Quem são os 10 mais influentes?"         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## MODELO DE GRAFO

### Tipos de Conexão

| Tipo | Peso Base | Descrição |
|------|-----------|-----------|
| `vizinhanca` | 0.6 | Mesma região administrativa |
| `religiao` | 0.7 | Mesma religião |
| `trabalho` | 0.5 | Mesmo tipo de ocupação |
| `classe` | 0.5 | Mesmo cluster socioeconômico |
| `idade` | 0.4 | Faixa etária similar (±10 anos) |
| `politica` | 0.8 | Mesma orientação política |

### Cálculo de Influência

```
influencia(A → B) = peso_conexao ×
                    susceptibilidade(B) ×
                    credibilidade(A) ×
                    (1 - distancia_ideologica(A, B))
```

### Métricas de Centralidade

1. **Degree Centrality**: Número de conexões diretas
2. **Betweenness**: Frequência em caminhos mais curtos
3. **PageRank**: Importância recursiva baseada em conexões
4. **Influência Local**: Capacidade de mudar opinião de vizinhos

---

## ARQUIVOS A CRIAR

### Backend

#### 1. `backend/app/servicos/grafo_influencia_servico.py`

```python
"""
Serviço de Grafo de Influência Social

Modela relações de influência entre eleitores e simula
propagação de opiniões através da rede social.
"""

import json
import math
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple
from collections import defaultdict
import random

from app.servicos.eleitor_servico import obter_servico_eleitores


class GrafoInfluenciaServico:
    """Serviço para análise de grafo de influência social"""

    # Pesos base para tipos de conexão
    PESOS_CONEXAO = {
        "vizinhanca": 0.6,
        "religiao": 0.7,
        "trabalho": 0.5,
        "classe": 0.5,
        "idade": 0.4,
        "politica": 0.8
    }

    def __init__(self):
        base_path = Path(__file__).parent.parent.parent.parent
        self.caminho_grafo = base_path / "memorias" / "grafo_influencia.json"
        self._grafo: Dict[str, Dict] = {}
        self._metricas_cache: Dict[str, Any] = {}
        self._carregar_grafo()

    def _carregar_grafo(self):
        """Carrega grafo do arquivo"""
        if self.caminho_grafo.exists():
            with open(self.caminho_grafo, "r", encoding="utf-8") as f:
                data = json.load(f)
                self._grafo = data.get("grafo", {})
                self._metricas_cache = data.get("metricas", {})

    def _salvar_grafo(self):
        """Salva grafo no arquivo"""
        self.caminho_grafo.parent.mkdir(parents=True, exist_ok=True)
        with open(self.caminho_grafo, "w", encoding="utf-8") as f:
            json.dump({
                "grafo": self._grafo,
                "metricas": self._metricas_cache,
                "atualizado_em": datetime.now().isoformat()
            }, f, ensure_ascii=False, indent=2)

    def construir_grafo(self, reconstruir: bool = False) -> Dict[str, Any]:
        """
        Constrói o grafo de influência baseado nos eleitores.

        Args:
            reconstruir: Se True, reconstrói mesmo se já existir

        Returns:
            Estatísticas do grafo construído
        """
        if self._grafo and not reconstruir:
            return {
                "mensagem": "Grafo já existe. Use reconstruir=True para recriar.",
                "total_nos": len(self._grafo),
                "total_arestas": sum(len(n.get("conexoes", [])) for n in self._grafo.values()) // 2
            }

        eleitor_servico = obter_servico_eleitores()
        resultado = eleitor_servico.listar(pagina=1, por_pagina=500)
        eleitores = resultado.get("eleitores", [])

        self._grafo = {}

        # Criar nós
        for e in eleitores:
            self._grafo[e["id"]] = {
                "id": e["id"],
                "nome": e.get("nome"),
                "regiao": e.get("regiao_administrativa"),
                "religiao": e.get("religiao"),
                "cluster": e.get("cluster_socioeconomico"),
                "ocupacao": e.get("ocupacao_vinculo"),
                "idade": e.get("idade"),
                "orientacao": e.get("orientacao_politica"),
                "susceptibilidade": e.get("susceptibilidade_desinformacao", 5) / 10,
                "vieses": e.get("vieses_cognitivos", []),
                "conexoes": []
            }

        # Criar arestas
        eleitor_ids = list(self._grafo.keys())
        total_arestas = 0

        for i, id_a in enumerate(eleitor_ids):
            for id_b in eleitor_ids[i+1:]:
                conexoes = self._calcular_conexoes(
                    self._grafo[id_a],
                    self._grafo[id_b]
                )

                if conexoes:
                    peso_total = sum(c["peso"] for c in conexoes)

                    # Só conectar se peso significativo
                    if peso_total >= 0.5:
                        self._grafo[id_a]["conexoes"].append({
                            "alvo": id_b,
                            "tipos": conexoes,
                            "peso": round(peso_total, 2)
                        })
                        self._grafo[id_b]["conexoes"].append({
                            "alvo": id_a,
                            "tipos": conexoes,
                            "peso": round(peso_total, 2)
                        })
                        total_arestas += 1

        # Calcular métricas de centralidade
        self._calcular_metricas()

        self._salvar_grafo()

        return {
            "total_nos": len(self._grafo),
            "total_arestas": total_arestas,
            "media_conexoes": round(total_arestas * 2 / len(self._grafo), 1) if self._grafo else 0,
            "construido_em": datetime.now().isoformat()
        }

    def _calcular_conexoes(
        self,
        eleitor_a: Dict,
        eleitor_b: Dict
    ) -> List[Dict[str, Any]]:
        """Calcula conexões entre dois eleitores"""
        conexoes = []

        # Vizinhança (mesma RA)
        if eleitor_a.get("regiao") == eleitor_b.get("regiao"):
            conexoes.append({
                "tipo": "vizinhanca",
                "peso": self.PESOS_CONEXAO["vizinhanca"]
            })

        # Religião
        if eleitor_a.get("religiao") == eleitor_b.get("religiao"):
            conexoes.append({
                "tipo": "religiao",
                "peso": self.PESOS_CONEXAO["religiao"]
            })

        # Trabalho (mesmo tipo de ocupação)
        if eleitor_a.get("ocupacao") == eleitor_b.get("ocupacao"):
            conexoes.append({
                "tipo": "trabalho",
                "peso": self.PESOS_CONEXAO["trabalho"]
            })

        # Classe social
        if eleitor_a.get("cluster") == eleitor_b.get("cluster"):
            conexoes.append({
                "tipo": "classe",
                "peso": self.PESOS_CONEXAO["classe"]
            })

        # Idade similar (±10 anos)
        idade_a = eleitor_a.get("idade", 0)
        idade_b = eleitor_b.get("idade", 0)
        if abs(idade_a - idade_b) <= 10:
            conexoes.append({
                "tipo": "idade",
                "peso": self.PESOS_CONEXAO["idade"]
            })

        # Orientação política
        if eleitor_a.get("orientacao") == eleitor_b.get("orientacao"):
            conexoes.append({
                "tipo": "politica",
                "peso": self.PESOS_CONEXAO["politica"]
            })

        return conexoes

    def _calcular_metricas(self):
        """Calcula métricas de centralidade para todos os nós"""
        self._metricas_cache = {}

        for node_id in self._grafo:
            conexoes = self._grafo[node_id].get("conexoes", [])

            # Degree centrality
            degree = len(conexoes)

            # Weighted degree
            weighted_degree = sum(c.get("peso", 0) for c in conexoes)

            # Influência local (capacidade de influenciar vizinhos)
            suscept_vizinhos = []
            for c in conexoes:
                vizinho = self._grafo.get(c["alvo"], {})
                suscept_vizinhos.append(vizinho.get("susceptibilidade", 0.5))

            influencia_local = (
                weighted_degree * (sum(suscept_vizinhos) / len(suscept_vizinhos))
                if suscept_vizinhos else 0
            )

            self._metricas_cache[node_id] = {
                "degree": degree,
                "weighted_degree": round(weighted_degree, 2),
                "influencia_local": round(influencia_local, 2)
            }

        # Calcular PageRank simplificado
        self._calcular_pagerank()

    def _calcular_pagerank(self, iteracoes: int = 20, damping: float = 0.85):
        """Calcula PageRank para cada nó"""
        n = len(self._grafo)
        if n == 0:
            return

        # Inicializar
        pagerank = {node_id: 1/n for node_id in self._grafo}

        for _ in range(iteracoes):
            novo_pr = {}
            for node_id in self._grafo:
                conexoes = self._grafo[node_id].get("conexoes", [])
                soma = 0
                for c in conexoes:
                    vizinho_id = c["alvo"]
                    vizinho_conexoes = len(self._grafo.get(vizinho_id, {}).get("conexoes", []))
                    if vizinho_conexoes > 0:
                        soma += pagerank[vizinho_id] / vizinho_conexoes

                novo_pr[node_id] = (1 - damping) / n + damping * soma

            pagerank = novo_pr

        # Normalizar
        max_pr = max(pagerank.values()) if pagerank else 1
        for node_id in pagerank:
            self._metricas_cache[node_id]["pagerank"] = round(pagerank[node_id] / max_pr, 3)

    def obter_influenciadores(
        self,
        limite: int = 20,
        regiao: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Retorna os maiores influenciadores do grafo.
        """
        if not self._grafo:
            return []

        influenciadores = []

        for node_id, node in self._grafo.items():
            if regiao and node.get("regiao") != regiao:
                continue

            metricas = self._metricas_cache.get(node_id, {})

            influenciadores.append({
                "eleitor_id": node_id,
                "nome": node.get("nome"),
                "regiao": node.get("regiao"),
                "cluster": node.get("cluster"),
                "orientacao": node.get("orientacao"),
                "conexoes": metricas.get("degree", 0),
                "influencia_local": metricas.get("influencia_local", 0),
                "pagerank": metricas.get("pagerank", 0),
                "score_influencia": round(
                    metricas.get("influencia_local", 0) * 0.5 +
                    metricas.get("pagerank", 0) * 0.5,
                    3
                )
            })

        # Ordenar por score de influência
        influenciadores.sort(key=lambda x: x["score_influencia"], reverse=True)

        return influenciadores[:limite]

    def simular_cascata(
        self,
        eleitor_origem: str,
        nova_opiniao: str,
        probabilidade_base: float = 0.3,
        max_saltos: int = 3
    ) -> Dict[str, Any]:
        """
        Simula cascata de influência a partir de um eleitor.

        Args:
            eleitor_origem: ID do eleitor que muda de opinião
            nova_opiniao: Nova opinião/voto do eleitor
            probabilidade_base: Probabilidade base de propagação
            max_saltos: Número máximo de saltos na rede

        Returns:
            Resultado da simulação de cascata
        """
        if eleitor_origem not in self._grafo:
            return {"erro": "Eleitor não encontrado no grafo"}

        # Inicializar
        convertidos = {eleitor_origem: {
            "salto": 0,
            "influenciado_por": None,
            "probabilidade": 1.0
        }}
        fronteira = [eleitor_origem]
        historico_saltos = []

        for salto in range(1, max_saltos + 1):
            nova_fronteira = []
            conversoes_salto = []

            for node_id in fronteira:
                node = self._grafo[node_id]

                for conexao in node.get("conexoes", []):
                    vizinho_id = conexao["alvo"]

                    # Já convertido?
                    if vizinho_id in convertidos:
                        continue

                    vizinho = self._grafo.get(vizinho_id, {})

                    # Calcular probabilidade de conversão
                    peso_conexao = conexao.get("peso", 0.5)
                    suscept = vizinho.get("susceptibilidade", 0.5)

                    prob = probabilidade_base * peso_conexao * suscept

                    # Simular
                    if random.random() < prob:
                        convertidos[vizinho_id] = {
                            "salto": salto,
                            "influenciado_por": node_id,
                            "probabilidade": round(prob, 3)
                        }
                        nova_fronteira.append(vizinho_id)
                        conversoes_salto.append({
                            "eleitor_id": vizinho_id,
                            "nome": vizinho.get("nome"),
                            "regiao": vizinho.get("regiao"),
                            "influenciado_por": node.get("nome"),
                            "probabilidade": round(prob, 3)
                        })

            historico_saltos.append({
                "salto": salto,
                "novas_conversoes": len(conversoes_salto),
                "total_acumulado": len(convertidos),
                "detalhes": conversoes_salto[:10]  # Top 10 por salto
            })

            fronteira = nova_fronteira

            if not fronteira:
                break

        # Estatísticas por região
        por_regiao: Dict[str, int] = defaultdict(int)
        for conv_id in convertidos:
            regiao = self._grafo.get(conv_id, {}).get("regiao", "Outros")
            por_regiao[regiao] += 1

        return {
            "eleitor_origem": {
                "id": eleitor_origem,
                "nome": self._grafo[eleitor_origem].get("nome"),
                "regiao": self._grafo[eleitor_origem].get("regiao")
            },
            "nova_opiniao": nova_opiniao,
            "total_convertidos": len(convertidos),
            "taxa_conversao": round(len(convertidos) / len(self._grafo) * 100, 2),
            "saltos_executados": len(historico_saltos),
            "conversoes_por_salto": historico_saltos,
            "conversoes_por_regiao": dict(sorted(
                por_regiao.items(),
                key=lambda x: x[1],
                reverse=True
            )),
            "parametros": {
                "probabilidade_base": probabilidade_base,
                "max_saltos": max_saltos
            }
        }

    def obter_vizinhanca(
        self,
        eleitor_id: str,
        profundidade: int = 1
    ) -> Dict[str, Any]:
        """
        Obtém vizinhança de um eleitor até certa profundidade.
        """
        if eleitor_id not in self._grafo:
            return {"erro": "Eleitor não encontrado"}

        visitados = {eleitor_id}
        vizinhanca = []
        fronteira = [eleitor_id]

        for nivel in range(1, profundidade + 1):
            nova_fronteira = []

            for node_id in fronteira:
                node = self._grafo[node_id]

                for conexao in node.get("conexoes", []):
                    vizinho_id = conexao["alvo"]

                    if vizinho_id not in visitados:
                        visitados.add(vizinho_id)
                        nova_fronteira.append(vizinho_id)

                        vizinho = self._grafo[vizinho_id]
                        vizinhanca.append({
                            "eleitor_id": vizinho_id,
                            "nome": vizinho.get("nome"),
                            "regiao": vizinho.get("regiao"),
                            "nivel": nivel,
                            "peso_conexao": conexao.get("peso"),
                            "tipos_conexao": [c["tipo"] for c in conexao.get("tipos", [])]
                        })

            fronteira = nova_fronteira

        return {
            "eleitor_central": {
                "id": eleitor_id,
                "nome": self._grafo[eleitor_id].get("nome")
            },
            "profundidade": profundidade,
            "total_vizinhos": len(vizinhanca),
            "vizinhos": vizinhanca
        }

    def obter_estatisticas_grafo(self) -> Dict[str, Any]:
        """Retorna estatísticas gerais do grafo"""
        if not self._grafo:
            return {"erro": "Grafo não construído"}

        conexoes = [len(n.get("conexoes", [])) for n in self._grafo.values()]

        # Distribuição por região
        por_regiao: Dict[str, int] = defaultdict(int)
        for node in self._grafo.values():
            por_regiao[node.get("regiao", "Outros")] += 1

        return {
            "total_nos": len(self._grafo),
            "total_arestas": sum(conexoes) // 2,
            "media_conexoes": round(sum(conexoes) / len(conexoes), 2) if conexoes else 0,
            "max_conexoes": max(conexoes) if conexoes else 0,
            "min_conexoes": min(conexoes) if conexoes else 0,
            "nos_isolados": sum(1 for c in conexoes if c == 0),
            "distribuicao_por_regiao": dict(sorted(
                por_regiao.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10])
        }


# Singleton
_grafo_influencia_servico: Optional[GrafoInfluenciaServico] = None


def obter_grafo_influencia_servico() -> GrafoInfluenciaServico:
    global _grafo_influencia_servico
    if _grafo_influencia_servico is None:
        _grafo_influencia_servico = GrafoInfluenciaServico()
    return _grafo_influencia_servico
```

#### 2. `backend/app/api/rotas/grafo_influencia.py`

```python
"""
Rotas de API para Grafo de Influência Social
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.servicos.grafo_influencia_servico import obter_grafo_influencia_servico


router = APIRouter(prefix="/grafo-influencia", tags=["Grafo de Influência"])


class ConstruirGrafoRequest(BaseModel):
    """Request para construir grafo"""
    reconstruir: bool = Field(False, description="Reconstruir mesmo se já existir")


class SimularCascataRequest(BaseModel):
    """Request para simular cascata"""
    eleitor_origem: str
    nova_opiniao: str = "Candidato X"
    probabilidade_base: float = Field(0.3, ge=0.1, le=0.9)
    max_saltos: int = Field(3, ge=1, le=5)


@router.post("/construir")
async def construir_grafo(request: ConstruirGrafoRequest) -> Dict[str, Any]:
    """
    Constrói o grafo de influência social baseado nos eleitores.
    """
    servico = obter_grafo_influencia_servico()
    return servico.construir_grafo(reconstruir=request.reconstruir)


@router.get("/estatisticas")
async def obter_estatisticas() -> Dict[str, Any]:
    """
    Retorna estatísticas gerais do grafo.
    """
    servico = obter_grafo_influencia_servico()
    return servico.obter_estatisticas_grafo()


@router.get("/influenciadores")
async def obter_influenciadores(
    limite: int = 20,
    regiao: Optional[str] = None
) -> Dict[str, Any]:
    """
    Retorna os maiores influenciadores do grafo.
    """
    servico = obter_grafo_influencia_servico()
    influenciadores = servico.obter_influenciadores(limite=limite, regiao=regiao)

    return {
        "influenciadores": influenciadores,
        "total": len(influenciadores)
    }


@router.post("/simular-cascata")
async def simular_cascata(request: SimularCascataRequest) -> Dict[str, Any]:
    """
    Simula cascata de influência a partir de um eleitor.
    """
    servico = obter_grafo_influencia_servico()

    resultado = servico.simular_cascata(
        eleitor_origem=request.eleitor_origem,
        nova_opiniao=request.nova_opiniao,
        probabilidade_base=request.probabilidade_base,
        max_saltos=request.max_saltos
    )

    if "erro" in resultado:
        raise HTTPException(status_code=404, detail=resultado["erro"])

    return resultado


@router.get("/vizinhanca/{eleitor_id}")
async def obter_vizinhanca(eleitor_id: str, profundidade: int = 2) -> Dict[str, Any]:
    """
    Obtém vizinhança de um eleitor.
    """
    servico = obter_grafo_influencia_servico()
    resultado = servico.obter_vizinhanca(eleitor_id, profundidade)

    if "erro" in resultado:
        raise HTTPException(status_code=404, detail=resultado["erro"])

    return resultado
```

#### 3. Registrar rota em `backend/app/main.py`

```python
from app.api.rotas.grafo_influencia import router as grafo_influencia_router
app.include_router(grafo_influencia_router, prefix="/api/v1")
```

---

### Frontend

#### 4. `frontend/src/app/(dashboard)/influencia/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Network,
  Users,
  Zap,
  Play,
  Loader2,
  RefreshCw,
  Crown,
  Share2
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import api from "@/services/api";
import { toast } from "sonner";

// Tipos
interface Influenciador {
  eleitor_id: string;
  nome: string;
  regiao: string;
  cluster: string;
  orientacao: string;
  conexoes: number;
  influencia_local: number;
  pagerank: number;
  score_influencia: number;
}

interface EstatisticasGrafo {
  total_nos: number;
  total_arestas: number;
  media_conexoes: number;
  max_conexoes: number;
  nos_isolados: number;
  distribuicao_por_regiao: Record<string, number>;
}

interface ResultadoCascata {
  eleitor_origem: { id: string; nome: string; regiao: string };
  total_convertidos: number;
  taxa_conversao: number;
  conversoes_por_salto: Array<{
    salto: number;
    novas_conversoes: number;
    total_acumulado: number;
  }>;
  conversoes_por_regiao: Record<string, number>;
}

export default function InfluenciaPage() {
  // Estados
  const [estatisticas, setEstatisticas] = useState<EstatisticasGrafo | null>(null);
  const [influenciadores, setInfluenciadores] = useState<Influenciador[]>([]);
  const [loading, setLoading] = useState(false);
  const [construindoGrafo, setConstruindoGrafo] = useState(false);

  // Estados para simulação de cascata
  const [eleitorOrigem, setEleitorOrigem] = useState("");
  const [probBase, setProbBase] = useState(0.3);
  const [maxSaltos, setMaxSaltos] = useState(3);
  const [simulandoCascata, setSimulandoCascata] = useState(false);
  const [resultadoCascata, setResultadoCascata] = useState<ResultadoCascata | null>(null);

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [statsRes, infRes] = await Promise.all([
        api.get("/api/v1/grafo-influencia/estatisticas"),
        api.get("/api/v1/grafo-influencia/influenciadores?limite=30")
      ]);

      setEstatisticas(statsRes.data);
      setInfluenciadores(infRes.data.influenciadores);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const construirGrafo = async () => {
    setConstruindoGrafo(true);
    try {
      await api.post("/api/v1/grafo-influencia/construir", { reconstruir: true });
      toast.success("Grafo construído com sucesso!");
      carregarDados();
    } catch (error) {
      toast.error("Erro ao construir grafo");
    } finally {
      setConstruindoGrafo(false);
    }
  };

  const simularCascata = async () => {
    if (!eleitorOrigem) {
      toast.error("Selecione um eleitor de origem");
      return;
    }

    setSimulandoCascata(true);
    setResultadoCascata(null);

    try {
      const response = await api.post("/api/v1/grafo-influencia/simular-cascata", {
        eleitor_origem: eleitorOrigem,
        nova_opiniao: "Nova opinião",
        probabilidade_base: probBase,
        max_saltos: maxSaltos
      });

      setResultadoCascata(response.data);
      toast.success(`Cascata simulada: ${response.data.total_convertidos} convertidos`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Erro na simulação");
    } finally {
      setSimulandoCascata(false);
    }
  };

  // Dados para gráficos
  const dadosRegioes = estatisticas?.distribuicao_por_regiao
    ? Object.entries(estatisticas.distribuicao_por_regiao).map(([nome, valor]) => ({
        nome,
        quantidade: valor
      }))
    : [];

  const dadosCascataSaltos = resultadoCascata?.conversoes_por_salto || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Network className="h-8 w-8 text-emerald-500" />
            Grafo de Influência
          </h1>
          <p className="text-muted-foreground mt-1">
            Analise redes de influência e simule propagação de opiniões
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={carregarDados} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={construirGrafo} disabled={construindoGrafo}>
            {construindoGrafo ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Network className="h-4 w-4 mr-2" />
            )}
            Reconstruir Grafo
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      {estatisticas && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nós (Eleitores)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.total_nos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conexões</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.total_arestas}</div>
              <p className="text-xs text-muted-foreground">
                ~{estatisticas.media_conexoes} por eleitor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mais Conectado</CardTitle>
              <Crown className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas.max_conexoes}</div>
              <p className="text-xs text-muted-foreground">conexões máximas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Isolados</CardTitle>
              <Users className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {estatisticas.nos_isolados}
              </div>
              <p className="text-xs text-muted-foreground">sem conexões</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="influenciadores" className="space-y-4">
        <TabsList>
          <TabsTrigger value="influenciadores">Top Influenciadores</TabsTrigger>
          <TabsTrigger value="cascata">Simular Cascata</TabsTrigger>
          <TabsTrigger value="estrutura">Estrutura do Grafo</TabsTrigger>
        </TabsList>

        {/* Tab: Influenciadores */}
        <TabsContent value="influenciadores">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Top Influenciadores
              </CardTitle>
              <CardDescription>
                Eleitores com maior capacidade de influenciar outros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Eleitor</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead>Orientação</TableHead>
                    <TableHead>Conexões</TableHead>
                    <TableHead>Influência</TableHead>
                    <TableHead>PageRank</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {influenciadores.map((inf, idx) => (
                    <TableRow key={inf.eleitor_id}>
                      <TableCell>
                        {idx < 3 ? (
                          <Crown className={`h-4 w-4 ${
                            idx === 0 ? "text-amber-500" :
                            idx === 1 ? "text-gray-400" :
                            "text-amber-700"
                          }`} />
                        ) : idx + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{inf.nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {inf.eleitor_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{inf.regiao}</Badge>
                      </TableCell>
                      <TableCell>{inf.orientacao}</TableCell>
                      <TableCell>{inf.conexoes}</TableCell>
                      <TableCell>
                        <Progress
                          value={inf.influencia_local * 20}
                          className="w-16 h-2"
                        />
                      </TableCell>
                      <TableCell>{inf.pagerank}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500">
                          {inf.score_influencia}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Cascata */}
        <TabsContent value="cascata" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Configuração */}
            <Card>
              <CardHeader>
                <CardTitle>Simular Cascata de Influência</CardTitle>
                <CardDescription>
                  Veja como uma mudança de opinião se propaga pela rede
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Eleitor de Origem (ID)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: df-0001"
                      value={eleitorOrigem}
                      onChange={(e) => setEleitorOrigem(e.target.value)}
                    />
                    {influenciadores.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => setEleitorOrigem(influenciadores[0].eleitor_id)}
                      >
                        Top 1
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Probabilidade Base: {(probBase * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[probBase]}
                    onValueChange={(v) => setProbBase(v[0])}
                    min={0.1}
                    max={0.9}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Máximo de Saltos: {maxSaltos}</Label>
                  <Slider
                    value={[maxSaltos]}
                    onValueChange={(v) => setMaxSaltos(v[0])}
                    min={1}
                    max={5}
                    step={1}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={simularCascata}
                  disabled={simulandoCascata || !eleitorOrigem}
                >
                  {simulandoCascata ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Simular Cascata
                </Button>
              </CardContent>
            </Card>

            {/* Resultados */}
            <Card>
              <CardHeader>
                <CardTitle>Resultado da Simulação</CardTitle>
              </CardHeader>
              <CardContent>
                {!resultadoCascata ? (
                  <div className="text-center text-muted-foreground py-8">
                    Configure e execute uma simulação
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-emerald-50 rounded-lg">
                        <div className="text-3xl font-bold text-emerald-600">
                          {resultadoCascata.total_convertidos}
                        </div>
                        <div className="text-sm text-emerald-700">Convertidos</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">
                          {resultadoCascata.taxa_conversao}%
                        </div>
                        <div className="text-sm text-blue-700">Taxa Conversão</div>
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Propagação por Salto</Label>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={dadosCascataSaltos}>
                          <XAxis dataKey="salto" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="total_acumulado" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <Label className="mb-2 block">Por Região</Label>
                      {Object.entries(resultadoCascata.conversoes_por_regiao)
                        .slice(0, 5)
                        .map(([regiao, qtd]) => (
                          <div key={regiao} className="flex justify-between py-1">
                            <span className="text-sm">{regiao}</span>
                            <Badge variant="outline">{qtd}</Badge>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Estrutura */}
        <TabsContent value="estrutura">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Região</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosRegioes} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nome" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

#### 5. Atualizar Sidebar

```tsx
{
  title: "Influência",
  href: "/influencia",
  icon: Network,
  description: "Grafo social"
}
```

---

## CHECKLIST DE VALIDAÇÃO - FASE 6

- [ ] `backend/app/servicos/grafo_influencia_servico.py` criado
- [ ] `backend/app/api/rotas/grafo_influencia.py` criado
- [ ] Rota registrada em `backend/app/main.py`
- [ ] `frontend/src/app/(dashboard)/influencia/page.tsx` criado
- [ ] Link adicionado na Sidebar
- [ ] Grafo sendo construído corretamente
- [ ] Influenciadores sendo identificados
- [ ] Simulação de cascata funcionando
- [ ] Gráficos e estatísticas sendo exibidos

---

## CONCLUSÃO DO PLANO

### Resumo das 6 Fases

| Fase | Módulo | Valor Principal |
|------|--------|-----------------|
| 1 | Swing Voters | Identificar eleitores pivô |
| 2 | Mensagens | Gerar mensagens otimizadas |
| 3 | Simulador A/B | Testar mensagens virtualmente |
| 4 | Cenários | Simular "E se...?" |
| 5 | Memória Evolutiva | Rastrear mudanças ao longo do tempo |
| 6 | Grafo Influência | Modelar propagação de opiniões |

### Ordem de Implementação Recomendada

1. **Fase 1** (Swing Voters) - Base para todas as outras
2. **Fase 2** (Mensagens) - Gera conteúdo para testar
3. **Fase 3** (Simulador A/B) - Testa mensagens da Fase 2
4. **Fase 4** (Cenários) - Usa toda a infraestrutura anterior
5. **Fase 5** (Memória) - Pode ser paralela
6. **Fase 6** (Grafo) - Mais complexa, fazer por último

### Navegação da Sidebar Final

```
Inteligência
├── Swing Voters     → /swing-voters
├── Mensagens        → /mensagens
├── Simulador A/B    → /simulador
├── Cenários         → /cenarios
├── Evolução         → /evolucao
└── Influência       → /influencia
```

---

## INSTRUÇÕES FINAIS PARA CLAUDE CODE

1. Execute uma fase por vez
2. Siga os checklists rigorosamente
3. Teste cada endpoint antes de prosseguir
4. Não altere código existente exceto imports/rotas
5. Em caso de erro, reverta e tente novamente
6. Commit frequente para não perder progresso
