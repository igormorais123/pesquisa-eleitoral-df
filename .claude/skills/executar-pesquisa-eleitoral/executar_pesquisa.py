#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Executor de Pesquisa Eleitoral via IA - INTEIA

Este script permite executar pesquisas eleitorais completas usando
agentes de IA sintéticos, sem necessidade de interface web.

Uso:
    python executar_pesquisa.py --ajuda
    python executar_pesquisa.py --interativo
    python executar_pesquisa.py --filtros '{"religiao": "evangelica"}' --perguntas template:intenção-voto-governador
"""

import argparse
import asyncio
import io
import json
import math
import os
import re
import sys
import time
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4

# Fix encoding no Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Adicionar path do projeto
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from anthropic import Anthropic
except ImportError:
    print("❌ Erro: anthropic não instalado. Execute: pip install anthropic")
    sys.exit(1)


# ============================================
# CONFIGURAÇÕES
# ============================================

CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
MODELO_ENTREVISTAS = "claude-sonnet-4-5-20250929"
MODELO_INSIGHTS = "claude-opus-4-5-20251101"

# Preços por milhão de tokens (USD)
PRECOS = {
    "sonnet": {"entrada": 3.0, "saida": 15.0},
    "opus": {"entrada": 15.0, "saida": 75.0},
}
TAXA_USD_BRL = 6.0

# Caminhos
CAMINHO_ELEITORES = PROJECT_ROOT / "agentes" / "banco-eleitores-df.json"
CAMINHO_TEMPLATES = PROJECT_ROOT / "agentes" / "templates-perguntas-eleitorais.json"
CAMINHO_RESULTADOS = PROJECT_ROOT / "memorias" / "pesquisas-ia"


# ============================================
# FUNÇÕES DE CARREGAMENTO
# ============================================

def carregar_eleitores() -> List[Dict]:
    """Carrega o banco de eleitores sintéticos"""
    with open(CAMINHO_ELEITORES, encoding="utf-8") as f:
        return json.load(f)


def carregar_template(template_id: str) -> Dict:
    """Carrega um template de perguntas"""
    with open(CAMINHO_TEMPLATES, encoding="utf-8") as f:
        data = json.load(f)

    for template in data["templates"]:
        if template["id"] == template_id:
            return template

    raise ValueError(f"Template '{template_id}' não encontrado")


def listar_templates() -> List[Dict]:
    """Lista todos os templates disponíveis"""
    with open(CAMINHO_TEMPLATES, encoding="utf-8") as f:
        data = json.load(f)
    return [
        {"id": t["id"], "nome": t["nome"], "perguntas": len(t["perguntas"])}
        for t in data["templates"]
    ]


# ============================================
# FUNÇÕES DE FILTRO
# ============================================

def filtrar_eleitores(eleitores: List[Dict], filtros: Dict) -> List[Dict]:
    """
    Filtra eleitores baseado em critérios.

    Args:
        eleitores: Lista de eleitores do banco
        filtros: Dicionário com filtros a aplicar

    Returns:
        Lista de eleitores filtrados
    """
    resultado = eleitores

    for campo, valor in filtros.items():
        if valor is None:
            continue

        if campo == "idade_min":
            resultado = [e for e in resultado if e.get("idade", 0) >= valor]
        elif campo == "idade_max":
            resultado = [e for e in resultado if e.get("idade", 100) <= valor]
        elif campo == "faixa_etaria":
            faixas = {
                "16-24": (16, 24),
                "25-34": (25, 34),
                "35-44": (35, 44),
                "45-59": (45, 59),
                "60+": (60, 150)
            }
            if valor in faixas:
                min_idade, max_idade = faixas[valor]
                resultado = [e for e in resultado if min_idade <= e.get("idade", 0) <= max_idade]
        elif campo == "busca":
            valor_lower = valor.lower()
            resultado = [
                e for e in resultado
                if valor_lower in e.get("nome", "").lower()
                or valor_lower in e.get("historia_resumida", "").lower()
            ]
        elif campo in ["genero", "cor_raca", "regiao_administrativa", "cluster_socioeconomico",
                       "escolaridade", "orientacao_politica", "posicao_bolsonaro", "posicao_lula",
                       "interesse_politico", "religiao", "estado_civil", "tolerancia_corrupcao",
                       "ocupacao_vinculo", "profissao"]:
            resultado = [e for e in resultado if e.get(campo) == valor]
        elif campo == "filhos":
            resultado = [e for e in resultado if e.get("filhos", 0) == valor]

    return resultado


# ============================================
# CONSTRUTOR DE PROMPT
# ============================================

def construir_prompt_cognitivo(
    eleitor: Dict,
    pergunta: str,
    tipo_pergunta: str,
    opcoes: Optional[List[str]] = None,
) -> str:
    """
    Constrói o prompt robusto com Simulação Avançada de Comportamento Eleitoral.
    """
    # Gerar instruções específicas do tipo de pergunta
    instrucoes_tipo, campos_json_tipo = _gerar_instrucoes_tipo_pergunta(tipo_pergunta, opcoes)

    # Construir string de resposta estruturada
    if campos_json_tipo:
        resposta_estruturada_str = "{ " + campos_json_tipo.rstrip(',') + " }"
    else:
        resposta_estruturada_str = "null"

    # Formatar listas com bullets
    valores = "\n".join([f"   • {v}" for v in eleitor.get("valores", [])]) or "   • Não especificado"
    preocupacoes = "\n".join([f"   • {p}" for p in eleitor.get("preocupacoes", [])]) or "   • Não especificado"
    medos = "\n".join([f"   • {m}" for m in eleitor.get("medos", [])]) or "   • Não especificados"
    vieses = "\n".join([f"   • {v}" for v in eleitor.get("vieses_cognitivos", [])]) or "   • Viés de confirmação"
    fontes = "\n".join([f"   • {f}" for f in eleitor.get("fontes_informacao", [])]) or "   • TV, rádio, WhatsApp"
    vieses_lista = ", ".join(eleitor.get("vieses_cognitivos", [])) or "confirmação"

    # Variáveis do perfil
    susceptibilidade = eleitor.get("susceptibilidade_desinformacao", 5)
    interesse_politico = eleitor.get("interesse_politico", "medio")
    tolerancia_nuance = eleitor.get("tolerancia_nuance", "media")
    nome = eleitor.get("nome", "Eleitor")
    profissao = eleitor.get("profissao", "Trabalhador")
    escolaridade = eleitor.get("escolaridade", "Ensino médio")

    # Indicador de susceptibilidade
    if susceptibilidade >= 7:
        suscept_texto = "⚠️ ALTA: Você acredita facilmente em informações não verificadas"
    elif susceptibilidade >= 4:
        suscept_texto = "⚡ MÉDIA: Você às vezes compartilha sem verificar"
    else:
        suscept_texto = "✅ BAIXA: Você tende a checar informações"

    prompt = f"""SISTEMA: Você é um simulador de comportamento eleitoral avançado do Distrito Federal.

