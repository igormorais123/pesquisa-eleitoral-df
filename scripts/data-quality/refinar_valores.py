"""
Refinamento de Valores - Aumentar Família e Trabalho
"""
import json
import random
from collections import Counter

random.seed(2027)

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

print("\n[1] Refinando valores com pesos maiores para Família e Trabalho...")

for e in eleitores:
    # Pesos base MUITO mais fortes para Família e Trabalho
    pesos = {
        'Família': 70,      # Aumentado de 35
        'Trabalho': 45,     # Aumentado de 20
        'Segurança': 20,
        'Fé e religião': 15,
        'Liberdade': 12,
        'Igualdade': 10
    }

    # Valores secundários
    valores_secundarios = {
        'Honestidade': 6,
        'Educação': 5,
        'Saúde': 4,
        'Respeito': 4,
        'Justiça': 3,
        'Solidariedade': 3,
        'Democracia': 2,
        'Ordem': 2
    }

    # Ajustar por perfil
    religiao = e.get('religiao', '')
    orient_politica = e.get('orientacao_politica', '')
    estado_civil = e.get('estado_civil', '')
    filhos = e.get('filhos', 0)
    idade = e.get('idade', 35)
    ocupacao = e.get('ocupacao_vinculo', '')

    # Família: GARANTIR para casados e com filhos
    if estado_civil in ['casado(a)', 'uniao_estavel']:
        pesos['Família'] += 30
    if filhos > 0:
        pesos['Família'] += 25

    # Religião
    if religiao in ['evangelica', 'catolica']:
        pesos['Fé e religião'] += 20
        pesos['Família'] += 10  # Religiosos valorizam família
    elif religiao == 'sem_religiao':
        pesos['Fé e religião'] = 2
        pesos['Liberdade'] += 8

    # Trabalho: maior para empregados e idade produtiva
    if ocupacao in ['clt', 'autonomo', 'servidor_publico', 'empresario']:
        pesos['Trabalho'] += 20
    if 25 <= idade <= 55:
        pesos['Trabalho'] += 15

    # Orientação política
    if orient_politica in ['esquerda', 'centro_esquerda']:
        pesos['Igualdade'] += 12
        pesos['Liberdade'] += 5
    elif orient_politica in ['direita', 'centro_direita']:
        pesos['Segurança'] += 8
        pesos['Família'] += 10
        pesos['Trabalho'] += 5

    # Combinar pesos
    todos_pesos = {**pesos, **valores_secundarios}

    # Normalizar
    total_peso = sum(todos_pesos.values())
    pesos_norm = {k: v/total_peso for k, v in todos_pesos.items()}

    # GARANTIR que Família está presente para maioria
    valores_selecionados = []

    # 80% dos eleitores devem ter Família
    if random.random() < 0.85:
        valores_selecionados.append('Família')

    # 60% devem ter Trabalho
    if random.random() < 0.65 and 'Trabalho' not in valores_selecionados:
        valores_selecionados.append('Trabalho')

    # Completar com outros valores
    num_vals = random.randint(4, 6)
    categorias = list(pesos_norm.keys())
    probs = list(pesos_norm.values())

    while len(valores_selecionados) < num_vals:
        escolha = random.choices(categorias, weights=probs, k=1)[0]
        if escolha not in valores_selecionados:
            valores_selecionados.append(escolha)

    e['valores'] = valores_selecionados

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
# 2. REFINAR MEDOS - Aumentar Violência
# ==============================================================================
print("\n[2] Refinando medos...")

mapa_medos = {
    'Violência': ['Violência', 'Filhos no crime'],
    'Desemprego': ['Desemprego', 'Perder o emprego', 'Não conseguir emprego'],
    'Saúde': ['Saúde', 'Doença', 'Doença sem atendimento'],
    'Economia': ['Economia', 'Não conseguir pagar as contas', 'Inflação', 'Crise econômica', 'Perder a casa', 'Fome'],
    'Corrupção': ['Corrupção'],
    'Instabilidade política': ['Instabilidade política', 'Autoritarismo', 'Reforma administrativa']
}

