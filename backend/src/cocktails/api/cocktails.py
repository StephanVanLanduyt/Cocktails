from cocktails.db.repositories.base import RepositorySession
from cocktails.db.repositories.cocktails import CocktailRepositoryAdapter
from cocktails.schemas.cocktails import Cocktail


class CocktailService:
    def __init__(
        self,
        session: RepositorySession,
        cocktail_repository: CocktailRepositoryAdapter,
    ) -> None:
        self._session = session
        self._cocktail_repository = cocktail_repository

    @property
    def session(self) -> RepositorySession:
        return self._session

    def get_cocktail_by_name(self, name: str) -> Cocktail:
        return self._cocktail_repository.get_by_name(self._session, name)

    def get_multi_cocktail(self, skip: int = 0, limit: int = 100) -> list[Cocktail]:
        return self._cocktail_repository.get_multi(self._session, skip, limit)

    def get_multi_available_cocktail(
        self, skip: int = 0, limit: int = 100
    ) -> list[Cocktail]:
        return self._cocktail_repository.get_multi_available(self._session, skip, limit)

    def create_if_not_exist(self, item: Cocktail) -> int:
        return self._cocktail_repository.create_if_not_exist(self._session, item)

    def add_category_to_cocktail(self, cocktail_name: str, category_name: str) -> int:
        return self._cocktail_repository.add_category_to_cocktail(
            self._session, cocktail_name, category_name
        )
