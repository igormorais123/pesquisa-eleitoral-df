#!/usr/bin/env python3
"""Enriquece perfis do STJ com biografias oficiais do portal do tribunal.

O STJ disponibiliza curriculos dos ministros em atividade em:
  https://www.stj.jus.br/web/verMinistrosSTJ?parametro=1

Cada ministro possui pagina individual com:
  - Dados Pessoais
  - Formacao Academica
  - Funcoes Atuais / Principais Atividades Exercidas
  - Publicacoes
  - Condecoracoes

Este script:
- busca a lista de ministros em atividade (pagina principal)
- identifica a URL individual de cada ministro por cod_matriculamin
- faz match com o perfil JSON pelo slug do nome
- faz parse do HTML para extrair biografia, formacao, carreira, obras
- grava em dados_publicos.biografia_stj_texto, dados_publicos.biografia_stj_url
- atualiza campos top-level: biografia, formacao_academica, carreira

Uso:
  .venv-juris/bin/python scripts/judiciario/enriquecer_stj_biografias.py
"""

from __future__ import annotations

import json
import re
import time
import unicodedata
from pathlib import Path
from typing import Any

import requests
from bs4 import BeautifulSoup, Tag


BASE_DIR = Path("perfis agentes sinteticos judiciário - STF, STJ, TJDF, TRF1")

STJ_BASE = "https://www.stj.jus.br"
STJ_LISTA_URL = f"{STJ_BASE}/web/verMinistrosSTJ?parametro=1"
STJ_CURRICULO_URL = f"{STJ_BASE}/web/verCurriculoMinistro"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")


def _slugify_ascii(s: str) -> str:
    s = s.strip().lower()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def _fetch(url: str, **kwargs: Any) -> requests.Response:
    """GET com retry simples para transitorios."""
    backoff = 2.0
    last_exc: Exception | None = None
    for _ in range(4):
        try:
            r = requests.get(
                url,
                timeout=90,
                verify=False,
                headers=HEADERS,
                **kwargs,
            )
            if r.status_code in (429, 503):
                time.sleep(backoff)
                backoff *= 2
                continue
            r.raise_for_status()
            return r
        except requests.RequestException as exc:
            last_exc = exc
            time.sleep(backoff)
            backoff *= 2
    raise last_exc or RuntimeError(f"Falha ao buscar {url}")


def _clean_text(text: str) -> str:
    """Normaliza espacos e quebras de linha de um trecho de texto."""
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# ---------------------------------------------------------------------------
# Buscar lista de ministros e seus codigos
# ---------------------------------------------------------------------------

def _listar_ministros() -> list[dict[str, str]]:
    """Retorna lista de dicts com 'nome_completo', 'cod', 'url' para cada ministro."""
    r = _fetch(STJ_LISTA_URL)
    soup = BeautifulSoup(r.content, "html.parser")

    ministros: list[dict[str, str]] = []

    # Links para curriculo individual seguem o padrao:
    # verCurriculoMinistro?parametro=1&cod_matriculamin=NNNNNNN
    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"]
        if "verCurriculoMinistro" not in href:
            continue

        m = re.search(r"cod_matriculamin=(\d+)", href)
        if not m:
            continue

        cod = m.group(1)
        nome = a_tag.get_text(strip=True)
        if not nome:
            continue

        # Montar URL absoluta
        if href.startswith("http"):
            url = href
        elif href.startswith("/"):
            url = STJ_BASE + href
        else:
            url = f"{STJ_BASE}/web/{href}"

        ministros.append({
            "nome_completo": nome,
            "cod": cod,
            "url": url,
        })

    return ministros


# ---------------------------------------------------------------------------
# Parse da pagina de curriculo individual
# ---------------------------------------------------------------------------

