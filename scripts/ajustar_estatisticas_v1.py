#!/usr/bin/env python3
"""
Script de Ajuste Estatístico do Banco de Eleitores
Versão 1.0

Objetivo: Corrigir desvios estatísticos substituindo perfis para aproximar
das referências oficiais do IBGE/CODEPLAN/TSE.

Principais correções:
1. Pirâmide etária (muitos jovens, poucos idosos)
2. Orientação política (excesso de centro)
3. Ocupação (excesso de servidores públicos, falta de autônomos/aposentados)
4. Estado civil (excesso de solteiros)
5. Cor/raça (falta de brancos)
"""

import json
import random
from datetime import datetime
from copy import deepcopy

# Arquivos
ARQUIVO_ENTRADA = "agentes/banco-eleitores-df.json"
ARQUIVO_SAIDA = "agentes/banco-eleitores-df.json"
ARQUIVO_FRONTEND = "frontend/src/data/eleitores-df-1000.json"

# Metas estatísticas (referências oficiais)
METAS = {
    "faixa_etaria": {
        "16-24": 0.145,
        "25-34": 0.200,
        "35-44": 0.205,
        "45-54": 0.180,
        "55-64": 0.120,
        "65+": 0.150,
    },
    "orientacao_politica": {
        "esquerda": 0.15,
        "centro_esquerda": 0.07,
        "centro": 0.11,
        "centro_direita": 0.11,
        "direita": 0.29,
    },
    "ocupacao_vinculo": {
        "clt": 0.375,
        "servidor_publico": 0.085,
        "autonomo": 0.250,
        "empresario": 0.042,
        "informal": 0.138,
        "desempregado": 0.066,
        "aposentado": 0.105,
        "estudante": 0.050,
    },
}

# Regiões administrativas do DF com população
REGIOES = {
    "Ceilândia": 0.144,
    "Samambaia": 0.083,
    "Taguatinga": 0.066,
    "Plano Piloto": 0.083,
    "Planaltina": 0.059,
    "Águas Claras": 0.051,
    "Recanto das Emas": 0.044,
    "Gama": 0.044,
    "Guará": 0.043,
    "Santa Maria": 0.039,
    "Sobradinho": 0.021,
    "São Sebastião": 0.033,
    "Vicente Pires": 0.023,
    "Riacho Fundo": 0.012,
    "Brazlândia": 0.015,
    "Paranoá": 0.021,
    "Estrutural": 0.011,
    "Itapoã": 0.020,
    "Sudoeste/Octogonal": 0.018,
    "Lago Sul": 0.010,
    "Lago Norte": 0.012,
}

# Nomes para geração
NOMES_MASCULINOS = [
    "José",
    "Antonio",
    "João",
    "Francisco",
    "Carlos",
    "Paulo",
    "Pedro",
    "Luiz",
    "Marcos",
    "Luis",
    "Fernando",
    "Roberto",
    "Sebastião",
    "Geraldo",
    "Manoel",
    "Jorge",
    "Antônio",
    "Raimundo",
    "Edson",
    "Mário",
]

NOMES_FEMININOS = [
    "Maria",
    "Ana",
    "Francisca",
    "Antonia",
    "Adriana",
    "Juliana",
    "Márcia",
    "Fernanda",
    "Patrícia",
    "Aline",
    "Sandra",
    "Camila",
    "Amanda",
    "Bruna",
    "Jéssica",
    "Letícia",
    "Julia",
    "Luciana",
    "Vanessa",
    "Mariana",
]

SOBRENOMES = [
    "Silva",
    "Santos",
    "Oliveira",
    "Souza",
    "Rodrigues",
    "Ferreira",
    "Alves",
    "Pereira",
    "Lima",
    "Gomes",
    "Costa",
    "Ribeiro",
    "Martins",
    "Carvalho",
    "Almeida",
    "Lopes",
    "Soares",
    "Fernandes",
    "Vieira",
    "Barbosa",
]

PROFISSOES_APOSENTADO = [
    "Aposentado(a)",
    "Aposentado(a) - Ex-Servidor Público",
    "Aposentado(a) - Ex-Comerciante",
    "Pensionista",
]

