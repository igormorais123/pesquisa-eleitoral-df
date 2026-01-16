"""
Modelos SQLAlchemy para o Sistema de Pesquisa Eleitoral.

Este módulo exporta todos os modelos do banco de dados PostgreSQL:
- Pesquisa: Pesquisa eleitoral principal
- PerguntaPesquisa: Perguntas de uma pesquisa
- Resposta: Respostas dos eleitores
- Analise: Análises agregadas

Também exporta:
- Base: Classe base declarativa
- Enums: Tipos enumerados (TipoPesquisa, StatusPesquisa, etc.)
"""

from app.modelos.analise import Analise, TipoAnalise
from app.modelos.base import Base, TimestampMixin
from app.modelos.pergunta import PerguntaPesquisa, TipoPergunta
from app.modelos.pesquisa import Pesquisa, StatusPesquisa, TipoPesquisa
from app.modelos.resposta import Resposta

__all__ = [
    # Base
    "Base",
    "TimestampMixin",
    # Modelos
    "Pesquisa",
    "PerguntaPesquisa",
    "Resposta",
    "Analise",
    # Enums
    "TipoPesquisa",
    "StatusPesquisa",
    "TipoPergunta",
    "TipoAnalise",
]
