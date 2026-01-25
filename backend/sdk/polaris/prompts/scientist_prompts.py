# POLARIS SDK - Scientist Prompts
# Prompts para Claude Opus 4.5 como Cientista Político Sênior

SCIENTIST_SYSTEM_PROMPT = """Você é um Cientista Político Sênior especializado em pesquisa eleitoral brasileira.

## Sua Identidade
- Nome: Dr. POLARIS (Political Analysis & Research Intelligence System)
- Formação: PhD em Ciência Política com especialização em Comportamento Eleitoral
- Experiência: 20+ anos conduzindo pesquisas eleitorais no Brasil
- Metodologia: Rigor científico com abordagem pragmática

## Suas Responsabilidades
1. Definir problemáticas de pesquisa cientificamente válidas
2. Desenhar metodologias robustas e justificadas
3. Criar estratégias de amostragem representativas
4. Construir questionários válidos e confiáveis
5. Analisar dados com técnicas estatísticas apropriadas
6. Gerar projeções com intervalos de confiança
7. Produzir recomendações estratégicas baseadas em evidências
8. Elaborar relatórios profissionais e acionáveis

## Princípios
- RIGOR: Toda conclusão deve ser suportada por dados
- TRANSPARÊNCIA: Explicitar limitações e incertezas
- IMPARCIALIDADE: Apresentar dados objetivamente
- UTILIDADE: Recomendações devem ser acionáveis
- ÉTICA: Respeitar princípios de pesquisa ética

## Contexto
- Região: Distrito Federal, Brasil
- Eleitorado: ~2.3 milhões de eleitores
- Base de dados: 1000+ perfis sintéticos de eleitores
- Cada perfil tem 60+ atributos demográficos, socioeconômicos, políticos e comportamentais

## Formato de Resposta
Sempre responda em JSON estruturado conforme solicitado em cada prompt.
Use português brasileiro em todo o conteúdo textual.
"""

PROBLEM_DEFINITION_PROMPT = """## Tarefa: Definir Problemática de Pesquisa

Com base no tema fornecido, desenvolva uma problemática de pesquisa científica completa.

### Tema da Pesquisa
{tema}

### Contexto Adicional
{contexto}

### Instruções
Analise o tema e produza:

1. **Tema Central**: Reformule o tema de forma acadêmica
2. **Problema de Pesquisa**: Formule a questão científica central
3. **Perguntas de Pesquisa**: Liste 5-10 perguntas derivadas
4. **Hipóteses**: Formule 3-5 hipóteses testáveis
5. **Objetivos**: Defina objetivo geral e específicos
6. **Justificativa**: Explique a relevância científica e prática
7. **Delimitação**: Defina escopo temporal, geográfico e temático

### Formato de Resposta (JSON)
```json
{{
  "tema_central": "string",
  "problema_pesquisa": "string",
  "perguntas_pesquisa": ["string"],
  "hipoteses": [
    {{
      "id": "H1",
      "enunciado": "string",
      "variavel_independente": "string",
      "variavel_dependente": "string",
      "tipo": "correlacional|causal|descritiva|comparativa"
    }}
  ],
  "objetivos": {{
    "geral": "string",
    "especificos": ["string"]
  }},
  "justificativa": "string",
  "delimitacao": {{
    "temporal": "string",
    "geografico": "string",
    "tematico": "string",
    "populacao": "string",
    "limitacoes": ["string"]
  }}
}}
```
"""

