# _CHECKLIST.md - Frontend Hooks

**Ultima atualizacao**: Janeiro 2026

---

## Critico

- [ ] Nenhuma tarefa critica

## Importante

- [ ] Adicionar tratamento de erro padrao
- [ ] Configurar retry policies
- [ ] Implementar optimistic updates

## Melhorias Futuras

- [ ] Hook de websocket para real-time
- [ ] Hook de persistencia offline
- [ ] Hook de analytics

## Concluido

- [x] useEleitores
- [x] useEntrevistas
- [x] useResultados
- [x] useAuth
- [x] useEstatisticas

## Notas

- Todos os hooks usam React Query
- Configuracao global em `providers.tsx`
- Hooks de mutacao invalidam cache automaticamente
