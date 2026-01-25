"""
Middleware de Row Level Security (RLS) para PostgreSQL.

Este módulo fornece funções e dependências para configurar o contexto
de segurança do PostgreSQL (RLS) em cada requisição autenticada.

Funcionalidades:
- Setar variáveis de sessão (user_id, role) para políticas RLS
- Bypass para operações de sistema/serviço
- Context managers para uso fora de rotas
- Validação de contexto de segurança
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal, engine

logger = logging.getLogger(__name__)


class RLSContext:
    """
    Contexto de segurança para Row Level Security.

    Armazena informações do usuário atual para serem aplicadas
    nas variáveis de sessão do PostgreSQL.
    """

    def __init__(
        self,
        user_id: Optional[str] = None,
        user_role: Optional[str] = None,
        bypass_rls: bool = False,
    ):
        self.user_id = user_id or ""
        self.user_role = user_role or ""
        self.bypass_rls = bypass_rls

    @classmethod
    def from_user(cls, user) -> "RLSContext":
        """Cria contexto a partir de um objeto Usuario."""
        if user is None:
            return cls()
        return cls(
            user_id=str(user.id),
            user_role=user.papel,
            bypass_rls=False,
        )

    @classmethod
    def service_context(cls) -> "RLSContext":
        """
        Cria contexto de serviço que ignora RLS.

        Use apenas para operações de sistema como migrations,
        jobs em background, ou scripts administrativos.
        """
        return cls(bypass_rls=True)

    @classmethod
    def anonymous(cls) -> "RLSContext":
        """Cria contexto anônimo (sem usuário)."""
        return cls()

    def __repr__(self) -> str:
        if self.bypass_rls:
            return "<RLSContext(bypass=True)>"
        return f"<RLSContext(user_id={self.user_id}, role={self.user_role})>"


async def set_rls_context(
    session: AsyncSession,
    context: RLSContext,
) -> None:
    """
    Configura as variáveis de sessão do PostgreSQL para RLS.

    Esta função DEVE ser chamada no início de cada transação
    para que as políticas RLS funcionem corretamente.

    Args:
        session: Sessão SQLAlchemy ativa
        context: Contexto de segurança com user_id e role

    Exemplo:
        async with get_db_with_rls(user) as db:
            # RLS já configurado automaticamente
            result = await db.execute(select(Memoria))
    """
    try:
        # Setar variáveis de sessão usando SET LOCAL (escopo da transação)
        await session.execute(
            text("SET LOCAL app.current_user_id = :user_id"),
            {"user_id": context.user_id},
        )
        await session.execute(
            text("SET LOCAL app.current_user_role = :user_role"),
            {"user_role": context.user_role},
        )
        await session.execute(
            text("SET LOCAL app.bypass_rls = :bypass"),
            {"bypass": "true" if context.bypass_rls else "false"},
        )

        logger.debug(f"RLS context set: {context}")

    except Exception as e:
        logger.error(f"Erro ao configurar contexto RLS: {e}")
        raise


async def clear_rls_context(session: AsyncSession) -> None:
    """
    Limpa as variáveis de sessão do PostgreSQL.

    Geralmente não é necessário chamar explicitamente,
    pois SET LOCAL é automaticamente limpo no fim da transação.
    """
    try:
        await session.execute(text("RESET app.current_user_id"))
        await session.execute(text("RESET app.current_user_role"))
        await session.execute(text("RESET app.bypass_rls"))
    except Exception as e:
        logger.warning(f"Erro ao limpar contexto RLS: {e}")


@asynccontextmanager
async def get_db_with_rls(
    user=None,
    context: Optional[RLSContext] = None,
) -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager que fornece sessão com RLS configurado.

    Uso com usuário:
        async with get_db_with_rls(user=current_user) as db:
            memorias = await db.execute(select(Memoria))

    Uso com contexto explícito:
        ctx = RLSContext(user_id="123", user_role="admin")
        async with get_db_with_rls(context=ctx) as db:
            ...

    Uso como serviço (bypass RLS):
        async with get_db_with_rls(context=RLSContext.service_context()) as db:
            # Vê todos os dados
            ...

    Args:
        user: Objeto Usuario (opcional)
        context: RLSContext explícito (opcional, sobrescreve user)
    """
    # Determinar contexto
    if context is None:
        if user is not None:
            context = RLSContext.from_user(user)
        else:
            context = RLSContext.anonymous()

    async with AsyncSessionLocal() as session:
        try:
            # Configurar RLS no início da transação
            await set_rls_context(session, context)

            yield session

            await session.commit()

        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_service_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager para operações de serviço/sistema.

    Ignora todas as políticas RLS. Use com cuidado!

    Casos de uso válidos:
    - Migrations
    - Jobs em background
    - Scripts de manutenção
    - Operações administrativas

    Exemplo:
        async with get_service_db() as db:
            # Vê todos os dados de todas as tabelas
            all_users = await db.execute(select(Usuario))
    """
    async with get_db_with_rls(context=RLSContext.service_context()) as db:
        yield db


async def verify_rls_context(session: AsyncSession) -> dict:
    """
    Verifica o contexto RLS atual da sessão.

    Útil para debugging e auditoria.

    Returns:
        dict com user_id, user_role, bypass_rls
    """
    try:
        result = await session.execute(
            text("""
                SELECT
                    current_setting('app.current_user_id', true) as user_id,
                    current_setting('app.current_user_role', true) as user_role,
                    current_setting('app.bypass_rls', true) as bypass_rls
            """)
        )
        row = result.fetchone()
        return {
            "user_id": row.user_id or "",
            "user_role": row.user_role or "",
            "bypass_rls": row.bypass_rls == "true",
        }
    except Exception as e:
        logger.error(f"Erro ao verificar contexto RLS: {e}")
        return {
            "user_id": "",
            "user_role": "",
            "bypass_rls": False,
            "error": str(e),
        }


async def check_rls_status() -> dict:
    """
    Verifica o status do RLS em todas as tabelas protegidas.

    Returns:
        dict com status de cada tabela
    """
    async with get_service_db() as db:
        result = await db.execute(
            text("""
                SELECT
                    tablename,
                    rowsecurity as rls_enabled,
                    forcerowsecurity as rls_forced
                FROM pg_tables
                WHERE schemaname = 'public'
                AND tablename IN (
                    'usuarios', 'memorias', 'uso_api',
                    'pesquisas', 'perguntas_pesquisa', 'respostas', 'analises'
                )
                ORDER BY tablename
            """)
        )
        rows = result.fetchall()

        return {
            "tables": [
                {
                    "name": row.tablename,
                    "rls_enabled": row.rls_enabled,
                    "rls_forced": row.rls_forced,
                }
                for row in rows
            ],
            "summary": {
                "total": len(rows),
                "protected": sum(1 for row in rows if row.rls_enabled),
            },
        }


async def list_rls_policies() -> list[dict]:
    """
    Lista todas as políticas RLS ativas.

    Returns:
        Lista de políticas com detalhes
    """
    async with get_service_db() as db:
        result = await db.execute(
            text("""
                SELECT
                    tablename,
                    policyname,
                    permissive,
                    roles,
                    cmd,
                    qual as using_expression
                FROM pg_policies
                WHERE schemaname = 'public'
                ORDER BY tablename, policyname
            """)
        )
        rows = result.fetchall()

        return [
            {
                "table": row.tablename,
                "policy": row.policyname,
                "permissive": row.permissive,
                "roles": row.roles,
                "command": row.cmd,
                "using": row.using_expression,
            }
            for row in rows
        ]
