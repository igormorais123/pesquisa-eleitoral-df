#!/usr/bin/env python3
"""
Gerador de Eleitores Corretivos v3
Foco: Corrigir desvios restantes após v1 e v2
- Meio de Transporte Carro: 16.7% -> 32.3%
- CLT: 23.6% -> 37.5%
- Crítico Forte Bolsonaro: 21.9% -> 34%
- Superior/Pós: 26.5% -> 37%
- Reduzir Classe Baixa: 42.1% -> 28.2%
"""

import json
import random
import uuid
from datetime import datetime

# Carregar banco atual
with open('agentes/banco-eleitores-df.json', 'r', encoding='utf-8') as f:
    eleitores_atuais = json.load(f)

total_atual = len(eleitores_atuais)
print(f"Total atual: {total_atual} eleitores")

# Calcular necessidades
# Para chegar nas metas com ~950 eleitores total (adicionando ~200)
TOTAL_ALVO = 950

# Metas
META_CARRO = 0.323  # 32.3%
META_CLT = 0.375    # 37.5%
META_CRITICO = 0.34 # 34%
META_SUPERIOR = 0.37 # 37%
META_CLASSE_BAIXA = 0.282 # 28.2%

# Atual
atual_carro = sum(1 for e in eleitores_atuais if e.get('meio_transporte') == 'carro')
atual_clt = sum(1 for e in eleitores_atuais if e.get('ocupacao_vinculo') == 'clt')
atual_critico = sum(1 for e in eleitores_atuais if e.get('posicao_bolsonaro') == 'critico_forte')
atual_superior = sum(1 for e in eleitores_atuais if e.get('escolaridade') == 'superior_completo_ou_pos')
atual_classe_baixa = sum(1 for e in eleitores_atuais if e.get('cluster_socioeconomico') == 'G4_baixa')

print(f"Atual Carro: {atual_carro} ({100*atual_carro/total_atual:.1f}%)")
print(f"Atual CLT: {atual_clt} ({100*atual_clt/total_atual:.1f}%)")
print(f"Atual Crítico Forte: {atual_critico} ({100*atual_critico/total_atual:.1f}%)")
print(f"Atual Superior/Pós: {atual_superior} ({100*atual_superior/total_atual:.1f}%)")
print(f"Atual Classe Baixa: {atual_classe_baixa} ({100*atual_classe_baixa/total_atual:.1f}%)")

# Quantos precisamos de cada (para 950 total)
necessario_carro = int(TOTAL_ALVO * META_CARRO) - atual_carro
necessario_clt = int(TOTAL_ALVO * META_CLT) - atual_clt
necessario_critico = int(TOTAL_ALVO * META_CRITICO) - atual_critico
necessario_superior = int(TOTAL_ALVO * META_SUPERIOR) - atual_superior
maximo_classe_baixa = int(TOTAL_ALVO * META_CLASSE_BAIXA)
excesso_classe_baixa = atual_classe_baixa - maximo_classe_baixa

print(f"\nNecessário adicionar:")
print(f"  Carro: +{necessario_carro}")
print(f"  CLT: +{necessario_clt}")
print(f"  Crítico Forte: +{necessario_critico}")
print(f"  Superior/Pós: +{necessario_superior}")
print(f"  Classe Baixa excesso: {excesso_classe_baixa} (não adicionar mais)")

# Dados de referência
REGIOES = {
    'Ceilândia': 0.16, 'Samambaia': 0.09, 'Taguatinga': 0.08,
    'Plano Piloto': 0.07, 'Planaltina': 0.07, 'Águas Claras': 0.05,
    'Recanto das Emas': 0.05, 'Gama': 0.05, 'Guará': 0.04,
    'Santa Maria': 0.04, 'Sobradinho': 0.03, 'São Sebastião': 0.03,
    'Vicente Pires': 0.02, 'Riacho Fundo': 0.02, 'Brazlândia': 0.02,
    'Paranoá': 0.02, 'Estrutural': 0.01, 'Itapoã': 0.02,
    'Sudoeste/Octogonal': 0.02, 'Lago Sul': 0.01, 'Lago Norte': 0.01,
    'Cruzeiro': 0.01, 'Jardim Botânico': 0.01, 'Park Way': 0.01,
    'Núcleo Bandeirante': 0.01, 'Candangolândia': 0.01, 'Varjão': 0.01,
    'Fercal': 0.01, 'SIA': 0.005, 'SCIA': 0.005
}

