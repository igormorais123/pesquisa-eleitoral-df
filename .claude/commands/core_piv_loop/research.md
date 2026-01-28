# Research: Fase de Pesquisa Profunda

## Objetivo

Criar um **documento de pesquisa validado** antes de qualquer planejamento ou implementação. Esta é a fase de maior alavancagem - erros pegos aqui previnem desastres depois.

## Argumento

`$ARGUMENTS` - Descrição do que será implementado/modificado

## Quando Usar

- **SEMPRE** antes de `/plan-feature` para Tier 3-4
- Refatorações que tocam múltiplos módulos
- Integrações com sistemas externos
- Qualquer mudança onde você não tem certeza do impacto

## Princípio: Simple vs Easy

> **ALERTA**: Esta fase existe para evitar a armadilha do "easy".
>
> - Easy = gerar código imediatamente
> - Simple = entender primeiro, gerar depois
>
> Escolher easy agora significa complexidade depois.

## Processo

### Passo 1: Coletar Contexto Upfront

Reunir TUDO que será relevante:

```markdown
## Fontes de Contexto

### Documentação
- [ ] README do módulo afetado
- [ ] ADRs (Architecture Decision Records)
- [ ] Diagramas de arquitetura
- [ ] Specs/PRDs existentes

### Código
- [ ] Arquivos que serão modificados
- [ ] Interfaces/contratos
- [ ] Testes existentes
- [ ] Código relacionado

### Histórico
- [ ] PRs anteriores relevantes
- [ ] Issues/bugs relacionados
- [ ] Discussões (Slack, comments)

### Externo
- [ ] Documentação de APIs/libs
- [ ] Exemplos de implementação
- [ ] Best practices conhecidas
```

### Passo 2: Análise Iterativa

**NÃO é one-shot.** Interrogar ativamente:

```
"E quanto ao caching aqui?"
"Como isso trata falhas?"
"O que acontece se X falhar?"
"Quais serviços dependem disso?"
"Há casos de borda não documentados?"
```

### Passo 3: Identificar Complexidades

Separar explicitamente:

#### Complexidade Essencial (manter)
- Regras de negócio reais
- Requisitos do usuário
- Constraints técnicos necessários

#### Complexidade Acidental (questionar)
- Workarounds históricos
- Código defensivo excessivo
- Abstrações que não fazem mais sentido
- Patterns copiados sem necessidade

### Passo 4: Mapear Impacto

```
Mudança Proposta
      │
      ├──► Módulo A (direto)
      │       └──► Dependência A1
      │       └──► Dependência A2
      │
      ├──► Módulo B (indireto)
      │       └──► Via API compartilhada
      │
      └──► Módulo C (potencial)
              └──► Se X acontecer
```

## Output: Documento de Pesquisa

Salvar em `.agents/research/{nome-feature}-research.md`:

```markdown
# Pesquisa: [Nome da Feature]

## Data
YYYY-MM-DD

## Objetivo
[O que estamos tentando fazer]

## Análise do Estado Atual

### O que existe
- [Componentes relevantes]
- [Padrões atuais]
- [Limitações conhecidas]

### O que conecta com o quê
- [Diagrama ou lista de dependências]
- [Fluxos de dados]
- [Pontos de integração]

### O que a mudança vai afetar
- [Impacto direto]
- [Impacto indireto]
- [Riscos identificados]

## Complexidade Identificada

### Essencial (preservar)
1. [Regra de negócio X]
2. [Requisito Y]

### Acidental (questionar/remover)
1. [Workaround Z - por quê?]
2. [Padrão W - ainda necessário?]

## Perguntas Respondidas
- Q: [Pergunta]
  A: [Resposta com evidência]

## Perguntas em Aberto
- [ ] [Pergunta que precisa de resposta]

## Fontes Consultadas
- [arquivo:linha] - [o que foi encontrado]
- [doc] - [informação relevante]

## Validação
- [ ] Análise corresponde à realidade?
- [ ] Dependências estão corretas?
- [ ] Riscos foram identificados?
- [ ] Complexidade acidental foi marcada?
```

## Regra de Pausa Automática

**PAUSAR apenas quando:** 10+ iterações OU 30+ minutos de trabalho contínuo

Ao atingir limite:
1. Compile descobertas no documento de pesquisa
2. Salve o estado
3. Considere nova conversa com contexto limpo

## Caso Especial: Código Muito Emaranhado

Se a análise revelar que o código está muito acoplado para AI ajudar:

1. **Faça uma migração manual pequena primeiro**
   - Sem AI, apenas entendendo
   - Descubra constraints ocultos
   - Veja o que quebra

2. **Use essa migração como SEED**
   - Alimente o PR no processo de pesquisa
   - AI aprende como migração limpa se parece

3. **Documente para o plano**
   - "Precisa de migração manual primeiro em X"
   - "Usar PR Y como padrão"

## Exemplo de Uso

```bash
# Antes de implementar nova feature
/research Adicionar filtro de orientação política nos eleitores

# Antes de refatorar
/research Migrar autenticação para novo sistema OAuth

# Antes de integrar
/research Integrar com API de geolocalização do IBGE
```

## Próximo Passo

Após documento de pesquisa aprovado:
```bash
/plan-feature [usando documento de pesquisa como base]
```

---

*Baseado em: Spec-Driven Development (Netflix)*
*"O checkpoint humano é o momento de maior alavancagem em todo o processo."*
