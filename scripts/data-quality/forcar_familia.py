"""
Forçar valor Família para atingir 35%
Estratégia: Garantir que Família esteja em 90%+ dos eleitores
"""
import json
import random
from collections import Counter

random.seed(2028)

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f"Total de eleitores: {len(eleitores)}")

# Verificar atual
todos_vals = []
for e in eleitores:
    todos_vals.extend(e.get('valores', []))
total_vals = len(todos_vals)

contagem = Counter(todos_vals)
familia_atual = contagem.get('Família', 0)
print(f"\nFamília atual: {familia_atual} menções ({100*familia_atual/total_vals:.1f}%)")

# Target: 35% das menções devem ser Família
# Se temos ~5000 menções, precisamos de ~1750 de Família
target_familia = int(total_vals * 0.35)
print(f"Target: {target_familia} menções")

# Adicionar Família a mais eleitores
eleitores_com_familia = sum(1 for e in eleitores if 'Família' in e.get('valores', []))
print(f"Eleitores com Família: {eleitores_com_familia}")

# Garantir que 95% tenham Família
for e in eleitores:
    valores = e.get('valores', [])

    if 'Família' not in valores:
        # Adicionar Família (95% chance)
        if random.random() < 0.97:
            valores.insert(0, 'Família')  # Colocar no início
            e['valores'] = valores

# Verificar novamente
todos_vals_novo = []
for e in eleitores:
    todos_vals_novo.extend(e.get('valores', []))
total_novo = len(todos_vals_novo)

contagem_nova = Counter(todos_vals_novo)

print("\n\nDistribuição após ajuste:")
refs = {
    'Família': 35.0,
    'Trabalho': 20.0,
    'Segurança': 15.0,
    'Fé e religião': 12.0,
    'Liberdade': 10.0,
    'Igualdade': 8.0
}

for val in refs.keys():
    n = contagem_nova.get(val, 0)
    pct = 100 * n / total_novo
    ref = refs[val]
    diff = pct - ref
    status = '✓' if abs(diff) <= 5 else '⚠'
    print(f"  {status} {val}: {pct:.1f}% (ref: {ref}%)")

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)

print("\nArquivo salvo!")
print(f"Total de valores: {total_novo} ({total_novo/len(eleitores):.1f} por eleitor)")
