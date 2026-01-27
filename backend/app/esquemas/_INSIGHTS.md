# _INSIGHTS.md - Backend Esquemas

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

Nenhum erro critico nesta pasta.

## Decisoes Arquiteturais

### Pydantic v2
- Usar `model_dump()` ao inves de `dict()`
- `ConfigDict` ao inves de `class Config`
- Validadores com `@field_validator`

### Separacao de Schemas
- `*Create` - para criacao (sem id)
- `*Update` - para atualizacao (campos opcionais)
- `*Response` - para retorno (com id, timestamps)
- `*InDB` - representacao do banco

## Padroes do Codigo

```python
from pydantic import BaseModel, ConfigDict

class EleitorBase(BaseModel):
    nome: str
    idade: int

class EleitorCreate(EleitorBase):
    pass

class EleitorResponse(EleitorBase):
    id: str
    model_config = ConfigDict(from_attributes=True)
```

## Armadilhas Comuns

1. **from_attributes**: Necessario para converter ORM -> Pydantic
2. **Optional vs None**: Use `Optional[T]` com default `None`
3. **Validacao**: `@field_validator` roda ANTES de atribuir
