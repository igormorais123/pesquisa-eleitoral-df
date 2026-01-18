"""
Serviço de Eleitores

Lógica de negócio para gestão de eleitores/agentes sintéticos.
"""

import csv
import json
import io
import math
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

from app.esquemas.eleitor import (
    EleitorCreate,
    EleitorUpdate,
    FiltrosEleitor,
    UploadResult,
)


class EleitorServico:
    """Serviço para gerenciamento de eleitores"""

    def __init__(self, caminho_dados: Optional[str] = None):
        """
        Inicializa o serviço.

        Args:
            caminho_dados: Caminho para o arquivo JSON de eleitores
        """
        if caminho_dados is None:
            # Caminho padrão relativo ao projeto
            base_path = Path(__file__).parent.parent.parent.parent
            self.caminho_dados = base_path / "agentes" / "banco-eleitores-df.json"
        else:
            self.caminho_dados = Path(caminho_dados)
        self._eleitores: List[Dict[str, Any]] = []

        # Performance: índice para O(1) lookups por ID
        self._index_por_id: Dict[str, Dict[str, Any]] = {}

        # Performance: cache para opções de filtros
        self._cache_opcoes_filtros: Optional[Dict[str, List[str]]] = None

        # Performance: track do maior ID para geração rápida
        self._max_id_num: int = 0

        self._carregar_dados()

    def _carregar_dados(self):
        """Carrega eleitores do arquivo JSON"""
        if self.caminho_dados.exists():
            with open(self.caminho_dados, "r", encoding="utf-8") as f:
                self._eleitores = json.load(f)
            print(f"Carregados {len(self._eleitores)} eleitores de {self.caminho_dados}")
        else:
            print(f"Arquivo não encontrado: {self.caminho_dados}")
            self._eleitores = []
        self._reconstruir_indices()

    def _reconstruir_indices(self):
        """Reconstrói índices após mudança nos dados (O(n) uma única vez)"""
        self._index_por_id.clear()
        self._max_id_num = 0

        for e in self._eleitores:
            eleitor_id = e.get("id", "")
            if eleitor_id:
                self._index_por_id[eleitor_id] = e
                # Atualiza max ID se aplicável
                if eleitor_id.startswith("df-"):
                    try:
                        num = int(eleitor_id.split("-")[1])
                        self._max_id_num = max(self._max_id_num, num)
                    except (ValueError, IndexError):
                        pass

        # Invalida cache de opções
        self._cache_opcoes_filtros = None

    def _salvar_dados(self):
        """Salva eleitores no arquivo JSON"""
        self.caminho_dados.parent.mkdir(parents=True, exist_ok=True)
        with open(self.caminho_dados, "w", encoding="utf-8") as f:
            json.dump(self._eleitores, f, ensure_ascii=False, indent=2)
        # Invalida cache após salvar (dados podem ter mudado)
        self._cache_opcoes_filtros = None

    def _gerar_id(self) -> str:
        """Gera um novo ID único para eleitor (O(1) com índice)"""
        self._max_id_num += 1
        return f"df-{self._max_id_num:04d}"

    def _aplicar_filtros(self, eleitores: List[Dict], filtros: FiltrosEleitor) -> List[Dict]:
        """
        Aplica filtros a uma lista de eleitores.
        Otimizado: single-pass O(n) ao invés de múltiplas iterações.
        """
        # Pré-processa filtros para lookup O(1)
        generos_set: Optional[Set[str]] = set(filtros.generos) if filtros.generos else None
        cores_set: Optional[Set[str]] = set(filtros.cores_racas) if filtros.cores_racas else None
        regioes_set: Optional[Set[str]] = (
            set(filtros.regioes_administrativas) if filtros.regioes_administrativas else None
        )
        clusters_set: Optional[Set[str]] = set(filtros.clusters) if filtros.clusters else None
        escolaridades_set: Optional[Set[str]] = (
            set(filtros.escolaridades) if filtros.escolaridades else None
        )
        profissoes_set: Optional[Set[str]] = set(filtros.profissoes) if filtros.profissoes else None
        ocupacoes_set: Optional[Set[str]] = set(filtros.ocupacoes) if filtros.ocupacoes else None
        faixas_renda_set: Optional[Set[str]] = (
            set(filtros.faixas_renda) if filtros.faixas_renda else None
        )
        religioes_set: Optional[Set[str]] = set(filtros.religioes) if filtros.religioes else None
        estados_civis_set: Optional[Set[str]] = (
            set(filtros.estados_civis) if filtros.estados_civis else None
        )
        orientacoes_set: Optional[Set[str]] = (
            set(filtros.orientacoes_politicas) if filtros.orientacoes_politicas else None
        )
        posicoes_set: Optional[Set[str]] = (
            set(filtros.posicoes_bolsonaro) if filtros.posicoes_bolsonaro else None
        )
        interesses_set: Optional[Set[str]] = (
            set(filtros.interesses_politicos) if filtros.interesses_politicos else None
        )
        estilos_set: Optional[Set[str]] = (
            set(filtros.estilos_decisao) if filtros.estilos_decisao else None
        )
        tolerancias_set: Optional[Set[str]] = (
            set(filtros.tolerancias) if filtros.tolerancias else None
        )

        # Pré-processa busca textual (uma vez)
        termo_busca = filtros.busca_texto.lower() if filtros.busca_texto else None

        # Single-pass: testa todos os filtros para cada eleitor
        resultado = []
        for e in eleitores:
            # Filtros demográficos
            if filtros.idade_min is not None and e.get("idade", 0) < filtros.idade_min:
                continue
            if filtros.idade_max is not None and e.get("idade", 0) > filtros.idade_max:
                continue
            if generos_set and e.get("genero") not in generos_set:
                continue
            if cores_set and e.get("cor_raca") not in cores_set:
                continue

            # Filtros geográficos
            if regioes_set and e.get("regiao_administrativa") not in regioes_set:
                continue

            # Filtros socioeconômicos
            if clusters_set and e.get("cluster_socioeconomico") not in clusters_set:
                continue
            if escolaridades_set and e.get("escolaridade") not in escolaridades_set:
                continue
            if profissoes_set and e.get("profissao") not in profissoes_set:
                continue
            if ocupacoes_set and e.get("ocupacao_vinculo") not in ocupacoes_set:
                continue
            if faixas_renda_set and e.get("renda_salarios_minimos") not in faixas_renda_set:
                continue

            # Filtros socioculturais
            if religioes_set and e.get("religiao") not in religioes_set:
                continue
            if estados_civis_set and e.get("estado_civil") not in estados_civis_set:
                continue

            if filtros.tem_filhos is not None:
                tem = e.get("filhos", 0) > 0
                if filtros.tem_filhos != tem:
                    continue

            # Filtros políticos
            if orientacoes_set and e.get("orientacao_politica") not in orientacoes_set:
                continue
            if posicoes_set and e.get("posicao_bolsonaro") not in posicoes_set:
                continue
            if interesses_set and e.get("interesse_politico") not in interesses_set:
                continue

            # Filtros comportamentais
            if estilos_set and e.get("estilo_decisao") not in estilos_set:
                continue
            if tolerancias_set and e.get("tolerancia_nuance") not in tolerancias_set:
                continue
            if filtros.voto_facultativo is not None:
                if e.get("voto_facultativo") != filtros.voto_facultativo:
                    continue
            if filtros.conflito_identitario is not None:
                if e.get("conflito_identitario") != filtros.conflito_identitario:
                    continue

            # Busca textual
            if termo_busca:
                nome = e.get("nome", "").lower()
                profissao = e.get("profissao", "").lower()
                regiao = e.get("regiao_administrativa", "").lower()
                historia = e.get("historia_resumida", "").lower()
                if not (
                    termo_busca in nome
                    or termo_busca in profissao
                    or termo_busca in regiao
                    or termo_busca in historia
                ):
                    continue

            # Passou em todos os filtros
            resultado.append(e)

        return resultado

    def _ordenar(self, eleitores: List[Dict], ordenar_por: str, ordem: str) -> List[Dict]:
        """Ordena lista de eleitores"""
        reverso = ordem.lower() == "desc"

        def get_valor(e: Dict) -> Any:
            valor = e.get(ordenar_por, "")
            if isinstance(valor, str):
                return valor.lower()
            return valor

        return sorted(eleitores, key=get_valor, reverse=reverso)

    def _paginar(self, eleitores: List[Dict], pagina: int, por_pagina: int) -> List[Dict]:
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
        Obtém um eleitor pelo ID (O(1) com índice).

        Args:
            eleitor_id: ID do eleitor

        Returns:
            Dados do eleitor ou None
        """
        return self._index_por_id.get(eleitor_id)

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

        # Verificar ID único (O(1) com índice)
        if eleitor["id"] in self._index_por_id:
            raise ValueError(f"Eleitor com ID {eleitor['id']} já existe")

        self._eleitores.append(eleitor)
        # Atualiza índice
        self._index_por_id[eleitor["id"]] = eleitor
        self._salvar_dados()

        return eleitor

    def atualizar(self, eleitor_id: str, dados: EleitorUpdate) -> Optional[Dict]:
        """
        Atualiza um eleitor existente (O(1) com índice).

        Args:
            eleitor_id: ID do eleitor
            dados: Dados a atualizar

        Returns:
            Eleitor atualizado ou None
        """
        eleitor = self._index_por_id.get(eleitor_id)
        if eleitor:
            # Atualizar apenas campos fornecidos
            atualizacoes = dados.model_dump(exclude_none=True)
            eleitor.update(atualizacoes)
            self._salvar_dados()
            return eleitor
        return None

    def deletar(self, eleitor_id: str) -> bool:
        """
        Remove um eleitor (O(1) para lookup, O(n) para remoção da lista).

        Args:
            eleitor_id: ID do eleitor

        Returns:
            True se removido, False se não encontrado
        """
        if eleitor_id not in self._index_por_id:
            return False

        # Remove do índice
        del self._index_por_id[eleitor_id]

        # Remove da lista (ainda O(n), mas lookup foi O(1))
        for i, e in enumerate(self._eleitores):
            if e.get("id") == eleitor_id:
                del self._eleitores[i]
                break

        self._salvar_dados()
        return True

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
        Otimizado: single-pass com cache.

        Returns:
            Dicionário com opções para cada filtro
        """
        # Retorna cache se disponível
        if self._cache_opcoes_filtros is not None:
            return self._cache_opcoes_filtros

        # Single-pass: coleta todos os valores únicos de uma vez
        campos = {
            "generos": set(),
            "cores_racas": set(),
            "regioes_administrativas": set(),
            "clusters": set(),
            "escolaridades": set(),
            "profissoes": set(),
            "ocupacoes": set(),
            "faixas_renda": set(),
            "religioes": set(),
            "estados_civis": set(),
            "orientacoes_politicas": set(),
            "posicoes_bolsonaro": set(),
            "interesses_politicos": set(),
            "estilos_decisao": set(),
            "tolerancias": set(),
        }

        mapeamento = {
            "generos": "genero",
            "cores_racas": "cor_raca",
            "regioes_administrativas": "regiao_administrativa",
            "clusters": "cluster_socioeconomico",
            "escolaridades": "escolaridade",
            "profissoes": "profissao",
            "ocupacoes": "ocupacao_vinculo",
            "faixas_renda": "renda_salarios_minimos",
            "religioes": "religiao",
            "estados_civis": "estado_civil",
            "orientacoes_politicas": "orientacao_politica",
            "posicoes_bolsonaro": "posicao_bolsonaro",
            "interesses_politicos": "interesse_politico",
            "estilos_decisao": "estilo_decisao",
            "tolerancias": "tolerancia_nuance",
        }

        # Uma única iteração sobre todos os eleitores
        for e in self._eleitores:
            for nome_campo, nome_attr in mapeamento.items():
                valor = e.get(nome_attr, "")
                if valor:
                    campos[nome_campo].add(valor)

        # Converte para listas ordenadas e cacheia
        self._cache_opcoes_filtros = {k: sorted(v) for k, v in campos.items()}
        return self._cache_opcoes_filtros

    def importar_json(self, dados_json: List[Dict]) -> UploadResult:
        """
        Importa eleitores de uma lista JSON.
        Otimizado: usa índice O(1) para verificação de duplicatas.

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

                eleitor_id = eleitor_data["id"]

                # Verificar se já existe (O(1) com índice)
                if eleitor_id in self._index_por_id:
                    erros.append(f"Linha {i+1}: ID {eleitor_id} já existe")
                    continue

                # Validar dados mínimos
                if not eleitor_data.get("nome"):
                    erros.append(f"Linha {i+1}: Nome é obrigatório")
                    continue

                # Adiciona na lista e no índice
                self._eleitores.append(eleitor_data)
                self._index_por_id[eleitor_id] = eleitor_data
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
        return [e.get("id", "") for e in eleitores if e.get("id")]

    def obter_por_ids(self, ids: List[str]) -> List[Dict]:
        """
        Obtém eleitores por lista de IDs (O(k) onde k é o número de IDs).

        Args:
            ids: Lista de IDs

        Returns:
            Lista de eleitores
        """
        resultado = []
        for eleitor_id in ids:
            eleitor = self._index_por_id.get(eleitor_id)
            if eleitor:
                resultado.append(eleitor)
        return resultado

    def exportar_csv(self, filtros: FiltrosEleitor) -> str:
        """
        Exporta eleitores filtrados para CSV.

        Args:
            filtros: Filtros aplicados (ordenação respeitada)

        Returns:
            Conteúdo CSV em string
        """
        eleitores = self._aplicar_filtros(self._eleitores, filtros)
        eleitores = self._ordenar(eleitores, filtros.ordenar_por, filtros.ordem)

        colunas = [
            "id",
            "nome",
            "idade",
            "genero",
            "cor_raca",
            "regiao_administrativa",
            "local_referencia",
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
            "tolerancia_nuance",
            "estilo_decisao",
            "valores",
            "preocupacoes",
            "vieses_cognitivos",
            "medos",
            "fontes_informacao",
            "susceptibilidade_desinformacao",
            "meio_transporte",
            "tempo_deslocamento_trabalho",
            "voto_facultativo",
            "conflito_identitario",
            "historia_resumida",
            "instrucao_comportamental",
        ]

        def normalizar(valor: Any) -> str:
            if valor is None:
                return ""
            if isinstance(valor, (list, dict)):
                return json.dumps(valor, ensure_ascii=False)
            return str(valor)

        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(colunas)
        for eleitor in eleitores:
            writer.writerow([normalizar(eleitor.get(c)) for c in colunas])

        return buffer.getvalue()


# Instância global do serviço
_servico_eleitores: Optional[EleitorServico] = None


def obter_servico_eleitores() -> EleitorServico:
    """Obtém instância singleton do serviço de eleitores"""
    global _servico_eleitores
    if _servico_eleitores is None:
        _servico_eleitores = EleitorServico()
    return _servico_eleitores
