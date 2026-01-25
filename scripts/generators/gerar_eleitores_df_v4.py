"""
Gerador de Eleitores Sintéticos do DF v4.0
Correções baseadas em auditoria detalhada:
- RAs alinhadas com Censo 2022 (incluindo SIA=1)
- Cluster probabilístico por RA (não fixo)
- Histórias narrativas condicionais por idade/situação
- Crenças políticas separadas em moderadas/fortes
- Piso de renda por profissão de topo
- Validações extras
"""

import json
import random

random.seed(42)

# ========================================
# RAs ALINHADAS COM CENSO 2022 (ajustadas para 400)
# ========================================
# Agora: (RA, quantidade) - cluster será probabilístico
# Soma original dava 384, ajustado +16 nas maiores RAs proporcionalmente
RAS = [
    ("Ceilândia", 41),  # +2
    ("Samambaia", 32),  # +2
    ("Plano Piloto", 29),  # +2
    ("Taguatinga", 28),  # +2
    ("Planaltina", 27),  # +2
    ("Gama", 21),  # +2
    ("Águas Claras", 19),  # +1
    ("Guará", 17),  # +1
    ("Santa Maria", 17),  # +1
    ("Recanto das Emas", 17),  # +1
    ("Sol Nascente/Pôr do Sol", 14),
    ("São Sebastião", 13),
    ("Vicente Pires", 13),
    ("Sobradinho II", 11),
    ("Jardim Botânico", 11),
    ("Sobradinho", 10),
    ("Riacho Fundo II", 9),
    ("Itapoã", 9),
    ("Paranoá", 9),
    ("Brazlândia", 8),
    ("Sudoeste/Octogonal", 6),
    ("Arniqueira", 6),
    ("Riacho Fundo", 5),
    ("SCIA/Estrutural", 5),
    ("Lago Norte", 4),
    ("Lago Sul", 4),
    ("Cruzeiro", 4),
    ("Park Way", 3),
    ("Núcleo Bandeirante", 3),
    ("Candangolândia", 2),
    ("Fercal", 1),
    ("Varjão", 1),
    ("SIA", 1),  # Mantido conforme Censo - caso atípico
]

# ========================================
# CLUSTER PROBABILÍSTICO POR RA
# ========================================
# Cada RA tem mistura de clusters (baseado em PDAD)
CLUSTER_POR_RA = {
    # G1_alta predominante
    "Plano Piloto": {"G1_alta": 75, "G2_media_alta": 20, "G3_media_baixa": 5},
    "Lago Sul": {"G1_alta": 90, "G2_media_alta": 10},
    "Lago Norte": {"G1_alta": 85, "G2_media_alta": 15},
    "Park Way": {"G1_alta": 85, "G2_media_alta": 15},
    "Sudoeste/Octogonal": {"G1_alta": 80, "G2_media_alta": 20},
    "Jardim Botânico": {"G1_alta": 70, "G2_media_alta": 25, "G3_media_baixa": 5},
    # G1/G2 misto
    "Águas Claras": {"G1_alta": 45, "G2_media_alta": 45, "G3_media_baixa": 10},
    # G2_media_alta predominante
    "Guará": {"G1_alta": 15, "G2_media_alta": 60, "G3_media_baixa": 25},
    "Taguatinga": {
        "G1_alta": 10,
        "G2_media_alta": 50,
        "G3_media_baixa": 35,
        "G4_baixa": 5,
    },
    "Vicente Pires": {"G1_alta": 20, "G2_media_alta": 55, "G3_media_baixa": 25},
    "Cruzeiro": {"G1_alta": 20, "G2_media_alta": 60, "G3_media_baixa": 20},
    "Sobradinho": {"G2_media_alta": 50, "G3_media_baixa": 40, "G4_baixa": 10},
    "Núcleo Bandeirante": {"G2_media_alta": 45, "G3_media_baixa": 45, "G4_baixa": 10},
    "Candangolândia": {"G2_media_alta": 40, "G3_media_baixa": 50, "G4_baixa": 10},
    "Arniqueira": {"G2_media_alta": 45, "G3_media_baixa": 45, "G4_baixa": 10},
    # G3_media_baixa predominante
    "Ceilândia": {"G2_media_alta": 10, "G3_media_baixa": 55, "G4_baixa": 35},
    "Samambaia": {"G2_media_alta": 10, "G3_media_baixa": 55, "G4_baixa": 35},
    "Gama": {"G2_media_alta": 15, "G3_media_baixa": 55, "G4_baixa": 30},
    "Santa Maria": {"G2_media_alta": 5, "G3_media_baixa": 50, "G4_baixa": 45},
    "Sobradinho II": {"G2_media_alta": 15, "G3_media_baixa": 55, "G4_baixa": 30},
    "Riacho Fundo": {"G2_media_alta": 15, "G3_media_baixa": 55, "G4_baixa": 30},
    # G4_baixa predominante
    "Planaltina": {"G2_media_alta": 5, "G3_media_baixa": 25, "G4_baixa": 70},
    "Recanto das Emas": {"G3_media_baixa": 30, "G4_baixa": 70},
    "Sol Nascente/Pôr do Sol": {"G3_media_baixa": 15, "G4_baixa": 85},
    "São Sebastião": {"G2_media_alta": 5, "G3_media_baixa": 30, "G4_baixa": 65},
    "Riacho Fundo II": {"G3_media_baixa": 35, "G4_baixa": 65},
    "Itapoã": {"G3_media_baixa": 20, "G4_baixa": 80},
    "Paranoá": {"G3_media_baixa": 30, "G4_baixa": 70},
    "Brazlândia": {"G3_media_baixa": 30, "G4_baixa": 70},
    "SCIA/Estrutural": {"G3_media_baixa": 15, "G4_baixa": 85},
    "Fercal": {"G3_media_baixa": 20, "G4_baixa": 80},
    "Varjão": {"G3_media_baixa": 25, "G4_baixa": 75},
    # SIA - caso atípico (trabalhador que mora em kitnet funcional)
    "SIA": {"G3_media_baixa": 50, "G4_baixa": 50},
}


