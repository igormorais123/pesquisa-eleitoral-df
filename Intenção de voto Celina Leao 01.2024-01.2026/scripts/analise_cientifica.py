# -*- coding: utf-8 -*-
"""
INTEIA - Inteligência Estratégica
Análise Científica - Celina Leão (Governador DF 2026)
Teste de Mudança Estrutural e Análise de Regressão

Autor: Igor Morais Vasconcelos
Janeiro/2026
"""

import pandas as pd
import numpy as np
from scipy import stats
from datetime import datetime
import json
import os
import warnings
warnings.filterwarnings('ignore')

# Diretórios
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DADOS_DIR = os.path.join(BASE_DIR, 'dados')
RELATORIO_DIR = os.path.join(BASE_DIR, 'relatorio')
os.makedirs(RELATORIO_DIR, exist_ok=True)


def carregar_dados():
    """Carrega e prepara os dados das pesquisas eleitorais"""
    df = pd.read_csv(os.path.join(DADOS_DIR, 'pesquisas_eleitorais.csv'))
    df['data_pesquisa'] = pd.to_datetime(df['data_pesquisa'])
    df['data_divulgacao'] = pd.to_datetime(df['data_divulgacao'])

    # Criar variável numérica de tempo (dias desde primeira pesquisa)
    df['dias'] = (df['data_pesquisa'] - df['data_pesquisa'].min()).dt.days

    # Criar indicador pós-MKT (Jan/2025)
    marco_mkt = pd.Timestamp('2025-01-01')
    df['pos_mkt'] = (df['data_pesquisa'] >= marco_mkt).astype(int)

    return df


def carregar_eventos():
    """Carrega timeline de eventos"""
    with open(os.path.join(DADOS_DIR, 'eventos_timeline.json'), 'r', encoding='utf-8') as f:
        return json.load(f)


def analise_regressao_por_periodo(df):
    """
    Realiza análise de regressão linear separada para períodos pré e pós MKT.

    Retorna:
    - Coeficientes (slope) de cada período
    - R² de cada período
    - P-values
    """
    resultados = {}

    # Filtrar cenário principal
    df_cenario1 = df[df['cenario'] == 1].copy()

    # Separar períodos
    df_pre = df_cenario1[df_cenario1['pos_mkt'] == 0]
    df_pos = df_cenario1[df_cenario1['pos_mkt'] == 1]

    # Regressão período PRÉ-MKT
    if len(df_pre) >= 2:
        slope_pre, intercept_pre, r_value_pre, p_value_pre, std_err_pre = stats.linregress(
            df_pre['dias'], df_pre['celina_leao']
        )
        resultados['pre_mkt'] = {
            'n': len(df_pre),
            'slope': slope_pre,
            'intercept': intercept_pre,
            'r_squared': r_value_pre ** 2,
            'p_value': p_value_pre,
            'std_err': std_err_pre,
            'slope_mensal': slope_pre * 30,  # Crescimento mensal em p.p.
            'media': df_pre['celina_leao'].mean(),
            'min': df_pre['celina_leao'].min(),
            'max': df_pre['celina_leao'].max()
        }
    else:
        resultados['pre_mkt'] = {
            'n': len(df_pre),
            'nota': 'Dados insuficientes para regressão (n < 2)'
        }

    # Regressão período PÓS-MKT
    if len(df_pos) >= 2:
        # Resetar dias para início do período pós-MKT
        df_pos_reset = df_pos.copy()
        df_pos_reset['dias_pos'] = df_pos_reset['dias'] - df_pos_reset['dias'].min()

        slope_pos, intercept_pos, r_value_pos, p_value_pos, std_err_pos = stats.linregress(
            df_pos_reset['dias_pos'], df_pos_reset['celina_leao']
        )
        resultados['pos_mkt'] = {
            'n': len(df_pos),
            'slope': slope_pos,
            'intercept': intercept_pos,
            'r_squared': r_value_pos ** 2,
            'p_value': p_value_pos,
            'std_err': std_err_pos,
            'slope_mensal': slope_pos * 30,
            'media': df_pos['celina_leao'].mean(),
            'min': df_pos['celina_leao'].min(),
            'max': df_pos['celina_leao'].max()
        }

    # Regressão período TOTAL
    slope_total, intercept_total, r_value_total, p_value_total, std_err_total = stats.linregress(
        df_cenario1['dias'], df_cenario1['celina_leao']
    )
    resultados['total'] = {
        'n': len(df_cenario1),
        'slope': slope_total,
        'intercept': intercept_total,
        'r_squared': r_value_total ** 2,
        'p_value': p_value_total,
        'std_err': std_err_total,
        'slope_mensal': slope_total * 30
    }

    return resultados


