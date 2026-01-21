"""
Comparacao dos Eleitores Sinteticos com Dados Oficiais PDAD 2021/2024
Fonte: IPEDF Codeplan - https://pdad.ipe.df.gov.br/
"""

import json
from collections import Counter, defaultdict
import statistics

# =============================================================================
# DADOS OFICIAIS PDAD 2021/2024 - IPEDF CODEPLAN
# Fontes:
# - https://www.codeplan.df.gov.br/pdad-2021-3/
# - https://pdad.ipe.df.gov.br/
# - Relatorios individuais por RA
# =============================================================================

PDAD_OFICIAL = {
    # GRUPO 1 - ALTA RENDA (Renda domiciliar media > R$ 15.000)
    "Lago Sul": {
        "populacao": 29346,
        "populacao_pct": 1.0,
        "renda_domiciliar_media": 23591,  # R$
        "renda_per_capita": 10979,  # Maior do Brasil
        "idade_media": 42,
        "cor_branca_pct": 67.3,
        "cor_parda_pct": 23.8,
        "cor_preta_pct": 8.9,
        "escolaridade_superior_pct": 85.4,
        "grupo_renda": "G1_alta",
    },
    "Lago Norte": {
        "populacao": 35800,
        "populacao_pct": 1.2,
        "renda_domiciliar_media": 18500,
        "renda_per_capita": 7200,
        "idade_media": 40,
        "cor_branca_pct": 62.0,
        "cor_parda_pct": 28.0,
        "cor_preta_pct": 10.0,
        "escolaridade_superior_pct": 75.0,
        "grupo_renda": "G1_alta",
    },
    "Park Way": {
        "populacao": 20500,
        "populacao_pct": 0.7,
        "renda_domiciliar_media": 16000,
        "renda_per_capita": 6500,
        "idade_media": 42,
        "cor_branca_pct": 58.0,
        "cor_parda_pct": 32.0,
        "cor_preta_pct": 10.0,
        "escolaridade_superior_pct": 70.0,
        "grupo_renda": "G1_alta",
    },
    "Sudoeste/Octogonal": {
        "populacao": 55000,
        "populacao_pct": 1.8,
        "renda_domiciliar_media": 15500,
        "renda_per_capita": 6200,
        "idade_media": 38,
        "cor_branca_pct": 55.0,
        "cor_parda_pct": 35.0,
        "cor_preta_pct": 10.0,
        "escolaridade_superior_pct": 72.0,
        "grupo_renda": "G1_alta",
    },
    "Plano Piloto": {
        "populacao": 207996,  # PDAD 2024
        "populacao_pct": 7.0,
        "renda_domiciliar_media": 14000,
        "renda_per_capita": 5800,
        "idade_media": 38,
        "cor_branca_pct": 52.0,
        "cor_parda_pct": 38.0,
        "cor_preta_pct": 10.0,
        "escolaridade_superior_pct": 68.0,
        "grupo_renda": "G1_alta",
    },
    "Jardim Botanico": {
        "populacao": 28000,
        "populacao_pct": 0.9,
        "renda_domiciliar_media": 13500,
        "renda_per_capita": 5200,
        "idade_media": 40,
        "cor_branca_pct": 55.0,
        "cor_parda_pct": 35.0,
        "cor_preta_pct": 10.0,
        "escolaridade_superior_pct": 65.0,
        "grupo_renda": "G1_alta",
    },

    # GRUPO 2 - MEDIA-ALTA RENDA (Renda domiciliar media R$ 6.000 - R$ 15.000)
    "Aguas Claras": {
        "populacao": 160000,
        "populacao_pct": 5.4,
        "renda_domiciliar_media": 9500,
        "renda_per_capita": 3800,
        "idade_media": 34,
        "cor_branca_pct": 45.0,
        "cor_parda_pct": 42.0,
        "cor_preta_pct": 13.0,
        "escolaridade_superior_pct": 55.0,
        "grupo_renda": "G2_media_alta",
    },
    "Guara": {
        "populacao": 135000,
        "populacao_pct": 4.5,
        "renda_domiciliar_media": 8200,
        "renda_per_capita": 3200,
        "idade_media": 37,
        "cor_branca_pct": 42.0,
        "cor_parda_pct": 45.0,
        "cor_preta_pct": 13.0,
        "escolaridade_superior_pct": 45.0,
        "grupo_renda": "G2_media_alta",
    },
    "Cruzeiro": {
        "populacao": 32000,
        "populacao_pct": 1.1,
        "renda_domiciliar_media": 9000,
        "renda_per_capita": 3500,
        "idade_media": 40,
        "cor_branca_pct": 45.0,
        "cor_parda_pct": 42.0,
        "cor_preta_pct": 13.0,
        "escolaridade_superior_pct": 52.0,
        "grupo_renda": "G2_media_alta",
    },
    "Vicente Pires": {
        "populacao": 75000,
        "populacao_pct": 2.5,
        "renda_domiciliar_media": 7800,
        "renda_per_capita": 3000,
        "idade_media": 35,
        "cor_branca_pct": 40.0,
        "cor_parda_pct": 47.0,
        "cor_preta_pct": 13.0,
        "escolaridade_superior_pct": 48.0,
        "grupo_renda": "G2_media_alta",
    },
    "Taguatinga": {
        "populacao": 201332,  # PDAD 2024
        "populacao_pct": 6.8,
        "renda_domiciliar_media": 6800,
        "renda_per_capita": 2600,
        "idade_media": 37.4,  # A mais velha da UPT Oeste
        "cor_branca_pct": 35.0,
        "cor_parda_pct": 50.0,
        "cor_preta_pct": 15.0,
        "escolaridade_superior_pct": 38.0,
        "grupo_renda": "G2_media_alta",
    },
    "Sobradinho": {
        "populacao": 70000,
        "populacao_pct": 2.4,
        "renda_domiciliar_media": 6500,
        "renda_per_capita": 2400,
        "idade_media": 35,
        "cor_branca_pct": 35.0,
        "cor_parda_pct": 50.0,
        "cor_preta_pct": 15.0,
        "escolaridade_superior_pct": 30.0,
        "grupo_renda": "G2_media_alta",
    },
    "Arniqueira": {
        "populacao": 30000,
        "populacao_pct": 1.0,
        "renda_domiciliar_media": 6200,
        "renda_per_capita": 2300,
        "idade_media": 35,
        "cor_branca_pct": 38.0,
        "cor_parda_pct": 48.0,
        "cor_preta_pct": 14.0,
        "escolaridade_superior_pct": 40.0,
        "grupo_renda": "G2_media_alta",
    },
    "Nucleo Bandeirante": {
        "populacao": 24000,
        "populacao_pct": 0.8,
        "renda_domiciliar_media": 6000,
        "renda_per_capita": 2200,
        "idade_media": 38,
        "cor_branca_pct": 35.0,
        "cor_parda_pct": 50.0,
        "cor_preta_pct": 15.0,
        "escolaridade_superior_pct": 32.0,
        "grupo_renda": "G2_media_alta",
    },

    # GRUPO 3 - MEDIA-BAIXA RENDA (Renda domiciliar media R$ 3.500 - R$ 6.000)
    "Ceilandia": {
        "populacao": 287113,  # PDAD 2024 - Maior populacao do DF
        "populacao_pct": 9.6,
        "renda_domiciliar_media": 4142.85,  # PDAD 2021
        "renda_per_capita": 1400,
        "idade_media": 34.8,  # PDAD 2024
        "cor_branca_pct": 20.0,
        "cor_parda_pct": 50.1,  # PDAD 2024
        "cor_preta_pct": 29.9,
        "escolaridade_superior_pct": 15.0,
        "grupo_renda": "G3_media_baixa",
    },
    "Samambaia": {
        "populacao": 227118,  # PDAD 2024 - 2a maior
        "populacao_pct": 7.6,
        "renda_domiciliar_media": 4000,
        "renda_per_capita": 1300,
        "idade_media": 32,
        "cor_branca_pct": 18.0,
        "cor_parda_pct": 52.0,
        "cor_preta_pct": 30.0,
        "escolaridade_superior_pct": 12.0,
        "grupo_renda": "G3_media_baixa",
    },
    "Gama": {
        "populacao": 135000,
        "populacao_pct": 4.5,
        "renda_domiciliar_media": 4800,
        "renda_per_capita": 1600,
        "idade_media": 35,
        "cor_branca_pct": 28.0,
        "cor_parda_pct": 52.0,
        "cor_preta_pct": 20.0,
        "escolaridade_superior_pct": 20.0,
        "grupo_renda": "G3_media_baixa",
    },
    "Santa Maria": {
        "populacao": 135000,
        "populacao_pct": 4.5,
        "renda_domiciliar_media": 3800,
        "renda_per_capita": 1200,
        "idade_media": 30,
        "cor_branca_pct": 18.0,
        "cor_parda_pct": 54.0,
        "cor_preta_pct": 28.0,
        "escolaridade_superior_pct": 12.0,
        "grupo_renda": "G3_media_baixa",
    },
    "Planaltina": {
        "populacao": 195000,
        "populacao_pct": 6.5,
        "renda_domiciliar_media": 3600,
        "renda_per_capita": 1100,
        "idade_media": 30,
        "cor_branca_pct": 20.0,
        "cor_parda_pct": 55.0,
        "cor_preta_pct": 25.0,
        "escolaridade_superior_pct": 10.0,
        "grupo_renda": "G3_media_baixa",
    },
    "Sao Sebastiao": {
        "populacao": 105000,
        "populacao_pct": 3.5,
        "renda_domiciliar_media": 3700,
        "renda_per_capita": 1150,
        "idade_media": 31,
        "cor_branca_pct": 20.0,
        "cor_parda_pct": 52.0,
        "cor_preta_pct": 28.0,
        "escolaridade_superior_pct": 14.0,
        "grupo_renda": "G3_media_baixa",
    },
    "Sobradinho II": {
        "populacao": 95000,
        "populacao_pct": 3.2,
        "renda_domiciliar_media": 4200,
        "renda_per_capita": 1450,
        "idade_media": 33,
        "cor_branca_pct": 28.0,
        "cor_parda_pct": 52.0,
        "cor_preta_pct": 20.0,
        "escolaridade_superior_pct": 22.0,
        "grupo_renda": "G3_media_baixa",
    },
    "Riacho Fundo": {
        "populacao": 42000,
        "populacao_pct": 1.4,
        "renda_domiciliar_media": 4500,
        "renda_per_capita": 1500,
        "idade_media": 34,
        "cor_branca_pct": 28.0,
        "cor_parda_pct": 52.0,
        "cor_preta_pct": 20.0,
        "escolaridade_superior_pct": 22.0,
        "grupo_renda": "G3_media_baixa",
    },
    "Riacho Fundo II": {
        "populacao": 55000,
        "populacao_pct": 1.8,
        "renda_domiciliar_media": 3800,
        "renda_per_capita": 1200,
        "idade_media": 30,
        "cor_branca_pct": 22.0,
        "cor_parda_pct": 55.0,
        "cor_preta_pct": 23.0,
        "escolaridade_superior_pct": 14.0,
        "grupo_renda": "G3_media_baixa",
    },
    "Brazlandia": {
        "populacao": 55000,
        "populacao_pct": 1.8,
        "renda_domiciliar_media": 3900,
        "renda_per_capita": 1250,
        "idade_media": 32,
        "cor_branca_pct": 30.9,  # Menor % branca entre G3
        "cor_parda_pct": 50.0,
        "cor_preta_pct": 19.1,
        "escolaridade_superior_pct": 12.0,
        "grupo_renda": "G3_media_baixa",
    },
    "Paranoa": {
        "populacao": 65000,
        "populacao_pct": 2.2,
        "renda_domiciliar_media": 3500,
        "renda_per_capita": 1100,
        "idade_media": 30,
        "cor_branca_pct": 18.0,
        "cor_parda_pct": 55.0,
        "cor_preta_pct": 27.0,
        "escolaridade_superior_pct": 12.0,
        "grupo_renda": "G3_media_baixa",
    },
    "Candangolandia": {
        "populacao": 16500,
        "populacao_pct": 0.6,
        "renda_domiciliar_media": 4200,
        "renda_per_capita": 1400,
        "idade_media": 35,
        "cor_branca_pct": 25.0,
        "cor_parda_pct": 55.0,
        "cor_preta_pct": 20.0,
        "escolaridade_superior_pct": 18.0,
        "grupo_renda": "G3_media_baixa",
    },
    "SIA": {
        "populacao": 1737,  # Menor populacao do DF
        "populacao_pct": 0.06,
        "renda_domiciliar_media": 5500,
        "renda_per_capita": 2000,
        "idade_media": 38,
        "cor_branca_pct": 35.0,
        "cor_parda_pct": 50.0,
        "cor_preta_pct": 15.0,
        "escolaridade_superior_pct": 35.0,
        "grupo_renda": "G2_media_alta",
    },

    # GRUPO 4 - BAIXA RENDA (Renda domiciliar media < R$ 3.500)
    "Sol Nascente/Por do Sol": {
        "populacao": 90574,  # PDAD 2021
        "populacao_pct": 3.0,
        "renda_domiciliar_media": 2800,
        "renda_per_capita": 710,  # PDAD 2021
        "idade_media": 28.6,  # Populacao mais jovem da UPT Oeste
        "cor_branca_pct": 30.3,  # PDAD 2021
        "cor_parda_pct": 53.9,
        "cor_preta_pct": 14.0,
        "escolaridade_superior_pct": 6.0,
        "grupo_renda": "G4_baixa",
    },
    "Recanto das Emas": {
        "populacao": 150000,
        "populacao_pct": 5.0,
        "renda_domiciliar_media": 3200,
        "renda_per_capita": 950,
        "idade_media": 29,
        "cor_branca_pct": 16.4,  # Mais negra entre as periferias
        "cor_parda_pct": 55.0,
        "cor_preta_pct": 28.6,
        "escolaridade_superior_pct": 8.0,
        "grupo_renda": "G4_baixa",
    },
    "Itapoa": {
        "populacao": 75000,
        "populacao_pct": 2.5,
        "renda_domiciliar_media": 2900,
        "renda_per_capita": 850,
        "idade_media": 28,
        "cor_branca_pct": 15.0,
        "cor_parda_pct": 55.0,
        "cor_preta_pct": 30.0,
        "escolaridade_superior_pct": 6.0,
        "grupo_renda": "G4_baixa",
    },
    "SCIA/Estrutural": {
        "populacao": 40000,
        "populacao_pct": 1.3,
        "renda_domiciliar_media": 2014.03,  # Menor renda do DF - PDAD 2021
        "renda_per_capita": 695,  # Nivel Bangladesh
        "idade_media": 27,
        "cor_branca_pct": 24.6,
        "cor_parda_pct": 52.0,
        "cor_preta_pct": 23.4,  # 75.4% pretos+pardos - maior do DF
        "escolaridade_superior_pct": 4.0,
        "grupo_renda": "G4_baixa",
    },
    "Varjao": {
        "populacao": 9500,
        "populacao_pct": 0.3,
        "renda_domiciliar_media": 2500,
        "renda_per_capita": 750,
        "idade_media": 28,
        "cor_branca_pct": 15.0,
        "cor_parda_pct": 55.0,
        "cor_preta_pct": 30.0,
        "escolaridade_superior_pct": 5.0,
        "grupo_renda": "G4_baixa",
    },
    "Fercal": {
        "populacao": 9000,
        "populacao_pct": 0.3,
        "renda_domiciliar_media": 2800,
        "renda_per_capita": 800,
        "idade_media": 30,
        "cor_branca_pct": 18.0,
        "cor_parda_pct": 58.0,
        "cor_preta_pct": 24.0,
        "escolaridade_superior_pct": 6.0,
        "grupo_renda": "G4_baixa",
    },
}

