#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GERADOR DE ELEITORES CORRETIVOS
Gera eleitores sintéticos para corrigir os desvios estatísticos identificados
pelo módulo de validação do sistema de pesquisa eleitoral.
"""

import json
import random
import math
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from datetime import datetime

# ==================================================
# DADOS DE REFERÊNCIA OFICIAIS (do módulo de validação)
# ==================================================

REFERENCIAS = {
    'genero': {'feminino': 52.2, 'masculino': 47.8},
    'cor_raca': {'parda': 45.0, 'branca': 40.6, 'preta': 13.5, 'amarela': 0.5, 'indigena': 0.4},
    'faixa_etaria': {'16-24': 14.5, '25-34': 17.8, '35-44': 18.2, '45-54': 15.5, '55-64': 11.8, '65+': 12.2},
    'cluster_socioeconomico': {'G1_alta': 18.1, 'G2_media_alta': 20.8, 'G3_media_baixa': 32.9, 'G4_baixa': 28.2},
    'escolaridade': {'superior_completo_ou_pos': 37.0, 'medio_completo_ou_sup_incompleto': 43.8, 'fundamental_ou_sem_instrucao': 19.2},
    'ocupacao_vinculo': {'clt': 37.5, 'servidor_publico': 8.5, 'autonomo': 25.0, 'empresario': 4.2, 'informal': 13.8, 'desempregado': 6.6, 'aposentado': 10.5, 'estudante': 5.0},
    'renda_salarios_minimos': {'ate_1': 28.5, 'mais_de_1_ate_2': 25.8, 'mais_de_2_ate_5': 24.2, 'mais_de_5_ate_10': 12.5, 'mais_de_10_ate_20': 6.0, 'mais_de_20': 3.0},
    'religiao': {'catolica': 49.7, 'evangelica': 29.2, 'sem_religiao': 11.3, 'espirita': 3.3, 'umbanda_candomble': 0.9, 'outras_religioes': 5.6},
    'estado_civil': {'solteiro(a)': 40.0, 'casado(a)': 28.5, 'uniao_estavel': 20.0, 'divorciado(a)': 6.5, 'viuvo(a)': 5.0},
    'orientacao_politica': {'esquerda': 15.0, 'centro-esquerda': 7.0, 'centro': 11.0, 'centro-direita': 11.0, 'direita': 29.0},
    'interesse_politico': {'baixo': 45.0, 'medio': 35.0, 'alto': 20.0},
    'posicao_bolsonaro': {'apoiador_forte': 15.0, 'apoiador_moderado': 11.0, 'neutro': 20.0, 'critico_moderado': 20.0, 'critico_forte': 34.0},
    'estilo_decisao': {'identitario': 25.0, 'pragmatico': 20.0, 'moral': 15.0, 'economico': 25.0, 'emocional': 15.0},
    'tolerancia_nuance': {'baixa': 35.0, 'media': 40.0, 'alta': 25.0},
    'filhos': {'sem_filhos': 35.0, 'com_filhos': 65.0},
    'meio_transporte': {'carro': 32.3, 'onibus': 21.4, 'a_pe': 17.8, 'moto': 16.4, 'bicicleta': 3.5, 'metro': 1.6, 'nao_se_aplica': 7.0},
    'susceptibilidade_desinformacao': {'baixa_1_3': 25.0, 'media_4_6': 45.0, 'alta_7_10': 30.0},
}

# Regiões Administrativas do DF com proporções populacionais
RAS_DF = {
    # Grupo 1 - Alta renda
    'Plano Piloto': {'pop': 8.3, 'cluster': 'G1_alta', 'refs': ['na Asa Sul', 'na Asa Norte', 'no Setor Comercial', 'na W3', 'no Setor Bancário']},
    'Lago Sul': {'pop': 1.0, 'cluster': 'G1_alta', 'refs': ['no QL', 'perto do Pontão', 'na orla do Lago']},
    'Lago Norte': {'pop': 1.2, 'cluster': 'G1_alta', 'refs': ['no Setor de Mansões', 'perto da SHIN', 'no Varjão de cima']},
    'Sudoeste/Octogonal': {'pop': 1.8, 'cluster': 'G1_alta', 'refs': ['no Sudoeste', 'na Octogonal', 'perto do Parque da Cidade']},
    'Park Way': {'pop': 0.7, 'cluster': 'G1_alta', 'refs': ['nas chácaras', 'no Setor de Mansões Park Way']},
    'Jardim Botânico': {'pop': 0.9, 'cluster': 'G1_alta', 'refs': ['nos condomínios', 'perto do Jardim Botânico']},

    # Grupo 2 - Média-alta
    'Águas Claras': {'pop': 5.1, 'cluster': 'G2_media_alta', 'refs': ['perto do metrô', 'na Avenida Araucárias', 'no Norte', 'no Sul', 'perto do Shopping']},
    'Vicente Pires': {'pop': 2.3, 'cluster': 'G2_media_alta', 'refs': ['na Rua 8', 'perto da feira', 'no Colônia Agrícola']},
    'Guará': {'pop': 4.3, 'cluster': 'G2_media_alta', 'refs': ['no Guará I', 'no Guará II', 'perto do Shopping', 'na QE', 'no Park Sul']},
    'Cruzeiro': {'pop': 1.0, 'cluster': 'G2_media_alta', 'refs': ['no Cruzeiro Velho', 'no Cruzeiro Novo', 'na SHCES']},
    'Sobradinho II': {'pop': 3.1, 'cluster': 'G2_media_alta', 'refs': ['na AR', 'perto do shopping', 'no centro']},
    'Arniqueira': {'pop': 0.8, 'cluster': 'G2_media_alta', 'refs': ['na Colônia Agrícola', 'perto de Vicente Pires']},

    # Grupo 3 - Média-baixa
    'Taguatinga': {'pop': 6.6, 'cluster': 'G3_media_baixa', 'refs': ['no Centro', 'na Taguatinga Norte', 'na Taguatinga Sul', 'perto do Shopping', 'na Samdu']},
    'Ceilândia': {'pop': 14.4, 'cluster': 'G3_media_baixa', 'refs': ['no Centro', 'no P Sul', 'no P Norte', 'na Guariroba', 'no Setor O', 'perto da Hélio Prates', 'no Sol Nascente']},
    'Samambaia': {'pop': 8.3, 'cluster': 'G3_media_baixa', 'refs': ['na Norte', 'na Sul', 'perto do metrô', 'na 12 de Samambaia']},
    'Gama': {'pop': 4.4, 'cluster': 'G3_media_baixa', 'refs': ['no Setor Central', 'no Setor Sul', 'no Setor Oeste', 'perto do shopping']},
    'Planaltina': {'pop': 5.9, 'cluster': 'G3_media_baixa', 'refs': ['no Setor Tradicional', 'no Arapoanga', 'no Buritis', 'no Vale do Amanhecer']},
    'Santa Maria': {'pop': 3.9, 'cluster': 'G3_media_baixa', 'refs': ['no Centro', 'na QR', 'perto do terminal']},
    'Sobradinho': {'pop': 2.1, 'cluster': 'G3_media_baixa', 'refs': ['no Centro', 'na Quadra', 'perto da feira']},
    'Brazlândia': {'pop': 1.5, 'cluster': 'G3_media_baixa', 'refs': ['no Setor Tradicional', 'no Norte', 'no Sul', 'perto da Festa do Morango']},
    'São Sebastião': {'pop': 3.3, 'cluster': 'G3_media_baixa', 'refs': ['no Centro', 'no Residencial Oeste', 'no Bairro Tradicional']},
    'Riacho Fundo I': {'pop': 1.2, 'cluster': 'G3_media_baixa', 'refs': ['no Centro', 'perto da feira', 'na QN']},
    'Riacho Fundo II': {'pop': 2.6, 'cluster': 'G3_media_baixa', 'refs': ['na QN', 'no Setor Sul', 'perto do terminal']},
    'Núcleo Bandeirante': {'pop': 0.7, 'cluster': 'G3_media_baixa', 'refs': ['na 3ª Avenida', 'na Vila Metropolitana', 'no Setor de Indústrias']},
    'Candangolândia': {'pop': 0.5, 'cluster': 'G3_media_baixa', 'refs': ['na área central', 'perto do IAPI']},
    'Paranoá': {'pop': 2.1, 'cluster': 'G3_media_baixa', 'refs': ['no Setor Central', 'no Itapoã', 'perto do lago']},
    'Itapoã': {'pop': 2.0, 'cluster': 'G3_media_baixa', 'refs': ['no Itapoã I', 'no Itapoã II', 'no Del Lago']},

    # Grupo 4 - Baixa
    'Recanto das Emas': {'pop': 4.4, 'cluster': 'G4_baixa', 'refs': ['na Quadra', 'no Centro', 'perto do terminal']},
    'SCIA/Estrutural': {'pop': 1.1, 'cluster': 'G4_baixa', 'refs': ['na Cidade Estrutural', 'perto do lixão', 'na Chácara Santa Luzia']},
    'Fercal': {'pop': 0.3, 'cluster': 'G4_baixa', 'refs': ['no Alto Bela Vista', 'no Engenho Velho', 'na Fábrica']},
    'Sol Nascente/Pôr do Sol': {'pop': 2.8, 'cluster': 'G4_baixa', 'refs': ['no Sol Nascente', 'no Pôr do Sol', 'na Trecho']},
    'Varjão': {'pop': 0.3, 'cluster': 'G4_baixa', 'refs': ['no centro do Varjão', 'perto da EPTG']},
}

# Nomes brasileiros comuns por gênero
NOMES_MASCULINOS = [
    "João", "Pedro", "Lucas", "Matheus", "Gabriel", "Gustavo", "Rafael", "Felipe", "Bruno", "Tiago",
    "Carlos", "José", "Antônio", "Francisco", "Paulo", "Marcos", "André", "Ricardo", "Fernando", "Eduardo",
    "Luiz", "Rodrigo", "Marcelo", "Alexandre", "Daniel", "Vinicius", "Leonardo", "Diego", "Henrique", "Caio",
    "Renato", "Fábio", "Guilherme", "Roberto", "Jorge", "Márcio", "Cláudio", "Sérgio", "Rogério", "Alan",
    "Renan", "Thiago", "Leandro", "Adriano", "Douglas", "Wesley", "Anderson", "Alex", "Victor", "Samuel",
    "Igor", "Breno", "Murilo", "Erick", "Nathan", "Otávio", "Davi", "Miguel", "Bernardo", "Heitor"
]

NOMES_FEMININOS = [
    "Maria", "Ana", "Juliana", "Fernanda", "Patricia", "Camila", "Amanda", "Bruna", "Letícia", "Larissa",
    "Mariana", "Beatriz", "Carolina", "Rafaela", "Gabriela", "Isabela", "Daniela", "Vanessa", "Renata", "Priscila",
    "Aline", "Cristiane", "Tatiana", "Luciana", "Adriana", "Natália", "Cláudia", "Carla", "Sandra", "Paula",
    "Mônica", "Simone", "Débora", "Elaine", "Roberta", "Viviane", "Fabiana", "Michele", "Márcia", "Denise",
    "Helena", "Lúcia", "Teresa", "Rosa", "Joana", "Clara", "Alice", "Laura", "Lívia", "Sofia",
    "Valentina", "Yasmin", "Eduarda", "Giovanna", "Manuela", "Luísa", "Lara", "Heloísa", "Lorena", "Bianca"
]

SOBRENOMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
    "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa",
    "Rocha", "Dias", "Nascimento", "Andrade", "Moreira", "Nunes", "Marques", "Machado", "Mendes", "Freitas",
    "Cardoso", "Ramos", "Gonçalves", "Santana", "Teixeira", "Araújo", "Pinto", "Correia", "Batista", "Moura"
]

# Profissões por cluster socioeconômico e ocupação
PROFISSOES = {
    'G1_alta': {
        'servidor_publico': ['Auditor Fiscal', 'Procurador', 'Delegado Federal', 'Juiz', 'Promotor', 'Diplomata', 'Analista do BACEN', 'Técnico do TCU', 'Defensor Público'],
        'empresario': ['Empresário', 'Sócio de Escritório', 'CEO', 'Diretor Executivo', 'Investidor'],
        'autonomo': ['Médico', 'Advogado', 'Dentista', 'Arquiteto', 'Consultor Empresarial', 'Engenheiro Consultor'],
        'clt': ['Gerente Sênior', 'Diretor Financeiro', 'Gerente de TI', 'Coordenador de Projetos'],
    },
    'G2_media_alta': {
        'servidor_publico': ['Analista Judiciário', 'Técnico Judiciário', 'Analista do Ministério Público', 'Oficial de Justiça', 'Professor Universitário'],
        'empresario': ['Dono de Comércio', 'Franqueado', 'Dono de Restaurante'],
        'autonomo': ['Corretor de Imóveis', 'Contador', 'Psicólogo', 'Nutricionista', 'Personal Trainer', 'Designer'],
        'clt': ['Analista de Sistemas', 'Analista Financeiro', 'Coordenador Administrativo', 'Gerente de Loja', 'Engenheiro'],
        'estudante': ['Estudante de Medicina', 'Estudante de Direito', 'Estudante de Engenharia', 'Mestrando'],
    },
    'G3_media_baixa': {
        'servidor_publico': ['Professor da Rede Pública', 'Policial Militar', 'Bombeiro', 'Agente de Trânsito', 'Técnico Administrativo'],
        'autonomo': ['Eletricista', 'Encanador', 'Mecânico', 'Cabeleireiro(a)', 'Manicure', 'Barbeiro(a)', 'Pedreiro', 'Pintor'],
        'clt': ['Vendedor(a)', 'Atendente', 'Recepcionista', 'Operador de Caixa', 'Auxiliar Administrativo', 'Motorista de Ônibus'],
        'informal': ['Vendedor Ambulante', 'Faxineira Diarista', 'Cuidador(a) de Idosos', 'Manicure em Domicílio'],
        'desempregado': ['Desempregado', 'Em busca de emprego'],
        'aposentado': ['Aposentado(a)'],
        'estudante': ['Estudante de Ensino Técnico', 'Estudante de Faculdade Particular'],
    },
    'G4_baixa': {
        'autonomo': ['Catador de Recicláveis', 'Vendedor Ambulante', 'Faxineira', 'Lavador de Carros'],
        'clt': ['Servente', 'Auxiliar de Limpeza', 'Ajudante de Pedreiro', 'Porteiro', 'Vigilante'],
        'informal': ['Bico', 'Faz de tudo', 'Diarista', 'Catador', 'Flanelinha'],
        'desempregado': ['Desempregado', 'Recebendo Bolsa Família', 'Aguardando oportunidade'],
        'aposentado': ['Aposentado(a) por invalidez', 'Aposentado(a)'],
    }
}

# Valores por perfil político
VALORES_POR_ORIENTACAO = {
    'esquerda': ['Justiça social', 'Igualdade', 'Direitos trabalhistas', 'Saúde pública', 'Educação gratuita', 'Meio ambiente', 'Diversidade', 'Estado forte', 'Redistribuição de renda'],
    'centro-esquerda': ['Democracia', 'Educação de qualidade', 'Sustentabilidade', 'Direitos humanos', 'Equilíbrio', 'Diálogo', 'Ciência', 'Inclusão social'],
    'centro': ['Estabilidade', 'Moderação', 'Pragmatismo', 'Eficiência', 'Responsabilidade fiscal', 'Equilíbrio', 'Diálogo'],
    'centro-direita': ['Livre iniciativa', 'Empreendedorismo', 'Família', 'Responsabilidade individual', 'Ordem', 'Segurança', 'Meritocracia'],
    'direita': ['Ordem', 'Segurança', 'Família tradicional', 'Livre mercado', 'Propriedade privada', 'Patriotismo', 'Religião', 'Combate à corrupção', 'Menos impostos'],
}

PREOCUPACOES_POR_ORIENTACAO = {
    'esquerda': ['Desigualdade', 'Fome', 'Desemprego', 'Privatizações', 'Cortes sociais', 'Racismo', 'Machismo', 'Fascismo'],
    'centro-esquerda': ['Desigualdade', 'Qualidade do ensino', 'Meio ambiente', 'Direitos das minorias', 'Mobilidade urbana'],
    'centro': ['Corrupção', 'Economia', 'Segurança', 'Saúde', 'Educação', 'Emprego'],
    'centro-direita': ['Corrupção', 'Impostos', 'Burocracia', 'Criminalidade', 'Ineficiência estatal'],
    'direita': ['Corrupção', 'Criminalidade', 'Impostos', 'Degradação moral', 'Comunismo', 'Drogas', 'Aborto'],
}

MEDOS_POR_CLUSTER = {
    'G1_alta': ['Perder patrimônio', 'Aumento de impostos', 'Instabilidade política', 'Violência urbana', 'Sequestro'],
    'G2_media_alta': ['Perder o padrão de vida', 'Desemprego', 'Violência', 'Crise econômica', 'Não conseguir manter os filhos na escola particular'],
    'G3_media_baixa': ['Perder o emprego', 'Não conseguir pagar as contas', 'Violência', 'Doença sem atendimento', 'Inflação'],
    'G4_baixa': ['Fome', 'Perder a casa', 'Não conseguir emprego', 'Violência', 'Doença', 'Filhos no crime'],
}

FONTES_INFORMACAO_POR_PERFIL = {
    'jovem_conectado': ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Podcasts'],
    'adulto_tradicional': ['Jornal Nacional', 'TV Globo', 'Rádio CBN', 'Folha de S.Paulo', 'G1'],
    'popular': ['SBT Brasil', 'Cidade Alerta', 'Balanço Geral', 'WhatsApp (grupos de família/igreja)', 'Facebook'],
    'conservador': ['Jovem Pan', 'Brasil Paralelo', 'YouTube (canais conservadores)', 'WhatsApp (grupos políticos)', 'Telegram'],
    'progressista': ['Brasil de Fato', 'The Intercept', 'Mídia Ninja', 'Twitter/X', 'Podcasts de esquerda'],
    'classe_alta': ['O Globo', 'Valor Econômico', 'The Economist', 'Bloomberg', 'Estadão'],
    'idoso': ['Jornal Nacional', 'TV Record', 'Rádio AM', 'WhatsApp (grupos de família)'],
}

VIESES_COGNITIVOS = ['confirmacao', 'disponibilidade', 'grupo', 'autoridade', 'aversao_perda', 'tribalismo', 'desconfianca_institucional']


def carregar_eleitores_existentes(caminho: str) -> List[Dict]:
    """Carrega os eleitores existentes do arquivo JSON."""
    with open(caminho, 'r', encoding='utf-8') as f:
        return json.load(f)


def calcular_distribuicao_atual(eleitores: List[Dict]) -> Dict[str, Dict[str, float]]:
    """Calcula a distribuição percentual atual de cada variável."""
    total = len(eleitores)
    distribuicao = {}

    # Variáveis categóricas simples
    variaveis_simples = ['genero', 'cor_raca', 'cluster_socioeconomico', 'escolaridade',
                         'ocupacao_vinculo', 'renda_salarios_minimos', 'religiao',
                         'estado_civil', 'orientacao_politica', 'interesse_politico',
                         'posicao_bolsonaro', 'estilo_decisao', 'tolerancia_nuance', 'meio_transporte']

    for var in variaveis_simples:
        contagem = {}
        for e in eleitores:
            valor = e.get(var, 'nao_informado')
            contagem[valor] = contagem.get(valor, 0) + 1
        distribuicao[var] = {k: (v / total) * 100 for k, v in contagem.items()}

    # Faixa etária
    faixas = {'16-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55-64': 0, '65+': 0}
    for e in eleitores:
        idade = e.get('idade', 30)
        if idade < 25: faixas['16-24'] += 1
        elif idade < 35: faixas['25-34'] += 1
        elif idade < 45: faixas['35-44'] += 1
        elif idade < 55: faixas['45-54'] += 1
        elif idade < 65: faixas['55-64'] += 1
        else: faixas['65+'] += 1
    distribuicao['faixa_etaria'] = {k: (v / total) * 100 for k, v in faixas.items()}

    # Filhos
    com_filhos = sum(1 for e in eleitores if e.get('filhos', 0) > 0)
    distribuicao['filhos'] = {
        'com_filhos': (com_filhos / total) * 100,
        'sem_filhos': ((total - com_filhos) / total) * 100
    }

    # Susceptibilidade à desinformação
    baixa = sum(1 for e in eleitores if e.get('susceptibilidade_desinformacao', 5) <= 3)
    media = sum(1 for e in eleitores if 4 <= e.get('susceptibilidade_desinformacao', 5) <= 6)
    alta = sum(1 for e in eleitores if e.get('susceptibilidade_desinformacao', 5) >= 7)
    distribuicao['susceptibilidade_desinformacao'] = {
        'baixa_1_3': (baixa / total) * 100,
        'media_4_6': (media / total) * 100,
        'alta_7_10': (alta / total) * 100
    }

    return distribuicao


def calcular_deficits(distribuicao_atual: Dict, total_atual: int) -> Dict[str, Dict[str, int]]:
    """Calcula quantos eleitores faltam em cada categoria para atingir a referência."""
    deficits = {}

    for variavel, categorias_ref in REFERENCIAS.items():
        deficits[variavel] = {}
        dist_atual = distribuicao_atual.get(variavel, {})

        for categoria, ref_pct in categorias_ref.items():
            atual_pct = dist_atual.get(categoria, 0)
            diferenca = atual_pct - ref_pct

            # Se está sub-representado
            if diferenca < -0.5:
                # Fórmula: x = (ref * total - contagem_atual) / (1 - ref)
                ref_decimal = ref_pct / 100
                contagem_atual = int((atual_pct / 100) * total_atual)
                if ref_decimal < 1:
                    necessarios = (ref_decimal * total_atual - contagem_atual) / (1 - ref_decimal)
                    deficits[variavel][categoria] = max(0, math.ceil(necessarios))

    return deficits


def determinar_perfil_coerente(restricoes: Dict) -> Dict:
    """
    Determina um perfil coerente baseado nas restrições fornecidas.
    As restrições são as categorias que o eleitor DEVE ter.
    """
    perfil = {}

    # Aplicar restrições obrigatórias
    perfil.update(restricoes)

    # Determinar cluster se não definido (baseado em outras variáveis)
    if 'cluster_socioeconomico' not in perfil:
        if perfil.get('renda_salarios_minimos') in ['ate_1']:
            perfil['cluster_socioeconomico'] = 'G4_baixa'
        elif perfil.get('renda_salarios_minimos') in ['mais_de_1_ate_2']:
            perfil['cluster_socioeconomico'] = random.choice(['G3_media_baixa', 'G4_baixa'])
        elif perfil.get('renda_salarios_minimos') in ['mais_de_2_ate_5']:
            perfil['cluster_socioeconomico'] = 'G3_media_baixa'
        elif perfil.get('renda_salarios_minimos') in ['mais_de_5_ate_10']:
            perfil['cluster_socioeconomico'] = 'G2_media_alta'
        elif perfil.get('renda_salarios_minimos') in ['mais_de_10_ate_20', 'mais_de_20']:
            perfil['cluster_socioeconomico'] = 'G1_alta'
        else:
            perfil['cluster_socioeconomico'] = random.choices(
                list(REFERENCIAS['cluster_socioeconomico'].keys()),
                weights=list(REFERENCIAS['cluster_socioeconomico'].values())
            )[0]

    cluster = perfil['cluster_socioeconomico']

    # Região administrativa coerente com cluster
    if 'regiao_administrativa' not in perfil:
        ras_compativeis = [ra for ra, dados in RAS_DF.items() if dados['cluster'] == cluster]
        if not ras_compativeis:
            ras_compativeis = list(RAS_DF.keys())
        pesos = [RAS_DF[ra]['pop'] for ra in ras_compativeis]
        perfil['regiao_administrativa'] = random.choices(ras_compativeis, weights=pesos)[0]

    # Renda coerente com cluster
    if 'renda_salarios_minimos' not in perfil:
        if cluster == 'G1_alta':
            perfil['renda_salarios_minimos'] = random.choice(['mais_de_10_ate_20', 'mais_de_20'])
        elif cluster == 'G2_media_alta':
            perfil['renda_salarios_minimos'] = random.choice(['mais_de_5_ate_10', 'mais_de_2_ate_5'])
        elif cluster == 'G3_media_baixa':
            perfil['renda_salarios_minimos'] = random.choice(['mais_de_2_ate_5', 'mais_de_1_ate_2'])
        else:  # G4_baixa
            perfil['renda_salarios_minimos'] = random.choice(['ate_1', 'mais_de_1_ate_2'])

    # Escolaridade coerente com cluster
    if 'escolaridade' not in perfil:
        if cluster == 'G1_alta':
            perfil['escolaridade'] = 'superior_completo_ou_pos'
        elif cluster == 'G2_media_alta':
            perfil['escolaridade'] = random.choice(['superior_completo_ou_pos', 'medio_completo_ou_sup_incompleto'])
        elif cluster == 'G3_media_baixa':
            perfil['escolaridade'] = random.choice(['medio_completo_ou_sup_incompleto', 'fundamental_ou_sem_instrucao'])
        else:
            perfil['escolaridade'] = random.choice(['fundamental_ou_sem_instrucao', 'medio_completo_ou_sup_incompleto'])

    # Ocupação coerente
    if 'ocupacao_vinculo' not in perfil:
        ocupacoes_cluster = PROFISSOES.get(cluster, PROFISSOES['G3_media_baixa'])
        perfil['ocupacao_vinculo'] = random.choice(list(ocupacoes_cluster.keys()))

    # Gênero
    if 'genero' not in perfil:
        perfil['genero'] = random.choices(['feminino', 'masculino'], weights=[52.2, 47.8])[0]

    # Cor/raça
    if 'cor_raca' not in perfil:
        perfil['cor_raca'] = random.choices(
            list(REFERENCIAS['cor_raca'].keys()),
            weights=list(REFERENCIAS['cor_raca'].values())
        )[0]

    # Idade coerente com faixa etária
    if 'faixa_etaria' in perfil:
        faixa = perfil.pop('faixa_etaria')
        if faixa == '16-24':
            perfil['idade'] = random.randint(16, 24)
        elif faixa == '25-34':
            perfil['idade'] = random.randint(25, 34)
        elif faixa == '35-44':
            perfil['idade'] = random.randint(35, 44)
        elif faixa == '45-54':
            perfil['idade'] = random.randint(45, 54)
        elif faixa == '55-64':
            perfil['idade'] = random.randint(55, 64)
        else:
            perfil['idade'] = random.randint(65, 85)
    elif 'idade' not in perfil:
        # Idade proporcional
        faixa = random.choices(
            list(REFERENCIAS['faixa_etaria'].keys()),
            weights=list(REFERENCIAS['faixa_etaria'].values())
        )[0]
        if faixa == '16-24':
            perfil['idade'] = random.randint(16, 24)
        elif faixa == '25-34':
            perfil['idade'] = random.randint(25, 34)
        elif faixa == '35-44':
            perfil['idade'] = random.randint(35, 44)
        elif faixa == '45-54':
            perfil['idade'] = random.randint(45, 54)
        elif faixa == '55-64':
            perfil['idade'] = random.randint(55, 64)
        else:
            perfil['idade'] = random.randint(65, 85)

    # Ajustes de ocupação por idade
    if perfil['idade'] >= 65 and perfil['ocupacao_vinculo'] not in ['aposentado']:
        perfil['ocupacao_vinculo'] = 'aposentado'
    if perfil['idade'] <= 24 and perfil['ocupacao_vinculo'] == 'aposentado':
        perfil['ocupacao_vinculo'] = random.choice(['estudante', 'clt', 'informal'])

    # Religião
    if 'religiao' not in perfil:
        perfil['religiao'] = random.choices(
            list(REFERENCIAS['religiao'].keys()),
            weights=list(REFERENCIAS['religiao'].values())
        )[0]

    # Estado civil coerente com idade
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
        elif perfil['idade'] < 60:
            perfil['estado_civil'] = random.choices(
                ['solteiro(a)', 'casado(a)', 'uniao_estavel', 'divorciado(a)', 'viuvo(a)'],
                weights=[15, 40, 25, 15, 5]
            )[0]
        else:
            perfil['estado_civil'] = random.choices(
                ['casado(a)', 'viuvo(a)', 'divorciado(a)', 'solteiro(a)'],
                weights=[35, 30, 20, 15]
            )[0]

    # Orientação política
    if 'orientacao_politica' not in perfil:
        # Correlação com religião e cluster
        if perfil['religiao'] == 'evangelica':
            perfil['orientacao_politica'] = random.choices(
                ['direita', 'centro-direita', 'centro', 'centro-esquerda', 'esquerda'],
                weights=[40, 30, 15, 10, 5]
            )[0]
        elif cluster == 'G1_alta':
            perfil['orientacao_politica'] = random.choices(
                ['direita', 'centro-direita', 'centro', 'centro-esquerda', 'esquerda'],
                weights=[35, 30, 20, 10, 5]
            )[0]
        elif cluster == 'G4_baixa':
            perfil['orientacao_politica'] = random.choices(
                ['direita', 'centro-direita', 'centro', 'centro-esquerda', 'esquerda'],
                weights=[25, 20, 15, 20, 20]
            )[0]
        else:
            perfil['orientacao_politica'] = random.choices(
                list(REFERENCIAS['orientacao_politica'].keys()),
                weights=list(REFERENCIAS['orientacao_politica'].values())
            )[0]

    # Posição sobre Bolsonaro coerente com orientação política
    if 'posicao_bolsonaro' not in perfil:
        orient = perfil['orientacao_politica']
        if orient == 'direita':
            perfil['posicao_bolsonaro'] = random.choices(
                ['apoiador_forte', 'apoiador_moderado', 'neutro', 'critico_moderado', 'critico_forte'],
                weights=[50, 30, 10, 7, 3]
            )[0]
        elif orient == 'centro-direita':
            perfil['posicao_bolsonaro'] = random.choices(
                ['apoiador_forte', 'apoiador_moderado', 'neutro', 'critico_moderado', 'critico_forte'],
                weights=[25, 35, 20, 15, 5]
            )[0]
        elif orient == 'centro':
            perfil['posicao_bolsonaro'] = random.choices(
                ['apoiador_forte', 'apoiador_moderado', 'neutro', 'critico_moderado', 'critico_forte'],
                weights=[10, 20, 35, 25, 10]
            )[0]
        elif orient == 'centro-esquerda':
            perfil['posicao_bolsonaro'] = random.choices(
                ['apoiador_forte', 'apoiador_moderado', 'neutro', 'critico_moderado', 'critico_forte'],
                weights=[3, 7, 15, 35, 40]
            )[0]
        else:  # esquerda
            perfil['posicao_bolsonaro'] = random.choices(
                ['apoiador_forte', 'apoiador_moderado', 'neutro', 'critico_moderado', 'critico_forte'],
                weights=[1, 2, 5, 20, 72]
            )[0]

    # Interesse político
    if 'interesse_politico' not in perfil:
        # Maior interesse correlaciona com escolaridade
        if perfil['escolaridade'] == 'superior_completo_ou_pos':
            perfil['interesse_politico'] = random.choices(['alto', 'medio', 'baixo'], weights=[35, 45, 20])[0]
        elif perfil['escolaridade'] == 'medio_completo_ou_sup_incompleto':
            perfil['interesse_politico'] = random.choices(['alto', 'medio', 'baixo'], weights=[20, 40, 40])[0]
        else:
            perfil['interesse_politico'] = random.choices(['alto', 'medio', 'baixo'], weights=[10, 30, 60])[0]

    # Tolerância à nuance
    if 'tolerancia_nuance' not in perfil:
        if perfil['interesse_politico'] == 'alto' and perfil['escolaridade'] == 'superior_completo_ou_pos':
            perfil['tolerancia_nuance'] = random.choices(['alta', 'media', 'baixa'], weights=[40, 45, 15])[0]
        elif perfil['orientacao_politica'] in ['direita', 'esquerda']:
            perfil['tolerancia_nuance'] = random.choices(['alta', 'media', 'baixa'], weights=[15, 35, 50])[0]
        else:
            perfil['tolerancia_nuance'] = random.choices(['alta', 'media', 'baixa'], weights=[25, 45, 30])[0]

    # Estilo de decisão
    if 'estilo_decisao' not in perfil:
        if perfil['religiao'] in ['evangelica', 'catolica'] and perfil['orientacao_politica'] in ['direita', 'centro-direita']:
            perfil['estilo_decisao'] = random.choices(
                ['moral', 'identitario', 'economico', 'emocional', 'pragmatico'],
                weights=[30, 25, 20, 15, 10]
            )[0]
        elif cluster in ['G3_media_baixa', 'G4_baixa']:
            perfil['estilo_decisao'] = random.choices(
                ['economico', 'emocional', 'identitario', 'moral', 'pragmatico'],
                weights=[35, 25, 20, 10, 10]
            )[0]
        else:
            perfil['estilo_decisao'] = random.choices(
                list(REFERENCIAS['estilo_decisao'].keys()),
                weights=list(REFERENCIAS['estilo_decisao'].values())
            )[0]

    # Filhos coerente com idade e estado civil
    if 'filhos' not in perfil:
        if perfil['idade'] < 25:
            perfil['filhos'] = random.choices([0, 1], weights=[75, 25])[0]
        elif perfil['idade'] < 35:
            if perfil['estado_civil'] in ['casado(a)', 'uniao_estavel']:
                perfil['filhos'] = random.choices([0, 1, 2], weights=[30, 40, 30])[0]
            else:
                perfil['filhos'] = random.choices([0, 1], weights=[60, 40])[0]
        elif perfil['idade'] < 50:
            if perfil['estado_civil'] in ['casado(a)', 'uniao_estavel', 'divorciado(a)']:
                perfil['filhos'] = random.choices([0, 1, 2, 3], weights=[15, 30, 35, 20])[0]
            else:
                perfil['filhos'] = random.choices([0, 1, 2], weights=[40, 35, 25])[0]
        else:
            perfil['filhos'] = random.choices([0, 1, 2, 3, 4], weights=[15, 25, 35, 15, 10])[0]

    # Converter restrição de filhos para número
    if isinstance(perfil.get('filhos'), str):
        if perfil['filhos'] == 'sem_filhos':
            perfil['filhos'] = 0
        else:
            perfil['filhos'] = random.randint(1, 3)

    # Meio de transporte coerente
    if 'meio_transporte' not in perfil:
        if cluster == 'G1_alta':
            perfil['meio_transporte'] = random.choices(
                ['carro', 'nao_se_aplica'],
                weights=[85, 15]
            )[0]
        elif cluster == 'G2_media_alta':
            perfil['meio_transporte'] = random.choices(
                ['carro', 'metro', 'onibus', 'moto'],
                weights=[50, 25, 15, 10]
            )[0]
        elif cluster == 'G3_media_baixa':
            perfil['meio_transporte'] = random.choices(
                ['onibus', 'carro', 'moto', 'metro', 'a_pe', 'bicicleta'],
                weights=[35, 25, 20, 10, 7, 3]
            )[0]
        else:  # G4_baixa
            perfil['meio_transporte'] = random.choices(
                ['onibus', 'a_pe', 'moto', 'bicicleta', 'nao_se_aplica'],
                weights=[40, 30, 15, 10, 5]
            )[0]

        # Aposentados e desempregados
        if perfil['ocupacao_vinculo'] in ['aposentado', 'desempregado']:
            perfil['meio_transporte'] = random.choices(
                ['nao_se_aplica', 'onibus', 'a_pe'],
                weights=[40, 35, 25]
            )[0]

    # Susceptibilidade à desinformação
    if 'susceptibilidade_desinformacao' not in perfil:
        # Correlação negativa com escolaridade
        if perfil['escolaridade'] == 'superior_completo_ou_pos':
            # Baixa susceptibilidade mais comum
            nivel = random.choices(['baixa', 'media', 'alta'], weights=[40, 45, 15])[0]
        elif perfil['escolaridade'] == 'medio_completo_ou_sup_incompleto':
            nivel = random.choices(['baixa', 'media', 'alta'], weights=[25, 50, 25])[0]
        else:
            nivel = random.choices(['baixa', 'media', 'alta'], weights=[15, 45, 40])[0]

        if nivel == 'baixa':
            perfil['susceptibilidade_desinformacao'] = random.randint(1, 3)
        elif nivel == 'media':
            perfil['susceptibilidade_desinformacao'] = random.randint(4, 6)
        else:
            perfil['susceptibilidade_desinformacao'] = random.randint(7, 10)

    return perfil


def gerar_nome_completo(genero: str) -> str:
    """Gera um nome completo realista."""
    if genero == 'feminino':
        nome = random.choice(NOMES_FEMININOS)
    else:
        nome = random.choice(NOMES_MASCULINOS)

    sobrenome1 = random.choice(SOBRENOMES)
    sobrenome2 = random.choice(SOBRENOMES)

    # Evitar sobrenomes iguais
    while sobrenome2 == sobrenome1:
        sobrenome2 = random.choice(SOBRENOMES)

    return f"{nome} {sobrenome1} {sobrenome2}"


def gerar_historia_resumida(perfil: Dict) -> str:
    """Gera uma história resumida coerente com o perfil."""
    nome = perfil['nome'].split()[0]
    ra = perfil['regiao_administrativa']
    idade = perfil['idade']
    ocupacao = perfil['ocupacao_vinculo']
    cluster = perfil['cluster_socioeconomico']
    estado_civil = perfil['estado_civil']
    filhos = perfil.get('filhos', 0)
    orientacao = perfil['orientacao_politica']
    posicao_bolso = perfil['posicao_bolsonaro']
    religiao = perfil['religiao']

    # Origens
    origens = [
        f"nasceu e cresceu em {ra}",
        f"mora em {ra} desde a infância",
        f"veio de outro estado e se estabeleceu em {ra}",
        f"sempre morou no DF, atualmente em {ra}",
        f"cresceu em outra cidade do DF e se mudou para {ra}",
    ]

    # Experiências formadoras por cluster
    experiencias_por_cluster = {
        'G1_alta': [
            "estudou em boas escolas e teve acesso a oportunidades",
            "a família sempre valorizou educação e cultura",
            "teve condições de fazer intercâmbio e ampliar horizontes",
            "cresceu em ambiente de empreendedorismo familiar",
        ],
        'G2_media_alta': [
            "se esforçou nos estudos para conquistar estabilidade",
            "o concurso público foi a grande virada de vida",
            "batalhou para ter o próprio negócio",
            "a educação foi o caminho para a ascensão social",
        ],
        'G3_media_baixa': [
            "conhece bem a luta diária para pagar as contas",
            "aprendeu desde cedo o valor do trabalho",
            "viu a família batalhar para não faltar nada em casa",
            "a vida ensinou que nada vem fácil",
        ],
        'G4_baixa': [
            "cresceu enfrentando dificuldades financeiras",
            "a família sempre dependeu de ajuda do governo",
            "sabe o que é passar necessidade",
            "aprendeu a se virar com pouco desde cedo",
        ],
    }

    # Situação atual por ocupação
    situacao_ocupacao = {
        'clt': f"Trabalha como {perfil.get('profissao', 'funcionário')} com carteira assinada",
        'servidor_publico': f"É {perfil.get('profissao', 'servidor público')} e valoriza a estabilidade",
        'autonomo': f"Trabalha por conta própria como {perfil.get('profissao', 'autônomo')}",
        'empresario': f"É dono do próprio negócio",
        'informal': "Trabalha no informal, sem carteira",
        'desempregado': "Está em busca de emprego",
        'aposentado': "Está aposentado(a) e vive da aposentadoria",
        'estudante': "É estudante e está se preparando para o futuro",
    }

    # Visão política
    visoes_politicas = {
        'apoiador_forte': "Apoia fortemente Bolsonaro e suas políticas",
        'apoiador_moderado': "Simpatiza com o bolsonarismo mas tem algumas ressalvas",
        'neutro': "Não se identifica fortemente com nenhum lado político",
        'critico_moderado': "Tem críticas ao bolsonarismo mas não é anti-Bolsonaro radical",
        'critico_forte': "É fortemente crítico a Bolsonaro e à direita radical",
    }

    # Montar história
    origem = random.choice(origens)
    experiencia = random.choice(experiencias_por_cluster.get(cluster, experiencias_por_cluster['G3_media_baixa']))
    situacao = situacao_ocupacao.get(ocupacao, "Trabalha para sobreviver")
    visao = visoes_politicas.get(posicao_bolso, "Não se posiciona claramente sobre política")

    # Família
    if filhos > 0:
        familia = f"Tem {filhos} filho(s)" if filhos > 1 else "Tem 1 filho"
    else:
        familia = "Não tem filhos"

    # Estado civil
    estado_txt = {
        'solteiro(a)': "Solteiro(a)",
        'casado(a)': "Casado(a)",
        'uniao_estavel': "Vive em união estável",
        'divorciado(a)': "Divorciado(a)",
        'viuvo(a)': "Viúvo(a)",
    }.get(estado_civil, "")

    # Religião
    religiao_txt = {
        'catolica': "é católico(a)",
        'evangelica': "é evangélico(a) praticante",
        'espirita': "é espírita",
        'sem_religiao': "não segue nenhuma religião",
        'umbanda_candomble': "frequenta terreiro",
        'outras_religioes': "segue outra religião",
    }.get(religiao, "")

    historia = f"{nome} {origem}. {experiencia}. {estado_txt} e {familia.lower()}. {situacao}. {visao}."

    if religiao_txt:
        historia += f" {nome} {religiao_txt}."

    return historia


def gerar_instrucao_comportamental(perfil: Dict) -> str:
    """Gera a instrução comportamental para o eleitor."""
    interesse = perfil['interesse_politico']
    tolerancia = perfil['tolerancia_nuance']
    estilo = perfil['estilo_decisao']
    escolaridade = perfil['escolaridade']

    # Tom baseado em interesse e escolaridade
    tons = {
        ('alto', 'superior_completo_ou_pos'): 'analítico e bem informado',
        ('alto', 'medio_completo_ou_sup_incompleto'): 'engajado e opinativo',
        ('alto', 'fundamental_ou_sem_instrucao'): 'apaixonado e vocal',
        ('medio', 'superior_completo_ou_pos'): 'reflexivo',
        ('medio', 'medio_completo_ou_sup_incompleto'): 'coloquial',
        ('medio', 'fundamental_ou_sem_instrucao'): 'prático',
        ('baixo', 'superior_completo_ou_pos'): 'desinteressado mas informado',
        ('baixo', 'medio_completo_ou_sup_incompleto'): 'distante',
        ('baixo', 'fundamental_ou_sem_instrucao'): 'simples e direto',
    }
    tom = tons.get((interesse, escolaridade), 'coloquial')

    # Acompanhamento político
    acompanhamentos = {
        'alto': 'Acompanha política ativamente e forma opinião própria',
        'medio': 'Acompanha política por alto, forma opinião pelo que ouve ao redor',
        'baixo': 'Não acompanha política, vota por obrigação ou indicação',
    }
    acompanhamento = acompanhamentos.get(interesse, acompanhamentos['medio'])

    # Tolerância
    tolerancias = {
        'alta': 'Considera diferentes pontos de vista antes de opinar',
        'media': 'Aceita algumas nuances, mas prefere clareza',
        'baixa': 'Pensa em termos de certo e errado, sem meio termo',
    }
    tol_txt = tolerancias.get(tolerancia, tolerancias['media'])

    # Estilo de voto
    estilos = {
        'identitario': 'Vota em quem representa seus valores e grupo',
        'pragmatico': 'Avalia propostas e histórico antes de votar',
        'moral': 'Prioriza valores morais e religiosos ao votar',
        'economico': 'Vota pensando no bolso',
        'emocional': 'Vota em quem transmite confiança e carisma',
    }
    estilo_txt = estilos.get(estilo, estilos['economico'])

    return f"Tom: {tom}. {acompanhamento}. {tol_txt}. {estilo_txt}."


def gerar_eleitor_completo(id_eleitor: str, restricoes: Dict) -> Dict:
    """Gera um eleitor completo com todos os 32 campos."""
    perfil = determinar_perfil_coerente(restricoes)

    # Nome
    perfil['nome'] = gerar_nome_completo(perfil['genero'])
    perfil['id'] = id_eleitor

    # Local de referência
    ra = perfil['regiao_administrativa']
    refs = RAS_DF.get(ra, {}).get('refs', ['no centro'])
    perfil['local_referencia'] = random.choice(refs)

    # Profissão coerente
    cluster = perfil['cluster_socioeconomico']
    ocupacao = perfil['ocupacao_vinculo']
    profissoes_disponiveis = PROFISSOES.get(cluster, {}).get(ocupacao, ['Trabalhador(a)'])
    perfil['profissao'] = random.choice(profissoes_disponiveis)

    # Valores baseados na orientação política
    orient = perfil['orientacao_politica']
    valores_base = VALORES_POR_ORIENTACAO.get(orient, VALORES_POR_ORIENTACAO['centro'])
    perfil['valores'] = random.sample(valores_base, min(3, len(valores_base)))

    # Preocupações
    preocupacoes_base = PREOCUPACOES_POR_ORIENTACAO.get(orient, PREOCUPACOES_POR_ORIENTACAO['centro'])
    perfil['preocupacoes'] = random.sample(preocupacoes_base, min(3, len(preocupacoes_base)))

    # Medos baseados no cluster
    medos_base = MEDOS_POR_CLUSTER.get(cluster, MEDOS_POR_CLUSTER['G3_media_baixa'])
    perfil['medos'] = random.sample(medos_base, min(3, len(medos_base)))

    # Vieses cognitivos
    num_vieses = random.randint(2, 4)
    perfil['vieses_cognitivos'] = random.sample(VIESES_COGNITIVOS, num_vieses)
    if 'confirmacao' not in perfil['vieses_cognitivos']:
        perfil['vieses_cognitivos'][0] = 'confirmacao'  # Viés mais comum

    # Fontes de informação baseadas no perfil
    idade = perfil['idade']
    if idade < 30:
        fontes_base = FONTES_INFORMACAO_POR_PERFIL['jovem_conectado']
    elif orient in ['direita', 'centro-direita'] and perfil['posicao_bolsonaro'] in ['apoiador_forte', 'apoiador_moderado']:
        fontes_base = FONTES_INFORMACAO_POR_PERFIL['conservador']
    elif orient in ['esquerda', 'centro-esquerda']:
        fontes_base = FONTES_INFORMACAO_POR_PERFIL['progressista']
    elif cluster == 'G1_alta':
        fontes_base = FONTES_INFORMACAO_POR_PERFIL['classe_alta']
    elif idade >= 60:
        fontes_base = FONTES_INFORMACAO_POR_PERFIL['idoso']
    elif cluster in ['G3_media_baixa', 'G4_baixa']:
        fontes_base = FONTES_INFORMACAO_POR_PERFIL['popular']
    else:
        fontes_base = FONTES_INFORMACAO_POR_PERFIL['adulto_tradicional']

    perfil['fontes_informacao'] = random.sample(fontes_base, min(random.randint(2, 4), len(fontes_base)))

    # Tempo de deslocamento
    if perfil['meio_transporte'] == 'nao_se_aplica':
        perfil['tempo_deslocamento_trabalho'] = 'nao_se_aplica'
    elif perfil['ocupacao_vinculo'] in ['aposentado', 'desempregado']:
        perfil['tempo_deslocamento_trabalho'] = 'nao_se_aplica'
    else:
        perfil['tempo_deslocamento_trabalho'] = random.choice(['ate_15', '15_30', '30_45', '45_60', 'mais_60'])

    # Voto facultativo (16-17 ou 70+)
    perfil['voto_facultativo'] = perfil['idade'] < 18 or perfil['idade'] >= 70

    # Conflito identitário
    perfil['conflito_identitario'] = random.choice([True, False, False, False])  # 25% chance

    # História e instrução
    perfil['historia_resumida'] = gerar_historia_resumida(perfil)
    perfil['instrucao_comportamental'] = gerar_instrucao_comportamental(perfil)

    # Garantir ordem dos campos
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

    eleitor_ordenado = {campo: perfil.get(campo) for campo in campos_ordenados if campo in perfil}
    return eleitor_ordenado


def calcular_eleitores_necessarios(distribuicao_atual: Dict, total_atual: int) -> List[Dict]:
    """
    Calcula e retorna a lista de restrições para cada eleitor que precisa ser gerado.
    Prioriza as categorias com maior déficit.
    """
    deficits = calcular_deficits(distribuicao_atual, total_atual)

    # Criar lista de todas as correções necessárias
    correcoes = []
    for variavel, categorias in deficits.items():
        for categoria, quantidade in categorias.items():
            if quantidade > 0:
                correcoes.append({
                    'variavel': variavel,
                    'categoria': categoria,
                    'quantidade': quantidade,
                    'prioridade': quantidade  # Quanto mais falta, mais prioridade
                })

    # Ordenar por prioridade (quantidade necessária)
    correcoes.sort(key=lambda x: x['prioridade'], reverse=True)

    print(f"\n{'='*60}")
    print("CORREÇÕES NECESSÁRIAS (ordenadas por prioridade)")
    print(f"{'='*60}")
    for c in correcoes[:15]:  # Top 15
        print(f"  {c['variavel']}/{c['categoria']}: +{c['quantidade']} eleitores")

    # Gerar lista de restrições para cada eleitor
    restricoes_eleitores = []

    # Processar correções em ordem de prioridade
    for correcao in correcoes:
        var = correcao['variavel']
        cat = correcao['categoria']
        qtd = correcao['quantidade']

        for _ in range(qtd):
            restricao = {var: cat}
            restricoes_eleitores.append(restricao)

    return restricoes_eleitores


def main():
    """Função principal que executa todo o processo de geração."""
    print("="*60)
    print("GERADOR DE ELEITORES CORRETIVOS")
    print("="*60)
    print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Carregar eleitores existentes
    caminho_json = 'C:/Agentes/agentes/banco-eleitores-df.json'
    eleitores_existentes = carregar_eleitores_existentes(caminho_json)
    total_atual = len(eleitores_existentes)
    print(f"\nEleitores existentes: {total_atual}")

    # Calcular distribuição atual
    distribuicao_atual = calcular_distribuicao_atual(eleitores_existentes)

    # Calcular eleitores necessários
    restricoes_eleitores = calcular_eleitores_necessarios(distribuicao_atual, total_atual)

    # Limitar a um número razoável para não explodir
    # Vamos gerar no máximo 200 eleitores para equilibrar
    max_eleitores = 200
    if len(restricoes_eleitores) > max_eleitores:
        print(f"\nLimitando de {len(restricoes_eleitores)} para {max_eleitores} eleitores")
        restricoes_eleitores = restricoes_eleitores[:max_eleitores]

    print(f"\nEleitores a gerar: {len(restricoes_eleitores)}")

    # Gerar eleitores
    novos_eleitores = []
    proximo_id = total_atual + 1

    print(f"\n{'='*60}")
    print("GERANDO ELEITORES...")
    print(f"{'='*60}")

    for i, restricoes in enumerate(restricoes_eleitores):
        id_eleitor = f"df-{proximo_id:04d}"
        eleitor = gerar_eleitor_completo(id_eleitor, restricoes)
        novos_eleitores.append(eleitor)
        proximo_id += 1

        if (i + 1) % 50 == 0:
            print(f"  Gerados: {i + 1}/{len(restricoes_eleitores)}")

    print(f"  Gerados: {len(novos_eleitores)} eleitores")

    # Combinar com existentes
    todos_eleitores = eleitores_existentes + novos_eleitores
    total_final = len(todos_eleitores)

    print(f"\n{'='*60}")
    print("RESULTADO FINAL")
    print(f"{'='*60}")
    print(f"Eleitores anteriores: {total_atual}")
    print(f"Novos eleitores: {len(novos_eleitores)}")
    print(f"Total final: {total_final}")

    # Salvar arquivo
    with open(caminho_json, 'w', encoding='utf-8') as f:
        json.dump(todos_eleitores, f, ensure_ascii=False, indent=2)

    print(f"\nArquivo salvo: {caminho_json}")

    # Calcular nova distribuição para verificação
    nova_distribuicao = calcular_distribuicao_atual(todos_eleitores)

    print(f"\n{'='*60}")
    print("VERIFICAÇÃO PÓS-GERAÇÃO")
    print(f"{'='*60}")

    # Verificar principais variáveis
    variaveis_verificar = ['posicao_bolsonaro', 'renda_salarios_minimos', 'estado_civil',
                          'orientacao_politica', 'interesse_politico', 'tolerancia_nuance']

    for var in variaveis_verificar:
        print(f"\n{var.upper()}:")
        dist = nova_distribuicao.get(var, {})
        ref = REFERENCIAS.get(var, {})
        for cat, ref_val in ref.items():
            atual_val = dist.get(cat, 0)
            diff = atual_val - ref_val
            status = "✓" if abs(diff) <= 5 else "⚠" if abs(diff) <= 10 else "✗"
            print(f"  {status} {cat}: {atual_val:.1f}% (ref: {ref_val}%, diff: {diff:+.1f}%)")

    print(f"\n{'='*60}")
    print("GERAÇÃO CONCLUÍDA!")
    print(f"{'='*60}")

    return total_final, novos_eleitores


if __name__ == '__main__':
    total, novos = main()
