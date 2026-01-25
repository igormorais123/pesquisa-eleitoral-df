"""
Rotas de API para Histórico.

Endpoints para consultar histórico de pesquisas, respostas e eleitores.
"""

import logging
from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import obter_usuario_atual
from app.core.database import obter_sessao
from app.modelos import PerguntaPesquisa, Pesquisa, Resposta, StatusPesquisa

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/historico", tags=["Histórico"])


# ============================================
# SCHEMAS
# ============================================


class PesquisaPorPeriodo(BaseModel):
    """Pesquisa no período."""

    id: int
    titulo: str
    status: str
    tipo: str
    total_eleitores: int
    custo_total: float
    criado_em: datetime
    finalizado_em: Optional[datetime] = None


class PeriodoResponse(BaseModel):
    """Resposta com pesquisas por período."""

    data_inicio: datetime
    data_fim: datetime
    total_pesquisas: int
    pesquisas: list[PesquisaPorPeriodo] = Field(default_factory=list)


class ComparacaoPergunta(BaseModel):
    """Comparação de mesma pergunta em diferentes pesquisas."""

    texto_pergunta: str
    pesquisas: list[dict[str, Any]] = Field(default_factory=list)
    total_respostas: int = 0
    sentimentos_agregados: dict[str, int] = Field(default_factory=dict)


class BuscaRespostaItem(BaseModel):
    """Item de resultado de busca."""

    resposta_id: int
    pesquisa_id: int
    pesquisa_titulo: str
    pergunta_texto: str
    eleitor_id: str
    resposta_texto: str
    criado_em: datetime
    relevancia: float = 1.0


class BuscaResponse(BaseModel):
    """Resposta de busca textual."""

    termo: str
    total_resultados: int
    resultados: list[BuscaRespostaItem] = Field(default_factory=list)


# ============================================
# ENDPOINTS
# ============================================


