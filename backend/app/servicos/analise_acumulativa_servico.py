"""
Serviço de Análise Acumulativa.

Análises agregadas de longo prazo para descobrir padrões,
tendências e insights em múltiplas pesquisas.
"""

import logging
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from typing import Any, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modelos import (
    Analise,
    Pesquisa,
    Resposta,
    StatusPesquisa,
)

logger = logging.getLogger(__name__)


class AnaliseAcumulativaServico:
    """
    Serviço para análises acumulativas de pesquisas.

    Fornece métodos para:
    - Correlações globais entre variáveis
    - Tendências temporais
    - Agrupamento por perfil de eleitor
    - Detecção de outliers
    - Insights cumulativos
    - Exportação de datasets
    """

    def __init__(self, sessao: AsyncSession):
        """
        Inicializa o serviço com uma sessão do banco.

        Args:
            sessao: Sessão assíncrona do SQLAlchemy
        """
        self.sessao = sessao

    # ==========================================
    # Correlações Globais
    # ==========================================

    async def calcular_correlacoes_globais(
        self,
        variaveis: Optional[list[str]] = None,
        pesquisa_ids: Optional[list[int]] = None,
    ) -> dict[str, Any]:
        """
        Calcula correlações entre variáveis em todas as pesquisas.

        Args:
            variaveis: Lista de variáveis para correlacionar
            pesquisa_ids: Filtrar por pesquisas específicas

        Returns:
            Dicionário com matriz de correlações e correlações significativas
        """
        # Obter respostas
        query = select(Resposta)
        if pesquisa_ids:
            query = query.where(Resposta.pesquisa_id.in_(pesquisa_ids))

        result = await self.sessao.execute(query)
        respostas = result.scalars().all()

        if not respostas:
            return {"matriz": [], "variaveis": [], "significativas": []}

        # Agrupar por eleitor
        por_eleitor: dict[str, list[Resposta]] = defaultdict(list)
        for r in respostas:
            por_eleitor[r.eleitor_id].append(r)

        # Extrair características do fluxo cognitivo
        dados_eleitores = []
        for eleitor_id, resps in por_eleitor.items():
            features = self._extrair_features_eleitor(resps)
            if features:
                dados_eleitores.append(features)

        if len(dados_eleitores) < 3:
            return {"matriz": [], "variaveis": [], "significativas": []}

        # Variáveis disponíveis
        todas_variaveis = [
            "intensidade_media",
            "mudanca_voto",
            "sentimento_positivo",
            "sentimento_negativo",
            "tokens_media",
            "tempo_resposta_media",
        ]
        variaveis_usar = variaveis or todas_variaveis

        # Calcular correlações (simplificado)
        correlacoes = self._calcular_matriz_correlacao(dados_eleitores, variaveis_usar)

        # Identificar correlações significativas (|r| > 0.3)
        significativas = []
        for i, v1 in enumerate(variaveis_usar):
            for j, v2 in enumerate(variaveis_usar):
                if i < j:
                    coef = correlacoes[i][j]
                    if abs(coef) > 0.3:
                        significativas.append({
                            "variavel_1": v1,
                            "variavel_2": v2,
                            "coeficiente": round(coef, 3),
                            "forca": "forte" if abs(coef) > 0.7 else "moderada",
                        })

        return {
            "matriz": correlacoes,
            "variaveis": variaveis_usar,
            "significativas": sorted(
                significativas,
                key=lambda x: abs(x["coeficiente"]),
                reverse=True,
            ),
        }

    # ==========================================
    # Tendências Temporais
    # ==========================================

    async def identificar_tendencias_temporais(
        self,
        periodo_dias: int = 30,
        metricas: Optional[list[str]] = None,
    ) -> dict[str, Any]:
        """
        Identifica tendências ao longo do tempo.

        Args:
            periodo_dias: Período para análise
            metricas: Métricas a analisar

        Returns:
            Tendências por período
        """
        data_inicio = datetime.now() - timedelta(days=periodo_dias)

        # Pesquisas no período
        query_pesquisas = (
            select(Pesquisa)
            .where(Pesquisa.criado_em >= data_inicio)
            .where(Pesquisa.status == StatusPesquisa.concluida)
            .order_by(Pesquisa.criado_em)
        )
        result = await self.sessao.execute(query_pesquisas)
        pesquisas = result.scalars().all()

        if not pesquisas:
            return {"periodos": [], "tendencias": {}}

        # Agrupar por semana
        por_semana: dict[str, list[Pesquisa]] = defaultdict(list)
        for p in pesquisas:
            semana = p.criado_em.strftime("%Y-W%W")
            por_semana[semana].append(p)

        # Calcular métricas por semana
        metricas_usar = metricas or [
            "total_pesquisas",
            "total_respostas",
            "custo_medio",
            "tempo_medio_execucao",
        ]

        periodos = []
        for semana in sorted(por_semana.keys()):
            pesqs = por_semana[semana]
            periodo_data = {
                "periodo": semana,
                "total_pesquisas": len(pesqs),
                "total_respostas": sum(p.eleitores_processados for p in pesqs),
                "custo_total": sum(p.custo_total for p in pesqs),
                "custo_medio": sum(p.custo_total for p in pesqs) / len(pesqs) if pesqs else 0,
                "tokens_total": sum(p.tokens_total for p in pesqs),
            }
            periodos.append(periodo_data)

        # Calcular tendências (variação percentual)
        tendencias = {}
        if len(periodos) >= 2:
            primeiro = periodos[0]
            ultimo = periodos[-1]
            for metrica in ["total_pesquisas", "total_respostas", "custo_medio"]:
                valor_inicial = primeiro.get(metrica, 0) or 1
                valor_final = ultimo.get(metrica, 0)
                variacao = ((valor_final - valor_inicial) / valor_inicial) * 100
                tendencias[metrica] = {
                    "valor_inicial": valor_inicial,
                    "valor_final": valor_final,
                    "variacao_percentual": round(variacao, 2),
                    "direcao": "alta" if variacao > 0 else "baixa" if variacao < 0 else "estavel",
                }

        return {
            "periodos": periodos,
            "tendencias": tendencias,
            "periodo_analise": f"Últimos {periodo_dias} dias",
        }

    # ==========================================
    # Agrupamento por Perfil
    # ==========================================

    async def agrupar_por_perfil_eleitor(
        self,
        campo_agrupamento: str = "cluster_socioeconomico",
        pesquisa_ids: Optional[list[int]] = None,
    ) -> dict[str, Any]:
        """
        Agrupa comportamento por perfil de eleitor.

        Args:
            campo_agrupamento: Campo do metadados para agrupar
            pesquisa_ids: Filtrar por pesquisas

        Returns:
            Métricas por grupo
        """
        query = select(Resposta)
        if pesquisa_ids:
            query = query.where(Resposta.pesquisa_id.in_(pesquisa_ids))

        result = await self.sessao.execute(query)
        respostas = result.scalars().all()

        # Agrupar por campo do metadados
        grupos: dict[str, list[Resposta]] = defaultdict(list)
        for r in respostas:
            grupo = "Não informado"
            if r.metadados and campo_agrupamento in r.metadados:
                grupo = r.metadados[campo_agrupamento]
            grupos[grupo].append(r)

        # Calcular métricas por grupo
        resultado = {}
        for grupo, resps in grupos.items():
            sentimentos = self._contabilizar_sentimentos(resps)
            resultado[grupo] = {
                "total_respostas": len(resps),
                "eleitores_unicos": len(set(r.eleitor_id for r in resps)),
                "sentimentos": sentimentos,
                "intensidade_media": self._media_intensidade(resps),
                "taxa_mudanca_voto": self._taxa_mudanca_voto(resps),
                "tokens_media": sum(r.tokens_entrada + r.tokens_saida for r in resps) / len(resps) if resps else 0,
            }

        return {
            "campo_agrupamento": campo_agrupamento,
            "grupos": resultado,
            "total_grupos": len(resultado),
        }

    # ==========================================
    # Detecção de Outliers
    # ==========================================

    async def detectar_outliers(
        self,
        pesquisa_id: Optional[int] = None,
        limite_desvios: float = 2.0,
    ) -> dict[str, Any]:
        """
        Detecta respostas atípicas.

        Args:
            pesquisa_id: Filtrar por pesquisa
            limite_desvios: Número de desvios padrão para considerar outlier

        Returns:
            Lista de outliers detectados
        """
        query = select(Resposta)
        if pesquisa_id:
            query = query.where(Resposta.pesquisa_id == pesquisa_id)

        result = await self.sessao.execute(query)
        respostas = result.scalars().all()

        if len(respostas) < 10:
            return {"outliers": [], "mensagem": "Dados insuficientes para análise"}

        # Calcular estatísticas de tempo de resposta
        tempos = [r.tempo_resposta_ms for r in respostas if r.tempo_resposta_ms > 0]
        if not tempos:
            return {"outliers": [], "mensagem": "Sem dados de tempo de resposta"}

        media_tempo = sum(tempos) / len(tempos)
        variancia = sum((t - media_tempo) ** 2 for t in tempos) / len(tempos)
        desvio_padrao = variancia ** 0.5

        # Identificar outliers
        outliers = []
        for r in respostas:
            motivos = []

            # Tempo de resposta muito alto ou baixo
            if r.tempo_resposta_ms > 0:
                z_score = (r.tempo_resposta_ms - media_tempo) / desvio_padrao if desvio_padrao > 0 else 0
                if abs(z_score) > limite_desvios:
                    motivos.append(f"Tempo de resposta atípico (z={z_score:.2f})")

            # Resposta muito curta
            if len(r.resposta_texto) < 10:
                motivos.append("Resposta muito curta")

            # Resposta muito longa
            if len(r.resposta_texto) > 5000:
                motivos.append("Resposta muito longa")

            if motivos:
                outliers.append({
                    "resposta_id": r.id,
                    "pesquisa_id": r.pesquisa_id,
                    "eleitor_id": r.eleitor_id,
                    "motivos": motivos,
                    "tempo_resposta_ms": r.tempo_resposta_ms,
                    "tamanho_resposta": len(r.resposta_texto),
                })

        return {
            "outliers": outliers[:50],  # Limitar a 50
            "total_outliers": len(outliers),
            "estatisticas": {
                "media_tempo_ms": round(media_tempo, 2),
                "desvio_padrao_ms": round(desvio_padrao, 2),
                "limite_usado": limite_desvios,
            },
        }

    # ==========================================
    # Insights Cumulativos
    # ==========================================

    async def gerar_insights_cumulativos(
        self,
        limite_insights: int = 10,
    ) -> dict[str, Any]:
        """
        Gera insights de longo prazo baseados em todas as pesquisas.

        Args:
            limite_insights: Máximo de insights a retornar

        Returns:
            Lista de insights descobertos
        """
        insights = []

        # 1. Análise de volume
        query_pesquisas = select(func.count(Pesquisa.id))
        result = await self.sessao.execute(query_pesquisas)
        total_pesquisas = result.scalar() or 0

        if total_pesquisas > 0:
            insights.append({
                "tipo": "volume",
                "titulo": "Base de dados estabelecida",
                "descricao": f"Sistema conta com {total_pesquisas} pesquisa(s) realizadas",
                "relevancia": "informativo",
                "dados": {"total_pesquisas": total_pesquisas},
            })

        # 2. Análise de sentimentos globais
        query_respostas = select(Resposta)
        result = await self.sessao.execute(query_respostas)
        respostas = result.scalars().all()

        if respostas:
            sentimentos = self._contabilizar_sentimentos(respostas)
            predominante = max(sentimentos, key=sentimentos.get) if sentimentos else None
            if predominante:
                insights.append({
                    "tipo": "sentimento",
                    "titulo": f"Sentimento predominante: {predominante}",
                    "descricao": f"Nas pesquisas realizadas, o sentimento mais frequente é '{predominante}' ({sentimentos[predominante]} ocorrências)",
                    "relevancia": "importante",
                    "dados": sentimentos,
                })

        # 3. Taxa de mudança de voto
        if respostas:
            taxa = self._taxa_mudanca_voto(respostas)
            if taxa > 0:
                insights.append({
                    "tipo": "comportamento",
                    "titulo": f"Taxa de persuasão: {taxa:.1%}",
                    "descricao": f"Aproximadamente {taxa:.1%} das respostas indicam potencial mudança de intenção de voto",
                    "relevancia": "critico" if taxa > 0.2 else "importante",
                    "dados": {"taxa_mudanca_voto": taxa},
                })

        # 4. Custo por resposta
        query_metricas = select(
            func.sum(Pesquisa.custo_total),
            func.sum(Pesquisa.eleitores_processados),
        ).where(Pesquisa.status == StatusPesquisa.concluida)
        result = await self.sessao.execute(query_metricas)
        row = result.one()
        custo_total = float(row[0] or 0)
        total_eleitores = int(row[1] or 0)

        if total_eleitores > 0:
            custo_por_eleitor = custo_total / total_eleitores
            insights.append({
                "tipo": "custo",
                "titulo": f"Custo médio por eleitor: R$ {custo_por_eleitor:.2f}",
                "descricao": f"Investimento total de R$ {custo_total:.2f} para {total_eleitores} eleitores processados",
                "relevancia": "informativo",
                "dados": {
                    "custo_total": custo_total,
                    "total_eleitores": total_eleitores,
                    "custo_por_eleitor": custo_por_eleitor,
                },
            })

        return {
            "insights": insights[:limite_insights],
            "total_insights": len(insights),
            "gerado_em": datetime.now().isoformat(),
        }

    # ==========================================
    # Exportação de Dataset
    # ==========================================

    async def exportar_dataset_completo(
        self,
        formato: str = "dict",
        pesquisa_ids: Optional[list[int]] = None,
    ) -> dict[str, Any]:
        """
        Exporta dataset completo para análise externa.

        Args:
            formato: Formato de saída ("dict", "csv", "json")
            pesquisa_ids: Filtrar por pesquisas

        Returns:
            Dataset com todas as respostas e metadados
        """
        # Buscar pesquisas
        query_pesquisas = select(Pesquisa)
        if pesquisa_ids:
            query_pesquisas = query_pesquisas.where(Pesquisa.id.in_(pesquisa_ids))
        result = await self.sessao.execute(query_pesquisas)
        pesquisas = result.scalars().all()

        # Buscar respostas
        query_respostas = select(Resposta)
        if pesquisa_ids:
            query_respostas = query_respostas.where(Resposta.pesquisa_id.in_(pesquisa_ids))
        result = await self.sessao.execute(query_respostas)
        respostas = result.scalars().all()

        # Montar dataset
        dataset = {
            "pesquisas": [
                {
                    "id": p.id,
                    "titulo": p.titulo,
                    "tipo": p.tipo.value,
                    "status": p.status.value,
                    "criado_em": p.criado_em.isoformat() if p.criado_em else None,
                    "finalizado_em": p.finalizado_em.isoformat() if p.finalizado_em else None,
                    "total_eleitores": p.total_eleitores,
                    "custo_total": p.custo_total,
                    "tokens_total": p.tokens_total,
                }
                for p in pesquisas
            ],
            "respostas": [
                {
                    "id": r.id,
                    "pesquisa_id": r.pesquisa_id,
                    "pergunta_id": r.pergunta_id,
                    "eleitor_id": r.eleitor_id,
                    "resposta_texto": r.resposta_texto,
                    "resposta_valor": r.resposta_valor,
                    "sentimento": r.sentimento_dominante,
                    "intensidade": r.intensidade_emocional,
                    "mudaria_voto": r.mudaria_voto,
                    "tokens_entrada": r.tokens_entrada,
                    "tokens_saida": r.tokens_saida,
                    "custo": r.custo,
                    "tempo_resposta_ms": r.tempo_resposta_ms,
                    "criado_em": r.criado_em.isoformat() if r.criado_em else None,
                }
                for r in respostas
            ],
            "metadados": {
                "total_pesquisas": len(pesquisas),
                "total_respostas": len(respostas),
                "exportado_em": datetime.now().isoformat(),
                "formato": formato,
            },
        }

        return dataset

    # ==========================================
    # Histórico de Eleitor
    # ==========================================

    async def obter_historico_eleitor(
        self,
        eleitor_id: str,
    ) -> dict[str, Any]:
        """
        Obtém histórico completo de participação de um eleitor.

        Args:
            eleitor_id: ID do eleitor

        Returns:
            Histórico de participações e respostas
        """
        query = (
            select(Resposta)
            .where(Resposta.eleitor_id == eleitor_id)
            .order_by(Resposta.criado_em)
        )
        result = await self.sessao.execute(query)
        respostas = result.scalars().all()

        if not respostas:
            return {"eleitor_id": eleitor_id, "participacoes": []}

        # Agrupar por pesquisa
        por_pesquisa: dict[int, list[Resposta]] = defaultdict(list)
        for r in respostas:
            por_pesquisa[r.pesquisa_id].append(r)

        participacoes = []
        for pesquisa_id, resps in por_pesquisa.items():
            participacoes.append({
                "pesquisa_id": pesquisa_id,
                "total_respostas": len(resps),
                "primeira_resposta": min(r.criado_em for r in resps).isoformat() if resps else None,
                "ultima_resposta": max(r.criado_em for r in resps).isoformat() if resps else None,
                "sentimentos": self._contabilizar_sentimentos(resps),
                "custo_total": sum(r.custo for r in resps),
            })

        return {
            "eleitor_id": eleitor_id,
            "total_participacoes": len(participacoes),
            "total_respostas": len(respostas),
            "participacoes": participacoes,
        }

    # ==========================================
    # Métodos Auxiliares Privados
    # ==========================================

    def _extrair_features_eleitor(self, respostas: list[Resposta]) -> Optional[dict]:
        """Extrai features numéricas de respostas de um eleitor."""
        if not respostas:
            return None

        intensidades = []
        mudancas = 0
        sentimentos_pos = 0
        sentimentos_neg = 0
        tokens = []
        tempos = []

        for r in respostas:
            if r.fluxo_cognitivo and "emocional" in r.fluxo_cognitivo:
                emocional = r.fluxo_cognitivo["emocional"]
                if "intensidade" in emocional:
                    intensidades.append(emocional["intensidade"])
                sentimento = emocional.get("sentimento_dominante", "")
                if sentimento in ("esperanca", "seguranca"):
                    sentimentos_pos += 1
                elif sentimento in ("raiva", "ameaca"):
                    sentimentos_neg += 1

            if r.fluxo_cognitivo and "decisao" in r.fluxo_cognitivo:
                if r.fluxo_cognitivo["decisao"].get("muda_intencao_voto"):
                    mudancas += 1

            tokens.append(r.tokens_entrada + r.tokens_saida)
            if r.tempo_resposta_ms > 0:
                tempos.append(r.tempo_resposta_ms)

        total = len(respostas)
        return {
            "intensidade_media": sum(intensidades) / len(intensidades) if intensidades else 5,
            "mudanca_voto": mudancas / total if total > 0 else 0,
            "sentimento_positivo": sentimentos_pos / total if total > 0 else 0,
            "sentimento_negativo": sentimentos_neg / total if total > 0 else 0,
            "tokens_media": sum(tokens) / len(tokens) if tokens else 0,
            "tempo_resposta_media": sum(tempos) / len(tempos) if tempos else 0,
        }

    def _calcular_matriz_correlacao(
        self,
        dados: list[dict],
        variaveis: list[str],
    ) -> list[list[float]]:
        """Calcula matriz de correlação simplificada."""
        n = len(variaveis)
        matriz = [[1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]

        for i, v1 in enumerate(variaveis):
            for j, v2 in enumerate(variaveis):
                if i < j:
                    valores1 = [d.get(v1, 0) for d in dados]
                    valores2 = [d.get(v2, 0) for d in dados]
                    corr = self._correlacao_pearson(valores1, valores2)
                    matriz[i][j] = corr
                    matriz[j][i] = corr

        return matriz

    def _correlacao_pearson(self, x: list[float], y: list[float]) -> float:
        """Calcula correlação de Pearson simplificada."""
        n = len(x)
        if n < 3:
            return 0.0

        media_x = sum(x) / n
        media_y = sum(y) / n

        numerador = sum((x[i] - media_x) * (y[i] - media_y) for i in range(n))
        denom_x = sum((x[i] - media_x) ** 2 for i in range(n)) ** 0.5
        denom_y = sum((y[i] - media_y) ** 2 for i in range(n)) ** 0.5

        if denom_x == 0 or denom_y == 0:
            return 0.0

        return numerador / (denom_x * denom_y)

    def _contabilizar_sentimentos(self, respostas: list[Resposta]) -> dict[str, int]:
        """Contabiliza sentimentos das respostas."""
        sentimentos: Counter = Counter()
        for r in respostas:
            sentimento = r.sentimento_dominante
            if sentimento:
                sentimentos[sentimento] += 1
        return dict(sentimentos)

    def _media_intensidade(self, respostas: list[Resposta]) -> float:
        """Calcula média de intensidade emocional."""
        intensidades = []
        for r in respostas:
            intensidade = r.intensidade_emocional
            if intensidade is not None:
                intensidades.append(intensidade)
        return sum(intensidades) / len(intensidades) if intensidades else 5.0

    def _taxa_mudanca_voto(self, respostas: list[Resposta]) -> float:
        """Calcula taxa de mudança de voto."""
        mudancas = sum(1 for r in respostas if r.mudaria_voto is True)
        return mudancas / len(respostas) if respostas else 0.0


# Factory para criar instância do serviço
def obter_servico_analise_acumulativa(sessao: AsyncSession) -> AnaliseAcumulativaServico:
    """
    Obtém uma instância do serviço de análise acumulativa.

    Args:
        sessao: Sessão do banco de dados

    Returns:
        Instância do serviço
    """
    return AnaliseAcumulativaServico(sessao)
