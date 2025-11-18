import logging
from datetime import datetime

from sqlalchemy.orm import Session

from cocktails.db.model.cocktails import Garnish as GarnishModel
from cocktails.db.model.cocktails import Glass as GlassModel
from cocktails.db.model.cocktails import \
    MeasuredIngredient as MeasuredIngredientModel
from cocktails.db.model.cocktails import Recipe as RecipeModel
from cocktails.db.repositories.base import (ModelFactory, RepositorySession,
                                            SQLRepository)
from cocktails.db.repositories.garnishes import SQLGarnishRepository
from cocktails.db.repositories.glasses import SQLGlassRepository
from cocktails.db.repositories.ingredients import SQLIngredientRepository
from cocktails.schemas.cocktails import Recipe as RecipeSchema

logger = logging.getLogger(__name__)


class RecipeModelFactory(ModelFactory[RecipeModel, RecipeSchema]):
    def make(self, item: RecipeSchema) -> RecipeModel:
        return self._to_orm(item, exclude={"ingredients", "timestamp", "cocktail", "garnishes", "glass"})


class SQLRecipeRepository(SQLRepository[RecipeModel, RecipeSchema]):
    def __init__(
        self,
        factory: RecipeModelFactory,
        ingredients: SQLIngredientRepository,
        glasses: SQLGlassRepository,
        garnishes: SQLGarnishRepository,
    ) -> None:
        super().__init__(RecipeModel, factory)
        self._ingredients = ingredients
        self._glasses = glasses
        self._garnishes = garnishes

    def _prepare_to_create(
        self, session: RepositorySession, item: RecipeSchema
    ) -> RecipeModel:
        if item.timestamp is not None:
            raise ValueError("Recipe timestamp cannot be set")

        orm_item = self._factory.make(item)
        orm_item.timestamp = datetime.now()

        orm_item.glass = self._glasses.create_if_not_exist(session, item.glass)

        measures: list[MeasuredIngredientModel] = []
        for measure in item.measures:
            ingredient = self._ingredients.create_if_not_exist(
                session, measure.ingredient
            )
            measures.append(
                MeasuredIngredientModel(
                    ingredient=ingredient,
                    quantity_amount=measure.quantity.amount,
                    quantity_unit=measure.quantity.unit,
                )
            )
        orm_item.measures = measures

        garnishes: list[GarnishModel] = []
        for garnish in item.garnishes:
            garnishes.append(self._garnishes.create_if_not_exist(session, garnish))
        orm_item.garnishes = garnishes

        return orm_item
