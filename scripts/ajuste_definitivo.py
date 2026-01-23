#!/usr/bin/env python3
"""
Ajuste Definitivo - Usar referencias oficiais exatas
"""

import json
import random

ARQUIVO = "agentes/banco-eleitores-df.json"
ARQUIVO_FRONTEND = "frontend/src/data/eleitores-df-1000.json"

# Referencias oficiais (de dados-referencia-oficiais.ts)
REFERENCIAS = {
    "genero": {"feminino": 522, "masculino": 478},
    "cor_raca": {
        "parda": 450,
        "branca": 406,
        "preta": 135,
        "amarela": 5,
        "indigena": 4,
    },
    "cluster_socioeconomico": {
        "G1_alta": 181,
        "G2_media_alta": 208,
        "G3_media_baixa": 329,
        "G4_baixa": 282,
    },
    "escolaridade": {
        "superior_completo_ou_pos": 370,
        "medio_completo_ou_sup_incompleto": 438,
        "fundamental_ou_sem_instrucao": 192,
    },
    "ocupacao_vinculo": {
        "clt": 375,
        "autonomo": 250,
        "servidor_publico": 85,
        "informal": 138,
        "aposentado": 105,
        "desempregado": 66,
        "estudante": 50,
        "empresario": 42,
    },
    "renda_salarios_minimos": {
        "ate_1": 285,
        "mais_de_1_ate_2": 258,
        "mais_de_2_ate_5": 242,
        "mais_de_5_ate_10": 125,
        "mais_de_10_ate_20": 60,
        "mais_de_20": 30,
    },
    "religiao": {
        "catolica": 497,
        "evangelica": 292,
        "sem_religiao": 113,
        "espirita": 33,
        "umbanda_candomble": 9,
        "outras": 56,
    },
    "estado_civil": {
        "solteiro(a)": 400,
        "casado(a)": 285,
        "uniao_estavel": 200,
        "divorciado(a)": 65,
        "viuvo(a)": 50,
    },
    "orientacao_politica": {
        "direita": 290,
        "esquerda": 150,
        "centro": 110,
        "centro_direita": 110,
        "centro_esquerda": 70,
    },
    "posicao_bolsonaro": {
        "critico_forte": 340,
        "critico_moderado": 200,
        "neutro": 200,
        "apoiador_forte": 150,
        "apoiador_moderado": 110,
    },
    "interesse_politico": {"baixo": 450, "medio": 350, "alto": 200},
    "tolerancia_nuance": {"baixa": 350, "media": 400, "alta": 250},
}


def carregar():
    with open(ARQUIVO, "r", encoding="utf-8") as f:
        return json.load(f)


def salvar(eleitores):
    with open(ARQUIVO, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)
    with open(ARQUIVO_FRONTEND, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)


def distribuir(eleitores, campo, metas):
    """Redistribui eleitores para atingir metas exatas"""
    # Calcular atual
    dist = {}
    for e in eleitores:
        v = e.get(campo, list(metas.keys())[0])
        dist[v] = dist.get(v, 0) + 1

    # Identificar excessos e faltas
    excessos = []
    faltas = []

    for cat, meta in metas.items():
        atual = dist.get(cat, 0)
        if atual > meta:
            excessos.append((cat, atual - meta))
        elif atual < meta:
            faltas.append((cat, meta - atual))

    # Criar pool de eleitores para redistribuir
    pool = []
    for cat, qtd in excessos:
        els = [e for e in eleitores if e.get(campo) == cat]
        random.shuffle(els)
        pool.extend(els[:qtd])

    # Redistribuir para categorias em falta
    idx = 0
    for cat, qtd in faltas:
        for _ in range(qtd):
            if idx >= len(pool):
                break
            pool[idx][campo] = cat
            idx += 1

    return idx