NOMES_MASCULINOS = [
    "João", "Pedro", "Lucas", "Gabriel", "Rafael", "Matheus", "Bruno", "Felipe",
    "Gustavo", "Leonardo", "Rodrigo", "Thiago", "André", "Carlos", "Daniel",
    "Eduardo", "Fernando", "Henrique", "Igor", "José", "Leandro", "Marcelo",
    "Nicolas", "Paulo", "Ricardo", "Sérgio", "Vinícius", "William", "Alex", "Diego"
]

NOMES_FEMININOS = [
    "Maria", "Ana", "Juliana", "Fernanda", "Patricia", "Camila", "Amanda",
    "Bruna", "Carolina", "Daniela", "Gabriela", "Helena", "Isabella", "Larissa",
    "Letícia", "Mariana", "Natália", "Paula", "Renata", "Sabrina", "Tatiana",
    "Vanessa", "Aline", "Beatriz", "Cristina", "Débora", "Eduarda", "Fabiana"
]

SOBRENOMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves",
    "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho",
    "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha",
    "Dias", "Nascimento", "Andrade", "Moreira", "Nunes", "Marques", "Machado"
]

PROFISSOES_CLT = [
    "Analista de Sistemas", "Técnico de Enfermagem", "Vendedor(a)", "Operador de Caixa",
    "Auxiliar Administrativo", "Recepcionista", "Motorista", "Segurança",
    "Atendente", "Operador de Telemarketing", "Técnico em Informática",
    "Assistente Contábil", "Auxiliar de Produção", "Mecânico", "Eletricista",
    "Analista Financeiro", "Coordenador de RH", "Supervisor de Vendas",
    "Engenheiro", "Advogado", "Contador", "Arquiteto", "Designer"
]

PROFISSOES_SUPERIOR = [
    "Engenheiro(a)", "Advogado(a)", "Médico(a)", "Contador(a)", "Arquiteto(a)",
    "Administrador(a)", "Economista", "Psicólogo(a)", "Analista de TI",
    "Professor(a) Universitário", "Consultor(a)", "Gerente de Projetos",
    "Cientista de Dados", "Desenvolvedor(a) Sênior"
]

RELIGIOES = ['catolica', 'evangelica', 'espirita', 'sem_religiao', 'outra']
CORES = ['branca', 'parda', 'preta', 'amarela', 'indigena']
ESTADOS_CIVIS = ['solteiro(a)', 'casado(a)', 'divorciado(a)', 'viuvo(a)', 'uniao_estavel']

def gerar_nome(genero):
    if genero == 'masculino':
        nome = random.choice(NOMES_MASCULINOS)
    else:
        nome = random.choice(NOMES_FEMININOS)
    sobrenome1 = random.choice(SOBRENOMES)
    sobrenome2 = random.choice(SOBRENOMES)
    while sobrenome2 == sobrenome1:
        sobrenome2 = random.choice(SOBRENOMES)
    return f"{nome} {sobrenome1} {sobrenome2}"

