# PLANO DE IMPLEMENTAÇÃO: PERSUASION ENGINE

## DOCUMENTO MESTRE PARA CLAUDE CODE

**Versão**: 1.0
**Data**: Janeiro 2026
**Objetivo**: Implementar 6 novos módulos que transformam o sistema de pesquisa em plataforma de inteligência estratégica

---

## PRINCÍPIOS DE IMPLEMENTAÇÃO

### REGRAS CRÍTICAS (NÃO VIOLAR)

1. **NUNCA alterar arquivos existentes** exceto para adicionar imports ou rotas
2. **SEMPRE criar novos arquivos** em diretórios específicos para cada módulo
3. **SEMPRE testar** antes de considerar concluído
4. **NUNCA remover** funcionalidades existentes
5. **Usar padrões existentes** do projeto (Zustand, shadcn/ui, FastAPI)

### ESTRUTURA DE NOVAS ABAS

```
Frontend - Novas páginas em /app/(dashboard)/
├── inteligencia/              # ABA 1: Dashboard de Inteligência
├── swing-voters/              # ABA 2: Identificação de Swing Voters
├── mensagens/                 # ABA 3: Otimização de Mensagens
├── simulador/                 # ABA 4: Simulador de Cenários
├── evolucao/                  # ABA 5: Memória Evolutiva
└── influencia/                # ABA 6: Grafo de Influência
```

### ORDEM DE EXECUÇÃO

| Fase | Módulo | Dependências | Pode rodar isolado? |
|------|--------|--------------|---------------------|
| 1 | Swing Voters | Nenhuma | SIM |
| 2 | Mensagens | Fase 1 (opcional) | SIM |
| 3 | Simulador A/B | Fase 2 | NÃO |
| 4 | Cenários | Fases 1, 2, 3 | NÃO |
| 5 | Memória Evolutiva | Nenhuma | SIM |
| 6 | Grafo Influência | Fase 5 (opcional) | SIM |

---

# FASE 1: IDENTIFICADOR DE SWING VOTERS

## Objetivo
Criar algoritmo que identifica automaticamente os 5-10% de eleitores "pivô" que podem mudar o resultado de uma eleição.

## Critérios de Identificação

Um eleitor é considerado "Swing Voter" se atender a PELO MENOS 3 dos seguintes critérios:

```python
CRITERIOS_SWING_VOTER = {
    "conflito_identitario": True,                    # Peso 3
    "interesse_politico": ["baixo", "medio"],        # Peso 2
    "tolerancia_nuance": ["alta", "media"],          # Peso 2
    "posicao_bolsonaro": ["neutro", "critico_moderado", "apoiador_moderado"],  # Peso 3
    "susceptibilidade_desinformacao": (4, 7),        # Entre 4 e 7 - Peso 2
    "orientacao_politica": ["centro", "centro-esquerda", "centro-direita"],  # Peso 2
    "estilo_decisao": ["economico", "pragmatico"],   # Peso 1
}

# Score mínimo para ser swing voter: 6 pontos
```

## Arquivos a Criar

### Backend

#### 1. `backend/app/servicos/swing_voter_servico.py`

