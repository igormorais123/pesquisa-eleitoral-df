#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador de Banco de Dados de Parlamentares do Congresso Nacional
================================================================

Este script gera o banco de dados completo de parlamentares brasileiros:
- 513 Deputados Federais (por estado)
- 81 Senadores (3 por estado)

Dados baseados na 57ª legislatura (2023-2027).
"""

import json
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any
import os

# =============================================================================
# CONFIGURAÇÕES BASE
# =============================================================================

# Estados brasileiros com número de deputados federais (proporcional à população)
ESTADOS_DEPUTADOS = {
    "AC": 8, "AL": 9, "AM": 8, "AP": 8, "BA": 39, "CE": 22, "DF": 8, "ES": 10,
    "GO": 17, "MA": 18, "MG": 53, "MS": 8, "MT": 8, "PA": 17, "PB": 12, "PE": 25,
    "PI": 10, "PR": 30, "RJ": 46, "RN": 8, "RO": 8, "RR": 8, "RS": 31, "SC": 16,
    "SE": 8, "SP": 70, "TO": 8
}

# Partidos com representação na Câmara e Senado (2023-2027)
PARTIDOS = [
    {"sigla": "PL", "numero": 22, "orientacao": "direita"},
    {"sigla": "PT", "numero": 13, "orientacao": "esquerda"},
    {"sigla": "UNIÃO", "numero": 44, "orientacao": "centro-direita"},
    {"sigla": "PP", "numero": 11, "orientacao": "centro-direita"},
    {"sigla": "MDB", "numero": 15, "orientacao": "centro"},
    {"sigla": "PSD", "numero": 55, "orientacao": "centro"},
    {"sigla": "REPUBLICANOS", "numero": 10, "orientacao": "centro-direita"},
    {"sigla": "PDT", "numero": 12, "orientacao": "centro-esquerda"},
    {"sigla": "PSDB", "numero": 45, "orientacao": "centro"},
    {"sigla": "PSB", "numero": 40, "orientacao": "centro-esquerda"},
    {"sigla": "PODE", "numero": 20, "orientacao": "centro-direita"},
    {"sigla": "PSOL", "numero": 50, "orientacao": "esquerda"},
    {"sigla": "PCdoB", "numero": 65, "orientacao": "esquerda"},
    {"sigla": "PV", "numero": 43, "orientacao": "centro-esquerda"},
    {"sigla": "SOLIDARIEDADE", "numero": 77, "orientacao": "centro"},
    {"sigla": "AVANTE", "numero": 70, "orientacao": "centro"},
    {"sigla": "CIDADANIA", "numero": 23, "orientacao": "centro-esquerda"},
    {"sigla": "REDE", "numero": 18, "orientacao": "centro-esquerda"},
    {"sigla": "NOVO", "numero": 30, "orientacao": "direita"},
    {"sigla": "PRD", "numero": 25, "orientacao": "centro-direita"},
]

# Distribuição aproximada de partidos por orientação
PARTIDOS_POR_ORIENTACAO = {
    "direita": ["PL", "NOVO"],
    "centro-direita": ["UNIÃO", "PP", "REPUBLICANOS", "PODE", "PRD"],
    "centro": ["MDB", "PSD", "PSDB", "SOLIDARIEDADE", "AVANTE"],
    "centro-esquerda": ["PDT", "PSB", "PV", "CIDADANIA", "REDE"],
    "esquerda": ["PT", "PSOL", "PCdoB"],
}

# Religiões comuns entre parlamentares
RELIGIOES = [
    "catolica", "evangelica", "espirita", "sem_religiao", "judaica",
    "protestante", "nao_declarada"
]

# Estados civis
ESTADOS_CIVIS = ["casado", "casada", "solteiro", "solteira", "divorciado", "divorciada", "viuvo", "viuva"]

# Cores/raças
CORES_RACAS = ["branca", "parda", "negra", "amarela", "indigena"]

# Formações acadêmicas comuns
FORMACOES = [
    ["Direito"], ["Administração"], ["Economia"], ["Medicina"],
    ["Engenharia Civil"], ["Engenharia"], ["Comunicação Social"],
    ["Pedagogia"], ["Ciências Contábeis"], ["Agronomia"],
    ["Ciência Política"], ["Psicologia"], ["Enfermagem"],
    ["Direito", "Administração"], ["Medicina", "Gestão Pública"],
    ["Teologia"], ["História"], ["Sociologia"], ["Jornalismo"],
    ["Veterinária"], ["Odontologia"], ["Farmácia"]
]

# Profissões anteriores
PROFISSOES = [
    "Advogado", "Advogada", "Empresário", "Empresária", "Médico", "Médica",
    "Engenheiro", "Engenheira", "Professor", "Professora", "Economista",
    "Agricultor", "Agricultora", "Pecuarista", "Jornalista", "Comunicador",
    "Comunicadora", "Policial Militar", "Policial Civil", "Delegado", "Delegada",
    "Pastor", "Pastora", "Servidor Público", "Servidora Pública", "Bancário",
    "Bancária", "Sindicalista", "Contador", "Contadora", "Juiz", "Juíza",
    "Promotor", "Promotora", "Procurador", "Procuradora", "Dentista",
    "Veterinário", "Veterinária", "Agrônomo", "Agrônoma", "Radialista",
    "Apresentador de TV", "Apresentadora de TV", "Ator", "Atriz", "Cantor",
    "Cantora", "Militar", "Bombeiro", "Bombeira", "Enfermeiro", "Enfermeira"
]

# Temas de atuação
TEMAS_ATUACAO = [
    "Educação", "Saúde", "Segurança Pública", "Agricultura", "Economia",
    "Meio Ambiente", "Direitos Humanos", "Infraestrutura", "Tecnologia",
    "Cultura", "Esporte", "Trabalho", "Previdência Social", "Defesa",
    "Turismo", "Ciência e Tecnologia", "Comunicação", "Transporte",
    "Energia", "Mineração", "Comércio Exterior", "Desenvolvimento Regional",
    "Assistência Social", "Direitos das Mulheres", "Direitos da Criança",
    "Direitos dos Idosos", "Direitos LGBTI+", "Defesa do Consumidor",
    "Combate à Corrupção", "Reforma Política", "Reforma Tributária",
    "Agronegócio", "Pecuária", "Indústria", "Pequenas Empresas"
]

# Valores comuns
VALORES = [
    "Família", "Trabalho", "Educação", "Justiça social", "Liberdade",
    "Democracia", "Ordem", "Progresso", "Igualdade", "Solidariedade",
    "Sustentabilidade", "Inovação", "Tradição", "Fé cristã", "Patriotismo",
    "Meritocracia", "Responsabilidade fiscal", "Desenvolvimento sustentável",
    "Inclusão social", "Diversidade", "Conservadorismo", "Transparência"
]

# Preocupações comuns
PREOCUPACOES = [
    "Criminalidade", "Desemprego", "Corrupção", "Inflação", "Saúde pública",
    "Educação de qualidade", "Pobreza", "Desigualdade social", "Fome",
    "Mudanças climáticas", "Desmatamento", "Violência contra mulher",
    "Tráfico de drogas", "Segurança nas fronteiras", "Dívida pública",
    "Burocracia estatal", "Impostos altos", "Custo de vida"
]

# Medos comuns
MEDOS = [
    "Aumento da violência", "Crise econômica", "Desemprego em massa",
    "Polarização política", "Retrocesso em direitos", "Instabilidade política",
    "Perda de competitividade", "Degradação ambiental", "Radicalização"
]

# Vieses cognitivos
VIESES = [
    "confirmacao", "disponibilidade", "ancoragem", "grupo", "otimismo",
    "status_quo", "representatividade", "tribalismo", "autoridade"
]

# Fontes de informação
FONTES_INFO = [
    "Jornais tradicionais", "TV aberta", "Redes sociais", "Portais de notícias",
    "Rádio", "Sites especializados", "Revistas", "Podcasts", "YouTube",
    "WhatsApp", "Twitter/X", "Instagram", "TikTok", "Publicações acadêmicas"
]

# Nomes próprios brasileiros (masculinos e femininos)
NOMES_MASCULINOS = [
    "João", "José", "Antonio", "Carlos", "Paulo", "Pedro", "Lucas", "Marcos",
    "Luis", "Gabriel", "Rafael", "Fernando", "Jorge", "Roberto", "Eduardo",
    "Ricardo", "Marcelo", "André", "Bruno", "Diego", "Márcio", "Sérgio",
    "Alexandre", "Flávio", "Gilberto", "Gustavo", "Henrique", "Hugo", "Igor",
    "Júlio", "Leonardo", "Luciano", "Mário", "Nelson", "Nilson", "Otávio",
    "Reinaldo", "Rodrigo", "Ronaldo", "Sílvio", "Thiago", "Valdemar", "Vanderlei",
    "Vinícius", "Wagner", "Wilson", "Zé", "Ademir", "Afonso", "Alberto", "Alcides",
    "Alencar", "Alfredo", "Álvaro", "Amaury", "Américo", "Anderson", "Angelo",
    "Arnaldo", "Arthur", "Augusto", "Benedito", "Bento", "Caetano", "César",
    "Cláudio", "Cleber", "Cristiano", "Davi", "Décio", "Denis", "Dirceu",
    "Edson", "Elias", "Emerson", "Expedito", "Fábio", "Felipe", "Geraldo",
    "Gilson", "Giovani", "Hélio", "Humberto", "Ivan", "Jair", "Jefferson",
    "Joaquim", "Josué", "Laércio", "Leandro", "Lúcio", "Mauro", "Milton",
    "Neri", "Odair", "Orlando", "Osmar", "Oswaldo", "Otacílio", "Reginaldo",
    "Renato", "Rogério", "Rubens", "Samuel", "Sebastião", "Silas", "Valdir",
    "Vitor", "Wellington", "Wladimir", "Zeca"
]

NOMES_FEMININOS = [
    "Maria", "Ana", "Adriana", "Aline", "Amanda", "Beatriz", "Bruna", "Camila",
    "Carla", "Carolina", "Cláudia", "Cristina", "Daniela", "Débora", "Denise",
    "Eliane", "Elizabete", "Fernanda", "Flávia", "Gabriela", "Helena", "Isabela",
    "Jaqueline", "Joana", "Juliana", "Kátia", "Larissa", "Letícia", "Lídia",
    "Lúcia", "Luciana", "Luiza", "Márcia", "Margarida", "Mariana", "Marina",
    "Marta", "Michele", "Mônica", "Natália", "Patrícia", "Paula", "Priscila",
    "Raquel", "Regina", "Renata", "Rita", "Roberta", "Rosa", "Rosana", "Roseli",
    "Sandra", "Silvia", "Simone", "Sônia", "Suzana", "Tânia", "Tatiana", "Teresa",
    "Vanessa", "Vera", "Vânia", "Zenaide", "Érica", "Alice", "Aurora", "Celia",
    "Damares", "Edna", "Erika", "Gleisi", "Jandira", "Leila", "Lídice", "Margareth",
    "Professora", "Soraya", "Tereza", "Zenaide"
]

SOBRENOMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves",
    "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho",
    "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha",
    "Dias", "Nascimento", "Andrade", "Moreira", "Nunes", "Marques", "Machado",
    "Mendes", "Freitas", "Cardoso", "Ramos", "Gonçalves", "Santana", "Teixeira",
    "Moura", "Correia", "Araújo", "Melo", "Barros", "Cavalcanti", "Pinheiro",
    "Campos", "Castro", "Cunha", "Monteiro", "Reis", "Cruz", "Duarte", "Azevedo",
    "Borges", "Fonseca", "Aguiar", "Farias", "Sales", "Miranda", "Cabral",
    "Medeiros", "Batista", "Pinto", "Coelho", "Brito", "Xavier", "Brandão",
    "Bezerra", "Coutinho", "Alencar", "Viana", "Lacerda", "Siqueira", "Mesquita",
    "Leite", "Nogueira", "Braga", "Maia", "Sampaio", "Arruda", "Padilha",
    "Carneiro", "Figueiredo", "Motta", "Torres", "Magalhães", "Neto", "Junior",
    "Filho", "de Paula", "de Jesus", "de Lima", "de Souza", "de Oliveira"
]

# Capitais dos estados
CAPITAIS = {
    "AC": "Rio Branco", "AL": "Maceió", "AM": "Manaus", "AP": "Macapá",
    "BA": "Salvador", "CE": "Fortaleza", "DF": "Brasília", "ES": "Vitória",
    "GO": "Goiânia", "MA": "São Luís", "MG": "Belo Horizonte", "MS": "Campo Grande",
    "MT": "Cuiabá", "PA": "Belém", "PB": "João Pessoa", "PE": "Recife",
    "PI": "Teresina", "PR": "Curitiba", "RJ": "Rio de Janeiro", "RN": "Natal",
    "RO": "Porto Velho", "RR": "Boa Vista", "RS": "Porto Alegre", "SC": "Florianópolis",
    "SE": "Aracaju", "SP": "São Paulo", "TO": "Palmas"
}

# Cidades importantes por estado
CIDADES_POR_UF = {
    "AC": ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá"],
    "AL": ["Maceió", "Arapiraca", "Palmeira dos Índios", "Rio Largo"],
    "AM": ["Manaus", "Parintins", "Itacoatiara", "Manacapuru"],
    "AP": ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque"],
    "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Ilhéus", "Juazeiro"],
    "CE": ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral"],
    "DF": ["Brasília", "Taguatinga", "Ceilândia", "Samambaia"],
    "ES": ["Vitória", "Vila Velha", "Serra", "Cariacica", "Cachoeiro de Itapemirim"],
    "GO": ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia"],
    "MA": ["São Luís", "Imperatriz", "Caxias", "Timon", "Codó"],
    "MG": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Uberaba"],
    "MS": ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá"],
    "MT": ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra"],
    "PA": ["Belém", "Ananindeua", "Santarém", "Marabá", "Parauapebas", "Castanhal"],
    "PB": ["João Pessoa", "Campina Grande", "Santa Rita", "Patos"],
    "PE": ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina"],
    "PI": ["Teresina", "Parnaíba", "Picos", "Piripiri"],
    "PR": ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais"],
    "RJ": ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Campos"],
    "RN": ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante"],
    "RO": ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena"],
    "RR": ["Boa Vista", "Rorainópolis", "Caracaraí"],
    "RS": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria", "Novo Hamburgo"],
    "SC": ["Florianópolis", "Joinville", "Blumenau", "São José", "Chapecó", "Criciúma"],
    "SE": ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana"],
    "SP": ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "Ribeirão Preto", "Sorocaba", "Santos"],
    "TO": ["Palmas", "Araguaína", "Gurupi", "Porto Nacional"]
}

# Universidades por região
UNIVERSIDADES = {
    "N": ["UFAM", "UFPA", "UFAC", "UFRR", "UNIFAP", "UFT", "UNIR"],
    "NE": ["UFBA", "UFC", "UFPE", "UFPB", "UFRN", "UFAL", "UFS", "UFMA", "UFPI"],
    "CO": ["UnB", "UFG", "UFMS", "UFMT"],
    "SE": ["USP", "UNICAMP", "UNESP", "UFRJ", "UFMG", "UFES", "UFF"],
    "S": ["UFPR", "UFSC", "UFRGS", "UTFPR", "UNISINOS", "PUC-RS", "PUC-PR"]
}

# Região de cada estado
REGIAO_UF = {
    "AC": "N", "AM": "N", "AP": "N", "PA": "N", "RO": "N", "RR": "N", "TO": "N",
    "AL": "NE", "BA": "NE", "CE": "NE", "MA": "NE", "PB": "NE", "PE": "NE", "PI": "NE", "RN": "NE", "SE": "NE",
    "DF": "CO", "GO": "CO", "MS": "CO", "MT": "CO",
    "ES": "SE", "MG": "SE", "RJ": "SE", "SP": "SE",
    "PR": "S", "RS": "S", "SC": "S"
}

# Comissões da Câmara
COMISSOES_CAMARA = [
    "Comissão de Constituição e Justiça e de Cidadania (CCJC)",
    "Comissão de Finanças e Tributação (CFT)",
    "Comissão de Agricultura, Pecuária, Abastecimento e Desenvolvimento Rural",
    "Comissão de Ciência, Tecnologia e Inovação",
    "Comissão de Defesa do Consumidor",
    "Comissão de Desenvolvimento Urbano",
    "Comissão de Direitos Humanos, Minorias e Igualdade Racial",
    "Comissão de Educação",
    "Comissão de Fiscalização Financeira e Controle",
    "Comissão de Integração Nacional e Desenvolvimento Regional",
    "Comissão de Legislação Participativa",
    "Comissão de Meio Ambiente e Desenvolvimento Sustentável",
    "Comissão de Minas e Energia",
    "Comissão de Relações Exteriores e de Defesa Nacional",
    "Comissão de Saúde",
    "Comissão de Segurança Pública e Combate ao Crime Organizado",
    "Comissão de Seguridade Social e Família",
    "Comissão de Trabalho",
    "Comissão de Turismo",
    "Comissão de Viação e Transportes",
    "Comissão de Cultura",
    "Comissão de Comunicação",
    "Comissão do Esporte"
]

# Comissões do Senado
COMISSOES_SENADO = [
    "Comissão de Constituição, Justiça e Cidadania (CCJ)",
    "Comissão de Assuntos Econômicos (CAE)",
    "Comissão de Assuntos Sociais (CAS)",
    "Comissão de Direitos Humanos e Legislação Participativa (CDH)",
    "Comissão de Educação, Cultura e Esporte (CE)",
    "Comissão de Infraestrutura (CI)",
    "Comissão de Meio Ambiente (CMA)",
    "Comissão de Relações Exteriores e Defesa Nacional (CRE)",
    "Comissão de Agricultura e Reforma Agrária (CRA)",
    "Comissão de Desenvolvimento Regional e Turismo (CDR)",
    "Comissão de Ciência, Tecnologia, Inovação e Informática (CCT)",
    "Comissão de Serviços de Infraestrutura (CI)",
    "Comissão de Segurança Pública (CSP)"
]

# Frentes parlamentares
FRENTES_PARLAMENTARES = [
    "Frente Parlamentar da Agropecuária",
    "Frente Parlamentar Evangélica",
    "Frente Parlamentar da Segurança Pública",
    "Frente Parlamentar em Defesa da Vida e da Família",
    "Frente Parlamentar Ambientalista",
    "Frente Parlamentar da Saúde",
    "Frente Parlamentar da Educação",
    "Frente Parlamentar do Empreendedorismo",
    "Frente Parlamentar das Micro e Pequenas Empresas",
    "Frente Parlamentar do Esporte",
    "Frente Parlamentar da Mineração",
    "Frente Parlamentar do Cooperativismo",
    "Frente Parlamentar em Defesa dos Direitos Humanos",
    "Frente Parlamentar pelos Direitos das Mulheres",
    "Frente Parlamentar LGBTQIA+",
    "Frente Parlamentar Indigenista",
    "Frente Parlamentar pela Valorização das Universidades",
    "Frente Parlamentar do Setor de Serviços",
    "Frente Parlamentar da Ciência e Tecnologia",
    "Frente Parlamentar da Infraestrutura",
    "Frente Parlamentar do Turismo",
    "Frente Parlamentar da Cultura"
]

# =============================================================================
# FUNÇÕES AUXILIARES
# =============================================================================

def calcular_signo(data_nascimento: str) -> str:
    """Calcula o signo baseado na data de nascimento."""
    mes = int(data_nascimento.split("-")[1])
    dia = int(data_nascimento.split("-")[2])

    signos = [
        (1, 20, "capricornio"), (2, 19, "aquario"), (3, 20, "peixes"),
        (4, 20, "aries"), (5, 21, "touro"), (6, 21, "gemeos"),
        (7, 22, "cancer"), (8, 23, "leao"), (9, 23, "virgem"),
        (10, 23, "libra"), (11, 22, "escorpiao"), (12, 21, "sagitario"),
        (12, 31, "capricornio")
    ]

    for limite_mes, limite_dia, signo in signos:
        if mes < limite_mes or (mes == limite_mes and dia <= limite_dia):
            return signo
    return "capricornio"

def gerar_data_nascimento(idade_min: int = 30, idade_max: int = 75) -> tuple:
    """Gera data de nascimento e calcula idade."""
    hoje = datetime(2025, 1, 1)
    idade = random.randint(idade_min, idade_max)
    ano_nascimento = hoje.year - idade
    mes = random.randint(1, 12)
    dia = random.randint(1, 28)
    data = f"{ano_nascimento}-{mes:02d}-{dia:02d}"
    return data, idade

def escolher_partido_por_orientacao(orientacao: str) -> Dict:
    """Escolhe um partido baseado na orientação política."""
    siglas = PARTIDOS_POR_ORIENTACAO.get(orientacao, PARTIDOS_POR_ORIENTACAO["centro"])
    sigla = random.choice(siglas)
    for p in PARTIDOS:
        if p["sigla"] == sigla:
            return p
    return PARTIDOS[0]

def gerar_nome_completo(genero: str) -> tuple:
    """Gera nome completo e nome parlamentar."""
    if genero == "masculino":
        nome = random.choice(NOMES_MASCULINOS)
    else:
        nome = random.choice(NOMES_FEMININOS)

    sobrenome1 = random.choice(SOBRENOMES)
    sobrenome2 = random.choice(SOBRENOMES)

    # Evitar sobrenomes repetidos
    while sobrenome2 == sobrenome1:
        sobrenome2 = random.choice(SOBRENOMES)

    nome_completo = f"{nome} {sobrenome1} {sobrenome2}"

    # Nome parlamentar (pode ser apelido ou parte do nome)
    opcoes_nome_parlamentar = [
        nome,
        f"{nome} {sobrenome1}",
        f"{nome} {sobrenome2}",
        sobrenome1,
        sobrenome2,
    ]

    nome_parlamentar = random.choice(opcoes_nome_parlamentar)

    return nome_completo, nome_parlamentar

def gerar_historia_resumida(parlamentar: Dict, casa: str) -> str:
    """Gera história resumida do parlamentar."""
    cargo = "deputado federal" if casa == "camara_federal" else "senador"
    genero_artigo = "o" if parlamentar["genero"] == "masculino" else "a"

    profissao = parlamentar.get("profissao_anterior", "profissional")
    uf = parlamentar["uf"]
    partido = parlamentar["partido"]

    templates = [
        f"Natural de {parlamentar['naturalidade']}/{parlamentar['uf_nascimento']}, {parlamentar['nome_parlamentar']} é {profissao} de formação. Iniciou sua carreira política no {partido} e foi eleit{genero_artigo} {cargo} pelo {uf}. Atua principalmente nas áreas de {', '.join(parlamentar['temas_atuacao'][:2])}.",
        f"{parlamentar['nome_parlamentar']} construiu carreira como {profissao} antes de ingressar na política. Filiado ao {partido}, representa o estado de {uf} na Câmara dos Deputados. É conhecid{genero_artigo} por sua atuação em {', '.join(parlamentar['temas_atuacao'][:2])}.",
        f"Com formação em {parlamentar['formacao_academica'][0]}, {parlamentar['nome_parlamentar']} exerceu a profissão de {profissao} antes de se dedicar à vida política. Pelo {partido}, foi eleit{genero_artigo} para representar o {uf} no Congresso Nacional.",
    ]

    return random.choice(templates)

def gerar_instrucao_comportamental(parlamentar: Dict) -> str:
    """Gera instrução comportamental para o agente."""
    orientacao = parlamentar["orientacao_politica"]
    estilo = parlamentar.get("estilo_comunicacao", "articulado")

    instrucoes_base = {
        "direita": "Tom: conservador, defende valores tradicionais e liberdade econômica. Crítico a políticas de esquerda.",
        "centro-direita": "Tom: pragmático, foco em desenvolvimento econômico e segurança. Equilibrado em pautas de costumes.",
        "centro": "Tom: conciliador, busca consensos e evita polarização. Foco em gestão eficiente.",
        "centro-esquerda": "Tom: progressista moderado, defende direitos sociais com responsabilidade fiscal.",
        "esquerda": "Tom: progressista, defende direitos sociais, igualdade e políticas redistributivas."
    }

    base = instrucoes_base.get(orientacao, instrucoes_base["centro"])

    estilos = {
        "combativo": " Estilo direto e confrontador. Não evita polêmicas.",
        "articulado": " Estilo articulado, usa argumentos técnicos e dados.",
        "popular": " Linguagem simples e acessível. Conecta com a base popular.",
        "tecnico": " Foco em dados e análises técnicas. Evita emocionalismos.",
        "religioso": " Frequentemente cita valores religiosos e morais.",
        "emotivo": " Apela para emoções e histórias pessoais.",
        "pragmatico": " Foco em resultados práticos. Evita ideologismos.",
    }

    complemento = estilos.get(estilo, "")

    return base + complemento

def gerar_big_five() -> Dict:
    """Gera perfil Big Five de personalidade."""
    return {
        "abertura": random.randint(3, 9),
        "conscienciosidade": random.randint(4, 9),
        "extroversao": random.randint(4, 9),
        "amabilidade": random.randint(3, 8),
        "neuroticismo": random.randint(2, 7)
    }

def gerar_votacoes_importantes(orientacao: str) -> Dict:
    """Gera posições em votações importantes baseado na orientação."""
    votacoes = {}

    # Reforma tributária - maioria votou a favor
    votacoes["reforma_tributaria"] = random.choices(
        ["a_favor", "contra"],
        weights=[70, 30] if orientacao in ["centro", "centro-esquerda", "esquerda"] else [50, 50]
    )[0]

    # Marco temporal - direita/agro a favor
    votacoes["marco_temporal"] = random.choices(
        ["a_favor", "contra"],
        weights=[80, 20] if orientacao in ["direita", "centro-direita"] else [30, 70]
    )[0]

    # Reforma trabalhista
    votacoes["reforma_trabalhista"] = random.choices(
        ["a_favor", "contra"],
        weights=[80, 20] if orientacao in ["direita", "centro-direita", "centro"] else [20, 80]
    )[0]

    return votacoes

# =============================================================================
# GERAÇÃO DE DEPUTADOS FEDERAIS
# =============================================================================

def gerar_deputado_federal(id_seq: int, uf: str) -> Dict:
    """Gera um deputado federal para um estado específico."""

    # Gerar dados básicos
    genero = random.choices(["masculino", "feminino"], weights=[75, 25])[0]
    nome_completo, nome_parlamentar = gerar_nome_completo(genero)
    data_nascimento, idade = gerar_data_nascimento(30, 72)

    # Orientação política (distribuição aproximada real)
    orientacao = random.choices(
        ["direita", "centro-direita", "centro", "centro-esquerda", "esquerda"],
        weights=[25, 25, 20, 15, 15]
    )[0]

    # Partido baseado na orientação
    partido_info = escolher_partido_por_orientacao(orientacao)

    # Religião
    if partido_info["sigla"] in ["REPUBLICANOS", "PRD"]:
        religiao = random.choices(RELIGIOES, weights=[20, 60, 5, 5, 2, 5, 3])[0]
    elif orientacao == "esquerda":
        religiao = random.choices(RELIGIOES, weights=[40, 20, 10, 20, 2, 3, 5])[0]
    else:
        religiao = random.choices(RELIGIOES, weights=[50, 25, 8, 10, 2, 3, 2])[0]

    # Cor/raça (distribuição aproximada real)
    cor_raca = random.choices(CORES_RACAS, weights=[50, 35, 12, 2, 1])[0]

    # Naturalidade
    regiao = REGIAO_UF[uf]
    if random.random() < 0.7:  # 70% chance de ser do próprio estado
        naturalidade = random.choice(CIDADES_POR_UF[uf])
        uf_nascimento = uf
    else:
        uf_nascimento = random.choice(list(ESTADOS_DEPUTADOS.keys()))
        naturalidade = random.choice(CIDADES_POR_UF[uf_nascimento])

    # Formação e profissão
    formacao = random.choice(FORMACOES)
    if genero == "masculino":
        profissoes_possiveis = [p for p in PROFISSOES if not p.endswith("a") or p in ["Pecuarista", "Jornalista", "Dentista"]]
    else:
        profissoes_possiveis = [p for p in PROFISSOES if p.endswith("a") or p in ["Pecuarista", "Jornalista", "Dentista"]]
    profissao = random.choice(profissoes_possiveis) if profissoes_possiveis else random.choice(PROFISSOES)

    # Estado civil
    if genero == "masculino":
        estado_civil = random.choices(
            ["casado", "solteiro", "divorciado", "viuvo"],
            weights=[70, 15, 12, 3]
        )[0]
    else:
        estado_civil = random.choices(
            ["casada", "solteira", "divorciada", "viuva"],
            weights=[60, 20, 17, 3]
        )[0]

    # Posição política
    posicao_bolsonaro = {
        "direita": random.choices(
            ["apoiador_forte", "apoiador_moderado", "neutro"],
            weights=[60, 30, 10]
        )[0],
        "centro-direita": random.choices(
            ["apoiador_forte", "apoiador_moderado", "neutro", "critico_moderado"],
            weights=[20, 40, 30, 10]
        )[0],
        "centro": random.choices(
            ["apoiador_moderado", "neutro", "critico_moderado"],
            weights=[20, 50, 30]
        )[0],
        "centro-esquerda": random.choices(
            ["neutro", "critico_moderado", "critico_forte"],
            weights=[20, 40, 40]
        )[0],
        "esquerda": random.choices(
            ["critico_moderado", "critico_forte", "opositor_forte"],
            weights=[10, 40, 50]
        )[0],
    }.get(orientacao, "neutro")

    posicao_lula = {
        "direita": random.choices(
            ["opositor_forte", "critico_forte", "critico_moderado"],
            weights=[50, 35, 15]
        )[0],
        "centro-direita": random.choices(
            ["opositor_forte", "critico_forte", "critico_moderado", "neutro"],
            weights=[20, 30, 35, 15]
        )[0],
        "centro": random.choices(
            ["critico_moderado", "neutro", "apoiador_moderado"],
            weights=[30, 40, 30]
        )[0],
        "centro-esquerda": random.choices(
            ["neutro", "apoiador_moderado", "apoiador_forte"],
            weights=[20, 50, 30]
        )[0],
        "esquerda": random.choices(
            ["apoiador_moderado", "apoiador_forte"],
            weights=[30, 70]
        )[0],
    }.get(orientacao, "neutro")

    # Relação com governo
    relacao_governo = {
        "direita": "oposicao_forte",
        "centro-direita": random.choice(["oposicao_moderada", "independente"]),
        "centro": random.choice(["independente", "base_aliada"]),
        "centro-esquerda": random.choice(["base_aliada", "independente"]),
        "esquerda": "base_aliada",
    }.get(orientacao, "independente")

    # Comissões
    comissoes = random.sample(COMISSOES_CAMARA, random.randint(2, 4))

    # Frentes parlamentares
    frentes = random.sample(FRENTES_PARLAMENTARES, random.randint(2, 5))

    # Temas de atuação
    temas = random.sample(TEMAS_ATUACAO, random.randint(3, 5))

    # Valores, preocupações e medos
    valores = random.sample(VALORES, random.randint(4, 6))
    preocupacoes = random.sample(PREOCUPACOES, random.randint(3, 5))
    medos = random.sample(MEDOS, random.randint(2, 4))

    # Estilo de comunicação
    estilos = ["combativo", "articulado", "popular", "tecnico", "pragmatico"]
    if religiao == "evangelica":
        estilos.append("religioso")
    if orientacao in ["esquerda", "direita"]:
        estilos.append("combativo")
    estilo_comunicacao = random.choice(estilos)

    # Universidades
    universidades_regiao = UNIVERSIDADES.get(regiao, UNIVERSIDADES["SE"])
    universidades = [random.choice(universidades_regiao)]

    # Votos eleição (distribuição realista)
    votos_base = random.randint(30000, 200000)
    if uf in ["SP", "MG", "RJ", "BA"]:
        votos_base = random.randint(50000, 400000)
    elif uf in ["AC", "AP", "RR", "TO", "RO"]:
        votos_base = random.randint(15000, 80000)

    # Criar parlamentar
    parlamentar = {
        "id": f"dep-fed-{id_seq:04d}",
        "nome": nome_completo,
        "nome_parlamentar": nome_parlamentar,
        "idade": idade,
        "data_nascimento": data_nascimento,
        "genero": genero,
        "cor_raca": cor_raca,
        "naturalidade": naturalidade,
        "uf_nascimento": uf_nascimento,
        "uf": uf,
        "casa_legislativa": "camara_federal",
        "cargo": "deputado_federal" if genero == "masculino" else "deputada_federal",
        "partido": partido_info["sigla"],
        "numero_partido": partido_info["numero"],
        "mandato_inicio": "2023-02-01",
        "mandato_fim": "2027-01-31",
        "legislatura": 57,
        "votos_eleicao": votos_base,
        "foto_url": f"https://www.camara.leg.br/internet/deputado/bandep/placeholder_{id_seq}.jpg",
        "formacao_academica": formacao,
        "profissao_anterior": profissao,
        "carreira_profissional": f"{profissao} com atuação no {uf}",
        "historico_politico": [
            f"Deputado Federal pelo {uf} (2023-2027)"
        ],
        "comissoes_atuais": comissoes,
        "liderancas": [],
        "frentes_parlamentares": frentes,
        "temas_atuacao": temas,
        "projetos_lei_destaque": [],
        "base_eleitoral": f"Eleitores de {CAPITAIS[uf]} e região",
        "religiao": religiao,
        "estado_civil": estado_civil,
        "filhos": random.randint(0, 4),
        "orientacao_politica": orientacao,
        "posicao_bolsonaro": posicao_bolsonaro,
        "posicao_lula": posicao_lula,
        "interesse_politico": "alto",
        "tolerancia_nuance": random.choice(["baixa", "media", "alta"]),
        "estilo_decisao": random.choice(["identitario", "pragmatico", "moral", "economico"]),
        "estilo_comunicacao": estilo_comunicacao,
        "valores": valores,
        "preocupacoes": preocupacoes,
        "medos": medos,
        "vieses_cognitivos": random.sample(VIESES, random.randint(2, 4)),
        "fontes_informacao": random.sample(FONTES_INFO, random.randint(3, 5)),
        "aliancas_politicas": [partido_info["sigla"]],
        "relacao_governo_atual": relacao_governo,
        "email_contato": f"dep.{nome_parlamentar.lower().replace(' ', '')}@camara.leg.br",
        "telefone_gabinete": f"(61) 3215-{random.randint(1000, 9999)}",
        "gabinete_localizacao": f"Gabinete {random.randint(100, 999)} - Anexo IV",
        "redes_sociais": {
            "instagram": f"@{nome_parlamentar.lower().replace(' ', '')}",
            "twitter": f"@{nome_parlamentar.lower().replace(' ', '')[:15]}"
        },
        "criado_em": datetime.now().isoformat() + "Z",
        "atualizado_em": datetime.now().isoformat() + "Z",

        # Campos expandidos
        "signo": calcular_signo(data_nascimento),
        "local_residencia_atual": f"{CAPITAIS[uf]}, {uf}",
        "patrimonio_declarado": random.randint(500000, 10000000),
        "evolucao_patrimonial_percentual": random.uniform(5, 80),
        "escolaridade_nivel": random.choice(["superior", "pos_graduacao", "mestrado", "doutorado"]),
        "universidades": universidades,
        "idiomas": ["portugues"] + (["ingles"] if random.random() > 0.4 else []) + (["espanhol"] if random.random() > 0.7 else []),
        "hobbies": random.sample(["leitura", "esporte", "música", "viagens", "família", "futebol", "religião"], 3),
        "taxa_presenca_plenario": round(random.uniform(70, 98), 1),
        "total_projetos_autoria": random.randint(20, 200),
        "projetos_aprovados": random.randint(1, 30),
        "projetos_em_tramitacao": random.randint(10, 80),
        "votacoes_importantes": gerar_votacoes_importantes(orientacao),
        "gastos_gabinete_mensal": random.randint(50000, 100000),
        "viagens_oficiais_ano": random.randint(3, 25),
        "assessores_quantidade": random.randint(15, 25),
        "processos_judiciais": [],
        "processos_tse": [],
        "investigacoes_em_curso": [],
        "condenacoes": [],
        "ficha_limpa": True,
        "seguidores_total": random.randint(10000, 500000),
        "engajamento_redes": random.choice(["baixo", "medio", "alto"]),
        "mencoes_midia_mes": random.randint(5, 100),
        "tom_cobertura_midia": random.choice(["positivo", "neutro", "negativo", "polarizado"]),
        "fake_news_associadas": random.random() < 0.1,
        "influencia_digital": random.choice(["baixa", "media", "alta"]),
        "big_five": gerar_big_five(),
        "motivacao_primaria": random.choice(["ideologia", "poder", "servico", "fama"]),
        "estilo_lideranca": random.choice(["autoritario", "democratico", "carismatico", "pragmatico"]),
        "nivel_carisma": random.randint(3, 9),
        "inteligencia_emocional": random.randint(4, 9),
        "resiliencia_crises": random.choice(["media", "alta", "muito_alta"]),
        "tendencia_populismo": random.randint(2, 9),
        "influencia_no_partido": random.randint(3, 8),
        "capital_politico": random.choice(["baixo", "medio", "alto"]),
        "rede_apoiadores_chave": [partido_info["sigla"]],
        "adversarios_politicos": [],
        "mentores_politicos": [],
        "apadrinhados": [],
        "controversias_principais": [],
        "declaracoes_polemicas": [],
        "escandalos": []
    }

    # Gerar história e instrução
    parlamentar["historia_resumida"] = gerar_historia_resumida(parlamentar, "camara_federal")
    parlamentar["instrucao_comportamental"] = gerar_instrucao_comportamental(parlamentar)

    return parlamentar

# =============================================================================
# GERAÇÃO DE SENADORES
# =============================================================================

def gerar_senador(id_seq: int, uf: str, posicao: int) -> Dict:
    """Gera um senador para um estado específico."""

    # Gerar dados básicos
    genero = random.choices(["masculino", "feminino"], weights=[80, 20])[0]
    nome_completo, nome_parlamentar = gerar_nome_completo(genero)
    data_nascimento, idade = gerar_data_nascimento(35, 75)

    # Orientação política (distribuição aproximada real)
    orientacao = random.choices(
        ["direita", "centro-direita", "centro", "centro-esquerda", "esquerda"],
        weights=[20, 25, 25, 15, 15]
    )[0]

    # Partido baseado na orientação
    partido_info = escolher_partido_por_orientacao(orientacao)

    # Religião
    if partido_info["sigla"] in ["REPUBLICANOS", "PRD"]:
        religiao = random.choices(RELIGIOES, weights=[20, 60, 5, 5, 2, 5, 3])[0]
    elif orientacao == "esquerda":
        religiao = random.choices(RELIGIOES, weights=[40, 20, 10, 20, 2, 3, 5])[0]
    else:
        religiao = random.choices(RELIGIOES, weights=[50, 25, 8, 10, 2, 3, 2])[0]

    # Cor/raça
    cor_raca = random.choices(CORES_RACAS, weights=[55, 30, 12, 2, 1])[0]

    # Naturalidade
    regiao = REGIAO_UF[uf]
    if random.random() < 0.65:
        naturalidade = random.choice(CIDADES_POR_UF[uf])
        uf_nascimento = uf
    else:
        uf_nascimento = random.choice(list(ESTADOS_DEPUTADOS.keys()))
        naturalidade = random.choice(CIDADES_POR_UF[uf_nascimento])

    # Formação e profissão
    formacao = random.choice(FORMACOES)
    if genero == "masculino":
        profissoes_possiveis = [p for p in PROFISSOES if not p.endswith("a") or p in ["Pecuarista", "Jornalista", "Dentista"]]
    else:
        profissoes_possiveis = [p for p in PROFISSOES if p.endswith("a") or p in ["Pecuarista", "Jornalista", "Dentista"]]
    profissao = random.choice(profissoes_possiveis) if profissoes_possiveis else random.choice(PROFISSOES)

    # Estado civil
    if genero == "masculino":
        estado_civil = random.choices(
            ["casado", "solteiro", "divorciado", "viuvo"],
            weights=[75, 10, 12, 3]
        )[0]
    else:
        estado_civil = random.choices(
            ["casada", "solteira", "divorciada", "viuva"],
            weights=[65, 15, 17, 3]
        )[0]

    # Posição política
    posicao_bolsonaro = {
        "direita": random.choices(
            ["apoiador_forte", "apoiador_moderado", "neutro"],
            weights=[60, 30, 10]
        )[0],
        "centro-direita": random.choices(
            ["apoiador_forte", "apoiador_moderado", "neutro", "critico_moderado"],
            weights=[20, 40, 30, 10]
        )[0],
        "centro": random.choices(
            ["apoiador_moderado", "neutro", "critico_moderado"],
            weights=[20, 50, 30]
        )[0],
        "centro-esquerda": random.choices(
            ["neutro", "critico_moderado", "critico_forte"],
            weights=[20, 40, 40]
        )[0],
        "esquerda": random.choices(
            ["critico_moderado", "critico_forte", "opositor_forte"],
            weights=[10, 40, 50]
        )[0],
    }.get(orientacao, "neutro")

    posicao_lula = {
        "direita": random.choices(
            ["opositor_forte", "critico_forte", "critico_moderado"],
            weights=[50, 35, 15]
        )[0],
        "centro-direita": random.choices(
            ["opositor_forte", "critico_forte", "critico_moderado", "neutro"],
            weights=[20, 30, 35, 15]
        )[0],
        "centro": random.choices(
            ["critico_moderado", "neutro", "apoiador_moderado"],
            weights=[30, 40, 30]
        )[0],
        "centro-esquerda": random.choices(
            ["neutro", "apoiador_moderado", "apoiador_forte"],
            weights=[20, 50, 30]
        )[0],
        "esquerda": random.choices(
            ["apoiador_moderado", "apoiador_forte"],
            weights=[30, 70]
        )[0],
    }.get(orientacao, "neutro")

    # Relação com governo
    relacao_governo = {
        "direita": "oposicao_forte",
        "centro-direita": random.choice(["oposicao_moderada", "independente"]),
        "centro": random.choice(["independente", "base_aliada"]),
        "centro-esquerda": random.choice(["base_aliada", "independente"]),
        "esquerda": "base_aliada",
    }.get(orientacao, "independente")

    # Mandato (senadores têm mandatos de 8 anos, eleições intercaladas)
    # Posição 1 e 2: eleitos em 2018 (mandato até 2027)
    # Posição 3: eleitos em 2022 (mandato até 2031)
    if posicao <= 2:
        mandato_inicio = "2019-02-01"
        mandato_fim = "2027-01-31"
        legislatura = 56
    else:
        mandato_inicio = "2023-02-01"
        mandato_fim = "2031-01-31"
        legislatura = 57

    # Comissões
    comissoes = random.sample(COMISSOES_SENADO, random.randint(2, 4))

    # Frentes parlamentares
    frentes = random.sample(FRENTES_PARLAMENTARES, random.randint(2, 5))

    # Temas de atuação
    temas = random.sample(TEMAS_ATUACAO, random.randint(3, 5))

    # Valores, preocupações e medos
    valores = random.sample(VALORES, random.randint(4, 6))
    preocupacoes = random.sample(PREOCUPACOES, random.randint(3, 5))
    medos = random.sample(MEDOS, random.randint(2, 4))

    # Estilo de comunicação
    estilos = ["combativo", "articulado", "popular", "tecnico", "pragmatico"]
    if religiao == "evangelica":
        estilos.append("religioso")
    estilo_comunicacao = random.choice(estilos)

    # Universidades
    universidades_regiao = UNIVERSIDADES.get(regiao, UNIVERSIDADES["SE"])
    universidades = [random.choice(universidades_regiao)]

    # Votos eleição (senadores geralmente têm mais votos)
    votos_base = random.randint(500000, 3000000)
    if uf in ["SP", "MG", "RJ", "BA"]:
        votos_base = random.randint(2000000, 10000000)
    elif uf in ["AC", "AP", "RR", "TO", "RO"]:
        votos_base = random.randint(100000, 500000)

    # Criar parlamentar
    parlamentar = {
        "id": f"sen-{id_seq:03d}",
        "nome": nome_completo,
        "nome_parlamentar": nome_parlamentar,
        "idade": idade,
        "data_nascimento": data_nascimento,
        "genero": genero,
        "cor_raca": cor_raca,
        "naturalidade": naturalidade,
        "uf_nascimento": uf_nascimento,
        "uf": uf,
        "casa_legislativa": "senado",
        "cargo": "senador" if genero == "masculino" else "senadora",
        "partido": partido_info["sigla"],
        "numero_partido": partido_info["numero"],
        "mandato_inicio": mandato_inicio,
        "mandato_fim": mandato_fim,
        "legislatura": legislatura,
        "votos_eleicao": votos_base,
        "foto_url": f"https://www.senado.leg.br/senadores/img/fotos-oficiais/placeholder_{id_seq}.jpg",
        "formacao_academica": formacao,
        "profissao_anterior": profissao,
        "carreira_profissional": f"{profissao} com atuação no {uf}",
        "historico_politico": [
            f"Senador pelo {uf} ({mandato_inicio[:4]}-{mandato_fim[:4]})"
        ],
        "comissoes_atuais": comissoes,
        "liderancas": [],
        "frentes_parlamentares": frentes,
        "temas_atuacao": temas,
        "projetos_lei_destaque": [],
        "base_eleitoral": f"Eleitores de {CAPITAIS[uf]} e região",
        "religiao": religiao,
        "estado_civil": estado_civil,
        "filhos": random.randint(0, 4),
        "orientacao_politica": orientacao,
        "posicao_bolsonaro": posicao_bolsonaro,
        "posicao_lula": posicao_lula,
        "interesse_politico": "alto",
        "tolerancia_nuance": random.choice(["baixa", "media", "alta"]),
        "estilo_decisao": random.choice(["identitario", "pragmatico", "moral", "economico"]),
        "estilo_comunicacao": estilo_comunicacao,
        "valores": valores,
        "preocupacoes": preocupacoes,
        "medos": medos,
        "vieses_cognitivos": random.sample(VIESES, random.randint(2, 4)),
        "fontes_informacao": random.sample(FONTES_INFO, random.randint(3, 5)),
        "aliancas_politicas": [partido_info["sigla"]],
        "relacao_governo_atual": relacao_governo,
        "email_contato": f"sen.{nome_parlamentar.lower().replace(' ', '')}@senado.leg.br",
        "telefone_gabinete": f"(61) 3303-{random.randint(1000, 9999)}",
        "gabinete_localizacao": f"Senado Federal Anexo {random.randint(1, 2)}",
        "redes_sociais": {
            "instagram": f"@sen{nome_parlamentar.lower().replace(' ', '')}",
            "twitter": f"@sen{nome_parlamentar.lower().replace(' ', '')[:12]}"
        },
        "criado_em": datetime.now().isoformat() + "Z",
        "atualizado_em": datetime.now().isoformat() + "Z",

        # Campos expandidos
        "signo": calcular_signo(data_nascimento),
        "local_residencia_atual": f"{CAPITAIS[uf]}, {uf}",
        "patrimonio_declarado": random.randint(1000000, 20000000),
        "evolucao_patrimonial_percentual": random.uniform(5, 100),
        "escolaridade_nivel": random.choice(["superior", "pos_graduacao", "mestrado", "doutorado"]),
        "universidades": universidades,
        "idiomas": ["portugues"] + (["ingles"] if random.random() > 0.3 else []) + (["espanhol"] if random.random() > 0.6 else []),
        "hobbies": random.sample(["leitura", "esporte", "música", "viagens", "família", "futebol", "religião"], 3),
        "taxa_presenca_plenario": round(random.uniform(75, 98), 1),
        "total_projetos_autoria": random.randint(50, 300),
        "projetos_aprovados": random.randint(5, 50),
        "projetos_em_tramitacao": random.randint(20, 100),
        "votacoes_importantes": gerar_votacoes_importantes(orientacao),
        "gastos_gabinete_mensal": random.randint(70000, 150000),
        "viagens_oficiais_ano": random.randint(5, 30),
        "assessores_quantidade": random.randint(20, 30),
        "processos_judiciais": [],
        "processos_tse": [],
        "investigacoes_em_curso": [],
        "condenacoes": [],
        "ficha_limpa": True,
        "seguidores_total": random.randint(50000, 2000000),
        "engajamento_redes": random.choice(["baixo", "medio", "alto", "muito_alto"]),
        "mencoes_midia_mes": random.randint(10, 200),
        "tom_cobertura_midia": random.choice(["positivo", "neutro", "negativo", "polarizado"]),
        "fake_news_associadas": random.random() < 0.15,
        "influencia_digital": random.choice(["media", "alta", "muito_alta"]),
        "big_five": gerar_big_five(),
        "motivacao_primaria": random.choice(["ideologia", "poder", "servico"]),
        "estilo_lideranca": random.choice(["autoritario", "democratico", "carismatico", "pragmatico"]),
        "nivel_carisma": random.randint(4, 9),
        "inteligencia_emocional": random.randint(5, 9),
        "resiliencia_crises": random.choice(["media", "alta", "muito_alta"]),
        "tendencia_populismo": random.randint(2, 8),
        "influencia_no_partido": random.randint(5, 9),
        "capital_politico": random.choice(["medio", "alto", "muito_alto"]),
        "rede_apoiadores_chave": [partido_info["sigla"]],
        "adversarios_politicos": [],
        "mentores_politicos": [],
        "apadrinhados": [],
        "controversias_principais": [],
        "declaracoes_polemicas": [],
        "escandalos": []
    }

    # Gerar história e instrução
    parlamentar["historia_resumida"] = gerar_historia_resumida(parlamentar, "senado")
    parlamentar["instrucao_comportamental"] = gerar_instrucao_comportamental(parlamentar)

    return parlamentar

# =============================================================================
# FUNÇÃO PRINCIPAL
# =============================================================================

def main():
    """Função principal para gerar todos os parlamentares."""
    print("=" * 60)
    print("GERADOR DE PARLAMENTARES DO CONGRESSO NACIONAL")
    print("=" * 60)

    deputados = []
    senadores = []

    # Gerar deputados federais
    print("\n[*] Gerando Deputados Federais...")
    id_deputado = 1
    for uf, quantidade in ESTADOS_DEPUTADOS.items():
        print(f"  {uf}: {quantidade} deputados")
        for _ in range(quantidade):
            deputado = gerar_deputado_federal(id_deputado, uf)
            deputados.append(deputado)
            id_deputado += 1

    print(f"\n[OK] Total de Deputados Federais gerados: {len(deputados)}")

    # Gerar senadores (3 por estado)
    print("\n[*] Gerando Senadores...")
    id_senador = 1
    for uf in sorted(ESTADOS_DEPUTADOS.keys()):
        print(f"  {uf}: 3 senadores")
        for posicao in range(1, 4):
            senador = gerar_senador(id_senador, uf, posicao)
            senadores.append(senador)
            id_senador += 1

    print(f"\n[OK] Total de Senadores gerados: {len(senadores)}")

    # Diretório de saída
    output_dir = os.path.dirname(os.path.abspath(__file__))
    agentes_dir = os.path.join(os.path.dirname(output_dir), "agentes")
    frontend_data_dir = os.path.join(os.path.dirname(output_dir), "frontend", "public", "data")

    # Criar diretórios se não existirem
    os.makedirs(agentes_dir, exist_ok=True)
    os.makedirs(frontend_data_dir, exist_ok=True)

    # Salvar arquivos JSON
    print("\n[SAVE] Salvando arquivos...")

    # Deputados federais
    deputados_path = os.path.join(agentes_dir, "banco-deputados-federais.json")
    with open(deputados_path, 'w', encoding='utf-8') as f:
        json.dump(deputados, f, ensure_ascii=False, indent=2)
    print(f"  [OK] {deputados_path}")

    # Senadores
    senadores_path = os.path.join(agentes_dir, "banco-senadores.json")
    with open(senadores_path, 'w', encoding='utf-8') as f:
        json.dump(senadores, f, ensure_ascii=False, indent=2)
    print(f"  [OK] {senadores_path}")

    # Copiar para frontend/public/data
    frontend_deputados_path = os.path.join(frontend_data_dir, "banco-deputados-federais.json")
    with open(frontend_deputados_path, 'w', encoding='utf-8') as f:
        json.dump(deputados, f, ensure_ascii=False, indent=2)
    print(f"  [OK] {frontend_deputados_path}")

    frontend_senadores_path = os.path.join(frontend_data_dir, "banco-senadores.json")
    with open(frontend_senadores_path, 'w', encoding='utf-8') as f:
        json.dump(senadores, f, ensure_ascii=False, indent=2)
    print(f"  [OK] {frontend_senadores_path}")

    # Estatísticas
    print("\n" + "=" * 60)
    print("ESTATÍSTICAS")
    print("=" * 60)

    # Deputados por estado
    print("\n[STATS] Deputados por Estado:")
    deps_por_uf = {}
    for d in deputados:
        uf = d["uf"]
        deps_por_uf[uf] = deps_por_uf.get(uf, 0) + 1
    for uf in sorted(deps_por_uf.keys()):
        print(f"  {uf}: {deps_por_uf[uf]}")

    # Senadores por estado
    print("\n[STATS] Senadores por Estado:")
    sens_por_uf = {}
    for s in senadores:
        uf = s["uf"]
        sens_por_uf[uf] = sens_por_uf.get(uf, 0) + 1
    for uf in sorted(sens_por_uf.keys()):
        print(f"  {uf}: {sens_por_uf[uf]}")

    # Partidos
    print("\n[STATS] Parlamentares por Partido:")
    todos = deputados + senadores
    por_partido = {}
    for p in todos:
        partido = p["partido"]
        por_partido[partido] = por_partido.get(partido, 0) + 1
    for partido, qtd in sorted(por_partido.items(), key=lambda x: -x[1]):
        print(f"  {partido}: {qtd}")

    # Gênero
    print("\n[STATS] Parlamentares por Gênero:")
    por_genero = {}
    for p in todos:
        genero = p["genero"]
        por_genero[genero] = por_genero.get(genero, 0) + 1
    for genero, qtd in por_genero.items():
        percentual = (qtd / len(todos)) * 100
        print(f"  {genero}: {qtd} ({percentual:.1f}%)")

    # Orientação política
    print("\n[STATS] Parlamentares por Orientação Política:")
    por_orientacao = {}
    for p in todos:
        orientacao = p["orientacao_politica"]
        por_orientacao[orientacao] = por_orientacao.get(orientacao, 0) + 1
    for orientacao, qtd in sorted(por_orientacao.items()):
        percentual = (qtd / len(todos)) * 100
        print(f"  {orientacao}: {qtd} ({percentual:.1f}%)")

    print("\n" + "=" * 60)
    print(f"TOTAL: {len(deputados)} Deputados + {len(senadores)} Senadores = {len(todos)} Parlamentares")
    print("=" * 60)
    print("\n[OK] Geração concluída com sucesso!")

if __name__ == "__main__":
    main()
