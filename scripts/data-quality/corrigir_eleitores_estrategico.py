"""
Correcao Estrategica do Banco de Eleitores - PDAD 2021/2024
Mantem validade estatistica e coerencia individual de cada perfil

Principios:
1. Cada alteracao considera dependencias entre atributos
2. Preserva a narrativa/historia do personagem quando possivel
3. Ajustes sao proporcionais e graduais
4. Validacao de coerencia apos cada mudanca
"""

import json
import random
import copy
from collections import Counter, defaultdict
from datetime import datetime

random.seed(42)  # Reproducibilidade

# =============================================================================
# DADOS OFICIAIS PDAD 2021/2024 - METAS POR RA
# =============================================================================

METAS_PDAD = {
    # GRUPO 1 - ALTA RENDA
    "Lago Sul": {
        "idade_media_alvo": 42, "idade_min": 25, "idade_max": 75,
        "cor_branca_pct": 67, "cor_parda_pct": 24, "cor_preta_pct": 9,
        "escolaridade_superior_pct": 85,
        "grupo_renda": "G1_alta",
        "renda_predominante": ["mais_de_10_ate_20", "mais_de_20"],
    },
    "Lago Norte": {
        "idade_media_alvo": 40, "idade_min": 22, "idade_max": 72,
        "cor_branca_pct": 62, "cor_parda_pct": 28, "cor_preta_pct": 10,
        "escolaridade_superior_pct": 75,
        "grupo_renda": "G1_alta",
        "renda_predominante": ["mais_de_10_ate_20", "mais_de_5_ate_10"],
    },
    "Park Way": {
        "idade_media_alvo": 42, "idade_min": 25, "idade_max": 75,
        "cor_branca_pct": 58, "cor_parda_pct": 32, "cor_preta_pct": 10,
        "escolaridade_superior_pct": 70,
        "grupo_renda": "G1_alta",
        "renda_predominante": ["mais_de_10_ate_20", "mais_de_5_ate_10"],
    },
    "Sudoeste/Octogonal": {
        "idade_media_alvo": 38, "idade_min": 22, "idade_max": 70,
        "cor_branca_pct": 55, "cor_parda_pct": 35, "cor_preta_pct": 10,
        "escolaridade_superior_pct": 72,
        "grupo_renda": "G1_alta",
        "renda_predominante": ["mais_de_10_ate_20", "mais_de_5_ate_10"],
    },
    "Plano Piloto": {
        "idade_media_alvo": 38, "idade_min": 20, "idade_max": 75,
        "cor_branca_pct": 52, "cor_parda_pct": 38, "cor_preta_pct": 10,
        "escolaridade_superior_pct": 68,
        "grupo_renda": "G1_alta",
        "renda_predominante": ["mais_de_5_ate_10", "mais_de_10_ate_20"],
    },
    "Jardim Botânico": {
        "idade_media_alvo": 40, "idade_min": 25, "idade_max": 70,
        "cor_branca_pct": 55, "cor_parda_pct": 35, "cor_preta_pct": 10,
        "escolaridade_superior_pct": 65,
        "grupo_renda": "G1_alta",
        "renda_predominante": ["mais_de_5_ate_10", "mais_de_10_ate_20"],
    },

    # GRUPO 2 - MEDIA-ALTA RENDA
    "Águas Claras": {
        "idade_media_alvo": 34, "idade_min": 20, "idade_max": 65,
        "cor_branca_pct": 45, "cor_parda_pct": 42, "cor_preta_pct": 13,
        "escolaridade_superior_pct": 55,
        "grupo_renda": "G2_media_alta",
        "renda_predominante": ["mais_de_5_ate_10", "mais_de_2_ate_5"],
    },
    "Guará": {
        "idade_media_alvo": 37, "idade_min": 20, "idade_max": 70,
        "cor_branca_pct": 42, "cor_parda_pct": 45, "cor_preta_pct": 13,
        "escolaridade_superior_pct": 45,
        "grupo_renda": "G2_media_alta",
        "renda_predominante": ["mais_de_2_ate_5", "mais_de_5_ate_10"],
    },
    "Cruzeiro": {
        "idade_media_alvo": 40, "idade_min": 22, "idade_max": 72,
        "cor_branca_pct": 45, "cor_parda_pct": 42, "cor_preta_pct": 13,
        "escolaridade_superior_pct": 52,
        "grupo_renda": "G2_media_alta",
        "renda_predominante": ["mais_de_5_ate_10", "mais_de_2_ate_5"],
    },
    "Vicente Pires": {
        "idade_media_alvo": 35, "idade_min": 20, "idade_max": 65,
        "cor_branca_pct": 40, "cor_parda_pct": 47, "cor_preta_pct": 13,
        "escolaridade_superior_pct": 48,
        "grupo_renda": "G2_media_alta",
        "renda_predominante": ["mais_de_2_ate_5", "mais_de_5_ate_10"],
    },
    "Taguatinga": {
        "idade_media_alvo": 37, "idade_min": 18, "idade_max": 72,
        "cor_branca_pct": 35, "cor_parda_pct": 50, "cor_preta_pct": 15,
        "escolaridade_superior_pct": 38,
        "grupo_renda": "G2_media_alta",
        "renda_predominante": ["mais_de_2_ate_5", "mais_de_5_ate_10"],
    },
    "Sobradinho": {
        "idade_media_alvo": 35, "idade_min": 18, "idade_max": 70,
        "cor_branca_pct": 35, "cor_parda_pct": 50, "cor_preta_pct": 15,
        "escolaridade_superior_pct": 30,
        "grupo_renda": "G2_media_alta",
        "renda_predominante": ["mais_de_2_ate_5", "mais_de_5_ate_10"],
    },
    "Arniqueira": {
        "idade_media_alvo": 35, "idade_min": 20, "idade_max": 65,
        "cor_branca_pct": 38, "cor_parda_pct": 48, "cor_preta_pct": 14,
        "escolaridade_superior_pct": 40,
        "grupo_renda": "G2_media_alta",
        "renda_predominante": ["mais_de_2_ate_5", "mais_de_5_ate_10"],
    },
    "Núcleo Bandeirante": {
        "idade_media_alvo": 38, "idade_min": 20, "idade_max": 70,
        "cor_branca_pct": 35, "cor_parda_pct": 50, "cor_preta_pct": 15,
        "escolaridade_superior_pct": 32,
        "grupo_renda": "G2_media_alta",
        "renda_predominante": ["mais_de_2_ate_5", "mais_de_5_ate_10"],
    },
    "SIA": {
        "idade_media_alvo": 38, "idade_min": 25, "idade_max": 60,
        "cor_branca_pct": 35, "cor_parda_pct": 50, "cor_preta_pct": 15,
        "escolaridade_superior_pct": 35,
        "grupo_renda": "G2_media_alta",
        "renda_predominante": ["mais_de_2_ate_5", "mais_de_5_ate_10"],
    },

    # GRUPO 3 - MEDIA-BAIXA RENDA
    "Ceilândia": {
        "idade_media_alvo": 35, "idade_min": 16, "idade_max": 75,
        "cor_branca_pct": 20, "cor_parda_pct": 50, "cor_preta_pct": 30,
        "escolaridade_superior_pct": 15,
        "grupo_renda": "G3_media_baixa",
        "renda_predominante": ["mais_de_1_ate_2", "mais_de_2_ate_5"],
    },
    "Samambaia": {
        "idade_media_alvo": 32, "idade_min": 16, "idade_max": 70,
        "cor_branca_pct": 18, "cor_parda_pct": 52, "cor_preta_pct": 30,
        "escolaridade_superior_pct": 12,
        "grupo_renda": "G3_media_baixa",
        "renda_predominante": ["mais_de_1_ate_2", "mais_de_2_ate_5"],
    },
    "Gama": {
        "idade_media_alvo": 35, "idade_min": 18, "idade_max": 72,
        "cor_branca_pct": 28, "cor_parda_pct": 52, "cor_preta_pct": 20,
        "escolaridade_superior_pct": 20,
        "grupo_renda": "G3_media_baixa",
        "renda_predominante": ["mais_de_1_ate_2", "mais_de_2_ate_5"],
    },
    "Santa Maria": {
        "idade_media_alvo": 30, "idade_min": 16, "idade_max": 68,
        "cor_branca_pct": 18, "cor_parda_pct": 54, "cor_preta_pct": 28,
        "escolaridade_superior_pct": 12,
        "grupo_renda": "G3_media_baixa",
        "renda_predominante": ["ate_1", "mais_de_1_ate_2"],
    },
    "Planaltina": {
        "idade_media_alvo": 30, "idade_min": 16, "idade_max": 70,
        "cor_branca_pct": 20, "cor_parda_pct": 55, "cor_preta_pct": 25,
        "escolaridade_superior_pct": 10,
        "grupo_renda": "G3_media_baixa",
        "renda_predominante": ["ate_1", "mais_de_1_ate_2"],
    },
    "São Sebastião": {
        "idade_media_alvo": 31, "idade_min": 16, "idade_max": 68,
        "cor_branca_pct": 20, "cor_parda_pct": 52, "cor_preta_pct": 28,
        "escolaridade_superior_pct": 14,
        "grupo_renda": "G3_media_baixa",
        "renda_predominante": ["ate_1", "mais_de_1_ate_2"],
    },
    "Sobradinho II": {
        "idade_media_alvo": 33, "idade_min": 18, "idade_max": 68,
        "cor_branca_pct": 28, "cor_parda_pct": 52, "cor_preta_pct": 20,
        "escolaridade_superior_pct": 22,
        "grupo_renda": "G3_media_baixa",
        "renda_predominante": ["mais_de_1_ate_2", "mais_de_2_ate_5"],
    },
    "Riacho Fundo": {
        "idade_media_alvo": 34, "idade_min": 18, "idade_max": 68,
        "cor_branca_pct": 28, "cor_parda_pct": 52, "cor_preta_pct": 20,
        "escolaridade_superior_pct": 22,
        "grupo_renda": "G3_media_baixa",
        "renda_predominante": ["mais_de_1_ate_2", "mais_de_2_ate_5"],
    },
    "Riacho Fundo II": {
        "idade_media_alvo": 30, "idade_min": 16, "idade_max": 65,
        "cor_branca_pct": 22, "cor_parda_pct": 55, "cor_preta_pct": 23,
        "escolaridade_superior_pct": 14,
        "grupo_renda": "G3_media_baixa",
        "renda_predominante": ["ate_1", "mais_de_1_ate_2"],
    },
    "Brazlândia": {
        "idade_media_alvo": 32, "idade_min": 16, "idade_max": 70,
        "cor_branca_pct": 31, "cor_parda_pct": 50, "cor_preta_pct": 19,
        "escolaridade_superior_pct": 12,
        "grupo_renda": "G3_media_baixa",
        "renda_predominante": ["ate_1", "mais_de_1_ate_2"],
    },
    "Paranoá": {
        "idade_media_alvo": 30, "idade_min": 16, "idade_max": 65,
        "cor_branca_pct": 18, "cor_parda_pct": 55, "cor_preta_pct": 27,
        "escolaridade_superior_pct": 12,
        "grupo_renda": "G3_media_baixa",
        "renda_predominante": ["ate_1", "mais_de_1_ate_2"],
    },
    "Candangolândia": {
        "idade_media_alvo": 35, "idade_min": 18, "idade_max": 68,
        "cor_branca_pct": 25, "cor_parda_pct": 55, "cor_preta_pct": 20,
        "escolaridade_superior_pct": 18,
        "grupo_renda": "G3_media_baixa",
        "renda_predominante": ["mais_de_1_ate_2", "mais_de_2_ate_5"],
    },

    # GRUPO 4 - BAIXA RENDA
    "Sol Nascente/Pôr do Sol": {
        "idade_media_alvo": 29, "idade_min": 16, "idade_max": 60,
        "cor_branca_pct": 30, "cor_parda_pct": 54, "cor_preta_pct": 14,
        "escolaridade_superior_pct": 6,
        "grupo_renda": "G4_baixa",
        "renda_predominante": ["ate_1", "mais_de_1_ate_2"],
    },
    "Recanto das Emas": {
        "idade_media_alvo": 29, "idade_min": 16, "idade_max": 65,
        "cor_branca_pct": 16, "cor_parda_pct": 55, "cor_preta_pct": 29,
        "escolaridade_superior_pct": 8,
        "grupo_renda": "G4_baixa",
        "renda_predominante": ["ate_1", "mais_de_1_ate_2"],
    },
    "Itapoã": {
        "idade_media_alvo": 28, "idade_min": 16, "idade_max": 60,
        "cor_branca_pct": 15, "cor_parda_pct": 55, "cor_preta_pct": 30,
        "escolaridade_superior_pct": 6,
        "grupo_renda": "G4_baixa",
        "renda_predominante": ["ate_1", "mais_de_1_ate_2"],
    },
    "SCIA/Estrutural": {
        "idade_media_alvo": 27, "idade_min": 16, "idade_max": 58,
        "cor_branca_pct": 25, "cor_parda_pct": 52, "cor_preta_pct": 23,
        "escolaridade_superior_pct": 4,
        "grupo_renda": "G4_baixa",
        "renda_predominante": ["ate_1"],
    },
    "Varjão": {
        "idade_media_alvo": 28, "idade_min": 16, "idade_max": 60,
        "cor_branca_pct": 15, "cor_parda_pct": 55, "cor_preta_pct": 30,
        "escolaridade_superior_pct": 5,
        "grupo_renda": "G4_baixa",
        "renda_predominante": ["ate_1", "mais_de_1_ate_2"],
    },
    "Fercal": {
        "idade_media_alvo": 30, "idade_min": 16, "idade_max": 65,
        "cor_branca_pct": 18, "cor_parda_pct": 58, "cor_preta_pct": 24,
        "escolaridade_superior_pct": 6,
        "grupo_renda": "G4_baixa",
        "renda_predominante": ["ate_1", "mais_de_1_ate_2"],
    },
}

