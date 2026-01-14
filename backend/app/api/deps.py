"""
Dependências da API

Funções de dependência para injeção em rotas.
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.seguranca import DadosToken, verificar_token

# Esquema OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


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
    token: Optional[str] = Depends(oauth2_scheme),
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
