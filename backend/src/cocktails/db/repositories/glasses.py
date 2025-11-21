import logging

from cocktails.db.model.cocktails import Glass as GlassModel
from cocktails.db.repositories.base import (ModelFactory, RepositoryAdapter,
                                            RepositorySession, SQLRepository)
from cocktails.db.repositories.exceptions import ItemNotFound
from cocktails.schemas.cocktails import Glass as GlassSchema

logger = logging.getLogger(__name__)


class SQLGlassRepository(SQLRepository[GlassModel, GlassSchema]):
    def __init__(
        self,
        factory: ModelFactory,
    ) -> None:
        super().__init__(GlassModel, factory)

    def create_if_not_exist(
        self, session: RepositorySession, item: GlassSchema
    ) -> GlassModel:
        try:
            return self.get_by_name(session, item.name)
        except ItemNotFound:
            logger.info("creating because it does not exist %s", item)
            return self.create(session, item)


class GlassRepositoryAdapter(RepositoryAdapter[GlassModel, GlassSchema]):
    def create_if_not_exist(self, session: RepositorySession, item: GlassSchema) -> int:
        db_obj = self._repository.create_if_not_exist(session, item)
        return db_obj.id
