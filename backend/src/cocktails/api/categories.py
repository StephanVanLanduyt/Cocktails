from cocktails.db.repositories.base import RepositorySession
from cocktails.db.repositories.categories import CategoryRepositoryAdapter
from cocktails.schemas.cocktails import Category


class CategoryService:
    def __init__(
        self,
        session: RepositorySession,
        category_repository: CategoryRepositoryAdapter,
    ) -> None:
        self._session = session
        self._category_repository = category_repository

    @property
    def session(self) -> RepositorySession:
        return self._session

    def get_category_by_name(self, name: str) -> Category:
        return self._category_repository.get_by_name(self._session, name)

    def get_multi_category(self, skip: int = 0, limit: int = 100) -> list[Category]:
        return self._category_repository.get_multi(self._session, skip, skip+limit)

    def create_if_not_exist(self, item: Category) -> int:
        return self._category_repository.create_if_not_exist(self._session, item)
