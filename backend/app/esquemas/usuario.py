"""
Esquemas Pydantic para Usuários

Validação e serialização de dados de usuário.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class PapelUsuario(str, Enum):
    """Papéis disponíveis no sistema"""
    ADMIN = "admin"
    PESQUISADOR = "pesquisador"
    VISUALIZADOR = "visualizador"
    LEITOR = "leitor"


class ProvedorAuth(str, Enum):
    """Provedores de autenticação"""
    LOCAL = "local"
    GOOGLE = "google"


# ==========================================
# Esquemas de Request
# ==========================================

class RegistroRequest(BaseModel):
    """Requisição de registro de novo usuário"""
    email: EmailStr = Field(..., description="Email válido")
    nome: str = Field(..., min_length=2, max_length=200, description="Nome completo")
    senha: str = Field(..., min_length=6, max_length=100, description="Senha (mínimo 6 caracteres)")

    @field_validator("nome")
    @classmethod
    def nome_valido(cls, v: str) -> str:
        return v.strip()


class LoginRequest(BaseModel):
    """Requisição de login"""
    usuario: str = Field(..., description="Email ou nome de usuário")
    senha: str = Field(..., description="Senha")


class GoogleAuthRequest(BaseModel):
    """Requisição de autenticação Google"""
    code: str = Field(..., description="Código de autorização do Google")


class AlterarSenhaRequest(BaseModel):
    """Requisição para alterar senha"""
    senha_atual: str = Field(..., description="Senha atual")
    senha_nova: str = Field(..., min_length=6, description="Nova senha")


class AtualizarPerfilRequest(BaseModel):
    """Requisição para atualizar perfil"""
    nome: Optional[str] = Field(None, min_length=2, max_length=200)
    avatar_url: Optional[str] = Field(None, max_length=500)


class AprovarUsuarioRequest(BaseModel):
    """Requisição para aprovar usuário"""
    papel: Optional[PapelUsuario] = Field(None, description="Papel a atribuir")


class AtualizarPapelRequest(BaseModel):
    """Requisição para atualizar papel"""
    papel: PapelUsuario = Field(..., description="Novo papel")


# ==========================================
# Esquemas de Response
# ==========================================

class UsuarioResponse(BaseModel):
    """Resposta com dados do usuário"""
    id: str
    email: str
    nome: str
    papel: str
    provedor_auth: str
    ativo: bool
    aprovado: bool
    avatar_url: Optional[str] = None
    criado_em: datetime
    ultimo_login: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UsuarioResumoResponse(BaseModel):
    """Resposta resumida do usuário (para listagens)"""
    id: str
    email: str
    nome: str
    papel: str
    ativo: bool
    aprovado: bool
    avatar_url: Optional[str] = None
    provedor_auth: str
    criado_em: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Resposta de autenticação com token"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    usuario: UsuarioResponse


class RegistroResponse(BaseModel):
    """Resposta de registro"""
    mensagem: str
    usuario: UsuarioResponse


class ListaUsuariosResponse(BaseModel):
    """Resposta de listagem de usuários"""
    usuarios: list[UsuarioResumoResponse]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int


class GoogleAuthUrlResponse(BaseModel):
    """Resposta com URL de autorização Google"""
    url: str


class MensagemResponse(BaseModel):
    """Resposta genérica com mensagem"""
    mensagem: str


class EstatisticasUsuariosResponse(BaseModel):
    """Estatísticas de usuários para o admin"""
    total: int
    pendentes: int
    ativos: int
    por_papel: dict[str, int]
