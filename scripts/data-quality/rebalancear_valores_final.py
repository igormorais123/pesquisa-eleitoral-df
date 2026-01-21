"""
Rebalancear valores para atingir referências
Estratégia: Reduzir número de valores secundários para que os principais tenham maior peso
"""
import json
import random
from collections import Counter

random.seed(2029)

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f"Total de eleitores: {len(eleitores)}")

# Referências - proporção desejada
refs_vals = {
    'Família': 35.0,
    'Trabalho': 20.0,
    'Segurança': 15.0,
    'Fé e religião': 12.0,
    'Liberdade': 10.0,
    'Igualdade': 8.0
}
# Total = 100%

# Estratégia: cada eleitor terá ~3 valores principais
# E a seleção será proporcional às referências

valores_principais = list(refs_vals.keys())
pesos_base = [refs_vals[v] for v in valores_principais]

# Valores secundários (extras opcionais)
valores_secundarios = ['Honestidade', 'Educação', 'Saúde', 'Respeito', 'Justiça',
                       'Solidariedade', 'Democracia', 'Ordem']

print("\nReconstruindo valores de cada eleitor...")

for e in eleitores:
    novos_valores = []

    # Ajustar pesos por perfil
    pesos = refs_vals.copy()

    religiao = e.get('religiao', '')
    orient_politica = e.get('orientacao_politica', '')
    estado_civil = e.get('estado_civil', '')
    filhos = e.get('filhos', 0)
    idade = e.get('idade', 35)
    ocupacao = e.get('ocupacao_vinculo', '')

    # Família: maior para casados/com filhos
    if estado_civil in ['casado(a)', 'uniao_estavel'] or filhos > 0:
        pesos['Família'] += 15

    # Religião
    if religiao in ['evangelica', 'catolica']:
        pesos['Fé e religião'] += 10
    elif religiao == 'sem_religiao':
        pesos['Fé e religião'] = 2
        pesos['Liberdade'] += 5

    # Trabalho
    if 25 <= idade <= 55 and ocupacao not in ['aposentado', 'desempregado', 'estudante']:
        pesos['Trabalho'] += 8

    # Orientação política
    if orient_politica in ['esquerda', 'centro_esquerda']:
        pesos['Igualdade'] += 8
        pesos['Liberdade'] += 4
    elif orient_politica in ['direita', 'centro_direita']:
        pesos['Segurança'] += 5
        pesos['Família'] += 5

    # Normalizar pesos
    total_peso = sum(pesos.values())
    probs = [pesos[v]/total_peso for v in valores_principais]

    # Selecionar 3 valores principais (proporcional)
    selecionados = set()
    tentativas = 0
    while len(selecionados) < 3 and tentativas < 20:
        escolha = random.choices(valores_principais, weights=probs, k=1)[0]
        selecionados.add(escolha)
        tentativas += 1

    # Adicionar 0-1 valor secundário (30% chance)
    if random.random() < 0.30:
        secundario = random.choice(valores_secundarios)
        selecionados.add(secundario)

    e['valores'] = list(selecionados)

# Verificar distribuição
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

# Secundários
print("\nValores secundários:")
for val in valores_secundarios:
    n = contagem.get(val, 0)
    if n > 0:
        pct = 100 * n / total_vals
        print(f"  {val}: {pct:.1f}%")

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)

print("\nArquivo salvo!")
