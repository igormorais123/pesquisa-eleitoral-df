# _INSIGHTS.md - Backend Servicos

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

| Arquivo | Linha | Problema | Solucao |
|---------|-------|----------|---------|
| `eleitor_servico.py` | ~236 | `exportar_csv` nao existe | **Implementar funcao** |

## Decisoes Arquiteturais

### Camada de Servicos
- Logica de negocio isolada das rotas
- Servicos recebem session como parametro
- Nao fazem commit (quem chama decide)

### Integracao Claude
- `claude_servico.py` centraliza chamadas
- Retry automatico em falhas
- Logging de tokens usados

### Servicos vs Repositorios
- Este projeto usa servicos diretos (sem repositorios)
- Servico acessa banco diretamente
- Simplifica para projeto de tamanho medio

## Padroes do Codigo

```python
class EleitorServico:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def listar(self, filtros: dict) -> list[Eleitor]:
        query = select(Eleitor).where(...)
        result = await self.db.execute(query)
        return result.scalars().all()
```

## Armadilhas Comuns

1. **Commit no servico**: NAO fazer commit dentro do servico
2. **Session scope**: Nao guardar session como atributo de classe
3. **Claude timeout**: Configurar timeout adequado (pode demorar)
