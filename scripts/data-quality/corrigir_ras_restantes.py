"""
Correcao Cirurgica das RAs Restantes
Problema: 8 RAs com idade acima do alvo por causa de aposentados
Solucao: Converter alguns aposentados em outras ocupacoes e rejuvenescer
"""

import json
import random
from collections import Counter
import statistics

random.seed(2030)

# RAs com problema e seus alvos
RAS_PROBLEMA = {
    "Sobradinho": {"idade_alvo": 35, "max_aposentados_pct": 10},
    "Santa Maria": {"idade_alvo": 30, "max_aposentados_pct": 8},
    "Vicente Pires": {"idade_alvo": 35, "max_aposentados_pct": 10},
    "SCIA/Estrutural": {"idade_alvo": 27, "max_aposentados_pct": 5},
    "Brazlândia": {"idade_alvo": 32, "max_aposentados_pct": 8},
    "Brazlandia": {"idade_alvo": 32, "max_aposentados_pct": 8},
    "Varjão": {"idade_alvo": 28, "max_aposentados_pct": 5},
    "Varjao": {"idade_alvo": 28, "max_aposentados_pct": 5},
    "Fercal": {"idade_alvo": 30, "max_aposentados_pct": 5},
    "SIA": {"idade_alvo": 38, "max_aposentados_pct": 10},
}


def faixa_etaria(idade):
    if idade < 18: return "16-17"
    elif idade < 25: return "18-24"
    elif idade < 35: return "25-34"
    elif idade < 45: return "35-44"
    elif idade < 55: return "45-54"
    elif idade < 65: return "55-64"
    else: return "65+"


def corrigir_ra(eleitores_ra, config):
    """Corrige uma RA especifica"""
    n = len(eleitores_ra)
    if n == 0:
        return eleitores_ra

    idade_alvo = config['idade_alvo']
    max_aposentados = max(1, int(n * config['max_aposentados_pct'] / 100))

    # Contar aposentados
    aposentados = [i for i, e in enumerate(eleitores_ra) if e.get('ocupacao_vinculo') == 'aposentado']
    n_aposentados = len(aposentados)

    # Se muitos aposentados, converter excesso
    if n_aposentados > max_aposentados:
        random.shuffle(aposentados)
        excesso = n_aposentados - max_aposentados

        ocupacoes_alternativas = ['clt', 'autonomo', 'informal']
        profissoes_alternativas = [
            'Auxiliar de Servicos Gerais', 'Diarista', 'Vendedor(a)',
            'Porteiro', 'Vigilante', 'Motorista'
        ]

        for i in aposentados[:excesso]:
            e = eleitores_ra[i]
            e['ocupacao_vinculo'] = random.choice(ocupacoes_alternativas)
            e['profissao'] = random.choice(profissoes_alternativas)
            # Rejuvenescer
            e['idade'] = random.randint(30, 55)
            e['faixa_etaria'] = faixa_etaria(e['idade'])

    # Agora ajustar idade de todos os nao-aposentados
    for e in eleitores_ra:
        if e.get('ocupacao_vinculo') == 'aposentado':
            e['idade'] = random.randint(62, 72)  # Manter aposentados com idade razoavel
        else:
            # Idade baseada no alvo
            variacao = random.randint(-6, 6)
            nova_idade = idade_alvo + variacao

            if e.get('escolaridade') == 'superior_completo_ou_pos':
                nova_idade = max(24, nova_idade)

            nova_idade = max(18, min(58, nova_idade))
            e['idade'] = nova_idade

        e['faixa_etaria'] = faixa_etaria(e['idade'])
        e['voto_facultativo'] = e['idade'] < 18 or e['idade'] >= 70

    return eleitores_ra


def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    print("Correcao cirurgica das RAs restantes...")
    print()

    # Processar cada RA problema
    for i, e in enumerate(eleitores):
        ra = e.get('regiao_administrativa', '')
        if ra in RAS_PROBLEMA:
            # Coletar todos da RA
            pass

    # Agrupar por RA problema
    from collections import defaultdict
    por_ra = defaultdict(list)
    idx_por_ra = defaultdict(list)

    for i, e in enumerate(eleitores):
        ra = e.get('regiao_administrativa', '')
        if ra in RAS_PROBLEMA:
            por_ra[ra].append(e)
            idx_por_ra[ra].append(i)

    for ra, lista in por_ra.items():
        config = RAS_PROBLEMA[ra]
        n = len(lista)

        idade_antes = statistics.mean(e['idade'] for e in lista)
        apos_antes = sum(1 for e in lista if e.get('ocupacao_vinculo') == 'aposentado')

        lista = corrigir_ra(lista, config)

        idade_depois = statistics.mean(e['idade'] for e in lista)
        apos_depois = sum(1 for e in lista if e.get('ocupacao_vinculo') == 'aposentado')

        # Atualizar no array principal
        for j, idx in enumerate(idx_por_ra[ra]):
            eleitores[idx] = lista[j]

        status = "[OK]" if abs(idade_depois - config['idade_alvo']) <= 5 else "[!]"
        print(f"  {ra:25s} (n={n:2d}): idade {idade_antes:4.1f}->{idade_depois:4.1f} (alvo:{config['idade_alvo']}) {status} | aposentados: {apos_antes}->{apos_depois}")

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print()
    print("Correcoes aplicadas!")


if __name__ == "__main__":
    main()
