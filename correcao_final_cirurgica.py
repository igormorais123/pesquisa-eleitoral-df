"""
Correcao Cirurgica Final - RAs com amostra minima
"""

import json

def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    mudancas = 0

    # Indices por RA
    sia_idx = []
    candango_idx = []
    fercal_idx = []
    parkway_idx = []

    for i, e in enumerate(eleitores):
        ra = e.get('regiao_administrativa', '')
        if ra == 'SIA':
            sia_idx.append(i)
        elif ra == 'Candangolândia':
            candango_idx.append(i)
        elif ra == 'Fercal':
            fercal_idx.append(i)
        elif ra == 'Park Way':
            parkway_idx.append(i)

    # SIA - 1 eleitor: ajustar tudo
    for i in sia_idx:
        eleitores[i]['cor_raca'] = 'branca'
        eleitores[i]['escolaridade'] = 'medio_completo_ou_sup_incompleto'
        eleitores[i]['renda_salarios_minimos'] = 'mais_de_2_ate_5'
        mudancas += 1
        print(f"SIA: Ajustado eleitor {eleitores[i]['id']}")

    # Candangolandia - 2 eleitores: 1 branco (50% ~ 25%)
    # Com 2 eleitores, so podemos ter 0%, 50% ou 100% branco
    # 50% e o mais proximo de 25%
    if len(candango_idx) >= 1:
        eleitores[candango_idx[0]]['cor_raca'] = 'branca'
        if len(candango_idx) >= 2:
            eleitores[candango_idx[1]]['cor_raca'] = 'parda'
        mudancas += 1
        print(f"Candangolandia: Ajustado")

    # Fercal - 4 eleitores: aumentar renda
    for i in fercal_idx:
        if eleitores[i]['renda_salarios_minimos'] == 'ate_1':
            eleitores[i]['renda_salarios_minimos'] = 'mais_de_1_ate_2'
            mudancas += 1
            print(f"Fercal: Aumentada renda de {eleitores[i]['id']}")

    # Park Way - 4 eleitores, 100% superior -> 75% (3 de 4)
    if len(parkway_idx) >= 4:
        # Manter 3 com superior, 1 rebaixar
        eleitores[parkway_idx[3]]['escolaridade'] = 'medio_completo_ou_sup_incompleto'
        mudancas += 1
        print(f"Park Way: Rebaixada escolaridade de {eleitores[parkway_idx[3]]['id']}")

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print(f"\nTotal de ajustes cirurgicos: {mudancas}")

if __name__ == "__main__":
    main()
