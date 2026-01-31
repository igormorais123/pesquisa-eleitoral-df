"""
Esquemas Pydantic para WhatsApp (Oráculo Eleitoral)

Validação de payloads do Meta Cloud API e schemas de resposta.
"""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# =============================================
# Schemas de Contato
# =============================================

class ContatoWhatsAppBase(BaseModel):
    telefone: str = Field(..., min_length=10, max_length=20, examples=["+5561999999999"])
    nome: str = Field(..., min_length=2, max_length=200)
    tipo: str = Field(default="cliente", pattern=r"^(cliente|cabo_eleitoral|candidato)$")
    plano: str = Field(default="consultor", pattern=r"^(consultor|estrategista|war_room)$")

    @field_validator("telefone")
    @classmethod
    def validar_telefone(cls, v: str) -> str:
        """Garante formato E.164"""
        v = v.strip()
        if not v.startswith("+"):
            v = f"+55{v}"
        digits = "".join(c for c in v if c.isdigit())
        if len(digits) < 10 or len(digits) > 15:
            raise ValueError("Telefone deve ter entre 10 e 15 dígitos")
        return v


class ContatoWhatsAppCreate(ContatoWhatsAppBase):
    pin: Optional[str] = Field(None, min_length=4, max_length=8)
    metadata_extra: Optional[dict] = None


class ContatoWhatsAppResponse(ContatoWhatsAppBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ativo: bool
    opt_in_em: Optional[datetime] = None
    ultimo_acesso: Optional[datetime] = None
    criado_em: datetime


class ContatoWhatsAppUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=2, max_length=200)
    tipo: Optional[str] = Field(None, pattern=r"^(cliente|cabo_eleitoral|candidato)$")
    plano: Optional[str] = Field(None, pattern=r"^(consultor|estrategista|war_room)$")
    ativo: Optional[bool] = None
    pin: Optional[str] = Field(None, min_length=4, max_length=8)
    metadata_extra: Optional[dict] = None


# =============================================
# Schemas de Mensagem
# =============================================

class MensagemWhatsAppResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversa_id: int
    contato_id: int
    direcao: str
    tipo: str
    conteudo: Optional[str] = None
    agente_usado: Optional[str] = None
    status_entrega: str
    tokens_entrada: int = 0
    tokens_saida: int = 0
    custo: float = 0.0
    tempo_resposta_ms: int = 0
    criado_em: datetime


# =============================================
# Schemas do Webhook Meta
# =============================================

class WebhookVerificacao(BaseModel):
    """Payload de verificação GET do Meta"""
    hub_mode: str = Field(alias="hub.mode")
    hub_verify_token: str = Field(alias="hub.verify_token")
    hub_challenge: str = Field(alias="hub.challenge")


class MetaContato(BaseModel):
    """Contato no payload do Meta"""
    profile: dict = Field(default_factory=dict)
    wa_id: str


class MetaMensagemTexto(BaseModel):
    body: str


class MetaMensagemAudio(BaseModel):
    id: str
    mime_type: Optional[str] = None


class MetaMensagemImagem(BaseModel):
    id: str
    mime_type: Optional[str] = None
    caption: Optional[str] = None


class MetaMensagemDocumento(BaseModel):
    id: str
    mime_type: Optional[str] = None
    filename: Optional[str] = None


class MetaMensagem(BaseModel):
    """Mensagem individual no payload do webhook"""
    from_: str = Field(alias="from")
    id: str
    timestamp: str
    type: str
    text: Optional[MetaMensagemTexto] = None
    audio: Optional[MetaMensagemAudio] = None
    image: Optional[MetaMensagemImagem] = None
    document: Optional[MetaMensagemDocumento] = None


class MetaStatusEntrega(BaseModel):
    """Status de entrega no webhook"""
    id: str
    status: str
    timestamp: str
    recipient_id: str


class MetaValorMudanca(BaseModel):
    messaging_product: str = "whatsapp"
    metadata: dict = Field(default_factory=dict)
    contacts: list[MetaContato] = Field(default_factory=list)
    messages: list[MetaMensagem] = Field(default_factory=list)
    statuses: list[MetaStatusEntrega] = Field(default_factory=list)


class MetaMudanca(BaseModel):
    value: MetaValorMudanca
    field: str = "messages"


class MetaEntrada(BaseModel):
    id: str
    changes: list[MetaMudanca]


class WebhookPayload(BaseModel):
    """Payload completo do webhook POST do Meta"""
    object: str = "whatsapp_business_account"
    entry: list[MetaEntrada]


# =============================================
# Schemas de Status
# =============================================

class StatusOraculo(BaseModel):
    """Status do sistema Oráculo Eleitoral"""
    status: str = "online"
    whatsapp_configurado: bool = False
    redis_conectado: bool = False
    agentes_ativos: int = 0
    contatos_ativos: int = 0
    mensagens_hoje: int = 0
