# PROJECT_INDEX.md - Índice de Navegação para IAs

> **Propósito**: Este arquivo serve como mapa do projeto para agentes de IA navegarem pelo código de forma eficiente, gastando o mínimo de tokens de contexto.

---

## REGRA DE CONTEXTO (40%)

**IMPORTANTE PARA IAs**: Quando sua janela de contexto atingir **40% do limite**, execute este procedimento:

```markdown
## COMPILAÇÃO DE CONTEXTO (40%)

Ao atingir 40% do limite de contexto, a IA deve:

1. **PARAR** qualquer exploração adicional
2. **COMPILAR** um resumo do que foi aprendido até agora
3. **SALVAR** conclusões importantes em formato estruturado
4. **PRIORIZAR** apenas as informações essenciais para a tarefa atual
5. **DESCARTAR** detalhes de implementação já processados

### Template de Compilação:
```
CONTEXTO COMPILADO:
- Objetivo da tarefa: [descrever]
- Arquivos relevantes encontrados: [listar máx 5]
- Decisões tomadas: [listar]
- Próximos passos: [listar máx 3]
- Informações descartáveis: [marcar para remoção]
```

### Sinais de Alerta:
- Muitos arquivos abertos sem conclusão
- Repetição de buscas similares
- Exploração de código não relacionado à tarefa
```

---

## ÍNDICE RÁPIDO

