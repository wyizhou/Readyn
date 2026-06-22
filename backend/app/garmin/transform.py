"""Pure transforms: Garmin Connect JSON → README §7 ApexData shapes.

No network here — every function takes plain dicts/lists (what
:class:`~app.garmin.client.GarminCNClient` returns) so they are trivially unit
tested. Missing fields degrade to sensible empties rather than raising, because
Garmin omits keys for days/accounts with no data.
"""

from __future__ import annotations

import math
from typing import Any

# Garmin activityType.typeKey → (display sport, icon, canonical bucket)
_SPORT_MAP: dict[str, tuple[str, str]] = {
    "running": ("跑步", "run"),
    "trail_running": ("越野跑", "run"),
    "treadmill_running": ("跑步机", "run"),
    "cycling": ("骑行", "bike"),
    "road_biking": ("公路骑行", "bike"),
    "mountain_biking": ("山地骑行", "bike"),
    "lap_swimming": ("游泳", "swim"),
    "open_water_swimming": ("公开水域", "swim"),
    "hiking": ("徒步", "hike"),
    "mountaineering": ("登山", "hike"),
    "rock_climbing": ("攀岩", "climb"),
    "bouldering": ("抱石", "climb"),
    "indoor_climbing": ("室内攀岩", "climb"),
    "strength_training": ("力量", "strength"),
    "walking": ("步行", "walk"),
}


def _sport(type_key: str) -> tuple[str, str]:
    return _SPORT_MAP.get(type_key, (type_key.replace("_", " ") or "活动", "activity"))


def _round(value: Any, ndigits: int = 0) -> float | int:
    try:
        r = round(float(value), ndigits)
        return int(r) if ndigits == 0 else r
    except (TypeError, ValueError):
        return 0


def _fmt_distance(meters: Any) -> str:
    try:
        km = float(meters) / 1000.0
    except (TypeError, ValueError):
        return "—"
    return f"{km:.1f} km" if km >= 0.05 else "—"


def _fmt_duration(seconds: Any) -> str:
    try:
        s = int(float(seconds))
    except (TypeError, ValueError):
        return "—"
    h, rem = divmod(s, 3600)
    m, _ = divmod(rem, 60)
    return f"{h}:{m:02d}" if h else f"{m} 分钟"


# --- individual sources --------------------------------------------------


def activity_to_summary(raw: dict[str, Any]) -> dict[str, Any]:
    """activitylist-service entry → ApexData ``Activity``."""
    type_key = (raw.get("activityType") or {}).get("typeKey", "")
    sport, icon = _sport(type_key)
    load = _round(raw.get("activityTrainingLoad"))
    avg_hr = _round(raw.get("averageHR"))
    start = (raw.get("startTimeLocal") or "")[:10]
    return {
        "id": str(raw.get("activityId", "")),
        "name": raw.get("activityName") or sport,
        "sport": sport,
        "icon": icon,
        "date": start,
        "dist": _fmt_distance(raw.get("distance")),
        "dur": _fmt_duration(raw.get("duration")),
        "load": load,
        "hr": avg_hr,
        "flag": "high" if load >= 130 else "ok",
        "note": "",
    }


