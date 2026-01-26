# Plan Feature: Planejamento de Funcionalidades INTEIA

## Objetivo

Transformar requisitos de funcionalidades em **planos de implementação completos** através de análise sistemática do codebase - SEM escrever código.

## Argumento

`$ARGUMENTS` - Descrição da funcionalidade a ser planejada

## Processo (5 Fases)

### Fase 1: Entendimento da Funcionalidade

1. **Extrair problema central** - Qual dor do usuário resolve?
2. **Classificar tipo**:
   - `eleitor` - Relacionado aos eleitores sintéticos
   - `pesquisa` - Execução de entrevistas/surveys
   - `relatorio` - Geração de relatórios/dashboards
   - `api` - Endpoints backend
   - `ui` - Interface frontend
   - `ia` - Integração com Claude API
3. **Avaliar complexidade**: baixa | média | alta
4. **Criar user story**: "Como [usuário], quero [ação] para [benefício]"

### Fase 2: Inteligência do Codebase

1. **Analisar estrutura** existente em:
   - `backend/app/api/rotas/` - Padrões de endpoints
   - `frontend/src/components/` - Padrões de componentes
   - `frontend/src/lib/claude/` - Padrões de prompts

2. **Identificar padrões**:
   - Convenções de nomenclatura
   - Estrutura de arquivos
   - Tratamento de erros
   - Estilos CSS/Tailwind

3. **Mapear dependências**:
   - Quais módulos serão afetados?
   - Quais APIs serão consumidas?
   - Quais dados serão necessários?

4. **Documentar testes existentes**:
   - Onde estão os testes?
   - Qual framework (pytest, vitest, playwright)?
   - Padrões de cobertura

### Fase 3: Pesquisa Externa

1. **Documentação de bibliotecas**:
   - Next.js App Router
   - FastAPI
   - SQLAlchemy 2.0
   - Anthropic Claude SDK
   - Chart.js/Plotly para gráficos

2. **Melhores práticas**:
   - Padrões de API REST
   - React Query/TanStack
   - Tailwind CSS

### Fase 4: Pensamento Estratégico

1. **Avaliar fit arquitetural** - Como se encaixa no sistema?
2. **Identificar dependências críticas** - O que precisa existir antes?
3. **Planejar edge cases**:
   - Eleitor sem dados completos
   - Entrevista interrompida
   - Timeout de API Claude
4. **Segurança**: Validação de inputs, sanitização
5. **Extensibilidade**: Preparar para features futuras

### Fase 5: Geração do Plano

Salvar em `.agents/plans/{nome-feature}.md` com estrutura:

```markdown
# Plano: {Nome da Feature}

## Descrição
[Resumo em 2-3 frases]

## User Story
Como [usuário], quero [ação] para [benefício].

## Metadados
- **Tipo**: eleitor | pesquisa | relatorio | api | ui | ia
- **Complexidade**: baixa | média | alta
- **Sistemas afetados**: backend, frontend, banco de dados
- **Estimativa de arquivos**: X arquivos

## Referências do Codebase

### Arquivos a Modificar
| Arquivo | Linha | Padrão a Seguir |
|---------|-------|-----------------|
| path/to/file.py | 45-60 | Exemplo de padrão |

### Arquivos a Criar
| Arquivo | Baseado em | Propósito |
|---------|------------|-----------|
| path/new/file.py | modelo existente | descrição |

## Documentação Relevante

### Bibliotecas
- [Link 1](url) - Seção específica
- [Link 2](url) - Seção específica

## Tarefas de Implementação

### Backend
- [ ] Tarefa 1 - Descrição detalhada
- [ ] Tarefa 2 - Descrição detalhada

### Frontend
- [ ] Tarefa 3 - Descrição detalhada
- [ ] Tarefa 4 - Descrição detalhada

### Validação
```bash
# Comando de validação 1
cd backend && python -m pytest tests/

# Comando de validação 2
cd frontend && npm run lint
```

## Estratégia de Testes

### Testes Unitários
- Teste 1: cenário
- Teste 2: cenário

### Testes de Integração
- Endpoint X retorna Y
- Componente renderiza Z

### Testes E2E (se necessário)
- Fluxo completo do usuário

## Critérios de Aceitação

- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3
- [ ] Testes passando
- [ ] Lint sem erros
- [ ] Documentação atualizada
```

## Filosofia

**"Contexto é Rei"** - O plano deve conter TODAS as informações necessárias para implementação bem-sucedida, permitindo execução em uma passada sem pesquisa ou esclarecimentos adicionais.

## Exemplo de Uso

```
/plan-feature Adicionar filtro de orientação política na listagem de eleitores
```
