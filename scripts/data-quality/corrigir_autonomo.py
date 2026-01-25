"""
Correcao Cirurgica - Reequilibrar Autonomo
Problema: autonomo em 14.4% vs meta de 25%
Solucao: Converter CLT de baixa renda para autonomo (coerente)
"""

import json
import random
from collections import Counter

random.seed(2026)


def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    n = len(eleitores)

    # Contagem atual
    ocupacoes = Counter(e['ocupacao_vinculo'] for e in eleitores)
    print("Ocupacao atual:")
    for k, v in sorted(ocupacoes.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v} ({v/n*100:.1f}%)")

    # Meta: autonomo = 25% = 250
    n_autonomo_atual = sum(1 for e in eleitores if e.get('ocupacao_vinculo') == 'autonomo')
    n_autonomo_alvo = int(n * 0.25)
    falta = n_autonomo_alvo - n_autonomo_atual

    print(f"\nAutonomo: {n_autonomo_atual} -> {n_autonomo_alvo} (falta: {falta})")

    if falta <= 0:
        print("Autonomo ja esta OK!")
        return

    # Candidatos para conversao: CLT de baixa/media renda
    # Autonomo eh coerente com qualquer escolaridade e renda baixa-media
    candidatos = []
    for i, e in enumerate(eleitores):
        if e.get('ocupacao_vinculo') == 'clt':
            renda = e.get('renda_salarios_minimos', '')
            idade = e.get('idade', 30)

            # Autonomo eh comum em:
            # - Renda baixa-media (ate 5 SM)
            # - Qualquer escolaridade
            # - Idade 25-60 (trabalhadores ativos)
            if renda in ['ate_1', 'mais_de_1_ate_2', 'mais_de_2_ate_5']:
                if 25 <= idade <= 60:
                    candidatos.append(i)

    print(f"Candidatos CLT para conversao: {len(candidatos)}")

    random.shuffle(candidatos)
    conversoes = min(len(candidatos), falta)

    profissoes_autonomo = [
        'Pedreiro', 'Eletricista', 'Encanador', 'Pintor',
        'Mecanico', 'Marceneiro', 'Motorista de App',
        'Diarista', 'Manicure', 'Cabeleireiro(a)',
        'Vendedor Ambulante', 'Feirante', 'Costureira',
        'Prestador de Servicos', 'Fotografo', 'Designer Grafico'
    ]

    for i in candidatos[:conversoes]:
        eleitores[i]['ocupacao_vinculo'] = 'autonomo'
        # Ajustar profissao para algo tipico de autonomo
        prof_atual = eleitores[i].get('profissao', '')
        if 'Atendente' in prof_atual or 'Caixa' in prof_atual or 'Auxiliar' in prof_atual:
            eleitores[i]['profissao'] = random.choice(profissoes_autonomo)

    # Verificar resultado
    ocupacoes_depois = Counter(e['ocupacao_vinculo'] for e in eleitores)
    print("\nOcupacao apos correcao:")
    for k, v in sorted(ocupacoes_depois.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v} ({v/n*100:.1f}%)")

    # Verificar se CLT ficou muito baixo
    n_clt = ocupacoes_depois.get('clt', 0)
    if n_clt < int(n * 0.30):
        print(f"\n[ALERTA] CLT ficou muito baixo: {n_clt/n*100:.1f}%")

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print("\nCorrecao aplicada!")


if __name__ == "__main__":
    main()
