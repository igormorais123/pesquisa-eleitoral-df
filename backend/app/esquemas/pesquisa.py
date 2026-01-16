"""
Esquemas Pydantic para Pesquisas.

Modelos para validação e serialização de pesquisas, perguntas e respostas persistidas.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# ============================================
# ENUMS
# ============================================


class TipoPesquisaEnum(str, Enum):
    """Tipo de pesquisa eleitoral."""

    quantitativa = "quantitativa"
    qualitativa = "qualitativa"
    mista = "mista"


class StatusPesquisaEnum(str, Enum):
    """Status de execução da pesquisa."""

    rascunho = "rascunho"
    agendada = "agendada"
    executando = "executando"
    pausada = "pausada"
    concluida = "concluida"
    cancelada = "cancelada"
    erro = "erro"


class TipoPerguntaEnum(str, Enum):
    """Tipo de pergunta."""

    aberta = "aberta"
    aberta_longa = "aberta_longa"
    escala_likert = "escala_likert"
    multipla_escolha = "multipla_escolha"
    sim_nao = "sim_nao"
    ranking = "ranking"
    numerica = "numerica"


# ============================================
# PERGUNTA
# ============================================


class PerguntaPesquisaBase(BaseModel):
    """Base de uma pergunta de pesquisa."""

    texto: str = Field(..., min_length=5, max_length=2000)
    tipo: TipoPerguntaEnum = TipoPerguntaEnum.aberta
    obrigatoria: bool = True
    opcoes: Optional[list[str]] = None
    escala_min: Optional[int] = None
    escala_max: Optional[int] = None
    escala_rotulos: Optional[dict[str, str]] = None
    instrucoes_ia: Optional[str] = None
    codigo: Optional[str] = None


class PerguntaPesquisaCreate(PerguntaPesquisaBase):
    """Criação de pergunta."""

    pass


class PerguntaPesquisaResponse(PerguntaPesquisaBase):
    """Resposta de pergunta com ID."""

    id: int
    pesquisa_id: int
    ordem: int
    criado_em: datetime

    class Config:
        from_attributes = True


# ============================================
# RESPOSTA
# ============================================


class RespostaBase(BaseModel):
    """Base de uma resposta."""

    eleitor_id: str
    eleitor_nome: Optional[str] = None
    resposta_texto: str
    resposta_valor: Optional[Any] = None


class RespostaCreate(RespostaBase):
    """Criação de resposta."""

    pergunta_id: int
    fluxo_cognitivo: Optional[dict[str, Any]] = None
    modelo_usado: str = "claude-sonnet-4-20250514"
    tokens_entrada: int = 0
    tokens_saida: int = 0
    custo: float = 0.0
    tempo_resposta_ms: int = 0
    metadados: Optional[dict[str, Any]] = None


class RespostaResponse(RespostaBase):
    """Resposta com ID e metadados."""

    id: int
    pesquisa_id: int
    pergunta_id: int
    fluxo_cognitivo: Optional[dict[str, Any]] = None
    modelo_usado: str
    tokens_entrada: int
    tokens_saida: int
    custo: float
    tempo_resposta_ms: int
    criado_em: datetime

    class Config:
        from_attributes = True


class RespostaDetalhada(RespostaResponse):
    """Resposta com dados derivados do fluxo cognitivo."""

    sentimento_dominante: Optional[str] = None
    intensidade_emocional: Optional[int] = None
    mudaria_voto: Optional[bool] = None

    @classmethod
    def from_resposta(cls, resposta: "RespostaResponse") -> "RespostaDetalhada":
        """Cria RespostaDetalhada a partir de RespostaResponse."""
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
    tipo: TipoPesquisaEnum = TipoPesquisaEnum.mista
    instrucao_geral: Optional[str] = None


class PesquisaCreate(PesquisaBase):
    """Criação de pesquisa."""

    perguntas: list[PerguntaPesquisaCreate]
    eleitores_ids: list[str] = Field(..., min_length=1, max_length=1000)
    limite_custo: Optional[float] = Field(None, gt=0, le=1000)


class PesquisaUpdate(BaseModel):
    """Atualização de pesquisa."""

    titulo: Optional[str] = None
    descricao: Optional[str] = None
    status: Optional[StatusPesquisaEnum] = None
    erro_mensagem: Optional[str] = None


class PesquisaResumo(PesquisaBase):
    """Resumo de pesquisa para listagens."""

    id: int
    status: StatusPesquisaEnum
    total_eleitores: int
    eleitores_processados: int
    progresso: int
    custo_total: float
    criado_em: datetime
    finalizado_em: Optional[datetime] = None

    class Config:
        from_attributes = True


class PesquisaResponse(PesquisaResumo):
    """Resposta de pesquisa com mais detalhes."""

    tokens_entrada_total: int
    tokens_saida_total: int
    tokens_total: int
    custo_estimado: float
    limite_custo: Optional[float] = None
    iniciado_em: Optional[datetime] = None
    pausado_em: Optional[datetime] = None
    erro_mensagem: Optional[str] = None
    atualizado_em: Optional[datetime] = None

    class Config:
        from_attributes = True


class PesquisaCompleta(PesquisaResponse):
    """Pesquisa com todas as relações."""

    perguntas: list[PerguntaPesquisaResponse] = []

    class Config:
        from_attributes = True


# ============================================
# FILTROS
# ============================================


class FiltrosPesquisa(BaseModel):
    """Filtros para listagem de pesquisas."""

    status: Optional[StatusPesquisaEnum] = None
    tipo: Optional[TipoPesquisaEnum] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    busca: Optional[str] = None
    pagina: int = Field(default=1, ge=1)
    por_pagina: int = Field(default=20, ge=1, le=100)
    ordenar_por: str = "criado_em"
    ordem_desc: bool = True


# ============================================
# LISTAGEM
# ============================================


class PesquisaListResponse(BaseModel):
    """Resposta de listagem de pesquisas."""

    pesquisas: list[PesquisaResumo]
    total: int
    pagina: int
    por_pagina: int
    total_paginas: int


class RespostaListResponse(BaseModel):
    """Resposta de listagem de respostas."""

    respostas: list[RespostaResponse]
    total: int
    pagina: int
    por_pagina: int


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
    dados: Optional[dict[str, Any]] = None
