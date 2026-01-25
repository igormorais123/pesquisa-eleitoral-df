#!/usr/bin/env python3
"""
Corrige inconsistencias detectadas nos perfis de eleitores
"""
import json
from collections import defaultdict

# Carregar dados
with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print("=" * 70)
print("CORRECAO DE INCONSISTENCIAS")
print("=" * 70)
print(f"Total de perfis: {len(eleitores)}\n")

correcoes = defaultdict(int)

# ============================================================
# 1. CORRIGIR FAIXA ETARIA
# ============================================================
print("[1] Corrigindo faixas etarias...")

def calcular_faixa_etaria(idade):
    """Retorna a faixa etaria correta para a idade"""
    if idade <= 17:
        return '16-17'
    elif idade <= 24:
        return '18-24'
    elif idade <= 34:
        return '25-34'
    elif idade <= 44:
        return '35-44'
    elif idade <= 59:
        return '45-59'
    elif idade <= 64:
        return '60-64'
    else:
        return '65+'

for e in eleitores:
    idade = e['idade']
    faixa_correta = calcular_faixa_etaria(idade)
    if e.get('faixa_etaria') != faixa_correta:
        e['faixa_etaria'] = faixa_correta
        correcoes['faixa_etaria'] += 1

print(f"   Corrigidas: {correcoes['faixa_etaria']} faixas etarias")

# ============================================================
# 2. CORRIGIR CLUSTER VS RENDA (ajustar RENDA para o cluster)
# O cluster foi definido com base em multiplos fatores, entao
# e melhor ajustar a renda para ser compativel
# ============================================================
print("\n[2] Corrigindo cluster vs renda...")

# Renda minima aceitavel por cluster
cluster_renda_minima = {
    'G1_alta': 'mais_de_5_ate_10',
    'G2_media_alta': 'mais_de_2_ate_5',
    'G3_media_baixa': 'mais_de_1_ate_2',
    'G4_baixa': 'ate_1',
}

# Renda tipica por cluster (para ajuste)
cluster_renda_tipica = {
    'G1_alta': 'mais_de_5_ate_10',
    'G2_media_alta': 'mais_de_2_ate_5',
    'G3_media_baixa': 'mais_de_1_ate_2',
    'G4_baixa': 'ate_1',
}

# Ordem das rendas para comparacao
ordem_renda = ['ate_1', 'mais_de_1_ate_2', 'mais_de_2_ate_5', 'mais_de_5_ate_10', 'mais_de_10_ate_20', 'mais_de_20']

for e in eleitores:
    renda = e.get('renda_salarios_minimos', '')
    cluster = e.get('cluster_socioeconomico', '')

    if cluster in cluster_renda_minima and renda in ordem_renda:
        renda_min = cluster_renda_minima[cluster]
        idx_atual = ordem_renda.index(renda)
        idx_minimo = ordem_renda.index(renda_min)

        # Cluster alto com renda muito baixa -> aumentar renda
        if cluster == 'G1_alta' and idx_atual < idx_minimo:
            e['renda_salarios_minimos'] = cluster_renda_tipica['G1_alta']
            correcoes['cluster_renda'] += 1

        # Cluster medio-alta com renda muito baixa -> aumentar renda
        elif cluster == 'G2_media_alta' and renda == 'ate_1':
            e['renda_salarios_minimos'] = cluster_renda_tipica['G2_media_alta']
            correcoes['cluster_renda'] += 1

        # Cluster baixo com renda muito alta -> diminuir renda (raro, manter)
        # Nao ajustamos pois pode ser caso real (heranca, sorte, etc)

print(f"   Corrigidas: {correcoes['cluster_renda']} incoerencias cluster/renda")

# ============================================================
# 3. CORRIGIR ORIENTACAO VS BOLSONARO (contradicoes claras)
# ============================================================
print("\n[3] Corrigindo orientacao vs posicao Bolsonaro...")

