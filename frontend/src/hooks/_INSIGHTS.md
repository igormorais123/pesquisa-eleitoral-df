# _INSIGHTS.md - Frontend Hooks

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

Nenhum erro critico nesta pasta.

## Decisoes Arquiteturais

### React Query para Data Fetching
- Hooks encapsulam queries
- Cache automatico
- Revalidacao em foco

### Hooks Customizados
- Prefixo `use` obrigatorio
- Retornam objetos com dados e estados
- Composiveis entre si

## Padroes do Codigo

```typescript
// Hook de dados
export function useEleitores(filtros?: Filtros) {
  return useQuery({
    queryKey: ['eleitores', filtros],
    queryFn: () => api.eleitores.listar(filtros),
  })
}

// Hook de mutacao
export function useCriarEntrevista() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.entrevistas.criar,
    onSuccess: () => {
      queryClient.invalidateQueries(['entrevistas'])
    },
  })
}
```

## Armadilhas Comuns

1. **Query keys**: Devem ser unicas e incluir dependencias
2. **Stale time**: Configurar por caso de uso
3. **Error handling**: Usar `onError` ou error boundaries