```python
"""
Serviço de Identificação de Swing Voters

Este módulo implementa o algoritmo de identificação de eleitores pivô
que têm maior probabilidade de mudar de voto.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime

from app.servicos.eleitor_servico import obter_servico_eleitores


class SwingVoterServico:
    """Serviço para identificação e análise de swing voters"""

    # Critérios e pesos para classificação
    CRITERIOS = {
        "conflito_identitario": {
            "valores_match": [True],
            "peso": 3,
            "descricao": "Eleitor com conflito entre identidade e posição política"
        },
        "interesse_politico": {
            "valores_match": ["baixo", "medio"],
            "peso": 2,
            "descricao": "Interesse político não intenso - mais aberto a mudança"
        },
        "tolerancia_nuance": {
            "valores_match": ["alta", "media"],
            "peso": 2,
            "descricao": "Aceita nuances - não é extremista"
        },
        "posicao_bolsonaro": {
            "valores_match": ["neutro", "critico_moderado", "apoiador_moderado"],
            "peso": 3,
            "descricao": "Posição moderada sobre figura polarizadora"
        },
        "susceptibilidade_desinformacao": {
            "valores_match": range(4, 8),  # 4, 5, 6, 7
            "peso": 2,
            "descricao": "Susceptibilidade média - influenciável mas não ingênuo"
        },
        "orientacao_politica": {
            "valores_match": ["centro", "centro-esquerda", "centro-direita"],
            "peso": 2,
            "descricao": "Orientação centrista - não polarizado"
        },
        "estilo_decisao": {
            "valores_match": ["economico", "pragmatico"],
            "peso": 1,
            "descricao": "Decide por resultados, não por ideologia"
        },
    }

    SCORE_MINIMO = 6

    def __init__(self, caminho_dados: Optional[str] = None):
        if caminho_dados is None:
            base_path = Path(__file__).parent.parent.parent.parent
            self.caminho_dados = base_path / "memorias" / "swing_voters.json"
        else:
            self.caminho_dados = Path(caminho_dados)
        self._cache: Dict[str, Any] = {}

    def _calcular_score_eleitor(self, eleitor: Dict[str, Any]) -> Tuple[int, List[Dict]]:
        """
        Calcula o score de swing voter para um eleitor.

        Returns:
            Tuple[int, List[Dict]]: (score_total, lista_de_criterios_atendidos)
        """
        score = 0
        criterios_atendidos = []

        for campo, config in self.CRITERIOS.items():
            valor_eleitor = eleitor.get(campo)
            valores_match = config["valores_match"]

            # Verificar match
            match = False
            if isinstance(valores_match, range):
                match = valor_eleitor in valores_match if valor_eleitor else False
            elif isinstance(valores_match, list):
                match = valor_eleitor in valores_match
            else:
                match = valor_eleitor == valores_match

            if match:
                score += config["peso"]
                criterios_atendidos.append({
                    "criterio": campo,
                    "valor": valor_eleitor,
                    "peso": config["peso"],
                    "descricao": config["descricao"]
                })

        return score, criterios_atendidos

    def _calcular_probabilidade_conversao(
        self,
        eleitor: Dict[str, Any],
        score: int,
        criterios: List[Dict]
    ) -> float:
        """
        Calcula probabilidade de conversão (0-1) baseado em múltiplos fatores.
        """
        # Base: score normalizado (max possível = 15)
        prob_base = min(score / 15.0, 1.0)

        # Modificadores
        modificadores = 0.0

        # +0.1 se tem conflito identitário
        if eleitor.get("conflito_identitario"):
            modificadores += 0.10

        # +0.05 por cada medo econômico
        medos = eleitor.get("medos", [])
        medos_economicos = ["Perder o emprego", "Não conseguir pagar as contas",
                           "Inflação", "Economia piorar"]
        for medo in medos:
            if any(m in medo for m in medos_economicos):
                modificadores += 0.05

        # -0.1 se é apoiador forte ou opositor ferrenho
        posicao = eleitor.get("posicao_bolsonaro", "")
        if posicao in ["apoiador_forte", "opositor_ferrenho"]:
            modificadores -= 0.15

        # +0.05 se fontes de informação são diversas
        fontes = eleitor.get("fontes_informacao", [])
        if len(fontes) >= 3:
            modificadores += 0.05

        return min(max(prob_base + modificadores, 0.0), 1.0)

    def _identificar_vulnerabilidades(self, eleitor: Dict[str, Any]) -> Dict[str, Any]:
        """
        Identifica pontos de vulnerabilidade/entrada para persuasão.
        """
        vulnerabilidades = {
            "medos_exploraveis": [],
            "valores_ativaveis": [],
            "vieses_utilizaveis": [],
            "gatilhos_emocionais": [],
            "argumentos_economicos": [],
            "pontos_de_dor": []
        }

        # Medos
        medos = eleitor.get("medos", [])
        for medo in medos:
            vulnerabilidades["medos_exploraveis"].append({
                "medo": medo,
                "estrategia": f"Mensagem que mostre como candidato X resolve '{medo}'"
            })

        # Valores
        valores = eleitor.get("valores", [])
        for valor in valores:
            vulnerabilidades["valores_ativaveis"].append({
                "valor": valor,
                "estrategia": f"Associar candidato ao valor '{valor}'"
            })

        # Vieses cognitivos
        vieses = eleitor.get("vieses_cognitivos", [])
        vieses_estrategias = {
            "confirmacao": "Apresentar informações que confirmem crenças existentes",
            "disponibilidade": "Usar exemplos recentes e memoráveis",
            "aversao_perda": "Enfatizar o que pode PERDER se não votar no candidato",
            "tribalismo": "Criar senso de pertencimento ao grupo",
            "ancoragem": "Estabelecer referência favorável antes de comparações",
            "efeito_halo": "Associar a figuras positivas/respeitadas"
        }
        for vies in vieses:
            if vies in vieses_estrategias:
                vulnerabilidades["vieses_utilizaveis"].append({
                    "vies": vies,
                    "estrategia": vieses_estrategias[vies]
                })

        # Gatilhos emocionais baseados em preocupações
        preocupacoes = eleitor.get("preocupacoes", [])
        for preoc in preocupacoes:
            vulnerabilidades["gatilhos_emocionais"].append({
                "preocupacao": preoc,
                "emocao_alvo": "indignação" if "Corrupção" in preoc else "medo" if "Violência" in preoc else "frustração"
            })

        # Argumentos econômicos se estilo_decisao é economico
        if eleitor.get("estilo_decisao") == "economico":
            renda = eleitor.get("renda_salarios_minimos", "")
            if renda in ["ate_1", "mais_de_1_ate_2"]:
                vulnerabilidades["argumentos_economicos"] = [
                    "Aumento do salário mínimo",
                    "Redução de impostos sobre consumo",
                    "Programas de transferência de renda",
                    "Controle de preços de alimentos"
                ]
            elif renda in ["mais_de_2_ate_5"]:
                vulnerabilidades["argumentos_economicos"] = [
                    "Redução de impostos",
                    "Incentivo a pequenos negócios",
                    "Crédito facilitado",
                    "Estabilidade econômica"
                ]
            else:
                vulnerabilidades["argumentos_economicos"] = [
                    "Reforma tributária",
                    "Ambiente de negócios",
                    "Segurança jurídica",
                    "Controle da inflação"
                ]

        return vulnerabilidades

    def identificar_swing_voters(
        self,
        eleitor_ids: Optional[List[str]] = None,
        filtros: Optional[Dict[str, Any]] = None,
        limite: int = 50
    ) -> Dict[str, Any]:
        """
        Identifica swing voters na base de eleitores.

        Args:
            eleitor_ids: Lista específica de IDs (opcional)
            filtros: Filtros adicionais (regiao, cluster, etc)
            limite: Número máximo de resultados

        Returns:
            Dict com swing voters identificados e estatísticas
        """
        eleitor_servico = obter_servico_eleitores()

        # Obter eleitores
        if eleitor_ids:
            eleitores = eleitor_servico.obter_por_ids(eleitor_ids)
        else:
            resultado = eleitor_servico.listar(pagina=1, por_pagina=500)
            eleitores = resultado.get("eleitores", [])

        # Aplicar filtros adicionais
        if filtros:
            for campo, valor in filtros.items():
                if isinstance(valor, list):
                    eleitores = [e for e in eleitores if e.get(campo) in valor]
                else:
                    eleitores = [e for e in eleitores if e.get(campo) == valor]

        swing_voters = []
        estatisticas = {
            "total_analisados": len(eleitores),
            "total_swing_voters": 0,
            "distribuicao_score": {},
            "criterios_mais_frequentes": {},
            "regioes_concentradas": {},
            "clusters_concentrados": {}
        }

        for eleitor in eleitores:
            score, criterios = self._calcular_score_eleitor(eleitor)

            # Atualizar distribuição de score
            score_str = str(score)
            estatisticas["distribuicao_score"][score_str] = \
                estatisticas["distribuicao_score"].get(score_str, 0) + 1

            if score >= self.SCORE_MINIMO:
                prob_conversao = self._calcular_probabilidade_conversao(
                    eleitor, score, criterios
                )
                vulnerabilidades = self._identificar_vulnerabilidades(eleitor)

                swing_voter = {
                    "eleitor_id": eleitor.get("id"),
                    "nome": eleitor.get("nome"),
                    "idade": eleitor.get("idade"),
                    "genero": eleitor.get("genero"),
                    "regiao_administrativa": eleitor.get("regiao_administrativa"),
                    "cluster_socioeconomico": eleitor.get("cluster_socioeconomico"),
                    "orientacao_politica": eleitor.get("orientacao_politica"),
                    "posicao_bolsonaro": eleitor.get("posicao_bolsonaro"),
                    "score_swing": score,
                    "score_maximo_possivel": 15,
                    "probabilidade_conversao": round(prob_conversao, 2),
                    "criterios_atendidos": criterios,
                    "vulnerabilidades": vulnerabilidades,
                    "perfil_resumido": f"{eleitor.get('profissao', '')} de {eleitor.get('regiao_administrativa', '')}, {eleitor.get('idade')} anos",
                    "instrucao_comportamental": eleitor.get("instrucao_comportamental", ""),
                    "medos": eleitor.get("medos", []),
                    "valores": eleitor.get("valores", []),
                    "preocupacoes": eleitor.get("preocupacoes", [])
                }

                swing_voters.append(swing_voter)

                # Atualizar estatísticas
                for crit in criterios:
                    nome_crit = crit["criterio"]
                    estatisticas["criterios_mais_frequentes"][nome_crit] = \
                        estatisticas["criterios_mais_frequentes"].get(nome_crit, 0) + 1

                regiao = eleitor.get("regiao_administrativa", "Outros")
                estatisticas["regioes_concentradas"][regiao] = \
                    estatisticas["regioes_concentradas"].get(regiao, 0) + 1

                cluster = eleitor.get("cluster_socioeconomico", "Outros")
                estatisticas["clusters_concentrados"][cluster] = \
                    estatisticas["clusters_concentrados"].get(cluster, 0) + 1

        # Ordenar por probabilidade de conversão
        swing_voters.sort(key=lambda x: x["probabilidade_conversao"], reverse=True)
        swing_voters = swing_voters[:limite]

        estatisticas["total_swing_voters"] = len(swing_voters)
        estatisticas["percentual_base"] = round(
            len(swing_voters) / len(eleitores) * 100, 1
        ) if eleitores else 0

        # Ordenar estatísticas
        estatisticas["regioes_concentradas"] = dict(
            sorted(estatisticas["regioes_concentradas"].items(),
                   key=lambda x: x[1], reverse=True)[:10]
        )
        estatisticas["clusters_concentrados"] = dict(
            sorted(estatisticas["clusters_concentrados"].items(),
                   key=lambda x: x[1], reverse=True)
        )
        estatisticas["criterios_mais_frequentes"] = dict(
            sorted(estatisticas["criterios_mais_frequentes"].items(),
                   key=lambda x: x[1], reverse=True)
        )

        return {
            "swing_voters": swing_voters,
            "estatisticas": estatisticas,
            "criterios_utilizados": self.CRITERIOS,
            "score_minimo": self.SCORE_MINIMO,
            "gerado_em": datetime.now().isoformat()
        }

    def obter_perfil_detalhado(self, eleitor_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtém perfil detalhado de um swing voter específico.
        """
        eleitor_servico = obter_servico_eleitores()
        eleitor = eleitor_servico.obter_por_id(eleitor_id)

        if not eleitor:
            return None

        score, criterios = self._calcular_score_eleitor(eleitor)
        prob_conversao = self._calcular_probabilidade_conversao(eleitor, score, criterios)
        vulnerabilidades = self._identificar_vulnerabilidades(eleitor)

        return {
            "eleitor": eleitor,
            "analise_swing": {
                "score": score,
                "score_minimo": self.SCORE_MINIMO,
                "eh_swing_voter": score >= self.SCORE_MINIMO,
                "probabilidade_conversao": round(prob_conversao, 2),
                "criterios_atendidos": criterios,
                "criterios_nao_atendidos": [
                    {"criterio": k, "descricao": v["descricao"]}
                    for k, v in self.CRITERIOS.items()
                    if k not in [c["criterio"] for c in criterios]
                ]
            },
            "vulnerabilidades": vulnerabilidades,
            "recomendacoes_abordagem": self._gerar_recomendacoes(eleitor, vulnerabilidades)
        }

    def _gerar_recomendacoes(
        self,
        eleitor: Dict[str, Any],
        vulnerabilidades: Dict[str, Any]
    ) -> List[str]:
        """
        Gera recomendações de abordagem para o eleitor.
        """
        recomendacoes = []

        # Baseado em estilo de decisão
        estilo = eleitor.get("estilo_decisao", "")
        if estilo == "economico":
            recomendacoes.append(
                "Foque em argumentos econômicos: impacto no bolso, emprego, preços."
            )
        elif estilo == "emocional":
            recomendacoes.append(
                "Use storytelling emocional: histórias de pessoas reais, conexão pessoal."
            )
        elif estilo == "tribal":
            recomendacoes.append(
                "Enfatize pertencimento: 'pessoas como você', comunidade, grupo."
            )
        elif estilo == "ideologico":
            recomendacoes.append(
                "Conecte a valores e princípios: coerência ideológica, bandeiras."
            )

        # Baseado em religião
        religiao = eleitor.get("religiao", "")
        if religiao == "evangelica":
            recomendacoes.append(
                "Considere valores de família, moral e fé. Evite temas progressistas polêmicos."
            )
        elif religiao == "catolica":
            recomendacoes.append(
                "Pode abordar temas sociais com nuance. Valores de comunidade e solidariedade."
            )

        # Baseado em vieses
        vieses = eleitor.get("vieses_cognitivos", [])
        if "aversao_perda" in vieses:
            recomendacoes.append(
                "Enfatize o que pode PERDER, não o que pode ganhar. Frame negativo funciona melhor."
            )
        if "tribalismo" in vieses:
            recomendacoes.append(
                "Crie senso de 'nós vs eles'. Identifique inimigo comum."
            )

        # Baseado em fontes de informação
        fontes = eleitor.get("fontes_informacao", [])
        if any("WhatsApp" in f for f in fontes):
            recomendacoes.append(
                "Mensagens curtas, compartilháveis. Formato de corrente/forward funciona."
            )
        if any("TikTok" in f or "Instagram" in f for f in fontes):
            recomendacoes.append(
                "Conteúdo visual, vídeos curtos, memes. Linguagem jovem e informal."
            )
        if any("Jornal Nacional" in f or "Folha" in f for f in fontes):
            recomendacoes.append(
                "Argumentos estruturados, dados, tom mais formal. Credibilidade importa."
            )

        return recomendacoes


# Instância singleton
_swing_voter_servico: Optional[SwingVoterServico] = None


def obter_swing_voter_servico() -> SwingVoterServico:
    """Obtém instância singleton do serviço"""
    global _swing_voter_servico
    if _swing_voter_servico is None:
        _swing_voter_servico = SwingVoterServico()
    return _swing_voter_servico
```

