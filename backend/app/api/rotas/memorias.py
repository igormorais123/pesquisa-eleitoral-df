"""
Rotas de Memórias

Funcionalidade planejada para fase futura.
"""

from fastapi import APIRouter, HTTPException, status

router = APIRouter()


@router.get("/")
async def listar_memorias():
    """Listar memórias - funcionalidade em desenvolvimento"""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Funcionalidade de memórias será implementada em versão futura",
    )
