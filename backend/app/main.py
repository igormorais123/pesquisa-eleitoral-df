"""
Sistema de Pesquisa Eleitoral DF 2026
Backend FastAPI

Autor: Professor Igor
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

from app.api.rotas import (
    analytics,
    autenticacao,
    candidatos,
    cenarios_eleitorais,
    dados_usuarios,
    eleitores,
    entrevistas,
    geracao,
    memorias,
    mensagens,
    pesquisas,
    resultados,
    rls,
    sessoes,
    templates,
    usuarios,
    pesquisas_parlamentares,
    pesquisas_podc,
)
from app.parlamentares.routes import router as parlamentares_router
from app.core.config import configuracoes, validar_configuracoes
from app.db.base import Base
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia ciclo de vida da aplicação"""
    # Startup
    logger.info("Iniciando Sistema de Pesquisa Eleitoral DF 2026...")
    logger.info(f"Ambiente: {configuracoes.AMBIENTE}")
    logger.info(f"Frontend URL: {configuracoes.FRONTEND_URL}")

    # Validar configuracoes criticas (falha em producao se inseguras)
    validar_configuracoes()

    # Inicializar banco de dados (criar tabelas se não existirem)
    try:
        # Importar modelos para registrar no metadata
        from app.modelos.usuario import Usuario  # noqa: F401
        from app.modelos.eleitor import Eleitor  # noqa: F401
        from app.modelos.candidato import Candidato  # noqa: F401
        from app.modelos.cenario_eleitoral import CenarioEleitoral  # noqa: F401
        from app.modelos.pesquisa_podc import (
            PesquisaPODC,
            RespostaPODC,
            EstatisticasPODC,
        )  # noqa: F401
        from app.modelos.sessao_entrevista import SessaoEntrevista  # noqa: F401
        from app.db.modelos.pesquisa import (
            Pesquisa,
            PerguntaPesquisa,
            RespostaPesquisa,
            MetricasGlobais,
        )  # noqa: F401

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Banco de dados inicializado com sucesso")
        logger.info("Tabela 'eleitores' disponível")
        logger.info(
            "Tabelas 'pesquisas_podc', 'respostas_podc', 'estatisticas_podc' disponíveis"
        )
    except Exception as e:
        logger.warning(f"Não foi possível conectar ao banco: {e}")
        logger.warning("Sistema funcionará com autenticação de teste apenas")

    yield

    # Shutdown
    logger.info("Encerrando aplicação...")


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
Gerenciamento dos 1000+ agentes sintéticos (eleitores virtuais).

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
        "name": "Pesquisas",
        "description": """
Gerenciamento de pesquisas eleitorais persistentes.

**Funcionalidades:**
- CRUD completo de pesquisas
- Controle de execução (iniciar, pausar, retomar, finalizar)
- Gerenciamento de perguntas e respostas
- Estatísticas globais

**Fluxo de pesquisa:**
1. Criar pesquisa com título, descrição e perguntas
2. Adicionar eleitores à pesquisa
3. Iniciar execução
4. Monitorar progresso
5. Visualizar resultados

**Status disponíveis:**
- `rascunho`: Pesquisa em criação
- `executando`: Em execução
- `pausada`: Execução pausada
- `concluida`: Finalizada com sucesso
- `erro`: Finalizada com erro
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
    {
        "name": "Usuários",
        "description": """
Gerenciamento de usuários do sistema.

**Papéis disponíveis:**
- `admin`: Acesso total ao sistema
- `pesquisador`: Pode criar e executar pesquisas
- `visualizador`: Apenas visualização de resultados

**Funcionalidades:**
- CRUD completo de usuários (admin)
- Alterar senha própria
- Atualizar perfil próprio
        """,
    },
    {
        "name": "Dados Usuários Google",
        "description": """
Acesso aos dados coletados de usuários que logaram via Google.

**Dados disponíveis:**
- Informações básicas (nome, email, foto)
- Dados demográficos (idade, gênero, aniversário)
- Contatos (telefones, endereços)
- Profissional (ocupações, organizações)
- Interesses e habilidades

**Uso:** Para criar eleitores digitais sintéticos baseados em dados reais.
        """,
    },
    {
        "name": "Parlamentares",
        "description": """
Gerenciamento de parlamentares do Distrito Federal.

**Casas legislativas:**
- Câmara Federal (deputados federais)
- Senado (senadores)
- CLDF (deputados distritais)

**Arquitetura de dados (camadas de verdade):**
- **Fatos**: Dados verificáveis de fontes oficiais
- **Derivados**: Métricas calculadas automaticamente
- **Hipóteses**: Inferências com nível de confiança