| Seção | Ir Para |
|-------|---------|
| Visão Geral | [#visão-geral](#visão-geral) |
| Estrutura de Pastas | [#estrutura-de-pastas](#estrutura-de-pastas) |
| Backend (FastAPI) | [#backend-fastapi-python](#backend-fastapi-python) |
| Frontend (Next.js) | [#frontend-nextjs-typescript](#frontend-nextjs-typescript) |
| Banco de Dados | [#banco-de-dados-json](#banco-de-dados-json) |
| Fluxos de Dados | [#fluxos-de-dados](#fluxos-de-dados) |
| Arquivos Críticos | [#arquivos-críticos](#arquivos-críticos) |
| CLAUDE.md | [#claudemd-instruções](#claudemd-instruções) |

---

## VISÃO GERAL

**Pesquisa Eleitoral DF 2026** - Sistema full-stack de pesquisas eleitorais usando 1000+ agentes IA sintéticos que respondem como eleitores reais do Distrito Federal.

### Stack Tecnológico
- **Backend**: FastAPI + SQLAlchemy 2.0 + PostgreSQL + Anthropic Claude API
- **Frontend**: Next.js 14 + TypeScript + Tailwind + shadcn/ui + Zustand
- **IA**: Claude Sonnet 4 (entrevistas) + Claude Opus 4.5 (análises)

### Recursos Principais
- 1000+ eleitores sintéticos com 60+ atributos cada
- 4 etapas cognitivas para respostas realistas
- 20+ filtros simultâneos para segmentação
- Análises: correlações, sentimentos, word clouds, mapas de calor
- Export: Excel, PDF, CSV, JSON

---

## ESTRUTURA DE PASTAS

```
pesquisa-eleitoral-df/
├── backend/                    # API FastAPI (Python)
│   └── app/
│       ├── api/rotas/         # 18+ endpoints REST
│       ├── core/              # Config, Auth, Database
│       ├── modelos/           # SQLAlchemy models
│       ├── esquemas/          # Pydantic schemas
│       ├── servicos/          # Lógica de negócio
│       └── parlamentares/     # Módulo parlamentares
├── frontend/                   # Next.js (TypeScript)
│   └── src/
│       ├── app/               # App Router (pages)
│       ├── components/        # React components
│       ├── lib/               # Utilidades
│       ├── services/          # API clients
│       ├── stores/            # Zustand stores
│       └── types/             # TypeScript types
├── agentes/                    # Dados JSON
│   ├── banco-eleitores-df.json        # 1000+ eleitores
│   ├── banco-candidatos-df-2026.json  # Candidatos
│   └── templates-perguntas-*.json     # Templates
├── docs/                       # Documentação
├── scripts/                    # Scripts de utilidade
├── resultados/                 # Resultados de simulações
└── memorias/                   # Memórias persistentes
```

---

## BACKEND FASTAPI PYTHON

**Localização**: `backend/app/`

### Arquivos de Entrada
| Arquivo | Propósito |
|---------|-----------|
| `main.py` | Entry point, registra 18+ rotas |
| `core/config.py` | Configurações (.env) |
| `core/database.py` | Conexão PostgreSQL |
| `core/seguranca.py` | JWT + bcrypt |

### Rotas Principais (`api/rotas/`)
| Rota | Arquivo | Funções Principais |
|------|---------|-------------------|
| `/auth` | `autenticacao.py` | `login()`, `refresh_token()` |
| `/eleitores` | `eleitores.py` | `listar_eleitores()` (20+ filtros), `obter_estatisticas()` |
| `/pesquisas` | `pesquisas.py` | `criar_pesquisa()`, `iniciar_pesquisa()` |
| `/entrevistas` | `entrevistas.py` | `criar_entrevista()`, `iniciar_entrevista()` |
| `/resultados` | `resultados.py` | `obter_resultados()`, `obter_analises()` |
| `/candidatos` | `candidatos.py` | CRUD candidatos |
| `/cenarios` | `cenarios_eleitorais.py` | `simular_votacao()` |
| `/memorias` | `memorias.py` | Conversas persistentes |
| `/geracao` | `geracao.py` | `gerar_eleitores()` via IA |

### Serviços Críticos (`servicos/`)
| Serviço | Arquivo | Função Principal |
|---------|---------|-----------------|
| **Claude** | `claude_servico.py` | `entrevistar_eleitor()` - 4 etapas cognitivas |
| **Pesquisa** | `pesquisa_servico.py` | Orquestra execução de entrevistas |
| **Resultado** | `resultado_servico.py` | Estatísticas, correlações, insights |
| **Eleitor** | `eleitor_servico_db.py` | CRUD eleitores com filtros |
| **Geração** | `geracao_servico.py` | Gera novos eleitores via Claude |

### Modelos SQLAlchemy (`modelos/`)
| Modelo | Campos-Chave |
|--------|-------------|
| `Eleitor` | 60+ campos: demográficos, socioeconômicos, políticos, psicológicos |
| `Pesquisa` | titulo, status, perguntas[] |
| `Resposta` | eleitor_id, pergunta_id, valor_json |
| `Usuario` | username, papel (admin/pesquisador/visualizador) |
| `Candidato` | nome, cargo, partido, rejeicao |

---

## FRONTEND NEXTJS TYPESCRIPT

**Localização**: `frontend/src/`

### Páginas Principais (`app/`)
| Página | Rota | Descrição |
|--------|------|-----------|
| Login | `/login` | Autenticação |
| Dashboard | `/` | Visão geral |
| Eleitores | `/eleitores` | Tabela virtualizada 1000+ |
| Entrevistas | `/entrevistas` | Criar/executar pesquisas |
| Resultados | `/resultados/[id]` | Charts, análises |
| Candidatos | `/candidatos` | Gestão candidatos |
| Cenários | `/cenarios` | Simulador eleição |

### Componentes-Chave (`components/`)
| Componente | Arquivo | Função |
|------------|---------|--------|
| **Tabela Eleitores** | `agentes/banco-eleitores.tsx` | TanStack Virtual, 1000+ rows |
| **Executor** | `entrevistas/executor-entrevista.tsx` | Execução tempo real |
| **Dashboard** | `resultados/dashboard-resultados.tsx` | Charts agregados |
| **Sidebar** | `layout/sidebar.tsx` | Navegação |

### Stores Zustand (`stores/`)
| Store | Estado |
|-------|--------|
| `auth-store.ts` | Token JWT, usuário logado |
| `eleitores-store.ts` | Lista eleitores, filtros |
| `pesquisas-store.ts` | Pesquisas, progresso |
| `resultados-store.ts` | Dados análises |

### Services API (`services/`)
| Service | Endpoints |
|---------|-----------|
| `api.ts` | Axios com interceptors JWT |
| `pesquisas-api.ts` | CRUD pesquisas |
| `analytics-api.ts` | Métricas, correlações |

---

## BANCO DE DADOS JSON

**Localização**: `agentes/`

### Arquivos de Dados
| Arquivo | Conteúdo | Registros |
|---------|----------|-----------|
| `banco-eleitores-df.json` | Eleitores sintéticos | 1000+ |
| `banco-eleitores-df-clean.json` | Versão limpa | 1000+ |
| `banco-candidatos-df-2026.json` | Candidatos DF | ~50 |
| `banco-parlamentares-brasil.json` | Parlamentares | 500+ |
| `templates-perguntas-eleitorais.json` | Templates | ~1000 |

### Estrutura do Eleitor (60+ campos)
```json
{
  "id": "eleitor-001",
  "nome": "João da Silva",
  // Demográficos
  "idade": 35, "genero": "masculino", "cor_raca": "pardo",
  // Geográficos
  "regiao_administrativa": "Asa Norte",
  // Socioeconômicos
  "cluster_socioeconomico": "G3_media_baixa",
  "escolaridade": "ensino médio", "profissao": "técnico",
  "renda_salarios_minimos": "5-7",
  // Políticos
  "orientacao_politica": "centro-esquerda",
  "posicao_bolsonaro": "critico_forte",
  "interesse_politico": "medio",
  // Psicológicos (arrays)
  "valores": ["família", "honestidade"],
  "preocupacoes": ["emprego", "saúde"],
  "medos": ["desemprego"],
  "vieses_cognitivos": ["viés de confirmação"],
  // Comportamentais
  "fontes_informacao": ["TV", "WhatsApp"],
  "historia_resumida": "...",
  "instrucao_comportamental": "..."
}
```

---

## FLUXOS DE DADOS

### Fluxo de Autenticação
```
Frontend login → POST /auth/login → JWT token → Header Authorization
```

### Fluxo de Pesquisa
```
1. Criar pesquisa (título, perguntas)
2. Selecionar eleitores (filtros)
3. Iniciar execução
4. Claude API processa cada eleitor
5. Respostas salvas no banco
6. Análises calculadas
7. Dashboard exibe resultados
```

### 4 Etapas Cognitivas (Claude)
```
1. FILTRO DE ATENÇÃO → "Prestaria atenção?"
2. VIÉS DE CONFIRMAÇÃO → "Confirma ou ameaça crenças?"
3. REAÇÃO EMOCIONAL → "Como se sente?"
4. DECISÃO → "Qual a resposta genuína?"
```

---

## ARQUIVOS CRÍTICOS

### Para Modificar Autenticação
- `backend/app/core/seguranca.py` - JWT/bcrypt
- `backend/app/api/rotas/autenticacao.py` - Login endpoint
- `frontend/src/stores/auth-store.ts` - Estado auth

### Para Modificar Eleitores
- `backend/app/modelos/eleitor.py` - Modelo 60+ campos
- `backend/app/servicos/eleitor_servico_db.py` - CRUD
- `backend/app/api/rotas/eleitores.py` - API endpoints
- `agentes/banco-eleitores-df.json` - Dados JSON

### Para Modificar Pesquisas
- `backend/app/servicos/pesquisa_servico.py` - Orquestração
- `backend/app/servicos/claude_servico.py` - Integração IA
- `backend/app/api/rotas/pesquisas.py` - API endpoints

### Para Modificar Resultados
- `backend/app/servicos/resultado_servico.py` - Análises
- `frontend/src/components/resultados/` - Charts
- `backend/app/api/rotas/resultados.py` - API endpoints

### Para Modificar Frontend UI
- `frontend/src/app/` - Pages (App Router)
- `frontend/src/components/` - React components
- `frontend/src/components/ui/` - shadcn components

---

## COMANDOS ÚTEIS

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # localhost:3000
```

### Docker
```bash
docker-compose up -d  # Todos os serviços
```

### Scripts
```bash
python scripts/gerar_eleitores_df_v4.py      # Gerar eleitores
python scripts/pesquisa_governador_2026.py   # Simular pesquisa
```

---

## CLAUDE.MD INSTRUÇÕES

O arquivo `CLAUDE.md` na raiz contém instruções específicas para o Claude Code:

### Principais Regras
1. **Idioma**: Sempre português brasileiro
2. **Autonomia Total**: Autorização para todas as operações sem confirmação
3. **Operações Permitidas**: git, npm, pip, edição de arquivos, builds, deploys
4. **Única Exceção**: Deletar repositório inteiro

### Deploy
- **Vercel** (Frontend): Token em `.env` → `VERCEL_TOKEN`
- **Render** (Backend): Token em `.env` → `RENDER_API_KEY`

### Variáveis de Ambiente Críticas
```
CLAUDE_API_KEY=sk-ant-...      # Anthropic API
DATABASE_URL=postgresql://...   # PostgreSQL
SECRET_KEY=...                  # JWT signing
VERCEL_TOKEN=...               # Deploy frontend
RENDER_API_KEY=...             # Deploy backend
```

---

## PADRÕES DE CÓDIGO

### Backend Python
- FastAPI com async/await
- Pydantic para validação
- SQLAlchemy 2.0 async
- Injeção de dependência para auth

### Frontend TypeScript
- Next.js 14 App Router
- Zustand para estado global
- React Query para cache
- shadcn/ui para componentes
- Tailwind para estilização

### Convenções de Commit
```
feat(escopo): descrição
fix(escopo): descrição
docs: descrição
refactor(escopo): descrição
```

---

## NAVEGAÇÃO RÁPIDA POR TAREFA

### "Quero entender como funciona X"
| X | Arquivos a Ler |
|---|----------------|
| Autenticação | `core/seguranca.py`, `rotas/autenticacao.py` |
| Entrevista IA | `servicos/claude_servico.py` |
| Filtros eleitores | `rotas/eleitores.py:listar_eleitores()` |
| Resultados | `servicos/resultado_servico.py` |
| Tabela virtual | `components/agentes/banco-eleitores.tsx` |

### "Quero adicionar/modificar Y"
| Y | Arquivos a Modificar |
|---|---------------------|
| Novo endpoint | `api/rotas/` + `servicos/` + `esquemas/` |
| Novo campo eleitor | `modelos/eleitor.py` + `esquemas/eleitor.py` |
| Nova página | `frontend/src/app/nova-pagina/page.tsx` |
| Novo componente | `frontend/src/components/` |
| Nova store | `frontend/src/stores/` |

---

## CHECKLIST PARA IAs

Antes de começar qualquer tarefa:

- [ ] Li o objetivo da tarefa
- [ ] Identifiquei a camada (backend/frontend/dados)
- [ ] Localizei os arquivos relevantes neste índice
- [ ] Verifiquei dependências entre módulos
- [ ] Estou monitorando uso de contexto (40% = compilar)

---

*Última atualização: 2026-01-25*
*Gerado automaticamente para navegação de IAs*
