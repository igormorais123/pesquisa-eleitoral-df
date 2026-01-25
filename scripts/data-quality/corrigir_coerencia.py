#!/usr/bin/env python3
"""Corrige incoerências de dados nos eleitores"""
import json
import random
import re

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f'Total: {len(eleitores)} eleitores')
correcoes = 0

# 1. Corrigir "depois de casar" quando estado_civil não é casado(a)
ids_casar = ['df-0003', 'df-0100', 'df-0113', 'df-0155', 'df-0165', 'df-0188',
             'df-0205', 'df-0227', 'df-0306', 'df-0326', 'df-0342', 'df-0364', 'df-0372']

for e in eleitores:
    if e['id'] in ids_casar:
        # Trocar estado_civil para casado(a) já que a história menciona casamento
        e['estado_civil'] = 'casado(a)'
        correcoes += 1

print(f'1. "depois de casar" com estado_civil errado: {len(ids_casar)} corrigidos')

# 2. Corrigir união estável com "Casado(a)" na história
for e in eleitores:
    if e.get('estado_civil') == 'uniao_estavel':
        historia = e.get('historia_resumida', '')
        if 'Casado(a)' in historia or 'casado(a)' in historia:
            # Substituir na história
            e['historia_resumida'] = historia.replace('Casado(a)', 'Em uniao estavel').replace('casado(a)', 'em uniao estavel')
            correcoes += 1

print(f'2. uniao_estavel com "Casado(a)" na historia: corrigidos')

# 3. Corrigir nome duplicado - mudar nome do df-0749
for e in eleitores:
    if e['id'] == 'df-0749' and 'Rafaela' in e['nome']:
        e['nome'] = 'Raissa Ramos Silva'
        e['historia_resumida'] = e['historia_resumida'].replace('Rafaela', 'Raissa')
        correcoes += 1
        print(f'3. Nome duplicado df-0749: Rafaela -> Raissa')

# 4. Corrigir menor de idade com renda alta (df-0659)
for e in eleitores:
    if e['id'] == 'df-0659':
        if e.get('idade', 18) < 18 and e.get('renda_salarios_minimos') == 'mais_de_20':
            e['renda_salarios_minimos'] = 'ate_1'
            e['ocupacao_vinculo'] = 'estudante'
            correcoes += 1
            print(f'4. Menor df-0659 com renda alta: corrigido para ate_1')

# 5. Corrigir aposentados com menos de 50 anos
aposentados_jovens = 0
for e in eleitores:
    if e.get('ocupacao_vinculo') == 'aposentado' and e.get('idade', 60) < 50:
        # Mudar para autonomo ou CLT
        e['ocupacao_vinculo'] = random.choice(['autonomo', 'clt', 'informal'])
        e['profissao'] = random.choice(['Trabalhador(a) autonomo', 'Prestador de servicos', 'Comerciante'])
        # Atualizar história se menciona aposentado
        if 'aposentado' in e.get('historia_resumida', '').lower():
            e['historia_resumida'] = e['historia_resumida'].replace('aposentado(a)', 'autonomo(a)').replace('Aposentado(a)', 'Autonomo(a)')
        aposentados_jovens += 1
        correcoes += 1

print(f'5. Aposentados < 50 anos: {aposentados_jovens} corrigidos')

# 6. Verificar e corrigir estudantes > 40 anos (tornar realista)
estudantes_velhos = 0
for e in eleitores:
    if e.get('ocupacao_vinculo') == 'estudante' and e.get('idade', 20) > 45:
        # Manter como estudante mas ajustar profissão para indicar educação tardia
        e['profissao'] = 'Estudante universitario (graduacao tardia)'
        estudantes_velhos += 1

print(f'6. Estudantes > 45 anos: {estudantes_velhos} ajustados (graduacao tardia)')

# 7. Verificar CLT com menores de 18
menores_clt = 0
for e in eleitores:
    if e.get('ocupacao_vinculo') == 'clt' and e.get('idade', 18) < 18:
        e['ocupacao_vinculo'] = 'estudante'
        e['profissao'] = 'Estudante'
        menores_clt += 1
        correcoes += 1

print(f'7. Menores de 18 com CLT: {menores_clt} corrigidos para estudante')

# 8. Garantir coerência orientação política x posição Bolsonaro
incoerentes_politicos = 0
for e in eleitores:
    pos = e.get('posicao_bolsonaro')
    ori = e.get('orientacao_politica')

    # Direita com critico_forte = incoerente
    if pos == 'critico_forte' and ori in ['direita', 'centro_direita']:
        e['orientacao_politica'] = random.choice(['esquerda', 'centro_esquerda', 'centro'])
        incoerentes_politicos += 1
        correcoes += 1

    # Esquerda com apoiador_forte = incoerente
    if pos == 'apoiador_forte' and ori in ['esquerda', 'centro_esquerda']:
        e['orientacao_politica'] = random.choice(['direita', 'centro_direita'])
        incoerentes_politicos += 1
        correcoes += 1

print(f'8. Incoerencias politicas (orientacao x Bolsonaro): {incoerentes_politicos} corrigidos')

print(f'\n=== TOTAL DE CORRECOES: {correcoes} ===')

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('\nSalvo em agentes/banco-eleitores-df.json')

with open('frontend/src/data/eleitores-df-400.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)
print('Copiado para frontend/src/data/eleitores-df-400.json')
