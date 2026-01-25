"""
Rotas para Dados de Usuários Google

Endpoints para acessar dados coletados de usuários que logaram via Google.
Útil para criar eleitores digitais sintéticos baseados em dados reais.
"""

import json
import os
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.api.deps import DadosToken, obter_usuario_admin

router = APIRouter()

# Caminho do arquivo de dados
DADOS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "agentes",
    "dados-usuarios-google.json"
)


# ==========================================
# Esquemas de Resposta
# ==========================================

class TelefoneResponse(BaseModel):
    numero: Optional[str] = None
    tipo: Optional[str] = None
    formatado: Optional[str] = None


class EnderecoResponse(BaseModel):
    formatado: Optional[str] = None
    tipo: Optional[str] = None
    rua: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    pais: Optional[str] = None
    cep: Optional[str] = None


class AniversarioResponse(BaseModel):
    dia: Optional[int] = None
    mes: Optional[int] = None
    ano: Optional[int] = None


class OrganizacaoResponse(BaseModel):
    nome: Optional[str] = None
    cargo: Optional[str] = None
    tipo: Optional[str] = None
    departamento: Optional[str] = None
    atual: Optional[bool] = None


class UrlResponse(BaseModel):
    url: Optional[str] = None
    tipo: Optional[str] = None
    descricao: Optional[str] = None


class DadosUsuarioGoogleResponse(BaseModel):
    """Dados completos de um usuário Google"""
    google_id: str
    email: Optional[str] = None
    nome: Optional[str] = None
    avatar_url: Optional[str] = None
    email_verificado: Optional[bool] = None

    # Dados expandidos
    nome_completo: Optional[str] = None
    primeiro_nome: Optional[str] = None
    sobrenome: Optional[str] = None
    nome_fonetico: Optional[str] = None
    emails: Optional[List[str]] = []
    telefones: Optional[List[TelefoneResponse]] = []
    enderecos: Optional[List[EnderecoResponse]] = []
    aniversario: Optional[AniversarioResponse] = None
    idade: Optional[int] = None
    genero: Optional[str] = None
    genero_formatado: Optional[str] = None
    idiomas: Optional[List[str]] = []
    fotos: Optional[List[str]] = []
    ocupacoes: Optional[List[str]] = []
    organizacoes: Optional[List[OrganizacaoResponse]] = []
    faixa_etaria: Optional[str] = None
    biografia: Optional[str] = None
    interesses: Optional[List[str]] = []
    habilidades: Optional[List[str]] = []
    urls: Optional[List[UrlResponse]] = []

    # Metadados
    criado_em: Optional[str] = None
    atualizado_em: Optional[str] = None

    class Config:
        extra = "allow"  # Permite campos extras


class ListaDadosUsuariosResponse(BaseModel):
    """Lista de dados de usuários"""
    usuarios: List[DadosUsuarioGoogleResponse]
    total: int


class EstatisticasDadosResponse(BaseModel):
    """Estatísticas dos dados coletados"""
    total_usuarios: int
    com_telefone: int
    com_endereco: int
    com_aniversario: int
    com_genero: int
    com_ocupacao: int
    com_organizacao: int
    generos: dict
    faixas_etarias: dict
    paises: List[str]
    idiomas: List[str]


# ==========================================
# Funções Auxiliares
# ==========================================

