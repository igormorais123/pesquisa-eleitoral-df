"""
Correcao dos Campos com ALERTA (desvio moderado)
COM VERIFICACAO DE COERENCIA ENTRE CAMPOS

1. ocupacao_vinculo - informal baixo, aposentado alto
2. meio_transporte - nao_se_aplica alto
3. escolaridade - medio alto, superior baixo
4. cor_raca - branca baixa
5. tolerancia_nuance - media alta
"""

import json
import random
from collections import Counter

random.seed(2026)


def verificar_coerencia_eleitor(e):
    """Verifica se o perfil do eleitor eh coerente"""
    problemas = []

    idade = e.get('idade', 30)
    escolaridade = e.get('escolaridade', '')
    ocupacao = e.get('ocupacao_vinculo', '')
    renda = e.get('renda_salarios_minimos', '')

    # Aposentado deve ter 60+ anos
    if ocupacao == 'aposentado' and idade < 55:
        problemas.append(f"aposentado com {idade} anos")

    # Estudante deve ter menos de 30 anos (geralmente)
    if ocupacao == 'estudante' and idade > 35:
        problemas.append(f"estudante com {idade} anos")

    # Superior completo deve ter 22+ anos
    if escolaridade == 'superior_completo_ou_pos' and idade < 22:
        problemas.append(f"superior completo com {idade} anos")

    # Renda alta com escolaridade baixa eh raro
    if renda in ['mais_de_10_ate_20', 'mais_de_20'] and escolaridade == 'fundamental_ou_sem_instrucao':
        problemas.append("renda alta com fundamental")

    # Servidor publico sem pelo menos medio
    if ocupacao == 'servidor_publico' and escolaridade == 'fundamental_ou_sem_instrucao':
        problemas.append("servidor publico com fundamental")

    return problemas


def corrigir_ocupacao_vinculo(eleitores):
    """
    Corrige distribuicao de ocupacao/vinculo COM COERENCIA
    Metas PNAD/PDAD 2023:
    - clt: 35%, autonomo: 25%, informal: 15%, servidor_publico: 8%
    - desempregado: 8%, aposentado: 12%, estudante: 5%, empresario: 3%
    """
    n = len(eleitores)

    metas = {
        'clt': int(n * 0.35),
        'autonomo': int(n * 0.25),
        'informal': int(n * 0.15),
        'servidor_publico': int(n * 0.08),
        'desempregado': int(n * 0.08),
        'aposentado': int(n * 0.12),
        'estudante': int(n * 0.05),
        'empresario': int(n * 0.03),
    }

    total = sum(metas.values())
    metas['clt'] += (n - total)

    atual = Counter(e['ocupacao_vinculo'] for e in eleitores)
    print(f"  Ocupacao antes: {dict(atual)}")

    # Converter aposentados em excesso - APENAS os que tem idade < 55
    n_aposentado_atual = atual.get('aposentado', 0)
    n_aposentado_alvo = metas['aposentado']

    if n_aposentado_atual > n_aposentado_alvo:
        # APENAS aposentados jovens (incoerentes)
        candidatos = [i for i, e in enumerate(eleitores)
                     if e.get('ocupacao_vinculo') == 'aposentado' and e.get('idade', 65) < 55]
        random.shuffle(candidatos)

        excesso = n_aposentado_atual - n_aposentado_alvo
        conversoes = min(len(candidatos), excesso)

        for i in candidatos[:conversoes]:
            idade = eleitores[i].get('idade', 30)
            esc = eleitores[i].get('escolaridade', 'medio_completo_ou_sup_incompleto')
            renda = eleitores[i].get('renda_salarios_minimos', 'mais_de_1_ate_2')

            # Escolher ocupacao coerente com idade, escolaridade e renda
            if esc == 'superior_completo_ou_pos':
                if renda in ['mais_de_5_ate_10', 'mais_de_10_ate_20', 'mais_de_20']:
                    eleitores[i]['ocupacao_vinculo'] = random.choice(['servidor_publico', 'clt', 'empresario'])
                else:
                    eleitores[i]['ocupacao_vinculo'] = random.choice(['clt', 'autonomo'])
            elif renda in ['ate_1', 'mais_de_1_ate_2']:
                eleitores[i]['ocupacao_vinculo'] = random.choice(['informal', 'clt', 'autonomo'])
            else:
                eleitores[i]['ocupacao_vinculo'] = random.choice(['clt', 'clt', 'autonomo'])

    # Aumentar informal - APENAS candidatos coerentes (baixa escolaridade/renda)
    n_informal_atual = sum(1 for e in eleitores if e.get('ocupacao_vinculo') == 'informal')
    n_informal_alvo = metas['informal']

    if n_informal_atual < n_informal_alvo:
        candidatos = [i for i, e in enumerate(eleitores)
                     if e.get('ocupacao_vinculo') == 'autonomo'
                     and e.get('escolaridade') != 'superior_completo_ou_pos'
                     and e.get('renda_salarios_minimos') in ['ate_1', 'mais_de_1_ate_2', 'mais_de_2_ate_5']
                     and e.get('idade', 30) >= 18 and e.get('idade', 30) < 65]
        random.shuffle(candidatos)

        falta = n_informal_alvo - n_informal_atual
        conversoes = min(len(candidatos), falta)

        for i in candidatos[:conversoes]:
            eleitores[i]['ocupacao_vinculo'] = 'informal'

    return eleitores