for e in eleitores:
    orientacao = e.get('orientacao_politica', '')
    posicao = e.get('posicao_bolsonaro', '')

    # Esquerda apoiando Bolsonaro fortemente -> mudar para neutro ou critico_moderado
    if orientacao == 'esquerda' and posicao == 'apoiador_forte':
        e['posicao_bolsonaro'] = 'critico_moderado'
        correcoes['orientacao_bolsonaro'] += 1

    # Direita sendo critico ferrenho -> mudar para neutro ou apoiador_moderado
    elif orientacao == 'direita' and posicao == 'critico_ferrenho':
        e['posicao_bolsonaro'] = 'neutro'
        correcoes['orientacao_bolsonaro'] += 1

print(f"   Corrigidas: {correcoes['orientacao_bolsonaro']} contradicoes orientacao/Bolsonaro")

# ============================================================
# 4. CORRIGIR ESCOLARIDADE VS RENDA (casos extremos)
# ============================================================
print("\n[4] Corrigindo escolaridade vs renda (casos extremos)...")

for e in eleitores:
    esc = e.get('escolaridade', '')
    renda = e.get('renda_salarios_minimos', '')

    # Sem instrucao com renda muito alta -> reduzir renda ou aumentar escolaridade
    # Vamos reduzir renda para ser mais realista
    if esc == 'fundamental_ou_sem_instrucao' and renda in ['mais_de_10_ate_20', 'mais_de_20']:
        e['renda_salarios_minimos'] = 'mais_de_5_ate_10'  # Ainda alto, mas mais plausivel
        # Tambem ajustar cluster
        e['cluster_socioeconomico'] = 'G2_media_alta'
        correcoes['escolaridade_renda'] += 1

print(f"   Corrigidas: {correcoes['escolaridade_renda']} incoerencias escolaridade/renda")

# ============================================================
# 5. CORRIGIR VOTO FACULTATIVO
# ============================================================
print("\n[5] Corrigindo voto facultativo...")

for e in eleitores:
    idade = e['idade']

    # 16-17 ou 70+ deve ser facultativo
    if (idade <= 17 or idade >= 70):
        if not e.get('voto_facultativo', False):
            e['voto_facultativo'] = True
            correcoes['voto_facultativo'] += 1
    # 18-69 deve ser obrigatorio
    elif 18 <= idade <= 69:
        if e.get('voto_facultativo', False):
            e['voto_facultativo'] = False
            correcoes['voto_facultativo'] += 1

print(f"   Corrigidas: {correcoes['voto_facultativo']} flags de voto facultativo")

# ============================================================
# 6. CORRIGIR FILHOS_CAT
# ============================================================
print("\n[6] Corrigindo categoria de filhos...")

for e in eleitores:
    filhos = e.get('filhos', 0)

    if filhos == 0:
        if e.get('filhos_cat') != 'sem_filhos':
            e['filhos_cat'] = 'sem_filhos'
            correcoes['filhos_cat'] += 1
    else:
        if e.get('filhos_cat') != 'com_filhos':
            e['filhos_cat'] = 'com_filhos'
            correcoes['filhos_cat'] += 1

print(f"   Corrigidas: {correcoes['filhos_cat']} categorias de filhos")

# ============================================================
# SALVAR DADOS CORRIGIDOS
# ============================================================
print("\n" + "=" * 70)
print("SALVANDO DADOS CORRIGIDOS...")
print("=" * 70)

total_correcoes = sum(correcoes.values())
print(f"\nTotal de correcoes aplicadas: {total_correcoes}")

# Backup do arquivo original
import shutil
shutil.copy('agentes/banco-eleitores-df.json', 'agentes/banco-eleitores-df.backup.json')
print("Backup criado: agentes/banco-eleitores-df.backup.json")

# Salvar dados corrigidos
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print("Dados corrigidos salvos: agentes/banco-eleitores-df.json")

print("\n" + "=" * 70)
print("RESUMO DAS CORRECOES")
print("=" * 70)
for categoria, qtd in sorted(correcoes.items(), key=lambda x: -x[1]):
    print(f"{categoria:30} | {qtd:4} correcoes")
print("-" * 70)
print(f"{'TOTAL':30} | {total_correcoes:4} correcoes")
print("=" * 70)
