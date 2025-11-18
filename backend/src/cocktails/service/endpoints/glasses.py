from fastapi import APIRouter, Body, Depends, HTTPException

from cocktails.api.glasses import GlassService
from cocktails.core.glasses import Glass
from cocktails.service.deps.glasses import get_glass_service

router = APIRouter(prefix="/glass", tags=["glass"])


@router.get("/{name}", response_model=Glass)
def get_glass(
    *, service: GlassService = Depends(get_glass_service), name: str
) -> Glass:
    try:
        return service.get_glass_by_name(name)
    except Exception as err:
        raise HTTPException(
            status_code=404, detail=f"Glass with name {name} not found"
        ) from err


@router.get("/", response_model=list[Glass])
def get_multi_glass(
    *,
    service: GlassService = Depends(get_glass_service),
    skip: int = 0,
    limit: int = 100,
) -> list[Glass]:
    return service.get_multi_glass(skip=skip, limit=limit)
