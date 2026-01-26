---
name: "PRP Template v2.0 - Context-Rich com Loops de Validação"
description: |
  Template otimizado para agentes de IA implementarem features com
  contexto suficiente e capacidades de auto-validação para alcançar
  código funcionando através de refinamento iterativo.

  - Contexto é Rei: Inclua TODA documentação necessária
  - Loops de Validação: Forneça testes executáveis
  - Denso em Informação: Use keywords e padrões da base de código
  - Sucesso Progressivo: Comece simples, valide, então melhore
---

# PRP: [Nome da Feature]

## 1. Visão Geral

### Objetivo
[O que precisa ser construído - seja específico sobre estado final]

### Contexto
[Por que esta feature é necessária, como se encaixa no sistema]

### User Story
Como [usuário], quero [ação] para [benefício].

### Escopo
- **Inclui**: [lista do que está no escopo]
- **Não inclui**: [lista do que está fora do escopo]

## 2. Metadados

| Campo | Valor |
|-------|-------|
| **Tipo** | eleitor / pesquisa / relatorio / api / ui / ia |
| **Complexidade** | baixa / média / alta |
| **Sistemas afetados** | backend, frontend, banco de dados |
| **Estimativa de arquivos** | X arquivos |
| **Confiança de Sucesso** | X/10 |

## 3. Requisitos Funcionais

### 3.1 [Requisito 1]
**Descrição**: ...
**Critério de Aceite**: ...
**Exemplos**: ...

### 3.2 [Requisito 2]
**Descrição**: ...
**Critério de Aceite**: ...
**Exemplos**: ...

## 4. Referências do Codebase

### Arquivos a Modificar
| Arquivo | Linhas | Padrão a Seguir |
|---------|--------|-----------------|
| `path/to/file.py` | 45-60 | Exemplo de padrão existente |

### Arquivos a Criar
| Arquivo | Baseado em | Propósito |
|---------|------------|-----------|
| `path/new/file.py` | modelo existente | descrição |

### Padrões de Código Existentes
```python
# Copiar padrão de: backend/app/api/rotas/eleitores.py
@router.get("/recurso")
async def listar_recurso(
    db: AsyncSession = Depends(get_db),
    filtro: Optional[str] = Query(None)
):
    ...
```

## 5. Requisitos Técnicos

### Arquitetura
```
[Diagrama ASCII ou descrição da arquitetura]

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────►│   Backend   │────►│  Database   │
│  (Next.js)  │     │  (FastAPI)  │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
```

### Dependências
- [dependência 1] - propósito
- [dependência 2] - propósito

## 6. Plano de Implementação

### Fase 1: [Nome] - Backend
1. [ ] Passo detalhado 1
2. [ ] Passo detalhado 2
3. [ ] **VALIDAÇÃO**: `cd backend && python -m pytest tests/ -v -k "test_nome"`

### Fase 2: [Nome] - Frontend
1. [ ] Passo detalhado 1
2. [ ] Passo detalhado 2
3. [ ] **VALIDAÇÃO**: `cd frontend && npm run lint && npm run build`

### Fase 3: [Nome] - Integração
1. [ ] Passo detalhado 1
2. [ ] Passo detalhado 2
3. [ ] **VALIDAÇÃO**: `cd frontend && npx playwright test`

## 7. Comandos de Validação

```bash
# Backend - Lint
cd backend && ruff check app/

# Backend - Testes
cd backend && python -m pytest tests/ -v

# Backend - Cobertura
cd backend && python -m pytest tests/ --cov=app --cov-fail-under=80

# Frontend - Lint
cd frontend && npm run lint

# Frontend - Type Check
cd frontend && npx tsc --noEmit

# Frontend - Build
cd frontend && npm run build

# E2E - Playwright
cd frontend && npx playwright test
```

## 8. Estratégia de Testes

### Testes Unitários (70%)
| Teste | Cenário | Arquivo |
|-------|---------|---------|
| test_criar_recurso | Criação com dados válidos | tests/test_recurso.py |
| test_criar_recurso_invalido | Validação de campos | tests/test_recurso.py |

### Testes de Integração (20%)
| Teste | Cenário |
|-------|---------|
| Endpoint retorna 200 com dados corretos | GET /api/v1/recurso |
| Endpoint retorna 404 para ID inexistente | GET /api/v1/recurso/9999 |

### Testes E2E (10%)
| Fluxo | Passos |
|-------|--------|
| Usuário cria recurso | Login → Navegar → Preencher → Salvar → Verificar |

## 9. Padrões de Erro Comuns

| Erro | Causa Provável | Solução |
|------|----------------|---------|
| `ImportError: cannot import X` | Path alias incorreto | Usar `@/` ao invés de caminhos relativos |
| `422 Validation Error` | Schema Pydantic errado | Verificar tipos e campos required |
| `CORS error` | Origem não permitida | Adicionar URL em CORS settings |
| `Claude timeout` | Prompt muito longo | Reduzir contexto do eleitor |

## 10. Critérios de Sucesso

### Obrigatórios
- [ ] Todos os testes passam
- [ ] Zero erros de lint
- [ ] Cobertura >= 80%
- [ ] Build de produção OK
- [ ] Documentação atualizada

### Desejáveis
- [ ] Performance < 200ms
- [ ] Acessibilidade OK
- [ ] Mobile responsivo

## 11. Documentação Adicional

### Links Úteis
- [Next.js App Router](https://nextjs.org/docs/app)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Pydantic v2](https://docs.pydantic.dev/latest/)

### Gotchas Específicos do Projeto
- Sempre usar português em mensagens de erro
- Padrão visual INTEIA em componentes UI
- Eleitores têm 60+ atributos - não carregar todos na listagem

---

## Justificativa da Confiança

**Score: X/10**

**Pontos fortes:**
- [razão 1]
- [razão 2]

**Riscos identificados:**
- [risco 1] - mitigação: [ação]
- [risco 2] - mitigação: [ação]

---

*PRP gerado em: [data]*
*Comando: /plan-feature [descrição]*
