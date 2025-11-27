import logging

from cocktails.db.model.cocktails import Tag as TagModel
from cocktails.db.repositories.base import (ModelFactory, RepositoryAdapter,
                                            RepositorySession, SQLRepository)
from cocktails.db.repositories.exceptions import ItemNotFound
from cocktails.schemas.cocktails import Tag as TagSchema

logger = logging.getLogger(__name__)


class TagModelFactory(ModelFactory[TagModel, TagSchema]):
    def make(self, item: TagSchema) -> TagModel:
        return self._to_orm(item, exclude={"cocktails"})


class SQLTagRepository(SQLRepository[TagModel, TagSchema]):
    def __init__(
        self,
        factory: TagModelFactory,
    ) -> None:
        super().__init__(TagModel, factory)

    def create_if_not_exist(
        self, session: RepositorySession, item: TagSchema
    ) -> TagModel:
        try:
            return self.get_by_name(session, item.name)
        except ItemNotFound:
            return self.create(session, item)


class TagRepositoryAdapter(RepositoryAdapter[TagModel, TagSchema]):
    def create_if_not_exist(
        self, session: RepositorySession, item: TagSchema
    ) -> None:
        orm_obj = self._repository.create_if_not_exist(session, item)
        return orm_obj.id
