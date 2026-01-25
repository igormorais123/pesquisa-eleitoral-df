"""
Correcao Final de Renda - Alinhamento com PDAD
O PDAD usa renda DOMICILIAR, nao per capita
"""

import json
import random

random.seed(2027)

# Renda domiciliar media PDAD -> faixas de salario minimo correspondentes
# SM 2024 = R$ 1.412
# ate_1 = ~706, mais_de_1_ate_2 = ~2.118, mais_de_2_ate_5 = ~4.942
# mais_de_5_ate_10 = ~10.590, mais_de_10_ate_20 = ~21.180, mais_de_20 = ~35.300

CORRECOES_RENDA = {
    # Renda muito baixa no banco - precisa aumentar
    "Santa Maria": {
        "renda_alvo": 3800,  # PDAD
        "faixas": ["mais_de_1_ate_2", "mais_de_2_ate_5"],  # media ~3.500
        "peso": [0.6, 0.4]
    },
    "Riacho Fundo II": {
        "renda_alvo": 3800,
        "faixas": ["mais_de_1_ate_2", "mais_de_2_ate_5"],
        "peso": [0.5, 0.5]
    },
    "Fercal": {
        "renda_alvo": 2800,
        "faixas": ["mais_de_1_ate_2", "mais_de_2_ate_5"],
        "peso": [0.7, 0.3]
    },
    "Paranoá": {
        "renda_alvo": 3500,
        "faixas": ["mais_de_1_ate_2", "mais_de_2_ate_5"],
        "peso": [0.6, 0.4]
    },
    "Paranoa": {  # Sem acento
        "renda_alvo": 3500,
        "faixas": ["mais_de_1_ate_2", "mais_de_2_ate_5"],
        "peso": [0.6, 0.4]
    },
    "São Sebastião": {
        "renda_alvo": 3700,
        "faixas": ["mais_de_1_ate_2", "mais_de_2_ate_5"],
        "peso": [0.55, 0.45]
    },
    "Brazlândia": {
        "renda_alvo": 3900,
        "faixas": ["mais_de_1_ate_2", "mais_de_2_ate_5"],
        "peso": [0.5, 0.5]
    },
    "Candangolândia": {
        "renda_alvo": 4200,
        "faixas": ["mais_de_2_ate_5"],
        "peso": [1.0]
    },
    "Itapoã": {
        "renda_alvo": 2900,
        "faixas": ["mais_de_1_ate_2", "mais_de_2_ate_5"],
        "peso": [0.7, 0.3]
    },
    # Lago Sul precisa aumentar muito
    "Lago Sul": {
        "renda_alvo": 23591,
        "faixas": ["mais_de_10_ate_20", "mais_de_20"],
        "peso": [0.3, 0.7]
    },
    # SIA precisa diminuir
    "SIA": {
        "renda_alvo": 5500,
        "faixas": ["mais_de_2_ate_5", "mais_de_5_ate_10"],
        "peso": [0.5, 0.5]
    },
    # Candangolandia - idade e cor tambem
    "Candangolândia": {
        "renda_alvo": 4200,
        "faixas": ["mais_de_2_ate_5"],
        "peso": [1.0],
        "idade_alvo": 35,
        "cor_branca_pct": 25,
    },
}


def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    mudancas = 0

    for e in eleitores:
        ra = e.get('regiao_administrativa', '')
        correcao = CORRECOES_RENDA.get(ra)

        if correcao:
            # Corrigir renda
            faixas = correcao['faixas']
            pesos = correcao['peso']
            nova_renda = random.choices(faixas, weights=pesos, k=1)[0]
            if e['renda_salarios_minimos'] != nova_renda:
                e['renda_salarios_minimos'] = nova_renda
                mudancas += 1

            # Corrigir idade se especificado
            if 'idade_alvo' in correcao:
                idade_alvo = correcao['idade_alvo']
                variacao = random.randint(-5, 5)
                e['idade'] = max(18, min(idade_alvo + variacao, 65))

            # Corrigir cor se especificado
            if 'cor_branca_pct' in correcao:
                pct = correcao['cor_branca_pct']
                if random.random() < pct / 100:
                    e['cor_raca'] = 'branca'
                else:
                    e['cor_raca'] = random.choice(['parda', 'parda', 'preta'])

    # SIA - apenas 1 eleitor, forcar valores
    for e in eleitores:
        if e.get('regiao_administrativa') == 'SIA':
            e['renda_salarios_minimos'] = 'mais_de_2_ate_5'
            e['escolaridade'] = 'medio_completo_ou_sup_incompleto'
            e['cor_raca'] = 'parda'
            e['idade'] = 38
            mudancas += 1

    # Candangolandia - 2 eleitores
    candango_count = 0
    for e in eleitores:
        if e.get('regiao_administrativa') == 'Candangolândia':
            e['renda_salarios_minimos'] = 'mais_de_2_ate_5'
            e['idade'] = 35 + random.randint(-3, 3)
            if candango_count == 0:
                e['cor_raca'] = 'branca'
            else:
                e['cor_raca'] = 'parda'
            candango_count += 1
            mudancas += 1

    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print(f"Correcoes de renda: {mudancas}")


if __name__ == "__main__":
    main()
