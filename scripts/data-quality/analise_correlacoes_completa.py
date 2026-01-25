"""
Análise Completa de Correlações - Eleitores, Parlamentares, Gestores e Candidatos
"""
import json
import os
import numpy as np
from collections import Counter
from itertools import combinations
import warnings
warnings.filterwarnings('ignore')

# Tentar importar scipy para correlação de Spearman e p-values
try:
    from scipy import stats
    from scipy.stats import spearmanr, pearsonr, chi2_contingency, pointbiserialr
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False
    print("⚠ scipy não disponível - usando correlação simplificada")

print("=" * 80)
print("ANÁLISE COMPLETA DE CORRELAÇÕES")
print("=" * 80)

# =============================================================================
# FUNÇÕES AUXILIARES
# =============================================================================

def codificar_categorica(valores, mapeamento=None):
    """Converte variável categórica para numérica"""
    if mapeamento:
        return [mapeamento.get(v, 0) for v in valores]

    unicos = list(set(valores))
    mapa = {v: i for i, v in enumerate(unicos)}
    return [mapa.get(v, 0) for v in valores], mapa

def correlacao_pearson(x, y):
    """Calcula correlação de Pearson"""
    x = np.array(x, dtype=float)
    y = np.array(y, dtype=float)

    # Remover NaN
    mask = ~(np.isnan(x) | np.isnan(y))
    x, y = x[mask], y[mask]

    if len(x) < 3:
        return 0, 1

    if HAS_SCIPY:
        r, p = pearsonr(x, y)
        return r, p
    else:
        # Correlação manual
        n = len(x)
        mean_x, mean_y = np.mean(x), np.mean(y)
        std_x, std_y = np.std(x), np.std(y)
        if std_x == 0 or std_y == 0:
            return 0, 1
        r = np.sum((x - mean_x) * (y - mean_y)) / (n * std_x * std_y)
        return r, 0.05 if abs(r) > 0.1 else 0.5

def correlacao_spearman(x, y):
    """Calcula correlação de Spearman (para ordinais)"""
    x = np.array(x, dtype=float)
    y = np.array(y, dtype=float)

    mask = ~(np.isnan(x) | np.isnan(y))
    x, y = x[mask], y[mask]

    if len(x) < 3:
        return 0, 1

    if HAS_SCIPY:
        r, p = spearmanr(x, y)
        return r, p
    else:
        return correlacao_pearson(x, y)

def cramers_v(x, y):
    """Calcula V de Cramér para variáveis categóricas"""
    if not HAS_SCIPY:
        return 0, 1

    # Criar tabela de contingência
    categorias_x = list(set(x))
    categorias_y = list(set(y))

    tabela = np.zeros((len(categorias_x), len(categorias_y)))
    for i, cx in enumerate(categorias_x):
        for j, cy in enumerate(categorias_y):
            tabela[i, j] = sum(1 for a, b in zip(x, y) if a == cx and b == cy)

    try:
        chi2, p, dof, expected = chi2_contingency(tabela)
        n = sum(sum(row) for row in tabela)
        min_dim = min(len(categorias_x) - 1, len(categorias_y) - 1)
        if min_dim == 0:
            return 0, 1
        v = np.sqrt(chi2 / (n * min_dim))
        return v, p
    except:
        return 0, 1

def interpretar_correlacao(r):
    """Interpreta força da correlação"""
    r = abs(r)
    if r >= 0.7:
        return "Forte"
    elif r >= 0.5:
        return "Moderada"
    elif r >= 0.3:
        return "Fraca"
    else:
        return "Muito fraca"

