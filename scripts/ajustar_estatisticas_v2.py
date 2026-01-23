#!/usr/bin/env python3
"""
Script de Ajuste Estatístico - Versão 2
Corrige desvios restantes:
- 16-24 anos (24.7% -> 14.5%)
- 55-64 anos (5.4% -> 12%)
- Esquerda/Centro-esquerda em excesso
"""

import json
import random

ARQUIVO = "agentes/banco-eleitores-df.json"
ARQUIVO_FRONTEND = "frontend/src/data/eleitores-df-1000.json"

REGIOES = {
    "Ceilandia": 0.144,
    "Samambaia": 0.083,
    "Taguatinga": 0.066,
    "Plano Piloto": 0.083,
    "Planaltina": 0.059,
    "Aguas Claras": 0.051,
    "Recanto das Emas": 0.044,
    "Gama": 0.044,
    "Guara": 0.043,
    "Santa Maria": 0.039,
    "Sobradinho": 0.021,
    "Sao Sebastiao": 0.033,
}

NOMES_M = [
    "Jose",
    "Antonio",
    "Joao",
    "Francisco",
    "Carlos",
    "Paulo",
    "Pedro",
    "Luiz",
    "Marcos",
    "Roberto",
]
NOMES_F = [
    "Maria",
    "Ana",
    "Francisca",
    "Sandra",
    "Lucia",
    "Helena",
    "Rosa",
    "Teresa",
    "Vera",
    "Regina",
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
    "Costa",
]


def carregar():
    with open(ARQUIVO, "r", encoding="utf-8") as f:
        return json.load(f)


def salvar(eleitores):
    with open(ARQUIVO, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)
    with open(ARQUIVO_FRONTEND, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)


def gerar_nome(genero):
    nome = random.choice(NOMES_M if genero == "masculino" else NOMES_F)
    return f"{nome} {random.choice(SOBRENOMES)} {random.choice(SOBRENOMES)}"


def criar_eleitor_45_64(id_eleitor, faixa):
    """Cria eleitor de 45-54 ou 55-64 anos"""
    genero = random.choice(["masculino", "feminino"])

    if faixa == "45-54":
        idade = random.randint(45, 54)
    else:
        idade = random.randint(55, 64)

    # Ocupacao - mais autonomos e CLT
    ocupacao = random.choices(
        ["autonomo", "clt", "informal", "aposentado", "desempregado"],
        weights=[0.35, 0.30, 0.15, 0.12, 0.08],
    )[0]

    profissoes = {
        "autonomo": [
            "Pedreiro",
            "Eletricista",
            "Diarista",
            "Cabeleireiro(a)",
            "Vendedor(a) Ambulante",
            "Motorista de App",
        ],
        "clt": [
            "Vendedor(a)",
            "Porteiro(a)",
            "Seguranca",
            "Motorista",
            "Auxiliar de Servicos",
        ],
        "informal": ["Diarista", "Feirante", "Ambulante", "Catador(a)"],
        "aposentado": ["Aposentado(a)", "Pensionista"],
        "desempregado": ["Desempregado(a)"],
    }
    profissao = random.choice(profissoes.get(ocupacao, ["Trabalhador(a)"]))

    # Renda baseada na ocupacao
    if ocupacao == "aposentado":
        renda = random.choices(["ate_1", "mais_de_1_ate_2"], weights=[0.55, 0.45])[0]
    elif ocupacao in ["autonomo", "informal", "desempregado"]:
        renda = random.choices(
            ["ate_1", "mais_de_1_ate_2", "mais_de_2_ate_5"], weights=[0.40, 0.40, 0.20]
        )[0]
    else:
        renda = random.choices(
            ["mais_de_1_ate_2", "mais_de_2_ate_5"], weights=[0.60, 0.40]
        )[0]

    cluster = "G4_baixa" if renda == "ate_1" else "G3_media_baixa"

    # Orientacao mais equilibrada, tendendo a direita
    orientacao = random.choices(
        ["direita", "centro_direita", "centro", "centro_esquerda", "esquerda"],
        weights=[0.35, 0.18, 0.12, 0.10, 0.25],
    )[0]

    # Posicao Bolsonaro coerente
    if orientacao in ["direita", "centro_direita"]:
        posicao = random.choices(
            ["apoiador_forte", "apoiador_moderado", "neutro"],
            weights=[0.40, 0.35, 0.25],
        )[0]
    elif orientacao in ["esquerda", "centro_esquerda"]:
        posicao = random.choices(
            ["critico_forte", "critico_moderado", "neutro"], weights=[0.45, 0.35, 0.20]
        )[0]
    else:
        posicao = random.choice(["neutro", "critico_moderado", "apoiador_moderado"])

    estado_civil = random.choices(
        ["casado(a)", "divorciado(a)", "solteiro(a)", "uniao_estavel", "viuvo(a)"],
        weights=[0.42, 0.18, 0.18, 0.15, 0.07],
    )[0]

    cor = random.choices(["branca", "parda", "preta"], weights=[0.42, 0.43, 0.15])[0]
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
        weights=[0.32, 0.45, 0.23],
    )[0]

    filhos = random.choices([0, 1, 2, 3, 4], weights=[0.12, 0.22, 0.38, 0.18, 0.10])[0]
    regiao = random.choices(list(REGIOES.keys()), weights=list(REGIOES.values()))[0]

    return {
        "id": id_eleitor,
        "nome": gerar_nome(genero),
        "idade": idade,
        "genero": genero,
        "cor_raca": cor,
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
        "posicao_bolsonaro": posicao,
        "interesse_politico": random.choice(["baixo", "medio", "alto"]),
        "tolerancia_nuance": random.choice(["baixa", "media", "alta"]),
        "estilo_decisao": random.choice(
            ["economico", "moral", "identitario", "pragmatico"]
        ),
        "valores": random.sample(
            ["Familia", "Trabalho", "Seguranca", "Saude", "Fe e religiao"], 3
        ),
        "preocupacoes": random.sample(
            ["Saude", "Seguranca publica", "Economia", "Desemprego"], 3
        ),
        "vieses_cognitivos": random.sample(
            ["confirmacao", "disponibilidade", "grupo"], 2
        ),
        "medos": random.sample(["Violencia", "Desemprego", "Doenca", "Inflacao"], 3),
        "fontes_informacao": random.sample(
            ["TV Globo / Jornal Nacional", "WhatsApp", "Radio", "Facebook"], 3
        ),
        "susceptibilidade_desinformacao": random.choice(["baixa", "media", "alta"]),
        "meio_transporte": random.choice(["onibus", "carro", "a_pe", "motocicleta"]),
        "tempo_deslocamento_trabalho": "nao_se_aplica"
        if ocupacao in ["aposentado", "desempregado"]
        else random.choice(["ate_15", "15_30", "30_45"]),
        "voto_facultativo": False,
        "conflito_identitario": random.random() < 0.15,
        "historia_resumida": f"Morador(a) de {regiao}. {profissao}.",
        "instrucao_comportamental": "Tom: direto. Experiencia de vida.",
        "faixa_etaria": faixa,
        "filhos_cat": "3_ou_mais"
        if filhos >= 3
        else f"{filhos}_filho"
        if filhos == 1
        else "sem_filhos"
        if filhos == 0
        else f"{filhos}_filhos",
    }


