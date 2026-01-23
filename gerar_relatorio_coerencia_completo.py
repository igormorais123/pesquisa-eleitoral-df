import json
import os
import unicodedata
from collections import Counter
from datetime import datetime


BASE_DIR = os.getcwd()
DATA_ELEITORES = os.path.join(BASE_DIR, "agentes", "banco-eleitores-df.json")
DATA_DEPUTADOS = os.path.join(BASE_DIR, "agentes", "banco-deputados-federais.json")
DATA_SENADORES = os.path.join(BASE_DIR, "agentes", "banco-senadores.json")

DATA_RELATORIOS_DIR = os.path.join(BASE_DIR, "resultados", "relatorios")
os.makedirs(DATA_RELATORIOS_DIR, exist_ok=True)

DATA_ANALISE = datetime(2026, 1, 23, 0, 0, 0)
DATA_ANALISE_ISO = DATA_ANALISE.isoformat()

SEVERIDADES = ["grave", "medio", "leve"]


def normalizar_texto(texto):
    if not texto:
        return ""
    normalizado = unicodedata.normalize("NFKD", str(texto))
    return (
        "".join(c for c in normalizado if not unicodedata.combining(c)).lower().strip()
    )


def adicionar_issue(issues, por_pessoa, pessoa_id, nome, categoria, severidade, erro):
    issue = {
        "id": pessoa_id,
        "nome": nome,
        "categoria": categoria,
        "severidade": severidade,
        "erro": erro,
    }
    issues.append(issue)
    entry = por_pessoa.setdefault(
        pessoa_id, {"id": pessoa_id, "nome": nome, "erros": []}
    )
    entry["erros"].append(issue)


def resumo_dataset(total, issues, por_pessoa):
    severidade_counts = Counter(issue["severidade"] for issue in issues)
    categoria_counts = Counter(issue["categoria"] for issue in issues)

    penalidade = (
        severidade_counts.get("grave", 0) * 3
        + severidade_counts.get("medio", 0) * 1.5
        + severidade_counts.get("leve", 0) * 0.5
    )
    indice = 100.0
    if total:
        indice = max(0.0, 100 - (penalidade / total * 10))

    top_pessoas = sorted(
        por_pessoa.values(), key=lambda p: (-len(p["erros"]), p["id"])
    )[:10]
    top_formatado = []
    for pessoa in top_pessoas:
        severidades = Counter(issue["severidade"] for issue in pessoa["erros"])
        categorias = Counter(issue["categoria"] for issue in pessoa["erros"])
        top_formatado.append(
            {
                "id": pessoa["id"],
                "nome": pessoa["nome"],
                "total_erros": len(pessoa["erros"]),
                "por_severidade": {k: severidades.get(k, 0) for k in SEVERIDADES},
                "categorias_top": [
                    f"{cat} ({count})" for cat, count in categorias.most_common(3)
                ],
            }
        )

    return {
        "total": total,
        "total_inconsistencias": len(issues),
        "individuos_afetados": len(por_pessoa),
        "por_severidade": {k: severidade_counts.get(k, 0) for k in SEVERIDADES},
        "por_categoria": dict(
            sorted(categoria_counts.items(), key=lambda x: (-x[1], x[0]))
        ),
        "indice_qualidade": round(indice, 1),
        "top_incoerencias": top_formatado,
    }


with open(DATA_ELEITORES, "r", encoding="utf-8") as f:
    eleitores = json.load(f)

issues_eleitores = []
por_eleitor = {}

SM = 1502
faixas_renda = {
    "ate_1": (0, SM),
    "mais_de_1_ate_2": (SM, SM * 2),
    "mais_de_2_ate_5": (SM * 2, SM * 5),
    "mais_de_5_ate_10": (SM * 5, SM * 10),
    "mais_de_10_ate_20": (SM * 10, SM * 20),
    "mais_de_20": (SM * 20, float("inf")),
}

valores_direita = [
    "livre iniciativa",
    "empreendedorismo",
    "meritocracia",
    "seguranca publica",
    "patriotismo",
]
valores_esquerda = [
    "igualdade social",
    "direitos humanos",
    "justica social",
    "diversidade",
    "sustentabilidade",
]

