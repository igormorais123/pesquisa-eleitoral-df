"""
Modelo de Eleitor (Agente Sintético)

Tabela de eleitores/agentes sintéticos para pesquisas eleitorais.
Substitui o armazenamento em JSON por PostgreSQL com suporte a JSONB.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class Genero(str, Enum):
    """Gêneros disponíveis"""
    MASCULINO = "masculino"
    FEMININO = "feminino"


class ClusterSocioeconomico(str, Enum):
    """Clusters socioeconômicos"""
    G1_ALTA = "G1_alta"
    G2_MEDIA_ALTA = "G2_media_alta"
    G3_MEDIA_BAIXA = "G3_media_baixa"
    G4_BAIXA = "G4_baixa"
    G5_VULNERAVEL = "G5_vulneravel"


class OrientacaoPolitica(str, Enum):
    """Orientações políticas"""
    ESQUERDA = "esquerda"
    CENTRO_ESQUERDA = "centro-esquerda"
    CENTRO = "centro"
    CENTRO_DIREITA = "centro-direita"
    DIREITA = "direita"


class PosicaoBolsonaro(str, Enum):
    """Posições em relação a Bolsonaro"""
    OPOSITOR_FORTE = "opositor_forte"
    CRITICO_FORTE = "critico_forte"
    CRITICO_MODERADO = "critico_moderado"
    NEUTRO = "neutro"
    APOIADOR_MODERADO = "apoiador_moderado"
    APOIADOR_FORTE = "apoiador_forte"


class InteressePolitico(str, Enum):
    """Níveis de interesse político"""
    BAIXO = "baixo"
    MEDIO = "medio"
    ALTO = "alto"


class ToleranciaNuance(str, Enum):
    """Níveis de tolerância a nuances"""
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"


class EstiloDecisao(str, Enum):
    """Estilos de tomada de decisão"""
    ECONOMICO = "economico"
    EMOCIONAL = "emocional"
    IDENTITARIO = "identitario"
    PRAGMATICO = "pragmatico"


class OcupacaoVinculo(str, Enum):
    """Tipos de ocupação/vínculo"""
    CLT = "clt"
    SERVIDOR_PUBLICO = "servidor_publico"
    AUTONOMO = "autonomo"
    INFORMAL = "informal"
    EMPRESARIO = "empresario"
    SOCIO = "socio"
    DESEMPREGADO = "desempregado"
    APOSENTADO = "aposentado"
    ESTUDANTE = "estudante"
    DOMESTICA = "domestica"
    PENSIONISTA = "pensionista"


class Eleitor(Base):
    """
    Modelo de eleitor/agente sintético para pesquisas eleitorais.

    Armazena todos os atributos demográficos, socioeconômicos, políticos
    e comportamentais que definem o perfil do eleitor simulado.

    Campos flexíveis (arrays) são armazenados como JSONB para permitir
    variação sem alteração de schema.
    """

    __tablename__ = "eleitores"

    # Identificação
    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    nome: Mapped[str] = mapped_column(String(200), nullable=False, index=True)

    # Demográficos
    idade: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    genero: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    cor_raca: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    # Geográficos
    regiao_administrativa: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    local_referencia: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    # Socioeconômicos
    cluster_socioeconomico: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    escolaridade: Mapped[str] = mapped_column(String(100), nullable=False)
    profissao: Mapped[str] = mapped_column(String(100), nullable=False)
    ocupacao_vinculo: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    renda_salarios_minimos: Mapped[str] = mapped_column(String(30), nullable=False)

    # Socioculturais
    religiao: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    estado_civil: Mapped[str] = mapped_column(String(30), nullable=False)
    filhos: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Políticos
    orientacao_politica: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    posicao_bolsonaro: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    interesse_politico: Mapped[str] = mapped_column(String(20), nullable=False)

    # Comportamentais
    tolerancia_nuance: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    estilo_decisao: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    voto_facultativo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    conflito_identitario: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Mobilidade
    meio_transporte: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    tempo_deslocamento_trabalho: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)

    # Susceptibilidade
    susceptibilidade_desinformacao: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Campos JSONB (arrays flexíveis)
    valores: Mapped[Optional[List]] = mapped_column(JSONB, default=list, nullable=True)
    preocupacoes: Mapped[Optional[List]] = mapped_column(JSONB, default=list, nullable=True)
    medos: Mapped[Optional[List]] = mapped_column(JSONB, default=list, nullable=True)
    vieses_cognitivos: Mapped[Optional[List]] = mapped_column(JSONB, default=list, nullable=True)
    fontes_informacao: Mapped[Optional[List]] = mapped_column(JSONB, default=list, nullable=True)

    # Narrativa
    historia_resumida: Mapped[str] = mapped_column(Text, nullable=False)
    instrucao_comportamental: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    def __repr__(self) -> str:
        return f"<Eleitor(id={self.id}, nome={self.nome}, regiao={self.regiao_administrativa})>"

    def to_dict(self) -> dict:
        """Converte para dicionário compatível com o formato JSON original"""
        return {
            "id": self.id,
            "nome": self.nome,
            "idade": self.idade,
            "genero": self.genero,
            "cor_raca": self.cor_raca,
            "regiao_administrativa": self.regiao_administrativa,
            "local_referencia": self.local_referencia,
            "cluster_socioeconomico": self.cluster_socioeconomico,
            "escolaridade": self.escolaridade,
            "profissao": self.profissao,
            "ocupacao_vinculo": self.ocupacao_vinculo,
            "renda_salarios_minimos": self.renda_salarios_minimos,
            "religiao": self.religiao,
            "estado_civil": self.estado_civil,
            "filhos": self.filhos,
            "orientacao_politica": self.orientacao_politica,
            "posicao_bolsonaro": self.posicao_bolsonaro,
            "interesse_politico": self.interesse_politico,
            "tolerancia_nuance": self.tolerancia_nuance,
            "estilo_decisao": self.estilo_decisao,
            "voto_facultativo": self.voto_facultativo,
            "conflito_identitario": self.conflito_identitario,
            "meio_transporte": self.meio_transporte,
            "tempo_deslocamento_trabalho": self.tempo_deslocamento_trabalho,
            "susceptibilidade_desinformacao": self.susceptibilidade_desinformacao,
            "valores": self.valores or [],
            "preocupacoes": self.preocupacoes or [],
            "medos": self.medos or [],
            "vieses_cognitivos": self.vieses_cognitivos or [],
            "fontes_informacao": self.fontes_informacao or [],
            "historia_resumida": self.historia_resumida,
            "instrucao_comportamental": self.instrucao_comportamental,
            "criado_em": self.criado_em.isoformat() if self.criado_em else None,
            "atualizado_em": self.atualizado_em.isoformat() if self.atualizado_em else None,
        }

    @classmethod
    def _converter_susceptibilidade(cls, valor) -> Optional[int]:
        """Converte susceptibilidade de string para inteiro"""
        if valor is None:
            return None
        if isinstance(valor, int):
            return valor
        # Mapeamento de strings para inteiros
        mapa = {"baixa": 1, "media": 2, "média": 2, "alta": 3}
        return mapa.get(str(valor).lower(), None)

    @classmethod
    def from_dict(cls, data: dict) -> "Eleitor":
        """Cria instância a partir de dicionário (JSON)"""
        return cls(
            id=data.get("id"),
            nome=data.get("nome"),
            idade=data.get("idade"),
            genero=data.get("genero"),
            cor_raca=data.get("cor_raca"),
            regiao_administrativa=data.get("regiao_administrativa"),
            local_referencia=data.get("local_referencia"),
            cluster_socioeconomico=data.get("cluster_socioeconomico"),
            escolaridade=data.get("escolaridade"),
            profissao=data.get("profissao"),
            ocupacao_vinculo=data.get("ocupacao_vinculo"),
            renda_salarios_minimos=data.get("renda_salarios_minimos"),
            religiao=data.get("religiao"),
            estado_civil=data.get("estado_civil"),
            filhos=data.get("filhos", 0),
            orientacao_politica=data.get("orientacao_politica"),
            posicao_bolsonaro=data.get("posicao_bolsonaro"),
            interesse_politico=data.get("interesse_politico"),
            tolerancia_nuance=data.get("tolerancia_nuance"),
            estilo_decisao=data.get("estilo_decisao"),
            voto_facultativo=data.get("voto_facultativo", False),
            conflito_identitario=data.get("conflito_identitario", False),
            meio_transporte=data.get("meio_transporte"),
            tempo_deslocamento_trabalho=data.get("tempo_deslocamento_trabalho"),
            susceptibilidade_desinformacao=cls._converter_susceptibilidade(data.get("susceptibilidade_desinformacao")),
            valores=data.get("valores", []),
            preocupacoes=data.get("preocupacoes", []),
            medos=data.get("medos", []),
            vieses_cognitivos=data.get("vieses_cognitivos", []),
            fontes_informacao=data.get("fontes_informacao", []),
            historia_resumida=data.get("historia_resumida", ""),
            instrucao_comportamental=data.get("instrucao_comportamental"),
        )
