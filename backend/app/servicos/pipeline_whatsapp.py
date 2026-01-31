"""
Pipeline completo de processamento de mensagens WhatsApp.

Orquestra todo o fluxo desde o recebimento de uma mensagem até
o envio da resposta, incluindo transcrição de áudio, processamento
por agente LangGraph e persistência no banco de dados.
"""

import logging
import time
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.servicos.whatsapp_servico import whatsapp_servico
from app.servicos.audio_servico import transcrever_audio
from app.db.session import get_db_context

# Importação condicional do supervisor (será criado posteriormente)
try:
    from app.agentes.supervisor import processar_mensagem_supervisor
except ImportError:
    processar_mensagem_supervisor = None

# Importação condicional dos modelos (podem ainda não existir)
try:
    from app.modelos.contato import Contato
    from app.modelos.mensagem import Mensagem
    from app.modelos.metrica import MetricaMensagem
except ImportError:
    Contato = None
    Mensagem = None
    MetricaMensagem = None

logger = logging.getLogger(__name__)


class PipelineWhatsApp:
    """
    Pipeline de processamento de mensagens WhatsApp.

    Gerencia o fluxo completo de uma mensagem recebida:
    1. Identificação do contato no banco de dados
    2. Transcrição de áudio (se aplicável)
    3. Download de imagens (se aplicável)
    4. Processamento pelo agente supervisor LangGraph
    5. Envio da resposta via WhatsApp
    6. Persistência da mensagem e métricas no banco de dados
    """

    def __init__(self):
        """Inicializa o pipeline com configurações padrão."""
        self._servico_whatsapp = whatsapp_servico
        logger.info("PipelineWhatsApp inicializado.")

    async def processar_mensagem(self, dados_mensagem: dict[str, Any]) -> dict[str, Any]:
        """
        Processa uma mensagem recebida do WhatsApp por completo.

        Executa todo o pipeline: identificação, processamento e resposta.

        Args:
            dados_mensagem: Dicionário com dados da mensagem recebida.
                Campos esperados:
                - telefone: Número do remetente
                - tipo: Tipo da mensagem (texto, audio, imagem)
                - conteudo: Conteúdo textual (se tipo=texto)
                - midia_id: ID da mídia no WhatsApp (se tipo=audio ou imagem)
                - mensagem_id: ID da mensagem no WhatsApp
                - nome_contato: Nome do contato (se disponível)
                - timestamp: Timestamp da mensagem

        Returns:
            Dicionário com resultado do processamento:
                - sucesso: bool indicando se o processamento foi bem-sucedido
                - resposta: Texto da resposta enviada
                - tempo_resposta_ms: Tempo de processamento em milissegundos
                - tokens_utilizados: Total de tokens consumidos
                - custo_estimado: Custo estimado em USD
                - erro: Mensagem de erro (se aplicável)
        """
        inicio = time.monotonic()
        resultado = {
            "sucesso": False,
            "resposta": None,
            "tempo_resposta_ms": 0,
            "tokens_utilizados": 0,
            "custo_estimado": 0.0,
            "erro": None,
        }

        telefone = dados_mensagem.get("telefone", "")
        tipo_mensagem = dados_mensagem.get("tipo", "texto")
        mensagem_id_whatsapp = dados_mensagem.get("mensagem_id", "")

        logger.info(
            "Processando mensagem. Telefone: %s, Tipo: %s, ID: %s",
            telefone,
            tipo_mensagem,
            mensagem_id_whatsapp,
        )

        try:
            async with get_db_context() as db:
                # Etapa 1: Identificar contato
                contato = await self._identificar_contato(
                    db=db,
                    telefone=telefone,
                    nome=dados_mensagem.get("nome_contato", ""),
                )

                # Etapa 2: Extrair texto da mensagem (transcrever áudio se necessário)
                texto_mensagem = await self._extrair_texto_mensagem(
                    dados_mensagem=dados_mensagem,
                    tipo_mensagem=tipo_mensagem,
                )

                # Etapa 3: Preparar imagem (se aplicável)
                imagem_bytes = None
                if tipo_mensagem == "imagem":
                    imagem_bytes = await self._baixar_imagem(dados_mensagem)

                # Etapa 4: Processar pelo agente supervisor
                resultado_agente = await self._processar_com_agente(
                    texto=texto_mensagem,
                    telefone=telefone,
                    contato=contato,
                    imagem_bytes=imagem_bytes,
                )

                texto_resposta = resultado_agente.get("resposta", "")
                resultado["tokens_utilizados"] = resultado_agente.get("tokens_utilizados", 0)
                resultado["custo_estimado"] = resultado_agente.get("custo_estimado", 0.0)

                # Etapa 5: Enviar resposta via WhatsApp
                if texto_resposta:
                    envio_ok = await self._enviar_resposta(
                        telefone=telefone,
                        texto=texto_resposta,
                    )
                    if not envio_ok:
                        logger.warning("Falha ao enviar resposta para %s", telefone)

                # Calcular tempo de resposta
                tempo_resposta_ms = int((time.monotonic() - inicio) * 1000)
                resultado["tempo_resposta_ms"] = tempo_resposta_ms
                resultado["resposta"] = texto_resposta
                resultado["sucesso"] = True

                # Etapa 6: Salvar no banco de dados
                await self._salvar_no_banco(
                    db=db,
                    contato=contato,
                    dados_mensagem=dados_mensagem,
                    texto_mensagem=texto_mensagem,
                    texto_resposta=texto_resposta,
                    tempo_resposta_ms=tempo_resposta_ms,
                    tokens_utilizados=resultado["tokens_utilizados"],
                    custo_estimado=resultado["custo_estimado"],
                )

                logger.info(
                    "Mensagem processada com sucesso. "
                    "Telefone: %s, Tempo: %dms, Tokens: %d, Custo: $%.4f",
                    telefone,
                    tempo_resposta_ms,
                    resultado["tokens_utilizados"],
                    resultado["custo_estimado"],
                )

        except Exception as e:
            tempo_resposta_ms = int((time.monotonic() - inicio) * 1000)
            resultado["tempo_resposta_ms"] = tempo_resposta_ms
            resultado["erro"] = str(e)
            logger.error(
                "Erro no pipeline de processamento. Telefone: %s, Erro: %s",
                telefone,
                str(e),
                exc_info=True,
            )

        return resultado

    async def _identificar_contato(
        self,
        db: AsyncSession,
        telefone: str,
        nome: str = "",
    ) -> Any | None:
        """
        Identifica ou cria o contato no banco de dados.

        Busca pelo número de telefone. Se não encontrar, cria um novo registro.

        Args:
            db: Sessão do banco de dados.
            telefone: Número de telefone do contato.
            nome: Nome do contato (opcional).

        Returns:
            Objeto Contato do banco de dados, ou None se os modelos
            não estiverem disponíveis.
        """
        if Contato is None:
            logger.warning("Modelo Contato não disponível. Pulando identificação de contato.")
            return None

        try:
            query = select(Contato).where(Contato.telefone == telefone)
            resultado = await db.execute(query)
            contato = resultado.scalar_one_or_none()

            if contato is None:
                # Criar novo contato
                contato = Contato(
                    telefone=telefone,
                    nome=nome or "Desconhecido",
                    criado_em=datetime.now(timezone.utc),
                )
                db.add(contato)
                await db.flush()
                logger.info("Novo contato criado. Telefone: %s, Nome: %s", telefone, nome)
            else:
                # Atualizar nome se fornecido e diferente
                if nome and contato.nome != nome:
                    contato.nome = nome
                    await db.flush()
                logger.debug("Contato existente encontrado. Telefone: %s", telefone)

            return contato

        except Exception as e:
            logger.error("Erro ao identificar contato %s: %s", telefone, str(e))
            return None

    async def _extrair_texto_mensagem(
        self,
        dados_mensagem: dict[str, Any],
        tipo_mensagem: str,
    ) -> str:
        """
        Extrai o texto da mensagem, transcrevendo áudio se necessário.

        Args:
            dados_mensagem: Dados completos da mensagem.
            tipo_mensagem: Tipo da mensagem (texto, audio, imagem).

        Returns:
            Texto extraído ou transcrito da mensagem.
        """
        if tipo_mensagem == "texto":
            return dados_mensagem.get("conteudo", "")

        if tipo_mensagem == "audio":
            return await self._transcrever_audio_mensagem(dados_mensagem)

        if tipo_mensagem == "imagem":
            # Para imagens, usar legenda se disponível
            legenda = dados_mensagem.get("conteudo", "")
            return legenda or "[Imagem recebida sem legenda]"

        logger.warning("Tipo de mensagem não suportado: %s", tipo_mensagem)
        return f"[Mensagem do tipo '{tipo_mensagem}' não suportada]"

    async def _transcrever_audio_mensagem(self, dados_mensagem: dict[str, Any]) -> str:
        """
        Baixa e transcreve o áudio de uma mensagem.

        Args:
            dados_mensagem: Dados da mensagem contendo midia_id.

        Returns:
            Texto transcrito do áudio, ou mensagem de erro.
        """
        midia_id = dados_mensagem.get("midia_id")
        if not midia_id:
            logger.error("Mensagem de áudio sem midia_id.")
            return "[Erro: áudio sem identificador de mídia]"

        try:
            # Baixar áudio do WhatsApp
            audio_bytes = await self._servico_whatsapp.baixar_midia(midia_id)
            if not audio_bytes:
                logger.error("Falha ao baixar áudio. Mídia ID: %s", midia_id)
                return "[Erro: não foi possível baixar o áudio]"

            # Transcrever usando Whisper
            texto = await transcrever_audio(audio_bytes, idioma="pt")
            logger.info(
                "Áudio transcrito com sucesso. Mídia ID: %s, Caracteres: %d",
                midia_id,
                len(texto),
            )
            return texto

        except Exception as e:
            logger.error("Erro ao transcrever áudio. Mídia ID: %s, Erro: %s", midia_id, str(e))
            return "[Erro: falha na transcrição do áudio]"

    async def _baixar_imagem(self, dados_mensagem: dict[str, Any]) -> bytes | None:
        """
        Baixa a imagem de uma mensagem para análise.

        Args:
            dados_mensagem: Dados da mensagem contendo midia_id.

        Returns:
            Bytes da imagem, ou None se o download falhar.
        """
        midia_id = dados_mensagem.get("midia_id")
        if not midia_id:
            logger.error("Mensagem de imagem sem midia_id.")
            return None

        try:
            imagem_bytes = await self._servico_whatsapp.baixar_midia(midia_id)
            if imagem_bytes:
                logger.info(
                    "Imagem baixada com sucesso. Mídia ID: %s, Tamanho: %d bytes",
                    midia_id,
                    len(imagem_bytes),
                )
            return imagem_bytes

        except Exception as e:
            logger.error("Erro ao baixar imagem. Mídia ID: %s, Erro: %s", midia_id, str(e))
            return None

    async def _processar_com_agente(
        self,
        texto: str,
        telefone: str,
        contato: Any | None = None,
        imagem_bytes: bytes | None = None,
    ) -> dict[str, Any]:
        """
        Processa a mensagem através do agente supervisor LangGraph.

        Args:
            texto: Texto da mensagem a ser processada.
            telefone: Número de telefone do remetente.
            contato: Objeto de contato do banco de dados (opcional).
            imagem_bytes: Bytes da imagem anexada (opcional).

        Returns:
            Dicionário com resposta, tokens utilizados e custo estimado.
        """
        resultado_padrao = {
            "resposta": "",
            "tokens_utilizados": 0,
            "custo_estimado": 0.0,
        }

        if processar_mensagem_supervisor is None:
            logger.warning(
                "Supervisor LangGraph não disponível. "
                "Retornando resposta padrão."
            )
            resultado_padrao["resposta"] = (
                "Obrigado por sua mensagem! Nosso sistema está sendo configurado "
                "e em breve poderemos atendê-lo completamente."
            )
            return resultado_padrao

        try:
            # Montar contexto para o supervisor
            contexto = {
                "mensagem": texto,
                "telefone": telefone,
                "contato_id": getattr(contato, "id", None),
                "contato_nome": getattr(contato, "nome", "Desconhecido"),
                "imagem": imagem_bytes,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

            resultado_supervisor = await processar_mensagem_supervisor(contexto)

            return {
                "resposta": resultado_supervisor.get("resposta", ""),
                "tokens_utilizados": resultado_supervisor.get("tokens_utilizados", 0),
                "custo_estimado": resultado_supervisor.get("custo_estimado", 0.0),
            }

        except Exception as e:
            logger.error("Erro no processamento pelo agente supervisor: %s", str(e))
            resultado_padrao["resposta"] = (
                "Desculpe, tivemos um problema ao processar sua mensagem. "
                "Por favor, tente novamente em alguns instantes."
            )
            return resultado_padrao

    async def _enviar_resposta(self, telefone: str, texto: str) -> bool:
        """
        Envia a resposta de texto via WhatsApp.

        Args:
            telefone: Número de telefone do destinatário.
            texto: Texto da resposta a ser enviada.

        Returns:
            True se o envio foi bem-sucedido, False caso contrário.
        """
        try:
            resultado = await self._servico_whatsapp.enviar_mensagem_texto(
                telefone=telefone,
                mensagem=texto,
            )
            return resultado is not None

        except Exception as e:
            logger.error("Erro ao enviar resposta para %s: %s", telefone, str(e))
            return False

    async def _salvar_no_banco(
        self,
        db: AsyncSession,
        contato: Any | None,
        dados_mensagem: dict[str, Any],
        texto_mensagem: str,
        texto_resposta: str,
        tempo_resposta_ms: int,
        tokens_utilizados: int,
        custo_estimado: float,
    ) -> None:
        """
        Persiste a mensagem e as métricas no banco de dados.

        Salva tanto a mensagem recebida quanto a resposta enviada,
        além das métricas de performance e custo.

        Args:
            db: Sessão do banco de dados.
            contato: Objeto de contato (pode ser None).
            dados_mensagem: Dados originais da mensagem recebida.
            texto_mensagem: Texto extraído/transcrito da mensagem.
            texto_resposta: Texto da resposta enviada.
            tempo_resposta_ms: Tempo de processamento em milissegundos.
            tokens_utilizados: Total de tokens consumidos.
            custo_estimado: Custo estimado em USD.
        """
        try:
            contato_id = getattr(contato, "id", None)

            # Salvar mensagem recebida
            if Mensagem is not None:
                mensagem_recebida = Mensagem(
                    contato_id=contato_id,
                    direcao="recebida",
                    tipo=dados_mensagem.get("tipo", "texto"),
                    conteudo=texto_mensagem,
                    mensagem_id_whatsapp=dados_mensagem.get("mensagem_id", ""),
                    timestamp=datetime.now(timezone.utc),
                )
                db.add(mensagem_recebida)

                # Salvar resposta enviada
                if texto_resposta:
                    mensagem_enviada = Mensagem(
                        contato_id=contato_id,
                        direcao="enviada",
                        tipo="texto",
                        conteudo=texto_resposta,
                        timestamp=datetime.now(timezone.utc),
                    )
                    db.add(mensagem_enviada)

            # Salvar métricas
            if MetricaMensagem is not None:
                metrica = MetricaMensagem(
                    contato_id=contato_id,
                    mensagem_id_whatsapp=dados_mensagem.get("mensagem_id", ""),
                    tempo_resposta_ms=tempo_resposta_ms,
                    tokens_utilizados=tokens_utilizados,
                    custo_estimado=custo_estimado,
                    tipo_mensagem=dados_mensagem.get("tipo", "texto"),
                    timestamp=datetime.now(timezone.utc),
                )
                db.add(metrica)

            await db.commit()
            logger.debug(
                "Mensagem e métricas salvas no banco. "
                "Contato ID: %s, Tempo: %dms",
                contato_id,
                tempo_resposta_ms,
            )

        except Exception as e:
            logger.error("Erro ao salvar no banco de dados: %s", str(e))
            try:
                await db.rollback()
            except Exception:
                pass


# Instância singleton do pipeline
pipeline_whatsapp = PipelineWhatsApp()
