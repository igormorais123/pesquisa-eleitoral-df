"""Criar tabelas de memórias e uso_api

Revision ID: 20260116_002
Revises: 20260116_001
Create Date: 2026-01-16

Tabelas criadas:
- memorias: Armazena histórico completo de entrevistas por eleitor
- uso_api: Estatísticas de uso da API por período
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "20260116_002"
down_revision = "2c45f5b7ab09"  # Corrigido: referencia a migration principal
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Tabela de Memórias
    op.create_table(
        "memorias",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column(
            "tipo",
            sa.String(length=50),
            nullable=False,
            server_default="entrevista",
        ),
        sa.Column("pesquisa_id", sa.Integer(), nullable=True),
        sa.Column("pergunta_id", sa.Integer(), nullable=True),
        sa.Column("resposta_id", sa.Integer(), nullable=True),
        sa.Column("eleitor_id", sa.String(length=100), nullable=False),
        sa.Column("eleitor_nome", sa.String(length=200), nullable=True),
        sa.Column("usuario_id", sa.Integer(), nullable=True),
        sa.Column("usuario_nome", sa.String(length=200), nullable=True),
        sa.Column("pergunta_texto", sa.Text(), nullable=True),
        sa.Column("resposta_texto", sa.Text(), nullable=False),
        sa.Column("resposta_valor", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("fluxo_cognitivo", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "modelo_usado",
            sa.String(length=100),
            nullable=False,
            server_default="claude-sonnet-4-5-20250929",
        ),
        sa.Column("tokens_entrada", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tokens_saida", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tokens_total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("custo", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("tempo_resposta_ms", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("contexto", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("metadados", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "criado_em",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_memorias")),
    )

    # Índices para memórias
    op.create_index("ix_memorias_tipo", "memorias", ["tipo"], unique=False)
    op.create_index("ix_memorias_eleitor_id", "memorias", ["eleitor_id"], unique=False)
    op.create_index("ix_memorias_pesquisa_id", "memorias", ["pesquisa_id"], unique=False)
    op.create_index("ix_memorias_pergunta_id", "memorias", ["pergunta_id"], unique=False)
    op.create_index("ix_memorias_resposta_id", "memorias", ["resposta_id"], unique=False)
    op.create_index("ix_memorias_usuario_id", "memorias", ["usuario_id"], unique=False)
    op.create_index(
        "ix_memorias_eleitor_criado_em",
        "memorias",
        ["eleitor_id", "criado_em"],
        unique=False,
    )
    op.create_index(
        "ix_memorias_usuario_criado_em",
        "memorias",
        ["usuario_id", "criado_em"],
        unique=False,
    )
    op.create_index(
        "ix_memorias_pesquisa_criado_em",
        "memorias",
        ["pesquisa_id", "criado_em"],
        unique=False,
    )
    op.create_index(
        "ix_memorias_tipo_criado_em",
        "memorias",
        ["tipo", "criado_em"],
        unique=False,
    )
    op.create_index(
        "ix_memorias_modelo_criado_em",
        "memorias",
        ["modelo_usado", "criado_em"],
        unique=False,
    )

    # Tabela de Uso da API
    op.create_table(
        "uso_api",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("periodo", sa.String(length=20), nullable=False),
        sa.Column(
            "tipo_periodo",
            sa.String(length=20),
            nullable=False,
            server_default="dia",
        ),
        sa.Column("usuario_id", sa.Integer(), nullable=True),
        sa.Column("total_chamadas", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_pesquisas", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "total_eleitores_unicos", sa.Integer(), nullable=False, server_default="0"
        ),
        sa.Column(
            "tokens_entrada_total", sa.Integer(), nullable=False, server_default="0"
        ),
        sa.Column(
            "tokens_saida_total", sa.Integer(), nullable=False, server_default="0"
        ),
        sa.Column("tokens_total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("custo_total", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("chamadas_opus", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("chamadas_sonnet", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tokens_opus", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tokens_sonnet", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("custo_opus", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("custo_sonnet", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column(
            "tempo_resposta_medio_ms", sa.Integer(), nullable=False, server_default="0"
        ),
        sa.Column(
            "criado_em",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("atualizado_em", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_uso_api")),
    )

    # Índices para uso_api
    op.create_index("ix_uso_api_periodo", "uso_api", ["periodo"], unique=False)
    op.create_index("ix_uso_api_usuario_id", "uso_api", ["usuario_id"], unique=False)
    op.create_index(
        "ix_uso_api_periodo_usuario",
        "uso_api",
        ["periodo", "usuario_id"],
        unique=True,
    )
    op.create_index(
        "ix_uso_api_tipo_periodo",
        "uso_api",
        ["tipo_periodo", "periodo"],
        unique=False,
    )


def downgrade() -> None:
    # Remover tabela uso_api
    op.drop_index("ix_uso_api_tipo_periodo", table_name="uso_api")
    op.drop_index("ix_uso_api_periodo_usuario", table_name="uso_api")
    op.drop_index("ix_uso_api_usuario_id", table_name="uso_api")
    op.drop_index("ix_uso_api_periodo", table_name="uso_api")
    op.drop_table("uso_api")

    # Remover tabela memorias
    op.drop_index("ix_memorias_modelo_criado_em", table_name="memorias")
    op.drop_index("ix_memorias_tipo_criado_em", table_name="memorias")
    op.drop_index("ix_memorias_pesquisa_criado_em", table_name="memorias")
    op.drop_index("ix_memorias_usuario_criado_em", table_name="memorias")
    op.drop_index("ix_memorias_eleitor_criado_em", table_name="memorias")
    op.drop_index("ix_memorias_usuario_id", table_name="memorias")
    op.drop_index("ix_memorias_resposta_id", table_name="memorias")
    op.drop_index("ix_memorias_pergunta_id", table_name="memorias")
    op.drop_index("ix_memorias_pesquisa_id", table_name="memorias")
    op.drop_index("ix_memorias_eleitor_id", table_name="memorias")
    op.drop_index("ix_memorias_tipo", table_name="memorias")
    op.drop_table("memorias")
