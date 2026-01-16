"""
Rotas de Gerenciamento de Usuários

CRUD completo para usuários do sistema.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import obter_usuario_admin, obter_usuario_atual
from app.core.seguranca import DadosToken
from app.db.database import get_db
from app.esquemas.usuario import (
    ListaUsuariosResposta,
    PapelUsuario,
    UsuarioAtualizar,
    UsuarioAtualizarSenha,
    UsuarioCriar,
    UsuarioResposta,
)
from app.servicos.usuario_servico import UsuarioServico

router = APIRouter()


@router.get(
    "/",
    response_model=ListaUsuariosResposta,
    summary="Listar usuários",
    description="Lista todos os usuários com filtros e paginação. Requer papel de admin.",
)
async def listar_usuarios(
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db),
    pagina: int = Query(1, ge=1, description="Número da página"),
    por_pagina: int = Query(20, ge=1, le=100, description="Itens por página"),
    papel: Optional[PapelUsuario] = Query(None, description="Filtrar por papel"),
    ativo: Optional[bool] = Query(None, description="Filtrar por status"),
    busca: Optional[str] = Query(None, description="Buscar por nome/usuário/email"),
):
    """Lista usuários com filtros"""
    return await UsuarioServico.listar(
        db=db,
        pagina=pagina,
        por_pagina=por_pagina,
        papel=papel,
        ativo=ativo,
        busca=busca,
    )


@router.post(
    "/",
    response_model=UsuarioResposta,
    status_code=status.HTTP_201_CREATED,
    summary="Criar usuário",
    description="Cria um novo usuário no sistema. Requer papel de admin.",
)
async def criar_usuario(
    dados: UsuarioCriar,
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db),
):
    """Cria novo usuário"""
    try:
        usuario = await UsuarioServico.criar(db, dados)
        return UsuarioResposta.model_validate(usuario)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/me",
    response_model=UsuarioResposta,
    summary="Meus dados",
    description="Retorna os dados do usuário autenticado.",
)
async def obter_meus_dados(
    usuario_atual: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """Obtém dados do usuário logado"""
    usuario = await UsuarioServico.obter_por_id(db, usuario_atual.usuario_id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )
    return UsuarioResposta.model_validate(usuario)


@router.put(
    "/me",
    response_model=UsuarioResposta,
    summary="Atualizar meus dados",
    description="Atualiza os dados do usuário autenticado.",
)
async def atualizar_meus_dados(
    dados: UsuarioAtualizar,
    usuario_atual: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """Atualiza dados do usuário logado"""
    # Não permitir alterar papel próprio
    if dados.papel is not None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não é possível alterar seu próprio papel",
        )

    try:
        usuario = await UsuarioServico.atualizar(db, usuario_atual.usuario_id, dados)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado",
            )
        return UsuarioResposta.model_validate(usuario)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put(
    "/me/senha",
    summary="Alterar minha senha",
    description="Altera a senha do usuário autenticado.",
)
async def alterar_minha_senha(
    dados: UsuarioAtualizarSenha,
    usuario_atual: DadosToken = Depends(obter_usuario_atual),
    db: AsyncSession = Depends(get_db),
):
    """Altera senha do usuário logado"""
    sucesso = await UsuarioServico.alterar_senha(
        db=db,
        usuario_id=usuario_atual.usuario_id,
        senha_atual=dados.senha_atual,
        senha_nova=dados.senha_nova,
    )

    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta",
        )

    return {"mensagem": "Senha alterada com sucesso"}


@router.get(
    "/{usuario_id}",
    response_model=UsuarioResposta,
    summary="Obter usuário",
    description="Obtém dados de um usuário específico. Requer papel de admin.",
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
    return UsuarioResposta.model_validate(usuario)


@router.put(
    "/{usuario_id}",
    response_model=UsuarioResposta,
    summary="Atualizar usuário",
    description="Atualiza dados de um usuário. Requer papel de admin.",
)
async def atualizar_usuario(
    usuario_id: str,
    dados: UsuarioAtualizar,
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db),
):
    """Atualiza usuário"""
    try:
        usuario = await UsuarioServico.atualizar(db, usuario_id, dados)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado",
            )
        return UsuarioResposta.model_validate(usuario)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post(
    "/{usuario_id}/resetar-senha",
    summary="Resetar senha",
    description="Reseta a senha de um usuário. Requer papel de admin.",
)
async def resetar_senha_usuario(
    usuario_id: str,
    nova_senha: str = Query(..., min_length=6, description="Nova senha"),
    _: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db),
):
    """Reseta senha de um usuário (admin)"""
    sucesso = await UsuarioServico.resetar_senha(db, usuario_id, nova_senha)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )
    return {"mensagem": "Senha resetada com sucesso"}


@router.delete(
    "/{usuario_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deletar usuário",
    description="Remove um usuário do sistema. Requer papel de admin.",
)
async def deletar_usuario(
    usuario_id: str,
    admin: DadosToken = Depends(obter_usuario_admin),
    db: AsyncSession = Depends(get_db),
):
    """Deleta usuário"""
    # Não permitir deletar a si mesmo
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
