# App - Next.js Pages e API Routes

> **GPS IA**: Paginas e rotas do Next.js 14 (App Router)

## Estrutura

```
app/
├── (auth)/              <- Rotas de autenticacao (layout publico)
│   ├── login/           <- /login
│   └── cadastro/        <- /cadastro
├── (dashboard)/         <- Rotas protegidas (layout com sidebar)
│   ├── eleitores/       <- /eleitores
│   ├── candidatos/      <- /candidatos
│   ├── entrevistas/     <- /entrevistas
│   ├── resultados/      <- /resultados
│   ├── parlamentares/   <- /parlamentares
│   ├── gestores/        <- /gestores
│   ├── cenarios/        <- /cenarios
│   ├── mapa/            <- /mapa
│   ├── analytics/       <- /analytics
│   ├── admin/           <- /admin (apenas admin)
│   └── ...
├── api/                 <- API Routes (proxy para backend)
│   ├── v1/              <- /api/v1/* (proxy)
│   └── claude/          <- /api/claude/* (integracao IA)
└── auth/google/         <- OAuth Google callback
```

## Paginas Principais

| Rota | Arquivo | Funcao |
|------|---------|--------|
| `/` | `(dashboard)/page.tsx` | Dashboard principal |
| `/login` | `(auth)/login/page.tsx` | Login |
| `/cadastro` | `(auth)/cadastro/page.tsx` | Registro |
| `/eleitores` | `(dashboard)/eleitores/page.tsx` | Lista de eleitores |
| `/eleitores/[id]` | `(dashboard)/eleitores/[id]/page.tsx` | Detalhe do eleitor |
| `/eleitores/gerar` | `(dashboard)/eleitores/gerar/page.tsx` | Gerar eleitores via IA |
| `/candidatos` | `(dashboard)/candidatos/page.tsx` | Lista de candidatos |
| `/entrevistas` | `(dashboard)/entrevistas/page.tsx` | Lista de entrevistas |
| `/entrevistas/nova` | `(dashboard)/entrevistas/nova/page.tsx` | Criar entrevista |
| `/entrevistas/execucao` | `(dashboard)/entrevistas/execucao/page.tsx` | Executar entrevista |
| `/resultados` | `(dashboard)/resultados/page.tsx` | Resultados |
| `/resultados/[sessaoId]` | `(dashboard)/resultados/[sessaoId]/page.tsx` | Resultado especifico |

## API Routes

### api/v1/ (Proxy para Backend)
Todas as chamadas para `/api/v1/*` sao redirecionadas para o backend FastAPI.

### api/claude/ (Integracao IA)
- `/api/claude/entrevista` - Executar entrevista com IA
- `/api/claude/gerar-agentes` - Gerar eleitores
- `/api/claude/insights` - Gerar insights
- `/api/claude/chat-resultados` - Chat sobre resultados
- `/api/claude/extrair-dados` - Extrair dados de texto
- `/api/claude/sintetizar` - Sintetizar respostas
- `/api/claude/gerar-perguntas` - Gerar perguntas
- `/api/claude/relatorio-inteligencia` - Gerar relatorio

## Layouts

- `(auth)/layout.tsx` - Layout publico (sem sidebar)
- `(dashboard)/layout.tsx` - Layout protegido (com sidebar + header)

## Middlewares

Autenticacao verificada em `(dashboard)/layout.tsx` via `useAuthStore`.
