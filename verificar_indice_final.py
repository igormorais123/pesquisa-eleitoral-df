#!/usr/bin/env python3
"""Verificar índice de conformidade final"""
import json
from collections import Counter

with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores = json.load(f)

n = len(eleitores)
print(f'Total: {n} eleitores\n')

# Definir todas as referências
referencias = {
    'genero': {'feminino': 52.2, 'masculino': 47.8},
    'cor_raca': {'parda': 45.0, 'branca': 40.6, 'preta': 13.5, 'amarela': 0.5, 'indigena': 0.4},
    'cluster_socioeconomico': {'G1_alta': 18.1, 'G2_media_alta': 20.8, 'G3_media_baixa': 32.9, 'G4_baixa': 28.2},
    'escolaridade': {'superior_completo_ou_pos': 37.0, 'medio_completo_ou_sup_incompleto': 43.8, 'fundamental_ou_sem_instrucao': 19.2},
    'renda_salarios_minimos': {'ate_1': 28.5, 'mais_de_1_ate_2': 25.8, 'mais_de_2_ate_5': 24.2, 'mais_de_5_ate_10': 12.5, 'mais_de_10_ate_20': 6.0, 'mais_de_20': 3.0},
    'religiao': {'catolica': 49.7, 'evangelica': 29.2, 'sem_religiao': 11.3, 'espirita': 3.3, 'umbanda_candomble': 0.9, 'outras_religioes': 5.6},
    'orientacao_politica': {'esquerda': 15.0, 'centro-esquerda': 7.0, 'centro': 11.0, 'centro-direita': 11.0, 'direita': 29.0},
    'interesse_politico': {'baixo': 45.0, 'medio': 35.0, 'alto': 20.0},
    'posicao_bolsonaro': {'apoiador_forte': 15.0, 'apoiador_moderado': 11.0, 'neutro': 20.0, 'critico_moderado': 20.0, 'critico_forte': 34.0},
    'estilo_decisao': {'identitario': 25.0, 'pragmatico': 20.0, 'moral': 15.0, 'economico': 25.0, 'emocional': 15.0},
    'tolerancia_nuance': {'baixa': 35.0, 'media': 40.0, 'alta': 25.0},
    'meio_transporte': {'carro': 32.3, 'onibus': 21.4, 'a_pe': 17.8, 'moto': 16.4, 'bicicleta': 3.5, 'metro': 1.6, 'nao_se_aplica': 7.0},
    'estado_civil': {'solteiro(a)': 40.0, 'casado(a)': 28.5, 'uniao_estavel': 20.0, 'divorciado(a)': 6.5, 'viuvo(a)': 5.0},
    'susceptibilidade_desinformacao': {'baixa_1_3': 25.0, 'media_4_6': 45.0, 'alta_7_10': 30.0},
}

# Calcular estatísticas para cada variável
resultados = []
for var, refs in referencias.items():
    dist = Counter(e.get(var) for e in eleitores)

    desvios = []
    for cat, ref in refs.items():
        atual = dist.get(cat, 0)
        pct = 100 * atual / n
        desvio = abs(pct - ref)
        desvios.append(desvio)

    desvio_medio = sum(desvios) / len(desvios)

    # Classificar
    if desvio_medio <= 3:
        status = 'OTIMO'
        pontos = 100
    elif desvio_medio <= 7:
        status = 'BOM'
        pontos = 75
    elif desvio_medio <= 12:
        status = 'ATENCAO'
        pontos = 40
    else:
        status = 'CRITICO'
        pontos = 10

    resultados.append({
        'variavel': var,
        'desvio_medio': desvio_medio,
        'status': status,
        'pontos': pontos
    })

# Exibir resultados
print('=' * 60)
print('ANÁLISE POR VARIÁVEL')
print('=' * 60)

otimos = bons = atencao = criticos = 0
for r in sorted(resultados, key=lambda x: x['desvio_medio']):
    print(f"{r['variavel']:35} | Desvio: {r['desvio_medio']:5.1f}% | {r['status']}")
    if r['status'] == 'OTIMO':
        otimos += 1
    elif r['status'] == 'BOM':
        bons += 1
    elif r['status'] == 'ATENCAO':
        atencao += 1
    else:
        criticos += 1

# Calcular índice de conformidade
total_pontos = sum(r['pontos'] for r in resultados)
indice = total_pontos / len(resultados)

print('\n' + '=' * 60)
print('RESUMO')
print('=' * 60)
print(f'Ótimas:   {otimos:2} (desvio ≤ 3%)')
print(f'Boas:     {bons:2} (desvio 3-7%)')
print(f'Atenção:  {atencao:2} (desvio 7-12%)')
print(f'Críticas: {criticos:2} (desvio > 12%)')
print(f'\nÍNDICE DE CONFORMIDADE: {indice:.0f}%')
print('=' * 60)

# Detalhes das variáveis problemáticas
if atencao + criticos > 0:
    print('\nDETALHES DAS VARIÁVEIS PROBLEMÁTICAS:')
    for r in resultados:
        if r['status'] in ['ATENCAO', 'CRITICO']:
            var = r['variavel']
            dist = Counter(e.get(var) for e in eleitores)
            refs = referencias[var]
            print(f"\n{var.upper()} (desvio médio: {r['desvio_medio']:.1f}%):")
            for cat, ref in refs.items():
                atual = dist.get(cat, 0)
                pct = 100 * atual / n
                desvio = abs(pct - ref)
                print(f"  {cat}: {atual} ({pct:.1f}%) ref={ref}% desvio={desvio:.1f}%")
