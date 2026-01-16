"""
Rotas de API para Pesquisas Persistidas.

Endpoints para CRUD de pesquisas eleitorais no PostgreSQL.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import obter_usuario_atual
from app.core.database import obter_sessao
from app.esquemas.pesquisa import (
    FiltrosPesquisa,
    IniciarPesquisaRequest,
    PesquisaCompleta,
    PesquisaCreate,
    PesquisaListResponse,
    PesquisaResponse,
    PesquisaUpdate,
    RespostaCreate,
    RespostaListResponse,
    RespostaResponse,
    StatusPesquisaEnum,
    StatusResponse,
    TipoPesquisaEnum,
)
from app.modelos import StatusPesquisa, TipoPesquisa
from app.servicos.pesquisa_persistencia_servico import obter_servico_persistencia

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pesquisas", tags=["Pesquisas Persistidas"])


# ============================================
# CRUD DE PESQUISAS
# ============================================


@router.get("", response_model=PesquisaListResponse)
async def listar_pesquisas(
    status: Optional[StatusPesquisaEnum] = None,
    tipo: Optional[TipoPesquisaEnum] = None,
    busca: Optional[str] = None,
    pagina: int = Query(default=1, ge=1),
    por_pagina: int = Query(default=20, ge=1, le=100),
    ordenar_por: str = "criado_em",
    ordem_desc: bool = True,
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Lista todas as pesquisas com filtros e paginação.

    - **status**: Filtrar por status (rascunho, executando, concluida, etc.)
    - **tipo**: Filtrar por tipo (quantitativa, qualitativa, mista)
    - **busca**: Buscar no título e descrição
    - **pagina**: Número da página
    - **por_pagina**: Itens por página
    """
    servico = obter_servico_persistencia(db)

    # Converter enums
    status_db = StatusPesquisa(status.value) if status else None
    tipo_db = TipoPesquisa(tipo.value) if tipo else None

    pesquisas, total = await servico.listar_pesquisas(
        status=status_db,
        tipo=tipo_db,
        busca=busca,
        limite=por_pagina,
        offset=(pagina - 1) * por_pagina,
        ordenar_por=ordenar_por,
        ordem_desc=ordem_desc,
    )

    total_paginas = (total + por_pagina - 1) // por_pagina

    return PesquisaListResponse(
        pesquisas=pesquisas,
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        total_paginas=total_paginas,
    )


@router.post("", response_model=PesquisaResponse, status_code=status.HTTP_201_CREATED)
async def criar_pesquisa(
    dados: PesquisaCreate,
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Cria uma nova pesquisa com suas perguntas.

    A pesquisa é criada com status 'rascunho'.
    """
    servico = obter_servico_persistencia(db)

    # Converter perguntas para dicts
    perguntas = [p.model_dump() for p in dados.perguntas]

    pesquisa = await servico.criar_pesquisa(
        titulo=dados.titulo,
        descricao=dados.descricao,
        tipo=TipoPesquisa(dados.tipo.value),
        instrucao_geral=dados.instrucao_geral,
        perguntas=perguntas,
        eleitores_ids=dados.eleitores_ids,
        limite_custo=dados.limite_custo,
    )

    logger.info(f"Pesquisa criada: id={pesquisa.id}")
    return pesquisa


@router.get("/{pesquisa_id}", response_model=PesquisaCompleta)
async def obter_pesquisa(
    pesquisa_id: int,
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Obtém detalhes de uma pesquisa específica.

    Inclui lista de perguntas.
    """
    servico = obter_servico_persistencia(db)

    pesquisa = await servico.obter_pesquisa(
        pesquisa_id,
        incluir_perguntas=True,
    )

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada",
        )

    return pesquisa


@router.put("/{pesquisa_id}", response_model=PesquisaResponse)
async def atualizar_pesquisa(
    pesquisa_id: int,
    dados: PesquisaUpdate,
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Atualiza uma pesquisa existente.

    Apenas campos fornecidos são atualizados.
    """
    servico = obter_servico_persistencia(db)

    # Filtrar apenas campos não nulos
    campos = {k: v for k, v in dados.model_dump().items() if v is not None}

    # Converter enum de status
    if "status" in campos:
        campos["status"] = StatusPesquisa(campos["status"])

    pesquisa = await servico.atualizar_pesquisa(pesquisa_id, **campos)

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada",
        )

    return pesquisa


@router.delete("/{pesquisa_id}", response_model=StatusResponse)
async def deletar_pesquisa(
    pesquisa_id: int,
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Deleta uma pesquisa e todos os dados relacionados.

    Esta ação é irreversível.
    """
    servico = obter_servico_persistencia(db)

    sucesso = await servico.deletar_pesquisa(pesquisa_id)

    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada",
        )

    return StatusResponse(
        sucesso=True,
        mensagem=f"Pesquisa {pesquisa_id} deletada com sucesso",
    )


