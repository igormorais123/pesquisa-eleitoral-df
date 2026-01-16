"""
Sistema de Pesquisa Eleitoral DF 2026
Backend FastAPI

Autor: Professor Igor
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.rotas import (
    analytics,
    autenticacao,
    eleitores,
    entrevistas,
    geracao,
    historico,
    memorias,
    pesquisas,
    resultados,
)
from app.core.config import configuracoes
from app.db.session import engine
from app.db.base import Base

# Configurar rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia ciclo de vida da aplicação"""
    # Startup
    print("🚀 Iniciando Sistema de Pesquisa Eleitoral DF 2026...")
    print(f"📊 Ambiente: {configuracoes.AMBIENTE}")
    print(f"🔗 Frontend URL: {configuracoes.FRONTEND_URL}")

    # Criar tabelas do banco de dados (se não existirem)
    try:
        async with engine.begin() as conn:
            # Importar modelos para registrar nas metadata
            from app.db.modelos import pesquisa  # noqa
            await conn.run_sync(Base.metadata.create_all)
            print("✅ Banco de dados inicializado")
    except Exception as e:
        print(f"⚠️ Aviso: Não foi possível conectar ao banco de dados: {e}")
        print("   O sistema funcionará sem persistência no PostgreSQL")

    yield

    # Shutdown
    print("👋 Encerrando aplicação...")
    await engine.dispose()


# Metadata para tags do Swagger
tags_metadata = [
    {
        "name": "Autenticação",
        "description": """
Endpoints para autenticação e gerenciamento de sessão.

**Fluxo de autenticação:**
1. POST `/auth/login` com usuário e senha
2. Receba o `access_token` JWT
3. Inclua o token em todas as requisições: `Authorization: Bearer <token>`

**Credenciais de demonstração:** `professorigor` / `professorigor`
        """,
    },
    {
        "name": "Eleitores",
        "description": """
Gerenciamento dos 400+ agentes sintéticos (eleitores virtuais).

**Funcionalidades:**
- Listar com 20+ filtros simultâneos
- Obter perfil completo (60+ atributos)
- Estatísticas de distribuição
- Criar, atualizar e deletar eleitores
- Importar de JSON

**Filtros disponíveis:**
- Demográficos: idade, gênero, cor/raça
- Geográficos: região administrativa, cluster
- Socioeconômicos: escolaridade, profissão, renda
- Políticos: orientação, posição Bolsonaro, interesse
- Comportamentais: estilo de decisão, tolerância
        """,
    },
    {
        "name": "Entrevistas",
        "description": """
Criação e execução de pesquisas eleitorais.

**Fluxo de pesquisa:**
1. Criar entrevista com perguntas e eleitores
2. Estimar custo (opcional)
3. Iniciar execução
4. Monitorar progresso em tempo real
5. Obter respostas ao final

**Tipos de pergunta:**
- `escala`: 0-10 com rótulos
- `multipla_escolha`: Selecionar uma opção
- `sim_nao`: Resposta binária
- `aberta`: Texto livre
- `ranking`: Ordenar opções

**Controles de execução:**
- Limite de custo em R$
- Pausar/retomar/cancelar
- Batch size e delay configuráveis
        """,
    },
    {
        "name": "Resultados",
        "description": """
Análises estatísticas e qualitativas das pesquisas.

**Métricas disponíveis:**
- Estatísticas básicas: média, mediana, desvio padrão
- Correlações entre variáveis
- Análise de sentimentos (positivo/negativo/neutro)
- Mapa de calor emocional
- Votos silenciosos identificados
- Pontos de ruptura por segmento
- Insights gerados por IA

**Formatos de exportação:**
- JSON (API)
- Excel, PDF, CSV (via frontend)
        """,
    },
    {
        "name": "Geração",
        "description": """
Criação de novos agentes sintéticos usando IA.

**Parâmetros de geração:**
- Quantidade de eleitores
- Cluster socioeconômico alvo
- Região administrativa foco

Os novos eleitores são gerados com coerência interna:
valores, medos e comportamentos compatíveis com o perfil.
        """,
    },
    {
        "name": "Memórias",
        "description": """
Gerenciamento de memórias dos agentes.

As memórias armazenam interações anteriores,
permitindo que agentes mantenham consistência
entre diferentes entrevistas.
        """,
    },
]

