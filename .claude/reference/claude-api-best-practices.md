# Claude API - Melhores Práticas INTEIA

## Modelos Disponíveis

| Modelo | Uso | Tokens/min |
|--------|-----|------------|
| `claude-opus-4-5-20251101` | Análises complexas, relatórios | Baixo |
| `claude-sonnet-4-20250514` | Entrevistas, uso geral | Médio |
| `claude-3-5-haiku-20241022` | Tarefas simples, alto volume | Alto |

## Configuração do Cliente

```python
# backend/app/servicos/claude_servico.py
import anthropic
from app.core.config import settings

# Cliente singleton
_client = None

def get_claude_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=settings.CLAUDE_API_KEY)
    return _client
```

## Prompt Engineering para Eleitores

### Template Base
```python
PROMPT_ELEITOR = """
Você é {nome}, um eleitor brasileiro de {idade} anos que mora em {regiao_administrativa}, Distrito Federal.

## Seu Perfil Completo
- Classe social: {cluster_socioeconomico}
- Escolaridade: {escolaridade}
- Ocupação: {ocupacao}
- Renda familiar: {renda_familiar}
- Orientação política: {orientacao_politica_texto}
- Posição sobre Bolsonaro: {posicao_bolsonaro}/10

## Suas Características Psicológicas
- Valores: {valores}
- Medos: {medos}
- Preocupações: {preocupacoes}
- Vieses cognitivos: {vieses_cognitivos}

## Comportamento Informacional
- Fontes de informação: {fontes_informacao}
- Redes sociais: {redes_sociais}
- Susceptibilidade a desinformação: {susceptibilidade_desinformacao}

## Instruções
- Responda SEMPRE como {nome}, na primeira pessoa
- Use vocabulário compatível com sua escolaridade
- Demonstre suas inclinações políticas nas respostas
- Seja autêntico às suas preocupações e valores
- Responda de forma natural, como em uma conversa

## Pergunta do Entrevistador
{pergunta}
"""
```

### Função de Entrevista
```python
async def executar_entrevista(
    eleitor: dict,
    pergunta: str,
    modelo: str = "claude-sonnet-4-20250514"
) -> str:
    """Executa entrevista com eleitor sintético."""

    client = get_claude_client()

    # Construir prompt personalizado
    prompt = PROMPT_ELEITOR.format(
        nome=eleitor['nome'],
        idade=eleitor['idade'],
        regiao_administrativa=eleitor['regiao_administrativa'],
        cluster_socioeconomico=eleitor['cluster_socioeconomico'],
        escolaridade=eleitor['escolaridade'],
        ocupacao=eleitor['ocupacao'],
        renda_familiar=eleitor['renda_familiar'],
        orientacao_politica_texto=traduzir_orientacao(eleitor['orientacao_politica']),
        posicao_bolsonaro=eleitor['posicao_bolsonaro'],
        valores=', '.join(eleitor['valores']),
        medos=', '.join(eleitor['medos']),
        preocupacoes=', '.join(eleitor['preocupacoes']),
        vieses_cognitivos=', '.join(eleitor['vieses_cognitivos']),
        fontes_informacao=', '.join(eleitor['fontes_informacao']),
        redes_sociais=', '.join(eleitor['redes_sociais']),
        susceptibilidade_desinformacao=eleitor['susceptibilidade_desinformacao'],
        pergunta=pergunta
    )

    response = client.messages.create(
        model=modelo,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text
```

## Análise de Resultados

### Prompt para Análise Agregada
```python
PROMPT_ANALISE = """
Você é Helena Montenegro, Agente de Sistemas de IA Avançados e Cientista Política da INTEIA.

## Dados da Pesquisa
{dados_json}

## Sua Tarefa
Analise os resultados desta pesquisa eleitoral e forneça:

1. **Conclusão Principal** (2-3 frases diretas)
2. **Recomendações Estratégicas** (3-5 itens priorizados)
3. **Análise por Segmento**
   - Por região administrativa
   - Por cluster socioeconômico
   - Por faixa etária
4. **Pontos de Atenção** (riscos e oportunidades)

## Formato
Use tom profissional e técnico. Inclua percentuais sempre que possível.
Priorize insights acionáveis sobre descrições genéricas.
"""
```

## Tratamento de Erros

```python
from anthropic import APIError, RateLimitError

async def executar_com_retry(
    eleitor: dict,
    pergunta: str,
    max_tentativas: int = 3
) -> str:
    """Executa entrevista com retry automático."""

    for tentativa in range(max_tentativas):
        try:
            return await executar_entrevista(eleitor, pergunta)

        except RateLimitError:
            # Aguardar antes de tentar novamente
            await asyncio.sleep(2 ** tentativa)

        except APIError as e:
            logger.error(f"Erro API Claude: {e}")
            if tentativa == max_tentativas - 1:
                raise

    raise Exception("Máximo de tentativas excedido")
```

## Batch Processing

```python
async def executar_pesquisa_batch(
    eleitores: list[dict],
    pergunta: str,
    concorrencia: int = 5
) -> list[dict]:
    """Executa entrevistas em batch com controle de concorrência."""

    semaphore = asyncio.Semaphore(concorrencia)
    resultados = []

    async def entrevistar_com_semaphore(eleitor):
        async with semaphore:
            resposta = await executar_entrevista(eleitor, pergunta)
            return {
                'eleitor_id': eleitor['id'],
                'resposta': resposta
            }

    tarefas = [entrevistar_com_semaphore(e) for e in eleitores]
    resultados = await asyncio.gather(*tarefas, return_exceptions=True)

    # Filtrar erros
    return [r for r in resultados if not isinstance(r, Exception)]
```

## Custos e Otimização

### Estimativa de Custos
```python
def estimar_custo_pesquisa(
    num_eleitores: int,
    tokens_prompt: int = 800,
    tokens_resposta: int = 200,
    modelo: str = "claude-sonnet-4-20250514"
) -> float:
    """Estima custo de uma pesquisa completa."""

    precos = {
        "claude-opus-4-5-20251101": {"input": 15, "output": 75},
        "claude-sonnet-4-20250514": {"input": 3, "output": 15},
        "claude-3-5-haiku-20241022": {"input": 0.25, "output": 1.25}
    }

    preco = precos[modelo]

    custo_input = (tokens_prompt * num_eleitores / 1_000_000) * preco["input"]
    custo_output = (tokens_resposta * num_eleitores / 1_000_000) * preco["output"]

    return custo_input + custo_output

# Exemplo: 500 eleitores com Sonnet
# custo = estimar_custo_pesquisa(500)  # ~$1.50
```

### Dicas de Otimização

1. **Use Haiku para validação** - Testar prompts antes de produção
2. **Cache de respostas similares** - Evitar re-entrevistas
3. **Batch por região** - Processar eleitores em grupos
4. **Prompts concisos** - Remover informações redundantes
5. **Respostas curtas** - Limitar max_tokens quando possível
