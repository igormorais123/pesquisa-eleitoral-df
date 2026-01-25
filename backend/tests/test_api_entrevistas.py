"""
Testes dos endpoints de entrevistas.
"""

import pytest


class TestListarEntrevistas:
    """Testes de listagem de entrevistas."""

    def test_listar_entrevistas(self, client, auth_headers):
        """Testa listagem básica de entrevistas."""
        response = client.get("/api/v1/entrevistas/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "entrevistas" in data
        assert "total" in data

    def test_listar_entrevistas_paginacao(self, client, auth_headers):
        """Testa paginação de entrevistas."""
        response = client.get(
            "/api/v1/entrevistas/?pagina=1&por_pagina=5",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["pagina"] == 1
        assert data["por_pagina"] == 5


class TestCRUDEntrevista:
    """Testes de CRUD de entrevistas."""

    def test_criar_entrevista(self, client, auth_headers):
        """Testa criação de entrevista."""
        # Primeiro, obtém alguns IDs de eleitores
        response = client.get("/api/v1/eleitores/ids", headers=auth_headers)
        ids_data = response.json()

        if not ids_data["ids"]:
            pytest.skip("Nenhum eleitor disponível para teste")

        eleitor_ids = ids_data["ids"][:3]  # Pega até 3 eleitores

        entrevista_data = {
            "titulo": "Pesquisa de Teste Automatizado",
            "descricao": "Entrevista criada por teste automatizado",
            "tipo": "quantitativa",
            "perguntas": [
                {
                    "texto": "Em uma escala de 1 a 10, como você avalia a gestão atual?",
                    "tipo": "escala_likert",
                    "obrigatoria": True,
                    "escala_min": 1,
                    "escala_max": 10,
                }
            ],
            "eleitores_ids": eleitor_ids,
        }

        response = client.post(
            "/api/v1/entrevistas/",
            headers=auth_headers,
            json=entrevista_data,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["titulo"] == entrevista_data["titulo"]
        assert "id" in data
        assert data["status"] == "rascunho"

    def test_criar_entrevista_sem_eleitores(self, client, auth_headers):
        """Testa criação de entrevista sem eleitores (deve falhar)."""
        entrevista_data = {
            "titulo": "Pesquisa Inválida",
            "tipo": "quantitativa",
            "perguntas": [
                {
                    "texto": "Pergunta de teste para validação",
                    "tipo": "aberta",
                    "obrigatoria": True,
                }
            ],
            "eleitores_ids": [],  # Vazio
        }

        response = client.post(
            "/api/v1/entrevistas/",
            headers=auth_headers,
            json=entrevista_data,
        )
        assert response.status_code == 422  # Validation error

    def test_obter_entrevista_nao_encontrada(self, client, auth_headers):
        """Testa busca de entrevista inexistente."""
        response = client.get(
            "/api/v1/entrevistas/entrevista-inexistente",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_deletar_entrevista_nao_encontrada(self, client, auth_headers):
        """Testa deleção de entrevista inexistente."""
        response = client.delete(
            "/api/v1/entrevistas/entrevista-inexistente",
            headers=auth_headers,
        )
        assert response.status_code == 404


class TestExecucaoEntrevista:
    """Testes de execução de entrevistas."""

    def test_obter_progresso_entrevista_inexistente(self, client, auth_headers):
        """Testa progresso de entrevista inexistente."""
        response = client.get(
            "/api/v1/entrevistas/entrevista-inexistente/progresso",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_pausar_entrevista_nao_executando(self, client, auth_headers):
        """Testa pausar entrevista que não está executando."""
        response = client.post(
            "/api/v1/entrevistas/entrevista-inexistente/pausar",
            headers=auth_headers,
        )
        assert response.status_code == 400


class TestEstimativaCusto:
    """Testes de estimativa de custo."""

    def test_estimar_custo(self, client, auth_headers):
        """Testa estimativa de custo."""
        response = client.post(
            "/api/v1/entrevistas/estimar-custo?total_perguntas=5&total_eleitores=100",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "custo_estimado" in data
        assert "custo_maximo_opus" in data
        assert "total_chamadas" in data
        assert data["total_perguntas"] == 5
        assert data["total_eleitores"] == 100

    def test_estimar_custo_com_proporcao_opus(self, client, auth_headers):
        """Testa estimativa de custo com proporção Opus."""
        response = client.post(
            "/api/v1/entrevistas/estimar-custo?total_perguntas=10&total_eleitores=50&proporcao_opus=0.5",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["chamadas_opus"] == 250  # 50% de 500 chamadas
        assert data["chamadas_sonnet"] == 250

    def test_estimar_custo_parametros_invalidos(self, client, auth_headers):
        """Testa estimativa com parâmetros inválidos."""
        response = client.post(
            "/api/v1/entrevistas/estimar-custo?total_perguntas=0&total_eleitores=100",
            headers=auth_headers,
        )
        assert response.status_code == 422  # Validation error


class TestRespostas:
    """Testes de respostas de entrevistas."""

    def test_listar_respostas_entrevista_inexistente(self, client, auth_headers):
        """Testa listar respostas de entrevista inexistente."""
        response = client.get(
            "/api/v1/entrevistas/entrevista-inexistente/respostas",
            headers=auth_headers,
        )
        # Deve retornar lista vazia, não 404
        assert response.status_code == 200
        data = response.json()
        assert data["respostas"] == []
        assert data["total"] == 0