def sortear_cluster(ra):
    """Sorteia cluster baseado nas probabilidades da RA"""
    probs = CLUSTER_POR_RA.get(ra, {"G3_media_baixa": 50, "G4_baixa": 50})
    clusters = list(probs.keys())
    pesos = list(probs.values())
    return random.choices(clusters, weights=pesos)[0]


# ========================================
# COTAS GLOBAIS (para validação e rebalanceamento)
# ========================================
COTAS_CLUSTER = {
    "G1_alta": 76,
    "G2_media_alta": 85,
    "G3_media_baixa": 126,
    "G4_baixa": 113,
}

CLUSTER_RENDA = {
    "G1_alta": {"mais_de_5_ate_10": 8, "mais_de_10_ate_20": 45, "mais_de_20": 23},
    "G2_media_alta": {
        "mais_de_1_ate_2": 6,
        "mais_de_2_ate_5": 29,
        "mais_de_5_ate_10": 41,
        "mais_de_10_ate_20": 9,
    },
    "G3_media_baixa": {
        "ate_1": 10,
        "mais_de_1_ate_2": 36,
        "mais_de_2_ate_5": 70,
        "mais_de_5_ate_10": 10,
    },
    "G4_baixa": {
        "ate_1": 22,
        "mais_de_1_ate_2": 42,
        "mais_de_2_ate_5": 32,
        "mais_de_5_ate_10": 17,
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
    },
    "G3_media_baixa": {
        "superior_completo_ou_pos": 24,
        "medio_completo_ou_sup_incompleto": 82,
        "fundamental_ou_sem_instrucao": 20,
    },
    "G4_baixa": {
        "superior_completo_ou_pos": 8,
        "medio_completo_ou_sup_incompleto": 56,
        "fundamental_ou_sem_instrucao": 49,
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
    },
    "G3_media_baixa": {
        "catolica": 68,
        "evangelica": 47,
        "sem_religiao": 7,
        "espirita": 1,
        "umbanda_candomble": 1,
        "outras_religioes": 2,
    },
    "G4_baixa": {
        "catolica": 62,
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
COTA_ESCOLARIDADE_SUPERIOR = 148  # Meta: 37%

# ========================================
# METRÔ E LOCAIS DE REFERÊNCIA
# ========================================
RAS_COM_METRO = {
    "Águas Claras",
    "Taguatinga",
    "Ceilândia",
    "Samambaia",
    "Guará",
    "Plano Piloto",
}

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
    "SCIA/Estrutural": ["na Cidade Estrutural", "no SCIA", "perto do aterro"],
    "Lago Norte": ["no MI", "perto do Pontão", "na QL"],
    "Lago Sul": ["na QL", "perto do Gilberto Salomão", "no SHIS"],
    "Cruzeiro": ["no Cruzeiro Velho", "no Cruzeiro Novo", "perto do Sudoeste"],
    "Park Way": ["nas mansões", "perto da Ponte JK", "na quadra 29"],
    "Núcleo Bandeirante": ["no Centro", "perto da Feira do Núcleo", "na 3ª Avenida"],
    "Candangolândia": ["no Centro", "perto do terminal", "na quadra 1"],
    "Fercal": ["no Centro", "perto da fábrica de cimento"],
    "Varjão": ["no Centro", "perto da entrada"],
    "SIA": ["próximo ao trabalho", "em kitnet funcional", "na área industrial"],
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
]

# ========================================
# PROFISSÕES COM VÍNCULO E PISO DE RENDA
# ========================================
# Formato: (profissão, vínculo, idade_minima, renda_minima ou None)
PROFISSOES = {
    "G1_alta": {
        "superior_completo_ou_pos": [
            ("Advogado(a)", "autonomo", 24, "mais_de_5_ate_10"),
            ("Médico(a)", "autonomo", 26, "mais_de_10_ate_20"),
            ("Engenheiro(a) Civil", "clt", 24, "mais_de_5_ate_10"),
            ("Juiz(a)", "servidor_publico", 30, "mais_de_20"),
            ("Promotor(a) de Justiça", "servidor_publico", 30, "mais_de_20"),
            ("Auditor(a) Fiscal", "servidor_publico", 26, "mais_de_10_ate_20"),
            ("Analista do Banco Central", "servidor_publico", 24, "mais_de_10_ate_20"),
            ("Diplomata", "servidor_publico", 28, "mais_de_10_ate_20"),
            ("Economista", "clt", 24, "mais_de_5_ate_10"),
            ("Arquiteto(a)", "autonomo", 24, "mais_de_5_ate_10"),
            ("Analista Judiciário", "servidor_publico", 24, "mais_de_10_ate_20"),
            (
                "Professor(a) Universitário(a)",
                "servidor_publico",
                28,
                "mais_de_10_ate_20",
            ),
            ("Administrador(a) de Empresas", "clt", 24, "mais_de_5_ate_10"),
            ("Contador(a)", "autonomo", 24, "mais_de_5_ate_10"),
            ("Analista de Sistemas", "clt", 24, "mais_de_5_ate_10"),
            ("Dentista", "autonomo", 25, "mais_de_5_ate_10"),
            ("Empresário(a)", "empresario", 26, "mais_de_10_ate_20"),
            ("Consultor(a) Empresarial", "autonomo", 28, "mais_de_10_ate_20"),
            ("Psicólogo(a)", "autonomo", 25, "mais_de_5_ate_10"),
            ("Analista Legislativo", "servidor_publico", 24, "mais_de_10_ate_20"),
        ],
        "medio_completo_ou_sup_incompleto": [
            ("Técnico(a) Judiciário", "servidor_publico", 20, "mais_de_5_ate_10"),
            ("Corretor(a) de Imóveis", "autonomo", 21, None),
            ("Estudante Universitário(a)", "estudante", 18, None),
            ("Assistente Administrativo", "clt", 19, None),
            ("Gerente Comercial", "clt", 25, "mais_de_5_ate_10"),
        ],
    },
    "G2_media_alta": {
        "superior_completo_ou_pos": [
            ("Professor(a)", "servidor_publico", 23, "mais_de_2_ate_5"),
            ("Enfermeiro(a)", "clt", 23, "mais_de_2_ate_5"),
            ("Analista Administrativo", "servidor_publico", 24, "mais_de_5_ate_10"),
            ("Contador(a)", "clt", 24, "mais_de_2_ate_5"),
            ("Engenheiro(a)", "clt", 24, "mais_de_5_ate_10"),
            ("Servidor(a) Público Federal", "servidor_publico", 22, "mais_de_5_ate_10"),
            ("Policial Federal", "servidor_publico", 23, "mais_de_5_ate_10"),
            ("Fisioterapeuta", "autonomo", 23, "mais_de_2_ate_5"),
            ("Nutricionista", "autonomo", 23, "mais_de_2_ate_5"),
            ("Farmacêutico(a)", "clt", 23, "mais_de_2_ate_5"),
            ("Assistente Social", "servidor_publico", 23, "mais_de_2_ate_5"),
            ("Analista de RH", "clt", 24, "mais_de_2_ate_5"),
            ("Gerente de Banco", "clt", 28, "mais_de_5_ate_10"),
            ("Designer", "autonomo", 22, None),
            ("Jornalista", "clt", 23, "mais_de_2_ate_5"),
            ("Analista do INSS", "servidor_publico", 24, "mais_de_5_ate_10"),
        ],
        "medio_completo_ou_sup_incompleto": [
            ("Técnico(a) de Enfermagem", "clt", 20, None),
            ("Policial Militar", "servidor_publico", 20, "mais_de_2_ate_5"),
            ("Bombeiro Militar", "servidor_publico", 20, "mais_de_2_ate_5"),
            ("Técnico(a) Administrativo", "servidor_publico", 20, None),
            ("Auxiliar Administrativo", "clt", 18, None),
            ("Vendedor(a) de Loja", "clt", 18, None),
            ("Recepcionista", "clt", 18, None),
            ("Motorista de Aplicativo", "autonomo", 21, None),
            ("Estudante", "estudante", 16, None),
        ],
        "fundamental_ou_sem_instrucao": [
            ("Porteiro(a)", "clt", 18, None),
            ("Zelador(a)", "clt", 18, None),
        ],
    },
    "G3_media_baixa": {
        "superior_completo_ou_pos": [
            ("Professor(a) da Rede Pública", "servidor_publico", 23, "mais_de_2_ate_5"),
            ("Enfermeiro(a)", "clt", 23, "mais_de_2_ate_5"),
            ("Assistente Social", "servidor_publico", 23, "mais_de_2_ate_5"),
            ("Pedagogo(a)", "servidor_publico", 23, "mais_de_2_ate_5"),
            ("Analista de TI", "clt", 24, "mais_de_2_ate_5"),
            ("Advogado(a)", "autonomo", 25, "mais_de_2_ate_5"),
            ("Psicólogo(a)", "autonomo", 25, "mais_de_2_ate_5"),
        ],
        "medio_completo_ou_sup_incompleto": [
            ("Vendedor(a) de Loja", "clt", 18, None),
            ("Auxiliar Administrativo", "clt", 18, None),
            ("Técnico(a) de Enfermagem", "clt", 20, None),
            ("Motorista", "clt", 21, None),
            ("Caixa de Supermercado", "clt", 18, None),
            ("Atendente de Loja", "clt", 18, None),
            ("Balconista", "clt", 18, None),
            ("Recepcionista", "clt", 18, None),
            ("Operador(a) de Telemarketing", "clt", 18, None),
            ("Vigilante", "clt", 21, None),
            ("Porteiro(a)", "clt", 18, None),
            ("Mecânico(a)", "autonomo", 20, None),
            ("Eletricista", "autonomo", 20, None),
            ("Cabeleireiro(a)", "autonomo", 18, None),
            ("Manicure", "autonomo", 18, None),
            ("Barbeiro(a)", "autonomo", 18, None),
            ("Garçom/Garçonete", "clt", 18, None),
            ("Cozinheiro(a)", "clt", 18, None),
            ("Agente Comunitário de Saúde", "servidor_publico", 20, None),
            ("Estudante", "estudante", 16, None),
            ("Comerciante", "autonomo", 21, None),
        ],
        "fundamental_ou_sem_instrucao": [
            ("Diarista", "informal", 18, None),
            ("Auxiliar de Limpeza", "informal", 18, None),
            ("Ajudante de Pedreiro", "informal", 18, None),
            ("Servente de Obras", "informal", 18, None),
            ("Auxiliar de Serviços Gerais", "informal", 18, None),
            ("Catador(a) de Recicláveis", "informal", 18, None),
            ("Vendedor(a) Ambulante", "autonomo", 18, None),
            ("Cuidador(a) de Idosos", "informal", 20, None),
            ("Empregado(a) Doméstico(a)", "clt", 18, None),
            ("Jardineiro(a)", "autonomo", 18, None),
        ],
    },
    "G4_baixa": {
        "superior_completo_ou_pos": [
            ("Professor(a) da Rede Pública", "servidor_publico", 23, "mais_de_2_ate_5"),
            ("Enfermeiro(a)", "clt", 23, "mais_de_2_ate_5"),
            ("Assistente Social", "servidor_publico", 23, "mais_de_1_ate_2"),
            ("Pedagogo(a)", "servidor_publico", 23, "mais_de_1_ate_2"),
        ],
        "medio_completo_ou_sup_incompleto": [
            ("Vendedor(a)", "clt", 18, None),
            ("Auxiliar de Serviços Gerais", "clt", 18, None),
            ("Atendente", "clt", 18, None),
            ("Motorista de Ônibus", "clt", 21, None),
            ("Vigilante", "clt", 21, None),
            ("Balconista", "clt", 18, None),
            ("Cozinheiro(a)", "clt", 18, None),
            ("Garçom/Garçonete", "clt", 18, None),
            ("Cabeleireiro(a)", "autonomo", 18, None),
            ("Manicure", "autonomo", 18, None),
            ("Barbeiro(a)", "autonomo", 18, None),
            ("Motoboy", "autonomo", 18, None),
            ("Entregador(a) de App", "autonomo", 18, None),
            ("Pedreiro(a)", "autonomo", 18, None),
            ("Pintor(a)", "autonomo", 18, None),
            ("Eletricista", "autonomo", 20, None),
            ("Mecânico(a)", "autonomo", 20, None),
            ("Estudante", "estudante", 16, None),
            ("Comerciante Informal", "autonomo", 18, None),
        ],
        "fundamental_ou_sem_instrucao": [
            ("Diarista", "informal", 18, None),
            ("Auxiliar de Limpeza", "informal", 18, None),
            ("Ajudante de Pedreiro", "informal", 18, None),
            ("Servente de Obras", "informal", 18, None),
            ("Auxiliar de Serviços Gerais", "informal", 18, None),
            ("Catador(a) de Recicláveis", "informal", 18, None),
            ("Vendedor(a) Ambulante", "autonomo", 18, None),
            ("Empregado(a) Doméstico(a)", "clt", 18, None),
            ("Lavador(a) de Carros", "informal", 16, None),
            ("Trabalhador(a) Rural", "informal", 16, None),
            ("Cuidador(a) de Idosos", "informal", 20, None),
            ("Jardineiro(a)", "autonomo", 18, None),
            ("Feirante", "autonomo", 18, None),
            ("Gari", "clt", 18, None),
            ("Ajudante Geral", "informal", 16, None),
        ],
    },
}

# ========================================
# CRENÇAS POLÍTICAS: MODERADAS vs FORTES
# ========================================
CRENCAS_POLITICAS = {
    "direita": {
        "moderadas": [
            "que a família é a base de tudo",
            "que cada um tem que batalhar pelo seu",
            "que o Brasil precisa de mais ordem",
            "que tem muita gente que não valoriza o trabalho",
            "que segurança tem que ser prioridade",
        ],
        "fortes": [
            "que 'bandido bom é bandido morto'",
            "que 'imposto é roubo'",
            "que 'o Brasil tá virando uma Venezuela'",
        ],
    },
    "centro-direita": {
        "moderadas": [
            "que o mercado funciona melhor que o governo",
            "que quem trabalha direito consegue vencer",
            "que o Estado tem que ser menor e eficiente",
            "que empreender é o caminho",
        ],
        "fortes": [
            "que servidor público ganha demais",
            "que sindicato só atrapalha",
        ],
    },
    "centro": {
        "moderadas": [
            "que nenhum político presta de verdade",
            "que tem que ter equilíbrio em tudo",
            "que não adianta ficar brigando por político",
            "que o importante é resolver os problemas",
        ],
        "fortes": [
            "que extremismo dos dois lados é igual",
            "que brasileiro não sabe votar",
        ],
    },
    "centro-esquerda": {
        "moderadas": [
            "que educação é o caminho pra mudar o país",
            "que o Estado tem que dar oportunidade",
            "que saúde e educação têm que ser pra todos",
            "que dá pra crescer respeitando o meio ambiente",
        ],
        "fortes": [
            "que a mídia manipula a opinião das pessoas",
            "que o sistema favorece os ricos",
        ],
    },
    "esquerda": {
        "moderadas": [
            "que pobre só se ferra nesse país",
            "que os direitos foram conquistados com muita luta",
            "que tem que dividir melhor a riqueza",
            "que o trabalhador é quem faz o país funcionar",
        ],
        "fortes": [
            "que a elite não quer ver o pobre subir",
            "que existe uma perseguição aos movimentos sociais",
            "que o golpe de 2016 destruiu o país",
        ],
    },
}


def escolher_crenca(orientacao):
    """Escolhe crença: 75% moderada, 25% forte"""
    crencas = CRENCAS_POLITICAS.get(orientacao, CRENCAS_POLITICAS["centro"])
    if random.random() < 0.75:
        return random.choice(crencas["moderadas"])
    return random.choice(crencas["fortes"])


# ========================================
# EVENTOS FORMADORES CONDICIONAIS
# ========================================
EVENTOS_BASE = {
    "G1_alta": [
        "passar em concurso público após anos de estudo",
        "herdar o negócio da família e modernizá-lo",
        "estudar fora do país e voltar com nova perspectiva",
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
        "entrar na carreira militar por vocação e estabilidade",
    ],
    "G3_media_baixa": [
        "trabalhar desde cedo para ajudar em casa",
        "ver o bairro crescer junto com a cidade",
        "montar salão/barbearia no quintal de casa",
        "começar como ajudante e virar profissional",
        "ser demitido(a) e ter que se virar de qualquer jeito",
        "cuidar dos pais idosos enquanto trabalhava",
        "perder emprego na crise e virar autônomo",
    ],
    "G4_baixa": [
        "crescer em ocupação irregular que virou bairro",
        "perder parente para a violência",
        "ter que abandonar os estudos para trabalhar",
        "ser despejado(a) e ter que recomeçar do zero",
        "passar dificuldade na infância",
        "trabalhar na roça desde criança",
        "sobreviver de bicos desde sempre",
        "conseguir a casa pelo programa habitacional após anos de espera",
    ],
}

# Eventos que requerem condições específicas
EVENTO_CRIAR_FILHOS_SOZINHO = "criar os filhos sozinho(a) após separação"
EVENTO_MIGRAR_NORDESTE = "migrar do Nordeste em busca de vida melhor"
EVENTO_ANOS_80_90 = "ver os pais perderem tudo na hiperinflação dos anos 80"
EVENTO_ANOS_90_FAMILIA = "chegar em Brasília com a família nos anos 90"


def filtrar_eventos(cluster, idade, estado_civil, filhos, genero):
    """
    Filtra eventos baseado nas condições do eleitor.
    Evita contradições como 'criar filhos sozinho' para casados sem filhos.
    """
    eventos = EVENTOS_BASE.get(cluster, EVENTOS_BASE["G3_media_baixa"]).copy()

    # Adicionar eventos condicionais que fazem sentido

    # "Criar filhos sozinho(a)" só para: tem filhos + não casado + idade >= 25
    if (
        filhos > 0
        and estado_civil in ["solteiro(a)", "divorciado(a)", "viuvo(a)"]
        and idade >= 25
    ):
        eventos.append(EVENTO_CRIAR_FILHOS_SOZINHO)

    # "Migrar do Nordeste" mais comum em G3/G4, idade >= 25
    if cluster in ["G3_media_baixa", "G4_baixa"] and idade >= 25:
        eventos.append(EVENTO_MIGRAR_NORDESTE)

    # "Anos 80/90" só para quem tem idade compatível (nascido antes de 1990 = idade > 35)
    if idade >= 40 and cluster in ["G1_alta", "G2_media_alta"]:
        eventos.append(EVENTO_ANOS_80_90)

    if idade >= 35 and cluster in ["G3_media_baixa", "G4_baixa"]:
        eventos.append(EVENTO_ANOS_90_FAMILIA)

    return eventos


# ========================================
# ORIGEM CONDICIONAL POR IDADE
# ========================================
def escolher_origem(ra, cluster, idade, local_ref):
    """
    Escolhe origem condicionada pela idade do eleitor.
    Evita 'há mais de 20 anos' para jovens de 18 anos.
    """
    if idade < 25:
        opcoes = [
            f"nasceu e cresceu em {ra}",
            f"mora {local_ref} desde criança",
            f"cresceu entre {ra} e cidades vizinhas",
            f"passou a infância em {ra}",
        ]
    elif idade < 40:
        opcoes = [
            f"mora em {ra} desde os anos 2000",
            "chegou ao DF no começo da vida adulta",
            f"vive {local_ref} há mais de 10 anos",
            f"se estabeleceu em {ra} depois de casar",
            f"mora em {ra} desde que começou a trabalhar",
        ]
    elif idade < 55:
        opcoes = [
            f"mora em {ra} há mais de 15 anos",
            f"viu {ra} crescer e mudar com o tempo",
            "chegou em Brasília nos anos 90",
            f"se mudou para {ra} quando casou",
            f"acompanhou a transformação de {ra}",
        ]
    else:
        opcoes = [
            f"mora em {ra} há mais de 20 anos",
            "chegou em Brasília com a família nos anos 80",
            f"viu {ra} nascer e crescer",
            f"é um dos moradores mais antigos de {ra}",
            f"acompanhou toda a história de {ra}",
        ]

    # Para G3/G4, adicionar opção de migração se idade compatível
    if cluster in ["G3_media_baixa", "G4_baixa"] and idade >= 30:
        opcoes.append(f"veio do interior e se estabeleceu {local_ref}")

    return random.choice(opcoes)


# ========================================
# GERAÇÃO DE HISTÓRIA NARRATIVA (CORRIGIDA)
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
    local_ref,
):
    """
    Gera história narrativa com validações para evitar contradições.
    """
    primeiro_nome = nome.split()[0]

    # Origem condicionada por idade
    origem = escolher_origem(ra, cluster, idade, local_ref)

    # Evento filtrado por condições
    eventos = filtrar_eventos(cluster, idade, estado_civil, filhos, genero)
    evento = random.choice(eventos)

    # Situação atual
    if vinculo == "aposentado":
        situacao = "Hoje aposentado(a), vive com o benefício"
        if filhos > 0:
            situacao += " e conta com ajuda da família"
    elif vinculo == "desempregado":
        situacao = "Atualmente desempregado(a), busca recolocação"
    elif vinculo == "autonomo":
        situacao = f"Como {profissao.lower()}, depende da própria clientela"
    elif vinculo == "informal":
        situacao = "Trabalha sem carteira assinada para sobreviver"
    elif vinculo == "servidor_publico":
        situacao = f"A estabilidade como {profissao.lower()} trouxe segurança"
    elif vinculo == "empresario":
        situacao = "Toca o próprio negócio com os riscos e recompensas"
    elif vinculo == "estudante":
        situacao = "Ainda estuda e depende da família"
    else:
        situacao = f"Trabalha como {profissao.lower()}"

    # Crença política (moderada ou forte)
    crenca = escolher_crenca(orientacao)

    # Contexto familiar (coerente com estado civil)
    contexto_familiar = ""
    if filhos > 0:
        if estado_civil in ["casado(a)", "uniao_estavel"]:
            contexto_familiar = f"Casado(a) e com {filhos} filho(s), "
        elif estado_civil in ["divorciado(a)", "viuvo(a)"]:
            contexto_familiar = f"Cria {filhos} filho(s), "
        else:
            contexto_familiar = f"Tem {filhos} filho(s), "

    # Montar história
    historia = f"{primeiro_nome} {origem}. "
    historia += f"A experiência de {evento} moldou sua visão de mundo. "
    historia += f"{contexto_familiar}{situacao}. "
    historia += f"Acredita {crenca}."

    # Nota sobre Bolsonaro se muito engajado
    if posicao_bolsonaro == "apoiador_forte":
        historia += " É eleitor(a) fiel de Bolsonaro."
    elif posicao_bolsonaro == "critico_forte":
        historia += " É crítico(a) ferrenho(a) de Bolsonaro."

    return historia


