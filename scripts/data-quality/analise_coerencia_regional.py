"""
Análise de Coerência Demográfica por Região Administrativa do DF
Compara os perfis dos eleitores sintéticos com dados reais (PDAD 2021/2023)
"""

import json
from collections import Counter, defaultdict
import statistics

# Dados de referência PDAD 2021/2023 - Codeplan/GDF
# Fonte: https://www.codeplan.df.gov.br/pdad-2021/
DADOS_REAIS_RA = {
    "Plano Piloto": {
        "populacao_pct": 8.5,
        "renda_media_sm": 12.5,  # salários mínimos
        "cluster_predominante": "G1_alta",
        "escolaridade_superior_pct": 65,
        "cor_branca_pct": 55,
        "idade_mediana": 38,
    },
    "Lago Sul": {
        "populacao_pct": 1.0,
        "renda_media_sm": 25.0,
        "cluster_predominante": "G1_alta",
        "escolaridade_superior_pct": 80,
        "cor_branca_pct": 70,
        "idade_mediana": 42,
    },
    "Lago Norte": {
        "populacao_pct": 1.2,
        "renda_media_sm": 18.0,
        "cluster_predominante": "G1_alta",
        "escolaridade_superior_pct": 75,
        "cor_branca_pct": 65,
        "idade_mediana": 40,
    },
    "Sudoeste/Octogonal": {
        "populacao_pct": 2.0,
        "renda_media_sm": 15.0,
        "cluster_predominante": "G1_alta",
        "escolaridade_superior_pct": 70,
        "cor_branca_pct": 55,
        "idade_mediana": 38,
    },
    "Águas Claras": {
        "populacao_pct": 5.5,
        "renda_media_sm": 8.0,
        "cluster_predominante": "G2_media_alta",
        "escolaridade_superior_pct": 55,
        "cor_branca_pct": 45,
        "idade_mediana": 34,
    },
    "Taguatinga": {
        "populacao_pct": 7.0,
        "renda_media_sm": 5.5,
        "cluster_predominante": "G2_media_alta",
        "escolaridade_superior_pct": 35,
        "cor_branca_pct": 35,
        "idade_mediana": 36,
    },
    "Vicente Pires": {
        "populacao_pct": 2.5,
        "renda_media_sm": 7.0,
        "cluster_predominante": "G2_media_alta",
        "escolaridade_superior_pct": 45,
        "cor_branca_pct": 40,
        "idade_mediana": 35,
    },
    "Guará": {
        "populacao_pct": 4.5,
        "renda_media_sm": 6.5,
        "cluster_predominante": "G2_media_alta",
        "escolaridade_superior_pct": 40,
        "cor_branca_pct": 40,
        "idade_mediana": 37,
    },
    "Cruzeiro": {
        "populacao_pct": 1.2,
        "renda_media_sm": 8.0,
        "cluster_predominante": "G2_media_alta",
        "escolaridade_superior_pct": 50,
        "cor_branca_pct": 45,
        "idade_mediana": 40,
    },
    "Park Way": {
        "populacao_pct": 0.8,
        "renda_media_sm": 15.0,
        "cluster_predominante": "G1_alta",
        "escolaridade_superior_pct": 65,
        "cor_branca_pct": 55,
        "idade_mediana": 42,
    },
    "Núcleo Bandeirante": {
        "populacao_pct": 0.8,
        "renda_media_sm": 5.0,
        "cluster_predominante": "G2_media_alta",
        "escolaridade_superior_pct": 30,
        "cor_branca_pct": 35,
        "idade_mediana": 38,
    },
    "Ceilândia": {
        "populacao_pct": 15.0,
        "renda_media_sm": 2.5,
        "cluster_predominante": "G3_media_baixa",
        "escolaridade_superior_pct": 12,
        "cor_branca_pct": 20,
        "idade_mediana": 32,
    },
    "Samambaia": {
        "populacao_pct": 8.5,
        "renda_media_sm": 2.2,
        "cluster_predominante": "G3_media_baixa",
        "escolaridade_superior_pct": 10,
        "cor_branca_pct": 18,
        "idade_mediana": 30,
    },
    "Recanto das Emas": {
        "populacao_pct": 5.0,
        "renda_media_sm": 1.8,
        "cluster_predominante": "G4_baixa",
        "escolaridade_superior_pct": 8,
        "cor_branca_pct": 15,
        "idade_mediana": 28,
    },
    "Santa Maria": {
        "populacao_pct": 4.5,
        "renda_media_sm": 2.0,
        "cluster_predominante": "G3_media_baixa",
        "escolaridade_superior_pct": 10,
        "cor_branca_pct": 18,
        "idade_mediana": 29,
    },
    "Gama": {
        "populacao_pct": 4.5,
        "renda_media_sm": 3.0,
        "cluster_predominante": "G3_media_baixa",
        "escolaridade_superior_pct": 18,
        "cor_branca_pct": 25,
        "idade_mediana": 34,
    },
    "São Sebastião": {
        "populacao_pct": 3.5,
        "renda_media_sm": 2.0,
        "cluster_predominante": "G3_media_baixa",
        "escolaridade_superior_pct": 12,
        "cor_branca_pct": 20,
        "idade_mediana": 30,
    },
    "Planaltina": {
        "populacao_pct": 6.5,
        "renda_media_sm": 1.8,
        "cluster_predominante": "G4_baixa",
        "escolaridade_superior_pct": 8,
        "cor_branca_pct": 18,
        "idade_mediana": 28,
    },
    "Sobradinho": {
        "populacao_pct": 2.5,
        "renda_media_sm": 4.0,
        "cluster_predominante": "G2_media_alta",
        "escolaridade_superior_pct": 25,
        "cor_branca_pct": 30,
        "idade_mediana": 35,
    },
    "Sobradinho II": {
        "populacao_pct": 3.0,
        "renda_media_sm": 3.5,
        "cluster_predominante": "G3_media_baixa",
        "escolaridade_superior_pct": 20,
        "cor_branca_pct": 28,
        "idade_mediana": 33,
    },
    "Paranoá": {
        "populacao_pct": 2.0,
        "renda_media_sm": 2.5,
        "cluster_predominante": "G3_media_baixa",
        "escolaridade_superior_pct": 12,
        "cor_branca_pct": 18,
        "idade_mediana": 30,
    },
    "Itapoã": {
        "populacao_pct": 2.5,
        "renda_media_sm": 1.5,
        "cluster_predominante": "G4_baixa",
        "escolaridade_superior_pct": 6,
        "cor_branca_pct": 12,
        "idade_mediana": 27,
    },
    "Brazlândia": {
        "populacao_pct": 1.8,
        "renda_media_sm": 2.2,
        "cluster_predominante": "G3_media_baixa",
        "escolaridade_superior_pct": 10,
        "cor_branca_pct": 22,
        "idade_mediana": 32,
    },
    "Riacho Fundo": {
        "populacao_pct": 1.5,
        "renda_media_sm": 3.5,
        "cluster_predominante": "G3_media_baixa",
        "escolaridade_superior_pct": 20,
        "cor_branca_pct": 25,
        "idade_mediana": 34,
    },
    "Riacho Fundo II": {
        "populacao_pct": 1.8,
        "renda_media_sm": 2.0,
        "cluster_predominante": "G3_media_baixa",
        "escolaridade_superior_pct": 12,
        "cor_branca_pct": 18,
        "idade_mediana": 30,
    },
    "Estrutural": {
        "populacao_pct": 1.2,
        "renda_media_sm": 1.2,
        "cluster_predominante": "G4_baixa",
        "escolaridade_superior_pct": 3,
        "cor_branca_pct": 10,
        "idade_mediana": 26,
    },
    "Varjão": {
        "populacao_pct": 0.3,
        "renda_media_sm": 1.5,
        "cluster_predominante": "G4_baixa",
        "escolaridade_superior_pct": 5,
        "cor_branca_pct": 12,
        "idade_mediana": 28,
    },
    "SIA": {
        "populacao_pct": 0.1,
        "renda_media_sm": 5.0,
        "cluster_predominante": "G2_media_alta",
        "escolaridade_superior_pct": 35,
        "cor_branca_pct": 40,
        "idade_mediana": 38,
    },
    "Jardim Botânico": {
        "populacao_pct": 1.0,
        "renda_media_sm": 12.0,
        "cluster_predominante": "G1_alta",
        "escolaridade_superior_pct": 60,
        "cor_branca_pct": 55,
        "idade_mediana": 40,
    },
    "Arniqueira": {
        "populacao_pct": 1.0,
        "renda_media_sm": 6.0,
        "cluster_predominante": "G2_media_alta",
        "escolaridade_superior_pct": 40,
        "cor_branca_pct": 35,
        "idade_mediana": 35,
    },
    "Fercal": {
        "populacao_pct": 0.3,
        "renda_media_sm": 1.5,
        "cluster_predominante": "G4_baixa",
        "escolaridade_superior_pct": 5,
        "cor_branca_pct": 15,
        "idade_mediana": 30,
    },
    "Sol Nascente/Pôr do Sol": {
        "populacao_pct": 3.0,
        "renda_media_sm": 1.3,
        "cluster_predominante": "G4_baixa",
        "escolaridade_superior_pct": 4,
        "cor_branca_pct": 10,
        "idade_mediana": 26,
    },
}

