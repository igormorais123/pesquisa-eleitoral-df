#!/usr/bin/env python3
"""
enriquecer_dados_pesquisa.py
============================
Le arquivos markdown de pesquisa do Perplexity AI e faz merge dos dados
complementares nos 132 perfis JSON existentes de magistrados.

Autor: INTEIA - Inteligencia Estrategica
Data: 2026-01-31
"""

import json
import os
import re
import unicodedata
from pathlib import Path
from datetime import datetime

# ============================================================
# CONFIGURACAO
# ============================================================

BASE_PERFIS = Path(r"C:\Users\igorm\pesquisa-eleitoral-df\agentes\perfis agentes sinteticos judiciário - STF, STJ, TJDF, TRF1")
MD_DIR = Path(r"C:\Users\igorm\Downloads\judiciario dados")
META_DIR = BASE_PERFIS / "meta"

MD_FILES = [
    "dossies_magistrados_base_v1.md",
    "Aprofundamento de Perfis de Magistrados.md",
    "Criação de Clones Digitais de Magistrados.md",
    "ok faça o qeu tem e o que conseguir tenho outras i.md",
    "ok faça o qeu tem e o que conseguir tenho outras i (1).md",
    "aprofunde mais.md",
    "agora consolide tudo qeu vc fe todas informações e.md",
]

TRIBUNAL_DIRS = {
    "STF": BASE_PERFIS / "STF",
    "STJ": BASE_PERFIS / "STJ",
    "TJDFT": BASE_PERFIS / "TJDFT",
    "TRF1": BASE_PERFIS / "TRF1",
}


# ============================================================
# UTILIDADES DE NORMALIZACAO
# ============================================================

def normalizar(texto):
    """Remove acentos, lowercase, espacos extras, hifens em nomes."""
    if not texto:
        return ""
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    texto = texto.lower().strip()
    # Substituir hifens por espaco (ex: Mario-Zam -> Mario Zam)
    texto = texto.replace("-", " ")
    # Remover aspas simples internas (I'talo -> Italo)
    texto = texto.replace("'", "")
    texto = re.sub(r"\s+", " ", texto)
    # Remover prefixos comuns (incluindo Desa., Des.)
    for pref in ["desa.", "desa ", "des.", "des ", "desembargador ", "desembargadora ",
                  "ministro ", "ministra ", "min.", "min ", "dr.", "dr ", "dra.", "dra "]:
        if texto.startswith(pref):
            texto = texto[len(pref):].strip()
    return texto


def tokenizar_nome(nome_norm):
    """Retorna set de tokens do nome normalizado."""
    return set(nome_norm.split())


def score_match(nome_perfil, nome_pesquisa):
    """Calcula score de similaridade entre dois nomes."""
    n1 = normalizar(nome_perfil)
    n2 = normalizar(nome_pesquisa)

    if not n1 or not n2:
        return 0.0

    # Match exato
    if n1 == n2:
        return 1.0

    # Um contem o outro
    if n1 in n2 or n2 in n1:
        return 0.9

    # Tokens em comum
    t1 = tokenizar_nome(n1)
    t2 = tokenizar_nome(n2)

    # Remover tokens muito comuns
    stopwords = {"de", "da", "do", "dos", "das", "e", "filho", "junior", "neto",
                 "sobrinho", "ii", "iii", "neta"}
    t1_sig = t1 - stopwords
    t2_sig = t2 - stopwords

    if not t1_sig or not t2_sig:
        t1_sig = t1
        t2_sig = t2

    intersec = t1_sig & t2_sig
    if not intersec:
        return 0.0

    # Jaccard modificado - prioriza cobertura do nome MENOR (mais especifico)
    menor = min(len(t1_sig), len(t2_sig))
    score = len(intersec) / max(len(t1_sig), len(t2_sig))

    # Bonus se cobre todo o nome mais curto
    if len(intersec) >= menor and menor >= 2:
        score = max(score, 0.8)

    # Bonus se sobrenome principal bate (ultimo token)
    sobrenome1 = n1.split()[-1] if n1.split() else ""
    sobrenome2 = n2.split()[-1] if n2.split() else ""
    if sobrenome1 and sobrenome2 and sobrenome1 == sobrenome2:
        score = max(score, 0.65)

    # Bonus se primeiro nome + sobrenome batem
    primeiro1 = n1.split()[0] if n1.split() else ""
    primeiro2 = n2.split()[0] if n2.split() else ""
    if primeiro1 and primeiro2 and primeiro1 == primeiro2 and sobrenome1 == sobrenome2:
        score = max(score, 0.85)

    return score


# ============================================================
# MAPEAMENTO MANUAL DE ALIAS (nomes conhecidos com variacao)
# ============================================================

