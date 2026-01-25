# POLARIS SDK - Sampling
# Motor de amostragem estatística

import math
import random
from typing import Dict, Any, List, Optional, Tuple
from collections import Counter

from ..models.sample import (
    SamplingStrategy,
    SamplingType,
    SampleConfig,
    SelectedSample,
    SelectedVoter,
    Quota,
    ESTRATIFICACAO_DF_PADRAO,
)


def calculate_sample_size(
    population: int,
    confidence_level: float = 0.95,
    margin_error: float = 0.03,
    proportion: float = 0.5
) -> int:
    """
    Calcula tamanho amostral.

    Fórmula: n = (Z² * p * q * N) / (e² * (N-1) + Z² * p * q)

    Args:
        population: Tamanho da população
        confidence_level: Nível de confiança (0.90, 0.95, 0.99)
        margin_error: Margem de erro desejada
        proportion: Proporção estimada (0.5 para máxima variância)

    Returns:
        Tamanho amostral calculado
    """
    # Z-scores para níveis de confiança comuns
    z_scores = {
        0.90: 1.645,
        0.95: 1.96,
        0.99: 2.576
    }
    z = z_scores.get(confidence_level, 1.96)

    p = proportion
    q = 1 - p
    n_pop = population
    e = margin_error

    numerator = (z ** 2) * p * q * n_pop
    denominator = (e ** 2) * (n_pop - 1) + (z ** 2) * p * q

    return math.ceil(numerator / denominator)


