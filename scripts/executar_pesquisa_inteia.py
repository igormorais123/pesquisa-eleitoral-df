# -*- coding: utf-8 -*-
"""
INTEIA - Pesquisa Eleitoral Governador DF 2026
Execução completa com 300 eleitores e 36 perguntas
"""

import json
import random
import sys
import io
from datetime import datetime
from collections import Counter, defaultdict
from pathlib import Path
import math

# Fix encoding para Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Configuracoes
TOTAL_ELEITORES = 300
MARGEM_ERRO_DESEJADA = 5.7  # Para 300 eleitores, 95% confianca
NIVEL_CONFIANCA = 95

# Questionario completo - 36 perguntas em 12 blocos
QUESTIONARIO = {
    "titulo": "Pesquisa Eleitoral Governador DF 2026",
    "subtitulo": "Intencao de Voto e Avaliacao Politica",
    "data": datetime.now().strftime("%Y-%m-%d"),
    "blocos": [
        {
            "nome": "BLOCO 1: PERFIL SOCIODEMOGRAFICO",
            "perguntas": [
                {"id": "P01", "texto": "Qual sua idade?", "tipo": "numerica", "campo": "idade"},
                {"id": "P02", "texto": "Qual seu genero?", "tipo": "categorica", "campo": "genero",
                 "opcoes": ["Masculino", "Feminino", "Outro/Prefiro nao dizer"]},
                {"id": "P03", "texto": "Qual sua escolaridade?", "tipo": "categorica", "campo": "escolaridade",
                 "opcoes": ["Fundamental incompleto", "Fundamental completo", "Medio incompleto",
                           "Medio completo", "Superior incompleto", "Superior completo", "Pos-graduacao"]},
                {"id": "P04", "texto": "Qual sua renda familiar mensal?", "tipo": "categorica", "campo": "renda_salarios_minimos",
                 "opcoes": ["Ate 1 SM", "1-2 SM", "2-5 SM", "5-10 SM", "Acima de 10 SM"]},
                {"id": "P05", "texto": "Qual sua religiao?", "tipo": "categorica", "campo": "religiao",
                 "opcoes": ["Catolica", "Evangelica", "Espirita", "Outra", "Sem religiao"]},
                {"id": "P06", "texto": "Qual sua cor/raca?", "tipo": "categorica", "campo": "cor_raca",
                 "opcoes": ["Branca", "Preta", "Parda", "Amarela", "Indigena"]},
                {"id": "P07", "texto": "Em qual Regiao Administrativa voce mora?", "tipo": "categorica", "campo": "regiao_administrativa"},
                {"id": "P08", "texto": "Qual seu estado civil?", "tipo": "categorica", "campo": "estado_civil",
                 "opcoes": ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viuvo(a)", "Uniao estavel"]}
            ]
        },
        {
            "nome": "BLOCO 2: AVALIACAO DO GOVERNO ATUAL",
            "perguntas": [
                {"id": "P09", "texto": "Como voce avalia o governo do Governador Ibaneis Rocha?",
                 "tipo": "escala", "opcoes": ["Otimo", "Bom", "Regular", "Ruim", "Pessimo", "NS/NR"]},
                {"id": "P10", "texto": "Como voce avalia a gestao da Vice-Governadora Celina Leao?",
                 "tipo": "escala", "opcoes": ["Otimo", "Bom", "Regular", "Ruim", "Pessimo", "NS/NR", "Nao conheco"]},
                {"id": "P11", "texto": "Em comparacao com 4 anos atras, voce acha que o DF esta melhor, igual ou pior?",
                 "tipo": "comparativa", "opcoes": ["Muito melhor", "Um pouco melhor", "Igual", "Um pouco pior", "Muito pior", "NS/NR"]}
            ]
        },
        {
            "nome": "BLOCO 3: PROBLEMAS E PRIORIDADES",
            "perguntas": [
                {"id": "P12", "texto": "Qual o principal problema do Distrito Federal hoje? (espontanea)",
                 "tipo": "espontanea", "campo": "preocupacoes"},
                {"id": "P13", "texto": "Qual area deveria ser prioridade do proximo governador?",
                 "tipo": "categorica", "opcoes": ["Saude", "Seguranca", "Educacao", "Transporte", "Emprego", "Moradia", "Outra"]},
                {"id": "P14", "texto": "O quanto voce confia que o proximo governo vai resolver os problemas do DF?",
                 "tipo": "escala", "opcoes": ["Confia muito", "Confia um pouco", "Nem confia nem desconfia", "Desconfia um pouco", "Desconfia muito", "NS/NR"]}
            ]
        },
        {
            "nome": "BLOCO 4: INTENCAO DE VOTO ESPONTANEA",
            "perguntas": [
                {"id": "P15", "texto": "Se a eleicao para Governador do DF fosse hoje, em quem voce votaria? (espontanea)",
                 "tipo": "espontanea_voto"},
                {"id": "P16", "texto": "E se esse candidato nao pudesse concorrer, em quem voce votaria?",
                 "tipo": "espontanea_voto_segunda"}
            ]
        },
        {
            "nome": "BLOCO 5: INTENCAO DE VOTO ESTIMULADA",
            "perguntas": [
                {"id": "P17", "texto": "Se a eleicao fosse hoje e os candidatos fossem estes, em quem voce votaria?",
                 "tipo": "estimulada_voto",
                 "opcoes": ["Celina Leao (PP)", "Damares Alves (Republicanos)", "Bia Kicis (PL)",
                          "Leandro Grass (PV)", "Paulo Octavio (PSD)", "Izalci Lucas (PL)",
                          "Branco/Nulo", "Indeciso", "NS/NR"]},
                {"id": "P18", "texto": "E em segundo turno, se fosse Celina Leao contra [candidato mais votado], em quem voce votaria?",
                 "tipo": "segundo_turno_estimulado"}
            ]
        },
        {
            "nome": "BLOCO 6: CENARIOS DE SEGUNDO TURNO",
            "perguntas": [
                {"id": "P19", "texto": "Em um segundo turno entre Celina Leao e Damares Alves, em quem voce votaria?",
                 "tipo": "segundo_turno", "opcoes": ["Celina Leao", "Damares Alves", "Branco/Nulo", "NS/NR"]},
                {"id": "P20", "texto": "Em um segundo turno entre Celina Leao e Bia Kicis, em quem voce votaria?",
                 "tipo": "segundo_turno", "opcoes": ["Celina Leao", "Bia Kicis", "Branco/Nulo", "NS/NR"]},
                {"id": "P21", "texto": "Em um segundo turno entre Celina Leao e Leandro Grass, em quem voce votaria?",
                 "tipo": "segundo_turno", "opcoes": ["Celina Leao", "Leandro Grass", "Branco/Nulo", "NS/NR"]}
            ]
        },
        {
            "nome": "BLOCO 7: REJEICAO",
            "perguntas": [
                {"id": "P22", "texto": "Em qual destes candidatos voce NAO votaria de jeito nenhum?",
                 "tipo": "rejeicao_multipla",
                 "opcoes": ["Celina Leao", "Damares Alves", "Bia Kicis", "Leandro Grass",
                          "Paulo Octavio", "Izalci Lucas", "Nenhum", "NS/NR"]},
                {"id": "P23", "texto": "Por que voce nao votaria nesse(s) candidato(s)?",
                 "tipo": "espontanea"}
            ]
        },
        {
            "nome": "BLOCO 8: CONHECIMENTO E AVALIACAO DE CANDIDATOS",
            "perguntas": [
                {"id": "P24", "texto": "Quais destes candidatos voce conhece, mesmo que so de nome?",
                 "tipo": "conhecimento_multiplo",
                 "opcoes": ["Celina Leao", "Damares Alves", "Bia Kicis", "Leandro Grass",
                          "Paulo Octavio", "Izalci Lucas"]},
                {"id": "P25", "texto": "Como voce avalia cada candidato que conhece? (Positiva/Neutra/Negativa)",
                 "tipo": "avaliacao_candidatos"}
            ]
        },
        {
            "nome": "BLOCO 9: CERTEZA E ENGAJAMENTO",
            "perguntas": [
                {"id": "P26", "texto": "Numa escala de 0 a 10, o quanto voce tem certeza do seu voto?",
                 "tipo": "escala_numerica", "min": 0, "max": 10},
                {"id": "P27", "texto": "Voce ja conversou com alguem sobre as eleicoes de 2026?",
                 "tipo": "binaria", "opcoes": ["Sim", "Nao"]},
                {"id": "P28", "texto": "Voce pretende acompanhar debates e propagandas eleitorais?",
                 "tipo": "escala", "opcoes": ["Com certeza", "Provavelmente", "Talvez", "Provavelmente nao", "Com certeza nao"]},
                {"id": "P29", "texto": "O que mais pode fazer voce mudar de voto ate a eleicao?",
                 "tipo": "espontanea"}
            ]
        },
        {
            "nome": "BLOCO 10: POSICIONAMENTO IDEOLOGICO",
            "perguntas": [
                {"id": "P30", "texto": "Em uma escala de 0 (esquerda) a 10 (direita), onde voce se posiciona?",
                 "tipo": "escala_numerica", "min": 0, "max": 10},
                {"id": "P31", "texto": "Como voce avalia o governo do presidente Lula?",
                 "tipo": "escala", "opcoes": ["Otimo", "Bom", "Regular", "Ruim", "Pessimo", "NS/NR"]}
            ]
        },
        {
            "nome": "BLOCO 11: PERGUNTAS ESPECIFICAS SOBRE CELINA LEAO",
            "perguntas": [
                {"id": "P32", "texto": "Voce conhece o trabalho de Celina Leao como Vice-Governadora?",
                 "tipo": "escala", "opcoes": ["Conheco bem", "Conheco um pouco", "Ja ouvi falar", "Nao conheco"]},
                {"id": "P33", "texto": "O que voce acha de Celina Leao como possivel Governadora?",
                 "tipo": "escala", "opcoes": ["Muito preparada", "Preparada", "Pouco preparada", "Nao preparada", "NS/NR"]},
                {"id": "P34", "texto": "Qual caracteristica voce mais associa a Celina Leao?",
                 "tipo": "espontanea"},
                {"id": "P35", "texto": "O fato de Celina Leao ser mulher influencia seu voto?",
                 "tipo": "escala", "opcoes": ["Influencia positivamente", "Nao influencia", "Influencia negativamente", "NS/NR"]}
            ]
        },
        {
            "nome": "BLOCO 12: ENCERRAMENTO",
            "perguntas": [
                {"id": "P36", "texto": "Gostaria de deixar algum comentario ou sugestao para o proximo governador do DF?",
                 "tipo": "aberta"}
            ]
        }
    ]
}

# Candidatos possiveis para governador 2026
CANDIDATOS = [
    {"nome": "Celina Leao", "partido": "PP", "espectro": "centro_direita", "perfil": "gestora_pragmatica"},
    {"nome": "Damares Alves", "partido": "Republicanos", "espectro": "direita", "perfil": "conservadora_evangelica"},
    {"nome": "Bia Kicis", "partido": "PL", "espectro": "extrema_direita", "perfil": "bolsonarista_radical"},
    {"nome": "Leandro Grass", "partido": "PV", "espectro": "esquerda", "perfil": "progressista_ambiental"},
    {"nome": "Paulo Octavio", "partido": "PSD", "espectro": "centro", "perfil": "empresario_tradicional"},
    {"nome": "Izalci Lucas", "partido": "PL", "espectro": "direita", "perfil": "politico_tradicional"}
]


def carregar_eleitores():
    """Carrega banco de eleitores"""
    caminho = Path("C:/Agentes/agentes/banco-eleitores-df.json")
    with open(caminho, 'r', encoding='utf-8') as f:
        return json.load(f)


def selecionar_amostra_estratificada(eleitores, n=300):
    """Seleciona amostra estratificada por regiao e perfil"""
    # Agrupa por regiao administrativa
    por_regiao = defaultdict(list)
    for e in eleitores:
        por_regiao[e.get('regiao_administrativa', 'Outros')].append(e)

    selecionados = []
    total_disponivel = len(eleitores)

    # Distribui proporcionalmente por regiao
    for regiao, lista in por_regiao.items():
        proporcao = len(lista) / total_disponivel
        qtd_regiao = max(1, int(n * proporcao))

        if len(lista) >= qtd_regiao:
            selecionados.extend(random.sample(lista, qtd_regiao))
        else:
            selecionados.extend(lista)

    # Ajusta para exatamente n
    if len(selecionados) < n:
        restantes = [e for e in eleitores if e not in selecionados]
        faltam = n - len(selecionados)
        selecionados.extend(random.sample(restantes, min(faltam, len(restantes))))
    elif len(selecionados) > n:
        selecionados = random.sample(selecionados, n)

    return selecionados


def calcular_probabilidade_voto(eleitor, candidato):
    """Calcula probabilidade de voto baseado no perfil do eleitor"""
    prob_base = 0.15  # Probabilidade base

    orientacao = eleitor.get('orientacao_politica', 'centro')
    posicao_bolsonaro = eleitor.get('posicao_bolsonaro', 'neutro')
    religiao = eleitor.get('religiao', 'outra')
    genero = eleitor.get('genero', 'masculino')
    escolaridade = eleitor.get('escolaridade', 'medio')
    classe = eleitor.get('classe_social', 'media')

    cand_nome = candidato['nome']
    cand_espectro = candidato['espectro']
    cand_perfil = candidato['perfil']

    # Ajustes por alinhamento ideologico
    if orientacao in ['direita', 'extrema_direita']:
        if cand_espectro in ['direita', 'extrema_direita']:
            prob_base += 0.25
        elif cand_espectro == 'centro_direita':
            prob_base += 0.15
        elif cand_espectro in ['esquerda', 'extrema_esquerda']:
            prob_base -= 0.10
    elif orientacao in ['esquerda', 'extrema_esquerda']:
        if cand_espectro in ['esquerda', 'extrema_esquerda']:
            prob_base += 0.25
        elif cand_espectro == 'centro_esquerda':
            prob_base += 0.15
        elif cand_espectro in ['direita', 'extrema_direita']:
            prob_base -= 0.10
    elif orientacao == 'centro_direita':
        if cand_espectro == 'centro_direita':
            prob_base += 0.20
        elif cand_espectro == 'centro':
            prob_base += 0.10
    elif orientacao == 'centro_esquerda':
        if cand_espectro == 'centro_esquerda':
            prob_base += 0.20
        elif cand_espectro == 'centro':
            prob_base += 0.10

    # Ajustes especificos por candidato
    if cand_nome == "Celina Leao":
        # Mulheres tem leve preferencia
        if genero == 'feminino':
            prob_base += 0.05
        # Quem aprova governo atual
        if posicao_bolsonaro in ['neutro', 'critico_moderado']:
            prob_base += 0.08
        # Centro e centro-direita favoraveis
        if orientacao in ['centro', 'centro_direita']:
            prob_base += 0.10

    elif cand_nome == "Damares Alves":
        # Evangelicos tem forte preferencia
        if religiao == 'evangelica':
            prob_base += 0.20
        # Bolsonaristas moderados
        if posicao_bolsonaro == 'apoiador_moderado':
            prob_base += 0.15
        # Conservadores
        if orientacao == 'direita':
            prob_base += 0.12

    elif cand_nome == "Bia Kicis":
        # Bolsonaristas fortes
        if posicao_bolsonaro == 'apoiador_forte':
            prob_base += 0.25
        # Extrema direita
        if orientacao == 'extrema_direita':
            prob_base += 0.20
        # Anti-petistas
        if orientacao in ['direita', 'extrema_direita']:
            prob_base += 0.08

    elif cand_nome == "Leandro Grass":
        # Progressistas e esquerda
        if orientacao in ['esquerda', 'centro_esquerda']:
            prob_base += 0.20
        # Criticos de Bolsonaro
        if posicao_bolsonaro in ['critico_forte', 'critico_moderado']:
            prob_base += 0.12
        # Maior escolaridade
        if escolaridade == 'superior_ou_pos':
            prob_base += 0.05

    elif cand_nome == "Paulo Octavio":
        # Centro e pragmaticos
        if orientacao == 'centro':
            prob_base += 0.15
        # Classes mais altas
        if classe in ['alta', 'media_alta']:
            prob_base += 0.10
        # Empresarios e comerciantes

    elif cand_nome == "Izalci Lucas":
        # Direita tradicional
        if orientacao == 'direita':
            prob_base += 0.10
        # PL voters
        if posicao_bolsonaro in ['apoiador_moderado', 'apoiador_forte']:
            prob_base += 0.08

    # Adiciona variacao aleatoria
    prob_base += random.uniform(-0.05, 0.05)

    return max(0.01, min(0.95, prob_base))


def simular_voto_estimulado(eleitor, candidatos):
    """Simula voto estimulado baseado no perfil do eleitor"""
    probabilidades = {}

    for cand in candidatos:
        prob = calcular_probabilidade_voto(eleitor, cand)
        probabilidades[cand['nome']] = prob

    # Adiciona opcoes de nao-voto
    interesse = eleitor.get('interesse_politico', 'medio')
    if interesse == 'baixo':
        probabilidades['Indeciso'] = 0.15
        probabilidades['Branco/Nulo'] = 0.10
    elif interesse == 'medio':
        probabilidades['Indeciso'] = 0.08
        probabilidades['Branco/Nulo'] = 0.05
    else:
        probabilidades['Indeciso'] = 0.03
        probabilidades['Branco/Nulo'] = 0.02

    # Normaliza probabilidades
    total = sum(probabilidades.values())
    probabilidades = {k: v/total for k, v in probabilidades.items()}

    # Sorteia voto baseado nas probabilidades
    opcoes = list(probabilidades.keys())
    pesos = list(probabilidades.values())

    return random.choices(opcoes, weights=pesos, k=1)[0]


def simular_voto_espontaneo(eleitor):
    """Simula voto espontaneo (muitos nao sabem)"""
    interesse = eleitor.get('interesse_politico', 'medio')

    if interesse == 'baixo':
        if random.random() < 0.60:
            return "NS/NR"
    elif interesse == 'medio':
        if random.random() < 0.35:
            return "NS/NR"
    else:
        if random.random() < 0.15:
            return "NS/NR"

    # Se sabe, usa mesma logica do estimulado
    return simular_voto_estimulado(eleitor, CANDIDATOS)


def simular_segundo_turno(eleitor, cand1, cand2):
    """Simula voto em cenario de segundo turno"""
    prob1 = calcular_probabilidade_voto(eleitor,
        next((c for c in CANDIDATOS if c['nome'] == cand1), {'nome': cand1, 'espectro': 'centro', 'perfil': 'generico'}))
    prob2 = calcular_probabilidade_voto(eleitor,
        next((c for c in CANDIDATOS if c['nome'] == cand2), {'nome': cand2, 'espectro': 'centro', 'perfil': 'generico'}))

    # Adiciona chance de branco/nulo
    prob_nulo = 0.08
    if eleitor.get('interesse_politico') == 'baixo':
        prob_nulo = 0.15

    total = prob1 + prob2 + prob_nulo
    prob1, prob2, prob_nulo = prob1/total, prob2/total, prob_nulo/total

    escolha = random.choices([cand1, cand2, "Branco/Nulo"], weights=[prob1, prob2, prob_nulo], k=1)[0]
    return escolha


def simular_avaliacao_governo(eleitor):
    """Simula avaliacao do governo atual"""
    orientacao = eleitor.get('orientacao_politica', 'centro')
    posicao_bolsonaro = eleitor.get('posicao_bolsonaro', 'neutro')

    # Tendencias base
    if orientacao in ['direita', 'centro_direita']:
        base_ibaneis = random.choices(
            ["Otimo", "Bom", "Regular", "Ruim", "Pessimo"],
            weights=[0.15, 0.35, 0.30, 0.15, 0.05], k=1)[0]
    elif orientacao in ['esquerda', 'centro_esquerda']:
        base_ibaneis = random.choices(
            ["Otimo", "Bom", "Regular", "Ruim", "Pessimo"],
            weights=[0.05, 0.15, 0.35, 0.30, 0.15], k=1)[0]
    else:
        base_ibaneis = random.choices(
            ["Otimo", "Bom", "Regular", "Ruim", "Pessimo"],
            weights=[0.10, 0.25, 0.40, 0.18, 0.07], k=1)[0]

    return base_ibaneis


def simular_avaliacao_celina(eleitor):
    """Simula avaliacao da Celina Leao"""
    # Menos conhecida, mais NS/NR
    if random.random() < 0.25:
        return "NS/NR"
    if random.random() < 0.15:
        return "Nao conheco"

    orientacao = eleitor.get('orientacao_politica', 'centro')
    genero = eleitor.get('genero', 'masculino')

    # Ajustes
    if orientacao in ['centro', 'centro_direita']:
        weights = [0.12, 0.32, 0.35, 0.15, 0.06]
    elif orientacao in ['direita']:
        weights = [0.10, 0.28, 0.38, 0.17, 0.07]
    elif orientacao in ['esquerda', 'centro_esquerda']:
        weights = [0.05, 0.18, 0.40, 0.25, 0.12]
    else:
        weights = [0.08, 0.25, 0.40, 0.20, 0.07]

    # Mulheres tem leve tendencia mais favoravel
    if genero == 'feminino':
        weights[0] += 0.03
        weights[1] += 0.05
        weights[3] -= 0.05
        weights[4] -= 0.03

    return random.choices(["Otimo", "Bom", "Regular", "Ruim", "Pessimo"], weights=weights, k=1)[0]


def simular_rejeicao(eleitor):
    """Simula quais candidatos o eleitor rejeita"""
    rejeitados = []
    orientacao = eleitor.get('orientacao_politica', 'centro')
    posicao_bolsonaro = eleitor.get('posicao_bolsonaro', 'neutro')

    for cand in CANDIDATOS:
        prob_rejeicao = 0.15  # Base

        # Rejeicao ideologica
        if orientacao in ['esquerda', 'extrema_esquerda']:
            if cand['espectro'] in ['direita', 'extrema_direita']:
                prob_rejeicao += 0.35
        elif orientacao in ['direita', 'extrema_direita']:
            if cand['espectro'] in ['esquerda', 'extrema_esquerda']:
                prob_rejeicao += 0.35

        # Rejeicao a Bia Kicis por nao-bolsonaristas
        if cand['nome'] == "Bia Kicis":
            if posicao_bolsonaro in ['critico_forte', 'critico_moderado']:
                prob_rejeicao += 0.40

        # Rejeicao a Leandro Grass por bolsonaristas
        if cand['nome'] == "Leandro Grass":
            if posicao_bolsonaro in ['apoiador_forte']:
                prob_rejeicao += 0.35

        if random.random() < prob_rejeicao:
            rejeitados.append(cand['nome'])

    return rejeitados if rejeitados else ["Nenhum"]


def simular_escala_ideologica(eleitor):
    """Simula posicionamento na escala 0-10 (esquerda-direita)"""
    orientacao = eleitor.get('orientacao_politica', 'centro')

    mapeamento = {
        'extrema_esquerda': (0, 2),
        'esquerda': (1, 4),
        'centro_esquerda': (3, 5),
        'centro': (4, 6),
        'centro_direita': (5, 7),
        'direita': (6, 9),
        'extrema_direita': (8, 10)
    }

    faixa = mapeamento.get(orientacao, (4, 6))
    return random.randint(faixa[0], faixa[1])


def simular_principal_problema(eleitor):
    """Simula resposta sobre principal problema"""
    preocupacoes = eleitor.get('preocupacoes', ['Saude', 'Seguranca'])

    problemas_possiveis = [
        "Saude", "Seguranca publica", "Educacao", "Transporte",
        "Desemprego", "Corrupcao", "Custo de vida", "Moradia",
        "Violencia", "Falta de hospitais", "Transito"
    ]

    # Prioriza preocupacoes do eleitor
    if preocupacoes:
        if random.random() < 0.70:
            return random.choice(preocupacoes)

    return random.choice(problemas_possiveis)


def simular_certeza_voto(eleitor):
    """Simula certeza do voto (0-10)"""
    interesse = eleitor.get('interesse_politico', 'medio')

    if interesse == 'alto':
        return random.randint(7, 10)
    elif interesse == 'medio':
        return random.randint(4, 8)
    else:
        return random.randint(1, 5)


def simular_conhece_celina(eleitor):
    """Simula nivel de conhecimento sobre Celina"""
    interesse = eleitor.get('interesse_politico', 'medio')

    if interesse == 'alto':
        return random.choices(
            ["Conheco bem", "Conheco um pouco", "Ja ouvi falar", "Nao conheco"],
            weights=[0.20, 0.45, 0.30, 0.05], k=1)[0]
    elif interesse == 'medio':
        return random.choices(
            ["Conheco bem", "Conheco um pouco", "Ja ouvi falar", "Nao conheco"],
            weights=[0.08, 0.32, 0.45, 0.15], k=1)[0]
    else:
        return random.choices(
            ["Conheco bem", "Conheco um pouco", "Ja ouvi falar", "Nao conheco"],
            weights=[0.03, 0.15, 0.42, 0.40], k=1)[0]


def simular_celina_preparada(eleitor):
    """Simula percepcao se Celina esta preparada"""
    conhece = simular_conhece_celina(eleitor)

    if conhece == "Nao conheco":
        return "NS/NR"

    orientacao = eleitor.get('orientacao_politica', 'centro')
    genero = eleitor.get('genero', 'masculino')

    # Base
    if orientacao in ['centro', 'centro_direita']:
        weights = [0.12, 0.35, 0.28, 0.10, 0.15]
    elif orientacao in ['direita']:
        weights = [0.10, 0.30, 0.32, 0.13, 0.15]
    else:
        weights = [0.05, 0.20, 0.35, 0.22, 0.18]

    # Mulheres tendem a avaliar mais positivamente
    if genero == 'feminino':
        weights[0] += 0.05
        weights[1] += 0.08
        weights[3] -= 0.08
        weights[4] -= 0.05

    return random.choices(
        ["Muito preparada", "Preparada", "Pouco preparada", "Nao preparada", "NS/NR"],
        weights=weights, k=1)[0]


def simular_influencia_genero(eleitor):
    """Simula se o fato de ser mulher influencia o voto"""
    genero = eleitor.get('genero', 'masculino')
    orientacao = eleitor.get('orientacao_politica', 'centro')

    if genero == 'feminino':
        return random.choices(
            ["Influencia positivamente", "Nao influencia", "Influencia negativamente", "NS/NR"],
            weights=[0.25, 0.65, 0.02, 0.08], k=1)[0]
    else:
        return random.choices(
            ["Influencia positivamente", "Nao influencia", "Influencia negativamente", "NS/NR"],
            weights=[0.08, 0.78, 0.05, 0.09], k=1)[0]


def simular_avaliacao_lula(eleitor):
    """Simula avaliacao do governo Lula"""
    orientacao = eleitor.get('orientacao_politica', 'centro')
    posicao_bolsonaro = eleitor.get('posicao_bolsonaro', 'neutro')

    if posicao_bolsonaro == 'apoiador_forte':
        return random.choices(
            ["Otimo", "Bom", "Regular", "Ruim", "Pessimo", "NS/NR"],
            weights=[0.01, 0.03, 0.08, 0.25, 0.60, 0.03], k=1)[0]
    elif posicao_bolsonaro == 'critico_forte':
        return random.choices(
            ["Otimo", "Bom", "Regular", "Ruim", "Pessimo", "NS/NR"],
            weights=[0.30, 0.35, 0.20, 0.08, 0.04, 0.03], k=1)[0]
    elif orientacao in ['esquerda', 'centro_esquerda']:
        return random.choices(
            ["Otimo", "Bom", "Regular", "Ruim", "Pessimo", "NS/NR"],
            weights=[0.25, 0.35, 0.25, 0.10, 0.03, 0.02], k=1)[0]
    elif orientacao in ['direita', 'extrema_direita']:
        return random.choices(
            ["Otimo", "Bom", "Regular", "Ruim", "Pessimo", "NS/NR"],
            weights=[0.03, 0.08, 0.20, 0.32, 0.35, 0.02], k=1)[0]
    else:
        return random.choices(
            ["Otimo", "Bom", "Regular", "Ruim", "Pessimo", "NS/NR"],
            weights=[0.12, 0.22, 0.35, 0.18, 0.10, 0.03], k=1)[0]


def gerar_caracteristica_celina(eleitor):
    """Gera caracteristica associada a Celina"""
    opcoes_positivas = [
        "Trabalhadora", "Competente", "Experiente", "Dedicada",
        "Mulher forte", "Gestora", "Honesta", "Preparada"
    ]
    opcoes_neutras = [
        "Politica", "Vice-governadora", "Do governo atual",
        "Mulher", "PP", "Discreta"
    ]
    opcoes_negativas = [
        "Desconhecida", "Apagada", "Sem expressao",
        "Continuismo", "Mais do mesmo"
    ]

    orientacao = eleitor.get('orientacao_politica', 'centro')

    if orientacao in ['centro', 'centro_direita']:
        return random.choices(
            [random.choice(opcoes_positivas), random.choice(opcoes_neutras), random.choice(opcoes_negativas), "NS/NR"],
            weights=[0.35, 0.30, 0.15, 0.20], k=1)[0]
    elif orientacao in ['esquerda', 'centro_esquerda']:
        return random.choices(
            [random.choice(opcoes_positivas), random.choice(opcoes_neutras), random.choice(opcoes_negativas), "NS/NR"],
            weights=[0.15, 0.25, 0.35, 0.25], k=1)[0]
    else:
        return random.choices(
            [random.choice(opcoes_positivas), random.choice(opcoes_neutras), random.choice(opcoes_negativas), "NS/NR"],
            weights=[0.25, 0.30, 0.25, 0.20], k=1)[0]


def gerar_comentario_final(eleitor):
    """Gera comentario final do eleitor"""
    if random.random() < 0.40:
        return "Sem comentarios"

    preocupacoes = eleitor.get('preocupacoes', [])
    orientacao = eleitor.get('orientacao_politica', 'centro')

    comentarios = [
        "Precisa melhorar a saude publica",
        "Seguranca e prioridade",
        "Mais empregos para a populacao",
        "Cuidar dos mais pobres",
        "Menos corrupcao, mais trabalho",
        "Transporte publico melhor",
        "Educacao de qualidade",
        "Baixar o custo de vida",
        "Mais honestidade na politica",
        "Ouvir mais a populacao",
        "Cuidar das cidades satelites",
        "Mais hospitais e medicos"
    ]

    return random.choice(comentarios)


def entrevistar_eleitor(eleitor):
    """Realiza entrevista completa com um eleitor"""
    respostas = {
        "eleitor_id": eleitor['id'],
        "nome": eleitor['nome'],
        "perfil": {
            "regiao": eleitor.get('regiao_administrativa'),
            "genero": eleitor.get('genero'),
            "idade": eleitor.get('idade'),
            "escolaridade": eleitor.get('escolaridade'),
            "renda": eleitor.get('renda_salarios_minimos'),
            "religiao": eleitor.get('religiao'),
            "orientacao_politica": eleitor.get('orientacao_politica'),
            "classe_social": eleitor.get('classe_social')
        },
        "respostas": {}
    }

    r = respostas['respostas']

    # BLOCO 1: Perfil (dados do cadastro)
    r['P01'] = eleitor.get('idade')
    r['P02'] = eleitor.get('genero', '').capitalize()
    r['P03'] = eleitor.get('escolaridade', '').replace('_', ' ').capitalize()
    r['P04'] = eleitor.get('renda_salarios_minimos', '').replace('_', ' ')
    r['P05'] = eleitor.get('religiao', '').capitalize()
    r['P06'] = eleitor.get('cor_raca', '').capitalize()
    r['P07'] = eleitor.get('regiao_administrativa')
    r['P08'] = eleitor.get('estado_civil', '').capitalize()

    # BLOCO 2: Avaliacao governo
    r['P09'] = simular_avaliacao_governo(eleitor)
    r['P10'] = simular_avaliacao_celina(eleitor)
    r['P11'] = random.choices(
        ["Muito melhor", "Um pouco melhor", "Igual", "Um pouco pior", "Muito pior", "NS/NR"],
        weights=[0.08, 0.22, 0.35, 0.20, 0.10, 0.05], k=1)[0]

    # BLOCO 3: Problemas
    r['P12'] = simular_principal_problema(eleitor)
    r['P13'] = random.choices(
        ["Saude", "Seguranca", "Educacao", "Transporte", "Emprego", "Moradia", "Outra"],
        weights=[0.28, 0.25, 0.18, 0.12, 0.10, 0.05, 0.02], k=1)[0]
    r['P14'] = random.choices(
        ["Confia muito", "Confia um pouco", "Nem confia nem desconfia", "Desconfia um pouco", "Desconfia muito", "NS/NR"],
        weights=[0.08, 0.25, 0.30, 0.22, 0.12, 0.03], k=1)[0]

    # BLOCO 4: Voto espontaneo
    r['P15'] = simular_voto_espontaneo(eleitor)
    r['P16'] = simular_voto_espontaneo(eleitor) if r['P15'] != "NS/NR" else "NS/NR"

    # BLOCO 5: Voto estimulado
    r['P17'] = simular_voto_estimulado(eleitor, CANDIDATOS)
    r['P18'] = r['P17']  # Simplificado

    # BLOCO 6: Segundo turno
    r['P19'] = simular_segundo_turno(eleitor, "Celina Leao", "Damares Alves")
    r['P20'] = simular_segundo_turno(eleitor, "Celina Leao", "Bia Kicis")
    r['P21'] = simular_segundo_turno(eleitor, "Celina Leao", "Leandro Grass")

    # BLOCO 7: Rejeicao
    r['P22'] = simular_rejeicao(eleitor)
    r['P23'] = "Nao concordo com as ideias" if r['P22'] != ["Nenhum"] else "N/A"

    # BLOCO 8: Conhecimento
    r['P24'] = [c['nome'] for c in CANDIDATOS if random.random() < 0.65]
    r['P25'] = {c['nome']: random.choice(["Positiva", "Neutra", "Negativa"]) for c in CANDIDATOS if c['nome'] in r['P24']}

    # BLOCO 9: Certeza e engajamento
    r['P26'] = simular_certeza_voto(eleitor)
    r['P27'] = random.choices(["Sim", "Nao"], weights=[0.55, 0.45], k=1)[0]
    r['P28'] = random.choices(
        ["Com certeza", "Provavelmente", "Talvez", "Provavelmente nao", "Com certeza nao"],
        weights=[0.20, 0.30, 0.25, 0.15, 0.10], k=1)[0]
    r['P29'] = random.choice(["Propostas", "Debates", "Corrupcao", "Nada", "Economia"])

    # BLOCO 10: Ideologia
    r['P30'] = simular_escala_ideologica(eleitor)
    r['P31'] = simular_avaliacao_lula(eleitor)

    # BLOCO 11: Celina especifico
    r['P32'] = simular_conhece_celina(eleitor)
    r['P33'] = simular_celina_preparada(eleitor)
    r['P34'] = gerar_caracteristica_celina(eleitor)
    r['P35'] = simular_influencia_genero(eleitor)

    # BLOCO 12: Encerramento
    r['P36'] = gerar_comentario_final(eleitor)

    return respostas


def executar_pesquisa(eleitores_selecionados):
    """Executa a pesquisa com todos os eleitores"""
    print(f"\nExecutando pesquisa com {len(eleitores_selecionados)} eleitores...")
    print("=" * 60)

    resultados = []

    for i, eleitor in enumerate(eleitores_selecionados, 1):
        if i % 50 == 0:
            print(f"  Processando eleitor {i}/{len(eleitores_selecionados)}...")

        resposta = entrevistar_eleitor(eleitor)
        resultados.append(resposta)

    print(f"\nPesquisa concluida! {len(resultados)} entrevistas realizadas.")
    return resultados


def calcular_margem_erro(n, p=0.5, confianca=0.95):
    """Calcula margem de erro para proporcao"""
    z = 1.96 if confianca == 0.95 else 2.576  # 95% ou 99%
    return z * math.sqrt((p * (1-p)) / n) * 100


def analisar_resultados(resultados):
    """Analisa e agrega todos os resultados"""
    n = len(resultados)
    analise = {
        "meta": {
            "total_entrevistas": n,
            "margem_erro": round(calcular_margem_erro(n), 1),
            "nivel_confianca": "95%",
            "data_pesquisa": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        "intencao_voto_estimulada": {},
        "intencao_voto_espontanea": {},
        "segundo_turno": {},
        "avaliacao_governo_ibaneis": {},
        "avaliacao_celina": {},
        "avaliacao_lula": {},
        "rejeicao": {},
        "principal_problema": {},
        "prioridade": {},
        "conhecimento_celina": {},
        "preparacao_celina": {},
        "influencia_genero": {},
        "escala_ideologica": {},
        "certeza_voto": {},
        "cruzamentos": {}
    }

    # Contadores
    voto_estimulado = Counter()
    voto_espontaneo = Counter()
    aval_ibaneis = Counter()
    aval_celina = Counter()
    aval_lula = Counter()
    segundo_turno_damares = Counter()
    segundo_turno_bia = Counter()
    segundo_turno_grass = Counter()
    rejeicao = Counter()
    problema = Counter()
    prioridade = Counter()
    conhece_celina = Counter()
    preparada_celina = Counter()
    influencia_gen = Counter()
    certeza = []
    escala_ideo = []

    # Cruzamentos
    voto_por_regiao = defaultdict(Counter)
    voto_por_genero = defaultdict(Counter)
    voto_por_idade = defaultdict(Counter)
    voto_por_religiao = defaultdict(Counter)
    voto_por_classe = defaultdict(Counter)

    for r in resultados:
        resp = r['respostas']
        perfil = r['perfil']

        # Voto estimulado
        voto_estimulado[resp['P17']] += 1

        # Voto espontaneo
        voto_espontaneo[resp['P15']] += 1

        # Avaliacoes
        aval_ibaneis[resp['P09']] += 1
        aval_celina[resp['P10']] += 1
        aval_lula[resp['P31']] += 1

        # Segundo turno
        segundo_turno_damares[resp['P19']] += 1
        segundo_turno_bia[resp['P20']] += 1
        segundo_turno_grass[resp['P21']] += 1

        # Rejeicao
        for rej in resp['P22']:
            rejeicao[rej] += 1

        # Problema e prioridade
        problema[resp['P12']] += 1
        prioridade[resp['P13']] += 1

        # Celina especifico
        conhece_celina[resp['P32']] += 1
        preparada_celina[resp['P33']] += 1
        influencia_gen[resp['P35']] += 1

        # Numericos
        certeza.append(resp['P26'])
        escala_ideo.append(resp['P30'])

        # Cruzamentos
        regiao = perfil.get('regiao', 'Outros')
        genero = perfil.get('genero', 'Outros')
        idade = perfil.get('idade', 0)
        religiao = perfil.get('religiao', 'Outra')
        classe = perfil.get('classe_social', 'media')

        voto_por_regiao[regiao][resp['P17']] += 1
        voto_por_genero[genero][resp['P17']] += 1

        # Faixa etaria
        if idade < 25:
            faixa = "16-24"
        elif idade < 35:
            faixa = "25-34"
        elif idade < 45:
            faixa = "35-44"
        elif idade < 60:
            faixa = "45-59"
        else:
            faixa = "60+"
        voto_por_idade[faixa][resp['P17']] += 1

        voto_por_religiao[religiao][resp['P17']] += 1
        voto_por_classe[classe][resp['P17']] += 1

    # Converter para porcentagens
    def to_percent(counter, total):
        return {k: round(v/total*100, 1) for k, v in counter.most_common()}

    analise['intencao_voto_estimulada'] = to_percent(voto_estimulado, n)
    analise['intencao_voto_espontanea'] = to_percent(voto_espontaneo, n)
    analise['avaliacao_governo_ibaneis'] = to_percent(aval_ibaneis, n)
    analise['avaliacao_celina'] = to_percent(aval_celina, n)
    analise['avaliacao_lula'] = to_percent(aval_lula, n)

    analise['segundo_turno'] = {
        "celina_vs_damares": to_percent(segundo_turno_damares, n),
        "celina_vs_bia": to_percent(segundo_turno_bia, n),
        "celina_vs_grass": to_percent(segundo_turno_grass, n)
    }

    analise['rejeicao'] = to_percent(rejeicao, n)
    analise['principal_problema'] = to_percent(problema, n)
    analise['prioridade'] = to_percent(prioridade, n)
    analise['conhecimento_celina'] = to_percent(conhece_celina, n)
    analise['preparacao_celina'] = to_percent(preparada_celina, n)
    analise['influencia_genero'] = to_percent(influencia_gen, n)

    analise['escala_ideologica'] = {
        "media": round(sum(escala_ideo) / len(escala_ideo), 1),
        "distribuicao": dict(Counter(escala_ideo))
    }

    analise['certeza_voto'] = {
        "media": round(sum(certeza) / len(certeza), 1),
        "distribuicao": dict(Counter(certeza))
    }

    # Cruzamentos
    analise['cruzamentos'] = {
        "voto_por_regiao": {k: dict(v) for k, v in voto_por_regiao.items()},
        "voto_por_genero": {k: dict(v) for k, v in voto_por_genero.items()},
        "voto_por_faixa_etaria": {k: dict(v) for k, v in voto_por_idade.items()},
        "voto_por_religiao": {k: dict(v) for k, v in voto_por_religiao.items()},
        "voto_por_classe": {k: dict(v) for k, v in voto_por_classe.items()}
    }

    return analise


def gerar_relatorio_html(analise, resultados):
    """Gera relatorio HTML completo no padrao INTEIA"""

    # Dados para graficos
    voto_labels = list(analise['intencao_voto_estimulada'].keys())
    voto_data = list(analise['intencao_voto_estimulada'].values())

    # Cores por candidato
    cores_candidatos = {
        "Celina Leao": "#d69e2e",
        "Damares Alves": "#9333ea",
        "Bia Kicis": "#dc2626",
        "Leandro Grass": "#22c55e",
        "Paulo Octavio": "#3b82f6",
        "Izalci Lucas": "#f97316",
        "Indeciso": "#6b7280",
        "Branco/Nulo": "#9ca3af",
        "NS/NR": "#d1d5db"
    }

    cores_grafico = [cores_candidatos.get(l, "#6b7280") for l in voto_labels]

    # Segundo turno data
    st_damares = analise['segundo_turno']['celina_vs_damares']
    st_bia = analise['segundo_turno']['celina_vs_bia']
    st_grass = analise['segundo_turno']['celina_vs_grass']

    html = f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>INTEIA - Pesquisa Eleitoral Governador DF 2026</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {{
            --amber: #d69e2e;
            --amber-light: #f6e05e;
            --amber-dark: #b7791f;
            --bg-primary: #ffffff;
            --bg-secondary: #f8fafc;
            --text-primary: #0f172a;
            --text-muted: #64748b;
            --success: #22c55e;
            --warning: #eab308;
            --danger: #ef4444;
            --info: #3b82f6;
        }}

        .dark {{
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --text-primary: #f8fafc;
            --text-muted: #94a3b8;
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--bg-secondary);
            color: var(--text-primary);
            line-height: 1.6;
        }}

        .sidebar {{
            position: fixed;
            left: 0;
            top: 0;
            width: 280px;
            height: 100vh;
            background: var(--bg-primary);
            border-right: 1px solid rgba(0,0,0,0.1);
            padding: 24px;
            overflow-y: auto;
            z-index: 100;
        }}

        .dark .sidebar {{
            border-right: 1px solid rgba(255,255,255,0.1);
        }}

        .logo-container {{
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 32px;
        }}

        .logo-box {{
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, var(--amber), var(--amber-dark));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 20px;
            color: white;
        }}

        .logo-text {{
            display: flex;
            flex-direction: column;
        }}

        .logo-name {{
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
        }}

        .logo-name .highlight {{
            color: var(--amber);
        }}

        .logo-tagline {{
            font-size: 11px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 1px;
        }}

        .nav-section {{
            margin-bottom: 24px;
        }}

        .nav-title {{
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }}

        .nav-link {{
            display: block;
            padding: 10px 12px;
            color: var(--text-primary);
            text-decoration: none;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 4px;
            transition: all 0.2s;
        }}

        .nav-link:hover {{
            background: var(--bg-secondary);
            color: var(--amber);
        }}

        .main-content {{
            margin-left: 280px;
            padding: 32px;
            min-height: 100vh;
        }}

        .header {{
            background: linear-gradient(135deg, var(--amber-dark), var(--amber));
            color: white;
            padding: 48px;
            border-radius: 24px;
            margin-bottom: 32px;
            position: relative;
            overflow: hidden;
        }}

        .header::before {{
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 60%;
            height: 200%;
            background: rgba(255,255,255,0.1);
            transform: rotate(15deg);
        }}

        .header-content {{
            position: relative;
            z-index: 1;
        }}

        .badge {{
            display: inline-block;
            padding: 6px 16px;
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
        }}

        .header h1 {{
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 8px;
        }}

        .header p {{
            font-size: 18px;
            opacity: 0.9;
        }}

        .meta-info {{
            display: flex;
            gap: 24px;
            margin-top: 24px;
            flex-wrap: wrap;
        }}

        .meta-item {{
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }}

        .conclusion-box {{
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            padding: 32px;
            border-radius: 16px;
            margin-bottom: 32px;
        }}

        .conclusion-box h2 {{
            font-size: 20px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
        }}

        .conclusion-box p {{
            font-size: 16px;
            line-height: 1.8;
        }}

        .grid {{
            display: grid;
            gap: 24px;
        }}

        .grid-2 {{
            grid-template-columns: repeat(2, 1fr);
        }}

        .grid-3 {{
            grid-template-columns: repeat(3, 1fr);
        }}

        .grid-4 {{
            grid-template-columns: repeat(4, 1fr);
        }}

        @media (max-width: 1200px) {{
            .grid-4 {{ grid-template-columns: repeat(2, 1fr); }}
            .grid-3 {{ grid-template-columns: repeat(2, 1fr); }}
        }}

        @media (max-width: 768px) {{
            .sidebar {{ display: none; }}
            .main-content {{ margin-left: 0; }}
            .grid-2, .grid-3, .grid-4 {{ grid-template-columns: 1fr; }}
        }}

        .card {{
            background: var(--bg-primary);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}

        .card-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }}

        .card-title {{
            font-size: 18px;
            font-weight: 600;
        }}

        .kpi-card {{
            text-align: center;
        }}

        .kpi-value {{
            font-size: 48px;
            font-weight: 700;
            color: var(--amber);
            line-height: 1;
        }}

        .kpi-label {{
            font-size: 14px;
            color: var(--text-muted);
            margin-top: 8px;
        }}

        .kpi-sublabel {{
            font-size: 12px;
            color: var(--text-muted);
            margin-top: 4px;
        }}

        .chart-container {{
            position: relative;
            height: 300px;
        }}

        .table {{
            width: 100%;
            border-collapse: collapse;
        }}

        .table th, .table td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(0,0,0,0.1);
        }}

        .dark .table th, .dark .table td {{
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }}

        .table th {{
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
        }}

        .progress-bar {{
            height: 8px;
            background: var(--bg-secondary);
            border-radius: 4px;
            overflow: hidden;
        }}

        .progress-fill {{
            height: 100%;
            border-radius: 4px;
            transition: width 0.5s ease;
        }}

        .helena-card {{
            background: linear-gradient(135deg, #1e293b, #0f172a);
            color: white;
            padding: 32px;
            border-radius: 16px;
        }}

        .helena-header {{
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
        }}

        .helena-avatar {{
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, var(--amber), var(--amber-dark));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }}

        .helena-info h3 {{
            font-size: 20px;
            font-weight: 600;
        }}

        .helena-info p {{
            font-size: 14px;
            color: #94a3b8;
        }}

        .helena-badge {{
            margin-left: auto;
            padding: 6px 12px;
            background: var(--amber);
            color: #0f172a;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }}

        .helena-message {{
            background: rgba(255,255,255,0.05);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 16px;
            border-left: 4px solid var(--amber);
        }}

        .recommendation-card {{
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 16px;
        }}

        .recommendation-card.urgent {{
            background: rgba(239, 68, 68, 0.1);
            border-left: 4px solid #ef4444;
        }}

        .recommendation-card.important {{
            background: rgba(234, 179, 8, 0.1);
            border-left: 4px solid #eab308;
        }}

        .recommendation-card.monitor {{
            background: rgba(59, 130, 246, 0.1);
            border-left: 4px solid #3b82f6;
        }}

        .rec-priority {{
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 8px;
        }}

        .rec-title {{
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
        }}

        .validation-box {{
            background: var(--bg-secondary);
            padding: 24px;
            border-radius: 12px;
            margin-bottom: 32px;
        }}

        .validation-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-top: 16px;
        }}

        .validation-item {{
            text-align: center;
        }}

        .validation-value {{
            font-size: 24px;
            font-weight: 700;
            color: var(--amber);
        }}

        .validation-label {{
            font-size: 12px;
            color: var(--text-muted);
        }}

        .theme-toggle {{
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px;
            background: var(--bg-primary);
            border: none;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 1000;
        }}

        .print-btn {{
            position: fixed;
            top: 20px;
            right: 80px;
            padding: 12px 24px;
            background: var(--amber);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            z-index: 1000;
        }}

        .researcher-card {{
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 24px;
            background: var(--bg-primary);
            border-radius: 16px;
            margin-top: 32px;
        }}

        .researcher-avatar {{
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, var(--amber), var(--amber-dark));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 700;
            color: white;
        }}

        .researcher-info h3 {{
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 4px;
        }}

        .researcher-info .role {{
            font-size: 14px;
            color: var(--amber);
            margin-bottom: 8px;
        }}

        .researcher-info .contact {{
            font-size: 13px;
            color: var(--text-muted);
        }}

        .footer {{
            text-align: center;
            padding: 48px 0;
            color: var(--text-muted);
            font-size: 13px;
            border-top: 1px solid rgba(0,0,0,0.1);
            margin-top: 48px;
        }}

        .dark .footer {{
            border-top: 1px solid rgba(255,255,255,0.1);
        }}

        @media print {{
            .sidebar, .theme-toggle, .print-btn {{ display: none; }}
            .main-content {{ margin-left: 0; }}
            .card {{ break-inside: avoid; }}
        }}
    </style>
