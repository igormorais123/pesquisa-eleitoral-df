"""
Esquemas Pydantic para Análise Global.

Modelos para dashboard, correlações, tendências e insights acumulativos.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# ============================================
# ENUMS
# ============================================


class TipoInsightEnum(str, Enum):
    """Tipo de insight descoberto."""

    volume = "volume"
    sentimento = "sentimento"
    comportamento = "comportamento"
    custo = "custo"
    tendencia = "tendencia"
    anomalia = "anomalia"
    correlacao = "correlacao"


class RelevanciaEnum(str, Enum):
    """Nível de relevância do insight."""

    informativo = "informativo"
    importante = "importante"
    critico = "critico"


class DirecaoTendenciaEnum(str, Enum):
    """Direção de uma tendência."""

    alta = "alta"
    baixa = "baixa"
    estavel = "estavel"


# ============================================
# DASHBOARD GLOBAL
# ============================================


class DashboardGlobal(BaseModel):
    """Métricas globais do sistema de pesquisas."""

    total_pesquisas: int = 0
    pesquisas_por_status: dict[str, int] = Field(default_factory=dict)
    total_respostas: int = 0
    eleitores_unicos: int = 0
    custo_acumulado: float = 0.0
    tokens_acumulados: int = 0

    # Métricas derivadas
    custo_medio_por_pesquisa: float = 0.0
    respostas_por_pesquisa: float = 0.0

    @classmethod
    def from_estatisticas(cls, stats: dict[str, Any]) -> "DashboardGlobal":
        """Cria DashboardGlobal a partir de estatísticas brutas."""
        total_pesquisas = stats.get("total_pesquisas", 0)
        return cls(
            total_pesquisas=total_pesquisas,
            pesquisas_por_status=stats.get("pesquisas_por_status", {}),
            total_respostas=stats.get("total_respostas", 0),
            eleitores_unicos=stats.get("eleitores_unicos", 0),
            custo_acumulado=stats.get("custo_acumulado", 0.0),
            tokens_acumulados=stats.get("tokens_acumulados", 0),
            custo_medio_por_pesquisa=(
                stats.get("custo_acumulado", 0) / total_pesquisas
                if total_pesquisas > 0 else 0
            ),
            respostas_por_pesquisa=(
                stats.get("total_respostas", 0) / total_pesquisas
                if total_pesquisas > 0 else 0
            ),
        )


# ============================================
# CORRELAÇÕES
# ============================================


class Correlacao(BaseModel):
    """Uma correlação entre duas variáveis."""

    variavel_1: str
    variavel_2: str
    coeficiente: float = Field(..., ge=-1.0, le=1.0)
    forca: str = "moderada"  # fraca, moderada, forte


class CorrelacoesResponse(BaseModel):
    """Resposta com matriz de correlações."""

    matriz: list[list[float]] = Field(default_factory=list)
    variaveis: list[str] = Field(default_factory=list)
    significativas: list[Correlacao] = Field(default_factory=list)


# ============================================
# TENDÊNCIAS
# ============================================


class MetricaPeriodo(BaseModel):
    """Métrica em um período específico."""

    periodo: str  # Ex: "2026-W01"
    total_pesquisas: int = 0
    total_respostas: int = 0
    custo_total: float = 0.0
    custo_medio: float = 0.0
    tokens_total: int = 0


class Tendencia(BaseModel):
    """Tendência de uma métrica."""

    metrica: str
    valor_inicial: float
    valor_final: float
    variacao_percentual: float
    direcao: DirecaoTendenciaEnum


class TendenciasResponse(BaseModel):
    """Resposta com tendências temporais."""

    periodos: list[MetricaPeriodo] = Field(default_factory=list)
    tendencias: dict[str, Tendencia] = Field(default_factory=dict)
    periodo_analise: str = ""


# ============================================
# SEGMENTOS
# ============================================


class MetricasSegmento(BaseModel):
    """Métricas de um segmento/grupo."""

    total_respostas: int = 0
    eleitores_unicos: int = 0
    sentimentos: dict[str, int] = Field(default_factory=dict)
    intensidade_media: float = 5.0
    taxa_mudanca_voto: float = 0.0
    tokens_media: float = 0.0


class SegmentoAnalise(BaseModel):
    """Análise de um segmento específico."""

    grupo: str
    metricas: MetricasSegmento


class SegmentosResponse(BaseModel):
    """Resposta com análise por segmentos."""

    campo_agrupamento: str
    grupos: dict[str, MetricasSegmento] = Field(default_factory=dict)
    total_grupos: int = 0


# ============================================
# OUTLIERS
# ============================================


class Outlier(BaseModel):
    """Um outlier detectado."""

    resposta_id: int
    pesquisa_id: int
    eleitor_id: str
    motivos: list[str] = Field(default_factory=list)
    tempo_resposta_ms: int = 0
    tamanho_resposta: int = 0


class EstatisticasOutlier(BaseModel):
    """Estatísticas usadas para detecção de outliers."""

    media_tempo_ms: float
    desvio_padrao_ms: float
    limite_usado: float


class OutliersResponse(BaseModel):
    """Resposta com outliers detectados."""

    outliers: list[Outlier] = Field(default_factory=list)
    total_outliers: int = 0
    estatisticas: Optional[EstatisticasOutlier] = None
    mensagem: Optional[str] = None


# ============================================
# INSIGHTS
# ============================================


class InsightGlobal(BaseModel):
    """Um insight descoberto nas análises."""

    tipo: TipoInsightEnum
    titulo: str
    descricao: str
    relevancia: RelevanciaEnum = RelevanciaEnum.informativo
    dados: dict[str, Any] = Field(default_factory=dict)


class InsightsResponse(BaseModel):
    """Resposta com insights cumulativos."""

    insights: list[InsightGlobal] = Field(default_factory=list)
    total_insights: int = 0
    gerado_em: datetime = Field(default_factory=datetime.now)


# ============================================
# HISTÓRICO
# ============================================


class ParticipacaoEleitor(BaseModel):
    """Participação de um eleitor em uma pesquisa."""

    pesquisa_id: int
    total_respostas: int
    primeira_resposta: Optional[datetime] = None
    ultima_resposta: Optional[datetime] = None
    sentimentos: dict[str, int] = Field(default_factory=dict)
    custo_total: float = 0.0


class HistoricoEleitorResponse(BaseModel):
    """Histórico completo de um eleitor."""

    eleitor_id: str
    total_participacoes: int = 0
    total_respostas: int = 0
    participacoes: list[ParticipacaoEleitor] = Field(default_factory=list)


# ============================================
# EXPORTAÇÃO
# ============================================


class MetadadosExportacao(BaseModel):
    """Metadados do dataset exportado."""

    total_pesquisas: int
    total_respostas: int
    exportado_em: datetime
    formato: str


class PesquisaExportacao(BaseModel):
    """Pesquisa no formato de exportação."""

    id: int
    titulo: str
    tipo: str
    status: str
    criado_em: Optional[datetime] = None
    finalizado_em: Optional[datetime] = None
    total_eleitores: int
    custo_total: float
    tokens_total: int


class RespostaExportacao(BaseModel):
    """Resposta no formato de exportação."""

    id: int
    pesquisa_id: int
    pergunta_id: int
    eleitor_id: str
    resposta_texto: str
    resposta_valor: Optional[Any] = None
    sentimento: Optional[str] = None
    intensidade: Optional[int] = None
    mudaria_voto: Optional[bool] = None
    tokens_entrada: int
    tokens_saida: int
    custo: float
    tempo_resposta_ms: int
    criado_em: Optional[datetime] = None


class DatasetExportacao(BaseModel):
    """Dataset completo para exportação."""

    pesquisas: list[PesquisaExportacao] = Field(default_factory=list)
    respostas: list[RespostaExportacao] = Field(default_factory=list)
    metadados: MetadadosExportacao


# ============================================
# FILTROS
# ============================================


class FiltrosPeriodo(BaseModel):
    """Filtros de período para análises."""

    dias: int = Field(default=30, ge=1, le=365)
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None


class FiltrosAnalise(BaseModel):
    """Filtros para análises."""

    pesquisa_ids: Optional[list[int]] = None
    eleitor_ids: Optional[list[str]] = None
    periodo: Optional[FiltrosPeriodo] = None
