"""
Serviço de Cenários Eleitorais

Lógica de negócio para simulação de cenários eleitorais.
Inclui simulação de 1º e 2º turno, análise de rejeição e comparações.
"""

import json
import math
import random
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.esquemas.cenario_eleitoral import (
    CenarioEleitoralCreate,
    CenarioEleitoralUpdate,
    FiltrosCenario,
    ResultadoCandidato,
    AnaliseRejeicao,
)
from app.modelos.cenario_eleitoral import CenarioEleitoral
from app.modelos.candidato import Candidato


class CenarioEleitoralServico:
    """Serviço para gerenciamento e simulação de cenários eleitorais"""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ============================================
    # CRUD BÁSICO
    # ============================================

    async def listar(self, filtros: Optional[FiltrosCenario] = None) -> Dict[str, Any]:
        """Lista cenários com filtros e paginação"""
        if filtros is None:
            filtros = FiltrosCenario()

        query = select(CenarioEleitoral)

        if filtros.apenas_ativos:
            query = query.where(CenarioEleitoral.ativo == True)

        if filtros.busca_texto:
            termo = f"%{filtros.busca_texto}%"
            query = query.where(CenarioEleitoral.nome.ilike(termo))

        if filtros.cargos:
            cargos_valores = [c.value for c in filtros.cargos]
            query = query.where(CenarioEleitoral.cargo.in_(cargos_valores))

        if filtros.turnos:
            query = query.where(CenarioEleitoral.turno.in_(filtros.turnos))

        if filtros.status:
            status_valores = [s.value for s in filtros.status]
            query = query.where(CenarioEleitoral.status.in_(status_valores))

        # Contar total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Ordenação
        ordem_col = getattr(CenarioEleitoral, filtros.ordenar_por, CenarioEleitoral.criado_em)
        if filtros.ordem == "desc":
            query = query.order_by(ordem_col.desc())
        else:
            query = query.order_by(ordem_col.asc())

        # Paginação
        offset = (filtros.pagina - 1) * filtros.por_pagina
        query = query.offset(offset).limit(filtros.por_pagina)

        result = await self.db.execute(query)
        cenarios = result.scalars().all()

        total_paginas = math.ceil(total / filtros.por_pagina) if total > 0 else 0

        return {
            "cenarios": [c.to_dict() for c in cenarios],
            "total": total,
            "pagina": filtros.pagina,
            "por_pagina": filtros.por_pagina,
            "total_paginas": total_paginas,
        }

    async def obter_por_id(self, cenario_id: str) -> Optional[Dict]:
        """Obtém cenário por ID"""
        result = await self.db.execute(
            select(CenarioEleitoral).where(CenarioEleitoral.id == cenario_id)
        )
        cenario = result.scalar_one_or_none()
        return cenario.to_dict() if cenario else None

    async def criar(self, dados: CenarioEleitoralCreate, usuario_id: Optional[str] = None) -> Dict:
        """Cria novo cenário"""
        cenario_id = dados.id or f"cen-{uuid.uuid4().hex[:8]}"

        cenario = CenarioEleitoral(
            id=cenario_id,
            nome=dados.nome,
            descricao=dados.descricao,
            turno=dados.turno,
            cargo=dados.cargo.value,
            candidatos_ids=dados.candidatos_ids,
            incluir_indecisos=dados.incluir_indecisos,
            incluir_brancos_nulos=dados.incluir_brancos_nulos,
            amostra_tamanho=dados.amostra_tamanho,
            filtros_eleitores=dados.filtros_eleitores or {},
            status="rascunho",
            criado_por=usuario_id,
        )

        self.db.add(cenario)
        await self.db.commit()
        await self.db.refresh(cenario)

        return cenario.to_dict()

    async def atualizar(self, cenario_id: str, dados: CenarioEleitoralUpdate) -> Optional[Dict]:
        """Atualiza cenário existente"""
        result = await self.db.execute(
            select(CenarioEleitoral).where(CenarioEleitoral.id == cenario_id)
        )
        cenario = result.scalar_one_or_none()

        if not cenario:
            return None

        dados_dict = dados.model_dump(exclude_unset=True)
        for campo, valor in dados_dict.items():
            if hasattr(cenario, campo):
                if campo == "cargo" and valor:
                    valor = valor.value
                setattr(cenario, campo, valor)

        await self.db.commit()
        await self.db.refresh(cenario)

        return cenario.to_dict()

    async def deletar(self, cenario_id: str) -> bool:
        """Remove cenário"""
        result = await self.db.execute(
            select(CenarioEleitoral).where(CenarioEleitoral.id == cenario_id)
        )
        cenario = result.scalar_one_or_none()

        if not cenario:
            return False

        await self.db.delete(cenario)
        await self.db.commit()
        return True

    # ============================================
    # SIMULAÇÃO
    # ============================================

    async def _obter_candidatos(self, candidatos_ids: List[str]) -> List[Dict]:
        """Obtém dados dos candidatos por IDs"""
        result = await self.db.execute(
            select(Candidato).where(Candidato.id.in_(candidatos_ids))
        )
        candidatos = result.scalars().all()
        return [c.to_dict() for c in candidatos]

    async def simular_cenario(
        self,
        cenario_id: str,
        eleitores: List[Dict],
        modelo: str = "claude-sonnet-4-20250514"
    ) -> Dict:
        """
        Executa simulação de um cenário eleitoral.

        Esta é uma simulação simplificada que usa os dados dos eleitores
        e candidatos para estimar resultados. Para simulação com IA,
        seria necessário integrar com o Claude API.
        """
        inicio = datetime.now()

        # Obter cenário
        cenario = await self.obter_por_id(cenario_id)
        if not cenario:
            raise ValueError(f"Cenário {cenario_id} não encontrado")

        # Atualizar status
        await self.atualizar(cenario_id, CenarioEleitoralUpdate(status="executando"))

        try:
            # Obter candidatos
            candidatos = await self._obter_candidatos(cenario["candidatos_ids"])
            if len(candidatos) < 2:
                raise ValueError("É necessário pelo menos 2 candidatos para simulação")

            # Simular votação
            resultados = self._simular_votacao(
                eleitores=eleitores,
                candidatos=candidatos,
                turno=cenario["turno"],
                incluir_indecisos=cenario["incluir_indecisos"],
                incluir_brancos_nulos=cenario["incluir_brancos_nulos"],
            )

            # Calcular tempo e atualizar cenário
            tempo_execucao = (datetime.now() - inicio).total_seconds()

            await self.atualizar(
                cenario_id,
                CenarioEleitoralUpdate(
                    status="concluido",
                    resultados=resultados["candidatos"],
                    indecisos_percentual=resultados["indecisos_percentual"],
                    brancos_nulos_percentual=resultados["brancos_nulos_percentual"],
                    margem_erro=resultados["margem_erro"],
                    total_eleitores_simulados=len(eleitores),
                    tempo_execucao_segundos=tempo_execucao,
                    modelo_ia_usado=modelo,
                )
            )

            # Retornar resultado completo
            return {
                "cenario_id": cenario_id,
                "turno": cenario["turno"],
                "cargo": cenario["cargo"],
                "resultados": resultados["candidatos"],
                "indecisos": resultados["indecisos"],
                "indecisos_percentual": resultados["indecisos_percentual"],
                "brancos_nulos": resultados["brancos_nulos"],
                "brancos_nulos_percentual": resultados["brancos_nulos_percentual"],
                "total_eleitores": len(eleitores),
                "total_votos_validos": resultados["total_votos_validos"],
                "margem_erro": resultados["margem_erro"],
                "nivel_confianca": 95.0,
                "haveria_segundo_turno": resultados.get("haveria_segundo_turno"),
                "candidatos_segundo_turno": resultados.get("candidatos_segundo_turno"),
                "tempo_execucao_segundos": tempo_execucao,
                "modelo_usado": modelo,
                "executado_em": datetime.now().isoformat(),
            }

        except Exception as e:
            await self.atualizar(cenario_id, CenarioEleitoralUpdate(status="erro"))
            raise e

    def _simular_votacao(
        self,
        eleitores: List[Dict],
        candidatos: List[Dict],
        turno: int,
        incluir_indecisos: bool,
        incluir_brancos_nulos: bool,
    ) -> Dict:
        """
        Simula votação baseada no perfil dos eleitores e candidatos.

        Usa um algoritmo que considera:
        - Orientação política do eleitor vs candidato
        - Cluster socioeconômico
        - Região administrativa
        - Posição em relação a Bolsonaro/Lula
        - Rejeição estimada do candidato
        """
        votos = {c["id"]: 0 for c in candidatos}
        indecisos = 0
        brancos_nulos = 0

        # Mapa de candidatos para acesso rápido
        candidatos_map = {c["id"]: c for c in candidatos}

        for eleitor in eleitores:
            # Calcular afinidade com cada candidato
            afinidades = {}
            for candidato in candidatos:
                afinidade = self._calcular_afinidade(eleitor, candidato)
                # Reduzir afinidade baseado na rejeição
                rejeicao = candidato.get("rejeicao_estimada", 0) or 0
                afinidade *= (1 - rejeicao / 200)  # Rejeição reduz até 50%
                afinidades[candidato["id"]] = max(0, afinidade)

            # Decisão do eleitor
            total_afinidade = sum(afinidades.values())

            if total_afinidade < 0.1:
                # Eleitor não tem afinidade com nenhum candidato
                if incluir_brancos_nulos and random.random() < 0.7:
                    brancos_nulos += 1
                elif incluir_indecisos:
                    indecisos += 1
                else:
                    # Voto aleatório
                    candidato_escolhido = random.choice(list(votos.keys()))
                    votos[candidato_escolhido] += 1
            else:
                # Probabilidade de indecisão baseada no interesse político
                interesse = eleitor.get("interesse_politico", "medio")
                prob_indecisao = {"baixo": 0.3, "medio": 0.15, "alto": 0.05}.get(interesse, 0.15)

                if incluir_indecisos and random.random() < prob_indecisao:
                    indecisos += 1
                elif incluir_brancos_nulos and random.random() < 0.05:
                    brancos_nulos += 1
                else:
                    # Escolher candidato baseado nas afinidades (probabilístico)
                    candidato_escolhido = self._escolher_candidato_probabilistico(afinidades)
                    votos[candidato_escolhido] += 1

        # Calcular resultados
        total_eleitores = len(eleitores)
        total_votos_validos = sum(votos.values())

        resultados = []
        for candidato in candidatos:
            cand_votos = votos[candidato["id"]]
            percentual = (cand_votos / total_eleitores * 100) if total_eleitores > 0 else 0
            percentual_validos = (cand_votos / total_votos_validos * 100) if total_votos_validos > 0 else 0

            resultados.append({
                "candidato_id": candidato["id"],
                "candidato_nome": candidato["nome"],
                "candidato_nome_urna": candidato["nome_urna"],
                "partido": candidato["partido"],
                "votos": cand_votos,
                "percentual": round(percentual, 2),
                "percentual_validos": round(percentual_validos, 2),
                "cor_campanha": candidato.get("cor_campanha"),
                "foto_url": candidato.get("foto_url"),
            })

        # Ordenar por votos
        resultados.sort(key=lambda x: x["votos"], reverse=True)

        # Verificar se haveria segundo turno (1º turno, governador/senador)
        haveria_segundo_turno = None
        candidatos_segundo_turno = None

        if turno == 1 and resultados:
            primeiro_colocado = resultados[0]["percentual_validos"]
            if primeiro_colocado <= 50:
                haveria_segundo_turno = True
                candidatos_segundo_turno = [resultados[0]["candidato_id"], resultados[1]["candidato_id"]]
            else:
                haveria_segundo_turno = False

        # Calcular margem de erro (fórmula simplificada)
        margem_erro = round(1.96 * math.sqrt(0.25 / total_eleitores) * 100, 2) if total_eleitores > 0 else 0

        return {
            "candidatos": resultados,
            "indecisos": indecisos,
            "indecisos_percentual": round(indecisos / total_eleitores * 100, 2) if total_eleitores > 0 else 0,
            "brancos_nulos": brancos_nulos,
            "brancos_nulos_percentual": round(brancos_nulos / total_eleitores * 100, 2) if total_eleitores > 0 else 0,
            "total_votos_validos": total_votos_validos,
            "margem_erro": margem_erro,
            "haveria_segundo_turno": haveria_segundo_turno,
            "candidatos_segundo_turno": candidatos_segundo_turno,
        }

    def _calcular_afinidade(self, eleitor: Dict, candidato: Dict) -> float:
        """Calcula afinidade entre eleitor e candidato (0 a 1)"""
        afinidade = 0.5  # Base neutra

        # Orientação política
        orientacoes = ["esquerda", "centro-esquerda", "centro", "centro-direita", "direita"]
        try:
            eleitor_idx = orientacoes.index(eleitor.get("orientacao_politica", "centro"))
            candidato_idx = orientacoes.index(candidato.get("orientacao_politica", "centro"))
            diferenca_politica = abs(eleitor_idx - candidato_idx)
            afinidade += (4 - diferenca_politica) * 0.1  # Até +0.4
        except ValueError:
            pass

        # Posição Bolsonaro
        posicoes_bolsonaro = {
            "apoiador_forte": 2,
            "apoiador_moderado": 1,
            "neutro": 0,
            "critico_moderado": -1,
            "critico_forte": -2,
        }
        eleitor_bolsonaro = posicoes_bolsonaro.get(eleitor.get("posicao_bolsonaro", "neutro"), 0)
        candidato_bolsonaro = posicoes_bolsonaro.get(candidato.get("posicao_bolsonaro", "neutro"), 0)
        diferenca_bolsonaro = abs(eleitor_bolsonaro - candidato_bolsonaro)
        afinidade += (4 - diferenca_bolsonaro) * 0.05  # Até +0.2

        # Cluster socioeconômico vs propostas
        # (simplificado - assume que candidatos têm afinidade com certos clusters)
        cluster = eleitor.get("cluster_socioeconomico", "G2_media_alta")
        if "social" in str(candidato.get("areas_foco", [])).lower():
            if cluster in ["G3_media_baixa", "G4_baixa"]:
                afinidade += 0.1
        if "economia" in str(candidato.get("areas_foco", [])).lower():
            if cluster in ["G1_alta", "G2_media_alta"]:
                afinidade += 0.1

        # Gênero - pequena afinidade com candidatas mulheres entre eleitoras
        if eleitor.get("genero") == "feminino" and candidato.get("genero") == "feminino":
            afinidade += 0.05

        # Conhecimento do candidato (mais conhecido = mais votos)
        conhecimento = candidato.get("conhecimento_estimado", 50) or 50
        afinidade *= (0.5 + conhecimento / 200)  # Multiplica por 0.5 a 1.0

        return max(0, min(1, afinidade))

    def _escolher_candidato_probabilistico(self, afinidades: Dict[str, float]) -> str:
        """Escolhe candidato baseado em probabilidades proporcionais à afinidade"""
        total = sum(afinidades.values())
        if total == 0:
            return random.choice(list(afinidades.keys()))

        rand = random.random() * total
        acumulado = 0
        for candidato_id, afinidade in afinidades.items():
            acumulado += afinidade
            if rand <= acumulado:
                return candidato_id

        return list(afinidades.keys())[-1]

    # ============================================
    # ANÁLISE DE REJEIÇÃO
    # ============================================

    async def analisar_rejeicao(
        self,
        candidatos_ids: List[str],
        eleitores: List[Dict],
        incluir_motivos: bool = True,
    ) -> Dict:
        """
        Analisa rejeição dos candidatos entre os eleitores.

        Retorna taxa de rejeição e perfil dos rejeitadores.
        """
        candidatos = await self._obter_candidatos(candidatos_ids)
        if not candidatos:
            raise ValueError("Nenhum candidato encontrado")

        resultados = []
        for candidato in candidatos:
            # Calcular rejeição baseada em antipatia
            rejeitadores = 0
            rejeitadores_fortes = 0
            motivos_contagem = {}
            perfil_rejeitadores = {
                "por_orientacao": {},
                "por_cluster": {},
                "por_genero": {},
                "por_regiao": {},
            }

            for eleitor in eleitores:
                afinidade = self._calcular_afinidade(eleitor, candidato)

                # Rejeição forte: afinidade muito baixa
                if afinidade < 0.2:
                    rejeitadores_fortes += 1
                    rejeitadores += 1
                # Rejeição moderada
                elif afinidade < 0.35:
                    rejeitadores += 1

                # Contabilizar perfil dos rejeitadores
                if afinidade < 0.35:
                    orient = eleitor.get("orientacao_politica", "indefinido")
                    cluster = eleitor.get("cluster_socioeconomico", "indefinido")
                    genero = eleitor.get("genero", "indefinido")
                    regiao = eleitor.get("regiao_administrativa", "indefinido")

                    perfil_rejeitadores["por_orientacao"][orient] = \
                        perfil_rejeitadores["por_orientacao"].get(orient, 0) + 1
                    perfil_rejeitadores["por_cluster"][cluster] = \
                        perfil_rejeitadores["por_cluster"].get(cluster, 0) + 1
                    perfil_rejeitadores["por_genero"][genero] = \
                        perfil_rejeitadores["por_genero"].get(genero, 0) + 1
                    perfil_rejeitadores["por_regiao"][regiao] = \
                        perfil_rejeitadores["por_regiao"].get(regiao, 0) + 1

            total_eleitores = len(eleitores)
            taxa_rejeicao = round(rejeitadores / total_eleitores * 100, 2) if total_eleitores > 0 else 0
            taxa_rejeicao_forte = round(rejeitadores_fortes / total_eleitores * 100, 2) if total_eleitores > 0 else 0

            # Gerar motivos baseados no perfil
            principais_motivos = []
            if incluir_motivos:
                principais_motivos = self._gerar_motivos_rejeicao(
                    candidato, perfil_rejeitadores, rejeitadores
                )

            resultados.append({
                "candidato_id": candidato["id"],
                "candidato_nome": candidato["nome"],
                "candidato_nome_urna": candidato["nome_urna"],
                "partido": candidato["partido"],
                "taxa_rejeicao": taxa_rejeicao,
                "taxa_rejeicao_forte": taxa_rejeicao_forte,
                "total_rejeitadores": rejeitadores,
                "principais_motivos": principais_motivos,
                "perfil_rejeitadores": perfil_rejeitadores,
                "foto_url": candidato.get("foto_url"),
                "cor_campanha": candidato.get("cor_campanha"),
            })

        # Ordenar por menor rejeição
        resultados.sort(key=lambda x: x["taxa_rejeicao"])
        ranking = [r["candidato_id"] for r in resultados]

        # Gerar insights
        insights = self._gerar_insights_rejeicao(resultados)

        return {
            "candidatos": resultados,
            "ranking_menor_rejeicao": ranking,
            "insights": insights,
            "total_eleitores_analisados": len(eleitores),
            "executado_em": datetime.now().isoformat(),
        }

    def _gerar_motivos_rejeicao(
        self,
        candidato: Dict,
        perfil_rejeitadores: Dict,
        total_rejeitadores: int
    ) -> List[str]:
        """Gera lista de principais motivos de rejeição baseado no perfil"""
        motivos = []

        if total_rejeitadores == 0:
            return motivos

        # Analisar orientação política dos rejeitadores
        por_orientacao = perfil_rejeitadores.get("por_orientacao", {})
        max_orientacao = max(por_orientacao.items(), key=lambda x: x[1], default=(None, 0))
        if max_orientacao[0] and max_orientacao[1] > total_rejeitadores * 0.3:
            candidato_orient = candidato.get("orientacao_politica", "centro")
            if max_orientacao[0] in ["esquerda", "centro-esquerda"] and candidato_orient in ["direita", "centro-direita"]:
                motivos.append("Posicionamento à direita rejeitado por eleitores progressistas")
            elif max_orientacao[0] in ["direita", "centro-direita"] and candidato_orient in ["esquerda", "centro-esquerda"]:
                motivos.append("Posicionamento à esquerda rejeitado por eleitores conservadores")

        # Analisar cluster socioeconômico
        por_cluster = perfil_rejeitadores.get("por_cluster", {})
        clusters_baixos = por_cluster.get("G3_media_baixa", 0) + por_cluster.get("G4_baixa", 0)
        if clusters_baixos > total_rejeitadores * 0.4:
            motivos.append("Alta rejeição entre classes populares")

        clusters_altos = por_cluster.get("G1_alta", 0) + por_cluster.get("G2_media_alta", 0)
        if clusters_altos > total_rejeitadores * 0.4:
            motivos.append("Alta rejeição entre classes média e alta")

        # Analisar gênero
        por_genero = perfil_rejeitadores.get("por_genero", {})
        if por_genero.get("feminino", 0) > total_rejeitadores * 0.6:
            motivos.append("Maior rejeição entre mulheres")
        elif por_genero.get("masculino", 0) > total_rejeitadores * 0.6:
            motivos.append("Maior rejeição entre homens")

        # Controvérsias do candidato
        controversias = candidato.get("controversias", [])
        if controversias:
            motivos.append(f"Controvérsias: {controversias[0]}")

        # Pontos fracos
        pontos_fracos = candidato.get("pontos_fracos", [])
        if pontos_fracos:
            motivos.append(f"Ponto fraco: {pontos_fracos[0]}")

        return motivos[:5]  # Máximo 5 motivos

    def _gerar_insights_rejeicao(self, resultados: List[Dict]) -> List[str]:
        """Gera insights sobre a análise de rejeição"""
        insights = []

        if not resultados:
            return insights

        # Menor e maior rejeição
        menor = resultados[0]
        maior = resultados[-1]

        insights.append(
            f"{menor['candidato_nome_urna']} ({menor['partido']}) tem a menor rejeição: {menor['taxa_rejeicao']}%"
        )

        if len(resultados) > 1:
            insights.append(
                f"{maior['candidato_nome_urna']} ({maior['partido']}) tem a maior rejeição: {maior['taxa_rejeicao']}%"
            )

        # Diferença entre primeiro e último
        diferenca = maior["taxa_rejeicao"] - menor["taxa_rejeicao"]
        if diferenca > 20:
            insights.append(f"Grande diferença de rejeição entre candidatos: {diferenca:.1f} pontos percentuais")

        # Rejeição forte
        for r in resultados:
            if r["taxa_rejeicao_forte"] > 25:
                insights.append(
                    f"{r['candidato_nome_urna']} tem alta rejeição forte ({r['taxa_rejeicao_forte']}%): eleitores que nunca votariam"
                )

        return insights