def gerar_eleitor_corretivo(idx, perfil_alvo):
    """
    Gera eleitor com características específicas para corrigir desvios.
    perfil_alvo: dict com características obrigatórias
    """
    genero = random.choice(['masculino', 'feminino'])
    nome = gerar_nome(genero)

    # Idade baseada no perfil
    if perfil_alvo.get('ocupacao_vinculo') == 'clt':
        idade = random.randint(22, 55)
    elif perfil_alvo.get('escolaridade') == 'superior_completo_ou_pos':
        idade = random.randint(25, 60)
    else:
        idade = random.randint(18, 70)

    # Região
    regiao = random.choices(list(REGIOES.keys()), weights=list(REGIOES.values()))[0]

    # Cluster - evitar classe baixa se já temos excesso
    if perfil_alvo.get('evitar_classe_baixa'):
        cluster = random.choices(
            ['G1_alta', 'G2_media_alta', 'G3_media_baixa'],
            weights=[0.25, 0.35, 0.40]
        )[0]
    else:
        cluster = perfil_alvo.get('cluster', random.choices(
            ['G1_alta', 'G2_media_alta', 'G3_media_baixa', 'G4_baixa'],
            weights=[0.18, 0.22, 0.32, 0.28]
        )[0])

    # Escolaridade
    escolaridade = perfil_alvo.get('escolaridade', random.choices(
        ['fundamental_ou_sem_instrucao', 'medio_completo_ou_sup_incompleto', 'superior_completo_ou_pos'],
        weights=[0.25, 0.38, 0.37]
    )[0])

    # Ocupação/Vínculo
    ocupacao_vinculo = perfil_alvo.get('ocupacao_vinculo', random.choices(
        ['clt', 'autonomo', 'servidor_publico', 'informal', 'desempregado', 'aposentado', 'estudante', 'empresario'],
        weights=[0.375, 0.15, 0.12, 0.10, 0.08, 0.08, 0.06, 0.035]
    )[0])

    # Profissão baseada na ocupação e escolaridade
    if escolaridade == 'superior_completo_ou_pos':
        profissao = random.choice(PROFISSOES_SUPERIOR)
    elif ocupacao_vinculo == 'clt':
        profissao = random.choice(PROFISSOES_CLT)
    elif ocupacao_vinculo == 'servidor_publico':
        profissao = random.choice(["Servidor(a) Público(a)", "Técnico(a) Judiciário", "Analista Legislativo"])
    elif ocupacao_vinculo == 'autonomo':
        profissao = random.choice(["Autônomo(a)", "Prestador de Serviços", "Consultor(a) Independente"])
    elif ocupacao_vinculo == 'empresario':
        profissao = random.choice(["Empresário(a)", "Comerciante", "Empreendedor(a)"])
    elif ocupacao_vinculo == 'aposentado':
        profissao = "Aposentado(a)"
    elif ocupacao_vinculo == 'estudante':
        profissao = "Estudante"
    else:
        profissao = random.choice(["Trabalhador(a) Informal", "Autônomo(a)", "Diarista"])

    # Meio de transporte
    meio_transporte = perfil_alvo.get('meio_transporte', random.choices(
        ['carro', 'onibus', 'metro', 'moto', 'a_pe', 'bicicleta', 'app'],
        weights=[0.32, 0.25, 0.12, 0.10, 0.10, 0.06, 0.05]
    )[0])

    # Renda baseada no cluster
    if cluster == 'G1_alta':
        renda = random.choice(['5_a_10', 'mais_de_10'])
    elif cluster == 'G2_media_alta':
        renda = random.choice(['3_a_5', '5_a_10'])
    elif cluster == 'G3_media_baixa':
        renda = random.choice(['1_a_2', '2_a_3', '3_a_5'])
    else:
        renda = random.choice(['ate_1', '1_a_2'])

    # Posição sobre Bolsonaro
    posicao_bolsonaro = perfil_alvo.get('posicao_bolsonaro', random.choices(
        ['critico_forte', 'critico_moderado', 'neutro', 'apoiador_moderado', 'apoiador_forte'],
        weights=[0.34, 0.18, 0.15, 0.18, 0.15]
    )[0])

    # Orientação política coerente com posição Bolsonaro
    if posicao_bolsonaro == 'critico_forte':
        orientacao = random.choices(['esquerda', 'centro_esquerda', 'centro'], weights=[0.5, 0.35, 0.15])[0]
    elif posicao_bolsonaro == 'critico_moderado':
        orientacao = random.choices(['centro_esquerda', 'centro', 'esquerda'], weights=[0.4, 0.4, 0.2])[0]
    elif posicao_bolsonaro == 'apoiador_forte':
        orientacao = random.choices(['direita', 'centro_direita'], weights=[0.7, 0.3])[0]
    elif posicao_bolsonaro == 'apoiador_moderado':
        orientacao = random.choices(['centro_direita', 'direita', 'centro'], weights=[0.5, 0.3, 0.2])[0]
    else:
        orientacao = random.choices(['centro', 'centro_esquerda', 'centro_direita'], weights=[0.5, 0.25, 0.25])[0]

    # Cor/raça
    cor_raca = random.choices(CORES, weights=[0.32, 0.45, 0.18, 0.03, 0.02])[0]

    # Estado civil baseado na idade
    if idade < 25:
        estado_civil = random.choices(ESTADOS_CIVIS, weights=[0.7, 0.15, 0.02, 0.01, 0.12])[0]
    elif idade < 40:
        estado_civil = random.choices(ESTADOS_CIVIS, weights=[0.35, 0.40, 0.10, 0.02, 0.13])[0]
    else:
        estado_civil = random.choices(ESTADOS_CIVIS, weights=[0.15, 0.50, 0.15, 0.10, 0.10])[0]

    # Filhos
    if estado_civil in ['casado(a)', 'divorciado(a)', 'viuvo(a)', 'uniao_estavel'] and idade > 25:
        filhos = random.choices([0, 1, 2, 3, 4], weights=[0.15, 0.30, 0.35, 0.15, 0.05])[0]
    else:
        filhos = random.choices([0, 1, 2], weights=[0.6, 0.25, 0.15])[0]

    # Religião
    religiao = random.choices(RELIGIOES, weights=[0.35, 0.30, 0.08, 0.20, 0.07])[0]

    # Interesse político
    interesse = random.choices(['baixo', 'medio', 'alto'], weights=[0.35, 0.45, 0.20])[0]

    # Susceptibilidade à desinformação (focar em 1-3 e 7-10 para reduzir 4-6)
    if random.random() < 0.55:  # 55% fora do range 4-6
        susceptibilidade = random.choices([1, 2, 3, 7, 8, 9, 10], weights=[0.08, 0.12, 0.15, 0.20, 0.20, 0.15, 0.10])[0]
    else:
        susceptibilidade = random.randint(4, 6)

    # Valores, medos, preocupações baseados na orientação
    if orientacao in ['esquerda', 'centro_esquerda']:
        valores = random.sample(['Igualdade social', 'Direitos humanos', 'Educação pública', 'Saúde pública',
                                'Meio ambiente', 'Diversidade', 'Justiça social'], 3)
        medos = random.sample(['Desemprego', 'Violência', 'Falta de acesso à saúde', 'Desigualdade',
                              'Autoritarismo', 'Retrocesso social'], 3)
        preocupacoes = random.sample(['Desemprego', 'Custo de vida', 'Saúde pública', 'Educação',
                                     'Meio ambiente', 'Desigualdade'], 3)
    elif orientacao in ['direita', 'centro_direita']:
        valores = random.sample(['Família', 'Liberdade econômica', 'Segurança', 'Tradição',
                                'Meritocracia', 'Propriedade privada', 'Ordem'], 3)
        medos = random.sample(['Criminalidade', 'Comunismo', 'Perda de valores', 'Impostos altos',
                              'Corrupção', 'Desemprego'], 3)
        preocupacoes = random.sample(['Segurança', 'Economia', 'Corrupção', 'Impostos',
                                     'Burocracia', 'Criminalidade'], 3)
    else:
        valores = random.sample(['Equilíbrio', 'Pragmatismo', 'Diálogo', 'Estabilidade',
                                'Progresso', 'Educação', 'Saúde'], 3)
        medos = random.sample(['Instabilidade', 'Polarização', 'Crise econômica', 'Desemprego',
                              'Violência', 'Corrupção'], 3)
        preocupacoes = random.sample(['Economia', 'Saúde', 'Educação', 'Segurança',
                                     'Emprego', 'Custo de vida'], 3)

    # Fontes de informação
    if interesse == 'alto':
        fontes = random.sample(['Jornal Nacional', 'G1', 'Folha', 'UOL', 'CNN Brasil', 'Redes sociais', 'Podcast'], 3)
    elif interesse == 'medio':
        fontes = random.sample(['Jornal Nacional', 'WhatsApp', 'Instagram', 'Redes sociais', 'TV local'], 2)
    else:
        fontes = random.sample(['WhatsApp', 'TV aberta', 'Vizinhos/família', 'Redes sociais'], 2)

    # Vieses cognitivos
    vieses = random.sample(['confirmacao', 'disponibilidade', 'ancoragem', 'grupo', 'otimismo'], 2)

    # Tolerância à nuance
    tolerancia = random.choices(['baixa', 'media', 'alta'], weights=[0.25, 0.50, 0.25])[0]

    # Estilo de decisão
    estilo = random.choices(['emocional', 'racional', 'economico', 'ideologico'], weights=[0.25, 0.30, 0.30, 0.15])[0]

    # Conflito identitário
    conflito = random.random() < 0.15

    # Voto facultativo (menores de 18 ou maiores de 70)
    voto_facultativo = idade < 18 or idade > 70

    # Tempo de deslocamento
    if ocupacao_vinculo in ['aposentado', 'desempregado', 'estudante'] and idade > 60:
        tempo_deslocamento = 'nao_se_aplica'
    elif meio_transporte == 'carro':
        tempo_deslocamento = random.choice(['ate_30min', '30min_a_1h', '1h_a_2h'])
    else:
        tempo_deslocamento = random.choice(['ate_30min', '30min_a_1h', '1h_a_2h', 'mais_de_2h'])

    # Local de referência
    locais = ['perto do metrô', 'centro da cidade', 'área comercial', 'perto da feira',
              'região residencial', 'perto do hospital', 'área central']
    local_ref = f"{random.choice(locais)} de {regiao}"

    # História resumida coerente
    historia = gerar_historia(nome, idade, genero, estado_civil, filhos, profissao,
                             ocupacao_vinculo, regiao, orientacao, posicao_bolsonaro, escolaridade)

    # Instrução comportamental
    instrucao = gerar_instrucao(interesse, tolerancia, estilo, orientacao)

    return {
        'id': f'df-{751 + idx:04d}',
        'nome': nome,
        'idade': idade,
        'genero': genero,
        'cor_raca': cor_raca,
        'regiao_administrativa': regiao,
        'cluster_socioeconomico': cluster,
        'escolaridade': escolaridade,
        'ocupacao_vinculo': ocupacao_vinculo,
        'profissao': profissao,
        'renda_salarios_minimos': renda,
        'meio_transporte': meio_transporte,
        'tempo_deslocamento_trabalho': tempo_deslocamento,
        'estado_civil': estado_civil,
        'filhos': filhos,
        'religiao': religiao,
        'orientacao_politica': orientacao,
        'posicao_bolsonaro': posicao_bolsonaro,
        'interesse_politico': interesse,
        'susceptibilidade_desinformacao': susceptibilidade,
        'valores': valores,
        'medos': medos,
        'preocupacoes': preocupacoes,
        'fontes_informacao': fontes,
        'vieses_cognitivos': vieses,
        'tolerancia_nuance': tolerancia,
        'estilo_decisao': estilo,
        'conflito_identitario': conflito,
        'voto_facultativo': voto_facultativo,
        'local_referencia': local_ref,
        'historia_resumida': historia,
        'instrucao_comportamental': instrucao
    }

