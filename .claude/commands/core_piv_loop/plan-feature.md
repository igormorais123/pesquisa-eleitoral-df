# Plan Feature: Planejamento de Funcionalidades INTEIA

## Objetivo

Transformar requisitos de funcionalidades em **planos de implementação completos** através de análise sistemática do codebase - **SEM escrever código**.

O plano deve conter **TODO o contexto necessário** para implementação em uma única passada.

## Argumento

`$ARGUMENTS` - Descrição da funcionalidade ou caminho para INITIAL.md

## Processo (5 Fases)

### Fase 1: Entendimento da Funcionalidade

1. **Se INITIAL.md fornecido**: Ler arquivo completo
2. **Extrair problema central** - Qual dor do usuário resolve?
3. **Classificar tipo**:
   | Tipo | Descrição |
   |------|-----------|
   | `eleitor` | Relacionado aos eleitores sintéticos |
   | `pesquisa` | Execução de entrevistas/surveys |
   | `relatorio` | Geração de relatórios/dashboards |
   | `api` | Endpoints backend |
   | `ui` | Interface frontend |
   | `ia` | Integração com Claude API |

4. **Avaliar complexidade**:
   - **Baixa**: 1-3 arquivos, mudanças localizadas
   - **Média**: 4-8 arquivos, integração entre módulos
   - **Alta**: 9+ arquivos, arquitetura nova

5. **Criar user story**: "Como [usuário], quero [ação] para [benefício]"

### Fase 2: Inteligência do Codebase

1. **Analisar estrutura existente**:
   ```
   backend/app/api/rotas/     → Padrões de endpoints
   frontend/src/components/   → Padrões de componentes
   examples/                  → Código de referência
   ```

2. **Identificar padrões** (ler arquivos de referência):
   - `.claude/rules/api.md` para backend
   - `.claude/rules/components.md` para frontend
   - `examples/` para código modelo

3. **Mapear dependências**:
   - Quais módulos serão afetados?
   - Quais APIs serão consumidas?
   - Quais schemas Pydantic necessários?

4. **Documentar testes existentes**:
   - `backend/tests/` → pytest
   - `frontend/tests/` → Playwright

### Fase 3: Pesquisa Externa

**ULTRATHINK** antes de definir abordagem:

1. **Documentação de bibliotecas**:
   - [Next.js App Router](https://nextjs.org/docs/app)
   - [FastAPI](https://fastapi.tiangolo.com/)
   - [TanStack Query](https://tanstack.com/query/latest)
   - [Anthropic Claude](https://docs.anthropic.com/)

2. **Identificar gotchas**:
   - Limitações conhecidas
   - Casos de borda
   - Performance implications

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

Salvar em `.agents/plans/{nome-feature}.md` usando template:
- Copiar estrutura de `PRPs/templates/prp_base.md`
- Preencher TODAS as seções
- Incluir REFERÊNCIAS ESPECÍFICAS de linha/arquivo
- Incluir COMANDOS DE VALIDAÇÃO executáveis
- **Atribuir PONTUAÇÃO DE CONFIANÇA (1-10)**

## Template de Plano (Resumido)

```markdown
# PRP: [Nome da Feature]

## 1. Visão Geral
- Objetivo, contexto, user story, escopo

## 2. Metadados
- Tipo, complexidade, sistemas afetados, confiança X/10

## 3. Requisitos Funcionais
- Com critérios de aceite

## 4. Referências do Codebase
- Arquivos a modificar (com linhas)
- Arquivos a criar (baseados em quê)
- Código de exemplo

## 5. Plano de Implementação
- Fases com tarefas e validações

## 6. Comandos de Validação
- Lint, testes, build

## 7. Padrões de Erro Comuns
- Erro → Causa → Solução

## 8. Critérios de Sucesso
- Checklist final

## 9. Justificativa da Confiança
- Por que score X/10
```

## Pontuação de Confiança

| Score | Significado |
|-------|-------------|
| 9-10 | Implementação trivial, padrões claros |
| 7-8 | Bem definido, alguns riscos menores |
| 5-6 | Riscos moderados, pode precisar ajustes |
| 3-4 | Muitas incertezas, pesquisa adicional recomendada |
| 1-2 | Não recomendado implementar sem mais informação |

## Filosofia

> **"Contexto é Rei"** - O plano deve conter TODAS as informações necessárias para implementação bem-sucedida, permitindo execução em uma passada sem pesquisa ou esclarecimentos adicionais.

## Reset de Contexto

**IMPORTANTE**: Após criar o plano, a implementação deve acontecer em uma **NOVA CONVERSA** para contexto limpo. O plano captura todo o contexto necessário.

## Exemplo de Uso

```
# Com descrição
/plan-feature Adicionar filtro de orientação política

# Com arquivo INITIAL.md
/plan-feature INITIAL.md
```