# ============================================
# STATUS E EXECUÇÃO
# ============================================


@router.post("/{pesquisa_id}/iniciar", response_model=PesquisaResponse)
async def iniciar_pesquisa(
    pesquisa_id: int,
    config: Optional[IniciarPesquisaRequest] = None,
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Inicia a execução de uma pesquisa.

    Muda o status para 'executando'.
    """
    servico = obter_servico_persistencia(db)

    pesquisa = await servico.iniciar_pesquisa(pesquisa_id)

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada",
        )

    if config and config.limite_custo:
        await servico.atualizar_pesquisa(pesquisa_id, limite_custo=config.limite_custo)

    return pesquisa


@router.post("/{pesquisa_id}/pausar", response_model=PesquisaResponse)
async def pausar_pesquisa(
    pesquisa_id: int,
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Pausa a execução de uma pesquisa.

    A pesquisa pode ser retomada posteriormente.
    """
    servico = obter_servico_persistencia(db)

    pesquisa = await servico.pausar_pesquisa(pesquisa_id)

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada",
        )

    return pesquisa


@router.post("/{pesquisa_id}/finalizar", response_model=PesquisaResponse)
async def finalizar_pesquisa(
    pesquisa_id: int,
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Finaliza a execução de uma pesquisa.

    Muda o status para 'concluida'.
    """
    servico = obter_servico_persistencia(db)

    pesquisa = await servico.finalizar_pesquisa(pesquisa_id)

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada",
        )

    return pesquisa


# ============================================
# RESPOSTAS
# ============================================


@router.get("/{pesquisa_id}/respostas", response_model=RespostaListResponse)
async def listar_respostas(
    pesquisa_id: int,
    pergunta_id: Optional[int] = None,
    eleitor_id: Optional[str] = None,
    pagina: int = Query(default=1, ge=1),
    por_pagina: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Lista respostas de uma pesquisa.

    - **pergunta_id**: Filtrar por pergunta específica
    - **eleitor_id**: Filtrar por eleitor específico
    """
    servico = obter_servico_persistencia(db)

    respostas = await servico.obter_respostas_pesquisa(
        pesquisa_id=pesquisa_id,
        pergunta_id=pergunta_id,
        eleitor_id=eleitor_id,
        limite=por_pagina,
        offset=(pagina - 1) * por_pagina,
    )

    total = await servico.contar_respostas(pesquisa_id, pergunta_id)

    return RespostaListResponse(
        respostas=respostas,
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
    )


@router.post(
    "/{pesquisa_id}/respostas",
    response_model=RespostaResponse,
    status_code=status.HTTP_201_CREATED,
)
async def registrar_resposta(
    pesquisa_id: int,
    dados: RespostaCreate,
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Registra uma nova resposta de eleitor.

    Usado durante a execução da pesquisa para salvar cada resposta.
    """
    servico = obter_servico_persistencia(db)

    resposta = await servico.registrar_resposta(
        pesquisa_id=pesquisa_id,
        pergunta_id=dados.pergunta_id,
        eleitor_id=dados.eleitor_id,
        resposta_texto=dados.resposta_texto,
        resposta_valor=dados.resposta_valor,
        fluxo_cognitivo=dados.fluxo_cognitivo,
        modelo_usado=dados.modelo_usado,
        tokens_entrada=dados.tokens_entrada,
        tokens_saida=dados.tokens_saida,
        custo=dados.custo,
        tempo_resposta_ms=dados.tempo_resposta_ms,
        eleitor_nome=dados.eleitor_nome,
        metadados=dados.metadados,
    )

    return resposta


# ============================================
# ESTATÍSTICAS
# ============================================


@router.get("/estatisticas/globais")
async def obter_estatisticas_globais(
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Obtém estatísticas globais de todas as pesquisas.

    Retorna totais, médias e métricas agregadas.
    """
    servico = obter_servico_persistencia(db)

    estatisticas = await servico.obter_estatisticas_globais()

    return estatisticas
