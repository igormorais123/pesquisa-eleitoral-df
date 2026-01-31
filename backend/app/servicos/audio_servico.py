"""
Serviço de transcrição e geração de áudio.

Utiliza a API OpenAI Whisper para transcrição de áudios recebidos
via WhatsApp e, opcionalmente, TTS para gerar respostas em áudio.
"""

import tempfile
import os
import logging
from pathlib import Path

from openai import AsyncOpenAI
from pydub import AudioSegment

from app.core.config import configuracoes

logger = logging.getLogger(__name__)

# Cliente OpenAI assíncrono (inicializado sob demanda)
_cliente_openai: AsyncOpenAI | None = None


def _get_cliente_openai() -> AsyncOpenAI:
    """Retorna instância singleton do cliente OpenAI assíncrono."""
    global _cliente_openai
    if _cliente_openai is None:
        _cliente_openai = AsyncOpenAI(api_key=configuracoes.OPENAI_API_KEY)
    return _cliente_openai


def _converter_ogg_para_mp3(ogg_bytes: bytes) -> bytes:
    """
    Converte bytes de áudio OGG para formato MP3.

    Utiliza pydub para a conversão, salvando arquivos temporários
    no sistema de arquivos.

    Args:
        ogg_bytes: Conteúdo do arquivo OGG em bytes.

    Returns:
        Conteúdo do arquivo MP3 em bytes.

    Raises:
        ValueError: Se os bytes de entrada estiverem vazios.
        RuntimeError: Se a conversão falhar.
    """
    if not ogg_bytes:
        raise ValueError("Bytes de áudio OGG não podem estar vazios.")

    caminho_ogg = None
    caminho_mp3 = None

    try:
        # Salvar OGG em arquivo temporário
        with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp_ogg:
            tmp_ogg.write(ogg_bytes)
            caminho_ogg = tmp_ogg.name

        # Converter OGG -> MP3
        audio = AudioSegment.from_ogg(caminho_ogg)

        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp_mp3:
            caminho_mp3 = tmp_mp3.name

        audio.export(caminho_mp3, format="mp3", bitrate="64k")

        # Ler o MP3 resultante
        with open(caminho_mp3, "rb") as f:
            mp3_bytes = f.read()

        logger.info(
            "Conversão OGG->MP3 concluída. "
            "Tamanho OGG: %d bytes, Tamanho MP3: %d bytes",
            len(ogg_bytes),
            len(mp3_bytes),
        )
        return mp3_bytes

    except Exception as e:
        logger.error("Erro ao converter OGG para MP3: %s", str(e))
        raise RuntimeError(f"Falha na conversão de áudio OGG para MP3: {e}") from e

    finally:
        # Limpar arquivos temporários
        for caminho in (caminho_ogg, caminho_mp3):
            if caminho and os.path.exists(caminho):
                try:
                    os.unlink(caminho)
                except OSError:
                    logger.warning("Não foi possível remover arquivo temporário: %s", caminho)


async def transcrever_audio(ogg_bytes: bytes, idioma: str = "pt") -> str:
    """
    Transcreve áudio OGG usando a API OpenAI Whisper.

    Converte o áudio OGG para MP3, envia para a API Whisper e retorna
    o texto transcrito.

    Args:
        ogg_bytes: Conteúdo do arquivo de áudio OGG em bytes.
        idioma: Código do idioma para transcrição (padrão: "pt" para português).

    Returns:
        Texto transcrito do áudio.

    Raises:
        ValueError: Se os bytes de áudio estiverem vazios.
        RuntimeError: Se a transcrição falhar.
    """
    if not ogg_bytes:
        raise ValueError("Bytes de áudio não podem estar vazios para transcrição.")

    logger.info("Iniciando transcrição de áudio. Tamanho: %d bytes, Idioma: %s", len(ogg_bytes), idioma)

    caminho_mp3 = None

    try:
        # Converter OGG para MP3
        mp3_bytes = _converter_ogg_para_mp3(ogg_bytes)

        # Salvar MP3 em arquivo temporário para envio à API
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp_mp3:
            tmp_mp3.write(mp3_bytes)
            caminho_mp3 = tmp_mp3.name

        # Chamar API Whisper
        cliente = _get_cliente_openai()

        with open(caminho_mp3, "rb") as arquivo_audio:
            resposta = await cliente.audio.transcriptions.create(
                model="whisper-1",
                file=arquivo_audio,
                language=idioma,
                response_format="text",
            )

        texto_transcrito = resposta.strip() if isinstance(resposta, str) else str(resposta).strip()

        logger.info(
            "Transcrição concluída com sucesso. Caracteres transcritos: %d",
            len(texto_transcrito),
        )
        return texto_transcrito

    except ValueError:
        raise
    except Exception as e:
        logger.error("Erro ao transcrever áudio via Whisper: %s", str(e))
        raise RuntimeError(f"Falha na transcrição de áudio: {e}") from e

    finally:
        if caminho_mp3 and os.path.exists(caminho_mp3):
            try:
                os.unlink(caminho_mp3)
            except OSError:
                logger.warning("Não foi possível remover arquivo temporário: %s", caminho_mp3)


async def gerar_audio_resposta(texto: str) -> bytes:
    """
    Gera áudio a partir de texto usando TTS da OpenAI.

    Funcionalidade reservada para implementação futura.
    Permite enviar respostas em áudio de volta ao usuário via WhatsApp.

    Args:
        texto: Texto a ser convertido em áudio.

    Returns:
        Conteúdo do arquivo de áudio gerado em bytes (formato MP3).

    Raises:
        ValueError: Se o texto estiver vazio.
        RuntimeError: Se a geração de áudio falhar.
    """
    if not texto or not texto.strip():
        raise ValueError("Texto não pode estar vazio para geração de áudio.")

    logger.info("Iniciando geração de áudio TTS. Caracteres: %d", len(texto))

    try:
        cliente = _get_cliente_openai()

        resposta = await cliente.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=texto,
            response_format="mp3",
        )

        # Ler o conteúdo da resposta
        audio_bytes = resposta.content

        logger.info(
            "Áudio TTS gerado com sucesso. Tamanho: %d bytes",
            len(audio_bytes),
        )
        return audio_bytes

    except Exception as e:
        logger.error("Erro ao gerar áudio TTS: %s", str(e))
        raise RuntimeError(f"Falha na geração de áudio TTS: {e}") from e
