"""
Rotas de Sessões de Entrevista

Endpoints para CRUD e sincronização de sessões.
"""

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import obter_usuario_atual
from app.core.seguranca import DadosToken
from app.db.session import get_db
from app.modelos.sessao_entrevista import SessaoEntrevista, StatusSessao
from app.esquemas.sessao_entrevista import (
    SessaoCreate,
    SessaoUpdate,
    SessaoResponse,
    SessaoListResponse,
    SessaoResumo,
    SincronizarSessoesRequest,
    SincronizarSessoesResponse,
    MigrarSessoesRequest,
    MigrarSessoesResponse,
)

router = APIRouter()


# ============================================
# ENDPOINTS DE CRUD
# ============================================


@router.get("/", response_model=SessaoListResponse)
async def listar_sessoes(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    busca: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Lista todas as sessões do usuário atual.

    - Paginação suportada
    - Filtro por status
    - Busca por título
    """
    # Query base filtrada por usuário
    query = select(SessaoEntrevista).where(
        SessaoEntrevista.usuario_id == usuario.usuario_id
    )

    # Filtro por status
    if status:
        query = query.where(SessaoEntrevista.status == status)

    # Busca por título
    if busca:
        query = query.where(SessaoEntrevista.titulo.ilike(f"%{busca}%"))

    # Ordenar por data de criação (mais recente primeiro)
    query = query.order_by(desc(SessaoEntrevista.iniciada_em))

    # Contar total
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)

    # Paginação
    offset = (pagina - 1) * por_pagina
    query = query.offset(offset).limit(por_pagina)

    result = await db.execute(query)
    sessoes = result.scalars().all()

    total_paginas = (total + por_pagina - 1) // por_pagina if total else 1

    return SessaoListResponse(
        sessoes=[_sessao_to_response(s) for s in sessoes],
        total=total or 0,
        pagina=pagina,
        por_pagina=por_pagina,
        total_paginas=total_paginas,
    )


@router.get("/{sessao_id}", response_model=SessaoResponse)
async def obter_sessao(
    sessao_id: str,
    db: AsyncSession = Depends(get_db),
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """Obtém uma sessão específica por ID."""
    query = select(SessaoEntrevista).where(
        SessaoEntrevista.id == sessao_id,
        SessaoEntrevista.usuario_id == usuario.usuario_id,
    )
    result = await db.execute(query)
    sessao = result.scalar_one_or_none()

    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    return _sessao_to_response(sessao)


@router.post("/", response_model=SessaoResponse, status_code=201)
async def criar_sessao(
    dados: SessaoCreate,
    db: AsyncSession = Depends(get_db),
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Cria uma nova sessão de entrevista.

    A sessão será vinculada ao usuário autenticado.
    """
    # Verificar se já existe sessão com este ID
    query = select(SessaoEntrevista).where(SessaoEntrevista.id == dados.id)
    result = await db.execute(query)
    existente = result.scalar_one_or_none()

    if existente:
        # Atualizar se pertence ao mesmo usuário
        if existente.usuario_id == usuario.usuario_id:
            return await atualizar_sessao(
                dados.id, SessaoUpdate(**dados.model_dump()), db, usuario
            )
        raise HTTPException(status_code=409, detail="Sessão com este ID já existe")

    # Criar nova sessão
    sessao = SessaoEntrevista(
        id=dados.id,
        entrevista_id=dados.entrevista_id,
        usuario_id=usuario.usuario_id,
        usuario_nome=usuario.nome,
        titulo=dados.titulo,
        status=dados.status.value if dados.status else StatusSessao.EM_ANDAMENTO.value,
        progresso=dados.progresso or 0,
        total_agentes=dados.total_agentes or 0,
        custo_atual=dados.custo_atual or 0.0,
        tokens_input=dados.tokens_input or 0,
        tokens_output=dados.tokens_output or 0,
        perguntas=dados.perguntas,
        respostas=dados.respostas,
        resultado=dados.resultado,
        relatorio_ia=dados.relatorio_ia,
        estatisticas=dados.estatisticas,
        modelo_usado=dados.modelo_usado,
        configuracoes=dados.configuracoes,
    )

    # Parse de datas se fornecidas
    if dados.finalizada_em:
        try:
            sessao.finalizada_em = datetime.fromisoformat(
                dados.finalizada_em.replace("Z", "+00:00")
            )
        except:
            pass

    db.add(sessao)
    await db.commit()
    await db.refresh(sessao)

    return _sessao_to_response(sessao)


@router.put("/{sessao_id}", response_model=SessaoResponse)
async def atualizar_sessao(
    sessao_id: str,
    dados: SessaoUpdate,
    db: AsyncSession = Depends(get_db),
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """Atualiza uma sessão existente."""
    query = select(SessaoEntrevista).where(
        SessaoEntrevista.id == sessao_id,
        SessaoEntrevista.usuario_id == usuario.usuario_id,
    )
    result = await db.execute(query)
    sessao = result.scalar_one_or_none()

    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    # Atualizar campos fornecidos
    update_data = dados.model_dump(exclude_unset=True, by_alias=False)

    for field, value in update_data.items():
        if field == "status" and value:
            value = value.value if hasattr(value, "value") else value
        if field == "finalizada_em" and value:
            try:
                value = datetime.fromisoformat(value.replace("Z", "+00:00"))
            except:
                continue
        setattr(sessao, field, value)

    # Incrementar versão
    sessao.versao += 1
    sessao.atualizada_em = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(sessao)

    return _sessao_to_response(sessao)


@router.delete("/{sessao_id}", status_code=204)
async def deletar_sessao(
    sessao_id: str,
    db: AsyncSession = Depends(get_db),
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """Deleta uma sessão."""
    query = select(SessaoEntrevista).where(
        SessaoEntrevista.id == sessao_id,
        SessaoEntrevista.usuario_id == usuario.usuario_id,
    )
    result = await db.execute(query)
    sessao = result.scalar_one_or_none()

    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")

    await db.delete(sessao)
    await db.commit()


# ============================================
# ENDPOINTS DE SINCRONIZAÇÃO
# ============================================


@router.post("/sincronizar", response_model=SincronizarSessoesResponse)
async def sincronizar_sessoes(
    dados: SincronizarSessoesRequest,
    db: AsyncSession = Depends(get_db),
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Sincroniza múltiplas sessões do frontend para o backend.

    - Cria sessões novas
    - Atualiza sessões existentes (baseado na versão)
    - Retorna todas as sessões sincronizadas
    """
    sincronizadas = 0
    erros = []
    sessoes_response = []

    for sessao_data in dados.sessoes:
        try:
            # Verificar se existe
            query = select(SessaoEntrevista).where(
                SessaoEntrevista.id == sessao_data.id
            )
            result = await db.execute(query)
            existente = result.scalar_one_or_none()

            if existente:
                # Verificar se pertence ao usuário
                if existente.usuario_id != usuario.usuario_id:
                    erros.append(
                        {
                            "id": sessao_data.id,
                            "erro": "Sessão pertence a outro usuário",
                        }
                    )
                    continue

                # Atualizar
                update_data = sessao_data.model_dump(
                    exclude={"id"}, exclude_unset=True, by_alias=False
                )
                for field, value in update_data.items():
                    if field == "status" and value:
                        value = value.value if hasattr(value, "value") else value
                    if field == "finalizada_em" and value:
                        try:
                            value = datetime.fromisoformat(value.replace("Z", "+00:00"))
                        except:
                            continue
                    setattr(existente, field, value)

                existente.versao += 1
                existente.atualizada_em = datetime.now(timezone.utc)
                sessoes_response.append(_sessao_to_response(existente))
            else:
                # Criar nova
                sessao = SessaoEntrevista(
                    id=sessao_data.id,
                    entrevista_id=sessao_data.entrevista_id,
                    usuario_id=usuario.usuario_id,
                    usuario_nome=usuario.nome,
                    titulo=sessao_data.titulo,
                    status=sessao_data.status.value
                    if sessao_data.status
                    else StatusSessao.EM_ANDAMENTO.value,
                    progresso=sessao_data.progresso or 0,
                    total_agentes=sessao_data.total_agentes or 0,
                    custo_atual=sessao_data.custo_atual or 0.0,
                    tokens_input=sessao_data.tokens_input or 0,
                    tokens_output=sessao_data.tokens_output or 0,
                    perguntas=sessao_data.perguntas,
                    respostas=sessao_data.respostas,
                    resultado=sessao_data.resultado,
                    relatorio_ia=sessao_data.relatorio_ia,
                    estatisticas=sessao_data.estatisticas,
                    modelo_usado=sessao_data.modelo_usado,
                    configuracoes=sessao_data.configuracoes,
                )
                db.add(sessao)
                sessoes_response.append(_sessao_to_response(sessao))

            sincronizadas += 1

        except Exception as e:
            erros.append({"id": sessao_data.id, "erro": str(e)})

    await db.commit()

    return SincronizarSessoesResponse(
        sucesso=len(erros) == 0,
        sincronizadas=sincronizadas,
        erros=erros,
        sessoes=sessoes_response,
    )


@router.post("/migrar", response_model=MigrarSessoesResponse)
async def migrar_sessoes_locais(
    dados: MigrarSessoesRequest,
    db: AsyncSession = Depends(get_db),
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Migra sessões do IndexedDB (local) para o PostgreSQL.

    Usado na primeira sincronização ou quando o usuário
    quer garantir que seus dados locais estejam no servidor.
    """
    migradas = 0
    ignoradas = 0
    erros = []

    for sessao_data in dados.sessoes:
        try:
            # Verificar se existe
            query = select(SessaoEntrevista).where(
                SessaoEntrevista.id == sessao_data.id
            )
            result = await db.execute(query)
            existente = result.scalar_one_or_none()

            if existente:
                if (
                    dados.substituir_existentes
                    and existente.usuario_id == usuario.usuario_id
                ):
                    # Substituir
                    update_data = sessao_data.model_dump(
                        exclude={"id"}, exclude_unset=True, by_alias=False
                    )
                    for field, value in update_data.items():
                        if field == "status" and value:
                            value = value.value if hasattr(value, "value") else value
                        if field == "finalizada_em" and value:
                            try:
                                value = datetime.fromisoformat(
                                    value.replace("Z", "+00:00")
                                )
                            except:
                                continue
                        setattr(existente, field, value)
                    existente.versao += 1
                    migradas += 1
                else:
                    ignoradas += 1
                    continue
            else:
                # Criar nova
                sessao = SessaoEntrevista(
                    id=sessao_data.id,
                    entrevista_id=sessao_data.entrevista_id,
                    usuario_id=usuario.usuario_id,
                    usuario_nome=usuario.nome,
                    titulo=sessao_data.titulo,
                    status=sessao_data.status.value
                    if sessao_data.status
                    else StatusSessao.EM_ANDAMENTO.value,
                    progresso=sessao_data.progresso or 0,
                    total_agentes=sessao_data.total_agentes or 0,
                    custo_atual=sessao_data.custo_atual or 0.0,
                    tokens_input=sessao_data.tokens_input or 0,
                    tokens_output=sessao_data.tokens_output or 0,
                    perguntas=sessao_data.perguntas,
                    respostas=sessao_data.respostas,
                    resultado=sessao_data.resultado,
                    relatorio_ia=sessao_data.relatorio_ia,
                    estatisticas=sessao_data.estatisticas,
                    modelo_usado=sessao_data.modelo_usado,
                    configuracoes=sessao_data.configuracoes,
                )

                if sessao_data.finalizada_em:
                    try:
                        sessao.finalizada_em = datetime.fromisoformat(
                            sessao_data.finalizada_em.replace("Z", "+00:00")
                        )
                    except:
                        pass

                db.add(sessao)
                migradas += 1

        except Exception as e:
            erros.append({"id": sessao_data.id, "erro": str(e)})

    await db.commit()

    return MigrarSessoesResponse(
        sucesso=len(erros) == 0,
        total_recebidas=len(dados.sessoes),
        migradas=migradas,
        ignoradas=ignoradas,
        erros=erros,
    )


@router.get("/resumo/estatisticas")
async def obter_estatisticas_sessoes(
    db: AsyncSession = Depends(get_db),
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """Obtém estatísticas das sessões do usuário."""
    # Total de sessões
    total_query = (
        select(func.count())
        .select_from(SessaoEntrevista)
        .where(SessaoEntrevista.usuario_id == usuario.usuario_id)
    )
    total = await db.scalar(total_query)

    # Por status
    status_query = (
        select(SessaoEntrevista.status, func.count().label("count"))
        .where(SessaoEntrevista.usuario_id == usuario.usuario_id)
        .group_by(SessaoEntrevista.status)
    )

    result = await db.execute(status_query)
    por_status = {row.status: row.count for row in result}

    # Custo total
    custo_query = select(func.sum(SessaoEntrevista.custo_atual)).where(
        SessaoEntrevista.usuario_id == usuario.usuario_id
    )
    custo_total = await db.scalar(custo_query) or 0.0

    # Tokens total
    tokens_query = select(
        func.sum(SessaoEntrevista.tokens_input),
        func.sum(SessaoEntrevista.tokens_output),
    ).where(SessaoEntrevista.usuario_id == usuario.usuario_id)
    result = await db.execute(tokens_query)
    tokens = result.one()

    return {
        "total_sessoes": total or 0,
        "por_status": por_status,
        "custo_total": custo_total,
        "tokens_input_total": tokens[0] or 0,
        "tokens_output_total": tokens[1] or 0,
        "tokens_total": (tokens[0] or 0) + (tokens[1] or 0),
    }


# ============================================
# HELPERS
# ============================================


def _sessao_to_response(sessao: SessaoEntrevista) -> SessaoResponse:
    """Converte modelo para response schema."""
    return SessaoResponse(
        id=sessao.id,
        entrevistaId=sessao.entrevista_id,
        titulo=sessao.titulo,
        status=sessao.status,
        progresso=sessao.progresso,
        totalAgentes=sessao.total_agentes,
        custoAtual=sessao.custo_atual,
        tokensInput=sessao.tokens_input,
        tokensOutput=sessao.tokens_output,
        perguntas=sessao.perguntas,
        respostas=sessao.respostas,
        resultado=sessao.resultado,
        relatorioIA=sessao.relatorio_ia,
        estatisticas=sessao.estatisticas,
        modeloUsado=sessao.modelo_usado,
        configuracoes=sessao.configuracoes,
        iniciadaEm=sessao.iniciada_em.isoformat() if sessao.iniciada_em else None,
        atualizadaEm=sessao.atualizada_em.isoformat() if sessao.atualizada_em else None,
        finalizadaEm=sessao.finalizada_em.isoformat() if sessao.finalizada_em else None,
        usuarioId=sessao.usuario_id,
        usuarioNome=sessao.usuario_nome,
        sincronizado=sessao.sincronizado,
        versao=sessao.versao,
    )
