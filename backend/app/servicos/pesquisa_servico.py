"""
Serviço de Persistência de Pesquisas

Gerencia todas as operações de CRUD e persistência de pesquisas eleitorais.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from uuid import uuid4
import math

from sqlalchemy import and_, desc, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.modelos.pesquisa import (
    AnalisePesquisa,
    MetricasGlobais,
    PerguntaPesquisa,
    Pesquisa,
    RespostaPesquisa,
)
from app.esquemas.pesquisa import (
    DashboardGlobal,
    FiltrosPesquisa,
    PesquisaCreate,
    PesquisaUpdate,
    RespostaPesquisaCreate,
    StatusPesquisa,
)


class PesquisaServico:
    """Serviço para gerenciar persistência de pesquisas"""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ============================================
    # CRUD DE PESQUISAS
    # ============================================

    async def criar_pesquisa(self, dados: PesquisaCreate) -> Pesquisa:
        """
        Cria uma nova pesquisa com suas perguntas.

        Args:
            dados: Dados da pesquisa a criar

        Returns:
            Pesquisa criada
        """
        pesquisa_id = str(uuid4())

        # Criar pesquisa
        pesquisa = Pesquisa(
            id=pesquisa_id,
            titulo=dados.titulo,
            descricao=dados.descricao,
            tipo=dados.tipo.value,
            instrucao_geral=dados.instrucao_geral,
            total_eleitores=len(dados.eleitores_ids),
            total_perguntas=len(dados.perguntas),
            eleitores_ids=dados.eleitores_ids,
            limite_custo=dados.limite_custo,
            usar_opus_complexas=dados.usar_opus_complexas,
            batch_size=dados.batch_size,
        )

        # Criar perguntas
        for i, pergunta_dados in enumerate(dados.perguntas):
            pergunta = PerguntaPesquisa(
                id=str(uuid4()),
                pesquisa_id=pesquisa_id,
                texto=pergunta_dados.texto,
                tipo=pergunta_dados.tipo.value,
                ordem=i,
                obrigatoria=pergunta_dados.obrigatoria,
                opcoes=pergunta_dados.opcoes,
                escala_min=pergunta_dados.escala_min,
                escala_max=pergunta_dados.escala_max,
                escala_rotulos=pergunta_dados.escala_rotulos,
                instrucoes_ia=pergunta_dados.instrucoes_ia,
            )
            pesquisa.perguntas.append(pergunta)

        self.db.add(pesquisa)
        await self.db.commit()
        await self.db.refresh(pesquisa)

        # Atualizar métricas globais
        await self._atualizar_metricas_nova_pesquisa()

        return pesquisa

    async def obter_pesquisa(
        self, pesquisa_id: str, incluir_respostas: bool = False
    ) -> Optional[Pesquisa]:
        """
        Obtém uma pesquisa pelo ID.

        Args:
            pesquisa_id: ID da pesquisa
            incluir_respostas: Se deve carregar as respostas

        Returns:
            Pesquisa ou None se não encontrada
        """
        query = select(Pesquisa).where(Pesquisa.id == pesquisa_id)

        if incluir_respostas:
            query = query.options(
                selectinload(Pesquisa.perguntas),
                selectinload(Pesquisa.respostas),
            )
        else:
            query = query.options(selectinload(Pesquisa.perguntas))

        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def listar_pesquisas(
        self,
        filtros: Optional[FiltrosPesquisa] = None,
        pagina: int = 1,
        por_pagina: int = 20,
    ) -> Tuple[List[Pesquisa], int]:
        """
        Lista pesquisas com filtros e paginação.

        Args:
            filtros: Filtros opcionais
            pagina: Página atual (1-indexed)
            por_pagina: Itens por página

        Returns:
            Tupla (lista de pesquisas, total)
        """
        query = select(Pesquisa)
        count_query = select(func.count(Pesquisa.id))

        # Aplicar filtros
        if filtros:
            conditions = []

            if filtros.status:
                conditions.append(Pesquisa.status == filtros.status.value)

            if filtros.tipo:
                conditions.append(Pesquisa.tipo == filtros.tipo.value)

            if filtros.data_inicio:
                conditions.append(Pesquisa.criado_em >= filtros.data_inicio)

            if filtros.data_fim:
                conditions.append(Pesquisa.criado_em <= filtros.data_fim)

            if filtros.busca:
                busca_like = f"%{filtros.busca}%"
                conditions.append(
                    or_(
                        Pesquisa.titulo.ilike(busca_like),
                        Pesquisa.descricao.ilike(busca_like),
                    )
                )

            if conditions:
                query = query.where(and_(*conditions))
                count_query = count_query.where(and_(*conditions))

        # Ordenar por data de criação (mais recentes primeiro)
        query = query.order_by(desc(Pesquisa.criado_em))

        # Paginação
        offset = (pagina - 1) * por_pagina
        query = query.offset(offset).limit(por_pagina)

        # Executar
        result = await self.db.execute(query)
        pesquisas = list(result.scalars().all())

        count_result = await self.db.execute(count_query)
        total = count_result.scalar_one()

        return pesquisas, total

    async def atualizar_pesquisa(
        self, pesquisa_id: str, dados: PesquisaUpdate
    ) -> Optional[Pesquisa]:
        """
        Atualiza uma pesquisa existente.

        Args:
            pesquisa_id: ID da pesquisa
            dados: Dados a atualizar

        Returns:
            Pesquisa atualizada ou None
        """
        pesquisa = await self.obter_pesquisa(pesquisa_id)
        if not pesquisa:
            return None

        # Atualizar campos fornecidos
        update_data = dados.model_dump(exclude_unset=True)
        for campo, valor in update_data.items():
            if hasattr(pesquisa, campo):
                if campo == "status" and valor:
                    setattr(pesquisa, campo, valor.value if hasattr(valor, "value") else valor)
                else:
                    setattr(pesquisa, campo, valor)

        await self.db.commit()
        await self.db.refresh(pesquisa)
        return pesquisa

    async def deletar_pesquisa(self, pesquisa_id: str) -> bool:
        """
        Deleta uma pesquisa e seus dados relacionados.

        Args:
            pesquisa_id: ID da pesquisa

        Returns:
            True se deletada, False se não encontrada
        """
        pesquisa = await self.obter_pesquisa(pesquisa_id)
        if not pesquisa:
            return False

        await self.db.delete(pesquisa)
        await self.db.commit()
        return True

    # ============================================
    # RESPOSTAS
    # ============================================

    async def registrar_resposta(self, dados: RespostaPesquisaCreate) -> RespostaPesquisa:
        """
        Registra uma nova resposta de eleitor.

        Args:
            dados: Dados da resposta

        Returns:
            Resposta criada
        """
        resposta = RespostaPesquisa(
            id=str(uuid4()),
            pesquisa_id=dados.pesquisa_id,
            pergunta_id=dados.pergunta_id,
            eleitor_id=dados.eleitor_id,
            eleitor_nome=dados.eleitor_nome,
            eleitor_perfil=dados.eleitor_perfil,
            resposta_texto=dados.resposta_texto,
            resposta_valor=dados.resposta_valor,
            fluxo_cognitivo=dados.fluxo_cognitivo,
            sentimento=dados.sentimento,
            intensidade_sentimento=dados.intensidade_sentimento,
            modelo_usado=dados.modelo_usado,
            tokens_entrada=dados.tokens_entrada,
            tokens_saida=dados.tokens_saida,
            custo_reais=dados.custo_reais,
            tempo_resposta_ms=dados.tempo_resposta_ms,
        )

        self.db.add(resposta)

        # Atualizar contadores da pesquisa
        await self.db.execute(
            update(Pesquisa)
            .where(Pesquisa.id == dados.pesquisa_id)
            .values(
                total_respostas=Pesquisa.total_respostas + 1,
                custo_real=Pesquisa.custo_real + dados.custo_reais,
                tokens_entrada_total=Pesquisa.tokens_entrada_total + dados.tokens_entrada,
                tokens_saida_total=Pesquisa.tokens_saida_total + dados.tokens_saida,
            )
        )

        await self.db.commit()
        await self.db.refresh(resposta)
        return resposta

    async def registrar_respostas_batch(
        self, respostas: List[RespostaPesquisaCreate]
    ) -> List[RespostaPesquisa]:
        """
        Registra múltiplas respostas de uma vez.

        Args:
            respostas: Lista de dados de respostas

        Returns:
            Lista de respostas criadas
        """
        if not respostas:
            return []

        objetos = []
        custo_total = 0
        tokens_entrada_total = 0
        tokens_saida_total = 0
        pesquisa_id = respostas[0].pesquisa_id

        for dados in respostas:
            resposta = RespostaPesquisa(
                id=str(uuid4()),
                pesquisa_id=dados.pesquisa_id,
                pergunta_id=dados.pergunta_id,
                eleitor_id=dados.eleitor_id,
                eleitor_nome=dados.eleitor_nome,
                eleitor_perfil=dados.eleitor_perfil,
                resposta_texto=dados.resposta_texto,
                resposta_valor=dados.resposta_valor,
                fluxo_cognitivo=dados.fluxo_cognitivo,
                sentimento=dados.sentimento,
                intensidade_sentimento=dados.intensidade_sentimento,
                modelo_usado=dados.modelo_usado,
                tokens_entrada=dados.tokens_entrada,
                tokens_saida=dados.tokens_saida,
                custo_reais=dados.custo_reais,
                tempo_resposta_ms=dados.tempo_resposta_ms,
            )
            objetos.append(resposta)
            custo_total += dados.custo_reais
            tokens_entrada_total += dados.tokens_entrada
            tokens_saida_total += dados.tokens_saida

        self.db.add_all(objetos)

        # Atualizar contadores da pesquisa
        await self.db.execute(
            update(Pesquisa)
            .where(Pesquisa.id == pesquisa_id)
            .values(
                total_respostas=Pesquisa.total_respostas + len(objetos),
                custo_real=Pesquisa.custo_real + custo_total,
                tokens_entrada_total=Pesquisa.tokens_entrada_total + tokens_entrada_total,
                tokens_saida_total=Pesquisa.tokens_saida_total + tokens_saida_total,
            )
        )

        await self.db.commit()
        return objetos

    async def listar_respostas(
        self,
        pesquisa_id: str,
        pergunta_id: Optional[str] = None,
        eleitor_id: Optional[str] = None,
        pagina: int = 1,
        por_pagina: int = 50,
    ) -> Tuple[List[RespostaPesquisa], int]:
        """
        Lista respostas de uma pesquisa.

        Args:
            pesquisa_id: ID da pesquisa
            pergunta_id: Filtrar por pergunta específica
            eleitor_id: Filtrar por eleitor específico
            pagina: Página atual
            por_pagina: Itens por página

        Returns:
            Tupla (lista de respostas, total)
        """
        conditions = [RespostaPesquisa.pesquisa_id == pesquisa_id]

        if pergunta_id:
            conditions.append(RespostaPesquisa.pergunta_id == pergunta_id)

        if eleitor_id:
            conditions.append(RespostaPesquisa.eleitor_id == eleitor_id)

        query = (
            select(RespostaPesquisa)
            .where(and_(*conditions))
            .order_by(RespostaPesquisa.criado_em)
        )

        count_query = (
            select(func.count(RespostaPesquisa.id))
            .where(and_(*conditions))
        )

        # Paginação
        offset = (pagina - 1) * por_pagina
        query = query.offset(offset).limit(por_pagina)

        result = await self.db.execute(query)
        respostas = list(result.scalars().all())

        count_result = await self.db.execute(count_query)
        total = count_result.scalar_one()

        return respostas, total

    # ============================================
    # STATUS E PROGRESSO
    # ============================================

    async def iniciar_execucao(self, pesquisa_id: str) -> Optional[Pesquisa]:
        """Marca pesquisa como em execução"""
        return await self.atualizar_pesquisa(
            pesquisa_id,
            PesquisaUpdate(
                status=StatusPesquisa.executando,
                iniciado_em=datetime.now(),
            ),
        )

    async def pausar_execucao(self, pesquisa_id: str) -> Optional[Pesquisa]:
        """Pausa a execução de uma pesquisa"""
        return await self.atualizar_pesquisa(
            pesquisa_id,
            PesquisaUpdate(
                status=StatusPesquisa.pausada,
                pausado_em=datetime.now(),
            ),
        )

    async def retomar_execucao(self, pesquisa_id: str) -> Optional[Pesquisa]:
        """Retoma a execução de uma pesquisa pausada"""
        return await self.atualizar_pesquisa(
            pesquisa_id,
            PesquisaUpdate(status=StatusPesquisa.executando),
        )

    async def finalizar_execucao(
        self, pesquisa_id: str, erro: Optional[str] = None
    ) -> Optional[Pesquisa]:
        """
        Finaliza a execução de uma pesquisa.

        Args:
            pesquisa_id: ID da pesquisa
            erro: Mensagem de erro se houve falha
        """
        status = StatusPesquisa.erro if erro else StatusPesquisa.concluida

        pesquisa = await self.atualizar_pesquisa(
            pesquisa_id,
            PesquisaUpdate(
                status=status,
                progresso=100 if not erro else None,
                erro_mensagem=erro,
                concluido_em=datetime.now(),
            ),
        )

        # Atualizar métricas globais
        if pesquisa and not erro:
            await self._atualizar_metricas_pesquisa_concluida(pesquisa)

        return pesquisa

    async def atualizar_progresso(
        self,
        pesquisa_id: str,
        progresso: int,
        eleitores_processados: int,
    ) -> None:
        """Atualiza o progresso de uma pesquisa"""
        await self.db.execute(
            update(Pesquisa)
            .where(Pesquisa.id == pesquisa_id)
            .values(
                progresso=progresso,
                eleitores_processados=eleitores_processados,
            )
        )
        await self.db.commit()

    # ============================================
    # MÉTRICAS GLOBAIS
    # ============================================

    async def obter_metricas_globais(self) -> DashboardGlobal:
        """Obtém métricas globais do sistema"""
        result = await self.db.execute(
            select(MetricasGlobais).where(MetricasGlobais.id == 1)
        )
        metricas = result.scalar_one_or_none()

        if not metricas:
            # Criar registro inicial
            metricas = MetricasGlobais(id=1)
            self.db.add(metricas)
            await self.db.commit()
            await self.db.refresh(metricas)

        return DashboardGlobal(
            total_pesquisas=metricas.total_pesquisas,
            total_pesquisas_concluidas=metricas.total_pesquisas_concluidas,
            total_respostas=metricas.total_respostas,
            total_eleitores_unicos=metricas.total_eleitores_unicos,
            custo_total_reais=metricas.custo_total_reais,
            tokens_entrada_total=metricas.tokens_entrada_total,
            tokens_saida_total=metricas.tokens_saida_total,
            media_respostas_por_pesquisa=metricas.media_respostas_por_pesquisa,
            media_custo_por_pesquisa=metricas.media_custo_por_pesquisa,
            media_tempo_execucao_segundos=metricas.media_tempo_execucao_segundos,
            sentimentos_acumulados=metricas.sentimentos_acumulados,
            atualizado_em=metricas.atualizado_em,
        )

    async def _atualizar_metricas_nova_pesquisa(self) -> None:
        """Incrementa contador de pesquisas"""
        await self.db.execute(
            update(MetricasGlobais)
            .where(MetricasGlobais.id == 1)
            .values(total_pesquisas=MetricasGlobais.total_pesquisas + 1)
        )

    async def _atualizar_metricas_pesquisa_concluida(self, pesquisa: Pesquisa) -> None:
        """Atualiza métricas após conclusão de pesquisa"""
        # Contar eleitores únicos
        result = await self.db.execute(
            select(func.count(func.distinct(RespostaPesquisa.eleitor_id)))
        )
        eleitores_unicos = result.scalar_one()

        # Calcular tempo de execução
        tempo_execucao = 0.0
        if pesquisa.iniciado_em and pesquisa.concluido_em:
            tempo_execucao = (
                pesquisa.concluido_em - pesquisa.iniciado_em
            ).total_seconds()

        # Obter métricas atuais
        metricas = await self.db.execute(
            select(MetricasGlobais).where(MetricasGlobais.id == 1)
        )
        m = metricas.scalar_one()

        # Calcular novas médias
        nova_quantidade = m.total_pesquisas_concluidas + 1
        nova_media_respostas = (
            (m.media_respostas_por_pesquisa * m.total_pesquisas_concluidas)
            + pesquisa.total_respostas
        ) / nova_quantidade
        nova_media_custo = (
            (m.media_custo_por_pesquisa * m.total_pesquisas_concluidas)
            + pesquisa.custo_real
        ) / nova_quantidade
        nova_media_tempo = (
            (m.media_tempo_execucao_segundos * m.total_pesquisas_concluidas)
            + tempo_execucao
        ) / nova_quantidade

        # Atualizar
        await self.db.execute(
            update(MetricasGlobais)
            .where(MetricasGlobais.id == 1)
            .values(
                total_pesquisas_concluidas=nova_quantidade,
                total_respostas=MetricasGlobais.total_respostas + pesquisa.total_respostas,
                total_eleitores_unicos=eleitores_unicos,
                custo_total_reais=MetricasGlobais.custo_total_reais + pesquisa.custo_real,
                tokens_entrada_total=MetricasGlobais.tokens_entrada_total + pesquisa.tokens_entrada_total,
                tokens_saida_total=MetricasGlobais.tokens_saida_total + pesquisa.tokens_saida_total,
                media_respostas_por_pesquisa=nova_media_respostas,
                media_custo_por_pesquisa=nova_media_custo,
                media_tempo_execucao_segundos=nova_media_tempo,
            )
        )
        await self.db.commit()

    # ============================================
    # HISTÓRICO
    # ============================================

    async def obter_historico_eleitor(
        self, eleitor_id: str
    ) -> Dict[str, Any]:
        """
        Obtém histórico completo de um eleitor.

        Args:
            eleitor_id: ID do eleitor

        Returns:
            Dicionário com histórico de participações
        """
        # Buscar todas as respostas do eleitor
        result = await self.db.execute(
            select(RespostaPesquisa)
            .where(RespostaPesquisa.eleitor_id == eleitor_id)
            .order_by(RespostaPesquisa.criado_em)
        )
        respostas = list(result.scalars().all())

        if not respostas:
            return {
                "eleitor_id": eleitor_id,
                "total_participacoes": 0,
                "pesquisas": [],
            }

        # Agrupar por pesquisa
        pesquisas_map: Dict[str, List[RespostaPesquisa]] = {}
        for r in respostas:
            if r.pesquisa_id not in pesquisas_map:
                pesquisas_map[r.pesquisa_id] = []
            pesquisas_map[r.pesquisa_id].append(r)

        # Buscar dados das pesquisas
        pesquisa_ids = list(pesquisas_map.keys())
        result = await self.db.execute(
            select(Pesquisa).where(Pesquisa.id.in_(pesquisa_ids))
        )
        pesquisas = {p.id: p for p in result.scalars().all()}

        # Montar histórico
        historico_pesquisas = []
        for pesquisa_id, respostas_pesquisa in pesquisas_map.items():
            pesquisa = pesquisas.get(pesquisa_id)
            historico_pesquisas.append({
                "pesquisa_id": pesquisa_id,
                "titulo": pesquisa.titulo if pesquisa else "Pesquisa removida",
                "data": respostas_pesquisa[0].criado_em.isoformat(),
                "total_respostas": len(respostas_pesquisa),
                "respostas": [
                    {
                        "pergunta_id": r.pergunta_id,
                        "resposta_texto": r.resposta_texto[:200],
                        "sentimento": r.sentimento,
                    }
                    for r in respostas_pesquisa
                ],
            })

        return {
            "eleitor_id": eleitor_id,
            "eleitor_nome": respostas[0].eleitor_nome if respostas else None,
            "total_participacoes": len(pesquisas_map),
            "pesquisas": historico_pesquisas,
        }

    async def buscar_respostas_texto(
        self, texto: str, limite: int = 100
    ) -> List[RespostaPesquisa]:
        """
        Busca respostas por texto.

        Args:
            texto: Texto a buscar
            limite: Máximo de resultados

        Returns:
            Lista de respostas encontradas
        """
        result = await self.db.execute(
            select(RespostaPesquisa)
            .where(RespostaPesquisa.resposta_texto.ilike(f"%{texto}%"))
            .order_by(desc(RespostaPesquisa.criado_em))
            .limit(limite)
        )
        return list(result.scalars().all())
