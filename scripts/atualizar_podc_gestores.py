"""
Script para atualizar distribuições PODC no banco de gestores.

Baseado na metodologia do artigo:
- Estratégico: mais P+O (formulador), IAD > 1
- Tático: equilibrado, IAD ~ 1
- Operacional: mais D+C (executor), IAD < 1

Autor: Claude
"""

import json
import random
from pathlib import Path

# Caminho do arquivo
ARQUIVO_GESTORES = Path(__file__).parent.parent / "agentes" / "banco-gestores.json"

# Distribuições base por nível hierárquico (com variação)
DISTRIBUICOES_BASE = {
    "estrategico": {
        "publico": {"planejar": 30, "organizar": 27, "dirigir": 23, "controlar": 20},
        "privado": {"planejar": 32, "organizar": 30, "dirigir": 22, "controlar": 16},
    },
    "tatico": {
        "publico": {"planejar": 22, "organizar": 25, "dirigir": 28, "controlar": 25},
        "privado": {"planejar": 25, "organizar": 28, "dirigir": 27, "controlar": 20},
    },
    "operacional": {
        "publico": {"planejar": 12, "organizar": 18, "dirigir": 38, "controlar": 32},
        "privado": {"planejar": 15, "organizar": 20, "dirigir": 42, "controlar": 23},
    },
}

# Variação máxima por função (%)
VARIACAO_MAX = 5


def gerar_distribuicao(nivel: str, setor: str) -> dict:
    """Gera distribuição PODC com variação aleatória."""
    base = DISTRIBUICOES_BASE.get(nivel, {}).get(setor, DISTRIBUICOES_BASE["tatico"]["publico"])

    # Adiciona variação aleatória
    dist = {}
    for func, valor in base.items():
        variacao = random.uniform(-VARIACAO_MAX, VARIACAO_MAX)
        dist[func] = max(5, min(50, valor + variacao))  # Limita entre 5% e 50%

    # Normaliza para somar 100%
    total = sum(dist.values())
    for func in dist:
        dist[func] = round((dist[func] / total) * 100, 1)

    # Ajusta para somar exatamente 100
    diferenca = 100 - sum(dist.values())
    dist["dirigir"] = round(dist["dirigir"] + diferenca, 1)

    return dist


def calcular_iad(dist: dict) -> float:
    """Calcula Índice de Autonomia Decisória."""
    numerador = dist["planejar"] + dist["organizar"]
    denominador = dist["dirigir"] + dist["controlar"]
    if denominador == 0:
        return 0
    return round(numerador / denominador, 2)


def classificar_iad(iad: float) -> str:
    """Classifica o perfil baseado no IAD."""
    if iad >= 2.0:
        return "Formulador Puro"
    elif iad >= 1.5:
        return "Formulador"
    elif iad >= 1.0:
        return "Equilibrado"
    elif iad >= 0.7:
        return "Executor"
    else:
        return "Executor Puro"


def main():
    print("=" * 60)
    print("ATUALIZANDO DISTRIBUIÇÕES PODC NO BANCO DE GESTORES")
    print("=" * 60)

    # Carrega arquivo
    with open(ARQUIVO_GESTORES, "r", encoding="utf-8") as f:
        dados = json.load(f)

    gestores = dados.get("gestores", [])
    print(f"\nTotal de gestores: {len(gestores)}")

    # Estatísticas
    stats = {
        "estrategico": {"publico": [], "privado": []},
        "tatico": {"publico": [], "privado": []},
        "operacional": {"publico": [], "privado": []},
    }

    # Atualiza cada gestor
    for gestor in gestores:
        nivel = gestor.get("nivel_hierarquico", "tatico")
        setor = gestor.get("setor", "publico")

        # Gera nova distribuição
        nova_dist = gerar_distribuicao(nivel, setor)
        gestor["distribuicao_podc"] = nova_dist

        # Calcula IAD
        iad = calcular_iad(nova_dist)
        gestor["iad"] = iad
        gestor["iad_classificacao"] = classificar_iad(iad)

        # Registra para estatísticas
        if nivel in stats:
            stats[nivel][setor].append(iad)

    # Salva arquivo atualizado
    with open(ARQUIVO_GESTORES, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)

    print("\n[OK] Arquivo atualizado com sucesso!")

    # Mostra estatísticas
    print("\n" + "=" * 60)
    print("ESTATÍSTICAS DE IAD POR NÍVEL E SETOR")
    print("=" * 60)

    for nivel in ["estrategico", "tatico", "operacional"]:
        print(f"\n{nivel.upper()}:")
        for setor in ["publico", "privado"]:
            iads = stats[nivel][setor]
            if iads:
                media = sum(iads) / len(iads)
                minimo = min(iads)
                maximo = max(iads)
                print(f"  {setor}: média IAD = {media:.2f} (min: {minimo:.2f}, max: {maximo:.2f})")

    # Mostra exemplos
    print("\n" + "=" * 60)
    print("EXEMPLOS DE DISTRIBUIÇÃO")
    print("=" * 60)

    for nivel in ["estrategico", "tatico", "operacional"]:
        exemplo = next((g for g in gestores if g["nivel_hierarquico"] == nivel), None)
        if exemplo:
            dist = exemplo["distribuicao_podc"]
            iad = exemplo["iad"]
            print(f"\n{nivel.upper()} - {exemplo['nome']}:")
            print(f"  P={dist['planejar']}% O={dist['organizar']}% D={dist['dirigir']}% C={dist['controlar']}%")
            print(f"  IAD: {iad} ({exemplo['iad_classificacao']})")


if __name__ == "__main__":
    main()
