# Performance e Scaling

Guia para otimizar e escalar o sistema.

---

## Visão Geral de Performance

### Métricas Atuais (400 eleitores)

| Operação | Tempo Típico | Aceitável |
|----------|--------------|-----------|
| Carregar lista de eleitores | 200-500ms | < 1s |
| Aplicar filtros | 50-150ms | < 300ms |
| Executar 1 pergunta/eleitor | 2-5s | < 10s |
| Gerar insights (100 respostas) | 10-30s | < 60s |
| Exportar Excel | 1-3s | < 5s |

### Gargalos Identificados

1. **API Claude**: Principal limitante (rate limits, latência)
2. **Renderização**: 400+ cards sem virtualização
3. **Banco de Dados**: Queries N+1 em relacionamentos
4. **Memória**: JSON grande em memória

---

## Otimizações Implementadas

### Frontend

#### Virtualização (TanStack Virtual)

O sistema usa virtualização para renderizar apenas itens visíveis:

```tsx
// frontend/src/components/agentes/AgentesList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
  count: eleitores.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 120, // altura estimada do card
  overscan: 5, // itens extras renderizados
});
```

**Impacto**: Renderiza ~20 itens em vez de 400+, economizando 95% de memória DOM.

#### Debounce em Filtros

```tsx
// Evita requisições a cada tecla
const debouncedSearch = useDebouncedCallback(
  (value: string) => setFilters({ ...filters, busca: value }),
  300 // ms
);
```

#### React Query (Cache)

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['eleitores', filters],
  queryFn: () => api.listarEleitores(filters),
  staleTime: 5 * 60 * 1000, // 5 minutos de cache
  cacheTime: 30 * 60 * 1000, // 30 minutos em memória
});
```

### Backend

#### Paginação

```python
# Sempre paginar resultados grandes
@router.get("/eleitores")
async def listar_eleitores(
    pagina: int = 1,
    por_pagina: int = 50,  # Máximo razoável
):
    offset = (pagina - 1) * por_pagina
    return eleitores[offset:offset + por_pagina]
```

#### Lazy Loading de Relações

```python
# Carregar memórias apenas quando necessário
eleitor = await db.get(Eleitor, id)
# Não carrega memórias automaticamente

# Quando precisar:
eleitor_com_memorias = await db.get(
    Eleitor, id,
    options=[selectinload(Eleitor.memorias)]
)
```

#### Batch Processing para Claude

```python
# Processar em lotes para evitar rate limit
async def executar_entrevista(eleitores: list, batch_size: int = 10):
    for i in range(0, len(eleitores), batch_size):
        batch = eleitores[i:i + batch_size]

        # Executar batch em paralelo
        tasks = [processar_eleitor(e) for e in batch]
        await asyncio.gather(*tasks)

        # Delay entre batches
        await asyncio.sleep(0.5)
```

---

## Scaling para Mais Eleitores

### Cenários de Escala

| Eleitores | RAM Necessária | CPU | Tempo Entrevista (5 perguntas) |
|-----------|----------------|-----|-------------------------------|
| 400 | 2 GB | 2 cores | ~30 min |
| 1.000 | 4 GB | 4 cores | ~1.5 horas |
| 4.000 | 8 GB | 4 cores | ~6 horas |
| 10.000 | 16 GB | 8 cores | ~15 horas |

### Estratégias por Escala

#### Até 1.000 eleitores

**Mudanças necessárias**: Nenhuma arquitetural

```python
# Apenas ajustar paginação
por_pagina = 100  # Em vez de 50
```

#### 1.000 - 4.000 eleitores

**Mudanças necessárias**:

1. **Migrar JSON para PostgreSQL**

```python
# Antes: JSON em memória
eleitores = json.load(open('banco-eleitores.json'))

# Depois: PostgreSQL
eleitores = await db.execute(
    select(Eleitor).limit(100).offset(offset)
)
```

2. **Índices no banco**

```sql
CREATE INDEX idx_eleitor_regiao ON eleitores(regiao_administrativa);
CREATE INDEX idx_eleitor_cluster ON eleitores(cluster_socioeconomico);
CREATE INDEX idx_eleitor_orientacao ON eleitores(orientacao_politica);
```

3. **Redis para cache**

```python
import redis

cache = redis.Redis()

async def get_estatisticas():
    cached = cache.get('estatisticas')
    if cached:
        return json.loads(cached)

    stats = await calcular_estatisticas()
    cache.setex('estatisticas', 300, json.dumps(stats))  # 5 min TTL
    return stats
```

#### 4.000 - 10.000 eleitores

**Mudanças necessárias**:

1. **Workers assíncronos (Celery)**

```python
# tasks.py
from celery import Celery

app = Celery('tasks', broker='redis://localhost:6379')

@app.task
def processar_eleitor_task(eleitor_id: str, pergunta: dict):
    # Processamento em background
    return chamar_claude(eleitor_id, pergunta)
