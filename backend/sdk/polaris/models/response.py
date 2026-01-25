# POLARIS SDK - Response Models
# Modelos para respostas e fluxo cognitivo dos eleitores

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class AttentionLevel(str, Enum):
    """Níveis de atenção."""
    IGNORA = "ignora"
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"
    TOTAL = "total"


class AttentionFilter(BaseModel):
    """
    Etapa 1: Filtro de Atenção
    "Eu sequer prestaria atenção nisso?"
    """
    nivel: AttentionLevel
    justificativa: str
    baseado_em: List[str] = Field(
        default_factory=list,
        description="Campos do perfil usados (ex: interesse_politico)"
    )
    passa_filtro: bool = Field(default=True)


class BiasType(str, Enum):
    """Tipos de viés cognitivo."""
    CONFIRMACAO = "confirmacao"
    DISPONIBILIDADE = "disponibilidade"
    ANCORAGEM = "ancoragem"
    ENQUADRAMENTO = "enquadramento"
    GRUPO = "grupo"
    STATUS_QUO = "status_quo"
    OTIMISMO = "otimismo"
    RETROSPECTIVO = "retrospectivo"


class ConfirmationBias(BaseModel):
    """
    Etapa 2: Viés de Confirmação
    "Isso confirma ou ameaça o que acredito?"
    """
    confirma_crencas: bool
    nivel_ameaca: int = Field(ge=0, le=10, description="0=nenhuma, 10=máxima")
    crencas_afetadas: List[str] = Field(default_factory=list)
    vieses_ativados: List[BiasType] = Field(default_factory=list)
    mecanismo_defesa: Optional[str] = Field(
        default=None,
        description="Mecanismo de defesa ativado (negação, racionalização, etc)"
    )
    justificativa: str


class EmotionType(str, Enum):
    """Tipos de emoção primária."""
    RAIVA = "raiva"
    MEDO = "medo"
    ALEGRIA = "alegria"
    TRISTEZA = "tristeza"
    NOJO = "nojo"
    SURPRESA = "surpresa"
    ESPERANCA = "esperanca"
    FRUSTACAO = "frustacao"
    INDIFERENCA = "indiferenca"
    DESCONFIANCA = "desconfianca"


class EmotionalReaction(BaseModel):
    """
    Etapa 3: Reação Emocional
    "Como isso me faz SENTIR?"
    """
    emocao_primaria: EmotionType
    intensidade: int = Field(ge=1, le=10, description="1=mínima, 10=máxima")
    emocoes_secundarias: List[EmotionType] = Field(default_factory=list)
    gatilhos: List[str] = Field(
        default_factory=list,
        description="O que disparou esta emoção"
    )
    memoria_associada: Optional[str] = Field(
        default=None,
        description="Memória ou experiência associada"
    )
    justificativa: str


class CertaintyLevel(str, Enum):
    """Níveis de certeza."""
    MUITO_INCERTO = "muito_incerto"
    INCERTO = "incerto"
    MODERADO = "moderado"
    CERTO = "certo"
    MUITO_CERTO = "muito_certo"


class ResponseTone(str, Enum):
    """Tom da resposta."""
    ENTUSIASTICO = "entusiastico"
    POSITIVO = "positivo"
    NEUTRO = "neutro"
    CAUTELOSO = "cauteloso"
    NEGATIVO = "negativo"
    HOSTIL = "hostil"
    EVASIVO = "evasivo"


class Decision(BaseModel):
    """
    Etapa 4: Decisão/Resposta
    "Qual é minha resposta GENUÍNA?"
    """
    resposta_texto: str = Field(..., description="Resposta em linguagem natural")
    resposta_estruturada: Optional[Union[str, int, List[str], Dict[str, Any]]] = Field(
        default=None,
        description="Resposta em formato estruturado (ex: opção selecionada)"
    )
    tom: ResponseTone
    certeza: CertaintyLevel
    certeza_numerica: int = Field(ge=1, le=10)
    pode_mudar_opiniao: bool = Field(default=False)
    condicoes_mudanca: List[str] = Field(
        default_factory=list,
        description="O que faria mudar de opinião"
    )
    justificativa_interna: str = Field(
        ...,
        description="Justificativa interna (não compartilhada publicamente)"
    )


class CognitiveFlow(BaseModel):
    """Fluxo cognitivo completo das 4 etapas."""
    atencao: AttentionFilter
    vies: ConfirmationBias
    emocao: EmotionalReaction
    decisao: Decision

    # Metadados
    tempo_processamento_ms: int = Field(default=0)
    consistente_com_perfil: bool = Field(default=True)
    notas_inconsistencia: List[str] = Field(default_factory=list)


