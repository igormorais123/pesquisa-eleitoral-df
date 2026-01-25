# POLARIS SDK - Report Models
# Modelos para análises e relatórios

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any, Tuple
from pydantic import BaseModel, Field


class DescriptiveStats(BaseModel):
    """Estatísticas descritivas."""
    variavel: str
    n: int = Field(..., description="Tamanho da amostra")

    # Frequências
    frequencias_absolutas: Dict[str, int] = Field(default_factory=dict)
    frequencias_relativas: Dict[str, float] = Field(default_factory=dict)

    # Medidas de tendência central (para variáveis numéricas)
    media: Optional[float] = None
    mediana: Optional[float] = None
    moda: Optional[str] = None

    # Medidas de dispersão
    desvio_padrao: Optional[float] = None
    variancia: Optional[float] = None
    amplitude: Optional[float] = None
    coeficiente_variacao: Optional[float] = None

    # Quartis
    q1: Optional[float] = None
    q2: Optional[float] = None
    q3: Optional[float] = None
    iqr: Optional[float] = None

    # Percentis específicos
    percentis: Dict[int, float] = Field(default_factory=dict)


class TestResult(BaseModel):
    """Resultado de teste estatístico."""
    teste: str = Field(..., description="Nome do teste (ex: chi2, t-test)")
    estatistica: float = Field(..., description="Valor da estatística")
    valor_p: float = Field(..., description="Valor-p")
    graus_liberdade: Optional[int] = None
    significativo: bool = Field(default=False)
    nivel_significancia: float = Field(default=0.05)
    tamanho_efeito: Optional[float] = None
    tipo_tamanho_efeito: Optional[str] = None  # Cohen's d, η², Cramér's V
    intervalo_confianca: Optional[Tuple[float, float]] = None
    interpretacao: str = Field(default="")


class InferentialResults(BaseModel):
    """Resultados de análises inferenciais."""
    hipotese_id: str
    hipotese_enunciado: str

    # Teste realizado
    teste_principal: TestResult
    testes_adicionais: List[TestResult] = Field(default_factory=list)

    # Conclusão
    hipotese_suportada: bool
    conclusao: str
    limitacoes: List[str] = Field(default_factory=list)

    # Detalhes
    variaveis_analisadas: List[str] = Field(default_factory=list)
    n_observacoes: int = 0


class SegmentStats(BaseModel):
    """Estatísticas de um segmento."""
    segmento: str
    valor: str
    n: int
    percentual: float

    # Métricas específicas
    intencao_voto: Dict[str, float] = Field(default_factory=dict)
    rejeicao: Dict[str, float] = Field(default_factory=dict)
    indecisos: float = 0.0

    # Sentimento
    sentimento_positivo: float = 0.0
    sentimento_neutro: float = 0.0
    sentimento_negativo: float = 0.0


class SegmentedAnalysis(BaseModel):
    """Análise segmentada por variáveis."""
    variavel_segmentacao: str
    segmentos: List[SegmentStats] = Field(default_factory=list)

    # Comparações
    diferencas_significativas: List[Dict[str, Any]] = Field(default_factory=list)
    teste_homogeneidade: Optional[TestResult] = None

    # Insights
    principais_diferencas: List[str] = Field(default_factory=list)
    segmentos_chave: List[str] = Field(default_factory=list)


class Category(BaseModel):
    """Categoria para análise de conteúdo."""
    nome: str
    frequencia: int
    percentual: float
    citacoes: List[str] = Field(default_factory=list, max_length=5)
    subcategorias: List["Category"] = Field(default_factory=list)


class ContentAnalysis(BaseModel):
    """Análise de conteúdo qualitativa."""
    pergunta_id: str
    total_respostas: int

    # Categorias temáticas
    categorias: List[Category] = Field(default_factory=list)

    # Palavras mais frequentes
    palavras_frequentes: Dict[str, int] = Field(default_factory=dict)

    # Citações representativas
    citacoes_positivas: List[str] = Field(default_factory=list)
    citacoes_negativas: List[str] = Field(default_factory=list)
    citacoes_neutras: List[str] = Field(default_factory=list)

    # Metadados
    metodo: str = Field(default="analise_tematica")


