"""
Serviço de Análise Acumulativa

Realiza análises de correlação, tendências temporais e descobertas
em dados acumulados de múltiplas pesquisas.
"""

import logging
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.modelos.pesquisa import (
    AnalisePesquisa,
    Pesquisa,
    RespostaPesquisa,
)
from app.esquemas.pesquisa import (
    CorrelacaoGlobal,
    InsightGlobal,
    SegmentoAnalise,
    TendenciaTemporal,
)

logger = logging.getLogger(__name__)


class AnaliseAcumulativaServico:
    """
    Serviço para análises avançadas de dados acumulados.

    Fornece métodos para:
    - Correlações globais entre variáveis
    - Tendências temporais
    - Agrupamento por perfil de eleitor
    - Detecção de outliers
    - Insights cumulativos
    - Exportação de datasets
    """

    def __init__(self, db: AsyncSession):
        """
        Inicializa o serviço com uma sessão do banco.

        Args:
            db: Sessão assíncrona do SQLAlchemy
        """
        self.db = db

    # ============================================
    # CORRELAÇÕES
    # ============================================

    async def calcular_correlacoes_globais(
        self,
        variaveis: Optional[List[str]] = None,
        pesquisa_ids: Optional[List[str]] = None,
    ) -> List[CorrelacaoGlobal]:
        """
        Calcula correlações entre variáveis de perfil e sentimentos.

        Args:
            variaveis: Lista de variáveis a correlacionar (opcional)
            pesquisa_ids: Filtrar por pesquisas específicas

        Returns:
            Lista de correlações encontradas
        """
        # Buscar todas as respostas com perfil
        query = select(RespostaPesquisa).where(
            RespostaPesquisa.eleitor_perfil.isnot(None),
            RespostaPesquisa.sentimento.isnot(None),
        )
        if pesquisa_ids:
            query = query.where(RespostaPesquisa.pesquisa_id.in_(pesquisa_ids))

        result = await self.db.execute(query)
        respostas = list(result.scalars().all())

        if len(respostas) < 10:
            return []

        # Variáveis padrão para análise
        if not variaveis:
            variaveis = [
                "cluster_socioeconomico",
                "orientacao_politica",
                "religiao",
                "escolaridade",
                "regiao_administrativa",
                "genero",
                "faixa_etaria",
            ]

        correlacoes = []

        # Mapear sentimentos para valores numéricos
        sentimento_map = {
            "positivo": 1,
            "neutro": 0,
            "negativo": -1,
            "misto": 0,
        }

        # Calcular correlações
        for var in variaveis:
            dados_var = []
            dados_sent = []

            for r in respostas:
                if r.eleitor_perfil and var in r.eleitor_perfil:
                    valor_var = r.eleitor_perfil.get(var)
                    valor_sent = sentimento_map.get(r.sentimento, 0)

                    if valor_var is not None:
                        dados_var.append(str(valor_var))
                        dados_sent.append(valor_sent)

            if len(dados_var) < 10:
                continue

            # Agrupar por categoria
            categorias = defaultdict(list)
            for v, s in zip(dados_var, dados_sent):
                categorias[v].append(s)

            # Calcular média de sentimento por categoria
            medias = {}
            for cat, sentimentos in categorias.items():
                if len(sentimentos) >= 3:
                    medias[cat] = sum(sentimentos) / len(sentimentos)

            if len(medias) < 2:
                continue

            # Calcular variância entre grupos (ANOVA simplificada)
            media_geral = sum(dados_sent) / len(dados_sent)
            variancia_entre = sum(
                len(categorias[c]) * (m - media_geral) ** 2
                for c, m in medias.items()
            ) / (len(medias) - 1)

            # Interpretar resultado
            if variancia_entre > 0.3:
                significancia = "alta"
                interpretacao = f"Forte relação entre {var} e sentimento nas respostas"
            elif variancia_entre > 0.1:
                significancia = "media"
                interpretacao = f"Relação moderada entre {var} e sentimento"
            else:
                significancia = "baixa"
                interpretacao = f"Relação fraca entre {var} e sentimento"

            # Encontrar categoria com maior/menor sentimento
            cat_max = max(medias.items(), key=lambda x: x[1])
            cat_min = min(medias.items(), key=lambda x: x[1])

            interpretacao += f". {cat_max[0]} mais positivo, {cat_min[0]} mais negativo."

            correlacoes.append(CorrelacaoGlobal(
                variavel_x=var,
                variavel_y="sentimento",
                coeficiente=round(variancia_entre, 4),
                p_valor=round(1.0 - variancia_entre, 4),  # Aproximação simplificada
                significancia=significancia,
                amostra=len(dados_var),
                interpretacao=interpretacao,
            ))

        # Ordenar por significância
        ordem = {"alta": 0, "media": 1, "baixa": 2}
        correlacoes.sort(key=lambda x: (ordem[x.significancia], -x.coeficiente))

        return correlacoes

    # ============================================
    # TENDÊNCIAS TEMPORAIS
    # ============================================

    async def calcular_tendencias_temporais(
        self, periodo: str = "mensal", meses: int = 12
    ) -> List[TendenciaTemporal]:
        """
        Calcula tendências ao longo do tempo.

        Args:
            periodo: "diario", "semanal" ou "mensal"
            meses: Quantidade de meses para analisar

        Returns:
            Lista de tendências por período
        """
        data_inicio = datetime.now() - timedelta(days=meses * 30)

        # Buscar pesquisas no período
        result = await self.db.execute(
            select(Pesquisa)
            .where(Pesquisa.criado_em >= data_inicio)
            .where(Pesquisa.status == "concluida")
            .order_by(Pesquisa.criado_em)
        )
        pesquisas = list(result.scalars().all())

        if not pesquisas:
            return []

        # Agrupar por período
        tendencias_map: Dict[str, Dict[str, Any]] = defaultdict(
            lambda: {
                "pesquisas": 0,
                "respostas": 0,
                "custo": 0.0,
                "sentimentos": [],
            }
        )

        for p in pesquisas:
            if periodo == "diario":
                chave = p.criado_em.strftime("%Y-%m-%d")
            elif periodo == "semanal":
                # Semana do ano
                chave = p.criado_em.strftime("%Y-W%W")
            else:  # mensal
                chave = p.criado_em.strftime("%Y-%m")

            tendencias_map[chave]["pesquisas"] += 1
            tendencias_map[chave]["respostas"] += p.total_respostas
            tendencias_map[chave]["custo"] += p.custo_real

        # Buscar sentimentos por período
        result = await self.db.execute(
            select(RespostaPesquisa.criado_em, RespostaPesquisa.sentimento)
            .where(RespostaPesquisa.criado_em >= data_inicio)
            .where(RespostaPesquisa.sentimento.isnot(None))
        )

        sentimento_map = {"positivo": 1, "neutro": 0, "negativo": -1}

        for row in result:
            data, sentimento = row
            if periodo == "diario":
                chave = data.strftime("%Y-%m-%d")
            elif periodo == "semanal":
                chave = data.strftime("%Y-W%W")
            else:
                chave = data.strftime("%Y-%m")

            if chave in tendencias_map:
                valor = sentimento_map.get(sentimento, 0)
                tendencias_map[chave]["sentimentos"].append(valor)

        # Converter para lista de tendências
        tendencias = []
        for periodo_str, dados in sorted(tendencias_map.items()):
            sentimento_medio = None
            if dados["sentimentos"]:
                sentimento_medio = round(
                    sum(dados["sentimentos"]) / len(dados["sentimentos"]), 3
                )

            tendencias.append(TendenciaTemporal(
                periodo=periodo_str,
                pesquisas_realizadas=dados["pesquisas"],
                respostas_coletadas=dados["respostas"],
                custo_total=round(dados["custo"], 2),
                sentimento_medio=sentimento_medio,
            ))

        return tendencias

    # ============================================
    # ANÁLISE POR SEGMENTO
    # ============================================

    async def analisar_segmento(
        self,
        tipo_segmento: str,
        pesquisa_ids: Optional[List[str]] = None,
    ) -> List[SegmentoAnalise]:
        """
        Analisa respostas agrupadas por segmento de eleitores.

        Args:
            tipo_segmento: cluster, regiao, orientacao, religiao, etc.
            pesquisa_ids: Filtrar por pesquisas específicas

        Returns:
            Lista de análises por valor do segmento
        """
        # Mapear nome do segmento para campo no perfil
        campo_mapa = {
            "cluster": "cluster_socioeconomico",
            "regiao": "regiao_administrativa",
            "orientacao": "orientacao_politica",
            "religiao": "religiao",
            "genero": "genero",
            "escolaridade": "escolaridade",
            "faixa_etaria": "faixa_etaria",
        }

        campo = campo_mapa.get(tipo_segmento, tipo_segmento)

        # Buscar respostas com perfil
        query = select(RespostaPesquisa).where(
            RespostaPesquisa.eleitor_perfil.isnot(None)
        )
        if pesquisa_ids:
            query = query.where(RespostaPesquisa.pesquisa_id.in_(pesquisa_ids))

        result = await self.db.execute(query)
        respostas = list(result.scalars().all())

        if not respostas:
            return []

        # Agrupar por valor do segmento
        segmentos: Dict[str, Dict[str, Any]] = defaultdict(
            lambda: {
                "participacoes": 0,
                "sentimentos": [],
                "textos": [],
            }
        )

        for r in respostas:
            if r.eleitor_perfil and campo in r.eleitor_perfil:
                valor = str(r.eleitor_perfil[campo])
                segmentos[valor]["participacoes"] += 1

                if r.sentimento:
                    segmentos[valor]["sentimentos"].append(r.sentimento)

                if r.resposta_texto:
                    segmentos[valor]["textos"].append(r.resposta_texto)

        # Converter para lista de análises
        analises = []
        for valor, dados in segmentos.items():
            # Sentimento predominante
            sentimento_predominante = None
            if dados["sentimentos"]:
                contagem = Counter(dados["sentimentos"])
                sentimento_predominante = contagem.most_common(1)[0][0]

            # Extrair temas (palavras frequentes)
            temas = self._extrair_temas(dados["textos"])

            # Citação exemplo (mais longa)
            citacao = None
            if dados["textos"]:
                textos_ordenados = sorted(dados["textos"], key=len, reverse=True)
                citacao = textos_ordenados[0][:300] if textos_ordenados else None

            analises.append(SegmentoAnalise(
                segmento=tipo_segmento,
                valor=valor,
                total_participacoes=dados["participacoes"],
                sentimento_predominante=sentimento_predominante,
                temas_recorrentes=temas[:5] if temas else None,
                citacao_exemplo=citacao,
            ))

        # Ordenar por participações
        analises.sort(key=lambda x: x.total_participacoes, reverse=True)
        return analises

    def _extrair_temas(self, textos: List[str], top_n: int = 10) -> List[str]:
        """Extrai palavras/temas mais frequentes dos textos."""
        # Stopwords em português
        stopwords = {
            "de", "a", "o", "que", "e", "do", "da", "em", "um", "para",
            "é", "com", "não", "uma", "os", "no", "se", "na", "por",
            "mais", "as", "dos", "como", "mas", "foi", "ao", "ele",
            "das", "tem", "à", "seu", "sua", "ou", "ser", "quando",
            "muito", "há", "nos", "já", "está", "eu", "também", "só",
            "pelo", "pela", "até", "isso", "ela", "entre", "era",
            "depois", "sem", "mesmo", "aos", "ter", "seus", "quem",
            "nas", "me", "esse", "eles", "estão", "você", "tinha",
            "foram", "essa", "num", "nem", "suas", "meu", "às",
            "minha", "têm", "numa", "pelos", "elas", "havia", "seja",
            "qual", "será", "nós", "tenho", "lhe", "deles", "essas",
            "esses", "pelas", "este", "fosse", "dele", "tu", "te",
            "vocês", "vos", "lhes", "meus", "minhas", "teu", "tua",
            "teus", "tuas", "nosso", "nossa", "nossos", "nossas",
            "dela", "delas", "esta", "estes", "estas", "aquele",
            "aquela", "aqueles", "aquelas", "isto", "aquilo", "estou",
            "está", "estamos", "estão", "estive", "esteve", "estivemos",
            "estiveram", "estava", "estávamos", "estavam",
        }

        # Contar palavras
        contador = Counter()
        for texto in textos:
            palavras = texto.lower().split()
            for palavra in palavras:
                # Limpar pontuação
                palavra = "".join(c for c in palavra if c.isalnum())
                if len(palavra) > 3 and palavra not in stopwords:
                    contador[palavra] += 1

        return [palavra for palavra, _ in contador.most_common(top_n)]

    # ============================================
    # DETECÇÃO DE OUTLIERS
    # ============================================

    async def detectar_outliers(
        self,
        pesquisa_id: Optional[str] = None,
        limite_desvios: float = 2.0,
    ) -> Dict[str, Any]:
        """
        Detecta respostas atípicas.

        Args:
            pesquisa_id: Filtrar por pesquisa
            limite_desvios: Número de desvios padrão para considerar outlier

        Returns:
            Lista de outliers detectados
        """
        query = select(RespostaPesquisa)
        if pesquisa_id:
            query = query.where(RespostaPesquisa.pesquisa_id == pesquisa_id)

        result = await self.db.execute(query)
        respostas = list(result.scalars().all())

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
            if r.tempo_resposta_ms > 0 and desvio_padrao > 0:
                z_score = (r.tempo_resposta_ms - media_tempo) / desvio_padrao
                if abs(z_score) > limite_desvios:
                    motivos.append(f"Tempo de resposta atípico (z={z_score:.2f})")

            # Resposta muito curta
            if r.resposta_texto and len(r.resposta_texto) < 10:
                motivos.append("Resposta muito curta")

            # Resposta muito longa
            if r.resposta_texto and len(r.resposta_texto) > 5000:
                motivos.append("Resposta muito longa")

            if motivos:
                outliers.append({
                    "resposta_id": r.id,
                    "pesquisa_id": r.pesquisa_id,
                    "eleitor_id": r.eleitor_id,
                    "motivos": motivos,
                    "tempo_resposta_ms": r.tempo_resposta_ms,
                    "tamanho_resposta": len(r.resposta_texto) if r.resposta_texto else 0,
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

    # ============================================
    # INSIGHTS AUTOMÁTICOS
    # ============================================

    async def gerar_insights_globais(
        self, limite_insights: int = 10
    ) -> List[InsightGlobal]:
        """
        Gera insights automáticos a partir dos dados acumulados.

        Args:
            limite_insights: Máximo de insights a retornar

        Returns:
            Lista de insights descobertos
        """
        insights = []
        agora = datetime.now()

        # 1. Análise de volume
        result = await self.db.execute(select(func.count(Pesquisa.id)))
        total_pesquisas = result.scalar() or 0

        if total_pesquisas > 0:
            insights.append(InsightGlobal(
                tipo="volume",
                titulo="Base de dados estabelecida",
                descricao=f"Sistema conta com {total_pesquisas} pesquisa(s) realizadas",
                relevancia="baixa",
                dados_suporte={"total_pesquisas": total_pesquisas},
                criado_em=agora,
            ))

        # 2. Correlações significativas
        correlacoes = await self.calcular_correlacoes_globais()
        for corr in correlacoes[:3]:  # Top 3
            if corr.significancia == "alta":
                insights.append(InsightGlobal(
                    tipo="correlacao",
                    titulo=f"Correlação forte: {corr.variavel_x}",
                    descricao=corr.interpretacao,
                    relevancia="alta",
                    dados_suporte={
                        "coeficiente": corr.coeficiente,
                        "amostra": corr.amostra,
                    },
                    criado_em=agora,
                ))

        # 3. Tendências recentes
        tendencias = await self.calcular_tendencias_temporais("mensal", 3)
        if len(tendencias) >= 2:
            ultima = tendencias[-1]
            penultima = tendencias[-2]

            # Variação de sentimento
            if ultima.sentimento_medio and penultima.sentimento_medio:
                variacao = ultima.sentimento_medio - penultima.sentimento_medio

                if abs(variacao) > 0.2:
                    direcao = "positiva" if variacao > 0 else "negativa"
                    insights.append(InsightGlobal(
                        tipo="tendencia",
                        titulo=f"Mudança {direcao} no sentimento",
                        descricao=f"O sentimento médio mudou {variacao:.2f} pontos entre {penultima.periodo} e {ultima.periodo}.",
                        relevancia="alta" if abs(variacao) > 0.3 else "media",
                        dados_suporte={
                            "periodo_anterior": penultima.periodo,
                            "periodo_atual": ultima.periodo,
                            "variacao": variacao,
                        },
                        criado_em=agora,
                    ))

            # Variação de volume
            if ultima.pesquisas_realizadas != penultima.pesquisas_realizadas:
                variacao_pct = (
                    (ultima.pesquisas_realizadas - penultima.pesquisas_realizadas)
                    / max(penultima.pesquisas_realizadas, 1)
                ) * 100

                if abs(variacao_pct) > 50:
                    direcao = "aumento" if variacao_pct > 0 else "queda"
                    insights.append(InsightGlobal(
                        tipo="tendencia",
                        titulo=f"{direcao.capitalize()} no volume de pesquisas",
                        descricao=f"Houve {direcao} de {abs(variacao_pct):.0f}% no número de pesquisas realizadas.",
                        relevancia="media",
                        dados_suporte={
                            "variacao_percentual": variacao_pct,
                        },
                        criado_em=agora,
                    ))

        # 4. Segmentos com comportamento distinto
        for tipo in ["cluster", "orientacao", "religiao"]:
            segmentos = await self.analisar_segmento(tipo)
            if len(segmentos) >= 2:
                # Comparar primeiro e último
                maior = segmentos[0]
                for seg in segmentos:
                    if (
                        seg.sentimento_predominante == "negativo"
                        and maior.sentimento_predominante == "positivo"
                    ):
                        insights.append(InsightGlobal(
                            tipo="descoberta",
                            titulo=f"Contraste em {tipo}: {maior.valor} vs {seg.valor}",
                            descricao=f"O grupo '{maior.valor}' tende a ser mais positivo, enquanto '{seg.valor}' é mais negativo.",
                            relevancia="media",
                            dados_suporte={
                                "segmento_positivo": maior.valor,
                                "segmento_negativo": seg.valor,
                            },
                            criado_em=agora,
                        ))
                        break

        # 5. Eleitores com muitas participações
        result = await self.db.execute(
            select(
                RespostaPesquisa.eleitor_id,
                RespostaPesquisa.eleitor_nome,
                func.count(func.distinct(RespostaPesquisa.pesquisa_id)).label("participacoes"),
            )
            .group_by(RespostaPesquisa.eleitor_id, RespostaPesquisa.eleitor_nome)
            .having(func.count(func.distinct(RespostaPesquisa.pesquisa_id)) >= 3)
            .order_by(desc("participacoes"))
            .limit(5)
        )

        frequentes = list(result)
        if frequentes:
            nomes = [r[1] for r in frequentes[:3]]
            insights.append(InsightGlobal(
                tipo="descoberta",
                titulo="Eleitores com múltiplas participações",
                descricao=f"Eleitores que participaram de 3+ pesquisas: {', '.join(nomes)}. Perfis ideais para análise longitudinal.",
                relevancia="baixa",
                dados_suporte={
                    "eleitores": [
                        {"id": r[0], "nome": r[1], "participacoes": r[2]}
                        for r in frequentes
                    ]
                },
                criado_em=agora,
            ))

        # Ordenar por relevância
        ordem = {"alta": 0, "media": 1, "baixa": 2}
        insights.sort(key=lambda x: ordem.get(x.relevancia, 2))

        return insights[:limite_insights]

    # ============================================
    # EXPORTAÇÃO DE DATASET
    # ============================================

    async def exportar_dataset_completo(
        self,
        formato: str = "dict",
        pesquisa_ids: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Exporta todos os dados em formato estruturado.

        Args:
            formato: Formato de saída ("dict", "csv", "json")
            pesquisa_ids: Filtrar por pesquisas específicas

        Returns:
            Dicionário com todos os dados para exportação
        """
        # Pesquisas
        query_pesquisas = select(Pesquisa).order_by(Pesquisa.criado_em)
        if pesquisa_ids:
            query_pesquisas = query_pesquisas.where(Pesquisa.id.in_(pesquisa_ids))
        result = await self.db.execute(query_pesquisas)
        pesquisas = list(result.scalars().all())

        # Respostas
        query_respostas = select(RespostaPesquisa).order_by(RespostaPesquisa.criado_em)
        if pesquisa_ids:
            query_respostas = query_respostas.where(
                RespostaPesquisa.pesquisa_id.in_(pesquisa_ids)
            )
        result = await self.db.execute(query_respostas)
        respostas = list(result.scalars().all())

        return {
            "exportado_em": datetime.now().isoformat(),
            "total_pesquisas": len(pesquisas),
            "total_respostas": len(respostas),
            "pesquisas": [
                {
                    "id": p.id,
                    "titulo": p.titulo,
                    "tipo": p.tipo,
                    "status": p.status,
                    "total_eleitores": p.total_eleitores,
                    "total_respostas": p.total_respostas,
                    "custo_real": p.custo_real,
                    "criado_em": p.criado_em.isoformat() if p.criado_em else None,
                    "concluido_em": p.concluido_em.isoformat() if p.concluido_em else None,
                }
                for p in pesquisas
            ],
            "respostas": [
                {
                    "id": r.id,
                    "pesquisa_id": r.pesquisa_id,
                    "pergunta_id": r.pergunta_id,
                    "eleitor_id": r.eleitor_id,
                    "eleitor_nome": r.eleitor_nome,
                    "resposta_texto": r.resposta_texto,
                    "sentimento": r.sentimento,
                    "custo_reais": r.custo_reais,
                    "criado_em": r.criado_em.isoformat() if r.criado_em else None,
                }
                for r in respostas
            ],
            "metadados": {
                "formato": formato,
            },
        }

    # ============================================
    # HISTÓRICO DE ELEITOR
    # ============================================

    async def obter_historico_eleitor(
        self, eleitor_id: str
    ) -> Dict[str, Any]:
        """
        Obtém histórico completo de participação de um eleitor.

        Args:
            eleitor_id: ID do eleitor

        Returns:
            Histórico de participações e respostas
        """
        query = (
            select(RespostaPesquisa)
            .where(RespostaPesquisa.eleitor_id == eleitor_id)
            .order_by(RespostaPesquisa.criado_em)
        )
        result = await self.db.execute(query)
        respostas = list(result.scalars().all())

        if not respostas:
            return {"eleitor_id": eleitor_id, "participacoes": []}

        # Agrupar por pesquisa
        por_pesquisa: Dict[str, List] = defaultdict(list)
        for r in respostas:
            por_pesquisa[r.pesquisa_id].append(r)

        participacoes = []
        for pesquisa_id, resps in por_pesquisa.items():
            # Contabilizar sentimentos
            sentimentos = Counter(r.sentimento for r in resps if r.sentimento)

            participacoes.append({
                "pesquisa_id": pesquisa_id,
                "total_respostas": len(resps),
                "primeira_resposta": min(r.criado_em for r in resps).isoformat() if resps else None,
                "ultima_resposta": max(r.criado_em for r in resps).isoformat() if resps else None,
                "sentimentos": dict(sentimentos),
                "custo_total": sum(r.custo_reais for r in resps if r.custo_reais),
            })

        return {
            "eleitor_id": eleitor_id,
            "total_participacoes": len(participacoes),
            "total_respostas": len(respostas),
            "participacoes": participacoes,
        }


# Factory para criar instância do serviço
def obter_servico_analise_acumulativa(db: AsyncSession) -> AnaliseAcumulativaServico:
    """
    Obtém uma instância do serviço de análise acumulativa.

    Args:
        db: Sessão do banco de dados

    Returns:
        Instância do serviço
    """
    return AnaliseAcumulativaServico(db)
