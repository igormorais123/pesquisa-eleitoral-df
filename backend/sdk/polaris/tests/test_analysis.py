# POLARIS SDK - Tests para Analysis
# Testes unitários dos módulos de análise

import pytest
from ..analysis.quantitative import QuantitativeAnalyzer
from ..analysis.qualitative import QualitativeAnalyzer
from ..analysis.statistical import StatisticalTests
from ..analysis.projections import ProjectionsEngine
from ..analysis.recommendations import RecommendationsEngine
from ..models.report import SegmentedAnalysis


# Dados de teste
RESPOSTAS_TESTE = [
    {
        "eleitor_id": f"e{i}",
        "pergunta_id": "Q1",
        "resposta_texto": f"Candidato {i % 3}",
        "resposta_estruturada": f"Candidato {i % 3}",
        "fluxo_cognitivo": {
            "emocao": {
                "emocao_primaria": ["esperanca", "frustacao", "indiferenca"][i % 3],
                "intensidade": 5 + (i % 5)
            },
            "decisao": {
                "tom": "neutro",
                "certeza_numerica": 5 + (i % 5)
            }
        }
    }
    for i in range(100)
]

ELEITORES_TESTE = [
    {
        "id": f"e{i}",
        "nome": f"Eleitor {i}",
        "regiao_administrativa": f"regiao_{i % 5}",
        "orientacao_politica": ["esquerda", "centro", "direita"][i % 3]
    }
    for i in range(100)
]


class TestQuantitativeAnalyzer:
    """Testes para análise quantitativa."""

    def test_calcular_intencao_voto(self):
        analyzer = QuantitativeAnalyzer(RESPOSTAS_TESTE)
        resultado = analyzer.calcular_intencao_voto("Q1")

        assert "distribuicao" in resultado
        assert "lider" in resultado
        assert resultado["total_respostas"] == 100

    def test_estatisticas_descritivas_categorica(self):
        analyzer = QuantitativeAnalyzer(RESPOSTAS_TESTE)
        stats = analyzer.calcular_estatisticas_descritivas("resposta_estruturada", "categorica")

        assert stats.n == 100
        assert len(stats.frequencias_absolutas) > 0
        assert sum(stats.frequencias_relativas.values()) - 1.0 < 0.01

    def test_tabela_cruzada(self):
        analyzer = QuantitativeAnalyzer(RESPOSTAS_TESTE)
        tabela = analyzer.tabela_cruzada(
            variavel_linha="orientacao_politica",
            variavel_coluna="resposta_estruturada",
            eleitores=ELEITORES_TESTE
        )

        assert "tabela" in tabela
        assert "totais_linha" in tabela
        assert tabela["total_geral"] == 100

    def test_resumo_geral(self):
        analyzer = QuantitativeAnalyzer(RESPOSTAS_TESTE)
        resumo = analyzer.resumo_geral()

        assert resumo["total_respostas"] == 100
        assert resumo["total_eleitores"] == 100


class TestQualitativeAnalyzer:
    """Testes para análise qualitativa."""

    def test_analise_sentimento(self):
        analyzer = QualitativeAnalyzer(RESPOSTAS_TESTE)
        sentimento = analyzer.analise_sentimento()

        assert sentimento.total_respostas == 100
        assert sentimento.positivo + sentimento.neutro + sentimento.negativo - 100 < 1

    def test_nuvem_palavras_data(self):
        # Adicionar textos mais elaborados
        respostas_texto = [
            {"resposta_texto": "Segurança pública é o maior problema do DF", "pergunta_id": "Q1"},
            {"resposta_texto": "Precisamos de mais segurança nas ruas", "pergunta_id": "Q1"},
            {"resposta_texto": "A saúde está muito ruim", "pergunta_id": "Q1"},
            {"resposta_texto": "Educação precisa melhorar muito", "pergunta_id": "Q1"},
        ]

        analyzer = QualitativeAnalyzer(respostas_texto)
        nuvem = analyzer.nuvem_palavras_data("Q1")

        assert len(nuvem) > 0
        assert all("text" in item and "value" in item for item in nuvem)


class TestStatisticalTests:
    """Testes para testes estatísticos."""

    def test_teste_chi_quadrado(self):
        tests = StatisticalTests()

        observados = {"A": 40, "B": 35, "C": 25}
        resultado = tests.teste_chi_quadrado(observados)

        assert resultado.teste == "chi-quadrado"
        assert resultado.estatistica >= 0
        assert 0 <= resultado.valor_p <= 1

    def test_margem_erro(self):
        tests = StatisticalTests()

        me = tests.margem_erro(n=500, proporcao=0.42, nivel_confianca=0.95)

        assert "margem_erro" in me
        assert me["limite_inferior"] < 42
        assert me["limite_superior"] > 42

    def test_teste_proporcoes(self):
        tests = StatisticalTests()

        resultado = tests.teste_proporcoes(
            n1=200, p1=0.42,
            n2=200, p2=0.38
        )

        assert resultado.teste == "z-proporcoes"
        assert resultado.intervalo_confianca is not None

    def test_correlacao(self):
        tests = StatisticalTests()

        x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        y = [2, 4, 5, 4, 5, 8, 7, 9, 8, 10]

        resultado = tests.correlacao(x, y)

        assert resultado.teste == "correlacao-pearson"
        assert -1 <= resultado.estatistica <= 1


class TestProjectionsEngine:
    """Testes para motor de projeções."""

    def test_gerar_cenarios(self):
        engine = ProjectionsEngine(
            intencao_voto={"Candidato A": 42, "Candidato B": 28, "Candidato C": 15},
            margem_erro=0.03,
            indecisos=15
        )

        cenarios = engine.gerar_cenarios()

        assert len(cenarios) == 4  # otimista, realista, pessimista, volatilidade
        assert any(c.tipo.value == "otimista" for c in cenarios)
        assert any(c.tipo.value == "realista" for c in cenarios)

    def test_simulacao_monte_carlo(self):
        engine = ProjectionsEngine(
            intencao_voto={"A": 45, "B": 35, "C": 20},
            margem_erro=0.03,
            indecisos=0
        )

        resultado = engine.simulacao_monte_carlo(n_simulacoes=1000)

        assert resultado["n_simulacoes"] == 1000
        assert "probabilidade_vitoria" in resultado
        assert sum(resultado["probabilidade_vitoria"].values()) - 100 < 5  # Aprox 100%


class TestRecommendationsEngine:
    """Testes para motor de recomendações."""

    def test_gerar_recomendacoes_lider(self):
        engine = RecommendationsEngine(
            intencao_voto={"Candidato A": 42, "Candidato B": 28},
            rejeicao={"Candidato A": 15, "Candidato B": 25},
            analise_segmentada=[],
            analise_sentimento={"positivo": 40, "neutro": 35, "negativo": 25}
        )

        recomendacoes = engine.gerar_recomendacoes(cliente="Candidato A")

        assert len(recomendacoes) > 0
        # Líder deve receber recomendação de consolidar
        assert any("consolidar" in r.titulo.lower() or "liderança" in r.titulo.lower()
                  for r in recomendacoes)

    def test_get_sumario(self):
        engine = RecommendationsEngine(
            intencao_voto={"A": 45, "B": 35},
            rejeicao={"A": 10, "B": 20},
            analise_segmentada=[],
            analise_sentimento={"positivo": 50, "neutro": 30, "negativo": 20}
        )

        engine.gerar_recomendacoes()
        sumario = engine.get_sumario()

        assert "recomendações" in sumario.lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
