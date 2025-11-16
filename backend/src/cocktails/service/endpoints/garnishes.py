from fastapi import APIRouter, Body, Depends, HTTPException

from cocktails.api.garnishes import GarnishService
from cocktails.core.garnishes import Garnish
from cocktails.service.deps.garnishes import get_garnish_service

router = APIRouter(prefix="/garnish", tags=["garnish"])


@router.get("/{name}", response_model=Garnish)
def get_garnish(
    *, service: GarnishService = Depends(get_garnish_service), name: str
) -> Garnish:
    try:
        return service.get_garnish_by_name(name)
    except Exception as err:
        raise HTTPException(
            status_code=404, detail=f"Garnish with name {name} not found"
        ) from err


@router.get("/", response_model=list[Garnish])
def get_multi_garnish(
    *,
    service: GarnishService = Depends(get_garnish_service),
    skip: int = 0,
    limit: int = 100,
) -> list[Garnish]:
    return service.get_multi_garnish(skip=skip, limit=limit)
