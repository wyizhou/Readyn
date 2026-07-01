"""Initialise an empty database.

The old mock seed (``seed_data.json`` generated from the frontend's fake data)
is gone — Trainalyze now serves **real** data synced from Garmin China. On first run
we lay down a structurally-complete but empty ApexData payload (so the UI renders
honest empty states) plus the connector registry, then the user connects their
佳明 account and ``/api/garmin/sync`` fills it in.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from .garmin.transform import empty_apexdata
from .models import Connector, Dataset, Profile

# Keys served from dedicated tables rather than the datasets store.
_RELATIONAL_KEYS = {"profile", "weightLog", "connectors"}

# Real connector registry — no fabricated record counts. Garmin China is the one
# wired to a live integration; it starts "available" and flips to "connected"
# after a successful /api/garmin/connect.
_CONNECTORS: list[dict[str, Any]] = [
    {
        "id": "garmin-cn",
        "name": "佳明 · 中国区",
        "cat": "可穿戴设备",
        "status": "available",
        "icon": "watch",
        "color": "#007cc3",
        "sync": "—",
        "metrics": ["跑步", "登山", "HRV", "睡眠", "心率", "体重"],
        "records": "—",
        "config": None,
    },
]


def seed_if_empty(db: Session) -> bool:
    """Lay down the empty skeleton + connector registry if the DB is empty."""
    already = db.scalar(select(Profile).limit(1))
    if already is not None:
        return False

    skeleton = empty_apexdata()

    db.add(Profile(id=1, **skeleton["profile"]))

    for connector in _CONNECTORS:
        db.add(Connector(**connector))

    for key, value in skeleton.items():
        if key in _RELATIONAL_KEYS:
            continue
        db.add(Dataset(key=key, value=value))

    db.commit()
    return True
