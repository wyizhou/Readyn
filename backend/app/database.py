"""SQLAlchemy engine/session setup.

The database URL is read from the ``TRAINALYZE_DATABASE_URL`` env var, defaulting to
a local SQLite file. Tests point it at an in-memory database via a shared pool.
"""

from __future__ import annotations

import os
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.environ.get("TRAINALYZE_DATABASE_URL", "sqlite:///./trainalyze.db")

if DATABASE_URL == "sqlite://" or ":memory:" in DATABASE_URL:
    # Shared in-memory database (used by the test-suite).
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a scoped database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
