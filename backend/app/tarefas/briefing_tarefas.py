"""
Tarefa periodica Celery para geracao de briefing diario.

Executa diariamente as 6h da manha (horario de Brasilia), coletando
um resumo das atividades do dia anterior e tendencias da pesquisa
eleitoral, e envia para a equipe de gestao via WhatsApp.
"""

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import configuracoes
from app.tarefas.celery_app import celery_app

logger = logging.getLogger(__name__)

# Cria engine sincrona para uso no worker Celery
_url_banco_sincrona = str(configuracoes.DATABASE_URL).replace(
    "postgresql://", "postgresql+psycopg://"
)
_engine_sincrono = create_engine(
    _url_banco_sincrona,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)
SessaoSincrona = sessionmaker(bind=_engine_sincrono, expire_on_commit=False)


def _obter_sessao_banco():
    """Cria e retorna uma sessao sincrona do banco de dados."""
    return SessaoSincrona()


@celery_app.task(
    name="app.tarefas.briefing_tarefas.gerar_briefing_diario",
    bind=True,
    max_retries=2,
    default_retry_delay=120,
)
def gerar_briefing_diario(self) -> dict:
    """
    Gera e envia o briefing diario da pesquisa eleitoral.

    Coleta metricas das ultimas 24 horas, identifica destaques e
    envia um resumo compacto para a equipe de gestao via WhatsApp.

    Returns:
        Dicionario com status da geracao e envio do briefing.

    Raises:
        Reenfileira a tarefa em caso de falha (ate 2 tentativas).
    """
    logger.info("Iniciando geracao do briefing diario - 6h da manha")

    sessao = _obter_sessao_banco()
    try:
        agora = datetime.now(timezone.utc)
        inicio_periodo = agora - timedelta(hours=24)

        # Coleta metricas das ultimas 24 horas
        metricas = _coletar_metricas_diarias(sessao, inicio_periodo, agora)

        # Coleta destaques e alertas
        destaques = _coletar_destaques(sessao, inicio_periodo, agora)

        # Formata o briefing
        texto_briefing = _formatar_briefing(metricas, destaques, agora)

        # Envia para a equipe de gestao
        destinatarios = _obter_destinatarios_briefing(sessao)
        _enviar_briefing(texto_briefing, destinatarios)

        logger.info(
            "Briefing diario gerado e enviado | destinatarios=%d",
            len(destinatarios),
        )

        return {
            "status": "sucesso",
            "metricas": metricas,
            "destaques": destaques,
            "destinatarios_enviados": len(destinatarios),
            "gerado_em": agora.isoformat(),
        }

    except Exception as exc:
        sessao.rollback()
        logger.error(
            "Erro ao gerar briefing diario: %s",
            str(exc),
            exc_info=True,
        )
        raise self.retry(exc=exc, countdown=120 * (2 ** self.request.retries))

    finally:
        sessao.close()


def _coletar_metricas_diarias(
    sessao, inicio: datetime, fim: datetime
) -> dict:
    """
    Coleta metricas de interacoes das ultimas 24 horas.

    Args:
        sessao: Sessao do banco de dados.
        inicio: Data/hora de inicio do periodo (24h atras).
        fim: Data/hora de fim do periodo (agora).

    Returns:
        Dicionario com as metricas do dia.
    """
    # Total de mensagens recebidas
    resultado_msgs = sessao.execute(
        text(
            """
            SELECT COUNT(*) as total
            FROM mensagens
            WHERE direcao = 'entrada'
              AND criado_em BETWEEN :inicio AND :fim
            """
        ),
        {"inicio": inicio, "fim": fim},
    )
    total_mensagens = resultado_msgs.scalar() or 0

    # Conversas ativas no periodo
    resultado_conversas = sessao.execute(
        text(
            """
            SELECT COUNT(DISTINCT conversa_id) as total
            FROM mensagens
            WHERE criado_em BETWEEN :inicio AND :fim
            """
        ),
        {"inicio": inicio, "fim": fim},
    )
    conversas_ativas = resultado_conversas.scalar() or 0

    # Respostas de pesquisa coletadas
    resultado_respostas = sessao.execute(
        text(
            """
            SELECT COUNT(*) as total
            FROM respostas_pesquisa
            WHERE criado_em BETWEEN :inicio AND :fim
            """
        ),
        {"inicio": inicio, "fim": fim},
    )
    respostas_pesquisa = resultado_respostas.scalar() or 0

    # Novos contatos no periodo
    resultado_novos = sessao.execute(
        text(
            """
            SELECT COUNT(*) as total
            FROM contatos
            WHERE criado_em BETWEEN :inicio AND :fim
            """
        ),
        {"inicio": inicio, "fim": fim},
    )
    novos_contatos = resultado_novos.scalar() or 0

    # Mensagens por hora (distribuicao ao longo do dia)
    resultado_por_hora = sessao.execute(
        text(
            """
            SELECT
                EXTRACT(HOUR FROM criado_em AT TIME ZONE 'America/Sao_Paulo') as hora,
                COUNT(*) as total
            FROM mensagens
            WHERE direcao = 'entrada'
              AND criado_em BETWEEN :inicio AND :fim
            GROUP BY hora
            ORDER BY total DESC
            LIMIT 3
            """
        ),
        {"inicio": inicio, "fim": fim},
    )
    horarios_pico = [
        {"hora": int(row[0]), "total": row[1]}
        for row in resultado_por_hora.fetchall()
    ]

    metricas = {
        "total_mensagens": total_mensagens,
        "conversas_ativas": conversas_ativas,
        "respostas_pesquisa": respostas_pesquisa,
        "novos_contatos": novos_contatos,
        "horarios_pico": horarios_pico,
    }

    logger.info("Metricas diarias coletadas: %s", metricas)
    return metricas


