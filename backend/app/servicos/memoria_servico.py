"""
Serviço de Memórias - Persistência Automática de Entrevistas.

Responsável por:
- Salvar cada resposta de entrevista no banco de dados
- Atualizar estatísticas de uso da API
- Fornecer histórico completo por eleitor
- Garantir que nenhum dado seja perdido
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import and_, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modelos.memoria import Memoria, TipoMemoria, UsoAPI


class MemoriaServico:
    """Serviço para persistência de memórias de entrevistas."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ============================================
    # CRIAÇÃO DE MEMÓRIAS
    # ============================================

    async def salvar_resposta_entrevista(
        self,
        pesquisa_id: Optional[int],
        pergunta_id: Optional[int],
        resposta_id: Optional[int],
        eleitor_id: str,
        eleitor_nome: Optional[str],
        pergunta_texto: Optional[str],
        resposta_texto: str,
        resposta_valor: Optional[Any],
        fluxo_cognitivo: Optional[Dict[str, Any]],
        modelo_usado: str,
        tokens_entrada: int,
        tokens_saida: int,
        custo: float,
        tempo_resposta_ms: int,
        usuario_id: Optional[int] = None,
        usuario_nome: Optional[str] = None,
        contexto: Optional[Dict[str, Any]] = None,
        metadados: Optional[Dict[str, Any]] = None,
    ) -> Memoria:
        """
        Salva uma resposta de entrevista como memória permanente.

        Esta função DEVE ser chamada após cada resposta processada
        para garantir que nenhum dado seja perdido.

        Args:
            pesquisa_id: ID da pesquisa no banco
            pergunta_id: ID da pergunta no banco
            resposta_id: ID da resposta no banco (se salva lá também)
            eleitor_id: ID do eleitor (ex: "df-0001")
            eleitor_nome: Nome do eleitor
            pergunta_texto: Texto da pergunta
            resposta_texto: Resposta em texto
            resposta_valor: Valor estruturado (para escalas, etc.)
            fluxo_cognitivo: Chain of Thought completo
            modelo_usado: Ex: "claude-sonnet-4-5-20250929"
            tokens_entrada: Tokens de entrada usados
            tokens_saida: Tokens de saída gerados
            custo: Custo em reais
            tempo_resposta_ms: Tempo de resposta em milissegundos
            usuario_id: ID do usuário que executou
            usuario_nome: Nome do usuário
            contexto: Contexto adicional (perfil usado, etc.)
            metadados: Metadados extras

        Returns:
            Memória criada
        """
        memoria = Memoria(
            tipo=TipoMemoria.entrevista,
            pesquisa_id=pesquisa_id,
            pergunta_id=pergunta_id,
            resposta_id=resposta_id,
            eleitor_id=eleitor_id,
            eleitor_nome=eleitor_nome,
            usuario_id=usuario_id,
            usuario_nome=usuario_nome,
            pergunta_texto=pergunta_texto,
            resposta_texto=resposta_texto,
            resposta_valor=resposta_valor,
            fluxo_cognitivo=fluxo_cognitivo,
            modelo_usado=modelo_usado,
            tokens_entrada=tokens_entrada,
            tokens_saida=tokens_saida,
            tokens_total=tokens_entrada + tokens_saida,
            custo=custo,
            tempo_resposta_ms=tempo_resposta_ms,
            contexto=contexto,
            metadados=metadados,
        )

        self.db.add(memoria)
        await self.db.commit()
        await self.db.refresh(memoria)

        # Atualizar estatísticas de uso
        await self._atualizar_uso_api(memoria)

        return memoria

    async def salvar_batch_respostas(
        self,
        respostas: List[Dict[str, Any]],
        pesquisa_id: Optional[int] = None,
        usuario_id: Optional[int] = None,
        usuario_nome: Optional[str] = None,
    ) -> int:
        """
        Salva um batch de respostas de uma vez.

        Mais eficiente para salvar múltiplas respostas.

        Args:
            respostas: Lista de dicts com dados das respostas
            pesquisa_id: ID da pesquisa (se aplicável)
            usuario_id: ID do usuário
            usuario_nome: Nome do usuário

        Returns:
            Número de memórias criadas
        """
        memorias = []
        for r in respostas:
            memoria = Memoria(
                tipo=TipoMemoria.entrevista,
                pesquisa_id=pesquisa_id,
                pergunta_id=r.get("pergunta_id"),
                resposta_id=r.get("resposta_id"),
                eleitor_id=r["eleitor_id"],
                eleitor_nome=r.get("eleitor_nome"),
                usuario_id=usuario_id,
                usuario_nome=usuario_nome,
                pergunta_texto=r.get("pergunta_texto"),
                resposta_texto=r["resposta_texto"],
                resposta_valor=r.get("resposta_valor"),
                fluxo_cognitivo=r.get("fluxo_cognitivo"),
                modelo_usado=r.get("modelo_usado", "claude-sonnet-4-5-20250929"),
                tokens_entrada=r.get("tokens_entrada", 0),
                tokens_saida=r.get("tokens_saida", 0),
                tokens_total=r.get("tokens_entrada", 0) + r.get("tokens_saida", 0),
                custo=r.get("custo", 0.0),
                tempo_resposta_ms=r.get("tempo_resposta_ms", 0),
                contexto=r.get("contexto"),
                metadados=r.get("metadados"),
            )
            memorias.append(memoria)

        self.db.add_all(memorias)
        await self.db.commit()

        # Atualizar estatísticas de uso para cada memória
        for memoria in memorias:
            await self._atualizar_uso_api(memoria)

        return len(memorias)

    # ============================================
    # CONSULTAS
    # ============================================

    async def obter_historico_eleitor(
        self,
        eleitor_id: str,
        limite: int = 100,
    ) -> Dict[str, Any]:
        """
        Obtém histórico completo de um eleitor.

        Args:
            eleitor_id: ID do eleitor
            limite: Número máximo de memórias a retornar

        Returns:
            Dict com histórico completo
        """
        query = (
            select(Memoria)
            .where(Memoria.eleitor_id == eleitor_id)
            .order_by(Memoria.criado_em.desc())
            .limit(limite)
        )
        result = await self.db.execute(query)
        memorias = result.scalars().all()

        if not memorias:
            return {
                "eleitor_id": eleitor_id,
                "total_entrevistas": 0,
                "total_respostas": 0,
                "tokens_total": 0,
                "custo_total": 0.0,
                "memorias": [],
            }

        tokens_total = sum(m.tokens_total for m in memorias)
        custo_total = sum(m.custo for m in memorias)
        pesquisas = list(set(m.pesquisa_id for m in memorias if m.pesquisa_id))

        # Extrair sentimentos
        sentimentos: Dict[str, int] = {}
        for m in memorias:
            sentimento = m.sentimento_dominante
            if sentimento:
                sentimentos[sentimento] = sentimentos.get(sentimento, 0) + 1

        return {
            "eleitor_id": eleitor_id,
            "eleitor_nome": memorias[0].eleitor_nome if memorias else None,
            "total_entrevistas": len(pesquisas),
            "total_respostas": len(memorias),
            "pesquisas_participadas": pesquisas,
            "tokens_total": tokens_total,
            "custo_total": custo_total,
            "primeira_entrevista": min(m.criado_em for m in memorias),
            "ultima_entrevista": max(m.criado_em for m in memorias),
            "sentimentos_frequentes": sentimentos,
            "memorias": [
                {
                    "id": m.id,
                    "pesquisa_id": m.pesquisa_id,
                    "pergunta_texto": m.pergunta_texto,
                    "resposta_texto": m.resposta_texto[:200] if m.resposta_texto else "",
                    "modelo_usado": m.modelo_usado,
                    "tokens_total": m.tokens_total,
                    "custo": m.custo,
                    "criado_em": m.criado_em.isoformat(),
                }
                for m in memorias
            ],
        }

    async def obter_analytics_globais(
        self,
        dias: int = 30,
    ) -> Dict[str, Any]:
        """
        Obtém analytics globais do sistema.

        Args:
            dias: Número de dias para análise

        Returns:
            Dict com analytics completos
        """
        data_inicio = datetime.now() - timedelta(days=dias)

        # Totais gerais
        total_query = select(func.count(Memoria.id))
        total_result = await self.db.execute(total_query)
        total_memorias = total_result.scalar() or 0

        # Totais do período
        periodo_query = select(
            func.count(Memoria.id).label("total"),
            func.count(distinct(Memoria.eleitor_id)).label("eleitores_unicos"),
            func.count(distinct(Memoria.pesquisa_id)).label("pesquisas"),
            func.sum(Memoria.tokens_entrada).label("tokens_entrada"),
            func.sum(Memoria.tokens_saida).label("tokens_saida"),
            func.sum(Memoria.tokens_total).label("tokens_total"),
            func.sum(Memoria.custo).label("custo_total"),
            func.avg(Memoria.tempo_resposta_ms).label("tempo_medio"),
        ).where(Memoria.criado_em >= data_inicio)

        periodo_result = await self.db.execute(periodo_query)
        stats = periodo_result.first()

        # Distribuição por modelo
        modelo_query = (
            select(
                Memoria.modelo_usado,
                func.count(Memoria.id).label("total"),
                func.sum(Memoria.custo).label("custo"),
                func.sum(Memoria.tokens_total).label("tokens"),
            )
            .where(Memoria.criado_em >= data_inicio)
            .group_by(Memoria.modelo_usado)
        )
        modelo_result = await self.db.execute(modelo_query)
        modelos = modelo_result.all()

        # Calcular totais
        total_respostas = stats.total or 0
        eleitores_unicos = stats.eleitores_unicos or 0
        custo_total = float(stats.custo_total or 0)

        return {
            "total_memorias": total_memorias,
            "periodo_dias": dias,
            "total_pesquisas": stats.pesquisas or 0,
            "total_eleitores_unicos": eleitores_unicos,
            "total_respostas": total_respostas,
            "tokens_entrada_acumulados": int(stats.tokens_entrada or 0),
            "tokens_saida_acumulados": int(stats.tokens_saida or 0),
            "tokens_acumulados": int(stats.tokens_total or 0),
            "custo_acumulado": custo_total,
            "custo_medio_por_resposta": custo_total / total_respostas if total_respostas > 0 else 0,
            "custo_medio_por_eleitor": custo_total / eleitores_unicos if eleitores_unicos > 0 else 0,
            "distribuicao_modelos": {m.modelo_usado: m.total for m in modelos},
            "custo_por_modelo": {m.modelo_usado: float(m.custo or 0) for m in modelos},
            "tokens_por_modelo": {m.modelo_usado: int(m.tokens or 0) for m in modelos},
            "tempo_resposta_medio_ms": int(stats.tempo_medio or 0),
        }

    async def obter_analytics_pesquisa(
        self,
        pesquisa_id: int,
    ) -> Dict[str, Any]:
        """
        Obtém analytics de uma pesquisa específica.

        Args:
            pesquisa_id: ID da pesquisa

        Returns:
            Dict com analytics da pesquisa
        """
        query = select(
            func.count(Memoria.id).label("total_respostas"),
            func.count(distinct(Memoria.eleitor_id)).label("eleitores_unicos"),
            func.sum(Memoria.tokens_entrada).label("tokens_entrada"),
            func.sum(Memoria.tokens_saida).label("tokens_saida"),
            func.sum(Memoria.tokens_total).label("tokens_total"),
            func.sum(Memoria.custo).label("custo_total"),
            func.avg(Memoria.tempo_resposta_ms).label("tempo_medio"),
            func.min(Memoria.criado_em).label("inicio"),
            func.max(Memoria.criado_em).label("fim"),
        ).where(Memoria.pesquisa_id == pesquisa_id)

        result = await self.db.execute(query)
        stats = result.first()

        if not stats or not stats.total_respostas:
            return {"pesquisa_id": pesquisa_id, "erro": "Nenhuma memória encontrada"}

        # Por modelo
        modelo_query = (
            select(
                Memoria.modelo_usado,
                func.count(Memoria.id).label("total"),
                func.sum(Memoria.custo).label("custo"),
            )
            .where(Memoria.pesquisa_id == pesquisa_id)
            .group_by(Memoria.modelo_usado)
        )
        modelo_result = await self.db.execute(modelo_query)
        modelos = {
            m.modelo_usado: {"total": m.total, "custo": float(m.custo or 0)}
            for m in modelo_result.all()
        }

        return {
            "pesquisa_id": pesquisa_id,
            "total_respostas": stats.total_respostas,
            "eleitores_unicos": stats.eleitores_unicos,
            "tokens_entrada": int(stats.tokens_entrada or 0),
            "tokens_saida": int(stats.tokens_saida or 0),
            "tokens_total": int(stats.tokens_total or 0),
            "custo_total": float(stats.custo_total or 0),
            "tempo_resposta_medio_ms": int(stats.tempo_medio or 0),
            "inicio": stats.inicio.isoformat() if stats.inicio else None,
            "fim": stats.fim.isoformat() if stats.fim else None,
            "modelos": modelos,
        }

    # ============================================
    # ATUALIZAÇÃO DE USO DA API
    # ============================================

    async def _atualizar_uso_api(self, memoria: Memoria) -> None:
        """
        Atualiza estatísticas de uso da API após criar memória.

        Args:
            memoria: Memória recém-criada
        """
        hoje = datetime.now().strftime("%Y-%m-%d")

        # Buscar ou criar registro de uso
        query = select(UsoAPI).where(
            and_(
                UsoAPI.periodo == hoje,
                UsoAPI.tipo_periodo == "dia",
                UsoAPI.usuario_id == memoria.usuario_id,
            )
        )
        result = await self.db.execute(query)
        uso = result.scalar_one_or_none()

        if not uso:
            uso = UsoAPI(
                periodo=hoje,
                tipo_periodo="dia",
                usuario_id=memoria.usuario_id,
            )
            self.db.add(uso)

        # Atualizar contadores
        uso.total_chamadas += 1
        uso.tokens_entrada_total += memoria.tokens_entrada
        uso.tokens_saida_total += memoria.tokens_saida
        uso.tokens_total += memoria.tokens_total
        uso.custo_total += memoria.custo

        # Por modelo
        if "opus" in memoria.modelo_usado.lower():
            uso.chamadas_opus += 1
            uso.tokens_opus += memoria.tokens_total
            uso.custo_opus += memoria.custo
        else:
            uso.chamadas_sonnet += 1
            uso.tokens_sonnet += memoria.tokens_total
            uso.custo_sonnet += memoria.custo

        # Atualizar tempo médio
        if uso.tempo_resposta_medio_ms == 0:
            uso.tempo_resposta_medio_ms = memoria.tempo_resposta_ms
        else:
            uso.tempo_resposta_medio_ms = (
                uso.tempo_resposta_medio_ms + memoria.tempo_resposta_ms
            ) // 2

        await self.db.commit()


# ============================================
# FUNÇÃO AUXILIAR PARA CRIAR SERVIÇO
# ============================================


def criar_memoria_servico(db: AsyncSession) -> MemoriaServico:
    """
    Cria instância do serviço de memórias.

    Args:
        db: Sessão do banco de dados

    Returns:
        Instância do MemoriaServico
    """
    return MemoriaServico(db)
