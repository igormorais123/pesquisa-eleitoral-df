"""
Modelo para Pesquisa PODC (Planejar, Organizar, Dirigir, Controlar)

Este modelo armazena os resultados de pesquisas sobre distribuição de tempo
nas funções administrativas de gestores públicos e privados.
"""

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import JSON, Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class PesquisaPODC(Base):
    """
    Modelo para armazenar pesquisas PODC completas.
    """

    __tablename__ = 'pesquisas_podc'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    # usuario_id sem FK para permitir autenticação de teste
    usuario_id = Column(String(36), nullable=False, index=True)

    # Informações básicas da pesquisa
    titulo = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=True)

    # Status da pesquisa
    status = Column(
        String(20),
        default='pendente',
        nullable=False
    )  # pendente, em_andamento, pausada, concluida, cancelada

    # Contadores
    total_gestores = Column(Integer, default=0)
    total_respostas = Column(Integer, default=0)

    # Perguntas (armazenadas como JSON)
    perguntas = Column(JSON, nullable=True)

    # IDs dos gestores selecionados
    gestores_ids = Column(JSON, nullable=True)

    # Métricas de execução
    custo_total = Column(Float, default=0.0)
    tokens_total = Column(Integer, default=0)

    # Timestamps
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    iniciado_em = Column(DateTime, nullable=True)
    finalizado_em = Column(DateTime, nullable=True)

    # Relacionamentos
    respostas = relationship('RespostaPODC', back_populates='pesquisa', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<PesquisaPODC {self.id}: {self.titulo}>"


class RespostaPODC(Base):
    """
    Modelo para armazenar respostas individuais de gestores em pesquisas PODC.
    Cada resposta contém todos os dados estruturados para análise estatística.
    """

    __tablename__ = 'respostas_podc'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    pesquisa_id = Column(String(36), ForeignKey('pesquisas_podc.id'), nullable=False)

    # Informações do gestor
    gestor_id = Column(String(36), nullable=False)
    gestor_nome = Column(String(255), nullable=False)
    gestor_setor = Column(String(20), nullable=False)  # publico, privado
    gestor_nivel = Column(String(20), nullable=False)  # estrategico, tatico, operacional
    gestor_cargo = Column(String(255), nullable=True)
    gestor_instituicao = Column(String(255), nullable=True)

    # Distribuição PODC (percentuais - devem somar 100)
    podc_planejar = Column(Float, nullable=True)
    podc_organizar = Column(Float, nullable=True)
    podc_dirigir = Column(Float, nullable=True)
    podc_controlar = Column(Float, nullable=True)

    # Distribuição PODC Ideal
    podc_ideal_planejar = Column(Float, nullable=True)
    podc_ideal_organizar = Column(Float, nullable=True)
    podc_ideal_dirigir = Column(Float, nullable=True)
    podc_ideal_controlar = Column(Float, nullable=True)

    # Horas semanais
    horas_total = Column(Float, nullable=True)
    horas_planejar = Column(Float, nullable=True)
    horas_organizar = Column(Float, nullable=True)
    horas_dirigir = Column(Float, nullable=True)
    horas_controlar = Column(Float, nullable=True)

    # Índice de Autonomia Decisória (IAD)
    iad = Column(Float, nullable=True)  # (P+O)/(D+C)
    iad_classificacao = Column(String(50), nullable=True)  # Proativo, Reativo, etc.

    # Ranking de importância (JSON array)
    ranking_importancia = Column(JSON, nullable=True)

    # Fatores limitantes (JSON array)
    fatores_limitantes = Column(JSON, nullable=True)

    # Justificativa (texto longo)
    justificativa = Column(Text, nullable=True)

    # Frequência de atividades (JSON object com todas as frequências)
    frequencia_atividades = Column(JSON, nullable=True)

    # Respostas às perguntas específicas (JSON array)
    respostas_perguntas = Column(JSON, nullable=True)

    # Resposta bruta do Claude (para debug e auditoria)
    resposta_bruta = Column(Text, nullable=True)

    # Métricas de execução
    tokens_input = Column(Integer, default=0)
    tokens_output = Column(Integer, default=0)
    custo_reais = Column(Float, default=0.0)

    # Status e timestamps
    status = Column(String(20), default='pendente')  # pendente, processando, concluida, erro
    erro = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)
    processado_em = Column(DateTime, nullable=True)

    # Relacionamento
    pesquisa = relationship('PesquisaPODC', back_populates='respostas')

    def __repr__(self):
        return f"<RespostaPODC {self.id}: {self.gestor_nome}>"

    def calcular_iad(self) -> Optional[float]:
        """
        Calcula o Índice de Autonomia Decisória.
        IAD = (Planejar + Organizar) / (Dirigir + Controlar)
        """
        if not all([
            self.podc_planejar is not None,
            self.podc_organizar is not None,
            self.podc_dirigir is not None,
            self.podc_controlar is not None
        ]):
            return None

        denominador = self.podc_dirigir + self.podc_controlar
        if denominador == 0:
            return 0.0

        return round((self.podc_planejar + self.podc_organizar) / denominador, 2)

    def classificar_iad(self) -> str:
        """
        Classifica o perfil com base no IAD.
        """
        if self.iad is None:
            iad = self.calcular_iad()
        else:
            iad = self.iad

        if iad is None:
            return "Não classificado"

        if iad >= 1.5:
            return "Altamente Proativo (Formulador)"
        elif iad >= 1.0:
            return "Proativo"
        elif iad >= 0.7:
            return "Equilibrado"
        elif iad >= 0.5:
            return "Reativo"
        else:
            return "Altamente Reativo (Executor)"


class EstatisticasPODC(Base):
    """
    Modelo para armazenar estatísticas agregadas de pesquisas PODC.
    Útil para análises comparativas e relatórios.
    """

    __tablename__ = 'estatisticas_podc'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    pesquisa_id = Column(String(36), ForeignKey('pesquisas_podc.id'), nullable=False)

    # Agrupamento
    grupo_tipo = Column(String(20), nullable=False)  # geral, setor, nivel
    grupo_valor = Column(String(50), nullable=True)  # publico, privado, estrategico, etc.

    # Contagem
    total_respostas = Column(Integer, default=0)

    # Médias PODC
    media_planejar = Column(Float, nullable=True)
    media_organizar = Column(Float, nullable=True)
    media_dirigir = Column(Float, nullable=True)
    media_controlar = Column(Float, nullable=True)

    # Desvio padrão PODC
    dp_planejar = Column(Float, nullable=True)
    dp_organizar = Column(Float, nullable=True)
    dp_dirigir = Column(Float, nullable=True)
    dp_controlar = Column(Float, nullable=True)

    # IAD agregado
    media_iad = Column(Float, nullable=True)
    dp_iad = Column(Float, nullable=True)

    # Horas médias
    media_horas_total = Column(Float, nullable=True)

    # Timestamp
    calculado_em = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<EstatisticasPODC {self.grupo_tipo}: {self.grupo_valor}>"
