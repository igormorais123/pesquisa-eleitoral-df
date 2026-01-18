"""
Rotas de API para Pesquisa PODC

Endpoints para criar, executar e analisar pesquisas sobre
distribuição de tempo nas funções administrativas de gestores.

IMPORTANTE: Os dados são persistidos no banco de dados PostgreSQL.
"""

from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import DadosToken, obter_usuario_atual
from app.db.session import get_db
from app.modelos.pesquisa_podc import PesquisaPODC, RespostaPODC, EstatisticasPODC
from app.esquemas.pesquisa_podc import (
    AtualizarPesquisaPODC,
    CriarPesquisaPODC,
    CriarRespostaPODC,
)

router = APIRouter()


# ============================================
# CRUD DE PESQUISAS
# ============================================


@router.post("/", status_code=status.HTTP_201_CREATED)
async def criar_pesquisa(
    dados: CriarPesquisaPODC,
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """
    Cria uma nova pesquisa PODC.

    A pesquisa é criada com status 'pendente' e pode ser iniciada posteriormente.
    Os dados são persistidos no banco de dados.
    """
    pesquisa_id = str(uuid4())
    agora = datetime.utcnow()

    pesquisa = PesquisaPODC(
        id=pesquisa_id,
        usuario_id=usuario.usuario_id,
        titulo=dados.titulo,
        descricao=dados.descricao,
        status="pendente",
        total_gestores=len(dados.gestores_ids),
        total_respostas=0,
        perguntas=[p.model_dump() for p in dados.perguntas],
        gestores_ids=dados.gestores_ids,
        custo_total=0.0,
        tokens_total=0,
        criado_em=agora,
        atualizado_em=agora,
    )

    db.add(pesquisa)
    await db.commit()
    await db.refresh(pesquisa)

    return {
        "id": pesquisa.id,
        "usuario_id": pesquisa.usuario_id,
        "titulo": pesquisa.titulo,
        "descricao": pesquisa.descricao,
        "status": pesquisa.status,
        "total_gestores": pesquisa.total_gestores,
        "total_respostas": pesquisa.total_respostas,
        "perguntas": pesquisa.perguntas,
        "gestores_ids": pesquisa.gestores_ids,
        "custo_total": pesquisa.custo_total,
        "tokens_total": pesquisa.tokens_total,
        "criado_em": pesquisa.criado_em,
        "atualizado_em": pesquisa.atualizado_em,
        "iniciado_em": pesquisa.iniciado_em,
        "finalizado_em": pesquisa.finalizado_em,
    }


@router.get("/")
async def listar_pesquisas(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    status_filtro: Optional[str] = Query(None, alias="status"),
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """
    Lista pesquisas PODC do usuário.

    Os dados são recuperados do banco de dados PostgreSQL.
    """
    query = select(PesquisaPODC).where(PesquisaPODC.usuario_id == usuario.usuario_id)

    if status_filtro:
        query = query.where(PesquisaPODC.status == status_filtro)

    query = query.order_by(PesquisaPODC.criado_em.desc())

    # Paginação
    offset = (pagina - 1) * por_pagina
    query = query.offset(offset).limit(por_pagina)

    result = await db.execute(query)
    pesquisas = result.scalars().all()

    return {
        "pesquisas": [
            {
                "id": p.id,
                "usuario_id": p.usuario_id,
                "titulo": p.titulo,
                "descricao": p.descricao,
                "status": p.status,
                "total_gestores": p.total_gestores,
                "total_respostas": p.total_respostas,
                "perguntas": p.perguntas,
                "gestores_ids": p.gestores_ids,
                "custo_total": p.custo_total,
                "tokens_total": p.tokens_total,
                "criado_em": p.criado_em,
                "atualizado_em": p.atualizado_em,
                "iniciado_em": p.iniciado_em,
                "finalizado_em": p.finalizado_em,
            }
            for p in pesquisas
        ],
        "pagina": pagina,
        "por_pagina": por_pagina,
    }


@router.get("/{pesquisa_id}")
async def obter_pesquisa(
    pesquisa_id: str,
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """
    Obtém detalhes de uma pesquisa PODC.
    """
    result = await db.execute(
        select(PesquisaPODC).where(PesquisaPODC.id == pesquisa_id)
    )
    pesquisa = result.scalar_one_or_none()

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa.usuario_id != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    return {
        "id": pesquisa.id,
        "usuario_id": pesquisa.usuario_id,
        "titulo": pesquisa.titulo,
        "descricao": pesquisa.descricao,
        "status": pesquisa.status,
        "total_gestores": pesquisa.total_gestores,
        "total_respostas": pesquisa.total_respostas,
        "perguntas": pesquisa.perguntas,
        "gestores_ids": pesquisa.gestores_ids,
        "custo_total": pesquisa.custo_total,
        "tokens_total": pesquisa.tokens_total,
        "criado_em": pesquisa.criado_em,
        "atualizado_em": pesquisa.atualizado_em,
        "iniciado_em": pesquisa.iniciado_em,
        "finalizado_em": pesquisa.finalizado_em,
    }


@router.patch("/{pesquisa_id}")
async def atualizar_pesquisa(
    pesquisa_id: str,
    dados: AtualizarPesquisaPODC,
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """
    Atualiza uma pesquisa PODC.
    """
    result = await db.execute(
        select(PesquisaPODC).where(PesquisaPODC.id == pesquisa_id)
    )
    pesquisa = result.scalar_one_or_none()

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa.usuario_id != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    # Atualizar campos fornecidos
    if dados.titulo is not None:
        pesquisa.titulo = dados.titulo
    if dados.descricao is not None:
        pesquisa.descricao = dados.descricao
    if dados.status is not None:
        pesquisa.status = dados.status

    pesquisa.atualizado_em = datetime.utcnow()

    await db.commit()
    await db.refresh(pesquisa)

    return {
        "id": pesquisa.id,
        "usuario_id": pesquisa.usuario_id,
        "titulo": pesquisa.titulo,
        "descricao": pesquisa.descricao,
        "status": pesquisa.status,
        "total_gestores": pesquisa.total_gestores,
        "total_respostas": pesquisa.total_respostas,
        "custo_total": pesquisa.custo_total,
        "tokens_total": pesquisa.tokens_total,
        "atualizado_em": pesquisa.atualizado_em,
    }


@router.delete("/{pesquisa_id}")
async def deletar_pesquisa(
    pesquisa_id: str,
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """
    Remove uma pesquisa PODC e todas as suas respostas.
    """
    result = await db.execute(
        select(PesquisaPODC).where(PesquisaPODC.id == pesquisa_id)
    )
    pesquisa = result.scalar_one_or_none()

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa.usuario_id != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    await db.delete(pesquisa)
    await db.commit()

    return {"mensagem": f"Pesquisa {pesquisa_id} removida com sucesso"}


# ============================================
# CONTROLE DE EXECUÇÃO
# ============================================


@router.post("/{pesquisa_id}/iniciar")
async def iniciar_pesquisa(
    pesquisa_id: str,
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """
    Inicia a execução de uma pesquisa PODC.
    """
    result = await db.execute(
        select(PesquisaPODC).where(PesquisaPODC.id == pesquisa_id)
    )
    pesquisa = result.scalar_one_or_none()

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa.usuario_id != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    if pesquisa.status not in ["pendente", "pausada"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pesquisa não pode ser iniciada no status '{pesquisa.status}'"
        )

    pesquisa.status = "em_andamento"
    pesquisa.iniciado_em = datetime.utcnow()
    pesquisa.atualizado_em = datetime.utcnow()

    await db.commit()

    return {
        "mensagem": "Pesquisa iniciada com sucesso",
        "pesquisa_id": pesquisa_id,
        "status": pesquisa.status
    }


@router.post("/{pesquisa_id}/pausar")
async def pausar_pesquisa(
    pesquisa_id: str,
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """
    Pausa a execução de uma pesquisa PODC.
    """
    result = await db.execute(
        select(PesquisaPODC).where(PesquisaPODC.id == pesquisa_id)
    )
    pesquisa = result.scalar_one_or_none()

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa.usuario_id != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    if pesquisa.status != "em_andamento":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pesquisa não pode ser pausada no status '{pesquisa.status}'"
        )

    pesquisa.status = "pausada"
    pesquisa.atualizado_em = datetime.utcnow()

    await db.commit()

    return {
        "mensagem": "Pesquisa pausada com sucesso",
        "pesquisa_id": pesquisa_id,
        "status": pesquisa.status
    }


@router.post("/{pesquisa_id}/finalizar")
async def finalizar_pesquisa(
    pesquisa_id: str,
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """
    Finaliza uma pesquisa PODC.
    """
    result = await db.execute(
        select(PesquisaPODC).where(PesquisaPODC.id == pesquisa_id)
    )
    pesquisa = result.scalar_one_or_none()

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa.usuario_id != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    pesquisa.status = "concluida"
    pesquisa.finalizado_em = datetime.utcnow()
    pesquisa.atualizado_em = datetime.utcnow()

    await db.commit()

    return {
        "mensagem": "Pesquisa finalizada com sucesso",
        "pesquisa_id": pesquisa_id,
        "status": pesquisa.status,
        "total_respostas": pesquisa.total_respostas
    }


# ============================================
# RESPOSTAS
# ============================================


@router.post("/{pesquisa_id}/respostas", status_code=status.HTTP_201_CREATED)
async def criar_resposta(
    pesquisa_id: str,
    dados: CriarRespostaPODC,
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """
    Adiciona uma resposta de gestor à pesquisa PODC.

    Esta rota é chamada pelo frontend quando uma resposta é processada pelo Claude.
    Os dados estruturados são extraídos da resposta do Claude e salvos permanentemente
    no banco de dados PostgreSQL.
    """
    result = await db.execute(
        select(PesquisaPODC).where(PesquisaPODC.id == pesquisa_id)
    )
    pesquisa = result.scalar_one_or_none()

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa.usuario_id != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    # Calcular IAD
    podc = dados.distribuicao_podc
    denominador = podc.dirigir + podc.controlar
    iad = round((podc.planejar + podc.organizar) / denominador, 2) if denominador > 0 else 0

    # Classificar IAD
    if iad >= 1.5:
        iad_classificacao = "Altamente Proativo (Formulador)"
    elif iad >= 1.0:
        iad_classificacao = "Proativo"
    elif iad >= 0.7:
        iad_classificacao = "Equilibrado"
    elif iad >= 0.5:
        iad_classificacao = "Reativo"
    else:
        iad_classificacao = "Altamente Reativo (Executor)"

    resposta_id = str(uuid4())
    agora = datetime.utcnow()

    resposta = RespostaPODC(
        id=resposta_id,
        pesquisa_id=pesquisa_id,
        gestor_id=dados.gestor.id,
        gestor_nome=dados.gestor.nome,
        gestor_setor=dados.gestor.setor,
        gestor_nivel=dados.gestor.nivel,
        gestor_cargo=dados.gestor.cargo,
        gestor_instituicao=dados.gestor.instituicao,
        podc_planejar=podc.planejar,
        podc_organizar=podc.organizar,
        podc_dirigir=podc.dirigir,
        podc_controlar=podc.controlar,
        podc_ideal_planejar=dados.distribuicao_ideal.planejar if dados.distribuicao_ideal else None,
        podc_ideal_organizar=dados.distribuicao_ideal.organizar if dados.distribuicao_ideal else None,
        podc_ideal_dirigir=dados.distribuicao_ideal.dirigir if dados.distribuicao_ideal else None,
        podc_ideal_controlar=dados.distribuicao_ideal.controlar if dados.distribuicao_ideal else None,
        horas_total=dados.horas_semanais.total if dados.horas_semanais else None,
        horas_planejar=dados.horas_semanais.planejar if dados.horas_semanais else None,
        horas_organizar=dados.horas_semanais.organizar if dados.horas_semanais else None,
        horas_dirigir=dados.horas_semanais.dirigir if dados.horas_semanais else None,
        horas_controlar=dados.horas_semanais.controlar if dados.horas_semanais else None,
        iad=iad,
        iad_classificacao=iad_classificacao,
        ranking_importancia=dados.ranking_importancia,
        fatores_limitantes=dados.fatores_limitantes,
        justificativa=dados.justificativa,
        frequencia_atividades=dados.frequencia_atividades.model_dump() if dados.frequencia_atividades else None,
        respostas_perguntas=[r.model_dump() for r in dados.respostas_perguntas] if dados.respostas_perguntas else None,
        resposta_bruta=dados.resposta_bruta,
        tokens_input=dados.tokens_input,
        tokens_output=dados.tokens_output,
        custo_reais=dados.custo_reais,
        status="concluida",
        criado_em=agora,
        processado_em=agora,
    )

    db.add(resposta)

    # Atualizar contadores da pesquisa
    pesquisa.total_respostas += 1
    pesquisa.custo_total += dados.custo_reais
    pesquisa.tokens_total += dados.tokens_input + dados.tokens_output
    pesquisa.atualizado_em = agora

    await db.commit()
    await db.refresh(resposta)

    return {
        "id": resposta.id,
        "pesquisa_id": resposta.pesquisa_id,
        "gestor_id": resposta.gestor_id,
        "gestor_nome": resposta.gestor_nome,
        "gestor_setor": resposta.gestor_setor,
        "gestor_nivel": resposta.gestor_nivel,
        "gestor_cargo": resposta.gestor_cargo,
        "gestor_instituicao": resposta.gestor_instituicao,
        "podc_planejar": resposta.podc_planejar,
        "podc_organizar": resposta.podc_organizar,
        "podc_dirigir": resposta.podc_dirigir,
        "podc_controlar": resposta.podc_controlar,
        "podc_ideal_planejar": resposta.podc_ideal_planejar,
        "podc_ideal_organizar": resposta.podc_ideal_organizar,
        "podc_ideal_dirigir": resposta.podc_ideal_dirigir,
        "podc_ideal_controlar": resposta.podc_ideal_controlar,
        "horas_total": resposta.horas_total,
        "iad": resposta.iad,
        "iad_classificacao": resposta.iad_classificacao,
        "ranking_importancia": resposta.ranking_importancia,
        "fatores_limitantes": resposta.fatores_limitantes,
        "justificativa": resposta.justificativa,
        "tokens_input": resposta.tokens_input,
        "tokens_output": resposta.tokens_output,
        "custo_reais": resposta.custo_reais,
        "status": resposta.status,
        "criado_em": resposta.criado_em,
        "processado_em": resposta.processado_em,
    }


@router.get("/{pesquisa_id}/respostas")
async def listar_respostas(
    pesquisa_id: str,
    setor: Optional[str] = None,
    nivel: Optional[str] = None,
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(50, ge=1, le=100),
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """
    Lista respostas de uma pesquisa PODC.

    Os dados são recuperados do banco de dados PostgreSQL.
    """
    # Verificar acesso à pesquisa
    result = await db.execute(
        select(PesquisaPODC).where(PesquisaPODC.id == pesquisa_id)
    )
    pesquisa = result.scalar_one_or_none()

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa.usuario_id != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    # Buscar respostas
    query = select(RespostaPODC).where(RespostaPODC.pesquisa_id == pesquisa_id)

    if setor:
        query = query.where(RespostaPODC.gestor_setor == setor)

    if nivel:
        query = query.where(RespostaPODC.gestor_nivel == nivel)

    query = query.order_by(RespostaPODC.criado_em)

    # Paginação
    offset = (pagina - 1) * por_pagina
    query = query.offset(offset).limit(por_pagina)

    result = await db.execute(query)
    respostas = result.scalars().all()

    return {
        "respostas": [
            {
                "id": r.id,
                "pesquisa_id": r.pesquisa_id,
                "gestor_id": r.gestor_id,
                "gestor_nome": r.gestor_nome,
                "gestor_setor": r.gestor_setor,
                "gestor_nivel": r.gestor_nivel,
                "gestor_cargo": r.gestor_cargo,
                "gestor_instituicao": r.gestor_instituicao,
                "podc_planejar": r.podc_planejar,
                "podc_organizar": r.podc_organizar,
                "podc_dirigir": r.podc_dirigir,
                "podc_controlar": r.podc_controlar,
                "podc_ideal_planejar": r.podc_ideal_planejar,
                "podc_ideal_organizar": r.podc_ideal_organizar,
                "podc_ideal_dirigir": r.podc_ideal_dirigir,
                "podc_ideal_controlar": r.podc_ideal_controlar,
                "horas_total": r.horas_total,
                "iad": r.iad,
                "iad_classificacao": r.iad_classificacao,
                "ranking_importancia": r.ranking_importancia,
                "fatores_limitantes": r.fatores_limitantes,
                "justificativa": r.justificativa,
                "tokens_input": r.tokens_input,
                "tokens_output": r.tokens_output,
                "custo_reais": r.custo_reais,
                "status": r.status,
                "criado_em": r.criado_em,
                "processado_em": r.processado_em,
            }
            for r in respostas
        ],
        "pagina": pagina,
        "por_pagina": por_pagina,
        "total": pesquisa.total_respostas,
    }


# ============================================
# ANÁLISE E ESTATÍSTICAS
# ============================================


@router.get("/{pesquisa_id}/estatisticas")
async def obter_estatisticas(
    pesquisa_id: str,
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """
    Calcula estatísticas agregadas de uma pesquisa PODC.

    Retorna médias, desvios padrão e comparativos por setor e nível hierárquico.
    """
    result = await db.execute(
        select(PesquisaPODC).where(PesquisaPODC.id == pesquisa_id)
    )
    pesquisa = result.scalar_one_or_none()

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa.usuario_id != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    # Buscar todas as respostas
    result = await db.execute(
        select(RespostaPODC).where(RespostaPODC.pesquisa_id == pesquisa_id)
    )
    respostas = result.scalars().all()

    if not respostas:
        return {
            "pesquisa_id": pesquisa_id,
            "total_respostas": 0,
            "mensagem": "Nenhuma resposta encontrada"
        }

    import statistics

    # Extrair valores
    planejar = [r.podc_planejar for r in respostas if r.podc_planejar is not None]
    organizar = [r.podc_organizar for r in respostas if r.podc_organizar is not None]
    dirigir = [r.podc_dirigir for r in respostas if r.podc_dirigir is not None]
    controlar = [r.podc_controlar for r in respostas if r.podc_controlar is not None]
    iads = [r.iad for r in respostas if r.iad is not None]

    def calcular_stats(valores):
        if not valores:
            return {"media": None, "dp": None, "min": None, "max": None}
        return {
            "media": round(statistics.mean(valores), 2),
            "dp": round(statistics.stdev(valores), 2) if len(valores) > 1 else 0,
            "min": round(min(valores), 2),
            "max": round(max(valores), 2),
        }

    # Estatísticas por setor
    stats_por_setor = {}
    for setor in ["publico", "privado"]:
        respostas_setor = [r for r in respostas if r.gestor_setor == setor]
        if respostas_setor:
            stats_por_setor[setor] = {
                "total": len(respostas_setor),
                "planejar": calcular_stats([r.podc_planejar for r in respostas_setor if r.podc_planejar]),
                "organizar": calcular_stats([r.podc_organizar for r in respostas_setor if r.podc_organizar]),
                "dirigir": calcular_stats([r.podc_dirigir for r in respostas_setor if r.podc_dirigir]),
                "controlar": calcular_stats([r.podc_controlar for r in respostas_setor if r.podc_controlar]),
                "iad": calcular_stats([r.iad for r in respostas_setor if r.iad]),
            }

    # Estatísticas por nível
    stats_por_nivel = {}
    for nivel in ["estrategico", "tatico", "operacional"]:
        respostas_nivel = [r for r in respostas if r.gestor_nivel == nivel]
        if respostas_nivel:
            stats_por_nivel[nivel] = {
                "total": len(respostas_nivel),
                "planejar": calcular_stats([r.podc_planejar for r in respostas_nivel if r.podc_planejar]),
                "organizar": calcular_stats([r.podc_organizar for r in respostas_nivel if r.podc_organizar]),
                "dirigir": calcular_stats([r.podc_dirigir for r in respostas_nivel if r.podc_dirigir]),
                "controlar": calcular_stats([r.podc_controlar for r in respostas_nivel if r.podc_controlar]),
                "iad": calcular_stats([r.iad for r in respostas_nivel if r.iad]),
            }

    return {
        "pesquisa_id": pesquisa_id,
        "titulo": pesquisa.titulo,
        "total_respostas": len(respostas),
        "estatisticas_gerais": {
            "planejar": calcular_stats(planejar),
            "organizar": calcular_stats(organizar),
            "dirigir": calcular_stats(dirigir),
            "controlar": calcular_stats(controlar),
            "iad": calcular_stats(iads),
        },
        "estatisticas_por_setor": stats_por_setor,
        "estatisticas_por_nivel": stats_por_nivel,
        "calculado_em": datetime.utcnow().isoformat(),
    }


@router.get("/{pesquisa_id}/exportar")
async def exportar_pesquisa(
    pesquisa_id: str,
    formato: str = Query("json", description="Formato de exportação: json, csv"),
    usuario: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """
    Exporta os dados de uma pesquisa PODC.

    Formatos disponíveis:
    - **json**: Dados completos em JSON
    - **csv**: Dados tabulares para análise
    """
    result = await db.execute(
        select(PesquisaPODC).where(PesquisaPODC.id == pesquisa_id)
    )
    pesquisa = result.scalar_one_or_none()

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa.usuario_id != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    # Buscar respostas
    result = await db.execute(
        select(RespostaPODC).where(RespostaPODC.pesquisa_id == pesquisa_id)
    )
    respostas = result.scalars().all()

    if formato == "json":
        return {
            "pesquisa": {
                "id": pesquisa.id,
                "titulo": pesquisa.titulo,
                "descricao": pesquisa.descricao,
                "status": pesquisa.status,
                "total_gestores": pesquisa.total_gestores,
                "total_respostas": pesquisa.total_respostas,
                "custo_total": pesquisa.custo_total,
                "tokens_total": pesquisa.tokens_total,
                "criado_em": pesquisa.criado_em.isoformat() if pesquisa.criado_em else None,
                "finalizado_em": pesquisa.finalizado_em.isoformat() if pesquisa.finalizado_em else None,
            },
            "respostas": [
                {
                    "gestor_id": r.gestor_id,
                    "gestor_nome": r.gestor_nome,
                    "gestor_setor": r.gestor_setor,
                    "gestor_nivel": r.gestor_nivel,
                    "gestor_cargo": r.gestor_cargo,
                    "podc_planejar": r.podc_planejar,
                    "podc_organizar": r.podc_organizar,
                    "podc_dirigir": r.podc_dirigir,
                    "podc_controlar": r.podc_controlar,
                    "iad": r.iad,
                    "iad_classificacao": r.iad_classificacao,
                }
                for r in respostas
            ],
            "exportado_em": datetime.utcnow().isoformat(),
        }

    elif formato == "csv":
        # Gerar CSV como string
        linhas = ["gestor_id,gestor_nome,setor,nivel,cargo,planejar,organizar,dirigir,controlar,iad,iad_classificacao"]

        for r in respostas:
            linha = f"{r.gestor_id},{r.gestor_nome},{r.gestor_setor},{r.gestor_nivel},{r.gestor_cargo or ''},{r.podc_planejar},{r.podc_organizar},{r.podc_dirigir},{r.podc_controlar},{r.iad},{r.iad_classificacao}"
            linhas.append(linha)

        return {
            "formato": "csv",
            "conteudo": "\n".join(linhas),
            "exportado_em": datetime.utcnow().isoformat(),
        }

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato '{formato}' não suportado. Use 'json' ou 'csv'."
        )
