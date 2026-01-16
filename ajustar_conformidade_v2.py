#!/usr/bin/env python3
"""
Ajuste de conformidade v2 - mais agressivo
"""
import json
import random
from collections import Counter

random.seed(123)

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

n = len(eleitores)
ajustes = Counter()

print("=" * 70)
print("AJUSTE DE CONFORMIDADE v2")
print("=" * 70)

# ============================================================
# 1. POSICAO_BOLSONARO - ainda precisa de muitos criticos
# critico_ferrenho precisa +147, critico_moderado precisa +119
# ============================================================
print("\n[1] Ajustando posicao_bolsonaro (mais criticos)...")

# Fontes: apoiador_moderado (-41), neutro pode virar critico_moderado
# Regra: esquerda e centro_esquerda -> podem ser criticos
# centro -> pode ser critico_moderado ou neutro

# Primeiro: todos de esquerda/centro_esquerda que nao sao criticos -> critico
for e in eleitores:
    if e['orientacao_politica'] in ['esquerda', 'centro_esquerda']:
        if e['posicao_bolsonaro'] not in ['critico_ferrenho', 'critico_moderado']:
            if random.random() < 0.7:
                e['posicao_bolsonaro'] = 'critico_ferrenho'
            else:
                e['posicao_bolsonaro'] = 'critico_moderado'
            ajustes['posicao_bolsonaro'] += 1

# Segundo: centro pode ser critico_moderado
candidatos_centro = [e for e in eleitores
                     if e['orientacao_politica'] == 'centro'
                     and e['posicao_bolsonaro'] in ['neutro', 'apoiador_moderado']]
random.shuffle(candidatos_centro)
for e in candidatos_centro[:80]:
    e['posicao_bolsonaro'] = 'critico_moderado'
    ajustes['posicao_bolsonaro'] += 1

# Terceiro: reduzir apoiador_moderado de centro_direita para neutro
candidatos_neutro = [e for e in eleitores
                     if e['orientacao_politica'] == 'centro_direita'
                     and e['posicao_bolsonaro'] == 'apoiador_moderado']
random.shuffle(candidatos_neutro)
for e in candidatos_neutro[:40]:
    e['posicao_bolsonaro'] = 'neutro'
    ajustes['posicao_bolsonaro'] += 1

print(f"   Ajustes posicao_bolsonaro: {ajustes['posicao_bolsonaro']}")

# ============================================================
# 2. ESCOLARIDADE - rebalancear
# superior precisa -54, medio precisa +87
# ============================================================
print("\n[2] Ajustando escolaridade...")

# Superior -> medio (apenas em clusters mais baixos para coerencia)
candidatos_medio = [e for e in eleitores
                    if e['escolaridade'] == 'superior_completo_ou_pos'
                    and e['cluster_socioeconomico'] in ['G2_media_alta', 'G3_media_baixa']]
random.shuffle(candidatos_medio)
for e in candidatos_medio[:54]:
    e['escolaridade'] = 'medio_completo_ou_sup_incompleto'
    ajustes['escolaridade'] += 1

# Fundamental -> medio (geral)
candidatos_medio2 = [e for e in eleitores
                     if e['escolaridade'] == 'fundamental_ou_sem_instrucao']
random.shuffle(candidatos_medio2)
for e in candidatos_medio2[:33]:
    e['escolaridade'] = 'medio_completo_ou_sup_incompleto'
    ajustes['escolaridade'] += 1

print(f"   Ajustes escolaridade: {ajustes['escolaridade']}")

# ============================================================
# 3. RENDA - rebalancear
# mais_de_5_ate_10 precisa -63, mais_de_10_ate_20 precisa -40
# mais_de_2_ate_5 precisa +64, mais_de_1_ate_2 precisa +31
# ============================================================
print("\n[3] Ajustando renda...")

