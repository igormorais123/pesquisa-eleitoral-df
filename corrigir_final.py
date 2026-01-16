#!/usr/bin/env python3
"""Correções finais de incoerências"""
import json
import random

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f'Total: {len(eleitores)} eleitores')
correcoes = 0

# 1. Menores de idade com filhos -> zerar filhos
ids_menores_filhos = ['df-0191', 'df-0440', 'df-0568', 'df-0656', 'df-0669']
for e in eleitores:
    if e['id'] in ids_menores_filhos:
        e['filhos'] = 0
        # Corrigir história se menciona filhos
        if 'filho' in e.get('historia_resumida', '').lower():
            e['historia_resumida'] = e['historia_resumida'].replace(' e com 1 filho(s)', '').replace(' e com 2 filho(s)', '')
        correcoes += 1
print(f'1. Menores com filhos: {len(ids_menores_filhos)} corrigidos (filhos=0)')

# 2. Esquerda + Evangélico + Apoiador Bolsonaro -> mudar para neutro
for e in eleitores:
    if (e.get('orientacao_politica') in ['esquerda', 'centro_esquerda']
        and e.get('religiao') == 'evangelica'
        and e.get('posicao_bolsonaro') in ['apoiador_forte', 'apoiador_moderado']):
        e['posicao_bolsonaro'] = 'neutro'
        correcoes += 1
print(f'2. Esquerda+Evangelico+Apoiador: corrigido para neutro')

# 3. Servidor público com renda até 1 SM -> ajustar renda
for e in eleitores:
    if e['id'] == 'df-0024':
        e['renda_salarios_minimos'] = '2_a_3'
        correcoes += 1
print(f'3. Servidor publico df-0024: renda ajustada para 2_a_3')

# 4. Nomes duplicados -> adicionar sufixo diferenciador
nomes = {}
for e in eleitores:
    nome = e['nome']
    if nome in nomes:
        # Adicionar sobrenome diferente
        novos_sobrenomes = ['Nascimento', 'Barbosa', 'Moreira', 'Rocha', 'Campos', 'Teixeira', 'Freitas']
        partes = nome.split()
        novo_sobrenome = random.choice(novos_sobrenomes)
        e['nome'] = f"{partes[0]} {partes[1]} {novo_sobrenome}"
        correcoes += 1
    else:
        nomes[nome] = e['id']
print(f'4. Nomes duplicados: corrigidos com novos sobrenomes')

# 5. Ajustar carro (27.7% -> 32.3%) - converter ~45 de onibus para carro
# Escolher eleitores de classe média/alta que usam ônibus
onibus_classe_media = [e for e in eleitores
                       if e.get('meio_transporte') == 'onibus'
                       and e.get('cluster_socioeconomico') in ['G1_alta', 'G2_media_alta', 'G3_media_baixa']
                       and e.get('ocupacao_vinculo') in ['clt', 'servidor_publico', 'autonomo', 'empresario']]
random.shuffle(onibus_classe_media)

for e in onibus_classe_media[:45]:
    e['meio_transporte'] = 'carro'
    correcoes += 1
print(f'5. Onibus -> Carro (classe media): {min(45, len(onibus_classe_media))} ajustados')

# 6. Estudantes > 35 anos - adicionar nota na profissão
for e in eleitores:
    if e.get('ocupacao_vinculo') == 'estudante' and e.get('idade', 20) > 35:
        if 'tardia' not in e.get('profissao', ''):
            e['profissao'] = 'Estudante (educacao tardia/EJA)'

print(f'\n=== TOTAL DE CORRECOES: {correcoes} ===')

# Verificar resultado final
n = len(eleitores)
carro = sum(1 for e in eleitores if e.get('meio_transporte') == 'carro')
print(f'\nCarro: {carro} ({100*carro/n:.1f}%) - meta: 32.3%')

# Verificar nomes duplicados restantes
nomes_check = [e['nome'] for e in eleitores]
dups = set([x for x in nomes_check if nomes_check.count(x) > 1])
print(f'Nomes duplicados restantes: {len(dups)}')

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('\nSalvo em agentes/banco-eleitores-df.json')

with open('frontend/src/data/eleitores-df-400.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('Copiado para frontend/src/data/eleitores-df-400.json')