# Profissoes compativeis por escolaridade e faixa etaria
PROFISSOES_POR_ESCOLARIDADE = {
    "fundamental_incompleto": [
        "Auxiliar de Servicos Gerais", "Diarista", "Pedreiro", "Pintor",
        "Jardineiro", "Porteiro", "Vigilante", "Cuidador(a)", "Domestica",
        "Ajudante de Cozinha", "Catador(a) de Materiais Reciclaveis",
        "Trabalhador Rural", "Vendedor Ambulante", "Mecanico",
    ],
    "fundamental_completo": [
        "Auxiliar de Servicos Gerais", "Porteiro", "Vigilante", "Motorista",
        "Atendente", "Caixa", "Recepcionista", "Operador de Maquinas",
        "Mecanico", "Eletricista", "Cozinheiro(a)", "Garcom",
    ],
    "medio_completo_ou_sup_incompleto": [
        "Atendente de Loja", "Vendedor(a)", "Caixa", "Recepcionista",
        "Auxiliar Administrativo", "Tecnico em Enfermagem", "Motorista de App",
        "Representante Comercial", "Operador de Telemarketing", "Corretor",
        "Tecnico de Informatica", "Agente Comunitario", "Barbeiro/Cabeleireiro",
        "Manicure", "Esteticista", "Seguranca",
    ],
    "superior_completo_ou_pos": [
        "Analista Administrativo", "Contador(a)", "Advogado(a)", "Engenheiro(a)",
        "Medico(a)", "Enfermeiro(a)", "Professor(a)", "Psicologo(a)",
        "Servidor Publico", "Empresario(a)", "Arquiteto(a)", "Dentista",
        "Jornalista", "Administrador(a)", "Economista", "Analista de Sistemas",
        "Gerente", "Consultor(a)", "Fisioterapeuta", "Nutricionista",
    ],
}

