"""
Rotas WhatsApp — Oráculo Eleitoral

Endpoints para webhook do Meta Cloud API e administração de contatos.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import configuracoes
from app.db.session import get_db
from app.esquemas.whatsapp import (
    ContatoWhatsAppCreate,
    ContatoWhatsAppResponse,
    ContatoWhatsAppUpdate,
    MensagemWhatsAppResponse,
    StatusOraculo,
)
from app.modelos.contato_whatsapp import ContatoWhatsApp
from app.modelos.conversa_whatsapp import ConversaWhatsApp
from app.modelos.mensagem_whatsapp import MensagemWhatsApp
from app.servicos.whatsapp_servico import whatsapp_servico

logger = logging.getLogger(__name__)

router = APIRouter()


# =============================================
# Webhook Meta Cloud API
# =============================================


@router.get("/webhook")
async def verificar_webhook(
    request: Request,
):
    """
    Verificação do webhook pelo Meta (GET).
    O Meta envia hub.mode, hub.verify_token e hub.challenge.
    Devemos retornar o challenge se o token for válido.
    """
    params = request.query_params
    mode = params.get("hub.mode", "")
    token = params.get("hub.verify_token", "")
    challenge = params.get("hub.challenge", "")

    resultado = whatsapp_servico.verificar_webhook(mode, token, challenge)

    if resultado is not None:
        return Response(content=resultado, media_type="text/plain")

    raise HTTPException(status_code=403, detail="Token de verificação inválido")


@router.post("/webhook")
async def receber_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Recebe mensagens do webhook Meta (POST).

    Pipeline:
    1. Valida assinatura X-Hub-Signature-256
    2. Parseia payload
    3. Para cada mensagem: identifica contato, salva e envia para Celery
    4. Retorna 200 OK imediatamente (< 200ms para o Meta)
    """
    # Verificar assinatura
    body = await request.body()
    assinatura = request.headers.get("X-Hub-Signature-256", "")

    if not whatsapp_servico.verificar_assinatura(body, assinatura):
        logger.warning("Assinatura do webhook inválida")
        raise HTTPException(status_code=401, detail="Assinatura inválida")

    # Parsear payload
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Payload inválido")

    # Processar entradas
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})

            # Processar mensagens recebidas
            for message in value.get("messages", []):
                telefone = message.get("from", "")
                msg_id = message.get("id", "")
                msg_type = message.get("type", "text")

                # Extrair conteúdo
                conteudo = ""
                media_id = None

                if msg_type == "text":
                    conteudo = message.get("text", {}).get("body", "")
                elif msg_type == "audio":
                    media_id = message.get("audio", {}).get("id")
                elif msg_type == "image":
                    media_id = message.get("image", {}).get("id")
                    conteudo = message.get("image", {}).get("caption", "")
                elif msg_type == "document":
                    media_id = message.get("document", {}).get("id")

                logger.info(
                    f"Mensagem recebida: tel={telefone}, tipo={msg_type}, "
                    f"msg_id={msg_id}"
                )

                # Buscar contato
                contato = await _buscar_contato(db, telefone)

                if not contato:
                    # Contato não cadastrado - ignorar silenciosamente
                    logger.info(f"Contato não cadastrado: {telefone}")
                    continue

                if not contato.ativo:
                    logger.info(f"Contato inativo: {telefone}")
                    continue

                # Marcar como lida
                try:
                    await whatsapp_servico.marcar_como_lida(msg_id)
                except Exception as e:
                    logger.warning(f"Erro ao marcar como lida: {e}")

                # Buscar ou criar conversa
                conversa = await _obter_ou_criar_conversa(db, contato)

                # Salvar mensagem de entrada
                mensagem = MensagemWhatsApp(
                    conversa_id=conversa.id,
                    contato_id=contato.id,
                    direcao="entrada",
                    tipo=msg_type,
                    conteudo=conteudo,
                    media_url=media_id,
                    whatsapp_msg_id=msg_id,
                    status_entrega="entregue",
                )
                db.add(mensagem)
                await db.commit()

                # Enviar para fila Celery (processamento assíncrono)
                try:
                    from app.tarefas.agente_tarefas import processar_mensagem_agente

                    processar_mensagem_agente.delay(
                        telefone=telefone,
                        mensagem=conteudo,
                        tipo_msg=msg_type,
                        media_id=media_id,
                        conversa_id=conversa.id,
                        contato_id=contato.id,
                    )
                except Exception as e:
                    logger.error(f"Erro ao enviar para Celery: {e}")
                    # Resposta fallback
                    try:
                        await whatsapp_servico.enviar_texto(
                            telefone,
                            "Estou processando sua solicitação. Um momento, por favor.",
                        )
                    except Exception:
                        pass

            # Processar status de entrega
            for status in value.get("statuses", []):
                await _atualizar_status_entrega(
                    db,
                    status.get("id", ""),
                    status.get("status", ""),
                )

    # Retornar 200 OK imediatamente
    return {"status": "ok"}


