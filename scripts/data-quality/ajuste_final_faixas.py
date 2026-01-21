"""
Ajuste Final de Faixas Etárias
Problema: Falta jovens em 16-17 e 18-24, excesso em 25-34
"""

import json
import random
from collections import Counter

random.seed(2032)

# Metas
METAS = {
    "16-17": 30,
    "18-24": 120,
    "25-34": 220,
    "35-44": 200,
    "45-54": 180,
    "55-64": 140,
    "65+": 110,
}


def faixa_etaria(idade):
    if idade < 18: return "16-17"
    elif idade < 25: return "18-24"
    elif idade < 35: return "25-34"
    elif idade < 45: return "35-44"
    elif idade < 55: return "45-54"
    elif idade < 65: return "55-64"
    else: return "65+"


def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    atual = Counter(e['faixa_etaria'] for e in eleitores)
    print("Antes:")
    for f in METAS:
        print(f"  {f}: {atual.get(f, 0)} (meta: {METAS[f]})")

    # Identificar deficit e excesso
    deficit_16_17 = METAS['16-17'] - atual.get('16-17', 0)
    deficit_18_24 = METAS['18-24'] - atual.get('18-24', 0)
    excesso_25_34 = atual.get('25-34', 0) - METAS['25-34']

    print(f"\nDeficit 16-17: {deficit_16_17}")
    print(f"Deficit 18-24: {deficit_18_24}")
    print(f"Excesso 25-34: {excesso_25_34}")

    # Candidatos para converter de 25-34 para mais jovem
    # Priorizar: escolaridade média ou fundamental, não servidor público
    candidatos_25_34 = []
    for i, e in enumerate(eleitores):
        if e['faixa_etaria'] == '25-34':
            # Não converter aposentados (impossível)
            if e.get('ocupacao_vinculo') == 'aposentado':
                continue
            # Não converter servidores (geralmente 25+)
            if e.get('ocupacao_vinculo') == 'servidor_publico':
                continue
            # Priorizar escolaridade mais baixa
            esc = e.get('escolaridade', '')
            if esc == 'fundamental_ou_sem_instrucao':
                prioridade = 1
            elif esc == 'medio_completo_ou_sup_incompleto':
                prioridade = 2
            else:
                prioridade = 3  # Superior completo - menos prioritário

            candidatos_25_34.append((i, prioridade, e))

    # Ordenar por prioridade (menor primeiro)
    candidatos_25_34.sort(key=lambda x: x[1])

    # Converter para 16-17 (apenas fundamental/médio, máximo 17 anos)
    conversoes_16_17 = 0
    for i, prio, e in candidatos_25_34:
        if conversoes_16_17 >= deficit_16_17:
            break
        if e.get('escolaridade') != 'superior_completo_ou_pos':
            eleitores[i]['idade'] = random.randint(16, 17)
            eleitores[i]['faixa_etaria'] = '16-17'
            eleitores[i]['voto_facultativo'] = True
            # Ajustar ocupação se necessário
            if eleitores[i].get('ocupacao_vinculo') not in ['estudante', 'desempregado']:
                eleitores[i]['ocupacao_vinculo'] = 'estudante'
                eleitores[i]['profissao'] = 'Estudante'
            conversoes_16_17 += 1

    # Atualizar lista de candidatos
    candidatos_restantes = [(i, p, e) for i, p, e in candidatos_25_34
                           if eleitores[i]['faixa_etaria'] == '25-34']

    # Converter para 18-24 (aceita superior incompleto)
    conversoes_18_24 = 0
    for i, prio, e in candidatos_restantes:
        if conversoes_18_24 >= deficit_18_24:
            break
        # Superior completo não pode ter 18-21, mas pode ter 22-24
        if e.get('escolaridade') == 'superior_completo_ou_pos':
            eleitores[i]['idade'] = random.randint(22, 24)
        else:
            eleitores[i]['idade'] = random.randint(18, 24)
        eleitores[i]['faixa_etaria'] = '18-24'
        eleitores[i]['voto_facultativo'] = False
        conversoes_18_24 += 1

    print(f"\nConversoes 25-34 -> 16-17: {conversoes_16_17}")
    print(f"Conversoes 25-34 -> 18-24: {conversoes_18_24}")

    # Verificar resultado
    final = Counter(e['faixa_etaria'] for e in eleitores)
    print("\nDepois:")
    todas_ok = True
    for f in METAS:
        v = final.get(f, 0)
        meta = METAS[f]
        tol = meta * 0.15  # 15% tolerância
        status = "[OK]" if abs(v - meta) <= tol else "[!]"
        if abs(v - meta) > tol:
            todas_ok = False
        print(f"  {f}: {v} (meta: {meta}, diff: {v-meta:+d}) {status}")

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print("\nArquivo salvo!")


if __name__ == "__main__":
    main()