regioes_alta = {"Lago Sul", "Lago Norte", "Park Way", "Sudoeste", "Noroeste"}
regioes_baixa = {"Estrutural", "Varjao", "Itapoa", "Fercal", "SCIA"}
regioes_alta_norm = {normalizar_texto(r) for r in regioes_alta}
regioes_baixa_norm = {normalizar_texto(r) for r in regioes_baixa}

for e in eleitores:
    eleitor_id = e.get("id")
    nome = e.get("nome", "Desconhecido")
    idade = e.get("idade")

    try:
        idade = int(idade)
    except (TypeError, ValueError):
        idade = None

    escolaridade = e.get("escolaridade", "") or ""
    if escolaridade == "superior_ou_pos":
        escolaridade = "superior_completo_ou_pos"

    ocupacao = (e.get("ocupacao_vinculo", "") or "").lower()
    profissao = (e.get("profissao", "") or "").lower()

    if idade is not None and escolaridade:
        if idade <= 17 and escolaridade == "superior_completo_ou_pos":
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Idade vs Escolaridade",
                "grave",
                f"Idade {idade} com superior completo (impossivel)",
            )
        elif 18 <= idade <= 19 and escolaridade == "superior_completo_ou_pos":
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Idade vs Escolaridade",
                "medio",
                f"Idade {idade} com superior completo (muito improvavel)",
            )

    if idade is not None:
        if "aposentado" in profissao or "aposentado" in ocupacao:
            if idade < 40:
                adicionar_issue(
                    issues_eleitores,
                    por_eleitor,
                    eleitor_id,
                    nome,
                    "Idade vs Profissao",
                    "medio",
                    f"Aposentado(a) com {idade} anos (muito improvavel)",
                )
            elif idade < 50:
                adicionar_issue(
                    issues_eleitores,
                    por_eleitor,
                    eleitor_id,
                    nome,
                    "Idade vs Profissao",
                    "leve",
                    f"Aposentado(a) com {idade} anos (improvavel)",
                )

        profissoes_superior = [
            "medico",
            "advogado",
            "engenheiro",
            "arquiteto",
            "dentista",
            "psicologo",
            "farmaceutico",
            "veterinario",
            "contador",
        ]
        for prof in profissoes_superior:
            if prof in normalizar_texto(profissao):
                if escolaridade != "superior_completo_ou_pos":
                    adicionar_issue(
                        issues_eleitores,
                        por_eleitor,
                        eleitor_id,
                        nome,
                        "Escolaridade vs Profissao",
                        "medio",
                        f"Profissao '{e.get('profissao')}' requer superior completo",
                    )
                if idade is not None and idade < 22:
                    adicionar_issue(
                        issues_eleitores,
                        por_eleitor,
                        eleitor_id,
                        nome,
                        "Idade vs Profissao",
                        "medio",
                        f"Profissao '{e.get('profissao')}' com {idade} anos (muito jovem)",
                    )
                break

    filhos = e.get("filhos", 0)
    try:
        filhos = int(filhos)
    except (TypeError, ValueError):
        filhos = 0

    if idade is not None:
        if idade <= 18 and filhos >= 2:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Idade vs Filhos",
                "medio",
                f"Idade {idade} com {filhos} filhos (improvavel)",
            )
        if idade <= 20 and filhos >= 3:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Idade vs Filhos",
                "medio",
                f"Idade {idade} com {filhos} filhos (muito improvavel)",
            )
        if idade <= 25 and filhos >= 4:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Idade vs Filhos",
                "leve",
                f"Idade {idade} com {filhos} filhos (improvavel)",
            )
        if idade == 16 and filhos > 0:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Idade vs Filhos",
                "leve",
                f"Idade 16 com {filhos} filho(s) (raro)",
            )

    estado_civil = (e.get("estado_civil", "") or "").lower()
    estado_norm = normalizar_texto(estado_civil)
    if idade is not None:
        if "viuvo" in estado_norm:
            if idade < 30:
                adicionar_issue(
                    issues_eleitores,
                    por_eleitor,
                    eleitor_id,
                    nome,
                    "Idade vs Estado Civil",
                    "medio",
                    f"Viuvo(a) com {idade} anos (muito raro)",
                )
            elif idade < 40:
                adicionar_issue(
                    issues_eleitores,
                    por_eleitor,
                    eleitor_id,
                    nome,
                    "Idade vs Estado Civil",
                    "leve",
                    f"Viuvo(a) com {idade} anos (incomum)",
                )
        if "divorciado" in estado_norm and idade < 22:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Idade vs Estado Civil",
                "medio",
                f"Divorciado(a) com {idade} anos (muito raro)",
            )
        if "casado" in estado_norm and idade < 18:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Idade vs Estado Civil",
                "grave",
                f"Casado(a) com {idade} anos (menor de idade)",
            )

    voto_fac = e.get("voto_facultativo", False)
    if idade is not None:
        deveria_fac = (16 <= idade <= 17) or (idade >= 70)
        if deveria_fac and not voto_fac:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Voto Facultativo",
                "grave",
                f"Idade {idade} deveria ter voto_facultativo=true",
            )
        if not deveria_fac and voto_fac:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Voto Facultativo",
                "grave",
                f"Idade {idade} deveria ter voto_facultativo=false",
            )

    cluster = e.get("cluster_socioeconomico", "")
    renda = e.get("renda_salarios_minimos", "")
    if cluster == "G1_alta" and renda in {"ate_1", "mais_de_1_ate_2"}:
        adicionar_issue(
            issues_eleitores,
            por_eleitor,
            eleitor_id,
            nome,
            "Cluster vs Renda",
            "medio",
            f"Cluster {cluster} com renda '{renda}' (incoerente)",
        )
    if cluster == "G4_baixa" and renda in {"mais_de_10_ate_20", "mais_de_20"}:
        adicionar_issue(
            issues_eleitores,
            por_eleitor,
            eleitor_id,
            nome,
            "Cluster vs Renda",
            "medio",
            f"Cluster {cluster} com renda '{renda}' (incoerente)",
        )
    if cluster == "G2_media_alta" and renda == "ate_1":
        adicionar_issue(
            issues_eleitores,
            por_eleitor,
            eleitor_id,
            nome,
            "Cluster vs Renda",
            "medio",
            f"Cluster {cluster} com renda '{renda}' (incoerente)",
        )

    if escolaridade == "superior_completo_ou_pos" and renda == "ate_1":
        if ocupacao not in {"aposentado", "estudante", "desempregado"}:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Escolaridade vs Renda",
                "leve",
                f"Superior completo com renda ate 1 SM e ocupacao '{e.get('ocupacao_vinculo')}'",
            )
    if escolaridade == "fundamental_ou_sem_instrucao" and renda in {
        "mais_de_10_ate_20",
        "mais_de_20",
    }:
        adicionar_issue(
            issues_eleitores,
            por_eleitor,
            eleitor_id,
            nome,
            "Escolaridade vs Renda",
            "medio",
            f"Escolaridade fundamental com renda '{renda}' (muito improvavel)",
        )

    orientacao = e.get("orientacao_politica", "")
    pos_bolso = e.get("posicao_bolsonaro", "")
    if orientacao == "esquerda" and pos_bolso in {"apoiador_forte", "apoiador"}:
        adicionar_issue(
            issues_eleitores,
            por_eleitor,
            eleitor_id,
            nome,
            "Orientacao vs Bolsonaro",
            "grave",
            "Orientacao esquerda com apoio forte a Bolsonaro",
        )
    if orientacao == "direita" and pos_bolso in {
        "critico_forte",
        "opositor_forte",
        "critico_ferrenho",
    }:
        adicionar_issue(
            issues_eleitores,
            por_eleitor,
            eleitor_id,
            nome,
            "Orientacao vs Bolsonaro",
            "medio",
            "Orientacao direita com critica forte a Bolsonaro (incomum)",
        )

    valores = [normalizar_texto(v) for v in e.get("valores", [])]
    if orientacao == "esquerda":
        conflitos = [v for v in valores if any(vd in v for vd in valores_direita)]
        if len(conflitos) >= 2:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Valores vs Orientacao",
                "leve",
                f"Orientacao esquerda com multiplos valores de direita: {conflitos}",
            )
    if orientacao == "direita":
        conflitos = [v for v in valores if any(ve in v for ve in valores_esquerda)]
        if len(conflitos) >= 2:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Valores vs Orientacao",
                "leve",
                f"Orientacao direita com multiplos valores de esquerda: {conflitos}",
            )

    tempo_cat = e.get("tempo_deslocamento_trabalho", "")
    if ocupacao in {"aposentado", "desempregado", "do_lar"}:
        if tempo_cat not in {"nao_se_aplica", "", None}:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Transporte vs Ocupacao",
                "medio",
                f"Ocupacao '{e.get('ocupacao_vinculo')}' com tempo_deslocamento '{tempo_cat}'",
            )

    faixa = e.get("faixa_etaria", "")
    if idade is not None:
        if idade <= 24:
            faixa_correta = "16-24"
        elif idade <= 34:
            faixa_correta = "25-34"
        elif idade <= 44:
            faixa_correta = "35-44"
        elif idade <= 54:
            faixa_correta = "45-54"
        elif idade <= 64:
            faixa_correta = "55-64"
        else:
            faixa_correta = "65+"
        if faixa and faixa != faixa_correta:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Faixa Etaria",
                "grave",
                f"Faixa etaria '{faixa}' nao corresponde a idade {idade} (deveria ser '{faixa_correta}')",
            )

    filhos_cat = e.get("filhos_cat", "")
    if filhos_cat:
        if filhos == 0 and filhos_cat != "sem_filhos":
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Filhos Categoria",
                "grave",
                f"filhos=0 mas filhos_cat='{filhos_cat}'",
            )
        elif filhos == 1 and filhos_cat not in {"1_filho", "com_filhos"}:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Filhos Categoria",
                "grave",
                f"filhos=1 mas filhos_cat='{filhos_cat}'",
            )
        elif filhos == 2 and filhos_cat not in {"2_filhos", "com_filhos"}:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Filhos Categoria",
                "grave",
                f"filhos=2 mas filhos_cat='{filhos_cat}'",
            )
        elif filhos >= 3 and filhos_cat not in {"3_ou_mais", "com_filhos"}:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Filhos Categoria",
                "grave",
                f"filhos={filhos} mas filhos_cat='{filhos_cat}'",
            )

    regiao = e.get("regiao_administrativa", "")
    regiao_norm = normalizar_texto(regiao)
    if regiao_norm in regioes_alta_norm and cluster == "G4_baixa":
        adicionar_issue(
            issues_eleitores,
            por_eleitor,
            eleitor_id,
            nome,
            "Regiao vs Cluster",
            "leve",
            f"Regiao {regiao} com cluster {cluster} (incomum)",
        )
    if regiao_norm in regioes_baixa_norm and cluster == "G1_alta":
        adicionar_issue(
            issues_eleitores,
            por_eleitor,
            eleitor_id,
            nome,
            "Regiao vs Cluster",
            "leve",
            f"Regiao {regiao} com cluster {cluster} (incomum)",
        )

    renda_mensal = e.get("renda_mensal")
    if renda and renda in faixas_renda and isinstance(renda_mensal, (int, float)):
        min_val, max_val = faixas_renda[renda]
        if renda_mensal < min_val * 0.9 or (
            max_val != float("inf") and renda_mensal > max_val * 1.1
        ):
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Renda Faixa vs Mensal",
                "medio",
                f"Renda mensal R${renda_mensal:.0f} fora da faixa '{renda}'",
            )

    meio_transporte = e.get("meio_transporte", "")
    tempo_min = e.get("tempo_deslocamento_minutos", 0)
    if meio_transporte == "nao_se_aplica":
        if tempo_cat not in {"nao_se_aplica", "", None} or (
            isinstance(tempo_min, (int, float)) and tempo_min > 0
        ):
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Deslocamento vs Transporte",
                "medio",
                "Meio de transporte nao_se_aplica com tempo de deslocamento preenchido",
            )
    if (
        isinstance(tempo_min, (int, float))
        and tempo_min == 0
        and tempo_cat
        not in {
            "nao_se_aplica",
            "",
            None,
        }
    ):
        if meio_transporte not in {"nao_se_aplica", "", None}:
            adicionar_issue(
                issues_eleitores,
                por_eleitor,
                eleitor_id,
                nome,
                "Deslocamento vs Transporte",
                "medio",
                "Tempo de deslocamento 0 com categoria informada",
            )

    historia = normalizar_texto(e.get("historia_resumida", ""))
    genero = e.get("genero", "")
    if historia:
        if genero == "feminino":
            if (
                " ele " in historia
                or "casado " in historia
                or " aposentado " in historia
            ):
                if "casado(a)" not in historia and "aposentado(a)" not in historia:
                    adicionar_issue(
                        issues_eleitores,
                        por_eleitor,
                        eleitor_id,
                        nome,
                        "Historia vs Atributos",
                        "leve",
                        "Historia usa termos masculinos para genero feminino",
                    )
        if genero == "masculino":
            if (
                " ela " in historia
                or "casada " in historia
                or " aposentada " in historia
            ):
                if "casado(a)" not in historia and "aposentado(a)" not in historia:
                    adicionar_issue(
                        issues_eleitores,
                        por_eleitor,
                        eleitor_id,
                        nome,
                        "Historia vs Atributos",
                        "leve",
                        "Historia usa termos femininos para genero masculino",
                    )


