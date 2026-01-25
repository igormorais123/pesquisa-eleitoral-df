#!/usr/bin/env python3
"""Ajustar distribuições de renda e estilo_decisao para bater com referências"""
import json
import random

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f'Total: {len(eleitores)} eleitores')
n = len(eleitores)

# === AJUSTAR RENDA ===
# Problema: mais_de_2_ate_5 tem 33% e deveria ter 24.2%
# mais_de_20 tem 0% e deveria ter 3%
# mais_de_5_ate_10 tem 8.5% e deveria ter 12.5%

# 1. Redistribuir excesso de mais_de_2_ate_5
eleitores_excesso_renda = [e for e in eleitores if e.get('renda_salarios_minimos') == 'mais_de_2_ate_5']
random.shuffle(eleitores_excesso_renda)

# Mover ~90 para outras categorias
# 30 para mais_de_20, 40 para mais_de_5_ate_10
for i, e in enumerate(eleitores_excesso_renda[:30]):
    e['renda_salarios_minimos'] = 'mais_de_20'

for i, e in enumerate(eleitores_excesso_renda[30:70]):
    e['renda_salarios_minimos'] = 'mais_de_5_ate_10'

print('Renda ajustada: mais_de_2_ate_5 -> mais_de_20 (30) e mais_de_5_ate_10 (40)')

# === AJUSTAR ESTILO DECISAO ===
# Problema:
# identitario: 15% -> 25% (precisa +100)
# pragmatico: 30% -> 20% (precisa -100)
# moral: 0% -> 15% (precisa +150)
# emocional: 25% -> 15% (precisa -100)
# economico: 30% -> 25% (precisa -50)

# 1. Mover pragmatico -> identitario e moral
eleitores_pragmatico = [e for e in eleitores if e.get('estilo_decisao') == 'pragmatico']
random.shuffle(eleitores_pragmatico)
# Mover 100 para identitario, manter 100 com pragmatico -> sobram 100
for i, e in enumerate(eleitores_pragmatico[:100]):
    e['estilo_decisao'] = 'identitario'
print('Estilo ajustado: pragmatico -> identitario (100)')

# 2. Mover emocional -> moral
eleitores_emocional = [e for e in eleitores if e.get('estilo_decisao') == 'emocional']
random.shuffle(eleitores_emocional)
# Mover 100 para moral
for i, e in enumerate(eleitores_emocional[:100]):
    e['estilo_decisao'] = 'moral'
print('Estilo ajustado: emocional -> moral (100)')

# 3. Mover economico -> moral (preciso mais 50 em moral para chegar a 150)
eleitores_economico = [e for e in eleitores if e.get('estilo_decisao') == 'economico']
random.shuffle(eleitores_economico)
for i, e in enumerate(eleitores_economico[:50]):
    e['estilo_decisao'] = 'moral'
print('Estilo ajustado: economico -> moral (50)')

# === VERIFICAR RESULTADO FINAL ===
from collections import Counter

print('\n=== RENDA FINAL ===')
renda_dist = Counter(e.get('renda_salarios_minimos') for e in eleitores)
refs_renda = {'ate_1': 28.5, 'mais_de_1_ate_2': 25.8, 'mais_de_2_ate_5': 24.2, 'mais_de_5_ate_10': 12.5, 'mais_de_10_ate_20': 6.0, 'mais_de_20': 3.0}
desvios_renda = []
for k in ['ate_1', 'mais_de_1_ate_2', 'mais_de_2_ate_5', 'mais_de_5_ate_10', 'mais_de_10_ate_20', 'mais_de_20']:
    v = renda_dist.get(k, 0)
    ref = refs_renda.get(k, 0)
    desvio = abs(100*v/n - ref)
    desvios_renda.append(desvio)
    status = 'OTIMO' if desvio <= 3 else 'BOM' if desvio <= 7 else 'ATENCAO' if desvio <= 12 else 'CRITICO'
    print(f'  {k}: {v} ({100*v/n:.1f}%) ref={ref}% desvio={desvio:.1f}% [{status}]')
print(f'  Desvio medio renda: {sum(desvios_renda)/len(desvios_renda):.1f}%')

print('\n=== ESTILO DECISAO FINAL ===')
estilo_dist = Counter(e.get('estilo_decisao') for e in eleitores)
refs_estilo = {'identitario': 25.0, 'pragmatico': 20.0, 'moral': 15.0, 'economico': 25.0, 'emocional': 15.0}
desvios_estilo = []
for k in ['identitario', 'pragmatico', 'moral', 'economico', 'emocional']:
    v = estilo_dist.get(k, 0)
    ref = refs_estilo.get(k, 0)
    desvio = abs(100*v/n - ref)
    desvios_estilo.append(desvio)
    status = 'OTIMO' if desvio <= 3 else 'BOM' if desvio <= 7 else 'ATENCAO' if desvio <= 12 else 'CRITICO'
    print(f'  {k}: {v} ({100*v/n:.1f}%) ref={ref}% desvio={desvio:.1f}% [{status}]')
print(f'  Desvio medio estilo: {sum(desvios_estilo)/len(desvios_estilo):.1f}%')

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('\nSalvo em agentes/banco-eleitores-df.json')

with open('frontend/src/data/eleitores-df-400.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('Copiado para frontend/src/data/eleitores-df-400.json')
