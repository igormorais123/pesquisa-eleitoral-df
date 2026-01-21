"""
Correção Completa dos Campos Críticos
=====================================
1. faixa_etaria - Redistribuir para pirâmide etária correta
2. filhos_cat - Detalhar quantidade de filhos
3. valores - Aumentar família, fé, honestidade
4. preocupacoes - Alinhar com Datafolha 2024
5. fontes_informacao - Aumentar TV, sites de notícias
6. vieses_cognitivos - Diversificar vieses
7. estilo_decisao - Padronizar categorias

Fontes:
- PDAD-A 2024, IBGE, Datafolha, Reuters Institute, Quaest/Globo
"""

import json
import random
from collections import Counter

random.seed(2034)


def faixa_etaria_from_idade(idade):
    if idade < 18: return "16-17"
    elif idade < 25: return "18-24"
    elif idade < 35: return "25-34"
    elif idade < 45: return "35-44"
    elif idade < 55: return "45-54"
    elif idade < 65: return "55-64"
    else: return "65+"


# ============================================================================
# 1. CORRIGIR FAIXA ETÁRIA
# ============================================================================
def corrigir_faixa_etaria(eleitores):
    """
    Redistribui idades para atingir pirâmide etária IBGE/PDAD
    Metas: 16-17: 3%, 18-24: 12%, 25-34: 22%, 35-44: 20%,
           45-54: 18%, 55-64: 14%, 65+: 11%
    """
    print("1. Corrigindo FAIXA ETÁRIA...")
    n = len(eleitores)

    metas = {
        "16-17": int(n * 0.03),
        "18-24": int(n * 0.12),
        "25-34": int(n * 0.22),
        "35-44": int(n * 0.20),
        "45-54": int(n * 0.18),
        "55-64": int(n * 0.14),
        "65+": int(n * 0.11),
    }
    total = sum(metas.values())
    metas["35-44"] += (n - total)

    faixas_idade = {
        "16-17": (16, 17),
        "18-24": (18, 24),
        "25-34": (25, 34),
        "35-44": (35, 44),
        "45-54": (45, 54),
        "55-64": (55, 64),
        "65+": (65, 80),
    }

    # Separar aposentados e estudantes (têm restrições de idade)
    idx_aposentados = [i for i, e in enumerate(eleitores) if e.get('ocupacao_vinculo') == 'aposentado']
    idx_estudantes = [i for i, e in enumerate(eleitores) if e.get('ocupacao_vinculo') == 'estudante']
    idx_outros = [i for i, e in enumerate(eleitores) if e.get('ocupacao_vinculo') not in ['aposentado', 'estudante']]

    # Aposentados vão para 65+
    for i in idx_aposentados:
        eleitores[i]['idade'] = random.randint(62, 78)
        eleitores[i]['faixa_etaria'] = '65+'
        eleitores[i]['voto_facultativo'] = eleitores[i]['idade'] >= 70

    # Estudantes vão para 16-24
    for i in idx_estudantes:
        if random.random() < 0.25:  # 25% são 16-17
            eleitores[i]['idade'] = random.randint(16, 17)
            eleitores[i]['voto_facultativo'] = True
        else:
            eleitores[i]['idade'] = random.randint(18, 26)
            eleitores[i]['voto_facultativo'] = False
        eleitores[i]['faixa_etaria'] = faixa_etaria_from_idade(eleitores[i]['idade'])

    # Ajustar metas considerando aposentados e estudantes
    n_aposentados = len(idx_aposentados)
    n_estudantes = len(idx_estudantes)

    # Metas para os demais
    metas_outros = metas.copy()
    metas_outros['65+'] = max(0, metas['65+'] - n_aposentados)
    metas_outros['16-17'] = max(0, metas['16-17'] - int(n_estudantes * 0.25))
    metas_outros['18-24'] = max(0, metas['18-24'] - int(n_estudantes * 0.75))

    # Criar lista de faixas para os demais
    faixas_lista = []
    for faixa in ['16-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']:
        qtd = metas_outros.get(faixa, 0)
        # Não colocar não-aposentados em 65+ (máximo 10)
        if faixa == '65+':
            qtd = min(qtd, 10)
        faixas_lista.extend([faixa] * qtd)

    # Completar com faixas médias se necessário
    while len(faixas_lista) < len(idx_outros):
        faixas_lista.append(random.choice(['35-44', '45-54', '55-64']))

    random.shuffle(faixas_lista)
    random.shuffle(idx_outros)

    for i, idx in enumerate(idx_outros):
        if i < len(faixas_lista):
            faixa = faixas_lista[i]

            # Coerência com escolaridade
            if eleitores[idx].get('escolaridade') == 'superior_completo_ou_pos':
                if faixa in ['16-17', '18-24']:
                    faixa = '25-34'

            idade_min, idade_max = faixas_idade[faixa]
            eleitores[idx]['idade'] = random.randint(idade_min, idade_max)
            eleitores[idx]['faixa_etaria'] = faixa
            eleitores[idx]['voto_facultativo'] = eleitores[idx]['idade'] < 18 or eleitores[idx]['idade'] >= 70

    # Verificar resultado
    dist = Counter(e['faixa_etaria'] for e in eleitores)
    print(f"   Resultado: {dict(dist)}")
    return eleitores


