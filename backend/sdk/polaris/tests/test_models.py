# POLARIS SDK - Tests para Models
# Testes unitários dos modelos Pydantic

import pytest
from datetime import datetime

from ..models.research import (
    ProblemDefinition,
    Hypothesis,
    ResearchObjectives,
    Scope,
    ResearchState,
    ResearchPhase,
    Question,
    QuestionType,
    Questionnaire,
    QuestionBlock,
)
from ..models.sample import (
    SamplingStrategy,
    SamplingType,
    SampleConfig,
    SelectedSample,
    SelectedVoter,
)
from ..models.response import (
    CognitiveFlow,
    AttentionFilter,
    ConfirmationBias,
    EmotionalReaction,
    Decision,
    Response,
    InterviewResult,
)
from ..models.report import (
    DescriptiveStats,
    Recommendation,
    RecommendationCategory,
    RecommendationPriority,
)


class TestHypothesis:
    """Testes para modelo Hypothesis."""

    def test_criar_hipotese_valida(self):
        h = Hypothesis(
            id="H1",
            enunciado="Eleitores de alta renda votam na direita",
            variavel_independente="renda",
            variavel_dependente="orientacao_politica",
            tipo="correlacional"
        )
        assert h.id == "H1"
        assert h.testada == False
        assert h.valor_p is None

    def test_hipotese_testada(self):
        h = Hypothesis(
            id="H1",
            enunciado="Teste",
            variavel_independente="x",
            variavel_dependente="y",
            tipo="causal",
            testada=True,
            valor_p=0.03,
            tamanho_efeito=0.45
        )
        assert h.testada == True
        assert h.valor_p < 0.05


class TestResearchState:
    """Testes para modelo ResearchState."""

    def test_criar_estado_inicial(self):
        state = ResearchState(
            id="test-123",
            tema="Eleições DF 2026"
        )
        assert state.fase == ResearchPhase.DEFINICAO_PROBLEMATICA
        assert state.problematica is None

    def test_atualizar_fase(self):
        state = ResearchState(id="test", tema="Teste")
        state.atualizar_fase(ResearchPhase.METODOLOGIA)
        assert state.fase == ResearchPhase.METODOLOGIA
        assert len(state.checkpoints) == 1

    def test_to_dict_from_dict(self):
        state = ResearchState(
            id="test",
            tema="Teste",
            fase=ResearchPhase.COLETA
        )
        data = state.to_dict()
        restored = ResearchState.from_dict(data)
        assert restored.id == state.id
        assert restored.fase == state.fase


class TestSampleConfig:
    """Testes para cálculo amostral."""

    def test_calcular_tamanho_amostra_padrao(self):
        config = SampleConfig(
            populacao=1000,
            nivel_confianca=0.95,
            margem_erro=0.03
        )
        n = config.calcular_tamanho_amostra()
        assert 400 < n < 600  # Aproximadamente 516 para esses parâmetros

    def test_calcular_tamanho_amostra_alta_precisao(self):
        config = SampleConfig(
            populacao=1000,
            nivel_confianca=0.99,
            margem_erro=0.02
        )
        n = config.calcular_tamanho_amostra()
        assert n > 700  # Maior precisão exige maior amostra

    def test_z_score_niveis(self):
        config_90 = SampleConfig(nivel_confianca=0.90)
        config_95 = SampleConfig(nivel_confianca=0.95)
        config_99 = SampleConfig(nivel_confianca=0.99)

        assert config_90.z_score == 1.645
        assert config_95.z_score == 1.96
        assert config_99.z_score == 2.576


class TestSelectedSample:
    """Testes para SelectedSample."""

    def test_adicionar_eleitor(self):
        strategy = SamplingStrategy(tipo=SamplingType.ALEATORIA_SIMPLES)
        amostra = SelectedSample(id="amostra-1", estrategia=strategy)

        voter = SelectedVoter(
            id="eleitor-1",
            nome="João Silva",
            estrato={"regiao": "asa_norte"},
            ordem_selecao=1
        )
        amostra.adicionar_eleitor(voter)

        assert amostra.total_selecionados == 1
        assert "regiao" in amostra.distribuicao_estratos

    def test_get_ids_eleitores(self):
        strategy = SamplingStrategy(tipo=SamplingType.ALEATORIA_SIMPLES)
        amostra = SelectedSample(id="test", estrategia=strategy)

        for i in range(3):
            amostra.adicionar_eleitor(SelectedVoter(
                id=f"eleitor-{i}",
                nome=f"Eleitor {i}",
                estrato={},
                ordem_selecao=i
            ))

        ids = amostra.get_ids_eleitores()
        assert len(ids) == 3
        assert "eleitor-0" in ids