class SentimentDistribution(BaseModel):
    """Distribuição de sentimentos."""
    emocao: str
    frequencia: int
    percentual: float
    intensidade_media: float


class SentimentAnalysis(BaseModel):
    """Análise de sentimentos."""
    total_respostas: int

    # Distribuição geral
    positivo: float
    neutro: float
    negativo: float

    # Por emoção
    distribuicao_emocoes: List[SentimentDistribution] = Field(default_factory=list)

    # Intensidade
    intensidade_media_geral: float = 0.0
    intensidade_por_grupo: Dict[str, float] = Field(default_factory=dict)

    # Correlações
    correlacao_sentimento_voto: Dict[str, float] = Field(default_factory=dict)

    # Insights
    gatilhos_emocionais: List[str] = Field(default_factory=list)


class ClusterProfile(BaseModel):
    """Perfil de um cluster."""
    id: int
    nome: str = Field(default="")
    tamanho: int
    percentual: float

    # Características dominantes
    caracteristicas: Dict[str, Any] = Field(default_factory=dict)

    # Centroides (para variáveis numéricas)
    centroide: Dict[str, float] = Field(default_factory=dict)

    # Homogeneidade
    silhouette_score: float = 0.0

    # Comportamento político
    intencao_voto_predominante: Optional[str] = None
    rejeicao_predominante: Optional[str] = None


class ClusterAnalysis(BaseModel):
    """Análise de clusters."""
    metodo: str = Field(default="kmeans")
    n_clusters: int

    # Clusters identificados
    clusters: List[ClusterProfile] = Field(default_factory=list)

    # Métricas de qualidade
    inertia: float = 0.0
    silhouette_medio: float = 0.0
    calinski_harabasz: float = 0.0

    # Variáveis utilizadas
    variaveis: List[str] = Field(default_factory=list)

    # Insights
    segmentos_persuadiveis: List[int] = Field(default_factory=list)
    segmentos_base: List[int] = Field(default_factory=list)


class ScenarioType(str, Enum):
    """Tipos de cenário."""
    OTIMISTA = "otimista"
    REALISTA = "realista"
    PESSIMISTA = "pessimista"
    VOLATILIDADE_MAXIMA = "volatilidade_maxima"


class ProjectionScenario(BaseModel):
    """Cenário de projeção."""
    tipo: ScenarioType
    nome: str
    descricao: str

    # Resultados projetados
    intencao_voto: Dict[str, float] = Field(default_factory=dict)
    intervalo_confianca: Dict[str, Tuple[float, float]] = Field(default_factory=dict)

    # Probabilidades
    probabilidade_vitoria: Dict[str, float] = Field(default_factory=dict)
    probabilidade_segundo_turno: float = 0.0

    # Premissas
    premissas: List[str] = Field(default_factory=list)

    # Simulação Monte Carlo
    n_simulacoes: int = Field(default=10000)
    distribuicao_resultados: Optional[Dict[str, List[float]]] = None


class BreakingPoint(BaseModel):
    """Ponto de ruptura potencial."""
    tema: str
    descricao: str
    impacto_potencial: float = Field(ge=0, le=10)
    segmentos_afetados: List[str] = Field(default_factory=list)
    direcao_impacto: str  # "favorece_lider", "favorece_challenger", "incerto"
    probabilidade_ocorrencia: float = Field(ge=0, le=1)


class RecommendationCategory(str, Enum):
    """Categorias de recomendação."""
    POSICIONAMENTO = "posicionamento"
    COMUNICACAO = "comunicacao"
    SEGMENTACAO = "segmentacao"
    TEMAS = "temas"
    DEFESA = "defesa"
    TIMING = "timing"
    RECURSOS = "recursos"


