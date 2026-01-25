# FASE 5: MEMÓRIA EVOLUTIVA

## Documento de Implementação Detalhado

**Dependências**: Nenhuma (pode ser implementada independentemente)
**Estimativa**: 3-4 dias de desenvolvimento
**Risco**: Baixo

---

## OBJETIVO

Implementar um sistema de memória longitudinal que registra como cada eleitor respondeu ao longo do tempo, permitindo detectar tendências de mudança de opinião e evolução de posicionamento político.

---

## CONCEITO

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEMÓRIA EVOLUTIVA                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PROBLEMA: Eleitores são tratados como estáticos               │
│  SOLUÇÃO: Registrar histórico de respostas por eleitor          │
│                                                                 │
│  PARA CADA ELEITOR, ARMAZENAR:                                  │
│  ├─ Histórico de todas as respostas em entrevistas              │
│  ├─ Evolução de sentimentos ao longo do tempo                  │
│  ├─ Mudanças de intenção de voto                               │
│  └─ Eventos correlacionados com mudanças                       │
│                                                                 │
│  ANÁLISES GERADAS:                                              │
│  ├─ Tendência: "amaciando", "endurecendo", "estável"           │
│  ├─ Volatilidade: quão frequentemente muda de opinião          │
│  ├─ Gatilhos: o que causa mudanças neste eleitor               │
│  └─ Previsão: probabilidade de mudança futura                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## MODELO DE DADOS

### Estrutura de Memória por Eleitor

```json
{
  "eleitor_id": "df-0001",
  "historico": [
    {
      "data": "2026-01-15T10:30:00",
      "entrevista_id": "ent-001",
      "pergunta": "Em quem você votaria para governador?",
      "resposta_resumida": "Votaria no candidato X",
      "sentimento": "esperanca",
      "intensidade": 7,
      "intencao_voto": "Candidato X",
      "confianca": 0.8,
      "contexto": "Após debate televisivo"
    },
    {
      "data": "2026-02-20T14:00:00",
      "entrevista_id": "ent-005",
      "pergunta": "Em quem você votaria para governador?",
      "resposta_resumida": "Estou indeciso agora",
      "sentimento": "indiferenca",
      "intensidade": 4,
      "intencao_voto": "Indeciso",
      "confianca": 0.5,
      "contexto": "Após escândalo de corrupção"
    }
  ],
  "analise_evolutiva": {
    "tendencia": "amaciando",
    "volatilidade": 0.6,
    "ultima_mudanca": "2026-02-20",
    "probabilidade_mudanca_proxima": 0.7,
    "gatilhos_identificados": ["escândalos", "economia"],
    "perfil_evolutivo": "Eleitor inicialmente decidido que perdeu confiança após escândalo"
  }
}
```

---

## ARQUIVOS A CRIAR

### Backend

#### 1. `backend/app/servicos/memoria_evolutiva_servico.py`