with open(DATA_DEPUTADOS, "r", encoding="utf-8") as f:
    deputados = json.load(f)
with open(DATA_SENADORES, "r", encoding="utf-8") as f:
    senadores = json.load(f)

parlamentares = []
for d in deputados:
    item = dict(d)
    item["_tipo"] = "deputado_federal"
    parlamentares.append(item)
for s in senadores:
    item = dict(s)
    item["_tipo"] = "senador"
    parlamentares.append(item)

issues_parlamentares = []
por_parlamentar = {}

uf_estado = {
    "AC": "Acre",
    "AL": "Alagoas",
    "AP": "Amapa",
    "AM": "Amazonas",
    "BA": "Bahia",
    "CE": "Ceara",
    "DF": "Distrito Federal",
    "ES": "Espirito Santo",
    "GO": "Goias",
    "MA": "Maranhao",
    "MT": "Mato Grosso",
    "MS": "Mato Grosso do Sul",
    "MG": "Minas Gerais",
    "PA": "Para",
    "PB": "Paraiba",
    "PR": "Parana",
    "PE": "Pernambuco",
    "PI": "Piaui",
    "RJ": "Rio de Janeiro",
    "RN": "Rio Grande do Norte",
    "RS": "Rio Grande do Sul",
    "RO": "Rondonia",
    "RR": "Roraima",
    "SC": "Santa Catarina",
    "SP": "Sao Paulo",
    "SE": "Sergipe",
    "TO": "Tocantins",
}

