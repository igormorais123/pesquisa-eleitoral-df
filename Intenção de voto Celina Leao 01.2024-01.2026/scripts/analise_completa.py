# -*- coding: utf-8 -*-
"""
INTEIA - Inteligência Estratégica
Análise de Intenção de Voto - Celina Leão (Governador DF)
Período: Janeiro/2024 - Janeiro/2026
Autor: Igor Morais Vasconcelos
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
import json
import os

# Configurações gerais
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams['figure.figsize'] = (16, 10)
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 14
plt.rcParams['axes.titlesize'] = 18
plt.rcParams['axes.labelsize'] = 14
plt.rcParams['xtick.labelsize'] = 12
plt.rcParams['ytick.labelsize'] = 12
plt.rcParams['legend.fontsize'] = 12
plt.rcParams['axes.titleweight'] = 'bold'

# Cores da marca INTEIA
CORES = {
    'primaria': '#1a365d',      # Azul escuro
    'secundaria': '#2c5282',    # Azul médio
    'destaque': '#e53e3e',      # Vermelho
    'sucesso': '#38a169',       # Verde
    'alerta': '#d69e2e',        # Amarelo
    'neutro': '#718096',        # Cinza
    'fundo': '#f7fafc',         # Cinza claro
    'celina': '#2b6cb0',        # Azul Celina
    'arruda': '#c53030',        # Vermelho Arruda
    'grass': '#276749',         # Verde Grass
    'outros': '#a0aec0'         # Cinza outros
}

# Diretórios
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DADOS_DIR = os.path.join(BASE_DIR, 'dados')
GRAFICOS_DIR = os.path.join(BASE_DIR, 'graficos')

# Criar diretório de gráficos se não existir
os.makedirs(GRAFICOS_DIR, exist_ok=True)

def carregar_dados():
    """Carrega os dados das pesquisas eleitorais"""
    df = pd.read_csv(os.path.join(DADOS_DIR, 'pesquisas_eleitorais.csv'))
    df['data_pesquisa'] = pd.to_datetime(df['data_pesquisa'])
    df['data_divulgacao'] = pd.to_datetime(df['data_divulgacao'])
    return df

def carregar_eventos():
    """Carrega timeline de eventos"""
    with open(os.path.join(DADOS_DIR, 'eventos_timeline.json'), 'r', encoding='utf-8') as f:
        return json.load(f)

def adicionar_marca_agua(ax, fig):
    """Adiciona marca d'água INTEIA"""
    fig.text(0.99, 0.01, 'INTEIA - Igor Morais Vasconcelos',
             fontsize=9, color='gray', alpha=0.7,
             ha='right', va='bottom', style='italic')

