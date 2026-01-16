"""
Dependências da API

Funções de dependência para injeção em rotas.
Inclui suporte a Row Level Security (RLS) no PostgreSQL.
"""

from typing import AsyncGenerator, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.seguranca import DadosToken, verificar_token
from app.db.session import AsyncSessionLocal

# Esquema OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def obter_usuario_atual(token: str = Depends(oauth2_scheme)) -> DadosToken:
    """
    Obtém o usuário atual a partir do token JWT.

    Args:
        token: Token JWT do header Authorization

    Returns:
        DadosToken com informações do usuário

    Raises:
        HTTPException 401 se token inválido
    """
    credenciais_excecao = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    dados_token = verificar_token(token)

    if dados_token is None:
        raise credenciais_excecao

    return dados_token


async def obter_usuario_admin(
    usuario: DadosToken = Depends(obter_usuario_atual),
) -> DadosToken:
    """
    Verifica se o usuário atual é administrador.

    Args:
        usuario: Dados do usuário atual

    Returns:
        DadosToken se for admin

    Raises:
        HTTPException 403 se não for admin
    """
    if usuario.papel != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores",
        )

    return usuario


async def obter_usuario_opcional(
    token: Optional[str] = Depends(oauth2_scheme_optional),
) -> Optional[DadosToken]:
    """
    Obtém usuário opcionalmente (para rotas públicas que aceitam autenticação).

    Args:
        token: Token JWT opcional

    Returns:
        DadosToken se autenticado, None caso contrário
    """
    if not token:
        return None

    return verificar_token(token)


# ========================================
# DEPENDÊNCIAS COM ROW LEVEL SECURITY (RLS)
# ========================================


def _escape_string(value: str) -> str:
    """Escapa string para uso seguro em SQL (remove caracteres perigosos)."""
    # Remove caracteres que podem causar SQL injection
    return value.replace("'", "''").replace("\\", "").replace(";", "").replace("--", "")


async def _set_rls_context(
    session: AsyncSession,
    user_id: str = "",
    user_role: str = "",
    bypass: bool = False,
) -> None:
    """Configura variáveis de sessão PostgreSQL para RLS."""
    # Escapar valores para evitar SQL injection
    safe_user_id = _escape_string(user_id)
    safe_user_role = _escape_string(user_role)
    bypass_str = "true" if bypass else "false"

    # SET LOCAL não suporta parâmetros em asyncpg, usar strings escapadas
    await session.execute(text(f"SET LOCAL app.current_user_id = '{safe_user_id}'"))
    await session.execute(text(f"SET LOCAL app.current_user_role = '{safe_user_role}'"))
    await session.execute(text(f"SET LOCAL app.bypass_rls = '{bypass_str}'"))


async def get_db_rls(
    usuario: DadosToken = Depends(obter_usuario_atual),
) -> AsyncGenerator[AsyncSession, None]:
    """
    Dependência que fornece sessão com RLS configurado para usuário autenticado.

    O contexto RLS é automaticamente configurado com base no token JWT.
    Todas as queries respeitarão as políticas de segurança definidas.

    Uso:
        @router.get("/memorias")
        async def listar_memorias(db: AsyncSession = Depends(get_db_rls)):
            # Usuário só verá suas próprias memórias
            result = await db.execute(select(Memoria))
            return result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            # Configurar contexto RLS
            await _set_rls_context(
                session,
                user_id=str(usuario.usuario_id),
                user_role=usuario.papel,
                bypass=False,
            )

            yield session
            await session.commit()

        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db_rls_optional(
    usuario: Optional[DadosToken] = Depends(obter_usuario_opcional),
) -> AsyncGenerator[AsyncSession, None]:
    """
    Dependência que fornece sessão com RLS para usuário opcional.

    Se não houver usuário autenticado, o contexto será anônimo
    (sem acesso a dados protegidos por usuário).

    Uso:
        @router.get("/pesquisas")
        async def listar_pesquisas(db: AsyncSession = Depends(get_db_rls_optional)):
            # Pesquisas são compartilhadas, então todos autenticados veem
            result = await db.execute(select(Pesquisa))
            return result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            if usuario:
                await _set_rls_context(
                    session,
                    user_id=str(usuario.usuario_id),
                    user_role=usuario.papel,
                    bypass=False,
                )
            else:
                # Contexto anônimo
                await _set_rls_context(session, bypass=False)

            yield session
            await session.commit()

        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db_admin(
    usuario: DadosToken = Depends(obter_usuario_admin),
) -> AsyncGenerator[AsyncSession, None]:
    """
    Dependência para rotas administrativas com RLS configurado.

    Apenas admins podem usar esta dependência.
    O admin tem acesso a todos os dados via política RLS.

    Uso:
        @router.get("/admin/usuarios")
        async def listar_todos_usuarios(db: AsyncSession = Depends(get_db_admin)):
            # Admin vê todos os usuários
            result = await db.execute(select(Usuario))
            return result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            await _set_rls_context(
                session,
                user_id=str(usuario.usuario_id),
                user_role="admin",
                bypass=False,
            )

            yield session
            await session.commit()

        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db_service() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependência para operações de sistema que ignoram RLS.

    CUIDADO: Esta dependência ignora TODAS as políticas de segurança.
    Use apenas para:
    - Jobs em background
    - Operações de sistema
    - Scripts de manutenção

    NÃO use em rotas expostas a usuários!

    Uso (apenas em contextos seguros):
        async def job_limpeza():
            async for db in get_db_service():
                # Acesso total a todos os dados
                await db.execute(delete(Memoria).where(...))
    """
    async with AsyncSessionLocal() as session:
        try:
            await _set_rls_context(session, bypass=True)

            yield session
            await session.commit()

        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
