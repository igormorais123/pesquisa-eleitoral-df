"""
Simulador de Pesquisa Eleitoral - Governador DF 2026
Usa o banco de eleitores sintéticos para simular intenção de voto
"""

import json
import random
from collections import defaultdict

random.seed(2026)

# Carregar banco de eleitores
with open("agentes/banco-eleitores-df.json", encoding="utf-8") as f:
    eleitores = json.load(f)

# ========================================
# CANDIDATOS SIMULADOS (baseado em cenário provável)
# ========================================
CANDIDATOS = {
    "celina_leao": {
        "nome": "Celina Leão (PP)",
        "espectro": "centro-direita",
        "descricao": "Vice-governadora, base bolsonarista moderada",
    },
    "flavia_arruda": {
        "nome": "Flávia Arruda (PL)",
        "espectro": "direita",
        "descricao": "Ex-deputada federal, bolsonarista",
    },
    "leandro_grass": {
        "nome": "Leandro Grass (PV)",
        "espectro": "centro-esquerda",
        "descricao": "Ex-administrador do Plano Piloto, ambientalista",
    },
    "candidato_pt": {
        "nome": "Candidato PT",
        "espectro": "esquerda",
        "descricao": "Candidato do PT (a definir)",
    },
    "rafael_prudente": {
        "nome": "Rafael Prudente (MDB)",
        "espectro": "centro",
        "descricao": "Presidente da Câmara Legislativa",
    },
    "indecisos": {
        "nome": "Indeciso/Não sabe",
        "espectro": None,
        "descricao": "Ainda não decidiu",
    },
    "branco_nulo": {
        "nome": "Branco/Nulo/Não vai votar",
        "espectro": None,
        "descricao": "Rejeita todos",
    },
}


