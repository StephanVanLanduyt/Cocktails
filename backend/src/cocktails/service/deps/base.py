import logging
import sys
from typing import Any

from fastapi import Depends
from pydantic import BaseSettings
from pythonjsonlogger.jsonlogger import JsonFormatter
from sqlalchemy.orm import Session

from cocktails.db.repositories.base import RepositorySession
from cocktails.db.session import get_db, initialize_session


def get_repo_session(session: Session = Depends(get_db)) -> RepositorySession:
    with RepositorySession(session).begin() as repo_session:
        yield repo_session


def set_logging_level(handler: Any, is_debug: bool = False) -> None:
    "Set logging level to DEBUG if requested, otherwise to INFO."
    if is_debug:
        handler.setLevel(logging.DEBUG)
    else:
        handler.setLevel(logging.INFO)


def set_logging_format(handler: Any, is_json: bool = False) -> None:
    """
    Set the formatter to the JSON formatter if requested.

    Otherwise plain text formatter is used.
    """
    if is_json:
        formatter = JsonFormatter(fmt="%(asctime)s %(name)s %(levelname)s %(message)s")
    else:
        formatter = logging.Formatter(
            fmt="%(asctime)s %(name)s %(levelname)s %(message)s"
        )

    handler.setFormatter(formatter)


def initialize_logging(json_formmatter: bool = False, debug_mode: bool = False) -> None:
    """
    Initialize the application logger to sane defaults.

    Add customization to logging level and format if requested.
    """
    root_logger = logging.getLogger()
    if root_logger.hasHandlers():
        root_logger.handlers.clear()
    set_logging_level(root_logger, debug_mode)

    handler = logging.StreamHandler(sys.stdout)
    set_logging_level(handler, debug_mode)
    set_logging_format(handler, json_formmatter)

    root_logger.addHandler(handler)


def initialize_app(settings: BaseSettings) -> None:
    """
    Perform initialization steps required by the application.
    """
    initialize_session(settings.pg_dsn, settings.enable_debug_mode)
    initialize_logging(settings.enable_json_logging, settings.enable_debug_mode)


class AppSettings(BaseSettings):
    """
    Retrieve app settings from the env variables
    """

    pg_dsn: str
    enable_json_logging: bool | None = True
    enable_debug_mode: bool | None = False

    class Config:
        fields = {
            "pg_dsn": {"env": ["pg_dsn", "postgres_connection_string"]},
        }
