"""
Rotas de API para Geração de Eleitores Sintéticos

Endpoints para gerar novos perfis de eleitores usando IA.

Autor: Professor Igor
Fase 2 - Geração de Eleitores
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.api.deps import DadosToken, obter_usuario_atual
from app.servicos.geracao_servico import obter_geracao_servico


router = APIRouter()


# ============================================
# SCHEMAS
# ============================================


class GerarEleitoresRequest(BaseModel):
    """Request para geração de eleitores"""
    quantidade: int = Field(
        5,
        ge=1,
        le=20,
        description="Número de eleitores a gerar (1-20)"
    )
    cluster: Optional[str] = Field(
        None,
        description="Cluster socioeconômico: G1_alta, G2_media_alta, G3_media_baixa, G4_baixa"
    )
    regiao: Optional[str] = Field(
        None,
        description="Região administrativa do DF"
    )
    orientacao_politica: Optional[str] = Field(
        None,
        description="esquerda, centro-esquerda, centro, centro-direita, direita"
    )
    faixa_etaria: Optional[str] = Field(
        None,
        description="18-25, 26-35, 36-50, 51-65, 65+"
    )
    genero: Optional[str] = Field(
        None,
        description="masculino ou feminino"
    )
    caracteristicas_extras: Optional[str] = Field(
        None,
        max_length=500,
        description="Características adicionais em texto livre"
    )
    salvar_no_banco: bool = Field(
        True,
        description="Se True, adiciona os eleitores ao banco de dados"
    )


# ============================================
# ENDPOINTS
# ============================================


@router.post("/", summary="Gerar eleitores sintéticos via IA")
async def gerar_eleitores(
    request: GerarEleitoresRequest,
    usuario: DadosToken = Depends(obter_usuario_atual)
) -> Dict[str, Any]:
    """
    Gera novos eleitores sintéticos usando Claude AI.

    **Como funciona:**
    1. Claude AI gera perfis realistas de eleitores do DF
    2. Os perfis incluem dados demográficos, psicográficos e comportamentais
    3. Opcionalmente, salva os eleitores no banco de dados

    **Parâmetros de filtro:**
    - `cluster`: G1_alta (ricos), G2_media_alta, G3_media_baixa, G4_baixa
    - `regiao`: Qualquer RA do DF (Ceilândia, Taguatinga, Plano Piloto, etc)
    - `orientacao_politica`: esquerda, centro-esquerda, centro, centro-direita, direita
    - `faixa_etaria`: 18-25, 26-35, 36-50, 51-65, 65+
    - `genero`: masculino ou feminino

    **Retorna:**
    - Lista de eleitores gerados com todos os atributos
    - Metadados (tempo, custo, tokens usados)
    - IDs dos eleitores adicionados ao banco

    **Custos:**
    - ~$0.01-0.05 por geração (dependendo da quantidade)
    - Máximo 20 eleitores por requisição
    """
    servico = obter_geracao_servico()

    resultado = servico.gerar_eleitores(
        quantidade=request.quantidade,
        cluster=request.cluster,
        regiao=request.regiao,
        orientacao_politica=request.orientacao_politica,
        faixa_etaria=request.faixa_etaria,
        genero=request.genero,
        caracteristicas_extras=request.caracteristicas_extras,
        salvar_no_banco=request.salvar_no_banco
    )

    if resultado.get("erro") and not resultado.get("eleitores"):
        raise HTTPException(status_code=500, detail=resultado["erro"])

    return resultado


@router.get("/opcoes", summary="Opções disponíveis para geração")
async def obter_opcoes(
    usuario: DadosToken = Depends(obter_usuario_atual)
) -> Dict[str, Any]:
    """
    Retorna as opções disponíveis para filtros de geração.

    Útil para popular dropdowns na interface.
    """
    servico = obter_geracao_servico()
    return servico.obter_opcoes_geracao()


@router.get("/estatisticas", summary="Estatísticas do banco de eleitores")
async def obter_estatisticas(
    usuario: DadosToken = Depends(obter_usuario_atual)
) -> Dict[str, Any]:
    """
    Retorna estatísticas atuais do banco de eleitores.

    Inclui:
    - Total de eleitores
    - Distribuição por cluster, região, orientação política
    - Idade média
    """
    servico = obter_geracao_servico()
    return servico.obter_estatisticas_banco()


@router.post("/lote", summary="Gerar múltiplos lotes de eleitores")
async def gerar_lote(
    clusters: List[str] = Query(
        default=["G1_alta", "G2_media_alta", "G3_media_baixa", "G4_baixa"],
        description="Lista de clusters para gerar"
    ),
    quantidade_por_cluster: int = Query(
        default=5,
        ge=1,
        le=10,
        description="Quantidade por cluster"
    ),
    usuario: DadosToken = Depends(obter_usuario_atual)
) -> Dict[str, Any]:
    """
    Gera eleitores em lote, distribuídos por cluster.

    Útil para popular o banco com uma amostra diversificada.

    **Exemplo:**
    - clusters: ["G1_alta", "G4_baixa"]
    - quantidade_por_cluster: 5
    - Resultado: 10 eleitores (5 G1_alta + 5 G4_baixa)
    """
    servico = obter_geracao_servico()

    todos_eleitores = []
    metadados_lote = {
        "lotes_gerados": 0,
        "total_eleitores": 0,
        "custo_total_usd": 0.0,
        "tempo_total_segundos": 0.0,
        "erros": []
    }

    for cluster in clusters:
        resultado = servico.gerar_eleitores(
            quantidade=quantidade_por_cluster,
            cluster=cluster,
            salvar_no_banco=True
        )

        if resultado.get("eleitores"):
            todos_eleitores.extend(resultado["eleitores"])
            metadados_lote["lotes_gerados"] += 1
            metadados_lote["total_eleitores"] += len(resultado["eleitores"])
            metadados_lote["custo_total_usd"] += resultado["metadados"].get("custo_estimado_usd", 0)
            metadados_lote["tempo_total_segundos"] += resultado["metadados"].get("tempo_geracao_segundos", 0)
        else:
            metadados_lote["erros"].append({
                "cluster": cluster,
                "erro": resultado.get("erro", "Erro desconhecido")
            })

    return {
        "eleitores": todos_eleitores,
        "metadados": metadados_lote
    }
