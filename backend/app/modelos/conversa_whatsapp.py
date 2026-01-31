"""
Modelo de Conversa WhatsApp

Representa uma sessão de conversa entre um contato e o Oráculo Eleitoral.
Cada conversa tem um thread_id único para o LangGraph checkpointer.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class ConversaWhatsApp(Base):
    """
    Sessão de conversa WhatsApp.

    Status:
    - ativa: conversa em andamento
    - encerrada: conversa finalizada pelo usuário ou por timeout
    - pausada: conversa pausada temporariamente
    """

    __tablename__ = "conversas_whatsapp"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    contato_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("contatos_whatsapp.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    thread_id: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True,
        comment="UUID para LangGraph checkpointer"
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="ativa",
        comment="ativa | encerrada | pausada"
    )
    contexto: Mapped[Optional[dict]] = mapped_column(
        JSONB, default=dict, nullable=True,
        comment="Estado atual da conversa (último agente, tópico, etc.)"
    )
    total_mensagens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    custo_total: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Timestamps
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(),
        onupdate=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<ConversaWhatsApp(id={self.id}, contato={self.contato_id}, status={self.status})>"
