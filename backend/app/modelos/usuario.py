"""
Modelo de Usuário

Tabela de usuários do sistema com suporte a OAuth2 (Google) e múltiplos papéis.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class PapelUsuario(str, Enum):
    """Papéis disponíveis no sistema"""
    ADMIN = "admin"
    PESQUISADOR = "pesquisador"
    VISUALIZADOR = "visualizador"
    LEITOR = "leitor"  # Novo papel - apenas visualização, sem API


class ProvedorAuth(str, Enum):
    """Provedores de autenticação"""
    LOCAL = "local"
    GOOGLE = "google"


class Usuario(Base):
    """
    Modelo de usuário do sistema.

    Papéis disponíveis:
    - admin: Acesso total ao sistema (Professor Igor)
    - pesquisador: Pode criar e executar pesquisas
    - visualizador: Visualização de resultados
    - leitor: Apenas visualização do programa (sem acesso à API)
    """

    __tablename__ = "usuarios"

    # Identificação
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)

    # Dados do perfil
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Autenticação local (opcional se usar OAuth)
    usuario: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True, index=True)
    senha_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # OAuth2
    provedor_auth: Mapped[str] = mapped_column(
        String(20),
        default=ProvedorAuth.LOCAL.value,
        nullable=False
    )
    google_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)

    # Permissões
    papel: Mapped[str] = mapped_column(
        String(50),
        default=PapelUsuario.LEITOR.value,
        nullable=False
    )
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    aprovado: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Timestamps
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    ultimo_login: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Campos extras
    descricao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<Usuario(id={self.id}, email={self.email}, papel={self.papel})>"

    @property
    def is_admin(self) -> bool:
        """Verifica se o usuário é administrador"""
        return self.papel == PapelUsuario.ADMIN.value

    @property
    def is_pesquisador(self) -> bool:
        """Verifica se o usuário pode criar pesquisas"""
        return self.papel in (PapelUsuario.ADMIN.value, PapelUsuario.PESQUISADOR.value)

    @property
    def pode_usar_api(self) -> bool:
        """Verifica se o usuário pode consumir a API"""
        return self.aprovado and self.papel != PapelUsuario.LEITOR.value

    @property
    def pode_visualizar(self) -> bool:
        """Verifica se o usuário pode visualizar o sistema"""
        return self.ativo and (self.aprovado or self.papel == PapelUsuario.LEITOR.value)
