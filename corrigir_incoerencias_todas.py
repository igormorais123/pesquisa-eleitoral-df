"""
Correção de Todas as Incoerências Identificadas
"""
import json
import random
from collections import Counter

random.seed(2031)

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f"Total de eleitores: {len(eleitores)}")

correcoes = {
    'deslocamento_ocupacao': 0,
    'politica_bolsonaro': 0,
    'religiao_valores': 0,
    'escolaridade_profissao': 0,
    'idade_civil': 0,
}

# ==============================================================================
# 1. CORRIGIR DESLOCAMENTO para APOSENTADOS/DESEMPREGADOS
# ==============================================================================
print("\n[1] Corrigindo tempo de deslocamento para aposentados/desempregados...")

for e in eleitores:
    ocupacao = e.get('ocupacao_vinculo', '')
    tempo = e.get('tempo_deslocamento_minutos', 0)

    if ocupacao in ['aposentado', 'desempregado'] and tempo > 0:
        e['tempo_deslocamento_minutos'] = 0
        e['tempo_deslocamento_trabalho'] = 'nao_se_aplica'
        correcoes['deslocamento_ocupacao'] += 1

print(f"  Corrigidos: {correcoes['deslocamento_ocupacao']}")

# ==============================================================================
# 2. CORRIGIR ESQUERDA + APOIADOR FORTE DE BOLSONARO
# ==============================================================================
print("\n[2] Corrigindo orientação política vs posição Bolsonaro...")

for e in eleitores:
    orientacao = e.get('orientacao_politica', '')
    pos_bolso = e.get('posicao_bolsonaro', '')

    # Esquerda não pode ser apoiador forte de Bolsonaro
    if orientacao == 'esquerda' and pos_bolso == 'apoiador_forte':
        # Opção 1: Mudar para crítico (mantém esquerda)
        # Opção 2: Mudar orientação para centro/direita (mantém apoiador)
        # Escolher aleatoriamente para manter diversidade
        if random.random() < 0.7:
            # Mudar posição para crítico (mais coerente com esquerda)
            e['posicao_bolsonaro'] = random.choice(['critico_forte', 'critico_moderado', 'opositor_forte'])
        else:
            # Mudar orientação para centro-direita ou direita
            e['orientacao_politica'] = random.choice(['centro_direita', 'direita'])
        correcoes['politica_bolsonaro'] += 1

    # Centro-esquerda também não deveria ser apoiador forte
    if orientacao == 'centro_esquerda' and pos_bolso == 'apoiador_forte':
        if random.random() < 0.6:
            e['posicao_bolsonaro'] = random.choice(['neutro', 'critico_moderado'])
        else:
            e['orientacao_politica'] = 'centro'
        correcoes['politica_bolsonaro'] += 1

print(f"  Corrigidos: {correcoes['politica_bolsonaro']}")

# ==============================================================================
# 3. CORRIGIR SEM RELIGIÃO + FÉ COMO VALOR
# ==============================================================================
print("\n[3] Corrigindo religião vs valores...")

for e in eleitores:
    religiao = e.get('religiao', '')
    valores = e.get('valores', [])

    if religiao == 'sem_religiao' and 'Fé e religião' in valores:
        # Remover "Fé e religião" e substituir por outro valor
        valores.remove('Fé e religião')
        # Adicionar valor alternativo
        alternativos = ['Liberdade', 'Igualdade', 'Justiça', 'Solidariedade']
        for alt in alternativos:
            if alt not in valores:
                valores.append(alt)
                break
        e['valores'] = valores
        correcoes['religiao_valores'] += 1

print(f"  Corrigidos: {correcoes['religiao_valores']}")

# ==============================================================================
# 4. CORRIGIR ESCOLARIDADE vs PROFISSÃO
# ==============================================================================
print("\n[4] Corrigindo escolaridade vs profissão...")

profissoes_superior = ['médico', 'advogado', 'engenheiro', 'professor universitário',
                       'dentista', 'arquiteto', 'psicólogo', 'farmacêutico', 'contador']