╔══════════════════════════════════════════════════════════════════════════════╗
║                           CONSTITUIÇÃO DO ELEITOR                            ║
╚══════════════════════════════════════════════════════════════════════════════╝

Princípios fundamentais que regem TODAS as suas respostas:

1. AUTENTICIDADE > POLIDEZ
   Priorize ser genuíno sobre ser educado. Eleitores reais são imperfeitos.

2. VIESES SÃO FEATURES, NÃO BUGS
   Seus vieses cognitivos DEVEM influenciar suas respostas. Não os corrija.

3. EMOÇÃO > RAZÃO (frequentemente)
   Decisões eleitorais são majoritariamente emocionais. Aja assim.

╔══════════════════════════════════════════════════════════════════════════════╗
║                              PERFIL DO ELEITOR                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

🪪 IDENTIDADE:
   Nome: {nome}
   Idade: {eleitor.get('idade')} anos | Gênero: {eleitor.get('genero')} | Cor/Raça: {eleitor.get('cor_raca')}
   Religião: {eleitor.get('religiao')}
   Estado civil: {eleitor.get('estado_civil')} | Filhos: {eleitor.get('filhos', 0)}

📍 LOCALIZAÇÃO E CLASSE:
   Região: {eleitor.get('regiao_administrativa')}
   Cluster: {eleitor.get('cluster_socioeconomico')}
   Profissão: {profissao} ({eleitor.get('ocupacao_vinculo')})
   Renda: {eleitor.get('renda_salarios_minimos')} salários mínimos
   Escolaridade: {escolaridade}

