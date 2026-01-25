# POLARIS SDK - Research Models
# Modelos para definição de pesquisa e problemática

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class HypothesisType(str, Enum):
    """Tipos de hipóteses de pesquisa."""
    CORRELACIONAL = "correlacional"
    CAUSAL = "causal"
    DESCRITIVA = "descritiva"
    COMPARATIVA = "comparativa"


class Hypothesis(BaseModel):
    """Hipótese de pesquisa."""
    id: str = Field(..., description="Identificador único (ex: H1, H2)")
    enunciado: str = Field(..., description="Texto da hipótese")
    variavel_independente: str = Field(..., description="Variável preditora")
    variavel_dependente: str = Field(..., description="Variável resposta")
    tipo: HypothesisType = Field(..., description="Tipo de hipótese")
    testada: bool = Field(default=False, description="Se já foi testada")
    resultado: Optional[str] = Field(default=None, description="Resultado do teste")
    valor_p: Optional[float] = Field(default=None, description="Valor-p do teste")
    tamanho_efeito: Optional[float] = Field(default=None, description="Tamanho do efeito")


class ResearchObjectives(BaseModel):
    """Objetivos da pesquisa."""
    geral: str = Field(..., description="Objetivo geral da pesquisa")
    especificos: List[str] = Field(..., description="Objetivos específicos")


class Scope(BaseModel):
    """Delimitação do escopo da pesquisa."""
    temporal: str = Field(..., description="Período da pesquisa")
    geografico: str = Field(..., description="Abrangência geográfica")
    tematico: str = Field(..., description="Delimitação temática")
    populacao: str = Field(..., description="População-alvo")
    limitacoes: List[str] = Field(default_factory=list, description="Limitações conhecidas")


class ProblemDefinition(BaseModel):
    """Definição completa da problemática de pesquisa."""
    tema_central: str = Field(..., description="Tema central da pesquisa")
    problema_pesquisa: str = Field(..., description="Questão científica central")
    perguntas_pesquisa: List[str] = Field(..., description="Perguntas derivadas")
    hipoteses: List[Hypothesis] = Field(default_factory=list, description="Hipóteses a testar")
    objetivos: ResearchObjectives = Field(..., description="Objetivos da pesquisa")
    justificativa: str = Field(..., description="Relevância científica e prática")
    delimitacao: Scope = Field(..., description="Escopo da pesquisa")

    # Metadados
    criado_em: datetime = Field(default_factory=datetime.now)
    versao: str = Field(default="1.0")


class ResearchPhase(str, Enum):
    """Fases da pesquisa."""
    DEFINICAO_PROBLEMATICA = "definicao_problematica"
    METODOLOGIA = "metodologia"
    AMOSTRAGEM = "amostragem"
    QUESTIONARIO = "questionario"
    COLETA = "coleta"
    ANALISE = "analise"
    PROJECOES = "projecoes"
    RECOMENDACOES = "recomendacoes"
    RELATORIO = "relatorio"
    CONCLUIDO = "concluido"


class ResearchState(BaseModel):
    """Estado atual da pesquisa (para checkpoints)."""
    id: str = Field(..., description="ID único da pesquisa")
    tema: str = Field(..., description="Tema da pesquisa")
    fase: ResearchPhase = Field(default=ResearchPhase.DEFINICAO_PROBLEMATICA)

    # Dados de cada fase
    problematica: Optional[ProblemDefinition] = None
    metodologia: Optional[Dict[str, Any]] = None
    amostra: Optional[Dict[str, Any]] = None
    questionario: Optional[Dict[str, Any]] = None
    respostas: Optional[List[Dict[str, Any]]] = None
    analise: Optional[Dict[str, Any]] = None
    projecoes: Optional[Dict[str, Any]] = None
    recomendacoes: Optional[List[Dict[str, Any]]] = None

    # Controle
    inicio: datetime = Field(default_factory=datetime.now)
    ultima_atualizacao: datetime = Field(default_factory=datetime.now)
    checkpoints: List[str] = Field(default_factory=list)
    erros: List[str] = Field(default_factory=list)

    # Estatísticas
    tokens_utilizados: int = Field(default=0)
    custo_estimado: float = Field(default=0.0)

    def to_dict(self) -> Dict[str, Any]:
        """Converte para dicionário."""
        return self.model_dump()

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ResearchState":
        """Cria instância a partir de dicionário."""
        return cls(**data)

    def atualizar_fase(self, nova_fase: ResearchPhase) -> None:
        """Atualiza a fase e registra checkpoint."""
        self.fase = nova_fase
        self.ultima_atualizacao = datetime.now()
        self.checkpoints.append(f"{nova_fase.value}:{self.ultima_atualizacao.isoformat()}")


