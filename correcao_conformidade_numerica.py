"""
Script de Correção de Conformidade e Transformação Numérica
- Remapeia estilo_decisao para valores corretos
- Adiciona campos numéricos (renda_mensal, tempo_deslocamento_minutos)
- Ajusta distribuições mantendo coerência interna dos eleitores
"""
import json
import random
from collections import Counter
from copy import deepcopy

random.seed(2026)  # Reproducibilidade

# Carregar dados
with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f"Total de eleitores: {len(eleitores)}")

# ==============================================================================
# 1. REMAPEAR ESTILO DE DECISÃO
# ==============================================================================
print("\n[1] Remapeando estilo_decisao...")

# Mapeamento atual -> novo (com base na semântica)
mapa_estilo = {
    'emocional_intuitivo': 'emocional',      # ~37% -> dividir entre emocional e identitario
    'pragmatico': 'pragmatico',               # manter ~23%
    'ideologico': 'identitario',              # remapear para identitario
    'racional_analitico': 'economico',        # remapear para economico (decisão racional = bolso)
    'influenciavel': 'emocional',             # remapear para emocional
}

# Targets: identitario=25%, pragmatico=20%, moral=15%, economico=25%, emocional=15%
# Total = 100% (1000 eleitores)
targets_estilo = {
    'identitario': 250,
    'economico': 250,
    'pragmatico': 200,
    'moral': 150,
    'emocional': 150
}

# Primeiro passo: remapear todos
for e in eleitores:
    estilo_atual = e.get('estilo_decisao', 'pragmatico')
    e['estilo_decisao'] = mapa_estilo.get(estilo_atual, 'pragmatico')

# Contagem após remapeamento inicial
contagem = Counter(e['estilo_decisao'] for e in eleitores)
print(f"  Após remapeamento inicial: {dict(contagem)}")

# Ajustar para atingir targets
# Vamos redistribuir mantendo coerência:
# - emocional -> identitario (se eleitor tem orientação política forte)
# - emocional -> moral (se eleitor tem religião forte e valores tradicionais)

# Primeiro, vamos corrigir os excessos e déficits
for estilo_alvo, target in targets_estilo.items():
    atual = contagem.get(estilo_alvo, 0)
    if atual < target:
        # Precisa adicionar mais deste estilo
        faltando = target - atual

        # Pegar de estilos com excesso
        for estilo_fonte in ['emocional', 'economico', 'pragmatico']:
            if contagem.get(estilo_fonte, 0) > targets_estilo[estilo_fonte]:
                excesso = contagem[estilo_fonte] - targets_estilo[estilo_fonte]
                converter = min(faltando, excesso)

                # Encontrar eleitores para converter (com coerência)
                candidatos = []
                for i, e in enumerate(eleitores):
                    if e['estilo_decisao'] == estilo_fonte:
                        score = 0
                        # Critérios de coerência para cada estilo alvo
                        if estilo_alvo == 'identitario':
                            # Identitário: orientação política forte, interesse político alto
                            if e.get('orientacao_politica') in ['esquerda', 'direita']:
                                score += 3
                            if e.get('interesse_politico') == 'alto':
                                score += 2
                            if e.get('tolerancia_nuance') == 'baixa':
                                score += 2
                        elif estilo_alvo == 'moral':
                            # Moral: religioso, valores tradicionais
                            if e.get('religiao') in ['evangelica', 'catolica']:
                                score += 3
                            valores = e.get('valores', [])
                            if any(v in ['Família', 'Fé', 'Tradição', 'Ordem'] for v in valores):
                                score += 2
                        elif estilo_alvo == 'economico':
                            # Econômico: preocupação com economia, renda
                            preocupacoes = e.get('preocupacoes', [])
                            if any('econom' in p.lower() or 'emprego' in p.lower() or 'inflação' in p.lower() for p in preocupacoes):
                                score += 3
                            medos = e.get('medos', [])
                            if any('emprego' in m.lower() or 'conta' in m.lower() or 'econom' in m.lower() for m in medos):
                                score += 2
                        elif estilo_alvo == 'emocional':
                            # Emocional: baixo interesse político, alta susceptibilidade
                            if e.get('interesse_politico') == 'baixo':
                                score += 2
                            if e.get('susceptibilidade_desinformacao') == 'alta':
                                score += 2

                        candidatos.append((i, score))

                # Ordenar por score e converter os melhores
                candidatos.sort(key=lambda x: -x[1])
                for idx, _ in candidatos[:converter]:
                    eleitores[idx]['estilo_decisao'] = estilo_alvo
                    contagem[estilo_fonte] -= 1
                    contagem[estilo_alvo] = contagem.get(estilo_alvo, 0) + 1
                    faltando -= 1
                    if faltando <= 0:
                        break

                if faltando <= 0:
                    break

