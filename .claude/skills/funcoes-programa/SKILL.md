# SKILL: Funções do Programa

> **Propósito**: Ensinar IAs a utilizar as funcionalidades do sistema Pesquisa Eleitoral DF, incluindo como executar cada operação via código ou API.

---

## FUNCIONALIDADES PRINCIPAIS

### 1. Gestão de Eleitores

#### Listar Eleitores (com filtros)

**API Backend:**
```python
GET /api/v1/eleitores?limite=50&pagina=1&genero=masculino&idade_min=25&idade_max=45
```

**Filtros Disponíveis (20+):**
- `genero`, `cor_raca`, `faixa_etaria`
- `regiao_administrativa`, `local_referencia`
- `cluster_socioeconomico`, `escolaridade`, `profissao`
- `orientacao_politica`, `posicao_bolsonaro`
- `interesse_politico`, `tolerancia_corrupcao`
- `idade_min`, `idade_max`
- `busca` (texto livre)

**Frontend Store:**
```typescript
import { useEleitoresStore } from '@/stores/eleitores-store'

const { eleitores, filtrar, carregarEleitores } = useEleitoresStore()
await carregarEleitores({ genero: 'masculino', limite: 100 })
```

#### Criar Eleitor

**API Backend:**
```python
POST /api/v1/eleitores
{
  "nome": "João Silva",
  "idade": 35,
  "genero": "masculino",
  "regiao_administrativa": "Asa Norte",
  "cluster_socioeconomico": "G3_media_baixa",
  "orientacao_politica": "centro-esquerda",
  // ... 60+ campos
}
```

#### Estatísticas de Eleitores

**API Backend:**
```python
GET /api/v1/eleitores/estatisticas
# Retorna distribuições por gênero, idade, região, orientação política, etc.
```

---

### 2. Gestão de Pesquisas

#### Criar Pesquisa

**API Backend:**
```python
POST /api/v1/pesquisas
{
  "titulo": "Pesquisa Governador DF 2026",
  "descricao": "Intenção de voto primeiro turno",
  "perguntas": [
    {
      "texto": "Em quem você votaria para Governador?",
      "tipo": "multipla_escolha",
      "opcoes": ["Celina Leão", "Flávia Arruda", "Nulo/Branco"]
    },
    {
      "texto": "Qual sua avaliação do atual governo?",
      "tipo": "escala",
      "escala_min": 1,
      "escala_max": 10
    }
  ]
}
```

#### Iniciar Execução de Pesquisa

**API Backend:**
```python
POST /api/v1/pesquisas/{pesquisa_id}/executar
{
  "eleitor_ids": ["eleitor-001", "eleitor-002", ...],
  "modelo_ia": "sonnet"  # ou "opus" para análises complexas
}
```

**Frontend:**
```typescript
import { usePesquisasStore } from '@/stores/pesquisas-store'

const { iniciarPesquisa, progresso } = usePesquisasStore()
await iniciarPesquisa(pesquisaId, eleitorIds)

// Monitorar progresso
console.log(progresso) // { total: 100, completados: 45, percentual: 45 }
```

#### Obter Progresso em Tempo Real

**API Backend:**
```python
GET /api/v1/pesquisas/{pesquisa_id}/progresso
# Retorna: { status, total, completados, percentual, tempo_estimado }
```

---

### 3. Entrevistas com IA

#### Entrevistar Eleitor Individual

**Backend Service:**
```python
from app.servicos.claude_servico import ClaudeServico

servico = ClaudeServico()
resposta = await servico.entrevistar_eleitor(
    eleitor=eleitor_dict,
    pergunta="Em quem você votaria para Governador?",
    tipo_pergunta="multipla_escolha",
    opcoes=["Celina Leão", "Flávia Arruda", "Nulo"]
)
```

**Frontend API Route:**
```typescript
// app/api/claude/entrevista/route.ts
POST /api/claude/entrevista
{
  "eleitor_id": "eleitor-001",
  "pergunta": "Qual sua opinião sobre...",
  "tipo": "aberta"
}
```

#### 4 Etapas Cognitivas

O sistema aplica automaticamente:
1. **Filtro de Atenção** - O eleitor prestaria atenção?
2. **Viés de Confirmação** - Confirma ou ameaça crenças?
3. **Reação Emocional** - Como se sente?
4. **Decisão** - Resposta genuína

---

### 4. Análise de Resultados

#### Obter Estatísticas Básicas

**API Backend:**
```python
GET /api/v1/resultados/{sessao_id}
# Retorna: médias, desvios, distribuições
```

#### Obter Análises Avançadas

**API Backend:**
```python
GET /api/v1/resultados/{sessao_id}/analises
# Retorna: correlações, sentimentos, clusters
```

#### Gerar Insights com IA

**API Backend:**
```python
POST /api/v1/resultados/{sessao_id}/insights
# Claude Opus 4.5 analisa os dados e gera insights textuais
```

**Frontend:**
```typescript
// app/api/claude/insights/route.ts
POST /api/claude/insights
{
  "sessao_id": "sessao-123",
  "tipo_analise": "tendencias"  // ou "correlacoes", "segmentos"
}
```

#### Exportar Resultados

