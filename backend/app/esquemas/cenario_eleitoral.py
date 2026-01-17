"""
Esquemas de Cenário Eleitoral

Modelos Pydantic para validação e serialização de cenários eleitorais.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ============================================
# ENUMS
# ============================================


class StatusCenario(str, Enum):
    rascunho = "rascunho"
    executando = "executando"
    concluido = "concluido"
    erro = "erro"


class CargoCenario(str, Enum):
    governador = "governador"
    senador = "senador"
    deputado_federal = "deputado_federal"
    deputado_distrital = "deputado_distrital"


# ============================================
# ESQUEMAS DE RESULTADO
# ============================================


class ResultadoCandidato(BaseModel):
    """Resultado de um candidato na simulação"""
    candidato_id: str
    candidato_nome: str
    candidato_nome_urna: str
    partido: str
    votos: int
    percentual: float
    percentual_validos: float  # Percentual excluindo brancos/nulos
    cor_campanha: Optional[str] = None
    foto_url: Optional[str] = None
    variacao: Optional[float] = None  # Variação em relação à última simulação


class AnaliseRejeicao(BaseModel):
    """Análise de rejeição de um candidato"""
    candidato_id: str
    candidato_nome: str
    taxa_rejeicao: float  # Percentual que NÃO votaria
    taxa_rejeicao_forte: float  # Percentual que NUNCA votaria
    principais_motivos: List[str]
    perfil_rejeitadores: Dict[str, any] = Field(default_factory=dict)


class ResultadoSimulacao(BaseModel):
    """Resultado completo da simulação"""
    cenario_id: str
    turno: int
    cargo: str

    # Resultados por candidato
    resultados: List[ResultadoCandidato]

    # Votos especiais
    indecisos: int
    indecisos_percentual: float
    brancos_nulos: int
    brancos_nulos_percentual: float

    # Estatísticas
    total_eleitores: int
    total_votos_validos: int
    margem_erro: float
    nivel_confianca: float

    # Análise de 2º turno (se aplicável)
    haveria_segundo_turno: Optional[bool] = None
    candidatos_segundo_turno: Optional[List[str]] = None

    # Análise de rejeição
    analise_rejeicao: Optional[List[AnaliseRejeicao]] = None

    # Metadados
    tempo_execucao_segundos: float
    custo_total: float
    modelo_usado: str
    executado_em: datetime


# ============================================
# ESQUEMAS BASE
# ============================================


class CenarioEleitoralBase(BaseModel):
    """Dados básicos de um cenário eleitoral"""

    nome: str = Field(..., min_length=2, max_length=200)
    descricao: Optional[str] = None
    turno: int = Field(1, ge=1, le=2)
    cargo: CargoCenario
    candidatos_ids: List[str] = Field(..., min_length=2, max_length=10)

    # Opções
    incluir_indecisos: bool = True
    incluir_brancos_nulos: bool = True
    amostra_tamanho: int = Field(100, ge=10, le=1000)

    # Filtros opcionais de eleitores
    filtros_eleitores: Optional[Dict] = Field(default_factory=dict)


class CenarioEleitoralCreate(CenarioEleitoralBase):
    """Dados para criação de cenário"""
    id: Optional[str] = None


class CenarioEleitoralUpdate(BaseModel):
    """Dados para atualização de cenário"""
    nome: Optional[str] = None
    descricao: Optional[str] = None
    turno: Optional[int] = None
    cargo: Optional[CargoCenario] = None
    candidatos_ids: Optional[List[str]] = None
    incluir_indecisos: Optional[bool] = None
    incluir_brancos_nulos: Optional[bool] = None
    amostra_tamanho: Optional[int] = None
    filtros_eleitores: Optional[Dict] = None
    ativo: Optional[bool] = None


class CenarioEleitoralResponse(CenarioEleitoralBase):
    """Resposta com dados completos do cenário"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    status: StatusCenario
    resultados: Optional[List[Dict]] = None
    indecisos_percentual: Optional[float] = None
    brancos_nulos_percentual: Optional[float] = None
    margem_erro: Optional[float] = None
    nivel_confianca: float = 95.0
    total_eleitores_simulados: Optional[int] = None
    custo_simulacao: Optional[float] = None
    tempo_execucao_segundos: Optional[float] = None
    modelo_ia_usado: Optional[str] = None
    ativo: bool
    criado_por: Optional[str] = None
    criado_em: Optional[datetime] = None
    atualizado_em: Optional[datetime] = None
    executado_em: Optional[datetime] = None


