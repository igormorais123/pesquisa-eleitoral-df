"""
Correcao dos Campos Criticos
1. faixa_etaria - Piramide etaria muito jovem
2. escolaridade - Falta fundamental
3. orientacao_politica - Falta centro
"""

import json
import random
from collections import Counter

random.seed(2026)

def corrigir_faixa_etaria(eleitores):
    """
    Corrige piramide etaria para refletir IBGE/PDAD
    Metas: 16-17: 3%, 18-24: 12%, 25-34: 22%, 35-44: 20%,
           45-54: 18%, 55-64: 14%, 65+: 11%
    """
    n = len(eleitores)

    # Metas em quantidade
    metas = {
        "16-17": int(n * 0.03),
        "18-24": int(n * 0.12),
        "25-34": int(n * 0.22),
        "35-44": int(n * 0.20),
        "45-54": int(n * 0.18),
        "55-64": int(n * 0.14),
        "65+": int(n * 0.11),
    }

    # Ajustar para somar 1000
    total_metas = sum(metas.values())
    metas["35-44"] += (n - total_metas)

    # Faixas de idade
    faixas_idade = {
        "16-17": (16, 17),
        "18-24": (18, 24),
        "25-34": (25, 34),
        "35-44": (35, 44),
        "45-54": (45, 54),
        "55-64": (55, 64),
        "65+": (65, 80),
    }

    # Redistribuir
    indices = list(range(n))
    random.shuffle(indices)

    idx_pos = 0
    for faixa, qtd in metas.items():
        idade_min, idade_max = faixas_idade[faixa]
        for _ in range(qtd):
            if idx_pos >= n:
                break
            i = indices[idx_pos]

            # Gerar idade na faixa
            nova_idade = random.randint(idade_min, idade_max)
            eleitores[i]['idade'] = nova_idade
            eleitores[i]['faixa_etaria'] = faixa

            # Ajustar voto facultativo
            eleitores[i]['voto_facultativo'] = nova_idade < 18 or nova_idade >= 70

            # Ajustar ocupacao se necessario
            if nova_idade >= 65 and eleitores[i].get('ocupacao_vinculo') not in ['aposentado', 'empresario']:
                if random.random() < 0.6:  # 60% dos 65+ sao aposentados
                    eleitores[i]['ocupacao_vinculo'] = 'aposentado'
                    eleitores[i]['profissao'] = 'Aposentado(a)'

            if nova_idade < 22 and eleitores[i].get('escolaridade') == 'superior_completo_ou_pos':
                # Muito jovem para superior completo
                eleitores[i]['escolaridade'] = 'medio_completo_ou_sup_incompleto'

            idx_pos += 1

    return eleitores


def corrigir_escolaridade(eleitores):
    """
    Corrige distribuicao de escolaridade
    Metas: fundamental: 25%, medio: 45%, superior: 30%
    """
    n = len(eleitores)

    # Metas
    n_fundamental = int(n * 0.25)  # 250
    n_medio = int(n * 0.45)        # 450
    n_superior = n - n_fundamental - n_medio  # 300

    # Contar atual
    atual = Counter(e['escolaridade'] for e in eleitores)
    print(f"  Escolaridade antes: {dict(atual)}")

    # Indices por escolaridade
    idx_superior = [i for i, e in enumerate(eleitores) if e['escolaridade'] == 'superior_completo_ou_pos']
    idx_medio = [i for i, e in enumerate(eleitores) if e['escolaridade'] == 'medio_completo_ou_sup_incompleto']
    idx_fundamental = [i for i, e in enumerate(eleitores) if e['escolaridade'] == 'fundamental_ou_sem_instrucao']

    random.shuffle(idx_superior)
    random.shuffle(idx_medio)

    # Precisamos converter medio -> fundamental
    n_converter_para_fund = n_fundamental - len(idx_fundamental)

    if n_converter_para_fund > 0:
        # Converter medios para fundamental (priorizar os de menor renda e mais velhos)
        candidatos = [(i, eleitores[i]) for i in idx_medio]
        # Ordenar por renda (menor primeiro) e idade (maior primeiro)
        ordem_renda = {'ate_1': 0, 'mais_de_1_ate_2': 1, 'mais_de_2_ate_5': 2,
                       'mais_de_5_ate_10': 3, 'mais_de_10_ate_20': 4, 'mais_de_20': 5}
        candidatos.sort(key=lambda x: (ordem_renda.get(x[1].get('renda_salarios_minimos', 'mais_de_1_ate_2'), 2),
                                       -x[1].get('idade', 30)))

        for i, e in candidatos[:n_converter_para_fund]:
            eleitores[i]['escolaridade'] = 'fundamental_ou_sem_instrucao'
            # Ajustar profissao se incompativel
            prof = eleitores[i].get('profissao', '')
            if any(p in prof for p in ['Analista', 'Engenheiro', 'Advogado', 'Medico', 'Contador', 'Professor']):
                eleitores[i]['profissao'] = random.choice([
                    'Auxiliar de Servicos Gerais', 'Diarista', 'Pedreiro',
                    'Porteiro', 'Vigilante', 'Cozinheiro(a)'
                ])

    return eleitores