ALIAS_MAP = {
    # STF
    "gilmar ferreira mendes": "gilmar mendes",
    "luiz edson fachin": "edson fachin",
    "carmen lucia antunes rocha": "carmen lucia",
    "jose antonio dias toffoli": "dias toffoli",
    "kassio nunes marques": "nunes marques",
    "andre luiz de almeida mendonca": "andre mendonca",
    "cristiano zanin martins": "cristiano zanin",
    "flavio dino de castro e costa": "flavio dino",
    "luis roberto barroso": "luis roberto barroso",

    # STJ
    "antonio herman de vasconcellos e benjamin": "herman benjamin",
    "antonio herman de vasconcelos e benjamin": "herman benjamin",
    "herman de vasconcellos e benjamin": "herman benjamin",
    "herman de vasconcelos e benjamin": "herman benjamin",
    "fatima nancy andrighi": "nancy andrighi",
    "joao otavio de noronha": "joao otavio de noronha",
    "humberto eustaquio soares martins": "humberto martins",
    "maria thereza rocha de assis moura": "maria thereza de assis moura",
    "geraldo og niceas marques fernandes": "og fernandes",
    "luis felipe salomao": "luis felipe salomao",
    "mauro luiz campbell marques": "mauro campbell marques",
    "raul araujo filho": "raul araujo",
    "maria isabel diniz gallotti rodrigues": "isabel gallotti",
    "maria isabel gallotti": "isabel gallotti",
    "ricardo villas boas cueva": "villas boas cueva",
    "sebastiao alves dos reis junior": "sebastiao reis junior",
    "marco aurelio gastaldi buzzi": "marco buzzi",
    "marco aurelio bellizze oliveira": "marco aurelio bellizze",
    "sergio luiz kukina": "sergio kukina",
    "paulo dias de moura ribeiro": "moura ribeiro",
    "rogerio schietti machado cruz": "rogerio schietti cruz",
    "luiz alberto gurgel de faria": "gurgel de faria",
    "reynaldo soares da fonseca": "reynaldo soares da fonseca",
    "marcelo navarro ribeiro dantas": "ribeiro dantas",
    "jose afranio vilela": "afranio vilela",
    "daniela rodrigues teixeira": "daniela teixeira",
    "maria marluce caldas bezerra": "marluce caldas",
    "carlos augusto pires brandao": "carlos pires brandao",
    "francisco candido de melo falcao neto": "francisco falcao",
    "antonio carlos ferreira": "antonio carlos ferreira",
    "joel ilan paciornik": "joel ilan paciornik",
    "antonio saldanha palheiro": "antonio saldanha palheiro",
    "messod azulay neto": "messod azulay neto",
    "otavio de almeida toledo": "otavio de almeida toledo",
    "paulo sergio domingues": "paulo sergio domingues",
    "teodoro silva santos": "teodoro silva santos",
    "benedito goncalves": "benedito goncalves",
    "regina helena costa": "regina helena costa",

    # TRF1 - nomes do MD -> nomes dos JSON
    "italo fioravanti sabo mendes": "italo mendes",
    "marcus vinicius reis bastos": "marcus bastos",
    "katia balbino": "katia balbino",
    "gustavo soares amorim": "gustavo soares amorim",
    "gustavo amorim": "gustavo soares amorim",
    "ney de barros bello filho": "ney bello",
    "flavio jaime de moraes jardim": "flavio jardim",
    "joao batista moreira": "joao batista moreira",
    "gilda sigmaringa seixas": "gilda sigmaringa seixas",
    "neviton guedes": "neviton guedes",
    "maria do carmo cardoso": "maria do carmo cardoso",
    "antonio souza prudente": "antonio scarpa",
    "marcos augusto de sousa": "marcos augusto de sousa",
    "wilson alves de souza": "wilson alves de souza",
    "cesar jatahy": "cesar jatahy",
    "rafael paulo soares pinto": "rafael paulo",
    "rafael paulo": "rafael paulo",
    "maura moraes tayer": "maura moraes tayer",
    "marcelo velasco nascimento albernaz": "marcelo albernaz",
    "marcelo albernaz": "marcelo albernaz",
    "solange salgado da silva": "solange salgado da silva",
    "solange salgado": "solange salgado da silva",
    "rui costa goncalves": "rui goncalves",
    "rui goncalves": "rui goncalves",
    "urbano leal berquo neto": "urbano leal berquo neto",
    "urbano leal": "urbano leal berquo neto",
    "nilza maria costa dos reis": "nilza reis",
    "nilza reis": "nilza reis",
    "euler de almeida silva junior": "euler de almeida",
    "euler de almeida": "euler de almeida",
    "candice lavocat galvao jobim": "candice lavocat galvao jobim",
    "candice lavocat": "candice lavocat galvao jobim",
    "rosimayre goncalves de carvalho": "rosimayre goncalves de carvalho",
    "rosimayre goncalves": "rosimayre goncalves de carvalho",
    "roberto veloso": "roberto carvalho veloso",
    "roberto carvalho veloso": "roberto carvalho veloso",
    "pedro braga filho": "pedro braga filho",
    "pablo zuniga dourado": "pablo zuniga",
    "pablo zuniga": "pablo zuniga",
    "alexandre jorge fontes laranjeira": "alexandre laranjeira",
    "alexandre laranjeira": "alexandre laranjeira",
    "carlos moreira alves": "carlos eduardo moreira alves",
    "carlos eduardo moreira alves": "carlos eduardo moreira alves",
    "daniele maranhao costa": "daniele maranhao",
    "daniele maranhao": "daniele maranhao",
    "ana carolina roman": "ana carolina roman",
    "eduardo martins": "eduardo martins",
    "jose amilcar machado": "jose amilcar machado",
    "pedro felipe santos": "pedro felipe santos",
    "john silas": "john silas",
    "angela catao": "angela catao",
    "newton ramos": "newton ramos",
    "hercules fajoses": "hercules fajoses",

    # TJDFT
    "waldir leoncio lopes junior": "waldir leoncio cordeiro lopes junior",
    "waldir leoncio ferreira junior": "waldir leoncio cordeiro lopes junior",
    "waldir leoncio cordeiro lopes junior": "waldir leoncio cordeiro lopes junior",
    "vera lucia andrighi": "vera lucia andrighi",
    "mario zam belmiro rosa": "mario zam belmiro rosa",
    "hector valverde santanna": "hector valverde",
    "hector valverde": "hector valverde",
    "leonardo roscoe bessa": "leonardo roscoe bessa",
    "sandra reves vasques tonussi": "sandra reves vasques tonussi",
    "sandra de santis": "sandra de santis",
    "alvaro luis de araujo sales ciarlini": "alvaro ciarlini",
    "alvaro ciarlini": "alvaro ciarlini",
    "carlos pires soares neto": "carlos pires soares neto",
    "maria ivatonia barbosa dos santos": "maria ivatonia barbosa dos santos",
    "fabricio fontoura bezerra": "fabricio fontoura bezerra",
    "romeu gonzaga neiva": "romeu gonzaga neiva",
    "teofilo rodrigues caetano neto": "teofilo rodrigues caetano neto",
    "fernando antonio habibe pereira": "fernando antonio habibe pereira",
    "fabio eduardo marques": "fabio eduardo marques",
    "roberto freitas filho": "roberto freitas filho",
    "joao egmont leoncio lopes": "joao egmont leoncio lopes",
    "jose cruz macedo": "jose cruz macedo",
    "renato rodovalho scussel": "renato rodovalho scussel",
    "renato scussel": "renato rodovalho scussel",
    "lucimeire maria da silva": "lucimeire maria da silva",
    "gislene pinheiro de oliveira": "gislene pinheiro de oliveira",
    "gislene pinheiro": "gislene pinheiro de oliveira",
}


def resolver_alias(nome_norm):
    """Tenta resolver alias para nome padrao."""
    if nome_norm in ALIAS_MAP:
        return ALIAS_MAP[nome_norm]
    return nome_norm


# ============================================================
# PARSER DOS ARQUIVOS MARKDOWN
# ============================================================

class DadosMagistrado:
    """Armazena dados extraidos de um magistrado."""

    def __init__(self, nome, tribunal=None):
        self.nome = nome
        self.tribunal = tribunal
        self.nome_completo = None
        self.nascimento_data = None
        self.nascimento_cidade = None
        self.indicacao = None
        self.nomeacao = None
        self.posse = None
        self.origem = None  # MP, Advocacia, Carreira, etc
        self.perfil_ideologico = None
        self.perfil_psicologico = None
        self.estilo_decisorio = None
        self.padrao_decisorio = {}  # tema -> descricao
        self.clone_trigger = None
        self.perguntas_ancora = []
        self.analise_comportamental = None
        self.secao = None  # 1a, 2a, 3a
        self.turma = None
        self.fontes = []
        self.textos_brutos = []  # textos nao parseados para referencia

    def to_dict(self):
        d = {}
        if self.nome_completo:
            d["nome_completo"] = self.nome_completo
        if self.nascimento_data or self.nascimento_cidade:
            d["nascimento"] = {}
            if self.nascimento_data:
                d["nascimento"]["data"] = self.nascimento_data
            if self.nascimento_cidade:
                d["nascimento"]["cidade"] = self.nascimento_cidade

        dossie = {}
        if self.indicacao:
            dossie["indicacao"] = self.indicacao
        if self.nomeacao:
            dossie["nomeacao"] = self.nomeacao
        if self.posse:
            dossie["posse"] = self.posse
        if self.origem:
            dossie["origem"] = self.origem
        if self.perfil_ideologico:
            dossie["perfil_ideologico"] = self.perfil_ideologico
        if self.perfil_psicologico:
            dossie["perfil_psicologico"] = self.perfil_psicologico
        if self.estilo_decisorio:
            dossie["estilo_decisorio"] = self.estilo_decisorio
        if self.padrao_decisorio:
            dossie["padrao_decisorio"] = self.padrao_decisorio
        if self.clone_trigger:
            dossie["clone_trigger"] = self.clone_trigger
        if self.perguntas_ancora:
            dossie["perguntas_ancora"] = self.perguntas_ancora
        if self.analise_comportamental:
            dossie["analise_comportamental"] = self.analise_comportamental
        if self.secao:
            dossie["secao"] = self.secao
        if self.turma:
            dossie["turma"] = self.turma

        if dossie:
            d["dados_dossie"] = dossie
        if self.fontes:
            d["fontes_pesquisa"] = self.fontes

        return d


def ler_md_seguro(filepath):
    """Le arquivo MD com fallback de encoding. Normaliza escaped dots."""
    for enc in ["utf-8", "utf-8-sig", "latin-1", "cp1252"]:
        try:
            texto = filepath.read_text(encoding=enc)
            # Normalizar escaped dots em numeracao markdown (ex: 4\. -> 4.)
            texto = re.sub(r'(\d+)\\\.', r'\1.', texto)
            return texto
        except (UnicodeDecodeError, UnicodeError):
            continue
    return ""


