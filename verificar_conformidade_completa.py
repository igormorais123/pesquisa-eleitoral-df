"""
Verificação Completa de Conformidade - Incluindo Preocupações, Valores e Medos
"""
import json
from collections import Counter

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f"Total de eleitores: {len(eleitores)}")
print("\n" + "=" * 70)
print("VERIFICAÇÃO COMPLETA DE CONFORMIDADE")
print("=" * 70)

# ==============================================================================
# VARIÁVEIS DEMOGRÁFICAS E SOCIOECONÔMICAS
# ==============================================================================
referencias = {
    'genero': {'feminino': 52.4, 'masculino': 47.6},
    'faixa_etaria': {'16-24': 14.5, '25-34': 20.0, '35-44': 20.5, '45-54': 18.0, '55-64': 12.0, '65+': 15.0},
    'renda_salarios_minimos': {'ate_1': 28.5, 'mais_de_1_ate_2': 25.8, 'mais_de_2_ate_5': 24.2, 'mais_de_5_ate_10': 12.5, 'mais_de_10_ate_20': 6.0, 'mais_de_20': 3.0},
    'escolaridade': {'superior_ou_pos': 37.0, 'medio_completo_ou_sup_incompleto': 43.8, 'fundamental_ou_sem_instrucao': 19.2},
    'estilo_decisao': {'identitario': 25.0, 'pragmatico': 20.0, 'moral': 15.0, 'economico': 25.0, 'emocional': 15.0},
    'conflito_identitario': {True: 25.0, False: 75.0},
    'interesse_politico': {'baixo': 45.0, 'medio': 35.0, 'alto': 20.0},
}

scores = {'otimo': 0, 'bom': 0, 'atencao': 0, 'critico': 0}

print("\n--- VARIÁVEIS DEMOGRÁFICAS ---")
for campo, ref in referencias.items():
    if campo == 'faixa_etaria':
        def calc_faixa(idade):
            if idade <= 24: return '16-24'
            elif idade <= 34: return '25-34'
            elif idade <= 44: return '35-44'
            elif idade <= 54: return '45-54'
            elif idade <= 64: return '55-64'
            else: return '65+'
        contagem = Counter(calc_faixa(e['idade']) for e in eleitores)
    else:
        contagem = Counter(e.get(campo, 'desconhecido') for e in eleitores)

    desvios = []
    for cat, ref_pct in ref.items():
        n = contagem.get(cat, 0)
        atual_pct = 100 * n / len(eleitores)
        desvios.append(abs(atual_pct - ref_pct))

    desvio_medio = sum(desvios) / len(desvios)
    if desvio_medio <= 3:
        scores['otimo'] += 1
        status = 'ÓTIMO'
    elif desvio_medio <= 7:
        scores['bom'] += 1
        status = 'BOM'
    elif desvio_medio <= 12:
        scores['atencao'] += 1
        status = 'ATENÇÃO'
    else:
        scores['critico'] += 1
        status = 'CRÍTICO'

    print(f"  {campo}: {status} (desvio médio: {desvio_medio:.1f}%)")

# ==============================================================================
# PREOCUPAÇÕES
# ==============================================================================
print("\n--- PREOCUPAÇÕES ---")

refs_preocs = {
    'Saúde': 28.0,
    'Segurança pública': 22.0,
    'Economia': 18.0,
    'Corrupção': 12.0,
    'Educação': 10.0,
    'Desemprego': 10.0
}

todas_preocs = []
for e in eleitores:
    todas_preocs.extend(e.get('preocupacoes', []))
total_preocs = len(todas_preocs)
contagem_preocs = Counter(todas_preocs)

desvios_preocs = []
for cat, ref_pct in refs_preocs.items():
    n = contagem_preocs.get(cat, 0)
    atual_pct = 100 * n / total_preocs if total_preocs > 0 else 0
    desvio = abs(atual_pct - ref_pct)
    desvios_preocs.append(desvio)
    status = '✓' if desvio <= 5 else '⚠' if desvio <= 10 else '✗'
    print(f"  {status} {cat}: {atual_pct:.1f}% (ref: {ref_pct}%)")

desvio_medio_preocs = sum(desvios_preocs) / len(desvios_preocs)
if desvio_medio_preocs <= 5:
    scores['otimo'] += 1
    print(f"  → ÓTIMO (desvio médio: {desvio_medio_preocs:.1f}%)")
elif desvio_medio_preocs <= 10:
    scores['bom'] += 1
    print(f"  → BOM (desvio médio: {desvio_medio_preocs:.1f}%)")
else:
    scores['atencao'] += 1
    print(f"  → ATENÇÃO (desvio médio: {desvio_medio_preocs:.1f}%)")

# ==============================================================================
# VALORES
# ==============================================================================
print("\n--- VALORES ---")

refs_vals = {
    'Família': 35.0,
    'Trabalho': 20.0,
    'Segurança': 15.0,
    'Fé e religião': 12.0,
    'Liberdade': 10.0,
    'Igualdade': 8.0
}

todos_vals = []
for e in eleitores:
    todos_vals.extend(e.get('valores', []))
total_vals = len(todos_vals)
contagem_vals = Counter(todos_vals)

