"""
Esquemas Pydantic para Pesquisa PODC

Validação e serialização de dados para a API de pesquisas PODC.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# ============================================
# ESQUEMAS DE DISTRIBUIÇÃO PODC
# ============================================


class DistribuicaoPODC(BaseModel):
    """Distribuição percentual entre as 4 funções administrativas."""

    planejar: float = Field(..., ge=0, le=100, description="Percentual em Planejar")
    organizar: float = Field(..., ge=0, le=100, description="Percentual em Organizar")
    dirigir: float = Field(..., ge=0, le=100, description="Percentual em Dirigir")
    controlar: float = Field(..., ge=0, le=100, description="Percentual em Controlar")

    @field_validator('controlar')
    @classmethod
    def validar_soma(cls, v, info):
        """Valida que a soma é 100%."""
        valores = info.data
        soma = valores.get('planejar', 0) + valores.get('organizar', 0) + valores.get('dirigir', 0) + v
        if abs(soma - 100) > 1:  # Tolerância de 1%
            raise ValueError(f"A soma das distribuições deve ser 100%, atual: {soma}%")
        return v


class HorasSemanais(BaseModel):
    """Horas semanais dedicadas a cada função."""

    total: float = Field(..., ge=0, le=100, description="Total de horas semanais")
    planejar: float = Field(..., ge=0, description="Horas em Planejar")
    organizar: float = Field(..., ge=0, description="Horas em Organizar")
    dirigir: float = Field(..., ge=0, description="Horas em Dirigir")
    controlar: float = Field(..., ge=0, description="Horas em Controlar")


class FrequenciaAtividades(BaseModel):
    """Frequência de atividades por função (1-5)."""

    planejar: Dict[str, int] = Field(default_factory=dict)
    organizar: Dict[str, int] = Field(default_factory=dict)
    dirigir: Dict[str, int] = Field(default_factory=dict)
    controlar: Dict[str, int] = Field(default_factory=dict)


# ============================================
# ESQUEMAS DE PESQUISA
# ============================================


class PerguntaPODC(BaseModel):
    """Pergunta da pesquisa PODC."""

    id: str
    texto: str
    tipo: str = Field(..., description="escala, multipla_escolha, sim_nao, aberta")
    obrigatoria: bool = True
    escala_min: Optional[int] = None
    escala_max: Optional[int] = None
    opcoes: Optional[List[str]] = None


class CriarPesquisaPODC(BaseModel):
    """Dados para criar uma nova pesquisa PODC."""

    titulo: str = Field(..., min_length=3, max_length=255)
    descricao: Optional[str] = None
    perguntas: List[PerguntaPODC]
    gestores_ids: List[str] = Field(..., min_length=1)


class AtualizarPesquisaPODC(BaseModel):
    """Dados para atualizar uma pesquisa PODC."""

    titulo: Optional[str] = None
    descricao: Optional[str] = None
    status: Optional[str] = None


class PesquisaPODCResponse(BaseModel):
    """Resposta com dados da pesquisa PODC."""

    id: str
    usuario_id: str
    titulo: str
    descricao: Optional[str]
    status: str
    total_gestores: int
    total_respostas: int
    perguntas: Optional[List[Dict[str, Any]]]
    gestores_ids: Optional[List[str]]
    custo_total: float
    tokens_total: int
    criado_em: datetime
    atualizado_em: datetime
    iniciado_em: Optional[datetime]
    finalizado_em: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================
# ESQUEMAS DE RESPOSTA
# ============================================


class GestorInfo(BaseModel):
    """Informações do gestor na resposta."""

    id: str
    nome: str
    setor: str
    nivel: str
    cargo: Optional[str] = None
    instituicao: Optional[str] = None


class RespostaPergunta(BaseModel):
    """Resposta a uma pergunta específica."""

    pergunta_id: str
    resposta: Any  # Pode ser string, número, etc.


class CriarRespostaPODC(BaseModel):
    """Dados para criar uma resposta de gestor."""

    pesquisa_id: str
    gestor: GestorInfo
    distribuicao_podc: DistribuicaoPODC
    distribuicao_ideal: Optional[DistribuicaoPODC] = None
    horas_semanais: Optional[HorasSemanais] = None
    frequencia_atividades: Optional[FrequenciaAtividades] = None
    ranking_importancia: Optional[List[str]] = None
    fatores_limitantes: Optional[List[str]] = None
    justificativa: Optional[str] = None
    respostas_perguntas: Optional[List[RespostaPergunta]] = None
    resposta_bruta: Optional[str] = None
    tokens_input: int = 0
    tokens_output: int = 0
    custo_reais: float = 0.0


class RespostaPODCResponse(BaseModel):
    """Resposta com dados de uma resposta PODC."""

    id: str
    pesquisa_id: str
    gestor_id: str
    gestor_nome: str
    gestor_setor: str
    gestor_nivel: str
    gestor_cargo: Optional[str]
    gestor_instituicao: Optional[str]
    podc_planejar: Optional[float]
    podc_organizar: Optional[float]
    podc_dirigir: Optional[float]
    podc_controlar: Optional[float]
    podc_ideal_planejar: Optional[float]
    podc_ideal_organizar: Optional[float]
    podc_ideal_dirigir: Optional[float]
    podc_ideal_controlar: Optional[float]
    horas_total: Optional[float]
    iad: Optional[float]
    iad_classificacao: Optional[str]
    ranking_importancia: Optional[List[str]]
    fatores_limitantes: Optional[List[str]]
    justificativa: Optional[str]
    tokens_input: int
    tokens_output: int
    custo_reais: float
    status: str
    criado_em: datetime
    processado_em: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================
# ESQUEMAS DE ESTATÍSTICAS
# ============================================


class EstatisticasPODCResponse(BaseModel):
    """Estatísticas agregadas de uma pesquisa PODC."""

    pesquisa_id: str
    grupo_tipo: str
    grupo_valor: Optional[str]
    total_respostas: int
    media_planejar: Optional[float]
    media_organizar: Optional[float]
    media_dirigir: Optional[float]
    media_controlar: Optional[float]
    dp_planejar: Optional[float]
    dp_organizar: Optional[float]
    dp_dirigir: Optional[float]
    dp_controlar: Optional[float]
    media_iad: Optional[float]
    dp_iad: Optional[float]
    media_horas_total: Optional[float]
    calculado_em: datetime

    class Config:
        from_attributes = True


class ComparativoSetores(BaseModel):
    """Comparativo entre setores público e privado."""

    publico: DistribuicaoPODC
    privado: DistribuicaoPODC
    principais_diferencas: List[str]


class ComparativoNiveis(BaseModel):
    """Comparativo entre níveis hierárquicos."""

    estrategico: Dict[str, Any]
    tatico: Dict[str, Any]
    operacional: Dict[str, Any]


class AnaliseCompletaPODC(BaseModel):
    """Análise completa de uma pesquisa PODC."""

    pesquisa_id: str
    titulo: str
    total_respostas: int
    estatisticas_gerais: EstatisticasPODCResponse
    comparativo_setores: Optional[ComparativoSetores]
    comparativo_niveis: Optional[ComparativoNiveis]
    insights: List[Dict[str, Any]]
    conclusoes: List[str]
