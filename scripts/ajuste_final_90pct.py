#!/usr/bin/env python3
"""
Ajuste Final para >90% de Conformidade
Corrige todas as variaveis para aproximar das metas oficiais
Respeita regras de coerencia interna
"""

import json
import random
from copy import deepcopy

ARQUIVO = "agentes/banco-eleitores-df.json"
ARQUIVO_FRONTEND = "frontend/src/data/eleitores-df-1000.json"

# Metas oficiais
METAS = {
    "faixa_etaria": {
        "16-24": 145,
        "25-34": 200,
        "35-44": 205,
        "45-54": 180,
        "55-64": 120,
        "65+": 150,
    },
    "cor_raca": {
        "branca": 406,
        "parda": 450,
        "preta": 135,
        "amarela": 5,
        "indigena": 4,
    },
    "ocupacao_vinculo": {
        "clt": 338,
        "servidor_publico": 76,
        "autonomo": 225,
        "empresario": 38,
        "informal": 124,
        "desempregado": 59,
        "aposentado": 95,
        "estudante": 45,
    },
    "renda_salarios_minimos": {
        "ate_1": 285,
        "mais_de_1_ate_2": 258,
        "mais_de_2_ate_5": 242,
        "mais_de_5_ate_10": 125,
        "mais_de_10_ate_20": 60,
        "mais_de_20": 30,
    },
    "estado_civil": {
        "solteiro(a)": 400,
        "casado(a)": 285,
        "uniao_estavel": 200,
        "divorciado(a)": 65,
        "viuvo(a)": 50,
    },
    "orientacao_politica": {
        "esquerda": 205,
        "centro_esquerda": 96,
        "centro": 151,
        "centro_direita": 151,
        "direita": 397,
    },
    "religiao": {
        "catolica": 497,
        "evangelica": 292,
        "sem_religiao": 113,
        "espirita": 33,
        "umbanda_candomble": 9,
        "outras_religioes": 56,
    },
}


def carregar():
    with open(ARQUIVO, "r", encoding="utf-8") as f:
        return json.load(f)


def salvar(eleitores):
    with open(ARQUIVO, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)
    with open(ARQUIVO_FRONTEND, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)


def calcular_distribuicao(eleitores, campo):
    dist = {}
    for e in eleitores:
        v = normalizar_valor(campo, e.get(campo, "desconhecido"))
        dist[v] = dist.get(v, 0) + 1
    return dist


def normalizar_valor(campo, valor):
    if campo == "religiao":
        if valor in ["outras", "outras_religioes"]:
            return "outras_religioes"
    return valor


def calcular_faixa_etaria(idade):
    if idade < 25:
        return "16-24"
    if idade < 35:
        return "25-34"
    if idade < 45:
        return "35-44"
    if idade < 55:
        return "45-54"
    if idade < 65:
        return "55-64"
    return "65+"


def idade_aleatoria_por_faixa(faixa):
    if faixa == "16-24":
        return random.randint(16, 24)
    if faixa == "25-34":
        return random.randint(25, 34)
    if faixa == "35-44":
        return random.randint(35, 44)
    if faixa == "45-54":
        return random.randint(45, 54)
    if faixa == "55-64":
        return random.randint(55, 64)
    if faixa == "65+":
        return random.randint(65, 85)
    return random.randint(25, 44)


