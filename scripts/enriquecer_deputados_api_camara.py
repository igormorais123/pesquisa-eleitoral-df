#!/usr/bin/env python3
"""
Script para enriquecer dados dos deputados federais com a API da Câmara
https://dadosabertos.camara.leg.br/swagger/api.html
"""

import json
import requests
import time
import sys
from pathlib import Path

# Configuração
API_BASE = "https://dadosabertos.camara.leg.br/api/v2"
HEADERS = {"accept": "application/json"}
TIMEOUT = 15
DELAY_ENTRE_REQUESTS = 0.3  # 300ms entre requests para não sobrecarregar

# Caminhos dos arquivos
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
ARQUIVO_DEPUTADOS = PROJECT_DIR / "frontend" / "public" / "data" / "banco-deputados-federais.json"
ARQUIVO_AGENTES = PROJECT_DIR / "agentes" / "banco-deputados-federais.json"


def buscar_deputados_api():
    """Busca lista de todos os deputados da legislatura atual"""
    print("Buscando lista de deputados da API...")
    url = f"{API_BASE}/deputados?itens=600&ordem=ASC&ordenarPor=nome"

    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        dados = r.json().get("dados", [])
        print(f"  Encontrados: {len(dados)} deputados na API")
        return {d["nome"].upper(): d for d in dados}
    except Exception as e:
        print(f"  ERRO ao buscar lista: {e}")
        return {}


def buscar_detalhes_deputado(dep_id):
    """Busca detalhes completos de um deputado"""
    url = f"{API_BASE}/deputados/{dep_id}"

    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        return r.json().get("dados", {})
    except Exception as e:
        return None


def normalizar_nome(nome):
    """Normaliza nome para comparação"""
    import unicodedata
    if not nome:
        return ""
    # Remove acentos
    nome = unicodedata.normalize('NFKD', nome).encode('ASCII', 'ignore').decode('ASCII')
    # Uppercase e remove espaços extras
    return " ".join(nome.upper().split())


