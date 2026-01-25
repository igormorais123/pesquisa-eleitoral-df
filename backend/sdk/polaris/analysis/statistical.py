# POLARIS SDK - Statistical Tests
# Testes estatísticos inferenciais

import math
from typing import Dict, Any, List, Optional, Tuple
from collections import Counter

from ..models.report import TestResult, InferentialResults


class StatisticalTests:
    """
    Motor de testes estatísticos.

    Implementa testes comuns para análise de dados eleitorais.
    """

    def __init__(self):
        self.resultados: List[InferentialResults] = []

    def teste_chi_quadrado(
        self,
        observados: Dict[str, int],
        esperados: Optional[Dict[str, float]] = None
    ) -> TestResult:
        """
        Realiza teste chi-quadrado de aderência ou independência.

        Args:
            observados: Frequências observadas
            esperados: Frequências esperadas (se None, assume distribuição uniforme)

        Returns:
            Resultado do teste
        """
        total = sum(observados.values())
        n_categorias = len(observados)

        if esperados is None:
            # Distribuição uniforme
            esperado_uniforme = total / n_categorias
            esperados = {k: esperado_uniforme for k in observados}

        # Calcular estatística chi-quadrado
        chi2 = 0
        for categoria in observados:
            o = observados[categoria]
            e = esperados.get(categoria, total / n_categorias)
            if e > 0:
                chi2 += (o - e) ** 2 / e

        # Graus de liberdade
        gl = n_categorias - 1

        # Calcular valor-p aproximado (usando aproximação normal para gl grande)
        valor_p = self._calcular_p_chi2(chi2, gl)

        # Cramér's V para tamanho de efeito
        cramers_v = math.sqrt(chi2 / (total * (min(n_categorias, 2) - 1))) if total > 0 else 0

        return TestResult(
            teste="chi-quadrado",
            estatistica=round(chi2, 4),
            valor_p=round(valor_p, 4),
            graus_liberdade=gl,
            significativo=valor_p < 0.05,
            tamanho_efeito=round(cramers_v, 4),
            tipo_tamanho_efeito="Cramér's V",
            interpretacao=self._interpretar_chi2(valor_p, cramers_v)
        )

    def _calcular_p_chi2(self, chi2: float, gl: int) -> float:
        """
        Calcula valor-p aproximado para chi-quadrado.

        Usa aproximação de Wilson-Hilferty.
        """
        if chi2 <= 0 or gl <= 0:
            return 1.0

        # Aproximação de Wilson-Hilferty
        z = ((chi2 / gl) ** (1/3) - (1 - 2 / (9 * gl))) / math.sqrt(2 / (9 * gl))

        # Converter z para p usando aproximação da normal
        return self._normal_cdf(-z)

    def _normal_cdf(self, x: float) -> float:
        """CDF da distribuição normal padrão (aproximação)."""
        return 0.5 * (1 + math.erf(x / math.sqrt(2)))

    def _interpretar_chi2(self, p: float, v: float) -> str:
        """Interpreta resultado do chi-quadrado."""
        if p >= 0.05:
            return "Não há evidência de associação significativa entre as variáveis."

        if v < 0.1:
            forca = "fraca"
        elif v < 0.3:
            forca = "moderada"
        else:
            forca = "forte"

        return f"Há associação {forca} estatisticamente significativa (p={p:.4f}, V={v:.4f})."

    def teste_proporcoes(
        self,
        n1: int,
        p1: float,
        n2: int,
        p2: float
    ) -> TestResult:
        """
        Teste de diferença entre duas proporções.

        Args:
            n1: Tamanho do grupo 1
            p1: Proporção no grupo 1
            n2: Tamanho do grupo 2
            p2: Proporção no grupo 2

        Returns:
            Resultado do teste
        """
        # Proporção combinada
        p_combinada = (n1 * p1 + n2 * p2) / (n1 + n2)

        # Erro padrão
        se = math.sqrt(p_combinada * (1 - p_combinada) * (1/n1 + 1/n2))

        if se == 0:
            return TestResult(
                teste="z-proporcoes",
                estatistica=0,
                valor_p=1.0,
                significativo=False,
                interpretacao="Proporções idênticas"
            )

        # Estatística z
        z = (p1 - p2) / se

        # Valor-p bilateral
        valor_p = 2 * (1 - self._normal_cdf(abs(z)))

        # Intervalo de confiança para diferença
        diferenca = p1 - p2
        margem = 1.96 * se
        ic = (diferenca - margem, diferenca + margem)

        return TestResult(
            teste="z-proporcoes",
            estatistica=round(z, 4),
            valor_p=round(valor_p, 4),
            significativo=valor_p < 0.05,
            intervalo_confianca=(round(ic[0], 4), round(ic[1], 4)),
            interpretacao=self._interpretar_proporcoes(p1, p2, valor_p, ic)
        )

    def _interpretar_proporcoes(
        self,
        p1: float,
        p2: float,
        p: float,
        ic: Tuple[float, float]
    ) -> str:
        """Interpreta teste de proporções."""
        diferenca = (p1 - p2) * 100

        if p >= 0.05:
            return f"A diferença de {diferenca:.1f}pp não é estatisticamente significativa."

        direcao = "maior" if diferenca > 0 else "menor"
        return f"O grupo 1 tem proporção significativamente {direcao} ({diferenca:.1f}pp, IC: [{ic[0]*100:.1f}%, {ic[1]*100:.1f}%])."

    def margem_erro(
        self,
        n: int,
        proporcao: float = 0.5,
        nivel_confianca: float = 0.95
    ) -> Dict[str, float]:
        """
        Calcula margem de erro para uma proporção.

        Args:
            n: Tamanho da amostra
            proporcao: Proporção estimada
            nivel_confianca: Nível de confiança

        Returns:
            Margem de erro e intervalo
        """
        # Z-score para nível de confiança
        z_scores = {0.90: 1.645, 0.95: 1.96, 0.99: 2.576}
        z = z_scores.get(nivel_confianca, 1.96)

        # Erro padrão
        se = math.sqrt(proporcao * (1 - proporcao) / n)

        # Margem de erro
        margem = z * se

        return {
            "margem_erro": round(margem * 100, 2),
            "limite_inferior": round((proporcao - margem) * 100, 2),
            "limite_superior": round((proporcao + margem) * 100, 2),
            "nivel_confianca": nivel_confianca * 100
        }

    def correlacao(
        self,
        x: List[float],
        y: List[float]
    ) -> TestResult:
        """
        Calcula correlação de Pearson.

        Args:
            x: Primeira variável
            y: Segunda variável

        Returns:
            Resultado com coeficiente e significância
        """
        n = len(x)
        if n != len(y) or n < 3:
            return TestResult(
                teste="correlacao-pearson",
                estatistica=0,
                valor_p=1.0,
                significativo=False,
                interpretacao="Dados insuficientes"
            )

        # Médias
        mean_x = sum(x) / n
        mean_y = sum(y) / n

        # Covariância e variâncias
        cov = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n)) / n
        var_x = sum((xi - mean_x) ** 2 for xi in x) / n
        var_y = sum((yi - mean_y) ** 2 for yi in y) / n

        if var_x == 0 or var_y == 0:
            return TestResult(
                teste="correlacao-pearson",
                estatistica=0,
                valor_p=1.0,
                significativo=False,
                interpretacao="Variância zero"
            )

        # Coeficiente de correlação
        r = cov / math.sqrt(var_x * var_y)

        # Teste t para significância
        t = r * math.sqrt((n - 2) / (1 - r ** 2)) if abs(r) < 1 else float('inf')

        # Valor-p aproximado
        valor_p = 2 * (1 - self._t_cdf(abs(t), n - 2))

        return TestResult(
            teste="correlacao-pearson",
            estatistica=round(r, 4),
            valor_p=round(valor_p, 4),
            graus_liberdade=n - 2,
            significativo=valor_p < 0.05,
            tamanho_efeito=round(r ** 2, 4),
            tipo_tamanho_efeito="R²",
            interpretacao=self._interpretar_correlacao(r, valor_p)
        )

    def _t_cdf(self, t: float, gl: int) -> float:
        """CDF aproximada da distribuição t."""
        # Aproximação usando normal para gl >= 30
        if gl >= 30:
            return self._normal_cdf(t)

        # Aproximação simples para gl < 30
        x = gl / (gl + t ** 2)
        return 1 - 0.5 * (1 - x ** (gl / 2))

    def _interpretar_correlacao(self, r: float, p: float) -> str:
        """Interpreta coeficiente de correlação."""
        if p >= 0.05:
            return "Correlação não significativa estatisticamente."

        if abs(r) < 0.3:
            forca = "fraca"
        elif abs(r) < 0.7:
            forca = "moderada"
        else:
            forca = "forte"

        direcao = "positiva" if r > 0 else "negativa"

        return f"Correlação {forca} {direcao} (r={r:.4f}, p={p:.4f})."

    def testar_hipotese(
        self,
        hipotese_id: str,
        enunciado: str,
        dados_vi: List[Any],
        dados_vd: List[Any],
        tipo_teste: str = "auto"
    ) -> InferentialResults:
        """
        Testa uma hipótese de pesquisa.

        Args:
            hipotese_id: ID da hipótese
            enunciado: Enunciado da hipótese
            dados_vi: Dados da variável independente
            dados_vd: Dados da variável dependente
            tipo_teste: Tipo de teste a usar

        Returns:
            Resultados inferenciais
        """
        # Determinar tipo de teste automaticamente
        if tipo_teste == "auto":
            tipo_teste = self._determinar_tipo_teste(dados_vi, dados_vd)

        # Executar teste apropriado
        if tipo_teste == "chi2":
            # Criar tabela de contingência
            contagem = Counter(zip(dados_vi, dados_vd))
            observados = {str(k): v for k, v in contagem.items()}
            teste = self.teste_chi_quadrado(observados)

        elif tipo_teste == "correlacao":
            # Converter para numéricos
            x = [float(v) for v in dados_vi]
            y = [float(v) for v in dados_vd]
            teste = self.correlacao(x, y)

        else:
            # Fallback para chi-quadrado
            contagem = Counter(zip(dados_vi, dados_vd))
            observados = {str(k): v for k, v in contagem.items()}
            teste = self.teste_chi_quadrado(observados)

        resultado = InferentialResults(
            hipotese_id=hipotese_id,
            hipotese_enunciado=enunciado,
            teste_principal=teste,
            hipotese_suportada=teste.significativo,
            conclusao=self._concluir_hipotese(teste, enunciado),
            n_observacoes=len(dados_vi)
        )

        self.resultados.append(resultado)
        return resultado

    def _determinar_tipo_teste(
        self,
        dados_vi: List[Any],
        dados_vd: List[Any]
    ) -> str:
        """Determina tipo de teste apropriado."""
        # Verificar se são numéricos
        try:
            [float(v) for v in dados_vi[:10]]
            [float(v) for v in dados_vd[:10]]
            return "correlacao"
        except (ValueError, TypeError):
            return "chi2"

    def _concluir_hipotese(self, teste: TestResult, enunciado: str) -> str:
        """Gera conclusão para hipótese."""
        if teste.significativo:
            return f"Os dados suportam a hipótese. {teste.interpretacao}"
        else:
            return f"Os dados não fornecem evidência suficiente para suportar a hipótese. {teste.interpretacao}"