def ajustar_faixa_etaria(eleitores, metas):
    dist_atual = {}
    for e in eleitores:
        faixa = e.get("faixa_etaria") or calcular_faixa_etaria(e.get("idade", 30))
        dist_atual[faixa] = dist_atual.get(faixa, 0) + 1

    excessos = {}
    faltas = {}
    for cat, meta in metas.items():
        atual = dist_atual.get(cat, 0)
        diff = atual - meta
        if diff > 0:
            excessos[cat] = diff
        elif diff < 0:
            faltas[cat] = -diff

    print(f"\n--- Ajustando faixa_etaria ---")
    print(f"  Excessos: {excessos}")
    print(f"  Faltas: {faltas}")

    ajustes = 0
    ordem_excesso = sorted(excessos.items(), key=lambda x: x[1], reverse=True)

    for cat_excesso, qtd_excesso in ordem_excesso:
        candidatos = []
        for e in eleitores:
            faixa = e.get("faixa_etaria") or calcular_faixa_etaria(e.get("idade", 30))
            if faixa != cat_excesso:
                continue
            if (
                cat_excesso in ["16-24", "25-34"]
                and e.get("ocupacao_vinculo") == "aposentado"
            ):
                continue
            candidatos.append(e)
        random.shuffle(candidatos)

        movidos = 0
        for e in candidatos:
            if movidos >= qtd_excesso:
                break
            if not faltas:
                break
            cat_destino = max(faltas, key=lambda k: faltas.get(k, 0))
            if faltas[cat_destino] <= 0:
                break

            e["idade"] = idade_aleatoria_por_faixa(cat_destino)
            e["faixa_etaria"] = cat_destino

            if cat_destino == "65+" and e.get("estado_civil") == "solteiro(a)":
                e["estado_civil"] = random.choice(["casado(a)", "viuvo(a)"])
            if cat_destino == "16-24" and e.get("idade", 18) < 20:
                e["estado_civil"] = "solteiro(a)"
                e["filhos"] = 0

            faltas[cat_destino] -= 1
            movidos += 1
            ajustes += 1

    print(f"  Ajustes realizados: {ajustes}")
    return ajustes


def ajustar_campos_derivados(eleitor):
    """Ajusta campos derivados baseado nos campos principais"""
    idade = eleitor.get("idade", 30)

    # Faixa etaria
    eleitor["faixa_etaria"] = calcular_faixa_etaria(idade)

    # Voto facultativo
    eleitor["voto_facultativo"] = idade < 18 or idade >= 70

    # Filhos categoria
    filhos = eleitor.get("filhos", 0)
    if filhos == 0:
        eleitor["filhos_cat"] = "sem_filhos"
    elif filhos == 1:
        eleitor["filhos_cat"] = "1_filho"
    elif filhos == 2:
        eleitor["filhos_cat"] = "2_filhos"
    else:
        eleitor["filhos_cat"] = "3_ou_mais"

    # Classe social baseada no cluster
    cluster = eleitor.get("cluster_socioeconomico", "G3_media_baixa")
    classes = {
        "G1_alta": "alta",
        "G2_media_alta": "media_alta",
        "G3_media_baixa": "media_baixa",
        "G4_baixa": "baixa",
    }
    eleitor["classe_social"] = classes.get(cluster, "media_baixa")

    # Renda mensal aproximada
    renda_map = {
        "ate_1": 1412,
        "mais_de_1_ate_2": 2118,
        "mais_de_2_ate_5": 4942,
        "mais_de_5_ate_10": 10590,
        "mais_de_10_ate_20": 21180,
        "mais_de_20": 35000,
    }
    renda = eleitor.get("renda_salarios_minimos", "mais_de_1_ate_2")
    eleitor["renda_mensal"] = renda_map.get(renda, 2118) + random.randint(-200, 200)


def ajustar_coerencia(eleitor):
    """Ajusta eleitor para garantir coerencia interna"""
    idade = eleitor.get("idade", 30)
    ocupacao = eleitor.get("ocupacao_vinculo", "")
    escolaridade = eleitor.get("escolaridade", "")
    renda = eleitor.get("renda_salarios_minimos", "")
    cluster = eleitor.get("cluster_socioeconomico", "")
    orientacao = eleitor.get("orientacao_politica", "")
    posicao_bol = eleitor.get("posicao_bolsonaro", "")

    # Aposentado deve ter idade >= 55
    if ocupacao == "aposentado" and idade < 55:
        eleitor["idade"] = random.randint(60, 80)

    # Servidor publico deve ter pelo menos medio completo
    if (
        ocupacao == "servidor_publico"
        and escolaridade == "fundamental_ou_sem_instrucao"
    ):
        eleitor["escolaridade"] = "medio_completo_ou_sup_incompleto"

    # Idade < 22 nao pode ter superior completo
    if idade < 22 and "superior" in escolaridade:
        eleitor["escolaridade"] = "medio_completo_ou_sup_incompleto"

    # G1_alta deve ter renda > 5 SM
    if cluster == "G1_alta" and renda in [
        "ate_1",
        "mais_de_1_ate_2",
        "mais_de_2_ate_5",
    ]:
        eleitor["renda_salarios_minimos"] = random.choice(
            ["mais_de_5_ate_10", "mais_de_10_ate_20"]
        )

    # G4_baixa deve ter renda < 3 SM
    if cluster == "G4_baixa" and renda in [
        "mais_de_5_ate_10",
        "mais_de_10_ate_20",
        "mais_de_20",
    ]:
        eleitor["renda_salarios_minimos"] = random.choice(["ate_1", "mais_de_1_ate_2"])

    # Esquerda nao deve ser apoiador forte de Bolsonaro
    if orientacao == "esquerda" and posicao_bol == "apoiador_forte":
        eleitor["posicao_bolsonaro"] = random.choice(
            ["critico_forte", "critico_moderado"]
        )

    # Direita nao deve ser critico forte de Bolsonaro (na maioria dos casos)
    if orientacao == "direita" and posicao_bol == "critico_forte":
        if random.random() < 0.7:  # 70% ajusta
            eleitor["posicao_bolsonaro"] = random.choice(
                ["apoiador_moderado", "neutro"]
            )