# Rendas altas -> medias (apenas em clusters medios/baixos)
candidatos_renda_media = [e for e in eleitores
                          if e['renda_salarios_minimos'] in ['mais_de_5_ate_10', 'mais_de_10_ate_20']
                          and e['cluster_socioeconomico'] in ['G2_media_alta', 'G3_media_baixa']]
random.shuffle(candidatos_renda_media)
for e in candidatos_renda_media[:63]:
    e['renda_salarios_minimos'] = 'mais_de_2_ate_5'
    ajustes['renda'] += 1

for e in candidatos_renda_media[63:100]:
    e['renda_salarios_minimos'] = 'mais_de_1_ate_2'
    ajustes['renda'] += 1

print(f"   Ajustes renda: {ajustes['renda']}")

# ============================================================
# 4. INTERESSE_POLITICO - verificar referencia correta
# Ref no verificar_indice_final: baixo=35, medio=45, alto=20
# ============================================================
print("\n[4] Verificando interesse_politico...")

contagem_interesse = Counter(e['interesse_politico'] for e in eleitores)
print(f"   Atual: {dict(contagem_interesse)}")

# Se medio > 45% converter alguns para baixo
if contagem_interesse['medio'] > 450:
    candidatos_baixo = [e for e in eleitores if e['interesse_politico'] == 'medio']
    random.shuffle(candidatos_baixo)
    diff = contagem_interesse['medio'] - 450
    for e in candidatos_baixo[:diff]:
        e['interesse_politico'] = 'baixo'
        ajustes['interesse_politico'] += 1

# Se baixo > 35% converter alguns para medio
elif contagem_interesse['baixo'] > 350:
    candidatos_medio = [e for e in eleitores if e['interesse_politico'] == 'baixo']
    random.shuffle(candidatos_medio)
    diff = contagem_interesse['baixo'] - 350
    for e in candidatos_medio[:diff]:
        e['interesse_politico'] = 'medio'
        ajustes['interesse_politico'] += 1

print(f"   Ajustes interesse_politico: {ajustes['interesse_politico']}")

# ============================================================
# 5. VERIFICAR E CORRIGIR HISTORIAS
# ============================================================
print("\n[5] Verificando historias...")

historias_ajustadas = 0
for e in eleitores:
    historia = e.get('historia_resumida', '')
    idade = e['idade']
    genero = e['genero']
    filhos = e.get('filhos', 0)
    estado_civil = e.get('estado_civil', '')
    ocupacao = e.get('ocupacao_vinculo', '')

    nova_historia = historia

    # Corrigir genero na historia
    if genero == 'feminino':
        # Substituir termos masculinos por femininos (exceto genericos)
        nova_historia = nova_historia.replace(' aposentado ', ' aposentada ')
        nova_historia = nova_historia.replace(' casado ', ' casada ')
        nova_historia = nova_historia.replace(' divorciado ', ' divorciada ')
    elif genero == 'masculino':
        nova_historia = nova_historia.replace(' aposentada ', ' aposentado ')
        nova_historia = nova_historia.replace(' casada ', ' casado ')
        nova_historia = nova_historia.replace(' divorciada ', ' divorciado ')

    # Corrigir mencao de filhos
    if filhos == 0:
        if 'filho(s)' in nova_historia and 'sem filho' not in nova_historia.lower():
            # Verificar se fala de ter filhos
            if 'com' in nova_historia.lower() and 'filho' in nova_historia.lower():
                nova_historia = nova_historia.replace('1 filho(s)', 'nenhum filho')
                nova_historia = nova_historia.replace('2 filho(s)', 'nenhum filho')
                nova_historia = nova_historia.replace('3 filho(s)', 'nenhum filho')

    if nova_historia != historia:
        e['historia_resumida'] = nova_historia
        historias_ajustadas += 1

print(f"   Historias ajustadas: {historias_ajustadas}")

# ============================================================
# SALVAR
# ============================================================
print("\n" + "=" * 70)
print("SALVANDO...")
print("=" * 70)

with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)

print(f"\nTotal de ajustes: {sum(ajustes.values())}")
print("Dados salvos.")