def gerar_historia(nome, idade, genero, estado_civil, filhos, profissao, ocupacao, regiao, orientacao, posicao_bolsonaro, escolaridade):
    primeiro_nome = nome.split()[0]

    # Origem
    origens = [
        f"{primeiro_nome} nasceu e cresceu no DF",
        f"{primeiro_nome} veio do Nordeste ainda jovem",
        f"{primeiro_nome} chegou em Brasília há mais de 20 anos",
        f"{primeiro_nome} é filho(a) de pioneiros de Brasília",
        f"Natural de {regiao}, {primeiro_nome} conhece bem a região"
    ]
    origem = random.choice(origens)

    # Situação familiar
    if estado_civil == 'casado(a)':
        familia = f"Casado(a) e com {filhos} filho(s)" if filhos > 0 else "Casado(a) e sem filhos"
    elif estado_civil == 'solteiro(a)':
        familia = "Solteiro(a)"
    elif estado_civil == 'divorciado(a)':
        familia = f"Divorciado(a), cria {filhos} filho(s)" if filhos > 0 else "Divorciado(a)"
    elif estado_civil == 'viuvo(a)':
        familia = "Viúvo(a)"
    else:
        familia = f"Mora com o(a) companheiro(a)" + (f" e {filhos} filho(s)" if filhos > 0 else "")

    # Trabalho
    if ocupacao == 'clt':
        trabalho = f"Trabalha como {profissao} em empresa privada"
    elif ocupacao == 'servidor_publico':
        trabalho = f"É servidor(a) público(a), trabalha como {profissao}"
    elif ocupacao == 'autonomo':
        trabalho = f"Trabalha por conta própria como {profissao}"
    elif ocupacao == 'empresario':
        trabalho = f"É dono(a) do próprio negócio"
    elif ocupacao == 'aposentado':
        trabalho = "Está aposentado(a) e vive com o benefício"
    elif ocupacao == 'desempregado':
        trabalho = "Está em busca de emprego"
    elif ocupacao == 'estudante':
        trabalho = "É estudante"
    else:
        trabalho = f"Faz bicos e trabalhos informais"

    # Visão política baseada na posição sobre Bolsonaro
    if posicao_bolsonaro == 'critico_forte':
        visao = random.choice([
            "Crítico(a) ferrenho(a) do bolsonarismo, vê o ex-presidente como ameaça à democracia.",
            "Se decepcionou profundamente com o governo Bolsonaro e hoje é oposição firme.",
            "Sempre foi de esquerda e se opõe fortemente às políticas conservadoras."
        ])
    elif posicao_bolsonaro == 'critico_moderado':
        visao = random.choice([
            "Não gostou do governo Bolsonaro, mas reconhece alguns pontos positivos.",
            "Tem ressalvas ao bolsonarismo, especialmente na condução da pandemia."
        ])
    elif posicao_bolsonaro == 'apoiador_forte':
        visao = random.choice([
            "Apoiador(a) convicto(a) de Bolsonaro, acredita que ele defende os valores certos.",
            "É bolsonarista e defende as pautas conservadoras com firmeza."
        ])
    elif posicao_bolsonaro == 'apoiador_moderado':
        visao = random.choice([
            "Votou em Bolsonaro mas tem algumas críticas pontuais.",
            "Apoia o ex-presidente em linhas gerais, com algumas ressalvas."
        ])
    else:
        visao = random.choice([
            "Não se identifica com nenhum lado e prefere avaliar caso a caso.",
            "Está desencantado(a) com a política e não confia em nenhum político."
        ])

    return f"{origem}. {familia}. {trabalho}. {visao}"

