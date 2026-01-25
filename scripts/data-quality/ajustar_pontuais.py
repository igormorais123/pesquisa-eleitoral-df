#!/usr/bin/env python3
"""Ajustes pontuais mantendo coerência"""
import json
import random

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

n = len(eleitores)
print(f'Total: {n} eleitores')

alterados = 0

# 1. Converter 34 G4_baixa -> G3_media_baixa
# Escolher eleitores G4_baixa que fazem sentido migrar (CLT, autonomo)
g4_para_g3 = [e for e in eleitores if e.get('cluster_socioeconomico') == 'G4_baixa'
              and e.get('ocupacao_vinculo') in ['clt', 'autonomo', 'servidor_publico']]
random.shuffle(g4_para_g3)

for e in g4_para_g3[:34]:
    e['cluster_socioeconomico'] = 'G3_media_baixa'
    # Ajustar renda para ser coerente
    if e.get('renda_salarios_minimos') == 'ate_1':
        e['renda_salarios_minimos'] = random.choice(['1_a_2', '2_a_3'])
    alterados += 1

print(f'G4_baixa -> G3_media_baixa: {min(34, len(g4_para_g3))} eleitores')

# 2. Converter 31 apoiador_forte -> critico_forte
# Escolher apoiadores que podem virar críticos (mais jovens, urbanos, maior escolaridade)
apoiadores_forte = [e for e in eleitores if e.get('posicao_bolsonaro') == 'apoiador_forte']
random.shuffle(apoiadores_forte)

for e in apoiadores_forte[:31]:
    e['posicao_bolsonaro'] = 'critico_forte'
    # Ajustar orientação política para ser coerente
    e['orientacao_politica'] = random.choice(['esquerda', 'centro_esquerda', 'centro'])
    # Ajustar valores e medos
    e['valores'] = random.sample(['Igualdade social', 'Direitos humanos', 'Educacao publica', 'Saude publica', 'Meio ambiente', 'Democracia'], 3)
    e['medos'] = random.sample(['Desemprego', 'Violencia', 'Desigualdade', 'Autoritarismo', 'Retrocesso'], 3)
    e['preocupacoes'] = random.sample(['Desemprego', 'Custo de vida', 'Saude', 'Educacao', 'Democracia'], 3)
    # Atualizar história
    primeiro_nome = e['nome'].split()[0]
    e['historia_resumida'] = e['historia_resumida'].split('.')[0] + '. Critico(a) do bolsonarismo, preocupa-se com a democracia.'
    alterados += 1

print(f'apoiador_forte -> critico_forte: {min(31, len(apoiadores_forte))} eleitores')

# 3. Converter 10 apoiador_forte -> critico_moderado
apoiadores_restantes = [e for e in eleitores if e.get('posicao_bolsonaro') == 'apoiador_forte']
random.shuffle(apoiadores_restantes)

for e in apoiadores_restantes[:12]:
    e['posicao_bolsonaro'] = 'critico_moderado'
    e['orientacao_politica'] = random.choice(['centro_esquerda', 'centro'])
    e['valores'] = random.sample(['Equilibrio', 'Pragmatismo', 'Educacao', 'Saude', 'Trabalho'], 3)
    primeiro_nome = e['nome'].split()[0]
    e['historia_resumida'] = e['historia_resumida'].split('.')[0] + '. Tem criticas ao governo Bolsonaro mas nao e radical.'
    alterados += 1

print(f'apoiador_forte -> critico_moderado: {min(12, len(apoiadores_restantes))} eleitores')

print(f'\nTotal de alteracoes: {alterados}')

# Verificar resultados
g3 = sum(1 for e in eleitores if e.get('cluster_socioeconomico') == 'G3_media_baixa')
g4 = sum(1 for e in eleitores if e.get('cluster_socioeconomico') == 'G4_baixa')
cf = sum(1 for e in eleitores if e.get('posicao_bolsonaro') == 'critico_forte')
cm = sum(1 for e in eleitores if e.get('posicao_bolsonaro') == 'critico_moderado')
af = sum(1 for e in eleitores if e.get('posicao_bolsonaro') == 'apoiador_forte')

print(f'\n=== NOVAS DISTRIBUICOES ===')
print(f'G3_media_baixa: {g3} ({100*g3/n:.1f}%) - meta: 38.2%')
print(f'G4_baixa: {g4} ({100*g4/n:.1f}%) - meta: 28.2%')
print(f'critico_forte: {cf} ({100*cf/n:.1f}%) - meta: 34%')
print(f'critico_moderado: {cm} ({100*cm/n:.1f}%) - meta: 18%')
print(f'apoiador_forte: {af} ({100*af/n:.1f}%) - meta: 15%')

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('\nSalvo em agentes/banco-eleitores-df.json')

with open('frontend/src/data/eleitores-df-400.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('Copiado para frontend/src/data/eleitores-df-400.json')
