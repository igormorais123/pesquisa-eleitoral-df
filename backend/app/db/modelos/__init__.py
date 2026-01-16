"""
Modelos SQLAlchemy do Sistema

Exporta todos os modelos para fácil importação.
"""

from app.db.modelos.pesquisa import (
    Pesquisa,
    PerguntaPesquisa,
    RespostaPesquisa,
    AnalisePesquisa,
)

__all__ = [
    "Pesquisa",
    "PerguntaPesquisa",
    "RespostaPesquisa",
    "AnalisePesquisa",
]