**Funcionalidades:**
- Listar e filtrar parlamentares
- Obter perfil completo com todas as camadas
- Adaptar para motor de entrevista
- Estatísticas e contagem por casa

**Fontes de dados:**
- API Dados Abertos da Câmara
- API Dados Abertos do Senado
- Portal da CLDF
        """,
    },
    {
        "name": "Pesquisas Parlamentares",
        "description": """
Pesquisas de opinião com parlamentares como sujeitos de pesquisa.

**Funcionalidades:**
- Criar pesquisas selecionando parlamentares por casa legislativa
- Executar pesquisas com simulação de respostas via IA
- Monitorar progresso em tempo real
- Obter respostas agrupadas por parlamentar ou por pergunta

**Fluxo de pesquisa:**
1. Criar pesquisa com perguntas e parlamentares
2. Estimar custo (opcional)
3. Iniciar execução
4. Monitorar progresso
5. Obter respostas ao final

**Prompts especializados:**
Os parlamentares respondem usando prompts específicos que consideram:
- Cargo e casa legislativa
- Histórico de votações
- Posicionamento partidário
- Temas de atuação
- Base eleitoral
        """,
    },
    {
        "name": "Candidatos",
        "description": """
Gerenciamento de candidatos eleitorais do DF 2026.

**Funcionalidades:**
- Cadastro completo de candidatos (nome, partido, cargo, foto, biografia)
- Filtros por cargo, partido, orientação política
- Estatísticas e métricas de candidatura
- Suporte a cenários eleitorais (1º e 2º turno)

**Cargos disponíveis:**
- Governador / Vice-Governador
- Senador
- Deputado Federal
- Deputado Distrital

**Dados incluídos:**
- Informações pessoais e profissionais
- Propostas e áreas de foco
- Histórico político e eleições anteriores
- Redes sociais e site de campanha
- Métricas de rejeição e conhecimento
        """,
    },
    {
        "name": "Cenários Eleitorais",
        "description": """
Simulação de cenários eleitorais para eleições do DF 2026.

**Funcionalidades principais:**
- Criar cenários de 1º e 2º turno
- Simular votação entre candidatos selecionados
- Análise de rejeição por candidato
- Comparação entre cenários

**Algoritmo de simulação:**
- Considera orientação política eleitor x candidato
- Analisa cluster socioeconômico
- Avalia posição Bolsonaro/Lula
- Pondera rejeição e conhecimento do candidato

**Métricas geradas:**
- Percentual de votos por candidato
- Votos válidos e percentuais
- Indecisos e brancos/nulos
- Margem de erro estatística
- Previsão de 2º turno
        """,
    },
    {
        "name": "Templates de Pesquisa",
        "description": """
Templates predefinidos para pesquisas eleitorais.

**Categorias de templates:**
- **Intenção de Voto**: Perguntas espontâneas e estimuladas
- **Rejeição**: Perguntas sobre rejeição a candidatos
- **Avaliação de Governo**: Avaliação do governo atual
- **Imagem de Candidato**: Conhecimento e imagem dos candidatos
- **Opinião Pública**: Temas e problemas públicos
- **Comportamento Eleitoral**: Histórico político do eleitor
- **Dados Demográficos**: Perfil sociodemográfico
- **Controle de Qualidade**: Verificação e encerramento

**Tipos de eleição disponíveis:**
- Presidente, Governador, Senador
- Deputado Federal, Deputado Distrital
- Prefeito, Vereador

**Funcionalidades:**
- Listar e filtrar templates por categoria/tipo
- Obter template completo com perguntas
- Aplicar template a uma pesquisa
- Estatísticas de uso
        """,
    },
    {
        "name": "RLS - Segurança",
        "description": """
Administração do Row Level Security (RLS) do PostgreSQL.

**O que é RLS?**
Row Level Security é uma camada de segurança a nível de banco de dados
que garante que usuários só vejam os dados que têm permissão.

**Funcionalidades:**
- Verificar status do RLS em todas as tabelas
- Listar políticas de segurança ativas
- Testar isolamento de dados
- Verificar contexto da sessão atual

**Tabelas protegidas:**
- `usuarios`: Cada usuário vê apenas seu próprio registro
- `memorias`: Usuário vê apenas suas memórias
- `uso_api`: Usuário vê apenas seu uso de API
- `pesquisas`, `respostas`, `analises`: Dados compartilhados (usuários autenticados)

**Requer:** Administrador
        """,
    },
    {
        "name": "Pesquisas PODC",
        "description": """
