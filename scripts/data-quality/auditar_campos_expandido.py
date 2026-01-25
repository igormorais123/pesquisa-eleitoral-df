"""
Auditoria Expandida de Campos
Inclui: Preocupações, Fontes de Informação, Valores, Vieses Cognitivos,
        Estilo de Decisão, Tolerância à Nuance, Interesse Político,
        Filhos, Escolaridade, Ocupação, Regiões Administrativas

Fontes:
- PDAD-A 2024 / IPEDF Codeplan
- Datafolha 2024/2025
- Reuters Institute Digital News Report 2025
- Pesquisa Quaest/Globo "Brasil no Espelho" 2025
- IBGE PNAD 2023/2024
- DataSenado 2024
"""

import json
from collections import Counter

# ============================================================================
# DADOS DE REFERÊNCIA - BASEADOS EM PESQUISAS OFICIAIS
# ============================================================================

REFERENCIAS = {
    # ==========================================================================
    # CAMPOS DEMOGRÁFICOS (PDAD 2024 / IBGE)
    # ==========================================================================

    "genero": {
        "fonte": "PDAD-A 2024",
        "metas": {"feminino": 52.3, "masculino": 47.7},
        "tolerancia": 3,
    },

    "escolaridade": {
        "fonte": "PDAD 2021/2024 - DF tem escolaridade acima da média nacional",
        "metas": {
            "fundamental_ou_sem_instrucao": 25.0,
            "medio_completo_ou_sup_incompleto": 45.0,
            "superior_completo_ou_pos": 30.0,
        },
        "tolerancia": 5,
    },

    "cor_raca": {
        "fonte": "PDAD-A 2024 - 58.3% negros (pretos+pardos), 41.7% não-negros",
        "metas": {
            "branca": 40.0,
            "parda": 45.0,
            "preta": 15.0,
        },
        "tolerancia": 5,
    },

    "ocupacao_vinculo": {
        "fonte": "PDAD-A 2024 - 47.3% privado, 28.6% autônomo, 17.1% público",
        "metas": {
            "clt": 31.5,
            "autonomo": 22.5,
            "informal": 13.5,
            "servidor_publico": 10.0,  # DF tem muito servidor
            "desempregado": 7.0,
            "aposentado": 10.5,
            "estudante": 4.5,
            "empresario": 2.5,
        },
        "tolerancia": 5,
    },

    "faixa_etaria": {
        "fonte": "IBGE/PDAD - Pirâmide Etária DF (média 34.9 anos)",
        "metas": {
            "16-17": 3.0,
            "18-24": 12.0,
            "25-34": 22.0,
            "35-44": 20.0,
            "45-54": 18.0,
            "55-64": 14.0,
            "65+": 11.0,
        },
        "tolerancia": 5,
    },

    "filhos_cat": {
        "fonte": "IBGE 2024 - Taxa fecundidade 1.57 filhos/mulher",
        "metas": {
            "sem_filhos": 35.0,      # Jovens e casais sem filhos
            "1_filho": 25.0,
            "2_filhos": 25.0,
            "3_ou_mais": 15.0,       # Famílias maiores, menor renda
        },
        "tolerancia": 8,
    },

    "estado_civil": {
        "fonte": "IBGE PNAD 2023",
        "metas": {
            "solteiro(a)": 45.0,
            "casado(a)": 30.0,
            "uniao_estavel": 12.0,
            "divorciado(a)": 8.0,
            "viuvo(a)": 5.0,
        },
        "tolerancia": 5,
    },

    # ==========================================================================
    # CAMPOS POLÍTICOS (Datafolha, DataSenado 2024/2025)
    # ==========================================================================

    "orientacao_politica": {
        "fonte": "DataSenado Set/2024 - 40% não se identificam, 11% centro",
        "metas": {
            "direita": 24.0,
            "centro_direita": 12.0,
            "centro": 26.0,          # Centro + não identificados
            "centro_esquerda": 14.0,
            "esquerda": 24.0,
        },
        "tolerancia": 5,
    },

    "interesse_politico": {
        "fonte": "Datafolha 2024 - Polarização aumentou interesse",
        "metas": {
            "alto": 25.0,
            "medio": 40.0,
            "baixo": 35.0,
        },
        "tolerancia": 5,
    },

    "posicao_bolsonaro": {
        "fonte": "Datafolha Jan/2025 - Aprovação ~35%, Rejeição ~55%",
        "metas": {
            "apoiador_forte": 20.0,
            "apoiador_moderado": 12.0,
            "neutro": 15.0,
            "critico_moderado": 18.0,
            "critico_forte": 35.0,
        },
        "tolerancia": 5,
    },

    "tolerancia_nuance": {
        "fonte": "Pesquisas de polarização - Brasil muito polarizado",
        "metas": {
            "baixa": 40.0,   # Polarizados, intolerantes
            "media": 35.0,
            "alta": 25.0,    # Abertos ao diálogo
        },
        "tolerancia": 5,
    },

    # ==========================================================================
    # PREOCUPAÇÕES (Datafolha Dez/2024)
    # ==========================================================================

    "preocupacoes_top": {
        "fonte": "Datafolha Dez/2024 - Ajustado para lista múltipla (~4 itens/eleitor)",
        "metas": {
            # Metas ajustadas para campo de lista múltipla
            # Ranking mantido, percentuais adaptados
            "saude": 42.0,           # Principal preocupação
            "seguranca": 45.0,       # Segurança pública alta no DF
            "economia": 25.0,
            "educacao": 30.0,
            "desemprego": 30.0,
            "corrupcao": 28.0,
            "fome": 23.0,
            "desigualdade": 15.0,
            "violencia": 37.0,       # Inclui criminalidade
            "custo_vida": 48.0,      # Custo de vida alto
            "moradia": 10.0,
            "meio_ambiente": 6.0,
            "transporte": 16.0,
        },
        "tolerancia": 10,
        "campo_lista": "preocupacoes",
        "tipo": "lista",
    },

    # ==========================================================================
    # FONTES DE INFORMAÇÃO (Reuters Institute 2025, Datafolha)
    # ==========================================================================

    "fontes_informacao_top": {
        "fonte": "Reuters Institute 2025 - Ajustado para lista múltipla (~4 fontes/eleitor)",
        "metas": {
            # Metas ajustadas: cada eleitor usa ~4 fontes
            "tv": 68.0,             # TV ainda dominante (inclui todas emissoras)
            "whatsapp": 44.0,       # Mensageiros muito usados
            "youtube": 41.0,
            "instagram": 39.0,
            "facebook": 25.0,
            "sites_noticias": 66.0, # G1, UOL, Folha, etc.
            "tiktok": 24.0,         # Crescendo entre jovens
            "radio": 16.0,
            "jornal_impresso": 15.0, # Folha, Estadão físicos
            "twitter_x": 18.0,
        },
        "tolerancia": 12,
        "campo_lista": "fontes_informacao",
        "tipo": "lista",
    },

    # ==========================================================================
    # VALORES (Quaest/Globo "Brasil no Espelho" 2025)
    # ==========================================================================

    "valores_top": {
        "fonte": "Quaest/Globo 2025 - Ajustado para lista múltipla (~4 valores/eleitor)",
        "metas": {
            # Metas ajustadas: cada eleitor lista ~4 valores principais
            "familia": 61.0,        # Muito importante
            "honestidade": 50.0,
            "trabalho": 44.0,
            "saude": 42.0,
            "fe_religiao": 35.0,    # Fé/religião
            "educacao": 34.0,
            "respeito": 30.0,
            "seguranca": 30.0,
            "justica": 24.0,
            "liberdade": 21.0,
            "solidariedade": 23.0,
            "igualdade": 20.0,
        },
        "tolerancia": 12,
        "campo_lista": "valores",
        "tipo": "lista",
    },

    # ==========================================================================
    # VIESES COGNITIVOS (Pesquisas de comportamento eleitoral)
    # ==========================================================================

    "vieses_cognitivos_top": {
        "fonte": "Estudos comportamento eleitoral - Viés confirmação predomina",
        "metas": {
            "confirmacao": 45.0,        # Mais comum, alimenta polarização
            "ancoragem": 25.0,          # Primeira informação pesa muito
            "disponibilidade": 20.0,    # Eventos recentes influenciam
            "grupo": 30.0,              # Conformidade social
            "autoridade": 20.0,         # Confiança em figuras de autoridade
            "emocional": 35.0,          # Decisões emocionais
            "retrospectiva": 15.0,
            "otimismo": 20.0,
            "status_quo": 25.0,
        },
        "tolerancia": 15,
        "campo_lista": "vieses_cognitivos",
        "tipo": "lista",
    },

    # ==========================================================================
    # ESTILO DE DECISÃO ELEITORAL (Estudos comportamento eleitoral)
    # ==========================================================================

    "estilo_decisao": {
        "fonte": "Estudos comportamento eleitoral - Emocional predomina em camadas populares",
        "metas": {
            "racional_analitico": 20.0,    # Analisa propostas
            "emocional_intuitivo": 35.0,   # Decide por sentimento/carisma
            "pragmatico": 25.0,            # Custo-benefício pessoal
            "ideologico": 15.0,            # Baseado em ideologia
            "influenciavel": 5.0,          # Segue outros
        },
        "tolerancia": 8,
    },

    # ==========================================================================
    # RELIGIÃO (IBGE Censo 2022, Datafolha 2024)
    # ==========================================================================

    "religiao": {
        "fonte": "Quaest 2025 - Católicos 51%, Evangélicos 31%, Sem religião 14%",
        "metas": {
            "catolica": 46.0,
            "evangelica": 28.0,
            "sem_religiao": 14.0,
            "espirita": 4.0,
            "umbanda_candomble": 2.0,
            "outras": 6.0,
        },
        "tolerancia": 5,
    },

    # ==========================================================================
    # SUSCEPTIBILIDADE À DESINFORMAÇÃO (Reuters Institute)
    # ==========================================================================

    "susceptibilidade_desinformacao": {
        "fonte": "Reuters Institute 2025 - Apenas 17% confiam em redes sociais",
        "metas": {
            "baixa": 25.0,
            "media": 45.0,
            "alta": 30.0,
        },
        "tolerancia": 5,
    },

    # ==========================================================================
    # CLUSTER SOCIOECONÔMICO (PDAD 2021)
    # ==========================================================================

    "cluster_socioeconomico": {
        "fonte": "PDAD 2021 - Grupos de Renda",
        "metas": {
            "G1_alta": 12.0,
            "G2_media_alta": 25.0,
            "G3_media_baixa": 45.0,
            "G4_baixa": 18.0,
        },
        "tolerancia": 5,
    },

    # ==========================================================================
    # MEIO DE TRANSPORTE (PDAD 2021)
    # ==========================================================================

    "meio_transporte": {
        "fonte": "PDAD 2021",
        "metas": {
            "onibus": 30.0,
            "carro": 35.0,
            "motocicleta": 10.0,
            "a_pe": 10.0,
            "metro": 5.0,
            "bicicleta": 3.0,
            "nao_se_aplica": 7.0,
        },
        "tolerancia": 5,
    },
}

