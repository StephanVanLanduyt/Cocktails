import logging

from cocktails.db.model.cocktails import Garnish as GarnishModel
from cocktails.db.repositories.base import (ModelFactory, RepositoryAdapter,
                                            RepositorySession, SQLRepository)
from cocktails.db.repositories.exceptions import ItemNotFound
from cocktails.schemas.cocktails import Garnish as GarnishSchema

logger = logging.getLogger(__name__)


class SQLGarnishRepository(SQLRepository[GarnishModel, GarnishSchema]):
    def __init__(
        self,
        factory: ModelFactory,
    ) -> None:
        super().__init__(GarnishModel, factory)

    def create_if_not_exist(
        self, session: RepositorySession, item: GarnishSchema
    ) -> GarnishModel:
        try:
            return self.get_by_name(session, item.name)
        except ItemNotFound:
            logger.info("creating because it does not exist %s", item)
            return self.create(session, item)


class GarnishRepositoryAdapter(RepositoryAdapter[GarnishModel, GarnishSchema]):
    def create_if_not_exist(
        self, session: RepositorySession, item: GarnishSchema
    ) -> int:
        db_obj = self._repository.create_if_not_exist(session, item)
        return db_obj.id
