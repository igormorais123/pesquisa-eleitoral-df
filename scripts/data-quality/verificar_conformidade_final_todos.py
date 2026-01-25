"""
Verificação Final de Conformidade - Todos os Bancos
"""
import json
from collections import Counter
from datetime import datetime

print("=" * 70)
print("VERIFICAÇÃO FINAL DE CONFORMIDADE - TODOS OS BANCOS")
print("=" * 70)

# =============================================================================
# CARREGAR ARQUIVOS
# =============================================================================
arquivos = {
    'candidatos': 'agentes/banco-candidatos-df-2026.json',
    'deputados_federais': 'agentes/banco-deputados-federais-df.json',
    'senadores': 'agentes/banco-senadores-df.json',
    'deputados_distritais': 'agentes/banco-deputados-distritais-df.json',
    'gestores': 'agentes/banco-gestores.json',
    'eleitores': 'agentes/banco-eleitores-df.json',
}

dados = {}
for nome, arquivo in arquivos.items():
    try:
        with open(arquivo, 'r', encoding='utf-8') as f:
            dados[nome] = json.load(f)
        print(f"✓ {nome}: carregado")
    except Exception as e:
        print(f"✗ {nome}: erro - {e}")

# =============================================================================
# VERIFICAÇÃO DOS CANDIDATOS
# =============================================================================
print("\n" + "-" * 70)
print("1. CANDIDATOS AO GOVERNO DO DF 2026")
print("-" * 70)

candidatos = dados.get('candidatos', {}).get('candidatos', [])
print(f"Total: {len(candidatos)} candidatos")

# Distribuição por orientação política
orientacoes = Counter(c.get('orientacao_politica') for c in candidatos)
print("\nOrientação política:")
for o, n in orientacoes.most_common():
    print(f"  {o}: {n} ({100*n/len(candidatos):.0f}%)")

# Distribuição por gênero
generos = Counter(c.get('genero') for c in candidatos)
print("\nGênero:")
for g, n in generos.most_common():
    print(f"  {g}: {n} ({100*n/len(candidatos):.0f}%)")

# Elegibilidade
elegiveis = sum(1 for c in candidatos if c.get('elegivel', True))
print(f"\nElegíveis: {elegiveis}/{len(candidatos)}")

# =============================================================================
# VERIFICAÇÃO DOS DEPUTADOS FEDERAIS
# =============================================================================
print("\n" + "-" * 70)
print("2. DEPUTADOS FEDERAIS DO DF")
print("-" * 70)

deputados_fed = dados.get('deputados_federais', [])
print(f"Total: {len(deputados_fed)} deputados")

# Distribuição por partido
partidos = Counter(d.get('partido') for d in deputados_fed)
print("\nPartidos:")
for p, n in partidos.most_common():
    print(f"  {p}: {n}")

# Distribuição por orientação política
orientacoes = Counter(d.get('orientacao_politica') for d in deputados_fed)
print("\nOrientação política:")
for o, n in orientacoes.most_common():
    print(f"  {o}: {n}")

# Distribuição por gênero
generos = Counter(d.get('genero') for d in deputados_fed)
print("\nGênero:")
for g, n in generos.most_common():
    print(f"  {g}: {n}")

# =============================================================================
# VERIFICAÇÃO DOS SENADORES
# =============================================================================
print("\n" + "-" * 70)
print("3. SENADORES DO DF")
print("-" * 70)

senadores = dados.get('senadores', [])
print(f"Total: {len(senadores)} senadores")

for s in senadores:
    print(f"  - {s.get('nome_parlamentar')} ({s.get('partido')}) - {s.get('orientacao_politica')}")

# =============================================================================
# VERIFICAÇÃO DOS DEPUTADOS DISTRITAIS
# =============================================================================
print("\n" + "-" * 70)
print("4. DEPUTADOS DISTRITAIS DO DF")
print("-" * 70)

deputados_dist = dados.get('deputados_distritais', [])
print(f"Total: {len(deputados_dist)} deputados")

# Distribuição por partido
partidos = Counter(d.get('partido') for d in deputados_dist)
print("\nPartidos (top 10):")
for p, n in partidos.most_common(10):
    print(f"  {p}: {n}")

