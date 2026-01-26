# -*- coding: utf-8 -*-
"""
INTEIA - Validacao Estatistica de Amostras
Conformidade da amostra com a populacao
"""

import json
import math
import sys
import io
from typing import Dict, Any, List, Tuple, Optional
from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

# Fix encoding para Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


@dataclass
class ValidacaoResultado:
    """Resultado de validacao de uma variavel"""
    variavel: str
    conforme: bool
    prop_populacao: float
    prop_amostra: float
    diferenca: float
    tolerancia: float
    chi2: float
    valor_p: float
    n_categorias: int


class ValidadorEstatistico:
    """
    Validador estatistico de amostras eleitorais.

    Verifica conformidade da amostra com a populacao usando:
    - Comparacao de proporcoes
    - Teste chi-quadrado de aderencia
    - Margem de erro
    - Intervalos de confianca
    """

    # Variaveis padrao para validacao
    VARIAVEIS_VALIDACAO = [
        'regiao_administrativa',
        'genero',
        'faixa_etaria',
        'escolaridade',
        'renda_salarios_minimos',
        'religiao',
        'cor_raca',
        'orientacao_politica',
        'classe_social'
    ]

    def __init__(self, populacao: List[Dict], amostra: List[Dict]):
        self.populacao = populacao
        self.amostra = amostra
        self.n_populacao = len(populacao)
        self.n_amostra = len(amostra)

    def calcular_distribuicao(self, dados: List[Dict], variavel: str) -> Dict[str, Tuple[int, float]]:
        """Calcula distribuicao de uma variavel"""
        valores = []
        for e in dados:
            val = e.get(variavel, 'desconhecido')
            if isinstance(val, list):
                val = val[0] if val else 'desconhecido'
            valores.append(str(val))

        contagem = Counter(valores)
        total = len(valores)

        return {
            k: (v, v / total if total > 0 else 0)
            for k, v in contagem.items()
        }

    def teste_chi_quadrado_aderencia(
        self,
        observados: Dict[str, int],
        esperados: Dict[str, float],
        n_amostra: int
    ) -> Tuple[float, float, int]:
        """
        Teste chi-quadrado de aderencia.

        Verifica se a distribuicao observada segue a esperada.

        Returns:
            (chi2, valor_p, graus_liberdade)
        """
        chi2 = 0
        categorias_validas = 0

        for categoria in observados:
            o = observados[categoria]
            e = esperados.get(categoria, 0) * n_amostra

            if e > 0:
                chi2 += (o - e) ** 2 / e
                categorias_validas += 1

        gl = max(1, categorias_validas - 1)

        # Calcular valor-p usando aproximacao de Wilson-Hilferty
        if chi2 <= 0 or gl <= 0:
            valor_p = 1.0
        else:
            z = ((chi2 / gl) ** (1/3) - (1 - 2 / (9 * gl))) / math.sqrt(2 / (9 * gl))
            valor_p = 0.5 * (1 + math.erf(-z / math.sqrt(2)))

        return chi2, valor_p, gl

    def validar_variavel(
        self,
        variavel: str,
        tolerancia: float = 0.05
    ) -> ValidacaoResultado:
        """
        Valida uma variavel especifica.

        Args:
            variavel: Nome da variavel
            tolerancia: Tolerancia para diferenca de proporcoes

        Returns:
            Resultado da validacao
        """
        # Distribuicoes
        dist_pop = self.calcular_distribuicao(self.populacao, variavel)
        dist_amostra = self.calcular_distribuicao(self.amostra, variavel)

        # Preparar dados para chi-quadrado
        observados = {k: v[0] for k, v in dist_amostra.items()}
        esperados = {k: v[1] for k, v in dist_pop.items()}

        # Teste chi-quadrado
        chi2, valor_p, gl = self.teste_chi_quadrado_aderencia(
            observados, esperados, self.n_amostra
        )

        # Calcular maior diferenca
        maior_dif = 0
        for cat in set(list(dist_pop.keys()) + list(dist_amostra.keys())):
            prop_pop = dist_pop.get(cat, (0, 0))[1]
            prop_amostra = dist_amostra.get(cat, (0, 0))[1]
            dif = abs(prop_pop - prop_amostra)
            if dif > maior_dif:
                maior_dif = dif

        # Conformidade: valor_p > 0.05 indica que amostra segue distribuicao
        conforme = valor_p > 0.05 and maior_dif <= tolerancia

        return ValidacaoResultado(
            variavel=variavel,
            conforme=conforme,
            prop_populacao=sum(v[0] for v in dist_pop.values()) / self.n_populacao,
            prop_amostra=sum(v[0] for v in dist_amostra.values()) / self.n_amostra,
            diferenca=maior_dif,
            tolerancia=tolerancia,
            chi2=round(chi2, 4),
            valor_p=round(valor_p, 4),
            n_categorias=len(dist_pop)
        )

    def calcular_margem_erro(
        self,
        proporcao: float = 0.5,
        nivel_confianca: float = 0.95
    ) -> Dict[str, float]:
        """Calcula margem de erro para a amostra"""
        z_scores = {0.90: 1.645, 0.95: 1.96, 0.99: 2.576}
        z = z_scores.get(nivel_confianca, 1.96)

        # Erro padrao
        se = math.sqrt(proporcao * (1 - proporcao) / self.n_amostra)

        # Correcao para populacao finita
        if self.n_amostra / self.n_populacao > 0.05:
            fpc = math.sqrt((self.n_populacao - self.n_amostra) / (self.n_populacao - 1))
            se *= fpc

        margem = z * se

        return {
            'margem_erro_percentual': round(margem * 100, 2),
            'limite_inferior': round((proporcao - margem) * 100, 2),
            'limite_superior': round((proporcao + margem) * 100, 2),
            'nivel_confianca': nivel_confianca * 100,
            'erro_padrao': round(se, 4)
        }

    def validar_completo(
        self,
        variaveis: Optional[List[str]] = None,
        tolerancia: float = 0.05
    ) -> Dict[str, Any]:
        """
        Executa validacao completa da amostra.

        Args:
            variaveis: Lista de variaveis a validar (None = todas padrao)
            tolerancia: Tolerancia para diferencas

        Returns:
            Relatorio completo de validacao
        """
        if variaveis is None:
            variaveis = self.VARIAVEIS_VALIDACAO

        resultados_variaveis = []
        variaveis_conformes = 0
        variaveis_nao_conformes = 0

        detalhes_por_variavel = {}

        for var in variaveis:
            resultado = self.validar_variavel(var, tolerancia)
            resultados_variaveis.append(resultado)

            if resultado.conforme:
                variaveis_conformes += 1
            else:
                variaveis_nao_conformes += 1

            # Detalhes da distribuicao
            dist_pop = self.calcular_distribuicao(self.populacao, var)
            dist_amostra = self.calcular_distribuicao(self.amostra, var)

            comparacao = []
            for cat in sorted(set(list(dist_pop.keys()) + list(dist_amostra.keys()))):
                prop_pop = dist_pop.get(cat, (0, 0))[1]
                prop_amostra = dist_amostra.get(cat, (0, 0))[1]
                dif = prop_amostra - prop_pop

                comparacao.append({
                    'categoria': cat,
                    'populacao_pct': round(prop_pop * 100, 1),
                    'amostra_pct': round(prop_amostra * 100, 1),
                    'diferenca_pp': round(dif * 100, 1),
                    'dentro_tolerancia': abs(dif) <= tolerancia
                })

            detalhes_por_variavel[var] = {
                'conforme': resultado.conforme,
                'chi2': resultado.chi2,
                'valor_p': resultado.valor_p,
                'n_categorias': resultado.n_categorias,
                'maior_diferenca_pp': round(resultado.diferenca * 100, 1),
                'comparacao': sorted(comparacao, key=lambda x: -x['populacao_pct'])
            }

        # Margem de erro
        margem = self.calcular_margem_erro()

        # Conformidade geral
        taxa_conformidade = variaveis_conformes / len(variaveis) if variaveis else 0
        amostra_representativa = taxa_conformidade >= 0.70  # 70% das variaveis conformes

        # Score de qualidade (0-100)
        score_qualidade = 0
        if resultados_variaveis:
            # Media dos valores-p (quanto maior, melhor aderencia)
            media_p = sum(r.valor_p for r in resultados_variaveis) / len(resultados_variaveis)
            # Media inversa das diferencas (quanto menor diferenca, melhor)
            media_dif = sum(r.diferenca for r in resultados_variaveis) / len(resultados_variaveis)

            score_qualidade = min(100, max(0,
                (media_p * 50) + ((1 - media_dif / tolerancia) * 50)
            ))

        return {
            'meta': {
                'data_validacao': datetime.now().isoformat(),
                'n_populacao': self.n_populacao,
                'n_amostra': self.n_amostra,
                'proporcao_amostra': round(self.n_amostra / self.n_populacao * 100, 2),
                'variaveis_avaliadas': len(variaveis)
            },
            'resumo': {
                'amostra_representativa': amostra_representativa,
                'taxa_conformidade': round(taxa_conformidade * 100, 1),
                'variaveis_conformes': variaveis_conformes,
                'variaveis_nao_conformes': variaveis_nao_conformes,
                'score_qualidade': round(score_qualidade, 1)
            },
            'margem_erro': margem,
            'validacao_estatistica': {
                'criterio': f'Teste chi-quadrado (p > 0.05) e diferenca < {tolerancia*100}pp',
                'nivel_significancia': 0.05,
                'tolerancia_diferenca': tolerancia * 100
            },
            'detalhes': detalhes_por_variavel,
            'conclusao': self._gerar_conclusao(
                amostra_representativa,
                taxa_conformidade,
                variaveis_nao_conformes,
                detalhes_por_variavel
            )
        }

    def _gerar_conclusao(
        self,
        representativa: bool,
        taxa: float,
        n_nao_conformes: int,
        detalhes: Dict
    ) -> str:
        """Gera conclusao textual da validacao"""
        if representativa:
            return (
                f"A amostra e REPRESENTATIVA da populacao. "
                f"Taxa de conformidade: {taxa*100:.1f}%. "
                f"A distribuicao da amostra segue adequadamente a distribuicao populacional "
                f"nas principais variaveis demograficas e socioeconomicas."
            )
        else:
            # Identificar variaveis problematicas
            problemas = [v for v, d in detalhes.items() if not d['conforme']]
            return (
                f"A amostra apresenta DESVIOS em relacao a populacao. "
                f"Taxa de conformidade: {taxa*100:.1f}%. "
                f"Variaveis com desvio significativo: {', '.join(problemas[:3])}. "
                f"Recomenda-se cautela na generalizacao dos resultados."
            )


