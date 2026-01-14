"""
Rotas de Resultados

API REST para análise de resultados de entrevistas.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from typing import Optional

from app.api.deps import obter_usuario_atual, DadosToken
from app.servicos.resultado_servico import obter_resultado_servico, ResultadoServico


router = APIRouter()


def get_servico() -> ResultadoServico:
    """Dependência para obter o serviço"""
    return obter_resultado_servico()


# ============================================
# LISTAGEM E CONSULTA
# ============================================


@router.get("/")
async def listar_resultados(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    entrevista_id: Optional[str] = Query(None),
    servico: ResultadoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Lista resultados de análises.

    - **entrevista_id**: Filtrar por entrevista específica
    """
    return servico.listar(
        pagina=pagina,
        por_pagina=por_pagina,
        entrevista_id=entrevista_id
    )


@router.get("/{resultado_id}")
async def obter_resultado(
    resultado_id: str,
    servico: ResultadoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém detalhes de uma análise.
    """
    resultado = servico.obter_por_id(resultado_id)
    if not resultado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resultado {resultado_id} não encontrado"
        )
    return resultado


# ============================================
# ANÁLISE
# ============================================


@router.post("/analisar/{entrevista_id}")
async def analisar_entrevista(
    entrevista_id: str,
    background_tasks: BackgroundTasks,
    servico: ResultadoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Executa análise completa de uma entrevista.

    Gera estatísticas, correlações, mapas de calor emocional,
    caixas especiais (voto silencioso, pontos de ruptura) e insights.
    """
    try:
        resultado = servico.analisar_entrevista(entrevista_id)
        return {
            "mensagem": "Análise concluída",
            "resultado_id": resultado["id"],
            "resumo": {
                "total_respostas": resultado["total_respostas"],
                "total_eleitores": resultado["total_eleitores"],
                "sentimento_geral": resultado["sentimento_geral"],
                "total_insights": len(resultado.get("insights", [])),
                "votos_silenciosos": len(resultado.get("votos_silenciosos", [])),
                "pontos_ruptura": len(resultado.get("pontos_ruptura", []))
            }
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao analisar: {str(e)}"
        )


# ============================================
# COMPONENTES ESPECÍFICOS
# ============================================


@router.get("/{resultado_id}/estatisticas")
async def obter_estatisticas(
    resultado_id: str,
    servico: ResultadoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém estatísticas descritivas de um resultado.
    """
    resultado = servico.obter_por_id(resultado_id)
    if not resultado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resultado {resultado_id} não encontrado"
        )

    return {
        "resultado_id": resultado_id,
        "estatisticas": resultado.get("estatisticas"),
        "distribuicoes": resultado.get("distribuicoes"),
        "correlacoes": resultado.get("correlacoes")
    }


@router.get("/{resultado_id}/sentimentos")
async def obter_analise_sentimentos(
    resultado_id: str,
    servico: ResultadoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém análise de sentimentos de um resultado.
    """
    resultado = servico.obter_por_id(resultado_id)
    if not resultado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resultado {resultado_id} não encontrado"
        )

    return {
        "resultado_id": resultado_id,
        "sentimento_geral": resultado.get("sentimento_geral"),
        "proporcao_sentimentos": resultado.get("proporcao_sentimentos"),
        "palavras_frequentes": resultado.get("palavras_frequentes"),
        "temas_principais": resultado.get("temas_principais"),
        "citacoes_representativas": resultado.get("citacoes_representativas")
    }


@router.get("/{resultado_id}/mapa-calor")
async def obter_mapa_calor(
    resultado_id: str,
    servico: ResultadoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém mapa de calor emocional.
    """
    resultado = servico.obter_por_id(resultado_id)
    if not resultado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resultado {resultado_id} não encontrado"
        )

    return resultado.get("mapa_calor_emocional")


@router.get("/{resultado_id}/votos-silenciosos")
async def obter_votos_silenciosos(
    resultado_id: str,
    servico: ResultadoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém análise de votos silenciosos.

    Identifica eleitores que concordam com política econômica
    mas rejeitam pautas de costumes - potencial "voto envergonhado".
    """
    resultado = servico.obter_por_id(resultado_id)
    if not resultado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resultado {resultado_id} não encontrado"
        )

    votos = resultado.get("votos_silenciosos", [])
    return {
        "resultado_id": resultado_id,
        "total": len(votos),
        "percentual_amostra": round(len(votos) / resultado.get("total_eleitores", 1) * 100, 1),
        "votos_silenciosos": votos
    }


@router.get("/{resultado_id}/pontos-ruptura")
async def obter_pontos_ruptura(
    resultado_id: str,
    servico: ResultadoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém análise de pontos de ruptura.

    Identifica o que faria cada perfil mudar de lado político.
    """
    resultado = servico.obter_por_id(resultado_id)
    if not resultado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resultado {resultado_id} não encontrado"
        )

    pontos = resultado.get("pontos_ruptura", [])
    return {
        "resultado_id": resultado_id,
        "total": len(pontos),
        "pontos_ruptura": pontos
    }


@router.get("/{resultado_id}/insights")
async def obter_insights(
    resultado_id: str,
    servico: ResultadoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Obtém insights automáticos gerados pela análise.
    """
    resultado = servico.obter_por_id(resultado_id)
    if not resultado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resultado {resultado_id} não encontrado"
        )

    return {
        "resultado_id": resultado_id,
        "insights": resultado.get("insights", []),
        "conclusoes": resultado.get("conclusoes", []),
        "implicacoes_politicas": resultado.get("implicacoes_politicas", [])
    }


# ============================================
# DELEÇÃO
# ============================================


@router.delete("/{resultado_id}")
async def deletar_resultado(
    resultado_id: str,
    servico: ResultadoServico = Depends(get_servico),
    _: DadosToken = Depends(obter_usuario_atual),
):
    """
    Remove uma análise de resultado.
    """
    if not servico.deletar(resultado_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resultado {resultado_id} não encontrado"
        )
    return {"mensagem": f"Resultado {resultado_id} removido com sucesso"}
