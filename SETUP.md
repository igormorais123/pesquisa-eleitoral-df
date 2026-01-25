# SETUP.md - Guia Completo para Trabalhar com Claude Code

Este guia ensina como configurar e otimizar seu ambiente para trabalhar com Claude Code de forma eficiente.

---

## 1. EXTENSOES VS CODE INSTALADAS

### Essenciais para Claude Code
| Extensao | Funcao |
|----------|--------|
| `anthropic.claude-code` | Extensao oficial Claude Code |
| `github.copilot` + `copilot-chat` | Assistente IA complementar |
| `sourcegraph.cody-ai` | Outro assistente IA (backup) |
| `eamodio.gitlens` | Git avancado (blame, history) |
| `dbaeumer.vscode-eslint` | Linting JavaScript/TypeScript |
| `esbenp.prettier-vscode` | Formatacao automatica |
| `ms-python.python` + `pylance` | Suporte Python completo |

### Produtividade
| Extensao | Funcao |
|----------|--------|
| `yzhang.markdown-all-in-one` | Edicao Markdown avancada |
| `bierner.markdown-mermaid` | Diagramas Mermaid em MD |
| `hediet.vscode-drawio` | Diagramas Draw.io no VS Code |
| `gruntfuggly.todo-tree` | Arvore de TODOs no projeto |
| `wayou.vscode-todo-highlight` | Destaque de TODO/FIXME |
| `quicktype.quicktype` | Gerar tipos de JSON |
| `meganrogge.template-string-converter` | Converter strings |
| `usernamehw.errorlens` | Erros inline no codigo |
| `yoavbls.pretty-ts-errors` | Erros TS mais legiveis |

### Frontend
| Extensao | Funcao |
|----------|--------|
| `bradlc.vscode-tailwindcss` | IntelliSense Tailwind |
| `dsznajder.es7-react-js-snippets` | Snippets React |
| `christian-kohler.path-intellisense` | Autocomplete de paths |
| `formulahendry.auto-rename-tag` | Renomear tags HTML |

### Backend/Infra
| Extensao | Funcao |
|----------|--------|
| `ms-azuretools.vscode-docker` | Suporte Docker |
| `redhat.vscode-yaml` | Validacao YAML |
| `prisma.prisma` | Suporte Prisma ORM |
| `humao.rest-client` | Testar APIs direto no VS Code |

---

## 2. FERRAMENTAS CLI GLOBAIS

### Instaladas
```bash
# Verificar instaladas
npm list -g --depth=0

# Ferramentas essenciais ja instaladas:
@anthropic-ai/claude-code@2.1.12  # Claude Code CLI
vercel@latest                      # Deploy Vercel
typescript@5.x                     # Compilador TS
prettier@3.x                       # Formatador
eslint@9.x                         # Linter
tsx@4.x                            # Executar TS direto
nodemon@3.x                        # Auto-reload Node
```

### Recomendado Instalar
```bash
# Ferramentas uteis adicionais
npm install -g pnpm              # Gerenciador pacotes mais rapido
npm install -g turbo             # Build system monorepo
npm install -g degit             # Clonar repos sem git history
npm install -g serve             # Servidor estatico rapido
npm install -g http-server       # Outro servidor estatico
npm install -g json-server       # API fake para testes
npm install -g ngrok             # Expor localhost publicamente
npm install -g lighthouse        # Auditoria de performance
```

---

## 3. CONFIGURACAO CLAUDE CODE

### Arquivo de Permissoes Global
Localizacao: `~/.claude/settings.json`

```json
{
  "permissions": {
    "allow": [
      "Bash(*)",
      "Read(*)",
      "Write(*)",
      "Edit(*)",
      "mcp__render__*",
      "mcp__github__*"
    ],
    "defaultMode": "acceptEdits"
  },
  "language": "portugues brasil"
}
```

### Iniciar com Permissoes Totais
```bash
# Metodo 1: Flag no comando (recomendado)
claude --dangerously-skip-permissions

# Metodo 2: Alias permanente
# Adicione ao seu PowerShell profile ($PROFILE):
function claudedev { claude --dangerously-skip-permissions @args }

# Ou no bash/zsh (~/.bashrc ou ~/.zshrc):
alias claudedev='claude --dangerously-skip-permissions'
```

### Atalhos Durante Sessao
| Tecla | Acao |
|-------|------|
| `a` | Aceitar TODOS os comandos desta sessao |
| `!` | Aceitar permanentemente este comando |
| `y` | Aceitar uma vez |
| `n` | Rejeitar |
| `e` | Editar comando antes de executar |

---

## 4. MCPs (MODEL CONTEXT PROTOCOL)

### O que sao MCPs?
MCPs permitem que o Claude Code acesse servicos externos como Render, GitHub, bancos de dados, etc.

### MCP Configurado: Render
Arquivo: `.mcp.json`
```json
{
  "mcpServers": {
    "render": {
      "type": "http",
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer SEU_TOKEN_RENDER"
      }
    }
  }
}
```

