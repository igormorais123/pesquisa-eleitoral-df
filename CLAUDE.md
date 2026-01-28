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

---

## SKILLS DO PROJETO

### Índice de Skills

Consultar: `.claude/skills/SKILLS_INDEX.md`

| Skill | Propósito | Quando Usar |
|-------|-----------|-------------|
| **branding-inteia** | Padrões visuais, cores, logo | Criar componentes UI, manter consistência visual |
| **navegacao-projeto** | Navegar pelas pastas | Início de sessão, encontrar arquivos |
| **funcoes-programa** | Usar funcionalidades | Implementar features, usar APIs |
| **criacao-skills** | Criar novas skills | Documentar conhecimento, ensinar IAs |

### Localização das Skills

```
.claude/skills/
├── SKILLS_INDEX.md           # Índice central
├── branding-inteia/
│   └── SKILL.md              # Cores, logo, padrões visuais
├── navegacao-projeto/
│   └── SKILL.md              # Mapa de pastas e arquivos
├── funcoes-programa/
│   └── SKILL.md              # Como usar o sistema
└── criacao-skills/
    └── SKILL.md              # Como criar novas skills
```

### Como Usar Skills

1. **Início de sessão** - Ler `navegacao-projeto` para orientação
2. **Criar UI** - Consultar `branding-inteia` para cores e padrões
3. **Implementar feature** - Seguir `funcoes-programa` para APIs
4. **Documentar** - Usar `criacao-skills` como template

### Regras para Skills

- Toda skill criada DEVE ser documentada
- Atualizar `SKILLS_INDEX.md` ao criar nova skill
- Atualizar este `CLAUDE.md` com resumo da skill
- Seguir template padrão em `criacao-skills`
- Commitar e pushar após criação

---

## PADRÃO VISUAL INTEIA - Design System para Relatórios

### Base Visual Oficial (v1.0 - Janeiro/2026)

**Referências de Implementação:**
- `frontend/public/resultados-stress-test/index.html` - Stress Test Eleitoral
- `Intenção de voto Celina Leao 01.2024-01.2026/relatorio/index.html` - Análise Científica

### Paleta de Cores

```css
/* Cores Principais */
--amber: #d69e2e;           /* Cor principal INTEIA */
--amber-light: #f6e05e;     /* Hover, destaques */
--amber-dark: #b7791f;      /* Gradientes, sombras */

/* Status */
--success: #22c55e;         /* Positivo, aprovado */
--warning: #eab308;         /* Atenção, moderado */
--danger: #ef4444;          /* Crítico, urgente */
--info: #3b82f6;            /* Informativo, neutro */

/* Tema Claro */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--text-primary: #0f172a;
--text-muted: #64748b;

/* Tema Escuro */
--bg-primary: #0f172a;
--bg-secondary: #1e293b;
--text-primary: #f8fafc;
```

### Estrutura de Relatório (Ordem de Importância)

1. **Header Hero** - Logo INTEIA + Pesquisador Responsável + Título + Badge Confidencial
2. **Conclusão Principal** - Box vermelho com conclusão da Helena (Agente IA)
3. **Recomendações Estratégicas** - Cards priorizados (🔴 Urgente → 🟡 Importante)
4. **Validação Estatística** - Amostra, margem, confiança, critérios
5. **KPIs** - 4 cards com métricas principais
6. **Mapa de Palavras** - Word cloud com termos frequentes
7. **Análises Específicas** - Gráficos, demographics, correlações
8. **Análise do Agente** - Helena com mensagens detalhadas
9. **Prompt/Persona** - Configuração completa do agente
10. **Pesquisador Responsável** - Card com contato
11. **Footer** - CNPJ, endereço, copyright

### Componentes Padrão

#### Logo INTEIA
```html
<div class="logo-box">IA</div>
<span class="logo-name">INTE<span class="highlight">IA</span></span>
<span class="logo-tagline">Inteligência Estratégica</span>
```

#### Pesquisador Responsável
```html
<div class="researcher-card">
    <div class="researcher-avatar">IM</div>
    <div class="researcher-info">
        <h3>Igor Morais Vasconcelos</h3>
        <div class="role">Pesquisador Responsável | Presidente INTEIA</div>
        <div class="contact">
            <strong>Email:</strong> igor@inteia.com.br<br>
            <strong>Site:</strong> inteia.com.br
        </div>
    </div>
</div>
```

#### Card de Recomendação
```html
<div class="recommendation-card urgent">  <!-- urgent | important | monitor -->
    <span class="rec-priority">🔴 Urgente - Prioridade 1</span>
    <h3 class="rec-title">Título da Ação</h3>
    <p class="rec-description">Descrição detalhada...</p>
</div>
```