def parse_dossies_base_v1(texto):
    """Parse dossies_magistrados_base_v1.md - STF."""
    dados = {}

    # Parse blocos ### N. Nome para STF
    blocos = re.split(r"###\s+\d+\.\s+", texto)

    for bloco in blocos[1:]:  # primeiro e cabecalho
        linhas = bloco.strip().split("\n")
        if not linhas:
            continue

        nome_raw = linhas[0].strip()
        dm = DadosMagistrado(nome_raw, "STF")

        bloco_texto = "\n".join(linhas[1:])

        # Nome completo
        m = re.search(r"Nome completo:\s*(.+?)(?:\s*$|\s*\n)", bloco_texto)
        if m:
            dm.nome_completo = m.group(1).strip()

        # Nascimento
        m = re.search(r"Nascimento:\s*(\d{2}/\d{2}/\d{4})\s*\(([^)]+)\)", bloco_texto)
        if m:
            dm.nascimento_data = m.group(1).strip()
            dm.nascimento_cidade = m.group(2).strip()
        elif re.search(r"(\d{2}/\d{2}/\d{4})", bloco_texto):
            datas = re.findall(r"(\d{2}/\d{2}/\d{4})", bloco_texto)
            # Verificar padrao Indicacao/Nomeacao/Posse
            m_dates = re.search(
                r"Indica[cç][aã]o:\s*(\d{2}/\d{2}/\d{4})\s*.*?Nomea[cç][aã]o:\s*(\d{2}/\d{2}/\d{4})\s*.*?Posse:\s*(\d{2}/\d{2}/\d{4})",
                bloco_texto, re.DOTALL
            )
            if m_dates:
                dm.indicacao = m_dates.group(1)
                dm.nomeacao = m_dates.group(2)
                dm.posse = m_dates.group(3)

        # Datas separadas
        m = re.search(r"Indica[cç][aã]o:\s*(\d{2}/\d{2}/\d{4})", bloco_texto)
        if m and not dm.indicacao:
            dm.indicacao = m.group(1)
        m = re.search(r"Nomea[cç][aã]o:\s*(\d{2}/\d{2}/\d{4})", bloco_texto)
        if m and not dm.nomeacao:
            dm.nomeacao = m.group(1)
        m = re.search(r"Posse:\s*(\d{2}/\d{2}/\d{4})", bloco_texto)
        if m and not dm.posse:
            dm.posse = m.group(1)

        # Datas no formato compacto DD/MM/YYYY separadas por bullet
        m = re.search(r"Indica..o:\s*(\d{2}/\d{2}/\d{4})\s*[•·]\s*Nomea..o:\s*(\d{2}/\d{2}/\d{4})\s*[•·]\s*Posse:\s*(\d{2}/\d{2}/\d{4})", bloco_texto)
        if m and not dm.indicacao:
            dm.indicacao = m.group(1)
            dm.nomeacao = m.group(2)
            dm.posse = m.group(3)

        # Eixo provavel / sinais
        m = re.search(r"Eixo prov[aá]vel:\s*(.+?)(?:\n|$)", bloco_texto)
        if m:
            dm.perfil_ideologico = m.group(1).strip()

        # Perguntas ancora
        m = re.search(r'"Perguntas-[aâ]ncora"[^:]*:\s*(.+?)(?:\n\n|\*\*Fontes|$)', bloco_texto, re.DOTALL)
        if m:
            perguntas_text = m.group(1).strip()
            perguntas = re.findall(r'\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\)\s*([^;()]+)', perguntas_text)
            if perguntas:
                dm.perguntas_ancora = [p.strip().rstrip('.') for p in perguntas]

        # Fontes
        urls = re.findall(r'https?://[^\s\)]+', bloco_texto)
        for url in urls:
            dm.fontes.append({"url": url.rstrip('.'), "tipo": "pesquisa_perplexity", "arquivo": "dossies_magistrados_base_v1.md"})

        nome_key = normalizar(nome_raw)
        dados[nome_key] = dm

    return dados


