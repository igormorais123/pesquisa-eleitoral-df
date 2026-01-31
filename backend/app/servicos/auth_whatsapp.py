"""
Serviço de Autenticação WhatsApp — Oráculo Eleitoral

Controle de acesso via PIN para contatos do WhatsApp.
Sessões duram 24h (janela de sessão do WhatsApp).
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from passlib.context import CryptContext

from app.core.config import configuracoes

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Cache de sessões autenticadas (telefone -> expiracao)
_sessoes_ativas: dict[str, datetime] = {}

# Duração da sessão (24h = janela WhatsApp)
DURACAO_SESSAO = timedelta(hours=24)


class AuthWhatsApp:
    """Autenticação de contatos WhatsApp via PIN"""

    def verificar_pin(self, pin: str, pin_hash: str) -> bool:
        """Verifica se o PIN fornecido bate com o hash armazenado"""
        return pwd_context.verify(pin, pin_hash)

    def gerar_hash_pin(self, pin: str) -> str:
        """Gera hash bcrypt do PIN"""
        return pwd_context.hash(pin)

    def criar_sessao(self, telefone: str) -> None:
        """Cria sessão autenticada para o telefone"""
        _sessoes_ativas[telefone] = datetime.now(timezone.utc) + DURACAO_SESSAO
        logger.info(f"Sessão criada para {telefone}")

    def sessao_ativa(self, telefone: str) -> bool:
        """Verifica se o telefone tem sessão ativa (não expirada)"""
        expiracao = _sessoes_ativas.get(telefone)
        if not expiracao:
            return False
        if datetime.now(timezone.utc) > expiracao:
            del _sessoes_ativas[telefone]
            return False
        return True

    def encerrar_sessao(self, telefone: str) -> None:
        """Encerra sessão do telefone"""
        _sessoes_ativas.pop(telefone, None)
        logger.info(f"Sessão encerrada para {telefone}")

    def autenticar(
        self,
        telefone: str,
        mensagem: str,
        pin_hash: Optional[str],
    ) -> dict:
        """
        Fluxo completo de autenticação.

        Retorna:
            {
                "autenticado": bool,
                "resposta": str ou None (mensagem para enviar ao usuário),
                "requer_pin": bool
            }
        """
        # Se já tem sessão ativa, está autenticado
        if self.sessao_ativa(telefone):
            return {"autenticado": True, "resposta": None, "requer_pin": False}

        # Se não tem PIN configurado, acesso direto
        if not pin_hash:
            self.criar_sessao(telefone)
            return {"autenticado": True, "resposta": None, "requer_pin": False}

        # Verifica se a mensagem é o PIN
        pin_candidato = mensagem.strip()

        # PIN deve ter 4-8 dígitos
        if pin_candidato.isdigit() and 4 <= len(pin_candidato) <= 8:
            if self.verificar_pin(pin_candidato, pin_hash):
                self.criar_sessao(telefone)
                return {
                    "autenticado": True,
                    "resposta": "Autenticação bem-sucedida. Bem-vindo ao Oráculo Eleitoral.",
                    "requer_pin": False,
                }
            else:
                return {
                    "autenticado": False,
                    "resposta": "PIN incorreto. Tente novamente.",
                    "requer_pin": True,
                }

        # Primeira mensagem sem PIN — solicitar autenticação
        return {
            "autenticado": False,
            "resposta": (
                "Bem-vindo ao *Oráculo Eleitoral*.\n\n"
                "Para acessar, envie seu PIN de acesso (4-8 dígitos)."
            ),
            "requer_pin": True,
        }

    def limpar_sessoes_expiradas(self) -> int:
        """Remove sessões expiradas do cache. Retorna quantidade removida."""
        agora = datetime.now(timezone.utc)
        expiradas = [tel for tel, exp in _sessoes_ativas.items() if agora > exp]
        for tel in expiradas:
            del _sessoes_ativas[tel]
        return len(expiradas)


# Instância global
auth_whatsapp = AuthWhatsApp()
