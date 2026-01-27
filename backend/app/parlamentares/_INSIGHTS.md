# _INSIGHTS.md - Backend Parlamentares

**Ultima atualizacao**: Janeiro 2026

---

## Erros LSP Conhecidos

Nenhum erro critico nesta pasta.

## Decisoes Arquiteturais

### Modulo Separado
- Parlamentares sao um dominio isolado
- Dados vem de APIs externas (Camara, Senado)
- Cache local em JSON

### Dados Enriquecidos
- Informacoes basicas das APIs oficiais
- Dados adicionais de votacoes
- Historico de mandatos

## Padroes do Codigo

```python
# Estrutura do modulo
parlamentares/
├── __init__.py
├── modelos.py      # Modelo Parlamentar
├── esquemas.py     # Schemas Pydantic
├── servicos.py     # Logica de negocio
└── rotas.py        # Endpoints
```

## Armadilhas Comuns

1. **APIs externas**: Podem estar fora do ar
2. **Cache desatualizado**: Verificar data de atualizacao
3. **Dados inconsistentes**: APIs podem ter formatos diferentes
