"""
Rotas de Gerenciamento de Usuários

CRUD e administração de usuários (painel admin do Professor Igor).
Suporta fallback para modo sem banco de dados (lê usuários Google do JSON).
"""

import json
import os
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import obter_usuario_admin, obter_usuario_atual
from app.core.seguranca import DadosToken
from app.db.session import get_db_optional
from app.esquemas.usuario import (
    AprovarUsuarioRequest,
    AtualizarPapelRequest,
    EstatisticasUsuariosResponse,
    ListaUsuariosResponse,
    MensagemResponse,
    PapelUsuario,
    UsuarioResponse,
    UsuarioResumoResponse,
)

router = APIRouter()

# Caminho do arquivo de usuários Google
DADOS_USUARIOS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "agentes",
    "dados-usuarios-google.json"
)


def _carregar_usuarios_google() -> list:
    """Carrega usuários Google do arquivo JSON"""
    if not os.path.exists(DADOS_USUARIOS_PATH):
        return []
    try:
        with open(DADOS_USUARIOS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def _salvar_usuarios_google(usuarios: list) -> None:
    """Salva usuários Google no arquivo JSON"""
    os.makedirs(os.path.dirname(DADOS_USUARIOS_PATH), exist_ok=True)
    with open(DADOS_USUARIOS_PATH, "w", encoding="utf-8") as f:
        json.dump(usuarios, f, ensure_ascii=False, indent=2)


def _usuario_google_para_resumo(u: dict) -> dict:
    """Converte usuário Google para formato de resumo"""
    return {
        "id": u.get("google_id", ""),
        "nome": u.get("nome") or u.get("nome_completo", "Usuário Google"),
        "email": u.get("email", ""),
        "papel": u.get("papel", "leitor"),
        "aprovado": u.get("aprovado", False),
        "ativo": u.get("ativo", True),
        "criado_em": u.get("criado_em"),
        "avatar_url": u.get("avatar_url"),
        "provedor_auth": "google",
    }


# ==========================================
# Listagem e Estatísticas (Admin)
# ==========================================

@router.get(
    "",
    response_model=ListaUsuariosResponse,
    summary="Listar usuários",
    description="Lista todos os usuários com filtros e paginação. **Apenas admin.**",
)
async def listar_usuarios(
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db_optional),
    pagina: int = Query(1, ge=1, description="Número da página"),
    por_pagina: int = Query(20, ge=1, le=100, description="Itens por página"),
    papel: Optional[str] = Query(None, description="Filtrar por papel"),
    aprovado: Optional[bool] = Query(None, description="Filtrar por aprovação"),
    ativo: Optional[bool] = Query(None, description="Filtrar por status"),
    busca: Optional[str] = Query(None, description="Buscar por nome/email"),
):
    """Lista usuários com filtros (suporta fallback sem banco)"""
    # Se banco disponível, usa serviço normal
    if db is not None:
        try:
            from app.modelos.usuario import Usuario
            from app.servicos.usuario_servico import UsuarioServico

            resultado = await UsuarioServico.listar(
                db=db,
                pagina=pagina,
                por_pagina=por_pagina,
                papel=papel,
                aprovado=aprovado,
                ativo=ativo,
                busca=busca,
            )

            return ListaUsuariosResponse(
                usuarios=[UsuarioResumoResponse.model_validate(u) for u in resultado["usuarios"]],
                total=resultado["total"],
                pagina=resultado["pagina"],
                por_pagina=resultado["por_pagina"],
                total_paginas=resultado["total_paginas"],
            )
        except Exception as e:
            print(f"[USUARIOS] Erro ao consultar banco: {e}")
            # Continua para fallback

    # Fallback: carregar do arquivo JSON
    usuarios_google = _carregar_usuarios_google()

    # Aplicar filtros
    usuarios_filtrados = usuarios_google
    if papel:
        usuarios_filtrados = [u for u in usuarios_filtrados if u.get("papel") == papel]
    if aprovado is not None:
        usuarios_filtrados = [u for u in usuarios_filtrados if u.get("aprovado", False) == aprovado]
    if ativo is not None:
        usuarios_filtrados = [u for u in usuarios_filtrados if u.get("ativo", True) == ativo]
    if busca:
        busca_lower = busca.lower()
        usuarios_filtrados = [
            u for u in usuarios_filtrados
            if busca_lower in (u.get("nome") or "").lower()
            or busca_lower in (u.get("email") or "").lower()
        ]

    # Paginação
    total = len(usuarios_filtrados)
    inicio = (pagina - 1) * por_pagina
    fim = inicio + por_pagina
    usuarios_pagina = usuarios_filtrados[inicio:fim]

    return ListaUsuariosResponse(
        usuarios=[UsuarioResumoResponse.model_validate(_usuario_google_para_resumo(u)) for u in usuarios_pagina],
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        total_paginas=(total + por_pagina - 1) // por_pagina if total > 0 else 1,
    )


