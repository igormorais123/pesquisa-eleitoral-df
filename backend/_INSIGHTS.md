# _INSIGHTS.md - Backend

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

| Arquivo | Linha | Problema | Impacto |
|---------|-------|----------|---------|
| `app/core/database.py` | 166 | `datetime` tipo None | Baixo - funciona em runtime |
| `app/core/database.py` | 234 | `checkedout` atributo desconhecido | Baixo |
| `app/core/rls_middleware.py` | 223-225 | Atributos podem ser None | Baixo - tem fallbacks |
| `app/db/session.py` | 115 | `execute()` com string literal | Baixo |
| `app/api/rotas/autenticacao.py` | 312 | `usuario_id` pode ser None | **Medio** - precisa fix |
| `app/api/rotas/eleitores.py` | 236 | `exportar_csv` nao existe | **Alto** - funcao faltando |

## Decisoes Arquiteturais

### Multi-tenancy via RLS
- PostgreSQL Row Level Security isola dados por usuario
- Middleware seta `app.current_user_id` antes de queries
- **IMPORTANTE**: Sempre setar usuario ANTES de acessar banco

### Autenticacao JWT
- Tokens expiram em 24h
- Senhas com bcrypt
- Refresh tokens NAO implementados ainda

### Async por Padrao
- Todas as rotas sao async
- SQLAlchemy 2.0 com asyncpg
- Usar `await` em todas as operacoes de banco

## Padroes do Codigo

```python
# Imports organizados
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

# Prefixo padrao
router = APIRouter(prefix="/recurso", tags=["recurso"])

# Tipagem obrigatoria
async def funcao(db: AsyncSession = Depends(get_db)) -> TipoRetorno:
```

## Armadilhas Comuns

1. **Imports Circulares**: Mover imports para dentro de funcoes ou usar TYPE_CHECKING
2. **Session Scope**: Cada request tem sua propria sessao
3. **RLS Context**: Se nao setar usuario, queries falham silenciosamente
4. **Pydantic v2**: Usar `model_dump()` ao inves de `dict()`