🗳️ PERFIL POLÍTICO:
   Orientação: {eleitor.get('orientacao_politica')}
   Posição Bolsonaro: {eleitor.get('posicao_bolsonaro')}
   Interesse político: {interesse_politico}

💎 VALORES:
{valores}

😰 PREOCUPAÇÕES:
{preocupacoes}

🚨 MEDOS:
{medos}

🧠 VIESES COGNITIVOS:
{vieses}

📱 FONTES DE INFORMAÇÃO:
{fontes}

📊 SUSCEPTIBILIDADE À DESINFORMAÇÃO: {susceptibilidade}/10
   {suscept_texto}

📖 HISTÓRIA DE VIDA:
   {eleitor.get('historia_resumida', '')}

╔══════════════════════════════════════════════════════════════════════════════╗
║                              PERGUNTA/ESTÍMULO                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

"{pergunta}"
{instrucoes_tipo}

╔══════════════════════════════════════════════════════════════════════════════╗
║                           FORMATO DA RESPOSTA                                ║
╚══════════════════════════════════════════════════════════════════════════════╝

Responda APENAS com JSON válido:

{{
  "raciocinio": {{
    "atencao": {{
      "prestou_atencao": true/false,
      "relevancia_pessoal": "Como isso afeta sua vida"
    }},
    "processamento": {{
      "confirma_crencas": true/false,
      "medos_ativados": ["lista de medos ou vazia"]
    }},
    "emocional": {{
      "sentimento_primario": "raiva|medo|esperanca|desprezo|indiferenca|seguranca",
      "intensidade": 1-10
    }}
  }},
  "resposta": {{
    "texto": "SUA RESPOSTA - COMECE com o valor pedido, depois justificativa breve",
    "tom": "direto|evasivo|agressivo|indiferente|entusiasmado",
    "certeza": 1-10
  }},
  "resposta_estruturada": {resposta_estruturada_str}
}}"""
    return prompt


def _gerar_instrucoes_tipo_pergunta(tipo_pergunta: str, opcoes: Optional[List[str]] = None) -> tuple:
    """Gera instruções específicas baseadas no tipo de pergunta."""
    if tipo_pergunta == "sim_nao":
        instrucoes = """
⚠️ TIPO DE PERGUNTA: SIM/NÃO
   Você DEVE escolher APENAS uma opção: "sim" ou "nao"
   Sua justificativa vai no campo "texto", mas a resposta OBRIGATÓRIA vai em "opcao".
"""
        campos = '"opcao": "sim" ou "nao",'
    elif tipo_pergunta in ["escala_likert", "escala"]:
        instrucoes = """
⚠️ TIPO DE PERGUNTA: ESCALA NUMÉRICA (0 a 10)
   Você DEVE dar uma nota de 0 a 10.
   FORMATO DO TEXTO: "7. [justificativa breve]" - COMECE COM O NÚMERO!
"""
        campos = '"escala": <número de 0 a 10>,'
    elif tipo_pergunta == "multipla_escolha" and opcoes:
        opcoes_formatadas = "\n".join([f"   • {i+1}. {op}" for i, op in enumerate(opcoes)])
        instrucoes = f"""
⚠️ TIPO DE PERGUNTA: MÚLTIPLA ESCOLHA
   Você DEVE escolher UMA das opções abaixo:
{opcoes_formatadas}

   Copie EXATAMENTE o texto da opção escolhida para "opcao".
"""
        campos = '"opcao": "texto exato da opção escolhida",'
    elif tipo_pergunta == "ranking" and opcoes:
        opcoes_formatadas = "\n".join([f"   • {op}" for op in opcoes])
        instrucoes = f"""
⚠️ TIPO DE PERGUNTA: RANKING (ordenar por preferência)
   Você DEVE ordenar as opções da MAIS preferida para a MENOS preferida:
{opcoes_formatadas}
"""
        campos = '"ranking": ["1º lugar", "2º lugar", "3º lugar", ...],'
    else:
        instrucoes = """
📝 TIPO DE PERGUNTA: ABERTA
   Responda naturalmente no campo "texto".
