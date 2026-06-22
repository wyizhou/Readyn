"""Garmin transforms + sync flow, exercised with a fake (no-network) client."""

from __future__ import annotations

from datetime import date
from typing import Any

import pytest
from app.garmin import transform
from app.garmin.sync import sync_account
from fastapi.testclient import TestClient

# --- representative Garmin Connect payloads (trimmed to fields we read) --------

ACTIVITY = {
    "activityId": 123,
    "activityName": "阈值间歇 6×1km",
    "activityType": {"typeKey": "running"},
    "startTimeLocal": "2026-06-20 07:30:00",
    "distance": 10200.0,
    "duration": 3120.0,
    "averageHR": 168,
    "activityTrainingLoad": 142,
}
SOCIAL = {"displayName": "linyue", "fullName": "林越", "userName": "linyue", "location": "成都"}
PERSONAL = {
    "biometricProfile": {"height": 178, "maxHr": 190},
    "userInfo": {"location": "成都"},
    "sleep": {"restingHeartRate": 48},
}
WEIGHT = {"dateWeightList": [{"calendarDate": "2026-06-20", "weight": 66000, "bodyFat": 12.5}]}
HRV_DAY = {"hrvSummary": {"lastNightAvg": 70, "baseline": {"balancedLow": 60, "balancedUpper": 80}}}
SLEEP_DAY = {
    "dailySleepDTO": {
        "calendarDate": "2026-06-20",
        "sleepTimeSeconds": 27000,
        "deepSleepSeconds": 5400,
        "remSleepSeconds": 7200,
        "lightSleepSeconds": 14400,
        "awakeSleepSeconds": 600,
        "sleepScores": {"overall": {"value": 82}},
    }
}
SUMMARY = {"restingHeartRate": 48}


# --- transform unit tests -----------------------------------------------------


def test_activity_summary_maps_units_and_flag() -> None:
    s = transform.activity_to_summary(ACTIVITY)
    assert s["id"] == "123"
    assert s["sport"] == "跑步" and s["icon"] == "run"
    assert s["dist"] == "10.2 km"
    assert s["dur"] == "52 分钟"
    assert s["load"] == 142
    assert s["hr"] == 168
    assert s["flag"] == "high"  # load >= 130
    assert s["date"] == "2026-06-20"


def test_weight_to_log_grams_to_kg_newest_first() -> None:
    log = transform.weight_to_log(WEIGHT)
    assert log == [{"date": "2026-06-20", "kg": 66.0, "fat": 12.5}]


def test_hrv_and_sleep_transforms() -> None:
    points = transform.hrv_to_points([HRV_DAY, HRV_DAY])
    assert points[0] == {"i": 0, "v": 70, "base": 60}
    night = transform.sleep_to_night(SLEEP_DAY)
    assert night is not None
    assert night["deep"] == 1.5 and night["score"] == 82
    assert transform.sleep_to_night({}) is None  # no sleep → skipped


def test_training_load_series_and_today() -> None:
    activities = [
        {"date": "2026-06-18", "load": 100},
        {"date": "2026-06-19", "load": 120},
        {"date": "2026-06-20", "load": 140},
    ]
    pmc, fitness = transform.training_load_series(activities, days=42)
    assert len(pmc) >= 3
    assert fitness["weekLoad"] == 360
    assert all({"i", "ctl", "atl", "tsb", "load"} <= set(p) for p in pmc)
    today = transform.build_today(fitness, [{"i": 0, "v": 70, "base": 60}], [], 48)
    assert today["rhr"] == 48 and today["hrv"] == 70 and today["weekLoad"] == 360


def test_empty_apexdata_has_full_shape() -> None:
    skel = transform.empty_apexdata()
    for key in ("profile", "today", "pmc", "activities", "library", "calendarEvents"):
        assert key in skel
    assert skel["pmc"] == [] and skel["today"]["readiness"] == 0


# --- sync flow with a fake client --------------------------------------------


class FakeClient:
    """Stand-in for GarminCNClient: returns canned payloads, records nothing."""

    account = "linyue"

    def fetch_social_profile(self) -> dict[str, Any]:
        return SOCIAL

    def fetch_personal_info(self) -> dict[str, Any]:
        return PERSONAL

    def fetch_weight(self, start: str, end: str) -> dict[str, Any]:
        return WEIGHT

    def fetch_activities(self, limit: int = 30, start: int = 0) -> list[dict[str, Any]]:
        return [ACTIVITY]

    def fetch_hrv(self, day: str) -> dict[str, Any]:
        return HRV_DAY if day == "2026-06-20" else {}

    def fetch_sleep(self, day: str) -> dict[str, Any]:
        return SLEEP_DAY if day == "2026-06-20" else {}

    def fetch_daily_summary(self, day: str) -> dict[str, Any]:
        return SUMMARY

    def dump(self) -> str:
        return "fake-token"

    def load(self, token: str) -> None:  # pragma: no cover - not used here
        pass


def _isolated_session():
    """A fresh in-memory DB with its own engine — independent of the app global
    so these tests never pollute (or depend on) the shared API fixture state."""
    import app.models  # noqa: F401 — register models on Base
    from app.database import Base
    from app.seed import seed_if_empty
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.pool import StaticPool

    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    seed_if_empty(db)
    return db, Session


def test_sync_account_persists_real_data() -> None:
    db, _ = _isolated_session()
    summary = sync_account(FakeClient(), db, "garmin-cn", days=42, today=date(2026, 6, 20))
    assert summary["activities"] == 1
    assert summary["hrv"] == 1
    assert summary["sleep"] == 1
    assert summary["weight"] == 1

    from app.services import bootstrap

    data = bootstrap(db)
    assert data["activities"][0]["sport"] == "跑步"
    assert data["weightLog"][0]["kg"] == 66.0
    assert data["today"]["rhr"] == 48
    assert data["profile"]["name"] == "林越"  # Garmin overwrote the empty name
    db.close()


def test_connect_endpoint_with_body_creds(monkeypatch: pytest.MonkeyPatch) -> None:
    """POST /connect with a fake client logs in, syncs, flips connector status."""
    import app.routers.garmin as gr
    from app.database import get_db
    from app.main import create_app

    class NoNetClient(FakeClient):
        def __init__(self, domain: str = "garmin.cn") -> None:
            pass

        def login(self, email: str, password: str) -> None:
            pass

    monkeypatch.setattr(gr, "GarminCNClient", NoNetClient)

    db, Session = _isolated_session()
    app = create_app()
    app.dependency_overrides[get_db] = lambda: Session()

    # Bypass lifespan seeding (which would hit the global engine); seed already done.
    client = TestClient(app)
    r = client.post("/api/garmin/connect", json={"email": "a@b.cn", "password": "x"})
    assert r.status_code == 200
    body = r.json()
    assert body["connected"] is True
    assert body["activities"] == 1
    assert client.get("/api/garmin/status").json()["connected"] is True
    assert client.get("/api/connectors/garmin-cn").json()["status"] == "connected"
    assert client.get("/api/bootstrap").json()["activities"][0]["sport"] == "跑步"
    db.close()