def gerar_instrucao(interesse, tolerancia, estilo, orientacao):
    tom = "coloquial" if interesse == 'baixo' else ("formal" if interesse == 'alto' else "moderado")

    if interesse == 'alto':
        acompanha = "Acompanha política ativamente e tem opiniões formadas"
    elif interesse == 'medio':
        acompanha = "Acompanha política por alto, forma opinião pelo que vê nas redes"
    else:
        acompanha = "Pouco interesse em política, vota mais por obrigação"

    if tolerancia == 'alta':
        nuance = "Aceita argumentos diferentes e está aberto(a) a mudar de opinião"
    elif tolerancia == 'media':
        nuance = "Ouve outros pontos de vista mas tem convicções firmes"
    else:
        nuance = "Dificilmente muda de opinião, tem posições muito firmes"

    if estilo == 'economico':
        decisao = "Vota pensando no bolso e na economia"
    elif estilo == 'emocional':
        decisao = "Decide pelo candidato que mais gera identificação pessoal"
    elif estilo == 'ideologico':
        decisao = "Vota alinhado(a) com sua ideologia"
    else:
        decisao = "Analisa propostas racionalmente antes de decidir"

    return f"Tom: {tom}. {acompanha}. {nuance}. {decisao}."

# Gerar novos eleitores com perfis corretivos
novos_eleitores = []
idx = 0

