# Plano: Pesquisa Eleitoral Premium (INTEIA)

## Descrição

Executar uma pesquisa eleitoral premium com agentes sintéticos e produzir:
- entrega curta para cliente (decisão + ações)
- pacote técnico completo auditável

## Metadados

- Tipo: pesquisa
- Complexidade: alta
- Sistemas afetados: dados (agentes), scripts, backend/frontend (opcional)

## Regras

- Seguir `.claude/skills/pesquisa-eleitoral-premium/SKILL.md`
- Validar com `.claude/skills/auditoria-e-validacao-pesquisa/SKILL.md`
- Produzir insights com `.claude/skills/insights-estrategicos-preditivos/SKILL.md`

## Artefatos de Saída (obrigatórios)

Criar pacote em `resultados/pesquisas/{slug}_{YYYYMMDD_HHMM}/`:

- README.md
- CHECKLIST.md
- PLANO_PESQUISA_COMPLETO.md
- QUESTIONARIO.md
- DADOS_BRUTOS.json
- VALIDACAO.md
- INSIGHTS.md
- PREDICOES.md
- RELATORIO_CLIENTE.md

## Tarefas

### 1) Brief e contexto

- [ ] Definir objetivo (1 frase) e decisão do cliente
- [ ] Identificar universo (eleitores/parlamentares/gestores)
- [ ] Mapear bases internas relevantes (arquivos)
- [ ] Listar links externos necessários (se houver)

### 2) Plano e instrumento

- [ ] Criar `PLANO_PESQUISA_COMPLETO.md` a partir do template
- [ ] Criar `CHECKLIST.md` a partir do template
- [ ] Construir `QUESTIONARIO.md` (blocos, tipos, ordem)

### 3) Execução

- [ ] Selecionar amostra (registrar seed)
- [ ] Executar entrevistas (modelo + prompt)
- [ ] Salvar `DADOS_BRUTOS.json`

### 4) Validação

- [ ] Integridade e consistência
- [ ] Representatividade / ponderação
- [ ] Margem de erro / incerteza
- [ ] Estabilidade por seed (se aplicável)

### 5) Análises

- [ ] Quantitativa: estatística + cruzamentos + modelos
- [ ] Qualitativa: temas + narrativas + contradições

### 6) Insights + previsões

- [ ] Gerar `INSIGHTS.md` (com evidência + confiança)
- [ ] Gerar `PREDICOES.md` (cenários + premissas)

### 7) Red team

- [ ] 3 contra-hipóteses + 3 inconsistências + 3 sinais
- [ ] Ajustar conclusões se necessário

### 8) Entrega ao cliente

- [ ] Gerar `RELATORIO_CLIENTE.md` (máx. 2 páginas)
- [ ] Top 5 insights + Top 5 ações + 3 cenários
- [ ] Limitações explícitas

### 9) Evolução do sistema

- [ ] Se houve erro recorrente: corrigir na origem
- [ ] Registrar no `WORK_LOG.md`

## Critérios de Aceitação

- [ ] Checklist completo
- [ ] Entrega curta e clara (cliente)
- [ ] Pacote técnico auditável
- [ ] Limitações e incertezas declaradas
