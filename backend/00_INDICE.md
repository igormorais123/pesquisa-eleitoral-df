# INDICE - /backend

## Estrutura Principal

backend/
├── app/
│   ├── main.py              # Entry point FastAPI
│   ├── core/                # Config e seguranca
│   ├── api/rotas/           # Endpoints REST
│   ├── servicos/            # Business logic
│   ├── esquemas/            # Pydantic models
│   ├── modelos/             # SQLAlchemy ORM
│   ├── db/                  # Database session
│   └── parlamentares/       # Modulo parlamentares
├── requirements.txt         # Dependencias Python
└── Dockerfile               # Container config

## Arquivos-Chave

### main.py
- Configura FastAPI
- Registra routers
- Define lifespan (startup/shutdown)

### core/config.py
- Carrega variaveis de ambiente
- Define Settings class

### core/seguranca.py
- JWT token creation/verification
- Password hashing (bcrypt)

## Endpoints (api/rotas/)

| Arquivo | Endpoints |
|---------|-----------|
| eleitores.py | /eleitores CRUD + filtros |
| entrevistas.py | /entrevistas CRUD + execucao |
| candidatos.py | /candidatos CRUD |
| pesquisas.py | /pesquisas eleitorais |
| resultados.py | /resultados agregados |
| mensagens.py | Chat inteligente |
| autenticacao.py | /auth login/register |

## Servicos (servicos/)

| Arquivo | Funcao |
|---------|--------|
| claude_servico.py | Integracao Claude API |
| entrevista_servico.py | Execucao de entrevistas |
| eleitor_servico.py | Operacoes com eleitores |
| resultado_servico.py | Calculos estatisticos |
| memoria_servico.py | Persistencia memorias |

## Esquemas (esquemas/)

Pydantic models para validacao:
- eleitor.py: EleitorCreate, EleitorResponse
- entrevista.py: EntrevistaCreate, StatusEntrevista
- candidato.py: CandidatoCreate, CandidatoResponse
- usuario.py: UsuarioCreate, Token
