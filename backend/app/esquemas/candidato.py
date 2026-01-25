"""
Esquemas de Candidato

Modelos Pydantic para validação e serialização de dados de candidatos.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ============================================
# ENUMS
# ============================================


class CargoPretendidoEnum(str, Enum):
    governador = "governador"
    vice_governador = "vice_governador"
    senador = "senador"
    deputado_federal = "deputado_federal"
    deputado_distrital = "deputado_distrital"


class StatusCandidaturaEnum(str, Enum):
    pre_candidato = "pre_candidato"
    candidato_oficial = "candidato_oficial"
    indeferido = "indeferido"
    desistente = "desistente"


class GeneroEnum(str, Enum):
    masculino = "masculino"
    feminino = "feminino"


class OrientacaoPoliticaEnum(str, Enum):
    esquerda = "esquerda"
    centro_esquerda = "centro-esquerda"
    centro = "centro"
    centro_direita = "centro-direita"
    direita = "direita"


# ============================================
# ESQUEMAS BASE
# ============================================


class RedesSociaisSchema(BaseModel):
    """Redes sociais do candidato"""
    twitter: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    youtube: Optional[str] = None
    tiktok: Optional[str] = None


class EleicaoAnteriorSchema(BaseModel):
    """Dados de eleição anterior"""
    ano: int
    cargo: str
    resultado: str  # "eleito", "não_eleito", "segundo_turno"
    votos: Optional[int] = None
    percentual: Optional[float] = None


class CandidatoBase(BaseModel):
    """Dados básicos de um candidato"""

    nome: str = Field(..., min_length=2, max_length=200)
    nome_urna: str = Field(..., min_length=2, max_length=100)
    partido: str = Field(..., min_length=1, max_length=50)
    numero_partido: Optional[int] = Field(None, ge=10, le=99)
    cargo_pretendido: CargoPretendidoEnum
    status_candidatura: StatusCandidaturaEnum = StatusCandidaturaEnum.pre_candidato

    # Coligação
    coligacao: Optional[str] = Field(None, max_length=200)
    vice_ou_suplentes: Optional[str] = Field(None, max_length=200)

    # Mídia
    foto_url: Optional[str] = Field(None, max_length=500)
    cor_campanha: Optional[str] = Field(None, max_length=20)
    slogan: Optional[str] = Field(None, max_length=200)

    # Dados pessoais
    idade: Optional[int] = Field(None, ge=18, le=120)
    data_nascimento: Optional[str] = None
    genero: Optional[GeneroEnum] = None
    naturalidade: Optional[str] = Field(None, max_length=100)

    # Carreira
    profissao: Optional[str] = Field(None, max_length=100)
    cargo_atual: Optional[str] = Field(None, max_length=200)
    historico_politico: List[str] = Field(default_factory=list)

    # Conteúdo
    biografia: Optional[str] = None
    propostas_principais: List[str] = Field(default_factory=list)
    areas_foco: List[str] = Field(default_factory=list)

    # Redes sociais
    redes_sociais: Optional[Dict[str, str]] = Field(default_factory=dict)
    site_campanha: Optional[str] = Field(None, max_length=300)

    # Posicionamento político
    orientacao_politica: Optional[OrientacaoPoliticaEnum] = None
    posicao_bolsonaro: Optional[str] = None
    posicao_lula: Optional[str] = None

    # Eleições anteriores
    eleicoes_anteriores: List[Dict] = Field(default_factory=list)
    votos_ultima_eleicao: Optional[int] = Field(None, ge=0)

    # Pontos fortes e fracos
    pontos_fortes: List[str] = Field(default_factory=list)
    pontos_fracos: List[str] = Field(default_factory=list)
    controversias: List[str] = Field(default_factory=list)

    # Métricas
    rejeicao_estimada: Optional[float] = Field(None, ge=0, le=100)
    conhecimento_estimado: Optional[float] = Field(None, ge=0, le=100)

    # Controle
    ativo: bool = True
    ordem_exibicao: Optional[int] = None


class CandidatoCreate(CandidatoBase):
    """Dados para criação de candidato"""
    id: Optional[str] = None  # Pode ser gerado automaticamente


class CandidatoUpdate(BaseModel):
    """Dados para atualização parcial de candidato"""

    nome: Optional[str] = None
    nome_urna: Optional[str] = None
    partido: Optional[str] = None
    numero_partido: Optional[int] = None
    cargo_pretendido: Optional[CargoPretendidoEnum] = None
    status_candidatura: Optional[StatusCandidaturaEnum] = None
    coligacao: Optional[str] = None
    vice_ou_suplentes: Optional[str] = None
    foto_url: Optional[str] = None
    cor_campanha: Optional[str] = None
    slogan: Optional[str] = None
    idade: Optional[int] = None
    data_nascimento: Optional[str] = None
    genero: Optional[GeneroEnum] = None
    naturalidade: Optional[str] = None
    profissao: Optional[str] = None
    cargo_atual: Optional[str] = None
    historico_politico: Optional[List[str]] = None
    biografia: Optional[str] = None
    propostas_principais: Optional[List[str]] = None
    areas_foco: Optional[List[str]] = None
    redes_sociais: Optional[Dict[str, str]] = None
    site_campanha: Optional[str] = None
    orientacao_politica: Optional[OrientacaoPoliticaEnum] = None
    posicao_bolsonaro: Optional[str] = None
    posicao_lula: Optional[str] = None
    eleicoes_anteriores: Optional[List[Dict]] = None
    votos_ultima_eleicao: Optional[int] = None
    pontos_fortes: Optional[List[str]] = None
    pontos_fracos: Optional[List[str]] = None
    controversias: Optional[List[str]] = None
    rejeicao_estimada: Optional[float] = None
    conhecimento_estimado: Optional[float] = None
    ativo: Optional[bool] = None
    ordem_exibicao: Optional[int] = None


class CandidatoResponse(CandidatoBase):
    """Resposta com dados completos do candidato"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    criado_em: Optional[datetime] = None
    atualizado_em: Optional[datetime] = None


