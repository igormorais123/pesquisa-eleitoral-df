#!/usr/bin/env python3
"""Corrigir TODAS as incoerências identificadas no relatório de validação"""
import json
import random

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f'Total: {len(eleitores)} eleitores')

# Criar índice por ID
eleitores_por_id = {e['id']: e for e in eleitores}

correcoes = 0

# === 1. AJUSTAR ORIENTAÇÃO POLÍTICA (esquerda em excesso) ===
print('\n=== 1. AJUSTANDO ORIENTAÇÃO POLÍTICA ===')
eleitores_esquerda = [e for e in eleitores if e.get('orientacao_politica') == 'esquerda']
random.shuffle(eleitores_esquerda)
# Mover 86 de esquerda para direita para equilibrar
for e in eleitores_esquerda[:86]:
    e['orientacao_politica'] = 'direita'
    correcoes += 1
print(f'  Esquerda -> Direita: 86 eleitores')

# === 2. SERVIDORES PÚBLICOS COM RENDA BAIXA (16 casos) ===
print('\n=== 2. CORRIGINDO SERVIDORES COM RENDA BAIXA ===')
ids_servidores_renda_baixa = [
    'df-0008', 'df-0074', 'df-0075', 'df-0082', 'df-0205', 'df-0270',
    'df-0300', 'df-0302', 'df-0314', 'df-0376', 'df-0392', 'df-0442',
    'df-0455', 'df-0897', 'df-0924', 'df-0954'
]
for id in ids_servidores_renda_baixa:
    if id in eleitores_por_id:
        e = eleitores_por_id[id]
        if e.get('renda_salarios_minimos') in ['ate_1', 'mais_de_1_ate_2']:
            e['renda_salarios_minimos'] = 'mais_de_2_ate_5'  # No mínimo 2-5 SM
            correcoes += 1
print(f'  Servidores ajustados: {len(ids_servidores_renda_baixa)}')

# === 3. PROFISSIONAIS DE ALTA RENDA (médicos, advogados, engenheiros) ===
print('\n=== 3. CORRIGINDO PROFISSIONAIS DE ALTA RENDA ===')
ids_profissionais = [
    'df-0098', 'df-0357', 'df-0434', 'df-0485', 'df-0516', 'df-0766',
    'df-0793', 'df-0799', 'df-0802', 'df-0835', 'df-0857', 'df-0859',
    'df-0863', 'df-0880'
]
for id in ids_profissionais:
    if id in eleitores_por_id:
        e = eleitores_por_id[id]
        if e.get('renda_salarios_minimos') in ['ate_1', 'mais_de_1_ate_2']:
            e['renda_salarios_minimos'] = 'mais_de_5_ate_10'  # Profissionais ganham mais
            correcoes += 1
print(f'  Profissionais ajustados: {len(ids_profissionais)}')

# === 4. DESEMPREGADOS COM RENDA ALTA (4 casos) ===
print('\n=== 4. CORRIGINDO DESEMPREGADOS COM RENDA ALTA ===')
ids_desempregados_ricos = ['df-0117', 'df-0269', 'df-0319', 'df-0338']
for id in ids_desempregados_ricos:
    if id in eleitores_por_id:
        e = eleitores_por_id[id]
        if e.get('ocupacao_vinculo') == 'desempregado':
            e['renda_salarios_minimos'] = 'mais_de_1_ate_2'  # Desempregado pode ter alguma reserva
            correcoes += 1
print(f'  Desempregados ajustados: {len(ids_desempregados_ricos)}')

# === 5. TRANSPORTE "NÃO SE APLICA" PARA TRABALHADORES (27 casos) ===
print('\n=== 5. CORRIGINDO TRANSPORTE DE TRABALHADORES ===')
ids_transporte = [
    'df-0419', 'df-0429', 'df-0438', 'df-0459', 'df-0460', 'df-0462',
    'df-0464', 'df-0468', 'df-0482', 'df-0500', 'df-0501', 'df-0502',
    'df-0508', 'df-0518', 'df-0526', 'df-0534', 'df-0551', 'df-0554',
    'df-0573', 'df-0574', 'df-0578', 'df-0595', 'df-0613', 'df-0622',
    'df-0623', 'df-0667', 'df-0674'
]
transportes = ['onibus', 'carro', 'moto', 'a_pe', 'metro']
for id in ids_transporte:
    if id in eleitores_por_id:
        e = eleitores_por_id[id]
        if e.get('meio_transporte') == 'nao_se_aplica':
            # Escolher transporte baseado no cluster
            cluster = e.get('cluster_socioeconomico', 'G3_media_baixa')
            if cluster in ['G1_alta', 'G2_media_alta']:
                e['meio_transporte'] = random.choice(['carro', 'moto'])
            else:
                e['meio_transporte'] = random.choice(['onibus', 'a_pe', 'moto'])
            correcoes += 1
        if e.get('tempo_deslocamento') == 'nao_se_aplica':
            e['tempo_deslocamento'] = random.choice(['ate_15min', '15_30min', '30_60min'])
            correcoes += 1
print(f'  Trabalhadores com transporte ajustado: {len(ids_transporte)}')

# === 6. ESTUDANTES COM IDADE AVANÇADA (10 casos) ===
print('\n=== 6. AJUSTANDO ESTUDANTES ADULTOS ===')
ids_estudantes_adultos = [
    'df-0409', 'df-0424', 'df-0426', 'df-0437', 'df-0447', 'df-0470',
    'df-0495', 'df-0510', 'df-0514', 'df-0668'
]
# Manter apenas 3 como estudantes (EJA), mudar os outros para autônomo
for i, id in enumerate(ids_estudantes_adultos):
    if id in eleitores_por_id:
        e = eleitores_por_id[id]
        if i < 3:
            e['profissao'] = 'Estudante (EJA/educação tardia)'
        else:
            e['ocupacao_vinculo'] = 'autonomo'
            e['profissao'] = 'Trabalhador autônomo'
            correcoes += 1
