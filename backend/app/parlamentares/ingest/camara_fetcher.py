"""
Fetcher para API de Dados Abertos da Câmara dos Deputados

Implementa:
- Busca de deputados em exercício
- Cache local com TTL
- Snapshots por data para reprodutibilidade
- Retry com backoff exponencial
- Download e cache de fotos
"""

import asyncio
import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

# Configurações
CAMARA_API_BASE = "https://dadosabertos.camara.leg.br/api/v2"
DATA_DIR = Path(__file__).parent.parent.parent.parent.parent / "data" / "parlamentares"
PHOTOS_DIR = DATA_DIR / "photos" / "camara"
SNAPSHOTS_DIR = DATA_DIR / "camara"

# Criar diretórios se não existirem
PHOTOS_DIR.mkdir(parents=True, exist_ok=True)
SNAPSHOTS_DIR.mkdir(parents=True, exist_ok=True)


class CamaraFetcher:
    """
    Fetcher para dados da Câmara dos Deputados.

    Usa API de Dados Abertos: https://dadosabertos.camara.leg.br/
    Swagger: https://dadosabertos.camara.leg.br/swagger/api.html
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
                response = await client.get(url, params=params)
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

    async def buscar_deputados_df(self) -> List[Dict]:
        """
        Busca deputados federais do DF em exercício.

        Retorna lista de deputados com campos básicos.
        """
        url = f"{CAMARA_API_BASE}/deputados"
        params = {
            "siglaUf": "DF",
            "ordem": "ASC",
            "ordenarPor": "nome"
        }

        data = await self._request_with_retry(url, params)
        if not data:
            return []

        deputados = data.get("dados", [])
        logger.info(f"Encontrados {len(deputados)} deputados do DF")

        return deputados

    async def buscar_detalhes_deputado(self, id_deputado: int) -> Optional[Dict]:
        """
        Busca detalhes completos de um deputado.

        Inclui dados pessoais, gabinete, redes sociais, etc.
        """
        cache_key = f"deputado_{id_deputado}"

        # Verificar cache
        if cache_key in self._cache:
            cache_time = self._cache_ttl.get(cache_key)
            if cache_time and (datetime.now() - cache_time).total_seconds() < 3600:  # 1 hora
                return self._cache[cache_key]

        url = f"{CAMARA_API_BASE}/deputados/{id_deputado}"
        data = await self._request_with_retry(url)

        if data:
            resultado = data.get("dados", {})
            self._cache[cache_key] = resultado
            self._cache_ttl[cache_key] = datetime.now()
            return resultado

        return None

    async def buscar_despesas_deputado(
        self,
        id_deputado: int,
        ano: Optional[int] = None,
        mes: Optional[int] = None
    ) -> List[Dict]:
        """Busca despesas de gabinete de um deputado"""
        url = f"{CAMARA_API_BASE}/deputados/{id_deputado}/despesas"
        params = {}
        if ano:
            params["ano"] = ano
        if mes:
            params["mes"] = mes

        data = await self._request_with_retry(url, params)
        return data.get("dados", []) if data else []

    async def buscar_votacoes(
        self,
        data_inicio: Optional[str] = None,
        data_fim: Optional[str] = None
    ) -> List[Dict]:
        """Busca votações no período especificado"""
        url = f"{CAMARA_API_BASE}/votacoes"
        params = {"ordem": "DESC", "ordenarPor": "dataHoraRegistro"}

        if data_inicio:
            params["dataInicio"] = data_inicio
        if data_fim:
            params["dataFim"] = data_fim

        data = await self._request_with_retry(url, params)
        return data.get("dados", []) if data else []

    async def buscar_votos_votacao(self, id_votacao: str) -> List[Dict]:
        """Busca votos individuais de uma votação"""
        url = f"{CAMARA_API_BASE}/votacoes/{id_votacao}/votos"
        data = await self._request_with_retry(url)
        return data.get("dados", []) if data else []

    async def baixar_foto_deputado(
        self,
        id_deputado: int,
        url_foto: str,
        forcar: bool = False
    ) -> Optional[str]:
        """
        Baixa e cacheia foto do deputado.

        Retorna caminho local da foto.
        """
        # Verificar se já existe
        extensao = url_foto.split(".")[-1] if "." in url_foto else "jpg"
        arquivo = PHOTOS_DIR / f"{id_deputado}.{extensao}"

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
            logger.error(f"Erro ao baixar foto de {id_deputado}: {e}")
            return None

    async def salvar_snapshot(self, deputados: List[Dict]) -> str:
        """
        Salva snapshot dos deputados com data.

        Formato: YYYY-MM-DD.json
        """
        data_hoje = datetime.now().strftime("%Y-%m-%d")
        arquivo = SNAPSHOTS_DIR / f"{data_hoje}.json"

        snapshot = {
            "data_coleta": datetime.now().isoformat(),
            "fonte": "https://dadosabertos.camara.leg.br/api/v2/deputados",
            "total": len(deputados),
            "dados": deputados
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
        Atualiza todos os dados da Câmara.

        1. Busca lista de deputados do DF
        2. Para cada um, busca detalhes
        3. Opcionalmente baixa fotos
        4. Salva snapshot
        """
        logger.info("Iniciando atualização de dados da Câmara...")

        # Buscar lista
        deputados_lista = await self.buscar_deputados_df()
        if not deputados_lista:
            return {"erro": "Não foi possível buscar deputados"}

        # Buscar detalhes de cada um
        deputados_completos = []
        for dep in deputados_lista:
            detalhes = await self.buscar_detalhes_deputado(dep["id"])
            if detalhes:
                deputados_completos.append(detalhes)

                # Baixar foto
                if incluir_fotos and detalhes.get("urlFoto"):
                    await self.baixar_foto_deputado(dep["id"], detalhes["urlFoto"])

            # Pequena pausa para não sobrecarregar API
            await asyncio.sleep(0.5)

        # Salvar snapshot
        arquivo_snapshot = await self.salvar_snapshot(deputados_completos)

        return {
            "sucesso": True,
            "total_deputados": len(deputados_completos),
            "arquivo_snapshot": arquivo_snapshot,
            "data_atualizacao": datetime.now().isoformat()
        }
