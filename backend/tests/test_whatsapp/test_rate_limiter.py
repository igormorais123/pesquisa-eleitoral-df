"""
Testes para o rate limiter de mensagens WhatsApp — Oráculo Eleitoral.

Verifica limites globais, por destinatário, janelas de cooldown
e degradação graciosa quando Redis está indisponível.
"""

import sys
import time
from unittest.mock import MagicMock, patch

import pytest


# =============================================
# Pré-importar o módulo para que o patch funcione corretamente.
# O 'redis' é importado no topo de rate_limiter.py.
# Precisamos garantir que o módulo redis mock esteja no sys.modules
# antes que rate_limiter seja importado.
# =============================================

# Inserir mock do redis no sys.modules caso não esteja instalado
_redis_mock_module = MagicMock()
if "redis" not in sys.modules:
    sys.modules["redis"] = _redis_mock_module

# Agora podemos importar o módulo com segurança
import app.servicos.rate_limiter as rate_limiter_mod  # noqa: E402
from app.servicos.rate_limiter import RateLimiterWhatsApp  # noqa: E402


# =============================================
# Fixtures
# =============================================


@pytest.fixture
def mock_redis():
    """Mock do cliente Redis com comportamento padrão."""
    redis_mock = MagicMock()
    redis_mock.ping.return_value = True
    redis_mock.get.return_value = None
    redis_mock.sismember.return_value = False
    redis_mock.scard.return_value = 0
    redis_mock.pipeline.return_value = MagicMock()
    return redis_mock


@pytest.fixture
def limiter_com_redis(mock_redis):
    """Cria instância do RateLimiterWhatsApp com Redis mockado."""
    with patch.object(rate_limiter_mod, "redis", create=True) as mock_redis_module:
        mock_redis_module.from_url.return_value = mock_redis

        limiter = RateLimiterWhatsApp(
            limite_por_segundo=80,
            intervalo_por_par=6,
            limite_contatos_diario=1000,
            conformidade_eleitoral=False,  # desabilitar para simplificar testes
        )
        # Garantir que o mock está atribuído corretamente
        limiter._redis = mock_redis
        yield limiter


@pytest.fixture
def limiter_sem_redis():
    """Cria instância do RateLimiterWhatsApp sem Redis (modo degradado)."""
    with patch.object(rate_limiter_mod, "redis", create=True) as mock_redis_module:
        mock_redis_module.from_url.side_effect = Exception("Redis indisponível")

        limiter = RateLimiterWhatsApp(
            limite_por_segundo=80,
            intervalo_por_par=6,
            limite_contatos_diario=1000,
            conformidade_eleitoral=False,
        )
        # Forçar Redis como None (simulando falha de conexão)
        limiter._redis = None
        yield limiter


# =============================================
# Testes
# =============================================


def test_permitir_primeira_mensagem(limiter_com_redis, mock_redis):
    """Primeira mensagem para um número deve ser permitida."""
    # Redis retorna None para contador global e ultimo envio (primeira mensagem)
    mock_redis.get.return_value = None
    mock_redis.sismember.return_value = False
    mock_redis.scard.return_value = 0

    resultado = limiter_com_redis.pode_enviar("5561999999999")

    assert resultado is True


def test_bloquear_excesso_global(limiter_com_redis, mock_redis):
    """Deve bloquear quando o limite global de mensagens por segundo é excedido."""
    # Simular que o contador global já atingiu o limite
    mock_redis.get.return_value = "80"  # Limite global atingido
    mock_redis.sismember.return_value = False
    mock_redis.scard.return_value = 0

    resultado = limiter_com_redis.pode_enviar("5561999999999")

    assert resultado is False


