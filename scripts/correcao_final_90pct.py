#!/usr/bin/env python3
"""
Script para atingir 90% de conformidade
Corrige: orientação política, posição Bolsonaro, ocupação CLT
"""

import json
import random
from collections import Counter

random.seed(42)

# Carregar dados
with open("agentes/banco-eleitores-df.json", "r", encoding="utf-8") as f:
    eleitores = json.load(f)

print(f"Total de eleitores: {len(eleitores)}")

# ================================================================
# METAS (referências oficiais)
# ================================================================
META_ORIENTACAO = {
    "esquerda": 250,  # 25%
    "centro_esquerda": 150,  # 15%
    "centro": 160,  # 16%
    "centro_direita": 150,  # 15%
    "direita": 290,  # 29%
}

META_BOLSONARO = {
    "critico_forte": 340,  # 34%
    "critico_moderado": 200,  # 20%
    "neutro": 200,  # 20%
    "apoiador_moderado": 110,  # 11%
    "apoiador_forte": 150,  # 15%
}

META_OCUPACAO = {
    "clt": 375,  # 37.5%
    "autonomo": 150,  # 15%
    "servidor_publico": 120,  # 12%
    "informal": 100,  # 10%
    "desempregado": 75,  # 7.5%
    "aposentado": 100,  # 10%
    "estudante": 50,  # 5%
    "empresario": 30,  # 3%
}

# ================================================================
# 1. CORRIGIR ORIENTAÇÃO POLÍTICA
# ================================================================
print("\n=== CORRIGINDO ORIENTAÇÃO POLÍTICA ===")

atual_orient = Counter(e["orientacao_politica"] for e in eleitores)
print(f"Antes: {dict(atual_orient)}")

# Precisamos reduzir direita de 560 para 290 (270 a menos)
# E aumentar outras categorias

# Criar índices por orientação
indices_por_orient = {}
for i, e in enumerate(eleitores):
    orient = e["orientacao_politica"]
    if orient not in indices_por_orient:
        indices_por_orient[orient] = []
    indices_por_orient[orient].append(i)

# Calcular diferenças
diffs = {}
for cat, meta in META_ORIENTACAO.items():
    atual = atual_orient.get(cat, 0)
    diffs[cat] = meta - atual
    print(f"  {cat}: {atual} -> {meta} (diff: {diffs[cat]:+d})")

# Pegar eleitores de direita que podem mudar (não são apoiador_forte de Bolsonaro)
candidatos_mudar = []
for i in indices_por_orient.get("direita", []):
    e = eleitores[i]
    # Preferir mudar quem não é apoiador forte
    if e["posicao_bolsonaro"] not in ["apoiador_forte"]:
        candidatos_mudar.append(i)

random.shuffle(candidatos_mudar)
print(f"\nCandidatos de direita para redistribuir: {len(candidatos_mudar)}")

# Redistribuir para categorias que precisam aumentar
categorias_aumentar = [(cat, diff) for cat, diff in diffs.items() if diff > 0]
idx_candidato = 0

for cat, quantidade in categorias_aumentar:
    mudados = 0
    while mudados < quantidade and idx_candidato < len(candidatos_mudar):
        i = candidatos_mudar[idx_candidato]
        e = eleitores[i]

        # Verificar coerência: esquerda não pode ser apoiador de Bolsonaro
        if cat in ["esquerda", "centro_esquerda"]:
            if e["posicao_bolsonaro"] in ["apoiador_forte", "apoiador_moderado"]:
                idx_candidato += 1
                continue

        # Aplicar mudança
        eleitores[i]["orientacao_politica"] = cat
        mudados += 1
        idx_candidato += 1

    print(f"  Mudados para {cat}: {mudados}")

# Verificar resultado
atual_orient = Counter(e["orientacao_politica"] for e in eleitores)
print(f"\nDepois: {dict(atual_orient)}")