# ============================================================================
# 2. CORRIGIR FILHOS_CAT
# ============================================================================
def corrigir_filhos_cat(eleitores):
    """
    Detalha categoria de filhos
    Metas IBGE: sem_filhos: 35%, 1_filho: 25%, 2_filhos: 25%, 3_ou_mais: 15%
    """
    print("2. Corrigindo FILHOS_CAT...")
    n = len(eleitores)

    # Distribuição alvo
    metas = {
        'sem_filhos': int(n * 0.35),
        '1_filho': int(n * 0.25),
        '2_filhos': int(n * 0.25),
        '3_ou_mais': int(n * 0.15),
    }
    total = sum(metas.values())
    metas['sem_filhos'] += (n - total)

    # Criar lista de categorias
    categorias = []
    for cat, qtd in metas.items():
        categorias.extend([cat] * qtd)

    random.shuffle(categorias)

    # Atribuir considerando coerência com idade e estado civil
    for i, e in enumerate(eleitores):
        idade = e.get('idade', 30)
        estado_civil = e.get('estado_civil', 'solteiro(a)')

        if i < len(categorias):
            cat = categorias[i]

            # Coerência: jovens (< 25) geralmente sem filhos ou 1 filho
            if idade < 25 and cat in ['3_ou_mais']:
                cat = random.choice(['sem_filhos', '1_filho'])

            # Casados/união estável têm mais chance de ter filhos
            if estado_civil in ['casado(a)', 'uniao_estavel'] and cat == 'sem_filhos':
                if random.random() < 0.5:  # 50% de chance de ter filhos
                    cat = random.choice(['1_filho', '2_filhos'])

            # Solteiros jovens geralmente sem filhos
            if estado_civil == 'solteiro(a)' and idade < 30 and cat in ['2_filhos', '3_ou_mais']:
                if random.random() < 0.7:
                    cat = random.choice(['sem_filhos', '1_filho'])

            eleitores[i]['filhos_cat'] = cat

            # Atualizar campo 'filhos' numérico
            if cat == 'sem_filhos':
                eleitores[i]['filhos'] = 0
            elif cat == '1_filho':
                eleitores[i]['filhos'] = 1
            elif cat == '2_filhos':
                eleitores[i]['filhos'] = 2
            else:
                eleitores[i]['filhos'] = random.randint(3, 5)

    dist = Counter(e['filhos_cat'] for e in eleitores)
    print(f"   Resultado: {dict(dist)}")
    return eleitores