def parse_aprofundamento(texto):
    """Parse Aprofundamento de Perfis de Magistrados.md - STJ, TRF1, TJDFT."""
    dados = {}

    # --- STJ: Parse tabelas markdown ---
    # Tabelas tem formato: | Ministro | Origem | Perfil | Analise |
    tabela_pattern = re.compile(
        r'\|\s*\*\*([^*|]+)\*\*\s*\|\s*([^|]*)\|\s*\*\*([^*|]+)\*\*\s*\|\s*([^|]+)\|',
        re.MULTILINE
    )

    # Detectar secao atual
    secao_atual = None
    linhas = texto.split("\n")

    for i, linha in enumerate(linhas):
        # Detectar secao
        if "Primeira Seção" in linha or "1.2." in linha or "Direito Público" in linha:
            secao_atual = "1a Secao (Direito Publico)"
        elif "Segunda Seção" in linha or "1.3." in linha or "Direito Privado" in linha:
            secao_atual = "2a Secao (Direito Privado)"
        elif "Terceira Seção" in linha or "1.4." in linha or "Direito Penal" in linha:
            secao_atual = "3a Secao (Direito Penal)"
        elif "TRF-1" in linha or "TRF1" in linha or "Capítulo 2" in linha:
            secao_atual = None  # Mudou para TRF1
        elif "TJDFT" in linha or "Capítulo 3" in linha:
            secao_atual = None  # Mudou para TJDFT

    # Parse tabelas STJ
    for m in tabela_pattern.finditer(texto):
        nome = m.group(1).strip()
        origem = m.group(2).strip()
        perfil_tag = m.group(3).strip()
        analise = m.group(4).strip()

        dm = DadosMagistrado(nome, "STJ")
        dm.origem = origem if origem else None
        dm.perfil_ideologico = perfil_tag
        dm.analise_comportamental = analise

        # Determinar secao pelo contexto
        pos = m.start()
        texto_antes = texto[:pos]
        if "Terceira Seção" in texto_antes[-2000:] or "Direito Penal" in texto_antes[-2000:]:
            dm.secao = "3a Secao (Direito Penal)"
        elif "Segunda Seção" in texto_antes[-2000:] or "Direito Privado" in texto_antes[-2000:]:
            dm.secao = "2a Secao (Direito Privado)"
        elif "Primeira Seção" in texto_antes[-2000:] or "Direito Público" in texto_antes[-2000:]:
            dm.secao = "1a Secao (Direito Publico)"

        nome_key = normalizar(nome)
        dados[nome_key] = dm

    # Parse blocos **Ministro/Ministra Nome** para STJ (fora das tabelas)
    # Formato: **Ministro Name (Role)**\n\n* **Perfil:** Description
    # Also: * **Ministra Name:** Description
    padrao_ministro = re.compile(
        r'\*?\s*\*\*(Ministr[oa])\s+([^:*]+?)(?:\s*\(.*?\))?\s*:?\*\*\s*(.+?)(?=\*?\s*\*\*Ministr|\*\s*\*\*Nomes\s+Faltantes|###|\n\n\n|$)',
        re.DOTALL
    )

    for m in padrao_ministro.finditer(texto):
        nome = m.group(2).strip()
        descricao = m.group(3).strip()

        nome_key = normalizar(nome)
        if nome_key in dados:
            # Complementar dados existentes
            if not dados[nome_key].analise_comportamental:
                dados[nome_key].analise_comportamental = descricao[:500]
        else:
            dm = DadosMagistrado(nome, "STJ")
            dm.analise_comportamental = descricao[:500]

            # Extrair perfil se disponivel
            perfil_m = re.search(r'(?:Perfil|perfil)[^:]*:\s*\*?\*?([^.]+)', descricao)
            if perfil_m:
                dm.perfil_ideologico = perfil_m.group(1).strip()

            dados[nome_key] = dm

    # Parse TJDFT - blocos numerados com * Perfil:*
    tjdft_pattern = re.compile(
        r'\d+\.\s*\*\*([^*]+)\*\*.*?\*Perfil:\*\s*\*?\*?([^.]+(?:\.[^*]+)?)',
        re.DOTALL
    )

    for m in tjdft_pattern.finditer(texto):
        # Verificar se esta na secao TJDFT
        pos = m.start()
        texto_antes = texto[:pos]
        if "TJDFT" not in texto_antes[-5000:] and "Capítulo 3" not in texto_antes[-5000:]:
            continue

        nome = m.group(1).strip().rstrip(":")
        perfil = m.group(2).strip()

        nome_key = normalizar(nome)
        if nome_key not in dados:
            dm = DadosMagistrado(nome, "TJDFT")
            dm.perfil_ideologico = perfil[:200]
            dm.analise_comportamental = perfil
            dados[nome_key] = dm
        else:
            if not dados[nome_key].perfil_ideologico:
                dados[nome_key].perfil_ideologico = perfil[:200]

    # Parse TJDFT - blocos com **Nome:** seguido de *Perfil:*
    tjdft_block = re.compile(
        r'\*\*([^*]+?)\s*(?:\((?:Decano|Presidente|Vice|Corregedor)[^)]*\))?\s*:?\*\*[^*]*?\*Perfil:\*\s*(.*?)(?=\d+\.\s*\*\*|\*\*Administra|##|$)',
        re.DOTALL
    )

    for m in tjdft_block.finditer(texto):
        pos = m.start()
        texto_antes = texto[:pos]
        if "TJDFT" not in texto_antes[-5000:] and "Capítulo 3" not in texto_antes[-5000:]:
            continue

        nome = m.group(1).strip().rstrip(":")
        perfil_texto = m.group(2).strip()

        # Limpar perfil
        perfil_texto = re.sub(r'\s+', ' ', perfil_texto)[:500]

        nome_key = normalizar(nome)
        if nome_key not in dados:
            dm = DadosMagistrado(nome, "TJDFT")
            dm.analise_comportamental = perfil_texto

            # Extrair tag de perfil
            perfil_tag_m = re.match(r'\*?\*?([^.]+)', perfil_texto)
            if perfil_tag_m:
                dm.perfil_ideologico = perfil_tag_m.group(1).strip()

            dados[nome_key] = dm

    # Parse TJDFT Administracao Superior: * **Role:** Des./Desa. **Name**. *Perfil:* Description
    # Format: bold role, then Des./Desa. prefix, then bold name, then description
    admin_pattern = re.compile(
        r'\*\s*\*\*[^*]+\*\*[:\s]+(?:Des\.|Desa\.)\s*\*\*([^*]+)\*\*\.\s*(.*?)(?=\*\s*\*\*|$)',
        re.DOTALL
    )

    # Restrict to TJDFT section
    tjdft_secao_match = re.search(
        r'(?:Cap[ií]tulo\s*3|TJDFT|Tribunal de Justi[cç]a do Distrito)(.*?)(?:Cap[ií]tulo\s*4|S[ií]ntese|Conclus|$)',
        texto, re.DOTALL
    )
    if tjdft_secao_match:
        tjdft_texto = tjdft_secao_match.group(1)

        for m in admin_pattern.finditer(tjdft_texto):
            nome = m.group(1).strip().rstrip(".")
            desc = re.sub(r'\s+', ' ', m.group(2).strip())

            if len(nome) < 3 or len(nome) > 60:
                continue

            nome_key = normalizar(nome)
            if nome_key not in dados:
                dm = DadosMagistrado(nome, "TJDFT")
                dm.analise_comportamental = desc[:500]

                perfil_m = re.search(r'\*Perfil:\*\s*(.*?)(?=\*|$)', desc)
                if perfil_m:
                    dm.perfil_ideologico = perfil_m.group(1).strip()[:200]

                dados[nome_key] = dm

        # Also parse: * **N. Name:** *Perfil:* Description (numbered TJDFT list)
        tjdft_num_perfil = re.compile(
            r'\d+\.\s*\*\*([^*]+?)\*\*[:\s]*\*Perfil:\*\s*(.*?)(?=\d+\.\s*\*\*|\n\n|###|$)',
            re.DOTALL
        )

        for m in tjdft_num_perfil.finditer(tjdft_texto):
            nome = m.group(1).strip().rstrip(":")
            nome = re.sub(r'\s*\(.*?\)', '', nome).strip()
            desc = re.sub(r'\s+', ' ', m.group(2).strip())

            if len(desc) < 10 or len(nome) > 60:
                continue

            nome_key = normalizar(nome)
            if nome_key not in dados:
                dm = DadosMagistrado(nome, "TJDFT")
                dm.analise_comportamental = desc[:500]
                dm.perfil_ideologico = desc[:200]
                dados[nome_key] = dm

    # Extrair secao TRF1 completa do texto
    trf1_secao_match = re.search(
        r'(?:Cap[ií]tulo\s*2|TRF.1.*?Gigante)(.*?)(?:Cap[ií]tulo\s*3|TJDFT|Tribunal de Justi[cç]a do Distrito|$)',
        texto, re.DOTALL
    )
    trf1_texto = trf1_secao_match.group(1) if trf1_secao_match else ""

    if trf1_texto:
        # Parse TRF1 numbered items (with optional escaped dots): N. or N\. **Nome (Cargo):** *Perfil:* descricao
        trf1_pattern = re.compile(
            r'\d+\\?\.\s*\*\*([^*]+)\*\*.*?\*Perfil:\*\s*\*?\*?([^.]+(?:\.[^*\n]+)?)',
            re.DOTALL
        )

        for m in trf1_pattern.finditer(trf1_texto):
            nome = m.group(1).strip().rstrip(":")
            nome = re.sub(r'\s*\(.*?\)', '', nome).strip()
            perfil = m.group(2).strip()

            nome_key = normalizar(nome)
            if nome_key not in dados:
                dm = DadosMagistrado(nome, "TRF1")
                dm.perfil_ideologico = perfil[:200]
                dm.analise_comportamental = perfil
                dados[nome_key] = dm

        # Parse TRF1 numbered items without *Perfil:* tag: N. or N\. **Name:** Description
        trf1_numbered2 = re.compile(
            r'\d+\\?\.\s*\*\*([^*]+?)\*\*[^:]*?:\s*(.*?)(?=\d+\\?\.\s*\*\*|\n\n\*\*|\n###|$)',
            re.DOTALL
        )

        for m in trf1_numbered2.finditer(trf1_texto):
            nome = m.group(1).strip().rstrip(":")
            nome = re.sub(r'\s*\(.*?\)', '', nome).strip()
            desc = re.sub(r'\s+', ' ', m.group(2).strip())

            if len(desc) < 15 or len(nome) > 60:
                continue

            nome_key = normalizar(nome)
            if nome_key not in dados:
                dm = DadosMagistrado(nome, "TRF1")
                dm.analise_comportamental = desc[:500]

                perfil_m = re.search(r'(?:Perfil|perfil)[^.]*?[.:]\s*\*?\*?([^.]+)', desc)
                if perfil_m:
                    dm.perfil_ideologico = perfil_m.group(1).strip()[:200]

                dados[nome_key] = dm

        # Parse TRF1 bullet-point names: * **Name (Cargo):** Description
        trf1_desc = re.compile(
            r'\*\s*\*\*([^*]+?)(?:\s*\([^)]+\))?\s*:?\*\*\s*(.*?)(?=\*\s*\*\*|\n\n\*\*|\n###|$)',
            re.DOTALL
        )

        for m in trf1_desc.finditer(trf1_texto):
            nome = m.group(1).strip().rstrip(":")
            desc = re.sub(r'\s+', ' ', m.group(2).strip())

            if len(desc) < 15 or len(nome) > 60:
                continue

            nome_key = normalizar(nome)
            if nome_key not in dados:
                dm = DadosMagistrado(nome, "TRF1")
                dm.analise_comportamental = desc[:500]

                perfil_m = re.search(r'(?:Perfil|perfil)[^.]*?[.:]\s*\*?\*?([^.]+)', desc)
                if perfil_m:
                    dm.perfil_ideologico = perfil_m.group(1).strip()[:200]

                dados[nome_key] = dm

        # Parse inline long lines with N. or N\. **Name:** desc (common in "Geracao Intermediaria" section)
        # These are compacted in a single paragraph, with escaped dots like 9\.
        trf1_inline = re.findall(
            r'(?:^|\s)\d+\\?\.\s*\*\*([^*]+?)\*\*[:\s]+(.*?)(?=\s*\d+\\?\.\s*\*\*|$)',
            trf1_texto
        )

        for nome, desc in trf1_inline:
            nome = nome.strip().rstrip(":")
            nome = re.sub(r'\s*\(.*?\)', '', nome).strip()
            desc = re.sub(r'\s+', ' ', desc.strip())

            if len(desc) < 10 or len(nome) > 60:
                continue

            nome_key = normalizar(nome)
            if nome_key not in dados:
                dm = DadosMagistrado(nome, "TRF1")
                dm.analise_comportamental = desc[:500]
                dados[nome_key] = dm

        # Parse plain text inline list (like "Lista Completa Reconstruida" in Aprofundamento)
        # Format: "Nome (description), Nome, Nome (description), ..."
        lista_completa = re.search(r'Lista Completa[^:]*:\s*(.*?)(?=###|$)', trf1_texto, re.DOTALL)
        if lista_completa:
            lista_text = lista_completa.group(1)
            # Extract names in parentheses or before commas
            nomes_lista = re.findall(r'([A-Z][a-záàâãéèêíïóôõöúçñ]+(?:\s+[A-Za-záàâãéèêíïóôõöúçñ]+){1,5})(?:\s*\([^)]*\))?,?', lista_text)
            for nome in nomes_lista:
                nome = nome.strip().rstrip(",")
                if len(nome) < 5 or len(nome) > 60:
                    continue
                # Skip section titles
                if any(kw in nome.lower() for kw in ["além dos", "compõem", "baseado", "plenário", "confirmados"]):
                    continue
                nome_key = normalizar(nome)
                if nome_key not in dados:
                    dm = DadosMagistrado(nome, "TRF1")
                    dados[nome_key] = dm

    return dados


