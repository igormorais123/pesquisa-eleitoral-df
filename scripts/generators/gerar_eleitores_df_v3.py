"""
Gerador de Eleitores Sintéticos do DF v3.0
Corrigido com base em análise detalhada - histórias narrativas, SIA, acentuação.
"""

import json
import random

random.seed(42)

# ========================================
# RAs E CLUSTERS - SIA REMOVIDO (não residencial)
# ========================================
# SIA tem 1 eleitor que vai para Guará (vizinho residencial)
RAS = [
    ("Ceilândia", 41, "G3_media_baixa"),
    ("Samambaia", 31, "G3_media_baixa"),
    ("Plano Piloto", 28, "G1_alta"),
    ("Taguatinga", 27, "G2_media_alta"),
    ("Planaltina", 26, "G4_baixa"),
    ("Gama", 20, "G3_media_baixa"),
    ("Águas Claras", 19, "G1_alta"),
    ("Guará", 18, "G2_media_alta"),  # +1 do SIA
    ("Santa Maria", 17, "G3_media_baixa"),
    ("Recanto das Emas", 17, "G4_baixa"),
    ("Sol Nascente/Pôr do Sol", 15, "G4_baixa"),
    ("São Sebastião", 14, "G4_baixa"),
    ("Vicente Pires", 14, "G2_media_alta"),
    ("Sobradinho II", 12, "G3_media_baixa"),
    ("Jardim Botânico", 12, "G1_alta"),
    ("Sobradinho", 10, "G2_media_alta"),
    ("Riacho Fundo II", 9, "G4_baixa"),
    ("Itapoã", 9, "G4_baixa"),
    ("Paranoá", 9, "G4_baixa"),
    ("Brazlândia", 8, "G4_baixa"),
    ("Sudoeste/Octogonal", 6, "G1_alta"),
    ("Arniqueira", 6, "G2_media_alta"),
    ("Riacho Fundo", 5, "G3_media_baixa"),
    ("SCIA/Estrutural", 5, "G4_baixa"),
    ("Lago Norte", 4, "G1_alta"),
    ("Lago Sul", 4, "G1_alta"),
    ("Cruzeiro", 4, "G2_media_alta"),
    ("Park Way", 3, "G1_alta"),
    ("Núcleo Bandeirante", 3, "G2_media_alta"),
    ("Candangolândia", 2, "G2_media_alta"),
    ("Fercal", 1, "G4_baixa"),
    ("Varjão", 1, "G4_baixa"),
    # SIA REMOVIDO - não é área residencial
]

# Cotas cruzadas (ajustadas: G2 ganha +1 do SIA)
CLUSTER_RENDA = {
    "G1_alta": {"mais_de_5_ate_10": 8, "mais_de_10_ate_20": 45, "mais_de_20": 23},
    "G2_media_alta": {
        "mais_de_1_ate_2": 6,
        "mais_de_2_ate_5": 29,
        "mais_de_5_ate_10": 41,
        "mais_de_10_ate_20": 9,
    },  # +1 em 2-5
    "G3_media_baixa": {
        "ate_1": 10,
        "mais_de_1_ate_2": 35,
        "mais_de_2_ate_5": 71,
        "mais_de_5_ate_10": 10,
    },
    "G4_baixa": {
        "ate_1": 22,
        "mais_de_1_ate_2": 42,
        "mais_de_2_ate_5": 32,
        "mais_de_5_ate_10": 18,
    },
}

CLUSTER_ESCOLARIDADE = {
    "G1_alta": {
        "superior_completo_ou_pos": 64,
        "medio_completo_ou_sup_incompleto": 12,
        "fundamental_ou_sem_instrucao": 0,
    },
    "G2_media_alta": {
        "superior_completo_ou_pos": 52,
        "medio_completo_ou_sup_incompleto": 31,
        "fundamental_ou_sem_instrucao": 2,
    },  # +1 em medio
    "G3_media_baixa": {
        "superior_completo_ou_pos": 24,
        "medio_completo_ou_sup_incompleto": 82,
        "fundamental_ou_sem_instrucao": 20,
    },
    "G4_baixa": {
        "superior_completo_ou_pos": 8,
        "medio_completo_ou_sup_incompleto": 56,
        "fundamental_ou_sem_instrucao": 50,
    },
}

CLUSTER_RELIGIAO = {
    "G1_alta": {
        "catolica": 28,
        "evangelica": 10,
        "sem_religiao": 18,
        "espirita": 6,
        "umbanda_candomble": 1,
        "outras_religioes": 13,
    },
    "G2_media_alta": {
        "catolica": 41,
        "evangelica": 20,
        "sem_religiao": 12,
        "espirita": 5,
        "umbanda_candomble": 1,
        "outras_religioes": 6,
    },  # +1 catolica
    "G3_media_baixa": {
        "catolica": 68,
        "evangelica": 47,
        "sem_religiao": 7,
        "espirita": 1,
        "umbanda_candomble": 1,
        "outras_religioes": 2,
    },
    "G4_baixa": {
        "catolica": 63,
        "evangelica": 40,
        "sem_religiao": 8,
        "espirita": 1,
        "umbanda_candomble": 1,
        "outras_religioes": 1,
    },
}

COTAS_GENERO = {"feminino": 217, "masculino": 183}
COTAS_IDADE = {"16-24": 56, "25-34": 84, "35-44": 92, "45-59": 96, "60+": 72}
COTAS_COR_RACA = {"parda": 195, "branca": 159, "preta": 43, "amarela": 2, "indigena": 1}

# ========================================
# METRÔ E LOCAIS DE REFERÊNCIA
# ========================================
# RAs com acesso real ao metrô do DF
RAS_COM_METRO = {
    "Águas Claras",
    "Taguatinga",
    "Ceilândia",  # Linha Verde
    "Samambaia",
    "Guará",  # Linha Laranja
    "Plano Piloto",  # Estações centrais (Asa Sul/Norte)
}

