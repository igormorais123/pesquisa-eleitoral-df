# _INSIGHTS.md - Frontend Stores

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

Nenhum erro critico nesta pasta.

## Decisoes Arquiteturais

### Zustand para Estado Global
- Simples e performatico
- Nao precisa de Provider
- Persistencia facil

### Separacao de Stores
- `authStore` - Usuario e token
- `uiStore` - Estado de UI (sidebar, modais)

### Persistencia
- Middleware `persist` para localStorage
- Apenas dados essenciais (token)
- Hidratacao cuidadosa

## Padroes do Codigo

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'auth-storage' }
  )
)
```

## Armadilhas Comuns

1. **Hidratacao**: Usar `useEffect` para sincronizar
2. **Persistencia**: Nao persistir dados sensiveis
3. **Selectors**: Usar para evitar re-renders
