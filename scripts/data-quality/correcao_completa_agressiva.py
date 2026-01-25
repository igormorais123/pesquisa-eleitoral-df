"""
Correcao Completa e Agressiva - Alinhamento Total com PDAD
Prioridade: Validade estatistica > Preservacao de dados originais
"""

import json
import random
from collections import defaultdict
import statistics

random.seed(2026)

# PDAD OFICIAL - METAS RIGIDAS
METAS = {
    # Variantes sem acento
    "Ceilandia": {"idade": 35, "branca": 20, "superior": 15, "renda": ["mais_de_1_ate_2", "mais_de_2_ate_5"], "cluster": "G3_media_baixa"},
    "Paranoa": {"idade": 30, "branca": 18, "superior": 12, "renda": ["ate_1", "mais_de_1_ate_2"], "cluster": "G3_media_baixa"},

    # ALTA RENDA
    "Lago Sul": {"idade": 42, "branca": 67, "superior": 85, "renda": ["mais_de_10_ate_20", "mais_de_20"], "cluster": "G1_alta"},
    "Lago Norte": {"idade": 40, "branca": 62, "superior": 75, "renda": ["mais_de_10_ate_20", "mais_de_5_ate_10"], "cluster": "G1_alta"},
    "Park Way": {"idade": 42, "branca": 58, "superior": 70, "renda": ["mais_de_10_ate_20", "mais_de_5_ate_10"], "cluster": "G1_alta"},
    "Sudoeste/Octogonal": {"idade": 38, "branca": 55, "superior": 72, "renda": ["mais_de_10_ate_20", "mais_de_5_ate_10"], "cluster": "G1_alta"},
    "Plano Piloto": {"idade": 38, "branca": 52, "superior": 68, "renda": ["mais_de_5_ate_10", "mais_de_10_ate_20"], "cluster": "G1_alta"},
    "Jardim Botânico": {"idade": 40, "branca": 55, "superior": 65, "renda": ["mais_de_5_ate_10", "mais_de_10_ate_20"], "cluster": "G1_alta"},

    # MEDIA-ALTA
    "Águas Claras": {"idade": 34, "branca": 45, "superior": 55, "renda": ["mais_de_5_ate_10", "mais_de_2_ate_5"], "cluster": "G2_media_alta"},
    "Guará": {"idade": 37, "branca": 42, "superior": 45, "renda": ["mais_de_2_ate_5", "mais_de_5_ate_10"], "cluster": "G2_media_alta"},
    "Cruzeiro": {"idade": 40, "branca": 45, "superior": 52, "renda": ["mais_de_5_ate_10", "mais_de_2_ate_5"], "cluster": "G2_media_alta"},
    "Vicente Pires": {"idade": 35, "branca": 40, "superior": 48, "renda": ["mais_de_2_ate_5", "mais_de_5_ate_10"], "cluster": "G2_media_alta"},
    "Taguatinga": {"idade": 37, "branca": 35, "superior": 38, "renda": ["mais_de_2_ate_5", "mais_de_5_ate_10"], "cluster": "G2_media_alta"},
    "Sobradinho": {"idade": 35, "branca": 35, "superior": 30, "renda": ["mais_de_2_ate_5", "mais_de_5_ate_10"], "cluster": "G2_media_alta"},
    "Arniqueira": {"idade": 35, "branca": 38, "superior": 40, "renda": ["mais_de_2_ate_5", "mais_de_5_ate_10"], "cluster": "G2_media_alta"},
    "Núcleo Bandeirante": {"idade": 38, "branca": 35, "superior": 32, "renda": ["mais_de_2_ate_5", "mais_de_5_ate_10"], "cluster": "G2_media_alta"},
    "SIA": {"idade": 38, "branca": 35, "superior": 35, "renda": ["mais_de_2_ate_5", "mais_de_5_ate_10"], "cluster": "G2_media_alta"},

    # MEDIA-BAIXA
    "Ceilândia": {"idade": 35, "branca": 20, "superior": 15, "renda": ["mais_de_1_ate_2", "mais_de_2_ate_5"], "cluster": "G3_media_baixa"},
    "Samambaia": {"idade": 32, "branca": 18, "superior": 12, "renda": ["mais_de_1_ate_2", "mais_de_2_ate_5"], "cluster": "G3_media_baixa"},
    "Gama": {"idade": 35, "branca": 28, "superior": 20, "renda": ["mais_de_1_ate_2", "mais_de_2_ate_5"], "cluster": "G3_media_baixa"},
    "Santa Maria": {"idade": 30, "branca": 18, "superior": 12, "renda": ["ate_1", "mais_de_1_ate_2"], "cluster": "G3_media_baixa"},
    "Planaltina": {"idade": 30, "branca": 20, "superior": 10, "renda": ["ate_1", "mais_de_1_ate_2"], "cluster": "G3_media_baixa"},
    "São Sebastião": {"idade": 31, "branca": 20, "superior": 14, "renda": ["ate_1", "mais_de_1_ate_2"], "cluster": "G3_media_baixa"},
    "Sobradinho II": {"idade": 33, "branca": 28, "superior": 22, "renda": ["mais_de_1_ate_2", "mais_de_2_ate_5"], "cluster": "G3_media_baixa"},
    "Riacho Fundo": {"idade": 34, "branca": 28, "superior": 22, "renda": ["mais_de_1_ate_2", "mais_de_2_ate_5"], "cluster": "G3_media_baixa"},
    "Riacho Fundo II": {"idade": 30, "branca": 22, "superior": 14, "renda": ["ate_1", "mais_de_1_ate_2"], "cluster": "G3_media_baixa"},
    "Brazlândia": {"idade": 32, "branca": 31, "superior": 12, "renda": ["ate_1", "mais_de_1_ate_2"], "cluster": "G3_media_baixa"},
    "Paranoá": {"idade": 30, "branca": 18, "superior": 12, "renda": ["ate_1", "mais_de_1_ate_2"], "cluster": "G3_media_baixa"},
    "Candangolândia": {"idade": 35, "branca": 25, "superior": 18, "renda": ["mais_de_1_ate_2", "mais_de_2_ate_5"], "cluster": "G3_media_baixa"},

    # BAIXA RENDA
    "Sol Nascente/Pôr do Sol": {"idade": 29, "branca": 30, "superior": 6, "renda": ["ate_1", "mais_de_1_ate_2"], "cluster": "G4_baixa"},
    "Recanto das Emas": {"idade": 29, "branca": 16, "superior": 8, "renda": ["ate_1", "mais_de_1_ate_2"], "cluster": "G4_baixa"},
    "Itapoã": {"idade": 28, "branca": 15, "superior": 6, "renda": ["ate_1", "mais_de_1_ate_2"], "cluster": "G4_baixa"},
    "SCIA/Estrutural": {"idade": 27, "branca": 25, "superior": 4, "renda": ["ate_1"], "cluster": "G4_baixa"},
    "Varjão": {"idade": 28, "branca": 15, "superior": 5, "renda": ["ate_1", "mais_de_1_ate_2"], "cluster": "G4_baixa"},
    "Fercal": {"idade": 30, "branca": 18, "superior": 6, "renda": ["ate_1", "mais_de_1_ate_2"], "cluster": "G4_baixa"},
}