# ============================================================================
# 3. CORRIGIR VALORES
# ============================================================================
def corrigir_valores(eleitores):
    """
    Ajusta valores para refletir pesquisa Quaest/Globo 2025
    Metas: Família 90%, Honestidade 75%, Trabalho 70%, Saúde 65%, Fé 60%
    """
    print("3. Corrigindo VALORES...")

    # Valores disponíveis com probabilidade baseada em pesquisas
    valores_base = {
        'Família': 0.90,
        'Honestidade': 0.75,
        'Trabalho': 0.70,
        'Saúde': 0.65,
        'Fé e religião': 0.55,
        'Educação': 0.55,
        'Respeito': 0.50,
        'Segurança': 0.45,
        'Justiça': 0.40,
        'Liberdade': 0.35,
        'Solidariedade': 0.30,
        'Igualdade': 0.25,
        'Democracia': 0.20,
        'Meio ambiente': 0.20,
        'Ordem': 0.18,
        'Meritocracia': 0.15,
        'Empreendedorismo': 0.12,
        'Estabilidade': 0.12,
        'Pragmatismo': 0.10,
        'Direitos humanos': 0.10,
    }

    for e in eleitores:
        valores_eleitor = []
        religiao = e.get('religiao', 'catolica')
        orientacao = e.get('orientacao_politica', 'centro')
        escolaridade = e.get('escolaridade', 'medio')

        for valor, prob in valores_base.items():
            # Ajustar probabilidade baseado no perfil
            prob_ajustada = prob

            # Religiosos valorizam mais fé
            if valor == 'Fé e religião':
                if religiao in ['evangelica', 'catolica']:
                    prob_ajustada = min(0.95, prob + 0.20)
                elif religiao == 'sem_religiao':
                    prob_ajustada = max(0.05, prob - 0.40)

            # Direita valoriza ordem, meritocracia
            if orientacao in ['direita', 'centro_direita']:
                if valor in ['Ordem', 'Meritocracia', 'Segurança', 'Família']:
                    prob_ajustada = min(0.95, prob + 0.15)

            # Esquerda valoriza igualdade, direitos
            if orientacao in ['esquerda', 'centro_esquerda']:
                if valor in ['Igualdade', 'Direitos humanos', 'Solidariedade', 'Democracia']:
                    prob_ajustada = min(0.95, prob + 0.15)

            # Aplicar probabilidade
            if random.random() < prob_ajustada:
                valores_eleitor.append(valor)

        # Garantir pelo menos 2 valores
        while len(valores_eleitor) < 2:
            valor_extra = random.choice(list(valores_base.keys()))
            if valor_extra not in valores_eleitor:
                valores_eleitor.append(valor_extra)

        # Máximo 5 valores
        if len(valores_eleitor) > 5:
            valores_eleitor = random.sample(valores_eleitor, 5)

        e['valores'] = valores_eleitor

    # Verificar resultado
    contador = Counter()
    for e in eleitores:
        for v in e.get('valores', []):
            contador[v] += 1

    print(f"   Top 5: {contador.most_common(5)}")
    return eleitores