# Prioridade 1: Eleitores com CARRO + CLT + classe não-baixa (corrige 3 métricas de uma vez)
for _ in range(80):
    perfil = {
        'meio_transporte': 'carro',
        'ocupacao_vinculo': 'clt',
        'evitar_classe_baixa': True
    }
    novos_eleitores.append(gerar_eleitor_corretivo(idx, perfil))
    idx += 1

# Prioridade 2: Eleitores com CARRO + SUPERIOR + crítico forte
for _ in range(50):
    perfil = {
        'meio_transporte': 'carro',
        'escolaridade': 'superior_completo_ou_pos',
        'posicao_bolsonaro': 'critico_forte',
        'evitar_classe_baixa': True
    }
    novos_eleitores.append(gerar_eleitor_corretivo(idx, perfil))
    idx += 1

# Prioridade 3: Mais CLT + Superior
for _ in range(40):
    perfil = {
        'ocupacao_vinculo': 'clt',
        'escolaridade': 'superior_completo_ou_pos',
        'evitar_classe_baixa': True
    }
    novos_eleitores.append(gerar_eleitor_corretivo(idx, perfil))
    idx += 1

# Prioridade 4: Críticos fortes de Bolsonaro variados
for _ in range(30):
    perfil = {
        'posicao_bolsonaro': 'critico_forte',
        'evitar_classe_baixa': True
    }
    novos_eleitores.append(gerar_eleitor_corretivo(idx, perfil))
    idx += 1

