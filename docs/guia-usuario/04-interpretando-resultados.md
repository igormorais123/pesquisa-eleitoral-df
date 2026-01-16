# Interpretando Resultados

Como analisar e extrair insights das pesquisas.

---

## Visão Geral dos Resultados

Após uma entrevista, você terá acesso a:

1. **Estatísticas Quantitativas**: Médias, medianas, distribuições
2. **Análise de Sentimentos**: Positivo, negativo, neutro
3. **Correlações**: Relações entre variáveis
4. **Insights Automáticos**: Descobertas geradas por IA
5. **Dados Brutos**: Todas as respostas individuais

---

## Estatísticas Básicas

### Média

**O que é:** Soma de todos os valores dividida pelo total.

**Exemplo:** Se 100 eleitores deram notas de 0-10 para o governador:
- Soma das notas: 450
- Média: 450 ÷ 100 = **4,5**

**Quando usar:** Para ter uma visão geral rápida.

**Cuidado:** A média pode ser distorcida por valores extremos.

---

### Mediana

**O que é:** O valor do meio quando todos estão ordenados.

**Exemplo:** Notas ordenadas: 1, 2, 3, 4, **5**, 6, 7, 8, 9
- Mediana: **5**

**Quando usar:** Quando há muitos valores extremos (outliers).

**Vantagem:** Mais robusta que a média.

---

### Moda

**O que é:** O valor mais frequente.

**Exemplo:** Se "Candidato B" foi a resposta mais escolhida (35%), a moda é "Candidato B".

**Quando usar:** Para perguntas de múltipla escolha.

---

### Desvio Padrão

**O que é:** Quanto as respostas variam da média.

- **Desvio baixo (< 2)**: Respostas concentradas, consenso
- **Desvio alto (> 3)**: Respostas dispersas, polarização

**Exemplo:**
- Média: 5, Desvio: 1 → Maioria respondeu entre 4 e 6
- Média: 5, Desvio: 4 → Respostas espalhadas de 1 a 9

**Quando usar:** Para medir polarização/consenso.

---

## Gráficos e Visualizações

### Gráfico de Barras

**Mostra:** Distribuição de respostas categóricas.

**Como ler:**
- Barra mais alta = resposta mais frequente
- Compare tamanhos para ver diferenças

**Exemplo:** Intenção de voto
```
Candidato A: ████████████ 35%
Candidato B: ██████████████████ 45%
Candidato C: ████ 12%
Branco/Nulo: ███ 8%
```

---

### Gráfico de Pizza

**Mostra:** Proporções de um todo.

**Como ler:**
- Fatias maiores = mais respondentes
- Use para visualizar até 5-6 categorias

**Quando evitar:** Muitas categorias ou valores próximos.

---

### Histograma

**Mostra:** Distribuição de valores numéricos (escala).

**Como ler:**
- Eixo X: valores da escala (0-10)
- Eixo Y: quantidade de respostas
- Formato da curva indica padrão

**Padrões comuns:**
- **Normal (sino)**: Maioria no centro
- **Bimodal (dois picos)**: Polarização
- **Assimétrica**: Tendência para um lado

---

### Mapa de Calor (Heatmap)

**Mostra:** Intensidade em duas dimensões.

**Exemplo:** Sentimento por região
```
              | Positivo | Neutro | Negativo
--------------+----------+--------+----------
Plano Piloto  |   🟢🟢   |   🟡   |    🔴
Taguatinga    |    🟢    |  🟡🟡  |   🔴🔴
Ceilândia     |    🟢    |   🟡   |  🔴🔴🔴
```

**Como ler:**
- Verde/Azul = valores altos/positivos
- Vermelho = valores baixos/negativos
- Identifique padrões por linha/coluna

---

## Análise de Sentimentos

### Classificação

Respostas abertas são classificadas automaticamente:

| Classificação | Indica | Exemplo |
|---------------|--------|---------|
| **Positivo** | Aprovação, esperança | "Gosto do trabalho dele" |
| **Negativo** | Rejeição, frustração | "É um desastre" |
| **Neutro** | Indiferença, equilíbrio | "Tanto faz" |
| **Misto** | Ambivalência | "Tem coisas boas e ruins" |

### Proporções

O sistema mostra a proporção de cada sentimento:

```
Positivo: 25% ████████
Negativo: 45% ████████████████
Neutro:   20% ██████
Misto:    10% ███
```

### Palavras Frequentes

Lista as palavras mais usadas nas respostas:

```
1. "corrupção" (47 menções)
2. "saúde" (38 menções)
3. "segurança" (35 menções)
4. "emprego" (29 menções)
5. "transporte" (24 menções)
```

**Dica:** Palavras frequentes revelam preocupações principais.

---

## Correlações

### O Que É Correlação

Mede se duas variáveis estão relacionadas:

- **+1**: Relação positiva perfeita (quando X sobe, Y sobe)
- **0**: Sem relação
- **-1**: Relação negativa perfeita (quando X sobe, Y desce)

### Interpretando Valores

| Correlação | Força | Significado |
|------------|-------|-------------|
| 0.8 a 1.0 | Muito forte | Variáveis muito ligadas |
| 0.6 a 0.8 | Forte | Relação clara |
| 0.4 a 0.6 | Moderada | Alguma relação |
| 0.2 a 0.4 | Fraca | Relação tênue |
| 0.0 a 0.2 | Muito fraca | Praticamente independentes |

### Exemplos Práticos

