import logging

from sqlalchemy import and_, func, not_, select
from sqlalchemy.orm import Session

from cocktails.db.model.cocktails import Category as CategoryModel
from cocktails.db.model.cocktails import Cocktail as CocktailModel
from cocktails.db.model.cocktails import Ingredient as IngredientModel
from cocktails.db.model.cocktails import Recipe as RecipeModel
from cocktails.db.repositories.base import (ModelFactory, RepositoryAdapter,
                                            RepositorySession, SQLRepository)
from cocktails.db.repositories.categories import SQLCategoryRepository
from cocktails.db.repositories.exceptions import ItemNotFound
from cocktails.db.repositories.recipes import SQLRecipeRepository
from cocktails.schemas.cocktails import Category as CategorySchema
from cocktails.schemas.cocktails import Cocktail as CocktailSchema

logger = logging.getLogger(__name__)


class CocktailModelFactory(ModelFactory[CocktailModel, CocktailSchema]):
    def make(self, item: CocktailSchema) -> CocktailModel:
        return self._to_orm(
            item, exclude={"ingredients", "recipe", "categories", "recipes"}
        )


class SQLCocktailRepository(SQLRepository[CocktailModel, CocktailSchema]):
    def __init__(
        self,
        factory: CocktailModelFactory,
        recipes: SQLRecipeRepository,
        categories: SQLCategoryRepository,
    ) -> None:
        super().__init__(CocktailModel, factory)
        self._recipes = recipes
        self._categories = categories

    def get_multi_available(
        self, session: RepositorySession, skip: int, limit: int
    ) -> list[CocktailModel]:
        subq = (
            select(
                RecipeModel.cocktail_id.label("cocktail_id"),
                func.max(RecipeModel.timestamp).label("timestamp"),
            ).group_by(RecipeModel.cocktail_id)
        ).subquery()

        stmt = (
            select(CocktailModel)
            .join(CocktailModel.recipes)
            .join(
                subq,
                and_(
                    RecipeModel.cocktail_id == subq.c.cocktail_id,
                    RecipeModel.timestamp == subq.c.timestamp,
                ),
            )
            .where(
                not_(
                    RecipeModel.ingredients.any(IngredientModel.is_available.is_(False))
                )
            )
        )
        if skip:
            stmt = stmt.offset(skip)
        if limit:
            stmt = stmt.limit(limit)
        return session.db.execute(stmt).scalars().all()

    def _updated_categories(
        self, session: RepositorySession, item: CocktailSchema
    ) -> list[CategoryModel]:
        categories: list[CategoryModel] = []
        for category in item.categories:
            categories.append(self._categories.create_if_not_exist(session, category))
        return categories

    def create_if_not_exist(
        self, session: RepositorySession, item: CocktailSchema
    ) -> CocktailModel:
        if len(item.recipes) != 1:
            raise ValueError("More than one recipe created at one time")
        try:
            existing_cocktail = self.get_by_name(session, item.name)

            existing_cocktail.categories = self._updated_categories(session, item)
            existing_cocktail.recipes.append(
                self._recipes._prepare_to_create(session, item.recipes[0])
            )

            session.db.add(existing_cocktail)
            session.db.flush()
            return existing_cocktail
        except ItemNotFound:
            # new cocktail
            orm_item = self._factory.make(item)

            orm_item.categories = self._updated_categories(session, item)
            orm_item.recipes = [
                self._recipes._prepare_to_create(session, item.recipes[0])
            ]

            session.db.add(orm_item)
            session.db.flush()
            return orm_item

    def add_category_to_cocktail(
        self, session: RepositorySession, cocktail_name: str, category_name: str
    ) -> CocktailModel:
        try:
            orm_cocktail = self.get_by_name(session, cocktail_name)
        except ItemNotFound as err:
            raise ItemNotFound("Cocktail with name {cocktail_name} not found") from err
        orm_category = self._categories.create_if_not_exist(
            session, CategorySchema(name=category_name)
        )
        orm_cocktail.categories.append(orm_category)
        session.db.add(orm_cocktail)
        session.db.flush()
        return orm_cocktail


class CocktailRepositoryAdapter(RepositoryAdapter[CocktailModel, CocktailSchema]):
    def get_multi_available(
        self, session: RepositorySession, skip: int, limit: int
    ) -> list[CocktailSchema]:
        db_objs = self._repository.get_multi_available(session, skip, limit)
        return [self._from_orm(obj) for obj in db_objs]

    def create_if_not_exist(
        self, session: RepositorySession, item: CocktailSchema
    ) -> int:
        orm_obj = self._repository.create_if_not_exist(session, item)
        return orm_obj.id

    def add_category_to_cocktail(
        self, session: RepositorySession, cocktail_name: str, category_name: str
    ) -> int:
        orm_obj = self._repository.add_category_to_cocktail(
            session, cocktail_name, category_name
        )
        return orm_obj.id