def activities_to_summaries(raws: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [activity_to_summary(a) for a in raws]


def weight_to_log(raw: dict[str, Any]) -> list[dict[str, Any]]:
    """weight-service dateRange → ApexData ``WeightEntry[]`` (newest first)."""
    out: list[dict[str, Any]] = []
    for entry in raw.get("dateWeightList", []) or []:
        grams = entry.get("weight")
        if grams is None:
            continue
        item: dict[str, Any] = {
            "date": (entry.get("calendarDate") or entry.get("date") or "")[:10],
            "kg": _round(float(grams) / 1000.0, 1),
        }
        if entry.get("bodyFat") is not None:
            item["fat"] = _round(entry.get("bodyFat"), 1)
        out.append(item)
    out.sort(key=lambda e: e["date"], reverse=True)
    return out


def hrv_to_points(raws: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """A list of daily hrv-service payloads → ApexData ``HrvPoint[]``."""
    points: list[dict[str, Any]] = []
    for i, day in enumerate(raws):
        summary = day.get("hrvSummary") or {}
        baseline = summary.get("baseline") or {}
        last = summary.get("lastNightAvg")
        if last is None:
            continue
        base = baseline.get("balancedLow") or baseline.get("balancedUpper") or last
        points.append({"i": i, "v": _round(last), "base": _round(base)})
    return points


def sleep_to_night(raw: dict[str, Any]) -> dict[str, Any] | None:
    """dailySleepData payload → ApexData ``SleepNight`` (or None if empty)."""
    dto = raw.get("dailySleepDTO") or {}
    if not dto.get("sleepTimeSeconds"):
        return None
    to_h = lambda s: _round((s or 0) / 3600.0, 1)  # noqa: E731
    scores = dto.get("sleepScores") or {}
    overall = (scores.get("overall") or {}).get("value")
    return {
        "d": (dto.get("calendarDate") or "")[5:],
        "deep": to_h(dto.get("deepSleepSeconds")),
        "rem": to_h(dto.get("remSleepSeconds")),
        "light": to_h(dto.get("lightSleepSeconds")),
        "awake": to_h(dto.get("awakeSleepSeconds")),
        "score": _round(overall),
    }


_GENDER = {"MALE": "男", "FEMALE": "女"}


def social_to_profile(social: dict[str, Any], personal: dict[str, Any]) -> dict[str, Any]:
    """Merge social + personal-information payloads → ApexData ``Profile`` core.

    Note: ``restingHR`` is *not* set here — Garmin keeps it in the daily summary,
    so :mod:`app.garmin.sync` fills it from there. Max HR is not stored in the
    profile either; we use the age-based estimate (220 − age).
    """
    bio = personal.get("biometricProfile") or {}
    user_info = personal.get("userInfo") or {}
    age = user_info.get("age")
    gender = (user_info.get("genderType") or "").upper()
    return {
        "name": social.get("fullName") or social.get("displayName") or "",
        "handle": social.get("userName") or "",
        "location": social.get("location") or "",
        "height": _round(bio.get("height")),
        "sex": _GENDER.get(gender, ""),
        "birth": user_info.get("birthDate") or "",
        "maxHR": _round(220 - age) if age else 0,
    }


def readiness_from_payload(payload: Any) -> int:
    """Garmin Training Readiness payload → today's readiness score (0–100)."""
    if isinstance(payload, list) and payload:
        return _round(payload[0].get("score"))
    if isinstance(payload, dict):
        return _round(payload.get("score"))
    return 0


# --- training-load model (CTL/ATL/TSB) -----------------------------------


def training_load_series(
    activities: list[dict[str, Any]], days: int = 42
) -> tuple[list[dict[str, Any]], dict[str, float]]:
    """Compute a PMC series + today's fitness/fatigue from activity loads.

    CTL = 42-day and ATL = 7-day exponentially weighted load; TSB = CTL−ATL.
    Returns ``(pmc_points, {ctl, atl, tsb, weekLoad, acwr})``. Activities are
    expected newest-first with ``date`` (YYYY-MM-DD) and numeric ``load``.
    """
    if not activities:
        return [], {"ctl": 0, "atl": 0, "tsb": 0, "weekLoad": 0, "acwr": 0}

    by_day: dict[str, float] = {}
    for a in activities:
        d = a.get("date")
        if d:
            by_day[d] = by_day.get(d, 0.0) + float(a.get("load") or 0)

    ordered_days = sorted(by_day)
    start, end = ordered_days[0], ordered_days[-1]
    from datetime import date, timedelta

    def _parse(s: str) -> date:
        y, m, dd = (int(x) for x in s.split("-"))
        return date(y, m, dd)

    span = (_parse(end) - _parse(start)).days + 1
    span = max(1, min(span, 365))

    ctl_k = 1 - math.exp(-1 / 42)
    atl_k = 1 - math.exp(-1 / 7)
    ctl = atl = 0.0
    points: list[dict[str, Any]] = []
    cur = _parse(start)
    week_load = 0.0
    last_loads: list[float] = []
    for i in range(span):
        key = cur.isoformat()
        load = by_day.get(key, 0.0)
        ctl = ctl + ctl_k * (load - ctl)
        atl = atl + atl_k * (load - atl)
        last_loads.append(load)
        points.append(
            {
                "i": i,
                "ctl": _round(ctl, 1),
                "atl": _round(atl, 1),
                "tsb": _round(ctl - atl, 1),
                "load": _round(load),
            }
        )
        cur = cur + timedelta(days=1)

    week_load = sum(last_loads[-7:])
    prev_week = sum(last_loads[-28:-7]) / 3 if len(last_loads) >= 28 else week_load
    acwr = round(week_load / prev_week, 2) if prev_week else 0.0
    tail = points[-1] if points else {"ctl": 0, "atl": 0, "tsb": 0}
    return points, {
        "ctl": tail["ctl"],
        "atl": tail["atl"],
        "tsb": tail["tsb"],
        "weekLoad": _round(week_load),
        "acwr": acwr,
    }


def build_today(
    fitness: dict[str, float],
    hrv_points: list[dict[str, Any]],
    sleep_nights: list[dict[str, Any]],
    resting_hr: int,
    readiness: int = 0,
) -> dict[str, Any]:
    """Assemble the dashboard ``Today`` block from already-transformed pieces."""
    hrv = hrv_points[-1]["v"] if hrv_points else 0
    hrv_base = hrv_points[-1]["base"] if hrv_points else 0
    last_sleep = sleep_nights[-1] if sleep_nights else {}
    sleep_h = (
        round(
            sum(last_sleep.get(k, 0) for k in ("deep", "rem", "light")),
            1,
        )
        if last_sleep
        else 0
    )
    acwr = fitness.get("acwr", 0)
    tsb = fitness.get("tsb", 0)
    state = "fresh" if tsb > 5 else "strained" if tsb < -15 else "balanced"
    return {
        "readiness": readiness,  # Garmin Training Readiness score (0 if unavailable)
        "hrv": hrv,
        "hrvDelta": _round(hrv - hrv_base),
        "rhr": resting_hr,
        "rhrDelta": 0,
        "sleep": sleep_h,
        "sleepScore": last_sleep.get("score", 0),
        "acwr": acwr,
        "ctl": fitness.get("ctl", 0),
        "atl": fitness.get("atl", 0),
        "tsb": tsb,
        "weekLoad": fitness.get("weekLoad", 0),
        "weekLoadDelta": 0,
        "recoveryState": state,
        "strain": 0,
    }


# --- empty skeleton ------------------------------------------------------

# Default profile fields that Garmin does not supply (kept editable client-side).
_PROFILE_DEFAULTS: dict[str, Any] = {
    "name": "",
    "handle": "",
    "role": "",
    "disciplines": [],
    "location": "",
    "since": "",
    "sex": "",
    "birth": "",
    "height": 0,
    "restingHR": 0,
    "maxHR": 0,
    "goal": "",
    "targetWeight": 0,
    "aiProvider": "",
    "aiBase": "",
    "aiKey": "",
    "aiModel": "",
}

_EMPTY_TODAY: dict[str, Any] = {
    "readiness": 0, "hrv": 0, "hrvDelta": 0, "rhr": 0, "rhrDelta": 0,
    "sleep": 0, "sleepScore": 0, "acwr": 0, "ctl": 0, "atl": 0, "tsb": 0,
    "weekLoad": 0, "weekLoadDelta": 0, "recoveryState": "balanced", "strain": 0,
}

_EMPTY_PLAN: dict[str, Any] = {"week": "", "focus": "", "compliance": 0, "days": []}
_EMPTY_WORKOUT: dict[str, Any] = {
    "title": "", "sport": "", "when": "", "target": "", "load": 0,
    "duration": "", "rationale": "", "steps": [],
}
_EMPTY_LIBRARY: dict[str, Any] = {"running": [], "climbing": [], "plans": []}


def empty_apexdata() -> dict[str, Any]:
    """A structurally-complete ApexData payload with no data in it.

    Replaces the old mock seed: every key the frontend reads exists with an
    empty/zero value, so the UI renders honest empty states before any Garmin
    sync (and for data Garmin cannot provide).
    """
    return {
        "profile": dict(_PROFILE_DEFAULTS),
        "weightLog": [],
        "today": dict(_EMPTY_TODAY),
        "pmc": [],
        "templateDetails": {},
        "metrics": {},
        "activityDetails": {},
        "hrv": [],
        "sleep": [],
        "hrZones": [],
        "disciplineSplit": [],
        "balance": [],
        "boulderPyramid": [],
        "activities": [],
        "insights": [],
        "plan": dict(_EMPTY_PLAN),
        "workout": dict(_EMPTY_WORKOUT),
        "schema": [],
        "library": dict(_EMPTY_LIBRARY),
        "calendar": [],
        "calendarEvents": {},
        "unlinked": [],
        "linkTargets": [],
    }