# ================================================================
# 2. CORRIGIR POSIÇÃO BOLSONARO
# ================================================================
print("\n=== CORRIGINDO POSIÇÃO BOLSONARO ===")

# Remover opositor_forte (categoria não existe na meta)
for e in eleitores:
    if e["posicao_bolsonaro"] == "opositor_forte":
        e["posicao_bolsonaro"] = "critico_forte"

atual_bolso = Counter(e["posicao_bolsonaro"] for e in eleitores)
print(f"Antes: {dict(atual_bolso)}")

# Criar índices por posição
indices_por_bolso = {}
for i, e in enumerate(eleitores):
    pos = e["posicao_bolsonaro"]
    if pos not in indices_por_bolso:
        indices_por_bolso[pos] = []
    indices_por_bolso[pos].append(i)

# Calcular diferenças
diffs_bolso = {}
for cat, meta in META_BOLSONARO.items():
    atual = atual_bolso.get(cat, 0)
    diffs_bolso[cat] = meta - atual
    print(f"  {cat}: {atual} -> {meta} (diff: {diffs_bolso[cat]:+d})")

# Precisamos aumentar critico_forte (+94) e diminuir apoiador_moderado (-56), neutro (-29), apoiador_forte (-11)

# Pegar de apoiador_moderado e neutro para critico_forte
candidatos_para_critico = []

# De apoiador_moderado: apenas os de esquerda/centro_esquerda
for i in indices_por_bolso.get("apoiador_moderado", []):
    e = eleitores[i]
    if e["orientacao_politica"] in ["esquerda", "centro_esquerda", "centro"]:
        candidatos_para_critico.append(i)

# De neutro: apenas os de esquerda/centro_esquerda
for i in indices_por_bolso.get("neutro", []):
    e = eleitores[i]
    if e["orientacao_politica"] in ["esquerda", "centro_esquerda"]:
        candidatos_para_critico.append(i)

random.shuffle(candidatos_para_critico)

# Converter para critico_forte
quantidade_critico = min(diffs_bolso["critico_forte"], len(candidatos_para_critico))
for i in range(quantidade_critico):
    idx = candidatos_para_critico[i]
    eleitores[idx]["posicao_bolsonaro"] = "critico_forte"

print(f"  Convertidos para critico_forte: {quantidade_critico}")

# Agora ajustar apoiador_forte -> critico_moderado (para os de centro)
for i in indices_por_bolso.get("apoiador_forte", []):
    e = eleitores[i]
    if e["orientacao_politica"] in ["centro", "centro_esquerda", "esquerda"]:
        eleitores[i]["posicao_bolsonaro"] = "critico_moderado"
        print(
            f"  Corrigido apoiador_forte de {e['orientacao_politica']} -> critico_moderado"
        )

# Verificar resultado
atual_bolso = Counter(e["posicao_bolsonaro"] for e in eleitores)
print(f"\nDepois: {dict(atual_bolso)}")

# ================================================================
# 3. CORRIGIR OCUPAÇÃO CLT
# ================================================================
print("\n=== CORRIGINDO OCUPAÇÃO CLT ===")

atual_ocup = Counter(e["ocupacao_vinculo"] for e in eleitores)
print(f"Antes: {dict(atual_ocup)}")

# Calcular diferenças
diffs_ocup = {}
for cat, meta in META_OCUPACAO.items():
    atual = atual_ocup.get(cat, 0)
    diffs_ocup[cat] = meta - atual
    print(f"  {cat}: {atual} -> {meta} (diff: {diffs_ocup[cat]:+d})")

# Precisamos aumentar CLT (+111) e diminuir autônomo (-100), informal (-38)

# Candidatos para virar CLT (de autônomo e informal)
candidatos_clt = []
for i, e in enumerate(eleitores):
    if e["ocupacao_vinculo"] in ["autonomo", "informal"]:
        # Não pode ser aposentado ou estudante pela idade
        if e["idade"] >= 18 and e["idade"] < 65:
            candidatos_clt.append(i)