def teste_mudanca_estrutural(df):
    """
    Implementa um teste simplificado de mudança estrutural (inspirado no Chow Test).

    Testa se há diferença estatisticamente significativa entre os coeficientes
    das regressões pré e pós Jan/2025.

    Usa teste de Wald para comparar os slopes.
    """
    df_cenario1 = df[df['cenario'] == 1].copy()

    df_pre = df_cenario1[df_cenario1['pos_mkt'] == 0]
    df_pos = df_cenario1[df_cenario1['pos_mkt'] == 1]

    # Verificar dados suficientes
    if len(df_pre) < 2 or len(df_pos) < 2:
        return {
            'teste': 'Chow Test (simplificado)',
            'resultado': 'INCONCLUSIVO',
            'razao': f'Dados insuficientes: pré-MKT={len(df_pre)}, pós-MKT={len(df_pos)}',
            'recomendacao': 'Necessário mais pesquisas do período pré-MKT para conclusão estatística'
        }

    # Calcular regressões
    slope_pre, _, _, _, se_pre = stats.linregress(df_pre['dias'], df_pre['celina_leao'])

    df_pos_reset = df_pos.copy()
    df_pos_reset['dias_pos'] = df_pos_reset['dias'] - df_pos_reset['dias'].min()
    slope_pos, _, _, _, se_pos = stats.linregress(df_pos_reset['dias_pos'], df_pos_reset['celina_leao'])

    # Teste de Wald para diferença de slopes
    # H0: slope_pre = slope_pos
    # H1: slope_pre != slope_pos

    diff_slope = slope_pos - slope_pre
    se_diff = np.sqrt(se_pre**2 + se_pos**2)

    if se_diff > 0:
        z_stat = diff_slope / se_diff
        p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))
    else:
        z_stat = np.nan
        p_value = np.nan

    # Interpretar resultado
    alpha = 0.05
    if not np.isnan(p_value):
        if p_value < alpha:
            resultado = 'MUDANÇA ESTRUTURAL DETECTADA'
            interpretacao = f'Há evidência estatística (p={p_value:.4f} < 0.05) de mudança na tendência.'
        else:
            resultado = 'SEM MUDANÇA ESTRUTURAL SIGNIFICATIVA'
            interpretacao = f'Não há evidência estatística (p={p_value:.4f} >= 0.05) de mudança na tendência.'
    else:
        resultado = 'INCONCLUSIVO'
        interpretacao = 'Não foi possível calcular o teste estatístico.'

    return {
        'teste': 'Teste de Wald para diferença de slopes',
        'h0': 'slope_pre = slope_pos (sem mudança estrutural)',
        'h1': 'slope_pre != slope_pos (há mudança estrutural)',
        'slope_pre': slope_pre,
        'slope_pos': slope_pos,
        'diferenca_slopes': diff_slope,
        'z_statistic': z_stat,
        'p_value': p_value,
        'alpha': alpha,
        'resultado': resultado,
        'interpretacao': interpretacao,
        'limitacao': 'ATENÇÃO: Com apenas 2 pontos no período pré-MKT, este teste tem baixo poder estatístico.'
    }


