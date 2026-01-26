# Manual de Engenharia de Contexto para Claude Code

> **Versão consolidada das técnicas de Cole Medin, metodologia dos Top 1% Agentic Engineers e práticas de gerenciamento de contexto persistente**

---

## Sumário

1. [Fundamentos da Engenharia de Contexto](#1-fundamentos-da-engenharia-de-contexto)
2. [As 5 Meta-Habilidades do Top 1%](#2-as-5-meta-habilidades-do-top-1-agentic-engineer)
3. [Arquitetura de Diretórios](#3-arquitetura-de-diretórios)
4. [Fluxo Prime-Implement-Validate](#4-fluxo-piv-prime-implement-validate)
5. [Sistema de Comandos Slash](#5-sistema-de-comandos-slash)
6. [Gerenciamento de Contexto Persistente](#6-gerenciamento-de-contexto-persistente)
7. [Templates e Artefatos](#7-templates-e-artefatos)
8. [Ciclo de Evolução do Sistema](#8-ciclo-de-evolução-do-sistema)
9. [Implementação Prática](#9-implementação-prática)

---

## 1. Fundamentos da Engenharia de Contexto

### O que é Engenharia de Contexto?

Engenharia de Contexto é a disciplina de **projetar e otimizar sistematicamente a informação fornecida a assistentes de codificação por inteligência artificial**. Diferente da engenharia de prompt tradicional, que foca em como formular perguntas, a engenharia de contexto cria um **ecossistema completo** de documentação, exemplos, regras, padrões e validações.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENGENHARIA DE CONTEXTO                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Prompt Engineering          Context Engineering               │
│   ─────────────────          ───────────────────                │
│                                                                 │
│   • Frases inteligentes       • Sistema completo                │
│   • Foco na pergunta          • Documentação + Exemplos         │
│   • Post-it com instruções    • Roteiro detalhado               │
│   • Espera improvisação       • Guia cada passo                 │
│   • Resultados variáveis      • Resultados consistentes         │
│                                                                 │
│   "Sticky note"         →     "Full screenplay"                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Por que a maioria das falhas de agentes acontece?

A maioria das falhas de assistentes de codificação por inteligência artificial **não são falhas do modelo** — são **falhas de contexto**:

| Problema | Causa Raiz | Solução |
|----------|------------|---------|
| Código fora do padrão | Falta de exemplos | Diretório `/examples` |
| Decisões arquiteturais erradas | Sem regras globais | Arquivo `CLAUDE.md` |
| Tarefas incompletas | Contexto ambíguo | Documentos de Requisitos de Produto |
| Erros repetidos | Sem aprendizado | Evolução sistemática de regras |
| Perda de foco | Degradação de contexto | Resets estratégicos |

---

## 2. As 5 Meta-Habilidades do Top 1% Agentic Engineer

### Diagrama Visual Consolidado

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TOP 1% AGENTIC ENGINEER                              │
│                5 Meta-Habilidades que Compõem ao Longo do Tempo         │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┐    ┌────────────────────────────────┐
│  1️⃣  DESENVOLVIMENTO           │    │  2️⃣  ARQUITETURA DE            │
│      ORIENTADO A               │    │      REGRAS MODULARES          │
│      DOCUMENTAÇÃO              │    │                                │
│                                │    │   Pare de jogar tudo em um     │
│   Documente ANTES de codar.    │    │   arquivo massivo.             │
│   Seu documento de requisitos  │    │   Divida por interesse,        │
│   é a fonte da verdade.        │    │   carregue apenas o relevante. │
│                                │    │                                │
│   ┌──────────┐                 │    │   .agents/                     │
│   │          │───► Auth       │    │     ├── reference/             │
│   │  PRD.md  │───► API        │    │     │   ├── components.md      │
│   │          │───► UI         │    │     │   ├── api.md             │
│   │          │───► Tests      │    │     │   └── deploy.md          │
│   └──────────┘                 │    │     └── AGENTS.md             │
│                                │    │                                │
│   NOVO PROJETO:                │    │   → Frontend? → components.md  │
│   Documento completo com       │    │   → API? → api.md              │
│   features em fases            │    │   → Contexto enxuto            │
│                                │    │   → Sem regras irrelevantes    │
│   PROJETO EXISTENTE:           │    │                                │
│   Documente código atual       │    │                                │
│   + próximos passos            │    │                                │
│                                │    │                                │
│   SEM DOCUMENTAÇÃO:            │    │                                │
│   → IA assume                  │    │                                │
│   → Contexto deriva            │    │                                │
│   → Você luta com a ferramenta │    │                                │
└────────────────────────────────┘    └────────────────────────────────┘

┌────────────────────────────────┐    ┌────────────────────────────────┐
│  3️⃣  TRANSFORME TUDO          │    │  4️⃣  O RESET DE CONTEXTO       │
│      EM COMANDOS               │    │                                │
│                                │    │   Planejamento e execução são  │
│   Se fizer algo mais de 2x,    │    │   conversas SEPARADAS.         │
│   transforme em comando.       │    │   Degradação de contexto       │
│   Seus fluxos viram            │    │   é real — inícios frescos     │
│   ferramentas reutilizáveis.   │    │   são importantes.             │
│                                │    │                                │
│   CAPTURA                      │    │   ┌──────┐   ┌─────┐   ┌──────┐│
│      ↓                         │    │   │ PLAN │──►│ DOC │──►│ EXEC ││
│   ┌─────────┐                  │    │   └──────┘   └─────┘   └──────┘│
│   │/commit  │                  │    │   Pesquisa   Todo      Limpar  │
│   │/review  │                  │    │   Design     contexto  conversa│
│   │/test    │                  │    │   Criar doc  capturado Início  │
│   └─────────┘                  │    │              de plano  fresco  │
│                                │    │                                │
│   EXEMPLOS:                    │    │   POR QUÊ?                     │
│   /commit                      │    │   Após muitas mensagens,       │
│   /review-pr                   │    │   agentes ficam sobrecarregados│
│   /generate-tests              │    │   e repetem erros/suposições.  │
│   /refactor                    │    │   Início fresco = foco nítido. │
│   /fix-types                   │    │                                │
│                                │    │                                │
│   Cada comando economiza       │    │                                │
│   milhares de teclas e torna   │    │                                │
│   seu sistema confiável        │    │                                │
│   + repetível.                 │    │                                │
└────────────────────────────────┘    └────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│  5️⃣  MENTALIDADE DE EVOLUÇÃO DO SISTEMA                               │
│                                                                        │
│   Todo bug é uma oportunidade de evoluir seu SISTEMA para codificação  │
│   por inteligência artificial.                                         │
│                                                                        │
│   ┌─────────┐     ┌───────────────┐     ┌─────────────┐               │
│   │  BUG!   │────►│ "O que        │────►│  + REGRA    │               │
│   │         │     │  corrigir?"   │     │             │               │
│   └─────────┘     └───────────────┘     └─────────────┘               │
│                                                                        │
│   Você pode corrigir:                                                  │
│   • Regras globais                                                     │
│   • Contexto sob demanda                                               │
│   • Comandos/fluxos de trabalho                                        │
│                                                                        │
│   EXEMPLOS:                                                            │
│   ┌────────────────────────────────────────────────────────────────┐  │
│   │ Bug: IA usa estilo de import errado                            │  │
│   │ → Nova regra: "Sempre use @/ para aliases de caminho"          │  │
│   ├────────────────────────────────────────────────────────────────┤  │
│   │ Bug: IA esquece de rodar testes                                │  │
│   │ → Atualizar plano estruturado para incluir seção de testes     │  │
│   ├────────────────────────────────────────────────────────────────┤  │
│   │ Bug: IA não entende fluxo de autenticação                      │  │
│   │ → Novo documento de contexto: auth-architecture.md             │  │
│   └────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│   O OBJETIVO: Cada vez que você desenvolve uma nova feature,           │
│               seu agente de codificação fica mais inteligente.         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Arquitetura de Diretórios

### Estrutura Recomendada (Context Engineering Intro)

```
projeto/
├── .claude/
│   ├── commands/                    # Comandos slash personalizados
│   │   ├── generate-prp.md         # Gera Documentos de Requisitos de Produto
│   │   ├── execute-prp.md          # Executa implementação
│   │   ├── commit.md               # Commit padronizado
│   │   ├── review.md               # Code review
│   │   └── validate.md             # Validação completa
│   │
│   ├── rules/                       # Regras modulares por domínio
│   │   ├── api.md                  # Regras para trabalho com APIs
│   │   ├── components.md           # Regras de componentes
│   │   └── security.md             # Regras de segurança
│   │
│   └── settings.local.json         # Permissões do Claude Code
│
├── .agents/                         # Contexto para agentes
│   ├── plans/                      # Planos de implementação
│   └── reference/                  # Documentação de referência
│
├── PRPs/                            # Product Requirements Prompts
│   ├── templates/
│   │   └── prp_base.md             # Template base para PRPs
│   └── EXAMPLE_feature.md          # Exemplo de PRP completo
│
├── examples/                        # Exemplos de código (CRÍTICO!)
│   ├── README.md                   # Explica cada exemplo
│   ├── api-client.py               # Padrão de cliente de API
│   ├── component.tsx               # Padrão de componente
│   └── tests/                      # Padrões de teste
│
├── CLAUDE.md                        # Regras globais (carregado automaticamente)
├── INITIAL.md                       # Template para requisições de features
└── README.md                        # Documentação do projeto
```

### Estrutura Avançada (Habit Tracker / PIV Loop)

```
projeto/
├── .claude/
│   ├── commands/
│   │   ├── core_piv_loop/          # Comandos do ciclo PIV
│   │   │   ├── prime.md            # Carregar contexto do projeto
│   │   │   ├── plan-feature.md     # Criar plano de implementação
│   │   │   └── execute.md          # Executar plano passo a passo
│   │   │
│   │   ├── validation/             # Comandos de validação
│   │   │   ├── validate.md         # Testes, lint, coverage, build
│   │   │   ├── code-review.md      # Review técnico
│   │   │   ├── code-review-fix.md  # Corrigir issues do review
│   │   │   ├── execution-report.md # Relatório pós-implementação
│   │   │   └── system-review.md    # Análise de processo
│   │   │
│   │   ├── github_bug_fix/         # Correção de bugs
│   │   │   ├── rca.md              # Root Cause Analysis
│   │   │   └── implement-fix.md    # Implementar correção
│   │   │
│   │   ├── commit.md               # Commits atômicos com tags
│   │   ├── init-project.md         # Inicializar dependências
│   │   └── create-prd.md           # Gerar documento de requisitos
│   │
│   └── PRD.md                       # Documento de Requisitos do Produto
│
├── .agents/
│   └── plans/                       # Planos gerados
│
├── backend/                         # Código do backend
├── frontend/                        # Código do frontend
│
├── CLAUDE.md                        # Regras globais
├── PIVLoopDiagram.png              # Diagrama do fluxo PIV
└── README.md
```

---

## 4. Fluxo PIV (Prime-Implement-Validate)

### Diagrama do Ciclo PIV

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CICLO PIV                                     │
│                  Prime → Implement → Validate                           │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────┐
                    │         PRIME           │
                    │   Carregar Contexto     │
                    │                         │
                    │  • Ler CLAUDE.md        │
                    │  • Ler PRD.md           │
                    │  • Analisar codebase    │
                    │  • Identificar padrões  │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │      PLAN-FEATURE       │
                    │   Criar Plano Detalhado │
                    │                         │
                    │  • Pesquisar requisitos │
                    │  • Definir componentes  │
                    │  • Identificar riscos   │
                    │  • Criar checklist      │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │        IMPLEMENT        │
                    │   Executar Passo a Passo│
                    │                         │
                    │  • Seguir plano         │
                    │  • Código incremental   │
                    │  • Testes junto         │
                    │  • Commits atômicos     │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │        VALIDATE         │◄────────────────┐
                    │   Verificação Completa  │                 │
                    │                         │                 │
                    │  • Rodar testes         │   FALHOU?       │
                    │  • Lint/format          │   ────────►     │
                    │  • Coverage check       │   Corrigir      │
                    │  • Build frontend       │   e repetir     │
                    └───────────┬─────────────┘                 │
                                │                               │
                                │ PASSOU                        │
                                ▼                               │
                    ┌─────────────────────────┐                 │
                    │      CODE REVIEW        │─────────────────┘
                    │   Review Automatizado   │   (se issues)
                    │                         │
                    │  • Análise técnica      │
                    │  • Padrões seguidos?    │
                    │  • Segurança ok?        │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │    SYSTEM EVOLUTION     │
                    │   Aprender com Erros    │
                    │                         │
                    │  • Documentar issues    │
                    │  • Atualizar regras     │
                    │  • Melhorar comandos    │
                    └─────────────────────────┘
```

### Comandos do Ciclo PIV

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/core_piv_loop:prime` | Carrega contexto do projeto e entendimento da base de código | Início de sessão |
| `/core_piv_loop:plan-feature` | Cria plano de implementação completo com análise da base de código | Antes de implementar |
| `/core_piv_loop:execute` | Executa plano de implementação passo a passo | Após aprovação do plano |
| `/validation:validate` | Roda testes, lint, coverage e build | Após implementação |
| `/validation:code-review` | Review técnico nos arquivos alterados | Após validação passar |
| `/validation:code-review-fix` | Corrige issues encontrados no review | Se houver problemas |
| `/validation:execution-report` | Gera relatório após implementar feature | Fim da implementação |
| `/validation:system-review` | Analisa implementação versus plano para melhorias de processo | Retrospectiva |

---

## 5. Sistema de Comandos Slash

### Estrutura de um Comando

Os comandos ficam em `.claude/commands/nome-comando.md`:

```markdown
# Título do Comando

Descrição do que o comando faz e quando usar.

## Instruções

1. Passo específico que a IA deve seguir
2. Outro passo com detalhes
3. Validação que deve acontecer

## Contexto Necessário

- Arquivos que devem ser lidos
- Informações que devem ser coletadas

## Output Esperado

Descrição do que deve ser produzido.

## Notas

- Considerações especiais
- Casos de borda
```

### Exemplos de Comandos Essenciais

#### `/generate-prp` - Gerar Documento de Requisitos

```markdown
# Generate PRP (Product Requirements Prompt)

Gere um PRP completo para implementação de feature com pesquisa completa.
Garanta que o contexto seja passado ao agente de IA para permitir 
auto-validação e refinamento iterativo.

## Processo

1. **Leia o arquivo de feature primeiro** para entender:
   - O que precisa ser criado
   - Como os exemplos fornecidos ajudam
   - Outras considerações

2. **Pesquise a base de código**:
   - Identifique padrões existentes
   - Encontre implementações similares
   - Note convenções de nomenclatura

3. **Colete documentação**:
   - APIs relevantes
   - Bibliotecas utilizadas
   - Integrações necessárias

4. **ULTRATHINK antes de escrever**:
   - Planeje a abordagem
   - Identifique riscos
   - Defina critérios de sucesso

5. **Crie o PRP** seguindo o template em `PRPs/templates/prp_base.md`

6. **Pontue o PRP** (1-10) baseado na confiança de sucesso em implementação de uma passada

## Argumento

$ARGUMENTS = caminho para arquivo INITIAL.md

## Output

Arquivo em `PRPs/nome-feature.md` com:
- Contexto completo
- Passos de implementação
- Comandos de validação
- Critérios de sucesso
```

#### `/execute-prp` - Executar Implementação

```markdown
# Execute PRP (Implementar Feature)

Implemente uma feature usando o arquivo PRP especificado.

## Processo

1. **Leia o PRP completo** - entenda todos os requisitos

2. **Pense profundamente antes de executar** - crie plano mental

3. **Crie plano de implementação**:
   - Divida em passos menores
   - Use TodoWrite para rastrear progresso
   - Identifique padrões a seguir do código existente

4. **Execute cada passo**:
   - Implemente incrementalmente
   - Valide após cada componente
   - Mantenha commits atômicos

5. **Rode validação** após cada fase significativa

## Argumento

$ARGUMENTS = caminho para arquivo PRP

## Se validação falhar

Use padrões de erro no PRP para corrigir e tentar novamente.
Continue iterando até todos os critérios de sucesso serem atingidos.
```

#### `/commit` - Commit Padronizado

```markdown
# Commit Atômico

Crie um commit atômico com tag apropriada.

## Tags Disponíveis

| Tag | Uso |
|-----|-----|
| feat | Nova funcionalidade |
| fix | Correção de bug |
| docs | Apenas documentação |
| style | Formatação, sem mudança de código |
| refactor | Refatoração sem mudança de comportamento |
| test | Adição ou correção de testes |
| chore | Tarefas de manutenção |

## Formato

```
tag(escopo): descrição curta

[corpo opcional com mais detalhes]
```

## Processo

1. Analise mudanças staged
2. Determine tag apropriada
3. Identifique escopo (componente/módulo)
4. Escreva descrição clara e concisa
5. Execute git commit
```

---

## 6. Gerenciamento de Contexto Persistente

### O Problema da Janela de Contexto

Assistentes de inteligência artificial têm limite de memória (janela de contexto). Quando excedido:
- Dados antigos são descartados
- Qualidade da análise cai
- Erros aumentam

```
┌─────────────────────────────────────────────────────────────────┐
│                   PROBLEMA DA JANELA DE CONTEXTO                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     Janela de Contexto                                          │
│     ┌─────────────────────────────────────────────┐            │
│     │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░│            │
│     └─────────────────────────────────────────────┘            │
│                    ↑                                            │
│            Limite alcançado                                     │
│                                                                 │
│     Novos dados entram → Dados antigos saem                     │
│                                                                 │
│     50 transcrições ────► LIMITE: 10-15 aceitas                │
│                                                                 │
│     Qualidade ─────────────────────────────┐                   │
│              ↘                              │                   │
│               ↘                             │                   │
│                ↘____________________________│ Dados processados │
│                                                                 │
│     → Análise falha, inconsistências, erros repetidos          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### A Solução: Notas Externas Persistentes

Use arquivos externos que persistem quando a memória da IA reseta:

```
┌─────────────────────────────────────────────────────────────────┐
│                   SOLUÇÃO: NOTAS EXTERNAS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    Os 4 Componentes:                                            │
│                                                                 │
│    📁 DADOS FONTE          📋 ARQUIVO DE CONTEXTO               │
│    Transcrições ou         Lembrete do objetivo                 │
│    emails em pasta         lido após cada reset                 │
│                                                                 │
│    ✅ ARQUIVO DE TAREFAS   💡 ARQUIVO DE INSIGHTS               │
│    Rastreia o que foi      Output final com                     │
│    feito e o que falta     descobertas                          │
│                                                                 │
│    O Ciclo:                                                     │
│                                                                 │
│    ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│    │ Processar│──►│ Atualizar│──►│ Memória  │──►│ Ler      │  │
│    │ Arquivos │   │ Notas    │   │ Limpa    │   │ Notas    │  │
│    │          │   │          │   │          │   │          │  │
│    │ TRABALHO │   │ SALVAR   │   │ RESET    │   │ RETOMAR  │  │
│    └──────────┘   └──────────┘   └──────────┘   └──────────┘  │
│         ▲                                             │         │
│         └─────────────────────────────────────────────┘         │
│                                                                 │
│    20-40 minutos de trabalho contínuo,                         │
│    qualidade permanece consistente.                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Estrutura de Arquivos para Contexto Persistente

```
projeto/
├── .context/
│   ├── context.md      # Objetivo e regras da análise
│   ├── todos.md        # Progresso: feito/pendente
│   └── insights.md     # Descobertas acumuladas
│
└── dados/
    └── transcricoes/   # Arquivos a processar
```

### Template: context.md

```markdown
# Contexto da Análise

## Objetivo
[Descreva claramente o que está sendo analisado e por quê]

## Regras de Extração
- [Regra 1: O que extrair]
- [Regra 2: O que ignorar]
- [Regra 3: Formato de output]

## Instruções de Continuação
Após qualquer reset de memória:
1. Leia este arquivo primeiro
2. Leia todos.md para ver progresso
3. Leia insights.md para contexto acumulado
4. Continue de onde parou
```

### Template: todos.md

```markdown
# Lista de Tarefas

## Concluídas
- [x] arquivo1.txt - Processado em 2024-01-15
- [x] arquivo2.txt - Processado em 2024-01-15

## Pendentes
- [ ] arquivo3.txt
- [ ] arquivo4.txt
- [ ] arquivo5.txt

## Notas
[Observações sobre o progresso]
```

### Template: insights.md

```markdown
# Insights Acumulados

## Resumo Executivo
[Atualizado conforme análise progride]

## Descobertas por Categoria

### Categoria 1
- Insight A
- Insight B

### Categoria 2
- Insight C
- Insight D

## Padrões Identificados
[Padrões que emergiram da análise]

## Próximos Passos
[O que fazer com esses insights]
```

### Prompt para Análise com Contexto Persistente

```markdown
Quero que você analise todas as transcrições de reunião nesta pasta 
para encontrar padrões em como clientes descrevem seus problemas, 
que perguntas fazem e que preocupações levantam.

Antes de começar:
1. Crie um arquivo context.md contendo o objetivo desta análise
2. Crie um arquivo todos.md para rastrear quais arquivos você 
   analisou e o que encontrou
3. Crie um arquivo insights.md que você atualiza iterativamente 
   após processar cada transcrição

Enquanto trabalha:
- Atualize insights.md após processar cada transcrição
- Marque cada transcrição em todos.md conforme completa
- Certifique-se de que todos.md está atualizado antes de qualquer 
  compactação de memória
- Após qualquer compactação, leia context.md e todos.md antes de continuar

Para cada transcrição, extraia:
- Frases exatas usadas para descrever problemas
- Perguntas feitas
- Preocupações ou hesitações mencionadas

Trabalhe em todos os arquivos até completar.
```

---

## 7. Templates e Artefatos

### Template: CLAUDE.md (Regras Globais)

```markdown
# Regras do Projeto

Este arquivo contém regras globais que o assistente de IA deve seguir
em todas as conversas deste projeto.

## Arquitetura

### Stack Tecnológico
- Backend: [tecnologia]
- Frontend: [tecnologia]
- Database: [tecnologia]
- Testes: [framework]

### Estrutura de Diretórios
```
src/
├── components/    # Componentes reutilizáveis
├── features/      # Features por domínio
├── lib/           # Utilitários
├── pages/         # Páginas/rotas
└── tests/         # Testes
```

## Convenções de Código

### Nomenclatura
- Arquivos: kebab-case (exemplo: `user-profile.tsx`)
- Componentes: PascalCase (exemplo: `UserProfile`)
- Funções: camelCase (exemplo: `getUserData`)
- Constantes: SCREAMING_SNAKE_CASE (exemplo: `MAX_RETRIES`)

### Imports
Sempre use path aliases:
```typescript
// ✅ Correto
import { Button } from '@/components/ui/button'

// ❌ Errado
import { Button } from '../../../components/ui/button'
```

### Tamanho de Arquivos
- Máximo de 300 linhas por arquivo
- Se exceder, extrair em módulos menores

## Testes

### Proporção
- 70% testes unitários
- 20% testes de integração
- 10% testes end-to-end

### Padrões
```typescript
describe('ComponentName', () => {
  it('should do something specific', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Logging

Use estruturado:
```python
import structlog
logger = structlog.get_logger()

logger.info("evento", key1=value1, key2=value2)
```

## Documentação

### Funções Públicas
Todas devem ter docstrings:
```python
def process_data(input: str) -> dict:
    """
    Processa dados de entrada e retorna resultado estruturado.
    
    Args:
        input: String de dados brutos
        
    Returns:
        Dicionário com dados processados
        
    Raises:
        ValueError: Se input for inválido
    """
```

## Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `/generate-prp` | Gerar documento de requisitos |
| `/execute-prp` | Implementar feature |
| `/validate` | Rodar validação completa |
| `/commit` | Commit padronizado |

## Antes de Começar Qualquer Tarefa

1. Leia `.claude/PRD.md` se existir
2. Verifique `examples/` para padrões
3. Identifique arquivos relacionados na base de código
```

### Template: INITIAL.md (Requisição de Feature)

```markdown
# Requisição de Feature

## FEATURE
[Descreva o que você quer construir - seja específico sobre 
funcionalidade e requisitos]

Exemplo:
> Construir um scraper web assíncrono usando BeautifulSoup que 
> extrai dados de produtos de sites de e-commerce, lida com 
> rate limiting, e armazena resultados em PostgreSQL.

## EXEMPLOS
[Liste arquivos de exemplo em examples/ e explique como devem ser usados]

- `examples/api-client.py` - Seguir padrão de cliente assíncrono
- `examples/database.py` - Usar padrão de conexão com pool

## DOCUMENTAÇÃO
[Inclua links para documentação relevante, APIs ou recursos MCP]

- Documentação BeautifulSoup: https://...
- API do e-commerce: https://...
- Schema do PostgreSQL: ver `docs/schema.md`

## OUTRAS CONSIDERAÇÕES
[Mencione gotchas, requisitos específicos ou coisas que assistentes 
de IA comumente perdem]

- Rate limit do site é 100 requests/minuto
- Precisa lidar com captchas (usar serviço X)
- Dados devem ser normalizados antes de salvar
- Logs devem incluir URL e timestamp

## CRITÉRIOS DE SUCESSO
[Defina como saber que está pronto]

- [ ] Scraper extrai pelo menos 1000 produtos/hora
- [ ] Zero erros de rate limit em produção
- [ ] Testes cobrem >80% do código
- [ ] Documentação de uso completa
```

### Template: prp_base.md (Base para PRPs)

```markdown
---
name: "PRP Template v2 - Context-Rich com Loops de Validação"
description: |
  Template otimizado para agentes de IA implementarem features com 
  contexto suficiente e capacidades de auto-validação para alcançar 
  código funcionando através de refinamento iterativo.
  
  - Contexto é Rei: Inclua TODA documentação necessária
  - Loops de Validação: Forneça testes executáveis
  - Denso em Informação: Use keywords e padrões da base de código
  - Sucesso Progressivo: Comece simples, valide, então melhore
  - Regras Globais: Siga todas as regras em CLAUDE.md
---

# PRP: [Nome da Feature]

## 1. Visão Geral

### Objetivo
[O que precisa ser construído - seja específico sobre estado final]

### Contexto
[Por que esta feature é necessária, como se encaixa no sistema]

### Escopo
- Inclui: [lista do que está no escopo]
- Não inclui: [lista do que está fora do escopo]

## 2. Requisitos Funcionais

### 2.1 [Requisito 1]
**Descrição**: ...
**Critério de Aceite**: ...
**Exemplos**: ...

### 2.2 [Requisito 2]
**Descrição**: ...
**Critério de Aceite**: ...
**Exemplos**: ...

## 3. Requisitos Técnicos

### Arquitetura
```
[Diagrama ASCII ou descrição da arquitetura]
```

### Padrões a Seguir
Referência: `examples/[arquivo].py`

```python
# Exemplo de código a seguir
```

### Dependências
- [dependência 1] - propósito
- [dependência 2] - propósito

## 4. Plano de Implementação

### Fase 1: [Nome]
1. [ ] Passo detalhado 1
2. [ ] Passo detalhado 2
3. [ ] Validação: `comando para validar`

### Fase 2: [Nome]
1. [ ] Passo detalhado 1
2. [ ] Passo detalhado 2
3. [ ] Validação: `comando para validar`

## 5. Comandos de Validação

```bash
# Testes unitários
pytest tests/ -v

# Lint
ruff check src/

# Type check
mypy src/

# Cobertura
pytest --cov=src tests/
```

## 6. Padrões de Erro Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| [Erro 1] | [Causa] | [Solução] |
| [Erro 2] | [Causa] | [Solução] |

## 7. Critérios de Sucesso

- [ ] Todos os testes passam
- [ ] Cobertura > 80%
- [ ] Sem erros de lint
- [ ] Documentação atualizada
- [ ] Code review aprovado

## 8. Documentação Adicional

### Links
- [link 1]
- [link 2]

### Gotchas
- [gotcha 1]
- [gotcha 2]

---

**Confiança de Sucesso**: [X]/10
**Justificativa**: [Por que esta pontuação]
```

---

## 8. Ciclo de Evolução do Sistema

### Princípio Fundamental

> Todo bug, erro ou comportamento inesperado é uma **oportunidade de melhorar o sistema**, não apenas corrigir o problema pontual.

### Fluxo de Evolução

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   CICLO DE EVOLUÇÃO DO SISTEMA                          │
└─────────────────────────────────────────────────────────────────────────┘

     ┌────────────┐
     │    BUG     │
     │  DETECTADO │
     └─────┬──────┘
           │
           ▼
     ┌────────────────────────────────────────┐
     │         ANÁLISE DE CAUSA RAIZ          │
     │                                        │
     │  Perguntas:                            │
     │  • O que causou isso?                  │
     │  • A IA tinha contexto suficiente?     │
     │  • Faltou algum exemplo?               │
     │  • Alguma regra estava ambígua?        │
     │  • O fluxo de trabalho falhou?         │
     └─────────────────┬──────────────────────┘
                       │
                       ▼
     ┌────────────────────────────────────────┐
     │      DETERMINAR TIPO DE CORREÇÃO       │
     └────────────────────┬───────────────────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
           ▼              ▼              ▼
     ┌──────────┐  ┌──────────┐  ┌──────────┐
     │  REGRA   │  │ CONTEXTO │  │ COMANDO  │
     │  GLOBAL  │  │   SOB    │  │   OU     │
     │          │  │ DEMANDA  │  │ WORKFLOW │
     └────┬─────┘  └────┬─────┘  └────┬─────┘
          │             │             │
          ▼             ▼             ▼
     Atualizar      Criar novo    Criar/atualizar
     CLAUDE.md      documento     comando em
     ou regra       de contexto   .claude/commands/
     modular        .md           
                                  
           └──────────────┼──────────────┘
                          │
                          ▼
     ┌────────────────────────────────────────┐
     │           TESTAR MUDANÇA               │
     │                                        │
     │  • Reproduzir cenário original         │
     │  • Verificar que bug não ocorre mais   │
     │  • Testar casos de borda               │
     └─────────────────┬──────────────────────┘
                       │
                       ▼
     ┌────────────────────────────────────────┐
     │          DOCUMENTAR EVOLUÇÃO           │
     │                                        │
     │  • O que foi mudado                    │
     │  • Por que foi mudado                  │
     │  • Como previne problemas futuros      │
     └────────────────────────────────────────┘
```

### Exemplos Práticos de Evolução

#### Exemplo 1: Import Errado

```
BUG: IA usa "../../../components" ao invés de "@/components"

ANÁLISE: Regra de path aliases não estava documentada

CORREÇÃO: Adicionar a CLAUDE.md:

    ### Imports
    Sempre use path aliases:
    ```typescript
    // ✅ Correto
    import { Button } from '@/components/ui/button'
    
    // ❌ Errado  
    import { Button } from '../../../components/ui/button'
    ```

RESULTADO: IA passa a usar aliases corretamente em todo o projeto
```

#### Exemplo 2: Testes Esquecidos

```
BUG: IA implementa features sem escrever testes

ANÁLISE: Nenhum passo de testes nos comandos de implementação

CORREÇÃO: Atualizar execute-prp.md para incluir:

    ## Checklist Obrigatório
    Após implementar cada componente:
    - [ ] Escrever testes unitários
    - [ ] Rodar `pytest -v`
    - [ ] Verificar cobertura > 80%
    
    NUNCA avance para próximo componente sem testes.

RESULTADO: IA sempre cria testes junto com código
```

#### Exemplo 3: Fluxo de Autenticação

```
BUG: IA implementa auth de forma inconsistente

ANÁLISE: Falta documentação do fluxo de autenticação existente

CORREÇÃO: Criar novo contexto:

    # .claude/reference/auth-architecture.md
    
    ## Fluxo de Autenticação
    
    1. Cliente envia credenciais para /api/auth/login
    2. Backend valida e gera token JWT
    3. Token armazenado em httpOnly cookie
    4. Todas requests subsequentes incluem cookie
    5. Middleware valida token em rotas protegidas
    
    ## Padrões de Código
    
    [exemplos de código]
    
    ## Erros Comuns
    
    [lista de erros e soluções]

RESULTADO: IA entende e segue padrões de auth consistentemente
```

### Checklist de Evolução

Quando um problema ocorre, passe por este checklist:

| Pergunta | Se Sim | Ação |
|----------|--------|------|
| É um padrão que deve valer sempre? | → | Adicionar a CLAUDE.md |
| É específico de um domínio/feature? | → | Criar arquivo de contexto modular |
| É um fluxo repetitivo? | → | Criar comando slash |
| Faltou exemplo de código? | → | Adicionar a examples/ |
| O plano de implementação falhou? | → | Atualizar template de PRP |
| O processo de validação não pegou? | → | Melhorar comandos de validação |

---

## 9. Implementação Prática

### Passo a Passo: Configurar Novo Projeto

```bash
# 1. Criar estrutura de diretórios
mkdir -p .claude/commands
mkdir -p .claude/rules
mkdir -p .agents/plans
mkdir -p PRPs/templates
mkdir -p examples

# 2. Criar CLAUDE.md inicial
touch CLAUDE.md

# 3. Criar comandos essenciais
touch .claude/commands/generate-prp.md
touch .claude/commands/execute-prp.md
touch .claude/commands/commit.md
touch .claude/commands/validate.md

# 4. Criar template de PRP
touch PRPs/templates/prp_base.md

# 5. Criar template de requisição
touch INITIAL.md

# 6. Adicionar exemplos relevantes
# (copiar código existente que representa bons padrões)
```

### Passo a Passo: Implementar Nova Feature

```
┌─────────────────────────────────────────────────────────────────┐
│               FLUXO COMPLETO DE IMPLEMENTAÇÃO                   │
└─────────────────────────────────────────────────────────────────┘

FASE 1: PREPARAÇÃO
─────────────────────────────────────────────────────────────────
1. Preencher INITIAL.md com requisitos da feature
2. Identificar exemplos relevantes em examples/
3. Coletar links de documentação necessária

FASE 2: PLANEJAMENTO
─────────────────────────────────────────────────────────────────
4. Executar: /generate-prp INITIAL.md
5. Revisar PRP gerado
6. Ajustar se necessário
7. Aprovar plano

FASE 3: EXECUÇÃO (NOVA CONVERSA - RESET DE CONTEXTO)
─────────────────────────────────────────────────────────────────
8. Iniciar nova conversa (contexto limpo)
9. Executar: /execute-prp PRPs/feature-name.md
10. Acompanhar implementação passo a passo
11. Commits atômicos após cada componente

FASE 4: VALIDAÇÃO
─────────────────────────────────────────────────────────────────
12. Executar: /validate
13. Se falhas: corrigir e repetir
14. Executar: /code-review
15. Se issues: /code-review-fix

FASE 5: EVOLUÇÃO
─────────────────────────────────────────────────────────────────
16. Executar: /system-review
17. Identificar melhorias no processo
18. Atualizar regras/comandos/contextos
19. Documentar lições aprendidas
```

### Dicas Avançadas

#### 1. Use Sub-agentes para Tarefas Pesadas

Quando processar muitos arquivos ou fazer pesquisas extensas, use sub-agentes para manter o contexto principal limpo:

```markdown
Use um sub-agente para analisar (não transcrever) este vídeo e 
retornar APENAS:
1. Sumário
2. Aprendizados chave
3. Citações importantes

NÃO retorne a transcrição completa.
URL: [YouTube URL]
```

#### 2. Mantenha Regras Modulares

Não jogue tudo em CLAUDE.md. Divida por domínio:

```
.claude/rules/
├── api.md          # Só carrega quando trabalhar com API
├── components.md   # Só carrega quando trabalhar com frontend
├── database.md     # Só carrega quando trabalhar com banco
└── security.md     # Só carrega para reviews de segurança
```

#### 3. Crie Aliases de Comando Compostos

Para fluxos complexos, crie comandos que chamam outros:

```markdown
# /full-cycle

Execute o ciclo completo de implementação:

1. Execute /validate para garantir estado limpo
2. Execute /execute-prp com o PRP especificado
3. Execute /validate novamente
4. Execute /code-review
5. Se passar: /commit
6. Se falhar: /code-review-fix e volte ao passo 3
```

#### 4. Documente Decisões Arquiteturais

Mantenha um arquivo de decisões para contexto histórico:

```markdown
# decisions.md

## ADR-001: Usar SQLite com WAL Mode

**Data**: 2024-01-15
**Status**: Aceito

**Contexto**: Precisamos de um banco local simples para o app.

**Decisão**: Usar SQLite com WAL mode habilitado.

**Consequências**:
- Positivo: Zero configuração, portátil
- Negativo: Não escala para múltiplos writers
```

---

## Referências

- [Context Engineering Intro - Cole Medin](https://github.com/coleam00/context-engineering-intro)
- [Habit Tracker - Exemplo PIV Loop](https://github.com/coleam00/habit-tracker)
- [Análise de Transcrições com Claude Code](https://d-squared70.github.io/I-Analyzed-50-Meeting-Transcripts-in-30-Minutes-with-Claude-Code-No-code-/)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Context Engineering Best Practices - Phil Schmid](https://www.philschmid.de/context-engineering)
- [Vibe Coding Needs Context Engineering - Sequoia](https://inferencebysequoia.substack.com/p/vibe-coding-needs-context-engineering)

---

## Changelog

| Versão | Data | Alterações |
|--------|------|------------|
| 1.0 | 2026-01-26 | Versão inicial consolidada |

---

*Manual compilado e consolidado a partir de múltiplas fontes para uso com Claude Code.*
