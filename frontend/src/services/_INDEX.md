# Services - Camada de Servicos

> **GPS IA**: Comunicacao com APIs e logica auxiliar

## Arquivos

| Arquivo | Funcao | Exports Principais |
|---------|--------|-------------------|
| [api.ts](api.ts) | Cliente Axios base | `api` (instancia), `setAuthToken()`, `clearAuthToken()` |
| [pesquisas-api.ts](pesquisas-api.ts) | API de pesquisas | Funcoes CRUD pesquisas |
| [sessoes-api.ts](sessoes-api.ts) | API de sessoes | Gerenciamento de sessoes de entrevista |
| [memorias-api.ts](memorias-api.ts) | API de memorias | Historico de respostas |
| [analytics-api.ts](analytics-api.ts) | API de analytics | Metricas e dashboards |
| [analytics-local.ts](analytics-local.ts) | Analytics local | Calculos no frontend |
| [dados-abertos.ts](dados-abertos.ts) | Dados abertos | Integracao APIs externas |
| [metricas-estatisticas.ts](metricas-estatisticas.ts) | Estatisticas | Calculos estatisticos |
| [validacao-estatistica.ts](validacao-estatistica.ts) | Validacao | Validacao de dados |

## api.ts - Cliente Base

```typescript
import { api } from '@/services/api';

// GET
const response = await api.get('/eleitores');

// POST
const response = await api.post('/entrevistas', dados);

// Com autenticacao (automatico via interceptor)
// Token lido de localStorage: pesquisa-eleitoral-auth
```

**BaseURL**: `/api/v1` (API routes do Next.js fazem proxy para backend)

## Autenticacao

```typescript
import { setAuthToken, clearAuthToken } from '@/services/api';

// Apos login
setAuthToken(token);

// Apos logout
clearAuthToken();
```

## Interceptors

1. **Request**: Adiciona `Authorization: Bearer <token>`
2. **Response**: Redireciona para /login em 401 (exceto se desabilitado)
