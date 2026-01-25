#!/usr/bin/env python3
"""
Script de correção completa do banco de eleitores do DF.
Aplica todas as correções sugeridas:
1. Incoerências idade × escolaridade × profissão
2. Tempo deslocamento × meio transporte
3. Cluster socioeconômico × renda × profissão
4. Typos (solteiroo → solteiro)
5. Normalização de categorias (hífen/underscore/acentos)
6. Voto facultativo (incluindo analfabetos)
7. Rebalanceamento etário (TSE)
8. Rebalanceamento de RAs (PDAD-A)
"""

import json
import random
import unicodedata
import re
from collections import Counter
from copy import deepcopy

# Configuração de seed para reprodutibilidade
random.seed(42)

# ============================================================
# CONSTANTES E MAPEAMENTOS
# ============================================================

# Distribuição etária do TSE para o DF
DIST_ETARIA_TSE = {
    "16-17": 0.0025,
    "18-24": 0.1041,
    "25-34": 0.1993,
    "35-44": 0.2155,
    "45-59": 0.2774,
    "60-69": 0.1133,
    "70+": 0.0879
}

# Distribuição de RAs baseada no PDAD-A (aproximada)
DIST_RA_PDAD = {
    "Ceilândia": 0.098,
    "Samambaia": 0.075,
    "Plano Piloto": 0.071,
    "Taguatinga": 0.068,
    "Águas Claras": 0.055,
    "Recanto das Emas": 0.045,
    "Gama": 0.044,
    "Guará": 0.043,
    "Santa Maria": 0.042,
    "Sobradinho": 0.035,
    "Planaltina": 0.065,
    "São Sebastião": 0.035,
    "Vicente Pires": 0.025,
    "Riacho Fundo": 0.020,
    "Riacho Fundo II": 0.020,
    "Núcleo Bandeirante": 0.015,
    "Brazlândia": 0.020,
    "Paranoá": 0.020,
    "Lago Sul": 0.012,
    "Lago Norte": 0.012,
    "Sudoeste/Octogonal": 0.018,
    "Cruzeiro": 0.015,
    "Candangolândia": 0.008,
    "Park Way": 0.008,
    "SCIA/Estrutural": 0.015,
    "Jardim Botânico": 0.010,
    "Itapoã": 0.025,
    "SIA": 0.005,
    "Varjão": 0.008,
    "Fercal": 0.005,
    "Sol Nascente/Pôr do Sol": 0.045
}

# Profissões reguladas que exigem idade mínima e formação superior
PROFISSOES_REGULADAS = {
    "Médico(a)": {"idade_minima": 24, "escolaridade": "superior_completo_ou_pos"},
    "Dentista": {"idade_minima": 23, "escolaridade": "superior_completo_ou_pos"},
    "Advogado(a)": {"idade_minima": 22, "escolaridade": "superior_completo_ou_pos"},
    "Engenheiro(a) Civil": {"idade_minima": 23, "escolaridade": "superior_completo_ou_pos"},
    "Engenheiro(a)": {"idade_minima": 23, "escolaridade": "superior_completo_ou_pos"},
    "Arquiteto(a)": {"idade_minima": 23, "escolaridade": "superior_completo_ou_pos"},
    "Contador(a)": {"idade_minima": 22, "escolaridade": "superior_completo_ou_pos"},
    "Psicólogo(a)": {"idade_minima": 23, "escolaridade": "superior_completo_ou_pos"},
    "Farmacêutico(a)": {"idade_minima": 23, "escolaridade": "superior_completo_ou_pos"},
    "Enfermeiro(a)": {"idade_minima": 22, "escolaridade": "superior_completo_ou_pos"},
    "Fisioterapeuta": {"idade_minima": 22, "escolaridade": "superior_completo_ou_pos"},
    "Nutricionista": {"idade_minima": 22, "escolaridade": "superior_completo_ou_pos"},
    "Veterinário(a)": {"idade_minima": 23, "escolaridade": "superior_completo_ou_pos"},
    "Professor(a) Universitário(a)": {"idade_minima": 25, "escolaridade": "superior_completo_ou_pos"},
    "Delegado(a)": {"idade_minima": 25, "escolaridade": "superior_completo_ou_pos"},
    "Delegado Federal": {"idade_minima": 25, "escolaridade": "superior_completo_ou_pos"},
    "Promotor(a)": {"idade_minima": 25, "escolaridade": "superior_completo_ou_pos"},
    "Juiz(a)": {"idade_minima": 25, "escolaridade": "superior_completo_ou_pos"},
    "Procurador(a)": {"idade_minima": 25, "escolaridade": "superior_completo_ou_pos"},
    "Auditor(a) Fiscal": {"idade_minima": 25, "escolaridade": "superior_completo_ou_pos"},
    "Diplomata": {"idade_minima": 25, "escolaridade": "superior_completo_ou_pos"},
}

