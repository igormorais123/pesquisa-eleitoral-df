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
from app.modelos.eleitor import (
    Eleitor,
    ClusterSocioeconomico,
    EstiloDecisao,
    Genero,
    InteressePolitico,
    OcupacaoVinculo,
    OrientacaoPolitica,
    PosicaoBolsonaro,
    ToleranciaNuance,
)
from app.modelos.memoria import Memoria, TipoMemoria, UsoAPI
from app.modelos.pergunta import PerguntaPesquisa, TipoPergunta
from app.modelos.pesquisa import Pesquisa, StatusPesquisa, TipoPesquisa
from app.modelos.pesquisa_podc import PesquisaPODC, RespostaPODC, EstatisticasPODC
from app.modelos.resposta import Resposta

# Modelos WhatsApp (Oráculo Eleitoral)
from app.modelos.contato_whatsapp import ContatoWhatsApp
from app.modelos.conversa_whatsapp import ConversaWhatsApp
from app.modelos.mensagem_whatsapp import MensagemWhatsApp

__all__ = [
    # Base
    "Base",
    "TimestampMixin",
    # Modelos
    "Eleitor",
    "Pesquisa",
    "PerguntaPesquisa",
    "Resposta",
    "Analise",
    "Memoria",
    "UsoAPI",
    # Modelos PODC
    "PesquisaPODC",
    "RespostaPODC",
    "EstatisticasPODC",
    # Enums - Eleitor
    "ClusterSocioeconomico",
    "EstiloDecisao",
    "Genero",
    "InteressePolitico",
    "OcupacaoVinculo",
    "OrientacaoPolitica",
    "PosicaoBolsonaro",
    "ToleranciaNuance",
    # Enums - Pesquisa
    "TipoPesquisa",
    "StatusPesquisa",
    "TipoPergunta",
    "TipoAnalise",
    "TipoMemoria",
    # Modelos WhatsApp
    "ContatoWhatsApp",
    "ConversaWhatsApp",
    "MensagemWhatsApp",
]
