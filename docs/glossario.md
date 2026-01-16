# Glossário de Termos

Definições dos principais termos utilizados no sistema Pesquisa Eleitoral DF 2026.

---

## A

### Agente Sintético
Perfil de eleitor gerado por IA que simula comportamento e opiniões de um eleitor brasileiro real. Cada agente tem 60+ atributos que definem sua identidade, valores e comportamento político.

### API (Application Programming Interface)
Interface de programação que permite que sistemas externos se comuniquem com o backend do sistema de pesquisa.

---

## C

### Chain of Thought (Cadeia de Pensamento)
Processo de 4 etapas que simula como um eleitor real processa informação:
1. **Filtro de Atenção** - O eleitor prestaria atenção?
2. **Viés de Confirmação** - Confirma ou ameaça suas crenças?
3. **Reação Emocional** - Como se sente a respeito?
4. **Decisão** - Qual é a resposta genuína?

### Cluster Socioeconômico
Classificação dos eleitores por perfil de renda e localização:
- **G1_alta**: Alta renda (Lago Sul, Lago Norte, Park Way)
- **G2_media_alta**: Média-alta (Plano Piloto, Águas Claras)
- **G3_media_baixa**: Média-baixa (Taguatinga, Guará, Núcleo Bandeirante)
- **G4_baixa**: Baixa renda (Ceilândia, Samambaia, Sol Nascente)

### Conflito Identitário
Quando um eleitor tem posições que não são 100% consistentes ideologicamente. Ex: conservador em costumes mas progressista em economia.

---

## E

### Eleitor
Ver [Agente Sintético](#agente-sintético).

### Entrevista
Sessão de pesquisa onde um conjunto de perguntas é aplicado a um grupo de eleitores selecionados. Pode ser:
- **Quantitativa**: Perguntas com respostas estruturadas (escala, múltipla escolha)
- **Qualitativa**: Perguntas abertas para respostas livres
- **Mista**: Combinação de ambos os tipos

### Escala Likert
Tipo de pergunta que pede ao respondente para avaliar algo em uma escala numérica, geralmente de 1 a 10 ou 1 a 5.

### Estilo de Decisão
Como o eleitor toma decisões políticas:
- **Identitário**: "Voto no meu grupo/tribo"
- **Pragmático**: "Voto em quem resolve meus problemas"
- **Moral**: "Voto em quem representa meus valores"
- **Econômico**: "Voto em quem melhora minha situação financeira"
- **Emocional**: "Voto em quem me faz sentir bem/seguro"

---

## F

### Filtros
Critérios para selecionar subconjuntos de eleitores. O sistema suporta 20+ filtros simultâneos incluindo idade, região, renda, orientação política, etc.

---

## I

### Insight
Descoberta ou padrão identificado pela análise de IA nos resultados da pesquisa. Pode ser um destaque, alerta, tendência ou correlação.

### Interesse Político
Nível de engajamento do eleitor com assuntos políticos:
- **Baixo**: Não acompanha notícias, vota por obrigação
- **Médio**: Acompanha superficialmente, forma opinião básica
- **Alto**: Acompanha ativamente, opina e debate

---

## J

### JWT (JSON Web Token)
Formato de token usado para autenticação na API. Obtido no login e enviado em cada requisição.

---

## M

### Mapa de Calor (Heatmap)
Visualização que mostra intensidade de emoções ou respostas usando cores. Vermelho = intenso, Azul = fraco.

### Memória
Registro de interações anteriores de um eleitor. Permite que o agente "lembre" de respostas anteriores e mantenha consistência.

---

## O

### Orientação Política
Posicionamento no espectro político:
- **Esquerda**: Progressista, pró-estado, redistributivo
- **Centro-esquerda**: Progressista moderado
- **Centro**: Posições mistas, sem preferência ideológica forte
- **Centro-direita**: Conservador moderado
- **Direita**: Conservador, pró-mercado, tradicional

---

## P

### Pergunta
Unidade de uma entrevista. Tipos suportados:
- **Aberta**: Resposta livre em texto
- **Escala**: Número de 1 a N
- **Múltipla Escolha**: Selecionar uma opção
- **Sim/Não**: Resposta binária
- **Ranking**: Ordenar opções por preferência

### Ponto de Ruptura
Evento ou situação que faria um eleitor mudar sua posição política. Ex: "Mudaria de voto se descobrisse corrupção no meu candidato".

### Posição Bolsonaro
Indicador de alinhamento com o ex-presidente Bolsonaro:
- **apoiador_forte**: Bolsonarista convicto
- **apoiador_moderado**: Simpatizante, mas com ressalvas
- **neutro**: Sem opinião forte
- **critico_moderado**: Discorda, mas sem rejeição total
- **critico_forte**: Antibolsonarista convicto

---

## R

### RA (Região Administrativa)
Divisão territorial do Distrito Federal. São 33 RAs, incluindo Plano Piloto, Taguatinga, Ceilândia, Samambaia, etc.

### Regras Anti-Convergência
Instruções no prompt que impedem o agente de dar respostas "politicamente corretas" ou equilibradas. Força autenticidade ao perfil.

---

## S

### Susceptibilidade a Desinformação
Escala de 1-10 que indica quão propenso o eleitor é a acreditar em notícias falsas ou teorias conspiratórias.

### Sentimento
Classificação emocional de uma resposta:
- **Positivo**: Esperança, otimismo, segurança
- **Negativo**: Medo, raiva, frustração
- **Neutro**: Indiferença, apatia

---

## T

### Tolerância a Nuances
Capacidade do eleitor de aceitar posições complexas ou "meio-termo":
- **Baixa**: Pensamento binário ("ou isso ou aquilo")
- **Média**: Aceita alguma complexidade
- **Alta**: Confortável com ambiguidade

### Token
Unidade de medida usada pelos modelos de IA. Aproximadamente 4 caracteres em português. Usado para calcular custos.

---

## V

### Viés Cognitivo
Padrão de pensamento que distorce a avaliação racional:
- **Confirmação**: Aceita informação que confirma crenças
- **Aversão à Perda**: Medo de perder > desejo de ganhar
- **Tribalismo**: Defende "seu grupo" independente de fatos
- **Efeito Halo**: Generaliza uma qualidade para tudo
- **Ancoragem**: Fixa-se na primeira informação recebida

### Voto Silencioso
Intenção de voto que o eleitor não declara publicamente. Identificado quando há discrepância entre o perfil e a resposta declarada.

---

## Modelos de IA

### Claude Opus 4.5
Modelo mais avançado da Anthropic. Usado para análises complexas e geração de insights. Mais caro.

### Claude Sonnet 4.5
Modelo intermediário. Usado para entrevistas padrão. Equilíbrio custo-qualidade.

### Claude Haiku
Modelo mais rápido e barato. Usado para tarefas simples ou fallback.

---

## Custos (Referência)

| Modelo | Entrada (1M tokens) | Saída (1M tokens) |
|--------|--------------------|--------------------|
| Opus 4.5 | $15 USD | $75 USD |
| Sonnet 4.5 | $3 USD | $15 USD |
| Haiku | $0.25 USD | $1.25 USD |

**Conversão**: 1 USD = R$ 6,00 (configurável)

---

*Última atualização: Janeiro 2026*