# Profissões para jovens (16-21 anos)
PROFISSOES_JOVENS = [
    "Estudante",
    "Jovem Aprendiz",
    "Estagiário(a)",
    "Atendente de Loja",
    "Atendente de Fast Food",
    "Auxiliar Administrativo",
    "Balconista",
    "Repositor(a)",
    "Promotor(a) de Vendas",
]

# Escolaridades ordenadas
ESCOLARIDADES = [
    "analfabeto",
    "fundamental_incompleto",
    "fundamental_completo_ou_med_incompleto",
    "medio_completo_ou_sup_incompleto",
    "superior_completo_ou_pos"
]

# Mapeamento de cluster por renda e escolaridade
def calcular_cluster(renda, escolaridade, ocupacao):
    """Calcula cluster socioeconômico baseado em renda e escolaridade."""
    renda_score = {
        "ate_1": 1,
        "mais_de_1_ate_2": 2,
        "mais_de_2_ate_5": 3,
        "mais_de_5_ate_10": 4,
        "mais_de_10": 5
    }.get(renda, 2)

    escolaridade_score = {
        "analfabeto": 1,
        "fundamental_incompleto": 2,
        "fundamental_completo_ou_med_incompleto": 3,
        "medio_completo_ou_sup_incompleto": 4,
        "superior_completo_ou_pos": 5
    }.get(escolaridade, 3)

    # Pontuação combinada
    score = (renda_score * 2 + escolaridade_score) / 3

    if score >= 4.0:
        return "G1_alta"
    elif score >= 3.0:
        return "G2_media_alta"
    elif score >= 2.0:
        return "G3_media_baixa"
    else:
        return "G4_baixa"

# Normalização de strings
def normalizar_string(s):
    """Remove acentos e normaliza string."""
    if not isinstance(s, str):
        return s
    # Remove acentos
    nfkd = unicodedata.normalize('NFKD', s)
    sem_acento = ''.join(c for c in nfkd if not unicodedata.combining(c))
    # Converte hífen para underscore
    sem_acento = sem_acento.replace('-', '_')
    return sem_acento

def normalizar_orientacao_politica(op):
    """Normaliza orientação política para padrão com underscore."""
    mapeamento = {
        "centro-esquerda": "centro_esquerda",
        "centro-direita": "centro_direita",
        "centro esquerda": "centro_esquerda",
        "centro direita": "centro_direita",
    }
    return mapeamento.get(op, op)

def normalizar_ra(ra):
    """Normaliza nome de Região Administrativa."""
    mapeamento = {
        "Ceilandia": "Ceilândia",
        "Brasilia": "Plano Piloto",
        "Aguas Claras": "Águas Claras",
        "Paranoa": "Paranoá",
        "Guara": "Guará",
        "Nucleo Bandeirante": "Núcleo Bandeirante",
        "Riacho Fundo 2": "Riacho Fundo II",
        "Riacho Fundo 1": "Riacho Fundo",
        "Itapoa": "Itapoã",
        "Jardim Botanico": "Jardim Botânico",
        "Sol Nascente": "Sol Nascente/Pôr do Sol",
        "Por do Sol": "Sol Nascente/Pôr do Sol",
    }

    # Primeiro verifica mapeamento direto
    if ra in mapeamento:
        return mapeamento[ra]

    # Tenta encontrar por normalização
    ra_norm = normalizar_string(ra).lower()
    for k, v in mapeamento.items():
        if normalizar_string(k).lower() == ra_norm:
            return v

    return ra

