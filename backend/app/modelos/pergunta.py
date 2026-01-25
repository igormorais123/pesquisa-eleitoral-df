"""
Modelo SQLAlchemy para Perguntas de Pesquisa.

Representa uma pergunta individual dentro de uma pesquisa eleitoral,
com suporte a diferentes tipos de perguntas e opções configuráveis.
"""

from enum import Enum as PyEnum
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import (
    Boolean,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.modelos.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.modelos.pesquisa import Pesquisa
    from app.modelos.resposta import Resposta


class TipoPergunta(str, PyEnum):
    """Tipo de pergunta."""

    aberta = "aberta"
    aberta_longa = "aberta_longa"
    escala_likert = "escala_likert"
    multipla_escolha = "multipla_escolha"
    sim_nao = "sim_nao"
    ranking = "ranking"
    numerica = "numerica"


class PerguntaPesquisa(Base, TimestampMixin):
    """
    Modelo de Pergunta de Pesquisa.

    Armazena uma pergunta individual com seu tipo, texto, ordem
    e configurações específicas (opções, escalas, etc.).

    Relacionamentos:
    - pesquisa: Pesquisa pai
    - respostas: Lista de Resposta para esta pergunta
    """

    __tablename__ = "perguntas_pesquisa"

    # Identificador
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # Foreign Key para Pesquisa
    pesquisa_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("pesquisas.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Texto da pergunta
    texto: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # Tipo de pergunta
    tipo: Mapped[TipoPergunta] = mapped_column(
        Enum(TipoPergunta, name="tipo_pergunta_enum"),
        nullable=False,
        default=TipoPergunta.aberta,
    )

    # Ordem de exibição
    ordem: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # Se a pergunta é obrigatória
    obrigatoria: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    # Opções para perguntas de múltipla escolha/ranking
    # Formato: ["Opção 1", "Opção 2", "Opção 3"]
    opcoes: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Configuração de escala (para escala_likert e numerica)
    escala_min: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    escala_max: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    # Rótulos para escalas
    # Formato: {"1": "Discordo totalmente", "5": "Concordo totalmente"}
    escala_rotulos: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Instruções específicas para a IA
    instrucoes_ia: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # Código único da pergunta (para referência em análises)
    codigo: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )

    # Relacionamentos
    pesquisa: Mapped["Pesquisa"] = relationship(
        "Pesquisa",
        back_populates="perguntas",
    )
    respostas: Mapped[list["Resposta"]] = relationship(
        "Resposta",
        back_populates="pergunta",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )

    # Índices compostos
    __table_args__ = (
        Index("ix_perguntas_pesquisa_ordem", "pesquisa_id", "ordem"),
        Index("ix_perguntas_pesquisa_tipo", "pesquisa_id", "tipo"),
    )

    def __repr__(self) -> str:
        texto_curto = self.texto[:50] + "..." if len(self.texto) > 50 else self.texto
        return f"<PerguntaPesquisa(id={self.id}, tipo={self.tipo.value}, texto='{texto_curto}')>"

    @property
    def tem_opcoes(self) -> bool:
        """Verifica se a pergunta tem opções definidas."""
        return self.opcoes is not None and len(self.opcoes) > 0

    @property
    def tem_escala(self) -> bool:
        """Verifica se a pergunta tem configuração de escala."""
        return self.escala_min is not None and self.escala_max is not None

    def validar_resposta(self, valor: Any) -> bool:
        """
        Valida se um valor de resposta é válido para esta pergunta.

        Args:
            valor: Valor da resposta a validar

        Returns:
            True se válido, False caso contrário
        """
        if self.tipo == TipoPergunta.escala_likert:
            if not isinstance(valor, (int, float)):
                return False
            if self.escala_min and valor < self.escala_min:
                return False
            if self.escala_max and valor > self.escala_max:
                return False

        elif self.tipo == TipoPergunta.multipla_escolha:
            if self.opcoes and valor not in self.opcoes:
                return False

        elif self.tipo == TipoPergunta.sim_nao:
            if valor not in (True, False, "sim", "nao", "Sim", "Não"):
                return False

        return True
