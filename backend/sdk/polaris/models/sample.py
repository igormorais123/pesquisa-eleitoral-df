# POLARIS SDK - Sample Models
# Modelos para amostragem e seleção de eleitores

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import math


class SamplingType(str, Enum):
    """Tipos de amostragem."""
    ESTRATIFICADA_PROPORCIONAL = "estratificada_proporcional"
    ESTRATIFICADA_OTIMA = "estratificada_otima"
    POR_COTAS = "por_cotas"
    ALEATORIA_SIMPLES = "aleatoria_simples"
    SISTEMATICA = "sistematica"
    POR_CLUSTER = "por_cluster"


class StratificationVariable(BaseModel):
    """Variável de estratificação."""
    nome: str
    peso: float = Field(default=1.0, ge=0.0, le=1.0)
    categorias: List[str] = Field(default_factory=list)
    proporcoes: Dict[str, float] = Field(default_factory=dict)


class StratificationConfig(BaseModel):
    """Configuração de estratificação."""

    # Variáveis demográficas (peso: 0.30)
    demograficas: Dict[str, StratificationVariable] = Field(default_factory=dict)
    peso_demograficas: float = Field(default=0.30)

    # Variáveis socioeconômicas (peso: 0.25)
    socioeconomicas: Dict[str, StratificationVariable] = Field(default_factory=dict)
    peso_socioeconomicas: float = Field(default=0.25)

    # Variáveis políticas (peso: 0.30)
    politicas: Dict[str, StratificationVariable] = Field(default_factory=dict)
    peso_politicas: float = Field(default=0.30)

    # Variáveis comportamentais (peso: 0.15)
    comportamentais: Dict[str, StratificationVariable] = Field(default_factory=dict)
    peso_comportamentais: float = Field(default=0.15)


class SampleConfig(BaseModel):
    """Configuração de cálculo amostral."""
    populacao: int = Field(default=1000, description="Total de eleitores no banco")
    nivel_confianca: float = Field(default=0.95, description="Nível de confiança (0-1)")
    margem_erro: float = Field(default=0.03, description="Margem de erro (0-1)")
    proporcao_estimada: float = Field(default=0.5, description="Proporção estimada (máxima variância)")

    @property
    def z_score(self) -> float:
        """Retorna o Z-score para o nível de confiança."""
        z_scores = {
            0.90: 1.645,
            0.95: 1.96,
            0.99: 2.576
        }
        return z_scores.get(self.nivel_confianca, 1.96)

    def calcular_tamanho_amostra(self) -> int:
        """
        Calcula o tamanho amostral usando a fórmula:
        n = (Z² * p * q * N) / (e² * (N-1) + Z² * p * q)

        Onde:
        - Z = Z-score para o nível de confiança
        - p = proporção estimada
        - q = 1 - p
        - N = tamanho da população
        - e = margem de erro
        """
        Z = self.z_score
        p = self.proporcao_estimada
        q = 1 - p
        N = self.populacao
        e = self.margem_erro

        numerador = (Z ** 2) * p * q * N
        denominador = (e ** 2) * (N - 1) + (Z ** 2) * p * q

        n = numerador / denominador
        return math.ceil(n)

    def get_info(self) -> Dict[str, Any]:
        """Retorna informações sobre a configuração."""
        return {
            "populacao": self.populacao,
            "nivel_confianca": f"{self.nivel_confianca * 100}%",
            "margem_erro": f"±{self.margem_erro * 100}%",
            "z_score": self.z_score,
            "tamanho_calculado": self.calcular_tamanho_amostra()
        }


class Quota(BaseModel):
    """Cota para amostragem por cotas."""
    variavel: str
    categoria: str
    proporcao_alvo: float
    quantidade_alvo: int = 0
    quantidade_atual: int = 0

    @property
    def preenchida(self) -> bool:
        return self.quantidade_atual >= self.quantidade_alvo

    @property
    def percentual_preenchido(self) -> float:
        if self.quantidade_alvo == 0:
            return 0.0
        return (self.quantidade_atual / self.quantidade_alvo) * 100


class SamplingStrategy(BaseModel):
    """Estratégia de amostragem completa."""
    tipo: SamplingType = Field(default=SamplingType.ESTRATIFICADA_PROPORCIONAL)
    config: SampleConfig = Field(default_factory=SampleConfig)

    # Variáveis de estratificação
    variaveis_estratificacao: List[str] = Field(
        default=["regiao_administrativa", "faixa_etaria", "genero", "orientacao_politica"]
    )

    # Cotas (se aplicável)
    cotas: List[Quota] = Field(default_factory=list)

    # Estratificação detalhada
    estratificacao: Optional[StratificationConfig] = None

    # Resultados
    tamanho_amostra: int = Field(default=0)
    eleitores_selecionados: List[str] = Field(default_factory=list)

    # Metadados
    criado_em: datetime = Field(default_factory=datetime.now)
    justificativa: str = Field(default="")

    def calcular_tamanho(self) -> int:
        """Calcula e armazena o tamanho da amostra."""
        self.tamanho_amostra = self.config.calcular_tamanho_amostra()
        return self.tamanho_amostra

    def get_descricao(self) -> str:
        """Retorna descrição da estratégia."""
        descricoes = {
            SamplingType.ESTRATIFICADA_PROPORCIONAL:
                "Amostra proporcional a cada estrato da população",
            SamplingType.ESTRATIFICADA_OTIMA:
                "Alocação ótima de Neyman para minimizar variância",
            SamplingType.POR_COTAS:
                "Quotas fixas por características demográficas",
            SamplingType.ALEATORIA_SIMPLES:
                "Seleção aleatória simples de n elementos",
            SamplingType.SISTEMATICA:
                "Seleciona cada k-ésimo elemento da lista",
            SamplingType.POR_CLUSTER:
                "Seleciona clusters inteiros (agrupamentos geográficos)"
        }
        return descricoes.get(self.tipo, "Amostragem personalizada")


