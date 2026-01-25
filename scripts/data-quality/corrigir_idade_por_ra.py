"""
Correcao de Idade por Regiao Administrativa
Problema: Idade foi distribuida globalmente sem respeitar media por RA
Solucao: Ajustar idade de cada eleitor para aproximar da media da sua RA
"""

import json
import random
from collections import defaultdict
import statistics

random.seed(2028)

# PDAD Oficial - Idade media por RA
IDADE_MEDIA_PDAD = {
    "Águas Claras": 34,
    "Aguas Claras": 34,
    "Arniqueira": 35,
    "Brazlândia": 32,
    "Brazlandia": 32,
    "Candangolândia": 35,
    "Candangolandia": 35,
    "Ceilândia": 35,
    "Ceilandia": 35,
    "Cruzeiro": 40,
    "Fercal": 30,
    "Gama": 35,
    "Guará": 37,
    "Guara": 37,
    "Itapoã": 28,
    "Itapoa": 28,
    "Jardim Botânico": 40,
    "Jardim Botanico": 40,
    "Lago Norte": 40,
    "Lago Sul": 42,
    "Núcleo Bandeirante": 38,
    "Nucleo Bandeirante": 38,
    "Paranoá": 30,
    "Paranoa": 30,
    "Park Way": 42,
    "Planaltina": 30,
    "Plano Piloto": 38,
    "Recanto das Emas": 29,
    "Riacho Fundo": 34,
    "Riacho Fundo II": 30,
    "Samambaia": 32,
    "Santa Maria": 30,
    "São Sebastião": 31,
    "Sao Sebastiao": 31,
    "SCIA/Estrutural": 27,
    "SIA": 38,
    "Sobradinho": 35,
    "Sobradinho II": 33,
    "Sol Nascente/Pôr do Sol": 29,
    "Sol Nascente/Por do Sol": 29,
    "Sudoeste/Octogonal": 38,
    "Taguatinga": 37,
    "Varjão": 28,
    "Varjao": 28,
    "Vicente Pires": 35,
}

# Cor branca por RA (PDAD)
COR_BRANCA_PDAD = {
    "Águas Claras": 45,
    "Aguas Claras": 45,
    "Taguatinga": 35,
    "Lago Norte": 62,
    "Lago Sul": 67,
    "Sudoeste/Octogonal": 55,
    "Plano Piloto": 52,
    "Park Way": 58,
    "Jardim Botânico": 55,
    "Jardim Botanico": 55,
    "Ceilândia": 20,
    "Ceilandia": 20,
    "Samambaia": 18,
    "Santa Maria": 18,
    "Recanto das Emas": 16,
    "Itapoã": 15,
    "Itapoa": 15,
    "Varjão": 15,
    "Varjao": 15,
    "SCIA/Estrutural": 25,
    "Fercal": 18,
    "Paranoá": 18,
    "Paranoa": 18,
    "Planaltina": 20,
    "São Sebastião": 20,
    "Sao Sebastiao": 20,
    "Brazlândia": 31,
    "Brazlandia": 31,
    "Gama": 28,
    "Guará": 42,
    "Guara": 42,
    "Cruzeiro": 45,
    "Sobradinho": 35,
    "Sobradinho II": 28,
    "Vicente Pires": 40,
    "Riacho Fundo": 28,
    "Riacho Fundo II": 22,
    "Candangolândia": 25,
    "Candangolandia": 25,
    "Núcleo Bandeirante": 35,
    "Nucleo Bandeirante": 35,
    "Arniqueira": 38,
    "SIA": 35,
    "Sol Nascente/Pôr do Sol": 30,
    "Sol Nascente/Por do Sol": 30,
}


def faixa_etaria(idade):
    if idade < 18: return "16-17"
    elif idade < 25: return "18-24"
    elif idade < 35: return "25-34"
    elif idade < 45: return "35-44"
    elif idade < 55: return "45-54"
    elif idade < 65: return "55-64"
    else: return "65+"


