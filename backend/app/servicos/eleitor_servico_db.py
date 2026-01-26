"""
Serviço de Eleitores (PostgreSQL)

Lógica de negócio para gestão de eleitores/agentes sintéticos usando PostgreSQL.
Substitui a versão baseada em JSON por queries SQLAlchemy assíncronas.
"""

import math
from collections import Counter
from typing import Any, Dict, List, Optional, Set

from sqlalchemy import Integer, func, or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.esquemas.eleitor import (
    EleitorCreate,
    EleitorUpdate,
    FiltrosEleitor,
    UploadResult,
)
from app.modelos.eleitor import Eleitor


class EleitorServicoDB:
    """Serviço para gerenciamento de eleitores usando PostgreSQL"""

    def __init__(self, db: AsyncSession):
        """
        Inicializa o serviço com uma sessão do banco.

        Args:
            db: Sessão assíncrona do SQLAlchemy
        """
        self.db = db

    def _aplicar_filtros_query(self, query, filtros: FiltrosEleitor):
        """
        Aplica filtros à query SQLAlchemy.

        Args:
            query: Query base
            filtros: Filtros a aplicar

        Returns:
            Query com filtros aplicados
        """
        # Filtros demográficos
        if filtros.idade_min is not None:
            query = query.where(Eleitor.idade >= filtros.idade_min)
        if filtros.idade_max is not None:
            query = query.where(Eleitor.idade <= filtros.idade_max)
        if filtros.generos:
            query = query.where(Eleitor.genero.in_(filtros.generos))
        if filtros.cores_racas:
            query = query.where(Eleitor.cor_raca.in_(filtros.cores_racas))

        # Filtros geográficos
        if filtros.regioes_administrativas:
            query = query.where(
                Eleitor.regiao_administrativa.in_(filtros.regioes_administrativas)
            )

        # Filtros socioeconômicos
        if filtros.clusters:
            query = query.where(Eleitor.cluster_socioeconomico.in_(filtros.clusters))
        if filtros.escolaridades:
            query = query.where(Eleitor.escolaridade.in_(filtros.escolaridades))
        if filtros.profissoes:
            query = query.where(Eleitor.profissao.in_(filtros.profissoes))
        if filtros.ocupacoes:
            query = query.where(Eleitor.ocupacao_vinculo.in_(filtros.ocupacoes))
        if filtros.faixas_renda:
            query = query.where(
                Eleitor.renda_salarios_minimos.in_(filtros.faixas_renda)
            )

        # Filtros socioculturais
        if filtros.religioes:
            query = query.where(Eleitor.religiao.in_(filtros.religioes))
        if filtros.estados_civis:
            query = query.where(Eleitor.estado_civil.in_(filtros.estados_civis))
        if filtros.tem_filhos is not None:
            if filtros.tem_filhos:
                query = query.where(Eleitor.filhos > 0)
            else:
                query = query.where(Eleitor.filhos == 0)

        # Filtros políticos
        if filtros.orientacoes_politicas:
            query = query.where(
                Eleitor.orientacao_politica.in_(filtros.orientacoes_politicas)
            )
        if filtros.posicoes_bolsonaro:
            query = query.where(
                Eleitor.posicao_bolsonaro.in_(filtros.posicoes_bolsonaro)
            )
        if filtros.interesses_politicos:
            query = query.where(
                Eleitor.interesse_politico.in_(filtros.interesses_politicos)
            )

        # Filtros comportamentais
        if filtros.estilos_decisao:
            query = query.where(Eleitor.estilo_decisao.in_(filtros.estilos_decisao))
        if filtros.tolerancias:
            query = query.where(Eleitor.tolerancia_nuance.in_(filtros.tolerancias))
        if filtros.voto_facultativo is not None:
            query = query.where(Eleitor.voto_facultativo == filtros.voto_facultativo)
        if filtros.conflito_identitario is not None:
            query = query.where(
                Eleitor.conflito_identitario == filtros.conflito_identitario
            )

        # Busca textual (ILIKE para case-insensitive)
        if filtros.busca_texto:
            termo = f"%{filtros.busca_texto}%"
            query = query.where(
                or_(
                    Eleitor.nome.ilike(termo),
                    Eleitor.profissao.ilike(termo),
                    Eleitor.regiao_administrativa.ilike(termo),
                    Eleitor.historia_resumida.ilike(termo),
                )
            )

        return query

    def _aplicar_ordenacao(self, query, ordenar_por: str, ordem: str):
        """Aplica ordenação à query"""
        campo = getattr(Eleitor, ordenar_por, Eleitor.nome)
        if ordem.lower() == "desc":
            query = query.order_by(campo.desc())
        else:
            query = query.order_by(campo.asc())
        return query

    async def _gerar_id(self) -> str:
        """Gera um novo ID único para eleitor"""
        result = await self.db.execute(
            select(
                func.max(
                    func.cast(
                        func.substr(Eleitor.id, 4),  # Remove "df-"
                        Integer,
                    )
                )
            ).where(Eleitor.id.like("df-%"))
        )
        max_num = result.scalar() or 0
        return f"df-{max_num + 1:04d}"

    # ============================================
    # MÉTODOS PÚBLICOS
    # ============================================

    async def listar(self, filtros: FiltrosEleitor) -> Dict[str, Any]:
        """
        Lista eleitores com filtros, ordenação e paginação.

        Args:
            filtros: Objeto com filtros a aplicar

        Returns:
            Dicionário com eleitores e metadados de paginação
        """
        # Query base
        query = select(Eleitor)

        # Aplicar filtros
        query = self._aplicar_filtros_query(query, filtros)

        # Contar total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Ordenar
        query = self._aplicar_ordenacao(query, filtros.ordenar_por, filtros.ordem)

        # Paginar
        offset = (filtros.pagina - 1) * filtros.por_pagina
        query = query.offset(offset).limit(filtros.por_pagina)

        # Executar
        result = await self.db.execute(query)
        eleitores = result.scalars().all()

        # Calcular paginação
        total_paginas = math.ceil(total / filtros.por_pagina) if total > 0 else 1

        return {
            "eleitores": [e.to_dict() for e in eleitores],
            "total": total,
            "pagina": filtros.pagina,
            "por_pagina": filtros.por_pagina,
            "total_paginas": total_paginas,
            "filtros_aplicados": filtros.model_dump(exclude_none=True),
        }

    async def obter_por_id(self, eleitor_id: str) -> Optional[Dict]:
        """
        Obtém um eleitor pelo ID.

        Args:
            eleitor_id: ID do eleitor

        Returns:
            Dados do eleitor ou None
        """
        result = await self.db.execute(select(Eleitor).where(Eleitor.id == eleitor_id))
        eleitor = result.scalar_one_or_none()
        return eleitor.to_dict() if eleitor else None

    async def criar(self, dados: EleitorCreate) -> Dict:
        """
        Cria um novo eleitor.

        Args:
            dados: Dados do eleitor

        Returns:
            Eleitor criado
        """
        eleitor_dict = dados.model_dump()

        if not eleitor_dict.get("id"):
            eleitor_dict["id"] = await self._gerar_id()

        # Verificar ID único
        existente = await self.db.execute(
            select(Eleitor.id).where(Eleitor.id == eleitor_dict["id"])
        )
        if existente.scalar_one_or_none():
            raise ValueError(f"Eleitor com ID {eleitor_dict['id']} já existe")

        eleitor = Eleitor.from_dict(eleitor_dict)
        self.db.add(eleitor)
        await self.db.flush()

        return eleitor.to_dict()

    async def atualizar(self, eleitor_id: str, dados: EleitorUpdate) -> Optional[Dict]:
        """
        Atualiza um eleitor existente.

        Args:
            eleitor_id: ID do eleitor
            dados: Dados a atualizar

        Returns:
            Eleitor atualizado ou None
        """
        result = await self.db.execute(select(Eleitor).where(Eleitor.id == eleitor_id))
        eleitor = result.scalar_one_or_none()

        if eleitor:
            atualizacoes = dados.model_dump(exclude_none=True)
            for campo, valor in atualizacoes.items():
                if hasattr(eleitor, campo):
                    setattr(eleitor, campo, valor)
            await self.db.flush()
            return eleitor.to_dict()

        return None

    async def deletar(self, eleitor_id: str) -> bool:
        """
        Remove um eleitor.

        Args:
            eleitor_id: ID do eleitor

        Returns:
            True se removido, False se não encontrado
        """
        result = await self.db.execute(select(Eleitor).where(Eleitor.id == eleitor_id))
        eleitor = result.scalar_one_or_none()

        if eleitor:
            await self.db.delete(eleitor)
            return True

        return False

    async def obter_estatisticas(
        self, filtros: Optional[FiltrosEleitor] = None
    ) -> Dict:
        """
        Calcula estatísticas dos eleitores.

        Args:
            filtros: Filtros opcionais

        Returns:
            Estatísticas calculadas
        """
        # Query base
        query = select(Eleitor)
        if filtros:
            query = self._aplicar_filtros_query(query, filtros)

        result = await self.db.execute(query)
        eleitores = result.scalars().all()

        total = len(eleitores)
        if total == 0:
            return {"total": 0, "mensagem": "Nenhum eleitor encontrado"}

        def calcular_distribuicao(campo: str) -> List[Dict]:
            """Calcula distribuição de um campo"""
            contagem = Counter(getattr(e, campo, "N/A") for e in eleitores)
            return [
                {
                    "categoria": cat,
                    "quantidade": qtd,
                    "percentual": round(qtd / total * 100, 1),
                }
                for cat, qtd in contagem.most_common()
            ]

        def calcular_faixas_etarias() -> List[Dict]:
            """Calcula distribuição por faixa etária"""
            faixas = {"16-24": 0, "25-34": 0, "35-44": 0, "45-59": 0, "60+": 0}
            for e in eleitores:
                idade = e.idade or 0
                if idade >= 60:
                    faixas["60+"] += 1
                elif idade >= 45:
                    faixas["45-59"] += 1
                elif idade >= 35:
                    faixas["35-44"] += 1
                elif idade >= 25:
                    faixas["25-34"] += 1
                else:
                    faixas["16-24"] += 1

            return [
                {
                    "categoria": faixa,
                    "quantidade": qtd,
                    "percentual": round(qtd / total * 100, 1),
                }
                for faixa, qtd in faixas.items()
            ]

        # Calcular médias
        idades = [e.idade or 0 for e in eleitores]
        filhos = [e.filhos or 0 for e in eleitores]

        return {
            "total": total,
            "por_genero": calcular_distribuicao("genero"),
            "por_cluster": calcular_distribuicao("cluster_socioeconomico"),
            "por_regiao": calcular_distribuicao("regiao_administrativa"),
            "por_religiao": calcular_distribuicao("religiao"),
            "por_faixa_etaria": calcular_faixas_etarias(),
            "por_escolaridade": calcular_distribuicao("escolaridade"),
            "por_orientacao_politica": calcular_distribuicao("orientacao_politica"),
            "por_posicao_bolsonaro": calcular_distribuicao("posicao_bolsonaro"),
            "por_interesse_politico": calcular_distribuicao("interesse_politico"),
            "idade_media": round(sum(idades) / total, 1),
            "filhos_media": round(sum(filhos) / total, 1),
        }

    async def obter_opcoes_filtros(self) -> Dict[str, List[str]]:
        """
        Obtém valores únicos para cada campo filtrável.

        Returns:
            Dicionário com opções para cada filtro
        """
        opcoes = {}

        campos = {
            "generos": Eleitor.genero,
            "cores_racas": Eleitor.cor_raca,
            "regioes_administrativas": Eleitor.regiao_administrativa,
            "clusters": Eleitor.cluster_socioeconomico,
            "escolaridades": Eleitor.escolaridade,
            "profissoes": Eleitor.profissao,
            "ocupacoes": Eleitor.ocupacao_vinculo,
            "faixas_renda": Eleitor.renda_salarios_minimos,
            "religioes": Eleitor.religiao,
            "estados_civis": Eleitor.estado_civil,
            "orientacoes_politicas": Eleitor.orientacao_politica,
            "posicoes_bolsonaro": Eleitor.posicao_bolsonaro,
            "interesses_politicos": Eleitor.interesse_politico,
            "estilos_decisao": Eleitor.estilo_decisao,
            "tolerancias": Eleitor.tolerancia_nuance,
        }

        for nome, coluna in campos.items():
            result = await self.db.execute(
                select(coluna).distinct().where(coluna.isnot(None)).order_by(coluna)
            )
            opcoes[nome] = [r[0] for r in result.all() if r[0]]

        return opcoes

    async def importar_json(self, dados_json: List[Dict]) -> UploadResult:
        """
        Importa eleitores de uma lista JSON.

        Args:
            dados_json: Lista de eleitores em formato JSON

        Returns:
            Resultado da importação
        """
        total_processados = 0
        total_adicionados = 0
        erros = []

        for i, eleitor_data in enumerate(dados_json):
            total_processados += 1
            try:
                # Gerar ID se não existir
                if not eleitor_data.get("id"):
                    eleitor_data["id"] = await self._gerar_id()

                eleitor_id = eleitor_data["id"]

                # Verificar se já existe
                existente = await self.db.execute(
                    select(Eleitor.id).where(Eleitor.id == eleitor_id)
                )
                if existente.scalar_one_or_none():
                    erros.append(f"Linha {i + 1}: ID {eleitor_id} já existe")
                    continue

                # Validar dados mínimos
                if not eleitor_data.get("nome"):
                    erros.append(f"Linha {i + 1}: Nome é obrigatório")
                    continue

                # Criar eleitor
                eleitor = Eleitor.from_dict(eleitor_data)
                self.db.add(eleitor)
                total_adicionados += 1

            except Exception as e:
                erros.append(f"Linha {i + 1}: {str(e)}")

        if total_adicionados > 0:
            await self.db.flush()

        return UploadResult(
            sucesso=total_adicionados > 0,
            total_processados=total_processados,
            total_adicionados=total_adicionados,
            total_erros=len(erros),
            erros=erros[:20],
        )

    async def obter_ids(self, filtros: Optional[FiltrosEleitor] = None) -> List[str]:
        """
        Obtém apenas os IDs dos eleitores filtrados.

        Args:
            filtros: Filtros opcionais

        Returns:
            Lista de IDs
        """
        query = select(Eleitor.id)
        if filtros:
            query = self._aplicar_filtros_query(query, filtros)

        result = await self.db.execute(query)
        return [r[0] for r in result.all()]

    async def obter_por_ids(self, ids: List[str]) -> List[Dict]:
        """
        Obtém eleitores por lista de IDs.

        Args:
            ids: Lista de IDs

        Returns:
            Lista de eleitores
        """
        if not ids:
            return []

        result = await self.db.execute(select(Eleitor).where(Eleitor.id.in_(ids)))
        eleitores = result.scalars().all()
        return [e.to_dict() for e in eleitores]

    async def contar_total(self) -> int:
        """Retorna o total de eleitores no banco"""
        result = await self.db.execute(select(func.count(Eleitor.id)))
        return result.scalar() or 0

    async def exportar_csv(self, filtros: FiltrosEleitor) -> str:
        """
        Exporta eleitores filtrados para CSV.

        Args:
            filtros: Filtros a aplicar

        Returns:
            String CSV com cabeçalho e dados
        """
        import csv
        import io

        # Query base sem paginação
        query = select(Eleitor)
        query = self._aplicar_filtros_query(query, filtros)
        query = self._aplicar_ordenacao(query, filtros.ordenar_por, filtros.ordem)

        result = await self.db.execute(query)
        eleitores = result.scalars().all()

        # Criar CSV em memória
        output = io.StringIO()

        # Definir colunas para exportação
        colunas = [
            "id",
            "nome",
            "idade",
            "genero",
            "cor_raca",
            "regiao_administrativa",
            "cluster_socioeconomico",
            "escolaridade",
            "profissao",
            "ocupacao_vinculo",
            "renda_salarios_minimos",
            "religiao",
            "estado_civil",
            "filhos",
            "orientacao_politica",
            "posicao_bolsonaro",
            "interesse_politico",
            "estilo_decisao",
            "tolerancia_nuance",
            "voto_facultativo",
            "conflito_identitario",
        ]

        writer = csv.DictWriter(output, fieldnames=colunas, extrasaction="ignore")
        writer.writeheader()

        for eleitor in eleitores:
            dados = eleitor.to_dict()
            # Filtrar apenas colunas desejadas
            linha = {col: dados.get(col, "") for col in colunas}
            writer.writerow(linha)

        return output.getvalue()