def normalizar_lista(lista):
    """Normaliza itens de uma lista removendo duplicatas com grafias diferentes."""
    if not lista:
        return lista

    # Mapeamento de normalização para listas (valores, preocupações, medos, etc.)
    mapeamento = {
        "Corrupcao": "Corrupção",
        "Saude": "Saúde",
        "Seguranca": "Segurança",
        "Educacao": "Educação",
        "Violencia": "Violência",
        "Justica": "Justiça",
        "Ciencia": "Ciência",
        "Familia": "Família",
        "Inflacao": "Inflação",
        "Democracia": "Democracia",
        "Igualdade": "Igualdade",
    }

    resultado = []
    vistos = set()

    for item in lista:
        # Aplica mapeamento se existir
        item_corrigido = mapeamento.get(item, item)

        # Normaliza para verificar duplicatas
        item_norm = normalizar_string(item_corrigido).lower()

        if item_norm not in vistos:
            resultado.append(item_corrigido)
            vistos.add(item_norm)

    return resultado


# ============================================================
# FUNÇÕES DE CORREÇÃO
# ============================================================

def corrigir_idade_escolaridade_profissao(eleitor):
    """Corrige incoerências entre idade, escolaridade e profissão."""
    idade = eleitor["idade"]
    escolaridade = eleitor["escolaridade"]
    profissao = eleitor["profissao"]

    correcoes = []

    # Verifica profissões reguladas
    if profissao in PROFISSOES_REGULADAS:
        req = PROFISSOES_REGULADAS[profissao]
        idade_minima = req["idade_minima"]

        if idade < idade_minima:
            # Opção: ajustar a idade para o mínimo necessário
            # Mas isso pode desbalancear. Melhor ajustar profissão/escolaridade
            if idade < 18:
                eleitor["escolaridade"] = "medio_completo_ou_sup_incompleto" if idade >= 17 else "fundamental_completo_ou_med_incompleto"
                eleitor["profissao"] = "Estudante"
                eleitor["ocupacao_vinculo"] = "desempregado"
                eleitor["renda_salarios_minimos"] = "ate_1"
                correcoes.append(f"Rebaixado para Estudante (idade {idade} incompatível com {profissao})")
            else:
                # Para 18-24, dar profissão compatível
                eleitor["profissao"] = random.choice(["Estudante", "Estagiário(a)", "Auxiliar Administrativo"])
                eleitor["escolaridade"] = "medio_completo_ou_sup_incompleto"
                correcoes.append(f"Ajustada profissão de {profissao} para {eleitor['profissao']} (idade {idade})")

    # Menores de 18 não podem ter superior completo
    if idade < 18 and escolaridade == "superior_completo_ou_pos":
        if idade < 16:
            eleitor["escolaridade"] = "fundamental_completo_ou_med_incompleto"
        else:
            eleitor["escolaridade"] = "medio_completo_ou_sup_incompleto"
        eleitor["profissao"] = "Estudante"
        eleitor["ocupacao_vinculo"] = "desempregado"
        correcoes.append(f"Escolaridade rebaixada (idade {idade} < 18 com superior)")

    # Idade 16-17: ajustes específicos
    if idade in [16, 17]:
        if eleitor["ocupacao_vinculo"] not in ["desempregado", "informal"]:
            eleitor["ocupacao_vinculo"] = "desempregado"
        if eleitor["profissao"] not in ["Estudante", "Jovem Aprendiz", "Estagiário(a)"]:
            eleitor["profissao"] = "Estudante"
            correcoes.append(f"Profissão ajustada para Estudante (idade {idade})")

    return correcoes