def corrigir_meio_transporte(eleitores):
    """
    Corrige distribuicao de meio de transporte COM COERENCIA
    Metas PDAD 2021:
    - onibus: 30%, carro: 35%, motocicleta: 10%, a_pe: 10%
    - metro: 5%, bicicleta: 3%, nao_se_aplica: 7%
    """
    n = len(eleitores)

    metas = {
        'onibus': int(n * 0.30),
        'carro': int(n * 0.35),
        'motocicleta': int(n * 0.10),
        'a_pe': int(n * 0.10),
        'metro': int(n * 0.05),
        'bicicleta': int(n * 0.03),
        'nao_se_aplica': int(n * 0.07),
    }

    total = sum(metas.values())
    metas['carro'] += (n - total)

    atual = Counter(e['meio_transporte'] for e in eleitores)
    print(f"  Transporte antes: {dict(atual)}")

    # nao_se_aplica eh coerente APENAS para aposentados, desempregados, estudantes
    # Converter os demais para transporte real
    for i, e in enumerate(eleitores):
        if e.get('meio_transporte') == 'nao_se_aplica':
            ocupacao = e.get('ocupacao_vinculo', '')
            if ocupacao not in ['aposentado', 'desempregado', 'estudante']:
                # Precisa de transporte - escolher baseado em renda
                renda = e.get('renda_salarios_minimos', 'mais_de_1_ate_2')
                cluster = e.get('cluster_socioeconomico', 'G3_media_baixa')

                if cluster == 'G1_alta' or renda in ['mais_de_10_ate_20', 'mais_de_20']:
                    eleitores[i]['meio_transporte'] = 'carro'
                elif cluster == 'G2_media_alta' or renda in ['mais_de_5_ate_10']:
                    eleitores[i]['meio_transporte'] = random.choice(['carro', 'carro', 'motocicleta'])
                elif renda in ['mais_de_2_ate_5']:
                    eleitores[i]['meio_transporte'] = random.choice(['carro', 'onibus', 'motocicleta'])
                else:
                    eleitores[i]['meio_transporte'] = random.choice(['onibus', 'onibus', 'onibus', 'a_pe', 'motocicleta'])

    # Verificar se ainda precisa ajustar nao_se_aplica
    n_nao_aplica = sum(1 for e in eleitores if e.get('meio_transporte') == 'nao_se_aplica')
    n_nao_aplica_alvo = metas['nao_se_aplica']

    # Se ainda em excesso, converter alguns aposentados/desempregados
    if n_nao_aplica > n_nao_aplica_alvo:
        candidatos = [i for i, e in enumerate(eleitores)
                     if e.get('meio_transporte') == 'nao_se_aplica'
                     and e.get('ocupacao_vinculo') in ['aposentado', 'desempregado']]
        random.shuffle(candidatos)

        excesso = n_nao_aplica - n_nao_aplica_alvo
        conversoes = min(len(candidatos), excesso)

        for i in candidatos[:conversoes]:
            # Aposentados ainda se locomovem
            renda = eleitores[i].get('renda_salarios_minimos', 'mais_de_1_ate_2')
            if renda in ['mais_de_5_ate_10', 'mais_de_10_ate_20', 'mais_de_20']:
                eleitores[i]['meio_transporte'] = 'carro'
            else:
                eleitores[i]['meio_transporte'] = random.choice(['onibus', 'a_pe'])

    return eleitores


