"""
Tarefas Celery para processamento de mensagens WhatsApp via agentes LangGraph.

Recebe mensagens do webhook do WhatsApp, processa atraves do grafo
supervisor de agentes e envia a resposta de volta pelo WhatsApp.
Suporta mensagens de texto e audio.
"""

import logging
from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import configuracoes
from app.tarefas.celery_app import celery_app

logger = logging.getLogger(__name__)

# Cria engine sincrona para uso no worker Celery
# Substitui o driver async pelo psycopg3 sincrono
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
    name="app.tarefas.agente_tarefas.processar_mensagem_agente",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
    acks_late=True,
)
def processar_mensagem_agente(
    self,
    telefone: str,
    mensagem: str,
    tipo_msg: str,
    media_id: str | None,
    conversa_id: int,
    contato_id: int,
) -> dict:
    """
    Processa uma mensagem recebida do WhatsApp atraves do agente LangGraph.

    Fluxo:
    1. Se for audio, transcreve usando o servico de audio
    2. Envia a mensagem para o grafo supervisor de agentes
    3. Obtem a resposta do agente
    4. Envia a resposta de volta pelo WhatsApp
    5. Registra a interacao no banco de dados

    Args:
        telefone: Numero de telefone do remetente (formato internacional).
        mensagem: Conteudo textual da mensagem recebida.
        tipo_msg: Tipo da mensagem (texto, audio, imagem, etc).
        media_id: ID da midia no WhatsApp (para audio/imagem), ou None.
        conversa_id: ID da conversa no banco de dados.
        contato_id: ID do contato no banco de dados.

    Returns:
        Dicionario com status do processamento e resposta enviada.

    Raises:
        Reenfileira a tarefa em caso de falha (ate 3 tentativas).
    """
    logger.info(
        "Processando mensagem do telefone %s | conversa_id=%s | tipo=%s",
        telefone,
        conversa_id,
        tipo_msg,
    )

    sessao = _obter_sessao_banco()
    try:
        # Trata mensagens de audio - transcreve antes de processar
        texto_processado = mensagem
        if tipo_msg == "audio" and media_id:
            texto_processado = _transcrever_audio(media_id)
            logger.info(
                "Audio transcrito para conversa_id=%s: %s...",
                conversa_id,
                texto_processado[:80] if texto_processado else "",
            )

        # Processa a mensagem pelo grafo supervisor de agentes
        resposta_agente = _executar_agente(
            sessao=sessao,
            telefone=telefone,
            mensagem=texto_processado,
            conversa_id=conversa_id,
            contato_id=contato_id,
        )

        # Envia a resposta de volta pelo WhatsApp
        _enviar_resposta_whatsapp(telefone, resposta_agente)

        # Registra a interacao no banco
        _registrar_interacao(
            sessao=sessao,
            conversa_id=conversa_id,
            contato_id=contato_id,
            mensagem_entrada=texto_processado,
            resposta_saida=resposta_agente,
            tipo_msg=tipo_msg,
        )

        sessao.commit()
        logger.info(
            "Mensagem processada com sucesso | conversa_id=%s | telefone=%s",
            conversa_id,
            telefone,
        )

        return {
            "status": "sucesso",
            "conversa_id": conversa_id,
            "contato_id": contato_id,
            "resposta": resposta_agente,
            "processado_em": datetime.now(timezone.utc).isoformat(),
        }

    except Exception as exc:
        sessao.rollback()
        logger.error(
            "Erro ao processar mensagem | conversa_id=%s | telefone=%s | erro=%s",
            conversa_id,
            telefone,
            str(exc),
            exc_info=True,
        )
        # Reenfileira a tarefa com backoff exponencial
        raise self.retry(exc=exc, countdown=30 * (2 ** self.request.retries))

    finally:
        sessao.close()