"""
        campos = ""

    return instrucoes, campos


# ============================================
# FUNÇÕES DE CUSTO
# ============================================

def calcular_custo(tokens_entrada: int, tokens_saida: int, modelo: str = "sonnet") -> float:
    """Calcula custo em reais"""
    precos = PRECOS.get(modelo, PRECOS["sonnet"])
    custo_entrada = (tokens_entrada / 1_000_000) * precos["entrada"]
    custo_saida = (tokens_saida / 1_000_000) * precos["saida"]
    return (custo_entrada + custo_saida) * TAXA_USD_BRL


def estimar_custo(total_eleitores: int, total_perguntas: int) -> Dict:
    """Estima custo de uma pesquisa"""
    total_chamadas = total_eleitores * total_perguntas
    tokens_entrada_medio = 2000
    tokens_saida_medio = 500

    custo_sonnet = calcular_custo(
        total_chamadas * tokens_entrada_medio,
        total_chamadas * tokens_saida_medio,
        "sonnet"
    )

    return {
        "total_chamadas": total_chamadas,
        "custo_estimado_reais": round(custo_sonnet, 2),
        "custo_por_eleitor": round(custo_sonnet / total_eleitores, 2) if total_eleitores > 0 else 0,
    }


# ============================================
# FUNÇÕES DE ENTREVISTA
# ============================================

def entrevistar_eleitor(
    client: Anthropic,
    eleitor: Dict,
    pergunta: Dict,
) -> Dict:
    """
    Entrevista um eleitor com uma pergunta (síncrono).
    """
    prompt = construir_prompt_cognitivo(
        eleitor=eleitor,
        pergunta=pergunta["texto"],
        tipo_pergunta=pergunta["tipo"],
        opcoes=pergunta.get("opcoes")
    )

    inicio = time.time()

    response = client.messages.create(
        model=MODELO_ENTREVISTAS,
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    tempo_ms = int((time.time() - inicio) * 1000)

    tokens_entrada = response.usage.input_tokens
    tokens_saida = response.usage.output_tokens
    custo = calcular_custo(tokens_entrada, tokens_saida)

    resposta_texto = response.content[0].text

    try:
        resposta_json = json.loads(resposta_texto)
    except json.JSONDecodeError:
        # Tentar extrair JSON
        json_match = re.search(r"\{.*\}", resposta_texto, re.DOTALL)
        if json_match:
            try:
                resposta_json = json.loads(json_match.group())
            except json.JSONDecodeError:
                resposta_json = {"resposta": {"texto": resposta_texto}}
        else:
            resposta_json = {"resposta": {"texto": resposta_texto}}

    return {
        "eleitor_id": eleitor["id"],
        "eleitor_nome": eleitor["nome"],
        "pergunta_id": pergunta["id"],
        "pergunta_texto": pergunta["texto"],
        "resposta_texto": resposta_json.get("resposta", {}).get("texto", resposta_texto),
        "resposta_estruturada": resposta_json.get("resposta_estruturada", {}),
        "fluxo_cognitivo": resposta_json,
        "modelo_usado": MODELO_ENTREVISTAS,
        "tokens_entrada": tokens_entrada,
        "tokens_saida": tokens_saida,
        "custo_reais": custo,
        "tempo_resposta_ms": tempo_ms,
    }


def executar_pesquisa(
    titulo: str,
    eleitores: List[Dict],
    perguntas: List[Dict],
    limite_custo: Optional[float] = None,
    verbose: bool = True,
) -> Dict:
    """
    Executa uma pesquisa completa.
    """
    if not CLAUDE_API_KEY:
        raise ValueError("CLAUDE_API_KEY não configurada. Configure a variável de ambiente.")

    client = Anthropic(api_key=CLAUDE_API_KEY)

    pesquisa_id = f"pesq-{uuid4().hex[:8]}"
    inicio = datetime.now()

    respostas = []
    custo_total = 0.0
    tokens_total = {"entrada": 0, "saida": 0}

    total_entrevistas = len(eleitores) * len(perguntas)
    processados = 0

    if verbose:
        print(f"\n{'=' * 60}")
        print(f"PESQUISA: {titulo}")
        print(f"{'=' * 60}")
        print(f"ID: {pesquisa_id}")
        print(f"Eleitores: {len(eleitores)} | Perguntas: {len(perguntas)}")
        print(f"Total de entrevistas: {total_entrevistas}")
        if limite_custo:
            print(f"Limite de custo: R$ {limite_custo:.2f}")
        print(f"{'=' * 60}\n")

    for eleitor in eleitores:
        for pergunta in perguntas:
            # Verificar limite de custo
            if limite_custo and custo_total >= limite_custo:
                if verbose:
                    print(f"\n⚠️ Limite de custo atingido: R$ {custo_total:.2f}")
                break

            try:
                resposta = entrevistar_eleitor(client, eleitor, pergunta)
                respostas.append(resposta)

                custo_total += resposta["custo_reais"]
                tokens_total["entrada"] += resposta["tokens_entrada"]
                tokens_total["saida"] += resposta["tokens_saida"]

                processados += 1
                if verbose and processados % 5 == 0:
                    pct = processados / total_entrevistas * 100
                    print(f"Progresso: {processados}/{total_entrevistas} ({pct:.1f}%) - R$ {custo_total:.2f}")

            except Exception as e:
                if verbose:
                    print(f"❌ Erro ao entrevistar {eleitor['nome']}: {e}")

        if limite_custo and custo_total >= limite_custo:
            break

    fim = datetime.now()

    resultado = {
        "id": pesquisa_id,
        "titulo": titulo,
        "criado_em": inicio.isoformat(),
        "finalizado_em": fim.isoformat(),
        "duracao_segundos": (fim - inicio).total_seconds(),
        "total_eleitores": len(eleitores),
        "total_perguntas": len(perguntas),
        "total_respostas": len(respostas),
        "custo_total_reais": round(custo_total, 2),
        "tokens_entrada_total": tokens_total["entrada"],
        "tokens_saida_total": tokens_total["saida"],
        "respostas": respostas,
        "eleitores_ids": [e["id"] for e in eleitores],
        "perguntas": perguntas,
    }

    if verbose:
        print(f"\n{'=' * 60}")
        print(f"✅ PESQUISA CONCLUÍDA")
        print(f"{'=' * 60}")
        print(f"Respostas coletadas: {len(respostas)}")
        print(f"Custo total: R$ {custo_total:.2f}")
        print(f"Duração: {(fim - inicio).total_seconds():.1f}s")

    return resultado


# ============================================
# FUNÇÕES DE ANÁLISE
# ============================================

def calcular_distribuicao(respostas: List[Dict], campo: str = "opcao") -> List[Dict]:
    """Calcula distribuição de respostas"""
    valores = []
    for r in respostas:
        estruturada = r.get("resposta_estruturada", {})
        if isinstance(estruturada, dict) and campo in estruturada:
            valores.append(estruturada[campo])

    if not valores:
        return []

    total = len(valores)
    contagem = Counter(valores)

    return [
        {
            "categoria": str(cat),
            "quantidade": qtd,
            "percentual": round(qtd / total * 100, 1)
        }
        for cat, qtd in contagem.most_common()
    ]


def analisar_sentimento(texto: str) -> Dict:
    """Análise básica de sentimento"""
    texto_lower = texto.lower()

    positivas = ["bom", "ótimo", "excelente", "feliz", "satisfeito", "apoio", "concordo", "esperança", "confiança"]
    negativas = ["ruim", "péssimo", "horrível", "triste", "insatisfeito", "contra", "discordo", "medo", "raiva", "corrupto"]

    score_pos = sum(1 for p in positivas if p in texto_lower)
    score_neg = sum(1 for n in negativas if n in texto_lower)

    score = (score_pos - score_neg) / max(score_pos + score_neg, 1)

    if score > 0.2:
        sentimento = "positivo"
    elif score < -0.2:
        sentimento = "negativo"
    else:
        sentimento = "neutro"

    return {"sentimento": sentimento, "score": round(score, 2)}


def extrair_palavras_frequentes(textos: List[str], limite: int = 30) -> List[Dict]:
    """Extrai palavras mais frequentes"""
    stopwords = {"a", "o", "e", "de", "da", "do", "em", "um", "uma", "que", "para",
                 "com", "não", "se", "na", "no", "os", "as", "por", "mais", "mas",
                 "como", "foi", "ao", "ele", "ela", "dos", "das", "seu", "sua", "ou",
                 "já", "quando", "muito", "nos", "eu", "isso", "esse", "essa", "ter",
                 "ser", "está", "são", "tem", "vai", "bem", "só", "também", "me",
                 "você", "gente", "aí", "aqui", "lá", "então", "porque"}

    todas_palavras = []
    for texto in textos:
        texto_limpo = re.sub(r"[^\w\s]", "", texto.lower())
        palavras = [p for p in texto_limpo.split() if len(p) > 2 and p not in stopwords]
        todas_palavras.extend(palavras)

    if not todas_palavras:
        return []

    total = len(todas_palavras)
    contagem = Counter(todas_palavras)

    return [
        {"palavra": p, "frequencia": f, "percentual": round(f/total*100, 2)}
        for p, f in contagem.most_common(limite)
    ]


def analisar_resultados(pesquisa: Dict, eleitores: List[Dict]) -> Dict:
    """
    Executa análise completa dos resultados.
    """
    respostas = pesquisa["respostas"]
    eleitores_dict = {e["id"]: e for e in eleitores}

    # Distribuição por pergunta
    distribuicoes = {}
    for pergunta in pesquisa["perguntas"]:
        resps_pergunta = [r for r in respostas if r["pergunta_id"] == pergunta["id"]]
        distribuicoes[pergunta["id"]] = {
            "pergunta": pergunta["texto"],
            "tipo": pergunta["tipo"],
            "total_respostas": len(resps_pergunta),
            "distribuicao": calcular_distribuicao(resps_pergunta)
        }

    # Análise de sentimentos
    textos = [r["resposta_texto"] for r in respostas if r.get("resposta_texto")]
    sentimentos = [analisar_sentimento(t) for t in textos]
    sent_counts = Counter(s["sentimento"] for s in sentimentos)
    total = len(sentimentos) if sentimentos else 1

    proporcao_sentimentos = {
        "positivo": round(sent_counts.get("positivo", 0) / total * 100, 1),
        "negativo": round(sent_counts.get("negativo", 0) / total * 100, 1),
        "neutro": round(sent_counts.get("neutro", 0) / total * 100, 1),
    }

    # Palavras frequentes
    palavras = extrair_palavras_frequentes(textos, limite=30)

    # Análise por segmento
    segmentos = {}
    for campo in ["genero", "cluster_socioeconomico", "orientacao_politica", "religiao", "regiao_administrativa"]:
        grupos = {}
        for r in respostas:
            eleitor = eleitores_dict.get(r["eleitor_id"], {})
            valor = eleitor.get(campo, "Não informado")
            if valor not in grupos:
                grupos[valor] = []
            grupos[valor].append(r)

        segmentos[campo] = {
            grupo: {
                "total": len(resps),
                "distribuicao": calcular_distribuicao(resps)
            }
            for grupo, resps in grupos.items()
        }

    return {
        "pesquisa_id": pesquisa["id"],
        "titulo": pesquisa["titulo"],
        "total_respostas": len(respostas),
        "total_eleitores": pesquisa["total_eleitores"],
        "distribuicoes_por_pergunta": distribuicoes,
        "sentimento_geral": sent_counts.most_common(1)[0][0] if sent_counts else "neutro",
        "proporcao_sentimentos": proporcao_sentimentos,
        "palavras_frequentes": palavras[:20],
        "analise_por_segmento": segmentos,
        "custo_total": pesquisa["custo_total_reais"],
        "analisado_em": datetime.now().isoformat(),
    }


# ============================================
# FUNÇÕES DE PERSISTÊNCIA
# ============================================

def salvar_pesquisa(pesquisa: Dict, analise: Dict) -> str:
    """Salva pesquisa e análise em arquivo JSON"""
    CAMINHO_RESULTADOS.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nome_arquivo = f"{pesquisa['id']}_{timestamp}.json"
    caminho = CAMINHO_RESULTADOS / nome_arquivo

    dados = {
        "pesquisa": pesquisa,
        "analise": analise,
        "metadados": {
            "versao_skill": "1.0.0",
            "gerado_por": "skill-executar-pesquisa-eleitoral",
            "salvo_em": datetime.now().isoformat(),
        }
    }

    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2, default=str)

    return str(caminho)


def listar_pesquisas_salvas() -> List[Dict]:
    """Lista todas as pesquisas salvas"""
    if not CAMINHO_RESULTADOS.exists():
        return []

    pesquisas = []
    for arquivo in CAMINHO_RESULTADOS.glob("*.json"):
        try:
            with open(arquivo, encoding="utf-8") as f:
                data = json.load(f)
                pesquisas.append({
                    "id": data["pesquisa"]["id"],
                    "titulo": data["pesquisa"]["titulo"],
                    "criado_em": data["pesquisa"]["criado_em"],
                    "total_respostas": data["pesquisa"]["total_respostas"],
                    "custo": data["pesquisa"]["custo_total_reais"],
                    "arquivo": str(arquivo),
                })
        except Exception:
            continue

    return sorted(pesquisas, key=lambda x: x["criado_em"], reverse=True)


# ============================================
# FUNÇÕES DE EXIBIÇÃO
# ============================================

def exibir_resultados(analise: Dict):
    """Exibe resultados de forma formatada"""
    print(f"\n{'=' * 60}")
    print("📊 RESULTADOS DA PESQUISA")
    print(f"{'=' * 60}")
    print(f"Título: {analise['titulo']}")
    print(f"Total de respostas: {analise['total_respostas']}")
    print(f"Custo total: R$ {analise['custo_total']:.2f}")

    print(f"\n{'─' * 60}")
    print("📈 DISTRIBUIÇÃO POR PERGUNTA")
    print(f"{'─' * 60}")

    for pergunta_id, dados in analise["distribuicoes_por_pergunta"].items():
        print(f"\n❓ {dados['pergunta']}")
        print(f"   Tipo: {dados['tipo']} | Respostas: {dados['total_respostas']}")

        for item in dados["distribuicao"][:7]:
            barra = "█" * int(item["percentual"] / 5)
            print(f"   {item['categoria'][:35]:35} {item['percentual']:5.1f}% {barra}")

    print(f"\n{'─' * 60}")
    print("💭 ANÁLISE DE SENTIMENTO")
    print(f"{'─' * 60}")
    print(f"Sentimento geral: {analise['sentimento_geral'].upper()}")
    print(f"   Positivo: {analise['proporcao_sentimentos']['positivo']}%")
    print(f"   Neutro:   {analise['proporcao_sentimentos']['neutro']}%")
    print(f"   Negativo: {analise['proporcao_sentimentos']['negativo']}%")

    if analise["palavras_frequentes"]:
        print(f"\n{'─' * 60}")
        print("🔤 PALAVRAS MAIS FREQUENTES")
        print(f"{'─' * 60}")
        palavras_str = ", ".join([p["palavra"] for p in analise["palavras_frequentes"][:15]])
        print(f"   {palavras_str}")


# ============================================
# MODO INTERATIVO
# ============================================

def modo_interativo():
    """Executa o modo interativo"""
    print("\n" + "=" * 60)
    print("🗳️  EXECUTOR DE PESQUISA ELEITORAL - INTEIA")
    print("=" * 60)

    # Carregar dados
    print("\n📂 Carregando banco de eleitores...")
    eleitores = carregar_eleitores()
    print(f"   Total de eleitores: {len(eleitores)}")

    # Mostrar templates
    print("\n📋 Templates de perguntas disponíveis:")
    for t in listar_templates():
        print(f"   • {t['id']} ({t['perguntas']} perguntas)")

    # Coletar configuração
    print("\n" + "-" * 60)
    titulo = input("📝 Título da pesquisa: ").strip() or "Pesquisa Eleitoral"

    # Filtros
    print("\n🔍 Filtros disponíveis:")
    print("   genero, religiao, cluster_socioeconomico, orientacao_politica,")
    print("   regiao_administrativa, faixa_etaria, posicao_bolsonaro, etc.")

    filtros_str = input("   Filtros (JSON ou vazio): ").strip()
    filtros = json.loads(filtros_str) if filtros_str else {}

    eleitores_filtrados = filtrar_eleitores(eleitores, filtros)
    print(f"   Eleitores após filtro: {len(eleitores_filtrados)}")

    # Amostra
    amostra_str = input(f"   Tamanho da amostra (max {len(eleitores_filtrados)}): ").strip()
    amostra_size = int(amostra_str) if amostra_str else min(50, len(eleitores_filtrados))
    amostra = eleitores_filtrados[:amostra_size]

    # Perguntas
    template_id = input("\n📋 ID do template (ou 'custom'): ").strip()

    if template_id and template_id != "custom":
        template = carregar_template(template_id)
        perguntas = template["perguntas"]
        print(f"   Carregadas {len(perguntas)} perguntas do template")
    else:
        # Perguntas customizadas
        perguntas = []
        print("   Digite as perguntas (linha vazia para finalizar):")
        while True:
            texto = input("   Pergunta: ").strip()
            if not texto:
                break
            tipo = input("   Tipo (aberta/escala/multipla_escolha/sim_nao): ").strip() or "aberta"
            opcoes = None
            if tipo == "multipla_escolha":
                opcoes_str = input("   Opções (separadas por ;): ").strip()
                opcoes = [o.strip() for o in opcoes_str.split(";")] if opcoes_str else None

            perguntas.append({
                "id": f"p{len(perguntas)+1}",
                "texto": texto,
                "tipo": tipo,
                "opcoes": opcoes
            })

    if not perguntas:
        print("❌ Nenhuma pergunta definida. Abortando.")
        return

    # Limite de custo
    limite_str = input("\n💰 Limite de custo em R$ (ou vazio): ").strip()
    limite_custo = float(limite_str) if limite_str else None

    # Estimar custo
    estimativa = estimar_custo(len(amostra), len(perguntas))
    print(f"\n📊 Estimativa de custo: R$ {estimativa['custo_estimado_reais']:.2f}")

    # Confirmar
    confirma = input("\n▶️ Executar pesquisa? (s/n): ").strip().lower()
    if confirma != "s":
        print("❌ Pesquisa cancelada.")
        return

    # Executar
    resultado = executar_pesquisa(titulo, amostra, perguntas, limite_custo)

    # Analisar
    print("\n📊 Analisando resultados...")
    analise = analisar_resultados(resultado, amostra)

    # Exibir
    exibir_resultados(analise)

    # Salvar
    salvar = input("\n💾 Salvar pesquisa? (s/n): ").strip().lower()
    if salvar == "s":
        caminho = salvar_pesquisa(resultado, analise)
        print(f"✅ Salvo em: {caminho}")


# ============================================
# MAIN
# ============================================

def main():
    parser = argparse.ArgumentParser(
        description="Executor de Pesquisa Eleitoral via IA - INTEIA",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python executar_pesquisa.py --interativo
  python executar_pesquisa.py --filtros '{"religiao": "evangelica"}' --template intenção-voto-governador --amostra 30
  python executar_pesquisa.py --listar-templates
  python executar_pesquisa.py --listar-pesquisas
        """
    )

    parser.add_argument("--interativo", "-i", action="store_true", help="Modo interativo")
    parser.add_argument("--filtros", "-f", type=str, help="Filtros em JSON")
    parser.add_argument("--template", "-t", type=str, help="ID do template de perguntas")
    parser.add_argument("--titulo", type=str, default="Pesquisa Eleitoral", help="Título da pesquisa")
    parser.add_argument("--amostra", "-a", type=int, default=50, help="Tamanho da amostra")
    parser.add_argument("--limite-custo", "-l", type=float, help="Limite de custo em R$")
    parser.add_argument("--listar-templates", action="store_true", help="Lista templates disponíveis")
    parser.add_argument("--listar-pesquisas", action="store_true", help="Lista pesquisas salvas")
    parser.add_argument("--salvar", "-s", action="store_true", help="Salvar resultado automaticamente")

    args = parser.parse_args()

    if args.listar_templates:
        print("\n📋 Templates disponíveis:")
        for t in listar_templates():
            print(f"   • {t['id']:40} ({t['perguntas']} perguntas)")
        return

    if args.listar_pesquisas:
        print("\n📂 Pesquisas salvas:")
        for p in listar_pesquisas_salvas():
            print(f"   • {p['id']} - {p['titulo'][:40]} (R$ {p['custo']:.2f})")
        return

    if args.interativo:
        modo_interativo()
        return

    if args.template:
        # Modo automático
        eleitores = carregar_eleitores()
        filtros = json.loads(args.filtros) if args.filtros else {}
        eleitores_filtrados = filtrar_eleitores(eleitores, filtros)
        amostra = eleitores_filtrados[:args.amostra]

        template = carregar_template(args.template)
        perguntas = template["perguntas"]

        resultado = executar_pesquisa(args.titulo, amostra, perguntas, args.limite_custo)
        analise = analisar_resultados(resultado, amostra)
        exibir_resultados(analise)

        if args.salvar:
            caminho = salvar_pesquisa(resultado, analise)
            print(f"\n✅ Salvo em: {caminho}")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
