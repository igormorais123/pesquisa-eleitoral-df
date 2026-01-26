# Frontend Src - Codigo Fonte

> **GPS IA**: Estrutura do codigo fonte Next.js

## Estrutura

```
src/
├── app/          <- [_INDEX.md] Paginas e API Routes (Next.js App Router)
├── components/   <- [_INDEX.md] Componentes React
├── hooks/        <- [_INDEX.md] Custom React Hooks
├── lib/          <- [_INDEX.md] Bibliotecas e utilitarios
├── services/     <- [_INDEX.md] Camada de servicos/API
├── stores/       <- [_INDEX.md] Estado global (Zustand)
├── types/        <- [_INDEX.md] Tipos TypeScript
├── styles/       <- Estilos globais (Tailwind)
└── data/         <- Dados estaticos
```

## Navegacao Rapida

| Preciso de... | Ir para... |
|---------------|------------|
| Paginas e rotas | [app/_INDEX.md](app/_INDEX.md) |
| Componentes visuais | [components/_INDEX.md](components/_INDEX.md) |
| Estado global | [stores/_INDEX.md](stores/_INDEX.md) |
| Chamadas API | [services/_INDEX.md](services/_INDEX.md) |
| Tipos TypeScript | [types/_INDEX.md](types/_INDEX.md) |
| Hooks customizados | [hooks/_INDEX.md](hooks/_INDEX.md) |
| Funcoes utilitarias | [lib/_INDEX.md](lib/_INDEX.md) |

## Fluxo de Dados

```
1. Usuario acessa pagina (app/)
2. Pagina usa hooks/stores para carregar dados
3. Stores chamam services/ (API)
4. Services usam api.ts -> /api/v1/* -> Backend FastAPI
5. Dados retornam e atualizam stores
6. Components re-renderizam com novos dados
```

## Arquivos Chave

| Arquivo | Funcao |
|---------|--------|
| `app/layout.tsx` | Layout raiz (providers) |
| `app/(dashboard)/layout.tsx` | Layout protegido |
| `services/api.ts` | Cliente Axios |
| `stores/auth-store.ts` | Autenticacao |
| `types/index.ts` | Tipos principais |
| `lib/utils.ts` | Funcoes utilitarias |
