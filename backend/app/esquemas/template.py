"""
Esquemas Pydantic para Templates de Pesquisa Eleitoral.

Templates predefinidos para diferentes tipos de pesquisas eleitorais,
permitindo criação rápida de pesquisas padronizadas.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ============================================
# ENUMS
# ============================================


class CategoriaTemplate(str, Enum):
    """Categorias de templates de pesquisa eleitoral."""

    INTENCAO_VOTO = "intencao_voto"
    REJEICAO = "rejeicao"
    AVALIACAO_GOVERNO = "avaliacao_governo"
    IMAGEM_CANDIDATO = "imagem_candidato"
    OPINIAO_PUBLICA = "opiniao_publica"
    COMPORTAMENTO_ELEITORAL = "comportamento_eleitoral"
    DADOS_DEMOGRAFICOS = "dados_demograficos"
    CONTROLE_QUALIDADE = "controle_qualidade"


class TipoPergunta(str, Enum):
    """Tipos de perguntas disponíveis nos templates."""

    UNICA = "unica"  # Escolha única
    MULTIPLA = "multipla"  # Escolha múltipla
    ABERTA = "aberta"  # Resposta livre
    ESCALA = "escala"  # Escala numérica (0-10, etc.)
    NUMERICA = "numerica"  # Valor numérico
    RANKING = "ranking"  # Ordenação de opções


class TipoEleicao(str, Enum):
    """Tipos de eleição para os templates."""

    PRESIDENTE = "presidente"
    GOVERNADOR = "governador"
    SENADOR = "senador"
    DEPUTADO_FEDERAL = "deputado_federal"
    DEPUTADO_DISTRITAL = "deputado_distrital"
    PREFEITO = "prefeito"
    VEREADOR = "vereador"
    GERAL = "geral"


# ============================================
# ESQUEMAS DE OPÇÕES
# ============================================


class OpcaoPergunta(BaseModel):
    """Opção de resposta para uma pergunta."""

    valor: str = Field(..., description="Valor interno da opção")
    texto: str = Field(..., description="Texto exibido para o entrevistado")
    ordem: int = Field(default=0, description="Ordem de exibição")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "valor": "candidato_a",
                "texto": "João Silva (PARTIDO)",
                "ordem": 1,
            }
        }
    )


class ValidacaoPergunta(BaseModel):
    """Validações para perguntas numéricas."""

    min: Optional[float] = Field(None, description="Valor mínimo")
    max: Optional[float] = Field(None, description="Valor máximo")
    regex: Optional[str] = Field(None, description="Padrão regex para validação")


class CondicaoPergunta(BaseModel):
    """Condição para exibição de pergunta condicional."""

    pergunta_ref: str = Field(..., description="Código da pergunta de referência")
    valor_condicao: str = Field(..., description="Valor que ativa a condição")


# ============================================
# ESQUEMAS DE PERGUNTAS
# ============================================


class PerguntaTemplate(BaseModel):
    """Pergunta de um template de pesquisa."""

    codigo: str = Field(..., description="Código único da pergunta (ex: IV-GOV-01)")
    texto: str = Field(..., description="Texto da pergunta")
    tipo: TipoPergunta = Field(..., description="Tipo da pergunta")
    categoria: str = Field(..., description="Categoria da pergunta")
    obrigatoria: bool = Field(default=True, description="Se a pergunta é obrigatória")
    ordem: int = Field(default=0, description="Ordem de exibição")
    instrucoes: Optional[str] = Field(
        None, description="Instruções para o entrevistador"
    )
    opcoes: List[OpcaoPergunta] = Field(default=[], description="Opções de resposta")
    validacao: Optional[ValidacaoPergunta] = Field(None, description="Validações")
    condicional: Optional[CondicaoPergunta] = Field(
        None, description="Condição para exibição"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "codigo": "IV-GOV-EST-01",
                "texto": "Se a eleição para Governador do DF fosse hoje, em qual você votaria?",
                "tipo": "unica",
                "categoria": "intencao_voto",
                "obrigatoria": True,
                "ordem": 1,
                "instrucoes": "MOSTRAR CARTÃO COM NOMES DOS CANDIDATOS",
                "opcoes": [
                    {"valor": "candidato_a", "texto": "[CANDIDATO A]", "ordem": 1},
                    {"valor": "branco_nulo", "texto": "Branco/Nulo", "ordem": 96},
                ],
            }
        }
    )


# ============================================
# ESQUEMAS DE TEMPLATES
# ============================================


class TemplateResumo(BaseModel):
    """Resumo de um template (para listagem)."""

    id: str = Field(..., description="ID único do template")
    nome: str = Field(..., description="Nome do template")
    descricao: str = Field(..., description="Descrição do template")
    categoria: str = Field(..., description="Categoria do template")
    tipo_eleicao: str = Field(..., description="Tipo de eleição")
    tags: List[str] = Field(default=[], description="Tags do template")
    total_perguntas: int = Field(..., description="Total de perguntas no template")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "tpl-intencao-voto-governador",
                "nome": "Intenção de Voto - Governador",
                "descricao": "Template padrão para pesquisa de intenção de voto",
                "categoria": "intencao_voto",
                "tipo_eleicao": "governador",
                "tags": ["governador", "intencao_voto", "estimulada"],
                "total_perguntas": 4,
            }
        }
    )


class TemplateCompleto(BaseModel):
    """Template completo com todas as perguntas."""

    id: str = Field(..., description="ID único do template")
    nome: str = Field(..., description="Nome do template")
    descricao: str = Field(..., description="Descrição do template")
    categoria: str = Field(..., description="Categoria do template")
    tipo_eleicao: str = Field(..., description="Tipo de eleição")
    tags: List[str] = Field(default=[], description="Tags do template")
    perguntas: List[PerguntaTemplate] = Field(..., description="Perguntas do template")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "tpl-intencao-voto-governador",
                "nome": "Intenção de Voto - Governador",
                "descricao": "Template padrão para pesquisa de intenção de voto",
                "categoria": "intencao_voto",
                "tipo_eleicao": "governador",
                "tags": ["governador", "intencao_voto"],
                "perguntas": [],
            }
        }
    )


# ============================================
# ESQUEMAS DE INFORMAÇÕES AUXILIARES
# ============================================


class CategoriaInfo(BaseModel):
    """Informações sobre uma categoria de templates."""

    id: str = Field(..., description="ID da categoria")
    nome: str = Field(..., description="Nome da categoria")
    descricao: str = Field(..., description="Descrição da categoria")
    cor: str = Field(default="#666666", description="Cor para exibição (hex)")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "intencao_voto",
                "nome": "Intenção de Voto",
                "descricao": "Perguntas sobre intenção de voto",
                "cor": "#1976D2",
            }
        }
    )


class TipoEleicaoInfo(BaseModel):
    """Informações sobre um tipo de eleição."""

    id: str = Field(..., description="ID do tipo de eleição")
    nome: str = Field(..., description="Nome do tipo")
    descricao: str = Field(..., description="Descrição")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "governador",
                "nome": "Governador",
                "descricao": "Eleições para governador estadual/distrital",
            }
        }
    )


# ============================================
# ESQUEMAS DE CRIAÇÃO/ATUALIZAÇÃO
# ============================================


class TemplateCreate(BaseModel):
    """Esquema para criar um novo template."""

    nome: str = Field(..., min_length=3, max_length=100, description="Nome do template")
    descricao: str = Field(..., max_length=500, description="Descrição")
    categoria: CategoriaTemplate = Field(..., description="Categoria")
    tipo_eleicao: TipoEleicao = Field(..., description="Tipo de eleição")
    tags: List[str] = Field(default=[], description="Tags")
    perguntas: List[PerguntaTemplate] = Field(
        ..., min_length=1, description="Perguntas"
    )


class TemplateUpdate(BaseModel):
    """Esquema para atualizar um template."""

    nome: Optional[str] = Field(None, min_length=3, max_length=100)
    descricao: Optional[str] = Field(None, max_length=500)
    categoria: Optional[CategoriaTemplate] = None
    tipo_eleicao: Optional[TipoEleicao] = None
    tags: Optional[List[str]] = None
    perguntas: Optional[List[PerguntaTemplate]] = None


# ============================================
# ESQUEMAS DE RESPOSTA
# ============================================


class AplicarTemplateResponse(BaseModel):
    """Resposta ao aplicar um template a uma pesquisa."""

    sucesso: bool = Field(..., description="Se a operação foi bem-sucedida")
    mensagem: str = Field(..., description="Mensagem de resultado")
    template_id: str = Field(..., description="ID do template aplicado")
    pesquisa_id: int = Field(..., description="ID da pesquisa")
    perguntas_adicionadas: int = Field(
        ..., description="Número de perguntas adicionadas"
    )
    substituiu_existentes: bool = Field(
        ..., description="Se substituiu perguntas existentes"
    )


class EstatisticasTemplates(BaseModel):
    """Estatísticas sobre os templates disponíveis."""

    total_templates: int = Field(..., description="Total de templates")
    total_perguntas: int = Field(
        ..., description="Total de perguntas em todos os templates"
    )
    media_perguntas_por_template: float = Field(
        ..., description="Média de perguntas por template"
    )
    por_categoria: Dict[str, int] = Field(..., description="Quantidade por categoria")
    por_tipo_eleicao: Dict[str, int] = Field(
        ..., description="Quantidade por tipo de eleição"
    )
    tags_mais_usadas: Dict[str, int] = Field(..., description="Tags mais utilizadas")
    versao: str = Field(..., description="Versão dos templates")
    ultima_atualizacao: str = Field(..., description="Data da última atualização")
