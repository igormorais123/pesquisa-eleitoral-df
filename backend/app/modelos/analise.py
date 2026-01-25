"""
Modelo SQLAlchemy para Análises de Pesquisa.

Representa uma análise agregada dos resultados de uma pesquisa,
incluindo estatísticas, sentimentos, temas e insights.
"""

from datetime import datetime
from enum import Enum as PyEnum
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import (
    DateTime,
    Enum,
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
    from app.modelos.pesquisa import Pesquisa


class TipoAnalise(str, PyEnum):
    """Tipo de análise realizada."""

    completa = "completa"  # Análise completa com todos os componentes
    estatistica = "estatistica"  # Apenas estatísticas descritivas
    sentimentos = "sentimentos"  # Análise de sentimentos
    temas = "temas"  # Extração de temas/tópicos
    correlacoes = "correlacoes"  # Análise de correlações
    parcial = "parcial"  # Análise parcial durante execução


class Analise(Base):
    """
    Modelo de Análise de Pesquisa.

    Armazena resultados agregados e análises de uma pesquisa,
    incluindo:
    - Estatísticas descritivas (médias, distribuições, etc.)
    - Análise de sentimentos (positivo, negativo, neutro)
    - Temas e tópicos identificados
    - Insights e descobertas

    Relacionamentos:
    - pesquisa: Pesquisa analisada
    """

    __tablename__ = "analises"

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

    # Tipo de análise
    tipo: Mapped[TipoAnalise] = mapped_column(
        Enum(TipoAnalise, name="tipo_analise_enum"),
        nullable=False,
        default=TipoAnalise.completa,
    )

    # Versão da análise (para reprocessamentos)
    versao: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    # Título/descrição da análise
    titulo: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
    )
    descricao: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # Estatísticas descritivas
    # Estrutura:
    # {
    #   "total_respostas": int,
    #   "total_eleitores": int,
    #   "taxa_resposta": float,
    #   "distribuicoes": {...},
    #   "medias": {...},
    #   "desvios_padrao": {...}
    # }
    estatisticas: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Análise de sentimentos
    # Estrutura:
    # {
    #   "geral": {"positivo": float, "negativo": float, "neutro": float},
    #   "por_pergunta": {...},
    #   "por_cluster": {...},
    #   "evolucao": [...]
    # }
    sentimentos: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Temas e tópicos identificados
    # Estrutura:
    # {
    #   "principais": [{"tema": str, "frequencia": int, "sentimento": str}],
    #   "nuvem_palavras": [{"palavra": str, "peso": int}],
    #   "citacoes_relevantes": [...]
    # }
    temas: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Insights e descobertas
    # Estrutura:
    # {
    #   "principais": [{"tipo": str, "texto": str, "confianca": float}],
    #   "anomalias": [...],
    #   "correlacoes_fortes": [...],
    #   "segmentos_destaque": [...]
    # }
    insights: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Correlações entre variáveis
    # Estrutura:
    # {
    #   "matriz": [[float]],
    #   "variaveis": [str],
    #   "significativas": [{"var1": str, "var2": str, "coef": float}]
    # }
    correlacoes: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Mapa de calor emocional
    # Estrutura:
    # {
    #   "dados": [[{"x": str, "y": str, "valor": float}]],
    #   "escala": {"min": float, "max": float}
    # }
    mapa_calor: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Análise de votos silenciosos
    voto_silencioso: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Pontos de ruptura identificados
    pontos_ruptura: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Metadados da análise
    # Estrutura:
    # {
    #   "modelo_ia": str,
    #   "tempo_processamento_ms": int,
    #   "tokens_usados": int,
    #   "parametros": {...}
    # }
    metadados: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Timestamp de criação
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=func.now(),
        server_default=func.now(),
        index=True,
    )

    # Relacionamentos
    pesquisa: Mapped["Pesquisa"] = relationship(
        "Pesquisa",
        back_populates="analises",
    )

    # Índices compostos
    __table_args__ = (
        # Consultas por pesquisa e tipo
        Index("ix_analises_pesquisa_tipo", "pesquisa_id", "tipo"),
        # Consultas por pesquisa e versão
        Index("ix_analises_pesquisa_versao", "pesquisa_id", "versao"),
        # Última análise por pesquisa
        Index("ix_analises_pesquisa_criado_em", "pesquisa_id", "criado_em"),
    )

    def __repr__(self) -> str:
        return (
            f"<Analise(id={self.id}, pesquisa_id={self.pesquisa_id}, "
            f"tipo={self.tipo.value}, versao={self.versao})>"
        )

    @property
    def total_respostas(self) -> Optional[int]:
        """Retorna o total de respostas analisadas."""
        if self.estatisticas:
            return self.estatisticas.get("total_respostas")
        return None

    @property
    def sentimento_geral(self) -> Optional[dict[str, float]]:
        """Retorna o sentimento geral da pesquisa."""
        if self.sentimentos:
            return self.sentimentos.get("geral")
        return None

    @property
    def temas_principais(self) -> Optional[list[dict[str, Any]]]:
        """Retorna os temas principais identificados."""
        if self.temas:
            return self.temas.get("principais")
        return None

    @property
    def insights_principais(self) -> Optional[list[dict[str, Any]]]:
        """Retorna os insights principais."""
        if self.insights:
            return self.insights.get("principais")
        return None

    def obter_correlacoes_significativas(
        self, limiar: float = 0.5
    ) -> list[dict[str, Any]]:
        """
        Retorna correlações acima de um limiar de significância.

        Args:
            limiar: Valor mínimo absoluto de correlação

        Returns:
            Lista de correlações significativas
        """
        if not self.correlacoes or "significativas" not in self.correlacoes:
            return []

        return [
            corr
            for corr in self.correlacoes["significativas"]
            if abs(corr.get("coef", 0)) >= limiar
        ]