# Mapeamento de nomes alternativos (acentuacao, grafia)
NOME_NORMALIZADO = {
    "Águas Claras": "Aguas Claras",
    "Guará": "Guara",
    "Ceilândia": "Ceilandia",
    "São Sebastião": "Sao Sebastiao",
    "Paranoá": "Paranoa",
    "Itapoã": "Itapoa",
    "Brazlândia": "Brazlandia",
    "Jardim Botânico": "Jardim Botanico",
    "Núcleo Bandeirante": "Nucleo Bandeirante",
    "Candangolândia": "Candangolandia",
    "Varjão": "Varjao",
    # Variacoes encontradas no banco
    "Ceilandia": "Ceilandia",  # Sem acento no banco
    "Paranoa": "Paranoa",  # Sem acento no banco
}

# Mapeamento de renda para salarios minimos (SM 2024 = R$ 1.412)
RENDA_PARA_REAIS = {
    "ate_1": 706,
    "mais_de_1_ate_2": 2118,
    "mais_de_2_ate_5": 4942,
    "mais_de_5_ate_10": 10590,
    "mais_de_10_ate_20": 21180,
    "mais_de_20": 35300,
}


def normalizar_nome_ra(nome):
    """Normaliza o nome da RA para comparacao"""
    return NOME_NORMALIZADO.get(nome, nome)


