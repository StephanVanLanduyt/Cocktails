from fastapi import APIRouter, Body, Depends, HTTPException

from cocktails.api.tags import TagService
from cocktails.core.tags import Tag
from cocktails.service.deps.tags import get_tag_service

router = APIRouter(prefix="/tag", tags=["tag"])


@router.get("/{name}", response_model=Tag)
def get_tag(*, service: TagService = Depends(get_tag_service), name: str) -> Tag:
    try:
        return service.get_tag_by_name(name)
    except Exception as err:
        raise HTTPException(
            status_code=404, detail=f"Tag with name {name} not found"
        ) from err


@router.get("/", response_model=list[Tag])
def get_multi_tag(
    *,
    service: TagService = Depends(get_tag_service),
    skip: int = 0,
    limit: int = 100,
) -> list[Tag]:
    return service.get_multi_tag(skip=skip, limit=limit)
