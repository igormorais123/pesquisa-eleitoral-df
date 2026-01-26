# _CHECKLIST.md - Backend API Rotas

**Ultima atualizacao**: Janeiro 2026

---

## Critico

- [ ] Corrigir `usuario_id` None em `autenticacao.py:312`
- [ ] Corrigir chamada `exportar_csv` em `eleitores.py:236`

## Importante

- [ ] Adicionar paginacao em todas as rotas de listagem
- [ ] Implementar filtros avancados
- [ ] Melhorar documentacao OpenAPI

## Seguranca

- [ ] Rate limiting por rota
- [ ] Validacao de entrada mais rigorosa
- [ ] Logs de auditoria

## Melhorias Futuras

- [ ] GraphQL como alternativa
- [ ] Webhooks para eventos
- [ ] Batch endpoints

## Concluido

- [x] `/auth/login`, `/auth/register`
- [x] `/eleitores` CRUD
- [x] `/eleitores/estatisticas`
- [x] `/entrevistas` CRUD + executar
- [x] `/resultados`
- [x] `/memorias`
- [x] `/parlamentares`

## Notas

- Rotas protegidas usam `Depends(get_current_user)`
- Documentacao em `/docs` (Swagger)
- Prefixo padrao `/api/v1`
