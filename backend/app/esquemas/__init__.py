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
from .memoria import (
    AnalyticsGlobais,
    FiltrosMemoria,
    HistoricoEleitor,
    MemoriaCreate,
    MemoriaListResponse,
    MemoriaResponse,
    MemoriaResumo,
    TipoMemoriaEnum,
    UsoAPIResponse,
)

__all__ = [
    # Eleitor
    "EleitorBase",
    "EleitorCreate",
    "EleitorUpdate",
    "EleitorResponse",
    "EleitorListResponse",
    "FiltrosEleitor",
    "EstatisticasEleitores",
    # Memória
    "MemoriaCreate",
    "MemoriaResponse",
    "MemoriaResumo",
    "MemoriaListResponse",
    "FiltrosMemoria",
    "HistoricoEleitor",
    "AnalyticsGlobais",
    "UsoAPIResponse",
    "TipoMemoriaEnum",
]
