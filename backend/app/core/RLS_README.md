# Row Level Security (RLS) - Documentação

## O que é RLS?

Row Level Security (Segurança a Nível de Linha) é uma feature do PostgreSQL que permite controlar quais linhas de uma tabela cada usuário pode ver ou modificar. Diferente de permissões normais (que controlam acesso a tabelas inteiras), RLS controla acesso a **linhas específicas**.

## Por que usar RLS?

### Sem RLS (vulnerável)
```
┌─────────────────┐
│   Aplicação     │ ─── Controla acesso ───► Banco de Dados
└─────────────────┘                          (todos os dados)
         │
    Se alguém conseguir
    acesso direto ao banco,
    vê TUDO
```

### Com RLS (seguro)
```
┌─────────────────┐
│   Aplicação     │ ─── Passa contexto ───► Banco de Dados
└─────────────────┘                          (filtra por RLS)
         │
    Mesmo com acesso direto,
    só vê dados permitidos
```

## Tabelas Protegidas

| Tabela | Política |
|--------|----------|
| `usuarios` | Usuário vê apenas seu registro; admin vê todos |
| `memorias` | Usuário vê apenas suas memórias |
| `uso_api` | Usuário vê apenas seu uso |
| `pesquisas` | Todos autenticados veem; apenas admin/pesquisador modificam |
| `perguntas_pesquisa` | Todos autenticados veem; apenas admin/pesquisador modificam |
| `respostas` | Todos autenticados veem; apenas admin/pesquisador modificam |
| `analises` | Todos autenticados veem; apenas admin/pesquisador modificam |

## Como Funciona

### 1. Variáveis de Sessão

O RLS usa variáveis de sessão do PostgreSQL para identificar o usuário:

```sql
-- Configuradas automaticamente pelo middleware
SET LOCAL app.current_user_id = '123';
SET LOCAL app.current_user_role = 'pesquisador';
SET LOCAL app.bypass_rls = 'false';
```

### 2. Funções Auxiliares

```sql
-- Retorna o ID do usuário atual
SELECT rls_current_user_id();  -- '123'

-- Verifica se é admin
SELECT rls_is_admin();  -- false

-- Verifica se está autenticado
SELECT rls_is_authenticated();  -- true

-- Verifica se bypass está ativo
SELECT rls_bypass_enabled();  -- false
```

### 3. Políticas

Cada tabela tem políticas que usam essas funções:

```sql
-- Exemplo: usuário só vê suas próprias memórias
CREATE POLICY memorias_own_records ON memorias
    FOR SELECT
    USING (usuario_id::TEXT = rls_current_user_id());
```

## Uso no Código

### Rotas com RLS (recomendado)

```python
from app.api.deps import get_db_rls

@router.get("/memorias")
async def listar_memorias(db: AsyncSession = Depends(get_db_rls)):
    # Usuário só verá suas próprias memórias automaticamente
    result = await db.execute(select(Memoria))
    return result.scalars().all()
```

### Rotas Admin com RLS

```python
from app.api.deps import get_db_admin

@router.get("/admin/usuarios")
async def listar_todos_usuarios(db: AsyncSession = Depends(get_db_admin)):
    # Admin vê todos os usuários
    result = await db.execute(select(Usuario))
    return result.scalars().all()
```

### Operações de Sistema (bypass RLS)

```python
from app.core.rls_middleware import get_service_db

async def job_limpeza():
    # CUIDADO: ignora todas as políticas RLS
    async with get_service_db() as db:
        await db.execute(delete(Memoria).where(...))
```

## Dependências Disponíveis

| Dependência | Descrição | Uso |
|-------------|-----------|-----|
| `get_db_rls` | Sessão com RLS para usuário autenticado | Rotas normais |
| `get_db_rls_optional` | Sessão com RLS para usuário opcional | Rotas públicas |
| `get_db_admin` | Sessão com RLS para admin | Rotas administrativas |
| `get_db_service` | Sessão que ignora RLS | Jobs/scripts internos |

## Aplicar a Migration

```bash
cd backend
alembic upgrade head
```

## Verificar Status

### Via API (requer admin)

```bash
# Status de todas as tabelas
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/admin/rls/status

# Listar políticas
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/admin/rls/policies

# Verificar contexto atual
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/admin/rls/context
```

### Via SQL

```sql
-- Ver status do RLS
SELECT * FROM rls_status;

-- Ver políticas
SELECT * FROM rls_policies;

-- Testar funções
SELECT rls_current_user_id(), rls_is_admin(), rls_bypass_enabled();
```

## Rollback

Se precisar desabilitar o RLS:

```bash
alembic downgrade -1
```

Ou manualmente:

```sql
-- Desabilitar RLS em uma tabela
ALTER TABLE memorias DISABLE ROW LEVEL SECURITY;

-- Remover uma política
DROP POLICY memorias_own_records ON memorias;
```

## Troubleshooting

### "permission denied for table X"

O usuário não tem permissão. Verifique:
1. Se está autenticado (`rls_is_authenticated()`)
2. Se o papel está correto (`rls_current_user_role`)
3. Se a política permite a operação

### Dados não aparecem

O RLS está filtrando. Verifique:
1. O `usuario_id` do registro
2. O `user_id` da sessão (`rls_current_user_id()`)
3. Se ambos são iguais

### Bypass não funciona

Certifique-se de usar `get_service_db()` ou setar `app.bypass_rls = 'true'`.

## Segurança

⚠️ **Nunca exponha `get_db_service` em rotas públicas!**

O bypass deve ser usado apenas para:
- Migrations
- Jobs em background
- Scripts de manutenção
- Testes automatizados
