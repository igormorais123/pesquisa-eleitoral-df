#!/usr/bin/env python3
"""REVERTER a normalização errada - restaurar valores corretos"""
import json

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f'Total: {len(eleitores)} eleitores')
correcoes = 0

# Reverter mapeamento de renda (ERRADO -> CORRETO)
mapa_renda_reverso = {
    '1_a_2': 'mais_de_1_ate_2',
    '2_a_3': 'mais_de_2_ate_5',  # Este foi meu erro - 2_a_3 não existe no sistema
    '3_a_5': 'mais_de_2_ate_5',
    '5_a_10': 'mais_de_5_ate_10',
    'mais_de_10': 'mais_de_10_ate_20',
}

# Reverter mapeamento de estilo_decisao (ERRADO -> CORRETO)
mapa_estilo_reverso = {
    'ideologico': 'identitario',
    'racional': 'pragmatico',
    # 'emocional' e 'moral' são valores válidos - não precisa reverter
    # mas 'emocional' foi usado incorretamente no lugar de 'moral'
}

for e in eleitores:
    # Reverter renda
    renda = e.get('renda_salarios_minimos')
    if renda in mapa_renda_reverso:
        e['renda_salarios_minimos'] = mapa_renda_reverso[renda]
        correcoes += 1

    # Reverter estilo_decisao
    estilo = e.get('estilo_decisao')
    if estilo in mapa_estilo_reverso:
        e['estilo_decisao'] = mapa_estilo_reverso[estilo]
        correcoes += 1

print(f'Total de reversoes: {correcoes}')

# Verificar distribuicao final
from collections import Counter
n = len(eleitores)

print('\n=== RENDA APOS REVERSAO ===')
renda_dist = Counter(e.get('renda_salarios_minimos') for e in eleitores)
# Valores esperados: ate_1=28.5, mais_de_1_ate_2=25.8, mais_de_2_ate_5=24.2, mais_de_5_ate_10=12.5, mais_de_10_ate_20=6.0, mais_de_20=3.0
refs_renda = {'ate_1': 28.5, 'mais_de_1_ate_2': 25.8, 'mais_de_2_ate_5': 24.2, 'mais_de_5_ate_10': 12.5, 'mais_de_10_ate_20': 6.0, 'mais_de_20': 3.0}
for k in ['ate_1', 'mais_de_1_ate_2', 'mais_de_2_ate_5', 'mais_de_5_ate_10', 'mais_de_10_ate_20', 'mais_de_20']:
    v = renda_dist.get(k, 0)
    ref = refs_renda.get(k, 0)
    desvio = abs(100*v/n - ref)
    status = 'OK' if desvio <= 5 else 'AJUSTAR'
    print(f'  {k}: {v} ({100*v/n:.1f}%) ref={ref}% desvio={desvio:.1f}% [{status}]')

# Valores não mapeados
outros = [k for k in renda_dist if k not in refs_renda]
if outros:
    print(f'  VALORES NAO MAPEADOS: {outros}')

print('\n=== ESTILO DECISAO APOS REVERSAO ===')
estilo_dist = Counter(e.get('estilo_decisao') for e in eleitores)
# Valores esperados: identitario=25, pragmatico=20, moral=15, economico=25, emocional=15
refs_estilo = {'identitario': 25.0, 'pragmatico': 20.0, 'moral': 15.0, 'economico': 25.0, 'emocional': 15.0}
for k in ['identitario', 'pragmatico', 'moral', 'economico', 'emocional']:
    v = estilo_dist.get(k, 0)
    ref = refs_estilo.get(k, 0)
    desvio = abs(100*v/n - ref)
    status = 'OK' if desvio <= 5 else 'AJUSTAR'
    print(f'  {k}: {v} ({100*v/n:.1f}%) ref={ref}% desvio={desvio:.1f}% [{status}]')

# Valores não mapeados
outros_estilo = [k for k in estilo_dist if k not in refs_estilo]
if outros_estilo:
    print(f'  VALORES NAO MAPEADOS: {outros_estilo}')

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('\nSalvo em agentes/banco-eleitores-df.json')

with open('frontend/src/data/eleitores-df-400.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('Copiado para frontend/src/data/eleitores-df-400.json')