#### Agente Helena
```html
<div class="helena-header">
    <div class="helena-avatar"><!-- SVG icon --></div>
    <div class="helena-info">
        <h3>Helena Montenegro</h3>
        <p>Agente de Sistemas de IA Avançados | Cientista Política</p>
    </div>
    <div class="helena-badge">IA Avançada</div>
</div>
```

### Funcionalidades Obrigatórias

- ✅ **Tema claro/escuro** com toggle
- ✅ **Botão imprimir A4** com CSS @media print
- ✅ **Sidebar lateral** fixa com logo INTEIA
- ✅ **Responsivo** (desktop, tablet, mobile)
- ✅ **Chart.js** para gráficos interativos
- ✅ **Google Fonts Inter** para tipografia

### Tipografia

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Hierarquia */
h1: 32px, weight 700, letter-spacing -0.02em
h2: 20px, weight 700
h3: 18px, weight 700
body: 14px, weight 400, line-height 1.6
small: 12px, weight 500
```

### Espaçamento

```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
```

### Border Radius

```css
--radius-sm: 0.375rem;  /* 6px - botões pequenos */
--radius-md: 0.5rem;    /* 8px - inputs */
--radius-lg: 0.75rem;   /* 12px - cards */
--radius-xl: 1rem;      /* 16px - cards grandes */
--radius-2xl: 1.5rem;   /* 24px - hero sections */
```

### Regras de Conteúdo

1. **Nunca mencionar nomes de candidatos adversários** - usar características genéricas
2. **Helena sempre como "Agente de Sistemas de IA Avançados"**
3. **Validação estatística obrigatória** com margem de erro e nível de confiança
4. **Conclusão no INÍCIO** do relatório, não no fim
5. **Recomendações priorizadas** por urgência
6. **Pesquisador Responsável** em vez de "Técnico Responsável"
7. **Todos os acentos em português** corretamente aplicados

### Footer Padrão

```
INTEIA - Inteligência Estratégica
CNPJ: 63.918.490/0001-20
SHN Quadra 2 Bloco F, Sala 625/626 - Brasília/DF
inteia.com.br | igor@inteia.com.br
© 2026 INTEIA. Todos os direitos reservados.
```

### CSS de Impressão - Padrão 1 Página A4 Paisagem

**IMPORTANTE**: Para relatórios que precisam caber em 1 página, usar este padrão testado e aprovado.

**Regras Fundamentais:**
- Usar **mm** (milímetros) para espaçamentos e tamanhos de elementos
- Usar **pt** (pontos) para tamanhos de fonte
- **NÃO usar px** - pixels não são precisos na impressão
- Gráficos: altura mínima **28mm** para serem legíveis
- Grids: forçar com `display: grid !important` e `grid-template-columns: ... !important`
- Margens da página: **5mm** é o ideal
- Sempre incluir `-webkit-print-color-adjust: exact`

```css
/* PRINT - 1 PAGE A4 LANDSCAPE */
@media print {
    @page { size: A4 landscape; margin: 5mm; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body { background: #fff !important; }
    .sidebar, .topbar, .fab, .no-print { display: none !important; }
    .main { margin: 0 !important; padding: 0 !important; }
    .container { max-width: 100% !important; padding: 0 !important; }

    /* Header compacto */
    .header { margin-bottom: 3mm !important; }
    .logo-box { width: 7mm !important; height: 7mm !important; font-size: 9pt !important; }
    .logo-text { font-size: 14pt !important; }
    .title { font-size: 12pt !important; }
    .subtitle { font-size: 8pt !important; }

    /* Gráficos - USAR mm PARA ALTURA */
    .grid2 {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 3mm !important;
    }
    .chart-box { height: 28mm !important; }  /* ~106px - tamanho ideal */

    /* Cards em 4 colunas */
    .grid4 {
        display: grid !important;
        grid-template-columns: repeat(4, 1fr) !important;
        gap: 2mm !important;
    }
    .mini h4 { font-size: 7pt !important; }
    .mini p { font-size: 6pt !important; }

    .footer { font-size: 6pt !important; }
}
```

**Referência implementada:** `frontend/public/analise-ibaneis-2026/index.html`

---

## ÍNDICES DE NAVEGAÇÃO

| Arquivo | Propósito |
|---------|-----------|
| `PROJECT_INDEX.md` | Mapa completo do projeto para IAs |
| `.claude/skills/SKILLS_INDEX.md` | Catálogo de skills |
| `docs/` | Documentação técnica |

### Ordem de Leitura Recomendada para IAs

1. `CLAUDE.md` (este arquivo) - Regras gerais
2. `PROJECT_INDEX.md` - Estrutura do projeto
3. `.claude/skills/navegacao-projeto/SKILL.md` - Como navegar
4. Skill específica da tarefa
