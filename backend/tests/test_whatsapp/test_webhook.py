"""
Testes para o endpoint de webhook WhatsApp — Oráculo Eleitoral.

Testa rotas GET e POST em /api/v1/whatsapp/webhook,
verificação de token, recebimento de mensagens e validação de assinatura.
"""

import hashlib
import hmac
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient


# =============================================
# Fixtures
# =============================================


@pytest.fixture
def verify_token():
    """Token de verificação padrão usado nos testes."""
    return "oraculo_verify_2026"


@pytest.fixture
def app_secret():
    """App secret usado para assinar payloads nos testes."""
    return "test_app_secret_123"


@pytest.fixture
def payload_texto():
    """Payload padrão do Meta com mensagem de texto."""
    return {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "123",
                "changes": [
                    {
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "5511999999999",
                                "phone_number_id": "123456",
                            },
                            "contacts": [
                                {
                                    "profile": {"name": "Teste"},
                                    "wa_id": "5561999999999",
                                }
                            ],
                            "messages": [
                                {
                                    "from": "5561999999999",
                                    "id": "wamid.abc123",
                                    "timestamp": "1706745600",
                                    "type": "text",
                                    "text": {"body": "Olá"},
                                }
                            ],
                        },
                        "field": "messages",
                    }
                ],
            }
        ],
    }


@pytest.fixture
def payload_audio():
    """Payload padrão do Meta com mensagem de áudio."""
    return {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "123",
                "changes": [
                    {
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "5511999999999",
                                "phone_number_id": "123456",
                            },
                            "contacts": [
                                {
                                    "profile": {"name": "Teste"},
                                    "wa_id": "5561999999999",
                                }
                            ],
                            "messages": [
                                {
                                    "from": "5561999999999",
                                    "id": "wamid.audio456",
                                    "timestamp": "1706745600",
                                    "type": "audio",
                                    "audio": {
                                        "id": "media_audio_789",
                                        "mime_type": "audio/ogg",
                                    },
                                }
                            ],
                        },
                        "field": "messages",
                    }
                ],
            }
        ],
    }


def _gerar_assinatura(payload_bytes: bytes, secret: str) -> str:
    """Gera assinatura HMAC-SHA256 no formato esperado pelo Meta."""
    digest = hmac.new(
        secret.encode("utf-8"),
        payload_bytes,
        hashlib.sha256,
    ).hexdigest()
    return f"sha256={digest}"


def _criar_contato_mock(ativo: bool = True):
    """Cria um mock de ContatoWhatsApp."""
    contato = MagicMock()
    contato.id = 1
    contato.telefone = "5561999999999"
    contato.nome = "Teste"
    contato.ativo = ativo
    return contato


def _criar_conversa_mock():
    """Cria um mock de ConversaWhatsApp."""
    conversa = MagicMock()
    conversa.id = 10
    conversa.thread_id = "abc-123"
    conversa.status = "ativa"
    return conversa


# =============================================
# Testes
# =============================================


@pytest.mark.asyncio
@patch("app.api.rotas.whatsapp.whatsapp_servico")
async def test_verificacao_webhook_sucesso(mock_servico, verify_token):
    """GET /api/v1/whatsapp/webhook com token correto retorna challenge."""
    # Configurar mock para retornar o challenge
    mock_servico.verificar_webhook.return_value = "challenge_abc_123"

    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(
            "/api/v1/whatsapp/webhook",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": verify_token,
                "hub.challenge": "challenge_abc_123",
            },
        )

    assert response.status_code == 200
    assert response.text == "challenge_abc_123"
    mock_servico.verificar_webhook.assert_called_once_with(
        "subscribe", verify_token, "challenge_abc_123"
    )


@pytest.mark.asyncio
@patch("app.api.rotas.whatsapp.whatsapp_servico")
async def test_verificacao_webhook_token_invalido(mock_servico):
    """GET /api/v1/whatsapp/webhook com token errado retorna 403."""
    # Configurar mock para retornar None (token inválido)
    mock_servico.verificar_webhook.return_value = None

    from app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(
            "/api/v1/whatsapp/webhook",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": "token_errado",
                "hub.challenge": "challenge_qualquer",
            },
        )

    assert response.status_code == 403
    assert "inválido" in response.json()["detail"].lower()


