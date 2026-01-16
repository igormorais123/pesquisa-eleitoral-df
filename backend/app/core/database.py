"""
Configuração do banco de dados PostgreSQL com SQLAlchemy 2.0.

Fornece:
- Engine async para conexões
- SessionLocal para gerenciamento de sessões
- Dependency para injeção no FastAPI
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from app.core.config import configuracoes


# Converte URL de postgresql:// para postgresql+asyncpg://
def obter_url_async(url: str) -> str:
    """Converte URL síncrona para assíncrona (asyncpg)."""
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


# Engine assíncrono para conexões com o PostgreSQL
engine = create_async_engine(
    obter_url_async(configuracoes.DATABASE_URL),
    echo=configuracoes.AMBIENTE == "development",  # Log SQL em dev
    pool_pre_ping=True,  # Verifica conexão antes de usar
    poolclass=NullPool if configuracoes.AMBIENTE == "test" else None,
)

# Factory de sessões assíncronas
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def obter_sessao() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency do FastAPI para obter sessão do banco.

    Uso:
        @router.get("/exemplo")
        async def exemplo(db: AsyncSession = Depends(obter_sessao)):
            ...
    """
    async with SessionLocal() as sessao:
        try:
            yield sessao
            await sessao.commit()
        except Exception:
            await sessao.rollback()
            raise


@asynccontextmanager
async def obter_sessao_contexto() -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager para uso fora do FastAPI.

    Uso:
        async with obter_sessao_contexto() as db:
            resultado = await db.execute(select(Modelo))
    """
    async with SessionLocal() as sessao:
        try:
            yield sessao
            await sessao.commit()
        except Exception:
            await sessao.rollback()
            raise


async def criar_tabelas():
    """
    Cria todas as tabelas no banco de dados.

    Útil para desenvolvimento e testes.
    Em produção, use Alembic para migrations.
    """
    from app.modelos.base import Base

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def dropar_tabelas():
    """
    Remove todas as tabelas do banco de dados.

    CUIDADO: Use apenas em desenvolvimento/testes!
    """
    from app.modelos.base import Base

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def verificar_conexao() -> bool:
    """Verifica se a conexão com o banco está funcionando."""
    try:
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
        return True
    except Exception:
        return False
