# Pesquisa Premium (INTEIA)

## Objetivo

Executar uma pesquisa eleitoral premium end-to-end com trilha de auditoria, validação e entrega final curta para cliente.

## Argumento

`$ARGUMENTS` - Brief da pesquisa (ex.: "tema=CPI BRB/Master publico=deputados CLDF n=24 foco=instalacao-cpi")

## Processo

### 1) Carregar contexto mínimo

- Ler: `CLAUDE.md`
- Ler: `.claude/skills/pesquisa-eleitoral-premium/SKILL.md`
- Ler: `.claude/skills/auditoria-e-validacao-pesquisa/SKILL.md`
- Ler: `.claude/skills/insights-estrategicos-preditivos/SKILL.md`

### 2) Criar pasta da pesquisa

Padrão:

`resultados/pesquisas/{slug}_{YYYYMMDD_HHMM}/`

Conteúdo inicial:
- Copiar `.claude/templates/pesquisa-eleitoral-premium.md` → `PLANO_PESQUISA_COMPLETO.md`
- Copiar `.claude/templates/checklist-pesquisa-eleitoral-premium.md` → `CHECKLIST.md`
- Criar `README.md` (índice do pacote)

### 3) Preencher PLANO + Questionário

- Definir objetivo, decisão do cliente, universo e amostragem
- Construir `QUESTIONARIO.md`
- Registrar hipóteses e critérios de validação

### 4) Executar coleta

Escolher o caminho:

- **Via sistema web** (preferencial quando aplicável)
  - Usar backend + rotas de entrevistas

- **Via scripts**
  - Usar scripts em `scripts/` ou criar um script novo (se necessário)

Salvar sempre:
- `DADOS_BRUTOS.json`

### 5) Rodar validação + crítica

- Gerar `VALIDACAO.md` com:
  - margem de erro / incerteza
  - checks de representatividade
  - estabilidade por seed/amostra (quando simulação)
  - red team: 3 contra-hipóteses + 3 inconsistências + 3 sinais

### 6) Gerar insights e previsões

- Gerar `INSIGHTS.md` (formato padronizado)
- Gerar `PREDICOES.md` (cenários, premissas, probabilidades)

### 7) Produzir entrega ao cliente (curta)

- Gerar `RELATORIO_CLIENTE.md` (máx 2 páginas):
  - 1 conclusão principal
  - 5 insights
  - 5 ações
  - 3 cenários
  - 3 riscos + mitigação
  - limitações

Opcional:
- Gerar `RELATORIO_CLIENTE.html` imprimível (seguir `.claude/skills/templates-relatorios/SKILL.md`)

### 8) Evoluir o sistema

Se aparecer erro recorrente:
- Corrigir na origem (prompt/template/código)
- Registrar no `WORK_LOG.md`

## Formato de saída na conversa

Sempre retornar:

- Caminho do pacote gerado em `resultados/pesquisas/...`
- 5 bullets com o “estado do checklist”
- Link/caminho do `RELATORIO_CLIENTE.md`
