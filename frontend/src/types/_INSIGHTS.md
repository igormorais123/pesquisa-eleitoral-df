# _INSIGHTS.md - Frontend Types

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

Nenhum erro critico nesta pasta.

## Decisoes Arquiteturais

### Tipos Centralizados
- Interfaces para cada entidade
- Exportados de `index.ts`
- Sincronizados com backend (manual)

### Convencoes
- `I` prefix para interfaces (opcional)
- Tipos de resposta com sufixo `Response`
- Tipos de requisicao com sufixo `Request`

## Padroes do Codigo

```typescript
// Entidade base
export interface Eleitor {
  id: string
  nome: string
  idade: number
  // ...60+ campos
}

// Para criacao
export interface EleitorCreate extends Omit<Eleitor, 'id'> {}

// Para listagem
export interface EleitorListResponse {
  items: Eleitor[]
  total: number
  page: number
}
```

## Armadilhas Comuns

1. **Dessincronia**: Backend pode ter campos diferentes
2. **Optional vs undefined**: Ser explicito
3. **Generics**: Usar para respostas paginadas
