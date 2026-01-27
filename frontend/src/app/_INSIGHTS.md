# _INSIGHTS.md - Frontend App

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

Nenhum erro critico nesta pasta.

## Decisoes Arquiteturais

### Route Groups
- `(auth)/` - Rotas de autenticacao (layout proprio)
- `(dashboard)/` - Rotas protegidas (com sidebar)
- `api/` - API routes do Next.js

### Layouts
- `layout.tsx` - Layout raiz (providers)
- Layouts aninhados por grupo de rotas
- Metadata definida por pagina

### Middleware
- Protecao de rotas em `middleware.ts`
- Redirect para login se nao autenticado

## Padroes do Codigo

```typescript
// page.tsx
export default function Page() {
  return <div>Conteudo</div>
}

// layout.tsx
export default function Layout({ children }) {
  return <main>{children}</main>
}

// loading.tsx
export default function Loading() {
  return <Skeleton />
}
```

## Armadilhas Comuns

1. **page.tsx obrigatorio**: Pasta so vira rota se tiver `page.tsx`
2. **Metadata**: Definir em cada pagina para SEO
3. **Route groups**: Parenteses nao afetam URL
