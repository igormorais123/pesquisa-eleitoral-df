"""
Rotas de Autenticação

Endpoints para login, registro, logout e autenticação Google OAuth2.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DadosToken, obter_usuario_atual
from app.core.config import configuracoes
from app.core.seguranca import autenticar_usuario_legado, criar_token_acesso
from app.db.session import get_db, get_db_optional
from app.esquemas.usuario import (
    GoogleAuthRequest,
    GoogleAuthUrlResponse,
    LoginRequest,
    MensagemResponse,
    RegistroRequest,
    RegistroResponse,
    TokenResponse,
    UsuarioResponse,
)
from app.servicos.oauth_servico import GoogleOAuthServico
from app.servicos.usuario_servico import UsuarioServico

router = APIRouter()


def criar_token_response(usuario) -> TokenResponse:
    """Cria resposta de token para um usuário"""
    token = criar_token_acesso(
        dados={
            "sub": usuario.id,
            "nome": usuario.nome,
            "papel": usuario.papel,
            "email": usuario.email,
            "aprovado": usuario.aprovado,
        }
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=configuracoes.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        usuario=UsuarioResponse.model_validate(usuario),
    )


# ==========================================
# Registro
# ==========================================

@router.post(
    "/registro",
    response_model=RegistroResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar novo usuário",
    description="""
Registra um novo usuário no sistema.

**Importante:**
- Novos usuários são criados com papel "leitor"
- Precisam de aprovação do administrador para acessar funcionalidades avançadas
- Enquanto não aprovados, podem apenas visualizar o sistema
    """,
)
async def registrar(
    dados: RegistroRequest,
    db: AsyncSession = Depends(get_db),
):
    """Registra novo usuário"""
    try:
        usuario = await UsuarioServico.registrar(
            db=db,
            email=dados.email,
            nome=dados.nome,
            senha=dados.senha,
        )

        return RegistroResponse(
            mensagem="Cadastro realizado com sucesso! Aguarde aprovação do administrador para acessar todas as funcionalidades.",
            usuario=UsuarioResponse.model_validate(usuario),
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# ==========================================
# Login Local
# ==========================================

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login",
    description="Realiza login com email/usuário e senha.",
)
async def login(
    dados: LoginRequest,
    db: AsyncSession = Depends(get_db_optional),
):
    """Login com credenciais locais"""
    # Tentar autenticar no banco de dados (se disponível)
    usuario = None
    try:
        if db is not None:
            usuario = await UsuarioServico.autenticar(db, dados.usuario, dados.senha)
    except Exception as e:
        # Banco não disponível, continua para fallback
        print(f"[AUTH] Banco indisponível, usando fallback: {e}")

    if usuario:
        if not usuario.ativo:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Conta desativada. Entre em contato com o administrador.",
            )
        return criar_token_response(usuario)

    # Fallback para usuário de teste (desenvolvimento)
    usuario_legado = autenticar_usuario_legado(dados.usuario, dados.senha)

    if usuario_legado:
        # Criar token para usuário legado (admin de teste)
        token = criar_token_acesso(
            dados={
                "sub": usuario_legado["id"],
                "nome": usuario_legado["nome"],
                "papel": usuario_legado["papel"],
                "email": "admin@exemplo.com",
                "aprovado": True,
            }
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in=configuracoes.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            usuario=UsuarioResponse(
                id=usuario_legado["id"],
                email="admin@exemplo.com",
                nome=usuario_legado["nome"],
                papel=usuario_legado["papel"],
                provedor_auth="local",
                ativo=True,
                aprovado=True,
                criado_em=None,
            ),
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Email/usuário ou senha incorretos",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/login/form", response_model=TokenResponse)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Login via formulário OAuth2 (para Swagger UI)"""
    dados = LoginRequest(usuario=form_data.username, senha=form_data.password)
    return await login(dados, db)


# ==========================================
# Login Google OAuth2
# ==========================================

@router.get(
    "/google/url",
    response_model=GoogleAuthUrlResponse,
    summary="URL de autorização Google",
    description="Retorna URL para iniciar fluxo OAuth2 com Google.",
)
async def google_auth_url():
    """Obtém URL de autorização do Google"""
    if not configuracoes.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Login com Google não está configurado",
        )

    url = GoogleOAuthServico.get_authorization_url()
    return GoogleAuthUrlResponse(url=url)


@router.post(
    "/google/callback",
    response_model=TokenResponse,
    summary="Callback Google OAuth",
    description="""
Processa callback do Google OAuth2.

**Fluxo:**
1. Frontend redireciona para URL do Google
2. Usuário autoriza
3. Google redireciona para callback com código
4. Frontend envia código para este endpoint
5. Backend troca código por token e obtém dados do usuário
6. Retorna JWT para o frontend
    """,
)
async def google_callback(
    dados: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    """Processa callback do Google OAuth"""
    if not configuracoes.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Login com Google não está configurado",
        )

    # Autenticar com Google
    google_user = await GoogleOAuthServico.authenticate(dados.code)

    if not google_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falha na autenticação com Google",
        )

    # Criar ou autenticar usuário
    usuario = await UsuarioServico.autenticar_ou_criar_google(
        db=db,
        google_id=google_user["google_id"],
        email=google_user["email"],
        nome=google_user["nome"],
        avatar_url=google_user.get("avatar_url"),
    )

    if not usuario.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conta desativada. Entre em contato com o administrador.",
        )

    return criar_token_response(usuario)


# ==========================================
# Sessão
# ==========================================

@router.get(
    "/me",
    response_model=UsuarioResponse,
    summary="Dados do usuário logado",
    description="Retorna dados do usuário autenticado.",
)
async def obter_usuario_logado(
    usuario_atual: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """Obtém dados do usuário logado"""
    # Tentar buscar do banco
    usuario = await UsuarioServico.obter_por_id(db, usuario_atual.usuario_id)

    if usuario:
        return UsuarioResponse.model_validate(usuario)

    # Fallback para usuário legado
    return UsuarioResponse(
        id=usuario_atual.usuario_id or "",
        email=getattr(usuario_atual, "email", "admin@exemplo.com"),
        nome=usuario_atual.nome or "",
        papel=usuario_atual.papel or "admin",
        provedor_auth="local",
        ativo=True,
        aprovado=True,
        criado_em=None,
    )


@router.post(
    "/logout",
    response_model=MensagemResponse,
    summary="Logout",
    description="Realiza logout (stateless - apenas confirmação).",
)
async def logout(
    usuario_atual: DadosToken = Depends(obter_usuario_atual),
):
    """Logout"""
    return MensagemResponse(
        mensagem=f"Logout realizado com sucesso. Até logo, {usuario_atual.nome}!"
    )


@router.get(
    "/verificar",
    summary="Verificar token",
    description="Verifica se o token JWT é válido.",
)
async def verificar_token_valido(
    usuario_atual: DadosToken = Depends(obter_usuario_atual),
):
    """Verifica token"""
    return {
        "valido": True,
        "usuario": usuario_atual.nome,
        "papel": usuario_atual.papel,
        "aprovado": getattr(usuario_atual, "aprovado", True),
    }
