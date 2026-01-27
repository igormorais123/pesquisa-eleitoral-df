# Validate: Validação Completa do Projeto

## Objetivo

Executar suite completa de validação: testes, lint, type check, coverage e build.

## Processo

### 1. Backend (Python/FastAPI)

```bash
cd backend

# Instalar dependências (se necessário)
pip install -r requirements.txt

# Lint com Ruff
ruff check app/

# Type check (se configurado)
mypy app/ --ignore-missing-imports

# Testes unitários
python -m pytest tests/ -v

# Cobertura
python -m pytest tests/ --cov=app --cov-report=term-missing

# Verificar cobertura mínima (80%)
python -m pytest tests/ --cov=app --cov-fail-under=80
```

### 2. Frontend (Next.js/TypeScript)

```bash
cd frontend

# Instalar dependências (se necessário)
npm install

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Testes unitários (se configurado)
npm run test

# Build de produção
npm run build
```

### 3. Testes E2E (Playwright)

```bash
cd frontend

# Instalar browsers (primeira vez)
npx playwright install

# Rodar testes E2E
npx playwright test

# Com relatório visual
npx playwright test --reporter=html
```

## Formato de Saída

```
╔══════════════════════════════════════════════════════════════╗
║                    RELATÓRIO DE VALIDAÇÃO                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                                ║
║  BACKEND                                                       ║
║  ├── Lint (Ruff):        ✅ PASSOU | ❌ X erros               ║
║  ├── Type Check:         ✅ PASSOU | ❌ X erros               ║
║  ├── Testes:             ✅ X/Y passaram | ❌ X falharam      ║
║  └── Cobertura:          XX% (mínimo: 80%)                    ║
║                                                                ║
║  FRONTEND                                                      ║
║  ├── Lint (ESLint):      ✅ PASSOU | ❌ X erros               ║
║  ├── Type Check:         ✅ PASSOU | ❌ X erros               ║
║  ├── Build:              ✅ PASSOU | ❌ FALHOU                ║
║  └── Testes E2E:         ✅ X/Y passaram | ❌ X falharam      ║
║                                                                ║
╠══════════════════════════════════════════════════════════════╣
║  RESULTADO FINAL:        ✅ APROVADO | ❌ REPROVADO           ║
╚══════════════════════════════════════════════════════════════╝
```

## Se Falhar

1. **Lint falhou**: Corrigir erros de estilo/formatação
2. **Type check falhou**: Corrigir tipos TypeScript/Python
3. **Testes falharam**: Investigar e corrigir testes
4. **Build falhou**: Verificar imports e dependências
5. **Cobertura baixa**: Adicionar mais testes

## Critérios de Aprovação

- [ ] Zero erros de lint
- [ ] Zero erros de type check
- [ ] Todos os testes passando
- [ ] Cobertura >= 80%
- [ ] Build de produção sucesso

## Exemplo de Uso

```
/validate
```

Após implementação, SEMPRE executar validação antes de commit.
