"""
Helper para acesso aos parlamentares

Fornece funções para acessar dados de parlamentares convertidos
para formato de agente de entrevista.

Nota: O ParlamentarService usa métodos assíncronos internamente,
mas este helper fornece interface síncrona para compatibilidade
com o sistema de entrevistas existente.
"""

import asyncio
from typing import Any, Dict, List, Optional

from app.parlamentares.services import ParlamentarService
from app.parlamentares.integration import ParlamentarAgentAdapter
from app.parlamentares.models import FiltrosParlamentar, CasaLegislativaEnum


def _run_async(coro):
    """
    Executa uma corrotina de forma síncrona.
    Lida com casos onde já existe um event loop rodando.
    """
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Se já estamos em um loop async, cria uma nova thread
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, coro)
                return future.result(timeout=30)
        else:
            return asyncio.run(coro)
    except RuntimeError:
        # Não há event loop, criar um novo
        return asyncio.run(coro)


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
        async def _obter():
            servico = ParlamentarService()
            await servico.carregar_todos()

            parlamentares = []
            for parlamentar_id in ids:
                profile = await servico.obter_por_id(parlamentar_id)
                if profile:
                    adapter = ParlamentarAgentAdapter(profile)
                    agente_dict = adapter.to_agent_dict()
                    parlamentares.append(agente_dict)

            return parlamentares

        return _run_async(_obter())

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
        async def _obter():
            servico = ParlamentarService()
            await servico.carregar_todos()
            profile = await servico.obter_por_id(parlamentar_id)

            if profile:
                adapter = ParlamentarAgentAdapter(profile)
                return adapter.to_agent_dict()

            return None

        return _run_async(_obter())

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
        casa: Casa legislativa (camara_federal, senado, cldf)
        limite: Máximo de parlamentares a retornar

    Returns:
        Lista de parlamentares como agentes
    """
    try:
        # Converter string para enum
        casa_enum = CasaLegislativaEnum(casa)

        async def _obter():
            servico = ParlamentarService()
            await servico.carregar_todos()

            filtros = FiltrosParlamentar(
                casas=[casa_enum],
                por_pagina=limite
            )

            resultado = await servico.listar(filtros)
            parlamentares = resultado.get("parlamentares", [])

            agentes = []
            for parl_response in parlamentares:
                # Obter profile completo para criar adapter
                profile = await servico.obter_por_id(parl_response.id)
                if profile:
                    adapter = ParlamentarAgentAdapter(profile)
                    agentes.append(adapter.to_agent_dict())

            return agentes

        return _run_async(_obter())

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
        async def _contar():
            servico = ParlamentarService()
            await servico.carregar_todos()
            stats = await servico.obter_estatisticas()

            return {
                "total": stats.total,
                "camara_federal": stats.por_casa.get("camara_federal", 0),
                "senado": stats.por_casa.get("senado", 0),
                "cldf": stats.por_casa.get("cldf", 0),
            }

        return _run_async(_contar())

    except Exception as e:
        print(f"[HELPER] Erro ao contar parlamentares: {e}")
        return {"total": 0, "camara_federal": 0, "senado": 0, "cldf": 0}
