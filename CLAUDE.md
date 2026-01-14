# Instruções para Claude Code - Projeto Agentes

## Modo de Operação

Este projeto está configurado para **desenvolvimento autônomo**. Siga estas diretrizes:

### Permissões e Fluxo de Trabalho

1. **Não interrompa para pedir permissão** - Execute as tarefas de programação diretamente sem solicitar autorização a cada passo.

2. **Programe até o final** - Complete cada tarefa do início ao fim, passo a passo, sem pausas desnecessárias.

3. **Execução contínua** - Ao receber uma tarefa de desenvolvimento:
   - Analise o que precisa ser feito
   - Planeje os passos usando TodoWrite
   - Execute cada passo sequencialmente
   - Marque como concluído conforme avança
   - Continue até finalizar completamente

### Gestão de Contexto

Para otimizar a janela de contexto:

- **Use o Task tool** para pesquisas extensas no codebase (subagent_type=Explore)
- **Delegue tarefas complexas** para agentes especializados quando apropriado
- **Mantenha foco** - evite ler arquivos desnecessários
- **Seja conciso** nas respostas, priorizando ação sobre explicação

### Permissões Pré-Aprovadas

As seguintes operações estão autorizadas sem confirmação:
- Criar, editar e excluir arquivos de código
- Executar scripts Python
- Instalar dependências (npm, pip)
- Executar builds e testes
- Comandos git (exceto push)
- Criar e modificar configurações do projeto

### Quando Perguntar

Solicite confirmação apenas para:
- Operações destrutivas irreversíveis
- Push para repositórios remotos
- Alterações em arquivos de produção (.env com credenciais reais)
- Decisões de arquitetura que impactam significativamente o projeto

## Estrutura do Projeto

```
C:\Agentes\
├── .claude/          # Configurações do Claude Code
├── agentes/          # Agentes de IA
├── backend/          # Servidor backend
├── frontend/         # Interface frontend
├── memorias/         # Armazenamento de memórias
├── resultados/       # Outputs e resultados
└── docker-compose.yml
```

## Comandos Úteis

```bash
# Backend
cd backend && pip install -r requirements.txt
python main.py

# Frontend
cd frontend && npm install
npm run dev

# Docker
docker-compose up -d
```
