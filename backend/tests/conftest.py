"""
Fixtures compartilhadas para testes.
"""

import pytest
from fastapi.testclient import TestClient

from app.core.seguranca import criar_token_acesso
from app.main import app


@pytest.fixture
def client():
    """Cliente de teste FastAPI."""
    return TestClient(app)


@pytest.fixture
def auth_headers():
    """Headers com token JWT válido para autenticação."""
    token = criar_token_acesso(
        dados={
            "sub": "user-001",
            "nome": "Professor Igor",
            "papel": "admin",
        }
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def eleitor_exemplo():
    """Dados de exemplo para criar um eleitor."""
    return {
        "nome": "Maria da Silva",
        "idade": 35,
        "genero": "feminino",
        "cor_raca": "parda",
        "regiao_administrativa": "Ceilândia",
        "cluster_socioeconomico": "G3_media_baixa",
        "escolaridade": "Ensino médio completo",
        "profissao": "Comerciante",
        "ocupacao_vinculo": "Autônoma",
        "renda_salarios_minimos": "2-3",
        "religiao": "Católica",
        "estado_civil": "Casada",
        "filhos": 2,
        "orientacao_politica": "centro",
        "posicao_bolsonaro": "neutro",
        "interesse_politico": "medio",
        "tolerancia_nuance": "media",
        "estilo_decisao": "economico",
        "valores": ["família", "trabalho"],
        "preocupacoes": ["saúde", "educação"],
        "vieses_cognitivos": ["viés de confirmação"],
        "medos": ["desemprego"],
        "fontes_informacao": ["TV", "WhatsApp"],
        "susceptibilidade_desinformacao": 5,
        "voto_facultativo": False,
        "conflito_identitario": False,
        "historia_resumida": "Comerciante há 10 anos em Ceilândia.",
        "instrucao_comportamental": "Responde de forma prática e direta.",
    }


@pytest.fixture
def entrevista_exemplo():
    """Dados de exemplo para criar uma entrevista."""
    return {
        "titulo": "Pesquisa Teste",
        "descricao": "Pesquisa de teste automatizado",
        "tipo": "quantitativa",
        "perguntas": [
            {
                "id": "p1",
                "texto": "Em quem você votaria para governador?",
                "tipo": "escolha_unica",
                "opcoes": ["Candidato A", "Candidato B", "Nulo/Branco"],
                "obrigatoria": True,
            }
        ],
        "eleitores_ids": [],
    }
