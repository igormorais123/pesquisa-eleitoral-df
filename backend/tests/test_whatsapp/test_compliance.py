"""
Testes para o serviço de compliance eleitoral — Oráculo Eleitoral.

Verifica validação de mensagens, disclaimers, identificação legal
e processamento de opt-out conforme legislação eleitoral brasileira.
"""

import pytest

from app.servicos.compliance_servico import ComplianceServico


# =============================================
# Fixtures
# =============================================


@pytest.fixture
def compliance():
    """Instância do serviço de compliance para testes."""
    return ComplianceServico()


@pytest.fixture
def mensagem_valida():
    """Mensagem de saída válida para testes."""
    return (
        "Bom dia! Aqui está o resumo da pesquisa eleitoral desta semana. "
        "O candidato A lidera com 35% das intenções de voto."
    )


@pytest.fixture
def mensagem_pedido_voto():
    """Mensagem com pedido de compra de voto (deve ser bloqueada)."""
    return "Estamos oferecendo vantagens para quem garantir a compra de voto na região."


@pytest.fixture
def cliente_padrao():
    """Nome do cliente padrão para testes."""
    return "INTEIA"


# =============================================
# Testes
# =============================================


def test_validar_mensagem_saida_ok(compliance, mensagem_valida):
    """Mensagem válida deve passar na validação sem alertas de bloqueio."""
    resultado = compliance.validar_mensagem_saida(mensagem_valida)

    assert resultado["valida"] is True
    assert resultado["bloqueada"] is False
    assert resultado["motivo"] is None


def test_validar_mensagem_bloqueia_pedido_voto(compliance, mensagem_pedido_voto):
    """Mensagem com termos de compra de voto deve ser bloqueada."""
    resultado = compliance.validar_mensagem_saida(mensagem_pedido_voto)

    assert resultado["bloqueada"] is True
    assert resultado["valida"] is False
    assert resultado["motivo"] is not None
    # Deve ter alertas sobre termos sensíveis
    assert len(resultado["alertas"]) > 0


def test_adicionar_disclaimer_ia(compliance, mensagem_valida):
    """Disclaimer de IA deve ser adicionado ao final da mensagem."""
    resultado = compliance.adicionar_disclaimer_ia(mensagem_valida)

    assert "Mensagem gerada por IA" in resultado
    assert "INTEIA" in resultado
    # A mensagem original deve estar preservada
    assert mensagem_valida in resultado


def test_adicionar_disclaimer_ia_nao_duplica(compliance):
    """Disclaimer não deve ser duplicado se já estiver presente."""
    mensagem_com_disclaimer = (
        "Olá! Aqui está sua análise."
        "\n\n_Mensagem gerada por IA — INTEIA Inteligência Estratégica_"
    )
    resultado = compliance.adicionar_disclaimer_ia(mensagem_com_disclaimer)

    # Contar ocorrências do disclaimer
    contagem = resultado.count("Mensagem gerada por IA")
    assert contagem == 1


def test_adicionar_identificacao(compliance, mensagem_valida, cliente_padrao):
    """Identificação com CNPJ deve ser adicionada à mensagem."""
    resultado = compliance.adicionar_identificacao(mensagem_valida, cliente_padrao)

    assert "CNPJ" in resultado
    assert "63.918.490/0001-20" in resultado
    assert cliente_padrao in resultado
    # A mensagem original deve estar preservada
    assert mensagem_valida in resultado


def test_adicionar_identificacao_nao_duplica(compliance, cliente_padrao):
    """Identificação não deve ser duplicada se CNPJ já estiver presente."""
    mensagem_com_id = (
        "Olá! Aqui está sua análise."
        "\n_Responsável: INTEIA | CNPJ: 63.918.490/0001-20_"
    )
    resultado = compliance.adicionar_identificacao(mensagem_com_id, cliente_padrao)

    contagem = resultado.count("CNPJ")
    assert contagem == 1


def test_processar_opt_out_sair(compliance):
    """Mensagem 'SAIR' deve acionar opt-out."""
    assert compliance.processar_opt_out("SAIR") is True


def test_processar_opt_out_parar(compliance):
    """Mensagem 'PARAR' deve acionar opt-out."""
    assert compliance.processar_opt_out("PARAR") is True


def test_processar_opt_out_cancelar(compliance):
    """Mensagem 'CANCELAR' deve acionar opt-out."""
    assert compliance.processar_opt_out("cancelar") is True


def test_processar_opt_out_stop(compliance):
    """Mensagem 'STOP' deve acionar opt-out."""
    assert compliance.processar_opt_out("stop") is True


def test_processar_opt_out_mensagem_normal(compliance):
    """Mensagem normal não deve acionar opt-out."""
    assert compliance.processar_opt_out("Olá, quero saber o resultado da pesquisa") is False


def test_processar_opt_out_com_espacos(compliance):
    """Mensagem opt-out com espaços em volta deve funcionar."""
    assert compliance.processar_opt_out("  SAIR  ") is True


def test_preparar_mensagem_saida(compliance, mensagem_valida, cliente_padrao):
    """Pipeline completo deve adicionar disclaimer e identificação."""
    resultado = compliance.preparar_mensagem_saida(
        mensagem_valida,
        cliente=cliente_padrao,
    )

    assert resultado["valida"] is True
    assert resultado["bloqueada"] is False

    mensagem_final = resultado["mensagem"]
    # Deve conter disclaimer de IA
    assert "Mensagem gerada por IA" in mensagem_final
    # Deve conter identificação com CNPJ
    assert "CNPJ" in mensagem_final
    assert "63.918.490/0001-20" in mensagem_final


def test_preparar_mensagem_saida_bloqueada(compliance, mensagem_pedido_voto, cliente_padrao):
    """Pipeline completo deve bloquear mensagem com conteúdo proibido."""
    resultado = compliance.preparar_mensagem_saida(
        mensagem_pedido_voto,
        cliente=cliente_padrao,
    )

    assert resultado["valida"] is False
    assert resultado["bloqueada"] is True


def test_preparar_mensagem_saida_sem_disclaimer(compliance, mensagem_valida, cliente_padrao):
    """Pipeline sem disclaimer deve omitir aviso de IA."""
    resultado = compliance.preparar_mensagem_saida(
        mensagem_valida,
        cliente=cliente_padrao,
        adicionar_disclaimer=False,
    )

    assert resultado["valida"] is True
    mensagem_final = resultado["mensagem"]
    assert "Mensagem gerada por IA" not in mensagem_final
    # Identificação ainda deve estar presente
    assert "CNPJ" in mensagem_final


def test_validar_mensagem_alerta_termo_sensivel(compliance):
    """Mensagem com termos sensíveis deve gerar alertas sem bloquear."""
    mensagem = "Atenção: circulam pesquisa falsa e fake news sobre o candidato."
    resultado = compliance.validar_mensagem_saida(mensagem)

    # Pode gerar alertas mas não necessariamente bloquear
    assert isinstance(resultado["alertas"], list)
    assert len(resultado["alertas"]) > 0
    # A mensagem contém termos de alerta mas não padrões de bloqueio
    # (pesquisa falsa e fake news estão em TERMOS_ALERTA, não em padroes_bloqueio)
    assert resultado["valida"] is True
