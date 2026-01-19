"""
Rotas de Entrevistas

API REST para gestão e execução de entrevistas.
"""

from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status

from app.api.deps import DadosToken, obter_usuario_atual
from app.esquemas.entrevista import (
    EntrevistaCreate,
    EntrevistaUpdate,
    IniciarEntrevistaRequest,
)
from app.servicos.claude_servico import obter_claude_servico
from app.servicos.entrevista_servico import EntrevistaServico, obter_entrevista_servico

router = APIRouter()


def get_servico() -> EntrevistaServico:
    """Dependência para obter o serviço"""
    return obter_entrevista_servico()


# ============================================
# CRUD
# ============================================


@router.get("/")
async def listar_entrevistas(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    servico: EntrevistaServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Lista entrevistas com paginação.

    - **status**: Filtrar por status (rascunho, executando, concluida, erro)
    """
    return servico.listar(pagina=pagina, por_pagina=por_pagina, status=status)


@router.get("/{entrevista_id}")
async def obter_entrevista(
    entrevista_id: str,
    servico: EntrevistaServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém detalhes de uma entrevista.
    """
    entrevista = servico.obter_por_id(entrevista_id)
    if not entrevista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entrevista {entrevista_id} não encontrada",
        )
    return entrevista


@router.post("/", status_code=status.HTTP_201_CREATED)
async def criar_entrevista(
    dados: EntrevistaCreate,
    servico: EntrevistaServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Cria uma nova entrevista.

    - **titulo**: Título da entrevista
    - **tipo**: Tipo (quantitativa, qualitativa, mista)
    - **perguntas**: Lista de perguntas
    - **eleitores_ids**: IDs dos eleitores que responderão (legado, compatibilidade)
    - **tipo_respondente**: Tipo de respondente (eleitor ou parlamentar)
    - **respondentes_ids**: IDs dos respondentes (eleitores ou parlamentares)
    """
    try:
        return servico.criar(dados)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{entrevista_id}")
async def atualizar_entrevista(
    entrevista_id: str,
    dados: EntrevistaUpdate,
    servico: EntrevistaServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Atualiza uma entrevista existente.
    """
    entrevista = servico.atualizar(entrevista_id, dados)
    if not entrevista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entrevista {entrevista_id} não encontrada",
        )
    return entrevista


@router.delete("/{entrevista_id}")
async def deletar_entrevista(
    entrevista_id: str,
    servico: EntrevistaServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Remove uma entrevista e suas respostas.
    """
    if not servico.deletar(entrevista_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entrevista {entrevista_id} não encontrada",
        )
    return {"mensagem": f"Entrevista {entrevista_id} removida com sucesso"}


# ============================================
# EXECUÇÃO
# ============================================


@router.post("/{entrevista_id}/iniciar")
async def iniciar_execucao(
    entrevista_id: str,
    config: IniciarEntrevistaRequest,
    background_tasks: BackgroundTasks,
    servico: EntrevistaServico = Depends(get_servico),
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Inicia a execução de uma entrevista.

    A execução ocorre em background e pode ser monitorada via endpoint de progresso.
    As memórias geradas são associadas ao usuário que iniciou a execução.
    """
    entrevista = servico.obter_por_id(entrevista_id)
    if not entrevista:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entrevista {entrevista_id} não encontrada",
        )

    if entrevista["status"] == "executando":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Entrevista já está em execução",
        )

    # Capturar dados do usuário para passar ao background task
    usuario_id = usuario.usuario_id
    usuario_nome = usuario.nome

    # Iniciar execução em background
    async def executar():
        try:
            await servico.iniciar_execucao(
                entrevista_id=entrevista_id,
                limite_custo=config.limite_custo_reais,
                batch_size=config.batch_size,
                delay_ms=config.delay_entre_batches_ms,
                usuario_id=usuario_id,
                usuario_nome=usuario_nome,
            )
        except Exception as e:
            print(f"Erro na execução: {e}")

    background_tasks.add_task(executar)

    return {
        "mensagem": "Execução iniciada",
        "entrevista_id": entrevista_id,
        "config": config.model_dump(),
        "executado_por": usuario_nome,
    }


@router.post("/{entrevista_id}/pausar")
async def pausar_execucao(
    entrevista_id: str,
    servico: EntrevistaServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Pausa a execução de uma entrevista.
    """
    if servico.pausar_execucao(entrevista_id):
        return {"mensagem": "Execução pausada", "entrevista_id": entrevista_id}
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Entrevista não está em execução",
    )


@router.post("/{entrevista_id}/retomar")
async def retomar_execucao(
    entrevista_id: str,
    servico: EntrevistaServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Retoma a execução de uma entrevista pausada.
    """
    if servico.retomar_execucao(entrevista_id):
        return {"mensagem": "Execução retomada", "entrevista_id": entrevista_id}
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST, detail="Entrevista não está pausada"
    )


@router.post("/{entrevista_id}/cancelar")
async def cancelar_execucao(
    entrevista_id: str,
    servico: EntrevistaServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Cancela a execução de uma entrevista.
    """
    if servico.cancelar_execucao(entrevista_id):
        return {"mensagem": "Execução cancelada", "entrevista_id": entrevista_id}
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Entrevista não está em execução",
    )


@router.get("/{entrevista_id}/progresso")
async def obter_progresso(
    entrevista_id: str,
    servico: EntrevistaServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém o progresso da execução.
    """
    progresso = servico.obter_progresso(entrevista_id)
    if not progresso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entrevista {entrevista_id} não encontrada",
        )
    return progresso


# ============================================
# RESPOSTAS
# ============================================


@router.get("/{entrevista_id}/respostas")
async def listar_respostas(
    entrevista_id: str,
    pergunta_id: Optional[str] = Query(None),
    eleitor_id: Optional[str] = Query(None),
    respondente_id: Optional[str] = Query(None),
    servico: EntrevistaServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Lista respostas de uma entrevista.

    - **pergunta_id**: Filtrar por pergunta específica
    - **eleitor_id**: Filtrar por eleitor específico (legado, compatibilidade)
    - **respondente_id**: Filtrar por respondente específico (eleitor ou parlamentar)
    """
    # Se respondente_id for fornecido, usa ele; senão usa eleitor_id (compatibilidade)
    filtro_respondente = respondente_id or eleitor_id
    respostas = servico.obter_respostas(
        entrevista_id=entrevista_id, pergunta_id=pergunta_id, eleitor_id=filtro_respondente
    )
    return {"respostas": respostas, "total": len(respostas)}


# ============================================
# UTILITÁRIOS
# ============================================


@router.post("/estimar-custo")
async def estimar_custo(
    total_perguntas: int = Query(..., ge=1, le=50),
    total_eleitores: int = Query(..., ge=1, le=500),
    proporcao_opus: float = Query(0.2, ge=0, le=1),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Estima o custo de uma entrevista antes de criar.

    - **total_perguntas**: Número de perguntas
    - **total_eleitores**: Número de eleitores
    - **proporcao_opus**: Proporção de chamadas que usarão Opus (0-1)
    """
    claude = obter_claude_servico()
    return claude.estimar_custo(
        total_perguntas=total_perguntas,
        total_eleitores=total_eleitores,
        proporcao_opus=proporcao_opus,
    )
