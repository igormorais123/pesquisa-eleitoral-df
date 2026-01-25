"""
Rotas de Cenários Eleitorais

API REST para simulação de cenários eleitorais.
Suporta criação, execução e análise de cenários de 1º e 2º turno.
"""

import json
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DadosToken, obter_usuario_atual
from app.db.session import get_db
from app.esquemas.cenario_eleitoral import (
    CenarioEleitoralCreate,
    CenarioEleitoralResponse,
    CenarioEleitoralUpdate,
    CenarioListResponse,
    CargoCenario,
    ConfiguracaoAnaliseRejeicao,
    ExecutarCenarioRapidoRequest,
    FiltrosCenario,
    StatusCenario,
)
from app.servicos.cenario_eleitoral_servico import CenarioEleitoralServico

router = APIRouter()

# Caminho para o arquivo de eleitores (na raiz do projeto, fora de backend)
# __file__ = backend/app/api/rotas/cenarios_eleitorais.py
# 5 parents = pesquisa-eleitoral-df/
ELEITORES_PATH = Path(__file__).parent.parent.parent.parent.parent / "agentes" / "banco-eleitores-df.json"


async def get_servico(db: AsyncSession = Depends(get_db)) -> CenarioEleitoralServico:
    """Dependência para obter o serviço de cenários"""
    return CenarioEleitoralServico(db)


