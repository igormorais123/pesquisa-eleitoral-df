"""
Correção Integrada: Globais + Regionais
Objetivo: Satisfazer metas globais E regionais simultaneamente
"""

import json
import random
from collections import Counter, defaultdict
import statistics

random.seed(2033)

# Cor branca por RA (PDAD %)
COR_BRANCA_RA = {
    "Águas Claras": 45, "Aguas Claras": 45,
    "Arniqueira": 38,
    "Brazlândia": 31, "Brazlandia": 31,
    "Candangolândia": 25, "Candangolandia": 25,
    "Ceilândia": 20, "Ceilandia": 20,
    "Cruzeiro": 45,
    "Fercal": 18,
    "Gama": 28,
    "Guará": 42, "Guara": 42,
    "Itapoã": 15, "Itapoa": 15,
    "Jardim Botânico": 55, "Jardim Botanico": 55,
    "Lago Norte": 62,
    "Lago Sul": 67,
    "Núcleo Bandeirante": 35, "Nucleo Bandeirante": 35,
    "Paranoá": 18, "Paranoa": 18,
    "Park Way": 58,
    "Planaltina": 20,
    "Plano Piloto": 52,
    "Recanto das Emas": 16,
    "Riacho Fundo": 28,
    "Riacho Fundo II": 22,
    "Samambaia": 18,
    "Santa Maria": 18,
    "São Sebastião": 20, "Sao Sebastiao": 20,
    "SCIA/Estrutural": 25,
    "SIA": 35,
    "Sobradinho": 35,
    "Sobradinho II": 28,
    "Sol Nascente/Pôr do Sol": 30, "Sol Nascente/Por do Sol": 30,
    "Sudoeste/Octogonal": 55,
    "Taguatinga": 35,
    "Varjão": 15, "Varjao": 15,
    "Vicente Pires": 40,
}

# Idade média por RA (PDAD)
IDADE_MEDIA_RA = {
    "Águas Claras": 34, "Aguas Claras": 34,
    "Arniqueira": 35,
    "Brazlândia": 32, "Brazlandia": 32,
    "Candangolândia": 35, "Candangolandia": 35,
    "Ceilândia": 35, "Ceilandia": 35,
    "Cruzeiro": 40,
    "Fercal": 30,
    "Gama": 35,
    "Guará": 37, "Guara": 37,
    "Itapoã": 28, "Itapoa": 28,
    "Jardim Botânico": 40, "Jardim Botanico": 40,
    "Lago Norte": 40,
    "Lago Sul": 42,
    "Núcleo Bandeirante": 38, "Nucleo Bandeirante": 38,
    "Paranoá": 30, "Paranoa": 30,
    "Park Way": 42,
    "Planaltina": 30,
    "Plano Piloto": 38,
    "Recanto das Emas": 29,
    "Riacho Fundo": 34,
    "Riacho Fundo II": 30,
    "Samambaia": 32,
    "Santa Maria": 30,
    "São Sebastião": 31, "Sao Sebastiao": 31,
    "SCIA/Estrutural": 27,
    "SIA": 38,
    "Sobradinho": 35,
    "Sobradinho II": 33,
    "Sol Nascente/Pôr do Sol": 29, "Sol Nascente/Por do Sol": 29,
    "Sudoeste/Octogonal": 38,
    "Taguatinga": 37,
    "Varjão": 28, "Varjao": 28,
    "Vicente Pires": 35,
}


def faixa_etaria(idade):
    if idade < 18: return "16-17"
    elif idade < 25: return "18-24"
    elif idade < 35: return "25-34"
    elif idade < 45: return "35-44"
    elif idade < 55: return "45-54"
    elif idade < 65: return "55-64"
    else: return "65+"


def corrigir_ra(eleitores_ra, ra_nome):
    """Corrige cor e idade de uma RA específica"""
    n = len(eleitores_ra)
    if n == 0:
        return eleitores_ra

    pct_branca = COR_BRANCA_RA.get(ra_nome, 40)
    idade_alvo = IDADE_MEDIA_RA.get(ra_nome, 35)

    # 1. Corrigir COR
    n_branca_alvo = max(0, min(n, round(n * pct_branca / 100)))
    n_parda_alvo = round(n * 0.50)  # ~50% pardos
    n_preta_alvo = n - n_branca_alvo - n_parda_alvo

    # Garantir não negativo
    if n_preta_alvo < 0:
        n_parda_alvo += n_preta_alvo
        n_preta_alvo = 0

    # Distribuir cores
    indices = list(range(n))
    random.shuffle(indices)

    for i, idx in enumerate(indices):
        if i < n_branca_alvo:
            eleitores_ra[idx]['cor_raca'] = 'branca'
        elif i < n_branca_alvo + n_parda_alvo:
            eleitores_ra[idx]['cor_raca'] = 'parda'
        else:
            eleitores_ra[idx]['cor_raca'] = 'preta'

    # 2. Corrigir IDADE (mantendo coerência com ocupação)
    for e in eleitores_ra:
        ocupacao = e.get('ocupacao_vinculo', '')

        if ocupacao == 'aposentado':
            e['idade'] = random.randint(62, 78)
        elif ocupacao == 'estudante':
            e['idade'] = random.randint(17, 26)
        else:
            # Baseado na média da RA com variação
            variacao = random.randint(-10, 10)
            nova_idade = idade_alvo + variacao

            # Coerência com escolaridade
            if e.get('escolaridade') == 'superior_completo_ou_pos':
                nova_idade = max(24, nova_idade)

            nova_idade = max(18, min(64, nova_idade))
            e['idade'] = nova_idade

        e['faixa_etaria'] = faixa_etaria(e['idade'])
        e['voto_facultativo'] = e['idade'] < 18 or e['idade'] >= 70

    return eleitores_ra


def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    print("Correcao integrada: globais + regionais")
    print()

    # Agrupar por RA
    por_ra = defaultdict(list)
    idx_por_ra = defaultdict(list)

    for i, e in enumerate(eleitores):
        ra = e.get('regiao_administrativa', 'N/A')
        por_ra[ra].append(e)
        idx_por_ra[ra].append(i)

    # Corrigir cada RA
    for ra, lista in por_ra.items():
        lista = corrigir_ra(lista, ra)

        # Atualizar no array principal
        for i, idx in enumerate(idx_por_ra[ra]):
            eleitores[idx] = lista[i]

    # Verificar distribuição global
    cor_global = Counter(e['cor_raca'] for e in eleitores)
    faixa_global = Counter(e['faixa_etaria'] for e in eleitores)

    print("Distribuicao global de COR:")
    for cor in ['branca', 'parda', 'preta']:
        v = cor_global.get(cor, 0)
        print(f"  {cor}: {v} ({v/10:.1f}%)")

    print()
    print("Distribuicao global de FAIXA ETARIA:")
    for faixa in ['16-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']:
        v = faixa_global.get(faixa, 0)
        print(f"  {faixa}: {v} ({v/10:.1f}%)")

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print()
    print("Correcoes aplicadas!")


if __name__ == "__main__":
    main()