def parse_clones_digitais(texto):
    """Parse Criacao de Clones Digitais de Magistrados.md - STF detalhado + STJ."""
    dados = {}

    # Parse STF - blocos #### **Ministro/Ministra Nome** (com bold markers)
    # Formato real: #### **Ministro Gilmar Ferreira Mendes (Decano e Presidente)**
    # Tambem aceita sem bold: #### Ministro Nome
    stf_blocks = re.split(r'####\s+\*{0,2}\s*(?:Ministr[oa]|Min\.)\s+', texto)

    for bloco in stf_blocks[1:]:
        linhas = bloco.strip().split("\n")
        if not linhas:
            continue

        nome_raw = linhas[0].strip().rstrip(":")
        # Remover bold markers ** no final
        nome_raw = nome_raw.rstrip("*").strip()
        # Remover parenteses
        nome_raw = re.sub(r'\s*\(.*?\)', '', nome_raw).strip()
        # Remover bold markers restantes
        nome_raw = nome_raw.replace("**", "").strip()

        dm = DadosMagistrado(nome_raw, "STF")
        bloco_texto = "\n".join(linhas[1:])

        # Dados Demograficos
        m = re.search(r'\*\s*\*\*Dados Demogr[aá]ficos:\*\*\s*(.*?)(?=\*\s*\*\*Psicologia|\*\s*\*\*Padr[oõ]es|$)', bloco_texto, re.DOTALL)
        if m:
            demo = m.group(1).strip()
            # Cidade natal
            natal_m = re.search(r'Natural de\s+([^.(]+)', demo)
            if natal_m:
                dm.nascimento_cidade = natal_m.group(1).strip()
            # Origem
            origem_m = re.search(r'Origem:\s*([^.(]+)', demo)
            if origem_m:
                dm.origem = origem_m.group(1).strip()
            elif re.search(r'Minist[eé]rio P[uú]blico', demo):
                dm.origem = "Ministerio Publico"
            elif re.search(r'Advocacia', demo):
                dm.origem = "Advocacia"
            elif re.search(r'Magistratura', demo):
                dm.origem = "Magistratura de Carreira"

        # Psicologia e Estilo
        m = re.search(r'\*\s*\*\*Psicologia e Estilo:\*\*\s*(.*?)(?=\*\s*\*\*Padr[oõ]es|$)', bloco_texto, re.DOTALL)
        if m:
            psico = m.group(1).strip()
            dm.perfil_psicologico = re.sub(r'\s+', ' ', psico)[:500]

        # Padroes de Decisao
        m = re.search(r'\*\s*\*\*Padr[oõ]es de Decis[aã]o.*?\*\*\s*(.*?)(?=####|##\s*---|$)', bloco_texto, re.DOTALL)
        if m:
            padroes_texto = m.group(1).strip()

            # Parse sub-temas
            temas = re.findall(r'\*\s*\*([^*]+)\*\s*\*?\*?([^*]+)\*?\*?\s*([^*\n]+(?:\n[^*\n]+)*)', padroes_texto)
            for tema in temas:
                tema_nome = tema[0].strip().rstrip(":")
                desc = (tema[1] + " " + tema[2]).strip()
                dm.padrao_decisorio[tema_nome] = re.sub(r'\s+', ' ', desc)[:300]

            # Alternativa: formato com itálico
            if not dm.padrao_decisorio:
                subtemas = re.findall(r'\*([^*:]+):\*\s*\*?\*?([^*]+)\*?\*?\s*([^\n]+)', padroes_texto)
                for st in subtemas:
                    tema_nome = st[0].strip()
                    desc = (st[1] + " " + st[2]).strip()
                    dm.padrao_decisorio[tema_nome] = re.sub(r'\s+', ' ', desc)[:300]

        # Clone Trigger
        m = re.search(r'\*Clone Trigger:\*\s*(.*?)(?=####|##\s*---|$)', bloco_texto, re.DOTALL)
        if m:
            dm.clone_trigger = re.sub(r'\s+', ' ', m.group(1).strip())[:500]

        # Comportamento em Colegiado
        m = re.search(r'\*Comportamento em Colegiado:\*\s*(.*?)(?=####|##|$)', bloco_texto, re.DOTALL)
        if m:
            dm.analise_comportamental = re.sub(r'\s+', ' ', m.group(1).strip())[:300]

        nome_key = normalizar(nome_raw)
        dados[nome_key] = dm

    # Parse STJ por secao (formato mais simples com listas numeradas)
    # The dots may or may not be escaped with backslash in markdown
    stj_items = re.compile(
        r'\d+\\?\.\s*\*\*([^*]+)\*\*[^:]*?:\s*(.*?)(?=\d+\\?\.\s*\*\*|##\s*---|$)',
        re.DOTALL
    )

    # So pegar itens na secao STJ
    stj_section = re.search(r'(?:3\\?\.\s*Superior Tribunal|STJ.*?Tec[nb]ocracia)(.*?)(?:4\\?\.\s*Tribunal Regional|TRF-1|$)', texto, re.DOTALL)
    if stj_section:
        stj_texto = stj_section.group(1)

        for m in stj_items.finditer(stj_texto):
            nome = m.group(1).strip().rstrip(":")
            nome = re.sub(r'\s*\(.*?\)', '', nome).strip()
            desc = m.group(2).strip()

            # Evitar capturar secoes/titulos
            if len(desc) < 20 or len(nome) > 60:
                continue

            nome_key = normalizar(nome)
            if nome_key not in dados:
                dm = DadosMagistrado(nome, "STJ")
                dm.analise_comportamental = re.sub(r'\s+', ' ', desc)[:500]

                # Extrair perfil
                perfil_m = re.search(r'\*?\*?(?:Perfil|perfil)\s*(?:de\s+)?([^.]+)', desc)
                if perfil_m:
                    dm.perfil_ideologico = perfil_m.group(1).strip()

                # Extrair origem
                origem_m = re.search(r'Origem\s+([^.]+)', desc)
                if origem_m:
                    dm.origem = origem_m.group(1).strip()

                dados[nome_key] = dm

    # Parse TRF1 (section 4 in Clones Digitais)
    trf1_section = re.search(r'(?:4\\?\.\s*Tribunal Regional|TRF.1.*?(?:Gigante|Expandido))(.*?)(?:5\\?\.\s*Tribunal de Justi[cç]a|TJDFT|$)', texto, re.DOTALL)
    if trf1_section:
        trf1_texto = trf1_section.group(1)

        # Formato: N. or N\. **Nome (Cargo):** Descricao (multiline blocks)
        trf1_numbered = re.findall(
            r'\d+\\?\.\s*\*\*([^*]+?)\*\*[^:]*?:\s*(.*?)(?=\d+\\?\.\s*\*\*|\n\n\*\*[A-Z]|\n###|$)',
            trf1_texto, re.DOTALL
        )

        for nome, desc in trf1_numbered:
            nome = nome.strip().rstrip(":")
            nome = re.sub(r'\s*\(.*?\)', '', nome).strip()
            desc = re.sub(r'\s+', ' ', desc.strip())
            if len(desc) < 10 or len(nome) > 60:
                continue

            nome_key = normalizar(nome)
            if nome_key not in dados:
                dm = DadosMagistrado(nome, "TRF1")
                dm.analise_comportamental = desc[:500]

                perfil_m = re.search(r'Perfil\s*(?:de\s+)?([^.]+)', desc)
                if perfil_m:
                    dm.perfil_ideologico = perfil_m.group(1).strip()[:200]

                dados[nome_key] = dm

        # Formato inline: N\. **Nome:** Descricao (items on same line with escaped dots)
        trf1_inline = re.findall(
            r'(?:^|\s)\d+\\?\.\s*\*\*([^*]+?)\*\*[:\s]+(.*?)(?=\s*\d+\\?\.\s*\*\*|$)',
            trf1_texto
        )

        for nome, desc in trf1_inline:
            nome = nome.strip().rstrip(":")
            nome = re.sub(r'\s*\(.*?\)', '', nome).strip()
            desc = re.sub(r'\s+', ' ', desc.strip())
            if len(desc) < 10 or len(nome) > 60:
                continue

            nome_key = normalizar(nome)
            if nome_key not in dados:
                dm = DadosMagistrado(nome, "TRF1")
                dm.analise_comportamental = desc[:500]
                dados[nome_key] = dm

        # Formato bullet: * **Nome:** Descricao
        trf1_bullets = re.findall(
            r'\*\s*\*\*([^*]+?)(?:\s*\(.*?\))?\s*:?\*\*[:\s]+(.*?)(?=\*\s*\*\*|\n\n|###|$)',
            trf1_texto, re.DOTALL
        )

        for nome, desc in trf1_bullets:
            nome = nome.strip().rstrip(":")
            desc = re.sub(r'\s+', ' ', desc.strip())
            if len(desc) < 10 or len(nome) > 60:
                continue

            nome_key = normalizar(nome)
            if nome_key not in dados:
                dm = DadosMagistrado(nome, "TRF1")
                dm.analise_comportamental = desc[:500]

                perfil_m = re.search(r'(?:Perfil|perfil)[^.]*?[.:]\s*([^.]+)', desc)
                if perfil_m:
                    dm.perfil_ideologico = perfil_m.group(1).strip()[:200]

                dados[nome_key] = dm

    # Parse TJDFT (blocos in section 5)
    tjdft_section = re.search(r'(?:5\.\s*Tribunal de Justi[cç]a|TJDFT.*?Laborat[oó]rio)(.*?)(?:6\.\s*Conclus|Refer[eê]ncias|$)', texto, re.DOTALL)
    if tjdft_section:
        tjdft_texto = tjdft_section.group(1)

        # Blocos descritivos: **Nome:** Perfil/Origem etc
        tjdft_items = re.findall(
            r'\*\*([^*]+?)\*\*[^*]*?(?:Perfil|perfil|Origem)[^.]*?[.:]([^*]+?)(?=\*\*[A-Z]|\n\n\*\*|$)',
            tjdft_texto, re.DOTALL
        )

        for nome, desc in tjdft_items:
            nome = nome.strip().rstrip(":")
            desc = desc.strip()
            if len(desc) < 10 or len(nome) > 60:
                continue

            nome_key = normalizar(nome)
            if nome_key not in dados:
                dm = DadosMagistrado(nome, "TJDFT")
                dm.analise_comportamental = re.sub(r'\s+', ' ', desc)[:400]
                dados[nome_key] = dm

        # Bullet-point names without explicit Perfil keyword: * **Name:** Description
        tjdft_bullets = re.findall(
            r'\*\s*\*\*([^*]{3,50}?)\*\*[:\s]+(.*?)(?=\*\s*\*\*|\n\n|###|$)',
            tjdft_texto, re.DOTALL
        )

        for nome, desc in tjdft_bullets:
            nome = nome.strip().rstrip(":")
            desc = re.sub(r'\s+', ' ', desc.strip())
            if len(desc) < 15 or len(nome) > 60:
                continue

            nome_key = normalizar(nome)
            if nome_key not in dados:
                dm = DadosMagistrado(nome, "TJDFT")
                dm.analise_comportamental = desc[:400]
                dados[nome_key] = dm

    return dados


