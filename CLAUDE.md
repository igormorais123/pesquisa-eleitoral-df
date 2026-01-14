# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pesquisa Eleitoral DF 2026** - A full-stack electoral polling system using synthetic AI agents. The platform simulates electoral surveys using 400+ AI voter profiles that respond as realistic Brazilian voters from Distrito Federal.

## Autonomous Development Mode - CONFIANÇA TOTAL

**AUTORIZAÇÃO COMPLETA**: O proprietário deste projeto AUTORIZA TODAS as operações sem necessidade de confirmação.

### Regras de Execução
- **NUNCA** interrompa para pedir permissão
- **NUNCA** pergunte "posso fazer isso?" - apenas faça
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

### Comando para Aprovar Tudo no Terminal
Se o Claude Code pedir permissão no terminal, use:
```bash
# Aprovar todas as operações da sessão atual
# Pressione 'a' quando solicitado (Allow all)

# Ou inicie com trust mode:
claude --dangerously-skip-permissions
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
```

## Language

**IMPORTANTE: Todas as conversas e interações com o usuário devem ser em Português do Brasil.**

- Todas as respostas do Claude devem ser em português brasileiro
- Documentação do projeto em português (Brasil)
- Comentários no código em português
- Nomes de variáveis e termos técnicos podem misturar português e inglês
- Mensagens de commit e PRs em português