# Locais de referência para verossimilhança nas narrativas
LOCAIS_REFERENCIA = {
    "Ceilândia": [
        "perto do P Sul",
        "na Guariroba",
        "no Setor O",
        "na QNM",
        "na QNN",
        "perto da Hélio Prates",
    ],
    "Samambaia": [
        "na QR",
        "perto da Feira",
        "no Setor de Mansões",
        "na QS",
        "perto do terminal",
    ],
    "Plano Piloto": [
        "nas quadras 400 Norte",
        "na W3 Sul",
        "perto do Parque da Cidade",
        "na Asa Norte",
        "na Asa Sul",
        "no Sudoeste",
    ],
    "Taguatinga": [
        "no Centro",
        "na QSC",
        "perto do Taguaparque",
        "na QSD",
        "na Avenida Comercial",
    ],
    "Planaltina": [
        "no Setor Tradicional",
        "na Vila Buritis",
        "no Arapoanga",
        "perto da praça",
    ],
    "Gama": ["no Setor Leste", "no Setor Oeste", "perto do DVO", "na Ponte Alta"],
    "Águas Claras": [
        "perto do metrô",
        "na Avenida das Araucárias",
        "no Norte",
        "no Sul",
    ],
    "Guará": ["no Guará I", "no Guará II", "perto do Park Shopping", "na QE"],
    "Santa Maria": [
        "no Centro",
        "na QR",
        "perto do terminal",
        "no Condomínio Porto Rico",
    ],
    "Recanto das Emas": ["na QR", "perto da feira", "no Vargem da Bênção"],
    "Sol Nascente/Pôr do Sol": [
        "no Trecho 1",
        "no Trecho 2",
        "no Trecho 3",
        "perto da escola",
    ],
    "São Sebastião": ["no Centro", "no Bairro São José", "no Morro da Cruz"],
    "Vicente Pires": ["na Rua 3", "na Rua 8", "na Rua 12", "perto do Jóquei"],
    "Sobradinho II": ["perto da feira", "no AR 10", "na quadra central"],
    "Jardim Botânico": [
        "nos condomínios",
        "perto do Jardim Botânico",
        "no São Bartolomeu",
    ],
    "Sobradinho": ["no Centro", "perto da rodoviária", "na quadra 8"],
    "Riacho Fundo II": ["na QC", "na QN", "perto do terminal"],
    "Itapoã": ["na Del Lago", "no Itapoã I", "no Itapoã II"],
    "Paranoá": ["no Paranoá Velho", "no Paranoá Novo", "perto do lago"],
    "Brazlândia": ["no Centro", "no Setor Tradicional", "perto da Vila São José"],
    "Sudoeste/Octogonal": ["no Sudoeste", "na Octogonal", "perto do Parque da Cidade"],
    "Arniqueira": [
        "perto do Pistão Sul",
        "na Colônia Agrícola",
        "no setor de chácaras",
    ],
    "Riacho Fundo": ["no Centro", "perto do terminal", "na QN"],
    "SCIA/Estrutural": ["na Cidade Estrutural", "no SCIA", "perto do lixão antigo"],
    "Lago Norte": ["no MI", "perto do Pontão", "na QL"],
    "Lago Sul": ["na QL", "perto do Gilberto Salomão", "no SHIS"],
    "Cruzeiro": ["no Cruzeiro Velho", "no Cruzeiro Novo", "perto do Sudoeste"],
    "Park Way": ["nas mansões", "perto da Ponte JK", "na quadra 29"],
    "Núcleo Bandeirante": ["no Centro", "perto da Feira do Núcleo", "na 3ª Avenida"],
    "Candangolândia": ["no Centro", "perto do terminal", "na quadra 1"],
    "Fercal": ["no Centro", "perto da fábrica de cimento"],
    "Varjão": ["no Centro", "perto da entrada"],
}

# ========================================
# NOMES COM ACENTUAÇÃO CORRETA
# ========================================
NOMES_F = [
    "Maria",
    "Ana",
    "Francisca",
    "Adriana",
    "Juliana",
    "Fernanda",
    "Patrícia",
    "Aline",
    "Sandra",
    "Camila",
    "Amanda",
    "Bruna",
    "Jéssica",
    "Letícia",
    "Luciana",
    "Vanessa",
    "Carla",
    "Renata",
    "Daniela",
    "Simone",
    "Cláudia",
    "Vera",
    "Rosa",
    "Rita",
    "Tereza",
    "Lúcia",
    "Helena",
    "Marta",
    "Sílvia",
    "Ângela",
    "Beatriz",
    "Larissa",
    "Priscila",
    "Rafaela",
    "Natália",
    "Carolina",
    "Gabriela",
    "Viviane",
    "Michele",
    "Débora",
    "Raquel",
    "Flávia",
    "Paula",
    "Aparecida",
    "Joana",
    "Marlene",
    "Sônia",
    "Regina",
    "Gisele",
    "Mariana",
    "Conceição",
    "Luíza",
    "Mônica",
    "Eliane",
    "Neide",
    "Rosângela",
    "Valdirene",
    "Célia",
]

NOMES_M = [
    "José",
    "João",
    "Antônio",
    "Francisco",
    "Carlos",
    "Paulo",
    "Pedro",
    "Lucas",
    "Luiz",
    "Marcos",
    "Gabriel",
    "Rafael",
    "Daniel",
    "Marcelo",
    "Bruno",
    "Eduardo",
    "Felipe",
    "Rodrigo",
    "Geraldo",
    "Luís",
    "Jorge",
    "André",
    "Fernando",
    "Roberto",
    "Sérgio",
    "Leandro",
    "Ricardo",
    "Fábio",
    "Alex",
    "Diego",
    "Thiago",
    "Mateus",
    "Gustavo",
    "Leonardo",
    "Vinícius",
    "Anderson",
    "Henrique",
    "Wagner",
    "Willian",
    "Wellington",
    "Rogério",
    "Gilberto",
    "Samuel",
    "Davi",
    "Caio",
    "Arthur",
    "Miguel",
    "Cícero",
    "Sebastião",
    "Raimundo",
    "Valdemir",
    "Edson",
    "Reginaldo",
    "Cléber",
]

SOBRENOMES = [
    "Silva",
    "Santos",
    "Oliveira",
    "Souza",
    "Rodrigues",
    "Ferreira",
    "Alves",
    "Pereira",
    "Lima",
    "Gomes",
    "Costa",
    "Ribeiro",
    "Martins",
    "Carvalho",
    "Almeida",
    "Lopes",
    "Soares",
    "Fernandes",
    "Vieira",
    "Barbosa",
    "Rocha",
    "Dias",
    "Nascimento",
    "Andrade",
    "Moreira",
    "Nunes",
    "Marques",
    "Machado",
    "Mendes",
    "Freitas",
    "Cardoso",
    "Ramos",
    "Gonçalves",
    "Santana",
    "Teixeira",
    "Araújo",
    "Pinto",
    "Correia",
    "Campos",
    "Borges",
    "Cunha",
    "Moura",
    "Castro",
    "Azevedo",
    "Batista",
    "Monteiro",
    "Reis",
    "Melo",
]

