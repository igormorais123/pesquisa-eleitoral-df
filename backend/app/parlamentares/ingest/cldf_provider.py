"""
Provider para Dados da CLDF (Câmara Legislativa do DF)

Implementa provider plugável com:
- Provider 1: API/endpoint público (se disponível)
- Provider 2: Importação manual de JSON/CSV

Não trava o projeto por CLDF: entrega com fallback funcional.
"""

import csv
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

# Configurações
DATA_DIR = Path(__file__).parent.parent.parent.parent.parent / "data" / "parlamentares"
CLDF_DIR = DATA_DIR / "cldf"
PHOTOS_DIR = DATA_DIR / "photos" / "cldf"
AGENTES_DIR = Path(__file__).parent.parent.parent.parent.parent / "agentes"

# Criar diretórios se não existirem
CLDF_DIR.mkdir(parents=True, exist_ok=True)
PHOTOS_DIR.mkdir(parents=True, exist_ok=True)


class CLDFProvider:
    """
    Provider plugável para dados da CLDF.

    Suporta múltiplas fontes de dados:
    1. API pública (se disponível)
    2. Arquivo JSON manual
    3. Arquivo CSV manual
    4. Dados legados da pasta agentes/
    """

    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._fonte_ativa: Optional[str] = None

    async def _tentar_api_cldf(self) -> Optional[List[Dict]]:
        """
        Tenta buscar dados de API pública da CLDF.

        Nota: A CLDF pode não ter API pública estruturada.
        Este método é um placeholder para quando/se disponível.
        """
        # URLs possíveis a tentar (verificar disponibilidade)
        urls_possiveis = [
            "https://www.cl.df.gov.br/api/deputados",
            "https://dados.cl.df.gov.br/api/deputados",
            # Adicionar outras URLs conforme descobertas
        ]

        for url in urls_possiveis:
            try:
                async with httpx.AsyncClient(timeout=10) as client:
                    response = await client.get(url)
                    if response.status_code == 200:
                        data = response.json()
                        logger.info(f"API CLDF encontrada: {url}")
                        self._fonte_ativa = url
                        return data if isinstance(data, list) else data.get("dados", [])
            except Exception as e:
                logger.debug(f"API {url} não disponível: {e}")
                continue

        return None

    def _carregar_json_manual(self) -> Optional[List[Dict]]:
        """
        Carrega dados de arquivo JSON manual.

        Procura em: data/parlamentares/cldf/manual_source.json
        """
        arquivo = CLDF_DIR / "manual_source.json"
        if not arquivo.exists():
            return None

        try:
            with open(arquivo, "r", encoding="utf-8") as f:
                data = json.load(f)

            logger.info(f"Dados CLDF carregados de {arquivo}")
            self._fonte_ativa = str(arquivo)

            # Normalizar formato
            if isinstance(data, list):
                return data
            elif isinstance(data, dict) and "dados" in data:
                return data["dados"]
            elif isinstance(data, dict) and "deputados" in data:
                return data["deputados"]

            return None

        except Exception as e:
            logger.error(f"Erro ao carregar JSON manual: {e}")
            return None

    def _carregar_csv_manual(self) -> Optional[List[Dict]]:
        """
        Carrega dados de arquivo CSV manual.

        Procura em: data/parlamentares/cldf/manual_source.csv
        """
        arquivo = CLDF_DIR / "manual_source.csv"
        if not arquivo.exists():
            return None

        try:
            deputados = []
            with open(arquivo, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    deputados.append(row)

            logger.info(f"Dados CLDF carregados de {arquivo}")
            self._fonte_ativa = str(arquivo)
            return deputados

        except Exception as e:
            logger.error(f"Erro ao carregar CSV manual: {e}")
            return None

    def _carregar_dados_legados(self) -> Optional[List[Dict]]:
        """
        Carrega dados legados da pasta agentes/.

        Fallback principal quando não há outras fontes.
        """
        arquivo = AGENTES_DIR / "banco-deputados-distritais-df.json"
        if not arquivo.exists():
            return None

        try:
            with open(arquivo, "r", encoding="utf-8") as f:
                data = json.load(f)

            logger.info(f"Dados CLDF carregados de legado: {arquivo}")
            self._fonte_ativa = str(arquivo)
            return data

        except Exception as e:
            logger.error(f"Erro ao carregar dados legados: {e}")
            return None

    async def obter_deputados_distritais(self) -> List[Dict]:
        """
        Obtém lista de deputados distritais.

        Tenta as seguintes fontes em ordem:
        1. API pública (se disponível)
        2. JSON manual
        3. CSV manual
        4. Dados legados
        """
        # 1. Tentar API
        dados = await self._tentar_api_cldf()
        if dados:
            return dados

        # 2. Tentar JSON manual
        dados = self._carregar_json_manual()
        if dados:
            return dados

        # 3. Tentar CSV manual
        dados = self._carregar_csv_manual()
        if dados:
            return dados

        # 4. Fallback para dados legados
        dados = self._carregar_dados_legados()
        if dados:
            return dados

        logger.warning("Nenhuma fonte de dados CLDF disponível")
        return []

    def normalizar_deputado(self, dados: Dict) -> Dict:
        """
        Normaliza dados de um deputado para formato padrão.

        Mapeia diferentes formatos de entrada para o schema esperado.
        """
        # Se já está no formato esperado (legado)
        if "nome_parlamentar" in dados and "partido" in dados:
            return dados

        # Mapear campos comuns
        mapeamentos = {
            "nome": ["nome", "nome_deputado", "name", "deputado"],
            "nome_parlamentar": ["nome_parlamentar", "nome_urna", "nome_politico"],
            "partido": ["partido", "sigla_partido", "party"],
            "email": ["email", "email_contato", "contato"],
            "telefone": ["telefone", "telefone_gabinete", "phone"],
            "foto": ["foto", "foto_url", "url_foto", "imagem"],
        }

        resultado = {}
        for campo_padrao, alternativas in mapeamentos.items():
            for alt in alternativas:
                if alt in dados and dados[alt]:
                    resultado[campo_padrao] = dados[alt]
                    break

        # Copiar campos não mapeados
        for key, value in dados.items():
            if key not in resultado:
                resultado[key] = value

        return resultado

    async def salvar_snapshot(self, deputados: List[Dict]) -> str:
        """Salva snapshot dos deputados com data"""
        data_hoje = datetime.now().strftime("%Y-%m-%d")
        arquivo = CLDF_DIR / f"{data_hoje}.json"

        snapshot = {
            "data_coleta": datetime.now().isoformat(),
            "fonte": self._fonte_ativa or "desconhecida",
            "total": len(deputados),
            "dados": deputados
        }

        with open(arquivo, "w", encoding="utf-8") as f:
            json.dump(snapshot, f, ensure_ascii=False, indent=2)

        logger.info(f"Snapshot CLDF salvo: {arquivo}")
        return str(arquivo)

    async def carregar_snapshot_mais_recente(self) -> Optional[Dict]:
        """Carrega o snapshot mais recente disponível"""
        arquivos = sorted(CLDF_DIR.glob("*.json"), reverse=True)

        # Excluir arquivo manual da lista
        arquivos = [a for a in arquivos if "manual_source" not in a.name]

        if not arquivos:
            return None

        arquivo_mais_recente = arquivos[0]
        with open(arquivo_mais_recente, "r", encoding="utf-8") as f:
            return json.load(f)

    async def atualizar_dados(self) -> Dict:
        """
        Atualiza dados da CLDF.

        Tenta obter dados das fontes disponíveis e salva snapshot.
        """
        logger.info("Iniciando atualização de dados da CLDF...")

        deputados = await self.obter_deputados_distritais()
        if not deputados:
            return {
                "erro": "Nenhuma fonte de dados CLDF disponível",
                "sugestao": "Coloque um arquivo manual_source.json ou manual_source.csv em data/parlamentares/cldf/"
            }

        # Normalizar dados
        deputados_normalizados = [
            self.normalizar_deputado(d) for d in deputados
        ]

        # Salvar snapshot
        arquivo_snapshot = await self.salvar_snapshot(deputados_normalizados)

        return {
            "sucesso": True,
            "total_deputados": len(deputados_normalizados),
            "fonte": self._fonte_ativa,
            "arquivo_snapshot": arquivo_snapshot,
            "data_atualizacao": datetime.now().isoformat()
        }

    def criar_template_importacao(self) -> str:
        """
        Cria arquivo de template para importação manual.

        Retorna caminho do arquivo criado.
        """
        template = {
            "_instrucoes": "Preencha este arquivo com os dados dos deputados distritais",
            "_campos_obrigatorios": ["id", "nome", "nome_parlamentar", "partido"],
            "_campos_opcionais": [
                "email", "telefone", "foto_url", "comissoes",
                "formacao_academica", "profissao_anterior"
            ],
            "dados": [
                {
                    "id": "cldf-001",
                    "nome": "Nome Civil Completo",
                    "nome_parlamentar": "Nome Parlamentar",
                    "partido": "SIGLA",
                    "genero": "masculino ou feminino",
                    "email": "email@cl.df.gov.br",
                    "telefone": "(61) XXXX-XXXX",
                    "foto_url": "https://...",
                    "comissoes": ["Comissão 1", "Comissão 2"],
                    "formacao_academica": ["Formação 1"],
                    "profissao_anterior": "Profissão"
                }
            ]
        }

        arquivo = CLDF_DIR / "manual_source_TEMPLATE.json"
        with open(arquivo, "w", encoding="utf-8") as f:
            json.dump(template, f, ensure_ascii=False, indent=2)

        logger.info(f"Template criado: {arquivo}")
        return str(arquivo)