# Vinculos compativeis por profissao e renda
VINCULOS_POR_CONTEXTO = {
    "alto": ["servidor_publico", "empresario", "autonomo_formal", "clt"],
    "medio": ["servidor_publico", "clt", "autonomo_formal", "autonomo_informal"],
    "baixo": ["clt", "autonomo_informal", "informal", "desempregado", "bico"],
}


def normalizar_nome_ra(nome):
    """Normaliza variantes de nome de RA"""
    mapa = {
        "Ceilandia": "Ceilândia",
        "Paranoa": "Paranoá",
        "Aguas Claras": "Águas Claras",
        "Guara": "Guará",
        "Sao Sebastiao": "São Sebastião",
        "Itapoa": "Itapoã",
        "Brazlandia": "Brazlândia",
        "Jardim Botanico": "Jardim Botânico",
        "Nucleo Bandeirante": "Núcleo Bandeirante",
        "Candangolandia": "Candangolândia",
        "Varjao": "Varjão",
    }
    return mapa.get(nome, nome)


def obter_meta_ra(ra):
    """Obtem metas PDAD para uma RA"""
    ra_norm = normalizar_nome_ra(ra)
    if ra_norm in METAS_PDAD:
        return METAS_PDAD[ra_norm]
    # Busca aproximada
    for nome, meta in METAS_PDAD.items():
        if nome.lower().replace(" ", "") == ra_norm.lower().replace(" ", ""):
            return meta
    return None


