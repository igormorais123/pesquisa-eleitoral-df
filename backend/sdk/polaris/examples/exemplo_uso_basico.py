#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
POLARIS SDK - Exemplo de Uso Básico

Este exemplo demonstra como usar o POLARIS SDK para executar
uma pesquisa eleitoral completa.
"""

import asyncio
import os
from pathlib import Path

# Adicionar diretório pai ao path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from sdk.polaris import (
    PolarisSDK,
    QuestionnaireBuilder,
    criar_questionario_eleitoral_padrao,
    calculate_sample_size,
    setup_logging,
)


async def exemplo_pesquisa_completa():
    """
    Exemplo de pesquisa eleitoral completa usando o SDK.
    """
    # Configurar logging
    setup_logging(level="INFO")

    # Inicializar SDK
    sdk = PolarisSDK(
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        checkpoint_dir="./checkpoints",
        data_dir="./data"
    )

    # Carregar eleitores
    caminho_eleitores = Path(__file__).parent.parent.parent.parent.parent / "agentes" / "banco-eleitores-df.json"
    if caminho_eleitores.exists():
        n_eleitores = sdk.carregar_eleitores(str(caminho_eleitores))
        print(f"✓ Carregados {n_eleitores} eleitores")
    else:
        print(f"⚠ Arquivo de eleitores não encontrado: {caminho_eleitores}")
        return

    # Executar pesquisa
    print("\n🔬 Iniciando pesquisa eleitoral...")
    print("-" * 50)

    async for progress in sdk.executar_pesquisa(
        tema="Intenção de voto para Governador do DF 2026",
        amostra_tamanho=50,  # Amostra pequena para exemplo
        nivel_confianca=0.95,
        margem_erro=0.05,
        cliente="Celina Leão"
    ):
        print(f"[{progress.fase}] {progress.percentual:.1f}% - {progress.mensagem}")

    # Obter relatório
    relatorio = sdk.get_relatorio()
    if relatorio:
        relatorio.salvar("relatorio_exemplo.html")
        print(f"\n✓ Relatório salvo: relatorio_exemplo.html")

    # Estatísticas
    stats = sdk.get_statistics()
    print("\n📊 Estatísticas de uso:")
    print(f"  - Tokens Opus 4.5: {stats['scientist']['total_tokens']}")
    print(f"  - Tokens Sonnet 4: {stats['respondent']['total_tokens']}")
    print(f"  - Custo estimado: ${stats['scientist']['total_cost_usd'] + stats['respondent']['total_cost_usd']:.4f}")


async def exemplo_questionario_customizado():
    """
    Exemplo de criação de questionário customizado.
    """
    print("\n📝 Criando questionário customizado...")

    builder = QuestionnaireBuilder("Pesquisa Eleitoral DF 2026")

    # Bloco 1: Perfil
    builder.iniciar_bloco("Perfil do Eleitor", "Informações básicas")
    builder.adicionar_pergunta_likert(
        "Com que frequência você acompanha notícias sobre política?",
        pontos=5,
        rotulos=["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"]
    )
    builder.finalizar_bloco()

    # Bloco 2: Avaliação
    builder.iniciar_bloco("Avaliação do Governo", "Percepção do governo atual")
    builder.adicionar_pergunta_likert(
        "Como você avalia o atual governo do DF?",
        pontos=5,
        rotulos=["Péssimo", "Ruim", "Regular", "Bom", "Ótimo"]
    )
    builder.adicionar_pergunta_aberta(
        "Qual o principal problema do DF na sua opinião?"
    )
    builder.finalizar_bloco()

    # Bloco 3: Intenção de voto
    builder.iniciar_bloco("Intenção de Voto", "Preferência eleitoral")
    builder.adicionar_pergunta_multipla_escolha(
        "Se a eleição fosse hoje, em quem você votaria?",
        opcoes=["Celina Leão", "Flávia Arruda", "Paula Belmonte", "Outro", "Indeciso"],
        randomizar=True
    )
    builder.adicionar_pergunta_multipla_escolha(
        "Em quem você NÃO votaria de jeito nenhum?",
        opcoes=["Celina Leão", "Flávia Arruda", "Paula Belmonte", "Nenhum"]
    )
    builder.finalizar_bloco()

    # Bloco 4: Temas
    builder.iniciar_bloco("Temas Prioritários", "Prioridades")
    builder.adicionar_pergunta_ranking(
        "Ordene os temas por importância:",
        itens=["Segurança", "Saúde", "Educação", "Emprego", "Transporte"]
    )
    builder.finalizar_bloco()

    questionario = builder.build()

    print(f"✓ Questionário criado: {questionario.titulo}")
    print(f"  - Total de perguntas: {questionario.total_perguntas}")
    print(f"  - Total de blocos: {len(questionario.blocos)}")
    print(f"  - Tempo estimado: {questionario.tempo_estimado_minutos} minutos")

    return questionario


def exemplo_calculo_amostral():
    """
    Exemplo de cálculo de tamanho amostral.
    """
    print("\n📐 Cálculos amostrais:")
    print("-" * 50)

    # Cenário 1: Pesquisa padrão
    n1 = calculate_sample_size(
        population=1000,
        confidence_level=0.95,
        margin_error=0.03
    )
    print(f"Pop=1000, Conf=95%, Erro=3% → n={n1}")

    # Cenário 2: Maior precisão
    n2 = calculate_sample_size(
        population=1000,
        confidence_level=0.99,
        margin_error=0.02
    )
    print(f"Pop=1000, Conf=99%, Erro=2% → n={n2}")

    # Cenário 3: Pesquisa rápida
    n3 = calculate_sample_size(
        population=1000,
        confidence_level=0.90,
        margin_error=0.05
    )
    print(f"Pop=1000, Conf=90%, Erro=5% → n={n3}")


def exemplo_questionario_padrao():
    """
    Exemplo usando o questionário padrão.
    """
    print("\n📋 Questionário eleitoral padrão:")
    print("-" * 50)

    questionario = criar_questionario_eleitoral_padrao(
        candidatos=["Celina Leão", "Flávia Arruda", "Paula Belmonte"],
        temas_prioritarios=["Segurança", "Saúde", "Educação", "Emprego", "Transporte"]
    )

    print(f"Título: {questionario.titulo}")
    print(f"Total de perguntas: {questionario.total_perguntas}")
    print(f"Blocos:")
    for bloco in questionario.blocos:
        print(f"  - {bloco.nome}: {len(bloco.perguntas)} perguntas")


async def main():
    """Função principal."""
    print("=" * 60)
    print("POLARIS SDK - Exemplos de Uso")
    print("=" * 60)

    # Exemplo 1: Cálculo amostral
    exemplo_calculo_amostral()

    # Exemplo 2: Questionário padrão
    exemplo_questionario_padrao()

    # Exemplo 3: Questionário customizado
    await exemplo_questionario_customizado()

    # Exemplo 4: Pesquisa completa (requer API key)
    if os.getenv("ANTHROPIC_API_KEY"):
        await exemplo_pesquisa_completa()
    else:
        print("\n⚠ Para executar a pesquisa completa, defina ANTHROPIC_API_KEY")

    print("\n" + "=" * 60)
    print("Exemplos concluídos!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