refs_medos = {
    'Violência': 30.0,
    'Desemprego': 22.0,
    'Saúde': 18.0,
    'Economia': 15.0,
    'Corrupção': 10.0,
    'Instabilidade política': 5.0
}

for e in eleitores:
    # Pesos ajustados
    pesos = {
        'Violência': 35,    # Aumentado
        'Desemprego': 22,
        'Saúde': 18,
        'Economia': 14,
        'Corrupção': 8,
        'Instabilidade política': 3
    }

    # Ajustar por perfil
    renda = e.get('renda_salarios_minimos', '')
    ocupacao = e.get('ocupacao_vinculo', '')
    idade = e.get('idade', 35)
    regiao = e.get('regiao_administrativa', '')
    filhos = e.get('filhos', 0)

    # Classe baixa
    if renda in ['ate_1', 'mais_de_1_ate_2']:
        pesos['Economia'] += 8
        pesos['Violência'] += 5

    # Desempregado
    if ocupacao == 'desempregado':
        pesos['Desemprego'] += 15

    # Servidor
    if ocupacao == 'servidor_publico':
        pesos['Instabilidade política'] += 8

    # Idosos
    if idade >= 55:
        pesos['Saúde'] += 12

    # Pais com filhos
    if filhos > 0:
        pesos['Violência'] += 10  # Medo pelos filhos

    # Regiões periféricas
    regioes_perifericas = ['Ceilândia', 'Samambaia', 'Santa Maria', 'Recanto das Emas',
                           'São Sebastião', 'Paranoá', 'Itapoã', 'Estrutural']
    if regiao in regioes_perifericas:
        pesos['Violência'] += 12

    # Normalizar
    total_peso = sum(pesos.values())
    pesos_norm = {k: v/total_peso for k, v in pesos.items()}

    # Selecionar medos
    num_medos = random.randint(2, 4)

    # GARANTIR violência para maioria
    medos_selecionados = []
    if random.random() < 0.75:
        opcoes_violencia = mapa_medos['Violência']
        medos_selecionados.append(random.choice(opcoes_violencia))

    categorias = list(pesos_norm.keys())
    probs = list(pesos_norm.values())
    categorias_usadas = {'Violência'} if medos_selecionados else set()

    while len(medos_selecionados) < num_medos:
        cat = random.choices(categorias, weights=probs, k=1)[0]
        if cat not in categorias_usadas:
            categorias_usadas.add(cat)
            opcoes = mapa_medos.get(cat, [cat])
            medo_especifico = random.choice(opcoes)
            medos_selecionados.append(medo_especifico)

    e['medos'] = medos_selecionados

# Verificar
todos_medos_final = []
for e in eleitores:
    todos_medos_final.extend(e.get('medos', []))

total_medos_final = len(todos_medos_final)
contagem_medos_final = Counter(todos_medos_final)

print("\n  Distribuição final de medos:")
for cat in refs_medos.keys():
    total_cat = 0
    for medo in mapa_medos.get(cat, [cat]):
        total_cat += contagem_medos_final.get(medo, 0)
    pct = 100 * total_cat / total_medos_final
    ref = refs_medos[cat]
    diff = pct - ref
    status = '✓' if abs(diff) <= 5 else '⚠'
    print(f"    {status} {cat}: {pct:.1f}% (ref: {ref}%)")

# ==============================================================================
# SALVAR
# ==============================================================================
print("\n[3] Salvando...")

with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(eleitores, f, ensure_ascii=False, indent=2)

print("Arquivo salvo!")

print(f"\nTotal de valores: {total_vals_final} ({total_vals_final/len(eleitores):.1f} por eleitor)")
print(f"Total de medos: {total_medos_final} ({total_medos_final/len(eleitores):.1f} por eleitor)")
