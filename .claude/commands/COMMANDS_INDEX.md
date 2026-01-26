# Índice de Comandos Claude Code - INTEIA

## Visão Geral

Este índice lista todos os comandos disponíveis para o Claude Code neste projeto.

## Estrutura de Pastas

```
.claude/commands/
├── COMMANDS_INDEX.md          # Este arquivo
├── commit.md                  # Criar commits padronizados
├── init-project.md            # Inicializar ambiente
├── core_piv_loop/             # Ciclo PIV (Plan-Implement-Verify)
│   ├── prime.md               # Carregar contexto do projeto
│   ├── plan-feature.md        # Planejar funcionalidades
│   └── execute.md             # Executar plano
└── pesquisa_eleitoral/        # Comandos de pesquisa
    ├── executar-pesquisa.md   # Executar pesquisa completa
    ├── gerar-relatorio.md     # Gerar relatório visual
    └── analisar-eleitor.md    # Analisar eleitor sintético
```

## Comandos Disponíveis

### Comandos Gerais

| Comando | Descrição | Uso |
|---------|-----------|-----|
| `/commit` | Criar commit padronizado em português | `/commit` |
| `/init-project` | Inicializar ambiente de desenvolvimento | `/init-project` |

### Ciclo PIV (Plan-Implement-Verify)

| Comando | Descrição | Uso |
|---------|-----------|-----|
| `/prime` | Carregar contexto completo do projeto | `/prime` |
| `/plan-feature` | Planejar implementação de feature | `/plan-feature <descrição>` |
| `/execute` | Executar plano existente | `/execute <caminho-do-plano>` |

### Pesquisa Eleitoral

| Comando | Descrição | Uso |
|---------|-----------|-----|
| `/executar-pesquisa` | Executar pesquisa eleitoral completa | `/executar-pesquisa governador 2026 amostra=500` |
| `/gerar-relatorio` | Gerar relatório padrão INTEIA | `/gerar-relatorio <caminho-dados>` |
| `/analisar-eleitor` | Analisar perfil de eleitor sintético | `/analisar-eleitor id=42` |

## Fluxo de Trabalho Recomendado

### Para Nova Feature

```
1. /prime                           # Entender o projeto
2. /plan-feature <descrição>        # Criar plano detalhado
3. /execute <plano.md>              # Implementar
4. /commit                          # Commitar mudanças
```

### Para Pesquisa Eleitoral

```
1. /executar-pesquisa <params>      # Executar pesquisa
2. /gerar-relatorio <dados>         # Criar relatório visual
```

### Para Análise de Eleitor

```
1. /analisar-eleitor id=42          # Analisar eleitor específico
2. /analisar-eleitor regiao=X       # Analisar por filtro
```

## Arquivos de Referência

Os comandos podem consultar arquivos em `.claude/reference/`:

| Arquivo | Conteúdo |
|---------|----------|
| `fastapi-best-practices.md` | Padrões FastAPI |
| `nextjs-best-practices.md` | Padrões Next.js |
| `claude-api-best-practices.md` | Integração Claude |

## Planos de Agentes

Planos detalhados em `.agents/plans/`:

| Plano | Propósito |
|-------|-----------|
| `pesquisa-eleitoral-completa.md` | Fluxo completo de pesquisa |
| `novo-relatorio-padrao.md` | Criar relatório INTEIA |

## Notas

- Todos os comandos seguem regras do `CLAUDE.md`
- Respostas sempre em português brasileiro
- Execução autônoma sem confirmações
- Padrão visual INTEIA em relatórios
