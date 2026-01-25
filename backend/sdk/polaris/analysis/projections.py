# POLARIS SDK - Projections
# Motor de projeções eleitorais

import random
import math
from typing import Dict, Any, List, Optional, Tuple
from collections import Counter

from ..models.report import ProjectionScenario, ScenarioType, BreakingPoint


class ProjectionsEngine:
    """
    Motor de projeções eleitorais.

    Gera cenários e simulações Monte Carlo.
    """

    def __init__(
        self,
        intencao_voto: Dict[str, float],
        margem_erro: float = 0.03,
        indecisos: float = 0.0
    ):
        """
        Inicializa o motor de projeções.

        Args:
            intencao_voto: Distribuição atual (candidato -> percentual)
            margem_erro: Margem de erro da pesquisa
            indecisos: Percentual de indecisos
        """
        self.intencao_voto = intencao_voto
        self.margem_erro = margem_erro
        self.indecisos = indecisos
        self.candidatos = list(intencao_voto.keys())

    def gerar_cenarios(self) -> List[ProjectionScenario]:
        """
        Gera cenários de projeção.

        Returns:
            Lista de cenários
        """
        cenarios = []

        # Identificar líder
        lider = max(self.intencao_voto, key=self.intencao_voto.get)
        segundo = sorted(
            self.intencao_voto,
            key=self.intencao_voto.get,
            reverse=True
        )[1] if len(self.intencao_voto) > 1 else None

        # Cenário Otimista (favorece líder)
        cenarios.append(self._cenario_otimista(lider))

        # Cenário Realista
        cenarios.append(self._cenario_realista())

        # Cenário Pessimista (favorece segundo)
        if segundo:
            cenarios.append(self._cenario_pessimista(segundo))

        # Cenário Volatilidade Máxima
        cenarios.append(self._cenario_volatilidade())

        return cenarios

    def _cenario_otimista(self, lider: str) -> ProjectionScenario:
        """Gera cenário otimista para o líder."""
        projecao = dict(self.intencao_voto)

        # Indecisos vão proporcionalmente mais para o líder
        if self.indecisos > 0:
            # 60% dos indecisos para o líder
            bonus_lider = self.indecisos * 0.6
            restante = self.indecisos * 0.4

            projecao[lider] = projecao.get(lider, 0) + bonus_lider

            # Dividir restante proporcionalmente entre outros
            outros = [c for c in self.candidatos if c != lider]
            if outros:
                por_outro = restante / len(outros)
                for c in outros:
                    projecao[c] = projecao.get(c, 0) + por_outro

        # Aplicar limite superior da margem de erro ao líder
        projecao[lider] = min(projecao[lider] + self.margem_erro, 100)

        return ProjectionScenario(
            tipo=ScenarioType.OTIMISTA,
            nome="Cenário Otimista",
            descricao=f"Favorável a {lider}: indecisos migram majoritariamente para o líder",
            intencao_voto=projecao,
            intervalo_confianca=self._calcular_intervalos(projecao),
            probabilidade_vitoria=self._calcular_probabilidades(projecao),
            premissas=[
                f"60% dos indecisos votam em {lider}",
                "Margem de erro favorece o líder",
                "Sem eventos negativos para o líder"
            ]
        )

    def _cenario_realista(self) -> ProjectionScenario:
        """Gera cenário realista."""
        projecao = dict(self.intencao_voto)

        # Indecisos divididos proporcionalmente
        if self.indecisos > 0:
            total_declarado = sum(projecao.values())
            if total_declarado > 0:
                for c in self.candidatos:
                    proporcao = projecao.get(c, 0) / total_declarado
                    projecao[c] = projecao.get(c, 0) + (self.indecisos * proporcao)

        return ProjectionScenario(
            tipo=ScenarioType.REALISTA,
            nome="Cenário Realista",
            descricao="Tendência atual mantida: indecisos votam proporcionalmente",
            intencao_voto=projecao,
            intervalo_confianca=self._calcular_intervalos(projecao),
            probabilidade_vitoria=self._calcular_probabilidades(projecao),
            premissas=[
                "Indecisos votam na proporção atual",
                "Sem mudanças significativas no cenário",
                "Margem de erro considerada bilateralmente"
            ]
        )

    def _cenario_pessimista(self, segundo: str) -> ProjectionScenario:
        """Gera cenário pessimista para o líder."""
        projecao = dict(self.intencao_voto)

        # Indecisos vão majoritariamente para o segundo
        if self.indecisos > 0:
            bonus_segundo = self.indecisos * 0.7
            restante = self.indecisos * 0.3

            projecao[segundo] = projecao.get(segundo, 0) + bonus_segundo

            outros = [c for c in self.candidatos if c != segundo]
            if outros:
                por_outro = restante / len(outros)
                for c in outros:
                    projecao[c] = projecao.get(c, 0) + por_outro

        # Aplicar margem de erro desfavorável ao líder
        lider = max(self.intencao_voto, key=self.intencao_voto.get)
        projecao[lider] = max(projecao[lider] - self.margem_erro, 0)

        return ProjectionScenario(
            tipo=ScenarioType.PESSIMISTA,
            nome="Cenário Pessimista",
            descricao=f"Favorável a {segundo}: indecisos migram para o challenger",
            intencao_voto=projecao,
            intervalo_confianca=self._calcular_intervalos(projecao),
            probabilidade_vitoria=self._calcular_probabilidades(projecao),
            premissas=[
                f"70% dos indecisos votam em {segundo}",
                "Margem de erro desfavorece o líder",
                "Possível voto útil contra o líder"
            ]
        )

    def _cenario_volatilidade(self) -> ProjectionScenario:
        """Gera cenário de volatilidade máxima."""
        projecao = dict(self.intencao_voto)

        # Todos indecisos vão para um candidato específico (segundo)
        if self.indecisos > 0 and len(self.candidatos) > 1:
            segundo = sorted(
                self.intencao_voto,
                key=self.intencao_voto.get,
                reverse=True
            )[1]
            projecao[segundo] = projecao.get(segundo, 0) + self.indecisos

        return ProjectionScenario(
            tipo=ScenarioType.VOLATILIDADE_MAXIMA,
            nome="Cenário Volatilidade Máxima",
            descricao="Teste de limites: todos indecisos para um único candidato",
            intencao_voto=projecao,
            intervalo_confianca=self._calcular_intervalos(projecao),
            probabilidade_vitoria=self._calcular_probabilidades(projecao),
            premissas=[
                "100% dos indecisos para um candidato",
                "Cenário extremo para teste de stress",
                "Baixa probabilidade de ocorrência"
            ]
        )

    def _calcular_intervalos(
        self,
        projecao: Dict[str, float]
    ) -> Dict[str, Tuple[float, float]]:
        """Calcula intervalos de confiança."""
        return {
            candidato: (
                round(max(0, valor - self.margem_erro * 100), 2),
                round(min(100, valor + self.margem_erro * 100), 2)
            )
            for candidato, valor in projecao.items()
        }

    def _calcular_probabilidades(
        self,
        projecao: Dict[str, float]
    ) -> Dict[str, float]:
        """
        Calcula probabilidade de vitória aproximada.

        Baseado na posição relativa e margem de erro.
        """
        if not projecao:
            return {}

        # Ordenar por votos
        ordenado = sorted(projecao.items(), key=lambda x: x[1], reverse=True)

        probabilidades = {}

        for i, (candidato, votos) in enumerate(ordenado):
            if i == 0:
                # Líder: probabilidade baseada na diferença para segundo
                if len(ordenado) > 1:
                    diferenca = votos - ordenado[1][1]
                    # Se diferença > 2x margem de erro, alta probabilidade
                    if diferenca > self.margem_erro * 200:
                        prob = 0.90 + min(0.09, diferenca / 1000)
                    elif diferenca > self.margem_erro * 100:
                        prob = 0.70 + (diferenca - self.margem_erro * 100) / 500
                    else:
                        prob = 0.50 + diferenca / 200
                else:
                    prob = 0.99
            else:
                # Outros: probabilidade proporcional à distância do líder
                distancia = ordenado[0][1] - votos
                if distancia < self.margem_erro * 100:
                    prob = 0.30 + (self.margem_erro * 100 - distancia) / 300
                elif distancia < self.margem_erro * 200:
                    prob = 0.10 + (self.margem_erro * 200 - distancia) / 1000
                else:
                    prob = max(0.01, 0.05 - distancia / 10000)

            probabilidades[candidato] = round(min(0.99, max(0.01, prob)), 3)

        return probabilidades

    def simulacao_monte_carlo(
        self,
        n_simulacoes: int = 10000
    ) -> Dict[str, Any]:
        """
        Realiza simulação Monte Carlo para projeções.

        Args:
            n_simulacoes: Número de simulações

        Returns:
            Resultados da simulação
        """
        resultados_por_candidato = {c: [] for c in self.candidatos}
        vitorias = {c: 0 for c in self.candidatos}
        segundo_turno = 0

        for _ in range(n_simulacoes):
            # Simular uma eleição
            resultado_simulado = {}

            for candidato, base in self.intencao_voto.items():
                # Adicionar variação aleatória dentro da margem de erro
                variacao = random.gauss(0, self.margem_erro * 100 / 2)
                valor = base + variacao

                # Adicionar parte dos indecisos aleatoriamente
                if self.indecisos > 0:
                    bonus_indeciso = random.uniform(0, self.indecisos)
                    valor += bonus_indeciso

                resultado_simulado[candidato] = max(0, valor)
                resultados_por_candidato[candidato].append(valor)

            # Normalizar para 100%
            total = sum(resultado_simulado.values())
            if total > 0:
                resultado_simulado = {
                    c: v / total * 100
                    for c, v in resultado_simulado.items()
                }

            # Determinar vencedor
            vencedor = max(resultado_simulado, key=resultado_simulado.get)
            maior_votacao = resultado_simulado[vencedor]

            if maior_votacao > 50:
                vitorias[vencedor] += 1
            else:
                segundo_turno += 1

        # Calcular estatísticas
        estatisticas = {}
        for candidato, valores in resultados_por_candidato.items():
            if valores:
                valores.sort()
                n = len(valores)
                estatisticas[candidato] = {
                    "media": round(sum(valores) / n, 2),
                    "desvio_padrao": round(
                        math.sqrt(sum((v - sum(valores)/n)**2 for v in valores) / n),
                        2
                    ),
                    "percentil_5": round(valores[int(n * 0.05)], 2),
                    "percentil_25": round(valores[int(n * 0.25)], 2),
                    "mediana": round(valores[int(n * 0.50)], 2),
                    "percentil_75": round(valores[int(n * 0.75)], 2),
                    "percentil_95": round(valores[int(n * 0.95)], 2)
                }

        return {
            "n_simulacoes": n_simulacoes,
            "probabilidade_vitoria": {
                c: round(v / n_simulacoes * 100, 2)
                for c, v in vitorias.items()
            },
            "probabilidade_segundo_turno": round(segundo_turno / n_simulacoes * 100, 2),
            "estatisticas": estatisticas
        }

    def identificar_pontos_ruptura(
        self,
        analise_qualitativa: Dict[str, Any]
    ) -> List[BreakingPoint]:
        """
        Identifica potenciais pontos de ruptura.

        Args:
            analise_qualitativa: Dados de análise qualitativa

        Returns:
            Lista de pontos de ruptura
        """
        pontos = []

        # Temas com alta carga emocional
        temas_sensiveis = [
            {
                "tema": "Corrupção",
                "impacto": 8,
                "direcao": "favorece_challenger",
                "probabilidade": 0.3
            },
            {
                "tema": "Segurança pública",
                "impacto": 7,
                "direcao": "incerto",
                "probabilidade": 0.4
            },
            {
                "tema": "Economia/emprego",
                "impacto": 8,
                "direcao": "incerto",
                "probabilidade": 0.5
            },
            {
                "tema": "Escândalo pessoal",
                "impacto": 9,
                "direcao": "favorece_challenger",
                "probabilidade": 0.1
            }
        ]

        for tema in temas_sensiveis:
            pontos.append(BreakingPoint(
                tema=tema["tema"],
                descricao=f"Evento relacionado a {tema['tema'].lower()} pode alterar dinâmica eleitoral",
                impacto_potencial=tema["impacto"],
                segmentos_afetados=["indecisos", "voto_fraco"],
                direcao_impacto=tema["direcao"],
                probabilidade_ocorrencia=tema["probabilidade"]
            ))

        return pontos

    def swing_voters_analysis(
        self,
        eleitores: List[Dict[str, Any]],
        respostas: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analisa eleitores com potencial de mudança de voto.

        Args:
            eleitores: Lista de perfis
            respostas: Lista de respostas

        Returns:
            Análise de swing voters
        """
        # Identificar eleitores com características de swing voters
        swing_voters = []

        # Mapear respostas por eleitor
        certeza_por_eleitor = {}
        for resp in respostas:
            fluxo = resp.get("fluxo_cognitivo", {})
            decisao = fluxo.get("decisao", {})
            certeza = decisao.get("certeza_numerica", 5)
            pode_mudar = decisao.get("pode_mudar_opiniao", False)

            eleitor_id = resp.get("eleitor_id")
            if eleitor_id not in certeza_por_eleitor:
                certeza_por_eleitor[eleitor_id] = []
            certeza_por_eleitor[eleitor_id].append({
                "certeza": certeza,
                "pode_mudar": pode_mudar
            })

        # Identificar swing voters
        for eleitor in eleitores:
            eleitor_id = eleitor.get("id")
            dados_resposta = certeza_por_eleitor.get(eleitor_id, [])

            if not dados_resposta:
                continue

            certeza_media = sum(d["certeza"] for d in dados_resposta) / len(dados_resposta)
            pode_mudar = any(d["pode_mudar"] for d in dados_resposta)

            # Critérios de swing voter
            is_swing = (
                certeza_media < 7 or
                pode_mudar or
                eleitor.get("tolerancia_nuance", 0) > 7 or
                eleitor.get("interesse_politico") == "medio"
            )

            if is_swing:
                swing_voters.append({
                    "id": eleitor_id,
                    "nome": eleitor.get("nome"),
                    "certeza_media": round(certeza_media, 2),
                    "regiao": eleitor.get("regiao_administrativa"),
                    "orientacao": eleitor.get("orientacao_politica")
                })

        total_eleitores = len(eleitores)

        return {
            "total_swing_voters": len(swing_voters),
            "percentual": round(len(swing_voters) / total_eleitores * 100, 2) if total_eleitores > 0 else 0,
            "perfil_predominante": self._perfil_swing_voters(swing_voters),
            "swing_voters": swing_voters[:20]  # Top 20
        }

    def _perfil_swing_voters(self, swing_voters: List[Dict[str, Any]]) -> Dict[str, str]:
        """Identifica características predominantes dos swing voters."""
        if not swing_voters:
            return {}

        regioes = Counter(sv.get("regiao") for sv in swing_voters)
        orientacoes = Counter(sv.get("orientacao") for sv in swing_voters)

        return {
            "regiao_predominante": regioes.most_common(1)[0][0] if regioes else "diverso",
            "orientacao_predominante": orientacoes.most_common(1)[0][0] if orientacoes else "diversa",
            "certeza_media": round(sum(sv.get("certeza_media", 5) for sv in swing_voters) / len(swing_voters), 2)
        }
