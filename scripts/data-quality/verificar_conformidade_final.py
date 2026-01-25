"""
Script de Verificação de Conformidade e Coerência
Calcula o índice de conformidade e verifica coerência interna
"""
import json
from collections import Counter

# Carregar dados
with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

print(f"Total de eleitores: {len(eleitores)}")
print()

# ==============================================================================
# REFERÊNCIAS OFICIAIS
# ==============================================================================
referencias = {
    'genero': {'feminino': 52.4, 'masculino': 47.6},
    'faixa_etaria': {'16-24': 14.5, '25-34': 20.0, '35-44': 20.5, '45-54': 18.0, '55-64': 12.0, '65+': 15.0},
    'cor_raca': {'parda': 45.4, 'branca': 35.2, 'preta': 12.1, 'amarela': 2.1, 'indigena': 0.4},
    'renda_salarios_minimos': {'ate_1': 28.5, 'mais_de_1_ate_2': 25.8, 'mais_de_2_ate_5': 24.2, 'mais_de_5_ate_10': 12.5, 'mais_de_10_ate_20': 6.0, 'mais_de_20': 3.0},
    'cluster_socioeconomico': {'G1_alta': 18.1, 'G2_media_alta': 20.8, 'G3_media_baixa': 32.9, 'G4_baixa': 28.2},
    'escolaridade': {'superior_ou_pos': 37.0, 'medio_completo_ou_sup_incompleto': 43.8, 'fundamental_ou_sem_instrucao': 19.2},
    'ocupacao_vinculo': {'clt': 37.5, 'servidor_publico': 8.5, 'autonomo': 25.0, 'empresario': 4.2, 'informal': 13.8, 'desempregado': 6.6, 'aposentado': 10.5, 'estudante': 5.0},
    'religiao': {'evangelica': 27.7, 'catolica': 37.3, 'sem_religiao': 17.7, 'outras': 10.0, 'espirita': 7.3},
    'orientacao_politica': {'esquerda': 15.0, 'centro_esquerda': 7.0, 'centro': 11.0, 'centro_direita': 11.0, 'direita': 29.0},
    'interesse_politico': {'baixo': 45.0, 'medio': 35.0, 'alto': 20.0},
    'estilo_decisao': {'identitario': 25.0, 'pragmatico': 20.0, 'moral': 15.0, 'economico': 25.0, 'emocional': 15.0},
    'conflito_identitario': {True: 25.0, False: 75.0},
    'tolerancia_nuance': {'baixa': 35.0, 'media': 40.0, 'alta': 25.0},
    'susceptibilidade_desinformacao': {'baixa': 25.0, 'media': 45.0, 'alta': 30.0},
}

# ==============================================================================
# CALCULAR DISTRIBUIÇÕES ATUAIS E DESVIOS
# ==============================================================================
print("=" * 70)
print("ANÁLISE DE CONFORMIDADE COM REFERÊNCIAS OFICIAIS")
print("=" * 70)

resultados = []
scores = {'otimo': 0, 'bom': 0, 'atencao': 0, 'critico': 0}

for campo, ref in referencias.items():
    # Contar distribuição atual
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

    print(f"\n{campo.upper()}:")

    desvios = []
    for categoria, ref_pct in ref.items():
        n = contagem.get(categoria, 0)
        atual_pct = 100 * n / len(eleitores)
        desvio = abs(atual_pct - ref_pct)
        desvios.append(desvio)

        if desvio <= 3:
            status = '✓'
        elif desvio <= 7:
            status = '⚠'
        elif desvio <= 12:
            status = '!'
        else:
            status = '✗'

        print(f"  {status} {categoria}: {atual_pct:.1f}% (ref: {ref_pct}%) | Δ: {atual_pct - ref_pct:+.1f}%")

    desvio_medio = sum(desvios) / len(desvios)
    if desvio_medio <= 3:
        classificacao = 'ÓTIMO'
        scores['otimo'] += 1
    elif desvio_medio <= 7:
        classificacao = 'BOM'
        scores['bom'] += 1
    elif desvio_medio <= 12:
        classificacao = 'ATENÇÃO'
        scores['atencao'] += 1
    else:
        classificacao = 'CRÍTICO'
        scores['critico'] += 1

    resultados.append({'campo': campo, 'desvio_medio': desvio_medio, 'classificacao': classificacao})
    print(f"  → Desvio médio: {desvio_medio:.1f}% ({classificacao})")

# ==============================================================================
# CALCULAR ÍNDICE DE CONFORMIDADE
# ==============================================================================
print("\n" + "=" * 70)
print("ÍNDICE DE CONFORMIDADE")
print("=" * 70)

# Pesos: ótimo=100, bom=75, atenção=50, crítico=25
peso_total = (scores['otimo'] * 100 + scores['bom'] * 75 +
              scores['atencao'] * 50 + scores['critico'] * 25)
total_variaveis = sum(scores.values())
indice = peso_total / total_variaveis

print(f"\nÓtimas (≤3%): {scores['otimo']}")
print(f"Boas (3-7%): {scores['bom']}")
print(f"Atenção (7-12%): {scores['atencao']}")
print(f"Críticas (>12%): {scores['critico']}")
print(f"\nÍNDICE DE CONFORMIDADE: {indice:.1f}%")