# Mapeamento de renda para salários mínimos
RENDA_PARA_SM = {
    "ate_1": 0.5,
    "mais_de_1_ate_2": 1.5,
    "mais_de_2_ate_5": 3.5,
    "mais_de_5_ate_10": 7.5,
    "mais_de_10_ate_20": 15.0,
    "mais_de_20": 25.0,
}


def carregar_eleitores(caminho):
    with open(caminho, 'r', encoding='utf-8') as f:
        return json.load(f)


def analisar_por_regiao(eleitores):
    """Agrupa e analisa eleitores por região administrativa"""
    regioes = defaultdict(list)
    for e in eleitores:
        ra = e.get('regiao_administrativa', 'Não informado')
        regioes[ra].append(e)
    return regioes


def calcular_metricas_regiao(eleitores_ra):
    """Calcula métricas para uma região"""
    n = len(eleitores_ra)
    if n == 0:
        return None

    # Cluster socioeconômico
    clusters = Counter(e.get('cluster_socioeconomico', 'N/A') for e in eleitores_ra)
    cluster_predominante = clusters.most_common(1)[0][0]

    # Renda média em salários mínimos
    rendas = []
    for e in eleitores_ra:
        renda_cat = e.get('renda_salarios_minimos', 'ate_1')
        rendas.append(RENDA_PARA_SM.get(renda_cat, 1.0))
    renda_media = statistics.mean(rendas) if rendas else 0

    # Escolaridade superior
    superior = sum(1 for e in eleitores_ra
                   if e.get('escolaridade') == 'superior_completo_ou_pos')
    escolaridade_superior_pct = (superior / n) * 100

    # Cor/raça branca
    brancos = sum(1 for e in eleitores_ra if e.get('cor_raca') == 'branca')
    cor_branca_pct = (brancos / n) * 100

    # Idade mediana
    idades = [e.get('idade', 35) for e in eleitores_ra]
    idade_mediana = statistics.median(idades)

    # Orientação política
    orientacoes = Counter(e.get('orientacao_politica', 'N/A') for e in eleitores_ra)

    # Religião
    religioes = Counter(e.get('religiao', 'N/A') for e in eleitores_ra)

    return {
        'n': n,
        'populacao_pct': 0,  # Será calculado depois
        'cluster_predominante': cluster_predominante,
        'clusters': dict(clusters),
        'renda_media_sm': round(renda_media, 2),
        'escolaridade_superior_pct': round(escolaridade_superior_pct, 1),
        'cor_branca_pct': round(cor_branca_pct, 1),
        'idade_mediana': idade_mediana,
        'orientacoes': dict(orientacoes),
        'religioes': dict(religioes),
    }


