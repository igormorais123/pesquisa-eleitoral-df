# POLARIS SDK - Models
# Modelos Pydantic para o sistema de pesquisa eleitoral

from .research import (
    ProblemDefinition,
    Hypothesis,
    ResearchObjectives,
    Scope,
    ResearchState,
)
from .sample import (
    SamplingStrategy,
    StratificationConfig,
    SampleConfig,
    SelectedSample,
)
from .response import (
    CognitiveFlow,
    AttentionFilter,
    ConfirmationBias,
    EmotionalReaction,
    Decision,
    Response,
    InterviewResult,
)
from .report import (
    DescriptiveStats,
    InferentialResults,
    SegmentedAnalysis,
    ContentAnalysis,
    SentimentAnalysis,
    ClusterAnalysis,
    ProjectionScenario,
    Recommendation,
    HTMLReport,
    ResearchReport,
)

__all__ = [
    # Research
    "ProblemDefinition",
    "Hypothesis",
    "ResearchObjectives",
    "Scope",
    "ResearchState",
    # Sample
    "SamplingStrategy",
    "StratificationConfig",
    "SampleConfig",
    "SelectedSample",
    # Response
    "CognitiveFlow",
    "AttentionFilter",
    "ConfirmationBias",
    "EmotionalReaction",
    "Decision",
    "Response",
    "InterviewResult",
    # Report
    "DescriptiveStats",
    "InferentialResults",
    "SegmentedAnalysis",
    "ContentAnalysis",
    "SentimentAnalysis",
    "ClusterAnalysis",
    "ProjectionScenario",
    "Recommendation",
    "HTMLReport",
    "ResearchReport",
]
