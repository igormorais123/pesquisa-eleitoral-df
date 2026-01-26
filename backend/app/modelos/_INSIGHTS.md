# _INSIGHTS.md - Backend Modelos

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

Nenhum erro critico nesta pasta.

## Decisoes Arquiteturais

### SQLAlchemy 2.0
- Usar `Mapped[]` para tipagem
- `mapped_column()` ao inves de `Column()`
- Relacoes com `relationship()` tipadas

### UUIDs como Primary Key
- Todos os modelos usam UUID
- Gerado automaticamente
- Melhor para sistemas distribuidos

### Multi-tenancy
- Campo `usuario_id` em modelos que precisam isolamento
- RLS policies filtram automaticamente

## Padroes do Codigo

```python
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Eleitor(Base):
    __tablename__ = "eleitores"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    nome: Mapped[str] = mapped_column(String(255))
    usuario_id: Mapped[str] = mapped_column(String, index=True)
```

## Armadilhas Comuns

1. **Lazy loading**: Causa N+1 queries, usar `selectinload()`
2. **Detached instance**: Nao usar objeto fora da sessao
3. **Cascade**: Definir explicitamente para deletes
