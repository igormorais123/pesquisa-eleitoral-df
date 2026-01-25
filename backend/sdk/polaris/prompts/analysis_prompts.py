# POLARIS SDK - Analysis Prompts
# Prompts para análises especializadas

QUALITATIVE_ANALYSIS_PROMPT = """## Tarefa: Análise Qualitativa de Conteúdo

Analise as respostas abertas coletadas e realize análise de conteúdo temática.

### Respostas para Análise
Pergunta: {pergunta_texto}
Total de respostas: {total_respostas}

{respostas_texto}

### Instruções
Realize análise de conteúdo seguindo:

1. **Leitura Flutuante**: Identifique temas emergentes
2. **Categorização**: Crie categorias temáticas mutuamente exclusivas
3. **Codificação**: Classifique cada resposta
4. **Quantificação**: Conte frequência de cada categoria
5. **Citações**: Selecione citações representativas

### Formato de Resposta (JSON)
```json
{{
  "metodo": "analise_tematica",
  "categorias": [
    {{
      "nome": "string",
      "descricao": "string",
      "frequencia": 0,
      "percentual": 0.0,
      "citacoes_representativas": ["string"],
      "subcategorias": []
    }}
  ],
  "palavras_frequentes": {{}},
  "temas_emergentes": ["string"],
  "insights_qualitativos": ["string"],
  "citacoes_destaque": {{
    "positivas": ["string"],
    "negativas": ["string"],
    "neutras": ["string"]
  }}
}}
```
"""

SENTIMENT_ANALYSIS_PROMPT = """## Tarefa: Análise de Sentimentos

Analise o sentimento das respostas e correlacione com intenção de voto.

### Dados das Entrevistas
Total de entrevistas: {total_entrevistas}

{dados_sentimento}

### Instruções
Realize análise de sentimento considerando:

1. **Distribuição Geral**: % positivo, neutro, negativo
2. **Por Emoção**: Frequência de cada emoção primária
3. **Intensidade**: Intensidade média por grupo
4. **Correlações**: Relacione sentimento com voto
5. **Gatilhos**: Identifique principais gatilhos emocionais

### Formato de Resposta (JSON)
```json
{{
  "distribuicao_geral": {{
    "positivo": 0.0,
    "neutro": 0.0,
    "negativo": 0.0
  }},
  "por_emocao": [
    {{
      "emocao": "string",
      "frequencia": 0,
      "percentual": 0.0,
      "intensidade_media": 0.0
    }}
  ],
  "intensidade_por_grupo": {{}},
  "correlacao_voto": {{
    "descricao": "string",
    "coeficiente": 0.0,
    "significativo": true
  }},
  "gatilhos_emocionais": [
    {{
      "gatilho": "string",
      "emocao_predominante": "string",
      "frequencia": 0
    }}
  ],
  "insights": ["string"]
}}
```
"""

CLUSTER_INTERPRETATION_PROMPT = """## Tarefa: Interpretar Clusters de Eleitores

Interprete os clusters identificados na análise e crie perfis acionáveis.

### Clusters Identificados
Método: {metodo}
Número de clusters: {n_clusters}

{dados_clusters}

### Instruções
Para cada cluster:

1. **Nomear**: Dê um nome descritivo ao cluster
2. **Caracterizar**: Descreva características dominantes
3. **Comportamento Político**: Analise padrões de voto
4. **Persuabilidade**: Avalie potencial de persuasão
5. **Comunicação**: Sugira abordagem de comunicação

### Formato de Resposta (JSON)
```json
{{
  "clusters": [
    {{
      "id": 0,
      "nome_sugerido": "string",
      "descricao": "string",
      "tamanho": 0,
      "percentual": 0.0,
      "caracteristicas_dominantes": {{
        "demograficas": {{}},
        "socioeconomicas": {{}},
        "politicas": {{}},
        "comportamentais": {{}}
      }},
      "comportamento_voto": {{
        "intencao_predominante": "string",
        "taxa_indecisao": 0.0,
        "rejeicao_principal": "string"
      }},
      "persuabilidade": {{
        "nivel": "baixa|media|alta",
        "fatores": ["string"]
      }},
      "estrategia_comunicacao": {{
        "mensagem_chave": "string",
        "tom_recomendado": "string",
        "canais_preferenciais": ["string"],
        "temas_ressonantes": ["string"],
        "temas_evitar": ["string"]
      }}
    }}
  ],
  "segmentos_estrategicos": {{
    "base_fiel": [0],
    "persuadiveis": [0],
    "adversarios": [0]
  }},
  "recomendacoes_segmentacao": ["string"]
}}
```
"""

