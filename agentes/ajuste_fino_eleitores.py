#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ajuste fino do banco de eleitores
"""

import json
import random
from collections import Counter

ARQUIVO = r"C:\Agentes\agentes\banco-eleitores-df.json"

def main():
    with open(ARQUIVO, 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    correcoes = 0

    # 1. Desempregados devem ter renda ate_1
    for e in eleitores:
        if e['ocupacao_vinculo'] == 'desempregado' and e['renda_salarios_minimos'] != 'ate_1':
            e['renda_salarios_minimos'] = 'ate_1'
            correcoes += 1
            print(f"Corrigido renda desempregado: {e['id']}")

    # 2. Profissoes de alta renda devem ter renda adequada
    profissoes_alta = ['medico', 'advogado', 'engenheiro', 'delegado', 'juiz', 'promotor', 'procurador', 'dentista', 'desembargador']
    for e in eleitores:
        prof_lower = e['profissao'].lower() if e['profissao'] else ''
        if any(p in prof_lower for p in profissoes_alta):
            if e['ocupacao_vinculo'] not in ['aposentado', 'desempregado', 'estudante']:
                if e['renda_salarios_minimos'] in ['ate_1', 'mais_de_1_ate_2', 'mais_de_2_ate_5']:
                    e['renda_salarios_minimos'] = 'mais_de_5_ate_10'
                    correcoes += 1
                    print(f"Corrigido renda profissao: {e['id']} - {e['profissao']}")

    # 3. Redistribuir Ceilandia para outras regioes
    contagem = Counter(e['regiao_administrativa'] for e in eleitores)
    ceilandia_atual = contagem.get('Ceilândia', 0)

    if ceilandia_atual > 100:
        excesso = ceilandia_atual - 100
        regioes_destino = ['Taguatinga', 'Gama', 'Planaltina', 'Santa Maria', 'Brazlândia', 'Sobradinho']
        locais_referencia = {
            'Taguatinga': ['no Centro', 'na QNA', 'na QNL', 'perto do Shopping'],
            'Gama': ['no Setor Central', 'no Setor Leste', 'no Setor Oeste'],
            'Planaltina': ['no Centro', 'no Setor Tradicional', 'na Vila Buritis'],
            'Santa Maria': ['no Centro', 'na QR', 'perto do Terminal'],
            'Brazlândia': ['no Centro', 'na Vila São José', 'no Setor Tradicional'],
            'Sobradinho': ['no Centro', 'na Quadra', 'perto do Terminal']
        }

        eleitores_ceilandia = [e for e in eleitores if e['regiao_administrativa'] == 'Ceilândia']
        random.shuffle(eleitores_ceilandia)

        for i, e in enumerate(eleitores_ceilandia[:excesso]):
            nova_regiao = regioes_destino[i % len(regioes_destino)]
            e['regiao_administrativa'] = nova_regiao
            e['local_referencia'] = f"perto {random.choice(locais_referencia[nova_regiao])}"
            correcoes += 1

        print(f"\nRedistribuidos {excesso} eleitores de Ceilandia para outras regioes")

    # Verifica distribuicao final
    contagem_final = Counter(e['regiao_administrativa'] for e in eleitores)
    print("\n=== DISTRIBUICAO FINAL ===")
    for ra, count in sorted(contagem_final.items(), key=lambda x: -x[1])[:10]:
        print(f"{ra}: {count} ({count/10:.1f}%)")

    # Salva arquivo
    with open(ARQUIVO, 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print(f"\nTotal de correcoes: {correcoes}")
    print("[OK] Arquivo salvo com sucesso!")

if __name__ == "__main__":
    random.seed(42)
    main()
