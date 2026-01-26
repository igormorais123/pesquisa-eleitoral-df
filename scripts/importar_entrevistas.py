"""
Script para importar entrevistas para a conta professorigor no banco de dados.
Executa login, verifica dados existentes e importa entrevistas locais.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

import httpx

# Configurações
BACKEND_URL = os.getenv("BACKEND_URL", "https://api.inteia.com.br")
USUARIO = "professorigor"
SENHA = "professorigor"  # Senha padrão de demonstração

# Diretórios de dados
BASE_DIR = Path(__file__).parent.parent
RESULTADOS_DIR = BASE_DIR / "resultados"
AGENTES_DIR = BASE_DIR / "agentes"


def fazer_login() -> str | None:
    """Faz login e retorna o token JWT."""
    print(f"[LOGIN] Conectando ao backend: {BACKEND_URL}")
    print(f"[LOGIN] Usuário: {USUARIO}")

    try:
        response = httpx.post(
            f"{BACKEND_URL}/api/v1/auth/login",
            json={"usuario": USUARIO, "senha": SENHA},
            timeout=30.0
        )

        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            usuario = data.get("usuario", {})
            print(f"[LOGIN] Sucesso! Usuário: {usuario.get('nome', 'N/A')}")
            print(f"[LOGIN] Papel: {usuario.get('papel', 'N/A')}")
            return token
        else:
            print(f"[LOGIN] Erro: {response.status_code}")
            print(f"[LOGIN] Resposta: {response.text}")
            return None
    except Exception as e:
        print(f"[LOGIN] Exceção: {e}")
        return None


def verificar_pesquisas_existentes(token: str) -> dict:
    """Verifica pesquisas já existentes no banco."""
    headers = {"Authorization": f"Bearer {token}"}
    resultados = {
        "pesquisas_eleitorais": [],
        "pesquisas_podc": [],
        "entrevistas": [],
    }

    # Verificar pesquisas eleitorais
    try:
        response = httpx.get(
            f"{BACKEND_URL}/api/v1/entrevistas/",
            headers=headers,
            timeout=30.0
        )
        if response.status_code == 200:
            data = response.json()
            resultados["pesquisas_eleitorais"] = data.get("entrevistas", [])
            print(f"[DB] Pesquisas eleitorais encontradas: {len(resultados['pesquisas_eleitorais'])}")
    except Exception as e:
        print(f"[DB] Erro ao buscar pesquisas eleitorais: {e}")

    # Verificar pesquisas PODC
    try:
        response = httpx.get(
            f"{BACKEND_URL}/api/v1/pesquisas-podc/",
            headers=headers,
            timeout=30.0
        )
        if response.status_code == 200:
            data = response.json()
            resultados["pesquisas_podc"] = data.get("pesquisas", [])
            print(f"[DB] Pesquisas PODC encontradas: {len(resultados['pesquisas_podc'])}")
    except Exception as e:
        print(f"[DB] Erro ao buscar pesquisas PODC: {e}")

    return resultados


def listar_entrevistas_locais() -> list[dict]:
    """Lista entrevistas salvas localmente."""
    entrevistas = []

    # Verificar diretório de resultados
    if RESULTADOS_DIR.exists():
        for arquivo in RESULTADOS_DIR.glob("*.json"):
            try:
                with open(arquivo, "r", encoding="utf-8") as f:
                    dados = json.load(f)
                    dados["_arquivo_origem"] = str(arquivo)
                    entrevistas.append(dados)
                    print(f"[LOCAL] Encontrada: {arquivo.name}")
            except Exception as e:
                print(f"[LOCAL] Erro ao ler {arquivo}: {e}")

    return entrevistas


def importar_entrevista_eleitoral(token: str, entrevista: dict) -> bool:
    """Importa uma entrevista eleitoral para o banco."""
    headers = {"Authorization": f"Bearer {token}"}

    # Converter agente_id para string (pode vir como int do JSON)
    agente_id = str(entrevista.get("agente_id", "1"))

    # Criar pesquisa/entrevista no backend
    try:
        # Primeiro criar a entrevista
        response = httpx.post(
            f"{BACKEND_URL}/api/v1/entrevistas/",
            headers=headers,
            json={
                "titulo": f"Entrevista Eleitor {entrevista.get('agente_nome', 'N/A')}",
                "perguntas": [
                    {
                        "texto": entrevista.get("pergunta", "Pergunta não disponível"),
                        "tipo": "aberta",
                        "obrigatoria": True
                    }
                ],
                "eleitores_ids": [agente_id]
            },
            timeout=30.0,
            follow_redirects=True
        )

        if response.status_code in [200, 201]:
            data = response.json()
            entrevista_id = data.get("id")
            print(f"[IMPORT] Entrevista criada: {entrevista_id} - {entrevista.get('agente_nome')}")

            # Agora salvar a resposta da entrevista
            if entrevista_id:
                return salvar_resposta_entrevista(token, entrevista_id, entrevista, agente_id)
            return True
        else:
            print(f"[IMPORT] Erro: {response.status_code} - {response.text[:200]}")
            return False
    except Exception as e:
        print(f"[IMPORT] Exceção: {e}")
        return False


def salvar_resposta_entrevista(token: str, entrevista_id: str, entrevista: dict, eleitor_id: str) -> bool:
    """Salva a resposta de uma entrevista eleitoral."""
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = httpx.post(
            f"{BACKEND_URL}/api/v1/entrevistas/{entrevista_id}/respostas/",
            headers=headers,
            json={
                "eleitor_id": eleitor_id,
                "eleitor_nome": entrevista.get("agente_nome", "N/A"),
                "resposta_texto": entrevista.get("resposta", ""),
                "analise": entrevista.get("analise", {}),
                "data_hora": entrevista.get("data_hora")
            },
            timeout=30.0,
            follow_redirects=True
        )

        if response.status_code in [200, 201]:
            print(f"[IMPORT] Resposta salva: {entrevista.get('agente_nome')}")
            return True
        else:
            print(f"[IMPORT] Erro ao salvar resposta: {response.status_code}")
            return False
    except Exception as e:
        print(f"[IMPORT] Exceção ao salvar resposta: {e}")
        return False


def main():
    """Função principal."""
    print("=" * 60)
    print("IMPORTADOR DE ENTREVISTAS - PESQUISA ELEITORAL DF 2026")
    print("=" * 60)
    print()

    # 1. Fazer login
    token = fazer_login()
    if not token:
        print("[ERRO] Não foi possível fazer login. Verifique as credenciais.")
        sys.exit(1)

    print()

    # 2. Verificar dados existentes
    print("[INFO] Verificando dados existentes no banco...")
    dados_existentes = verificar_pesquisas_existentes(token)

    print()
    print("-" * 40)
    print("RESUMO DOS DADOS EXISTENTES:")
    print(f"  - Pesquisas eleitorais: {len(dados_existentes['pesquisas_eleitorais'])}")
    print(f"  - Pesquisas PODC: {len(dados_existentes['pesquisas_podc'])}")
    print("-" * 40)
    print()

    # 3. Listar entrevistas locais
    print("[INFO] Buscando entrevistas locais...")
    entrevistas_locais = listar_entrevistas_locais()
    print(f"[INFO] Entrevistas locais encontradas: {len(entrevistas_locais)}")

    print()

    # 4. Importar entrevistas
    if entrevistas_locais:
        print("[INFO] Importando entrevistas para o banco...")
        for entrevista in entrevistas_locais:
            importar_entrevista_eleitoral(token, entrevista)
    else:
        print("[INFO] Nenhuma entrevista local para importar.")

    print()
    print("=" * 60)
    print("IMPORTAÇÃO CONCLUÍDA")
    print("=" * 60)

    # Mostrar detalhes das pesquisas existentes
    if dados_existentes['pesquisas_podc']:
        print("\nPESQUISAS PODC NO BANCO:")
        for p in dados_existentes['pesquisas_podc'][:10]:
            print(f"  - [{p.get('status', 'N/A')}] {p.get('titulo', 'Sem título')} ({p.get('total_respostas', 0)} respostas)")

    if dados_existentes['pesquisas_eleitorais']:
        print("\nPESQUISAS ELEITORAIS NO BANCO:")
        for p in dados_existentes['pesquisas_eleitorais'][:10]:
            print(f"  - [{p.get('status', 'N/A')}] {p.get('titulo', 'Sem título')}")


if __name__ == "__main__":
    main()
