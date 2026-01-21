#!/usr/bin/env python3
"""Ajuste fino final de orientação política"""
import json
import random

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

n = len(eleitores)
from collections import Counter

# Refs: esquerda=15, centro-esquerda=7, centro=11, centro-direita=11, direita=29
# Total: 73% - os outros 27% seriam "não declarada" mas não temos essa categoria

# Problema: centro-direita está em 18.4% e deveria ser 11%
# Centro está em 16.8% e deveria ser 11%
# Esquerda está em 18.3% e deveria ser 15%

# Preciso redistribuir:
# - centro-direita: 184 -> 110 (mover 74)
# - centro: 168 -> 110 (mover 58)
# - esquerda: 183 -> 150 (mover 33)

# Para onde mover? Direita já está certa (290).
# centro-esquerda está certa (70).

# Posso ajustar para que as proporções relativas fiquem corretas
# Ou aceitar que o sistema tem só 5 categorias

# Alternativa: Alguns eleitores podem ficar sem orientação política clara
# Mas isso pode quebrar o sistema

# Vou tentar redistribuir de forma mais equilibrada
# mantendo os desvios dentro do aceitável (<=7%)

# Metas ajustadas (para somar 100%):
# esquerda: 15/73 * 100 = 20.5% -> 205
# centro-esquerda: 7/73 * 100 = 9.6% -> 96
# centro: 11/73 * 100 = 15.1% -> 151
# centro-direita: 11/73 * 100 = 15.1% -> 151
# direita: 29/73 * 100 = 39.7% -> 397

# Mas isso deixaria direita muito alta de novo

# Vou manter a proporção original mas garantir que nenhum desvio seja > 7%
# Atual: esq=183, ce=70, c=168, cd=184, d=290

# Se eu mover de centro-direita e centro para esquerda:
eleitores_centro_direita = [e for e in eleitores if e.get('orientacao_politica') == 'centro-direita']
random.shuffle(eleitores_centro_direita)

# Mover 40 de centro-direita para esquerda (para equilibrar)
for e in eleitores_centro_direita[:40]:
    e['orientacao_politica'] = 'esquerda'

# Mover 30 de centro para centro-esquerda
eleitores_centro = [e for e in eleitores if e.get('orientacao_politica') == 'centro']
random.shuffle(eleitores_centro)
for e in eleitores_centro[:30]:
    e['orientacao_politica'] = 'centro-esquerda'

print('\n=== ORIENTAÇÃO POLÍTICA FINAL ===')
refs = {'esquerda': 15.0, 'centro-esquerda': 7.0, 'centro': 11.0, 'centro-direita': 11.0, 'direita': 29.0}
orient_dist = Counter(e.get('orientacao_politica') for e in eleitores)
desvios = []
for k, ref in refs.items():
    v = orient_dist.get(k, 0)
    desvio = abs(100*v/n - ref)
    desvios.append(desvio)
    status = 'OTIMO' if desvio <= 3 else 'BOM' if desvio <= 7 else 'ATENCAO'
    print(f'  {k}: {v} ({100*v/n:.1f}%) ref={ref}% desvio={desvio:.1f}% [{status}]')
print(f'  Desvio médio: {sum(desvios)/len(desvios):.1f}%')

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('\nSalvo!')

with open('frontend/src/data/eleitores-df-400.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('Copiado para frontend!')