```python
"""
Serviço de Memória Evolutiva

Gerencia histórico longitudinal de respostas dos eleitores
e analisa tendências de evolução de opinião.
"""

import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional
from collections import Counter

from app.servicos.eleitor_servico import obter_servico_eleitores


class MemoriaEvolutivaServico:
    """Serviço para gerenciamento de memória evolutiva dos eleitores"""

    def __init__(self):
        base_path = Path(__file__).parent.parent.parent.parent
        self.caminho_memorias = base_path / "memorias" / "memoria_evolutiva.json"
        self._memorias: Dict[str, Dict] = {}
        self._carregar_memorias()

    def _carregar_memorias(self):
        """Carrega memórias do arquivo"""
        if self.caminho_memorias.exists():
            with open(self.caminho_memorias, "r", encoding="utf-8") as f:
                self._memorias = json.load(f)

    def _salvar_memorias(self):
        """Salva memórias no arquivo"""
        self.caminho_memorias.parent.mkdir(parents=True, exist_ok=True)
        with open(self.caminho_memorias, "w", encoding="utf-8") as f:
            json.dump(self._memorias, f, ensure_ascii=False, indent=2, default=str)

    def registrar_resposta(
        self,
        eleitor_id: str,
        entrevista_id: str,
        pergunta: str,
        resposta_resumida: str,
        sentimento: str,
        intensidade: int,
        intencao_voto: Optional[str] = None,
        confianca: float = 0.5,
        contexto: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Registra uma nova resposta no histórico do eleitor.

        Args:
            eleitor_id: ID do eleitor
            entrevista_id: ID da entrevista
            pergunta: Pergunta feita
            resposta_resumida: Resumo da resposta
            sentimento: Sentimento dominante
            intensidade: Intensidade (1-10)
            intencao_voto: Candidato mencionado (opcional)
            confianca: Nível de confiança na resposta (0-1)
            contexto: Contexto adicional

        Returns:
            Memória atualizada do eleitor
        """
        # Inicializar memória se não existir
        if eleitor_id not in self._memorias:
            self._memorias[eleitor_id] = {
                "eleitor_id": eleitor_id,
                "historico": [],
                "analise_evolutiva": {}
            }

        # Adicionar entrada
        entrada = {
            "data": datetime.now().isoformat(),
            "entrevista_id": entrevista_id,
            "pergunta": pergunta,
            "resposta_resumida": resposta_resumida,
            "sentimento": sentimento,
            "intensidade": intensidade,
            "intencao_voto": intencao_voto,
            "confianca": confianca,
            "contexto": contexto
        }

        self._memorias[eleitor_id]["historico"].append(entrada)

        # Recalcular análise evolutiva
        self._memorias[eleitor_id]["analise_evolutiva"] = self._analisar_evolucao(
            self._memorias[eleitor_id]["historico"]
        )

        self._salvar_memorias()

        return self._memorias[eleitor_id]

    def _analisar_evolucao(self, historico: List[Dict]) -> Dict[str, Any]:
        """
        Analisa a evolução do eleitor baseado no histórico.
        """
        if len(historico) < 2:
            return {
                "tendencia": "insuficiente",
                "volatilidade": 0,
                "mensagem": "Histórico insuficiente para análise (mínimo 2 registros)"
            }

        # Ordenar por data
        historico_ordenado = sorted(historico, key=lambda x: x.get("data", ""))

        # Analisar tendência de sentimento
        sentimentos_num = {
            "esperanca": 2, "satisfacao": 2, "apoio": 2,
            "indiferenca": 0,
            "medo": -1, "decepcao": -1,
            "raiva": -2, "indignacao": -2, "ameaca": -2
        }

        scores = []
        for h in historico_ordenado:
            sent = h.get("sentimento", "indiferenca")
            intensidade = h.get("intensidade", 5)
            score = sentimentos_num.get(sent, 0) * (intensidade / 10)
            scores.append(score)

        # Calcular tendência (média das diferenças)
        if len(scores) >= 2:
            diferencas = [scores[i+1] - scores[i] for i in range(len(scores)-1)]
            media_diff = sum(diferencas) / len(diferencas)

            if media_diff > 0.3:
                tendencia = "melhorando"
            elif media_diff < -0.3:
                tendencia = "piorando"
            else:
                tendencia = "estável"
        else:
            tendencia = "estável"

        # Calcular volatilidade (frequência de mudanças de intenção de voto)
        intencoes = [h.get("intencao_voto") for h in historico_ordenado if h.get("intencao_voto")]
        mudancas = 0
        for i in range(1, len(intencoes)):
            if intencoes[i] != intencoes[i-1]:
                mudancas += 1

        volatilidade = mudancas / max(len(intencoes) - 1, 1) if len(intencoes) > 1 else 0

        # Identificar gatilhos (contextos de mudanças)
        gatilhos = []
        for i in range(1, len(historico_ordenado)):
            atual = historico_ordenado[i]
            anterior = historico_ordenado[i-1]

            # Houve mudança significativa?
            mudou_intencao = atual.get("intencao_voto") != anterior.get("intencao_voto")
            mudou_sentimento = abs(
                sentimentos_num.get(atual.get("sentimento", "indiferenca"), 0) -
                sentimentos_num.get(anterior.get("sentimento", "indiferenca"), 0)
            ) >= 2

            if mudou_intencao or mudou_sentimento:
                contexto = atual.get("contexto", "")
                if contexto:
                    gatilhos.append(contexto)

        # Calcular probabilidade de mudança futura
        prob_mudanca = min(volatilidade * 1.2, 1.0)

        # Identificar última mudança
        ultima_mudanca = None
        for i in range(len(historico_ordenado) - 1, 0, -1):
            if historico_ordenado[i].get("intencao_voto") != historico_ordenado[i-1].get("intencao_voto"):
                ultima_mudanca = historico_ordenado[i].get("data")
                break

        # Perfil evolutivo
        if volatilidade > 0.5:
            perfil = "Eleitor volátil - muda de opinião frequentemente"
        elif volatilidade > 0.2:
            perfil = "Eleitor moderadamente influenciável"
        else:
            perfil = "Eleitor com opinião estável"

        if tendencia == "melhorando":
            perfil += ". Tendência de melhora recente."
        elif tendencia == "piorando":
            perfil += ". Tendência de piora recente."

        return {
            "tendencia": tendencia,
            "volatilidade": round(volatilidade, 2),
            "ultima_mudanca": ultima_mudanca,
            "probabilidade_mudanca_proxima": round(prob_mudanca, 2),
            "gatilhos_identificados": list(set(gatilhos))[:5],
            "perfil_evolutivo": perfil,
            "total_registros": len(historico),
            "periodo_analise": {
                "inicio": historico_ordenado[0].get("data"),
                "fim": historico_ordenado[-1].get("data")
            }
        }

    def obter_memoria(self, eleitor_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtém memória completa de um eleitor.
        """
        return self._memorias.get(eleitor_id)

    def obter_memorias_multiplos(self, eleitor_ids: List[str]) -> Dict[str, Dict]:
        """
        Obtém memórias de múltiplos eleitores.
        """
        return {
            eid: self._memorias[eid]
            for eid in eleitor_ids
            if eid in self._memorias
        }

    def listar_eleitores_com_historico(
        self,
        min_registros: int = 1,
        tendencia_filtro: Optional[str] = None,
        volatilidade_min: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Lista eleitores que possuem histórico registrado.
        """
        resultado = []

        for eleitor_id, memoria in self._memorias.items():
            analise = memoria.get("analise_evolutiva", {})
            total = analise.get("total_registros", len(memoria.get("historico", [])))

            if total < min_registros:
                continue

            if tendencia_filtro and analise.get("tendencia") != tendencia_filtro:
                continue

            if volatilidade_min and analise.get("volatilidade", 0) < volatilidade_min:
                continue

            resultado.append({
                "eleitor_id": eleitor_id,
                "total_registros": total,
                "tendencia": analise.get("tendencia"),
                "volatilidade": analise.get("volatilidade"),
                "probabilidade_mudanca": analise.get("probabilidade_mudanca_proxima"),
                "ultima_mudanca": analise.get("ultima_mudanca")
            })

        # Ordenar por volatilidade (mais voláteis primeiro)
        resultado.sort(key=lambda x: x.get("volatilidade", 0), reverse=True)

        return resultado

    def obter_estatisticas_gerais(self) -> Dict[str, Any]:
        """
        Obtém estatísticas gerais de todas as memórias.
        """
        total_eleitores = len(self._memorias)
        total_registros = sum(
            len(m.get("historico", [])) for m in self._memorias.values()
        )

        tendencias = Counter(
            m.get("analise_evolutiva", {}).get("tendencia", "desconhecido")
            for m in self._memorias.values()
        )

        volatilidades = [
            m.get("analise_evolutiva", {}).get("volatilidade", 0)
            for m in self._memorias.values()
        ]
        volatilidade_media = sum(volatilidades) / len(volatilidades) if volatilidades else 0

        return {
            "total_eleitores_com_historico": total_eleitores,
            "total_registros": total_registros,
            "media_registros_por_eleitor": round(total_registros / total_eleitores, 1) if total_eleitores else 0,
            "distribuicao_tendencias": dict(tendencias),
            "volatilidade_media": round(volatilidade_media, 2),
            "eleitores_voliteis": len([v for v in volatilidades if v > 0.5]),
            "eleitores_estaveis": len([v for v in volatilidades if v <= 0.2])
        }

    def obter_timeline_eleitor(self, eleitor_id: str) -> List[Dict[str, Any]]:
        """
        Obtém timeline formatada de um eleitor para visualização.
        """
        memoria = self._memorias.get(eleitor_id)
        if not memoria:
            return []

        historico = memoria.get("historico", [])
        historico_ordenado = sorted(historico, key=lambda x: x.get("data", ""))

        timeline = []
        for i, h in enumerate(historico_ordenado):
            mudou = False
            if i > 0:
                anterior = historico_ordenado[i-1]
                mudou = h.get("intencao_voto") != anterior.get("intencao_voto")

            timeline.append({
                "data": h.get("data"),
                "data_formatada": datetime.fromisoformat(h.get("data")).strftime("%d/%m/%Y") if h.get("data") else "",
                "sentimento": h.get("sentimento"),
                "intensidade": h.get("intensidade"),
                "intencao_voto": h.get("intencao_voto"),
                "mudou_voto": mudou,
                "contexto": h.get("contexto"),
                "pergunta": h.get("pergunta"),
                "resposta": h.get("resposta_resumida")
            })

        return timeline

    def deletar_memoria(self, eleitor_id: str) -> bool:
        """Remove memória de um eleitor."""
        if eleitor_id in self._memorias:
            del self._memorias[eleitor_id]
            self._salvar_memorias()
            return True
        return False


# Singleton
_memoria_evolutiva_servico: Optional[MemoriaEvolutivaServico] = None


def obter_memoria_evolutiva_servico() -> MemoriaEvolutivaServico:
    global _memoria_evolutiva_servico
    if _memoria_evolutiva_servico is None:
        _memoria_evolutiva_servico = MemoriaEvolutivaServico()
    return _memoria_evolutiva_servico
```