print(f'  Estudantes adultos ajustados: {len(ids_estudantes_adultos)}')

# === 7. SERVIDOR MUITO JOVEM (18 anos) ===
print('\n=== 7. CORRIGINDO SERVIDOR MUITO JOVEM ===')
if 'df-0402' in eleitores_por_id:
    e = eleitores_por_id['df-0402']
    e['idade'] = 22  # Idade mínima realista para servidor
    correcoes += 1
    print('  df-0402: idade ajustada para 22')

# === 8. VARJÃO COM G1_ALTA ===
print('\n=== 8. CORRIGINDO VARJÃO G1_ALTA ===')
if 'df-0399' in eleitores_por_id:
    e = eleitores_por_id['df-0399']
    e['cluster_socioeconomico'] = 'G4_baixa'  # Compatível com Varjão
    e['renda_salarios_minimos'] = 'mais_de_1_ate_2'
    correcoes += 1
    print('  df-0399: cluster ajustado para G4_baixa')

# === 9. REDISTRIBUIR REGIÕES ADMINISTRATIVAS ===
print('\n=== 9. REDISTRIBUINDO REGIÕES ADMINISTRATIVAS ===')
# Recanto das Emas está super-representado (13.3% vs 4.5%)
# Ceilândia sub-representado (6.7% vs 17%)
# Samambaia sub-representado (5.7% vs 10%)

eleitores_recanto = [e for e in eleitores if e.get('regiao_administrativa') == 'Recanto das Emas']
random.shuffle(eleitores_recanto)

# Mover 50 para Ceilândia e 30 para Samambaia
for e in eleitores_recanto[:50]:
    e['regiao_administrativa'] = 'Ceilândia'
    correcoes += 1

for e in eleitores_recanto[50:80]:
    e['regiao_administrativa'] = 'Samambaia'
    correcoes += 1

print(f'  Recanto das Emas -> Ceilândia: 50')
print(f'  Recanto das Emas -> Samambaia: 30')

# === 10. ESCOLARIDADE vs RENDA (profissionais com superior e renda baixa) ===
print('\n=== 10. CORRIGINDO ESCOLARIDADE vs RENDA ===')
ids_superior_renda_baixa = [
    'df-0018', 'df-0048', 'df-0079', 'df-0182', 'df-0192', 'df-0196',
    'df-0211', 'df-0288', 'df-0304', 'df-0362', 'df-0380', 'df-0390',
    'df-0417', 'df-0439', 'df-0537', 'df-0541', 'df-0679', 'df-0685',
    'df-0752', 'df-0760', 'df-0777', 'df-0786', 'df-0788', 'df-0789',
    'df-0796', 'df-0809', 'df-0810', 'df-0819', 'df-0822', 'df-0826',
    'df-0844', 'df-0862', 'df-0865', 'df-0878', 'df-0889', 'df-0895',
    'df-0948', 'df-0957', 'df-0986'
]
for id in ids_superior_renda_baixa:
    if id in eleitores_por_id:
        e = eleitores_por_id[id]
        if e.get('escolaridade') == 'superior_completo_ou_pos' and e.get('renda_salarios_minimos') == 'ate_1':
            if e.get('ocupacao_vinculo') not in ['desempregado', 'aposentado', 'estudante']:
                e['renda_salarios_minimos'] = 'mais_de_2_ate_5'
                correcoes += 1

# Verificar e ajustar todos com superior e renda até 1 SM que trabalham
for e in eleitores:
    if (e.get('escolaridade') == 'superior_completo_ou_pos' and
        e.get('renda_salarios_minimos') == 'ate_1' and
        e.get('ocupacao_vinculo') in ['clt', 'servidor_publico', 'autonomo', 'empresario']):
        e['renda_salarios_minimos'] = 'mais_de_2_ate_5'
        correcoes += 1

print(f'  Superior completo com renda ajustada')

print(f'\n=== TOTAL DE CORREÇÕES: {correcoes} ===')

# === VERIFICAÇÃO FINAL ===
from collections import Counter
n = len(eleitores)

print('\n=== VERIFICAÇÃO FINAL ===')

# Orientação política
print('\nOrientação Política:')
refs_op = {'esquerda': 15.0, 'centro-esquerda': 7.0, 'centro': 11.0, 'centro-direita': 11.0, 'direita': 29.0}
orient_dist = Counter(e.get('orientacao_politica') for e in eleitores)
for k, ref in refs_op.items():
    v = orient_dist.get(k, 0)
    desvio = abs(100*v/n - ref)
    status = 'OTIMO' if desvio <= 3 else 'BOM' if desvio <= 7 else 'ATENCAO'
    print(f'  {k}: {v} ({100*v/n:.1f}%) ref={ref}% [{status}]')

# Regiões
print('\nRegiões Administrativas:')
ra_dist = Counter(e.get('regiao_administrativa') for e in eleitores)
for ra in ['Recanto das Emas', 'Ceilândia', 'Samambaia', 'Plano Piloto']:
    v = ra_dist.get(ra, 0)
    print(f'  {ra}: {v} ({100*v/n:.1f}%)')

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('\nSalvo em agentes/banco-eleitores-df.json')

with open('frontend/src/data/eleitores-df-400.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('Copiado para frontend/src/data/eleitores-df-400.json')
