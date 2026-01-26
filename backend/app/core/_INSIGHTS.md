# _INSIGHTS.md - Backend Core

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

| Arquivo | Linha | Problema | Solucao |
|---------|-------|----------|---------|
| `database.py` | 166 | `datetime` tipo None | Usar `Optional[datetime]` ou inicializar |
| `database.py` | 234 | `checkedout` desconhecido | Atributo interno do pool, ignorar |
| `rls_middleware.py` | 223-225 | Atributos None | Adicionar verificacao `if state:` |

## Decisoes Arquiteturais

### Configuracao via Pydantic Settings
- `config.py` usa `pydantic-settings`
- Variaveis carregadas de `.env`
- Validacao automatica de tipos

### Database Pool
- Pool de conexoes com SQLAlchemy
- Configuracoes de tamanho em `config.py`
- Async com asyncpg

### RLS (Row Level Security)
- Middleware seta contexto antes de cada request
- `app.current_user_id` no PostgreSQL
- Politicas definidas no banco

## Padroes do Codigo

```python
# Config sempre via Settings
from app.core.config import settings

# Nao hardcodar valores
url = settings.DATABASE_URL  # Correto
url = "postgresql://..."      # Errado
```

## Armadilhas Comuns

1. **Settings nao carregadas**: Garantir que `.env` existe
2. **Pool esgotado**: Verificar `pool_size` e `max_overflow`
3. **RLS sem usuario**: Request falha silenciosamente
