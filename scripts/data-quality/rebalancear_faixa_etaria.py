"""
Rebalancear Faixa Etaria Global
Problema: Correção por RA desbalanceou distribuição global
Solução: Redistribuir idades mantendo médias por RA aproximadas
"""

import json
import random
from collections import Counter, defaultdict
import statistics

random.seed(2031)

# Metas globais de faixa etária
METAS_FAIXA = {
    "16-17": 30,   # 3%
    "18-24": 120,  # 12%
    "25-34": 220,  # 22%
    "35-44": 200,  # 20%
    "45-54": 180,  # 18%
    "55-64": 140,  # 14%
    "65+": 110,    # 11%
}

# Metas de cor/raça
METAS_COR = {
    "branca": 400,  # 40%
    "parda": 450,   # 45%
    "preta": 150,   # 15%
}


def faixa_etaria(idade):
    if idade < 18: return "16-17"
    elif idade < 25: return "18-24"
    elif idade < 35: return "25-34"
    elif idade < 45: return "35-44"
    elif idade < 55: return "45-54"
    elif idade < 65: return "55-64"
    else: return "65+"


def idade_na_faixa(faixa):
    """Gera idade aleatória dentro da faixa"""
    faixas = {
        "16-17": (16, 17),
        "18-24": (18, 24),
        "25-34": (25, 34),
        "35-44": (35, 44),
        "45-54": (45, 54),
        "55-64": (55, 64),
        "65+": (65, 80),
    }
    min_idade, max_idade = faixas[faixa]
    return random.randint(min_idade, max_idade)


def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    n = len(eleitores)

    # Distribuição atual
    atual_faixa = Counter(e['faixa_etaria'] for e in eleitores)
    atual_cor = Counter(e['cor_raca'] for e in eleitores)

    print("Distribuicao atual de faixa etaria:")
    for faixa in METAS_FAIXA:
        v = atual_faixa.get(faixa, 0)
        meta = METAS_FAIXA[faixa]
        print(f"  {faixa:8s}: {v:4d} (meta: {meta:4d}, diff: {v-meta:+4d})")

    print()
    print("Distribuicao atual de cor/raca:")
    for cor in METAS_COR:
        v = atual_cor.get(cor, 0)
        meta = METAS_COR[cor]
        print(f"  {cor:8s}: {v:4d} (meta: {meta:4d}, diff: {v-meta:+4d})")

    # Contar aposentados e estudantes
    n_aposentados = sum(1 for e in eleitores if e.get('ocupacao_vinculo') == 'aposentado')
    n_estudantes = sum(1 for e in eleitores if e.get('ocupacao_vinculo') == 'estudante')

    print(f"\nAposentados: {n_aposentados}, Estudantes: {n_estudantes}")

    # Ajustar metas considerando aposentados e estudantes
    # Aposentados vão para 65+, estudantes para 16-17 e 18-24
    metas_ajustadas = METAS_FAIXA.copy()

    # Aposentados ocupam parte da meta 65+
    metas_ajustadas['65+'] = max(0, metas_ajustadas['65+'] - n_aposentados)

    # Estudantes ocupam parte das metas jovens
    estudantes_16_17 = min(n_estudantes, METAS_FAIXA['16-17'])
    estudantes_18_24 = n_estudantes - estudantes_16_17
    metas_ajustadas['16-17'] = max(0, metas_ajustadas['16-17'] - estudantes_16_17)
    metas_ajustadas['18-24'] = max(0, metas_ajustadas['18-24'] - estudantes_18_24)

    # Criar lista de faixas para os demais (não aposentados, não estudantes)
    faixas_necessarias = []
    for faixa in ['16-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']:
        qtd = metas_ajustadas[faixa]
        # 65+ não deve ter não-aposentados (exceto poucos que ainda trabalham)
        if faixa == '65+':
            qtd = min(qtd, 15)  # Máximo 15 trabalhadores 65+
        faixas_necessarias.extend([faixa] * qtd)

    random.shuffle(faixas_necessarias)

    # Atribuir faixas aos eleitores
    faixa_idx = 0
    for i, e in enumerate(eleitores):
        ocupacao = e.get('ocupacao_vinculo', '')

        # Aposentados ficam em 65+
        if ocupacao == 'aposentado':
            e['idade'] = random.randint(62, 78)
            e['faixa_etaria'] = '65+'
            e['voto_facultativo'] = e['idade'] >= 70
            continue

        # Estudantes ficam em 16-17 ou 18-24
        if ocupacao == 'estudante':
            if random.random() < 0.3:  # 30% menores de 18
                e['idade'] = random.randint(16, 17)
            else:
                e['idade'] = random.randint(18, 26)
            e['faixa_etaria'] = faixa_etaria(e['idade'])
            e['voto_facultativo'] = e['idade'] < 18
            continue

        # Outros: pegar da lista de faixas necessárias
        if faixa_idx < len(faixas_necessarias):
            faixa = faixas_necessarias[faixa_idx]
            faixa_idx += 1

            # Verificar coerência com escolaridade
            if e.get('escolaridade') == 'superior_completo_ou_pos':
                if faixa in ['16-17', '18-24']:
                    faixa = '25-34'

            # Não colocar não-aposentados em 65+ (exceto se necessário)
            if faixa == '65+' and ocupacao != 'aposentado':
                faixa = '55-64'

            nova_idade = idade_na_faixa(faixa)
            e['idade'] = nova_idade
            e['faixa_etaria'] = faixa_etaria(nova_idade)
            e['voto_facultativo'] = nova_idade < 18 or nova_idade >= 70
        else:
            # Fallback: idade média
            e['idade'] = random.randint(30, 50)
            e['faixa_etaria'] = faixa_etaria(e['idade'])
            e['voto_facultativo'] = False

    # Redistribuir cor/raça
    cores_necessarias = []
    for cor, qtd in METAS_COR.items():
        cores_necessarias.extend([cor] * qtd)

    random.shuffle(cores_necessarias)

    for i, e in enumerate(eleitores):
        if i < len(cores_necessarias):
            e['cor_raca'] = cores_necessarias[i]

    # Verificar resultado
    final_faixa = Counter(e['faixa_etaria'] for e in eleitores)
    final_cor = Counter(e['cor_raca'] for e in eleitores)

    print()
    print("Distribuicao FINAL de faixa etaria:")
    for faixa in METAS_FAIXA:
        v = final_faixa.get(faixa, 0)
        meta = METAS_FAIXA[faixa]
        status = "[OK]" if abs(v - meta) <= meta * 0.1 else "[!]"
        print(f"  {faixa:8s}: {v:4d} (meta: {meta:4d}, diff: {v-meta:+4d}) {status}")

    print()
    print("Distribuicao FINAL de cor/raca:")
    for cor in METAS_COR:
        v = final_cor.get(cor, 0)
        meta = METAS_COR[cor]
        status = "[OK]" if abs(v - meta) <= meta * 0.1 else "[!]"
        print(f"  {cor:8s}: {v:4d} (meta: {meta:4d}, diff: {v-meta:+4d}) {status}")

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print()
    print("Correcoes aplicadas!")


if __name__ == "__main__":
    main()
