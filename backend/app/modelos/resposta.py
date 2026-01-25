"""
Modelo SQLAlchemy para Respostas.

Representa uma resposta individual de um eleitor a uma pergunta,
incluindo o fluxo cognitivo da IA, métricas de tokens e custos.
"""

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.modelos.base import Base

if TYPE_CHECKING:
    from app.modelos.pergunta import PerguntaPesquisa
    from app.modelos.pesquisa import Pesquisa


class Resposta(Base):
    """
    Modelo de Resposta do Eleitor.

    Armazena a resposta de um eleitor específico a uma pergunta,
    incluindo:
    - Texto e valor da resposta
    - Fluxo cognitivo (Chain of Thought) em JSON
    - Métricas de tokens de entrada/saída
    - Custo da chamada à API
    - Tempo de resposta

    Relacionamentos:
    - pesquisa: Pesquisa pai
    - pergunta: PerguntaPesquisa associada
    """

    __tablename__ = "respostas"

    # Identificador
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # Foreign Keys
    pesquisa_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("pesquisas.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    pergunta_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("perguntas_pesquisa.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Identificador do eleitor (referência externa ao JSON)
    eleitor_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    # Nome do eleitor (denormalizado para facilitar consultas)
    eleitor_nome: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
    )

    # Resposta textual
    resposta_texto: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # Valor estruturado da resposta (para escalas, múltipla escolha, etc.)
    # Pode ser: int, float, string, list, dict dependendo do tipo de pergunta
    resposta_valor: Mapped[Optional[Any]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Fluxo Cognitivo (Chain of Thought)
    # Estrutura:
    # {
    #   "atencao": {"prestaria_atencao": bool, "motivo": str},
    #   "vies": {"confirma_crencas": bool, "ameaca_valores": bool, "ativa_medos": []},
    #   "emocional": {"sentimento_dominante": str, "intensidade": int},
    #   "decisao": {"muda_intencao_voto": bool, "aumenta_cinismo": bool, ...}
    # }
    fluxo_cognitivo: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Modelo de IA usado
    modelo_usado: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="claude-sonnet-4-20250514",
    )

    # Métricas de tokens
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

    # Custo em reais
    custo: Mapped[float] = mapped_column(
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

    # Timestamp de criação
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=func.now(),
        server_default=func.now(),
        index=True,
    )

    # Metadados extras (para extensibilidade)
    metadados: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Relacionamentos
    pesquisa: Mapped["Pesquisa"] = relationship(
        "Pesquisa",
        back_populates="respostas",
    )
    pergunta: Mapped["PerguntaPesquisa"] = relationship(
        "PerguntaPesquisa",
        back_populates="respostas",
    )

    # Índices compostos para consultas otimizadas
    __table_args__ = (
        # Consultas por pesquisa e eleitor
        Index("ix_respostas_pesquisa_eleitor", "pesquisa_id", "eleitor_id"),
        # Consultas por pergunta e data
        Index("ix_respostas_pergunta_criado_em", "pergunta_id", "criado_em"),
        # Consultas por eleitor e data
        Index("ix_respostas_eleitor_criado_em", "eleitor_id", "criado_em"),
        # Consultas por pesquisa, pergunta e eleitor (unicidade lógica)
        Index(
            "ix_respostas_pesquisa_pergunta_eleitor",
            "pesquisa_id",
            "pergunta_id",
            "eleitor_id",
            unique=True,
        ),
    )

    def __repr__(self) -> str:
        texto_curto = (
            self.resposta_texto[:30] + "..."
            if len(self.resposta_texto) > 30
            else self.resposta_texto
        )
        return (
            f"<Resposta(id={self.id}, eleitor_id='{self.eleitor_id}', "
            f"texto='{texto_curto}')>"
        )

    @property
    def tokens_total(self) -> int:
        """Total de tokens usados na resposta."""
        return self.tokens_entrada + self.tokens_saida

    @property
    def sentimento_dominante(self) -> Optional[str]:
        """Extrai o sentimento dominante do fluxo cognitivo."""
        if self.fluxo_cognitivo and "emocional" in self.fluxo_cognitivo:
            return self.fluxo_cognitivo["emocional"].get("sentimento_dominante")
        return None

    @property
    def intensidade_emocional(self) -> Optional[int]:
        """Extrai a intensidade emocional do fluxo cognitivo."""
        if self.fluxo_cognitivo and "emocional" in self.fluxo_cognitivo:
            return self.fluxo_cognitivo["emocional"].get("intensidade")
        return None

    @property
    def mudaria_voto(self) -> Optional[bool]:
        """Verifica se a resposta indica mudança de intenção de voto."""
        if self.fluxo_cognitivo and "decisao" in self.fluxo_cognitivo:
            return self.fluxo_cognitivo["decisao"].get("muda_intencao_voto")
        return None
