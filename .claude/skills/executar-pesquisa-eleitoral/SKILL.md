# SKILL: Executar Pesquisa Eleitoral via IA

> **Propósito**: Permitir que agentes de IA executem pesquisas eleitorais completas internamente, selecionando eleitores, fazendo perguntas, coletando respostas e analisando resultados - espelhando fielmente o sistema web.

---

## QUANDO USAR ESTA SKILL

- Quando o usuário pedir uma pesquisa eleitoral sem usar o site
- Quando precisar testar hipóteses eleitorais rapidamente
- Quando quiser analisar segmentos específicos de eleitores
- Quando precisar de análises quantitativas e qualitativas automatizadas
- Quando o usuário pedir "pesquisa sobre X para público Y"

---

## VISÃO GERAL DO FLUXO

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE PESQUISA ELEITORAL                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CONFIGURAÇÃO                                                │
│     ├── Definir título e descrição                              │
│     ├── Selecionar tipo (quantitativa/qualitativa/mista)        │
│     └── Definir limite de custo (opcional)                      │
│                                                                 │
│  2. SELEÇÃO DE ELEITORES                                        │
│     ├── Carregar banco: agentes/banco-eleitores-df.json         │
│     └── Aplicar filtros (20+ disponíveis)                       │
│                                                                 │
│  3. CRIAÇÃO DE PERGUNTAS                                        │
│     ├── Usar templates ou criar customizadas                    │
│     └── Tipos: sim_nao, escala, multipla_escolha, aberta, etc.  │
│                                                                 │
│  4. EXECUÇÃO (Claude API)                                       │
│     ├── Para cada eleitor × pergunta:                           │
│     │   ├── Construir prompt cognitivo (4 etapas)               │
│     │   ├── Chamar Claude Sonnet 4.5                            │
│     │   └── Registrar resposta estruturada                      │
│     └── Calcular custos e tokens                                │
│                                                                 │
│  5. ANÁLISE DE RESULTADOS                                       │
│     ├── Estatísticas descritivas                                │
│     ├── Distribuições por categoria                             │
│     ├── Análise de sentimentos                                  │
│     ├── Correlações                                             │
│     ├── Votos silenciosos                                       │
│     ├── Pontos de ruptura                                       │
│     └── Insights automáticos                                    │
│                                                                 │
│  6. PERSISTÊNCIA                                                │
│     ├── Salvar em memorias/pesquisas-ia/                        │
│     └── Formato JSON estruturado                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## PASSO 1: CONFIGURAÇÃO DA PESQUISA

### Estrutura de Configuração

```python
configuracao_pesquisa = {
    "titulo": "Pesquisa Intenção de Voto Governador DF 2026",
    "descricao": "Análise de intenção de voto no primeiro turno",
    "tipo": "mista",  # quantitativa | qualitativa | mista
    "limite_custo_reais": 50.0,  # Opcional - para pesquisa sem limite
    "usar_modelo_opus": False,  # True apenas para análises complexas
    "batch_size": 10,  # Eleitores processados por lote
}
```

### Tipos de Pesquisa

| Tipo | Descrição | Perguntas Típicas |
|------|-----------|-------------------|
| **quantitativa** | Respostas estruturadas, estatísticas | Escala, múltipla escolha, sim/não |
| **qualitativa** | Respostas abertas, análise de conteúdo | Perguntas abertas, ranking |
| **mista** | Combina ambos | Todas |

---

## PASSO 2: SELEÇÃO DE ELEITORES

### Carregar Banco de Eleitores

```python
import json
from pathlib import Path

def carregar_eleitores():
    """Carrega o banco de eleitores sintéticos"""
    caminho = Path("agentes/banco-eleitores-df.json")
    with open(caminho, encoding="utf-8") as f:
        return json.load(f)

eleitores = carregar_eleitores()
print(f"Total de eleitores disponíveis: {len(eleitores)}")
```

### Filtros Disponíveis (20+)

