# -*- coding: utf-8 -*-
"""
INTEIA - Sincronizador de Entrevistas para o Sistema

Converte entrevistas geradas pelo script de pesquisa para o formato
do sistema e insere diretamente no banco de dados PostgreSQL.

As entrevistas ficarão disponíveis em:
- https://app.inteia.com.br/entrevistas
- https://app.inteia.com.br/resultados
"""

import json
import sys
import io
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional
from collections import Counter

# Fix encoding para Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import requests

# Configurações
API_BASE_URL = "https://pesquisa-eleitoral-df-1.onrender.com"
API_V1 = f"{API_BASE_URL}/api/v1"

# Credenciais de admin (INTEIA Admin)
ADMIN_USERNAME = "admin@inteia.com.br"
ADMIN_PASSWORD = "inteia2026"

# Questionario completo para referencia
QUESTIONARIO = {
    "titulo": "Pesquisa Eleitoral Governador DF 2026",
    "perguntas": [
        {"id": "P01", "texto": "Qual sua idade?", "tipo": "numerica"},
        {"id": "P02", "texto": "Qual seu genero?", "tipo": "categorica",
         "opcoes": ["Masculino", "Feminino", "Outro/Prefiro nao dizer"]},
        {"id": "P03", "texto": "Qual sua escolaridade?", "tipo": "categorica"},
        {"id": "P04", "texto": "Qual sua renda familiar mensal?", "tipo": "categorica"},
        {"id": "P05", "texto": "Qual sua religiao?", "tipo": "categorica"},
        {"id": "P06", "texto": "Qual sua cor/raca?", "tipo": "categorica"},
        {"id": "P07", "texto": "Em qual Regiao Administrativa voce mora?", "tipo": "categorica"},
        {"id": "P08", "texto": "Qual seu estado civil?", "tipo": "categorica"},
        {"id": "P09", "texto": "Como voce avalia o governo do Governador Ibaneis Rocha?", "tipo": "escala",
         "opcoes": ["Otimo", "Bom", "Regular", "Ruim", "Pessimo", "NS/NR"]},
        {"id": "P10", "texto": "Como voce avalia a gestao da Vice-Governadora Celina Leao?", "tipo": "escala",
         "opcoes": ["Otimo", "Bom", "Regular", "Ruim", "Pessimo", "NS/NR", "Nao conheco"]},
        {"id": "P11", "texto": "Em comparacao com 4 anos atras, voce acha que o DF esta melhor, igual ou pior?", "tipo": "comparativa",
         "opcoes": ["Muito melhor", "Um pouco melhor", "Igual", "Um pouco pior", "Muito pior", "NS/NR"]},
        {"id": "P12", "texto": "Qual o principal problema do Distrito Federal hoje?", "tipo": "espontanea"},
        {"id": "P13", "texto": "Qual area deveria ser prioridade do proximo governador?", "tipo": "categorica",
         "opcoes": ["Saude", "Seguranca", "Educacao", "Transporte", "Emprego", "Moradia", "Outra"]},
        {"id": "P14", "texto": "O quanto voce confia que o proximo governo vai resolver os problemas do DF?", "tipo": "escala",
         "opcoes": ["Confia muito", "Confia um pouco", "Nem confia nem desconfia", "Desconfia um pouco", "Desconfia muito", "NS/NR"]},
        {"id": "P15", "texto": "Se a eleicao para Governador do DF fosse hoje, em quem voce votaria? (espontanea)", "tipo": "espontanea_voto"},
        {"id": "P16", "texto": "E se esse candidato nao pudesse concorrer, em quem voce votaria?", "tipo": "espontanea_voto"},
        {"id": "P17", "texto": "Se a eleicao fosse hoje e os candidatos fossem estes, em quem voce votaria?", "tipo": "estimulada_voto",
         "opcoes": ["Celina Leao (PP)", "Damares Alves (Republicanos)", "Bia Kicis (PL)", "Leandro Grass (PV)",
                  "Paulo Octavio (PSD)", "Izalci Lucas (PL)", "Branco/Nulo", "Indeciso", "NS/NR"]},
        {"id": "P18", "texto": "E em segundo turno, em quem voce votaria?", "tipo": "segundo_turno"},
        {"id": "P19", "texto": "Em um segundo turno entre Celina Leao e Damares Alves, em quem voce votaria?", "tipo": "segundo_turno",
         "opcoes": ["Celina Leao", "Damares Alves", "Branco/Nulo", "NS/NR"]},
        {"id": "P20", "texto": "Em um segundo turno entre Celina Leao e Bia Kicis, em quem voce votaria?", "tipo": "segundo_turno",
         "opcoes": ["Celina Leao", "Bia Kicis", "Branco/Nulo", "NS/NR"]},
        {"id": "P21", "texto": "Em um segundo turno entre Celina Leao e Leandro Grass, em quem voce votaria?", "tipo": "segundo_turno",
         "opcoes": ["Celina Leao", "Leandro Grass", "Branco/Nulo", "NS/NR"]},
        {"id": "P22", "texto": "Em qual destes candidatos voce NAO votaria de jeito nenhum?", "tipo": "rejeicao_multipla",
         "opcoes": ["Celina Leao", "Damares Alves", "Bia Kicis", "Leandro Grass", "Paulo Octavio", "Izalci Lucas", "Nenhum", "NS/NR"]},
        {"id": "P23", "texto": "Por que voce nao votaria nesse(s) candidato(s)?", "tipo": "espontanea"},
        {"id": "P24", "texto": "Quais destes candidatos voce conhece, mesmo que so de nome?", "tipo": "conhecimento_multiplo",
         "opcoes": ["Celina Leao", "Damares Alves", "Bia Kicis", "Leandro Grass", "Paulo Octavio", "Izalci Lucas"]},
        {"id": "P25", "texto": "Como voce avalia cada candidato que conhece?", "tipo": "avaliacao_candidatos"},
        {"id": "P26", "texto": "Numa escala de 0 a 10, o quanto voce tem certeza do seu voto?", "tipo": "escala_numerica"},
        {"id": "P27", "texto": "Voce ja conversou com alguem sobre as eleicoes de 2026?", "tipo": "binaria", "opcoes": ["Sim", "Nao"]},
        {"id": "P28", "texto": "Voce pretende acompanhar debates e propagandas eleitorais?", "tipo": "escala",
         "opcoes": ["Com certeza", "Provavelmente", "Talvez", "Provavelmente nao", "Com certeza nao"]},
        {"id": "P29", "texto": "O que mais pode fazer voce mudar de voto ate a eleicao?", "tipo": "espontanea"},
        {"id": "P30", "texto": "Em uma escala de 0 (esquerda) a 10 (direita), onde voce se posiciona?", "tipo": "escala_numerica"},
        {"id": "P31", "texto": "Como voce avalia o governo do presidente Lula?", "tipo": "escala",
         "opcoes": ["Otimo", "Bom", "Regular", "Ruim", "Pessimo", "NS/NR"]},
        {"id": "P32", "texto": "Voce conhece Celina Leao?", "tipo": "conhecimento",
         "opcoes": ["Conheco bem", "Conheco um pouco", "So de nome", "Nao conheco"]},
        {"id": "P33", "texto": "Voce acha que Celina Leao esta preparada para ser governadora?", "tipo": "escala",
         "opcoes": ["Muito preparada", "Preparada", "Nem preparada nem despreparada", "Despreparada", "Muito despreparada", "NS/NR"]},
        {"id": "P34", "texto": "Qual a principal qualidade de Celina Leao?", "tipo": "espontanea"},
        {"id": "P35", "texto": "O fato de Celina Leao ser mulher influencia seu voto?", "tipo": "escala",
         "opcoes": ["Influencia positivamente", "Nao influencia", "Influencia negativamente", "NS/NR"]},
        {"id": "P36", "texto": "Deixe um comentario final sobre as eleicoes 2026", "tipo": "aberta"}
    ]
}


