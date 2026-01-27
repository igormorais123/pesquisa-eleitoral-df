# _CHECKLIST.md - Backend Modelos

**Ultima atualizacao**: Janeiro 2026

---

## Critico

- [ ] Nenhuma tarefa critica

## Importante

- [ ] Adicionar indices nos campos de busca frequente
- [ ] Revisar cascades de delete
- [ ] Documentar relacoes entre modelos

## Melhorias Futuras

- [ ] Soft delete (campo `deleted_at`)
- [ ] Audit trail (quem/quando alterou)
- [ ] Versionamento de registros

## Concluido

- [x] Modelo Usuario
- [x] Modelo Eleitor
- [x] Modelo Entrevista
- [x] Modelo Memoria
- [x] Modelo Resultado
- [x] Modelo Parlamentar

## Notas

- Todos os modelos herdam de `Base`
- UUIDs gerados com `uuid4()`
- Timestamps com `created_at`, `updated_at`
