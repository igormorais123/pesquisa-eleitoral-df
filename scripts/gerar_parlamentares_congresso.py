#!/usr/bin/env python3
"""
Script para gerar banco de dados completo de parlamentares do Congresso Nacional brasileiro.
- 81 Senadores (3 por estado)
- 513 Deputados Federais (distribuídos por população)
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
import os

# Configuração de caminhos
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AGENTES_DIR = os.path.join(BASE_DIR, "agentes")
PUBLIC_DATA_DIR = os.path.join(BASE_DIR, "frontend", "public", "data")

# Distribuição de deputados por estado
DEPUTADOS_POR_ESTADO = {
    "SP": 70, "MG": 53, "RJ": 46, "BA": 39, "RS": 31,
    "PR": 30, "PE": 25, "CE": 22, "MA": 18, "GO": 17,
    "PA": 17, "SC": 16, "PB": 12, "PI": 10, "ES": 10,
    "AL": 9, "RN": 8, "MT": 8, "MS": 8, "AM": 8,
    "SE": 8, "RO": 8, "TO": 8, "AC": 8, "AP": 8,
    "RR": 8, "DF": 8
}

# Estados brasileiros com capitais
ESTADOS = {
    "AC": {"nome": "Acre", "capital": "Rio Branco"},
    "AL": {"nome": "Alagoas", "capital": "Maceió"},
    "AP": {"nome": "Amapá", "capital": "Macapá"},
    "AM": {"nome": "Amazonas", "capital": "Manaus"},
    "BA": {"nome": "Bahia", "capital": "Salvador"},
    "CE": {"nome": "Ceará", "capital": "Fortaleza"},
    "DF": {"nome": "Distrito Federal", "capital": "Brasília"},
    "ES": {"nome": "Espírito Santo", "capital": "Vitória"},
    "GO": {"nome": "Goiás", "capital": "Goiânia"},
    "MA": {"nome": "Maranhão", "capital": "São Luís"},
    "MT": {"nome": "Mato Grosso", "capital": "Cuiabá"},
    "MS": {"nome": "Mato Grosso do Sul", "capital": "Campo Grande"},
    "MG": {"nome": "Minas Gerais", "capital": "Belo Horizonte"},
    "PA": {"nome": "Pará", "capital": "Belém"},
    "PB": {"nome": "Paraíba", "capital": "João Pessoa"},
    "PR": {"nome": "Paraná", "capital": "Curitiba"},
    "PE": {"nome": "Pernambuco", "capital": "Recife"},
    "PI": {"nome": "Piauí", "capital": "Teresina"},
    "RJ": {"nome": "Rio de Janeiro", "capital": "Rio de Janeiro"},
    "RN": {"nome": "Rio Grande do Norte", "capital": "Natal"},
    "RS": {"nome": "Rio Grande do Sul", "capital": "Porto Alegre"},
    "RO": {"nome": "Rondônia", "capital": "Porto Velho"},
    "RR": {"nome": "Roraima", "capital": "Boa Vista"},
    "SC": {"nome": "Santa Catarina", "capital": "Florianópolis"},
    "SP": {"nome": "São Paulo", "capital": "São Paulo"},
    "SE": {"nome": "Sergipe", "capital": "Aracaju"},
    "TO": {"nome": "Tocantins", "capital": "Palmas"}
}

# Partidos políticos brasileiros
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
    {"sigla": "NOVO", "numero": 30, "orientacao": "direita"},
    {"sigla": "AVANTE", "numero": 70, "orientacao": "centro"},
    {"sigla": "SOLIDARIEDADE", "numero": 77, "orientacao": "centro"},
    {"sigla": "CIDADANIA", "numero": 23, "orientacao": "centro-esquerda"},
    {"sigla": "PRD", "numero": 25, "orientacao": "centro"},
    {"sigla": "REDE", "numero": 18, "orientacao": "centro-esquerda"},
]

# Dados para geração de perfis realistas
NOMES_MASCULINOS = [
    "João", "José", "Carlos", "Paulo", "Pedro", "Lucas", "Marcos", "Luis",
    "Rafael", "Fernando", "Ricardo", "Eduardo", "André", "Bruno", "Diego",
    "Rodrigo", "Gustavo", "Leonardo", "Marcelo", "Roberto", "Antonio",
    "Francisco", "Sérgio", "Alexandre", "Daniel", "Thiago", "Fábio",
    "Vinícius", "Felipe", "Márcio", "Cláudio", "Gilberto", "Henrique",
    "Renato", "Adriano", "Wellington", "Jorge", "Nilson", "Valdemar",
    "Romeu", "Afonso", "Osvaldo", "Reginaldo", "Sandro", "Evandro"
]

NOMES_FEMININOS = [
    "Maria", "Ana", "Carla", "Patrícia", "Fernanda", "Juliana", "Mariana",
    "Camila", "Larissa", "Beatriz", "Amanda", "Renata", "Tatiana", "Vanessa",
    "Cristina", "Adriana", "Sandra", "Mônica", "Cláudia", "Lúcia", "Helena",
    "Regina", "Teresa", "Rose", "Erika", "Flávia", "Soraya", "Simone",
    "Margarete", "Jandira", "Gleisi", "Eliziane", "Leila", "Tereza",
    "Zenaide", "Damares", "Silvia", "Laura", "Célia", "Rosana"
]

SOBRENOMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves",
    "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho",
    "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha",
    "Dias", "Nascimento", "Andrade", "Moreira", "Nunes", "Marques", "Machado",
    "Mendes", "Freitas", "Cardoso", "Ramos", "Gonçalves", "Santana", "Teixeira",
    "Moura", "Castro", "Melo", "Araújo", "Correia", "Pinto", "Cunha", "Campos",
    "Monteiro", "Reis", "Azevedo", "Borges", "Bezerra", "Maia", "Coelho"
]

FORMACOES = [
    "Direito", "Medicina", "Engenharia Civil", "Administração", "Economia",
    "Ciências Contábeis", "Comunicação Social", "Jornalismo", "Pedagogia",
    "Ciências Políticas", "Relações Internacionais", "Agronomia", "Veterinária",
    "Odontologia", "Farmácia", "Psicologia", "Sociologia", "História",
    "Teologia", "Educação Física", "Enfermagem", "Arquitetura"
]

PROFISSOES = [
    "Advogado", "Médico", "Empresário", "Engenheiro", "Professor",
    "Economista", "Jornalista", "Agricultor", "Pecuarista", "Comerciante",
    "Policial", "Delegado", "Promotor", "Juiz aposentado", "Servidor público",
    "Pastor", "Sindicalista", "Comunicador", "Radialista", "Administrador"
]

RELIGIOES = [
    "catolica", "evangelica", "espirita", "sem_religiao", "outras"
]

ESTILOS_COMUNICACAO = [
    "combativo", "articulado", "popular", "tecnico", "religioso",
    "emotivo", "conciliador", "didatico", "autoritario", "carismatico"
]

TEMAS_ATUACAO = [
    "Economia", "Saúde", "Educação", "Segurança Pública", "Agricultura",
    "Meio Ambiente", "Direitos Humanos", "Infraestrutura", "Tecnologia",
    "Defesa", "Trabalho", "Previdência", "Cultura", "Esporte", "Turismo",
    "Ciência e Tecnologia", "Energia", "Transportes", "Comunicações",
    "Indústria e Comércio", "Relações Exteriores", "Direitos da Mulher",
    "Direitos LGBTI+", "Povos Indígenas", "Terceiro Setor"
]

COMISSOES_CAMARA = [
    "Comissão de Constituição e Justiça e de Cidadania",
    "Comissão de Finanças e Tributação",
    "Comissão de Educação",
    "Comissão de Saúde",
    "Comissão de Agricultura, Pecuária, Abastecimento e Desenvolvimento Rural",
    "Comissão de Segurança Pública e Combate ao Crime Organizado",
    "Comissão de Meio Ambiente e Desenvolvimento Sustentável",
    "Comissão de Direitos Humanos, Minorias e Igualdade Racial",
    "Comissão de Trabalho, Administração e Serviço Público",
    "Comissão de Ciência, Tecnologia e Inovação",
    "Comissão de Defesa Nacional",
    "Comissão de Relações Exteriores e de Defesa Nacional",
    "Comissão de Viação e Transportes",
    "Comissão de Desenvolvimento Urbano",
    "Comissão de Minas e Energia"
]

COMISSOES_SENADO = [
    "Comissão de Constituição, Justiça e Cidadania",
    "Comissão de Assuntos Econômicos",
    "Comissão de Assuntos Sociais",
    "Comissão de Educação, Cultura e Esporte",
    "Comissão de Meio Ambiente",
    "Comissão de Infraestrutura",
    "Comissão de Agricultura e Reforma Agrária",
    "Comissão de Direitos Humanos e Legislação Participativa",
    "Comissão de Relações Exteriores e Defesa Nacional",
    "Comissão de Ciência, Tecnologia, Inovação, Comunicação e Informática",
    "Comissão de Desenvolvimento Regional e Turismo",
    "Comissão de Serviços de Infraestrutura"
]

# ============================================================================
# SENADORES REAIS DO BRASIL (57ª Legislatura - 2023-2031)
# ============================================================================

SENADORES_REAIS = [
    # ACRE
    {"nome": "Sérgio Petecão", "partido": "PSD", "uf": "AC", "genero": "masculino"},
    {"nome": "Márcio Bittar", "partido": "UNIÃO", "uf": "AC", "genero": "masculino"},
    {"nome": "Alan Rick", "partido": "UNIÃO", "uf": "AC", "genero": "masculino"},

    # ALAGOAS
    {"nome": "Renan Calheiros", "partido": "MDB", "uf": "AL", "genero": "masculino"},
    {"nome": "Rodrigo Cunha", "partido": "UNIÃO", "uf": "AL", "genero": "masculino"},
    {"nome": "Renan Filho", "partido": "MDB", "uf": "AL", "genero": "masculino"},

    # AMAPÁ
    {"nome": "Davi Alcolumbre", "partido": "UNIÃO", "uf": "AP", "genero": "masculino"},
    {"nome": "Randolfe Rodrigues", "partido": "PT", "uf": "AP", "genero": "masculino"},
    {"nome": "Lucas Barreto", "partido": "PSD", "uf": "AP", "genero": "masculino"},

    # AMAZONAS
    {"nome": "Omar Aziz", "partido": "PSD", "uf": "AM", "genero": "masculino"},
    {"nome": "Eduardo Braga", "partido": "MDB", "uf": "AM", "genero": "masculino"},
    {"nome": "Plínio Valério", "partido": "PSDB", "uf": "AM", "genero": "masculino"},

    # BAHIA
    {"nome": "Jaques Wagner", "partido": "PT", "uf": "BA", "genero": "masculino"},
    {"nome": "Otto Alencar", "partido": "PSD", "uf": "BA", "genero": "masculino"},
    {"nome": "Angelo Coronel", "partido": "PSD", "uf": "BA", "genero": "masculino"},

    # CEARÁ
    {"nome": "Cid Gomes", "partido": "PSB", "uf": "CE", "genero": "masculino"},
    {"nome": "Augusta Brito", "partido": "PT", "uf": "CE", "genero": "feminino"},
    {"nome": "Janaína Farias", "partido": "PT", "uf": "CE", "genero": "feminino"},

    # DISTRITO FEDERAL
    {"nome": "Izalci Lucas", "partido": "PL", "uf": "DF", "genero": "masculino"},
    {"nome": "Damares Alves", "partido": "REPUBLICANOS", "uf": "DF", "genero": "feminino"},
    {"nome": "Leila Barros", "partido": "PDT", "uf": "DF", "genero": "feminino"},

    # ESPÍRITO SANTO
    {"nome": "Fabiano Contarato", "partido": "PT", "uf": "ES", "genero": "masculino"},
    {"nome": "Marcos do Val", "partido": "PODE", "uf": "ES", "genero": "masculino"},
    {"nome": "Magno Malta", "partido": "PL", "uf": "ES", "genero": "masculino"},

    # GOIÁS
    {"nome": "Vanderlan Cardoso", "partido": "PSD", "uf": "GO", "genero": "masculino"},
    {"nome": "Jorge Kajuru", "partido": "PSB", "uf": "GO", "genero": "masculino"},
    {"nome": "Wilder Morais", "partido": "PL", "uf": "GO", "genero": "masculino"},

    # MARANHÃO
    {"nome": "Weverton Rocha", "partido": "PDT", "uf": "MA", "genero": "masculino"},
    {"nome": "Eliziane Gama", "partido": "PSD", "uf": "MA", "genero": "feminino"},
    {"nome": "Roberto Rocha", "partido": "PTB", "uf": "MA", "genero": "masculino"},

    # MATO GROSSO
    {"nome": "Wellington Fagundes", "partido": "PL", "uf": "MT", "genero": "masculino"},
    {"nome": "Jayme Campos", "partido": "UNIÃO", "uf": "MT", "genero": "masculino"},
    {"nome": "Carlos Fávaro", "partido": "PSD", "uf": "MT", "genero": "masculino"},

    # MATO GROSSO DO SUL
    {"nome": "Nelsinho Trad", "partido": "PSD", "uf": "MS", "genero": "masculino"},
    {"nome": "Tereza Cristina", "partido": "PP", "uf": "MS", "genero": "feminino"},
    {"nome": "Soraya Thronicke", "partido": "UNIÃO", "uf": "MS", "genero": "feminino"},

    # MINAS GERAIS
    {"nome": "Rodrigo Pacheco", "partido": "PSD", "uf": "MG", "genero": "masculino"},
    {"nome": "Carlos Viana", "partido": "PODE", "uf": "MG", "genero": "masculino"},
    {"nome": "Cleitinho Azevedo", "partido": "REPUBLICANOS", "uf": "MG", "genero": "masculino"},

    # PARÁ
    {"nome": "Jader Barbalho", "partido": "MDB", "uf": "PA", "genero": "masculino"},
    {"nome": "Beto Faro", "partido": "PT", "uf": "PA", "genero": "masculino"},
    {"nome": "Zequinha Marinho", "partido": "PL", "uf": "PA", "genero": "masculino"},

    # PARAÍBA
    {"nome": "Veneziano Vital do Rêgo", "partido": "MDB", "uf": "PB", "genero": "masculino"},
    {"nome": "Efraim Filho", "partido": "UNIÃO", "uf": "PB", "genero": "masculino"},
    {"nome": "Daniella Ribeiro", "partido": "PP", "uf": "PB", "genero": "feminino"},

    # PARANÁ
    {"nome": "Alvaro Dias", "partido": "PODE", "uf": "PR", "genero": "masculino"},
    {"nome": "Oriovisto Guimarães", "partido": "PODE", "uf": "PR", "genero": "masculino"},
    {"nome": "Sergio Moro", "partido": "UNIÃO", "uf": "PR", "genero": "masculino"},

    # PERNAMBUCO
    {"nome": "Humberto Costa", "partido": "PT", "uf": "PE", "genero": "masculino"},
    {"nome": "Fernando Dueire", "partido": "MDB", "uf": "PE", "genero": "masculino"},
    {"nome": "Teresa Leitão", "partido": "PT", "uf": "PE", "genero": "feminino"},

    # PIAUÍ
    {"nome": "Ciro Nogueira", "partido": "PP", "uf": "PI", "genero": "masculino"},
    {"nome": "Marcelo Castro", "partido": "MDB", "uf": "PI", "genero": "masculino"},
    {"nome": "Wellington Dias", "partido": "PT", "uf": "PI", "genero": "masculino"},

    # RIO DE JANEIRO
    {"nome": "Flávio Bolsonaro", "partido": "PL", "uf": "RJ", "genero": "masculino"},
    {"nome": "Romário", "partido": "PL", "uf": "RJ", "genero": "masculino"},
    {"nome": "Carlos Portinho", "partido": "PL", "uf": "RJ", "genero": "masculino"},

    # RIO GRANDE DO NORTE
    {"nome": "Rogério Marinho", "partido": "PL", "uf": "RN", "genero": "masculino"},
    {"nome": "Zenaide Maia", "partido": "PSD", "uf": "RN", "genero": "feminino"},
    {"nome": "Styvenson Valentim", "partido": "PODE", "uf": "RN", "genero": "masculino"},

    # RIO GRANDE DO SUL
    {"nome": "Paulo Paim", "partido": "PT", "uf": "RS", "genero": "masculino"},
    {"nome": "Lasier Martins", "partido": "PODE", "uf": "RS", "genero": "masculino"},
    {"nome": "Hamilton Mourão", "partido": "REPUBLICANOS", "uf": "RS", "genero": "masculino"},

    # RONDÔNIA
    {"nome": "Confúcio Moura", "partido": "MDB", "uf": "RO", "genero": "masculino"},
    {"nome": "Marcos Rogério", "partido": "PL", "uf": "RO", "genero": "masculino"},
    {"nome": "Jaime Bagattoli", "partido": "PL", "uf": "RO", "genero": "masculino"},

    # RORAIMA
    {"nome": "Chico Rodrigues", "partido": "PSB", "uf": "RR", "genero": "masculino"},
    {"nome": "Mecias de Jesus", "partido": "REPUBLICANOS", "uf": "RR", "genero": "masculino"},
    {"nome": "Hiran Gonçalves", "partido": "PP", "uf": "RR", "genero": "masculino"},

    # SANTA CATARINA
    {"nome": "Esperidião Amin", "partido": "PP", "uf": "SC", "genero": "masculino"},
    {"nome": "Jorginho Mello", "partido": "PL", "uf": "SC", "genero": "masculino"},
    {"nome": "Jorge Seif", "partido": "PL", "uf": "SC", "genero": "masculino"},

    # SÃO PAULO
    {"nome": "Mara Gabrilli", "partido": "PSD", "uf": "SP", "genero": "feminino"},
    {"nome": "Astronauta Marcos Pontes", "partido": "PL", "uf": "SP", "genero": "masculino"},
    {"nome": "Haddad", "partido": "PT", "uf": "SP", "genero": "masculino"},

    # SERGIPE
    {"nome": "Rogério Carvalho", "partido": "PT", "uf": "SE", "genero": "masculino"},
    {"nome": "Alessandro Vieira", "partido": "MDB", "uf": "SE", "genero": "masculino"},
    {"nome": "Laércio Oliveira", "partido": "PP", "uf": "SE", "genero": "masculino"},

    # TOCANTINS
    {"nome": "Eduardo Gomes", "partido": "PL", "uf": "TO", "genero": "masculino"},
    {"nome": "Irajá Abreu", "partido": "PSD", "uf": "TO", "genero": "masculino"},
    {"nome": "Dorinha Seabra", "partido": "UNIÃO", "uf": "TO", "genero": "feminino"},
]

# ============================================================================
# DEPUTADOS FEDERAIS REAIS (principais por estado)
# ============================================================================

DEPUTADOS_REAIS = [
    # SÃO PAULO (70 vagas)
    {"nome": "Guilherme Boulos", "partido": "PSOL", "uf": "SP", "genero": "masculino"},
    {"nome": "Kim Kataguiri", "partido": "UNIÃO", "uf": "SP", "genero": "masculino"},
    {"nome": "Tabata Amaral", "partido": "PSB", "uf": "SP", "genero": "feminino"},
    {"nome": "Carla Zambelli", "partido": "PL", "uf": "SP", "genero": "feminino"},
    {"nome": "Eduardo Bolsonaro", "partido": "PL", "uf": "SP", "genero": "masculino"},
    {"nome": "Sâmia Bomfim", "partido": "PSOL", "uf": "SP", "genero": "feminino"},
    {"nome": "Marina Helou", "partido": "REDE", "uf": "SP", "genero": "feminino"},
    {"nome": "Paulo Teixeira", "partido": "PT", "uf": "SP", "genero": "masculino"},
    {"nome": "Ricardo Salles", "partido": "PL", "uf": "SP", "genero": "masculino"},
    {"nome": "Luiza Erundina", "partido": "PSOL", "uf": "SP", "genero": "feminino"},
    {"nome": "Baleia Rossi", "partido": "MDB", "uf": "SP", "genero": "masculino"},
    {"nome": "Orlando Silva", "partido": "PCdoB", "uf": "SP", "genero": "masculino"},
    {"nome": "Vicentinho", "partido": "PT", "uf": "SP", "genero": "masculino"},
    {"nome": "Paulinho da Força", "partido": "SOLIDARIEDADE", "uf": "SP", "genero": "masculino"},
    {"nome": "Ricardo Izar", "partido": "PP", "uf": "SP", "genero": "masculino"},

    # RIO DE JANEIRO (46 vagas)
    {"nome": "Talíria Petrone", "partido": "PSOL", "uf": "RJ", "genero": "feminino"},
    {"nome": "Benedita da Silva", "partido": "PT", "uf": "RJ", "genero": "feminino"},
    {"nome": "Marcelo Freixo", "partido": "PSB", "uf": "RJ", "genero": "masculino"},
    {"nome": "Jandira Feghali", "partido": "PCdoB", "uf": "RJ", "genero": "feminino"},
    {"nome": "Chiquinho Brazão", "partido": "UNIÃO", "uf": "RJ", "genero": "masculino"},
    {"nome": "Sóstenes Cavalcante", "partido": "PL", "uf": "RJ", "genero": "masculino"},
    {"nome": "Chris Tonietto", "partido": "PL", "uf": "RJ", "genero": "feminino"},
    {"nome": "Otoni de Paula", "partido": "MDB", "uf": "RJ", "genero": "masculino"},
    {"nome": "Daniela do Waguinho", "partido": "UNIÃO", "uf": "RJ", "genero": "feminino"},
    {"nome": "Lindbergh Farias", "partido": "PT", "uf": "RJ", "genero": "masculino"},
    {"nome": "Washington Quaquá", "partido": "PT", "uf": "RJ", "genero": "masculino"},

    # MINAS GERAIS (53 vagas)
    {"nome": "Nikolas Ferreira", "partido": "PL", "uf": "MG", "genero": "masculino"},
    {"nome": "Rogério Correia", "partido": "PT", "uf": "MG", "genero": "masculino"},
    {"nome": "Odair Cunha", "partido": "PT", "uf": "MG", "genero": "masculino"},
    {"nome": "Patrus Ananias", "partido": "PT", "uf": "MG", "genero": "masculino"},
    {"nome": "Reginaldo Lopes", "partido": "PT", "uf": "MG", "genero": "masculino"},
    {"nome": "Domingos Sávio", "partido": "PL", "uf": "MG", "genero": "masculino"},
    {"nome": "Lincoln Portela", "partido": "PL", "uf": "MG", "genero": "masculino"},
    {"nome": "Greyce Elias", "partido": "AVANTE", "uf": "MG", "genero": "feminino"},
    {"nome": "Delegado Marcelo Freitas", "partido": "UNIÃO", "uf": "MG", "genero": "masculino"},
    {"nome": "Igor Timo", "partido": "PODE", "uf": "MG", "genero": "masculino"},

    # BAHIA (39 vagas)
    {"nome": "Alice Portugal", "partido": "PCdoB", "uf": "BA", "genero": "feminino"},
    {"nome": "Lídice da Mata", "partido": "PSB", "uf": "BA", "genero": "feminino"},
    {"nome": "Zé Neto", "partido": "PT", "uf": "BA", "genero": "masculino"},
    {"nome": "Claudio Cajado", "partido": "PP", "uf": "BA", "genero": "masculino"},
    {"nome": "Bacelar", "partido": "PV", "uf": "BA", "genero": "masculino"},
    {"nome": "Elmar Nascimento", "partido": "UNIÃO", "uf": "BA", "genero": "masculino"},
    {"nome": "Afonso Florence", "partido": "PT", "uf": "BA", "genero": "masculino"},
    {"nome": "Jorge Solla", "partido": "PT", "uf": "BA", "genero": "masculino"},

    # RIO GRANDE DO SUL (31 vagas)
    {"nome": "Maria do Rosário", "partido": "PT", "uf": "RS", "genero": "feminino"},
    {"nome": "Fernanda Melchionna", "partido": "PSOL", "uf": "RS", "genero": "feminino"},
    {"nome": "Pompeo de Mattos", "partido": "PDT", "uf": "RS", "genero": "masculino"},
    {"nome": "Bohn Gass", "partido": "PT", "uf": "RS", "genero": "masculino"},
    {"nome": "Marcel van Hattem", "partido": "NOVO", "uf": "RS", "genero": "masculino"},
    {"nome": "Afonso Hamm", "partido": "PP", "uf": "RS", "genero": "masculino"},
    {"nome": "Osmar Terra", "partido": "MDB", "uf": "RS", "genero": "masculino"},
    {"nome": "Luciano Zucco", "partido": "PL", "uf": "RS", "genero": "masculino"},

    # PARANÁ (30 vagas)
    {"nome": "Filipe Barros", "partido": "PL", "uf": "PR", "genero": "masculino"},
    {"nome": "Aline Sleutjes", "partido": "PP", "uf": "PR", "genero": "feminino"},
    {"nome": "Giacobo", "partido": "PL", "uf": "PR", "genero": "masculino"},
    {"nome": "Luciano Ducci", "partido": "PSB", "uf": "PR", "genero": "masculino"},
    {"nome": "Sandro Alex", "partido": "PSD", "uf": "PR", "genero": "masculino"},
    {"nome": "Toninho Wandscheer", "partido": "PP", "uf": "PR", "genero": "masculino"},
    {"nome": "Ney Leprevost", "partido": "UNIÃO", "uf": "PR", "genero": "masculino"},

    # PERNAMBUCO (25 vagas)
    {"nome": "Fernando Lyra", "partido": "PSB", "uf": "PE", "genero": "masculino"},
    {"nome": "Túlio Gadêlha", "partido": "REDE", "uf": "PE", "genero": "masculino"},
    {"nome": "Mendonça Filho", "partido": "UNIÃO", "uf": "PE", "genero": "masculino"},
    {"nome": "Gonzaga Patriota", "partido": "PSB", "uf": "PE", "genero": "masculino"},
    {"nome": "André de Paula", "partido": "PSD", "uf": "PE", "genero": "masculino"},
    {"nome": "Pedro Campos", "partido": "PSB", "uf": "PE", "genero": "masculino"},

    # CEARÁ (22 vagas)
    {"nome": "André Figueiredo", "partido": "PDT", "uf": "CE", "genero": "masculino"},
    {"nome": "José Guimarães", "partido": "PT", "uf": "CE", "genero": "masculino"},
    {"nome": "Leônidas Cristino", "partido": "PDT", "uf": "CE", "genero": "masculino"},
    {"nome": "Domingos Neto", "partido": "PSD", "uf": "CE", "genero": "masculino"},
    {"nome": "Idilvan Alencar", "partido": "PDT", "uf": "CE", "genero": "masculino"},
    {"nome": "Luizianne Lins", "partido": "PT", "uf": "CE", "genero": "feminino"},

    # MARANHÃO (18 vagas)
    {"nome": "Márcio Jerry", "partido": "PCdoB", "uf": "MA", "genero": "masculino"},
    {"nome": "Bira do Pindaré", "partido": "PSB", "uf": "MA", "genero": "masculino"},
    {"nome": "Rubens Pereira Júnior", "partido": "PT", "uf": "MA", "genero": "masculino"},
    {"nome": "Josimar Maranhãozinho", "partido": "PL", "uf": "MA", "genero": "masculino"},

    # GOIÁS (17 vagas)
    {"nome": "Delegado Waldir", "partido": "UNIÃO", "uf": "GO", "genero": "masculino"},
    {"nome": "Major Vitor Hugo", "partido": "PL", "uf": "GO", "genero": "masculino"},
    {"nome": "Adriana Accorsi", "partido": "PT", "uf": "GO", "genero": "feminino"},
    {"nome": "Flávia Morais", "partido": "PDT", "uf": "GO", "genero": "feminino"},
    {"nome": "Rubens Otoni", "partido": "PT", "uf": "GO", "genero": "masculino"},

    # PARÁ (17 vagas)
    {"nome": "José Priante", "partido": "MDB", "uf": "PA", "genero": "masculino"},
    {"nome": "Elcione Barbalho", "partido": "MDB", "uf": "PA", "genero": "feminino"},
    {"nome": "Airton Faleiro", "partido": "PT", "uf": "PA", "genero": "masculino"},
    {"nome": "Hélio Leite", "partido": "UNIÃO", "uf": "PA", "genero": "masculino"},
    {"nome": "Delegado Éder Mauro", "partido": "PL", "uf": "PA", "genero": "masculino"},

    # SANTA CATARINA (16 vagas)
    {"nome": "Daniel Freitas", "partido": "PL", "uf": "SC", "genero": "masculino"},
    {"nome": "Coronel Mota", "partido": "PL", "uf": "SC", "genero": "masculino"},
    {"nome": "Jorge Goetten", "partido": "PL", "uf": "SC", "genero": "masculino"},
    {"nome": "Caroline de Toni", "partido": "PL", "uf": "SC", "genero": "feminino"},
    {"nome": "Pedro Uczai", "partido": "PT", "uf": "SC", "genero": "masculino"},

    # DISTRITO FEDERAL (8 vagas)
    {"nome": "Bia Kicis", "partido": "PL", "uf": "DF", "genero": "feminino"},
    {"nome": "Alberto Fraga", "partido": "PL", "uf": "DF", "genero": "masculino"},
    {"nome": "Erika Kokay", "partido": "PT", "uf": "DF", "genero": "feminino"},
    {"nome": "Fred Linhares", "partido": "REPUBLICANOS", "uf": "DF", "genero": "masculino"},
    {"nome": "Julio Cesar Ribeiro", "partido": "REPUBLICANOS", "uf": "DF", "genero": "masculino"},
    {"nome": "Professor Reginaldo Veras", "partido": "PV", "uf": "DF", "genero": "masculino"},
    {"nome": "Rafael Prudente", "partido": "MDB", "uf": "DF", "genero": "masculino"},
    {"nome": "Rodrigo Rollemberg", "partido": "PSB", "uf": "DF", "genero": "masculino"},

    # Outros estados - principais nomes
    {"nome": "Hugo Motta", "partido": "REPUBLICANOS", "uf": "PB", "genero": "masculino"},
    {"nome": "Arthur Lira", "partido": "PP", "uf": "AL", "genero": "masculino"},
    {"nome": "Aguinaldo Ribeiro", "partido": "PP", "uf": "PB", "genero": "masculino"},
    {"nome": "Lira Maia", "partido": "PP", "uf": "PA", "genero": "masculino"},
    {"nome": "Cacá Leão", "partido": "PP", "uf": "BA", "genero": "masculino"},
    {"nome": "Marcos Pereira", "partido": "REPUBLICANOS", "uf": "SP", "genero": "masculino"},
    {"nome": "Celso Sabino", "partido": "UNIÃO", "uf": "PA", "genero": "masculino"},
]


def gerar_data_nascimento(idade: int) -> str:
    """Gera data de nascimento baseada na idade."""
    ano_nascimento = 2025 - idade
    mes = random.randint(1, 12)
    dia = random.randint(1, 28)
    return f"{ano_nascimento}-{mes:02d}-{dia:02d}"


def obter_signo(data_nascimento: str) -> str:
    """Retorna o signo zodiacal baseado na data de nascimento."""
    mes, dia = int(data_nascimento[5:7]), int(data_nascimento[8:10])
    signos = [
        ("capricornio", (1, 20)), ("aquario", (2, 19)), ("peixes", (3, 20)),
        ("aries", (4, 20)), ("touro", (5, 21)), ("gemeos", (6, 21)),
        ("cancer", (7, 23)), ("leao", (8, 23)), ("virgem", (9, 23)),
        ("libra", (10, 23)), ("escorpiao", (11, 22)), ("sagitario", (12, 21)),
        ("capricornio", (12, 31))
    ]
    for signo, (m, d) in signos:
        if mes < m or (mes == m and dia <= d):
            return signo
    return "capricornio"


def gerar_parlamentar(
    id_parlamentar: str,
    nome: str,
    partido_sigla: str,
    uf: str,
    genero: str,
    casa: str,
    indice: int
) -> Dict[str, Any]:
    """Gera um perfil completo de parlamentar."""

    # Encontrar dados do partido
    partido_info = next((p for p in PARTIDOS if p["sigla"] == partido_sigla), PARTIDOS[0])
    orientacao = partido_info["orientacao"]

    # Gerar idade realista (35-75 anos)
    idade = random.randint(35, 75)
    data_nascimento = gerar_data_nascimento(idade)

    # Nome parlamentar (pode ser diferente do nome completo)
    partes_nome = nome.split()
    nome_parlamentar = nome if len(partes_nome) <= 2 else " ".join(partes_nome[:2]) if random.random() > 0.5 else nome

    # Estado info
    estado_info = ESTADOS.get(uf, {"nome": uf, "capital": "Brasília"})

    # Definir posições políticas baseadas na orientação do partido
    if orientacao == "direita":
        posicao_bolsonaro = random.choice(["apoiador_forte", "apoiador_moderado"])
        posicao_lula = random.choice(["opositor_forte", "opositor_moderado"])
        relacao_governo = random.choice(["oposicao_forte", "oposicao_moderada"])
    elif orientacao == "esquerda":
        posicao_bolsonaro = random.choice(["opositor_forte", "opositor_moderado"])
        posicao_lula = random.choice(["apoiador_forte", "apoiador_moderado"])
        relacao_governo = random.choice(["base_aliada", "apoiador_moderado"])
    elif orientacao == "centro-direita":
        posicao_bolsonaro = random.choice(["apoiador_moderado", "neutro"])
        posicao_lula = random.choice(["critico_moderado", "neutro"])
        relacao_governo = random.choice(["independente", "oposicao_moderada"])
    elif orientacao == "centro-esquerda":
        posicao_bolsonaro = random.choice(["critico_moderado", "opositor_moderado"])
        posicao_lula = random.choice(["apoiador_moderado", "neutro"])
        relacao_governo = random.choice(["base_aliada", "independente"])
    else:  # centro
        posicao_bolsonaro = random.choice(["neutro", "critico_moderado"])
        posicao_lula = random.choice(["neutro", "apoiador_moderado"])
        relacao_governo = "independente"

    # Selecionar comissões baseado na casa
    comissoes = COMISSOES_SENADO if casa == "senado" else COMISSOES_CAMARA
    comissoes_atuais = random.sample(comissoes, min(3, len(comissoes)))

    # Selecionar temas de atuação
    temas = random.sample(TEMAS_ATUACAO, random.randint(3, 6))

    # Gerar votos
    if casa == "senado":
        votos = random.randint(500000, 5000000)
    else:
        votos = random.randint(30000, 500000)

    # Big Five personality
    big_five = {
        "abertura": random.randint(3, 9),
        "conscienciosidade": random.randint(4, 9),
        "extroversao": random.randint(4, 9),
        "amabilidade": random.randint(3, 8),
        "neuroticismo": random.randint(2, 7)
    }

    # Formação e profissão
    formacao = random.sample(FORMACOES, random.randint(1, 2))
    profissao = random.choice(PROFISSOES)

    # Religião
    religiao = random.choice(RELIGIOES)

    # Estilo de comunicação
    estilo_comunicacao = random.choice(ESTILOS_COMUNICACAO)

    # Gerar redes sociais
    nome_usuario = nome_parlamentar.lower().replace(" ", "").replace(".", "")[:15]
    redes_sociais = {
        "twitter": f"@{nome_usuario}",
        "instagram": f"@{nome_usuario}",
        "facebook": nome_usuario
    }

    # URL da foto (padrão da Câmara/Senado)
    if casa == "senado":
        foto_url = f"https://www.senado.leg.br/senadores/img/fotos-oficiais/senador{indice}.jpg"
    else:
        foto_url = f"https://www.camara.leg.br/internet/deputado/bandep/{indice}.jpg"

    # Cargo
    if casa == "senado":
        cargo = "senadora" if genero == "feminino" else "senador"
    else:
        cargo = "deputada_federal" if genero == "feminino" else "deputado_federal"

    # Patrimônio
    patrimonio = random.randint(200000, 15000000)

    # Histórico político
    num_mandatos = random.randint(1, 5)
    historico = [f"{cargo.replace('_', ' ').title()} por {uf} (mandato {i+1})" for i in range(num_mandatos)]

    parlamentar = {
        "id": id_parlamentar,
        "nome": nome,
        "nome_parlamentar": nome_parlamentar,
        "idade": idade,
        "data_nascimento": data_nascimento,
        "genero": genero,
        "cor_raca": random.choice(["branca", "parda", "preta", "amarela", "indigena"]),
        "naturalidade": estado_info["capital"],
        "uf_nascimento": uf,
        "uf": uf,
        "casa_legislativa": casa,
        "cargo": cargo,
        "partido": partido_sigla,
        "numero_partido": partido_info["numero"],
        "mandato_inicio": "2023-02-01",
        "mandato_fim": "2027-01-31" if casa == "camara_federal" else "2031-01-31",
        "legislatura": 57,
        "votos_eleicao": votos,
        "foto_url": foto_url,
        "formacao_academica": formacao,
        "profissao_anterior": profissao,
        "carreira_profissional": f"{profissao} com atuação em {estado_info['nome']}",
        "historico_politico": historico,
        "comissoes_atuais": comissoes_atuais,
        "liderancas": [],
        "frentes_parlamentares": random.sample([
            "Frente Parlamentar Agropecuária",
            "Frente Parlamentar Evangélica",
            "Frente Parlamentar em Defesa da Vida",
            "Frente Parlamentar Ambientalista",
            "Frente Parlamentar de Segurança Pública",
            "Frente Parlamentar da Educação",
            "Frente Parlamentar da Saúde",
            "Frente Parlamentar LGBTI+",
            "Frente Parlamentar dos Direitos Humanos"
        ], random.randint(1, 3)),
        "temas_atuacao": temas,
        "projetos_lei_destaque": [f"PL de {tema.lower()}" for tema in temas[:2]],
        "base_eleitoral": f"Eleitores de {estado_info['nome']}",
        "religiao": religiao,
        "estado_civil": random.choice(["solteiro", "casado", "divorciado", "viuvo"]),
        "filhos": random.randint(0, 4),
        "orientacao_politica": orientacao,
        "posicao_bolsonaro": posicao_bolsonaro,
        "posicao_lula": posicao_lula,
        "interesse_politico": "alto",
        "tolerancia_nuance": random.choice(["baixa", "media", "alta"]),
        "estilo_decisao": random.choice(["pragmatico", "ideologico", "tecnico", "populista"]),
        "estilo_comunicacao": estilo_comunicacao,
        "valores": random.sample([
            "Família", "Trabalho", "Educação", "Saúde", "Segurança",
            "Liberdade", "Igualdade", "Justiça", "Honestidade", "Fé",
            "Sustentabilidade", "Desenvolvimento", "Tradição", "Inovação"
        ], 5),
        "preocupacoes": random.sample([
            "Criminalidade", "Desemprego", "Corrupção", "Saúde pública",
            "Educação", "Inflação", "Meio ambiente", "Desigualdade"
        ], 4),
        "medos": random.sample([
            "Violência", "Instabilidade política", "Crise econômica",
            "Perda de valores", "Retrocesso social"
        ], 3),
        "vieses_cognitivos": random.sample([
            "confirmacao", "ancoragem", "disponibilidade", "grupo", "autoridade"
        ], 3),
        "fontes_informacao": random.sample([
            "Redes sociais", "Jornais tradicionais", "TV", "Rádio",
            "Sites de notícias", "WhatsApp"
        ], 3),
        "aliancas_politicas": [partido_sigla, random.choice([p["sigla"] for p in PARTIDOS])],
        "relacao_governo_atual": relacao_governo,
        "email_contato": f"sen.{nome_usuario}@senado.leg.br" if casa == "senado" else f"dep.{nome_usuario}@camara.leg.br",
        "telefone_gabinete": f"(61) 3303-{random.randint(1000, 9999)}",
        "gabinete_localizacao": f"Gabinete {random.randint(100, 999)} - Anexo {random.choice(['I', 'II', 'III', 'IV'])}",
        "redes_sociais": redes_sociais,
        "historia_resumida": f"{nome_parlamentar} é {cargo.replace('_', ' ')} por {estado_info['nome']}, eleito(a) pelo {partido_sigla}. Atua principalmente nas áreas de {', '.join(temas[:3])}.",
        "instrucao_comportamental": f"Tom: {estilo_comunicacao}. Defende pautas de {orientacao}. Posiciona-se como {relacao_governo.replace('_', ' ')} ao governo atual.",
        "criado_em": datetime.now().isoformat() + "Z",
        "atualizado_em": datetime.now().isoformat() + "Z",
        "signo": obter_signo(data_nascimento),
        "local_residencia_atual": f"{estado_info['capital']}, {uf}",
        "patrimonio_declarado": float(patrimonio),
        "evolucao_patrimonial_percentual": float(random.randint(-10, 80)),
        "escolaridade_nivel": random.choice(["superior", "mestrado", "doutorado", "pos-graduacao"]),
        "universidades": [random.choice([
            "USP", "UNICAMP", "UFRJ", "UnB", "UFMG", "UFRGS", "UFPE", "UFC",
            "UFBA", "UFPR", "UFSC", "UFG", "UFPA", "UFAM", "UFES", "PUC"
        ])],
        "idiomas": ["portugues"] + random.sample(["ingles", "espanhol", "frances", "italiano"], random.randint(0, 2)),
        "hobbies": random.sample([
            "leitura", "esporte", "música", "viagens", "gastronomia",
            "futebol", "cinema", "família", "religião"
        ], 3),
        "taxa_presenca_plenario": round(random.uniform(60, 98), 1),
        "total_projetos_autoria": random.randint(10, 300),
        "projetos_aprovados": random.randint(1, 50),
        "projetos_em_tramitacao": random.randint(5, 100),
        "votacoes_importantes": {
            "reforma_tributaria": random.choice(["a_favor", "contra", "abstencao"]),
            "marco_temporal": random.choice(["a_favor", "contra", "abstencao"]),
            "reforma_administrativa": random.choice(["a_favor", "contra", "abstencao"])
        },
        "gastos_gabinete_mensal": float(random.randint(40000, 90000)),
        "viagens_oficiais_ano": random.randint(2, 25),
        "assessores_quantidade": random.randint(10, 25),
        "processos_judiciais": [],
        "processos_tse": [],
        "investigacoes_em_curso": [],
        "condenacoes": [],
        "ficha_limpa": random.random() > 0.1,
        "seguidores_total": random.randint(10000, 3000000),
        "engajamento_redes": random.choice(["baixo", "medio", "alto", "muito_alto"]),
        "mencoes_midia_mes": random.randint(5, 200),
        "tom_cobertura_midia": random.choice(["positivo", "neutro", "negativo", "polarizado"]),
        "fake_news_associadas": random.random() > 0.8,
        "influencia_digital": random.choice(["baixa", "media", "alta", "muito_alta"]),
        "big_five": big_five,
        "motivacao_primaria": random.choice(["poder", "ideologia", "servico", "status", "dinheiro"]),
        "estilo_lideranca": random.choice(["autoritario", "democratico", "carismatico", "servical", "transformacional"]),
        "nivel_carisma": random.randint(3, 9),
        "inteligencia_emocional": random.randint(3, 9),
        "resiliencia_crises": random.choice(["baixa", "media", "alta", "muito_alta"]),
        "tendencia_populismo": random.randint(1, 9),
        "influencia_no_partido": random.randint(3, 9),
        "capital_politico": random.choice(["baixo", "medio", "alto", "muito_alto"]),
        "rede_apoiadores_chave": [partido_sigla, estado_info["nome"]],
        "adversarios_politicos": [],
        "mentores_politicos": [],
        "apadrinhados": [],
        "controversias_principais": [],
        "declaracoes_polemicas": [],
        "escandalos": []
    }

    return parlamentar


def gerar_nome_completo(genero: str) -> str:
    """Gera um nome completo aleatório."""
    if genero == "masculino":
        primeiro_nome = random.choice(NOMES_MASCULINOS)
    else:
        primeiro_nome = random.choice(NOMES_FEMININOS)

    sobrenome1 = random.choice(SOBRENOMES)
    sobrenome2 = random.choice(SOBRENOMES)

    return f"{primeiro_nome} {sobrenome1} {sobrenome2}"


def gerar_senadores() -> List[Dict[str, Any]]:
    """Gera lista completa de 81 senadores."""
    senadores = []

    # Usar senadores reais conhecidos
    senadores_por_uf = {}
    for sen in SENADORES_REAIS:
        uf = sen["uf"]
        if uf not in senadores_por_uf:
            senadores_por_uf[uf] = []
        senadores_por_uf[uf].append(sen)

    indice = 1
    for uf in ESTADOS.keys():
        # Senadores reais do estado
        reais = senadores_por_uf.get(uf, [])

        for i in range(3):  # 3 senadores por estado
            if i < len(reais):
                # Usar dados do senador real
                sen = reais[i]
                nome = sen["nome"]
                partido = sen["partido"]
                genero = sen["genero"]
            else:
                # Gerar senador fictício
                genero = random.choice(["masculino", "feminino"])
                nome = gerar_nome_completo(genero)
                partido = random.choice(PARTIDOS)["sigla"]

            id_sen = f"sen-{uf.lower()}-{i+1:03d}"
            parlamentar = gerar_parlamentar(
                id_parlamentar=id_sen,
                nome=nome,
                partido_sigla=partido,
                uf=uf,
                genero=genero,
                casa="senado",
                indice=indice
            )
            senadores.append(parlamentar)
            indice += 1

    return senadores


def gerar_deputados_federais() -> List[Dict[str, Any]]:
    """Gera lista completa de 513 deputados federais."""
    deputados = []

    # Organizar deputados reais por UF
    deputados_por_uf = {}
    for dep in DEPUTADOS_REAIS:
        uf = dep["uf"]
        if uf not in deputados_por_uf:
            deputados_por_uf[uf] = []
        deputados_por_uf[uf].append(dep)

    indice = 1
    for uf, total in DEPUTADOS_POR_ESTADO.items():
        reais = deputados_por_uf.get(uf, [])

        for i in range(total):
            if i < len(reais):
                # Usar dados do deputado real
                dep = reais[i]
                nome = dep["nome"]
                partido = dep["partido"]
                genero = dep["genero"]
            else:
                # Gerar deputado fictício
                genero = random.choice(["masculino", "feminino"])
                nome = gerar_nome_completo(genero)
                partido = random.choice(PARTIDOS)["sigla"]

            id_dep = f"dep-fed-{uf.lower()}-{i+1:03d}"
            parlamentar = gerar_parlamentar(
                id_parlamentar=id_dep,
                nome=nome,
                partido_sigla=partido,
                uf=uf,
                genero=genero,
                casa="camara_federal",
                indice=indice
            )
            deputados.append(parlamentar)
            indice += 1

    return deputados


def main():
    """Função principal para gerar os bancos de dados."""
    print("=" * 60)
    print("GERANDO BANCO DE PARLAMENTARES DO CONGRESSO NACIONAL")
    print("=" * 60)

    # Gerar senadores
    print("\n📊 Gerando 81 senadores...")
    senadores = gerar_senadores()
    print(f"   ✅ {len(senadores)} senadores gerados")

    # Gerar deputados federais
    print("\n📊 Gerando 513 deputados federais...")
    deputados = gerar_deputados_federais()
    print(f"   ✅ {len(deputados)} deputados federais gerados")

    # Criar diretórios se não existirem
    os.makedirs(AGENTES_DIR, exist_ok=True)
    os.makedirs(PUBLIC_DATA_DIR, exist_ok=True)

    # Salvar senadores
    senadores_file = os.path.join(AGENTES_DIR, "banco-senadores-brasil.json")
    with open(senadores_file, "w", encoding="utf-8") as f:
        json.dump(senadores, f, ensure_ascii=False, indent=2)
    print(f"\n💾 Senadores salvos em: {senadores_file}")

    # Salvar deputados federais
    deputados_file = os.path.join(AGENTES_DIR, "banco-deputados-federais-brasil.json")
    with open(deputados_file, "w", encoding="utf-8") as f:
        json.dump(deputados, f, ensure_ascii=False, indent=2)
    print(f"💾 Deputados salvos em: {deputados_file}")

    # Copiar para frontend/public/data
    import shutil
    shutil.copy(senadores_file, os.path.join(PUBLIC_DATA_DIR, "banco-senadores-brasil.json"))
    shutil.copy(deputados_file, os.path.join(PUBLIC_DATA_DIR, "banco-deputados-federais-brasil.json"))
    print(f"\n📁 Arquivos copiados para: {PUBLIC_DATA_DIR}")

    # Estatísticas finais
    print("\n" + "=" * 60)
    print("ESTATÍSTICAS FINAIS")
    print("=" * 60)
    print(f"Total de Senadores: {len(senadores)}")
    print(f"Total de Deputados Federais: {len(deputados)}")
    print(f"TOTAL GERAL: {len(senadores) + len(deputados)} parlamentares")

    # Estatísticas por partido
    todos = senadores + deputados
    partidos_count = {}
    for p in todos:
        partido = p["partido"]
        partidos_count[partido] = partidos_count.get(partido, 0) + 1

    print("\n📊 Distribuição por partido:")
    for partido, count in sorted(partidos_count.items(), key=lambda x: -x[1])[:10]:
        print(f"   {partido}: {count}")

    print("\n✅ Geração concluída com sucesso!")


if __name__ == "__main__":
    main()
