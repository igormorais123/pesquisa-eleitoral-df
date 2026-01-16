"""
Rotas de Gerenciamento de Usuários

CRUD e administração de usuários (painel admin do Professor Igor).
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import obter_usuario_admin, obter_usuario_atual
from app.core.seguranca import DadosToken
from app.db.session import get_db
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
from app.modelos.usuario import Usuario
from app.servicos.usuario_servico import UsuarioServico

router = APIRouter()


# ==========================================
# Listagem e Estatísticas (Admin)
# ==========================================

@router.get(
    "/",
    response_model=ListaUsuariosResponse,
    summary="Listar usuários",
    description="Lista todos os usuários com filtros e paginação. **Apenas admin.**",
)
async def listar_usuarios(
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db),
    pagina: int = Query(1, ge=1, description="Número da página"),
    por_pagina: int = Query(20, ge=1, le=100, description="Itens por página"),
    papel: Optional[str] = Query(None, description="Filtrar por papel"),
    aprovado: Optional[bool] = Query(None, description="Filtrar por aprovação"),
    ativo: Optional[bool] = Query(None, description="Filtrar por status"),
    busca: Optional[str] = Query(None, description="Buscar por nome/email"),
):
    """Lista usuários com filtros"""
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


@router.get(
    "/pendentes",
    response_model=ListaUsuariosResponse,
    summary="Listar usuários pendentes",
    description="Lista usuários aguardando aprovação. **Apenas admin.**",
)
async def listar_pendentes(
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db),
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
):
    """Lista usuários pendentes de aprovação"""
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


@router.get(
    "/estatisticas",
    response_model=EstatisticasUsuariosResponse,
    summary="Estatísticas de usuários",
    description="Retorna estatísticas gerais dos usuários. **Apenas admin.**",
)
async def estatisticas_usuarios(
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db),
):
    """Estatísticas de usuários"""
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


# ==========================================
# Operações em Usuário Específico (Admin)
# ==========================================

@router.get(
    "/{usuario_id}",
    response_model=UsuarioResponse,
    summary="Obter usuário",
    description="Obtém dados de um usuário específico. **Apenas admin.**",
)
async def obter_usuario(
    usuario_id: str,
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db),
):
    """Obtém usuário por ID"""
    usuario = await UsuarioServico.obter_por_id(db, usuario_id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )
    return UsuarioResponse.model_validate(usuario)


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
    db: AsyncSession = Depends(get_db),
):
    """Aprova usuário"""
    papel = dados.papel.value if dados.papel else None
    usuario = await UsuarioServico.aprovar(db, usuario_id, papel)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    return UsuarioResponse.model_validate(usuario)


@router.post(
    "/{usuario_id}/revogar",
    response_model=UsuarioResponse,
    summary="Revogar aprovação",
    description="Revoga aprovação de um usuário (volta a ser leitor). **Apenas admin.**",
)
async def revogar_usuario(
    usuario_id: str,
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db),
):
    """Revoga aprovação"""
    usuario = await UsuarioServico.revogar(db, usuario_id)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado ou não pode ser revogado",
        )

    return UsuarioResponse.model_validate(usuario)


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
    db: AsyncSession = Depends(get_db),
):
    """Altera papel do usuário"""
    usuario = await UsuarioServico.atualizar_papel(db, usuario_id, dados.papel.value)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    return UsuarioResponse.model_validate(usuario)


@router.post(
    "/{usuario_id}/ativar",
    response_model=UsuarioResponse,
    summary="Ativar usuário",
    description="Ativa um usuário desativado. **Apenas admin.**",
)
async def ativar_usuario(
    usuario_id: str,
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db),
):
    """Ativa usuário"""
    usuario = await UsuarioServico.ativar(db, usuario_id)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    return UsuarioResponse.model_validate(usuario)


@router.post(
    "/{usuario_id}/desativar",
    response_model=UsuarioResponse,
    summary="Desativar usuário",
    description="Desativa um usuário (não pode mais fazer login). **Apenas admin.**",
)
async def desativar_usuario(
    usuario_id: str,
    admin: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db),
):
    """Desativa usuário"""
    # Não pode desativar a si mesmo
    if usuario_id == admin.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível desativar seu próprio usuário",
        )

    usuario = await UsuarioServico.desativar(db, usuario_id)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    return UsuarioResponse.model_validate(usuario)


@router.delete(
    "/{usuario_id}",
    response_model=MensagemResponse,
    summary="Deletar usuário",
    description="Remove um usuário permanentemente. **Apenas admin.**",
)
async def deletar_usuario(
    usuario_id: str,
    admin: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db),
):
    """Deleta usuário"""
    # Não pode deletar a si mesmo
    if usuario_id == admin.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível deletar seu próprio usuário",
        )

    sucesso = await UsuarioServico.deletar(db, usuario_id)

    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    return MensagemResponse(mensagem="Usuário removido com sucesso")