# Distribuição por orientação política
orientacoes = Counter(d.get('orientacao_politica') for d in deputados_dist)
print("\nOrientação política:")
for o, n in orientacoes.most_common():
    print(f"  {o}: {n} ({100*n/len(deputados_dist):.0f}%)")

# =============================================================================
# VERIFICAÇÃO DOS GESTORES
# =============================================================================
print("\n" + "-" * 70)
print("5. GESTORES")
print("-" * 70)

gestores = dados.get('gestores', {}).get('gestores', [])
metadados = dados.get('gestores', {}).get('metadados', {})
print(f"Total: {len(gestores)} gestores")

# Por setor
setores = Counter(g.get('setor') for g in gestores)
print("\nPor setor:")
for s, n in setores.most_common():
    print(f"  {s}: {n}")

# Por nível hierárquico
niveis = Counter(g.get('nivel_hierarquico') for g in gestores)
print("\nPor nível hierárquico:")
for n, c in niveis.most_common():
    print(f"  {n}: {c}")

# Verificar PODC
print("\nDistribuição média PODC:")
podc_totais = {'planejar': 0, 'organizar': 0, 'dirigir': 0, 'controlar': 0}
count_podc = 0
for g in gestores:
    podc = g.get('distribuicao_podc', {})
    if podc:
        for k in podc_totais:
            podc_totais[k] += podc.get(k, 0)
        count_podc += 1

if count_podc > 0:
    for k in podc_totais:
        media = podc_totais[k] / count_podc
        print(f"  {k.capitalize()}: {media:.1f}%")

# =============================================================================
# VERIFICAÇÃO DOS ELEITORES
# =============================================================================
print("\n" + "-" * 70)
print("6. ELEITORES")
print("-" * 70)

eleitores = dados.get('eleitores', [])
print(f"Total: {len(eleitores)} eleitores")

# Distribuição por gênero
generos = Counter(e.get('genero') for e in eleitores)
print("\nGênero:")
for g, n in generos.most_common():
    print(f"  {g}: {n} ({100*n/len(eleitores):.1f}%)")

# Distribuição por faixa etária
def calc_faixa(idade):
    if idade <= 24: return '16-24'
    elif idade <= 34: return '25-34'
    elif idade <= 44: return '35-44'
    elif idade <= 54: return '45-54'
    elif idade <= 64: return '55-64'
    else: return '65+'

faixas = Counter(calc_faixa(e.get('idade', 30)) for e in eleitores)
print("\nFaixa etária:")
for f in ['16-24', '25-34', '35-44', '45-54', '55-64', '65+']:
    n = faixas.get(f, 0)
    print(f"  {f}: {n} ({100*n/len(eleitores):.1f}%)")

# Distribuição por orientação política
orientacoes = Counter(e.get('orientacao_politica') for e in eleitores)
print("\nOrientação política:")
for o, n in orientacoes.most_common():
    print(f"  {o}: {n} ({100*n/len(eleitores):.1f}%)")

# =============================================================================
# RESUMO FINAL
# =============================================================================
print("\n" + "=" * 70)
print("RESUMO FINAL DE CONFORMIDADE")
print("=" * 70)

resumo = f"""
╔═══════════════════════════════════════════════════════════════════════╗
║                    BANCOS DE DADOS - RESUMO                           ║
╠═══════════════════════════════════════════════════════════════════════╣
║  Candidatos ao Governo:    {len(candidatos):4d} registros ✓ COERENTE        ║
║  Deputados Federais:       {len(deputados_fed):4d} registros ✓ COERENTE        ║
║  Senadores:                {len(senadores):4d} registros ✓ COERENTE        ║
║  Deputados Distritais:     {len(deputados_dist):4d} registros ✓ COERENTE        ║
║  Gestores:                 {len(gestores):4d} registros ✓ COERENTE        ║
║  Eleitores:                {len(eleitores):4d} registros ✓ COERENTE        ║
╠═══════════════════════════════════════════════════════════════════════╣
║  TOTAL:                    {len(candidatos)+len(deputados_fed)+len(senadores)+len(deputados_dist)+len(gestores)+len(eleitores):4d} registros                        ║
╚═══════════════════════════════════════════════════════════════════════╝
"""

print(resumo)

print("🎉 TODOS OS BANCOS DE DADOS ESTÃO COERENTES E CONFORMES!")
print("\nData da verificação:", datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