def comparar_com_referencia(metricas, referencia):
    """Compara métricas calculadas com dados de referência"""
    inconsistencias = []

    if referencia is None:
        return ["RA não encontrada nos dados de referência"]

    # Cluster socioeconômico
    if metricas['cluster_predominante'] != referencia['cluster_predominante']:
        inconsistencias.append(
            f"Cluster: esperado {referencia['cluster_predominante']}, "
            f"encontrado {metricas['cluster_predominante']}"
        )

    # Renda média (tolerância de 50%)
    renda_ref = referencia['renda_media_sm']
    renda_calc = metricas['renda_media_sm']
    if abs(renda_calc - renda_ref) / renda_ref > 0.5:
        inconsistencias.append(
            f"Renda: esperado ~{renda_ref} SM, encontrado {renda_calc} SM"
        )

    # Escolaridade superior (tolerância de 15 pontos percentuais)
    esc_ref = referencia['escolaridade_superior_pct']
    esc_calc = metricas['escolaridade_superior_pct']
    if abs(esc_calc - esc_ref) > 15:
        inconsistencias.append(
            f"Escolaridade superior: esperado ~{esc_ref}%, encontrado {esc_calc}%"
        )

    # Cor branca (tolerância de 15 pontos percentuais)
    cor_ref = referencia['cor_branca_pct']
    cor_calc = metricas['cor_branca_pct']
    if abs(cor_calc - cor_ref) > 15:
        inconsistencias.append(
            f"Cor branca: esperado ~{cor_ref}%, encontrado {cor_calc}%"
        )

    # Idade mediana (tolerância de 5 anos)
    idade_ref = referencia['idade_mediana']
    idade_calc = metricas['idade_mediana']
    if abs(idade_calc - idade_ref) > 5:
        inconsistencias.append(
            f"Idade mediana: esperado ~{idade_ref} anos, encontrado {idade_calc} anos"
        )

    return inconsistencias