def main():
    print("=" * 60)
    print("AJUSTE ESTATISTICO - VERSAO 2")
    print("=" * 60)

    eleitores = carregar()
    total = len(eleitores)

    # Calcular distribuicoes atuais
    dist_idade = {}
    dist_orientacao = {}

    for e in eleitores:
        idade = e.get("idade", 30)
        if idade < 25:
            faixa = "16-24"
        elif idade < 35:
            faixa = "25-34"
        elif idade < 45:
            faixa = "35-44"
        elif idade < 55:
            faixa = "45-54"
        elif idade < 65:
            faixa = "55-64"
        else:
            faixa = "65+"
        e["faixa_etaria"] = faixa
        dist_idade[faixa] = dist_idade.get(faixa, 0) + 1

        ori = e.get("orientacao_politica", "centro")
        dist_orientacao[ori] = dist_orientacao.get(ori, 0) + 1

    print("\nDistribuicao atual:")
    print("Faixa Etaria:")
    for f in ["16-24", "25-34", "35-44", "45-54", "55-64", "65+"]:
        print(
            f"  {f}: {dist_idade.get(f, 0)} ({100 * dist_idade.get(f, 0) / total:.1f}%)"
        )

    print("\nOrientacao Politica:")
    for o in ["esquerda", "centro_esquerda", "centro", "centro_direita", "direita"]:
        print(
            f"  {o}: {dist_orientacao.get(o, 0)} ({100 * dist_orientacao.get(o, 0) / total:.1f}%)"
        )

    # Metas
    metas_idade = {
        "16-24": 145,
        "25-34": 200,
        "35-44": 205,
        "45-54": 180,
        "55-64": 120,
        "65+": 150,
    }
    metas_ori = {
        "esquerda": 150,
        "centro_esquerda": 70,
        "centro": 110,
        "centro_direita": 110,
        "direita": 290,
    }

    # Calcular necessidades
    excesso_16_24 = dist_idade.get("16-24", 0) - metas_idade["16-24"]
    falta_45_54 = metas_idade["45-54"] - dist_idade.get("45-54", 0)
    falta_55_64 = metas_idade["55-64"] - dist_idade.get("55-64", 0)

    print(f"\nExcesso 16-24: {excesso_16_24}")
    print(f"Falta 45-54: {falta_45_54}")
    print(f"Falta 55-64: {falta_55_64}")

    # Identificar jovens de esquerda para substituir (corrige idade E orientacao)
    jovens_esquerda = [
        e
        for e in eleitores
        if e.get("faixa_etaria") == "16-24"
        and e.get("orientacao_politica") in ["esquerda", "centro_esquerda"]
    ]
    outros_jovens = [
        e
        for e in eleitores
        if e.get("faixa_etaria") == "16-24"
        and e.get("orientacao_politica") not in ["esquerda", "centro_esquerda"]
    ]

    print(f"\nJovens de esquerda/centro-esquerda: {len(jovens_esquerda)}")

    substituicoes = 0

    # Substituir jovens de esquerda por 55-64
    para_substituir = jovens_esquerda[: min(falta_55_64, len(jovens_esquerda))]
    for eleitor in para_substituir:
        idx = eleitores.index(eleitor)
        eleitores[idx] = criar_eleitor_45_64(eleitor["id"], "55-64")
        substituicoes += 1

    restante_55_64 = falta_55_64 - len(para_substituir)

    # Se precisar mais 55-64, pegar outros jovens
    if restante_55_64 > 0:
        para_substituir = outros_jovens[:restante_55_64]
        for eleitor in para_substituir:
            idx = eleitores.index(eleitor)
            eleitores[idx] = criar_eleitor_45_64(eleitor["id"], "55-64")
            substituicoes += 1

    # Recalcular jovens restantes
    jovens = [e for e in eleitores if e.get("faixa_etaria") == "16-24"]
    excesso_atual = len(jovens) - metas_idade["16-24"]

    # Substituir mais jovens por 45-54
    if excesso_atual > 0 and falta_45_54 > 0:
        # Pegar jovens de esquerda restantes
        jovens_esq = [
            e
            for e in jovens
            if e.get("orientacao_politica") in ["esquerda", "centro_esquerda"]
        ]
        para_substituir = jovens_esq[: min(falta_45_54, excesso_atual, len(jovens_esq))]

        for eleitor in para_substituir:
            idx = eleitores.index(eleitor)
            eleitores[idx] = criar_eleitor_45_64(eleitor["id"], "45-54")
            substituicoes += 1

    # Ajustar orientacao dos restantes que tem excesso de esquerda
    excesso_esquerda = dist_orientacao.get("esquerda", 0) - metas_ori["esquerda"]
    excesso_centro_esq = (
        dist_orientacao.get("centro_esquerda", 0) - metas_ori["centro_esquerda"]
    )

    # Pegar eleitores de esquerda e mudar alguns para direita/centro-direita
    esquerdistas = [e for e in eleitores if e.get("orientacao_politica") == "esquerda"]
    ajustes = 0

    for e in esquerdistas[:excesso_esquerda]:
        e["orientacao_politica"] = random.choice(["direita", "centro_direita"])
        e["posicao_bolsonaro"] = random.choices(
            ["apoiador_forte", "apoiador_moderado", "neutro"],
            weights=[0.35, 0.40, 0.25],
        )[0]
        ajustes += 1

    centro_esq = [
        e for e in eleitores if e.get("orientacao_politica") == "centro_esquerda"
    ]
    for e in centro_esq[:excesso_centro_esq]:
        e["orientacao_politica"] = random.choice(["centro_direita", "direita"])
        e["posicao_bolsonaro"] = random.choices(
            ["apoiador_moderado", "neutro", "apoiador_forte"],
            weights=[0.40, 0.35, 0.25],
        )[0]
        ajustes += 1

    print(f"\nSubstituicoes de idade: {substituicoes}")
    print(f"Ajustes de orientacao: {ajustes}")

    # Salvar
    salvar(eleitores)

    # Relatorio final
    print("\n" + "=" * 60)
    print("NOVA DISTRIBUICAO")
    print("=" * 60)

    dist_idade = {}
    dist_orientacao = {}

    for e in eleitores:
        faixa = e.get("faixa_etaria", "25-34")
        dist_idade[faixa] = dist_idade.get(faixa, 0) + 1
        ori = e.get("orientacao_politica", "centro")
        dist_orientacao[ori] = dist_orientacao.get(ori, 0) + 1

    print("\nFaixa Etaria:")
    for f in ["16-24", "25-34", "35-44", "45-54", "55-64", "65+"]:
        qtd = dist_idade.get(f, 0)
        meta = metas_idade[f]
        print(
            f"  {f}: {qtd} ({100 * qtd / total:.1f}%) | Meta: {meta} | Desvio: {qtd - meta:+d}"
        )

    print("\nOrientacao Politica:")
    for o in ["esquerda", "centro_esquerda", "centro", "centro_direita", "direita"]:
        qtd = dist_orientacao.get(o, 0)
        meta = metas_ori[o]
        print(
            f"  {o}: {qtd} ({100 * qtd / total:.1f}%) | Meta: {meta} | Desvio: {qtd - meta:+d}"
        )

    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