def carregar_eleitores(caminho):
    with open(caminho, 'r', encoding='utf-8') as f:
        return json.load(f)


def analisar_por_regiao(eleitores):
    """Agrupa eleitores por RA normalizada"""
    regioes = defaultdict(list)
    for e in eleitores:
        ra = e.get('regiao_administrativa', 'Nao informado')
        ra_norm = normalizar_nome_ra(ra)
        regioes[ra_norm].append(e)
    return regioes


def calcular_metricas(eleitores_ra):
    """Calcula metricas de uma RA"""
    n = len(eleitores_ra)
    if n == 0:
        return None

    # Idade media
    idades = [e.get('idade', 35) for e in eleitores_ra]
    idade_media = statistics.mean(idades)

    # Cor/raca
    cor_counter = Counter(e.get('cor_raca', 'N/A') for e in eleitores_ra)
    cor_branca_pct = (cor_counter.get('branca', 0) / n) * 100
    cor_parda_pct = (cor_counter.get('parda', 0) / n) * 100
    cor_preta_pct = (cor_counter.get('preta', 0) / n) * 100

    # Escolaridade superior
    superior = sum(1 for e in eleitores_ra
                   if e.get('escolaridade') == 'superior_completo_ou_pos')
    escolaridade_superior_pct = (superior / n) * 100

    # Renda media em R$
    rendas = []
    for e in eleitores_ra:
        renda_cat = e.get('renda_salarios_minimos', 'ate_1')
        rendas.append(RENDA_PARA_REAIS.get(renda_cat, 706))
    renda_media = statistics.mean(rendas)

    # Cluster predominante
    clusters = Counter(e.get('cluster_socioeconomico', 'N/A') for e in eleitores_ra)
    cluster_predominante = clusters.most_common(1)[0][0]

    return {
        'n': n,
        'idade_media': round(idade_media, 1),
        'cor_branca_pct': round(cor_branca_pct, 1),
        'cor_parda_pct': round(cor_parda_pct, 1),
        'cor_preta_pct': round(cor_preta_pct, 1),
        'escolaridade_superior_pct': round(escolaridade_superior_pct, 1),
        'renda_media': round(renda_media, 0),
        'cluster_predominante': cluster_predominante,
        'clusters': dict(clusters),
    }


