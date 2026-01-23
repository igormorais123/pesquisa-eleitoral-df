#!/usr/bin/env python3
"""
Script de Correção de Inconsistências e Ajustes Estatísticos
Versão 1.0

Corrige:
1. Idade vs Escolaridade (jovens com superior)
2. Ocupação vs Profissão (estudantes com profissões de adulto)
3. Ocupação vs Renda (servidores com renda baixa)
4. Desvios estatísticos (pirâmide etária, orientação política)
"""

import json
import random
from datetime import datetime
from copy import deepcopy

# Configuração
ARQUIVO_ENTRADA = "agentes/banco-eleitores-df.json"
ARQUIVO_SAIDA = "agentes/banco-eleitores-df.json"
ARQUIVO_FRONTEND = "frontend/src/data/eleitores-df-1000.json"

# Contadores
correcoes = {
    "idade_escolaridade": 0,
    "ocupacao_profissao": 0,
    "ocupacao_renda": 0,
    "orientacao_bolsonaro": 0,
    "idade_filhos": 0,
    "voto_facultativo": 0,
    "faixa_etaria": 0,
    "outros": 0,
}

# Profissões compatíveis por ocupação/idade
PROFISSOES_ESTUDANTE = [
    "Estudante",
    "Estudante Universitário(a)",
    "Estagiário(a)",
    "Jovem Aprendiz",
    "Estudante de Ensino Médio",
]

PROFISSOES_JOVEM_CLT = [
    "Atendente",
    "Vendedor(a)",
    "Auxiliar Administrativo(a)",
    "Recepcionista",
    "Operador(a) de Caixa",
    "Auxiliar de Serviços Gerais",
    "Garçom/Garçonete",
    "Repositor(a)",
    "Entregador(a)",
]

PROFISSOES_AUTONOMO = [
    "Autônomo(a)",
    "Prestador(a) de Serviços",
    "Vendedor(a) Ambulante",
    "Diarista",
    "Cabeleireiro(a)",
    "Manicure",
    "Pedreiro",
    "Eletricista",
    "Encanador",
    "Pintor(a)",
    "Motorista de Aplicativo",
    "Frete",
]

PROFISSOES_APOSENTADO = ["Aposentado(a)", "Pensionista", "Aposentado(a) por Invalidez"]


def carregar_eleitores():
    """Carrega o banco de eleitores"""
    with open(ARQUIVO_ENTRADA, "r", encoding="utf-8") as f:
        return json.load(f)