PROFISSOES_AUTONOMO = [
    "Pedreiro",
    "Eletricista",
    "Encanador",
    "Pintor(a)",
    "Marceneiro",
    "Diarista",
    "Cabeleireiro(a)",
    "Manicure",
    "Vendedor(a) Ambulante",
    "Motorista de Aplicativo",
    "Costureiro(a)",
    "Feirante",
]


def carregar_eleitores():
    with open(ARQUIVO_ENTRADA, "r", encoding="utf-8") as f:
        return json.load(f)


def salvar_eleitores(eleitores):
    with open(ARQUIVO_SAIDA, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)
    with open(ARQUIVO_FRONTEND, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)


def calcular_distribuicao(eleitores, campo):
    """Calcula distribuição atual de um campo"""
    contagem = {}
    for e in eleitores:
        valor = e.get(campo, "desconhecido")
        contagem[valor] = contagem.get(valor, 0) + 1

    total = len(eleitores)
    return {k: v / total for k, v in contagem.items()}


def calcular_faixa_etaria(idade):
    if idade < 25:
        return "16-24"
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


def gerar_nome(genero):
    if genero == "masculino":
        nome = random.choice(NOMES_MASCULINOS)
    else:
        nome = random.choice(NOMES_FEMININOS)
    sobrenome1 = random.choice(SOBRENOMES)
    sobrenome2 = random.choice(SOBRENOMES)
    while sobrenome2 == sobrenome1:
        sobrenome2 = random.choice(SOBRENOMES)
    return f"{nome} {sobrenome1} {sobrenome2}"


