#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Migracao: JSON -> PostgreSQL

Migra os eleitores do arquivo JSON para o banco de dados PostgreSQL.
Deve ser executado uma unica vez apos configurar o banco.

Uso:
    cd backend
    python -m scripts.migrar_eleitores
"""

import asyncio
import json
import sys
from pathlib import Path

# Adiciona o diretorio do backend ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import configuracoes
from app.db.base import Base
from app.modelos.eleitor import Eleitor


# Configuracao do banco
DATABASE_URL = configuracoes.DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
)


async def criar_tabelas(engine):
    """Cria as tabelas no banco de dados"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] Tabelas criadas/verificadas")


async def contar_eleitores_existentes(session: AsyncSession) -> int:
    """Conta quantos eleitores ja existem no banco"""
    result = await session.execute(select(Eleitor.id))
    return len(result.all())


async def migrar_eleitores(session: AsyncSession, caminho_json: Path) -> dict:
    """
    Migra eleitores do JSON para o banco.

    Returns:
        Estatisticas da migracao
    """
    # Verifica se o arquivo existe
    if not caminho_json.exists():
        print(f"[ERRO] Arquivo nao encontrado: {caminho_json}")
        return {"erro": "Arquivo nao encontrado"}

    # Carrega JSON
    print(f"[INFO] Carregando {caminho_json}...")
    with open(caminho_json, "r", encoding="utf-8") as f:
        eleitores_json = json.load(f)

    print(f"       Encontrados {len(eleitores_json)} eleitores no JSON")

    # Verifica eleitores existentes
    existentes = await contar_eleitores_existentes(session)
    if existentes > 0:
        print(f"[AVISO] Ja existem {existentes} eleitores no banco")
        print("        Continuando... IDs duplicados serao ignorados")

    # Migrar
    print("[INFO] Iniciando migracao...")
    total_migrados = 0
    total_erros = 0
    erros = []

    for i, eleitor_data in enumerate(eleitores_json):
        try:
            # Verifica se ja existe
            eleitor_id = eleitor_data.get("id", "")
            result = await session.execute(
                select(Eleitor.id).where(Eleitor.id == eleitor_id)
            )
            if result.scalar_one_or_none():
                continue

            # Cria o eleitor
            eleitor = Eleitor.from_dict(eleitor_data)
            session.add(eleitor)
            total_migrados += 1

            # Commit a cada 100 registros para nao sobrecarregar memoria
            if (i + 1) % 100 == 0:
                await session.commit()
                print(f"       Processados {i + 1}/{len(eleitores_json)}...")

        except Exception as e:
            total_erros += 1
            erros.append(f"Eleitor {eleitor_data.get('id', i)}: {str(e)}")
            if total_erros <= 5:
                print(f"[ERRO] Erro no eleitor {eleitor_data.get('id', i)}: {e}")

    # Commit final
    await session.commit()

    # Estatisticas
    stats = {
        "total_json": len(eleitores_json),
        "total_migrados": total_migrados,
        "total_erros": total_erros,
        "erros": erros[:10],
    }

    print(f"\n[RESULTADO] Migracao:")
    print(f"            Total no JSON: {stats['total_json']}")
    print(f"            Migrados: {stats['total_migrados']}")
    print(f"            Erros: {stats['total_erros']}")

    # Verifica contagem final
    total_final = await contar_eleitores_existentes(session)
    print(f"            Total no banco: {total_final}")

    return stats


async def main():
    """Funcao principal"""
    print("=" * 60)
    print("MIGRACAO DE ELEITORES: JSON -> PostgreSQL")
    print("=" * 60)

    # Caminho do JSON
    base_path = Path(__file__).parent.parent.parent
    caminho_json = base_path / "agentes" / "banco-eleitores-df.json"

    print(f"\n[CONFIG] Banco: {DATABASE_URL[:50]}...")
    print(f"[CONFIG] JSON: {caminho_json}")

    # Cria engine
    engine = create_async_engine(DATABASE_URL, echo=False)

    try:
        # Cria tabelas
        await criar_tabelas(engine)

        # Cria sessao
        async_session = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

        async with async_session() as session:
            stats = await migrar_eleitores(session, caminho_json)

        print("\n[OK] Migracao concluida!")
        return stats

    except Exception as e:
        print(f"\n[ERRO] Erro na migracao: {e}")
        import traceback
        traceback.print_exc()
        return {"erro": str(e)}

    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
