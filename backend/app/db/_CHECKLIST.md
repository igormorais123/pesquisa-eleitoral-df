# _CHECKLIST.md - Backend DB

**Ultima atualizacao**: Janeiro 2026

---

## Critico

- [ ] Corrigir `execute()` com `text()` em `session.py:115`

## Importante

- [ ] Adicionar migrations com Alembic
- [ ] Configurar connection pooling otimizado
- [ ] Implementar retry em falhas de conexao

## Melhorias Futuras

- [ ] Read replicas para queries pesadas
- [ ] Connection health checks
- [ ] Query logging em desenvolvimento

## Concluido

- [x] Async session maker
- [x] Dependency injection `get_db()`
- [x] Base declarativa

## Notas

- Banco hospedado no Render (PostgreSQL)
- Pool configurado em `core/config.py`
- Usar `text()` para queries SQL raw
