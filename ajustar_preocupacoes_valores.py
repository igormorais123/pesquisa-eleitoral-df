"""
Ajuste de Preocupações e Valores para Referências Oficiais
Mantém coerência interna de cada eleitor
"""
import json
import random
from collections import Counter

random.seed(2026)

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f"Total de eleitores: {len(eleitores)}")

# ==============================================================================
# REFERÊNCIAS OFICIAIS
# ==============================================================================

# Preocupações - Datafolha 2024 (proporção de menções)
refs_preocs = {
    'Saúde': 28.0,
    'Segurança pública': 22.0,
    'Economia': 18.0,
    'Corrupção': 12.0,
    'Educação': 10.0,
    'Desemprego': 10.0
}

# Valores - World Values Survey 2023
refs_vals = {
    'Família': 35.0,
    'Trabalho': 20.0,
    'Segurança': 15.0,
    'Fé e religião': 12.0,
    'Liberdade': 10.0,
    'Igualdade': 8.0
}

# Medos - FGV 2024
refs_medos = {
    'Violência': 30.0,
    'Desemprego': 22.0,
    'Saúde': 18.0,
    'Economia': 15.0,
    'Corrupção': 10.0,
    'Instabilidade política': 5.0
}

# ==============================================================================
# 1. AJUSTAR PREOCUPAÇÕES
# ==============================================================================
print("\n[1] Ajustando preocupações...")

# Contagem atual
todas_preocs = []
for e in eleitores:
    todas_preocs.extend(e.get('preocupacoes', []))
total_preocs = len(todas_preocs)
contagem_preocs = Counter(todas_preocs)

print(f"  Total de menções atual: {total_preocs}")

# Categorias válidas de preocupações
preocs_validas = [
    'Saúde', 'Segurança pública', 'Economia', 'Corrupção', 'Educação',
    'Desemprego', 'Violência e criminalidade', 'Custo de vida', 'Inflação',
    'Transporte público', 'Moradia', 'Meio ambiente', 'Fome e miséria',
    'Desigualdade social', 'Drogas', 'Impostos altos'
]

# Mapeamento de sinônimos
mapa_sinonimos_preocs = {
    'Violência': 'Violência e criminalidade',
    'Segurança': 'Segurança pública',
    'Crime': 'Violência e criminalidade',
    'Saude': 'Saúde',
    'Emprego': 'Desemprego',
}

# Calcular quantas menções de cada categoria precisamos
media_preocs_por_eleitor = 3.5
total_target = int(len(eleitores) * media_preocs_por_eleitor)

targets_preocs = {}
for cat, pct in refs_preocs.items():
    targets_preocs[cat] = int(total_target * pct / 100)

# Categorias secundárias (completam os 100%)
outras_preocs = ['Violência e criminalidade', 'Custo de vida', 'Transporte público',
                 'Moradia', 'Meio ambiente', 'Fome e miséria', 'Desigualdade social']

print(f"  Targets de preocupações: {targets_preocs}")

# Reconstruir preocupações de cada eleitor mantendo coerência
for e in eleitores:
    novas_preocs = []

    # Preocupação principal baseada no perfil
    renda = e.get('renda_salarios_minimos', '')
    classe = e.get('cluster_socioeconomico', '')
    ocupacao = e.get('ocupacao_vinculo', '')
    idade = e.get('idade', 35)

    # Definir peso para cada preocupação baseado no perfil
    pesos = {
        'Saúde': 28,
        'Segurança pública': 22,
        'Economia': 18,
        'Corrupção': 12,
        'Educação': 10,
        'Desemprego': 10
    }

    # Ajustar pesos por perfil (coerência)
    if renda in ['ate_1', 'mais_de_1_ate_2']:
        pesos['Saúde'] += 10
        pesos['Desemprego'] += 5
        pesos['Economia'] += 5

    if classe in ['G4_baixa', 'G5_vulneravel']:
        pesos['Saúde'] += 8
        pesos['Desemprego'] += 5

    if ocupacao == 'desempregado':
        pesos['Desemprego'] += 15

    if ocupacao == 'servidor_publico':
        pesos['Corrupção'] += 5

    if idade >= 60:
        pesos['Saúde'] += 10

    filhos = e.get('filhos', 0)
    if filhos > 0:
        pesos['Educação'] += 5
        pesos['Segurança pública'] += 3

    # Normalizar pesos
    total_peso = sum(pesos.values())
    pesos_norm = {k: v/total_peso for k, v in pesos.items()}

    # Selecionar 3-4 preocupações baseado nos pesos
    num_preocs = random.randint(3, 4)
    categorias = list(pesos_norm.keys())
    probs = list(pesos_norm.values())

    selecionadas = set()
    while len(selecionadas) < num_preocs:
        escolha = random.choices(categorias, weights=probs, k=1)[0]
        selecionadas.add(escolha)

    e['preocupacoes'] = list(selecionadas)