# ========================================
# PROFISSÕES COM VÍNCULO CORRETO
# ========================================
PROFISSOES = {
    "G1_alta": {
        "superior_completo_ou_pos": [
            ("Advogado(a)", "autonomo", 24),
            ("Médico(a)", "autonomo", 26),
            ("Engenheiro(a) Civil", "clt", 24),
            ("Juiz(a)", "servidor_publico", 30),
            ("Promotor(a) de Justiça", "servidor_publico", 30),
            ("Auditor(a) Fiscal", "servidor_publico", 26),
            ("Analista do Banco Central", "servidor_publico", 24),
            ("Diplomata", "servidor_publico", 28),
            ("Economista", "clt", 24),
            ("Arquiteto(a)", "autonomo", 24),
            ("Analista Judiciário", "servidor_publico", 24),
            ("Professor(a) Universitário(a)", "servidor_publico", 28),
            ("Administrador(a) de Empresas", "clt", 24),
            ("Contador(a)", "autonomo", 24),
            ("Analista de Sistemas", "clt", 24),
            ("Dentista", "autonomo", 25),
            ("Empresário(a)", "empresario", 26),
            ("Consultor(a) Empresarial", "autonomo", 28),
            ("Psicólogo(a)", "autonomo", 25),
            ("Analista Legislativo", "servidor_publico", 24),
        ],
        "medio_completo_ou_sup_incompleto": [
            ("Técnico(a) Judiciário", "servidor_publico", 20),
            ("Corretor(a) de Imóveis", "autonomo", 21),
            ("Estudante Universitário(a)", "estudante", 18),
            ("Assistente Administrativo", "clt", 19),
            ("Gerente Comercial", "clt", 25),
            ("Técnico(a) em Informática", "clt", 19),
            ("Representante Comercial", "autonomo", 22),
        ],
    },
    "G2_media_alta": {
        "superior_completo_ou_pos": [
            ("Professor(a)", "servidor_publico", 23),
            ("Enfermeiro(a)", "clt", 23),
            ("Analista Administrativo", "servidor_publico", 24),
            ("Contador(a)", "clt", 24),
            ("Engenheiro(a)", "clt", 24),
            ("Servidor(a) Público Federal", "servidor_publico", 22),
            ("Policial Federal", "servidor_publico", 23),
            ("Fisioterapeuta", "autonomo", 23),
            ("Nutricionista", "autonomo", 23),
            ("Farmacêutico(a)", "clt", 23),
            ("Assistente Social", "servidor_publico", 23),
            ("Analista de RH", "clt", 24),
            ("Gerente de Banco", "clt", 28),
            ("Designer", "autonomo", 22),
            ("Jornalista", "clt", 23),
            ("Analista do INSS", "servidor_publico", 24),
        ],
        "medio_completo_ou_sup_incompleto": [
            ("Técnico(a) de Enfermagem", "clt", 20),
            ("Policial Militar", "servidor_publico", 20),
            ("Bombeiro Militar", "servidor_publico", 20),
            ("Técnico(a) Administrativo", "servidor_publico", 20),
            ("Auxiliar Administrativo", "clt", 18),
            ("Vendedor(a) de Loja", "clt", 18),
            ("Recepcionista", "clt", 18),
            ("Motorista de Aplicativo", "autonomo", 21),
            ("Estudante", "estudante", 16),
        ],
        "fundamental_ou_sem_instrucao": [
            ("Porteiro(a)", "clt", 18),
            ("Zelador(a)", "clt", 18),
        ],
    },
    "G3_media_baixa": {
        "superior_completo_ou_pos": [
            ("Professor(a) da Rede Pública", "servidor_publico", 23),
            ("Enfermeiro(a)", "clt", 23),
            ("Assistente Social", "servidor_publico", 23),
            ("Pedagogo(a)", "servidor_publico", 23),
            ("Analista de TI", "clt", 24),
            ("Advogado(a)", "autonomo", 25),
            ("Psicólogo(a)", "autonomo", 25),
        ],
        "medio_completo_ou_sup_incompleto": [
            ("Vendedor(a) de Loja", "clt", 18),
            ("Auxiliar Administrativo", "clt", 18),
            ("Técnico(a) de Enfermagem", "clt", 20),
            ("Motorista", "clt", 21),
            ("Caixa de Supermercado", "clt", 18),
            ("Atendente de Loja", "clt", 18),
            ("Balconista", "clt", 18),
            ("Recepcionista", "clt", 18),
            ("Operador(a) de Telemarketing", "clt", 18),
            ("Vigilante", "clt", 21),
            ("Porteiro(a)", "clt", 18),
            ("Mecânico(a)", "autonomo", 20),
            ("Eletricista", "autonomo", 20),
            ("Cabeleireiro(a)", "autonomo", 18),
            ("Manicure", "autonomo", 18),
            ("Barbeiro(a)", "autonomo", 18),
            ("Garçom/Garçonete", "clt", 18),
            ("Cozinheiro(a)", "clt", 18),
            ("Padeiro(a)", "clt", 18),
            ("Agente Comunitário de Saúde", "servidor_publico", 20),
            ("Estudante", "estudante", 16),
            ("Comerciante", "autonomo", 21),
        ],
        "fundamental_ou_sem_instrucao": [
            ("Diarista", "informal", 18),
            ("Auxiliar de Limpeza", "informal", 18),
            ("Ajudante de Pedreiro", "informal", 18),
            ("Servente de Obras", "informal", 18),
            ("Auxiliar de Serviços Gerais", "informal", 18),
            ("Catador(a) de Recicláveis", "informal", 18),
            ("Vendedor(a) Ambulante", "autonomo", 18),
            ("Cuidador(a) de Idosos", "informal", 20),
            ("Empregado(a) Doméstico(a)", "clt", 18),
            ("Jardineiro(a)", "autonomo", 18),
        ],
    },
    "G4_baixa": {
        "superior_completo_ou_pos": [
            ("Professor(a) da Rede Pública", "servidor_publico", 23),
            ("Enfermeiro(a)", "clt", 23),
            ("Assistente Social", "servidor_publico", 23),
            ("Pedagogo(a)", "servidor_publico", 23),
        ],
        "medio_completo_ou_sup_incompleto": [
            ("Vendedor(a)", "clt", 18),
            ("Auxiliar de Serviços Gerais", "clt", 18),
            ("Atendente", "clt", 18),
            ("Motorista de Ônibus", "clt", 21),
            ("Vigilante", "clt", 21),
            ("Balconista", "clt", 18),
            ("Cozinheiro(a)", "clt", 18),
            ("Garçom/Garçonete", "clt", 18),
            ("Cabeleireiro(a)", "autonomo", 18),
            ("Manicure", "autonomo", 18),
            ("Barbeiro(a)", "autonomo", 18),
            ("Motoboy", "autonomo", 18),
            ("Entregador(a) de App", "autonomo", 18),
            ("Pedreiro(a)", "autonomo", 18),
            ("Pintor(a)", "autonomo", 18),
            ("Eletricista", "autonomo", 20),
            ("Mecânico(a)", "autonomo", 20),
            ("Cobrador(a) de Ônibus", "clt", 18),
            ("Estudante", "estudante", 16),
            ("Comerciante Informal", "autonomo", 18),
        ],
        "fundamental_ou_sem_instrucao": [
            ("Diarista", "informal", 18),
            ("Auxiliar de Limpeza", "informal", 18),
            ("Ajudante de Pedreiro", "informal", 18),
            ("Servente de Obras", "informal", 18),
            ("Auxiliar de Serviços Gerais", "informal", 18),
            ("Catador(a) de Recicláveis", "informal", 18),
            ("Vendedor(a) Ambulante", "autonomo", 18),
            ("Empregado(a) Doméstico(a)", "clt", 18),
            ("Lavador(a) de Carros", "informal", 16),
            ("Trabalhador(a) Rural", "informal", 16),
            ("Cuidador(a) de Idosos", "informal", 20),
            ("Jardineiro(a)", "autonomo", 18),
            ("Feirante", "autonomo", 18),
            ("Gari", "clt", 18),
            ("Ajudante Geral", "informal", 16),
        ],
    },
}

# ========================================
# EVENTOS FORMADORES PARA HISTÓRIAS NARRATIVAS
# ========================================
EVENTOS_FORMADORES = {
    "G1_alta": [
        "passar em concurso público após anos de estudo",
        "herdar o negócio da família e modernizá-lo",
        "estudar fora do país e voltar com nova perspectiva",
        "ver os pais perderem tudo na hiperinflação dos anos 80",
        "construir carreira em empresa multinacional",
        "abrir o próprio escritório após anos como funcionário",
        "ser promovido(a) a cargo de chefia",
        "investir em imóveis e construir patrimônio",
    ],
    "G2_media_alta": [
        "ser aprovado(a) em concurso após muita luta",
        "conseguir bolsa de estudos e ser primeiro(a) da família a se formar",
        "começar de baixo e subir de cargo em empresa",
        "abrir pequeno negócio com economia de anos",
        "passar por demissão e se reinventar",
        "trabalhar e estudar ao mesmo tempo por anos",
        "conseguir financiar a casa própria com muito sacrifício",
        "entrar na polícia/bombeiros por vocação e estabilidade",
    ],
    "G3_media_baixa": [
        "migrar do Nordeste em busca de vida melhor",
        "criar os filhos sozinha após separação",
        "perder emprego na crise e virar autônomo",
        "trabalhar desde os 14 anos para ajudar em casa",
        "ver o bairro crescer junto com a cidade",
        "montar barbearia/salão no quintal de casa",
        "começar como ajudante e virar profissional",
        "ser demitido(a) e ter que se virar de qualquer jeito",
        "cuidar dos pais idosos enquanto trabalhava",
    ],
    "G4_baixa": [
        "chegar em Brasília ainda criança, fugindo da seca",
        "crescer em ocupação irregular que virou bairro",
        "perder parente para a violência",
        "ter que abandonar os estudos para trabalhar",
        "ser despejado(a) e ter que recomeçar do zero",
        "passar fome na infância e nunca esquecer",
        "trabalhar na roça desde criança",
        "ver o filho se envolver com o tráfico",
        "sobreviver de bicos desde sempre",
        "conseguir a casa pelo programa habitacional após anos de espera",
    ],
}