# ========================================
# SUSCEPTIBILIDADE
# ========================================
def calcular_susceptibilidade(escolaridade, fontes, idade, interesse_politico):
    base = 5.0

    if escolaridade == "superior_completo_ou_pos":
        base -= 1.5
    elif escolaridade == "fundamental_ou_sem_instrucao":
        base += 2.0

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

    base -= qtd_serias * 0.5
    base += qtd_risco * 0.4

    if idade < 25 or idade >= 65:
        base += 0.5

    if interesse_politico == "alto":
        base += 0.3
    elif interesse_politico == "baixo":
        base += 0.5

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
    ],
    "centro": [
        "Equilíbrio",
        "Estabilidade",
        "Eficiência",
        "Pragmatismo",
        "Ordem",
        "Responsabilidade fiscal",
    ],
    "centro-direita": [
        "Família",
        "Trabalho",
        "Livre iniciativa",
        "Segurança",
        "Meritocracia",
        "Empreendedorismo",
    ],
    "direita": [
        "Família tradicional",
        "Fé",
        "Liberdade econômica",
        "Pátria",
        "Propriedade",
        "Segurança",
        "Ordem",
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
    ],
    "centro-esquerda": [
        "Qualidade do ensino",
        "Filas na saúde",
        "Mobilidade urbana",
        "Corrupção",
        "Desigualdade",
    ],
    "centro": [
        "Inflação",
        "Custo de vida",
        "Segurança",
        "Saúde",
        "Educação",
        "Emprego",
        "Corrupção",
    ],
    "centro-direita": [
        "Segurança",
        "Impostos",
        "Burocracia",
        "Criminalidade",
        "Corrupção",
        "Ineficiência estatal",
    ],
    "direita": [
        "Criminalidade",
        "Corrupção",
        "Drogas",
        "Impostos",
        "Insegurança",
        "Degradação moral",
    ],
}


