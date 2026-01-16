"""
Serviço de Persistência de Pesquisas.

Gerencia operações CRUD e consultas para pesquisas eleitorais no PostgreSQL.
"""

import logging
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modelos import (
    Analise,
    PerguntaPesquisa,
    Pesquisa,
    Resposta,
    StatusPesquisa,
    TipoAnalise,
    TipoPergunta,
    TipoPesquisa,
)

logger = logging.getLogger(__name__)


class PesquisaPersistenciaServico:
    """
    Serviço para persistência de pesquisas no banco de dados.

    Fornece métodos para:
    - CRUD de pesquisas
    - Registro de respostas
    - Atualização de status e métricas
    - Consultas e listagens
    """

    def __init__(self, sessao: AsyncSession):
        """
        Inicializa o serviço com uma sessão do banco.

        Args:
            sessao: Sessão assíncrona do SQLAlchemy
        """
        self.sessao = sessao

    # ==========================================
    # CRUD de Pesquisas
    # ==========================================

    async def criar_pesquisa(
        self,
        titulo: str,
        descricao: Optional[str] = None,
        tipo: TipoPesquisa = TipoPesquisa.mista,
        instrucao_geral: Optional[str] = None,
        perguntas: Optional[list[dict[str, Any]]] = None,
        eleitores_ids: Optional[list[str]] = None,
        limite_custo: Optional[float] = None,
    ) -> Pesquisa:
        """
        Cria uma nova pesquisa com suas perguntas.

        Args:
            titulo: Título da pesquisa
            descricao: Descrição opcional
            tipo: Tipo da pesquisa (quantitativa, qualitativa, mista)
            instrucao_geral: Instruções para a IA
            perguntas: Lista de perguntas (dicts com texto, tipo, opcoes, etc.)
            eleitores_ids: IDs dos eleitores que participarão
            limite_custo: Limite de custo em reais

        Returns:
            Pesquisa criada com ID
        """
        pesquisa = Pesquisa(
            titulo=titulo,
            descricao=descricao,
            tipo=tipo,
            status=StatusPesquisa.rascunho,
            instrucao_geral=instrucao_geral,
            total_eleitores=len(eleitores_ids) if eleitores_ids else 0,
            limite_custo=limite_custo,
        )

        self.sessao.add(pesquisa)
        await self.sessao.flush()  # Obtém o ID

        # Adicionar perguntas
        if perguntas:
            for ordem, pergunta_data in enumerate(perguntas):
                pergunta = PerguntaPesquisa(
                    pesquisa_id=pesquisa.id,
                    texto=pergunta_data["texto"],
                    tipo=TipoPergunta(pergunta_data.get("tipo", "aberta")),
                    ordem=ordem,
                    obrigatoria=pergunta_data.get("obrigatoria", True),
                    opcoes=pergunta_data.get("opcoes"),
                    escala_min=pergunta_data.get("escala_min"),
                    escala_max=pergunta_data.get("escala_max"),
                    escala_rotulos=pergunta_data.get("escala_rotulos"),
                    instrucoes_ia=pergunta_data.get("instrucoes_ia"),
                    codigo=pergunta_data.get("codigo"),
                )
                self.sessao.add(pergunta)

        await self.sessao.flush()
        logger.info(f"Pesquisa criada: id={pesquisa.id}, titulo='{titulo}'")
        return pesquisa

    async def obter_pesquisa(
        self,
        pesquisa_id: int,
        incluir_perguntas: bool = True,
        incluir_respostas: bool = False,
        incluir_analises: bool = False,
    ) -> Optional[Pesquisa]:
        """
        Obtém uma pesquisa por ID com relacionamentos opcionais.

        Args:
            pesquisa_id: ID da pesquisa
            incluir_perguntas: Se deve carregar as perguntas
            incluir_respostas: Se deve carregar as respostas
            incluir_analises: Se deve carregar as análises

        Returns:
            Pesquisa ou None se não encontrada
        """
        query = select(Pesquisa).where(Pesquisa.id == pesquisa_id)

        if incluir_perguntas:
            query = query.options(selectinload(Pesquisa.perguntas))
        if incluir_analises:
            query = query.options(selectinload(Pesquisa.analises))

        result = await self.sessao.execute(query)
        pesquisa = result.scalar_one_or_none()

        if pesquisa and incluir_respostas:
            # Carregar respostas separadamente para evitar explosão de dados
            query_respostas = (
                select(Resposta)
                .where(Resposta.pesquisa_id == pesquisa_id)
                .order_by(Resposta.criado_em)
            )
            result_respostas = await self.sessao.execute(query_respostas)
            # As respostas serão acessadas via pesquisa.respostas (lazy)

        return pesquisa

    async def atualizar_pesquisa(
        self,
        pesquisa_id: int,
        **campos: Any,
    ) -> Optional[Pesquisa]:
        """
        Atualiza campos de uma pesquisa.

        Args:
            pesquisa_id: ID da pesquisa
            **campos: Campos a atualizar (titulo, descricao, status, etc.)

        Returns:
            Pesquisa atualizada ou None
        """
        pesquisa = await self.obter_pesquisa(pesquisa_id, incluir_perguntas=False)
        if not pesquisa:
            return None

        for campo, valor in campos.items():
            if hasattr(pesquisa, campo):
                setattr(pesquisa, campo, valor)

        await self.sessao.flush()
        logger.info(f"Pesquisa atualizada: id={pesquisa_id}, campos={list(campos.keys())}")
        return pesquisa

    async def deletar_pesquisa(self, pesquisa_id: int) -> bool:
        """
        Deleta uma pesquisa e todos os dados relacionados.

        Args:
            pesquisa_id: ID da pesquisa

        Returns:
            True se deletada, False se não encontrada
        """
        pesquisa = await self.obter_pesquisa(pesquisa_id, incluir_perguntas=False)
        if not pesquisa:
            return False

        await self.sessao.delete(pesquisa)
        await self.sessao.flush()
        logger.info(f"Pesquisa deletada: id={pesquisa_id}")
        return True

    # ==========================================
    # Status e Execução
    # ==========================================

    async def atualizar_status(
        self,
        pesquisa_id: int,
        status: StatusPesquisa,
        erro_mensagem: Optional[str] = None,
    ) -> Optional[Pesquisa]:
        """
        Atualiza o status de uma pesquisa.

        Args:
            pesquisa_id: ID da pesquisa
            status: Novo status
            erro_mensagem: Mensagem de erro (se status=erro)

        Returns:
            Pesquisa atualizada ou None
        """
        pesquisa = await self.obter_pesquisa(pesquisa_id, incluir_perguntas=False)
        if not pesquisa:
            return None

        pesquisa.status = status
        pesquisa.erro_mensagem = erro_mensagem

        # Atualizar timestamps baseado no status
        agora = datetime.now()
        if status == StatusPesquisa.executando:
            if not pesquisa.iniciado_em:
                pesquisa.iniciado_em = agora
        elif status == StatusPesquisa.pausada:
            pesquisa.pausado_em = agora
        elif status in (StatusPesquisa.concluida, StatusPesquisa.cancelada, StatusPesquisa.erro):
            pesquisa.finalizado_em = agora

        await self.sessao.flush()
        logger.info(f"Status atualizado: pesquisa_id={pesquisa_id}, status={status.value}")
        return pesquisa

    async def iniciar_pesquisa(self, pesquisa_id: int) -> Optional[Pesquisa]:
        """Inicia a execução de uma pesquisa."""
        return await self.atualizar_status(pesquisa_id, StatusPesquisa.executando)

    async def pausar_pesquisa(self, pesquisa_id: int) -> Optional[Pesquisa]:
        """Pausa a execução de uma pesquisa."""
        return await self.atualizar_status(pesquisa_id, StatusPesquisa.pausada)

    async def finalizar_pesquisa(
        self,
        pesquisa_id: int,
        custo_total: Optional[float] = None,
        tokens_total: Optional[int] = None,
    ) -> Optional[Pesquisa]:
        """
        Finaliza uma pesquisa com métricas finais.

        Args:
            pesquisa_id: ID da pesquisa
            custo_total: Custo total da pesquisa
            tokens_total: Total de tokens usados

        Returns:
            Pesquisa atualizada ou None
        """
        pesquisa = await self.atualizar_status(pesquisa_id, StatusPesquisa.concluida)
        if not pesquisa:
            return None

        pesquisa.progresso = 100
        if custo_total is not None:
            pesquisa.custo_total = custo_total
        if tokens_total is not None:
            pesquisa.tokens_total = tokens_total

        await self.sessao.flush()
        return pesquisa

    # ==========================================
    # Respostas
    # ==========================================

    async def registrar_resposta(
        self,
        pesquisa_id: int,
        pergunta_id: int,
        eleitor_id: str,
        resposta_texto: str,
        resposta_valor: Optional[Any] = None,
        fluxo_cognitivo: Optional[dict[str, Any]] = None,
        modelo_usado: str = "claude-sonnet-4-20250514",
        tokens_entrada: int = 0,
        tokens_saida: int = 0,
        custo: float = 0.0,
        tempo_resposta_ms: int = 0,
        eleitor_nome: Optional[str] = None,
        metadados: Optional[dict[str, Any]] = None,
    ) -> Resposta:
        """
        Registra uma resposta de eleitor no banco.

        Args:
            pesquisa_id: ID da pesquisa
            pergunta_id: ID da pergunta
            eleitor_id: ID do eleitor
            resposta_texto: Texto da resposta
            resposta_valor: Valor estruturado (para escalas, etc.)
            fluxo_cognitivo: Chain of Thought da IA
            modelo_usado: Modelo de IA utilizado
            tokens_entrada: Tokens de entrada
            tokens_saida: Tokens de saída
            custo: Custo em reais
            tempo_resposta_ms: Tempo de resposta em ms
            eleitor_nome: Nome do eleitor (opcional)
            metadados: Dados extras

        Returns:
            Resposta criada
        """
        resposta = Resposta(
            pesquisa_id=pesquisa_id,
            pergunta_id=pergunta_id,
            eleitor_id=eleitor_id,
            eleitor_nome=eleitor_nome,
            resposta_texto=resposta_texto,
            resposta_valor=resposta_valor,
            fluxo_cognitivo=fluxo_cognitivo,
            modelo_usado=modelo_usado,
            tokens_entrada=tokens_entrada,
            tokens_saida=tokens_saida,
            custo=custo,
            tempo_resposta_ms=tempo_resposta_ms,
            metadados=metadados,
        )

        self.sessao.add(resposta)
        await self.sessao.flush()

        # Atualizar métricas da pesquisa
        await self._atualizar_metricas_pesquisa(
            pesquisa_id,
            tokens_entrada=tokens_entrada,
            tokens_saida=tokens_saida,
            custo=custo,
        )

        logger.debug(
            f"Resposta registrada: pesquisa_id={pesquisa_id}, "
            f"pergunta_id={pergunta_id}, eleitor_id={eleitor_id}"
        )
        return resposta

    async def obter_respostas_pesquisa(
        self,
        pesquisa_id: int,
        pergunta_id: Optional[int] = None,
        eleitor_id: Optional[str] = None,
        limite: int = 100,
        offset: int = 0,
    ) -> list[Resposta]:
        """
        Obtém respostas de uma pesquisa com filtros.

        Args:
            pesquisa_id: ID da pesquisa
            pergunta_id: Filtrar por pergunta
            eleitor_id: Filtrar por eleitor
            limite: Máximo de resultados
            offset: Pular N resultados

        Returns:
            Lista de respostas
        """
        query = (
            select(Resposta)
            .where(Resposta.pesquisa_id == pesquisa_id)
            .order_by(Resposta.criado_em)
            .limit(limite)
            .offset(offset)
        )

        if pergunta_id:
            query = query.where(Resposta.pergunta_id == pergunta_id)
        if eleitor_id:
            query = query.where(Resposta.eleitor_id == eleitor_id)

        result = await self.sessao.execute(query)
        return list(result.scalars().all())

    async def contar_respostas(
        self,
        pesquisa_id: int,
        pergunta_id: Optional[int] = None,
    ) -> int:
        """Conta respostas de uma pesquisa."""
        query = select(func.count(Resposta.id)).where(
            Resposta.pesquisa_id == pesquisa_id
        )
        if pergunta_id:
            query = query.where(Resposta.pergunta_id == pergunta_id)

        result = await self.sessao.execute(query)
        return result.scalar() or 0

    # ==========================================
    # Análises
    # ==========================================

    async def salvar_analise(
        self,
        pesquisa_id: int,
        tipo: TipoAnalise = TipoAnalise.completa,
        estatisticas: Optional[dict[str, Any]] = None,
        sentimentos: Optional[dict[str, Any]] = None,
        temas: Optional[dict[str, Any]] = None,
        insights: Optional[dict[str, Any]] = None,
        correlacoes: Optional[dict[str, Any]] = None,
        mapa_calor: Optional[dict[str, Any]] = None,
        voto_silencioso: Optional[dict[str, Any]] = None,
        pontos_ruptura: Optional[dict[str, Any]] = None,
        metadados: Optional[dict[str, Any]] = None,
        titulo: Optional[str] = None,
        descricao: Optional[str] = None,
    ) -> Analise:
        """
        Salva uma análise de pesquisa.

        Args:
            pesquisa_id: ID da pesquisa
            tipo: Tipo de análise
            estatisticas: Estatísticas descritivas
            sentimentos: Análise de sentimentos
            temas: Temas identificados
            insights: Insights gerados
            correlacoes: Correlações entre variáveis
            mapa_calor: Dados do mapa de calor
            voto_silencioso: Análise de voto silencioso
            pontos_ruptura: Pontos de ruptura
            metadados: Metadados extras
            titulo: Título da análise
            descricao: Descrição

        Returns:
            Análise criada
        """
        # Determinar próxima versão
        query = select(func.max(Analise.versao)).where(
            Analise.pesquisa_id == pesquisa_id,
            Analise.tipo == tipo,
        )
        result = await self.sessao.execute(query)
        versao_atual = result.scalar() or 0

        analise = Analise(
            pesquisa_id=pesquisa_id,
            tipo=tipo,
            versao=versao_atual + 1,
            titulo=titulo,
            descricao=descricao,
            estatisticas=estatisticas,
            sentimentos=sentimentos,
            temas=temas,
            insights=insights,
            correlacoes=correlacoes,
            mapa_calor=mapa_calor,
            voto_silencioso=voto_silencioso,
            pontos_ruptura=pontos_ruptura,
            metadados=metadados,
        )

        self.sessao.add(analise)
        await self.sessao.flush()

        logger.info(
            f"Análise salva: pesquisa_id={pesquisa_id}, "
            f"tipo={tipo.value}, versao={analise.versao}"
        )
        return analise

    async def obter_ultima_analise(
        self,
        pesquisa_id: int,
        tipo: Optional[TipoAnalise] = None,
    ) -> Optional[Analise]:
        """
        Obtém a análise mais recente de uma pesquisa.

        Args:
            pesquisa_id: ID da pesquisa
            tipo: Filtrar por tipo de análise

        Returns:
            Última análise ou None
        """
        query = (
            select(Analise)
            .where(Analise.pesquisa_id == pesquisa_id)
            .order_by(Analise.criado_em.desc())
            .limit(1)
        )

        if tipo:
            query = query.where(Analise.tipo == tipo)

        result = await self.sessao.execute(query)
        return result.scalar_one_or_none()

    # ==========================================
    # Listagens e Consultas
    # ==========================================

    async def listar_pesquisas(
        self,
        status: Optional[StatusPesquisa] = None,
        tipo: Optional[TipoPesquisa] = None,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None,
        busca: Optional[str] = None,
        limite: int = 20,
        offset: int = 0,
        ordenar_por: str = "criado_em",
        ordem_desc: bool = True,
    ) -> tuple[list[Pesquisa], int]:
        """
        Lista pesquisas com filtros e paginação.

        Args:
            status: Filtrar por status
            tipo: Filtrar por tipo
            data_inicio: Data mínima de criação
            data_fim: Data máxima de criação
            busca: Buscar no título/descrição
            limite: Máximo de resultados
            offset: Pular N resultados
            ordenar_por: Campo para ordenação
            ordem_desc: Ordem descendente

        Returns:
            Tupla (lista de pesquisas, total)
        """
        # Query base
        query = select(Pesquisa)

        # Aplicar filtros
        if status:
            query = query.where(Pesquisa.status == status)
        if tipo:
            query = query.where(Pesquisa.tipo == tipo)
        if data_inicio:
            query = query.where(Pesquisa.criado_em >= data_inicio)
        if data_fim:
            query = query.where(Pesquisa.criado_em <= data_fim)
        if busca:
            busca_like = f"%{busca}%"
            query = query.where(
                (Pesquisa.titulo.ilike(busca_like))
                | (Pesquisa.descricao.ilike(busca_like))
            )

        # Contar total
        query_count = select(func.count()).select_from(query.subquery())
        result_count = await self.sessao.execute(query_count)
        total = result_count.scalar() or 0

        # Ordenação
        coluna_ordem = getattr(Pesquisa, ordenar_por, Pesquisa.criado_em)
        if ordem_desc:
            query = query.order_by(coluna_ordem.desc())
        else:
            query = query.order_by(coluna_ordem.asc())

        # Paginação
        query = query.limit(limite).offset(offset)

        # Executar
        result = await self.sessao.execute(query)
        pesquisas = list(result.scalars().all())

        return pesquisas, total

    async def obter_estatisticas_globais(self) -> dict[str, Any]:
        """
        Obtém estatísticas globais de todas as pesquisas.

        Returns:
            Dicionário com métricas agregadas
        """
        # Total de pesquisas por status
        query_status = select(
            Pesquisa.status,
            func.count(Pesquisa.id),
        ).group_by(Pesquisa.status)
        result_status = await self.sessao.execute(query_status)
        por_status = {row[0].value: row[1] for row in result_status.all()}

        # Total de respostas
        query_respostas = select(func.count(Resposta.id))
        result_respostas = await self.sessao.execute(query_respostas)
        total_respostas = result_respostas.scalar() or 0

        # Eleitores únicos
        query_eleitores = select(func.count(func.distinct(Resposta.eleitor_id)))
        result_eleitores = await self.sessao.execute(query_eleitores)
        eleitores_unicos = result_eleitores.scalar() or 0

        # Custos e tokens totais
        query_metricas = select(
            func.sum(Pesquisa.custo_total),
            func.sum(Pesquisa.tokens_total),
        )
        result_metricas = await self.sessao.execute(query_metricas)
        row = result_metricas.one()
        custo_acumulado = float(row[0] or 0)
        tokens_acumulados = int(row[1] or 0)

        return {
            "total_pesquisas": sum(por_status.values()),
            "pesquisas_por_status": por_status,
            "total_respostas": total_respostas,
            "eleitores_unicos": eleitores_unicos,
            "custo_acumulado": custo_acumulado,
            "tokens_acumulados": tokens_acumulados,
        }

    # ==========================================
    # Métodos Auxiliares Privados
    # ==========================================

    async def _atualizar_metricas_pesquisa(
        self,
        pesquisa_id: int,
        tokens_entrada: int = 0,
        tokens_saida: int = 0,
        custo: float = 0.0,
    ) -> None:
        """Atualiza métricas acumuladas da pesquisa."""
        pesquisa = await self.obter_pesquisa(pesquisa_id, incluir_perguntas=False)
        if not pesquisa:
            return

        pesquisa.tokens_entrada_total += tokens_entrada
        pesquisa.tokens_saida_total += tokens_saida
        pesquisa.tokens_total += tokens_entrada + tokens_saida
        pesquisa.custo_total += custo

        # Atualizar progresso
        total_esperado = pesquisa.total_eleitores * len(pesquisa.perguntas) if pesquisa.perguntas else 0
        if total_esperado > 0:
            respostas_atuais = await self.contar_respostas(pesquisa_id)
            pesquisa.progresso = min(100, int((respostas_atuais / total_esperado) * 100))

        await self.sessao.flush()


# Factory para criar instância do serviço
def obter_servico_persistencia(sessao: AsyncSession) -> PesquisaPersistenciaServico:
    """
    Obtém uma instância do serviço de persistência.

    Args:
        sessao: Sessão do banco de dados

    Returns:
        Instância do serviço
    """
    return PesquisaPersistenciaServico(sessao)
