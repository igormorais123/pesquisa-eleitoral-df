"""
Esquemas de Eleitor

Modelos Pydantic para validação e serialização de dados de eleitores.
"""

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

# ============================================
# ENUMS
# ============================================


class GeneroEnum(str, Enum):
    masculino = "masculino"
    feminino = "feminino"


class ClusterSocioeconomicoEnum(str, Enum):
    G1_alta = "G1_alta"
    G2_media_alta = "G2_media_alta"
    G3_media_baixa = "G3_media_baixa"
    G4_baixa = "G4_baixa"


class InteressePoliticoEnum(str, Enum):
    baixo = "baixo"
    medio = "medio"
    alto = "alto"


class ToleranciaEnum(str, Enum):
    baixa = "baixa"
    media = "media"
    alta = "alta"


class PosicaoBolsonaroEnum(str, Enum):
    opositor_forte = "opositor_forte"
    opositor_moderado = "opositor_moderado"
    critico_forte = "critico_forte"
    critico_moderado = "critico_moderado"
    neutro = "neutro"
    apoiador_moderado = "apoiador_moderado"
    apoiador_forte = "apoiador_forte"


# ============================================
# ESQUEMAS BASE
# ============================================


class EleitorBase(BaseModel):
    """Dados básicos de um eleitor"""

    nome: str = Field(..., min_length=2, max_length=100)
    idade: int = Field(..., ge=16, le=120)
    genero: GeneroEnum
    cor_raca: str
    regiao_administrativa: str
    local_referencia: Optional[str] = None
    cluster_socioeconomico: ClusterSocioeconomicoEnum
    escolaridade: str
    profissao: str
    ocupacao_vinculo: str
    renda_salarios_minimos: str
    religiao: str
    estado_civil: str
    filhos: int = Field(default=0, ge=0)
    orientacao_politica: str
    posicao_bolsonaro: PosicaoBolsonaroEnum
    interesse_politico: InteressePoliticoEnum
    tolerancia_nuance: ToleranciaEnum = ToleranciaEnum.media
    estilo_decisao: str = "economico"
    valores: List[str] = Field(default_factory=list)
    preocupacoes: List[str] = Field(default_factory=list)
    vieses_cognitivos: List[str] = Field(default_factory=list)
    medos: List[str] = Field(default_factory=list)
    fontes_informacao: List[str] = Field(default_factory=list)
    susceptibilidade_desinformacao: int = Field(default=5, ge=1, le=10)
    meio_transporte: Optional[str] = None
    tempo_deslocamento_trabalho: Optional[str] = None
    voto_facultativo: bool = False
    conflito_identitario: bool = False
    historia_resumida: str = ""
    instrucao_comportamental: str = ""


class EleitorCreate(EleitorBase):
    """Dados para criação de eleitor"""

    id: Optional[str] = None  # Pode ser gerado automaticamente


class EleitorUpdate(BaseModel):
    """Dados para atualização parcial de eleitor"""

    nome: Optional[str] = None
    idade: Optional[int] = None
    genero: Optional[GeneroEnum] = None
    cor_raca: Optional[str] = None
    regiao_administrativa: Optional[str] = None
    local_referencia: Optional[str] = None
    cluster_socioeconomico: Optional[ClusterSocioeconomicoEnum] = None
    escolaridade: Optional[str] = None
    profissao: Optional[str] = None
    ocupacao_vinculo: Optional[str] = None
    renda_salarios_minimos: Optional[str] = None
    religiao: Optional[str] = None
    estado_civil: Optional[str] = None
    filhos: Optional[int] = None
    orientacao_politica: Optional[str] = None
    posicao_bolsonaro: Optional[PosicaoBolsonaroEnum] = None
    interesse_politico: Optional[InteressePoliticoEnum] = None
    tolerancia_nuance: Optional[ToleranciaEnum] = None
    estilo_decisao: Optional[str] = None
    valores: Optional[List[str]] = None
    preocupacoes: Optional[List[str]] = None
    vieses_cognitivos: Optional[List[str]] = None
    medos: Optional[List[str]] = None
    fontes_informacao: Optional[List[str]] = None
    susceptibilidade_desinformacao: Optional[int] = None
    meio_transporte: Optional[str] = None
    tempo_deslocamento_trabalho: Optional[str] = None
    voto_facultativo: Optional[bool] = None
    conflito_identitario: Optional[bool] = None
    historia_resumida: Optional[str] = None
    instrucao_comportamental: Optional[str] = None


class EleitorResponse(EleitorBase):
    """Resposta com dados completos do eleitor"""

    model_config = ConfigDict(from_attributes=True)

    id: str


# ============================================
# FILTROS
# ============================================


class FiltrosEleitor(BaseModel):
    """Filtros para busca de eleitores"""

    # Demograficos
    idade_min: Optional[int] = None
    idade_max: Optional[int] = None
    generos: Optional[List[str]] = None
    cores_racas: Optional[List[str]] = None

    # Geograficos
    regioes_administrativas: Optional[List[str]] = None

    # Socioeconomicos
    clusters: Optional[List[str]] = None
    escolaridades: Optional[List[str]] = None
    profissoes: Optional[List[str]] = None
    ocupacoes: Optional[List[str]] = None
    faixas_renda: Optional[List[str]] = None

    # Socioculturais
    religioes: Optional[List[str]] = None
    estados_civis: Optional[List[str]] = None
    tem_filhos: Optional[bool] = None

    # Politicos
    orientacoes_politicas: Optional[List[str]] = None
    posicoes_bolsonaro: Optional[List[str]] = None
    interesses_politicos: Optional[List[str]] = None

    # Comportamentais
    estilos_decisao: Optional[List[str]] = None
    tolerancias: Optional[List[str]] = None
    voto_facultativo: Optional[bool] = None
    conflito_identitario: Optional[bool] = None

    # Busca textual
    busca_texto: Optional[str] = None

    # Paginacao
    pagina: int = Field(default=1, ge=1)
    por_pagina: int = Field(default=50, ge=1, le=500)

    # Ordenacao
    ordenar_por: str = "nome"
    ordem: str = "asc"


# ============================================
# RESPOSTAS
# ============================================


class EleitorListResponse(BaseModel):
    """Resposta com lista paginada de eleitores"""

    eleitores: List[EleitorResponse]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int
    filtros_aplicados: dict


class DistribuicaoItem(BaseModel):
    """Item de distribuição estatística"""

    categoria: str
    quantidade: int
    percentual: float


class EstatisticasEleitores(BaseModel):
    """Estatísticas gerais dos eleitores"""

    total: int

    # Distribuições
    por_genero: List[DistribuicaoItem]
    por_cluster: List[DistribuicaoItem]
    por_regiao: List[DistribuicaoItem]
    por_religiao: List[DistribuicaoItem]
    por_faixa_etaria: List[DistribuicaoItem]
    por_escolaridade: List[DistribuicaoItem]
    por_orientacao_politica: List[DistribuicaoItem]
    por_posicao_bolsonaro: List[DistribuicaoItem]
    por_interesse_politico: List[DistribuicaoItem]

    # Médias
    idade_media: float
    filhos_media: float


class UploadResult(BaseModel):
    """Resultado de upload de eleitores"""

    sucesso: bool
    total_processados: int
    total_adicionados: int
    total_erros: int
    erros: List[str]
