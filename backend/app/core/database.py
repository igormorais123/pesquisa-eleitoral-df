"""
Configuração do banco de dados PostgreSQL com SQLAlchemy 2.0.

Fornece:
- Engine async para conexões com pool otimizado
- SessionLocal para gerenciamento de sessões
- Dependency para injeção no FastAPI
- Health check do banco de dados
"""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import AsyncAdaptedQueuePool, NullPool

from app.core.config import configuracoes

logger = logging.getLogger(__name__)


# Converte URL de postgresql:// para postgresql+asyncpg://
def obter_url_async(url: str) -> str:
    """Converte URL síncrona para assíncrona (asyncpg)."""
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    # Remove parâmetros SSL da URL pois asyncpg os trata via connect_args
    if "?ssl=" in url:
        url = url.split("?ssl=")[0]
    elif "&ssl=" in url:
        url = url.replace("&ssl=require", "").replace("&ssl=true", "")
    return url


def _requer_ssl() -> bool:
    """Verifica se a URL do banco requer SSL (ex: Render, Heroku)."""
    url = configuracoes.DATABASE_URL.lower()
    return "render.com" in url or "ssl=require" in url or "ssl=true" in url


# Configurações do pool baseadas no ambiente
def _obter_config_pool() -> dict:
    """Retorna configurações do pool de conexões baseadas no ambiente."""
    if configuracoes.AMBIENTE == "test":
        return {"poolclass": NullPool}

    # Configuração otimizada para produção/desenvolvimento
    return {
        "poolclass": AsyncAdaptedQueuePool,
        "pool_size": 5,  # Conexões mantidas no pool
        "max_overflow": 10,  # Conexões extras permitidas
        "pool_timeout": 30,  # Tempo máximo de espera por conexão
        "pool_recycle": 1800,  # Recicla conexões após 30 minutos
        "pool_pre_ping": True,  # Verifica conexão antes de usar
    }


# Configuração de SSL para asyncpg
def _obter_connect_args() -> dict:
    """Retorna connect_args com SSL se necessário."""
    if _requer_ssl():
        logger.info("SSL habilitado para conexão com banco de dados")
        # Usar ssl="require" para Render/Heroku
        return {"ssl": "require"}
    return {}


# Engine assíncrono para conexões com o PostgreSQL
engine = create_async_engine(
    obter_url_async(configuracoes.DATABASE_URL),
    echo=configuracoes.AMBIENTE == "development",  # Log SQL em dev
    connect_args=_obter_connect_args(),
    **_obter_config_pool(),
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


@dataclass
class HealthCheckResult:
    """Resultado do health check do banco de dados."""

    status: str  # "healthy", "unhealthy", "degraded"
    latency_ms: float
    conexoes_ativas: Optional[int] = None
    conexoes_pool: Optional[int] = None
    versao_postgres: Optional[str] = None
    erro: Optional[str] = None
    verificado_em: datetime = None

    def __post_init__(self):
        if self.verificado_em is None:
            self.verificado_em = datetime.now()

    def to_dict(self) -> dict:
        """Converte para dicionário."""
        return {
            "status": self.status,
            "latency_ms": round(self.latency_ms, 2),
            "conexoes_ativas": self.conexoes_ativas,
            "conexoes_pool": self.conexoes_pool,
            "versao_postgres": self.versao_postgres,
            "erro": self.erro,
            "verificado_em": self.verificado_em.isoformat(),
        }


async def verificar_conexao() -> bool:
    """Verifica se a conexão com o banco está funcionando."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Erro ao verificar conexão: {e}")
        return False


async def health_check() -> HealthCheckResult:
    """
    Realiza health check completo do banco de dados.

    Retorna informações sobre:
    - Status da conexão
    - Latência
    - Conexões ativas
    - Versão do PostgreSQL

    Returns:
        HealthCheckResult com status e métricas
    """
    import time

    inicio = time.perf_counter()

    try:
        async with engine.connect() as conn:
            # Query simples para medir latência
            await conn.execute(text("SELECT 1"))
            latency_ms = (time.perf_counter() - inicio) * 1000

            # Obter versão do PostgreSQL
            result = await conn.execute(text("SELECT version()"))
            versao = result.scalar()

            # Obter conexões ativas
            result = await conn.execute(
                text(
                    "SELECT count(*) FROM pg_stat_activity "
                    "WHERE datname = current_database()"
                )
            )
            conexoes_ativas = result.scalar()

            # Informações do pool
            pool = engine.pool
            conexoes_pool = pool.checkedout() if hasattr(pool, "checkedout") else None

            # Determinar status baseado na latência
            if latency_ms < 100:
                status = "healthy"
            elif latency_ms < 500:
                status = "degraded"
            else:
                status = "unhealthy"

            return HealthCheckResult(
                status=status,
                latency_ms=latency_ms,
                conexoes_ativas=conexoes_ativas,
                conexoes_pool=conexoes_pool,
                versao_postgres=versao,
            )

    except Exception as e:
        latency_ms = (time.perf_counter() - inicio) * 1000
        logger.error(f"Health check falhou: {e}")
        return HealthCheckResult(
            status="unhealthy",
            latency_ms=latency_ms,
            erro=str(e),
        )


async def fechar_conexoes():
    """Fecha todas as conexões do pool."""
    await engine.dispose()
    logger.info("Pool de conexões fechado")


# Eventos de ciclo de vida para FastAPI
@asynccontextmanager
async def lifespan_db():
    """
    Context manager para ciclo de vida do banco no FastAPI.

    Uso no main.py:
        @asynccontextmanager
        async def lifespan(app: FastAPI):
            async with lifespan_db():
                yield
    """
    logger.info("Iniciando conexão com banco de dados...")
    try:
        # Verificar conexão inicial
        if await verificar_conexao():
            logger.info("Conexão com banco de dados estabelecida")
        else:
            logger.warning("Banco de dados não disponível no momento")
        yield
    finally:
        await fechar_conexoes()
        logger.info("Conexões com banco de dados encerradas")
