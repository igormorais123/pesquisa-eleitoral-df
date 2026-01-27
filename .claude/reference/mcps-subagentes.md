# MCPs e Subagentes - INTEIA

> Configuração e uso de Model Context Protocols e Task Tool para delegação de trabalho.

## MCPs (Model Context Protocols)

MCPs são servidores que estendem as capacidades do Claude Code com ferramentas especializadas.

### MCPs Recomendados

| MCP | Propósito | Quando Usar |
|-----|-----------|-------------|
| `filesystem` | Acesso a arquivos fora do projeto | Ler configs globais, logs externos |
| `memory` | Persistência de conhecimento | Manter contexto entre sessões |
| `github` | Operações GitHub | PRs, issues, actions |
| `puppeteer` | Automação de browser | Testes E2E, screenshots |
| `postgres` | Queries diretas | Debug, análise de dados |

### Configuração

Arquivo: `.claude/settings.local.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-filesystem"],
      "env": {
        "ALLOWED_PATHS": "/home/user/logs,/etc/app"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-memory"],
      "env": {
        "MEMORY_PATH": ".memoria/"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

---

## Task Tool e Subagentes

O Task Tool permite delegar trabalho para agentes especializados.

### Tipos de Subagentes

| Tipo | Especialidade | Ferramentas |
|------|---------------|-------------|
| `Explore` | Explorar codebase | Glob, Grep, Read |
| `Plan` | Planejar implementação | Read, Glob, Grep, WebSearch |
| `Bash` | Executar comandos | Bash |
| `general-purpose` | Tarefas diversas | Todas |

### Quando Usar Subagentes

```
┌─────────────────────────────────────────────────────────────┐
│                    DECISÃO DE SUBAGENTE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Precisa explorar codebase?  ──────► Explore                │
│                                                              │
│   Precisa planejar feature?   ──────► Plan                   │
│                                                              │
│   Precisa rodar comandos?     ──────► Bash                   │
│                                                              │
│   Tarefa complexa e longa?    ──────► general-purpose        │
│                                                              │
│   Tarefa simples e rápida?    ──────► Fazer diretamente      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Exemplos de Uso

#### Explorar Codebase
```
Use Task tool com subagent_type=Explore:
"Encontre todos os endpoints que usam autenticação JWT"
```

#### Planejar Feature
```
Use Task tool com subagent_type=Plan:
"Planeje implementação de filtro por idade nos eleitores"
```

#### Executar em Background
```
Use Task tool com run_in_background=true:
"Rode os testes de integração completos"
```

### Boas Práticas

1. **Paralelismo**: Lance múltiplos agentes independentes simultaneamente
2. **Contexto claro**: Forneça descrição detalhada da tarefa
3. **Background para longo**: Use run_in_background para tarefas demoradas
4. **Resumo de resultado**: O agente retorna resultado que não é visível ao usuário - resuma

---

## Hooks

Hooks permitem executar comandos automaticamente em resposta a eventos.

### Tipos de Hooks

| Hook | Dispara Quando |
|------|----------------|
| `PreToolCall` | Antes de usar uma ferramenta |
| `PostToolCall` | Após usar uma ferramenta |
| `Notification` | Em eventos específicos |

### Configuração

Arquivo: `.claude/settings.json`

```json
{
  "hooks": {
    "PostToolCall": [
      {
        "tool": "Write",
        "command": "npm run lint:fix $file_path"
      }
    ],
    "PreToolCall": [
      {
        "tool": "Bash",
        "command": "echo 'Executando: $command'"
      }
    ]
  }
}
```

### Casos de Uso

1. **Auto-lint após escrever arquivo**
2. **Backup antes de editar**
3. **Notificação após commit**
4. **Validação antes de build**

---

## Integração com PIV Loop

### Tier 3-4: Usar Subagentes

```
/prime
  └─► Task(Explore) para análise inicial

/plan-feature
  └─► Task(Plan) para estratégia de implementação

/execute
  └─► Task(Bash) para comandos longos em background

/validate
  └─► Task(Bash) para suite de testes completa
```

### Exemplo Prático

```markdown
## Tarefa: Implementar novo relatório de pesquisa

1. Explore: "Encontre como outros relatórios são gerados"
2. Plan: "Planeje estrutura do novo relatório"
3. Execute: Implementar seguindo o plano
4. Bash(background): "Rodar testes E2E completos"
5. Validate: Verificar resultados
```

---

*Baseado no Manual de Engenharia de Contexto v2.0*
