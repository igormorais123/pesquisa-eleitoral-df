# Commit: Criar Commit Padronizado

## Objetivo

Criar um commit seguindo convenções do projeto, em português brasileiro.

## Processo

### 1. Verificar Estado

```bash
git status
git diff --staged
```

### 2. Analisar Mudanças

Identificar:
- Tipo de mudança (feat, fix, refactor, docs, style, test, chore)
- Escopo afetado (backend, frontend, scripts, docs)
- Resumo do que foi feito

### 3. Formato da Mensagem

```
tipo(escopo): descrição curta

Descrição detalhada se necessário.
- Item 1
- Item 2

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Tipos de Commit

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração sem mudança de comportamento |
| `docs` | Documentação |
| `style` | Formatação, lint |
| `test` | Testes |
| `chore` | Manutenção, dependências |

### Exemplos

```bash
# Feature
git commit -m "feat(eleitores): adiciona filtro por região administrativa"

# Fix
git commit -m "fix(api): corrige timeout na execução de entrevistas"

# Docs
git commit -m "docs: atualiza README com instruções de deploy"
```

### 4. Executar Commit

```bash
git add <arquivos>
git commit -m "$(cat <<'EOF'
tipo(escopo): descrição

Detalhes...

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### 5. Push (se autorizado)

```bash
git push origin $(git branch --show-current)
```

## Notas

- Mensagens SEMPRE em português
- Descrição no imperativo ("adiciona", não "adicionado")
- Máximo 72 caracteres na primeira linha
- Linha em branco antes do corpo
