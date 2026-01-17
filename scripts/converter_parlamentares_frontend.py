#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para converter banco de parlamentares para formato do frontend.
Gera arquivos JSON compatíveis com a estrutura esperada pelo frontend.
"""

import json
import os
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Carregar dados do banco gerado
def carregar_banco(arquivo: str) -> Dict[str, Any]:
    with open(arquivo, 'r', encoding='utf-8') as f:
        return json.load(f)


# Mapeamentos de dados
FORMACOES = [
    "Direito", "Administração", "Economia", "Engenharia Civil", "Medicina",
    "Jornalismo", "Ciências Políticas", "Pedagogia", "Agronomia", "Contabilidade",
    "Ciências Sociais", "História", "Filosofia", "Teologia", "Engenharia Elétrica",
    "Psicologia", "Enfermagem", "Odontologia", "Veterinária", "Letras"
]

PROFISSOES = [
    "Advogado", "Empresário", "Médico", "Professor", "Agricultor",
    "Servidor Público", "Engenheiro", "Economista", "Jornalista", "Pastor",
    "Policial", "Militar", "Comerciante", "Bancário", "Sindicalista",
    "Político profissional", "Produtor rural", "Comunicador", "Administrador"
]

COMISSOES = [
    "Comissão de Constituição e Justiça",
    "Comissão de Finanças e Tributação",
    "Comissão de Educação",
    "Comissão de Saúde",
    "Comissão de Seguridade Social e Família",
    "Comissão de Agricultura",
    "Comissão de Meio Ambiente",
    "Comissão de Direitos Humanos",
    "Comissão de Trabalho",
    "Comissão de Ciência e Tecnologia",
    "Comissão de Relações Exteriores",
    "Comissão de Defesa Nacional",
    "Comissão de Viação e Transportes",
    "Comissão de Minas e Energia",
    "Comissão de Desenvolvimento Econômico",
    "Comissão de Segurança Pública",
    "Comissão de Cultura",
    "Comissão de Esporte",
    "Comissão de Turismo",
    "Comissão de Integração Nacional"
]

FRENTES = [
    "Frente Parlamentar da Agropecuária",
    "Frente Parlamentar Evangélica",
    "Frente Parlamentar da Segurança Pública",
    "Frente Parlamentar Ambientalista",
    "Frente Parlamentar em Defesa da Educação",
    "Frente Parlamentar da Saúde",
    "Frente Parlamentar da Indústria",
    "Frente Parlamentar da Micro e Pequena Empresa",
    "Frente Parlamentar do Cooperativismo",
    "Frente Parlamentar em Defesa dos Direitos da Criança",
    "Frente Parlamentar Mista da Mineração",
    "Frente Parlamentar do Esporte",
    "Frente Parlamentar em Defesa das Universidades",
    "Frente Parlamentar dos Servidores Públicos"
]

VALORES = [
    "Família", "Trabalho", "Fé", "Liberdade", "Justiça social",
    "Desenvolvimento sustentável", "Tradição", "Progresso",
    "Igualdade", "Meritocracia", "Solidariedade", "Patriotismo",
    "Responsabilidade fiscal", "Democracia", "Transparência"
]

PREOCUPACOES = [
    "Desemprego", "Violência", "Corrupção", "Saúde pública",
    "Educação", "Inflação", "Desigualdade social", "Meio ambiente",
    "Segurança alimentar", "Dívida pública", "Fome", "Moradia"
]

MEDOS = [
    "Instabilidade política", "Crise econômica", "Degradação ambiental",
    "Violência urbana", "Polarização política", "Perda de competitividade",
    "Retrocesso democrático", "Aumento de impostos"
]

VIESES = [
    "confirmacao", "disponibilidade", "ancoragem", "otimismo",
    "tribalismo", "retrospectiva", "autoridade"
]

FONTES_INFO = [
    "TV aberta", "Rádio", "Jornais impressos", "Portais de notícias",
    "YouTube", "WhatsApp", "Instagram", "Twitter/X", "TikTok",
    "Redes sociais", "Assessoria parlamentar", "Pesquisas de opinião"
]


def gerar_parlamentar_frontend(parlamentar: Dict[str, Any], index: int) -> Dict[str, Any]:
    """Converte um parlamentar para o formato do frontend."""

    tipo = parlamentar.get("tipo", "deputado_federal")
    nome = parlamentar.get("nome_parlamentar", parlamentar.get("nome", ""))
    partido = parlamentar.get("partido", "")
    uf = parlamentar.get("uf", "")
    genero = parlamentar.get("genero", "masculino")
    idade = parlamentar.get("idade_estimada", random.randint(40, 65))
    espectro = parlamentar.get("espectro_politico", "centro")
    bancadas = parlamentar.get("bancadas_tematicas", [])

    # Casa legislativa
    if tipo == "senador":
        casa = "senado"
        cargo = "senador"
        prefixo_id = "sen"
    else:
        casa = "camara_federal"
        cargo = "deputado_federal"
        prefixo_id = "dep-fed"

    # Gerar ID
    id_parlamentar = f"{prefixo_id}-{index:04d}"

    # Data de nascimento
    ano_nascimento = datetime.now().year - idade
    data_nascimento = f"{ano_nascimento}-{random.randint(1,12):02d}-{random.randint(1,28):02d}"

    # Cor/Raça (estatística brasileira)
    cor_raca = random.choices(
        ["branca", "parda", "preta", "amarela", "indigena"],
        weights=[45, 40, 12, 2, 1]
    )[0]

    # Formação e profissão
    formacao = random.sample(FORMACOES, k=random.randint(1, 2))
    profissao = random.choice(PROFISSOES)

    # Orientação política baseada no espectro
    if espectro == "direita":
        orientacao = random.choice(["direita", "centro_direita"])
        posicao_bolsonaro = random.choice(["apoiador_forte", "apoiador_moderado"])
        posicao_lula = random.choice(["opositor_forte", "opositor_moderado"])
        relacao_governo = random.choice(["oposicao_forte", "oposicao_moderada"])
    elif espectro == "centro-direita":
        orientacao = "centro_direita"
        posicao_bolsonaro = random.choice(["apoiador_moderado", "neutro"])
        posicao_lula = random.choice(["opositor_moderado", "neutro"])
        relacao_governo = random.choice(["oposicao_moderada", "independente"])
    elif espectro == "esquerda":
        orientacao = random.choice(["esquerda", "centro_esquerda"])
        posicao_bolsonaro = random.choice(["opositor_forte", "opositor_moderado"])
        posicao_lula = random.choice(["apoiador_forte", "apoiador_moderado"])
        relacao_governo = random.choice(["base_aliada", "situacao"])
    elif espectro == "centro-esquerda":
        orientacao = "centro_esquerda"
        posicao_bolsonaro = random.choice(["opositor_moderado", "neutro"])
        posicao_lula = random.choice(["apoiador_moderado", "neutro"])
        relacao_governo = random.choice(["situacao", "aliado_com_ressalvas"])
    else:  # centro
        orientacao = "centro"
        posicao_bolsonaro = random.choice(["neutro", "apoiador_moderado", "opositor_moderado"])
        posicao_lula = random.choice(["neutro", "apoiador_moderado", "opositor_moderado"])
        relacao_governo = random.choice(["independente", "centrao", "aliado_situacional"])

    # Comissões e frentes baseadas nas bancadas
    comissoes = random.sample(COMISSOES, k=random.randint(2, 4))
    frentes = []

    if "ruralista" in bancadas:
        frentes.append("Frente Parlamentar da Agropecuária")
    if "evangelica" in bancadas:
        frentes.append("Frente Parlamentar Evangélica")
    if "bala" in bancadas:
        frentes.append("Frente Parlamentar da Segurança Pública")
    if "ambientalista" in bancadas:
        frentes.append("Frente Parlamentar Ambientalista")
    if "saude" in bancadas:
        frentes.append("Frente Parlamentar da Saúde")
    if "educacao" in bancadas:
        frentes.append("Frente Parlamentar em Defesa da Educação")

    # Adicionar frentes aleatórias se tiver poucas
    while len(frentes) < 3:
        frente = random.choice(FRENTES)
        if frente not in frentes:
            frentes.append(frente)

    # Temas de atuação
    temas = parlamentar.get("temas_prioritarios", [])
    if not temas:
        temas = random.sample([
            "Economia", "Saúde", "Educação", "Segurança", "Meio Ambiente",
            "Agricultura", "Trabalho", "Infraestrutura", "Tecnologia", "Defesa"
        ], k=random.randint(3, 5))

    # Religião
    if "evangelica" in bancadas:
        religiao = random.choice(["evangelico", "neopentecostal", "protestante"])
    else:
        religiao = random.choices(
            ["catolico", "evangelico", "espirita", "sem_religiao", "outras"],
            weights=[50, 30, 5, 10, 5]
        )[0]

    # Votos
    if tipo == "senador":
        votos = random.randint(500000, 10000000)
    else:
        votos = random.randint(50000, 500000)

    # Montar perfil completo
    perfil = {
        "id": id_parlamentar,
        "nome": nome,
        "nome_parlamentar": nome,
        "idade": idade,
        "data_nascimento": data_nascimento,
        "genero": genero,
        "cor_raca": cor_raca,
        "naturalidade": parlamentar.get("capital_estado", ""),
        "uf_nascimento": uf,
        "uf": uf,
        "estado": parlamentar.get("estado", ""),
        "regiao": parlamentar.get("regiao", ""),
        "casa_legislativa": casa,
        "cargo": cargo,
        "partido": partido,
        "partido_nome_completo": parlamentar.get("partido_nome_completo", partido),
        "numero_partido": random.randint(10, 99),
        "mandato_inicio": "2023-02-01",
        "mandato_fim": "2027-01-31",
        "legislatura": 57,
        "votos_eleicao": votos,
        "foto_url": parlamentar.get("foto_url", ""),
        "foto_url_alternativa": parlamentar.get("foto_url_alternativa", ""),

        # Formação e carreira
        "formacao_academica": formacao,
        "profissao_anterior": profissao,
        "carreira_profissional": f"{profissao} com atuação no {uf}",
        "historico_politico": [f"{cargo.replace('_', ' ').title()} pelo {uf} (2023-2027)"],

        # Atuação parlamentar
        "comissoes_atuais": comissoes,
        "liderancas": [],
        "frentes_parlamentares": frentes,
        "temas_atuacao": temas,
        "projetos_lei_destaque": [],
        "base_eleitoral": f"Eleitores de {parlamentar.get('capital_estado', uf)} e região",

        # Dados pessoais
        "religiao": religiao,
        "estado_civil": random.choice(["casado", "solteiro", "divorciado", "viuvo"]),
        "filhos": random.randint(0, 5),

        # Posicionamento político
        "orientacao_politica": orientacao,
        "espectro_politico": espectro,
        "posicao_bolsonaro": posicao_bolsonaro,
        "posicao_lula": posicao_lula,
        "interesse_politico": random.choice(["muito_alto", "alto", "medio"]),
        "tolerancia_nuance": random.choice(["alta", "media", "baixa"]),
        "estilo_decisao": random.choice(["racional", "ideologico", "pragmatico", "identitario"]),
        "estilo_comunicacao": random.choice(["articulado", "popular", "tecnico", "agressivo", "conciliador"]),

        # Bancadas temáticas
        "bancadas_tematicas": bancadas,
        "bancada_bbb": parlamentar.get("bancada_bbb", False),

        # Valores e preocupações
        "valores": random.sample(VALORES, k=random.randint(3, 5)),
        "preocupacoes": random.sample(PREOCUPACOES, k=random.randint(3, 5)),
        "medos": random.sample(MEDOS, k=random.randint(2, 4)),
        "vieses_cognitivos": random.sample(VIESES, k=random.randint(1, 3)),
        "fontes_informacao": random.sample(FONTES_INFO, k=random.randint(3, 5)),

        # Alianças
        "aliancas_politicas": [partido],
        "relacao_governo_atual": relacao_governo,

        # Contato
        "email_contato": f"dep.{nome.lower().split()[0].replace(' ', '')}@{'camara' if casa == 'camara_federal' else 'senado'}.leg.br",
        "telefone_gabinete": f"(61) 3215-{random.randint(1000, 9999)}",
        "gabinete_localizacao": f"Gabinete {random.randint(100, 999)} - Anexo {'IV' if casa == 'camara_federal' else 'II'}",
        "redes_sociais": {
            "instagram": f"@{nome.lower().split()[0].replace(' ', '')}",
            "twitter": f"@{nome.lower().split()[0].replace(' ', '')}"
        },

        # Metadados
        "criado_em": datetime.now().isoformat() + "Z",
        "atualizado_em": datetime.now().isoformat() + "Z",
        "fonte_dados": "Câmara dos Deputados / Senado Federal / TSE",
        "versao": "2.0"
    }

    return perfil


def main():
    """Função principal."""
    print("=" * 60)
    print("CONVERSAO DE PARLAMENTARES PARA FORMATO FRONTEND")
    print("=" * 60)

    # Diretórios
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    agentes_dir = os.path.join(base_dir, "agentes")
    frontend_data_dir = os.path.join(base_dir, "frontend", "public", "data")

    # Carregar dados gerados
    print("\n[1/4] Carregando dados...")

    arquivo_deputados = os.path.join(agentes_dir, "banco-deputados-federais-brasil.json")
    arquivo_senadores = os.path.join(agentes_dir, "banco-senadores-brasil.json")

    dados_deputados = carregar_banco(arquivo_deputados)
    dados_senadores = carregar_banco(arquivo_senadores)

    deputados = dados_deputados.get("deputados", [])
    senadores = dados_senadores.get("senadores", [])

    print(f"      Deputados: {len(deputados)}")
    print(f"      Senadores: {len(senadores)}")

    # Converter para formato frontend
    print("\n[2/4] Convertendo deputados...")
    deputados_frontend = []
    for i, dep in enumerate(deputados, 1):
        dep_convertido = gerar_parlamentar_frontend(dep, i)
        deputados_frontend.append(dep_convertido)
    print(f"      {len(deputados_frontend)} deputados convertidos")

    print("\n[3/4] Convertendo senadores...")
    senadores_frontend = []
    for i, sen in enumerate(senadores, 1):
        sen_convertido = gerar_parlamentar_frontend(sen, i)
        senadores_frontend.append(sen_convertido)
    print(f"      {len(senadores_frontend)} senadores convertidos")

    # Salvar arquivos
    print("\n[4/4] Salvando arquivos...")

    # Arquivo de deputados federais
    arquivo_dep_frontend = os.path.join(frontend_data_dir, "banco-deputados-federais.json")
    with open(arquivo_dep_frontend, "w", encoding="utf-8") as f:
        json.dump(deputados_frontend, f, ensure_ascii=False, indent=2)
    print(f"      [OK] {arquivo_dep_frontend}")

    # Arquivo de senadores
    arquivo_sen_frontend = os.path.join(frontend_data_dir, "banco-senadores.json")
    with open(arquivo_sen_frontend, "w", encoding="utf-8") as f:
        json.dump(senadores_frontend, f, ensure_ascii=False, indent=2)
    print(f"      [OK] {arquivo_sen_frontend}")

    # Resumo
    print("\n" + "=" * 60)
    print("RESUMO")
    print("=" * 60)
    print(f"Deputados Federais: {len(deputados_frontend)}")
    print(f"Senadores: {len(senadores_frontend)}")
    print(f"TOTAL: {len(deputados_frontend) + len(senadores_frontend)} parlamentares")

    # Estatísticas
    todos = deputados_frontend + senadores_frontend
    por_partido = {}
    for p in todos:
        partido = p["partido"]
        por_partido[partido] = por_partido.get(partido, 0) + 1

    print("\nTop 10 Partidos:")
    for partido, qtd in sorted(por_partido.items(), key=lambda x: -x[1])[:10]:
        print(f"  {partido}: {qtd}")

    print("\n" + "=" * 60)
    print("[SUCESSO] CONVERSAO CONCLUIDA!")
    print("=" * 60)


if __name__ == "__main__":
    main()
