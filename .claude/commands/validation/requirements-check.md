# Requirements Check: Verificação de Requisitos Sólidos

## Objetivo

Validar que os requisitos estão **completos, claros e implementáveis** antes de qualquer desenvolvimento. Prevenir o "vibecoding" e garantir que entendemos o que estamos construindo.

## Argumento

`$ARGUMENTS` - Caminho para INITIAL.md, PRD, ou descrição de feature

## Por Que Isso Existe

> "A parte difícil nunca foi digitar o código. Foi saber O QUE digitar."
> - Fred Brooks

### O Problema do Vibecoding

Sem requisitos sólidos, caímos na armadilha:
```
Turn 1:  "Add feature X"
Turn 5:  "Wait, also need Y"
Turn 10: "Actually, Z doesn't work"
Turn 20: Código emaranhado, ninguém entende
```

### A Solução

Verificar requisitos ANTES de implementar. Investir tempo aqui economiza 10x depois.

---

## Checklist de Verificação

### 1. Clareza do Problema

- [ ] **Problema definido**: Qual dor estamos resolvendo?
- [ ] **Usuário identificado**: Quem vai usar isso?
- [ ] **Valor claro**: Por que isso importa?
- [ ] **Não-solução**: O que NÃO estamos resolvendo?

### 2. Requisitos Funcionais

Para cada requisito:

| Critério | Verificação |
|----------|-------------|
| **Específico** | Descreve exatamente O QUE, não como |
| **Mensurável** | Tem critério de aceite testável |
| **Alcançável** | É tecnicamente possível |
| **Relevante** | Resolve o problema definido |
| **Temporal** | Tem escopo definido (não infinito) |

### 3. Requisitos Não-Funcionais

- [ ] **Performance**: Tempos de resposta esperados?
- [ ] **Escala**: Quantos usuários/requests?
- [ ] **Segurança**: Autenticação? Autorização? Dados sensíveis?
- [ ] **Disponibilidade**: Uptime necessário?
- [ ] **Compatibilidade**: Browsers? Dispositivos? APIs?

### 4. Análise de Impacto

- [ ] **Sistemas afetados**: Quais módulos serão tocados?
- [ ] **Dependências**: O que precisa existir antes?
- [ ] **Breaking changes**: Algo vai quebrar?
- [ ] **Migração**: Dados existentes precisam migrar?

### 5. Edge Cases

- [ ] **Entrada vazia/nula**: O que acontece?
- [ ] **Entrada inválida**: Como tratar?
- [ ] **Falha de dependência**: API fora, DB lento?
- [ ] **Concorrência**: Múltiplos usuários simultâneos?
- [ ] **Limites**: Máximos e mínimos?

### 6. Complexidade

- [ ] **Essencial identificada**: Regras de negócio reais listadas
- [ ] **Acidental evitada**: Não estamos copiando patterns desnecessários
- [ ] **Tier definido**: 1, 2, 3 ou 4?

---

## Matriz de Completude

```
┌─────────────────────────────────────────────────────────────────┐
│                    MATRIZ DE REQUISITOS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Dimensão              Status    Notas                         │
│   ─────────             ──────    ─────                         │
│                                                                  │
│   Problema              [✓/✗]    _________________              │
│   Usuário               [✓/✗]    _________________              │
│   Funcionais            [✓/✗]    _________________              │
│   Não-funcionais        [✓/✗]    _________________              │
│   Impacto               [✓/✗]    _________________              │
│   Edge cases            [✓/✗]    _________________              │
│   Complexidade          [✓/✗]    _________________              │
│                                                                  │
│   COMPLETUDE: ___%                                               │
│                                                                  │
│   RECOMENDAÇÃO:                                                  │
│   [ ] Pronto para implementar                                    │
│   [ ] Precisa de mais clarificação em: ___________              │
│   [ ] Não recomendado - requisitos muito vagos                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Perguntas de Clarificação

Se requisitos não estão completos, fazer estas perguntas:

### Sobre o Problema
- "Qual é o problema específico que isso resolve?"
- "O que acontece se NÃO fizermos isso?"
- "Quem pediu isso e por quê?"

### Sobre a Solução
- "Existe mais de uma forma de resolver?"
- "Qual é a mais simples que funciona?"
- "O que NÃO deve fazer parte desta solução?"

### Sobre Validação
- "Como sabemos que está funcionando?"
- "O que seria um teste de aceite?"
- "Quais métricas indicam sucesso?"

### Sobre Riscos
- "O que pode dar errado?"
- "O que depende disso funcionar?"
- "Há data limite? Por quê?"

---

## Output

### Se Requisitos Completos

```
╔══════════════════════════════════════════════════════════════╗
║               REQUISITOS VERIFICADOS ✅                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                                ║
║  Problema: [descrição clara]                                  ║
║  Usuário: [persona identificada]                              ║
║  Tier: [1-4]                                                  ║
║                                                                ║
║  Requisitos Funcionais: X itens                               ║
║  Critérios de Aceite: Y definidos                             ║
║  Edge Cases: Z mapeados                                       ║
║                                                                ║
║  COMPLETUDE: 100%                                              ║
║  RECOMENDAÇÃO: Pronto para /research ou /plan-feature         ║
║                                                                ║
╚══════════════════════════════════════════════════════════════╝
```

### Se Requisitos Incompletos

```
╔══════════════════════════════════════════════════════════════╗
║               REQUISITOS INCOMPLETOS ⚠️                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                                ║
║  GAPS IDENTIFICADOS:                                          ║
║  ├── [gap 1]: precisa de clarificação                        ║
║  ├── [gap 2]: falta definição                                ║
║  └── [gap 3]: ambíguo                                        ║
║                                                                ║
║  PERGUNTAS PARA O USUÁRIO:                                    ║
║  1. [pergunta específica]                                     ║
║  2. [pergunta específica]                                     ║
║                                                                ║
║  COMPLETUDE: X%                                                ║
║  RECOMENDAÇÃO: Resolver gaps antes de prosseguir              ║
║                                                                ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Regras

1. **Não prosseguir com <70% completude** - Requisitos vagos = código emaranhado
2. **Documentar gaps** - Se não pode resolver, ao menos documentar
3. **Preferir perguntas a suposições** - Melhor perguntar que adivinhar errado
4. **Simple over Easy** - Requisitos simples são melhores que requisitos "flexíveis"

---

## Exemplo de Uso

```bash
# Verificar requisitos antes de planejar
/requirements-check INITIAL.md

# Verificar descrição informal
/requirements-check "Adicionar filtro de idade nos eleitores"

# Verificar PRD existente
/requirements-check .claude/PRD.md
```

## Próximo Passo

Se requisitos completos:
- Tier 1-2: `/plan-feature` direto
- Tier 3-4: `/research` primeiro

---

*"Tempo investido em requisitos claros é sempre recuperado na implementação."*