uf_regiao = {
    "AC": "Norte",
    "AP": "Norte",
    "AM": "Norte",
    "PA": "Norte",
    "RO": "Norte",
    "RR": "Norte",
    "TO": "Norte",
    "AL": "Nordeste",
    "BA": "Nordeste",
    "CE": "Nordeste",
    "MA": "Nordeste",
    "PB": "Nordeste",
    "PE": "Nordeste",
    "PI": "Nordeste",
    "RN": "Nordeste",
    "SE": "Nordeste",
    "DF": "Centro-Oeste",
    "GO": "Centro-Oeste",
    "MS": "Centro-Oeste",
    "MT": "Centro-Oeste",
    "ES": "Sudeste",
    "MG": "Sudeste",
    "RJ": "Sudeste",
    "SP": "Sudeste",
    "PR": "Sul",
    "RS": "Sul",
    "SC": "Sul",
}

left_parties = {"PT", "PSOL", "PCDOB", "PDT", "PSB", "PV", "REDE"}
right_parties = {
    "PL",
    "PP",
    "REPUBLICANOS",
    "UNIAO",
    "UNIAO BRASIL",
    "PSC",
    "PRD",
    "PTB",
    "PSL",
    "NOVO",
    "PODEMOS",
    "PATRIOTA",
}

