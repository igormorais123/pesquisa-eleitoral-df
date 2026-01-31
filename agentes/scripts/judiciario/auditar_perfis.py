#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
auditar_perfis.py - Auditoria abrangente dos 132 perfis JSON de magistrados.

Verifica inconsistencias, erros, dados ilogicos, informacoes incorretas
e problemas de qualidade nos perfis sinteticos do judiciario.

Autor: Script de auditoria automatizada
Data: 2026-01-31
"""

import json
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path


# ============================================================
# CONFIGURACAO
# ============================================================

BASE_DIR = Path(r"C:\Users\igorm\pesquisa-eleitoral-df\agentes"
                r"\perfis agentes sinteticos judiciário - STF, STJ, TJDF, TRF1")
OUTPUT_DIR = Path(r"C:\Users\igorm\pesquisa-eleitoral-df\agentes\meta")
OUTPUT_FILE = OUTPUT_DIR / "auditoria_perfis.json"

SUBDIRS = ["STF", "STJ", "TJDFT", "TRF1"]

# Mapeamento de prefixo de id -> pasta esperada
ID_PREFIX_TO_DIR = {
    "stf": "STF",
    "stj": "STJ",
    "tjdft": "TJDFT",
    "trf1": "TRF1",
}

# Mapeamento de orgao -> pasta esperada
ORGAO_TO_DIR = {
    "STF": "STF",
    "STJ": "STJ",
    "TJDFT": "TJDFT",
    "TRF1": "TRF1",
}

# Cargo esperado por tribunal
CARGO_ESPERADO = {
    "STF": ["Ministro", "Ministra"],
    "STJ": ["Ministro", "Ministra"],
    "TJDFT": ["Desembargador", "Desembargadora"],
    "TRF1": ["Desembargador Federal", "Desembargadora Federal"],
}

# Valores validos de situacao
SITUACOES_VALIDAS = [
    "Ativo", "Inativo", "Aposentado", "Falecido",
    "ativo", "inativo", "aposentado", "falecido",
    "titular", "Titular",
    "Afastado", "afastado",
    "em exercício", "Em exercício",
    "convocado", "Convocado",
]

# Campos obrigatorios de nivel superior
CAMPOS_OBRIGATORIOS = ["id", "nome", "orgao", "cargo"]

# Regex para detectar texto corrompido/lixo
TRASH_PATTERNS = [
    re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f]'),  # Caracteres de controle
    re.compile(r'&[a-z]+;'),                          # HTML entities residuais
    re.compile(r'<[^>]+>'),                            # Tags HTML residuais
    re.compile(r'\\u[0-9a-fA-F]{4}'),                 # Unicode escapes soltos
    re.compile(r'\ufffd'),                             # Replacement character
    re.compile(r'â€™|â€"|â€œ|â€\x9d|Ã¡|Ã©|Ã­|Ã³|Ãº|Ã£|Ãµ|Ã§'),  # Encoding quebrado
]

# Regex para datas no formato DD/MM/YYYY
DATA_REGEX = re.compile(r'(\d{1,2})/(\d{1,2})/(\d{4})')


# ============================================================
# FUNCOES AUXILIARES
# ============================================================

def carregar_perfil(filepath):
    """Carrega um perfil JSON com tratamento de encoding."""
    for enc in ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']:
        try:
            with open(filepath, 'r', encoding=enc) as f:
                return json.load(f)
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue
    return None


def get_nested(data, *keys, default=None):
    """Acessa chaves aninhadas com seguranca."""
    current = data
    for key in keys:
        if isinstance(current, dict):
            current = current.get(key, default)
        else:
            return default
    return current


def is_empty_value(value):
    """Verifica se um valor e considerado 'vazio'."""
    if value is None:
        return True
    if isinstance(value, str) and value.strip() == "":
        return True
    if isinstance(value, list) and len(value) == 0:
        return True
    if isinstance(value, dict) and len(value) == 0:
        return True
    return False


def check_trash_text(text):
    """Verifica se um texto contem caracteres corrompidos ou lixo."""
    if not isinstance(text, str):
        return []
    issues = []
    for pattern in TRASH_PATTERNS:
        matches = pattern.findall(text[:2000])  # Checar apenas primeiros 2000 chars
        if matches:
            sample = matches[0] if len(matches[0]) < 30 else matches[0][:30]
            issues.append(f"Padrao suspeito encontrado: '{sample}' (regex: {pattern.pattern[:40]})")
    return issues


def validar_data(data_str, tipo_data="nascimento"):
    """Valida uma string de data no formato DD/MM/YYYY. Retorna lista de problemas.

    tipo_data: 'nascimento', 'nomeacao', 'indicacao', 'posse'
    """
    issues = []
    if not data_str or not isinstance(data_str, str):
        return issues

    match = DATA_REGEX.search(data_str)
    if not match:
        # Tenta formato alternativo
        if re.search(r'\d{4}', data_str):
            return issues  # Pode ser apenas um ano
        issues.append(f"Formato de data nao reconhecido: '{data_str}'")
        return issues

    dia, mes, ano = int(match.group(1)), int(match.group(2)), int(match.group(3))

    if mes < 1 or mes > 12:
        issues.append(f"Mes invalido ({mes}) na data '{data_str}'")
    if dia < 1 or dia > 31:
        issues.append(f"Dia invalido ({dia}) na data '{data_str}'")

    if tipo_data == "nascimento":
        if ano < 1920:
            issues.append(f"Ano suspeitamente antigo ({ano}) para nascimento na data '{data_str}'")
        if ano > 2000:
            issues.append(f"Ano suspeitamente recente ({ano}) para nascimento na data '{data_str}'")
    else:
        # Para nomeacao/indicacao/posse, verificar se faz sentido (entre 1960 e 2026)
        if ano < 1960:
            issues.append(f"Ano suspeitamente antigo ({ano}) para {tipo_data} na data '{data_str}'")
        if ano > 2026:
            issues.append(f"Ano futuro ({ano}) para {tipo_data} na data '{data_str}'")

    # Validar data real
    try:
        datetime(ano, mes, dia)
    except ValueError:
        issues.append(f"Data impossivel: '{data_str}'")

    return issues


def remover_acentos(texto):
    """Remove acentos de um texto para comparacao."""
    import unicodedata
    nfkd = unicodedata.normalize('NFKD', texto)
    return ''.join(c for c in nfkd if not unicodedata.combining(c))


def nome_contido_em(nome, nome_completo):
    """Verifica se o nome esta contido no nome_completo (com flexibilidade)."""
    if not nome or not nome_completo:
        return True  # Nao pode verificar

    # Remover prefixos como "Des.", "Min.", etc.
    prefixos = ["Des.", "Min.", "Dr.", "Dra.", "Prof.", "Profa."]
    nome_limpo = nome.strip()
    for p in prefixos:
        if nome_limpo.startswith(p):
            nome_limpo = nome_limpo[len(p):].strip()

    nome_completo_limpo = nome_completo.strip()
    for p in prefixos:
        if nome_completo_limpo.startswith(p):
            nome_completo_limpo = nome_completo_limpo[len(p):].strip()

    # Normalizar para comparacao (com e sem acentos)
    nome_lower = nome_limpo.lower()
    completo_lower = nome_completo_limpo.lower()
    nome_sem_acento = remover_acentos(nome_lower)
    completo_sem_acento = remover_acentos(completo_lower)

    # Verificar se nome esta contido (com ou sem acentos)
    if nome_lower in completo_lower:
        return True
    if nome_sem_acento in completo_sem_acento:
        return True

    # Verificar se todas as partes do nome estao no nome_completo
    partes_nome = nome_sem_acento.split()
    partes_completo = completo_sem_acento.split()

    match_count = sum(1 for p in partes_nome if p in partes_completo)
    return match_count >= len(partes_nome) * 0.5  # Pelo menos 50% das palavras


def extrair_todas_strings(obj, prefix=""):
    """Extrai todas as strings de um objeto JSON recursivamente."""
    strings = []
    if isinstance(obj, str):
        strings.append((prefix, obj))
    elif isinstance(obj, dict):
        for k, v in obj.items():
            strings.extend(extrair_todas_strings(v, f"{prefix}.{k}" if prefix else k))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            strings.extend(extrair_todas_strings(v, f"{prefix}[{i}]"))
    return strings


def encontrar_campos_vazios(obj, prefix="", depth=0):
    """Encontra campos vazios recursivamente."""
    vazios = []
    if depth > 6:
        return vazios

    if isinstance(obj, dict):
        for k, v in obj.items():
            full_key = f"{prefix}.{k}" if prefix else k
            # Ignorar campos que naturalmente podem ser null
            skip_keys = ["confianca_global", "funcao_administrativa"]
            if k in skip_keys:
                continue
            if is_empty_value(v):
                vazios.append(full_key)
            elif isinstance(v, (dict, list)):
                vazios.extend(encontrar_campos_vazios(v, full_key, depth + 1))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            full_key = f"{prefix}[{i}]"
            if is_empty_value(v):
                vazios.append(full_key)
            elif isinstance(v, (dict, list)):
                vazios.extend(encontrar_campos_vazios(v, full_key, depth + 1))

    return vazios


# ============================================================
# FUNCAO PRINCIPAL DE AUDITORIA
# ============================================================

def auditar_perfil(perfil, filepath, pasta_tribunal):
    """Audita um unico perfil e retorna lista de problemas."""
    problemas = []
    filename = os.path.basename(filepath)

    # ----------------------------------------------------------
    # 1. CAMPOS OBRIGATORIOS
    # ----------------------------------------------------------
    for campo in CAMPOS_OBRIGATORIOS:
        valor = perfil.get(campo)
        if valor is None:
            problemas.append({
                "tipo": "campo_obrigatorio_ausente",
                "severidade": "CRITICO",
                "campo": campo,
                "detalhe": f"Campo obrigatorio '{campo}' esta ausente"
            })
        elif isinstance(valor, str) and valor.strip() == "":
            problemas.append({
                "tipo": "campo_obrigatorio_vazio",
                "severidade": "CRITICO",
                "campo": campo,
                "detalhe": f"Campo obrigatorio '{campo}' esta vazio"
            })

    perfil_id = perfil.get("id", "SEM_ID")
    orgao = perfil.get("orgao", "SEM_ORGAO")
    cargo = perfil.get("cargo", "SEM_CARGO")
    nome = perfil.get("nome", "")
    nome_completo = perfil.get("nome_completo")
    situacao = perfil.get("situacao")

    # ----------------------------------------------------------
    # 2. CONSISTENCIA ID vs PASTA
    # ----------------------------------------------------------
    id_prefix = perfil_id.split("-")[0] if "-" in perfil_id else ""
    pasta_esperada = ID_PREFIX_TO_DIR.get(id_prefix)
    if pasta_esperada and pasta_esperada != pasta_tribunal:
        problemas.append({
            "tipo": "id_pasta_inconsistente",
            "severidade": "ALTO",
            "campo": "id",
            "detalhe": f"ID '{perfil_id}' (prefixo '{id_prefix}') esta na pasta '{pasta_tribunal}' mas deveria estar em '{pasta_esperada}'"
        })

    # Verificar se nome do arquivo corresponde ao id
    expected_filename = f"{perfil_id}.json"
    if filename != expected_filename:
        problemas.append({
            "tipo": "id_filename_inconsistente",
            "severidade": "MEDIO",
            "campo": "id",
            "detalhe": f"Arquivo '{filename}' nao corresponde ao id '{perfil_id}' (esperado: '{expected_filename}')"
        })

    # ----------------------------------------------------------
    # 3. CONSISTENCIA ORGAO vs PASTA
    # ----------------------------------------------------------
    pasta_orgao_esperada = ORGAO_TO_DIR.get(orgao)
    if pasta_orgao_esperada and pasta_orgao_esperada != pasta_tribunal:
        problemas.append({
            "tipo": "orgao_pasta_inconsistente",
            "severidade": "ALTO",
            "campo": "orgao",
            "detalhe": f"Orgao '{orgao}' esta na pasta '{pasta_tribunal}' mas deveria estar em '{pasta_orgao_esperada}'"
        })

    # ----------------------------------------------------------
    # 4. NOME vs NOME_COMPLETO
    # ----------------------------------------------------------
    if nome_completo is not None and nome_completo != "":
        if not nome_contido_em(nome, nome_completo):
            problemas.append({
                "tipo": "nome_inconsistente",
                "severidade": "MEDIO",
                "campo": "nome/nome_completo",
                "detalhe": f"Nome '{nome}' nao parece estar contido no nome_completo '{nome_completo}'"
            })
    elif nome_completo is None:
        problemas.append({
            "tipo": "nome_completo_ausente",
            "severidade": "BAIXO",
            "campo": "nome_completo",
            "detalhe": "Campo 'nome_completo' e null"
        })

    # ----------------------------------------------------------
    # 6. TEXTO CORROMPIDO/LIXO
    # ----------------------------------------------------------
    todas_strings = extrair_todas_strings(perfil)
    for campo_path, texto in todas_strings:
        trash_issues = check_trash_text(texto)
        for issue in trash_issues:
            problemas.append({
                "tipo": "texto_corrompido",
                "severidade": "MEDIO",
                "campo": campo_path,
                "detalhe": issue
            })

    # ----------------------------------------------------------
    # 7. DATAS INVALIDAS (nascimento)
    # ----------------------------------------------------------
    dados_dossie = get_nested(perfil, "dados_publicos", "dados_dossie", default={})
    if not isinstance(dados_dossie, dict):
        dados_dossie = {}

    nascimento = dados_dossie.get("nascimento", {})
    if isinstance(nascimento, dict):
        data_nasc = nascimento.get("data")
        if data_nasc:
            date_issues = validar_data(data_nasc)
            for issue in date_issues:
                problemas.append({
                    "tipo": "data_invalida",
                    "severidade": "ALTO",
                    "campo": "dados_publicos.dados_dossie.nascimento.data",
                    "detalhe": issue
                })

    # Verificar outras datas no dossie
    for key in ["indicacao", "nomeacao", "posse"]:
        data_val = dados_dossie.get(key)
        if data_val and isinstance(data_val, str):
            date_issues = validar_data(data_val, tipo_data=key)
            for issue in date_issues:
                problemas.append({
                    "tipo": "data_invalida",
                    "severidade": "MEDIO",
                    "campo": f"dados_publicos.dados_dossie.{key}",
                    "detalhe": issue
                })

    # ----------------------------------------------------------
    # 8. CAMPOS VAZIOS QUE DEVERIAM TER DADOS
    # ----------------------------------------------------------
    campos_vazios = encontrar_campos_vazios(perfil)
    # Filtrar campos que sao naturalmente vazios (como atuacao_profissional, padroes_decisao)
    campos_vazios_significativos = []
    campos_ignorar = [
        "atuacao_profissional",
        "padroes_decisao",
        "hipoteses_para_simulacao.confianca_global",
    ]
    for cv in campos_vazios:
        ignorar = False
        for ci in campos_ignorar:
            if cv == ci:
                ignorar = True
                break
        if not ignorar:
            campos_vazios_significativos.append(cv)

    if campos_vazios_significativos:
        # Reportar ate 10 campos vazios mais relevantes
        for cv in campos_vazios_significativos[:10]:
            problemas.append({
                "tipo": "campo_vazio",
                "severidade": "BAIXO",
                "campo": cv,
                "detalhe": f"Campo '{cv}' esta vazio (string vazia, lista vazia, objeto vazio ou null)"
            })
        if len(campos_vazios_significativos) > 10:
            problemas.append({
                "tipo": "campo_vazio",
                "severidade": "BAIXO",
                "campo": "MULTIPLOS",
                "detalhe": f"Existem {len(campos_vazios_significativos)} campos vazios no total (mostrando apenas os 10 primeiros)"
            })

    # ----------------------------------------------------------
    # 9. DADOS_DOSSIE COMPLETUDE
    # ----------------------------------------------------------
    dados_pub = perfil.get("dados_publicos", {})
    if not isinstance(dados_pub, dict):
        dados_pub = {}

    tem_dossie = "dados_dossie" in dados_pub and dados_pub["dados_dossie"] is not None
    if not tem_dossie:
        problemas.append({
            "tipo": "dossie_ausente",
            "severidade": "MEDIO",
            "campo": "dados_publicos.dados_dossie",
            "detalhe": "Perfil nao possui dados_dossie"
        })
    else:
        dossie = dados_pub.get("dados_dossie", {})
        if isinstance(dossie, dict):
            # Verificar campos esperados do dossie
            campos_dossie_esperados = ["perfil_ideologico"]
            for campo_d in campos_dossie_esperados:
                if campo_d not in dossie or is_empty_value(dossie.get(campo_d)):
                    # ----------------------------------------------------------
                    # 10. COERENCIA: perfil_ideologico nao deve estar vazio se dados_dossie existe
                    # ----------------------------------------------------------
                    problemas.append({
                        "tipo": "dossie_incompleto",
                        "severidade": "MEDIO",
                        "campo": f"dados_publicos.dados_dossie.{campo_d}",
                        "detalhe": f"Campo '{campo_d}' ausente ou vazio dentro de dados_dossie"
                    })

            # Verificar se perfil_ideologico contem texto corrompido/lixo numerico
            perfil_ideologico = dossie.get("perfil_ideologico", "")
            if isinstance(perfil_ideologico, str) and perfil_ideologico:
                # Verificar se parece ter numeros soltos (lixo de PDF)
                if re.search(r'\.\d+\s*\n\d+\.', perfil_ideologico):
                    problemas.append({
                        "tipo": "texto_lixo_numerico",
                        "severidade": "MEDIO",
                        "campo": "dados_publicos.dados_dossie.perfil_ideologico",
                        "detalhe": f"Possivel lixo numerico de PDF no perfil_ideologico: '{perfil_ideologico[:100]}'"
                    })

    # ----------------------------------------------------------
    # 11. BIOGRAFIA vs DADOS_DOSSIE (contradicoes obvias)
    # ----------------------------------------------------------
    biografia = perfil.get("biografia", "")
    if isinstance(biografia, str) and biografia and tem_dossie and isinstance(nascimento, dict):
        cidade_nasc = nascimento.get("cidade", "")
        if cidade_nasc:
            # Extrair nome da cidade (antes da barra)
            cidade_nome = cidade_nasc.split("/")[0].strip()
            if cidade_nome and len(cidade_nome) > 3:
                # Nao e uma contradicao se a cidade nao aparece - pode simplesmente nao estar na bio
                pass  # Verificacao passiva - apenas quando ha contradicao explicita

        data_nasc_str = nascimento.get("data", "")
        if data_nasc_str and isinstance(data_nasc_str, str):
            match = DATA_REGEX.search(data_nasc_str)
            if match:
                ano_nasc = match.group(3)
                # Verificar se a biografia menciona um ano de nascimento diferente
                # Usar padroes especificos que indicam nascimento
                bio_anos = re.findall(
                    r'nascid[oa]\s+em\s+\d{1,2}\s+de\s+\w+\s+de\s+(\d{4})',
                    biografia.lower()
                )
                if not bio_anos:
                    # Padrao "(Cidade, DD de mes de YYYY)" tipico da Wikipedia
                    bio_anos = re.findall(
                        r'\([A-Z][a-záéíóúãõêô]+,?\s+\d{1,2}\s+de\s+\w+\s+de\s+(\d{4})\)',
                        biografia[:500]
                    )
                for bio_ano in bio_anos:
                    if bio_ano != ano_nasc:
                        problemas.append({
                            "tipo": "contradicao_biografia",
                            "severidade": "ALTO",
                            "campo": "biografia vs dados_dossie.nascimento.data",
                            "detalhe": f"Ano de nascimento no dossie ({ano_nasc}) diverge do encontrado na biografia ({bio_ano})"
                        })
                        break

    # ----------------------------------------------------------
    # 12. FONTES
    # ----------------------------------------------------------
    fontes = perfil.get("fontes", [])
    if not fontes or not isinstance(fontes, list):
        problemas.append({
            "tipo": "fontes_ausentes",
            "severidade": "MEDIO",
            "campo": "fontes",
            "detalhe": "Perfil nao possui fontes listadas"
        })
    else:
        if len(fontes) == 0:
            problemas.append({
                "tipo": "fontes_vazias",
                "severidade": "MEDIO",
                "campo": "fontes",
                "detalhe": "Lista de fontes esta vazia"
            })
        else:
            # Verificar se alguma fonte tem URL vazia
            fontes_sem_url = 0
            for i, fonte in enumerate(fontes):
                if isinstance(fonte, dict):
                    url = fonte.get("url", "")
                    if not url or url.strip() == "":
                        fontes_sem_url += 1
            if fontes_sem_url > 0:
                problemas.append({
                    "tipo": "fonte_sem_url",
                    "severidade": "BAIXO",
                    "campo": "fontes",
                    "detalhe": f"{fontes_sem_url} fonte(s) sem URL"
                })

    # ----------------------------------------------------------
    # 14. CARGO vs TRIBUNAL
    # ----------------------------------------------------------
    cargos_validos = CARGO_ESPERADO.get(orgao, [])
    if cargos_validos and cargo not in cargos_validos:
        problemas.append({
            "tipo": "cargo_incompativel",
            "severidade": "ALTO",
            "campo": "cargo",
            "detalhe": f"Cargo '{cargo}' e incompativel com o tribunal '{orgao}'. Esperado: {cargos_validos}"
        })

    # ----------------------------------------------------------
    # 15. SITUACAO
    # ----------------------------------------------------------
    if situacao is None:
        problemas.append({
            "tipo": "situacao_ausente",
            "severidade": "MEDIO",
            "campo": "situacao",
            "detalhe": "Campo 'situacao' esta ausente"
        })
    elif situacao not in SITUACOES_VALIDAS:
        problemas.append({
            "tipo": "situacao_invalida",
            "severidade": "MEDIO",
            "campo": "situacao",
            "detalhe": f"Valor de situacao '{situacao}' nao e um dos valores esperados: {SITUACOES_VALIDAS[:6]}..."
        })

    # ----------------------------------------------------------
    # VERIFICACOES ADICIONAIS
    # ----------------------------------------------------------

    # Verificar se hipoteses_para_simulacao.tracos_operacionais esta vazio
    tracos = get_nested(perfil, "hipoteses_para_simulacao", "tracos_operacionais", default=[])
    if isinstance(tracos, list) and len(tracos) == 0:
        problemas.append({
            "tipo": "tracos_operacionais_vazio",
            "severidade": "BAIXO",
            "campo": "hipoteses_para_simulacao.tracos_operacionais",
            "detalhe": "Lista de tracos operacionais esta vazia - perfil sem caracterizacao para simulacao"
        })

    # Verificar se biografia existe e nao esta vazia
    if not biografia or (isinstance(biografia, str) and biografia.strip() == ""):
        # Verificar se tem wikipedia_extrato ou biografia_tjdft_texto como alternativa
        wiki_extrato = get_nested(perfil, "dados_publicos", "wikipedia_extrato", default="")
        bio_tjdft = get_nested(perfil, "dados_publicos", "biografia_tjdft_texto", default="")
        bio_trf1 = get_nested(perfil, "dados_publicos", "biografia_trf1_texto", default="")
        if not wiki_extrato and not bio_tjdft and not bio_trf1:
            problemas.append({
                "tipo": "biografia_ausente",
                "severidade": "MEDIO",
                "campo": "biografia",
                "detalhe": "Perfil nao possui biografia nem textos biograficos alternativos"
            })

    # Verificar se wikipedia_resumo existe para STF/STJ
    if orgao in ["STF", "STJ"]:
        wiki_resumo = get_nested(perfil, "dados_publicos", "wikipedia_resumo")
        if wiki_resumo is None:
            problemas.append({
                "tipo": "wikipedia_resumo_ausente",
                "severidade": "BAIXO",
                "campo": "dados_publicos.wikipedia_resumo",
                "detalhe": f"Perfil de {orgao} sem wikipedia_resumo"
            })

    # Verificar encoding dos caracteres especiais na biografia
    if isinstance(biografia, str) and len(biografia) > 100:
        # Detectar possivel encoding incorreto (cedilha, acentos)
        encoding_issues = []
        # Caracteres com cedilha corrompida
        if 'Ã§' in biografia or 'Ã£' in biografia or 'Ãµ' in biografia:
            encoding_issues.append("Possivel double-encoding UTF-8 detectado")
        # Caracteres de substituicao
        if '\ufffd' in biografia:
            encoding_issues.append("Caractere de substituicao Unicode (U+FFFD) encontrado")

        for ei in encoding_issues:
            problemas.append({
                "tipo": "encoding_problema",
                "severidade": "MEDIO",
                "campo": "biografia",
                "detalhe": ei
            })

    return problemas


# ============================================================
# FUNCAO DE VERIFICACAO GLOBAL (entre perfis)
# ============================================================

def verificacoes_globais(todos_perfis):
    """Verificacoes que envolvem comparacao entre perfis."""
    problemas_globais = []

    # ----------------------------------------------------------
    # 5. DADOS DUPLICADOS
    # ----------------------------------------------------------
    # 13. IDs DUPLICADOS
    ids_vistos = {}
    for info in todos_perfis:
        pid = info["perfil"].get("id", "SEM_ID")
        if pid in ids_vistos:
            problemas_globais.append({
                "perfil": pid,
                "tipo": "id_duplicado",
                "severidade": "CRITICO",
                "campo": "id",
                "detalhe": f"ID '{pid}' aparece em '{info['arquivo']}' e em '{ids_vistos[pid]}'"
            })
        else:
            ids_vistos[pid] = info["arquivo"]

    # Verificar nomes duplicados
    nomes_vistos = {}
    for info in todos_perfis:
        nome = info["perfil"].get("nome", "")
        if nome in nomes_vistos:
            problemas_globais.append({
                "perfil": info["perfil"].get("id", "SEM_ID"),
                "tipo": "nome_duplicado",
                "severidade": "MEDIO",
                "campo": "nome",
                "detalhe": f"Nome '{nome}' aparece em '{info['arquivo']}' e em '{nomes_vistos[nome]}'"
            })
        else:
            nomes_vistos[nome] = info["arquivo"]

    # Verificar perfis com dados_dossie quase identicos
    dossie_hashes = {}
    for info in todos_perfis:
        dossie = get_nested(info["perfil"], "dados_publicos", "dados_dossie", default={})
        if isinstance(dossie, dict) and dossie:
            perfil_ideo = dossie.get("perfil_ideologico", "")
            if perfil_ideo and isinstance(perfil_ideo, str) and len(perfil_ideo) > 10:
                key = perfil_ideo.strip()[:100]
                pid = info["perfil"].get("id", "SEM_ID")
                if key in dossie_hashes:
                    problemas_globais.append({
                        "perfil": pid,
                        "tipo": "perfil_ideologico_duplicado",
                        "severidade": "ALTO",
                        "campo": "dados_publicos.dados_dossie.perfil_ideologico",
                        "detalhe": f"perfil_ideologico identico ao de '{dossie_hashes[key]}': '{key[:60]}...'"
                    })
                else:
                    dossie_hashes[key] = pid

    return problemas_globais


# ============================================================
# MAIN
# ============================================================

def main():
    print("=" * 80)
    print("AUDITORIA DE PERFIS DE MAGISTRADOS")
    print("=" * 80)
    print(f"Diretorio base: {BASE_DIR}")
    print(f"Saida: {OUTPUT_FILE}")
    print()

    # Verificar se diretorio existe
    if not BASE_DIR.exists():
        print(f"ERRO: Diretorio base nao encontrado: {BASE_DIR}")
        sys.exit(1)

    # Carregar todos os perfis
    todos_perfis = []
    erros_carregamento = []
    total_arquivos = 0

    for subdir in SUBDIRS:
        dir_path = BASE_DIR / subdir
        if not dir_path.exists():
            print(f"AVISO: Subdiretorio nao encontrado: {dir_path}")
            continue

        arquivos_json = sorted(dir_path.glob("*.json"))
        print(f"  {subdir}: {len(arquivos_json)} perfis encontrados")
        total_arquivos += len(arquivos_json)

        for filepath in arquivos_json:
            perfil = carregar_perfil(str(filepath))
            if perfil is None:
                erros_carregamento.append({
                    "arquivo": str(filepath),
                    "erro": "Impossivel carregar JSON (encoding ou formato invalido)"
                })
                continue

            todos_perfis.append({
                "arquivo": str(filepath),
                "pasta": subdir,
                "perfil": perfil
            })

    print(f"\nTotal: {total_arquivos} arquivos JSON encontrados")
    print(f"Carregados com sucesso: {len(todos_perfis)}")
    print(f"Erros de carregamento: {len(erros_carregamento)}")
    print()

    # Auditar cada perfil individualmente
    print("Auditando perfis individualmente...")
    resultados = {}

    for info in todos_perfis:
        perfil_id = info["perfil"].get("id", os.path.basename(info["arquivo"]))
        problemas = auditar_perfil(info["perfil"], info["arquivo"], info["pasta"])
        if problemas:
            resultados[perfil_id] = {
                "arquivo": info["arquivo"],
                "pasta": info["pasta"],
                "total_problemas": len(problemas),
                "problemas": problemas
            }

    # Verificacoes globais
    print("Executando verificacoes globais (duplicatas, etc.)...")
    problemas_globais = verificacoes_globais(todos_perfis)

    # Agrupar problemas globais por perfil
    for pg in problemas_globais:
        pid = pg.pop("perfil", "GLOBAL")
        if pid not in resultados:
            resultados[pid] = {
                "arquivo": "",
                "pasta": "",
                "total_problemas": 0,
                "problemas": []
            }
        resultados[pid]["problemas"].append(pg)
        resultados[pid]["total_problemas"] = len(resultados[pid]["problemas"])

    # ----------------------------------------------------------
    # GERAR ESTATISTICAS
    # ----------------------------------------------------------
    total_problemas = sum(r["total_problemas"] for r in resultados.values())
    perfis_com_problema = len(resultados)
    perfis_sem_problema = len(todos_perfis) - perfis_com_problema

    # Contagem por tipo
    contagem_tipo = Counter()
    contagem_severidade = Counter()
    for r in resultados.values():
        for p in r["problemas"]:
            contagem_tipo[p["tipo"]] += 1
            contagem_severidade[p["severidade"]] += 1

    # Contagem por tribunal
    contagem_tribunal = defaultdict(lambda: {"perfis": 0, "problemas": 0})
    for info in todos_perfis:
        pasta = info["pasta"]
        pid = info["perfil"].get("id", "")
        contagem_tribunal[pasta]["perfis"] += 1
        if pid in resultados:
            contagem_tribunal[pasta]["problemas"] += resultados[pid]["total_problemas"]

    # Perfis sem dados_dossie
    perfis_sem_dossie = []
    for info in todos_perfis:
        dossie = get_nested(info["perfil"], "dados_publicos", "dados_dossie")
        if dossie is None or dossie == {}:
            perfis_sem_dossie.append({
                "id": info["perfil"].get("id", "SEM_ID"),
                "pasta": info["pasta"]
            })

    # Top perfis mais problematicos
    top_problematicos = sorted(resultados.items(), key=lambda x: x[1]["total_problemas"], reverse=True)[:20]

    # ----------------------------------------------------------
    # MONTAR RELATORIO JSON
    # ----------------------------------------------------------
    relatorio = {
        "metadata": {
            "data_auditoria": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "diretorio_base": str(BASE_DIR),
            "total_arquivos": total_arquivos,
            "total_carregados": len(todos_perfis),
            "erros_carregamento": len(erros_carregamento),
        },
        "resumo": {
            "total_problemas": total_problemas,
            "perfis_com_problema": perfis_com_problema,
            "perfis_sem_problema": perfis_sem_problema,
            "por_severidade": dict(contagem_severidade.most_common()),
            "por_tipo": dict(contagem_tipo.most_common()),
            "por_tribunal": {k: dict(v) for k, v in sorted(contagem_tribunal.items())},
            "perfis_sem_dossie_count": len(perfis_sem_dossie),
            "perfis_sem_dossie": perfis_sem_dossie,
        },
        "top_problematicos": [
            {"id": pid, "total": r["total_problemas"], "pasta": r["pasta"]}
            for pid, r in top_problematicos
        ],
        "erros_carregamento": erros_carregamento,
        "detalhes_por_perfil": resultados,
    }

    # Salvar relatorio
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(relatorio, f, ensure_ascii=False, indent=2)

    # ----------------------------------------------------------
    # IMPRIMIR RESUMO NO TERMINAL
    # ----------------------------------------------------------
    print()
    print("=" * 80)
    print("RESUMO DA AUDITORIA")
    print("=" * 80)
    print()
    print(f"Total de perfis analisados:    {len(todos_perfis)}")
    print(f"Perfis COM problemas:          {perfis_com_problema}")
    print(f"Perfis SEM problemas:          {perfis_sem_problema}")
    print(f"Total de problemas encontrados: {total_problemas}")
    print()

    print("-" * 60)
    print("POR SEVERIDADE:")
    print("-" * 60)
    for sev, count in contagem_severidade.most_common():
        bar = "#" * min(count, 50)
        print(f"  {sev:<10} {count:>4}  {bar}")
    print()

    print("-" * 60)
    print("POR TIPO DE PROBLEMA:")
    print("-" * 60)
    for tipo, count in contagem_tipo.most_common():
        print(f"  {tipo:<40} {count:>4}")
    print()

    print("-" * 60)
    print("POR TRIBUNAL:")
    print("-" * 60)
    for tribunal in sorted(contagem_tribunal.keys()):
        info = contagem_tribunal[tribunal]
        print(f"  {tribunal:<6} - {info['perfis']:>3} perfis, {info['problemas']:>4} problemas")
    print()

    print("-" * 60)
    print(f"PERFIS SEM DADOS_DOSSIE: {len(perfis_sem_dossie)}")
    print("-" * 60)
    for p in perfis_sem_dossie:
        print(f"  [{p['pasta']}] {p['id']}")
    print()

    print("-" * 60)
    print("TOP 20 PERFIS MAIS PROBLEMATICOS:")
    print("-" * 60)
    for pid, r in top_problematicos:
        print(f"  {pid:<50} {r['total_problemas']:>3} problemas  [{r['pasta']}]")
    print()

    # Listar problemas CRITICOS
    criticos = []
    for pid, r in resultados.items():
        for p in r["problemas"]:
            if p["severidade"] == "CRITICO":
                criticos.append({"perfil": pid, **p})

    if criticos:
        print("-" * 60)
        print(f"PROBLEMAS CRITICOS ({len(criticos)}):")
        print("-" * 60)
        for c in criticos:
            print(f"  [{c['perfil']}] {c['tipo']}: {c['detalhe']}")
        print()

    # Listar problemas ALTOS
    altos = []
    for pid, r in resultados.items():
        for p in r["problemas"]:
            if p["severidade"] == "ALTO":
                altos.append({"perfil": pid, **p})

    if altos:
        print("-" * 60)
        print(f"PROBLEMAS DE SEVERIDADE ALTA ({len(altos)}):")
        print("-" * 60)
        for a in altos:
            print(f"  [{a['perfil']}] {a['tipo']}: {a['detalhe']}")
        print()

    print("=" * 80)
    print(f"Relatorio completo salvo em: {OUTPUT_FILE}")
    print("=" * 80)

    return 0 if total_problemas == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
