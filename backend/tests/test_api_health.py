"""
Testes de endpoints básicos e autenticação.
"""


class TestHealth:
    """Testes de health check e rota raiz."""

    def test_raiz(self, client):
        """Testa rota raiz da API."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["nome"] == "API Pesquisa Eleitoral DF 2026"
        assert data["status"] == "online"
        assert "versao" in data

    def test_health_check(self, client):
        """Testa endpoint de health check."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_docs_disponivel(self, client):
        """Testa se documentação está disponível."""
        response = client.get("/docs")
        assert response.status_code == 200


class TestAutenticacao:
    """Testes de autenticação."""

    def test_login_sucesso(self, client):
        """Testa login com credenciais válidas."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "usuario": "professorigor",
                "senha": "professorigor",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "usuario" in data

    def test_login_usuario_invalido(self, client):
        """Testa login com usuário inválido."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "usuario": "usuario_errado",
                "senha": "senha_errada",
            },
        )
        assert response.status_code == 401

    def test_login_senha_invalida(self, client):
        """Testa login com senha inválida."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "usuario": "professorigor",
                "senha": "senha_errada",
            },
        )
        assert response.status_code == 401

    def test_acesso_sem_token(self, client):
        """Testa acesso a rota protegida sem token."""
        response = client.get("/api/v1/eleitores/")
        assert response.status_code == 401

    def test_acesso_com_token_invalido(self, client):
        """Testa acesso com token inválido."""
        response = client.get(
            "/api/v1/eleitores/",
            headers={"Authorization": "Bearer token_invalido"},
        )
        assert response.status_code == 401
