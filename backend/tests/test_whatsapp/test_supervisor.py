"""
Testes para o módulo supervisor — Oráculo Eleitoral.

Testa criação do grafo LangGraph, singleton, invocação do supervisor
e tratamento de erros quando dependências não estão disponíveis.
Todas as dependências externas (LangGraph, Anthropic) são mockadas.
"""

import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


# =============================================
# Garantir que todas as dependências dos agentes estão mockadas.
# O módulo supervisor.py importa langchain_core, langchain_anthropic,
# e vários prompts/ferramentas que por sua vez dependem de langchain_core.
# =============================================

_modules_to_mock = [
    "langchain_core",
    "langchain_core.tools",
    "langchain_anthropic",
    "langgraph",
    "langgraph.prebuilt",
    "langgraph_supervisor",
]

_original_modules = {}
for mod_name in _modules_to_mock:
    if mod_name not in sys.modules:
        _mock_mod = MagicMock()
        # Para o decorator @tool, criar um decorator passthrough
        if mod_name == "langchain_core.tools":
            def _mock_tool(func=None, *args, **kwargs):
                if func is None:
                    return lambda f: _mock_tool(f, *args, **kwargs)

                def invoke(input_dict):
                    return func(**input_dict)

                func.invoke = invoke
                return func

            _mock_mod.tool = _mock_tool
        sys.modules[mod_name] = _mock_mod
        _original_modules[mod_name] = None
    else:
        _original_modules[mod_name] = sys.modules[mod_name]


# =============================================
# Fixtures
# =============================================


@pytest.fixture
def mock_grafo():
    """Mock de um grafo LangGraph compilado."""
    grafo = MagicMock()
    # Configurar invocação assíncrona
    msg_mock = MagicMock()
    msg_mock.content = "Resposta do agente para a pergunta."
    msg_mock.name = "oraculo_dados"
    grafo.ainvoke = AsyncMock(return_value={
        "messages": [msg_mock],
    })
    return grafo


@pytest.fixture(autouse=True)
def limpar_singleton():
    """Limpa o singleton do grafo supervisor antes de cada teste."""
    import app.agentes.supervisor as mod

    mod._grafo_supervisor = None
    yield
    mod._grafo_supervisor = None


# =============================================
# Testes
# =============================================


def test_criar_grafo_supervisor_sucesso():
    """criar_grafo_supervisor() deve retornar um grafo compilado quando dependências estão ok."""
    import app.agentes.supervisor as mod

    # Mockar as dependências que são importadas dentro de criar_grafo_supervisor()
    mock_chat = MagicMock()
    mock_agent = MagicMock()
    mock_supervisor_instance = MagicMock()
    mock_grafo_compilado = MagicMock()
    mock_supervisor_instance.compile.return_value = mock_grafo_compilado

    with patch("builtins.__import__", wraps=__builtins__.__import__ if hasattr(__builtins__, '__import__') else __import__):
        with patch.dict("sys.modules", {
            "langchain_anthropic": MagicMock(ChatAnthropic=MagicMock(return_value=mock_chat)),
            "langgraph.prebuilt": MagicMock(create_react_agent=MagicMock(return_value=mock_agent)),
            "langgraph_supervisor": MagicMock(create_supervisor=MagicMock(return_value=mock_supervisor_instance)),
        }):
            resultado = mod.criar_grafo_supervisor()

    # Deve retornar o grafo compilado
    assert resultado is mock_grafo_compilado


def test_criar_grafo_sem_dependencias():
    """criar_grafo_supervisor() retorna None quando imports falham."""
    import app.agentes.supervisor as mod

    # Salvar imports originais
    original_import = __builtins__.__import__ if hasattr(__builtins__, '__import__') else __import__

    def mock_import(name, *args, **kwargs):
        if name in ("langchain_anthropic", "langgraph.prebuilt", "langgraph_supervisor"):
            raise ImportError(f"Módulo {name} não instalado")
        return original_import(name, *args, **kwargs)

    with patch("builtins.__import__", side_effect=mock_import):
        resultado = mod.criar_grafo_supervisor()

    assert resultado is None


def test_obter_grafo_singleton(mock_grafo):
    """obter_grafo() deve retornar a mesma instância em chamadas repetidas."""
    import app.agentes.supervisor as mod

    # Definir o grafo manualmente no módulo
    mod._grafo_supervisor = mock_grafo

    resultado_1 = mod.obter_grafo()
    resultado_2 = mod.obter_grafo()

    # Deve retornar exatamente o mesmo objeto
    assert resultado_1 is resultado_2
    assert resultado_1 is mock_grafo


def test_obter_grafo_inicializa_lazy():
    """obter_grafo() deve chamar criar_grafo_supervisor() na primeira vez."""
    import app.agentes.supervisor as mod

    mock_grafo_criado = MagicMock()

    with patch.object(mod, "criar_grafo_supervisor", return_value=mock_grafo_criado) as mock_criar:
        resultado = mod.obter_grafo()

    mock_criar.assert_called_once()
    assert resultado is mock_grafo_criado


