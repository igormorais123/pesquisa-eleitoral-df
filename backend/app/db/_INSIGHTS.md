# _INSIGHTS.md - Backend DB

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

| Arquivo | Linha | Problema | Solucao |
|---------|-------|----------|---------|
| `session.py` | 115 | `execute()` com string literal | Usar `text()` wrapper |

## Decisoes Arquiteturais

### Session Scope
- Uma sessao por request
- Dependency injection via `get_db()`
- Commit/rollback automatico

### Async Sessions
- SQLAlchemy 2.0 async
- Usar `async with` para transacoes
- `await session.commit()` explicito

## Padroes do Codigo

```python
# Dependency correto
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

# Uso em rotas
async def rota(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Model))
```

## Armadilhas Comuns

1. **Session fechada**: Nao usar session fora do contexto
2. **Lazy loading**: Usar `selectinload()` para relacoes
3. **String literal**: Sempre usar `text()` para SQL raw