def carregar_eleitores(filtros: Optional[dict] = None, limite: Optional[int] = None) -> List[dict]:
    """Carrega eleitores do arquivo JSON com filtros opcionais"""
    try:
        with open(ELEITORES_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            # Suporta tanto lista direta quanto objeto com chave "eleitores"
            eleitores = data if isinstance(data, list) else data.get("eleitores", [])

            # Aplicar filtros se fornecidos
            if filtros:
                if filtros.get("regioes"):
                    eleitores = [e for e in eleitores if e.get("regiao_administrativa") in filtros["regioes"]]
                if filtros.get("clusters"):
                    eleitores = [e for e in eleitores if e.get("cluster_socioeconomico") in filtros["clusters"]]
                if filtros.get("generos"):
                    eleitores = [e for e in eleitores if e.get("genero") in filtros["generos"]]
                if filtros.get("orientacoes_politicas"):
                    eleitores = [e for e in eleitores if e.get("orientacao_politica") in filtros["orientacoes_politicas"]]

            # Limitar quantidade se especificado
            if limite and limite < len(eleitores):
                import random
                eleitores = random.sample(eleitores, limite)

            return eleitores
    except FileNotFoundError:
        return []


# ============================================
# ENDPOINTS DE LEITURA
# ============================================


@router.get("/", response_model=CenarioListResponse)
async def listar_cenarios(
    busca: Optional[str] = Query(None, description="Busca por nome"),
    cargos: Optional[str] = Query(None, description="Cargos separados por vírgula"),
    turnos: Optional[str] = Query(None, description="Turnos separados por vírgula (1,2)"),
    status_filtro: Optional[str] = Query(None, alias="status", description="Status separados por vírgula"),
    apenas_ativos: bool = Query(True),
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    ordenar_por: str = Query("criado_em"),
    ordem: str = Query("desc", pattern="^(asc|desc)$"),
    servico: CenarioEleitoralServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """Lista cenários eleitorais com filtros"""

    def parse_cargos(valor: Optional[str]) -> Optional[List[CargoCenario]]:
        if not valor:
            return None
        return [CargoCenario(c.strip()) for c in valor.split(",") if c.strip() in [e.value for e in CargoCenario]]

    def parse_turnos(valor: Optional[str]) -> Optional[List[int]]:
        if not valor:
            return None
        return [int(t.strip()) for t in valor.split(",") if t.strip().isdigit()]

    def parse_status(valor: Optional[str]) -> Optional[List[StatusCenario]]:
        if not valor:
            return None
        return [StatusCenario(s.strip()) for s in valor.split(",") if s.strip() in [e.value for e in StatusCenario]]

    filtros = FiltrosCenario(
        busca_texto=busca,
        cargos=parse_cargos(cargos),
        turnos=parse_turnos(turnos),
        status=parse_status(status_filtro),
        apenas_ativos=apenas_ativos,
        pagina=pagina,
        por_pagina=por_pagina,
        ordenar_por=ordenar_por,
        ordem=ordem,
    )

    resultado = await servico.listar(filtros)
    return CenarioListResponse(**resultado)


@router.get("/{cenario_id}", response_model=CenarioEleitoralResponse)
async def obter_cenario(
    cenario_id: str,
    servico: CenarioEleitoralServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """Obtém cenário por ID com resultados"""
    cenario = await servico.obter_por_id(cenario_id)
    if not cenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cenário {cenario_id} não encontrado",
        )
    return cenario


# ============================================
# ENDPOINTS DE CRIAÇÃO E EDIÇÃO
# ============================================


@router.post("/", status_code=status.HTTP_201_CREATED)
async def criar_cenario(
    dados: CenarioEleitoralCreate,
    servico: CenarioEleitoralServico = Depends(get_servico),
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """Cria novo cenário eleitoral"""
    cenario = await servico.criar(dados, usuario_id=usuario.usuario_id)
    return cenario


@router.put("/{cenario_id}")
async def atualizar_cenario(
    cenario_id: str,
    dados: CenarioEleitoralUpdate,
    servico: CenarioEleitoralServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """Atualiza cenário existente"""
    cenario = await servico.atualizar(cenario_id, dados)
    if not cenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cenário {cenario_id} não encontrado",
        )
    return cenario


@router.delete("/{cenario_id}")
async def deletar_cenario(
    cenario_id: str,
    servico: CenarioEleitoralServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """Remove cenário"""
    sucesso = await servico.deletar(cenario_id)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cenário {cenario_id} não encontrado",
        )
    return {"mensagem": f"Cenário {cenario_id} removido com sucesso"}


# ============================================
# ENDPOINTS DE SIMULAÇÃO
# ============================================


@router.post("/{cenario_id}/executar")
async def executar_cenario(
    cenario_id: str,
    modelo: str = Query("claude-sonnet-4-20250514", description="Modelo de IA a usar"),
    servico: CenarioEleitoralServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Executa simulação de um cenário salvo.

    Carrega eleitores do banco e executa a simulação
    retornando os resultados estimados.
    """
    # Obter cenário para pegar filtros
    cenario = await servico.obter_por_id(cenario_id)
    if not cenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cenário {cenario_id} não encontrado",
        )

    # Carregar eleitores
    eleitores = carregar_eleitores(
        filtros=cenario.get("filtros_eleitores"),
        limite=cenario.get("amostra_tamanho", 100)
    )

    if not eleitores:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum eleitor encontrado para simulação",
        )

    # Executar simulação
    resultado = await servico.simular_cenario(cenario_id, eleitores, modelo)
    return resultado


@router.post("/simular-rapido")
async def simular_rapido(
    dados: ExecutarCenarioRapidoRequest,
    servico: CenarioEleitoralServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Executa simulação rápida sem salvar cenário.

    Útil para testes e comparações rápidas.
    """
    # Criar cenário temporário
    cenario_temp = await servico.criar(
        CenarioEleitoralCreate(
            nome=f"Simulação Rápida - {dados.cargo.value}",
            turno=dados.turno,
            cargo=dados.cargo,
            candidatos_ids=dados.candidatos_ids,
            incluir_indecisos=dados.incluir_indecisos,
            incluir_brancos_nulos=dados.incluir_brancos_nulos,
            amostra_tamanho=dados.amostra_tamanho,
            filtros_eleitores=dados.filtros_eleitores,
        )
    )

    try:
        # Carregar eleitores
        eleitores = carregar_eleitores(
            filtros=dados.filtros_eleitores,
            limite=dados.amostra_tamanho
        )

        if not eleitores:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nenhum eleitor encontrado para simulação",
            )

        # Executar simulação
        resultado = await servico.simular_cenario(cenario_temp["id"], eleitores)

        # Deletar cenário temporário
        await servico.deletar(cenario_temp["id"])

        return resultado

    except Exception as e:
        # Limpar cenário temporário em caso de erro
        await servico.deletar(cenario_temp["id"])
        raise e


@router.post("/{cenario_id}/simular-segundo-turno")
async def simular_segundo_turno(
    cenario_id: str,
    candidato1_id: str = Query(..., description="ID do primeiro candidato"),
    candidato2_id: str = Query(..., description="ID do segundo candidato"),
    servico: CenarioEleitoralServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Simula segundo turno entre dois candidatos específicos.

    Pode ser usado após uma simulação de primeiro turno.
    """
    # Obter cenário original para usar mesmos filtros
    cenario_original = await servico.obter_por_id(cenario_id)
    if not cenario_original:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cenário {cenario_id} não encontrado",
        )

    # Criar cenário de 2º turno
    cenario_2t = await servico.criar(
        CenarioEleitoralCreate(
            nome=f"2º Turno - {cenario_original['nome']}",
            descricao=f"Simulação de segundo turno baseada no cenário {cenario_id}",
            turno=2,
            cargo=CargoCenario(cenario_original["cargo"]),
            candidatos_ids=[candidato1_id, candidato2_id],
            incluir_indecisos=cenario_original["incluir_indecisos"],
            incluir_brancos_nulos=cenario_original["incluir_brancos_nulos"],
            amostra_tamanho=cenario_original["amostra_tamanho"],
            filtros_eleitores=cenario_original.get("filtros_eleitores"),
        )
    )

    # Carregar eleitores
    eleitores = carregar_eleitores(
        filtros=cenario_original.get("filtros_eleitores"),
        limite=cenario_original.get("amostra_tamanho", 100)
    )

    # Executar simulação
    resultado = await servico.simular_cenario(cenario_2t["id"], eleitores)

    return resultado


# ============================================
# ENDPOINTS DE ANÁLISE DE REJEIÇÃO
# ============================================


@router.post("/analisar-rejeicao")
async def analisar_rejeicao(
    dados: ConfiguracaoAnaliseRejeicao,
    servico: CenarioEleitoralServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Analisa rejeição dos candidatos entre os eleitores.

    Retorna taxa de rejeição, principais motivos e perfil dos rejeitadores.
    """
    # Carregar eleitores
    eleitores = carregar_eleitores(
        filtros=dados.filtros_eleitores,
        limite=dados.amostra_tamanho
    )

    if not eleitores:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum eleitor encontrado para análise",
        )

    resultado = await servico.analisar_rejeicao(
        candidatos_ids=dados.candidatos_ids,
        eleitores=eleitores,
        incluir_motivos=dados.incluir_motivos,
    )

    return resultado


@router.get("/rejeicao/candidato/{candidato_id}")
async def obter_rejeicao_candidato(
    candidato_id: str,
    amostra: int = Query(200, ge=10, le=1000),
    servico: CenarioEleitoralServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém análise de rejeição de um candidato específico.
    """
    eleitores = carregar_eleitores(limite=amostra)

    if not eleitores:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum eleitor encontrado para análise",
        )

    resultado = await servico.analisar_rejeicao(
        candidatos_ids=[candidato_id],
        eleitores=eleitores,
        incluir_motivos=True,
    )

    if resultado["candidatos"]:
        return resultado["candidatos"][0]

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Candidato {candidato_id} não encontrado",
    )


# ============================================
# ENDPOINTS DE COMPARAÇÃO
# ============================================


@router.post("/comparar")
async def comparar_cenarios(
    cenarios_ids: List[str] = Body(..., min_length=2, max_length=5),
    servico: CenarioEleitoralServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Compara resultados de múltiplos cenários.

    Útil para analisar tendências e variações.
    """
    cenarios = []
    for cid in cenarios_ids:
        cenario = await servico.obter_por_id(cid)
        if cenario:
            cenarios.append(cenario)

    if len(cenarios) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="É necessário pelo menos 2 cenários válidos para comparação",
        )

    # Calcular diferenças
    diferencas = []
    base = cenarios[0]

    for cenario in cenarios[1:]:
        if base.get("resultados") and cenario.get("resultados"):
            diff = {
                "cenario_base": base["id"],
                "cenario_comparado": cenario["id"],
                "candidatos": [],
            }

            base_results = {r["candidato_id"]: r for r in base["resultados"]}
            for resultado in cenario["resultados"]:
                cand_id = resultado["candidato_id"]
                if cand_id in base_results:
                    variacao = resultado["percentual"] - base_results[cand_id]["percentual"]
                    diff["candidatos"].append({
                        "candidato_id": cand_id,
                        "candidato_nome": resultado.get("candidato_nome_urna", resultado.get("candidato_nome")),
                        "percentual_base": base_results[cand_id]["percentual"],
                        "percentual_comparado": resultado["percentual"],
                        "variacao": round(variacao, 2),
                    })

            diferencas.append(diff)

    return {
        "cenarios": cenarios,
        "diferencas": diferencas,
    }