def corrigir_orientacao_politica(eleitores):
    """
    Corrige distribuicao de orientacao politica
    Metas: direita: 26%, centro_direita: 12%, centro: 24%,
           centro_esquerda: 14%, esquerda: 24%
    """
    n = len(eleitores)

    # Metas
    metas = {
        'direita': int(n * 0.26),
        'centro_direita': int(n * 0.12),
        'centro': int(n * 0.24),
        'centro_esquerda': int(n * 0.14),
        'esquerda': int(n * 0.24),
    }

    # Ajustar para somar 1000
    total = sum(metas.values())
    metas['centro'] += (n - total)

    # Redistribuir
    indices = list(range(n))
    random.shuffle(indices)

    idx_pos = 0
    for orientacao, qtd in metas.items():
        for _ in range(qtd):
            if idx_pos >= n:
                break
            i = indices[idx_pos]
            eleitores[i]['orientacao_politica'] = orientacao
            idx_pos += 1

    return eleitores


def corrigir_campos_alerta(eleitores):
    """Corrige campos com alerta (desvio moderado)"""
    n = len(eleitores)

    # Religiao - aumentar catolicos, diminuir evangelicos
    # Meta: catolica 46%, evangelica 26%
    for e in eleitores:
        if e['religiao'] == 'evangelica' and random.random() < 0.15:
            e['religiao'] = 'catolica'

    # Interesse politico - aumentar medio, diminuir baixo
    for e in eleitores:
        if e['interesse_politico'] == 'baixo' and random.random() < 0.20:
            e['interesse_politico'] = 'medio'

    # Posicao Bolsonaro - aumentar apoiador_forte
    for e in eleitores:
        if e['posicao_bolsonaro'] == 'critico_forte' and random.random() < 0.12:
            e['posicao_bolsonaro'] = 'apoiador_forte'

    # Ocupacao - aumentar autonomo e aposentado
    for e in eleitores:
        if e['ocupacao_vinculo'] == 'informal' and random.random() < 0.30:
            e['ocupacao_vinculo'] = 'autonomo'
        if e['idade'] >= 60 and e['ocupacao_vinculo'] not in ['aposentado'] and random.random() < 0.5:
            e['ocupacao_vinculo'] = 'aposentado'
            e['profissao'] = 'Aposentado(a)'

    # Meio transporte - aumentar onibus, diminuir nao_se_aplica
    for e in eleitores:
        if e['meio_transporte'] == 'nao_se_aplica' and e['ocupacao_vinculo'] not in ['aposentado', 'desempregado']:
            e['meio_transporte'] = random.choice(['onibus', 'onibus', 'carro', 'motocicleta'])
        if e['meio_transporte'] == 'a_pe' and random.random() < 0.30:
            e['meio_transporte'] = 'onibus'

    # Cor/raca - aumentar brancos levemente
    for e in eleitores:
        if e['cor_raca'] == 'preta' and random.random() < 0.25:
            e['cor_raca'] = 'branca'

    # Uniao estavel - diminuir
    for e in eleitores:
        if e['estado_civil'] == 'uniao_estavel' and random.random() < 0.35:
            e['estado_civil'] = 'solteiro(a)'

    return eleitores


def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    print("Corrigindo campos criticos...")
    print()

    print("1. Corrigindo FAIXA ETARIA...")
    eleitores = corrigir_faixa_etaria(eleitores)

    print("2. Corrigindo ESCOLARIDADE...")
    eleitores = corrigir_escolaridade(eleitores)

    print("3. Corrigindo ORIENTACAO POLITICA...")
    eleitores = corrigir_orientacao_politica(eleitores)

    print("4. Corrigindo campos com ALERTA...")
    eleitores = corrigir_campos_alerta(eleitores)

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print()
    print("Correcoes aplicadas!")
    print("Execute 'python auditar_todos_campos.py' para validar.")


if __name__ == "__main__":
    main()
