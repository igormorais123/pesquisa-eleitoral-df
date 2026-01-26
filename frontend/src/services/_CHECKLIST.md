# _CHECKLIST.md - Frontend Services

**Ultima atualizacao**: Janeiro 2026

---

## Critico

- [ ] Nenhuma tarefa critica

## Importante

- [ ] Adicionar retry automatico em falhas
- [ ] Implementar timeout configuravel
- [ ] Melhorar tipagem das respostas

## Melhorias Futuras

- [ ] Cache local com service worker
- [ ] Request deduplication
- [ ] Metricas de latencia

## Concluido

- [x] Axios instance configurada
- [x] Interceptors de auth
- [x] Servico de eleitores
- [x] Servico de entrevistas
- [x] Servico de autenticacao

## Notas

- Base URL em `NEXT_PUBLIC_API_URL`
- Token armazenado via Zustand persist
- Erros 401 fazem logout automatico