def ajustar_tempo_deslocamento(eleitores):
    """Reequilibra tempo de deslocamento para ocupados"""
    ocupacoes_ativas = {
        "clt",
        "servidor_publico",
        "autonomo",
        "empresario",
        "informal",
    }

    mapeamento = {
        "mais_60": "60_75",
        "60+": "60_75",
        "30min_1h": "45_60",
        "menos_30min": "15_30",
    }

    faixas = {
        "ate_15": (5, 15),
        "15_30": (16, 30),
        "30_45": (31, 45),
        "45_60": (46, 60),
        "60_75": (61, 90),
    }

    pesos = [
        ("ate_15", 15),
        ("15_30", 25),
        ("30_45", 22),
        ("45_60", 18),
        ("60_75", 13),
    ]
    soma_pesos = sum(p for _, p in pesos)

    ativos = [e for e in eleitores if e.get("ocupacao_vinculo") in ocupacoes_ativas]
    total = len(ativos) or 1
    alvo_nao_se_aplica = round(total * 0.07)

    candidatos_nao = []

    for e in eleitores:
        if e.get("ocupacao_vinculo") not in ocupacoes_ativas:
            e["tempo_deslocamento_trabalho"] = "nao_se_aplica"
            e["tempo_deslocamento_minutos"] = 0
            continue

        valor = e.get("tempo_deslocamento_trabalho", "nao_se_aplica")
        valor = mapeamento.get(valor, valor)
        e["tempo_deslocamento_trabalho"] = valor

        if valor == "nao_se_aplica":
            candidatos_nao.append(e)
        elif valor in faixas:
            e["tempo_deslocamento_minutos"] = random.randint(*faixas[valor])
        else:
            e["tempo_deslocamento_trabalho"] = "15_30"
            e["tempo_deslocamento_minutos"] = random.randint(*faixas["15_30"])

    excesso = max(0, len(candidatos_nao) - alvo_nao_se_aplica)
    random.shuffle(candidatos_nao)

    for e in candidatos_nao[:excesso]:
        sorteio = random.uniform(0, soma_pesos)
        acumulado = 0
        categoria = "15_30"
        for cat, peso in pesos:
            acumulado += peso
            if sorteio <= acumulado:
                categoria = cat
                break
        e["tempo_deslocamento_trabalho"] = categoria
        e["tempo_deslocamento_minutos"] = random.randint(*faixas[categoria])


