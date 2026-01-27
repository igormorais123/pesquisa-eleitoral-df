# Índice de Comandos Claude Code - INTEIA

> **Versão 2.1** - Baseado no Manual de Engenharia de Contexto v2.0

## Visão Geral

Sistema completo de comandos seguindo metodologia PIV (Prime-Implement-Validate) com suporte a:
- **Contexto persistente** e regras modulares
- **Sistema de Tiers** (1-4) para classificar complexidade
- **Memória hierárquica** (ativo/longo prazo/aprendizados)
- **MCPs e Subagentes** para delegação de trabalho
- **Templates para projetos não-código**

## Estrutura de Pastas

```
.claude/
├── commands/
│   ├── COMMANDS_INDEX.md          # Este arquivo
│   ├── commit.md                  # Commits padronizados
│   ├── init-project.md            # Inicializar ambiente
│   │
│   ├── core_piv_loop/             # Ciclo PIV principal
│   │   ├── research.md            # 0. Pesquisa profunda (NOVO)
│   │   ├── prime.md               # 1. Carregar contexto
│   │   ├── plan-feature.md        # 2. Planejar feature
│   │   └── execute.md             # 3. Executar plano
│   │
│   ├── validation/                # Comandos de validação
│   │   ├── requirements-check.md  # Verificar requisitos (NOVO)
│   │   ├── validate.md            # Validação completa
│   │   ├── code-review.md         # Review automatizado
│   │   ├── code-review-fix.md     # Corrigir issues
│   │   └── system-review.md       # Evolução do sistema
│   │
│   └── pesquisa_eleitoral/        # Comandos específicos
│       ├── executar-pesquisa.md   # Executar pesquisa
│       ├── gerar-relatorio.md     # Gerar relatório
│       └── analisar-eleitor.md    # Analisar eleitor
│
├── rules/                         # Regras modulares
│   ├── api.md                     # Regras de API/Backend
│   ├── components.md              # Regras de Frontend
│   └── seguranca.md               # Regras de Segurança
│
├── reference/                     # Documentação técnica
│   ├── spec-driven-development.md # Metodologia SDD (NOVO)
│   ├── tiers-complexidade.md      # Sistema de Tiers (NOVO)
│   ├── mcps-subagentes.md         # MCPs e Task Tool (NOVO)
│   ├── fastapi-best-practices.md
│   ├── nextjs-best-practices.md
│   └── claude-api-best-practices.md
│
├── templates/                     # Templates para projetos
│   ├── projeto-analise.md         # Projetos não-código (NOVO)
│   └── investigacao-juridica.md   # Investigação legal (NOVO)
│
└── PRD.md                         # Requisitos do produto

.agents/
├── plans/                         # Planos de implementação
└── research/                      # Documentos de pesquisa (NOVO)

.memoria/                          # Sistema de memória hierárquica (NOVO)
├── CONTEXTO_ATIVO.md              # Sessão atual (limpa a cada início)
├── MEMORIA_LONGO_PRAZO.md         # Conhecimento permanente
└── APRENDIZADOS.md                # Evolução do sistema

.context/                          # Contexto persistente (legado)
├── context.md                     # Objetivo e regras
├── todos.md                       # Progresso atual
└── insights.md                    # Descobertas

examples/                          # Código de referência
├── api-endpoint.py
└── component.tsx

PRPs/templates/                    # Templates de plano
└── prp_base.md                    # Base para planos

INITIAL.md                         # Template de requisição
```

## Fluxo Principal: Spec-Driven Development

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SPEC-DRIVEN DEVELOPMENT (Ciclo PIV+)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SIMPLE vs EASY: "A parte difícil nunca foi digitar. Foi saber O QUE digitar"│
│                                                                              │
│   /requirements    /research      /plan-feature    /execute     /validate   │
│   -check              │                │               │            │       │
│      │                │                │               │            │       │
│      ▼                ▼                ▼               ▼            ▼       │
│   Verificar  ───► Pesquisar  ───► Criar Plano ───► Implementar ──► Validar │
│   Requisitos      Profundo        "Paint by        Focado          Tudo    │
│                                    Numbers"                                  │
│      │                │                │                                     │
│      ▼                ▼                ▼                                     │
│   [CHECKPOINT]   [CHECKPOINT]    [CHECKPOINT]                               │
│   Humano          Humano          Humano                                     │
│                                                                              │
│                         │                                                    │
│                         ▼                                                    │
│                  [NOVA CONVERSA]                                             │
│                  Reset de contexto                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Regra Anti-Vibecoding

> "Após 10 turns na mesma conversa, você não está discutindo.
> Você está gerenciando contexto complexo."

Se passar de 10 turns: PARE, compile descobertas, considere nova conversa.

## Comandos Disponíveis

### Ciclo PIV+ (Core)

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/prime` | Carregar contexto do projeto | Início de sessão |
| `/research` | Pesquisa profunda com checkpoint | Tier 3-4, antes de planejar |
| `/plan-feature` | Criar plano "paint by numbers" | Antes de implementar |
| `/execute` | Executar plano focado | Após aprovação do plano |

### Validação

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/requirements-check` | Verificar requisitos sólidos | Antes de qualquer coisa |
| `/validate` | Lint, testes, coverage, build | Após implementação |
| `/code-review` | Review técnico automatizado | Após validação passar |
| `/code-review-fix` | Corrigir issues do review | Se houver problemas |
| `/system-review` | Análise de evolução do sistema | Retrospectivas |

