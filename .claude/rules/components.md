# Regras de Componentes - Frontend React/Next.js

> Carregar quando trabalhar com componentes UI, páginas ou interfaces.

## Estrutura de Arquivos

```
frontend/src/components/
├── ui/                    # shadcn/ui primitivos
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
├── eleitores/            # Domínio específico
│   ├── ListaEleitores.tsx
│   ├── FiltroEleitores.tsx
│   └── CardEleitor.tsx
└── resultados/
    ├── GraficoResultados.tsx
    └── TabelaResultados.tsx
```

## Nomenclatura

### Arquivos e Componentes
```typescript
// ✅ Correto - PascalCase para componentes
// Arquivo: CardEleitor.tsx
export function CardEleitor({ eleitor }: CardEleitorProps) { ... }

// ❌ Errado
// Arquivo: card-eleitor.tsx ou cardEleitor.tsx
export function card_eleitor() { ... }
```

### Props Interface
```typescript
// Sempre definir interface de props
interface CardEleitorProps {
  eleitor: Eleitor
  onSelect?: (id: number) => void
  className?: string
}

// Usar destructuring
export function CardEleitor({ eleitor, onSelect, className }: CardEleitorProps) {
  ...
}
```

## Padrões de Componente

### Server Component (padrão)
```tsx
// app/eleitores/page.tsx
import { getEleitores } from '@/services/api'

export default async function EleitoresPage() {
  const eleitores = await getEleitores()
  return <ListaEleitores eleitores={eleitores} />
}
```

### Client Component (interatividade)
```tsx
'use client'

import { useState } from 'react'

export function FiltroEleitores({ onFilter }: FiltroProps) {
  const [filtro, setFiltro] = useState('')
  // ...
}
```

## Estilização

### Tailwind - Cores INTEIA
```tsx
// Usar variáveis de cor do tema
<div className="bg-amber text-white">     {/* Primário */}
<div className="bg-amber-light">           {/* Hover */}
<div className="text-inteia-success">      {/* Sucesso */}
<div className="border-inteia-danger">     {/* Erro */}
```

### Classes Condicionais
```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}>
```

## Data Fetching

### React Query / TanStack
```tsx
'use client'

import { useQuery } from '@tanstack/react-query'

export function ListaEleitores() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['eleitores'],
    queryFn: fetchEleitores,
    staleTime: 5 * 60 * 1000 // 5 minutos
  })

  if (isLoading) return <Skeleton />
  if (error) return <ErroMessage error={error} />

  return <Lista items={data} />
}
```

## Imports

### Path Aliases Obrigatórios
```typescript
// ✅ Correto
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { Eleitor } from '@/types'

// ❌ Errado - caminhos relativos longos
import { Button } from '../../../components/ui/button'
```

## Acessibilidade

```tsx
// Sempre incluir atributos de acessibilidade
<button
  aria-label="Filtrar eleitores"
  aria-expanded={isOpen}
  onClick={handleClick}
>
  <FilterIcon />
</button>

// Labels em formulários
<label htmlFor="regiao">Região Administrativa</label>
<select id="regiao" name="regiao">
  ...
</select>
```

## Performance

### Virtualização para Listas Grandes
```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

// Para listas > 100 itens, sempre usar virtualização
export function ListaEleitores({ eleitores }) {
  // Ver exemplo completo em .claude/reference/nextjs-best-practices.md
}
```

### Lazy Loading
```tsx
import dynamic from 'next/dynamic'

// Componentes pesados carregados sob demanda
const GraficoComplexo = dynamic(
  () => import('@/components/resultados/GraficoComplexo'),
  { loading: () => <Skeleton /> }
)
```
