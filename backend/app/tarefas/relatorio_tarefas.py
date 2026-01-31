"""
Tarefas Celery para geracao e envio de relatorios semanais.

Gera relatorios consolidados da pesquisa eleitoral com metricas
de interacoes, respostas coletadas e tendencias, e envia para
os destinatarios configurados via WhatsApp.
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
    name="app.tarefas.relatorio_tarefas.gerar_relatorio_semanal",
    bind=True,
    max_retries=2,
    default_retry_delay=300,
)
def gerar_relatorio_semanal(self) -> dict:
    """
    Gera e envia o relatorio semanal da pesquisa eleitoral.

    Coleta metricas da ultima semana, formata o relatorio e envia
    para os destinatarios configurados.

    Returns:
        Dicionario com status da geracao e envio do relatorio.

    Raises:
        Reenfileira a tarefa em caso de falha (ate 2 tentativas).
    """
    logger.info("Iniciando geracao do relatorio semanal")

    sessao = _obter_sessao_banco()
    try:
        agora = datetime.now(timezone.utc)
        inicio_semana = agora - timedelta(days=7)

        # Coleta metricas da semana
        metricas = _coletar_metricas_semana(sessao, inicio_semana, agora)

        # Formata o relatorio
        texto_relatorio = _formatar_relatorio(metricas, inicio_semana, agora)

        # Envia para os destinatarios
        destinatarios = _obter_destinatarios_relatorio(sessao)
        _enviar_relatorio(texto_relatorio, destinatarios)

        logger.info(
            "Relatorio semanal gerado e enviado com sucesso | destinatarios=%d",
            len(destinatarios),
        )

        return {
            "status": "sucesso",
            "metricas": metricas,
            "destinatarios_enviados": len(destinatarios),
            "gerado_em": agora.isoformat(),
        }

    except Exception as exc:
        sessao.rollback()
        logger.error(
            "Erro ao gerar relatorio semanal: %s",
            str(exc),
            exc_info=True,
        )
        raise self.retry(exc=exc, countdown=300 * (2 ** self.request.retries))

    finally:
        sessao.close()


def _coletar_metricas_semana(sessao, inicio: datetime, fim: datetime) -> dict:
    """
    Coleta as metricas de interacoes da semana a partir do banco de dados.

    Args:
        sessao: Sessao do banco de dados.
        inicio: Data/hora de inicio do periodo.
        fim: Data/hora de fim do periodo.

    Returns:
        Dicionario com as metricas coletadas.
    """
    # Total de mensagens recebidas no periodo
    resultado_msgs = sessao.execute(
        text(
            """
            SELECT COUNT(*) as total_mensagens
            FROM mensagens
            WHERE direcao = 'entrada'
              AND criado_em BETWEEN :inicio AND :fim
            """
        ),
        {"inicio": inicio, "fim": fim},
    )
    total_mensagens = resultado_msgs.scalar() or 0

    # Total de conversas ativas no periodo
    resultado_conversas = sessao.execute(
        text(
            """
            SELECT COUNT(DISTINCT conversa_id) as conversas_ativas
            FROM mensagens
            WHERE criado_em BETWEEN :inicio AND :fim
            """
        ),
        {"inicio": inicio, "fim": fim},
    )
    conversas_ativas = resultado_conversas.scalar() or 0

    # Total de contatos unicos que interagiram
    resultado_contatos = sessao.execute(
        text(
            """
            SELECT COUNT(DISTINCT contato_id) as contatos_unicos
            FROM mensagens
            WHERE criado_em BETWEEN :inicio AND :fim
            """
        ),
        {"inicio": inicio, "fim": fim},
    )
    contatos_unicos = resultado_contatos.scalar() or 0

    # Total de respostas de pesquisa coletadas
    resultado_respostas = sessao.execute(
        text(
            """
            SELECT COUNT(*) as respostas_pesquisa
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
            SELECT COUNT(*) as novos_contatos
            FROM contatos
            WHERE criado_em BETWEEN :inicio AND :fim
            """
        ),
        {"inicio": inicio, "fim": fim},
    )
    novos_contatos = resultado_novos.scalar() or 0

    metricas = {
        "total_mensagens": total_mensagens,
        "conversas_ativas": conversas_ativas,
        "contatos_unicos": contatos_unicos,
        "respostas_pesquisa": respostas_pesquisa,
        "novos_contatos": novos_contatos,
    }

    logger.info("Metricas coletadas para o periodo: %s", metricas)
    return metricas


def _formatar_relatorio(
    metricas: dict, inicio: datetime, fim: datetime
) -> str:
    """
    Formata as metricas em um texto legivel para envio via WhatsApp.

    Args:
        metricas: Dicionario com as metricas coletadas.
        inicio: Data de inicio do periodo.
        fim: Data de fim do periodo.

    Returns:
        Texto formatado do relatorio.
    """
    data_inicio = inicio.strftime("%d/%m/%Y")
    data_fim = fim.strftime("%d/%m/%Y")

    relatorio = (
        f"*RELATORIO SEMANAL - PESQUISA ELEITORAL DF*\n"
        f"Periodo: {data_inicio} a {data_fim}\n"
        f"{'=' * 35}\n\n"
        f"*Interacoes:*\n"
        f"  Total de mensagens recebidas: {metricas['total_mensagens']}\n"
        f"  Conversas ativas: {metricas['conversas_ativas']}\n"
        f"  Contatos unicos: {metricas['contatos_unicos']}\n\n"
        f"*Pesquisa:*\n"
        f"  Respostas coletadas: {metricas['respostas_pesquisa']}\n"
        f"  Novos contatos: {metricas['novos_contatos']}\n\n"
        f"{'=' * 35}\n"
        f"Relatorio gerado automaticamente."
    )

    return relatorio


def _obter_destinatarios_relatorio(sessao) -> list[str]:
    """
    Obtem a lista de numeros de telefone dos destinatarios do relatorio.

    Args:
        sessao: Sessao do banco de dados.

    Returns:
        Lista de numeros de telefone dos administradores/destinatarios.
    """
    resultado = sessao.execute(
        text(
            """
            SELECT telefone
            FROM usuarios
            WHERE receber_relatorio = true
              AND ativo = true
            """
        )
    )
    destinatarios = [row[0] for row in resultado.fetchall()]

    if not destinatarios:
        logger.warning(
            "Nenhum destinatario configurado para receber relatorio semanal"
        )

    return destinatarios


def _enviar_relatorio(texto_relatorio: str, destinatarios: list[str]) -> None:
    """
    Envia o relatorio formatado para todos os destinatarios via WhatsApp.

    Args:
        texto_relatorio: Texto do relatorio a ser enviado.
        destinatarios: Lista de numeros de telefone dos destinatarios.
    """
    from app.servicos.whatsapp_servico import whatsapp_servico

    for telefone in destinatarios:
        try:
            whatsapp_servico.enviar_mensagem(
                telefone=telefone, mensagem=texto_relatorio
            )
            logger.info("Relatorio enviado para %s", telefone)
        except Exception as exc:
            logger.error(
                "Falha ao enviar relatorio para %s: %s",
                telefone,
                str(exc),
                exc_info=True,
            )
