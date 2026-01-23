#!/usr/bin/env python3
"""
Script de Ajuste Final - Versao 4
Ajusta orientacao politica diretamente para as metas
"""

import json
import random

ARQUIVO = "agentes/banco-eleitores-df.json"
ARQUIVO_FRONTEND = "frontend/src/data/eleitores-df-1000.json"


def carregar():
    with open(ARQUIVO, "r", encoding="utf-8") as f:
        return json.load(f)


def salvar(eleitores):
    with open(ARQUIVO, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)
    with open(ARQUIVO_FRONTEND, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)


def ajustar_posicao_bolsonaro(eleitor):
    """Ajusta posicao Bolsonaro para ser coerente com orientacao"""
    ori = eleitor.get("orientacao_politica", "centro")

    if ori == "esquerda":
        eleitor["posicao_bolsonaro"] = random.choices(
            ["critico_forte", "critico_moderado", "neutro"], weights=[0.50, 0.35, 0.15]
        )[0]
    elif ori == "centro_esquerda":
        eleitor["posicao_bolsonaro"] = random.choices(
            ["critico_forte", "critico_moderado", "neutro"], weights=[0.40, 0.40, 0.20]
        )[0]
    elif ori == "centro":
        eleitor["posicao_bolsonaro"] = random.choices(
            ["neutro", "critico_moderado", "apoiador_moderado"],
            weights=[0.40, 0.30, 0.30],
        )[0]
    elif ori == "centro_direita":
        eleitor["posicao_bolsonaro"] = random.choices(
            ["apoiador_moderado", "neutro", "apoiador_forte"],
            weights=[0.40, 0.30, 0.30],
        )[0]
    elif ori == "direita":
        eleitor["posicao_bolsonaro"] = random.choices(
            ["apoiador_forte", "apoiador_moderado", "neutro"],
            weights=[0.45, 0.35, 0.20],
        )[0]


