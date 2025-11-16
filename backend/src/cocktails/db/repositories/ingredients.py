import logging

from cocktails.db.model.cocktails import Ingredient as IngredientModel
from cocktails.db.repositories.base import (ModelFactory, RepositoryAdapter,
                                            RepositorySession, SQLRepository)
from cocktails.db.repositories.exceptions import ItemNotFound
from cocktails.schemas.cocktails import Ingredient as IngredientSchema

logger = logging.getLogger(__name__)


class SQLIngredientRepository(SQLRepository[IngredientModel, IngredientSchema]):
    def __init__(
        self,
        factory: ModelFactory,
    ) -> None:
        super().__init__(IngredientModel, factory)

    def create_if_not_exist(
        self, session: RepositorySession, item: IngredientSchema
    ) -> IngredientModel:
        try:
            return self.get_by_name(session, item.name)
        except ItemNotFound:
            logger.info("creating because it does not exist %s", item)
            return self.create(session, item)

    def set_availability(
        self, session: RepositorySession, name: str, is_available: bool
    ) -> None:
        try:
            db_obj = self.get_by_name(session, name)
            db_obj.is_available = is_available
            session.db.add(db_obj)
            session.db.flush()
        except ItemNotFound:
            logger.info("Ingredient with name %s does not exist", name)


class IngredientRepositoryAdapter(RepositoryAdapter[IngredientModel, IngredientSchema]):
    def create_if_not_exist(
        self, session: RepositorySession, item: IngredientSchema
    ) -> int:
        db_obj = self._repository.create_if_not_exist(session, item)
        return db_obj.id

    def set_availability(
        self, session: RepositorySession, name: str, is_available: bool
    ) -> None:
        self._repository.set_availability(session, name, is_available)