def parse_complementar(texto, arquivo_nome):
    """Parse dos arquivos complementares menores."""
    dados = {}

    # Nao ha muito dado estruturado nos arquivos complementares
    # Mas podemos extrair referencias e metadados

    # Extrair fontes URL
    urls = re.findall(r'https?://[^\s\)\]>]+', texto)

    # Extrair mencoes de ministros com algum contexto
    # Pattern: **Nome** seguido de texto
    mencoes = re.findall(
        r'\*\*([^*]{3,50})\*\*[^*]*?(?:voto|decis|perfil|garant|puniti|ideolog|psicol)',
        texto, re.IGNORECASE
    )

    for nome in mencoes:
        nome = nome.strip().rstrip(":")
        nome_key = normalizar(nome)
        if nome_key and len(nome_key) > 3:
            if nome_key not in dados:
                dm = DadosMagistrado(nome)
                dm.fontes.append({"url": "", "tipo": "pesquisa_perplexity", "arquivo": arquivo_nome})
                dados[nome_key] = dm

    return dados


# ============================================================
# CARREGAR PERFIS JSON
# ============================================================

def carregar_perfis():
    """Carrega todos os perfis JSON e retorna dict {id: (path, data)}."""
    perfis = {}

    for tribunal, diretorio in TRIBUNAL_DIRS.items():
        if not diretorio.exists():
            print(f"  [AVISO] Diretorio nao encontrado: {diretorio}")
            continue

        for arquivo in sorted(diretorio.glob("*.json")):
            try:
                with open(arquivo, "r", encoding="utf-8") as f:
                    data = json.load(f)
                perfis[data.get("id", arquivo.stem)] = {
                    "path": arquivo,
                    "data": data,
                    "tribunal": tribunal,
                }
            except Exception as e:
                print(f"  [ERRO] Ao ler {arquivo}: {e}")

    return perfis


# ============================================================
# MATCHING: DADOS EXTRAIDOS -> PERFIS JSON
# ============================================================