#### 2. `backend/app/api/rotas/swing_voters.py`

```python
"""
Rotas de API para Swing Voters

Endpoints para identificação e análise de eleitores pivô.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.servicos.swing_voter_servico import obter_swing_voter_servico


router = APIRouter(prefix="/swing-voters", tags=["Swing Voters"])


class FiltrosSwingVoter(BaseModel):
    """Filtros para busca de swing voters"""
    regiao_administrativa: Optional[List[str]] = None
    cluster_socioeconomico: Optional[List[str]] = None
    orientacao_politica: Optional[List[str]] = None
    idade_min: Optional[int] = None
    idade_max: Optional[int] = None
    genero: Optional[str] = None


class IdentificarRequest(BaseModel):
    """Request para identificação de swing voters"""
    eleitor_ids: Optional[List[str]] = Field(
        None,
        description="IDs específicos para analisar (opcional)"
    )
    filtros: Optional[FiltrosSwingVoter] = Field(
        None,
        description="Filtros para restringir busca"
    )
    limite: int = Field(
        50,
        ge=1,
        le=200,
        description="Número máximo de resultados"
    )


@router.post("/identificar")
async def identificar_swing_voters(request: IdentificarRequest) -> Dict[str, Any]:
    """
    Identifica swing voters na base de eleitores.

    Retorna lista de eleitores pivô ordenados por probabilidade de conversão,
    incluindo análise de vulnerabilidades e estatísticas agregadas.
    """
    servico = obter_swing_voter_servico()

    # Converter filtros para dict
    filtros_dict = None
    if request.filtros:
        filtros_dict = {
            k: v for k, v in request.filtros.model_dump().items()
            if v is not None
        }

    resultado = servico.identificar_swing_voters(
        eleitor_ids=request.eleitor_ids,
        filtros=filtros_dict,
        limite=request.limite
    )

    return resultado


@router.get("/perfil/{eleitor_id}")
async def obter_perfil_swing_voter(eleitor_id: str) -> Dict[str, Any]:
    """
    Obtém perfil detalhado de análise de swing voter para um eleitor.

    Inclui score, critérios atendidos, vulnerabilidades e recomendações.
    """
    servico = obter_swing_voter_servico()

    resultado = servico.obter_perfil_detalhado(eleitor_id)

    if not resultado:
        raise HTTPException(
            status_code=404,
            detail=f"Eleitor {eleitor_id} não encontrado"
        )

    return resultado


@router.get("/criterios")
async def listar_criterios() -> Dict[str, Any]:
    """
    Lista os critérios utilizados para classificação de swing voters.
    """
    servico = obter_swing_voter_servico()

    return {
        "criterios": servico.CRITERIOS,
        "score_minimo": servico.SCORE_MINIMO,
        "score_maximo": 15,
        "descricao": "Eleitores com score >= score_minimo são considerados swing voters"
    }


@router.get("/estatisticas")
async def obter_estatisticas_gerais() -> Dict[str, Any]:
    """
    Obtém estatísticas gerais de swing voters na base completa.
    """
    servico = obter_swing_voter_servico()

    resultado = servico.identificar_swing_voters(limite=500)

    return {
        "estatisticas": resultado["estatisticas"],
        "gerado_em": resultado["gerado_em"]
    }
```

