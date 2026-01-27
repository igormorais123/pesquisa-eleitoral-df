# Tiers de Complexidade - INTEIA

> Sistema de classificação para determinar a abordagem correta baseada na complexidade da tarefa.

## Visão Geral

| Tier | Complexidade | Abordagem | Exemplos |
|------|--------------|-----------|----------|
| 1 | Simples | Execução direta | Fix de typo, ajuste de estilo |
| 2 | Moderada | Planejamento leve | Nova função, componente simples |
| 3 | Alta | PIV Loop completo | Nova feature, integração API |
| 4 | Muito Alta | PIV + Subagentes | Arquitetura nova, refatoração major |

## Tier 1: Tarefas Simples

### Características
- 1-2 arquivos afetados
- Mudanças localizadas
- Sem impacto arquitetural
- Tempo: minutos

### Abordagem
```
1. Ler arquivo(s) relevante(s)
2. Fazer mudança
3. Validar (lint rápido)
4. Commit
```

### Exemplos
- Corrigir typo em documentação
- Ajustar cor/estilo CSS
- Atualizar constante
- Adicionar log de debug

---

## Tier 2: Tarefas Moderadas

### Características
- 2-5 arquivos afetados
- Mudanças relacionadas
- Impacto local
- Tempo: uma sessão

### Abordagem
```
1. Entender contexto (ler arquivos relacionados)
2. Planejar mentalmente
3. Implementar incrementalmente
4. Testar manualmente
5. Validar completo
6. Commit
```

### Exemplos
- Nova função utilitária
- Componente UI simples
- Endpoint CRUD básico
- Ajuste em lógica existente

---

## Tier 3: Tarefas Complexas

### Características
- 5-15 arquivos afetados
- Múltiplos módulos
- Impacto em arquitetura
- Tempo: múltiplas sessões

### Abordagem
```
1. /prime - Carregar contexto
2. /plan-feature - Criar plano detalhado
3. [NOVA CONVERSA]
4. /execute - Implementar do plano
5. /validate - Validação completa
6. /code-review - Review automatizado
7. /commit
```

### Exemplos
- Nova feature completa
- Integração com API externa
- Novo fluxo de usuário
- Refatoração de módulo

---

## Tier 4: Tarefas de Alta Complexidade

### Características
- 15+ arquivos afetados
- Arquitetura nova
- Impacto sistêmico
- Tempo: projeto dedicado

### Abordagem
```
1. /prime - Contexto profundo
2. Análise arquitetural (múltiplas sessões de pesquisa)
3. ADR (Architecture Decision Record)
4. /plan-feature - Plano detalhado por fase
5. Implementação em sprints:
   - Fase 1: Fundação
   - Fase 2: Core
   - Fase 3: Integração
   - Fase 4: Polish
6. Validação por fase
7. /system-review ao final
```

### Exemplos
- Nova arquitetura de dados
- Migração de framework
- Sistema de plugins
- Reestruturação completa

---

## Como Classificar

### Perguntas-Chave

1. **Quantos arquivos serão afetados?**
   - 1-2: Tier 1
   - 2-5: Tier 2
   - 5-15: Tier 3
   - 15+: Tier 4

2. **Há impacto em outros módulos?**
   - Não: Tier 1-2
   - Sim, localizado: Tier 3
   - Sim, sistêmico: Tier 4

3. **Precisa de pesquisa/análise prévia?**
   - Não: Tier 1-2
   - Sim, moderada: Tier 3
   - Sim, extensiva: Tier 4

4. **Há risco de quebrar funcionalidades existentes?**
   - Mínimo: Tier 1-2
   - Moderado: Tier 3
   - Alto: Tier 4

### Matriz de Decisão

```
                    Arquivos Afetados
                    1-2   3-5   6-15   15+
                   ┌─────┬─────┬─────┬─────┐
Impacto    Nenhum │  1  │  2  │  2  │  3  │
           Local  │  2  │  2  │  3  │  3  │
           Módulo │  2  │  3  │  3  │  4  │
           Sistema│  3  │  3  │  4  │  4  │
                   └─────┴─────┴─────┴─────┘
```

---

## Regras de Ouro

1. **Na dúvida, suba um tier** - Melhor planejar demais que de menos
2. **Tier 3+ sempre usa PIV Loop** - Planejamento separado de execução
3. **Tier 4 divide em fases** - Nunca tente fazer tudo de uma vez
4. **Reclassifique se necessário** - Se descobrir mais complexidade, ajuste

---

*Baseado no Manual de Engenharia de Contexto v2.0*