def imprimir_correlacoes(titulo, correlacoes, min_r=0.15, max_p=0.05):
    """Imprime correlações significativas formatadas"""
    print(f"\n{'='*80}")
    print(f"{titulo}")
    print(f"{'='*80}")

    # Filtrar e ordenar
    significativas = [(vars, r, p) for vars, r, p in correlacoes
                      if abs(r) >= min_r and p <= max_p]
    significativas.sort(key=lambda x: abs(x[1]), reverse=True)

    if not significativas:
        print("Nenhuma correlação significativa encontrada.")
        return []

    print(f"\nEncontradas {len(significativas)} correlações significativas (|r| >= {min_r}, p <= {max_p}):\n")

    # Agrupar por força
    fortes = [(v, r, p) for v, r, p in significativas if abs(r) >= 0.5]
    moderadas = [(v, r, p) for v, r, p in significativas if 0.3 <= abs(r) < 0.5]
    fracas = [(v, r, p) for v, r, p in significativas if 0.15 <= abs(r) < 0.3]

    if fortes:
        print(f"📊 CORRELAÇÕES FORTES (|r| >= 0.5): {len(fortes)}")
        print("-" * 70)
        for (var1, var2), r, p in fortes[:20]:
            direcao = "↑↑" if r > 0 else "↑↓"
            print(f"  {direcao} {var1} × {var2}")
            print(f"     r = {r:+.3f} | p = {p:.4f} | {interpretar_correlacao(r)}")

    if moderadas:
        print(f"\n📈 CORRELAÇÕES MODERADAS (0.3 <= |r| < 0.5): {len(moderadas)}")
        print("-" * 70)
        for (var1, var2), r, p in moderadas[:30]:
            direcao = "↑↑" if r > 0 else "↑↓"
            print(f"  {direcao} {var1} × {var2}")
            print(f"     r = {r:+.3f} | p = {p:.4f}")

    if fracas:
        print(f"\n📉 CORRELAÇÕES FRACAS (0.15 <= |r| < 0.3): {len(fracas)}")
        print("-" * 70)
        for (var1, var2), r, p in fracas[:40]:
            direcao = "↑" if r > 0 else "↓"
            print(f"  {direcao} {var1} × {var2}: r = {r:+.3f}")

    return significativas

# =============================================================================
# CARREGAR DADOS
# =============================================================================
print("\nCarregando dados...")

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)
print(f"✓ Eleitores: {len(eleitores)}")

with open('agentes/banco-deputados-federais-df.json', 'r', encoding='utf-8') as f:
    dep_federais = json.load(f)
print(f"✓ Deputados Federais: {len(dep_federais)}")

with open('agentes/banco-senadores-df.json', 'r', encoding='utf-8') as f:
    senadores = json.load(f)
print(f"✓ Senadores: {len(senadores)}")

with open('agentes/banco-deputados-distritais-df.json', 'r', encoding='utf-8') as f:
    dep_distritais = json.load(f)
print(f"✓ Deputados Distritais: {len(dep_distritais)}")

with open('agentes/banco-gestores.json', 'r', encoding='utf-8') as f:
    dados_gestores = json.load(f)
    gestores = dados_gestores['gestores']
print(f"✓ Gestores: {len(gestores)}")

with open('agentes/banco-candidatos-df-2026.json', 'r', encoding='utf-8') as f:
    dados_candidatos = json.load(f)
    candidatos = dados_candidatos['candidatos']
print(f"✓ Candidatos: {len(candidatos)}")

# =============================================================================
# MAPEAMENTOS PARA VARIÁVEIS ORDINAIS
# =============================================================================

mapa_orientacao = {
    'esquerda': 1, 'centro_esquerda': 2, 'centro-esquerda': 2,
    'centro': 3,
    'centro_direita': 4, 'centro-direita': 4,
    'direita': 5
}

mapa_posicao = {
    'opositor_forte': 1, 'critico_forte': 1,
    'opositor': 2, 'critico': 2, 'critico_moderado': 2,
    'neutro': 3,
    'apoiador_moderado': 4, 'simpatizante': 4,
    'apoiador': 5, 'apoiador_forte': 5
}