# Criar aplicação FastAPI
app = FastAPI(
    title="API Pesquisa Eleitoral DF 2026",
    description="""
## Sistema de Simulação de Pesquisa Eleitoral

Plataforma que simula pesquisas de opinião usando **400+ agentes de IA** que representam
eleitores realistas do Distrito Federal para as eleições de 2026.

### Principais Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Eleitores** | 400+ perfis com 60+ atributos cada |
| **Entrevistas** | Criar e executar pesquisas |
| **Resultados** | Estatísticas, correlações, insights |
| **Geração** | Criar novos eleitores com IA |

### Sistema Cognitivo

Os agentes respondem usando um processo de **4 etapas cognitivas**:
1. **Filtro de Atenção** - O eleitor prestaria atenção?
2. **Viés de Confirmação** - Confirma ou ameaça suas crenças?
3. **Reação Emocional** - Como se sente a respeito?
4. **Decisão** - Qual é a resposta genuína?

### Modelos de IA Utilizados

- **Claude Sonnet 4.5**: Entrevistas padrão (custo-benefício)
- **Claude Opus 4.5**: Análises complexas e insights

### Documentação Completa

- [Guia de Primeiros Passos](/docs/guia-usuario/01-primeiros-passos.md)
- [Referência da API](/docs/api/README.md)
- [Sistema Cognitivo](/docs/cognicao/4-etapas-cognitivas.md)

### Autenticação

Todas as rotas (exceto login) requerem token JWT:
```
Authorization: Bearer <seu_token>
```

**Credenciais de demonstração:** `professorigor` / `professorigor`
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    openapi_tags=tags_metadata,
    contact={
        "name": "Professor Igor",
        "url": "https://github.com/igormorais123/pesquisa-eleitoral-df",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Configurar rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configurar CORS
# Origens permitidas
origens_permitidas = [
    configuracoes.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://pesquisa-eleitoral-df.vercel.app",
    "https://pesquisa-eleitoral-df-git-main-igormorais123s-projects.vercel.app",
    "https://pesquisa-eleitoral-df-igormorais123s-projects.vercel.app",
]

# Adicionar origens extras do ambiente se existirem
if configuracoes.FRONTEND_URL and configuracoes.FRONTEND_URL not in origens_permitidas:
    origens_permitidas.append(configuracoes.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origens_permitidas,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)


# Rota raiz
@app.get("/")
async def raiz():
    """Rota principal da API"""
    return {
        "nome": "API Pesquisa Eleitoral DF 2026",
        "versao": "1.0.0",
        "status": "online",
        "documentacao": "/docs",
    }


# Rota de health check
@app.get("/health")
async def health_check():
    """Verificação de saúde da API"""
    return {"status": "healthy"}


# Registrar rotas
app.include_router(
    autenticacao.router,
    prefix="/api/v1/auth",
    tags=["Autenticação"],
)

app.include_router(
    eleitores.router,
    prefix="/api/v1/eleitores",
    tags=["Eleitores"],
)

app.include_router(
    memorias.router,
    prefix="/api/v1/memorias",
    tags=["Memórias"],
)

app.include_router(
    entrevistas.router,
    prefix="/api/v1/entrevistas",
    tags=["Entrevistas"],
)

app.include_router(
    resultados.router,
    prefix="/api/v1/resultados",
    tags=["Resultados"],
)

app.include_router(
    geracao.router,
    prefix="/api/v1/geracao",
    tags=["Geração"],
)

# Rotas de persistência e análise
app.include_router(
    pesquisas.router,
    prefix="/api/v1/pesquisas",
    tags=["Pesquisas Persistidas"],
)

app.include_router(
    analytics.router,
    prefix="/api/v1/analytics",
    tags=["Analytics e Análise Global"],
)

app.include_router(
    historico.router,
    prefix="/api/v1/historico",
    tags=["Histórico"],
)
