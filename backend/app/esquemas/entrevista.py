"""
Esquemas de Entrevista

Modelos Pydantic para validação e serialização de entrevistas e respostas.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

# ============================================
# ENUMS
# ============================================


class TipoEntrevista(str, Enum):
    quantitativa = "quantitativa"
    qualitativa = "qualitativa"
    mista = "mista"


class StatusEntrevista(str, Enum):
    rascunho = "rascunho"
    executando = "executando"
    pausada = "pausada"
    concluida = "concluida"
    erro = "erro"


class TipoPergunta(str, Enum):
    aberta = "aberta"
    aberta_longa = "aberta_longa"
    escala_likert = "escala_likert"
    multipla_escolha = "multipla_escolha"
    sim_nao = "sim_nao"
    ranking = "ranking"


class SentimentoDominante(str, Enum):
    seguranca = "seguranca"
    ameaca = "ameaca"
    indiferenca = "indiferenca"
    raiva = "raiva"
    esperanca = "esperanca"


class TipoRespondente(str, Enum):
    """Tipo de respondente da entrevista"""
    eleitor = "eleitor"
    parlamentar = "parlamentar"


# ============================================
# PERGUNTA
# ============================================


class PerguntaBase(BaseModel):
    """Base de uma pergunta"""

    texto: str = Field(..., min_length=10, max_length=2000)
    tipo: TipoPergunta
    obrigatoria: bool = True
    opcoes: Optional[List[str]] = None
    escala_min: Optional[int] = None
    escala_max: Optional[int] = None
    escala_rotulos: Optional[List[str]] = None
    instrucoes_ia: Optional[str] = None


class PerguntaCreate(PerguntaBase):
    """Criação de pergunta"""

    pass


class Pergunta(PerguntaBase):
    """Pergunta com ID"""

    id: str


# ============================================
# FLUXO COGNITIVO
# ============================================


class FluxoCognitivo(BaseModel):
    """Resposta do Chain of Thought de 4 etapas"""

    # Etapa 1: Filtro de Atenção
    atencao: Dict[str, Any] = Field(
        default_factory=lambda: {"prestaria_atencao": True, "motivo": ""}
    )

    # Etapa 2: Viés de Confirmação
    vies: Dict[str, Any] = Field(
        default_factory=lambda: {
            "confirma_crencas": False,
            "ameaca_valores": False,
            "ativa_medos": [],
        }
    )

    # Etapa 3: Reação Emocional
    emocional: Dict[str, Any] = Field(
        default_factory=lambda: {
            "sentimento_dominante": "indiferenca",
            "intensidade": 5,
        }
    )

    # Etapa 4: Decisão
    decisao: Dict[str, Any] = Field(
        default_factory=lambda: {
            "muda_intencao_voto": False,
            "aumenta_cinismo": False,
            "acao_provavel": "",
            "resposta_final": "",
        }
    )


# ============================================
# RESPOSTA DO ELEITOR
# ============================================


class RespostaEleitor(BaseModel):
    """
    Resposta de um respondente (eleitor ou parlamentar) a uma pergunta.

    Mantém campos legados (eleitor_id, eleitor_nome) para compatibilidade,
    mas também suporta campos genéricos (respondente_id, respondente_nome).
    """

    id: str
    entrevista_id: str
    pergunta_id: str

    # Campos legados (compatibilidade)
    eleitor_id: Optional[str] = None
    eleitor_nome: Optional[str] = None

    # Campos genéricos (novo)
    tipo_respondente: TipoRespondente = TipoRespondente.eleitor
    respondente_id: Optional[str] = None
    respondente_nome: Optional[str] = None

    # Resposta
    resposta_texto: str
    resposta_valor: Optional[Any] = None  # Para escalas/múltipla escolha

    # Chain of Thought
    fluxo_cognitivo: Optional[FluxoCognitivo] = None

    # Metadados
    modelo_usado: str = "claude-sonnet-4-20250514"
    tokens_entrada: int = 0
    tokens_saida: int = 0
    custo_reais: float = 0.0
    tempo_resposta_ms: int = 0

    criado_em: datetime = Field(default_factory=datetime.now)


# ============================================
# ENTREVISTA
# ============================================


class EntrevistaBase(BaseModel):
    """Base de entrevista"""

    titulo: str = Field(..., min_length=3, max_length=200)
    descricao: Optional[str] = None
    tipo: TipoEntrevista = TipoEntrevista.mista
    instrucao_geral: Optional[str] = None


class EntrevistaCreate(EntrevistaBase):
    """
    Criação de entrevista

    Suporta dois modos de definição de respondentes:
    1. Modo legado: usar apenas eleitores_ids (compatibilidade)
    2. Modo novo: usar tipo_respondente + respondentes_ids

    Se tipo_respondente for definido, respondentes_ids será usado.
    Se não, eleitores_ids será usado (compatibilidade).
    """

    perguntas: List[PerguntaCreate]

    # Modo legado (compatibilidade)
    eleitores_ids: Optional[List[str]] = Field(default=None, max_length=500)

    # Modo novo (generalizado)
    tipo_respondente: Optional[TipoRespondente] = None
    respondentes_ids: Optional[List[str]] = Field(default=None, max_length=500)


class EntrevistaUpdate(BaseModel):
    """Atualização de entrevista"""

    titulo: Optional[str] = None
    descricao: Optional[str] = None
    status: Optional[StatusEntrevista] = None


class Entrevista(EntrevistaBase):
    """Entrevista completa"""

    id: str
    perguntas: List[Pergunta]

    # Respondentes (modo legado + novo)
    eleitores_ids: List[str] = Field(default_factory=list)
    total_eleitores: int = 0

    # Suporte a respondentes genéricos (parlamentares/eleitores)
    tipo_respondente: TipoRespondente = TipoRespondente.eleitor
    respondentes_ids: List[str] = Field(default_factory=list)
    total_respondentes: int = 0

    # Status
    status: StatusEntrevista = StatusEntrevista.rascunho
    progresso: int = 0  # 0-100
    erro_mensagem: Optional[str] = None

    # Custos
    custo_estimado: float = 0.0
    custo_real: float = 0.0
    tokens_entrada_total: int = 0
    tokens_saida_total: int = 0

    # Timestamps
    criado_em: datetime = Field(default_factory=datetime.now)
    iniciado_em: Optional[datetime] = None
    pausado_em: Optional[datetime] = None
    concluido_em: Optional[datetime] = None


class EntrevistaListResponse(BaseModel):
    """Resposta com lista de entrevistas"""

    entrevistas: List[Entrevista]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int


# ============================================
# EXECUÇÃO
# ============================================


class IniciarEntrevistaRequest(BaseModel):
    """Requisição para iniciar entrevista"""

    usar_opus_para_complexas: bool = True
    limite_custo_reais: float = Field(default=100.0, gt=0, le=500)
    batch_size: int = Field(default=10, ge=1, le=50)
    delay_entre_batches_ms: int = Field(default=500, ge=100, le=5000)


class ProgressoEntrevista(BaseModel):
    """Progresso da execução"""

    entrevista_id: str
    status: StatusEntrevista
    progresso: int
    total_eleitores: int
    eleitores_processados: int
    perguntas_processadas: int
    total_perguntas: int

    # Custos
    custo_atual: float
    custo_estimado_final: float
    limite_custo: float

    # Tokens
    tokens_entrada: int
    tokens_saida: int

    # Tempo
    tempo_decorrido_segundos: int
    tempo_estimado_restante_segundos: int

    # Última resposta
    ultima_resposta: Optional[Dict[str, Any]] = None


# ============================================
# CUSTOS
# ============================================


class EstimativaCusto(BaseModel):
    """Estimativa de custo para entrevista"""

    total_perguntas: int
    total_eleitores: int
    total_chamadas: int

    # Por modelo
    chamadas_opus: int
    chamadas_sonnet: int

    # Tokens estimados
    tokens_entrada_estimados: int
    tokens_saida_estimados: int

    # Custos em reais
    custo_minimo: float
    custo_maximo: float
    custo_medio: float

    # Detalhamento
    custo_por_eleitor: float
    custo_por_pergunta: float
