"""
Rotas de Memórias

Placeholder - será implementado na Fase 2.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def listar_memorias():
    """Listar memórias - placeholder"""
    return {"mensagem": "Endpoint será implementado na Fase 2"}