# ============================================================================
# 4. CORRIGIR PREOCUPAÇÕES
# ============================================================================
def corrigir_preocupacoes(eleitores):
    """
    Ajusta preocupações para refletir Datafolha Dez/2024
    Metas: Saúde 20%, Segurança 16%, Economia 11%, Educação 8%, Desemprego 8%
    """
    print("4. Corrigindo PREOCUPAÇÕES...")

    # Preocupações com probabilidades baseadas em Datafolha
    preocupacoes_base = {
        'Saúde': 0.55,
        'Segurança pública': 0.50,
        'Violência e criminalidade': 0.45,
        'Custo de vida': 0.40,
        'Economia': 0.35,
        'Educação': 0.35,
        'Desemprego': 0.30,
        'Corrupção': 0.28,
        'Fome e miséria': 0.20,
        'Desigualdade social': 0.18,
        'Moradia': 0.15,
        'Transporte público': 0.12,
        'Meio ambiente': 0.10,
        'Inflação': 0.15,
        'Drogas': 0.12,
        'Impostos altos': 0.10,
    }

    for e in eleitores:
        preocupacoes_eleitor = []
        renda = e.get('renda_salarios_minimos', 'mais_de_1_ate_2')
        cluster = e.get('cluster_socioeconomico', 'G3_media_baixa')
        orientacao = e.get('orientacao_politica', 'centro')

        for preoc, prob in preocupacoes_base.items():
            prob_ajustada = prob

            # Baixa renda preocupa mais com economia e emprego
            if cluster in ['G3_media_baixa', 'G4_baixa']:
                if preoc in ['Desemprego', 'Custo de vida', 'Fome e miséria', 'Transporte público']:
                    prob_ajustada = min(0.90, prob + 0.20)

            # Alta renda preocupa mais com segurança e corrupção
            if cluster in ['G1_alta', 'G2_media_alta']:
                if preoc in ['Segurança pública', 'Corrupção', 'Impostos altos']:
                    prob_ajustada = min(0.90, prob + 0.15)

            # Esquerda preocupa mais com desigualdade
            if orientacao in ['esquerda', 'centro_esquerda']:
                if preoc in ['Desigualdade social', 'Fome e miséria', 'Educação']:
                    prob_ajustada = min(0.90, prob + 0.15)

            # Direita preocupa mais com segurança e corrupção
            if orientacao in ['direita', 'centro_direita']:
                if preoc in ['Segurança pública', 'Corrupção', 'Violência e criminalidade']:
                    prob_ajustada = min(0.90, prob + 0.15)

            if random.random() < prob_ajustada:
                preocupacoes_eleitor.append(preoc)

        # Garantir pelo menos 2 preocupações
        while len(preocupacoes_eleitor) < 2:
            preoc_extra = random.choice(list(preocupacoes_base.keys()))
            if preoc_extra not in preocupacoes_eleitor:
                preocupacoes_eleitor.append(preoc_extra)

        # Máximo 4 preocupações
        if len(preocupacoes_eleitor) > 4:
            preocupacoes_eleitor = random.sample(preocupacoes_eleitor, 4)

        e['preocupacoes'] = preocupacoes_eleitor

    # Verificar resultado
    contador = Counter()
    for e in eleitores:
        for p in e.get('preocupacoes', []):
            contador[p] += 1

    print(f"   Top 5: {contador.most_common(5)}")
    return eleitores


