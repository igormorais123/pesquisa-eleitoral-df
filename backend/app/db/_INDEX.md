# DB - Conexao e Modelos do Banco

> **GPS IA**: Sessao async PostgreSQL e modelos de pesquisa persistidos

## Arquivos

| Arquivo | Funcao | Funcoes Principais |
|---------|--------|-------------------|
| [session.py](session.py) | Conexao async PostgreSQL | `get_db()`, `get_db_optional()`, `get_db_context()`, `AsyncSessionLocal`, `engine` |
| [base.py](base.py) | Classe base SQLAlchemy | `Base` (DeclarativeBase), `to_dict()` |

## Subpasta: modelos/

| Arquivo | Funcao | Classes |
|---------|--------|---------|
| [modelos/pesquisa.py](modelos/pesquisa.py) | Modelos de pesquisa eleitoral | `Pesquisa`, `PerguntaPesquisa`, `RespostaPesquisa`, `AnalisePesquisa`, `MetricasGlobais` |

## Uso de Sessao

```python
# Em rotas FastAPI (dependency injection)
@router.get("/items")
async def get_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Model))

# Fora de rotas (context manager)
async with get_db_context() as db:
    result = await db.execute(select(Model))

# Quando banco pode nao estar disponivel
async def login(db: AsyncSession | None = Depends(get_db_optional)):
    if db is None:
        # fallback para usuario de teste
```

## Modelo Pesquisa - Campos Importantes

- `status`: rascunho, executando, pausada, concluida, erro
- `tipo`: quantitativa, qualitativa, mista
- `eleitores_ids`: JSON array com IDs selecionados
- `custo_real`, `tokens_entrada_total`, `tokens_saida_total`

## Modelo RespostaPesquisa - Campos Importantes

- `eleitor_perfil`: JSON snapshot do eleitor no momento
- `fluxo_cognitivo`: Chain of Thought de 4 etapas
- `sentimento`, `intensidade_sentimento`
- `modelo_usado`, `tokens_entrada`, `tokens_saida`

## Relacionamentos

```
Pesquisa 1--N PerguntaPesquisa
Pesquisa 1--N RespostaPesquisa
Pesquisa 1--N AnalisePesquisa
PerguntaPesquisa 1--N RespostaPesquisa
```
