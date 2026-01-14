"""
Rotas de Eleitores

API REST para gestão de eleitores/agentes sintéticos.
"""

from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status

from app.api.deps import DadosToken, obter_usuario_atual
from app.esquemas.eleitor import (
    EleitorCreate,
    EleitorListResponse,
    EleitorResponse,
    EleitorUpdate,
    FiltrosEleitor,
    UploadResult,
)
from app.servicos.eleitor_servico import EleitorServico, obter_servico_eleitores

router = APIRouter()


def get_servico() -> EleitorServico:
    """Dependência para obter o serviço de eleitores"""
    return obter_servico_eleitores()


# ============================================
# ENDPOINTS DE LEITURA
# ============================================


@router.get("/", response_model=EleitorListResponse)
async def listar_eleitores(
    # Demográficos
    idade_min: Optional[int] = Query(None, ge=16),
    idade_max: Optional[int] = Query(None, le=120),
    generos: Optional[str] = Query(None, description="Gêneros separados por vírgula"),
    cores_racas: Optional[str] = Query(
        None, description="Cores/raças separadas por vírgula"
    ),
    # Geográficos
    regioes: Optional[str] = Query(None, description="RAs separadas por vírgula"),
    # Socioeconômicos
    clusters: Optional[str] = Query(None, description="Clusters separados por vírgula"),
    escolaridades: Optional[str] = Query(None),
    profissoes: Optional[str] = Query(None),
    ocupacoes: Optional[str] = Query(None),
    rendas: Optional[str] = Query(None),
    # Socioculturais
    religioes: Optional[str] = Query(None),
    estados_civis: Optional[str] = Query(None),
    tem_filhos: Optional[bool] = Query(None),
    # Políticos
    orientacoes: Optional[str] = Query(None),
    posicoes_bolsonaro: Optional[str] = Query(None),
    interesses: Optional[str] = Query(None),
    # Comportamentais
    estilos: Optional[str] = Query(None),
    tolerancias: Optional[str] = Query(None),
    voto_facultativo: Optional[bool] = Query(None),
    conflito_identitario: Optional[bool] = Query(None),
    # Busca
    busca: Optional[str] = Query(None, description="Busca por nome, profissão, região"),
    # Paginação e ordenação
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(50, ge=1, le=500),
    ordenar_por: str = Query("nome"),
    ordem: str = Query("asc", pattern="^(asc|desc)$"),
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Lista eleitores com filtros avançados.

    Suporta mais de 20 filtros diferentes para segmentação precisa.
    """

    def parse_lista(valor: Optional[str]) -> Optional[List[str]]:
        if valor is None:
            return None
        return [v.strip() for v in valor.split(",") if v.strip()]

    filtros = FiltrosEleitor(
        idade_min=idade_min,
        idade_max=idade_max,
        generos=parse_lista(generos),
        cores_racas=parse_lista(cores_racas),
        regioes_administrativas=parse_lista(regioes),
        clusters=parse_lista(clusters),
        escolaridades=parse_lista(escolaridades),
        profissoes=parse_lista(profissoes),
        ocupacoes=parse_lista(ocupacoes),
        faixas_renda=parse_lista(rendas),
        religioes=parse_lista(religioes),
        estados_civis=parse_lista(estados_civis),
        tem_filhos=tem_filhos,
        orientacoes_politicas=parse_lista(orientacoes),
        posicoes_bolsonaro=parse_lista(posicoes_bolsonaro),
        interesses_politicos=parse_lista(interesses),
        estilos_decisao=parse_lista(estilos),
        tolerancias=parse_lista(tolerancias),
        voto_facultativo=voto_facultativo,
        conflito_identitario=conflito_identitario,
        busca_texto=busca,
        pagina=pagina,
        por_pagina=por_pagina,
        ordenar_por=ordenar_por,
        ordem=ordem,
    )

    resultado = servico.listar(filtros)
    return EleitorListResponse(**resultado)


@router.get("/estatisticas")
async def obter_estatisticas(
    # Aceita os mesmos filtros para estatísticas de subconjuntos
    clusters: Optional[str] = Query(None),
    regioes: Optional[str] = Query(None),
    religioes: Optional[str] = Query(None),
    orientacoes: Optional[str] = Query(None),
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Retorna estatísticas dos eleitores.

    Útil para gráficos de distribuição e comparação com dados reais.
    """

    def parse_lista(valor: Optional[str]) -> Optional[List[str]]:
        if valor is None:
            return None
        return [v.strip() for v in valor.split(",") if v.strip()]

    filtros = None
    if any([clusters, regioes, religioes, orientacoes]):
        filtros = FiltrosEleitor(
            clusters=parse_lista(clusters),
            regioes_administrativas=parse_lista(regioes),
            religioes=parse_lista(religioes),
            orientacoes_politicas=parse_lista(orientacoes),
        )

    return servico.obter_estatisticas(filtros)


@router.get("/opcoes-filtros")
async def obter_opcoes_filtros(
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Retorna valores únicos para cada campo filtrável.

    Útil para popular dropdowns e checkboxes nos filtros da UI.
    """
    return servico.obter_opcoes_filtros()


@router.get("/ids")
async def listar_ids(
    # Filtros simplificados para seleção rápida
    clusters: Optional[str] = Query(None),
    regioes: Optional[str] = Query(None),
    religioes: Optional[str] = Query(None),
    orientacoes: Optional[str] = Query(None),
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Retorna apenas os IDs dos eleitores filtrados.

    Útil para seleção em entrevistas.
    """

    def parse_lista(valor: Optional[str]) -> Optional[List[str]]:
        if valor is None:
            return None
        return [v.strip() for v in valor.split(",") if v.strip()]

    filtros = None
    if any([clusters, regioes, religioes, orientacoes]):
        filtros = FiltrosEleitor(
            clusters=parse_lista(clusters),
            regioes_administrativas=parse_lista(regioes),
            religioes=parse_lista(religioes),
            orientacoes_politicas=parse_lista(orientacoes),
        )

    ids = servico.obter_ids(filtros)
    return {"ids": ids, "total": len(ids)}


@router.get("/{eleitor_id}")
async def obter_eleitor(
    eleitor_id: str,
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém dados completos de um eleitor pelo ID.

    Inclui todas as características, história e instrução comportamental.
    """
    eleitor = servico.obter_por_id(eleitor_id)
    if not eleitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Eleitor {eleitor_id} não encontrado",
        )
    return eleitor


# ============================================
# ENDPOINTS DE ESCRITA
# ============================================


@router.post("/", status_code=status.HTTP_201_CREATED)
async def criar_eleitor(
    dados: EleitorCreate,
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Cria um novo eleitor/agente sintético.

    Se o ID não for fornecido, será gerado automaticamente.
    """
    try:
        eleitor = servico.criar(dados)
        return eleitor
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/lote", status_code=status.HTTP_201_CREATED)
async def criar_eleitores_lote(
    eleitores: List[EleitorCreate],
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Cria múltiplos eleitores em lote.

    Retorna estatísticas de sucesso/erro.
    """
    dados_json = [e.model_dump() for e in eleitores]
    resultado = servico.importar_json(dados_json)
    return resultado


@router.post("/importar-json")
async def importar_json(
    dados: List[dict] = Body(...),
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Importa eleitores de JSON bruto.

    Aceita formato flexível, validando apenas campos essenciais.
    """
    resultado = servico.importar_json(dados)
    return resultado


@router.put("/{eleitor_id}")
async def atualizar_eleitor(
    eleitor_id: str,
    dados: EleitorUpdate,
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Atualiza dados de um eleitor existente.

    Atualização parcial - apenas campos fornecidos são alterados.
    """
    eleitor = servico.atualizar(eleitor_id, dados)
    if not eleitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Eleitor {eleitor_id} não encontrado",
        )
    return eleitor


@router.delete("/{eleitor_id}")
async def deletar_eleitor(
    eleitor_id: str,
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Remove um eleitor do banco de dados.

    Ação irreversível.
    """
    sucesso = servico.deletar(eleitor_id)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Eleitor {eleitor_id} não encontrado",
        )
    return {"mensagem": f"Eleitor {eleitor_id} removido com sucesso"}


# ============================================
# ENDPOINTS DE SELEÇÃO
# ============================================


@router.post("/selecionar")
async def selecionar_eleitores(
    filtros: FiltrosEleitor,
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Seleciona eleitores para entrevistas com base em filtros.

    Retorna IDs e contagem para confirmação antes de executar.
    """
    ids = servico.obter_ids(filtros)
    return {
        "ids_selecionados": ids,
        "total_selecionados": len(ids),
        "filtros_aplicados": filtros.model_dump(exclude_none=True),
    }


@router.post("/por-ids")
async def obter_eleitores_por_ids(
    ids: List[str] = Body(...),
    servico: EleitorServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém eleitores por lista de IDs.

    Útil para carregar eleitores selecionados em entrevistas.
    """
    eleitores = servico.obter_por_ids(ids)
    return {
        "eleitores": eleitores,
        "total": len(eleitores),
        "ids_nao_encontrados": [
            id for id in ids if id not in [e["id"] for e in eleitores]
        ],
    }