@router.get("/eleitor/{eleitor_id}")
async def historico_eleitor(
    eleitor_id: str,
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Obtém todas as respostas de um eleitor específico.

    Mostra histórico completo de participação em pesquisas.
    """
    # Buscar respostas do eleitor
    query = (
        select(Resposta)
        .where(Resposta.eleitor_id == eleitor_id)
        .order_by(Resposta.criado_em.desc())
    )
    result = await db.execute(query)
    respostas = result.scalars().all()

    if not respostas:
        return {
            "eleitor_id": eleitor_id,
            "total_participacoes": 0,
            "pesquisas": [],
            "respostas": [],
        }

    # IDs únicos de pesquisas
    pesquisa_ids = list(set(r.pesquisa_id for r in respostas))

    # Buscar detalhes das pesquisas
    query_pesquisas = select(Pesquisa).where(Pesquisa.id.in_(pesquisa_ids))
    result_pesquisas = await db.execute(query_pesquisas)
    pesquisas = {p.id: p for p in result_pesquisas.scalars().all()}

    return {
        "eleitor_id": eleitor_id,
        "total_participacoes": len(pesquisa_ids),
        "total_respostas": len(respostas),
        "pesquisas": [
            {
                "id": pid,
                "titulo": pesquisas[pid].titulo if pid in pesquisas else "Desconhecida",
                "status": pesquisas[pid].status.value if pid in pesquisas else "desconhecido",
            }
            for pid in pesquisa_ids
        ],
        "respostas": [
            {
                "id": r.id,
                "pesquisa_id": r.pesquisa_id,
                "pergunta_id": r.pergunta_id,
                "resposta_texto": r.resposta_texto[:200],
                "sentimento": r.sentimento_dominante,
                "criado_em": r.criado_em.isoformat() if r.criado_em else None,
            }
            for r in respostas[:100]  # Limitar a 100
        ],
    }


@router.get("/pergunta")
async def historico_pergunta(
    texto: str = Query(..., min_length=5, description="Texto da pergunta para buscar"),
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Compara mesma pergunta (ou similar) em diferentes pesquisas.

    Busca perguntas que contenham o texto fornecido e
    agrega as respostas de todas as ocorrências.
    """
    # Buscar perguntas similares
    query_perguntas = select(PerguntaPesquisa).where(
        PerguntaPesquisa.texto.ilike(f"%{texto}%")
    )
    result = await db.execute(query_perguntas)
    perguntas = result.scalars().all()

    if not perguntas:
        return ComparacaoPergunta(
            texto_pergunta=texto,
            pesquisas=[],
            total_respostas=0,
        )

    # Buscar respostas de cada pergunta
    pergunta_ids = [p.id for p in perguntas]
    query_respostas = select(Resposta).where(Resposta.pergunta_id.in_(pergunta_ids))
    result_respostas = await db.execute(query_respostas)
    respostas = result_respostas.scalars().all()

    # Buscar pesquisas
    pesquisa_ids = list(set(p.pesquisa_id for p in perguntas))
    query_pesquisas = select(Pesquisa).where(Pesquisa.id.in_(pesquisa_ids))
    result_pesquisas = await db.execute(query_pesquisas)
    pesquisas = {p.id: p for p in result_pesquisas.scalars().all()}

    # Agregar sentimentos
    sentimentos_agregados: dict[str, int] = {}
    for r in respostas:
        sentimento = r.sentimento_dominante
        if sentimento:
            sentimentos_agregados[sentimento] = sentimentos_agregados.get(sentimento, 0) + 1

    # Montar resposta
    pesquisas_data = []
    for p in perguntas:
        pesquisa = pesquisas.get(p.pesquisa_id)
        respostas_pergunta = [r for r in respostas if r.pergunta_id == p.id]
        pesquisas_data.append({
            "pesquisa_id": p.pesquisa_id,
            "pesquisa_titulo": pesquisa.titulo if pesquisa else "Desconhecida",
            "pergunta_id": p.id,
            "texto_exato": p.texto,
            "total_respostas": len(respostas_pergunta),
            "criado_em": p.criado_em.isoformat() if p.criado_em else None,
        })

    return ComparacaoPergunta(
        texto_pergunta=texto,
        pesquisas=pesquisas_data,
        total_respostas=len(respostas),
        sentimentos_agregados=sentimentos_agregados,
    )


@router.get("/periodo", response_model=PeriodoResponse)
async def historico_periodo(
    data_inicio: datetime = Query(..., description="Data inicial (YYYY-MM-DD)"),
    data_fim: datetime = Query(..., description="Data final (YYYY-MM-DD)"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Lista pesquisas por intervalo de data.

    Útil para relatórios e análises temporais.
    """
    query = select(Pesquisa).where(
        Pesquisa.criado_em >= data_inicio,
        Pesquisa.criado_em <= data_fim,
    )

    if status:
        try:
            status_enum = StatusPesquisa(status)
            query = query.where(Pesquisa.status == status_enum)
        except ValueError:
            pass

    query = query.order_by(Pesquisa.criado_em.desc())

    result = await db.execute(query)
    pesquisas = result.scalars().all()

    return PeriodoResponse(
        data_inicio=data_inicio,
        data_fim=data_fim,
        total_pesquisas=len(pesquisas),
        pesquisas=[
            PesquisaPorPeriodo(
                id=p.id,
                titulo=p.titulo,
                status=p.status.value,
                tipo=p.tipo.value,
                total_eleitores=p.total_eleitores,
                custo_total=p.custo_total,
                criado_em=p.criado_em,
                finalizado_em=p.finalizado_em,
            )
            for p in pesquisas
        ],
    )


@router.get("/busca", response_model=BuscaResponse)
async def busca_textual(
    termo: str = Query(..., min_length=3, description="Termo para buscar nas respostas"),
    limite: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Busca textual em respostas.

    Busca o termo em todas as respostas de todas as pesquisas.
    """
    # Buscar respostas que contenham o termo
    query = (
        select(Resposta)
        .where(Resposta.resposta_texto.ilike(f"%{termo}%"))
        .order_by(Resposta.criado_em.desc())
        .limit(limite)
    )
    result = await db.execute(query)
    respostas = result.scalars().all()

    if not respostas:
        return BuscaResponse(
            termo=termo,
            total_resultados=0,
            resultados=[],
        )

    # Buscar pesquisas e perguntas relacionadas
    pesquisa_ids = list(set(r.pesquisa_id for r in respostas))
    pergunta_ids = list(set(r.pergunta_id for r in respostas))

    query_pesquisas = select(Pesquisa).where(Pesquisa.id.in_(pesquisa_ids))
    result_pesquisas = await db.execute(query_pesquisas)
    pesquisas = {p.id: p for p in result_pesquisas.scalars().all()}

    query_perguntas = select(PerguntaPesquisa).where(PerguntaPesquisa.id.in_(pergunta_ids))
    result_perguntas = await db.execute(query_perguntas)
    perguntas = {p.id: p for p in result_perguntas.scalars().all()}

    # Contar total
    query_count = select(func.count(Resposta.id)).where(
        Resposta.resposta_texto.ilike(f"%{termo}%")
    )
    result_count = await db.execute(query_count)
    total = result_count.scalar() or 0

    return BuscaResponse(
        termo=termo,
        total_resultados=total,
        resultados=[
            BuscaRespostaItem(
                resposta_id=r.id,
                pesquisa_id=r.pesquisa_id,
                pesquisa_titulo=(
                    pesquisas[r.pesquisa_id].titulo
                    if r.pesquisa_id in pesquisas
                    else "Desconhecida"
                ),
                pergunta_texto=(
                    perguntas[r.pergunta_id].texto[:100]
                    if r.pergunta_id in perguntas
                    else "Desconhecida"
                ),
                eleitor_id=r.eleitor_id,
                resposta_texto=r.resposta_texto[:300],
                criado_em=r.criado_em,
            )
            for r in respostas
        ],
    )


@router.get("/resumo")
async def resumo_historico(
    db: AsyncSession = Depends(obter_sessao),
    _usuario: dict = Depends(obter_usuario_atual),
):
    """
    Obtém resumo geral do histórico do sistema.

    Útil para visão geral rápida.
    """
    # Total de pesquisas
    query_pesquisas = select(func.count(Pesquisa.id))
    result = await db.execute(query_pesquisas)
    total_pesquisas = result.scalar() or 0

    # Pesquisas por status
    query_status = select(
        Pesquisa.status,
        func.count(Pesquisa.id),
    ).group_by(Pesquisa.status)
    result_status = await db.execute(query_status)
    por_status = {row[0].value: row[1] for row in result_status.all()}

    # Total de respostas
    query_respostas = select(func.count(Resposta.id))
    result_respostas = await db.execute(query_respostas)
    total_respostas = result_respostas.scalar() or 0

    # Eleitores únicos
    query_eleitores = select(func.count(func.distinct(Resposta.eleitor_id)))
    result_eleitores = await db.execute(query_eleitores)
    eleitores_unicos = result_eleitores.scalar() or 0

    # Pesquisa mais recente
    query_recente = select(Pesquisa).order_by(Pesquisa.criado_em.desc()).limit(1)
    result_recente = await db.execute(query_recente)
    pesquisa_recente = result_recente.scalar_one_or_none()

    # Primeira pesquisa
    query_primeira = select(Pesquisa).order_by(Pesquisa.criado_em.asc()).limit(1)
    result_primeira = await db.execute(query_primeira)
    pesquisa_primeira = result_primeira.scalar_one_or_none()

    return {
        "total_pesquisas": total_pesquisas,
        "pesquisas_por_status": por_status,
        "total_respostas": total_respostas,
        "eleitores_unicos": eleitores_unicos,
        "pesquisa_mais_recente": {
            "id": pesquisa_recente.id,
            "titulo": pesquisa_recente.titulo,
            "criado_em": pesquisa_recente.criado_em.isoformat(),
        } if pesquisa_recente else None,
        "primeira_pesquisa": {
            "id": pesquisa_primeira.id,
            "titulo": pesquisa_primeira.titulo,
            "criado_em": pesquisa_primeira.criado_em.isoformat(),
        } if pesquisa_primeira else None,
    }
