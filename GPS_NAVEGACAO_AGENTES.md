# GPS DE NAVEGACAO PARA AGENTES DE IA

> Documento de Engenharia de Contexto
> Projeto: Pesquisa Eleitoral DF 2026
> Atualizado: 25/01/2026

## REGRAS DE GESTAO DE CONTEXTO

### Zona Inteligente vs Zona Burra

| Zona | Porcent Contexto | Comportamento |
|------|------------------|---------------|
| INTELIGENTE | 0-40 | Explorar livremente, ler arquivos completos |
| ATENCAO | 40-60 | Compilar descobertas, focar no essencial |
| BURRA | maior 60 | PARAR, resumir e reiniciar |

### Trigger de Compilacao (40 porcento)

Quando atingir 40 porcento do contexto:
1. PARAR novas leituras
2. COMPILAR em arquivo temporario
3. SALVAR descobertas em WORK_LOG.md
4. REINICIAR com contexto limpo se necessario

---

## MAPA DE PASTAS (Visao Geral)

pesquisa-eleitoral-df/
- agentes/              Dados JSON dos eleitores/candidatos
- backend/              API FastAPI (Python)
- frontend/             UI Next.js (TypeScript)
- scripts/              Scripts de processamento
- docs/                 Documentacao
- memorias/             Persistencia de entrevistas
- resultados/           Outputs de pesquisas
- logs/                 Logs do sistema
- CLAUDE.md             Instrucoes base

---

## NAVEGACAO RAPIDA POR TAREFA

| Preciso de... | Ir para... | Arquivo chave |
|---------------|------------|---------------|
| Entender o projeto | CLAUDE.md | ./CLAUDE.md |
| Modificar API | backend/app/api/rotas/ | eleitores.py, entrevistas.py |
| Modificar UI | frontend/src/components/ | Ver subpastas por dominio |
| Dados de eleitores | agentes/ | banco-eleitores-df.json |
| Logica de IA | backend/app/servicos/ | claude_servico.py |
| Gerar eleitores | scripts/ | gerar_eleitores_df_v4.py |
| Deploy Vercel | CLAUDE.md | Secao Vercel Deploy |
| Deploy Render | CLAUDE.md | Secao Render Deploy |


## DETALHAMENTO: /agentes

Proposito: Armazenamento de dados JSON de eleitores sinteticos e candidatos

### Arquivos Principais
| Arquivo | Descricao | Registros |
|---------|-----------|-----------|
| banco-eleitores-df.json | PRINCIPAL - 1000+ perfis eleitorais | aprox 1000 |
| banco-candidatos-df-2026.json | Candidatos governador 2026 | aprox 10 |
| banco-deputados-federais-df.json | Deputados federais do DF | aprox 8 |
| banco-senadores-df.json | Senadores do DF | aprox 3 |
| banco-gestores.json | Gestores publicos para PODC | aprox 50 |
| regioes-administrativas-df.json | 33 RAs do DF + dados PDAD | 33 |
| templates-perguntas-eleitorais.json | Templates de perguntas | aprox 20 |

### Estrutura do Eleitor (60+ campos)

Campos principais:
- id, nome, idade, genero, cor_raca
- regiao_administrativa (33 RAs do DF)
- cluster_socioeconomico (A/B/C/D/E)
- orientacao_politica (esquerda/centro-esquerda/centro/centro-direita/direita)
- posicao_bolsonaro (apoiador/neutro/opositor)
- interesse_politico (0-10)
- vieses_cognitivos (array)
- preocupacoes (array)
- susceptibilidade_desinformacao (0-10)

---

## DETALHAMENTO: /backend

Stack: FastAPI + SQLAlchemy 2.0 + PostgreSQL
Porta: 8000

### Estrutura

backend/app/
- main.py                 Entry point FastAPI
- core/
  - config.py            Settings (env vars)
  - seguranca.py         JWT + bcrypt
