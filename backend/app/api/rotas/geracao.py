"""
Rotas de Geração de Eleitores

Funcionalidade planejada para fase futura.
"""

from fastapi import APIRouter, HTTPException, status

router = APIRouter()


@router.post("/")
async def gerar_eleitores():
    """Gerar eleitores via IA - funcionalidade em desenvolvimento"""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Funcionalidade de geração de eleitores será implementada em versão futura",
    )
