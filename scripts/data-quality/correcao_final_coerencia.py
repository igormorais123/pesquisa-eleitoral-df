"""
Correção Final de Coerência
- Ajusta escolaridade para padrão correto
- Corrige incoerências renda vs classe
- Ajusta G4_baixa para target
"""
import json
import random
from collections import Counter

random.seed(2026)

# Carregar dados
with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f"Total de eleitores: {len(eleitores)}")

# ==============================================================================
# 1. PADRONIZAR ESCOLARIDADE
# ==============================================================================
print("\n[1] Padronizando escolaridade...")

mapa_escolaridade = {
    'superior_completo_ou_pos': 'superior_ou_pos',
    'superior_ou_pos': 'superior_ou_pos',
    'medio_completo_ou_sup_incompleto': 'medio_completo_ou_sup_incompleto',
    'fundamental_ou_sem_instrucao': 'fundamental_ou_sem_instrucao',
}

for e in eleitores:
    esc = e.get('escolaridade', 'medio_completo_ou_sup_incompleto')
    e['escolaridade'] = mapa_escolaridade.get(esc, esc)

contagem = Counter(e['escolaridade'] for e in eleitores)
print(f"  Após padronização: {dict(contagem)}")

# ==============================================================================
# 2. CORRIGIR INCOERÊNCIAS RENDA VS CLASSE
# ==============================================================================
print("\n[2] Corrigindo incoerências renda vs classe...")

# Definir coerência entre renda e classe
# G1_alta: mais_de_5_ate_10, mais_de_10_ate_20, mais_de_20
# G2_media_alta: mais_de_2_ate_5, mais_de_5_ate_10
# G3_media_baixa: mais_de_1_ate_2, mais_de_2_ate_5
# G4_baixa: ate_1, mais_de_1_ate_2

coerencia_renda_classe = {
    'G1_alta': ['mais_de_5_ate_10', 'mais_de_10_ate_20', 'mais_de_20'],
    'G2_media_alta': ['mais_de_2_ate_5', 'mais_de_5_ate_10'],
    'G3_media_baixa': ['mais_de_1_ate_2', 'mais_de_2_ate_5'],
    'G4_baixa': ['ate_1', 'mais_de_1_ate_2'],
}

SM_2026 = 1502.00
ranges_renda = {
    'ate_1': (600, SM_2026),
    'mais_de_1_ate_2': (SM_2026 * 1.01, SM_2026 * 2),
    'mais_de_2_ate_5': (SM_2026 * 2.01, SM_2026 * 5),
    'mais_de_5_ate_10': (SM_2026 * 5.01, SM_2026 * 10),
    'mais_de_10_ate_20': (SM_2026 * 10.01, SM_2026 * 20),
    'mais_de_20': (SM_2026 * 20.01, SM_2026 * 50),
}

incoerentes = 0
corrigidos = 0

for e in eleitores:
    renda = e.get('renda_salarios_minimos', 'mais_de_1_ate_2')
    classe = e.get('cluster_socioeconomico', 'G3_media_baixa')

    rendas_validas = coerencia_renda_classe.get(classe, [])

    if renda not in rendas_validas:
        incoerentes += 1

        # Estratégia: Ajustar a classe para ser coerente com a renda
        # (melhor do que mudar a renda, que afeta distribuição já corrigida)

        nova_classe = None
        if renda in ['mais_de_10_ate_20', 'mais_de_20']:
            nova_classe = 'G1_alta'
        elif renda in ['mais_de_5_ate_10']:
            # Pode ser G1 ou G2
            nova_classe = random.choice(['G1_alta', 'G2_media_alta'])
        elif renda in ['mais_de_2_ate_5']:
            nova_classe = 'G2_media_alta'
        elif renda in ['mais_de_1_ate_2']:
            nova_classe = 'G3_media_baixa'
        elif renda == 'ate_1':
            nova_classe = 'G4_baixa'

        if nova_classe and nova_classe != classe:
            e['cluster_socioeconomico'] = nova_classe
            e['classe_social'] = {
                'G1_alta': 'alta',
                'G2_media_alta': 'media_alta',
                'G3_media_baixa': 'media_baixa',
                'G4_baixa': 'baixa'
            }[nova_classe]
            corrigidos += 1

print(f"  Incoerentes encontrados: {incoerentes}")
print(f"  Corrigidos: {corrigidos}")

# ==============================================================================
# 3. REBALANCEAR CLASSE SOCIAL PARA TARGETS
# ==============================================================================
print("\n[3] Rebalanceando classe social...")

targets_classe = {
    'G1_alta': 181,
    'G2_media_alta': 208,
    'G3_media_baixa': 329,
    'G4_baixa': 282
}

contagem_classe = Counter(e['cluster_socioeconomico'] for e in eleitores)
print(f"  Antes do rebalanceamento: {dict(contagem_classe)}")

