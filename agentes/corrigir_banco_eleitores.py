#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de correção do banco de eleitores do DF
Baseado no relatório de validação estatística
"""

import json
import random
import unicodedata
from collections import Counter
from copy import deepcopy

# Configurações
ARQUIVO_ENTRADA = r"C:\Agentes\agentes\banco-eleitores-df.json"
ARQUIVO_SAIDA = r"C:\Agentes\agentes\banco-eleitores-df.json"
ARQUIVO_BACKUP = r"C:\Agentes\agentes\banco-eleitores-df_backup.json"

# Mapeamento de normalização de orientação política
NORMALIZACAO_ORIENTACAO = {
    "centro-esquerda": "centro_esquerda",
    "centro-direita": "centro_direita",
}

# Regiões de baixa renda do DF (cluster G3/G4)
REGIOES_BAIXA_RENDA = [
    "Varjão", "Estrutural", "Itapoã", "Paranoá", "São Sebastião",
    "Recanto das Emas", "Santa Maria", "Ceilândia", "Samambaia",
    "Sol Nascente/Pôr do Sol", "Riacho Fundo II", "Planaltina"
]

# Regiões de alta renda do DF (cluster G1/G2)
REGIOES_ALTA_RENDA = [
    "Lago Sul", "Lago Norte", "Park Way", "Sudoeste/Octogonal",
    "Águas Claras", "Plano Piloto", "Jardim Botânico", "Cruzeiro"
]

# Profissões que exigem renda mínima alta
PROFISSOES_ALTA_RENDA = [
    "médico", "medico", "advogado", "engenheiro", "delegado",
    "juiz", "juíza", "promotor", "promotora", "procurador", "procuradora",
    "dentista", "cirurgião", "cirurgia", "desembargador", "defensor"
]

# Meios de transporte válidos para trabalhadores
MEIOS_TRANSPORTE_VALIDOS = ["onibus", "metro", "carro", "moto", "bicicleta", "a_pe", "van", "uber_99"]

# Tempos de deslocamento válidos
TEMPOS_DESLOCAMENTO_VALIDOS = ["ate_15", "15_30", "30_45", "45_60", "mais_60"]

# Contadores de correções
correcoes = Counter()

def normalizar_texto(texto):
    """Remove acentos e normaliza texto para comparação"""
    if not isinstance(texto, str):
        return texto
    nfkd = unicodedata.normalize('NFKD', texto)
    return ''.join(c for c in nfkd if not unicodedata.combining(c)).lower()

def normalizar_lista(lista):
    """Normaliza uma lista de strings para consistência"""
    if not isinstance(lista, list):
        return lista
    return list(set(lista))  # Remove duplicatas

def e_profissao_alta_renda(profissao):
    """Verifica se é uma profissão que exige renda alta"""
    if not profissao:
        return False
    prof_normalizada = normalizar_texto(profissao)
    return any(p in prof_normalizada for p in PROFISSOES_ALTA_RENDA)

def atribuir_transporte_aleatorio(regiao):
    """Atribui meio de transporte baseado na região"""
    if regiao in REGIOES_ALTA_RENDA:
        return random.choice(["carro", "uber_99", "metro"])
    else:
        return random.choice(["onibus", "metro", "a_pe", "van"])

def atribuir_tempo_deslocamento_aleatorio():
    """Atribui tempo de deslocamento aleatório"""
    return random.choice(TEMPOS_DESLOCAMENTO_VALIDOS)

def corrigir_orientacao_politica(eleitor):
    """Normaliza orientação política (hífen para underscore)"""
    if eleitor.get("orientacao_politica") in NORMALIZACAO_ORIENTACAO:
        antigo = eleitor["orientacao_politica"]
        eleitor["orientacao_politica"] = NORMALIZACAO_ORIENTACAO[antigo]
        correcoes["orientacao_politica_normalizada"] += 1
        return True
    return False

def corrigir_historia_solteiroo(eleitor):
    """Corrige erro de template 'solteiroo(a)' para 'solteiro(a)'"""
    if eleitor.get("historia_resumida") and "solteiroo" in eleitor["historia_resumida"]:
        eleitor["historia_resumida"] = eleitor["historia_resumida"].replace("solteiroo(a)", "solteiro(a)")
        eleitor["historia_resumida"] = eleitor["historia_resumida"].replace("solteiroo", "solteiro")
        correcoes["historia_solteiroo_corrigida"] += 1
        return True
    return False

def corrigir_escolaridade_vs_renda(eleitor):
    """
    Superior completo com renda <= 1 SM e ocupação ativa → ajustar renda
    """
    escolaridade = eleitor.get("escolaridade", "")
    renda = eleitor.get("renda_salarios_minimos", "")
    vinculo = eleitor.get("ocupacao_vinculo", "")

    if escolaridade == "superior_completo_ou_pos" and renda == "ate_1":
        # Se tem ocupação ativa (não é aposentado/desempregado/dona de casa)
        if vinculo not in ["aposentado", "desempregado", "dona_de_casa"]:
            eleitor["renda_salarios_minimos"] = "mais_de_2_ate_5"
            correcoes["escolaridade_vs_renda"] += 1
            return True
    return False

def corrigir_transporte_vs_ocupacao(eleitor):
    """
    Trabalhadores devem ter transporte válido
    Não-trabalhadores devem ter transporte = nao_se_aplica
    """
    vinculo = eleitor.get("ocupacao_vinculo", "")
    transporte = eleitor.get("meio_transporte", "")
    tempo = eleitor.get("tempo_deslocamento_trabalho", "")
    regiao = eleitor.get("regiao_administrativa", "")

    ocupacoes_ativas = ["clt", "autonomo", "informal", "servidor_publico", "empresario", "estagiario"]
    ocupacoes_inativas = ["aposentado", "desempregado", "dona_de_casa"]

    corrigido = False

    if vinculo in ocupacoes_ativas:
        # Deve ter transporte e tempo válidos
        if transporte == "nao_se_aplica" or transporte not in MEIOS_TRANSPORTE_VALIDOS:
            eleitor["meio_transporte"] = atribuir_transporte_aleatorio(regiao)
            correcoes["transporte_atribuido"] += 1
            corrigido = True
        if tempo == "nao_se_aplica" or tempo not in TEMPOS_DESLOCAMENTO_VALIDOS:
            eleitor["tempo_deslocamento_trabalho"] = atribuir_tempo_deslocamento_aleatorio()
            correcoes["tempo_deslocamento_atribuido"] += 1
            corrigido = True

    elif vinculo in ocupacoes_inativas:
        # Deve ter transporte = nao_se_aplica
        if transporte != "nao_se_aplica":
            eleitor["meio_transporte"] = "nao_se_aplica"
            correcoes["transporte_removido_inativo"] += 1
            corrigido = True
        if tempo != "nao_se_aplica":
            eleitor["tempo_deslocamento_trabalho"] = "nao_se_aplica"
            correcoes["tempo_removido_inativo"] += 1
            corrigido = True

    return corrigido

def corrigir_renda_servidor_publico(eleitor):
    """
    Servidor público no DF deve ter renda >= 2 SM
    """
    vinculo = eleitor.get("ocupacao_vinculo", "")
    renda = eleitor.get("renda_salarios_minimos", "")

    if vinculo == "servidor_publico" and renda in ["ate_1", "mais_de_1_ate_2"]:
        eleitor["renda_salarios_minimos"] = "mais_de_2_ate_5"
        correcoes["renda_servidor_ajustada"] += 1
        return True
    return False

def corrigir_renda_desempregado(eleitor):
    """
    Desempregado não deve ter renda alta (> 2 SM)
    """
    vinculo = eleitor.get("ocupacao_vinculo", "")
    renda = eleitor.get("renda_salarios_minimos", "")

    rendas_altas = ["mais_de_2_ate_5", "mais_de_5_ate_10", "mais_de_10"]

    if vinculo == "desempregado" and renda in rendas_altas:
        eleitor["renda_salarios_minimos"] = "ate_1"
        correcoes["renda_desempregado_ajustada"] += 1
        return True
    return False

def corrigir_renda_vs_profissao(eleitor):
    """
    Médicos, advogados, engenheiros devem ter renda >= 3-5 SM
    """
    profissao = eleitor.get("profissao", "")
    renda = eleitor.get("renda_salarios_minimos", "")
    vinculo = eleitor.get("ocupacao_vinculo", "")

    if e_profissao_alta_renda(profissao) and vinculo not in ["aposentado", "desempregado"]:
        if renda in ["ate_1", "mais_de_1_ate_2"]:
            eleitor["renda_salarios_minimos"] = "mais_de_5_ate_10"
            correcoes["renda_profissao_ajustada"] += 1
            return True
    return False

def corrigir_idade_vs_escolaridade(eleitor):
    """
    Menores de 21 não podem ter superior completo
    Menores de 25 não podem ser médicos/advogados/engenheiros
    """
    idade = eleitor.get("idade", 30)
    escolaridade = eleitor.get("escolaridade", "")
    profissao = eleitor.get("profissao", "")
    vinculo = eleitor.get("ocupacao_vinculo", "")

    corrigido = False

    # Menor de 21 com superior completo → rebaixar escolaridade
    if idade < 21 and escolaridade == "superior_completo_ou_pos":
        eleitor["escolaridade"] = "medio_completo_ou_sup_incompleto"
        correcoes["escolaridade_menor_ajustada"] += 1
        corrigido = True

    # Menor de 25 com profissão regulada → mudar para estudante
    if idade < 25 and e_profissao_alta_renda(profissao):
        eleitor["profissao"] = "Estudante"
        eleitor["ocupacao_vinculo"] = "estudante"
        eleitor["renda_salarios_minimos"] = "ate_1"
        correcoes["profissao_menor_ajustada"] += 1
        corrigido = True

    # Servidor público menor de 20 → estudante
    if idade < 20 and vinculo == "servidor_publico":
        eleitor["ocupacao_vinculo"] = "estudante"
        eleitor["profissao"] = "Estudante"
        correcoes["servidor_menor_ajustado"] += 1
        corrigido = True

    return corrigido

def corrigir_estudante_adulto(eleitor):
    """
    Estudantes com mais de 35 anos são improváveis → mudar ocupação
    Mantém apenas alguns casos (cerca de 2-3)
    """
    idade = eleitor.get("idade", 25)
    vinculo = eleitor.get("ocupacao_vinculo", "")

    if vinculo == "estudante" and idade > 35:
        # 90% de chance de corrigir
        if random.random() < 0.9:
            # Escolhe ocupação baseada na idade
            if idade > 60:
                eleitor["ocupacao_vinculo"] = "aposentado"
                eleitor["profissao"] = "Aposentado(a)"
            else:
                opcoes = ["autonomo", "informal", "clt"]
                eleitor["ocupacao_vinculo"] = random.choice(opcoes)
                # Atribui profissão genérica
                profissoes_genericas = [
                    "Comerciante", "Vendedor(a)", "Autônomo(a)",
                    "Prestador(a) de Serviços", "Auxiliar Administrativo"
                ]
                eleitor["profissao"] = random.choice(profissoes_genericas)
            correcoes["estudante_adulto_ajustado"] += 1
            return True
    return False

def corrigir_cluster_vs_regiao(eleitor):
    """
    Cluster deve ser coerente com a região administrativa
    """
    regiao = eleitor.get("regiao_administrativa", "")
    cluster = eleitor.get("cluster_socioeconomico", "")

    # Varjão com cluster alto → ajustar
    if regiao == "Varjão" and cluster in ["G1_alta", "G2_media_alta"]:
        eleitor["cluster_socioeconomico"] = "G4_baixa"
        correcoes["cluster_regiao_ajustado"] += 1
        return True

    # Estrutural com cluster alto → ajustar
    if regiao == "Estrutural" and cluster in ["G1_alta", "G2_media_alta"]:
        eleitor["cluster_socioeconomico"] = "G4_baixa"
        correcoes["cluster_regiao_ajustado"] += 1
        return True

    # Lago Sul/Norte com cluster baixo → ajustar
    if regiao in ["Lago Sul", "Lago Norte"] and cluster in ["G4_baixa"]:
        eleitor["cluster_socioeconomico"] = "G2_media_alta"
        correcoes["cluster_regiao_ajustado"] += 1
        return True

    return False

def corrigir_voto_facultativo(eleitor):
    """
    Voto facultativo para: 16-17 anos, 70+ anos, analfabetos
    """
    idade = eleitor.get("idade", 30)
    escolaridade = eleitor.get("escolaridade", "")
    voto_atual = eleitor.get("voto_facultativo", False)

    # Analfabeto → voto facultativo
    deve_ser_facultativo = False

    if idade < 18 or idade > 70:
        deve_ser_facultativo = True

    if escolaridade in ["analfabeto", "fundamental_incompleto"]:
        # Analfabetos têm voto facultativo
        # Vamos considerar que "fundamental_incompleto" pode incluir analfabetos funcionais
        # Mas vamos ser conservadores e aplicar só para analfabeto explícito
        if escolaridade == "analfabeto":
            deve_ser_facultativo = True

    if voto_atual != deve_ser_facultativo:
        eleitor["voto_facultativo"] = deve_ser_facultativo
        correcoes["voto_facultativo_ajustado"] += 1
        return True

    return False

def redistribuir_regioes(eleitores):
    """
    Redistribui eleitores do Recanto das Emas para Ceilândia e Samambaia
    Meta: Recanto ~4-5%, Ceilândia ~10%, Samambaia ~8%
    """
    # Conta distribuição atual
    contagem_regioes = Counter(e["regiao_administrativa"] for e in eleitores)
    total = len(eleitores)

    recanto_atual = contagem_regioes.get("Recanto das Emas", 0)
    ceilandia_atual = contagem_regioes.get("Ceilândia", 0)
    samambaia_atual = contagem_regioes.get("Samambaia", 0)

    print(f"\nDistribuição atual:")
    print(f"  Recanto das Emas: {recanto_atual} ({recanto_atual/total*100:.1f}%)")
    print(f"  Ceilândia: {ceilandia_atual} ({ceilandia_atual/total*100:.1f}%)")
    print(f"  Samambaia: {samambaia_atual} ({samambaia_atual/total*100:.1f}%)")

    # Metas aproximadas
    meta_recanto = int(total * 0.045)  # 4.5%
    meta_ceilandia = int(total * 0.10)  # 10%
    meta_samambaia = int(total * 0.08)  # 8%

    # Calcula quantos mover
    excesso_recanto = max(0, recanto_atual - meta_recanto)

    if excesso_recanto > 0:
        # Seleciona eleitores do Recanto para redistribuir
        eleitores_recanto = [e for e in eleitores if e["regiao_administrativa"] == "Recanto das Emas"]
        random.shuffle(eleitores_recanto)

        mover_para_ceilandia = min(excesso_recanto // 2 + 10, meta_ceilandia - ceilandia_atual)
        mover_para_samambaia = min(excesso_recanto // 2, meta_samambaia - samambaia_atual)

        for i, eleitor in enumerate(eleitores_recanto[:mover_para_ceilandia]):
            eleitor["regiao_administrativa"] = "Ceilândia"
            # Atualiza local de referência
            locais_ceilandia = ["no P Sul", "na Guariroba", "no Setor O", "perto da Hélio Prates", "no P Norte"]
            eleitor["local_referencia"] = f"perto {random.choice(locais_ceilandia)}"
            correcoes["redistribuicao_para_ceilandia"] += 1

        for eleitor in eleitores_recanto[mover_para_ceilandia:mover_para_ceilandia + mover_para_samambaia]:
            eleitor["regiao_administrativa"] = "Samambaia"
            locais_samambaia = ["na QN", "no Setor Sul", "no Setor Norte", "perto do Centro"]
            eleitor["local_referencia"] = f"perto {random.choice(locais_samambaia)}"
            correcoes["redistribuicao_para_samambaia"] += 1

    # Verifica nova distribuição
    contagem_final = Counter(e["regiao_administrativa"] for e in eleitores)
    print(f"\nDistribuição após correção:")
    print(f"  Recanto das Emas: {contagem_final.get('Recanto das Emas', 0)} ({contagem_final.get('Recanto das Emas', 0)/total*100:.1f}%)")
    print(f"  Ceilândia: {contagem_final.get('Ceilândia', 0)} ({contagem_final.get('Ceilândia', 0)/total*100:.1f}%)")
    print(f"  Samambaia: {contagem_final.get('Samambaia', 0)} ({contagem_final.get('Samambaia', 0)/total*100:.1f}%)")

def normalizar_listas_categoricas(eleitor):
    """
    Remove duplicatas e normaliza listas de valores, preocupações, medos, etc.
    """
    campos_lista = ["valores", "preocupacoes", "medos", "vieses_cognitivos", "fontes_informacao"]
    corrigido = False

    for campo in campos_lista:
        if campo in eleitor and isinstance(eleitor[campo], list):
            lista_original = eleitor[campo]
            lista_normalizada = list(dict.fromkeys(lista_original))  # Remove duplicatas mantendo ordem
            if len(lista_normalizada) != len(lista_original):
                eleitor[campo] = lista_normalizada
                correcoes[f"duplicata_{campo}_removida"] += 1
                corrigido = True

    return corrigido

def ajustar_faixa_etaria(eleitor):
    """
    Garante que faixa_etaria está coerente com idade
    """
    idade = eleitor.get("idade", 30)

    if idade < 18:
        faixa_correta = "16-17"
    elif idade <= 24:
        faixa_correta = "18-24"
    elif idade <= 34:
        faixa_correta = "25-34"
    elif idade <= 44:
        faixa_correta = "35-44"
    elif idade <= 59:
        faixa_correta = "45-59"
    elif idade <= 64:
        faixa_correta = "60-64"
    else:
        faixa_correta = "65+"

    if eleitor.get("faixa_etaria") != faixa_correta:
        eleitor["faixa_etaria"] = faixa_correta
        correcoes["faixa_etaria_ajustada"] += 1
        return True
    return False

def aplicar_todas_correcoes(eleitores):
    """
    Aplica todas as correções em sequência
    """
    print("Iniciando correções...\n")

    for eleitor in eleitores:
        # 1. Normalização básica
        corrigir_orientacao_politica(eleitor)
        corrigir_historia_solteiroo(eleitor)
        normalizar_listas_categoricas(eleitor)

        # 2. Correções de idade/escolaridade primeiro
        corrigir_idade_vs_escolaridade(eleitor)
        corrigir_estudante_adulto(eleitor)

        # 3. Correções de renda
        corrigir_renda_servidor_publico(eleitor)
        corrigir_renda_desempregado(eleitor)
        corrigir_escolaridade_vs_renda(eleitor)
        corrigir_renda_vs_profissao(eleitor)

        # 4. Correções de transporte
        corrigir_transporte_vs_ocupacao(eleitor)

        # 5. Correções de cluster
        corrigir_cluster_vs_regiao(eleitor)

        # 6. Voto facultativo
        corrigir_voto_facultativo(eleitor)

        # 7. Faixa etária
        ajustar_faixa_etaria(eleitor)

    # 8. Redistribuição regional (operação em lote)
    redistribuir_regioes(eleitores)

    return eleitores

def imprimir_relatorio():
    """
    Imprime relatório das correções realizadas
    """
    print("\n" + "="*60)
    print("RELATÓRIO DE CORREÇÕES REALIZADAS")
    print("="*60)

    categorias = {
        "Normalização": [
            "orientacao_politica_normalizada",
            "historia_solteiroo_corrigida"
        ],
        "Escolaridade/Idade": [
            "escolaridade_menor_ajustada",
            "profissao_menor_ajustada",
            "servidor_menor_ajustado",
            "estudante_adulto_ajustado"
        ],
        "Renda": [
            "escolaridade_vs_renda",
            "renda_servidor_ajustada",
            "renda_desempregado_ajustada",
            "renda_profissao_ajustada"
        ],
        "Transporte": [
            "transporte_atribuido",
            "tempo_deslocamento_atribuido",
            "transporte_removido_inativo",
            "tempo_removido_inativo"
        ],
        "Cluster/Região": [
            "cluster_regiao_ajustado",
            "redistribuicao_para_ceilandia",
            "redistribuicao_para_samambaia"
        ],
        "Outros": [
            "voto_facultativo_ajustado",
            "faixa_etaria_ajustada"
        ]
    }

    total_correcoes = 0

    for categoria, chaves in categorias.items():
        print(f"\n{categoria}:")
        for chave in chaves:
            valor = correcoes.get(chave, 0)
            if valor > 0:
                print(f"  - {chave}: {valor}")
                total_correcoes += valor

    # Verifica se há correções não categorizadas
    todas_chaves_categorizadas = set()
    for chaves in categorias.values():
        todas_chaves_categorizadas.update(chaves)

    outras = set(correcoes.keys()) - todas_chaves_categorizadas
    if outras:
        print("\nOutras correções:")
        for chave in outras:
            if correcoes[chave] > 0:
                print(f"  - {chave}: {correcoes[chave]}")
                total_correcoes += correcoes[chave]

    print(f"\n{'='*60}")
    print(f"TOTAL DE CORREÇÕES: {total_correcoes}")
    print("="*60)

def validar_resultado(eleitores):
    """
    Valida se ainda existem incoerências após correções
    """
    print("\n" + "="*60)
    print("VALIDAÇÃO PÓS-CORREÇÃO")
    print("="*60)

    problemas = []

    for eleitor in eleitores:
        id_eleitor = eleitor.get("id", "desconhecido")

        # Verifica menores com superior completo
        if eleitor.get("idade", 30) < 21 and eleitor.get("escolaridade") == "superior_completo_ou_pos":
            problemas.append(f"{id_eleitor}: menor com superior completo")

        # Verifica servidores com renda baixa
        if eleitor.get("ocupacao_vinculo") == "servidor_publico" and eleitor.get("renda_salarios_minimos") in ["ate_1"]:
            problemas.append(f"{id_eleitor}: servidor com renda <= 1 SM")

        # Verifica trabalhadores sem transporte
        if eleitor.get("ocupacao_vinculo") in ["clt", "autonomo", "informal", "servidor_publico", "empresario"]:
            if eleitor.get("meio_transporte") == "nao_se_aplica":
                problemas.append(f"{id_eleitor}: trabalhador sem transporte")

    if problemas:
        print(f"\n[!] {len(problemas)} problemas restantes:")
        for p in problemas[:10]:  # Mostra so os 10 primeiros
            print(f"  - {p}")
        if len(problemas) > 10:
            print(f"  ... e mais {len(problemas) - 10} problemas")
    else:
        print("\n[OK] Nenhuma incoerencia critica encontrada!")

def main():
    """
    Função principal
    """
    print("="*60)
    print("CORREÇÃO DO BANCO DE ELEITORES DO DF")
    print("="*60)

    # Carrega arquivo
    print(f"\nCarregando arquivo: {ARQUIVO_ENTRADA}")
    with open(ARQUIVO_ENTRADA, 'r', encoding='utf-8') as f:
        eleitores = json.load(f)

    print(f"Total de registros: {len(eleitores)}")

    # Cria backup
    print(f"\nCriando backup: {ARQUIVO_BACKUP}")
    with open(ARQUIVO_BACKUP, 'w', encoding='utf-8') as f:
        json.dump(eleitores, f, ensure_ascii=False, indent=2)

    # Aplica correções
    eleitores_corrigidos = aplicar_todas_correcoes(eleitores)

    # Imprime relatório
    imprimir_relatorio()

    # Valida resultado
    validar_resultado(eleitores_corrigidos)

    # Salva arquivo corrigido
    print(f"\nSalvando arquivo corrigido: {ARQUIVO_SAIDA}")
    with open(ARQUIVO_SAIDA, 'w', encoding='utf-8') as f:
        json.dump(eleitores_corrigidos, f, ensure_ascii=False, indent=2)

    print("\n[OK] Processo concluido com sucesso!")

if __name__ == "__main__":
    random.seed(42)  # Para reprodutibilidade
    main()
