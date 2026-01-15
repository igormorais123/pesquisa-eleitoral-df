"""
Sistema de Pesquisa Eleitoral DF 2026
Backend FastAPI

Autor: Professor Igor
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.rotas import (
    autenticacao,
    eleitores,
    entrevistas,
    geracao,
    memorias,
    resultados,
)
from app.core.config import configuracoes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia ciclo de vida da aplicação"""
    # Startup
    print("🚀 Iniciando Sistema de Pesquisa Eleitoral DF 2026...")
    print(f"📊 Ambiente: {configuracoes.AMBIENTE}")
    print(f"🔗 Frontend URL: {configuracoes.FRONTEND_URL}")

    yield

    # Shutdown
    print("👋 Encerrando aplicação...")


# Criar aplicação FastAPI
app = FastAPI(
    title="API Pesquisa Eleitoral DF 2026",
    description="""
    Sistema de simulação de pesquisa eleitoral com agentes sintéticos
    para as eleições de Governador do Distrito Federal 2026.

    ## Funcionalidades

    * **Eleitores**: Gerenciamento de agentes sintéticos
    * **Entrevistas**: Criação e execução de pesquisas
    * **Resultados**: Análises estatísticas e qualitativas
    * **Geração**: Criação de novos eleitores com IA
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configurar CORS
# Origens permitidas
origens_permitidas = [
    configuracoes.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://pesquisa-eleitoral-df.vercel.app",
    "https://pesquisa-eleitoral-df-git-main-igormorais123s-projects.vercel.app",
]

# Adicionar origens extras do ambiente se existirem
if configuracoes.FRONTEND_URL and configuracoes.FRONTEND_URL not in origens_permitidas:
    origens_permitidas.append(configuracoes.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origens_permitidas,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