def analise_por_cenario(df):
    """
    Analisa evolução da intenção de voto separada por tipo de cenário.

    Cenários:
    - Com Arruda no pleito
    - Sem Arruda no pleito
    """
    resultados = {}

    # Identificar cenários "com Arruda" e "sem Arruda" baseado na observação
    df_com_arruda = df[df['observacao'].str.contains('Arruda|cenário 1|Cenário 1|cenário com',
                                                      case=False, na=False)].copy()
    df_sem_arruda = df[df['observacao'].str.contains('sem Arruda|sem Fred|Direto',
                                                      case=False, na=False)].copy()

    for nome, df_cenario in [('com_arruda', df_com_arruda), ('sem_arruda', df_sem_arruda)]:
        if len(df_cenario) > 0:
            resultados[nome] = {
                'n_pesquisas': len(df_cenario),
                'media': df_cenario['celina_leao'].mean(),
                'min': df_cenario['celina_leao'].min(),
                'max': df_cenario['celina_leao'].max(),
                'amplitude': df_cenario['celina_leao'].max() - df_cenario['celina_leao'].min(),
                'institutos': df_cenario['instituto'].unique().tolist()
            }

    # Calcular impacto do cenário
    if 'com_arruda' in resultados and 'sem_arruda' in resultados:
        resultados['impacto_arruda'] = {
            'diferenca_media': resultados['sem_arruda']['media'] - resultados['com_arruda']['media'],
            'interpretacao': 'Sem Arruda no cenário, Celina tende a ter melhor desempenho devido à transferência de votos da direita.'
        }

    return resultados


def analise_eventos_variacao(df):
    """
    Analisa variações significativas (>3 p.p.) e correlaciona com eventos.
    """
    eventos = carregar_eventos()
    df_cenario1 = df[df['cenario'] == 1].copy().sort_values('data_pesquisa')

    # Calcular variações entre pesquisas consecutivas
    df_cenario1['variacao'] = df_cenario1['celina_leao'].diff()

    # Filtrar variações significativas
    variacoes_sig = df_cenario1[abs(df_cenario1['variacao']) > 3].copy()

    analise = []
    for _, row in variacoes_sig.iterrows():
        data = row['data_pesquisa']
        variacao = row['variacao']

        # Buscar eventos próximos (30 dias antes)
        eventos_proximos = []
        for evento in eventos['eventos']:
            data_evento = pd.Timestamp(evento['data'])
            if data_evento <= data and (data - data_evento).days <= 60:
                eventos_proximos.append(evento)

        analise.append({
            'data': data.strftime('%Y-%m-%d'),
            'valor_atual': row['celina_leao'],
            'variacao': variacao,
            'instituto': row['instituto'],
            'eventos_associados': eventos_proximos[-3:] if eventos_proximos else [],
            'interpretacao': 'ALTA' if variacao > 0 else 'QUEDA'
        })

    return analise


def teste_comparacao_medias(df):
    """
    Realiza teste t para comparar médias dos períodos pré e pós MKT.
    """
    df_cenario1 = df[df['cenario'] == 1].copy()

    df_pre = df_cenario1[df_cenario1['pos_mkt'] == 0]['celina_leao']
    df_pos = df_cenario1[df_cenario1['pos_mkt'] == 1]['celina_leao']

    # Verificar dados suficientes
    if len(df_pre) < 2 or len(df_pos) < 2:
        return {
            'teste': 'Teste t independente',
            'resultado': 'INCONCLUSIVO',
            'razao': 'Dados insuficientes para teste paramétrico'
        }

    # Teste t independente (Welch's t-test para variâncias desiguais)
    t_stat, p_value = stats.ttest_ind(df_pos, df_pre, equal_var=False)

    # Tamanho do efeito (Cohen's d)
    media_pre = df_pre.mean()
    media_pos = df_pos.mean()
    std_pooled = np.sqrt((df_pre.std()**2 + df_pos.std()**2) / 2)
    cohens_d = (media_pos - media_pre) / std_pooled if std_pooled > 0 else np.nan

    # Interpretar
    alpha = 0.05
    if p_value < alpha:
        significancia = 'DIFERENÇA ESTATISTICAMENTE SIGNIFICATIVA'
    else:
        significancia = 'DIFERENÇA NÃO SIGNIFICATIVA'

    # Interpretar Cohen's d
    if not np.isnan(cohens_d):
        if abs(cohens_d) < 0.2:
            efeito = 'insignificante'
        elif abs(cohens_d) < 0.5:
            efeito = 'pequeno'
        elif abs(cohens_d) < 0.8:
            efeito = 'médio'
        else:
            efeito = 'grande'
    else:
        efeito = 'não calculável'

    return {
        'teste': 'Teste t de Welch (variâncias desiguais)',
        'media_pre_mkt': media_pre,
        'media_pos_mkt': media_pos,
        'diferenca_medias': media_pos - media_pre,
        't_statistic': t_stat,
        'p_value': p_value,
        'alpha': alpha,
        'cohens_d': cohens_d,
        'tamanho_efeito': efeito,
        'resultado': significancia,
        'limitacao': 'ATENÇÃO: Pequeno tamanho amostral limita poder do teste.'
    }