#### 2. `backend/app/api/rotas/memoria_evolutiva.py`

```python
"""
Rotas de API para Memória Evolutiva
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.servicos.memoria_evolutiva_servico import obter_memoria_evolutiva_servico


router = APIRouter(prefix="/memoria-evolutiva", tags=["Memória Evolutiva"])


class RegistrarRespostaRequest(BaseModel):
    """Request para registrar resposta"""
    eleitor_id: str
    entrevista_id: str
    pergunta: str
    resposta_resumida: str
    sentimento: str
    intensidade: int = Field(ge=1, le=10)
    intencao_voto: Optional[str] = None
    confianca: float = Field(0.5, ge=0, le=1)
    contexto: Optional[str] = None


@router.post("/registrar")
async def registrar_resposta(request: RegistrarRespostaRequest) -> Dict[str, Any]:
    """
    Registra uma nova resposta no histórico evolutivo do eleitor.
    """
    servico = obter_memoria_evolutiva_servico()

    resultado = servico.registrar_resposta(
        eleitor_id=request.eleitor_id,
        entrevista_id=request.entrevista_id,
        pergunta=request.pergunta,
        resposta_resumida=request.resposta_resumida,
        sentimento=request.sentimento,
        intensidade=request.intensidade,
        intencao_voto=request.intencao_voto,
        confianca=request.confianca,
        contexto=request.contexto
    )

    return resultado


@router.get("/eleitor/{eleitor_id}")
async def obter_memoria_eleitor(eleitor_id: str) -> Dict[str, Any]:
    """
    Obtém memória evolutiva completa de um eleitor.
    """
    servico = obter_memoria_evolutiva_servico()
    memoria = servico.obter_memoria(eleitor_id)

    if not memoria:
        raise HTTPException(
            status_code=404,
            detail=f"Nenhum histórico encontrado para eleitor {eleitor_id}"
        )

    return memoria


@router.get("/eleitor/{eleitor_id}/timeline")
async def obter_timeline_eleitor(eleitor_id: str) -> Dict[str, Any]:
    """
    Obtém timeline formatada de um eleitor.
    """
    servico = obter_memoria_evolutiva_servico()
    timeline = servico.obter_timeline_eleitor(eleitor_id)

    if not timeline:
        raise HTTPException(status_code=404, detail="Nenhum histórico encontrado")

    return {"eleitor_id": eleitor_id, "timeline": timeline}


@router.get("/listar")
async def listar_eleitores_com_historico(
    min_registros: int = 1,
    tendencia: Optional[str] = None,
    volatilidade_min: Optional[float] = None
) -> Dict[str, Any]:
    """
    Lista eleitores que possuem histórico registrado.
    """
    servico = obter_memoria_evolutiva_servico()
    eleitores = servico.listar_eleitores_com_historico(
        min_registros=min_registros,
        tendencia_filtro=tendencia,
        volatilidade_min=volatilidade_min
    )

    return {"eleitores": eleitores, "total": len(eleitores)}


@router.get("/estatisticas")
async def obter_estatisticas() -> Dict[str, Any]:
    """
    Obtém estatísticas gerais de memórias evolutivas.
    """
    servico = obter_memoria_evolutiva_servico()
    return servico.obter_estatisticas_gerais()


@router.delete("/eleitor/{eleitor_id}")
async def deletar_memoria(eleitor_id: str) -> Dict[str, Any]:
    """
    Remove memória evolutiva de um eleitor.
    """
    servico = obter_memoria_evolutiva_servico()
    sucesso = servico.deletar_memoria(eleitor_id)

    if not sucesso:
        raise HTTPException(status_code=404, detail="Memória não encontrada")

    return {"sucesso": True, "eleitor_id": eleitor_id}
```

