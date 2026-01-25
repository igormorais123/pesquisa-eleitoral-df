"""
Fetcher para API de Dados Abertos do Senado Federal

Implementa:
- Busca de senadores em exercício
- Cache local com TTL
- Snapshots por data para reprodutibilidade
- Retry com backoff exponencial
- Download e cache de fotos
"""

import asyncio
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

# Configurações
SENADO_API_BASE = "https://legis.senado.leg.br/dadosabertos"
DATA_DIR = Path(__file__).parent.parent.parent.parent.parent / "data" / "parlamentares"
PHOTOS_DIR = DATA_DIR / "photos" / "senado"
SNAPSHOTS_DIR = DATA_DIR / "senado"

# Criar diretórios se não existirem
PHOTOS_DIR.mkdir(parents=True, exist_ok=True)
SNAPSHOTS_DIR.mkdir(parents=True, exist_ok=True)


class SenadoFetcher:
    """
    Fetcher para dados do Senado Federal.

    Usa API de Dados Abertos: https://legis.senado.leg.br/dadosabertos/
    Swagger: https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html
    """

    def __init__(self, timeout: int = 30, max_retries: int = 3):
        self.timeout = timeout
        self.max_retries = max_retries
        self._cache: Dict[str, Any] = {}
        self._cache_ttl: Dict[str, datetime] = {}

    async def _request_with_retry(
        self,
        url: str,
        params: Optional[Dict] = None,
        retry_count: int = 0
    ) -> Optional[Dict]:
        """Faz requisição com retry e backoff exponencial"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {"Accept": "application/json"}
                response = await client.get(url, params=params, headers=headers)
                response.raise_for_status()
                return response.json()

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error {e.response.status_code} para {url}")
            if retry_count < self.max_retries and e.response.status_code >= 500:
                wait_time = 2 ** retry_count
                logger.info(f"Aguardando {wait_time}s antes de retry...")
                await asyncio.sleep(wait_time)
                return await self._request_with_retry(url, params, retry_count + 1)
            return None

        except httpx.RequestError as e:
            logger.error(f"Request error para {url}: {e}")
            if retry_count < self.max_retries:
                wait_time = 2 ** retry_count
                logger.info(f"Aguardando {wait_time}s antes de retry...")
                await asyncio.sleep(wait_time)
                return await self._request_with_retry(url, params, retry_count + 1)
            return None

    async def buscar_senadores_em_exercicio(self) -> List[Dict]:
        """
        Busca senadores em exercício.

        Retorna todos os senadores atualmente em mandato.
        """
        url = f"{SENADO_API_BASE}/senador/lista/atual"
        data = await self._request_with_retry(url)

        if not data:
            return []

        # Extrair lista de senadores
        try:
            senadores = data.get("ListaParlamentarEmExercicio", {}).get(
                "Parlamentares", {}
            ).get("Parlamentar", [])

            # Garantir que é uma lista
            if isinstance(senadores, dict):
                senadores = [senadores]

            logger.info(f"Encontrados {len(senadores)} senadores em exercício")
            return senadores

        except Exception as e:
            logger.error(f"Erro ao processar resposta: {e}")
            return []

    async def buscar_senadores_df(self) -> List[Dict]:
        """Busca senadores do DF especificamente"""
        todos_senadores = await self.buscar_senadores_em_exercicio()

        senadores_df = [
            s for s in todos_senadores
            if s.get("IdentificacaoParlamentar", {}).get("UfParlamentar") == "DF"
        ]

        logger.info(f"Encontrados {len(senadores_df)} senadores do DF")
        return senadores_df

    async def buscar_detalhes_senador(self, codigo: int) -> Optional[Dict]:
        """
        Busca detalhes completos de um senador.

        Inclui dados pessoais, mandatos, comissões, etc.
        """
        cache_key = f"senador_{codigo}"

        # Verificar cache
        if cache_key in self._cache:
            cache_time = self._cache_ttl.get(cache_key)
            if cache_time and (datetime.now() - cache_time).total_seconds() < 3600:  # 1 hora
                return self._cache[cache_key]

        url = f"{SENADO_API_BASE}/senador/{codigo}"
        data = await self._request_with_retry(url)

        if data:
            resultado = data.get("DetalheParlamentar", {}).get("Parlamentar", {})
            self._cache[cache_key] = resultado
            self._cache_ttl[cache_key] = datetime.now()
            return resultado

        return None

    async def buscar_votacoes_senador(
        self,
        codigo: int,
        ano: Optional[int] = None
    ) -> List[Dict]:
        """Busca votações de um senador"""
        url = f"{SENADO_API_BASE}/senador/{codigo}/votacoes"
        params = {}
        if ano:
            params["ano"] = ano

        data = await self._request_with_retry(url, params)

        if not data:
            return []

        try:
            votacoes = data.get("VotacaoParlamentar", {}).get(
                "Parlamentar", {}
            ).get("Votacoes", {}).get("Votacao", [])

            if isinstance(votacoes, dict):
                votacoes = [votacoes]

            return votacoes

        except Exception as e:
            logger.error(f"Erro ao processar votações: {e}")
            return []

    async def buscar_comissoes(self) -> List[Dict]:
        """Busca comissões do Senado"""
        url = f"{SENADO_API_BASE}/comissao/lista/legislatura/atual"
        data = await self._request_with_retry(url)

        if not data:
            return []

        try:
            comissoes = data.get("ListaComissoes", {}).get(
                "Comissoes", {}
            ).get("Comissao", [])

            if isinstance(comissoes, dict):
                comissoes = [comissoes]

            return comissoes

        except Exception as e:
            logger.error(f"Erro ao processar comissões: {e}")
            return []

    async def buscar_materias_tramitando(
        self,
        sigla: Optional[str] = None,
        ano: Optional[int] = None
    ) -> List[Dict]:
        """Busca matérias (projetos) em tramitação"""
        url = f"{SENADO_API_BASE}/materia/pesquisa/lista"
        params = {"tramitando": "S"}

        if sigla:
            params["sigla"] = sigla
        if ano:
            params["ano"] = ano

        data = await self._request_with_retry(url, params)

        if not data:
            return []

        try:
            materias = data.get("PesquisaBasicaMateria", {}).get(
                "Materias", {}
            ).get("Materia", [])

            if isinstance(materias, dict):
                materias = [materias]

            return materias

        except Exception as e:
            logger.error(f"Erro ao processar matérias: {e}")
            return []

    async def baixar_foto_senador(
        self,
        codigo: int,
        url_foto: str,
        forcar: bool = False
    ) -> Optional[str]:
        """
        Baixa e cacheia foto do senador.

        Retorna caminho local da foto.
        """
        # Verificar se já existe
        extensao = url_foto.split(".")[-1] if "." in url_foto else "jpg"
        arquivo = PHOTOS_DIR / f"{codigo}.{extensao}"

        if arquivo.exists() and not forcar:
            return str(arquivo)

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(url_foto)
                response.raise_for_status()

                with open(arquivo, "wb") as f:
                    f.write(response.content)

                logger.info(f"Foto baixada: {arquivo}")
                return str(arquivo)

        except Exception as e:
            logger.error(f"Erro ao baixar foto de {codigo}: {e}")
            return None

    async def salvar_snapshot(self, senadores: List[Dict]) -> str:
        """
        Salva snapshot dos senadores com data.

        Formato: YYYY-MM-DD.json
        """
        data_hoje = datetime.now().strftime("%Y-%m-%d")
        arquivo = SNAPSHOTS_DIR / f"{data_hoje}.json"

        snapshot = {
            "data_coleta": datetime.now().isoformat(),
            "fonte": "https://legis.senado.leg.br/dadosabertos/senador/lista/atual",
            "total": len(senadores),
            "dados": senadores
        }

        with open(arquivo, "w", encoding="utf-8") as f:
            json.dump(snapshot, f, ensure_ascii=False, indent=2)

        logger.info(f"Snapshot salvo: {arquivo}")
        return str(arquivo)

    async def carregar_snapshot_mais_recente(self) -> Optional[Dict]:
        """Carrega o snapshot mais recente disponível"""
        arquivos = sorted(SNAPSHOTS_DIR.glob("*.json"), reverse=True)

        if not arquivos:
            return None

        arquivo_mais_recente = arquivos[0]
        with open(arquivo_mais_recente, "r", encoding="utf-8") as f:
            return json.load(f)

    async def atualizar_dados(self, incluir_fotos: bool = True) -> Dict:
        """
        Atualiza todos os dados do Senado.

        1. Busca lista de senadores do DF
        2. Para cada um, busca detalhes
        3. Opcionalmente baixa fotos
        4. Salva snapshot
        """
        logger.info("Iniciando atualização de dados do Senado...")

        # Buscar lista (apenas DF)
        senadores_lista = await self.buscar_senadores_df()
        if not senadores_lista:
            return {"erro": "Não foi possível buscar senadores do DF"}

        # Buscar detalhes de cada um
        senadores_completos = []
        for sen in senadores_lista:
            id_parlamentar = sen.get("IdentificacaoParlamentar", {})
            codigo = id_parlamentar.get("CodigoParlamentar")

            if codigo:
                detalhes = await self.buscar_detalhes_senador(int(codigo))
                if detalhes:
                    senadores_completos.append(detalhes)

                    # Baixar foto
                    if incluir_fotos:
                        url_foto = id_parlamentar.get("UrlFotoParlamentar")
                        if url_foto:
                            await self.baixar_foto_senador(int(codigo), url_foto)

                # Pequena pausa para não sobrecarregar API
                await asyncio.sleep(0.5)

        # Salvar snapshot
        arquivo_snapshot = await self.salvar_snapshot(senadores_completos)

        return {
            "sucesso": True,
            "total_senadores": len(senadores_completos),
            "arquivo_snapshot": arquivo_snapshot,
            "data_atualizacao": datetime.now().isoformat()
        }
