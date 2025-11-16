from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from collections import defaultdict
from contextlib import contextmanager
from copy import deepcopy
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from pathlib import PurePath
from typing import (AbstractSet, Any, Dict, Generic, Iterable, Iterator, List,
                    Optional, Protocol, Type, TypeVar, Union, overload)

from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.exc import MultipleResultsFound, NoResultFound
from sqlalchemy.orm import Session
from sqlalchemy.sql import Select

from cocktails.db.model.cocktails import Measure as MeasureModel
from cocktails.db.model.metadata import Base
from cocktails.db.repositories.exceptions import (ItemNotFound,
                                                  MultipleItemsFound)
from cocktails.schemas.base import ItemDB
from cocktails.schemas.cocktails import Measure as MeasureSchema

ItemType = TypeVar("ItemType", bound=ItemDB)
ModelType = TypeVar("ModelType", bound=Base)
T = TypeVar("T", bound=Union[ItemDB, Base])

logger = logging.getLogger(__name__)


class RepositorySession:
    def __init__(self, session: Optional[Session] = None) -> None:
        self._session = session

    @property
    def db(self) -> Session:
        if self._session:
            return self._session
        raise ValueError("SQLAlchemy session not available")

    @contextmanager
    def begin(self):
        if self._session:
            with self._session.begin():
                yield self
        else:
            yield self


class ModelFactory(Generic[ModelType, ItemType]):
    def __init__(
        self,
        schemas_map: dict[Type[ItemType], Type[ModelType]],
        converters: dict[Type[BaseModel], Type] | None = None,
    ) -> None:
        converters = converters or {MeasureSchema: MeasureModel}
        converters.update(schemas_map)  # type: ignore
        self._converters = converters
        self._schemas_map = schemas_map

    @property
    def schemas_map(self) -> dict[Type[ItemType], Type[ModelType]]:
        return self._schemas_map

    def _encode(self, data: Any, exclude: AbstractSet[str]) -> Any:
        if isinstance(data, BaseModel):
            try:
                model = self._converters[data.__class__]
            except KeyError as err:
                raise ValueError(
                    f"Unable to convert to ORM type: {data.__class__}"
                ) from err
            return model(  # type: ignore
                **{
                    name: self._encode(value, set())
                    for name, value in dict(data).items()
                    if name in data.__fields__ and name not in exclude
                }
            )
        if isinstance(data, list):
            return data.__class__(map(lambda d: self._encode(d, set()), data))
        if isinstance(data, Enum):
            return data.value
        if isinstance(data, PurePath):
            return str(data)
        if isinstance(data, (str, int, float, type(None), date, datetime, Decimal)):
            return data
        raise ValueError(f"Unable to convert to ORM type: {data.__class__}")

    def _to_orm(
        self, item: ItemType, exclude: AbstractSet[str] | None = None
    ) -> ModelType:
        exclude = exclude or set()
        return self._encode(item, exclude=exclude)

    def make(self, item: ItemType) -> ModelType:
        logger.info("making %s", item)
        return self._to_orm(item)


class Repository(ABC, Generic[ModelType, ItemType]):
    def __init__(
        self,
        factory: ModelFactory,
    ) -> None:
        self._factory = factory

    @property
    def schemas_map(self) -> dict[Type[ItemType], Type[ModelType]]:
        return self._factory.schemas_map

    @abstractmethod
    def get_by_name(self, session: RepositorySession, name: str) -> ModelType:
        ...

    @abstractmethod
    def get_multi(
        self, session: RepositorySession, skip: int, limit: int
    ) -> list[ModelType]:
        ...

    @abstractmethod
    def create(self, session: RepositorySession, item: ItemType) -> ModelType:
        ...


class SQLRepository(Repository, Generic[ModelType, ItemType]):
    def __init__(
        self,
        model: Type[ModelType],
        factory: ModelFactory,
    ) -> None:
        self._base_model = model
        self._factory = factory

    @classmethod
    def _execute_get_statement(
        cls, session: RepositorySession, stmt: Select, unique: bool = False
    ) -> ModelType:
        result = session.db.execute(stmt)
        if unique:
            result = result.unique()
        try:
            return result.scalars().one()
        except NoResultFound as err:
            raise ItemNotFound("Object not found") from err
        except MultipleResultsFound as err:
            raise MultipleItemsFound("Object not found") from err

    def _get_statement(self, name: str) -> Select:
        stmt = select(self._base_model).where(
            func.lower(self._base_model.name) == name.lower()
        )
        return stmt

    def get_by_name(self, session: RepositorySession, name: str) -> ModelType:
        stmt = self._get_statement(name)
        return self._execute_get_statement(session, stmt, unique=True)

    def get_multi(
        self, session: RepositorySession, skip: int, limit: int
    ) -> list[ModelType]:
        stmt = select(self._base_model)
        if skip:
            stmt = stmt.offset(skip)
        if limit:
            stmt = stmt.limit(limit)
        return session.db.execute(stmt).scalars().all()

    def create(self, session: RepositorySession, item: ItemType) -> ModelType:
        logger.info("creating %s", item)
        orm_item = self._factory.make(item)
        session.db.add(orm_item)
        session.db.flush()
        session.db.refresh(orm_item)
        return orm_item


class RepositoryAdapter(Generic[ModelType, ItemType]):
    def __init__(self, repository: SQLRepository[ModelType, ItemType]) -> None:
        self._repository = repository
        self._model_to_schema = {
            model: schema for schema, model in repository.schemas_map.items()
        }

    def _from_orm(self, db_obj: ModelType) -> ItemType:
        return self._model_to_schema[db_obj.__class__].from_orm(db_obj)

    def get_by_name(self, session: RepositorySession, name: str) -> ItemType:
        db_obj = self._repository.get_by_name(session, name)
        return self._from_orm(db_obj)

    def get_multi(
        self, session: RepositorySession, skip: int, limit: int
    ) -> list[ItemType]:
        db_objs = self._repository.get_multi(session, skip, limit)
        return [self._from_orm(obj) for obj in db_objs]

    def create(self, session: RepositorySession, item: ItemType) -> int:
        db_obj = self._repository.create(session, item)
        return db_obj.id
