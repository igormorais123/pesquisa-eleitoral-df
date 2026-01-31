"""
Prompts do sistema Oráculo Eleitoral.

Contém os prompts de sistema para todos os agentes especializados
em inteligência eleitoral para o Distrito Federal - Eleições 2026.
"""

from .supervisor import PROMPT_SUPERVISOR
from .oraculo import PROMPT_ORACULO_DADOS
from .simulador import PROMPT_SIMULADOR
from .estrategista import PROMPT_ESTRATEGISTA
from .memoria import PROMPT_MEMORIA
from .radar import PROMPT_RADAR
from .conteudo import PROMPT_CONTEUDO
from .cabos import PROMPT_CABOS
from .pesquisador import PROMPT_PESQUISADOR

__all__ = [
    "PROMPT_SUPERVISOR",
    "PROMPT_ORACULO_DADOS",
    "PROMPT_SIMULADOR",
    "PROMPT_ESTRATEGISTA",
    "PROMPT_MEMORIA",
    "PROMPT_RADAR",
    "PROMPT_CONTEUDO",
    "PROMPT_CABOS",
    "PROMPT_PESQUISADOR",
]
