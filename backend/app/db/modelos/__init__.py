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

# Importa modelos PODC de app.modelos
from app.modelos.pesquisa_podc import (
    PesquisaPODC,
    RespostaPODC,
    EstatisticasPODC,
)

__all__ = [
    "Pesquisa",
    "PerguntaPesquisa",
    "RespostaPesquisa",
    "AnalisePesquisa",
    # Modelos PODC
    "PesquisaPODC",
    "RespostaPODC",
    "EstatisticasPODC",
]
