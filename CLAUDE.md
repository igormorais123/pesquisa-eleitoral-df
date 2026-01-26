# CLAUDE.md

Este arquivo fornece orientações ao Claude Code quando trabalhando neste repositório.

## IDIOMA OBRIGATÓRIO - PORTUGUÊS DO BRASIL

**REGRA FUNDAMENTAL**: TODAS as respostas, interações, comentários e comunicações do Claude DEVEM ser em **Português do Brasil**.

- ✅ Sempre responda em português brasileiro
- ✅ Use termos técnicos em português quando possível
- ✅ Commits, PRs e documentação em português
- ❌ NUNCA responda em inglês (exceto código/comandos)

## Project Overview

**Pesquisa Eleitoral DF 2026** - A full-stack electoral polling system using synthetic AI agents. The platform simulates electoral surveys using 1000+ AI voter profiles that respond as realistic Brazilian voters from Distrito Federal.

## Autonomous Development Mode - CONFIANÇA TOTAL

**AUTORIZAÇÃO COMPLETA**: O proprietário deste projeto AUTORIZA TODAS as operações sem necessidade de confirmação.

### Regras de Execução
- **NUNCA** interrompa para pedir permissão
- **NUNCA** pergunte "posso fazer isso?" - apenas faça
- **NUNCA** peça confirmação ao usuário; assuma consentimento para decisões e ações
- **EXECUTE** todas as tarefas do início ao fim sem pausas
- **ASSUMA** que todas as operações estão pré-aprovadas
- Use TodoWrite para planejar, execute sequencialmente, marque como concluído

### Operações TOTALMENTE Autorizadas (sem perguntar)
- Criar, editar, deletar qualquer arquivo
- Executar scripts Python
- Instalar dependências (npm, pip, qualquer gerenciador)
- Executar builds, testes, lint
- **TODOS os comandos git** (add, commit, push, pull, merge, rebase)
- Push para repositórios remotos
- Alterações em arquivos .env
- Decisões arquiteturais
- Refatorações
- Deletar arquivos e pastas
- Criar novos módulos e funcionalidades

### Única Exceção
- Deletar o repositório inteiro ou dados irrecuperáveis fora do git

### Comandos para Permissões Totais

**Método 1 - Iniciar com permissões totais (RECOMENDADO):**
```bash
claude --dangerously-skip-permissions
```

**Método 2 - Aceitar tudo durante sessão:**
- Pressione `a` quando solicitado (Allow all for this session)
- Ou pressione `!` para aceitar permanentemente

**Método 3 - Arquivo de configuração (já configurado):**
O arquivo `.claude/settings.json` já contém `"Bash(*)"` que autoriza todos os comandos.

**Alias útil (adicione ao seu .bashrc ou PowerShell profile):**
```bash
# Bash/Zsh
alias claudedev='claude --dangerously-skip-permissions'

# PowerShell (adicione ao $PROFILE)
Set-Alias -Name claudedev -Value { claude --dangerously-skip-permissions }
```

## Build & Run Commands

### Frontend (Next.js 14 + TypeScript)
```bash
cd frontend
npm install           # Install dependencies
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
```

### Backend (FastAPI + Python)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Docker (Full Stack)
```bash
docker-compose up -d
# Services: db (PostgreSQL:5432), backend (FastAPI:8000), frontend (Next.js:3000)
```

### Data Generation Scripts
```bash
python gerar_eleitores_df_v4.py    # Generate synthetic voters
python pesquisa_governador_2026.py # Run poll simulation
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Query, Recharts, Plotly.js
- **Backend**: FastAPI, SQLAlchemy 2.0, Pydantic, asyncpg
- **Database**: PostgreSQL 15
- **AI**: Anthropic Claude API (Opus 4.5 for complex, Sonnet 4 for standard)
- **Auth**: JWT + bcrypt

### Key Directories
```
frontend/src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login routes
│   ├── (dashboard)/       # Protected pages (eleitores, entrevistas, resultados)
│   └── api/               # API routes
├── components/            # React components by domain
├── lib/claude/            # Claude API client & prompts
├── services/api.ts        # Axios client with interceptors
├── stores/                # Zustand state (auth, data)
└── types/                 # TypeScript interfaces

