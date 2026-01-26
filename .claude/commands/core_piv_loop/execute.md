# Execute: Implementar a partir do Plano

## Objetivo

Ler um documento de plano (PRP) e executar sistematicamente todas as tarefas de implementação, validando a cada passo.

## Argumento

`$ARGUMENTS` - Caminho para o arquivo de plano (ex: `.agents/plans/minha-feature.md`)

## Pré-Requisitos

- [ ] Plano aprovado existe em `.agents/plans/`
- [ ] Contexto do projeto carregado (`/prime` executado)
- [ ] Ambiente configurado (`/init-project` se necessário)

## Workflow de Execução

### Fase 1: Leitura e Planejamento

1. **Ler o plano INTEIRO** cuidadosamente
2. **Criar checklist mental** de todas as tarefas
3. **Identificar dependências** entre tarefas
4. **Mapear comandos de validação** para cada fase

### Fase 2: Implementação Incremental

Para CADA tarefa no plano:

```
┌─────────────────────────────────────────────────────────────┐
│                    CICLO DE IMPLEMENTAÇÃO                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. IDENTIFICAR       2. IMPLEMENTAR      3. VALIDAR       │
│   ─────────────       ─────────────       ─────────────     │
│   Ler arquivos        Fazer mudanças      Verificar         │
│   existentes          seguindo padrões    syntax/imports    │
│                                                              │
│   Verificar           Adicionar           Rodar lint        │
│   padrões             comentários         se necessário     │
│                       em português                          │
│                                                              │
│   4. TESTAR           5. PRÓXIMA          6. COMMIT         │
│   ─────────────       ─────────────       ─────────────     │
│   Testes unitários    Se validou,         Atômico após      │
│   se especificado     próxima tarefa      componente        │
│                                           completo          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Fase 3: Testes

1. **Criar arquivos de teste** conforme especificado no plano
2. **Implementar casos de teste** para cada cenário
3. **Cobrir edge cases** identificados
4. **Rodar suite de testes**:
   ```bash
   cd backend && python -m pytest tests/ -v
   cd frontend && npm run test
   ```

### Fase 4: Validação Completa

Executar **TODOS** os comandos de validação do plano em ordem:

```bash
# 1. Backend
cd backend
ruff check app/                              # Lint
python -m pytest tests/ -v                   # Testes
python -m pytest tests/ --cov=app --cov-fail-under=80  # Cobertura

# 2. Frontend
cd frontend
npm run lint                                 # Lint
npx tsc --noEmit                            # Type check
npm run build                               # Build produção

# 3. E2E (se aplicável)
npx playwright test
```

**PARAR** se qualquer validação falhar. Corrigir antes de prosseguir.

### Fase 5: Checkpoint Final

Confirmar TODOS os itens:

- [ ] Todas as tarefas do plano concluídas
- [ ] Todos os testes passando
- [ ] Lint sem erros
- [ ] Build de produção OK
- [ ] Código segue convenções do projeto
- [ ] Comentários em português
- [ ] Documentação atualizada (se necessário)

## Tratamento de Erros

### Se Teste Falhar

```
1. Ler mensagem de erro COMPLETA
2. Identificar causa raiz
3. Corrigir implementação
4. Re-rodar teste específico
5. Se persistir, consultar .claude/rules/ relevante
6. Documentar solução para futura referência
```

### Se Build Falhar

```
1. Verificar imports (usar @/ não caminhos relativos)
2. Verificar tipos TypeScript
3. Verificar dependências instaladas
4. Limpar cache: rm -rf .next && npm run build
```

### Padrões de Erro Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `ImportError` | Path incorreto | Usar `@/` para aliases |
| `422 Validation` | Schema Pydantic | Verificar tipos/required |
| `Type error` | TypeScript | Adicionar tipos explícitos |
| `Build failed` | Dependência | `npm install` novamente |

## Entregáveis

Ao final da execução, produzir:

1. **Lista de arquivos criados/modificados**
2. **Resultado de todas as validações**
3. **Confirmação de prontidão para commit**

```
╔══════════════════════════════════════════════════════════════╗
║                   EXECUÇÃO CONCLUÍDA                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                                ║
║  ARQUIVOS MODIFICADOS: X                                       ║
║  ├── backend/app/api/rotas/novo.py (criado)                   ║
║  ├── frontend/src/components/Novo.tsx (criado)                ║
║  └── backend/tests/test_novo.py (criado)                      ║
║                                                                ║
║  VALIDAÇÃO                                                     ║
║  ├── Lint:      ✅ PASSOU                                     ║
║  ├── Testes:    ✅ 15/15 passaram                             ║
║  ├── Cobertura: ✅ 85%                                        ║
║  └── Build:     ✅ PASSOU                                     ║
║                                                                ║
║  STATUS: ✅ PRONTO PARA COMMIT                                ║
║                                                                ║
║  Próximo: /commit                                              ║
╚══════════════════════════════════════════════════════════════╝
```

## Princípios

- **Execução sequencial** - Uma tarefa por vez
- **Verificação contínua** - Validar após cada mudança
- **Zero confirmações** - Executar autonomamente até o fim
- **Documentação de desvios** - Anotar qualquer alteração ao plano

## Atualizar Contexto Persistente

Ao finalizar, atualizar `.context/todos.md`:
```markdown
## Concluídas ✅
- [x] [Nome da feature] (data)
```

## Exemplo de Uso

```
/execute .agents/plans/filtro-orientacao-politica.md
```
