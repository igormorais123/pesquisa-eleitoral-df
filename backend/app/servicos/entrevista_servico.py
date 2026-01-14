"""
Serviço de Entrevistas

Lógica de negócio para gestão e execução de entrevistas.
"""

import json
import uuid
import asyncio
from typing import List, Optional, Dict, Any
from pathlib import Path
from datetime import datetime
import math

from app.esquemas.entrevista import (
    EntrevistaCreate,
    EntrevistaUpdate,
    Entrevista,
    Pergunta,
    StatusEntrevista,
    RespostaEleitor,
    ProgressoEntrevista,
)
from app.servicos.eleitor_servico import obter_servico_eleitores
from app.servicos.claude_servico import obter_claude_servico


class EntrevistaServico:
    """Serviço para gerenciamento de entrevistas"""

    def __init__(self, caminho_dados: str = None):
        if caminho_dados is None:
            base_path = Path(__file__).parent.parent.parent.parent
            caminho_dados = base_path / "memorias" / "entrevistas.json"

        self.caminho_dados = Path(caminho_dados)
        self.caminho_respostas = self.caminho_dados.parent / "respostas.json"
        self._entrevistas: List[Dict[str, Any]] = []
        self._respostas: List[Dict[str, Any]] = []
        self._carregar_dados()

        # Estado de execução
        self._execucao_ativa: Dict[str, Dict] = {}

    def _carregar_dados(self):
        """Carrega entrevistas do arquivo JSON"""
        if self.caminho_dados.exists():
            with open(self.caminho_dados, "r", encoding="utf-8") as f:
                self._entrevistas = json.load(f)
        else:
            self._entrevistas = []

        if self.caminho_respostas.exists():
            with open(self.caminho_respostas, "r", encoding="utf-8") as f:
                self._respostas = json.load(f)
        else:
            self._respostas = []

    def _salvar_dados(self):
        """Salva entrevistas no arquivo JSON"""
        self.caminho_dados.parent.mkdir(parents=True, exist_ok=True)
        with open(self.caminho_dados, "w", encoding="utf-8") as f:
            json.dump(self._entrevistas, f, ensure_ascii=False, indent=2, default=str)

    def _salvar_respostas(self):
        """Salva respostas no arquivo JSON"""
        self.caminho_respostas.parent.mkdir(parents=True, exist_ok=True)
        with open(self.caminho_respostas, "w", encoding="utf-8") as f:
            json.dump(self._respostas, f, ensure_ascii=False, indent=2, default=str)

    def _gerar_id(self) -> str:
        """Gera ID único"""
        return f"ent-{uuid.uuid4().hex[:8]}"

    # ============================================
    # CRUD
    # ============================================

    def listar(
        self,
        pagina: int = 1,
        por_pagina: int = 20,
        status: Optional[str] = None
    ) -> Dict[str, Any]:
        """Lista entrevistas com paginação"""
        resultado = self._entrevistas

        if status:
            resultado = [e for e in resultado if e.get("status") == status]

        # Ordenar por data (mais recente primeiro)
        resultado = sorted(
            resultado,
            key=lambda x: x.get("criado_em", ""),
            reverse=True
        )

        total = len(resultado)
        total_paginas = math.ceil(total / por_pagina) if total > 0 else 1

        inicio = (pagina - 1) * por_pagina
        fim = inicio + por_pagina
        resultado = resultado[inicio:fim]

        return {
            "entrevistas": resultado,
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "total_paginas": total_paginas
        }

    def obter_por_id(self, entrevista_id: str) -> Optional[Dict]:
        """Obtém entrevista por ID"""
        for e in self._entrevistas:
            if e.get("id") == entrevista_id:
                return e
        return None

    def criar(self, dados: EntrevistaCreate) -> Dict:
        """Cria nova entrevista"""
        entrevista_id = self._gerar_id()

        # Processar perguntas
        perguntas = []
        for i, p in enumerate(dados.perguntas):
            perguntas.append({
                "id": f"{entrevista_id}-p{i+1:02d}",
                **p.model_dump()
            })

        # Estimar custo
        claude = obter_claude_servico()
        estimativa = claude.estimar_custo(
            total_perguntas=len(perguntas),
            total_eleitores=len(dados.eleitores_ids)
        )

        entrevista = {
            "id": entrevista_id,
            "titulo": dados.titulo,
            "descricao": dados.descricao,
            "tipo": dados.tipo.value,
            "instrucao_geral": dados.instrucao_geral,
            "perguntas": perguntas,
            "eleitores_ids": dados.eleitores_ids,
            "total_eleitores": len(dados.eleitores_ids),
            "status": StatusEntrevista.rascunho.value,
            "progresso": 0,
            "custo_estimado": estimativa["custo_medio"],
            "custo_real": 0.0,
            "tokens_entrada_total": 0,
            "tokens_saida_total": 0,
            "criado_em": datetime.now().isoformat(),
            "iniciado_em": None,
            "pausado_em": None,
            "concluido_em": None,
        }

        self._entrevistas.append(entrevista)
        self._salvar_dados()

        return entrevista

    def atualizar(self, entrevista_id: str, dados: EntrevistaUpdate) -> Optional[Dict]:
        """Atualiza entrevista"""
        for i, e in enumerate(self._entrevistas):
            if e.get("id") == entrevista_id:
                atualizacoes = dados.model_dump(exclude_none=True)
                self._entrevistas[i].update(atualizacoes)
                self._salvar_dados()
                return self._entrevistas[i]
        return None

    def deletar(self, entrevista_id: str) -> bool:
        """Remove entrevista"""
        for i, e in enumerate(self._entrevistas):
            if e.get("id") == entrevista_id:
                # Também remover respostas
                self._respostas = [
                    r for r in self._respostas
                    if r.get("entrevista_id") != entrevista_id
                ]
                del self._entrevistas[i]
                self._salvar_dados()
                self._salvar_respostas()
                return True
        return False

    # ============================================
    # EXECUÇÃO
    # ============================================

    async def iniciar_execucao(
        self,
        entrevista_id: str,
        limite_custo: float = 100.0,
        batch_size: int = 10,
        delay_ms: int = 500,
        callback_progresso=None
    ) -> Dict[str, Any]:
        """
        Inicia execução de entrevista.

        Args:
            entrevista_id: ID da entrevista
            limite_custo: Limite de custo em reais
            batch_size: Tamanho do batch
            delay_ms: Delay entre batches
            callback_progresso: Callback para atualizar progresso

        Returns:
            Resultado da execução
        """
        entrevista = self.obter_por_id(entrevista_id)
        if not entrevista:
            raise ValueError(f"Entrevista {entrevista_id} não encontrada")

        if entrevista["status"] == StatusEntrevista.executando.value:
            raise ValueError("Entrevista já está em execução")

        # Atualizar status
        entrevista["status"] = StatusEntrevista.executando.value
        entrevista["iniciado_em"] = datetime.now().isoformat()
        self._salvar_dados()

        # Inicializar estado de execução
        self._execucao_ativa[entrevista_id] = {
            "pausado": False,
            "cancelado": False
        }

        # Obter eleitores e serviços
        eleitor_servico = obter_servico_eleitores()
        claude = obter_claude_servico()

        eleitores = eleitor_servico.obter_por_ids(entrevista["eleitores_ids"])
        perguntas = entrevista["perguntas"]

        total_chamadas = len(eleitores) * len(perguntas)
        chamadas_feitas = 0
        custo_total = 0.0
        tokens_entrada = 0
        tokens_saida = 0
        respostas_novas = []

        inicio_exec = datetime.now()

        try:
            for pergunta in perguntas:
                for i in range(0, len(eleitores), batch_size):
                    # Verificar se foi pausado/cancelado
                    estado = self._execucao_ativa.get(entrevista_id, {})
                    if estado.get("cancelado"):
                        raise Exception("Execução cancelada pelo usuário")
                    while estado.get("pausado"):
                        await asyncio.sleep(0.5)
                        estado = self._execucao_ativa.get(entrevista_id, {})

                    # Verificar limite de custo
                    if custo_total >= limite_custo * 0.8:
                        print(f"⚠️ 80% do limite de custo atingido: R$ {custo_total:.2f}")

                    if custo_total >= limite_custo:
                        raise Exception(f"Limite de custo atingido: R$ {custo_total:.2f}")

                    # Processar batch
                    batch = eleitores[i:i + batch_size]
                    batch_tasks = []

                    for eleitor in batch:
                        task = claude.processar_resposta(
                            eleitor=eleitor,
                            pergunta=pergunta["texto"],
                            tipo_pergunta=pergunta["tipo"],
                            opcoes=pergunta.get("opcoes")
                        )
                        batch_tasks.append(task)

                    # Executar batch em paralelo
                    resultados = await asyncio.gather(*batch_tasks, return_exceptions=True)

                    for resultado in resultados:
                        if isinstance(resultado, Exception):
                            print(f"Erro: {resultado}")
                            continue

                        chamadas_feitas += 1
                        custo_total += resultado["custo_reais"]
                        tokens_entrada += resultado["tokens_entrada"]
                        tokens_saida += resultado["tokens_saida"]

                        # Salvar resposta
                        resposta = {
                            "id": f"{entrevista_id}-{uuid.uuid4().hex[:8]}",
                            "entrevista_id": entrevista_id,
                            "pergunta_id": pergunta["id"],
                            **resultado,
                            "criado_em": datetime.now().isoformat()
                        }
                        respostas_novas.append(resposta)

                    # Atualizar progresso
                    progresso = int((chamadas_feitas / total_chamadas) * 100)
                    entrevista["progresso"] = progresso
                    entrevista["custo_real"] = custo_total
                    entrevista["tokens_entrada_total"] = tokens_entrada
                    entrevista["tokens_saida_total"] = tokens_saida
                    self._salvar_dados()

                    if callback_progresso:
                        await callback_progresso({
                            "progresso": progresso,
                            "custo_atual": custo_total,
                            "chamadas_feitas": chamadas_feitas,
                            "total_chamadas": total_chamadas
                        })

                    # Delay entre batches
                    if i + batch_size < len(eleitores):
                        await asyncio.sleep(delay_ms / 1000)

            # Salvar todas as respostas
            self._respostas.extend(respostas_novas)
            self._salvar_respostas()

            # Marcar como concluída
            entrevista["status"] = StatusEntrevista.concluida.value
            entrevista["progresso"] = 100
            entrevista["concluido_em"] = datetime.now().isoformat()
            self._salvar_dados()

            return {
                "sucesso": True,
                "total_respostas": len(respostas_novas),
                "custo_total": custo_total,
                "tokens_entrada": tokens_entrada,
                "tokens_saida": tokens_saida,
                "tempo_execucao_segundos": (datetime.now() - inicio_exec).total_seconds()
            }

        except Exception as e:
            entrevista["status"] = StatusEntrevista.erro.value
            entrevista["erro_mensagem"] = str(e)
            self._salvar_dados()

            # Salvar respostas parciais
            if respostas_novas:
                self._respostas.extend(respostas_novas)
                self._salvar_respostas()

            raise

        finally:
            # Limpar estado de execução
            if entrevista_id in self._execucao_ativa:
                del self._execucao_ativa[entrevista_id]

    def pausar_execucao(self, entrevista_id: str) -> bool:
        """Pausa execução"""
        if entrevista_id in self._execucao_ativa:
            self._execucao_ativa[entrevista_id]["pausado"] = True

            entrevista = self.obter_por_id(entrevista_id)
            if entrevista:
                entrevista["status"] = StatusEntrevista.pausada.value
                entrevista["pausado_em"] = datetime.now().isoformat()
                self._salvar_dados()

            return True
        return False

    def retomar_execucao(self, entrevista_id: str) -> bool:
        """Retoma execução pausada"""
        if entrevista_id in self._execucao_ativa:
            self._execucao_ativa[entrevista_id]["pausado"] = False

            entrevista = self.obter_por_id(entrevista_id)
            if entrevista:
                entrevista["status"] = StatusEntrevista.executando.value
                self._salvar_dados()

            return True
        return False

    def cancelar_execucao(self, entrevista_id: str) -> bool:
        """Cancela execução"""
        if entrevista_id in self._execucao_ativa:
            self._execucao_ativa[entrevista_id]["cancelado"] = True
            return True
        return False

    def obter_progresso(self, entrevista_id: str) -> Optional[Dict]:
        """Obtém progresso da execução"""
        entrevista = self.obter_por_id(entrevista_id)
        if not entrevista:
            return None

        respostas = self.obter_respostas(entrevista_id)

        return {
            "entrevista_id": entrevista_id,
            "status": entrevista["status"],
            "progresso": entrevista.get("progresso", 0),
            "total_eleitores": entrevista["total_eleitores"],
            "eleitores_processados": len(set(r["eleitor_id"] for r in respostas)),
            "perguntas_processadas": len(set(r["pergunta_id"] for r in respostas)),
            "total_perguntas": len(entrevista["perguntas"]),
            "custo_atual": entrevista.get("custo_real", 0),
            "custo_estimado_final": entrevista.get("custo_estimado", 0),
            "tokens_entrada": entrevista.get("tokens_entrada_total", 0),
            "tokens_saida": entrevista.get("tokens_saida_total", 0),
        }

    # ============================================
    # RESPOSTAS
    # ============================================

    def obter_respostas(
        self,
        entrevista_id: str,
        pergunta_id: Optional[str] = None,
        eleitor_id: Optional[str] = None
    ) -> List[Dict]:
        """Obtém respostas de uma entrevista"""
        resultado = [
            r for r in self._respostas
            if r.get("entrevista_id") == entrevista_id
        ]

        if pergunta_id:
            resultado = [r for r in resultado if r.get("pergunta_id") == pergunta_id]

        if eleitor_id:
            resultado = [r for r in resultado if r.get("eleitor_id") == eleitor_id]

        return resultado


# Instância global
_entrevista_servico: Optional[EntrevistaServico] = None


def obter_entrevista_servico() -> EntrevistaServico:
    """Obtém instância singleton do serviço"""
    global _entrevista_servico
    if _entrevista_servico is None:
        _entrevista_servico = EntrevistaServico()
    return _entrevista_servico
