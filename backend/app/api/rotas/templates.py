"""
Rotas da API para Templates de Pesquisa Eleitoral.

Endpoints para gerenciamento de templates predefinidos de perguntas eleitorais.
"""

import json
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.esquemas.template import (
    CategoriaInfo,
    CategoriaTemplate,
    PerguntaTemplate,
    TemplateCompleto,
    TemplateResumo,
    TipoEleicaoInfo,
)

router = APIRouter()

# Caminho para o arquivo de templates
TEMPLATES_FILE = Path(__file__).parent.parent.parent / "dados" / "templates_perguntas.json"


def carregar_templates() -> dict:
    """Carrega os templates do arquivo JSON."""
    if not TEMPLATES_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail="Arquivo de templates não encontrado"
        )

    with open(TEMPLATES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get(
    "/meta/categorias",
    response_model=List[CategoriaInfo],
    summary="Listar categorias de templates",
    description="Retorna todas as categorias disponíveis para templates"
)
async def listar_categorias():
    """Lista todas as categorias de templates disponíveis."""
    dados = carregar_templates()
    categorias = dados.get("categorias", [])

    return [
        CategoriaInfo(
            id=cat["id"],
            nome=cat["nome"],
            descricao=cat.get("descricao", ""),
            cor=cat.get("cor", "#666666")
        )
        for cat in categorias
    ]


@router.get(
    "/meta/tipos-eleicao",
    response_model=List[TipoEleicaoInfo],
    summary="Listar tipos de eleição",
    description="Retorna todos os tipos de eleição disponíveis"
)
async def listar_tipos_eleicao():
    """Lista todos os tipos de eleição disponíveis."""
    dados = carregar_templates()
    tipos = dados.get("tipos_eleicao", [])

    return [
        TipoEleicaoInfo(
            id=tipo["id"],
            nome=tipo["nome"],
            descricao=tipo.get("descricao", "")
        )
        for tipo in tipos
    ]


@router.get(
    "/meta/tags",
    response_model=List[str],
    summary="Listar todas as tags",
    description="Retorna todas as tags únicas usadas nos templates"
)
async def listar_tags():
    """Lista todas as tags únicas dos templates."""
    dados = carregar_templates()
    templates = dados.get("templates", [])

    tags_unicas = set()
    for tpl in templates:
        for tag in tpl.get("tags", []):
            tags_unicas.add(tag)

    return sorted(list(tags_unicas))


@router.get(
    "/meta/estatisticas",
    summary="Estatísticas dos templates",
    description="Retorna estatísticas gerais sobre os templates disponíveis"
)
async def estatisticas_templates():
    """Retorna estatísticas sobre os templates disponíveis."""
    dados = carregar_templates()
    templates = dados.get("templates", [])

    total_templates = len(templates)
    total_perguntas = sum(len(tpl.get("perguntas", [])) for tpl in templates)

    # Contar por categoria
    por_categoria = {}
    for tpl in templates:
        cat = tpl.get("categoria", "outros")
        por_categoria[cat] = por_categoria.get(cat, 0) + 1

    # Contar por tipo de eleição
    por_tipo_eleicao = {}
    for tpl in templates:
        tipo = tpl.get("tipo_eleicao", "geral")
        por_tipo_eleicao[tipo] = por_tipo_eleicao.get(tipo, 0) + 1

    # Tags mais usadas
    tags_count = {}
    for tpl in templates:
        for tag in tpl.get("tags", []):
            tags_count[tag] = tags_count.get(tag, 0) + 1

    tags_populares = sorted(
        tags_count.items(),
        key=lambda x: x[1],
        reverse=True
    )[:10]

    return {
        "total_templates": total_templates,
        "total_perguntas": total_perguntas,
        "media_perguntas_por_template": round(total_perguntas / total_templates, 1) if total_templates > 0 else 0,
        "por_categoria": por_categoria,
        "por_tipo_eleicao": por_tipo_eleicao,
        "tags_mais_usadas": dict(tags_populares),
        "versao": dados.get("versao", "1.0.0"),
        "ultima_atualizacao": dados.get("ultima_atualizacao", "")
    }


@router.get(
    "/filtro/por-tipo-eleicao/{tipo_eleicao}",
    response_model=List[TemplateResumo],
    summary="Templates por tipo de eleição",
    description="Retorna templates filtrados por tipo de eleição"
)
async def templates_por_tipo_eleicao(tipo_eleicao: str):
    """Retorna templates para um tipo específico de eleição."""
    dados = carregar_templates()
    templates = dados.get("templates", [])

    resultado = []

    for tpl in templates:
        if tpl.get("tipo_eleicao") == tipo_eleicao or tpl.get("tipo_eleicao") == "geral":
            resultado.append(TemplateResumo(
                id=tpl["id"],
                nome=tpl["nome"],
                descricao=tpl.get("descricao", ""),
                categoria=tpl.get("categoria", ""),
                tipo_eleicao=tpl.get("tipo_eleicao", ""),
                tags=tpl.get("tags", []),
                total_perguntas=len(tpl.get("perguntas", []))
            ))

    return resultado


@router.get(
    "/filtro/por-categoria/{categoria}",
    response_model=List[TemplateResumo],
    summary="Templates por categoria",
    description="Retorna templates filtrados por categoria"
)
async def templates_por_categoria(categoria: CategoriaTemplate):
    """Retorna templates para uma categoria específica."""
    dados = carregar_templates()
    templates = dados.get("templates", [])

    resultado = []

    for tpl in templates:
        if tpl.get("categoria") == categoria.value:
            resultado.append(TemplateResumo(
                id=tpl["id"],
                nome=tpl["nome"],
                descricao=tpl.get("descricao", ""),
                categoria=tpl.get("categoria", ""),
                tipo_eleicao=tpl.get("tipo_eleicao", ""),
                tags=tpl.get("tags", []),
                total_perguntas=len(tpl.get("perguntas", []))
            ))

    return resultado


@router.get(
    "/",
    response_model=List[TemplateResumo],
    summary="Listar todos os templates",
    description="Retorna uma lista resumida de todos os templates disponíveis"
)
async def listar_templates(
    categoria: Optional[CategoriaTemplate] = Query(
        None,
        description="Filtrar por categoria"
    ),
    tipo_eleicao: Optional[str] = Query(
        None,
        description="Filtrar por tipo de eleição (presidente, governador, etc.)"
    ),
    busca: Optional[str] = Query(
        None,
        description="Buscar por nome ou descrição"
    ),
    tag: Optional[str] = Query(
        None,
        description="Filtrar por tag específica"
    ),
    secao: Optional[str] = Query(
        None,
        description="Filtrar por seção (gestores, eleitores, parlamentares)"
    )
):
    """Lista todos os templates disponíveis com filtros opcionais."""
    dados = carregar_templates()
    templates = dados.get("templates", [])

    resultado = []

    for tpl in templates:
        # Aplicar filtros
        if secao and tpl.get("secao") != secao:
            continue

        if categoria and tpl.get("categoria") != categoria.value:
            continue

        if tipo_eleicao and tpl.get("tipo_eleicao") != tipo_eleicao:
            continue

        if busca:
            busca_lower = busca.lower()
            if (busca_lower not in tpl.get("nome", "").lower() and
                busca_lower not in tpl.get("descricao", "").lower()):
                continue

        if tag:
            tags = tpl.get("tags", [])
            if tag.lower() not in [t.lower() for t in tags]:
                continue

        # Criar resumo
        resultado.append(TemplateResumo(
            id=tpl["id"],
            nome=tpl["nome"],
            descricao=tpl.get("descricao", ""),
            categoria=tpl.get("categoria", ""),
            tipo_eleicao=tpl.get("tipo_eleicao", ""),
            tags=tpl.get("tags", []),
            total_perguntas=len(tpl.get("perguntas", []))
        ))

    return resultado


@router.get(
    "/{template_id}",
    response_model=TemplateCompleto,
    summary="Obter template completo",
    description="Retorna um template completo com todas as suas perguntas"
)
async def obter_template(template_id: str):
    """Retorna um template específico pelo ID."""
    dados = carregar_templates()
    templates = dados.get("templates", [])

    for tpl in templates:
        if tpl["id"] == template_id:
            perguntas = [
                PerguntaTemplate(**p) for p in tpl.get("perguntas", [])
            ]

            return TemplateCompleto(
                id=tpl["id"],
                nome=tpl["nome"],
                descricao=tpl.get("descricao", ""),
                categoria=tpl.get("categoria", ""),
                tipo_eleicao=tpl.get("tipo_eleicao", ""),
                tags=tpl.get("tags", []),
                perguntas=perguntas
            )

    raise HTTPException(
        status_code=404,
        detail=f"Template '{template_id}' não encontrado"
    )


@router.get(
    "/{template_id}/perguntas",
    response_model=List[PerguntaTemplate],
    summary="Obter perguntas de um template",
    description="Retorna apenas as perguntas de um template específico"
)
async def obter_perguntas_template(
    template_id: str,
    obrigatorias_apenas: bool = Query(
        False,
        description="Retornar apenas perguntas obrigatórias"
    ),
    categoria_pergunta: Optional[str] = Query(
        None,
        description="Filtrar por categoria da pergunta"
    )
):
    """Retorna as perguntas de um template específico."""
    dados = carregar_templates()
    templates = dados.get("templates", [])

    for tpl in templates:
        if tpl["id"] == template_id:
            perguntas = []

            for p in tpl.get("perguntas", []):
                # Filtrar por obrigatoriedade
                if obrigatorias_apenas and not p.get("obrigatoria", False):
                    continue

                # Filtrar por categoria
                if categoria_pergunta and p.get("categoria") != categoria_pergunta:
                    continue

                perguntas.append(PerguntaTemplate(**p))

            return perguntas

    raise HTTPException(
        status_code=404,
        detail=f"Template '{template_id}' não encontrado"
    )


@router.post(
    "/{template_id}/aplicar/{pesquisa_id}",
    summary="Aplicar template a uma pesquisa",
    description="Copia as perguntas de um template para uma pesquisa existente"
)
async def aplicar_template_pesquisa(
    template_id: str,
    pesquisa_id: int,
    substituir_existentes: bool = Query(
        False,
        description="Se True, substitui perguntas existentes. Se False, adiciona às existentes."
    )
):
    """
    Aplica um template a uma pesquisa existente.

    Este endpoint copia todas as perguntas do template para a pesquisa especificada.
    """
    # Carregar template
    dados = carregar_templates()
    templates = dados.get("templates", [])

    template = None
    for tpl in templates:
        if tpl["id"] == template_id:
            template = tpl
            break

    if not template:
        raise HTTPException(
            status_code=404,
            detail=f"Template '{template_id}' não encontrado"
        )

    # Aqui seria feita a integração com o banco de dados
    # Por enquanto, retornamos as perguntas que seriam adicionadas
    perguntas = template.get("perguntas", [])

    return {
        "sucesso": True,
        "mensagem": f"Template '{template['nome']}' aplicado com sucesso",
        "template_id": template_id,
        "pesquisa_id": pesquisa_id,
        "perguntas_adicionadas": len(perguntas),
        "substituiu_existentes": substituir_existentes,
        "perguntas": perguntas
    }
