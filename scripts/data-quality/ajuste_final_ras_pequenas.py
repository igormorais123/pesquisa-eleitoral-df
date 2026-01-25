"""
Ajuste Final - RAs com amostra muito pequena
Correcoes pontuais para maximizar validade
"""

import json

def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    mudancas = 0

    for e in eleitores:
        ra = e.get('regiao_administrativa', '')

        # SIA - apenas 1 eleitor
        if ra == 'SIA':
            e['cor_raca'] = 'branca'
            e['escolaridade'] = 'medio_completo_ou_sup_incompleto'
            e['renda_salarios_minimos'] = 'mais_de_2_ate_5'
            mudancas += 1

        # Candangolandia - 2 eleitores, precisa de 1 branco
        elif ra == 'Candangolândia':
            if e['cor_raca'] != 'branca':
                e['cor_raca'] = 'branca'
                mudancas += 1
                break  # So 1 precisa mudar

        # Fercal - renda muito baixa
        elif ra == 'Fercal':
            if e['renda_salarios_minimos'] == 'ate_1':
                e['renda_salarios_minimos'] = 'mais_de_1_ate_2'
                mudancas += 1

        # Park Way - escolaridade muito alta
        elif ra == 'Park Way':
            # Manter 3 com superior, 1 sem
            pass  # Ja esta ok, so 4 eleitores com 100% superior = 4 pessoas

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print(f"Ajustes finais: {mudancas}")

if __name__ == "__main__":
    main()
