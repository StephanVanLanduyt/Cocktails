import logging
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (Column, ForeignKey, Index, Integer,
                        SQLColumnExpression, Table, select)
from sqlalchemy.ext.associationproxy import AssociationProxy, association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import (Mapped, composite, declared_attr, foreign,
                            mapped_column, relationship)
from sqlalchemy.sql import true

from cocktails.db.model.metadata import Base

logger = logging.getLogger(__name__)

SCHEMA = "cocktails"


cocktail_category_association_t = Table(
    "cocktail_category_association",
    Base.metadata,
    Column(
        "cocktail_id",
        Integer,
        ForeignKey(
            f"{SCHEMA}.cocktail.id",
            ondelete="cascade",
            onupdate="cascade",
        ),
        primary_key=True,
    ),
    Column(
        "category_id", Integer, ForeignKey(f"{SCHEMA}.category.id"), primary_key=True
    ),
    schema=SCHEMA,
)

recipe_garnish_association_t = Table(
    "recipe_garnish_association",
    Base.metadata,
    Column(
        "recipe_id",
        Integer,
        ForeignKey(
            f"{SCHEMA}.recipe.id",
            ondelete="cascade",
            onupdate="cascade",
        ),
        primary_key=True,
    ),
    Column("garnish_id", Integer, ForeignKey(f"{SCHEMA}.garnish.id"), primary_key=True),
    schema=SCHEMA,
)


class Measure:
    def __init__(self, amount: Decimal, unit: str) -> None:
        super().__init__()
        self._amount = amount
        self._unit = unit

    def __composite_values__(self) -> tuple[Decimal, str]:
        return self._amount, self._unit

    @property
    def amount(self) -> Decimal:
        return self._amount

    @property
    def unit(self) -> str:
        return self._unit


class Ingredient(Base):
    __tablename__ = "ingredient"
    __table_args__ = (
        Index(
            "uix_ingredient_name",
            "name",
            unique=True,
        ),
        {"schema": SCHEMA},
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column()

    is_available: Mapped[bool] = mapped_column(server_default=true())


class MeasuredIngredient(Base):
    __tablename__ = "ingredient_recipe_association"
    __table_args__ = {"schema": SCHEMA}

    ingredient_id: Mapped[int] = mapped_column(
        ForeignKey(
            f"{SCHEMA}.ingredient.id",
            ondelete="cascade",
            onupdate="cascade",
        ),
        primary_key=True,
    )
    recipe_id: Mapped[int] = mapped_column(
        ForeignKey(f"{SCHEMA}.recipe.id"), primary_key=True
    )
    quantity_amount: Mapped[Decimal] = mapped_column()
    quantity_unit: Mapped[str] = mapped_column()

    # recipe: Mapped["Recipe"] = relationship(
    #     lambda: Recipe, foreign_keys=recipe_id, back_populates="measures"
    # )
    ingredient: Mapped[Ingredient] = relationship(
        lambda: Ingredient, foreign_keys=ingredient_id
    )

    @declared_attr
    def quantity(cls) -> Mapped[Measure]:
        return composite(Measure, cls.quantity_amount, cls.quantity_unit)


class Garnish(Base):
    __tablename__ = "garnish"
    __table_args__ = (
        Index(
            "uix_garnish_name",
            "name",
            unique=True,
        ),
        {"schema": SCHEMA},
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column()


class Cocktail(Base):
    __tablename__ = "cocktail"
    __table_args__ = (
        Index(
            "uix_cocktail_name",
            "name",
            unique=True,
        ),
        {"schema": SCHEMA},
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column()
    recipes: Mapped[list["Recipe"]] = relationship(
        lazy="selectin", order_by="desc(Recipe.timestamp)"
    )
    categories: Mapped[list["Category"]] = relationship(
        lazy="selectin",
        secondary=cocktail_category_association_t,
        primaryjoin=lambda: Cocktail.id
        == cocktail_category_association_t.c.cocktail_id,
        secondaryjoin=lambda: Category.id
        == cocktail_category_association_t.c.category_id,
        uselist=True,
        back_populates="cocktails",
    )

    @property
    def recipe(self) -> "Recipe":
        return self.recipes[0]

    @property
    def ingredients(self) -> list[Ingredient]:
        if self.recipe:
            return self.recipe.ingredients
        return []


class Category(Base):
    __tablename__ = "category"
    __table_args__ = (
        Index(
            "uix_category_name",
            "name",
            unique=True,
        ),
        {"schema": SCHEMA},
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column()
    cocktails: Mapped[list[Cocktail]] = relationship(
        lazy="selectin",
        secondary=cocktail_category_association_t,
        primaryjoin=lambda: Category.id
        == cocktail_category_association_t.c.category_id,
        secondaryjoin=lambda: Cocktail.id
        == cocktail_category_association_t.c.cocktail_id,
        uselist=True,
        back_populates="categories",
    )


class Recipe(Base):
    __tablename__ = "recipe"
    __table_args__ = {"schema": SCHEMA}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column()
    cocktail_id: Mapped[int] = mapped_column(ForeignKey(f"{SCHEMA}.cocktail.id"))
    cocktail: Mapped[Cocktail] = relationship()
    ingredients: Mapped[list[Ingredient]] = relationship(
        lazy="selectin",
        secondary=MeasuredIngredient.__table__,
        primaryjoin=lambda: Recipe.id == MeasuredIngredient.recipe_id,
        secondaryjoin=lambda: Ingredient.id == MeasuredIngredient.ingredient_id,
        uselist=True,
    )
    measures: Mapped[list[MeasuredIngredient]] = relationship(
        overlaps="ingredients",
        # back_populates="recipe"
    )
    garnishes: Mapped[list[Garnish]] = relationship(
        lazy="selectin",
        secondary=recipe_garnish_association_t,
        primaryjoin=lambda: Recipe.id == recipe_garnish_association_t.c.recipe_id,
        secondaryjoin=lambda: Garnish.id == recipe_garnish_association_t.c.garnish_id,
        uselist=True,
    )
    method: Mapped[str] = mapped_column(server_default="Stir with Ice and Strain.")