- api/rotas/             Endpoints REST
  - eleitores.py         CRUD eleitores
  - entrevistas.py       Gestao entrevistas
  - candidatos.py        CRUD candidatos
  - pesquisas.py         Pesquisas eleitorais
  - resultados.py        Agregacao/analise
  - mensagens.py         Chat inteligente
- servicos/              Business logic
  - claude_servico.py    Integracao Claude API
  - entrevista_servico.py    Execucao entrevistas
  - eleitor_servico.py       Operacoes eleitores
  - resultado_servico.py     Calculos estatisticos
- esquemas/              Pydantic models
- modelos/               SQLAlchemy ORM

### Funcoes-Chave do claude_servico.py

class ClaudeServico:
    selecionar_modelo()      Opus 4.5 vs Sonnet 4.5
    calcular_custo()         Tokens para R dollar
    processar_resposta()     Chama Claude API
    gerar_persona()          Prompt com perfil eleitor

### Funcoes-Chave do entrevista_servico.py

class EntrevistaServico:
    criar()                  Nova entrevista
    executar()               Roda com Claude
    pausar() / retomar()     Controle execucao
    obter_progresso()        Status real-time

### Endpoints Principais
| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| /eleitores | GET | Lista paginada |
| /eleitores/id | GET | Eleitor especifico |
| /eleitores/estatisticas | GET | Agregacoes |
| /eleitores/filtrar | POST | Busca avancada |
| /entrevistas | POST | Criar entrevista |
| /entrevistas/id/executar | POST | Executar com IA |
| /resultados | GET | Analise agregada |


---

## DETALHAMENTO: /frontend

Stack: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
Porta: 3000

### Estrutura

frontend/src/
- app/                    Next.js App Router
  - (auth)/              Rotas publicas (login)
  - (dashboard)/         Rotas protegidas
    - eleitores/         Listagem/filtro eleitores
    - entrevistas/       Criar/executar pesquisas
    - resultados/        Graficos/analises
    - candidatos/        CRUD candidatos
  - api/                 API routes (proxy backend)
- components/            React components
  - eleitores/           Cards, tabelas, filtros
  - charts/              Recharts, Plotly
  - resultados/          Dashboard de resultados
  - ui/                  shadcn components
- lib/
  - claude/              Prompts e client
  - ai/                  Analises IA
  - export/              PDF, Excel, CSV
- services/api.ts        Axios client
- stores/                Zustand (auth, data)
- types/                 TypeScript interfaces

### Componentes Principais

components/eleitores/
- EleitorCard.tsx        Card individual do eleitor
- EleitorTable.tsx       Tabela com virtualizacao
- EleitorFiltros.tsx     Filtros avancados

components/charts/
- IntencaoVoto.tsx       Grafico barras/pizza
- MapaCalor.tsx          Heatmap por RA
- NuvemPalavras.tsx      Word cloud respostas

lib/claude/prompts.ts
Templates de prompts para tipos de perguntas:
- Sim/Nao
- Escala Likert
- Multipla escolha
- Ranking
- Resposta aberta

---

## DETALHAMENTO: /scripts

Proposito: Scripts Python para geracao/correcao de dados

### Scripts de Geracao
| Script | Funcao |
|--------|--------|
| gerar_eleitores_df_v4.py | Gera 1000+ eleitores sinteticos |
| gerar_parlamentares_brasil_completo.py | Gera parlamentares |
| pesquisa_governador_2026.py | Simula pesquisa completa |

### Scripts de Correcao/Validacao
| Script | Funcao |
|--------|--------|
| verificar_coerencia_completa.py | Valida consistencia dados |
| corrigir_inconsistencias.py | Corrige automaticamente |
| analisar_eleitores.py | Estatisticas descritivas |

### Scripts de Deploy
| Script | Funcao |
|--------|--------|
| deploy.ps1 | Deploy producao |
| dev.ps1 | Inicia ambiente dev |
| backup.ps1 | Backup dados |