def _extrair_secoes(soup: BeautifulSoup) -> dict[str, str]:
    """Extrai secoes nomeadas da pagina de curriculo.

    O site do STJ estrutura as biografias com tags <strong> ou <b> para
    titulos de secao, separadas por <hr> ou blocos visuais. As secoes tipicas:
    - Dados Pessoais
    - Formacao Academica
    - Funcoes Atuais
    - Principais Atividades Exercidas
    - Magisterio
    - Publicacoes
    - Condecoracoes, titulos, medalhas
    - Participacao em Eventos
    """
    # Estrategia: extrair todo o texto, depois dividir por headings conhecidos.
    # Primeiro, pegar o container principal do curriculo.
    # O site usa diferentes layouts; tentamos os seletores mais comuns.

    container = None
    for selector in [
        "div.journal-content-article",
        "div#main-content",
        "div.portlet-body",
        "div[id*='curriculo']",
        "div[class*='curriculo']",
        "article",
        "main",
    ]:
        container = soup.select_one(selector)
        if container:
            break

    if not container:
        # Fallback: usar o body inteiro
        container = soup.body or soup

    # Extrair texto limpo preservando separacoes
    full_text = _get_structured_text(container)

    # Dividir em secoes por headings conhecidos
    secao_patterns = [
        (r"(?i)\bDados\s+Pessoais\b", "dados_pessoais"),
        (r"(?i)\bForma[çc][ãa]o\s+Acad[eê]mica\b", "formacao_academica"),
        (r"(?i)\bFun[çc][oõ]es\s+Atuais\b", "funcoes_atuais"),
        (r"(?i)\bPrincipais\s+Atividades\s+Exercidas\b", "atividades_exercidas"),
        (r"(?i)\bAtividade\s+Profissional\b", "atividade_profissional"),
        (r"(?i)\bMagist[eé]rio\b", "magisterio"),
        (r"(?i)\bPublica[çc][oõ]es\b", "publicacoes"),
        (r"(?i)\bCondecora[çc][oõ]es", "condecoracoes"),
        (r"(?i)\bParticipa[çc][ãa]o\s+em\s+Eventos\b", "participacao_eventos"),
        (r"(?i)\bOutras\s+Atividades\b", "outras_atividades"),
    ]

    # Encontrar posicoes de cada secao
    found: list[tuple[int, str, str]] = []
    for pattern, key in secao_patterns:
        m = re.search(pattern, full_text)
        if m:
            found.append((m.start(), key, m.group()))

    found.sort(key=lambda x: x[0])

    secoes: dict[str, str] = {}
    for i, (pos, key, _heading) in enumerate(found):
        # Conteudo vai ate o inicio da proxima secao ou fim do texto
        start = pos
        end = found[i + 1][0] if i + 1 < len(found) else len(full_text)
        # Remover o heading do conteudo
        content = full_text[start:end]
        # Tirar o titulo
        content = re.sub(r"^[^\n]*\n", "", content, count=1)
        content = _clean_text(content)
        if content:
            secoes[key] = content

    return secoes


def _get_structured_text(element: Tag) -> str:
    """Extrai texto de um elemento HTML preservando paragrafos e quebras."""
    lines: list[str] = []
    _walk_element(element, lines)
    text = "\n".join(lines)
    # Limpa linhas em branco excessivas
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _walk_element(el: Tag, lines: list[str]) -> None:
    """Percorre arvore HTML construindo texto com separadores."""
    block_tags = {
        "p", "div", "h1", "h2", "h3", "h4", "h5", "h6",
        "li", "tr", "br", "hr", "blockquote", "pre",
        "section", "article", "header", "footer",
    }

    for child in el.children:
        if isinstance(child, str):
            text = child.strip()
            if text:
                lines.append(text)
        elif isinstance(child, Tag):
            tag_name = child.name.lower() if child.name else ""

            if tag_name == "br":
                lines.append("")
            elif tag_name == "hr":
                lines.append("\n---\n")
            elif tag_name in block_tags:
                lines.append("")
                _walk_element(child, lines)
                lines.append("")
            elif tag_name in ("strong", "b"):
                text = child.get_text(strip=True)
                if text:
                    lines.append(f"\n**{text}**")
            elif tag_name == "script" or tag_name == "style":
                continue
            else:
                _walk_element(child, lines)


def _parse_curriculo(url: str) -> dict[str, Any] | None:
    """Baixa e faz parse de uma pagina de curriculo individual."""
    try:
        r = _fetch(url)
    except Exception:
        return None

    soup = BeautifulSoup(r.content, "html.parser")

    # Texto completo (para biografia geral)
    container = None
    for selector in [
        "div.journal-content-article",
        "div#main-content",
        "div.portlet-body",
        "article",
        "main",
    ]:
        container = soup.select_one(selector)
        if container:
            break

    if not container:
        container = soup.body or soup

    full_text = _get_structured_text(container)
    if not full_text or len(full_text) < 50:
        return None

    secoes = _extrair_secoes(soup)

    # Compor campos estruturados
    biografia = _compor_biografia(full_text, secoes)
    formacao = secoes.get("formacao_academica", "")
    carreira = _compor_carreira(secoes)
    publicacoes = secoes.get("publicacoes", "")

    return {
        "biografia_texto": _clean_text(full_text),
        "secoes": secoes,
        "biografia": biografia,
        "formacao_academica": formacao,
        "carreira": carreira,
        "obras_publicadas": publicacoes,
    }


def _compor_biografia(full_text: str, secoes: dict[str, str]) -> str:
    """Compoe biografia combinando dados pessoais e resumo geral."""
    partes: list[str] = []
    if "dados_pessoais" in secoes:
        partes.append(secoes["dados_pessoais"])
    if "formacao_academica" in secoes:
        partes.append(secoes["formacao_academica"])
    if "funcoes_atuais" in secoes:
        partes.append(secoes["funcoes_atuais"])
    if not partes:
        # Fallback: pegar primeiros 2000 chars do texto completo
        return _clean_text(full_text[:2000])
    return _clean_text("\n\n".join(partes))


def _compor_carreira(secoes: dict[str, str]) -> str:
    """Compoe historico de carreira a partir das secoes relevantes."""
    partes: list[str] = []
    for chave in [
        "funcoes_atuais",
        "atividades_exercidas",
        "atividade_profissional",
        "magisterio",
        "outras_atividades",
    ]:
        if chave in secoes:
            partes.append(secoes[chave])
    return _clean_text("\n\n".join(partes))


