"""
Serviço de Compliance Eleitoral — Oráculo Eleitoral

Garante conformidade com a legislação eleitoral brasileira (TSE),
LGPD e boas práticas de comunicação política via WhatsApp.

Toda mensagem de saída passa por este serviço antes de ser enviada.
"""

import logging
import re
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

# Termos proibidos em propaganda eleitoral (simplificado)
TERMOS_ALERTA = [
    "compra de voto",
    "dinheiro por voto",
    "boca de urna",
    "pesquisa falsa",
    "fake news",
]

# Disclaimer obrigatório (IA + identificação)
DISCLAIMER_IA = "\n\n_Mensagem gerada por IA — INTEIA Inteligência Estratégica_"

# Identificação eleitoral obrigatória
IDENTIFICACAO_TEMPLATE = "\n_Responsável: {cliente} | CNPJ: 63.918.490/0001-20_"


class ComplianceServico:
    """Serviço de compliance eleitoral para mensagens WhatsApp"""

    def validar_mensagem_saida(self, mensagem: str) -> dict:
        """
        Valida mensagem de saída quanto a compliance eleitoral.

        Retorna:
            {
                "valida": bool,
                "alertas": list[str],
                "bloqueada": bool,
                "motivo": str ou None
            }
        """
        alertas = []
        bloqueada = False
        motivo = None

        # Verificar termos proibidos
        msg_lower = mensagem.lower()
        for termo in TERMOS_ALERTA:
            if termo in msg_lower:
                alertas.append(f"Termo sensível detectado: '{termo}'")

        # Verificar tamanho (WhatsApp limita 4096)
        if len(mensagem) > 4096:
            alertas.append("Mensagem excede limite de 4096 caracteres do WhatsApp")

        # Verificar conteúdo ofensivo básico
        padroes_bloqueio = [
            r"(?i)matar|assassin|bomb",
            r"(?i)compra.*voto|voto.*compra",
        ]
        for padrao in padroes_bloqueio:
            if re.search(padrao, mensagem):
                bloqueada = True
                motivo = f"Conteúdo bloqueado por compliance: padrão '{padrao}'"
                break

        return {
            "valida": not bloqueada,
            "alertas": alertas,
            "bloqueada": bloqueada,
            "motivo": motivo,
        }

    def adicionar_disclaimer_ia(self, mensagem: str) -> str:
        """Adiciona aviso obrigatório de que o conteúdo foi gerado por IA"""
        if "_Mensagem gerada por IA" not in mensagem:
            mensagem += DISCLAIMER_IA
        return mensagem

    def adicionar_identificacao(
        self, mensagem: str, cliente: str = "INTEIA"
    ) -> str:
        """Adiciona identificação legal do responsável"""
        identificacao = IDENTIFICACAO_TEMPLATE.format(cliente=cliente)
        if "CNPJ" not in mensagem:
            mensagem += identificacao
        return mensagem

    def verificar_opt_in(self, opt_in_em: Optional[datetime]) -> bool:
        """Verifica se o contato deu opt-in (consentimento)"""
        return opt_in_em is not None

    def processar_opt_out(self, mensagem: str) -> bool:
        """
        Verifica se a mensagem é um pedido de opt-out.
        Palavras-chave: SAIR, PARAR, CANCELAR, STOP
        """
        palavras_opt_out = {"sair", "parar", "cancelar", "stop", "unsubscribe"}
        return mensagem.strip().lower() in palavras_opt_out

    def preparar_mensagem_saida(
        self,
        mensagem: str,
        cliente: str = "INTEIA",
        adicionar_disclaimer: bool = True,
        adicionar_id: bool = True,
    ) -> dict:
        """
        Pipeline completo de compliance para mensagem de saída.

        Retorna:
            {
                "mensagem": str (mensagem processada),
                "valida": bool,
                "alertas": list[str],
                "bloqueada": bool,
            }
        """
        # Validar
        validacao = self.validar_mensagem_saida(mensagem)

        if validacao["bloqueada"]:
            logger.warning(f"Mensagem bloqueada: {validacao['motivo']}")
            return {
                "mensagem": mensagem,
                "valida": False,
                "alertas": validacao["alertas"],
                "bloqueada": True,
            }

        # Adicionar disclaimers
        if adicionar_disclaimer:
            mensagem = self.adicionar_disclaimer_ia(mensagem)

        if adicionar_id:
            mensagem = self.adicionar_identificacao(mensagem, cliente)

        # Truncar se necessário (4096 - espaço para disclaimers)
        if len(mensagem) > 4096:
            mensagem = mensagem[:4090] + "\n[...]"

        # Log de auditoria
        self.log_auditoria(mensagem)

        return {
            "mensagem": mensagem,
            "valida": True,
            "alertas": validacao["alertas"],
            "bloqueada": False,
        }

    def log_auditoria(self, mensagem: str) -> None:
        """
        Registra log de auditoria imutável.
        Em produção, pode ser expandido para gravar em tabela dedicada.
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        tamanho = len(mensagem)
        logger.info(
            f"[AUDIT] ts={timestamp} tamanho={tamanho} "
            f"preview={mensagem[:80]!r}"
        )


# Instância global
compliance_servico = ComplianceServico()