# ========================================
# MEDOS COERENTES COM VÍNCULO
# ========================================
def gerar_medos(cluster, orientacao, vinculo):
    medos_base = {
        "G1_alta": ["Violência urbana", "Crise econômica", "Instabilidade política"],
        "G2_media_alta": [
            "Perder o emprego",
            "Violência",
            "Inflação",
            "Perder plano de saúde",
        ],
        "G3_media_baixa": [
            "Violência",
            "Doença sem atendimento",
            "Não conseguir pagar as contas",
        ],
        "G4_baixa": ["Fome", "Despejo", "Violência", "Ficar sem luz/água"],
    }

    medos_politicos = {
        "direita": ["Brasil virar Venezuela", "Comunismo"],
        "centro-direita": ["Populismo", "Aumento de impostos"],
        "centro": ["Polarização", "Extremismo"],
        "centro-esquerda": ["Retrocesso em direitos", "Desmonte social"],
        "esquerda": ["Golpe militar", "Fascismo"],
    }

    medos = medos_base.get(cluster, []).copy()

    # Ajustar por vínculo
    if vinculo == "autonomo":
        medos.append("Perder clientes")
    elif vinculo == "aposentado":
        medos = [m for m in medos if "emprego" not in m.lower()]
        medos.extend(["Perder benefícios", "Saúde piorar"])
    elif vinculo == "desempregado":
        medos.extend(["Continuar desempregado", "Ficar endividado"])
    elif vinculo == "servidor_publico":
        medos.append("Reforma administrativa")
    elif vinculo == "informal":
        medos.append("Fiscalização")
    elif vinculo == "estudante":
        medos.extend(["Não conseguir emprego", "Não passar no vestibular"])
    elif vinculo in ["clt"]:
        medos.append("Perder o emprego")

    medos_pol = medos_politicos.get(orientacao, [])
    if medos_pol and random.random() < 0.5:
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
    "desconfianca_institucional",
]


