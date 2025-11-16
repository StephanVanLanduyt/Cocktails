from fastapi import Depends

from cocktails.api.categories import CategoryService
from cocktails.db.model.cocktails import Category as CategoryModel
from cocktails.db.model.cocktails import Cocktail as CocktailModel
from cocktails.db.model.cocktails import Ingredient as IngredientModel
from cocktails.db.model.cocktails import \
    MeasuredIngredient as MeasuredIngredientModel
from cocktails.db.model.cocktails import Recipe as RecipeModel
from cocktails.db.repositories.base import RepositorySession
from cocktails.db.repositories.categories import (CategoryModelFactory,
                                                  CategoryRepositoryAdapter,
                                                  SQLCategoryRepository)
from cocktails.schemas.cocktails import Category as CategorySchema
from cocktails.schemas.cocktails import Cocktail as CocktailSchema
from cocktails.schemas.cocktails import Ingredient as IngredientSchema
from cocktails.schemas.cocktails import \
    MeasuredIngredient as MeasuredIngredientSchema
from cocktails.schemas.cocktails import Recipe as RecipeSchema
from cocktails.service.deps.base import get_repo_session


def get_category_service(
    repo_session: RepositorySession = Depends(get_repo_session),
):
    mapping = {
        CocktailSchema: CocktailModel,
        CategorySchema: CategoryModel,
        RecipeSchema: RecipeModel,
        IngredientSchema: IngredientModel,
        MeasuredIngredientSchema: MeasuredIngredientModel,
    }
    return CategoryService(
        repo_session,
        CategoryRepositoryAdapter(
            SQLCategoryRepository(CategoryModelFactory(mapping)),
        ),
    )
