#!/usr/bin/env python3
"""Gera perfis iniciais (stubs) de magistrados.

Este script prioriza:
- rastreabilidade (guardar URLs de fonte)
- formato estruturado (JSON por pessoa)
- campos de inferencia separados em `hipoteses_para_simulacao`

Obs: este script NAO cria conteudo para impersonacao. Ele apenas estrutura dados publicos.
"""

from __future__ import annotations

import csv
import json
import re
import sys
import unicodedata
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any

import requests
from lxml import html


UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120 Safari/537.36"
)


@dataclass(frozen=True)
class Fonte:
    url: str
    tipo: str
    observacao: str | None = None


def _http_get(url: str, *, timeout_s: int = 60, use_ua: bool = True) -> str:
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    }
    if use_ua:
        headers["User-Agent"] = UA

    r = requests.get(url, headers=headers, timeout=timeout_s, verify=False)
    r.raise_for_status()
    return r.text


def _slugify_ascii(s: str) -> str:
    s = s.strip().lower()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")


def _perfil_base(
    *,
    _id: str,
    nome: str,
    orgao: str,
    cargo: str,
    situacao: str,
    fontes: list[Fonte],
) -> dict[str, Any]:
    return {
        "id": _id,
        "nome": nome,
        "nome_completo": None,
        "orgao": orgao,
        "cargo": cargo,
        "situacao": situacao,
        "dados_publicos": {},
        "atuacao_profissional": {},
        "padroes_decisao": {},
        "hipoteses_para_simulacao": {
            "instrucoes": [
                "Inferencias aqui sao aproximacoes para simulacao; nao tratar como fato.",
                "Sempre rotular o agente como simulacao e evitar qualquer uso para enganar terceiros.",
            ],
            "tracos_operacionais": [],
            "confianca_global": None,
        },
        "riscos_e_cuidados": [
            "Nao usar para impersonacao (nao assinar como a pessoa real).",
            "Nao incluir dados pessoais nao-publicos.",
        ],
        "fontes": [
            {"url": f.url, "tipo": f.tipo, "observacao": f.observacao}
            for f in fontes
        ],
        "atualizado_em": date.today().isoformat(),
    }


def coletar_stf() -> list[dict[str, Any]]:
    # Lista de referencia (2026-01-30). Fonte primaria sugerida: Wikipedia + paginas oficiais.
    ministros = [
        ("Edson Fachin", "https://pt.wikipedia.org/wiki/Edson_Fachin"),
        ("Alexandre de Moraes", "https://pt.wikipedia.org/wiki/Alexandre_de_Moraes"),
        ("Gilmar Mendes", "https://pt.wikipedia.org/wiki/Gilmar_Mendes"),
        ("Dias Toffoli", "https://pt.wikipedia.org/wiki/Dias_Toffoli"),
        ("Luiz Fux", "https://pt.wikipedia.org/wiki/Luiz_Fux"),
        ("Carmen Lucia", "https://pt.wikipedia.org/wiki/C%C3%A1rmen_L%C3%BAcia"),
        ("Luis Roberto Barroso", "https://pt.wikipedia.org/wiki/Lu%C3%ADs_Roberto_Barroso"),
        ("Nunes Marques", "https://pt.wikipedia.org/wiki/Nunes_Marques"),
        ("Andre Mendonca", "https://pt.wikipedia.org/wiki/Andr%C3%A9_Mendon%C3%A7a"),
        ("Cristiano Zanin", "https://pt.wikipedia.org/wiki/Cristiano_Zanin"),
        ("Flavio Dino", "https://pt.wikipedia.org/wiki/Fl%C3%A1vio_Dino"),
    ]

    out: list[dict[str, Any]] = []
    for nome, wiki_url in ministros:
        _id = f"stf-{_slugify_ascii(nome)}"
        perfil = _perfil_base(
            _id=_id,
            nome=nome,
            orgao="STF",
            cargo="Ministro",
            situacao="titular",
            fontes=[Fonte(url=wiki_url, tipo="wikipedia")],
        )
        out.append(perfil)
    return out


