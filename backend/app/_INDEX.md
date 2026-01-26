# Backend App - FastAPI Application

> **GPS IA**: Aplicacao principal do backend

## Estrutura

```
app/
├── main.py              <- Entry point FastAPI
├── core/                <- [_INDEX.md] Config, seguranca, database
├── db/                  <- [_INDEX.md] Sessao e modelos DB
├── esquemas/            <- [_INDEX.md] Schemas Pydantic (validacao)
├── modelos/             <- [_INDEX.md] Modelos SQLAlchemy (ORM)
├── servicos/            <- [_INDEX.md] Logica de negocio
├── api/rotas/           <- [_INDEX.md] Endpoints REST
├── parlamentares/       <- [_INDEX.md] Modulo de parlamentares
└── dados/               <- Arquivos JSON de dados
```

## Navegacao Rapida

| Se precisa de... | Va para... |
|------------------|------------|
| Configuracoes (.env) | [core/_INDEX.md](core/_INDEX.md) |
| Autenticacao JWT | [core/_INDEX.md](core/_INDEX.md) -> seguranca.py |
| Conexao PostgreSQL | [core/_INDEX.md](core/_INDEX.md) -> database.py |
| Validacao de requests | [esquemas/_INDEX.md](esquemas/_INDEX.md) |
| Tabelas do banco | [modelos/_INDEX.md](modelos/_INDEX.md) |
| Logica de negocio | [servicos/_INDEX.md](servicos/_INDEX.md) |
| Endpoints da API | [api/rotas/_INDEX.md](api/rotas/_INDEX.md) |
| Integracao Claude | [servicos/_INDEX.md](servicos/_INDEX.md) -> claude_servico.py |
| Parlamentares | [parlamentares/_INDEX.md](parlamentares/_INDEX.md) |

## main.py - Entry Point

```python
# Inicializacao
app = FastAPI(title="Pesquisa Eleitoral DF 2026")

# Routers registrados
/api/v1/auth            <- autenticacao.router
/api/v1/usuarios        <- usuarios.router
/api/v1/eleitores       <- eleitores.router
/api/v1/candidatos      <- candidatos.router
/api/v1/entrevistas     <- entrevistas.router
/api/v1/resultados      <- resultados.router
/api/v1/memorias        <- memorias.router
/api/v1/pesquisas       <- pesquisas.router
/api/v1/parlamentares   <- parlamentares_router
/api/v1/analytics       <- analytics.router
... (ver main.py para lista completa)
```

## Modelos Registrados (para criar tabelas)

- Usuario, Eleitor, Candidato
- CenarioEleitoral, SessaoEntrevista
- PesquisaPODC, RespostaPODC, EstatisticasPODC
- Pesquisa, PerguntaPesquisa, RespostaPesquisa, MetricasGlobais
- Memoria, UsoAPI

## CORS

Configurado para aceitar requests de:
- `FRONTEND_URL` (env)
- localhost:3000 (dev)

## Comandos

```bash
# Iniciar servidor
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Docs interativos
http://localhost:8000/docs  # Swagger UI
http://localhost:8000/redoc # ReDoc
```
