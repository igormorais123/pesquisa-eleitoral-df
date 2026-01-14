"""
Esquemas Pydantic

Definições de modelos para validação de dados.
"""

from .eleitor import (
    EleitorBase,
    EleitorCreate,
    EleitorUpdate,
    EleitorResponse,
    EleitorListResponse,
    FiltrosEleitor,
    EstatisticasEleitores,
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
