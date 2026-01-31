"""
Serviço WhatsApp — Meta Cloud API

Cliente assíncrono para envio e recebimento de mensagens via Meta Cloud API.
Segue o padrão do claude_servico.py (httpx async).
"""

import hashlib
import hmac
import logging
from typing import Optional

import httpx

from app.core.config import configuracoes

logger = logging.getLogger(__name__)

# URL base da Meta Graph API
META_API_BASE = f"https://graph.facebook.com/{configuracoes.WHATSAPP_API_VERSION}"


class WhatsAppServico:
    """Cliente assíncrono para Meta Cloud API WhatsApp"""

    def __init__(self):
        self.token = configuracoes.WHATSAPP_TOKEN
        self.phone_id = configuracoes.WHATSAPP_PHONE_ID
        self.verify_token = configuracoes.WHATSAPP_VERIFY_TOKEN
        self.app_secret = configuracoes.WHATSAPP_APP_SECRET
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def configurado(self) -> bool:
        """Verifica se o WhatsApp está configurado"""
        return bool(self.token and self.phone_id)

    async def _get_client(self) -> httpx.AsyncClient:
        """Retorna client httpx reutilizável"""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=META_API_BASE,
                headers={
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json",
                },
                timeout=30.0,
            )
        return self._client

    async def fechar(self):
        """Fecha o client httpx"""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    # =============================================
    # Verificação de Webhook
    # =============================================

    def verificar_webhook(self, mode: str, token: str, challenge: str) -> Optional[str]:
        """
        Verifica o webhook do Meta (GET request).
        Retorna o challenge se o token for válido, None caso contrário.
        """
        if mode == "subscribe" and token == self.verify_token:
            logger.info("Webhook verificado com sucesso")
            return challenge
        logger.warning(f"Falha na verificação do webhook: mode={mode}")
        return None

    def verificar_assinatura(self, payload: bytes, assinatura: str) -> bool:
        """
        Verifica a assinatura X-Hub-Signature-256 do Meta.
        Protege contra payloads falsificados.
        """
        if not self.app_secret:
            logger.warning("WHATSAPP_APP_SECRET não configurado — assinatura não verificada")
            return True

        expected = hmac.new(
            self.app_secret.encode("utf-8"),
            payload,
            hashlib.sha256,
        ).hexdigest()

        received = assinatura.replace("sha256=", "")
        return hmac.compare_digest(expected, received)

    # =============================================
    # Envio de Mensagens
    # =============================================

    async def enviar_texto(self, telefone: str, texto: str) -> dict:
        """
        Envia mensagem de texto via WhatsApp.

        Args:
            telefone: Número no formato E.164 (ex: +5561999999999)
            texto: Texto da mensagem (max 4096 chars)

        Returns:
            Resposta da API do Meta
        """
        # WhatsApp limita a 4096 caracteres
        if len(texto) > 4096:
            texto = texto[:4090] + "\n[...]"

        client = await self._get_client()
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": telefone.replace("+", ""),
            "type": "text",
            "text": {"preview_url": False, "body": texto},
        }

        response = await client.post(f"/{self.phone_id}/messages", json=payload)
        data = response.json()

        if response.status_code != 200:
            logger.error(f"Erro ao enviar texto para {telefone}: {data}")
            raise httpx.HTTPStatusError(
                f"Meta API error: {data}",
                request=response.request,
                response=response,
            )

        msg_id = data.get("messages", [{}])[0].get("id")
        logger.info(f"Texto enviado para {telefone}: {msg_id}")
        return data

    async def enviar_documento(
        self,
        telefone: str,
        media_id: str,
        filename: str,
        caption: Optional[str] = None,
    ) -> dict:
        """Envia documento (PDF) via WhatsApp"""
        client = await self._get_client()
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": telefone.replace("+", ""),
            "type": "document",
            "document": {
                "id": media_id,
                "filename": filename,
            },
        }
        if caption:
            payload["document"]["caption"] = caption[:1024]

        response = await client.post(f"/{self.phone_id}/messages", json=payload)
        data = response.json()

        if response.status_code != 200:
            logger.error(f"Erro ao enviar documento para {telefone}: {data}")
        return data

    async def enviar_imagem(
        self,
        telefone: str,
        media_id: str,
        caption: Optional[str] = None,
    ) -> dict:
        """Envia imagem via WhatsApp"""
        client = await self._get_client()
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": telefone.replace("+", ""),
            "type": "image",
            "image": {"id": media_id},
        }
        if caption:
            payload["image"]["caption"] = caption[:1024]

        response = await client.post(f"/{self.phone_id}/messages", json=payload)
        return response.json()

    async def enviar_reacao(self, telefone: str, msg_id: str, emoji: str) -> dict:
        """Envia reação a uma mensagem"""
        client = await self._get_client()
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": telefone.replace("+", ""),
            "type": "reaction",
            "reaction": {"message_id": msg_id, "emoji": emoji},
        }
        response = await client.post(f"/{self.phone_id}/messages", json=payload)
        return response.json()

    async def marcar_como_lida(self, msg_id: str) -> dict:
        """Marca mensagem como lida (double blue check)"""
        client = await self._get_client()
        payload = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": msg_id,
        }
        response = await client.post(f"/{self.phone_id}/messages", json=payload)
        return response.json()

    # =============================================
    # Download/Upload de Mídia
    # =============================================

    async def baixar_midia(self, media_id: str) -> bytes:
        """
        Baixa mídia do Meta (áudio, imagem, documento).

        Passo 1: Obtém URL do arquivo
        Passo 2: Baixa o arquivo binário
        """
        client = await self._get_client()

        # Passo 1: obter URL
        response = await client.get(f"/{media_id}")
        data = response.json()
        url = data.get("url")

        if not url:
            raise ValueError(f"URL de mídia não encontrada para media_id={media_id}")

        # Passo 2: baixar arquivo (URL requer auth header)
        response = await client.get(url)
        if response.status_code != 200:
            raise ValueError(f"Erro ao baixar mídia: status={response.status_code}")

        logger.info(f"Mídia baixada: media_id={media_id}, tamanho={len(response.content)} bytes")
        return response.content

    async def upload_midia(self, arquivo: bytes, mime_type: str) -> str:
        """
        Faz upload de mídia para Meta Cloud.
        Retorna o media_id para uso posterior.
        """
        client = await self._get_client()

        # Upload usa multipart/form-data
        files = {
            "file": ("arquivo", arquivo, mime_type),
        }
        data = {
            "messaging_product": "whatsapp",
            "type": mime_type,
        }

        # Temporariamente remove Content-Type json para multipart
        response = await client.post(
            f"/{self.phone_id}/media",
            data=data,
            files=files,
            headers={"Content-Type": None},
        )
        result = response.json()
        media_id = result.get("id")
        logger.info(f"Mídia uploaded: media_id={media_id}")
        return media_id


# Instância global do serviço
whatsapp_servico = WhatsAppServico()