def criar_eleitor_idoso(id_eleitor):
    """Cria um eleitor idoso (65+) com perfil coerente"""
    genero = random.choice(["masculino", "feminino"])
    idade = random.randint(65, 82)

    # Idosos têm maior probabilidade de serem casados ou viúvos
    estado_civil = random.choices(
        ["casado(a)", "viuvo(a)", "divorciado(a)", "solteiro(a)"],
        weights=[0.45, 0.25, 0.15, 0.15],
    )[0]

    # Maioria é aposentada
    ocupacao = random.choices(
        ["aposentado", "autonomo", "informal"], weights=[0.85, 0.10, 0.05]
    )[0]

    if ocupacao == "aposentado":
        profissao = random.choice(PROFISSOES_APOSENTADO)
        renda = random.choices(
            ["ate_1", "mais_de_1_ate_2", "mais_de_2_ate_5"], weights=[0.40, 0.40, 0.20]
        )[0]
    else:
        profissao = random.choice(PROFISSOES_AUTONOMO)
        renda = random.choices(["ate_1", "mais_de_1_ate_2"], weights=[0.60, 0.40])[0]

    # Cluster baseado na renda
    if renda == "ate_1":
        cluster = "G4_baixa"
    elif renda == "mais_de_1_ate_2":
        cluster = random.choice(["G3_media_baixa", "G4_baixa"])
    else:
        cluster = "G3_media_baixa"

    # Orientação política - idosos tendem mais à direita
    orientacao = random.choices(
        ["direita", "centro_direita", "centro", "centro_esquerda", "esquerda"],
        weights=[0.35, 0.20, 0.15, 0.10, 0.20],
    )[0]

    # Posição Bolsonaro coerente com orientação
    if orientacao in ["direita", "centro_direita"]:
        posicao_bolsonaro = random.choices(
            ["apoiador_forte", "apoiador_moderado", "neutro"],
            weights=[0.40, 0.35, 0.25],
        )[0]
    elif orientacao in ["esquerda", "centro_esquerda"]:
        posicao_bolsonaro = random.choices(
            ["critico_forte", "critico_moderado", "neutro"], weights=[0.50, 0.30, 0.20]
        )[0]
    else:
        posicao_bolsonaro = random.choices(
            ["neutro", "critico_moderado", "apoiador_moderado"],
            weights=[0.40, 0.30, 0.30],
        )[0]

    # Cor/raça - distribuição do DF ajustada para idosos (mais brancos)
    cor_raca = random.choices(["branca", "parda", "preta"], weights=[0.45, 0.40, 0.15])[
        0
    ]

    # Religião
    religiao = random.choices(
        ["catolica", "evangelica", "espirita", "sem_religiao", "outras"],
        weights=[0.50, 0.30, 0.08, 0.07, 0.05],
    )[0]

    # Escolaridade
    escolaridade = random.choices(
        [
            "fundamental_ou_sem_instrucao",
            "medio_completo_ou_sup_incompleto",
            "superior_completo_ou_pos",
        ],
        weights=[0.35, 0.40, 0.25],
    )[0]

    # Filhos
    filhos = random.choices(
        [0, 1, 2, 3, 4, 5], weights=[0.10, 0.15, 0.35, 0.25, 0.10, 0.05]
    )[0]

    # Região
    regiao = random.choices(list(REGIOES.keys()), weights=list(REGIOES.values()))[0]

    return {
        "id": id_eleitor,
        "nome": gerar_nome(genero),
        "idade": idade,
        "genero": genero,
        "cor_raca": cor_raca,
        "regiao_administrativa": regiao,
        "local_referencia": f"perto do centro de {regiao}",
        "cluster_socioeconomico": cluster,
        "escolaridade": escolaridade,
        "profissao": profissao,
        "ocupacao_vinculo": ocupacao,
        "renda_salarios_minimos": renda,
        "religiao": religiao,
        "estado_civil": estado_civil,
        "filhos": filhos,
        "orientacao_politica": orientacao,
        "posicao_bolsonaro": posicao_bolsonaro,
        "interesse_politico": random.choices(
            ["baixo", "medio", "alto"], weights=[0.40, 0.40, 0.20]
        )[0],
        "tolerancia_nuance": random.choices(
            ["baixa", "media", "alta"], weights=[0.30, 0.45, 0.25]
        )[0],
        "estilo_decisao": random.choices(
            ["economico", "moral", "identitario", "pragmatico", "emocional"],
            weights=[0.30, 0.25, 0.20, 0.15, 0.10],
        )[0],
        "valores": random.sample(
            ["Família", "Trabalho", "Fé e religião", "Segurança", "Saúde"], 3
        ),
        "preocupacoes": random.sample(
            ["Saúde", "Segurança pública", "Economia", "Corrupção"], 3
        ),
        "vieses_cognitivos": random.sample(
            ["confirmacao", "disponibilidade", "ancoragem", "status_quo"], 2
        ),
        "medos": random.sample(
            ["Violência", "Doença sem atendimento", "Inflação", "Solidão"], 3
        ),
        "fontes_informacao": random.sample(
            [
                "TV Globo / Jornal Nacional",
                "Rádio",
                "WhatsApp",
                "TV Record / Cidade Alerta",
            ],
            3,
        ),
        "susceptibilidade_desinformacao": random.choices(
            ["baixa", "media", "alta"], weights=[0.30, 0.40, 0.30]
        )[0],
        "meio_transporte": random.choices(
            ["onibus", "carro", "a_pe", "nao_se_aplica"],
            weights=[0.30, 0.25, 0.25, 0.20],
        )[0],
        "tempo_deslocamento_trabalho": "nao_se_aplica"
        if ocupacao == "aposentado"
        else random.choice(["ate_15", "15_30"]),
        "voto_facultativo": True,  # 70+ é facultativo
        "conflito_identitario": random.random() < 0.15,
        "historia_resumida": f"Morador(a) de {regiao} há décadas. {profissao}. {estado_civil.replace('(a)', '').title()}.",
        "instrucao_comportamental": "Tom: coloquial. Valoriza a experiência de vida. Tem posições formadas mas ouve com respeito.",
        "faixa_etaria": "65+",
        "filhos_cat": "3_ou_mais"
        if filhos >= 3
        else f"{filhos}_filho"
        if filhos == 1
        else f"{filhos}_filhos"
        if filhos > 0
        else "sem_filhos",
    }


