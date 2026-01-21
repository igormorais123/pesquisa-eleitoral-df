"""
Correção de cor/raça e distribuição por RA
- cor_raca: ajustar para 40% branca, 45% parda, 15% preta
- Sol Nascente: redistribuir excedentes para RAs sub-representadas
"""

import json
import random
from collections import Counter

random.seed(2034)

# Metas
METAS_COR = {
    "branca": 400,  # 40%
    "parda": 450,   # 45%
    "preta": 150,   # 15%
}

# RAs sub-representadas que vão receber eleitores do Sol Nascente
RAS_DESTINO = {
    "Recanto das Emas": 21,    # precisa +21
    "Plano Piloto": 22,        # precisa +22
    "Taguatinga": 8,           # precisa +8
}


def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    n = len(eleitores)

    # ==========================================================================
    # 1. CORRIGIR COR/RAÇA
    # ==========================================================================
    print("=" * 60)
    print("1. CORRIGINDO COR/RAÇA")
    print("=" * 60)

    cor_atual = Counter(e['cor_raca'] for e in eleitores)
    print("\nAntes:")
    for cor in ['branca', 'parda', 'preta']:
        v = cor_atual.get(cor, 0)
        print(f"  {cor}: {v} ({v/10:.1f}%) - meta: {METAS_COR[cor]} ({METAS_COR[cor]/10:.1f}%)")

    # Criar lista de cores na proporção correta
    cores_novas = []
    for cor, qtd in METAS_COR.items():
        cores_novas.extend([cor] * qtd)

    random.shuffle(cores_novas)

    # Aplicar novas cores
    for i, e in enumerate(eleitores):
        if i < len(cores_novas):
            e['cor_raca'] = cores_novas[i]

    cor_final = Counter(e['cor_raca'] for e in eleitores)
    print("\nDepois:")
    for cor in ['branca', 'parda', 'preta']:
        v = cor_final.get(cor, 0)
        meta = METAS_COR[cor]
        status = "[OK]" if v == meta else "[!]"
        print(f"  {cor}: {v} ({v/10:.1f}%) - meta: {meta} ({meta/10:.1f}%) {status}")

    # ==========================================================================
    # 2. CORRIGIR SOL NASCENTE - REDISTRIBUIR EXCEDENTES
    # ==========================================================================
    print()
    print("=" * 60)
    print("2. CORRIGINDO SOL NASCENTE/PÔR DO SOL")
    print("=" * 60)

    # Encontrar eleitores do Sol Nascente
    idx_sol_nascente = [i for i, e in enumerate(eleitores)
                       if 'Sol Nascente' in e.get('regiao_administrativa', '')]

    print(f"\nEleitores em Sol Nascente: {len(idx_sol_nascente)}")
    print(f"Meta: ~39 eleitores (3.9%)")
    print(f"Excedente: {len(idx_sol_nascente) - 39}")

    # Calcular quantos mover
    excedente = len(idx_sol_nascente) - 39

    if excedente > 0:
        # Selecionar aleatoriamente quais mover
        random.shuffle(idx_sol_nascente)
        idx_para_mover = idx_sol_nascente[:excedente]

        # Criar lista de destinos
        destinos = []
        for ra, qtd in RAS_DESTINO.items():
            destinos.extend([ra] * qtd)

        # Completar com outras RAs se necessário
        if len(destinos) < len(idx_para_mover):
            extras = ["Ceilândia", "Samambaia", "Gama", "Santa Maria"]
            while len(destinos) < len(idx_para_mover):
                destinos.append(random.choice(extras))

        random.shuffle(destinos)

        # Mover eleitores
        print(f"\nRedistribuindo {len(idx_para_mover)} eleitores:")
        redistribuicao = Counter()

        for i, idx in enumerate(idx_para_mover):
            if i < len(destinos):
                nova_ra = destinos[i]
                eleitores[idx]['regiao_administrativa'] = nova_ra
                redistribuicao[nova_ra] += 1

        for ra, qtd in redistribuicao.most_common():
            print(f"  -> {ra}: +{qtd}")

    # Verificar resultado
    ra_final = Counter(e['regiao_administrativa'] for e in eleitores)

    print("\nDistribuição final de RAs relevantes:")
    ras_verificar = ["Sol Nascente/Pôr do Sol", "Recanto das Emas", "Plano Piloto",
                     "Taguatinga", "Águas Claras", "Guará"]
    for ra in ras_verificar:
        v = ra_final.get(ra, 0)
        print(f"  {ra}: {v} ({v/10:.1f}%)")

    # ==========================================================================
    # SALVAR
    # ==========================================================================
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print()
    print("=" * 60)
    print("CORREÇÕES APLICADAS!")
    print("=" * 60)


if __name__ == "__main__":
    main()
