"""
Serviço de Usuários

Lógica de negócio para gerenciamento de usuários.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.seguranca import gerar_hash_senha, verificar_senha
from app.esquemas.usuario import (
    ListaUsuariosResposta,
    PapelUsuario,
    UsuarioAtualizar,
    UsuarioCriar,
    UsuarioResumido,
    UsuarioResposta,
)
from app.modelos.usuario import Usuario


class UsuarioServico:
    """Serviço para operações de usuário"""

    @staticmethod
    def gerar_id() -> str:
        """Gera um ID único para usuário"""
        return f"user-{uuid.uuid4().hex[:8]}"

    @staticmethod
    async def criar(db: AsyncSession, dados: UsuarioCriar) -> Usuario:
        """
        Cria um novo usuário.

        Args:
            db: Sessão do banco
            dados: Dados do usuário

        Returns:
            Usuário criado

        Raises:
            ValueError: Se usuário ou email já existir
        """
        # Verificar se usuário já existe
        existente = await db.execute(
            select(Usuario).where(
                or_(
                    Usuario.usuario == dados.usuario,
                    Usuario.email == dados.email
                )
            )
        )
        if existente.scalar_one_or_none():
            raise ValueError("Usuário ou email já cadastrado")

        # Criar usuário
        usuario = Usuario(
            id=UsuarioServico.gerar_id(),
            usuario=dados.usuario,
            nome=dados.nome,
            email=dados.email,
            senha_hash=gerar_hash_senha(dados.senha),
            papel=dados.papel.value,
            ativo=dados.ativo,
            descricao=dados.descricao,
        )

        db.add(usuario)
        await db.flush()
        await db.refresh(usuario)
        return usuario

    @staticmethod
    async def obter_por_id(db: AsyncSession, usuario_id: str) -> Optional[Usuario]:
        """Busca usuário por ID"""
        result = await db.execute(
            select(Usuario).where(Usuario.id == usuario_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def obter_por_usuario(db: AsyncSession, usuario: str) -> Optional[Usuario]:
        """Busca usuário por nome de usuário"""
        result = await db.execute(
            select(Usuario).where(Usuario.usuario == usuario)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def obter_por_email(db: AsyncSession, email: str) -> Optional[Usuario]:
        """Busca usuário por email"""
        result = await db.execute(
            select(Usuario).where(Usuario.email == email)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def obter_por_login(db: AsyncSession, login: str) -> Optional[Usuario]:
        """Busca usuário por nome de usuário ou email"""
        result = await db.execute(
            select(Usuario).where(
                or_(
                    Usuario.usuario == login,
                    Usuario.email == login
                )
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def autenticar(db: AsyncSession, login: str, senha: str) -> Optional[Usuario]:
        """
        Autentica usuário por login e senha.

        Args:
            db: Sessão do banco
            login: Nome de usuário ou email
            senha: Senha em texto plano

        Returns:
            Usuário se autenticado, None caso contrário
        """
        usuario = await UsuarioServico.obter_por_login(db, login)

        if not usuario:
            return None

        if not usuario.ativo:
            return None

        if not verificar_senha(senha, usuario.senha_hash):
            return None

        # Atualizar último login
        usuario.ultimo_login = datetime.now(timezone.utc)
        await db.flush()

        return usuario

    @staticmethod
    async def listar(
        db: AsyncSession,
        pagina: int = 1,
        por_pagina: int = 20,
        papel: Optional[PapelUsuario] = None,
        ativo: Optional[bool] = None,
        busca: Optional[str] = None,
    ) -> ListaUsuariosResposta:
        """
        Lista usuários com filtros e paginação.

        Args:
            db: Sessão do banco
            pagina: Número da página
            por_pagina: Itens por página
            papel: Filtrar por papel
            ativo: Filtrar por status
            busca: Buscar por nome ou usuário

        Returns:
            Lista paginada de usuários
        """
        query = select(Usuario)

        # Aplicar filtros
        if papel:
            query = query.where(Usuario.papel == papel.value)

        if ativo is not None:
            query = query.where(Usuario.ativo == ativo)

        if busca:
            busca_like = f"%{busca}%"
            query = query.where(
                or_(
                    Usuario.nome.ilike(busca_like),
                    Usuario.usuario.ilike(busca_like),
                    Usuario.email.ilike(busca_like),
                )
            )

        # Contar total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Aplicar paginação
        offset = (pagina - 1) * por_pagina
        query = query.offset(offset).limit(por_pagina).order_by(Usuario.nome)

        # Executar
        result = await db.execute(query)
        usuarios = result.scalars().all()

        # Calcular total de páginas
        total_paginas = (total + por_pagina - 1) // por_pagina if total > 0 else 1

        return ListaUsuariosResposta(
            usuarios=[UsuarioResumido.model_validate(u) for u in usuarios],
            total=total,
            pagina=pagina,
            por_pagina=por_pagina,
            total_paginas=total_paginas,
        )

    @staticmethod
    async def atualizar(
        db: AsyncSession,
        usuario_id: str,
        dados: UsuarioAtualizar
    ) -> Optional[Usuario]:
        """
        Atualiza um usuário.

        Args:
            db: Sessão do banco
            usuario_id: ID do usuário
            dados: Dados a atualizar

        Returns:
            Usuário atualizado ou None se não encontrado
        """
        usuario = await UsuarioServico.obter_por_id(db, usuario_id)
        if not usuario:
            return None

        # Atualizar campos fornecidos
        dados_dict = dados.model_dump(exclude_unset=True)

        if "email" in dados_dict and dados_dict["email"] != usuario.email:
            # Verificar se email já existe
            existente = await UsuarioServico.obter_por_email(db, dados_dict["email"])
            if existente and existente.id != usuario_id:
                raise ValueError("Email já está em uso")

        if "papel" in dados_dict:
            dados_dict["papel"] = dados_dict["papel"].value

        for campo, valor in dados_dict.items():
            setattr(usuario, campo, valor)

        await db.flush()
        await db.refresh(usuario)
        return usuario

    @staticmethod
    async def alterar_senha(
        db: AsyncSession,
        usuario_id: str,
        senha_atual: str,
        senha_nova: str
    ) -> bool:
        """
        Altera a senha de um usuário.

        Args:
            db: Sessão do banco
            usuario_id: ID do usuário
            senha_atual: Senha atual
            senha_nova: Nova senha

        Returns:
            True se alterado, False se senha atual incorreta
        """
        usuario = await UsuarioServico.obter_por_id(db, usuario_id)
        if not usuario:
            return False

        if not verificar_senha(senha_atual, usuario.senha_hash):
            return False

        usuario.senha_hash = gerar_hash_senha(senha_nova)
        await db.flush()
        return True

    @staticmethod
    async def resetar_senha(
        db: AsyncSession,
        usuario_id: str,
        nova_senha: str
    ) -> bool:
        """
        Reseta a senha de um usuário (admin).

        Args:
            db: Sessão do banco
            usuario_id: ID do usuário
            nova_senha: Nova senha

        Returns:
            True se alterado, False se usuário não encontrado
        """
        usuario = await UsuarioServico.obter_por_id(db, usuario_id)
        if not usuario:
            return False

        usuario.senha_hash = gerar_hash_senha(nova_senha)
        await db.flush()
        return True

    @staticmethod
    async def deletar(db: AsyncSession, usuario_id: str) -> bool:
        """
        Deleta um usuário.

        Args:
            db: Sessão do banco
            usuario_id: ID do usuário

        Returns:
            True se deletado, False se não encontrado
        """
        usuario = await UsuarioServico.obter_por_id(db, usuario_id)
        if not usuario:
            return False

        await db.delete(usuario)
        await db.flush()
        return True

    @staticmethod
    async def contar(db: AsyncSession) -> int:
        """Conta total de usuários"""
        result = await db.execute(select(func.count(Usuario.id)))
        return result.scalar() or 0

    @staticmethod
    async def existe_admin(db: AsyncSession) -> bool:
        """Verifica se existe pelo menos um admin"""
        result = await db.execute(
            select(Usuario).where(
                Usuario.papel == "admin",
                Usuario.ativo == True  # noqa: E712
            ).limit(1)
        )
        return result.scalar_one_or_none() is not None
