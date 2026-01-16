"""
Configuração do ambiente Alembic

Carrega modelos e configurações para rodar migrations.
"""

import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Carregar configurações da aplicação
import sys
from pathlib import Path

# Adicionar diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import configuracoes
from app.db.base import Base
from app.db.modelos import *  # noqa - Importa todos os modelos

# Configuração do Alembic
config = context.config

# Interpretar arquivo de config para logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata dos modelos para autogenerate
target_metadata = Base.metadata

# URL do banco de dados
DATABASE_URL = configuracoes.DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
)


def run_migrations_offline() -> None:
    """
    Rodar migrations em modo 'offline'.

    Gera SQL sem conectar ao banco.
    """
    url = DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Executa migrations com a conexão fornecida."""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """
    Rodar migrations em modo assíncrono.

    Cria engine, conecta e executa migrations.
    """
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = DATABASE_URL

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """
    Rodar migrations em modo 'online'.

    Conecta ao banco e executa migrations.
    """
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
