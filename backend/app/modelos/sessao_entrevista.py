"""
Modelo de Sessão de Entrevista

Armazena sessões de entrevistas executadas com todos os dados,
respostas e metadados para persistência e sincronização.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class StatusSessao(str, Enum):
    """Status possíveis de uma sessão de entrevista"""
    EM_ANDAMENTO = "em_andamento"
    PAUSADA = "pausada"
    CONCLUIDA = "concluida"
    ERRO = "erro"


class SessaoEntrevista(Base):
    """
    Modelo de Sessão de Entrevista.

    Armazena todas as informações de uma sessão de entrevista,
    incluindo respostas, custos, tokens e relatório de IA.
    """

    __tablename__ = "sessoes_entrevista"

    # Identificação
    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    entrevista_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    # Vínculo com usuário
    usuario_id: Mapped[str] = mapped_column(
        String(50),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    usuario_nome: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    # Metadados da sessão
    titulo: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50),
        default=StatusSessao.EM_ANDAMENTO.value,
        nullable=False,
        index=True
    )

    # Progresso
    progresso: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_agentes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Custos e tokens
    custo_atual: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    tokens_input: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tokens_output: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Dados JSON (respostas, perguntas, resultado, relatório)
    perguntas: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(
        JSON,
        nullable=True,
        default=list
    )
    respostas: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(
        JSON,
        nullable=True,
        default=list
    )
    resultado: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True
    )
    relatorio_ia: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True
    )
    estatisticas: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True
    )

    # Configurações usadas
    modelo_usado: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    configuracoes: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True
    )

    # Timestamps
    iniciada_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    atualizada_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    finalizada_em: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Sincronização
    sincronizado: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    versao: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Relacionamento com usuário
    usuario = relationship("Usuario", backref="sessoes_entrevista")

    def __repr__(self) -> str:
        return f"<SessaoEntrevista(id={self.id}, titulo={self.titulo}, status={self.status})>"

    def to_dict(self) -> dict:
        """Converte para dicionário compatível com frontend"""
        return {
            "id": self.id,
            "entrevistaId": self.entrevista_id,
            "titulo": self.titulo,
            "status": self.status,
            "progresso": self.progresso,
            "totalAgentes": self.total_agentes,
            "custoAtual": self.custo_atual,
            "tokensInput": self.tokens_input,
            "tokensOutput": self.tokens_output,
            "perguntas": self.perguntas or [],
            "respostas": self.respostas or [],
            "resultado": self.resultado,
            "relatorioIA": self.relatorio_ia,
            "estatisticas": self.estatisticas,
            "modeloUsado": self.modelo_usado,
            "configuracoes": self.configuracoes,
            "iniciadaEm": self.iniciada_em.isoformat() if self.iniciada_em else None,
            "atualizadaEm": self.atualizada_em.isoformat() if self.atualizada_em else None,
            "finalizadaEm": self.finalizada_em.isoformat() if self.finalizada_em else None,
            "usuarioId": self.usuario_id,
            "usuarioNome": self.usuario_nome,
            "sincronizado": self.sincronizado,
            "versao": self.versao,
        }

    @classmethod
    def from_dict(cls, data: dict, usuario_id: str, usuario_nome: str = None) -> "SessaoEntrevista":
        """Cria instância a partir de dicionário do frontend"""
        return cls(
            id=data.get("id"),
            entrevista_id=data.get("entrevistaId", ""),
            usuario_id=usuario_id,
            usuario_nome=usuario_nome,
            titulo=data.get("titulo", "Sessão sem título"),
            status=data.get("status", StatusSessao.EM_ANDAMENTO.value),
            progresso=data.get("progresso", 0),
            total_agentes=data.get("totalAgentes", 0),
            custo_atual=data.get("custoAtual", 0.0),
            tokens_input=data.get("tokensInput", 0),
            tokens_output=data.get("tokensOutput", 0),
            perguntas=data.get("perguntas", []),
            respostas=data.get("respostas", []),
            resultado=data.get("resultado"),
            relatorio_ia=data.get("relatorioIA"),
            estatisticas=data.get("estatisticas"),
            modelo_usado=data.get("modeloUsado"),
            configuracoes=data.get("configuracoes"),
        )
