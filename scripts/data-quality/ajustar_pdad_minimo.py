# Ajuste minimo para alinhar eleitores com PDAD e manter coerencia interna.
from __future__ import annotations

import importlib.util
import json
import math
import random
from collections import Counter, defaultdict
from pathlib import Path

random.seed(42)

BASE_DIR = Path(__file__).resolve().parent
BANCO_PATH = BASE_DIR / "agentes" / "banco-eleitores-df.json"
PDAD_PATH = BASE_DIR / "scripts" / "data-quality" / "comparacao_pdad_oficial.py"


def carregar_pdad():
    spec = importlib.util.spec_from_file_location("comparacao_pdad_oficial", PDAD_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Nao foi possivel carregar comparacao_pdad_oficial.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.PDAD_OFICIAL


def normalizar_ra(nome: str) -> str:
    normalizacoes = {
        "Ceilandia": "Ceilândia",
        "Paranoa": "Paranoá",
        "Itapoa": "Itapoã",
        "Brazlandia": "Brazlândia",
        "Guara": "Guará",
        "Varjao": "Varjão",
        "Nucleo Bandeirante": "Núcleo Bandeirante",
        "Aguas Claras": "Águas Claras",
        "Jardim Botanico": "Jardim Botânico",
        "Sao Sebastiao": "São Sebastião",
        "Sol Nascente/Pôr do Sol": "Sol Nascente/Por do Sol",
        "Sol Nascente/Por do Sol": "Sol Nascente/Por do Sol",
    }
    return normalizacoes.get(nome, nome)


def normalizar_ra_pdad(nome: str) -> str:
    normalizacoes = {
        "Ceilândia": "Ceilandia",
        "Águas Claras": "Aguas Claras",
        "Guará": "Guara",
        "Paranoá": "Paranoa",
        "Itapoã": "Itapoa",
        "Brazlândia": "Brazlandia",
        "Jardim Botânico": "Jardim Botanico",
        "São Sebastião": "Sao Sebastiao",
        "Núcleo Bandeirante": "Nucleo Bandeirante",
        "Candangolândia": "Candangolandia",
        "Varjão": "Varjao",
        "Sol Nascente/Por do Sol": "Sol Nascente/Por do Sol",
    }
    return normalizacoes.get(nome, nome)


def calc_faixa_etaria(idade: int) -> str:
    if idade <= 24:
        return "16-24"
    if idade <= 34:
        return "25-34"
    if idade <= 44:
        return "35-44"
    if idade <= 54:
        return "45-54"
    if idade <= 64:
        return "55-64"
    return "65+"


def calc_filhos_cat(filhos: int) -> str:
    if filhos <= 0:
        return "sem_filhos"
    if filhos == 1:
        return "1_filho"
    if filhos == 2:
        return "2_filhos"
    return "3_ou_mais"


def calc_voto_facultativo(idade: int) -> bool:
    return 16 <= idade <= 17 or idade >= 70


RENDA_MID = {
    "ate_1": 1502 * 0.75,
    "mais_de_1_ate_2": 1502 * 1.5,
    "mais_de_2_ate_5": 1502 * 3.5,
    "mais_de_5_ate_10": 1502 * 7.5,
    "mais_de_10_ate_20": 1502 * 15,
    "mais_de_20": 1502 * 25,
}

RENDA_ORDEM = [
    "ate_1",
    "mais_de_1_ate_2",
    "mais_de_2_ate_5",
    "mais_de_5_ate_10",
    "mais_de_10_ate_20",
    "mais_de_20",
]

RENDA_PARA_REAIS = {
    "ate_1": 706,
    "mais_de_1_ate_2": 2118,
    "mais_de_2_ate_5": 4942,
    "mais_de_5_ate_10": 10590,
    "mais_de_10_ate_20": 21180,
    "mais_de_20": 35300,
}

CLASSE_SOCIAL = {
    "G1_alta": "alta",
    "G2_media_alta": "media_alta",
    "G3_media_baixa": "media_baixa",
    "G4_baixa": "baixa",
}

RENDA_POR_CLUSTER = {
    "G1_alta": ["mais_de_5_ate_10", "mais_de_10_ate_20", "mais_de_20"],
    "G2_media_alta": ["mais_de_2_ate_5", "mais_de_5_ate_10", "mais_de_10_ate_20"],
    "G3_media_baixa": ["mais_de_1_ate_2", "mais_de_2_ate_5"],
    "G4_baixa": ["ate_1", "mais_de_1_ate_2"],
}

PROF_SUPERIOR = [
    "médico",
    "medico",
    "advogado",
    "engenheiro",
    "professor universitário",
    "professor universitario",
    "dentista",
    "arquiteto",
    "psicólogo",
    "psicologo",
    "farmacêutico",
    "farmaceutico",
]

PROF_MEDIA = [
    "Auxiliar Administrativo",
    "Tecnico(a) Administrativo(a)",
    "Vendedor(a)",
    "Assistente Administrativo",
    "Operador(a) de Caixa",
    "Recepcionista",
    "Tecnico(a) de Enfermagem",
]


def atualizar_derivados(e):
    e["faixa_etaria"] = calc_faixa_etaria(e.get("idade", 30))
    e["filhos_cat"] = calc_filhos_cat(e.get("filhos", 0))
    e["voto_facultativo"] = calc_voto_facultativo(e.get("idade", 30))
    renda_cat = e.get("renda_salarios_minimos")
    if renda_cat in RENDA_MID:
        e["renda_mensal"] = round(RENDA_MID[renda_cat] * random.uniform(0.9, 1.1), 2)
    cluster = e.get("cluster_socioeconomico")
    if cluster in CLASSE_SOCIAL:
        e["classe_social"] = CLASSE_SOCIAL[cluster]
    ocupacao = e.get("ocupacao_vinculo")
    if ocupacao in {"desempregado", "aposentado", "estudante"}:
        e["tempo_deslocamento_trabalho"] = "nao_se_aplica"
        e["tempo_deslocamento_minutos"] = 0


def ajustar_restricoes_idade(e):
    idade = e.get("idade", 30)
    estado_civil = e.get("estado_civil")
    ocupacao = e.get("ocupacao_vinculo")
    filhos = e.get("filhos", 0)

    if idade < 18:
        e["ocupacao_vinculo"] = "estudante"
        e["profissao"] = "Estudante"
        e["estado_civil"] = "solteiro(a)"
        e["filhos"] = 0
    elif idade < 20:
        e["filhos"] = min(filhos, 1)
        if estado_civil in {"divorciado(a)", "viuvo(a)"}:
            e["estado_civil"] = "solteiro(a)"
    elif idade < 22:
        if estado_civil in {"divorciado(a)", "viuvo(a)"}:
            e["estado_civil"] = "solteiro(a)"

    if idade < 45 and ocupacao == "aposentado":
        e["ocupacao_vinculo"] = "clt"
        if e.get("escolaridade") in {"superior_ou_pos", "superior_completo_ou_pos"}:
            e["profissao"] = "Analista Administrativo"
        else:
            e["profissao"] = random.choice(PROF_MEDIA)


def ajustar_profissao_escolaridade(e, alvo_superior: bool):
    escolaridade = e.get("escolaridade")
    if alvo_superior:
        if escolaridade not in {"superior_ou_pos", "superior_completo_ou_pos"}:
            e["escolaridade"] = "superior_ou_pos"
    else:
        if escolaridade in {"superior_ou_pos", "superior_completo_ou_pos"}:
            e["escolaridade"] = "medio_completo_ou_sup_incompleto"
            prof = e.get("profissao", "").lower()
            if any(p in prof for p in PROF_SUPERIOR):
                e["profissao"] = random.choice(PROF_MEDIA)


def renda_valor(cat: str) -> float:
    return RENDA_PARA_REAIS.get(cat, 706)


def ajustar_renda_cluster(e, cluster):
    validas = RENDA_POR_CLUSTER.get(cluster)
    if not validas:
        return
    if e.get("renda_salarios_minimos") not in validas:
        e["renda_salarios_minimos"] = random.choice(validas)


def ajustar_historia(e):
    primeiro = e.get("nome", "").split()[0]
    regiao = e.get("regiao_administrativa", "DF")
    profissao = e.get("profissao", "trabalhador(a)")
    estado_civil = e.get("estado_civil", "solteiro(a)")
    filhos = e.get("filhos", 0)
    filhos_texto = "Nao tem filhos." if filhos == 0 else f"Tem {filhos} filho(s)."
    e["historia_resumida"] = (
        f"{primeiro} mora em {regiao} e trabalha como {profissao}. "
        f"Estado civil: {estado_civil}. {filhos_texto}"
    )


def calcular_metricas(eleitores_ra):
    n = len(eleitores_ra)
    idades = [e.get("idade", 35) for e in eleitores_ra]
    idade_media = sum(idades) / n
    cor_counter = Counter(e.get("cor_raca", "N/A") for e in eleitores_ra)
    cor_branca_pct = 100 * cor_counter.get("branca", 0) / n
    cor_parda_pct = 100 * cor_counter.get("parda", 0) / n
    cor_preta_pct = 100 * cor_counter.get("preta", 0) / n
    superior = sum(
        1
        for e in eleitores_ra
        if e.get("escolaridade") in {"superior_ou_pos", "superior_completo_ou_pos"}
    )
    escolaridade_superior_pct = 100 * superior / n
    rendas = [
        renda_valor(e.get("renda_salarios_minimos", "ate_1")) for e in eleitores_ra
    ]
    renda_media = sum(rendas) / n
    clusters = Counter(e.get("cluster_socioeconomico", "N/A") for e in eleitores_ra)
    cluster_predominante = clusters.most_common(1)[0][0]
    return {
        "n": n,
        "idade_media": idade_media,
        "cor_branca_pct": cor_branca_pct,
        "cor_parda_pct": cor_parda_pct,
        "cor_preta_pct": cor_preta_pct,
        "escolaridade_superior_pct": escolaridade_superior_pct,
        "renda_media": renda_media,
        "cluster_predominante": cluster_predominante,
        "clusters": clusters,
    }


def ajustar_idade(ra_eleitores, alvo_idade, alterados, limite_pct=0.35):
    metricas = calcular_metricas(ra_eleitores)
    n = metricas["n"]
    diff = metricas["idade_media"] - alvo_idade
    if abs(diff) <= 5:
        return

    ajuste_total = diff * n
    candidatos = sorted(
        [e for e in ra_eleitores if e.get("idade", 30) >= 25],
        key=lambda x: x.get("idade", 30),
        reverse=diff > 0,
    )

    limite = math.ceil(n * limite_pct)
    alterados_local = 0

    for e in candidatos:
        if alterados_local >= limite:
            break
        idade = e.get("idade", 30)
        if diff > 0:
            if idade <= 30:
                continue
            nova_idade = random.randint(18, 34)
            reducao = idade - nova_idade
            if reducao <= 0:
                continue
            e["idade"] = nova_idade
            ajustar_restricoes_idade(e)
            atualizar_derivados(e)
            ajustar_historia(e)
            alterados.add(e["id"])
            ajuste_total -= reducao
            alterados_local += 1
            if ajuste_total <= 0:
                break
        else:
            if idade >= 55:
                continue
            nova_idade = random.randint(40, 55)
            aumento = nova_idade - idade
            if aumento <= 0:
                continue
            e["idade"] = nova_idade
            ajustar_restricoes_idade(e)
            atualizar_derivados(e)
            ajustar_historia(e)
            alterados.add(e["id"])
            ajuste_total += aumento
            alterados_local += 1
            if ajuste_total >= 0:
                break


def ajustar_cor(ra_eleitores, pdad, alterados):
    n = len(ra_eleitores)
    alvo_branca = round(n * pdad["cor_branca_pct"] / 100)
    alvo_parda = round(n * pdad["cor_parda_pct"] / 100)
    alvo_preta = max(0, n - alvo_branca - alvo_parda)

    contagem = Counter(e.get("cor_raca") for e in ra_eleitores)
    excesso = {
        "branca": contagem.get("branca", 0) - alvo_branca,
        "parda": contagem.get("parda", 0) - alvo_parda,
        "preta": contagem.get("preta", 0) - alvo_preta,
    }

    if abs(excesso.get("branca", 0)) <= 12 * n / 100:
        return

    def mudar(origem, destino, quantidade):
        candidatos = [e for e in ra_eleitores if e.get("cor_raca") == origem]
        random.shuffle(candidatos)
        for e in candidatos[:quantidade]:
            e["cor_raca"] = destino
            ajustar_historia(e)
            alterados.add(e["id"])

    if excesso["branca"] > 0:
        deficit_parda = max(0, alvo_parda - contagem.get("parda", 0))
        deficit_preta = max(0, alvo_preta - contagem.get("preta", 0))
        mover_para_parda = min(excesso["branca"], deficit_parda) if deficit_parda else 0
        mover_para_preta = (
            min(excesso["branca"] - mover_para_parda, deficit_preta)
            if deficit_preta
            else 0
        )
        if mover_para_parda:
            mudar("branca", "parda", mover_para_parda)
        if mover_para_preta:
            mudar("branca", "preta", mover_para_preta)
    elif excesso["branca"] < 0:
        deficit_branca = abs(excesso["branca"])
        candidatos = [
            e for e in ra_eleitores if e.get("cor_raca") in {"parda", "preta"}
        ]
        random.shuffle(candidatos)
        for e in candidatos[:deficit_branca]:
            e["cor_raca"] = "branca"
            ajustar_historia(e)
            alterados.add(e["id"])


def ajustar_escolaridade(ra_eleitores, pdad, alterados):
    n = len(ra_eleitores)
    alvo_superior = round(n * pdad["escolaridade_superior_pct"] / 100)
    atuais = [
        e
        for e in ra_eleitores
        if e.get("escolaridade") in {"superior_ou_pos", "superior_completo_ou_pos"}
    ]
    diff = len(atuais) - alvo_superior
    if abs(diff) <= math.ceil(n * 0.12):
        return
    if diff > 0:
        candidatos = atuais
        random.shuffle(candidatos)
        for e in candidatos[:diff]:
            ajustar_profissao_escolaridade(e, False)
            atualizar_derivados(e)
            ajustar_historia(e)
            alterados.add(e["id"])
    else:
        candidatos = [
            e
            for e in ra_eleitores
            if e.get("escolaridade")
            not in {"superior_ou_pos", "superior_completo_ou_pos"}
        ]
        random.shuffle(candidatos)
        for e in candidatos[: abs(diff)]:
            ajustar_profissao_escolaridade(e, True)
            atualizar_derivados(e)
            ajustar_historia(e)
            alterados.add(e["id"])


def ajustar_renda(ra_eleitores, pdad, alterados):
    n = len(ra_eleitores)
    renda_media = (
        sum(renda_valor(e.get("renda_salarios_minimos", "ate_1")) for e in ra_eleitores)
        / n
    )
    alvo = pdad["renda_domiciliar_media"]
    diff_pct = (renda_media - alvo) / alvo
    if abs(diff_pct) <= 0.4:
        return

    def subir_categoria(cat):
        idx = RENDA_ORDEM.index(cat)
        return RENDA_ORDEM[min(idx + 1, len(RENDA_ORDEM) - 1)]

    def descer_categoria(cat):
        idx = RENDA_ORDEM.index(cat)
        return RENDA_ORDEM[max(idx - 1, 0)]

    candidatos = sorted(
        ra_eleitores,
        key=lambda e: renda_valor(e.get("renda_salarios_minimos", "ate_1")),
        reverse=diff_pct > 0,
    )

    alvo_total = alvo * n
    ajuste_total = renda_media * n - alvo_total

    for e in candidatos:
        renda_cat = e.get("renda_salarios_minimos", "ate_1")
        if diff_pct > 0:
            nova_cat = descer_categoria(renda_cat)
            if nova_cat == renda_cat:
                continue
            reducao = renda_valor(renda_cat) - renda_valor(nova_cat)
            e["renda_salarios_minimos"] = nova_cat
            ajustar_renda_cluster(e, e.get("cluster_socioeconomico"))
            atualizar_derivados(e)
            ajustar_historia(e)
            alterados.add(e["id"])
            ajuste_total -= reducao
            if ajuste_total <= 0:
                break
        else:
            nova_cat = subir_categoria(renda_cat)
            if nova_cat == renda_cat:
                continue
            aumento = renda_valor(nova_cat) - renda_valor(renda_cat)
            e["renda_salarios_minimos"] = nova_cat
            ajustar_renda_cluster(e, e.get("cluster_socioeconomico"))
            atualizar_derivados(e)
            ajustar_historia(e)
            alterados.add(e["id"])
            ajuste_total += aumento
            if ajuste_total >= 0:
                break


def ajustar_cluster(ra_eleitores, pdad, alterados):
    clusters = Counter(e.get("cluster_socioeconomico") for e in ra_eleitores)
    predominante = clusters.most_common(1)[0][0]
    alvo = pdad["grupo_renda"]
    if predominante == alvo:
        return
    atual_alvo = clusters.get(alvo, 0)
    atual_pred = clusters.get(predominante, 0)
    necessidade = atual_pred - atual_alvo + 1
    if necessidade <= 0:
        return
    candidatos = [
        e for e in ra_eleitores if e.get("cluster_socioeconomico") == predominante
    ]
    random.shuffle(candidatos)
    for e in candidatos[:necessidade]:
        e["cluster_socioeconomico"] = alvo
        ajustar_renda_cluster(e, alvo)
        atualizar_derivados(e)
        ajustar_historia(e)
        alterados.add(e["id"])


def ajustar_ra_pequena(ra_eleitores, pdad, alterados):
    n = len(ra_eleitores)
    if n > 5:
        return
    alvo_idade = pdad["idade_media"]
    alvo_branca = round(n * pdad["cor_branca_pct"] / 100)
    alvo_parda = round(n * pdad["cor_parda_pct"] / 100)
    alvo_preta = max(0, n - alvo_branca - alvo_parda)
    cores = ["branca"] * alvo_branca + ["parda"] * alvo_parda + ["preta"] * alvo_preta
    while len(cores) < n:
        cores.append(random.choice(["parda", "preta"]))
    random.shuffle(cores)

    alvo_superior = round(n * pdad["escolaridade_superior_pct"] / 100)
    escolaridades = ["superior_ou_pos"] * alvo_superior
    while len(escolaridades) < n:
        escolaridades.append("medio_completo_ou_sup_incompleto")
    random.shuffle(escolaridades)

    for idx, e in enumerate(ra_eleitores):
        e["idade"] = max(
            18, min(70, int(random.uniform(alvo_idade - 3, alvo_idade + 3)))
        )
        e["cor_raca"] = cores[idx]
        e["escolaridade"] = escolaridades[idx]
        e["cluster_socioeconomico"] = pdad["grupo_renda"]
        ajustar_renda_cluster(e, pdad["grupo_renda"])
        ajustar_restricoes_idade(e)
        atualizar_derivados(e)
        ajustar_historia(e)
        alterados.add(e["id"])


def main():
    pdad = carregar_pdad()
    with open(BANCO_PATH, "r", encoding="utf-8") as f:
        eleitores = json.load(f)

    alterados = set()
    por_ra = defaultdict(list)

    for e in eleitores:
        e["regiao_administrativa"] = normalizar_ra(e.get("regiao_administrativa", ""))
        por_ra[e["regiao_administrativa"]].append(e)

    limite_idade_ra = {
        "Águas Claras": 0.6,
        "Guará": 0.6,
        "Ceilândia": 0.5,
        "Paranoá": 0.5,
        "São Sebastião": 0.5,
        "Itapoã": 0.6,
        "Varjão": 0.6,
        "Jardim Botânico": 0.6,
    }

    for ra, lista in por_ra.items():
        pdad_ra = pdad.get(normalizar_ra_pdad(ra))
        if not pdad_ra:
            continue
        ajustar_ra_pequena(lista, pdad_ra, alterados)
        ajustar_cluster(lista, pdad_ra, alterados)
        limite_pct = limite_idade_ra.get(ra, 0.35)
        ajustar_idade(lista, pdad_ra["idade_media"], alterados, limite_pct=limite_pct)
        ajustar_cor(lista, pdad_ra, alterados)
        ajustar_escolaridade(lista, pdad_ra, alterados)
        ajustar_renda(lista, pdad_ra, alterados)

    for e in eleitores:
        if e["id"] in alterados:
            atualizar_derivados(e)

    with open(BANCO_PATH, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print(f"Eleitores ajustados: {len(alterados)}")


if __name__ == "__main__":
    main()