def corrigir_deslocamento_transporte(eleitor):
    """Corrige incoerências entre ocupação, tempo de deslocamento e meio de transporte."""
    ocupacao = eleitor["ocupacao_vinculo"]
    tempo = eleitor["tempo_deslocamento_trabalho"]
    transporte = eleitor["meio_transporte"]

    correcoes = []

    # Ocupações que não trabalham fora
    nao_trabalha_fora = ["desempregado", "aposentado", "dona_de_casa"]

    if ocupacao in nao_trabalha_fora:
        if tempo != "nao_se_aplica":
            eleitor["tempo_deslocamento_trabalho"] = "nao_se_aplica"
            correcoes.append(f"Tempo deslocamento ajustado para nao_se_aplica ({ocupacao})")
        if transporte != "nao_se_aplica":
            eleitor["meio_transporte"] = "nao_se_aplica"
            correcoes.append(f"Meio transporte ajustado para nao_se_aplica ({ocupacao})")
    else:
        # Quem trabalha deve ter tempo e transporte definidos
        if tempo == "nao_se_aplica":
            eleitor["tempo_deslocamento_trabalho"] = random.choice(["15_30", "30_45", "45_60"])
            correcoes.append(f"Tempo deslocamento atribuído ({ocupacao} trabalhando)")
        if transporte == "nao_se_aplica":
            eleitor["meio_transporte"] = random.choice(["onibus", "carro", "metro", "moto"])
            correcoes.append(f"Meio transporte atribuído ({ocupacao} trabalhando)")

    return correcoes

def corrigir_cluster_renda_profissao(eleitor):
    """Recalcula cluster socioeconômico baseado em renda e escolaridade."""
    correcoes = []

    renda = eleitor["renda_salarios_minimos"]
    escolaridade = eleitor["escolaridade"]
    ocupacao = eleitor["ocupacao_vinculo"]
    cluster_atual = eleitor["cluster_socioeconomico"]

    cluster_calculado = calcular_cluster(renda, escolaridade, ocupacao)

    if cluster_atual != cluster_calculado:
        eleitor["cluster_socioeconomico"] = cluster_calculado
        correcoes.append(f"Cluster ajustado de {cluster_atual} para {cluster_calculado}")

    # Verifica incoerências específicas de renda x profissão
    profissao = eleitor["profissao"]

    # Profissões de alta renda com renda baixa
    profissoes_alta_renda = ["Médico(a)", "Advogado(a)", "Engenheiro(a)", "Engenheiro(a) Civil",
                           "Delegado(a)", "Delegado Federal", "Juiz(a)", "Promotor(a)", "Procurador(a)"]

    if profissao in profissoes_alta_renda and renda in ["ate_1", "mais_de_1_ate_2"]:
        eleitor["renda_salarios_minimos"] = "mais_de_5_ate_10"
        eleitor["cluster_socioeconomico"] = calcular_cluster("mais_de_5_ate_10", escolaridade, ocupacao)
        correcoes.append(f"Renda ajustada para {profissao} (era {renda})")

    return correcoes

def corrigir_typos(eleitor):
    """Corrige typos conhecidos no texto."""
    correcoes = []

    historia = eleitor.get("historia_resumida", "")
    if "solteiroo" in historia.lower():
        eleitor["historia_resumida"] = historia.replace("solteiroo(a)", "solteiro(a)").replace("Solteiroo(a)", "Solteiro(a)")
        correcoes.append("Corrigido typo solteiroo(a) -> solteiro(a)")

    return correcoes

def normalizar_categorias(eleitor):
    """Normaliza todas as categorias para padrão consistente."""
    correcoes = []

    # Orientação política
    op_original = eleitor["orientacao_politica"]
    op_normalizada = normalizar_orientacao_politica(op_original)
    if op_original != op_normalizada:
        eleitor["orientacao_politica"] = op_normalizada
        correcoes.append(f"Orientação política normalizada: {op_original} -> {op_normalizada}")

    # Região administrativa
    ra_original = eleitor["regiao_administrativa"]
    ra_normalizada = normalizar_ra(ra_original)
    if ra_original != ra_normalizada:
        eleitor["regiao_administrativa"] = ra_normalizada
        correcoes.append(f"RA normalizada: {ra_original} -> {ra_normalizada}")

    # Listas
    for campo in ["valores", "preocupacoes", "medos", "vieses_cognitivos", "fontes_informacao"]:
        if campo in eleitor and eleitor[campo]:
            lista_original = eleitor[campo]
            lista_normalizada = normalizar_lista(lista_original)
            if lista_original != lista_normalizada:
                eleitor[campo] = lista_normalizada
                correcoes.append(f"Lista {campo} normalizada")

    return correcoes