def enriquecer_deputados():
    """Enriquece os dados dos deputados com informações da API"""

    # Carregar dados atuais
    print(f"\nCarregando arquivo: {ARQUIVO_DEPUTADOS}")
    with open(ARQUIVO_DEPUTADOS, "r", encoding="utf-8") as f:
        deputados = json.load(f)
    print(f"  {len(deputados)} deputados no arquivo local")

    # Buscar dados da API
    deputados_api = buscar_deputados_api()
    if not deputados_api:
        print("ERRO: Não foi possível buscar dados da API")
        return

    # Criar índice por nome normalizado
    deputados_api_norm = {normalizar_nome(nome): dados for nome, dados in deputados_api.items()}

    # Estatísticas
    encontrados = 0
    enriquecidos = 0
    nao_encontrados = []

    print("\nEnriquecendo dados...")

    for i, dep in enumerate(deputados):
        nome_local = dep.get("nome", "")
        nome_parlamentar = dep.get("nome_parlamentar", "")

        # Tentar encontrar na API por nome
        nome_norm = normalizar_nome(nome_local)
        nome_parl_norm = normalizar_nome(nome_parlamentar)

        dados_api = deputados_api_norm.get(nome_norm) or deputados_api_norm.get(nome_parl_norm)

        # Tentar busca parcial
        if not dados_api:
            for nome_api, dados in deputados_api_norm.items():
                if nome_parl_norm and nome_parl_norm in nome_api:
                    dados_api = dados
                    break
                if nome_norm and nome_norm in nome_api:
                    dados_api = dados
                    break

        if dados_api:
            encontrados += 1
            dep_id = dados_api["id"]

            # Atualizar dados básicos da lista
            if dados_api.get("email"):
                dep["email_contato"] = dados_api["email"]
                enriquecidos += 1

            if dados_api.get("urlFoto"):
                dep["foto_url"] = dados_api["urlFoto"]

            # Buscar detalhes completos
            time.sleep(DELAY_ENTRE_REQUESTS)
            detalhes = buscar_detalhes_deputado(dep_id)

            if detalhes:
                # Redes sociais
                if detalhes.get("redeSocial"):
                    redes = {}
                    for url in detalhes["redeSocial"]:
                        url_lower = url.lower()
                        if "twitter.com" in url_lower or "x.com" in url_lower:
                            redes["twitter"] = url
                        elif "facebook.com" in url_lower:
                            redes["facebook"] = url
                        elif "instagram.com" in url_lower:
                            redes["instagram"] = url
                        elif "youtube.com" in url_lower:
                            redes["youtube"] = url
                        elif "tiktok.com" in url_lower:
                            redes["tiktok"] = url
                    if redes:
                        dep["redes_sociais"] = redes

                # Website
                if detalhes.get("urlWebsite"):
                    dep["website"] = detalhes["urlWebsite"]

                # Escolaridade
                if detalhes.get("escolaridade"):
                    escolaridade = detalhes["escolaridade"]
                    if escolaridade and escolaridade not in dep.get("formacao_academica", []):
                        if "formacao_academica" not in dep:
                            dep["formacao_academica"] = []
                        dep["formacao_academica"].insert(0, escolaridade)

                # Gabinete (do ultimoStatus)
                ultimo_status = detalhes.get("ultimoStatus", {})
                if ultimo_status:
                    gabinete = ultimo_status.get("gabinete", {})
                    if gabinete:
                        if gabinete.get("nome"):
                            dep["gabinete_localizacao"] = gabinete["nome"]
                        if gabinete.get("predio"):
                            dep["gabinete_predio"] = gabinete["predio"]
                        if gabinete.get("sala"):
                            dep["gabinete_sala"] = gabinete["sala"]
                        if gabinete.get("andar"):
                            dep["gabinete_andar"] = gabinete["andar"]
                        if gabinete.get("telefone"):
                            dep["telefone_gabinete"] = gabinete["telefone"]
                        if gabinete.get("email"):
                            dep["email_contato"] = gabinete["email"]

                    # Condição atual
                    if ultimo_status.get("condicaoEleitoral"):
                        dep["condicao_eleitoral"] = ultimo_status["condicaoEleitoral"]
                    if ultimo_status.get("situacao"):
                        dep["situacao_mandato"] = ultimo_status["situacao"]

            # Progresso
            if (i + 1) % 50 == 0:
                print(f"  Processados: {i + 1}/{len(deputados)} ({encontrados} encontrados)")

        else:
            nao_encontrados.append(nome_local)

    print(f"\n=== RESUMO ===")
    print(f"Total processados: {len(deputados)}")
    print(f"Encontrados na API: {encontrados}")
    print(f"Não encontrados: {len(nao_encontrados)}")

    if nao_encontrados:
        print(f"\nDeputados não encontrados na API:")
        for nome in nao_encontrados[:10]:
            print(f"  - {nome}")
        if len(nao_encontrados) > 10:
            print(f"  ... e mais {len(nao_encontrados) - 10}")

    # Salvar arquivos
    print(f"\nSalvando arquivos...")

    with open(ARQUIVO_DEPUTADOS, "w", encoding="utf-8") as f:
        json.dump(deputados, f, ensure_ascii=False, indent=2)
    print(f"  Salvo: {ARQUIVO_DEPUTADOS}")

    with open(ARQUIVO_AGENTES, "w", encoding="utf-8") as f:
        json.dump(deputados, f, ensure_ascii=False, indent=2)
    print(f"  Salvo: {ARQUIVO_AGENTES}")

    # Mostrar exemplo de deputado enriquecido
    for dep in deputados:
        if dep.get("email_contato") and dep.get("telefone_gabinete"):
            print(f"\nExemplo de deputado enriquecido:")
            print(f"  Nome: {dep.get('nome')}")
            print(f"  Email: {dep.get('email_contato')}")
            print(f"  Telefone: {dep.get('telefone_gabinete')}")
            print(f"  Gabinete: {dep.get('gabinete_localizacao')}")
            print(f"  Redes Sociais: {dep.get('redes_sociais', {})}")
            break

    print("\nEnriquecimento concluído!")


if __name__ == "__main__":
    enriquecer_deputados()
