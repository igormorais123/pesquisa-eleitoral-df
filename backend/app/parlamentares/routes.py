"""
Rotas API de Parlamentares

Endpoints REST para gestão de parlamentares.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import DadosToken, obter_usuario_atual

from .models import (
    CasaLegislativaEnum,
    FiltrosParlamentar,
    ParlamentarListResponse,
    ParlamentarProfile,
    EstatisticasParlamentares,
)
from .services import ParlamentarService
from .integration import adaptar_parlamentar_para_entrevista

router = APIRouter()

# Instância global do serviço (singleton)
_servico: Optional[ParlamentarService] = None


def get_servico() -> ParlamentarService:
    """Obtém instância do serviço de parlamentares"""
    global _servico
    if _servico is None:
        _servico = ParlamentarService()
    return _servico


# ============================================
# ENDPOINTS DE LEITURA
# ============================================


@router.get("/", response_model=ParlamentarListResponse)
async def listar_parlamentares(
    # Por casa legislativa
    casas: Optional[str] = Query(None, description="Casas separadas por vírgula: camara_federal,senado,cldf"),
    # Por partido
    partidos: Optional[str] = Query(None, description="Partidos separados por vírgula"),
    # Por UF
    ufs: Optional[str] = Query(None, description="UFs separadas por vírgula"),
    # Por gênero
    generos: Optional[str] = Query(None, description="Gêneros separados por vírgula"),
    # Busca textual
    busca: Optional[str] = Query(None, description="Busca por nome, partido"),
    # Paginação
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(50, ge=1, le=200),
    # Ordenação
    ordenar_por: str = Query("nome_parlamentar", description="Campo para ordenação"),
    ordem: str = Query("asc", pattern="^(asc|desc)$"),
    servico: ParlamentarService = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Lista parlamentares com filtros.

    Retorna parlamentares das três casas legislativas:
    - Câmara Federal (deputados federais do DF)
    - Senado (senadores do DF)
    - CLDF (deputados distritais)
    """

    def parse_lista(valor: Optional[str]) -> Optional[List[str]]:
        if valor is None:
            return None
        return [v.strip() for v in valor.split(",") if v.strip()]

    def parse_casas(valor: Optional[str]) -> Optional[List[CasaLegislativaEnum]]:
        if valor is None:
            return None
        resultado = []
        for v in valor.split(","):
            v = v.strip()
            if v in [e.value for e in CasaLegislativaEnum]:
                resultado.append(CasaLegislativaEnum(v))
        return resultado if resultado else None

    filtros = FiltrosParlamentar(
        casas=parse_casas(casas),
        partidos=parse_lista(partidos),
        ufs=parse_lista(ufs),
        generos=parse_lista(generos),
        busca_texto=busca,
        pagina=pagina,
        por_pagina=por_pagina,
        ordenar_por=ordenar_por,
        ordem=ordem,
    )

    resultado = await servico.listar(filtros)
    return ParlamentarListResponse(**resultado)