#### 3. Registrar rota em `backend/app/main.py`

**ADICIONAR** (não substituir) no arquivo existente:

```python
# No início, após outros imports de rotas:
from app.api.rotas.swing_voters import router as swing_voters_router

# Na seção de inclusão de routers:
app.include_router(swing_voters_router, prefix="/api/v1")
```

### Frontend

#### 4. `frontend/src/app/(dashboard)/swing-voters/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Target,
  Users,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Brain,
  Shield,
  Zap
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import api from "@/services/api";

// Tipos
interface SwingVoter {
  eleitor_id: string;
  nome: string;
  idade: number;
  genero: string;
  regiao_administrativa: string;
  cluster_socioeconomico: string;
  orientacao_politica: string;
  posicao_bolsonaro: string;
  score_swing: number;
  score_maximo_possivel: number;
  probabilidade_conversao: number;
  criterios_atendidos: Array<{
    criterio: string;
    valor: any;
    peso: number;
    descricao: string;
  }>;
  vulnerabilidades: {
    medos_exploraveis: Array<{ medo: string; estrategia: string }>;
    valores_ativaveis: Array<{ valor: string; estrategia: string }>;
    vieses_utilizaveis: Array<{ vies: string; estrategia: string }>;
    gatilhos_emocionais: Array<{ preocupacao: string; emocao_alvo: string }>;
    argumentos_economicos: string[];
    pontos_de_dor: string[];
  };
  perfil_resumido: string;
  medos: string[];
  valores: string[];
  preocupacoes: string[];
}