class CandidatoResumo(BaseModel):
    """Resumo do candidato para listagens"""

    model_config = ConfigDict(from_attributes=True)

    id: str
    nome: str
    nome_urna: str
    partido: str
    numero_partido: Optional[int] = None
    cargo_pretendido: str
    foto_url: Optional[str] = None
    cor_campanha: Optional[str] = None
    status_candidatura: str
    ativo: bool


# ============================================
# FILTROS
# ============================================


class FiltrosCandidato(BaseModel):
    """Filtros para busca de candidatos"""

    # Texto
    busca_texto: Optional[str] = None

    # Políticos
    partidos: Optional[List[str]] = None
    cargos: Optional[List[CargoPretendidoEnum]] = None
    status: Optional[List[StatusCandidaturaEnum]] = None
    orientacoes_politicas: Optional[List[str]] = None

    # Demográficos
    generos: Optional[List[str]] = None

    # Estado
    apenas_ativos: bool = True

    # Paginação
    pagina: int = Field(default=1, ge=1)
    por_pagina: int = Field(default=50, ge=1, le=100)

    # Ordenação
    ordenar_por: str = "nome_urna"
    ordem: str = "asc"


# ============================================
# RESPOSTAS
# ============================================


class CandidatoListResponse(BaseModel):
    """Resposta com lista paginada de candidatos"""

    candidatos: List[CandidatoResponse]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int


class EstatisticasCandidatos(BaseModel):
    """Estatísticas gerais dos candidatos"""

    total: int
    por_cargo: List[Dict]
    por_partido: List[Dict]
    por_genero: List[Dict]
    por_orientacao_politica: List[Dict]
    por_status: List[Dict]


class CandidatosParaPesquisa(BaseModel):
    """Lista de candidatos formatada para usar em pesquisas"""

    candidatos: List[CandidatoResumo]
    total: int


# ============================================
# CENÁRIOS ELEITORAIS
# ============================================


class CenarioEleitoral(BaseModel):
    """Cenário eleitoral para simulação"""

    nome: str = Field(..., min_length=2, max_length=100)
    descricao: Optional[str] = None
    turno: int = Field(1, ge=1, le=2)
    cargo: CargoPretendidoEnum
    candidatos_ids: List[str] = Field(..., min_length=2)
    incluir_indecisos: bool = True
    incluir_brancos_nulos: bool = True


class ResultadoCenario(BaseModel):
    """Resultado de simulação de cenário"""

    cenario: CenarioEleitoral
    resultados: List[Dict]  # candidato_id, votos, percentual
    indecisos_percentual: Optional[float] = None
    brancos_nulos_percentual: Optional[float] = None
    margem_erro: float
    confianca: float
    total_eleitores_simulados: int
