# Spec-Driven Development (Context Compression)

> Baseado no talk "Context Engineering" de Steven Hicks (Netflix)
> Video: https://www.youtube.com/watch?v=eIoohUmYpGI

## O Problema

Geramos código que não entendemos. Testes passam, funciona, shippamos. Mas quando sistemas falham em produção, precisamos entender o código para debugar.

**AI destruiu o equilíbrio**: A complexidade costumava acumular lentamente o suficiente para refatorar. Agora é instantâneo.

## Simple vs Easy (Rich Hickey)

| Conceito | Definição | Exemplo |
|----------|-----------|---------|
| **Simple** | Uma dobra, sem emaranhamento. Cada peça faz uma coisa. | Função pura, módulo desacoplado |
| **Easy** | Adjacente, ao alcance, sem esforço. | Copy-paste, npm install, AI generate |

> "Simple é sobre estrutura. Easy é sobre proximidade."

### A Armadilha

- AI é o "ultimate easy button"
- Faz o caminho fácil tão sem atrito que nem consideramos o simples
- **Cada vez que escolhemos easy, escolhemos velocidade agora, complexidade depois**

---

## Complexidade Essencial vs Acidental (Fred Brooks)

### Essencial
A dificuldade fundamental do problema real.
- Usuários precisam pagar por coisas
- Pedidos devem ser cumpridos
- É por isso que o software existe

### Acidental
Tudo que adicionamos ao longo do caminho.
- Workarounds
- Código defensivo
- Frameworks
- Abstrações que fizeram sentido há um tempo

### O Problema com AI

**AI não distingue entre elas.** Cada padrão no codebase é tratado igual:
- Check de autenticação na linha 47 → padrão a preservar
- Código gRPC estranho agindo como GraphQL → também padrão a preservar
- Technical debt não registra como debt → é só mais código

---

## A Armadilha do "Vibecoding"

### O que acontece em conversas iterativas

```
Turn 1:  "Add auth"           → auth.js limpo
Turn 5:  "Add OAuth too"      → auth.js + oauth.js
Turn 10: "Sessions broken"    → conflitos, fixes
Turn 20: Você não está discutindo mais.
         Você está gerenciando contexto complexo.
```

### Sintomas

- Dead code de abordagens abandonadas
- Testes "consertados" fazendo-os passar (não funcionando de verdade)
- Fragmentos de 3 soluções diferentes
- Momentos "wait actually" que deixam código morto
- **Não há resistência a decisões arquiteturais ruins**

### Regra Anti-Vibecoding

> Após 10 turns, PARE e avalie se está gerenciando contexto ou resolvendo o problema.

---

## A Solução: Abordagem de 3 Fases

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPEC-DRIVEN DEVELOPMENT                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   FASE 1          FASE 2           FASE 3                       │
│   RESEARCH        PLANNING         IMPLEMENTATION               │
│   ─────────       ─────────        ─────────────                │
│                                                                  │
│   Alimentar       Criar plano      Executar com                 │
│   contexto        detalhado        especificação                │
│   upfront         "paint by        clara                        │
│                   numbers"                                       │
│        │               │                │                        │
│        ▼               ▼                ▼                        │
│   [CHECKPOINT]    [CHECKPOINT]     [REVIEW]                     │
│   Validar         Aprovar          Verificar                    │
│   análise         arquitetura      conformidade                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: RESEARCH (Pesquisa)

### Input
- Diagramas de arquitetura
- Documentação existente
- Threads de Slack/discussões
- PRs anteriores relevantes
- **TODO o contexto que será relevante**

### Processo

1. **Alimentar tudo upfront** - não iterar descobrindo
2. **Usar agente para analisar** codebase e mapear componentes
3. **NÃO é one-shot** - interrogar iterativamente:
   - "E quanto ao caching?"
   - "Como isso trata falhas?"
4. **Corrigir quando análise está errada**
5. **Fornecer contexto faltante**

### Output

Documento de pesquisa único:
- O que existe
- O que conecta com o quê
- O que a mudança vai afetar

### ⚠️ CHECKPOINT HUMANO CRÍTICO