for p in parlamentares:
    pessoa_id = p.get("id")
    nome = p.get("nome_parlamentar") or p.get("nome") or "Desconhecido"
    idade = p.get("idade")
    data_nasc = p.get("data_nascimento")

    nascimento = None
    if data_nasc:
        try:
            nascimento = datetime.strptime(data_nasc, "%Y-%m-%d")
        except ValueError:
            adicionar_issue(
                issues_parlamentares,
                por_parlamentar,
                pessoa_id,
                nome,
                "Idade vs Nascimento",
                "medio",
                f"Data de nascimento invalida: {data_nasc}",
            )
    else:
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Idade vs Nascimento",
            "medio",
            "Data de nascimento ausente",
        )

    if nascimento and isinstance(idade, int):
        idade_calc = (
            DATA_ANALISE.year
            - nascimento.year
            - (
                (DATA_ANALISE.month, DATA_ANALISE.day)
                < (nascimento.month, nascimento.day)
            )
        )
        if abs(idade_calc - idade) > 1:
            adicionar_issue(
                issues_parlamentares,
                por_parlamentar,
                pessoa_id,
                nome,
                "Idade vs Nascimento",
                "grave",
                f"Idade {idade} nao confere com nascimento {data_nasc} (calc ~{idade_calc})",
            )
    elif nascimento and not isinstance(idade, int):
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Idade vs Nascimento",
            "medio",
            "Idade ausente ou invalida",
        )

    uf = p.get("uf")
    estado = p.get("estado")
    if uf and estado:
        esperado = uf_estado.get(str(uf).upper())
        if esperado and normalizar_texto(estado) != normalizar_texto(esperado):
            adicionar_issue(
                issues_parlamentares,
                por_parlamentar,
                pessoa_id,
                nome,
                "UF vs Estado",
                "grave",
                f"UF {uf} nao corresponde ao estado '{estado}' (esperado '{esperado}')",
            )

    regiao = p.get("regiao")
    if uf and regiao:
        esperado_regiao = uf_regiao.get(str(uf).upper())
        if esperado_regiao and normalizar_texto(regiao) != normalizar_texto(
            esperado_regiao
        ):
            adicionar_issue(
                issues_parlamentares,
                por_parlamentar,
                pessoa_id,
                nome,
                "Regiao vs UF",
                "medio",
                f"Regiao '{regiao}' nao corresponde a UF {uf} (esperado '{esperado_regiao}')",
            )

    casa = p.get("casa_legislativa")
    cargo = p.get("cargo")
    if casa == "camara_federal" and cargo not in {"deputado_federal", "deputado"}:
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Casa vs Cargo",
            "grave",
            f"Casa legislativa '{casa}' com cargo '{cargo}'",
        )
    if casa == "senado" and cargo != "senador":
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Casa vs Cargo",
            "grave",
            f"Casa legislativa '{casa}' com cargo '{cargo}'",
        )

    email = (p.get("email_contato") or "").lower()
    if email:
        if casa == "camara_federal" and "@senado.leg.br" in email:
            adicionar_issue(
                issues_parlamentares,
                por_parlamentar,
                pessoa_id,
                nome,
                "Email vs Casa",
                "grave",
                f"Email de senador em cadastro de deputado: {email}",
            )
        if casa == "senado" and "@camara.leg.br" in email:
            adicionar_issue(
                issues_parlamentares,
                por_parlamentar,
                pessoa_id,
                nome,
                "Email vs Casa",
                "grave",
                f"Email de deputado em cadastro de senador: {email}",
            )

    partido = p.get("partido") or ""
    partido_norm = normalizar_texto(partido).upper()
    orientacao = p.get("orientacao_politica") or p.get("espectro_politico") or ""
    orientacao_norm = orientacao.lower()
    if partido_norm in left_parties and orientacao_norm in {
        "direita",
        "centro_direita",
    }:
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Partido vs Orientacao",
            "medio",
            f"Partido {partido} com orientacao {orientacao}",
        )
    if partido_norm in right_parties and orientacao_norm in {
        "esquerda",
        "centro_esquerda",
    }:
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Partido vs Orientacao",
            "medio",
            f"Partido {partido} com orientacao {orientacao}",
        )

    pos_bolso = p.get("posicao_bolsonaro") or ""
    pos_lula = p.get("posicao_lula") or ""
    if partido_norm in left_parties and pos_bolso in {
        "apoiador_forte",
        "apoiador",
        "apoiador_moderado",
    }:
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Partido vs Bolsonaro",
            "medio",
            f"Partido {partido} com apoio a Bolsonaro ({pos_bolso})",
        )
    if partido_norm in right_parties and pos_lula in {
        "apoiador_forte",
        "apoiador",
        "apoiador_moderado",
    }:
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Partido vs Lula",
            "medio",
            f"Partido {partido} com apoio a Lula ({pos_lula})",
        )
    if orientacao_norm == "esquerda" and pos_bolso in {"apoiador_forte", "apoiador"}:
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Orientacao vs Bolsonaro",
            "medio",
            f"Orientacao esquerda com apoio a Bolsonaro ({pos_bolso})",
        )
    if orientacao_norm == "direita" and pos_bolso in {
        "opositor_forte",
        "opositor_moderado",
        "critico_forte",
    }:
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Orientacao vs Bolsonaro",
            "leve",
            f"Orientacao direita com oposicao a Bolsonaro ({pos_bolso})",
        )

    legislatura = p.get("legislatura")
    if legislatura and legislatura != 57:
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Mandato vs Legislatura",
            "medio",
            f"Legislatura {legislatura} diferente da 57 esperada",
        )

    mandato_inicio = p.get("mandato_inicio")
    mandato_fim = p.get("mandato_fim")

    def parse_data(valor):
        if not valor:
            return None
        try:
            return datetime.strptime(valor, "%Y-%m-%d")
        except ValueError:
            return None

    inicio = parse_data(mandato_inicio)
    fim = parse_data(mandato_fim)
    if mandato_inicio and not inicio:
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Mandato vs Legislatura",
            "grave",
            f"Data de inicio de mandato invalida: {mandato_inicio}",
        )
    if mandato_fim and not fim:
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Mandato vs Legislatura",
            "grave",
            f"Data de fim de mandato invalida: {mandato_fim}",
        )
    if inicio and fim and inicio >= fim:
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Mandato vs Legislatura",
            "grave",
            f"Mandato inicio {mandato_inicio} maior/igual ao fim {mandato_fim}",
        )

    votos = p.get("votos_eleicao")
    if votos is None:
        adicionar_issue(
            issues_parlamentares,
            por_parlamentar,
            pessoa_id,
            nome,
            "Votos Eleicao",
            "medio",
            "Votos de eleicao ausentes",
        )
    else:
        try:
            votos_int = int(votos)
            if votos_int <= 0:
                adicionar_issue(
                    issues_parlamentares,
                    por_parlamentar,
                    pessoa_id,
                    nome,
                    "Votos Eleicao",
                    "medio",
                    f"Votos de eleicao invalidos: {votos}",
                )
        except (TypeError, ValueError):
            adicionar_issue(
                issues_parlamentares,
                por_parlamentar,
                pessoa_id,
                nome,
                "Votos Eleicao",
                "medio",
                f"Votos de eleicao invalidos: {votos}",
            )


