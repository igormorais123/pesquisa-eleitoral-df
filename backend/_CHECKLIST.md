# _CHECKLIST.md - Backend

**Ultima atualizacao**: Janeiro 2026

---

## Critico (Fazer Primeiro)

- [ ] Implementar `exportar_csv()` em `servicos/eleitor_servico.py`
- [ ] Corrigir `usuario_id` None em `api/rotas/autenticacao.py:312`
- [ ] Adicionar verificacao `if not usuario_id` antes de usar

## Importante

- [ ] Implementar refresh tokens em `/auth/refresh`
- [ ] Adicionar rate limiting nas rotas
- [ ] Melhorar logs com structlog
- [ ] Adicionar health check mais completo (`/health/db`, `/health/redis`)

## Testes

- [ ] Criar testes para rotas de autenticacao
- [ ] Criar testes para CRUD de eleitores
- [ ] Criar testes para execucao de entrevistas
- [ ] Configurar pytest-asyncio

## Melhorias Futuras

- [ ] Cache Redis para estatisticas
- [ ] Paginacao cursor-based (ao inves de offset)
- [ ] Compressao gzip nas respostas
- [ ] Websockets para progresso de entrevistas
- [ ] Background tasks com Celery ou ARQ

## Concluido

- [x] Estrutura base FastAPI
- [x] Autenticacao JWT
- [x] CRUD eleitores
- [x] Integracao Claude API
- [x] RLS middleware
- [x] Sistema GPS com _INDEX.md

## Notas

- Deploy automatico no Render via push para main
- Variaveis de ambiente em `.env` e Render dashboard
- PostgreSQL hospedado no Render (plano gratuito)
