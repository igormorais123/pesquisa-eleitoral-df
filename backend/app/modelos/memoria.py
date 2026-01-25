"""
Modelo SQLAlchemy para Memórias de Entrevistas.

Armazena o histórico completo de todas as entrevistas realizadas por eleitor,
garantindo que nenhum dado seja perdido e possibilitando analytics globais.
"""

from datetime import datetime
from enum import Enum as PyEnum
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

from app.modelos.base import Base, TimestampMixin


class TipoMemoria(str, PyEnum):
    """Tipo de memória armazenada."""

    entrevista = "entrevista"  # Resposta de entrevista
    interacao = "interacao"   # Interação geral com eleitor
    analise = "analise"       # Análise gerada sobre eleitor


class Memoria(Base, TimestampMixin):
    """
    Modelo de Memória de Entrevista.

    Armazena cada interação/resposta de forma permanente para:
    - Histórico completo por eleitor
    - Analytics globais de tokens e custos
    - Auditoria de uso da API
    - Consultas futuras e relatórios

    Cada registro é imutável após criação - nunca deletar dados de pesquisa.
    """

    __tablename__ = "memorias"

    # Identificador
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # Tipo de memória
    tipo: Mapped[TipoMemoria] = mapped_column(
        String(50),
        nullable=False,
        default=TipoMemoria.entrevista,
        index=True,
    )

    # Referências (não FKs para flexibilidade - dados podem vir de JSON)
    pesquisa_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )
    pergunta_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )
    resposta_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )

    # Identificador do eleitor
    eleitor_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    eleitor_nome: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
    )

    # Usuário que executou (para multi-usuário futuro)
    usuario_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )
    usuario_nome: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
    )

    # Conteúdo da memória
    pergunta_texto: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    resposta_texto: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    resposta_valor: Mapped[Optional[Any]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Fluxo cognitivo completo (Chain of Thought)
    fluxo_cognitivo: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Modelo de IA usado
    modelo_usado: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="claude-sonnet-4-5-20250929",
    )

    # === MÉTRICAS DE TOKENS (CRÍTICO PARA ANALYTICS) ===
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

    # Contexto adicional (perfil do eleitor usado, configurações, etc.)
    contexto: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Metadados extras (versão do prompt, flags, etc.)
    metadados: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Índices compostos para consultas otimizadas
    __table_args__ = (
        # Histórico por eleitor
        Index("ix_memorias_eleitor_criado_em", "eleitor_id", "criado_em"),
        # Por usuário (multi-tenant)
        Index("ix_memorias_usuario_criado_em", "usuario_id", "criado_em"),
        # Por pesquisa
        Index("ix_memorias_pesquisa_criado_em", "pesquisa_id", "criado_em"),
        # Para analytics de custo
        Index("ix_memorias_tipo_criado_em", "tipo", "criado_em"),
        # Busca por modelo usado
        Index("ix_memorias_modelo_criado_em", "modelo_usado", "criado_em"),
    )

    def __repr__(self) -> str:
        texto_curto = (
            self.resposta_texto[:30] + "..."
            if len(self.resposta_texto) > 30
            else self.resposta_texto
        )
        return (
            f"<Memoria(id={self.id}, eleitor='{self.eleitor_id}', "
            f"tipo={self.tipo}, texto='{texto_curto}')>"
        )

    @property
    def custo_por_token(self) -> float:
        """Custo médio por token."""
        if self.tokens_total > 0:
            return self.custo / self.tokens_total
        return 0.0

    @property
    def sentimento_dominante(self) -> Optional[str]:
        """Extrai o sentimento dominante do fluxo cognitivo."""
        if self.fluxo_cognitivo:
            emocional = self.fluxo_cognitivo.get("emocional") or \
                        self.fluxo_cognitivo.get("raciocinio", {}).get("emocional")
            if emocional:
                return emocional.get("sentimento_primario") or \
                       emocional.get("sentimento_dominante")
        return None


class UsoAPI(Base, TimestampMixin):
    """
    Modelo de Uso da API para Analytics Globais.

    Agrega estatísticas de uso por período para dashboards e relatórios.
    Atualizado incrementalmente a cada chamada à API.
    """

    __tablename__ = "uso_api"

    # Identificador
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    # Período (para agregação)
    periodo: Mapped[str] = mapped_column(
        String(20),  # Formato: 2026-01-16 ou 2026-W03 ou 2026-01
        nullable=False,
        index=True,
    )
    tipo_periodo: Mapped[str] = mapped_column(
        String(20),  # dia, semana, mes
        nullable=False,
        default="dia",
    )

    # Usuário (null = agregado de todos)
    usuario_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        index=True,
    )

    # Contadores
    total_chamadas: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    total_pesquisas: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    total_eleitores_unicos: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # Tokens
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

    # Custo
    custo_total: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    # Por modelo
    chamadas_opus: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    chamadas_sonnet: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    tokens_opus: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    tokens_sonnet: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    custo_opus: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )
    custo_sonnet: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    # Tempo médio de resposta
    tempo_resposta_medio_ms: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # Índices compostos
    __table_args__ = (
        Index("ix_uso_api_periodo_usuario", "periodo", "usuario_id", unique=True),
        Index("ix_uso_api_tipo_periodo", "tipo_periodo", "periodo"),
    )

    def __repr__(self) -> str:
        return (
            f"<UsoAPI(periodo='{self.periodo}', "
            f"chamadas={self.total_chamadas}, custo={self.custo_total:.2f})>"
        )

    @property
    def custo_medio_por_chamada(self) -> float:
        """Custo médio por chamada à API."""
        if self.total_chamadas > 0:
            return self.custo_total / self.total_chamadas
        return 0.0

    @property
    def tokens_medio_por_chamada(self) -> float:
        """Tokens médios por chamada."""
        if self.total_chamadas > 0:
            return self.tokens_total / self.total_chamadas
        return 0.0
