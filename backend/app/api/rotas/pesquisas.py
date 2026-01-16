"""
Rotas de Pesquisas Persistidas

Endpoints para gerenciamento e consulta de pesquisas no banco de dados.
"""

from datetime import datetime
from typing import Optional
import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.esquemas.pesquisa import (
    FiltrosPesquisa,
    PesquisaCompleta,
    PesquisaCreate,
    PesquisaListResponse,
    PesquisaResponse,
    PesquisaResumo,
    PesquisaUpdate,
    RespostaListResponse,
    RespostaPesquisaCreate,
    RespostaPesquisaResponse,
    StatusPesquisa,
    TipoPesquisa,
)
from app.servicos.pesquisa_servico import PesquisaServico

router = APIRouter()


# ============================================
# CRUD DE PESQUISAS
# ============================================


@router.get("/", response_model=PesquisaListResponse)
async def listar_pesquisas(
    status: Optional[StatusPesquisa] = None,
    tipo: Optional[TipoPesquisa] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    busca: Optional[str] = None,
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Lista todas as pesquisas com filtros e paginação.

    - **status**: Filtrar por status (rascunho, executando, pausada, concluida, erro)
    - **tipo**: Filtrar por tipo (quantitativa, qualitativa, mista)
    - **data_inicio**: Filtrar por data de criação inicial
    - **data_fim**: Filtrar por data de criação final
    - **busca**: Buscar por título ou descrição
    - **pagina**: Página atual (padrão: 1)
    - **por_pagina**: Itens por página (padrão: 20, máx: 100)
    """
    servico = PesquisaServico(db)

    filtros = FiltrosPesquisa(
        status=status,
        tipo=tipo,
        data_inicio=data_inicio,
        data_fim=data_fim,
        busca=busca,
    )

    pesquisas, total = await servico.listar_pesquisas(filtros, pagina, por_pagina)

    return PesquisaListResponse(
        pesquisas=[
            PesquisaResumo(
                id=p.id,
                titulo=p.titulo,
                tipo=TipoPesquisa(p.tipo),
                status=StatusPesquisa(p.status),
                progresso=p.progresso,
                total_eleitores=p.total_eleitores,
                total_perguntas=p.total_perguntas,
                total_respostas=p.total_respostas,
                custo_real=p.custo_real,
                criado_em=p.criado_em,
                concluido_em=p.concluido_em,
            )
            for p in pesquisas
        ],
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        total_paginas=math.ceil(total / por_pagina) if total > 0 else 1,
    )


@router.post("/", response_model=PesquisaResponse, status_code=201)
async def criar_pesquisa(
    dados: PesquisaCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Cria uma nova pesquisa eleitoral.

    Recebe título, descrição, perguntas e lista de IDs dos eleitores.
    """
    servico = PesquisaServico(db)
    pesquisa = await servico.criar_pesquisa(dados)

    return PesquisaResponse(
        id=pesquisa.id,
        titulo=pesquisa.titulo,
        descricao=pesquisa.descricao,
        tipo=TipoPesquisa(pesquisa.tipo),
        instrucao_geral=pesquisa.instrucao_geral,
        status=StatusPesquisa(pesquisa.status),
        progresso=pesquisa.progresso,
        erro_mensagem=pesquisa.erro_mensagem,
        total_eleitores=pesquisa.total_eleitores,
        total_perguntas=pesquisa.total_perguntas,
        total_respostas=pesquisa.total_respostas,
        eleitores_processados=pesquisa.eleitores_processados,
        eleitores_ids=pesquisa.eleitores_ids,
        custo_estimado=pesquisa.custo_estimado,
        custo_real=pesquisa.custo_real,
        tokens_entrada_total=pesquisa.tokens_entrada_total,
        tokens_saida_total=pesquisa.tokens_saida_total,
        limite_custo=pesquisa.limite_custo,
        usar_opus_complexas=pesquisa.usar_opus_complexas,
        batch_size=pesquisa.batch_size,
        criado_em=pesquisa.criado_em,
        atualizado_em=pesquisa.atualizado_em,
        iniciado_em=pesquisa.iniciado_em,
        pausado_em=pesquisa.pausado_em,
        concluido_em=pesquisa.concluido_em,
        perguntas=[],  # Será populado após refresh
    )


@router.get("/{pesquisa_id}", response_model=PesquisaResponse)
async def obter_pesquisa(
    pesquisa_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Obtém detalhes de uma pesquisa específica.
    """
    servico = PesquisaServico(db)
    pesquisa = await servico.obter_pesquisa(pesquisa_id)

    if not pesquisa:
        raise HTTPException(status_code=404, detail="Pesquisa não encontrada")

    return PesquisaResponse(
        id=pesquisa.id,
        titulo=pesquisa.titulo,
        descricao=pesquisa.descricao,
        tipo=TipoPesquisa(pesquisa.tipo),
        instrucao_geral=pesquisa.instrucao_geral,
        status=StatusPesquisa(pesquisa.status),
        progresso=pesquisa.progresso,
        erro_mensagem=pesquisa.erro_mensagem,
        total_eleitores=pesquisa.total_eleitores,
        total_perguntas=pesquisa.total_perguntas,
        total_respostas=pesquisa.total_respostas,
        eleitores_processados=pesquisa.eleitores_processados,
        eleitores_ids=pesquisa.eleitores_ids,
        custo_estimado=pesquisa.custo_estimado,
        custo_real=pesquisa.custo_real,
        tokens_entrada_total=pesquisa.tokens_entrada_total,
        tokens_saida_total=pesquisa.tokens_saida_total,
        limite_custo=pesquisa.limite_custo,
        usar_opus_complexas=pesquisa.usar_opus_complexas,
        batch_size=pesquisa.batch_size,
        criado_em=pesquisa.criado_em,
        atualizado_em=pesquisa.atualizado_em,
        iniciado_em=pesquisa.iniciado_em,
        pausado_em=pesquisa.pausado_em,
        concluido_em=pesquisa.concluido_em,
        perguntas=[],
    )


@router.get("/{pesquisa_id}/completa", response_model=PesquisaCompleta)
async def obter_pesquisa_completa(
    pesquisa_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Obtém pesquisa com todas as respostas.

    Use com cautela - pode retornar muitos dados.
    """
    servico = PesquisaServico(db)
    pesquisa = await servico.obter_pesquisa(pesquisa_id, incluir_respostas=True)

    if not pesquisa:
        raise HTTPException(status_code=404, detail="Pesquisa não encontrada")

    return PesquisaCompleta(
        id=pesquisa.id,
        titulo=pesquisa.titulo,
        descricao=pesquisa.descricao,
        tipo=TipoPesquisa(pesquisa.tipo),
        instrucao_geral=pesquisa.instrucao_geral,
        status=StatusPesquisa(pesquisa.status),
        progresso=pesquisa.progresso,
        erro_mensagem=pesquisa.erro_mensagem,
        total_eleitores=pesquisa.total_eleitores,
        total_perguntas=pesquisa.total_perguntas,
        total_respostas=pesquisa.total_respostas,
        eleitores_processados=pesquisa.eleitores_processados,
        eleitores_ids=pesquisa.eleitores_ids,
        custo_estimado=pesquisa.custo_estimado,
        custo_real=pesquisa.custo_real,
        tokens_entrada_total=pesquisa.tokens_entrada_total,
        tokens_saida_total=pesquisa.tokens_saida_total,
        limite_custo=pesquisa.limite_custo,
        usar_opus_complexas=pesquisa.usar_opus_complexas,
        batch_size=pesquisa.batch_size,
        criado_em=pesquisa.criado_em,
        atualizado_em=pesquisa.atualizado_em,
        iniciado_em=pesquisa.iniciado_em,
        pausado_em=pesquisa.pausado_em,
        concluido_em=pesquisa.concluido_em,
        perguntas=[],
        respostas=[
            RespostaPesquisaResponse(
                id=r.id,
                pesquisa_id=r.pesquisa_id,
                pergunta_id=r.pergunta_id,
                eleitor_id=r.eleitor_id,
                eleitor_nome=r.eleitor_nome,
                eleitor_perfil=r.eleitor_perfil,
                resposta_texto=r.resposta_texto,
                resposta_valor=r.resposta_valor,
                fluxo_cognitivo=r.fluxo_cognitivo,
                sentimento=r.sentimento,
                intensidade_sentimento=r.intensidade_sentimento,
                modelo_usado=r.modelo_usado,
                tokens_entrada=r.tokens_entrada,
                tokens_saida=r.tokens_saida,
                custo_reais=r.custo_reais,
                tempo_resposta_ms=r.tempo_resposta_ms,
                criado_em=r.criado_em,
            )
            for r in pesquisa.respostas
        ],
    )


@router.put("/{pesquisa_id}", response_model=PesquisaResponse)
async def atualizar_pesquisa(
    pesquisa_id: str,
    dados: PesquisaUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Atualiza uma pesquisa existente.
    """
    servico = PesquisaServico(db)
    pesquisa = await servico.atualizar_pesquisa(pesquisa_id, dados)

    if not pesquisa:
        raise HTTPException(status_code=404, detail="Pesquisa não encontrada")

    return PesquisaResponse(
        id=pesquisa.id,
        titulo=pesquisa.titulo,
        descricao=pesquisa.descricao,
        tipo=TipoPesquisa(pesquisa.tipo),
        instrucao_geral=pesquisa.instrucao_geral,
        status=StatusPesquisa(pesquisa.status),
        progresso=pesquisa.progresso,
        erro_mensagem=pesquisa.erro_mensagem,
        total_eleitores=pesquisa.total_eleitores,
        total_perguntas=pesquisa.total_perguntas,
        total_respostas=pesquisa.total_respostas,
        eleitores_processados=pesquisa.eleitores_processados,
        eleitores_ids=pesquisa.eleitores_ids,
        custo_estimado=pesquisa.custo_estimado,
        custo_real=pesquisa.custo_real,
        tokens_entrada_total=pesquisa.tokens_entrada_total,
        tokens_saida_total=pesquisa.tokens_saida_total,
        limite_custo=pesquisa.limite_custo,
        usar_opus_complexas=pesquisa.usar_opus_complexas,
        batch_size=pesquisa.batch_size,
        criado_em=pesquisa.criado_em,
        atualizado_em=pesquisa.atualizado_em,
        iniciado_em=pesquisa.iniciado_em,
        pausado_em=pesquisa.pausado_em,
        concluido_em=pesquisa.concluido_em,
        perguntas=[],
    )


@router.delete("/{pesquisa_id}")
async def deletar_pesquisa(
    pesquisa_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Deleta uma pesquisa e todos os dados relacionados.
    """
    servico = PesquisaServico(db)
    deletado = await servico.deletar_pesquisa(pesquisa_id)

    if not deletado:
        raise HTTPException(status_code=404, detail="Pesquisa não encontrada")

    return {"message": "Pesquisa deletada com sucesso"}


# ============================================
# RESPOSTAS
# ============================================


@router.get("/{pesquisa_id}/respostas", response_model=RespostaListResponse)
async def listar_respostas(
    pesquisa_id: str,
    pergunta_id: Optional[str] = None,
    eleitor_id: Optional[str] = None,
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(50, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    """
    Lista respostas de uma pesquisa com filtros.

    - **pergunta_id**: Filtrar por pergunta específica
    - **eleitor_id**: Filtrar por eleitor específico
    """
    servico = PesquisaServico(db)
    respostas, total = await servico.listar_respostas(
        pesquisa_id, pergunta_id, eleitor_id, pagina, por_pagina
    )

    return RespostaListResponse(
        respostas=[
            RespostaPesquisaResponse(
                id=r.id,
                pesquisa_id=r.pesquisa_id,
                pergunta_id=r.pergunta_id,
                eleitor_id=r.eleitor_id,
                eleitor_nome=r.eleitor_nome,
                eleitor_perfil=r.eleitor_perfil,
                resposta_texto=r.resposta_texto,
                resposta_valor=r.resposta_valor,
                fluxo_cognitivo=r.fluxo_cognitivo,
                sentimento=r.sentimento,
                intensidade_sentimento=r.intensidade_sentimento,
                modelo_usado=r.modelo_usado,
                tokens_entrada=r.tokens_entrada,
                tokens_saida=r.tokens_saida,
                custo_reais=r.custo_reais,
                tempo_resposta_ms=r.tempo_resposta_ms,
                criado_em=r.criado_em,
            )
            for r in respostas
        ],
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        total_paginas=math.ceil(total / por_pagina) if total > 0 else 1,
    )


@router.post("/{pesquisa_id}/respostas", response_model=RespostaPesquisaResponse, status_code=201)
async def registrar_resposta(
    pesquisa_id: str,
    dados: RespostaPesquisaCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Registra uma nova resposta de eleitor.

    Chamado durante a execução da pesquisa para salvar cada resposta.
    """
    # Garantir que o pesquisa_id está correto
    dados.pesquisa_id = pesquisa_id

    servico = PesquisaServico(db)
    resposta = await servico.registrar_resposta(dados)

    return RespostaPesquisaResponse(
        id=resposta.id,
        pesquisa_id=resposta.pesquisa_id,
        pergunta_id=resposta.pergunta_id,
        eleitor_id=resposta.eleitor_id,
        eleitor_nome=resposta.eleitor_nome,
        eleitor_perfil=resposta.eleitor_perfil,
        resposta_texto=resposta.resposta_texto,
        resposta_valor=resposta.resposta_valor,
        fluxo_cognitivo=resposta.fluxo_cognitivo,
        sentimento=resposta.sentimento,
        intensidade_sentimento=resposta.intensidade_sentimento,
        modelo_usado=resposta.modelo_usado,
        tokens_entrada=resposta.tokens_entrada,
        tokens_saida=resposta.tokens_saida,
        custo_reais=resposta.custo_reais,
        tempo_resposta_ms=resposta.tempo_resposta_ms,
        criado_em=resposta.criado_em,
    )


# ============================================
# CONTROLE DE EXECUÇÃO
# ============================================


@router.post("/{pesquisa_id}/iniciar")
async def iniciar_execucao(
    pesquisa_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Marca a pesquisa como em execução.
    """
    servico = PesquisaServico(db)
    pesquisa = await servico.iniciar_execucao(pesquisa_id)

    if not pesquisa:
        raise HTTPException(status_code=404, detail="Pesquisa não encontrada")

    return {"message": "Execução iniciada", "pesquisa_id": pesquisa.id}


@router.post("/{pesquisa_id}/pausar")
async def pausar_execucao(
    pesquisa_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Pausa a execução de uma pesquisa.
    """
    servico = PesquisaServico(db)
    pesquisa = await servico.pausar_execucao(pesquisa_id)

    if not pesquisa:
        raise HTTPException(status_code=404, detail="Pesquisa não encontrada")

    return {"message": "Execução pausada", "pesquisa_id": pesquisa.id}


@router.post("/{pesquisa_id}/retomar")
async def retomar_execucao(
    pesquisa_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Retoma uma pesquisa pausada.
    """
    servico = PesquisaServico(db)
    pesquisa = await servico.retomar_execucao(pesquisa_id)

    if not pesquisa:
        raise HTTPException(status_code=404, detail="Pesquisa não encontrada")

    return {"message": "Execução retomada", "pesquisa_id": pesquisa.id}


@router.post("/{pesquisa_id}/finalizar")
async def finalizar_execucao(
    pesquisa_id: str,
    erro: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Finaliza a execução de uma pesquisa.

    - **erro**: Mensagem de erro se houve falha (opcional)
    """
    servico = PesquisaServico(db)
    pesquisa = await servico.finalizar_execucao(pesquisa_id, erro)

    if not pesquisa:
        raise HTTPException(status_code=404, detail="Pesquisa não encontrada")

    status_msg = "com erro" if erro else "com sucesso"
    return {"message": f"Execução finalizada {status_msg}", "pesquisa_id": pesquisa.id}


@router.put("/{pesquisa_id}/progresso")
async def atualizar_progresso(
    pesquisa_id: str,
    progresso: int = Query(..., ge=0, le=100),
    eleitores_processados: int = Query(..., ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Atualiza o progresso de execução.
    """
    servico = PesquisaServico(db)
    await servico.atualizar_progresso(pesquisa_id, progresso, eleitores_processados)
    return {"message": "Progresso atualizado", "progresso": progresso}