CRENCAS_POLITICAS = {
    "direita": [
        "que 'bandido bom é bandido morto'",
        "que 'cada um tem que se virar sozinho'",
        "que 'o governo só atrapalha quem quer trabalhar'",
        "que 'a família é a base de tudo'",
        "que 'tem muita gente que não quer trabalhar'",
        "que 'o Brasil precisa de mão firme'",
        "que 'imposto é roubo'",
    ],
    "centro-direita": [
        "que 'o mercado resolve melhor que o governo'",
        "que 'precisa ter ordem para ter progresso'",
        "que 'quem trabalha direito vence na vida'",
        "que 'o Estado tem que ser menor e mais eficiente'",
        "que 'segurança é prioridade'",
    ],
    "centro": [
        "que 'nenhum político presta'",
        "que 'tem que ter equilíbrio em tudo'",
        "que 'não adianta ficar brigando por político'",
        "que 'o importante é resolver os problemas'",
        "que 'extremismo não leva a nada'",
    ],
    "centro-esquerda": [
        "que 'educação é o caminho'",
        "que 'o Estado tem que dar oportunidade'",
        "que 'saúde e educação têm que ser para todos'",
        "que 'o Brasil tem muito potencial desperdiçado'",
        "que 'dá para crescer sem destruir o meio ambiente'",
    ],
    "esquerda": [
        "que 'o sistema é feito para o rico'",
        "que 'pobre só se ferra nesse país'",
        "que 'os direitos foram conquistados com luta'",
        "que 'tem que dividir melhor a riqueza'",
        "que 'a elite não quer ver o pobre subir'",
        "que 'o trabalhador é quem faz o país funcionar'",
    ],
}


# ========================================
# GERAÇÃO DE HISTÓRIA NARRATIVA
# ========================================
def gerar_historia_narrativa(
    nome,
    idade,
    genero,
    ra,
    cluster,
    profissao,
    vinculo,
    escolaridade,
    religiao,
    orientacao,
    estado_civil,
    filhos,
    posicao_bolsonaro,
    renda,
):
    """
    Gera história narrativa com estrutura:
    "[Nome] cresceu em [contexto]. A experiência de [evento] moldou sua visão.
    Hoje, [situação atual] reforça sua crença de que [proposição]."
    """
    primeiro_nome = nome.split()[0]

    # Origem
    if cluster in ["G3_media_baixa", "G4_baixa"] and random.random() < 0.4:
        origem = random.choice(
            [
                "veio do interior do Nordeste ainda criança",
                f"nasceu em {ra} quando ainda era tudo mato",
                "chegou em Brasília com a família nos anos 90",
                f"cresceu na periferia de {ra}",
            ]
        )
    else:
        origem = random.choice(
            [
                f"nasceu e cresceu em {ra}",
                f"mora em {ra} há mais de 20 anos",
                "veio de Goiás quando jovem",
                "é de família tradicional de Brasília",
            ]
        )

    # Evento formador
    eventos = EVENTOS_FORMADORES.get(cluster, EVENTOS_FORMADORES["G3_media_baixa"])
    evento = random.choice(eventos)

    # Situação atual
    if vinculo == "aposentado":
        situacao = "Hoje aposentado(a), vive com o benefício e ajuda da família"
    elif vinculo == "desempregado":
        situacao = "Atualmente desempregado(a), luta para encontrar trabalho"
    elif vinculo == "autonomo":
        situacao = f"Como {profissao.lower()}, vive da própria clientela"
    elif vinculo == "informal":
        situacao = "Trabalha sem carteira assinada para sobreviver"
    elif vinculo == "servidor_publico":
        situacao = (
            f"A estabilidade de servidor como {profissao.lower()} trouxe segurança"
        )
    elif vinculo == "empresario":
        situacao = "Tocando o próprio negócio com os riscos e recompensas"
    else:
        situacao = f"Trabalhando como {profissao.lower()}"

    # Crença política
    crencas = CRENCAS_POLITICAS.get(orientacao, CRENCAS_POLITICAS["centro"])
    crenca = random.choice(crencas)

    # Contexto familiar
    contexto_familiar = ""
    if filhos > 0:
        if estado_civil in ["casado(a)", "uniao_estavel"]:
            contexto_familiar = f"Casado(a) e com {filhos} filho(s), "
        else:
            contexto_familiar = f"Cria {filhos} filho(s) sozinho(a), "

    # Montar história
    historia = f"{primeiro_nome} {origem}. "
    historia += f"A experiência de {evento} moldou sua visão de mundo. "
    historia += f"{contexto_familiar}{situacao}. "
    historia += f"Acredita firmemente {crenca}."

    # Adicionar nota sobre Bolsonaro se relevante
    if posicao_bolsonaro == "apoiador_forte":
        historia += " É eleitor fiel de Bolsonaro."
    elif posicao_bolsonaro == "critico_forte":
        historia += " É crítico ferrenho de Bolsonaro."

    return historia


# ========================================
# SUSCEPTIBILIDADE COM GRADIENTE REALISTA
# ========================================
def calcular_susceptibilidade(escolaridade, fontes, idade, interesse_politico):
    """
    Calcula susceptibilidade com gradiente baseado em:
    - Escolaridade (maior = menor susceptibilidade)
    - Diversidade de fontes (mais fontes sérias = menor)
    - Idade (extremos mais vulneráveis)
    - Interesse político alto + viés = mais vulnerável a confirmação
    """
    base = 5.0

    # Escolaridade é fator forte
    if escolaridade == "superior_completo_ou_pos":
        base -= 1.5
    elif escolaridade == "fundamental_ou_sem_instrucao":
        base += 2.0

    # Fontes de informação
    fontes_serias = [
        "Folha",
        "Estadão",
        "G1",
        "Globo News",
        "Correio Braziliense",
        "Metrópoles",
        "CNN Brasil",
    ]
    fontes_risco = ["TikTok", "WhatsApp", "Kwai", "Facebook"]

    qtd_serias = sum(1 for f in fontes if any(s in f for s in fontes_serias))
    qtd_risco = sum(1 for f in fontes if any(r in f for r in fontes_risco))

    base -= qtd_serias * 0.5  # Fontes sérias reduzem
    base += qtd_risco * 0.4  # Fontes de risco aumentam

    # Idade
    if idade < 25 or idade >= 65:
        base += 0.5  # Jovens e idosos mais vulneráveis

    # Paradoxo do interesse alto
    if interesse_politico == "alto":
        base += 0.3  # Muito engajado tende a viés de confirmação
    elif interesse_politico == "baixo":
        base += 0.5  # Pouco interesse = menos checagem

    # Limitar entre 1-10
    return min(10, max(1, round(base + random.uniform(-0.5, 0.5))))