def salvar_eleitores(eleitores):
    """Salva o banco de eleitores"""
    with open(ARQUIVO_SAIDA, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    # Copia para frontend
    with open(ARQUIVO_FRONTEND, "w", encoding="utf-8") as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    print(f"Salvo em {ARQUIVO_SAIDA} e {ARQUIVO_FRONTEND}")


def corrigir_idade_escolaridade(eleitor):
    """
    Corrige: pessoas < 22 anos com superior completo
    """
    idade = eleitor.get("idade", 25)
    escolaridade = eleitor.get("escolaridade", "")

    if idade < 22 and escolaridade in ["superior_completo_ou_pos", "superior_ou_pos"]:
        # Corrigir escolaridade
        if idade <= 17:
            eleitor["escolaridade"] = "medio_completo_ou_sup_incompleto"
        elif idade <= 21:
            eleitor["escolaridade"] = "medio_completo_ou_sup_incompleto"

        correcoes["idade_escolaridade"] += 1
        return True
    return False


def corrigir_ocupacao_profissao(eleitor):
    """
    Corrige: ocupação incompatível com profissão
    """
    ocupacao = eleitor.get("ocupacao_vinculo", "")
    profissao = eleitor.get("profissao", "")
    idade = eleitor.get("idade", 25)
    modificado = False

    # Estudante com profissão de adulto
    if ocupacao == "estudante":
        profissoes_invalidas = [
            "Médico",
            "Advogado",
            "Engenheiro",
            "Juiz",
            "Promotor",
            "Servidor Público",
            "Aposentado",
            "Contador",
            "Arquiteto",
            "Professor Universitário",
            "Delegado",
            "Procurador",
        ]

        for prof_invalida in profissoes_invalidas:
            if prof_invalida.lower() in profissao.lower():
                eleitor["profissao"] = random.choice(PROFISSOES_ESTUDANTE)
                correcoes["ocupacao_profissao"] += 1
                modificado = True
                break

    # Autônomo com profissão "Aposentado"
    if (
        ocupacao in ["autonomo", "clt", "informal", "empresario"]
        and "aposentado" in profissao.lower()
    ):
        if ocupacao == "autonomo":
            eleitor["profissao"] = random.choice(PROFISSOES_AUTONOMO)
        elif ocupacao == "clt":
            eleitor["profissao"] = random.choice(PROFISSOES_JOVEM_CLT)
        else:
            eleitor["profissao"] = "Trabalhador(a) Autônomo(a)"
        correcoes["ocupacao_profissao"] += 1
        modificado = True

    # Aposentado sem profissão de aposentado
    if (
        ocupacao == "aposentado"
        and "aposentado" not in profissao.lower()
        and "pensionista" not in profissao.lower()
    ):
        eleitor["profissao"] = random.choice(PROFISSOES_APOSENTADO)
        correcoes["ocupacao_profissao"] += 1
        modificado = True

    return modificado


def corrigir_ocupacao_renda(eleitor):
    """
    Corrige: ocupação incompatível com renda
    """
    ocupacao = eleitor.get("ocupacao_vinculo", "")
    profissao = eleitor.get("profissao", "").lower()
    renda = eleitor.get("renda_salarios_minimos", "")
    modificado = False

    # Servidor público com renda muito baixa
    if ocupacao == "servidor_publico" and renda == "ate_1":
        eleitor["renda_salarios_minimos"] = random.choice(
            ["mais_de_2_ate_5", "mais_de_5_ate_10"]
        )
        # Ajustar cluster também
        eleitor["cluster_socioeconomico"] = random.choice(
            ["G2_media_alta", "G3_media_baixa"]
        )
        correcoes["ocupacao_renda"] += 1
        modificado = True

    # Profissões de alta renda ganhando pouco
    profissoes_alta_renda = [
        "médico",
        "juiz",
        "promotor",
        "procurador",
        "desembargador",
        "delegado",
    ]
    for prof in profissoes_alta_renda:
        if prof in profissao and renda in ["ate_1", "mais_de_1_ate_2"]:
            eleitor["renda_salarios_minimos"] = random.choice(
                ["mais_de_5_ate_10", "mais_de_10_ate_20"]
            )
            eleitor["cluster_socioeconomico"] = "G1_alta"
            correcoes["ocupacao_renda"] += 1
            modificado = True
            break

    # Advogado/Engenheiro/Contador ganhando muito pouco
    profissoes_media_alta = [
        "advogado",
        "engenheiro",
        "contador",
        "arquiteto",
        "administrador",
    ]
    for prof in profissoes_media_alta:
        if prof in profissao and renda == "ate_1":
            eleitor["renda_salarios_minimos"] = random.choice(
                ["mais_de_2_ate_5", "mais_de_5_ate_10"]
            )
            eleitor["cluster_socioeconomico"] = random.choice(
                ["G2_media_alta", "G1_alta"]
            )
            correcoes["ocupacao_renda"] += 1
            modificado = True
            break

    return modificado


def corrigir_voto_facultativo(eleitor):
    """
    Corrige: voto facultativo inconsistente com idade
    """
    idade = eleitor.get("idade", 25)
    voto_facultativo = eleitor.get("voto_facultativo", False)
    modificado = False

    # Menores de 18 ou maiores de 70 devem ter voto facultativo
    if (idade < 18 or idade >= 70) and not voto_facultativo:
        eleitor["voto_facultativo"] = True
        correcoes["voto_facultativo"] += 1
        modificado = True

    # Entre 18 e 69 deve ter voto obrigatório
    if 18 <= idade < 70 and voto_facultativo:
        eleitor["voto_facultativo"] = False
        correcoes["voto_facultativo"] += 1
        modificado = True

    return modificado


def corrigir_orientacao_bolsonaro(eleitor):
    """
    Corrige casos muito incoerentes de orientação vs posição Bolsonaro
    (Mantém alguns para representar diversidade, corrige os mais extremos)
    """
    orientacao = eleitor.get("orientacao_politica", "")
    posicao = eleitor.get("posicao_bolsonaro", "")
    modificado = False

    # Esquerda + apoiador forte = muito incoerente (corrigir)
    if orientacao == "esquerda" and posicao == "apoiador_forte":
        eleitor["posicao_bolsonaro"] = random.choice(
            ["critico_forte", "critico_moderado"]
        )
        correcoes["orientacao_bolsonaro"] += 1
        modificado = True

    # Direita + crítico forte: manter alguns (~30%), corrigir outros
    if orientacao == "direita" and posicao == "critico_forte":
        if random.random() > 0.30:  # 70% chance de corrigir
            eleitor["posicao_bolsonaro"] = random.choice(
                ["apoiador_moderado", "neutro", "critico_moderado"]
            )
            correcoes["orientacao_bolsonaro"] += 1
            modificado = True

    return modificado


def corrigir_idade_filhos(eleitor):
    """
    Corrige: pessoas muito jovens com muitos filhos
    """
    idade = eleitor.get("idade", 25)
    filhos = eleitor.get("filhos", 0)
    modificado = False

    # Menor de 18 com filhos
    if idade < 18 and filhos > 1:
        eleitor["filhos"] = random.choice([0, 1])
        correcoes["idade_filhos"] += 1
        modificado = True

    # 18-20 anos com 4+ filhos
    if 18 <= idade <= 20 and filhos >= 4:
        eleitor["filhos"] = random.choice([0, 1, 2])
        correcoes["idade_filhos"] += 1
        modificado = True

    return modificado


def atualizar_faixa_etaria(eleitor):
    """
    Atualiza o campo faixa_etaria baseado na idade
    """
    idade = eleitor.get("idade", 25)

    if idade < 25:
        faixa = "16-24"
    elif idade < 35:
        faixa = "25-34"
    elif idade < 45:
        faixa = "35-44"
    elif idade < 55:
        faixa = "45-54"
    elif idade < 65:
        faixa = "55-64"
    else:
        faixa = "65+"

    if eleitor.get("faixa_etaria") != faixa:
        eleitor["faixa_etaria"] = faixa
        return True
    return False


def processar_correcoes(eleitores):
    """
    Processa todas as correções no banco
    """
    total_modificados = 0

    for eleitor in eleitores:
        modificado = False

        # Aplicar correções em ordem de prioridade
        if corrigir_idade_escolaridade(eleitor):
            modificado = True

        if corrigir_ocupacao_profissao(eleitor):
            modificado = True

        if corrigir_ocupacao_renda(eleitor):
            modificado = True

        if corrigir_voto_facultativo(eleitor):
            modificado = True

        if corrigir_orientacao_bolsonaro(eleitor):
            modificado = True

        if corrigir_idade_filhos(eleitor):
            modificado = True

        # Sempre atualizar faixa etária
        atualizar_faixa_etaria(eleitor)

        if modificado:
            total_modificados += 1

    return total_modificados


def imprimir_relatorio():
    """
    Imprime relatório de correções
    """
    print("\n" + "=" * 60)
    print("RELATÓRIO DE CORREÇÕES")
    print("=" * 60)
    print(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)

    total = sum(correcoes.values())

    for tipo, qtd in correcoes.items():
        if qtd > 0:
            print(f"  {tipo.replace('_', ' ').title()}: {qtd} correções")

    print("-" * 60)
    print(f"  TOTAL DE CORREÇÕES: {total}")
    print("=" * 60)


def main():
    print("Carregando banco de eleitores...")
    eleitores = carregar_eleitores()
    print(f"Total de eleitores: {len(eleitores)}")

    print("\nProcessando correções...")
    total_modificados = processar_correcoes(eleitores)

    print(f"\nEleitores modificados: {total_modificados}")

    print("\nSalvando banco corrigido...")
    salvar_eleitores(eleitores)

    imprimir_relatorio()

    return eleitores


if __name__ == "__main__":
    main()
