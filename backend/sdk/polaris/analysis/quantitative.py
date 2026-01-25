# POLARIS SDK - Quantitative Analysis
# Análises quantitativas e estatísticas descritivas

import math
from typing import Dict, Any, List, Optional, Tuple
from collections import Counter
import statistics

from ..models.report import DescriptiveStats, SegmentedAnalysis, SegmentStats


class QuantitativeAnalyzer:
    """
    Analisador de dados quantitativos.

    Realiza análises descritivas e gera estatísticas.
    """

    def __init__(self, respostas: List[Dict[str, Any]]):
        """
        Inicializa o analisador.

        Args:
            respostas: Lista de respostas coletadas
        """
        self.respostas = respostas

    def calcular_estatisticas_descritivas(
        self,
        variavel: str,
        tipo: str = "categorica"
    ) -> DescriptiveStats:
        """
        Calcula estatísticas descritivas para uma variável.

        Args:
            variavel: Nome da variável
            tipo: Tipo da variável (categorica ou numerica)

        Returns:
            Estatísticas descritivas
        """
        valores = [r.get(variavel) for r in self.respostas if r.get(variavel) is not None]

        stats = DescriptiveStats(
            variavel=variavel,
            n=len(valores)
        )

        if not valores:
            return stats

        if tipo == "categorica":
            stats = self._estatisticas_categoricas(valores, stats)
        else:
            stats = self._estatisticas_numericas(valores, stats)

        return stats

    def _estatisticas_categoricas(
        self,
        valores: List[Any],
        stats: DescriptiveStats
    ) -> DescriptiveStats:
        """Calcula estatísticas para variáveis categóricas."""
        contagem = Counter(valores)
        total = len(valores)

        stats.frequencias_absolutas = dict(contagem)
        stats.frequencias_relativas = {
            k: round(v / total, 4)
            for k, v in contagem.items()
        }
        stats.moda = contagem.most_common(1)[0][0] if contagem else None

        return stats

    def _estatisticas_numericas(
        self,
        valores: List[Any],
        stats: DescriptiveStats
    ) -> DescriptiveStats:
        """Calcula estatísticas para variáveis numéricas."""
        # Converter para float
        valores_num = [float(v) for v in valores if v is not None]

        if not valores_num:
            return stats

        # Medidas de tendência central
        stats.media = round(statistics.mean(valores_num), 4)
        stats.mediana = round(statistics.median(valores_num), 4)

        try:
            stats.moda = str(round(statistics.mode(valores_num), 4))
        except statistics.StatisticsError:
            stats.moda = None

        # Medidas de dispersão
        if len(valores_num) > 1:
            stats.desvio_padrao = round(statistics.stdev(valores_num), 4)
            stats.variancia = round(statistics.variance(valores_num), 4)

        stats.amplitude = round(max(valores_num) - min(valores_num), 4)

        if stats.media and stats.media != 0:
            stats.coeficiente_variacao = round(
                (stats.desvio_padrao or 0) / stats.media * 100, 2
            )

        # Quartis
        valores_ordenados = sorted(valores_num)
        n = len(valores_ordenados)

        stats.q1 = round(self._percentil(valores_ordenados, 25), 4)
        stats.q2 = round(self._percentil(valores_ordenados, 50), 4)
        stats.q3 = round(self._percentil(valores_ordenados, 75), 4)
        stats.iqr = round((stats.q3 or 0) - (stats.q1 or 0), 4)

        # Percentis específicos
        for p in [5, 10, 25, 50, 75, 90, 95]:
            stats.percentis[p] = round(self._percentil(valores_ordenados, p), 4)

        return stats

    def _percentil(self, dados: List[float], p: int) -> float:
        """Calcula o percentil p dos dados."""
        if not dados:
            return 0.0

        k = (len(dados) - 1) * (p / 100)
        f = math.floor(k)
        c = math.ceil(k)

        if f == c:
            return dados[int(k)]

        d0 = dados[int(f)] * (c - k)
        d1 = dados[int(c)] * (k - f)

        return d0 + d1

    def calcular_intencao_voto(
        self,
        pergunta_id: str
    ) -> Dict[str, Any]:
        """
        Calcula intenção de voto de uma pergunta específica.

        Args:
            pergunta_id: ID da pergunta de intenção de voto

        Returns:
            Distribuição de intenção de voto
        """
        votos = [
            r.get("resposta_estruturada") or r.get("resposta_texto")
            for r in self.respostas
            if r.get("pergunta_id") == pergunta_id
        ]

        total = len(votos)
        if total == 0:
            return {"erro": "Sem dados"}

        contagem = Counter(votos)

        # Calcular distribuição
        distribuicao = {
            k: {
                "votos": v,
                "percentual": round(v / total * 100, 2)
            }
            for k, v in contagem.most_common()
        }

        # Identificar líder
        if contagem:
            lider, votos_lider = contagem.most_common(1)[0]
            segundo, votos_segundo = contagem.most_common(2)[1] if len(contagem) > 1 else (None, 0)

            return {
                "distribuicao": distribuicao,
                "total_respostas": total,
                "lider": lider,
                "percentual_lider": round(votos_lider / total * 100, 2),
                "segundo": segundo,
                "percentual_segundo": round(votos_segundo / total * 100, 2) if segundo else 0,
                "diferenca": round((votos_lider - votos_segundo) / total * 100, 2) if segundo else 0,
                "indecisos": distribuicao.get("Indeciso", {}).get("percentual", 0)
            }

        return {"distribuicao": {}, "total_respostas": 0}

    def calcular_rejeicao(
        self,
        pergunta_id: str
    ) -> Dict[str, Any]:
        """
        Calcula taxa de rejeição de candidatos.

        Args:
            pergunta_id: ID da pergunta de rejeição

        Returns:
            Ranking de rejeição
        """
        rejeicoes = [
            r.get("resposta_estruturada") or r.get("resposta_texto")
            for r in self.respostas
            if r.get("pergunta_id") == pergunta_id
        ]

        total = len(rejeicoes)
        if total == 0:
            return {"erro": "Sem dados"}

        contagem = Counter(rejeicoes)

        return {
            "ranking": [
                {
                    "candidato": candidato,
                    "rejeicoes": n,
                    "percentual": round(n / total * 100, 2)
                }
                for candidato, n in contagem.most_common()
            ],
            "total_respostas": total,
            "mais_rejeitado": contagem.most_common(1)[0][0] if contagem else None
        }

    def analise_segmentada(
        self,
        variavel_resposta: str,
        variavel_segmentacao: str,
        eleitores: List[Dict[str, Any]]
    ) -> SegmentedAnalysis:
        """
        Realiza análise segmentada por uma variável.

        Args:
            variavel_resposta: Variável de resposta a analisar
            variavel_segmentacao: Variável para segmentação
            eleitores: Lista de eleitores com perfis

        Returns:
            Análise segmentada
        """
        # Criar mapa de eleitor para perfil
        perfil_por_id = {e.get("id"): e for e in eleitores}

        # Agrupar respostas por segmento
        por_segmento: Dict[str, List[Any]] = {}

        for resp in self.respostas:
            eleitor_id = resp.get("eleitor_id")
            perfil = perfil_por_id.get(eleitor_id, {})
            segmento = perfil.get(variavel_segmentacao, "desconhecido")

            if isinstance(segmento, list):
                segmento = segmento[0] if segmento else "desconhecido"
            segmento = str(segmento)

            if segmento not in por_segmento:
                por_segmento[segmento] = []

            valor = resp.get(variavel_resposta) or resp.get("resposta_estruturada")
            if valor:
                por_segmento[segmento].append(valor)

        # Calcular estatísticas por segmento
        total_geral = sum(len(v) for v in por_segmento.values())
        segmentos = []

        for nome_segmento, valores in por_segmento.items():
            contagem = Counter(valores)
            n = len(valores)

            seg = SegmentStats(
                segmento=variavel_segmentacao,
                valor=nome_segmento,
                n=n,
                percentual=round(n / total_geral * 100, 2) if total_geral > 0 else 0
            )

            # Distribuição dentro do segmento
            for valor, count in contagem.items():
                seg.intencao_voto[str(valor)] = round(count / n * 100, 2) if n > 0 else 0

            segmentos.append(seg)

        return SegmentedAnalysis(
            variavel_segmentacao=variavel_segmentacao,
            segmentos=segmentos
        )

    def tabela_cruzada(
        self,
        variavel_linha: str,
        variavel_coluna: str,
        eleitores: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Gera tabela cruzada entre duas variáveis.

        Args:
            variavel_linha: Variável para linhas
            variavel_coluna: Variável para colunas
            eleitores: Lista de eleitores

        Returns:
            Tabela cruzada com frequências
        """
        # Criar mapa de eleitor para perfil
        perfil_por_id = {e.get("id"): e for e in eleitores}

        # Coletar valores
        dados = []
        for resp in self.respostas:
            eleitor_id = resp.get("eleitor_id")
            perfil = perfil_por_id.get(eleitor_id, {})

            val_linha = perfil.get(variavel_linha, resp.get(variavel_linha, "outro"))
            val_coluna = resp.get("resposta_estruturada") or resp.get(variavel_coluna, "outro")

            if isinstance(val_linha, list):
                val_linha = val_linha[0] if val_linha else "outro"
            if isinstance(val_coluna, list):
                val_coluna = val_coluna[0] if val_coluna else "outro"

            dados.append((str(val_linha), str(val_coluna)))

        # Construir tabela
        linhas = sorted(set(d[0] for d in dados))
        colunas = sorted(set(d[1] for d in dados))

        tabela = {linha: {coluna: 0 for coluna in colunas} for linha in linhas}

        for val_linha, val_coluna in dados:
            tabela[val_linha][val_coluna] += 1

        # Calcular totais
        totais_linha = {linha: sum(tabela[linha].values()) for linha in linhas}
        totais_coluna = {coluna: sum(tabela[linha][coluna] for linha in linhas) for coluna in colunas}
        total_geral = sum(totais_linha.values())

        return {
            "variavel_linha": variavel_linha,
            "variavel_coluna": variavel_coluna,
            "linhas": linhas,
            "colunas": colunas,
            "tabela": tabela,
            "totais_linha": totais_linha,
            "totais_coluna": totais_coluna,
            "total_geral": total_geral,
            "percentuais_linha": {
                linha: {
                    coluna: round(tabela[linha][coluna] / totais_linha[linha] * 100, 2)
                    if totais_linha[linha] > 0 else 0
                    for coluna in colunas
                }
                for linha in linhas
            }
        }

    def resumo_geral(self) -> Dict[str, Any]:
        """
        Gera resumo geral das respostas.

        Returns:
            Resumo estatístico geral
        """
        perguntas = set(r.get("pergunta_id") for r in self.respostas)
        eleitores = set(r.get("eleitor_id") for r in self.respostas)

        return {
            "total_respostas": len(self.respostas),
            "total_perguntas": len(perguntas),
            "total_eleitores": len(eleitores),
            "media_respostas_por_eleitor": round(len(self.respostas) / len(eleitores), 2) if eleitores else 0
        }