def fazer_matching(dados_extraidos, perfis):
    """
    Para cada magistrado extraido, encontra o perfil JSON correspondente.
    Retorna dict {perfil_id: DadosMagistrado}
    """
    matches = {}
    nao_encontrados = []

    # Construir indice de nomes dos perfis
    perfis_nomes = {}
    for pid, pinfo in perfis.items():
        nome = pinfo["data"].get("nome", "")
        nome_completo = pinfo["data"].get("nome_completo", "")

        nomes_candidatos = [normalizar(nome)]
        if nome_completo:
            nomes_candidatos.append(normalizar(nome_completo))

        # Resolver alias
        for nc in list(nomes_candidatos):
            alias = resolver_alias(nc)
            if alias != nc:
                nomes_candidatos.append(alias)

        perfis_nomes[pid] = nomes_candidatos

    for nome_key, dm in dados_extraidos.items():
        # Resolver alias do nome extraido
        nome_resolvido = resolver_alias(nome_key)

        melhor_pid = None
        melhor_score = 0.0

        for pid, nomes_lista in perfis_nomes.items():
            for nome_perfil in nomes_lista:
                # Testar nome original e alias
                for nome_teste in [nome_key, nome_resolvido]:
                    s = score_match(nome_perfil, nome_teste)
                    if s > melhor_score:
                        melhor_score = s
                        melhor_pid = pid

        if melhor_score >= 0.45 and melhor_pid:
            if melhor_pid not in matches or melhor_score > matches.get(melhor_pid, (None, 0))[1]:
                if melhor_pid in matches:
                    # Merge dados do anterior com o novo se ambos tem dados
                    dm_anterior = matches[melhor_pid][0]
                    dm = merge_dados_magistrado(dm_anterior, dm)
                matches[melhor_pid] = (dm, melhor_score)
        else:
            nao_encontrados.append((nome_key, dm.tribunal))

    if nao_encontrados:
        print(f"\n  [INFO] {len(nao_encontrados)} nomes extraidos sem match nos perfis JSON:")
        for nome, trib in nao_encontrados[:20]:
            print(f"    - {nome} ({trib})")
        if len(nao_encontrados) > 20:
            print(f"    ... e mais {len(nao_encontrados) - 20}")

    return {pid: dm for pid, (dm, score) in matches.items()}


def merge_dados_magistrado(dm1, dm2):
    """Merge dois DadosMagistrado, priorizando dados nao-nulos."""
    resultado = DadosMagistrado(dm1.nome, dm1.tribunal or dm2.tribunal)

    resultado.nome_completo = dm1.nome_completo or dm2.nome_completo
    resultado.nascimento_data = dm1.nascimento_data or dm2.nascimento_data
    resultado.nascimento_cidade = dm1.nascimento_cidade or dm2.nascimento_cidade
    resultado.indicacao = dm1.indicacao or dm2.indicacao
    resultado.nomeacao = dm1.nomeacao or dm2.nomeacao
    resultado.posse = dm1.posse or dm2.posse
    resultado.origem = dm1.origem or dm2.origem
    resultado.perfil_ideologico = dm1.perfil_ideologico or dm2.perfil_ideologico
    resultado.perfil_psicologico = dm1.perfil_psicologico or dm2.perfil_psicologico
    resultado.estilo_decisorio = dm1.estilo_decisorio or dm2.estilo_decisorio
    resultado.clone_trigger = dm1.clone_trigger or dm2.clone_trigger
    resultado.analise_comportamental = dm1.analise_comportamental or dm2.analise_comportamental
    resultado.secao = dm1.secao or dm2.secao
    resultado.turma = dm1.turma or dm2.turma

    # Merge padroes decisorios
    resultado.padrao_decisorio = {**dm2.padrao_decisorio, **dm1.padrao_decisorio}

    # Merge listas
    resultado.perguntas_ancora = dm1.perguntas_ancora or dm2.perguntas_ancora
    resultado.fontes = dm1.fontes + dm2.fontes

    return resultado


# ============================================================
# MERGE NOS PERFIS JSON
# ============================================================

def aplicar_merge(perfis, matches):
    """Aplica os dados extraidos nos perfis JSON."""
    stats = {
        "total_enriquecidos": 0,
        "por_tribunal": {"STF": 0, "STJ": 0, "TJDFT": 0, "TRF1": 0},
        "campos_preenchidos": {},
    }

    for pid, dm in matches.items():
        pinfo = perfis[pid]
        data = pinfo["data"]
        tribunal = pinfo["tribunal"]
        modificado = False

        # 1. nome_completo
        if not data.get("nome_completo") and dm.nome_completo:
            data["nome_completo"] = dm.nome_completo
            modificado = True
            stats["campos_preenchidos"]["nome_completo"] = stats["campos_preenchidos"].get("nome_completo", 0) + 1

        # 2. dados_publicos.dados_dossie
        if "dados_publicos" not in data:
            data["dados_publicos"] = {}

        dossie = data["dados_publicos"].get("dados_dossie", {})
        dm_dict = dm.to_dict()

        if "dados_dossie" in dm_dict:
            for campo, valor in dm_dict["dados_dossie"].items():
                if campo not in dossie or not dossie[campo]:
                    dossie[campo] = valor
                    modificado = True
                    stats["campos_preenchidos"][f"dados_dossie.{campo}"] = stats["campos_preenchidos"].get(f"dados_dossie.{campo}", 0) + 1

        if dossie:
            data["dados_publicos"]["dados_dossie"] = dossie

        # 3. nascimento
        if "nascimento" in dm_dict:
            if "dados_dossie" not in data["dados_publicos"]:
                data["dados_publicos"]["dados_dossie"] = {}
            nasc = data["dados_publicos"]["dados_dossie"].get("nascimento", {})
            for k, v in dm_dict["nascimento"].items():
                if k not in nasc or not nasc[k]:
                    nasc[k] = v
                    modificado = True
                    stats["campos_preenchidos"][f"nascimento.{k}"] = stats["campos_preenchidos"].get(f"nascimento.{k}", 0) + 1
            data["dados_publicos"]["dados_dossie"]["nascimento"] = nasc

        # 4. atuacao_profissional
        if not data.get("atuacao_profissional"):
            data["atuacao_profissional"] = {}

        if dm.origem and not data["atuacao_profissional"].get("origem"):
            data["atuacao_profissional"]["origem"] = dm.origem
            modificado = True
            stats["campos_preenchidos"]["atuacao_profissional.origem"] = stats["campos_preenchidos"].get("atuacao_profissional.origem", 0) + 1

        # 5. padroes_decisao
        if dm.padrao_decisorio and not data.get("padroes_decisao"):
            data["padroes_decisao"] = dm.padrao_decisorio
            modificado = True
            stats["campos_preenchidos"]["padroes_decisao"] = stats["campos_preenchidos"].get("padroes_decisao", 0) + 1
        elif dm.padrao_decisorio and isinstance(data.get("padroes_decisao"), dict):
            for tema, desc in dm.padrao_decisorio.items():
                if tema not in data["padroes_decisao"]:
                    data["padroes_decisao"][tema] = desc
                    modificado = True

        # 6. hipoteses_para_simulacao.tracos_operacionais
        if "hipoteses_para_simulacao" not in data:
            data["hipoteses_para_simulacao"] = {"instrucoes": [], "tracos_operacionais": [], "confianca_global": None}

        tracos = data["hipoteses_para_simulacao"].get("tracos_operacionais", [])
        if not tracos:
            novos_tracos = []
            if dm.perfil_ideologico:
                novos_tracos.append(f"Perfil ideologico: {dm.perfil_ideologico}")
            if dm.perfil_psicologico:
                novos_tracos.append(f"Perfil psicologico: {dm.perfil_psicologico[:200]}")
            if dm.analise_comportamental:
                novos_tracos.append(f"Analise comportamental: {dm.analise_comportamental[:200]}")
            if dm.clone_trigger:
                novos_tracos.append(f"Clone trigger: {dm.clone_trigger[:200]}")
            if dm.estilo_decisorio:
                novos_tracos.append(f"Estilo decisorio: {dm.estilo_decisorio}")

            if novos_tracos:
                data["hipoteses_para_simulacao"]["tracos_operacionais"] = novos_tracos
                modificado = True
                stats["campos_preenchidos"]["tracos_operacionais"] = stats["campos_preenchidos"].get("tracos_operacionais", 0) + 1

        # 7. Fontes da pesquisa
        fontes_existentes = {f.get("url", "") for f in data.get("fontes", [])}
        novas_fontes = []

        if dm.fontes:
            for f in dm.fontes:
                if f.get("url") and f["url"] not in fontes_existentes:
                    novas_fontes.append(f)
                    fontes_existentes.add(f["url"])

        # Adicionar fonte generica da pesquisa Perplexity
        fonte_perplexity = {
            "url": "",
            "tipo": "pesquisa_perplexity",
            "observacao": "Dados extraidos de pesquisa Perplexity AI (2026-01-30)"
        }
        if not any(f.get("tipo") == "pesquisa_perplexity" for f in data.get("fontes", [])):
            novas_fontes.append(fonte_perplexity)

        if novas_fontes:
            if "fontes" not in data:
                data["fontes"] = []
            data["fontes"].extend(novas_fontes)
            modificado = True
            stats["campos_preenchidos"]["fontes"] = stats["campos_preenchidos"].get("fontes", 0) + 1

        # 8. Atualizar data
        if modificado:
            data["atualizado_em"] = "2026-01-31"
            stats["total_enriquecidos"] += 1
            stats["por_tribunal"][tribunal] = stats["por_tribunal"].get(tribunal, 0) + 1

        perfis[pid]["data"] = data

    return stats


