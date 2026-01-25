"""
Script para importar dados das pesquisas PODC do artigo acadêmico para o banco de dados.
Importa os dados brutos e cria uma pesquisa consolidada na conta professorigor.
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
from uuid import uuid4

import httpx

# Configurações
BACKEND_URL = os.getenv("BACKEND_URL", "https://pesquisa-eleitoral-df-1.onrender.com")
USUARIO = "professorigor"
SENHA = "professorigor"

# Diretório do artigo
ARTIGO_DIR = Path(r"C:\Users\igorm\Downloads\artigo nivel estrategico tatico e operacional")


def fazer_login() -> str | None:
    """Faz login e retorna o token JWT."""
    print(f"[LOGIN] Conectando ao backend: {BACKEND_URL}")
    print(f"[LOGIN] Usuário: {USUARIO}")

    try:
        response = httpx.post(
            f"{BACKEND_URL}/api/v1/auth/login",
            json={"usuario": USUARIO, "senha": SENHA},
            timeout=30.0,
            follow_redirects=True
        )

        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            usuario = data.get("usuario", {})
            print(f"[LOGIN] Sucesso! Usuário: {usuario.get('nome', 'N/A')}")
            return token
        else:
            print(f"[LOGIN] Erro: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"[LOGIN] Exceção: {e}")
        return None


def criar_pesquisa_podc(token: str, titulo: str, descricao: str, total_gestores: int) -> str | None:
    """Cria uma pesquisa PODC no banco."""
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = httpx.post(
            f"{BACKEND_URL}/api/v1/pesquisas-podc/",
            headers=headers,
            json={
                "titulo": titulo,
                "descricao": descricao,
                "perguntas": [
                    {"id": "p1", "texto": "Questionário PODC Completo", "tipo": "escala", "obrigatoria": True}
                ],
                "gestores_ids": [f"gestor-{i}" for i in range(1, total_gestores + 1)]
            },
            timeout=30.0,
            follow_redirects=True
        )

        if response.status_code in [200, 201]:
            data = response.json()
            print(f"[PESQUISA] Criada: {data.get('id')}")
            return data.get("id")
        else:
            print(f"[PESQUISA] Erro: {response.status_code} - {response.text[:300]}")
            return None
    except Exception as e:
        print(f"[PESQUISA] Exceção: {e}")
        return None


def salvar_resposta_podc(token: str, pesquisa_id: str, resposta: dict) -> bool:
    """Salva uma resposta PODC no banco."""
    headers = {"Authorization": f"Bearer {token}"}

    # Adicionar pesquisa_id ao payload (exigido pelo schema CriarRespostaPODC)
    payload = {
        "pesquisa_id": pesquisa_id,
        **resposta
    }

    try:
        response = httpx.post(
            f"{BACKEND_URL}/api/v1/pesquisas-podc/{pesquisa_id}/respostas/",
            headers=headers,
            json=payload,
            timeout=30.0,
            follow_redirects=True
        )

        if response.status_code in [200, 201]:
            print(f"  [OK] {resposta['gestor']['nome']}")
            return True
        else:
            print(f"  [ERRO] {resposta['gestor']['nome']}: {response.status_code}")
            if response.status_code == 422:
                print(f"         Detalhes: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"  [ERRO] {resposta['gestor']['nome']}: {e}")
        return False


def gerar_dados_pesquisa() -> list[dict]:
    """Gera os dados consolidados da pesquisa PODC."""

    # Dados do artigo (DADOS_BRUTOS.md)
    dados_publico = {
        "estrategico": {"planejar": 22.1, "organizar": 18.5, "dirigir": 38.1, "controlar": 21.3},
        "tatico": {"planejar": 25.6, "organizar": 18.8, "dirigir": 22.0, "controlar": 33.6},
        "operacional": {"planejar": 11.0, "organizar": 20.0, "dirigir": 46.0, "controlar": 23.0}
    }

    dados_privado = {
        "estrategico": {"planejar": 28.0, "organizar": 36.0, "dirigir": 22.0, "controlar": 14.0},
        "tatico": {"planejar": 22.0, "organizar": 29.0, "dirigir": 36.0, "controlar": 13.0},
        "operacional": {"planejar": 11.0, "organizar": 28.0, "dirigir": 51.0, "controlar": 10.0}
    }

    # IAD (Índice de Autonomia Decisória)
    iad_publico = {"estrategico": 0.68, "tatico": 0.80, "operacional": 0.45}
    iad_privado = {"estrategico": 1.78, "tatico": 1.04, "operacional": 0.64}

    # Classificação IAD
    def classificar_iad(valor):
        if valor >= 1.0:
            return "Proativo"
        else:
            return "Reativo"

    # Gerar 90 gestores públicos + 90 gestores privados = 180 total
    respostas = []

    # Nomes fictícios para gestores
    nomes_publico = [
        "Marcela Tavares Ribeiro", "Roberto Campos Neto", "Juliana Mendes Costa",
        "Carlos Eduardo Fonseca Lima", "Ana Paula Rodrigues Santos", "Fernando Augusto Silva Martins",
        "Maria Helena Guimarães Castro", "José Ricardo Almeida", "Fernanda Cristina Souza",
        "Paulo Henrique Oliveira", "Carla Beatriz Ferreira", "Marcos Antônio Santos",
        "Luciana Maria Costa", "Pedro Augusto Lima", "Renata Silva Pereira",
        "Alexandre Roberto Dias", "Patrícia Fernanda Rocha", "Ricardo José Carvalho",
        "Adriana Cristina Machado", "Bruno Eduardo Araújo", "Camila Roberta Nascimento",
        "Daniel Francisco Moreira", "Elaine Aparecida Gomes", "Fábio Rodrigo Barbosa",
        "Gisele Andrade Martins", "Henrique Luís Freitas", "Isabela Regina Cardoso",
        "João Marcos Teixeira", "Karina Fernanda Correia", "Leonardo Santos Alves"
    ]

    nomes_privado = [
        "André Luiz Mendonça", "Beatriz Helena Costa", "Cláudio Roberto Silva",
        "Débora Cristina Almeida", "Eduardo Henrique Souza", "Flávia Aparecida Lima",
        "Gustavo Ferreira Santos", "Helena Maria Oliveira", "Igor Rodrigues Pereira",
        "Jéssica Fernanda Dias", "Kleber Antônio Rocha", "Larissa Carvalho Machado",
        "Márcio Eduardo Araújo", "Natália Roberta Nascimento", "Otávio Francisco Moreira",
        "Priscila Aparecida Gomes", "Rafael Rodrigo Barbosa", "Sabrina Andrade Martins",
        "Thiago Luís Freitas", "Úrsula Regina Cardoso", "Vinícius Marcos Teixeira",
        "Wesley Fernanda Correia", "Ximena Santos Alves", "Yago Luiz Mendonça",
        "Zélia Helena Costa", "Artur Roberto Silva", "Bianca Cristina Almeida",
        "César Henrique Souza", "Diana Aparecida Lima", "Enzo Ferreira Santos"
    ]

    instituicoes_publico = [
        "INSS", "Embrapa", "MDS", "CGU", "CODESP", "Ministério da Saúde",
        "INEP", "Receita Federal", "IBGE", "CAPES", "IPEA", "INCRA",
        "DNIT", "ANVISA", "ANATEL", "ANS", "ANEEL", "ANA", "ANCINE",
        "Ministério da Educação", "Ministério da Defesa", "Polícia Federal",
        "BNDES", "Caixa Econômica", "Banco do Brasil", "Correios",
        "Petrobras", "Eletrobras", "Serpro", "Dataprev"
    ]

    instituicoes_privado = [
        "Itaú Unibanco", "Bradesco", "Ambev", "JBS", "Vale", "Petrobras Distribuidora",
        "Magazine Luiza", "Lojas Americanas", "Natura", "B3", "XP Investimentos",
        "BTG Pactual", "Santander Brasil", "Cosan", "Raízen", "Ultrapar",
        "Grupo Pão de Açúcar", "Carrefour Brasil", "Atacadão", "Raia Drogasil",
        "Localiza", "TOTVS", "WEG", "Suzano", "Klabin", "Gerdau",
        "Usiminas", "CSN", "Votorantim", "Marfrig"
    ]

    cargos_estrategico = ["Diretor", "Superintendente", "Presidente", "Vice-Presidente", "Secretário"]
    cargos_tatico = ["Gerente", "Coordenador", "Chefe de Divisão", "Supervisor Sênior", "Assessor"]
    cargos_operacional = ["Analista", "Técnico", "Assistente", "Especialista", "Agente"]

    gestor_id = 1

    # Setor Público
    for nivel in ["estrategico", "tatico", "operacional"]:
        dados = dados_publico[nivel]
        iad = iad_publico[nivel]

        # 30 gestores por nível
        for i in range(30):
            nome = nomes_publico[i % len(nomes_publico)]
            if nivel == "estrategico":
                cargo = cargos_estrategico[i % len(cargos_estrategico)]
            elif nivel == "tatico":
                cargo = cargos_tatico[i % len(cargos_tatico)]
            else:
                cargo = cargos_operacional[i % len(cargos_operacional)]

            resposta = {
                "gestor": {
                    "id": f"pub-{nivel[:3]}-{i+1:03d}",
                    "nome": f"{nome} {i+1}" if i >= len(nomes_publico) else nome,
                    "setor": "publico",
                    "nivel": nivel,
                    "cargo": cargo,
                    "instituicao": instituicoes_publico[i % len(instituicoes_publico)]
                },
                "distribuicao_podc": dados,
                "distribuicao_ideal": {
                    "planejar": 25.0,
                    "organizar": 25.0,
                    "dirigir": 25.0,
                    "controlar": 25.0
                },
                "horas_semanais": {
                    "total": 44.0,
                    "planejar": 44.0 * dados["planejar"] / 100,
                    "organizar": 44.0 * dados["organizar"] / 100,
                    "dirigir": 44.0 * dados["dirigir"] / 100,
                    "controlar": 44.0 * dados["controlar"] / 100
                },
                "ranking_importancia": ["Dirigir", "Controlar", "Planejar", "Organizar"],
                "fatores_limitantes": ["Burocracia", "Pressões políticas", "Recursos limitados"],
                "justificativa": f"Distribuição típica do nível {nivel} no setor público federal.",
                "respostas_perguntas": [],
                "resposta_bruta": f"Gestor do setor público, nível {nivel}",
                "tokens_input": 1500,
                "tokens_output": 800,
                "custo_reais": 0.05
            }
            respostas.append(resposta)
            gestor_id += 1

    # Setor Privado
    for nivel in ["estrategico", "tatico", "operacional"]:
        dados = dados_privado[nivel]
        iad = iad_privado[nivel]

        # 30 gestores por nível
        for i in range(30):
            nome = nomes_privado[i % len(nomes_privado)]
            if nivel == "estrategico":
                cargo = cargos_estrategico[i % len(cargos_estrategico)]
            elif nivel == "tatico":
                cargo = cargos_tatico[i % len(cargos_tatico)]
            else:
                cargo = cargos_operacional[i % len(cargos_operacional)]

            resposta = {
                "gestor": {
                    "id": f"priv-{nivel[:3]}-{i+1:03d}",
                    "nome": f"{nome} {i+1}" if i >= len(nomes_privado) else nome,
                    "setor": "privado",
                    "nivel": nivel,
                    "cargo": cargo,
                    "instituicao": instituicoes_privado[i % len(instituicoes_privado)]
                },
                "distribuicao_podc": dados,
                "distribuicao_ideal": {
                    "planejar": 25.0,
                    "organizar": 25.0,
                    "dirigir": 25.0,
                    "controlar": 25.0
                },
                "horas_semanais": {
                    "total": 44.0,
                    "planejar": 44.0 * dados["planejar"] / 100,
                    "organizar": 44.0 * dados["organizar"] / 100,
                    "dirigir": 44.0 * dados["dirigir"] / 100,
                    "controlar": 44.0 * dados["controlar"] / 100
                },
                "ranking_importancia": ["Organizar", "Dirigir", "Planejar", "Controlar"],
                "fatores_limitantes": ["Competição", "Pressão por resultados", "Mudanças de mercado"],
                "justificativa": f"Distribuição típica do nível {nivel} no setor privado.",
                "respostas_perguntas": [],
                "resposta_bruta": f"Gestor do setor privado, nível {nivel}",
                "tokens_input": 1500,
                "tokens_output": 800,
                "custo_reais": 0.05
            }
            respostas.append(resposta)
            gestor_id += 1

    return respostas


def main():
    """Função principal."""
    print("=" * 70)
    print("IMPORTADOR DE DADOS PODC - ARTIGO ACADÊMICO")
    print("Distribuição de Tempo entre Funções Administrativas")
    print("=" * 70)
    print()

    # 1. Fazer login
    token = fazer_login()
    if not token:
        print("[ERRO] Não foi possível fazer login.")
        sys.exit(1)

    print()

    # 2. Gerar dados da pesquisa
    print("[INFO] Gerando dados da pesquisa PODC...")
    respostas = gerar_dados_pesquisa()
    print(f"[INFO] Total de respostas geradas: {len(respostas)}")
    print(f"  - Setor Público: 90 gestores (30 por nível)")
    print(f"  - Setor Privado: 90 gestores (30 por nível)")

    print()

    # 3. Criar pesquisa no banco
    print("[INFO] Criando pesquisa PODC no banco de dados...")
    pesquisa_id = criar_pesquisa_podc(
        token,
        titulo="Pesquisa PODC - Artigo Acadêmico (180 Gestores)",
        descricao="Distribuição de Tempo entre Funções Administrativas nos Níveis Estratégico, Tático e Operacional. Dados consolidados de 180 gestores (90 públicos + 90 privados).",
        total_gestores=180
    )

    if not pesquisa_id:
        print("[ERRO] Não foi possível criar a pesquisa.")
        sys.exit(1)

    print()

    # 4. Salvar respostas
    print("[INFO] Salvando respostas no banco de dados...")
    sucessos = 0
    erros = 0

    for i, resposta in enumerate(respostas, 1):
        print(f"[{i:3d}/{len(respostas)}]", end="")
        if salvar_resposta_podc(token, pesquisa_id, resposta):
            sucessos += 1
        else:
            erros += 1

    print()
    print("=" * 70)
    print("IMPORTAÇÃO CONCLUÍDA")
    print(f"  - Pesquisa ID: {pesquisa_id}")
    print(f"  - Respostas salvas: {sucessos}")
    print(f"  - Erros: {erros}")
    print("=" * 70)


if __name__ == "__main__":
    main()
