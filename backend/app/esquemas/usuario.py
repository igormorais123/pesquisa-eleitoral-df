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


class UsuarioBase(BaseModel):
    """Campos base do usuário"""
    usuario: str = Field(..., min_length=3, max_length=100, description="Nome de usuário único")
    nome: str = Field(..., min_length=2, max_length=200, description="Nome completo")
    email: EmailStr = Field(..., description="Email válido")
    papel: PapelUsuario = Field(default=PapelUsuario.VISUALIZADOR, description="Papel no sistema")

    @field_validator("usuario")
    @classmethod
    def usuario_sem_espacos(cls, v: str) -> str:
        """Remove espaços e converte para minúsculas"""
        return v.strip().lower().replace(" ", "")


class UsuarioCriar(UsuarioBase):
    """Esquema para criar novo usuário"""
    senha: str = Field(..., min_length=6, max_length=100, description="Senha (mínimo 6 caracteres)")
    ativo: bool = Field(default=True, description="Se o usuário está ativo")
    descricao: Optional[str] = Field(None, max_length=500, description="Descrição do usuário")

    @field_validator("senha")
    @classmethod
    def senha_forte(cls, v: str) -> str:
        """Valida força mínima da senha"""
        if len(v) < 6:
            raise ValueError("Senha deve ter no mínimo 6 caracteres")
        return v


class UsuarioAtualizar(BaseModel):
    """Esquema para atualizar usuário (todos campos opcionais)"""
    nome: Optional[str] = Field(None, min_length=2, max_length=200)
    email: Optional[EmailStr] = None
    papel: Optional[PapelUsuario] = None
    ativo: Optional[bool] = None
    descricao: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = Field(None, max_length=500)


class UsuarioAtualizarSenha(BaseModel):
    """Esquema para alterar senha"""
    senha_atual: str = Field(..., description="Senha atual")
    senha_nova: str = Field(..., min_length=6, max_length=100, description="Nova senha")

    @field_validator("senha_nova")
    @classmethod
    def senha_forte(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Nova senha deve ter no mínimo 6 caracteres")
        return v


class UsuarioResposta(BaseModel):
    """Esquema de resposta (sem senha)"""
    id: str
    usuario: str
    nome: str
    email: str
    papel: PapelUsuario
    ativo: bool
    criado_em: datetime
    atualizado_em: datetime
    ultimo_login: Optional[datetime] = None
    avatar_url: Optional[str] = None
    descricao: Optional[str] = None

    model_config = {"from_attributes": True}


class UsuarioResumido(BaseModel):
    """Esquema resumido para listagens"""
    id: str
    usuario: str
    nome: str
    papel: PapelUsuario
    ativo: bool

    model_config = {"from_attributes": True}


class ListaUsuariosResposta(BaseModel):
    """Resposta paginada de listagem de usuários"""
    usuarios: list[UsuarioResumido]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int


class UsuarioLogin(BaseModel):
    """Esquema para login"""
    usuario: str = Field(..., description="Nome de usuário ou email")
    senha: str = Field(..., description="Senha")


class TokenResposta(BaseModel):
    """Resposta de autenticação"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    usuario: UsuarioResumido