class SamplingEngine:
    """
    Motor de amostragem estatística.

    Suporta múltiplos tipos de amostragem:
    - Aleatória simples
    - Estratificada proporcional
    - Estratificada ótima (Neyman)
    - Por cotas
    - Sistemática
    - Por cluster
    """

    def __init__(self, eleitores: List[Dict[str, Any]]):
        """
        Inicializa o motor de amostragem.

        Args:
            eleitores: Lista de eleitores disponíveis
        """
        self.eleitores = eleitores
        self.population_size = len(eleitores)

    def calcular_distribuicao(
        self,
        variavel: str
    ) -> Dict[str, Tuple[int, float]]:
        """
        Calcula distribuição de uma variável.

        Args:
            variavel: Nome da variável

        Returns:
            Dicionário com contagem e proporção por categoria
        """
        valores = []
        for e in self.eleitores:
            val = e.get(variavel, "desconhecido")
            if isinstance(val, list):
                val = val[0] if val else "desconhecido"
            valores.append(str(val))

        contagem = Counter(valores)
        total = len(valores)

        return {
            k: (v, v / total)
            for k, v in contagem.items()
        }

    def amostragem_aleatoria_simples(
        self,
        tamanho: int
    ) -> List[Dict[str, Any]]:
        """
        Realiza amostragem aleatória simples.

        Args:
            tamanho: Tamanho da amostra

        Returns:
            Lista de eleitores selecionados
        """
        tamanho = min(tamanho, self.population_size)
        return random.sample(self.eleitores, tamanho)

    def amostragem_sistematica(
        self,
        tamanho: int
    ) -> List[Dict[str, Any]]:
        """
        Realiza amostragem sistemática.

        Seleciona cada k-ésimo elemento.

        Args:
            tamanho: Tamanho da amostra

        Returns:
            Lista de eleitores selecionados
        """
        k = self.population_size // tamanho
        if k < 1:
            k = 1

        inicio = random.randint(0, k - 1)
        selecionados = []

        for i in range(inicio, self.population_size, k):
            selecionados.append(self.eleitores[i])
            if len(selecionados) >= tamanho:
                break

        return selecionados

    def amostragem_estratificada_proporcional(
        self,
        tamanho: int,
        variavel: str
    ) -> List[Dict[str, Any]]:
        """
        Realiza amostragem estratificada proporcional.

        Args:
            tamanho: Tamanho total da amostra
            variavel: Variável de estratificação

        Returns:
            Lista de eleitores selecionados
        """
        # Agrupar por estrato
        estratos: Dict[str, List[Dict[str, Any]]] = {}
        for eleitor in self.eleitores:
            valor = eleitor.get(variavel, "outro")
            if isinstance(valor, list):
                valor = valor[0] if valor else "outro"
            valor = str(valor)

            if valor not in estratos:
                estratos[valor] = []
            estratos[valor].append(eleitor)

        # Selecionar proporcionalmente de cada estrato
        selecionados = []
        for estrato, membros in estratos.items():
            proporcao = len(membros) / self.population_size
            n_estrato = max(1, int(tamanho * proporcao))
            n_estrato = min(n_estrato, len(membros))

            selecionados.extend(random.sample(membros, n_estrato))

        # Ajustar para tamanho exato
        if len(selecionados) > tamanho:
            selecionados = random.sample(selecionados, tamanho)
        elif len(selecionados) < tamanho:
            restantes = [e for e in self.eleitores if e not in selecionados]
            adicionar = min(tamanho - len(selecionados), len(restantes))
            selecionados.extend(random.sample(restantes, adicionar))

        return selecionados

    def amostragem_estratificada_multipla(
        self,
        tamanho: int,
        variaveis: List[str],
        pesos: Optional[Dict[str, float]] = None
    ) -> List[Dict[str, Any]]:
        """
        Realiza amostragem estratificada com múltiplas variáveis.

        Args:
            tamanho: Tamanho da amostra
            variaveis: Lista de variáveis de estratificação
            pesos: Pesos opcionais para cada variável

        Returns:
            Lista de eleitores selecionados
        """
        if not pesos:
            pesos = {v: 1.0 / len(variaveis) for v in variaveis}

        # Criar chave composta para cada eleitor
        def criar_chave_estrato(eleitor: Dict[str, Any]) -> str:
            partes = []
            for var in variaveis:
                valor = eleitor.get(var, "outro")
                if isinstance(valor, list):
                    valor = valor[0] if valor else "outro"
                partes.append(f"{var}:{valor}")
            return "|".join(partes)

        # Agrupar por estrato composto
        estratos: Dict[str, List[Dict[str, Any]]] = {}
        for eleitor in self.eleitores:
            chave = criar_chave_estrato(eleitor)
            if chave not in estratos:
                estratos[chave] = []
            estratos[chave].append(eleitor)

        # Selecionar de cada estrato
        selecionados = []
        for estrato, membros in estratos.items():
            proporcao = len(membros) / self.population_size
            n_estrato = max(1, int(tamanho * proporcao))
            n_estrato = min(n_estrato, len(membros))

            selecionados.extend(random.sample(membros, n_estrato))

        # Ajustar tamanho
        if len(selecionados) > tamanho:
            selecionados = random.sample(selecionados, tamanho)
        elif len(selecionados) < tamanho:
            restantes = [e for e in self.eleitores if e not in selecionados]
            adicionar = min(tamanho - len(selecionados), len(restantes))
            if adicionar > 0:
                selecionados.extend(random.sample(restantes, adicionar))

        return selecionados

    def amostragem_por_cotas(
        self,
        cotas: List[Quota]
    ) -> List[Dict[str, Any]]:
        """
        Realiza amostragem por cotas.

        Args:
            cotas: Lista de cotas a preencher

        Returns:
            Lista de eleitores selecionados
        """
        selecionados = []
        eleitores_disponiveis = list(self.eleitores)
        random.shuffle(eleitores_disponiveis)

        # Preencher cada cota
        for cota in cotas:
            cota.quantidade_atual = 0

        for eleitor in eleitores_disponiveis:
            for cota in cotas:
                if cota.preenchida:
                    continue

                valor = eleitor.get(cota.variavel, "")
                if isinstance(valor, list):
                    valor = valor[0] if valor else ""

                if str(valor) == cota.categoria:
                    selecionados.append(eleitor)
                    cota.quantidade_atual += 1
                    break

            # Verificar se todas as cotas estão preenchidas
            if all(c.preenchida for c in cotas):
                break

        return selecionados

    def amostragem_por_cluster(
        self,
        tamanho: int,
        variavel_cluster: str,
        n_clusters: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Realiza amostragem por cluster.

        Args:
            tamanho: Tamanho aproximado da amostra
            variavel_cluster: Variável para agrupar clusters
            n_clusters: Número de clusters a selecionar

        Returns:
            Lista de eleitores selecionados
        """
        # Agrupar por cluster
        clusters: Dict[str, List[Dict[str, Any]]] = {}
        for eleitor in self.eleitores:
            valor = eleitor.get(variavel_cluster, "outro")
            if isinstance(valor, list):
                valor = valor[0] if valor else "outro"
            valor = str(valor)

            if valor not in clusters:
                clusters[valor] = []
            clusters[valor].append(eleitor)

        # Determinar número de clusters a selecionar
        if n_clusters is None:
            # Estimar baseado no tamanho desejado
            tamanho_medio_cluster = self.population_size / len(clusters)
            n_clusters = max(1, int(tamanho / tamanho_medio_cluster))

        n_clusters = min(n_clusters, len(clusters))

        # Selecionar clusters aleatoriamente
        clusters_selecionados = random.sample(list(clusters.keys()), n_clusters)

        # Retornar todos os membros dos clusters selecionados
        selecionados = []
        for cluster in clusters_selecionados:
            selecionados.extend(clusters[cluster])

        return selecionados

    def selecionar(
        self,
        estrategia: SamplingStrategy
    ) -> SelectedSample:
        """
        Executa seleção conforme estratégia.

        Args:
            estrategia: Estratégia de amostragem

        Returns:
            Amostra selecionada
        """
        tamanho = estrategia.tamanho_amostra or estrategia.calcular_tamanho()

        # Selecionar baseado no tipo
        if estrategia.tipo == SamplingType.ALEATORIA_SIMPLES:
            eleitores_selecionados = self.amostragem_aleatoria_simples(tamanho)

        elif estrategia.tipo == SamplingType.SISTEMATICA:
            eleitores_selecionados = self.amostragem_sistematica(tamanho)

        elif estrategia.tipo == SamplingType.ESTRATIFICADA_PROPORCIONAL:
            if estrategia.variaveis_estratificacao:
                if len(estrategia.variaveis_estratificacao) == 1:
                    eleitores_selecionados = self.amostragem_estratificada_proporcional(
                        tamanho,
                        estrategia.variaveis_estratificacao[0]
                    )
                else:
                    eleitores_selecionados = self.amostragem_estratificada_multipla(
                        tamanho,
                        estrategia.variaveis_estratificacao
                    )
            else:
                eleitores_selecionados = self.amostragem_aleatoria_simples(tamanho)

        elif estrategia.tipo == SamplingType.POR_COTAS:
            eleitores_selecionados = self.amostragem_por_cotas(estrategia.cotas)

        elif estrategia.tipo == SamplingType.POR_CLUSTER:
            var_cluster = estrategia.variaveis_estratificacao[0] if estrategia.variaveis_estratificacao else "regiao_administrativa"
            eleitores_selecionados = self.amostragem_por_cluster(
                tamanho,
                var_cluster
            )

        else:
            eleitores_selecionados = self.amostragem_aleatoria_simples(tamanho)

        # Construir amostra
        amostra = SelectedSample(
            id=f"amostra_{len(eleitores_selecionados)}",
            estrategia=estrategia
        )

        for i, eleitor in enumerate(eleitores_selecionados):
            estrato = {}
            for var in estrategia.variaveis_estratificacao:
                valor = eleitor.get(var, "")
                if isinstance(valor, list):
                    valor = valor[0] if valor else ""
                estrato[var] = str(valor)

            voter = SelectedVoter(
                id=eleitor.get("id", str(i)),
                nome=eleitor.get("nome", f"Eleitor {i + 1}"),
                estrato=estrato,
                ordem_selecao=i + 1
            )
            amostra.adicionar_eleitor(voter)

        return amostra

    def validar_representatividade(
        self,
        amostra: SelectedSample,
        variaveis: List[str],
        tolerancia: float = 0.05
    ) -> Dict[str, Any]:
        """
        Valida representatividade da amostra.

        Args:
            amostra: Amostra a validar
            variaveis: Variáveis a verificar
            tolerancia: Tolerância para diferença de proporções

        Returns:
            Resultado da validação
        """
        resultados = {
            "representa_populacao": True,
            "erros": [],
            "detalhes": {}
        }

        ids_amostra = set(amostra.get_ids_eleitores())
        eleitores_amostra = [e for e in self.eleitores if e.get("id") in ids_amostra]

        for var in variaveis:
            # Distribuição na população
            dist_pop = self.calcular_distribuicao(var)

            # Distribuição na amostra
            valores_amostra = []
            for e in eleitores_amostra:
                val = e.get(var, "desconhecido")
                if isinstance(val, list):
                    val = val[0] if val else "desconhecido"
                valores_amostra.append(str(val))

            contagem_amostra = Counter(valores_amostra)
            total_amostra = len(valores_amostra)

            # Comparar proporções
            erros_var = []
            for categoria, (_, prop_pop) in dist_pop.items():
                prop_amostra = contagem_amostra.get(categoria, 0) / total_amostra
                diferenca = abs(prop_pop - prop_amostra)

                if diferenca > tolerancia:
                    erros_var.append({
                        "categoria": categoria,
                        "prop_populacao": round(prop_pop, 3),
                        "prop_amostra": round(prop_amostra, 3),
                        "diferenca": round(diferenca, 3)
                    })
                    resultados["representa_populacao"] = False

            resultados["detalhes"][var] = {
                "erros": erros_var,
                "valida": len(erros_var) == 0
            }

            if erros_var:
                resultados["erros"].append(
                    f"Variável '{var}' com {len(erros_var)} categorias fora da tolerância"
                )

        return resultados
