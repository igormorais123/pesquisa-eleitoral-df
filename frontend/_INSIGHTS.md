# _INSIGHTS.md - Frontend

**Ultima atualizacao**: Janeiro 2026

---

## Erros Conhecidos

| Arquivo | Problema | Solucao |
|---------|----------|---------|
| Nenhum erro critico | - | - |

## Decisoes Arquiteturais

### Next.js 14 App Router
- Usa o novo App Router (nao Pages)
- Server Components por padrao
- `'use client'` apenas quando necessario

### Estado Global com Zustand
- `authStore` - autenticacao e usuario
- `dataStore` - cache de dados (se necessario)
- Persistencia com `zustand/middleware`

### Data Fetching com React Query
- Cache automatico
- Revalidacao em foco
- Retry automatico

### UI com shadcn/ui
- Componentes copiados para `/components/ui`
- Customizaveis via Tailwind
- Acessibilidade built-in

## Padroes do Codigo

```typescript
// Componentes Client
'use client'

import { useState } from 'react'

export function MeuComponente() {
  // ...
}

// Hooks customizados
export function useAlgo() {
  const { data, isLoading } = useQuery({
    queryKey: ['algo'],
    queryFn: fetchAlgo,
  })
  return { data, isLoading }
}
```

## Armadilhas Comuns

1. **'use client' Esquecido**: Se usar hooks/estado, precisa da diretiva
2. **Hidratacao**: Server/Client mismatch causa warnings
3. **Imports Dinamicos**: Use `next/dynamic` para componentes pesados
4. **Env Variables**: `NEXT_PUBLIC_` para expor ao browser

## Performance

- Virtualizacao para listas grandes (react-window)
- Lazy loading de componentes pesados
- Otimizacao de imagens com next/image
- Bundle analyzer: `npm run analyze`