# ========================================
# ORIENTAÇÃO POLÍTICA E BOLSONARO
# ========================================
def gerar_orientacao_politica(cluster, religiao):
    if cluster == "G1_alta":
        pesos = {
            "esquerda": 12,
            "centro-esquerda": 18,
            "centro": 25,
            "centro-direita": 28,
            "direita": 17,
        }
    elif cluster == "G2_media_alta":
        pesos = {
            "esquerda": 10,
            "centro-esquerda": 18,
            "centro": 26,
            "centro-direita": 30,
            "direita": 16,
        }
    elif cluster == "G3_media_baixa":
        pesos = {
            "esquerda": 16,
            "centro-esquerda": 22,
            "centro": 24,
            "centro-direita": 22,
            "direita": 16,
        }
    else:
        pesos = {
            "esquerda": 18,
            "centro-esquerda": 22,
            "centro": 22,
            "centro-direita": 20,
            "direita": 18,
        }

    if religiao == "evangelica":
        pesos["direita"] = int(pesos["direita"] * 1.6)
        pesos["centro-direita"] = int(pesos["centro-direita"] * 1.3)
        pesos["esquerda"] = max(3, int(pesos["esquerda"] * 0.5))
        pesos["centro-esquerda"] = max(3, int(pesos["centro-esquerda"] * 0.7))
    elif religiao == "sem_religiao":
        pesos["esquerda"] = int(pesos["esquerda"] * 1.4)
        pesos["centro-esquerda"] = int(pesos["centro-esquerda"] * 1.3)
        pesos["direita"] = max(3, int(pesos["direita"] * 0.7))

    opcoes = list(pesos.keys())
    weights = [max(1, w) for w in pesos.values()]
    return random.choices(opcoes, weights=weights)[0]


def gerar_posicao_bolsonaro(cluster, religiao, orientacao, idade):
    if orientacao == "direita":
        pesos = {
            "apoiador_forte": 70,
            "apoiador_moderado": 25,
            "neutro": 4,
            "critico_moderado": 1,
            "critico_forte": 0,
        }
    elif orientacao == "centro-direita":
        pesos = {
            "apoiador_forte": 30,
            "apoiador_moderado": 50,
            "neutro": 15,
            "critico_moderado": 4,
            "critico_forte": 1,
        }
    elif orientacao == "centro":
        pesos = {
            "apoiador_forte": 12,
            "apoiador_moderado": 30,
            "neutro": 35,
            "critico_moderado": 18,
            "critico_forte": 5,
        }
    elif orientacao == "centro-esquerda":
        pesos = {
            "apoiador_forte": 3,
            "apoiador_moderado": 10,
            "neutro": 22,
            "critico_moderado": 40,
            "critico_forte": 25,
        }
    else:
        pesos = {
            "apoiador_forte": 1,
            "apoiador_moderado": 3,
            "neutro": 8,
            "critico_moderado": 28,
            "critico_forte": 60,
        }

    if religiao == "evangelica":
        pesos["apoiador_forte"] = int(pesos["apoiador_forte"] * 1.4)
        pesos["apoiador_moderado"] = int(pesos["apoiador_moderado"] * 1.2)
        pesos["critico_forte"] = max(1, int(pesos["critico_forte"] * 0.6))

    if cluster in ["G1_alta", "G2_media_alta"]:
        pesos["apoiador_moderado"] = int(pesos["apoiador_moderado"] * 1.15)

    opcoes = list(pesos.keys())
    weights = [max(1, w) for w in pesos.values()]
    return random.choices(opcoes, weights=weights)[0]


# ========================================
# VALORES E PREOCUPAÇÕES
# ========================================
VALORES = {
    "esquerda": [
        "Justiça social",
        "Igualdade",
        "Direitos trabalhistas",
        "Educação pública",
        "Saúde pública",
        "Meio ambiente",
        "Diversidade",
        "Democracia",
    ],
    "centro-esquerda": [
        "Educação de qualidade",
        "Saúde universal",
        "Sustentabilidade",
        "Desenvolvimento social",
        "Democracia",
        "Ciência",
        "Cultura",
    ],
    "centro": [
        "Equilíbrio",
        "Estabilidade",
        "Eficiência",
        "Pragmatismo",
        "Ordem",
        "Responsabilidade fiscal",
        "Desenvolvimento",
    ],
    "centro-direita": [
        "Família",
        "Trabalho",
        "Livre iniciativa",
        "Segurança",
        "Meritocracia",
        "Empreendedorismo",
        "Ordem",
    ],
    "direita": [
        "Família tradicional",
        "Fé",
        "Liberdade econômica",
        "Pátria",
        "Propriedade",
        "Segurança",
        "Ordem",
        "Valores cristãos",
    ],
}

PREOCUPACOES = {
    "esquerda": [
        "Desigualdade social",
        "Desemprego",
        "Fome",
        "Acesso à saúde",
        "Precarização do trabalho",
        "Racismo",
        "Violência policial",
    ],
    "centro-esquerda": [
        "Qualidade do ensino",
        "Filas na saúde",
        "Mobilidade urbana",
        "Corrupção",
        "Desigualdade",
        "Saneamento",
    ],
    "centro": [
        "Inflação",
        "Custo de vida",
        "Segurança",
        "Saúde",
        "Educação",
        "Emprego",
        "Corrupção",
        "Burocracia",
    ],
    "centro-direita": [
        "Segurança",
        "Impostos",
        "Burocracia",
        "Criminalidade",
        "Corrupção",
        "Ineficiência estatal",
        "Violência",
    ],
    "direita": [
        "Criminalidade",
        "Corrupção",
        "Drogas",
        "Impostos",
        "Insegurança",
        "Degradação moral",
        "Ideologia nas escolas",
    ],
}


# ========================================
# MEDOS COERENTES COM VÍNCULO
# ========================================
def gerar_medos(cluster, orientacao, vinculo):
    """Gera medos coerentes com a situação do eleitor"""

    medos_base = {
        "G1_alta": [
            "Violência urbana",
            "Desvalorização dos imóveis",
            "Crise econômica",
            "Instabilidade",
        ],
        "G2_media_alta": [
            "Perder o emprego",
            "Violência",
            "Inflação",
            "Perder plano de saúde",
        ],
        "G3_media_baixa": [
            "Desemprego",
            "Violência",
            "Doença sem atendimento",
            "Não conseguir pagar as contas",
        ],
        "G4_baixa": [
            "Fome",
            "Despejo",
            "Violência",
            "Ficar sem luz/água",
            "Perder os filhos",
        ],
    }

    medos_politicos = {
        "direita": ["Brasil virar Venezuela", "Comunismo"],
        "centro-direita": ["Populismo", "Aumento de impostos"],
        "centro": ["Polarização", "Extremismo"],
        "centro-esquerda": ["Retrocesso em direitos", "Desmonte social"],
        "esquerda": ["Golpe militar", "Fascismo"],
    }

    medos = medos_base.get(cluster, []).copy()

    # Ajustar por vínculo - remover medos incongruentes
    if vinculo == "autonomo":
        # Autônomos não temem desemprego, temem perder clientes
        medos = [m for m in medos if m not in ["Desemprego", "Perder o emprego"]]
        medos.append("Perder clientes")
    elif vinculo == "aposentado":
        # Aposentados não temem desemprego
        medos = [m for m in medos if m not in ["Desemprego", "Perder o emprego"]]
        medos.extend(
            ["Perder benefícios", "Saúde piorar", "Inflação corroer aposentadoria"]
        )
    elif vinculo == "desempregado":
        # Desempregados já estão desempregados - temem continuar assim
        medos = [m for m in medos if m not in ["Desemprego", "Perder o emprego"]]
        medos.extend(["Não conseguir emprego", "Ficar endividado", "Depender de favor"])
    elif vinculo == "servidor_publico":
        medos.append("Reforma administrativa")
    elif vinculo == "informal":
        medos.append("Fiscalização")
    elif vinculo == "estudante":
        medos = [m for m in medos if m not in ["Desemprego", "Perder o emprego"]]
        medos.extend(
            [
                "Não conseguir emprego depois de formado",
                "Não passar no vestibular/concurso",
            ]
        )

    # Adicionar medo político
    medos_pol = medos_politicos.get(orientacao, [])
    if medos_pol:
        medos.append(random.choice(medos_pol))

    return random.sample(list(set(medos)), min(3, len(medos)))


