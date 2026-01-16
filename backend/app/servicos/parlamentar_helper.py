"""
Helper para acesso aos parlamentares

Fornece funções para acessar dados de parlamentares convertidos
para formato de agente de entrevista.
"""

from typing import Any, Dict, List, Optional

from app.parlamentares.services import ParlamentarService
from app.parlamentares.integration import ParlamentarAgentAdapter


def obter_parlamentares_por_ids(ids: List[str]) -> List[Dict[str, Any]]:
    """
    Obtém parlamentares por IDs e converte para formato de agente.

    Args:
        ids: Lista de IDs de parlamentares

    Returns:
        Lista de parlamentares como dicionários no formato de agente
    """
    if not ids:
        return []

    try:
        servico = ParlamentarService()
        parlamentares = []

        for parlamentar_id in ids:
            profile = servico.obter_por_id(parlamentar_id)
            if profile:
                # Converter para formato de agente
                adapter = ParlamentarAgentAdapter(profile)
                agente_dict = adapter.to_agent_dict()
                parlamentares.append(agente_dict)

        return parlamentares

    except Exception as e:
        print(f"[HELPER] Erro ao obter parlamentares: {e}")
        return []


def obter_parlamentar_por_id(parlamentar_id: str) -> Optional[Dict[str, Any]]:
    """
    Obtém um parlamentar por ID e converte para formato de agente.

    Args:
        parlamentar_id: ID do parlamentar

    Returns:
        Parlamentar como dicionário no formato de agente ou None
    """
    try:
        servico = ParlamentarService()
        profile = servico.obter_por_id(parlamentar_id)

        if profile:
            adapter = ParlamentarAgentAdapter(profile)
            return adapter.to_agent_dict()

        return None

    except Exception as e:
        print(f"[HELPER] Erro ao obter parlamentar: {e}")
        return None


def obter_parlamentares_por_casa(
    casa: str,
    limite: int = 100
) -> List[Dict[str, Any]]:
    """
    Obtém todos os parlamentares de uma casa legislativa.

    Args:
        casa: Casa legislativa (camara, senado, cldf)
        limite: Máximo de parlamentares a retornar

    Returns:
        Lista de parlamentares como agentes
    """
    try:
        servico = ParlamentarService()
        resultado = servico.listar(casa_legislativa=casa, por_pagina=limite)
        parlamentares = resultado.get("parlamentares", [])

        agentes = []
        for profile in parlamentares:
            adapter = ParlamentarAgentAdapter(profile)
            agentes.append(adapter.to_agent_dict())

        return agentes

    except Exception as e:
        print(f"[HELPER] Erro ao obter parlamentares por casa: {e}")
        return []


def contar_parlamentares() -> Dict[str, int]:
    """
    Conta parlamentares por casa legislativa.

    Returns:
        Dicionário com contagens por casa e total
    """
    try:
        servico = ParlamentarService()
        stats = servico.obter_estatisticas()

        return {
            "total": stats.get("total", 0),
            "camara": stats.get("por_casa", {}).get("camara", 0),
            "senado": stats.get("por_casa", {}).get("senado", 0),
            "cldf": stats.get("por_casa", {}).get("cldf", 0),
        }

    except Exception as e:
        print(f"[HELPER] Erro ao contar parlamentares: {e}")
        return {"total": 0, "camara": 0, "senado": 0, "cldf": 0}
