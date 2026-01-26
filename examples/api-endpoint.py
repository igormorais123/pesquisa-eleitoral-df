"""
Exemplo de Endpoint FastAPI - Padrão INTEIA

Este arquivo demonstra o padrão correto para criar endpoints no backend.
Usar como referência ao criar novos endpoints.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from app.core.database import get_db
from app.core.seguranca import get_current_user
from app.esquemas.eleitor import (
    EleitorCreate,
    EleitorResponse,
    EleitorUpdate,
    EleitorFiltros
)
from app.servicos import eleitor_servico
from app.modelos.usuario import Usuario

# Logger estruturado
logger = structlog.get_logger()

# Router com prefixo e tags
router = APIRouter(
    prefix="/eleitores",
    tags=["eleitores"]
)


@router.get(
    "/",
    response_model=List[EleitorResponse],
    summary="Listar eleitores",
    description="Retorna lista paginada de eleitores com filtros opcionais."
)
async def listar_eleitores(
    db: AsyncSession = Depends(get_db),
    usuario_atual: Usuario = Depends(get_current_user),
    regiao: Optional[str] = Query(None, description="Filtrar por região administrativa"),
    cluster: Optional[str] = Query(None, description="Filtrar por cluster socioeconômico"),
    idade_min: Optional[int] = Query(None, ge=16, le=120),
    idade_max: Optional[int] = Query(None, ge=16, le=120),
    skip: int = Query(0, ge=0, description="Registros a pular"),
    limit: int = Query(100, ge=1, le=1000, description="Limite de registros")
):
    """
    Lista eleitores com filtros opcionais.

    - **regiao**: Nome da região administrativa (ex: "Ceilândia")
    - **cluster**: Cluster socioeconômico (A, B, C, D, E)
    - **idade_min/max**: Faixa etária
    - **skip/limit**: Paginação
    """
    logger.info(
        "listando_eleitores",
        usuario_id=usuario_atual.id,
        filtros={"regiao": regiao, "cluster": cluster}
    )

    filtros = EleitorFiltros(
        regiao=regiao,
        cluster=cluster,
        idade_min=idade_min,
        idade_max=idade_max
    )

    eleitores = await eleitor_servico.listar(
        db=db,
        filtros=filtros,
        skip=skip,
        limit=limit
    )

    return eleitores


@router.get(
    "/{eleitor_id}",
    response_model=EleitorResponse,
    summary="Buscar eleitor por ID"
)
async def buscar_eleitor(
    eleitor_id: int,
    db: AsyncSession = Depends(get_db),
    usuario_atual: Usuario = Depends(get_current_user)
):
    """
    Retorna detalhes de um eleitor específico.

    Raises:
        HTTPException 404: Se eleitor não encontrado
    """
    logger.info("buscando_eleitor", eleitor_id=eleitor_id)

    eleitor = await eleitor_servico.buscar_por_id(db, eleitor_id)

    if not eleitor:
        logger.warning("eleitor_nao_encontrado", eleitor_id=eleitor_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Eleitor com id {eleitor_id} não encontrado"
        )

    return eleitor


@router.post(
    "/",
    response_model=EleitorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar novo eleitor"
)
async def criar_eleitor(
    dados: EleitorCreate,
    db: AsyncSession = Depends(get_db),
    usuario_atual: Usuario = Depends(get_current_user)
):
    """
    Cria um novo eleitor sintético.

    Raises:
        HTTPException 409: Se eleitor já existe (mesmo CPF)
        HTTPException 422: Se dados inválidos
    """
    logger.info(
        "criando_eleitor",
        nome=dados.nome,
        regiao=dados.regiao_administrativa
    )

    try:
        eleitor = await eleitor_servico.criar(db, dados)
        logger.info("eleitor_criado", eleitor_id=eleitor.id)
        return eleitor

    except eleitor_servico.EleitorJaExiste as e:
        logger.warning("eleitor_duplicado", cpf=dados.cpf)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.put(
    "/{eleitor_id}",
    response_model=EleitorResponse,
    summary="Atualizar eleitor"
)
async def atualizar_eleitor(
    eleitor_id: int,
    dados: EleitorUpdate,
    db: AsyncSession = Depends(get_db),
    usuario_atual: Usuario = Depends(get_current_user)
):
    """
    Atualiza dados de um eleitor existente.
    """
    logger.info("atualizando_eleitor", eleitor_id=eleitor_id)

    eleitor = await eleitor_servico.atualizar(db, eleitor_id, dados)

    if not eleitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Eleitor com id {eleitor_id} não encontrado"
        )

    return eleitor


@router.delete(
    "/{eleitor_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deletar eleitor"
)
async def deletar_eleitor(
    eleitor_id: int,
    db: AsyncSession = Depends(get_db),
    usuario_atual: Usuario = Depends(get_current_user)
):
    """
    Remove um eleitor do sistema.
    """
    logger.info("deletando_eleitor", eleitor_id=eleitor_id)

    sucesso = await eleitor_servico.deletar(db, eleitor_id)

    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Eleitor com id {eleitor_id} não encontrado"
        )

    logger.info("eleitor_deletado", eleitor_id=eleitor_id)
