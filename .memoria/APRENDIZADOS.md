# Aprendizados - INTEIA

> **Evolução**: Registro de aprendizados que melhoram o sistema.
> Cada entrada deve ter data, contexto e ação tomada.

## 2026-01-26 - Implementação do Sistema de Engenharia de Contexto

### Contexto
Adaptação do sistema PIV Loop do repositório habit-tracker para o projeto INTEIA.

### Aprendizado
O sistema de contexto persistente é fundamental para manter continuidade entre sessões. A separação entre planejamento e execução (em conversas diferentes) reduz erros e mantém foco.

### Ação
- Criado `.context/` com context.md, todos.md, insights.md
- Criado `.claude/commands/` com ciclo PIV completo
- Criado `.claude/rules/` com regras modulares
- Criado `examples/` com código de referência

### Resultado
Sistema funcionando, testado com `/prime` com sucesso.

---

## 2026-01-26 - Upgrade para Sistema de Memória Hierárquica

### Contexto
Análise do manual v2.0 de engenharia de contexto revelou melhorias.

### Aprendizado
Memória hierárquica (ativo/longo prazo/aprendizados) é mais eficiente que sistema flat. Permite:
- Contexto limpo a cada sessão
- Conhecimento persistente entre sessões
- Registro de evolução do sistema

### Ação
- Criado `.memoria/` com estrutura hierárquica
- CONTEXTO_ATIVO.md para sessão atual
- MEMORIA_LONGO_PRAZO.md para conhecimento permanente
- APRENDIZADOS.md para evolução

### Resultado
Sistema de memória mais robusto e organizado.

---

## Template para Novos Aprendizados

```markdown
## YYYY-MM-DD - Título do Aprendizado

### Contexto
O que estava acontecendo quando o aprendizado ocorreu.

### Aprendizado
O que foi descoberto ou entendido.

### Ação
O que foi feito em resposta ao aprendizado.

### Resultado
Qual foi o impacto da ação.
```

---

*Este arquivo cresce ao longo do tempo. Não deletar entradas antigas.*