| Filtro | Tipo | Valores Possíveis |
|--------|------|-------------------|
| **genero** | enum | masculino, feminino |
| **faixa_etaria** | range | 16-24, 25-34, 35-44, 45-59, 60+ |
| **idade_min** | int | 16-100 |
| **idade_max** | int | 16-100 |
| **cor_raca** | enum | branco, pardo, preto, amarelo, indigena |
| **regiao_administrativa** | enum | 31 RAs do DF |
| **cluster_socioeconomico** | enum | G1_alta, G2_media_alta, G3_media_baixa, G4_baixa |
| **escolaridade** | enum | fundamental_incompleto até pos_graduacao |
| **profissao** | texto | Qualquer profissão |
| **renda_salarios_minimos** | enum | ate_1, 1-2, 2-3, 3-5, 5-7, 7-10, 10-15, 15+ |
| **orientacao_politica** | enum | esquerda, centro-esquerda, centro, centro-direita, direita |
| **posicao_bolsonaro** | enum | apoiador_forte, apoiador_moderado, neutro, critico_moderado, critico_forte |
| **posicao_lula** | enum | (idem) |
| **interesse_politico** | enum | muito_alto, alto, medio, baixo, nenhum |
| **religiao** | enum | catolica, evangelica, espirita, sem_religiao, outra |
| **estado_civil** | enum | solteiro, casado, divorciado, viuvo, uniao_estavel |
| **filhos** | int | 0-10 |
| **susceptibilidade_desinformacao** | range | 0-10 |
| **tolerancia_corrupcao** | enum | zero, baixa, media, alta |
| **busca** | texto | Busca em nome, história |

### Função de Filtro

```python
def filtrar_eleitores(eleitores: list, filtros: dict) -> list:
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
                       "interesse_politico", "religiao", "estado_civil", "tolerancia_corrupcao"]:
            resultado = [e for e in resultado if e.get(campo) == valor]
        elif campo == "filhos":
            resultado = [e for e in resultado if e.get("filhos", 0) == valor]

    return resultado
```

### Exemplos de Seleção

```python
# Exemplo 1: Mulheres evangélicas de baixa renda
filtros = {
    "genero": "feminino",
    "religiao": "evangelica",
    "cluster_socioeconomico": "G4_baixa"
}
eleitores_selecionados = filtrar_eleitores(eleitores, filtros)

# Exemplo 2: Jovens de Ceilândia, centro-esquerda
filtros = {
    "faixa_etaria": "16-24",
    "regiao_administrativa": "Ceilândia",
    "orientacao_politica": "centro-esquerda"
}
eleitores_selecionados = filtrar_eleitores(eleitores, filtros)

# Exemplo 3: Apoiadores de Bolsonaro com alta escolaridade
filtros = {
    "posicao_bolsonaro": "apoiador_forte",
    "escolaridade": "superior_completo"
}
eleitores_selecionados = filtrar_eleitores(eleitores, filtros)
```

---

## PASSO 3: CRIAÇÃO DE PERGUNTAS

### Tipos de Perguntas

| Tipo | Formato Resposta | Exemplo |
|------|------------------|---------|
| **sim_nao** | "sim" ou "nao" | "Você votaria em branco?" |
| **escala** | 0-10 | "Avalie o governo de 0 a 10" |
| **multipla_escolha** | Opção exata | "Em quem você votaria?" |
| **ranking** | Lista ordenada | "Ordene por prioridade" |
| **aberta** | Texto livre | "O que espera do próximo governador?" |
| **intencao_voto** | Nome candidato | "Em quem pretende votar?" |

### Estrutura de Pergunta

```python
pergunta = {
    "id": "p1",
    "texto": "Em quem você votaria para Governador do DF?",
    "tipo": "multipla_escolha",
    "obrigatoria": True,
    "opcoes": [
        "Celina Leão (PP)",
        "Flávia Arruda (PL)",
        "Leandro Grass (PV)",
        "Candidato PT",
        "Indeciso",
        "Branco/Nulo"
    ],
    "instrucoes_ia": "Responda como o eleitor genuinamente votaria"
}
```

### Templates Disponíveis

Os templates estão em `agentes/templates-perguntas-eleitorais.json`:

| Template | Perguntas | Uso |
|----------|-----------|-----|
| `intenção-voto-governador` | 4 | Medir intenção de voto |
| `rejeicao-candidatos` | 3 | Medir rejeição |
| `avaliacao-governo-atual` | 5 | Avaliar gestão |
| `temas-prioritarios` | 5 | Identificar prioridades |
| `segundo-turno` | 4 | Simular 2º turno |

### Carregar Template

```python
def carregar_template(template_id: str) -> dict:
    """Carrega um template de perguntas"""
    caminho = Path("agentes/templates-perguntas-eleitorais.json")
    with open(caminho, encoding="utf-8") as f:
        data = json.load(f)

    for template in data["templates"]:
        if template["id"] == template_id:
            return template

    raise ValueError(f"Template '{template_id}' não encontrado")

# Usar template
template = carregar_template("intenção-voto-governador")
perguntas = template["perguntas"]
```

---

## PASSO 4: EXECUÇÃO DA PESQUISA

### Modelo Cognitivo de 4 Etapas

Cada resposta passa por 4 etapas cognitivas:

```
┌─────────────────────────────────────────────────────────────┐
│                    4 ETAPAS COGNITIVAS                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. FILTRO DE ATENÇÃO                                       │
│     "Eu, com minha rotina, prestaria atenção nisso?"        │
│     - Avalia relevância pessoal                             │
│     - Considera interesse político do eleitor               │
│                                                             │
│  2. PROCESSAMENTO ENVIESADO                                 │
│     "Isso confirma ou ameaça minhas crenças?"               │
│     - Aplica vieses cognitivos do perfil                    │
│     - Verifica medos ativados                               │
│                                                             │
│  3. REAÇÃO EMOCIONAL PRIMÁRIA                               │
│     "Qual minha reação visceral?"                           │
│     - Sentimento: raiva, medo, esperança, etc.              │
│     - Intensidade: 1-10                                     │
│                                                             │
│  4. FORMULAÇÃO DA RESPOSTA                                  │
│     "Como expressaria isso dado meu perfil?"                │
│     - Considera escolaridade, classe, região                │
│     - Tom: direto, evasivo, agressivo, etc.                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Função Principal de Entrevista

```python
import os
from anthropic import Anthropic

# Configuração
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
MODELO_ENTREVISTAS = "claude-sonnet-4-5-20250929"

# Preços por milhão de tokens (USD)
PRECOS = {
    "entrada": 3.0,
    "saida": 15.0
}
TAXA_USD_BRL = 6.0

def calcular_custo(tokens_entrada: int, tokens_saida: int) -> float:
    """Calcula custo em reais"""
    custo_entrada = (tokens_entrada / 1_000_000) * PRECOS["entrada"]
    custo_saida = (tokens_saida / 1_000_000) * PRECOS["saida"]
    return (custo_entrada + custo_saida) * TAXA_USD_BRL

async def entrevistar_eleitor(
    client: Anthropic,
    eleitor: dict,
    pergunta: dict,
) -> dict:
    """
    Entrevista um eleitor com uma pergunta.

    Args:
        client: Cliente Anthropic
        eleitor: Dados do eleitor (60+ campos)
        pergunta: Estrutura da pergunta

    Returns:
        Resposta estruturada com fluxo cognitivo
    """
    import time

    # Construir prompt (simplificado - ver construir_prompt_cognitivo completo)
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

    # Extrair dados
    tokens_entrada = response.usage.input_tokens
    tokens_saida = response.usage.output_tokens
    custo = calcular_custo(tokens_entrada, tokens_saida)

    # Parsear resposta JSON
    resposta_texto = response.content[0].text
    try:
        resposta_json = json.loads(resposta_texto)
    except json.JSONDecodeError:
        # Fallback
        resposta_json = {"resposta": {"texto": resposta_texto}}

    return {
        "eleitor_id": eleitor["id"],
        "eleitor_nome": eleitor["nome"],
        "pergunta_id": pergunta["id"],
        "resposta_texto": resposta_json.get("resposta", {}).get("texto", resposta_texto),
        "resposta_estruturada": resposta_json.get("resposta_estruturada", {}),
        "fluxo_cognitivo": resposta_json,
        "modelo_usado": MODELO_ENTREVISTAS,
        "tokens_entrada": tokens_entrada,
        "tokens_saida": tokens_saida,
        "custo_reais": custo,
        "tempo_resposta_ms": tempo_ms,
    }
