#!/usr/bin/env python3
"""
Script de Ajuste de Orientacao Politica - Versao 3
Reequilibrar a distribuicao que ficou muito a direita
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


def main():
    print("=" * 60)
    print("AJUSTE DE ORIENTACAO POLITICA - VERSAO 3")
    print("=" * 60)

    eleitores = carregar()
    total = len(eleitores)

    # Metas de orientacao (referencia DataSenado/Datafolha + sem posicao)
    # A soma eh menor que 100% pq ~40% nao se identificam
    # Vou redistribuir para 100% mantendo proporcoes
    metas = {
        "esquerda": 150,  # 15%
        "centro_esquerda": 70,  # 7%
        "centro": 110,  # 11%
        "centro_direita": 110,  # 11%
        "direita": 290,  # 29%
    }
    # Os 27% restantes ficam distribuidos (nao se identificam)
    # Vou add mais ~140 para esquerda e ~140 para direita para dar 1000

    # Calcular atual
    dist = {}
    for e in eleitores:
        ori = e.get("orientacao_politica", "centro")
        dist[ori] = dist.get(ori, 0) + 1

    print("\nDistribuicao atual:")
    for o in ["esquerda", "centro_esquerda", "centro", "centro_direita", "direita"]:
        print(f"  {o}: {dist.get(o, 0)} ({100 * dist.get(o, 0) / total:.1f}%)")

    # Excesso de direita e centro-direita
    excesso_direita = dist.get("direita", 0) - metas["direita"]
    excesso_centro_dir = dist.get("centro_direita", 0) - metas["centro_direita"]

    # Falta de esquerda e centro-esquerda
    falta_esquerda = metas["esquerda"] - dist.get("esquerda", 0)
    falta_centro_esq = metas["centro_esquerda"] - dist.get("centro_esquerda", 0)

    print(f"\nExcesso direita: {excesso_direita}")
    print(f"Excesso centro-direita: {excesso_centro_dir}")
    print(f"Falta esquerda: {falta_esquerda}")
    print(f"Falta centro-esquerda: {falta_centro_esq}")

    ajustes = 0

    # Pegar eleitores de direita e mudar alguns para esquerda
    direitistas = [e for e in eleitores if e.get("orientacao_politica") == "direita"]
    random.shuffle(direitistas)

    # Mudar parte da direita para esquerda
    for e in direitistas[:falta_esquerda]:
        e["orientacao_politica"] = "esquerda"
        # Ajustar posicao Bolsonaro
        e["posicao_bolsonaro"] = random.choices(
            ["critico_forte", "critico_moderado", "neutro"], weights=[0.45, 0.35, 0.20]
        )[0]
        ajustes += 1

    # Mudar parte da centro-direita para centro-esquerda
    centro_dir = [
        e for e in eleitores if e.get("orientacao_politica") == "centro_direita"
    ]
    random.shuffle(centro_dir)

    for e in centro_dir[:falta_centro_esq]:
        e["orientacao_politica"] = "centro_esquerda"
        e["posicao_bolsonaro"] = random.choices(
            ["critico_forte", "critico_moderado", "neutro"], weights=[0.40, 0.40, 0.20]
        )[0]
        ajustes += 1

    # Recalcular
    dist = {}
    for e in eleitores:
        ori = e.get("orientacao_politica", "centro")
        dist[ori] = dist.get(ori, 0) + 1

    # Se ainda tiver excesso de centro-direita, mover para centro
    excesso_centro_dir = dist.get("centro_direita", 0) - metas["centro_direita"]
    falta_centro = metas["centro"] - dist.get("centro", 0)

    if excesso_centro_dir > 0 and falta_centro < 0:
        # Centro ja esta ok, vamos mover para direita ou esquerda
        centro_dir = [
            e for e in eleitores if e.get("orientacao_politica") == "centro_direita"
        ]
        random.shuffle(centro_dir)

        # Distribuir entre direita e esquerda
        for i, e in enumerate(centro_dir[:excesso_centro_dir]):
            if i % 2 == 0:
                e["orientacao_politica"] = "direita"
                e["posicao_bolsonaro"] = random.choice(
                    ["apoiador_forte", "apoiador_moderado"]
                )
            else:
                e["orientacao_politica"] = "esquerda"
                e["posicao_bolsonaro"] = random.choice(
                    ["critico_forte", "critico_moderado"]
                )
            ajustes += 1

    print(f"\nTotal de ajustes: {ajustes}")

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

    # Verificar coerencia orientacao x bolsonaro
    print("\n" + "=" * 60)
    print("VERIFICACAO DE COERENCIA")
    print("=" * 60)

    incoerentes = 0
    for e in eleitores:
        ori = e.get("orientacao_politica", "")
        pos = e.get("posicao_bolsonaro", "")

        # Esquerda + apoiador forte = muito incoerente
        if ori == "esquerda" and pos == "apoiador_forte":
            incoerentes += 1
            e["posicao_bolsonaro"] = random.choice(
                ["critico_forte", "critico_moderado"]
            )

    print(f"Incoerencias corrigidas (esquerda+apoiador_forte): {incoerentes}")

    if incoerentes > 0:
        salvar(eleitores)

    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