resumo_eleitores = resumo_dataset(len(eleitores), issues_eleitores, por_eleitor)
resumo_parlamentares = resumo_dataset(
    len(parlamentares), issues_parlamentares, por_parlamentar
)

severidade_total = Counter()
for issue in issues_eleitores + issues_parlamentares:
    severidade_total[issue["severidade"]] += 1

relatorio = {
    "data_verificacao": DATA_ANALISE_ISO,
    "escopo": ["eleitores", "parlamentares"],
    "resumo_geral": {
        "total_registros": len(eleitores) + len(parlamentares),
        "total_inconsistencias": len(issues_eleitores) + len(issues_parlamentares),
        "total_individuos_afetados": len(por_eleitor) + len(por_parlamentar),
        "por_severidade": {k: severidade_total.get(k, 0) for k in SEVERIDADES},
    },
    "eleitores": {**resumo_eleitores, "detalhes": issues_eleitores},
    "parlamentares": {**resumo_parlamentares, "detalhes": issues_parlamentares},
    "observacoes": [
        "Entrevistas nao foram analisadas nesta rodada (escopo definido para eleitores e parlamentares)."
    ],
}

relatorio_path = os.path.join(
    DATA_RELATORIOS_DIR, "relatorio_coerencia_completo_2026-01-23.json"
)
with open(relatorio_path, "w", encoding="utf-8") as f:
    json.dump(relatorio, f, ensure_ascii=False, indent=2)


