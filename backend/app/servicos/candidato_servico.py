"""
Serviço de Candidatos

Lógica de negócio para gerenciamento de candidatos.
Inclui CRUD completo, filtros avançados e estatísticas.
"""

import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.esquemas.candidato import (
    CandidatoCreate,
    CandidatoUpdate,
    FiltrosCandidato,
)
from app.modelos.candidato import Candidato


class CandidatoServico:
    """Serviço para gerenciamento de candidatos"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def listar(self, filtros: Optional[FiltrosCandidato] = None) -> Dict[str, Any]:
        """
        Lista candidatos com filtros avançados e paginação.

        Args:
            filtros: Filtros opcionais para busca

        Returns:
            Dicionário com candidatos, total e metadados de paginação
        """
        if filtros is None:
            filtros = FiltrosCandidato()

        query = select(Candidato)

        # Filtro de ativos
        if filtros.apenas_ativos:
            query = query.where(Candidato.ativo == True)

        # Busca textual
        if filtros.busca_texto:
            termo = f"%{filtros.busca_texto}%"
            query = query.where(
                or_(
                    Candidato.nome.ilike(termo),
                    Candidato.nome_urna.ilike(termo),
                    Candidato.partido.ilike(termo),
                )
            )

        # Filtros por lista
        if filtros.partidos:
            query = query.where(Candidato.partido.in_(filtros.partidos))

        if filtros.cargos:
            cargos_valores = [c.value for c in filtros.cargos]
            query = query.where(Candidato.cargo_pretendido.in_(cargos_valores))

        if filtros.status:
            status_valores = [s.value for s in filtros.status]
            query = query.where(Candidato.status_candidatura.in_(status_valores))

        if filtros.orientacoes_politicas:
            query = query.where(Candidato.orientacao_politica.in_(filtros.orientacoes_politicas))

        if filtros.generos:
            query = query.where(Candidato.genero.in_(filtros.generos))

        # Contar total antes da paginação
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Ordenação
        ordem_col = getattr(Candidato, filtros.ordenar_por, Candidato.nome_urna)
        if filtros.ordem == "desc":
            query = query.order_by(ordem_col.desc())
        else:
            query = query.order_by(ordem_col.asc())

        # Paginação
        offset = (filtros.pagina - 1) * filtros.por_pagina
        query = query.offset(offset).limit(filtros.por_pagina)

        # Executar
        result = await self.db.execute(query)
        candidatos = result.scalars().all()

        # Calcular total de páginas
        total_paginas = (total + filtros.por_pagina - 1) // filtros.por_pagina

        return {
            "candidatos": [c.to_dict() for c in candidatos],
            "total": total,
            "pagina": filtros.pagina,
            "por_pagina": filtros.por_pagina,
            "total_paginas": total_paginas,
        }

    async def obter_por_id(self, candidato_id: str) -> Optional[Dict]:
        """
        Obtém candidato por ID.

        Args:
            candidato_id: ID do candidato

        Returns:
            Dicionário com dados do candidato ou None
        """
        result = await self.db.execute(
            select(Candidato).where(Candidato.id == candidato_id)
        )
        candidato = result.scalar_one_or_none()
        return candidato.to_dict() if candidato else None

    async def criar(self, dados: CandidatoCreate) -> Dict:
        """
        Cria novo candidato.

        Args:
            dados: Dados do candidato

        Returns:
            Dicionário com dados do candidato criado
        """
        # Gerar ID se não fornecido
        candidato_id = dados.id or f"cand-{uuid.uuid4().hex[:8]}"

        # Verificar se ID já existe
        existente = await self.obter_por_id(candidato_id)
        if existente:
            raise ValueError(f"Candidato com ID {candidato_id} já existe")

        # Criar instância
        candidato_data = dados.model_dump(exclude={"id"})
        candidato = Candidato(id=candidato_id, **candidato_data)

        self.db.add(candidato)
        await self.db.commit()
        await self.db.refresh(candidato)

        return candidato.to_dict()

    async def atualizar(self, candidato_id: str, dados: CandidatoUpdate) -> Optional[Dict]:
        """
        Atualiza candidato existente.

        Args:
            candidato_id: ID do candidato
            dados: Dados para atualização

        Returns:
            Dicionário com dados atualizados ou None se não encontrado
        """
        result = await self.db.execute(
            select(Candidato).where(Candidato.id == candidato_id)
        )
        candidato = result.scalar_one_or_none()

        if not candidato:
            return None

        # Atualizar apenas campos fornecidos
        dados_dict = dados.model_dump(exclude_unset=True)
        for campo, valor in dados_dict.items():
            if hasattr(candidato, campo):
                setattr(candidato, campo, valor)

        await self.db.commit()
        await self.db.refresh(candidato)

        return candidato.to_dict()

    async def deletar(self, candidato_id: str) -> bool:
        """
        Remove candidato.

        Args:
            candidato_id: ID do candidato

        Returns:
            True se removido, False se não encontrado
        """
        result = await self.db.execute(
            select(Candidato).where(Candidato.id == candidato_id)
        )
        candidato = result.scalar_one_or_none()

        if not candidato:
            return False

        await self.db.delete(candidato)
        await self.db.commit()
        return True

    async def obter_por_cargo(self, cargo: str, apenas_ativos: bool = True) -> List[Dict]:
        """
        Obtém candidatos por cargo pretendido.

        Args:
            cargo: Cargo pretendido
            apenas_ativos: Se deve filtrar apenas ativos

        Returns:
            Lista de candidatos
        """
        query = select(Candidato).where(Candidato.cargo_pretendido == cargo)

        if apenas_ativos:
            query = query.where(Candidato.ativo == True)

        query = query.order_by(Candidato.ordem_exibicao.asc().nullslast(), Candidato.nome_urna.asc())

        result = await self.db.execute(query)
        candidatos = result.scalars().all()

        return [c.to_dict() for c in candidatos]

    async def obter_para_pesquisa(self, cargo: Optional[str] = None) -> Dict:
        """
        Obtém candidatos formatados para uso em pesquisas.

        Args:
            cargo: Filtrar por cargo (opcional)

        Returns:
            Dicionário com candidatos resumidos
        """
        query = select(Candidato).where(Candidato.ativo == True)

        if cargo:
            query = query.where(Candidato.cargo_pretendido == cargo)

        query = query.order_by(Candidato.ordem_exibicao.asc().nullslast(), Candidato.nome_urna.asc())

        result = await self.db.execute(query)
        candidatos = result.scalars().all()

        resumos = [
            {
                "id": c.id,
                "nome": c.nome,
                "nome_urna": c.nome_urna,
                "partido": c.partido,
                "numero_partido": c.numero_partido,
                "cargo_pretendido": c.cargo_pretendido,
                "foto_url": c.foto_url,
                "cor_campanha": c.cor_campanha,
            }
            for c in candidatos
        ]

        return {
            "candidatos": resumos,
            "total": len(resumos),
        }

    async def obter_estatisticas(self) -> Dict:
        """
        Obtém estatísticas dos candidatos.

        Returns:
            Dicionário com estatísticas
        """
        # Total
        total_result = await self.db.execute(
            select(func.count()).select_from(Candidato).where(Candidato.ativo == True)
        )
        total = total_result.scalar() or 0

        # Por cargo
        cargo_result = await self.db.execute(
            select(Candidato.cargo_pretendido, func.count())
            .where(Candidato.ativo == True)
            .group_by(Candidato.cargo_pretendido)
        )
        por_cargo = [
            {"cargo": cargo, "quantidade": qtd, "percentual": round(qtd / total * 100, 1) if total > 0 else 0}
            for cargo, qtd in cargo_result.all()
        ]

        # Por partido
        partido_result = await self.db.execute(
            select(Candidato.partido, func.count())
            .where(Candidato.ativo == True)
            .group_by(Candidato.partido)
            .order_by(func.count().desc())
        )
        por_partido = [
            {"partido": partido, "quantidade": qtd, "percentual": round(qtd / total * 100, 1) if total > 0 else 0}
            for partido, qtd in partido_result.all()
        ]

        # Por gênero
        genero_result = await self.db.execute(
            select(Candidato.genero, func.count())
            .where(Candidato.ativo == True)
            .where(Candidato.genero.isnot(None))
            .group_by(Candidato.genero)
        )
        por_genero = [
            {"genero": genero, "quantidade": qtd, "percentual": round(qtd / total * 100, 1) if total > 0 else 0}
            for genero, qtd in genero_result.all()
        ]

        # Por orientação política
        orientacao_result = await self.db.execute(
            select(Candidato.orientacao_politica, func.count())
            .where(Candidato.ativo == True)
            .where(Candidato.orientacao_politica.isnot(None))
            .group_by(Candidato.orientacao_politica)
        )
        por_orientacao = [
            {"orientacao": orient, "quantidade": qtd, "percentual": round(qtd / total * 100, 1) if total > 0 else 0}
            for orient, qtd in orientacao_result.all()
        ]

        # Por status
        status_result = await self.db.execute(
            select(Candidato.status_candidatura, func.count())
            .group_by(Candidato.status_candidatura)
        )
        por_status = [
            {"status": status, "quantidade": qtd}
            for status, qtd in status_result.all()
        ]

        return {
            "total": total,
            "por_cargo": por_cargo,
            "por_partido": por_partido,
            "por_genero": por_genero,
            "por_orientacao_politica": por_orientacao,
            "por_status": por_status,
        }

    async def importar_json(self, dados: List[Dict]) -> Dict:
        """
        Importa candidatos de uma lista JSON.

        Args:
            dados: Lista de dicionários com dados dos candidatos

        Returns:
            Resultado da importação
        """
        total_processados = 0
        total_adicionados = 0
        total_atualizados = 0
        erros = []

        for item in dados:
            total_processados += 1
            try:
                candidato_id = item.get("id") or f"cand-{uuid.uuid4().hex[:8]}"

                # Verificar se existe
                existente = await self.obter_por_id(candidato_id)

                if existente:
                    # Atualizar
                    update_data = CandidatoUpdate(**{k: v for k, v in item.items() if k != "id"})
                    await self.atualizar(candidato_id, update_data)
                    total_atualizados += 1
                else:
                    # Criar
                    item["id"] = candidato_id
                    create_data = CandidatoCreate(**item)
                    await self.criar(create_data)
                    total_adicionados += 1

            except Exception as e:
                erros.append(f"Erro no item {total_processados}: {str(e)}")

        return {
            "sucesso": len(erros) == 0,
            "total_processados": total_processados,
            "total_adicionados": total_adicionados,
            "total_atualizados": total_atualizados,
            "total_erros": len(erros),
            "erros": erros,
        }
