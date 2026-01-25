"""
Modelo de Cenário Eleitoral

Tabela de cenários para simulação de eleições.
Permite criar cenários de 1º e 2º turno com diferentes candidatos.
"""

from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class CenarioEleitoral(Base):
    """
    Modelo de cenário eleitoral para simulação.

    Permite criar e salvar cenários com diferentes combinações
    de candidatos para simular pesquisas de 1º e 2º turno.
    """

    __tablename__ = "cenarios_eleitorais"

    # Identificação
    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    nome: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    descricao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Configuração do cenário
    turno: Mapped[int] = mapped_column(Integer, nullable=False, default=1)  # 1 ou 2
    cargo: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    candidatos_ids: Mapped[List] = mapped_column(JSONB, default=list, nullable=False)

    # Opções de simulação
    incluir_indecisos: Mapped[bool] = mapped_column(Boolean, default=True)
    incluir_brancos_nulos: Mapped[bool] = mapped_column(Boolean, default=True)
    amostra_tamanho: Mapped[int] = mapped_column(Integer, default=1000)

    # Filtros de eleitores (opcional)
    filtros_eleitores: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict, nullable=True)

    # Resultados da simulação
    resultados: Mapped[Optional[List]] = mapped_column(JSONB, default=list, nullable=True)
    indecisos_percentual: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    brancos_nulos_percentual: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    margem_erro: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    nivel_confianca: Mapped[Optional[float]] = mapped_column(Float, default=95.0)

    # Metadados da execução
    total_eleitores_simulados: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    custo_simulacao: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    tempo_execucao_segundos: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    modelo_ia_usado: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default='rascunho'
    )  # rascunho, executando, concluido, erro

    # Controle
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    criado_por: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

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
    executado_em: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    def __repr__(self) -> str:
        return f"<CenarioEleitoral(id={self.id}, nome={self.nome}, turno={self.turno}, cargo={self.cargo})>"

    def to_dict(self) -> dict:
        """Converte para dicionário"""
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "turno": self.turno,
            "cargo": self.cargo,
            "candidatos_ids": self.candidatos_ids or [],
            "incluir_indecisos": self.incluir_indecisos,
            "incluir_brancos_nulos": self.incluir_brancos_nulos,
            "amostra_tamanho": self.amostra_tamanho,
            "filtros_eleitores": self.filtros_eleitores or {},
            "resultados": self.resultados or [],
            "indecisos_percentual": self.indecisos_percentual,
            "brancos_nulos_percentual": self.brancos_nulos_percentual,
            "margem_erro": self.margem_erro,
            "nivel_confianca": self.nivel_confianca,
            "total_eleitores_simulados": self.total_eleitores_simulados,
            "custo_simulacao": self.custo_simulacao,
            "tempo_execucao_segundos": self.tempo_execucao_segundos,
            "modelo_ia_usado": self.modelo_ia_usado,
            "status": self.status,
            "ativo": self.ativo,
            "criado_por": self.criado_por,
            "criado_em": self.criado_em.isoformat() if self.criado_em else None,
            "atualizado_em": self.atualizado_em.isoformat() if self.atualizado_em else None,
            "executado_em": self.executado_em.isoformat() if self.executado_em else None,
        }