# ========================================
# LÓGICA DE SIMULAÇÃO DE VOTO
# ========================================
def simular_voto(eleitor):
    """
    Simula intenção de voto baseado no perfil do eleitor.
    Considera: orientação política, posição Bolsonaro, interesse político, cluster.
    """
    orientacao = eleitor["orientacao_politica"]
    posicao_bolso = eleitor["posicao_bolsonaro"]
    interesse = eleitor["interesse_politico"]
    cluster = eleitor["cluster_socioeconomico"]
    religiao = eleitor["religiao"]

    # Base de probabilidades por orientação política
    if orientacao == "direita":
        probs = {
            "flavia_arruda": 45,  # Bolsonarista puro
            "celina_leao": 30,  # Direita moderada
            "rafael_prudente": 8,  # Centro
            "leandro_grass": 2,
            "candidato_pt": 1,
            "indecisos": 8,
            "branco_nulo": 6,
        }
    elif orientacao == "centro-direita":
        probs = {
            "celina_leao": 40,  # Preferência
            "flavia_arruda": 20,
            "rafael_prudente": 18,
            "leandro_grass": 5,
            "candidato_pt": 2,
            "indecisos": 10,
            "branco_nulo": 5,
        }
    elif orientacao == "centro":
        probs = {
            "celina_leao": 22,
            "rafael_prudente": 25,
            "flavia_arruda": 10,
            "leandro_grass": 12,
            "candidato_pt": 8,
            "indecisos": 15,
            "branco_nulo": 8,
        }
    elif orientacao == "centro-esquerda":
        probs = {
            "leandro_grass": 35,
            "candidato_pt": 25,
            "rafael_prudente": 12,
            "celina_leao": 8,
            "flavia_arruda": 2,
            "indecisos": 12,
            "branco_nulo": 6,
        }
    else:  # esquerda
        probs = {
            "candidato_pt": 50,
            "leandro_grass": 25,
            "rafael_prudente": 5,
            "celina_leao": 2,
            "flavia_arruda": 1,
            "indecisos": 10,
            "branco_nulo": 7,
        }

    # Ajustes por posição Bolsonaro
    if posicao_bolso == "apoiador_forte":
        probs["flavia_arruda"] = int(probs.get("flavia_arruda", 0) * 1.5)
        probs["candidato_pt"] = max(1, int(probs.get("candidato_pt", 0) * 0.3))
        probs["leandro_grass"] = max(1, int(probs.get("leandro_grass", 0) * 0.5))
    elif posicao_bolso == "critico_forte":
        probs["flavia_arruda"] = max(1, int(probs.get("flavia_arruda", 0) * 0.2))
        probs["candidato_pt"] = int(probs.get("candidato_pt", 0) * 1.4)
        probs["leandro_grass"] = int(probs.get("leandro_grass", 0) * 1.3)

    # Ajuste por religião evangélica - EFEITO MICHELE BOLSONARO
    # Michele Bolsonaro (evangelica influente) apoia Celina Leao
    # Isso atrai evangelicos moderados para Celina, enquanto "raiz" ficam com PL
    if religiao == "evangelica":
        if posicao_bolso == "apoiador_forte":
            # Bolsonaristas "raiz" preferem Flavia (PL = partido de Bolsonaro)
            probs["flavia_arruda"] = int(probs.get("flavia_arruda", 0) * 1.15)
            probs["celina_leao"] = int(probs.get("celina_leao", 0) * 1.05)
        elif posicao_bolso == "apoiador_moderado":
            # Evangelicos moderados: efeito Michele forte - preferem Celina
            probs["celina_leao"] = int(probs.get("celina_leao", 0) * 1.4)
            probs["flavia_arruda"] = int(probs.get("flavia_arruda", 0) * 0.9)
        elif posicao_bolso == "neutro":
            # Evangelicos neutros: efeito Michele ainda maior
            probs["celina_leao"] = int(probs.get("celina_leao", 0) * 1.5)
            probs["flavia_arruda"] = int(probs.get("flavia_arruda", 0) * 0.95)
        else:
            # Evangelicos criticos de Bolsonaro: menos afetados por Michele
            probs["celina_leao"] = int(probs.get("celina_leao", 0) * 1.1)
            probs["flavia_arruda"] = int(probs.get("flavia_arruda", 0) * 0.8)

    # Ajuste por cluster (G1/G2 mais informados, menos indecisos)
    if cluster in ["G1_alta", "G2_media_alta"]:
        probs["indecisos"] = max(3, int(probs.get("indecisos", 0) * 0.7))
    else:
        probs["indecisos"] = int(probs.get("indecisos", 0) * 1.2)

    # Interesse político baixo = mais indecisos
    if interesse == "baixo":
        probs["indecisos"] = int(probs.get("indecisos", 0) * 1.5)
        probs["branco_nulo"] = int(probs.get("branco_nulo", 0) * 1.3)

    # Sortear voto
    candidatos = list(probs.keys())
    pesos = [max(1, p) for p in probs.values()]
    return random.choices(candidatos, weights=pesos)[0]


# ========================================
# EXECUTAR PESQUISA
# ========================================
print("=" * 60)
print("PESQUISA ELEITORAL - GOVERNADOR DO DF 2026")
print("=" * 60)
print(f"Amostra: {len(eleitores)} eleitores")
print("Margem de erro: ~5 pontos percentuais")
print("=" * 60)

# Simular votos
votos = defaultdict(int)
votos_por_ra = defaultdict(lambda: defaultdict(int))
votos_por_cluster = defaultdict(lambda: defaultdict(int))
votos_por_religiao = defaultdict(lambda: defaultdict(int))
votos_por_idade = defaultdict(lambda: defaultdict(int))

for eleitor in eleitores:
    voto = simular_voto(eleitor)
    votos[voto] += 1
    votos_por_ra[eleitor["regiao_administrativa"]][voto] += 1
    votos_por_cluster[eleitor["cluster_socioeconomico"]][voto] += 1
    votos_por_religiao[eleitor["religiao"]][voto] += 1

    # Faixa etária
    idade = eleitor["idade"]
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
    votos_por_idade[faixa][voto] += 1

# ========================================
# RESULTADO GERAL
# ========================================
print("\n>>> INTENÇÃO DE VOTO ESTIMULADA <<<\n")

# Ordenar por votos (excluindo indecisos/branco)
ordem = sorted(
    votos.items(),
    key=lambda x: -x[1] if x[0] not in ["indecisos", "branco_nulo"] else 0,
)

total = len(eleitores)
for candidato, qtd in ordem:
    nome = CANDIDATOS[candidato]["nome"]
    pct = qtd / total * 100
    barra = "#" * int(pct / 2)
    print(f"{nome:35} {qtd:4} ({pct:5.1f}%) {barra}")

