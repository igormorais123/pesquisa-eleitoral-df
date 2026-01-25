# POLARIS SDK - Tests para Sampling
# Testes unitários do motor de amostragem

import pytest
from ..research.sampling import SamplingEngine, calculate_sample_size
from ..models.sample import SamplingStrategy, SamplingType, SampleConfig, Quota


# Dados de teste
ELEITORES_TESTE = [
    {"id": f"e{i}", "nome": f"Eleitor {i}", "regiao": f"regiao_{i % 5}", "idade": 20 + i}
    for i in range(100)
]


class TestCalculateSampleSize:
    """Testes para cálculo de tamanho amostral."""

    def test_amostra_populacao_1000(self):
        n = calculate_sample_size(
            population=1000,
            confidence_level=0.95,
            margin_error=0.03
        )
        # Para pop=1000, conf=95%, erro=3%, n deve ser ~516
        assert 500 < n < 550

    def test_amostra_populacao_grande(self):
        n = calculate_sample_size(
            population=1000000,
            confidence_level=0.95,
            margin_error=0.03
        )
        # Para população grande, n converge para ~1068
        assert 1000 < n < 1100

    def test_margem_erro_menor_requer_maior_amostra(self):
        n1 = calculate_sample_size(population=1000, margin_error=0.05)
        n2 = calculate_sample_size(population=1000, margin_error=0.03)
        n3 = calculate_sample_size(population=1000, margin_error=0.01)

        assert n1 < n2 < n3

    def test_confianca_maior_requer_maior_amostra(self):
        n90 = calculate_sample_size(population=1000, confidence_level=0.90)
        n95 = calculate_sample_size(population=1000, confidence_level=0.95)
        n99 = calculate_sample_size(population=1000, confidence_level=0.99)

        assert n90 < n95 < n99


class TestSamplingEngine:
    """Testes para o motor de amostragem."""

    def test_amostragem_aleatoria_simples(self):
        engine = SamplingEngine(ELEITORES_TESTE)
        selecionados = engine.amostragem_aleatoria_simples(20)

        assert len(selecionados) == 20
        assert len(set(e["id"] for e in selecionados)) == 20  # Sem duplicatas

    def test_amostragem_sistematica(self):
        engine = SamplingEngine(ELEITORES_TESTE)
        selecionados = engine.amostragem_sistematica(20)

        assert len(selecionados) == 20

    def test_amostragem_estratificada_proporcional(self):
        engine = SamplingEngine(ELEITORES_TESTE)
        selecionados = engine.amostragem_estratificada_proporcional(50, "regiao")

        assert len(selecionados) == 50

        # Verificar que todas as regiões estão representadas
        regioes = set(e["regiao"] for e in selecionados)
        assert len(regioes) == 5  # 5 regiões no dataset

    def test_amostragem_por_cluster(self):
        engine = SamplingEngine(ELEITORES_TESTE)
        selecionados = engine.amostragem_por_cluster(
            tamanho=50,
            variavel_cluster="regiao",
            n_clusters=2
        )

        # Deve ter eleitores de apenas 2 regiões
        regioes = set(e["regiao"] for e in selecionados)
        assert len(regioes) == 2

    def test_calcular_distribuicao(self):
        engine = SamplingEngine(ELEITORES_TESTE)
        dist = engine.calcular_distribuicao("regiao")

        assert len(dist) == 5  # 5 regiões
        total_proporcao = sum(p for _, p in dist.values())
        assert abs(total_proporcao - 1.0) < 0.01  # Soma deve ser ~1

    def test_selecionar_com_estrategia(self):
        engine = SamplingEngine(ELEITORES_TESTE)

        strategy = SamplingStrategy(
            tipo=SamplingType.ESTRATIFICADA_PROPORCIONAL,
            variaveis_estratificacao=["regiao"]
        )
        strategy.tamanho_amostra = 30

        amostra = engine.selecionar(strategy)

        assert amostra.total_selecionados == 30
        assert "regiao" in amostra.distribuicao_estratos


class TestSamplingValidation:
    """Testes para validação de amostra."""

    def test_validar_representatividade(self):
        engine = SamplingEngine(ELEITORES_TESTE)

        strategy = SamplingStrategy(
            tipo=SamplingType.ESTRATIFICADA_PROPORCIONAL,
            variaveis_estratificacao=["regiao"]
        )
        strategy.tamanho_amostra = 50

        amostra = engine.selecionar(strategy)

        resultado = engine.validar_representatividade(
            amostra=amostra,
            variaveis=["regiao"],
            tolerancia=0.10  # 10% de tolerância
        )

        assert "representa_populacao" in resultado
        assert "detalhes" in resultado


class TestQuotas:
    """Testes para amostragem por cotas."""

    def test_amostragem_por_cotas(self):
        engine = SamplingEngine(ELEITORES_TESTE)

        cotas = [
            Quota(variavel="regiao", categoria="regiao_0", proporcao_alvo=0.2, quantidade_alvo=4),
            Quota(variavel="regiao", categoria="regiao_1", proporcao_alvo=0.2, quantidade_alvo=4),
            Quota(variavel="regiao", categoria="regiao_2", proporcao_alvo=0.2, quantidade_alvo=4),
        ]

        selecionados = engine.amostragem_por_cotas(cotas)

        # Verificar que cotas foram preenchidas
        for cota in cotas:
            count = sum(1 for e in selecionados if e["regiao"] == cota.categoria)
            assert count == cota.quantidade_alvo


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