contagem_final_estilo = Counter(e['estilo_decisao'] for e in eleitores)
print(f"  Final: {dict(contagem_final_estilo)}")

# ==============================================================================
# 2. ADICIONAR CAMPOS NUMÉRICOS - RENDA MENSAL
# ==============================================================================
print("\n[2] Adicionando renda_mensal (numérico em R$)...")

# Salário mínimo 2026 estimado
SM_2026 = 1502.00

# Faixas de renda -> ranges para gerar valor exato coerente
ranges_renda = {
    'ate_1': (600, SM_2026),
    'mais_de_1_ate_2': (SM_2026 * 1.01, SM_2026 * 2),
    'mais_de_2_ate_5': (SM_2026 * 2.01, SM_2026 * 5),
    'mais_de_5_ate_10': (SM_2026 * 5.01, SM_2026 * 10),
    'mais_de_10_ate_20': (SM_2026 * 10.01, SM_2026 * 20),
    'mais_de_20': (SM_2026 * 20.01, SM_2026 * 50),
}

# Coerência: ajustar renda baseado em profissão e ocupação
ajustes_ocupacao = {
    'servidor_publico': 1.3,
    'empresario': 2.0,
    'clt': 1.0,
    'autonomo': 0.9,
    'informal': 0.7,
    'desempregado': 0.4,
    'aposentado': 0.8,
    'estudante': 0.5,
}

for e in eleitores:
    faixa = e.get('renda_salarios_minimos', 'mais_de_1_ate_2')
    min_val, max_val = ranges_renda.get(faixa, (SM_2026, SM_2026 * 2))

    # Gerar valor base
    base = random.uniform(min_val, max_val)

    # Ajustar por ocupação (dentro da faixa)
    ocupacao = e.get('ocupacao_vinculo', 'clt')
    ajuste = ajustes_ocupacao.get(ocupacao, 1.0)

    # Aplicar ajuste mas manter dentro dos limites da faixa
    valor_ajustado = base * ajuste
    valor_ajustado = max(min_val, min(max_val, valor_ajustado))

    # Arredondar para valor "realista"
    e['renda_mensal'] = round(valor_ajustado, 2)

print(f"  Exemplos: {[e['renda_mensal'] for e in eleitores[:5]]}")

# ==============================================================================
# 3. ADICIONAR CAMPOS NUMÉRICOS - TEMPO DESLOCAMENTO EM MINUTOS
# ==============================================================================
print("\n[3] Adicionando tempo_deslocamento_minutos (numérico)...")

# Mapeamento de faixas para ranges
ranges_tempo = {
    'nao_se_aplica': (0, 0),
    'ate_15': (5, 15),
    '15_30': (16, 30),
    '30_45': (31, 45),
    '45_60': (46, 60),
    'mais_60': (61, 120),
}

for e in eleitores:
    faixa_tempo = e.get('tempo_deslocamento_trabalho', 'nao_se_aplica')
    min_t, max_t = ranges_tempo.get(faixa_tempo, (0, 0))

    if min_t == 0 and max_t == 0:
        e['tempo_deslocamento_minutos'] = 0
    else:
        e['tempo_deslocamento_minutos'] = random.randint(min_t, max_t)

print(f"  Exemplos: {[(e['tempo_deslocamento_trabalho'], e['tempo_deslocamento_minutos']) for e in eleitores[:5]]}")

# ==============================================================================
# 4. AJUSTAR CONFLITO IDENTITÁRIO (15.9% -> 25%)
# ==============================================================================
print("\n[4] Ajustando conflito_identitario para 25%...")