mapa_escolaridade = {
    'fundamental_ou_sem_instrucao': 1, 'fundamental': 1, 'sem_instrucao': 0,
    'medio_completo_ou_sup_incompleto': 2, 'medio': 2, 'medio_completo': 2,
    'superior_ou_pos': 3, 'superior': 3, 'superior_completo': 3,
    'pos_graduacao': 4, 'mestrado': 4, 'doutorado': 5
}

mapa_renda = {
    'ate_1': 1, 'mais_de_1_ate_2': 2, 'mais_de_2_ate_5': 3,
    'mais_de_5_ate_10': 4, 'mais_de_10_ate_20': 5, 'mais_de_20': 6
}

mapa_interesse = {
    'baixo': 1, 'medio': 2, 'alto': 3
}

mapa_genero = {
    'masculino': 0, 'feminino': 1
}

mapa_religiao = {
    'sem_religiao': 0, 'agnostico': 0, 'ateu': 0,
    'catolica': 1, 'evangelica': 2, 'espirita': 3,
    'umbanda': 4, 'candomble': 4, 'outra': 5
}

mapa_estilo_decisao = {
    'emocional': 1, 'moral': 2, 'identitario': 3,
    'pragmatico': 4, 'economico': 5
}

# =============================================================================
# 1. CORRELAÇÕES DOS ELEITORES
# =============================================================================
print("\n" + "=" * 80)
print("PROCESSANDO CORRELAÇÕES DOS ELEITORES")
print("=" * 80)

# Preparar variáveis numéricas dos eleitores
vars_eleitores = {}

# Variáveis diretas
vars_eleitores['idade'] = [e.get('idade', 30) for e in eleitores]
vars_eleitores['renda_mensal'] = [e.get('renda_mensal', 0) for e in eleitores]
vars_eleitores['filhos'] = [e.get('filhos', 0) for e in eleitores]
vars_eleitores['tempo_deslocamento'] = [e.get('tempo_deslocamento_minutos', 0) for e in eleitores]
vars_eleitores['suscept_desinformacao'] = [e.get('susceptibilidade_desinformacao_num', 2) for e in eleitores]

# Variáveis ordinais codificadas
vars_eleitores['orientacao_politica'] = [mapa_orientacao.get(e.get('orientacao_politica', ''), 3) for e in eleitores]
vars_eleitores['posicao_bolsonaro'] = [mapa_posicao.get(e.get('posicao_bolsonaro', ''), 3) for e in eleitores]
vars_eleitores['posicao_lula'] = [mapa_posicao.get(e.get('posicao_lula', ''), 3) for e in eleitores]
vars_eleitores['escolaridade'] = [mapa_escolaridade.get(e.get('escolaridade', ''), 2) for e in eleitores]
vars_eleitores['renda_faixa'] = [mapa_renda.get(e.get('renda_salarios_minimos', ''), 2) for e in eleitores]
vars_eleitores['interesse_politico'] = [mapa_interesse.get(e.get('interesse_politico', ''), 2) for e in eleitores]
vars_eleitores['genero'] = [mapa_genero.get(e.get('genero', ''), 0) for e in eleitores]
vars_eleitores['religiao'] = [mapa_religiao.get(e.get('religiao', ''), 1) for e in eleitores]
vars_eleitores['estilo_decisao'] = [mapa_estilo_decisao.get(e.get('estilo_decisao', ''), 3) for e in eleitores]

# Variáveis binárias
vars_eleitores['conflito_identitario'] = [1 if e.get('conflito_identitario') else 0 for e in eleitores]
vars_eleitores['voto_facultativo'] = [1 if e.get('voto_facultativo') else 0 for e in eleitores]

# Contagem de valores/preocupações/medos
vars_eleitores['qtd_valores'] = [len(e.get('valores', [])) for e in eleitores]
vars_eleitores['qtd_preocupacoes'] = [len(e.get('preocupacoes', [])) for e in eleitores]
vars_eleitores['qtd_medos'] = [len(e.get('medos', [])) for e in eleitores]