# Regiões Administrativas com população (PDAD-A 2024)
POPULACAO_RAS = {
    "Ceilândia": 292993,
    "Samambaia": 224129,
    "Plano Piloto": 211668,
    "Taguatinga": 186161,
    "Planaltina": 155824,
    "Águas Claras": 141751,
    "Gama": 121191,
    "Guará": 119923,
    "Sol Nascente/Pôr do Sol": 100000,  # Estimado
    "Santa Maria": 96877,
    "Recanto das Emas": 96377,
    "Sobradinho": 85491,
    "São Sebastião": 84176,
    "Vicente Pires": 72879,
    "Riacho Fundo": 70000,  # I e II combinados
    "Brazlândia": 50000,
    "Sobradinho II": 46000,
    "Paranoá": 42000,
    "SCIA/Estrutural": 35000,
    "Itapoã": 34000,
    "Jardim Botânico": 30000,
    "Cruzeiro": 27000,
    "Sudoeste/Octogonal": 52000,
    "Lago Norte": 34000,
    "Lago Sul": 27000,
    "Park Way": 20000,
    "Núcleo Bandeirante": 22000,
    "Candangolândia": 15000,
    "Varjão": 10000,
    "Fercal": 8000,
    "SIA": 2000,
    "Arniqueira": 35000,
}