def coletar_stj() -> list[dict[str, Any]]:
    url = "https://pt.wikipedia.org/wiki/Lista_de_ministros_do_Superior_Tribunal_de_Justi%C3%A7a"
    doc = html.fromstring(_http_get(url))
    tables = doc.xpath('//table[contains(@class,"wikitable")]')
    if not tables:
        raise RuntimeError("Nao encontrei tabela wikitable na pagina do STJ (Wikipedia).")

    # A primeira wikitable costuma conter a lista.
    table = tables[0]
    rows = table.xpath(".//tr")

    out: list[dict[str, Any]] = []
    for r in rows:
        tds = r.xpath("./td")
        if len(tds) < 8:
            continue

        nome_cell = tds[2]
        inicio_cell = tds[5]
        termino_cell = tds[6]
        origem_cell = tds[4]

        termino_txt = " ".join(termino_cell.text_content().split())
        if termino_txt != "—":
            continue

        nome_txt = " ".join(nome_cell.text_content().split())
        if not nome_txt:
            continue

        # Preferir link quando existir.
        href = None
        a = nome_cell.xpath(".//a[@href]")
        if a:
            href = a[0].get("href")
        wiki_url = (
            f"https://pt.wikipedia.org{href}" if href and href.startswith("/") else url
        )

        inicio_txt = " ".join(inicio_cell.text_content().split())
        origem_txt = " ".join(origem_cell.text_content().split())

        _id = f"stj-{_slugify_ascii(nome_txt)}"
        perfil = _perfil_base(
            _id=_id,
            nome=nome_txt,
            orgao="STJ",
            cargo="Ministro",
            situacao="titular",
            fontes=[Fonte(url=wiki_url, tipo="wikipedia", observacao="Pagina do ministro (link) ou lista")],
        )
        perfil["dados_publicos"] = {
            "posse_texto": inicio_txt or None,
            "origem_texto": origem_txt or None,
        }
        out.append(perfil)

    # Remover duplicatas por id (Wikipedia pode repetir em casos raros)
    dedup: dict[str, dict[str, Any]] = {}
    for p in out:
        dedup[p["id"]] = p
    return list(dedup.values())


def coletar_tjdft() -> list[dict[str, Any]]:
    url = "https://www.tjdft.jus.br/institucional/composicao/2a-instancia/desembargadores/ordem-alfabetica"
    doc = html.fromstring(_http_get(url))
    core = doc.get_element_by_id("content-core")
    text = " ".join(core.text_content().split())

    # Quebra em blocos a partir de "Des." ou "Desa."
    starts = [m.start() for m in re.finditer(r"\bDesa?\.\s+", text)]
    blocks: list[str] = []
    for i, st in enumerate(starts):
        en = starts[i + 1] if i + 1 < len(starts) else len(text)
        blocks.append(text[st:en].strip())

    out: list[dict[str, Any]] = []
    for b in blocks:
        m = re.match(r"^(Desa?)\.\s+(.*)$", b)
        if not m:
            continue

        prefix = m.group(1)
        rest = m.group(2)

        # Nome vai ate Assessor/Assessora
        parts = re.split(r"\bAssessora?:\s+", rest, maxsplit=1)
        nome = parts[0].strip()
        assessor = None
        resto2 = ""
        if len(parts) == 2:
            assessor_e_rest = parts[1]
            # assessor ate "palacio" ou "palacio da justica" ou "Telefones"
            parts2 = re.split(r"\bpal[aá]cio\b|\bTelefones?:\b", assessor_e_rest, maxsplit=1, flags=re.I)
            assessor = parts2[0].strip() or None
            resto2 = assessor_e_rest

        telefones = None
        m_tel = re.search(r"\bTelefones?:\s*([^D]+)$", b)
        if m_tel:
            telefones = " ".join(m_tel.group(1).split()).strip() or None

        nome_publico = f"{prefix}. {nome}".strip()
        _id = f"tjdft-{_slugify_ascii(nome)}"
        perfil = _perfil_base(
            _id=_id,
            nome=nome_publico,
            orgao="TJDFT",
            cargo="Desembargador",
            situacao="titular",
            fontes=[Fonte(url=url, tipo="site-oficial", observacao="Ordem alfabetica (2a instancia)")],
        )
        perfil["dados_publicos"] = {
            "assessor": assessor,
            "telefones_gabinete": telefones,
        }
        out.append(perfil)

    return out