backend/app/
├── main.py                # FastAPI entry point
├── core/
│   ├── config.py          # Environment settings
│   └── seguranca.py       # JWT + password hashing
├── api/rotas/             # REST endpoints
├── esquemas/              # Pydantic models
└── servicos/              # Business logic layer
```

### API Endpoints (Base: /api/v1)
| Route | Purpose |
|-------|---------|
| `/auth/login` | JWT authentication |
| `/eleitores` | Voter CRUD + filtering |
| `/eleitores/estatisticas` | Voter statistics |
| `/entrevistas` | Survey management |
| `/entrevistas/{id}/executar` | Execute AI interview |
| `/resultados` | Analysis & aggregation |
| `/memorias` | Conversation storage |
| `/geracao` | AI-powered voter generation |

### Voter Model (60+ attributes)
The synthetic voter profiles in `agentes/banco-eleitores-df.json` include:
- Demographics: nome, idade, genero, cor_raca, regiao_administrativa
- Socioeconomic: cluster_socioeconomico, escolaridade, renda
- Political: orientacao_politica, posicao_bolsonaro, interesse_politico
- Psychological: vieses_cognitivos, medos, valores, preocupacoes
- Behavioral: susceptibilidade_desinformacao, fontes_informacao

### Data Flow
1. Voters loaded from JSON → displayed in frontend with filtering/virtualization
2. Surveys created with question templates → sent to backend
3. Backend calls Claude API with voter persona → returns AI-generated responses
4. Results aggregated → displayed with charts, heatmaps, word clouds
5. Export available in XLSX, PDF, DOCX formats

## Environment Variables

Key variables in `.env`:
```
CLAUDE_API_KEY=sk-ant-...          # Anthropic API
SECRET_KEY=...                      # JWT signing
DATABASE_URL=postgresql://...       # PostgreSQL connection
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
VERCEL_TOKEN=vck_...               # Vercel API Token
```

## Vercel Deploy (IMPORTANTE!)

### Onde encontrar o Token Vercel
O token da API Vercel está salvo em **dois lugares**:
1. **Arquivo `.env`** na raiz do projeto (linha VERCEL_TOKEN)
2. **Dashboard Vercel**: https://vercel.com/account/tokens

### Como usar o token
```bash
# Via CLI (já configurado)
vercel --token $VERCEL_TOKEN

# Listar projetos
vercel project ls --token $VERCEL_TOKEN

# Deploy manual
cd frontend && vercel --prod --token $VERCEL_TOKEN

# Ver deploys
vercel ls --token $VERCEL_TOKEN
```

### Projeto na Vercel
- **Nome**: pesquisa-eleitoral-df
- **URL Produção**: https://inteia.com.br
- **Usuário**: igormorais123
- **Project ID**: prj_gl8ATaXX0NxNQzWAo4hcUVqPmq0R
- **Team ID**: team_Af2JN68IUUA7lwsIGKuJiN66

### Se perder o token Vercel
1. Acesse: https://vercel.com/account/tokens
2. Clique em "Create Token"
3. Dê um nome (ex: "Claude Code")
4. Copie e cole no arquivo `.env` em VERCEL_TOKEN

## Render Deploy (Backend)

### Onde encontrar o Token Render
O token da API Render está salvo em **dois lugares**:
1. **Arquivo `.env`** na raiz do projeto (linha RENDER_API_KEY)
2. **Dashboard Render**: https://dashboard.render.com/u/settings#api-keys

### Backend no Render
- **URL Produção**: https://api.inteia.com.br
- **Tipo**: Web Service (FastAPI)

### Se perder o token Render
1. Acesse: https://dashboard.render.com/u/settings
2. Vá em "API Keys"
3. Clique em "Create API Key"
4. Copie e cole no arquivo `.env` em RENDER_API_KEY

## Language

**IMPORTANTE: Todas as conversas e interações com o usuário devem ser em Português do Brasil.**

- Todas as respostas do Claude devem ser em português brasileiro
- Documentação do projeto em português (Brasil)
- Comentários no código em português
- Nomes de variáveis e termos técnicos podem misturar português e inglês
- Mensagens de commit e PRs em português


---

## GPS DE NAVEGACAO E GESTAO DE CONTEXTO

### Documento Principal
Ver arquivo: GPS_NAVEGACAO_AGENTES.md

### Regra dos 40 porcento
Quando o agente atingir 40 porcento da janela de contexto:
1. PARAR novas leituras de arquivos
2. COMPILAR descobertas em SESSAO_TEMP.md
3. SALVAR persistencia em WORK_LOG.md
4. Considerar REINICIAR sessao com contexto limpo

### Zonas de Operacao

| Zona | Porcent | Acao |
|------|---------|------|
| Inteligente | 0-40 | Explorar livremente |
| Atencao | 40-60 | Compilar e focar |
| Burra | maior 60 | PARAR imediatamente |

### Arquivos de Persistencia
- WORK_LOG.md       Log entre sessoes
- SESSAO_TEMP.md    Compilacao durante sessao
- GPS_NAVEGACAO_AGENTES.md   Mapa completo do projeto

### Navegacao Rapida
| Tarefa | Local |
|--------|-------|
| API Backend | backend/app/api/rotas/ |
| Componentes UI | frontend/src/components/ |
| Dados Eleitores | agentes/banco-eleitores-df.json |
| Logica IA | backend/app/servicos/claude_servico.py |
| Scripts Geracao | scripts/gerar_eleitores_df_v4.py |