# ========================================
# FONTES DE INFORMAÇÃO
# ========================================
def gerar_fontes_informacao(cluster, idade, escolaridade):
    fontes = []

    if cluster in ["G1_alta", "G2_media_alta"]:
        tv = random.choices(
            [
                "Jornal Nacional",
                "Globo News",
                "CNN Brasil",
                "Jovem Pan News",
                "Band News",
            ],
            weights=[30, 25, 15, 20, 10],
        )[0]
    else:
        tv = random.choices(
            ["Jornal Nacional", "Cidade Alerta", "Balanço Geral", "SBT Brasil", "DFTV"],
            weights=[25, 25, 20, 15, 15],
        )[0]
    fontes.append(tv)

    if idade < 30:
        rede = random.choices(
            ["Instagram", "TikTok", "YouTube", "Twitter/X"], weights=[35, 30, 25, 10]
        )[0]
    elif idade < 50:
        rede = random.choices(
            ["Instagram", "Facebook", "YouTube", "Twitter/X"], weights=[35, 25, 30, 10]
        )[0]
    else:
        rede = random.choices(
            ["Facebook", "YouTube", "Instagram", "Nenhuma"], weights=[40, 30, 15, 15]
        )[0]
    if rede != "Nenhuma":
        fontes.append(rede)

    if random.random() < 0.70:
        if cluster == "G1_alta":
            fontes.append("WhatsApp (grupos profissionais)")
        elif cluster == "G2_media_alta":
            fontes.append("WhatsApp (grupos de trabalho)")
        else:
            fontes.append("WhatsApp (grupos de família/igreja)")

    if escolaridade == "superior_completo_ou_pos" and random.random() < 0.6:
        fontes.append(random.choice(["G1", "Folha", "Estadão", "Metrópoles"]))
    elif random.random() < 0.25:
        fontes.append(random.choice(["Metrópoles", "Correio Braziliense"]))

    if cluster in ["G3_media_baixa", "G4_baixa"] and random.random() < 0.2:
        fontes.append(random.choice(["Igreja", "Rádio local", "Vizinhos"]))

    return fontes


# ========================================
# VIESES COGNITIVOS
# ========================================
VIESES = [
    "confirmacao",
    "disponibilidade",
    "grupo",
    "autoridade",
    "aversao_perda",
    "tribalismo",
    "sunk_cost",
    "desconfianca_institucional",
]


def gerar_vieses(interesse_politico):
    if interesse_politico == "baixo":
        num = random.randint(1, 2)
    elif interesse_politico == "medio":
        num = random.randint(2, 3)
    else:
        num = random.randint(2, 4)

    vieses = ["confirmacao"]  # Universal
    vieses.extend(
        random.sample(
            [v for v in VIESES if v != "confirmacao"], min(num - 1, len(VIESES) - 1)
        )
    )
    return vieses[:num]


# ========================================
# INSTRUÇÃO COMPORTAMENTAL INDIVIDUALIZADA
# ========================================
def gerar_instrucao_comportamental(
    interesse_politico, tolerancia_nuance, estilo_decisao
):
    tom = random.choice(["formal", "coloquial", "direto", "emotivo", "reflexivo"])

    instrucoes = [f"Tom: {tom}."]

    if interesse_politico == "baixo":
        instrucoes.append("Pouco interesse em política, evita discussões.")
    elif interesse_politico == "medio":
        instrucoes.append(
            "Acompanha política por alto, forma opinião pelo que ouve ao redor."
        )
    else:
        instrucoes.append("Engajado politicamente, tem opiniões firmes.")

    if tolerancia_nuance == "baixa":
        instrucoes.append("Pensa em termos de certo/errado, nós/eles.")
    elif tolerancia_nuance == "media":
        instrucoes.append("Aceita algumas nuances, mas prefere clareza.")
    else:
        instrucoes.append("Considera múltiplos pontos de vista.")

    estilos = {
        "identitario": "Vota por identificação com grupo/candidato.",
        "pragmatico": "Vota pensando em resultados práticos.",
        "moral": "Vota baseado em valores e princípios.",
        "economico": "Vota pensando no bolso.",
        "emocional": "Decide mais pela emoção do momento.",
    }
    instrucoes.append(estilos.get(estilo_decisao, estilos["pragmatico"]))

    return " ".join(instrucoes)


# ========================================
# FUNÇÕES AUXILIARES
# ========================================
def gerar_idade_para_faixa(faixa):
    if faixa == "16-24":
        if random.random() < 0.12:
            return random.randint(16, 17)
        return random.randint(18, 24)
    elif faixa == "25-34":
        return random.randint(25, 34)
    elif faixa == "35-44":
        return random.randint(35, 44)
    elif faixa == "45-59":
        return random.randint(45, 59)
    else:
        if random.random() < 0.28:
            return random.randint(70, 85)
        return random.randint(60, 69)


def gerar_nome(genero):
    if genero == "feminino":
        nome = random.choice(NOMES_F)
    else:
        nome = random.choice(NOMES_M)
    return f"{nome} {random.choice(SOBRENOMES)} {random.choice(SOBRENOMES)}"


def ajustar_escolaridade_por_idade(escolaridade, idade):
    if idade < 18 and escolaridade == "superior_completo_ou_pos":
        return "medio_completo_ou_sup_incompleto"
    if idade < 22 and escolaridade == "superior_completo_ou_pos":
        return "medio_completo_ou_sup_incompleto"
    return escolaridade


def gerar_profissao_vinculo(cluster, escolaridade, idade, genero):
    if idade < 18:
        if random.random() < 0.7:
            return ("Estudante", "estudante")
        return ("Jovem Aprendiz", "clt")

    if idade >= 65 and random.random() < 0.75:
        return ("Aposentado(a)", "aposentado")

    # TAXA DE DESEMPREGO POR CLUSTER (DF tem ~10-12% geral)
    # G4_baixa tem mais desemprego que G1_alta
    taxa_desemprego = {
        "G1_alta": 0.03,
        "G2_media_alta": 0.06,
        "G3_media_baixa": 0.10,
        "G4_baixa": 0.15,
    }
    if idade >= 18 and idade <= 60:
        if random.random() < taxa_desemprego.get(cluster, 0.08):
            return ("Desempregado(a)", "desempregado")

    opcoes = PROFISSOES.get(cluster, {}).get(escolaridade, [])
    if not opcoes:
        return ("Autônomo(a)", "autonomo")

    # Filtrar estudantes se idade > 28 (limite razoável para universitário)
    if idade > 28:
        opcoes_validas = [
            (p, v, im) for p, v, im in opcoes if idade >= im and "Estudante" not in p
        ]
    else:
        opcoes_validas = [(p, v, im) for p, v, im in opcoes if idade >= im]

    if not opcoes_validas:
        if escolaridade == "fundamental_ou_sem_instrucao":
            return ("Trabalhador(a) Informal", "informal")
        # Só retorna estudante se < 28
        if idade < 28:
            return ("Estudante", "estudante")
        return ("Autônomo(a)", "autonomo")

    prof, vinc, _ = random.choice(opcoes_validas)
    return (prof, vinc)