```

### Executar Pesquisa Completa

```python
import asyncio
from datetime import datetime
from uuid import uuid4

async def executar_pesquisa(
    titulo: str,
    eleitores: list,
    perguntas: list,
    limite_custo: float = None,
) -> dict:
    """
    Executa uma pesquisa completa.

    Args:
        titulo: Título da pesquisa
        eleitores: Lista de eleitores selecionados
        perguntas: Lista de perguntas
        limite_custo: Limite de custo em reais (opcional)

    Returns:
        Resultado completo da pesquisa
    """
    client = Anthropic(api_key=CLAUDE_API_KEY)

    pesquisa_id = f"pesq-{uuid4().hex[:8]}"
    inicio = datetime.now()

    respostas = []
    custo_total = 0.0
    tokens_total = {"entrada": 0, "saida": 0}

    total_entrevistas = len(eleitores) * len(perguntas)
    processados = 0

    print(f"Iniciando pesquisa: {titulo}")
    print(f"Eleitores: {len(eleitores)} | Perguntas: {len(perguntas)}")
    print(f"Total de entrevistas: {total_entrevistas}")
    print("-" * 50)

    for eleitor in eleitores:
        for pergunta in perguntas:
            # Verificar limite de custo
            if limite_custo and custo_total >= limite_custo:
                print(f"⚠️ Limite de custo atingido: R$ {custo_total:.2f}")
                break

            # Executar entrevista
            resposta = await entrevistar_eleitor(client, eleitor, pergunta)
            respostas.append(resposta)

            # Atualizar métricas
            custo_total += resposta["custo_reais"]
            tokens_total["entrada"] += resposta["tokens_entrada"]
            tokens_total["saida"] += resposta["tokens_saida"]

            processados += 1
            if processados % 10 == 0:
                print(f"Progresso: {processados}/{total_entrevistas} ({processados/total_entrevistas*100:.1f}%)")

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

    print("-" * 50)
    print(f"✅ Pesquisa concluída!")
    print(f"Respostas: {len(respostas)}")
    print(f"Custo: R$ {custo_total:.2f}")
    print(f"Duração: {(fim - inicio).total_seconds():.1f}s")

    return resultado
```

---

## PASSO 5: ANÁLISE DE RESULTADOS

### Estatísticas Descritivas

```python
import math
from collections import Counter

