#!/usr/bin/env python3
"""Balancear orientação política - direita ficou em excesso"""
import json
import random

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

n = len(eleitores)
from collections import Counter

print('=== ORIENTAÇÃO POLÍTICA ATUAL ===')
refs = {'esquerda': 15.0, 'centro-esquerda': 7.0, 'centro': 11.0, 'centro-direita': 11.0, 'direita': 29.0}
orient_dist = Counter(e.get('orientacao_politica') for e in eleitores)
for k, ref in refs.items():
    v = orient_dist.get(k, 0)
    print(f'  {k}: {v} ({100*v/n:.1f}%) ref={ref}%')

# Direita tem 417 (41.7%) mas deveria ter 290 (29%)
# Preciso tirar ~127 da direita
# centro-esquerda tem 103 (10.3%) mas deveria ter 70 (7%) - tirar ~33

# Equilibrar:
# - Mover ~127 de direita para: sem orientação ou outro
# Mas não tenho "sem orientação" no ref. Vou distribuir para ficar mais próximo.

# Na verdade, os refs somam apenas 73% (15+7+11+11+29)
# Os outros 27% não se identificam com nenhuma posição

# Vou criar uma categoria "sem_orientacao" para equilibrar
eleitores_direita = [e for e in eleitores if e.get('orientacao_politica') == 'direita']
random.shuffle(eleitores_direita)

# Mover 127 para equilibrar
# Vou assumir que preciso chegar perto de 29% = 290 eleitores
excesso_direita = len(eleitores_direita) - 290

# Como não tenho categoria "sem_orientacao", vou redistribuir para as outras que estão mais baixas
# ou manter como está se o sistema aceita

# Verificar se há "sem_orientacao" como opção válida
# Se não, vou mover para centro que pode absorver mais

# Movendo excesso para centro (que aceita indecisos)
for e in eleitores_direita[:excesso_direita]:
    # Alternar entre centro e centro-direita para não sobrecarregar
    if random.random() < 0.5:
        e['orientacao_politica'] = 'centro'
    else:
        e['orientacao_politica'] = 'centro-direita'

print(f'\nMovido {excesso_direita} de direita para centro/centro-direita')

# Agora ajustar centro-esquerda (tem 103 mas ref é 70)
eleitores_centro_esq = [e for e in eleitores if e.get('orientacao_politica') == 'centro-esquerda']
random.shuffle(eleitores_centro_esq)
excesso_ce = len(eleitores_centro_esq) - 70
for e in eleitores_centro_esq[:excesso_ce]:
    e['orientacao_politica'] = 'esquerda'

print(f'Movido {excesso_ce} de centro-esquerda para esquerda')

# Verificar resultado
print('\n=== ORIENTAÇÃO POLÍTICA APÓS AJUSTE ===')
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
