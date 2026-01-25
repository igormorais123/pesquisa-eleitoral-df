"""
Refinamento das Correcoes - Segunda Passada
Foca em RAs com poucos eleitores e problemas especificos
"""

import json
import random
from collections import Counter

random.seed(43)

# Metas especificas para RAs problematicas
AJUSTES_ESPECIFICOS = {
    "Lago Sul": {
        "cor_branca_alvo": 67,
        "escolaridade_superior_alvo": 85,
        "renda_minima": "mais_de_10_ate_20",
    },
    "Lago Norte": {
        "cor_branca_alvo": 62,
        "escolaridade_superior_alvo": 75,
        "renda_minima": "mais_de_5_ate_10",
    },
    "Park Way": {
        "cor_branca_alvo": 58,
        "escolaridade_superior_alvo": 70,
        "renda_minima": "mais_de_5_ate_10",
    },
    "Jardim Botânico": {
        "cor_branca_alvo": 55,
        "escolaridade_superior_alvo": 65,
        "renda_minima": "mais_de_5_ate_10",
    },
    "Sudoeste/Octogonal": {
        "cor_branca_alvo": 55,
        "escolaridade_superior_alvo": 72,
        "renda_minima": "mais_de_5_ate_10",
    },
    "SIA": {
        "cor_branca_alvo": 35,
        "escolaridade_superior_alvo": 35,
        "renda_maxima": "mais_de_5_ate_10",
    },
    "Núcleo Bandeirante": {
        "cor_branca_alvo": 35,
        "escolaridade_superior_alvo": 32,
        "renda_maxima": "mais_de_5_ate_10",
    },
    "Candangolândia": {
        "idade_alvo": 35,
        "cor_branca_alvo": 25,
    },
    "Fercal": {
        "cor_branca_alvo": 18,
        "renda_maxima": "mais_de_1_ate_2",
    },
    "Varjão": {
        "renda_maxima": "mais_de_1_ate_2",
    },
    "Cruzeiro": {
        "renda_maxima": "mais_de_5_ate_10",
    },
}

# Mapeamento de renda
ORDEM_RENDA = [
    "ate_1",
    "mais_de_1_ate_2",
    "mais_de_2_ate_5",
    "mais_de_5_ate_10",
    "mais_de_10_ate_20",
    "mais_de_20",
]


def carregar_eleitores():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        return json.load(f)


def salvar_eleitores(eleitores):
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)


def renda_para_indice(renda):
    return ORDEM_RENDA.index(renda) if renda in ORDEM_RENDA else 2


def indice_para_renda(indice):
    return ORDEM_RENDA[max(0, min(indice, len(ORDEM_RENDA) - 1))]


def ajustar_eleitor_ra_nobre(eleitor, ajuste):
    """Ajusta eleitores de RAs nobres"""
    mudou = False

    # Cor branca
    if 'cor_branca_alvo' in ajuste:
        alvo = ajuste['cor_branca_alvo']
        if alvo > 50:  # RA nobre - deve ter mais brancos
            # Probabilidade baseada no alvo
            if random.random() < alvo / 100:
                if eleitor['cor_raca'] != 'branca':
                    eleitor['cor_raca'] = 'branca'
                    mudou = True

    # Escolaridade
    if 'escolaridade_superior_alvo' in ajuste:
        alvo = ajuste['escolaridade_superior_alvo']
        if alvo > 60:  # Alta escolaridade esperada
            if random.random() < alvo / 100:
                if eleitor['escolaridade'] != 'superior_completo_ou_pos':
                    eleitor['escolaridade'] = 'superior_completo_ou_pos'
                    mudou = True

    # Renda minima
    if 'renda_minima' in ajuste:
        renda_min = ajuste['renda_minima']
        renda_atual = eleitor.get('renda_salarios_minimos', 'mais_de_1_ate_2')
        if renda_para_indice(renda_atual) < renda_para_indice(renda_min):
            eleitor['renda_salarios_minimos'] = renda_min
            mudou = True

    return mudou


