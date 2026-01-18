"""criar_tabelas_podc

Revision ID: 20260118_001
Revises: 20260116_003_implementar_rls
Create Date: 2026-01-18

Cria as tabelas para o sistema de pesquisas PODC (Planejar, Organizar, Dirigir, Controlar):
- pesquisas_podc: Pesquisas sobre funcoes administrativas de gestores
- respostas_podc: Respostas individuais de cada gestor
- estatisticas_podc: Estatisticas agregadas para analise
"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260118_001"
down_revision: Union[str, Sequence[str], None] = "20260116_003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Tabela pesquisas_podc
    op.create_table(
        "pesquisas_podc",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("usuario_id", sa.String(36), nullable=False, index=True),
        sa.Column("titulo", sa.String(255), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="pendente"),
        sa.Column("total_gestores", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_respostas", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("perguntas", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("gestores_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("custo_total", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("tokens_total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("criado_em", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("atualizado_em", sa.DateTime(), nullable=True),
        sa.Column("iniciado_em", sa.DateTime(), nullable=True),
        sa.Column("finalizado_em", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_pesquisas_podc_usuario_id", "pesquisas_podc", ["usuario_id"])
    op.create_index("ix_pesquisas_podc_status", "pesquisas_podc", ["status"])
    op.create_index("ix_pesquisas_podc_criado_em", "pesquisas_podc", ["criado_em"])

    # Tabela respostas_podc
    op.create_table(
        "respostas_podc",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("pesquisa_id", sa.String(36), sa.ForeignKey("pesquisas_podc.id", ondelete="CASCADE"), nullable=False),
        # Informacoes do gestor
        sa.Column("gestor_id", sa.String(36), nullable=False),
        sa.Column("gestor_nome", sa.String(255), nullable=False),
        sa.Column("gestor_setor", sa.String(20), nullable=False),  # publico, privado
        sa.Column("gestor_nivel", sa.String(20), nullable=False),  # estrategico, tatico, operacional
        sa.Column("gestor_cargo", sa.String(255), nullable=True),
        sa.Column("gestor_instituicao", sa.String(255), nullable=True),
        # Distribuicao PODC (percentuais)
        sa.Column("podc_planejar", sa.Float(), nullable=True),
        sa.Column("podc_organizar", sa.Float(), nullable=True),
        sa.Column("podc_dirigir", sa.Float(), nullable=True),
        sa.Column("podc_controlar", sa.Float(), nullable=True),
        # Distribuicao PODC Ideal
        sa.Column("podc_ideal_planejar", sa.Float(), nullable=True),
        sa.Column("podc_ideal_organizar", sa.Float(), nullable=True),
        sa.Column("podc_ideal_dirigir", sa.Float(), nullable=True),
        sa.Column("podc_ideal_controlar", sa.Float(), nullable=True),
        # Horas semanais
        sa.Column("horas_total", sa.Float(), nullable=True),
        sa.Column("horas_planejar", sa.Float(), nullable=True),
        sa.Column("horas_organizar", sa.Float(), nullable=True),
        sa.Column("horas_dirigir", sa.Float(), nullable=True),
        sa.Column("horas_controlar", sa.Float(), nullable=True),
        # IAD
        sa.Column("iad", sa.Float(), nullable=True),
        sa.Column("iad_classificacao", sa.String(50), nullable=True),
        # Dados adicionais (JSON)
        sa.Column("ranking_importancia", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("fatores_limitantes", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("justificativa", sa.Text(), nullable=True),
        sa.Column("frequencia_atividades", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("respostas_perguntas", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("resposta_bruta", sa.Text(), nullable=True),
        # Metricas
        sa.Column("tokens_input", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tokens_output", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("custo_reais", sa.Float(), nullable=False, server_default="0.0"),
        # Status e timestamps
        sa.Column("status", sa.String(20), nullable=False, server_default="pendente"),
        sa.Column("erro", sa.Text(), nullable=True),
        sa.Column("criado_em", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("processado_em", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_respostas_podc_pesquisa_id", "respostas_podc", ["pesquisa_id"])
    op.create_index("ix_respostas_podc_gestor_id", "respostas_podc", ["gestor_id"])
    op.create_index("ix_respostas_podc_gestor_setor", "respostas_podc", ["gestor_setor"])
    op.create_index("ix_respostas_podc_gestor_nivel", "respostas_podc", ["gestor_nivel"])
    op.create_index("ix_respostas_podc_criado_em", "respostas_podc", ["criado_em"])
    op.create_index(
        "ix_respostas_podc_pesquisa_gestor",
        "respostas_podc",
        ["pesquisa_id", "gestor_id"],
        unique=True
    )

    # Tabela estatisticas_podc
    op.create_table(
        "estatisticas_podc",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("pesquisa_id", sa.String(36), sa.ForeignKey("pesquisas_podc.id", ondelete="CASCADE"), nullable=False),
        sa.Column("grupo_tipo", sa.String(20), nullable=False),  # geral, setor, nivel
        sa.Column("grupo_valor", sa.String(50), nullable=True),
        sa.Column("total_respostas", sa.Integer(), nullable=False, server_default="0"),
        # Medias PODC
        sa.Column("media_planejar", sa.Float(), nullable=True),
        sa.Column("media_organizar", sa.Float(), nullable=True),
        sa.Column("media_dirigir", sa.Float(), nullable=True),
        sa.Column("media_controlar", sa.Float(), nullable=True),
        # Desvio padrao PODC
        sa.Column("dp_planejar", sa.Float(), nullable=True),
        sa.Column("dp_organizar", sa.Float(), nullable=True),
        sa.Column("dp_dirigir", sa.Float(), nullable=True),
        sa.Column("dp_controlar", sa.Float(), nullable=True),
        # IAD agregado
        sa.Column("media_iad", sa.Float(), nullable=True),
        sa.Column("dp_iad", sa.Float(), nullable=True),
        # Horas
        sa.Column("media_horas_total", sa.Float(), nullable=True),
        sa.Column("calculado_em", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_estatisticas_podc_pesquisa_id", "estatisticas_podc", ["pesquisa_id"])
    op.create_index("ix_estatisticas_podc_grupo", "estatisticas_podc", ["grupo_tipo", "grupo_valor"])


def downgrade() -> None:
    op.drop_table("estatisticas_podc")
    op.drop_table("respostas_podc")
    op.drop_table("pesquisas_podc")