# Valores específicos como binários
for valor in ['Família', 'Trabalho', 'Segurança', 'Fé e religião', 'Liberdade', 'Igualdade']:
    vars_eleitores[f'valor_{valor}'] = [1 if valor in e.get('valores', []) else 0 for e in eleitores]

# Preocupações específicas
for preoc in ['Saúde', 'Segurança pública', 'Economia', 'Corrupção', 'Educação', 'Desemprego']:
    vars_eleitores[f'preoc_{preoc}'] = [1 if preoc in e.get('preocupacoes', []) else 0 for e in eleitores]

# Calcular todas as correlações
correlacoes_eleitores = []
variaveis = list(vars_eleitores.keys())

print(f"\nCalculando correlações entre {len(variaveis)} variáveis...")
print(f"Total de pares: {len(variaveis) * (len(variaveis)-1) // 2}")

for var1, var2 in combinations(variaveis, 2):
    x = vars_eleitores[var1]
    y = vars_eleitores[var2]

    r, p = correlacao_spearman(x, y)

    if not np.isnan(r):
        correlacoes_eleitores.append(((var1, var2), r, p))

# Imprimir resultados
corr_sig_eleitores = imprimir_correlacoes(
    "CORRELAÇÕES SIGNIFICATIVAS - ELEITORES",
    correlacoes_eleitores,
    min_r=0.10,
    max_p=0.05
)

# =============================================================================
# 2. CORRELAÇÕES DOS PARLAMENTARES (Deputados + Senadores)
# =============================================================================
print("\n" + "=" * 80)
print("PROCESSANDO CORRELAÇÕES DOS PARLAMENTARES")
print("=" * 80)

parlamentares = dep_federais + senadores + dep_distritais
print(f"\nTotal de parlamentares: {len(parlamentares)}")

vars_parl = {}

# Variáveis numéricas diretas
vars_parl['idade'] = [p.get('idade', 50) for p in parlamentares]
vars_parl['votos_eleicao'] = [p.get('votos_eleicao', 0) for p in parlamentares]
vars_parl['patrimonio'] = [p.get('patrimonio_declarado', 0) for p in parlamentares]
vars_parl['evolucao_patrimonial'] = [p.get('evolucao_patrimonial_percentual', 0) for p in parlamentares]
vars_parl['taxa_presenca'] = [p.get('taxa_presenca_plenario', 0) for p in parlamentares]
vars_parl['total_projetos'] = [p.get('total_projetos_autoria', 0) for p in parlamentares]
vars_parl['projetos_aprovados'] = [p.get('projetos_aprovados', 0) for p in parlamentares]
vars_parl['gastos_gabinete'] = [p.get('gastos_gabinete_mensal', 0) for p in parlamentares]
vars_parl['seguidores'] = [p.get('seguidores_total', 0) for p in parlamentares]
vars_parl['mencoes_midia'] = [p.get('mencoes_midia_mes', 0) for p in parlamentares]
vars_parl['nivel_carisma'] = [p.get('nivel_carisma', 5) for p in parlamentares]
vars_parl['intelig_emocional'] = [p.get('inteligencia_emocional', 5) for p in parlamentares]
vars_parl['tendencia_populismo'] = [p.get('tendencia_populismo', 5) for p in parlamentares]
vars_parl['influencia_partido'] = [p.get('influencia_no_partido', 5) for p in parlamentares]

# Big Five
for dim in ['abertura', 'conscienciosidade', 'extroversao', 'amabilidade', 'neuroticismo']:
    vars_parl[f'big5_{dim}'] = [p.get('big_five', {}).get(dim, 5) for p in parlamentares]

