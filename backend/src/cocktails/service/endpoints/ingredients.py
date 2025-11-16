from fastapi import APIRouter, Body, Depends, HTTPException

from cocktails.api.ingredients import IngredientService
from cocktails.core.ingredients import Ingredient as IngredientName
from cocktails.schemas.cocktails import Ingredient
from cocktails.service.deps.ingredients import get_ingredient_service

router = APIRouter(prefix="/ingredient", tags=["ingredient"])


@router.get("/{name}", response_model=Ingredient)
def get_ingredient(
    *, service: IngredientService = Depends(get_ingredient_service), name: str
) -> Ingredient:
    try:
        return service.get_ingredient_by_name(name)
    except Exception as err:
        raise HTTPException(
            status_code=404, detail=f"Ingredient with name {name} not found"
        ) from err


@router.get("/", response_model=list[IngredientName])
def get_multi_ingredient(
    *,
    service: IngredientService = Depends(get_ingredient_service),
    skip: int = 0,
    limit: int = 100,
) -> list[IngredientName]:
    return service.get_multi_ingredient(skip=skip, limit=limit)


@router.put("/{name}")
def set_ingredient_availability(
    *,
    service: IngredientService = Depends(get_ingredient_service),
    name: str,
    is_available: bool = Body(embed=True),
) -> None:
    return service.set_availability(name, is_available)


@router.post("/{name}")
def create_item(
    *, service: IngredientService = Depends(get_ingredient_service), name: str
) -> int:
    return service.create_if_not_exist(Ingredient(name=name))