def analisar_campo_simples(eleitores, campo, referencia):
    """Analisa um campo categórico simples"""
    n = len(eleitores)
    valores = [e.get(campo) for e in eleitores]
    dist = Counter(valores)

    metas = referencia['metas']
    tolerancia = referencia['tolerancia']

    problemas = []
    for categoria, meta in metas.items():
        atual = dist.get(categoria, 0) / n * 100
        diff = atual - meta

        if abs(diff) > tolerancia:
            status = "CRITICO" if abs(diff) > tolerancia * 2 else "ALERTA"
            problemas.append({
                'categoria': categoria,
                'atual': atual,
                'meta': meta,
                'diff': diff,
                'status': status,
            })

    return dist, problemas


def normalizar_texto(texto):
    """Remove acentos e normaliza texto para comparação"""
    import unicodedata
    if not isinstance(texto, str):
        return ""
    # Remove acentos
    texto = unicodedata.normalize('NFD', texto)
    texto = ''.join(c for c in texto if unicodedata.category(c) != 'Mn')
    return texto.lower().strip()


# Mapeamentos para correspondência de campos de lista
MAPEAMENTOS = {
    'valores': {
        'familia': ['familia', 'familía'],
        'honestidade': ['honestidade'],
        'trabalho': ['trabalho'],
        'saude': ['saude', 'saúde'],
        'fe_religiao': ['fe', 'religiao', 'fé', 'religião', 'fe e religiao'],
        'educacao': ['educacao', 'educação'],
        'respeito': ['respeito'],
        'seguranca': ['seguranca', 'segurança'],
        'justica': ['justica', 'justiça'],
        'liberdade': ['liberdade'],
        'solidariedade': ['solidariedade'],
        'igualdade': ['igualdade'],
    },
    'preocupacoes': {
        'saude': ['saude', 'saúde'],
        'seguranca': ['seguranca publica', 'segurança pública', 'seguranca', 'segurança'],
        'economia': ['economia'],
        'educacao': ['educacao', 'educação'],
        'desemprego': ['desemprego'],
        'corrupcao': ['corrupcao', 'corrupção'],
        'fome': ['fome', 'miseria', 'miséria'],
        'desigualdade': ['desigualdade'],
        'violencia': ['violencia', 'violência', 'criminalidade'],
        'custo_vida': ['custo de vida', 'custo_vida', 'inflacao', 'inflação'],
        'moradia': ['moradia', 'habitacao', 'habitação'],
        'meio_ambiente': ['meio ambiente', 'meio_ambiente', 'ambiente'],
        'transporte': ['transporte'],
    },
    'fontes_informacao': {
        'tv': ['tv globo', 'tv record', 'tv sbt', 'tv band', 'jornal nacional', 'cidade alerta', 'televisao', 'televisão'],
        'whatsapp': ['whatsapp', 'zap'],
        'youtube': ['youtube'],
        'instagram': ['instagram', 'insta'],
        'facebook': ['facebook', 'face'],
        'sites_noticias': ['g1', 'uol', 'folha de s.paulo', 'estadao', 'metropoles', 'metrópoles', 'r7', 'cnn', 'bbc'],
        'tiktok': ['tiktok', 'tik tok'],
        'radio': ['radio', 'rádio'],
        'jornal_impresso': ['jornal impresso', 'correio braziliense'],
        'twitter_x': ['twitter', 'x '],  # Espaço para não pegar outras palavras
    },
    'vieses_cognitivos': {
        'confirmacao': ['confirmacao', 'confirmação'],
        'ancoragem': ['ancoragem'],
        'disponibilidade': ['disponibilidade'],
        'grupo': ['grupo', 'conformidade'],
        'autoridade': ['autoridade'],
        'emocional': ['emocional'],
        'retrospectiva': ['retrospectiva'],
        'otimismo': ['otimismo'],
        'status_quo': ['status_quo', 'status quo'],
    },
}