HYPOTHESIS_TEST_PROMPT = """## Tarefa: Testar Hipótese Estatística

Teste a hipótese de pesquisa utilizando os dados coletados.

### Hipótese
ID: {hipotese_id}
Enunciado: {enunciado}
Variável Independente: {vi}
Variável Dependente: {vd}
Tipo: {tipo}

### Dados
{dados_para_teste}

### Instruções
1. Identifique o teste estatístico apropriado
2. Verifique pressupostos do teste
3. Calcule a estatística de teste
4. Determine valor-p
5. Calcule tamanho do efeito
6. Interprete resultados

### Testes Disponíveis
- Chi-quadrado: variáveis categóricas
- Teste t: comparação de médias (2 grupos)
- ANOVA: comparação de médias (3+ grupos)
- Correlação de Pearson/Spearman: variáveis contínuas
- Regressão logística: preditores de voto

### Formato de Resposta (JSON)
```json
{{
  "hipotese_id": "string",
  "teste_selecionado": "string",
  "justificativa_teste": "string",
  "pressupostos": [
    {{
      "pressuposto": "string",
      "verificado": true,
      "comentario": "string"
    }}
  ],
  "resultados": {{
    "estatistica": 0.0,
    "graus_liberdade": 0,
    "valor_p": 0.0,
    "intervalo_confianca": [0.0, 0.0],
    "tamanho_efeito": 0.0,
    "tipo_tamanho_efeito": "string"
  }},
  "interpretacao": {{
    "significativo": true,
    "nivel_significancia": 0.05,
    "hipotese_suportada": true,
    "conclusao": "string"
  }},
  "limitacoes": ["string"],
  "proximos_passos": ["string"]
}}
```
"""

CROSS_TABULATION_PROMPT = """## Tarefa: Análise de Tabelas Cruzadas

Gere e analise tabelas cruzadas para as variáveis especificadas.

### Variáveis
Variável de Linha: {variavel_linha}
Variável de Coluna: {variavel_coluna}

### Dados
{dados}

### Instruções
1. Construa a tabela de contingência
2. Calcule frequências absolutas e relativas
3. Calcule totais marginais
4. Realize teste chi-quadrado de independência
5. Interprete padrões

### Formato de Resposta (JSON)
```json
{{
  "tabela_cruzada": {{
    "linhas": ["string"],
    "colunas": ["string"],
    "valores": [[]],
    "totais_linha": [],
    "totais_coluna": [],
    "total_geral": 0
  }},
  "percentuais": {{
    "por_linha": [[]],
    "por_coluna": [[]],
    "do_total": [[]]
  }},
  "teste_independencia": {{
    "chi2": 0.0,
    "gl": 0,
    "valor_p": 0.0,
    "cramers_v": 0.0,
    "independentes": false
  }},
  "padroes_observados": ["string"],
  "celulas_destaque": [
    {{
      "linha": "string",
      "coluna": "string",
      "valor": 0,
      "interpretacao": "string"
    }}
  ]
}}
```
"""

MONTE_CARLO_PROMPT = """## Tarefa: Simulação Monte Carlo para Projeção

Realize simulação Monte Carlo para projetar cenários eleitorais.

### Dados de Entrada
Intenção de voto atual: {intencao_voto}
Margem de erro: {margem_erro}
Indecisos: {indecisos}
Distribuição de indecisos: {distribuicao_indecisos}

### Parâmetros
Número de simulações: {n_simulacoes}
Nível de confiança: {nivel_confianca}

### Instruções
1. Configure distribuições de probabilidade para cada candidato
2. Execute N simulações
3. Calcule probabilidade de vitória para cada candidato
4. Determine intervalos de confiança
5. Identifique cenários críticos

### Formato de Resposta (JSON)
```json
{{
  "parametros": {{
    "n_simulacoes": 10000,
    "distribuicoes": {{}}
  }},
  "resultados": {{
    "probabilidade_vitoria": {{}},
    "probabilidade_segundo_turno": 0.0,
    "intervalos_confianca": {{
      "candidato": [0.0, 0.0]
    }}
  }},
  "distribuicao_resultados": {{
    "candidato": {{
      "media": 0.0,
      "desvio_padrao": 0.0,
      "percentil_5": 0.0,
      "percentil_95": 0.0
    }}
  }},
  "cenarios_criticos": [
    {{
      "descricao": "string",
      "probabilidade": 0.0,
      "condicoes": ["string"]
    }}
  ],
  "sensibilidade": {{
    "fator": "string",
    "impacto": 0.0
  }}
}}
```
"""
