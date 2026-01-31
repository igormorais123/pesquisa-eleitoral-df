#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
corrigir_perfis.py - Correcao automatica dos perfis JSON de magistrados.

Corrige problemas identificados pela auditoria:
1. Lixo numerico de PDF no perfil_ideologico
2. Perfil ideologico duplicado (Solange copiado de Rui)
3. Fontes com URL vazia -> null
4. Asteriscos duplos (**) residuais no perfil_ideologico
5. dados_dossie vazio {} -> null
6. Consistencia de cargo por tribunal
7. Atualizar data de "atualizado_em" para perfis modificados

Autor: Script de correcao automatizada
Data: 2026-01-31
"""

import json
import os
import re
import shutil
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

# ============================================================
# CONFIGURACAO
# ============================================================

BASE_DIR = Path(r"C:\Users\igorm\pesquisa-eleitoral-df\agentes"
                r"\perfis agentes sinteticos judiciário - STF, STJ, TJDF, TRF1")
META_DIR = Path(r"C:\Users\igorm\pesquisa-eleitoral-df\agentes\meta")
BACKUP_DIR = META_DIR / "backup_pre_correcao"
LOG_FILE = META_DIR / "log_correcoes.json"

SUBDIRS = ["STF", "STJ", "TJDFT", "TRF1"]

TODAY = "2026-01-31"

# Cargo esperado por tribunal (masculino / feminino)
CARGO_PADRAO = {
    "STF": ("Ministro", "Ministra"),
    "STJ": ("Ministro", "Ministra"),
    "TJDFT": ("Desembargador", "Desembargadora"),
    "TRF1": ("Desembargador Federal", "Desembargadora Federal"),
}

# Nomes femininos conhecidos nos perfis (para genero do cargo)
# Usamos heuristica: se o nome contem indicadores femininos
NOMES_FEMININOS_INDICADORES = [
    "Carmen", "Cármen", "Nancy", "Isabel", "Daniela", "Regina",
    "Maria", "Marluce", "Ana", "Gislene", "Diva", "Leila",
    "Lucimeire", "Sandra", "Simone", "Soniria", "Vera", "Nilsoni",
    "Candice", "Cândice", "Gilda", "Katia", "Kátia", "Maura",
    "Rosana", "Rosimayre", "Solange", "Daniele",
]

# Regex para lixo numerico de PDF: digitos + espacos/newlines + digitos + ponto no final
REGEX_LIXO_NUMERICO = re.compile(r'\s*\d{1,3}\s*\n\s*\d{1,3}\.\s*$')
# Tambem capturar variantes como ".30" no final (um numero solto)
REGEX_LIXO_NUMERICO_SIMPLES = re.compile(r'\.\s*\d{1,3}\s*$')

# Regex para asteriscos duplos residuais de markdown bold
REGEX_ASTERISCOS_DUPLOS = re.compile(r'\*\*')


# ============================================================
# FUNCOES AUXILIARES
# ============================================================

def load_json(path: Path) -> dict:
    """Carrega JSON de um arquivo."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: dict) -> None:
    """Salva JSON em um arquivo com formatacao."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def is_nome_feminino(nome: str) -> bool:
    """Heuristica simples para determinar se o nome indica genero feminino."""
    # Remover prefixos como "Des.", "Min."
    nome_limpo = re.sub(r'^(Des\.|Min\.|Desa\.)\s*', '', nome).strip()
    primeiro_nome = nome_limpo.split()[0] if nome_limpo else ""
    for indicador in NOMES_FEMININOS_INDICADORES:
        if primeiro_nome.lower() == indicador.lower():
            return True
    # Fallback: verificar se o nome termina em "a" (heuristica fraca, nao usada sozinha)
    return False


def limpar_lixo_numerico(texto: str) -> tuple[str, bool]:
    """Remove artefatos numericos de PDF do texto.
    Retorna (texto_limpo, foi_modificado).
    """
    if not texto:
        return texto, False

    original = texto

    # Padrao 1: "texto.25  \n21." ou "texto.39  \n31."
    texto = REGEX_LIXO_NUMERICO.sub('', texto)

    # Padrao 2: "texto.30" (numero solto no final apos ponto)
    texto = REGEX_LIXO_NUMERICO_SIMPLES.sub('.', texto)

    # Padrao 3: numeros soltos no final sem ponto antes: "social.30"
    # Captura numeros colados apos ponto final
    texto = re.sub(r'\.(\d{1,3})\s*$', '.', texto)

    # Limpar espacos finais
    texto = texto.rstrip()

    return texto, texto != original


def limpar_asteriscos(texto: str) -> tuple[str, bool]:
    """Remove asteriscos duplos residuais de markdown bold.
    Retorna (texto_limpo, foi_modificado).
    """
    if not texto:
        return texto, False

    original = texto
    texto = REGEX_ASTERISCOS_DUPLOS.sub('', texto)
    texto = texto.rstrip()

    return texto, texto != original


# ============================================================
# FUNCOES DE CORRECAO
# ============================================================

def corrigir_lixo_numerico(perfil: dict, log_entry: list) -> bool:
    """Corrige lixo numerico de PDF no perfil_ideologico e campos relacionados."""
    modificado = False

    # Campos onde pode haver lixo numerico
    campos_dossie = []
    dados_dossie = perfil.get("dados_publicos", {}).get("dados_dossie")
    if isinstance(dados_dossie, dict):
        for campo in ["perfil_ideologico", "analise_comportamental", "perfil_psicologico"]:
            if campo in dados_dossie and isinstance(dados_dossie[campo], str):
                novo_texto, alterado = limpar_lixo_numerico(dados_dossie[campo])
                if alterado:
                    log_entry.append({
                        "tipo": "lixo_numerico",
                        "campo": f"dados_publicos.dados_dossie.{campo}",
                        "antes": dados_dossie[campo],
                        "depois": novo_texto,
                    })
                    dados_dossie[campo] = novo_texto
                    modificado = True

    # Tambem corrigir em hipoteses_para_simulacao.tracos_operacionais
    tracos = perfil.get("hipoteses_para_simulacao", {}).get("tracos_operacionais")
    if isinstance(tracos, list):
        for i, traco in enumerate(tracos):
            if isinstance(traco, str):
                novo_texto, alterado = limpar_lixo_numerico(traco)
                if alterado:
                    log_entry.append({
                        "tipo": "lixo_numerico",
                        "campo": f"hipoteses_para_simulacao.tracos_operacionais[{i}]",
                        "antes": traco,
                        "depois": novo_texto,
                    })
                    tracos[i] = novo_texto
                    modificado = True

    return modificado


def corrigir_asteriscos(perfil: dict, log_entry: list) -> bool:
    """Remove asteriscos duplos residuais de markdown bold."""
    modificado = False

    dados_dossie = perfil.get("dados_publicos", {}).get("dados_dossie")
    if isinstance(dados_dossie, dict):
        for campo in ["perfil_ideologico", "analise_comportamental", "perfil_psicologico"]:
            if campo in dados_dossie and isinstance(dados_dossie[campo], str):
                novo_texto, alterado = limpar_asteriscos(dados_dossie[campo])
                if alterado:
                    log_entry.append({
                        "tipo": "asteriscos_residuais",
                        "campo": f"dados_publicos.dados_dossie.{campo}",
                        "antes": dados_dossie[campo],
                        "depois": novo_texto,
                    })
                    dados_dossie[campo] = novo_texto
                    modificado = True

    # Tambem corrigir em tracos_operacionais
    tracos = perfil.get("hipoteses_para_simulacao", {}).get("tracos_operacionais")
    if isinstance(tracos, list):
        for i, traco in enumerate(tracos):
            if isinstance(traco, str):
                novo_texto, alterado = limpar_asteriscos(traco)
                if alterado:
                    log_entry.append({
                        "tipo": "asteriscos_residuais",
                        "campo": f"hipoteses_para_simulacao.tracos_operacionais[{i}]",
                        "antes": traco,
                        "depois": novo_texto,
                    })
                    tracos[i] = novo_texto
                    modificado = True

    return modificado


def corrigir_perfil_duplicado_solange(perfil: dict, log_entry: list) -> bool:
    """Corrige perfil ideologico duplicado de Solange (copiado de Rui Goncalves)."""
    if perfil.get("id") != "trf1-solange-salgado-da-silva":
        return False

    modificado = False
    dados_dossie = perfil.get("dados_publicos", {}).get("dados_dossie")

    if isinstance(dados_dossie, dict):
        texto_rui = "Político, extremamente popular, comunicativo"

        for campo in ["perfil_ideologico", "analise_comportamental"]:
            valor = dados_dossie.get(campo, "")
            if isinstance(valor, str) and texto_rui in valor:
                log_entry.append({
                    "tipo": "perfil_duplicado",
                    "campo": f"dados_publicos.dados_dossie.{campo}",
                    "antes": valor,
                    "depois": None,
                    "detalhe": "Texto identico ao de trf1-rui-goncalves, removido por incorreto",
                })
                dados_dossie[campo] = None
                modificado = True

    # Tambem limpar tracos_operacionais com o mesmo texto duplicado
    tracos = perfil.get("hipoteses_para_simulacao", {}).get("tracos_operacionais")
    if isinstance(tracos, list):
        texto_rui = "Político, extremamente popular, comunicativo"
        novos_tracos = []
        for i, traco in enumerate(tracos):
            if isinstance(traco, str) and texto_rui in traco:
                log_entry.append({
                    "tipo": "perfil_duplicado",
                    "campo": f"hipoteses_para_simulacao.tracos_operacionais[{i}]",
                    "antes": traco,
                    "depois": "(removido)",
                    "detalhe": "Texto identico ao de trf1-rui-goncalves",
                })
                modificado = True
            else:
                novos_tracos.append(traco)
        if modificado:
            perfil["hipoteses_para_simulacao"]["tracos_operacionais"] = novos_tracos

    return modificado


def corrigir_fontes_url_vazia(perfil: dict, log_entry: list) -> bool:
    """Seta url como null quando for string vazia."""
    modificado = False
    fontes = perfil.get("fontes", [])

    if isinstance(fontes, list):
        for i, fonte in enumerate(fontes):
            if isinstance(fonte, dict) and fonte.get("url") == "":
                log_entry.append({
                    "tipo": "fonte_url_vazia",
                    "campo": f"fontes[{i}].url",
                    "antes": "",
                    "depois": None,
                })
                fonte["url"] = None
                modificado = True

    return modificado


def corrigir_dados_dossie_vazio(perfil: dict, log_entry: list) -> bool:
    """Se dados_dossie eh dict vazio {}, setar como null."""
    modificado = False
    dados_publicos = perfil.get("dados_publicos", {})

    if isinstance(dados_publicos, dict):
        dados_dossie = dados_publicos.get("dados_dossie")
        if isinstance(dados_dossie, dict) and len(dados_dossie) == 0:
            log_entry.append({
                "tipo": "dados_dossie_vazio",
                "campo": "dados_publicos.dados_dossie",
                "antes": {},
                "depois": None,
            })
            dados_publicos["dados_dossie"] = None
            modificado = True

    return modificado


def corrigir_cargo(perfil: dict, pasta: str, log_entry: list) -> bool:
    """Garante consistencia de cargo por tribunal."""
    modificado = False
    cargo_atual = perfil.get("cargo", "")
    nome = perfil.get("nome", "")

    if pasta not in CARGO_PADRAO:
        return False

    masculino, feminino = CARGO_PADRAO[pasta]
    cargos_validos = [masculino, feminino]

    if cargo_atual not in cargos_validos:
        # Determinar genero
        cargo_correto = feminino if is_nome_feminino(nome) else masculino

        log_entry.append({
            "tipo": "cargo_inconsistente",
            "campo": "cargo",
            "antes": cargo_atual,
            "depois": cargo_correto,
            "tribunal": pasta,
        })
        perfil["cargo"] = cargo_correto
        modificado = True

    return modificado


# ============================================================
# FUNCAO PRINCIPAL
# ============================================================

def main():
    print("=" * 70)
    print("CORRECAO AUTOMATICA DE PERFIS DE MAGISTRADOS")
    print(f"Data: {TODAY}")
    print(f"Diretorio base: {BASE_DIR}")
    print("=" * 70)
    print()

    # Verificar diretorio base
    if not BASE_DIR.exists():
        print(f"ERRO: Diretorio base nao encontrado: {BASE_DIR}")
        sys.exit(1)

    # Criar diretorio de backup
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[BACKUP] Diretorio de backup: {BACKUP_DIR}")

    # Criar backup de todas as pastas
    for subdir in SUBDIRS:
        src = BASE_DIR / subdir
        dst = BACKUP_DIR / subdir
        if src.exists():
            if dst.exists():
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
            n_arquivos = len(list(dst.glob("*.json")))
            print(f"  Backup {subdir}: {n_arquivos} arquivos copiados")

    print()

    # Estatisticas
    stats = defaultdict(int)
    log_global = []
    total_perfis = 0
    perfis_modificados = 0

    # Processar cada perfil
    for subdir in SUBDIRS:
        pasta = BASE_DIR / subdir
        if not pasta.exists():
            continue

        arquivos = sorted(pasta.glob("*.json"))
        print(f"[{subdir}] Processando {len(arquivos)} perfis...")

        for arquivo in arquivos:
            total_perfis += 1
            perfil = load_json(arquivo)
            log_entry = []
            foi_modificado = False

            # 1. Lixo numerico de PDF
            if corrigir_lixo_numerico(perfil, log_entry):
                foi_modificado = True
                stats["lixo_numerico"] += 1

            # 2. Asteriscos duplos residuais (antes do perfil duplicado)
            if corrigir_asteriscos(perfil, log_entry):
                foi_modificado = True
                stats["asteriscos_residuais"] += 1

            # 3. Perfil ideologico duplicado (Solange)
            if corrigir_perfil_duplicado_solange(perfil, log_entry):
                foi_modificado = True
                stats["perfil_duplicado"] += 1

            # 4. Fontes com URL vazia
            if corrigir_fontes_url_vazia(perfil, log_entry):
                foi_modificado = True
                stats["fonte_url_vazia"] += 1

            # 5. dados_dossie vazio
            if corrigir_dados_dossie_vazio(perfil, log_entry):
                foi_modificado = True
                stats["dados_dossie_vazio"] += 1

            # 6. Consistencia de cargo
            if corrigir_cargo(perfil, subdir, log_entry):
                foi_modificado = True
                stats["cargo_inconsistente"] += 1

            # 7. Atualizar data se houve modificacao
            if foi_modificado:
                perfil["atualizado_em"] = TODAY
                perfis_modificados += 1

                # Salvar perfil corrigido
                save_json(arquivo, perfil)

                # Adicionar ao log global
                log_global.append({
                    "id": perfil.get("id", arquivo.stem),
                    "arquivo": str(arquivo),
                    "pasta": subdir,
                    "correcoes": log_entry,
                })

                # Imprimir resumo da correcao
                tipos = set(c["tipo"] for c in log_entry)
                print(f"  CORRIGIDO: {arquivo.name} -> {', '.join(tipos)}")

    # ============================================================
    # RELATORIO FINAL
    # ============================================================
    print()
    print("=" * 70)
    print("RELATORIO DE CORRECOES")
    print("=" * 70)
    print(f"Total de perfis processados:  {total_perfis}")
    print(f"Perfis modificados:           {perfis_modificados}")
    print(f"Perfis sem alteracao:         {total_perfis - perfis_modificados}")
    print()
    print("Correcoes por tipo:")
    print(f"  1. Lixo numerico PDF:       {stats['lixo_numerico']} perfis")
    print(f"  2. Asteriscos residuais:    {stats['asteriscos_residuais']} perfis")
    print(f"  3. Perfil duplicado:        {stats['perfil_duplicado']} perfis")
    print(f"  4. Fontes URL vazia -> null:{stats['fonte_url_vazia']} perfis")
    print(f"  5. dados_dossie {{}} -> null: {stats['dados_dossie_vazio']} perfis")
    print(f"  6. Cargo inconsistente:     {stats['cargo_inconsistente']} perfis")
    print()

    # Salvar log de correcoes
    log_output = {
        "metadata": {
            "data_correcao": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "diretorio_base": str(BASE_DIR),
            "backup_dir": str(BACKUP_DIR),
            "total_processados": total_perfis,
            "total_modificados": perfis_modificados,
        },
        "estatisticas": dict(stats),
        "correcoes": log_global,
    }

    META_DIR.mkdir(parents=True, exist_ok=True)
    save_json(LOG_FILE, log_output)
    print(f"[LOG] Log de correcoes salvo em: {LOG_FILE}")
    print()

    # Detalhamento por perfil
    if log_global:
        print("-" * 70)
        print("DETALHAMENTO DAS CORRECOES:")
        print("-" * 70)
        for entry in log_global:
            print(f"\n  [{entry['pasta']}] {entry['id']}")
            for correcao in entry["correcoes"]:
                tipo = correcao["tipo"]
                campo = correcao["campo"]
                antes = str(correcao.get("antes", ""))[:80]
                depois = str(correcao.get("depois", ""))[:80]
                print(f"    {tipo}: {campo}")
                print(f"      Antes:  {antes}")
                print(f"      Depois: {depois}")

    print()
    print("=" * 70)
    print("CORRECAO CONCLUIDA COM SUCESSO!")
    print("=" * 70)


if __name__ == "__main__":
    main()