def coletar_trf1() -> list[dict[str, Any]]:
    url = "https://www.trf1.jus.br/trf1/desembargadores-federais/em-atividade"

    # O dominio do TRF1 costuma exigir JavaScript (WAF). Aqui usamos um proxy de leitura
    # (r.jina.ai) para obter o conteudo em formato texto/markdown.
    page = _http_get(f"https://r.jina.ai/{url}", use_ua=False)

    # Extrai cards linha-a-linha para evitar capturas gigantes atraves do menu.
    card_pat = re.compile(
        r"###\s+(?P<nome>.+?)\s+Gabinete:\s+(?P<gab>.+?)\]\((?P<link>https://www\.trf1\.jus\.br/trf1/em-atividade/[^\)]+)\)",
        re.U,
    )
    matches: list[re.Match[str]] = []
    for line in page.splitlines():
        if ("Gabinete:" not in line) or ("/trf1/em-atividade/" not in line) or ("###" not in line):
            continue
        m = card_pat.search(line)
        if m:
            matches.append(m)

    if not matches:
        raise RuntimeError("Nao consegui extrair lista de desembargadores do TRF1 (em atividade).")

    perfis: list[dict[str, Any]] = []
    seen_links: set[str] = set()
    for m in matches:
        nome = " ".join(m.group("nome").split())
        gab = " ".join(m.group("gab").split())
        link = m.group("link").strip()
        if link in seen_links:
            continue
        seen_links.add(link)

        funcao = None
        m_func = re.search(r"\(([^\)]+)\)\s*$", gab)
        if m_func:
            funcao = m_func.group(1).strip()
            gab = gab[: m_func.start()].strip()

        _id = f"trf1-{_slugify_ascii(nome)}"
        perfil = _perfil_base(
            _id=_id,
            nome=nome,
            orgao="TRF1",
            cargo="Desembargador Federal",
            situacao="titular",
            fontes=[
                Fonte(url=url, tipo="site-oficial", observacao="Lista (Em atividade)"),
                Fonte(url=link, tipo="site-oficial", observacao="Pagina individual"),
            ],
        )
        perfil["dados_publicos"] = {
            "gabinete_texto": gab or None,
            "funcao_administrativa": funcao,
            "pagina_trf1": link,
        }
        perfis.append(perfil)

    return perfis


def escrever_saidas(base_dir: Path, perfis: list[dict[str, Any]]) -> None:
    indice: list[dict[str, str]] = []

    for p in perfis:
        orgao = p["orgao"]
        out_dir = base_dir / orgao
        out_path = out_dir / f"{p['id']}.json"
        _write_json(out_path, p)

        fonte_principal = p.get("fontes", [{}])[0].get("url", "")
        indice.append(
            {
                "id": p["id"],
                "nome": p["nome"],
                "orgao": orgao,
                "cargo": p["cargo"],
                "situacao": p["situacao"],
                "fonte_principal": fonte_principal,
            }
        )

    meta_dir = base_dir / "meta"
    meta_dir.mkdir(parents=True, exist_ok=True)

    (meta_dir / "indice_magistrados.json").write_text(
        json.dumps(indice, ensure_ascii=True, indent=2) + "\n",
        encoding="utf-8",
    )

    with (meta_dir / "indice_magistrados.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["id", "nome", "orgao", "cargo", "situacao", "fonte_principal"],
        )
        w.writeheader()
        for row in indice:
            w.writerow(row)


def main() -> int:
    base_dir = Path("perfis agentes sinteticos judiciário - STF, STJ, TJDF, TRF1")
    if not base_dir.exists():
        raise RuntimeError(f"Diretorio base nao encontrado: {base_dir}")

    perfis: list[dict[str, Any]] = []
    perfis.extend(coletar_stf())
    perfis.extend(coletar_stj())
    perfis.extend(coletar_tjdft())
    perfis.extend(coletar_trf1())

    escrever_saidas(base_dir, perfis)

    print(f"Gerados {len(perfis)} perfis em {base_dir}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        print(f"ERRO: {e}", file=sys.stderr)
        raise
