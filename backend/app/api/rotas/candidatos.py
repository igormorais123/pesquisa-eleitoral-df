"""
Rotas de Candidatos

API REST para gestão de candidatos eleitorais.
Suporta CRUD completo, filtros e estatísticas.
"""

from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DadosToken, obter_usuario_atual
from app.db.session import get_db
from app.esquemas.candidato import (
    CandidatoCreate,
    CandidatoListResponse,
    CandidatoResponse,
    CandidatoUpdate,
    CargoPretendidoEnum,
    FiltrosCandidato,
    StatusCandidaturaEnum,
)
from app.servicos.candidato_servico import CandidatoServico

router = APIRouter()


async def get_servico(db: AsyncSession = Depends(get_db)) -> CandidatoServico:
    """Dependência para obter o serviço de candidatos"""
    return CandidatoServico(db)


# ============================================
# ENDPOINTS DE LEITURA
# ============================================


@router.get("/", response_model=CandidatoListResponse)
async def listar_candidatos(
    # Filtros de texto
    busca: Optional[str] = Query(None, description="Busca por nome, nome de urna ou partido"),
    # Filtros por lista
    partidos: Optional[str] = Query(None, description="Partidos separados por vírgula"),
    cargos: Optional[str] = Query(None, description="Cargos separados por vírgula"),
    status: Optional[str] = Query(None, description="Status separados por vírgula"),
    orientacoes: Optional[str] = Query(None, description="Orientações políticas separadas por vírgula"),
    generos: Optional[str] = Query(None, description="Gêneros separados por vírgula"),
    # Estado
    apenas_ativos: bool = Query(True, description="Filtrar apenas candidatos ativos"),
    # Paginação
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(50, ge=1, le=100),
    # Ordenação
    ordenar_por: str = Query("nome_urna"),
    ordem: str = Query("asc", pattern="^(asc|desc)$"),
    # Dependencies
    servico: CandidatoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Lista candidatos com filtros avançados.

    Suporta filtros por partido, cargo, status, orientação política e gênero.
    """

    def parse_lista(valor: Optional[str]) -> Optional[List[str]]:
        if valor is None:
            return None
        return [v.strip() for v in valor.split(",") if v.strip()]

    def parse_cargos(valor: Optional[str]) -> Optional[List[CargoPretendidoEnum]]:
        if valor is None:
            return None
        cargos_str = [v.strip() for v in valor.split(",") if v.strip()]
        return [CargoPretendidoEnum(c) for c in cargos_str if c in [e.value for e in CargoPretendidoEnum]]

    def parse_status(valor: Optional[str]) -> Optional[List[StatusCandidaturaEnum]]:
        if valor is None:
            return None
        status_str = [v.strip() for v in valor.split(",") if v.strip()]
        return [StatusCandidaturaEnum(s) for s in status_str if s in [e.value for e in StatusCandidaturaEnum]]

    filtros = FiltrosCandidato(
        busca_texto=busca,
        partidos=parse_lista(partidos),
        cargos=parse_cargos(cargos),
        status=parse_status(status),
        orientacoes_politicas=parse_lista(orientacoes),
        generos=parse_lista(generos),
        apenas_ativos=apenas_ativos,
        pagina=pagina,
        por_pagina=por_pagina,
        ordenar_por=ordenar_por,
        ordem=ordem,
    )

    resultado = await servico.listar(filtros)
    return CandidatoListResponse(**resultado)


@router.get("/estatisticas")
async def obter_estatisticas(
    servico: CandidatoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Retorna estatísticas dos candidatos.

    Inclui distribuição por cargo, partido, gênero e orientação política.
    """
    return await servico.obter_estatisticas()


@router.get("/para-pesquisa")
async def obter_para_pesquisa(
    cargo: Optional[str] = Query(None, description="Filtrar por cargo pretendido"),
    servico: CandidatoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Retorna candidatos formatados para uso em pesquisas eleitorais.

    Útil para montar questionários de intenção de voto.
    """
    return await servico.obter_para_pesquisa(cargo)


@router.get("/por-cargo/{cargo}")
async def obter_por_cargo(
    cargo: str,
    apenas_ativos: bool = Query(True),
    servico: CandidatoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém candidatos por cargo pretendido.

    Útil para listar apenas candidatos a governador, senador, etc.
    """
    candidatos = await servico.obter_por_cargo(cargo, apenas_ativos)
    return {"candidatos": candidatos, "total": len(candidatos)}


@router.get("/{candidato_id}", response_model=CandidatoResponse)
async def obter_candidato(
    candidato_id: str,
    servico: CandidatoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém dados completos de um candidato pelo ID.

    Inclui biografia, propostas, histórico político e todas as métricas.
    """
    candidato = await servico.obter_por_id(candidato_id)
    if not candidato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidato {candidato_id} não encontrado",
        )
    return candidato


# ============================================
# ENDPOINTS DE ESCRITA
# ============================================


@router.post("/", status_code=status.HTTP_201_CREATED)
async def criar_candidato(
    dados: CandidatoCreate,
    servico: CandidatoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Cria um novo candidato.

    Se o ID não for fornecido, será gerado automaticamente.
    """
    try:
        candidato = await servico.criar(dados)
        return candidato
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/lote", status_code=status.HTTP_201_CREATED)
async def criar_candidatos_lote(
    candidatos: List[CandidatoCreate],
    servico: CandidatoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Cria múltiplos candidatos em lote.

    Retorna estatísticas de sucesso/erro.
    """
    dados_json = [c.model_dump() for c in candidatos]
    resultado = await servico.importar_json(dados_json)
    return resultado


@router.post("/importar-json")
async def importar_json(
    dados: List[dict] = Body(...),
    servico: CandidatoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Importa candidatos de JSON bruto.

    Aceita formato flexível, validando campos essenciais.
    Atualiza candidatos existentes se o ID já existir.
    """
    resultado = await servico.importar_json(dados)
    return resultado


@router.put("/{candidato_id}")
async def atualizar_candidato(
    candidato_id: str,
    dados: CandidatoUpdate,
    servico: CandidatoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Atualiza dados de um candidato existente.

    Atualização parcial - apenas campos fornecidos são alterados.
    """
    candidato = await servico.atualizar(candidato_id, dados)
    if not candidato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidato {candidato_id} não encontrado",
        )
    return candidato


@router.delete("/{candidato_id}")
async def deletar_candidato(
    candidato_id: str,
    servico: CandidatoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Remove um candidato.

    Ação irreversível - considere usar desativação ao invés de deleção.
    """
    sucesso = await servico.deletar(candidato_id)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidato {candidato_id} não encontrado",
        )
    return {"mensagem": f"Candidato {candidato_id} removido com sucesso"}


@router.patch("/{candidato_id}/ativar")
async def ativar_candidato(
    candidato_id: str,
    servico: CandidatoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """Ativa um candidato desativado."""
    candidato = await servico.atualizar(candidato_id, CandidatoUpdate(ativo=True))
    if not candidato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidato {candidato_id} não encontrado",
        )
    return candidato


@router.patch("/{candidato_id}/desativar")
async def desativar_candidato(
    candidato_id: str,
    servico: CandidatoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """Desativa um candidato (soft delete)."""
    candidato = await servico.atualizar(candidato_id, CandidatoUpdate(ativo=False))
    if not candidato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidato {candidato_id} não encontrado",
        )
    return candidato
