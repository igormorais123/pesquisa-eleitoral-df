"""
Módulo de Segurança

Implementa autenticação JWT e hash de senhas.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import configuracoes

# Contexto de hash de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenPayload(BaseModel):
    """Payload do token JWT"""

    sub: str  # ID ou username do usuário
    nome: str
    papel: str
    exp: datetime
    tipo: str = "access"


class Token(BaseModel):
    """Resposta de token"""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
    usuario: dict


class DadosToken(BaseModel):
    """Dados extraídos do token"""

    usuario_id: Optional[str] = None
    nome: Optional[str] = None
    papel: Optional[str] = None


def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    """Verifica se a senha corresponde ao hash"""
    return pwd_context.verify(senha_plana, senha_hash)


def gerar_hash_senha(senha: str) -> str:
    """Gera hash bcrypt da senha"""
    return pwd_context.hash(senha)


def criar_token_acesso(dados: dict, expira_em: Optional[timedelta] = None) -> str:
    """
    Cria um token JWT de acesso.

    Args:
        dados: Dados a incluir no token
        expira_em: Tempo de expiração (padrão: configuração)

    Returns:
        Token JWT assinado
    """
    a_codificar = dados.copy()

    agora = datetime.now(timezone.utc)
    if expira_em:
        expiracao = agora + expira_em
    else:
        expiracao = agora + timedelta(minutes=configuracoes.ACCESS_TOKEN_EXPIRE_MINUTES)

    a_codificar.update(
        {
            "exp": expiracao,
            "tipo": "access",
            "iat": agora,
        }
    )

    token: str = jwt.encode(
        a_codificar, configuracoes.SECRET_KEY, algorithm=configuracoes.ALGORITHM
    )

    return token


def verificar_token(token: str) -> Optional[DadosToken]:
    """
    Verifica e decodifica um token JWT.

    Args:
        token: Token JWT a verificar

    Returns:
        DadosToken se válido, None caso contrário
    """
    try:
        payload = jwt.decode(token, configuracoes.SECRET_KEY, algorithms=[configuracoes.ALGORITHM])

        usuario_id: str = payload.get("sub")
        nome: str = payload.get("nome")
        papel: str = payload.get("papel")

        if usuario_id is None:
            return None

        return DadosToken(usuario_id=usuario_id, nome=nome, papel=papel)

    except JWTError:
        return None


# ============================================
# USUÁRIO DE TESTE (credenciais via variáveis de ambiente em produção)
# ============================================

# Em produção, usar variáveis de ambiente para credenciais
# Hash da senha padrão para desenvolvimento
_SENHA_HASH_PADRAO = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.O0lZ8LqWQKQJGe"

USUARIO_TESTE: Dict[str, Any] = {
    "id": os.environ.get("ADMIN_USER_ID", "user-001"),
    "usuario": os.environ.get("ADMIN_USERNAME", "admin"),
    "nome": os.environ.get("ADMIN_NAME", "Administrador"),
    "email": os.environ.get("ADMIN_EMAIL", "admin@exemplo.com"),
    "papel": "admin",
    "senha_hash": os.environ.get("ADMIN_PASSWORD_HASH", _SENHA_HASH_PADRAO),
    "ativo": True,
}


def autenticar_usuario(usuario: str, senha: str) -> Optional[dict]:
    """
    Autentica um usuário pelo nome de usuário e senha.

    Args:
        usuario: Nome de usuário
        senha: Senha em texto plano

    Returns:
        Dados do usuário se autenticado, None caso contrário
    """
    # Por enquanto, apenas usuário de teste
    if usuario != USUARIO_TESTE["usuario"]:
        return None

    # Verificar senha usando hash bcrypt
    if verificar_senha(senha, str(USUARIO_TESTE["senha_hash"])):
        return {
            "id": USUARIO_TESTE["id"],
            "usuario": USUARIO_TESTE["usuario"],
            "nome": USUARIO_TESTE["nome"],
            "papel": USUARIO_TESTE["papel"],
        }

    return None
