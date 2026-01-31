"""
Testes para as ferramentas (tools) dos agentes — Oráculo Eleitoral.

Testa individualmente cada ferramenta do LangChain (@tool) utilizada
pelos agentes especializados do sistema multi-agente.
Todas as dependências de banco de dados são mockadas.
"""

import json
import sys
from unittest.mock import MagicMock, patch

import pytest


# =============================================
# Garantir que langchain_core está disponível (mock se necessário).
# As ferramentas usam @tool de langchain_core.tools.
# =============================================

_langchain_needs_mock = "langchain_core" not in sys.modules

if _langchain_needs_mock:
    # Criar mock completo para langchain_core.tools.tool decorator
    _mock_langchain = MagicMock()

    def _mock_tool_decorator(func=None, *args, **kwargs):
        """Decorator mock que preserva a função original e adiciona .invoke()."""
        if func is None:
            return lambda f: _mock_tool_decorator(f, *args, **kwargs)

        # Adicionar método invoke que chama a função com os kwargs do dict
        def invoke(input_dict):
            return func(**input_dict)

        func.invoke = invoke
        return func

    _mock_langchain.tools.tool = _mock_tool_decorator
    sys.modules["langchain_core"] = _mock_langchain
    sys.modules["langchain_core.tools"] = _mock_langchain.tools
    # Atribuir o decorator mock diretamente
    sys.modules["langchain_core.tools"].tool = _mock_tool_decorator


# =============================================
# Fixtures
# =============================================


@pytest.fixture
def mock_session():
    """Mock de sessão SQLAlchemy para ferramentas que acessam o banco."""
    session = MagicMock()
    session.close = MagicMock()
    return session


@pytest.fixture
def eleitores_mock():
    """Lista de eleitores mockados para simulação de consultas."""
    eleitores = []
    for i in range(5):
        eleitor = MagicMock()
        eleitor.nome = f"Eleitor {i}"
        eleitor.idade = 25 + i * 10
        eleitor.genero = "M" if i % 2 == 0 else "F"
        eleitor.regiao = "Ceilândia"
        eleitor.escolaridade = "Ensino médio completo"
        eleitor.cluster = "G3_media_baixa"
        eleitores.append(eleitor)
    return eleitores


# =============================================
# Testes — Dados Eleitorais
# =============================================


@patch("app.agentes.ferramentas.dados_eleitorais._get_sync_session")
def test_consultar_eleitores(mock_get_session, mock_session, eleitores_mock):
    """consultar_eleitores retorna JSON válido com dados de eleitores."""
    # Configurar mock da sessão e resultado da query
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = eleitores_mock
    mock_session.execute.return_value = mock_result
    mock_get_session.return_value = mock_session

    from app.agentes.ferramentas.dados_eleitorais import consultar_eleitores

    # Usar filtro que não depende de atributos específicos do modelo ORM
    # (evita erros de atributo no select/where do SQLAlchemy)
    resultado_str = consultar_eleitores.invoke({"filtros": "genero=M"})
    resultado = json.loads(resultado_str)

    assert "total_eleitores" in resultado
    assert resultado["total_eleitores"] == 5
    assert "distribuicao_genero" in resultado
    assert "distribuicao_faixa_etaria" in resultado
    assert "filtros_aplicados" in resultado
    assert resultado["filtros_aplicados"]["genero"] == "M"
    mock_session.close.assert_called_once()


# =============================================
# Testes — Simulação
# =============================================


def test_simular_cenario():
    """simular_cenario retorna dados de cenário simulado."""
    from app.agentes.ferramentas.simulacao import simular_cenario

    resultado_str = simular_cenario.invoke({
        "candidato": "Candidato A",
        "variacao_pct": 5.0,
        "regioes": "Ceilândia,Taguatinga",
    })
    resultado = json.loads(resultado_str)

    assert "candidato" in resultado
    assert resultado["candidato"] == "Candidato A"
    assert "cenario_simulado" in resultado
    assert "intencao_base_pct" in resultado["cenario_simulado"]
    assert "intencao_ajustada_pct" in resultado["cenario_simulado"]
    assert "projecao" in resultado
    assert "impacto_por_regiao" in resultado


# =============================================
# Testes — Análise Social
# =============================================