def calcular_estatisticas(valores: list) -> dict:
    """Calcula estatísticas descritivas"""
    if not valores:
        return {"erro": "Sem dados"}

    n = len(valores)
    valores_sorted = sorted(valores)

    media = sum(valores) / n

    if n % 2 == 0:
        mediana = (valores_sorted[n//2 - 1] + valores_sorted[n//2]) / 2
    else:
        mediana = valores_sorted[n//2]

    moda = Counter(valores).most_common(1)[0][0]

    variancia = sum((x - media) ** 2 for x in valores) / n
    desvio_padrao = math.sqrt(variancia)

    return {
        "n": n,
        "media": round(media, 2),
        "mediana": round(mediana, 2),
        "moda": moda,
        "desvio_padrao": round(desvio_padrao, 2),
        "minimo": min(valores),
        "maximo": max(valores),
    }
```

### Distribuição de Respostas

```python
def calcular_distribuicao(respostas: list, campo: str = "opcao") -> list:
    """Calcula distribuição de respostas"""
    valores = []
    for r in respostas:
        estruturada = r.get("resposta_estruturada", {})
        if campo in estruturada:
            valores.append(estruturada[campo])

    total = len(valores)
    contagem = Counter(valores)

    return [
        {
            "categoria": cat,
            "quantidade": qtd,
            "percentual": round(qtd / total * 100, 1)
        }
        for cat, qtd in contagem.most_common()
    ]
```

### Análise de Sentimentos

```python
def analisar_sentimento(texto: str) -> dict:
    """Análise básica de sentimento"""
    texto_lower = texto.lower()

    positivas = ["bom", "ótimo", "excelente", "feliz", "satisfeito", "apoio", "concordo", "esperança"]
    negativas = ["ruim", "péssimo", "horrível", "triste", "insatisfeito", "contra", "discordo", "medo", "raiva"]

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
```

### Análise Completa

```python
def analisar_resultados(pesquisa: dict, eleitores: list) -> dict:
    """
    Executa análise completa dos resultados.

    Args:
        pesquisa: Resultado da pesquisa executada
        eleitores: Lista de eleitores participantes

    Returns:
        Análise completa
    """
    respostas = pesquisa["respostas"]
    eleitores_dict = {e["id"]: e for e in eleitores}

    # Distribuição de respostas por pergunta
    distribuicoes = {}
    for pergunta in pesquisa["perguntas"]:
        resps_pergunta = [r for r in respostas if r["pergunta_id"] == pergunta["id"]]
        distribuicoes[pergunta["id"]] = {
            "pergunta": pergunta["texto"],
            "tipo": pergunta["tipo"],
            "distribuicao": calcular_distribuicao(resps_pergunta)
        }

    # Análise de sentimentos
    textos = [r["resposta_texto"] for r in respostas]
    sentimentos = [analisar_sentimento(t) for t in textos]
    sent_counts = Counter(s["sentimento"] for s in sentimentos)
    total = len(sentimentos)

    proporcao_sentimentos = {
        "positivo": round(sent_counts.get("positivo", 0) / total * 100, 1),
        "negativo": round(sent_counts.get("negativo", 0) / total * 100, 1),
        "neutro": round(sent_counts.get("neutro", 0) / total * 100, 1),
    }

    # Palavras frequentes
    palavras = extrair_palavras_frequentes(textos, limite=30)

    # Análise por segmento demográfico
    segmentos = {}
    for campo in ["genero", "faixa_etaria", "cluster_socioeconomico", "orientacao_politica", "religiao"]:
        segmentos[campo] = analisar_por_segmento(respostas, eleitores_dict, campo)

    return {
        "pesquisa_id": pesquisa["id"],
        "titulo": pesquisa["titulo"],
        "total_respostas": len(respostas),
        "total_eleitores": pesquisa["total_eleitores"],
        "distribuicoes_por_pergunta": distribuicoes,
        "sentimento_geral": sent_counts.most_common(1)[0][0],
        "proporcao_sentimentos": proporcao_sentimentos,
        "palavras_frequentes": palavras,
        "analise_por_segmento": segmentos,
        "custo_total": pesquisa["custo_total_reais"],
        "analisado_em": datetime.now().isoformat(),
    }

def extrair_palavras_frequentes(textos: list, limite: int = 30) -> list:
    """Extrai palavras mais frequentes"""
    stopwords = {"a", "o", "e", "de", "da", "do", "em", "um", "uma", "que", "para",
                 "com", "não", "se", "na", "no", "os", "as", "por", "mais", "mas"}

    todas_palavras = []
    for texto in textos:
        import re
        texto_limpo = re.sub(r"[^\w\s]", "", texto.lower())
        palavras = [p for p in texto_limpo.split() if len(p) > 2 and p not in stopwords]
        todas_palavras.extend(palavras)

    total = len(todas_palavras)
    contagem = Counter(todas_palavras)

    return [
        {"palavra": p, "frequencia": f, "percentual": round(f/total*100, 2)}
        for p, f in contagem.most_common(limite)
    ]

def analisar_por_segmento(respostas: list, eleitores: dict, campo: str) -> dict:
    """Analisa respostas por segmento demográfico"""
    grupos = {}

    for r in respostas:
        eleitor = eleitores.get(r["eleitor_id"], {})
        valor_campo = eleitor.get(campo, "Não informado")

        if valor_campo not in grupos:
            grupos[valor_campo] = []
        grupos[valor_campo].append(r)

    resultado = {}
    for grupo, resps in grupos.items():
        resultado[grupo] = {
            "total": len(resps),
            "distribuicao": calcular_distribuicao(resps)
        }

    return resultado
```

---

## PASSO 6: PERSISTÊNCIA

### Salvar Pesquisa

```python
from pathlib import Path

def salvar_pesquisa(pesquisa: dict, analise: dict) -> str:
    """
    Salva pesquisa e análise em arquivo JSON.

    Args:
        pesquisa: Resultado da pesquisa
        analise: Resultado da análise

    Returns:
        Caminho do arquivo salvo
    """
    # Criar diretório se não existir
    diretorio = Path("memorias/pesquisas-ia")
    diretorio.mkdir(parents=True, exist_ok=True)

    # Nome do arquivo com timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nome_arquivo = f"{pesquisa['id']}_{timestamp}.json"
    caminho = diretorio / nome_arquivo

    # Combinar dados
    dados = {
        "pesquisa": pesquisa,
        "analise": analise,
        "metadados": {
            "versao_skill": "1.0.0",
            "gerado_por": "skill-executar-pesquisa-eleitoral",
            "salvo_em": datetime.now().isoformat(),
        }
    }

    # Salvar
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2, default=str)

    print(f"✅ Pesquisa salva em: {caminho}")
    return str(caminho)
```

### Carregar Pesquisa Anterior

```python
def carregar_pesquisa(pesquisa_id: str) -> dict:
    """Carrega uma pesquisa salva anteriormente"""
    diretorio = Path("memorias/pesquisas-ia")

    for arquivo in diretorio.glob(f"{pesquisa_id}_*.json"):
        with open(arquivo, encoding="utf-8") as f:
            return json.load(f)

    raise ValueError(f"Pesquisa {pesquisa_id} não encontrada")

def listar_pesquisas() -> list:
    """Lista todas as pesquisas salvas"""
    diretorio = Path("memorias/pesquisas-ia")

    if not diretorio.exists():
        return []

    pesquisas = []
    for arquivo in diretorio.glob("*.json"):
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

    return sorted(pesquisas, key=lambda x: x["criado_em"], reverse=True)
```

---

## EXEMPLO COMPLETO DE USO

```python
"""
Exemplo completo: Pesquisa de intenção de voto entre evangélicos
"""

import asyncio
import json
from pathlib import Path
from anthropic import Anthropic
import os

# 1. CONFIGURAÇÃO
print("=" * 60)
print("PESQUISA ELEITORAL VIA IA - INTEIA")
print("=" * 60)

# 2. CARREGAR ELEITORES
eleitores = carregar_eleitores()
print(f"Total de eleitores no banco: {len(eleitores)}")

# 3. FILTRAR ELEITORES
filtros = {
    "religiao": "evangelica",
    "cluster_socioeconomico": "G3_media_baixa"
}
eleitores_selecionados = filtrar_eleitores(eleitores, filtros)
print(f"Eleitores após filtro: {len(eleitores_selecionados)}")

# Limitar amostra (para teste)
amostra = eleitores_selecionados[:50]

# 4. DEFINIR PERGUNTAS
perguntas = [
    {
        "id": "p1",
        "texto": "Em quem você votaria para Governador do DF em 2026?",
        "tipo": "multipla_escolha",
        "opcoes": [
            "Celina Leão (PP)",
            "Flávia Arruda (PL)",
            "Leandro Grass (PV)",
            "Candidato PT",
            "Indeciso",
            "Branco/Nulo"
        ]
    },
    {
        "id": "p2",
        "texto": "De 0 a 10, quanto você confia na política do DF?",
        "tipo": "escala"
    },
    {
        "id": "p3",
        "texto": "O que você espera do próximo governador?",
        "tipo": "aberta"
    }
]

# 5. EXECUTAR PESQUISA
async def main():
    resultado = await executar_pesquisa(
        titulo="Intenção de Voto - Evangélicos Classe Média-Baixa",
        eleitores=amostra,
        perguntas=perguntas,
        limite_custo=10.0  # Limite de R$ 10
    )

    # 6. ANALISAR RESULTADOS
    analise = analisar_resultados(resultado, amostra)

    # 7. EXIBIR RESULTADOS
    print("\n" + "=" * 60)
    print("RESULTADOS")
    print("=" * 60)

    for pergunta_id, dados in analise["distribuicoes_por_pergunta"].items():
        print(f"\n📊 {dados['pergunta']}")
        for item in dados["distribuicao"][:5]:
            barra = "█" * int(item["percentual"] / 5)
            print(f"   {item['categoria']:30} {item['percentual']:5.1f}% {barra}")

    print(f"\n💭 Sentimento geral: {analise['sentimento_geral']}")
    print(f"   Positivo: {analise['proporcao_sentimentos']['positivo']}%")
    print(f"   Neutro: {analise['proporcao_sentimentos']['neutro']}%")
    print(f"   Negativo: {analise['proporcao_sentimentos']['negativo']}%")

    print(f"\n💰 Custo total: R$ {resultado['custo_total_reais']:.2f}")

    # 8. SALVAR
    caminho = salvar_pesquisa(resultado, analise)
    print(f"\n📁 Arquivo salvo: {caminho}")

    return resultado, analise

# Executar
if __name__ == "__main__":
    asyncio.run(main())
```

---

## PROMPT COGNITIVO COMPLETO

O prompt completo usado para entrevistar eleitores está em:
`backend/app/servicos/claude_servico.py` - função `construir_prompt_cognitivo()`

Principais componentes:
1. **Constituição do Eleitor** - Princípios que regem respostas
2. **Contexto Informacional** - Memórias e informações do eleitor
3. **Perfil Completo** - 60+ campos do eleitor
4. **Processo de Raciocínio** - 4 etapas cognitivas
5. **Regras Invioláveis** - O que é proibido e permitido
6. **Formato da Resposta** - JSON estruturado

---

## VALIDAÇÃO ESTATÍSTICA

Para pesquisas válidas, considere:

| Amostra (n) | Margem de Erro (95% confiança) |
|-------------|-------------------------------|
| 100 | ±9.8% |
| 200 | ±6.9% |
| 400 | ±4.9% |
| 600 | ±4.0% |
| 1000 | ±3.1% |

Fórmula: `ME = 1.96 * sqrt(0.25/n) * 100`

---

## ARQUIVOS DE REFERÊNCIA

| Arquivo | Descrição |
|---------|-----------|
| `backend/app/servicos/claude_servico.py` | Serviço de integração Claude |
| `backend/app/servicos/resultado_servico.py` | Análise de resultados |
| `backend/app/servicos/pesquisa_servico.py` | Lógica de pesquisa |
| `agentes/banco-eleitores-df.json` | Banco de eleitores |
| `agentes/templates-perguntas-eleitorais.json` | Templates de perguntas |
| `scripts/pesquisa_governador_2026.py` | Exemplo de simulação |

---

## CUSTOS ESTIMADOS

| Modelo | Entrada (1M tokens) | Saída (1M tokens) |
|--------|---------------------|-------------------|
| Sonnet 4.5 | $3.00 | $15.00 |
| Opus 4.5 | $15.00 | $75.00 |

**Estimativa por entrevista (1 pergunta):**
- Tokens entrada: ~2000
- Tokens saída: ~500
- Custo Sonnet: ~R$ 0.05
- Custo Opus: ~R$ 0.25

**Pesquisa 100 eleitores × 5 perguntas:**
- 500 chamadas
- Custo Sonnet: ~R$ 25.00
- Custo Opus: ~R$ 125.00

---

## CHECKLIST DE EXECUÇÃO

Antes de executar uma pesquisa:

- [ ] Definir objetivo claro da pesquisa
- [ ] Selecionar filtros de eleitores adequados
- [ ] Verificar tamanho da amostra (margem de erro)
- [ ] Criar perguntas claras e não enviesadas
- [ ] Definir limite de custo
- [ ] Verificar API key configurada
- [ ] Executar pesquisa
- [ ] Analisar resultados
- [ ] Salvar em arquivo JSON
- [ ] Interpretar com cautela (eleitores sintéticos)

---

*Skill criada em: 2026-01-26*
*Mantida por: Claude Code*
*Versão: 1.0.0*
