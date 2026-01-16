#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CORRECAO ROBUSTA - Eleitores Sinteticos DF 2026
Objetivo: Indice de Conformidade 86% -> 95%+
"""

import json
import random
from collections import Counter, defaultdict
from copy import deepcopy
from datetime import datetime

# Seed para reprodutibilidade
random.seed(2026)

# Caminhos
PATH_INPUT = r"C:\Agentes\agentes\banco-eleitores-df.json"
PATH_OUTPUT = r"C:\Agentes\agentes\banco-eleitores-df.json"
PATH_BACKUP = r"C:\Agentes\agentes\banco-eleitores-df_backup_pre_correcao.json"
PATH_PATCH_LOG = r"C:\Agentes\agentes\patch_log.md"
PATH_REPORT = r"C:\Agentes\agentes\relatorio_correcao.md"

# =====================================================
# BENCHMARKS (ALVOS)
# =====================================================
BENCHMARKS = {
    "susceptibilidade_desinformacao": {
        "alta": 30.0,
        "media": 45.0,
        "baixa": 25.0
    },
    "meio_transporte": {
        "carro": 32.3,
        "onibus": 21.4,
        "a_pe": 17.8,
        "motocicleta": 16.4,
        "bicicleta": 3.5,
        "metro": 1.6,
        "nao_se_aplica": 7.0
    },
    "interesse_politico": {
        "baixo": 45.0,
        "medio": 35.0,
        "alto": 20.0
    },
    "tolerancia_nuance": {
        "baixa": 35.0,
        "media": 40.0,
        "alta": 25.0
    },
    "faixa_etaria": {
        "16-24": 14.5,
        "25-34": 17.8,
        "35-44": 18.2,
        "45-54": 15.5,
        "55-64": 11.8,
        "65+": 12.2
    }
}

# =====================================================
# MAPEAMENTOS DE NORMALIZACAO
# =====================================================
MAP_SUSCEPTIBILIDADE = {
    "baixa_1_3": "baixa",
    "media_4_6": "media",
    "alta_7_10": "alta",
    "baixa": "baixa",
    "media": "media",
    "alta": "alta"
}

MAP_TRANSPORTE = {
    "carro": "carro",
    "carro_familia": "carro",
    "onibus": "onibus",
    "a_pe": "a_pe",
    "moto": "motocicleta",
    "motocicleta": "motocicleta",
    "bicicleta": "bicicleta",
    "metro": "metro",
    "van": "onibus",
    "van_pirata": "onibus",
    "uber_99": "carro",
    "nao_se_aplica": "nao_se_aplica"
}

# Ocupacoes inativas
OCUPACOES_INATIVAS = ["desempregado", "aposentado", "dona_de_casa"]
OCUPACOES_ATIVAS = ["clt", "autonomo", "informal", "servidor_publico", "empresario", "estagiario"]

# Profissoes reguladas
PROFISSOES_REGULADAS = ["medico", "dentista", "delegado", "juiz", "promotor", "procurador",
                        "engenheiro", "advogado", "defensor", "desembargador", "cirurgiao",
                        "psicologo", "farmaceutico", "veterinario", "arquiteto", "contador"]

# =====================================================
# FUNCOES AUXILIARES
# =====================================================

def normalizar_texto(texto):
    """Remove acentos e normaliza"""
    if not texto:
        return texto
    import unicodedata
    nfkd = unicodedata.normalize('NFKD', str(texto))
    return ''.join(c for c in nfkd if not unicodedata.combining(c)).lower()

def calcular_faixa_etaria(idade):
    """Retorna faixa etaria padrao"""
    if idade <= 24:
        return "16-24"
    elif idade <= 34:
        return "25-34"
    elif idade <= 44:
        return "35-44"
    elif idade <= 54:
        return "45-54"
    elif idade <= 64:
        return "55-64"
    else:
        return "65+"

def e_profissao_regulada(profissao):
    """Verifica se e profissao regulada"""
    if not profissao:
        return False
    prof_norm = normalizar_texto(profissao)
    return any(p in prof_norm for p in PROFISSOES_REGULADAS)

def calcular_contagens_alvo(n, benchmarks):
    """Converte percentuais em contagens usando largest remainder method"""
    contagens = {}
    for cat, pct in benchmarks.items():
        contagens[cat] = int(n * pct / 100)

    # Ajustar para soma = n
    soma = sum(contagens.values())
    diff = n - soma

    if diff != 0:
        # Calcular restos
        restos = {}
        for cat, pct in benchmarks.items():
            valor_exato = n * pct / 100
            resto = valor_exato - int(valor_exato)
            restos[cat] = resto

        # Ordenar por maior resto
        ordenados = sorted(restos.items(), key=lambda x: -x[1])

        # Distribuir diferenca
        for i in range(abs(diff)):
            cat = ordenados[i % len(ordenados)][0]
            if diff > 0:
                contagens[cat] += 1
            else:
                contagens[cat] -= 1

    return contagens

def verificar_hard_constraints(eleitor):
    """Verifica se eleitor viola alguma regra HARD"""
    violacoes = []

    idade = eleitor.get("idade", 30)
    escolaridade = eleitor.get("escolaridade", "")
    profissao = eleitor.get("profissao", "")
    vinculo = eleitor.get("ocupacao_vinculo", "")
    transporte = eleitor.get("meio_transporte", "")
    tempo = eleitor.get("tempo_deslocamento_trabalho", "")
    cluster = eleitor.get("cluster_socioeconomico", "")
    renda = eleitor.get("renda_salarios_minimos", "")

    # H1: idade minima 16
    if idade < 16:
        violacoes.append("H1_IDADE_MINIMA")

    # H2: 16-17 sem superior/profissao regulada
    if 16 <= idade <= 17:
        if escolaridade == "superior_completo_ou_pos":
            violacoes.append("H2_MENOR_SUPERIOR")
        if e_profissao_regulada(profissao):
            violacoes.append("H2_MENOR_PROF_REGULADA")

    # H3: ocupacao x deslocamento
    if vinculo in OCUPACOES_INATIVAS:
        if transporte != "nao_se_aplica":
            violacoes.append("H3_INATIVO_COM_TRANSPORTE")
        if tempo != "nao_se_aplica":
            violacoes.append("H3_INATIVO_COM_DESLOCAMENTO")

    if vinculo in OCUPACOES_ATIVAS:
        if transporte == "nao_se_aplica":
            violacoes.append("H3_ATIVO_SEM_TRANSPORTE")
        if tempo == "nao_se_aplica":
            violacoes.append("H3_ATIVO_SEM_DESLOCAMENTO")

    # H4: cluster x renda
    if cluster == "G1_alta" and renda == "ate_1":
        violacoes.append("H4_CLUSTER_RENDA")
    if cluster == "G4_baixa" and renda in ["mais_de_10_ate_20", "mais_de_20"]:
        violacoes.append("H4_CLUSTER_RENDA")

    return violacoes

# =====================================================
# CLASSE PRINCIPAL
# =====================================================

class CorretorEleitores:
    def __init__(self):
        self.eleitores = []
        self.eleitores_original = []
        self.alteracoes = []
        self.stats_antes = {}
        self.stats_depois = {}
        self.n = 0

    def carregar(self):
        """Carrega arquivo JSON"""
        print(f"Carregando: {PATH_INPUT}")
        with open(PATH_INPUT, 'r', encoding='utf-8') as f:
            self.eleitores = json.load(f)
        self.n = len(self.eleitores)
        self.eleitores_original = deepcopy(self.eleitores)
        print(f"Total: {self.n} eleitores")

    def calcular_distribuicoes(self):
        """Calcula distribuicoes atuais"""
        stats = {}

        # Susceptibilidade
        dist = Counter(e.get("susceptibilidade_desinformacao") for e in self.eleitores)
        stats["susceptibilidade_desinformacao"] = {k: v for k, v in dist.items()}

        # Transporte
        dist = Counter(e.get("meio_transporte") for e in self.eleitores)
        stats["meio_transporte"] = {k: v for k, v in dist.items()}

        # Interesse
        dist = Counter(e.get("interesse_politico") for e in self.eleitores)
        stats["interesse_politico"] = {k: v for k, v in dist.items()}

        # Tolerancia
        dist = Counter(e.get("tolerancia_nuance") for e in self.eleitores)
        stats["tolerancia_nuance"] = {k: v for k, v in dist.items()}

        # Faixa etaria
        dist = Counter(calcular_faixa_etaria(e.get("idade", 30)) for e in self.eleitores)
        stats["faixa_etaria"] = {k: v for k, v in dist.items()}

        return stats

    def registrar_alteracao(self, eleitor_id, campo, valor_antes, valor_depois, motivo):
        """Registra alteracao no log"""
        self.alteracoes.append({
            "id": eleitor_id,
            "campo": campo,
            "antes": valor_antes,
            "depois": valor_depois,
            "motivo": motivo
        })

    def normalizar_vocabulario(self):
        """Normaliza todas as categorias para vocabulario controlado"""
        print("\n[1/6] Normalizando vocabulario...")
        count = 0

        for e in self.eleitores:
            # Susceptibilidade
            val_orig = e.get("susceptibilidade_desinformacao", "")
            if val_orig in MAP_SUSCEPTIBILIDADE:
                val_novo = MAP_SUSCEPTIBILIDADE[val_orig]
                if val_novo != val_orig:
                    e["susceptibilidade_desinformacao"] = val_novo
                    self.registrar_alteracao(e["id"], "susceptibilidade_desinformacao",
                                            val_orig, val_novo, "normalizacao")
                    count += 1

            # Transporte
            val_orig = e.get("meio_transporte", "")
            if val_orig in MAP_TRANSPORTE:
                val_novo = MAP_TRANSPORTE[val_orig]
                if val_novo != val_orig:
                    e["meio_transporte"] = val_novo
                    self.registrar_alteracao(e["id"], "meio_transporte",
                                            val_orig, val_novo, "normalizacao")
                    count += 1
            elif val_orig and val_orig not in MAP_TRANSPORTE.values():
                # Categoria desconhecida - mapear para onibus
                e["meio_transporte"] = "onibus"
                self.registrar_alteracao(e["id"], "meio_transporte",
                                        val_orig, "onibus", "normalizacao_desconhecido")
                count += 1

        print(f"   {count} campos normalizados")
        return count

    def corrigir_susceptibilidade(self):
        """C1: Corrigir susceptibilidade_desinformacao"""
        print("\n[2/6] Corrigindo susceptibilidade_desinformacao...")

        alvos = calcular_contagens_alvo(self.n, BENCHMARKS["susceptibilidade_desinformacao"])
        print(f"   Alvos: {alvos}")

        # Contar atual
        atual = Counter(e.get("susceptibilidade_desinformacao") for e in self.eleitores)
        print(f"   Atual: {dict(atual)}")

        # Calcular diferencas
        diff = {cat: atual.get(cat, 0) - alvos[cat] for cat in alvos}
        print(f"   Diff: {diff}")

        # Criar pools
        eleitores_por_susc = defaultdict(list)
        for e in self.eleitores:
            eleitores_por_susc[e.get("susceptibilidade_desinformacao")].append(e)

        # Corrigir excessos
        correcoes = 0

        # Alta em excesso -> media ou baixa
        excesso_alta = diff.get("alta", 0)
        if excesso_alta > 0:
            # Priorizar converter para media (maior deficit)
            deficit_media = -diff.get("media", 0)
            deficit_baixa = -diff.get("baixa", 0)

            candidatos = eleitores_por_susc.get("alta", [])
            # Ordenar por escolaridade (maior primeiro para converter para baixa)
            random.shuffle(candidatos)

            para_media = min(excesso_alta, deficit_media)
            para_baixa = min(excesso_alta - para_media, deficit_baixa)

            for i, e in enumerate(candidatos[:para_media]):
                e["susceptibilidade_desinformacao"] = "media"
                self.registrar_alteracao(e["id"], "susceptibilidade_desinformacao",
                                        "alta", "media", "benchmark_ajuste")
                correcoes += 1

            for i, e in enumerate(candidatos[para_media:para_media + para_baixa]):
                e["susceptibilidade_desinformacao"] = "baixa"
                self.registrar_alteracao(e["id"], "susceptibilidade_desinformacao",
                                        "alta", "baixa", "benchmark_ajuste")
                correcoes += 1

        # Media em excesso -> baixa ou alta
        excesso_media = diff.get("media", 0)
        if excesso_media > 0:
            deficit_baixa = -diff.get("baixa", 0) + (para_baixa if 'para_baixa' in dir() else 0)
            deficit_alta = -diff.get("alta", 0) + (para_media if 'para_media' in dir() else 0)

            # Recalcular deficit atual
            atual_novo = Counter(e.get("susceptibilidade_desinformacao") for e in self.eleitores)
            deficit_baixa = alvos["baixa"] - atual_novo.get("baixa", 0)

            candidatos = [e for e in self.eleitores if e.get("susceptibilidade_desinformacao") == "media"]
            random.shuffle(candidatos)

            para_baixa_2 = min(excesso_media, deficit_baixa)
            for e in candidatos[:para_baixa_2]:
                e["susceptibilidade_desinformacao"] = "baixa"
                self.registrar_alteracao(e["id"], "susceptibilidade_desinformacao",
                                        "media", "baixa", "benchmark_ajuste")
                correcoes += 1

        print(f"   {correcoes} correcoes realizadas")

        # Verificar resultado
        final = Counter(e.get("susceptibilidade_desinformacao") for e in self.eleitores)
        print(f"   Final: {dict(final)}")

    def corrigir_transporte(self):
        """C2: Corrigir meio_transporte (especialmente metro)"""
        print("\n[3/6] Corrigindo meio_transporte...")

        alvos = calcular_contagens_alvo(self.n, BENCHMARKS["meio_transporte"])
        print(f"   Alvos: {alvos}")

        atual = Counter(e.get("meio_transporte") for e in self.eleitores)
        print(f"   Atual: {dict(atual)}")

        correcoes = 0

        # Primeiro: garantir nao_se_aplica para inativos
        for e in self.eleitores:
            vinculo = e.get("ocupacao_vinculo", "")
            transporte = e.get("meio_transporte", "")

            if vinculo in OCUPACOES_INATIVAS and transporte != "nao_se_aplica":
                e["meio_transporte"] = "nao_se_aplica"
                e["tempo_deslocamento_trabalho"] = "nao_se_aplica"
                self.registrar_alteracao(e["id"], "meio_transporte",
                                        transporte, "nao_se_aplica", "H3_inativo")
                correcoes += 1

        # Recalcular
        atual = Counter(e.get("meio_transporte") for e in self.eleitores)

        # Reduzir metro (alvo ~16, atual muito maior)
        excesso_metro = atual.get("metro", 0) - alvos.get("metro", 16)
        if excesso_metro > 0:
            candidatos_metro = [e for e in self.eleitores
                               if e.get("meio_transporte") == "metro"
                               and e.get("ocupacao_vinculo") not in OCUPACOES_INATIVAS]
            random.shuffle(candidatos_metro)

            # Calcular deficits
            deficit_onibus = alvos.get("onibus", 214) - atual.get("onibus", 0)
            deficit_a_pe = alvos.get("a_pe", 178) - atual.get("a_pe", 0)
            deficit_moto = alvos.get("motocicleta", 164) - atual.get("motocicleta", 0)

            idx = 0
            for e in candidatos_metro[:excesso_metro]:
                # Distribuir entre onibus, a_pe, motocicleta
                if deficit_onibus > 0:
                    e["meio_transporte"] = "onibus"
                    deficit_onibus -= 1
                elif deficit_a_pe > 0:
                    e["meio_transporte"] = "a_pe"
                    deficit_a_pe -= 1
                elif deficit_moto > 0:
                    e["meio_transporte"] = "motocicleta"
                    deficit_moto -= 1
                else:
                    e["meio_transporte"] = "onibus"

                self.registrar_alteracao(e["id"], "meio_transporte",
                                        "metro", e["meio_transporte"], "benchmark_metro")
                correcoes += 1
                idx += 1

        # Ajustar outras categorias se necessario
        atual = Counter(e.get("meio_transporte") for e in self.eleitores)

        # Se ainda falta onibus/a_pe/moto, pegar de carro (se em excesso)
        for destino in ["onibus", "a_pe", "motocicleta"]:
            deficit = alvos.get(destino, 0) - atual.get(destino, 0)
            excesso_carro = atual.get("carro", 0) - alvos.get("carro", 323)

            if deficit > 0 and excesso_carro > 0:
                candidatos = [e for e in self.eleitores
                             if e.get("meio_transporte") == "carro"
                             and e.get("ocupacao_vinculo") not in OCUPACOES_INATIVAS]
                random.shuffle(candidatos)

                para_mover = min(deficit, excesso_carro, len(candidatos))
                for e in candidatos[:para_mover]:
                    e["meio_transporte"] = destino
                    self.registrar_alteracao(e["id"], "meio_transporte",
                                            "carro", destino, f"benchmark_{destino}")
                    correcoes += 1

                atual = Counter(e.get("meio_transporte") for e in self.eleitores)

        print(f"   {correcoes} correcoes realizadas")
        final = Counter(e.get("meio_transporte") for e in self.eleitores)
        print(f"   Final: {dict(final)}")

    def corrigir_interesse_politico(self):
        """C3: Corrigir interesse_politico"""
        print("\n[4/6] Corrigindo interesse_politico...")

        alvos = calcular_contagens_alvo(self.n, BENCHMARKS["interesse_politico"])
        print(f"   Alvos: {alvos}")

        atual = Counter(e.get("interesse_politico") for e in self.eleitores)
        print(f"   Atual: {dict(atual)}")

        correcoes = 0

        # Excesso de medio -> converter para baixo
        excesso_medio = atual.get("medio", 0) - alvos.get("medio", 350)
        deficit_baixo = alvos.get("baixo", 450) - atual.get("baixo", 0)

        if excesso_medio > 0 and deficit_baixo > 0:
            candidatos = [e for e in self.eleitores if e.get("interesse_politico") == "medio"]
            random.shuffle(candidatos)

            para_baixo = min(excesso_medio, deficit_baixo)
            for e in candidatos[:para_baixo]:
                e["interesse_politico"] = "baixo"
                self.registrar_alteracao(e["id"], "interesse_politico",
                                        "medio", "baixo", "benchmark_ajuste")
                correcoes += 1

        print(f"   {correcoes} correcoes realizadas")
        final = Counter(e.get("interesse_politico") for e in self.eleitores)
        print(f"   Final: {dict(final)}")

    def corrigir_tolerancia_nuance(self):
        """C4: Corrigir tolerancia_nuance"""
        print("\n[5/6] Corrigindo tolerancia_nuance...")

        alvos = calcular_contagens_alvo(self.n, BENCHMARKS["tolerancia_nuance"])
        print(f"   Alvos: {alvos}")

        atual = Counter(e.get("tolerancia_nuance") for e in self.eleitores)
        print(f"   Atual: {dict(atual)}")

        correcoes = 0

        # Excesso de media -> converter para baixa
        excesso_media = atual.get("media", 0) - alvos.get("media", 400)
        deficit_baixa = alvos.get("baixa", 350) - atual.get("baixa", 0)

        if excesso_media > 0 and deficit_baixa > 0:
            candidatos = [e for e in self.eleitores if e.get("tolerancia_nuance") == "media"]
            random.shuffle(candidatos)

            para_baixa = min(excesso_media, deficit_baixa)
            for e in candidatos[:para_baixa]:
                e["tolerancia_nuance"] = "baixa"
                self.registrar_alteracao(e["id"], "tolerancia_nuance",
                                        "media", "baixa", "benchmark_ajuste")
                correcoes += 1

        print(f"   {correcoes} correcoes realizadas")
        final = Counter(e.get("tolerancia_nuance") for e in self.eleitores)
        print(f"   Final: {dict(final)}")

    def corrigir_faixa_etaria(self):
        """C5: Ajustar faixa etaria"""
        print("\n[6/6] Ajustando faixa_etaria...")

        alvos = calcular_contagens_alvo(self.n, BENCHMARKS["faixa_etaria"])
        print(f"   Alvos: {alvos}")

        atual = Counter(calcular_faixa_etaria(e.get("idade", 30)) for e in self.eleitores)
        print(f"   Atual: {dict(atual)}")

        correcoes = 0

        # Excesso em 25-34 e 35-44, deficit em 65+
        # Microajustes: 34->35, 44->45, 64->65

        # De 25-34 para 35-44: ajustar 34->35
        excesso_25_34 = atual.get("25-34", 0) - alvos.get("25-34", 178)
        deficit_35_44 = alvos.get("35-44", 182) - atual.get("35-44", 0)

        if excesso_25_34 > 0:
            candidatos = [e for e in self.eleitores if e.get("idade") == 34]
            for e in candidatos[:excesso_25_34]:
                e["idade"] = 35
                self.registrar_alteracao(e["id"], "idade", 34, 35, "faixa_etaria_ajuste")
                correcoes += 1

        # De 35-44 para 45-54
        atual = Counter(calcular_faixa_etaria(e.get("idade", 30)) for e in self.eleitores)
        excesso_35_44 = atual.get("35-44", 0) - alvos.get("35-44", 182)

        if excesso_35_44 > 0:
            candidatos = [e for e in self.eleitores if e.get("idade") == 44]
            for e in candidatos[:excesso_35_44]:
                e["idade"] = 45
                self.registrar_alteracao(e["id"], "idade", 44, 45, "faixa_etaria_ajuste")
                correcoes += 1

        # De 45-54 para 55-64
        atual = Counter(calcular_faixa_etaria(e.get("idade", 30)) for e in self.eleitores)
        excesso_45_54 = atual.get("45-54", 0) - alvos.get("45-54", 155)

        if excesso_45_54 > 0:
            candidatos = [e for e in self.eleitores if e.get("idade") == 54]
            for e in candidatos[:excesso_45_54]:
                e["idade"] = 55
                self.registrar_alteracao(e["id"], "idade", 54, 55, "faixa_etaria_ajuste")
                correcoes += 1

        # De 55-64 para 65+ (precisa aumentar 65+)
        atual = Counter(calcular_faixa_etaria(e.get("idade", 30)) for e in self.eleitores)
        deficit_65 = alvos.get("65+", 122) - atual.get("65+", 0)

        if deficit_65 > 0:
            # Pegar pessoas de 55-64 com idade proxima a 65
            candidatos = sorted([e for e in self.eleitores if 60 <= e.get("idade", 0) <= 64],
                              key=lambda x: -x.get("idade", 0))
            for e in candidatos[:deficit_65]:
                idade_antes = e["idade"]
                e["idade"] = 65
                self.registrar_alteracao(e["id"], "idade", idade_antes, 65, "faixa_etaria_ajuste")
                correcoes += 1

        print(f"   {correcoes} correcoes realizadas")
        final = Counter(calcular_faixa_etaria(e.get("idade", 30)) for e in self.eleitores)
        print(f"   Final: {dict(final)}")

    def verificar_hard_final(self):
        """Verificacao final de regras HARD"""
        print("\n[VERIFICACAO] Regras HARD...")

        violacoes_total = 0
        for e in self.eleitores:
            violacoes = verificar_hard_constraints(e)
            if violacoes:
                violacoes_total += len(violacoes)

        print(f"   Total de violacoes HARD: {violacoes_total}")
        return violacoes_total

    def gerar_relatorio(self):
        """Gera relatorio MD"""
        print("\n[RELATORIO] Gerando...")

        self.stats_depois = self.calcular_distribuicoes()

        linhas = []
        linhas.append("# RELATORIO DE CORRECAO ROBUSTA")
        linhas.append(f"\n**Data:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        linhas.append(f"\n**Total de registros:** {self.n}")
        linhas.append(f"\n**Total de alteracoes:** {len(self.alteracoes)}")

        # Verificar HARD
        hard_errors = self.verificar_hard_final()
        linhas.append(f"\n**Hard errors:** {hard_errors}")

        linhas.append("\n---\n")
        linhas.append("## COMPARATIVO POR VARIAVEL\n")

        # Para cada variavel
        for var, benchmark in BENCHMARKS.items():
            linhas.append(f"\n### {var.upper()}\n")
            linhas.append("| Categoria | Antes | Depois | Ref | Diff Antes | Diff Depois | Status |")
            linhas.append("|-----------|-------|--------|-----|------------|-------------|--------|")

            for cat, ref in benchmark.items():
                antes = self.stats_antes.get(var, {}).get(cat, 0)
                depois = self.stats_depois.get(var, {}).get(cat, 0)

                pct_antes = antes / self.n * 100
                pct_depois = depois / self.n * 100

                diff_antes = pct_antes - ref
                diff_depois = pct_depois - ref

                if abs(diff_depois) <= 3:
                    status = "OTIMO"
                elif abs(diff_depois) <= 7:
                    status = "BOM"
                elif abs(diff_depois) <= 12:
                    status = "ATENCAO"
                else:
                    status = "CRITICO"

                linhas.append(f"| {cat} | {antes} ({pct_antes:.1f}%) | {depois} ({pct_depois:.1f}%) | {ref}% | {diff_antes:+.1f}pp | {diff_depois:+.1f}pp | {status} |")

        # Resumo final
        linhas.append("\n---\n")
        linhas.append("## STATUS FINAL\n")

        # Contar status
        otimas = boas = atencao = criticas = 0
        for var, benchmark in BENCHMARKS.items():
            for cat, ref in benchmark.items():
                depois = self.stats_depois.get(var, {}).get(cat, 0)
                pct_depois = depois / self.n * 100
                diff = abs(pct_depois - ref)

                if diff <= 3:
                    otimas += 1
                elif diff <= 7:
                    boas += 1
                elif diff <= 12:
                    atencao += 1
                else:
                    criticas += 1

        linhas.append(f"- **Otimas:** {otimas}")
        linhas.append(f"- **Boas:** {boas}")
        linhas.append(f"- **Atencao:** {atencao}")
        linhas.append(f"- **Criticas:** {criticas}")
        linhas.append(f"\n**Status consistencia interna:** {'APROVADO' if hard_errors == 0 else 'REPROVADO'}")
        linhas.append(f"**Status representatividade:** {'APROVADO' if criticas == 0 else 'REPROVADO'}")

        # Salvar
        with open(PATH_REPORT, 'w', encoding='utf-8') as f:
            f.write('\n'.join(linhas))

        print(f"   Relatorio salvo: {PATH_REPORT}")

    def gerar_patch_log(self):
        """Gera log de alteracoes"""
        print("\n[PATCH LOG] Gerando...")

        linhas = []
        linhas.append("# LOG DE ALTERACOES\n")
        linhas.append(f"**Total de alteracoes:** {len(self.alteracoes)}\n")

        # Agrupar por motivo
        por_motivo = defaultdict(list)
        for alt in self.alteracoes:
            por_motivo[alt["motivo"]].append(alt)

        for motivo, alts in sorted(por_motivo.items()):
            linhas.append(f"\n## {motivo} ({len(alts)} alteracoes)\n")
            linhas.append("| ID | Campo | Antes | Depois |")
            linhas.append("|----|-------|-------|--------|")
            for alt in alts[:50]:  # Limitar a 50 por motivo
                linhas.append(f"| {alt['id']} | {alt['campo']} | {alt['antes']} | {alt['depois']} |")
            if len(alts) > 50:
                linhas.append(f"\n*... e mais {len(alts) - 50} alteracoes*")

        with open(PATH_PATCH_LOG, 'w', encoding='utf-8') as f:
            f.write('\n'.join(linhas))

        print(f"   Patch log salvo: {PATH_PATCH_LOG}")

    def salvar(self):
        """Salva arquivo corrigido"""
        print(f"\n[SALVAR] Criando backup: {PATH_BACKUP}")
        with open(PATH_BACKUP, 'w', encoding='utf-8') as f:
            json.dump(self.eleitores_original, f, ensure_ascii=False, indent=2)

        print(f"[SALVAR] Salvando corrigido: {PATH_OUTPUT}")
        with open(PATH_OUTPUT, 'w', encoding='utf-8') as f:
            json.dump(self.eleitores, f, ensure_ascii=False, indent=2)

    def executar(self):
        """Executa todas as correcoes"""
        print("=" * 60)
        print("CORRECAO ROBUSTA - ELEITORES DF 2026")
        print("=" * 60)

        self.carregar()
        self.stats_antes = self.calcular_distribuicoes()

        # Correcoes na ordem
        self.normalizar_vocabulario()
        self.corrigir_susceptibilidade()
        self.corrigir_transporte()
        self.corrigir_interesse_politico()
        self.corrigir_tolerancia_nuance()
        self.corrigir_faixa_etaria()

        # Verificacao e relatorios
        self.verificar_hard_final()
        self.gerar_relatorio()
        self.gerar_patch_log()
        self.salvar()

        print("\n" + "=" * 60)
        print("[OK] CORRECAO CONCLUIDA!")
        print("=" * 60)

# =====================================================
# MAIN
# =====================================================

if __name__ == "__main__":
    corretor = CorretorEleitores()
    corretor.executar()