target_conflito = 250
atual_conflito = sum(1 for e in eleitores if e.get('conflito_identitario', False))
print(f"  Atual: {atual_conflito}, Target: {target_conflito}")

if atual_conflito < target_conflito:
    faltando = target_conflito - atual_conflito

    # Candidatos: eleitores sem conflito que têm características contraditórias
    candidatos = []
    for i, e in enumerate(eleitores):
        if not e.get('conflito_identitario', False):
            score = 0
            orient = e.get('orientacao_politica', '')
            valores = e.get('valores', [])
            religiao = e.get('religiao', '')
            pos_bolso = e.get('posicao_bolsonaro', '')

            # Conflito 1: Esquerda + Valores conservadores
            if orient in ['esquerda', 'centro_esquerda']:
                if any(v in ['Família', 'Tradição', 'Ordem', 'Fé'] for v in valores):
                    score += 3
                if religiao == 'evangelica':
                    score += 2

            # Conflito 2: Direita + Valores progressistas
            if orient in ['direita', 'centro_direita']:
                if any(v in ['Igualdade', 'Liberdade', 'Diversidade'] for v in valores):
                    score += 3
                if religiao in ['sem_religiao', 'outras']:
                    score += 2

            # Conflito 3: Apoiador Bolsonaro + Servidor Público
            if pos_bolso in ['apoiador_forte', 'apoiador_moderado']:
                if e.get('ocupacao_vinculo') == 'servidor_publico':
                    score += 2

            # Conflito 4: Opositor Bolsonaro + Evangélico
            if pos_bolso in ['opositor_forte', 'critico_forte']:
                if religiao == 'evangelica':
                    score += 2

            if score > 0:
                candidatos.append((i, score))

    # Ordenar por score e ativar conflito
    candidatos.sort(key=lambda x: -x[1])
    for idx, _ in candidatos[:faltando]:
        eleitores[idx]['conflito_identitario'] = True

conflito_final = sum(1 for e in eleitores if e.get('conflito_identitario', False))
print(f"  Final: {conflito_final} ({100*conflito_final/len(eleitores):.1f}%)")

# ==============================================================================
# 5. AJUSTAR DISTRIBUIÇÃO DE RENDA (mais ate_1 SM)
# ==============================================================================
print("\n[5] Ajustando distribuição de renda...")

# Targets baseados no PDAD 2021
targets_renda = {
    'ate_1': 285,          # 28.5%
    'mais_de_1_ate_2': 258, # 25.8%
    'mais_de_2_ate_5': 242, # 24.2%
    'mais_de_5_ate_10': 125, # 12.5%
    'mais_de_10_ate_20': 60, # 6.0%
    'mais_de_20': 30        # 3.0%
}

contagem_renda = Counter(e['renda_salarios_minimos'] for e in eleitores)
print(f"  Antes: {dict(contagem_renda)}")

# Ajustar de faixas com excesso para faixas com déficit
for faixa_alvo, target in targets_renda.items():
    atual = contagem_renda.get(faixa_alvo, 0)
    if atual < target:
        faltando = target - atual

        # Pegar de faixas com excesso (priorizar faixas adjacentes)
        ordem_fonte = ['mais_de_2_ate_5', 'mais_de_1_ate_2', 'mais_de_5_ate_10']

        for faixa_fonte in ordem_fonte:
            if contagem_renda.get(faixa_fonte, 0) > targets_renda[faixa_fonte]:
                excesso = contagem_renda[faixa_fonte] - targets_renda[faixa_fonte]
                converter = min(faltando, excesso)

                # Encontrar eleitores para converter (priorizar coerência)
                candidatos = []
                for i, e in enumerate(eleitores):
                    if e['renda_salarios_minimos'] == faixa_fonte:
                        score = 0

                        # Coerência: ocupações típicas de baixa renda
                        if faixa_alvo == 'ate_1':
                            if e.get('ocupacao_vinculo') in ['informal', 'desempregado', 'estudante']:
                                score += 3
                            if e.get('escolaridade') == 'fundamental_ou_sem_instrucao':
                                score += 2
                            if e.get('cluster_socioeconomico') in ['G4_baixa', 'G5_vulneravel']:
                                score += 2

                        candidatos.append((i, score))

                candidatos.sort(key=lambda x: -x[1])
                for idx, _ in candidatos[:converter]:
                    # Atualizar faixa
                    eleitores[idx]['renda_salarios_minimos'] = faixa_alvo

                    # Recalcular renda_mensal para manter coerência
                    min_val, max_val = ranges_renda.get(faixa_alvo, (SM_2026, SM_2026 * 2))
                    ocupacao = eleitores[idx].get('ocupacao_vinculo', 'clt')
                    ajuste = ajustes_ocupacao.get(ocupacao, 1.0)
                    base = random.uniform(min_val, max_val)
                    valor_ajustado = max(min_val, min(max_val, base * ajuste))
                    eleitores[idx]['renda_mensal'] = round(valor_ajustado, 2)

                    contagem_renda[faixa_fonte] -= 1
                    contagem_renda[faixa_alvo] = contagem_renda.get(faixa_alvo, 0) + 1
                    faltando -= 1
                    if faltando <= 0:
                        break

                if faltando <= 0:
                    break