@router.get(
    "/pendentes",
    response_model=ListaUsuariosResponse,
    summary="Listar usuários pendentes",
    description="Lista usuários aguardando aprovação. **Apenas admin.**",
)
async def listar_pendentes(
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db_optional),
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
):
    """Lista usuários pendentes de aprovação (suporta fallback sem banco)"""
    # Se banco disponível, usa serviço normal
    if db is not None:
        try:
            from app.servicos.usuario_servico import UsuarioServico

            resultado = await UsuarioServico.listar(
                db=db,
                pagina=pagina,
                por_pagina=por_pagina,
                aprovado=False,
                ativo=True,
            )

            return ListaUsuariosResponse(
                usuarios=[UsuarioResumoResponse.model_validate(u) for u in resultado["usuarios"]],
                total=resultado["total"],
                pagina=resultado["pagina"],
                por_pagina=resultado["por_pagina"],
                total_paginas=resultado["total_paginas"],
            )
        except Exception as e:
            print(f"[USUARIOS] Erro ao consultar banco: {e}")

    # Fallback: carregar do arquivo JSON
    usuarios_google = _carregar_usuarios_google()
    pendentes = [u for u in usuarios_google if not u.get("aprovado", False) and u.get("ativo", True)]

    # Paginação
    total = len(pendentes)
    inicio = (pagina - 1) * por_pagina
    fim = inicio + por_pagina
    usuarios_pagina = pendentes[inicio:fim]

    return ListaUsuariosResponse(
        usuarios=[UsuarioResumoResponse.model_validate(_usuario_google_para_resumo(u)) for u in usuarios_pagina],
        total=total,
        pagina=pagina,
        por_pagina=por_pagina,
        total_paginas=(total + por_pagina - 1) // por_pagina if total > 0 else 1,
    )


@router.get(
    "/estatisticas",
    response_model=EstatisticasUsuariosResponse,
    summary="Estatísticas de usuários",
    description="Retorna estatísticas gerais dos usuários. **Apenas admin.**",
)
async def estatisticas_usuarios(
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db_optional),
):
    """Estatísticas de usuários (suporta fallback sem banco)"""
    # Se banco disponível, usa serviço normal
    if db is not None:
        try:
            from app.modelos.usuario import Usuario
            from app.servicos.usuario_servico import UsuarioServico

            # Total
            total_result = await db.execute(select(func.count(Usuario.id)))
            total = total_result.scalar() or 0

            # Pendentes
            pendentes = await UsuarioServico.contar_pendentes(db)

            # Ativos
            ativos_result = await db.execute(
                select(func.count(Usuario.id)).where(Usuario.ativo == True)  # noqa: E712
            )
            ativos = ativos_result.scalar() or 0

            # Por papel
            por_papel = {}
            for papel in PapelUsuario:
                result = await db.execute(
                    select(func.count(Usuario.id)).where(Usuario.papel == papel.value)
                )
                por_papel[papel.value] = result.scalar() or 0

            return EstatisticasUsuariosResponse(
                total=total,
                pendentes=pendentes,
                ativos=ativos,
                por_papel=por_papel,
            )
        except Exception as e:
            print(f"[USUARIOS] Erro ao consultar banco: {e}")

    # Fallback: calcular do arquivo JSON
    usuarios_google = _carregar_usuarios_google()

    total = len(usuarios_google)
    pendentes = len([u for u in usuarios_google if not u.get("aprovado", False)])
    ativos = len([u for u in usuarios_google if u.get("ativo", True)])

    # Por papel
    por_papel = {}
    for papel in PapelUsuario:
        por_papel[papel.value] = len([u for u in usuarios_google if u.get("papel") == papel.value])
    # Contar leitores (padrão para usuários sem papel definido)
    por_papel["leitor"] = por_papel.get("leitor", 0) + len([u for u in usuarios_google if not u.get("papel")])

    return EstatisticasUsuariosResponse(
        total=total,
        pendentes=pendentes,
        ativos=ativos,
        por_papel=por_papel,
    )


# ==========================================
# Operações em Usuário Específico (Admin)
# ==========================================

def _usuario_google_para_response(u: dict) -> dict:
    """Converte usuário Google para formato completo de resposta"""
    return {
        "id": u.get("google_id", ""),
        "nome": u.get("nome") or u.get("nome_completo", "Usuário Google"),
        "email": u.get("email", ""),
        "papel": u.get("papel", "leitor"),
        "aprovado": u.get("aprovado", False),
        "ativo": u.get("ativo", True),
        "criado_em": u.get("criado_em"),
        "ultimo_login": u.get("atualizado_em"),
        "avatar_url": u.get("avatar_url"),
        "provedor_auth": "google",
    }


