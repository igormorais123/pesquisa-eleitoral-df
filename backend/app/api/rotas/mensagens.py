"""
Rotas de API para Geração de Mensagens

Endpoints para criar mensagens otimizadas de persuasão eleitoral.

Autor: Professor Igor
Fase 2 - Gerador de Mensagens
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.servicos.mensagem_servico import obter_mensagem_servico


router = APIRouter()


# ============================================
# SCHEMAS
# ============================================


class FiltrosEleitor(BaseModel):
    """Filtros para seleção de eleitores"""
    regiao_administrativa: Optional[List[str]] = Field(
        None,
        description="Regiões administrativas do DF (ex: Ceilândia, Taguatinga)"
    )
    cluster_socioeconomico: Optional[List[str]] = Field(
        None,
        description="Clusters socioeconômicos (G1_alta, G2_media_alta, G3_media_baixa, G4_baixa)"
    )
    orientacao_politica: Optional[List[str]] = Field(
        None,
        description="Orientações políticas (esquerda, centro-esquerda, centro, centro-direita, direita)"
    )
    religiao: Optional[List[str]] = Field(
        None,
        description="Religiões (catolica, evangelica, espirita, etc)"
    )
    estilo_decisao: Optional[List[str]] = Field(
        None,
        description="Estilos de decisão (emocional, racional, economico, etc)"
    )
    genero: Optional[List[str]] = Field(
        None,
        description="Gêneros (masculino, feminino)"
    )
    idade_min: Optional[int] = Field(
        None,
        ge=16,
        le=100,
        description="Idade mínima"
    )
    idade_max: Optional[int] = Field(
        None,
        ge=16,
        le=100,
        description="Idade máxima"
    )


class GerarMensagensRequest(BaseModel):
    """Request para geração de mensagens"""
    objetivo: str = Field(
        ...,
        description="Objetivo da mensagem (ex: 'convencer eleitores indecisos a votar no candidato X')",
        min_length=10,
        max_length=1000,
        examples=["Convencer eleitores indecisos de Ceilândia a votar no candidato João Silva para governador"]
    )
    eleitor_ids: Optional[List[str]] = Field(
        None,
        description="IDs específicos de eleitores-alvo (opcional, se não usar filtros)"
    )
    filtros: Optional[FiltrosEleitor] = Field(
        None,
        description="Filtros para selecionar eleitores por características"
    )
    gatilhos: Optional[List[str]] = Field(
        None,
        description="Gatilhos específicos a usar: medo, esperanca, economico, tribal, identitario",
        examples=[["economico", "esperanca", "identitario"]]
    )
    restricoes: Optional[List[str]] = Field(
        None,
        description="Restrições para geração (ex: 'não usar tom agressivo', 'evitar temas religiosos')",
        examples=[["não atacar adversários diretamente", "usar tom esperançoso"]]
    )
    num_variacoes: int = Field(
        5,
        ge=1,
        le=5,
        description="Número de variações de mensagem a gerar (1-5)"
    )


class PreviewEstatisticasRequest(BaseModel):
    """Request para preview de estatísticas antes de gerar"""
    filtros: Optional[FiltrosEleitor] = None


# ============================================
# ENDPOINTS
# ============================================


@router.post("/gerar", summary="Gerar mensagens otimizadas")
async def gerar_mensagens(request: GerarMensagensRequest) -> Dict[str, Any]:
    """
    Gera mensagens de persuasão otimizadas para um público-alvo específico.

    **Como funciona:**
    1. Seleciona eleitores com base nos filtros ou IDs fornecidos
    2. Analisa o perfil agregado (medos, valores, vieses cognitivos)
    3. Claude AI gera mensagens personalizadas para cada gatilho
    4. Retorna mensagens com estimativas de eficácia e risco

    **Gatilhos disponíveis:**
    - `medo`: Ativa ansiedades e medos (risco médio)
    - `esperanca`: Ativa aspirações positivas (risco baixo)
    - `economico`: Foca em impacto financeiro (risco baixo)
    - `tribal`: Cria senso de pertencimento (risco alto)
    - `identitario`: Ressoa com valores/religião (risco médio)

    **Retorna:**
    - Lista de mensagens (texto curto e longo)
    - Estimativas de eficácia (0-100%)
    - Risco de backfire (rejeição)
    - Recomendações estratégicas
    - Perfil agregado do público
    """
    servico = obter_mensagem_servico()

    # Converter filtros para dict se fornecido
    filtros_dict = None
    if request.filtros:
        filtros_dict = {
            k: v for k, v in request.filtros.model_dump().items()
            if v is not None
        }

    resultado = servico.gerar_mensagens(
        objetivo=request.objetivo,
        eleitor_ids=request.eleitor_ids,
        filtros=filtros_dict,
        gatilhos=request.gatilhos,
        restricoes=request.restricoes,
        num_variacoes=request.num_variacoes
    )

    if "erro" in resultado and not resultado.get("mensagens"):
        raise HTTPException(status_code=400, detail=resultado["erro"])

    return resultado


@router.get("/gatilhos", summary="Listar gatilhos disponíveis")
async def listar_gatilhos() -> Dict[str, Any]:
    """
    Lista os tipos de gatilhos psicológicos disponíveis para geração de mensagens.

    Cada gatilho tem:
    - Nome e descrição
    - Eficácia base estimada
    - Risco de backfire (rejeição)
    - Ícone e cor para UI
    """
    servico = obter_mensagem_servico()
    return servico.obter_gatilhos_disponiveis()


@router.get("/historico", summary="Listar histórico de mensagens")
async def listar_historico(
    limite: int = Query(20, ge=1, le=100, description="Número máximo de registros"),
    objetivo_contem: Optional[str] = Query(None, description="Filtrar por texto no objetivo")
) -> Dict[str, Any]:
    """
    Lista histórico de mensagens geradas anteriormente.

    Útil para:
    - Reutilizar mensagens que funcionaram
    - Analisar padrões de geração
    - Comparar abordagens diferentes
    """
    servico = obter_mensagem_servico()
    historico = servico.listar_historico(
        limite=limite,
        objetivo_contem=objetivo_contem
    )

    return {
        "historico": historico,
        "total": len(historico)
    }


@router.post("/preview", summary="Preview do público-alvo")
async def preview_estatisticas(request: PreviewEstatisticasRequest) -> Dict[str, Any]:
    """
    Retorna estatísticas do público-alvo antes de gerar mensagens.

    Útil para:
    - Verificar quantos eleitores serão analisados
    - Ver perfil resumido (medos, valores, regiões)
    - Ajustar filtros antes de gastar tokens
    """
    servico = obter_mensagem_servico()

    filtros_dict = None
    if request.filtros:
        filtros_dict = {
            k: v for k, v in request.filtros.model_dump().items()
            if v is not None
        }

    return servico.obter_estatisticas_eleitores(filtros=filtros_dict)


@router.get("/opcoes-filtros", summary="Opções de filtros disponíveis")
async def obter_opcoes_filtros() -> Dict[str, Any]:
    """
    Retorna as opções disponíveis para cada filtro.

    Útil para popular dropdowns na interface.
    """
    servico = obter_mensagem_servico()

    # Obter estatísticas de todos os eleitores para extrair opções
    stats = servico.obter_estatisticas_eleitores()

    return {
        "regioes_administrativas": [r["item"] for r in stats.get("perfil_resumido", {}).get("top_regioes", [])],
        "clusters_socioeconomicos": ["G1_alta", "G2_media_alta", "G3_media_baixa", "G4_baixa"],
        "orientacoes_politicas": ["esquerda", "centro-esquerda", "centro", "centro-direita", "direita"],
        "religioes": [r["item"] for r in stats.get("perfil_resumido", {}).get("top_religioes", [])],
        "estilos_decisao": ["emocional", "racional", "economico", "social", "ideologico"],
        "generos": ["masculino", "feminino"],
        "gatilhos": list(servico.GATILHOS.keys()),
        "total_eleitores_disponiveis": stats.get("total", 0)
    }
