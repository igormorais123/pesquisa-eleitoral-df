"""
Rotas de Memórias - Sistema de Persistência de Entrevistas.

Endpoints para:
- CRUD de memórias
- Histórico por eleitor
- Analytics globais de tokens e custos
- Exportação de dados

IMPORTANTE: Todas as rotas usam RLS (Row Level Security) para
garantir que cada usuário veja apenas suas próprias memórias.

FALLBACK: Quando o banco não está disponível, retorna dados vazios.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import (
    escape_sql_string,
    get_db_rls,
    get_db_admin,
    obter_usuario_atual,
    obter_usuario_admin,
    verificar_db_disponivel,
)
from app.core.seguranca import DadosToken
from app.modelos.memoria import Memoria, TipoMemoria, UsoAPI
from app.modelos.pesquisa import Pesquisa
from app.modelos.resposta import Resposta
from app.esquemas.memoria import (
    AnalyticsGlobais,
    FiltrosMemoria,
    HistoricoEleitor,
    MemoriaCreate,
    MemoriaListResponse,
    MemoriaResponse,
    MemoriaResumo,
    UsoAPIResponse,
)

router = APIRouter()
logger = logging.getLogger(__name__)


# ============================================
# CRUD DE MEMÓRIAS
# ============================================


@router.post("/", response_model=MemoriaResponse, status_code=status.HTTP_201_CREATED)
async def criar_memoria(
    memoria: MemoriaCreate,
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db_rls),
) -> MemoriaResponse:
    """
    Criar uma nova memória de entrevista.

    Usado internamente após cada resposta de entrevista para persistência.
    A memória é automaticamente associada ao usuário logado.
    """
    # IMPORTANTE: Usar usuario_id do token JWT, não do request
    # Isso garante que a memória seja associada ao usuário correto
    nova_memoria = Memoria(
        tipo=TipoMemoria(memoria.tipo.value),
        pesquisa_id=memoria.pesquisa_id,
        pergunta_id=memoria.pergunta_id,
        resposta_id=memoria.resposta_id,
        eleitor_id=memoria.eleitor_id,
        eleitor_nome=memoria.eleitor_nome,
        usuario_id=usuario.usuario_id,  # Forçar ID do usuário logado
        usuario_nome=usuario.nome,  # Usar nome do token
        pergunta_texto=memoria.pergunta_texto,
        resposta_texto=memoria.resposta_texto,
        resposta_valor=memoria.resposta_valor,
        fluxo_cognitivo=memoria.fluxo_cognitivo,
        modelo_usado=memoria.modelo_usado,
        tokens_entrada=memoria.tokens_entrada,
        tokens_saida=memoria.tokens_saida,
        tokens_total=memoria.tokens_entrada + memoria.tokens_saida,
        custo=memoria.custo,
        tempo_resposta_ms=memoria.tempo_resposta_ms,
        contexto=memoria.contexto,
        metadados=memoria.metadados,
    )

    db.add(nova_memoria)
    await db.commit()
    await db.refresh(nova_memoria)

    # Atualizar estatísticas de uso da API
    await _atualizar_uso_api(db, nova_memoria)

    return MemoriaResponse.model_validate(nova_memoria)


@router.get("/", response_model=MemoriaListResponse)
async def listar_memorias(
    eleitor_id: Optional[str] = None,
    pesquisa_id: Optional[int] = None,
    tipo: Optional[str] = None,
    modelo_usado: Optional[str] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    usuario: DadosToken = Depends(obter_usuario_atual),
) -> MemoriaListResponse:
    """
    Listar memórias com filtros e paginação.

    IMPORTANTE: Usuários normais veem apenas suas próprias memórias.
    Admins podem ver todas as memórias.

    FALLBACK: Se banco não disponível, retorna lista vazia.
    """
    # Verificar se banco está disponível
    if not await verificar_db_disponivel():
        logger.info("Banco não disponível - retornando lista vazia de memórias")
        return MemoriaListResponse(
            memorias=[],
            total=0,
            pagina=pagina,
            por_pagina=por_pagina,
            total_paginas=0,
        )

    # Executar com sessão RLS
    from app.db.session import AsyncSessionLocal
    from sqlalchemy import text

    async with AsyncSessionLocal() as db:
        try:
            # Configurar RLS (usando escape para evitar SQL injection)
            safe_user_id = escape_sql_string(str(usuario.usuario_id or ""))
            safe_role = escape_sql_string(str(usuario.papel or ""))
            await db.execute(text(f"SET LOCAL app.current_user_id = '{safe_user_id}'"))
            await db.execute(text(f"SET LOCAL app.current_user_role = '{safe_role}'"))

            # Construir query base
            query = select(Memoria)
            count_query = select(func.count(Memoria.id))

            # Aplicar filtros
            filtros = []

            # FILTRO OBRIGATÓRIO: Usuários normais só veem suas memórias
            if usuario.papel != "admin":
                filtros.append(Memoria.usuario_id == usuario.usuario_id)

            if eleitor_id:
                filtros.append(Memoria.eleitor_id == eleitor_id)
            if pesquisa_id:
                filtros.append(Memoria.pesquisa_id == pesquisa_id)
            if tipo:
                filtros.append(Memoria.tipo == tipo)
            if modelo_usado:
                filtros.append(Memoria.modelo_usado == modelo_usado)
            if data_inicio:
                filtros.append(Memoria.criado_em >= data_inicio)
            if data_fim:
                filtros.append(Memoria.criado_em <= data_fim)

            if filtros:
                query = query.where(and_(*filtros))
                count_query = count_query.where(and_(*filtros))

            # Contar total
            total_result = await db.execute(count_query)
            total = total_result.scalar() or 0

            # Aplicar paginação e ordenação
            offset = (pagina - 1) * por_pagina
            query = (
                query.order_by(Memoria.criado_em.desc())
                .offset(offset)
                .limit(por_pagina)
            )

            # Executar query
            result = await db.execute(query)
            memorias = result.scalars().all()

            # Converter para resumos
            resumos = [
                MemoriaResumo(
                    id=m.id,
                    tipo=m.tipo,
                    eleitor_id=m.eleitor_id,
                    eleitor_nome=m.eleitor_nome,
                    pesquisa_id=m.pesquisa_id,
                    resposta_texto=m.resposta_texto[:200]
                    if len(m.resposta_texto) > 200
                    else m.resposta_texto,
                    modelo_usado=m.modelo_usado,
                    tokens_total=m.tokens_total,
                    custo=m.custo,
                    criado_em=m.criado_em,
                )
                for m in memorias
            ]

            total_paginas = (total + por_pagina - 1) // por_pagina

            return MemoriaListResponse(
                memorias=resumos,
                total=total,
                pagina=pagina,
                por_pagina=por_pagina,
                total_paginas=total_paginas,
            )
        except Exception as e:
            logger.warning(f"Erro ao listar memórias: {e}")
            return MemoriaListResponse(
                memorias=[],
                total=0,
                pagina=pagina,
                por_pagina=por_pagina,
                total_paginas=0,
            )


@router.get("/{memoria_id}", response_model=MemoriaResponse)
async def obter_memoria(
    memoria_id: int,
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db_rls),
) -> MemoriaResponse:
    """
    Obter uma memória específica por ID.

    Usuários só podem ver suas próprias memórias. Admins veem todas.
    """
    # Construir query com filtro de acesso
    query = select(Memoria).where(Memoria.id == memoria_id)

    # Usuários normais só podem ver suas memórias
    if usuario.papel != "admin":
        query = query.where(Memoria.usuario_id == usuario.usuario_id)

    result = await db.execute(query)
    memoria = result.scalar_one_or_none()

    if not memoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Memória {memoria_id} não encontrada ou sem permissão",
        )

    return MemoriaResponse.model_validate(memoria)


# ============================================
# HISTÓRICO POR ELEITOR
# ============================================


@router.get("/eleitor/{eleitor_id}", response_model=HistoricoEleitor)
async def obter_historico_eleitor(
    eleitor_id: str,
    limite: int = Query(50, ge=1, le=500),
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db_rls),
) -> HistoricoEleitor:
    """
    Obter histórico completo de um eleitor.

    Inclui todas as entrevistas, tokens gastos, custos e sentimentos.
    Usuários veem apenas histórico das entrevistas que fizeram.
    Admins veem todo o histórico.
    """
    # Construir filtros
    filtros = [Memoria.eleitor_id == eleitor_id]

    # Usuários normais só veem suas entrevistas com o eleitor
    if usuario.papel != "admin":
        filtros.append(Memoria.usuario_id == usuario.usuario_id)

    # Buscar memórias do eleitor
    query = (
        select(Memoria)
        .where(and_(*filtros))
        .order_by(Memoria.criado_em.desc())
        .limit(limite)
    )
    result = await db.execute(query)
    memorias = result.scalars().all()

    if not memorias:
        return HistoricoEleitor(eleitor_id=eleitor_id)

    # Calcular agregações
    tokens_total = sum(m.tokens_total for m in memorias)
    custo_total = sum(m.custo for m in memorias)
    pesquisas = list(set(m.pesquisa_id for m in memorias if m.pesquisa_id))

    # Extrair sentimentos
    sentimentos: dict[str, int] = {}
    for m in memorias:
        sentimento = m.sentimento_dominante
        if sentimento:
            sentimentos[sentimento] = sentimentos.get(sentimento, 0) + 1

    # Converter memórias para resumos
    resumos = [
        MemoriaResumo(
            id=m.id,
            tipo=m.tipo,
            eleitor_id=m.eleitor_id,
            eleitor_nome=m.eleitor_nome,
            pesquisa_id=m.pesquisa_id,
            resposta_texto=m.resposta_texto[:200]
            if len(m.resposta_texto) > 200
            else m.resposta_texto,
            modelo_usado=m.modelo_usado,
            tokens_total=m.tokens_total,
            custo=m.custo,
            criado_em=m.criado_em,
        )
        for m in memorias
    ]

    return HistoricoEleitor(
        eleitor_id=eleitor_id,
        eleitor_nome=memorias[0].eleitor_nome if memorias else None,
        total_entrevistas=len(pesquisas),
        total_respostas=len(memorias),
        pesquisas_participadas=pesquisas,
        tokens_total=tokens_total,
        custo_total=custo_total,
        primeira_entrevista=min(m.criado_em for m in memorias) if memorias else None,
        ultima_entrevista=max(m.criado_em for m in memorias) if memorias else None,
        sentimentos_frequentes=sentimentos,
        memorias=resumos,
    )


# ============================================
# ANALYTICS GLOBAIS
# ============================================


@router.get("/analytics/global", response_model=AnalyticsGlobais)
async def obter_analytics_globais(
    dias: int = Query(30, ge=1, le=365),
    usuario: DadosToken = Depends(obter_usuario_atual),
) -> AnalyticsGlobais:
    """
    Obter analytics globais do sistema.

    Retorna totais acumulados, distribuição por modelo, tendências de custo.
    Usuários veem apenas analytics das suas memórias.
    Admins veem analytics de todo o sistema.

    FALLBACK: Se banco não disponível, retorna analytics vazios.
    """
    # Fallback vazio para quando banco não disponível
    analytics_vazio = AnalyticsGlobais(
        total_memorias=0,
        total_pesquisas=0,
        total_eleitores_unicos=0,
        total_respostas=0,
        tokens_entrada_acumulados=0,
        tokens_saida_acumulados=0,
        tokens_acumulados=0,
        custo_acumulado=0.0,
        custo_medio_por_resposta=0.0,
        custo_medio_por_eleitor=0.0,
        distribuicao_modelos={},
        custo_por_modelo={},
        tokens_por_modelo={},
        tempo_resposta_medio_ms=0,
        data_primeira_memoria=None,
        data_ultima_memoria=None,
    )

    # Verificar se banco está disponível
    if not await verificar_db_disponivel():
        logger.info("Banco não disponível - retornando analytics vazios")
        return analytics_vazio

    # Executar com sessão
    from app.db.session import AsyncSessionLocal
    from sqlalchemy import text

    try:
        async with AsyncSessionLocal() as db:
            # Configurar RLS (usando escape para evitar SQL injection)
            safe_user_id = escape_sql_string(str(usuario.usuario_id or ""))
            safe_role = escape_sql_string(str(usuario.papel or ""))
            await db.execute(text(f"SET LOCAL app.current_user_id = '{safe_user_id}'"))
            await db.execute(text(f"SET LOCAL app.current_user_role = '{safe_role}'"))

            data_inicio = datetime.now() - timedelta(days=dias)

            # Filtro base: usuários normais só veem suas memórias
            filtro_usuario = []
            if usuario.papel != "admin":
                filtro_usuario = [Memoria.usuario_id == usuario.usuario_id]

            # Totais de memórias
            total_query = select(func.count(Memoria.id))
            if filtro_usuario:
                total_query = total_query.where(and_(*filtro_usuario))
            total_result = await db.execute(total_query)
            total_memorias = total_result.scalar() or 0

            # Totais dentro do período
            periodo_filtros = [Memoria.criado_em >= data_inicio] + filtro_usuario
            periodo_query = select(
                func.count(Memoria.id).label("total"),
                func.count(distinct(Memoria.eleitor_id)).label("eleitores_unicos"),
                func.count(distinct(Memoria.pesquisa_id)).label("pesquisas"),
                func.sum(Memoria.tokens_entrada).label("tokens_entrada"),
                func.sum(Memoria.tokens_saida).label("tokens_saida"),
                func.sum(Memoria.tokens_total).label("tokens_total"),
                func.sum(Memoria.custo).label("custo_total"),
                func.avg(Memoria.tempo_resposta_ms).label("tempo_medio"),
            ).where(and_(*periodo_filtros))

            periodo_result = await db.execute(periodo_query)
            stats = periodo_result.first()

            # Distribuição por modelo
            modelo_query = (
                select(
                    Memoria.modelo_usado,
                    func.count(Memoria.id).label("total"),
                    func.sum(Memoria.custo).label("custo"),
                    func.sum(Memoria.tokens_total).label("tokens"),
                )
                .where(and_(*periodo_filtros))
                .group_by(Memoria.modelo_usado)
            )
            modelo_result = await db.execute(modelo_query)
            modelos = modelo_result.all()

            distribuicao_modelos = {m.modelo_usado: m.total for m in modelos}
            custo_por_modelo = {m.modelo_usado: float(m.custo or 0) for m in modelos}
            tokens_por_modelo = {m.modelo_usado: int(m.tokens or 0) for m in modelos}

            # Datas primeira/última memória
            datas_query = select(
                func.min(Memoria.criado_em).label("primeira"),
                func.max(Memoria.criado_em).label("ultima"),
            )
            if filtro_usuario:
                datas_query = datas_query.where(and_(*filtro_usuario))
            datas_result = await db.execute(datas_query)
            datas = datas_result.first()

            # Calcular médias
            total_respostas = stats.total or 0
            eleitores_unicos = stats.eleitores_unicos or 0
            custo_total = float(stats.custo_total or 0)

            custo_medio_resposta = (
                custo_total / total_respostas if total_respostas > 0 else 0
            )
            custo_medio_eleitor = (
                custo_total / eleitores_unicos if eleitores_unicos > 0 else 0
            )

            return AnalyticsGlobais(
                total_memorias=total_memorias,
                total_pesquisas=stats.pesquisas or 0,
                total_eleitores_unicos=eleitores_unicos,
                total_respostas=total_respostas,
                tokens_entrada_acumulados=int(stats.tokens_entrada or 0),
                tokens_saida_acumulados=int(stats.tokens_saida or 0),
                tokens_acumulados=int(stats.tokens_total or 0),
                custo_acumulado=custo_total,
                custo_medio_por_resposta=custo_medio_resposta,
                custo_medio_por_eleitor=custo_medio_eleitor,
                distribuicao_modelos=distribuicao_modelos,
                custo_por_modelo=custo_por_modelo,
                tokens_por_modelo=tokens_por_modelo,
                tempo_resposta_medio_ms=int(stats.tempo_medio or 0),
                data_primeira_memoria=datas.primeira if datas else None,
                data_ultima_memoria=datas.ultima if datas else None,
            )
    except Exception as e:
        logger.warning(f"Erro ao obter analytics globais: {e}")
        return analytics_vazio


@router.get("/analytics/uso", response_model=list[UsoAPIResponse])
async def obter_uso_api(
    dias: int = Query(30, ge=1, le=365),
    tipo_periodo: str = Query("dia", pattern="^(dia|semana|mes)$"),
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db_rls),
) -> list[UsoAPIResponse]:
    """
    Obter estatísticas de uso da API por período.

    Usuários veem apenas seu uso. Admins veem uso de todos.
    """
    data_inicio = datetime.now() - timedelta(days=dias)

    # Construir filtros
    filtros = [
        UsoAPI.tipo_periodo == tipo_periodo,
        UsoAPI.criado_em >= data_inicio,
    ]

    # Usuários normais só veem seu uso
    if usuario.papel != "admin":
        filtros.append(UsoAPI.usuario_id == usuario.usuario_id)

    query = select(UsoAPI).where(and_(*filtros)).order_by(UsoAPI.periodo.asc())

    result = await db.execute(query)
    usos = result.scalars().all()

    return [UsoAPIResponse.model_validate(u) for u in usos]


@router.get("/analytics/pesquisa/{pesquisa_id}")
async def obter_analytics_pesquisa(
    pesquisa_id: int,
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db_rls),
) -> dict:
    """
    Obter analytics de uma pesquisa específica.

    Retorna tokens, custos e estatísticas da pesquisa.
    Usuários só veem analytics das suas memórias na pesquisa.
    """
    # Construir filtros base
    filtros = [Memoria.pesquisa_id == pesquisa_id]

    # Usuários normais só veem suas memórias
    if usuario.papel != "admin":
        filtros.append(Memoria.usuario_id == usuario.usuario_id)

    # Buscar memórias da pesquisa
    query = select(
        func.count(Memoria.id).label("total_respostas"),
        func.count(distinct(Memoria.eleitor_id)).label("eleitores_unicos"),
        func.sum(Memoria.tokens_entrada).label("tokens_entrada"),
        func.sum(Memoria.tokens_saida).label("tokens_saida"),
        func.sum(Memoria.tokens_total).label("tokens_total"),
        func.sum(Memoria.custo).label("custo_total"),
        func.avg(Memoria.tempo_resposta_ms).label("tempo_medio"),
        func.min(Memoria.criado_em).label("inicio"),
        func.max(Memoria.criado_em).label("fim"),
    ).where(and_(*filtros))

    result = await db.execute(query)
    stats = result.first()

    if not stats or not stats.total_respostas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Nenhuma memória encontrada para pesquisa {pesquisa_id}",
        )

    # Distribuição por modelo (com filtro de usuário)
    modelo_query = (
        select(
            Memoria.modelo_usado,
            func.count(Memoria.id).label("total"),
            func.sum(Memoria.custo).label("custo"),
        )
        .where(and_(*filtros))
        .group_by(Memoria.modelo_usado)
    )
    modelo_result = await db.execute(modelo_query)
    modelos = {
        m.modelo_usado: {"total": m.total, "custo": float(m.custo or 0)}
        for m in modelo_result.all()
    }

    return {
        "pesquisa_id": pesquisa_id,
        "total_respostas": stats.total_respostas,
        "eleitores_unicos": stats.eleitores_unicos,
        "tokens_entrada": int(stats.tokens_entrada or 0),
        "tokens_saida": int(stats.tokens_saida or 0),
        "tokens_total": int(stats.tokens_total or 0),
        "custo_total": float(stats.custo_total or 0),
        "tempo_resposta_medio_ms": int(stats.tempo_medio or 0),
        "inicio": stats.inicio.isoformat() if stats.inicio else None,
        "fim": stats.fim.isoformat() if stats.fim else None,
        "modelos": modelos,
    }


# ============================================
# FUNÇÕES AUXILIARES
# ============================================


async def _atualizar_uso_api(db: AsyncSession, memoria: Memoria) -> None:
    """
    Atualiza as estatísticas de uso da API após criar uma memória.
    """
    # Determinar período (dia atual)
    hoje = datetime.now().strftime("%Y-%m-%d")

    # Buscar ou criar registro de uso
    query = select(UsoAPI).where(
        and_(
            UsoAPI.periodo == hoje,
            UsoAPI.tipo_periodo == "dia",
            UsoAPI.usuario_id == memoria.usuario_id,
        )
    )
    result = await db.execute(query)
    uso = result.scalar_one_or_none()

    if not uso:
        uso = UsoAPI(
            periodo=hoje,
            tipo_periodo="dia",
            usuario_id=memoria.usuario_id,
        )
        db.add(uso)

    # Atualizar contadores
    uso.total_chamadas += 1
    uso.tokens_entrada_total += memoria.tokens_entrada
    uso.tokens_saida_total += memoria.tokens_saida
    uso.tokens_total += memoria.tokens_total
    uso.custo_total += memoria.custo

    # Por modelo
    if "opus" in memoria.modelo_usado.lower():
        uso.chamadas_opus += 1
        uso.tokens_opus += memoria.tokens_total
        uso.custo_opus += memoria.custo
    else:
        uso.chamadas_sonnet += 1
        uso.tokens_sonnet += memoria.tokens_total
        uso.custo_sonnet += memoria.custo

    # Atualizar tempo médio (média móvel simples)
    if uso.tempo_resposta_medio_ms == 0:
        uso.tempo_resposta_medio_ms = memoria.tempo_resposta_ms
    else:
        uso.tempo_resposta_medio_ms = (
            uso.tempo_resposta_medio_ms + memoria.tempo_resposta_ms
        ) // 2

    await db.commit()


# ============================================
# MIGRAÇÃO DE DADOS EXISTENTES
# ============================================


@router.post("/migrar-respostas", status_code=status.HTTP_200_OK)
async def migrar_respostas_para_memorias(
    usuario: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db_admin),
) -> dict:
    """
    Migra respostas existentes para a tabela de memórias.

    REQUER: Permissão de administrador.
    Útil para importar dados históricos. Executa apenas uma vez.
    """
    # Contar respostas existentes
    count_query = select(func.count(Resposta.id))
    count_result = await db.execute(count_query)
    total_respostas = count_result.scalar() or 0

    if total_respostas == 0:
        return {"mensagem": "Nenhuma resposta para migrar", "total": 0}

    # Verificar se já existem memórias (evitar duplicação)
    mem_count_query = select(func.count(Memoria.id))
    mem_count_result = await db.execute(mem_count_query)
    total_memorias = mem_count_result.scalar() or 0

    if total_memorias > 0:
        return {
            "mensagem": "Migração já realizada. Use com cuidado para evitar duplicatas.",
            "memorias_existentes": total_memorias,
        }

    # Buscar todas as respostas com dados da pesquisa
    query = select(Resposta).order_by(Resposta.criado_em.asc())
    result = await db.execute(query)
    respostas = result.scalars().all()

    migradas = 0
    for r in respostas:
        # Buscar texto da pergunta se disponível
        pergunta_texto = None
        if r.pergunta:
            pergunta_texto = r.pergunta.texto

        memoria = Memoria(
            tipo=TipoMemoria.entrevista,
            pesquisa_id=r.pesquisa_id,
            pergunta_id=r.pergunta_id,
            resposta_id=r.id,
            eleitor_id=r.eleitor_id,
            eleitor_nome=r.eleitor_nome,
            pergunta_texto=pergunta_texto,
            resposta_texto=r.resposta_texto,
            resposta_valor=r.resposta_valor,
            fluxo_cognitivo=r.fluxo_cognitivo,
            modelo_usado=r.modelo_usado,
            tokens_entrada=r.tokens_entrada,
            tokens_saida=r.tokens_saida,
            tokens_total=r.tokens_entrada + r.tokens_saida,
            custo=r.custo,
            tempo_resposta_ms=r.tempo_resposta_ms,
            metadados=r.metadados,
        )
        # Preservar timestamp original
        memoria.criado_em = r.criado_em

        db.add(memoria)
        migradas += 1

    await db.commit()

    return {
        "mensagem": "Migração concluída com sucesso",
        "total_respostas": total_respostas,
        "memorias_criadas": migradas,
    }
