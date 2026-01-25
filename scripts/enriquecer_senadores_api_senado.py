#!/usr/bin/env python3
"""
Script para enriquecer dados dos senadores com a API do Senado
https://legis.senado.leg.br/dadosabertos/docs/
"""

import json
import requests
import time
import unicodedata
from pathlib import Path

# Configuração
API_BASE = "https://legis.senado.leg.br/dadosabertos"
HEADERS = {"accept": "application/json"}
TIMEOUT = 15
DELAY_ENTRE_REQUESTS = 0.3

# Caminhos dos arquivos
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
ARQUIVO_SENADORES = PROJECT_DIR / "frontend" / "public" / "data" / "banco-senadores.json"
ARQUIVO_AGENTES = PROJECT_DIR / "agentes" / "banco-senadores.json"


def normalizar_nome(nome):
    """Normaliza nome para comparação"""
    if not nome:
        return ""
    nome = unicodedata.normalize('NFKD', nome).encode('ASCII', 'ignore').decode('ASCII')
    return " ".join(nome.upper().split())


def buscar_senadores_api():
    """Busca lista de todos os senadores em exercício"""
    print("Buscando lista de senadores da API...")
    url = f"{API_BASE}/senador/lista/atual"

    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()

        parlamentares = data.get("ListaParlamentarEmExercicio", {}).get("Parlamentares", {}).get("Parlamentar", [])
        print(f"  Encontrados: {len(parlamentares)} senadores na API")

        # Indexar por nome
        resultado = {}
        for p in parlamentares:
            ident = p.get("IdentificacaoParlamentar", {})
            nome = ident.get("NomeCompletoParlamentar", "") or ident.get("NomeParlamentar", "")
            resultado[normalizar_nome(nome)] = {
                "id": ident.get("CodigoParlamentar"),
                "nome": ident.get("NomeParlamentar"),
                "nome_completo": ident.get("NomeCompletoParlamentar"),
                "email": ident.get("EmailParlamentar"),
                "telefones": ident.get("Telefones", {}).get("Telefone", []),
                "foto_url": ident.get("UrlFotoParlamentar"),
                "pagina_url": ident.get("UrlPaginaParlamentar"),
                "partido": ident.get("SiglaPartidoParlamentar"),
                "uf": ident.get("UfParlamentar"),
                "bloco": ident.get("Bloco", {}),
                "lideranca": ident.get("MembroLideranca", {}),
                "mandato": p.get("Mandato", {})
            }

        return resultado
    except Exception as e:
        print(f"  ERRO ao buscar lista: {e}")
        return {}


def buscar_detalhes_senador(senador_id):
    """Busca detalhes completos de um senador"""
    url = f"{API_BASE}/senador/{senador_id}"

    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()
        return data.get("DetalheParlamentar", {}).get("Parlamentar", {})
    except Exception as e:
        return None