def test_buscar_noticias():
    """buscar_noticias retorna lista de notícias simuladas."""
    from app.agentes.ferramentas.analise_social import buscar_noticias

    resultado_str = buscar_noticias.invoke({"query": "eleições DF 2026"})
    resultado = json.loads(resultado_str)

    assert "noticias" in resultado
    assert isinstance(resultado["noticias"], list)
    assert len(resultado["noticias"]) > 0
    assert "total_resultados" in resultado
    assert resultado["total_resultados"] > 0

    # Verificar estrutura de cada notícia
    noticia = resultado["noticias"][0]
    assert "titulo" in noticia
    assert "fonte" in noticia
    assert "data_publicacao" in noticia
    assert "resumo" in noticia
    assert "url" in noticia
    assert "relevancia" in noticia

    # A query deve estar refletida nos resultados
    assert "query" in resultado
    assert resultado["query"] == "eleições DF 2026"


# =============================================
# Testes — Conteúdo
# =============================================


def test_gerar_post_rede_social():
    """gerar_post_rede_social retorna dicionário com versões para cada rede."""
    from app.agentes.ferramentas.conteudo import gerar_post_rede_social

    resultado_str = gerar_post_rede_social.invoke({
        "tema": "proposta de saúde pública",
        "tom": "informativo",
    })
    resultado = json.loads(resultado_str)

    assert "tema" in resultado
    assert resultado["tema"] == "proposta de saúde pública"
    assert "tom" in resultado
    assert resultado["tom"] == "informativo"
    assert "versoes" in resultado

    versoes = resultado["versoes"]
    # Deve ter versões para as principais redes
    assert "instagram" in versoes
    assert "facebook" in versoes
    assert "twitter_x" in versoes

    # Verificar estrutura da versão Instagram
    instagram = versoes["instagram"]
    assert "texto_principal" in instagram
    assert "limite_caracteres" in instagram
    assert "hashtags_sugeridas" in instagram
    assert isinstance(instagram["hashtags_sugeridas"], list)


# =============================================
# Testes — Relatório
# =============================================


def test_gerar_relatorio_resumo():
    """gerar_relatorio_resumo retorna relatório estruturado."""
    from app.agentes.ferramentas.relatorio import gerar_relatorio_resumo

    dados_entrada = json.dumps({
        "candidatos": [
            {"nome": "Candidato A", "intencao": 35},
            {"nome": "Candidato B", "intencao": 28},
        ],
        "data": "2026-01-30",
    })

    resultado_str = gerar_relatorio_resumo.invoke({"dados": dados_entrada})
    resultado = json.loads(resultado_str)

    assert "cabecalho" in resultado
    assert "sumario_executivo" in resultado
    assert "metricas_chave" in resultado
    assert "analise_detalhada" in resultado
    assert "graficos_sugeridos" in resultado
    assert "recomendacoes" in resultado
    assert "rodape" in resultado

    # Verificar cabeçalho
    cabecalho = resultado["cabecalho"]
    assert "titulo" in cabecalho
    assert "data_geracao" in cabecalho
    assert "classificacao" in cabecalho

    # Verificar métricas
    metricas = resultado["metricas_chave"]
    assert "kpis" in metricas
    assert isinstance(metricas["kpis"], list)
    assert len(metricas["kpis"]) > 0


def test_preparar_dados_pdf():
    """preparar_dados_pdf retorna dados prontos para geração de PDF."""
    from app.agentes.ferramentas.relatorio import preparar_dados_pdf

    resultado_str = preparar_dados_pdf.invoke({"tipo": "semanal"})
    resultado = json.loads(resultado_str)

    assert "metadados_pdf" in resultado
    assert "layout" in resultado
    assert "estrutura_secoes" in resultado
    assert "dados_secoes" in resultado
    assert "tabelas_modelo" in resultado

    # Verificar metadados
    metadados = resultado["metadados_pdf"]
    assert metadados["tipo_relatorio"] == "semanal"
    assert "titulo" in metadados
    assert "data_geracao" in metadados
    assert metadados["classificacao"] == "CONFIDENCIAL"

    # Verificar layout
    layout = resultado["layout"]
    assert layout["formato"] == "A4"
    assert "cores" in layout
    assert "margens_cm" in layout

    # Verificar estrutura de seções
    assert isinstance(resultado["estrutura_secoes"], list)
    assert len(resultado["estrutura_secoes"]) > 0

    # Verificar tabelas modelo
    assert isinstance(resultado["tabelas_modelo"], list)
    assert len(resultado["tabelas_modelo"]) > 0


def test_preparar_dados_pdf_tipo_executivo():
    """preparar_dados_pdf com tipo executivo retorna seções reduzidas."""
    from app.agentes.ferramentas.relatorio import preparar_dados_pdf

    resultado_str = preparar_dados_pdf.invoke({"tipo": "executivo"})
    resultado = json.loads(resultado_str)

    assert resultado["metadados_pdf"]["tipo_relatorio"] == "executivo"
    assert "Cenário Atual em 1 Página" in resultado["estrutura_secoes"]
    assert "KPIs Principais" in resultado["estrutura_secoes"]