# Verificar quais classes precisam de ajuste
for classe, target in targets_classe.items():
    atual = contagem_classe.get(classe, 0)
    diff = atual - target

    if diff > 0:
        # Excesso - precisa mover para outras classes
        print(f"  {classe}: excesso de {diff}, movendo...")

        # Encontrar classes com déficit
        for classe_destino, target_dest in targets_classe.items():
            if contagem_classe.get(classe_destino, 0) < target_dest:
                deficit = target_dest - contagem_classe.get(classe_destino, 0)
                mover = min(diff, deficit)

                # Encontrar eleitores para mover (que tenham renda compatível)
                rendas_validas = coerencia_renda_classe[classe_destino]

                candidatos = []
                for i, e in enumerate(eleitores):
                    if e['cluster_socioeconomico'] == classe:
                        renda = e['renda_salarios_minimos']
                        # Só mover se a renda for compatível com destino
                        if renda in rendas_validas:
                            candidatos.append(i)

                random.shuffle(candidatos)
                for idx in candidatos[:mover]:
                    eleitores[idx]['cluster_socioeconomico'] = classe_destino
                    eleitores[idx]['classe_social'] = {
                        'G1_alta': 'alta',
                        'G2_media_alta': 'media_alta',
                        'G3_media_baixa': 'media_baixa',
                        'G4_baixa': 'baixa'
                    }[classe_destino]
                    contagem_classe[classe] -= 1
                    contagem_classe[classe_destino] += 1
                    diff -= 1

                    if diff <= 0:
                        break

contagem_classe_final = Counter(e['cluster_socioeconomico'] for e in eleitores)
print(f"  Após rebalanceamento: {dict(contagem_classe_final)}")

# ==============================================================================
# 4. AJUSTAR ESCOLARIDADE PARA TARGETS
# ==============================================================================
print("\n[4] Ajustando escolaridade...")

targets_escolaridade = {
    'superior_ou_pos': 370,         # 37%
    'medio_completo_ou_sup_incompleto': 438,  # 43.8%
    'fundamental_ou_sem_instrucao': 192       # 19.2%
}

contagem_esc = Counter(e['escolaridade'] for e in eleitores)
print(f"  Antes: {dict(contagem_esc)}")

# Ajustar
for esc_alvo, target in targets_escolaridade.items():
    atual = contagem_esc.get(esc_alvo, 0)
    if atual < target:
        faltando = target - atual

        # Pegar de escolaridades com excesso
        for esc_fonte in ['medio_completo_ou_sup_incompleto', 'fundamental_ou_sem_instrucao']:
            if contagem_esc.get(esc_fonte, 0) > targets_escolaridade[esc_fonte]:
                excesso = contagem_esc[esc_fonte] - targets_escolaridade[esc_fonte]
                mover = min(faltando, excesso)

                # Encontrar candidatos coerentes
                candidatos = []
                for i, e in enumerate(eleitores):
                    if e['escolaridade'] == esc_fonte:
                        score = 0
                        if esc_alvo == 'superior_ou_pos':
                            # Preferir classes mais altas e profissões que exigem formação
                            if e['cluster_socioeconomico'] in ['G1_alta', 'G2_media_alta']:
                                score += 3
                            if e.get('ocupacao_vinculo') == 'servidor_publico':
                                score += 2
                            if 'professor' in e.get('profissao', '').lower() or 'médic' in e.get('profissao', '').lower():
                                score += 3
                        candidatos.append((i, score))

                candidatos.sort(key=lambda x: -x[1])
                for idx, _ in candidatos[:mover]:
                    eleitores[idx]['escolaridade'] = esc_alvo
                    contagem_esc[esc_fonte] -= 1
                    contagem_esc[esc_alvo] = contagem_esc.get(esc_alvo, 0) + 1
                    faltando -= 1
                    if faltando <= 0:
                        break

                if faltando <= 0:
                    break

contagem_esc_final = Counter(e['escolaridade'] for e in eleitores)
print(f"  Depois: {dict(contagem_esc_final)}")

# ==============================================================================
# 5. CORRIGIR VOTO FACULTATIVO
# ==============================================================================
print("\n[5] Corrigindo voto facultativo...")

corrigidos_voto = 0
for e in eleitores:
    idade = e['idade']
    deveria_ser_facultativo = (16 <= idade <= 17) or (idade >= 70)
    voto_fac = e.get('voto_facultativo', False)

    if deveria_ser_facultativo != voto_fac:
        e['voto_facultativo'] = deveria_ser_facultativo
        corrigidos_voto += 1

print(f"  Corrigidos: {corrigidos_voto}")

# ==============================================================================
# 6. SALVAR
# ==============================================================================
print("\n[6] Salvando...")

with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)

print("Arquivo salvo!")

# ==============================================================================
# RESUMO FINAL
# ==============================================================================
print("\n" + "=" * 60)
print("RESUMO FINAL")
print("=" * 60)

print("\nDistribuição de Classe Social:")
for classe, n in Counter(e['cluster_socioeconomico'] for e in eleitores).most_common():
    pct = 100 * n / len(eleitores)
    target = targets_classe.get(classe, 0) / 10
    print(f"  {classe}: {n} ({pct:.1f}%) - target: {target:.1f}%")

print("\nDistribuição de Escolaridade:")
for esc, n in Counter(e['escolaridade'] for e in eleitores).most_common():
    pct = 100 * n / len(eleitores)
    print(f"  {esc}: {n} ({pct:.1f}%)")

# Verificar incoerências restantes
incoerentes_restantes = 0
for e in eleitores:
    renda = e.get('renda_salarios_minimos', '')
    classe = e.get('cluster_socioeconomico', '')
    rendas_validas = coerencia_renda_classe.get(classe, [])
    if renda not in rendas_validas:
        incoerentes_restantes += 1

print(f"\nIncoerências renda-classe restantes: {incoerentes_restantes}")