@pytest.mark.asyncio
async def test_invocar_supervisor_sucesso(mock_grafo):
    """invocar_supervisor() retorna dict com resposta, agente, tokens e custo."""
    import app.agentes.supervisor as mod

    # Definir o grafo mock como singleton
    mod._grafo_supervisor = mock_grafo

    resultado = await mod.invocar_supervisor(
        mensagem="Qual a intenção de voto do candidato A?",
        telefone="5561999999999",
        conversa_id=1,
    )

    assert isinstance(resultado, dict)
    assert "resposta" in resultado
    assert "agente" in resultado
    assert "tokens_entrada" in resultado
    assert "tokens_saida" in resultado
    assert "custo" in resultado

    # Verificar que o agente foi identificado
    assert resultado["agente"] == "oraculo_dados"
    # Verificar que a resposta não está vazia
    assert len(resultado["resposta"]) > 0
    # Verificar que tokens e custo são numéricos
    assert isinstance(resultado["tokens_entrada"], int)
    assert isinstance(resultado["tokens_saida"], int)
    assert isinstance(resultado["custo"], float)

    # Verificar que ainvoke foi chamado com a mensagem
    mock_grafo.ainvoke.assert_called_once()
    call_args = mock_grafo.ainvoke.call_args
    messages = call_args[0][0]["messages"]
    assert messages[0]["content"] == "Qual a intenção de voto do candidato A?"


@pytest.mark.asyncio
async def test_invocar_supervisor_grafo_indisponivel():
    """invocar_supervisor() retorna erro quando o grafo é None."""
    import app.agentes.supervisor as mod

    # Garantir que o grafo é None
    mod._grafo_supervisor = None

    with patch.object(mod, "criar_grafo_supervisor", return_value=None):
        resultado = await mod.invocar_supervisor(
            mensagem="Teste com grafo indisponível",
        )

    assert isinstance(resultado, dict)
    assert "resposta" in resultado
    assert resultado["agente"] == "erro"
    assert resultado["tokens_entrada"] == 0
    assert resultado["tokens_saida"] == 0
    assert resultado["custo"] == 0.0
    # A mensagem de resposta deve indicar indisponibilidade
    assert "indisponível" in resultado["resposta"].lower()


@pytest.mark.asyncio
async def test_invocar_supervisor_erro():
    """invocar_supervisor() retorna dict de erro quando exceção ocorre."""
    import app.agentes.supervisor as mod

    # Configurar grafo que levanta exceção
    mock_grafo_erro = MagicMock()
    mock_grafo_erro.ainvoke = AsyncMock(
        side_effect=Exception("Erro de conexão com API")
    )
    mod._grafo_supervisor = mock_grafo_erro

    resultado = await mod.invocar_supervisor(
        mensagem="Teste que gera erro",
        telefone="5561999999999",
    )

    assert isinstance(resultado, dict)
    assert "resposta" in resultado
    assert resultado["agente"] == "erro"
    assert resultado["tokens_entrada"] == 0
    assert resultado["tokens_saida"] == 0
    assert resultado["custo"] == 0.0
    # A mensagem deve indicar que houve um erro
    assert "erro" in resultado["resposta"].lower()


@pytest.mark.asyncio
async def test_invocar_supervisor_sem_conversa_id(mock_grafo):
    """invocar_supervisor() funciona sem conversa_id (sem checkpointing)."""
    import app.agentes.supervisor as mod

    mod._grafo_supervisor = mock_grafo

    resultado = await mod.invocar_supervisor(
        mensagem="Pergunta sem contexto de conversa",
    )

    assert isinstance(resultado, dict)
    assert "resposta" in resultado
    assert len(resultado["resposta"]) > 0

    # Verificar que ainvoke foi chamado
    mock_grafo.ainvoke.assert_called_once()
    call_args = mock_grafo.ainvoke.call_args
    # Sem conversa_id, config deve ser vazio
    config = call_args[0][1] if len(call_args[0]) > 1 else call_args[1].get("config", {})
    assert config == {} or "configurable" not in config


@pytest.mark.asyncio
async def test_invocar_supervisor_resposta_dict(mock_grafo):
    """invocar_supervisor() lida com mensagens no formato dict (sem atributos)."""
    import app.agentes.supervisor as mod

    # Configurar resposta como dict em vez de objeto
    mock_grafo.ainvoke = AsyncMock(return_value={
        "messages": [
            {"role": "assistant", "content": "Resposta em formato dict."}
        ],
    })
    mod._grafo_supervisor = mock_grafo

    resultado = await mod.invocar_supervisor(
        mensagem="Teste com resposta dict",
    )

    assert isinstance(resultado, dict)
    assert resultado["resposta"] == "Resposta em formato dict."