def grafico_1_linhas_evolucao(df):
    """Gráfico 1: Evolução temporal da intenção de voto (Linhas)"""
    fig, ax = plt.subplots(figsize=(16, 9))

    # Filtrar cenário principal (cenário 1 ou melhor comparável)
    df_principal = df[df['cenario'] == 1].copy()
    df_principal = df_principal.sort_values('data_pesquisa')

    # Linha principal - Celina Leão
    ax.plot(df_principal['data_pesquisa'], df_principal['celina_leao'],
            marker='o', markersize=10, linewidth=3, color=CORES['celina'],
            label='Celina Leão (PP)', zorder=5)

    # Preencher área sob a curva
    ax.fill_between(df_principal['data_pesquisa'], df_principal['celina_leao'],
                    alpha=0.2, color=CORES['celina'])

    # Segundo colocado
    ax.plot(df_principal['data_pesquisa'], df_principal['segundo_colocado'],
            marker='s', markersize=8, linewidth=2, color=CORES['arruda'],
            label='2º Colocado', linestyle='--', alpha=0.8)

    # Linha do início do investimento em MKT
    ax.axvline(x=pd.Timestamp('2025-01-01'), color=CORES['destaque'],
               linestyle='--', linewidth=2, alpha=0.7)
    ax.text(pd.Timestamp('2025-01-15'), ax.get_ylim()[1] * 0.95,
            'Início MKT\n(Jan/2025)', fontsize=10, color=CORES['destaque'],
            fontweight='bold', ha='left')

    # Anotações nos pontos
    for idx, row in df_principal.iterrows():
        ax.annotate(f"{row['celina_leao']:.1f}%",
                   (row['data_pesquisa'], row['celina_leao']),
                   textcoords="offset points", xytext=(0, 12),
                   ha='center', fontsize=9, fontweight='bold',
                   color=CORES['primaria'])

    # Configurações
    ax.set_xlabel('Data da Pesquisa', fontsize=12, fontweight='bold')
    ax.set_ylabel('Intenção de Voto (%)', fontsize=12, fontweight='bold')
    ax.set_title('EVOLUÇÃO DA INTENÇÃO DE VOTO - CELINA LEÃO (PP)\nGoverno do Distrito Federal 2026',
                 fontsize=16, fontweight='bold', pad=20)

    ax.legend(loc='upper left', fontsize=11, framealpha=0.9)
    ax.set_ylim(0, 60)
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%b/%Y'))
    ax.xaxis.set_major_locator(mdates.MonthLocator(interval=2))
    plt.xticks(rotation=45)

    ax.grid(True, alpha=0.3)
    ax.set_facecolor(CORES['fundo'])

    adicionar_marca_agua(ax, fig)
    plt.tight_layout()
    plt.savefig(os.path.join(GRAFICOS_DIR, '01_evolucao_linhas.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ Gráfico 1: Evolução temporal (Linhas) gerado")

def grafico_2_barras_institutos(df):
    """Gráfico 2: Comparativo por Instituto de Pesquisa (Barras)"""
    fig, ax = plt.subplots(figsize=(14, 8))

    # Agrupar por instituto - última pesquisa de cada
    df_ultimo = df.sort_values('data_pesquisa').groupby('instituto').last().reset_index()

    institutos = df_ultimo['instituto']
    valores = df_ultimo['celina_leao']

    bars = ax.bar(institutos, valores, color=[CORES['celina'], CORES['secundaria'],
                                               CORES['sucesso'], CORES['alerta']][:len(institutos)],
                  edgecolor='white', linewidth=2)

    # Valores nas barras
    for bar, val in zip(bars, valores):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 1,
                f'{val:.1f}%', ha='center', va='bottom',
                fontsize=14, fontweight='bold', color=CORES['primaria'])

    # Linha de referência (média)
    media = valores.mean()
    ax.axhline(y=media, color=CORES['destaque'], linestyle='--', linewidth=2, alpha=0.7)
    ax.text(ax.get_xlim()[1] * 0.98, media + 1, f'Média: {media:.1f}%',
            ha='right', fontsize=11, color=CORES['destaque'], fontweight='bold')

    ax.set_xlabel('Instituto de Pesquisa', fontsize=12, fontweight='bold')
    ax.set_ylabel('Intenção de Voto - Celina Leão (%)', fontsize=12, fontweight='bold')
    ax.set_title('INTENÇÃO DE VOTO POR INSTITUTO DE PESQUISA\n(Última pesquisa de cada instituto)',
                 fontsize=16, fontweight='bold', pad=20)

    ax.set_ylim(0, max(valores) + 10)
    ax.set_facecolor(CORES['fundo'])
    ax.grid(True, axis='y', alpha=0.3)

    adicionar_marca_agua(ax, fig)
    plt.tight_layout()
    plt.savefig(os.path.join(GRAFICOS_DIR, '02_barras_institutos.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ Gráfico 2: Comparativo por Instituto (Barras) gerado")

def grafico_3_area_tendencia(df):
    """Gráfico 3: Área de tendência acumulada"""
    fig, ax = plt.subplots(figsize=(16, 9))

    df_principal = df[df['cenario'] == 1].copy()
    df_principal = df_principal.sort_values('data_pesquisa')

    # Áreas empilhadas
    ax.fill_between(df_principal['data_pesquisa'], 0, df_principal['celina_leao'],
                    alpha=0.7, color=CORES['celina'], label='Celina Leão')
    ax.fill_between(df_principal['data_pesquisa'], df_principal['celina_leao'],
                    df_principal['celina_leao'] + df_principal['segundo_colocado'],
                    alpha=0.7, color=CORES['arruda'], label='2º Colocado')

    # Destaque período pós-MKT
    ax.axvspan(pd.Timestamp('2025-01-01'), df_principal['data_pesquisa'].max(),
               alpha=0.1, color=CORES['sucesso'], label='Período pós-investimento MKT')

    ax.set_xlabel('Data da Pesquisa', fontsize=12, fontweight='bold')
    ax.set_ylabel('Intenção de Voto Acumulada (%)', fontsize=12, fontweight='bold')
    ax.set_title('TENDÊNCIA ACUMULADA DE INTENÇÃO DE VOTO\nCelina Leão vs 2º Colocado',
                 fontsize=16, fontweight='bold', pad=20)

    ax.legend(loc='upper left', fontsize=11)
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%b/%Y'))
    plt.xticks(rotation=45)
    ax.set_facecolor(CORES['fundo'])

    adicionar_marca_agua(ax, fig)
    plt.tight_layout()
    plt.savefig(os.path.join(GRAFICOS_DIR, '03_area_tendencia.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ Gráfico 3: Área de Tendência gerado")

def grafico_4_radar_metricas(df):
    """Gráfico 4: Radar de múltiplas métricas"""
    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(projection='polar'))

    # Métricas simuladas (baseadas nos dados disponíveis)
    categorias = ['Intenção de\nVoto', 'Liderança\nsobre 2º', 'Crescimento\n2024-2025',
                  'Presença\nMídia', 'Aprovação\nGoverno']

    # Valores normalizados (0-100)
    df_recente = df[df['data_pesquisa'] == df['data_pesquisa'].max()].iloc[0]
    df_antigo = df[df['data_pesquisa'] == df['data_pesquisa'].min()].iloc[0]

    valores = [
        min(df_recente['celina_leao'] * 2, 100),  # Intenção de voto
        min((df_recente['celina_leao'] - df_recente['segundo_colocado']) * 3, 100),  # Liderança
        min((df_recente['celina_leao'] - df_antigo['celina_leao']) * 4, 100),  # Crescimento
        75,  # Presença mídia (estimado)
        62,  # Aprovação governo (dado real)
    ]
    valores.append(valores[0])  # Fechar o radar

    angulos = np.linspace(0, 2 * np.pi, len(categorias), endpoint=False).tolist()
    angulos.append(angulos[0])

    ax.plot(angulos, valores, 'o-', linewidth=3, color=CORES['celina'], markersize=10)
    ax.fill(angulos, valores, alpha=0.25, color=CORES['celina'])

    ax.set_xticks(angulos[:-1])
    ax.set_xticklabels(categorias, fontsize=11, fontweight='bold')
    ax.set_ylim(0, 100)
    ax.set_title('RADAR DE DESEMPENHO - CELINA LEÃO\nMúltiplas Métricas Normalizadas',
                 fontsize=14, fontweight='bold', pad=20)

    adicionar_marca_agua(ax, fig)
    plt.tight_layout()
    plt.savefig(os.path.join(GRAFICOS_DIR, '04_radar_metricas.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ Gráfico 4: Radar de Métricas gerado")

def grafico_5_waterfall(df):
    """Gráfico 5: Waterfall de variações"""
    fig, ax = plt.subplots(figsize=(16, 9))

    df_principal = df[df['cenario'] == 1].copy()
    df_principal = df_principal.sort_values('data_pesquisa')

    # Calcular variações
    datas = df_principal['data_pesquisa'].dt.strftime('%b/%y').tolist()
    valores = df_principal['celina_leao'].tolist()
    variacoes = [valores[0]] + [valores[i] - valores[i-1] for i in range(1, len(valores))]

    # Cores baseadas em variação
    cores = [CORES['celina'] if i == 0 else (CORES['sucesso'] if v > 0 else CORES['destaque'])
             for i, v in enumerate(variacoes)]

    # Calcular posições para waterfall
    cumsum = np.cumsum(variacoes)
    starts = [0] + cumsum[:-1].tolist()

    bars = ax.bar(range(len(datas)), variacoes, bottom=starts, color=cores,
                  edgecolor='white', linewidth=2)

    # Conectar barras
    for i in range(len(bars) - 1):
        ax.plot([i + 0.4, i + 0.6], [cumsum[i], cumsum[i]],
                color=CORES['neutro'], linewidth=1.5, linestyle='--')

    # Valores
    for i, (bar, val, cs) in enumerate(zip(bars, variacoes, cumsum)):
        if i == 0:
            label = f'{val:.1f}%'
        else:
            label = f'{val:+.1f}%'
        ax.text(i, cs + 1, label, ha='center', fontsize=10, fontweight='bold',
                color=CORES['primaria'])

    ax.set_xticks(range(len(datas)))
    ax.set_xticklabels(datas, rotation=45, ha='right')
    ax.set_xlabel('Período', fontsize=12, fontweight='bold')
    ax.set_ylabel('Variação da Intenção de Voto (%)', fontsize=12, fontweight='bold')
    ax.set_title('WATERFALL: VARIAÇÕES NA INTENÇÃO DE VOTO\nCelina Leão - Período a Período',
                 fontsize=16, fontweight='bold', pad=20)

    # Linha de referência em zero
    ax.axhline(y=0, color=CORES['neutro'], linewidth=1)
    ax.set_facecolor(CORES['fundo'])

    adicionar_marca_agua(ax, fig)
    plt.tight_layout()
    plt.savefig(os.path.join(GRAFICOS_DIR, '05_waterfall_variacoes.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ Gráfico 5: Waterfall de Variações gerado")

def grafico_6_dispersao_correlacao(df):
    """Gráfico 6: Dispersão - Correlação tempo vs intenção"""
    fig, ax = plt.subplots(figsize=(14, 9))

    df_principal = df[df['cenario'] == 1].copy()
    df_principal = df_principal.sort_values('data_pesquisa')

    # Converter datas para numérico
    df_principal['dias'] = (df_principal['data_pesquisa'] - df_principal['data_pesquisa'].min()).dt.days

    # Separar pré e pós MKT
    marco_mkt = pd.Timestamp('2025-01-01')
    df_pre = df_principal[df_principal['data_pesquisa'] < marco_mkt]
    df_pos = df_principal[df_principal['data_pesquisa'] >= marco_mkt]

    # Scatter pré-MKT
    ax.scatter(df_pre['dias'], df_pre['celina_leao'],
               s=200, c=CORES['neutro'], alpha=0.7, label='Pré-MKT (2024)',
               edgecolors='white', linewidth=2)

    # Scatter pós-MKT
    ax.scatter(df_pos['dias'], df_pos['celina_leao'],
               s=200, c=CORES['celina'], alpha=0.9, label='Pós-MKT (2025)',
               edgecolors='white', linewidth=2)

    # Linha de tendência geral
    z = np.polyfit(df_principal['dias'], df_principal['celina_leao'], 1)
    p = np.poly1d(z)
    ax.plot(df_principal['dias'], p(df_principal['dias']),
            '--', color=CORES['destaque'], linewidth=2, label=f'Tendência (slope: {z[0]:.3f})')

    # Linha vertical do marco
    dias_marco = (marco_mkt - df_principal['data_pesquisa'].min()).days
    ax.axvline(x=dias_marco, color=CORES['alerta'], linestyle='--', linewidth=2, alpha=0.7)
    ax.text(dias_marco + 10, ax.get_ylim()[1] * 0.9, 'Jan/2025\nInício MKT',
            fontsize=10, color=CORES['alerta'], fontweight='bold')

    ax.set_xlabel('Dias desde a primeira pesquisa', fontsize=12, fontweight='bold')
    ax.set_ylabel('Intenção de Voto (%)', fontsize=12, fontweight='bold')
    ax.set_title('CORRELAÇÃO: TEMPO × INTENÇÃO DE VOTO\nAnálise de Tendência Pré e Pós Investimento em MKT',
                 fontsize=16, fontweight='bold', pad=20)

    ax.legend(loc='upper left', fontsize=11)
    ax.set_facecolor(CORES['fundo'])
    ax.grid(True, alpha=0.3)

    adicionar_marca_agua(ax, fig)
    plt.tight_layout()
    plt.savefig(os.path.join(GRAFICOS_DIR, '06_dispersao_correlacao.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ Gráfico 6: Dispersão/Correlação gerado")

def grafico_7_boxplot_cenarios(df):
    """Gráfico 7: Boxplot por cenários/institutos"""
    fig, ax = plt.subplots(figsize=(14, 8))

    institutos = df['instituto'].unique()
    dados_boxplot = [df[df['instituto'] == inst]['celina_leao'].values for inst in institutos]

    bp = ax.boxplot(dados_boxplot, labels=institutos, patch_artist=True)

    cores_inst = [CORES['celina'], CORES['secundaria'], CORES['sucesso'], CORES['alerta']]
    for patch, cor in zip(bp['boxes'], cores_inst[:len(institutos)]):
        patch.set_facecolor(cor)
        patch.set_alpha(0.7)

    for median in bp['medians']:
        median.set_color(CORES['destaque'])
        median.set_linewidth(2)

    ax.set_xlabel('Instituto de Pesquisa', fontsize=12, fontweight='bold')
    ax.set_ylabel('Intenção de Voto - Celina Leão (%)', fontsize=12, fontweight='bold')
    ax.set_title('DISTRIBUIÇÃO DA INTENÇÃO DE VOTO POR INSTITUTO\nBoxplot com Mediana, Quartis e Outliers',
                 fontsize=16, fontweight='bold', pad=20)

    ax.set_facecolor(CORES['fundo'])
    ax.grid(True, axis='y', alpha=0.3)

    adicionar_marca_agua(ax, fig)
    plt.tight_layout()
    plt.savefig(os.path.join(GRAFICOS_DIR, '07_boxplot_institutos.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ Gráfico 7: Boxplot por Instituto gerado")

def grafico_8_comparativo_candidatos(df):
    """Gráfico 8: Barras horizontais - Comparativo de candidatos"""
    fig, ax = plt.subplots(figsize=(14, 10))

    # Última pesquisa
    df_ultimo = df.sort_values('data_pesquisa').iloc[-1]

    candidatos = ['Celina Leão', df_ultimo['nome_segundo'], df_ultimo['nome_terceiro']]
    valores = [df_ultimo['celina_leao'], df_ultimo['segundo_colocado'], df_ultimo['terceiro_colocado']]

    # Remover N/A
    candidatos_limpos = []
    valores_limpos = []
    for c, v in zip(candidatos, valores):
        if c != 'N/A' and v > 0:
            candidatos_limpos.append(c)
            valores_limpos.append(v)

    cores_bar = [CORES['celina'], CORES['arruda'], CORES['grass']][:len(candidatos_limpos)]

    bars = ax.barh(candidatos_limpos, valores_limpos, color=cores_bar,
                   edgecolor='white', linewidth=2, height=0.6)

    for bar, val in zip(bars, valores_limpos):
        ax.text(val + 1, bar.get_y() + bar.get_height()/2, f'{val:.1f}%',
                va='center', fontsize=14, fontweight='bold', color=CORES['primaria'])

    ax.set_xlabel('Intenção de Voto (%)', fontsize=12, fontweight='bold')
    ax.set_title(f'COMPARATIVO DE CANDIDATOS\nÚltima Pesquisa ({df_ultimo["data_divulgacao"].strftime("%d/%m/%Y")})',
                 fontsize=16, fontweight='bold', pad=20)

    ax.set_xlim(0, max(valores_limpos) + 15)
    ax.set_facecolor(CORES['fundo'])
    ax.grid(True, axis='x', alpha=0.3)
    ax.invert_yaxis()

    adicionar_marca_agua(ax, fig)
    plt.tight_layout()
    plt.savefig(os.path.join(GRAFICOS_DIR, '08_comparativo_candidatos.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ Gráfico 8: Comparativo de Candidatos gerado")

def grafico_9_pre_pos_mkt(df):
    """Gráfico 9: Comparativo Pré vs Pós MKT"""
    fig, axes = plt.subplots(1, 2, figsize=(16, 8))

    marco_mkt = pd.Timestamp('2025-01-01')
    df_pre = df[df['data_pesquisa'] < marco_mkt]
    df_pos = df[df['data_pesquisa'] >= marco_mkt]

    # Médias
    media_pre = df_pre['celina_leao'].mean()
    media_pos = df_pos['celina_leao'].mean()

    # Gráfico de pizza comparativo
    for ax, dados, titulo, cor in [(axes[0], media_pre, 'PRÉ-MKT\n(Jul/2024 - Dez/2024)', CORES['neutro']),
                                    (axes[1], media_pos, 'PÓS-MKT\n(Jan/2025 - Jan/2026)', CORES['celina'])]:
        outros = 100 - dados
        wedges, texts, autotexts = ax.pie([dados, outros],
                                          colors=[cor, CORES['fundo']],
                                          autopct='%1.1f%%',
                                          startangle=90,
                                          explode=(0.05, 0),
                                          textprops={'fontsize': 14, 'fontweight': 'bold'})
        ax.set_title(titulo, fontsize=14, fontweight='bold', pad=10)

    fig.suptitle('IMPACTO DO INVESTIMENTO EM MARKETING\nMédia de Intenção de Voto: Antes vs Depois',
                 fontsize=16, fontweight='bold', y=1.02)

    # Adicionar texto de variação
    variacao = media_pos - media_pre
    fig.text(0.5, 0.02, f'Variação: +{variacao:.1f} pontos percentuais',
             ha='center', fontsize=14, fontweight='bold', color=CORES['sucesso'])

    adicionar_marca_agua(axes[1], fig)
    plt.tight_layout()
    plt.savefig(os.path.join(GRAFICOS_DIR, '09_pre_pos_mkt.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ Gráfico 9: Comparativo Pré vs Pós MKT gerado")

def grafico_10_timeline_eventos(df):
    """Gráfico 10: Timeline com eventos anotados"""
    fig, ax = plt.subplots(figsize=(18, 10))

    eventos = carregar_eventos()

    df_principal = df[df['cenario'] == 1].copy()
    df_principal = df_principal.sort_values('data_pesquisa')

    # Linha principal
    ax.plot(df_principal['data_pesquisa'], df_principal['celina_leao'],
            marker='o', markersize=10, linewidth=3, color=CORES['celina'],
            label='Celina Leão', zorder=5)

    # Adicionar eventos
    cores_evento = {
        'positivo': CORES['sucesso'],
        'muito_positivo': '#22543d',
        'negativo': CORES['destaque'],
        'neutro': CORES['neutro']
    }

    y_offset = 2
    for evento in eventos['eventos'][:10]:  # Limitar a 10 eventos principais
        data_evento = pd.Timestamp(evento['data'])
        if data_evento >= df_principal['data_pesquisa'].min():
            cor = cores_evento.get(evento['impacto'], CORES['neutro'])
            ax.axvline(x=data_evento, color=cor, linestyle=':', alpha=0.5)

            # Encontrar y mais próximo
            idx_proximo = (df_principal['data_pesquisa'] - data_evento).abs().idxmin()
            y_val = df_principal.loc[idx_proximo, 'celina_leao']

            ax.annotate(evento['titulo'][:25],
                       xy=(data_evento, y_val),
                       xytext=(10, y_offset * 15),
                       textcoords='offset points',
                       fontsize=8,
                       color=cor,
                       arrowprops=dict(arrowstyle='->', color=cor, alpha=0.5),
                       bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.8))
            y_offset = -y_offset if y_offset > 0 else -(y_offset - 1)

    ax.set_xlabel('Data', fontsize=12, fontweight='bold')
    ax.set_ylabel('Intenção de Voto (%)', fontsize=12, fontweight='bold')
    ax.set_title('TIMELINE: EVOLUÇÃO COM EVENTOS RELEVANTES\nAnálise de Impacto de Acontecimentos na Intenção de Voto',
                 fontsize=16, fontweight='bold', pad=20)

    ax.xaxis.set_major_formatter(mdates.DateFormatter('%b/%Y'))
    plt.xticks(rotation=45)
    ax.set_facecolor(CORES['fundo'])
    ax.grid(True, alpha=0.3)
    ax.legend(loc='upper left')

    adicionar_marca_agua(ax, fig)
    plt.tight_layout()
    plt.savefig(os.path.join(GRAFICOS_DIR, '10_timeline_eventos.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✓ Gráfico 10: Timeline com Eventos gerado")

def gerar_estatisticas(df):
    """Gera estatísticas descritivas"""
    print("\n" + "="*60)
    print("ESTATÍSTICAS DESCRITIVAS")
    print("="*60)

    print(f"\nTotal de pesquisas analisadas: {len(df)}")
    print(f"Período: {df['data_pesquisa'].min().strftime('%d/%m/%Y')} a {df['data_pesquisa'].max().strftime('%d/%m/%Y')}")
    print(f"\nInstitutos: {', '.join(df['instituto'].unique())}")

    print("\n--- Celina Leão ---")
    print(f"Mínimo: {df['celina_leao'].min():.1f}%")
    print(f"Máximo: {df['celina_leao'].max():.1f}%")
    print(f"Média: {df['celina_leao'].mean():.1f}%")
    print(f"Mediana: {df['celina_leao'].median():.1f}%")

    marco_mkt = pd.Timestamp('2025-01-01')
    df_pre = df[df['data_pesquisa'] < marco_mkt]
    df_pos = df[df['data_pesquisa'] >= marco_mkt]

    print("\n--- Análise Pré vs Pós MKT ---")
    print(f"Média Pré-MKT: {df_pre['celina_leao'].mean():.1f}%")
    print(f"Média Pós-MKT: {df_pos['celina_leao'].mean():.1f}%")
    print(f"Variação: +{df_pos['celina_leao'].mean() - df_pre['celina_leao'].mean():.1f} p.p.")

    return {
        'total_pesquisas': len(df),
        'media_geral': df['celina_leao'].mean(),
        'media_pre': df_pre['celina_leao'].mean(),
        'media_pos': df_pos['celina_leao'].mean(),
        'variacao': df_pos['celina_leao'].mean() - df_pre['celina_leao'].mean()
    }

def main():
    """Função principal"""
    print("="*60)
    print("INTEIA - Inteligência Estratégica")
    print("Análise de Intenção de Voto - Celina Leão (DF)")
    print("="*60)

    # Carregar dados
    print("\n[1/3] Carregando dados...")
    df = carregar_dados()
    print(f"    ✓ {len(df)} registros carregados")

    # Gerar gráficos
    print("\n[2/3] Gerando gráficos...")
    grafico_1_linhas_evolucao(df)
    grafico_2_barras_institutos(df)
    grafico_3_area_tendencia(df)
    grafico_4_radar_metricas(df)
    grafico_5_waterfall(df)
    grafico_6_dispersao_correlacao(df)
    grafico_7_boxplot_cenarios(df)
    grafico_8_comparativo_candidatos(df)
    grafico_9_pre_pos_mkt(df)
    grafico_10_timeline_eventos(df)

    # Estatísticas
    print("\n[3/3] Calculando estatísticas...")
    stats = gerar_estatisticas(df)

    print("\n" + "="*60)
    print("✓ ANÁLISE CONCLUÍDA COM SUCESSO!")
    print(f"  Gráficos salvos em: {GRAFICOS_DIR}")
    print("="*60)

    return stats

if __name__ == "__main__":
    main()