# ---------------------------------------------------------------------------
# Match entre ministros do site e perfis JSON
# ---------------------------------------------------------------------------

def _match_ministro(
    nome_perfil: str,
    ministros_site: list[dict[str, str]],
) -> dict[str, str] | None:
    """Tenta casar um nome de perfil JSON com um ministro da lista do site.

    Usa comparacao de slugs (sem acentos, lowercase) com fallback progressivo.
    """
    slug_perfil = _slugify_ascii(nome_perfil)
    if not slug_perfil:
        return None

    # 1. Match exato do slug completo dentro do nome completo do site
    for m in ministros_site:
        slug_site = _slugify_ascii(m["nome_completo"])
        if slug_perfil in slug_site or slug_site in slug_perfil:
            return m

    # 2. Match por partes do nome (pelo menos 2 tokens consecutivos)
    tokens_perfil = slug_perfil.split("-")
    for m in ministros_site:
        slug_site = _slugify_ascii(m["nome_completo"])
        # Tentar com 2+ tokens consecutivos (do mais longo para o mais curto)
        for n_tokens in range(len(tokens_perfil), 1, -1):
            for start in range(len(tokens_perfil) - n_tokens + 1):
                needle = "-".join(tokens_perfil[start : start + n_tokens])
                if needle in slug_site:
                    return m

    # 3. Match por sobrenome principal (ultimo token significativo)
    #    Ignora tokens muito curtos (de, da, dos, e, etc.)
    tokens_signif = [t for t in tokens_perfil if len(t) > 2]
    if tokens_signif:
        sobrenome = tokens_signif[-1]
        primeiro = tokens_signif[0]
        for m in ministros_site:
            slug_site = _slugify_ascii(m["nome_completo"])
            if sobrenome in slug_site and primeiro in slug_site:
                return m

    return None


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    stj_dir = BASE_DIR / "STJ"
    paths = sorted(stj_dir.glob("*.json"))

    if not paths:
        print(f"Nenhum perfil encontrado em {stj_dir}")
        return 1

    print(f"STJ: {len(paths)} perfis encontrados")

    # Buscar lista de ministros do site
    print("Buscando lista de ministros do portal STJ...")
    try:
        ministros_site = _listar_ministros()
    except Exception as exc:
        print(f"Erro ao buscar lista de ministros: {exc}")
        return 1

    print(f"Encontrados {len(ministros_site)} ministros no site do STJ")

    updated = 0
    skipped = 0
    not_found = 0

    for path in paths:
        perfil = _load_json(path)
        dp = perfil.get("dados_publicos") or {}

        # Evitar refazer trabalho
        if dp.get("biografia_stj_texto"):
            skipped += 1
            continue

        nome = perfil.get("nome") or ""
        if not nome:
            skipped += 1
            continue

        # Match com ministro do site
        match = _match_ministro(nome, ministros_site)
        if not match:
            print(f"  NAO ENCONTRADO no site: {nome}")
            not_found += 1
            continue

        url_curriculo = match["url"]
        print(f"  Buscando: {nome} -> {match['nome_completo']} ({url_curriculo})")

        # Parse do curriculo
        resultado = _parse_curriculo(url_curriculo)
        if not resultado:
            print(f"    Falha ao extrair curriculo de {nome}")
            not_found += 1
            continue

        # Gravar em dados_publicos
        dp["biografia_stj_url"] = url_curriculo
        dp["biografia_stj_texto"] = resultado["biografia_texto"]
        dp["biografia_stj_nome_completo"] = match["nome_completo"]

        if resultado["secoes"]:
            dp["biografia_stj_secoes"] = resultado["secoes"]

        perfil["dados_publicos"] = dp

        # Atualizar campos top-level (se ainda nao preenchidos ou vazios)
        if resultado["biografia"]:
            perfil["biografia"] = resultado["biografia"]
        if resultado["formacao_academica"]:
            perfil["formacao_academica"] = resultado["formacao_academica"]
        if resultado["carreira"]:
            perfil["carreira"] = resultado["carreira"]
        if resultado["obras_publicadas"]:
            perfil["obras_publicadas"] = resultado["obras_publicadas"]

        # Atualizar fontes
        fontes = perfil.get("fontes") or []
        stj_fonte_existe = any(
            f.get("tipo") == "portal_stj" for f in fontes
        )
        if not stj_fonte_existe:
            fontes.append({
                "url": url_curriculo,
                "tipo": "portal_stj",
                "observacao": "Curriculo oficial do portal do STJ",
            })
            perfil["fontes"] = fontes

        _write_json(path, perfil)
        updated += 1
        print(f"    OK: {nome}")

        time.sleep(1.0)

    print(
        f"\nSTJ: biografias atualizadas={updated} "
        f"puladas={skipped} "
        f"nao_encontradas={not_found} "
        f"(total perfis={len(paths)})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
