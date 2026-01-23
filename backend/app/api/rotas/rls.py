"""
Rotas de Administração do Row Level Security (RLS).

Endpoints para verificar e monitorar o status das políticas
de segurança a nível de linha no PostgreSQL.

Todos os endpoints requerem autenticação de administrador.
"""

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_admin, get_db_rls, obter_usuario_admin
from app.core.seguranca import DadosToken

router = APIRouter(prefix="/rls", tags=["RLS - Segurança"])


@router.get("/status", summary="Status do RLS em todas as tabelas")
async def obter_status_rls(
    db: AsyncSession = Depends(get_db_admin),
    _: DadosToken = Depends(obter_usuario_admin),
) -> dict[str, Any]:
    """
    Retorna o status do RLS em todas as tabelas protegidas.

    **Requer:** Administrador

    **Retorna:**
    - Lista de tabelas com status RLS
    - Resumo de quantas estão protegidas
    """
    result = await db.execute(
        text("""
            SELECT
                c.relname as tablename,
                c.relrowsecurity as rls_enabled,
                c.relforcerowsecurity as rls_forced
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
            AND c.relkind = 'r'
            AND c.relname IN (
                'usuarios', 'memorias', 'uso_api',
                'pesquisas', 'perguntas_pesquisa', 'respostas', 'analises'
            )
            ORDER BY c.relname
        """)
    )
    rows = result.fetchall()

    tables = [
        {
            "tabela": row.tablename,
            "rls_ativo": row.rls_enabled,
            "rls_forcado": row.rls_forced,
            "status": "✅ Protegida" if row.rls_enabled else "❌ Desprotegida",
        }
        for row in rows
    ]

    total = len(tables)
    protegidas = sum(1 for t in tables if t["rls_ativo"])

    return {
        "tabelas": tables,
        "resumo": {
            "total": total,
            "protegidas": protegidas,
            "desprotegidas": total - protegidas,
            "cobertura": f"{(protegidas / total * 100):.0f}%" if total > 0 else "0%",
        },
    }


@router.get("/policies", summary="Listar todas as políticas RLS")
async def listar_politicas_rls(
    db: AsyncSession = Depends(get_db_admin),
    _: DadosToken = Depends(obter_usuario_admin),
) -> dict[str, Any]:
    """
    Lista todas as políticas RLS ativas no banco de dados.

    **Requer:** Administrador

    **Retorna:**
    - Lista de políticas agrupadas por tabela
    """
    result = await db.execute(
        text("""
            SELECT
                tablename,
                policyname,
                permissive,
                roles,
                cmd,
                qual as using_expression,
                with_check
            FROM pg_policies
            WHERE schemaname = 'public'
            ORDER BY tablename, policyname
        """)
    )
    rows = result.fetchall()

    # Agrupar por tabela
    por_tabela: dict[str, list] = {}
    for row in rows:
        tabela = row.tablename
        if tabela not in por_tabela:
            por_tabela[tabela] = []

        por_tabela[tabela].append(
            {
                "nome": row.policyname,
                "tipo": "PERMISSIVE"
                if row.permissive == "PERMISSIVE"
                else "RESTRICTIVE",
                "comando": row.cmd,
                "roles": row.roles,
                "using": row.using_expression[:100] + "..."
                if row.using_expression and len(row.using_expression) > 100
                else row.using_expression,
                "with_check": row.with_check[:100] + "..."
                if row.with_check and len(row.with_check) > 100
                else row.with_check,
            }
        )

    return {
        "total_politicas": len(rows),
        "tabelas_cobertas": len(por_tabela),
        "politicas_por_tabela": por_tabela,
    }