### Comandos Render Disponiveis
```
mcp__render__list_services        # Listar servicos
mcp__render__get_service          # Detalhes de um servico
mcp__render__create_web_service   # Criar novo servico
mcp__render__create_postgres      # Criar banco PostgreSQL
mcp__render__get_metrics          # Ver metricas (CPU, memoria)
mcp__render__list_logs            # Ver logs
mcp__render__list_deploys         # Historico de deploys
```

### Outros MCPs Disponiveis (Instalar Separadamente)

#### GitHub MCP
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxx"
    }
  }
}
```

#### Puppeteer MCP (Automacao Browser)
```json
{
  "puppeteer": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
  }
}
```

#### Filesystem MCP (Acesso Arquivos)
```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/caminho/permitido"]
  }
}
```

#### Postgres MCP (Banco de Dados)
```json
{
  "postgres": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres"],
    "env": {
      "DATABASE_URL": "postgresql://user:pass@host:5432/db"
    }
  }
}
```

---

## 5. ESTRUTURA DO PROJETO

```
pesquisa-eleitoral-df/
├── .claude/                 # Configuracoes Claude Code
│   └── settings.json       # Permissoes do projeto
├── .mcp.json               # Servidores MCP
├── .env.local              # Variaveis de ambiente
├── CLAUDE.md               # Instrucoes para o Claude
├── SETUP.md                # Este arquivo
├── README.md               # Documentacao geral
│
├── frontend/               # Next.js 14 App
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Bibliotecas e utils
│   │   ├── stores/        # Zustand stores
│   │   ├── services/      # API client
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── backend/                # FastAPI App
│   ├── app/
│   │   ├── api/rotas/     # REST endpoints
│   │   ├── modelos/       # SQLAlchemy models
│   │   ├── esquemas/      # Pydantic schemas
│   │   └── servicos/      # Business logic
│   └── requirements.txt
│
├── agentes/                # Dados JSON
│   ├── banco-eleitores-df.json
│   └── [outros bancos...]
│
└── docs/                   # Documentacao detalhada
```

---

## 6. COMANDOS FREQUENTES

### Desenvolvimento Local
```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && python -m uvicorn app.main:app --reload

# Docker (tudo junto)
docker-compose up -d
```

### Deploy
```bash
# Vercel (Frontend)
cd frontend && vercel --prod --token $VERCEL_TOKEN

# Ver logs Render
# Use o MCP: mcp__render__list_logs
```

### Git
```bash
# Commit padrao
git add -A && git commit -m "feat: descricao"

# Push
git push origin main

# Criar branch
git checkout -b feature/nome
```

### Testes
```bash
# Frontend
npm run lint
npm run typecheck

# Backend
pytest
```

---

## 7. DICAS PARA CLAUDE CODE

### Boas Praticas
1. **Use TodoWrite** para planejar tarefas complexas
2. **Seja especifico** nos pedidos (nao diga "melhore", diga "adicione X")
3. **Forneca contexto** sobre o que ja foi feito
4. **Use Task** para tarefas que precisam de exploracao

### Comandos Uteis
```
/help                 # Ver ajuda
/clear                # Limpar historico
/compact              # Compactar contexto
/cost                 # Ver custo da sessao
```

### Quando Usar Cada Agente
| Agente | Quando Usar |
|--------|-------------|
| `Explore` | Explorar codebase, entender estrutura |
| `Plan` | Planejar implementacoes complexas |
| `Bash` | Executar comandos shell |
| `general-purpose` | Tarefas variadas |

---

## 8. TROUBLESHOOTING

### Claude Code Travado
```bash
# Fechar e reiniciar
Ctrl+C
claude --dangerously-skip-permissions
```

### Erro de Permissao
```bash
# Aceitar tudo na sessao
# Pressione 'a' quando aparecer o prompt
```

### Contexto Muito Grande
```bash
# Compactar contexto
/compact

# Ou iniciar nova sessao
/clear
```

### Erro no MCP
```bash
# Verificar configuracao
cat .mcp.json

# Testar conexao
curl -H "Authorization: Bearer TOKEN" URL_DO_MCP
```

---

## 9. RECURSOS ADICIONAIS

### Documentacao Oficial
- Claude Code: https://docs.anthropic.com/claude-code
- MCP Protocol: https://modelcontextprotocol.io
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs

### Comunidade
- GitHub Issues: https://github.com/anthropics/claude-code/issues
- Discord Anthropic: https://discord.gg/anthropic

---

## 10. CHECKLIST NOVO PROJETO

Ao iniciar um novo projeto similar:

- [ ] Criar `.claude/settings.json` com permissoes
- [ ] Criar `CLAUDE.md` com instrucoes
- [ ] Criar `.mcp.json` se usar servicos externos
- [ ] Configurar `.env.local` com tokens
- [ ] Instalar dependencias (`npm install`, `pip install`)
- [ ] Testar comandos basicos (`npm run dev`, etc)
- [ ] Commitar configuracoes iniciais

---

*Ultima atualizacao: Janeiro 2026*
*Autor: Claude Code + Igor*
