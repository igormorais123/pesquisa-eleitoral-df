# Execute: Implementar a partir do Plano

## Objetivo

Ler um documento de plano e executar sistematicamente todas as tarefas de implementação.

## Argumento

`$ARGUMENTS` - Caminho para o arquivo de plano (ex: `.agents/plans/minha-feature.md`)

## Workflow de Execução

### Fase 1: Planejamento

1. **Ler o plano INTEIRO** cuidadosamente
2. **Entender todas as tarefas** e suas dependências
3. **Identificar comandos de validação** para cada etapa
4. **Mapear estratégia de testes** especificada

### Fase 2: Implementação

Para CADA tarefa no plano:

1. **Identificar arquivos necessários**
   - Ler arquivos existentes antes de modificar
   - Verificar padrões usados

2. **Implementar mudanças**
   - Seguir especificações do plano
   - Manter padrões do projeto
   - Português brasileiro em comentários

3. **Verificar após cada modificação**
   ```bash
   # Python
   python -m py_compile arquivo.py

   # TypeScript
   npx tsc --noEmit
   ```

### Fase 3: Testes

1. **Criar arquivos de teste** conforme especificado
2. **Implementar casos de teste** para cada cenário
3. **Cobrir edge cases** identificados no plano

### Fase 4: Validação

Executar TODOS os comandos de validação do plano em ordem:

```bash
# Backend
cd backend && pip install -r requirements.txt
cd backend && python -m pytest tests/ -v

# Frontend
cd frontend && npm install
cd frontend && npm run lint
cd frontend && npm run build

# E2E (se aplicável)
cd frontend && npx playwright test
```

Resolver qualquer falha ANTES de prosseguir.

### Fase 5: Checkpoint Final

Confirmar:
- [ ] Todas as tarefas concluídas
- [ ] Todos os testes passando
- [ ] Validação bem-sucedida
- [ ] Código segue convenções do projeto
- [ ] Documentação atualizada (se necessário)
- [ ] Pronto para commit

## Entregáveis

1. **Lista de tarefas completas** com caminhos de arquivos
2. **Arquivos de teste** criados
3. **Resumo de resultados** de validação
4. **Confirmação de prontidão** para commit

## Princípios

- **Execução sequencial** - Uma tarefa por vez
- **Verificação contínua** - Validar após cada mudança
- **Documentação de desvios** - Anotar qualquer alteração ao plano
- **Zero confirmações** - Executar autonomamente até o fim

## Exemplo de Uso

```
/execute .agents/plans/filtro-orientacao-politica.md
```

## Troubleshooting

### Se um teste falhar:
1. Ler mensagem de erro completa
2. Verificar se implementação segue o plano
3. Corrigir e re-executar
4. Documentar a correção

### Se validação falhar:
1. Identificar comando que falhou
2. Verificar dependências instaladas
3. Corrigir problema específico
4. Re-executar toda validação

### Se houver conflito com código existente:
1. Priorizar padrões existentes
2. Documentar decisão
3. Atualizar plano se necessário