Pesquisas sobre distribuição de tempo nas funções administrativas (PODC - Fayol).

**Metodologia:**
Baseada na teoria clássica de Fayol, mede como gestores distribuem tempo entre:
- **Planejar (P)**: Definição de objetivos, estratégias e planos
- **Organizar (O)**: Estruturação de recursos, processos e sistemas
- **Dirigir (D)**: Liderança, coordenação e comunicação
- **Controlar (C)**: Monitoramento, avaliação e correção

**Funcionalidades:**
- Criar pesquisas com questionário PODC completo
- Executar entrevistas com gestores sintéticos via IA
- Calcular Índice de Autonomia Decisória (IAD)
- Comparar setores (público vs privado) e níveis hierárquicos
- Exportar dados para análise estatística

**Índice de Autonomia Decisória (IAD):**
- IAD = (P+O)/(D+C)
- IAD > 1: Perfil Proativo (formulador)
- IAD < 1: Perfil Reativo (executor)
        """,
    },
    {
        "name": "Mensagens",
        "description": """
Gerador de mensagens de persuasão otimizadas para campanhas eleitorais.

**Funcionalidades:**
- Gerar mensagens personalizadas para diferentes perfis de eleitores
- 5 tipos de gatilhos psicológicos (medo, esperança, econômico, tribal, identitário)
- Análise automática do perfil agregado do público-alvo
- Estimativas de eficácia e risco de backfire
- Sugestões de canal ideal (WhatsApp, TV, panfleto, etc)

**Como usar:**
1. Defina o objetivo (ex: "convencer indecisos a votar em X")
2. Selecione o público-alvo por filtros ou IDs
3. Escolha os gatilhos psicológicos desejados
4. Receba mensagens otimizadas com métricas

**Gatilhos disponíveis:**
- `medo`: Ativa ansiedades (risco médio, eficácia alta)
- `esperanca`: Ativa aspirações (risco baixo, eficácia média)
- `economico`: Foca no bolso (risco baixo, eficácia alta)
- `tribal`: Pertencimento (risco alto, eficácia média)
- `identitario`: Valores/religião (risco médio, eficácia alta)
        """,
    },
]

# Criar aplicação FastAPI
app = FastAPI(
    title="API Pesquisa Eleitoral DF 2026",
    redirect_slashes=True,  # Redireciona automaticamente com/sem barra final
    description="""
## Sistema de Simulação de Pesquisa Eleitoral

Plataforma que simula pesquisas de opinião usando **1000+ agentes de IA** que representam
eleitores realistas do Distrito Federal para as eleições de 2026.

### Principais Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Eleitores** | 1000+ perfis com 60+ atributos cada |
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

# Configurar CORS
# Origens permitidas
origens_permitidas = [
    configuracoes.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
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
    pesquisas.router,
    prefix="/api/v1/pesquisas",
    tags=["Pesquisas"],
)

app.include_router(
    geracao.router,
    prefix="/api/v1/geracao",
    tags=["Geração"],
)

app.include_router(
    usuarios.router,
    prefix="/api/v1/usuarios",
    tags=["Usuários"],
)

app.include_router(
    dados_usuarios.router,
    prefix="/api/v1/dados-usuarios",
    tags=["Dados Usuários Google"],
)

app.include_router(
    parlamentares_router,
    prefix="/api/v1/parlamentares",
    tags=["Parlamentares"],
)

app.include_router(
    candidatos.router,
    prefix="/api/v1/candidatos",
    tags=["Candidatos"],
)

app.include_router(
    cenarios_eleitorais.router,
    prefix="/api/v1/cenarios",
    tags=["Cenários Eleitorais"],
)

app.include_router(
    pesquisas_parlamentares.router,
    prefix="/api/v1/pesquisas-parlamentares",
    tags=["Pesquisas Parlamentares"],
)

app.include_router(
    templates.router,
    prefix="/api/v1/templates",
    tags=["Templates de Pesquisa"],
)

app.include_router(
    pesquisas_podc.router,
    prefix="/api/v1/pesquisas-podc",
    tags=["Pesquisas PODC"],
)

app.include_router(
    mensagens.router,
    prefix="/api/v1/mensagens",
    tags=["Mensagens"],
)

app.include_router(
    rls.router,
    prefix="/api/v1/admin",
    tags=["RLS - Segurança"],
)

app.include_router(
    analytics.router,
    prefix="/api/v1/analytics",
    tags=["Analytics"],
)

app.include_router(
    sessoes.router,
    prefix="/api/v1/sessoes",
    tags=["Sessões de Entrevista"],
)
