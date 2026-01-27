# System Review: Análise de Evolução do Sistema

## Objetivo

Analisar implementação versus plano para identificar melhorias no sistema de engenharia de contexto.

## Quando Usar

- Após completar uma feature
- Quando bugs recorrentes aparecem
- Em retrospectivas de sprint
- Quando a IA comete erros repetidos

## Processo

### 1. Coletar Dados

```bash
# Commits recentes
git log --oneline -20

# Arquivos mais alterados
git diff --stat HEAD~10

# Issues/PRs recentes (se disponível)
gh pr list --state merged --limit 10
```

### 2. Análise de Causa Raiz

Para cada problema encontrado, perguntar:

| Pergunta | Se Sim → Ação |
|----------|---------------|
| A IA tinha contexto suficiente? | Criar/atualizar documento de contexto |
| Faltou algum exemplo? | Adicionar a `examples/` |
| Alguma regra estava ambígua? | Clarificar em `CLAUDE.md` ou `.claude/rules/` |
| O fluxo de trabalho falhou? | Atualizar comando em `.claude/commands/` |
| O plano de implementação era incompleto? | Melhorar template de PRP |

### 3. Classificar Tipo de Correção

```
┌─────────────────────────────────────────────────────────────┐
│                  TIPOS DE CORREÇÃO                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  REGRA GLOBAL          CONTEXTO SOB DEMANDA    COMANDO       │
│  ─────────────         ───────────────────     ───────       │
│                                                              │
│  Atualizar             Criar novo arquivo      Criar/atualizar│
│  CLAUDE.md             em .claude/rules/       em .claude/    │
│  ou regra              ou .claude/reference/   commands/      │
│  existente                                                    │
│                                                              │
│  QUANDO:               QUANDO:                 QUANDO:        │
│  Vale para             Específico de           Fluxo          │
│  TODO o projeto        um domínio/feature      repetitivo     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4. Documentar Evolução

Adicionar ao `WORK_LOG.md`:

```markdown
## Evolução [DATA]

### Problema
[Descreva o que aconteceu]

### Causa Raiz
[Por que aconteceu]

### Correção Aplicada
[O que foi feito]

### Prevenção Futura
[Como evitar que aconteça novamente]
```

## Formato de Saída

```
╔══════════════════════════════════════════════════════════════╗
║                     SYSTEM REVIEW                             ║
╠══════════════════════════════════════════════════════════════╣
║                                                                ║
║  PERÍODO ANALISADO: [data início] - [data fim]                ║
║  FEATURES IMPLEMENTADAS: X                                     ║
║  BUGS ENCONTRADOS: Y                                           ║
║                                                                ║
╠══════════════════════════════════════════════════════════════╣
║  PADRÕES IDENTIFICADOS                                         ║
║                                                                ║
║  🔴 PROBLEMA RECORRENTE: Import paths incorretos               ║
║     Frequência: 5 ocorrências                                  ║
║     Causa: Regra de path aliases não estava clara              ║
║     Ação: Atualizado .claude/rules/components.md               ║
║                                                                ║
║  🟡 AVISO: Testes frequentemente esquecidos                    ║
║     Frequência: 3 ocorrências                                  ║
║     Causa: Plano não enfatiza testes                           ║
║     Ação: Atualizado template de PRP                           ║
║                                                                ║
║  🟢 POSITIVO: Padrão de API consistente                        ║
║     Regras de api.md estão funcionando bem                     ║
║                                                                ║
╠══════════════════════════════════════════════════════════════╣
║  EVOLUÇÕES APLICADAS                                           ║
║                                                                ║
║  1. ✅ Clarificada regra de imports em components.md           ║
║  2. ✅ Adicionado checklist de testes no execute.md            ║
║  3. 📋 TODO: Criar exemplo de componente com testes            ║
║                                                                ║
╠══════════════════════════════════════════════════════════════╣
║  MÉTRICAS DE MELHORIA                                          ║
║                                                                ║
║  Taxa de sucesso em primeira tentativa: X% → Y%                ║
║  Erros de lint por commit: X → Y                               ║
║  Cobertura de testes: X% → Y%                                  ║
║                                                                ║
╚══════════════════════════════════════════════════════════════╝
```

## Exemplo de Uso

```
# Revisão geral
/system-review

# Revisão focada em um problema
/system-review problema=imports-incorretos
```

## Filosofia

> "Todo bug é uma oportunidade de evoluir o SISTEMA, não apenas corrigir o problema pontual."

O objetivo é que a cada feature implementada, o sistema de engenharia de contexto fique mais inteligente e menos propenso a erros.
