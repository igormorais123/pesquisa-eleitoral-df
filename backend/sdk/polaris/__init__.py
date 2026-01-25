# POLARIS SDK - Political Analysis & Research Intelligence System
# Sistema de Pesquisa Eleitoral Científica com Agentes de IA

"""
POLARIS SDK - Sistema de pesquisa eleitoral científica que orquestra dois modelos de IA:
- Claude Opus 4.5: Cientista Político Sênior (metodologia, análise, relatórios)
- Claude Sonnet 4: Voz dos Eleitores (respostas autênticas via 4 etapas cognitivas)

Uso básico:
    from polaris import PolarisSDK

    sdk = PolarisSDK(api_key="sk-ant-...")

    # Executar pesquisa completa
    async for progress in sdk.executar_pesquisa(
        tema="Intenção de voto para Governador do DF 2026",
        amostra_tamanho=500
    ):
        print(f"{progress.fase}: {progress.percentual}%")

    # Obter relatório
    relatorio = sdk.get_relatorio()
    relatorio.salvar("relatorio.html")
"""

__version__ = "1.0.0"
__author__ = "POLARIS Team"
__license__ = "MIT"

# Core
from .core.coordinator import PolarisCoordinator, ResearchProgress
from .core.scientist import PoliticalScientist
from .core.respondents import VoterRespondent
from .core.context_manager import ContextManager

# Models
from .models.research import (
    ProblemDefinition,
    MethodologyDesign,
    Questionnaire,
    Question,
    QuestionType,
    ResearchState,
    ResearchPhase,
)
from .models.sample import (
    SamplingStrategy,
    SamplingType,
    SampleConfig,
    SelectedSample,
)
from .models.response import (
    Response,
    CognitiveFlow,
    InterviewResult,
)
from .models.report import (
    HTMLReport,
    ResearchReport,
    Recommendation,
    ProjectionScenario,
)

# Research
from .research.methodology import MethodologyBuilder, METHODOLOGY_TEMPLATES
from .research.sampling import SamplingEngine, calculate_sample_size
from .research.questionnaire import (
    QuestionnaireBuilder,
    criar_questionario_eleitoral_padrao,
)
from .research.validation import ResearchValidator

# Analysis
from .analysis.quantitative import QuantitativeAnalyzer
from .analysis.qualitative import QualitativeAnalyzer
from .analysis.statistical import StatisticalTests
from .analysis.projections import ProjectionsEngine
from .analysis.recommendations import RecommendationsEngine

# Reports
from .reports.html_generator import HTMLReportGenerator

# Utils
from .utils.checkpoint import CheckpointManager
from .utils.persistence import PersistenceManager
from .utils.logging import setup_logging, get_logger


class PolarisSDK:
    """
    Interface principal do POLARIS SDK.

    Fornece API simplificada para executar pesquisas eleitorais completas.
    """

    def __init__(
        self,
        api_key: str = None,
        checkpoint_dir: str = "./checkpoints",
        data_dir: str = "./data",
        log_level: str = "INFO"
    ):
        """
        Inicializa o SDK.

        Args:
            api_key: Chave da API Anthropic (ou usa ANTHROPIC_API_KEY env var)
            checkpoint_dir: Diretório para checkpoints
            data_dir: Diretório para dados
            log_level: Nível de logging
        """
        # Configurar logging
        setup_logging(level=log_level)
        self.logger = get_logger("sdk")

        # Inicializar coordenador
        self.coordinator = PolarisCoordinator(
            api_key=api_key,
            checkpoint_dir=checkpoint_dir
        )

        # Inicializar persistência
        self.persistence = PersistenceManager(data_dir=data_dir)

        # Validador
        self.validator = ResearchValidator()

        self.logger.info("POLARIS SDK inicializado")

    def carregar_eleitores(self, caminho: str) -> int:
        """
        Carrega banco de eleitores.

        Args:
            caminho: Caminho para arquivo JSON com eleitores

        Returns:
            Número de eleitores carregados
        """
        return self.coordinator.carregar_eleitores(caminho)

    async def executar_pesquisa(
        self,
        tema: str,
        amostra_tamanho: int = None,
        nivel_confianca: float = 0.95,
        margem_erro: float = 0.03,
        cliente: str = ""
    ):
        """
        Executa ciclo completo de pesquisa.

        Args:
            tema: Tema da pesquisa
            amostra_tamanho: Tamanho da amostra (ou calcula automaticamente)
            nivel_confianca: Nível de confiança estatística
            margem_erro: Margem de erro desejada
            cliente: Nome do candidato/cliente

        Yields:
            ResearchProgress: Progresso da pesquisa
        """
        self.logger.info(f"Iniciando pesquisa: {tema}")

        async for progress in self.coordinator.executar_pesquisa(
            tema=tema,
            amostra_tamanho=amostra_tamanho,
            nivel_confianca=nivel_confianca,
            margem_erro=margem_erro,
            cliente=cliente
        ):
            yield progress

    def retomar_pesquisa(self, checkpoint_id: str):
        """
        Retoma pesquisa de um checkpoint.

        Args:
            checkpoint_id: ID do checkpoint
        """
        return self.coordinator.retomar_pesquisa(checkpoint_id)

    def get_relatorio(self) -> HTMLReport:
        """Retorna o relatório gerado."""
        return self.coordinator.get_relatorio()

    def get_statistics(self) -> dict:
        """Retorna estatísticas de uso."""
        return self.coordinator.get_statistics()

    def validar_pesquisa(
        self,
        problematica: ProblemDefinition,
        metodologia: MethodologyDesign,
        estrategia: SamplingStrategy,
        questionario: Questionnaire,
        populacao_total: int
    ) -> dict:
        """
        Valida componentes da pesquisa.

        Returns:
            Relatório de validação
        """
        return self.validator.validar_pesquisa_completa(
            problematica=problematica,
            metodologia=metodologia,
            estrategia=estrategia,
            questionario=questionario,
            populacao_total=populacao_total
        )


# Exports públicos
__all__ = [
    # SDK Principal
    "PolarisSDK",
    "PolarisCoordinator",
    "ResearchProgress",

    # Modelos Claude
    "PoliticalScientist",
    "VoterRespondent",

    # Modelos de Dados
    "ProblemDefinition",
    "MethodologyDesign",
    "Questionnaire",
    "Question",
    "QuestionType",
    "ResearchState",
    "ResearchPhase",
    "SamplingStrategy",
    "SamplingType",
    "SampleConfig",
    "SelectedSample",
    "Response",
    "CognitiveFlow",
    "InterviewResult",
    "HTMLReport",
    "ResearchReport",
    "Recommendation",
    "ProjectionScenario",

    # Builders
    "MethodologyBuilder",
    "QuestionnaireBuilder",
    "SamplingEngine",

    # Análise
    "QuantitativeAnalyzer",
    "QualitativeAnalyzer",
    "StatisticalTests",
    "ProjectionsEngine",
    "RecommendationsEngine",

    # Relatórios
    "HTMLReportGenerator",

    # Validação
    "ResearchValidator",

    # Utilitários
    "CheckpointManager",
    "PersistenceManager",
    "ContextManager",
    "setup_logging",
    "get_logger",
    "calculate_sample_size",
    "criar_questionario_eleitoral_padrao",

    # Constantes
    "METHODOLOGY_TEMPLATES",
]
