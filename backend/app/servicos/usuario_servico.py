"""
Serviço de Usuários

Lógica de negócio para gerenciamento de usuários e autenticação.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import configuracoes
from app.core.seguranca import gerar_hash_senha, verificar_senha
from app.modelos.usuario import PapelUsuario, ProvedorAuth, Usuario


class UsuarioServico:
    """Serviço para operações de usuário"""

    @staticmethod
    def gerar_id() -> str:
        """Gera um ID único para usuário"""
        return f"user-{uuid.uuid4().hex[:12]}"

    # ==========================================
    # CRUD Básico
    # ==========================================

    @staticmethod
    async def criar(
        db: AsyncSession,
        email: str,
        nome: str,
        senha: Optional[str] = None,
        usuario: Optional[str] = None,
        google_id: Optional[str] = None,
        avatar_url: Optional[str] = None,
        papel: str = PapelUsuario.LEITOR.value,
        provedor: str = ProvedorAuth.LOCAL.value,
        aprovado: bool = False,
    ) -> Usuario:
        """
        Cria um novo usuário.

        Args:
            db: Sessão do banco
            email: Email do usuário
            nome: Nome completo
            senha: Senha (opcional se OAuth)
            usuario: Nome de usuário (opcional)
            google_id: ID do Google (opcional)
            avatar_url: URL do avatar
            papel: Papel no sistema
            provedor: Provedor de autenticação
            aprovado: Se já está aprovado

        Returns:
            Usuário criado

        Raises:
            ValueError: Se email já existir
        """
        # Verificar se email já existe
        existente = await UsuarioServico.obter_por_email(db, email)
        if existente:
            raise ValueError("Email já cadastrado")

        # Verificar se usuário já existe (se fornecido)
        if usuario:
            existente = await UsuarioServico.obter_por_usuario(db, usuario)
            if existente:
                raise ValueError("Nome de usuário já existe")

        # Admin Professor Igor é aprovado automaticamente
        is_admin = email == configuracoes.ADMIN_EMAIL
        if is_admin:
            papel = PapelUsuario.ADMIN.value
            aprovado = True

        novo_usuario = Usuario(
            id=UsuarioServico.gerar_id(),
            email=email,
            nome=nome,
            usuario=usuario,
            senha_hash=gerar_hash_senha(senha) if senha else None,
            google_id=google_id,
            avatar_url=avatar_url,
            papel=papel,
            provedor_auth=provedor,
            aprovado=aprovado,
            ativo=True,
        )

        db.add(novo_usuario)
        await db.flush()
        await db.refresh(novo_usuario)
        return novo_usuario

    @staticmethod
    async def obter_por_id(db: AsyncSession, usuario_id: str) -> Optional[Usuario]:
        """Busca usuário por ID"""
        result = await db.execute(
            select(Usuario).where(Usuario.id == usuario_id)
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
    async def obter_por_usuario(db: AsyncSession, usuario: str) -> Optional[Usuario]:
        """Busca usuário por nome de usuário"""
        result = await db.execute(
            select(Usuario).where(Usuario.usuario == usuario)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def obter_por_google_id(db: AsyncSession, google_id: str) -> Optional[Usuario]:
        """Busca usuário por Google ID"""
        result = await db.execute(
            select(Usuario).where(Usuario.google_id == google_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def obter_por_login(db: AsyncSession, login: str) -> Optional[Usuario]:
        """Busca usuário por email ou nome de usuário"""
        result = await db.execute(
            select(Usuario).where(
                or_(
                    Usuario.email == login,
                    Usuario.usuario == login
                )
            )
        )
        return result.scalar_one_or_none()

    # ==========================================
    # Autenticação
    # ==========================================

    @staticmethod
    async def autenticar(db: AsyncSession, login: str, senha: str) -> Optional[Usuario]:
        """
        Autentica usuário por login (email ou usuário) e senha.

        Args:
            db: Sessão do banco
            login: Email ou nome de usuário
            senha: Senha em texto plano

        Returns:
            Usuário se autenticado, None caso contrário
        """
        usuario = await UsuarioServico.obter_por_login(db, login)

        if not usuario:
            return None

        if not usuario.ativo:
            return None

        # Usuários OAuth não têm senha local
        if usuario.provedor_auth != ProvedorAuth.LOCAL.value:
            return None

        if not usuario.senha_hash:
            return None

        if not verificar_senha(senha, usuario.senha_hash):
            return None

        # Atualizar último login
        usuario.ultimo_login = datetime.now(timezone.utc)
        await db.flush()

        return usuario

    @staticmethod
    async def autenticar_ou_criar_google(
        db: AsyncSession,
        google_id: str,
        email: str,
        nome: str,
        avatar_url: Optional[str] = None,
    ) -> Usuario:
        """
        Autentica ou cria usuário via Google OAuth.

        Args:
            db: Sessão do banco
            google_id: ID do Google
            email: Email do Google
            nome: Nome do Google
            avatar_url: URL da foto de perfil

        Returns:
            Usuário existente ou recém-criado
        """
        # Primeiro, tentar encontrar por Google ID
        usuario = await UsuarioServico.obter_por_google_id(db, google_id)

        if usuario:
            # Atualizar último login e avatar
            usuario.ultimo_login = datetime.now(timezone.utc)
            if avatar_url:
                usuario.avatar_url = avatar_url
            await db.flush()
            return usuario

        # Verificar se existe usuário com mesmo email
        usuario = await UsuarioServico.obter_por_email(db, email)

        if usuario:
            # Vincular conta Google ao usuário existente
            usuario.google_id = google_id
            usuario.provedor_auth = ProvedorAuth.GOOGLE.value
            usuario.ultimo_login = datetime.now(timezone.utc)
            if avatar_url:
                usuario.avatar_url = avatar_url
            await db.flush()
            return usuario

        # Criar novo usuário
        return await UsuarioServico.criar(
            db=db,
            email=email,
            nome=nome,
            google_id=google_id,
            avatar_url=avatar_url,
            provedor=ProvedorAuth.GOOGLE.value,
            papel=PapelUsuario.LEITOR.value,
            aprovado=False,  # Novos usuários precisam de aprovação
        )

    @staticmethod
    async def registrar(
        db: AsyncSession,
        email: str,
        nome: str,
        senha: str,
        usuario: Optional[str] = None,
    ) -> Usuario:
        """
        Registra novo usuário via formulário.

        Args:
            db: Sessão do banco
            email: Email
            nome: Nome completo
            senha: Senha
            usuario: Nome de usuário opcional

        Returns:
            Usuário criado
        """
        return await UsuarioServico.criar(
            db=db,
            email=email,
            nome=nome,
            senha=senha,
            usuario=usuario,
            provedor=ProvedorAuth.LOCAL.value,
            papel=PapelUsuario.LEITOR.value,
            aprovado=False,  # Precisa de aprovação do admin
        )

    # ==========================================
    # Gerenciamento (Admin)
    # ==========================================

    @staticmethod
    async def listar(
        db: AsyncSession,
        pagina: int = 1,
        por_pagina: int = 20,
        papel: Optional[str] = None,
        aprovado: Optional[bool] = None,
        ativo: Optional[bool] = None,
        busca: Optional[str] = None,
    ) -> dict:
        """
        Lista usuários com filtros e paginação.

        Returns:
            Dicionário com usuarios, total, pagina, por_pagina, total_paginas
        """
        query = select(Usuario)

        # Aplicar filtros
        if papel:
            query = query.where(Usuario.papel == papel)

        if aprovado is not None:
            query = query.where(Usuario.aprovado == aprovado)

        if ativo is not None:
            query = query.where(Usuario.ativo == ativo)

        if busca:
            busca_like = f"%{busca}%"
            query = query.where(
                or_(
                    Usuario.nome.ilike(busca_like),
                    Usuario.email.ilike(busca_like),
                    Usuario.usuario.ilike(busca_like),
                )
            )

        # Contar total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Paginação
        offset = (pagina - 1) * por_pagina
        query = query.offset(offset).limit(por_pagina).order_by(Usuario.criado_em.desc())

        # Executar
        result = await db.execute(query)
        usuarios = result.scalars().all()

        total_paginas = (total + por_pagina - 1) // por_pagina if total > 0 else 1

        return {
            "usuarios": usuarios,
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "total_paginas": total_paginas,
        }

    @staticmethod
    async def aprovar(db: AsyncSession, usuario_id: str, papel: Optional[str] = None) -> Optional[Usuario]:
        """
        Aprova um usuário e opcionalmente altera seu papel.

        Args:
            db: Sessão do banco
            usuario_id: ID do usuário
            papel: Novo papel (opcional)

        Returns:
            Usuário atualizado ou None
        """
        usuario = await UsuarioServico.obter_por_id(db, usuario_id)
        if not usuario:
            return None

        usuario.aprovado = True
        if papel:
            usuario.papel = papel

        await db.flush()
        await db.refresh(usuario)
        return usuario

    @staticmethod
    async def revogar(db: AsyncSession, usuario_id: str) -> Optional[Usuario]:
        """
        Revoga aprovação de um usuário (volta a ser leitor).

        Args:
            db: Sessão do banco
            usuario_id: ID do usuário

        Returns:
            Usuário atualizado ou None
        """
        usuario = await UsuarioServico.obter_por_id(db, usuario_id)
        if not usuario:
            return None

        # Não pode revogar admin
        if usuario.is_admin:
            return None

        usuario.aprovado = False
        usuario.papel = PapelUsuario.LEITOR.value

        await db.flush()
        await db.refresh(usuario)
        return usuario

    @staticmethod
    async def atualizar_papel(
        db: AsyncSession,
        usuario_id: str,
        papel: str,
    ) -> Optional[Usuario]:
        """
        Atualiza o papel de um usuário.

        Args:
            db: Sessão do banco
            usuario_id: ID do usuário
            papel: Novo papel

        Returns:
            Usuário atualizado ou None
        """
        usuario = await UsuarioServico.obter_por_id(db, usuario_id)
        if not usuario:
            return None

        usuario.papel = papel
        # Se não é leitor, precisa estar aprovado
        if papel != PapelUsuario.LEITOR.value:
            usuario.aprovado = True

        await db.flush()
        await db.refresh(usuario)
        return usuario

    @staticmethod
    async def desativar(db: AsyncSession, usuario_id: str) -> Optional[Usuario]:
        """Desativa um usuário"""
        usuario = await UsuarioServico.obter_por_id(db, usuario_id)
        if not usuario:
            return None

        usuario.ativo = False
        await db.flush()
        return usuario

    @staticmethod
    async def ativar(db: AsyncSession, usuario_id: str) -> Optional[Usuario]:
        """Ativa um usuário"""
        usuario = await UsuarioServico.obter_por_id(db, usuario_id)
        if not usuario:
            return None

        usuario.ativo = True
        await db.flush()
        return usuario

    @staticmethod
    async def deletar(db: AsyncSession, usuario_id: str) -> bool:
        """Deleta um usuário"""
        usuario = await UsuarioServico.obter_por_id(db, usuario_id)
        if not usuario:
            return False

        await db.delete(usuario)
        await db.flush()
        return True

    @staticmethod
    async def contar_pendentes(db: AsyncSession) -> int:
        """Conta usuários pendentes de aprovação"""
        result = await db.execute(
            select(func.count(Usuario.id)).where(
                Usuario.aprovado == False,  # noqa: E712
                Usuario.ativo == True,  # noqa: E712
            )
        )
        return result.scalar() or 0

    @staticmethod
    async def alterar_senha(
        db: AsyncSession,
        usuario_id: str,
        senha_atual: str,
        senha_nova: str,
    ) -> bool:
        """Altera senha do usuário"""
        usuario = await UsuarioServico.obter_por_id(db, usuario_id)
        if not usuario or not usuario.senha_hash:
            return False

        if not verificar_senha(senha_atual, usuario.senha_hash):
            return False

        usuario.senha_hash = gerar_hash_senha(senha_nova)
        await db.flush()
        return True
