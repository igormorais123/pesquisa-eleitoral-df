"""
Correcao de Susceptibilidade a Desinformacao
Fonte: Reuters Institute / Digital News Report 2024

Metas:
- Baixa: 25%
- Media: 45%
- Alta: 30%

Correlacao negativa com escolaridade:
- Superior completo -> maior chance de baixa susceptibilidade
- Fundamental -> maior chance de alta susceptibilidade
"""

import json
import random
from collections import Counter

random.seed(2026)

# Metas Reuters Institute
META_BAIXA = 0.25
META_MEDIA = 0.45
META_ALTA = 0.30

# Probabilidades por escolaridade (correlacao negativa)
PROB_POR_ESCOLARIDADE = {
    "superior_completo_ou_pos": {
        "baixa": 0.45,  # Mais escolarizados = mais resistentes
        "media": 0.40,
        "alta": 0.15,
    },
    "medio_completo_ou_sup_incompleto": {
        "baixa": 0.25,
        "media": 0.50,
        "alta": 0.25,
    },
    "fundamental_completo": {
        "baixa": 0.15,
        "media": 0.45,
        "alta": 0.40,
    },
    "fundamental_incompleto": {
        "baixa": 0.10,
        "media": 0.40,
        "alta": 0.50,  # Menos escolarizados = mais vulneraveis
    },
}

# Ajuste adicional por fontes de informacao
FONTES_RISCO_ALTO = ["WhatsApp", "Facebook", "TikTok", "YouTube"]
FONTES_RISCO_BAIXO = ["Jornal impresso", "Folha", "Estadao", "G1", "BBC"]


def calcular_susceptibilidade(eleitor):
    """Calcula susceptibilidade baseado em escolaridade e fontes"""
    escolaridade = eleitor.get('escolaridade', 'medio_completo_ou_sup_incompleto')
    fontes = eleitor.get('fontes_informacao', [])

    # Probabilidades base por escolaridade
    probs = PROB_POR_ESCOLARIDADE.get(
        escolaridade,
        PROB_POR_ESCOLARIDADE['medio_completo_ou_sup_incompleto']
    ).copy()

    # Ajuste por fontes de informacao
    fontes_str = ' '.join(fontes) if isinstance(fontes, list) else str(fontes)

    # Fontes de risco aumentam susceptibilidade
    for fonte_risco in FONTES_RISCO_ALTO:
        if fonte_risco.lower() in fontes_str.lower():
            probs['alta'] += 0.05
            probs['baixa'] -= 0.03
            probs['media'] -= 0.02

    # Fontes confiaveis diminuem susceptibilidade
    for fonte_segura in FONTES_RISCO_BAIXO:
        if fonte_segura.lower() in fontes_str.lower():
            probs['baixa'] += 0.05
            probs['alta'] -= 0.03
            probs['media'] -= 0.02

    # Normalizar probabilidades
    total = sum(probs.values())
    for k in probs:
        probs[k] = max(0.05, probs[k] / total)

    # Escolher susceptibilidade
    r = random.random()
    if r < probs['baixa']:
        return 'baixa'
    elif r < probs['baixa'] + probs['media']:
        return 'media'
    else:
        return 'alta'


def ajustar_para_metas(eleitores):
    """Ajusta distribuicao para atingir metas globais"""
    n = len(eleitores)

    # Contar atual
    atual = Counter(e.get('susceptibilidade_desinformacao') for e in eleitores)
    print(f"Antes do ajuste: {dict(atual)}")

    # Calcular quantos precisamos de cada
    n_baixa_alvo = int(n * META_BAIXA)
    n_media_alvo = int(n * META_MEDIA)
    n_alta_alvo = n - n_baixa_alvo - n_media_alvo

    n_baixa_atual = atual.get('baixa', 0)
    n_media_atual = atual.get('media', 0)
    n_alta_atual = atual.get('alta', 0)

    # Ajustar excesso de media para baixa/alta
    if n_baixa_atual < n_baixa_alvo:
        # Converter alguns media para baixa (os mais escolarizados)
        candidatos = [i for i, e in enumerate(eleitores)
                     if e.get('susceptibilidade_desinformacao') == 'media'
                     and e.get('escolaridade') == 'superior_completo_ou_pos']
        random.shuffle(candidatos)
        conversoes = min(len(candidatos), n_baixa_alvo - n_baixa_atual)
        for i in candidatos[:conversoes]:
            eleitores[i]['susceptibilidade_desinformacao'] = 'baixa'

    if n_alta_atual < n_alta_alvo:
        # Converter alguns media para alta (os menos escolarizados)
        candidatos = [i for i, e in enumerate(eleitores)
                     if e.get('susceptibilidade_desinformacao') == 'media'
                     and e.get('escolaridade') in ['fundamental_incompleto', 'fundamental_completo']]
        random.shuffle(candidatos)
        conversoes = min(len(candidatos), n_alta_alvo - n_alta_atual)
        for i in candidatos[:conversoes]:
            eleitores[i]['susceptibilidade_desinformacao'] = 'alta'

    return eleitores


def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    n = len(eleitores)
    print(f"Total de eleitores: {n}")
    print(f"Metas: baixa={META_BAIXA*100}%, media={META_MEDIA*100}%, alta={META_ALTA*100}%")
    print()

    # Recalcular susceptibilidade para todos
    for e in eleitores:
        e['susceptibilidade_desinformacao'] = calcular_susceptibilidade(e)

    # Verificar distribuicao
    dist = Counter(e['susceptibilidade_desinformacao'] for e in eleitores)
    print(f"Apos calculo individual: baixa={dist['baixa']} ({dist['baixa']/n*100:.1f}%), "
          f"media={dist['media']} ({dist['media']/n*100:.1f}%), "
          f"alta={dist['alta']} ({dist['alta']/n*100:.1f}%)")

    # Ajustar para metas
    eleitores = ajustar_para_metas(eleitores)

    # Verificar final
    dist = Counter(e['susceptibilidade_desinformacao'] for e in eleitores)
    print(f"\nDistribuicao final:")
    print(f"  baixa: {dist['baixa']} ({dist['baixa']/n*100:.1f}%) - meta: 25%")
    print(f"  media: {dist['media']} ({dist['media']/n*100:.1f}%) - meta: 45%")
    print(f"  alta: {dist['alta']} ({dist['alta']/n*100:.1f}%) - meta: 30%")

    # Verificar correlacao com escolaridade
    print("\nCorrelacao com escolaridade:")
    for esc in ['superior_completo_ou_pos', 'medio_completo_ou_sup_incompleto',
                'fundamental_completo', 'fundamental_incompleto']:
        subset = [e for e in eleitores if e.get('escolaridade') == esc]
        if subset:
            dist_esc = Counter(e['susceptibilidade_desinformacao'] for e in subset)
            n_esc = len(subset)
            print(f"  {esc}:")
            print(f"    baixa: {dist_esc.get('baixa', 0)/n_esc*100:.1f}%, "
                  f"media: {dist_esc.get('media', 0)/n_esc*100:.1f}%, "
                  f"alta: {dist_esc.get('alta', 0)/n_esc*100:.1f}%")

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print("\nArquivo salvo!")


if __name__ == "__main__":
    main()
