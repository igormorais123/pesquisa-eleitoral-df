# _INSIGHTS.md - Backend API Rotas

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

| Arquivo | Linha | Problema | Solucao |
|---------|-------|----------|---------|
| `autenticacao.py` | 312 | `usuario_id` pode ser None | Adicionar `if not usuario_id: raise HTTPException(401)` |
| `eleitores.py` | 236 | `exportar_csv` nao existe | Implementar em `servicos/eleitor_servico.py` |

## Decisoes Arquiteturais

### Prefixo /api/v1
- Todas as rotas sob `/api/v1`
- Versionamento na URL
- Facilita migracao futura

### Dependency Injection
- `get_db()` para sessao
- `get_current_user()` para autenticacao
- Composicao de dependencias

### Respostas Padronizadas
- Sempre retornar schemas Pydantic
- Erros com HTTPException
- Status codes corretos

## Padroes do Codigo

```python
router = APIRouter(prefix="/recurso", tags=["recurso"])

@router.get("/", response_model=list[RecursoResponse])
async def listar(
    db: AsyncSession = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    # ...
```

## Armadilhas Comuns

1. **Esquecer Depends**: Rotas protegidas DEVEM ter `get_current_user`
2. **response_model**: Sempre definir para documentacao
3. **Status codes**: Usar 201 para criacao, 204 para delete