def format_top(top_list):
    if not top_list:
        return "Nenhum individuo com inconsistencias."
    return " | ".join(
        [
            f"{item['id']} - {item['nome']} ({item['total_erros']} erros)"
            for item in top_list
        ]
    )


lines = []
lines.append("# Resumo de incoerencias - 2026-01-23")
lines.append("")
lines.append("## Visao geral")
lines.append(f"- Registros analisados: {relatorio['resumo_geral']['total_registros']}")
lines.append(
    f"- Inconsistencias encontradas: {relatorio['resumo_geral']['total_inconsistencias']}"
)
lines.append(
    f"- Individuos afetados: {relatorio['resumo_geral']['total_individuos_afetados']}"
)
lines.append(
    "- Severidade: "
    f"grave={relatorio['resumo_geral']['por_severidade']['grave']}, "
    f"medio={relatorio['resumo_geral']['por_severidade']['medio']}, "
    f"leve={relatorio['resumo_geral']['por_severidade']['leve']}"
)
lines.append("")
lines.append("## Eleitores")
lines.append(
    f"- Total: {resumo_eleitores['total']} | Afetados: {resumo_eleitores['individuos_afetados']} "
    f"| Inconsistencias: {resumo_eleitores['total_inconsistencias']}"
)
lines.append(f"- Indice de qualidade: {resumo_eleitores['indice_qualidade']}%")
if resumo_eleitores["por_categoria"]:
    top_categorias = list(resumo_eleitores["por_categoria"].items())[:5]
    top_texto = ", ".join([f"{cat} ({count})" for cat, count in top_categorias])
    lines.append(f"- Top categorias: {top_texto}")
