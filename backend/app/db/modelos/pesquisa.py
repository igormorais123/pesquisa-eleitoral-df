"""
Modelos de Pesquisa Eleitoral

Define as tabelas para persistência completa de pesquisas, perguntas,
respostas e análises.
"""

from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


# ============================================
# ENUMS como strings para o banco
# ============================================

class TipoPesquisaDB(str):
    QUANTITATIVA = "quantitativa"
    QUALITATIVA = "qualitativa"
    MISTA = "mista"


class StatusPesquisaDB(str):
    RASCUNHO = "rascunho"
    EXECUTANDO = "executando"
    PAUSADA = "pausada"
    CONCLUIDA = "concluida"
    ERRO = "erro"


class TipoPerguntaDB(str):
    ABERTA = "aberta"
    ABERTA_LONGA = "aberta_longa"
    ESCALA_LIKERT = "escala_likert"
    MULTIPLA_ESCOLHA = "multipla_escolha"
    SIM_NAO = "sim_nao"
    RANKING = "ranking"


# ============================================
# TABELA: PESQUISAS
# ============================================

class Pesquisa(Base):
    """
    Tabela principal de pesquisas eleitorais.

    Armazena metadados e estatísticas agregadas de cada pesquisa realizada.
    """

    __tablename__ = "pesquisas"

    # Identificação
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )

    # Informações básicas
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tipo: Mapped[str] = mapped_column(
        String(20),
        default=TipoPesquisaDB.MISTA,
        nullable=False
    )
    instrucao_geral: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Status e progresso
    status: Mapped[str] = mapped_column(
        String(20),
        default=StatusPesquisaDB.RASCUNHO,
        nullable=False,
        index=True
    )
    progresso: Mapped[int] = mapped_column(Integer, default=0)
    erro_mensagem: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Contagens
    total_eleitores: Mapped[int] = mapped_column(Integer, default=0)
    total_perguntas: Mapped[int] = mapped_column(Integer, default=0)
    total_respostas: Mapped[int] = mapped_column(Integer, default=0)
    eleitores_processados: Mapped[int] = mapped_column(Integer, default=0)

    # IDs dos eleitores (armazenados como JSON array)
    eleitores_ids: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Custos e tokens
    custo_estimado: Mapped[float] = mapped_column(Float, default=0.0)
    custo_real: Mapped[float] = mapped_column(Float, default=0.0)
    tokens_entrada_total: Mapped[int] = mapped_column(Integer, default=0)
    tokens_saida_total: Mapped[int] = mapped_column(Integer, default=0)

    # Configurações de execução
    limite_custo: Mapped[float] = mapped_column(Float, default=100.0)
    usar_opus_complexas: Mapped[bool] = mapped_column(Boolean, default=True)
    batch_size: Mapped[int] = mapped_column(Integer, default=10)

    # Timestamps
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    iniciado_em: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    pausado_em: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    concluido_em: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Relacionamentos
    perguntas: Mapped[List["PerguntaPesquisa"]] = relationship(
        "PerguntaPesquisa",
        back_populates="pesquisa",
        cascade="all, delete-orphan",
        order_by="PerguntaPesquisa.ordem"
    )
    respostas: Mapped[List["RespostaPesquisa"]] = relationship(
        "RespostaPesquisa",
        back_populates="pesquisa",
        cascade="all, delete-orphan"
    )
    analises: Mapped[List["AnalisePesquisa"]] = relationship(
        "AnalisePesquisa",
        back_populates="pesquisa",
        cascade="all, delete-orphan"
    )

    # Índices
    __table_args__ = (
        Index("ix_pesquisas_status_criado", "status", "criado_em"),
        Index("ix_pesquisas_criado_em", "criado_em"),
    )

    def __repr__(self) -> str:
        return f"<Pesquisa(id={self.id}, titulo='{self.titulo}', status={self.status})>"


# ============================================
# TABELA: PERGUNTAS DA PESQUISA
# ============================================

