"""criar_tabelas_whatsapp

Revision ID: 20260131_001
Revises: 20260118_001
Create Date: 2026-01-31

Cria as 3 tabelas do sistema WhatsApp do Oraculo Eleitoral:
- contatos_whatsapp: Contatos autorizados (clientes, cabos, candidatos)
- conversas_whatsapp: Sessoes de conversa com thread_id para LangGraph
- mensagens_whatsapp: Mensagens trocadas com metricas de custo/tokens
"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260131_001"
down_revision: Union[str, Sequence[str], None] = "20260118_001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # === contatos_whatsapp ===
    op.create_table(
        "contatos_whatsapp",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column(
            "telefone",
            sa.String(20),
            nullable=False,
            comment="Formato E.164: +5561999999999",
        ),
        sa.Column("nome", sa.String(200), nullable=False),
        sa.Column(
            "tipo",
            sa.String(30),
            nullable=False,
            server_default="cliente",
            comment="cliente | cabo_eleitoral | candidato",
        ),
        sa.Column(
            "plano",
            sa.String(30),
            nullable=False,
            server_default="consultor",
            comment="consultor | estrategista | war_room",
        ),
        sa.Column(
            "pin_hash",
            sa.String(200),
            nullable=True,
            comment="bcrypt hash do PIN de acesso",
        ),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "opt_in_em",
            sa.DateTime(timezone=True),
            nullable=True,
            comment="Timestamp do consentimento LGPD/eleitoral",
        ),
        sa.Column(
            "metadata_extra",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            comment="Dados extras: regiao, cargo alvo, cliente_de, etc.",
        ),
        sa.Column("ultimo_acesso", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "criado_em",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "atualizado_em",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_contatos_whatsapp")),
        sa.UniqueConstraint("telefone", name=op.f("uq_contatos_whatsapp_telefone")),
    )
    op.create_index(
        op.f("ix_contatos_whatsapp_telefone"),
        "contatos_whatsapp",
        ["telefone"],
        unique=True,
    )

    # === conversas_whatsapp ===
    op.create_table(
        "conversas_whatsapp",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("contato_id", sa.Integer(), nullable=False),
        sa.Column(
            "thread_id",
            sa.String(100),
            nullable=False,
            comment="UUID para LangGraph checkpointer",
        ),
        sa.Column(
            "status",
            sa.String(20),
            nullable=False,
            server_default="ativa",
            comment="ativa | encerrada | pausada",
        ),
        sa.Column(
            "contexto",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            comment="Estado atual da conversa (ultimo agente, topico, etc.)",
        ),
        sa.Column(
            "total_mensagens", sa.Integer(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "total_tokens", sa.Integer(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "custo_total", sa.Float(), nullable=False, server_default=sa.text("0.0")
        ),
        sa.Column(
            "criado_em",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "atualizado_em",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["contato_id"],
            ["contatos_whatsapp.id"],
            name=op.f("fk_conversas_whatsapp_contato_id_contatos_whatsapp"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_conversas_whatsapp")),
        sa.UniqueConstraint("thread_id", name=op.f("uq_conversas_whatsapp_thread_id")),
    )
    op.create_index(
        op.f("ix_conversas_whatsapp_contato_id"),
        "conversas_whatsapp",
        ["contato_id"],
    )
    op.create_index(
        op.f("ix_conversas_whatsapp_thread_id"),
        "conversas_whatsapp",
        ["thread_id"],
        unique=True,
    )

    # === mensagens_whatsapp ===
    op.create_table(
        "mensagens_whatsapp",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("conversa_id", sa.Integer(), nullable=False),
        sa.Column("contato_id", sa.Integer(), nullable=False),
        sa.Column(
            "direcao",
            sa.String(10),
            nullable=False,
            comment="entrada | saida",
        ),
        sa.Column(
            "tipo",
            sa.String(20),
            nullable=False,
            server_default="texto",
            comment="texto | audio | imagem | documento | localizacao",
        ),
        sa.Column(
            "conteudo",
            sa.Text(),
            nullable=True,
            comment="Texto da mensagem ou transcricao de audio",
        ),
        sa.Column(
            "media_url",
            sa.String(500),
            nullable=True,
            comment="URL da midia no Meta Cloud",
        ),
        sa.Column(
            "whatsapp_msg_id",
            sa.String(100),
            nullable=True,
            comment="ID da mensagem no WhatsApp (wamid.*)",
        ),
        sa.Column(
            "status_entrega",
            sa.String(20),
            nullable=False,
            server_default="enviada",
            comment="enviada | entregue | lida | erro",
        ),
        sa.Column(
            "agente_usado",
            sa.String(50),
            nullable=True,
            comment="Nome do agente LangGraph que processou",
        ),
        sa.Column(
            "tokens_entrada", sa.Integer(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "tokens_saida", sa.Integer(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column("custo", sa.Float(), nullable=False, server_default=sa.text("0.0")),
        sa.Column(
            "tempo_resposta_ms",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
            comment="Tempo de processamento em milissegundos",
        ),
        sa.Column(
            "metadata_extra",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            comment="Dados extras: erro, retry_count, etc.",
        ),
        sa.Column(
            "criado_em",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["conversa_id"],
            ["conversas_whatsapp.id"],
            name=op.f("fk_mensagens_whatsapp_conversa_id_conversas_whatsapp"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["contato_id"],
            ["contatos_whatsapp.id"],
            name=op.f("fk_mensagens_whatsapp_contato_id_contatos_whatsapp"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_mensagens_whatsapp")),
    )
    op.create_index(
        op.f("ix_mensagens_whatsapp_conversa_id"),
        "mensagens_whatsapp",
        ["conversa_id"],
    )
    op.create_index(
        op.f("ix_mensagens_whatsapp_contato_id"),
        "mensagens_whatsapp",
        ["contato_id"],
    )
    op.create_index(
        op.f("ix_mensagens_whatsapp_whatsapp_msg_id"),
        "mensagens_whatsapp",
        ["whatsapp_msg_id"],
    )


def downgrade() -> None:
    op.drop_table("mensagens_whatsapp")
    op.drop_table("conversas_whatsapp")
    op.drop_table("contatos_whatsapp")
