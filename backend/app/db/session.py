"""
Configuração de Sessão do Banco de Dados

Gerencia conexões e sessões assíncronas com PostgreSQL.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from app.core.config import configuracoes

# Converter URL para formato assíncrono
DATABASE_URL = configuracoes.DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
)

# Engine assíncrono
engine = create_async_engine(
    DATABASE_URL,
    echo=configuracoes.AMBIENTE == "development",
    poolclass=NullPool,  # Melhor para apps web assíncronos
    future=True,
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency para injetar sessão do banco nas rotas.

    Uso:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db_optional() -> AsyncGenerator[AsyncSession | None, None]:
    """
    Dependency opcional - retorna None se o banco não estiver disponível.

    Útil para rotas que têm fallback (ex: login com usuário de teste).
    """
    # Tenta conectar ao banco
    try:
        # Testa a conexão primeiro
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception:
        # Banco não disponível - retorna None para permitir fallback
        yield None
        return

    # Se chegou aqui, banco está disponível
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager para uso fora de rotas (serviços, scripts).

    Uso:
        async with get_db_context() as db:
            result = await db.execute(...)
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def verificar_conexao() -> bool:
    """Verifica se o banco está acessível"""
    try:
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"❌ Erro ao conectar com banco: {e}")
        return False
