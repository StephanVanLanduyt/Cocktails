from fastapi import APIRouter, Body, Depends, HTTPException

from cocktails.api.units import UnitService
from cocktails.core.units import Unit
from cocktails.service.deps.units import get_unit_service

router = APIRouter(prefix="/unit", tags=["unit"])


@router.get("/{name}", response_model=Unit)
def get_unit(*, service: UnitService = Depends(get_unit_service), name: str) -> Unit:
    try:
        return service.get_unit_by_name(name)
    except Exception as err:
        raise HTTPException(
            status_code=404, detail=f"Unit with name {name} not found"
        ) from err


@router.get("/", response_model=list[Unit])
def get_multi_unit(
    *,
    service: UnitService = Depends(get_unit_service),
    skip: int = 0,
    limit: int = 100,
) -> list[Unit]:
    return service.get_multi_unit(skip=skip, limit=limit)
