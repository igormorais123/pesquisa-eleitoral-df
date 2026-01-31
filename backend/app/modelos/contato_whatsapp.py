"""
Modelo de Contato WhatsApp

Armazena contatos autorizados a interagir com o Oráculo Eleitoral via WhatsApp.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class ContatoWhatsApp(Base):
    """
    Contato autorizado no WhatsApp do Oráculo Eleitoral.

    Tipos de contato:
    - cliente: decisor da campanha (candidato ou assessor)
    - cabo_eleitoral: operador de campo
    - candidato: o próprio candidato

    Planos:
    - consultor: acesso básico (dados + simulações)
    - estrategista: acesso avançado (estratégia + conteúdo)
    - war_room: acesso total (tempo real + cabos + briefing diário)
    """

    __tablename__ = "contatos_whatsapp"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    telefone: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True,
        comment="Formato E.164: +5561999999999"
    )
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    tipo: Mapped[str] = mapped_column(
        String(30), nullable=False, default="cliente",
        comment="cliente | cabo_eleitoral | candidato"
    )
    plano: Mapped[str] = mapped_column(
        String(30), nullable=False, default="consultor",
        comment="consultor | estrategista | war_room"
    )
    pin_hash: Mapped[Optional[str]] = mapped_column(
        String(200), nullable=True,
        comment="bcrypt hash do PIN de acesso"
    )
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    opt_in_em: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True,
        comment="Timestamp do consentimento LGPD/eleitoral"
    )
    metadata_extra: Mapped[Optional[dict]] = mapped_column(
        JSONB, default=dict, nullable=True,
        comment="Dados extras: região, cargo alvo, cliente_de, etc."
    )
    ultimo_acesso: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Timestamps
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(),
        onupdate=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<ContatoWhatsApp(id={self.id}, tel={self.telefone}, tipo={self.tipo})>"