# Variáveis ordinais
vars_parl['orientacao_politica'] = [mapa_orientacao.get(p.get('orientacao_politica', ''), 3) for p in parlamentares]
vars_parl['posicao_bolsonaro'] = [mapa_posicao.get(p.get('posicao_bolsonaro', ''), 3) for p in parlamentares]
vars_parl['posicao_lula'] = [mapa_posicao.get(p.get('posicao_lula', ''), 3) for p in parlamentares]
vars_parl['genero'] = [mapa_genero.get(p.get('genero', ''), 0) for p in parlamentares]

# Binárias
vars_parl['ficha_limpa'] = [1 if p.get('ficha_limpa', True) else 0 for p in parlamentares]
vars_parl['fake_news'] = [1 if p.get('fake_news_associadas', False) else 0 for p in parlamentares]

# Calcular correlações
correlacoes_parl = []
variaveis_parl = list(vars_parl.keys())

print(f"\nCalculando correlações entre {len(variaveis_parl)} variáveis...")

for var1, var2 in combinations(variaveis_parl, 2):
    x = vars_parl[var1]
    y = vars_parl[var2]

    r, p = correlacao_spearman(x, y)

    if not np.isnan(r):
        correlacoes_parl.append(((var1, var2), r, p))

corr_sig_parl = imprimir_correlacoes(
    "CORRELAÇÕES SIGNIFICATIVAS - PARLAMENTARES",
    correlacoes_parl,
    min_r=0.30,  # Threshold maior por ter menos dados
    max_p=0.10
)

# =============================================================================
# 3. CORRELAÇÕES DOS GESTORES
# =============================================================================
print("\n" + "=" * 80)
print("PROCESSANDO CORRELAÇÕES DOS GESTORES")
print("=" * 80)

print(f"\nTotal de gestores: {len(gestores)}")

vars_gest = {}

# Variáveis numéricas diretas
vars_gest['idade'] = [g.get('idade', 45) for g in gestores]
vars_gest['iad'] = [g.get('iad', 1) for g in gestores]

# PODC
vars_gest['podc_planejar'] = [g.get('distribuicao_podc', {}).get('planejar', 25) for g in gestores]
vars_gest['podc_organizar'] = [g.get('distribuicao_podc', {}).get('organizar', 25) for g in gestores]
vars_gest['podc_dirigir'] = [g.get('distribuicao_podc', {}).get('dirigir', 25) for g in gestores]
vars_gest['podc_controlar'] = [g.get('distribuicao_podc', {}).get('controlar', 25) for g in gestores]

# Variáveis categóricas codificadas
mapa_setor = {'publico': 0, 'privado': 1}
mapa_nivel = {'operacional': 1, 'tatico': 2, 'estrategico': 3}
mapa_estilo_lid = {
    'laissez_faire': 1, 'democratico': 2, 'coordenativo': 3,
    'servical': 3, 'transacional': 4, 'tecnico': 4,
    'transformacional': 5, 'pragmatico': 3
}

vars_gest['setor'] = [mapa_setor.get(g.get('setor', ''), 0) for g in gestores]
vars_gest['nivel_hierarquico'] = [mapa_nivel.get(g.get('nivel_hierarquico', ''), 2) for g in gestores]
vars_gest['genero'] = [mapa_genero.get(g.get('genero', ''), 0) for g in gestores]
vars_gest['estilo_lideranca'] = [mapa_estilo_lid.get(g.get('estilo_lideranca', ''), 3) for g in gestores]

# Calcular correlações
correlacoes_gest = []
variaveis_gest = list(vars_gest.keys())

print(f"\nCalculando correlações entre {len(variaveis_gest)} variáveis...")

for var1, var2 in combinations(variaveis_gest, 2):
    x = vars_gest[var1]
    y = vars_gest[var2]

    r, p = correlacao_spearman(x, y)

    if not np.isnan(r):
        correlacoes_gest.append(((var1, var2), r, p))

corr_sig_gest = imprimir_correlacoes(
    "CORRELAÇÕES SIGNIFICATIVAS - GESTORES",
    correlacoes_gest,
    min_r=0.15,
    max_p=0.05
)

