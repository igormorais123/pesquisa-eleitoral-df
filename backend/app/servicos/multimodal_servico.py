"""
Serviço Multimodal — Oráculo Eleitoral

Processamento de imagens (Claude Vision) e áudio (Whisper).
Integra com o pipeline do WhatsApp para análise de mídias.
"""

import base64
import logging
from typing import Optional

import anthropic

from app.core.config import configuracoes

logger = logging.getLogger(__name__)


class MultimodalServico:
    """Processamento multimodal de imagens e áudio"""

    def __init__(self):
        self._client: Optional[anthropic.AsyncAnthropic] = None

    def _get_client(self) -> anthropic.AsyncAnthropic:
        """Retorna client Anthropic reutilizável"""
        if self._client is None:
            self._client = anthropic.AsyncAnthropic(
                api_key=configuracoes.CLAUDE_API_KEY
            )
        return self._client

    async def processar_imagem(
        self,
        image_bytes: bytes,
        mime_type: str = "image/jpeg",
        instrucao: str = "",
    ) -> str:
        """
        Analisa imagem usando Claude Vision.

        Args:
            image_bytes: Bytes da imagem
            mime_type: Tipo MIME (image/jpeg, image/png, image/webp)
            instrucao: Instrução específica para análise

        Returns:
            Descrição/análise textual da imagem
        """
        client = self._get_client()

        # Converter para base64
        image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

        prompt_padrao = (
            "Analise esta imagem no contexto de uma campanha eleitoral no "
            "Distrito Federal, Brasil, para as eleições de 2026. "
            "Descreva o que você vê e quaisquer implicações estratégicas."
        )

        prompt = instrucao if instrucao else prompt_padrao

        try:
            response = await client.messages.create(
                model="claude-sonnet-4-5-20250514",
                max_tokens=1024,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": mime_type,
                                    "data": image_b64,
                                },
                            },
                            {
                                "type": "text",
                                "text": prompt,
                            },
                        ],
                    }
                ],
            )
            resultado = response.content[0].text
            logger.info(f"Imagem analisada: {len(resultado)} chars")
            return resultado

        except Exception as e:
            logger.error(f"Erro ao analisar imagem: {e}")
            return f"Não foi possível analisar a imagem: {e}"

    async def processar_audio(self, ogg_bytes: bytes) -> str:
        """
        Transcreve áudio usando serviço de áudio dedicado.

        Args:
            ogg_bytes: Bytes do áudio OGG do WhatsApp

        Returns:
            Texto transcrito
        """
        from app.servicos.audio_servico import transcrever_audio

        return await transcrever_audio(ogg_bytes)

    async def analisar_documento(
        self,
        texto_documento: str,
        instrucao: str = "",
    ) -> str:
        """
        Analisa conteúdo textual de um documento.

        Args:
            texto_documento: Texto extraído do documento
            instrucao: Instrução específica para análise

        Returns:
            Análise do documento
        """
        client = self._get_client()

        prompt = instrucao or (
            "Analise este documento no contexto de uma campanha eleitoral "
            "no DF 2026. Extraia informações relevantes e implicações estratégicas."
        )

        try:
            response = await client.messages.create(
                model="claude-sonnet-4-5-20250514",
                max_tokens=2048,
                messages=[
                    {
                        "role": "user",
                        "content": f"{prompt}\n\nDocumento:\n{texto_documento[:10000]}",
                    }
                ],
            )
            return response.content[0].text

        except Exception as e:
            logger.error(f"Erro ao analisar documento: {e}")
            return f"Não foi possível analisar o documento: {e}"


# Instância global
multimodal_servico = MultimodalServico()
