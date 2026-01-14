"""
Esquemas Pydantic

Definições de modelos para validação de dados.
"""

from .eleitor import (
    EleitorBase,
    EleitorCreate,
    EleitorListResponse,
    EleitorResponse,
    EleitorUpdate,
    EstatisticasEleitores,
    FiltrosEleitor,
)

__all__ = [
    "EleitorBase",
    "EleitorCreate",
    "EleitorUpdate",
    "EleitorResponse",
    "EleitorListResponse",
    "FiltrosEleitor",
    "EstatisticasEleitores",
]
