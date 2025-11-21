from fastapi import APIRouter, Body, Depends, HTTPException

from cocktails.api.cocktails import CocktailService
from cocktails.schemas.cocktails import Cocktail
from cocktails.service.deps.cocktails import get_cocktail_service

router = APIRouter(prefix="/cocktail", tags=["cocktail"])


@router.get("/{name}", response_model=Cocktail)
def get_cocktail(
    *, service: CocktailService = Depends(get_cocktail_service), name: str
) -> Cocktail:
    try:
        return service.get_cocktail_by_name(name)
    except Exception as err:
        raise HTTPException(
            status_code=404, detail=f"Cocktail with name {name} not found"
        ) from err


@router.get("/", response_model=list[Cocktail])
def get_multi_cocktail(
    *,
    service: CocktailService = Depends(get_cocktail_service),
    skip: int = 0,
    limit: int = 100,
) -> list[Cocktail]:
    return service.get_multi_cocktail(skip=skip, limit=limit)


@router.post("/random/", response_model=Cocktail)
def get_cocktail(
    *, service: CocktailService = Depends(get_cocktail_service)
) -> Cocktail:
    try:
        return service.get_random_cocktail()
    except Exception as err:
        raise HTTPException(
            status_code=404, detail=f"No random cocktail could be found"
        ) from err


@router.get("/available/", response_model=list[Cocktail])
def get_multi_available_cocktail(
    *,
    service: CocktailService = Depends(get_cocktail_service),
    skip: int = 0,
    limit: int = 100,
) -> list[Cocktail]:
    return service.get_multi_available_cocktail(skip=skip, limit=limit)


@router.post("/")
def create_item(
    *, service: CocktailService = Depends(get_cocktail_service), item: Cocktail
) -> int:
    return service.create_if_not_exist(item)


@router.post("/{cocktail_name}/category/{category_name}")
def add_category(
    *,
    service: CocktailService = Depends(get_cocktail_service),
    cocktail_name: str,
    category_name: str,
) -> int:
    return service.add_category_to_cocktail(cocktail_name, category_name)