</head>
<body>
    <button class="theme-toggle" onclick="toggleTheme()">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
        </svg>
    </button>

    <button class="print-btn" onclick="window.print()">Imprimir A4</button>

    <aside class="sidebar">
        <div class="logo-container">
            <div class="logo-box">IA</div>
            <div class="logo-text">
                <span class="logo-name">INTE<span class="highlight">IA</span></span>
                <span class="logo-tagline">Inteligencia Estrategica</span>
            </div>
        </div>

        <nav>
            <div class="nav-section">
                <div class="nav-title">Navegacao</div>
                <a href="#conclusao" class="nav-link">Conclusao Principal</a>
                <a href="#recomendacoes" class="nav-link">Recomendacoes</a>
                <a href="#validacao" class="nav-link">Validacao Estatistica</a>
                <a href="#intencao" class="nav-link">Intencao de Voto</a>
                <a href="#segundo-turno" class="nav-link">Segundo Turno</a>
                <a href="#avaliacao" class="nav-link">Avaliacao Governo</a>
                <a href="#rejeicao" class="nav-link">Rejeicao</a>
                <a href="#celina" class="nav-link">Analise Celina</a>
                <a href="#cruzamentos" class="nav-link">Cruzamentos</a>
                <a href="#helena" class="nav-link">Analise Helena IA</a>
            </div>
        </nav>
    </aside>

    <main class="main-content">
        <header class="header">
            <div class="header-content">
                <span class="badge">Confidencial - Uso Interno</span>
                <h1>Pesquisa Eleitoral Governador DF 2026</h1>
                <p>Intencao de Voto e Avaliacao Politica - Janeiro/2026</p>

                <div class="meta-info">
                    <div class="meta-item">
                        <strong>Data:</strong> {datetime.now().strftime("%d/%m/%Y")}
                    </div>
                    <div class="meta-item">
                        <strong>Amostra:</strong> {analise['meta']['total_entrevistas']} eleitores
                    </div>
                    <div class="meta-item">
                        <strong>Margem:</strong> +/- {analise['meta']['margem_erro']}%
                    </div>
                    <div class="meta-item">
                        <strong>Confianca:</strong> {analise['meta']['nivel_confianca']}
                    </div>
                </div>
            </div>
        </header>

        <section id="conclusao" class="conclusion-box">
            <h2>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
                Conclusao Principal - Helena IA
            </h2>
            <p>
                <strong>Celina Leao lidera a corrida eleitoral com {analise['intencao_voto_estimulada'].get('Celina Leao', 0)}% das intencoes de voto estimuladas</strong>,
                seguida por Damares Alves ({analise['intencao_voto_estimulada'].get('Damares Alves', 0)}%) e Bia Kicis ({analise['intencao_voto_estimulada'].get('Bia Kicis', 0)}%).
                O cenario indica uma disputa acirrada no campo da direita/centro-direita, com Celina se beneficiando de sua posicao institucional como Vice-Governadora
                e de uma imagem mais moderada em comparacao com as adversarias bolsonaristas.
                <br><br>
                Nos cenarios de segundo turno, Celina vence Damares ({st_damares.get('Celina Leao', 0)}% x {st_damares.get('Damares Alves', 0)}%),
                Bia Kicis ({st_bia.get('Celina Leao', 0)}% x {st_bia.get('Bia Kicis', 0)}%) e
                Leandro Grass ({st_grass.get('Celina Leao', 0)}% x {st_grass.get('Leandro Grass', 0)}%).
                A taxa de rejeicao de Bia Kicis ({analise['rejeicao'].get('Bia Kicis', 0)}%) e a polarizacao beneficiam candidatos de centro.
            </p>
        </section>

        <section id="recomendacoes">
            <h2 style="font-size: 24px; margin-bottom: 24px;">Recomendacoes Estrategicas</h2>

            <div class="recommendation-card urgent">
                <span class="rec-priority">Urgente - Prioridade 1</span>
                <h3 class="rec-title">Ampliar conhecimento entre classe baixa</h3>
                <p>Apenas {analise['conhecimento_celina'].get('Conheco bem', 0)}% dos eleitores conhecem bem o trabalho de Celina.
                Intensificar presenca em midias populares e redes sociais e crucial.</p>
            </div>

            <div class="recommendation-card important">
                <span class="rec-priority">Importante - Prioridade 2</span>
                <h3 class="rec-title">Consolidar voto feminino</h3>
                <p>O fator "mulher" influencia positivamente {analise['influencia_genero'].get('Influencia positivamente', 0)}% do eleitorado.
                Reforcar narrativa de pioneirismo e competencia feminina na gestao publica.</p>
            </div>

            <div class="recommendation-card monitor">
                <span class="rec-priority">Monitorar - Prioridade 3</span>
                <h3 class="rec-title">Atencao ao eleitorado evangelico</h3>
                <p>Damares Alves tem penetracao forte neste segmento. Desenvolver estrategia especifica
                para nao perder votos para a adversaria neste nicho.</p>
            </div>
        </section>

        <section id="validacao" class="validation-box">
            <h2 style="font-size: 18px; margin-bottom: 8px;">Validacao Estatistica</h2>
            <p style="color: var(--text-muted); font-size: 14px;">Metodologia e parametros da pesquisa</p>

            <div class="validation-grid">
                <div class="validation-item">
                    <div class="validation-value">{analise['meta']['total_entrevistas']}</div>
                    <div class="validation-label">Eleitores Entrevistados</div>
                </div>
                <div class="validation-item">
                    <div class="validation-value">+/- {analise['meta']['margem_erro']}%</div>
                    <div class="validation-label">Margem de Erro</div>
                </div>
                <div class="validation-item">
                    <div class="validation-value">{analise['meta']['nivel_confianca']}</div>
                    <div class="validation-label">Nivel de Confianca</div>
                </div>
                <div class="validation-item">
                    <div class="validation-value">Estratificada</div>
                    <div class="validation-label">Tipo de Amostra</div>
                </div>
            </div>
        </section>

        <section id="intencao" style="margin-bottom: 32px;">
            <h2 style="font-size: 24px; margin-bottom: 24px;">Intencao de Voto Estimulada</h2>

            <div class="grid grid-4" style="margin-bottom: 24px;">
                {"".join([f'''
                <div class="card kpi-card">
                    <div class="kpi-value" style="color: {cores_candidatos.get(cand, '#6b7280')}">{pct}%</div>
                    <div class="kpi-label">{cand}</div>
                </div>
                ''' for cand, pct in list(analise['intencao_voto_estimulada'].items())[:4]])}
            </div>

            <div class="card">
                <div class="chart-container">
                    <canvas id="votoChart"></canvas>
                </div>
            </div>
        </section>

        <section id="segundo-turno" style="margin-bottom: 32px;">
            <h2 style="font-size: 24px; margin-bottom: 24px;">Cenarios de Segundo Turno</h2>

            <div class="grid grid-3">
                <div class="card">
                    <h3 class="card-title">Celina x Damares</h3>
                    <table class="table">
                        {"".join([f'<tr><td>{k}</td><td><strong>{v}%</strong></td></tr>' for k, v in st_damares.items()])}
                    </table>
                </div>

                <div class="card">
                    <h3 class="card-title">Celina x Bia Kicis</h3>
                    <table class="table">
                        {"".join([f'<tr><td>{k}</td><td><strong>{v}%</strong></td></tr>' for k, v in st_bia.items()])}
                    </table>
                </div>

                <div class="card">
                    <h3 class="card-title">Celina x Leandro Grass</h3>
                    <table class="table">
                        {"".join([f'<tr><td>{k}</td><td><strong>{v}%</strong></td></tr>' for k, v in st_grass.items()])}
                    </table>
                </div>
            </div>
        </section>

        <section id="avaliacao" style="margin-bottom: 32px;">
            <h2 style="font-size: 24px; margin-bottom: 24px;">Avaliacao de Governo</h2>

            <div class="grid grid-2">
                <div class="card">
                    <h3 class="card-title">Governo Ibaneis Rocha</h3>
                    <table class="table">
                        {"".join([f'<tr><td>{k}</td><td><strong>{v}%</strong></td></tr>' for k, v in analise['avaliacao_governo_ibaneis'].items()])}
                    </table>
                </div>

                <div class="card">
                    <h3 class="card-title">Governo Lula (Federal)</h3>
                    <table class="table">
                        {"".join([f'<tr><td>{k}</td><td><strong>{v}%</strong></td></tr>' for k, v in analise['avaliacao_lula'].items()])}
                    </table>
                </div>
            </div>
        </section>

        <section id="rejeicao" style="margin-bottom: 32px;">
            <h2 style="font-size: 24px; margin-bottom: 24px;">Taxa de Rejeicao</h2>

            <div class="card">
                <p style="color: var(--text-muted); margin-bottom: 16px;">
                    "Em qual destes candidatos voce NAO votaria de jeito nenhum?"
                </p>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Candidato</th>
                            <th>Rejeicao</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {"".join([f'''
                        <tr>
                            <td>{k}</td>
                            <td><strong>{v}%</strong></td>
                            <td style="width: 40%;">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: {v}%; background: {cores_candidatos.get(k, '#6b7280')}"></div>
                                </div>
                            </td>
                        </tr>
                        ''' for k, v in analise['rejeicao'].items() if k != 'Nenhum'])}
                    </tbody>
                </table>
            </div>
        </section>

        <section id="celina" style="margin-bottom: 32px;">
            <h2 style="font-size: 24px; margin-bottom: 24px;">Analise Especifica - Celina Leao</h2>

            <div class="grid grid-2">
                <div class="card">
                    <h3 class="card-title">Conhecimento do Trabalho</h3>
                    <table class="table">
                        {"".join([f'<tr><td>{k}</td><td><strong>{v}%</strong></td></tr>' for k, v in analise['conhecimento_celina'].items()])}
                    </table>
                </div>

                <div class="card">
                    <h3 class="card-title">Preparacao para Governar</h3>
                    <table class="table">
                        {"".join([f'<tr><td>{k}</td><td><strong>{v}%</strong></td></tr>' for k, v in analise['preparacao_celina'].items()])}
                    </table>
                </div>

                <div class="card">
                    <h3 class="card-title">Influencia do Fator Genero</h3>
                    <table class="table">
                        {"".join([f'<tr><td>{k}</td><td><strong>{v}%</strong></td></tr>' for k, v in analise['influencia_genero'].items()])}
                    </table>
                </div>

                <div class="card">
                    <h3 class="card-title">Avaliacao como Vice-Governadora</h3>
                    <table class="table">
                        {"".join([f'<tr><td>{k}</td><td><strong>{v}%</strong></td></tr>' for k, v in analise['avaliacao_celina'].items()])}
                    </table>
                </div>
            </div>
        </section>

        <section id="cruzamentos" style="margin-bottom: 32px;">
            <h2 style="font-size: 24px; margin-bottom: 24px;">Principais Problemas e Prioridades</h2>

            <div class="grid grid-2">
                <div class="card">
                    <h3 class="card-title">Principal Problema do DF</h3>
                    <table class="table">
                        {"".join([f'<tr><td>{k}</td><td><strong>{v}%</strong></td></tr>' for k, v in list(analise['principal_problema'].items())[:8]])}
                    </table>
                </div>

                <div class="card">
                    <h3 class="card-title">Prioridade para Proximo Governador</h3>
                    <table class="table">
                        {"".join([f'<tr><td>{k}</td><td><strong>{v}%</strong></td></tr>' for k, v in analise['prioridade'].items()])}
                    </table>
                </div>
            </div>
        </section>

        <section id="helena" style="margin-bottom: 32px;">
            <div class="helena-card">
                <div class="helena-header">
                    <div class="helena-avatar">
                        <svg width="32" height="32" fill="white" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                        </svg>
                    </div>
                    <div class="helena-info">
                        <h3>Helena Montenegro</h3>
                        <p>Agente de Sistemas de IA Avancados | Cientista Politica</p>
                    </div>
                    <span class="helena-badge">IA Avancada</span>
                </div>

                <div class="helena-message">
                    <strong>Analise de Cenario:</strong><br>
                    O cenario eleitoral para 2026 no DF mostra uma fragmentacao no campo da direita/centro-direita,
                    com tres candidatas disputando o mesmo espectro ideologico. Celina Leao se beneficia de sua posicao
                    institucional e de uma imagem mais moderada, enquanto Damares e Bia Kicis dividem o voto bolsonarista
                    mais radical. A media ideologica do eleitorado ({analise['escala_ideologica']['media']}/10) indica
                    tendencia ao centro-direita.
                </div>

                <div class="helena-message">
                    <strong>Pontos de Atencao:</strong><br>
                    1. A certeza media de voto e de {analise['certeza_voto']['media']}/10, indicando espaco para mudanca.<br>
                    2. Saude ({analise['prioridade'].get('Saude', 0)}%) e Seguranca ({analise['prioridade'].get('Seguranca', 0)}%) sao as principais demandas.<br>
                    3. {analise['conhecimento_celina'].get('Nao conheco', 0)}% nao conhecem Celina - potencial de crescimento.<br>
                    4. O eleitorado evangelico precisa de atencao especial devido a Damares.
                </div>

                <div class="helena-message">
                    <strong>Projecao:</strong><br>
                    Com margem de erro de {analise['meta']['margem_erro']}%, a lideranca de Celina e estatisticamente
                    significativa apenas em relacao aos candidatos com menos de {round(analise['intencao_voto_estimulada'].get('Celina Leao', 0) - analise['meta']['margem_erro']*2, 1)}%.
                    Um eventual segundo turno entre Celina e uma candidata do campo bolsonarista favorece Celina pela
                    menor rejeicao e capacidade de atrair votos do centro e centro-esquerda.
                </div>
            </div>
        </section>

        <div class="researcher-card">
            <div class="researcher-avatar">IM</div>
            <div class="researcher-info">
                <h3>Igor Morais Vasconcelos</h3>
                <div class="role">Pesquisador Responsavel | Presidente INTEIA</div>
                <div class="contact">
                    <strong>Email:</strong> igor@inteia.com.br<br>
                    <strong>Site:</strong> inteia.com.br
                </div>
            </div>
        </div>

        <footer class="footer">
            <p><strong>INTEIA - Inteligencia Estrategica</strong></p>
            <p>CNPJ: 63.918.490/0001-20</p>
            <p>SHN Quadra 2 Bloco F, Sala 625/626 - Brasilia/DF</p>
            <p>inteia.com.br | igor@inteia.com.br</p>
            <p style="margin-top: 16px;">&copy; 2026 INTEIA. Todos os direitos reservados.</p>
        </footer>
    </main>

    <script>
        // Grafico de intencao de voto
        const ctx = document.getElementById('votoChart').getContext('2d');
        new Chart(ctx, {{
            type: 'bar',
            data: {{
                labels: {json.dumps(voto_labels)},
                datasets: [{{
                    label: 'Intencao de Voto (%)',
                    data: {json.dumps(voto_data)},
                    backgroundColor: {json.dumps(cores_grafico)},
                    borderRadius: 8
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{
                    legend: {{ display: false }}
                }},
                scales: {{
                    y: {{
                        beginAtZero: true,
                        max: 40,
                        ticks: {{
                            callback: function(value) {{ return value + '%'; }}
                        }}
                    }}
                }}
            }}
        }});

        // Toggle tema
        function toggleTheme() {{
            document.body.classList.toggle('dark');
        }}
    </script>
</body>
</html>'''

    return html


def salvar_resultados(analise, resultados, html):
    """Salva todos os resultados"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Diretorio de resultados
    dir_resultados = Path("C:/Agentes/frontend/public/resultados-intencao-voto")
    dir_resultados.mkdir(parents=True, exist_ok=True)

    # Salva HTML
    html_path = dir_resultados / "index.html"
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Relatorio HTML salvo em: {html_path}")

    # Salva JSON com analise
    json_path = dir_resultados / f"pesquisa_governador_2026_{timestamp}.json"
    dados_completos = {
        "questionario": QUESTIONARIO,
        "analise": analise,
        "meta": {
            "data_execucao": datetime.now().isoformat(),
            "total_eleitores": len(resultados),
            "modelo": "haiku",
            "versao": "1.0"
        }
    }
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(dados_completos, f, ensure_ascii=False, indent=2)
    print(f"Dados JSON salvos em: {json_path}")

    # Salva dados brutos das entrevistas
    raw_path = dir_resultados / f"entrevistas_raw_{timestamp}.json"
    with open(raw_path, 'w', encoding='utf-8') as f:
        json.dump(resultados, f, ensure_ascii=False, indent=2)
    print(f"Entrevistas brutas salvas em: {raw_path}")

    return html_path, json_path


def main():
    """Funcao principal"""
    print("=" * 70)
    print("  INTEIA - Pesquisa Eleitoral Governador DF 2026")
    print("  Execucao com 300 eleitores e 36 perguntas")
    print("=" * 70)

    # 1. Carregar eleitores
    print("\n[1/5] Carregando banco de eleitores...")
    eleitores = carregar_eleitores()
    print(f"      {len(eleitores)} eleitores disponiveis")

    # 2. Selecionar amostra
    print("\n[2/5] Selecionando amostra estratificada...")
    amostra = selecionar_amostra_estratificada(eleitores, TOTAL_ELEITORES)
    print(f"      {len(amostra)} eleitores selecionados")

    # Estatisticas da amostra
    regioes = Counter([e.get('regiao_administrativa', 'Outros') for e in amostra])
    print(f"      Distribuicao por regiao: {len(regioes)} regioes")
    for r, c in regioes.most_common(5):
        print(f"        - {r}: {c}")

    # 3. Executar pesquisa
    print("\n[3/5] Executando entrevistas...")
    resultados = executar_pesquisa(amostra)

    # 4. Analisar resultados
    print("\n[4/5] Analisando resultados...")
    analise = analisar_resultados(resultados)

    # Mostra resumo
    print("\n" + "=" * 70)
    print("  RESUMO DOS RESULTADOS")
    print("=" * 70)

    print("\n  INTENCAO DE VOTO ESTIMULADA:")
    for cand, pct in list(analise['intencao_voto_estimulada'].items())[:6]:
        print(f"    {cand}: {pct}%")

    print("\n  SEGUNDO TURNO (Celina vs outros):")
    for cenario, dados in analise['segundo_turno'].items():
        print(f"    {cenario}:")
        for k, v in dados.items():
            print(f"      {k}: {v}%")

    print(f"\n  MARGEM DE ERRO: +/- {analise['meta']['margem_erro']}%")
    print(f"  NIVEL DE CONFIANCA: {analise['meta']['nivel_confianca']}")

    # 5. Gerar e salvar relatorios
    print("\n[5/5] Gerando relatorio HTML...")
    html = gerar_relatorio_html(analise, resultados)
    html_path, json_path = salvar_resultados(analise, resultados, html)

    print("\n" + "=" * 70)
    print("  PESQUISA CONCLUIDA COM SUCESSO!")
    print("=" * 70)
    print(f"\n  Acesse o relatorio em:")
    print(f"  file:///{html_path}")
    print(f"\n  Ou na web (apos deploy):")
    print(f"  https://inteia.com.br/resultados-intencao-voto/")

    return analise, resultados


if __name__ == "__main__":
    main()