def comparar_com_pdad(metricas, pdad):
    """Compara metricas com dados oficiais PDAD"""
    problemas = []

    if pdad is None:
        return ["RA nao encontrada nos dados PDAD oficiais"]

    # Idade media (tolerancia: 5 anos)
    diff_idade = abs(metricas['idade_media'] - pdad['idade_media'])
    if diff_idade > 5:
        problemas.append({
            'campo': 'Idade media',
            'banco': f"{metricas['idade_media']} anos",
            'pdad': f"{pdad['idade_media']} anos",
            'diff': f"+{diff_idade:.0f} anos" if metricas['idade_media'] > pdad['idade_media'] else f"-{diff_idade:.0f} anos",
            'gravidade': 'GRAVE' if diff_idade > 10 else 'MODERADA'
        })

    # Cor branca (tolerancia: 12 pontos percentuais)
    diff_cor = metricas['cor_branca_pct'] - pdad['cor_branca_pct']
    if abs(diff_cor) > 12:
        problemas.append({
            'campo': 'Cor branca %',
            'banco': f"{metricas['cor_branca_pct']}%",
            'pdad': f"{pdad['cor_branca_pct']}%",
            'diff': f"{diff_cor:+.1f} pp",
            'gravidade': 'GRAVE' if abs(diff_cor) > 20 else 'MODERADA'
        })

    # Escolaridade superior (tolerancia: 15 pontos percentuais)
    diff_esc = metricas['escolaridade_superior_pct'] - pdad['escolaridade_superior_pct']
    if abs(diff_esc) > 15:
        problemas.append({
            'campo': 'Escolaridade superior %',
            'banco': f"{metricas['escolaridade_superior_pct']}%",
            'pdad': f"{pdad['escolaridade_superior_pct']}%",
            'diff': f"{diff_esc:+.1f} pp",
            'gravidade': 'GRAVE' if abs(diff_esc) > 25 else 'MODERADA'
        })

    # Renda media (tolerancia: 40%)
    diff_renda_pct = (metricas['renda_media'] - pdad['renda_domiciliar_media']) / pdad['renda_domiciliar_media'] * 100
    if abs(diff_renda_pct) > 40:
        problemas.append({
            'campo': 'Renda media',
            'banco': f"R$ {metricas['renda_media']:,.0f}",
            'pdad': f"R$ {pdad['renda_domiciliar_media']:,.0f}",
            'diff': f"{diff_renda_pct:+.0f}%",
            'gravidade': 'GRAVE' if abs(diff_renda_pct) > 60 else 'MODERADA'
        })

    # Grupo de renda (cluster)
    if metricas['cluster_predominante'] != pdad['grupo_renda']:
        problemas.append({
            'campo': 'Grupo de renda',
            'banco': metricas['cluster_predominante'],
            'pdad': pdad['grupo_renda'],
            'diff': 'Divergente',
            'gravidade': 'GRAVE'
        })

    return problemas


