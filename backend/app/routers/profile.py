"""Profile + weight log — the linked, mutable core (README §6)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import services
from ..database import get_db
from ..models import Profile, WeightEntry
from ..schemas import ProfileSchema, WeightEntrySchema

router = APIRouter(prefix="/api", tags=["profile"])


@router.get("/profile", response_model=ProfileSchema)
def get_profile(db: Session = Depends(get_db)) -> Profile:
    return db.get(Profile, 1)


@router.put("/profile", response_model=ProfileSchema)
def update_profile(payload: ProfileSchema, db: Session = Depends(get_db)) -> Profile:
    profile = db.get(Profile, 1)
    for field, value in payload.model_dump().items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/weight", response_model=list[WeightEntrySchema])
def get_weight(db: Session = Depends(get_db)) -> list[dict]:
    return services.get_weight_log(db)


@router.post("/weight", response_model=list[WeightEntrySchema])
def add_weight(entry: WeightEntrySchema, db: Session = Depends(get_db)) -> list[dict]:
    """Upsert a weight entry by date, then return the full log (newest first)."""
    existing = db.scalar(select(WeightEntry).where(WeightEntry.date == entry.date))
    if existing is not None:
        existing.kg = entry.kg
        existing.fat = entry.fat
        existing.note = entry.note
    else:
        db.add(WeightEntry(date=entry.date, kg=entry.kg, fat=entry.fat, note=entry.note))
    db.commit()
    return services.get_weight_log(db)