# =============================================
# Status do Sistema
# =============================================


@router.get("/status", response_model=StatusOraculo)
async def status_oraculo(db: AsyncSession = Depends(get_db)):
    """Retorna status do sistema Oráculo Eleitoral"""
    # Contatos ativos
    result = await db.execute(
        select(func.count(ContatoWhatsApp.id)).where(ContatoWhatsApp.ativo == True)
    )
    contatos_ativos = result.scalar() or 0

    # Mensagens hoje
    from datetime import date, datetime

    hoje_inicio = datetime.combine(date.today(), datetime.min.time())
    result = await db.execute(
        select(func.count(MensagemWhatsApp.id)).where(
            MensagemWhatsApp.criado_em >= hoje_inicio
        )
    )
    mensagens_hoje = result.scalar() or 0

    # Redis
    redis_ok = False
    try:
        import redis

        r = redis.from_url(configuracoes.REDIS_URL)
        redis_ok = r.ping()
    except Exception:
        pass

    return StatusOraculo(
        status="online",
        whatsapp_configurado=whatsapp_servico.configurado,
        redis_conectado=redis_ok,
        agentes_ativos=8,
        contatos_ativos=contatos_ativos,
        mensagens_hoje=mensagens_hoje,
    )


# =============================================
# Admin - Gestão de Contatos
# =============================================


