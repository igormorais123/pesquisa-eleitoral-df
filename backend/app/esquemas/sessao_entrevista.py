"""
Esquemas Pydantic para Sessões de Entrevista

Validação de dados para API de sessões.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, Field


class StatusSessao(str, Enum):
    """Status possíveis de uma sessão"""
    EM_ANDAMENTO = "em_andamento"
    PAUSADA = "pausada"
    CONCLUIDA = "concluida"
    ERRO = "erro"


# ============================================
# SCHEMAS DE RESPOSTA
# ============================================

class RespostaEleitorSchema(BaseModel):
    """Schema para resposta de um eleitor"""
    eleitor_id: str
    eleitor_nome: str
    respostas: List[Dict[str, Any]]
    tokens_usados: int = 0
    custo: float = 0.0
    tempo_resposta_ms: int = 0


class PerguntaSchema(BaseModel):
    """Schema para pergunta"""
    id: str
    texto: str
    tipo: str
    opcoes: Optional[List[str]] = None
    obrigatoria: bool = True
    escala_min: Optional[int] = None
    escala_max: Optional[int] = None
    escala_rotulos: Optional[List[str]] = None


# ============================================
# SCHEMAS DE SESSÃO
# ============================================

class SessaoBase(BaseModel):
    """Schema base para sessão"""
    id: str
    entrevista_id: str = Field(alias="entrevistaId")
    titulo: str
    status: StatusSessao = StatusSessao.EM_ANDAMENTO
    progresso: int = 0
    total_agentes: int = Field(default=0, alias="totalAgentes")
    custo_atual: float = Field(default=0.0, alias="custoAtual")
    tokens_input: int = Field(default=0, alias="tokensInput")
    tokens_output: int = Field(default=0, alias="tokensOutput")

    class Config:
        populate_by_name = True


class SessaoCreate(SessaoBase):
    """Schema para criar sessão"""
    perguntas: Optional[List[Dict[str, Any]]] = None
    respostas: Optional[List[Dict[str, Any]]] = None
    resultado: Optional[Dict[str, Any]] = None
    relatorio_ia: Optional[Dict[str, Any]] = Field(default=None, alias="relatorioIA")
    estatisticas: Optional[Dict[str, Any]] = None
    modelo_usado: Optional[str] = Field(default=None, alias="modeloUsado")
    configuracoes: Optional[Dict[str, Any]] = None
    iniciada_em: Optional[str] = Field(default=None, alias="iniciadaEm")
    atualizada_em: Optional[str] = Field(default=None, alias="atualizadaEm")
    finalizada_em: Optional[str] = Field(default=None, alias="finalizadaEm")

    class Config:
        populate_by_name = True


class SessaoUpdate(BaseModel):
    """Schema para atualizar sessão"""
    titulo: Optional[str] = None
    status: Optional[StatusSessao] = None
    progresso: Optional[int] = None
    total_agentes: Optional[int] = Field(default=None, alias="totalAgentes")
    custo_atual: Optional[float] = Field(default=None, alias="custoAtual")
    tokens_input: Optional[int] = Field(default=None, alias="tokensInput")
    tokens_output: Optional[int] = Field(default=None, alias="tokensOutput")
    perguntas: Optional[List[Dict[str, Any]]] = None
    respostas: Optional[List[Dict[str, Any]]] = None
    resultado: Optional[Dict[str, Any]] = None
    relatorio_ia: Optional[Dict[str, Any]] = Field(default=None, alias="relatorioIA")
    estatisticas: Optional[Dict[str, Any]] = None
    modelo_usado: Optional[str] = Field(default=None, alias="modeloUsado")
    configuracoes: Optional[Dict[str, Any]] = None
    finalizada_em: Optional[str] = Field(default=None, alias="finalizadaEm")

    class Config:
        populate_by_name = True


class SessaoResponse(BaseModel):
    """Schema de resposta para sessão"""
    id: str
    entrevista_id: str = Field(alias="entrevistaId")
    titulo: str
    status: str
    progresso: int
    total_agentes: int = Field(alias="totalAgentes")
    custo_atual: float = Field(alias="custoAtual")
    tokens_input: int = Field(alias="tokensInput")
    tokens_output: int = Field(alias="tokensOutput")
    perguntas: Optional[List[Dict[str, Any]]] = None
    respostas: Optional[List[Dict[str, Any]]] = None
    resultado: Optional[Dict[str, Any]] = None
    relatorio_ia: Optional[Dict[str, Any]] = Field(default=None, alias="relatorioIA")
    estatisticas: Optional[Dict[str, Any]] = None
    modelo_usado: Optional[str] = Field(default=None, alias="modeloUsado")
    configuracoes: Optional[Dict[str, Any]] = None
    iniciada_em: Optional[str] = Field(default=None, alias="iniciadaEm")
    atualizada_em: Optional[str] = Field(default=None, alias="atualizadaEm")
    finalizada_em: Optional[str] = Field(default=None, alias="finalizadaEm")
    usuario_id: Optional[str] = Field(default=None, alias="usuarioId")
    usuario_nome: Optional[str] = Field(default=None, alias="usuarioNome")
    sincronizado: bool = True
    versao: int = 1

    class Config:
        populate_by_name = True
        from_attributes = True


class SessaoListResponse(BaseModel):
    """Schema para lista de sessões"""
    sessoes: List[SessaoResponse]
    total: int
    pagina: int = 1
    por_pagina: int = 20
    total_paginas: int = 1


class SessaoResumo(BaseModel):
    """Schema resumido de sessão para listagem"""
    id: str
    titulo: str
    status: str
    progresso: int
    total_agentes: int = Field(alias="totalAgentes")
    custo_atual: float = Field(alias="custoAtual")
    iniciada_em: Optional[str] = Field(default=None, alias="iniciadaEm")
    finalizada_em: Optional[str] = Field(default=None, alias="finalizadaEm")

    class Config:
        populate_by_name = True
        from_attributes = True


# ============================================
# SCHEMAS DE SINCRONIZAÇÃO
# ============================================

class SincronizarSessoesRequest(BaseModel):
    """Request para sincronizar múltiplas sessões"""
    sessoes: List[SessaoCreate]


class SincronizarSessoesResponse(BaseModel):
    """Response da sincronização"""
    sucesso: bool
    sincronizadas: int
    erros: List[Dict[str, str]] = []
    sessoes: List[SessaoResponse] = []


class MigrarSessoesRequest(BaseModel):
    """Request para migrar sessões do IndexedDB para PostgreSQL"""
    sessoes: List[SessaoCreate]
    substituir_existentes: bool = False


class MigrarSessoesResponse(BaseModel):
    """Response da migração"""
    sucesso: bool
    total_recebidas: int
    migradas: int
    ignoradas: int
    erros: List[Dict[str, str]] = []
