from itertools import islice

from cocktails.core.ingredients import Ingredient as IngredientName
from cocktails.db.repositories.base import RepositorySession
from cocktails.db.repositories.ingredients import IngredientRepositoryAdapter
from cocktails.schemas.cocktails import Ingredient


class IngredientService:
    def __init__(
        self,
        session: RepositorySession,
        ingredient_repository: IngredientRepositoryAdapter,
    ) -> None:
        self._session = session
        self._ingredient_repository = ingredient_repository

    @property
    def session(self) -> RepositorySession:
        return self._session

    def get_ingredient_by_name(self, name: str) -> Ingredient:
        return self._ingredient_repository.get_by_name(self._session, name)

    def get_multi_ingredient(
        self, skip: int = 0, limit: int = 100
    ) -> list[IngredientName]:
        return list(islice((ing for ing in IngredientName), skip, limit))

    def create_if_not_exist(self, item: Ingredient) -> int:
        return self._ingredient_repository.create_if_not_exist(self._session, item)

    def set_availability(self, name: str, is_available: bool) -> None:
        return self._ingredient_repository.set_availability(
            self._session, name, is_available
        )