def corrigir_voto_facultativo(eleitor):
    """Ajusta voto facultativo considerando idade E escolaridade (analfabetos)."""
    correcoes = []

    idade = eleitor["idade"]
    escolaridade = eleitor["escolaridade"]
    voto_atual = eleitor["voto_facultativo"]

    # Voto facultativo: 16-17, 70+, ou analfabeto
    deveria_ser_facultativo = (idade < 18) or (idade >= 70) or (escolaridade == "analfabeto")

    if voto_atual != deveria_ser_facultativo:
        eleitor["voto_facultativo"] = deveria_ser_facultativo
        razao = []
        if idade < 18:
            razao.append("16-17 anos")
        if idade >= 70:
            razao.append("70+ anos")
        if escolaridade == "analfabeto":
            razao.append("analfabeto")
        correcoes.append(f"Voto facultativo ajustado para {deveria_ser_facultativo} ({', '.join(razao)})")

    return correcoes

def atualizar_faixa_etaria(eleitor):
    """Atualiza campo faixa_etaria baseado na idade."""
    idade = eleitor["idade"]

    if idade < 18:
        faixa = "16-17"
    elif idade <= 24:
        faixa = "18-24"
    elif idade <= 34:
        faixa = "25-34"
    elif idade <= 44:
        faixa = "35-44"
    elif idade <= 59:
        faixa = "45-59"
    elif idade <= 69:
        faixa = "60-69"
    else:
        faixa = "65+"  # ou "70+"

    eleitor["faixa_etaria"] = faixa


# ============================================================
# REBALANCEAMENTO
# ============================================================

def gerar_idade_por_faixa(faixa):
    """Gera uma idade aleatória dentro da faixa."""
    faixas = {
        "16-17": (16, 17),
        "18-24": (18, 24),
        "25-34": (25, 34),
        "35-44": (35, 44),
        "45-59": (45, 59),
        "60-69": (60, 69),
        "70+": (70, 85)
    }
    min_idade, max_idade = faixas.get(faixa, (25, 45))
    return random.randint(min_idade, max_idade)

def rebalancear_idades(eleitores, dist_alvo):
    """Rebalancea distribuição etária para aproximar do TSE."""
    n_total = len(eleitores)

    # Calcula quantos deveria ter em cada faixa
    alvos = {faixa: int(prop * n_total) for faixa, prop in dist_alvo.items()}

    # Conta atual
    def get_faixa(idade):
        if idade < 18: return "16-17"
        elif idade <= 24: return "18-24"
        elif idade <= 34: return "25-34"
        elif idade <= 44: return "35-44"
        elif idade <= 59: return "45-59"
        elif idade <= 69: return "60-69"
        else: return "70+"

    atual = Counter(get_faixa(e["idade"]) for e in eleitores)

    # Identifica faixas com excesso e déficit
    excesso = {f: atual[f] - alvos[f] for f in alvos if atual[f] > alvos[f]}
    deficit = {f: alvos[f] - atual[f] for f in alvos if atual[f] < alvos[f]}

    print(f"\n=== Rebalanceamento Etário ===")
    print(f"Distribuição atual: {dict(atual)}")
    print(f"Alvos (TSE): {alvos}")
    print(f"Excesso: {excesso}")
    print(f"Déficit: {deficit}")

    # Cria índice por faixa
    por_faixa = {f: [] for f in alvos}
    for i, e in enumerate(eleitores):
        por_faixa[get_faixa(e["idade"])].append(i)

    # Move eleitores de faixas com excesso para faixas com déficit
    movimentos = 0
    for faixa_exc, qtd_exc in excesso.items():
        indices_exc = por_faixa[faixa_exc][:]
        random.shuffle(indices_exc)

        for idx in indices_exc[:qtd_exc]:
            # Encontra faixa com déficit
            for faixa_def in deficit:
                if deficit[faixa_def] > 0:
                    # Move eleitor
                    nova_idade = gerar_idade_por_faixa(faixa_def)
                    eleitores[idx]["idade"] = nova_idade
                    atualizar_faixa_etaria(eleitores[idx])

                    # Ajusta campos dependentes da idade
                    if nova_idade < 18:
                        eleitores[idx]["escolaridade"] = "medio_completo_ou_sup_incompleto"
                        eleitores[idx]["profissao"] = "Estudante"
                        eleitores[idx]["ocupacao_vinculo"] = "desempregado"
                        eleitores[idx]["renda_salarios_minimos"] = "ate_1"
                    elif nova_idade >= 65:
                        if random.random() < 0.6:
                            eleitores[idx]["ocupacao_vinculo"] = "aposentado"
                            eleitores[idx]["profissao"] = "Aposentado(a)"

                    deficit[faixa_def] -= 1
                    movimentos += 1
                    break

    print(f"Eleitores movidos: {movimentos}")

    # Recontagem
    nova_dist = Counter(get_faixa(e["idade"]) for e in eleitores)
    print(f"Nova distribuição: {dict(nova_dist)}")

