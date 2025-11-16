from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from cocktails.core.garnishes import Garnish as GarnishName
from cocktails.core.ingredients import Ingredient as IngredientName
from cocktails.core.units import Unit
from cocktails.schemas.base import ItemDB


class Garnish(ItemDB):
    name: GarnishName


class Ingredient(ItemDB):
    name: IngredientName


class Measure(BaseModel):
    class Config:
        orm_mode = True

    amount: Decimal
    unit: Unit


class MeasuredIngredient(BaseModel):
    class Config:
        orm_mode = True

    ingredient: Ingredient
    quantity: Measure


class Recipe(ItemDB):
    measures: list[MeasuredIngredient]
    garnishes: list[Garnish]
    method: str
    ingredients: list[Ingredient] | None
    timestamp: datetime | None = None


class Category(ItemDB):
    name: str


class Cocktail(ItemDB):
    name: str
    recipes: list[Recipe]
    categories: list[Category]
    recipe: Recipe | None = None
    ingredients: list[Ingredient] | None = None
