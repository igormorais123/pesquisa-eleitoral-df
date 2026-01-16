"""
Base para modelos SQLAlchemy

Define a classe base e configurações para todos os modelos.
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


class Base(DeclarativeBase):
    """Classe base para todos os modelos SQLAlchemy"""

    metadata = MetaData(naming_convention=convention)

    # Campos comuns para auditoria
    id: Any
    __name__: str

    def to_dict(self) -> dict:
        """Converte modelo para dicionário"""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
