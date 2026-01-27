# PRD - Pesquisa Eleitoral DF 2026

## Visão Executiva

**Pesquisa Eleitoral DF 2026** é uma plataforma full-stack que simula pesquisas eleitorais usando mais de 1000 agentes IA que representam eleitores sintéticos do Distrito Federal. Cada eleitor possui 60+ atributos demográficos, socioeconômicos, políticos e psicológicos, permitindo respostas realistas e estatisticamente válidas.

---

## Missão e Princípios

**Missão:** Fornecer inteligência eleitoral baseada em IA para campanhas políticas no Distrito Federal, com metodologia científica e validação estatística.

**Cinco Princípios Core:**
1. **Precisão Estatística** — Margem de erro calculada, amostragem estratificada
2. **Realismo dos Agentes** — Personas com 60+ atributos baseados em dados reais do DF
3. **Privacidade** — Dados sintéticos, sem informações pessoais reais
4. **Agilidade** — Pesquisas executadas em minutos, não semanas
5. **Visualização Clara** — Relatórios seguindo padrão visual INTEIA

---

## Persona Alvo

**Usuário Principal:** Estrategista político / Marqueteiro eleitoral

- Precisa de dados de intenção de voto atualizados
- Quer entender segmentos específicos (região, classe, idade)
- Valoriza metodologia científica defensável
- Necessita de relatórios profissionais para apresentar a candidatos

---

## Funcionalidades MVP

### Implementado ✅
- Banco de 1000+ eleitores sintéticos do DF
- Visualização e filtros de eleitores
- Execução de entrevistas via Claude API
- Geração de relatórios HTML (padrão INTEIA)
- Autenticação JWT
- Dashboard com estatísticas

### Fora do Escopo (Futuro)
- Pesquisas de segundo turno
- Comparativo temporal automático
- Integração com dados reais do TSE
- App mobile
- Multi-tenancy (múltiplos clientes)

---

## Arquitetura Técnica

### Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind, shadcn/ui |
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| Banco | PostgreSQL 15 |
| IA | Anthropic Claude (Opus 4.5, Sonnet 4) |
| Auth | JWT + bcrypt |
| Deploy | Vercel (frontend) + Render (backend) |

### Estrutura de Diretórios

```
pesquisa-eleitoral-df/
├── frontend/              # Next.js 14 App Router
│   ├── src/app/          # Páginas e rotas
│   ├── src/components/   # Componentes React
│   └── src/lib/claude/   # Cliente Claude
├── backend/               # FastAPI
│   ├── app/api/rotas/    # Endpoints REST
│   ├── app/servicos/     # Lógica de negócio
│   └── app/esquemas/     # Pydantic models
├── agentes/               # Dados dos eleitores
│   └── banco-eleitores-df.json
├── scripts/               # Scripts de geração
└── .claude/               # Configuração Claude Code
```

---

## Modelo de Dados

### Eleitor Sintético (60+ atributos)

```json
{
  "id": 1,
  "nome": "Maria Silva",
  "idade": 42,
  "genero": "feminino",
  "cor_raca": "parda",
  "regiao_administrativa": "Ceilândia",
  "cluster_socioeconomico": "C",
  "escolaridade": "ensino_medio_completo",
  "renda_familiar": "2000-4000",
  "orientacao_politica": 2,
  "posicao_bolsonaro": -2,
  "interesse_politico": "medio",
  "vieses_cognitivos": ["confirmacao", "disponibilidade"],
  "medos": ["desemprego", "violencia"],
  "valores": ["familia", "seguranca"],
  "fontes_informacao": ["whatsapp", "tv_aberta"],
  "susceptibilidade_desinformacao": "media"
}
```

### Entrevista

```json
{
  "id": 1,
  "eleitor_id": 42,
  "pesquisa_id": 1,
  "pergunta": "Em quem você votaria para governador?",
  "resposta": "Ainda estou indeciso, mas...",
  "modelo_usado": "claude-sonnet-4-20250514",
  "created_at": "2026-01-26T10:00:00Z"
}
```

---

## Endpoints API

| Rota | Método | Propósito |
|------|--------|-----------|
| `/api/v1/auth/login` | POST | Autenticação JWT |
| `/api/v1/eleitores` | GET | Listar eleitores com filtros |
| `/api/v1/eleitores/{id}` | GET | Detalhe de eleitor |
| `/api/v1/eleitores/estatisticas` | GET | Estatísticas agregadas |
| `/api/v1/entrevistas` | POST | Criar entrevista |
| `/api/v1/entrevistas/{id}/executar` | POST | Executar via Claude |
| `/api/v1/resultados` | GET | Resultados agregados |
| `/api/v1/resultados/exportar` | GET | Exportar XLSX/PDF |

---

## Fluxo de Pesquisa

```
1. Usuário define parâmetros
   ↓
2. Sistema seleciona amostra estratificada
   ↓
3. Para cada eleitor na amostra:
   - Constrói prompt com persona completa
   - Envia para Claude API
   - Armazena resposta
   ↓
4. Agregação de resultados
   - Por candidato
   - Por segmento (região, classe, idade)
   ↓
5. Geração de relatório
   - HTML interativo (padrão INTEIA)
   - Exportação PDF/XLSX
```

---

## Métricas de Sucesso

### Funcionalidade
- [ ] Executar pesquisa com 500 eleitores em < 30 min
- [ ] Gerar relatório completo em < 5 min
- [ ] Margem de erro < 5% para amostra de 500

### Performance
- [ ] Página de eleitores carrega em < 2s
- [ ] API responde em < 500ms (sem Claude)
- [ ] Relatório renderiza em < 3s

### Qualidade
- [ ] 0 erros de lint
- [ ] Cobertura de testes > 70%
- [ ] 0 vulnerabilidades críticas

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Custos Claude API | Usar Sonnet para volume, Opus para análise |
| Respostas inconsistentes | Prompts detalhados, validação de resposta |
| Viés nos eleitores sintéticos | Base em dados reais IBGE/PDAD-DF |
| Interpretação errônea | Disclaimers claros nos relatórios |
| Rate limiting API | Batch processing com semáforos |

---

## Evolução Futura

1. **Pesquisas comparativas** — Série temporal automática
2. **Segmentos customizados** — Clusters definidos pelo usuário
3. **Integração TSE** — Dados reais de votação
4. **Multi-região** — Expandir para outros estados
5. **White-label** — Personalização por cliente

---

## Informações do Projeto

**Empresa:** INTEIA - Inteligência Estratégica
**CNPJ:** 63.918.490/0001-20
**Responsável:** Igor Morais Vasconcelos
**Contato:** igor@inteia.com.br
**Site:** inteia.com.br

---

© 2026 INTEIA. Todos os direitos reservados.
