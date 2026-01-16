"""
Módulo de Ingestão de Dados de Parlamentares

Implementa fetchers com cache e snapshots para:
- Câmara dos Deputados (API Dados Abertos)
- Senado Federal (API Dados Abertos)
- CLDF (provider plugável)
"""

from .camara_fetcher import CamaraFetcher
from .senado_fetcher import SenadoFetcher
from .cldf_provider import CLDFProvider

__all__ = ["CamaraFetcher", "SenadoFetcher", "CLDFProvider"]
