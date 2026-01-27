# _CHECKLIST.md - Raiz do Projeto

**Ultima atualizacao**: 26 Janeiro 2026

---

## Critico (Fazer Primeiro)

- [ ] Implementar `exportar_csv` em `backend/app/servicos/eleitor_servico.py`
- [ ] Corrigir `usuario_id` pode ser None em `autenticacao.py:312`

## Importante

- [ ] Adicionar refresh tokens na autenticacao
- [ ] Implementar cache Redis para consultas frequentes
- [ ] Melhorar tratamento de erros RLS no middleware
- [ ] Adicionar testes automatizados (pytest + jest)

## Melhorias Futuras

- [ ] Websockets para entrevistas em tempo real
- [ ] Dashboard administrativo com metricas
- [ ] Sistema de notificacoes
- [ ] Exportacao em mais formatos (CSV direto, JSON)
- [ ] Historico de versoes de eleitores

## Concluido

- [x] Sistema GPS de navegacao para IAs (26/01/2026)
- [x] Mapeamento completo do codebase com _INDEX.md (64 arquivos)
- [x] Documentacao de erros LSP conhecidos
- [x] Atualizacao do CLAUDE.md com instrucoes GPS
- [x] Criacao de _INSIGHTS.md e _CHECKLIST.md em todas as pastas
- [x] Testes automatizados com Playwright (16 testes, 18 screenshots)
- [x] TestSprite MCP configurado com API key
- [x] Build de producao do frontend (Next.js compilado)

## Notas

- Erros LSP nao quebram execucao, sao warnings de tipagem
- Backend deploya automaticamente no Render via push
- Frontend deploya via Vercel CLI ou push