print(f"\nGerados {len(novos_eleitores)} novos eleitores corretivos")

# Combinar com eleitores atuais
todos_eleitores = eleitores_atuais + novos_eleitores
print(f"Total final: {len(todos_eleitores)} eleitores")

# Verificar novas distribuições
total = len(todos_eleitores)
novo_carro = sum(1 for e in todos_eleitores if e.get('meio_transporte') == 'carro')
novo_clt = sum(1 for e in todos_eleitores if e.get('ocupacao_vinculo') == 'clt')
novo_critico = sum(1 for e in todos_eleitores if e.get('posicao_bolsonaro') == 'critico_forte')
novo_superior = sum(1 for e in todos_eleitores if e.get('escolaridade') == 'superior_completo_ou_pos')
novo_classe_baixa = sum(1 for e in todos_eleitores if e.get('cluster_socioeconomico') == 'G4_baixa')

print(f"\nNovas distribuições:")
print(f"  Carro: {novo_carro} ({100*novo_carro/total:.1f}%) - meta: 32.3%")
print(f"  CLT: {novo_clt} ({100*novo_clt/total:.1f}%) - meta: 37.5%")
print(f"  Crítico Forte: {novo_critico} ({100*novo_critico/total:.1f}%) - meta: 34%")
print(f"  Superior/Pós: {novo_superior} ({100*novo_superior/total:.1f}%) - meta: 37%")
print(f"  Classe Baixa: {novo_classe_baixa} ({100*novo_classe_baixa/total:.1f}%) - meta: 28.2%")

# Salvar
with open('agentes/banco-eleitores-df.json', 'w', encoding='utf-8') as f:
    json.dump(todos_eleitores, f, ensure_ascii=False, indent=2)

print(f"\nSalvo em agentes/banco-eleitores-df.json")

# Copiar para frontend
with open('frontend/src/data/eleitores-df-400.json', 'w', encoding='utf-8') as f:
    json.dump(todos_eleitores, f, ensure_ascii=False, indent=2)

print(f"Copiado para frontend/src/data/eleitores-df-400.json")
