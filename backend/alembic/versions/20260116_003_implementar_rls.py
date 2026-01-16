"""Implementar Row Level Security (RLS) no banco de dados

Revision ID: 20260116_003
Revises: 20260116_002
Create Date: 2026-01-16

Esta migration implementa políticas de segurança a nível de linha (RLS) para:
- Isolar dados por usuário (multi-tenant)
- Garantir que admins vejam tudo
- Proteger dados mesmo com acesso direto ao banco

Tabelas protegidas:
- usuarios: cada usuário vê apenas seu próprio registro (admin vê todos)
- memorias: usuário vê apenas suas memórias
- uso_api: usuário vê apenas seu uso
- pesquisas: dados compartilhados (visíveis para todos usuários autenticados)
- respostas: dados compartilhados
- analises: dados compartilhados
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "20260116_003"
down_revision = "20260116_002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Implementa RLS nas tabelas principais.

    Variáveis de sessão usadas:
    - app.current_user_id: ID do usuário atual (string)
    - app.current_user_role: Papel do usuário (admin, pesquisador, visualizador, leitor)
    - app.bypass_rls: Se 'true', ignora RLS (apenas para conexões de serviço)
    """

    # ========================================
    # 1. CRIAR FUNÇÕES AUXILIARES
    # ========================================

    # Função para obter o user_id atual de forma segura
    op.execute("""
        CREATE OR REPLACE FUNCTION rls_current_user_id()
        RETURNS TEXT AS $$
        BEGIN
            RETURN COALESCE(
                current_setting('app.current_user_id', true),
                ''
            );
        EXCEPTION
            WHEN undefined_object THEN
                RETURN '';
        END;
        $$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
    """)

    # Função para verificar se é admin
    op.execute("""
        CREATE OR REPLACE FUNCTION rls_is_admin()
        RETURNS BOOLEAN AS $$
        BEGIN
            RETURN COALESCE(
                current_setting('app.current_user_role', true),
                ''
            ) = 'admin';
        EXCEPTION
            WHEN undefined_object THEN
                RETURN FALSE;
        END;
        $$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
    """)

    # Função para verificar se RLS deve ser ignorado (conexões de serviço)
    op.execute("""
        CREATE OR REPLACE FUNCTION rls_bypass_enabled()
        RETURNS BOOLEAN AS $$
        BEGIN
            RETURN COALESCE(
                current_setting('app.bypass_rls', true),
                'false'
            ) = 'true';
        EXCEPTION
            WHEN undefined_object THEN
                RETURN FALSE;
        END;
        $$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
    """)

    # Função para verificar se usuário está autenticado
    op.execute("""
        CREATE OR REPLACE FUNCTION rls_is_authenticated()
        RETURNS BOOLEAN AS $$
        BEGIN
            RETURN rls_current_user_id() != '' OR rls_bypass_enabled();
        END;
        $$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
    """)

    # ========================================
    # 2. TABELA: usuarios
    # ========================================

    # Habilitar RLS
    op.execute("ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;")

    # Forçar RLS mesmo para owner da tabela
    op.execute("ALTER TABLE usuarios FORCE ROW LEVEL SECURITY;")

    # Política: bypass para conexões de serviço
    op.execute("""
        CREATE POLICY usuarios_bypass_policy ON usuarios
            FOR ALL
            USING (rls_bypass_enabled());
    """)

    # Política: admin vê todos
    op.execute("""
        CREATE POLICY usuarios_admin_all ON usuarios
            FOR ALL
            USING (rls_is_admin())
            WITH CHECK (rls_is_admin());
    """)

    # Política: usuário vê apenas seu próprio registro
    op.execute("""
        CREATE POLICY usuarios_own_record ON usuarios
            FOR SELECT
            USING (id = rls_current_user_id());
    """)

    # Política: usuário pode atualizar apenas seu próprio registro
    op.execute("""
        CREATE POLICY usuarios_update_own ON usuarios
            FOR UPDATE
            USING (id = rls_current_user_id())
            WITH CHECK (id = rls_current_user_id());
    """)

    # ========================================
    # 3. TABELA: memorias
    # ========================================

    op.execute("ALTER TABLE memorias ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE memorias FORCE ROW LEVEL SECURITY;")

    # Bypass para conexões de serviço
    op.execute("""
        CREATE POLICY memorias_bypass_policy ON memorias
            FOR ALL
            USING (rls_bypass_enabled());
    """)

    # Admin vê todas as memórias
    op.execute("""
        CREATE POLICY memorias_admin_all ON memorias
            FOR ALL
            USING (rls_is_admin())
            WITH CHECK (rls_is_admin());
    """)

    # Usuário vê apenas suas próprias memórias
    # Nota: usuario_id é INTEGER, mas comparamos com TEXT convertendo
    op.execute("""
        CREATE POLICY memorias_own_records ON memorias
            FOR SELECT
            USING (
                usuario_id IS NULL  -- Memórias sem usuário são visíveis para autenticados
                OR usuario_id::TEXT = rls_current_user_id()
            );
    """)

    # Usuário pode inserir memórias apenas para si mesmo
    op.execute("""
        CREATE POLICY memorias_insert_own ON memorias
            FOR INSERT
            WITH CHECK (
                usuario_id IS NULL
                OR usuario_id::TEXT = rls_current_user_id()
            );
    """)

    # Usuário pode atualizar apenas suas próprias memórias
    op.execute("""
        CREATE POLICY memorias_update_own ON memorias
            FOR UPDATE
            USING (usuario_id::TEXT = rls_current_user_id())
            WITH CHECK (usuario_id::TEXT = rls_current_user_id());
    """)

    # ========================================
    # 4. TABELA: uso_api
    # ========================================

    op.execute("ALTER TABLE uso_api ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE uso_api FORCE ROW LEVEL SECURITY;")

    # Bypass para conexões de serviço
    op.execute("""
        CREATE POLICY uso_api_bypass_policy ON uso_api
            FOR ALL
            USING (rls_bypass_enabled());
    """)

    # Admin vê todo o uso
    op.execute("""
        CREATE POLICY uso_api_admin_all ON uso_api
            FOR ALL
            USING (rls_is_admin())
            WITH CHECK (rls_is_admin());
    """)

    # Usuário vê apenas seu próprio uso
    op.execute("""
        CREATE POLICY uso_api_own_records ON uso_api
            FOR SELECT
            USING (
                usuario_id IS NULL  -- Agregados globais visíveis para autenticados
                OR usuario_id::TEXT = rls_current_user_id()
            );
    """)

    # Usuário pode inserir/atualizar apenas seu próprio uso
    op.execute("""
        CREATE POLICY uso_api_insert_own ON uso_api
            FOR INSERT
            WITH CHECK (
                usuario_id IS NULL
                OR usuario_id::TEXT = rls_current_user_id()
            );
    """)

    op.execute("""
        CREATE POLICY uso_api_update_own ON uso_api
            FOR UPDATE
            USING (usuario_id::TEXT = rls_current_user_id())
            WITH CHECK (usuario_id::TEXT = rls_current_user_id());
    """)

    # ========================================
    # 5. TABELA: pesquisas (dados compartilhados)
    # ========================================

    op.execute("ALTER TABLE pesquisas ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE pesquisas FORCE ROW LEVEL SECURITY;")

    # Bypass para conexões de serviço
    op.execute("""
        CREATE POLICY pesquisas_bypass_policy ON pesquisas
            FOR ALL
            USING (rls_bypass_enabled());
    """)

    # Todos usuários autenticados podem ver pesquisas
    op.execute("""
        CREATE POLICY pesquisas_authenticated_select ON pesquisas
            FOR SELECT
            USING (rls_is_authenticated());
    """)

    # Apenas admin e pesquisador podem criar/modificar
    op.execute("""
        CREATE POLICY pesquisas_admin_pesquisador_modify ON pesquisas
            FOR ALL
            USING (
                rls_is_admin()
                OR current_setting('app.current_user_role', true) = 'pesquisador'
            )
            WITH CHECK (
                rls_is_admin()
                OR current_setting('app.current_user_role', true) = 'pesquisador'
            );
    """)

    # ========================================
    # 6. TABELA: perguntas_pesquisa
    # ========================================

    op.execute("ALTER TABLE perguntas_pesquisa ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE perguntas_pesquisa FORCE ROW LEVEL SECURITY;")

    # Bypass para conexões de serviço
    op.execute("""
        CREATE POLICY perguntas_bypass_policy ON perguntas_pesquisa
            FOR ALL
            USING (rls_bypass_enabled());
    """)

    # Todos autenticados podem ver
    op.execute("""
        CREATE POLICY perguntas_authenticated_select ON perguntas_pesquisa
            FOR SELECT
            USING (rls_is_authenticated());
    """)

    # Admin e pesquisador podem modificar
    op.execute("""
        CREATE POLICY perguntas_admin_pesquisador_modify ON perguntas_pesquisa
            FOR ALL
            USING (
                rls_is_admin()
                OR current_setting('app.current_user_role', true) = 'pesquisador'
            )
            WITH CHECK (
                rls_is_admin()
                OR current_setting('app.current_user_role', true) = 'pesquisador'
            );
    """)

    # ========================================
    # 7. TABELA: respostas
    # ========================================

    op.execute("ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE respostas FORCE ROW LEVEL SECURITY;")

    # Bypass para conexões de serviço
    op.execute("""
        CREATE POLICY respostas_bypass_policy ON respostas
            FOR ALL
            USING (rls_bypass_enabled());
    """)

    # Todos autenticados podem ver
    op.execute("""
        CREATE POLICY respostas_authenticated_select ON respostas
            FOR SELECT
            USING (rls_is_authenticated());
    """)

    # Admin e pesquisador podem modificar
    op.execute("""
        CREATE POLICY respostas_admin_pesquisador_modify ON respostas
            FOR ALL
            USING (
                rls_is_admin()
                OR current_setting('app.current_user_role', true) = 'pesquisador'
            )
            WITH CHECK (
                rls_is_admin()
                OR current_setting('app.current_user_role', true) = 'pesquisador'
            );
    """)

    # ========================================
    # 8. TABELA: analises
    # ========================================

    op.execute("ALTER TABLE analises ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE analises FORCE ROW LEVEL SECURITY;")

    # Bypass para conexões de serviço
    op.execute("""
        CREATE POLICY analises_bypass_policy ON analises
            FOR ALL
            USING (rls_bypass_enabled());
    """)

    # Todos autenticados podem ver
    op.execute("""
        CREATE POLICY analises_authenticated_select ON analises
            FOR SELECT
            USING (rls_is_authenticated());
    """)

    # Admin e pesquisador podem modificar
    op.execute("""
        CREATE POLICY analises_admin_pesquisador_modify ON analises
            FOR ALL
            USING (
                rls_is_admin()
                OR current_setting('app.current_user_role', true) = 'pesquisador'
            )
            WITH CHECK (
                rls_is_admin()
                OR current_setting('app.current_user_role', true) = 'pesquisador'
            );
    """)

    # ========================================
    # 9. CRIAR VIEW DE AUDITORIA
    # ========================================

    op.execute("""
        CREATE OR REPLACE VIEW rls_status AS
        SELECT
            schemaname,
            tablename,
            rowsecurity as rls_enabled,
            forcerowsecurity as rls_forced
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN (
            'usuarios', 'memorias', 'uso_api',
            'pesquisas', 'perguntas_pesquisa', 'respostas', 'analises'
        )
        ORDER BY tablename;
    """)

    # View para listar políticas
    op.execute("""
        CREATE OR REPLACE VIEW rls_policies AS
        SELECT
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual as using_expression,
            with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname;
    """)


