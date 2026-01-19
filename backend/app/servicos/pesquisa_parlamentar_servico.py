"""
Serviço de Pesquisas com Parlamentares

Lógica de negócio para gestão e execução de pesquisas com parlamentares.
Estende o sistema de entrevistas existente para suportar parlamentares.
"""

import asyncio
import json
import math
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.esquemas.entrevista import StatusEntrevista
from app.servicos.claude_servico import obter_claude_servico
from app.servicos.parlamentar_helper import obter_parlamentares_por_ids


class PesquisaParlamentarServico:
    """Serviço para gerenciamento de pesquisas com parlamentares"""

    def __init__(self, caminho_dados: Optional[str] = None):
        if caminho_dados is None:
            base_path = Path(__file__).parent.parent.parent.parent
            self.caminho_dados = base_path / "memorias" / "pesquisas_parlamentares.json"
        else:
            self.caminho_dados = Path(caminho_dados)
        self.caminho_respostas = self.caminho_dados.parent / "respostas_parlamentares.json"
        self._pesquisas: List[Dict[str, Any]] = []
        self._respostas: List[Dict[str, Any]] = []
        self._carregar_dados()

        # Estado de execução
        self._execucao_ativa: Dict[str, Dict] = {}

    def _carregar_dados(self):
        """Carrega pesquisas do arquivo JSON"""
        if self.caminho_dados.exists():
            with open(self.caminho_dados, "r", encoding="utf-8") as f:
                self._pesquisas = json.load(f)
        else:
            self._pesquisas = []

        if self.caminho_respostas.exists():
            with open(self.caminho_respostas, "r", encoding="utf-8") as f:
                self._respostas = json.load(f)
        else:
            self._respostas = []

    def _salvar_dados(self):
        """Salva pesquisas no arquivo JSON"""
        self.caminho_dados.parent.mkdir(parents=True, exist_ok=True)
        with open(self.caminho_dados, "w", encoding="utf-8") as f:
            json.dump(self._pesquisas, f, ensure_ascii=False, indent=2, default=str)

    def _salvar_respostas(self):
        """Salva respostas no arquivo JSON"""
        self.caminho_respostas.parent.mkdir(parents=True, exist_ok=True)
        with open(self.caminho_respostas, "w", encoding="utf-8") as f:
            json.dump(self._respostas, f, ensure_ascii=False, indent=2, default=str)

    def _gerar_id(self) -> str:
        """Gera ID único"""
        return f"pesq-parl-{uuid.uuid4().hex[:8]}"

    # ============================================
    # CRUD
    # ============================================

    def listar(
        self, pagina: int = 1, por_pagina: int = 20, status: Optional[str] = None
    ) -> Dict[str, Any]:
        """Lista pesquisas com paginação"""
        resultado = self._pesquisas

        if status:
            resultado = [e for e in resultado if e.get("status") == status]

        # Ordenar por data (mais recente primeiro)
        resultado = sorted(resultado, key=lambda x: x.get("criado_em", ""), reverse=True)

        total = len(resultado)
        total_paginas = math.ceil(total / por_pagina) if total > 0 else 1

        inicio = (pagina - 1) * por_pagina
        fim = inicio + por_pagina
        resultado = resultado[inicio:fim]

        return {
            "pesquisas": resultado,
            "total": total,
            "pagina": pagina,
            "por_pagina": por_pagina,
            "total_paginas": total_paginas,
        }

    def obter_por_id(self, pesquisa_id: str) -> Optional[Dict]:
        """Obtém pesquisa por ID"""
        for p in self._pesquisas:
            if p.get("id") == pesquisa_id:
                return p
        return None

    def criar(self, dados: Dict[str, Any]) -> Dict:
        """
        Cria nova pesquisa com parlamentares.

        Args:
            dados: Dicionário com:
                - titulo: str
                - descricao: Optional[str]
                - tipo: str (quantitativa, qualitativa, mista)
                - instrucao_geral: Optional[str]
                - perguntas: List[Dict] com texto, tipo, opcoes, etc.
                - parlamentares_ids: List[str]

        Returns:
            Pesquisa criada
        """
        pesquisa_id = self._gerar_id()

        # Processar perguntas
        perguntas = []
        for i, p in enumerate(dados.get("perguntas", [])):
            perguntas.append({
                "id": f"{pesquisa_id}-p{i+1:02d}",
                "texto": p.get("texto", ""),
                "tipo": p.get("tipo", "aberta"),
                "obrigatoria": p.get("obrigatoria", True),
                "opcoes": p.get("opcoes"),
                "escala_min": p.get("escala_min"),
                "escala_max": p.get("escala_max"),
                "instrucoes_ia": p.get("instrucoes_ia"),
            })

        parlamentares_ids = dados.get("parlamentares_ids", [])

        # Estimar custo
        claude = obter_claude_servico()
        estimativa = claude.estimar_custo(
            total_perguntas=len(perguntas),
            total_eleitores=len(parlamentares_ids)  # Reutiliza mesmo método
        )

        pesquisa = {
            "id": pesquisa_id,
            "titulo": dados.get("titulo", "Pesquisa Parlamentar"),
            "descricao": dados.get("descricao"),
            "tipo": dados.get("tipo", "mista"),
            "tipo_sujeito": "parlamentar",
            "instrucao_geral": dados.get("instrucao_geral"),
            "perguntas": perguntas,
            "parlamentares_ids": parlamentares_ids,
            "total_parlamentares": len(parlamentares_ids),
            "status": StatusEntrevista.rascunho.value,
            "progresso": 0,
            "custo_estimado": estimativa["custo_estimado"],
            "custo_real": 0.0,
            "tokens_entrada_total": 0,
            "tokens_saida_total": 0,
            "criado_em": datetime.now().isoformat(),
            "iniciado_em": None,
            "pausado_em": None,
            "concluido_em": None,
        }

        self._pesquisas.append(pesquisa)
        self._salvar_dados()

        return pesquisa

    def atualizar(self, pesquisa_id: str, dados: Dict[str, Any]) -> Optional[Dict]:
        """Atualiza pesquisa"""
        for i, p in enumerate(self._pesquisas):
            if p.get("id") == pesquisa_id:
                # Atualizar apenas campos permitidos
                campos_permitidos = ["titulo", "descricao", "status", "instrucao_geral"]
                for campo in campos_permitidos:
                    if campo in dados and dados[campo] is not None:
                        self._pesquisas[i][campo] = dados[campo]
                self._salvar_dados()
                return self._pesquisas[i]
        return None

    def deletar(self, pesquisa_id: str) -> bool:
        """Remove pesquisa"""
        for i, p in enumerate(self._pesquisas):
            if p.get("id") == pesquisa_id:
                # Também remover respostas
                self._respostas = [
                    r for r in self._respostas if r.get("pesquisa_id") != pesquisa_id
                ]
                del self._pesquisas[i]
                self._salvar_dados()
                self._salvar_respostas()
                return True
        return False

    # ============================================
    # EXECUÇÃO
    # ============================================

    async def iniciar_execucao(
        self,
        pesquisa_id: str,
        limite_custo: float = 100.0,
        batch_size: int = 5,
        delay_ms: int = 500,
        usar_prompt_simplificado: bool = False,
        callback_progresso=None,
        usuario_id: Optional[int] = None,
        usuario_nome: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Inicia execução de pesquisa com parlamentares.

        Args:
            pesquisa_id: ID da pesquisa
            limite_custo: Limite de custo em reais
            batch_size: Tamanho do batch
            delay_ms: Delay entre batches
            usar_prompt_simplificado: Usar prompt menor
            callback_progresso: Callback para atualizar progresso
            usuario_id: ID do usuário que está executando
            usuario_nome: Nome do usuário

        Returns:
            Resultado da execução
        """
        pesquisa = self.obter_por_id(pesquisa_id)
        if not pesquisa:
            raise ValueError(f"Pesquisa {pesquisa_id} não encontrada")

        if pesquisa["status"] == StatusEntrevista.executando.value:
            raise ValueError("Pesquisa já está em execução")

        # Atualizar status
        pesquisa["status"] = StatusEntrevista.executando.value
        pesquisa["iniciado_em"] = datetime.now().isoformat()
        self._salvar_dados()

        # Inicializar estado de execução
        self._execucao_ativa[pesquisa_id] = {"pausado": False, "cancelado": False}

        # Obter parlamentares e serviços
        claude = obter_claude_servico()

        parlamentares = obter_parlamentares_por_ids(pesquisa["parlamentares_ids"])
        perguntas = pesquisa["perguntas"]

        total_chamadas = len(parlamentares) * len(perguntas)
        chamadas_feitas = 0
        custo_total = 0.0
        tokens_entrada = 0
        tokens_saida = 0
        respostas_novas = []

        inicio_exec = datetime.now()

        try:
            for pergunta in perguntas:
                for i in range(0, len(parlamentares), batch_size):
                    # Verificar se foi pausado/cancelado
                    estado = self._execucao_ativa.get(pesquisa_id, {})
                    if estado.get("cancelado"):
                        raise Exception("Execução cancelada pelo usuário")
                    while estado.get("pausado"):
                        await asyncio.sleep(0.5)
                        estado = self._execucao_ativa.get(pesquisa_id, {})

                    # Verificar limite de custo
                    if custo_total >= limite_custo * 0.8:
                        print(f"⚠️ 80% do limite de custo atingido: R$ {custo_total:.2f}")

                    if custo_total >= limite_custo:
                        raise Exception(f"Limite de custo atingido: R$ {custo_total:.2f}")

                    # Processar batch
                    batch = parlamentares[i : i + batch_size]
                    batch_tasks = []

                    for parlamentar in batch:
                        task = claude.processar_resposta_parlamentar(
                            parlamentar=parlamentar,
                            pergunta=pergunta["texto"],
                            tipo_pergunta=pergunta["tipo"],
                            opcoes=pergunta.get("opcoes"),
                            simplificado=usar_prompt_simplificado,
                        )
                        batch_tasks.append(task)

                    # Executar batch em paralelo
                    resultados = await asyncio.gather(*batch_tasks, return_exceptions=True)

                    for resultado in resultados:
                        if isinstance(resultado, BaseException):
                            print(f"Erro: {resultado}")
                            continue

                        resultado_dict: Dict[str, Any] = resultado
                        chamadas_feitas += 1
                        custo_total += resultado_dict["custo_reais"]
                        tokens_entrada += resultado_dict["tokens_entrada"]
                        tokens_saida += resultado_dict["tokens_saida"]

                        # Salvar resposta
                        resposta = {
                            "id": f"{pesquisa_id}-{uuid.uuid4().hex[:8]}",
                            "pesquisa_id": pesquisa_id,
                            "pergunta_id": pergunta["id"],
                            "parlamentar_id": resultado_dict["eleitor_id"],
                            "parlamentar_nome": resultado_dict["eleitor_nome"],
                            "resposta_texto": resultado_dict["resposta_texto"],
                            "fluxo_cognitivo": resultado_dict["fluxo_cognitivo"],
                            "modelo_usado": resultado_dict["modelo_usado"],
                            "tokens_entrada": resultado_dict["tokens_entrada"],
                            "tokens_saida": resultado_dict["tokens_saida"],
                            "custo_reais": resultado_dict["custo_reais"],
                            "tempo_resposta_ms": resultado_dict["tempo_resposta_ms"],
                            "criado_em": datetime.now().isoformat(),
                        }
                        respostas_novas.append(resposta)

                    # Atualizar progresso
                    progresso = int((chamadas_feitas / total_chamadas) * 100)
                    pesquisa["progresso"] = progresso
                    pesquisa["custo_real"] = custo_total
                    pesquisa["tokens_entrada_total"] = tokens_entrada
                    pesquisa["tokens_saida_total"] = tokens_saida
                    self._salvar_dados()

                    if callback_progresso:
                        await callback_progresso(
                            {
                                "progresso": progresso,
                                "custo_atual": custo_total,
                                "chamadas_feitas": chamadas_feitas,
                                "total_chamadas": total_chamadas,
                            }
                        )

                    # Delay entre batches
                    if i + batch_size < len(parlamentares):
                        await asyncio.sleep(delay_ms / 1000)

            # Salvar todas as respostas
            self._respostas.extend(respostas_novas)
            self._salvar_respostas()

            # Marcar como concluída
            pesquisa["status"] = StatusEntrevista.concluida.value
            pesquisa["progresso"] = 100
            pesquisa["concluido_em"] = datetime.now().isoformat()
            self._salvar_dados()

            return {
                "sucesso": True,
                "total_respostas": len(respostas_novas),
                "custo_total": custo_total,
                "tokens_entrada": tokens_entrada,
                "tokens_saida": tokens_saida,
                "tempo_execucao_segundos": (datetime.now() - inicio_exec).total_seconds(),
            }

        except Exception as e:
            pesquisa["status"] = StatusEntrevista.erro.value
            pesquisa["erro_mensagem"] = str(e)
            self._salvar_dados()

            # Salvar respostas parciais
            if respostas_novas:
                self._respostas.extend(respostas_novas)
                self._salvar_respostas()

            raise

        finally:
            # Limpar estado de execução
            if pesquisa_id in self._execucao_ativa:
                del self._execucao_ativa[pesquisa_id]

    def pausar_execucao(self, pesquisa_id: str) -> bool:
        """Pausa execução"""
        if pesquisa_id in self._execucao_ativa:
            self._execucao_ativa[pesquisa_id]["pausado"] = True

            pesquisa = self.obter_por_id(pesquisa_id)
            if pesquisa:
                pesquisa["status"] = StatusEntrevista.pausada.value
                pesquisa["pausado_em"] = datetime.now().isoformat()
                self._salvar_dados()

            return True
        return False

    def retomar_execucao(self, pesquisa_id: str) -> bool:
        """Retoma execução pausada"""
        if pesquisa_id in self._execucao_ativa:
            self._execucao_ativa[pesquisa_id]["pausado"] = False

            pesquisa = self.obter_por_id(pesquisa_id)
            if pesquisa:
                pesquisa["status"] = StatusEntrevista.executando.value
                self._salvar_dados()

            return True
        return False

    def cancelar_execucao(self, pesquisa_id: str) -> bool:
        """Cancela execução"""
        if pesquisa_id in self._execucao_ativa:
            self._execucao_ativa[pesquisa_id]["cancelado"] = True
            return True
        return False

    def obter_progresso(self, pesquisa_id: str) -> Optional[Dict]:
        """Obtém progresso da execução"""
        pesquisa = self.obter_por_id(pesquisa_id)
        if not pesquisa:
            return None

        respostas = self.obter_respostas(pesquisa_id)

        return {
            "pesquisa_id": pesquisa_id,
            "status": pesquisa["status"],
            "progresso": pesquisa.get("progresso", 0),
            "total_parlamentares": pesquisa["total_parlamentares"],
            "parlamentares_processados": len(set(r["parlamentar_id"] for r in respostas)),
            "perguntas_processadas": len(set(r["pergunta_id"] for r in respostas)),
            "total_perguntas": len(pesquisa["perguntas"]),
            "custo_atual": pesquisa.get("custo_real", 0),
            "custo_estimado_final": pesquisa.get("custo_estimado", 0),
            "tokens_entrada": pesquisa.get("tokens_entrada_total", 0),
            "tokens_saida": pesquisa.get("tokens_saida_total", 0),
        }

    # ============================================
    # RESPOSTAS
    # ============================================

    def obter_respostas(
        self,
        pesquisa_id: str,
        pergunta_id: Optional[str] = None,
        parlamentar_id: Optional[str] = None,
    ) -> List[Dict]:
        """Obtém respostas de uma pesquisa"""
        resultado = [r for r in self._respostas if r.get("pesquisa_id") == pesquisa_id]

        if pergunta_id:
            resultado = [r for r in resultado if r.get("pergunta_id") == pergunta_id]

        if parlamentar_id:
            resultado = [r for r in resultado if r.get("parlamentar_id") == parlamentar_id]

        return resultado

    def obter_respostas_por_parlamentar(self, pesquisa_id: str) -> Dict[str, List[Dict]]:
        """Agrupa respostas por parlamentar"""
        respostas = self.obter_respostas(pesquisa_id)
        por_parlamentar: Dict[str, List[Dict]] = {}

        for r in respostas:
            parl_id = r.get("parlamentar_id", "")
            if parl_id not in por_parlamentar:
                por_parlamentar[parl_id] = []
            por_parlamentar[parl_id].append(r)

        return por_parlamentar

    def obter_respostas_por_pergunta(self, pesquisa_id: str) -> Dict[str, List[Dict]]:
        """Agrupa respostas por pergunta"""
        respostas = self.obter_respostas(pesquisa_id)
        por_pergunta: Dict[str, List[Dict]] = {}

        for r in respostas:
            perg_id = r.get("pergunta_id", "")
            if perg_id not in por_pergunta:
                por_pergunta[perg_id] = []
            por_pergunta[perg_id].append(r)

        return por_pergunta


# Instância global
_pesquisa_parlamentar_servico: Optional[PesquisaParlamentarServico] = None


def obter_pesquisa_parlamentar_servico() -> PesquisaParlamentarServico:
    """Obtém instância singleton do serviço"""
    global _pesquisa_parlamentar_servico
    if _pesquisa_parlamentar_servico is None:
        _pesquisa_parlamentar_servico = PesquisaParlamentarServico()
    return _pesquisa_parlamentar_servico