@router.get(
    "/{usuario_id}",
    response_model=UsuarioResponse,
    summary="Obter usuário",
    description="Obtém dados de um usuário específico. **Apenas admin.**",
)
async def obter_usuario(
    usuario_id: str,
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db_optional),
):
    """Obtém usuário por ID (suporta fallback sem banco)"""
    # Se banco disponível, usa serviço normal
    if db is not None:
        try:
            from app.servicos.usuario_servico import UsuarioServico

            usuario = await UsuarioServico.obter_por_id(db, usuario_id)
            if usuario:
                return UsuarioResponse.model_validate(usuario)
        except Exception as e:
            print(f"[USUARIOS] Erro ao consultar banco: {e}")

    # Fallback: buscar no arquivo JSON
    usuarios_google = _carregar_usuarios_google()
    usuario = next((u for u in usuarios_google if u.get("google_id") == usuario_id), None)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    return UsuarioResponse.model_validate(_usuario_google_para_response(usuario))


@router.post(
    "/{usuario_id}/aprovar",
    response_model=UsuarioResponse,
    summary="Aprovar usuário",
    description="""
Aprova um usuário e opcionalmente define seu papel.

**Papéis disponíveis:**
- `pesquisador`: Pode criar e executar pesquisas
- `visualizador`: Pode visualizar resultados
- `leitor`: Apenas visualiza (padrão, mantém sem API)

**Apenas admin.**
    """,
)
async def aprovar_usuario(
    usuario_id: str,
    dados: AprovarUsuarioRequest,
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db_optional),
):
    """Aprova usuário (suporta fallback sem banco)"""
    papel_str = dados.papel.value if dados.papel else None

    # Se banco disponível, usa serviço normal
    if db is not None:
        try:
            from app.servicos.usuario_servico import UsuarioServico

            usuario = await UsuarioServico.aprovar(db, usuario_id, papel_str)
            if usuario:
                return UsuarioResponse.model_validate(usuario)
        except Exception as e:
            print(f"[USUARIOS] Erro ao consultar banco: {e}")

    # Fallback: atualizar no arquivo JSON
    usuarios_google = _carregar_usuarios_google()
    idx = next((i for i, u in enumerate(usuarios_google) if u.get("google_id") == usuario_id), None)

    if idx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    # Atualizar usuário
    usuarios_google[idx]["aprovado"] = True
    if papel_str:
        usuarios_google[idx]["papel"] = papel_str
    usuarios_google[idx]["atualizado_em"] = datetime.now().isoformat()

    _salvar_usuarios_google(usuarios_google)

    return UsuarioResponse.model_validate(_usuario_google_para_response(usuarios_google[idx]))


@router.post(
    "/{usuario_id}/revogar",
    response_model=UsuarioResponse,
    summary="Revogar aprovação",
    description="Revoga aprovação de um usuário (volta a ser leitor). **Apenas admin.**",
)
async def revogar_usuario(
    usuario_id: str,
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db_optional),
):
    """Revoga aprovação (suporta fallback sem banco)"""
    # Se banco disponível, usa serviço normal
    if db is not None:
        try:
            from app.servicos.usuario_servico import UsuarioServico

            usuario = await UsuarioServico.revogar(db, usuario_id)
            if usuario:
                return UsuarioResponse.model_validate(usuario)
        except Exception as e:
            print(f"[USUARIOS] Erro ao consultar banco: {e}")

    # Fallback: atualizar no arquivo JSON
    usuarios_google = _carregar_usuarios_google()
    idx = next((i for i, u in enumerate(usuarios_google) if u.get("google_id") == usuario_id), None)

    if idx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    # Revogar usuário
    usuarios_google[idx]["aprovado"] = False
    usuarios_google[idx]["papel"] = "leitor"
    usuarios_google[idx]["atualizado_em"] = datetime.now().isoformat()

    _salvar_usuarios_google(usuarios_google)

    return UsuarioResponse.model_validate(_usuario_google_para_response(usuarios_google[idx]))


