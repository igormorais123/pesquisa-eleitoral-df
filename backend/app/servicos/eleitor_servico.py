"""
Serviço de Eleitores

Lógica de negócio para gestão de eleitores/agentes sintéticos.
"""

import json
import math
import os
import uuid
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.esquemas.eleitor import (
    DistribuicaoItem,
    EleitorCreate,
    EleitorResponse,
    EleitorUpdate,
    EstatisticasEleitores,
    FiltrosEleitor,
    UploadResult,
)


class EleitorServico:
    """Serviço para gerenciamento de eleitores"""

    def __init__(self, caminho_dados: str = None):
        """
        Inicializa o serviço.

        Args:
            caminho_dados: Caminho para o arquivo JSON de eleitores
        """
        if caminho_dados is None:
            # Caminho padrão relativo ao projeto
            base_path = Path(__file__).parent.parent.parent.parent
            caminho_dados = base_path / "agentes" / "banco-eleitores-df.json"

        self.caminho_dados = Path(caminho_dados)
        self._eleitores: List[Dict[str, Any]] = []
        self._carregar_dados()

    def _carregar_dados(self):
        """Carrega eleitores do arquivo JSON"""
        if self.caminho_dados.exists():
            with open(self.caminho_dados, "r", encoding="utf-8") as f:
                self._eleitores = json.load(f)
            print(
                f"Carregados {len(self._eleitores)} eleitores de {self.caminho_dados}"
            )
        else:
            print(f"Arquivo não encontrado: {self.caminho_dados}")
            self._eleitores = []

    def _salvar_dados(self):
        """Salva eleitores no arquivo JSON"""
        self.caminho_dados.parent.mkdir(parents=True, exist_ok=True)
        with open(self.caminho_dados, "w", encoding="utf-8") as f:
            json.dump(self._eleitores, f, ensure_ascii=False, indent=2)

    def _gerar_id(self) -> str:
        """Gera um novo ID único para eleitor"""
        max_num = 0
        for e in self._eleitores:
            if e.get("id", "").startswith("df-"):
                try:
                    num = int(e["id"].split("-")[1])
                    max_num = max(max_num, num)
                except (ValueError, IndexError):
                    pass
        return f"df-{max_num + 1:04d}"

    def _aplicar_filtros(
        self, eleitores: List[Dict], filtros: FiltrosEleitor
    ) -> List[Dict]:
        """Aplica filtros a uma lista de eleitores"""
        resultado = eleitores

        # Filtros demográficos
        if filtros.idade_min is not None:
            resultado = [e for e in resultado if e.get("idade", 0) >= filtros.idade_min]

        if filtros.idade_max is not None:
            resultado = [e for e in resultado if e.get("idade", 0) <= filtros.idade_max]

        if filtros.generos:
            resultado = [e for e in resultado if e.get("genero") in filtros.generos]

        if filtros.cores_racas:
            resultado = [
                e for e in resultado if e.get("cor_raca") in filtros.cores_racas
            ]

        # Filtros geográficos
        if filtros.regioes_administrativas:
            resultado = [
                e
                for e in resultado
                if e.get("regiao_administrativa") in filtros.regioes_administrativas
            ]

        # Filtros socioeconômicos
        if filtros.clusters:
            resultado = [
                e
                for e in resultado
                if e.get("cluster_socioeconomico") in filtros.clusters
            ]

        if filtros.escolaridades:
            resultado = [
                e for e in resultado if e.get("escolaridade") in filtros.escolaridades
            ]

        if filtros.profissoes:
            resultado = [
                e for e in resultado if e.get("profissao") in filtros.profissoes
            ]

        if filtros.ocupacoes:
            resultado = [
                e for e in resultado if e.get("ocupacao_vinculo") in filtros.ocupacoes
            ]

        if filtros.faixas_renda:
            resultado = [
                e
                for e in resultado
                if e.get("renda_salarios_minimos") in filtros.faixas_renda
            ]

        # Filtros socioculturais
        if filtros.religioes:
            resultado = [e for e in resultado if e.get("religiao") in filtros.religioes]

        if filtros.estados_civis:
            resultado = [
                e for e in resultado if e.get("estado_civil") in filtros.estados_civis
            ]

        if filtros.tem_filhos is not None:
            if filtros.tem_filhos:
                resultado = [e for e in resultado if e.get("filhos", 0) > 0]
            else:
                resultado = [e for e in resultado if e.get("filhos", 0) == 0]

        # Filtros políticos
        if filtros.orientacoes_politicas:
            resultado = [
                e
                for e in resultado
                if e.get("orientacao_politica") in filtros.orientacoes_politicas
            ]

        if filtros.posicoes_bolsonaro:
            resultado = [
                e
                for e in resultado
                if e.get("posicao_bolsonaro") in filtros.posicoes_bolsonaro
            ]

        if filtros.interesses_politicos:
            resultado = [
                e
                for e in resultado
                if e.get("interesse_politico") in filtros.interesses_politicos
            ]

        # Filtros comportamentais
        if filtros.estilos_decisao:
            resultado = [
                e
                for e in resultado
                if e.get("estilo_decisao") in filtros.estilos_decisao
            ]

        if filtros.tolerancias:
            resultado = [
                e
                for e in resultado
                if e.get("tolerancia_nuance") in filtros.tolerancias
            ]

        if filtros.voto_facultativo is not None:
            resultado = [
                e
                for e in resultado
                if e.get("voto_facultativo") == filtros.voto_facultativo
            ]

        if filtros.conflito_identitario is not None:
            resultado = [
                e
                for e in resultado
                if e.get("conflito_identitario") == filtros.conflito_identitario
            ]

        # Busca textual
        if filtros.busca_texto:
            termo = filtros.busca_texto.lower()
            resultado = [
                e
                for e in resultado
                if termo in e.get("nome", "").lower()
                or termo in e.get("profissao", "").lower()
                or termo in e.get("regiao_administrativa", "").lower()
                or termo in e.get("historia_resumida", "").lower()
            ]

        return resultado

    def _ordenar(
        self, eleitores: List[Dict], ordenar_por: str, ordem: str
    ) -> List[Dict]:
        """Ordena lista de eleitores"""
        reverso = ordem.lower() == "desc"

        def get_valor(e: Dict) -> Any:
            valor = e.get(ordenar_por, "")
            if isinstance(valor, str):
                return valor.lower()
            return valor

        return sorted(eleitores, key=get_valor, reverse=reverso)

    def _paginar(
        self, eleitores: List[Dict], pagina: int, por_pagina: int
    ) -> List[Dict]:
        """Aplica paginação"""
        inicio = (pagina - 1) * por_pagina
        fim = inicio + por_pagina
        return eleitores[inicio:fim]

    # ============================================
    # MÉTODOS PÚBLICOS
    # ============================================

    def listar(self, filtros: FiltrosEleitor) -> Dict[str, Any]:
        """
        Lista eleitores com filtros, ordenação e paginação.

        Args:
            filtros: Objeto com filtros a aplicar

        Returns:
            Dicionário com eleitores e metadados de paginação
        """
        # Aplicar filtros
        resultado = self._aplicar_filtros(self._eleitores, filtros)

        # Total após filtros
        total = len(resultado)

        # Ordenar
        resultado = self._ordenar(resultado, filtros.ordenar_por, filtros.ordem)

        # Paginar
        total_paginas = math.ceil(total / filtros.por_pagina) if total > 0 else 1
        resultado = self._paginar(resultado, filtros.pagina, filtros.por_pagina)

        # Converter para resposta
        return {
            "eleitores": resultado,
            "total": total,
            "pagina": filtros.pagina,
            "por_pagina": filtros.por_pagina,
            "total_paginas": total_paginas,
            "filtros_aplicados": filtros.model_dump(exclude_none=True),
        }

    def obter_por_id(self, eleitor_id: str) -> Optional[Dict]:
        """
        Obtém um eleitor pelo ID.

        Args:
            eleitor_id: ID do eleitor

        Returns:
            Dados do eleitor ou None
        """
        for e in self._eleitores:
            if e.get("id") == eleitor_id:
                return e
        return None

    def criar(self, dados: EleitorCreate) -> Dict:
        """
        Cria um novo eleitor.

        Args:
            dados: Dados do eleitor

        Returns:
            Eleitor criado
        """
        eleitor = dados.model_dump()

        if not eleitor.get("id"):
            eleitor["id"] = self._gerar_id()

        # Verificar ID único
        if self.obter_por_id(eleitor["id"]):
            raise ValueError(f"Eleitor com ID {eleitor['id']} já existe")

        self._eleitores.append(eleitor)
        self._salvar_dados()

        return eleitor

    def atualizar(self, eleitor_id: str, dados: EleitorUpdate) -> Optional[Dict]:
        """
        Atualiza um eleitor existente.

        Args:
            eleitor_id: ID do eleitor
            dados: Dados a atualizar

        Returns:
            Eleitor atualizado ou None
        """
        for i, e in enumerate(self._eleitores):
            if e.get("id") == eleitor_id:
                # Atualizar apenas campos fornecidos
                atualizacoes = dados.model_dump(exclude_none=True)
                self._eleitores[i].update(atualizacoes)
                self._salvar_dados()
                return self._eleitores[i]
        return None

    def deletar(self, eleitor_id: str) -> bool:
        """
        Remove um eleitor.

        Args:
            eleitor_id: ID do eleitor

        Returns:
            True se removido, False se não encontrado
        """
        for i, e in enumerate(self._eleitores):
            if e.get("id") == eleitor_id:
                del self._eleitores[i]
                self._salvar_dados()
                return True
        return False

    def obter_estatisticas(self, filtros: Optional[FiltrosEleitor] = None) -> Dict:
        """
        Calcula estatísticas dos eleitores.

        Args:
            filtros: Filtros opcionais para calcular estatísticas de subconjunto

        Returns:
            Estatísticas calculadas
        """
        eleitores = self._eleitores
        if filtros:
            eleitores = self._aplicar_filtros(eleitores, filtros)

        total = len(eleitores)
        if total == 0:
            return {"total": 0, "mensagem": "Nenhum eleitor encontrado"}

        def calcular_distribuicao(campo: str) -> List[Dict]:
            """Calcula distribuição de um campo"""
            contagem = Counter(e.get(campo, "N/A") for e in eleitores)
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
                idade = e.get("idade", 0)
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
        idades = [e.get("idade", 0) for e in eleitores]
        filhos = [e.get("filhos", 0) for e in eleitores]

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

    def obter_opcoes_filtros(self) -> Dict[str, List[str]]:
        """
        Obtém valores únicos para cada campo filtrável.

        Returns:
            Dicionário com opções para cada filtro
        """
        return {
            "generos": sorted(set(e.get("genero", "") for e in self._eleitores)),
            "cores_racas": sorted(set(e.get("cor_raca", "") for e in self._eleitores)),
            "regioes_administrativas": sorted(
                set(e.get("regiao_administrativa", "") for e in self._eleitores)
            ),
            "clusters": sorted(
                set(e.get("cluster_socioeconomico", "") for e in self._eleitores)
            ),
            "escolaridades": sorted(
                set(e.get("escolaridade", "") for e in self._eleitores)
            ),
            "profissoes": sorted(set(e.get("profissao", "") for e in self._eleitores)),
            "ocupacoes": sorted(
                set(e.get("ocupacao_vinculo", "") for e in self._eleitores)
            ),
            "faixas_renda": sorted(
                set(e.get("renda_salarios_minimos", "") for e in self._eleitores)
            ),
            "religioes": sorted(set(e.get("religiao", "") for e in self._eleitores)),
            "estados_civis": sorted(
                set(e.get("estado_civil", "") for e in self._eleitores)
            ),
            "orientacoes_politicas": sorted(
                set(e.get("orientacao_politica", "") for e in self._eleitores)
            ),
            "posicoes_bolsonaro": sorted(
                set(e.get("posicao_bolsonaro", "") for e in self._eleitores)
            ),
            "interesses_politicos": sorted(
                set(e.get("interesse_politico", "") for e in self._eleitores)
            ),
            "estilos_decisao": sorted(
                set(e.get("estilo_decisao", "") for e in self._eleitores)
            ),
            "tolerancias": sorted(
                set(e.get("tolerancia_nuance", "") for e in self._eleitores)
            ),
        }

    def importar_json(self, dados_json: List[Dict]) -> UploadResult:
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
                    eleitor_data["id"] = self._gerar_id()

                # Verificar se já existe
                if self.obter_por_id(eleitor_data["id"]):
                    erros.append(f"Linha {i+1}: ID {eleitor_data['id']} já existe")
                    continue

                # Validar dados mínimos
                if not eleitor_data.get("nome"):
                    erros.append(f"Linha {i+1}: Nome é obrigatório")
                    continue

                self._eleitores.append(eleitor_data)
                total_adicionados += 1

            except Exception as e:
                erros.append(f"Linha {i+1}: {str(e)}")

        if total_adicionados > 0:
            self._salvar_dados()

        return UploadResult(
            sucesso=total_adicionados > 0,
            total_processados=total_processados,
            total_adicionados=total_adicionados,
            total_erros=len(erros),
            erros=erros[:20],  # Limitar a 20 erros no retorno
        )

    def obter_ids(self, filtros: Optional[FiltrosEleitor] = None) -> List[str]:
        """
        Obtém apenas os IDs dos eleitores filtrados.

        Args:
            filtros: Filtros opcionais

        Returns:
            Lista de IDs
        """
        eleitores = self._eleitores
        if filtros:
            eleitores = self._aplicar_filtros(eleitores, filtros)
        return [e.get("id") for e in eleitores]

    def obter_por_ids(self, ids: List[str]) -> List[Dict]:
        """
        Obtém eleitores por lista de IDs.

        Args:
            ids: Lista de IDs

        Returns:
            Lista de eleitores
        """
        ids_set = set(ids)
        return [e for e in self._eleitores if e.get("id") in ids_set]


# Instância global do serviço
_servico_eleitores: Optional[EleitorServico] = None


def obter_servico_eleitores() -> EleitorServico:
    """Obtém instância singleton do serviço de eleitores"""
    global _servico_eleitores
    if _servico_eleitores is None:
        _servico_eleitores = EleitorServico()
    return _servico_eleitores