def rebalancear_ras(eleitores, dist_alvo):
    """Rebalancea distribuição de RAs para aproximar do PDAD-A."""
    n_total = len(eleitores)

    # Lista de RAs válidas
    ras_validas = list(dist_alvo.keys())

    # Primeiro normaliza todas as RAs
    for e in eleitores:
        e["regiao_administrativa"] = normalizar_ra(e["regiao_administrativa"])

    # Conta atual
    atual = Counter(e["regiao_administrativa"] for e in eleitores)

    # Calcula alvos
    alvos = {ra: max(1, int(prop * n_total)) for ra, prop in dist_alvo.items()}

    # Garante que soma dos alvos = n_total
    soma_alvos = sum(alvos.values())
    if soma_alvos < n_total:
        # Distribui o restante proporcionalmente
        diff = n_total - soma_alvos
        for ra in sorted(alvos, key=lambda x: dist_alvo[x], reverse=True)[:diff]:
            alvos[ra] += 1

    print(f"\n=== Rebalanceamento de RAs ===")
    print(f"RAs atuais (top 10): {dict(atual.most_common(10))}")

    # Identifica RAs com excesso e déficit
    excesso = {ra: atual[ra] - alvos.get(ra, 0) for ra in atual if atual[ra] > alvos.get(ra, 0)}
    deficit = {ra: alvos[ra] - atual.get(ra, 0) for ra in alvos if atual.get(ra, 0) < alvos[ra]}

    print(f"RAs com excesso (top 5): {dict(sorted(excesso.items(), key=lambda x: -x[1])[:5])}")
    print(f"RAs com déficit (top 5): {dict(sorted(deficit.items(), key=lambda x: -x[1])[:5])}")

    # Cria índice por RA
    por_ra = {}
    for i, e in enumerate(eleitores):
        ra = e["regiao_administrativa"]
        if ra not in por_ra:
            por_ra[ra] = []
        por_ra[ra].append(i)

    # Move eleitores
    movimentos = 0
    for ra_exc, qtd_exc in sorted(excesso.items(), key=lambda x: -x[1]):
        if ra_exc not in por_ra:
            continue

        indices_exc = por_ra[ra_exc][:]
        random.shuffle(indices_exc)

        for idx in indices_exc[:qtd_exc]:
            for ra_def in sorted(deficit, key=lambda x: -deficit[x]):
                if deficit[ra_def] > 0:
                    eleitores[idx]["regiao_administrativa"] = ra_def
                    deficit[ra_def] -= 1
                    movimentos += 1
                    break

    print(f"Eleitores movidos: {movimentos}")

    # Recontagem
    nova_dist = Counter(e["regiao_administrativa"] for e in eleitores)
    print(f"Nova distribuição (top 10): {dict(nova_dist.most_common(10))}")


# ============================================================
# MAIN
# ============================================================