# Votos válidos (sem indecisos e branco/nulo)
votos_validos = sum(
    v for c, v in votos.items() if c not in ["indecisos", "branco_nulo"]
)
print(f"\n{'-' * 60}")
print(f"Votos válidos: {votos_validos} ({votos_validos/total*100:.1f}%)")
print(
    f"Indecisos + Branco/Nulo: {votos['indecisos'] + votos['branco_nulo']} ({(votos['indecisos'] + votos['branco_nulo'])/total*100:.1f}%)"
)

# ========================================
# CENÁRIO DE 2º TURNO
# ========================================
print("\n" + "=" * 60)
print(">>> SIMULAÇÃO 2º TURNO (se necessário) <<<")
print("=" * 60)

# Top 2 candidatos
top2 = [c for c, v in ordem if c not in ["indecisos", "branco_nulo"]][:2]


def simular_2turno(eleitor, cand1, cand2):
    """Simula voto no 2º turno entre dois candidatos"""
    orientacao = eleitor["orientacao_politica"]
    posicao_bolso = eleitor["posicao_bolsonaro"]

    esp1 = CANDIDATOS[cand1]["espectro"]
    esp2 = CANDIDATOS[cand2]["espectro"]

    # Mapa de afinidade
    afinidade = {
        "direita": {
            "direita": 5,
            "centro-direita": 4,
            "centro": 2,
            "centro-esquerda": 1,
            "esquerda": 0,
        },
        "centro-direita": {
            "direita": 3,
            "centro-direita": 5,
            "centro": 3,
            "centro-esquerda": 2,
            "esquerda": 1,
        },
        "centro": {
            "direita": 2,
            "centro-direita": 3,
            "centro": 5,
            "centro-esquerda": 3,
            "esquerda": 2,
        },
        "centro-esquerda": {
            "direita": 1,
            "centro-direita": 2,
            "centro": 3,
            "centro-esquerda": 5,
            "esquerda": 4,
        },
        "esquerda": {
            "direita": 0,
            "centro-direita": 1,
            "centro": 2,
            "centro-esquerda": 4,
            "esquerda": 5,
        },
    }

    score1 = afinidade.get(orientacao, {}).get(esp1, 2)
    score2 = afinidade.get(orientacao, {}).get(esp2, 2)

    # Ajuste por Bolsonaro
    if posicao_bolso in ["apoiador_forte", "apoiador_moderado"]:
        if esp1 in ["direita", "centro-direita"]:
            score1 += 2
        if esp2 in ["direita", "centro-direita"]:
            score2 += 2
    elif posicao_bolso in ["critico_forte", "critico_moderado"]:
        if esp1 in ["esquerda", "centro-esquerda"]:
            score1 += 2
        if esp2 in ["esquerda", "centro-esquerda"]:
            score2 += 2

    # Chance de branco/nulo se muito diferente
    if abs(score1 - score2) <= 1:
        if random.random() < 0.15:
            return "branco_nulo"

    if score1 > score2:
        return cand1
    elif score2 > score1:
        return cand2
    else:
        return random.choice([cand1, cand2])


if len(top2) >= 2:
    c1, c2 = top2[0], top2[1]
    print(f"\nCenário: {CANDIDATOS[c1]['nome']} vs {CANDIDATOS[c2]['nome']}\n")

    votos_2t = defaultdict(int)
    for eleitor in eleitores:
        voto = simular_2turno(eleitor, c1, c2)
        votos_2t[voto] += 1

    for cand in [c1, c2, "branco_nulo"]:
        qtd = votos_2t[cand]
        pct = qtd / total * 100
        nome = CANDIDATOS[cand]["nome"] if cand != "branco_nulo" else "Branco/Nulo"
        barra = "#" * int(pct / 2)
        print(f"{nome:35} {qtd:4} ({pct:5.1f}%) {barra}")

# ========================================
# RESULTADO POR RA (Top 10 maiores)
# ========================================
print("\n" + "=" * 60)
print(">>> INTENÇÃO DE VOTO POR REGIÃO ADMINISTRATIVA <<<")
print("=" * 60)

