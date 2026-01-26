# SKILL: Navegação do Projeto

> **Propósito**: Ensinar IAs a navegar eficientemente pelas pastas do projeto Pesquisa Eleitoral DF, identificando rapidamente onde cada funcionalidade está implementada.

---

## MAPA MENTAL DO PROJETO

```
pesquisa-eleitoral-df/
│
├── 🐍 backend/          → API Python (FastAPI)
├── ⚛️ frontend/         → Interface React (Next.js)
├── 👥 agentes/          → Dados JSON (eleitores, candidatos)
├── 📚 docs/             → Documentação
├── 🔧 scripts/          → Scripts de utilidade
├── 📊 resultados/       → Outputs de simulações
└── 🧠 memorias/         → Memórias persistentes
```

---

## NAVEGAÇÃO POR OBJETIVO

### "Quero modificar a API"

```
backend/app/
├── api/rotas/           → Endpoints REST
│   ├── autenticacao.py  → Login, JWT
│   ├── eleitores.py     → CRUD eleitores
│   ├── pesquisas.py     → CRUD pesquisas
│   ├── entrevistas.py   → Execução pesquisas
│   └── resultados.py    → Análises
├── servicos/            → Lógica de negócio
│   ├── claude_servico.py    → Integração IA (CRÍTICO)
│   ├── pesquisa_servico.py  → Orquestração
│   └── resultado_servico.py → Estatísticas
├── modelos/             → SQLAlchemy models
└── esquemas/            → Pydantic schemas
```

### "Quero modificar a Interface"

```
frontend/src/
├── app/                 → Páginas (App Router)
│   ├── (dashboard)/     → Páginas protegidas
│   │   ├── eleitores/   → Lista eleitores
│   │   ├── entrevistas/ → Pesquisas
│   │   └── resultados/  → Charts, análises
│   └── api/             → Route handlers
├── components/          → Componentes React
│   ├── agentes/         → Tabela eleitores
│   ├── entrevistas/     → Executor
│   ├── resultados/      → Dashboard, charts
│   └── ui/              → shadcn components
├── stores/              → Zustand (estado global)
└── services/            → Clientes API
```

### "Quero modificar os Dados"

```
agentes/
├── banco-eleitores-df.json      → 1000+ eleitores
├── banco-candidatos-df-2026.json → Candidatos
├── banco-parlamentares-*.json    → Deputados, senadores
└── templates-perguntas-*.json    → Templates
```

### "Quero modificar Estilos"

```
frontend/src/
├── styles/globals.css           → Variáveis CSS, classes
├── tailwind.config.ts           → Cores, fontes, plugins
└── components/branding/         → Logo, marca
```

---

## LOCALIZAÇÃO POR FUNCIONALIDADE

| Funcionalidade | Arquivo Principal | Arquivos Relacionados |
|----------------|-------------------|----------------------|
| **Login/Auth** | `backend/app/core/seguranca.py` | `rotas/autenticacao.py`, `stores/auth-store.ts` |
| **Eleitores** | `backend/app/modelos/eleitor.py` | `rotas/eleitores.py`, `servicos/eleitor_servico_db.py` |
| **Pesquisas** | `backend/app/servicos/pesquisa_servico.py` | `rotas/pesquisas.py`, `stores/pesquisas-store.ts` |
| **Entrevista IA** | `backend/app/servicos/claude_servico.py` | `lib/claude/client.ts`, `prompts.ts` |
| **Resultados** | `backend/app/servicos/resultado_servico.py` | `rotas/resultados.py`, `components/resultados/` |
| **Gráficos** | `frontend/src/components/resultados/` | `recharts`, `plotly` |
| **Tema** | `frontend/src/stores/theme-store.ts` | `globals.css`, `tailwind.config.ts` |

---

## ATALHOS DE NAVEGAÇÃO

### Backend - Arquivos Críticos

| Ação | Comando para Encontrar |
|------|----------------------|
| Entry point | `backend/app/main.py` |
| Todas as rotas | `backend/app/api/rotas/` |
| Configuração | `backend/app/core/config.py` |
| JWT/Auth | `backend/app/core/seguranca.py` |
| Banco de dados | `backend/app/core/database.py` |
| Integração Claude | `backend/app/servicos/claude_servico.py` |

