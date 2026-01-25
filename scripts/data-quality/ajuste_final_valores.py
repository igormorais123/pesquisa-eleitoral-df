"""
Ajuste final de valores - Forçar Família para 35%
"""
import json
import random
from collections import Counter

random.seed(2030)

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f"Total de eleitores: {len(eleitores)}")

# Referências
refs_vals = {
    'Família': 35.0,
    'Trabalho': 20.0,
    'Segurança': 15.0,
    'Fé e religião': 12.0,
    'Liberdade': 10.0,
    'Igualdade': 8.0
}

valores_principais = list(refs_vals.keys())
valores_secundarios = ['Honestidade', 'Educação', 'Saúde', 'Respeito', 'Justiça',
                       'Solidariedade', 'Democracia', 'Ordem']

print("\nForçando Família como valor principal...")

for e in eleitores:
    novos_valores = []

    # GARANTIR Família para 95% dos eleitores
    if random.random() < 0.95:
        novos_valores.append('Família')

    # Pesos para outros valores (excluindo Família que já foi adicionada)
    pesos_outros = {
        'Trabalho': 20.0,
        'Segurança': 15.0,
        'Fé e religião': 12.0,
        'Liberdade': 10.0,
        'Igualdade': 8.0
    }

    # Ajustar por perfil
    religiao = e.get('religiao', '')
    orient_politica = e.get('orientacao_politica', '')
    idade = e.get('idade', 35)
    ocupacao = e.get('ocupacao_vinculo', '')

    if religiao in ['evangelica', 'catolica']:
        pesos_outros['Fé e religião'] += 8
    elif religiao == 'sem_religiao':
        pesos_outros['Fé e religião'] = 2
        pesos_outros['Liberdade'] += 5

    if 25 <= idade <= 55 and ocupacao not in ['aposentado', 'desempregado', 'estudante']:
        pesos_outros['Trabalho'] += 6

    if orient_politica in ['esquerda', 'centro_esquerda']:
        pesos_outros['Igualdade'] += 6
    elif orient_politica in ['direita', 'centro_direita']:
        pesos_outros['Segurança'] += 4

    # Selecionar 2 valores principais adicionais
    outros_valores = list(pesos_outros.keys())
    probs = [pesos_outros[v] for v in outros_valores]
    total_prob = sum(probs)
    probs = [p/total_prob for p in probs]

    selecionados = set()
    while len(selecionados) < 2:
        escolha = random.choices(outros_valores, weights=probs, k=1)[0]
        if escolha not in novos_valores:
            selecionados.add(escolha)
            novos_valores.append(escolha)

    # Adicionar 0-1 secundário (20% chance)
    if random.random() < 0.20:
        secundario = random.choice(valores_secundarios)
        if secundario not in novos_valores:
            novos_valores.append(secundario)

    e['valores'] = novos_valores

# Verificar
todos_vals = []
for e in eleitores:
    todos_vals.extend(e.get('valores', []))
total_vals = len(todos_vals)

contagem = Counter(todos_vals)

print(f"\nTotal de menções: {total_vals} ({total_vals/len(eleitores):.1f} por eleitor)")
print("\nDistribuição final:")

for val in refs_vals.keys():
    n = contagem.get(val, 0)
    pct = 100 * n / total_vals
    ref = refs_vals[val]
    diff = pct - ref
    status = '✓' if abs(diff) <= 5 else '⚠'
    print(f"  {status} {val}: {pct:.1f}% (ref: {ref}%)")

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)

print("\nArquivo salvo!")
