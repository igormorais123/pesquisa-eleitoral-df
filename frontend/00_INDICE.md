# INDICE - /frontend

## Estrutura Principal

frontend/src/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Rotas publicas
│   ├── (dashboard)/        # Rotas protegidas
│   └── api/                # API routes
├── components/             # React components
├── lib/                    # Utilitarios
├── services/               # API client
├── stores/                 # Zustand state
├── styles/                 # CSS/Tailwind
└── types/                  # TypeScript defs

## Paginas (app/)

### (auth)/
- login/page.tsx: Tela de login

### (dashboard)/
- eleitores/page.tsx: Lista de eleitores
- entrevistas/page.tsx: Gerenciar pesquisas
- resultados/page.tsx: Dashboard resultados
- candidatos/page.tsx: CRUD candidatos

## Componentes Principais

### components/eleitores/
- EleitorCard.tsx: Card do eleitor
- EleitorTable.tsx: Tabela virtualizada
- EleitorFiltros.tsx: Filtros avancados
- EleitorDetalhe.tsx: Modal detalhes

### components/charts/
- IntencaoVoto.tsx: Grafico intencao
- MapaCalor.tsx: Heatmap por RA
- NuvemPalavras.tsx: Word cloud
- DistribuicaoIdade.tsx: Histograma

### components/resultados/
- DashboardResultados.tsx: Dashboard principal
- TabelaResultados.tsx: Tabela dados
- ExportarResultados.tsx: PDF/Excel

### components/ui/
Componentes shadcn/ui base

## Bibliotecas (lib/)

### lib/claude/
- client.ts: Anthropic client
- prompts.ts: Templates prompts
- prompts-gestor.ts: Prompts gestores

### lib/ai/
- analise-estatistica.ts: Calculos
- classificador-perguntas.ts: Classificacao
- voto-silencioso.ts: Analise swing voters

### lib/export/
- pdf.ts: Geracao PDF
- excel.ts: Geracao XLSX
- csv.ts: Geracao CSV

## Services

### services/api.ts
- Axios client configurado
- Interceptors auth
- Base URL para /api/v1

## Stores (Zustand)

- auth-store.ts: Autenticacao
- eleitor-store.ts: Estado eleitores
- entrevista-store.ts: Estado entrevistas