def criar_eleitor_meia_idade(id_eleitor, faixa="55-64"):
    """Cria um eleitor de meia-idade (45-64) com perfil coerente"""
    genero = random.choice(["masculino", "feminino"])

    if faixa == "55-64":
        idade = random.randint(55, 64)
    else:
        idade = random.randint(45, 54)

    estado_civil = random.choices(
        ["casado(a)", "divorciado(a)", "solteiro(a)", "uniao_estavel", "viuvo(a)"],
        weights=[0.45, 0.20, 0.15, 0.15, 0.05],
    )[0]

    ocupacao = random.choices(
        ["autonomo", "clt", "informal", "aposentado", "desempregado"],
        weights=[0.35, 0.30, 0.15, 0.10, 0.10],
    )[0]

    if ocupacao == "aposentado":
        profissao = random.choice(PROFISSOES_APOSENTADO)
    elif ocupacao == "autonomo":
        profissao = random.choice(PROFISSOES_AUTONOMO)
    else:
        profissao = random.choice(
            [
                "Vendedor(a)",
                "Auxiliar de Serviços",
                "Motorista",
                "Porteiro(a)",
                "Segurança",
            ]
        )

    renda = random.choices(
        ["ate_1", "mais_de_1_ate_2", "mais_de_2_ate_5"], weights=[0.35, 0.40, 0.25]
    )[0]

    if renda == "ate_1":
        cluster = "G4_baixa"
    elif renda == "mais_de_1_ate_2":
        cluster = random.choice(["G3_media_baixa", "G4_baixa"])
    else:
        cluster = "G3_media_baixa"

    orientacao = random.choices(
        ["direita", "centro_direita", "centro", "centro_esquerda", "esquerda"],
        weights=[0.30, 0.15, 0.10, 0.10, 0.15],
    )[0]

    if orientacao in ["direita", "centro_direita"]:
        posicao_bolsonaro = random.choices(
            ["apoiador_forte", "apoiador_moderado", "neutro", "critico_moderado"],
            weights=[0.35, 0.30, 0.20, 0.15],
        )[0]
    elif orientacao in ["esquerda", "centro_esquerda"]:
        posicao_bolsonaro = random.choices(
            ["critico_forte", "critico_moderado", "neutro"], weights=[0.50, 0.30, 0.20]
        )[0]
    else:
        posicao_bolsonaro = random.choice(
            ["neutro", "critico_moderado", "apoiador_moderado"]
        )

    cor_raca = random.choices(["branca", "parda", "preta"], weights=[0.42, 0.43, 0.15])[
        0
    ]
    religiao = random.choices(
        ["catolica", "evangelica", "espirita", "sem_religiao"],
        weights=[0.48, 0.32, 0.08, 0.12],
    )[0]
    escolaridade = random.choices(
        [
            "fundamental_ou_sem_instrucao",
            "medio_completo_ou_sup_incompleto",
            "superior_completo_ou_pos",
        ],
        weights=[0.30, 0.45, 0.25],
    )[0]

    filhos = random.choices([0, 1, 2, 3, 4], weights=[0.15, 0.25, 0.35, 0.15, 0.10])[0]
    regiao = random.choices(list(REGIOES.keys()), weights=list(REGIOES.values()))[0]

    return {
        "id": id_eleitor,
        "nome": gerar_nome(genero),
        "idade": idade,
        "genero": genero,
        "cor_raca": cor_raca,
        "regiao_administrativa": regiao,
        "local_referencia": f"perto do centro de {regiao}",
        "cluster_socioeconomico": cluster,
        "escolaridade": escolaridade,
        "profissao": profissao,
        "ocupacao_vinculo": ocupacao,
        "renda_salarios_minimos": renda,
        "religiao": religiao,
        "estado_civil": estado_civil,
        "filhos": filhos,
        "orientacao_politica": orientacao,
        "posicao_bolsonaro": posicao_bolsonaro,
        "interesse_politico": random.choices(
            ["baixo", "medio", "alto"], weights=[0.35, 0.45, 0.20]
        )[0],
        "tolerancia_nuance": random.choices(
            ["baixa", "media", "alta"], weights=[0.30, 0.45, 0.25]
        )[0],
        "estilo_decisao": random.choice(
            ["economico", "moral", "identitario", "pragmatico"]
        ),
        "valores": random.sample(
            ["Família", "Trabalho", "Segurança", "Saúde", "Liberdade"], 3
        ),
        "preocupacoes": random.sample(
            ["Saúde", "Segurança pública", "Economia", "Desemprego", "Corrupção"], 3
        ),
        "vieses_cognitivos": random.sample(
            ["confirmacao", "disponibilidade", "grupo", "aversao_perda"], 2
        ),
        "medos": random.sample(["Violência", "Desemprego", "Doença", "Inflação"], 3),
        "fontes_informacao": random.sample(
            ["TV Globo / Jornal Nacional", "WhatsApp", "Rádio", "Facebook"], 3
        ),
        "susceptibilidade_desinformacao": random.choices(
            ["baixa", "media", "alta"], weights=[0.25, 0.45, 0.30]
        )[0],
        "meio_transporte": random.choices(
            ["onibus", "carro", "a_pe", "motocicleta"], weights=[0.35, 0.30, 0.20, 0.15]
        )[0],
        "tempo_deslocamento_trabalho": random.choice(["ate_15", "15_30", "30_45"])
        if ocupacao not in ["aposentado", "desempregado"]
        else "nao_se_aplica",
        "voto_facultativo": idade >= 70,
        "conflito_identitario": random.random() < 0.15,
        "historia_resumida": f"Morador(a) de {regiao}. {profissao}. {estado_civil.replace('(a)', '').title()}.",
        "instrucao_comportamental": "Tom: direto. Experiência de vida moldou suas opiniões.",
        "faixa_etaria": faixa,
        "filhos_cat": "3_ou_mais"
        if filhos >= 3
        else f"{filhos}_filho"
        if filhos == 1
        else f"{filhos}_filhos"
        if filhos > 0
        else "sem_filhos",
    }