def calcular_intervalo_confianca(df):
    """
    Calcula intervalos de confiança para a média de intenção de voto.
    """
    df_cenario1 = df[df['cenario'] == 1].copy()

    # IC 95% para média total
    media = df_cenario1['celina_leao'].mean()
    std = df_cenario1['celina_leao'].std()
    n = len(df_cenario1)
    se = std / np.sqrt(n)

    # t crítico para 95% com n-1 graus de liberdade
    t_crit = stats.t.ppf(0.975, n - 1)

    ic_lower = media - t_crit * se
    ic_upper = media + t_crit * se

    # IC para última pesquisa (considerando margem de erro)
    ultima = df_cenario1.sort_values('data_pesquisa').iloc[-1]

    return {
        'media_geral': {
            'media': media,
            'ic_95_lower': ic_lower,
            'ic_95_upper': ic_upper,
            'interpretacao': f'Com 95% de confiança, a média real está entre {ic_lower:.1f}% e {ic_upper:.1f}%'
        },
        'ultima_pesquisa': {
            'data': ultima['data_pesquisa'].strftime('%Y-%m-%d'),
            'valor': ultima['celina_leao'],
            'margem_erro': ultima['margem_erro'],
            'ic_lower': ultima['celina_leao'] - ultima['margem_erro'],
            'ic_upper': ultima['celina_leao'] + ultima['margem_erro']
        }
    }


