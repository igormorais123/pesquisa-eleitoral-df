"""
Rotas de Analytics e Histórico

Endpoints para análises globais, correlações, tendências e histórico de pesquisas.
"""

import csv
import io
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.esquemas.pesquisa import (
    CorrelacaoGlobal,
    DashboardGlobal,
    HistoricoEleitor,
    InsightGlobal,
    SegmentoAnalise,
    TendenciaTemporal,
)
from app.servicos.analise_acumulativa_servico import AnaliseAcumulativaServico
from app.servicos.pesquisa_servico import PesquisaServico

router = APIRouter()


# ============================================
# DASHBOARD GLOBAL
# ============================================


@router.get("/dashboard", response_model=DashboardGlobal)
async def obter_dashboard_global(
    db: AsyncSession = Depends(get_db),
):
    """
    Obtém métricas globais do sistema.

    Retorna:
    - Total de pesquisas e pesquisas concluídas
    - Total de respostas coletadas
    - Total de eleitores únicos participantes
    - Custos e tokens acumulados
    - Médias por pesquisa
    - Distribuição de sentimentos
    """
    servico = PesquisaServico(db)
    return await servico.obter_metricas_globais()


# ============================================
# CORRELAÇÕES
# ============================================


@router.get("/correlacoes", response_model=List[CorrelacaoGlobal])
async def obter_correlacoes(
    variaveis: Optional[str] = Query(
        None,
        description="Lista de variáveis separadas por vírgula (ex: cluster,orientacao,religiao)",
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    Calcula correlações entre variáveis de perfil e sentimentos.

    Variáveis disponíveis:
    - cluster_socioeconomico
    - orientacao_politica
    - religiao
    - escolaridade
    - regiao_administrativa
    - genero
    - faixa_etaria
    """
    servico = AnaliseAcumulativaServico(db)

    lista_variaveis = None
    if variaveis:
        lista_variaveis = [v.strip() for v in variaveis.split(",")]

    return await servico.calcular_correlacoes_globais(lista_variaveis)


# ============================================
# TENDÊNCIAS TEMPORAIS
# ============================================


@router.get("/tendencias", response_model=List[TendenciaTemporal])
async def obter_tendencias(
    periodo: str = Query(
        "mensal",
        description="Granularidade: diario, semanal ou mensal",
        pattern="^(diario|semanal|mensal)$",
    ),
    meses: int = Query(12, ge=1, le=36, description="Quantidade de meses para analisar"),
    db: AsyncSession = Depends(get_db),
):
    """
    Calcula tendências ao longo do tempo.

    Retorna para cada período:
    - Pesquisas realizadas
    - Respostas coletadas
    - Custo total
    - Sentimento médio
    """
    servico = AnaliseAcumulativaServico(db)
    return await servico.calcular_tendencias_temporais(periodo, meses)


# ============================================
# ANÁLISE POR SEGMENTO
# ============================================


@router.get("/segmentos/{tipo}", response_model=List[SegmentoAnalise])
async def analisar_segmento(
    tipo: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Analisa respostas agrupadas por segmento de eleitores.

    Tipos de segmento:
    - **cluster**: Por cluster socioeconômico
    - **regiao**: Por região administrativa
    - **orientacao**: Por orientação política
    - **religiao**: Por religião
    - **genero**: Por gênero
    - **escolaridade**: Por nível de escolaridade
    - **faixa_etaria**: Por faixa etária
    """
    servico = AnaliseAcumulativaServico(db)
    return await servico.analisar_segmento(tipo)


# ============================================
# INSIGHTS AUTOMÁTICOS
# ============================================


@router.get("/insights", response_model=List[InsightGlobal])
async def obter_insights(
    db: AsyncSession = Depends(get_db),
):
    """
    Gera insights automáticos a partir dos dados acumulados.

    Analisa:
    - Correlações significativas
    - Tendências de mudança
    - Segmentos com comportamentos distintos
    - Eleitores com múltiplas participações
    """
    servico = AnaliseAcumulativaServico(db)
    return await servico.gerar_insights_globais()


# ============================================
# HISTÓRICO
# ============================================


@router.get("/historico/eleitor/{eleitor_id}")
async def obter_historico_eleitor(
    eleitor_id: str,
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Obtém histórico completo de participações de um eleitor.

    Retorna:
    - Total de participações
    - Lista de pesquisas com respostas
    - Sentimento médio ao longo do tempo
    - Temas recorrentes
    """
    servico = PesquisaServico(db)
    return await servico.obter_historico_eleitor(eleitor_id)


@router.get("/historico/busca")
async def buscar_em_respostas(
    texto: str = Query(..., min_length=3, description="Texto a buscar nas respostas"),
    limite: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    """
    Busca texto em todas as respostas.

    Útil para encontrar menções a temas específicos.
    """
    servico = PesquisaServico(db)
    respostas = await servico.buscar_respostas_texto(texto, limite)

    return {
        "termo_busca": texto,
        "total_encontrado": len(respostas),
        "respostas": [
            {
                "id": r.id,
                "pesquisa_id": r.pesquisa_id,
                "eleitor_nome": r.eleitor_nome,
                "resposta_texto": r.resposta_texto[:500],
                "sentimento": r.sentimento,
                "criado_em": r.criado_em.isoformat() if r.criado_em else None,
            }
            for r in respostas
        ],
    }


# ============================================
# EXPORTAÇÃO
# ============================================


@router.get("/exportar")
async def exportar_dataset(
    formato: str = Query("json", pattern="^(json|csv)$"),
    tipo: str = Query(
        "respostas",
        pattern="^(respostas|pesquisas|eleitores|dashboard)$",
        description="Tipo de dados a exportar"
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    Exporta todos os dados em formato estruturado.

    **Formatos:**
    - `json`: Retorna JSON completo
    - `csv`: Retorna arquivo CSV para download

    **Tipos de dados:**
    - `respostas`: Todas as respostas das pesquisas
    - `pesquisas`: Lista de pesquisas realizadas
    - `eleitores`: Dados agregados de eleitores
    - `dashboard`: Métricas consolidadas
    """
    servico = AnaliseAcumulativaServico(db)
    dados = await servico.exportar_dataset_completo()

    if formato == "json":
        return JSONResponse(content=dados)

    # Exportação CSV
    output = io.StringIO()

    # Selecionar dados baseado no tipo
    if tipo == "respostas" and "respostas" in dados:
        registros = dados.get("respostas", [])
        if registros:
            writer = csv.DictWriter(output, fieldnames=registros[0].keys())
            writer.writeheader()
            writer.writerows(registros)
    elif tipo == "pesquisas" and "pesquisas" in dados:
        registros = dados.get("pesquisas", [])
        if registros:
            writer = csv.DictWriter(output, fieldnames=registros[0].keys())
            writer.writeheader()
            writer.writerows(registros)
    elif tipo == "eleitores" and "eleitores" in dados:
        registros = dados.get("eleitores", [])
        if registros:
            writer = csv.DictWriter(output, fieldnames=registros[0].keys())
            writer.writeheader()
            writer.writerows(registros)
    elif tipo == "dashboard":
        # Dashboard é um objeto único, converter para linhas
        dashboard = dados.get("dashboard", dados)
        registros = [{"metrica": k, "valor": v} for k, v in dashboard.items() if not isinstance(v, (dict, list))]
        if registros:
            writer = csv.DictWriter(output, fieldnames=["metrica", "valor"])
            writer.writeheader()
            writer.writerows(registros)
    else:
        # Fallback: tentar exportar o primeiro array encontrado
        for key, value in dados.items():
            if isinstance(value, list) and value and isinstance(value[0], dict):
                writer = csv.DictWriter(output, fieldnames=value[0].keys())
                writer.writeheader()
                writer.writerows(value)
                break
        else:
            # Se não encontrar arrays, converter dict raiz
            registros = [{"chave": k, "valor": str(v)} for k, v in dados.items()]
            writer = csv.DictWriter(output, fieldnames=["chave", "valor"])
            writer.writeheader()
            writer.writerows(registros)

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=pesquisa_eleitoral_{tipo}.csv"
        }
    )


# ============================================
# COMPARAÇÕES
# ============================================


@router.get("/comparar/pesquisas")
async def comparar_pesquisas(
    ids: str = Query(
        ...,
        description="IDs das pesquisas separados por vírgula (ex: id1,id2,id3)",
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    Compara estatísticas de múltiplas pesquisas.

    Útil para análise longitudinal.
    """
    servico = PesquisaServico(db)
    lista_ids = [id.strip() for id in ids.split(",")]

    comparacao = []
    for pesquisa_id in lista_ids:
        pesquisa = await servico.obter_pesquisa(pesquisa_id)
        if pesquisa:
            comparacao.append({
                "id": pesquisa.id,
                "titulo": pesquisa.titulo,
                "status": pesquisa.status,
                "total_eleitores": pesquisa.total_eleitores,
                "total_respostas": pesquisa.total_respostas,
                "custo_real": pesquisa.custo_real,
                "criado_em": pesquisa.criado_em.isoformat() if pesquisa.criado_em else None,
            })

    return {
        "pesquisas_comparadas": len(comparacao),
        "dados": comparacao,
    }
