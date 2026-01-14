"""
Esquemas de Resultado

Modelos Pydantic para análises e resultados de entrevistas.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime


# ============================================
# ENUMS
# ============================================

class TipoInsight(str, Enum):
    descoberta = "descoberta"
    alerta = "alerta"
    oportunidade = "oportunidade"
    correlacao = "correlacao"
    ruptura = "ruptura"


class Sentimento(str, Enum):
    positivo = "positivo"
    negativo = "negativo"
    neutro = "neutro"
    misto = "misto"


class Relevancia(str, Enum):
    alta = "alta"
    media = "media"
    baixa = "baixa"


# ============================================
# ESTATÍSTICAS
# ============================================

class Distribuicao(BaseModel):
    """Item de distribuição estatística"""
    categoria: str
    quantidade: int
    percentual: float
    subcategorias: Optional[List["Distribuicao"]] = None


class EstatisticasDescritivas(BaseModel):
    """Estatísticas descritivas de uma variável"""
    variavel: str
    media: Optional[float] = None
    mediana: Optional[float] = None
    moda: Optional[Any] = None
    desvio_padrao: Optional[float] = None
    variancia: Optional[float] = None
    minimo: Optional[float] = None
    maximo: Optional[float] = None
    q1: Optional[float] = None
    q2: Optional[float] = None
    q3: Optional[float] = None
    amplitude: Optional[float] = None
    coeficiente_variacao: Optional[float] = None


class Correlacao(BaseModel):
    """Correlação entre duas variáveis"""
    variavel1: str
    variavel2: str
    coeficiente_pearson: Optional[float] = None
    coeficiente_spearman: Optional[float] = None
    chi_quadrado: Optional[float] = None
    p_valor: float
    r_quadrado: Optional[float] = None
    significancia: Relevancia
    interpretacao: str


# ============================================
# ANÁLISE QUALITATIVA
# ============================================

class PalavraFrequente(BaseModel):
    """Palavra com frequência"""
    palavra: str
    frequencia: int
    percentual: float
    sentimento: Optional[Sentimento] = None


class Tema(BaseModel):
    """Tema identificado nas respostas"""
    nome: str
    frequencia: int
    percentual: float
    palavras_chave: List[str]
    sentimento_medio: float  # -1 a +1


class Citacao(BaseModel):
    """Citação representativa"""
    texto: str
    eleitor_id: str
    eleitor_nome: str
    regiao: Optional[str] = None
    cluster: Optional[str] = None
    orientacao_politica: Optional[str] = None
    sentimento: Sentimento
    tema: Optional[str] = None


# ============================================
# MAPA DE CALOR EMOCIONAL
# ============================================

class ItemMapaCalor(BaseModel):
    """Item do mapa de calor emocional"""
    grupo: str
    sentimento: str
    intensidade: float  # 0-100
    quantidade: int
    citacao_exemplo: Optional[str] = None


class MapaCalorEmocional(BaseModel):
    """Mapa de calor emocional completo"""
    pergunta: str
    total_respostas: int
    dados: List[ItemMapaCalor]


# ============================================
# CAIXAS ESPECIAIS
# ============================================

class VotoSilencioso(BaseModel):
    """Eleitor com voto silencioso"""
    eleitor_id: str
    eleitor_nome: str
    perfil_resumido: str
    regiao: str
    cluster: str

    # Análise
    concorda_economia: bool
    rejeita_costumes: bool
    probabilidade_voto_escondido: float  # 0-100

    # Evidências
    citacao_reveladora: str
    contradicoes_detectadas: List[str]

    # Insight
    interpretacao: str


class PontoRuptura(BaseModel):
    """Ponto de ruptura de um eleitor"""
    eleitor_id: str
    eleitor_nome: str
    perfil_resumido: str
    orientacao_atual: str

    # Análise
    linhas_vermelhas: List[str]
    gatilho_mudanca: str
    probabilidade_ruptura: float  # 0-100

    # Evidências
    citacao_reveladora: str
    valores_em_conflito: List[str]

    # Insight
    vulnerabilidade: Relevancia
    estrategia_persuasao: Optional[str] = None


# ============================================
# INSIGHTS
# ============================================

class Insight(BaseModel):
    """Insight gerado pela análise"""
    tipo: TipoInsight
    titulo: str
    descricao: str
    relevancia: Relevancia

    dados_suporte: Optional[Dict[str, Any]] = None
    recomendacao_pratica: Optional[str] = None
    publico_alvo: Optional[str] = None


# ============================================
# RESULTADO COMPLETO
# ============================================

class ResultadoAnalise(BaseModel):
    """Resultado completo de análise de entrevista"""
    id: str
    entrevista_id: str
    titulo_entrevista: str

    # Metadados
    total_respostas: int
    total_eleitores: int
    perguntas_analisadas: int
    custo_total: float
    tempo_execucao_segundos: float

    # Timestamps
    criado_em: datetime = Field(default_factory=datetime.now)

    # Análise quantitativa
    estatisticas: Optional[List[EstatisticasDescritivas]] = None
    distribuicoes: Optional[Dict[str, List[Distribuicao]]] = None
    correlacoes: Optional[List[Correlacao]] = None

    # Análise qualitativa
    sentimento_geral: Optional[Sentimento] = None
    proporcao_sentimentos: Optional[Dict[str, float]] = None
    palavras_frequentes: Optional[List[PalavraFrequente]] = None
    temas_principais: Optional[List[Tema]] = None
    citacoes_representativas: Optional[List[Citacao]] = None

    # Mapas de calor
    mapa_calor_emocional: Optional[MapaCalorEmocional] = None

    # Caixas especiais
    votos_silenciosos: Optional[List[VotoSilencioso]] = None
    pontos_ruptura: Optional[List[PontoRuptura]] = None

    # Insights
    insights: Optional[List[Insight]] = None
    conclusoes: Optional[List[str]] = None
    implicacoes_politicas: Optional[List[str]] = None


class ResultadoListResponse(BaseModel):
    """Resposta com lista de resultados"""
    resultados: List[ResultadoAnalise]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int
