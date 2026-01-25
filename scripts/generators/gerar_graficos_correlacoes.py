"""
Gerador de Gráficos de Correlações - Pesquisa Eleitoral DF 2026
Gera visualizações para as correlações encontradas na análise
"""
import json
import os
import numpy as np
from collections import defaultdict

# Verificar e instalar dependências
try:
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from matplotlib.colors import LinearSegmentedColormap
except ImportError:
    print("Instalando matplotlib...")
    os.system("pip install matplotlib")
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from matplotlib.colors import LinearSegmentedColormap

try:
    import seaborn as sns
except ImportError:
    print("Instalando seaborn...")
    os.system("pip install seaborn")
    import seaborn as sns

# Configuração para fontes em português
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['axes.unicode_minus'] = False
plt.rcParams['figure.figsize'] = (14, 10)
plt.rcParams['figure.dpi'] = 100

# Diretórios
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTADOS_DIR = os.path.join(SCRIPT_DIR, 'resultados', 'correlacoes')

# Criar diretório de saída
os.makedirs(RESULTADOS_DIR, exist_ok=True)

print("=" * 80)
print("GERAÇÃO DE GRÁFICOS DE CORRELAÇÕES")
print("=" * 80)

# =============================================================================
# CARREGAR DADOS
# =============================================================================