for e in eleitores:
    escolaridade = e.get('escolaridade', '')
    profissao = e.get('profissao', '')
    prof_lower = profissao.lower()

    requer_superior = any(p in prof_lower for p in profissoes_superior)

    if requer_superior and escolaridade != 'superior_ou_pos':
        # Corrigir escolaridade para superior
        e['escolaridade'] = 'superior_ou_pos'
        correcoes['escolaridade_profissao'] += 1

print(f"  Corrigidos: {correcoes['escolaridade_profissao']}")

# ==============================================================================
# 5. CORRIGIR IDADE vs ESTADO CIVIL
# ==============================================================================
print("\n[5] Corrigindo idade vs estado civil...")

for e in eleitores:
    idade = e.get('idade', 30)
    estado_civil = e.get('estado_civil', '')

    # Divorciado/viúvo muito jovem
    if idade < 22 and estado_civil in ['divorciado(a)', 'viuvo(a)']:
        # Mudar para solteiro ou em união
        e['estado_civil'] = 'solteiro(a)'
        correcoes['idade_civil'] += 1

    # Menor de 16 com estado civil inválido
    if idade < 16 and estado_civil not in ['solteiro(a)']:
        e['estado_civil'] = 'solteiro(a)'
        correcoes['idade_civil'] += 1

print(f"  Corrigidos: {correcoes['idade_civil']}")

# ==============================================================================
# 6. VERIFICAR E CORRIGIR OUTRAS PEQUENAS INCOERÊNCIAS
# ==============================================================================
print("\n[6] Verificando outras incoerências menores...")

outros = 0

for e in eleitores:
    idade = e.get('idade', 30)
    ocupacao = e.get('ocupacao_vinculo', '')
    filhos = e.get('filhos', 0)

    # Estudante com muitos filhos (ajustar para informal ou CLT)
    if ocupacao == 'estudante' and filhos > 2:
        e['ocupacao_vinculo'] = 'informal'
        outros += 1

    # Menor de 18 como CLT sem ser aprendiz
    if idade < 18 and ocupacao == 'clt':
        # Pode ser aprendiz, ok
        pass

    # Atualizar faixa etária se necessário
    def calc_faixa(idade):
        if idade <= 24: return '16-24'
        elif idade <= 34: return '25-34'
        elif idade <= 44: return '35-44'
        elif idade <= 54: return '45-54'
        elif idade <= 64: return '55-64'
        else: return '65+'

    faixa_correta = calc_faixa(idade)
    if e.get('faixa_etaria') != faixa_correta:
        e['faixa_etaria'] = faixa_correta
        outros += 1

    # Atualizar filhos_cat
    if filhos == 0:
        filhos_cat_correto = 'sem_filhos'
    elif filhos == 1:
        filhos_cat_correto = '1_filho'
    elif filhos == 2:
        filhos_cat_correto = '2_filhos'
    else:
        filhos_cat_correto = '3_ou_mais'

    if e.get('filhos_cat') != filhos_cat_correto:
        e['filhos_cat'] = filhos_cat_correto
        outros += 1

print(f"  Outras correções: {outros}")

# ==============================================================================
# SALVAR
# ==============================================================================
print("\n[7] Salvando...")

with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)

print("Arquivo salvo!")

# ==============================================================================
# RESUMO
# ==============================================================================
print("\n" + "=" * 60)
print("RESUMO DAS CORREÇÕES")
print("=" * 60)

total = sum(correcoes.values()) + outros
print(f"\nDeslocamento/Ocupação: {correcoes['deslocamento_ocupacao']}")
print(f"Política/Bolsonaro: {correcoes['politica_bolsonaro']}")
print(f"Religião/Valores: {correcoes['religiao_valores']}")
print(f"Escolaridade/Profissão: {correcoes['escolaridade_profissao']}")
print(f"Idade/Estado Civil: {correcoes['idade_civil']}")
print(f"Outras correções: {outros}")
print(f"\nTOTAL DE CORREÇÕES: {total}")
