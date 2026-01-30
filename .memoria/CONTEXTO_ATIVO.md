# Contexto Ativo - INTEIA

> **Sessão Atual**: Memória de trabalho da sessão ativa.
> Este arquivo é atualizado DURANTE a sessão e limpo ao iniciar nova sessão.

## Objetivo da Sessão

- Construir padrao premium de pesquisa eleitoral (skills + templates + comando)
- Aplicar boas praticas de gestao de contexto (40%/60%) com compactacao + commit
- Melhorar e corrigir inconsistencias da simulacao CPI Banco Master/BRB

## Arquivos Modificados

- `CLAUDE.md`
- `GESTAO_CONTEXTO.md`
- `.claude/commands/COMMANDS_INDEX.md`
- `.claude/commands/compact.md`
- `.claude/commands/pesquisa_eleitoral/pesquisa-premium.md`
- `.claude/skills/SKILLS_INDEX.md`
- `.claude/skills/pesquisa-eleitoral-premium/SKILL.md`
- `.claude/skills/auditoria-e-validacao-pesquisa/SKILL.md`
- `.claude/skills/insights-estrategicos-preditivos/SKILL.md`
- `.claude/skills/polaris-sdk-pesquisa/SKILL.md`
- `.claude/templates/pesquisa-eleitoral-premium.md`
- `.claude/templates/checklist-pesquisa-eleitoral-premium.md`
- `.claude/templates/relatorio-cliente-premium.html`
- `.agents/plans/pesquisa-eleitoral-premium.md`
- `PROJECT_INDEX.md`
- `resultados/pesquisas/README.md`
- `agentes/banco-deputados-distritais-df.json`
- `scripts/simulacao_cpi_banco_master.py`
- `memorias/pesquisas_parlamentares/cpi_banco_master_20260129_194240.html`
- `.gitignore`

## Decisões Tomadas

- Padrao premium = duas camadas: entrega curta (cliente) + pacote tecnico auditavel.
- Toda afirmacao forte deve ser marcada como `DADO_INTERNO | FONTE_EXTERNA | INFERENCIA`.
- Validacao estatistica + red team sao gates obrigatorios antes de concluir.
- Modelos: Sonnet (volume) + Opus (sintese/predicao/critica).
- Correcoes devem acontecer na origem do sistema (dados/prompt/template/codigo).

## Próximos Passos

- Atualizar `WORK_LOG.md`, `.context/todos.md`, `.context/insights.md`, `.memoria/APRENDIZADOS.md`, `.memoria/MEMORIA_LONGO_PRAZO.md`.
- Criar commits pequenos e coesos.
- Rodar `/compact` (nova conversa) e continuar integracao de insights gerados por IA no caso CPI.

## Notas Rápidas

<!-- Observações durante o trabalho -->

---

*Atualizado automaticamente durante a sessão*
