"""
Serviço de transcrição e geração de áudio.

Modos de transcrição (em ordem de prioridade):
1. Whisper local (openai-whisper) — gratuito, roda na máquina
2. API OpenAI Whisper — fallback quando modelo local não disponível

TTS via API OpenAI para respostas em áudio.
"""

import tempfile
import os
import logging
from pathlib import Path

from pydub import AudioSegment

from app.core.config import configuracoes

logger = logging.getLogger(__name__)

# =============================================
# Whisper Local (singleton lazy)
# =============================================
_modelo_whisper_local = None
_whisper_disponivel: bool | None = None


def _carregar_whisper_local():
    """Carrega modelo Whisper local (base). Retorna None se indisponível."""
    global _modelo_whisper_local, _whisper_disponivel

    if _whisper_disponivel is False:
        return None

    if _modelo_whisper_local is not None:
        return _modelo_whisper_local

    try:
        import whisper
        logger.info("Carregando modelo Whisper local (base)...")
        _modelo_whisper_local = whisper.load_model("base")
        _whisper_disponivel = True
        logger.info("Whisper local carregado com sucesso")
        return _modelo_whisper_local
    except Exception as e:
        logger.warning("Whisper local indisponível: %s. Usando API como fallback.", e)
        _whisper_disponivel = False
        return None


# =============================================
# Cliente OpenAI (fallback API)
# =============================================
_cliente_openai = None


def _get_cliente_openai():
    """Retorna instância singleton do cliente OpenAI assíncrono."""
    global _cliente_openai
    if _cliente_openai is None:
        from openai import AsyncOpenAI
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


def _transcrever_whisper_local(caminho_audio: str, idioma: str = "pt") -> str | None:
    """Transcreve usando modelo Whisper local. Retorna None se falhar."""
    modelo = _carregar_whisper_local()
    if modelo is None:
        return None

    try:
        resultado = modelo.transcribe(caminho_audio, language=idioma, fp16=False)
        texto = resultado.get("text", "").strip()
        logger.info("Whisper local transcreveu %d caracteres", len(texto))
        return texto
    except Exception as e:
        logger.warning("Whisper local falhou: %s. Tentando API.", e)
        return None


async def _transcrever_whisper_api(caminho_mp3: str, idioma: str = "pt") -> str:
    """Transcreve usando API OpenAI Whisper (fallback)."""
    cliente = _get_cliente_openai()

    with open(caminho_mp3, "rb") as arquivo_audio:
        resposta = await cliente.audio.transcriptions.create(
            model="whisper-1",
            file=arquivo_audio,
            language=idioma,
            response_format="text",
        )

    texto = resposta.strip() if isinstance(resposta, str) else str(resposta).strip()
    logger.info("API Whisper transcreveu %d caracteres", len(texto))
    return texto


async def transcrever_audio(ogg_bytes: bytes, idioma: str = "pt") -> str:
    """
    Transcreve áudio OGG usando Whisper.

    Prioridade:
    1. Whisper local (openai-whisper) — gratuito, sem API
    2. API OpenAI Whisper — fallback quando local não disponível

    Args:
        ogg_bytes: Conteúdo do arquivo de áudio OGG em bytes.
        idioma: Código do idioma para transcrição (padrão: "pt" para português).

    Returns:
        Texto transcrito do áudio.
    """
    if not ogg_bytes:
        raise ValueError("Bytes de áudio não podem estar vazios para transcrição.")

    logger.info("Iniciando transcrição. Tamanho: %d bytes, Idioma: %s", len(ogg_bytes), idioma)

    caminho_mp3 = None

    try:
        # Converter OGG para MP3
        mp3_bytes = _converter_ogg_para_mp3(ogg_bytes)

        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp_mp3:
            tmp_mp3.write(mp3_bytes)
            caminho_mp3 = tmp_mp3.name

        # Tentar Whisper local primeiro
        texto = _transcrever_whisper_local(caminho_mp3, idioma)

        # Fallback para API se local falhar
        if texto is None:
            logger.info("Usando API Whisper como fallback")
            texto = await _transcrever_whisper_api(caminho_mp3, idioma)

        logger.info("Transcrição concluída: %d caracteres", len(texto))
        return texto

    except ValueError:
        raise
    except Exception as e:
        logger.error("Erro ao transcrever áudio: %s", str(e))
        raise RuntimeError(f"Falha na transcrição de áudio: {e}") from e

    finally:
        if caminho_mp3 and os.path.exists(caminho_mp3):
            try:
                os.unlink(caminho_mp3)
            except OSError:
                logger.warning("Não foi possível remover temporário: %s", caminho_mp3)


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