def ajustar_coerencia_completa(eleitores):
    """Ajusta coerencia e campos derivados"""
    for e in eleitores:
        idade = e.get("idade", 30)
        ocupacao = e.get("ocupacao_vinculo", "")
        escolaridade = e.get("escolaridade", "")
        renda = e.get("renda_salarios_minimos", "")
        cluster = e.get("cluster_socioeconomico", "")
        orientacao = e.get("orientacao_politica", "")
        posicao_bol = e.get("posicao_bolsonaro", "")

        # 1. Aposentado >= 55 anos
        if ocupacao == "aposentado" and idade < 55:
            e["idade"] = random.randint(60, 80)
            idade = e["idade"]

        # 2. Voto facultativo
        e["voto_facultativo"] = idade < 18 or idade >= 70

        # 3. Faixa etaria
        if idade < 25:
            e["faixa_etaria"] = "16-24"
        elif idade < 35:
            e["faixa_etaria"] = "25-34"
        elif idade < 45:
            e["faixa_etaria"] = "35-44"
        elif idade < 55:
            e["faixa_etaria"] = "45-54"
        elif idade < 65:
            e["faixa_etaria"] = "55-64"
        else:
            e["faixa_etaria"] = "65+"

        # 4. Idade < 22 sem superior
        if idade < 22 and "superior" in escolaridade:
            e["escolaridade"] = "medio_completo_ou_sup_incompleto"

        # 5. Servidor >= medio
        if (
            ocupacao == "servidor_publico"
            and escolaridade == "fundamental_ou_sem_instrucao"
        ):
            e["escolaridade"] = "medio_completo_ou_sup_incompleto"

        # 6. Cluster vs Renda coerencia
        if cluster == "G1_alta" and renda in ["ate_1", "mais_de_1_ate_2"]:
            e["renda_salarios_minimos"] = random.choice(
                ["mais_de_5_ate_10", "mais_de_10_ate_20"]
            )
        if cluster == "G4_baixa" and renda in ["mais_de_10_ate_20", "mais_de_20"]:
            e["renda_salarios_minimos"] = random.choice(["ate_1", "mais_de_1_ate_2"])

        # 7. Orientacao vs Bolsonaro
        if orientacao == "esquerda" and posicao_bol == "apoiador_forte":
            e["posicao_bolsonaro"] = random.choice(
                ["critico_forte", "critico_moderado"]
            )
        if orientacao == "direita" and posicao_bol == "critico_forte":
            if random.random() < 0.7:
                e["posicao_bolsonaro"] = random.choice(["apoiador_moderado", "neutro"])

        # 8. Campos derivados
        filhos = e.get("filhos", 0)
        if filhos == 0:
            e["filhos_cat"] = "sem_filhos"
        elif filhos == 1:
            e["filhos_cat"] = "1_filho"
        elif filhos == 2:
            e["filhos_cat"] = "2_filhos"
        else:
            e["filhos_cat"] = "3_ou_mais"

        cluster = e.get("cluster_socioeconomico", "G3_media_baixa")
        classes = {
            "G1_alta": "alta",
            "G2_media_alta": "media_alta",
            "G3_media_baixa": "media_baixa",
            "G4_baixa": "baixa",
        }
        e["classe_social"] = classes.get(cluster, "media_baixa")

        renda_map = {
            "ate_1": 1412,
            "mais_de_1_ate_2": 2118,
            "mais_de_2_ate_5": 4942,
            "mais_de_5_ate_10": 10590,
            "mais_de_10_ate_20": 21180,
            "mais_de_20": 35000,
        }
        renda = e.get("renda_salarios_minimos", "mais_de_1_ate_2")
        e["renda_mensal"] = renda_map.get(renda, 2118) + random.randint(-200, 200)


def main():
    print("=" * 70)
    print("AJUSTE DEFINITIVO COM REFERENCIAS OFICIAIS")
    print("=" * 70)

    eleitores = carregar()
    print(f"\nTotal: {len(eleitores)}")

    total_ajustes = 0

    # Ajustar cada variavel
    for campo, metas in REFERENCIAS.items():
        # Verificar se soma = 1000
        total_meta = sum(metas.values())
        if total_meta != 1000:
            # Ajustar a maior categoria
            diff = 1000 - total_meta
            max_cat = max(metas, key=metas.get)
            metas[max_cat] += diff

        ajustes = distribuir(eleitores, campo, metas)
        print(f"{campo}: {ajustes} ajustes")
        total_ajustes += ajustes

    # Ajustar coerencia
    print("\nAjustando coerencia...")
    ajustar_coerencia_completa(eleitores)

    # Salvar
    print("\nSalvando...")
    salvar(eleitores)

    print(f"\nTotal de ajustes: {total_ajustes}")

    # Verificar resultado
    print("\n" + "=" * 70)
    print("VERIFICACAO FINAL")
    print("=" * 70)

    for campo, metas in REFERENCIAS.items():
        dist = {}
        for e in eleitores:
            v = e.get(campo, "desconhecido")
            dist[v] = dist.get(v, 0) + 1

        max_desvio = 0
        for cat, meta in metas.items():
            atual = dist.get(cat, 0)
            desvio = abs(atual - meta)
            if desvio > max_desvio:
                max_desvio = desvio

        status = "OK" if max_desvio <= 5 else "!!" if max_desvio <= 15 else "XX"
        print(f"[{status}] {campo}: max desvio = {max_desvio}")

    print("=" * 70)


if __name__ == "__main__":
    main()