random.shuffle(candidatos_clt)

# Converter para CLT
quantidade_clt = min(abs(diffs_ocup["clt"]), len(candidatos_clt))
for i in range(quantidade_clt):
    idx = candidatos_clt[i]
    eleitores[idx]["ocupacao_vinculo"] = "clt"

print(f"  Convertidos para CLT: {quantidade_clt}")

# Verificar resultado
atual_ocup = Counter(e["ocupacao_vinculo"] for e in eleitores)
print(f"\nDepois: {dict(atual_ocup)}")

# ================================================================
# VERIFICAÇÃO FINAL DE COERÊNCIA
# ================================================================
print("\n=== VERIFICAÇÃO DE COERÊNCIA ===")

erros = 0

for e in eleitores:
    # Esquerda não pode ser apoiador de Bolsonaro
    if e["orientacao_politica"] in ["esquerda", "centro_esquerda"]:
        if e["posicao_bolsonaro"] in ["apoiador_forte", "apoiador_moderado"]:
            # Corrigir
            e["posicao_bolsonaro"] = "critico_moderado"
            erros += 1

    # Direita não pode ser crítico forte de Bolsonaro (geralmente)
    # Mas isso pode acontecer, então não corrigimos automaticamente

    # Aposentado deve ter idade >= 55
    if e["ocupacao_vinculo"] == "aposentado" and e["idade"] < 55:
        e["ocupacao_vinculo"] = "autonomo"
        erros += 1

    # Estudante deve ter idade < 30 geralmente
    if e["ocupacao_vinculo"] == "estudante" and e["idade"] > 35:
        e["ocupacao_vinculo"] = "clt"
        erros += 1

print(f"Erros de coerência corrigidos: {erros}")

# ================================================================
# SALVAR
# ================================================================
with open("agentes/banco-eleitores-df.json", "w", encoding="utf-8") as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)

print("\n✓ Arquivo salvo: agentes/banco-eleitores-df.json")

# ================================================================
# ESTATÍSTICAS FINAIS
# ================================================================
print("\n=== ESTATÍSTICAS FINAIS ===")

orient_final = Counter(e["orientacao_politica"] for e in eleitores)
bolso_final = Counter(e["posicao_bolsonaro"] for e in eleitores)
ocup_final = Counter(e["ocupacao_vinculo"] for e in eleitores)

print("\nOrientação Política:")
for cat in ["esquerda", "centro_esquerda", "centro", "centro_direita", "direita"]:
    atual = orient_final.get(cat, 0)
    meta = META_ORIENTACAO.get(cat, 0)
    desvio = abs(atual - meta) / 10
    status = "✓" if desvio <= 3 else "!" if desvio <= 7 else "X"
    print(f"  {status} {cat}: {atual} (meta: {meta}, desvio: {desvio:.1f}%)")

print("\nPosição Bolsonaro:")
for cat in [
    "critico_forte",
    "critico_moderado",
    "neutro",
    "apoiador_moderado",
    "apoiador_forte",
]:
    atual = bolso_final.get(cat, 0)
    meta = META_BOLSONARO.get(cat, 0)
    desvio = abs(atual - meta) / 10
    status = "✓" if desvio <= 3 else "!" if desvio <= 7 else "X"
    print(f"  {status} {cat}: {atual} (meta: {meta}, desvio: {desvio:.1f}%)")

print("\nOcupação:")
for cat in [
    "clt",
    "autonomo",
    "servidor_publico",
    "informal",
    "desempregado",
    "aposentado",
    "estudante",
    "empresario",
]:
    atual = ocup_final.get(cat, 0)
    meta = META_OCUPACAO.get(cat, 0)
    desvio = abs(atual - meta) / 10
    status = "✓" if desvio <= 3 else "!" if desvio <= 7 else "X"
    print(f"  {status} {cat}: {atual} (meta: {meta}, desvio: {desvio:.1f}%)")