def gerar_vieses(interesse_politico):
    if interesse_politico == "baixo":
        num = random.randint(1, 2)
    elif interesse_politico == "medio":
        num = random.randint(2, 3)
    else:
        num = random.randint(2, 4)

    vieses = ["confirmacao"]
    vieses.extend(
        random.sample(
            [v for v in VIESES if v != "confirmacao"], min(num - 1, len(VIESES) - 1)
        )
    )
    return vieses[:num]


# ========================================
# INSTRUÇÃO COMPORTAMENTAL
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
    if idade < 22 and escolaridade == "superior_completo_ou_pos":
        return "medio_completo_ou_sup_incompleto"
    return escolaridade


def gerar_profissao_vinculo(cluster, escolaridade, idade, genero, renda_atual=None):
    """Gera profissão com validação de piso de renda"""
    if idade < 18:
        if random.random() < 0.7:
            return ("Estudante", "estudante", None)
        return ("Jovem Aprendiz", "clt", None)

    if idade >= 65 and random.random() < 0.75:
        return ("Aposentado(a)", "aposentado", None)

    # Taxa de desemprego por cluster
    taxa_desemprego = {
        "G1_alta": 0.03,
        "G2_media_alta": 0.06,
        "G3_media_baixa": 0.10,
        "G4_baixa": 0.15,
    }
    if idade >= 18 and idade <= 60:
        if random.random() < taxa_desemprego.get(cluster, 0.08):
            return ("Desempregado(a)", "desempregado", None)

    opcoes = PROFISSOES.get(cluster, {}).get(escolaridade, [])
    if not opcoes:
        return ("Autônomo(a)", "autonomo", None)

    # Filtrar por idade e estudante se > 28
    if idade > 28:
        opcoes_validas = [
            (p, v, im, rm)
            for p, v, im, rm in opcoes
            if idade >= im and "Estudante" not in p
        ]
    else:
        opcoes_validas = [(p, v, im, rm) for p, v, im, rm in opcoes if idade >= im]

    if not opcoes_validas:
        if idade < 28:
            return ("Estudante", "estudante", None)
        return ("Autônomo(a)", "autonomo", None)

    # Escolher profissão
    prof, vinc, _, renda_min = random.choice(opcoes_validas)
    return (prof, vinc, renda_min)


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
        if tem_metro and random.random() < 0.35:
            return ("metro", random.choice(["30_45", "45_60"]))
        return (
            random.choice(["onibus", "a_pe", "van_pirata"]),
            random.choice(["15_30", "30_45", "45_60"]),
        )

    if vinculo == "autonomo" and any(
        p in profissao.lower()
        for p in ["barbeiro", "cabeleireiro", "manicure", "comerciante"]
    ):
        return (
            random.choice(["moto", "a_pe", "carro"]),
            random.choice(["ate_15", "15_30"]),
        )

    if cluster == "G1_alta":
        if tem_metro and random.random() < 0.25:
            return ("metro", random.choice(["15_30", "30_45"]))
        return (
            random.choice(["carro", "app"]),
            random.choice(["ate_15", "15_30", "30_45"]),
        )

    if cluster == "G2_media_alta":
        if tem_metro and random.random() < 0.55:
            return ("metro", random.choice(["15_30", "30_45"]))
        return (random.choice(["carro", "onibus"]), random.choice(["30_45", "45_60"]))

    if cluster == "G3_media_baixa":
        if tem_metro and random.random() < 0.40:
            return ("metro", random.choice(["30_45", "45_60"]))
        opcoes = ["onibus", "van_pirata", "moto", "bicicleta"]
        pesos = [50, 25, 15, 10]
        return (
            random.choices(opcoes, weights=pesos)[0],
            random.choice(["45_60", "60_75"]),
        )

    if tem_metro and random.random() < 0.30:
        return ("metro", random.choice(["45_60", "60_75"]))
    opcoes = ["onibus", "van_pirata", "a_pe", "bicicleta", "moto"]
    pesos = [40, 25, 15, 10, 10]
    return (
        random.choices(opcoes, weights=pesos)[0],
        random.choice(["45_60", "60_75", "75_90"]),
    )


