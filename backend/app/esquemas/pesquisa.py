"""
Esquemas de Pesquisa Persistida

Modelos Pydantic para validação e serialização de pesquisas no banco de dados.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ============================================
# ENUMS
# ============================================


class TipoPesquisa(str, Enum):
    quantitativa = "quantitativa"
    qualitativa = "qualitativa"
    mista = "mista"


class StatusPesquisa(str, Enum):
    rascunho = "rascunho"
    executando = "executando"
    pausada = "pausada"
    concluida = "concluida"
    erro = "erro"


class TipoPerguntaPesquisa(str, Enum):
    aberta = "aberta"
    aberta_longa = "aberta_longa"
    escala_likert = "escala_likert"
    multipla_escolha = "multipla_escolha"
    sim_nao = "sim_nao"
    ranking = "ranking"


# ============================================
# PERGUNTA
# ============================================


class PerguntaPesquisaBase(BaseModel):
    """Base de uma pergunta de pesquisa"""

    texto: str = Field(..., min_length=10, max_length=2000)
    tipo: TipoPerguntaPesquisa = TipoPerguntaPesquisa.aberta
    ordem: int = 0
    obrigatoria: bool = True
    opcoes: Optional[List[str]] = None
    escala_min: Optional[int] = None
    escala_max: Optional[int] = None
    escala_rotulos: Optional[List[str]] = None
    instrucoes_ia: Optional[str] = None


class PerguntaPesquisaCreate(PerguntaPesquisaBase):
    """Criação de pergunta"""
    pass


class PerguntaPesquisaResponse(PerguntaPesquisaBase):
    """Resposta de pergunta"""

    id: str
    pesquisa_id: str
    criado_em: datetime

    class Config:
        from_attributes = True


# ============================================
# RESPOSTA
# ============================================


class RespostaPesquisaBase(BaseModel):
    """Base de uma resposta"""

    eleitor_id: str
    eleitor_nome: str
    resposta_texto: str
    resposta_valor: Optional[Any] = None
    fluxo_cognitivo: Optional[Dict[str, Any]] = None
    sentimento: Optional[str] = None
    intensidade_sentimento: Optional[float] = None
    modelo_usado: str = "claude-sonnet-4-20250514"
    tokens_entrada: int = 0
    tokens_saida: int = 0
    custo_reais: float = 0.0
    tempo_resposta_ms: int = 0


class RespostaPesquisaCreate(RespostaPesquisaBase):
    """Criação de resposta"""

    pesquisa_id: str
    pergunta_id: str
    eleitor_perfil: Optional[Dict[str, Any]] = None


class RespostaPesquisaResponse(RespostaPesquisaBase):
    """Resposta completa"""

    id: str
    pesquisa_id: str
    pergunta_id: str
    eleitor_perfil: Optional[Dict[str, Any]] = None
    criado_em: datetime

    class Config:
        from_attributes = True


class RespostaPesquisaDetalhada(RespostaPesquisaResponse):
    """Resposta com dados da pergunta"""

    pergunta_texto: Optional[str] = None
    pergunta_tipo: Optional[str] = None


# ============================================
# PESQUISA
# ============================================


class PesquisaBase(BaseModel):
    """Base de uma pesquisa"""

    titulo: str = Field(..., min_length=3, max_length=200)
    descricao: Optional[str] = None
    tipo: TipoPesquisa = TipoPesquisa.mista
    instrucao_geral: Optional[str] = None


class PesquisaCreate(PesquisaBase):
    """Criação de pesquisa"""

    perguntas: List[PerguntaPesquisaCreate]
    eleitores_ids: List[str] = Field(..., min_length=1)
    limite_custo: float = Field(default=100.0, gt=0, le=500)
    usar_opus_complexas: bool = True
    batch_size: int = Field(default=10, ge=1, le=50)


class PesquisaUpdate(BaseModel):
    """Atualização de pesquisa"""

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
    """Resumo de pesquisa para listagens"""

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
    """Resposta completa de pesquisa"""

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
    """Pesquisa com todas as respostas"""

    respostas: List[RespostaPesquisaResponse] = []


# ============================================
# LISTAGEM E FILTROS
# ============================================


class FiltrosPesquisa(BaseModel):
    """Filtros para listagem de pesquisas"""

    status: Optional[StatusPesquisa] = None
    tipo: Optional[TipoPesquisa] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    busca: Optional[str] = None


class PesquisaListResponse(BaseModel):
    """Resposta paginada de pesquisas"""

    pesquisas: List[PesquisaResumo]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int


class RespostaListResponse(BaseModel):
    """Resposta paginada de respostas"""

    respostas: List[RespostaPesquisaResponse]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int


# ============================================
# ANÁLISE GLOBAL / DASHBOARD
# ============================================


class DashboardGlobal(BaseModel):
    """Métricas globais do dashboard"""

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
    """Correlação entre variáveis"""

    variavel_x: str
    variavel_y: str
    coeficiente: float
    p_valor: float
    significancia: str  # alta, media, baixa
    amostra: int
    interpretacao: str


class TendenciaTemporal(BaseModel):
    """Tendência ao longo do tempo"""

    periodo: str  # "2026-01", "2026-01-15", etc.
    pesquisas_realizadas: int
    respostas_coletadas: int
    custo_total: float
    sentimento_medio: Optional[float] = None


class SegmentoAnalise(BaseModel):
    """Análise por segmento de eleitores"""

    segmento: str  # cluster, região, orientação, etc.
    valor: str  # "classe_a", "plano_piloto", "direita", etc.
    total_participacoes: int
    sentimento_predominante: Optional[str] = None
    temas_recorrentes: Optional[List[str]] = None
    citacao_exemplo: Optional[str] = None


class InsightGlobal(BaseModel):
    """Insight descoberto nas análises"""

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
    """Histórico de participações de um eleitor"""

    eleitor_id: str
    eleitor_nome: str
    total_participacoes: int
    pesquisas: List[Dict[str, Any]]  # Lista de {pesquisa_id, titulo, data, respostas}
    sentimento_medio: Optional[float] = None
    temas_recorrentes: Optional[List[str]] = None


class HistoricoPergunta(BaseModel):
    """Histórico de uma pergunta em diferentes pesquisas"""

    texto_pergunta: str
    total_ocorrencias: int
    pesquisas: List[Dict[str, Any]]  # Lista de {pesquisa_id, titulo, total_respostas, sentimento}
    evolucao_sentimento: Optional[List[Dict[str, Any]]] = None


# ============================================
# EXPORTAÇÃO
# ============================================


class ExportacaoRequest(BaseModel):
    """Requisição de exportação"""

    formato: str = Field(..., pattern="^(xlsx|csv|json|pdf)$")
    pesquisa_ids: Optional[List[str]] = None  # None = todas
    incluir_respostas: bool = True
    incluir_analises: bool = True
    incluir_perfil_eleitor: bool = False


class ExportacaoResponse(BaseModel):
    """Resposta de exportação"""

    arquivo_url: str
    formato: str
    tamanho_bytes: int
    total_registros: int
    criado_em: datetime
