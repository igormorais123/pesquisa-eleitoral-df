Preferencias do usuario:
- Sempre responder em portugues do Brasil.
- Sou iniciante: evite termos tecnicos; quando usar, explique em linguagem simples.
- Sempre recomende a melhor opcao e explique por que escolheu.
- Quando houver alternativas, apresente 2-3 opcoes e explique os fatores de escolha.
- Nao apresentar como fato nada que nao possa verificar.
- Nao parafrasear minha entrada, a menos que eu peca.
- Seja meu parceiro de raciocinio: identifique pontos cegos e perguntas subjacentes.
- Para perguntas simples, responda de forma simples e direta.
- Use termos tecnicos em portugues quando possivel.
- Mantenha a pasta atualizada sempre com versão mais atual.
- Frontend com padrão aplle, inspirado no site aplle.com.br sempre se inspire nesse site nos modelos. 
- Sempre que possivel use as skills disponíveis. 

Comandos basicos recomendados (o que fazem e quando usar):
- `npm install`: instala as dependencias do frontend. Use quando abrir o projeto pela primeira vez ou apos atualizar o codigo.
- `npm run dev`: inicia o frontend em modo desenvolvimento. Use para ver o site no navegador enquanto trabalha.
- `npm run lint`: verifica erros de estilo e padroes de codigo no frontend. Use antes de enviar mudancas.
- `npm run build`: gera a versao de producao do frontend. Use antes de publicar ou quando quiser validar o build.
- `pip install -r requirements.txt`: instala dependencias do backend. Use ao iniciar o backend pela primeira vez.
- `python -m uvicorn app.main:app --reload --port 8000`: inicia a API do backend com recarga automatica. Use para testar a API localmente.
- `pytest`: executa os testes automaticos do backend. Use quando mudar regras de negocio ou endpoints.
- `docker-compose up -d`: sobe tudo junto com Docker. Use quando quiser frontend + backend + banco com um comando.
- `docker-compose down`: para os servicos do Docker. Use quando terminar e quiser liberar recursos.
- `git status`: mostra o que mudou no codigo. Use antes de salvar ou enviar mudancas.
- `git add .`: prepara todas as mudancas para o commit. Use antes do commit.
- `git commit -m "mensagem"`: salva um ponto no historico. Use quando terminar uma parte do trabalho.
- `git push`: envia as mudancas para o repositorio remoto. Use depois do commit.

Diagnostico atual (nao executar agora):
- Banco: o backend pode apontar para banco remoto (Render) e isso quebra testes locais. Melhor usar `.env.local` com banco local.
- Banco: ha erro de schema em `respostas_pesquisa` (tipo diferente entre `pesquisas.id` e `respostas_pesquisa.pesquisa_id`).
- Banco: existem dois conjuntos de modelos e duas classes Base, com IDs de tipos diferentes.
- Dados: se a tabela de eleitores estiver vazia, testes e telas nao funcionam.
- Auth: ha usuario admin de teste e `SECRET_KEY` padrao no backend e no frontend.
- Dados sensiveis: Google OAuth salva dados em JSON local e esse arquivo nao esta no .gitignore.
- Frontend: lint atualmente sem avisos.
- Dependencias: `npm audit` apontou vulnerabilidades (inclui `xlsx` sem fix automatico).
- Warnings: ainda aparecem avisos de `datetime.utcnow()` vindos do Pydantic durante o pytest.

Sugestoes recomendadas (ordem simples):
- 1) Garantir banco local ativo e usar `.env.local`.
- 2) Se usar pesquisas, alinhar o schema do banco ou recriar o banco local.
- 3) Atualizar avisos do Pydantic e `datetime.utcnow()`.
- 4) Trocar `<img>` por `next/image` no login.
- 5) Revisar dependencias vulneraveis com cuidado.