def calcular_nova_idade(idade_atual, meta, preservar_aposentado=False):
    """
    Calcula nova idade mantendo coerencia
    - Preserva aposentados (65+) se possivel
    - Ajusta proporcionalmente para a media alvo
    """
    idade_alvo = meta['idade_media_alvo']
    idade_min = meta['idade_min']
    idade_max = meta['idade_max']

    # Se ja esta na faixa adequada, pequeno ajuste
    if abs(idade_atual - idade_alvo) <= 5:
        return idade_atual

    # Aposentados: manter acima de 60 se preservar_aposentado
    if preservar_aposentado and idade_atual >= 65:
        return max(60, min(idade_atual - random.randint(0, 5), idade_max))

    # Calcular ajuste proporcional
    if idade_atual > idade_alvo:
        # Rejuvenescer
        reducao = (idade_atual - idade_alvo) * random.uniform(0.6, 0.9)
        nova_idade = int(idade_atual - reducao)
    else:
        # Envelhecer (raro)
        aumento = (idade_alvo - idade_atual) * random.uniform(0.3, 0.6)
        nova_idade = int(idade_atual + aumento)

    # Garantir limites
    nova_idade = max(idade_min, min(nova_idade, idade_max))

    return nova_idade


def ajustar_profissao_por_idade(eleitor, nova_idade):
    """Ajusta profissao se necessario pela nova idade"""
    profissao = eleitor.get('profissao', '')
    vinculo = eleitor.get('ocupacao_vinculo', '')

    # Se era aposentado mas agora esta jovem demais
    if vinculo == 'aposentado' and nova_idade < 55:
        escolaridade = eleitor.get('escolaridade', 'medio_completo_ou_sup_incompleto')
        opcoes = PROFISSOES_POR_ESCOLARIDADE.get(escolaridade,
                 PROFISSOES_POR_ESCOLARIDADE['medio_completo_ou_sup_incompleto'])
        nova_profissao = random.choice(opcoes)
        novo_vinculo = random.choice(['clt', 'autonomo_informal', 'informal'])
        return nova_profissao, novo_vinculo

    # Se esta muito jovem para certas profissoes senior
    if nova_idade < 25 and any(x in profissao.lower() for x in ['gerente', 'diretor', 'chefe']):
        escolaridade = eleitor.get('escolaridade', 'medio_completo_ou_sup_incompleto')
        opcoes = PROFISSOES_POR_ESCOLARIDADE.get(escolaridade,
                 PROFISSOES_POR_ESCOLARIDADE['medio_completo_ou_sup_incompleto'])
        return random.choice(opcoes), vinculo

    return profissao, vinculo


