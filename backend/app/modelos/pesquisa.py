"""
Modelo SQLAlchemy para Pesquisas.

Representa uma pesquisa eleitoral completa com seus metadados,
status de execução e métricas de custo.
"""

from datetime import datetime
from enum import Enum as PyEnum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.modelos.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.modelos.analise import Analise
    from app.modelos.pergunta import PerguntaPesquisa
    from app.modelos.resposta import Resposta


class TipoPesquisa(str, PyEnum):
    """Tipo de pesquisa eleitoral."""

    quantitativa = "quantitativa"
    qualitativa = "qualitativa"
    mista = "mista"


class StatusPesquisa(str, PyEnum):
    """Status de execução da pesquisa."""

    rascunho = "rascunho"
    agendada = "agendada"
    executando = "executando"
    pausada = "pausada"
    concluida = "concluida"
    cancelada = "cancelada"
    erro = "erro"


class Pesquisa(Base, TimestampMixin):
    """
    Modelo de Pesquisa Eleitoral.

    Armazena informações gerais da pesquisa, status de execução,
    contadores de eleitores e métricas de custo/tokens.

    Relacionamentos:
    - perguntas: Lista de PerguntaPesquisa
    - respostas: Lista de Resposta
    - analises: Lista de Analise
    """

    __tablename__ = "pesquisas"

    # Identificador
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # Dados básicos
    titulo: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )
    descricao: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # Tipo e status
    tipo: Mapped[TipoPesquisa] = mapped_column(
        Enum(TipoPesquisa, name="tipo_pesquisa_enum"),
        nullable=False,
        default=TipoPesquisa.mista,
    )
    status: Mapped[StatusPesquisa] = mapped_column(
        Enum(StatusPesquisa, name="status_pesquisa_enum"),
        nullable=False,
        default=StatusPesquisa.rascunho,
        index=True,
    )

    # Instrução geral para a IA
    instrucao_geral: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # Timestamps de execução
    iniciado_em: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    finalizado_em: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
    )
    pausado_em: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Contadores
    total_eleitores: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    eleitores_processados: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    progresso: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,  # 0-100
    )

    # Métricas de custo
    custo_estimado: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )
    custo_total: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )
    limite_custo: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    # Métricas de tokens
    tokens_entrada_total: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    tokens_saida_total: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    tokens_total: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # Erro
    erro_mensagem: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # Relacionamentos
    perguntas: Mapped[list["PerguntaPesquisa"]] = relationship(
        "PerguntaPesquisa",
        back_populates="pesquisa",
        cascade="all, delete-orphan",
        order_by="PerguntaPesquisa.ordem",
        lazy="selectin",
    )
    respostas: Mapped[list["Resposta"]] = relationship(
        "Resposta",
        back_populates="pesquisa",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )
    analises: Mapped[list["Analise"]] = relationship(
        "Analise",
        back_populates="pesquisa",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    # Índices compostos para consultas comuns
    __table_args__ = (
        Index("ix_pesquisas_status_criado_em", "status", "criado_em"),
        Index("ix_pesquisas_tipo_status", "tipo", "status"),
    )

    def __repr__(self) -> str:
        return f"<Pesquisa(id={self.id}, titulo='{self.titulo[:30]}...', status={self.status.value})>"

    @property
    def duracao_segundos(self) -> Optional[int]:
        """Calcula a duração da pesquisa em segundos."""
        if self.iniciado_em and self.finalizado_em:
            return int((self.finalizado_em - self.iniciado_em).total_seconds())
        return None

    @property
    def esta_em_execucao(self) -> bool:
        """Verifica se a pesquisa está em execução."""
        return self.status == StatusPesquisa.executando

    @property
    def pode_iniciar(self) -> bool:
        """Verifica se a pesquisa pode ser iniciada."""
        return self.status in (StatusPesquisa.rascunho, StatusPesquisa.pausada)
