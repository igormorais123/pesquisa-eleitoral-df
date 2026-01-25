#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GERADOR DE ELEITORES CORRETIVOS V2
Foco nas categorias mais críticas ainda deficitárias.
"""

import json
import random
from typing import Dict, List

# Importar do script anterior
from gerar_eleitores_corretivos import (
    RAS_DF, NOMES_MASCULINOS, NOMES_FEMININOS, SOBRENOMES,
    PROFISSOES, VALORES_POR_ORIENTACAO, PREOCUPACOES_POR_ORIENTACAO,
    MEDOS_POR_CLUSTER, FONTES_INFORMACAO_POR_PERFIL, VIESES_COGNITIVOS,
    gerar_nome_completo, gerar_historia_resumida, gerar_instrucao_comportamental
)


def gerar_eleitor_focado(id_eleitor: str, foco: Dict) -> Dict:
    """
    Gera um eleitor com foco específico em determinadas categorias.
    O 'foco' define as categorias que DEVEM ser atendidas.
    """
    perfil = {}

    # Aplicar foco obrigatório
    for campo, valor in foco.items():
        perfil[campo] = valor

    # Se o foco é solteiro, ajustar para perfil coerente de solteiro
    if perfil.get('estado_civil') == 'solteiro(a)':
        # Solteiros tendem a ser mais jovens
        if 'idade' not in perfil:
            perfil['idade'] = random.choices(
                [random.randint(16, 24), random.randint(25, 34), random.randint(35, 44), random.randint(45, 60)],
                weights=[40, 35, 15, 10]
            )[0]
        # Mais provável sem filhos
        if 'filhos' not in perfil:
            perfil['filhos'] = random.choices([0, 1, 2], weights=[70, 20, 10])[0]

    # Se foco é renda baixa
    if perfil.get('renda_salarios_minimos') == 'ate_1':
        perfil['cluster_socioeconomico'] = 'G4_baixa'
        perfil['escolaridade'] = random.choice(['fundamental_ou_sem_instrucao', 'medio_completo_ou_sup_incompleto'])
        perfil['ocupacao_vinculo'] = random.choice(['informal', 'desempregado', 'autonomo', 'clt'])

    # Se foco é direita
    if perfil.get('orientacao_politica') == 'direita':
        perfil['posicao_bolsonaro'] = random.choices(
            ['apoiador_forte', 'apoiador_moderado', 'neutro'],
            weights=[55, 35, 10]
        )[0]
        perfil['tolerancia_nuance'] = random.choices(['baixa', 'media', 'alta'], weights=[50, 35, 15])[0]

    # Se foco é interesse político baixo
    if perfil.get('interesse_politico') == 'baixo':
        perfil['tolerancia_nuance'] = random.choices(['baixa', 'media', 'alta'], weights=[45, 40, 15])[0]

    # Se foco é tolerância baixa
    if perfil.get('tolerancia_nuance') == 'baixa':
        if perfil.get('orientacao_politica') not in ['direita', 'esquerda']:
            perfil['orientacao_politica'] = random.choices(
                ['direita', 'esquerda', 'centro-direita', 'centro-esquerda'],
                weights=[40, 25, 20, 15]
            )[0]

    # Se foco é susceptibilidade baixa
    if perfil.get('susceptibilidade_nivel') == 'baixa':
        perfil['susceptibilidade_desinformacao'] = random.randint(1, 3)
        perfil['escolaridade'] = random.choices(
            ['superior_completo_ou_pos', 'medio_completo_ou_sup_incompleto'],
            weights=[60, 40]
        )[0]
        del perfil['susceptibilidade_nivel']

    # Completar campos faltantes
    if 'genero' not in perfil:
        perfil['genero'] = random.choices(['feminino', 'masculino'], weights=[52.2, 47.8])[0]

    if 'cor_raca' not in perfil:
        perfil['cor_raca'] = random.choices(
            ['parda', 'branca', 'preta', 'amarela', 'indigena'],
            weights=[45.0, 40.6, 13.5, 0.5, 0.4]
        )[0]

    if 'idade' not in perfil:
        faixa = random.choices(
            ['16-24', '25-34', '35-44', '45-54', '55-64', '65+'],
            weights=[14.5, 17.8, 18.2, 15.5, 11.8, 12.2]
        )[0]
        if faixa == '16-24': perfil['idade'] = random.randint(16, 24)
        elif faixa == '25-34': perfil['idade'] = random.randint(25, 34)
        elif faixa == '35-44': perfil['idade'] = random.randint(35, 44)
        elif faixa == '45-54': perfil['idade'] = random.randint(45, 54)
        elif faixa == '55-64': perfil['idade'] = random.randint(55, 64)
        else: perfil['idade'] = random.randint(65, 85)

    if 'cluster_socioeconomico' not in perfil:
        perfil['cluster_socioeconomico'] = random.choices(
            ['G1_alta', 'G2_media_alta', 'G3_media_baixa', 'G4_baixa'],
            weights=[18.1, 20.8, 32.9, 28.2]
        )[0]

    cluster = perfil['cluster_socioeconomico']

    if 'regiao_administrativa' not in perfil:
        ras_compativeis = [ra for ra, dados in RAS_DF.items() if dados['cluster'] == cluster]
        if not ras_compativeis:
            ras_compativeis = list(RAS_DF.keys())
        pesos = [RAS_DF[ra]['pop'] for ra in ras_compativeis]
        perfil['regiao_administrativa'] = random.choices(ras_compativeis, weights=pesos)[0]

    ra = perfil['regiao_administrativa']
    refs = RAS_DF.get(ra, {}).get('refs', ['no centro'])
    perfil['local_referencia'] = random.choice(refs)

    if 'escolaridade' not in perfil:
        if cluster == 'G1_alta':
            perfil['escolaridade'] = 'superior_completo_ou_pos'
        elif cluster == 'G2_media_alta':
            perfil['escolaridade'] = random.choice(['superior_completo_ou_pos', 'medio_completo_ou_sup_incompleto'])
        elif cluster == 'G3_media_baixa':
            perfil['escolaridade'] = random.choice(['medio_completo_ou_sup_incompleto', 'fundamental_ou_sem_instrucao'])
        else:
            perfil['escolaridade'] = random.choice(['fundamental_ou_sem_instrucao', 'medio_completo_ou_sup_incompleto'])

    if 'ocupacao_vinculo' not in perfil:
        if perfil['idade'] >= 65:
            perfil['ocupacao_vinculo'] = 'aposentado'
        elif perfil['idade'] <= 22:
            perfil['ocupacao_vinculo'] = random.choice(['estudante', 'clt', 'informal'])
        else:
            ocupacoes_cluster = PROFISSOES.get(cluster, PROFISSOES['G3_media_baixa'])
            perfil['ocupacao_vinculo'] = random.choice(list(ocupacoes_cluster.keys()))

    ocupacao = perfil['ocupacao_vinculo']
    profissoes_disponiveis = PROFISSOES.get(cluster, {}).get(ocupacao, ['Trabalhador(a)'])
    perfil['profissao'] = random.choice(profissoes_disponiveis)

    if 'renda_salarios_minimos' not in perfil:
        if cluster == 'G1_alta':
            perfil['renda_salarios_minimos'] = random.choice(['mais_de_10_ate_20', 'mais_de_20'])
        elif cluster == 'G2_media_alta':
            perfil['renda_salarios_minimos'] = random.choice(['mais_de_5_ate_10', 'mais_de_2_ate_5'])
        elif cluster == 'G3_media_baixa':
            perfil['renda_salarios_minimos'] = random.choice(['mais_de_2_ate_5', 'mais_de_1_ate_2'])
        else:
            perfil['renda_salarios_minimos'] = random.choice(['ate_1', 'mais_de_1_ate_2'])

    if 'religiao' not in perfil:
        perfil['religiao'] = random.choices(
            ['catolica', 'evangelica', 'sem_religiao', 'espirita', 'umbanda_candomble', 'outras_religioes'],
            weights=[49.7, 29.2, 11.3, 3.3, 0.9, 5.6]
        )[0]

    if 'estado_civil' not in perfil:
        if perfil['idade'] < 25:
            perfil['estado_civil'] = random.choices(
                ['solteiro(a)', 'casado(a)', 'uniao_estavel'],
                weights=[70, 15, 15]
            )[0]
        elif perfil['idade'] < 40:
            perfil['estado_civil'] = random.choices(
                ['solteiro(a)', 'casado(a)', 'uniao_estavel', 'divorciado(a)'],
                weights=[35, 35, 25, 5]
            )[0]
        else:
            perfil['estado_civil'] = random.choices(
                ['solteiro(a)', 'casado(a)', 'uniao_estavel', 'divorciado(a)', 'viuvo(a)'],
                weights=[15, 40, 25, 15, 5]
            )[0]

    if 'filhos' not in perfil:
        if perfil['idade'] < 25:
            perfil['filhos'] = random.choices([0, 1], weights=[75, 25])[0]
        elif perfil['estado_civil'] == 'solteiro(a)':
            perfil['filhos'] = random.choices([0, 1, 2], weights=[60, 30, 10])[0]
        else:
            perfil['filhos'] = random.choices([0, 1, 2, 3], weights=[20, 30, 35, 15])[0]

    if 'orientacao_politica' not in perfil:
        if perfil['religiao'] == 'evangelica':
            perfil['orientacao_politica'] = random.choices(
                ['direita', 'centro-direita', 'centro', 'centro-esquerda', 'esquerda'],
                weights=[40, 30, 15, 10, 5]
            )[0]
        else:
            perfil['orientacao_politica'] = random.choices(
                ['esquerda', 'centro-esquerda', 'centro', 'centro-direita', 'direita'],
                weights=[15.0, 7.0, 11.0, 11.0, 29.0]
            )[0]

    orient = perfil['orientacao_politica']

    if 'posicao_bolsonaro' not in perfil:
        if orient == 'direita':
            perfil['posicao_bolsonaro'] = random.choices(
                ['apoiador_forte', 'apoiador_moderado', 'neutro', 'critico_moderado', 'critico_forte'],
                weights=[50, 30, 10, 7, 3]
            )[0]
        elif orient == 'esquerda':
            perfil['posicao_bolsonaro'] = random.choices(
                ['apoiador_forte', 'apoiador_moderado', 'neutro', 'critico_moderado', 'critico_forte'],
                weights=[1, 2, 5, 20, 72]
            )[0]
        else:
            perfil['posicao_bolsonaro'] = random.choices(
                ['apoiador_forte', 'apoiador_moderado', 'neutro', 'critico_moderado', 'critico_forte'],
                weights=[15, 11, 20, 20, 34]
            )[0]

    if 'interesse_politico' not in perfil:
        if perfil['escolaridade'] == 'superior_completo_ou_pos':
            perfil['interesse_politico'] = random.choices(['alto', 'medio', 'baixo'], weights=[30, 40, 30])[0]
        else:
            perfil['interesse_politico'] = random.choices(['alto', 'medio', 'baixo'], weights=[15, 35, 50])[0]

    if 'tolerancia_nuance' not in perfil:
        if perfil['interesse_politico'] == 'alto' and perfil['escolaridade'] == 'superior_completo_ou_pos':
            perfil['tolerancia_nuance'] = random.choices(['alta', 'media', 'baixa'], weights=[35, 45, 20])[0]
        else:
            perfil['tolerancia_nuance'] = random.choices(['alta', 'media', 'baixa'], weights=[25, 40, 35])[0]

    if 'estilo_decisao' not in perfil:
        perfil['estilo_decisao'] = random.choices(
            ['identitario', 'pragmatico', 'moral', 'economico', 'emocional'],
            weights=[25.0, 20.0, 15.0, 25.0, 15.0]
        )[0]

    # Valores, preocupações, medos
    valores_base = VALORES_POR_ORIENTACAO.get(orient, VALORES_POR_ORIENTACAO['centro'])
    perfil['valores'] = random.sample(valores_base, min(3, len(valores_base)))

    preocupacoes_base = PREOCUPACOES_POR_ORIENTACAO.get(orient, PREOCUPACOES_POR_ORIENTACAO['centro'])
    perfil['preocupacoes'] = random.sample(preocupacoes_base, min(3, len(preocupacoes_base)))

    medos_base = MEDOS_POR_CLUSTER.get(cluster, MEDOS_POR_CLUSTER['G3_media_baixa'])
    perfil['medos'] = random.sample(medos_base, min(3, len(medos_base)))

    # Vieses
    num_vieses = random.randint(2, 4)
    perfil['vieses_cognitivos'] = random.sample(VIESES_COGNITIVOS, num_vieses)
    if 'confirmacao' not in perfil['vieses_cognitivos']:
        perfil['vieses_cognitivos'][0] = 'confirmacao'

    # Fontes de informação
    idade = perfil['idade']
    if idade < 30:
        fontes_base = FONTES_INFORMACAO_POR_PERFIL['jovem_conectado']
    elif orient in ['direita', 'centro-direita']:
        fontes_base = FONTES_INFORMACAO_POR_PERFIL['conservador']
    elif orient in ['esquerda', 'centro-esquerda']:
        fontes_base = FONTES_INFORMACAO_POR_PERFIL['progressista']
    elif cluster in ['G3_media_baixa', 'G4_baixa']:
        fontes_base = FONTES_INFORMACAO_POR_PERFIL['popular']
    else:
        fontes_base = FONTES_INFORMACAO_POR_PERFIL['adulto_tradicional']
    perfil['fontes_informacao'] = random.sample(fontes_base, min(random.randint(2, 4), len(fontes_base)))

    # Susceptibilidade à desinformação
    if 'susceptibilidade_desinformacao' not in perfil:
        if perfil['escolaridade'] == 'superior_completo_ou_pos':
            nivel = random.choices(['baixa', 'media', 'alta'], weights=[35, 45, 20])[0]
        else:
            nivel = random.choices(['baixa', 'media', 'alta'], weights=[20, 45, 35])[0]

        if nivel == 'baixa':
            perfil['susceptibilidade_desinformacao'] = random.randint(1, 3)
        elif nivel == 'media':
            perfil['susceptibilidade_desinformacao'] = random.randint(4, 6)
        else:
            perfil['susceptibilidade_desinformacao'] = random.randint(7, 10)

    # Meio de transporte
    if cluster == 'G1_alta':
        perfil['meio_transporte'] = random.choices(['carro', 'nao_se_aplica'], weights=[85, 15])[0]
    elif cluster == 'G2_media_alta':
        perfil['meio_transporte'] = random.choices(['carro', 'metro', 'onibus', 'moto'], weights=[50, 25, 15, 10])[0]
    elif cluster == 'G3_media_baixa':
        perfil['meio_transporte'] = random.choices(['onibus', 'carro', 'moto', 'metro', 'a_pe'], weights=[35, 25, 20, 10, 10])[0]
    else:
        perfil['meio_transporte'] = random.choices(['onibus', 'a_pe', 'moto', 'bicicleta'], weights=[40, 30, 20, 10])[0]

    if ocupacao in ['aposentado', 'desempregado']:
        perfil['meio_transporte'] = random.choices(['nao_se_aplica', 'onibus', 'a_pe'], weights=[40, 35, 25])[0]

    # Tempo deslocamento
    if perfil['meio_transporte'] == 'nao_se_aplica' or ocupacao in ['aposentado', 'desempregado']:
        perfil['tempo_deslocamento_trabalho'] = 'nao_se_aplica'
    else:
        perfil['tempo_deslocamento_trabalho'] = random.choice(['ate_15', '15_30', '30_45', '45_60', 'mais_60'])

    # Voto facultativo
    perfil['voto_facultativo'] = perfil['idade'] < 18 or perfil['idade'] >= 70

    # Conflito identitário
    perfil['conflito_identitario'] = random.choice([True, False, False, False])

    # Nome, ID
    perfil['nome'] = gerar_nome_completo(perfil['genero'])
    perfil['id'] = id_eleitor

    # História e instrução
    perfil['historia_resumida'] = gerar_historia_resumida(perfil)
    perfil['instrucao_comportamental'] = gerar_instrucao_comportamental(perfil)

    # Ordenar campos
    campos_ordenados = [
        'id', 'nome', 'idade', 'genero', 'cor_raca', 'regiao_administrativa',
        'local_referencia', 'cluster_socioeconomico', 'escolaridade', 'profissao',
        'ocupacao_vinculo', 'renda_salarios_minimos', 'religiao', 'estado_civil',
        'filhos', 'orientacao_politica', 'posicao_bolsonaro', 'interesse_politico',
        'tolerancia_nuance', 'estilo_decisao', 'valores', 'preocupacoes',
        'vieses_cognitivos', 'medos', 'fontes_informacao', 'susceptibilidade_desinformacao',
        'meio_transporte', 'tempo_deslocamento_trabalho', 'voto_facultativo',
        'conflito_identitario', 'historia_resumida', 'instrucao_comportamental'
    ]

    return {campo: perfil.get(campo) for campo in campos_ordenados if campo in perfil}


def main():
    # Carregar eleitores
    caminho = 'C:/Agentes/agentes/banco-eleitores-df.json'
    with open(caminho, 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    total_atual = len(eleitores)
    print(f'Eleitores atuais: {total_atual}')

    # Definir focos para correção
    # Baseado nos desvios:
    # - Solteiros: precisa +90 para chegar em 40%
    # - Renda ate_1: precisa +60 para melhorar
    # - Direita: precisa +30 para chegar em 29%
    # - Interesse baixo: precisa +40
    # - Tolerancia baixa: precisa +30
    # - Susceptibilidade baixa: precisa +55

    focos_correcao = []

    # Solteiros (prioridade máxima - maior deficit)
    for _ in range(90):
        focos_correcao.append({'estado_civil': 'solteiro(a)'})

    # Renda ate_1
    for _ in range(60):
        focos_correcao.append({'renda_salarios_minimos': 'ate_1'})

    # Susceptibilidade baixa
    for _ in range(55):
        focos_correcao.append({'susceptibilidade_nivel': 'baixa'})

    # Interesse baixo
    for _ in range(40):
        focos_correcao.append({'interesse_politico': 'baixo'})

    # Tolerancia baixa
    for _ in range(30):
        focos_correcao.append({'tolerancia_nuance': 'baixa'})

    # Direita
    for _ in range(30):
        focos_correcao.append({'orientacao_politica': 'direita'})

    # Limitar total
    total_novos = min(len(focos_correcao), 150)
    focos_correcao = focos_correcao[:total_novos]

    print(f'Eleitores a gerar: {total_novos}')

    # Gerar eleitores
    novos_eleitores = []
    proximo_id = total_atual + 1

    for i, foco in enumerate(focos_correcao):
        id_eleitor = f'df-{proximo_id:04d}'
        eleitor = gerar_eleitor_focado(id_eleitor, foco)
        novos_eleitores.append(eleitor)
        proximo_id += 1

        if (i + 1) % 50 == 0:
            print(f'  Gerados: {i + 1}/{total_novos}')

    print(f'  Gerados: {len(novos_eleitores)} eleitores')

    # Combinar e salvar
    todos = eleitores + novos_eleitores
    total_final = len(todos)

    with open(caminho, 'w', encoding='utf-8') as f:
        json.dump(todos, f, ensure_ascii=False, indent=2)

    print(f'\nTotal final: {total_final}')
    print(f'Arquivo salvo: {caminho}')

    return total_final


if __name__ == '__main__':
    main()
