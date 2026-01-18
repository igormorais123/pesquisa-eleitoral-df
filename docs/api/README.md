# Referência da API

Documentação completa da API REST do Sistema de Pesquisa Eleitoral DF 2026.

---

## Visão Geral

| Informação | Valor |
|------------|-------|
| Base URL | `http://localhost:8000/api/v1` |
| Formato | JSON |
| Autenticação | JWT Bearer Token |
| Documentação Interativa | [Swagger UI](http://localhost:8000/docs) |

---

## Autenticação

Todas as rotas (exceto login) requerem token JWT no header:

```
Authorization: Bearer <seu_token>
```

### Obtendo Token

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "admin",
    "senha": "admin123"
  }'
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "usuario": {
    "id": "1",
    "nome": "Administrador",
    "papel": "admin"
  }
}
```

---

## Endpoints por Categoria

### Autenticação (`/api/v1/auth`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/login` | Obter token JWT |
| POST | `/login/form` | Login via OAuth2 (Swagger) |
| GET | `/me` | Dados do usuário atual |
| POST | `/logout` | Encerrar sessão |
| GET | `/verificar` | Validar token |

### Eleitores (`/api/v1/eleitores`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Listar com filtros (20+) |
| GET | `/{id}` | Obter perfil completo |
| GET | `/estatisticas` | Distribuições e contagens |
| GET | `/opcoes-filtros` | Valores únicos para filtros |
| GET | `/exportar` | Exportar eleitores filtrados em CSV |
| GET | `/ids` | Apenas IDs filtrados |
| POST | `/` | Criar eleitor |
| POST | `/lote` | Criar múltiplos |
| POST | `/importar-json` | Importar de JSON |
| POST | `/selecionar` | Selecionar por filtros |
| POST | `/por-ids` | Buscar por lista de IDs |
| PUT | `/{id}` | Atualizar eleitor |
| DELETE | `/{id}` | Remover eleitor |

### Entrevistas (`/api/v1/entrevistas`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Listar entrevistas |
| GET | `/{id}` | Detalhes da entrevista |
| GET | `/{id}/progresso` | Status de execução |
| GET | `/{id}/respostas` | Respostas coletadas |
| POST | `/` | Criar entrevista |
| POST | `/{id}/iniciar` | Iniciar execução |
| POST | `/{id}/pausar` | Pausar execução |
| POST | `/{id}/retomar` | Retomar execução |
| POST | `/{id}/cancelar` | Cancelar execução |
| POST | `/estimar-custo` | Calcular custo antes |
| PUT | `/{id}` | Atualizar entrevista |
| DELETE | `/{id}` | Remover entrevista |

### Resultados (`/api/v1/resultados`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Listar resultados |
| GET | `/{id}` | Resultado completo |
| GET | `/{id}/estatisticas` | Estatísticas quantitativas |
| GET | `/{id}/sentimentos` | Análise de sentimentos |
| GET | `/{id}/mapa-calor` | Dados para heatmap |
| GET | `/{id}/votos-silenciosos` | Votos não declarados |
| GET | `/{id}/pontos-ruptura` | Gatilhos de mudança |
| GET | `/{id}/insights` | Insights gerados por IA |
| POST | `/analisar/{id}` | Gerar análise |
| DELETE | `/{id}` | Remover resultado |

### Geração (`/api/v1/geracao`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/` | Gerar novos eleitores com IA |

### Memórias (`/api/v1/memorias`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Listar memórias dos agentes |

---

## Exemplos Detalhados

### Listar Eleitores com Filtros

