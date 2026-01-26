# Índice de Comandos Claude Code - INTEIA

> **Versão 2.0** - Baseado no Manual de Engenharia de Contexto

## Visão Geral

Sistema completo de comandos seguindo metodologia PIV (Prime-Implement-Validate) com suporte a contexto persistente e regras modulares.

## Estrutura de Pastas

```
.claude/
├── commands/
│   ├── COMMANDS_INDEX.md          # Este arquivo
│   ├── commit.md                  # Commits padronizados
│   ├── init-project.md            # Inicializar ambiente
│   │
│   ├── core_piv_loop/             # Ciclo PIV principal
│   │   ├── prime.md               # 1. Carregar contexto
│   │   ├── plan-feature.md        # 2. Planejar feature
│   │   └── execute.md             # 3. Executar plano
│   │
│   ├── validation/                # Comandos de validação
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
│   ├── fastapi-best-practices.md
│   ├── nextjs-best-practices.md
│   └── claude-api-best-practices.md
│
└── PRD.md                         # Requisitos do produto

.agents/
└── plans/                         # Planos de implementação

.context/                          # Contexto persistente
├── context.md                     # Objetivo e regras
├── todos.md                       # Progresso atual
└── insights.md                    # Descobertas

examples/                          # Código de referência
├── api-endpoint.py
└── component.tsx

PRPs/templates/                    # Templates
└── prp_base.md                    # Base para planos

INITIAL.md                         # Template de requisição
```

## Fluxo Principal: Ciclo PIV

```
┌─────────────────────────────────────────────────────────────────┐
│                         CICLO PIV                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   /prime          /plan-feature       /execute        /validate │
│      │                  │                 │               │     │
│      ▼                  ▼                 ▼               ▼     │
│   Carregar  ──────► Criar Plano ──────► Implementar ──► Validar│
│   Contexto          Detalhado           Passo a Passo   Tudo   │
│                                                                  │
│                         │                                        │
│                         ▼                                        │
│                  [NOVA CONVERSA]                                 │
│                  Reset de contexto                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Comandos Disponíveis

### Ciclo PIV (Core)

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/prime` | Carregar contexto do projeto | Início de sessão |
| `/plan-feature` | Criar plano de implementação | Antes de implementar |
| `/execute` | Executar plano passo a passo | Após aprovação do plano |

### Validação

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
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

## Fluxo Completo de Feature

```bash
# 1. Início de sessão
/prime

# 2. Preparar requisição (opcional)
# Preencher INITIAL.md

# 3. Criar plano
/plan-feature Descrição da feature
# ou
/plan-feature INITIAL.md

# 4. [NOVA CONVERSA - Reset de Contexto]

# 5. Executar implementação
/execute .agents/plans/nome-feature.md

# 6. Validar
/validate

# 7. Review
/code-review
# Se issues: /code-review-fix

# 8. Commit
/commit

# 9. Retrospectiva (opcional)
/system-review
```

## Regras Modulares

Carregar sob demanda conforme necessidade:

| Arquivo | Quando Carregar |
|---------|-----------------|
| `.claude/rules/api.md` | Trabalhar com backend/endpoints |
| `.claude/rules/components.md` | Criar componentes frontend |
| `.claude/rules/seguranca.md` | Review de segurança |

## Contexto Persistente

Arquivos em `.context/` persistem entre sessões:

| Arquivo | Propósito | Quando Atualizar |
|---------|-----------|------------------|
| `context.md` | Objetivo e regras | Início do projeto |
| `todos.md` | Progresso atual | Após cada tarefa |
| `insights.md` | Descobertas | Após análises |

## Exemplos de Código

Consultar `examples/` antes de implementar:

| Arquivo | Padrão |
|---------|--------|
| `api-endpoint.py` | Endpoint FastAPI completo |
| `component.tsx` | Componente React padrão |

## Filosofia

> **"Contexto é Rei"** - Todo plano deve conter informação suficiente para implementação em uma única passada.

> **"Todo bug é oportunidade"** - Erros devem evoluir o sistema, não apenas ser corrigidos.

> **"Reset estratégico"** - Planejamento e execução são conversas SEPARADAS.

---

*Índice atualizado em: 2026-01-26*
*Baseado em: Manual de Engenharia de Contexto v1.0*