def analisar_campo_lista(eleitores, campo, referencia):
    """Analisa um campo que contém lista (preocupações, valores, etc.)"""
    n = len(eleitores)

    # Obter mapeamento específico para este campo
    mapeamento = MAPEAMENTOS.get(campo, {})

    metas = referencia['metas']
    tolerancia = referencia['tolerancia']

    problemas = []
    dist = {}

    for categoria, meta in metas.items():
        count = 0
        termos = mapeamento.get(categoria, [categoria])

        # Contar eleitores que mencionam esta categoria
        for e in eleitores:
            lista = e.get(campo, [])
            if isinstance(lista, str):
                lista = [lista]
            if not isinstance(lista, list):
                continue

            # Verificar se algum item da lista corresponde a algum termo
            for item in lista:
                item_norm = normalizar_texto(item)
                for termo in termos:
                    termo_norm = normalizar_texto(termo)
                    if termo_norm in item_norm or item_norm in termo_norm:
                        count += 1
                        break  # Já contou este eleitor para esta categoria
                else:
                    continue
                break  # Sai do loop de itens

        pct = count / n * 100 if n > 0 else 0
        dist[categoria] = count
        diff = pct - meta

        if abs(diff) > tolerancia:
            status = "CRITICO" if abs(diff) > tolerancia * 2 else "ALERTA"
            problemas.append({
                'categoria': categoria,
                'atual': pct,
                'meta': meta,
                'diff': diff,
                'status': status,
            })

    return dist, problemas