PROFISSOES_BASICAS = [
    "Auxiliar de Servicos Gerais", "Diarista", "Pedreiro", "Porteiro",
    "Atendente", "Caixa", "Vendedor(a)", "Motorista", "Vigilante",
    "Cozinheiro(a)", "Garcom", "Mecanico", "Eletricista", "Domestica",
]

PROFISSOES_MEDIAS = [
    "Tecnico em Enfermagem", "Auxiliar Administrativo", "Representante Comercial",
    "Corretor", "Barbeiro/Cabeleireiro", "Motorista de App", "Agente Comunitario",
]

PROFISSOES_SUPERIORES = [
    "Analista", "Contador(a)", "Advogado(a)", "Engenheiro(a)", "Medico(a)",
    "Professor(a)", "Servidor Publico", "Empresario(a)", "Gerente",
]


def faixa_etaria(idade):
    if idade < 18: return "16-17"
    elif idade < 25: return "18-24"
    elif idade < 35: return "25-34"
    elif idade < 45: return "35-44"
    elif idade < 55: return "45-54"
    elif idade < 65: return "55-64"
    else: return "65+"


def corrigir_ra_completo(eleitores_ra, meta):
    """Corrige TODOS os eleitores de uma RA para atingir as metas"""
    n = len(eleitores_ra)
    if n == 0:
        return eleitores_ra

    # Calcular quantos de cada categoria
    n_brancos = max(1, round(n * meta['branca'] / 100))
    n_superior = max(0, round(n * meta['superior'] / 100))

    # Garantir limites
    n_brancos = min(n_brancos, n)
    n_superior = min(n_superior, n)

    # Ordenar aleatoriamente para distribuir
    indices = list(range(n))
    random.shuffle(indices)

    # 1. CORRIGIR COR/RACA
    for i, idx in enumerate(indices):
        if i < n_brancos:
            eleitores_ra[idx]['cor_raca'] = 'branca'
        elif i < n_brancos + round(n * 0.50):  # ~50% parda
            eleitores_ra[idx]['cor_raca'] = 'parda'
        else:
            eleitores_ra[idx]['cor_raca'] = 'preta'

    # 2. CORRIGIR ESCOLARIDADE
    random.shuffle(indices)
    for i, idx in enumerate(indices):
        if i < n_superior:
            eleitores_ra[idx]['escolaridade'] = 'superior_completo_ou_pos'
            # Ajustar profissao se necessario
            if eleitores_ra[idx].get('ocupacao_vinculo') != 'aposentado':
                prof_atual = eleitores_ra[idx].get('profissao', '')
                if not any(p in prof_atual for p in ['Analista', 'Contador', 'Advogado', 'Engenheiro', 'Medico', 'Professor', 'Servidor', 'Gerente']):
                    eleitores_ra[idx]['profissao'] = random.choice(PROFISSOES_SUPERIORES)
        else:
            if eleitores_ra[idx]['escolaridade'] == 'superior_completo_ou_pos':
                eleitores_ra[idx]['escolaridade'] = 'medio_completo_ou_sup_incompleto'
                # Ajustar profissao
                if eleitores_ra[idx].get('ocupacao_vinculo') != 'aposentado':
                    eleitores_ra[idx]['profissao'] = random.choice(PROFISSOES_MEDIAS + PROFISSOES_BASICAS)

    # 3. CORRIGIR IDADE
    idade_alvo = meta['idade']
    for e in eleitores_ra:
        idade_atual = e['idade']
        # Se aposentado, manter 60+
        if e.get('ocupacao_vinculo') == 'aposentado':
            if idade_atual < 60:
                e['idade'] = random.randint(60, 75)
        else:
            # Calcular nova idade com variacao
            variacao = random.randint(-8, 8)
            nova_idade = idade_alvo + variacao
            nova_idade = max(18, min(nova_idade, 70))
            e['idade'] = nova_idade

        e['faixa_etaria'] = faixa_etaria(e['idade'])
        e['voto_facultativo'] = e['idade'] < 18 or e['idade'] >= 70

    # 4. CORRIGIR RENDA
    rendas_alvo = meta['renda']
    for e in eleitores_ra:
        # Servidor publico tem renda minima
        if 'servidor' in e.get('ocupacao_vinculo', '').lower():
            e['renda_salarios_minimos'] = random.choice(['mais_de_2_ate_5', 'mais_de_5_ate_10'])
        # Superior completo tem renda maior
        elif e['escolaridade'] == 'superior_completo_ou_pos':
            if meta['cluster'] == 'G1_alta':
                e['renda_salarios_minimos'] = random.choice(['mais_de_5_ate_10', 'mais_de_10_ate_20'])
            elif meta['cluster'] == 'G2_media_alta':
                e['renda_salarios_minimos'] = random.choice(['mais_de_2_ate_5', 'mais_de_5_ate_10'])
            else:
                e['renda_salarios_minimos'] = random.choice(rendas_alvo)
        else:
            e['renda_salarios_minimos'] = random.choice(rendas_alvo)

    # 5. CORRIGIR CLUSTER
    for e in eleitores_ra:
        e['cluster_socioeconomico'] = meta['cluster']

    return eleitores_ra


def main():
    print("=" * 70)
    print("CORRECAO COMPLETA E AGRESSIVA")
    print("=" * 70)

    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    # Agrupar por RA
    por_ra = defaultdict(list)
    idx_por_ra = defaultdict(list)

    for i, e in enumerate(eleitores):
        ra = e.get('regiao_administrativa', 'N/A')
        por_ra[ra].append(e)
        idx_por_ra[ra].append(i)

    # Corrigir cada RA
    for ra, lista in por_ra.items():
        meta = METAS.get(ra)
        if meta is None:
            print(f"  [!] {ra}: Sem meta definida")
            continue

        print(f"  Corrigindo {ra} ({len(lista)} eleitores)...")
        lista_corrigida = corrigir_ra_completo(lista, meta)

        # Atualizar no array principal
        for i, idx in enumerate(idx_por_ra[ra]):
            eleitores[idx] = lista_corrigida[i]

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print("\nCorrecao completa!")
    print("Execute 'python comparacao_pdad_oficial.py' para validar.")


if __name__ == "__main__":
    main()
