"""
Esquemas Pydantic para Pesquisas Persistidas.

Modelos para validação e serialização de pesquisas, perguntas e respostas.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ============================================
# ENUMS
# ============================================


class TipoPesquisa(str, Enum):
    """Tipo de pesquisa eleitoral."""

    quantitativa = "quantitativa"
    qualitativa = "qualitativa"
    mista = "mista"


# Alias para compatibilidade
TipoPesquisaEnum = TipoPesquisa


class StatusPesquisa(str, Enum):
    """Status de execução da pesquisa."""

    rascunho = "rascunho"
    agendada = "agendada"
    executando = "executando"
    pausada = "pausada"
    concluida = "concluida"
    cancelada = "cancelada"
    erro = "erro"


# Alias para compatibilidade
StatusPesquisaEnum = StatusPesquisa


class TipoPerguntaPesquisa(str, Enum):
    """Tipo de pergunta."""

    aberta = "aberta"
    aberta_longa = "aberta_longa"
    escala_likert = "escala_likert"
    multipla_escolha = "multipla_escolha"
    sim_nao = "sim_nao"
    ranking = "ranking"
    numerica = "numerica"


# Alias para compatibilidade
TipoPerguntaEnum = TipoPerguntaPesquisa


# ============================================
# PERGUNTA
# ============================================


class PerguntaPesquisaBase(BaseModel):
    """Base de uma pergunta de pesquisa."""

    texto: str = Field(..., min_length=5, max_length=2000)
    tipo: TipoPerguntaPesquisa = TipoPerguntaPesquisa.aberta
    ordem: int = 0
    obrigatoria: bool = True
    opcoes: Optional[List[str]] = None
    escala_min: Optional[int] = None
    escala_max: Optional[int] = None
    escala_rotulos: Optional[List[str]] = None
    instrucoes_ia: Optional[str] = None
    codigo: Optional[str] = None


class PerguntaPesquisaCreate(PerguntaPesquisaBase):
    """Criação de pergunta."""

    pass


class PerguntaPesquisaResponse(PerguntaPesquisaBase):
    """Resposta de pergunta com ID."""

    id: str
    pesquisa_id: str
    criado_em: datetime

    class Config:
        from_attributes = True


# ============================================
# RESPOSTA
# ============================================


class RespostaPesquisaBase(BaseModel):
    """Base de uma resposta."""

    eleitor_id: str
    eleitor_nome: Optional[str] = None
    resposta_texto: str
    resposta_valor: Optional[Any] = None


class RespostaPesquisaCreate(RespostaPesquisaBase):
    """Criação de resposta."""

    pesquisa_id: str
    pergunta_id: str
    eleitor_perfil: Optional[Dict[str, Any]] = None
    fluxo_cognitivo: Optional[Dict[str, Any]] = None
    sentimento: Optional[str] = None
    intensidade_sentimento: Optional[float] = None
    modelo_usado: str = "claude-sonnet-4-20250514"
    tokens_entrada: int = 0
    tokens_saida: int = 0
    custo_reais: float = 0.0
    tempo_resposta_ms: int = 0
    metadados: Optional[Dict[str, Any]] = None


# Alias para compatibilidade
RespostaCreate = RespostaPesquisaCreate


class RespostaPesquisaResponse(RespostaPesquisaBase):
    """Resposta completa com metadados."""

    id: str
    pesquisa_id: str
    pergunta_id: str
    eleitor_perfil: Optional[Dict[str, Any]] = None
    fluxo_cognitivo: Optional[Dict[str, Any]] = None
    sentimento: Optional[str] = None
    intensidade_sentimento: Optional[float] = None
    modelo_usado: str
    tokens_entrada: int
    tokens_saida: int
    custo_reais: float
    tempo_resposta_ms: int
    criado_em: datetime

    class Config:
        from_attributes = True


# Alias para compatibilidade
RespostaResponse = RespostaPesquisaResponse


class RespostaPesquisaDetalhada(RespostaPesquisaResponse):
    """Resposta com dados derivados do fluxo cognitivo."""

    pergunta_texto: Optional[str] = None
    pergunta_tipo: Optional[str] = None
    sentimento_dominante: Optional[str] = None
    intensidade_emocional: Optional[int] = None
    mudaria_voto: Optional[bool] = None

    @classmethod
    def from_resposta(cls, resposta: "RespostaPesquisaResponse") -> "RespostaPesquisaDetalhada":
        """Cria RespostaPesquisaDetalhada a partir de RespostaPesquisaResponse."""
        dados = resposta.model_dump()

        # Extrair dados do fluxo cognitivo
        fluxo = resposta.fluxo_cognitivo or {}
        if "emocional" in fluxo:
            dados["sentimento_dominante"] = fluxo["emocional"].get("sentimento_dominante")
            dados["intensidade_emocional"] = fluxo["emocional"].get("intensidade")
        if "decisao" in fluxo:
            dados["mudaria_voto"] = fluxo["decisao"].get("muda_intencao_voto")

        return cls(**dados)


# ============================================
# PESQUISA
# ============================================


class PesquisaBase(BaseModel):
    """Base de uma pesquisa."""

    titulo: str = Field(..., min_length=3, max_length=200)
    descricao: Optional[str] = None
    tipo: TipoPesquisa = TipoPesquisa.mista
    instrucao_geral: Optional[str] = None


class PesquisaCreate(PesquisaBase):
    """Criação de pesquisa."""

    perguntas: List[PerguntaPesquisaCreate]
    eleitores_ids: List[str] = Field(..., min_length=1)
    limite_custo: float = Field(default=100.0, gt=0, le=500)
    usar_opus_complexas: bool = True
    batch_size: int = Field(default=10, ge=1, le=50)


class PesquisaUpdate(BaseModel):
    """Atualização de pesquisa."""

    titulo: Optional[str] = None
    descricao: Optional[str] = None
    status: Optional[StatusPesquisa] = None
    progresso: Optional[int] = None
    erro_mensagem: Optional[str] = None
    custo_real: Optional[float] = None
    tokens_entrada_total: Optional[int] = None
    tokens_saida_total: Optional[int] = None
    eleitores_processados: Optional[int] = None
    total_respostas: Optional[int] = None
    iniciado_em: Optional[datetime] = None
    pausado_em: Optional[datetime] = None
    concluido_em: Optional[datetime] = None


class PesquisaResumo(BaseModel):
    """Resumo de pesquisa para listagens."""

    id: str
    titulo: str
    tipo: TipoPesquisa
    status: StatusPesquisa
    progresso: int
    total_eleitores: int
    total_perguntas: int
    total_respostas: int
    custo_real: float
    criado_em: datetime
    concluido_em: Optional[datetime] = None

    class Config:
        from_attributes = True


class PesquisaResponse(PesquisaBase):
    """Resposta completa de pesquisa."""

    id: str
    status: StatusPesquisa
    progresso: int
    erro_mensagem: Optional[str] = None

    # Contagens
    total_eleitores: int
    total_perguntas: int
    total_respostas: int
    eleitores_processados: int
    eleitores_ids: Optional[List[str]] = None

    # Custos
    custo_estimado: float
    custo_real: float
    tokens_entrada_total: int
    tokens_saida_total: int
    limite_custo: float
    usar_opus_complexas: bool
    batch_size: int

    # Timestamps
    criado_em: datetime
    atualizado_em: datetime
    iniciado_em: Optional[datetime] = None
    pausado_em: Optional[datetime] = None
    concluido_em: Optional[datetime] = None

    # Relacionamentos
    perguntas: List[PerguntaPesquisaResponse] = []

    class Config:
        from_attributes = True


class PesquisaCompleta(PesquisaResponse):
    """Pesquisa com todas as respostas."""

    respostas: List[RespostaPesquisaResponse] = []


# ============================================
# LISTAGEM E FILTROS
# ============================================


class FiltrosPesquisa(BaseModel):
    """Filtros para listagem de pesquisas."""

    status: Optional[StatusPesquisa] = None
    tipo: Optional[TipoPesquisa] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    busca: Optional[str] = None
    pagina: int = Field(default=1, ge=1)
    por_pagina: int = Field(default=20, ge=1, le=100)
    ordenar_por: str = "criado_em"
    ordem_desc: bool = True


class PesquisaListResponse(BaseModel):
    """Resposta paginada de pesquisas."""

    pesquisas: List[PesquisaResumo]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int


class RespostaListResponse(BaseModel):
    """Resposta paginada de respostas."""

    respostas: List[RespostaPesquisaResponse]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int = 1


# ============================================
# ANÁLISE GLOBAL / DASHBOARD
# ============================================


class DashboardGlobal(BaseModel):
    """Métricas globais do dashboard."""

    # Totais
    total_pesquisas: int
    total_pesquisas_concluidas: int
    total_respostas: int
    total_eleitores_unicos: int

    # Custos
    custo_total_reais: float
    tokens_entrada_total: int
    tokens_saida_total: int

    # Médias
    media_respostas_por_pesquisa: float
    media_custo_por_pesquisa: float
    media_tempo_execucao_segundos: float

    # Sentimentos acumulados
    sentimentos_acumulados: Optional[Dict[str, int]] = None

    # Última atualização
    atualizado_em: datetime


class CorrelacaoGlobal(BaseModel):
    """Correlação entre variáveis."""

    variavel_x: str
    variavel_y: str
    coeficiente: float
    p_valor: float
    significancia: str  # alta, media, baixa
    amostra: int
    interpretacao: str


class TendenciaTemporal(BaseModel):
    """Tendência ao longo do tempo."""

    periodo: str  # "2026-01", "2026-01-15", etc.
    pesquisas_realizadas: int
    respostas_coletadas: int
    custo_total: float
    sentimento_medio: Optional[float] = None


class SegmentoAnalise(BaseModel):
    """Análise por segmento de eleitores."""

    segmento: str  # cluster, região, orientação, etc.
    valor: str  # "classe_a", "plano_piloto", "direita", etc.
    total_participacoes: int
    sentimento_predominante: Optional[str] = None
    temas_recorrentes: Optional[List[str]] = None
    citacao_exemplo: Optional[str] = None


class InsightGlobal(BaseModel):
    """Insight descoberto nas análises."""

    tipo: str  # descoberta, alerta, correlacao, tendencia
    titulo: str
    descricao: str
    relevancia: str  # alta, media, baixa
    dados_suporte: Optional[Dict[str, Any]] = None
    pesquisas_relacionadas: Optional[List[str]] = None
    criado_em: datetime


# ============================================
# HISTÓRICO
# ============================================


class HistoricoEleitor(BaseModel):
    """Histórico de participações de um eleitor."""

    eleitor_id: str
    eleitor_nome: str
    total_participacoes: int
    pesquisas: List[Dict[str, Any]]  # Lista de {pesquisa_id, titulo, data, respostas}
    sentimento_medio: Optional[float] = None
    temas_recorrentes: Optional[List[str]] = None


class HistoricoPergunta(BaseModel):
    """Histórico de uma pergunta em diferentes pesquisas."""

    texto_pergunta: str
    total_ocorrencias: int
    pesquisas: List[Dict[str, Any]]  # Lista de {pesquisa_id, titulo, total_respostas, sentimento}
    evolucao_sentimento: Optional[List[Dict[str, Any]]] = None


# ============================================
# AÇÕES
# ============================================


class IniciarPesquisaRequest(BaseModel):
    """Requisição para iniciar execução de pesquisa."""

    usar_opus_para_complexas: bool = True
    limite_custo: Optional[float] = Field(None, gt=0, le=500)
    batch_size: int = Field(default=10, ge=1, le=50)


class StatusResponse(BaseModel):
    """Resposta de status de operação."""

    sucesso: bool
    mensagem: str
    dados: Optional[Dict[str, Any]] = None


# ============================================
# EXPORTAÇÃO
# ============================================


class ExportacaoRequest(BaseModel):
    """Requisição de exportação."""

    formato: str = Field(..., pattern="^(xlsx|csv|json|pdf)$")
    pesquisa_ids: Optional[List[str]] = None  # None = todas
    incluir_respostas: bool = True
    incluir_analises: bool = True
    incluir_perfil_eleitor: bool = False


class ExportacaoResponse(BaseModel):
    """Resposta de exportação."""

    arquivo_url: str
    formato: str
    tamanho_bytes: int
    total_registros: int
    criado_em: datetime