# =============================================================================
# 4. CORRELAÇÕES DOS CANDIDATOS
# =============================================================================
print("\n" + "=" * 80)
print("PROCESSANDO CORRELAÇÕES DOS CANDIDATOS")
print("=" * 80)

print(f"\nTotal de candidatos: {len(candidatos)}")

vars_cand = {}

# Variáveis numéricas
vars_cand['idade'] = [c.get('idade') or 50 for c in candidatos]
vars_cand['intencao_voto'] = [c.get('intencao_voto_pesquisa') or 0 for c in candidatos]
vars_cand['rejeicao'] = [c.get('rejeicao_estimada') or 0 for c in candidatos]
vars_cand['conhecimento'] = [c.get('conhecimento_estimado') or 0 for c in candidatos]

# Variáveis categóricas
vars_cand['orientacao_politica'] = [mapa_orientacao.get(c.get('orientacao_politica', ''), 3) for c in candidatos]
vars_cand['posicao_bolsonaro'] = [mapa_posicao.get(c.get('posicao_bolsonaro', ''), 3) for c in candidatos]
vars_cand['posicao_lula'] = [mapa_posicao.get(c.get('posicao_lula', ''), 3) for c in candidatos]
vars_cand['genero'] = [mapa_genero.get(c.get('genero', ''), 0) for c in candidatos]
vars_cand['elegivel'] = [1 if c.get('elegivel', True) else 0 for c in candidatos]

mapa_prob = {'muito_baixa': 1, 'baixa': 2, 'media': 3, 'alta': 4, 'muito_alta': 5}
vars_cand['prob_candidatura'] = [mapa_prob.get(c.get('probabilidade_candidatura', ''), 3) for c in candidatos]

# Calcular correlações
correlacoes_cand = []
variaveis_cand = list(vars_cand.keys())

print(f"\nCalculando correlações entre {len(variaveis_cand)} variáveis...")

for var1, var2 in combinations(variaveis_cand, 2):
    x = vars_cand[var1]
    y = vars_cand[var2]

    r, p = correlacao_spearman(x, y)

    if not np.isnan(r):
        correlacoes_cand.append(((var1, var2), r, p))

corr_sig_cand = imprimir_correlacoes(
    "CORRELAÇÕES SIGNIFICATIVAS - CANDIDATOS",
    correlacoes_cand,
    min_r=0.40,  # Threshold alto por poucos dados
    max_p=0.20
)

# =============================================================================
# RESUMO CONSOLIDADO
# =============================================================================
print("\n" + "=" * 80)
print("RESUMO CONSOLIDADO DE CORRELAÇÕES")
print("=" * 80)