#### 3. Registrar rota em `backend/app/main.py`

```python
from app.api.rotas.memoria_evolutiva import router as memoria_evolutiva_router
app.include_router(memoria_evolutiva_router, prefix="/api/v1")
```

---

### Frontend

#### 4. `frontend/src/app/(dashboard)/evolucao/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Activity,
  Eye,
  Search,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import api from "@/services/api";
import { toast } from "sonner";

// Tipos
interface EleitorHistorico {
  eleitor_id: string;
  total_registros: number;
  tendencia: string;
  volatilidade: number;
  probabilidade_mudanca: number;
  ultima_mudanca: string | null;
}

interface Estatisticas {
  total_eleitores_com_historico: number;
  total_registros: number;
  media_registros_por_eleitor: number;
  distribuicao_tendencias: Record<string, number>;
  volatilidade_media: number;
  eleitores_voliteis: number;
  eleitores_estaveis: number;
}

interface TimelineItem {
  data_formatada: string;
  sentimento: string;
  intensidade: number;
  intencao_voto: string;
  mudou_voto: boolean;
  contexto: string;
  pergunta: string;
  resposta: string;
}

// Ícone de tendência
const TendenciaIcon = ({ tendencia }: { tendencia: string }) => {
  switch (tendencia) {
    case "melhorando":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "piorando":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-gray-500" />;
  }
};