def gerar_relatorio_html_validacao(validacao: Dict[str, Any]) -> str:
    """Gera relatorio HTML da validacao"""

    # Cores para status
    cor_conforme = '#22c55e'
    cor_nao_conforme = '#ef4444'

    status_geral = 'REPRESENTATIVA' if validacao['resumo']['amostra_representativa'] else 'COM DESVIOS'
    cor_status = cor_conforme if validacao['resumo']['amostra_representativa'] else cor_nao_conforme

    # Gerar tabelas de detalhes
    tabelas_detalhes = ""
    for var, dados in validacao['detalhes'].items():
        cor_var = cor_conforme if dados['conforme'] else cor_nao_conforme
        status_var = 'Conforme' if dados['conforme'] else 'Desvio'

        linhas = ""
        for comp in dados['comparacao'][:8]:  # Top 8 categorias
            cor_linha = '' if comp['dentro_tolerancia'] else 'background: rgba(239, 68, 68, 0.1);'
            linhas += f"""
            <tr style="{cor_linha}">
                <td>{comp['categoria']}</td>
                <td>{comp['populacao_pct']}%</td>
                <td>{comp['amostra_pct']}%</td>
                <td>{comp['diferenca_pp']:+.1f}pp</td>
            </tr>
            """

        tabelas_detalhes += f"""
        <div class="card" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="font-size: 16px; text-transform: capitalize;">{var.replace('_', ' ')}</h3>
                <span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
                       background: {cor_var}20; color: {cor_var};">{status_var}</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px;">
                <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: 700;">{dados['chi2']}</div>
                    <div style="font-size: 12px; color: #64748b;">Chi-quadrado</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: 700;">{dados['valor_p']}</div>
                    <div style="font-size: 12px; color: #64748b;">Valor-p</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 20px; font-weight: 700;">{dados['maior_diferenca_pp']}pp</div>
                    <div style="font-size: 12px; color: #64748b;">Maior Diferenca</div>
                </div>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Categoria</th>
                        <th>Populacao</th>
                        <th>Amostra</th>
                        <th>Diferenca</th>
                    </tr>
                </thead>
                <tbody>
                    {linhas}
                </tbody>
            </table>
        </div>
        """

    html = f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INTEIA - Validacao Estatistica da Amostra</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --amber: #d69e2e;
            --bg-primary: #ffffff;
            --bg-secondary: #f8fafc;
            --text-primary: #0f172a;
            --text-muted: #64748b;
        }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Inter', sans-serif;
            background: var(--bg-secondary);
            color: var(--text-primary);
            line-height: 1.6;
            padding: 32px;
        }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        .header {{
            background: linear-gradient(135deg, #1e293b, #0f172a);
            color: white;
            padding: 48px;
            border-radius: 24px;
            margin-bottom: 32px;
        }}
        .header h1 {{ font-size: 32px; margin-bottom: 8px; }}
        .header p {{ opacity: 0.8; }}
        .status-box {{
            display: inline-block;
            padding: 8px 24px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 18px;
            margin-top: 16px;
            background: {cor_status};
            color: white;
        }}
        .grid {{ display: grid; gap: 24px; }}
        .grid-4 {{ grid-template-columns: repeat(4, 1fr); }}
        .grid-2 {{ grid-template-columns: repeat(2, 1fr); }}
        @media (max-width: 768px) {{
            .grid-4, .grid-2 {{ grid-template-columns: 1fr; }}
        }}
        .card {{
            background: var(--bg-primary);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}
        .kpi-card {{ text-align: center; }}
        .kpi-value {{
            font-size: 36px;
            font-weight: 700;
            color: var(--amber);
        }}
        .kpi-label {{
            font-size: 14px;
            color: var(--text-muted);
            margin-top: 4px;
        }}
        .table {{ width: 100%; border-collapse: collapse; }}
        .table th, .table td {{
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid rgba(0,0,0,0.1);
            font-size: 13px;
        }}
        .table th {{
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            font-size: 11px;
        }}
        .conclusion-box {{
            background: linear-gradient(135deg, var(--amber), #b7791f);
            color: white;
            padding: 24px;
            border-radius: 16px;
            margin-top: 32px;
        }}
        .conclusion-box h3 {{ margin-bottom: 12px; }}
        .footer {{
            text-align: center;
            padding: 32px;
            color: var(--text-muted);
            font-size: 13px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <div style="width: 48px; height: 48px; background: var(--amber); border-radius: 12px;
                     display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px;">IA</div>
                <div>
                    <span style="font-size: 24px; font-weight: 700;">INTE<span style="color: var(--amber);">IA</span></span>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8;">Inteligencia Estrategica</div>
                </div>
            </div>
            <h1>Validacao Estatistica da Amostra</h1>
            <p>Conformidade da amostra com a populacao de eleitores</p>
            <div class="status-box">AMOSTRA {status_geral}</div>
        </header>

        <section class="grid grid-4" style="margin-bottom: 32px;">
            <div class="card kpi-card">
                <div class="kpi-value">{validacao['meta']['n_amostra']}</div>
                <div class="kpi-label">Eleitores na Amostra</div>
            </div>
            <div class="card kpi-card">
                <div class="kpi-value">{validacao['meta']['n_populacao']}</div>
                <div class="kpi-label">Populacao Total</div>
            </div>
            <div class="card kpi-card">
                <div class="kpi-value">{validacao['resumo']['taxa_conformidade']}%</div>
                <div class="kpi-label">Taxa de Conformidade</div>
            </div>
            <div class="card kpi-card">
                <div class="kpi-value">{validacao['resumo']['score_qualidade']}</div>
                <div class="kpi-label">Score de Qualidade</div>
            </div>
        </section>

        <section class="grid grid-2" style="margin-bottom: 32px;">
            <div class="card">
                <h3 style="margin-bottom: 16px;">Margem de Erro</h3>
                <table class="table">
                    <tr><td>Margem de Erro</td><td><strong>+/- {validacao['margem_erro']['margem_erro_percentual']}%</strong></td></tr>
                    <tr><td>Nivel de Confianca</td><td>{validacao['margem_erro']['nivel_confianca']}%</td></tr>
                    <tr><td>Erro Padrao</td><td>{validacao['margem_erro']['erro_padrao']}</td></tr>
                    <tr><td>Intervalo</td><td>[{validacao['margem_erro']['limite_inferior']}% - {validacao['margem_erro']['limite_superior']}%]</td></tr>
                </table>
            </div>
            <div class="card">
                <h3 style="margin-bottom: 16px;">Criterios de Validacao</h3>
                <table class="table">
                    <tr><td>Teste Estatistico</td><td>Chi-quadrado de aderencia</td></tr>
                    <tr><td>Nivel de Significancia</td><td>0.05 (5%)</td></tr>
                    <tr><td>Tolerancia Diferenca</td><td>{validacao['validacao_estatistica']['tolerancia_diferenca']}pp</td></tr>
                    <tr><td>Variaveis Avaliadas</td><td>{validacao['meta']['variaveis_avaliadas']}</td></tr>
                </table>
            </div>
        </section>

        <section>
            <h2 style="font-size: 24px; margin-bottom: 24px;">Detalhes por Variavel</h2>
            <div class="grid grid-2">
                {tabelas_detalhes}
            </div>
        </section>

        <div class="conclusion-box">
            <h3>Conclusao da Validacao</h3>
            <p>{validacao['conclusao']}</p>
        </div>

        <footer class="footer">
            <p><strong>INTEIA - Inteligencia Estrategica</strong></p>
            <p>Validacao gerada em {validacao['meta']['data_validacao'][:10]}</p>
        </footer>
    </div>
</body>
</html>'''

    return html


def validar_amostra(
    populacao: List[Dict],
    amostra: List[Dict],
    salvar_html: bool = True,
    diretorio_saida: str = None
) -> Dict[str, Any]:
    """
    Funcao principal para validar amostra.

    Args:
        populacao: Lista de eleitores da populacao
        amostra: Lista de eleitores selecionados
        salvar_html: Se deve salvar relatorio HTML
        diretorio_saida: Diretorio para salvar arquivos

    Returns:
        Dicionario com resultados da validacao
    """
    validador = ValidadorEstatistico(populacao, amostra)
    resultado = validador.validar_completo()

    if salvar_html:
        html = gerar_relatorio_html_validacao(resultado)

        if diretorio_saida is None:
            diretorio_saida = "C:/Agentes/frontend/public/resultados-intencao-voto"

        path = Path(diretorio_saida)
        path.mkdir(parents=True, exist_ok=True)

        html_path = path / "validacao_estatistica.html"
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html)

        json_path = path / "validacao_estatistica.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(resultado, f, ensure_ascii=False, indent=2)

        print(f"Relatorio HTML salvo em: {html_path}")
        print(f"Dados JSON salvos em: {json_path}")

    return resultado


def main():
    """Executa validacao da pesquisa existente"""
    print("=" * 70)
    print("  INTEIA - Validacao Estatistica da Amostra")
    print("=" * 70)

    # Carregar populacao - versao clean com 99.5% conformidade
    print("\nCarregando populacao (versao clean 99.5%)...")
    with open("C:/Agentes/agentes/banco-eleitores-df-clean.json", 'r', encoding='utf-8') as f:
        populacao = json.load(f)
    print(f"  Populacao: {len(populacao)} eleitores")

    # Carregar amostra mais recente
    print("\nCarregando amostra...")
    dir_resultados = Path("C:/Agentes/frontend/public/resultados-intencao-voto")

    # Encontrar arquivo de entrevistas mais recente
    arquivos = list(dir_resultados.glob("entrevistas_raw_*.json"))
    if not arquivos:
        print("  ERRO: Nenhum arquivo de entrevistas encontrado!")
        return

    arquivo_mais_recente = max(arquivos, key=lambda x: x.stat().st_mtime)
    print(f"  Arquivo: {arquivo_mais_recente.name}")

    with open(arquivo_mais_recente, 'r', encoding='utf-8') as f:
        entrevistas = json.load(f)

    # Extrair IDs da amostra
    ids_amostra = set(e['eleitor_id'] for e in entrevistas)
    amostra = [e for e in populacao if e.get('id') in ids_amostra]
    print(f"  Amostra: {len(amostra)} eleitores")

    # Validar
    print("\nExecutando validacao estatistica...")
    resultado = validar_amostra(populacao, amostra, salvar_html=True)

    # Resumo
    print("\n" + "=" * 70)
    print("  RESULTADO DA VALIDACAO")
    print("=" * 70)

    status = "REPRESENTATIVA" if resultado['resumo']['amostra_representativa'] else "COM DESVIOS"
    print(f"\n  Status: AMOSTRA {status}")
    print(f"  Taxa de Conformidade: {resultado['resumo']['taxa_conformidade']}%")
    print(f"  Score de Qualidade: {resultado['resumo']['score_qualidade']}/100")
    print(f"  Margem de Erro: +/- {resultado['margem_erro']['margem_erro_percentual']}%")

    print("\n  Variaveis Conformes:")
    for var, dados in resultado['detalhes'].items():
        status_var = "OK" if dados['conforme'] else "DESVIO"
        print(f"    {var}: {status_var} (p={dados['valor_p']}, dif={dados['maior_diferenca_pp']}pp)")

    print(f"\n  Conclusao: {resultado['conclusao']}")

    return resultado


if __name__ == "__main__":
    main()
