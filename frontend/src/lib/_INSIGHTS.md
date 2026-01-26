# _INSIGHTS.md - Frontend Lib

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

Nenhum erro critico nesta pasta.

## Decisoes Arquiteturais

### Utilitarios Centralizados
- `utils.ts` - Funcoes helper gerais
- `cn()` - Merge de classes Tailwind (clsx + twMerge)

### Integracao Claude
- `claude/` - Cliente e prompts para Claude API
- Chamadas via API routes do Next.js (nao direto)

## Padroes do Codigo

```typescript
// utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Uso
<div className={cn('base-class', isActive && 'active-class')} />
```

## Armadilhas Comuns

1. **cn() vs classNames**: Sempre usar `cn()` para Tailwind
2. **API Key no client**: NUNCA expor chaves no frontend
3. **Imports circulares**: Cuidado com dependencias