def enriquecer_senadores():
    """Enriquece os dados dos senadores com informações da API"""

    # Carregar dados atuais
    print(f"\nCarregando arquivo: {ARQUIVO_SENADORES}")
    with open(ARQUIVO_SENADORES, "r", encoding="utf-8") as f:
        senadores = json.load(f)
    print(f"  {len(senadores)} senadores no arquivo local")

    # Buscar dados da API
    senadores_api = buscar_senadores_api()
    if not senadores_api:
        print("ERRO: Não foi possível buscar dados da API")
        return

    # Estatísticas
    encontrados = 0
    enriquecidos = 0
    nao_encontrados = []

    print("\nEnriquecendo dados...")

    for i, sen in enumerate(senadores):
        nome_local = sen.get("nome", "")
        nome_parlamentar = sen.get("nome_parlamentar", "")

        # Tentar encontrar na API por nome
        nome_norm = normalizar_nome(nome_local)
        nome_parl_norm = normalizar_nome(nome_parlamentar)

        dados_api = senadores_api.get(nome_norm) or senadores_api.get(nome_parl_norm)

        # Tentar busca parcial
        if not dados_api:
            for nome_api, dados in senadores_api.items():
                if nome_parl_norm and nome_parl_norm in nome_api:
                    dados_api = dados
                    break
                if nome_norm and nome_norm in nome_api:
                    dados_api = dados
                    break
                # Tentar pelo primeiro e último nome
                partes_local = nome_parl_norm.split()
                partes_api = nome_api.split()
                if len(partes_local) >= 2 and len(partes_api) >= 2:
                    if partes_local[0] == partes_api[0] and partes_local[-1] == partes_api[-1]:
                        dados_api = dados
                        break

        if dados_api:
            encontrados += 1

            # Email
            if dados_api.get("email"):
                sen["email_contato"] = dados_api["email"]
                enriquecidos += 1

            # Telefones
            telefones = dados_api.get("telefones", [])
            if telefones:
                if isinstance(telefones, list):
                    tel = telefones[0] if telefones else {}
                else:
                    tel = telefones

                if isinstance(tel, dict):
                    numero = tel.get("NumeroTelefone", "")
                    if numero:
                        sen["telefone_gabinete"] = numero
                elif isinstance(tel, str):
                    sen["telefone_gabinete"] = tel

            # Foto
            if dados_api.get("foto_url"):
                sen["foto_url"] = dados_api["foto_url"]

            # Página do Senado
            if dados_api.get("pagina_url"):
                sen["pagina_senado"] = dados_api["pagina_url"]

            # Bloco/Bancada
            bloco = dados_api.get("bloco", {})
            if bloco and isinstance(bloco, dict):
                sen["bloco_parlamentar"] = bloco.get("NomeBloco", "")

            # Liderança
            lideranca = dados_api.get("lideranca", {})
            if lideranca and isinstance(lideranca, dict):
                descricao = lideranca.get("DescricaoParticipacao", "")
                if descricao:
                    sen["cargo_lideranca"] = descricao

            # Buscar detalhes adicionais
            senador_id = dados_api.get("id")
            if senador_id:
                time.sleep(DELAY_ENTRE_REQUESTS)
                detalhes = buscar_detalhes_senador(senador_id)

                if detalhes:
                    dados_basicos = detalhes.get("DadosBasicosParlamentar", {})

                    # Data de nascimento
                    if dados_basicos.get("DataNascimento"):
                        sen["data_nascimento"] = dados_basicos["DataNascimento"]

                    # Naturalidade
                    if dados_basicos.get("NaturalidadeMunicipio"):
                        sen["naturalidade"] = dados_basicos["NaturalidadeMunicipio"]

                    if dados_basicos.get("NaturalidadeUf"):
                        sen["uf_nascimento"] = dados_basicos["NaturalidadeUf"]

                    # Redes sociais
                    redes = {}
                    if dados_basicos.get("UrlPaginaParticular"):
                        redes["website"] = dados_basicos["UrlPaginaParticular"]

                    # Buscar redes sociais do histórico de mandatos
                    # (a API do Senado não fornece redes sociais diretamente)

                    if redes:
                        sen["redes_sociais"] = redes

        else:
            nao_encontrados.append(nome_local)

        # Progresso
        if (i + 1) % 20 == 0:
            print(f"  Processados: {i + 1}/{len(senadores)} ({encontrados} encontrados)")

    print(f"\n=== RESUMO ===")
    print(f"Total processados: {len(senadores)}")
    print(f"Encontrados na API: {encontrados}")
    print(f"Não encontrados: {len(nao_encontrados)}")

    if nao_encontrados:
        print(f"\nSenadores não encontrados na API:")
        for nome in nao_encontrados[:10]:
            print(f"  - {nome}")

    # Salvar arquivos
    print(f"\nSalvando arquivos...")

    with open(ARQUIVO_SENADORES, "w", encoding="utf-8") as f:
        json.dump(senadores, f, ensure_ascii=False, indent=2)
    print(f"  Salvo: {ARQUIVO_SENADORES}")

    with open(ARQUIVO_AGENTES, "w", encoding="utf-8") as f:
        json.dump(senadores, f, ensure_ascii=False, indent=2)
    print(f"  Salvo: {ARQUIVO_AGENTES}")

    # Mostrar exemplo
    for sen in senadores:
        if sen.get("email_contato") and sen.get("telefone_gabinete"):
            print(f"\nExemplo de senador enriquecido:")
            print(f"  Nome: {sen.get('nome')}")
            print(f"  Email: {sen.get('email_contato')}")
            print(f"  Telefone: {sen.get('telefone_gabinete')}")
            print(f"  Bloco: {sen.get('bloco_parlamentar')}")
            print(f"  Lideranca: {sen.get('cargo_lideranca')}")
            break

    print("\nEnriquecimento concluído!")


if __name__ == "__main__":
    enriquecer_senadores()
