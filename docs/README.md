# Documentação - Pesquisa Eleitoral DF 2026

Sistema de simulação de pesquisa eleitoral com agentes sintéticos de IA para as eleições de Governador do Distrito Federal 2026.

---

## Índice da Documentação

### Para Usuários (Não-Técnico)

| Documento | Descrição |
|-----------|-----------|
| [Guia de Primeiros Passos](guia-usuario/01-primeiros-passos.md) | Como começar a usar o sistema |
| [Entendendo os Eleitores](guia-usuario/02-entendendo-eleitores.md) | Os 1000 agentes sintéticos |
| [Criando Entrevistas](guia-usuario/03-criando-entrevistas.md) | Passo a passo para criar pesquisas |
| [Interpretando Resultados](guia-usuario/04-interpretando-resultados.md) | Como ler gráficos e insights |
| [Glossário](glossario.md) | Termos técnicos explicados |
| [FAQ](faq.md) | Perguntas frequentes |

### Para Desenvolvedores (Técnico)

| Documento | Descrição |
|-----------|-----------|
| [Referência da API](api/README.md) | Endpoints, exemplos e schemas |
| [Exemplos de Código](api/exemplos.md) | cURL, Python, JavaScript |
| [Sistema Cognitivo](cognicao/4-etapas-cognitivas.md) | Como os agentes "pensam" |
| [Regras Anti-Convergência](cognicao/regras-anti-convergencia.md) | Por que evitar respostas genéricas |
| [Customização de Agentes](agentes/README.md) | Criar e modificar eleitores |

### Operações e Deploy

| Documento | Descrição |
|-----------|-----------|
| [Guia de Deployment](deployment/README.md) | Docker, manual, produção |
| [Variáveis de Ambiente](deployment/variaveis-ambiente.md) | Todas as configurações |
| [Troubleshooting](deployment/troubleshooting.md) | Resolução de problemas |
| [Backup e Restore](deployment/backup-restore.md) | Proteção de dados |

### Arquitetura

| Documento | Descrição |
|-----------|-----------|
| [Performance e Scaling](arquitetura/performance.md) | Otimização e escalabilidade |
| [ADRs](arquitetura/adrs.md) | Decisões arquiteturais documentadas |

### Documentação Interativa

O sistema inclui documentação interativa da API:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Acesso Rápido

### Credenciais de Demonstração

```
Usuário: admin
Senha: admin123
```

### URLs Principais

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

### Comandos Essenciais

```bash
# Iniciar com Docker
docker-compose up -d

# Iniciar manualmente
cd backend && python -m uvicorn app.main:app --reload
cd frontend && npm run dev
```

---

## Estrutura da Documentação

```
docs/
├── README.md                    # Este arquivo (índice)
├── glossario.md                 # Termos técnicos explicados
├── faq.md                       # Perguntas frequentes
├── guia-usuario/                # Para não-programadores
│   ├── 01-primeiros-passos.md   # Tutorial inicial
│   ├── 02-entendendo-eleitores.md
│   ├── 03-criando-entrevistas.md
│   └── 04-interpretando-resultados.md
├── api/                         # Referência técnica
│   ├── README.md                # Endpoints e schemas
│   └── exemplos.md              # Código Python, JS, cURL
├── cognicao/                    # Sistema de agentes
│   ├── 4-etapas-cognitivas.md   # Chain of Thought
│   └── regras-anti-convergencia.md
├── agentes/                     # Customização
│   └── README.md                # Schema e exemplos
├── deployment/                  # Operações
│   ├── README.md                # Docker, manual, produção
│   ├── variaveis-ambiente.md    # Configurações
│   ├── troubleshooting.md       # Resolução de problemas
│   └── backup-restore.md        # Proteção de dados
└── arquitetura/                 # Decisões técnicas
    ├── performance.md           # Scaling e otimização
    └── adrs.md                  # Architecture Decision Records
```

---

## Sobre o Projeto

O **Pesquisa Eleitoral DF 2026** simula pesquisas eleitorais usando 1000+ agentes de IA que representam eleitores realistas do Distrito Federal. Cada agente tem um perfil completo com 60+ atributos incluindo:

- Dados demográficos e socioeconômicos
- Orientação política e posicionamento
- Valores, medos e preocupações
- Vieses cognitivos e susceptibilidade a desinformação
- História de vida e comportamento esperado

Os agentes respondem a perguntas de pesquisa usando um processo cognitivo de 4 etapas que simula como eleitores reais processam informação política.

---

## Suporte

- **Issues**: [GitHub Issues](https://github.com/igormorais123/pesquisa-eleitoral-df/issues)
- **Autor**: Professor Igor