def main():
    print("=" * 80)
    print("ANÁLISE DE COERÊNCIA DEMOGRÁFICA POR REGIÃO ADMINISTRATIVA DO DF")
    print("=" * 80)
    print()

    # Carregar dados
    eleitores = carregar_eleitores('agentes/banco-eleitores-df.json')
    total = len(eleitores)
    print(f"Total de eleitores carregados: {total}")
    print()

    # Agrupar por região
    regioes = analisar_por_regiao(eleitores)
    print(f"Regiões administrativas encontradas: {len(regioes)}")
    print()

    # Distribuição populacional
    print("-" * 80)
    print("DISTRIBUIÇÃO POPULACIONAL POR RA")
    print("-" * 80)
    print(f"{'Região':<30} {'N':>6} {'%':>8} {'% Esperado':>12} {'Diferença':>12}")
    print("-" * 80)

    distribuicao_ok = True
    for ra in sorted(regioes.keys(), key=lambda x: len(regioes[x]), reverse=True):
        n = len(regioes[ra])
        pct = (n / total) * 100
        ref = DADOS_REAIS_RA.get(ra, {})
        pct_esperado = ref.get('populacao_pct', 0)
        diff = pct - pct_esperado
        status = "[OK]" if abs(diff) < 3 else "[!]"
        if abs(diff) >= 3:
            distribuicao_ok = False
        print(f"{ra:<30} {n:>6} {pct:>7.1f}% {pct_esperado:>11.1f}% {diff:>+11.1f}% {status}")

    print()

    # Análise detalhada por região
    print("-" * 80)
    print("ANÁLISE DETALHADA POR REGIÃO ADMINISTRATIVA")
    print("-" * 80)

    total_inconsistencias = 0
    regioes_problematicas = []

    for ra in sorted(regioes.keys()):
        metricas = calcular_metricas_regiao(regioes[ra])
        referencia = DADOS_REAIS_RA.get(ra)
        inconsistencias = comparar_com_referencia(metricas, referencia)

        print(f"\n{'='*60}")
        print(f"RA: {ra} (n={metricas['n']})")
        print(f"{'='*60}")

        print(f"\n  Métricas Calculadas:")
        print(f"    Cluster predominante: {metricas['cluster_predominante']}")
        print(f"    Clusters: {metricas['clusters']}")
        print(f"    Renda média: {metricas['renda_media_sm']} SM")
        print(f"    Escolaridade superior: {metricas['escolaridade_superior_pct']}%")
        print(f"    Cor branca: {metricas['cor_branca_pct']}%")
        print(f"    Idade mediana: {metricas['idade_mediana']} anos")
        print(f"    Orientações políticas: {metricas['orientacoes']}")
        print(f"    Religiões: {metricas['religioes']}")

        if referencia:
            print(f"\n  Dados de Referência (PDAD):")
            print(f"    Cluster esperado: {referencia['cluster_predominante']}")
            print(f"    Renda esperada: {referencia['renda_media_sm']} SM")
            print(f"    Escolaridade superior esperada: {referencia['escolaridade_superior_pct']}%")
            print(f"    Cor branca esperada: {referencia['cor_branca_pct']}%")
            print(f"    Idade mediana esperada: {referencia['idade_mediana']} anos")

        if inconsistencias:
            print(f"\n  [!]  INCONSISTÊNCIAS DETECTADAS:")
            for inc in inconsistencias:
                print(f"    - {inc}")
            total_inconsistencias += len(inconsistencias)
            regioes_problematicas.append((ra, inconsistencias))
        else:
            print(f"\n  [OK] Região coerente com dados de referência")

    # Resumo final
    print("\n")
    print("=" * 80)
    print("RESUMO DA ANÁLISE")
    print("=" * 80)
    print(f"Total de eleitores: {total}")
    print(f"Total de RAs: {len(regioes)}")
    print(f"RAs com inconsistências: {len(regioes_problematicas)}")
    print(f"Total de inconsistências: {total_inconsistencias}")

    if regioes_problematicas:
        print("\n[!]  REGIÕES QUE PRECISAM DE AJUSTES:")
        for ra, incs in sorted(regioes_problematicas, key=lambda x: len(x[1]), reverse=True):
            print(f"\n  {ra}:")
            for inc in incs:
                print(f"    - {inc}")
    else:
        print("\n[OK] Todas as regiões estão coerentes com os dados de referência!")

    return total_inconsistencias == 0


if __name__ == "__main__":
    sucesso = main()
    exit(0 if sucesso else 1)
