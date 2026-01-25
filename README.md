# Pesquisa Eleitoral DF 2026

Sistema de simulação de pesquisas eleitorais usando **1000+ agentes de IA** que representam perfis sintéticos de eleitores do Distrito Federal.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Funcionalidades

- **1000+ Eleitores Sintéticos**: Perfis realistas com 60+ atributos cada
- **Sistema Cognitivo**: Agentes respondem usando processo de 4 etapas
- **20+ Filtros**: Segmente por região, idade, renda, orientação política
- **Múltiplos Tipos de Pergunta**: Escala, múltipla escolha, aberta, sim/não
- **Análises Automáticas**: Estatísticas, sentimentos, correlações, insights
- **Exportação**: Excel, PDF, JSON

## Início Rápido

### Com Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/igormorais123/pesquisa-eleitoral-df.git
cd pesquisa-eleitoral-df

# Configure as variáveis
cp .env.example .env
# Edite .env e adicione sua CLAUDE_API_KEY

# Inicie
docker-compose up -d
```

Acesse: **http://localhost:3000** (usuário: `admin`, senha: `admin123`)

### Manual

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Documentação

📚 **[Documentação Completa](docs/README.md)** - Guias, tutoriais e referência técnica

### Guias Principais

| Documento | Descrição |
|-----------|-----------|
| [Primeiros Passos](docs/guia-usuario/01-primeiros-passos.md) | Tutorial de 10 minutos |
| [Referência da API](docs/api/README.md) | Endpoints e exemplos |
| [Deployment](docs/deployment/README.md) | Docker, produção, Nginx |
| [FAQ](docs/faq.md) | Perguntas frequentes |

### API Interativa

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `CLAUDE_API_KEY` | ✅ | Chave da API Anthropic |
| `SECRET_KEY` | ✅ | Chave secreta para JWT |
| `DATABASE_URL` | ❌ | URL do PostgreSQL (padrão: localhost) |
| `FRONTEND_URL` | ❌ | URL do frontend (padrão: localhost:3000) |

Veja: [Guia completo de variáveis](docs/deployment/variaveis-ambiente.md)

## Arquitetura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Claude API │
│   Next.js   │     │   FastAPI   │     │  (Anthropic)│
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                    ┌─────▼─────┐
                    │ PostgreSQL│
                    └───────────┘
```

## Tecnologias

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Zustand |
| **Backend** | FastAPI, SQLAlchemy 2.0, Pydantic |
| **Banco** | PostgreSQL 15 |
| **IA** | Claude API (Sonnet 4.5, Opus 4.5) |
| **Infra** | Docker, Docker Compose |

## Deploy em Produção

### Backend (Render)

1. Acesse [render.com](https://render.com)
2. **New** → **Web Service** → Conecte o repositório
3. **Root Directory**: `backend`, **Runtime**: Docker
4. Adicione variáveis de ambiente
5. **Create Web Service**

### Frontend (Vercel)

1. Acesse [vercel.com](https://vercel.com)
2. **Add New** → **Project** → Selecione o repositório
3. **Root Directory**: `frontend`
4. Adicione `NEXT_PUBLIC_API_URL` = URL do backend
5. **Deploy**

Veja: [Guia completo de deployment](docs/deployment/README.md)

## Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Autor

**Professor Igor** - [GitHub](https://github.com/igormorais123)

---

<p align="center">
  <a href="docs/README.md">📚 Documentação</a> •
  <a href="docs/faq.md">❓ FAQ</a> •
  <a href="https://github.com/igormorais123/pesquisa-eleitoral-df/issues">🐛 Issues</a>
</p>
