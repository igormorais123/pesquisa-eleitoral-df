"""
Esquemas Pydantic para Chat de Inteligência Eleitoral.

Modelos para requisição e resposta do chat com a Dra. Helena Strategos.
"""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


# ============================================
# REQUEST
# ============================================


class ChatRequest(BaseModel):
    """Requisição para enviar mensagem ao chat."""

    pergunta: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="Pergunta do usuário para a Dra. Helena Strategos"
    )
    sessao_id: Optional[str] = Field(
        None,
        description="ID da sessão para manter contexto. Se não fornecido, cria nova sessão."
    )


# ============================================
# RESPONSE
# ============================================


class ChatResponse(BaseModel):
    """Resposta do chat com a Dra. Helena Strategos."""

    resposta: str = Field(
        ...,
        description="Resposta da Dra. Helena Strategos"
    )
    sessao_id: str = Field(
        ...,
        description="ID da sessão para continuar a conversa"
    )
    tokens_usados: Optional[int] = Field(
        None,
        description="Total de tokens usados na requisição"
    )


class ChatHistoricoItem(BaseModel):
    """Item do histórico de uma sessão de chat."""

    id: int
    pergunta: str
    resposta: str
    criado_em: datetime
    tokens_total: int = 0
    custo_estimado: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class ChatHistoricoResponse(BaseModel):
    """Histórico completo de uma sessão de chat."""

    sessao_id: str
    interacoes: list[ChatHistoricoItem]
    total_interacoes: int
    tokens_total: int
    custo_total: float


# ============================================
# ANALYTICS
# ============================================


class ChatAnalyticsResponse(BaseModel):
    """Analytics de uso do chat."""

    total_interacoes: int = 0
    total_sessoes: int = 0
    tokens_total: int = 0
    custo_total: float = 0.0
    media_tokens_por_interacao: float = 0.0
    media_tempo_resposta_ms: float = 0.0

    # Por período
    interacoes_hoje: int = 0
    interacoes_semana: int = 0
    interacoes_mes: int = 0

    # Top perguntas (mais frequentes)
    top_temas: list[dict[str, Any]] = Field(default_factory=list)