class QuestionType(str, Enum):
    """Tipos de perguntas do questionário."""
    ESCALA_LIKERT = "escala_likert"
    MULTIPLA_ESCOLHA = "multipla_escolha"
    RANKING = "ranking"
    ABERTA = "aberta"
    DICOTOMICA = "dicotomica"
    SEMANTICO_DIFERENCIAL = "semantico_diferencial"


class ScaleConfig(BaseModel):
    """Configuração de escala."""
    min: int = Field(default=1)
    max: int = Field(default=5)
    rotulos: List[str] = Field(default_factory=list)


class Question(BaseModel):
    """Pergunta do questionário."""
    id: str = Field(..., description="ID da pergunta (ex: Q1)")
    texto: str = Field(..., description="Texto da pergunta")
    tipo: QuestionType = Field(..., description="Tipo da pergunta")
    opcoes: Optional[List[str]] = Field(default=None, description="Opções de resposta")
    escala: Optional[ScaleConfig] = Field(default=None, description="Configuração da escala")
    obrigatoria: bool = Field(default=True)
    randomizar_ordem: bool = Field(default=False)
    instrucoes_ia: str = Field(default="", description="Instruções para a IA responder")
    bloco_id: Optional[str] = Field(default=None, description="ID do bloco")


class QuestionBlock(BaseModel):
    """Bloco de perguntas."""
    id: str = Field(..., description="ID do bloco (ex: B1)")
    nome: str = Field(..., description="Nome do bloco")
    descricao: str = Field(default="", description="Descrição do bloco")
    perguntas: List[Question] = Field(default_factory=list)


class Questionnaire(BaseModel):
    """Questionário completo."""
    titulo: str = Field(..., description="Título do questionário")
    versao: str = Field(default="1.0")
    blocos: List[QuestionBlock] = Field(default_factory=list)
    tempo_estimado_minutos: int = Field(default=15)

    @property
    def total_perguntas(self) -> int:
        return sum(len(bloco.perguntas) for bloco in self.blocos)

    @property
    def todas_perguntas(self) -> List[Question]:
        perguntas = []
        for bloco in self.blocos:
            perguntas.extend(bloco.perguntas)
        return perguntas


class MethodologyType(str, Enum):
    """Tipos de pesquisa."""
    QUANTITATIVA = "quantitativa"
    QUALITATIVA = "qualitativa"
    MISTA = "mista"


class Paradigm(str, Enum):
    """Paradigmas de pesquisa."""
    POSITIVISTA = "positivista"
    INTERPRETATIVISTA = "interpretativista"
    PRAGMATICO = "pragmatico"


class Approach(str, Enum):
    """Abordagens de pesquisa."""
    SURVEY = "survey"
    ESTUDO_CASO = "estudo_caso"
    EXPERIMENTAL = "experimental"
    LONGITUDINAL = "longitudinal"


class AnalysisTechnique(str, Enum):
    """Técnicas de análise."""
    DESCRITIVA = "descritiva"
    INFERENCIAL = "inferencial"
    MULTIVARIADA = "multivariada"
    QUALITATIVA = "qualitativa"
    PREDITIVA = "preditiva"


class ValidityCheck(BaseModel):
    """Verificação de validade."""
    tipo: str
    descricao: str
    verificado: bool = False
    resultado: Optional[str] = None


class ReliabilityMeasures(BaseModel):
    """Medidas de confiabilidade."""
    alpha_cronbach: Optional[float] = None
    teste_reteste: Optional[float] = None
    split_half: Optional[float] = None


class MethodologyDesign(BaseModel):
    """Desenho metodológico completo."""
    tipo_pesquisa: MethodologyType
    paradigma: Paradigm
    abordagem: Approach

    # Instrumentos
    instrumento_coleta: Optional[Questionnaire] = None

    # Análise
    tecnicas_analise: List[AnalysisTechnique] = Field(default_factory=list)
    software_analise: List[str] = Field(default=["Python/pandas", "scipy"])

    # Validade
    validade_interna: List[ValidityCheck] = Field(default_factory=list)
    validade_externa: List[ValidityCheck] = Field(default_factory=list)
    confiabilidade: Optional[ReliabilityMeasures] = None

    # Metadados
    criado_em: datetime = Field(default_factory=datetime.now)
    justificativa: str = Field(default="")
