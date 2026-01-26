# Next.js 14 - Melhores Práticas INTEIA

## Estrutura App Router

```
frontend/src/
├── app/                    # App Router (Next.js 14)
│   ├── (auth)/            # Grupo de rotas - login
│   │   └── login/page.tsx
│   ├── (dashboard)/       # Grupo de rotas - área autenticada
│   │   ├── eleitores/page.tsx
│   │   ├── entrevistas/page.tsx
│   │   └── resultados/page.tsx
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── eleitores/         # Componentes de eleitores
│   └── resultados/        # Componentes de resultados
├── lib/
│   ├── claude/            # Cliente Claude API
│   └── utils.ts           # Funções utilitárias
├── services/
│   └── api.ts             # Cliente Axios
├── stores/
│   └── auth.ts            # Zustand stores
└── types/
    └── index.ts           # TypeScript interfaces
```

## Padrões de Componentes

### Server Components (padrão)
```tsx
// app/eleitores/page.tsx
import { getEleitores } from '@/services/api'

export default async function EleitoresPage() {
  const eleitores = await getEleitores()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Eleitores</h1>
      <ListaEleitores eleitores={eleitores} />
    </div>
  )
}
```

### Client Components (interatividade)
```tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

export function FiltroEleitores() {
  const [filtro, setFiltro] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['eleitores', filtro],
    queryFn: () => fetchEleitores(filtro)
  })

  return (
    <div>
      <Input
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Filtrar eleitores..."
      />
      {isLoading ? <Spinner /> : <Lista items={data} />}
    </div>
  )
}
```

## API Routes

```tsx
// app/api/eleitores/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const regiao = searchParams.get('regiao')

  const eleitores = await buscarEleitores({ regiao })

  return NextResponse.json(eleitores)
}
```

## Estilização com Tailwind

### Cores INTEIA
```tsx
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        amber: {
          DEFAULT: '#d69e2e',
          light: '#f6e05e',
          dark: '#b7791f'
        },
        inteia: {
          primary: '#d69e2e',
          secondary: '#1e293b',
          success: '#22c55e',
          warning: '#eab308',
          danger: '#ef4444'
        }
      }
    }
  }
}
```

### Componentes shadcn/ui
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Resultados da Pesquisa</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="default" className="bg-amber hover:bg-amber-light">
      Exportar PDF
    </Button>
  </CardContent>
</Card>
```

## Estado Global com Zustand

```tsx
// stores/auth.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: User | null
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: async (credentials) => {
        const { token, user } = await api.login(credentials)
        set({ token, user })
      },
      logout: () => set({ token: null, user: null })
    }),
    { name: 'auth-storage' }
  )
)
```

## Data Fetching com React Query

```tsx
// hooks/useEleitores.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useEleitores(filtros?: Filtros) {
  return useQuery({
    queryKey: ['eleitores', filtros],
    queryFn: () => api.getEleitores(filtros),
    staleTime: 5 * 60 * 1000 // 5 minutos
  })
}

export function useExecutarEntrevista() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.executarEntrevista,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrevistas'] })
    }
  })
}
```

## Gráficos com Chart.js

```tsx
'use client'

import { Bar } from 'react-chartjs-2'

export function GraficoResultados({ dados }) {
  const chartData = {
    labels: dados.map(d => d.candidato),
    datasets: [{
      label: 'Intenção de Voto (%)',
      data: dados.map(d => d.percentual),
      backgroundColor: '#d69e2e'
    }]
  }

  return <Bar data={chartData} />
}
```

## Tipos TypeScript

```tsx
// types/index.ts
export interface Eleitor {
  id: number
  nome: string
  idade: number
  regiao_administrativa: string
  cluster_socioeconomico: 'A' | 'B' | 'C' | 'D' | 'E'
  orientacao_politica: number // -5 a +5
  // ... 60+ atributos
}

export interface Entrevista {
  id: number
  eleitor_id: number
  pergunta: string
  resposta: string
  created_at: string
}

export interface ResultadoPesquisa {
  candidato: string
  votos: number
  percentual: number
}
```

## Performance

### Virtualização para listas grandes
```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

export function ListaEleitores({ eleitores }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: eleitores.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <EleitorRow
            key={virtualRow.key}
            eleitor={eleitores[virtualRow.index]}
            style={{ transform: `translateY(${virtualRow.start}px)` }}
          />
        ))}
      </div>
    </div>
  )
}
```