contagem_renda_final = Counter(e['renda_salarios_minimos'] for e in eleitores)
print(f"  Depois: {dict(contagem_renda_final)}")

# ==============================================================================
# 6. AJUSTAR CLASSE SOCIAL (menos G3, mais G4_baixa)
# ==============================================================================
print("\n[6] Ajustando distribuição de classe social...")

# Targets PDAD 2021
targets_classe = {
    'G1_alta': 181,        # 18.1%
    'G2_media_alta': 208,  # 20.8%
    'G3_media_baixa': 329, # 32.9%
    'G4_baixa': 282        # 28.2%
}

contagem_classe = Counter(e['cluster_socioeconomico'] for e in eleitores)
print(f"  Antes: {dict(contagem_classe)}")

for classe_alvo, target in targets_classe.items():
    atual = contagem_classe.get(classe_alvo, 0)
    if atual < target:
        faltando = target - atual

        # Pegar de G3 (que tem excesso)
        if contagem_classe.get('G3_media_baixa', 0) > targets_classe['G3_media_baixa']:
            excesso = contagem_classe['G3_media_baixa'] - targets_classe['G3_media_baixa']
            converter = min(faltando, excesso)

            # Encontrar eleitores para converter
            candidatos = []
            for i, e in enumerate(eleitores):
                if e['cluster_socioeconomico'] == 'G3_media_baixa':
                    score = 0
                    renda = e.get('renda_salarios_minimos', '')

                    if classe_alvo == 'G4_baixa':
                        # Preferir quem tem renda baixa
                        if renda in ['ate_1', 'mais_de_1_ate_2']:
                            score += 3
                        if e.get('ocupacao_vinculo') in ['informal', 'desempregado']:
                            score += 2
                        if e.get('escolaridade') == 'fundamental_ou_sem_instrucao':
                            score += 2
                    elif classe_alvo == 'G1_alta':
                        # Preferir quem tem renda alta
                        if renda in ['mais_de_10_ate_20', 'mais_de_20']:
                            score += 3
                        if e.get('ocupacao_vinculo') in ['empresario']:
                            score += 2
                        if e.get('escolaridade') == 'superior_ou_pos':
                            score += 2
                    elif classe_alvo == 'G2_media_alta':
                        if renda in ['mais_de_5_ate_10', 'mais_de_10_ate_20']:
                            score += 3
                        if e.get('ocupacao_vinculo') in ['servidor_publico']:
                            score += 2

                    candidatos.append((i, score))

            candidatos.sort(key=lambda x: -x[1])
            for idx, _ in candidatos[:converter]:
                eleitores[idx]['cluster_socioeconomico'] = classe_alvo
                contagem_classe['G3_media_baixa'] -= 1
                contagem_classe[classe_alvo] = contagem_classe.get(classe_alvo, 0) + 1
                faltando -= 1
                if faltando <= 0:
                    break

contagem_classe_final = Counter(e['cluster_socioeconomico'] for e in eleitores)
print(f"  Depois: {dict(contagem_classe_final)}")

# ==============================================================================
# 7. AJUSTAR FAIXA ETÁRIA (mais 65+ e 16-24)
# ==============================================================================
print("\n[7] Ajustando distribuição de faixa etária...")