# ========================================
# GERAÇÃO PRINCIPAL COM REBALANCEAMENTO
# ========================================
def gerar_eleitores():
    """
    Gera eleitores com:
    1. RA fixa (Censo)
    2. Cluster probabilístico por RA
    3. Pools globais independentes de cluster
    """
    eleitores_data = []

    # PASSO 1: Primeiro, atribuir RA e cluster para cada um dos 400 eleitores
    cluster_targets = {
        "G1_alta": 76,
        "G2_media_alta": 85,
        "G3_media_baixa": 126,
        "G4_baixa": 113,
    }
    cluster_assigned = {
        "G1_alta": 0,
        "G2_media_alta": 0,
        "G3_media_baixa": 0,
        "G4_baixa": 0,
    }

    ra_cluster_list = []
    for ra, qtd in RAS:
        for _ in range(qtd):
            # Sortear cluster baseado na RA
            cluster = sortear_cluster(ra)

            # Verificar se cluster ainda tem espaço
            if cluster_assigned[cluster] >= cluster_targets[cluster]:
                # Escolher outro cluster que ainda tem espaço
                available = [
                    c
                    for c in cluster_targets
                    if cluster_assigned[c] < cluster_targets[c]
                ]
                if available:
                    # Preferir clusters compatíveis com a RA
                    probs = CLUSTER_POR_RA.get(
                        ra, {"G3_media_baixa": 50, "G4_baixa": 50}
                    )
                    compatible = [c for c in available if c in probs]
                    if compatible:
                        cluster = random.choice(compatible)
                    else:
                        cluster = random.choice(available)

            cluster_assigned[cluster] += 1
            ra_cluster_list.append((ra, cluster))

    # PASSO 2: Preparar pools globais
    genero_pool = [g for g, q in COTAS_GENERO.items() for _ in range(q)]
    random.shuffle(genero_pool)

    idade_pool = [f for f, q in COTAS_IDADE.items() for _ in range(q)]
    random.shuffle(idade_pool)

    cor_pool = [c for c, q in COTAS_COR_RACA.items() for _ in range(q)]
    random.shuffle(cor_pool)

    # PASSO 3: Pools de renda/escolaridade/religiao por cluster
    renda_pool = {c: [] for c in cluster_targets}
    for c in cluster_targets:
        for renda, qtd in CLUSTER_RENDA[c].items():
            renda_pool[c].extend([renda] * qtd)
        random.shuffle(renda_pool[c])

    escolaridade_pool = {c: [] for c in cluster_targets}
    for c in cluster_targets:
        for esc, qtd in CLUSTER_ESCOLARIDADE[c].items():
            escolaridade_pool[c].extend([esc] * qtd)
        random.shuffle(escolaridade_pool[c])

    religiao_pool = {c: [] for c in cluster_targets}
    for c in cluster_targets:
        for rel, qtd in CLUSTER_RELIGIAO[c].items():
            religiao_pool[c].extend([rel] * qtd)
        random.shuffle(religiao_pool[c])

    pool_idx = {c: 0 for c in cluster_targets}

    # PASSO 4: Gerar cada eleitor (usa ra_cluster_list diretamente, já está na ordem correta)
    for idx_global, (ra, cluster) in enumerate(ra_cluster_list):
        # Obter dados do pool do cluster
        idx_c = pool_idx[cluster]
        renda = (
            renda_pool[cluster][idx_c]
            if idx_c < len(renda_pool[cluster])
            else "mais_de_1_ate_2"
        )
        escolaridade_raw = (
            escolaridade_pool[cluster][idx_c]
            if idx_c < len(escolaridade_pool[cluster])
            else "medio_completo_ou_sup_incompleto"
        )
        religiao = (
            religiao_pool[cluster][idx_c]
            if idx_c < len(religiao_pool[cluster])
            else "catolica"
        )
        pool_idx[cluster] += 1

        # Dados globais
        genero = genero_pool[idx_global]
        idade_faixa = idade_pool[idx_global]
        cor_raca = cor_pool[idx_global]

        idade = gerar_idade_para_faixa(idade_faixa)
        escolaridade = ajustar_escolaridade_por_idade(escolaridade_raw, idade)
        profissao, vinculo, renda_minima = gerar_profissao_vinculo(
            cluster, escolaridade, idade, genero, renda
        )

        # Aplicar piso de renda se necessário
        if renda_minima:
            ordem_renda = [
                "ate_1",
                "mais_de_1_ate_2",
                "mais_de_2_ate_5",
                "mais_de_5_ate_10",
                "mais_de_10_ate_20",
                "mais_de_20",
            ]
            idx_atual = ordem_renda.index(renda) if renda in ordem_renda else 0
            idx_minimo = (
                ordem_renda.index(renda_minima) if renda_minima in ordem_renda else 0
            )
            if idx_atual < idx_minimo:
                renda = renda_minima

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

        # Local de referência
        locais_ra = LOCAIS_REFERENCIA.get(ra, ["no centro"])
        local_referencia = random.choice(locais_ra)

        transporte, tempo = gerar_transporte_deslocamento(
            cluster, vinculo, profissao, ra
        )
        fontes = gerar_fontes_informacao(cluster, idade, escolaridade)
        susceptibilidade = calcular_susceptibilidade(
            escolaridade, fontes, idade, interesse_politico
        )
        vieses = gerar_vieses(interesse_politico)
        medos = gerar_medos(cluster, orientacao, vinculo)

        valores = random.sample(
            VALORES.get(orientacao, VALORES["centro"]),
            min(3, len(VALORES.get(orientacao, []))),
        )
        preocupacoes = random.sample(
            PREOCUPACOES.get(orientacao, PREOCUPACOES["centro"]),
            min(3, len(PREOCUPACOES.get(orientacao, []))),
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
            local_referencia,
        )

        instrucao = gerar_instrucao_comportamental(
            interesse_politico, tolerancia_nuance, estilo_decisao
        )
        voto_facultativo = idade < 18 or idade >= 70

        # Conflito identitário
        conflito_identitario = religiao == "evangelica" and orientacao in [
            "esquerda",
            "centro-esquerda",
        ]

        # Campo observacao_territorial para SIA
        obs_territorial = (
            "Caso atípico: residente em área industrial" if ra == "SIA" else None
        )

        eleitor = {
            "id": f"df-{len(eleitores_data)+1:04d}",
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

        if obs_territorial:
            eleitor["observacao_territorial"] = obs_territorial

        eleitores_data.append(eleitor)

    return eleitores_data


# ========================================
# VALIDAÇÃO EXTENDIDA
# ========================================
def validar(eleitores):
    erros = []
    avisos = []

    if len(eleitores) != 400:
        erros.append(f"Total: {len(eleitores)} (esperado 400)")

    # Jovens com superior
    jovens_sup = [
        e
        for e in eleitores
        if e["idade"] < 22 and e["escolaridade"] == "superior_completo_ou_pos"
    ]
    if jovens_sup:
        erros.append(f"Jovens <22 com superior: {len(jovens_sup)}")

    # Aposentados com deslocamento
    apos = [
        e
        for e in eleitores
        if e["ocupacao_vinculo"] == "aposentado"
        and e["tempo_deslocamento_trabalho"] != "nao_se_aplica"
    ]
    if apos:
        erros.append(f"Aposentados com deslocamento: {len(apos)}")

    # Validação de histórias
    for e in eleitores:
        hist = e["historia_resumida"]
        idade = e["idade"]

        # "há mais de 20 anos" só para 40+
        if "há mais de 20 anos" in hist and idade < 40:
            avisos.append(f"{e['id']}: 'há mais de 20 anos' com {idade} anos")

        # "anos 80/90" só para 35+
        if ("anos 80" in hist or "anos 90" in hist) and idade < 35:
            avisos.append(f"{e['id']}: 'anos 80/90' com {idade} anos")

        # "criar filhos sozinho(a)" precisa ter filhos e não ser casado
        if "criar os filhos sozinho" in hist:
            if e["filhos"] == 0:
                avisos.append(f"{e['id']}: 'criar filhos sozinho' sem filhos")
            if e["estado_civil"] in ["casado(a)", "uniao_estavel"]:
                avisos.append(
                    f"{e['id']}: 'criar filhos sozinho' mas {e['estado_civil']}"
                )

    # Cotas de idade
    idade_counts = {"16-24": 0, "25-34": 0, "35-44": 0, "45-59": 0, "60+": 0}
    for e in eleitores:
        i = e["idade"]
        if i < 25:
            idade_counts["16-24"] += 1
        elif i < 35:
            idade_counts["25-34"] += 1
        elif i < 45:
            idade_counts["35-44"] += 1
        elif i < 60:
            idade_counts["45-59"] += 1
        else:
            idade_counts["60+"] += 1

    for faixa, esperado in COTAS_IDADE.items():
        real = idade_counts[faixa]
        if real != esperado:
            erros.append(f"Idade {faixa}: {real} (esperado {esperado})")

    return erros, avisos


# ========================================
# MAIN
# ========================================
if __name__ == "__main__":
    print("Gerando 400 eleitores do DF v4.0...")
    eleitores = gerar_eleitores()

    print("\nValidando...")
    erros, avisos = validar(eleitores)

    if erros:
        print("ERROS:", erros)
    else:
        print("Validacao OK!")

    if avisos:
        print(f"\nAVISOS ({len(avisos)}):")
        for a in avisos[:10]:
            print(f"  {a}")
        if len(avisos) > 10:
            print(f"  ... e mais {len(avisos)-10}")

    print("\n=== ESTATISTICAS ===")

    # Clusters
    cluster_counts = {}
    for e in eleitores:
        c = e["cluster_socioeconomico"]
        cluster_counts[c] = cluster_counts.get(c, 0) + 1
    print("Clusters:")
    for c, qtd in sorted(cluster_counts.items()):
        print(f"  {c}: {qtd}")

    # Bolsonaro
    pos_bol = {}
    for e in eleitores:
        pb = e["posicao_bolsonaro"]
        pos_bol[pb] = pos_bol.get(pb, 0) + 1
    apoiadores = pos_bol.get("apoiador_forte", 0) + pos_bol.get("apoiador_moderado", 0)
    print(f"\nApoiadores Bolsonaro: {apoiadores} ({apoiadores/4:.1f}%)")

    # Escolaridade
    esc_counts = {}
    for e in eleitores:
        es = e["escolaridade"]
        esc_counts[es] = esc_counts.get(es, 0) + 1
    print(
        f"\nEscolaridade superior: {esc_counts.get('superior_completo_ou_pos', 0)} (meta: {COTA_ESCOLARIDADE_SUPERIOR})"
    )

    # Susceptibilidade
    print("\nSusceptibilidade media por escolaridade:")
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

    # Desempregados
    desemp = sum(1 for e in eleitores if e["ocupacao_vinculo"] == "desempregado")
    print(f"\nDesempregados: {desemp} ({desemp/4:.1f}%)")

    # Van pirata
    van = sum(1 for e in eleitores if e["meio_transporte"] == "van_pirata")
    print(f"Van pirata: {van} ({van/4:.1f}%)")

    # SIA
    sia = [e for e in eleitores if e["regiao_administrativa"] == "SIA"]
    if sia:
        print(f"\nSIA: {len(sia)} eleitor(es)")
        for s in sia:
            print(
                f"  {s['id']}: {s['profissao']}, {s.get('observacao_territorial', '')}"
            )

    # Salvar
    with open("agentes/banco-eleitores-df.json", "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print("\nArquivo salvo: agentes/banco-eleitores-df.json")

    # Amostra
    print("\n=== AMOSTRA DE HISTORIAS ===")
    for e in eleitores[50:53]:
        print(
            f"{e['id']} ({e['profissao']}, {e['regiao_administrativa']}, {e['idade']} anos):"
        )
        print(f"  {e['historia_resumida']}")
        print()