@router.get("/context", summary="Verificar contexto RLS atual")
async def verificar_contexto_rls(
    db: AsyncSession = Depends(get_db_rls),
    usuario: DadosToken = Depends(obter_usuario_admin),
) -> dict[str, Any]:
    """
    Verifica o contexto RLS atual da sessão.

    Útil para debug e verificar se as variáveis estão sendo
    corretamente configuradas.

    **Requer:** Administrador

    **Retorna:**
    - Variáveis de sessão configuradas
    - Informações do usuário atual
    """
    result = await db.execute(
        text("""
            SELECT
                current_setting('app.current_user_id', true) as user_id,
                current_setting('app.current_user_role', true) as user_role,
                current_setting('app.bypass_rls', true) as bypass_rls
        """)
    )
    row = result.fetchone()

    return {
        "contexto_sessao": {
            "user_id": row.user_id or "(não definido)",
            "user_role": row.user_role or "(não definido)",
            "bypass_rls": row.bypass_rls == "true",
        },
        "usuario_autenticado": {
            "id": usuario.usuario_id,
            "papel": usuario.papel,
            "email": usuario.email,
        },
        "verificacao": {
            "contexto_correto": str(usuario.usuario_id) == row.user_id,
            "papel_correto": usuario.papel == row.user_role,
        },
    }


@router.get("/test", summary="Testar isolamento de dados RLS")
async def testar_isolamento_rls(
    db: AsyncSession = Depends(get_db_rls),
    usuario: DadosToken = Depends(obter_usuario_admin),
) -> dict[str, Any]:
    """
    Executa teste de isolamento para verificar se RLS está funcionando.

    Conta registros em cada tabela protegida para o usuário atual
    vs total (admin vê tudo).

    **Requer:** Administrador

    **Retorna:**
    - Contagem de registros por tabela
    - Indicação se isolamento está funcionando
    """
    # Tabelas permitidas para teste (whitelist - evita SQL injection)
    tabelas_permitidas = {
        "usuarios",
        "memorias",
        "uso_api",
        "pesquisas",
        "respostas",
        "analises",
    }
    tabelas_teste = [
        ("usuarios", "id"),
        ("memorias", "id"),
        ("uso_api", "id"),
        ("pesquisas", "id"),
        ("respostas", "id"),
        ("analises", "id"),
    ]

    resultados = []
    for tabela, pk in tabelas_teste:
        # Validação extra de segurança (whitelist)
        if tabela not in tabelas_permitidas:
            continue
        try:
            result = await db.execute(text(f"SELECT COUNT(*) as total FROM {tabela}"))
            count = result.scalar()
            resultados.append(
                {
                    "tabela": tabela,
                    "registros_visiveis": count,
                    "status": "✅ Acessível",
                }
            )
        except Exception as e:
            resultados.append(
                {
                    "tabela": tabela,
                    "registros_visiveis": 0,
                    "status": f"❌ Erro: {str(e)[:50]}",
                }
            )

    return {
        "usuario_teste": {
            "id": usuario.usuario_id,
            "papel": usuario.papel,
        },
        "resultados": resultados,
        "observacao": "Como admin, você vê todos os registros. Usuários normais verão apenas seus próprios dados.",
    }


@router.get("/functions", summary="Listar funções auxiliares RLS")
async def listar_funcoes_rls(
    db: AsyncSession = Depends(get_db_admin),
    _: DadosToken = Depends(obter_usuario_admin),
) -> dict[str, Any]:
    """
    Lista as funções auxiliares criadas para o RLS.

    **Requer:** Administrador

    **Retorna:**
    - Lista de funções RLS com suas definições
    """
    result = await db.execute(
        text("""
            SELECT
                proname as nome,
                pg_get_functiondef(oid) as definicao
            FROM pg_proc
            WHERE proname LIKE 'rls_%'
            ORDER BY proname
        """)
    )
    rows = result.fetchall()

    return {
        "total_funcoes": len(rows),
        "funcoes": [
            {
                "nome": row.nome,
                "definicao": row.definicao[:500] + "..."
                if len(row.definicao) > 500
                else row.definicao,
            }
            for row in rows
        ],
    }
