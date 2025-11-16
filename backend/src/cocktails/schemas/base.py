from datetime import datetime
from typing import Any, List

from pydantic import BaseModel


class EqualityMixin:
    def __eq__(self, other: Any) -> bool:
        if isinstance(other, self.__class__):
            checks = [
                getattr(self, field) == getattr(other, field)
                for field in self.__fields__.keys()
                if field not in self._equality_exclusion()
            ]
            return all(checks)
        return False


class ItemDB(EqualityMixin, BaseModel):
    id: int | None = None

    @classmethod
    def _equality_exclusion(cls) -> List[str]:
        exclusions = {"id"}
        for parent in cls.__mro__[1:]:
            try:
                exclusions = exclusions.union(parent._equality_exclusion())
            except AttributeError:
                pass
        return exclusions

    class Config:
        orm_mode = True


class SlowlyChangingItem(ItemDB):
    valid_from: datetime
    valid_until: datetime


class TimedItem(ItemDB):
    timestamp: datetime