def carregar_relatorio():
    """Carrega o relatório de correlações"""
    relatorio_path = os.path.join(SCRIPT_DIR, 'relatorio_correlacoes_completo.json')

    if not os.path.exists(relatorio_path):
        print(f"❌ Arquivo não encontrado: {relatorio_path}")
        return None

    with open(relatorio_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# =============================================================================
# FUNÇÕES DE GRÁFICOS
# =============================================================================

def criar_colormap_correlacao():
    """Cria colormap personalizado para correlações"""
    cores = ['#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf',
             '#e0f3f8', '#abd9e9', '#74add1', '#4575b4']
    return LinearSegmentedColormap.from_list('correlacao', cores[::-1], N=256)

def extrair_variaveis(c):
    """Extrai var1 e var2 de uma correlação independente do formato"""
    if 'vars' in c and len(c['vars']) >= 2:
        return c['vars'][0], c['vars'][1]
    return c.get('var1', c.get('variavel1', '')), c.get('var2', c.get('variavel2', ''))

def gerar_grafico_barras_horizontais(correlacoes, titulo, arquivo, top_n=15):
    """Gera gráfico de barras horizontais das correlações mais fortes"""
    if not correlacoes:
        print(f"  ⚠ Sem dados para: {titulo}")
        return

    # Ordenar por valor absoluto
    correlacoes_sorted = sorted(correlacoes, key=lambda x: abs(x.get('r', x.get('correlacao', 0))), reverse=True)[:top_n]

    if not correlacoes_sorted:
        return

    # Extrair dados
    labels = []
    valores = []
    cores = []

    for c in correlacoes_sorted:
        var1, var2 = extrair_variaveis(c)
        r = c.get('r', c.get('correlacao', 0))

        # Truncar nomes longos
        label = f"{var1[:20]} × {var2[:20]}"
        labels.append(label)
        valores.append(r)

        # Cor baseada no sinal
        if r > 0:
            cores.append('#2166ac')  # Azul para positivo
        else:
            cores.append('#b2182b')  # Vermelho para negativo

    # Criar figura
    fig, ax = plt.subplots(figsize=(12, max(6, len(labels) * 0.5)))

    y_pos = np.arange(len(labels))
    bars = ax.barh(y_pos, valores, color=cores, edgecolor='white', linewidth=0.5)

    # Configurar eixos
    ax.set_yticks(y_pos)
    ax.set_yticklabels(labels, fontsize=9)
    ax.set_xlabel('Coeficiente de Correlação (r)', fontsize=11)
    ax.set_title(titulo, fontsize=14, fontweight='bold', pad=20)

    # Linha vertical no zero
    ax.axvline(x=0, color='gray', linestyle='-', linewidth=0.5)

    # Limites do eixo x
    max_abs = max(abs(min(valores)), abs(max(valores)))
    ax.set_xlim(-max_abs - 0.1, max_abs + 0.1)

    # Adicionar valores nas barras
    for bar, valor in zip(bars, valores):
        width = bar.get_width()
        label_x = width + 0.02 if width >= 0 else width - 0.02
        ha = 'left' if width >= 0 else 'right'
        ax.text(label_x, bar.get_y() + bar.get_height()/2, f'{valor:.3f}',
                va='center', ha=ha, fontsize=8, fontweight='bold')

    # Legenda
    positivo = mpatches.Patch(color='#2166ac', label='Correlação Positiva')
    negativo = mpatches.Patch(color='#b2182b', label='Correlação Negativa')
    ax.legend(handles=[positivo, negativo], loc='lower right', fontsize=9)

    # Grid
    ax.grid(axis='x', alpha=0.3, linestyle='--')
    ax.set_axisbelow(True)

    plt.tight_layout()

    # Salvar
    caminho = os.path.join(RESULTADOS_DIR, arquivo)
    plt.savefig(caminho, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"  ✓ Salvo: {arquivo}")

def gerar_heatmap_correlacao(dados_grupo, nome_grupo, variaveis_principais=None):
    """Gera heatmap de correlação para um grupo"""
    correlacoes = dados_grupo.get('correlacoes', dados_grupo.get('correlacoes_significativas', []))

    if not correlacoes:
        print(f"  ⚠ Sem correlações para heatmap: {nome_grupo}")
        return

    # Extrair todas as variáveis únicas
    variaveis = set()
    for c in correlacoes:
        var1, var2 = extrair_variaveis(c)
        variaveis.add(var1)
        variaveis.add(var2)

    # Se especificadas variáveis principais, filtrar
    if variaveis_principais:
        variaveis = [v for v in variaveis if v in variaveis_principais]
    else:
        variaveis = list(variaveis)[:20]  # Limitar a 20 variáveis

    if len(variaveis) < 2:
        print(f"  ⚠ Poucas variáveis para heatmap: {nome_grupo}")
        return

    # Criar matriz de correlação
    n = len(variaveis)
    matriz = np.zeros((n, n))
    np.fill_diagonal(matriz, 1.0)

    var_to_idx = {v: i for i, v in enumerate(variaveis)}

    for c in correlacoes:
        var1, var2 = extrair_variaveis(c)
        r = c.get('r', c.get('correlacao', 0))

        if var1 in var_to_idx and var2 in var_to_idx:
            i, j = var_to_idx[var1], var_to_idx[var2]
            matriz[i, j] = r
            matriz[j, i] = r

    # Truncar nomes das variáveis
    labels = [v[:15] if len(v) > 15 else v for v in variaveis]

    # Criar figura
    fig, ax = plt.subplots(figsize=(max(10, n * 0.6), max(8, n * 0.5)))

    # Heatmap
    cmap = sns.diverging_palette(220, 10, as_cmap=True)
    mask = np.zeros_like(matriz)
    mask[np.triu_indices_from(mask, k=1)] = True

    sns.heatmap(matriz,
                mask=mask,
                annot=True,
                fmt='.2f',
                cmap=cmap,
                center=0,
                vmin=-1,
                vmax=1,
                square=True,
                linewidths=0.5,
                cbar_kws={'label': 'Correlação', 'shrink': 0.8},
                xticklabels=labels,
                yticklabels=labels,
                annot_kws={'size': 8},
                ax=ax)

    ax.set_title(f'Matriz de Correlações - {nome_grupo}', fontsize=14, fontweight='bold', pad=20)

    plt.xticks(rotation=45, ha='right', fontsize=9)
    plt.yticks(rotation=0, fontsize=9)

    plt.tight_layout()

    # Salvar
    arquivo = f'heatmap_{nome_grupo.lower().replace(" ", "_")}.png'
    caminho = os.path.join(RESULTADOS_DIR, arquivo)
    plt.savefig(caminho, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"  ✓ Salvo: {arquivo}")

def gerar_grafico_resumo_geral(relatorio):
    """Gera gráfico resumo com estatísticas gerais"""
    grupos = ['eleitores', 'parlamentares', 'gestores', 'candidatos']

    fig, axes = plt.subplots(2, 2, figsize=(14, 12))
    axes = axes.flatten()

    cores_grupos = {
        'eleitores': '#3498db',
        'parlamentares': '#e74c3c',
        'gestores': '#2ecc71',
        'candidatos': '#9b59b6'
    }

    for idx, grupo in enumerate(grupos):
        ax = axes[idx]
        dados = relatorio.get(grupo, {})

        correlacoes = dados.get('correlacoes', dados.get('correlacoes_significativas', []))

        if not correlacoes:
            ax.text(0.5, 0.5, f'Sem dados para {grupo}', ha='center', va='center', transform=ax.transAxes)
            ax.set_title(grupo.capitalize())
            continue

        # Distribuição dos valores de correlação
        valores_r = [abs(c.get('r', c.get('correlacao', 0))) for c in correlacoes]

        # Histograma
        ax.hist(valores_r, bins=20, color=cores_grupos[grupo], edgecolor='white', alpha=0.8)
        ax.axvline(np.mean(valores_r), color='red', linestyle='--', label=f'Média: {np.mean(valores_r):.3f}')

        ax.set_xlabel('|Correlação|')
        ax.set_ylabel('Frequência')
        ax.set_title(f'{grupo.capitalize()} (n={len(correlacoes)} correlações)', fontweight='bold')
        ax.legend(fontsize=9)
        ax.grid(alpha=0.3)

    plt.suptitle('Distribuição das Correlações Significativas por Grupo', fontsize=16, fontweight='bold', y=1.02)
    plt.tight_layout()

    # Salvar
    caminho = os.path.join(RESULTADOS_DIR, 'resumo_distribuicao_correlacoes.png')
    plt.savefig(caminho, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"  ✓ Salvo: resumo_distribuicao_correlacoes.png")

def gerar_grafico_top_correlacoes_todas(relatorio):
    """Gera gráfico consolidado das top correlações de todos os grupos"""
    todas_correlacoes = []

    for grupo in ['eleitores', 'parlamentares', 'gestores', 'candidatos']:
        dados = relatorio.get(grupo, {})
        correlacoes = dados.get('correlacoes', dados.get('correlacoes_significativas', []))

        for c in correlacoes:
            c_copy = c.copy()
            c_copy['grupo'] = grupo
            todas_correlacoes.append(c_copy)

    # Ordenar por valor absoluto
    todas_correlacoes.sort(key=lambda x: abs(x.get('r', x.get('correlacao', 0))), reverse=True)
    top_20 = todas_correlacoes[:20]

    if not top_20:
        print("  ⚠ Sem correlações para gráfico consolidado")
        return

    # Criar figura
    fig, ax = plt.subplots(figsize=(14, 10))

    cores_grupos = {
        'eleitores': '#3498db',
        'parlamentares': '#e74c3c',
        'gestores': '#2ecc71',
        'candidatos': '#9b59b6'
    }

    labels = []
    valores = []
    cores = []

    for c in top_20:
        var1, var2 = extrair_variaveis(c)
        r = c.get('r', c.get('correlacao', 0))
        grupo = c.get('grupo', '')

        label = f"[{grupo[:3].upper()}] {var1[:15]} × {var2[:15]}"
        labels.append(label)
        valores.append(r)
        cores.append(cores_grupos.get(grupo, 'gray'))

    y_pos = np.arange(len(labels))
    bars = ax.barh(y_pos, valores, color=cores, edgecolor='white', linewidth=0.5)

    ax.set_yticks(y_pos)
    ax.set_yticklabels(labels, fontsize=9)
    ax.set_xlabel('Coeficiente de Correlação (r)', fontsize=11)
    ax.set_title('Top 20 Correlações Mais Fortes - Todos os Grupos', fontsize=14, fontweight='bold', pad=20)

    ax.axvline(x=0, color='gray', linestyle='-', linewidth=0.5)

    # Legenda
    patches = [mpatches.Patch(color=cor, label=grupo.capitalize())
               for grupo, cor in cores_grupos.items()]
    ax.legend(handles=patches, loc='lower right', fontsize=10)

    ax.grid(axis='x', alpha=0.3, linestyle='--')

    # Adicionar valores
    for bar, valor in zip(bars, valores):
        width = bar.get_width()
        label_x = width + 0.02 if width >= 0 else width - 0.02
        ha = 'left' if width >= 0 else 'right'
        ax.text(label_x, bar.get_y() + bar.get_height()/2, f'{valor:.3f}',
                va='center', ha=ha, fontsize=8, fontweight='bold')

    plt.tight_layout()

    caminho = os.path.join(RESULTADOS_DIR, 'top_correlacoes_consolidado.png')
    plt.savefig(caminho, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"  ✓ Salvo: top_correlacoes_consolidado.png")

def gerar_grafico_interpretacoes(relatorio):
    """Gera gráfico com categorias de interpretações"""
    categorias = defaultdict(list)

    for grupo in ['eleitores', 'parlamentares', 'gestores', 'candidatos']:
        dados = relatorio.get(grupo, {})
        correlacoes = dados.get('correlacoes', dados.get('correlacoes_significativas', []))

        for c in correlacoes:
            var1, var2 = extrair_variaveis(c)
            r = abs(c.get('r', c.get('correlacao', 0)))
            vars_lower = (var1 + var2).lower()

            # Categorizar baseado nas variáveis
            if 'renda' in vars_lower and 'faixa' in vars_lower:
                cat = 'Coerência esperada'
            elif 'bolsonaro' in vars_lower or 'lula' in vars_lower or 'orientacao_politica' in vars_lower:
                cat = 'Polarização política'
            elif 'renda' in vars_lower or 'escolar' in vars_lower or 'cluster' in vars_lower:
                cat = 'Fatores socioeconômicos'
            elif 'big5' in vars_lower or 'personalidade' in vars_lower:
                cat = 'Traços de personalidade'
            elif 'nivel_hierarquico' in vars_lower or 'podc' in vars_lower or 'iad' in vars_lower:
                cat = 'Hierarquia organizacional'
            elif 'seguidor' in vars_lower or 'midia' in vars_lower or 'mencoes' in vars_lower:
                cat = 'Visibilidade e mídia'
            elif 'valor_' in vars_lower or 'preocup' in vars_lower:
                cat = 'Valores e preocupações'
            elif 'idade' in vars_lower or 'genero' in vars_lower:
                cat = 'Fatores demográficos'
            else:
                cat = 'Outros padrões'

            categorias[cat].append(r)

    if not categorias:
        print("  ⚠ Sem categorias para gráfico de interpretações")
        return

    # Preparar dados
    cats = list(categorias.keys())
    counts = [len(categorias[c]) for c in cats]
    medias = [np.mean(categorias[c]) for c in cats]

    # Ordenar por contagem
    sorted_idx = np.argsort(counts)[::-1]
    cats = [cats[i] for i in sorted_idx]
    counts = [counts[i] for i in sorted_idx]
    medias = [medias[i] for i in sorted_idx]

    # Criar figura
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

    # Gráfico 1: Contagem
    colors = plt.cm.viridis(np.linspace(0.2, 0.8, len(cats)))
    bars1 = ax1.barh(cats, counts, color=colors, edgecolor='white')
    ax1.set_xlabel('Número de Correlações')
    ax1.set_title('Quantidade por Categoria', fontweight='bold')
    ax1.grid(axis='x', alpha=0.3)

    for bar, count in zip(bars1, counts):
        ax1.text(bar.get_width() + 0.5, bar.get_y() + bar.get_height()/2,
                str(count), va='center', fontweight='bold')

    # Gráfico 2: Força média
    bars2 = ax2.barh(cats, medias, color=colors, edgecolor='white')
    ax2.set_xlabel('Força Média da Correlação |r|')
    ax2.set_title('Intensidade por Categoria', fontweight='bold')
    ax2.grid(axis='x', alpha=0.3)

    for bar, media in zip(bars2, medias):
        ax2.text(bar.get_width() + 0.01, bar.get_y() + bar.get_height()/2,
                f'{media:.3f}', va='center', fontweight='bold')

    plt.suptitle('Análise das Categorias de Correlação', fontsize=14, fontweight='bold', y=1.02)
    plt.tight_layout()

    caminho = os.path.join(RESULTADOS_DIR, 'categorias_correlacoes.png')
    plt.savefig(caminho, dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"  ✓ Salvo: categorias_correlacoes.png")

# =============================================================================
# EXECUÇÃO PRINCIPAL
# =============================================================================

def main():
    print("\n📊 Carregando relatório de correlações...")
    relatorio = carregar_relatorio()

    if not relatorio:
        print("❌ Não foi possível carregar o relatório")
        return

    print(f"✓ Relatório carregado com sucesso")
    print(f"  - Grupos: {list(relatorio.keys())}")

    print("\n" + "=" * 60)
    print("GERANDO GRÁFICOS")
    print("=" * 60)

    # 1. Gráficos de barras por grupo
    print("\n📊 Gráficos de barras horizontais (top correlações)...")

    for grupo in ['eleitores', 'parlamentares', 'gestores', 'candidatos']:
        dados = relatorio.get(grupo, {})
        correlacoes = dados.get('correlacoes', dados.get('correlacoes_significativas', []))

        if correlacoes:
            gerar_grafico_barras_horizontais(
                correlacoes,
                f'Top Correlações - {grupo.capitalize()}',
                f'barras_{grupo}.png',
                top_n=15
            )

    # 2. Heatmaps
    print("\n🔥 Heatmaps de correlação...")

    # Variáveis principais para cada grupo
    vars_eleitores = ['idade', 'escolaridade', 'renda_faixa', 'orientacao_politica',
                      'interesse_politico', 'suscept_desinformacao', 'posicao_bolsonaro', 'posicao_lula']
    vars_parlamentares = ['orientacao_politica', 'posicao_bolsonaro', 'posicao_lula',
                         'big5_abertura', 'big5_conscienciosidade', 'seguidores', 'taxa_presenca']
    vars_gestores = ['nivel_hierarquico', 'idade', 'iad', 'podc_planejar',
                    'podc_organizar', 'podc_dirigir', 'podc_controlar']
    vars_candidatos = ['orientacao_politica', 'conhecimento', 'intencao_voto',
                      'rejeicao', 'posicao_bolsonaro', 'posicao_lula']

    gerar_heatmap_correlacao(relatorio.get('eleitores', {}), 'Eleitores', vars_eleitores)
    gerar_heatmap_correlacao(relatorio.get('parlamentares', {}), 'Parlamentares', vars_parlamentares)
    gerar_heatmap_correlacao(relatorio.get('gestores', {}), 'Gestores', vars_gestores)
    gerar_heatmap_correlacao(relatorio.get('candidatos', {}), 'Candidatos', vars_candidatos)

    # 3. Gráfico resumo geral
    print("\n📈 Gráfico de distribuição geral...")
    gerar_grafico_resumo_geral(relatorio)

    # 4. Top correlações consolidado
    print("\n🏆 Top correlações consolidadas...")
    gerar_grafico_top_correlacoes_todas(relatorio)

    # 5. Categorias de interpretação
    print("\n🏷️ Categorias de correlação...")
    gerar_grafico_interpretacoes(relatorio)

    # Resumo final
    print("\n" + "=" * 60)
    print("RESUMO DA GERAÇÃO DE GRÁFICOS")
    print("=" * 60)

    arquivos_gerados = os.listdir(RESULTADOS_DIR)
    print(f"\n✓ Total de gráficos gerados: {len(arquivos_gerados)}")
    print(f"✓ Diretório de saída: {RESULTADOS_DIR}")
    print("\nArquivos gerados:")
    for arq in sorted(arquivos_gerados):
        tamanho = os.path.getsize(os.path.join(RESULTADOS_DIR, arq)) / 1024
        print(f"  - {arq} ({tamanho:.1f} KB)")

    # Criar arquivo de índice JSON
    indice = {
        'graficos_gerados': arquivos_gerados,
        'diretorio': RESULTADOS_DIR,
        'grupos': ['eleitores', 'parlamentares', 'gestores', 'candidatos'],
        'tipos_graficos': ['barras_horizontais', 'heatmap', 'distribuicao', 'consolidado', 'categorias']
    }

    with open(os.path.join(RESULTADOS_DIR, 'indice_graficos.json'), 'w', encoding='utf-8') as f:
        json.dump(indice, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Índice salvo em: indice_graficos.json")

if __name__ == "__main__":
    main()
