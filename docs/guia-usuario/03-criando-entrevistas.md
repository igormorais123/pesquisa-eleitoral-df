# Criando Entrevistas

Guia completo para formular pesquisas eficazes.

---

## Estrutura de uma Entrevista

Uma entrevista é composta por:

1. **Metadados**: Título, tipo, descrição
2. **Perguntas**: 1 a 50 questões
3. **Amostra**: Quais eleitores responderão
4. **Configurações**: Limites e parâmetros de execução

---

## Tipos de Entrevista

### Quantitativa

**Use quando:** Precisa de números e estatísticas

- Perguntas de escala (0-10)
- Múltipla escolha
- Sim/Não

**Exemplo:**
```
"De 0 a 10, qual a probabilidade de você votar no candidato X?"
```

**Vantagens:**
- Fácil de analisar estatisticamente
- Gera gráficos automaticamente
- Permite comparações diretas

**Desvantagens:**
- Não captura nuances
- Pode forçar respostas artificiais

---

### Qualitativa

**Use quando:** Precisa entender o "porquê"

- Perguntas abertas
- Respostas em texto livre

**Exemplo:**
```
"O que você pensa sobre a proposta de reforma tributária?"
```

**Vantagens:**
- Captura nuances e emoções
- Revela motivações profundas
- Permite descobertas inesperadas

**Desvantagens:**
- Mais difícil de analisar
- Respostas podem ser longas ou evasivas
- Custo maior (mais tokens)

---

### Mista (Recomendada)

**Combine ambos os tipos:**

1. Perguntas quantitativas para métricas
2. Perguntas abertas para entender motivações

**Exemplo de sequência:**
```
P1 (Escala): "De 0 a 10, quanto você confia no governador?"
P2 (Aberta): "Por que você deu essa nota?"
P3 (Múltipla): "Qual área mais precisa de melhoria?"
P4 (Aberta): "Conte uma experiência pessoal com esse problema."
```

---

## Tipos de Pergunta

### Escala (Likert)

```json
{
  "texto": "De 0 a 10, qual sua satisfação com o transporte público?",
  "tipo": "escala",
  "escala_min": 0,
  "escala_max": 10,
  "escala_rotulos": ["Péssimo", "Excelente"]
}
```

**Dicas:**
- Use 0-10 para maior granularidade
- Use 1-5 para decisões mais simples
- Sempre inclua rótulos nas extremidades

---

### Múltipla Escolha

```json
{
  "texto": "Se a eleição fosse hoje, em quem você votaria?",
  "tipo": "multipla_escolha",
  "opcoes": [
    "Candidato A",
    "Candidato B",
    "Candidato C",
    "Branco/Nulo",
    "Não sei / Prefiro não responder"
  ]
}
```

**Dicas:**
- Limite a 5-7 opções
- Sempre inclua "Não sei" ou "Outro"
- Ordene de forma neutra (alfabética ou aleatória)

---

### Sim/Não

```json
{
  "texto": "Você votaria em um candidato que defende [proposta X]?",
  "tipo": "sim_nao"
}
```

**Dicas:**
- Use para questões binárias claras
- Evite perguntas ambíguas
- Considere adicionar "Não sei" como terceira opção

---

### Aberta

```json
{
  "texto": "O que você espera do próximo governador do DF?",
  "tipo": "aberta"
}
```

**Dicas:**
- Seja específico na pergunta
- Evite perguntas muito amplas
- Uma boa pergunta aberta gera respostas de 2-5 frases

---

### Aberta Longa

```json
{
  "texto": "Conte como a política afetou sua vida nos últimos anos.",
  "tipo": "aberta_longa"
}
```

**Dicas:**
- Use para narrativas e histórias pessoais
- Gera respostas mais ricas, mas mais caras
- Limite a 1-2 por entrevista

---

### Ranking

```json
{
  "texto": "Ordene as áreas por prioridade para o governo:",
  "tipo": "ranking",
  "opcoes": [
    "Saúde",
    "Educação",
    "Segurança",
    "Transporte",
    "Economia"
  ]
}
```

**Dicas:**
- Limite a 5-7 itens para ranquear
- Resultados mostram posição média de cada item

---

## Boas Práticas

### 1. Comece com Perguntas Fáceis

```
✅ P1: "Em qual região do DF você mora?"
   P2: "Qual sua principal preocupação hoje?"
   P3: [Pergunta mais complexa]

❌ P1: "O que você pensa sobre a reforma tributária
      e seus impactos macroeconômicos?"
```

