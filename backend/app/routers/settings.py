"""User settings — units / HR zones / notifications / privacy / theme (README §8).

Persisted as a single JSON document; GET returns defaults until something is saved,
PUT deep-merges the payload so partial updates are safe.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import services
from ..database import get_db

router = APIRouter(prefix="/api", tags=["settings"])


@router.get("/settings")
def get_settings(db: Session = Depends(get_db)) -> dict[str, Any]:
    return services.get_settings(db)


@router.put("/settings")
def put_settings(payload: dict[str, Any], db: Session = Depends(get_db)) -> dict[str, Any]:
    return services.save_settings(db, payload)
