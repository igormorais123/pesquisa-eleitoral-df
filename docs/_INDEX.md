# > GPS IA: Documentacao do Projeto

**Tipo**: Documentacao Markdown, PDF, DOCX  
**Proposito**: Guias de usuario, API, arquitetura e operacoes

---

## Navegacao Rapida

| Destino | Descricao |
|---------|-----------|
| [Raiz](../_INDEX.md) | Voltar ao indice principal |
| [Backend](../backend/_INDEX.md) | API FastAPI |
| [Frontend](../frontend/_INDEX.md) | Next.js App |
| [Scripts](../scripts/_INDEX.md) | Scripts utilitarios |

---

## Documentacao Principal

| Arquivo | Descricao |
|---------|-----------|
| [README.md](README.md) | Indice completo da documentacao |
| [glossario.md](glossario.md) | Termos tecnicos explicados |
| [faq.md](faq.md) | Perguntas frequentes |
| [plano-implementacao-por-fases.md](plano-implementacao-por-fases.md) | Roadmap do projeto |

---

## Guia do Usuario (/guia-usuario)

Documentacao para usuarios nao-tecnicos:

| Arquivo | Descricao |
|---------|-----------|
| [01-primeiros-passos.md](guia-usuario/01-primeiros-passos.md) | Como comecar a usar o sistema |
| [02-entendendo-eleitores.md](guia-usuario/02-entendendo-eleitores.md) | Sobre os 1000 agentes sinteticos |
| [03-criando-entrevistas.md](guia-usuario/03-criando-entrevistas.md) | Passo a passo para pesquisas |
| [04-interpretando-resultados.md](guia-usuario/04-interpretando-resultados.md) | Como ler graficos e insights |

---

## Documentacao da API (/api)

| Arquivo | Descricao |
|---------|-----------|
| [README.md](api/README.md) | Endpoints, schemas e autenticacao |
| [exemplos.md](api/exemplos.md) | Exemplos cURL, Python, JavaScript |

**Docs Interativos** (quando backend rodando):
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Sistema Cognitivo (/cognicao)

Como os agentes de IA "pensam":

| Arquivo | Descricao |
|---------|-----------|
| [4-etapas-cognitivas.md](cognicao/4-etapas-cognitivas.md) | Chain of Thought dos agentes |
| [regras-anti-convergencia.md](cognicao/regras-anti-convergencia.md) | Evita respostas genericas |

---

## Agentes e Customizacao (/agentes)

| Arquivo | Descricao |
|---------|-----------|
| [README.md](agentes/README.md) | Schema de eleitores e exemplos |

---

## Deployment e Operacoes (/deployment)

| Arquivo | Descricao |
|---------|-----------|
| [README.md](deployment/README.md) | Docker, manual, producao |
| [variaveis-ambiente.md](deployment/variaveis-ambiente.md) | Todas as configuracoes .env |
| [troubleshooting.md](deployment/troubleshooting.md) | Resolucao de problemas |
| [backup-restore.md](deployment/backup-restore.md) | Protecao de dados |

---

## Arquitetura (/arquitetura)

| Arquivo | Descricao |
|---------|-----------|
| [performance.md](arquitetura/performance.md) | Otimizacao e escalabilidade |
| [adrs.md](arquitetura/adrs.md) | Architecture Decision Records |

---

## Documentacao de Gestores (/gestores)

Documentacao especifica para gestores publicos:

| Pasta | Descricao |
|-------|-----------|
| [README.md](gestores/README.md) | Indice da documentacao de gestores |
| [prompts/](gestores/prompts/) | Prompts originais usados |
| [personas/](gestores/personas/) | Personas publicas e privadas |
| [metodologia/](gestores/metodologia/) | Verificacao de coerencia |

### Arquivos Principais

| Arquivo | Descricao |
|---------|-----------|
| [PROMPTS_ORIGINAIS.md](gestores/prompts/PROMPTS_ORIGINAIS.md) | Prompts usados na geracao |
| [PERSONAS_PUBLICO_COMPLETO.md](gestores/personas/PERSONAS_PUBLICO_COMPLETO.md) | Personas publicas |
| [PERSONAS_PRIVADO_COMPLETO.md](gestores/personas/PERSONAS_PRIVADO_COMPLETO.md) | Personas privadas |
| [VERIFICACAO_COERENCIA_PERSONAS.md](gestores/metodologia/VERIFICACAO_COERENCIA_PERSONAS.md) | Validacao de coerencia |
| [CONTEXTO_ARTIGO.md](gestores/metodologia/CONTEXTO_ARTIGO.md) | Contexto para artigos |

---

## Documentos Especiais

| Arquivo | Descricao |
|---------|-----------|
| [Ficha Tecnica do Instrumento de Pesquisa.md](Ficha%20Técnica%20do%20Instrumento%20de%20Pesquisa.md) | Metodologia da pesquisa |
| [INSTRUCOES_FASE1_PESQUISA_ELEITORAL.md](INSTRUCOES_FASE1_PESQUISA_ELEITORAL.md) | Instrucoes da Fase 1 |
| [Registro_Tecnico_Completo_N295_v2.docx](Registro_Tecnico_Completo_N295_v2.docx) | Registro tecnico (Word) |
| [Legislacao Eleitoral e WhatsApp para Campanhas.pdf](Legislação%20Eleitoral%20e%20WhatsApp%20para%20Campanhas.pdf) | Legislacao eleitoral (PDF) |

---

## Acesso Rapido

### Credenciais de Demo
```
Usuario: admin
Senha: admin123
```

### URLs Locais
| Servico | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |

### URLs Producao
| Servico | URL |
|---------|-----|
| Frontend | https://pesquisa-eleitoral-df-igormorais123s-projects.vercel.app |
| Backend | https://pesquisa-eleitoral-df-1.onrender.com |