@router.put(
    "/{usuario_id}/papel",
    response_model=UsuarioResponse,
    summary="Alterar papel",
    description="Altera o papel de um usuário. **Apenas admin.**",
)
async def alterar_papel(
    usuario_id: str,
    dados: AtualizarPapelRequest,
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db_optional),
):
    """Altera papel do usuário (suporta fallback sem banco)"""
    # Se banco disponível, usa serviço normal
    if db is not None:
        try:
            from app.servicos.usuario_servico import UsuarioServico

            usuario = await UsuarioServico.atualizar_papel(db, usuario_id, dados.papel.value)
            if usuario:
                return UsuarioResponse.model_validate(usuario)
        except Exception as e:
            print(f"[USUARIOS] Erro ao consultar banco: {e}")

    # Fallback: atualizar no arquivo JSON
    usuarios_google = _carregar_usuarios_google()
    idx = next((i for i, u in enumerate(usuarios_google) if u.get("google_id") == usuario_id), None)

    if idx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    # Atualizar papel
    usuarios_google[idx]["papel"] = dados.papel.value
    usuarios_google[idx]["atualizado_em"] = datetime.now().isoformat()

    _salvar_usuarios_google(usuarios_google)

    return UsuarioResponse.model_validate(_usuario_google_para_response(usuarios_google[idx]))


@router.post(
    "/{usuario_id}/ativar",
    response_model=UsuarioResponse,
    summary="Ativar usuário",
    description="Ativa um usuário desativado. **Apenas admin.**",
)
async def ativar_usuario(
    usuario_id: str,
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db_optional),
):
    """Ativa usuário (suporta fallback sem banco)"""
    # Se banco disponível, usa serviço normal
    if db is not None:
        try:
            from app.servicos.usuario_servico import UsuarioServico

            usuario = await UsuarioServico.ativar(db, usuario_id)
            if usuario:
                return UsuarioResponse.model_validate(usuario)
        except Exception as e:
            print(f"[USUARIOS] Erro ao consultar banco: {e}")

    # Fallback: atualizar no arquivo JSON
    usuarios_google = _carregar_usuarios_google()
    idx = next((i for i, u in enumerate(usuarios_google) if u.get("google_id") == usuario_id), None)

    if idx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    # Ativar usuário
    usuarios_google[idx]["ativo"] = True
    usuarios_google[idx]["atualizado_em"] = datetime.now().isoformat()

    _salvar_usuarios_google(usuarios_google)

    return UsuarioResponse.model_validate(_usuario_google_para_response(usuarios_google[idx]))


@router.post(
    "/{usuario_id}/desativar",
    response_model=UsuarioResponse,
    summary="Desativar usuário",
    description="Desativa um usuário (não pode mais fazer login). **Apenas admin.**",
)
async def desativar_usuario(
    usuario_id: str,
    admin: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db_optional),
):
    """Desativa usuário (suporta fallback sem banco)"""
    # Não pode desativar a si mesmo
    if usuario_id == admin.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível desativar seu próprio usuário",
        )

    # Se banco disponível, usa serviço normal
    if db is not None:
        try:
            from app.servicos.usuario_servico import UsuarioServico

            usuario = await UsuarioServico.desativar(db, usuario_id)
            if usuario:
                return UsuarioResponse.model_validate(usuario)
        except Exception as e:
            print(f"[USUARIOS] Erro ao consultar banco: {e}")

    # Fallback: atualizar no arquivo JSON
    usuarios_google = _carregar_usuarios_google()
    idx = next((i for i, u in enumerate(usuarios_google) if u.get("google_id") == usuario_id), None)

    if idx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    # Desativar usuário
    usuarios_google[idx]["ativo"] = False
    usuarios_google[idx]["atualizado_em"] = datetime.now().isoformat()

    _salvar_usuarios_google(usuarios_google)

    return UsuarioResponse.model_validate(_usuario_google_para_response(usuarios_google[idx]))


@router.delete(
    "/{usuario_id}",
    response_model=MensagemResponse,
    summary="Deletar usuário",
    description="Remove um usuário permanentemente. **Apenas admin.**",
)
async def deletar_usuario(
    usuario_id: str,
    admin: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db_optional),
):
    """Deleta usuário (suporta fallback sem banco)"""
    # Não pode deletar a si mesmo
    if usuario_id == admin.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível deletar seu próprio usuário",
        )

    # Se banco disponível, usa serviço normal
    if db is not None:
        try:
            from app.servicos.usuario_servico import UsuarioServico

            sucesso = await UsuarioServico.deletar(db, usuario_id)
            if sucesso:
                return MensagemResponse(mensagem="Usuário removido com sucesso")
        except Exception as e:
            print(f"[USUARIOS] Erro ao consultar banco: {e}")

    # Fallback: remover do arquivo JSON
    usuarios_google = _carregar_usuarios_google()
    idx = next((i for i, u in enumerate(usuarios_google) if u.get("google_id") == usuario_id), None)

    if idx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    # Remover usuário
    usuarios_google.pop(idx)
    _salvar_usuarios_google(usuarios_google)

    return MensagemResponse(mensagem="Usuário removido com sucesso")
