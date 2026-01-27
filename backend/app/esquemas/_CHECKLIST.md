# _CHECKLIST.md - Backend Esquemas

**Ultima atualizacao**: Janeiro 2026

---

## Critico

- [ ] Nenhuma tarefa critica

## Importante

- [ ] Adicionar validacoes customizadas (CPF, email, etc)
- [ ] Documentar todos os campos com `Field(description=...)`
- [ ] Criar schemas para paginacao padronizada

## Melhorias Futuras

- [ ] Gerar OpenAPI schemas automaticamente
- [ ] Adicionar exemplos nos schemas
- [ ] Validacao de formato de data brasileiro

## Concluido

- [x] Schemas de Eleitor (Create, Update, Response)
- [x] Schemas de Entrevista
- [x] Schemas de Usuario
- [x] Schemas de Autenticacao (Token, Login)
- [x] Schemas de Memoria
- [x] Schemas de Resultado

## Notas

- Schemas seguem convencao `*Base`, `*Create`, `*Response`
- Usar `from_attributes=True` para conversao ORM
- Campos opcionais devem ter `= None`
