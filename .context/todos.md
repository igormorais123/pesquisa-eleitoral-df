# Lista de Tarefas - INTEIA

> Rastreia progresso entre sessões. Atualizar SEMPRE antes de encerrar sessão.

## Em Progresso 🔄

<!-- Tarefas atualmente sendo trabalhadas -->

## Concluídas Recentemente ✅ (2026-01-27)

- [x] **Hub de Projetos INTEIA** - Página intermediária estilo Apple para escolha de projetos
  - Design criativo com Framer Motion e glassmorphism
  - 8 projetos configurados (pesquisa eleitoral, stress test, aulas, chatbot, etc.)
  - Sistema de filtros por categoria e busca
  - Cards com status (ativo, beta, em-breve)
  - Roteamento: Login → Hub (/) → Sistema (/dashboard)

## Concluídas ✅

- [x] Sincronização de 600 respostas para PostgreSQL nuvem (2026-01-27)
- [x] Sistema de comandos PIV Loop implementado (2026-01-26)
- [x] Regras modulares criadas (api.md, components.md, seguranca.md)
- [x] Comandos de validação implementados
- [x] Sistema de contexto persistente configurado
- [x] Testes Playwright (16 specs, 18 screenshots)
- [x] Build de produção do frontend
- [x] **Upgrade para v2.1 - Spec-Driven Development** (2026-01-26):
  - [x] Sistema de memória hierárquica (.memoria/)
  - [x] Comando /research com checkpoint humano
  - [x] Comando /requirements-check para requisitos sólidos
  - [x] Documentação Spec-Driven Development (Netflix)
  - [x] Sistema de Tiers de Complexidade (1-4)
  - [x] Documentação MCPs e Subagentes
  - [x] Templates para projetos não-código
  - [x] Análise de complexidade essencial vs acidental
  - [x] Regra anti-vibecoding (10 turns)

## Pendentes 📋

<!-- Tarefas identificadas mas não iniciadas -->
- [x] Criar exemplos de código em `examples/` ✅ (2026-01-26)
- [ ] Documentar decisões arquiteturais (ADRs)
- [ ] Implementar mais testes E2E
- [ ] Otimizar performance de listagem de eleitores

## Bloqueadas 🚫

<!-- Tarefas que dependem de algo externo -->

## Notas

### Sessão 2026-01-27 (Correção Sincronização Nuvem)
- Problema identificado: pesquisas não apareciam porque dados ficavam só no IndexedDB local
- Solução implementada:
  - Hook `useSyncSessoes` para sincronização automática após login
  - Salvamento no servidor quando sessão é concluída
  - Botão de sincronização manual nas páginas de entrevistas e resultados
  - Rotas de API Next.js para proxy com backend PostgreSQL
- Commit: b8315f8 - fix(sync): implementa sincronização de sessões com nuvem

### Sessão 2026-01-27 (Harmonização Reconvenção)
- Harmonizado projeto reconvencao-igor-melissa com PIV+
- Criado sistema de comandos para investigação jurídica
- Skill investigador-provas configurada como PADRÃO
- Múltiplos nomes de chamada: /investigar, /provas, /caso, /thalia, etc.
- Sistema de memória específico para caso jurídico
- Compilação completa em COMPILACAO_SESSAO_27jan2026.md

### Sessão 2026-01-26 (Upgrade v2.1)
- Analisado vídeo "Context Engineering" de Steven Hicks (Netflix)
- Implementado conceitos de Spec-Driven Development:
  - Simple vs Easy (Rich Hickey)
  - Complexidade Essencial vs Acidental (Fred Brooks)
  - Abordagem de 3 fases: Research → Plan → Implement
  - Regra de pausa: 10 iterações ou 30 minutos
- Criado sistema de memória hierárquica (.memoria/)
- Novos comandos: /research, /requirements-check
- Documentação completa de referência

### Sessão 2026-01-26 (Inicial)
- Implementado sistema completo de engenharia de contexto
- Baseado no manual de Cole Medin + habit-tracker
- Estrutura de regras modulares funcionando
- Testado comando /prime com sucesso
- Exemplos de código criados (api-endpoint.py, component.tsx)

---

*Atualizar este arquivo antes de qualquer compactação de memória ou encerramento de sessão.*
