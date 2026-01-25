#!/usr/bin/env python3
"""Normaliza valores para ficarem compatíveis com as referências"""
import json
import random

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f'Total: {len(eleitores)} eleitores')
correcoes = 0

# Mapeamento de renda
mapa_renda = {
    'mais_de_2_ate_5': '3_a_5',
    'mais_de_1_ate_2': '1_a_2',
    'mais_de_5_ate_10': '5_a_10',
    'mais_de_10_ate_20': 'mais_de_10',
    'mais_de_20': 'mais_de_10',
}

# Mapeamento de estilo_decisao
mapa_estilo = {
    'identitario': 'ideologico',
    'pragmatico': 'racional',
    'moral': 'emocional',
}

for e in eleitores:
    # Normalizar renda
    renda = e.get('renda_salarios_minimos')
    if renda in mapa_renda:
        e['renda_salarios_minimos'] = mapa_renda[renda]
        correcoes += 1

    # Normalizar estilo_decisao
    estilo = e.get('estilo_decisao')
    if estilo in mapa_estilo:
        e['estilo_decisao'] = mapa_estilo[estilo]
        correcoes += 1

print(f'Normalizacoes de renda e estilo: {correcoes}')

# Agora verificar distribuicao e ajustar para bater com referencias
from collections import Counter
n = len(eleitores)

# Ajustar renda para bater com refs
# Refs: ate_1=28.5, 1_a_2=25.0, 2_a_3=18.0, 3_a_5=15.0, 5_a_10=8.5, mais_de_10=5.0
renda_atual = Counter(e.get('renda_salarios_minimos') for e in eleitores)
print(f'\nRenda apos normalizacao:')
for k, v in renda_atual.most_common():
    print(f'  {k}: {v} ({100*v/n:.1f}%)')

# Preciso redistribuir para chegar nas metas
# Meta ate_1=285, 1_a_2=250, 2_a_3=180, 3_a_5=150, 5_a_10=85, mais_de_10=50
metas_renda = {'ate_1': 285, '1_a_2': 250, '2_a_3': 180, '3_a_5': 150, '5_a_10': 85, 'mais_de_10': 50}

# Identificar excesso e deficit
for cat, meta in metas_renda.items():
    atual = renda_atual.get(cat, 0)
    diff = atual - meta
    if diff > 10:  # Excesso
        # Encontrar eleitores dessa categoria para redistribuir
        eleitores_cat = [e for e in eleitores if e.get('renda_salarios_minimos') == cat]
        random.shuffle(eleitores_cat)
        # Redistribuir para categorias com deficit
        deficit_cats = [c for c, m in metas_renda.items() if renda_atual.get(c, 0) < m - 10]
        for i, e in enumerate(eleitores_cat[:min(diff, 50)]):
            if deficit_cats:
                nova_cat = random.choice(deficit_cats)
                e['renda_salarios_minimos'] = nova_cat
                correcoes += 1

# Verificar estilo_decisao
# Refs: emocional=25, racional=30, economico=30, ideologico=15
estilo_atual = Counter(e.get('estilo_decisao') for e in eleitores)
print(f'\nEstilo decisao apos normalizacao:')
for k, v in estilo_atual.most_common():
    print(f'  {k}: {v} ({100*v/n:.1f}%)')

metas_estilo = {'emocional': 250, 'racional': 300, 'economico': 300, 'ideologico': 150}

for cat, meta in metas_estilo.items():
    atual = estilo_atual.get(cat, 0)
    diff = atual - meta
    if diff > 20:  # Excesso
        eleitores_cat = [e for e in eleitores if e.get('estilo_decisao') == cat]
        random.shuffle(eleitores_cat)
        deficit_cats = [c for c, m in metas_estilo.items() if estilo_atual.get(c, 0) < m - 20]
        for i, e in enumerate(eleitores_cat[:min(abs(diff), 100)]):
            if deficit_cats:
                nova_cat = random.choice(deficit_cats)
                e['estilo_decisao'] = nova_cat
                correcoes += 1

print(f'\nTotal de correcoes: {correcoes}')

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('Salvo em agentes/banco-eleitores-df.json')

with open('frontend/src/data/eleitores-df-400.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('Copiado para frontend/src/data/eleitores-df-400.json')
