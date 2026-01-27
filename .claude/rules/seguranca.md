# Regras de Segurança

> Carregar para reviews de segurança ou ao implementar autenticação/autorização.

## Autenticação JWT

### Configuração
```python
# Sempre usar variáveis de ambiente
SECRET_KEY = os.getenv("SECRET_KEY")  # Nunca hardcoded
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

### Geração de Token
```python
from datetime import datetime, timedelta
from jose import jwt

def criar_token_acesso(dados: dict) -> str:
    dados_copia = dados.copy()
    expiracao = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    dados_copia.update({"exp": expiracao})
    return jwt.encode(dados_copia, SECRET_KEY, algorithm=ALGORITHM)
```

### Validação de Token
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Usuario:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id: str = payload.get("sub")
        if usuario_id is None:
            raise credentials_exception
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return await buscar_usuario(usuario_id)
```

## Validação de Input

### NUNCA Confiar em Input do Usuário
```python
from pydantic import BaseModel, Field, field_validator
import re

class EleitorCreate(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100)
    idade: int = Field(..., ge=16, le=120)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')

    @field_validator('nome')
    @classmethod
    def sanitizar_nome(cls, v):
        # Remover caracteres perigosos
        return re.sub(r'[<>\"\';&]', '', v)
```

### SQL Injection - Prevenção
```python
# ✅ Correto - Usar ORM ou queries parametrizadas
eleitor = await db.execute(
    select(Eleitor).where(Eleitor.id == eleitor_id)
)

# ❌ NUNCA fazer isso
query = f"SELECT * FROM eleitores WHERE id = {eleitor_id}"
```

### XSS - Prevenção no Frontend
```tsx
// ✅ Correto - React escapa automaticamente
<div>{eleitor.nome}</div>

// ❌ PERIGOSO - dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: eleitor.descricao }} />

// Se necessário HTML, sanitizar primeiro
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

## Variáveis de Ambiente

### Nunca Commitar Secrets
```gitignore
# .gitignore - OBRIGATÓRIO
.env
.env.local
.env.production
*.pem
*.key
credentials.json
```

### Validação de Env Vars
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str
    DATABASE_URL: str
    CLAUDE_API_KEY: str

    class Config:
        env_file = ".env"

# Falha rápida se variável faltando
settings = Settings()  # Raises ValidationError se faltando
```

## CORS

```python
from fastapi.middleware.cors import CORSMiddleware

# Produção: especificar origens exatas
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://inteia.com.br",
        "https://www.inteia.com.br"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# ❌ NUNCA em produção
allow_origins=["*"]
```

## Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/entrevistas/{id}/executar")
@limiter.limit("10/minute")  # Limitar chamadas à API Claude
async def executar_entrevista(id: int):
    ...
```

## Logs Seguros

```python
# ✅ Correto - Não logar dados sensíveis
logger.info("login_sucesso", usuario_id=usuario.id)

# ❌ NUNCA logar
logger.info("login", senha=request.password)
logger.info("pagamento", cartao=numero_cartao)
```

## Checklist de Segurança

- [ ] Secrets em variáveis de ambiente
- [ ] JWT com expiração curta
- [ ] Input validado com Pydantic
- [ ] Queries parametrizadas (ORM)
- [ ] CORS configurado corretamente
- [ ] Rate limiting em endpoints sensíveis
- [ ] Logs sem dados sensíveis
- [ ] HTTPS obrigatório em produção
