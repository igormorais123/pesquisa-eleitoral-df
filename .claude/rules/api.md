# Regras de API - Backend FastAPI

> Carregar quando trabalhar com endpoints, rotas ou integrações backend.

## Convenções de Nomenclatura

### Endpoints
```python
# ✅ Correto - português, plural, kebab-case para compostos
@router.get("/eleitores")
@router.post("/entrevistas/{id}/executar")
@router.get("/resultados/por-regiao")

# ❌ Errado - inglês ou singular
@router.get("/voter")
@router.post("/interview/{id}/run")
```

### Funções de Serviço
```python
# ✅ Correto - verbos em português
async def buscar_eleitor(id: int) -> Eleitor
async def criar_entrevista(dados: EntrevistaCreate) -> Entrevista
async def executar_pesquisa(config: PesquisaConfig) -> Resultado

# ❌ Errado
async def get_voter(id: int)
async def create_interview(data: dict)
```

## Padrões de Response

### Status Codes
| Operação | Sucesso | Erro |
|----------|---------|------|
| GET lista | 200 | - |
| GET item | 200 | 404 |
| POST criar | 201 | 422, 409 |
| PUT atualizar | 200 | 404, 422 |
| DELETE | 204 | 404 |

### Formato de Erro
```python
from fastapi import HTTPException

# Sempre incluir detail em português
raise HTTPException(
    status_code=404,
    detail=f"Eleitor com id {id} não encontrado"
)
```

## Pydantic Schemas

### Padrão de Nomenclatura
```python
# Base para campos comuns
class EleitorBase(BaseModel):
    nome: str
    idade: int

# Create para input de criação
class EleitorCreate(EleitorBase):
    pass

# Response para output
class EleitorResponse(EleitorBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

## Dependency Injection

```python
# Sempre usar Depends para DB e Auth
@router.get("/eleitores")
async def listar_eleitores(
    db: AsyncSession = Depends(get_db),
    usuario_atual: Usuario = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    ...
```

## Integração Claude API

```python
# Sempre usar o serviço centralizado
from app.servicos.claude_servico import executar_entrevista

# NUNCA instanciar cliente diretamente na rota
# ❌ Errado
client = anthropic.Anthropic()

# ✅ Correto
resultado = await executar_entrevista(eleitor, pergunta)
```

## Logging

```python
import structlog
logger = structlog.get_logger()

# Sempre logar operações importantes
logger.info(
    "entrevista_executada",
    eleitor_id=eleitor.id,
    duracao_ms=duracao,
    modelo=modelo_usado
)
```

## Validação

```python
from pydantic import Field, field_validator

class PesquisaCreate(BaseModel):
    tamanho_amostra: int = Field(..., ge=100, le=2000)
    cargo: str = Field(..., min_length=3)

    @field_validator('cargo')
    @classmethod
    def validar_cargo(cls, v):
        cargos_validos = ['governador', 'senador', 'deputado']
        if v.lower() not in cargos_validos:
            raise ValueError(f'Cargo deve ser um de: {cargos_validos}')
        return v.lower()
```