def corrigir_escolaridade_final(eleitores):
    """
    Ajuste fino de escolaridade COM COERENCIA
    Metas: fundamental: 25%, medio: 45%, superior: 30%
    """
    n = len(eleitores)

    n_fundamental_alvo = int(n * 0.25)
    n_medio_alvo = int(n * 0.45)
    n_superior_alvo = n - n_fundamental_alvo - n_medio_alvo

    atual = Counter(e['escolaridade'] for e in eleitores)
    print(f"  Escolaridade antes: {dict(atual)}")

    n_medio_atual = atual.get('medio_completo_ou_sup_incompleto', 0)
    n_superior_atual = atual.get('superior_completo_ou_pos', 0)

    # Se medio em excesso e superior em falta, converter medio -> superior
    # APENAS candidatos coerentes (idade 25+, renda media-alta)
    if n_medio_atual > n_medio_alvo and n_superior_atual < n_superior_alvo:
        candidatos = [i for i, e in enumerate(eleitores)
                     if e.get('escolaridade') == 'medio_completo_ou_sup_incompleto'
                     and e.get('renda_salarios_minimos') in ['mais_de_2_ate_5', 'mais_de_5_ate_10', 'mais_de_10_ate_20', 'mais_de_20']
                     and e.get('idade', 30) >= 25
                     and e.get('ocupacao_vinculo') in ['clt', 'servidor_publico', 'autonomo', 'empresario', 'aposentado']]
        random.shuffle(candidatos)

        falta = n_superior_alvo - n_superior_atual
        conversoes = min(len(candidatos), falta)

        profissoes_superior = [
            'Analista', 'Contador(a)', 'Advogado(a)', 'Engenheiro(a)',
            'Professor(a)', 'Servidor Publico', 'Gerente', 'Consultor(a)'
        ]

        for i in candidatos[:conversoes]:
            eleitores[i]['escolaridade'] = 'superior_completo_ou_pos'
            # Ajustar profissao APENAS se nao for aposentado
            if eleitores[i].get('ocupacao_vinculo') not in ['aposentado', 'desempregado', 'estudante']:
                prof_atual = eleitores[i].get('profissao', '')
                if not any(p in prof_atual for p in ['Analista', 'Contador', 'Advogado', 'Engenheiro', 'Professor', 'Servidor', 'Gerente']):
                    eleitores[i]['profissao'] = random.choice(profissoes_superior)

    return eleitores


def corrigir_cor_raca(eleitores):
    """
    Ajuste fino de cor/raca COM COERENCIA REGIONAL
    Metas PDAD 2024: branca: 40%, parda: 45%, preta: 15%
    """
    n = len(eleitores)

    n_branca_alvo = int(n * 0.40)

    atual = Counter(e['cor_raca'] for e in eleitores)
    print(f"  Cor/raca antes: {dict(atual)}")

    n_branca_atual = atual.get('branca', 0)

    # RAs de alta renda tem mais brancos (PDAD)
    ras_alta_renda = ['Lago Sul', 'Lago Norte', 'Park Way', 'Sudoeste/Octogonal', 'Plano Piloto', 'Jardim Botanico']

    # Se branca em falta, converter pardos de alta renda para branca
    if n_branca_atual < n_branca_alvo:
        # Priorizar RAs de alta renda (mais coerente com PDAD)
        candidatos_prioridade = [i for i, e in enumerate(eleitores)
                                if e.get('cor_raca') == 'parda'
                                and e.get('regiao_administrativa') in ras_alta_renda]

        candidatos_secundarios = [i for i, e in enumerate(eleitores)
                                 if e.get('cor_raca') == 'parda'
                                 and e.get('cluster_socioeconomico') in ['G1_alta', 'G2_media_alta']
                                 and e.get('regiao_administrativa') not in ras_alta_renda]

        candidatos = candidatos_prioridade + candidatos_secundarios
        random.shuffle(candidatos)

        falta = n_branca_alvo - n_branca_atual
        conversoes = min(len(candidatos), falta)

        for i in candidatos[:conversoes]:
            eleitores[i]['cor_raca'] = 'branca'

    return eleitores