```bash
curl -X GET "http://localhost:8000/api/v1/eleitores?\
idade_min=18&\
idade_max=35&\
orientacoes=esquerda,centro-esquerda&\
regioes=Ceilandia,Samambaia&\
clusters=G4_baixa&\
pagina=1&\
por_pagina=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta:**
```json
{
  "eleitores": [
    {
      "id": "el_001",
      "nome": "Maria Silva",
      "idade": 28,
      "genero": "feminino",
      "cor_raca": "parda",
      "regiao_administrativa": "Ceilândia",
      "cluster_socioeconomico": "G4_baixa",
      "orientacao_politica": "esquerda",
      "posicao_bolsonaro": "critico_forte",
      "interesse_politico": "medio",
      "valores": ["Saúde pública", "Educação", "Igualdade"],
      "preocupacoes": ["Desemprego", "Violência", "Custo de vida"],
      "historia_resumida": "Nascida em Ceilândia, trabalha como..."
    }
  ],
  "total": 87,
  "pagina": 1,
  "por_pagina": 20,
  "total_paginas": 5
}
```

### Exportar Eleitores (CSV)

```bash
curl -X GET "http://localhost:8000/api/v1/eleitores/exportar?\
idade_min=18&\
idade_max=35&\
orientacoes=esquerda,centro-esquerda&\
regioes=Ceilandia,Samambaia&\
clusters=G4_baixa" \
  -H "Authorization: Bearer $TOKEN" \
  -o eleitores.csv
```

### Filtros Disponíveis

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `idade_min` | int | Idade mínima (16+) |
| `idade_max` | int | Idade máxima (120) |
| `generos` | string | "masculino,feminino" |
| `cores_racas` | string | "branca,preta,parda,amarela,indigena" |
| `regioes` | string | RAs separadas por vírgula |
| `clusters` | string | "G1_alta,G2_media_alta,G3_media_baixa,G4_baixa" |
| `escolaridades` | string | Níveis de escolaridade |
| `profissoes` | string | Profissões específicas |
| `religioes` | string | "catolica,evangelica,sem_religiao,..." |
| `orientacoes` | string | "esquerda,centro-esquerda,centro,centro-direita,direita" |
| `posicoes_bolsonaro` | string | "apoiador_forte,...,critico_forte" |
| `interesses` | string | "baixo,medio,alto" |
| `busca` | string | Texto livre (nome, profissão) |
| `pagina` | int | Página atual (1+) |
| `por_pagina` | int | Itens por página (1-500) |
| `ordenar_por` | string | Campo para ordenação |
| `ordem` | string | "asc" ou "desc" |

---

### Criar Entrevista

```bash
curl -X POST http://localhost:8000/api/v1/entrevistas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Intenção de Voto - Janeiro 2026",
    "tipo": "mista",
    "descricao": "Pesquisa sobre candidatos ao governo do DF",
    "perguntas": [
      {
        "id": "p1",
        "texto": "Se a eleição fosse hoje, em quem você votaria?",
        "tipo": "multipla_escolha",
        "opcoes": [
          "Candidato A (situação)",
          "Candidato B (oposição)",
          "Candidato C (terceira via)",
          "Branco/Nulo",
          "Não sei"
        ],
        "obrigatoria": true
      },
      {
        "id": "p2",
        "texto": "De 0 a 10, quanto você confia no atual governador?",
        "tipo": "escala",
        "escala_min": 0,
        "escala_max": 10,
        "escala_rotulos": ["Nenhuma confiança", "Confiança total"],
        "obrigatoria": true
      },
      {
        "id": "p3",
        "texto": "O que mais te preocupa em relação ao futuro do DF?",
        "tipo": "aberta",
        "obrigatoria": false
      }
    ],
    "eleitores_ids": ["el_001", "el_002", "el_003"]
  }'
```

**Resposta:**
```json
{
  "id": "ent_abc123",
  "titulo": "Intenção de Voto - Janeiro 2026",
  "tipo": "mista",
  "status": "rascunho",
  "perguntas": [...],
  "eleitores_ids": ["el_001", "el_002", "el_003"],
  "total_eleitores": 3,
  "criado_em": "2026-01-15T10:30:00Z"
}
```

---

### Iniciar Execução

```bash
curl -X POST http://localhost:8000/api/v1/entrevistas/ent_abc123/iniciar \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "limite_custo_reais": 50.00,
    "batch_size": 10,
    "delay_entre_batches_ms": 500
  }'
