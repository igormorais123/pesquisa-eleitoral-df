#!/usr/bin/env python3
"""
Script para importar candidatos do JSON para o banco de dados via API.
"""

import json
import requests
import sys
from pathlib import Path

# URLs do backend
BACKEND_LOCAL = "http://localhost:8000"
BACKEND_RENDER = "https://pesquisa-eleitoral-df-1.onrender.com"

# Credenciais (usar as mesmas do usuário admin)
CREDENTIALS = {
    "usuario": "professorigor",
    "senha": "professorigor"
}


def login(base_url: str) -> str:
    """Faz login e retorna o token JWT."""
    print(f"Fazendo login em {base_url}...")
    response = requests.post(
        f"{base_url}/api/v1/auth/login",
        json=CREDENTIALS,
        timeout=30
    )

    if response.status_code != 200:
        print(f"Erro no login: {response.status_code}")
        print(response.text)
        sys.exit(1)

    data = response.json()
    token = data.get("access_token")
    print(f"Login bem-sucedido!")
    return token


def importar_candidatos(base_url: str, token: str, candidatos: list) -> dict:
    """Importa lista de candidatos via API."""
    print(f"Importando {len(candidatos)} candidatos...")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        f"{base_url}/api/v1/candidatos/importar-json",
        headers=headers,
        json=candidatos,
        timeout=60
    )

    if response.status_code not in [200, 201]:
        print(f"Erro na importação: {response.status_code}")
        print(response.text)
        return {"erro": response.text}

    return response.json()


def main():
    # Verificar argumentos
    use_production = "--prod" in sys.argv or "-p" in sys.argv
    base_url = BACKEND_RENDER if use_production else BACKEND_LOCAL

    print(f"=== Importador de Candidatos ===")
    print(f"Ambiente: {'PRODUÇÃO (Render)' if use_production else 'LOCAL'}")
    print(f"URL: {base_url}")
    print()

    # Carregar JSON de candidatos
    json_path = Path(__file__).parent.parent / "agentes" / "banco-candidatos-df-2026.json"

    if not json_path.exists():
        print(f"Arquivo não encontrado: {json_path}")
        sys.exit(1)

    print(f"Lendo arquivo: {json_path}")
    with open(json_path, "r", encoding="utf-8") as f:
        dados = json.load(f)

    candidatos = dados.get("candidatos", [])
    print(f"Encontrados {len(candidatos)} candidatos")

    # Fazer login
    token = login(base_url)

    # Importar candidatos
    resultado = importar_candidatos(base_url, token, candidatos)

    print()
    print("=== Resultado ===")
    print(json.dumps(resultado, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
