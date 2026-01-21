#!/usr/bin/env python3
"""Ajustar orientação política - centro está em excesso"""
import json
import random

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f'Total: {len(eleitores)} eleitores')
n = len(eleitores)

from collections import Counter

# Verificar atual
print('\n=== ORIENTACAO POLITICA ATUAL ===')
orient_dist = Counter(e.get('orientacao_politica') for e in eleitores)
# Refs: esquerda=15, centro-esquerda=7, centro=11, centro-direita=11, direita=29
refs = {'esquerda': 15.0, 'centro-esquerda': 7.0, 'centro': 11.0, 'centro-direita': 11.0, 'direita': 29.0}

for k, ref in refs.items():
    v = orient_dist.get(k, 0)
    desvio = abs(100*v/n - ref)
    print(f'  {k}: {v} ({100*v/n:.1f}%) ref={ref}% desvio={desvio:.1f}%')

# Problema: centro está com 24.2% e deveria ter 11%
# Preciso redistribuir ~130 eleitores de centro para outras orientações

# Encontrar eleitores de centro
eleitores_centro = [e for e in eleitores if e.get('orientacao_politica') == 'centro']
random.shuffle(eleitores_centro)

# Verificar déficits
# esquerda precisa de ~150, tem ~150? centro-esquerda precisa ~70, tem?
# direita precisa ~290, tem ~?

# Redistribuir centro para direita (maior déficit provavelmente)
# Ajustar conforme necessário
# De centro para direita: ~80
# De centro para esquerda: ~30
# De centro para centro-esquerda: ~20

for i, e in enumerate(eleitores_centro[:80]):
    e['orientacao_politica'] = 'direita'

for i, e in enumerate(eleitores_centro[80:110]):
    e['orientacao_politica'] = 'esquerda'

for i, e in enumerate(eleitores_centro[110:130]):
    e['orientacao_politica'] = 'centro-esquerda'

print('\nAjustado: centro -> direita (80), esquerda (30), centro-esquerda (20)')

# Verificar resultado
print('\n=== ORIENTACAO POLITICA APOS AJUSTE ===')
orient_dist = Counter(e.get('orientacao_politica') for e in eleitores)
desvios = []
for k, ref in refs.items():
    v = orient_dist.get(k, 0)
    desvio = abs(100*v/n - ref)
    desvios.append(desvio)
    status = 'OTIMO' if desvio <= 3 else 'BOM' if desvio <= 7 else 'ATENCAO' if desvio <= 12 else 'CRITICO'
    print(f'  {k}: {v} ({100*v/n:.1f}%) ref={ref}% desvio={desvio:.1f}% [{status}]')
print(f'  Desvio medio: {sum(desvios)/len(desvios):.1f}%')

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('\nSalvo em agentes/banco-eleitores-df.json')

with open('frontend/src/data/eleitores-df-400.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('Copiado para frontend/src/data/eleitores-df-400.json')