def ajustar_idade_ra(eleitores_ra, idade_alvo):
    """Ajusta idade dos eleitores para aproximar da media alvo"""
    n = len(eleitores_ra)
    if n == 0:
        return eleitores_ra

    idade_atual = statistics.mean(e['idade'] for e in eleitores_ra)
    diff = idade_atual - idade_alvo

    if abs(diff) <= 3:
        return eleitores_ra  # Ja esta proximo

    # Calcular ajuste necessario
    ajuste_por_eleitor = diff / n * 1.5  # Fator de correcao

    for e in eleitores_ra:
        ocupacao = e.get('ocupacao_vinculo', '')

        # Aposentados devem manter 60+
        if ocupacao == 'aposentado':
            if e['idade'] < 60:
                e['idade'] = random.randint(60, 75)
            continue

        # Estudantes devem manter < 30
        if ocupacao == 'estudante':
            if e['idade'] > 30:
                e['idade'] = random.randint(18, 28)
            continue

        # Ajustar outros
        idade_antiga = e['idade']
        nova_idade = int(idade_antiga - ajuste_por_eleitor + random.randint(-3, 3))

        # Limites
        if e.get('escolaridade') == 'superior_completo_ou_pos':
            nova_idade = max(22, nova_idade)  # Superior precisa 22+

        nova_idade = max(18, min(70, nova_idade))
        e['idade'] = nova_idade
        e['faixa_etaria'] = faixa_etaria(nova_idade)
        e['voto_facultativo'] = nova_idade < 18 or nova_idade >= 70

    return eleitores_ra


def ajustar_cor_ra(eleitores_ra, pct_branca_alvo):
    """Ajusta cor dos eleitores para aproximar do % branca alvo"""
    n = len(eleitores_ra)
    if n == 0:
        return eleitores_ra

    n_branca_alvo = max(0, int(n * pct_branca_alvo / 100))
    n_branca_atual = sum(1 for e in eleitores_ra if e['cor_raca'] == 'branca')

    if n_branca_atual > n_branca_alvo:
        # Converter brancos para pardo
        candidatos = [i for i, e in enumerate(eleitores_ra) if e['cor_raca'] == 'branca']
        random.shuffle(candidatos)
        excesso = n_branca_atual - n_branca_alvo
        for i in candidatos[:excesso]:
            eleitores_ra[i]['cor_raca'] = 'parda'

    elif n_branca_atual < n_branca_alvo:
        # Converter pardos para branco
        candidatos = [i for i, e in enumerate(eleitores_ra) if e['cor_raca'] == 'parda']
        random.shuffle(candidatos)
        falta = n_branca_alvo - n_branca_atual
        for i in candidatos[:falta]:
            eleitores_ra[i]['cor_raca'] = 'branca'

    return eleitores_ra


def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    # Agrupar por RA
    por_ra = defaultdict(list)
    idx_por_ra = defaultdict(list)

    for i, e in enumerate(eleitores):
        ra = e.get('regiao_administrativa', 'N/A')
        por_ra[ra].append(e)
        idx_por_ra[ra].append(i)

    print("Corrigindo idade e cor por RA...")
    print()

    for ra, lista in por_ra.items():
        n = len(lista)
        idade_alvo = IDADE_MEDIA_PDAD.get(ra)
        cor_branca_alvo = COR_BRANCA_PDAD.get(ra)

        if idade_alvo is None:
            print(f"  [!] {ra}: Sem dados PDAD")
            continue

        idade_antes = statistics.mean(e['idade'] for e in lista)
        branca_antes = sum(1 for e in lista if e['cor_raca'] == 'branca') / n * 100

        # Ajustar idade
        lista = ajustar_idade_ra(lista, idade_alvo)

        # Ajustar cor
        if cor_branca_alvo is not None:
            lista = ajustar_cor_ra(lista, cor_branca_alvo)

        idade_depois = statistics.mean(e['idade'] for e in lista)
        branca_depois = sum(1 for e in lista if e['cor_raca'] == 'branca') / n * 100

        # Atualizar no array principal
        for i, idx in enumerate(idx_por_ra[ra]):
            eleitores[idx] = lista[i]

        # Mostrar mudanca
        idade_ok = "[OK]" if abs(idade_depois - idade_alvo) <= 5 else "[!]"
        cor_ok = "[OK]" if cor_branca_alvo is None or abs(branca_depois - cor_branca_alvo) <= 10 else "[!]"

        print(f"  {ra:25s} (n={n:3d}): idade {idade_antes:4.1f}->{idade_depois:4.1f} (alvo:{idade_alvo}) {idade_ok} | branca {branca_antes:4.1f}%->{branca_depois:4.1f}% {cor_ok}")

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print()
    print("Correcoes aplicadas!")
    print("Execute 'python comparacao_pdad_oficial.py' para validar.")


if __name__ == "__main__":
    main()