def main():
    # Carrega o banco
    print("Carregando banco de eleitores...")
    with open("agentes/banco-eleitores-df.json", "r", encoding="utf-8") as f:
        eleitores = json.load(f)

    print(f"Total de eleitores: {len(eleitores)}")

    # Estatísticas de correções
    stats = {
        "idade_escolaridade_profissao": 0,
        "deslocamento_transporte": 0,
        "cluster_renda": 0,
        "typos": 0,
        "categorias": 0,
        "voto_facultativo": 0
    }

    # Aplica correções em cada eleitor
    print("\n=== Aplicando Correções ===")

    for i, eleitor in enumerate(eleitores):
        # 1. Idade × Escolaridade × Profissão
        correcoes = corrigir_idade_escolaridade_profissao(eleitor)
        if correcoes:
            stats["idade_escolaridade_profissao"] += len(correcoes)
            if len(correcoes) > 0 and i < 20:  # Mostra primeiros casos
                print(f"  {eleitor['id']}: {correcoes}")

        # 2. Deslocamento × Transporte
        correcoes = corrigir_deslocamento_transporte(eleitor)
        stats["deslocamento_transporte"] += len(correcoes)

        # 3. Cluster × Renda × Profissão
        correcoes = corrigir_cluster_renda_profissao(eleitor)
        stats["cluster_renda"] += len(correcoes)

        # 4. Typos
        correcoes = corrigir_typos(eleitor)
        stats["typos"] += len(correcoes)

        # 5. Normalização de categorias
        correcoes = normalizar_categorias(eleitor)
        stats["categorias"] += len(correcoes)

        # 6. Voto facultativo
        correcoes = corrigir_voto_facultativo(eleitor)
        stats["voto_facultativo"] += len(correcoes)

        # Atualiza faixa etária
        atualizar_faixa_etaria(eleitor)

    print("\n=== Estatísticas de Correções ===")
    for tipo, qtd in stats.items():
        print(f"  {tipo}: {qtd} correções")

    # Rebalanceamento
    rebalancear_idades(eleitores, DIST_ETARIA_TSE)
    rebalancear_ras(eleitores, DIST_RA_PDAD)

    # Aplica correções novamente após rebalanceamento
    print("\n=== Correções pós-rebalanceamento ===")
    for eleitor in eleitores:
        corrigir_idade_escolaridade_profissao(eleitor)
        corrigir_deslocamento_transporte(eleitor)
        corrigir_cluster_renda_profissao(eleitor)
        corrigir_voto_facultativo(eleitor)
        atualizar_faixa_etaria(eleitor)

    # Validação final
    print("\n=== Validação Final ===")

    # Verifica distribuição etária
    def get_faixa(idade):
        if idade < 18: return "16-17"
        elif idade <= 24: return "18-24"
        elif idade <= 34: return "25-34"
        elif idade <= 44: return "35-44"
        elif idade <= 59: return "45-59"
        elif idade <= 69: return "60-69"
        else: return "70+"

    dist_etaria = Counter(get_faixa(e["idade"]) for e in eleitores)
    print(f"Distribuição etária final: {dict(sorted(dist_etaria.items()))}")

    # Verifica distribuição de RAs
    dist_ra = Counter(e["regiao_administrativa"] for e in eleitores)
    print(f"Top 10 RAs: {dict(dist_ra.most_common(10))}")

    # Verifica orientações políticas
    dist_op = Counter(e["orientacao_politica"] for e in eleitores)
    print(f"Orientações políticas: {dict(dist_op)}")

    # Salva backup
    print("\n=== Salvando ===")
    with open("agentes/banco-eleitores-df-backup.json", "w", encoding="utf-8") as f:
        json.dump(json.load(open("agentes/banco-eleitores-df.json", "r", encoding="utf-8")), f, ensure_ascii=False, indent=2)
    print("Backup salvo em: agentes/banco-eleitores-df-backup.json")

    # Salva corrigido
    with open("agentes/banco-eleitores-df.json", "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)
    print("Banco corrigido salvo em: agentes/banco-eleitores-df.json")

    print("\n✅ Correção concluída!")

if __name__ == "__main__":
    main()