@router.get("/estatisticas", response_model=EstatisticasParlamentares)
async def obter_estatisticas(
    casas: Optional[str] = Query(None),
    servico: ParlamentarService = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Retorna estatísticas dos parlamentares.

    Inclui:
    - Total por casa legislativa
    - Distribuição por partido
    - Distribuição por gênero
    - Completude média dos perfis
    - Data do último snapshot
    """

    def parse_casas(valor: Optional[str]) -> Optional[List[CasaLegislativaEnum]]:
        if valor is None:
            return None
        resultado = []
        for v in valor.split(","):
            v = v.strip()
            if v in [e.value for e in CasaLegislativaEnum]:
                resultado.append(CasaLegislativaEnum(v))
        return resultado if resultado else None

    filtros = None
    if casas:
        filtros = FiltrosParlamentar(casas=parse_casas(casas))

    return await servico.obter_estatisticas(filtros)


@router.get("/por-casa/{casa}", response_model=ParlamentarListResponse)
async def listar_por_casa(
    casa: CasaLegislativaEnum,
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(50, ge=1, le=200),
    servico: ParlamentarService = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Lista parlamentares de uma casa legislativa específica.

    Atalho para filtrar por casa.
    """
    filtros = FiltrosParlamentar(
        casas=[casa],
        pagina=pagina,
        por_pagina=por_pagina,
    )

    resultado = await servico.listar(filtros)
    return ParlamentarListResponse(**resultado)


@router.get("/ids")
async def listar_ids(
    casas: Optional[str] = Query(None),
    partidos: Optional[str] = Query(None),
    servico: ParlamentarService = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Retorna apenas os IDs dos parlamentares filtrados.

    Útil para seleção em pesquisas.
    """

    def parse_lista(valor: Optional[str]) -> Optional[List[str]]:
        if valor is None:
            return None
        return [v.strip() for v in valor.split(",") if v.strip()]

    def parse_casas(valor: Optional[str]) -> Optional[List[CasaLegislativaEnum]]:
        if valor is None:
            return None
        resultado = []
        for v in valor.split(","):
            v = v.strip()
            if v in [e.value for e in CasaLegislativaEnum]:
                resultado.append(CasaLegislativaEnum(v))
        return resultado if resultado else None

    filtros = FiltrosParlamentar(
        casas=parse_casas(casas),
        partidos=parse_lista(partidos),
        por_pagina=500,  # Retornar todos
    )

    resultado = await servico.listar(filtros)
    ids = [p.id for p in resultado["parlamentares"]]

    return {"ids": ids, "total": len(ids)}


@router.get("/{parlamentar_id}")
async def obter_parlamentar(
    parlamentar_id: str,
    servico: ParlamentarService = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém perfil completo de um parlamentar.

    Retorna todas as camadas:
    - Fatos: dados verificáveis
    - Derivados: métricas calculadas
    - Hipóteses: inferências com confiança
    """
    parlamentar = await servico.obter_por_id(parlamentar_id)
    if not parlamentar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parlamentar {parlamentar_id} não encontrado",
        )

    return {
        "fatos": parlamentar.fatos.model_dump(),
        "derivados": parlamentar.derivados.model_dump(),
        "hipoteses": parlamentar.hipoteses.model_dump(),
    }


@router.get("/{parlamentar_id}/para-entrevista")
async def obter_para_entrevista(
    parlamentar_id: str,
    servico: ParlamentarService = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém parlamentar no formato adaptado para entrevista.

    Converte o perfil para o formato esperado pelo motor de entrevista,
    substituindo campos de eleitor por equivalentes parlamentares.
    """
    parlamentar = await servico.obter_por_id(parlamentar_id)
    if not parlamentar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parlamentar {parlamentar_id} não encontrado",
        )

    return adaptar_parlamentar_para_entrevista(parlamentar)


# ============================================
# ENDPOINTS DE SELEÇÃO
# ============================================


@router.post("/por-ids")
async def obter_por_ids(
    ids: List[str],
    servico: ParlamentarService = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém múltiplos parlamentares por lista de IDs.

    Útil para carregar parlamentares selecionados em pesquisas.
    """
    parlamentares = await servico.obter_por_ids(ids)

    return {
        "parlamentares": [
            {
                "id": p.fatos.id,
                "nome": p.fatos.nome_parlamentar,
                "partido": p.fatos.partido,
                "casa": p.fatos.casa_legislativa.value,
                "fatos": p.fatos.model_dump(),
            }
            for p in parlamentares
        ],
        "total": len(parlamentares),
        "ids_nao_encontrados": [id for id in ids if id not in [p.fatos.id for p in parlamentares]],
    }


@router.post("/selecionar-para-entrevista")
async def selecionar_para_entrevista(
    ids: List[str],
    servico: ParlamentarService = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Seleciona parlamentares e retorna no formato de entrevista.

    Retorna lista de parlamentares adaptados para o motor de entrevista.
    """
    parlamentares = await servico.obter_por_ids(ids)

    agentes = [
        adaptar_parlamentar_para_entrevista(p)
        for p in parlamentares
    ]

    return {
        "agentes": agentes,
        "total": len(agentes),
        "ids_selecionados": [a["id"] for a in agentes],
    }