# Recalcular faixa etária
def calcular_faixa(idade):
    if idade < 16:
        return 'menor_16'
    elif idade <= 24:
        return '16-24'
    elif idade <= 34:
        return '25-34'
    elif idade <= 44:
        return '35-44'
    elif idade <= 54:
        return '45-54'
    elif idade <= 64:
        return '55-64'
    else:
        return '65+'

# Targets
targets_idade = {
    '16-24': 145,
    '25-34': 200,
    '35-44': 205,
    '45-54': 180,
    '55-64': 120,
    '65+': 150
}

faixa_etaria = Counter(calcular_faixa(e['idade']) for e in eleitores)
print(f"  Antes: {dict(faixa_etaria)}")

# Ajustar 65+: mudar idade de pessoas de 55-64 para 65+
atual_65 = faixa_etaria.get('65+', 0)
target_65 = targets_idade['65+']
if atual_65 < target_65:
    faltando = target_65 - atual_65

    # Encontrar eleitores de 55-64 para envelhecer
    candidatos = []
    for i, e in enumerate(eleitores):
        idade = e['idade']
        if 55 <= idade <= 64:
            score = 0
            # Preferir aposentados
            if e.get('ocupacao_vinculo') == 'aposentado':
                score += 5
            # Preferir quem está mais perto de 65
            score += idade - 55
            candidatos.append((i, score))

    candidatos.sort(key=lambda x: -x[1])
    for idx, _ in candidatos[:faltando]:
        # Envelhecer para 65-80
        nova_idade = random.randint(65, 80)
        eleitores[idx]['idade'] = nova_idade
        eleitores[idx]['faixa_etaria'] = '65+'

        # Ajustar ocupação se necessário (se não for aposentado, tornar)
        if eleitores[idx].get('ocupacao_vinculo') not in ['aposentado', 'pensionista']:
            # 70% chance de ser aposentado aos 65+
            if random.random() < 0.7:
                eleitores[idx]['ocupacao_vinculo'] = 'aposentado'

# Ajustar 16-24
atual_jovem = sum(1 for e in eleitores if 16 <= e['idade'] <= 24)
target_jovem = targets_idade['16-24']
if atual_jovem < target_jovem:
    faltando = target_jovem - atual_jovem

    # Encontrar eleitores de 25-34 para rejuvenescer
    candidatos = []
    for i, e in enumerate(eleitores):
        idade = e['idade']
        if 25 <= idade <= 34:
            score = 0
            # Preferir estudantes
            if e.get('ocupacao_vinculo') == 'estudante':
                score += 5
            # Preferir quem está mais perto de 24
            score += 34 - idade
            # Preferir solteiros sem filhos
            if e.get('estado_civil') == 'solteiro(a)' and e.get('filhos', 0) == 0:
                score += 3
            candidatos.append((i, score))

    candidatos.sort(key=lambda x: -x[1])
    for idx, _ in candidatos[:faltando]:
        # Rejuvenescer para 16-24
        nova_idade = random.randint(16, 24)
        eleitores[idx]['idade'] = nova_idade
        eleitores[idx]['faixa_etaria'] = '16-24'

        # Ajustar estado civil e filhos para coerência
        if nova_idade < 20:
            eleitores[idx]['estado_civil'] = 'solteiro(a)'
            eleitores[idx]['filhos'] = 0
            eleitores[idx]['filhos_cat'] = 'sem_filhos'

        # Ajustar voto facultativo (16-17 é facultativo)
        if 16 <= nova_idade <= 17:
            eleitores[idx]['voto_facultativo'] = True

faixa_etaria_final = Counter(calcular_faixa(e['idade']) for e in eleitores)
print(f"  Depois: {dict(faixa_etaria_final)}")

# ==============================================================================
# 8. AJUSTAR INTERESSE POLÍTICO (mais baixo)
# ==============================================================================
print("\n[8] Ajustando interesse político...")

targets_interesse = {'baixo': 450, 'medio': 350, 'alto': 200}
contagem_interesse = Counter(e['interesse_politico'] for e in eleitores)
print(f"  Antes: {dict(contagem_interesse)}")

