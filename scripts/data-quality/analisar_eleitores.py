"""
Script de análise dos eleitores para identificar estrutura e distribuições
"""
import json
from collections import Counter, defaultdict

# Carregar dados
with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f'Total de eleitores: {len(eleitores)}')
print()

# Analisar distribuições das principais variáveis
print('=' * 60)
print('DISTRIBUIÇÕES ATUAIS')
print('=' * 60)

# Faixa etária
faixa_etaria = Counter()
for e in eleitores:
    idade = e.get('idade', 0)
    if idade < 16:
        faixa = 'menor_16'
    elif idade <= 24:
        faixa = '16-24'
    elif idade <= 34:
        faixa = '25-34'
    elif idade <= 44:
        faixa = '35-44'
    elif idade <= 54:
        faixa = '45-54'
    elif idade <= 64:
        faixa = '55-64'
    else:
        faixa = '65+'
    faixa_etaria[faixa] += 1

print('\nFAIXA ETÁRIA:')
for faixa in ['16-24', '25-34', '35-44', '45-54', '55-64', '65+']:
    n = faixa_etaria.get(faixa, 0)
    pct = 100 * n / len(eleitores)
    print(f'  {faixa}: {n} ({pct:.1f}%)')

# Renda
print('\nFAIXA DE RENDA (renda_salarios_minimos):')
renda = Counter(e.get('renda_salarios_minimos', 'desconhecido') for e in eleitores)
for r, n in renda.most_common():
    pct = 100 * n / len(eleitores)
    print(f'  {r}: {n} ({pct:.1f}%)')

# Classe Social (cluster_socioeconomico)
print('\nCLASSE SOCIAL (cluster_socioeconomico):')
classe = Counter(e.get('cluster_socioeconomico', 'desconhecido') for e in eleitores)
for c, n in classe.most_common():
    pct = 100 * n / len(eleitores)
    print(f'  {c}: {n} ({pct:.1f}%)')

# Estilo de decisão
print('\nESTILO DE DECISÃO:')
estilo = Counter(e.get('estilo_decisao', 'nenhum') for e in eleitores)
for est, n in estilo.most_common():
    pct = 100 * n / len(eleitores)
    print(f'  {est}: {n} ({pct:.1f}%)')

# Ocupação
print('\nOCUPAÇÃO:')
ocupacao = Counter(e.get('ocupacao_vinculo', 'desconhecido') for e in eleitores)
for o, n in ocupacao.most_common():
    pct = 100 * n / len(eleitores)
    print(f'  {o}: {n} ({pct:.1f}%)')

# Orientação política
print('\nORIENTAÇÃO POLÍTICA:')
orient = Counter(e.get('orientacao_politica', 'desconhecido') for e in eleitores)
for o, n in orient.most_common():
    pct = 100 * n / len(eleitores)
    print(f'  {o}: {n} ({pct:.1f}%)')

# Interesse político
print('\nINTERESSE POLÍTICO:')
interesse = Counter(e.get('interesse_politico', 'desconhecido') for e in eleitores)
for i, n in interesse.most_common():
    pct = 100 * n / len(eleitores)
    print(f'  {i}: {n} ({pct:.1f}%)')

# Conflito identitário
print('\nCONFLITO IDENTITÁRIO:')
conflito = Counter(e.get('conflito_identitario', False) for e in eleitores)
for c, n in conflito.most_common():
    pct = 100 * n / len(eleitores)
    print(f'  {c}: {n} ({pct:.1f}%)')

# Susceptibilidade
print('\nSUSCEPTIBILIDADE À DESINFORMAÇÃO:')
susc = Counter(e.get('susceptibilidade_desinformacao', 'desconhecido') for e in eleitores)
for s, n in susc.most_common():
    pct = 100 * n / len(eleitores)
    print(f'  {s}: {n} ({pct:.1f}%)')

print()
print('=' * 60)
print('PROBLEMAS IDENTIFICADOS (conformidade com referências):')
print('=' * 60)

# Referências oficiais
refs = {
    'faixa_etaria': {'16-24': 14.5, '25-34': 20.0, '35-44': 20.5, '45-54': 18.0, '55-64': 12.0, '65+': 15.0},
    'renda': {'ate_1': 28.5, 'mais_de_1_ate_2': 25.8, 'mais_de_2_ate_5': 24.2, 'mais_de_5_ate_10': 12.5, 'mais_de_10_ate_20': 6.0, 'mais_de_20': 3.0},
    'classe': {'G1_alta': 18.1, 'G2_media_alta': 20.8, 'G3_media_baixa': 32.9, 'G4_baixa': 28.2},
    'estilo_decisao': {'identitario': 25.0, 'pragmatico': 20.0, 'moral': 15.0, 'economico': 25.0, 'emocional': 15.0},
    'conflito_identitario': {True: 25.0, False: 75.0},
    'interesse_politico': {'baixo': 45.0, 'medio': 35.0, 'alto': 20.0}
}

# Calcular desvios
print('\nFaixa Etária (problema crítico - 16-24 está com 0%):')
for faixa, ref_pct in refs['faixa_etaria'].items():
    n = faixa_etaria.get(faixa, 0)
    atual_pct = 100 * n / len(eleitores)
    desvio = atual_pct - ref_pct
    status = '✓' if abs(desvio) <= 3 else '⚠' if abs(desvio) <= 7 else '✗'
    print(f'  {status} {faixa}: {atual_pct:.1f}% (ref: {ref_pct}%) | Desvio: {desvio:+.1f}%')

print('\nEstilo de Decisão (problema crítico - vários estilos faltando):')
for est, ref_pct in refs['estilo_decisao'].items():
    n = estilo.get(est, 0)
    atual_pct = 100 * n / len(eleitores)
    desvio = atual_pct - ref_pct
    status = '✓' if abs(desvio) <= 3 else '⚠' if abs(desvio) <= 7 else '✗'
    print(f'  {status} {est}: {atual_pct:.1f}% (ref: {ref_pct}%) | Desvio: {desvio:+.1f}%')

print('\nConflito Identitário (problema - precisa mais True):')
for conf, ref_pct in refs['conflito_identitario'].items():
    n = conflito.get(conf, 0)
    atual_pct = 100 * n / len(eleitores)
    desvio = atual_pct - ref_pct
    status = '✓' if abs(desvio) <= 3 else '⚠' if abs(desvio) <= 7 else '✗'
    print(f'  {status} {conf}: {atual_pct:.1f}% (ref: {ref_pct}%) | Desvio: {desvio:+.1f}%')