def test_bloquear_mesmo_destinatario_rapido(limiter_com_redis, mock_redis):
    """Deve bloquear envio ao mesmo destinatário dentro da janela de 6 segundos."""
    agora = time.time()

    def mock_get(chave):
        if "global" in chave:
            return None  # Limite global ok
        if "par" in chave:
            return str(agora - 2)  # Último envio há 2 segundos (< 6s)
        return None

    mock_redis.get.side_effect = mock_get
    mock_redis.sismember.return_value = True  # Já contatado hoje
    mock_redis.scard.return_value = 1

    resultado = limiter_com_redis.pode_enviar("5561999999999")

    assert resultado is False


def test_permitir_destinatario_apos_janela(limiter_com_redis, mock_redis):
    """Deve permitir envio ao mesmo destinatário após janela de cooldown."""
    agora = time.time()

    def mock_get(chave):
        if "global" in chave:
            return None  # Limite global ok
        if "par" in chave:
            return str(agora - 10)  # Último envio há 10 segundos (> 6s)
        return None

    mock_redis.get.side_effect = mock_get
    mock_redis.sismember.return_value = True  # Já contatado hoje
    mock_redis.scard.return_value = 1

    resultado = limiter_com_redis.pode_enviar("5561999999999")

    assert resultado is True


def test_fallback_sem_redis(limiter_sem_redis):
    """Deve permitir envio quando Redis está indisponível (degradação graciosa)."""
    resultado = limiter_sem_redis.pode_enviar("5561999999999")

    # No modo degradado (sem Redis), o limiter deve ser permissivo
    assert resultado is True


def test_bloquear_limite_contatos_diario(limiter_com_redis, mock_redis):
    """Deve bloquear quando o limite diário de contatos únicos é atingido."""
    mock_redis.get.return_value = None  # Limite global ok
    mock_redis.sismember.return_value = False  # Contato novo
    mock_redis.scard.return_value = 1000  # Limite diário atingido

    resultado = limiter_com_redis.pode_enviar("5561888888888")

    assert resultado is False


def test_permitir_contato_ja_contatado_hoje(limiter_com_redis, mock_redis):
    """Contato já contatado hoje não conta como novo (não bloqueia por limite diário)."""
    agora = time.time()

    def mock_get(chave):
        if "global" in chave:
            return None
        if "par" in chave:
            return str(agora - 10)  # Último envio há 10 segundos
        return None

    mock_redis.get.side_effect = mock_get
    mock_redis.sismember.return_value = True  # Já contatado hoje
    mock_redis.scard.return_value = 1000  # Limite diário atingido

    resultado = limiter_com_redis.pode_enviar("5561999999999")

    # Deve permitir porque o contato já foi contatado hoje
    assert resultado is True


def test_telefone_vazio_bloqueado(limiter_com_redis):
    """Telefone vazio deve ser rejeitado."""
    resultado = limiter_com_redis.pode_enviar("")

    assert resultado is False


def test_registrar_envio_sem_redis(limiter_sem_redis):
    """Registrar envio sem Redis não deve gerar exceção."""
    # Deve executar sem erro, mesmo sem Redis
    limiter_sem_redis.registrar_envio("5561999999999")


def test_verificar_limite_diario_sem_redis(limiter_sem_redis):
    """Verificar limite diário sem Redis retorna dados padrão."""
    resultado = limiter_sem_redis.verificar_limite_diario()

    assert resultado["redis_disponivel"] is False
    assert resultado["contatos_unicos"] == 0
    assert resultado["mensagens_enviadas"] == 0
    assert resultado["limite_contatos"] == 1000


def test_verificar_limite_diario_com_redis(limiter_com_redis, mock_redis):
    """Verificar limite diário com Redis retorna dados do Redis."""
    mock_redis.scard.return_value = 50
    mock_redis.get.return_value = "200"

    resultado = limiter_com_redis.verificar_limite_diario()

    assert resultado["redis_disponivel"] is True
    assert resultado["contatos_unicos"] == 50
    assert resultado["mensagens_enviadas"] == 200
    assert resultado["percentual_uso_contatos"] == 5.0  # 50/1000 * 100
