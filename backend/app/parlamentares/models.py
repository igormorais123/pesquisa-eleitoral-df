"""
Modelos de Parlamentares

Implementa arquitetura de "camadas de verdade":
- Fatos: dados verificáveis de fontes oficiais (nunca inventar)
- Derivados: métricas calculadas a partir de fatos
- Hipóteses: inferências opcionais com label, confiança e rationale
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, ConfigDict, Field, HttpUrl


# ============================================
# ENUMS
# ============================================


class CasaLegislativaEnum(str, Enum):
    camara_federal = "camara_federal"
    senado = "senado"
    cldf = "cldf"


class CargoEnum(str, Enum):
    deputado_federal = "deputado_federal"
    deputada_federal = "deputada_federal"
    senador = "senador"
    senadora = "senadora"
    deputado_distrital = "deputado_distrital"
    deputada_distrital = "deputada_distrital"


class GeneroEnum(str, Enum):
    masculino = "masculino"
    feminino = "feminino"


class OrientacaoPoliticaEnum(str, Enum):
    esquerda = "esquerda"
    centro_esquerda = "centro-esquerda"
    centro = "centro"
    centro_direita = "centro-direita"
    direita = "direita"


class PosicaoPoliticaEnum(str, Enum):
    apoiador_forte = "apoiador_forte"
    apoiador_moderado = "apoiador_moderado"
    neutro = "neutro"
    critico_moderado = "critico_moderado"
    critico_forte = "critico_forte"
    opositor_moderado = "opositor_moderado"
    opositor_forte = "opositor_forte"


class RelacaoGovernoEnum(str, Enum):
    base_aliada = "base_aliada"
    independente = "independente"
    oposicao_moderada = "oposicao_moderada"
    oposicao_forte = "oposicao_forte"


class NivelConfiancaEnum(str, Enum):
    baixa = "baixa"
    media = "media"
    alta = "alta"


# ============================================
# CAMADA 1: FATOS (dados verificáveis)
# ============================================


class FonteDados(BaseModel):
    """Referência a fonte de dados"""
    nome: str = Field(..., description="Nome da fonte (ex: 'Câmara dos Deputados')")
    url: Optional[str] = Field(None, description="URL da fonte")
    data_acesso: datetime = Field(default_factory=datetime.utcnow)


class ParlamentarFatos(BaseModel):
    """
    CAMADA DE FATOS

    Apenas dados verificáveis de fontes públicas oficiais.
    Nunca inferir ou inventar dados nesta camada.
    """
    model_config = ConfigDict(extra="forbid")

    # Identificação (obrigatórios)
    id: str = Field(..., description="ID único (ex: dep-001, sen-001, cldf-001)")
    id_externo: Optional[str] = Field(None, description="ID na API oficial (Câmara/Senado)")
    casa_legislativa: CasaLegislativaEnum

    # Dados pessoais (da fonte oficial)
    nome_civil: str = Field(..., description="Nome civil completo")
    nome_parlamentar: str = Field(..., description="Nome usado no parlamento")
    data_nascimento: Optional[str] = Field(None, description="Data de nascimento (YYYY-MM-DD)")
    genero: Optional[GeneroEnum] = None
    naturalidade: Optional[str] = Field(None, description="Cidade de nascimento")
    uf_nascimento: Optional[str] = Field(None, description="UF de nascimento")

    # Dados do mandato (da fonte oficial)
    cargo: CargoEnum
    partido: str = Field(..., description="Sigla do partido atual")
    uf: str = Field(default="DF", description="UF que representa")
    legislatura: Optional[int] = Field(None, description="Número da legislatura")
    mandato_inicio: Optional[str] = Field(None, description="Início do mandato (YYYY-MM-DD)")
    mandato_fim: Optional[str] = Field(None, description="Fim do mandato (YYYY-MM-DD)")
    votos_ultima_eleicao: Optional[int] = Field(None, description="Votos na última eleição")

    # Contatos oficiais
    email: Optional[str] = None
    telefone_gabinete: Optional[str] = None
    gabinete_localizacao: Optional[str] = None
    url_perfil_oficial: Optional[str] = Field(None, description="URL do perfil no site oficial")
    url_foto_oficial: Optional[str] = Field(None, description="URL da foto oficial")

    # Redes sociais (se divulgadas oficialmente)
    redes_sociais: Dict[str, str] = Field(default_factory=dict)

    # Formação e carreira (se disponível na fonte)
    formacao_academica: List[str] = Field(default_factory=list)
    profissao_declarada: Optional[str] = None

    # Atuação parlamentar (da fonte oficial)
    comissoes_atuais: List[str] = Field(default_factory=list)
    frentes_parlamentares: List[str] = Field(default_factory=list)
    cargos_lideranca: List[str] = Field(default_factory=list)

    # Metadados
    fontes: List[FonteDados] = Field(default_factory=list)
    data_coleta: datetime = Field(default_factory=datetime.utcnow)
    versao_snapshot: Optional[str] = Field(None, description="Versão do snapshot (YYYY-MM-DD)")


# ============================================
# CAMADA 2: DERIVADOS (calculados dos fatos)
# ============================================


class MetricaDerivada(BaseModel):
    """Métrica calculada com método transparente"""
    valor: Any
    metodo_calculo: str = Field(..., description="Como foi calculado")
    dados_base: List[str] = Field(default_factory=list, description="Campos usados no cálculo")


class ParlamentarDerivados(BaseModel):
    """
    CAMADA DE DERIVADOS

    Métricas calculadas automaticamente a partir dos fatos.
    Cada métrica inclui o método de cálculo para transparência.
    """
    model_config = ConfigDict(extra="allow")

    # Idade calculada
    idade: Optional[MetricaDerivada] = None

    # Completude do perfil
    completude_perfil: MetricaDerivada = Field(
        default_factory=lambda: MetricaDerivada(
            valor=0.0,
            metodo_calculo="(campos_preenchidos / total_campos) * 100",
            dados_base=["todos os campos de fatos"]
        )
    )

    # Temas dominantes (baseado em comissões e frentes)
    temas_dominantes: MetricaDerivada = Field(
        default_factory=lambda: MetricaDerivada(
            valor=[],
            metodo_calculo="Extração de temas das comissões e frentes parlamentares",
            dados_base=["comissoes_atuais", "frentes_parlamentares"]
        )
    )

    # Tempo de mandato
    tempo_mandato_dias: Optional[MetricaDerivada] = None

    # Índice de presença (se disponível via API)
    indice_presenca: Optional[MetricaDerivada] = None

    # Quantidade de proposições (se disponível via API)
    total_proposicoes: Optional[MetricaDerivada] = None


# ============================================
# CAMADA 3: HIPÓTESES (inferências opcionais)
# ============================================


class Hipotese(BaseModel):
    """
    Uma hipótese/inferência sobre o parlamentar.
    Sempre inclui confiança e justificativa.
    """
    label: str = Field(..., description="Nome/rótulo da hipótese")
    valor: Any = Field(..., description="Valor inferido")
    confianca: NivelConfiancaEnum = Field(
        default=NivelConfiancaEnum.baixa,
        description="Nível de confiança na inferência"
    )
    rationale: str = Field(
        ...,
        description="Justificativa para a inferência"
    )
    evidencias: List[str] = Field(
        default_factory=list,
        description="Evidências que suportam a hipótese"
    )
    inferido_em: datetime = Field(default_factory=datetime.utcnow)


class ParlamentarHipoteses(BaseModel):
    """
    CAMADA DE HIPÓTESES

    Inferências opcionais sobre o parlamentar.
    Por padrão, deixar vazio se não houver base sólida.
    Cada hipótese DEVE incluir confiança e justificativa.
    """
    model_config = ConfigDict(extra="allow")

    # Orientação política inferida
    orientacao_politica: Optional[Hipotese] = None

    # Posições políticas inferidas
    posicao_bolsonaro: Optional[Hipotese] = None
    posicao_lula: Optional[Hipotese] = None
    relacao_governo_atual: Optional[Hipotese] = None

    # Estilo de comunicação inferido
    estilo_comunicacao: Optional[Hipotese] = None
    estilo_decisao: Optional[Hipotese] = None

    # Perfil psicológico inferido
    valores_inferidos: Optional[Hipotese] = None
    preocupacoes_inferidas: Optional[Hipotese] = None
    vieses_cognitivos: Optional[Hipotese] = None

    # Instrução comportamental para IA (se inferida)
    instrucao_comportamental: Optional[Hipotese] = None


# ============================================
# PERFIL COMPLETO
# ============================================


class ParlamentarProfile(BaseModel):
    """
    Perfil completo de parlamentar com camadas de verdade.

    - fatos: dados verificáveis (NUNCA inventar)
    - derivados: calculados automaticamente
    - hipoteses: inferências opcionais (por padrão vazias)
    """
    fatos: ParlamentarFatos
    derivados: ParlamentarDerivados = Field(default_factory=ParlamentarDerivados)
    hipoteses: ParlamentarHipoteses = Field(default_factory=ParlamentarHipoteses)

    @property
    def id(self) -> str:
        return self.fatos.id

    @property
    def nome(self) -> str:
        return self.fatos.nome_parlamentar

    @property
    def casa(self) -> CasaLegislativaEnum:
        return self.fatos.casa_legislativa

    @property
    def partido(self) -> str:
        return self.fatos.partido


# ============================================
# RESPOSTAS API
# ============================================


class ParlamentarResponse(BaseModel):
    """Resposta simplificada para listagens"""
    model_config = ConfigDict(from_attributes=True)

    id: str
    nome: str
    nome_parlamentar: str
    casa_legislativa: CasaLegislativaEnum
    cargo: CargoEnum
    partido: str
    uf: str
    url_foto: Optional[str] = None
    completude_perfil: float = 0.0


class ParlamentarListResponse(BaseModel):
    """Resposta com lista paginada"""
    parlamentares: List[ParlamentarResponse]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int
    filtros_aplicados: Dict[str, Any]


class FiltrosParlamentar(BaseModel):
    """Filtros para busca de parlamentares"""

    # Por casa legislativa
    casas: Optional[List[CasaLegislativaEnum]] = None

    # Por partido
    partidos: Optional[List[str]] = None

    # Por UF
    ufs: Optional[List[str]] = None

    # Por gênero
    generos: Optional[List[GeneroEnum]] = None

    # Por orientação política (hipótese)
    orientacoes_politicas: Optional[List[OrientacaoPoliticaEnum]] = None

    # Por relação com governo (hipótese)
    relacoes_governo: Optional[List[RelacaoGovernoEnum]] = None

    # Busca textual
    busca_texto: Optional[str] = None

    # Paginação
    pagina: int = Field(default=1, ge=1)
    por_pagina: int = Field(default=50, ge=1, le=200)

    # Ordenação
    ordenar_por: str = "nome_parlamentar"
    ordem: str = "asc"


class EstatisticasParlamentares(BaseModel):
    """Estatísticas dos parlamentares"""
    total: int
    por_casa: Dict[str, int]
    por_partido: Dict[str, int]
    por_genero: Dict[str, int]
    por_uf: Dict[str, int]
    completude_media: float
    data_ultimo_snapshot: Optional[str] = None