def ajustar_variavel(eleitores, campo, metas):
    """Ajusta uma variavel para aproximar das metas"""
    dist_atual = calcular_distribuicao(eleitores, campo)
    total = len(eleitores)

    print(f"\n--- Ajustando {campo} ---")

    # Calcular excessos e faltas
    excessos = {}
    faltas = {}

    for cat, meta in metas.items():
        atual = dist_atual.get(cat, 0)
        diff = atual - meta
        if diff > 0:
            excessos[cat] = diff
        elif diff < 0:
            faltas[cat] = -diff

    print(f"  Excessos: {excessos}")
    print(f"  Faltas: {faltas}")

    ajustes = 0

    # Para cada categoria em excesso, mover para categorias em falta
    for cat_excesso, qtd_excesso in excessos.items():
        # Pegar eleitores dessa categoria
        eleitores_cat = [e for e in eleitores if e.get(campo) == cat_excesso]
        random.shuffle(eleitores_cat)

        movidos = 0
        for e in eleitores_cat:
            if movidos >= qtd_excesso:
                break

            # Encontrar categoria destino com maior falta
            if not faltas:
                break

            cat_destino = max(faltas, key=lambda k: faltas.get(k, 0))
            if faltas[cat_destino] <= 0:
                break

            # Mover eleitor
            e[campo] = cat_destino

            # Ajustar campos relacionados se necessario
            if campo == "ocupacao_vinculo":
                ajustar_ocupacao_relacionados(e, cat_destino)
            elif campo == "cor_raca":
                pass  # Nao precisa ajustar nada
            elif campo == "estado_civil":
                ajustar_estado_civil_relacionados(e, cat_destino)
            elif campo == "renda_salarios_minimos":
                ajustar_renda_relacionados(e, cat_destino)
            elif campo == "orientacao_politica":
                ajustar_orientacao_relacionados(e, cat_destino)
            elif campo == "religiao":
                pass

            faltas[cat_destino] -= 1
            movidos += 1
            ajustes += 1

    print(f"  Ajustes realizados: {ajustes}")
    return ajustes


def ajustar_ocupacao_relacionados(eleitor, nova_ocupacao):
    """Ajusta campos relacionados quando muda ocupacao"""
    profissoes = {
        "clt": [
            "Vendedor(a)",
            "Atendente",
            "Auxiliar Administrativo",
            "Tecnico(a)",
            "Analista",
        ],
        "servidor_publico": [
            "Servidor(a) do GDF",
            "Tecnico Judiciario",
            "Professor(a) SEEDF",
        ],
        "autonomo": [
            "Autonomo(a)",
            "Pedreiro",
            "Eletricista",
            "Cabeleireiro(a)",
            "Consultor(a)",
        ],
        "empresario": ["Empresario(a)", "Comerciante", "Empreendedor(a)"],
        "informal": ["Diarista", "Ambulante", "Feirante", "Catador(a)"],
        "desempregado": ["Desempregado(a)"],
        "aposentado": ["Aposentado(a)", "Pensionista"],
        "estudante": ["Estudante", "Universitario(a)"],
    }

    eleitor["ocupacao_vinculo"] = nova_ocupacao
    eleitor["profissao"] = random.choice(
        profissoes.get(nova_ocupacao, ["Trabalhador(a)"])
    )

    # Ajustar idade se necessario
    if nova_ocupacao == "aposentado" and eleitor.get("idade", 0) < 55:
        eleitor["idade"] = random.randint(60, 78)
    if nova_ocupacao == "estudante" and eleitor.get("idade", 0) > 30:
        eleitor["idade"] = random.randint(16, 25)


def ajustar_estado_civil_relacionados(eleitor, novo_estado):
    """Ajusta campos relacionados quando muda estado civil"""
    idade = eleitor.get("idade", 30)

    eleitor["estado_civil"] = novo_estado

    # Viuvo geralmente mais velho
    if novo_estado == "viuvo(a)" and idade < 50:
        eleitor["idade"] = random.randint(55, 80)

    # Solteiro geralmente mais jovem ou ajustar filhos
    if novo_estado == "solteiro(a)":
        if eleitor.get("filhos", 0) > 2 and idade < 30:
            eleitor["filhos"] = random.randint(0, 1)


def ajustar_renda_relacionados(eleitor, nova_renda):
    """Ajusta campos relacionados quando muda renda"""
    eleitor["renda_salarios_minimos"] = nova_renda

    # Ajustar cluster
    if nova_renda in ["mais_de_10_ate_20", "mais_de_20"]:
        eleitor["cluster_socioeconomico"] = "G1_alta"
    elif nova_renda in ["mais_de_5_ate_10"]:
        eleitor["cluster_socioeconomico"] = random.choice(["G1_alta", "G2_media_alta"])
    elif nova_renda in ["mais_de_2_ate_5"]:
        eleitor["cluster_socioeconomico"] = random.choice(
            ["G2_media_alta", "G3_media_baixa"]
        )
    elif nova_renda in ["mais_de_1_ate_2"]:
        eleitor["cluster_socioeconomico"] = random.choice(
            ["G3_media_baixa", "G4_baixa"]
        )
    else:
        eleitor["cluster_socioeconomico"] = "G4_baixa"


