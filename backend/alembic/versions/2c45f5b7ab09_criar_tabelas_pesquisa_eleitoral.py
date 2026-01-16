"""criar_tabelas_pesquisa_eleitoral

Revision ID: 2c45f5b7ab09
Revises:
Create Date: 2026-01-16

Migration inicial que cria as tabelas do sistema de pesquisa eleitoral:
- pesquisas: Pesquisas eleitorais
- perguntas_pesquisa: Perguntas de cada pesquisa
- respostas: Respostas dos eleitores
- analises: Análises agregadas
"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "2c45f5b7ab09"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Criar tipos enum
    tipo_pesquisa_enum = postgresql.ENUM(
        "quantitativa", "qualitativa", "mista",
        name="tipo_pesquisa_enum",
        create_type=False,
    )
    tipo_pesquisa_enum.create(op.get_bind(), checkfirst=True)

    status_pesquisa_enum = postgresql.ENUM(
        "rascunho", "agendada", "executando", "pausada", "concluida", "cancelada", "erro",
        name="status_pesquisa_enum",
        create_type=False,
    )
    status_pesquisa_enum.create(op.get_bind(), checkfirst=True)

    tipo_pergunta_enum = postgresql.ENUM(
        "aberta", "aberta_longa", "escala_likert", "multipla_escolha", "sim_nao", "ranking", "numerica",
        name="tipo_pergunta_enum",
        create_type=False,
    )
    tipo_pergunta_enum.create(op.get_bind(), checkfirst=True)

    tipo_analise_enum = postgresql.ENUM(
        "completa", "estatistica", "sentimentos", "temas", "correlacoes", "parcial",
        name="tipo_analise_enum",
        create_type=False,
    )
    tipo_analise_enum.create(op.get_bind(), checkfirst=True)

    # Tabela pesquisas
    op.create_table(
        "pesquisas",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("titulo", sa.String(length=200), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=True),
        sa.Column(
            "tipo",
            postgresql.ENUM("quantitativa", "qualitativa", "mista", name="tipo_pesquisa_enum", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "status",
            postgresql.ENUM("rascunho", "agendada", "executando", "pausada", "concluida", "cancelada", "erro", name="status_pesquisa_enum", create_type=False),
            nullable=False,
        ),
        sa.Column("instrucao_geral", sa.Text(), nullable=True),
        sa.Column("iniciado_em", sa.DateTime(timezone=True), nullable=True),
        sa.Column("finalizado_em", sa.DateTime(timezone=True), nullable=True),
        sa.Column("pausado_em", sa.DateTime(timezone=True), nullable=True),
        sa.Column("total_eleitores", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("eleitores_processados", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("progresso", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("custo_estimado", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("custo_total", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("limite_custo", sa.Float(), nullable=True),
        sa.Column("tokens_entrada_total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tokens_saida_total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tokens_total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("erro_mensagem", sa.Text(), nullable=True),
        sa.Column("criado_em", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("atualizado_em", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_pesquisas")),
    )
    op.create_index(op.f("ix_pesquisas_titulo"), "pesquisas", ["titulo"], unique=False)
    op.create_index(op.f("ix_pesquisas_status"), "pesquisas", ["status"], unique=False)
    op.create_index(op.f("ix_pesquisas_finalizado_em"), "pesquisas", ["finalizado_em"], unique=False)
    op.create_index("ix_pesquisas_status_criado_em", "pesquisas", ["status", "criado_em"], unique=False)
    op.create_index("ix_pesquisas_tipo_status", "pesquisas", ["tipo", "status"], unique=False)

    # Tabela perguntas_pesquisa
    op.create_table(
        "perguntas_pesquisa",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("pesquisa_id", sa.Integer(), nullable=False),
        sa.Column("texto", sa.Text(), nullable=False),
        sa.Column(
            "tipo",
            postgresql.ENUM("aberta", "aberta_longa", "escala_likert", "multipla_escolha", "sim_nao", "ranking", "numerica", name="tipo_pergunta_enum", create_type=False),
            nullable=False,
        ),
        sa.Column("ordem", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("obrigatoria", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("opcoes", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("escala_min", sa.Integer(), nullable=True),
        sa.Column("escala_max", sa.Integer(), nullable=True),
        sa.Column("escala_rotulos", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("instrucoes_ia", sa.Text(), nullable=True),
        sa.Column("codigo", sa.String(length=50), nullable=True),
        sa.Column("criado_em", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("atualizado_em", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_perguntas_pesquisa")),
        sa.ForeignKeyConstraint(
            ["pesquisa_id"],
            ["pesquisas.id"],
            name=op.f("fk_perguntas_pesquisa_pesquisa_id_pesquisas"),
            ondelete="CASCADE",
        ),
    )
    op.create_index(op.f("ix_perguntas_pesquisa_pesquisa_id"), "perguntas_pesquisa", ["pesquisa_id"], unique=False)
    op.create_index("ix_perguntas_pesquisa_ordem", "perguntas_pesquisa", ["pesquisa_id", "ordem"], unique=False)
    op.create_index("ix_perguntas_pesquisa_tipo", "perguntas_pesquisa", ["pesquisa_id", "tipo"], unique=False)

    # Tabela respostas
    op.create_table(
        "respostas",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("pesquisa_id", sa.Integer(), nullable=False),
        sa.Column("pergunta_id", sa.Integer(), nullable=False),
        sa.Column("eleitor_id", sa.String(length=100), nullable=False),
        sa.Column("eleitor_nome", sa.String(length=200), nullable=True),
        sa.Column("resposta_texto", sa.Text(), nullable=False),
        sa.Column("resposta_valor", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("fluxo_cognitivo", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("modelo_usado", sa.String(length=100), nullable=False, server_default="claude-sonnet-4-20250514"),
        sa.Column("tokens_entrada", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tokens_saida", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("custo", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("tempo_resposta_ms", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("criado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("metadados", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_respostas")),
        sa.ForeignKeyConstraint(
            ["pesquisa_id"],
            ["pesquisas.id"],
            name=op.f("fk_respostas_pesquisa_id_pesquisas"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["pergunta_id"],
            ["perguntas_pesquisa.id"],
            name=op.f("fk_respostas_pergunta_id_perguntas_pesquisa"),
            ondelete="CASCADE",
        ),
    )
    op.create_index(op.f("ix_respostas_pesquisa_id"), "respostas", ["pesquisa_id"], unique=False)
    op.create_index(op.f("ix_respostas_pergunta_id"), "respostas", ["pergunta_id"], unique=False)
    op.create_index(op.f("ix_respostas_eleitor_id"), "respostas", ["eleitor_id"], unique=False)
    op.create_index(op.f("ix_respostas_criado_em"), "respostas", ["criado_em"], unique=False)
    op.create_index("ix_respostas_pesquisa_eleitor", "respostas", ["pesquisa_id", "eleitor_id"], unique=False)
    op.create_index("ix_respostas_pergunta_criado_em", "respostas", ["pergunta_id", "criado_em"], unique=False)
    op.create_index("ix_respostas_eleitor_criado_em", "respostas", ["eleitor_id", "criado_em"], unique=False)
    op.create_index(
        "ix_respostas_pesquisa_pergunta_eleitor",
        "respostas",
        ["pesquisa_id", "pergunta_id", "eleitor_id"],
        unique=True,
    )

    # Tabela analises
    op.create_table(
        "analises",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("pesquisa_id", sa.Integer(), nullable=False),
        sa.Column(
            "tipo",
            postgresql.ENUM("completa", "estatistica", "sentimentos", "temas", "correlacoes", "parcial", name="tipo_analise_enum", create_type=False),
            nullable=False,
        ),
        sa.Column("versao", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("titulo", sa.String(length=200), nullable=True),
        sa.Column("descricao", sa.Text(), nullable=True),
        sa.Column("estatisticas", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("sentimentos", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("temas", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("insights", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("correlacoes", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("mapa_calor", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("voto_silencioso", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("pontos_ruptura", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("metadados", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("criado_em", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_analises")),
        sa.ForeignKeyConstraint(
            ["pesquisa_id"],
            ["pesquisas.id"],
            name=op.f("fk_analises_pesquisa_id_pesquisas"),
            ondelete="CASCADE",
        ),
    )
    op.create_index(op.f("ix_analises_pesquisa_id"), "analises", ["pesquisa_id"], unique=False)
    op.create_index(op.f("ix_analises_criado_em"), "analises", ["criado_em"], unique=False)
    op.create_index("ix_analises_pesquisa_tipo", "analises", ["pesquisa_id", "tipo"], unique=False)
    op.create_index("ix_analises_pesquisa_versao", "analises", ["pesquisa_id", "versao"], unique=False)
    op.create_index("ix_analises_pesquisa_criado_em", "analises", ["pesquisa_id", "criado_em"], unique=False)


def downgrade() -> None:
    # Remover tabelas na ordem inversa (respeitando foreign keys)
    op.drop_table("analises")
    op.drop_table("respostas")
    op.drop_table("perguntas_pesquisa")
    op.drop_table("pesquisas")

    # Remover tipos enum
    op.execute("DROP TYPE IF EXISTS tipo_analise_enum")
    op.execute("DROP TYPE IF EXISTS tipo_pergunta_enum")
    op.execute("DROP TYPE IF EXISTS status_pesquisa_enum")
    op.execute("DROP TYPE IF EXISTS tipo_pesquisa_enum")
