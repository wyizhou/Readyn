"""API contract tests against the real-data backend (empty until a Garmin sync)."""

from __future__ import annotations

from fastapi.testclient import TestClient

BOOTSTRAP_KEYS = {
    "profile", "weightLog", "today", "pmc", "templateDetails", "metrics",
    "activityDetails", "hrv", "sleep", "hrZones", "disciplineSplit", "balance",
    "boulderPyramid", "activities", "insights", "plan", "workout",
    "connectors", "schema", "library", "calendar", "calendarEvents",
    "unlinked", "linkTargets",
}


def test_health(client: TestClient) -> None:
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_accounts_and_login(client: TestClient) -> None:
    # Auth scaffold (README §12) — unchanged by the mock-data removal.
    accounts = client.get("/api/accounts").json()
    assert len(accounts) == 3
    r = client.post("/api/auth/login", json={"accountId": "linyue", "password": "x"})
    assert r.status_code == 200
    assert r.json()["token"].startswith("dev-token-")


def test_bootstrap_shape_is_complete_but_empty(client: TestClient) -> None:
    data = client.get("/api/bootstrap").json()
    # Every key the frontend reads must exist (so empty states render)...
    assert set(data.keys()) == BOOTSTRAP_KEYS
    # ...but there is no fabricated data in it before a Garmin sync.
    assert data["profile"]["handle"] == ""
    assert data["pmc"] == []
    assert data["hrv"] == []
    assert data["weightLog"] == []
    assert data["activities"] == []
    assert data["today"]["readiness"] == 0


def test_profile_get_and_update(client: TestClient) -> None:
    profile = client.get("/api/profile").json()
    assert profile["name"] == ""  # empty until Garmin/personal edit
    profile["goal"] = "100km 越野完赛"
    r = client.put("/api/profile", json=profile)
    assert r.status_code == 200
    assert client.get("/api/profile").json()["goal"] == "100km 越野完赛"


def test_weight_add_and_upsert(client: TestClient) -> None:
    before = client.get("/api/weight").json()
    n = len(before)
    r = client.post("/api/weight", json={"date": "2026-06-21", "kg": 65.5, "fat": 12.2})
    assert r.status_code == 200
    log = r.json()
    assert len(log) == n + 1
    assert log[0]["date"] == "2026-06-21"  # newest first
    r2 = client.post("/api/weight", json={"date": "2026-06-21", "kg": 64.9})
    log2 = r2.json()
    assert len(log2) == n + 1
    assert log2[0]["kg"] == 64.9


def test_dashboard_bundle_keys_present(client: TestClient) -> None:
    d = client.get("/api/dashboard").json()
    assert d["today"]["readiness"] == 0
    assert {"pmc", "hrv", "sleep", "insights", "activities"} <= set(d.keys())


def test_unknown_ids_are_404(client: TestClient) -> None:
    assert client.get("/api/metrics/hrv").status_code == 404
    assert client.get("/api/activities/a1").status_code == 404
    assert client.get("/api/templates/r1").status_code == 404
    assert client.get("/api/plans/p1").status_code == 404


def test_training_and_library_empty(client: TestClient) -> None:
    t = client.get("/api/training").json()
    assert t["plan"]["compliance"] == 0
    assert {"workout", "calendar", "calendarEvents", "unlinked", "linkTargets"} <= set(t.keys())
    lib = client.get("/api/library").json()
    assert lib["running"] == [] and lib["climbing"] == [] and lib["plans"] == []


def test_connectors_registry_and_config(client: TestClient) -> None:
    conns = client.get("/api/connectors").json()
    assert any(c["id"] == "garmin-cn" for c in conns)
    r = client.put(
        "/api/connectors/garmin-cn/config",
        json={"auto": True, "frequency": "15min", "conflict": "newest", "backfill": False},
    )
    assert r.status_code == 200
    assert r.json()["config"]["frequency"] == "15min"
    assert client.get("/api/connectors/garmin-cn").json()["config"]["auto"] is True
    assert client.get("/api/connectors/nope").status_code == 404


def test_schema_empty(client: TestClient) -> None:
    assert client.get("/api/schema").json() == []


def test_settings_defaults_get(client: TestClient) -> None:
    s = client.get("/api/settings").json()
    assert s["units"]["distance"] == "公里 (km)"
    assert s["theme"]["mode"] == "dark"


def test_settings_partial_update_merges_and_persists(client: TestClient) -> None:
    r = client.put("/api/settings", json={"notifications": {"weeklySummary": True}})
    assert r.status_code == 200
    saved = r.json()
    assert saved["notifications"]["weeklySummary"] is True
    assert saved["notifications"]["todayWorkout"] is True  # untouched default kept
    assert client.get("/api/settings").json()["notifications"]["weeklySummary"] is True


def test_settings_not_in_bootstrap(client: TestClient) -> None:
    client.put("/api/settings", json={"theme": {"density": "紧凑"}})
    assert set(client.get("/api/bootstrap").json().keys()) == BOOTSTRAP_KEYS


def test_ai_endpoints_are_not_configured(client: TestClient) -> None:
    body = {"messages": [{"role": "user", "content": "今天练什么"}]}
    chat = client.post("/api/ai/chat", json=body)
    assert chat.status_code == 200
    assert "尚未接入" in chat.json()["content"]  # honest "not configured", no fabricated data
    plan = client.post("/api/ai/plan", json={"goal": "50km 越野完赛"})
    assert plan.json()["weeks"] == 0
    assert client.get("/api/ai/insights").json() == []


def test_garmin_status_disconnected(client: TestClient) -> None:
    s = client.get("/api/garmin/status").json()
    assert s["connectorId"] == "garmin-cn"
    assert s["connected"] is False
    assert "configured" in s


def test_garmin_connect_requires_credentials(client: TestClient) -> None:
    # No .env creds in the test env and an empty body → 400 with a clear message.
    r = client.post("/api/garmin/connect", json={})
    assert r.status_code == 400
    assert "凭证" in r.json()["detail"]


def test_garmin_sync_requires_connection(client: TestClient) -> None:
    r = client.post("/api/garmin/sync")
    assert r.status_code == 409