```

2. **Processamento distribuído**

```python
# Dividir entrevista em chunks
chunks = [eleitores[i:i+100] for i in range(0, len(eleitores), 100)]

# Distribuir para workers
for chunk in chunks:
    processar_chunk.delay(chunk, perguntas)
```

3. **Banco de dados dedicado**

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:15
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
```

#### 10.000+ eleitores

**Mudanças necessárias**:

1. **Kubernetes para orquestração**
2. **Sharding de dados por região**
3. **CDN para assets estáticos**
4. **Múltiplas chaves de API Claude**

---

## Otimizações da API Claude

### Rate Limits da Anthropic

| Tier | Requests/min | Tokens/min |
|------|--------------|------------|
| Free | 5 | 20K |
| Build | 50 | 40K |
| Scale | 1000 | 400K |

### Estratégias de Otimização

#### 1. Usar Modelo Apropriado

```python
# Entrevistas: Sonnet (mais barato, mais rápido)
model = "claude-sonnet-4-5-20250929"

# Insights: Opus (apenas para análises complexas)
model = "claude-opus-4-5-20251101"

# Fallback: Haiku (emergência)
model = "claude-3-5-haiku-20241022"
```

#### 2. Otimizar Prompts

```python
# Antes: Prompt verboso (2000 tokens)
prompt = f"""
Você é {nome}, um eleitor do Distrito Federal...
[muitas instruções]
"""

# Depois: Prompt otimizado (800 tokens)
prompt = f"""
<perfil>{json.dumps(perfil_resumido)}</perfil>
<pergunta>{pergunta}</pergunta>
Responda como o eleitor. JSON: {{resposta, sentimento}}
"""
```

#### 3. Batch com Paralelismo Controlado

```python
import asyncio
from anthropic import AsyncAnthropic

client = AsyncAnthropic()
semaphore = asyncio.Semaphore(10)  # Max 10 paralelas

async def call_claude_limited(prompt):
    async with semaphore:
        return await client.messages.create(...)

# Processar todos em paralelo (limitado)
results = await asyncio.gather(*[
    call_claude_limited(p) for p in prompts
])
```

#### 4. Cache de Respostas Similares

```python
import hashlib

def get_cache_key(eleitor_id, pergunta_hash):
    return f"resp:{eleitor_id}:{pergunta_hash}"

async def get_resposta(eleitor, pergunta):
    key = get_cache_key(eleitor.id, hash(pergunta.texto))

    # Verificar cache
    cached = cache.get(key)
    if cached:
        return json.loads(cached)

    # Chamar Claude
    resposta = await chamar_claude(eleitor, pergunta)

    # Cachear por 24h (mesma pergunta, mesmo eleitor)
    cache.setex(key, 86400, json.dumps(resposta))
    return resposta
```

---

## Monitoramento de Performance

### Métricas a Coletar

```python
import time
from prometheus_client import Histogram, Counter

# Latência de requisições
REQUEST_LATENCY = Histogram(
    'request_latency_seconds',
    'Request latency',
    ['endpoint']
)

# Chamadas à API Claude
CLAUDE_CALLS = Counter(
    'claude_api_calls_total',
    'Total Claude API calls',
    ['model', 'status']
)

# Decorator para medir tempo
def measure_time(endpoint: str):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            start = time.time()
            result = await func(*args, **kwargs)
            REQUEST_LATENCY.labels(endpoint=endpoint).observe(
                time.time() - start
            )
            return result
        return wrapper
    return decorator
```

### Dashboard Grafana

```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Alertas Recomendados

| Métrica | Threshold | Ação |
|---------|-----------|------|
| Latência P95 > 5s | Crítico | Verificar Claude API |
| Erros 5xx > 1% | Alerta | Verificar logs |
| CPU > 80% | Alerta | Escalar horizontalmente |
| Memória > 90% | Crítico | Aumentar RAM |
| Rate limit Claude | Alerta | Aumentar delay |

---

## Checklist de Performance

### Antes de Ir para Produção

- [ ] Virtualização ativa no frontend
- [ ] Paginação em todas as listas
- [ ] Cache configurado (React Query + Redis)
- [ ] Índices no banco de dados
- [ ] Modelo Claude apropriado por operação
- [ ] Rate limiting configurado
- [ ] Monitoramento ativo
- [ ] Alertas configurados

### Quando Escalar

- [ ] Migrar JSON para PostgreSQL
- [ ] Adicionar Redis
- [ ] Configurar workers (Celery)
- [ ] Aumentar recursos (RAM, CPU)
- [ ] Considerar Kubernetes

---

## Referências

- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [React Query](https://tanstack.com/query/latest)
- [Anthropic Rate Limits](https://docs.anthropic.com/claude/reference/rate-limits)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)

---

*Última atualização: Janeiro 2026*
