import logging

from cocktails.db.model.cocktails import Category as CategoryModel
from cocktails.db.repositories.base import (ModelFactory, RepositoryAdapter,
                                            RepositorySession, SQLRepository)
from cocktails.db.repositories.exceptions import ItemNotFound
from cocktails.schemas.cocktails import Category as CategorySchema

logger = logging.getLogger(__name__)


class CategoryModelFactory(ModelFactory[CategoryModel, CategorySchema]):
    def make(self, item: CategorySchema) -> CategoryModel:
        return self._to_orm(item, exclude={"cocktails"})


class SQLCategoryRepository(SQLRepository[CategoryModel, CategorySchema]):
    def __init__(
        self,
        factory: CategoryModelFactory,
    ) -> None:
        super().__init__(CategoryModel, factory)

    def create_if_not_exist(
        self, session: RepositorySession, item: CategorySchema
    ) -> CategoryModel:
        try:
            return self.get_by_name(session, item.name)
        except ItemNotFound:
            return self.create(session, item)


class CategoryRepositoryAdapter(RepositoryAdapter[CategoryModel, CategorySchema]):
    def create_if_not_exist(
        self, session: RepositorySession, item: CategorySchema
    ) -> None:
        orm_obj = self._repository.create_if_not_exist(session, item)
        return orm_obj.id