def carregar_env():
    """Carrega variaveis do .env"""
    env_path = Path("C:/Agentes/.env")
    if env_path.exists():
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ.setdefault(key.strip(), value.strip())


def fazer_login() -> Optional[str]:
    """
    Faz login na API e retorna o token JWT.
    Usa credenciais do admin de teste.
    """
    try:
        response = requests.post(
            f"{API_V1}/auth/login",
            json={"usuario": ADMIN_USERNAME, "senha": ADMIN_PASSWORD},
            headers={"Content-Type": "application/json"},
            timeout=90
        )

        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print(f"[OK] Login realizado com sucesso")
            return token
        else:
            print(f"[ERRO] Falha no login: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        print(f"[ERRO] Exceção no login: {e}")
        return None


def carregar_entrevistas(caminho: Path) -> List[Dict]:
    """Carrega entrevistas do arquivo JSON"""
    with open(caminho, 'r', encoding='utf-8') as f:
        return json.load(f)


def carregar_resultados(caminho: Path) -> Dict:
    """Carrega resultados agregados do arquivo JSON"""
    with open(caminho, 'r', encoding='utf-8') as f:
        return json.load(f)


def carregar_validacao(caminho: Path) -> Optional[Dict]:
    """Carrega validacao estatistica se existir"""
    if caminho.exists():
        with open(caminho, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None


def converter_para_formato_sistema(
    entrevistas: List[Dict],
    resultados: Dict,
    validacao: Optional[Dict],
    sessao_id: str,
    entrevista_id: str,
    titulo: str
) -> Dict:
    """
    Converte dados da pesquisa para formato SessaoCreate do sistema.

    Formato esperado:
    - perguntas: List[Dict] com id, texto, tipo, opcoes
    - respostas: List[Dict] no formato RespostaEleitorSchema
    - resultado: Dict com agregacoes
    - estatisticas: Dict com metricas
    """

    # Converter perguntas para formato do sistema
    perguntas_sistema = []
    for p in QUESTIONARIO["perguntas"]:
        pergunta = {
            "id": p["id"],
            "texto": p["texto"],
            "tipo": p["tipo"],
            "obrigatoria": True
        }
        if "opcoes" in p:
            pergunta["opcoes"] = p["opcoes"]
        perguntas_sistema.append(pergunta)

    # Converter respostas para formato RespostaEleitorSchema
    respostas_sistema = []
    for ent in entrevistas:
        # Converter respostas individuais para lista
        respostas_lista = []
        for pid, valor in ent["respostas"].items():
            respostas_lista.append({
                "pergunta_id": pid,
                "valor": valor if not isinstance(valor, (list, dict)) else json.dumps(valor, ensure_ascii=False),
                "tipo": next((p["tipo"] for p in QUESTIONARIO["perguntas"] if p["id"] == pid), "texto")
            })

        resposta_eleitor = {
            "eleitor_id": ent["eleitor_id"],
            "eleitor_nome": ent["nome"],
            "respostas": respostas_lista,
            "tokens_usados": 0,  # Sem uso real da API nesta versao
            "custo": 0.0,
            "tempo_resposta_ms": 0
        }
        respostas_sistema.append(resposta_eleitor)

    # Construir resultado agregado
    resultado = {
        "titulo": resultados.get("titulo", titulo),
        "data_execucao": resultados.get("data_execucao", datetime.now().isoformat()),
        "total_entrevistas": len(entrevistas),
        "metodologia": resultados.get("metodologia", {}),
        "intencao_voto_estimulada": resultados.get("intencao_voto_estimulada", {}),
        "intencao_voto_espontanea": resultados.get("intencao_voto_espontanea", {}),
        "cenarios_segundo_turno": resultados.get("cenarios_segundo_turno", {}),
        "rejeicao": resultados.get("rejeicao", {}),
        "avaliacao_governo": resultados.get("avaliacao_governo", {}),
        "conhecimento_celina": resultados.get("conhecimento_celina", {}),
        "perfil_amostra": resultados.get("perfil_amostra", {})
    }

    # Construir estatisticas
    estatisticas = {
        "total_eleitores": len(entrevistas),
        "margem_erro": resultados.get("metodologia", {}).get("margem_erro_percentual", 5.7),
        "nivel_confianca": resultados.get("metodologia", {}).get("nivel_confianca", 95),
        "distribuicao_regional": calcular_distribuicao(entrevistas, "regiao"),
        "distribuicao_genero": calcular_distribuicao(entrevistas, "genero"),
        "distribuicao_idade": calcular_distribuicao_idade(entrevistas)
    }

    # Adicionar validacao estatistica se disponivel
    if validacao:
        estatisticas["validacao_estatistica"] = {
            "conformidade_geral": validacao.get("resumo", {}).get("conformidade_geral", 0),
            "testes_aprovados": validacao.get("resumo", {}).get("aprovados", 0),
            "testes_totais": validacao.get("resumo", {}).get("total_variaveis", 0),
            "detalhes": validacao.get("detalhes_variaveis", [])
        }

    # Montar sessao completa no formato SessaoCreate
    agora = datetime.now().isoformat()

    sessao = {
        "id": sessao_id,
        "entrevistaId": entrevista_id,
        "titulo": titulo,
        "status": "concluida",
        "progresso": 100,
        "totalAgentes": len(entrevistas),
        "custoAtual": 0.0,
        "tokensInput": 0,
        "tokensOutput": 0,
        "perguntas": perguntas_sistema,
        "respostas": respostas_sistema,
        "resultado": resultado,
        "estatisticas": estatisticas,
        "modeloUsado": "simulacao-local",
        "configuracoes": {
            "tipo_pesquisa": "intencao_voto",
            "candidato_foco": "Celina Leao",
            "total_perguntas": len(QUESTIONARIO["perguntas"]),
            "origem": "script_executar_pesquisa_inteia"
        },
        "iniciadaEm": agora,
        "atualizadaEm": agora,
        "finalizadaEm": agora
    }

    return sessao


def calcular_distribuicao(entrevistas: List[Dict], campo: str) -> Dict[str, int]:
    """Calcula distribuicao de um campo nas entrevistas"""
    contador = Counter()
    for ent in entrevistas:
        valor = ent.get("perfil", {}).get(campo, "Nao informado")
        contador[valor] += 1
    return dict(contador)


def calcular_distribuicao_idade(entrevistas: List[Dict]) -> Dict[str, int]:
    """Calcula distribuicao por faixas etarias"""
    faixas = {"16-24": 0, "25-34": 0, "35-44": 0, "45-59": 0, "60+": 0}
    for ent in entrevistas:
        idade = ent.get("perfil", {}).get("idade", 0)
        if idade < 25:
            faixas["16-24"] += 1
        elif idade < 35:
            faixas["25-34"] += 1
        elif idade < 45:
            faixas["35-44"] += 1
        elif idade < 60:
            faixas["45-59"] += 1
        else:
            faixas["60+"] += 1
    return faixas


def sincronizar_com_api(sessao: Dict, token: str) -> bool:
    """
    Envia sessão para a API de sincronização.

    Endpoint: POST /api/v1/sessoes/sincronizar
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    payload = {
        "sessoes": [sessao]
    }

    try:
        print(f"\n[INFO] Enviando sessão '{sessao['titulo']}' para API...")
        print(f"[INFO] Total de respostas: {len(sessao['respostas'])}")

        response = requests.post(
            f"{API_V1}/sessoes/sincronizar",
            json=payload,
            headers=headers,
            timeout=300  # 5 minutos para dados grandes
        )

        if response.status_code in [200, 201]:
            data = response.json()
            print(f"[OK] Sincronização concluída!")
            print(f"     - Sessões sincronizadas: {data.get('sincronizadas', 0)}")
            print(f"     - Erros: {len(data.get('erros', []))}")
            if data.get('erros'):
                for erro in data['erros']:
                    print(f"       [!] {erro}")
            return True
        else:
            print(f"[ERRO] Falha na sincronização: {response.status_code}")
            print(f"       {response.text[:500]}")
            return False

    except Exception as e:
        print(f"[ERRO] Exceção na sincronização: {e}")
        import traceback
        traceback.print_exc()
        return False


def encontrar_arquivos_mais_recentes() -> tuple:
    """Encontra os arquivos de entrevistas e resultados mais recentes"""
    base_path = Path("C:/Agentes/frontend/public/resultados-intencao-voto")

    # Procurar arquivos de entrevistas raw
    entrevistas_files = list(base_path.glob("entrevistas_raw_*.json"))
    resultados_files = list(base_path.glob("pesquisa_governador_2026_*.json"))

    if not entrevistas_files:
        raise FileNotFoundError("Nenhum arquivo de entrevistas encontrado")
    if not resultados_files:
        raise FileNotFoundError("Nenhum arquivo de resultados encontrado")

    # Ordenar por data de modificacao (mais recente primeiro)
    entrevistas_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
    resultados_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)

    entrevistas_path = entrevistas_files[0]
    resultados_path = resultados_files[0]
    validacao_path = base_path / "validacao_estatistica.json"

    return entrevistas_path, resultados_path, validacao_path


def main():
    """Funcao principal de sincronizacao"""
    print("=" * 70)
    print("INTEIA - Sincronizador de Entrevistas")
    print("=" * 70)
    print()

    # 1. Encontrar arquivos
    print("[PASSO 1] Localizando arquivos de entrevistas...")
    try:
        entrevistas_path, resultados_path, validacao_path = encontrar_arquivos_mais_recentes()
        print(f"   Entrevistas: {entrevistas_path.name}")
        print(f"   Resultados:  {resultados_path.name}")
        print(f"   Validacao:   {'Encontrada' if validacao_path.exists() else 'Nao encontrada'}")
    except FileNotFoundError as e:
        print(f"[ERRO] {e}")
        return

    # 2. Carregar dados
    print("\n[PASSO 2] Carregando dados...")
    entrevistas = carregar_entrevistas(entrevistas_path)
    resultados = carregar_resultados(resultados_path)
    validacao = carregar_validacao(validacao_path)
    print(f"   Total de entrevistas: {len(entrevistas)}")

    # 3. Fazer login na API
    print("\n[PASSO 3] Autenticando na API...")
    token = fazer_login()
    if not token:
        print("[ERRO] Não foi possível autenticar na API.")
        return

    # 4. Converter para formato do sistema
    print("\n[PASSO 4] Convertendo dados para formato do sistema...")

    # Extrair timestamp do nome do arquivo para ID unico
    timestamp = entrevistas_path.stem.split("_")[-1]  # ex: 20260126_192100
    sessao_id = f"pesq-gov-df-2026-{timestamp}"
    entrevista_id = f"entrev-gov-df-2026-{timestamp}"
    titulo = f"Pesquisa Governador DF 2026 - {datetime.now().strftime('%d/%m/%Y %H:%M')}"

    sessao = converter_para_formato_sistema(
        entrevistas=entrevistas,
        resultados=resultados,
        validacao=validacao,
        sessao_id=sessao_id,
        entrevista_id=entrevista_id,
        titulo=titulo
    )
    print(f"   Sessão ID: {sessao_id}")
    print(f"   Titulo: {titulo}")

    # 5. Sincronizar com API
    print("\n[PASSO 5] Sincronizando com a API...")
    sucesso = sincronizar_com_api(sessao, token)

    # 7. Resumo final
    print("\n" + "=" * 70)
    if sucesso:
        print("SINCRONIZACAO CONCLUIDA COM SUCESSO!")
        print()
        print("As entrevistas agora estao disponiveis em:")
        print("  - https://app.inteia.com.br/entrevistas")
        print("  - https://app.inteia.com.br/resultados")
    else:
        print("SINCRONIZACAO FALHOU")
        print("Verifique os logs acima para mais detalhes.")
    print("=" * 70)


if __name__ == "__main__":
    main()
