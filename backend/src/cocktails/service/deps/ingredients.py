from fastapi import Depends

from cocktails.api.ingredients import IngredientService
from cocktails.db.model.cocktails import Category as CategoryModel
from cocktails.db.model.cocktails import Cocktail as CocktailModel
from cocktails.db.model.cocktails import Ingredient as IngredientModel
from cocktails.db.model.cocktails import \
    MeasuredIngredient as MeasuredIngredientModel
from cocktails.db.model.cocktails import Recipe as RecipeModel
from cocktails.db.repositories.base import ModelFactory, RepositorySession
from cocktails.db.repositories.ingredients import (IngredientRepositoryAdapter,
                                                   SQLIngredientRepository)
from cocktails.schemas.cocktails import Category as CategorySchema
from cocktails.schemas.cocktails import Cocktail as CocktailSchema
from cocktails.schemas.cocktails import Ingredient as IngredientSchema
from cocktails.schemas.cocktails import \
    MeasuredIngredient as MeasuredIngredientSchema
from cocktails.schemas.cocktails import Recipe as RecipeSchema
from cocktails.service.deps.base import get_repo_session


def get_ingredient_service(
    repo_session: RepositorySession = Depends(get_repo_session),
):
    mapping = {
        CocktailSchema: CocktailModel,
        CategorySchema: CategoryModel,
        RecipeSchema: RecipeModel,
        IngredientSchema: IngredientModel,
        MeasuredIngredientSchema: MeasuredIngredientModel,
    }
    return IngredientService(
        repo_session,
        IngredientRepositoryAdapter(
            SQLIngredientRepository(
                ModelFactory[IngredientModel, IngredientSchema](mapping)
            ),
        ),
    )
