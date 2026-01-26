# _INSIGHTS.md - Frontend Services

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

Nenhum erro critico nesta pasta.

## Decisoes Arquiteturais

### Axios como HTTP Client
- Instancia configurada em `api.ts`
- Interceptors para auth e erros
- Base URL do backend

### Interceptors
- Request: Adiciona token JWT
- Response: Trata erros 401 (logout)
- Error: Formata mensagens

## Padroes do Codigo

```typescript
// api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Servico especifico
export const eleitoresService = {
  listar: (params) => api.get('/eleitores', { params }),
  obter: (id) => api.get(`/eleitores/${id}`),
}
```

## Armadilhas Comuns

1. **Token expirado**: Interceptor deve fazer logout
2. **CORS**: Verificar URL do backend
3. **Tipagem**: Sempre tipar respostas