def corrigir_tolerancia_nuance(eleitores):
    """
    Ajuste de tolerancia a nuance COM COERENCIA POLITICA
    Metas: baixa: 40%, media: 35%, alta: 25%

    Baixa tolerancia correlaciona com extremos politicos
    Alta tolerancia correlaciona com centro
    """
    n = len(eleitores)

    metas = {
        'baixa': int(n * 0.40),
        'media': int(n * 0.35),
        'alta': int(n * 0.25),
    }

    total = sum(metas.values())
    metas['baixa'] += (n - total)

    atual = Counter(e.get('tolerancia_nuance') for e in eleitores)
    print(f"  Tolerancia nuance antes: {dict(atual)}")

    n_media_atual = atual.get('media', 0)
    n_media_alvo = metas['media']

    # Se media em excesso, converter para baixa ou alta baseado em orientacao politica
    if n_media_atual > n_media_alvo:
        excesso = n_media_atual - n_media_alvo

        # Candidatos para baixa tolerancia - extremos politicos
        candidatos_baixa = [i for i, e in enumerate(eleitores)
                          if e.get('tolerancia_nuance') == 'media'
                          and e.get('orientacao_politica') in ['direita', 'esquerda']]

        # Candidatos para alta tolerancia - centro
        candidatos_alta = [i for i, e in enumerate(eleitores)
                         if e.get('tolerancia_nuance') == 'media'
                         and e.get('orientacao_politica') in ['centro', 'centro_direita', 'centro_esquerda']]

        random.shuffle(candidatos_baixa)
        random.shuffle(candidatos_alta)

        # Converter metade para baixa, metade para alta
        conversoes_baixa = min(len(candidatos_baixa), excesso // 2)
        conversoes_alta = min(len(candidatos_alta), excesso - conversoes_baixa)

        for i in candidatos_baixa[:conversoes_baixa]:
            eleitores[i]['tolerancia_nuance'] = 'baixa'

        for i in candidatos_alta[:conversoes_alta]:
            eleitores[i]['tolerancia_nuance'] = 'alta'

    return eleitores


def validar_coerencia_final(eleitores):
    """Valida coerencia de todos os eleitores"""
    problemas_totais = 0
    for i, e in enumerate(eleitores):
        problemas = verificar_coerencia_eleitor(e)
        if problemas:
            problemas_totais += len(problemas)

    return problemas_totais


def main():
    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    print("Verificando coerencia inicial...")
    problemas_antes = validar_coerencia_final(eleitores)
    print(f"  Problemas de coerencia encontrados: {problemas_antes}")
    print()

    print("Corrigindo campos com ALERTA (mantendo coerencia)...")
    print()

    print("1. Corrigindo OCUPACAO/VINCULO...")
    eleitores = corrigir_ocupacao_vinculo(eleitores)

    print("2. Corrigindo MEIO DE TRANSPORTE...")
    eleitores = corrigir_meio_transporte(eleitores)

    print("3. Ajuste fino ESCOLARIDADE...")
    eleitores = corrigir_escolaridade_final(eleitores)

    print("4. Ajuste fino COR/RACA...")
    eleitores = corrigir_cor_raca(eleitores)

    print("5. Corrigindo TOLERANCIA A NUANCE...")
    eleitores = corrigir_tolerancia_nuance(eleitores)

    print()
    print("Verificando coerencia final...")
    problemas_depois = validar_coerencia_final(eleitores)
    print(f"  Problemas de coerencia: {problemas_antes} -> {problemas_depois}")

    if problemas_depois > problemas_antes:
        print("  [ALERTA] Coerencia piorou! Revertendo alteracoes...")
        return

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print()
    print("Correcoes aplicadas com sucesso!")
    print("Execute 'python auditar_todos_campos.py' para validar.")


if __name__ == "__main__":
    main()