lines.append(
    f"- Mais recorrentes: {format_top(resumo_eleitores['top_incoerencias'][:5])}"
)
lines.append("")
lines.append("## Parlamentares")
lines.append(
    f"- Total: {resumo_parlamentares['total']} | Afetados: {resumo_parlamentares['individuos_afetados']} "
    f"| Inconsistencias: {resumo_parlamentares['total_inconsistencias']}"
)
lines.append(f"- Indice de qualidade: {resumo_parlamentares['indice_qualidade']}%")
if resumo_parlamentares["por_categoria"]:
    top_categorias = list(resumo_parlamentares["por_categoria"].items())[:5]
    top_texto = ", ".join([f"{cat} ({count})" for cat, count in top_categorias])
    lines.append(f"- Top categorias: {top_texto}")
lines.append(
    f"- Mais recorrentes: {format_top(resumo_parlamentares['top_incoerencias'][:5])}"
)
lines.append("")
lines.append("## Observacoes")
lines.append(
    "- Entrevistas nao analisadas nesta rodada (escopo definido para eleitores e parlamentares)."
)

resumo_path = os.path.join(DATA_RELATORIOS_DIR, "resumo_incoerencias.md")
with open(resumo_path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print(f"Relatorio salvo em: {relatorio_path}")
print(f"Resumo salvo em: {resumo_path}")