def ajustar_escolaridade_por_contexto(eleitor, meta):
    """
    Ajusta escolaridade para refletir realidade da RA
    Considera idade e mantem coerencia com profissao
    """
    escolaridade_atual = eleitor.get('escolaridade', '')
    idade = eleitor.get('idade', 35)
    profissao = eleitor.get('profissao', '')

    pct_superior_alvo = meta['escolaridade_superior_pct']

    # Profissoes que exigem superior - nao rebaixar
    profissoes_superior = ['medico', 'advogado', 'engenheiro', 'arquiteto',
                          'dentista', 'psicologo', 'contador', 'enfermeiro']
    if any(p in profissao.lower() for p in profissoes_superior):
        return escolaridade_atual

    # Se alvo < 15% superior, reduzir bastante
    if pct_superior_alvo < 15 and escolaridade_atual == 'superior_completo_ou_pos':
        # 70% de chance de rebaixar
        if random.random() < 0.7:
            return 'medio_completo_ou_sup_incompleto'

    # Se alvo < 25% e tem superior
    elif pct_superior_alvo < 25 and escolaridade_atual == 'superior_completo_ou_pos':
        # 50% de chance
        if random.random() < 0.5:
            return 'medio_completo_ou_sup_incompleto'

    return escolaridade_atual


