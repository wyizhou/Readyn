"""Seed the database from ``seed_data.json`` (generated from the frontend's
canonical mock data, so backend and frontend serve identical shapes)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Connector, Dataset, Profile, WeightEntry

SEED_PATH = Path(__file__).parent / "seed_data.json"

# Keys handled by dedicated tables; everything else lands in the datasets store.
_RELATIONAL_KEYS = {"profile", "weightLog", "connectors"}


def load_seed() -> dict[str, Any]:
    return json.loads(SEED_PATH.read_text(encoding="utf-8"))


def seed_if_empty(db: Session) -> bool:
    """Populate the DB from the seed file if it is empty. Returns True if seeded."""
    already = db.scalar(select(Profile).limit(1))
    if already is not None:
        return False

    data = load_seed()

    db.add(Profile(id=1, **data["profile"]))

    for entry in data["weightLog"]:
        db.add(WeightEntry(**entry))

    for c in data["connectors"]:
        db.add(Connector(**c))

    for key, value in data.items():
        if key in _RELATIONAL_KEYS:
            continue
        db.add(Dataset(key=key, value=value))

    db.commit()
    return True