def _coletar_destaques(sessao, inicio: datetime, fim: datetime) -> list[str]:
    """
    Identifica destaques e alertas relevantes do periodo.

    Args:
        sessao: Sessao do banco de dados.
        inicio: Data/hora de inicio do periodo.
        fim: Data/hora de fim do periodo.

    Returns:
        Lista de strings com os destaques identificados.
    """
    destaques = []

    # Verifica se houve queda significativa de mensagens em relacao ao dia anterior
    resultado_dia_anterior = sessao.execute(
        text(
            """
            SELECT COUNT(*) as total
            FROM mensagens
            WHERE direcao = 'entrada'
              AND criado_em BETWEEN :inicio_anterior AND :fim_anterior
            """
        ),
        {
            "inicio_anterior": inicio - timedelta(hours=24),
            "fim_anterior": inicio,
        },
    )
    total_dia_anterior = resultado_dia_anterior.scalar() or 0

    resultado_dia_atual = sessao.execute(
        text(
            """
            SELECT COUNT(*) as total
            FROM mensagens
            WHERE direcao = 'entrada'
              AND criado_em BETWEEN :inicio AND :fim
            """
        ),
        {"inicio": inicio, "fim": fim},
    )
    total_dia_atual = resultado_dia_atual.scalar() or 0

    if total_dia_anterior > 0:
        variacao = (
            (total_dia_atual - total_dia_anterior) / total_dia_anterior
        ) * 100
        if variacao > 20:
            destaques.append(
                f"Aumento de {variacao:.0f}% nas mensagens em relacao ao dia anterior"
            )
        elif variacao < -20:
            destaques.append(
                f"Queda de {abs(variacao):.0f}% nas mensagens em relacao ao dia anterior"
            )

    # Verifica erros de processamento no periodo
    resultado_erros = sessao.execute(
        text(
            """
            SELECT COUNT(*) as total
            FROM log_erros
            WHERE criado_em BETWEEN :inicio AND :fim
            """
        ),
        {"inicio": inicio, "fim": fim},
    )
    total_erros = resultado_erros.scalar() or 0
    if total_erros > 0:
        destaques.append(
            f"{total_erros} erro(s) de processamento registrado(s)"
        )

    if not destaques:
        destaques.append("Operacoes dentro da normalidade")

    return destaques


def _formatar_briefing(
    metricas: dict, destaques: list[str], data: datetime
) -> str:
    """
    Formata o briefing diario em texto legivel para WhatsApp.

    Args:
        metricas: Dicionario com as metricas do dia.
        destaques: Lista de destaques e alertas.
        data: Data/hora da geracao do briefing.

    Returns:
        Texto formatado do briefing.
    """
    data_formatada = data.strftime("%d/%m/%Y")

    # Formata horarios de pico
    texto_pico = ""
    if metricas.get("horarios_pico"):
        picos = [
            f"{h['hora']}h ({h['total']} msgs)"
            for h in metricas["horarios_pico"]
        ]
        texto_pico = f"  Horarios de pico: {', '.join(picos)}\n"

    # Formata destaques
    texto_destaques = "\n".join(f"  - {d}" for d in destaques)

    briefing = (
        f"*BRIEFING DIARIO - {data_formatada}*\n"
        f"Pesquisa Eleitoral DF\n"
        f"{'=' * 30}\n\n"
        f"*Resumo das ultimas 24h:*\n"
        f"  Mensagens recebidas: {metricas['total_mensagens']}\n"
        f"  Conversas ativas: {metricas['conversas_ativas']}\n"
        f"  Respostas de pesquisa: {metricas['respostas_pesquisa']}\n"
        f"  Novos contatos: {metricas['novos_contatos']}\n"
        f"{texto_pico}\n"
        f"*Destaques:*\n"
        f"{texto_destaques}\n\n"
        f"{'=' * 30}\n"
        f"Briefing automatico - 6h"
    )

    return briefing


def _obter_destinatarios_briefing(sessao) -> list[str]:
    """
    Obtem a lista de destinatarios do briefing diario.

    Args:
        sessao: Sessao do banco de dados.

    Returns:
        Lista de numeros de telefone dos gestores que recebem briefing.
    """
    resultado = sessao.execute(
        text(
            """
            SELECT telefone
            FROM usuarios
            WHERE receber_briefing = true
              AND ativo = true
            """
        )
    )
    destinatarios = [row[0] for row in resultado.fetchall()]

    if not destinatarios:
        logger.warning(
            "Nenhum destinatario configurado para receber briefing diario"
        )

    return destinatarios


def _enviar_briefing(texto_briefing: str, destinatarios: list[str]) -> None:
    """
    Envia o briefing para todos os destinatarios via WhatsApp.

    Args:
        texto_briefing: Texto do briefing formatado.
        destinatarios: Lista de numeros de telefone.
    """
    from app.servicos.whatsapp_servico import whatsapp_servico

    for telefone in destinatarios:
        try:
            whatsapp_servico.enviar_mensagem(
                telefone=telefone, mensagem=texto_briefing
            )
            logger.info("Briefing enviado para %s", telefone)
        except Exception as exc:
            logger.error(
                "Falha ao enviar briefing para %s: %s",
                telefone,
                str(exc),
                exc_info=True,
            )
