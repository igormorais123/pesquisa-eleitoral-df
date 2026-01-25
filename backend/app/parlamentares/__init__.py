"""
Módulo de Parlamentares

Sistema para gestão de perfis de parlamentares com dados de fontes abertas.
Implementa arquitetura de "camadas de verdade":
- Fatos: dados verificáveis de fontes oficiais
- Derivados: métricas calculadas a partir de fatos
- Hipóteses: inferências opcionais com confiança e justificativa
"""

from .models import (
    CasaLegislativaEnum,
    ParlamentarFatos,
    ParlamentarDerivados,
    ParlamentarHipoteses,
    ParlamentarProfile,
    ParlamentarResponse,
    FiltrosParlamentar,
)
from .services import ParlamentarService
from .integration import ParlamentarAgentAdapter

__all__ = [
    "CasaLegislativaEnum",
    "ParlamentarFatos",
    "ParlamentarDerivados",
    "ParlamentarHipoteses",
    "ParlamentarProfile",
    "ParlamentarResponse",
    "FiltrosParlamentar",
    "ParlamentarService",
    "ParlamentarAgentAdapter",
]