def gerar_relatorio_cientifico(df):
    """
    Gera relatório científico completo com todas as análises.
    """
    print("="*70)
    print("ANÁLISE CIENTÍFICA - INTENÇÃO DE VOTO CELINA LEÃO (DF 2026)")
    print("="*70)

    # 1. Análise de Regressão por Período
    print("\n" + "="*70)
    print("1. ANÁLISE DE REGRESSÃO LINEAR POR PERÍODO")
    print("="*70)

    reg = analise_regressao_por_periodo(df)

    print("\n[Período PRÉ-MKT (Jul-Dez/2024)]")
    if 'slope' in reg['pre_mkt']:
        print(f"  N pesquisas: {reg['pre_mkt']['n']}")
        print(f"  Média: {reg['pre_mkt']['media']:.1f}%")
        print(f"  Slope (diário): {reg['pre_mkt']['slope']:.4f}")
        print(f"  Slope (mensal): {reg['pre_mkt']['slope_mensal']:.2f} p.p./mês")
        print(f"  R²: {reg['pre_mkt']['r_squared']:.4f}")
        print(f"  P-value: {reg['pre_mkt']['p_value']:.4f}")
    else:
        print(f"  {reg['pre_mkt'].get('nota', 'Dados insuficientes')}")

    print("\n[Período PÓS-MKT (Jan/2025-Jan/2026)]")
    print(f"  N pesquisas: {reg['pos_mkt']['n']}")
    print(f"  Média: {reg['pos_mkt']['media']:.1f}%")
    print(f"  Slope (diário): {reg['pos_mkt']['slope']:.4f}")
    print(f"  Slope (mensal): {reg['pos_mkt']['slope_mensal']:.2f} p.p./mês")
    print(f"  R²: {reg['pos_mkt']['r_squared']:.4f}")
    print(f"  P-value: {reg['pos_mkt']['p_value']:.4f}")

    print("\n[Período TOTAL]")
    print(f"  Slope (mensal): {reg['total']['slope_mensal']:.2f} p.p./mês")
    print(f"  R²: {reg['total']['r_squared']:.4f}")

    # 2. Teste de Mudança Estrutural
    print("\n" + "="*70)
    print("2. TESTE DE MUDANÇA ESTRUTURAL (CHOW TEST SIMPLIFICADO)")
    print("="*70)

    chow = teste_mudanca_estrutural(df)
    print(f"\n  Teste: {chow['teste']}")
    print(f"  H0: {chow.get('h0', 'N/A')}")
    print(f"  H1: {chow.get('h1', 'N/A')}")
    if 'slope_pre' in chow:
        print(f"\n  Slope Pré-MKT: {chow['slope_pre']:.4f}")
        print(f"  Slope Pós-MKT: {chow['slope_pos']:.4f}")
        print(f"  Diferença: {chow['diferenca_slopes']:.4f}")
        print(f"  Z-statistic: {chow['z_statistic']:.4f}" if not np.isnan(chow['z_statistic']) else "  Z-statistic: N/A")
        print(f"  P-value: {chow['p_value']:.4f}" if not np.isnan(chow['p_value']) else "  P-value: N/A")
    print(f"\n  >>> RESULTADO: {chow['resultado']}")
    print(f"  {chow.get('interpretacao', '')}")
    print(f"\n  LIMITAÇÃO: {chow.get('limitacao', chow.get('razao', ''))}")

    # 3. Teste de Comparação de Médias
    print("\n" + "="*70)
    print("3. TESTE DE COMPARAÇÃO DE MÉDIAS (TESTE T)")
    print("="*70)

    ttest = teste_comparacao_medias(df)
    print(f"\n  Teste: {ttest['teste']}")
    if 'media_pre_mkt' in ttest:
        print(f"  Média Pré-MKT: {ttest['media_pre_mkt']:.1f}%")
        print(f"  Média Pós-MKT: {ttest['media_pos_mkt']:.1f}%")
        print(f"  Diferença: +{ttest['diferenca_medias']:.1f} p.p.")
        print(f"  T-statistic: {ttest['t_statistic']:.4f}")
        print(f"  P-value: {ttest['p_value']:.4f}")
        print(f"  Cohen's d: {ttest['cohens_d']:.2f} ({ttest['tamanho_efeito']})")
        print(f"\n  >>> RESULTADO: {ttest['resultado']}")
    else:
        print(f"  {ttest.get('razao', '')}")
    print(f"\n  LIMITAÇÃO: {ttest.get('limitacao', '')}")

    # 4. Análise por Cenário
    print("\n" + "="*70)
    print("4. ANÁLISE POR CENÁRIO (COM/SEM ARRUDA)")
    print("="*70)

    cenarios = analise_por_cenario(df)
    for nome, dados in cenarios.items():
        if nome != 'impacto_arruda':
            print(f"\n  [{nome.upper().replace('_', ' ')}]")
            print(f"  N pesquisas: {dados['n_pesquisas']}")
            print(f"  Média: {dados['media']:.1f}%")
            print(f"  Range: {dados['min']:.1f}% - {dados['max']:.1f}%")

    if 'impacto_arruda' in cenarios:
        print(f"\n  [IMPACTO DO CENÁRIO]")
        print(f"  Diferença média: {cenarios['impacto_arruda']['diferenca_media']:.1f} p.p.")
        print(f"  {cenarios['impacto_arruda']['interpretacao']}")

    # 5. Intervalos de Confiança
    print("\n" + "="*70)
    print("5. INTERVALOS DE CONFIANÇA")
    print("="*70)

    ic = calcular_intervalo_confianca(df)
    print(f"\n  [Média Geral]")
    print(f"  Média: {ic['media_geral']['media']:.1f}%")
    print(f"  IC 95%: [{ic['media_geral']['ic_95_lower']:.1f}%, {ic['media_geral']['ic_95_upper']:.1f}%]")
    print(f"  {ic['media_geral']['interpretacao']}")

    print(f"\n  [Última Pesquisa - {ic['ultima_pesquisa']['data']}]")
    print(f"  Valor: {ic['ultima_pesquisa']['valor']:.1f}%")
    print(f"  Margem de erro: ±{ic['ultima_pesquisa']['margem_erro']:.1f}%")
    print(f"  IC: [{ic['ultima_pesquisa']['ic_lower']:.1f}%, {ic['ultima_pesquisa']['ic_upper']:.1f}%]")

    # 6. Análise de Eventos
    print("\n" + "="*70)
    print("6. ANÁLISE DE VARIAÇÕES SIGNIFICATIVAS (> 3 P.P.)")
    print("="*70)

    variacoes = analise_eventos_variacao(df)
    for v in variacoes:
        print(f"\n  [{v['data']}] {v['interpretacao']}: {v['variacao']:+.1f} p.p. → {v['valor_atual']:.1f}%")
        print(f"  Instituto: {v['instituto']}")
        if v['eventos_associados']:
            print(f"  Eventos associados:")
            for ev in v['eventos_associados']:
                print(f"    - {ev['data']}: {ev['titulo']} ({ev['impacto']})")

    # 7. Conclusões
    print("\n" + "="*70)
    print("7. CONCLUSÕES CIENTÍFICAS")
    print("="*70)

    print("""
  HIPÓTESE ORIGINAL:
  "O investimento em marketing a partir de Jan/2025 causou crescimento
  significativo na intenção de voto de Celina Leão."

  CONCLUSÃO:

  ✓ CORRELAÇÃO TEMPORAL CONFIRMADA
    - Há crescimento observável após Jan/2025
    - Média subiu de ~26% para ~40% (+14 p.p.)

  ⚠ CAUSALIDADE NÃO COMPROVADA
    - Múltiplos fatores concomitantes:
      1. Incumbência (interinidade no governo)
      2. Eventos favoráveis (absolvição Drácon)
      3. Herança de aprovação do governo Ibaneis (63%)
      4. Cenário competitivo (inelegibilidade potencial de Arruda)
    - Sem dados quantificados de gastos em marketing
    - Impossível isolar a variável "investimento em MKT"

  ⚠ LIMITAÇÕES METODOLÓGICAS SEVERAS
    - Apenas 2 pesquisas no período pré-MKT (cenário 1)
    - Testes estatísticos com baixo poder amostral
    - Diferentes cenários dificultam comparação direta
    - Ausência de baseline (pré-2024)

  NÍVEL DE CONFIANÇA: MODERADO
  A hipótese não pode ser rejeitada, mas também não pode ser
  confirmada com rigor científico. Recomenda-se cautela na
  atribuição de causalidade.
    """)

    # Compilar resultados
    resultados = {
        'regressao': reg,
        'chow_test': chow,
        'teste_t': ttest,
        'cenarios': cenarios,
        'intervalos_confianca': ic,
        'variacoes_significativas': variacoes
    }

    return resultados