def main():
    print("=" * 60)
    print("AJUSTE FINAL - VERSAO 4")
    print("=" * 60)

    eleitores = carregar()
    total = len(eleitores)

    # Metas exatas de orientacao politica
    # Baseado em DataSenado/Datafolha distribuindo os 100%
    metas = {
        "esquerda": 150,  # 15%
        "centro_esquerda": 70,  # 7%
        "centro": 110,  # 11%
        "centro_direita": 110,  # 11%
        "direita": 290,  # 29%
    }
    # Os outros 27% (270) serao distribuidos proporcionalmente
    # Esquerda: +40, Centro-esquerda: +20, Centro: +30, Centro-direita: +30, Direita: +80
    # Totais finais: esquerda: 190, centro_esq: 90, centro: 140, centro_dir: 140, direita: 370
    # Mas vamos usar as metas originais que somam ~73%
    # Redistribuindo para 1000:
    # esquerda: 150/730 * 1000 = 205
    # centro_esq: 70/730 * 1000 = 96
    # centro: 110/730 * 1000 = 151
    # centro_dir: 110/730 * 1000 = 151
    # direita: 290/730 * 1000 = 397

    # Vou usar metas mais realistas para o DF (mais direita que media nacional)
    metas = {
        "esquerda": 180,  # 18%
        "centro_esquerda": 90,  # 9%
        "centro": 120,  # 12%
        "centro_direita": 140,  # 14%
        "direita": 310,  # 31%
    }
    # Total: 840. Falta 160 que serao adicionados a direita (DF eh mais conservador)
    # Ajustando: direita: 310 + 160 = 470 (47%) - muito alto
    # Vou balancear melhor
    metas = {
        "esquerda": 200,  # 20%
        "centro_esquerda": 100,  # 10%
        "centro": 120,  # 12%
        "centro_direita": 150,  # 15%
        "direita": 340,  # 34%
    }
    # Total: 910. Falta 90, vou add: esquerda+30, direita+60
    metas = {
        "esquerda": 230,  # 23%
        "centro_esquerda": 100,  # 10%
        "centro": 120,  # 12%
        "centro_direita": 150,  # 15%
        "direita": 400,  # 40%
    }

    # Calcular atual
    dist = {}
    for e in eleitores:
        ori = e.get("orientacao_politica", "centro")
        dist[ori] = dist.get(ori, 0) + 1

    print("\nDistribuicao atual:")
    for o in ["esquerda", "centro_esquerda", "centro", "centro_direita", "direita"]:
        print(f"  {o}: {dist.get(o, 0)} ({100 * dist.get(o, 0) / total:.1f}%)")

    print("\nMetas:")
    for o in ["esquerda", "centro_esquerda", "centro", "centro_direita", "direita"]:
        print(f"  {o}: {metas[o]} ({100 * metas[o] / total:.1f}%)")

    # Separar eleitores por orientacao
    por_orientacao = {}
    for o in ["esquerda", "centro_esquerda", "centro", "centro_direita", "direita"]:
        por_orientacao[o] = [e for e in eleitores if e.get("orientacao_politica") == o]
        random.shuffle(por_orientacao[o])

    # Calcular excesso/falta
    ajustes_necessarios = {}
    for o in metas:
        ajustes_necessarios[o] = dist.get(o, 0) - metas[o]

    print("\nAjustes necessarios:")
    for o, qtd in ajustes_necessarios.items():
        print(f"  {o}: {qtd:+d}")

    # Estrategia: mover do excesso para a falta
    total_ajustes = 0

    # Ordem de prioridade para mover
    # Excesso de esquerda -> mover para centro, centro-esquerda
    # Excesso de direita -> mover para centro, centro-direita

    # Passo 1: Reduzir excesso de direita
    excesso_dir = max(0, ajustes_necessarios["direita"])
    falta_centro_dir = max(0, -ajustes_necessarios["centro_direita"])

    mover = min(excesso_dir, falta_centro_dir)
    for e in por_orientacao["direita"][:mover]:
        e["orientacao_politica"] = "centro_direita"
        ajustar_posicao_bolsonaro(e)
        total_ajustes += 1

    # Recalcular
    dist = {}
    for e in eleitores:
        ori = e.get("orientacao_politica", "centro")
        dist[ori] = dist.get(ori, 0) + 1

    # Passo 2: Ajustar centro
    for o in metas:
        atual = dist.get(o, 0)
        meta = metas[o]
        diff = atual - meta

        if diff > 0:  # Excesso
            # Encontrar destinos com falta
            destinos = []
            for dest in metas:
                if dist.get(dest, 0) < metas[dest]:
                    destinos.append(dest)

            if destinos:
                eleitores_ori = [
                    e for e in eleitores if e.get("orientacao_politica") == o
                ]
                random.shuffle(eleitores_ori)

                for e in eleitores_ori[:diff]:
                    # Escolher destino com mais falta
                    destino = min(destinos, key=lambda d: dist.get(d, 0) - metas[d])
                    if dist.get(destino, 0) < metas[destino]:
                        e["orientacao_politica"] = destino
                        ajustar_posicao_bolsonaro(e)
                        dist[o] -= 1
                        dist[destino] = dist.get(destino, 0) + 1
                        total_ajustes += 1

    print(f"\nTotal de ajustes: {total_ajustes}")

    # Salvar
    salvar(eleitores)

    # Relatorio final
    print("\n" + "=" * 60)
    print("NOVA DISTRIBUICAO")
    print("=" * 60)

    dist = {}
    for e in eleitores:
        ori = e.get("orientacao_politica", "centro")
        dist[ori] = dist.get(ori, 0) + 1

    print("\nOrientacao Politica:")
    for o in ["esquerda", "centro_esquerda", "centro", "centro_direita", "direita"]:
        qtd = dist.get(o, 0)
        meta = metas[o]
        print(
            f"  {o}: {qtd} ({100 * qtd / total:.1f}%) | Meta: {meta} ({100 * meta / total:.1f}%) | Desvio: {qtd - meta:+d}"
        )

    # Verificar distribuicao de posicao Bolsonaro
    print("\nPosicao sobre Bolsonaro:")
    dist_bol = {}
    for e in eleitores:
        pos = e.get("posicao_bolsonaro", "neutro")
        dist_bol[pos] = dist_bol.get(pos, 0) + 1

    metas_bol = {
        "critico_forte": 340,
        "critico_moderado": 200,
        "neutro": 200,
        "apoiador_moderado": 110,
        "apoiador_forte": 150,
    }
    for p in [
        "critico_forte",
        "critico_moderado",
        "neutro",
        "apoiador_moderado",
        "apoiador_forte",
    ]:
        qtd = dist_bol.get(p, 0)
        meta = metas_bol.get(p, 0)
        print(
            f"  {p}: {qtd} ({100 * qtd / total:.1f}%) | Meta: {meta} ({100 * meta / total:.1f}%)"
        )

    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
