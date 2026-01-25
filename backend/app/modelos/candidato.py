"""
Modelo de Candidato

Tabela de candidatos para eleições do DF 2026.
Armazena informações completas sobre cada candidato incluindo
nome, partido, cargo pretendido, foto, biografia e propostas.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class CargoPretendido(str, Enum):
    """Cargos pretendidos nas eleições"""
    GOVERNADOR = "governador"
    VICE_GOVERNADOR = "vice_governador"
    SENADOR = "senador"
    DEPUTADO_FEDERAL = "deputado_federal"
    DEPUTADO_DISTRITAL = "deputado_distrital"


class StatusCandidatura(str, Enum):
    """Status da candidatura"""
    PRE_CANDIDATO = "pre_candidato"
    CANDIDATO_OFICIAL = "candidato_oficial"
    INDEFERIDO = "indeferido"
    DESISTENTE = "desistente"


class Candidato(Base):
    """
    Modelo de candidato para eleições do DF 2026.

    Armazena todos os dados relevantes para simular pesquisas eleitorais
    com candidatos reais ou fictícios.
    """

    __tablename__ = "candidatos"

    # Identificação
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    nome: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    nome_urna: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    # Dados políticos
    partido: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    numero_partido: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    cargo_pretendido: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    status_candidatura: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=StatusCandidatura.PRE_CANDIDATO.value
    )

    # Coligação/Federação
    coligacao: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    vice_ou_suplentes: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    # Mídia
    foto_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    cor_campanha: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # Cor hex da campanha
    slogan: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    # Dados pessoais
    idade: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    data_nascimento: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    genero: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    naturalidade: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Carreira
    profissao: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    cargo_atual: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    historico_politico: Mapped[Optional[List]] = mapped_column(JSONB, default=list, nullable=True)

    # Conteúdo
    biografia: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    propostas_principais: Mapped[Optional[List]] = mapped_column(JSONB, default=list, nullable=True)
    areas_foco: Mapped[Optional[List]] = mapped_column(JSONB, default=list, nullable=True)

    # Redes sociais
    redes_sociais: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict, nullable=True)
    site_campanha: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)

    # Posicionamento político
    orientacao_politica: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    posicao_bolsonaro: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    posicao_lula: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)

    # Eleições anteriores
    eleicoes_anteriores: Mapped[Optional[List]] = mapped_column(JSONB, default=list, nullable=True)
    votos_ultima_eleicao: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Pontos fortes e fracos (para simulação)
    pontos_fortes: Mapped[Optional[List]] = mapped_column(JSONB, default=list, nullable=True)
    pontos_fracos: Mapped[Optional[List]] = mapped_column(JSONB, default=list, nullable=True)
    controversias: Mapped[Optional[List]] = mapped_column(JSONB, default=list, nullable=True)

    # Métricas de pesquisa
    rejeicao_estimada: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    conhecimento_estimado: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # % que conhece

    # Controle
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    ordem_exibicao: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

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
        return f"<Candidato(id={self.id}, nome={self.nome_urna}, partido={self.partido}, cargo={self.cargo_pretendido})>"

    def to_dict(self) -> dict:
        """Converte para dicionário"""
        return {
            "id": self.id,
            "nome": self.nome,
            "nome_urna": self.nome_urna,
            "partido": self.partido,
            "numero_partido": self.numero_partido,
            "cargo_pretendido": self.cargo_pretendido,
            "status_candidatura": self.status_candidatura,
            "coligacao": self.coligacao,
            "vice_ou_suplentes": self.vice_ou_suplentes,
            "foto_url": self.foto_url,
            "cor_campanha": self.cor_campanha,
            "slogan": self.slogan,
            "idade": self.idade,
            "data_nascimento": self.data_nascimento,
            "genero": self.genero,
            "naturalidade": self.naturalidade,
            "profissao": self.profissao,
            "cargo_atual": self.cargo_atual,
            "historico_politico": self.historico_politico or [],
            "biografia": self.biografia,
            "propostas_principais": self.propostas_principais or [],
            "areas_foco": self.areas_foco or [],
            "redes_sociais": self.redes_sociais or {},
            "site_campanha": self.site_campanha,
            "orientacao_politica": self.orientacao_politica,
            "posicao_bolsonaro": self.posicao_bolsonaro,
            "posicao_lula": self.posicao_lula,
            "eleicoes_anteriores": self.eleicoes_anteriores or [],
            "votos_ultima_eleicao": self.votos_ultima_eleicao,
            "pontos_fortes": self.pontos_fortes or [],
            "pontos_fracos": self.pontos_fracos or [],
            "controversias": self.controversias or [],
            "rejeicao_estimada": self.rejeicao_estimada,
            "conhecimento_estimado": self.conhecimento_estimado,
            "ativo": self.ativo,
            "ordem_exibicao": self.ordem_exibicao,
            "criado_em": self.criado_em.isoformat() if self.criado_em else None,
            "atualizado_em": self.atualizado_em.isoformat() if self.atualizado_em else None,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Candidato":
        """Cria instância a partir de dicionário"""
        return cls(
            id=data.get("id"),
            nome=data.get("nome"),
            nome_urna=data.get("nome_urna"),
            partido=data.get("partido"),
            numero_partido=data.get("numero_partido"),
            cargo_pretendido=data.get("cargo_pretendido"),
            status_candidatura=data.get("status_candidatura", StatusCandidatura.PRE_CANDIDATO.value),
            coligacao=data.get("coligacao"),
            vice_ou_suplentes=data.get("vice_ou_suplentes"),
            foto_url=data.get("foto_url"),
            cor_campanha=data.get("cor_campanha"),
            slogan=data.get("slogan"),
            idade=data.get("idade"),
            data_nascimento=data.get("data_nascimento"),
            genero=data.get("genero"),
            naturalidade=data.get("naturalidade"),
            profissao=data.get("profissao"),
            cargo_atual=data.get("cargo_atual"),
            historico_politico=data.get("historico_politico", []),
            biografia=data.get("biografia"),
            propostas_principais=data.get("propostas_principais", []),
            areas_foco=data.get("areas_foco", []),
            redes_sociais=data.get("redes_sociais", {}),
            site_campanha=data.get("site_campanha"),
            orientacao_politica=data.get("orientacao_politica"),
            posicao_bolsonaro=data.get("posicao_bolsonaro"),
            posicao_lula=data.get("posicao_lula"),
            eleicoes_anteriores=data.get("eleicoes_anteriores", []),
            votos_ultima_eleicao=data.get("votos_ultima_eleicao"),
            pontos_fortes=data.get("pontos_fortes", []),
            pontos_fracos=data.get("pontos_fracos", []),
            controversias=data.get("controversias", []),
            rejeicao_estimada=data.get("rejeicao_estimada"),
            conhecimento_estimado=data.get("conhecimento_estimado"),
            ativo=data.get("ativo", True),
            ordem_exibicao=data.get("ordem_exibicao"),
        )
