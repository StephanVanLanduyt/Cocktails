from fastapi import APIRouter

from cocktails.service.endpoints.categories import router as category_router
from cocktails.service.endpoints.cocktails import router as cocktail_router
from cocktails.service.endpoints.garnishes import router as garnish_router
from cocktails.service.endpoints.glasses import router as glasses_router
from cocktails.service.endpoints.ingredients import router as ingredient_router
from cocktails.service.endpoints.units import router as unit_router

router = APIRouter(prefix="/menu")

router.include_router(cocktail_router)
router.include_router(ingredient_router)
router.include_router(unit_router)
router.include_router(garnish_router)
router.include_router(glasses_router)
router.include_router(category_router)
