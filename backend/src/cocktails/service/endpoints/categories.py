from fastapi import APIRouter, Depends, HTTPException

from cocktails.api.categories import CategoryService
from cocktails.schemas.cocktails import Category
from cocktails.service.deps.categories import get_category_service

router = APIRouter(prefix="/category", tags=["category"])


@router.get("/{name}", response_model=Category)
def get_category(
    *, service: CategoryService = Depends(get_category_service), name: str
) -> Category:
    try:
        return service.get_category_by_name(name)
    except Exception as err:
        raise HTTPException(
            status_code=404, detail=f"Category with name {name} not found"
        ) from err


@router.get("/", response_model=list[Category])
def get_multi_category(
    *,
    service: CategoryService = Depends(get_category_service),
    skip: int = 0,
    limit: int = 100,
) -> list[Category]:
    return service.get_multi_category(skip=skip, limit=limit)


@router.post("/")
def create_item(
    *, service: CategoryService = Depends(get_category_service), item: Category
) -> int:
    return service.create_if_not_exist(item)