def ajustar_orientacao_relacionados(eleitor, nova_orientacao):
    """Ajusta posicao Bolsonaro baseado na orientacao"""
    eleitor["orientacao_politica"] = nova_orientacao

    if nova_orientacao in ["esquerda", "centro_esquerda"]:
        eleitor["posicao_bolsonaro"] = random.choices(
            ["critico_forte", "critico_moderado", "neutro"], weights=[0.50, 0.35, 0.15]
        )[0]
    elif nova_orientacao in ["direita", "centro_direita"]:
        eleitor["posicao_bolsonaro"] = random.choices(
            ["apoiador_forte", "apoiador_moderado", "neutro"],
            weights=[0.40, 0.40, 0.20],
        )[0]
    else:  # centro
        eleitor["posicao_bolsonaro"] = random.choices(
            ["neutro", "critico_moderado", "apoiador_moderado"],
            weights=[0.40, 0.30, 0.30],
        )[0]


def main():
    print("=" * 70)
    print("AJUSTE FINAL PARA >90% DE CONFORMIDADE")
    print("=" * 70)

    eleitores = carregar()
    total = len(eleitores)
    print(f"\nTotal de eleitores: {total}")

    total_ajustes = 0

    for e in eleitores:
        if e.get("religiao") == "outras":
            e["religiao"] = "outras_religioes"

    # 1. Ajustar cor/raca
    total_ajustes += ajustar_variavel(eleitores, "cor_raca", METAS["cor_raca"])

    # 2. Ajustar renda
    total_ajustes += ajustar_variavel(
        eleitores, "renda_salarios_minimos", METAS["renda_salarios_minimos"]
    )

    # 3. Ajustar ocupacao
    total_ajustes += ajustar_variavel(
        eleitores, "ocupacao_vinculo", METAS["ocupacao_vinculo"]
    )

    # 4. Ajustar faixa etaria
    total_ajustes += ajustar_faixa_etaria(eleitores, METAS["faixa_etaria"])

    # 5. Ajustar estado civil
    total_ajustes += ajustar_variavel(eleitores, "estado_civil", METAS["estado_civil"])

    # 6. Ajustar orientacao politica
    total_ajustes += ajustar_variavel(
        eleitores, "orientacao_politica", METAS["orientacao_politica"]
    )

    # 7. Ajustar religiao
    total_ajustes += ajustar_variavel(eleitores, "religiao", METAS["religiao"])

    # 8. Garantir coerencia e atualizar campos derivados
    print("\n--- Verificando coerencia e atualizando campos derivados ---")
    for e in eleitores:
        ajustar_coerencia(e)
        ajustar_campos_derivados(e)

    # 9. Reequilibrar tempo de deslocamento
    ajustar_tempo_deslocamento(eleitores)

    # Salvar
    print("\nSalvando...")
    salvar(eleitores)

    # Relatorio final
    print("\n" + "=" * 70)
    print("DISTRIBUICAO FINAL")
    print("=" * 70)

    for campo, metas in METAS.items():
        dist = calcular_distribuicao(eleitores, campo)
        print(f"\n{campo}:")
        for cat in sorted(metas.keys()):
            atual = dist.get(cat, 0)
            meta = metas[cat]
            desvio = atual - meta
            pct = 100 * atual / total
            pct_meta = 100 * meta / total
            status = "OK" if abs(desvio) <= 10 else "!!"
            print(
                f"  [{status}] {cat}: {atual} ({pct:.1f}%) | Meta: {meta} ({pct_meta:.1f}%) | Desvio: {desvio:+d}"
            )

    print(f"\n\nTotal de ajustes: {total_ajustes}")
    print("=" * 70)


if __name__ == "__main__":
    main()