### Frontend - Arquivos Críticos

| Ação | Comando para Encontrar |
|------|----------------------|
| Layout raiz | `frontend/src/app/layout.tsx` |
| Página inicial | `frontend/src/app/page.tsx` |
| Dashboard | `frontend/src/app/(dashboard)/page.tsx` |
| Tabela eleitores | `frontend/src/components/agentes/banco-eleitores.tsx` |
| API client | `frontend/src/services/api.ts` |
| Stores | `frontend/src/stores/` |

---

## PADRÕES DE BUSCA

### Encontrar Endpoint da API

```bash
# Buscar por rota específica
grep -r "def listar_eleitores" backend/app/api/rotas/

# Buscar por decorador de rota
grep -r "@router.get" backend/app/api/rotas/
```

### Encontrar Componente React

```bash
# Buscar por nome do componente
grep -r "export.*BancoEleitores" frontend/src/components/

# Buscar por uso de hook
grep -r "useEleitoresStore" frontend/src/
```

### Encontrar Store Zustand

```bash
# Listar todas as stores
ls frontend/src/stores/

# Buscar por nome da store
grep -r "create<" frontend/src/stores/
```

---

## FLUXO DE DADOS

### Requisição do Frontend ao Backend

```
1. Componente React
   └── Chama service (ex: pesquisas-api.ts)
       └── Axios faz POST /api/v1/pesquisas
           └── FastAPI router (rotas/pesquisas.py)
               └── Service (servicos/pesquisa_servico.py)
                   └── Model (modelos/pesquisa.py)
                       └── PostgreSQL
```

### Execução de Pesquisa com IA

```
1. Frontend: IniciarPesquisa()
2. Backend: POST /pesquisas/{id}/executar
3. PesquisaServico.iniciar_execucao()
4. Para cada eleitor:
   └── ClaudeServico.entrevistar_eleitor()
       └── Anthropic API (Claude Sonnet 4)
5. Respostas salvas no banco
6. Frontend atualiza via polling/websocket
```

---

## CONVENÇÕES DE NOMENCLATURA

### Backend Python

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Arquivo de rota | `{entidade}.py` | `eleitores.py` |
| Arquivo de serviço | `{entidade}_servico.py` | `eleitor_servico.py` |
| Arquivo de modelo | `{entidade}.py` | `eleitor.py` |
| Arquivo de schema | `{entidade}.py` | `eleitor.py` |
| Função de rota | `listar_{entidades}()` | `listar_eleitores()` |
| Função de serviço | `{acao}_{entidade}()` | `criar_eleitor()` |

### Frontend TypeScript

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Página | `page.tsx` | `app/eleitores/page.tsx` |
| Componente | `{nome-kebab}.tsx` | `banco-eleitores.tsx` |
| Store | `{entidade}-store.ts` | `eleitores-store.ts` |
| Service | `{entidade}-api.ts` | `pesquisas-api.ts` |
| Hook | `use{Nome}` | `useEleitores` |

---

## DICAS DE NAVEGAÇÃO EFICIENTE

### Para IAs

1. **Comece pelo PROJECT_INDEX.md** - Visão geral rápida
2. **Use Glob para localizar** - `**/*.py` para arquivos Python
3. **Use Grep para conteúdo** - Buscar funções específicas
4. **Siga imports** - Imports revelam dependências
5. **Leia types primeiro** - `types/` no frontend define estruturas

### Ordem de Exploração Recomendada

1. `PROJECT_INDEX.md` - Mapa geral
2. `CLAUDE.md` - Regras do projeto
3. `backend/app/main.py` - Entry point backend
4. `frontend/src/app/layout.tsx` - Entry point frontend
5. Arquivo específico da tarefa

---

## COMANDOS ÚTEIS

### Listar Estrutura

```bash
# Ver estrutura do backend
tree backend/app -L 2

# Ver estrutura do frontend
tree frontend/src -L 2

# Ver arquivos de dados
ls -la agentes/
```

### Buscar Rapidamente

```bash
# Função específica no backend
grep -rn "def criar_pesquisa" backend/

# Componente no frontend
grep -rn "export function" frontend/src/components/

# Uso de API
grep -rn "api.post" frontend/src/
```

---

*Skill criada em: 2026-01-25*
*Mantida por: Claude Code*