### Gerais

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/commit` | Commit padronizado em português | Após validação |
| `/init-project` | Configurar ambiente de dev | Primeiro setup |

### Pesquisa Eleitoral

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/executar-pesquisa` | Executar pesquisa completa | Nova pesquisa |
| `/gerar-relatorio` | Gerar relatório INTEIA | Após pesquisa |
| `/analisar-eleitor` | Analisar perfil de eleitor | Análise individual |

## Fluxo por Tier de Complexidade

### Tier 1-2: Tarefas Simples/Moderadas

```bash
# 1. Verificar requisitos (rápido)
/requirements-check "descrição"

# 2. Planejar
/plan-feature Descrição

# 3. Executar
/execute .agents/plans/nome.md

# 4. Validar e commit
/validate && /commit
```

### Tier 3-4: Tarefas Complexas

```bash
# 1. Início de sessão
/prime

# 2. Verificar requisitos (obrigatório)
/requirements-check INITIAL.md

# 3. Pesquisa profunda (NOVO - obrigatório Tier 3-4)
/research Descrição detalhada
# ⚠️ CHECKPOINT HUMANO: Validar análise

# 4. Criar plano "paint by numbers"
/plan-feature .agents/research/nome-research.md
# ⚠️ CHECKPOINT HUMANO: Aprovar arquitetura

# 5. [NOVA CONVERSA - Reset de Contexto]

# 6. Executar implementação focada
/execute .agents/plans/nome-feature.md

# 7. Validar
/validate

# 8. Review
/code-review
# Se issues: /code-review-fix

# 9. Commit
/commit

# 10. Retrospectiva
/system-review
```

### Matriz de Decisão de Tier

| Arquivos | Impacto | Tier | Fluxo |
|----------|---------|------|-------|
| 1-2 | Nenhum/Local | 1 | Direto |
| 2-5 | Local | 2 | Plan → Execute |
| 5-15 | Módulo | 3 | Research → Plan → Execute |
| 15+ | Sistema | 4 | Research profundo → Plan detalhado → Execute faseado |

## Regras Modulares

Carregar sob demanda conforme necessidade:

| Arquivo | Quando Carregar |
|---------|-----------------|
| `.claude/rules/api.md` | Trabalhar com backend/endpoints |
| `.claude/rules/components.md` | Criar componentes frontend |
| `.claude/rules/seguranca.md` | Review de segurança |

## Sistema de Memória

### Memória Hierárquica (`.memoria/`) - NOVO

| Arquivo | Propósito | Quando Atualizar |
|---------|-----------|------------------|
| `CONTEXTO_ATIVO.md` | Sessão atual | Durante sessão, limpa ao iniciar nova |
| `MEMORIA_LONGO_PRAZO.md` | Conhecimento permanente | Ao descobrir padrões importantes |
| `APRENDIZADOS.md` | Evolução do sistema | Após cada melhoria |

### Contexto Persistente (`.context/`) - Legado

| Arquivo | Propósito | Quando Atualizar |
|---------|-----------|------------------|
| `context.md` | Objetivo e regras | Início do projeto |
| `todos.md` | Progresso atual | Após cada tarefa |
| `insights.md` | Descobertas | Após análises |

### Documentos de Pesquisa (`.agents/research/`) - NOVO

| Formato | Propósito |
|---------|-----------|
| `{feature}-research.md` | Documento de pesquisa validado |

## Exemplos de Código

Consultar `examples/` antes de implementar:

| Arquivo | Padrão |
|---------|--------|
| `api-endpoint.py` | Endpoint FastAPI completo |
| `component.tsx` | Componente React padrão |

## Filosofia

> **"Simple over Easy"** - A parte difícil nunca foi digitar. Foi saber O QUE digitar. (Fred Brooks)

> **"Contexto é Rei"** - Todo plano deve conter informação suficiente para implementação em uma única passada.

> **"Checkpoint Humano"** - O momento de maior alavancagem é validar análise antes de implementar.

> **"Anti-Vibecoding"** - Após 10 turns, você está gerenciando contexto, não resolvendo o problema.

> **"Complexidade Essencial vs Acidental"** - AI trata todo padrão igual. NÓS sabemos a diferença.

> **"Reset Estratégico"** - Pesquisa, planejamento e execução são conversas SEPARADAS.

## Documentação de Referência

| Documento | Conteúdo |
|-----------|----------|
| `reference/spec-driven-development.md` | Metodologia completa (Netflix) |
| `reference/tiers-complexidade.md` | Sistema de classificação 1-4 |
| `reference/mcps-subagentes.md` | Task Tool e MCPs |

---

*Índice atualizado em: 2026-01-26*
*Baseado em: Manual de Engenharia de Contexto v2.0 + Spec-Driven Development (Netflix)*