def gerar_estado_civil(idade):
    if idade < 20:
        return random.choices(["solteiro(a)", "uniao_estavel"], weights=[92, 8])[0]
    elif idade < 30:
        return random.choices(
            ["solteiro(a)", "casado(a)", "uniao_estavel"], weights=[55, 25, 20]
        )[0]
    elif idade < 45:
        return random.choices(
            ["solteiro(a)", "casado(a)", "uniao_estavel", "divorciado(a)"],
            weights=[18, 52, 18, 12],
        )[0]
    elif idade < 60:
        return random.choices(
            ["solteiro(a)", "casado(a)", "uniao_estavel", "divorciado(a)", "viuvo(a)"],
            weights=[10, 52, 15, 18, 5],
        )[0]
    else:
        return random.choices(
            ["solteiro(a)", "casado(a)", "divorciado(a)", "viuvo(a)"],
            weights=[8, 45, 17, 30],
        )[0]


def gerar_filhos(idade, estado_civil):
    if idade < 20:
        return random.choices([0, 1], weights=[90, 10])[0]
    elif idade < 30:
        return random.choices([0, 1, 2], weights=[45, 35, 20])[0]
    elif idade < 45:
        return random.choices([0, 1, 2, 3], weights=[15, 30, 35, 20])[0]
    else:
        return random.choices([0, 1, 2, 3, 4], weights=[12, 22, 35, 22, 9])[0]


def gerar_transporte_deslocamento(cluster, vinculo, profissao, ra):
    """
    Gera transporte com lógica condicional de metrô baseada na RA.
    Só RAs com acesso real ao metrô podem usar metrô.
    Inclui van_pirata como realidade de G3/G4.
    """
    if vinculo in ["aposentado", "desempregado"]:
        return ("nao_se_aplica", "nao_se_aplica")

    tem_metro = ra in RAS_COM_METRO

    if vinculo == "estudante":
        if cluster in ["G1_alta", "G2_media_alta"]:
            if tem_metro and random.random() < 0.5:
                return ("metro", random.choice(["15_30", "30_45"]))
            return (
                random.choice(["carro_familia", "onibus"]),
                random.choice(["ate_15", "15_30"]),
            )
        # Estudantes G3/G4
        if tem_metro and random.random() < 0.35:
            return ("metro", random.choice(["30_45", "45_60"]))
        return (
            random.choice(["onibus", "a_pe", "van_pirata"]),
            random.choice(["15_30", "30_45", "45_60"]),
        )

    # Autônomo que trabalha no bairro
    if vinculo == "autonomo" and any(
        p in profissao.lower()
        for p in ["barbeiro", "cabeleireiro", "manicure", "comerciante"]
    ):
        return (
            random.choice(["moto", "a_pe", "carro"]),
            random.choice(["ate_15", "15_30"]),
        )

    # G1_alta: carro ou app, metrô só se tiver
    if cluster == "G1_alta":
        if tem_metro and random.random() < 0.25:
            return ("metro", random.choice(["15_30", "30_45"]))
        return (
            random.choice(["carro", "app"]),
            random.choice(["ate_15", "15_30", "30_45"]),
        )

    # G2_media_alta: carro/ônibus, metrô 55% se tiver
    if cluster == "G2_media_alta":
        if tem_metro and random.random() < 0.55:
            return ("metro", random.choice(["15_30", "30_45"]))
        return (random.choice(["carro", "onibus"]), random.choice(["30_45", "45_60"]))

    # G3_media_baixa: metrô 40% se tiver, senão ônibus/van/bicicleta
    if cluster == "G3_media_baixa":
        if tem_metro and random.random() < 0.40:
            return ("metro", random.choice(["30_45", "45_60"]))
        opcoes = ["onibus", "van_pirata", "moto", "bicicleta"]
        pesos = [50, 25, 15, 10]
        return (
            random.choices(opcoes, weights=pesos)[0],
            random.choice(["45_60", "60_75"]),
        )

    # G4_baixa: metrô 30% se tiver, senão ônibus/van/a_pe/bicicleta
    if tem_metro and random.random() < 0.30:
        return ("metro", random.choice(["45_60", "60_75"]))
    opcoes = ["onibus", "van_pirata", "a_pe", "bicicleta", "moto"]
    pesos = [40, 25, 15, 10, 10]
    return (
        random.choices(opcoes, weights=pesos)[0],
        random.choice(["45_60", "60_75", "75_90"]),
    )