def _carregar_dados() -> List[dict]:
    """Carrega dados do arquivo JSON"""
    if not os.path.exists(DADOS_PATH):
        return []

    with open(DADOS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ==========================================
# Endpoints
# ==========================================

@router.get(
    "/",
    response_model=ListaDadosUsuariosResponse,
    summary="Listar dados de usuários Google",
    description="""
Retorna lista de todos os dados coletados de usuários que logaram via Google.

**Acesso:** Apenas administradores

**Dados coletados incluem:**
- Informações básicas (nome, email, foto)
- Dados demográficos (idade, gênero, aniversário)
- Contatos (telefones, endereços)
- Profissional (ocupações, organizações)
- Interesses e habilidades
    """,
)
async def listar_dados_usuarios(
    admin: DadosToken = Depends(obter_usuario_admin),
    limite: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
):
    """Lista todos os dados de usuários coletados"""
    dados = _carregar_dados()

    total = len(dados)
    usuarios = dados[offset:offset + limite]

    return ListaDadosUsuariosResponse(
        usuarios=usuarios,
        total=total,
    )


@router.get(
    "/estatisticas",
    response_model=EstatisticasDadosResponse,
    summary="Estatísticas dos dados coletados",
    description="Retorna estatísticas agregadas dos dados de usuários Google.",
)
async def estatisticas_dados(
    admin: DadosToken = Depends(obter_usuario_admin),
):
    """Retorna estatísticas dos dados coletados"""
    dados = _carregar_dados()

    # Contadores
    com_telefone = sum(1 for u in dados if u.get("telefones"))
    com_endereco = sum(1 for u in dados if u.get("enderecos"))
    com_aniversario = sum(1 for u in dados if u.get("aniversario"))
    com_genero = sum(1 for u in dados if u.get("genero"))
    com_ocupacao = sum(1 for u in dados if u.get("ocupacoes"))
    com_organizacao = sum(1 for u in dados if u.get("organizacoes"))

    # Gêneros
    generos = {}
    for u in dados:
        g = u.get("genero_formatado") or u.get("genero")
        if g:
            generos[g] = generos.get(g, 0) + 1

    # Faixas etárias
    faixas_etarias = {}
    for u in dados:
        faixa = u.get("faixa_etaria")
        if faixa:
            faixas_etarias[faixa] = faixas_etarias.get(faixa, 0) + 1

    # Países únicos
    paises = set()
    for u in dados:
        for endereco in u.get("enderecos", []):
            if endereco.get("pais"):
                paises.add(endereco["pais"])

    # Idiomas únicos
    idiomas = set()
    for u in dados:
        for idioma in u.get("idiomas", []):
            idiomas.add(idioma)

    return EstatisticasDadosResponse(
        total_usuarios=len(dados),
        com_telefone=com_telefone,
        com_endereco=com_endereco,
        com_aniversario=com_aniversario,
        com_genero=com_genero,
        com_ocupacao=com_ocupacao,
        com_organizacao=com_organizacao,
        generos=generos,
        faixas_etarias=faixas_etarias,
        paises=sorted(list(paises)),
        idiomas=sorted(list(idiomas)),
    )


@router.get(
    "/{google_id}",
    response_model=DadosUsuarioGoogleResponse,
    summary="Dados de um usuário específico",
    description="Retorna dados completos de um usuário pelo Google ID.",
)
async def obter_dados_usuario(
    google_id: str,
    admin: DadosToken = Depends(obter_usuario_admin),
):
    """Obtém dados de um usuário específico"""
    dados = _carregar_dados()

    usuario = next((u for u in dados if u.get("google_id") == google_id), None)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    return usuario


@router.get(
    "/exportar/json",
    summary="Exportar dados em JSON",
    description="Exporta todos os dados coletados em formato JSON.",
)
async def exportar_dados_json(
    admin: DadosToken = Depends(obter_usuario_admin),
    incluir_dados_brutos: bool = Query(default=False, description="Incluir dados brutos da API"),
):
    """Exporta dados em JSON"""
    dados = _carregar_dados()

    if not incluir_dados_brutos:
        # Remover dados brutos para exportação mais limpa
        for u in dados:
            u.pop("dados_brutos_people_api", None)

    return {
        "dados": dados,
        "total": len(dados),
        "exportado_em": __import__("datetime").datetime.now().isoformat(),
    }


@router.delete(
    "/{google_id}",
    summary="Remover dados de um usuário",
    description="Remove dados de um usuário específico (LGPD compliance).",
)
async def remover_dados_usuario(
    google_id: str,
    admin: DadosToken = Depends(obter_usuario_admin),
):
    """Remove dados de um usuário (direito ao esquecimento)"""
    dados = _carregar_dados()

    # Encontrar índice do usuário
    idx = next((i for i, u in enumerate(dados) if u.get("google_id") == google_id), None)

    if idx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado",
        )

    # Remover usuário
    usuario_removido = dados.pop(idx)

    # Salvar arquivo atualizado
    with open(DADOS_PATH, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)

    return {
        "mensagem": f"Dados do usuário {usuario_removido.get('email')} removidos com sucesso",
        "google_id": google_id,
    }