```

**Resposta:**
```json
{
  "mensagem": "Execução iniciada",
  "entrevista_id": "ent_abc123",
  "config": {
    "limite_custo_reais": 50.0,
    "batch_size": 10,
    "delay_entre_batches_ms": 500
  }
}
```

---

### Monitorar Progresso

```bash
curl -X GET http://localhost:8000/api/v1/entrevistas/ent_abc123/progresso \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta:**
```json
{
  "entrevista_id": "ent_abc123",
  "status": "executando",
  "progresso": {
    "total": 1200,
    "concluidos": 450,
    "erros": 3,
    "percentual": 37.5
  },
  "custo": {
    "tokens_entrada": 125000,
    "tokens_saida": 45000,
    "custo_usd": 1.25,
    "custo_brl": 7.50
  },
  "tempo": {
    "inicio": "2026-01-15T10:35:00Z",
    "duracao_segundos": 180,
    "estimativa_restante_segundos": 300
  }
}
```

---

### Estimar Custo

```bash
curl -X POST "http://localhost:8000/api/v1/entrevistas/estimar-custo?\
total_perguntas=5&\
total_eleitores=400&\
proporcao_opus=0.2" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta:**
```json
{
  "total_interacoes": 2000,
  "estimativa": {
    "tokens_entrada": 500000,
    "tokens_saida": 200000,
    "custo_minimo_usd": 2.50,
    "custo_maximo_usd": 8.00,
    "custo_minimo_brl": 15.00,
    "custo_maximo_brl": 48.00
  },
  "detalhamento": {
    "sonnet": {
      "interacoes": 1600,
      "custo_usd": 2.00
    },
    "opus": {
      "interacoes": 400,
      "custo_usd": 6.00
    }
  }
}
```

---

### Obter Estatísticas

```bash
curl -X GET http://localhost:8000/api/v1/eleitores/estatisticas \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta:**
```json
{
  "total": 400,
  "distribuicoes": {
    "genero": {
      "masculino": 195,
      "feminino": 205
    },
    "faixa_etaria": {
      "16-24": 68,
      "25-34": 92,
      "35-44": 88,
      "45-54": 76,
      "55-64": 48,
      "65+": 28
    },
    "cluster": {
      "G1_alta": 48,
      "G2_media_alta": 96,
      "G3_media_baixa": 124,
      "G4_baixa": 132
    },
    "orientacao_politica": {
      "esquerda": 72,
      "centro-esquerda": 88,
      "centro": 96,
      "centro-direita": 84,
      "direita": 60
    },
    "regiao_administrativa": {
      "Ceilândia": 60,
      "Taguatinga": 40,
      "Samambaia": 36,
      "Plano Piloto": 32,
      "...": "..."
    }
  }
}
```

---

## Códigos de Status

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Não encontrado |
| 422 | Erro de validação |
| 500 | Erro interno |

---

## Rate Limiting

Atualmente não há rate limiting implementado. Recomendamos:

- Máximo 10 requisições/segundo para leitura
- Máximo 1 requisição/segundo para escrita
- Use `delay_entre_batches_ms` ao executar entrevistas

---

## Exemplos em Outras Linguagens

### Python

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Login
response = requests.post(f"{BASE_URL}/auth/login", json={
    "usuario": "admin",
    "senha": "admin123"
})
token = response.json()["access_token"]

# Headers padrão
headers = {"Authorization": f"Bearer {token}"}

# Listar eleitores jovens de esquerda
eleitores = requests.get(
    f"{BASE_URL}/eleitores",
    params={
        "idade_max": 30,
        "orientacoes": "esquerda,centro-esquerda"
    },
    headers=headers
).json()

print(f"Total: {eleitores['total']} eleitores")
```

### JavaScript/TypeScript

```typescript
const BASE_URL = "http://localhost:8000/api/v1";

// Login
const loginRes = await fetch(`${BASE_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ usuario: "admin", senha: "admin123" })
});
const { access_token } = await loginRes.json();

// Headers padrão
const headers = {
  "Authorization": `Bearer ${access_token}`,
  "Content-Type": "application/json"
};

// Criar entrevista
const entrevista = await fetch(`${BASE_URL}/entrevistas`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    titulo: "Pesquisa Teste",
    tipo: "quantitativa",
    perguntas: [...],
    eleitores_ids: [...]
  })
}).then(r => r.json());
```

---

## Swagger UI

Para explorar a API interativamente:

1. Acesse: [http://localhost:8000/docs](http://localhost:8000/docs)
2. Clique em **Authorize**
3. Faça login via `/auth/login/form`
4. Teste qualquer endpoint diretamente

---

*Última atualização: Janeiro 2026*
