"""
Serviços

Camada de lógica de negócio do sistema.
"""

from .eleitor_servico import EleitorServico
from .memoria_servico import MemoriaServico, criar_memoria_servico

__all__ = [
    "EleitorServico",
    "MemoriaServico",
    "criar_memoria_servico",
]
