# _INSIGHTS.md - Frontend Src

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

Nenhum erro critico nesta pasta.

## Decisoes Arquiteturais

### Next.js 14 App Router
- Diretorio `app/` para rotas
- Server Components por padrao
- `'use client'` para interatividade

### Organizacao de Pastas
- `app/` - Paginas e API routes
- `components/` - Componentes reutilizaveis
- `hooks/` - Custom hooks
- `lib/` - Utilitarios e configs
- `services/` - Chamadas API
- `stores/` - Estado global (Zustand)
- `types/` - Tipos TypeScript

## Padroes do Codigo

```typescript
// Componente Client
'use client'
import { useState } from 'react'

export function MeuComponente() {
  const [state, setState] = useState()
  return <div>...</div>
}

// Componente Server (padrao)
export async function MeuServerComponent() {
  const data = await fetch('...')
  return <div>{data}</div>
}
```

## Armadilhas Comuns

1. **Hidratacao**: Mismatch server/client causa warnings
2. **useEffect**: Nao roda em Server Components
3. **Env vars**: Usar `NEXT_PUBLIC_` para expor ao client
