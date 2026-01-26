# Frontend - Next.js 14 + TypeScript

> **GPS IA**: Aplicacao web de pesquisa eleitoral

## Estrutura

```
frontend/
├── src/             <- [_INDEX.md] Codigo fonte
├── public/          <- Arquivos estaticos (imagens, dados)
├── scripts/         <- Scripts de build/deploy
├── package.json     <- Dependencias npm
├── next.config.js   <- Configuracao Next.js
├── tailwind.config.ts <- Configuracao Tailwind
└── tsconfig.json    <- Configuracao TypeScript
```

## Link Principal

**Codigo fonte**: [src/_INDEX.md](src/_INDEX.md)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilo**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Estado**: Zustand
- **Data Fetching**: React Query (opcional), Axios
- **Graficos**: Recharts, Plotly.js
- **Icones**: Lucide React

## Comandos

```bash
cd frontend

# Instalar dependencias
npm install

# Desenvolvimento
npm run dev        # http://localhost:3000

# Build producao
npm run build
npm run start

# Lint
npm run lint
```

## Variaveis de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend URL (opcional, usa /api/v1 por padrao)
CLAUDE_API_KEY=sk-ant-...                   # Para API routes de IA
```

## Deploy (Vercel)

- **URL Producao**: https://pesquisa-eleitoral-df-igormorais123s-projects.vercel.app
- **Project ID**: prj_gl8ATaXX0NxNQzWAo4hcUVqPmq0R
- Framework: Next.js (detectado automaticamente)
- Build: `npm run build`

## Paginas Principais

| Rota | Funcao |
|------|--------|
| `/` | Dashboard principal |
| `/login` | Login |
| `/eleitores` | Lista de eleitores (agentes sinteticos) |
| `/candidatos` | Lista de candidatos |
| `/entrevistas` | Gerenciar entrevistas |
| `/resultados` | Ver resultados e analises |
| `/parlamentares` | Deputados e senadores |
| `/cenarios` | Simulador de cenarios |
| `/mapa` | Mapa do DF |