---

## DETALHAMENTO: /docs

| Arquivo | Conteudo |
|---------|----------|
| README.md | Visao geral tecnica |
| Ficha Tecnica do Instrumento de Pesquisa.md | Metodologia |
| plano-implementacao-por-fases.md | Roadmap fases |
| glossario.md | Termos tecnicos |
| faq.md | Perguntas frequentes |

---

## DETALHAMENTO: Outras Pastas

### /memorias
Persistencia de estado das entrevistas:
- entrevistas.json       Lista de entrevistas
- respostas.json         Respostas coletadas
- eleitor-XXX-memorias.json   Memoria por eleitor

### /resultados
Outputs de pesquisas executadas:
- entrevista-XXX.json    Resultado individual
- arquivos .csv          Exportacoes

### /logs
Logs do sistema para debugging


---

## COMANDOS UTEIS

### Desenvolvimento
cd frontend && npm run dev                           Frontend
cd backend && uvicorn app.main:app --reload --port 8000   Backend
docker-compose up -d                                 Docker

### Deploy
cd frontend && vercel --prod                         Vercel (frontend)
git push origin main                                 Render (auto-deploy)

### Dados
python scripts/gerar_eleitores_df_v4.py             Gerar novos eleitores
python scripts/verificar_coerencia_completa.py      Validar consistencia

---

## FLUXOS DE TRABALHO COMUNS

### 1. Adicionar Novo Endpoint API
1. backend/app/esquemas/ -> Criar Pydantic model
2. backend/app/api/rotas/ -> Criar rota
3. backend/app/main.py -> Registrar router
4. frontend/src/services/api.ts -> Adicionar chamada

### 2. Adicionar Novo Componente UI
1. frontend/src/components/[dominio]/ -> Criar .tsx
2. frontend/src/types/ -> Adicionar types se necessario
3. frontend/src/app/(dashboard)/ -> Usar no page.tsx

### 3. Modificar Prompts do Claude
1. backend/app/servicos/claude_servico.py -> Logica
2. frontend/src/lib/claude/prompts.ts -> Templates

### 4. Adicionar Novo Tipo de Eleitor
1. scripts/gerar_eleitores_df_v4.py -> Logica geracao
2. agentes/banco-eleitores-df.json -> Regenerar
3. backend/app/esquemas/eleitor.py -> Atualizar schema

---

## ARQUIVOS DE CONFIGURACAO

| Arquivo | Proposito |
|---------|-----------|
| .env | Variaveis de ambiente (API keys) |
| .env.example | Template de .env |
| docker-compose.yml | Orquestracao containers |
| vercel.json | Config Vercel |
| .mcp.json | Config MCP servers |
| frontend/package.json | Deps frontend |
| backend/requirements.txt | Deps backend |

---

## DICAS DE PERFORMANCE PARA AGENTES

### Leituras Eficientes
- Use head -50 para preview de arquivos grandes
- Grep com contexto: grep -B2 -A2 termo
- JSON: use jq para filtrar campos especificos

### Evitar Desperdicio de Contexto
- NAO ler node_modules, __pycache__, .git
- NAO ler arquivos .json de backup (*_backup*.json)
- FOCAR em arquivos .py, .ts, .tsx, .md

### Compilar Progressivamente
- A cada descoberta importante -> adicionar ao WORK_LOG.md
- Ao finalizar sessao -> resumir em SESSAO_RESUMO.md

---

## WORK_LOG.md TEMPLATE

Crie/atualize este arquivo para persistir entre sessoes:

# Work Log - Pesquisa Eleitoral DF

## Sessao [DATA]
### Objetivo
[O que foi solicitado]

### Descobertas
- [Item 1]
- [Item 2]

### Modificacoes
- [Arquivo]: [O que foi alterado]

### Proximos Passos
- [ ] [Task pendente]

---

Documento gerado para otimizacao de contexto de agentes de IA
