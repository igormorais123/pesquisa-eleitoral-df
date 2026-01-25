"""
Rotas de Pesquisas com Parlamentares

Endpoints para criação e execução de pesquisas com parlamentares.
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from pydantic import BaseModel, Field

from app.servicos.pesquisa_parlamentar_servico import obter_pesquisa_parlamentar_servico

router = APIRouter()


# ============================================
# SCHEMAS
# ============================================


class PerguntaCreate(BaseModel):
    """Criação de pergunta"""
    texto: str = Field(..., min_length=10, max_length=2000)
    tipo: str = Field(default="aberta")
    obrigatoria: bool = True
    opcoes: Optional[List[str]] = None
    escala_min: Optional[int] = None
    escala_max: Optional[int] = None
    instrucoes_ia: Optional[str] = None


class PesquisaParlamentarCreate(BaseModel):
    """Criação de pesquisa com parlamentares"""
    titulo: str = Field(..., min_length=3, max_length=200)
    descricao: Optional[str] = None
    tipo: str = Field(default="mista")
    instrucao_geral: Optional[str] = None
    perguntas: List[PerguntaCreate]
    parlamentares_ids: List[str] = Field(..., min_length=1, max_length=100)


class PesquisaParlamentarUpdate(BaseModel):
    """Atualização de pesquisa"""
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    status: Optional[str] = None
    instrucao_geral: Optional[str] = None


class IniciarPesquisaRequest(BaseModel):
    """Requisição para iniciar pesquisa"""
    limite_custo_reais: float = Field(default=100.0, gt=0, le=500)
    batch_size: int = Field(default=5, ge=1, le=20)
    delay_entre_batches_ms: int = Field(default=500, ge=100, le=5000)
    usar_prompt_simplificado: bool = False


# ============================================
# ENDPOINTS CRUD
# ============================================


@router.get("/", response_model=Dict[str, Any])
async def listar_pesquisas(
    pagina: int = Query(default=1, ge=1),
    por_pagina: int = Query(default=20, ge=1, le=100),
    status: Optional[str] = None,
):
    """Lista pesquisas com parlamentares"""
    servico = obter_pesquisa_parlamentar_servico()
    return servico.listar(pagina=pagina, por_pagina=por_pagina, status=status)


@router.get("/{pesquisa_id}", response_model=Dict[str, Any])
async def obter_pesquisa(pesquisa_id: str):
    """Obtém pesquisa por ID"""
    servico = obter_pesquisa_parlamentar_servico()
    pesquisa = servico.obter_por_id(pesquisa_id)

    if not pesquisa:
        raise HTTPException(status_code=404, detail="Pesquisa não encontrada")

    return pesquisa


@router.post("/", response_model=Dict[str, Any])
async def criar_pesquisa(dados: PesquisaParlamentarCreate):
    """Cria nova pesquisa com parlamentares"""
    servico = obter_pesquisa_parlamentar_servico()

    pesquisa = servico.criar({
        "titulo": dados.titulo,
        "descricao": dados.descricao,
        "tipo": dados.tipo,
        "instrucao_geral": dados.instrucao_geral,
        "perguntas": [p.model_dump() for p in dados.perguntas],
        "parlamentares_ids": dados.parlamentares_ids,
    })

    return pesquisa


@router.patch("/{pesquisa_id}", response_model=Dict[str, Any])
async def atualizar_pesquisa(pesquisa_id: str, dados: PesquisaParlamentarUpdate):
    """Atualiza pesquisa existente"""
    servico = obter_pesquisa_parlamentar_servico()

    pesquisa = servico.atualizar(pesquisa_id, dados.model_dump(exclude_none=True))

    if not pesquisa:
        raise HTTPException(status_code=404, detail="Pesquisa não encontrada")

    return pesquisa


@router.delete("/{pesquisa_id}")
async def deletar_pesquisa(pesquisa_id: str):
    """Remove pesquisa"""
    servico = obter_pesquisa_parlamentar_servico()

    if not servico.deletar(pesquisa_id):
        raise HTTPException(status_code=404, detail="Pesquisa não encontrada")

    return {"mensagem": "Pesquisa removida com sucesso"}


# ============================================
# ENDPOINTS DE EXECUÇÃO
# ============================================


@router.post("/{pesquisa_id}/executar", response_model=Dict[str, Any])
async def iniciar_execucao(
    pesquisa_id: str,
    request: IniciarPesquisaRequest,
    background_tasks: BackgroundTasks,
):
    """
    Inicia execução de pesquisa com parlamentares.

    A execução ocorre em background. Use o endpoint de progresso
    para acompanhar o status.
    """
    servico = obter_pesquisa_parlamentar_servico()

    pesquisa = servico.obter_por_id(pesquisa_id)
    if not pesquisa:
        raise HTTPException(status_code=404, detail="Pesquisa não encontrada")

    if pesquisa["status"] == "executando":
        raise HTTPException(status_code=400, detail="Pesquisa já está em execução")

    # Iniciar em background
    async def executar_em_background():
        try:
            await servico.iniciar_execucao(
                pesquisa_id=pesquisa_id,
                limite_custo=request.limite_custo_reais,
                batch_size=request.batch_size,
                delay_ms=request.delay_entre_batches_ms,
                usar_prompt_simplificado=request.usar_prompt_simplificado,
            )
        except Exception as e:
            print(f"Erro na execução: {e}")

    background_tasks.add_task(executar_em_background)

    return {
        "mensagem": "Execução iniciada",
        "pesquisa_id": pesquisa_id,
        "status": "executando",
    }


@router.post("/{pesquisa_id}/pausar")
async def pausar_execucao(pesquisa_id: str):
    """Pausa execução de pesquisa"""
    servico = obter_pesquisa_parlamentar_servico()

    if not servico.pausar_execucao(pesquisa_id):
        raise HTTPException(status_code=400, detail="Pesquisa não está em execução")

    return {"mensagem": "Execução pausada"}


@router.post("/{pesquisa_id}/retomar")
async def retomar_execucao(pesquisa_id: str):
    """Retoma execução pausada"""
    servico = obter_pesquisa_parlamentar_servico()

    if not servico.retomar_execucao(pesquisa_id):
        raise HTTPException(status_code=400, detail="Pesquisa não está pausada")

    return {"mensagem": "Execução retomada"}


@router.post("/{pesquisa_id}/cancelar")
async def cancelar_execucao(pesquisa_id: str):
    """Cancela execução de pesquisa"""
    servico = obter_pesquisa_parlamentar_servico()

    if not servico.cancelar_execucao(pesquisa_id):
        raise HTTPException(status_code=400, detail="Pesquisa não está em execução")

    return {"mensagem": "Execução cancelada"}


@router.get("/{pesquisa_id}/progresso", response_model=Dict[str, Any])
async def obter_progresso(pesquisa_id: str):
    """Obtém progresso da execução"""
    servico = obter_pesquisa_parlamentar_servico()

    progresso = servico.obter_progresso(pesquisa_id)
    if not progresso:
        raise HTTPException(status_code=404, detail="Pesquisa não encontrada")

    return progresso


# ============================================
# ENDPOINTS DE RESPOSTAS
# ============================================


@router.get("/{pesquisa_id}/respostas", response_model=List[Dict[str, Any]])
async def obter_respostas(
    pesquisa_id: str,
    pergunta_id: Optional[str] = None,
    parlamentar_id: Optional[str] = None,
):
    """Obtém respostas de uma pesquisa"""
    servico = obter_pesquisa_parlamentar_servico()

    respostas = servico.obter_respostas(
        pesquisa_id=pesquisa_id,
        pergunta_id=pergunta_id,
        parlamentar_id=parlamentar_id,
    )

    return respostas


@router.get("/{pesquisa_id}/respostas/por-parlamentar", response_model=Dict[str, Any])
async def obter_respostas_por_parlamentar(pesquisa_id: str):
    """Obtém respostas agrupadas por parlamentar"""
    servico = obter_pesquisa_parlamentar_servico()
    return servico.obter_respostas_por_parlamentar(pesquisa_id)


@router.get("/{pesquisa_id}/respostas/por-pergunta", response_model=Dict[str, Any])
async def obter_respostas_por_pergunta(pesquisa_id: str):
    """Obtém respostas agrupadas por pergunta"""
    servico = obter_pesquisa_parlamentar_servico()
    return servico.obter_respostas_por_pergunta(pesquisa_id)


# ============================================
# ENDPOINTS DE ESTIMATIVA
# ============================================


@router.post("/estimar-custo", response_model=Dict[str, Any])
async def estimar_custo(dados: PesquisaParlamentarCreate):
    """
    Estima custo de uma pesquisa antes de criar.

    Retorna estimativa conservadora usando preço do modelo mais caro.
    """
    from app.servicos.claude_servico import obter_claude_servico

    claude = obter_claude_servico()
    estimativa = claude.estimar_custo(
        total_perguntas=len(dados.perguntas),
        total_eleitores=len(dados.parlamentares_ids),
    )

    return {
        **estimativa,
        "tipo_sujeito": "parlamentar",
        "nota": "Estimativa usa preço Opus 4.5 por segurança. Custo real será menor.",
    }


# ============================================
# ENDPOINTS DE ANÁLISE/RESULTADOS
# ============================================


@router.post("/{pesquisa_id}/analisar", response_model=Dict[str, Any])
async def analisar_pesquisa(pesquisa_id: str):
    """
    Executa análise completa de uma pesquisa com parlamentares.

    Gera estatísticas, insights, mapas de calor e identifica
    padrões de alinhamento partidário.
    """
    from app.servicos.resultado_parlamentar_servico import obter_resultado_parlamentar_servico

    servico = obter_resultado_parlamentar_servico()

    try:
        resultado = servico.analisar_pesquisa(pesquisa_id)
        return resultado
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise: {str(e)}")


@router.get("/{pesquisa_id}/resultados", response_model=Dict[str, Any])
async def listar_resultados(
    pesquisa_id: str,
    pagina: int = Query(default=1, ge=1),
    por_pagina: int = Query(default=20, ge=1, le=100),
):
    """Lista resultados de análises de uma pesquisa"""
    from app.servicos.resultado_parlamentar_servico import obter_resultado_parlamentar_servico

    servico = obter_resultado_parlamentar_servico()
    return servico.listar(pagina=pagina, por_pagina=por_pagina, pesquisa_id=pesquisa_id)


@router.get("/resultados/{resultado_id}", response_model=Dict[str, Any])
async def obter_resultado(resultado_id: str):
    """Obtém resultado de análise por ID"""
    from app.servicos.resultado_parlamentar_servico import obter_resultado_parlamentar_servico

    servico = obter_resultado_parlamentar_servico()
    resultado = servico.obter_por_id(resultado_id)

    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado não encontrado")

    return resultado


@router.delete("/resultados/{resultado_id}")
async def deletar_resultado(resultado_id: str):
    """Remove resultado de análise"""
    from app.servicos.resultado_parlamentar_servico import obter_resultado_parlamentar_servico

    servico = obter_resultado_parlamentar_servico()

    if not servico.deletar(resultado_id):
        raise HTTPException(status_code=404, detail="Resultado não encontrado")

    return {"mensagem": "Resultado removido com sucesso"}