@pytest.mark.asyncio
@patch("app.api.rotas.whatsapp.processar_mensagem_agente", create=True)
@patch("app.api.rotas.whatsapp._obter_ou_criar_conversa")
@patch("app.api.rotas.whatsapp._buscar_contato")
@patch("app.api.rotas.whatsapp.get_db")
@patch("app.api.rotas.whatsapp.whatsapp_servico")
async def test_receber_mensagem_texto(
    mock_servico,
    mock_get_db,
    mock_buscar_contato,
    mock_obter_conversa,
    mock_processar,
    payload_texto,
    app_secret,
):
    """POST /api/v1/whatsapp/webhook com payload de texto cria mensagem."""
    # Configurar mocks
    mock_servico.verificar_assinatura.return_value = True
    mock_servico.marcar_como_lida = AsyncMock()

    contato = _criar_contato_mock(ativo=True)
    mock_buscar_contato.return_value = contato

    conversa = _criar_conversa_mock()
    mock_obter_conversa.return_value = conversa

    # Mock da sessão do banco de dados
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    mock_db.commit = AsyncMock()

    async def override_get_db():
        yield mock_db

    from app.main import app
    from app.db.session import get_db

    app.dependency_overrides[get_db] = override_get_db

    try:
        payload_bytes = json.dumps(payload_texto).encode("utf-8")
        assinatura = _gerar_assinatura(payload_bytes, app_secret)

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.post(
                "/api/v1/whatsapp/webhook",
                content=payload_bytes,
                headers={
                    "Content-Type": "application/json",
                    "X-Hub-Signature-256": assinatura,
                },
            )

        assert response.status_code == 200
        assert response.json()["status"] == "ok"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
@patch("app.api.rotas.whatsapp._obter_ou_criar_conversa")
@patch("app.api.rotas.whatsapp._buscar_contato")
@patch("app.api.rotas.whatsapp.get_db")
@patch("app.api.rotas.whatsapp.whatsapp_servico")
async def test_receber_mensagem_audio(
    mock_servico,
    mock_get_db,
    mock_buscar_contato,
    mock_obter_conversa,
    payload_audio,
    app_secret,
):
    """POST /api/v1/whatsapp/webhook com payload de áudio processa mensagem."""
    # Configurar mocks
    mock_servico.verificar_assinatura.return_value = True
    mock_servico.marcar_como_lida = AsyncMock()

    contato = _criar_contato_mock(ativo=True)
    mock_buscar_contato.return_value = contato

    conversa = _criar_conversa_mock()
    mock_obter_conversa.return_value = conversa

    # Mock da sessão do banco de dados
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    mock_db.commit = AsyncMock()

    async def override_get_db():
        yield mock_db

    from app.main import app
    from app.db.session import get_db

    app.dependency_overrides[get_db] = override_get_db

    try:
        payload_bytes = json.dumps(payload_audio).encode("utf-8")
        assinatura = _gerar_assinatura(payload_bytes, app_secret)

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.post(
                "/api/v1/whatsapp/webhook",
                content=payload_bytes,
                headers={
                    "Content-Type": "application/json",
                    "X-Hub-Signature-256": assinatura,
                },
            )

        assert response.status_code == 200
        assert response.json()["status"] == "ok"
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
@patch("app.api.rotas.whatsapp.whatsapp_servico")
async def test_webhook_sem_assinatura(mock_servico, payload_texto):
    """POST /api/v1/whatsapp/webhook sem X-Hub-Signature-256 retorna erro."""
    # Configurar mock para rejeitar assinatura vazia
    mock_servico.verificar_assinatura.return_value = False

    # Mock da sessão do banco de dados
    mock_db = AsyncMock()

    async def override_get_db():
        yield mock_db

    from app.main import app
    from app.db.session import get_db

    app.dependency_overrides[get_db] = override_get_db

    try:
        payload_bytes = json.dumps(payload_texto).encode("utf-8")

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.post(
                "/api/v1/whatsapp/webhook",
                content=payload_bytes,
                headers={"Content-Type": "application/json"},
                # Sem X-Hub-Signature-256
            )

        # O endpoint retorna 401 para assinatura inválida
        assert response.status_code == 401
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
@patch("app.api.rotas.whatsapp.whatsapp_servico")
@patch("app.api.rotas.whatsapp.get_db")
async def test_status_endpoint(mock_get_db, mock_servico):
    """GET /api/v1/whatsapp/status retorna dicionário de status."""
    mock_servico.configurado = True

    # Mock da sessão do banco de dados com resultados de consulta
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar.return_value = 5
    mock_db.execute = AsyncMock(return_value=mock_result)

    async def override_get_db():
        yield mock_db

    from app.main import app
    from app.db.session import get_db

    app.dependency_overrides[get_db] = override_get_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/api/v1/whatsapp/status")

        assert response.status_code == 200
        data = response.json()

        # Verificar que o retorno contém os campos esperados
        assert "status" in data
        assert "whatsapp_configurado" in data
        assert "redis_conectado" in data
        assert "agentes_ativos" in data
        assert "contatos_ativos" in data
        assert "mensagens_hoje" in data
        assert data["status"] == "online"
    finally:
        app.dependency_overrides.clear()