def downgrade() -> None:
    """Remove todas as políticas RLS e funções auxiliares."""

    # Remover views de auditoria
    op.execute("DROP VIEW IF EXISTS rls_policies;")
    op.execute("DROP VIEW IF EXISTS rls_status;")

    # ========================================
    # TABELA: analises
    # ========================================
    op.execute("DROP POLICY IF EXISTS analises_admin_pesquisador_modify ON analises;")
    op.execute("DROP POLICY IF EXISTS analises_authenticated_select ON analises;")
    op.execute("DROP POLICY IF EXISTS analises_bypass_policy ON analises;")
    op.execute("ALTER TABLE analises DISABLE ROW LEVEL SECURITY;")

    # ========================================
    # TABELA: respostas
    # ========================================
    op.execute("DROP POLICY IF EXISTS respostas_admin_pesquisador_modify ON respostas;")
    op.execute("DROP POLICY IF EXISTS respostas_authenticated_select ON respostas;")
    op.execute("DROP POLICY IF EXISTS respostas_bypass_policy ON respostas;")
    op.execute("ALTER TABLE respostas DISABLE ROW LEVEL SECURITY;")

    # ========================================
    # TABELA: perguntas_pesquisa
    # ========================================
    op.execute("DROP POLICY IF EXISTS perguntas_admin_pesquisador_modify ON perguntas_pesquisa;")
    op.execute("DROP POLICY IF EXISTS perguntas_authenticated_select ON perguntas_pesquisa;")
    op.execute("DROP POLICY IF EXISTS perguntas_bypass_policy ON perguntas_pesquisa;")
    op.execute("ALTER TABLE perguntas_pesquisa DISABLE ROW LEVEL SECURITY;")

    # ========================================
    # TABELA: pesquisas
    # ========================================
    op.execute("DROP POLICY IF EXISTS pesquisas_admin_pesquisador_modify ON pesquisas;")
    op.execute("DROP POLICY IF EXISTS pesquisas_authenticated_select ON pesquisas;")
    op.execute("DROP POLICY IF EXISTS pesquisas_bypass_policy ON pesquisas;")
    op.execute("ALTER TABLE pesquisas DISABLE ROW LEVEL SECURITY;")

    # ========================================
    # TABELA: uso_api
    # ========================================
    op.execute("DROP POLICY IF EXISTS uso_api_update_own ON uso_api;")
    op.execute("DROP POLICY IF EXISTS uso_api_insert_own ON uso_api;")
    op.execute("DROP POLICY IF EXISTS uso_api_own_records ON uso_api;")
    op.execute("DROP POLICY IF EXISTS uso_api_admin_all ON uso_api;")
    op.execute("DROP POLICY IF EXISTS uso_api_bypass_policy ON uso_api;")
    op.execute("ALTER TABLE uso_api DISABLE ROW LEVEL SECURITY;")

    # ========================================
    # TABELA: memorias
    # ========================================
    op.execute("DROP POLICY IF EXISTS memorias_update_own ON memorias;")
    op.execute("DROP POLICY IF EXISTS memorias_insert_own ON memorias;")
    op.execute("DROP POLICY IF EXISTS memorias_own_records ON memorias;")
    op.execute("DROP POLICY IF EXISTS memorias_admin_all ON memorias;")
    op.execute("DROP POLICY IF EXISTS memorias_bypass_policy ON memorias;")
    op.execute("ALTER TABLE memorias DISABLE ROW LEVEL SECURITY;")

    # ========================================
    # TABELA: usuarios
    # ========================================
    op.execute("DROP POLICY IF EXISTS usuarios_update_own ON usuarios;")
    op.execute("DROP POLICY IF EXISTS usuarios_own_record ON usuarios;")
    op.execute("DROP POLICY IF EXISTS usuarios_admin_all ON usuarios;")
    op.execute("DROP POLICY IF EXISTS usuarios_bypass_policy ON usuarios;")
    op.execute("ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;")

    # ========================================
    # REMOVER FUNÇÕES AUXILIARES
    # ========================================
    op.execute("DROP FUNCTION IF EXISTS rls_is_authenticated();")
    op.execute("DROP FUNCTION IF EXISTS rls_bypass_enabled();")
    op.execute("DROP FUNCTION IF EXISTS rls_is_admin();")
    op.execute("DROP FUNCTION IF EXISTS rls_current_user_id();")
