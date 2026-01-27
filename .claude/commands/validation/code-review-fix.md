# Code Review Fix: Corrigir Issues do Review

## Objetivo

Corrigir automaticamente issues identificadas no `/code-review`.

## Argumento

`$ARGUMENTS` - (Opcional) Lista de issues específicas para corrigir

## Processo

### 1. Ler Resultado do Code Review

Se executado após `/code-review`, usar issues identificadas.
Se não, executar `/code-review` primeiro.

### 2. Para Cada Issue

#### Priorização
1. ❌ **Críticas** - Segurança, bugs óbvios
2. ⚠️ **Importantes** - Padrões, tipos faltando
3. 💡 **Melhorias** - Refatorações sugeridas

#### Correção
Para cada issue:
1. Ler arquivo completo
2. Identificar problema exato
3. Aplicar correção seguindo padrões do projeto
4. Verificar que correção não quebra nada

### 3. Validar Correções

Após todas as correções:
```bash
# Re-executar validação
cd backend && ruff check app/ && python -m pytest tests/ -v
cd frontend && npm run lint && npm run build
```

## Formato de Saída

```
╔══════════════════════════════════════════════════════════════╗
║                    CODE REVIEW FIX                            ║
╠══════════════════════════════════════════════════════════════╣
║                                                                ║
║  Issues corrigidas: X/Y                                        ║
║                                                                ║
║  ✅ CORRIGIDO: Falta tratamento de erro                       ║
║     Arquivo: backend/app/api/rotas/eleitores.py:78            ║
║     Ação: Adicionado try/except com HTTPException             ║
║                                                                ║
║  ✅ CORRIGIDO: Função muito longa                             ║
║     Arquivo: backend/app/api/rotas/eleitores.py:45-120        ║
║     Ação: Extraída função auxiliar _processar_filtros()       ║
║                                                                ║
║  ⏭️  IGNORADO: Refatoração opcional                           ║
║     Motivo: Não crítico, pode ser feito em PR separado        ║
║                                                                ║
╠══════════════════════════════════════════════════════════════╣
║  VALIDAÇÃO PÓS-CORREÇÃO                                       ║
║  ├── Lint:    ✅ PASSOU                                       ║
║  ├── Testes:  ✅ PASSOU                                       ║
║  └── Build:   ✅ PASSOU                                       ║
║                                                                ║
║  STATUS: ✅ PRONTO PARA COMMIT                                ║
╚══════════════════════════════════════════════════════════════╝
```

## Regras de Correção

### Tratamento de Erros
```python
# Antes
resultado = await servico.buscar(id)
return resultado

# Depois
try:
    resultado = await servico.buscar(id)
    if not resultado:
        raise HTTPException(404, f"Recurso {id} não encontrado")
    return resultado
except Exception as e:
    logger.error("erro_buscar", id=id, erro=str(e))
    raise HTTPException(500, "Erro interno do servidor")
```

### Funções Longas
```python
# Extrair em funções menores
# Cada função deve ter responsabilidade única
# Máximo 50 linhas por função
```

### Tipos Faltando
```typescript
// Antes
function processar(dados) { ... }

// Depois
function processar(dados: DadosInput): ResultadoOutput { ... }
```

## Exemplo de Uso

```
# Corrigir todas as issues
/code-review-fix

# Corrigir issues específicas
/code-review-fix tratamento-erro,tipos-faltando
```