# ==============================================================================
# VERIFICAR COERÊNCIA INTERNA
# ==============================================================================
print("\n" + "=" * 70)
print("VERIFICAÇÃO DE COERÊNCIA INTERNA")
print("=" * 70)

incoerencias = []

for i, e in enumerate(eleitores):
    problemas = []

    # 1. Idade vs Ocupação
    idade = e.get('idade', 30)
    ocupacao = e.get('ocupacao_vinculo', '')
    if idade < 18 and ocupacao not in ['estudante', 'desempregado', 'informal']:
        problemas.append(f"Menor de 18 ({idade}) com ocupação {ocupacao}")
    if idade < 25 and ocupacao == 'aposentado':
        problemas.append(f"Muito jovem ({idade}) para aposentado")
    if idade > 70 and ocupacao == 'estudante':
        problemas.append(f"Muito idoso ({idade}) para estudante")

    # 2. Renda vs Classe
    renda = e.get('renda_salarios_minimos', '')
    classe = e.get('cluster_socioeconomico', '')
    if renda in ['ate_1', 'mais_de_1_ate_2'] and classe == 'G1_alta':
        problemas.append(f"Renda baixa ({renda}) com classe alta")
    if renda in ['mais_de_10_ate_20', 'mais_de_20'] and classe in ['G4_baixa', 'G5_vulneravel']:
        problemas.append(f"Renda alta ({renda}) com classe baixa")

    # 3. Escolaridade vs Profissão (servidor público geralmente requer concurso)
    escolaridade = e.get('escolaridade', '')
    profissao = e.get('profissao', '')
    if ocupacao == 'servidor_publico' and escolaridade == 'fundamental_ou_sem_instrucao':
        problemas.append(f"Servidor público com escolaridade fundamental")

    # 4. Voto facultativo vs Idade
    voto_fac = e.get('voto_facultativo', False)
    if voto_fac and not (16 <= idade <= 17 or idade >= 70):
        problemas.append(f"Voto facultativo com idade {idade} (deveria ser 16-17 ou 70+)")
    if not voto_fac and (16 <= idade <= 17 or idade >= 70):
        problemas.append(f"Voto obrigatório com idade {idade} (deveria ser facultativo)")

    # 5. Estado civil vs Idade
    estado_civil = e.get('estado_civil', '')
    if idade < 18 and estado_civil in ['casado(a)', 'divorciado(a)', 'viuvo(a)']:
        problemas.append(f"Menor de 18 com estado civil {estado_civil}")

    # 6. Filhos vs Idade/Gênero
    filhos = e.get('filhos', 0)
    if idade < 18 and filhos > 0:
        if e.get('genero') == 'feminino' and filhos > 2:
            problemas.append(f"Menor de 18 com {filhos} filhos")
        elif e.get('genero') == 'masculino' and idade < 16:
            problemas.append(f"Menor de 16 com {filhos} filhos")

    if problemas:
        incoerencias.append({
            'id': e['id'],
            'nome': e['nome'],
            'problemas': problemas
        })

if incoerencias:
    print(f"\nIncoerências encontradas: {len(incoerencias)}")
    for inc in incoerencias[:10]:  # Mostrar só os 10 primeiros
        print(f"\n  {inc['id']} - {inc['nome']}:")
        for p in inc['problemas']:
            print(f"    - {p}")
    if len(incoerencias) > 10:
        print(f"\n  ... e mais {len(incoerencias) - 10} casos")
else:
    print("\n✓ Nenhuma incoerência grave encontrada!")

# ==============================================================================
# VERIFICAR NOVOS CAMPOS NUMÉRICOS
# ==============================================================================
print("\n" + "=" * 70)
print("VERIFICAÇÃO DOS CAMPOS NUMÉRICOS")
print("=" * 70)

# Renda mensal
rendas = [e.get('renda_mensal', 0) for e in eleitores]
print(f"\nrenda_mensal:")
print(f"  Min: R$ {min(rendas):.2f}")
print(f"  Max: R$ {max(rendas):.2f}")
print(f"  Média: R$ {sum(rendas)/len(rendas):.2f}")

# Tempo deslocamento
tempos = [e.get('tempo_deslocamento_minutos', 0) for e in eleitores]
tempos_validos = [t for t in tempos if t > 0]
print(f"\ntempo_deslocamento_minutos:")
print(f"  Zero (n/a): {len(tempos) - len(tempos_validos)}")
print(f"  Min: {min(tempos_validos) if tempos_validos else 0} min")
print(f"  Max: {max(tempos_validos) if tempos_validos else 0} min")
print(f"  Média: {sum(tempos_validos)/len(tempos_validos) if tempos_validos else 0:.1f} min")

# Susceptibilidade numérica
susc_nums = [e.get('susceptibilidade_desinformacao_num', 0) for e in eleitores]
print(f"\nsusceptibilidade_desinformacao_num:")
print(f"  1 (baixa): {susc_nums.count(1)}")
print(f"  2 (média): {susc_nums.count(2)}")
print(f"  3 (alta): {susc_nums.count(3)}")

print("\n" + "=" * 70)
print(f"ÍNDICE FINAL DE CONFORMIDADE: {indice:.1f}%")
print("=" * 70)

if indice >= 85:
    print("✓ Amostra com alta representatividade!")
elif indice >= 75:
    print("⚠ Amostra com boa representatividade (alguns ajustes recomendados)")
else:
    print("✗ Amostra precisa de mais ajustes para conformidade adequada")
