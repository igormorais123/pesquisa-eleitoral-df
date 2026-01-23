#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Análise de Inconsistências no Banco de Eleitores do DF
Verifica combinações de atributos contraditórias ou suspeitas
"""

import json
import sys
from collections import defaultdict

# Forçar UTF-8 no stdout para Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Carregar dados
with open(r"C:\Agentes\agentes\banco-eleitores-df.json", "r", encoding="utf-8") as f:
    eleitores = json.load(f)

# Estrutura para armazenar inconsistências
inconsistencias = defaultdict(list)


def adicionar_inconsistencia(tipo, categoria, eleitor, campos, descricao):
    """Adiciona uma inconsistência encontrada"""
    inconsistencias[categoria].append(
        {
            "tipo": tipo,  # INCOERENTE ou SUSPEITO
            "id": eleitor["id"],
            "nome": eleitor["nome"],
            "idade": eleitor["idade"],
            "campos": campos,
            "descricao": descricao,
        }
    )


# Verificar cada eleitor
for e in eleitores:
    idade = e["idade"]
    escolaridade = e.get("escolaridade", "")
    ocupacao = e.get("ocupacao_vinculo", "")
    profissao = e.get("profissao", "")
    estado_civil = e.get("estado_civil", "")
    voto_facultativo = e.get("voto_facultativo", False)
    cluster = e.get("cluster_socioeconomico", "")
    renda = e.get("renda_salarios_minimos", "")
    orientacao = e.get("orientacao_politica", "")
    posicao_bolsonaro = e.get("posicao_bolsonaro", "")
    filhos = e.get("filhos", 0)

    # 1. IDADE vs ESCOLARIDADE
    if idade < 22 and escolaridade == "superior_ou_pos":
        adicionar_inconsistencia(
            "INCOERENTE",
            "1. IDADE vs ESCOLARIDADE",
            e,
            {"idade": idade, "escolaridade": escolaridade},
            f"Pessoa de {idade} anos com ensino superior completo ou pós-graduação é improvável (mínimo ~22 anos)",
        )

    # 2. IDADE vs OCUPAÇÃO
    if idade < 55 and ocupacao == "aposentado":
        # Verificar se é militar (pode se aposentar mais cedo)
        profissoes_aposentadoria_precoce = [
            "Militar",
            "Bombeiro",
            "Policial",
            "PM",
            "PMDF",
        ]
        eh_militar = any(
            p.lower() in profissao.lower() for p in profissoes_aposentadoria_precoce
        )
        if not eh_militar:
            adicionar_inconsistencia(
                "INCOERENTE",
                "2. IDADE vs OCUPAÇÃO",
                e,
                {"idade": idade, "ocupacao_vinculo": ocupacao, "profissao": profissao},
                f"Pessoa de {idade} anos aposentada sem ser militar/invalidez",
            )

    if idade < 18 and ocupacao != "estudante":
        adicionar_inconsistencia(
            "SUSPEITO",
            "2. IDADE vs OCUPAÇÃO",
            e,
            {"idade": idade, "ocupacao_vinculo": ocupacao},
            f"Menor de 18 anos ({idade}) que não é estudante",
        )

    if idade > 70 and ocupacao == "estudante":
        adicionar_inconsistencia(
            "SUSPEITO",
            "2. IDADE vs OCUPAÇÃO",
            e,
            {"idade": idade, "ocupacao_vinculo": ocupacao},
            f"Pessoa de {idade} anos como estudante é incomum",
        )

    # 3. IDADE vs ESTADO CIVIL
    if idade < 20 and estado_civil in ["divorciado(a)", "viuvo(a)"]:
        adicionar_inconsistencia(
            "INCOERENTE",
            "3. IDADE vs ESTADO CIVIL",
            e,
            {"idade": idade, "estado_civil": estado_civil},
            f"Pessoa de {idade} anos {estado_civil} é muito improvável",
        )

    if idade < 18 and estado_civil == "casado(a)":
        adicionar_inconsistencia(
            "SUSPEITO",
            "3. IDADE vs ESTADO CIVIL",
            e,
            {"idade": idade, "estado_civil": estado_civil},
            f"Menor de 18 anos casado (requer autorização judicial)",
        )

    # 4. IDADE vs VOTO FACULTATIVO
    if idade >= 18 and idade < 70 and voto_facultativo == True:
        adicionar_inconsistencia(
            "INCOERENTE",
            "4. IDADE vs VOTO FACULTATIVO",
            e,
            {"idade": idade, "voto_facultativo": voto_facultativo},
            f"Eleitor de {idade} anos tem voto obrigatório, não facultativo",
        )

    if idade < 18 and voto_facultativo == False:
        adicionar_inconsistencia(
            "INCOERENTE",
            "4. IDADE vs VOTO FACULTATIVO",
            e,
            {"idade": idade, "voto_facultativo": voto_facultativo},
            f"Eleitor de {idade} anos deveria ter voto facultativo",
        )

    if idade >= 70 and voto_facultativo == False:
        adicionar_inconsistencia(
            "INCOERENTE",
            "4. IDADE vs VOTO FACULTATIVO",
            e,
            {"idade": idade, "voto_facultativo": voto_facultativo},
            f"Eleitor de {idade} anos deveria ter voto facultativo (>= 70)",
        )

    # 5. CLUSTER vs RENDA
    rendas_baixas = ["ate_1", "mais_de_1_ate_2"]
    rendas_altas = ["mais_de_10_ate_20", "mais_de_20"]

    if cluster == "G1_alta" and renda in rendas_baixas:
        adicionar_inconsistencia(
            "INCOERENTE",
            "5. CLUSTER vs RENDA",
            e,
            {"cluster_socioeconomico": cluster, "renda_salarios_minimos": renda},
            f"Cluster alta (G1) com renda {renda} é contraditório",
        )

    if cluster == "G4_baixa" and renda in rendas_altas:
        adicionar_inconsistencia(
            "INCOERENTE",
            "5. CLUSTER vs RENDA",
            e,
            {"cluster_socioeconomico": cluster, "renda_salarios_minimos": renda},
            f"Cluster baixa (G4) com renda {renda} é contraditório",
        )

    # 6. OCUPAÇÃO vs RENDA
    if ocupacao == "servidor_publico" and renda == "ate_1":
        adicionar_inconsistencia(
            "SUSPEITO",
            "6. OCUPAÇÃO vs RENDA",
            e,
            {
                "ocupacao_vinculo": ocupacao,
                "renda_salarios_minimos": renda,
                "profissao": profissao,
            },
            f"Servidor público ganhando até 1 salário mínimo é muito raro",
        )

    # Profissões de alta renda
    profissoes_alta_renda = [
        "Juiz",
        "Juíza",
        "Promotor",
        "Promotora",
        "Médico",
        "Médica",
        "Desembargador",
        "Procurador",
        "Advogado",
        "Dentista",
        "Delegado",
    ]
    rendas_baixas_medias = [
        "ate_1",
        "mais_de_1_ate_2",
        "mais_de_2_ate_3",
        "mais_de_3_ate_5",
        "mais_de_5_ate_10",
    ]

    for prof in profissoes_alta_renda:
        if prof.lower() in profissao.lower() and renda in rendas_baixas_medias:
            adicionar_inconsistencia(
                "SUSPEITO",
                "6. OCUPAÇÃO vs RENDA",
                e,
                {"profissao": profissao, "renda_salarios_minimos": renda},
                f"{profissao} ganhando {renda} salários mínimos é muito abaixo do esperado",
            )
            break

    # 7. ORIENTAÇÃO POLÍTICA vs POSIÇÃO BOLSONARO
    if orientacao == "esquerda" and posicao_bolsonaro == "apoiador_forte":
        adicionar_inconsistencia(
            "INCOERENTE",
            "7. ORIENTAÇÃO POLÍTICA vs POSIÇÃO BOLSONARO",
            e,
            {"orientacao_politica": orientacao, "posicao_bolsonaro": posicao_bolsonaro},
            f"Pessoa de esquerda sendo apoiador forte de Bolsonaro é contraditório",
        )

    if orientacao == "direita" and posicao_bolsonaro == "critico_forte":
        adicionar_inconsistencia(
            "SUSPEITO",
            "7. ORIENTAÇÃO POLÍTICA vs POSIÇÃO BOLSONARO",
            e,
            {"orientacao_politica": orientacao, "posicao_bolsonaro": posicao_bolsonaro},
            f"Pessoa de direita sendo crítico forte de Bolsonaro é possível mas incomum",
        )

    # 8. OCUPAÇÃO vs PROFISSÃO
    if ocupacao == "aposentado" and "Aposentado" not in profissao:
        adicionar_inconsistencia(
            "SUSPEITO",
            "8. OCUPAÇÃO vs PROFISSÃO",
            e,
            {"ocupacao_vinculo": ocupacao, "profissao": profissao},
            f'Ocupação aposentado mas profissão é "{profissao}" (deveria conter "Aposentado")',
        )

    if ocupacao == "estudante" and "Estudante" not in profissao:
        adicionar_inconsistencia(
            "SUSPEITO",
            "8. OCUPAÇÃO vs PROFISSÃO",
            e,
            {"ocupacao_vinculo": ocupacao, "profissao": profissao},
            f'Ocupação estudante mas profissão é "{profissao}" (deveria conter "Estudante")',
        )

    # 9. IDADE vs FILHOS
    if idade < 16 and filhos > 0:
        adicionar_inconsistencia(
            "INCOERENTE",
            "9. IDADE vs FILHOS",
            e,
            {"idade": idade, "filhos": filhos},
            f"Pessoa de {idade} anos com {filhos} filho(s) é improvável",
        )

    if idade >= 16 and idade <= 20 and filhos >= 4:
        adicionar_inconsistencia(
            "SUSPEITO",
            "9. IDADE vs FILHOS",
            e,
            {"idade": idade, "filhos": filhos},
            f"Pessoa de {idade} anos com {filhos} filhos é muito incomum",
        )

    # 10. ESCOLARIDADE vs OCUPAÇÃO
    if (
        escolaridade == "fundamental_ou_sem_instrucao"
        and ocupacao == "servidor_publico"
    ):
        adicionar_inconsistencia(
            "SUSPEITO",
            "10. ESCOLARIDADE vs OCUPAÇÃO",
            e,
            {
                "escolaridade": escolaridade,
                "ocupacao_vinculo": ocupacao,
                "profissao": profissao,
            },
            f"Servidor público com apenas ensino fundamental (maioria dos cargos exige médio)",
        )

# Gerar relatório
print("=" * 100)
print("RELATÓRIO DE INCONSISTÊNCIAS - BANCO DE ELEITORES DO DF")
print("=" * 100)
print(f"\nTotal de eleitores analisados: {len(eleitores)}")

total_incoerentes = 0
total_suspeitos = 0

# Contar totais
for categoria, lista in inconsistencias.items():
    for item in lista:
        if item["tipo"] == "INCOERENTE":
            total_incoerentes += 1
        else:
            total_suspeitos += 1

print(f"\n📊 RESUMO GERAL:")
print(f"   - Total de INCOERÊNCIAS (graves): {total_incoerentes}")
print(f"   - Total de SUSPEITOS (possíveis): {total_suspeitos}")
print(f"   - TOTAL DE PROBLEMAS: {total_incoerentes + total_suspeitos}")

# Ordenar categorias
categorias_ordenadas = sorted(inconsistencias.keys())

print("\n" + "=" * 100)
print("DETALHAMENTO POR CATEGORIA")
print("=" * 100)

for categoria in categorias_ordenadas:
    lista = inconsistencias[categoria]
    incoerentes = [i for i in lista if i["tipo"] == "INCOERENTE"]
    suspeitos = [i for i in lista if i["tipo"] == "SUSPEITO"]

    print(f"\n{'=' * 80}")
    print(f"📁 {categoria}")
    print(f"{'=' * 80}")
    print(
        f"   Incoerências: {len(incoerentes)} | Suspeitos: {len(suspeitos)} | Total: {len(lista)}"
    )

    # Primeiro os INCOERENTES
    if incoerentes:
        print(f"\n   🔴 INCOERENTES ({len(incoerentes)}):")
        print("   " + "-" * 70)
        for item in incoerentes:
            print(f"\n   ID: {item['id']}")
            print(f"   Nome: {item['nome']}")
            print(f"   Idade: {item['idade']} anos")
            campos_str = ", ".join([f"{k}: {v}" for k, v in item["campos"].items()])
            print(f"   Campos: {campos_str}")
            print(f"   ❌ {item['descricao']}")

    # Depois os SUSPEITOS
    if suspeitos:
        print(f"\n   🟡 SUSPEITOS ({len(suspeitos)}):")
        print("   " + "-" * 70)
        for item in suspeitos:
            print(f"\n   ID: {item['id']}")
            print(f"   Nome: {item['nome']}")
            print(f"   Idade: {item['idade']} anos")
            campos_str = ", ".join([f"{k}: {v}" for k, v in item["campos"].items()])
            print(f"   Campos: {campos_str}")
            print(f"   ⚠️ {item['descricao']}")

# Tabela resumo final
print("\n" + "=" * 100)
print("📋 TABELA RESUMO POR CATEGORIA")
print("=" * 100)
print(f"{'Categoria':<50} | {'Incoerentes':>12} | {'Suspeitos':>10} | {'Total':>8}")
print("-" * 100)

for categoria in categorias_ordenadas:
    lista = inconsistencias[categoria]
    inc = len([i for i in lista if i["tipo"] == "INCOERENTE"])
    sus = len([i for i in lista if i["tipo"] == "SUSPEITO"])
    print(f"{categoria:<50} | {inc:>12} | {sus:>10} | {len(lista):>8}")

print("-" * 100)
print(
    f"{'TOTAL':<50} | {total_incoerentes:>12} | {total_suspeitos:>10} | {total_incoerentes + total_suspeitos:>8}"
)
print("=" * 100)

# Lista consolidada de IDs problemáticos
print("\n" + "=" * 100)
print("📝 LISTA DE IDs COM PROBLEMAS (para correção)")
print("=" * 100)

ids_unicos = set()
for categoria, lista in inconsistencias.items():
    for item in lista:
        ids_unicos.add(item["id"])

print(f"\nTotal de eleitores com pelo menos um problema: {len(ids_unicos)}")
print(f"Porcentagem do banco afetada: {len(ids_unicos) / len(eleitores) * 100:.1f}%")
print("\nIDs:")
for id_eleitor in sorted(ids_unicos):
    print(f"  - {id_eleitor}")
