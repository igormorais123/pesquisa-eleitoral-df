"""
Análise de Preocupações e Valores dos Eleitores
"""
import json
from collections import Counter

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f"Total de eleitores: {len(eleitores)}")

# ==============================================================================
# PREOCUPAÇÕES
# ==============================================================================
print("\n" + "=" * 70)
print("PREOCUPAÇÕES PRINCIPAIS")
print("=" * 70)

# Contar todas as preocupações (cada eleitor pode ter múltiplas)
todas_preocupacoes = []
for e in eleitores:
    preocs = e.get('preocupacoes', [])
    todas_preocupacoes.extend(preocs)

total_preocs = len(todas_preocupacoes)
print(f"\nTotal de menções a preocupações: {total_preocs}")
print(f"Média por eleitor: {total_preocs/len(eleitores):.1f}")

print("\nDistribuição atual (por menções):")
contagem_preocs = Counter(todas_preocupacoes)
for preoc, n in contagem_preocs.most_common(20):
    pct = 100 * n / total_preocs
    print(f"  {preoc}: {n} ({pct:.1f}%)")

# Referências oficiais (Datafolha 2024)
refs_preocs = {
    'Saúde': 28.0,
    'Segurança': 22.0,
    'Economia': 18.0,
    'Corrupção': 12.0,
    'Educação': 10.0,
    'Desemprego': 10.0
}

print("\n\nComparação com referências (Datafolha 2024):")
print("-" * 50)

# Mapeamento de variações para categorias padrão
mapa_preocs = {
    'Saúde': ['Saúde', 'saude', 'Saúde pública', 'saude publica'],
    'Segurança': ['Segurança', 'Segurança pública', 'seguranca', 'Violência', 'Violência e criminalidade', 'violencia'],
    'Economia': ['Economia', 'economia', 'Inflação', 'inflacao', 'Custo de vida', 'Crise econômica'],
    'Corrupção': ['Corrupção', 'corrupcao', 'Corrupção política'],
    'Educação': ['Educação', 'educacao', 'Educação pública'],
    'Desemprego': ['Desemprego', 'desemprego', 'Emprego', 'Falta de emprego']
}

for cat, ref_pct in refs_preocs.items():
    # Contar todas as variações
    total_cat = 0
    for variacao in mapa_preocs.get(cat, [cat]):
        total_cat += contagem_preocs.get(variacao, 0)

    atual_pct = 100 * total_cat / total_preocs if total_preocs > 0 else 0
    diff = atual_pct - ref_pct
    status = '✓' if abs(diff) <= 5 else '⚠' if abs(diff) <= 10 else '✗'
    print(f"  {status} {cat}: {atual_pct:.1f}% (ref: {ref_pct}%) | Δ: {diff:+.1f}%")

# ==============================================================================
# VALORES
# ==============================================================================
print("\n" + "=" * 70)
print("VALORES PRINCIPAIS")
print("=" * 70)

# Contar todos os valores
todos_valores = []
for e in eleitores:
    vals = e.get('valores', [])
    todos_valores.extend(vals)

total_vals = len(todos_valores)
print(f"\nTotal de menções a valores: {total_vals}")
print(f"Média por eleitor: {total_vals/len(eleitores):.1f}")

print("\nDistribuição atual (por menções):")
contagem_vals = Counter(todos_valores)
for val, n in contagem_vals.most_common(20):
    pct = 100 * n / total_vals
    print(f"  {val}: {n} ({pct:.1f}%)")

# Referências oficiais (World Values Survey 2023)
refs_vals = {
    'Família': 35.0,
    'Trabalho': 20.0,
    'Segurança': 15.0,
    'Religião': 12.0,
    'Liberdade': 10.0,
    'Igualdade': 8.0
}

print("\n\nComparação com referências (World Values Survey 2023):")
print("-" * 50)

# Mapeamento de variações
mapa_vals = {
    'Família': ['Família', 'familia', 'Amor à família'],
    'Trabalho': ['Trabalho', 'trabalho', 'Trabalho duro', 'Esforço'],
    'Segurança': ['Segurança', 'seguranca', 'Proteção'],
    'Religião': ['Religião', 'religiao', 'Fé', 'fe', 'Espiritualidade'],
    'Liberdade': ['Liberdade', 'liberdade', 'Autonomia'],
    'Igualdade': ['Igualdade', 'igualdade', 'Justiça social', 'Equidade']
}

for cat, ref_pct in refs_vals.items():
    total_cat = 0
    for variacao in mapa_vals.get(cat, [cat]):
        total_cat += contagem_vals.get(variacao, 0)

    atual_pct = 100 * total_cat / total_vals if total_vals > 0 else 0
    diff = atual_pct - ref_pct
    status = '✓' if abs(diff) <= 5 else '⚠' if abs(diff) <= 10 else '✗'
    print(f"  {status} {cat}: {atual_pct:.1f}% (ref: {ref_pct}%) | Δ: {diff:+.1f}%")

# ==============================================================================
# MEDOS
# ==============================================================================
print("\n" + "=" * 70)
print("MEDOS PRINCIPAIS")
print("=" * 70)

todos_medos = []
for e in eleitores:
    medos = e.get('medos', [])
    todos_medos.extend(medos)

total_medos = len(todos_medos)
print(f"\nTotal de menções a medos: {total_medos}")

print("\nDistribuição atual (por menções):")
contagem_medos = Counter(todos_medos)
for medo, n in contagem_medos.most_common(15):
    pct = 100 * n / total_medos
    print(f"  {medo}: {n} ({pct:.1f}%)")
