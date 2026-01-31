# SESSAO_TEMP - 2026-01-30

## Objetivo

Evoluir o projeto para um **padrao premium de pesquisa eleitoral** (metodologia + auditoria + previsao + entrega curta) e aplicar boas praticas de **gestao de contexto** (40%/60%) com compactacao e commits frequentes.

## O que foi feito (nesta sessao)

- Criado um sistema padrao de pesquisa premium via skills + templates + comando.
- Estruturado trilha de auditoria e red team (anti-alucinacao) como gate obrigatorio.
- Adicionado template de relatorio premium com abas (resumo/metodologia/transparencia/predicoes/acao).
- Corrigida incoerencia de dados em `agentes/banco-deputados-distritais-df.json` (relacao_governo_atual de oposicao marcada como base_aliada).
- Melhorada a simulacao/relatorio da CPI Banco Master (separando assinaturas vs instalacao, checagem factual e UX).

## Arquivos principais tocados

- `CLAUDE.md`
- `GESTAO_CONTEXTO.md`
- `.claude/commands/COMMANDS_INDEX.md`
- `.claude/commands/compact.md`
- `.claude/commands/pesquisa_eleitoral/pesquisa-premium.md`
- `.claude/skills/pesquisa-eleitoral-premium/SKILL.md`
- `.claude/skills/auditoria-e-validacao-pesquisa/SKILL.md`
- `.claude/skills/insights-estrategicos-preditivos/SKILL.md`
- `.claude/skills/polaris-sdk-pesquisa/SKILL.md`
- `.claude/skills/SKILLS_INDEX.md`
- `.claude/templates/pesquisa-eleitoral-premium.md`
- `.claude/templates/checklist-pesquisa-eleitoral-premium.md`
- `.claude/templates/relatorio-cliente-premium.html`
- `.agents/plans/pesquisa-eleitoral-premium.md`
- `resultados/pesquisas/README.md`
- `PROJECT_INDEX.md`
- `agentes/banco-deputados-distritais-df.json`
- `scripts/simulacao_cpi_banco_master.py`
- `memorias/pesquisas_parlamentares/cpi_banco_master_20260129_194240.html`

## Decisoes e rationale

- Duas camadas (cliente x tecnico): cliente recebe apenas suco (decisao/acoes), tecnico recebe pacote auditavel.
- Toda afirmacao forte deve ser classificada: `DADO_INTERNO | FONTE_EXTERNA | INFERENCIA`.
- Validacao e red team sao gates: sem isso nao existe conclusao final.
- Modelos: Sonnet para volume (entrevistas), Opus para sintese, previsao e critica.
- Erros recorrentes devem ser corrigidos na origem (dados/prompt/template/codigo), nao so no relatorio.

## Riscos / inconsistencias abertas

- A secao "Insights Exclusivos INTEIA" da simulacao CPI Master ainda e (em parte) texto fixo no script; ideal gerar via Opus com evidencias e confianca.
- Worktree com muitos arquivos modificados fora do escopo desta sessao (provavel CRLF/linhas); commits devem ser granulares para evitar commit gigante.
- Existe arquivo com secrets exportados: `C:Usersigormpesquisa-eleitoral-dftemp_env.json` (foi adicionado ao .gitignore; NAO commitar).

## Proximos passos (continuidade)

1. Atualizar arquivos de persistencia (`WORK_LOG.md`, `.context/*`, `.memoria/*`) com resumo/insights desta sessao.
2. Criar commits pequenos e coesos (premium system / CPI fix / dados).
3. Rodar `/compact` (nova conversa) e continuar:
   - Integrar geracao automatica de insights (Opus) na simulacao CPI.
   - Padronizar export do pacote premium (resultados/pesquisas/{id}/...).