> "Este é o momento de maior alavancagem em todo o processo.
> Erros pegos aqui previnem desastres depois."

**Validar**:
- A análise corresponde à realidade?
- Algo foi esquecido?
- Dependências estão corretas?

---

## Fase 2: PLANNING (Planejamento)

### Input
- Documento de pesquisa validado
- Requisitos do negócio
- Constraints técnicos

### Processo

Criar plano de implementação **tão detalhado** que:
- Qualquer desenvolvedor pode seguir
- É "paint by numbers"
- Se copiar linha por linha, funciona

### Conteúdo do Plano

- Estrutura real de código
- Assinaturas de funções
- Definições de tipo
- Fluxo de dados
- Ordem de implementação

### Decisões Aqui

Este é o momento de:
- ✅ Fazer decisões arquiteturais importantes
- ✅ Garantir lógica complexa correta
- ✅ Verificar requisitos de negócio
- ✅ Definir boundaries de serviço
- ✅ Prevenir acoplamento desnecessário

### A Mágica

> "Podemos validar este plano em minutos e saber exatamente o que será construído."

---

## Fase 3: IMPLEMENTATION (Implementação)

### Por que é simples agora?

- AI tem especificação clara para seguir
- Contexto permanece limpo e focado
- Prevenimos o espiral de complexidade
- **Em vez de 50 mensagens de código evolutivo, temos 3 outputs focados**

### Benefício

- Pode usar **background agent**
- Todo o pensamento foi feito antes
- Revisão é rápida: apenas verificar conformidade com o plano
- Não precisa entender se algo foi "inventado"

---

## Caso Especial: Refatorações Grandes

### Quando AI não consegue ajudar diretamente

Se o código está muito emaranhado (como no exemplo de autorização da Netflix):

1. **Faça uma migração manual primeiro**
   - Sem AI
   - Apenas lendo código
   - Entendendo dependências
   - Fazendo mudanças para ver o que quebra

2. **Use essa migração como SEED**
   - Alimente o PR manual no processo de pesquisa
   - AI pode ver como uma migração limpa se parece
   - Use como padrão para o resto

3. **Interrogue para cada caso**
   - "E quanto a este? É criptografado?"
   - "Este tem dependências diferentes?"
   - Forneça contexto extra para cada variação

> "Tivemos que GANHAR o entendimento antes de codificá-lo no processo."

---

## O Knowledge Gap

```
Geração:     Milhares de linhas em segundos
Entendimento: Horas, dias, talvez nunca
```

### O Perigo Oculto

> "Cada vez que pulamos o pensamento para acompanhar a velocidade de geração,
> não estamos apenas adicionando código que não entendemos.
> Estamos PERDENDO nossa habilidade de reconhecer problemas."

O instinto que diz "isso está ficando complexo" **atrofia** quando você não entende seu próprio sistema.

### Pattern Recognition

- Vem da experiência
- De estar às 3h da manhã debugando
- De manter código de outra pessoa
- AI não codifica lições de falhas passadas

---

## Princípios Fundamentais

### 1. Não há Silver Bullet
Não é prompts melhores, modelos melhores, ou specs melhores. É o trabalho de entender seu sistema profundamente o suficiente para mudá-lo com segurança.

### 2. Software é Esforço Humano
A parte difícil nunca foi digitar o código. Foi saber O QUE digitar.

### 3. A Pergunta Real
Não é SE vamos usar AI. É se ainda vamos ENTENDER nossos sistemas quando AI estiver escrevendo a maior parte do código.

---

## Checklist de Verificação

Antes de qualquer implementação significativa:

- [ ] Fase 1 RESEARCH concluída?
- [ ] Checkpoint humano validou análise?
- [ ] Fase 2 PLANNING detalhado existe?
- [ ] Plano é "paint by numbers"?
- [ ] Distinção entre complexidade essencial e acidental feita?
- [ ] Não estamos "vibecoding" (>10 turns na mesma conversa)?
- [ ] Entendemos o que estamos construindo?

---

*Baseado em: "Context Engineering" - Steven Hicks (Netflix)*
*Referências: Rich Hickey "Simple Made Easy" (2011), Fred Brooks "No Silver Bullet" (1986)*