interface Estatisticas {
  total_analisados: number;
  total_swing_voters: number;
  percentual_base: number;
  distribuicao_score: Record<string, number>;
  criterios_mais_frequentes: Record<string, number>;
  regioes_concentradas: Record<string, number>;
  clusters_concentrados: Record<string, number>;
}

interface ResultadoIdentificacao {
  swing_voters: SwingVoter[];
  estatisticas: Estatisticas;
  criterios_utilizados: Record<string, any>;
  score_minimo: number;
  gerado_em: string;
}

// Cores para gráficos
const CORES = [
  "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#6366f1", "#84cc16"
];

export default function SwingVotersPage() {
  const [resultado, setResultado] = useState<ResultadoIdentificacao | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<SwingVoter | null>(null);
  const [filtroRegiao, setFiltroRegiao] = useState<string>("todas");
  const [filtroCluster, setFiltroCluster] = useState<string>("todos");

  // Carregar dados iniciais
  useEffect(() => {
    carregarSwingVoters();
  }, []);

  const carregarSwingVoters = async () => {
    setLoading(true);
    try {
      const response = await api.post("/api/v1/swing-voters/identificar", {
        limite: 100,
        filtros: filtroRegiao !== "todas" || filtroCluster !== "todos" ? {
          regiao_administrativa: filtroRegiao !== "todas" ? [filtroRegiao] : undefined,
          cluster_socioeconomico: filtroCluster !== "todos" ? [filtroCluster] : undefined,
        } : undefined
      });
      setResultado(response.data);
    } catch (error) {
      console.error("Erro ao carregar swing voters:", error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    if (resultado) {
      carregarSwingVoters();
    }
  }, [filtroRegiao, filtroCluster]);

  // Preparar dados para gráficos
  const dadosRegioes = resultado?.estatisticas.regioes_concentradas
    ? Object.entries(resultado.estatisticas.regioes_concentradas).map(([nome, valor]) => ({
        nome,
        quantidade: valor
      }))
    : [];

  const dadosClusters = resultado?.estatisticas.clusters_concentrados
    ? Object.entries(resultado.estatisticas.clusters_concentrados).map(([nome, valor]) => ({
        name: nome.replace("G", "Grupo ").replace("_", " "),
        value: valor
      }))
    : [];

  const dadosCriterios = resultado?.estatisticas.criterios_mais_frequentes
    ? Object.entries(resultado.estatisticas.criterios_mais_frequentes).map(([nome, valor]) => ({
        nome: nome.replace(/_/g, " "),
        quantidade: valor
      }))
    : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-8 w-8 text-violet-500" />
            Swing Voters
          </h1>
          <p className="text-muted-foreground mt-1">
            Identificação automática de eleitores pivô com maior probabilidade de conversão
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={carregarSwingVoters}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analisados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resultado?.estatisticas.total_analisados || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              eleitores na base
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Swing Voters</CardTitle>
            <Target className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">
              {resultado?.estatisticas.total_swing_voters || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {resultado?.estatisticas.percentual_base || 0}% da base
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prob. Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {resultado?.swing_voters.length
                ? Math.round(
                    resultado.swing_voters.reduce((a, b) => a + b.probabilidade_conversao, 0) /
                    resultado.swing_voters.length * 100
                  )
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              de conversão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Mínimo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resultado?.score_minimo || 6}/15
            </div>
            <p className="text-xs text-muted-foreground">
              para classificação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-64">
              <label className="text-sm font-medium mb-2 block">Região</label>
              <Select value={filtroRegiao} onValueChange={setFiltroRegiao}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as regiões" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as regiões</SelectItem>
                  {dadosRegioes.map(r => (
                    <SelectItem key={r.nome} value={r.nome}>
                      {r.nome} ({r.quantidade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-64">
              <label className="text-sm font-medium mb-2 block">Cluster</label>
              <Select value={filtroCluster} onValueChange={setFiltroCluster}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os clusters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os clusters</SelectItem>
                  <SelectItem value="G1_alta">G1 - Alta</SelectItem>
                  <SelectItem value="G2_media_alta">G2 - Média Alta</SelectItem>
                  <SelectItem value="G3_media_baixa">G3 - Média Baixa</SelectItem>
                  <SelectItem value="G4_baixa">G4 - Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Conteúdo */}
      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista">Lista de Swing Voters</TabsTrigger>
          <TabsTrigger value="analise">Análise Agregada</TabsTrigger>
          <TabsTrigger value="criterios">Critérios</TabsTrigger>
        </TabsList>

        {/* Tab: Lista */}
        <TabsContent value="lista" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eleitores Pivô Identificados</CardTitle>
              <CardDescription>
                Ordenados por probabilidade de conversão (maior para menor)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Eleitor</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead>Orientação</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Prob. Conversão</TableHead>
                    <TableHead>Vulnerabilidades</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado?.swing_voters.map((voter) => (
                    <TableRow key={voter.eleitor_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{voter.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {voter.perfil_resumido}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{voter.regiao_administrativa}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            voter.orientacao_politica.includes("esquerda")
                              ? "destructive"
                              : voter.orientacao_politica.includes("direita")
                                ? "default"
                                : "secondary"
                          }
                        >
                          {voter.orientacao_politica}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(voter.score_swing / voter.score_maximo_possivel) * 100}
                            className="w-16 h-2"
                          />
                          <span className="text-sm font-medium">
                            {voter.score_swing}/{voter.score_maximo_possivel}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              voter.probabilidade_conversao >= 0.7
                                ? "bg-green-500"
                                : voter.probabilidade_conversao >= 0.5
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                          />
                          <span className="font-medium">
                            {Math.round(voter.probabilidade_conversao * 100)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {voter.vulnerabilidades.medos_exploraveis.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              {voter.vulnerabilidades.medos_exploraveis.length}
                            </Badge>
                          )}
                          {voter.vulnerabilidades.vieses_utilizaveis.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Brain className="h-3 w-3 mr-1" />
                              {voter.vulnerabilidades.vieses_utilizaveis.length}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedVoter(voter)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Análise de Swing Voter</DialogTitle>
                              <DialogDescription>
                                {voter.nome} - {voter.perfil_resumido}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                              {/* Score e Probabilidade */}
                              <div className="grid grid-cols-2 gap-4">
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Score Swing</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-3xl font-bold text-violet-600">
                                      {voter.score_swing}/{voter.score_maximo_possivel}
                                    </div>
                                    <Progress
                                      value={(voter.score_swing / voter.score_maximo_possivel) * 100}
                                      className="mt-2"
                                    />
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Prob. Conversão</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-3xl font-bold text-green-600">
                                      {Math.round(voter.probabilidade_conversao * 100)}%
                                    </div>
                                    <Progress
                                      value={voter.probabilidade_conversao * 100}
                                      className="mt-2"
                                    />
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Critérios Atendidos */}
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Zap className="h-4 w-4 text-amber-500" />
                                  Critérios Atendidos
                                </h4>
                                <div className="space-y-2">
                                  {voter.criterios_atendidos.map((crit, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between p-2 bg-muted rounded"
                                    >
                                      <div>
                                        <span className="font-medium">
                                          {crit.criterio.replace(/_/g, " ")}
                                        </span>
                                        <span className="text-muted-foreground ml-2">
                                          = {String(crit.valor)}
                                        </span>
                                      </div>
                                      <Badge>+{crit.peso} pts</Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Vulnerabilidades */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-red-500" />
                                    Medos Exploráveis
                                  </h4>
                                  <div className="space-y-1">
                                    {voter.vulnerabilidades.medos_exploraveis.map((m, idx) => (
                                      <div key={idx} className="text-sm p-2 bg-red-50 rounded">
                                        <div className="font-medium text-red-700">{m.medo}</div>
                                        <div className="text-red-600 text-xs">{m.estrategia}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-purple-500" />
                                    Vieses Utilizáveis
                                  </h4>
                                  <div className="space-y-1">
                                    {voter.vulnerabilidades.vieses_utilizaveis.map((v, idx) => (
                                      <div key={idx} className="text-sm p-2 bg-purple-50 rounded">
                                        <div className="font-medium text-purple-700">{v.vies}</div>
                                        <div className="text-purple-600 text-xs">{v.estrategia}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Valores e Preocupações */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Valores</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {voter.valores.map((v, idx) => (
                                      <Badge key={idx} variant="outline">{v}</Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Preocupações</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {voter.preocupacoes.map((p, idx) => (
                                      <Badge key={idx} variant="secondary">{p}</Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Argumentos Econômicos */}
                              {voter.vulnerabilidades.argumentos_economicos.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Argumentos Econômicos Recomendados</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {voter.vulnerabilidades.argumentos_economicos.map((arg, idx) => (
                                      <Badge key={idx} className="bg-green-100 text-green-800">
                                        {arg}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Análise */}
        <TabsContent value="analise" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Gráfico de Regiões */}
            <Card>
              <CardHeader>
                <CardTitle>Concentração por Região</CardTitle>
                <CardDescription>Onde estão os swing voters</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosRegioes} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="nome" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Clusters */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Cluster</CardTitle>
                <CardDescription>Perfil socioeconômico</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosClusters}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosClusters.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Critérios */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Critérios Mais Frequentes</CardTitle>
                <CardDescription>
                  Quais características são mais comuns entre swing voters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dadosCriterios}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Critérios */}
        <TabsContent value="criterios">
          <Card>
            <CardHeader>
              <CardTitle>Critérios de Classificação</CardTitle>
              <CardDescription>
                Como identificamos swing voters - score mínimo: {resultado?.score_minimo || 6} pontos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Critério</TableHead>
                    <TableHead>Valores que Qualificam</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado?.criterios_utilizados &&
                    Object.entries(resultado.criterios_utilizados).map(([nome, config]: [string, any]) => (
                      <TableRow key={nome}>
                        <TableCell className="font-medium">
                          {nome.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(config.valores_match)
                              ? config.valores_match.map((v: any, i: number) => (
                                  <Badge key={i} variant="outline">{String(v)}</Badge>
                                ))
                              : <Badge variant="outline">{String(config.valores_match)}</Badge>
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-violet-100 text-violet-800">
                            +{config.peso} pts
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {config.descricao}
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

#### 5. Atualizar Sidebar - Adicionar link

**Arquivo**: `frontend/src/components/layout/Sidebar.tsx`

**ADICIONAR** no array de navegação (não substituir):

```tsx
// Adicionar no array de items de navegação, após os existentes:
{
  title: "Inteligência",
  items: [
    {
      title: "Swing Voters",
      href: "/swing-voters",
      icon: Target,
      description: "Eleitores pivô"
    },
    // Futuras abas serão adicionadas aqui
  ]
}
```

### Testes

#### 6. `backend/tests/test_swing_voters.py`

```python
"""
Testes para o serviço de Swing Voters
"""

import pytest
from app.servicos.swing_voter_servico import SwingVoterServico, obter_swing_voter_servico


class TestSwingVoterServico:
    """Testes do serviço de swing voters"""

    def test_instancia_singleton(self):
        """Verifica que o serviço é singleton"""
        servico1 = obter_swing_voter_servico()
        servico2 = obter_swing_voter_servico()
        assert servico1 is servico2

    def test_calcular_score_eleitor_vazio(self):
        """Testa cálculo de score para eleitor sem critérios"""
        servico = SwingVoterServico()
        eleitor = {"id": "test", "nome": "Teste"}
        score, criterios = servico._calcular_score_eleitor(eleitor)
        assert score == 0
        assert len(criterios) == 0

    def test_calcular_score_eleitor_completo(self):
        """Testa cálculo de score para eleitor com todos critérios"""
        servico = SwingVoterServico()
        eleitor = {
            "id": "test",
            "nome": "Teste",
            "conflito_identitario": True,
            "interesse_politico": "baixo",
            "tolerancia_nuance": "alta",
            "posicao_bolsonaro": "neutro",
            "susceptibilidade_desinformacao": 5,
            "orientacao_politica": "centro",
            "estilo_decisao": "economico"
        }
        score, criterios = servico._calcular_score_eleitor(eleitor)
        assert score == 15  # Score máximo
        assert len(criterios) == 7

    def test_calcular_probabilidade_conversao(self):
        """Testa cálculo de probabilidade"""
        servico = SwingVoterServico()
        eleitor = {
            "conflito_identitario": True,
            "medos": ["Perder o emprego", "Inflação"],
            "posicao_bolsonaro": "neutro",
            "fontes_informacao": ["TV", "WhatsApp", "Instagram"]
        }
        prob = servico._calcular_probabilidade_conversao(eleitor, 10, [])
        assert 0 <= prob <= 1

    def test_identificar_vulnerabilidades(self):
        """Testa identificação de vulnerabilidades"""
        servico = SwingVoterServico()
        eleitor = {
            "medos": ["Perder o emprego"],
            "valores": ["Família"],
            "vieses_cognitivos": ["confirmacao", "aversao_perda"],
            "preocupacoes": ["Corrupção"],
            "estilo_decisao": "economico",
            "renda_salarios_minimos": "mais_de_1_ate_2"
        }
        vuln = servico._identificar_vulnerabilidades(eleitor)
        assert len(vuln["medos_exploraveis"]) == 1
        assert len(vuln["valores_ativaveis"]) == 1
        assert len(vuln["vieses_utilizaveis"]) == 2
        assert len(vuln["argumentos_economicos"]) > 0

    def test_identificar_swing_voters(self):
        """Testa identificação completa"""
        servico = obter_swing_voter_servico()
        resultado = servico.identificar_swing_voters(limite=10)

        assert "swing_voters" in resultado
        assert "estatisticas" in resultado
        assert "criterios_utilizados" in resultado
        assert resultado["estatisticas"]["total_analisados"] > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

---

## CHECKLIST DE VALIDAÇÃO - FASE 1

Antes de prosseguir para Fase 2, verificar:

- [ ] `backend/app/servicos/swing_voter_servico.py` criado
- [ ] `backend/app/api/rotas/swing_voters.py` criado
- [ ] Rota registrada em `backend/app/main.py`
- [ ] `frontend/src/app/(dashboard)/swing-voters/page.tsx` criado
- [ ] Link adicionado na Sidebar
- [ ] Testes passando: `pytest backend/tests/test_swing_voters.py -v`
- [ ] Servidor backend rodando sem erros
- [ ] Servidor frontend rodando sem erros
- [ ] Página `/swing-voters` acessível e funcional
- [ ] API `POST /api/v1/swing-voters/identificar` retornando dados

---

# FASE 2: GERADOR DE MENSAGENS OTIMIZADAS

*Continua no arquivo PLANO_FASE_2.md*

---

## NAVEGAÇÃO DO PLANO

| Fase | Arquivo | Status |
|------|---------|--------|
| 1 | PLANO_PERSUASION_ENGINE.md (este arquivo) | PRONTO |
| 2 | PLANO_FASE_2_MENSAGENS.md | A CRIAR |
| 3 | PLANO_FASE_3_SIMULADOR_AB.md | A CRIAR |
| 4 | PLANO_FASE_4_CENARIOS.md | A CRIAR |
| 5 | PLANO_FASE_5_MEMORIA_EVOLUTIVA.md | A CRIAR |
| 6 | PLANO_FASE_6_GRAFO_INFLUENCIA.md | A CRIAR |

---

## INSTRUÇÕES PARA CLAUDE CODE

### Como Executar Este Plano

1. **Leia este arquivo completamente** antes de começar
2. **Crie os arquivos na ordem listada** (backend primeiro, depois frontend)
3. **Não modifique arquivos existentes** exceto onde explicitamente indicado
4. **Teste cada etapa** antes de prosseguir
5. **Marque os itens do checklist** conforme concluir
6. **Só passe para próxima fase** quando checklist estiver 100%

### Comandos de Teste

```bash
# Backend
cd backend
pytest tests/test_swing_voters.py -v

# Frontend
cd frontend
npm run build
npm run dev
```

### Se Algo Der Errado

1. **Não entre em pânico** - o código existente está intacto
2. **Verifique imports** - erros comuns são imports faltando
3. **Verifique tipos** - TypeScript é estrito
4. **Leia o erro** - mensagens de erro são informativas
5. **Reverta se necessário** - use git para voltar ao estado anterior

```bash
# Ver mudanças
git status
git diff

# Reverter arquivo específico
git checkout -- caminho/do/arquivo

# Reverter tudo
git checkout -- .
```