class SelectedVoter(BaseModel):
    """Eleitor selecionado para a amostra."""
    id: str
    nome: str
    estrato: Dict[str, str] = Field(default_factory=dict)
    peso_amostral: float = Field(default=1.0)
    ordem_selecao: int = Field(default=0)


class SelectedSample(BaseModel):
    """Amostra selecionada."""
    id: str = Field(..., description="ID da amostra")
    estrategia: SamplingStrategy
    eleitores: List[SelectedVoter] = Field(default_factory=list)

    # Estatísticas
    total_selecionados: int = Field(default=0)
    distribuicao_estratos: Dict[str, Dict[str, int]] = Field(default_factory=dict)

    # Validação
    representa_populacao: bool = Field(default=False)
    erros_proporcao: List[str] = Field(default_factory=list)

    # Metadados
    criado_em: datetime = Field(default_factory=datetime.now)

    def adicionar_eleitor(self, eleitor: SelectedVoter) -> None:
        """Adiciona eleitor à amostra."""
        self.eleitores.append(eleitor)
        self.total_selecionados = len(self.eleitores)

        # Atualizar distribuição de estratos
        for variavel, valor in eleitor.estrato.items():
            if variavel not in self.distribuicao_estratos:
                self.distribuicao_estratos[variavel] = {}
            if valor not in self.distribuicao_estratos[variavel]:
                self.distribuicao_estratos[variavel][valor] = 0
            self.distribuicao_estratos[variavel][valor] += 1

    def get_ids_eleitores(self) -> List[str]:
        """Retorna lista de IDs dos eleitores."""
        return [e.id for e in self.eleitores]

    def get_estatisticas(self) -> Dict[str, Any]:
        """Retorna estatísticas da amostra."""
        return {
            "total": self.total_selecionados,
            "tamanho_alvo": self.estrategia.tamanho_amostra,
            "percentual_cobertura": (self.total_selecionados / self.estrategia.tamanho_amostra * 100)
                if self.estrategia.tamanho_amostra > 0 else 0,
            "distribuicao": self.distribuicao_estratos,
            "representa_populacao": self.representa_populacao
        }


# Configuração padrão de estratificação para o DF
ESTRATIFICACAO_DF_PADRAO = {
    "demograficas": {
        "regiao_administrativa": {
            "categorias": 35,
            "peso": 0.10
        },
        "faixa_etaria": {
            "categorias": ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
            "peso": 0.08
        },
        "genero": {
            "categorias": ["masculino", "feminino"],
            "proporcoes": {"masculino": 0.48, "feminino": 0.52},
            "peso": 0.06
        },
        "cor_raca": {
            "categorias": ["branca", "preta", "parda", "amarela", "indigena"],
            "peso": 0.04
        },
        "religiao": {
            "categorias": ["catolica", "evangelica", "espirita", "sem_religiao", "outras"],
            "peso": 0.02
        }
    },
    "socioeconomicas": {
        "cluster_socioeconomico": {
            "categorias": ["G1", "G2", "G3", "G4", "G5"],
            "peso": 0.10
        },
        "escolaridade": {
            "categorias": ["fundamental", "medio", "superior", "pos_graduacao"],
            "peso": 0.08
        },
        "renda_salarios_minimos": {
            "categorias": ["ate_1", "1_a_3", "3_a_5", "5_a_10", "10_a_20", "mais_20"],
            "peso": 0.05
        },
        "ocupacao_vinculo": {
            "categorias": ["clt", "autonomo", "servidor_publico", "empresario", "desempregado"],
            "peso": 0.02
        }
    },
    "politicas": {
        "orientacao_politica": {
            "categorias": ["esquerda", "centro_esquerda", "centro", "centro_direita", "direita"],
            "peso": 0.12
        },
        "posicao_bolsonaro": {
            "categorias": ["apoiador", "neutro", "critico"],
            "peso": 0.10
        },
        "interesse_politico": {
            "categorias": ["baixo", "medio", "alto"],
            "peso": 0.08
        }
    },
    "comportamentais": {
        "susceptibilidade_desinformacao": {
            "categorias": ["baixa", "media", "alta"],
            "peso": 0.05
        },
        "estilo_decisao": {
            "categorias": ["racional", "emocional", "impulsivo", "delegador"],
            "peso": 0.05
        }
    }
}