# ============================================================================
# 5. CORRIGIR FONTES DE INFORMAÇÃO
# ============================================================================
def corrigir_fontes_informacao(eleitores):
    """
    Ajusta fontes para refletir Reuters Institute 2025
    Metas: TV 52%, Redes 53%, WhatsApp 35%, YouTube 37%, Sites 40%
    """
    print("5. Corrigindo FONTES DE INFORMAÇÃO...")

    # Fontes com probabilidades
    fontes_base = {
        # TV
        'TV Globo / Jornal Nacional': 0.45,
        'TV Record / Cidade Alerta': 0.20,
        'TV SBT': 0.12,
        'TV Band': 0.08,
        # Redes sociais
        'Instagram': 0.35,
        'WhatsApp': 0.40,
        'YouTube': 0.38,
        'Facebook': 0.28,
        'TikTok': 0.25,
        'Twitter/X': 0.15,
        # Sites de notícias
        'G1': 0.30,
        'UOL': 0.20,
        'Folha de S.Paulo': 0.12,
        'Metrópoles': 0.15,
        'R7': 0.10,
        # Outros
        'Rádio': 0.15,
        'Podcasts': 0.12,
        'Jornal impresso': 0.08,
    }

    for e in eleitores:
        fontes_eleitor = []
        idade = e.get('idade', 35)
        escolaridade = e.get('escolaridade', 'medio')
        cluster = e.get('cluster_socioeconomico', 'G3_media_baixa')

        for fonte, prob in fontes_base.items():
            prob_ajustada = prob

            # Jovens usam mais redes sociais
            if idade < 35:
                if fonte in ['TikTok', 'Instagram', 'YouTube', 'Twitter/X']:
                    prob_ajustada = min(0.90, prob + 0.20)
                if fonte in ['TV Globo / Jornal Nacional', 'Rádio', 'Jornal impresso']:
                    prob_ajustada = max(0.10, prob - 0.15)

            # Idosos usam mais TV
            if idade >= 55:
                if fonte in ['TV Globo / Jornal Nacional', 'TV Record / Cidade Alerta', 'Rádio']:
                    prob_ajustada = min(0.90, prob + 0.25)
                if fonte in ['TikTok', 'Twitter/X']:
                    prob_ajustada = max(0.05, prob - 0.20)

            # Alta escolaridade usa mais sites de notícias
            if escolaridade == 'superior_completo_ou_pos':
                if fonte in ['Folha de S.Paulo', 'G1', 'UOL', 'Podcasts']:
                    prob_ajustada = min(0.90, prob + 0.15)

            # Baixa renda usa mais TV aberta e WhatsApp
            if cluster in ['G3_media_baixa', 'G4_baixa']:
                if fonte in ['TV Record / Cidade Alerta', 'TV SBT', 'WhatsApp']:
                    prob_ajustada = min(0.90, prob + 0.10)

            if random.random() < prob_ajustada:
                fontes_eleitor.append(fonte)

        # Garantir pelo menos 2 fontes
        while len(fontes_eleitor) < 2:
            fonte_extra = random.choice(list(fontes_base.keys()))
            if fonte_extra not in fontes_eleitor:
                fontes_eleitor.append(fonte_extra)

        # Máximo 5 fontes
        if len(fontes_eleitor) > 5:
            fontes_eleitor = random.sample(fontes_eleitor, 5)

        e['fontes_informacao'] = fontes_eleitor

    # Verificar resultado
    contador = Counter()
    for e in eleitores:
        for f in e.get('fontes_informacao', []):
            contador[f] += 1

    print(f"   Top 5: {contador.most_common(5)}")
    return eleitores


# ============================================================================
# 6. CORRIGIR VIESES COGNITIVOS
# ============================================================================
def corrigir_vieses_cognitivos(eleitores):
    """
    Diversifica vieses cognitivos
    Metas: confirmação 45%, emocional 35%, grupo 30%, ancoragem 25%
    """
    print("6. Corrigindo VIESES COGNITIVOS...")

    vieses_base = {
        'confirmacao': 0.45,           # Busca confirmar crenças
        'emocional': 0.40,             # Decide por emoção
        'grupo': 0.35,                 # Conformidade social
        'ancoragem': 0.30,             # Primeira info pesa muito
        'disponibilidade': 0.28,       # Eventos recentes
        'autoridade': 0.25,            # Confia em autoridades
        'aversao_perda': 0.22,         # Medo de perder
        'otimismo': 0.20,              # Excesso de otimismo
        'status_quo': 0.18,            # Preferência pelo atual
        'retrospectiva': 0.15,         # "Eu sabia"
        'tribalismo': 0.25,            # Nós vs eles
    }

    for e in eleitores:
        vieses_eleitor = []
        tolerancia = e.get('tolerancia_nuance', 'media')
        interesse = e.get('interesse_politico', 'medio')
        escolaridade = e.get('escolaridade', 'medio')

        for vies, prob in vieses_base.items():
            prob_ajustada = prob

            # Baixa tolerância = mais viés de confirmação e tribalismo
            if tolerancia == 'baixa':
                if vies in ['confirmacao', 'tribalismo', 'grupo']:
                    prob_ajustada = min(0.90, prob + 0.25)

            # Alta tolerância = menos vieses extremos
            if tolerancia == 'alta':
                if vies in ['confirmacao', 'tribalismo']:
                    prob_ajustada = max(0.15, prob - 0.20)

            # Alto interesse político = mais viés de confirmação
            if interesse == 'alto':
                if vies in ['confirmacao', 'ancoragem']:
                    prob_ajustada = min(0.90, prob + 0.15)

            # Baixa escolaridade = mais viés emocional e autoridade
            if escolaridade == 'fundamental_ou_sem_instrucao':
                if vies in ['emocional', 'autoridade', 'grupo']:
                    prob_ajustada = min(0.90, prob + 0.15)

            if random.random() < prob_ajustada:
                vieses_eleitor.append(vies)

        # Garantir pelo menos 1 viés
        if len(vieses_eleitor) == 0:
            vieses_eleitor = [random.choice(list(vieses_base.keys()))]

        # Máximo 4 vieses
        if len(vieses_eleitor) > 4:
            vieses_eleitor = random.sample(vieses_eleitor, 4)

        e['vieses_cognitivos'] = vieses_eleitor

    # Verificar resultado
    contador = Counter()
    for e in eleitores:
        for v in e.get('vieses_cognitivos', []):
            contador[v] += 1

    print(f"   Resultado: {dict(contador.most_common(6))}")
    return eleitores