METHODOLOGY_DESIGN_PROMPT = """## Tarefa: Desenhar Metodologia de Pesquisa

Com base na problemática definida, desenhe a metodologia completa.

### Problemática
{problematica}

### Instruções
Desenvolva o desenho metodológico considerando:

1. **Tipo de Pesquisa**: quantitativa, qualitativa ou mista
2. **Paradigma**: positivista, interpretativista ou pragmático
3. **Abordagem**: survey, estudo de caso, experimental, longitudinal
4. **Técnicas de Análise**: liste todas as técnicas que serão utilizadas
5. **Validade**: como garantir validade interna e externa
6. **Confiabilidade**: medidas de confiabilidade planejadas

### Considerações Especiais
- O universo é de ~1000 eleitores sintéticos do DF
- Cada eleitor tem perfil detalhado com 60+ atributos
- As respostas serão simuladas por IA (Claude Sonnet 4)
- Deve haver rigor científico mesmo sendo simulação

### Formato de Resposta (JSON)
```json
{{
  "tipo_pesquisa": "quantitativa|qualitativa|mista",
  "paradigma": "positivista|interpretativista|pragmatico",
  "abordagem": "survey|estudo_caso|experimental|longitudinal",
  "justificativa_metodologia": "string",
  "tecnicas_analise": [
    {{
      "nome": "string",
      "tipo": "descritiva|inferencial|multivariada|qualitativa|preditiva",
      "objetivo": "string",
      "variaveis": ["string"]
    }}
  ],
  "software_analise": ["string"],
  "validade_interna": [
    {{
      "tipo": "string",
      "descricao": "string",
      "como_garantir": "string"
    }}
  ],
  "validade_externa": [
    {{
      "tipo": "string",
      "descricao": "string",
      "limitacoes": "string"
    }}
  ],
  "confiabilidade": {{
    "medidas_planejadas": ["string"],
    "criterios_aceitacao": "string"
  }}
}}
```
"""

SAMPLING_STRATEGY_PROMPT = """## Tarefa: Definir Estratégia de Amostragem

Defina a estratégia de amostragem para a pesquisa.

### Metodologia
{metodologia}

### Banco de Eleitores Disponível
- Total: {total_eleitores} eleitores
- Variáveis disponíveis para estratificação:
{variaveis_estratificacao}

### Distribuição da População
{distribuicao_populacao}

### Instruções
Defina a estratégia de amostragem considerando:

1. **Tipo de Amostragem**: justifique a escolha
2. **Tamanho da Amostra**: calcule considerando nível de confiança e margem de erro
3. **Variáveis de Estratificação**: quais usar e por quê
4. **Cotas/Proporções**: se aplicável, defina cotas
5. **Critérios de Seleção**: como selecionar os eleitores

### Formato de Resposta (JSON)
```json
{{
  "tipo_amostragem": "estratificada_proporcional|estratificada_otima|por_cotas|aleatoria_simples|sistematica|por_cluster",
  "justificativa": "string",
  "tamanho_amostra": {{
    "n": 0,
    "nivel_confianca": 0.95,
    "margem_erro": 0.03,
    "calculo": "string"
  }},
  "variaveis_estratificacao": [
    {{
      "nome": "string",
      "peso": 0.0,
      "justificativa": "string"
    }}
  ],
  "cotas": [
    {{
      "variavel": "string",
      "categoria": "string",
      "proporcao_alvo": 0.0,
      "quantidade": 0
    }}
  ],
  "criterios_selecao": ["string"],
  "procedimento_selecao": "string"
}}
```
"""

QUESTIONNAIRE_BUILDER_PROMPT = """## Tarefa: Construir Questionário

Construa um questionário cientificamente válido para a pesquisa.

### Problemática
{problematica}

### Metodologia
{metodologia}

### Instruções
Construa o questionário seguindo:

1. **Estrutura em Blocos**: organize por temas
2. **Tipos de Pergunta**: use variedade apropriada
3. **Sequência Lógica**: do geral ao específico
4. **Perguntas de Controle**: inclua para validação
5. **Instruções para IA**: como o Sonnet 4 deve interpretar cada pergunta

### Regras de Construção
- Evitar perguntas duplas (double-barreled)
- Evitar negativas duplas
- Usar linguagem simples e clara
- Evitar indução de resposta
- Balancear escalas
- Incluir opção "não sei/não quero responder" quando apropriado

### Tipos de Pergunta Disponíveis
- escala_likert: 5-7 pontos com âncoras
- multipla_escolha: até 7 opções
- ranking: ordenação de prioridades
- aberta: resposta livre
- dicotomica: sim/não
- semantico_diferencial: polos opostos

### Formato de Resposta (JSON)
```json
{{
  "titulo": "string",
  "versao": "1.0",
  "tempo_estimado_minutos": 15,
  "blocos": [
    {{
      "id": "B1",
      "nome": "string",
      "descricao": "string",
      "perguntas": [
        {{
          "id": "Q1",
          "texto": "string",
          "tipo": "escala_likert|multipla_escolha|ranking|aberta|dicotomica|semantico_diferencial",
          "opcoes": ["string"],
          "escala": {{
            "min": 1,
            "max": 5,
            "rotulos": ["string"]
          }},
          "obrigatoria": true,
          "randomizar_ordem": false,
          "instrucoes_ia": "string"
        }}
      ]
    }}
  ]
}}
```
"""

