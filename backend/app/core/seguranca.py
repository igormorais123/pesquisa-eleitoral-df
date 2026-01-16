"""
Módulo de Segurança

Implementa autenticação JWT e hash de senhas.
"""

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
    email: Optional[str] = None
    aprovado: Optional[bool] = None


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
        email: str = payload.get("email")
        aprovado: bool = payload.get("aprovado")

        if usuario_id is None:
            return None

        return DadosToken(
            usuario_id=usuario_id,
            nome=nome,
            papel=papel,
            email=email,
            aprovado=aprovado,
        )

    except JWTError:
        return None


# ============================================
# USUÁRIO DE TESTE (credenciais via config)
# ============================================


def get_usuario_teste() -> Dict[str, Any]:
    """
    Retorna dados do usuário de teste (admin).
    Carrega credenciais das configurações do .env via pydantic_settings.
    """
    return {
        "id": configuracoes.ADMIN_USER_ID,
        "usuario": configuracoes.ADMIN_USERNAME,
        "nome": configuracoes.ADMIN_NAME,
        "email": configuracoes.ADMIN_EMAIL,
        "papel": "admin",
        "senha_hash": configuracoes.ADMIN_PASSWORD_HASH,
        "ativo": True,
    }


def autenticar_usuario_legado(usuario: str, senha: str) -> Optional[dict]:
    """
    Autentica usuário usando o usuário de teste.

    NOTA: Esta função é um fallback para desenvolvimento.
    Em produção, use autenticação via banco de dados (UsuarioServico.autenticar).

    Args:
        usuario: Nome de usuário
        senha: Senha em texto plano

    Returns:
        Dados do usuário se autenticado, None caso contrário
    """
    usuario_teste = get_usuario_teste()

    # Apenas usuário de teste (fallback para desenvolvimento)
    if usuario != usuario_teste["usuario"]:
        return None

    # Verificar senha usando hash bcrypt (nunca comparar senha em plaintext)
    if verificar_senha(senha, str(usuario_teste["senha_hash"])):
        return {
            "id": usuario_teste["id"],
            "usuario": usuario_teste["usuario"],
            "nome": usuario_teste["nome"],
            "papel": usuario_teste["papel"],
        }

    return None


# Alias para compatibilidade
autenticar_usuario = autenticar_usuario_legado