print(f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                         ANÁLISE DE CORRELAÇÕES                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ELEITORES (n={len(eleitores):,}):                                                       ║
║    • Variáveis analisadas: {len(variaveis)}                                            ║
║    • Pares testados: {len(correlacoes_eleitores):,}                                              ║
║    • Correlações significativas: {len(corr_sig_eleitores)}                                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  PARLAMENTARES (n={len(parlamentares)}):                                                      ║
║    • Variáveis analisadas: {len(variaveis_parl)}                                            ║
║    • Pares testados: {len(correlacoes_parl)}                                               ║
║    • Correlações significativas: {len(corr_sig_parl)}                                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  GESTORES (n={len(gestores)}):                                                         ║
║    • Variáveis analisadas: {len(variaveis_gest)}                                            ║
║    • Pares testados: {len(correlacoes_gest)}                                                ║
║    • Correlações significativas: {len(corr_sig_gest)}                                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  CANDIDATOS (n={len(candidatos)}):                                                        ║
║    • Variáveis analisadas: {len(variaveis_cand)}                                            ║
║    • Pares testados: {len(correlacoes_cand)}                                                ║
║    • Correlações significativas: {len(corr_sig_cand)}                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
""")

# =============================================================================
# INSIGHTS PRINCIPAIS
# =============================================================================
print("\n" + "=" * 80)
print("INSIGHTS PRINCIPAIS")
print("=" * 80)

print("""
📊 ELEITORES - Principais descobertas:
""")

# Top correlações de eleitores
for (var1, var2), r, p in sorted(corr_sig_eleitores, key=lambda x: abs(x[1]), reverse=True)[:10]:
    sinal = "positiva" if r > 0 else "negativa"
    print(f"  • {var1} ↔ {var2}: correlação {sinal} ({r:+.3f})")

print("""
📊 PARLAMENTARES - Principais descobertas:
""")

for (var1, var2), r, p in sorted(corr_sig_parl, key=lambda x: abs(x[1]), reverse=True)[:10]:
    sinal = "positiva" if r > 0 else "negativa"
    print(f"  • {var1} ↔ {var2}: correlação {sinal} ({r:+.3f})")

print("""
📊 GESTORES - Principais descobertas:
""")

for (var1, var2), r, p in sorted(corr_sig_gest, key=lambda x: abs(x[1]), reverse=True)[:10]:
    sinal = "positiva" if r > 0 else "negativa"
    print(f"  • {var1} ↔ {var2}: correlação {sinal} ({r:+.3f})")

# Salvar resultados em JSON
resultados = {
    'eleitores': {
        'n': len(eleitores),
        'variaveis': len(variaveis),
        'correlacoes': [{'vars': list(v), 'r': float(r), 'p': float(p)}
                       for v, r, p in corr_sig_eleitores]
    },
    'parlamentares': {
        'n': len(parlamentares),
        'variaveis': len(variaveis_parl),
        'correlacoes': [{'vars': list(v), 'r': float(r), 'p': float(p)}
                       for v, r, p in corr_sig_parl]
    },
    'gestores': {
        'n': len(gestores),
        'variaveis': len(variaveis_gest),
        'correlacoes': [{'vars': list(v), 'r': float(r), 'p': float(p)}
                       for v, r, p in corr_sig_gest]
    },
    'candidatos': {
        'n': len(candidatos),
        'variaveis': len(variaveis_cand),
        'correlacoes': [{'vars': list(v), 'r': float(r), 'p': float(p)}
                       for v, r, p in corr_sig_cand]
    }
}

with open('relatorio_correlacoes_completo.json', 'w', encoding='utf-8') as f:
    json.dump(resultados, f, ensure_ascii=False, indent=2)

print("\n✓ Relatório salvo em: relatorio_correlacoes_completo.json")

# =============================================================================
# GERAR GRÁFICOS AUTOMATICAMENTE
# =============================================================================

print("\n" + "=" * 80)
print("GERANDO GRÁFICOS DE CORRELAÇÃO")
print("=" * 80)

try:
    import subprocess
    script_graficos = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gerar_graficos_correlacoes.py')
    if os.path.exists(script_graficos):
        resultado = subprocess.run(['python', script_graficos], capture_output=True, text=True)
        if resultado.returncode == 0:
            print("✓ Gráficos gerados com sucesso!")
            print("  → Diretório: resultados/correlacoes/")
        else:
            print(f"⚠ Erro ao gerar gráficos: {resultado.stderr}")
    else:
        print("⚠ Script de gráficos não encontrado")
except Exception as e:
    print(f"⚠ Erro ao executar script de gráficos: {e}")

print("\n" + "=" * 80)
print("ANÁLISE COMPLETA FINALIZADA")
print("=" * 80)
print("""
Arquivos gerados:
  📊 relatorio_correlacoes_completo.json - Dados estruturados
  📈 resultados/correlacoes/ - Gráficos de visualização
     • barras_*.png - Top correlações por grupo
     • heatmap_*.png - Matrizes de correlação
     • top_correlacoes_consolidado.png - Visão geral
     • categorias_correlacoes.png - Análise por categoria
""")
