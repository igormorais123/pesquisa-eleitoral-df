# FastAPI - Melhores Práticas INTEIA

## Estrutura de Projeto

```
backend/app/
├── main.py              # Entry point FastAPI
├── core/
│   ├── config.py        # Pydantic Settings
│   └── seguranca.py     # JWT + bcrypt
├── api/
│   └── rotas/           # Endpoints organizados por domínio
├── esquemas/            # Pydantic models (request/response)
├── modelos/             # SQLAlchemy ORM models
└── servicos/            # Business logic layer
```

## Padrões de Endpoint

### Nomenclatura em Português
```python
# ✅ Correto
@router.get("/eleitores")
@router.post("/entrevistas/{id}/executar")
@router.get("/resultados/estatisticas")

# ❌ Evitar
@router.get("/voters")
@router.post("/interviews/{id}/run")
```

### Response Models
```python
from pydantic import BaseModel
from typing import Optional

class EleitorResponse(BaseModel):
    id: int
    nome: str
    regiao_administrativa: str
    cluster_socioeconomico: str

    model_config = ConfigDict(from_attributes=True)
```

### Error Handling
```python
from fastapi import HTTPException

@router.get("/eleitores/{id}")
async def get_eleitor(id: int):
    eleitor = await servico.buscar_eleitor(id)
    if not eleitor:
        raise HTTPException(
            status_code=404,
            detail=f"Eleitor {id} não encontrado"
        )
    return eleitor
```

## Integração Claude API

```python
# backend/app/servicos/claude_servico.py

import anthropic
from app.core.config import settings

client = anthropic.Anthropic(api_key=settings.CLAUDE_API_KEY)

async def executar_entrevista(eleitor: dict, pergunta: str) -> str:
    """Executa entrevista com eleitor sintético via Claude."""

    prompt = construir_prompt_eleitor(eleitor, pergunta)

    response = client.messages.create(
        model="claude-sonnet-4-20250514",  # Padrão para entrevistas
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text
```

## Dependency Injection

```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

@router.get("/eleitores")
async def listar_eleitores(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    return await servico.listar_eleitores(db, skip, limit)
```

## Validação com Pydantic v2

```python
from pydantic import BaseModel, Field, field_validator

class CriarEntrevistaRequest(BaseModel):
    eleitor_id: int = Field(..., gt=0)
    pergunta: str = Field(..., min_length=10, max_length=500)

    @field_validator('pergunta')
    @classmethod
    def pergunta_deve_terminar_interrogacao(cls, v):
        if not v.strip().endswith('?'):
            raise ValueError('Pergunta deve terminar com ?')
        return v
```

## CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://inteia.com.br"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Logging Estruturado

```python
import structlog

logger = structlog.get_logger()

@router.post("/entrevistas")
async def criar_entrevista(request: CriarEntrevistaRequest):
    logger.info(
        "criando_entrevista",
        eleitor_id=request.eleitor_id,
        pergunta_length=len(request.pergunta)
    )
    # ...
```

## Testes

```python
# tests/test_eleitores.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_listar_eleitores(client: AsyncClient):
    response = await client.get("/api/v1/eleitores")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_eleitor_nao_encontrado(client: AsyncClient):
    response = await client.get("/api/v1/eleitores/99999")
    assert response.status_code == 404
```

## Status Codes Padrão

| Operação | Sucesso | Erro |
|----------|---------|------|
| GET lista | 200 | - |
| GET item | 200 | 404 |
| POST criar | 201 | 422 |
| PUT atualizar | 200 | 404, 422 |
| DELETE | 204 | 404 |
