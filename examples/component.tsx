/**
 * Exemplo de Componente React - Padrão INTEIA
 *
 * Este arquivo demonstra o padrão correto para criar componentes no frontend.
 * Usar como referência ao criar novos componentes.
 */

'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Search, User } from 'lucide-react'
import { toast } from 'sonner'

// Tipos - sempre definir interfaces
interface Eleitor {
  id: number
  nome: string
  idade: number
  regiao_administrativa: string
  cluster_socioeconomico: string
  orientacao_politica: number
}

interface CardEleitorProps {
  eleitor: Eleitor
  onSelect?: (eleitor: Eleitor) => void
  isSelected?: boolean
  className?: string
}

interface ListaEleitoresProps {
  filtroRegiao?: string
  filtroCluster?: string
  onEleitorSelect?: (eleitor: Eleitor) => void
}

// Funções de API
async function fetchEleitores(filtros: { regiao?: string; cluster?: string }): Promise<Eleitor[]> {
  const params = new URLSearchParams()
  if (filtros.regiao) params.set('regiao', filtros.regiao)
  if (filtros.cluster) params.set('cluster', filtros.cluster)

  const response = await fetch(`/api/v1/eleitores?${params}`)
  if (!response.ok) throw new Error('Erro ao carregar eleitores')
  return response.json()
}

// Componente de Card individual
export function CardEleitor({
  eleitor,
  onSelect,
  isSelected = false,
  className
}: CardEleitorProps) {
  // Traduzir orientação política para texto
  const getOrientacaoTexto = (valor: number): string => {
    if (valor <= -3) return 'Esquerda'
    if (valor <= -1) return 'Centro-esquerda'
    if (valor <= 1) return 'Centro'
    if (valor <= 3) return 'Centro-direita'
    return 'Direita'
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-amber border-amber',
        className
      )}
      onClick={() => onSelect?.(eleitor)}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Selecionar eleitor ${eleitor.nome}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-4 w-4 text-amber" aria-hidden="true" />
          {eleitor.nome}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Idade:</span>
            <span className="ml-1 font-medium">{eleitor.idade} anos</span>
          </div>
          <div>
            <span className="text-muted-foreground">Região:</span>
            <span className="ml-1 font-medium">{eleitor.regiao_administrativa}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Cluster:</span>
            <span className="ml-1 font-medium">{eleitor.cluster_socioeconomico}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Orientação:</span>
            <span className="ml-1 font-medium">
              {getOrientacaoTexto(eleitor.orientacao_politica)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente de Lista com filtros
export function ListaEleitores({
  filtroRegiao,
  filtroCluster,
  onEleitorSelect
}: ListaEleitoresProps) {
  const [busca, setBusca] = useState('')
  const [eleitorSelecionado, setEleitorSelecionado] = useState<number | null>(null)

  // Query com React Query
  const { data: eleitores, isLoading, error } = useQuery({
    queryKey: ['eleitores', filtroRegiao, filtroCluster],
    queryFn: () => fetchEleitores({ regiao: filtroRegiao, cluster: filtroCluster }),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Filtrar localmente por busca
  const eleitoresFiltrados = eleitores?.filter(e =>
    e.nome.toLowerCase().includes(busca.toLowerCase())
  ) ?? []

  // Handler de seleção
  const handleSelect = useCallback((eleitor: Eleitor) => {
    setEleitorSelecionado(eleitor.id)
    onEleitorSelect?.(eleitor)
  }, [onEleitorSelect])

  // Estado de loading
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  // Estado de erro
  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive p-4 border rounded-lg">
        <AlertCircle className="h-5 w-5" />
        <span>Erro ao carregar eleitores. Tente novamente.</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
          aria-label="Buscar eleitores por nome"
        />
      </div>

      {/* Contador de resultados */}
      <p className="text-sm text-muted-foreground">
        {eleitoresFiltrados.length} eleitor(es) encontrado(s)
      </p>

      {/* Grid de cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {eleitoresFiltrados.map((eleitor) => (
          <CardEleitor
            key={eleitor.id}
            eleitor={eleitor}
            onSelect={handleSelect}
            isSelected={eleitorSelecionado === eleitor.id}
          />
        ))}
      </div>

      {/* Estado vazio */}
      {eleitoresFiltrados.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum eleitor encontrado com os filtros atuais.
        </div>
      )}
    </div>
  )
}

// Export default do componente principal
export default ListaEleitores