**API Backend:**
```python
GET /api/v1/resultados/{sessao_id}/exportar?formato=xlsx
GET /api/v1/resultados/{sessao_id}/exportar?formato=pdf
GET /api/v1/resultados/{sessao_id}/exportar?formato=csv
```

---

### 5. Gestão de Candidatos

#### CRUD Candidatos

**API Backend:**
```python
# Listar
GET /api/v1/candidatos?cargo=governador&partido=PP

# Criar
POST /api/v1/candidatos
{
  "nome": "Celina Leão",
  "cargo": "governador",
  "partido": "PP",
  "rejeicao": 15.5,
  "conhecimento": 78.2
}

# Atualizar
PUT /api/v1/candidatos/{id}

# Deletar
DELETE /api/v1/candidatos/{id}
```

---

### 6. Simulação de Cenários

#### Criar Cenário Eleitoral

**API Backend:**
```python
POST /api/v1/cenarios
{
  "titulo": "Primeiro Turno 2026",
  "tipo_turno": "primeiro",
  "candidatos": [
    { "id": "cand-1", "nome": "Celina Leão" },
    { "id": "cand-2", "nome": "Flávia Arruda" }
  ]
}
```

#### Simular Votação

**API Backend:**
```python
POST /api/v1/cenarios/{cenario_id}/simular
{
  "eleitor_ids": ["eleitor-001", ...],
  "modelo_ia": "sonnet"
}
# Retorna: votos por candidato, por segmento
```

---

### 7. Geração de Novos Eleitores (IA)

#### Gerar Eleitores Sintéticos

**API Backend:**
```python
POST /api/v1/geracao/eleitores
{
  "quantidade": 100,
  "perfil_base": {
    "regiao_administrativa": "Ceilândia",
    "cluster_socioeconomico": "G4_baixa"
  },
  "modelo_ia": "opus"  # Opus para maior qualidade
}
```

**Estimativa de Custo:**
```python
POST /api/v1/geracao/estimar
{
  "quantidade": 100,
  "modelo_ia": "opus"
}
# Retorna: { tokens_estimados, custo_usd, custo_brl }
```

---

### 8. Memórias e Persistência

#### Salvar Memória de Conversa

**API Backend:**
```python
POST /api/v1/memorias
{
  "conteudo": { "contexto": "...", "historico": [...] },
  "tipo": "entrevista"
}
```

#### Recuperar Memórias

```python
GET /api/v1/memorias?tipo=entrevista&limite=10
```

---

### 9. Autenticação

#### Login

**API Backend:**
```python
POST /api/v1/auth/login
{
  "username": "admin",
  "password": "senha123"
}
# Retorna: { access_token, token_type: "bearer" }
```

**Frontend:**
```typescript
import { useAuthStore } from '@/stores/auth-store'

const { login, logout, usuario } = useAuthStore()
await login('admin', 'senha123')
```

#### Refresh Token

```python
POST /api/v1/auth/refresh
# Header: Authorization: Bearer <token>
# Retorna: novo access_token
```

---

## SCRIPTS DE UTILIDADE

### Gerar Eleitores (Script Local)

```bash
cd pesquisa-eleitoral-df
python scripts/gerar_eleitores_df_v4.py --quantidade 1000
```

### Simular Pesquisa Governador

```bash
python scripts/pesquisa_governador_2026.py
```

### Análise de Stress Político

```bash
python scripts/simulacao_stress_politico_celina.py
python scripts/analisar_resultados_stress.py
```

---

## COMANDOS DO SISTEMA

### Backend

```bash
# Iniciar servidor desenvolvimento
cd backend
python -m uvicorn app.main:app --reload --port 8000

# Migrar banco de dados
alembic upgrade head

# Criar nova migração
alembic revision --autogenerate -m "descricao"
```

### Frontend

```bash
# Iniciar desenvolvimento
cd frontend
npm run dev

# Build produção
npm run build

# Lint
npm run lint
```

### Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Parar
docker-compose down
```

---

## CÓDIGOS DE STATUS

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 422 | Erro de validação |
| 500 | Erro interno |

---

## MODELOS DE DADOS PRINCIPAIS

### Eleitor (60+ campos)

```typescript
interface Eleitor {
  id: string
  nome: string
  idade: number
  genero: 'masculino' | 'feminino'
  cor_raca: string
  regiao_administrativa: string
  cluster_socioeconomico: string
  escolaridade: string
  profissao: string
  renda_salarios_minimos: string
  orientacao_politica: string
  posicao_bolsonaro: string
  interesse_politico: string
  valores: string[]
  preocupacoes: string[]
  medos: string[]
  vieses_cognitivos: string[]
  fontes_informacao: string[]
  historia_resumida: string
  instrucao_comportamental: string
  // ... e mais
}
```

### Pesquisa

```typescript
interface Pesquisa {
  id: string
  titulo: string
  descricao: string
  status: 'rascunho' | 'executando' | 'pausada' | 'finalizada'
  perguntas: Pergunta[]
  criado_em: Date
  criado_por: string
}
```

### Resposta

```typescript
interface Resposta {
  id: string
  pesquisa_id: string
  eleitor_id: string
  pergunta_id: string
  valor: any  // Depende do tipo de pergunta
  justificativa: string
  criado_em: Date
}
```

---

*Skill criada em: 2026-01-25*
*Mantida por: Claude Code*
