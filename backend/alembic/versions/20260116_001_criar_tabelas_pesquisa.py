"""Criar tabelas de pesquisa eleitoral

Revision ID: 001
Revises:
Create Date: 2026-01-16

Cria as tabelas principais para persistência de pesquisas:
- pesquisas: Tabela principal de pesquisas
- perguntas_pesquisa: Perguntas de cada pesquisa
- respostas_pesquisa: Respostas individuais dos eleitores
- analises_pesquisa: Análises geradas
- metricas_globais: Métricas agregadas do sistema
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Tabela de pesquisas
    op.create_table(
        "pesquisas",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("titulo", sa.String(200), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=True),
        sa.Column("tipo", sa.String(20), nullable=False, server_default="mista"),
        sa.Column("instrucao_geral", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="rascunho"),
        sa.Column("progresso", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("erro_mensagem", sa.Text(), nullable=True),
        sa.Column("total_eleitores", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_perguntas", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_respostas", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("eleitores_processados", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("eleitores_ids", postgresql.JSON(), nullable=True),
        sa.Column("custo_estimado", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("custo_real", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("tokens_entrada_total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tokens_saida_total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("limite_custo", sa.Float(), nullable=False, server_default="100.0"),
        sa.Column("usar_opus_complexas", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("batch_size", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("iniciado_em", sa.DateTime(timezone=True), nullable=True),
        sa.Column("pausado_em", sa.DateTime(timezone=True), nullable=True),
        sa.Column("concluido_em", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_pesquisas_status", "pesquisas", ["status"])
    op.create_index("ix_pesquisas_status_criado", "pesquisas", ["status", "criado_em"])
    op.create_index("ix_pesquisas_criado_em", "pesquisas", ["criado_em"])

    # Tabela de perguntas
    op.create_table(
        "perguntas_pesquisa",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("pesquisa_id", sa.String(36), sa.ForeignKey("pesquisas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("texto", sa.Text(), nullable=False),
        sa.Column("tipo", sa.String(20), nullable=False, server_default="aberta"),
        sa.Column("ordem", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("obrigatoria", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("opcoes", postgresql.JSON(), nullable=True),
        sa.Column("escala_min", sa.Integer(), nullable=True),
        sa.Column("escala_max", sa.Integer(), nullable=True),
        sa.Column("escala_rotulos", postgresql.JSON(), nullable=True),
        sa.Column("instrucoes_ia", sa.Text(), nullable=True),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_perguntas_pesquisa_id", "perguntas_pesquisa", ["pesquisa_id"])
    op.create_index("ix_perguntas_pesquisa_ordem", "perguntas_pesquisa", ["pesquisa_id", "ordem"])

    # Tabela de respostas
    op.create_table(
        "respostas_pesquisa",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("pesquisa_id", sa.String(36), sa.ForeignKey("pesquisas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("pergunta_id", sa.String(36), sa.ForeignKey("perguntas_pesquisa.id", ondelete="CASCADE"), nullable=False),
        sa.Column("eleitor_id", sa.String(36), nullable=False),
        sa.Column("eleitor_nome", sa.String(200), nullable=False),
        sa.Column("eleitor_perfil", postgresql.JSON(), nullable=True),
        sa.Column("resposta_texto", sa.Text(), nullable=False),
        sa.Column("resposta_valor", postgresql.JSON(), nullable=True),
        sa.Column("fluxo_cognitivo", postgresql.JSON(), nullable=True),
        sa.Column("sentimento", sa.String(20), nullable=True),
        sa.Column("intensidade_sentimento", sa.Float(), nullable=True),
        sa.Column("modelo_usado", sa.String(50), nullable=False, server_default="claude-sonnet-4-20250514"),
        sa.Column("tokens_entrada", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tokens_saida", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("custo_reais", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("tempo_resposta_ms", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_respostas_pesquisa_id", "respostas_pesquisa", ["pesquisa_id"])
    op.create_index("ix_respostas_pergunta_id", "respostas_pesquisa", ["pergunta_id"])
    op.create_index("ix_respostas_eleitor_id", "respostas_pesquisa", ["eleitor_id"])
    op.create_index("ix_respostas_pesquisa_eleitor", "respostas_pesquisa", ["pesquisa_id", "eleitor_id"])
    op.create_index("ix_respostas_pesquisa_pergunta", "respostas_pesquisa", ["pesquisa_id", "pergunta_id"])
    op.create_index("ix_respostas_eleitor_criado", "respostas_pesquisa", ["eleitor_id", "criado_em"])
    op.create_index("ix_respostas_sentimento", "respostas_pesquisa", ["sentimento"])

    # Tabela de análises
    op.create_table(
        "analises_pesquisa",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("pesquisa_id", sa.String(36), sa.ForeignKey("pesquisas.id", ondelete="CASCADE"), nullable=False),
        sa.Column("tipo_analise", sa.String(50), nullable=False, server_default="completa"),
        sa.Column("versao", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("total_respostas_analisadas", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tempo_processamento_segundos", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("estatisticas", postgresql.JSON(), nullable=True),
        sa.Column("distribuicoes", postgresql.JSON(), nullable=True),
        sa.Column("correlacoes", postgresql.JSON(), nullable=True),
        sa.Column("sentimento_geral", sa.String(20), nullable=True),
        sa.Column("proporcao_sentimentos", postgresql.JSON(), nullable=True),
        sa.Column("palavras_frequentes", postgresql.JSON(), nullable=True),
        sa.Column("temas_principais", postgresql.JSON(), nullable=True),
        sa.Column("citacoes_representativas", postgresql.JSON(), nullable=True),
        sa.Column("mapa_calor_emocional", postgresql.JSON(), nullable=True),
        sa.Column("mapa_calor_regional", postgresql.JSON(), nullable=True),
        sa.Column("votos_silenciosos", postgresql.JSON(), nullable=True),
        sa.Column("pontos_ruptura", postgresql.JSON(), nullable=True),
        sa.Column("insights", postgresql.JSON(), nullable=True),
        sa.Column("conclusoes", postgresql.JSON(), nullable=True),
        sa.Column("implicacoes_politicas", postgresql.JSON(), nullable=True),
        sa.Column("criado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_analises_pesquisa_id", "analises_pesquisa", ["pesquisa_id"])
    op.create_index("ix_analises_pesquisa_tipo", "analises_pesquisa", ["pesquisa_id", "tipo_analise"])
    op.create_index("ix_analises_criado_em", "analises_pesquisa", ["criado_em"])

    # Tabela de métricas globais (singleton)
    op.create_table(
        "metricas_globais",
        sa.Column("id", sa.Integer(), primary_key=True, server_default="1"),
        sa.Column("total_pesquisas", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_pesquisas_concluidas", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_respostas", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_eleitores_unicos", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("custo_total_reais", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("tokens_entrada_total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tokens_saida_total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("media_respostas_por_pesquisa", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("media_custo_por_pesquisa", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("media_tempo_execucao_segundos", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("sentimentos_acumulados", postgresql.JSON(), nullable=True),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # Inserir registro inicial de métricas
    op.execute(
        "INSERT INTO metricas_globais (id) VALUES (1) ON CONFLICT (id) DO NOTHING"
    )


def downgrade() -> None:
    op.drop_table("metricas_globais")
    op.drop_table("analises_pesquisa")
    op.drop_table("respostas_pesquisa")
    op.drop_table("perguntas_pesquisa")
    op.drop_table("pesquisas")
