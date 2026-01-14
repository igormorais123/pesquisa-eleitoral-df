"""
Rotas de Autenticação

Endpoints para login, logout e verificação de token.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional

from app.core.seguranca import (
    criar_token_acesso,
    autenticar_usuario,
    Token,
)
from app.core.config import configuracoes
from app.api.deps import obter_usuario_atual, DadosToken


router = APIRouter()


class LoginRequest(BaseModel):
    """Requisição de login"""
    usuario: str
    senha: str


class LoginResponse(BaseModel):
    """Resposta de login"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    usuario: dict


class UsuarioResponse(BaseModel):
    """Resposta com dados do usuário"""
    id: str
    usuario: str
    nome: str
    papel: str


@router.post("/login", response_model=LoginResponse)
async def login(dados: LoginRequest):
    """
    Realiza login no sistema.

    - **usuario**: Nome de usuário
    - **senha**: Senha do usuário

    Retorna token JWT para autenticação.
    """
    usuario = autenticar_usuario(dados.usuario, dados.senha)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Criar token
    token = criar_token_acesso(
        dados={
            "sub": usuario["id"],
            "nome": usuario["nome"],
            "papel": usuario["papel"],
        }
    )

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        expires_in=configuracoes.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        usuario=usuario,
    )


@router.post("/login/form", response_model=LoginResponse)
async def login_form(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login via formulário OAuth2 (para Swagger UI).
    """
    usuario = autenticar_usuario(form_data.username, form_data.password)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = criar_token_acesso(
        dados={
            "sub": usuario["id"],
            "nome": usuario["nome"],
            "papel": usuario["papel"],
        }
    )

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        expires_in=configuracoes.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        usuario=usuario,
    )


@router.get("/me", response_model=UsuarioResponse)
async def obter_usuario_logado(
    usuario_atual: DadosToken = Depends(obter_usuario_atual)
):
    """
    Retorna dados do usuário autenticado.

    Requer token JWT válido no header Authorization.
    """
    return UsuarioResponse(
        id=usuario_atual.usuario_id,
        usuario=usuario_atual.usuario_id,  # Por enquanto igual ao ID
        nome=usuario_atual.nome,
        papel=usuario_atual.papel,
    )


@router.post("/logout")
async def logout(usuario_atual: DadosToken = Depends(obter_usuario_atual)):
    """
    Realiza logout do sistema.

    Nota: Como usamos JWT stateless, o logout é feito no cliente
    removendo o token. Esta rota apenas confirma a ação.
    """
    return {
        "mensagem": "Logout realizado com sucesso",
        "usuario": usuario_atual.nome,
    }


@router.get("/verificar")
async def verificar_token_valido(
    usuario_atual: DadosToken = Depends(obter_usuario_atual)
):
    """
    Verifica se o token atual é válido.

    Útil para verificar sessão ativa.
    """
    return {
        "valido": True,
        "usuario": usuario_atual.nome,
        "papel": usuario_atual.papel,
    }