def ajustar_renda_por_contexto(eleitor, meta):
    """
    Ajusta renda para refletir realidade da RA
    Considera escolaridade e profissao
    """
    renda_atual = eleitor.get('renda_salarios_minimos', 'mais_de_1_ate_2')
    escolaridade = eleitor.get('escolaridade', '')
    profissao = eleitor.get('profissao', '')

    rendas_alvo = meta['renda_predominante']
    grupo = meta['grupo_renda']

    # Manter coerencia: servidor publico nao pode ter renda muito baixa
    if 'servidor' in eleitor.get('ocupacao_vinculo', '').lower():
        if renda_atual == 'ate_1':
            return 'mais_de_2_ate_5'
        return renda_atual

    # Medicos, advogados etc - manter renda alta
    profissoes_alta_renda = ['medico', 'advogado', 'engenheiro', 'empresario']
    if any(p in profissao.lower() for p in profissoes_alta_renda):
        return renda_atual

    # G4 (baixa renda) - forcar rendas baixas
    if grupo == 'G4_baixa':
        if renda_atual in ['mais_de_5_ate_10', 'mais_de_10_ate_20', 'mais_de_20']:
            return random.choice(['mais_de_1_ate_2', 'mais_de_2_ate_5'])
        elif renda_atual == 'mais_de_2_ate_5' and random.random() < 0.5:
            return 'mais_de_1_ate_2'

    # G3 (media-baixa) - predominar 1-5 SM
    elif grupo == 'G3_media_baixa':
        if renda_atual in ['mais_de_10_ate_20', 'mais_de_20']:
            return random.choice(['mais_de_2_ate_5', 'mais_de_5_ate_10'])
        elif renda_atual == 'mais_de_5_ate_10' and random.random() < 0.4:
            return 'mais_de_2_ate_5'

    # G1 (alta) - aumentar se muito baixa
    elif grupo == 'G1_alta':
        if renda_atual in ['ate_1', 'mais_de_1_ate_2']:
            if escolaridade == 'superior_completo_ou_pos':
                return random.choice(['mais_de_5_ate_10', 'mais_de_10_ate_20'])
            else:
                return 'mais_de_2_ate_5'

    return renda_atual


def selecionar_cor_por_meta(meta, distribuicao_atual):
    """
    Seleciona cor/raca baseado nas metas PDAD
    Considera distribuicao atual para balancear
    """
    alvo_branca = meta['cor_branca_pct'] / 100
    alvo_parda = meta['cor_parda_pct'] / 100
    alvo_preta = meta['cor_preta_pct'] / 100

    # Adicionar aleatoriedade controlada
    r = random.random()
    if r < alvo_parda:
        return 'parda'
    elif r < alvo_parda + alvo_preta:
        return 'preta'
    else:
        return 'branca'


def atualizar_historia(eleitor, mudancas):
    """
    Atualiza historia_resumida se houve mudancas significativas
    Preserva o maximo possivel da narrativa original
    """
    historia = eleitor.get('historia_resumida', '')

    if not mudancas:
        return historia

    # Se mudou idade significativamente, ajustar referencias temporais
    if 'idade' in mudancas and abs(mudancas['idade'][0] - mudancas['idade'][1]) > 10:
        idade_nova = mudancas['idade'][1]

        # Substituir referencias a decadas
        if 'anos 90' in historia and idade_nova < 40:
            historia = historia.replace('anos 90', 'anos 2000')
        if 'anos 80' in historia and idade_nova < 50:
            historia = historia.replace('anos 80', 'anos 2000')

        # Ajustar "Hoje aposentado" se necessario
        if 'aposentado' in historia.lower() and idade_nova < 55:
            historia = historia.replace('Hoje aposentado(a)', 'Trabalha como')
            historia = historia.replace('aposentado(a)', 'trabalhador(a)')

    return historia


def atualizar_faixa_etaria(idade):
    """Retorna a faixa etaria correta para a idade"""
    if idade < 18:
        return "16-17"
    elif idade < 25:
        return "18-24"
    elif idade < 35:
        return "25-34"
    elif idade < 45:
        return "35-44"
    elif idade < 55:
        return "45-54"
    elif idade < 65:
        return "55-64"
    else:
        return "65+"