class Response(BaseModel):
    """Resposta completa a uma pergunta."""
    eleitor_id: str
    pergunta_id: str

    # Fluxo cognitivo
    fluxo_cognitivo: CognitiveFlow

    # Resposta final
    resposta_texto: str
    resposta_estruturada: Optional[Union[str, int, List[str], Dict[str, Any]]] = None

    # Metadados
    timestamp: datetime = Field(default_factory=datetime.now)
    tokens_entrada: int = Field(default=0)
    tokens_saida: int = Field(default=0)
    modelo_utilizado: str = Field(default="claude-sonnet-4-5-20250929")

    # Validação
    resposta_valida: bool = Field(default=True)
    erros_validacao: List[str] = Field(default_factory=list)


class InterviewResult(BaseModel):
    """Resultado completo de uma entrevista."""
    eleitor_id: str
    eleitor_nome: str
    questionario_id: str

    # Respostas
    respostas: List[Response] = Field(default_factory=list)

    # Estatísticas
    total_perguntas: int = Field(default=0)
    total_respondidas: int = Field(default=0)
    tempo_total_ms: int = Field(default=0)
    tokens_totais: int = Field(default=0)

    # Sumário emocional
    emocao_predominante: Optional[EmotionType] = None
    intensidade_media: float = Field(default=0.0)
    tom_predominante: Optional[ResponseTone] = None

    # Metadados
    inicio: datetime = Field(default_factory=datetime.now)
    fim: Optional[datetime] = None
    completa: bool = Field(default=False)

    def adicionar_resposta(self, resposta: Response) -> None:
        """Adiciona resposta à entrevista."""
        self.respostas.append(resposta)
        self.total_respondidas = len(self.respostas)
        self.tokens_totais += resposta.tokens_entrada + resposta.tokens_saida

    def finalizar(self) -> None:
        """Finaliza a entrevista e calcula estatísticas."""
        self.fim = datetime.now()
        self.completa = self.total_respondidas == self.total_perguntas

        if self.respostas:
            # Calcular emoção predominante
            emocoes = [r.fluxo_cognitivo.emocao.emocao_primaria for r in self.respostas]
            self.emocao_predominante = max(set(emocoes), key=emocoes.count)

            # Calcular intensidade média
            intensidades = [r.fluxo_cognitivo.emocao.intensidade for r in self.respostas]
            self.intensidade_media = sum(intensidades) / len(intensidades)

            # Calcular tom predominante
            tons = [r.fluxo_cognitivo.decisao.tom for r in self.respostas]
            self.tom_predominante = max(set(tons), key=tons.count)

            # Calcular tempo total
            if self.fim and self.inicio:
                self.tempo_total_ms = int((self.fim - self.inicio).total_seconds() * 1000)

    def get_resumo(self) -> Dict[str, Any]:
        """Retorna resumo da entrevista."""
        return {
            "eleitor": self.eleitor_nome,
            "completa": self.completa,
            "respostas": f"{self.total_respondidas}/{self.total_perguntas}",
            "emocao_predominante": self.emocao_predominante.value if self.emocao_predominante else None,
            "intensidade_media": round(self.intensidade_media, 2),
            "tom_predominante": self.tom_predominante.value if self.tom_predominante else None,
            "tokens_utilizados": self.tokens_totais
        }


class CollectionProgress(BaseModel):
    """Progresso da coleta de dados."""
    total_eleitores: int
    entrevistas_completas: int = 0
    entrevistas_em_andamento: int = 0
    entrevistas_com_erro: int = 0

    # Tempo
    inicio: datetime = Field(default_factory=datetime.now)
    ultima_atualizacao: datetime = Field(default_factory=datetime.now)
    tempo_medio_por_entrevista_ms: float = Field(default=0.0)

    # Tokens
    tokens_utilizados: int = 0
    custo_estimado_usd: float = 0.0

    @property
    def percentual_completo(self) -> float:
        if self.total_eleitores == 0:
            return 0.0
        return (self.entrevistas_completas / self.total_eleitores) * 100

    @property
    def tempo_estimado_restante_min(self) -> float:
        if self.tempo_medio_por_entrevista_ms == 0:
            return 0.0
        restantes = self.total_eleitores - self.entrevistas_completas
        return (restantes * self.tempo_medio_por_entrevista_ms) / 60000

    def atualizar(self, entrevista: InterviewResult) -> None:
        """Atualiza progresso com nova entrevista."""
        if entrevista.completa:
            self.entrevistas_completas += 1
            self.entrevistas_em_andamento = max(0, self.entrevistas_em_andamento - 1)

        self.tokens_utilizados += entrevista.tokens_totais
        self.ultima_atualizacao = datetime.now()

        # Recalcular tempo médio
        if self.entrevistas_completas > 0:
            tempo_total = (self.ultima_atualizacao - self.inicio).total_seconds() * 1000
            self.tempo_medio_por_entrevista_ms = tempo_total / self.entrevistas_completas

        # Estimar custo (preços aproximados Claude)
        # Sonnet: $3 / 1M input, $15 / 1M output
        self.custo_estimado_usd = (self.tokens_utilizados / 1_000_000) * 9  # média