DATA_ANALYSIS_PROMPT = """## Tarefa: Analisar Dados Coletados

Analise os dados coletados nas entrevistas.

### Problemática
{problematica}

### Metodologia
{metodologia}

### Dados Coletados
Total de respostas: {total_respostas}
Eleitores entrevistados: {total_eleitores}

### Resumo dos Dados
{resumo_dados}

### Hipóteses a Testar
{hipoteses}

### Instruções
Realize análises completas:

1. **Análise Descritiva**
   - Frequências de todas as variáveis
   - Medidas de tendência central
   - Medidas de dispersão
   - Tabelas cruzadas relevantes

2. **Análise Inferencial**
   - Teste cada hipótese
   - Calcule valor-p e tamanho de efeito
   - Determine significância estatística

3. **Análise Segmentada**
   - Resultados por região administrativa
   - Resultados por faixa etária
   - Resultados por orientação política
   - Resultados por classe social

4. **Análise Qualitativa** (respostas abertas)
   - Categorização temática
   - Citações representativas

5. **Análise de Sentimento**
   - Distribuição emocional
   - Correlação com voto

### Formato de Resposta (JSON)
```json
{{
  "analise_descritiva": {{
    "intencao_voto": {{
      "distribuicao": {{}},
      "lider": "string",
      "diferenca_segundo": 0.0,
      "margem_erro": 0.0
    }},
    "rejeicao": {{}},
    "indecisos": {{}},
    "outras_variaveis": {{}}
  }},
  "analise_inferencial": [
    {{
      "hipotese_id": "H1",
      "teste": "string",
      "estatistica": 0.0,
      "valor_p": 0.0,
      "tamanho_efeito": 0.0,
      "significativo": true,
      "conclusao": "string"
    }}
  ],
  "analise_segmentada": {{}},
  "analise_qualitativa": {{
    "categorias": [],
    "citacoes": []
  }},
  "analise_sentimento": {{
    "distribuicao": {{}},
    "correlacao_voto": {{}}
  }},
  "principais_achados": ["string"],
  "limitacoes": ["string"]
}}
```
"""

PROJECTIONS_PROMPT = """## Tarefa: Gerar Projeções Eleitorais

Com base nas análises, gere projeções para diferentes cenários.

### Resultados da Análise
{resultados_analise}

### Instruções
Desenvolva projeções para:

1. **Cenário Otimista** (favorece líder atual)
   - Premissas favoráveis ao líder
   - Indecisos migram proporcionalmente

2. **Cenário Realista** (tendência atual)
   - Mantém distribuição atual
   - Considera margem de erro

3. **Cenário Pessimista** (favorece challenger)
   - Indecisos vão para segundo colocado
   - Considera volatilidade

4. **Cenário Volatilidade Máxima**
   - Todos indecisos para um candidato
   - Testa limites

Para cada cenário:
- Calcule probabilidade de vitória (simulação Monte Carlo)
- Defina intervalo de confiança
- Liste premissas

Adicionalmente:
- Identifique swing voters
- Mapeie pontos de ruptura potenciais

### Formato de Resposta (JSON)
```json
{{
  "cenarios": [
    {{
      "tipo": "otimista|realista|pessimista|volatilidade_maxima",
      "nome": "string",
      "descricao": "string",
      "intencao_voto": {{}},
      "intervalo_confianca": {{}},
      "probabilidade_vitoria": {{}},
      "probabilidade_segundo_turno": 0.0,
      "premissas": ["string"]
    }}
  ],
  "swing_voters": {{
    "percentual": 0.0,
    "perfil": "string",
    "caracteristicas": []
  }},
  "pontos_ruptura": [
    {{
      "tema": "string",
      "descricao": "string",
      "impacto_potencial": 0.0,
      "segmentos_afetados": [],
      "direcao_impacto": "string",
      "probabilidade_ocorrencia": 0.0
    }}
  ]
}}
```
"""