desvios_vals = []
for cat, ref_pct in refs_vals.items():
    n = contagem_vals.get(cat, 0)
    atual_pct = 100 * n / total_vals if total_vals > 0 else 0
    desvio = abs(atual_pct - ref_pct)
    desvios_vals.append(desvio)
    status = '✓' if desvio <= 5 else '⚠' if desvio <= 10 else '✗'
    print(f"  {status} {cat}: {atual_pct:.1f}% (ref: {ref_pct}%)")

desvio_medio_vals = sum(desvios_vals) / len(desvios_vals)
if desvio_medio_vals <= 5:
    scores['otimo'] += 1
    print(f"  → ÓTIMO (desvio médio: {desvio_medio_vals:.1f}%)")
elif desvio_medio_vals <= 10:
    scores['bom'] += 1
    print(f"  → BOM (desvio médio: {desvio_medio_vals:.1f}%)")
else:
    scores['atencao'] += 1
    print(f"  → ATENÇÃO (desvio médio: {desvio_medio_vals:.1f}%)")

# ==============================================================================
# MEDOS
# ==============================================================================
print("\n--- MEDOS ---")

refs_medos = {
    'Violência': 30.0,
    'Desemprego': 22.0,
    'Saúde': 18.0,
    'Economia': 15.0,
    'Corrupção': 10.0,
    'Instabilidade política': 5.0
}

mapa_medos = {
    'Violência': ['Violência', 'Filhos no crime'],
    'Desemprego': ['Desemprego', 'Perder o emprego', 'Não conseguir emprego'],
    'Saúde': ['Saúde', 'Doença', 'Doença sem atendimento'],
    'Economia': ['Economia', 'Não conseguir pagar as contas', 'Inflação', 'Crise econômica', 'Perder a casa', 'Fome'],
    'Corrupção': ['Corrupção'],
    'Instabilidade política': ['Instabilidade política', 'Autoritarismo', 'Reforma administrativa']
}

todos_medos = []
for e in eleitores:
    todos_medos.extend(e.get('medos', []))
total_medos = len(todos_medos)
contagem_medos = Counter(todos_medos)

desvios_medos = []
for cat, ref_pct in refs_medos.items():
    total_cat = 0
    for medo in mapa_medos.get(cat, [cat]):
        total_cat += contagem_medos.get(medo, 0)
    atual_pct = 100 * total_cat / total_medos if total_medos > 0 else 0
    desvio = abs(atual_pct - ref_pct)
    desvios_medos.append(desvio)
    status = '✓' if desvio <= 5 else '⚠' if desvio <= 10 else '✗'
    print(f"  {status} {cat}: {atual_pct:.1f}% (ref: {ref_pct}%)")

desvio_medio_medos = sum(desvios_medos) / len(desvios_medos)
if desvio_medio_medos <= 5:
    scores['otimo'] += 1
    print(f"  → ÓTIMO (desvio médio: {desvio_medio_medos:.1f}%)")
elif desvio_medio_medos <= 10:
    scores['bom'] += 1
    print(f"  → BOM (desvio médio: {desvio_medio_medos:.1f}%)")
else:
    scores['atencao'] += 1
    print(f"  → ATENÇÃO (desvio médio: {desvio_medio_medos:.1f}%)")

# ==============================================================================
# ÍNDICE FINAL
# ==============================================================================
print("\n" + "=" * 70)
print("ÍNDICE DE CONFORMIDADE FINAL")
print("=" * 70)

peso_total = (scores['otimo'] * 100 + scores['bom'] * 75 +
              scores['atencao'] * 50 + scores['critico'] * 25)
total_variaveis = sum(scores.values())
indice = peso_total / total_variaveis

print(f"\nÓtimas (≤3%/5%): {scores['otimo']}")
print(f"Boas (3-7%/10%): {scores['bom']}")
print(f"Atenção (7-12%): {scores['atencao']}")
print(f"Críticas (>12%): {scores['critico']}")
print(f"\n{'='*40}")
print(f"ÍNDICE DE CONFORMIDADE: {indice:.1f}%")
print(f"{'='*40}")

if indice >= 90:
    print("✓ EXCELENTE - Amostra altamente representativa!")
elif indice >= 80:
    print("✓ BOM - Amostra com boa representatividade")
elif indice >= 70:
    print("⚠ REGULAR - Alguns ajustes necessários")
else:
    print("✗ INSUFICIENTE - Precisa de correções significativas")

# Resumo de campos numéricos
print("\n--- CAMPOS NUMÉRICOS ---")
rendas = [e.get('renda_mensal', 0) for e in eleitores]
tempos = [e.get('tempo_deslocamento_minutos', 0) for e in eleitores]
tempos_validos = [t for t in tempos if t > 0]

print(f"  renda_mensal: R$ {min(rendas):.0f} - R$ {max(rendas):.0f} (média: R$ {sum(rendas)/len(rendas):.0f})")
print(f"  tempo_deslocamento_minutos: {min(tempos_validos) if tempos_validos else 0} - {max(tempos_validos) if tempos_validos else 0} min")
print(f"  susceptibilidade_desinformacao_num: 1-3")
