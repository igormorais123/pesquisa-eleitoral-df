"""
Rebalanceamento Completo de Ocupacao
Problema: CLT ficou baixo (24%) apos corrigir autonomo
Solucao: Rebalancear todas as categorias de uma vez
"""

import json
import random
from collections import Counter

random.seed(2027)

# Metas PNAD/PDAD ajustadas para 1000 eleitores
# Proporcoes originais: 35+25+15+8+8+12+5+3 = 111% (erro na referencia)
# Ajustadas para somar 100%:
METAS = {
    'clt': 315,              # 31.5% (era 35%)
    'autonomo': 225,         # 22.5% (era 25%)
    'informal': 135,         # 13.5% (era 15%)
    'aposentado': 108,       # 10.8% (era 12%)
    'servidor_publico': 72,  # 7.2% (era 8%)
    'desempregado': 72,      # 7.2% (era 8%)
    'estudante': 45,         # 4.5% (era 5%)
    'empresario': 28,        # 2.8% (era 3%)
}
# Total: 315+225+135+108+72+72+45+28 = 1000


def get_ocupacao_coerente(eleitor):
    """Retorna lista de ocupacoes coerentes com o perfil"""
    idade = eleitor.get('idade', 30)
    escolaridade = eleitor.get('escolaridade', 'medio_completo_ou_sup_incompleto')
    renda = eleitor.get('renda_salarios_minimos', 'mais_de_1_ate_2')

    opcoes = []

    # Aposentado: 60+ anos
    if idade >= 60:
        opcoes.append('aposentado')

    # Estudante: < 30 anos
    if idade < 30:
        opcoes.append('estudante')

    # Servidor publico: medio+ escolaridade, renda media-alta
    if escolaridade in ['medio_completo_ou_sup_incompleto', 'superior_completo_ou_pos']:
        if renda in ['mais_de_2_ate_5', 'mais_de_5_ate_10', 'mais_de_10_ate_20']:
            opcoes.append('servidor_publico')

    # Empresario: qualquer escolaridade, renda alta
    if renda in ['mais_de_5_ate_10', 'mais_de_10_ate_20', 'mais_de_20']:
        opcoes.append('empresario')

    # CLT: qualquer perfil ativo (18-65)
    if 18 <= idade < 65:
        opcoes.append('clt')

    # Autonomo: qualquer perfil ativo
    if 18 <= idade < 65:
        opcoes.append('autonomo')

    # Informal: baixa escolaridade ou baixa renda
    if escolaridade == 'fundamental_ou_sem_instrucao' or renda in ['ate_1', 'mais_de_1_ate_2']:
        if 18 <= idade < 65:
            opcoes.append('informal')

    # Desempregado: qualquer perfil ativo
    if 18 <= idade < 65:
        opcoes.append('desempregado')

    return opcoes


def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    n = len(eleitores)

    # Limpar autonomo_informal
    for e in eleitores:
        if e.get('ocupacao_vinculo') == 'autonomo_informal':
            e['ocupacao_vinculo'] = 'informal'

    # Contagem atual
    atual = Counter(e['ocupacao_vinculo'] for e in eleitores)
    print("Distribuicao atual:")
    for k in METAS:
        v = atual.get(k, 0)
        meta = METAS[k]
        diff = v - meta
        status = "[OK]" if abs(diff) <= 20 else "[!]"
        print(f"  {k:20s}: {v:4d} ({v/n*100:5.1f}%) meta: {meta:4d} diff: {diff:+4d} {status}")

    # Redistribuir para atingir metas
    # Estrategia: criar listas por categoria e realocar

    # Agrupar por ocupacao atual
    por_ocupacao = {k: [] for k in METAS}
    for i, e in enumerate(eleitores):
        ocup = e.get('ocupacao_vinculo', 'clt')
        if ocup in por_ocupacao:
            por_ocupacao[ocup].append(i)
        else:
            por_ocupacao['clt'].append(i)  # Fallback

    # Identificar excessos e faltas
    excessos = {k: len(v) - METAS[k] for k, v in por_ocupacao.items() if len(v) > METAS[k]}
    faltas = {k: METAS[k] - len(por_ocupacao[k]) for k in METAS if len(por_ocupacao[k]) < METAS[k]}

    print(f"\nExcessos: {excessos}")
    print(f"Faltas: {faltas}")

    # Transferir de categorias em excesso para categorias em falta
    for cat_excesso, qtd_excesso in sorted(excessos.items(), key=lambda x: -x[1]):
        if qtd_excesso <= 0:
            continue

        candidatos = por_ocupacao[cat_excesso][METAS[cat_excesso]:]  # Indices em excesso
        random.shuffle(candidatos)

        for idx in candidatos:
            if qtd_excesso <= 0:
                break

            # Encontrar categoria em falta que seja coerente
            opcoes_coerentes = get_ocupacao_coerente(eleitores[idx])

            for cat_falta in sorted(faltas.keys(), key=lambda x: -faltas.get(x, 0)):
                if faltas.get(cat_falta, 0) > 0 and cat_falta in opcoes_coerentes:
                    # Transferir
                    eleitores[idx]['ocupacao_vinculo'] = cat_falta
                    faltas[cat_falta] -= 1
                    qtd_excesso -= 1
                    break

    # Verificar resultado
    final = Counter(e['ocupacao_vinculo'] for e in eleitores)
    print("\nDistribuicao final:")
    todas_ok = True
    for k in METAS:
        v = final.get(k, 0)
        meta = METAS[k]
        diff = v - meta
        tolerancia = meta * 0.10  # 10% tolerancia
        status = "[OK]" if abs(diff) <= tolerancia else "[!]"
        if abs(diff) > tolerancia:
            todas_ok = False
        print(f"  {k:20s}: {v:4d} ({v/n*100:5.1f}%) meta: {meta:4d} diff: {diff:+4d} {status}")

    if todas_ok:
        print("\nTodas as ocupacoes dentro da tolerancia!")
    else:
        print("\nAlgumas ocupacoes ainda fora da tolerancia.")

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print("\nArquivo salvo!")


if __name__ == "__main__":
    main()