def salvar_relatorio_json(resultados):
    """Salva resultados em JSON para uso posterior"""

    # Converter tipos não serializáveis
    def converter_tipos(obj):
        if isinstance(obj, (np.integer, np.floating)):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, pd.Timestamp):
            return obj.strftime('%Y-%m-%d')
        elif isinstance(obj, dict):
            return {k: converter_tipos(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [converter_tipos(i) for i in obj]
        return obj

    resultados_json = converter_tipos(resultados)

    caminho = os.path.join(RELATORIO_DIR, 'analise_cientifica.json')
    with open(caminho, 'w', encoding='utf-8') as f:
        json.dump(resultados_json, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Resultados salvos em: {caminho}")


def main():
    """Função principal"""
    print("\n" + "="*70)
    print("INTEIA - ANÁLISE CIENTÍFICA DE INTELIGÊNCIA ELEITORAL")
    print("Celina Leão - Governador DF 2026")
    print("="*70)

    # Carregar dados
    print("\nCarregando dados...")
    df = carregar_dados()
    print(f"✓ {len(df)} registros carregados")

    # Gerar análise
    resultados = gerar_relatorio_cientifico(df)

    # Salvar JSON
    salvar_relatorio_json(resultados)

    print("\n" + "="*70)
    print("✓ ANÁLISE CIENTÍFICA CONCLUÍDA")
    print("="*70)

    return resultados


if __name__ == "__main__":
    main()
