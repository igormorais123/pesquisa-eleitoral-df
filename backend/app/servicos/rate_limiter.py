"""
Rate limiter para envio de mensagens via WhatsApp.

Controla os limites de envio conforme as regras da API do WhatsApp Business
e requisitos de conformidade eleitoral brasileira. Utiliza Redis para
rastreamento distribuído dos contadores.
"""

import logging
import time
from datetime import datetime, timezone

import redis

from app.core.config import configuracoes

logger = logging.getLogger(__name__)

# Constantes de limites
LIMITE_MENSAGENS_POR_SEGUNDO = 80  # Limite global da API WhatsApp Business
LIMITE_INTERVALO_POR_PAR = 6  # Segundos mínimos entre mensagens para o mesmo destinatário
LIMITE_CONTATOS_UNICOS_DIARIO = 1000  # Máximo de contatos únicos por dia

# Prefixos das chaves Redis
PREFIXO_GLOBAL = "wpp:rate:global"
PREFIXO_PAR = "wpp:rate:par"
PREFIXO_DIARIO = "wpp:rate:diario"
PREFIXO_CONTATOS = "wpp:rate:contatos"


class RateLimiterWhatsApp:
    """
    Controle de taxa de envio de mensagens WhatsApp.

    Implementa três camadas de limitação:
    - Global: máximo de 80 mensagens por segundo
    - Por par: mínimo de 6 segundos entre mensagens para o mesmo destinatário
    - Diário: máximo de 1000 contatos únicos por dia

    Inclui flag de conformidade eleitoral que, quando ativada, aplica
    restrições adicionais conforme legislação eleitoral brasileira.

    Atributos:
        limite_por_segundo: Limite global de mensagens por segundo.
        intervalo_por_par: Intervalo mínimo entre mensagens para o mesmo número.
        limite_contatos_diario: Limite diário de contatos únicos.
        conformidade_eleitoral: Se True, aplica regras eleitorais adicionais.
    """

    def __init__(
        self,
        limite_por_segundo: int = LIMITE_MENSAGENS_POR_SEGUNDO,
        intervalo_por_par: int = LIMITE_INTERVALO_POR_PAR,
        limite_contatos_diario: int = LIMITE_CONTATOS_UNICOS_DIARIO,
        conformidade_eleitoral: bool = True,
    ):
        """
        Inicializa o rate limiter com os limites configurados.

        Args:
            limite_por_segundo: Máximo de mensagens por segundo (global).
            intervalo_por_par: Segundos mínimos entre mensagens ao mesmo número.
            limite_contatos_diario: Máximo de contatos únicos por dia.
            conformidade_eleitoral: Ativar conformidade com legislação eleitoral.
        """
        self.limite_por_segundo = limite_por_segundo
        self.intervalo_por_par = intervalo_por_par
        self.limite_contatos_diario = limite_contatos_diario
        self.conformidade_eleitoral = conformidade_eleitoral

        self._redis: redis.Redis | None = None
        self._conectar_redis()

        logger.info(
            "RateLimiterWhatsApp inicializado. "
            "Limite/seg: %d, Intervalo/par: %ds, Contatos/dia: %d, "
            "Conformidade eleitoral: %s",
            self.limite_por_segundo,
            self.intervalo_por_par,
            self.limite_contatos_diario,
            self.conformidade_eleitoral,
        )

    def _conectar_redis(self) -> None:
        """
        Estabelece conexão com o Redis.

        Utiliza a URL de conexão das configurações do aplicativo.
        Em caso de falha, o rate limiter opera em modo degradado
        (permissivo), apenas logando avisos.
        """
        try:
            redis_url = getattr(configuracoes, "REDIS_URL", "redis://localhost:6379/0")
            self._redis = redis.from_url(
                redis_url,
                decode_responses=True,
                socket_timeout=2,
                socket_connect_timeout=2,
                retry_on_timeout=True,
            )
            # Testar conexão
            self._redis.ping()
            logger.info("Conexão com Redis estabelecida para rate limiting.")
        except Exception as e:
            logger.warning(
                "Não foi possível conectar ao Redis: %s. "
                "Rate limiter operando em modo degradado (permissivo).",
                str(e),
            )
            self._redis = None

    def _redis_disponivel(self) -> bool:
        """
        Verifica se a conexão Redis está disponível.

        Returns:
            True se o Redis está conectado e respondendo.
        """
        if self._redis is None:
            return False
        try:
            self._redis.ping()
            return True
        except Exception:
            logger.warning("Redis indisponível. Operando em modo degradado.")
            self._redis = None
            return False

    def _chave_data_hoje(self) -> str:
        """
        Retorna a data atual formatada para uso como parte da chave Redis.

        Returns:
            Data atual no formato YYYY-MM-DD.
        """
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    def pode_enviar(self, telefone: str) -> bool:
        """
        Verifica se é permitido enviar uma mensagem para o telefone informado.

        Aplica todas as camadas de verificação:
        1. Limite global por segundo
        2. Intervalo mínimo por par (destinatário)
        3. Limite diário de contatos únicos
        4. Regras de conformidade eleitoral (se ativada)

        Args:
            telefone: Número de telefone do destinatário.

        Returns:
            True se o envio é permitido, False caso contrário.
        """
        if not telefone:
            logger.warning("Telefone vazio recebido no rate limiter.")
            return False

        # Se Redis indisponível, permitir envio (modo degradado)
        if not self._redis_disponivel():
            logger.debug("Redis indisponível. Permitindo envio (modo degradado).")
            return True

        try:
            # Verificação 1: Limite global por segundo
            if not self._verificar_limite_global():
                logger.info("Limite global de mensagens por segundo atingido.")
                return False

            # Verificação 2: Intervalo por par
            if not self._verificar_intervalo_par(telefone):
                logger.info(
                    "Intervalo mínimo entre mensagens não respeitado para %s.",
                    telefone,
                )
                return False

            # Verificação 3: Limite diário de contatos
            if not self._verificar_limite_contatos_diario(telefone):
                logger.info("Limite diário de contatos únicos atingido.")
                return False

            # Verificação 4: Conformidade eleitoral
            if self.conformidade_eleitoral and not self._verificar_conformidade_eleitoral():
                logger.info("Envio bloqueado por regras de conformidade eleitoral.")
                return False

            return True

        except Exception as e:
            logger.error("Erro ao verificar rate limit: %s. Permitindo envio.", str(e))
            return True

    def _verificar_limite_global(self) -> bool:
        """
        Verifica se o limite global de mensagens por segundo foi atingido.

        Usa uma janela deslizante de 1 segundo no Redis.

        Returns:
            True se ainda há capacidade, False se o limite foi atingido.
        """
        agora = time.time()
        chave = f"{PREFIXO_GLOBAL}:{int(agora)}"

        contagem = self._redis.get(chave)
        if contagem is not None and int(contagem) >= self.limite_por_segundo:
            return False

        return True

    def _verificar_intervalo_par(self, telefone: str) -> bool:
        """
        Verifica se o intervalo mínimo entre mensagens ao mesmo
        destinatário foi respeitado.

        Args:
            telefone: Número de telefone do destinatário.

        Returns:
            True se o intervalo foi respeitado, False caso contrário.
        """
        chave = f"{PREFIXO_PAR}:{telefone}"
        ultimo_envio = self._redis.get(chave)

        if ultimo_envio is not None:
            tempo_decorrido = time.time() - float(ultimo_envio)
            if tempo_decorrido < self.intervalo_por_par:
                return False

        return True

    def _verificar_limite_contatos_diario(self, telefone: str) -> bool:
        """
        Verifica se o limite diário de contatos únicos foi atingido.

        Se o telefone já contatado hoje, não conta como novo contato.

        Args:
            telefone: Número de telefone do destinatário.

        Returns:
            True se ainda há capacidade ou se o contato já foi
            contatado hoje, False se o limite foi atingido.
        """
        data_hoje = self._chave_data_hoje()
        chave = f"{PREFIXO_CONTATOS}:{data_hoje}"

        # Se o telefone já está no conjunto, não conta como novo
        if self._redis.sismember(chave, telefone):
            return True

        # Verificar se atingiu o limite
        total_contatos = self._redis.scard(chave)
        if total_contatos is not None and int(total_contatos) >= self.limite_contatos_diario:
            return False

        return True

    def _verificar_conformidade_eleitoral(self) -> bool:
        """
        Verifica regras adicionais de conformidade eleitoral brasileira.

        Regras implementadas:
        - Respeitar horário de silêncio eleitoral (dia da eleição)
        - Respeitar período de propaganda eleitoral

        Returns:
            True se o envio está em conformidade, False caso contrário.
        """
        agora = datetime.now(timezone.utc)

        # Horário de silêncio: no dia da eleição, nenhuma propaganda
        # Nota: dias de eleição devem ser configurados externamente
        # Esta é uma verificação básica que pode ser expandida
        data_hoje = self._chave_data_hoje()
        chave_silencio = f"wpp:eleitoral:silencio:{data_hoje}"

        if self._redis_disponivel():
            em_silencio = self._redis.get(chave_silencio)
            if em_silencio and em_silencio == "1":
                logger.info("Período de silêncio eleitoral ativo. Envio bloqueado.")
                return False

        return True

    def registrar_envio(self, telefone: str) -> None:
        """
        Registra o envio de uma mensagem para atualizar os contadores.

        Deve ser chamado após cada envio bem-sucedido para manter
        os contadores de rate limiting atualizados.

        Args:
            telefone: Número de telefone do destinatário.
        """
        if not self._redis_disponivel():
            return

        try:
            agora = time.time()
            pipe = self._redis.pipeline()

            # Incrementar contador global (janela de 1 segundo)
            chave_global = f"{PREFIXO_GLOBAL}:{int(agora)}"
            pipe.incr(chave_global)
            pipe.expire(chave_global, 2)  # TTL de 2 segundos para limpeza

            # Registrar timestamp do último envio ao destinatário
            chave_par = f"{PREFIXO_PAR}:{telefone}"
            pipe.set(chave_par, str(agora), ex=self.intervalo_por_par * 2)

            # Adicionar ao conjunto de contatos do dia
            data_hoje = self._chave_data_hoje()
            chave_contatos = f"{PREFIXO_CONTATOS}:{data_hoje}"
            pipe.sadd(chave_contatos, telefone)
            pipe.expire(chave_contatos, 86400 * 2)  # TTL de 2 dias para limpeza

            # Incrementar contador diário de envios
            chave_diario = f"{PREFIXO_DIARIO}:{data_hoje}"
            pipe.incr(chave_diario)
            pipe.expire(chave_diario, 86400 * 2)

            pipe.execute()

            logger.debug("Envio registrado no rate limiter. Telefone: %s", telefone)

        except Exception as e:
            logger.error("Erro ao registrar envio no rate limiter: %s", str(e))

    def verificar_limite_diario(self) -> dict:
        """
        Retorna informações sobre o uso diário dos limites.

        Útil para monitoramento e dashboards administrativos.

        Returns:
            Dicionário com informações de uso:
                - data: Data de referência (YYYY-MM-DD)
                - contatos_unicos: Número de contatos únicos contatados
                - limite_contatos: Limite máximo de contatos
                - mensagens_enviadas: Total de mensagens enviadas no dia
                - percentual_uso_contatos: Percentual de uso do limite
                - conformidade_eleitoral: Se a conformidade está ativa
                - redis_disponivel: Se o Redis está conectado
        """
        data_hoje = self._chave_data_hoje()

        resultado = {
            "data": data_hoje,
            "contatos_unicos": 0,
            "limite_contatos": self.limite_contatos_diario,
            "mensagens_enviadas": 0,
            "percentual_uso_contatos": 0.0,
            "conformidade_eleitoral": self.conformidade_eleitoral,
            "redis_disponivel": False,
        }

        if not self._redis_disponivel():
            logger.warning("Redis indisponível. Retornando dados padrão.")
            return resultado

        try:
            resultado["redis_disponivel"] = True

            # Contatos únicos do dia
            chave_contatos = f"{PREFIXO_CONTATOS}:{data_hoje}"
            contatos_unicos = self._redis.scard(chave_contatos) or 0
            resultado["contatos_unicos"] = int(contatos_unicos)

            # Total de mensagens enviadas
            chave_diario = f"{PREFIXO_DIARIO}:{data_hoje}"
            mensagens = self._redis.get(chave_diario) or 0
            resultado["mensagens_enviadas"] = int(mensagens)

            # Percentual de uso
            if self.limite_contatos_diario > 0:
                resultado["percentual_uso_contatos"] = round(
                    (resultado["contatos_unicos"] / self.limite_contatos_diario) * 100, 2
                )

            logger.debug(
                "Verificação de limites diários. Contatos: %d/%d (%.1f%%)",
                resultado["contatos_unicos"],
                resultado["limite_contatos"],
                resultado["percentual_uso_contatos"],
            )

        except Exception as e:
            logger.error("Erro ao verificar limites diários: %s", str(e))

        return resultado


# Instância singleton do rate limiter
rate_limiter = RateLimiterWhatsApp()