# ============================================================
# SALVAR
# ============================================================

def salvar_perfis(perfis):
    """Salva todos os perfis JSON modificados."""
    for pid, pinfo in perfis.items():
        path = pinfo["path"]
        data = pinfo["data"]

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)


def salvar_dados_complementares(dados_extraidos, matches, perfis):
    """Salva dados complementares em meta/dados_complementares_pesquisa.json."""
    META_DIR.mkdir(parents=True, exist_ok=True)

    output = {
        "gerado_em": "2026-01-31",
        "descricao": "Dados complementares extraidos de pesquisas Perplexity AI para enriquecimento dos perfis de magistrados",
        "total_extraidos": len(dados_extraidos),
        "total_matched": len(matches),
        "matches": {},
        "dados_extraidos": {},
    }

    for pid, dm in matches.items():
        output["matches"][pid] = {
            "nome": dm.nome,
            "tribunal": dm.tribunal,
            **dm.to_dict()
        }

    for nome_key, dm in dados_extraidos.items():
        output["dados_extraidos"][nome_key] = {
            "nome": dm.nome,
            "tribunal": dm.tribunal,
            **dm.to_dict()
        }

    filepath = META_DIR / "dados_complementares_pesquisa.json"
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n  Dados complementares salvos em: {filepath}")


# ============================================================
# MAIN
# ============================================================

def main():
    print("=" * 70)
    print("ENRIQUECIMENTO DE PERFIS DE MAGISTRADOS")
    print("Fonte: Pesquisa Perplexity AI")
    print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)

    # 1. Carregar perfis JSON
    print("\n[1/6] Carregando perfis JSON existentes...")
    perfis = carregar_perfis()
    print(f"  Carregados: {len(perfis)} perfis")
    for trib, d in TRIBUNAL_DIRS.items():
        count = sum(1 for p in perfis.values() if p["tribunal"] == trib)
        print(f"    {trib}: {count} perfis")

    # 2. Ler e parsear arquivos markdown
    print("\n[2/6] Lendo e parseando arquivos markdown...")
    todos_dados = {}

    for md_file in MD_FILES:
        filepath = MD_DIR / md_file
        if not filepath.exists():
            print(f"  [AVISO] Arquivo nao encontrado: {md_file}")
            continue

        print(f"  Processando: {md_file} ({filepath.stat().st_size // 1024}KB)...")
        texto = ler_md_seguro(filepath)

        if not texto:
            print(f"    [AVISO] Arquivo vazio ou ilegivel")
            continue

        if "dossies_magistrados_base" in md_file:
            dados = parse_dossies_base_v1(texto)
            print(f"    Extraidos: {len(dados)} magistrados (STF base)")
        elif "Aprofundamento" in md_file:
            dados = parse_aprofundamento(texto)
            print(f"    Extraidos: {len(dados)} magistrados (STJ/TRF1/TJDFT)")
        elif "Clones Digitais" in md_file or "Criação" in md_file:
            dados = parse_clones_digitais(texto)
            print(f"    Extraidos: {len(dados)} magistrados (STF/STJ detalhado)")
        else:
            dados = parse_complementar(texto, md_file)
            print(f"    Extraidos: {len(dados)} mencoes complementares")

        # Merge nos dados globais
        for nome_key, dm in dados.items():
            if nome_key in todos_dados:
                todos_dados[nome_key] = merge_dados_magistrado(todos_dados[nome_key], dm)
            else:
                todos_dados[nome_key] = dm

    print(f"\n  Total de magistrados extraidos (unicos): {len(todos_dados)}")

    # Stats por tribunal
    tribunais_count = {}
    for dm in todos_dados.values():
        t = dm.tribunal or "?"
        tribunais_count[t] = tribunais_count.get(t, 0) + 1
    for t, c in sorted(tribunais_count.items()):
        print(f"    {t}: {c}")

    # 3. Matching
    print("\n[3/6] Fazendo matching entre dados extraidos e perfis JSON...")
    matches = fazer_matching(todos_dados, perfis)
    print(f"  Matches encontrados: {len(matches)}")

    # 4. Merge
    print("\n[4/6] Aplicando merge nos perfis JSON...")
    stats = aplicar_merge(perfis, matches)

    # 5. Salvar
    print("\n[5/6] Salvando perfis JSON atualizados...")
    salvar_perfis(perfis)
    print("  Perfis salvos com sucesso!")

    # 6. Salvar dados complementares
    print("\n[6/6] Salvando dados complementares...")
    salvar_dados_complementares(todos_dados, matches, perfis)

    # Estatisticas finais
    print("\n" + "=" * 70)
    print("ESTATISTICAS DE ENRIQUECIMENTO")
    print("=" * 70)
    print(f"\nTotal de perfis enriquecidos: {stats['total_enriquecidos']} / {len(perfis)}")
    print(f"\nPor tribunal:")
    for trib in ["STF", "STJ", "TJDFT", "TRF1"]:
        total_trib = sum(1 for p in perfis.values() if p["tribunal"] == trib)
        enriq = stats["por_tribunal"].get(trib, 0)
        print(f"  {trib}: {enriq}/{total_trib} enriquecidos")

    print(f"\nCampos preenchidos:")
    for campo, count in sorted(stats["campos_preenchidos"].items(), key=lambda x: -x[1]):
        print(f"  {campo}: {count}")

    print(f"\nPerfis NAO enriquecidos: {len(perfis) - stats['total_enriquecidos']}")
    nao_enriquecidos = [
        (pid, pinfo["tribunal"], pinfo["data"].get("nome", ""))
        for pid, pinfo in perfis.items()
        if pid not in matches
    ]
    if nao_enriquecidos:
        print("  Lista:")
        for pid, trib, nome in sorted(nao_enriquecidos, key=lambda x: x[1]):
            print(f"    [{trib}] {nome} ({pid})")

    print("\n" + "=" * 70)
    print("CONCLUIDO!")
    print("=" * 70)


if __name__ == "__main__":
    main()