@router.get("/contatos", response_model=list[ContatoWhatsAppResponse])
async def listar_contatos(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    tipo: Optional[str] = None,
    ativo: Optional[bool] = None,
):
    """Lista contatos WhatsApp cadastrados"""
    query = select(ContatoWhatsApp).offset(skip).limit(limit)

    if tipo:
        query = query.where(ContatoWhatsApp.tipo == tipo)
    if ativo is not None:
        query = query.where(ContatoWhatsApp.ativo == ativo)

    query = query.order_by(ContatoWhatsApp.criado_em.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/contatos", response_model=ContatoWhatsAppResponse, status_code=201)
async def cadastrar_contato(
    dados: ContatoWhatsAppCreate,
    db: AsyncSession = Depends(get_db),
):
    """Cadastra novo contato WhatsApp"""
    # Verificar duplicata
    existente = await db.execute(
        select(ContatoWhatsApp).where(ContatoWhatsApp.telefone == dados.telefone)
    )
    if existente.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Telefone já cadastrado")

    # Criar contato
    pin_hash = None
    if dados.pin:
        from passlib.context import CryptContext

        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        pin_hash = pwd_context.hash(dados.pin)

    contato = ContatoWhatsApp(
        telefone=dados.telefone,
        nome=dados.nome,
        tipo=dados.tipo,
        plano=dados.plano,
        pin_hash=pin_hash,
        metadata_extra=dados.metadata_extra or {},
    )
    db.add(contato)
    await db.commit()
    await db.refresh(contato)

    logger.info(f"Contato cadastrado: {dados.telefone} ({dados.tipo}/{dados.plano})")
    return contato


@router.put("/contatos/{contato_id}", response_model=ContatoWhatsAppResponse)
async def atualizar_contato(
    contato_id: int,
    dados: ContatoWhatsAppUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Atualiza contato WhatsApp"""
    result = await db.execute(
        select(ContatoWhatsApp).where(ContatoWhatsApp.id == contato_id)
    )
    contato = result.scalar_one_or_none()
    if not contato:
        raise HTTPException(status_code=404, detail="Contato não encontrado")

    update_data = dados.model_dump(exclude_unset=True)

    if "pin" in update_data:
        pin = update_data.pop("pin")
        if pin:
            from passlib.context import CryptContext

            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            contato.pin_hash = pwd_context.hash(pin)

    for campo, valor in update_data.items():
        setattr(contato, campo, valor)

    await db.commit()
    await db.refresh(contato)
    return contato


@router.delete("/contatos/{contato_id}", status_code=204)
async def remover_contato(
    contato_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Remove contato WhatsApp"""
    result = await db.execute(
        select(ContatoWhatsApp).where(ContatoWhatsApp.id == contato_id)
    )
    contato = result.scalar_one_or_none()
    if not contato:
        raise HTTPException(status_code=404, detail="Contato não encontrado")

    await db.delete(contato)
    await db.commit()


# =============================================
# Admin - Visualização de Conversas
# =============================================


@router.get("/conversas/{contato_id}/mensagens", response_model=list[MensagemWhatsAppResponse])
async def listar_mensagens_contato(
    contato_id: int,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
):
    """Lista mensagens de um contato"""
    result = await db.execute(
        select(MensagemWhatsApp)
        .where(MensagemWhatsApp.contato_id == contato_id)
        .order_by(MensagemWhatsApp.criado_em.desc())
        .limit(limit)
    )
    return result.scalars().all()


# =============================================
# Funções auxiliares
# =============================================


async def _buscar_contato(
    db: AsyncSession, telefone: str
) -> Optional[ContatoWhatsApp]:
    """Busca contato por telefone (formato flexível)"""
    # Normalizar telefone
    tel_limpo = telefone.strip().replace("+", "")
    variantes = [telefone, f"+{tel_limpo}", tel_limpo]

    for tel in variantes:
        result = await db.execute(
            select(ContatoWhatsApp).where(ContatoWhatsApp.telefone == tel)
        )
        contato = result.scalar_one_or_none()
        if contato:
            return contato
    return None


async def _obter_ou_criar_conversa(
    db: AsyncSession, contato: ContatoWhatsApp
) -> ConversaWhatsApp:
    """Obtém conversa ativa ou cria nova"""
    import uuid

    result = await db.execute(
        select(ConversaWhatsApp)
        .where(
            ConversaWhatsApp.contato_id == contato.id,
            ConversaWhatsApp.status == "ativa",
        )
        .order_by(ConversaWhatsApp.criado_em.desc())
    )
    conversa = result.scalar_one_or_none()

    if conversa:
        return conversa

    # Criar nova conversa
    conversa = ConversaWhatsApp(
        contato_id=contato.id,
        thread_id=str(uuid.uuid4()),
        status="ativa",
    )
    db.add(conversa)
    await db.commit()
    await db.refresh(conversa)

    logger.info(f"Nova conversa criada: contato={contato.telefone}, thread={conversa.thread_id}")
    return conversa


async def _atualizar_status_entrega(
    db: AsyncSession, whatsapp_msg_id: str, status: str
):
    """Atualiza status de entrega de uma mensagem"""
    if not whatsapp_msg_id:
        return

    result = await db.execute(
        select(MensagemWhatsApp).where(
            MensagemWhatsApp.whatsapp_msg_id == whatsapp_msg_id
        )
    )
    mensagem = result.scalar_one_or_none()
    if mensagem:
        mensagem.status_entrega = status
        await db.commit()
