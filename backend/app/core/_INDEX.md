# Core - Nucleo do Backend

> **GPS IA**: Configuracoes globais, seguranca e banco de dados

## Arquivos

| Arquivo | Funcao | Funcoes Principais |
|---------|--------|-------------------|
| [config.py](config.py) | Configuracoes do sistema via .env | `Configuracoes` (classe), `configuracoes` (instancia global), `validar_configuracoes()` |
| [seguranca.py](seguranca.py) | Autenticacao JWT + hash senhas | `criar_token_acesso()`, `verificar_token()`, `verificar_senha()`, `gerar_hash_senha()`, `autenticar_usuario()` |
| [database.py](database.py) | Conexao PostgreSQL async | `obter_sessao()`, `obter_sessao_contexto()`, `criar_tabelas()`, `health_check()`, `engine`, `SessionLocal` |
| [rls_middleware.py](rls_middleware.py) | Row Level Security PostgreSQL | `RLSContext`, `set_rls_context()`, `get_db_with_rls()`, `get_service_db()`, `verify_rls_context()` |

## Variaveis de Ambiente Importantes

```
CLAUDE_API_KEY      - API Anthropic (NUNCA expor)
SECRET_KEY          - Chave JWT
DATABASE_URL        - PostgreSQL connection string
GOOGLE_CLIENT_ID    - OAuth Google
GOOGLE_CLIENT_SECRET
```

## Fluxo de Autenticacao

1. `autenticar_usuario()` verifica credenciais
2. `criar_token_acesso()` gera JWT
3. `verificar_token()` valida em cada request
4. `DadosToken` contem: usuario_id, nome, papel, email, aprovado

## Conexao Banco

- Engine async com `asyncpg`
- Pool: 5 conexoes + 10 overflow
- SSL automatico para Render/Heroku
- Use `obter_sessao()` como dependency FastAPI
- Use `obter_sessao_contexto()` fora do FastAPI

## RLS (Row Level Security)

- `RLSContext.from_user(user)` - contexto de usuario
- `RLSContext.service_context()` - bypass para scripts/jobs
- Seta variaveis: `app.current_user_id`, `app.current_user_role`
