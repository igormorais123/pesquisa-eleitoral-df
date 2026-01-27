# Stores - Estado Global (Zustand)

> **GPS IA**: Gerenciamento de estado com Zustand

## Arquivos

| Arquivo | Estado | Funcoes Principais |
|---------|--------|-------------------|
| [auth-store.ts](auth-store.ts) | Autenticacao | `login()`, `logout()`, `verificarToken()`, `usuario`, `token`, `autenticado` |
| [eleitores-store.ts](eleitores-store.ts) | Lista de eleitores | `carregar()`, `filtrar()`, `eleitores`, `filtros`, `estatisticas` |
| [candidatos-store.ts](candidatos-store.ts) | Lista de candidatos | CRUD de candidatos |
| [entrevistas-store.ts](entrevistas-store.ts) | Entrevistas | `criar()`, `iniciar()`, `pausar()`, `entrevistas`, `progresso` |
| [resultados-store.ts](resultados-store.ts) | Resultados | Analises e graficos |
| [pesquisas-store.ts](pesquisas-store.ts) | Pesquisas persistidas | Pesquisas no banco |
| [parlamentares-store.ts](parlamentares-store.ts) | Parlamentares | Deputados e senadores |
| [gestores-store.ts](gestores-store.ts) | Gestores | Entrevistas com gestores |
| [cenarios-store.ts](cenarios-store.ts) | Cenarios eleitorais | Simulacoes |
| [templates-store.ts](templates-store.ts) | Templates perguntas | Templates reutilizaveis |
| [theme-store.ts](theme-store.ts) | Tema | dark/light mode |
| [sidebar-store.ts](sidebar-store.ts) | UI sidebar | aberta/fechada |
| [notifications-store.ts](notifications-store.ts) | Notificacoes | toast/alerts |
| [configuracoes-store.ts](configuracoes-store.ts) | Configuracoes | Preferencias do usuario |
| [modelos-ia-store.ts](modelos-ia-store.ts) | Modelos IA | Selecao Opus/Sonnet |
| [pesquisa-podc-store.ts](pesquisa-podc-store.ts) | Pesquisa PODC | Tipo especial |

## Uso

```typescript
import { useAuthStore } from '@/stores/auth-store';

// Em componente
const { usuario, login, logout } = useAuthStore();

// Fora de componente (direto)
const estado = useAuthStore.getState();
```

## Auth Store - Detalhes

```typescript
interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  autenticado: boolean;
  carregando: boolean;
  hidratado: boolean;
  login: (usuario: string, senha: string) => Promise<void>;
  logout: () => void;
  verificarToken: () => Promise<boolean>;
}
```

Persistido em localStorage: `pesquisa-eleitoral-auth`

## Eleitores Store - Filtros

```typescript
filtros: {
  busca?: string;
  generos?: string[];
  clusters?: string[];
  regioes?: string[];
  orientacoes_politicas?: string[];
  posicoes_bolsonaro?: string[];
  ...
}
```
