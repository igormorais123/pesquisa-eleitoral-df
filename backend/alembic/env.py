"""
Configuração do Alembic para migrations.

Suporta modo síncrono e assíncrono para o PostgreSQL.
"""

import asyncio
import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# Adiciona o diretório backend ao path para imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importa modelos e configurações
from app.core.config import configuracoes
from app.db.base import Base

# Importa todos os modelos para registrar no metadata
from app.db.modelos import *  # noqa - Importa todos os modelos

# Objeto de configuração do Alembic
config = context.config

# Configura logging a partir do arquivo .ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata dos modelos para autogenerate
target_metadata = Base.metadata


def get_url() -> str:
    """Obtém a URL do banco de dados."""
    url = configuracoes.DATABASE_URL
    # Converte para formato asyncpg se necessário
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


def run_migrations_offline() -> None:
    """
    Executa migrations em modo 'offline'.

    Neste modo, apenas gera os comandos SQL sem conectar ao banco.
    Útil para revisar as alterações antes de aplicar.
    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Executa as migrations com a conexão fornecida."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Executa migrations em modo assíncrono."""
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_url()

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
    Executa migrations em modo 'online'.

    Conecta ao banco e aplica as alterações.
    Suporta conexão assíncrona com asyncpg.
    """
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