RECOMMENDATIONS_PROMPT = """## Tarefa: Gerar Recomendações Estratégicas

Com base nas análises e projeções, gere recomendações acionáveis.

### Análises Realizadas
{analises}

### Projeções
{projecoes}

### Cliente/Candidato
{cliente}

### Instruções
Gere recomendações nas seguintes categorias:

1. **Posicionamento**: onde se posicionar no espectro político
2. **Comunicação**: como comunicar mensagens-chave
3. **Segmentação**: quais públicos priorizar
4. **Temas**: quais temas enfatizar ou evitar
5. **Defesa**: como responder a ataques
6. **Timing**: quando realizar ações
7. **Recursos**: onde investir recursos

Para cada recomendação:
- Diagnóstico (o que os dados mostram)
- Recomendação específica
- Justificativa científica
- Risco se não seguir
- Prioridade (crítica, alta, média, baixa)
- Dificuldade de implementação (1-5)
- Ações específicas

### Formato de Resposta (JSON)
```json
{{
  "recomendacoes": [
    {{
      "id": "R1",
      "categoria": "posicionamento|comunicacao|segmentacao|temas|defesa|timing|recursos",
      "prioridade": "critica|alta|media|baixa",
      "titulo": "string",
      "diagnostico": "string",
      "recomendacao": "string",
      "justificativa": "string",
      "risco_nao_seguir": "string",
      "dificuldade_implementacao": 0,
      "acoes_especificas": ["string"],
      "segmentos_alvo": ["string"],
      "mensagens_chave": ["string"],
      "canais_recomendados": ["string"],
      "dados_suporte": {{}}
    }}
  ],
  "publicos_prioritarios": [
    {{
      "segmento": "string",
      "tamanho_percentual": 0.0,
      "potencial_persuasao": "string",
      "mensagem_recomendada": "string"
    }}
  ],
  "resumo_executivo": "string"
}}
```
"""

REPORT_GENERATION_PROMPT = """## Tarefa: Gerar Relatório HTML

Gere um relatório HTML profissional e interativo.

### Dados Disponíveis
- Problemática: {problematica}
- Metodologia: {metodologia}
- Amostra: {amostra}
- Análises: {analises}
- Projeções: {projecoes}
- Recomendações: {recomendacoes}

### Instruções
Gere um relatório HTML completo contendo:

1. **Capa**
   - Título da pesquisa
   - Data
   - Logo POLARIS

2. **Sumário Executivo**
   - KPIs principais (líder, margem, indecisos)
   - Principais achados (bullets)
   - Headline conclusivo

3. **Metodologia**
   - Ficha técnica
   - Tipo de pesquisa
   - Amostragem

4. **Resultados**
   - Gráficos de intenção de voto (barra)
   - Heatmap por região
   - Tabelas segmentadas
   - Análise de rejeição

5. **Projeções**
   - Cards de cenários
   - Probabilidades de vitória
   - Pontos de ruptura

6. **Recomendações**
   - Cards por prioridade
   - Ações específicas

7. **Anexos**
   - Ficha técnica completa
   - Tabelas detalhadas

### Requisitos Técnicos
- HTML5 responsivo (mobile-first)
- CSS embutido (inline styles ou <style>)
- JavaScript para gráficos (Chart.js CDN)
- Navegação por âncoras
- Cores profissionais
- Tipografia legível

### Formato de Resposta
Retorne o HTML completo como string, começando com <!DOCTYPE html>.
"""
