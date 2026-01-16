"""
Helper para acesso aos eleitores

Fornece funções de compatibilidade para acessar eleitores tanto do
PostgreSQL (novo) quanto do JSON (legado), permitindo uma transição gradual.
"""

import asyncio
from typing import Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.modelos.eleitor import Eleitor


async def _obter_eleitores_por_ids_db(ids: List[str]) -> List[Dict]:
    """
    Obtém eleitores do PostgreSQL de forma assíncrona.

    Args:
        ids: Lista de IDs de eleitores

    Returns:
        Lista de eleitores como dicionários
    """
    if not ids:
        return []

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Eleitor).where(Eleitor.id.in_(ids))
        )
        eleitores = result.scalars().all()
        return [e.to_dict() for e in eleitores]


async def _obter_eleitor_por_id_db(eleitor_id: str) -> Optional[Dict]:
    """
    Obtém um eleitor do PostgreSQL de forma assíncrona.

    Args:
        eleitor_id: ID do eleitor

    Returns:
        Eleitor como dicionário ou None
    """
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Eleitor).where(Eleitor.id == eleitor_id)
        )
        eleitor = result.scalar_one_or_none()
        return eleitor.to_dict() if eleitor else None


async def _contar_eleitores_db() -> int:
    """Conta eleitores no PostgreSQL"""
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Eleitor.id))
        return len(result.all())


def obter_eleitores_por_ids(ids: List[str]) -> List[Dict]:
    """
    Obtém eleitores por IDs (compatível com código síncrono).

    Tenta primeiro o PostgreSQL, depois JSON como fallback.

    Args:
        ids: Lista de IDs de eleitores

    Returns:
        Lista de eleitores como dicionários
    """
    if not ids:
        return []

    try:
        # Tenta obter do banco de dados
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Se já estamos em um loop async, cria uma nova task
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, _obter_eleitores_por_ids_db(ids))
                eleitores = future.result(timeout=30)
        else:
            eleitores = asyncio.run(_obter_eleitores_por_ids_db(ids))

        if eleitores:
            return eleitores

    except Exception as e:
        print(f"[HELPER] Aviso ao acessar DB: {e}")

    # Fallback para JSON
    try:
        from app.servicos.eleitor_servico import obter_servico_eleitores
        servico_json = obter_servico_eleitores()
        return servico_json.obter_por_ids(ids)
    except Exception as e:
        print(f"[HELPER] Erro ao acessar JSON: {e}")
        return []


def obter_eleitor_por_id(eleitor_id: str) -> Optional[Dict]:
    """
    Obtém um eleitor por ID (compatível com código síncrono).

    Args:
        eleitor_id: ID do eleitor

    Returns:
        Eleitor como dicionário ou None
    """
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, _obter_eleitor_por_id_db(eleitor_id))
                return future.result(timeout=10)
        else:
            return asyncio.run(_obter_eleitor_por_id_db(eleitor_id))

    except Exception as e:
        print(f"[HELPER] Aviso ao acessar DB: {e}")

    # Fallback para JSON
    try:
        from app.servicos.eleitor_servico import obter_servico_eleitores
        servico_json = obter_servico_eleitores()
        return servico_json.obter_por_id(eleitor_id)
    except Exception as e:
        print(f"[HELPER] Erro ao acessar JSON: {e}")
        return None
