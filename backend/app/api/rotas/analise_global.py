"""
Rotas de API para Análise Global.

Endpoints para dashboard, correlações, tendências e insights acumulativos.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import obter_usuario_atual
from app.core.database import obter_sessao
from app.esquemas.analise_global import (
    CorrelacoesResponse,
    DashboardGlobal,
    DatasetExportacao,
    HistoricoEleitorResponse,
    InsightsResponse,
    OutliersResponse,
    SegmentosResponse,
    TendenciasResponse,
)
from app.servicos.analise_acumulativa_servico import obter_servico_analise_acumulativa
from app.servicos.pesquisa_persistencia_servico import obter_servico_persistencia

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analise", tags=["Análise Global"])


# ============================================
# DASHBOARD
# ============================================


@router.get("/dashboard", response_model=DashboardGlobal)
async def obter_dashboard(
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Obtém métricas globais para o dashboard.

    Retorna:
    - Total de pesquisas por status
    - Total de respostas
    - Eleitores únicos
    - Custo e tokens acumulados
    """
    servico = obter_servico_persistencia(db)
    stats = await servico.obter_estatisticas_globais()
    return DashboardGlobal.from_estatisticas(stats)


# ============================================
# CORRELAÇÕES
# ============================================


@router.get("/correlacoes", response_model=CorrelacoesResponse)
async def obter_correlacoes(
    variaveis: Optional[str] = Query(
        None,
        description="Variáveis para correlacionar (separadas por vírgula)",
    ),
    pesquisa_ids: Optional[str] = Query(
        None,
        description="IDs de pesquisas (separados por vírgula)",
    ),
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Calcula correlações entre variáveis.

    Variáveis disponíveis:
    - intensidade_media
    - mudanca_voto
    - sentimento_positivo
    - sentimento_negativo
    - tokens_media
    - tempo_resposta_media
    """
    servico = obter_servico_analise_acumulativa(db)

    # Processar parâmetros
    lista_variaveis = variaveis.split(",") if variaveis else None
    lista_pesquisas = (
        [int(x.strip()) for x in pesquisa_ids.split(",")]
        if pesquisa_ids
        else None
    )

    resultado = await servico.calcular_correlacoes_globais(
        variaveis=lista_variaveis,
        pesquisa_ids=lista_pesquisas,
    )

    return CorrelacoesResponse(**resultado)


# ============================================
# TENDÊNCIAS
# ============================================


@router.get("/tendencias", response_model=TendenciasResponse)
async def obter_tendencias(
    periodo_dias: int = Query(default=30, ge=7, le=365),
    metricas: Optional[str] = Query(
        None,
        description="Métricas para analisar (separadas por vírgula)",
    ),
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Identifica tendências temporais.

    Analisa evolução de métricas ao longo do tempo,
    agrupando por semana.
    """
    servico = obter_servico_analise_acumulativa(db)

    lista_metricas = metricas.split(",") if metricas else None

    resultado = await servico.identificar_tendencias_temporais(
        periodo_dias=periodo_dias,
        metricas=lista_metricas,
    )

    return TendenciasResponse(**resultado)


# ============================================
# SEGMENTOS
# ============================================


@router.get("/segmentos/{campo}", response_model=SegmentosResponse)
async def obter_segmentos(
    campo: str,
    pesquisa_ids: Optional[str] = Query(
        None,
        description="IDs de pesquisas (separados por vírgula)",
    ),
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Analisa comportamento por segmento/perfil.

    Campos comuns:
    - cluster_socioeconomico
    - regiao_administrativa
    - orientacao_politica
    - faixa_etaria
    """
    servico = obter_servico_analise_acumulativa(db)

    lista_pesquisas = (
        [int(x.strip()) for x in pesquisa_ids.split(",")]
        if pesquisa_ids
        else None
    )

    resultado = await servico.agrupar_por_perfil_eleitor(
        campo_agrupamento=campo,
        pesquisa_ids=lista_pesquisas,
    )

    return SegmentosResponse(**resultado)


# ============================================
# OUTLIERS
# ============================================


@router.get("/outliers", response_model=OutliersResponse)
async def detectar_outliers(
    pesquisa_id: Optional[int] = None,
    limite_desvios: float = Query(default=2.0, ge=1.0, le=4.0),
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Detecta respostas atípicas (outliers).

    Identifica respostas com tempo de resposta muito alto/baixo,
    textos muito curtos/longos, etc.
    """
    servico = obter_servico_analise_acumulativa(db)

    resultado = await servico.detectar_outliers(
        pesquisa_id=pesquisa_id,
        limite_desvios=limite_desvios,
    )

    return OutliersResponse(**resultado)


# ============================================
# INSIGHTS
# ============================================


@router.get("/insights", response_model=InsightsResponse)
async def obter_insights(
    limite: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Gera insights cumulativos.

    Analisa todas as pesquisas para descobrir padrões,
    tendências e descobertas relevantes.
    """
    servico = obter_servico_analise_acumulativa(db)

    resultado = await servico.gerar_insights_cumulativos(
        limite_insights=limite,
    )

    return InsightsResponse(**resultado)


# ============================================
# HISTÓRICO
# ============================================


@router.get("/historico/eleitor/{eleitor_id}", response_model=HistoricoEleitorResponse)
async def obter_historico_eleitor(
    eleitor_id: str,
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Obtém histórico completo de participação de um eleitor.

    Mostra todas as pesquisas em que o eleitor participou,
    com métricas agregadas por pesquisa.
    """
    servico = obter_servico_analise_acumulativa(db)

    resultado = await servico.obter_historico_eleitor(eleitor_id)

    return HistoricoEleitorResponse(**resultado)


# ============================================
# EXPORTAÇÃO
# ============================================


@router.get("/exportar", response_model=DatasetExportacao)
async def exportar_dataset(
    pesquisa_ids: Optional[str] = Query(
        None,
        description="IDs de pesquisas (separados por vírgula)",
    ),
    formato: str = Query(default="dict", regex="^(dict|json)$"),
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Exporta dataset completo para análise externa.

    Inclui todas as pesquisas e respostas com metadados.
    """
    servico = obter_servico_analise_acumulativa(db)

    lista_pesquisas = (
        [int(x.strip()) for x in pesquisa_ids.split(",")]
        if pesquisa_ids
        else None
    )

    resultado = await servico.exportar_dataset_completo(
        formato=formato,
        pesquisa_ids=lista_pesquisas,
    )

    return DatasetExportacao(**resultado)


@router.get("/exportar/download")
async def download_dataset(
    pesquisa_ids: Optional[str] = Query(None),
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Faz download do dataset em formato JSON.

    Retorna arquivo para download direto.
    """
    servico = obter_servico_analise_acumulativa(db)

    lista_pesquisas = (
        [int(x.strip()) for x in pesquisa_ids.split(",")]
        if pesquisa_ids
        else None
    )

    resultado = await servico.exportar_dataset_completo(
        formato="json",
        pesquisa_ids=lista_pesquisas,
    )

    return JSONResponse(
        content=resultado,
        headers={
            "Content-Disposition": "attachment; filename=dataset_pesquisas.json",
        },
    )