# Verificar distribuição final
todas_preocs_final = []
for e in eleitores:
    todas_preocs_final.extend(e.get('preocupacoes', []))

total_final = len(todas_preocs_final)
contagem_final = Counter(todas_preocs_final)

print("\n  Distribuição final de preocupações:")
for preoc in refs_preocs.keys():
    n = contagem_final.get(preoc, 0)
    pct = 100 * n / total_final
    ref = refs_preocs[preoc]
    diff = pct - ref
    status = '✓' if abs(diff) <= 5 else '⚠'
    print(f"    {status} {preoc}: {pct:.1f}% (ref: {ref}%)")

# ==============================================================================
# 2. AJUSTAR VALORES
# ==============================================================================
print("\n[2] Ajustando valores...")

# Valores válidos
valores_validos = [
    'Família', 'Trabalho', 'Segurança', 'Fé e religião', 'Liberdade', 'Igualdade',
    'Honestidade', 'Educação', 'Saúde', 'Respeito', 'Justiça', 'Solidariedade',
    'Democracia', 'Ordem', 'Meritocracia', 'Meio ambiente', 'Direitos humanos',
    'Estabilidade', 'Empreendedorismo', 'Pragmatismo'
]

# Reconstruir valores de cada eleitor
for e in eleitores:
    # Pesos base (referências)
    pesos = {
        'Família': 35,
        'Trabalho': 20,
        'Segurança': 15,
        'Fé e religião': 12,
        'Liberdade': 10,
        'Igualdade': 8
    }

    # Valores secundários com pesos menores
    valores_secundarios = {
        'Honestidade': 8,
        'Educação': 6,
        'Saúde': 5,
        'Respeito': 5,
        'Justiça': 4,
        'Solidariedade': 4,
        'Democracia': 3,
        'Ordem': 3
    }

    # Ajustar por perfil
    religiao = e.get('religiao', '')
    orient_politica = e.get('orientacao_politica', '')
    estado_civil = e.get('estado_civil', '')
    filhos = e.get('filhos', 0)
    idade = e.get('idade', 35)

    # Família: maior para casados e com filhos
    if estado_civil in ['casado(a)', 'uniao_estavel']:
        pesos['Família'] += 10
    if filhos > 0:
        pesos['Família'] += 8

    # Religião: maior para religiosos
    if religiao in ['evangelica', 'catolica']:
        pesos['Fé e religião'] += 15
    elif religiao == 'sem_religiao':
        pesos['Fé e religião'] = 2
        pesos['Liberdade'] += 5

    # Trabalho: maior para idade produtiva
    if 25 <= idade <= 55:
        pesos['Trabalho'] += 8

    # Orientação política
    if orient_politica in ['esquerda', 'centro_esquerda']:
        pesos['Igualdade'] += 8
        pesos['Liberdade'] += 3
        valores_secundarios['Democracia'] += 5
        valores_secundarios['Direitos humanos'] = 5
    elif orient_politica in ['direita', 'centro_direita']:
        pesos['Segurança'] += 5
        pesos['Família'] += 5
        valores_secundarios['Ordem'] += 5
        valores_secundarios['Meritocracia'] = 5

    # Combinar pesos
    todos_pesos = {**pesos, **valores_secundarios}

    # Normalizar
    total_peso = sum(todos_pesos.values())
    pesos_norm = {k: v/total_peso for k, v in todos_pesos.items()}

    # Selecionar 4-6 valores
    num_vals = random.randint(4, 6)
    categorias = list(pesos_norm.keys())
    probs = list(pesos_norm.values())

    selecionados = set()
    while len(selecionados) < num_vals:
        escolha = random.choices(categorias, weights=probs, k=1)[0]
        selecionados.add(escolha)

    e['valores'] = list(selecionados)

# Verificar distribuição final
todos_vals_final = []
for e in eleitores:
    todos_vals_final.extend(e.get('valores', []))

total_vals_final = len(todos_vals_final)
contagem_vals_final = Counter(todos_vals_final)

print("\n  Distribuição final de valores:")
for val in refs_vals.keys():
    n = contagem_vals_final.get(val, 0)
    pct = 100 * n / total_vals_final
    ref = refs_vals[val]
    diff = pct - ref
    status = '✓' if abs(diff) <= 5 else '⚠'
    print(f"    {status} {val}: {pct:.1f}% (ref: {ref}%)")

# ==============================================================================
# 3. AJUSTAR MEDOS
# ==============================================================================
print("\n[3] Ajustando medos...")

