#!/usr/bin/env python3
"""
Script para sincronizar dados de entrevistas locais para o servidor PostgreSQL.

Converte os dados raw de entrevistas para o formato de sessões e envia para a API.
"""

import json
import requests
from datetime import datetime
import uuid

# Configuração
API_URL = "https://api.inteia.com.br/api/v1"
USUARIO = "professorigor"
SENHA = "professorigor"


def fazer_login():
    """Faz login e retorna o token JWT."""
    response = requests.post(
        f"{API_URL}/auth/login",
        json={"usuario": USUARIO, "senha": SENHA}
    )
    response.raise_for_status()
    return response.json()["access_token"]


def carregar_dados_raw(caminho):
    """Carrega dados raw de entrevistas."""
    with open(caminho, "r", encoding="utf-8") as f:
        return json.load(f)


def converter_para_sessao(dados_raw, titulo, data_criacao):
    """Converte dados raw para formato de sessão."""
    sessao_id = f"sessao-{uuid.uuid4().hex[:8]}"

    # Converter respostas para o formato esperado
    respostas = []
    for eleitor in dados_raw:
        resposta = {
            "eleitor_id": eleitor["eleitor_id"],
            "eleitor_nome": eleitor["nome"],
            "respostas": [
                {
                    "pergunta_id": f"p{i+1:02d}",
                    "resposta": str(valor) if not isinstance(valor, (list, dict)) else json.dumps(valor)
                }
                for i, (_, valor) in enumerate(eleitor["respostas"].items())
            ],
            "tokens_usados": 1500,  # Estimativa
            "custo": 0.015,  # Estimativa
            "tempo_resposta_ms": 2000
        }
        respostas.append(resposta)

    # Criar sessão
    sessao = {
        "id": sessao_id,
        "entrevistaId": f"ent-{uuid.uuid4().hex[:8]}",
        "titulo": titulo,
        "status": "concluida",
        "progresso": 100,
        "totalAgentes": len(dados_raw),
        "custoAtual": len(dados_raw) * 0.015,
        "tokensInput": len(dados_raw) * 1000,
        "tokensOutput": len(dados_raw) * 500,
        "respostas": respostas,
        "iniciadaEm": data_criacao,
        "atualizadaEm": datetime.now().isoformat(),
        "finalizadaEm": data_criacao,
    }

    return sessao


def enviar_sessao(token, sessao):
    """Envia uma sessao para o servidor."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        f"{API_URL}/sessoes/",
        json=sessao,
        headers=headers
    )

    if response.status_code in [200, 201]:
        print(f"    [OK] Sessao '{sessao['titulo']}' enviada com sucesso!")
        return True
    else:
        print(f"    [ERRO] Erro ao enviar sessao: {response.status_code} - {response.text}")
        return False


def main():
    print("=" * 60)
    print("SINCRONIZACAO DE SESSOES PARA O SERVIDOR")
    print("=" * 60)

    # Login
    print("\n[*] Fazendo login...")
    try:
        token = fazer_login()
        print("[OK] Login realizado com sucesso!")
    except Exception as e:
        print(f"[ERRO] Erro no login: {e}")
        return

    # Arquivos de dados raw
    arquivos = [
        {
            "caminho": "frontend/public/resultados-intencao-voto/entrevistas_raw_20260126_185104.json",
            "titulo": "Pesquisa Governador DF 2026 - Lote 1",
            "data": "2026-01-26T18:51:04"
        },
        {
            "caminho": "frontend/public/resultados-intencao-voto/entrevistas_raw_20260126_192100.json",
            "titulo": "Pesquisa Governador DF 2026 - Lote 2",
            "data": "2026-01-26T19:21:00"
        }
    ]

    sessoes_enviadas = 0

    for arquivo in arquivos:
        print(f"\n[*] Processando: {arquivo['caminho']}")

        try:
            # Carregar dados
            dados = carregar_dados_raw(arquivo["caminho"])
            print(f"    {len(dados)} respostas encontradas")

            # Converter para sessao
            sessao = converter_para_sessao(dados, arquivo["titulo"], arquivo["data"])

            # Enviar para servidor
            if enviar_sessao(token, sessao):
                sessoes_enviadas += 1

        except FileNotFoundError:
            print(f"    [WARN] Arquivo nao encontrado")
        except Exception as e:
            print(f"    [ERRO] Erro: {e}")

    print("\n" + "=" * 60)
    print(f"RESULTADO: {sessoes_enviadas} sessões enviadas para o servidor")
    print("=" * 60)

    # Verificar sessoes no servidor
    print("\n[*] Verificando sessoes no servidor...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/sessoes/", headers=headers)

    if response.status_code == 200:
        data = response.json()
        print(f"[OK] Total de sessoes no servidor: {data['total']}")
        for sessao in data["sessoes"]:
            print(f"    - {sessao['titulo']} ({sessao['status']})")
    else:
        print(f"[ERRO] Erro ao verificar: {response.text}")


if __name__ == "__main__":
    main()