def ajustar_orientacao_politica(eleitor):
    """Ajusta orientação política de 'centro' para outras"""
    if eleitor.get("orientacao_politica") == "centro":
        # Redistribuir centristas
        nova_orientacao = random.choices(
            ["direita", "centro_direita", "esquerda", "centro_esquerda"],
            weights=[0.35, 0.25, 0.20, 0.20],
        )[0]
        eleitor["orientacao_politica"] = nova_orientacao

        # Ajustar posição Bolsonaro para ser coerente
        if nova_orientacao in ["direita", "centro_direita"]:
            eleitor["posicao_bolsonaro"] = random.choices(
                ["apoiador_forte", "apoiador_moderado", "neutro"],
                weights=[0.35, 0.35, 0.30],
            )[0]
        else:
            eleitor["posicao_bolsonaro"] = random.choices(
                ["critico_forte", "critico_moderado", "neutro"],
                weights=[0.40, 0.35, 0.25],
            )[0]
        return True
    return False


def main():
    print("=" * 60)
    print("AJUSTE ESTATÍSTICO DO BANCO DE ELEITORES")
    print("=" * 60)

    eleitores = carregar_eleitores()
    total = len(eleitores)
    print(f"\nTotal de eleitores: {total}")

    # Calcular distribuição atual de faixa etária
    dist_idade = {}
    for e in eleitores:
        faixa = calcular_faixa_etaria(e.get("idade", 25))
        e["faixa_etaria"] = faixa
        dist_idade[faixa] = dist_idade.get(faixa, 0) + 1

    print("\nDistribuição atual de faixa etária:")
    for faixa, qtd in sorted(dist_idade.items()):
        meta = METAS["faixa_etaria"].get(faixa, 0) * total
        print(
            f"  {faixa}: {qtd} ({100 * qtd / total:.1f}%) | Meta: {int(meta)} ({100 * METAS['faixa_etaria'].get(faixa, 0):.1f}%)"
        )

    # Identificar eleitores a substituir (jovens 25-34 em excesso)
    jovens_25_34 = [e for e in eleitores if e.get("faixa_etaria") == "25-34"]
    meta_25_34 = int(METAS["faixa_etaria"]["25-34"] * total)
    excesso_25_34 = len(jovens_25_34) - meta_25_34

    # Identificar eleitores centristas em excesso
    centristas = [e for e in eleitores if e.get("orientacao_politica") == "centro"]
    meta_centro = int(METAS["orientacao_politica"]["centro"] * total)
    excesso_centro = len(centristas) - meta_centro

    print(f"\nExcesso de 25-34 anos: {excesso_25_34}")
    print(f"Excesso de centristas: {excesso_centro}")

    # Selecionar eleitores para substituir (priorizar jovens centristas)
    jovens_centristas = [
        e for e in jovens_25_34 if e.get("orientacao_politica") == "centro"
    ]
    outros_jovens = [
        e for e in jovens_25_34 if e.get("orientacao_politica") != "centro"
    ]

    # Calcular quantos idosos precisamos
    atual_65_plus = dist_idade.get("65+", 0)
    meta_65_plus = int(METAS["faixa_etaria"]["65+"] * total)
    falta_65_plus = meta_65_plus - atual_65_plus

    atual_55_64 = dist_idade.get("55-64", 0)
    meta_55_64 = int(METAS["faixa_etaria"]["55-64"] * total)
    falta_55_64 = meta_55_64 - atual_55_64

    print(f"\nFalta de 65+ anos: {falta_65_plus}")
    print(f"Falta de 55-64 anos: {falta_55_64}")

    # Substituir jovens por idosos
    substituicoes = 0

    # Primeiro, substituir jovens centristas por idosos 65+
    para_substituir = jovens_centristas[: min(falta_65_plus, len(jovens_centristas))]

    for eleitor in para_substituir:
        idx = eleitores.index(eleitor)
        novo_eleitor = criar_eleitor_idoso(eleitor["id"])
        eleitores[idx] = novo_eleitor
        substituicoes += 1

    restante_65 = falta_65_plus - len(para_substituir)

    # Se ainda precisar de mais 65+, pegar outros jovens 25-34
    if restante_65 > 0:
        para_substituir = outros_jovens[:restante_65]
        for eleitor in para_substituir:
            idx = eleitores.index(eleitor)
            novo_eleitor = criar_eleitor_idoso(eleitor["id"])
            eleitores[idx] = novo_eleitor
            substituicoes += 1

    print(f"\nSubstituições para 65+: {substituicoes}")

    # Agora substituir mais jovens por 55-64
    # Recalcular jovens restantes
    jovens_25_34 = [e for e in eleitores if e.get("faixa_etaria") == "25-34"]
    excesso_atual = len(jovens_25_34) - meta_25_34

    if excesso_atual > 0 and falta_55_64 > 0:
        para_substituir = jovens_25_34[: min(falta_55_64, excesso_atual)]
        for eleitor in para_substituir:
            idx = eleitores.index(eleitor)
            novo_eleitor = criar_eleitor_meia_idade(eleitor["id"], "55-64")
            eleitores[idx] = novo_eleitor
            substituicoes += 1

    print(
        f"Substituições para 55-64: {min(falta_55_64, excesso_atual) if excesso_atual > 0 else 0}"
    )

    # Ajustar centristas restantes (mudar orientação sem substituir)
    centristas = [e for e in eleitores if e.get("orientacao_politica") == "centro"]
    excesso_centro = len(centristas) - meta_centro

    ajustes_orientacao = 0
    if excesso_centro > 0:
        random.shuffle(centristas)
        para_ajustar = centristas[:excesso_centro]
        for eleitor in para_ajustar:
            if ajustar_orientacao_politica(eleitor):
                ajustes_orientacao += 1

    print(f"Ajustes de orientação política: {ajustes_orientacao}")

    # Salvar
    print("\nSalvando banco ajustado...")
    salvar_eleitores(eleitores)

    # Relatório final
    print("\n" + "=" * 60)
    print("NOVA DISTRIBUIÇÃO")
    print("=" * 60)

    dist_idade_nova = {}
    for e in eleitores:
        faixa = e.get("faixa_etaria", "25-34")
        dist_idade_nova[faixa] = dist_idade_nova.get(faixa, 0) + 1

    print("\nFaixa Etária:")
    for faixa in ["16-24", "25-34", "35-44", "45-54", "55-64", "65+"]:
        qtd = dist_idade_nova.get(faixa, 0)
        meta = METAS["faixa_etaria"].get(faixa, 0) * total
        desvio = qtd - meta
        print(
            f"  {faixa}: {qtd} ({100 * qtd / total:.1f}%) | Meta: {int(meta)} | Desvio: {desvio:+.0f}"
        )

    dist_orientacao = {}
    for e in eleitores:
        ori = e.get("orientacao_politica", "centro")
        dist_orientacao[ori] = dist_orientacao.get(ori, 0) + 1

    print("\nOrientação Política:")
    for ori in ["esquerda", "centro_esquerda", "centro", "centro_direita", "direita"]:
        qtd = dist_orientacao.get(ori, 0)
        meta = METAS["orientacao_politica"].get(ori, 0) * total
        print(f"  {ori}: {qtd} ({100 * qtd / total:.1f}%) | Meta: {int(meta)}")

    print(f"\n✅ Total de substituições: {substituicoes}")
    print(f"✅ Total de ajustes de orientação: {ajustes_orientacao}")
    print("=" * 60)


if __name__ == "__main__":
    main()