class TestCognitiveFlow:
    """Testes para fluxo cognitivo."""

    def test_criar_fluxo_completo(self):
        fluxo = CognitiveFlow(
            atencao=AttentionFilter(
                nivel="alta",
                justificativa="Interesse político alto",
                baseado_em=["interesse_politico"],
                passa_filtro=True
            ),
            vies=ConfirmationBias(
                confirma_crencas=True,
                nivel_ameaca=2,
                crencas_afetadas=[],
                vieses_ativados=[],
                justificativa="Alinhado com valores"
            ),
            emocao=EmotionalReaction(
                emocao_primaria="esperanca",
                intensidade=7,
                emocoes_secundarias=[],
                gatilhos=["proposta positiva"],
                justificativa="Tema ressonante"
            ),
            decisao=Decision(
                resposta_texto="Apoio totalmente",
                resposta_estruturada="5",
                tom="positivo",
                certeza="certo",
                certeza_numerica=8,
                pode_mudar_opiniao=False,
                condicoes_mudanca=[],
                justificativa_interna="Alinhamento de valores"
            )
        )

        assert fluxo.atencao.passa_filtro == True
        assert fluxo.emocao.intensidade == 7
        assert fluxo.decisao.certeza_numerica == 8


class TestInterviewResult:
    """Testes para resultado de entrevista."""

    def test_finalizar_entrevista(self):
        result = InterviewResult(
            eleitor_id="eleitor-1",
            eleitor_nome="Maria",
            questionario_id="q1",
            total_perguntas=5
        )

        # Simular respostas
        for i in range(5):
            fluxo = CognitiveFlow(
                atencao=AttentionFilter(nivel="media", justificativa="", passa_filtro=True),
                vies=ConfirmationBias(confirma_crencas=True, nivel_ameaca=0, justificativa=""),
                emocao=EmotionalReaction(
                    emocao_primaria="esperanca" if i % 2 == 0 else "frustacao",
                    intensidade=5 + i,
                    justificativa=""
                ),
                decisao=Decision(
                    resposta_texto="Resposta",
                    tom="neutro",
                    certeza="moderado",
                    certeza_numerica=5,
                    justificativa_interna=""
                )
            )

            resp = Response(
                eleitor_id="eleitor-1",
                pergunta_id=f"Q{i+1}",
                fluxo_cognitivo=fluxo,
                resposta_texto="Resposta"
            )
            result.adicionar_resposta(resp)

        result.finalizar()

        assert result.completa == True
        assert result.total_respondidas == 5
        assert result.emocao_predominante is not None


class TestRecommendation:
    """Testes para recomendações."""

    def test_criar_recomendacao(self):
        rec = Recommendation(
            id="R1",
            categoria=RecommendationCategory.POSICIONAMENTO,
            prioridade=RecommendationPriority.ALTA,
            titulo="Consolidar liderança",
            diagnostico="Líder com margem apertada",
            recomendacao="Evitar riscos desnecessários",
            justificativa="Manter vantagem",
            risco_nao_seguir="Perder liderança",
            acoes_especificas=["Ação 1", "Ação 2"],
            dificuldade_implementacao=2
        )

        assert rec.categoria == RecommendationCategory.POSICIONAMENTO
        assert rec.prioridade == RecommendationPriority.ALTA
        assert len(rec.acoes_especificas) == 2


class TestQuestionnaire:
    """Testes para questionário."""

    def test_total_perguntas(self):
        bloco1 = QuestionBlock(
            id="B1",
            nome="Bloco 1",
            perguntas=[
                Question(id="Q1", texto="Pergunta 1", tipo=QuestionType.ABERTA),
                Question(id="Q2", texto="Pergunta 2", tipo=QuestionType.DICOTOMICA, opcoes=["Sim", "Não"])
            ]
        )
        bloco2 = QuestionBlock(
            id="B2",
            nome="Bloco 2",
            perguntas=[
                Question(id="Q3", texto="Pergunta 3", tipo=QuestionType.MULTIPLA_ESCOLHA, opcoes=["A", "B", "C"])
            ]
        )

        q = Questionnaire(
            titulo="Teste",
            blocos=[bloco1, bloco2]
        )

        assert q.total_perguntas == 3
        assert len(q.todas_perguntas) == 3


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