def corrigir_eleitor(eleitor, meta, log_mudancas):
    """
    Corrige um eleitor individual mantendo coerencia
    Retorna eleitor corrigido e lista de mudancas
    """
    eleitor_corrigido = copy.deepcopy(eleitor)
    mudancas = {}

    id_eleitor = eleitor.get('id', 'N/A')
    ra = eleitor.get('regiao_administrativa', 'N/A')

    # 1. CORRIGIR IDADE
    idade_atual = eleitor.get('idade', 35)
    preservar_aposentado = eleitor.get('ocupacao_vinculo') == 'aposentado'
    nova_idade = calcular_nova_idade(idade_atual, meta, preservar_aposentado)

    if nova_idade != idade_atual:
        eleitor_corrigido['idade'] = nova_idade
        eleitor_corrigido['faixa_etaria'] = atualizar_faixa_etaria(nova_idade)
        mudancas['idade'] = (idade_atual, nova_idade)

        # Ajustar profissao se necessario
        nova_profissao, novo_vinculo = ajustar_profissao_por_idade(eleitor_corrigido, nova_idade)
        if nova_profissao != eleitor.get('profissao'):
            eleitor_corrigido['profissao'] = nova_profissao
            eleitor_corrigido['ocupacao_vinculo'] = novo_vinculo
            mudancas['profissao'] = (eleitor.get('profissao'), nova_profissao)

        # Atualizar voto facultativo
        eleitor_corrigido['voto_facultativo'] = nova_idade < 18 or nova_idade >= 70

    # 2. CORRIGIR ESCOLARIDADE
    nova_escolaridade = ajustar_escolaridade_por_contexto(eleitor_corrigido, meta)
    if nova_escolaridade != eleitor.get('escolaridade'):
        eleitor_corrigido['escolaridade'] = nova_escolaridade
        mudancas['escolaridade'] = (eleitor.get('escolaridade'), nova_escolaridade)

        # Se rebaixou escolaridade, pode precisar ajustar profissao
        if nova_escolaridade != 'superior_completo_ou_pos':
            profissao = eleitor_corrigido.get('profissao', '')
            profissoes_exigem_superior = ['Analista', 'Contador', 'Advogado', 'Engenheiro',
                                          'Medico', 'Enfermeiro', 'Professor', 'Psicologo']
            if any(p in profissao for p in profissoes_exigem_superior):
                opcoes = PROFISSOES_POR_ESCOLARIDADE.get(nova_escolaridade, [])
                if opcoes:
                    nova_prof = random.choice(opcoes)
                    eleitor_corrigido['profissao'] = nova_prof
                    mudancas['profissao'] = (profissao, nova_prof)

    # 3. CORRIGIR RENDA
    nova_renda = ajustar_renda_por_contexto(eleitor_corrigido, meta)
    if nova_renda != eleitor.get('renda_salarios_minimos'):
        eleitor_corrigido['renda_salarios_minimos'] = nova_renda
        mudancas['renda'] = (eleitor.get('renda_salarios_minimos'), nova_renda)

    # 4. CORRIGIR CLUSTER
    if eleitor_corrigido.get('cluster_socioeconomico') != meta['grupo_renda']:
        mudancas['cluster'] = (eleitor.get('cluster_socioeconomico'), meta['grupo_renda'])
        eleitor_corrigido['cluster_socioeconomico'] = meta['grupo_renda']

    # 5. CORRIGIR COR/RACA (selecionado para atingir metas da RA)
    # Isso sera feito em lote para garantir distribuicao correta

    # 6. ATUALIZAR HISTORIA
    nova_historia = atualizar_historia(eleitor_corrigido, mudancas)
    if nova_historia != eleitor.get('historia_resumida'):
        eleitor_corrigido['historia_resumida'] = nova_historia

    # Registrar mudancas
    if mudancas:
        log_mudancas.append({
            'id': id_eleitor,
            'ra': ra,
            'mudancas': mudancas
        })

    return eleitor_corrigido


def ajustar_cor_raca_por_ra(eleitores_ra, meta):
    """
    Ajusta cor/raca em lote para atingir distribuicao alvo
    Minimiza mudancas - so altera o necessario
    """
    n = len(eleitores_ra)
    if n == 0:
        return eleitores_ra

    # Calcular distribuicao atual
    atual = Counter(e.get('cor_raca', 'parda') for e in eleitores_ra)

    # Calcular alvos
    alvo_branca = int(n * meta['cor_branca_pct'] / 100)
    alvo_parda = int(n * meta['cor_parda_pct'] / 100)
    alvo_preta = n - alvo_branca - alvo_parda

    # Ajustar para garantir que soma = n
    diff = n - (alvo_branca + alvo_parda + alvo_preta)
    alvo_parda += diff

    # Calcular quantos precisam mudar
    excesso_branca = max(0, atual.get('branca', 0) - alvo_branca)
    falta_parda = max(0, alvo_parda - atual.get('parda', 0))
    falta_preta = max(0, alvo_preta - atual.get('preta', 0))

    # Selecionar candidatos para mudanca (preferir aleatorio)
    indices_brancos = [i for i, e in enumerate(eleitores_ra) if e.get('cor_raca') == 'branca']
    random.shuffle(indices_brancos)

    mudancas_feitas = 0

    # Converter excesso de brancos para pardos/pretos
    for i in indices_brancos[:excesso_branca]:
        if falta_parda > 0:
            eleitores_ra[i]['cor_raca'] = 'parda'
            falta_parda -= 1
            mudancas_feitas += 1
        elif falta_preta > 0:
            eleitores_ra[i]['cor_raca'] = 'preta'
            falta_preta -= 1
            mudancas_feitas += 1

    return eleitores_ra