# Ordenar RAs por população
ras_ordenadas = sorted(votos_por_ra.items(), key=lambda x: -sum(x[1].values()))

for ra, votos_ra in ras_ordenadas:
    total_ra = sum(votos_ra.values())
    print(f"\n{ra} (n={total_ra})")

    # Top 3 candidatos na RA
    ordem_ra = sorted(
        votos_ra.items(),
        key=lambda x: -x[1] if x[0] not in ["indecisos", "branco_nulo"] else 0,
    )

    for candidato, qtd in ordem_ra[:5]:
        nome = CANDIDATOS[candidato]["nome"].split("(")[0].strip()
        pct = qtd / total_ra * 100
        barra = "=" * int(pct / 5)
        print(f"  {nome:25} {pct:5.1f}% {barra}")

# ========================================
# RESULTADO POR CLUSTER SOCIOECONÔMICO
# ========================================
print("\n" + "=" * 60)
print(">>> INTENÇÃO DE VOTO POR CLUSTER SOCIOECONÔMICO <<<")
print("=" * 60)

for cluster in ["G1_alta", "G2_media_alta", "G3_media_baixa", "G4_baixa"]:
    votos_c = votos_por_cluster[cluster]
    total_c = sum(votos_c.values())

    nomes_cluster = {
        "G1_alta": "G1 - Alta renda",
        "G2_media_alta": "G2 - Média-alta",
        "G3_media_baixa": "G3 - Média-baixa",
        "G4_baixa": "G4 - Baixa renda",
    }

    print(f"\n{nomes_cluster[cluster]} (n={total_c})")

    ordem_c = sorted(
        votos_c.items(),
        key=lambda x: -x[1] if x[0] not in ["indecisos", "branco_nulo"] else 0,
    )

    for candidato, qtd in ordem_c[:5]:
        nome = CANDIDATOS[candidato]["nome"].split("(")[0].strip()
        pct = qtd / total_c * 100
        barra = "=" * int(pct / 5)
        print(f"  {nome:25} {pct:5.1f}% {barra}")

# ========================================
# RESULTADO POR RELIGIÃO
# ========================================
print("\n" + "=" * 60)
print(">>> INTENÇÃO DE VOTO POR RELIGIÃO <<<")
print("=" * 60)

for religiao in ["catolica", "evangelica", "sem_religiao"]:
    votos_r = votos_por_religiao[religiao]
    total_r = sum(votos_r.values())

    nomes_rel = {
        "catolica": "Católicos",
        "evangelica": "Evangélicos",
        "sem_religiao": "Sem religião",
    }

    if total_r < 10:
        continue

    print(f"\n{nomes_rel[religiao]} (n={total_r})")

    ordem_r = sorted(
        votos_r.items(),
        key=lambda x: -x[1] if x[0] not in ["indecisos", "branco_nulo"] else 0,
    )

    for candidato, qtd in ordem_r[:5]:
        nome = CANDIDATOS[candidato]["nome"].split("(")[0].strip()
        pct = qtd / total_r * 100
        barra = "=" * int(pct / 5)
        print(f"  {nome:25} {pct:5.1f}% {barra}")

# ========================================
# RESULTADO POR FAIXA ETÁRIA
# ========================================
print("\n" + "=" * 60)
print(">>> INTENÇÃO DE VOTO POR FAIXA ETÁRIA <<<")
print("=" * 60)

for faixa in ["16-24", "25-34", "35-44", "45-59", "60+"]:
    votos_f = votos_por_idade[faixa]
    total_f = sum(votos_f.values())

    print(f"\n{faixa} anos (n={total_f})")

    ordem_f = sorted(
        votos_f.items(),
        key=lambda x: -x[1] if x[0] not in ["indecisos", "branco_nulo"] else 0,
    )

    for candidato, qtd in ordem_f[:5]:
        nome = CANDIDATOS[candidato]["nome"].split("(")[0].strip()
        pct = qtd / total_f * 100
        barra = "=" * int(pct / 5)
        print(f"  {nome:25} {pct:5.1f}% {barra}")

print("\n" + "=" * 60)
print("Metodologia: Pesquisa simulada com eleitores sintéticos")
print("Banco: 400 eleitores estratificados por RA, cluster, idade, gênero")
print("=" * 60)
