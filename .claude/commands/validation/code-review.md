# Code Review: Revisão Técnica Automatizada

## Objetivo

Executar revisão técnica nos arquivos alterados, verificando padrões, segurança e qualidade.

## Processo

### 1. Identificar Arquivos Alterados

```bash
# Arquivos modificados desde último commit
git diff --name-only HEAD~1

# Ou arquivos staged
git diff --cached --name-only
```

### 2. Checklist de Revisão

Para CADA arquivo alterado, verificar:

#### Código Python (Backend)
- [ ] Docstrings em funções públicas
- [ ] Type hints em parâmetros e retorno
- [ ] Tratamento de erros apropriado
- [ ] Logging de operações importantes
- [ ] Sem secrets hardcoded
- [ ] Queries parametrizadas (sem SQL injection)
- [ ] Validação de input com Pydantic

#### Código TypeScript (Frontend)
- [ ] Interface de Props definida
- [ ] Tipos explícitos (não `any`)
- [ ] Error boundaries onde necessário
- [ ] Acessibilidade (aria-labels)
- [ ] Path aliases usados (não caminhos relativos longos)
- [ ] Sem console.log em produção

#### Ambos
- [ ] Nomenclatura segue convenções do projeto
- [ ] Tamanho de arquivo < 300 linhas
- [ ] Funções < 50 linhas
- [ ] Sem código comentado desnecessário
- [ ] Sem TODO sem issue associada

### 3. Verificar Segurança

Consultar `.claude/rules/seguranca.md`:
- [ ] Input sanitizado
- [ ] Secrets em env vars
- [ ] CORS configurado
- [ ] Rate limiting se necessário

### 4. Verificar Padrões do Projeto

Consultar regras modulares:
- `.claude/rules/api.md` para backend
- `.claude/rules/components.md` para frontend

## Formato de Saída

```
╔══════════════════════════════════════════════════════════════╗
║                       CODE REVIEW                             ║
╠══════════════════════════════════════════════════════════════╣
║                                                                ║
║  Arquivos revisados: X                                         ║
║                                                                ║
║  📁 backend/app/api/rotas/eleitores.py                        ║
║  ├── ✅ Docstrings presentes                                  ║
║  ├── ✅ Type hints corretos                                   ║
║  ├── ⚠️  AVISO: Função muito longa (linha 45-120)            ║
║  └── ❌ ISSUE: Falta tratamento de erro na linha 78          ║
║                                                                ║
║  📁 frontend/src/components/CardEleitor.tsx                   ║
║  ├── ✅ Props tipadas                                         ║
║  ├── ✅ Acessibilidade ok                                     ║
║  └── ✅ Padrões seguidos                                      ║
║                                                                ║
╠══════════════════════════════════════════════════════════════╣
║  RESUMO                                                        ║
║  ├── ✅ Aprovados: X                                          ║
║  ├── ⚠️  Avisos: Y                                            ║
║  └── ❌ Issues: Z                                              ║
║                                                                ║
║  VEREDICTO: ✅ APROVADO | ⚠️ APROVADO COM RESSALVAS | ❌ REPROVAR  ║
╚══════════════════════════════════════════════════════════════╝
```

## Se Houver Issues

1. Listar cada issue com:
   - Arquivo e linha
   - Descrição do problema
   - Sugestão de correção

2. Executar `/code-review-fix` para corrigir automaticamente

## Exemplo de Uso

```
/code-review
```
