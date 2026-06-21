"""Pytest fixtures — run the app against a shared in-memory SQLite database."""

from __future__ import annotations

import os

# Must be set before importing the app (engine is created at import time).
os.environ["READYN_DATABASE_URL"] = "sqlite://"

import pytest  # noqa: E402
from app.main import app  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture(scope="session")
def client() -> TestClient:
    # Entering the context manager runs the lifespan: create tables + seed.
    with TestClient(app) as c:
        yield c
