# _CHECKLIST.md - Backend Servicos

**Ultima atualizacao**: Janeiro 2026

---

## Critico

- [ ] **Implementar `exportar_csv()` em `eleitor_servico.py`**
  - Rota em `eleitores.py:236` chama funcao inexistente
  - Deve gerar CSV com dados do eleitor
  - Retornar StreamingResponse

## Importante

- [ ] Adicionar cache em `estatisticas()`
- [ ] Implementar batch processing para entrevistas
- [ ] Melhorar tratamento de erros na API Claude

## Melhorias Futuras

- [ ] Fila de jobs para entrevistas longas
- [ ] Metricas de uso da API Claude
- [ ] Servico de notificacoes

## Concluido

- [x] EleitorServico (CRUD basico)
- [x] EntrevistaServico
- [x] UsuarioServico
- [x] MemoriaServico
- [x] ClaudeServico (integracao API)
- [x] ResultadoServico

## Notas

- Servicos NAO fazem commit
- Session passada como parametro
- Claude API tem rate limiting (verificar)
