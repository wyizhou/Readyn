"""Sync orchestration: pull a window of Garmin data and persist it.

Kept separate from :mod:`app.garmin.client` (network) and
:mod:`app.garmin.transform` (pure) so the flow can be unit-tested with a fake
client. Garmin-sourced fields overwrite the corresponding ApexData keys;
user-owned profile fields (goal, AI keys, target weight) are preserved.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Dataset, GarminSession, Profile, WeightEntry
from . import transform
from .client import GarminCNClient

# Profile fields Garmin owns; everything else on the row is user-editable and kept.
# (restingHR is set separately from the daily summary, see sync_account.)
_GARMIN_PROFILE_FIELDS = ("name", "handle", "location", "height", "maxHR", "sex", "birth")


def _persist_dataset(db: Session, key: str, value: Any) -> None:
    row = db.get(Dataset, key)
    if row is None:
        db.add(Dataset(key=key, value=value))
    else:
        row.value = value


def _persist_profile(db: Session, core: dict[str, Any]) -> None:
    profile = db.get(Profile, 1)
    if profile is None:
        return
    for field in _GARMIN_PROFILE_FIELDS:
        incoming = core.get(field)
        if incoming:  # don't clobber existing values with empties
            setattr(profile, field, incoming)


def _persist_weight(db: Session, log: list[dict[str, Any]]) -> None:
    for entry in log:
        existing = db.scalar(select(WeightEntry).where(WeightEntry.date == entry["date"]))
        if existing is None:
            db.add(WeightEntry(date=entry["date"], kg=entry["kg"], fat=entry.get("fat")))
        else:
            existing.kg = entry["kg"]
            if entry.get("fat") is not None:
                existing.fat = entry["fat"]


def sync_account(
    client: GarminCNClient,
    db: Session,
    connector_id: str = "garmin-cn",
    *,
    days: int = 42,
    today: date | None = None,
) -> dict[str, Any]:
    """Fetch + transform + persist one account's data. Returns a summary dict."""
    today = today or datetime.now().astimezone().date()
    window = [today - timedelta(days=offset) for offset in range(days)]
    window_asc = list(reversed(window))

    # Profile -----------------------------------------------------------------
    social = client.fetch_social_profile()
    personal = client.fetch_personal_info()
    profile_core = transform.social_to_profile(social, personal)
    _persist_profile(db, profile_core)
    # Resting HR lives in the daily summary, not personal-info.
    summary = client.fetch_daily_summary(today.isoformat())
    resting_hr = transform._round(summary.get("restingHeartRate")) if summary else 0
    if resting_hr:
        profile = db.get(Profile, 1)
        if profile is not None:
            profile.restingHR = resting_hr

    # Weight ------------------------------------------------------------------
    weight_raw = client.fetch_weight(window_asc[0].isoformat(), today.isoformat())
    weight_log = transform.weight_to_log(weight_raw)
    _persist_weight(db, weight_log)

    # Activities --------------------------------------------------------------
    activities_raw = client.fetch_activities(limit=max(days, 30))
    activities = transform.activities_to_summaries(activities_raw)
    _persist_dataset(db, "activities", activities)

    # HRV ---------------------------------------------------------------------
    hrv_raws: list[dict[str, Any]] = []
    for day in window_asc:
        try:
            payload = client.fetch_hrv(day.isoformat())
        except Exception:  # one bad day shouldn't abort the whole sync
            continue
        if payload:
            hrv_raws.append(payload)
    hrv_points = transform.hrv_to_points(hrv_raws)
    _persist_dataset(db, "hrv", hrv_points)

    # Sleep -------------------------------------------------------------------
    sleep_nights: list[dict[str, Any]] = []
    for day in window_asc[-14:]:
        try:
            payload = client.fetch_sleep(day.isoformat())
        except Exception:
            continue
        night = transform.sleep_to_night(payload)
        if night:
            sleep_nights.append(night)
    _persist_dataset(db, "sleep", sleep_nights)

    # Training readiness (Garmin's own composite score) -----------------------
    readiness = transform.readiness_from_payload(
        client.fetch_training_readiness(today.isoformat())
    )

    # Derived: PMC + Today ----------------------------------------------------
    pmc, fitness = transform.training_load_series(activities, days=days)
    _persist_dataset(db, "pmc", pmc)
    today_block = transform.build_today(fitness, hrv_points, sleep_nights, resting_hr, readiness)
    _persist_dataset(db, "today", today_block)

    # Session bookkeeping -----------------------------------------------------
    session = db.get(GarminSession, connector_id)
    if session is None:
        session = GarminSession(connector_id=connector_id)
        db.add(session)
    session.last_sync = datetime.now().astimezone().isoformat(timespec="seconds")
    session.last_error = None
    try:
        session.account = client.account
    except Exception:
        pass

    db.commit()
    return {
        "activities": len(activities),
        "hrv": len(hrv_points),
        "sleep": len(sleep_nights),
        "weight": len(weight_log),
        "lastSync": session.last_sync,
    }
