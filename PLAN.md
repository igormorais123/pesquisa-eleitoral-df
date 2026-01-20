# Plano de Implementação - Melhorias Sistema Pesquisa Eleitoral DF

## Resumo das Mudanças Solicitadas

1. **Gerador Unificado**: Permitir gerar gestores além de eleitores (já existe, mas precisa integrar melhor)
2. **Prompts para Template**: Gerar prompts que vão direto para o template
3. **IA na Pesquisa**: Usar IA para gerar outras coisas na pesquisa
4. **Remover aba "Nova Entrevista"**: Não faz sentido
5. **Reorganizar Menu**: ADM, Usuário e Configurações no perfil superior direito
6. **Melhorar Perfil Usuário**: Seguir padrão SaaS típico
7. **Reação a Notícias**: Nova funcionalidade para buscar notícias do DF e coletar reações

---

## Fase 1: Reorganização da Interface

### 1.1 Remover aba "Nova Entrevista"
- **Arquivo**: `frontend/src/components/Navigation.tsx`
- **Ação**: Remover item "Nova Entrevista" do menu lateral
- **Arquivo**: `frontend/src/App.tsx`
- **Ação**: Remover rota correspondente

### 1.2 Mover itens para Perfil Superior Direito
- **Arquivo**: `frontend/src/components/Header.tsx`
- **Ações**:
  - Criar dropdown menu no perfil do usuário
  - Incluir: Meu Perfil, Configurações, Administração (se admin), Sair
  - Estilo SaaS moderno (avatar, nome, seta dropdown)
- **Arquivo**: `frontend/src/components/Navigation.tsx`
- **Ação**: Remover ADM, Usuário e Configurações do menu lateral

---

## Fase 2: Gerador Unificado de Personas

### 2.1 Refatorar GeradorEleitores para Gerador Unificado
- **Arquivo**: `frontend/src/pages/GeradorEleitores.tsx`
- **Ações**:
  - Renomear para `GeradorPersonas.tsx`
  - Adicionar tabs/seletor: Eleitores | Gestores | Parlamentares | Candidatos
  - Formulário dinâmico baseado no tipo selecionado
  - Reutilizar lógica existente de `gerar_eleitores.py` e `gerar_gestores.py`

### 2.2 Backend - Endpoints Unificados
- **Arquivo**: `backend/app/api/geradores.py` (novo)
- **Ações**:
  - POST `/api/gerar/eleitores` - já existe
  - POST `/api/gerar/gestores` - criar
  - POST `/api/gerar/parlamentares` - criar
  - POST `/api/gerar/candidatos` - criar

### 2.3 Gerar Prompts para Template
- **Arquivo**: `backend/app/services/prompt_generator.py` (novo)
- **Ações**:
  - Gerar prompts formatados para cada tipo de persona
  - Exportar em formato compatível com templates existentes
  - Salvar em `prompts/` com estrutura organizada

---

## Fase 3: Módulo de Reação a Notícias

### 3.1 Componente de Busca de Notícias
- **Arquivo**: `frontend/src/pages/ReacaoNoticias.tsx` (novo)
- **Funcionalidades**:
  - Painel de notícias recentes do DF (busca automática)
  - Seletor de período (últimos 7 dias, 30 dias, personalizado)
  - Filtros por categoria (política, economia, segurança, etc.)
  - Lista de notícias selecionáveis

### 3.2 Backend - Serviço de Notícias
- **Arquivo**: `backend/app/services/news_service.py` (novo)
- **Ações**:
  - Integração com APIs de notícias (NewsAPI, Google News, RSS feeds locais)
  - Cache de notícias para performance
  - Filtros por região (DF/Brasília), período e categoria
  - Análise de impacto potencial em candidatos

### 3.3 Geração de Reações com IA
- **Arquivo**: `backend/app/services/reaction_generator.py` (novo)
- **Ações**:
  - Receber lista de notícias selecionadas
  - Receber lista de eleitores/candidatos selecionados
  - Gerar prompt específico para reação
  - Processar com IA (Claude/OpenAI)
  - Salvar reações no banco

### 3.4 Interface de Coleta de Reações
- **Componentes**:
  - Seletor de notícias (checkboxes)
  - Seletor de personas (eleitores/candidatos)
  - Prompt customizável para reação
  - Visualização das reações geradas
  - Timeline de reações ao longo do tempo

---

## Fase 4: Melhorias no Perfil do Usuário (SaaS)

### 4.1 Header Redesenhado
- **Arquivo**: `frontend/src/components/Header.tsx`
- **Design**:
  ```
  [Logo] [Busca Global]                    [Notificações] [Avatar▼]
                                                          ├─ Meu Perfil
                                                          ├─ Configurações
                                                          ├─ Administração*
                                                          └─ Sair
  ```

### 4.2 Componentes Novos
- `frontend/src/components/UserDropdown.tsx` - Menu dropdown do usuário
- `frontend/src/components/NotificationBell.tsx` - Sino de notificações
- `frontend/src/components/GlobalSearch.tsx` - Busca global (opcional)

---

## Fase 5: Integração com IA para Pesquisa

### 5.1 Serviço de IA Centralizado
- **Arquivo**: `backend/app/services/ai_service.py` (novo)
- **Funcionalidades**:
  - Geração de personas com IA
  - Análise de sentimento de respostas
  - Sugestões de perguntas
  - Resumos automáticos de pesquisas
  - Geração de insights

### 5.2 Endpoints de IA
- POST `/api/ai/gerar-personas` - Gerar personas com IA
- POST `/api/ai/analisar-respostas` - Análise de sentimento
- POST `/api/ai/sugerir-perguntas` - Sugestões baseadas em contexto
- POST `/api/ai/gerar-insights` - Insights automáticos

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `frontend/src/components/Navigation.tsx` | Remover itens, simplificar |
| `frontend/src/components/Header.tsx` | Adicionar dropdown, notificações |
| `frontend/src/pages/GeradorEleitores.tsx` | Transformar em GeradorPersonas |
| `frontend/src/App.tsx` | Atualizar rotas |
| `backend/app/api/__init__.py` | Registrar novos endpoints |

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `frontend/src/components/UserDropdown.tsx` | Menu do usuário |
| `frontend/src/pages/ReacaoNoticias.tsx` | Módulo de notícias |
| `backend/app/services/news_service.py` | Busca de notícias |
| `backend/app/services/reaction_generator.py` | Geração de reações |
| `backend/app/services/ai_service.py` | Serviço centralizado de IA |
| `backend/app/api/noticias.py` | Endpoints de notícias |

## Arquivos a Remover

| Arquivo | Motivo |
|---------|--------|
| Rota "Nova Entrevista" | Não faz sentido |

---

## Ordem de Implementação

1. **Fase 1** - Reorganização da Interface (UI cleanup)
2. **Fase 4** - Perfil do Usuário (melhoria visual)
3. **Fase 2** - Gerador Unificado (funcionalidade core)
4. **Fase 3** - Reação a Notícias (nova feature)
5. **Fase 5** - Integração IA (melhorias avançadas)

---

## Permissões Necessárias

- Executar comandos npm/yarn para build do frontend
- Executar Python para testes do backend
- Instalar dependências se necessário
