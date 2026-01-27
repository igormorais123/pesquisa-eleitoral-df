# Plano: Pesquisa Eleitoral Completa

## Descrição

Executar uma pesquisa eleitoral end-to-end: desde a seleção de amostra até a geração do relatório final seguindo padrão visual INTEIA.

## User Story

Como estrategista político, quero executar uma pesquisa de intenção de voto para governador do DF para entender o cenário eleitoral atual e orientar a campanha.

## Metadados

- **Tipo**: pesquisa
- **Complexidade**: alta
- **Sistemas afetados**: backend, frontend, Claude API
- **Estimativa de arquivos**: 8-12 arquivos

## Referências do Codebase

### Arquivos Principais

| Arquivo | Propósito |
|---------|-----------|
| `agentes/banco-eleitores-df.json` | Banco de 1000+ eleitores sintéticos |
| `backend/app/servicos/claude_servico.py` | Integração Claude API |
| `backend/app/api/rotas/entrevistas.py` | Endpoints de entrevista |
| `scripts/pesquisa_governador_2026.py` | Script de execução |
| `frontend/public/resultados-stress-test/index.html` | Template relatório |

### Padrões a Seguir

| Padrão | Arquivo de Referência |
|--------|----------------------|
| Prompt de eleitor | `.claude/reference/claude-api-best-practices.md` |
| Estrutura relatório | `CLAUDE.md` seção "PADRÃO VISUAL INTEIA" |
| Cores e tipografia | `frontend/tailwind.config.ts` |

## Tarefas de Implementação

### 1. Preparação

- [ ] Verificar ambiente (backend rodando, API key válida)
- [ ] Carregar banco de eleitores
- [ ] Definir parâmetros da pesquisa:
  - Cargo: Governador DF
  - Candidatos: lista definida
  - Tamanho amostra: 500
  - Estratificação: região, cluster, idade

### 2. Seleção de Amostra

- [ ] Implementar seleção estratificada proporcional
- [ ] Distribuir por região administrativa (PDAD-DF)
- [ ] Distribuir por cluster socioeconômico
- [ ] Validar representatividade estatística

### 3. Execução de Entrevistas

- [ ] Para cada eleitor na amostra:
  - Construir prompt com persona completa
  - Enviar para Claude API (Sonnet 4)
  - Armazenar resposta estruturada
- [ ] Controle de concorrência (5 simultâneas)
- [ ] Tratamento de erros com retry

### 4. Agregação de Resultados

- [ ] Calcular totais por candidato
- [ ] Calcular percentuais
- [ ] Segmentar por:
  - Região administrativa
  - Cluster socioeconômico
  - Faixa etária
  - Gênero
  - Orientação política

### 5. Análise IA

- [ ] Enviar dados agregados para Claude Opus
- [ ] Gerar conclusão principal
- [ ] Gerar recomendações estratégicas (priorizadas)
- [ ] Identificar insights por segmento

### 6. Geração de Relatório

- [ ] Criar pasta `frontend/public/resultados-{cargo}-{data}/`
- [ ] Gerar `index.html` com:
  - Header INTEIA
  - Conclusão principal (Helena)
  - Recomendações
  - Validação estatística
  - KPIs
  - Gráficos Chart.js
  - Pesquisador responsável
  - Footer
- [ ] Salvar `dados.json` com dados brutos
- [ ] Implementar tema claro/escuro
- [ ] Implementar impressão A4

### Validação

```bash
# Verificar backend
curl -s http://localhost:8000/health

# Verificar banco de eleitores
python -c "import json; print(len(json.load(open('agentes/banco-eleitores-df.json'))))"

# Validar relatório gerado
# Abrir no navegador e verificar:
# - Todos os componentes renderizam
# - Tema claro/escuro funciona
# - Botão imprimir funciona
# - Gráficos interativos
```

## Estratégia de Testes

### Testes Unitários
- Seleção de amostra retorna tamanho correto
- Estratificação proporcional funciona
- Prompt de eleitor contém todos os campos

### Testes de Integração
- Endpoint de entrevista responde corretamente
- Claude API retorna resposta válida
- Agregação calcula percentuais corretos

### Testes E2E
- Fluxo completo: amostra → entrevistas → relatório
- Relatório abre no navegador
- Todos os gráficos carregam

## Critérios de Aceitação

- [ ] 500 entrevistas executadas com sucesso
- [ ] Margem de erro < 5% para amostra
- [ ] Relatório segue padrão visual INTEIA
- [ ] Tema claro/escuro funcional
- [ ] Impressão A4 formatada
- [ ] Gráficos interativos funcionais
- [ ] Conclusão da Helena presente
- [ ] Recomendações priorizadas (🔴 🟡 🟢)
- [ ] Validação estatística incluída
- [ ] Pesquisador responsável no footer
