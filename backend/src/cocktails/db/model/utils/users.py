from sqlalchemy import Column, Integer, String

from cocktails.model.metadata import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        nullable=False,
    )
    username = Column(String, nullable=False)
    hash = Column(String, nullable=False)

    def __repr__(self):
        return "<User(name='%s')>" % (self.username,)