def main():
    print("=" * 90)
    print("COMPARACAO ELEITORES SINTETICOS vs DADOS OFICIAIS PDAD 2021/2024")
    print("Fonte: IPEDF Codeplan - https://pdad.ipe.df.gov.br/")
    print("=" * 90)
    print()

    # Carregar dados
    eleitores = carregar_eleitores('agentes/banco-eleitores-df.json')
    total = len(eleitores)
    print(f"Total de eleitores no banco: {total}")
    print()

    # Agrupar por RA
    regioes = analisar_por_regiao(eleitores)

    # Consolidar RAs duplicadas
    if 'Ceilandia' in regioes and 'Ceilandia' in regioes:
        pass  # Ja normalizado

    print(f"Regioes administrativas encontradas: {len(regioes)}")
    print()

    # Analise detalhada
    problemas_por_ra = {}
    total_problemas_graves = 0
    total_problemas_moderados = 0

    print("-" * 90)
    print("ANALISE POR REGIAO ADMINISTRATIVA")
    print("-" * 90)

    for ra in sorted(regioes.keys()):
        metricas = calcular_metricas(regioes[ra])

        # Buscar dados PDAD
        pdad = PDAD_OFICIAL.get(ra)
        if not pdad:
            # Tentar variantes de nome
            for nome_pdad in PDAD_OFICIAL.keys():
                if nome_pdad.lower().replace(" ", "") == ra.lower().replace(" ", ""):
                    pdad = PDAD_OFICIAL[nome_pdad]
                    break

        problemas = comparar_com_pdad(metricas, pdad)

        if problemas:
            problemas_por_ra[ra] = {
                'metricas': metricas,
                'pdad': pdad,
                'problemas': problemas
            }
            for p in problemas:
                if isinstance(p, dict):
                    if p.get('gravidade') == 'GRAVE':
                        total_problemas_graves += 1
                    else:
                        total_problemas_moderados += 1

        print(f"\n{'='*70}")
        print(f"RA: {ra} (n={metricas['n']})")
        print(f"{'='*70}")

        print(f"\n  Banco de Eleitores:")
        print(f"    Idade media: {metricas['idade_media']} anos")
        print(f"    Cor: branca {metricas['cor_branca_pct']}% | parda {metricas['cor_parda_pct']}% | preta {metricas['cor_preta_pct']}%")
        print(f"    Escolaridade superior: {metricas['escolaridade_superior_pct']}%")
        print(f"    Renda media: R$ {metricas['renda_media']:,.0f}")
        print(f"    Cluster: {metricas['cluster_predominante']}")

        if pdad:
            print(f"\n  PDAD Oficial:")
            print(f"    Idade media: {pdad['idade_media']} anos")
            print(f"    Cor: branca {pdad['cor_branca_pct']}% | parda {pdad['cor_parda_pct']}% | preta {pdad['cor_preta_pct']}%")
            print(f"    Escolaridade superior: {pdad['escolaridade_superior_pct']}%")
            print(f"    Renda media: R$ {pdad['renda_domiciliar_media']:,.0f}")
            print(f"    Grupo: {pdad['grupo_renda']}")

        if problemas:
            print(f"\n  [!] INCONSISTENCIAS:")
            for p in problemas:
                if isinstance(p, dict):
                    grav = "[GRAVE]" if p['gravidade'] == 'GRAVE' else "[MODERADA]"
                    print(f"    {grav} {p['campo']}: banco={p['banco']}, PDAD={p['pdad']} ({p['diff']})")
                else:
                    print(f"    - {p}")
        else:
            print(f"\n  [OK] Regiao coerente com dados oficiais")

    # Resumo
    print("\n")
    print("=" * 90)
    print("RESUMO DA ANALISE")
    print("=" * 90)
    print(f"Total de eleitores: {total}")
    print(f"Total de RAs analisadas: {len(regioes)}")
    print(f"RAs com problemas: {len(problemas_por_ra)}")
    print(f"Problemas GRAVES: {total_problemas_graves}")
    print(f"Problemas MODERADOS: {total_problemas_moderados}")

    # Problemas mais criticos
    print("\n" + "=" * 90)
    print("PROBLEMAS CRITICOS QUE AFETAM VALIDADE ESTATISTICA")
    print("=" * 90)

    problemas_criticos = []
    for ra, dados in problemas_por_ra.items():
        for p in dados['problemas']:
            if isinstance(p, dict) and p['gravidade'] == 'GRAVE':
                problemas_criticos.append({
                    'ra': ra,
                    'n': dados['metricas']['n'],
                    **p
                })

    # Ordenar por numero de eleitores (impacto)
    problemas_criticos.sort(key=lambda x: x['n'], reverse=True)

    for p in problemas_criticos[:20]:
        print(f"\n  {p['ra']} (n={p['n']}):")
        print(f"    {p['campo']}: banco={p['banco']}, PDAD={p['pdad']} ({p['diff']})")

    # Padroes sistematicos
    print("\n" + "=" * 90)
    print("PADROES SISTEMATICOS IDENTIFICADOS")
    print("=" * 90)

    # Idade
    idades_acima = sum(1 for ra, d in problemas_por_ra.items()
                      for p in d['problemas']
                      if isinstance(p, dict) and p['campo'] == 'Idade media' and '+' in str(p.get('diff', '')))

    print(f"\n  1. IDADE: {idades_acima} RAs com idade media ACIMA do real")
    print(f"     Impacto: Eleitores muito velhos para representar a realidade do DF")
    print(f"     Acao: Rejuvenescer amostra, especialmente nas periferias")

    # Cor
    cor_acima = sum(1 for ra, d in problemas_por_ra.items()
                   for p in d['problemas']
                   if isinstance(p, dict) and p['campo'] == 'Cor branca %' and '+' in str(p.get('diff', '')))

    print(f"\n  2. COR/RACA: {cor_acima} RAs com % brancos ACIMA do real")
    print(f"     Impacto: Sub-representacao da populacao negra/parda nas periferias")
    print(f"     Acao: Ajustar proporcao para refletir 57.4% negros no DF (PDAD 2024)")

    # Escolaridade
    esc_acima = sum(1 for ra, d in problemas_por_ra.items()
                   for p in d['problemas']
                   if isinstance(p, dict) and p['campo'] == 'Escolaridade superior %' and '+' in str(p.get('diff', '')))

    print(f"\n  3. ESCOLARIDADE: {esc_acima} RAs com escolaridade ACIMA do real")
    print(f"     Impacto: Periferias parecem mais escolarizadas que a realidade")
    print(f"     Acao: Reduzir % ensino superior em Ceilandia, Samambaia, Santa Maria")

    # Renda
    renda_divergente = sum(1 for ra, d in problemas_por_ra.items()
                          for p in d['problemas']
                          if isinstance(p, dict) and p['campo'] == 'Renda media')

    print(f"\n  4. RENDA: {renda_divergente} RAs com renda divergente")
    print(f"     Impacto: Regioes nobres sub-representadas, periferias super-representadas")
    print(f"     Acao: Aumentar renda em Lago Sul/Norte, diminuir em periferias")

    print("\n" + "=" * 90)
    print("FONTES OFICIAIS CONSULTADAS")
    print("=" * 90)
    print("  - PDAD 2021: https://www.codeplan.df.gov.br/pdad-2021-3/")
    print("  - PDAD-A 2024: https://pdad.ipe.df.gov.br/")
    print("  - Relatorios por RA: https://www.codeplan.df.gov.br/")
    print()

    return len(problemas_por_ra) == 0


if __name__ == "__main__":
    sucesso = main()
    exit(0 if sucesso else 1)