class RecommendationPriority(str, Enum):
    """Prioridades de recomendação."""
    CRITICA = "critica"
    ALTA = "alta"
    MEDIA = "media"
    BAIXA = "baixa"


class Recommendation(BaseModel):
    """Recomendação estratégica."""
    id: str
    categoria: RecommendationCategory
    prioridade: RecommendationPriority

    # Conteúdo
    titulo: str
    diagnostico: str = Field(..., description="O que os dados mostram")
    recomendacao: str = Field(..., description="O que fazer")
    justificativa: str = Field(..., description="Por que fazer")
    risco_nao_seguir: str = Field(..., description="Risco se não implementar")

    # Implementação
    acoes_especificas: List[str] = Field(default_factory=list)
    dificuldade_implementacao: int = Field(ge=1, le=5)

    # Métricas de suporte
    dados_suporte: Dict[str, Any] = Field(default_factory=dict)
    segmentos_alvo: List[str] = Field(default_factory=list)

    # Mensagens-chave (se aplicável)
    mensagens_chave: List[str] = Field(default_factory=list)
    canais_recomendados: List[str] = Field(default_factory=list)


class KeyFinding(BaseModel):
    """Achado principal."""
    titulo: str
    descricao: str
    impacto: str  # "alto", "medio", "baixo"
    dados_suporte: str
    implicacao: str


class ExecutiveSummary(BaseModel):
    """Sumário executivo."""
    titulo: str
    data: datetime = Field(default_factory=datetime.now)

    # KPIs principais
    lider: str
    percentual_lider: float
    margem_erro: float
    diferenca_segundo: float
    indecisos: float

    # Principais achados
    achados_principais: List[KeyFinding] = Field(default_factory=list)

    # Headline
    headline: str = Field(default="")
    conclusao: str = Field(default="")


class HTMLReport(BaseModel):
    """Relatório HTML gerado."""
    titulo: str
    html_content: str

    # Metadados
    gerado_em: datetime = Field(default_factory=datetime.now)
    versao: str = Field(default="1.0")

    # Seções incluídas
    secoes: List[str] = Field(default_factory=list)

    # Arquivos auxiliares
    css_embutido: bool = Field(default=True)
    js_embutido: bool = Field(default=True)

    # Tamanho
    tamanho_bytes: int = 0

    def salvar(self, caminho: str) -> None:
        """Salva o relatório em arquivo."""
        with open(caminho, 'w', encoding='utf-8') as f:
            f.write(self.html_content)
        self.tamanho_bytes = len(self.html_content.encode('utf-8'))


class ResearchReport(BaseModel):
    """Relatório completo da pesquisa."""
    id: str
    titulo: str

    # Sumário executivo
    sumario_executivo: ExecutiveSummary

    # Metodologia
    ficha_tecnica: Dict[str, Any] = Field(default_factory=dict)

    # Resultados
    estatisticas_descritivas: List[DescriptiveStats] = Field(default_factory=list)
    analises_inferenciais: List[InferentialResults] = Field(default_factory=list)
    analises_segmentadas: List[SegmentedAnalysis] = Field(default_factory=list)
    analise_conteudo: Optional[ContentAnalysis] = None
    analise_sentimento: Optional[SentimentAnalysis] = None
    analise_clusters: Optional[ClusterAnalysis] = None

    # Projeções
    cenarios: List[ProjectionScenario] = Field(default_factory=list)
    pontos_ruptura: List[BreakingPoint] = Field(default_factory=list)

    # Recomendações
    recomendacoes: List[Recommendation] = Field(default_factory=list)

    # Relatório HTML
    html_report: Optional[HTMLReport] = None

    # Metadados
    criado_em: datetime = Field(default_factory=datetime.now)
    autor: str = Field(default="POLARIS SDK")
    versao: str = Field(default="1.0")