atual_baixo = contagem_interesse.get('baixo', 0)
target_baixo = targets_interesse['baixo']
if atual_baixo < target_baixo:
    faltando = target_baixo - atual_baixo

    # Pegar de médio
    candidatos = []
    for i, e in enumerate(eleitores):
        if e['interesse_politico'] == 'medio':
            score = 0
            # Preferir quem tem características de baixo interesse
            if e.get('escolaridade') == 'fundamental_ou_sem_instrucao':
                score += 2
            if e.get('susceptibilidade_desinformacao') == 'alta':
                score += 2
            if e.get('estilo_decisao') == 'emocional':
                score += 2
            candidatos.append((i, score))

    candidatos.sort(key=lambda x: -x[1])
    for idx, _ in candidatos[:faltando]:
        eleitores[idx]['interesse_politico'] = 'baixo'

contagem_interesse_final = Counter(e['interesse_politico'] for e in eleitores)
print(f"  Depois: {dict(contagem_interesse_final)}")

# ==============================================================================
# 9. CONVERTER SUSCEPTIBILIDADE PARA NUMÉRICO
# ==============================================================================
print("\n[9] Convertendo susceptibilidade para numérico...")

mapa_susc = {'baixa': 1, 'media': 2, 'alta': 3}
for e in eleitores:
    susc_str = e.get('susceptibilidade_desinformacao', 'media')
    e['susceptibilidade_desinformacao_num'] = mapa_susc.get(susc_str, 2)

# ==============================================================================
# 10. ATUALIZAR FILTROS DE CATEGORIA
# ==============================================================================
print("\n[10] Atualizando filtros de categoria...")

for e in eleitores:
    # Recalcular faixa_etaria
    e['faixa_etaria'] = calcular_faixa(e['idade'])

    # Recalcular filhos_cat
    filhos = e.get('filhos', 0)
    if filhos == 0:
        e['filhos_cat'] = 'sem_filhos'
    elif filhos == 1:
        e['filhos_cat'] = '1_filho'
    elif filhos == 2:
        e['filhos_cat'] = '2_filhos'
    else:
        e['filhos_cat'] = '3_ou_mais'

    # Adicionar classe_social (label legível)
    mapa_classe = {
        'G1_alta': 'alta',
        'G2_media_alta': 'media_alta',
        'G3_media_baixa': 'media_baixa',
        'G4_baixa': 'baixa',
        'G5_vulneravel': 'vulneravel'
    }
    e['classe_social'] = mapa_classe.get(e.get('cluster_socioeconomico'), 'media_baixa')

# ==============================================================================
# 11. SALVAR E GERAR RELATÓRIO
# ==============================================================================
print("\n[11] Salvando arquivo corrigido...")

# Backup
import shutil
shutil.copy('agentes/banco-eleitores-df.json', 'agentes/banco-eleitores-df_pre_correcao_numerica.json')

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)

print("\n" + "=" * 60)
print("RESUMO DAS CORREÇÕES")
print("=" * 60)

print("\nNovos campos numéricos adicionados:")
print(f"  - renda_mensal: R$ (float)")
print(f"  - tempo_deslocamento_minutos: int")
print(f"  - susceptibilidade_desinformacao_num: 1-3")

print("\nDistribuições finais:")
print(f"\n  Estilo de Decisão:")
for est, n in Counter(e['estilo_decisao'] for e in eleitores).most_common():
    print(f"    {est}: {n} ({100*n/len(eleitores):.1f}%)")

print(f"\n  Faixa Etária:")
for faixa in ['16-24', '25-34', '35-44', '45-54', '55-64', '65+']:
    n = sum(1 for e in eleitores if e['faixa_etaria'] == faixa)
    print(f"    {faixa}: {n} ({100*n/len(eleitores):.1f}%)")

print(f"\n  Conflito Identitário:")
conflito_sim = sum(1 for e in eleitores if e['conflito_identitario'])
print(f"    True: {conflito_sim} ({100*conflito_sim/len(eleitores):.1f}%)")

print(f"\n  Interesse Político:")
for nivel, n in Counter(e['interesse_politico'] for e in eleitores).most_common():
    print(f"    {nivel}: {n} ({100*n/len(eleitores):.1f}%)")

print("\nArquivo salvo: agentes/banco-eleitores-df.json")
print("Backup: agentes/banco-eleitores-df_pre_correcao_numerica.json")