def _transcrever_audio(media_id: str) -> str:
    """
    Transcreve uma mensagem de audio usando o servico de audio.

    Baixa a midia do WhatsApp e transcreve usando Whisper (local ou API).

    Args:
        media_id: ID da midia de audio no WhatsApp.

    Returns:
        Texto transcrito do audio.
    """
    import asyncio
    from app.servicos.whatsapp_servico import whatsapp_servico
    from app.servicos.audio_servico import transcrever_audio

    # Baixar audio do WhatsApp e transcrever (funcoes async chamadas de contexto sync)
    loop = asyncio.new_event_loop()
    try:
        audio_bytes = loop.run_until_complete(whatsapp_servico.baixar_midia(media_id))
        texto_transcrito = loop.run_until_complete(transcrever_audio(audio_bytes, idioma="pt"))
        return texto_transcrito
    finally:
        loop.close()


def _executar_agente(
    sessao,
    telefone: str,
    mensagem: str,
    conversa_id: int,
    contato_id: int,
) -> str:
    """
    Executa o grafo supervisor de agentes LangGraph para processar a mensagem.

    Args:
        sessao: Sessao do banco de dados.
        telefone: Numero do telefone do remetente.
        mensagem: Texto da mensagem a ser processada.
        conversa_id: ID da conversa no banco.
        contato_id: ID do contato no banco.

    Returns:
        Texto da resposta gerada pelo agente.
    """
    import asyncio
    from app.agentes.supervisor import invocar_supervisor

    # Invoca o supervisor (async) a partir do contexto sync do Celery
    loop = asyncio.new_event_loop()
    try:
        resultado = loop.run_until_complete(
            invocar_supervisor(
                mensagem=mensagem,
                telefone=telefone,
                conversa_id=conversa_id,
            )
        )
    finally:
        loop.close()

    # Extrai a resposta final do resultado do supervisor
    resposta = resultado.get("resposta", "")
    if not resposta:
        logger.warning(
            "Agente nao retornou resposta para conversa_id=%s", conversa_id
        )
        resposta = (
            "Desculpe, nao consegui processar sua mensagem. "
            "Tente novamente em alguns instantes."
        )

    return resposta


def _enviar_resposta_whatsapp(telefone: str, resposta: str) -> None:
    """
    Envia a resposta do agente de volta pelo WhatsApp.

    Args:
        telefone: Numero de telefone do destinatario.
        resposta: Texto da resposta a ser enviada.
    """
    from app.servicos.whatsapp_servico import whatsapp_servico

    import asyncio
    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(whatsapp_servico.enviar_texto(telefone=telefone, texto=resposta))
    finally:
        loop.close()
    logger.info("Resposta enviada pelo WhatsApp para %s", telefone)


def _registrar_interacao(
    sessao,
    conversa_id: int,
    contato_id: int,
    mensagem_entrada: str,
    resposta_saida: str,
    tipo_msg: str,
) -> None:
    """
    Registra a interacao (mensagem recebida + resposta) no banco de dados.

    Args:
        sessao: Sessao do banco de dados.
        conversa_id: ID da conversa.
        contato_id: ID do contato.
        mensagem_entrada: Texto da mensagem recebida.
        resposta_saida: Texto da resposta enviada.
        tipo_msg: Tipo da mensagem original.
    """
    agora = datetime.now(timezone.utc)

    # Registra usando SQL direto para evitar dependencia de modelos ORM especificos
    from sqlalchemy import text

    stmt = text(
        """
        INSERT INTO mensagens_whatsapp
            (conversa_id, contato_id, conteudo, tipo, direcao, status_entrega, criado_em)
        VALUES
            (:conversa_id, :contato_id, :conteudo, :tipo, :direcao, :status_entrega, :criado_em)
        """
    )
    sessao.execute(
        stmt,
        {
            "conversa_id": conversa_id,
            "contato_id": contato_id,
            "conteudo": mensagem_entrada,
            "tipo": tipo_msg,
            "direcao": "entrada",
            "status_entrega": "entregue",
            "criado_em": agora,
        },
    )
    sessao.execute(
        stmt,
        {
            "conversa_id": conversa_id,
            "contato_id": contato_id,
            "conteudo": resposta_saida,
            "tipo": "texto",
            "direcao": "saida",
            "status_entrega": "enviada",
            "criado_em": agora,
        },
    )
    logger.info(
        "Interacao registrada no banco | conversa_id=%s | contato_id=%s",
        conversa_id,
        contato_id,
    )
