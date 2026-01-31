"""
Modelo de Mensagem WhatsApp

Registra cada mensagem trocada entre o Oráculo Eleitoral e os contatos.
Inclui métricas de custo, tokens e tempo de resposta para billing.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, Integer, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class MensagemWhatsApp(Base):
    """
    Mensagem individual de WhatsApp.

    Direção:
    - entrada: mensagem do contato para o Oráculo
    - saida: mensagem do Oráculo para o contato

    Tipos:
    - texto: mensagem de texto
    - audio: mensagem de áudio (OGG)
    - imagem: foto ou imagem
    - documento: PDF ou arquivo
    - localizacao: localização geográfica
    """

    __tablename__ = "mensagens_whatsapp"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    conversa_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("conversas_whatsapp.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    contato_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("contatos_whatsapp.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    direcao: Mapped[str] = mapped_column(
        String(10), nullable=False,
        comment="entrada | saida"
    )
    tipo: Mapped[str] = mapped_column(
        String(20), nullable=False, default="texto",
        comment="texto | audio | imagem | documento | localizacao"
    )
    conteudo: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True,
        comment="Texto da mensagem ou transcrição de áudio"
    )
    media_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True,
        comment="URL da mídia no Meta Cloud"
    )
    whatsapp_msg_id: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, index=True,
        comment="ID da mensagem no WhatsApp (wamid.*)"
    )
    status_entrega: Mapped[str] = mapped_column(
        String(20), nullable=False, default="enviada",
        comment="enviada | entregue | lida | erro"
    )
    agente_usado: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True,
        comment="Nome do agente LangGraph que processou"
    )
    tokens_entrada: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tokens_saida: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    custo: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    tempo_resposta_ms: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False,
        comment="Tempo de processamento em milissegundos"
    )
    metadata_extra: Mapped[Optional[dict]] = mapped_column(
        JSONB, default=dict, nullable=True,
        comment="Dados extras: erro, retry_count, etc."
    )

    # Timestamps
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return (
            f"<MensagemWhatsApp(id={self.id}, dir={self.direcao}, "
            f"tipo={self.tipo}, agente={self.agente_usado})>"
        )
