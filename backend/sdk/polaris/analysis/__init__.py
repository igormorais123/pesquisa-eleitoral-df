# POLARIS SDK - Analysis
# Módulos de análise de dados

from .quantitative import QuantitativeAnalyzer
from .qualitative import QualitativeAnalyzer
from .statistical import StatisticalTests
from .projections import ProjectionsEngine
from .recommendations import RecommendationsEngine

__all__ = [
    "QuantitativeAnalyzer",
    "QualitativeAnalyzer",
    "StatisticalTests",
    "ProjectionsEngine",
    "RecommendationsEngine",
]
