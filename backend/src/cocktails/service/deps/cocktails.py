from fastapi import Depends

from cocktails.api.cocktails import CocktailService
from cocktails.db.model.cocktails import Category as CategoryModel
from cocktails.db.model.cocktails import Cocktail as CocktailModel
from cocktails.db.model.cocktails import Garnish as GarnishModel
from cocktails.db.model.cocktails import Glass as GlassModel
from cocktails.db.model.cocktails import Ingredient as IngredientModel
from cocktails.db.model.cocktails import Measure as MeasureModel
from cocktails.db.model.cocktails import \
    MeasuredIngredient as MeasuredIngredientModel
from cocktails.db.model.cocktails import Recipe as RecipeModel
from cocktails.db.repositories.base import ModelFactory, RepositorySession
from cocktails.db.repositories.categories import (CategoryModelFactory,
                                                  SQLCategoryRepository)
from cocktails.db.repositories.cocktails import (CocktailModelFactory,
                                                 CocktailRepositoryAdapter,
                                                 SQLCocktailRepository)
from cocktails.db.repositories.garnishes import SQLGarnishRepository
from cocktails.db.repositories.glasses import SQLGlassRepository
from cocktails.db.repositories.ingredients import SQLIngredientRepository
from cocktails.db.repositories.recipes import (RecipeModelFactory,
                                               SQLRecipeRepository)
from cocktails.schemas.cocktails import Category as CategorySchema
from cocktails.schemas.cocktails import Cocktail as CocktailSchema
from cocktails.schemas.cocktails import Garnish as GarnishSchema
from cocktails.schemas.cocktails import Glass as GlassSchema
from cocktails.schemas.cocktails import Ingredient as IngredientSchema
from cocktails.schemas.cocktails import Measure as MeasureSchema
from cocktails.schemas.cocktails import \
    MeasuredIngredient as MeasuredIngredientSchema
from cocktails.schemas.cocktails import Recipe as RecipeSchema
from cocktails.service.deps.base import get_repo_session


def get_cocktail_service(
    repo_session: RepositorySession = Depends(get_repo_session),
):
    mapping = {
        CocktailSchema: CocktailModel,
        CategorySchema: CategoryModel,
        RecipeSchema: RecipeModel,
        GlassSchema: GlassModel,
        GarnishSchema: GarnishModel,
        IngredientSchema: IngredientModel,
        MeasuredIngredientSchema: MeasuredIngredientModel,
    }
    return CocktailService(
        repo_session,
        CocktailRepositoryAdapter(
            SQLCocktailRepository(
                CocktailModelFactory(mapping),
                SQLRecipeRepository(
                    RecipeModelFactory(mapping),
                    SQLIngredientRepository(
                        ModelFactory[IngredientModel, IngredientSchema](mapping)
                    ),
                    SQLGlassRepository(ModelFactory[GlassModel, GlassSchema](mapping)),
                    SQLGarnishRepository(
                        ModelFactory[GarnishModel, GarnishSchema](mapping)
                    ),
                ),
                SQLCategoryRepository(CategoryModelFactory(mapping)),
            )
        ),
    )