def analisar_regioes_administrativas(eleitores):
    """Analisa distribuição por RA vs população real"""
    n = len(eleitores)

    # Contar eleitores por RA
    dist = Counter(e.get('regiao_administrativa', 'N/A') for e in eleitores)

    # Calcular população total de referência
    pop_total = sum(POPULACAO_RAS.values())

    print("\n" + "=" * 80)
    print("DISTRIBUIÇÃO POR REGIÃO ADMINISTRATIVA")
    print("Fonte: PDAD-A 2024 - Proporcional à população")
    print("=" * 80)

    print(f"\n{'RA':<30} {'Banco':>6} {'%Banco':>7} {'%PDAD':>7} {'Diff':>7} {'Status':>10}")
    print("-" * 75)

    problemas = 0
    for ra in sorted(POPULACAO_RAS.keys()):
        pop_ra = POPULACAO_RAS[ra]
        pct_pdad = pop_ra / pop_total * 100

        # Buscar RA no banco (com e sem acento)
        count = dist.get(ra, 0)
        # Tentar variações
        for ra_var in dist.keys():
            if ra.replace('ã', 'a').replace('á', 'a').replace('ô', 'o').replace('é', 'e').replace('í', 'i') == \
               ra_var.replace('ã', 'a').replace('á', 'a').replace('ô', 'o').replace('é', 'e').replace('í', 'i'):
                count = max(count, dist.get(ra_var, 0))

        pct_banco = count / n * 100 if n > 0 else 0
        diff = pct_banco - pct_pdad

        # Tolerância proporcional ao tamanho
        tolerancia = max(2, pct_pdad * 0.5)

        if abs(diff) > tolerancia * 2:
            status = "[CRITICO]"
            problemas += 1
        elif abs(diff) > tolerancia:
            status = "[ALERTA]"
        else:
            status = "[OK]"

        print(f"{ra:<30} {count:>6} {pct_banco:>6.1f}% {pct_pdad:>6.1f}% {diff:>+6.1f}% {status:>10}")

    return problemas