# ============================================
# ESQUEMAS DE LISTAGEM
# ============================================


class CenarioEleitoralResumo(BaseModel):
    """Resumo do cenário para listagens"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    nome: str
    turno: int
    cargo: str
    status: str
    total_candidatos: int
    criado_em: Optional[datetime] = None
    executado_em: Optional[datetime] = None


class FiltrosCenario(BaseModel):
    """Filtros para busca de cenários"""
    busca_texto: Optional[str] = None
    cargos: Optional[List[CargoCenario]] = None
    turnos: Optional[List[int]] = None
    status: Optional[List[StatusCenario]] = None
    apenas_ativos: bool = True
    pagina: int = Field(default=1, ge=1)
    por_pagina: int = Field(default=20, ge=1, le=100)
    ordenar_por: str = "criado_em"
    ordem: str = "desc"


class CenarioListResponse(BaseModel):
    """Resposta com lista paginada de cenários"""
    cenarios: List[CenarioEleitoralResponse]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int


# ============================================
# ESQUEMAS DE EXECUÇÃO
# ============================================


class ExecutarCenarioRequest(BaseModel):
    """Request para executar simulação de cenário"""
    cenario_id: str
    usar_cache: bool = True  # Reutilizar respostas anteriores se possível
    modelo: str = "claude-sonnet-4-20250514"  # Modelo a usar


class ExecutarCenarioRapidoRequest(BaseModel):
    """Request para simulação rápida sem salvar cenário"""
    cargo: CargoCenario
    turno: int = 1
    candidatos_ids: List[str] = Field(..., min_length=2)
    amostra_tamanho: int = Field(50, ge=10, le=200)
    incluir_indecisos: bool = True
    incluir_brancos_nulos: bool = True
    filtros_eleitores: Optional[Dict] = None


class ComparacaoCenarios(BaseModel):
    """Comparação entre dois ou mais cenários"""
    cenarios_ids: List[str] = Field(..., min_length=2, max_length=5)


class ResultadoComparacao(BaseModel):
    """Resultado da comparação de cenários"""
    cenarios: List[CenarioEleitoralResponse]
    diferencas: List[Dict]
    analise_tendencia: Optional[str] = None


# ============================================
# ESQUEMAS DE ANÁLISE DE REJEIÇÃO
# ============================================


class ConfiguracaoAnaliseRejeicao(BaseModel):
    """Configuração para análise de rejeição"""
    candidatos_ids: List[str] = Field(..., min_length=1)
    amostra_tamanho: int = Field(100, ge=10, le=500)
    incluir_motivos: bool = True
    incluir_perfil_rejeitadores: bool = True
    filtros_eleitores: Optional[Dict] = None


class ResultadoAnaliseRejeicao(BaseModel):
    """Resultado completo da análise de rejeição"""
    candidatos: List[AnaliseRejeicao]
    ranking_menor_rejeicao: List[str]  # IDs ordenados por menor rejeição
    insights: List[str]
    total_eleitores_analisados: int
    executado_em: datetime


# ============================================
# ESQUEMAS DE SEGUNDO TURNO
# ============================================


class SimulacaoSegundoTurno(BaseModel):
    """Simulação automática de segundo turno"""
    cenario_primeiro_turno_id: str
    forcar_candidatos: Optional[List[str]] = None  # Se None, usa os 2 mais votados


class ResultadoSegundoTurno(BaseModel):
    """Resultado do segundo turno"""
    candidato_1: ResultadoCandidato
    candidato_2: ResultadoCandidato
    vencedor_id: str
    diferenca_votos: int
    diferenca_percentual: float
    indecisos_percentual: float
    brancos_nulos_percentual: float
    transferencia_votos: Dict[str, Dict[str, float]]  # De qual candidato para qual