# ============================================================================
# 7. CORRIGIR ESTILO DE DECISÃO
# ============================================================================
def corrigir_estilo_decisao(eleitores):
    """
    Padroniza categorias de estilo de decisão eleitoral
    Metas: racional 20%, emocional 35%, pragmático 25%, ideológico 15%, influenciável 5%
    """
    print("7. Corrigindo ESTILO DE DECISÃO...")
    n = len(eleitores)

    # Metas
    metas = {
        'racional_analitico': int(n * 0.20),
        'emocional_intuitivo': int(n * 0.35),
        'pragmatico': int(n * 0.25),
        'ideologico': int(n * 0.15),
        'influenciavel': int(n * 0.05),
    }
    total = sum(metas.values())
    metas['emocional_intuitivo'] += (n - total)

    # Criar lista de estilos
    estilos = []
    for estilo, qtd in metas.items():
        estilos.extend([estilo] * qtd)

    random.shuffle(estilos)

    # Atribuir considerando coerência
    for i, e in enumerate(eleitores):
        escolaridade = e.get('escolaridade', 'medio')
        interesse = e.get('interesse_politico', 'medio')
        tolerancia = e.get('tolerancia_nuance', 'media')

        if i < len(estilos):
            estilo = estilos[i]

            # Coerência: alta escolaridade mais racional
            if escolaridade == 'superior_completo_ou_pos' and estilo == 'influenciavel':
                estilo = random.choice(['racional_analitico', 'pragmatico'])

            # Alto interesse político mais ideológico
            if interesse == 'alto' and estilo == 'influenciavel':
                estilo = random.choice(['ideologico', 'racional_analitico'])

            # Baixa tolerância mais emocional/ideológico
            if tolerancia == 'baixa' and estilo in ['racional_analitico', 'pragmatico']:
                if random.random() < 0.3:
                    estilo = random.choice(['emocional_intuitivo', 'ideologico'])

            e['estilo_decisao'] = estilo

    dist = Counter(e['estilo_decisao'] for e in eleitores)
    print(f"   Resultado: {dict(dist)}")
    return eleitores


# ============================================================================
# MAIN
# ============================================================================
def main():
    print("=" * 70)
    print("CORREÇÃO DE TODOS OS CAMPOS CRÍTICOS")
    print("=" * 70)
    print()

    with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    eleitores = corrigir_faixa_etaria(eleitores)
    eleitores = corrigir_filhos_cat(eleitores)
    eleitores = corrigir_valores(eleitores)
    eleitores = corrigir_preocupacoes(eleitores)
    eleitores = corrigir_fontes_informacao(eleitores)
    eleitores = corrigir_vieses_cognitivos(eleitores)
    eleitores = corrigir_estilo_decisao(eleitores)

    # Salvar
    with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print()
    print("=" * 70)
    print("CORREÇÕES APLICADAS COM SUCESSO!")
    print("=" * 70)
    print("Execute 'python auditar_campos_expandido.py' para validar.")


if __name__ == "__main__":
    main()
