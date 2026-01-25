"""
Correcao Agressiva de Idade por RA
Multiplas iteracoes ate convergir
"""

import json
import random
from collections import defaultdict
import statistics

random.seed(2029)

# PDAD Oficial - Idade media por RA
IDADE_MEDIA_PDAD = {
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


def corrigir_idade_eleitor(e, idade_alvo, diff_media):
    """Corrige idade de um eleitor individual"""
    ocupacao = e.get('ocupacao_vinculo', '')
    escolaridade = e.get('escolaridade', '')

    # Aposentados devem manter 60+
    if ocupacao == 'aposentado':
        e['idade'] = random.randint(62, 75)
        e['faixa_etaria'] = faixa_etaria(e['idade'])
        return e

    # Estudantes devem ser jovens
    if ocupacao == 'estudante':
        e['idade'] = random.randint(18, 26)
        e['faixa_etaria'] = faixa_etaria(e['idade'])
        return e

    # Calcular nova idade baseada no alvo da RA
    variacao = random.randint(-8, 8)
    nova_idade = idade_alvo + variacao

    # Limites por escolaridade
    if escolaridade == 'superior_completo_ou_pos':
        nova_idade = max(24, nova_idade)

    # Limites gerais
    nova_idade = max(18, min(65, nova_idade))

    e['idade'] = nova_idade
    e['faixa_etaria'] = faixa_etaria(nova_idade)
    e['voto_facultativo'] = nova_idade < 18 or nova_idade >= 70

    return e


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

    print("Correcao agressiva de idade por RA...")
    print()

    ras_problematicas = 0
    ras_ok = 0

    for ra, lista in sorted(por_ra.items(), key=lambda x: -len(x[1])):
        n = len(lista)
        idade_alvo = IDADE_MEDIA_PDAD.get(ra)

        if idade_alvo is None:
            print(f"  [!] {ra}: Sem dados PDAD")
            continue

        idade_antes = statistics.mean(e['idade'] for e in lista)
        diff = idade_antes - idade_alvo

        # Se diferenca > 5 anos, corrigir agressivamente
        if abs(diff) > 5:
            for e in lista:
                corrigir_idade_eleitor(e, idade_alvo, diff)

            idade_depois = statistics.mean(e['idade'] for e in lista)

            # Atualizar no array principal
            for i, idx in enumerate(idx_por_ra[ra]):
                eleitores[idx] = lista[i]

            status = "[OK]" if abs(idade_depois - idade_alvo) <= 5 else "[!]"
            if status == "[!]":
                ras_problematicas += 1
            else:
                ras_ok += 1

            print(f"  {ra:30s} (n={n:3d}): {idade_antes:4.1f} -> {idade_depois:4.1f} (alvo: {idade_alvo}) {status}")
        else:
            ras_ok += 1
            print(f"  {ra:30s} (n={n:3d}): {idade_antes:4.1f} (alvo: {idade_alvo}) [JA OK]")

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print()
    print(f"RAs OK: {ras_ok}")
    print(f"RAs com problema: {ras_problematicas}")
    print()
    print("Correcoes aplicadas!")


if __name__ == "__main__":
    main()
