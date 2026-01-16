"""
Rotas de Autenticação

Endpoints para login, logout e verificação de token.
Suporta autenticação via banco de dados com fallback para usuário de teste.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DadosToken, obter_usuario_atual
from app.core.config import configuracoes
from app.core.seguranca import autenticar_usuario_legado, criar_token_acesso
from app.db.database import get_db
from app.servicos.usuario_servico import UsuarioServico

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
async def login(dados: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Realiza login no sistema.

    - **usuario**: Nome de usuário ou email
    - **senha**: Senha do usuário

    Retorna token JWT para autenticação.

    Tenta autenticar primeiro no banco de dados.
    Se não encontrar, usa fallback para usuário de teste (desenvolvimento).
    """
    # Tentar autenticar no banco de dados
    usuario_db = await UsuarioServico.autenticar(db, dados.usuario, dados.senha)

    if usuario_db:
        # Usuário encontrado no banco
        usuario = {
            "id": usuario_db.id,
            "usuario": usuario_db.usuario,
            "nome": usuario_db.nome,
            "papel": usuario_db.papel,
        }
    else:
        # Fallback para usuário de teste (desenvolvimento)
        usuario = autenticar_usuario_legado(dados.usuario, dados.senha)

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
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """
    Login via formulário OAuth2 (para Swagger UI).
    """
    # Tentar autenticar no banco de dados
    usuario_db = await UsuarioServico.autenticar(db, form_data.username, form_data.password)

    if usuario_db:
        usuario = {
            "id": usuario_db.id,
            "usuario": usuario_db.usuario,
            "nome": usuario_db.nome,
            "papel": usuario_db.papel,
        }
    else:
        # Fallback para usuário de teste
        usuario = autenticar_usuario_legado(form_data.username, form_data.password)

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
    usuario_atual: DadosToken = Depends(obter_usuario_atual),
):
    """
    Retorna dados do usuário autenticado.

    Requer token JWT válido no header Authorization.
    """
    return UsuarioResponse(
        id=usuario_atual.usuario_id or "",
        usuario=usuario_atual.usuario_id or "",  # Por enquanto igual ao ID
        nome=usuario_atual.nome or "",
        papel=usuario_atual.papel or "",
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
    usuario_atual: DadosToken = Depends(obter_usuario_atual),
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
