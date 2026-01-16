# Architecture Decision Records (ADRs)

Registro das decisões arquiteturais importantes do projeto.

---

## Índice

1. [ADR-001: Zustand para Estado Global](#adr-001-zustand-para-estado-global)
2. [ADR-002: JSON para Armazenamento de Eleitores](#adr-002-json-para-armazenamento-de-eleitores)
3. [ADR-003: Claude Sonnet para Entrevistas](#adr-003-claude-sonnet-para-entrevistas)
4. [ADR-004: FastAPI em vez de Django](#adr-004-fastapi-em-vez-de-django)
5. [ADR-005: TanStack Virtual para Listas](#adr-005-tanstack-virtual-para-listas)
6. [ADR-006: Chain of Thought de 4 Etapas](#adr-006-chain-of-thought-de-4-etapas)
7. [ADR-007: IndexedDB para Cache Local](#adr-007-indexeddb-para-cache-local)
8. [ADR-008: Regras Anti-Convergência](#adr-008-regras-anti-convergência)

---

## ADR-001: Zustand para Estado Global

### Status
Aceito

### Contexto
Precisávamos de gerenciamento de estado global para:
- Autenticação do usuário
- Filtros de eleitores
- Estado de entrevistas em execução
- Preferências do usuário

Opções consideradas:
1. **Redux** - Padrão da indústria, mas verboso
2. **Zustand** - Minimalista, sem boilerplate
3. **Jotai** - Atômico, bom para estados independentes
4. **Context API** - Nativo do React, re-renders excessivos

### Decisão
Escolhemos **Zustand** pelos seguintes motivos:

1. **Simplicidade**: Código 70% menor que Redux
2. **Performance**: Não causa re-renders desnecessários
3. **TypeScript**: Inferência de tipos excelente
4. **Persist**: Plugin nativo para persistência
5. **DevTools**: Compatível com Redux DevTools

### Consequências

**Positivas:**
- Código mais legível e manutenível
- Menos boilerplate
- Curva de aprendizado curta

**Negativas:**
- Menos documentação que Redux
- Ecossistema menor de middlewares

### Código Exemplo

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      login: (token, usuario) => set({ token, usuario }),
      logout: () => set({ token: null, usuario: null }),
    }),
    { name: 'auth-storage' }
  )
);
```

---

## ADR-002: JSON para Armazenamento de Eleitores

### Status
Aceito (com ressalvas para escala)

### Contexto
Os 400 eleitores sintéticos precisam ser armazenados. Opções:

1. **PostgreSQL** - Relacional, robusto
2. **MongoDB** - Document store, flexível
3. **JSON em arquivo** - Simples, versionável
4. **SQLite** - Leve, arquivo único

### Decisão
Escolhemos **JSON em arquivo** (`banco-eleitores-df.json`) porque:

1. **Versionamento**: Pode ser commitado no Git
2. **Portabilidade**: Funciona sem banco de dados
3. **Simplicidade**: Sem migrations ou setup
4. **Desenvolvimento**: Fácil de editar manualmente
5. **Tamanho**: 400 eleitores ≈ 2MB (gerenciável)

### Consequências

**Positivas:**
- Setup zero para desenvolvimento
- Fácil backup (é só copiar o arquivo)
- Histórico completo no Git

**Negativas:**
- Não escala além de ~4.000 eleitores
- Sem queries otimizadas
- Carrega tudo em memória

### Plano de Migração

Quando necessário escalar:

```python
# Migrar para PostgreSQL
from sqlalchemy import create_engine
import json

# Carregar JSON
with open('banco-eleitores-df.json') as f:
    eleitores = json.load(f)

# Inserir no banco
engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    for eleitor in eleitores:
        conn.execute(insert(Eleitor).values(**eleitor))
```

---

## ADR-003: Claude Sonnet para Entrevistas

### Status
Aceito

### Contexto
O sistema precisa chamar API Claude para gerar respostas dos eleitores. Modelos disponíveis:

| Modelo | Entrada | Saída | Velocidade |
|--------|---------|-------|------------|
| Opus 4.5 | $15/M | $75/M | Lento |
| Sonnet 4.5 | $3/M | $15/M | Médio |
| Haiku 3.5 | $0.25/M | $1.25/M | Rápido |

### Decisão
Usar **Sonnet 4.5** como padrão para entrevistas porque:

1. **Custo-benefício**: 5x mais barato que Opus
2. **Qualidade**: Suficiente para simulação de respostas
3. **Velocidade**: 2-3x mais rápido que Opus
4. **Rate limits**: Mais generosos

Reservar **Opus 4.5** apenas para:
- Geração de insights complexos
- Análises de correlação
- Relatórios executivos

### Consequências

**Positivas:**
- Custo por entrevista ~5x menor
- Execução mais rápida
- Menos chance de rate limit

**Negativas:**
- Respostas podem ser ligeiramente menos nuançadas
- Opus seria melhor para perfis muito complexos

### Implementação

```python
def escolher_modelo(operacao: str) -> str:
    if operacao in ['insight', 'analise', 'relatorio']:
        return "claude-opus-4-5-20251101"
    elif operacao in ['entrevista', 'resposta']:
        return "claude-sonnet-4-5-20250929"
    else:
        return "claude-3-5-haiku-20241022"  # Fallback
```

---

## ADR-004: FastAPI em vez de Django

### Status
Aceito

### Contexto
Precisávamos de um framework Python para o backend. Opções:

1. **Django** - Full-featured, ORM incluído
2. **FastAPI** - Moderno, async-first
3. **Flask** - Minimalista, flexível
4. **Starlette** - Baixo nível, alta performance

### Decisão
Escolhemos **FastAPI** porque:

1. **Async nativo**: Essencial para chamadas à API Claude
2. **OpenAPI automático**: Swagger/ReDoc gratuito
3. **Pydantic**: Validação de dados robusta
4. **Performance**: Uma das mais rápidas em Python
5. **Type hints**: Excelente suporte a TypeScript-like

### Consequências

**Positivas:**
- Documentação automática da API
- Validação de request/response
- Async sem dor de cabeça
- Curva de aprendizado suave

**Negativas:**
- Sem ORM integrado (usamos SQLAlchemy separado)
- Ecossistema menor que Django
- Menos "baterias incluídas"

### Código Exemplo

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class EleitorCreate(BaseModel):
    nome: str
    idade: int
    regiao: str

@app.post("/eleitores", response_model=Eleitor)
async def criar_eleitor(dados: EleitorCreate):
    # Validação automática pelo Pydantic
    return await salvar_eleitor(dados)
```

---

## ADR-005: TanStack Virtual para Listas

### Status
Aceito

### Contexto
Renderizar 400+ cards de eleitores causava:
- Lag ao scrollar
- Uso alto de memória
- Time to Interactive lento

Opções de virtualização:
1. **react-window** - Clássico, bem documentado
2. **react-virtuoso** - Fácil de usar
3. **TanStack Virtual** - Headless, flexível
4. **Paginação tradicional** - Sem virtualização

### Decisão
Escolhemos **TanStack Virtual** porque:

1. **Headless**: Controle total sobre a UI
2. **Flexível**: Funciona com qualquer layout
3. **Leve**: ~3KB gzipped
4. **Moderno**: Hooks-based, TypeScript nativo
5. **Mantido**: Mesmo time do React Query

### Consequências

**Positivas:**
- Renderiza apenas ~20 itens (vs 400+)
- Scroll suave mesmo com milhares de itens
- Memória reduzida em 95%

**Negativas:**
- Complexidade adicional no código
- Altura de itens deve ser conhecida/estimada
- Debugging mais difícil

### Implementação

```tsx
const rowVirtualizer = useVirtualizer({
  count: eleitores.length,
  getScrollElement: () => containerRef.current,
  estimateSize: () => 120,
  overscan: 5,
});

return (
  <div ref={containerRef} style={{ height: '600px', overflow: 'auto' }}>
    <div style={{ height: rowVirtualizer.getTotalSize() }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <EleitorCard
          key={virtualRow.key}
          eleitor={eleitores[virtualRow.index]}
          style={{
            position: 'absolute',
            top: virtualRow.start,
            height: virtualRow.size,
          }}
        />
      ))}
    </div>
  </div>
);
```

---

## ADR-006: Chain of Thought de 4 Etapas

### Status
Aceito

### Contexto
Respostas de LLMs a perguntas políticas tendem a ser:
- Equilibradas demais
- Sem personalidade
- Previsíveis

Precisávamos de um processo que gerasse respostas autênticas.

### Decisão
Implementamos um **Chain of Thought de 4 etapas** baseado em pesquisa cognitiva:

1. **Filtro de Atenção**: O eleitor sequer prestaria atenção?
2. **Viés de Confirmação**: Confirma ou ameaça suas crenças?
3. **Reação Emocional**: Qual o sentimento gerado?
4. **Decisão**: Qual a resposta genuína?

### Fundamentação

Baseado em:
- Kahneman (Sistema 1 vs Sistema 2)
- Haidt (Elefante e Cavaleiro)
- Westen (Political Brain)

### Consequências

**Positivas:**
- Respostas mais autênticas e diversas
- Comportamento consistente com perfil
- Insights sobre processo decisório
- Dados de sentimento capturados

**Negativas:**
- Prompts mais longos (mais tokens)
- Respostas mais complexas para parsear
- Pode gerar conteúdo controverso

### Formato da Resposta

```json
{
  "chain_of_thought": {
    "etapa1_atencao": { "prestou_atencao": true, "motivo": "..." },
    "etapa2_vies": { "confirma_crencas": false, "ameaca_valores": true },
    "etapa3_emocional": { "sentimento": "raiva", "intensidade": 7 },
    "etapa4_decisao": { "muda_voto": false }
  },
  "resposta_texto": "...",
  "resposta_estruturada": { ... }
}
```

---

## ADR-007: IndexedDB para Cache Local

### Status
Aceito

### Contexto
Precisávamos armazenar dados localmente para:
- Funcionamento offline básico
- Cache de eleitores carregados
- Persistência de filtros

Opções:
1. **localStorage** - Simples, síncrono, 5MB limite
2. **IndexedDB** - Assíncrono, sem limite prático
3. **Cache API** - Para assets, não dados
4. **SQLite (WASM)** - Poderoso, pesado

### Decisão
Escolhemos **IndexedDB via Dexie.js** porque:

1. **Capacidade**: Sem limite de 5MB
2. **Assíncrono**: Não bloqueia UI
3. **Queries**: Suporta índices e busca
4. **Dexie**: API muito mais amigável que nativa

### Consequências

**Positivas:**
- Cache de eleitores ilimitado
- Busca local rápida
- Funciona offline (leitura)

**Negativas:**
- Complexidade vs localStorage
- Sincronização com servidor necessária
- Debugging mais difícil

### Implementação

```typescript
// lib/db.ts
import Dexie from 'dexie';

class AppDB extends Dexie {
  eleitores!: Dexie.Table<Eleitor, string>;

  constructor() {
    super('PesquisaEleitoralDB');
    this.version(1).stores({
      eleitores: 'id, regiao_administrativa, orientacao_politica',
    });
  }
}

export const db = new AppDB();

// Uso
await db.eleitores.bulkPut(eleitoresDoServidor);
const ceilandia = await db.eleitores
  .where('regiao_administrativa')
  .equals('Ceilândia')
  .toArray();
```

---

## ADR-008: Regras Anti-Convergência

### Status
Aceito

### Contexto
LLMs treinados para segurança tendem a:
- Evitar posições fortes
- Buscar "equilíbrio"
- Ser excessivamente educados

Isso torna simulações eleitorais inúteis.

### Decisão
Implementamos **10 regras anti-convergência** explícitas no prompt:

1. Não seja educado demais
2. Não busque equilíbrio
3. Respeite tolerância a nuances
4. Permita desinformação
5. Permita extremismo
6. Reconheça motivações reais
7. Interesse baixo = resposta curta
8. Proíba auto-referência ao perfil
9. Permita gírias e erros
10. Permita evasão

### Fundamentação

Pesquisas mostram que eleitores reais:
- Votam por emoção (Westen, 2007)
- São mal-informados (Delli Carpini, 1996)
- Têm vieses fortes (Kahneman, 2011)

Ignorar isso distorce resultados.

### Consequências

**Positivas:**
- Respostas autênticas e diversas
- Simulação mais realista
- Insights sobre comportamento real

**Negativas:**
- Pode gerar conteúdo ofensivo
- Requer disclaimers claros
- Não adequado para todos os usos

### Considerações Éticas

O sistema inclui:
- Disclaimer que são simulações
- Proibição de uso para manipulação
- Documentação de limitações

---

## Template para Novas ADRs

```markdown
## ADR-XXX: [Título]

### Status
[Proposto | Aceito | Deprecado | Substituído por ADR-YYY]

### Contexto
[Qual problema estamos resolvendo?]

### Decisão
[O que decidimos fazer?]

### Consequências

**Positivas:**
- ...

**Negativas:**
- ...

### Notas Adicionais
[Referências, código de exemplo, etc.]
```

---

*Última atualização: Janeiro 2026*