**Por quê?** Perguntas simples criam rapport e aquecem o respondente.

---

### 2. Evite Perguntas Tendenciosas

```
❌ "Você concorda que o governo está fazendo um
    péssimo trabalho na segurança?"

✅ "Como você avalia o trabalho do governo na
    área de segurança?"
```

**Por quê?** Perguntas tendenciosas enviessam as respostas.

---

### 3. Uma Pergunta Por Vez

```
❌ "Você acha que o transporte e a saúde
    melhoraram ou pioraram?"

✅ P1: "Como está o transporte público?"
   P2: "Como está a saúde pública?"
```

**Por quê?** Perguntas duplas confundem e geram respostas inconsistentes.

---

### 4. Use Linguagem Acessível

```
❌ "Qual sua percepção sobre a eficácia das
    políticas públicas intersetoriais?"

✅ "O governo está resolvendo os problemas
    do dia a dia?"
```

**Por quê?** Lembre-se que eleitores têm diferentes níveis de escolaridade.

---

### 5. Teste com Amostra Pequena

Antes de rodar com 1000 eleitores:

1. Rode com 10-20 eleitores
2. Analise as respostas
3. Ajuste perguntas confusas
4. Rode a pesquisa completa

---

## Selecionando a Amostra

### Amostra Representativa (Todos)

Selecione todos os 1000 eleitores para resultados que representam o eleitorado geral do DF.

**Use quando:**
- Quer projetar intenção de voto
- Precisa de resultados gerais
- Não tem hipótese específica

---

### Amostra Segmentada

Use filtros para testar hipóteses específicas.

**Exemplos:**

| Hipótese | Filtros |
|----------|---------|
| "Jovens rejeitam candidato X" | Idade: 18-30 |
| "Periferia é anti-governo" | Cluster: G4_baixa |
| "Evangélicos são conservadores" | Religião: evangélica |
| "Classe média está indecisa" | Cluster: G2 + G3, Posição: neutro |

---

### Amostra Comparativa

Rode a mesma pesquisa em dois grupos para comparar:

**Exemplo:**
- Grupo A: Eleitores de esquerda (N=150)
- Grupo B: Eleitores de direita (N=150)

Compare respostas entre grupos.

---

## Configurações de Execução

### Limite de Custo

Defina um teto em reais para evitar surpresas:

```
Limite: R$ 50,00
```

A execução para automaticamente ao atingir o limite.

**Recomendações:**
- Piloto (10 eleitores): R$ 5
- Amostra pequena (50): R$ 20
- Amostra média (500): R$ 125
- Amostra completa (1000): R$ 250

---

### Tamanho do Lote (Batch)

Quantos eleitores são entrevistados em paralelo:

| Valor | Prós | Contras |
|-------|------|---------|
| 5 | Mais controle, menos erros | Mais lento |
| 10 | Equilíbrio | Padrão |
| 20 | Mais rápido | Pode sobrecarregar |

---

### Delay Entre Lotes

Tempo de espera entre cada lote (em milissegundos):

| Valor | Quando Usar |
|-------|-------------|
| 200ms | Pressa, aceita risco de rate limit |
| 500ms | Padrão, seguro |
| 1000ms | Conservador, garante estabilidade |

---

## Estimando Custos

### Fórmula Básica

```
Custo = Perguntas × Eleitores × Custo_por_interação
```

**Custo por interação (aproximado):**
- Sonnet 4.5: ~R$ 0,02 - R$ 0,05
- Opus 4.5: ~R$ 0,15 - R$ 0,30

### Exemplos

| Cenário | Perguntas | Eleitores | Custo Est. |
|---------|-----------|-----------|------------|
| Piloto | 5 | 20 | R$ 2-5 |
| Padrão | 10 | 100 | R$ 20-50 |
| Médio | 10 | 500 | R$ 100-250 |
| Completo | 10 | 1000 | R$ 200-500 |
| Grande | 20 | 1000 | R$ 400-1000 |

---

## Checklist Antes de Executar

- [ ] Perguntas revisadas por outra pessoa
- [ ] Teste com 10 eleitores feito
- [ ] Limite de custo definido
- [ ] Amostra correta selecionada
- [ ] Tipo de entrevista apropriado
- [ ] Tempo disponível para acompanhar execução

---

## Próximos Passos

- [Interpretando Resultados](04-interpretando-resultados.md) - Analisar respostas
- [Primeiros Passos](01-primeiros-passos.md) - Voltar ao início
- [Glossário](../glossario.md) - Termos técnicos

---

*Última atualização: Janeiro 2026*
