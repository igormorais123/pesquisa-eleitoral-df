"""
Rotas de API para Pesquisa PODC

Endpoints para criar, executar e analisar pesquisas sobre
distribuição de tempo nas funções administrativas de gestores.
"""

from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import DadosToken, obter_usuario_atual
from app.esquemas.pesquisa_podc import (
    AnaliseCompletaPODC,
    AtualizarPesquisaPODC,
    CriarPesquisaPODC,
    CriarRespostaPODC,
    EstatisticasPODCResponse,
    PesquisaPODCResponse,
    RespostaPODCResponse,
)

router = APIRouter()

# Armazenamento temporário em memória (será migrado para banco de dados)
_pesquisas_podc: dict = {}
_respostas_podc: dict = {}


# ============================================
# CRUD DE PESQUISAS
# ============================================


@router.post("/", response_model=PesquisaPODCResponse, status_code=status.HTTP_201_CREATED)
async def criar_pesquisa(
    dados: CriarPesquisaPODC,
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Cria uma nova pesquisa PODC.

    A pesquisa é criada com status 'pendente' e pode ser iniciada posteriormente.
    """
    pesquisa_id = str(uuid4())
    agora = datetime.utcnow()

    pesquisa = {
        "id": pesquisa_id,
        "usuario_id": usuario.usuario_id,
        "titulo": dados.titulo,
        "descricao": dados.descricao,
        "status": "pendente",
        "total_gestores": len(dados.gestores_ids),
        "total_respostas": 0,
        "perguntas": [p.model_dump() for p in dados.perguntas],
        "gestores_ids": dados.gestores_ids,
        "custo_total": 0.0,
        "tokens_total": 0,
        "criado_em": agora,
        "atualizado_em": agora,
        "iniciado_em": None,
        "finalizado_em": None,
    }

    _pesquisas_podc[pesquisa_id] = pesquisa
    return pesquisa


@router.get("/", response_model=List[PesquisaPODCResponse])
async def listar_pesquisas(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    status_filtro: Optional[str] = Query(None, alias="status"),
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Lista pesquisas PODC do usuário.

    Parâmetros:
    - **pagina**: Página atual (default: 1)
    - **por_pagina**: Itens por página (default: 20)
    - **status**: Filtrar por status (pendente, em_andamento, concluida)
    """
    pesquisas = [
        p for p in _pesquisas_podc.values()
        if p["usuario_id"] == usuario.usuario_id
    ]

    if status_filtro:
        pesquisas = [p for p in pesquisas if p["status"] == status_filtro]

    # Ordenar por data de criação (mais recente primeiro)
    pesquisas.sort(key=lambda x: x["criado_em"], reverse=True)

    # Paginação
    inicio = (pagina - 1) * por_pagina
    fim = inicio + por_pagina

    return pesquisas[inicio:fim]


@router.get("/{pesquisa_id}", response_model=PesquisaPODCResponse)
async def obter_pesquisa(
    pesquisa_id: str,
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém detalhes de uma pesquisa PODC.
    """
    pesquisa = _pesquisas_podc.get(pesquisa_id)

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa["usuario_id"] != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    return pesquisa


@router.patch("/{pesquisa_id}", response_model=PesquisaPODCResponse)
async def atualizar_pesquisa(
    pesquisa_id: str,
    dados: AtualizarPesquisaPODC,
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Atualiza uma pesquisa PODC.
    """
    pesquisa = _pesquisas_podc.get(pesquisa_id)

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa["usuario_id"] != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    # Atualizar campos fornecidos
    if dados.titulo is not None:
        pesquisa["titulo"] = dados.titulo
    if dados.descricao is not None:
        pesquisa["descricao"] = dados.descricao
    if dados.status is not None:
        pesquisa["status"] = dados.status

    pesquisa["atualizado_em"] = datetime.utcnow()

    return pesquisa


@router.delete("/{pesquisa_id}")
async def deletar_pesquisa(
    pesquisa_id: str,
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Remove uma pesquisa PODC e todas as suas respostas.
    """
    pesquisa = _pesquisas_podc.get(pesquisa_id)

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa["usuario_id"] != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    # Remover respostas associadas
    respostas_para_remover = [
        rid for rid, r in _respostas_podc.items()
        if r["pesquisa_id"] == pesquisa_id
    ]
    for rid in respostas_para_remover:
        del _respostas_podc[rid]

    # Remover pesquisa
    del _pesquisas_podc[pesquisa_id]

    return {"mensagem": f"Pesquisa {pesquisa_id} removida com sucesso"}


# ============================================
# CONTROLE DE EXECUÇÃO
# ============================================


@router.post("/{pesquisa_id}/iniciar")
async def iniciar_pesquisa(
    pesquisa_id: str,
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Inicia a execução de uma pesquisa PODC.
    """
    pesquisa = _pesquisas_podc.get(pesquisa_id)

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa["usuario_id"] != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    if pesquisa["status"] not in ["pendente", "pausada"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pesquisa não pode ser iniciada no status '{pesquisa['status']}'"
        )

    pesquisa["status"] = "em_andamento"
    pesquisa["iniciado_em"] = datetime.utcnow()
    pesquisa["atualizado_em"] = datetime.utcnow()

    return {
        "mensagem": "Pesquisa iniciada com sucesso",
        "pesquisa_id": pesquisa_id,
        "status": pesquisa["status"]
    }


@router.post("/{pesquisa_id}/pausar")
async def pausar_pesquisa(
    pesquisa_id: str,
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Pausa a execução de uma pesquisa PODC.
    """
    pesquisa = _pesquisas_podc.get(pesquisa_id)

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa["usuario_id"] != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    if pesquisa["status"] != "em_andamento":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pesquisa não pode ser pausada no status '{pesquisa['status']}'"
        )

    pesquisa["status"] = "pausada"
    pesquisa["atualizado_em"] = datetime.utcnow()

    return {
        "mensagem": "Pesquisa pausada com sucesso",
        "pesquisa_id": pesquisa_id,
        "status": pesquisa["status"]
    }


@router.post("/{pesquisa_id}/finalizar")
async def finalizar_pesquisa(
    pesquisa_id: str,
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Finaliza uma pesquisa PODC.
    """
    pesquisa = _pesquisas_podc.get(pesquisa_id)

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa["usuario_id"] != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    pesquisa["status"] = "concluida"
    pesquisa["finalizado_em"] = datetime.utcnow()
    pesquisa["atualizado_em"] = datetime.utcnow()

    return {
        "mensagem": "Pesquisa finalizada com sucesso",
        "pesquisa_id": pesquisa_id,
        "status": pesquisa["status"],
        "total_respostas": pesquisa["total_respostas"]
    }


# ============================================
# RESPOSTAS
# ============================================


@router.post("/{pesquisa_id}/respostas", response_model=RespostaPODCResponse, status_code=status.HTTP_201_CREATED)
async def criar_resposta(
    pesquisa_id: str,
    dados: CriarRespostaPODC,
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Adiciona uma resposta de gestor à pesquisa PODC.

    Esta rota é chamada pelo frontend quando uma resposta é processada pelo Claude.
    Os dados estruturados são extraídos da resposta do Claude e salvos para análise.
    """
    pesquisa = _pesquisas_podc.get(pesquisa_id)

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa["usuario_id"] != usuario.usuario_id:
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

    resposta = {
        "id": resposta_id,
        "pesquisa_id": pesquisa_id,
        "gestor_id": dados.gestor.id,
        "gestor_nome": dados.gestor.nome,
        "gestor_setor": dados.gestor.setor,
        "gestor_nivel": dados.gestor.nivel,
        "gestor_cargo": dados.gestor.cargo,
        "gestor_instituicao": dados.gestor.instituicao,
        "podc_planejar": podc.planejar,
        "podc_organizar": podc.organizar,
        "podc_dirigir": podc.dirigir,
        "podc_controlar": podc.controlar,
        "podc_ideal_planejar": dados.distribuicao_ideal.planejar if dados.distribuicao_ideal else None,
        "podc_ideal_organizar": dados.distribuicao_ideal.organizar if dados.distribuicao_ideal else None,
        "podc_ideal_dirigir": dados.distribuicao_ideal.dirigir if dados.distribuicao_ideal else None,
        "podc_ideal_controlar": dados.distribuicao_ideal.controlar if dados.distribuicao_ideal else None,
        "horas_total": dados.horas_semanais.total if dados.horas_semanais else None,
        "horas_planejar": dados.horas_semanais.planejar if dados.horas_semanais else None,
        "horas_organizar": dados.horas_semanais.organizar if dados.horas_semanais else None,
        "horas_dirigir": dados.horas_semanais.dirigir if dados.horas_semanais else None,
        "horas_controlar": dados.horas_semanais.controlar if dados.horas_semanais else None,
        "iad": iad,
        "iad_classificacao": iad_classificacao,
        "ranking_importancia": dados.ranking_importancia,
        "fatores_limitantes": dados.fatores_limitantes,
        "justificativa": dados.justificativa,
        "frequencia_atividades": dados.frequencia_atividades.model_dump() if dados.frequencia_atividades else None,
        "respostas_perguntas": [r.model_dump() for r in dados.respostas_perguntas] if dados.respostas_perguntas else None,
        "resposta_bruta": dados.resposta_bruta,
        "tokens_input": dados.tokens_input,
        "tokens_output": dados.tokens_output,
        "custo_reais": dados.custo_reais,
        "status": "concluida",
        "erro": None,
        "criado_em": agora,
        "processado_em": agora,
    }

    _respostas_podc[resposta_id] = resposta

    # Atualizar contadores da pesquisa
    pesquisa["total_respostas"] += 1
    pesquisa["custo_total"] += dados.custo_reais
    pesquisa["tokens_total"] += dados.tokens_input + dados.tokens_output
    pesquisa["atualizado_em"] = agora

    return resposta


@router.get("/{pesquisa_id}/respostas", response_model=List[RespostaPODCResponse])
async def listar_respostas(
    pesquisa_id: str,
    setor: Optional[str] = None,
    nivel: Optional[str] = None,
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(50, ge=1, le=100),
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Lista respostas de uma pesquisa PODC.

    Parâmetros:
    - **setor**: Filtrar por setor (publico, privado)
    - **nivel**: Filtrar por nível (estrategico, tatico, operacional)
    """
    pesquisa = _pesquisas_podc.get(pesquisa_id)

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa["usuario_id"] != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    respostas = [
        r for r in _respostas_podc.values()
        if r["pesquisa_id"] == pesquisa_id
    ]

    if setor:
        respostas = [r for r in respostas if r["gestor_setor"] == setor]

    if nivel:
        respostas = [r for r in respostas if r["gestor_nivel"] == nivel]

    # Ordenar por data de criação
    respostas.sort(key=lambda x: x["criado_em"])

    # Paginação
    inicio = (pagina - 1) * por_pagina
    fim = inicio + por_pagina

    return respostas[inicio:fim]


# ============================================
# ANÁLISE E ESTATÍSTICAS
# ============================================


@router.get("/{pesquisa_id}/estatisticas")
async def obter_estatisticas(
    pesquisa_id: str,
    usuario: DadosToken = Depends(obter_usuario_atual),
):
    """
    Calcula estatísticas agregadas de uma pesquisa PODC.

    Retorna médias, desvios padrão e comparativos por setor e nível hierárquico.
    """
    pesquisa = _pesquisas_podc.get(pesquisa_id)

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa["usuario_id"] != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    respostas = [
        r for r in _respostas_podc.values()
        if r["pesquisa_id"] == pesquisa_id
    ]

    if not respostas:
        return {
            "pesquisa_id": pesquisa_id,
            "total_respostas": 0,
            "mensagem": "Nenhuma resposta encontrada"
        }

    import statistics

    # Estatísticas gerais
    planejar = [r["podc_planejar"] for r in respostas if r["podc_planejar"] is not None]
    organizar = [r["podc_organizar"] for r in respostas if r["podc_organizar"] is not None]
    dirigir = [r["podc_dirigir"] for r in respostas if r["podc_dirigir"] is not None]
    controlar = [r["podc_controlar"] for r in respostas if r["podc_controlar"] is not None]
    iads = [r["iad"] for r in respostas if r["iad"] is not None]

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
        respostas_setor = [r for r in respostas if r["gestor_setor"] == setor]
        if respostas_setor:
            stats_por_setor[setor] = {
                "total": len(respostas_setor),
                "planejar": calcular_stats([r["podc_planejar"] for r in respostas_setor if r["podc_planejar"]]),
                "organizar": calcular_stats([r["podc_organizar"] for r in respostas_setor if r["podc_organizar"]]),
                "dirigir": calcular_stats([r["podc_dirigir"] for r in respostas_setor if r["podc_dirigir"]]),
                "controlar": calcular_stats([r["podc_controlar"] for r in respostas_setor if r["podc_controlar"]]),
                "iad": calcular_stats([r["iad"] for r in respostas_setor if r["iad"]]),
            }

    # Estatísticas por nível
    stats_por_nivel = {}
    for nivel in ["estrategico", "tatico", "operacional"]:
        respostas_nivel = [r for r in respostas if r["gestor_nivel"] == nivel]
        if respostas_nivel:
            stats_por_nivel[nivel] = {
                "total": len(respostas_nivel),
                "planejar": calcular_stats([r["podc_planejar"] for r in respostas_nivel if r["podc_planejar"]]),
                "organizar": calcular_stats([r["podc_organizar"] for r in respostas_nivel if r["podc_organizar"]]),
                "dirigir": calcular_stats([r["podc_dirigir"] for r in respostas_nivel if r["podc_dirigir"]]),
                "controlar": calcular_stats([r["podc_controlar"] for r in respostas_nivel if r["podc_controlar"]]),
                "iad": calcular_stats([r["iad"] for r in respostas_nivel if r["iad"]]),
            }

    return {
        "pesquisa_id": pesquisa_id,
        "titulo": pesquisa["titulo"],
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
):
    """
    Exporta os dados de uma pesquisa PODC.

    Formatos disponíveis:
    - **json**: Dados completos em JSON
    - **csv**: Dados tabulares para análise
    """
    pesquisa = _pesquisas_podc.get(pesquisa_id)

    if not pesquisa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pesquisa {pesquisa_id} não encontrada"
        )

    if pesquisa["usuario_id"] != usuario.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta pesquisa"
        )

    respostas = [
        r for r in _respostas_podc.values()
        if r["pesquisa_id"] == pesquisa_id
    ]

    if formato == "json":
        return {
            "pesquisa": pesquisa,
            "respostas": respostas,
            "exportado_em": datetime.utcnow().isoformat(),
        }

    elif formato == "csv":
        # Gerar CSV como string
        linhas = ["gestor_id,gestor_nome,setor,nivel,cargo,planejar,organizar,dirigir,controlar,iad,iad_classificacao"]

        for r in respostas:
            linha = f"{r['gestor_id']},{r['gestor_nome']},{r['gestor_setor']},{r['gestor_nivel']},{r.get('gestor_cargo', '')},{r['podc_planejar']},{r['podc_organizar']},{r['podc_dirigir']},{r['podc_controlar']},{r['iad']},{r['iad_classificacao']}"
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