def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    n = len(eleitores)

    print("=" * 80)
    print("AUDITORIA EXPANDIDA - TODOS OS CAMPOS")
    print("=" * 80)
    print(f"Total de eleitores: {n}")

    campos_criticos = []
    campos_alerta = []
    campos_ok = []

    for campo, ref in REFERENCIAS.items():
        tipo = ref.get('tipo', 'simples')

        if tipo == 'lista':
            campo_real = ref.get('campo_lista', campo)
            dist, problemas = analisar_campo_lista(eleitores, campo_real, ref)
        else:
            dist, problemas = analisar_campo_simples(eleitores, campo, ref)

        tem_critico = any(p['status'] == 'CRITICO' for p in problemas)
        tem_alerta = any(p['status'] == 'ALERTA' for p in problemas)

        print("\n" + "-" * 80)
        print(f"CAMPO: {campo}")
        print(f"Fonte: {ref['fonte']}")

        if tipo == 'lista':
            print("(Campo de lista - % de eleitores que mencionam cada item)")

        print()
        print(f"{'Categoria':<35} {'Atual':>8} {'Meta':>8} {'Diff':>8} {'Status':>10}")
        print("-" * 75)

        for categoria, meta in ref['metas'].items():
            if tipo == 'lista':
                count = dist.get(categoria, 0)
                atual = count / n * 100 if n > 0 else 0
            else:
                atual = dist.get(categoria, 0) / n * 100

            diff = atual - meta

            if abs(diff) > ref['tolerancia'] * 2:
                status = "[CRITICO]"
            elif abs(diff) > ref['tolerancia']:
                status = "[ALERTA]"
            else:
                status = "[OK]"

            print(f"{categoria:<35} {atual:>7.1f}% {meta:>7.1f}% {diff:>+7.1f}% {status:>10}")

        if tem_critico:
            campos_criticos.append(campo)
        elif tem_alerta:
            campos_alerta.append(campo)
        else:
            campos_ok.append(campo)

    # Analisar RAs
    problemas_ra = analisar_regioes_administrativas(eleitores)

    # Resumo
    print("\n" + "=" * 80)
    print("RESUMO DA AUDITORIA EXPANDIDA")
    print("=" * 80)
    print(f"Campos OK: {len(campos_ok)}")
    print(f"Campos com ALERTA: {len(campos_alerta)}")
    print(f"Campos CRITICOS: {len(campos_criticos)}")
    print(f"RAs com problema de proporcionalidade: {problemas_ra}")
    print()

    if campos_criticos:
        print("CAMPOS QUE PRECISAM CORREÇÃO URGENTE:")
        for c in campos_criticos:
            print(f"  - {c}")

    if campos_alerta:
        print("\nCAMPOS COM DESVIO MODERADO:")
        for c in campos_alerta:
            print(f"  - {c}")

    print("\n" + "=" * 80)
    print("FONTES DE REFERÊNCIA UTILIZADAS")
    print("=" * 80)
    print("- PDAD-A 2024: https://pdad.ipe.df.gov.br/")
    print("- Datafolha 2024/2025: Pesquisas de preocupações e opinião")
    print("- Reuters Institute Digital News Report 2025")
    print("- Quaest/Globo 'Brasil no Espelho' 2025")
    print("- IBGE PNAD Contínua 2023/2024")
    print("- DataSenado Set/2024: Perfil ideológico do eleitor")


if __name__ == "__main__":
    main()