export default function EvolucaoPage() {
  // Estados
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [eleitores, setEleitores] = useState<EleitorHistorico[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroTendencia, setFiltroTendencia] = useState<string>("");
  const [selectedEleitor, setSelectedEleitor] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Carregar dados
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [statsRes, eleitoresRes] = await Promise.all([
        api.get("/api/v1/memoria-evolutiva/estatisticas"),
        api.get("/api/v1/memoria-evolutiva/listar")
      ]);

      setEstatisticas(statsRes.data);
      setEleitores(eleitoresRes.data.eleitores);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados de evolução");
    } finally {
      setLoading(false);
    }
  };

  const carregarTimeline = async (eleitorId: string) => {
    setLoadingTimeline(true);
    try {
      const response = await api.get(`/api/v1/memoria-evolutiva/eleitor/${eleitorId}/timeline`);
      setTimeline(response.data.timeline);
      setSelectedEleitor(eleitorId);
    } catch (error) {
      toast.error("Erro ao carregar timeline");
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Filtrar eleitores
  const eleitoresFiltrados = filtroTendencia
    ? eleitores.filter(e => e.tendencia === filtroTendencia)
    : eleitores;

  // Dados para gráfico de tendências
  const dadosTendencias = estatisticas?.distribuicao_tendencias
    ? Object.entries(estatisticas.distribuicao_tendencias).map(([nome, valor]) => ({
        nome,
        quantidade: valor
      }))
    : [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-8 w-8 text-indigo-500" />
            Memória Evolutiva
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe como os eleitores evoluem suas opiniões ao longo do tempo
          </p>
        </div>
        <Button variant="outline" onClick={carregarDados} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      {estatisticas && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Histórico</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estatisticas.total_eleitores_com_historico}
              </div>
              <p className="text-xs text-muted-foreground">
                eleitores monitorados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {estatisticas.total_registros}
              </div>
              <p className="text-xs text-muted-foreground">
                ~{estatisticas.media_registros_por_eleitor} por eleitor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voláteis</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {estatisticas.eleitores_voliteis}
              </div>
              <p className="text-xs text-muted-foreground">
                mudam frequentemente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estáveis</CardTitle>
              <Minus className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {estatisticas.eleitores_estaveis}
              </div>
              <p className="text-xs text-muted-foreground">
                opinião firme
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="eleitores" className="space-y-4">
        <TabsList>
          <TabsTrigger value="eleitores">Eleitores Monitorados</TabsTrigger>
          <TabsTrigger value="analise">Análise Geral</TabsTrigger>
        </TabsList>

        {/* Tab: Eleitores */}
        <TabsContent value="eleitores" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar por ID do eleitor..."
                    className="max-w-sm"
                  />
                </div>
                <select
                  className="border rounded px-3 py-2"
                  value={filtroTendencia}
                  onChange={(e) => setFiltroTendencia(e.target.value)}
                >
                  <option value="">Todas as tendências</option>
                  <option value="melhorando">Melhorando</option>
                  <option value="piorando">Piorando</option>
                  <option value="estável">Estável</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Tabela */}
          <Card>
            <CardHeader>
              <CardTitle>Eleitores com Histórico</CardTitle>
              <CardDescription>
                {eleitoresFiltrados.length} eleitores encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Eleitor ID</TableHead>
                    <TableHead>Registros</TableHead>
                    <TableHead>Tendência</TableHead>
                    <TableHead>Volatilidade</TableHead>
                    <TableHead>Prob. Mudança</TableHead>
                    <TableHead>Última Mudança</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eleitoresFiltrados.map((eleitor) => (
                    <TableRow key={eleitor.eleitor_id}>
                      <TableCell className="font-medium">
                        {eleitor.eleitor_id}
                      </TableCell>
                      <TableCell>{eleitor.total_registros}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TendenciaIcon tendencia={eleitor.tendencia} />
                          <span className="capitalize">{eleitor.tendencia}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={eleitor.volatilidade * 100}
                            className="w-16 h-2"
                          />
                          <span className="text-sm">
                            {Math.round(eleitor.volatilidade * 100)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            eleitor.probabilidade_mudanca > 0.7
                              ? "destructive"
                              : eleitor.probabilidade_mudanca > 0.4
                                ? "default"
                                : "secondary"
                          }
                        >
                          {Math.round(eleitor.probabilidade_mudanca * 100)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {eleitor.ultima_mudanca
                          ? new Date(eleitor.ultima_mudanca).toLocaleDateString()
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => carregarTimeline(eleitor.eleitor_id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Timeline
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Timeline: {selectedEleitor}
                              </DialogTitle>
                            </DialogHeader>

                            {loadingTimeline ? (
                              <div className="text-center py-8">Carregando...</div>
                            ) : (
                              <div className="space-y-4">
                                {timeline.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-4 border rounded-lg ${
                                      item.mudou_voto ? "border-red-300 bg-red-50" : ""
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium">
                                        {item.data_formatada}
                                      </span>
                                      <div className="flex gap-2">
                                        <Badge>{item.sentimento}</Badge>
                                        <Badge variant="outline">
                                          Intensidade: {item.intensidade}
                                        </Badge>
                                        {item.mudou_voto && (
                                          <Badge variant="destructive">
                                            Mudou voto!
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    {item.intencao_voto && (
                                      <p className="text-sm mb-2">
                                        <strong>Intenção:</strong> {item.intencao_voto}
                                      </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                      <strong>Pergunta:</strong> {item.pergunta}
                                    </p>
                                    <p className="text-sm mt-1">
                                      <strong>Resposta:</strong> {item.resposta}
                                    </p>
                                    {item.contexto && (
                                      <p className="text-xs text-muted-foreground mt-2">
                                        Contexto: {item.contexto}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
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
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Tendências</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dadosTendencias}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Volatilidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Volatilidade Média</span>
                    <span className="font-bold">
                      {Math.round((estatisticas?.volatilidade_media || 0) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(estatisticas?.volatilidade_media || 0) * 100}
                    className="h-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">
                      {estatisticas?.eleitores_voliteis || 0}
                    </div>
                    <div className="text-sm text-amber-700">
                      Eleitores Voláteis
                    </div>
                    <div className="text-xs text-muted-foreground">
                      (volatilidade &gt; 50%)
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {estatisticas?.eleitores_estaveis || 0}
                    </div>
                    <div className="text-sm text-green-700">
                      Eleitores Estáveis
                    </div>
                    <div className="text-xs text-muted-foreground">
                      (volatilidade &le; 20%)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

#### 5. Atualizar Sidebar

```tsx
{
  title: "Evolução",
  href: "/evolucao",
  icon: History,
  description: "Memória evolutiva"
}
```

---

## INTEGRAÇÃO AUTOMÁTICA

Para que a memória evolutiva seja alimentada automaticamente, modifique o serviço de entrevistas para registrar respostas:

### Em `backend/app/servicos/entrevista_servico.py`

**ADICIONAR** após processar resposta:

```python
from app.servicos.memoria_evolutiva_servico import obter_memoria_evolutiva_servico

# Após receber resposta do eleitor
memoria_servico = obter_memoria_evolutiva_servico()
memoria_servico.registrar_resposta(
    eleitor_id=eleitor_id,
    entrevista_id=entrevista_id,
    pergunta=pergunta_texto,
    resposta_resumida=resposta["resposta_final"][:200],
    sentimento=resposta["fluxo_cognitivo"]["emocional"]["sentimento_dominante"],
    intensidade=resposta["fluxo_cognitivo"]["emocional"]["intensidade"],
    intencao_voto=extrair_intencao_voto(resposta),  # Função a implementar
    confianca=0.8,
    contexto=entrevista.get("titulo", "")
)
```

---

## CHECKLIST DE VALIDAÇÃO - FASE 5

- [ ] `backend/app/servicos/memoria_evolutiva_servico.py` criado
- [ ] `backend/app/api/rotas/memoria_evolutiva.py` criado
- [ ] Rota registrada em `backend/app/main.py`
- [ ] `frontend/src/app/(dashboard)/evolucao/page.tsx` criado
- [ ] Link adicionado na Sidebar
- [ ] API de registrar resposta funcionando
- [ ] Timeline de eleitor sendo exibida
- [ ] Estatísticas sendo calculadas

---

## PRÓXIMA FASE

Continue para `PLANO_FASE_6_GRAFO_INFLUENCIA.md`
