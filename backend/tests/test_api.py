"""API contract tests."""

from __future__ import annotations

from fastapi.testclient import TestClient

BOOTSTRAP_KEYS = {
    "profile", "weightLog", "today", "pmc", "templateDetails", "metrics",
    "activityDetails", "hrv", "sleep", "hrZones", "disciplineSplit", "balance",
    "boulderPyramid", "heatmap", "activities", "insights", "plan", "workout",
    "connectors", "schema", "library", "calendar", "calendarEvents",
    "unlinked", "linkTargets",
}


def test_health(client: TestClient) -> None:
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_accounts_and_login(client: TestClient) -> None:
    accounts = client.get("/api/accounts").json()
    assert len(accounts) == 3
    assert accounts[0]["id"] == "linyue"
    r = client.post("/api/auth/login", json={"accountId": "linyue", "password": "x"})
    assert r.status_code == 200
    body = r.json()
    assert body["accountId"] == "linyue"
    assert body["token"].startswith("dev-token-")


def test_bootstrap_has_all_keys(client: TestClient) -> None:
    data = client.get("/api/bootstrap").json()
    assert set(data.keys()) == BOOTSTRAP_KEYS
    assert data["profile"]["handle"] == "@linyue"
    assert len(data["pmc"]) == 42
    assert len(data["hrv"]) == 28
    assert len(data["heatmap"]) == 91
    # weight log is newest-first
    dates = [w["date"] for w in data["weightLog"]]
    assert dates == sorted(dates, reverse=True)


def test_profile_get_and_update(client: TestClient) -> None:
    profile = client.get("/api/profile").json()
    assert profile["name"] == "林 越"
    profile["goal"] = "100km 越野完赛"
    r = client.put("/api/profile", json=profile)
    assert r.status_code == 200
    assert r.json()["goal"] == "100km 越野完赛"
    assert client.get("/api/profile").json()["goal"] == "100km 越野完赛"


def test_weight_add_and_upsert(client: TestClient) -> None:
    before = client.get("/api/weight").json()
    n = len(before)
    # add a new, most-recent entry
    r = client.post("/api/weight", json={"date": "2026-06-21", "kg": 65.5, "fat": 12.2})
    assert r.status_code == 200
    log = r.json()
    assert len(log) == n + 1
    assert log[0]["date"] == "2026-06-21"  # newest first
    assert log[0]["kg"] == 65.5
    # upsert same date -> count unchanged, value updated
    r2 = client.post("/api/weight", json={"date": "2026-06-21", "kg": 64.9})
    log2 = r2.json()
    assert len(log2) == n + 1
    assert log2[0]["kg"] == 64.9


def test_dashboard_bundle(client: TestClient) -> None:
    d = client.get("/api/dashboard").json()
    assert d["today"]["readiness"] == 78
    assert {"pmc", "hrv", "sleep", "insights", "activities"} <= set(d.keys())


def test_metric_detail(client: TestClient) -> None:
    assert client.get("/api/metrics/hrv").json()["short"] == "HRV"
    assert client.get("/api/metrics/nope").status_code == 404


def test_activity_detail_merges_summary(client: TestClient) -> None:
    a = client.get("/api/activities/a1").json()
    assert a["name"] == "阈值间歇 6×1km"  # summary field
    assert a["device"] == "Garmin Forerunner 965"  # detail field
    assert client.get("/api/activities/zzz").status_code == 404


def test_training_bundle(client: TestClient) -> None:
    t = client.get("/api/training").json()
    assert t["plan"]["compliance"] == 86
    assert {"workout", "calendar", "calendarEvents", "unlinked", "linkTargets"} <= set(t.keys())


def test_library_and_template_and_plan(client: TestClient) -> None:
    lib = client.get("/api/library").json()
    assert len(lib["running"]) == 6
    tpl = client.get("/api/templates/r1").json()
    assert tpl["name"] == "阈值间歇 6×1km"
    assert "structure" in tpl  # merged from templateDetails
    plan = client.get("/api/plans/p1").json()
    assert plan["source"] == "AI"
    assert client.get("/api/templates/nope").status_code == 404


def test_connectors_and_config(client: TestClient) -> None:
    conns = client.get("/api/connectors").json()
    assert any(c["id"] == "garmin" for c in conns)
    r = client.put(
        "/api/connectors/garmin/config",
        json={"auto": True, "frequency": "15min", "conflict": "newest", "backfill": False},
    )
    assert r.status_code == 200
    assert r.json()["config"]["frequency"] == "15min"
    assert client.get("/api/connectors/garmin").json()["config"]["auto"] is True
    assert client.get("/api/connectors/nope").status_code == 404


def test_schema(client: TestClient) -> None:
    rows = client.get("/api/schema").json()
    assert any(r["canonical"] == "activity.load" for r in rows)


def test_ai_endpoints(client: TestClient) -> None:
    body = {"messages": [{"role": "user", "content": "今天练什么"}]}
    chat = client.post("/api/ai/chat", json=body)
    assert chat.status_code == 200
    assert "今天练什么" in chat.json()["content"]

    plan = client.post("/api/ai/plan", json={"goal": "50km 越野完赛"})
    assert plan.json()["source"] == "AI"

    assert len(client.get("/api/ai/insights").json()) == 3

    review = client.post("/api/ai/session-review", json={"activityId": "a1"})
    assert review.json()["verdict"] == "达标"

    insight = client.post("/api/ai/metric-insight", json={"metricId": "acwr"})
    assert "tags" in insight.json()
