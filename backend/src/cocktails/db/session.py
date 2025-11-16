"""
Collection of objects and functions related to the SQLAlchemy session.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from cocktails.db.model import init_metadata
from cocktails.db.repositories.base import RepositorySession

SASession = sessionmaker(future=True)


def get_db():
    """
    Create a session object, yield it and finally close it.

    This function is maninly used within FastAPI service endpoints, but it can
    be used wherever a SQLALchemy session is required.

    Please note that SASession is not configured by default, and some sort of
    configuration machinery is supposed to be already in place.
    """
    session = SASession()

    yield session

    # At this point the session object is garbage-collected and hence calling
    # .close() on it should be useless, but it is also harmless so I'm calling
    # it anyway, just in case.
    session.close()


def initialize_session(pg_dsn, debug=False):
    """
    Initialize the SASession object to get ready to connect to the db.
    """
    engine = create_engine(pg_dsn, future=True, echo=debug)
    # make sure all the ORM classes are imported and registered in the MetaData
    # object, so that relationship resolution always works
    _ = init_metadata()
    SASession.configure(bind=engine)


def force_vacuum(session: RepositorySession) -> None:
    """Make sure to run vacuum process.

    It also run the ANALYZE to update the statistics.

    A shallow copy of the current engine is created setting the isolation level
    to 'AUTOCOMMIT' since the 'VACUUM' command cannot be run inside a
    transaction and by default the SQLAlchemy connections always starts a
    transaction.
    """
    autocommit_engine = session.db.bind.engine.execution_options(
        isolation_level="AUTOCOMMIT"
    )
    with autocommit_engine.connect() as conn:
        conn.execute(text("VACUUM ANALYZE"))
