"""
Testes dos endpoints de eleitores.
"""


class TestListarEleitores:
    """Testes de listagem de eleitores."""

    def test_listar_eleitores(self, client, auth_headers):
        """Testa listagem básica de eleitores."""
        response = client.get("/api/v1/eleitores/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "eleitores" in data
        assert "total" in data
        assert "pagina" in data
        assert "por_pagina" in data

    def test_listar_eleitores_paginacao(self, client, auth_headers):
        """Testa paginação de eleitores."""
        response = client.get(
            "/api/v1/eleitores/?pagina=1&por_pagina=10",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["pagina"] == 1
        assert data["por_pagina"] == 10

    def test_listar_eleitores_filtro_idade(self, client, auth_headers):
        """Testa filtro por idade."""
        response = client.get(
            "/api/v1/eleitores/?idade_min=18&idade_max=30",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        for eleitor in data["eleitores"]:
            assert 18 <= eleitor["idade"] <= 30

    def test_listar_eleitores_filtro_genero(self, client, auth_headers):
        """Testa filtro por gênero."""
        response = client.get(
            "/api/v1/eleitores/?generos=feminino",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        for eleitor in data["eleitores"]:
            assert eleitor["genero"] == "feminino"


class TestEstatisticas:
    """Testes de estatísticas de eleitores."""

    def test_obter_estatisticas(self, client, auth_headers):
        """Testa endpoint de estatísticas."""
        response = client.get("/api/v1/eleitores/estatisticas", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "por_genero" in data
        assert "por_cluster" in data

    def test_obter_opcoes_filtros(self, client, auth_headers):
        """Testa endpoint de opções de filtros."""
        response = client.get("/api/v1/eleitores/opcoes-filtros", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestEleitorIndividual:
    """Testes de operações em eleitor individual."""

    def test_obter_eleitor_nao_encontrado(self, client, auth_headers):
        """Testa busca de eleitor inexistente."""
        response = client.get(
            "/api/v1/eleitores/eleitor-inexistente",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_obter_eleitor_existente(self, client, auth_headers):
        """Testa busca de eleitor existente."""
        # Primeiro, lista para pegar um ID válido
        response = client.get(
            "/api/v1/eleitores/?por_pagina=1",
            headers=auth_headers,
        )
        data = response.json()
        if data["eleitores"]:
            eleitor_id = data["eleitores"][0]["id"]
            response = client.get(
                f"/api/v1/eleitores/{eleitor_id}",
                headers=auth_headers,
            )
            assert response.status_code == 200
            eleitor = response.json()
            assert eleitor["id"] == eleitor_id


class TestCRUDEleitor:
    """Testes de CRUD de eleitor."""

    def test_criar_eleitor(self, client, auth_headers, eleitor_exemplo):
        """Testa criação de eleitor."""
        response = client.post(
            "/api/v1/eleitores/",
            headers=auth_headers,
            json=eleitor_exemplo,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["nome"] == eleitor_exemplo["nome"]
        assert "id" in data

    def test_criar_eleitor_dados_invalidos(self, client, auth_headers):
        """Testa criação com dados inválidos."""
        response = client.post(
            "/api/v1/eleitores/",
            headers=auth_headers,
            json={"nome": "X"},  # Dados incompletos
        )
        assert response.status_code == 422  # Validation error

    def test_deletar_eleitor_nao_encontrado(self, client, auth_headers):
        """Testa deleção de eleitor inexistente."""
        response = client.delete(
            "/api/v1/eleitores/eleitor-inexistente",
            headers=auth_headers,
        )
        assert response.status_code == 404


class TestSelecaoEleitores:
    """Testes de seleção de eleitores."""

    def test_obter_ids(self, client, auth_headers):
        """Testa obtenção de IDs de eleitores."""
        response = client.get("/api/v1/eleitores/ids", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "ids" in data
        assert "total" in data
        assert isinstance(data["ids"], list)

    def test_selecionar_por_filtros(self, client, auth_headers):
        """Testa seleção de eleitores por filtros."""
        response = client.post(
            "/api/v1/eleitores/selecionar",
            headers=auth_headers,
            json={"clusters": ["G1_alta", "G2_media_alta"]},
        )
        assert response.status_code == 200
        data = response.json()
        assert "ids_selecionados" in data
        assert "total_selecionados" in data