class PerguntaPesquisa(Base):
    """
    Tabela de perguntas de uma pesquisa.

    Cada pesquisa pode ter múltiplas perguntas, ordenadas por 'ordem'.
    """

    __tablename__ = "perguntas_pesquisa"

    # Identificação
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )
    pesquisa_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("pesquisas.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Conteúdo
    texto: Mapped[str] = mapped_column(Text, nullable=False)
    tipo: Mapped[str] = mapped_column(
        String(20),
        default=TipoPerguntaDB.ABERTA,
        nullable=False
    )
    ordem: Mapped[int] = mapped_column(Integer, default=0)
    obrigatoria: Mapped[bool] = mapped_column(Boolean, default=True)

    # Opções para múltipla escolha/likert
    opcoes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    escala_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    escala_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    escala_rotulos: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Instruções especiais para a IA
    instrucoes_ia: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relacionamentos
    pesquisa: Mapped["Pesquisa"] = relationship(
        "Pesquisa",
        back_populates="perguntas"
    )
    respostas: Mapped[List["RespostaPesquisa"]] = relationship(
        "RespostaPesquisa",
        back_populates="pergunta",
        cascade="all, delete-orphan"
    )

    # Índices
    __table_args__ = (
        Index("ix_perguntas_pesquisa_ordem", "pesquisa_id", "ordem"),
    )

    def __repr__(self) -> str:
        return f"<PerguntaPesquisa(id={self.id}, tipo={self.tipo})>"


# ============================================
# TABELA: RESPOSTAS
# ============================================

class RespostaPesquisa(Base):
    """
    Tabela de respostas individuais.

    Armazena cada resposta de cada eleitor para cada pergunta,
    incluindo o fluxo cognitivo e métricas de custo.
    """

    __tablename__ = "respostas_pesquisa"

    # Identificação
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )
    pesquisa_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("pesquisas.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    pergunta_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("perguntas_pesquisa.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Identificação do eleitor
    eleitor_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    eleitor_nome: Mapped[str] = mapped_column(String(200), nullable=False)

    # Dados do perfil do eleitor (snapshot no momento da resposta)
    eleitor_perfil: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Resposta
    resposta_texto: Mapped[str] = mapped_column(Text, nullable=False)
    resposta_valor: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Fluxo cognitivo (Chain of Thought de 4 etapas)
    fluxo_cognitivo: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Sentimento detectado
    sentimento: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    intensidade_sentimento: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Métricas de processamento
    modelo_usado: Mapped[str] = mapped_column(
        String(50),
        default="claude-sonnet-4-20250514"
    )
    tokens_entrada: Mapped[int] = mapped_column(Integer, default=0)
    tokens_saida: Mapped[int] = mapped_column(Integer, default=0)
    custo_reais: Mapped[float] = mapped_column(Float, default=0.0)
    tempo_resposta_ms: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamps
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relacionamentos
    pesquisa: Mapped["Pesquisa"] = relationship(
        "Pesquisa",
        back_populates="respostas"
    )
    pergunta: Mapped["PerguntaPesquisa"] = relationship(
        "PerguntaPesquisa",
        back_populates="respostas"
    )

    # Índices compostos para consultas frequentes
    __table_args__ = (
        Index("ix_respostas_pesquisa_eleitor", "pesquisa_id", "eleitor_id"),
        Index("ix_respostas_pesquisa_pergunta", "pesquisa_id", "pergunta_id"),
        Index("ix_respostas_eleitor_criado", "eleitor_id", "criado_em"),
        Index("ix_respostas_sentimento", "sentimento"),
    )

    def __repr__(self) -> str:
        return f"<RespostaPesquisa(id={self.id}, eleitor={self.eleitor_nome})>"


# ============================================
# TABELA: ANÁLISES
# ============================================

class AnalisePesquisa(Base):
    """
    Tabela de análises geradas.

    Armazena resultados de análises estatísticas e qualitativas
    de cada pesquisa. Pode haver múltiplas análises por pesquisa.
    """

    __tablename__ = "analises_pesquisa"

    # Identificação
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4())
    )
    pesquisa_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("pesquisas.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Tipo de análise
    tipo_analise: Mapped[str] = mapped_column(
        String(50),
        default="completa",
        nullable=False
    )
    versao: Mapped[int] = mapped_column(Integer, default=1)

    # Metadados
    total_respostas_analisadas: Mapped[int] = mapped_column(Integer, default=0)
    tempo_processamento_segundos: Mapped[float] = mapped_column(Float, default=0.0)

    # Análise estatística (JSON estruturado)
    estatisticas: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    distribuicoes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    correlacoes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Análise de sentimento
    sentimento_geral: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    proporcao_sentimentos: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Análise textual
    palavras_frequentes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    temas_principais: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    citacoes_representativas: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Mapas de calor
    mapa_calor_emocional: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    mapa_calor_regional: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Descobertas especiais
    votos_silenciosos: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    pontos_ruptura: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Insights e conclusões
    insights: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    conclusoes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    implicacoes_politicas: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Timestamps
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relacionamento
    pesquisa: Mapped["Pesquisa"] = relationship(
        "Pesquisa",
        back_populates="analises"
    )

    # Índices
    __table_args__ = (
        Index("ix_analises_pesquisa_tipo", "pesquisa_id", "tipo_analise"),
        Index("ix_analises_criado_em", "criado_em"),
    )

    def __repr__(self) -> str:
        return f"<AnalisePesquisa(id={self.id}, tipo={self.tipo_analise})>"


# ============================================
# TABELA: MÉTRICAS GLOBAIS (SINGLETON)
# ============================================

class MetricasGlobais(Base):
    """
    Tabela de métricas agregadas globais.

    Atualizada incrementalmente a cada pesquisa concluída.
    Armazena totais acumulados para o dashboard.
    """

    __tablename__ = "metricas_globais"

    # Sempre terá apenas 1 registro (singleton)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)

    # Contagens totais
    total_pesquisas: Mapped[int] = mapped_column(Integer, default=0)
    total_pesquisas_concluidas: Mapped[int] = mapped_column(Integer, default=0)
    total_respostas: Mapped[int] = mapped_column(Integer, default=0)
    total_eleitores_unicos: Mapped[int] = mapped_column(Integer, default=0)

    # Custos acumulados
    custo_total_reais: Mapped[float] = mapped_column(Float, default=0.0)
    tokens_entrada_total: Mapped[int] = mapped_column(Integer, default=0)
    tokens_saida_total: Mapped[int] = mapped_column(Integer, default=0)

    # Médias
    media_respostas_por_pesquisa: Mapped[float] = mapped_column(Float, default=0.0)
    media_custo_por_pesquisa: Mapped[float] = mapped_column(Float, default=0.0)
    media_tempo_execucao_segundos: Mapped[float] = mapped_column(Float, default=0.0)

    # Distribuição de sentimentos (acumulado)
    sentimentos_acumulados: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Última atualização
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    def __repr__(self) -> str:
        return f"<MetricasGlobais(pesquisas={self.total_pesquisas})>"