# ========================================
# GERAÇÃO PRINCIPAL
# ========================================
def gerar_eleitores():
    eleitores = []
    clusters = ["G1_alta", "G2_media_alta", "G3_media_baixa", "G4_baixa"]

    # Criar pools
    renda_pool = {c: [] for c in clusters}
    for c in clusters:
        for renda, qtd in CLUSTER_RENDA[c].items():
            renda_pool[c].extend([renda] * qtd)
        random.shuffle(renda_pool[c])

    escolaridade_pool = {c: [] for c in clusters}
    for c in clusters:
        for esc, qtd in CLUSTER_ESCOLARIDADE[c].items():
            escolaridade_pool[c].extend([esc] * qtd)
        random.shuffle(escolaridade_pool[c])

    religiao_pool = {c: [] for c in clusters}
    for c in clusters:
        for rel, qtd in CLUSTER_RELIGIAO[c].items():
            religiao_pool[c].extend([rel] * qtd)
        random.shuffle(religiao_pool[c])

    genero_pool = [g for g, q in COTAS_GENERO.items() for _ in range(q)]
    random.shuffle(genero_pool)

    idade_pool = [f for f, q in COTAS_IDADE.items() for _ in range(q)]
    random.shuffle(idade_pool)

    cor_pool = [c for c, q in COTAS_COR_RACA.items() for _ in range(q)]
    random.shuffle(cor_pool)

    indices = {c: 0 for c in clusters}
    idx_global = 0

    for ra, qtd, cluster in RAS:
        for i in range(qtd):
            renda = renda_pool[cluster][indices[cluster]]
            escolaridade_raw = escolaridade_pool[cluster][indices[cluster]]
            religiao = religiao_pool[cluster][indices[cluster]]
            indices[cluster] += 1

            genero = genero_pool[idx_global]
            idade_faixa = idade_pool[idx_global]
            cor_raca = cor_pool[idx_global]
            idx_global += 1

            idade = gerar_idade_para_faixa(idade_faixa)
            escolaridade = ajustar_escolaridade_por_idade(escolaridade_raw, idade)
            profissao, vinculo = gerar_profissao_vinculo(
                cluster, escolaridade, idade, genero
            )
            nome = gerar_nome(genero)
            estado_civil = gerar_estado_civil(idade)
            filhos = gerar_filhos(idade, estado_civil)

            orientacao = gerar_orientacao_politica(cluster, religiao)
            posicao_bolsonaro = gerar_posicao_bolsonaro(
                cluster, religiao, orientacao, idade
            )

            interesse_politico = random.choices(
                ["baixo", "medio", "alto"], weights=[35, 45, 20]
            )[0]
            tolerancia_nuance = random.choices(
                ["baixa", "media", "alta"], weights=[30, 50, 20]
            )[0]
            estilo_decisao = random.choice(
                ["identitario", "pragmatico", "moral", "economico", "emocional"]
            )

            transporte, tempo = gerar_transporte_deslocamento(
                cluster, vinculo, profissao, ra
            )

            # Local de referência para verossimilhança
            locais_ra = LOCAIS_REFERENCIA.get(ra, ["no centro"])
            local_referencia = random.choice(locais_ra)

            fontes = gerar_fontes_informacao(cluster, idade, escolaridade)
            susceptibilidade = calcular_susceptibilidade(
                escolaridade, fontes, idade, interesse_politico
            )
            vieses = gerar_vieses(interesse_politico)
            medos = gerar_medos(cluster, orientacao, vinculo)

            valores = random.sample(VALORES.get(orientacao, VALORES["centro"]), 3)
            preocupacoes = random.sample(
                PREOCUPACOES.get(orientacao, PREOCUPACOES["centro"]), 3
            )

            historia = gerar_historia_narrativa(
                nome,
                idade,
                genero,
                ra,
                cluster,
                profissao,
                vinculo,
                escolaridade,
                religiao,
                orientacao,
                estado_civil,
                filhos,
                posicao_bolsonaro,
                renda,
            )

            instrucao = gerar_instrucao_comportamental(
                interesse_politico, tolerancia_nuance, estilo_decisao
            )
            voto_facultativo = idade < 18 or idade >= 70

            # Conflito identitário: evangélicos de esquerda (~10%) são minoria sob pressão social
            conflito_identitario = religiao == "evangelica" and orientacao in [
                "esquerda",
                "centro-esquerda",
            ]

            eleitor = {
                "id": f"df-{len(eleitores)+1:04d}",
                "nome": nome,
                "idade": idade,
                "genero": genero,
                "cor_raca": cor_raca,
                "regiao_administrativa": ra,
                "local_referencia": local_referencia,
                "cluster_socioeconomico": cluster,
                "escolaridade": escolaridade,
                "profissao": profissao,
                "ocupacao_vinculo": vinculo,
                "renda_salarios_minimos": renda,
                "religiao": religiao,
                "estado_civil": estado_civil,
                "filhos": filhos,
                "orientacao_politica": orientacao,
                "posicao_bolsonaro": posicao_bolsonaro,
                "interesse_politico": interesse_politico,
                "tolerancia_nuance": tolerancia_nuance,
                "estilo_decisao": estilo_decisao,
                "valores": valores,
                "preocupacoes": preocupacoes,
                "vieses_cognitivos": vieses,
                "medos": medos,
                "fontes_informacao": fontes,
                "susceptibilidade_desinformacao": susceptibilidade,
                "meio_transporte": transporte,
                "tempo_deslocamento_trabalho": tempo,
                "voto_facultativo": voto_facultativo,
                "conflito_identitario": conflito_identitario,
                "historia_resumida": historia,
                "instrucao_comportamental": instrucao,
            }

            eleitores.append(eleitor)

    return eleitores


# ========================================
# VALIDAÇÃO
# ========================================
def validar(eleitores):
    erros = []

    if len(eleitores) != 400:
        erros.append(f"Total: {len(eleitores)}")

    # Jovens com superior
    jovens = [
        e
        for e in eleitores
        if e["idade"] < 22 and e["escolaridade"] == "superior_completo_ou_pos"
    ]
    if jovens:
        erros.append(f"Jovens <22 com superior: {len(jovens)}")

    # Aposentados com deslocamento
    apos = [
        e
        for e in eleitores
        if e["ocupacao_vinculo"] == "aposentado"
        and e["tempo_deslocamento_trabalho"] != "nao_se_aplica"
    ]
    if apos:
        erros.append(f"Aposentados com deslocamento: {len(apos)}")

    # Desempregados com deslocamento
    desemp = [
        e
        for e in eleitores
        if e["ocupacao_vinculo"] == "desempregado"
        and e["tempo_deslocamento_trabalho"] != "nao_se_aplica"
    ]
    if desemp:
        erros.append(f"Desempregados com deslocamento: {len(desemp)}")

    # SIA (não deveria existir)
    sia = [e for e in eleitores if e["regiao_administrativa"] == "SIA"]
    if sia:
        erros.append(f"Eleitores no SIA: {len(sia)}")

    # VALIDAÇÃO DE COTAS DE IDADE
    idade_counts = {"16-24": 0, "25-34": 0, "35-44": 0, "45-59": 0, "60+": 0}
    for e in eleitores:
        if e["idade"] < 25:
            idade_counts["16-24"] += 1
        elif e["idade"] < 35:
            idade_counts["25-34"] += 1
        elif e["idade"] < 45:
            idade_counts["35-44"] += 1
        elif e["idade"] < 60:
            idade_counts["45-59"] += 1
        else:
            idade_counts["60+"] += 1

    for faixa, esperado in COTAS_IDADE.items():
        real = idade_counts[faixa]
        if real != esperado:
            erros.append(f"Idade {faixa}: {real} (esperado {esperado})")

    return erros


if __name__ == "__main__":
    print("Gerando 400 eleitores do DF v3.0...")
    eleitores = gerar_eleitores()

    print("\nValidando...")
    erros = validar(eleitores)
    if erros:
        print("ERROS:", erros)
    else:
        print("OK!")

    print("\n=== ESTATÍSTICAS ===")

    pos_bol = {}
    for e in eleitores:
        pb = e["posicao_bolsonaro"]
        pos_bol[pb] = pos_bol.get(pb, 0) + 1
    print("Posição Bolsonaro:")
    apoiadores = pos_bol.get("apoiador_forte", 0) + pos_bol.get("apoiador_moderado", 0)
    print(f"  Apoiadores: {apoiadores} ({apoiadores/4:.1f}%)")

    fac = sum(1 for e in eleitores if e["voto_facultativo"])
    print(f"Voto facultativo: {fac} ({fac/4:.1f}%)")

    # Susceptibilidade média por escolaridade
    print("\nSusceptibilidade média por escolaridade:")
    for esc in [
        "superior_completo_ou_pos",
        "medio_completo_ou_sup_incompleto",
        "fundamental_ou_sem_instrucao",
    ]:
        vals = [
            e["susceptibilidade_desinformacao"]
            for e in eleitores
            if e["escolaridade"] == esc
        ]
        if vals:
            print(f"  {esc[:20]}: {sum(vals)/len(vals):.1f}")

    whats = sum(
        1 for e in eleitores if any("WhatsApp" in f for f in e["fontes_informacao"])
    )
    print(f"\nUsam WhatsApp: {whats} ({whats/4:.1f}%)")

    with open("agentes/banco-eleitores-df.json", "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print("\nArquivo salvo: agentes/banco-eleitores-df.json")

    # Mostrar amostra de história
    print("\n=== AMOSTRA DE HISTÓRIA NARRATIVA ===")
    for e in eleitores[100:103]:
        print(f"{e['id']} ({e['profissao']}, {e['regiao_administrativa']}):")
        print(f"  {e['historia_resumida']}")
        print()