def main():
    print("=" * 90)
    print("CORRECAO ESTRATEGICA DO BANCO DE ELEITORES")
    print("Baseado em dados oficiais PDAD 2021/2024 - IPEDF Codeplan")
    print("=" * 90)
    print()

    # Carregar dados
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    total = len(eleitores)
    print(f"Total de eleitores carregados: {total}")

    # Agrupar por RA
    eleitores_por_ra = defaultdict(list)
    indices_por_ra = defaultdict(list)

    for i, e in enumerate(eleitores):
        ra = normalizar_nome_ra(e.get('regiao_administrativa', 'N/A'))
        eleitores_por_ra[ra].append(e)
        indices_por_ra[ra].append(i)

    print(f"RAs encontradas: {len(eleitores_por_ra)}")
    print()

    # Processar cada RA
    log_mudancas = []
    eleitores_corrigidos = [None] * total

    for ra, lista_eleitores in eleitores_por_ra.items():
        meta = obter_meta_ra(ra)

        if meta is None:
            print(f"  [!] RA '{ra}' sem meta PDAD - mantendo original")
            for i, idx in enumerate(indices_por_ra[ra]):
                eleitores_corrigidos[idx] = lista_eleitores[i]
            continue

        print(f"  Processando {ra} ({len(lista_eleitores)} eleitores)...")

        # Corrigir cada eleitor
        lista_corrigida = []
        for e in lista_eleitores:
            e_corrigido = corrigir_eleitor(e, meta, log_mudancas)
            lista_corrigida.append(e_corrigido)

        # Ajustar cor/raca em lote
        lista_corrigida = ajustar_cor_raca_por_ra(lista_corrigida, meta)

        # Guardar nos indices corretos
        for i, idx in enumerate(indices_por_ra[ra]):
            eleitores_corrigidos[idx] = lista_corrigida[i]

    # Verificar se todos foram processados
    for i, e in enumerate(eleitores_corrigidos):
        if e is None:
            eleitores_corrigidos[i] = eleitores[i]

    # Salvar arquivo corrigido
    arquivo_saida = 'agentes/banco-eleitores-df.json'
    arquivo_backup = f'agentes/banco-eleitores-df_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'

    # Backup
    with open(arquivo_backup, 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)
    print(f"\nBackup salvo em: {arquivo_backup}")

    # Salvar corrigido
    with open(arquivo_saida, 'w', encoding='utf-8') as f:
        json.dump(eleitores_corrigidos, f, ensure_ascii=False, indent=2)
    print(f"Arquivo corrigido salvo em: {arquivo_saida}")

    # Estatisticas de mudancas
    print("\n" + "=" * 90)
    print("RESUMO DAS CORRECOES")
    print("=" * 90)

    total_mudancas = len(log_mudancas)
    print(f"Total de eleitores modificados: {total_mudancas} ({total_mudancas/total*100:.1f}%)")

    # Contar tipos de mudanca
    tipos_mudanca = Counter()
    for m in log_mudancas:
        for tipo in m['mudancas'].keys():
            tipos_mudanca[tipo] += 1

    print("\nMudancas por tipo:")
    for tipo, qtd in tipos_mudanca.most_common():
        print(f"  - {tipo}: {qtd} eleitores")

    # Mudancas por RA
    mudancas_por_ra = Counter(m['ra'] for m in log_mudancas)
    print("\nRAs com mais mudancas:")
    for ra, qtd in mudancas_por_ra.most_common(10):
        print(f"  - {ra}: {qtd} eleitores")

    # Exemplos de mudancas
    print("\n" + "=" * 90)
    print("EXEMPLOS DE CORRECOES (primeiros 5)")
    print("=" * 90)

    for m in log_mudancas[:5]:
        print(f"\n  ID: {m['id']} | RA: {m['ra']}")
        for campo, (antes, depois) in m['mudancas'].items():
            print(f"    {campo}: {antes} -> {depois}")

    print("\n" + "=" * 90)
    print("CORRECAO CONCLUIDA!")
    print("=" * 90)
    print("\nExecute 'python comparacao_pdad_oficial.py' para validar as correcoes.")

    return True


if __name__ == "__main__":
    main()
