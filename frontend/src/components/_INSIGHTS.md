# _INSIGHTS.md - Frontend Components

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

Nenhum erro critico nesta pasta.

## Decisoes Arquiteturais

### Organizacao por Dominio
- `ui/` - Componentes shadcn/ui base
- `eleitores/` - Componentes de eleitores
- `entrevistas/` - Componentes de entrevistas
- `resultados/` - Graficos e visualizacoes
- `layout/` - Sidebar, header, etc

### shadcn/ui
- Componentes copiados (nao instalados)
- Customizaveis via Tailwind
- Em `components/ui/`

### Composicao
- Componentes pequenos e focados
- Props tipadas com TypeScript
- Reutilizacao via composicao

## Padroes do Codigo

```typescript
// Componente tipado
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}
```

## Armadilhas Comuns

1. **Props drilling**: Usar Context ou Zustand
2. **Re-renders**: Usar memo/useMemo quando necessario
3. **Imports**: Preferir named exports
