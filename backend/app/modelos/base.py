"""
Base declarativa para modelos SQLAlchemy.

Define a classe base para todos os modelos do sistema de pesquisa eleitoral.
"""

from datetime import datetime
from typing import Any

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func


# Convenção de nomes para constraints (facilita migrations)
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=convention)


class Base(DeclarativeBase):
    """
    Classe base para todos os modelos SQLAlchemy.

    Fornece:
    - Metadata com convenção de nomes para constraints
    - Representação string automática
    """

    metadata = metadata

    def __repr__(self) -> str:
        """Representação string do modelo."""
        class_name = self.__class__.__name__
        attrs = []
        for col in self.__table__.columns:
            value = getattr(self, col.name, None)
            if col.name == "id" or col.primary_key:
                attrs.append(f"{col.name}={value!r}")
        return f"<{class_name}({', '.join(attrs)})>"

    def to_dict(self) -> dict[str, Any]:
        """Converte o modelo para dicionário."""
        return {
            col.name: getattr(self, col.name)
            for col in self.__table__.columns
        }


class TimestampMixin:
    """
    Mixin para adicionar campos de timestamp automáticos.

    Adiciona:
    - criado_em: Data/hora de criação (automático)
    - atualizado_em: Data/hora da última atualização (automático)
    """

    criado_em: Mapped[datetime] = mapped_column(
        default=func.now(),
        server_default=func.now(),
        nullable=False,
    )
    atualizado_em: Mapped[datetime | None] = mapped_column(
        default=None,
        onupdate=func.now(),
        nullable=True,
    )
