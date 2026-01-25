"""
Modelo SQLAlchemy para Interações do Chat de Inteligência Eleitoral.

Armazena todas as interações de usuários com a IA especialista (Dra. Helena Strategos)
para análise posterior e controle de custos.
"""

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import (
    DateTime,
    Float,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.modelos.base import Base, TimestampMixin


class InteracaoChat(Base, TimestampMixin):
    """
    Modelo de Interação do Chat de Inteligência.

    Armazena cada interação com a IA Dra. Helena Strategos para:
    - Histórico completo de consultas
    - Analytics de uso e custos
    - Auditoria de perguntas/respostas
    - Melhoria contínua da persona

    Cada registro é imutável após criação.
    """

    __tablename__ = "interacoes_chat"

    # Identificador
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # Sessão do chat (agrupa conversas)
    sessao_id: Mapped[str] = mapped_column(
        String(36),  # UUID
        nullable=False,
        index=True,
    )

    # Conteúdo da interação
    pergunta: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    resposta: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # Modelo de IA usado
    modelo_usado: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="claude-opus-4-5-20251101",
    )

    # === MÉTRICAS DE TOKENS ===
    tokens_entrada: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    tokens_saida: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    tokens_total: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # Custo estimado em USD
    custo_estimado: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    # Tempo de resposta em milissegundos
    tempo_resposta_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # IP de origem (para analytics)
    ip_origem: Mapped[Optional[str]] = mapped_column(
        String(45),  # IPv6 max length
        nullable=True,
    )

    # User agent (para analytics)
    user_agent: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
    )

    # Contexto adicional (dados da pesquisa usados, etc.)
    contexto: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Metadados extras
    metadados: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Índices compostos para consultas otimizadas
    __table_args__ = (
        # Histórico por sessão
        Index("ix_interacoes_chat_sessao_criado_em", "sessao_id", "criado_em"),
        # Por modelo usado
        Index("ix_interacoes_chat_modelo_criado_em", "modelo_usado", "criado_em"),
        # Para analytics de custo por período
        Index("ix_interacoes_chat_criado_em", "criado_em"),
    )

    def __repr__(self) -> str:
        pergunta_curta = (
            self.pergunta[:30] + "..."
            if len(self.pergunta) > 30
            else self.pergunta
        )
        return (
            f"<InteracaoChat(id={self.id}, sessao='{self.sessao_id[:8]}...', "
            f"pergunta='{pergunta_curta}')>"
        )

    @property
    def custo_por_token(self) -> float:
        """Custo médio por token."""
        if self.tokens_total > 0:
            return self.custo_estimado / self.tokens_total
        return 0.0