```
Correlação: Renda × Voto no candidato A = +0.65
→ Quanto maior a renda, mais provável votar em A

Correlação: Idade × Rejeição ao candidato B = +0.45
→ Eleitores mais velhos tendem a rejeitar B

Correlação: Escolaridade × Interesse político = +0.72
→ Maior escolaridade = maior interesse político
```

### Cuidado: Correlação ≠ Causa

**Exemplo errado:**
"Comer sorvete causa afogamento" (correlação alta no verão)

**Na verdade:**
Calor aumenta ambos (variável oculta)

**Sempre pergunte:** Existe uma explicação causal plausível?

---

## Insights Automáticos

### Tipos de Insight

O sistema gera insights classificados por tipo:

| Tipo | Ícone | Significado |
|------|-------|-------------|
| **Destaque** | 🔍 | Descoberta importante |
| **Alerta** | ⚠️ | Situação que merece atenção |
| **Tendência** | 📈 | Padrão emergente |
| **Correlação** | 🔗 | Relação entre variáveis |

### Exemplos de Insights

**Destaque:**
```
🔍 73% dos eleitores de G4 (baixa renda) rejeitam o
   candidato da situação, comparado a 45% na média geral.
```

**Alerta:**
```
⚠️ Identificados 12% de "votos silenciosos" entre
   eleitores de centro-direita - podem não declarar
   intenção real.
```

**Tendência:**
```
📈 Candidato B apresenta crescimento consistente
   entre eleitores de 18-25 anos em todas as
   regiões analisadas.
```

**Correlação:**
```
🔗 Forte correlação (0.78) entre "medo de violência"
   e voto em candidatos que priorizam segurança.
```

---

## Conceitos Avançados

### Votos Silenciosos

**O que são:** Eleitores que não declaram voto real.

**Como identificar:**
- Perfil sugere posição X, mas declara Y ou "não sei"
- Discrepância entre perfil e resposta
- Alta taxa de "prefiro não responder"

**Por que importa:**
- Pesquisas tradicionais erram por não capturar
- Podem decidir eleições apertadas

**Exemplo:**
```
Eleitor: Centro-direita, cristão, renda alta
Resposta declarada: "Não sei ainda"
Análise: Provavelmente voto em candidato conservador
         mas não quer declarar publicamente
```

---

### Pontos de Ruptura

**O que são:** Eventos que fariam eleitor mudar de lado.

**Exemplos identificados:**
```
Grupo: Apoiadores moderados do candidato A
Ponto de ruptura: "Escândalo de corrupção comprovado"
Probabilidade de mudança: 65%

Grupo: Críticos moderados do candidato B
Ponto de ruptura: "Proposta convincente de emprego"
Probabilidade de mudança: 45%
```

**Por que importa:**
- Identifica vulnerabilidades de cada candidato
- Sugere estratégias de comunicação
- Prevê impacto de eventos futuros

---

### Chain of Thought

Cada resposta inclui o processo cognitivo do eleitor:

```json
{
  "etapa1_atencao": {
    "prestou_atencao": true,
    "motivo": "Afeta meu bairro"
  },
  "etapa2_vies": {
    "confirma_crencas": false,
    "ameaca_valores": true
  },
  "etapa3_emocional": {
    "sentimento": "raiva",
    "intensidade": 7
  }
}
```

**Use para:**
- Entender POR QUE respondeu assim
- Filtrar respostas por tipo de reação
- Identificar temas que geram emoção

---

## Exportando Dados

### Formatos Disponíveis

| Formato | Uso |
|---------|-----|
| **Excel (.xlsx)** | Análise em planilha, tabelas dinâmicas |
| **PDF** | Relatórios para apresentação |
| **JSON** | Integração com outros sistemas |
| **CSV** | Importar em qualquer software |

### O Que Está Incluído

- Todas as respostas individuais
- Estatísticas calculadas
- Insights gerados
- Metadados da pesquisa

---

## Checklist de Análise

Antes de tirar conclusões:

- [ ] Verificar tamanho da amostra (suficiente?)
- [ ] Olhar desvio padrão (há consenso ou polarização?)
- [ ] Comparar média com mediana (outliers?)
- [ ] Ler respostas abertas (contexto qualitativo)
- [ ] Verificar correlações fazem sentido
- [ ] Considerar vieses da amostra
- [ ] Cruzar com dados de outras fontes

---

## Erros Comuns

### 1. Generalizar de Amostras Pequenas

```
❌ "100% dos eleitores rejeitam X" (amostra: 3 pessoas)
✅ "Na amostra de 3 eleitores, todos rejeitaram X"
```

### 2. Ignorar Margem de Erro

Com 400 eleitores, margem é ~5%.

```
❌ "Candidato A tem 47% e B tem 45%, A vence"
✅ "Candidato A tem 47% (±5%) e B tem 45% (±5%),
    empate técnico"
```

### 3. Confundir Correlação com Causa

```
❌ "Evangélicos votam em X porque são evangélicos"
✅ "Há correlação entre ser evangélico e votar em X,
    possivelmente mediada por valores conservadores"
```

### 4. Ignorar Contexto Qualitativo

```
❌ Média de satisfação: 6.5 (parece ok)
✅ Média 6.5, mas 40% deu nota 2 ou menos
   (há um grupo muito insatisfeito)
```

---

## Próximos Passos

- [Primeiros Passos](01-primeiros-passos.md) - Voltar ao básico
- [Criando Entrevistas](03-criando-entrevistas.md) - Melhorar perguntas
- [Sistema Cognitivo](../cognicao/4-etapas-cognitivas.md) - Entender as respostas
- [Glossário](../glossario.md) - Termos técnicos

---

*Última atualização: Janeiro 2026*