# Medos válidos
medos_validos = [
    'Violência', 'Desemprego', 'Saúde', 'Economia', 'Corrupção',
    'Instabilidade política', 'Perder o emprego', 'Não conseguir pagar as contas',
    'Doença', 'Fome', 'Perder a casa', 'Filhos no crime', 'Autoritarismo',
    'Inflação', 'Crise econômica', 'Reforma administrativa', 'Desigualdade'
]

# Mapeamento para categorias principais
mapa_medos = {
    'Violência': ['Violência', 'Filhos no crime'],
    'Desemprego': ['Desemprego', 'Perder o emprego', 'Não conseguir emprego'],
    'Saúde': ['Saúde', 'Doença', 'Doença sem atendimento'],
    'Economia': ['Economia', 'Não conseguir pagar as contas', 'Inflação', 'Crise econômica', 'Perder a casa', 'Fome'],
    'Corrupção': ['Corrupção'],
    'Instabilidade política': ['Instabilidade política', 'Autoritarismo', 'Reforma administrativa']
}

for e in eleitores:
    # Pesos base
    pesos = {
        'Violência': 30,
        'Desemprego': 22,
        'Saúde': 18,
        'Economia': 15,
        'Corrupção': 10,
        'Instabilidade política': 5
    }

    # Ajustar por perfil
    renda = e.get('renda_salarios_minimos', '')
    ocupacao = e.get('ocupacao_vinculo', '')
    idade = e.get('idade', 35)
    regiao = e.get('regiao_administrativa', '')

    # Renda baixa = mais medo de economia
    if renda in ['ate_1', 'mais_de_1_ate_2']:
        pesos['Economia'] += 10
        pesos['Desemprego'] += 5

    # Desempregado = medo de desemprego
    if ocupacao == 'desempregado':
        pesos['Desemprego'] += 15

    # Servidor público = medo de reforma
    if ocupacao == 'servidor_publico':
        pesos['Instabilidade política'] += 10

    # Idosos = mais medo de saúde
    if idade >= 55:
        pesos['Saúde'] += 12

    # Regiões periféricas = mais violência
    regioes_perifericas = ['Ceilândia', 'Samambaia', 'Santa Maria', 'Recanto das Emas',
                           'São Sebastião', 'Paranoá', 'Itapoã', 'Estrutural']
    if regiao in regioes_perifericas:
        pesos['Violência'] += 8

    # Normalizar
    total_peso = sum(pesos.values())
    pesos_norm = {k: v/total_peso for k, v in pesos.items()}

    # Converter categoria em medo específico
    num_medos = random.randint(2, 4)
    categorias = list(pesos_norm.keys())
    probs = list(pesos_norm.values())

    medos_selecionados = []
    categorias_usadas = set()

    while len(medos_selecionados) < num_medos and len(categorias_usadas) < len(categorias):
        cat = random.choices(categorias, weights=probs, k=1)[0]
        if cat not in categorias_usadas:
            categorias_usadas.add(cat)
            # Escolher um medo específico dessa categoria
            opcoes = mapa_medos.get(cat, [cat])
            medo_especifico = random.choice(opcoes)
            medos_selecionados.append(medo_especifico)

    e['medos'] = medos_selecionados

# Verificar distribuição final
todos_medos_final = []
for e in eleitores:
    todos_medos_final.extend(e.get('medos', []))

total_medos_final = len(todos_medos_final)
contagem_medos_final = Counter(todos_medos_final)

print("\n  Distribuição final de medos (por categoria):")
for cat in refs_medos.keys():
    # Somar todas as variações da categoria
    total_cat = 0
    for medo in mapa_medos.get(cat, [cat]):
        total_cat += contagem_medos_final.get(medo, 0)

    pct = 100 * total_cat / total_medos_final
    ref = refs_medos[cat]
    diff = pct - ref
    status = '✓' if abs(diff) <= 5 else '⚠'
    print(f"    {status} {cat}: {pct:.1f}% (ref: {ref}%)")

# ==============================================================================
# 4. SALVAR
# ==============================================================================
print("\n[4] Salvando...")

with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)

print("Arquivo salvo!")

# ==============================================================================
# RESUMO
# ==============================================================================
print("\n" + "=" * 70)
print("RESUMO FINAL")
print("=" * 70)

print(f"\nPreocupações: {total_final} menções ({total_final/len(eleitores):.1f} por eleitor)")
print(f"Valores: {total_vals_final} menções ({total_vals_final/len(eleitores):.1f} por eleitor)")
print(f"Medos: {total_medos_final} menções ({total_medos_final/len(eleitores):.1f} por eleitor)")
