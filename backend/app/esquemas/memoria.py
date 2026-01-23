"""
Esquemas Pydantic para Memórias.

Modelos para criação, leitura e analytics de memórias de entrevistas.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


# ============================================
# ENUMS
# ============================================


class TipoMemoriaEnum(str, Enum):
    """Tipo de memória armazenada."""

    entrevista = "entrevista"
    interacao = "interacao"
    analise = "analise"


# ============================================
# BASE
# ============================================


class MemoriaBase(BaseModel):
    """Campos base de uma memória."""

    tipo: TipoMemoriaEnum = TipoMemoriaEnum.entrevista
    eleitor_id: str
    eleitor_nome: Optional[str] = None
    resposta_texto: str
    resposta_valor: Optional[Any] = None
    fluxo_cognitivo: Optional[dict[str, Any]] = None
    modelo_usado: str = "claude-sonnet-4-5-20250929"
    tokens_entrada: int = 0
    tokens_saida: int = 0
    custo: float = 0.0
    tempo_resposta_ms: int = 0


# ============================================
# CREATE
# ============================================


class MemoriaCreate(MemoriaBase):
    """Esquema para criação de memória."""

    pesquisa_id: Optional[int] = None
    pergunta_id: Optional[int] = None
    resposta_id: Optional[int] = None
    usuario_id: Optional[int] = None
    usuario_nome: Optional[str] = None
    pergunta_texto: Optional[str] = None
    contexto: Optional[dict[str, Any]] = None
    metadados: Optional[dict[str, Any]] = None


# ============================================
# RESPONSE
# ============================================


class MemoriaResponse(MemoriaBase):
    """Esquema de resposta com memória completa."""

    id: int
    pesquisa_id: Optional[int] = None
    pergunta_id: Optional[int] = None
    resposta_id: Optional[int] = None
    usuario_id: Optional[int] = None
    usuario_nome: Optional[str] = None
    pergunta_texto: Optional[str] = None
    tokens_total: int = 0
    contexto: Optional[dict[str, Any]] = None
    metadados: Optional[dict[str, Any]] = None
    criado_em: datetime
    atualizado_em: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MemoriaResumo(BaseModel):
    """Resumo de uma memória para listagens."""

    id: int
    tipo: TipoMemoriaEnum
    eleitor_id: str
    eleitor_nome: Optional[str] = None
    pesquisa_id: Optional[int] = None
    resposta_texto: str = Field(..., max_length=200)
    modelo_usado: str
    tokens_total: int
    custo: float
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================
# LISTAGEM
# ============================================


class MemoriaListResponse(BaseModel):
    """Resposta paginada de memórias."""

    memorias: list[MemoriaResumo]
    total: int
    pagina: int = 1
    por_pagina: int = 20
    total_paginas: int


# ============================================
# FILTROS
# ============================================


class FiltrosMemoria(BaseModel):
    """Filtros para busca de memórias."""

    eleitor_id: Optional[str] = None
    eleitor_ids: Optional[list[str]] = None
    pesquisa_id: Optional[int] = None
    pesquisa_ids: Optional[list[int]] = None
    usuario_id: Optional[int] = None
    tipo: Optional[TipoMemoriaEnum] = None
    modelo_usado: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    custo_minimo: Optional[float] = None
    custo_maximo: Optional[float] = None


# ============================================
# HISTÓRICO POR ELEITOR
# ============================================


class HistoricoEleitor(BaseModel):
    """Histórico completo de um eleitor."""

    eleitor_id: str
    eleitor_nome: Optional[str] = None
    total_entrevistas: int = 0
    total_respostas: int = 0
    pesquisas_participadas: list[int] = Field(default_factory=list)
    tokens_total: int = 0
    custo_total: float = 0.0
    primeira_entrevista: Optional[datetime] = None
    ultima_entrevista: Optional[datetime] = None
    sentimentos_frequentes: dict[str, int] = Field(default_factory=dict)
    memorias: list[MemoriaResumo] = Field(default_factory=list)


# ============================================
# ANALYTICS GLOBAIS
# ============================================


class UsoAPIResponse(BaseModel):
    """Estatísticas de uso da API por período."""

    periodo: str
    tipo_periodo: str
    total_chamadas: int = 0
    total_pesquisas: int = 0
    total_eleitores_unicos: int = 0
    tokens_entrada_total: int = 0
    tokens_saida_total: int = 0
    tokens_total: int = 0
    custo_total: float = 0.0
    chamadas_opus: int = 0
    chamadas_sonnet: int = 0
    tokens_opus: int = 0
    tokens_sonnet: int = 0
    custo_opus: float = 0.0
    custo_sonnet: float = 0.0
    tempo_resposta_medio_ms: int = 0
    custo_medio_por_chamada: float = 0.0
    tokens_medio_por_chamada: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class AnalyticsGlobais(BaseModel):
    """Analytics globais do sistema."""

    # Totais acumulados
    total_memorias: int = 0
    total_pesquisas: int = 0
    total_eleitores_unicos: int = 0
    total_respostas: int = 0

    # Tokens
    tokens_entrada_acumulados: int = 0
    tokens_saida_acumulados: int = 0
    tokens_acumulados: int = 0

    # Custo
    custo_acumulado: float = 0.0
    custo_medio_por_resposta: float = 0.0
    custo_medio_por_eleitor: float = 0.0

    # Por modelo
    distribuicao_modelos: dict[str, int] = Field(default_factory=dict)
    custo_por_modelo: dict[str, float] = Field(default_factory=dict)
    tokens_por_modelo: dict[str, int] = Field(default_factory=dict)

    # Temporal
    uso_por_periodo: list[UsoAPIResponse] = Field(default_factory=list)
    tendencia_custo: str = "estavel"  # alta, baixa, estavel

    # Performance
    tempo_resposta_medio_ms: int = 0

    # Período analisado
    data_primeira_memoria: Optional[datetime] = None
    data_ultima_memoria: Optional[datetime] = None


class ResumoUsoUsuario(BaseModel):
    """Resumo de uso por usuário."""

    usuario_id: int
    usuario_nome: Optional[str] = None
    total_chamadas: int = 0
    total_pesquisas: int = 0
    tokens_total: int = 0
    custo_total: float = 0.0
    ultima_atividade: Optional[datetime] = None


class AnalyticsUsuarios(BaseModel):
    """Analytics de uso por usuários."""

    total_usuarios: int = 0
    usuarios: list[ResumoUsoUsuario] = Field(default_factory=list)
    usuario_mais_ativo: Optional[ResumoUsoUsuario] = None
    usuario_maior_custo: Optional[ResumoUsoUsuario] = None