def ajustar_eleitor_ra_periferica(eleitor, ajuste):
    """Ajusta eleitores de RAs perifericas ou de renda media"""
    mudou = False

    # Cor branca (deve ter menos brancos)
    if 'cor_branca_alvo' in ajuste:
        alvo = ajuste['cor_branca_alvo']
        if alvo < 40:  # RA com menos brancos
            if eleitor['cor_raca'] == 'branca':
                # Chance de mudar para pardo/preto
                if random.random() > alvo / 100:
                    eleitor['cor_raca'] = random.choice(['parda', 'parda', 'preta'])
                    mudou = True

    # Escolaridade (deve ser menor)
    if 'escolaridade_superior_alvo' in ajuste:
        alvo = ajuste['escolaridade_superior_alvo']
        if alvo < 40:
            if eleitor['escolaridade'] == 'superior_completo_ou_pos':
                if random.random() > alvo / 100:
                    eleitor['escolaridade'] = 'medio_completo_ou_sup_incompleto'
                    mudou = True

    # Renda maxima
    if 'renda_maxima' in ajuste:
        renda_max = ajuste['renda_maxima']
        renda_atual = eleitor.get('renda_salarios_minimos', 'mais_de_1_ate_2')
        if renda_para_indice(renda_atual) > renda_para_indice(renda_max):
            eleitor['renda_salarios_minimos'] = renda_max
            mudou = True

    # Idade
    if 'idade_alvo' in ajuste:
        idade_alvo = ajuste['idade_alvo']
        if abs(eleitor['idade'] - idade_alvo) > 8:
            # Ajustar em direcao ao alvo
            diff = eleitor['idade'] - idade_alvo
            reducao = int(diff * 0.5)
            eleitor['idade'] = eleitor['idade'] - reducao
            # Atualizar faixa etaria
            idade = eleitor['idade']
            if idade < 18:
                eleitor['faixa_etaria'] = "16-17"
            elif idade < 25:
                eleitor['faixa_etaria'] = "18-24"
            elif idade < 35:
                eleitor['faixa_etaria'] = "25-34"
            elif idade < 45:
                eleitor['faixa_etaria'] = "35-44"
            elif idade < 55:
                eleitor['faixa_etaria'] = "45-54"
            elif idade < 65:
                eleitor['faixa_etaria'] = "55-64"
            else:
                eleitor['faixa_etaria'] = "65+"
            mudou = True

    return mudou


def main():
    print("=" * 70)
    print("REFINAMENTO DAS CORRECOES")
    print("=" * 70)

    eleitores = carregar_eleitores()
    total_mudancas = 0

    # Agrupar por RA
    por_ra = {}
    for i, e in enumerate(eleitores):
        ra = e.get('regiao_administrativa', 'N/A')
        if ra not in por_ra:
            por_ra[ra] = []
        por_ra[ra].append((i, e))

    # Aplicar ajustes especificos
    for ra, ajuste in AJUSTES_ESPECIFICOS.items():
        if ra not in por_ra:
            continue

        print(f"\nAjustando {ra} ({len(por_ra[ra])} eleitores)...")

        # Determinar se e RA nobre ou periferica
        e_nobre = ajuste.get('cor_branca_alvo', 0) > 50 or ajuste.get('renda_minima') is not None

        for idx, eleitor in por_ra[ra]:
            if e_nobre:
                if ajustar_eleitor_ra_nobre(eleitor, ajuste):
                    total_mudancas += 1
                    eleitores[idx] = eleitor
            else:
                if ajustar_eleitor_ra_periferica(eleitor, ajuste):
                    total_mudancas += 1
                    eleitores[idx] = eleitor

    # Salvar
    salvar_eleitores(eleitores)

    print(f"\nTotal de ajustes adicionais: {total_mudancas}")
    print("\nArquivo salvo!")


if __name__ == "__main__":
    main()
