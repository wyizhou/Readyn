"""Read/aggregate helpers over the persisted data."""

from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Connector, Dataset, Profile, WeightEntry


def get_profile(db: Session) -> dict[str, Any]:
    profile = db.get(Profile, 1)
    if profile is None:
        raise KeyError("profile")
    return profile.as_dict()


def get_weight_log(db: Session) -> list[dict[str, Any]]:
    rows = db.scalars(select(WeightEntry).order_by(WeightEntry.date.desc())).all()
    return [r.as_dict() for r in rows]


def get_connectors(db: Session) -> list[dict[str, Any]]:
    rows = db.scalars(select(Connector)).all()
    return [r.as_dict() for r in rows]


def get_dataset(db: Session, key: str) -> Any:
    row = db.get(Dataset, key)
    if row is None:
        raise KeyError(key)
    return row.value


def bootstrap(db: Session) -> dict[str, Any]:
    """Assemble the full ApexData payload the frontend loads on startup."""
    data: dict[str, Any] = {
        "profile": get_profile(db),
        "weightLog": get_weight_log(db),
        "connectors": get_connectors(db),
    }
    for row in db.scalars(select(Dataset)).all():
        data[row.key] = row.value
    return data


# --- AI (canned responses; swap for a real model per README §10) ---

def chat_reply(messages: list[dict[str, Any]]) -> str:
    last = messages[-1]["content"] if messages else ""
    return (
        "结合你近 14 天的数据（就绪度 78、HRV 71ms 高于基线、周负荷 612 AU、ACWR 1.18），"
        f"关于「{last}」我的建议是：当前身体对有氧块适应良好、可承接强度，但 ACWR 接近 1.3 风险线，"
        "本周末把长距离爬升控制在 130 AU 内，并保证周四主动恢复质量。"
    )


def generate_plan(goal: str) -> dict[str, Any]:
    return {
        "name": f"AI 生成 · {goal}",
        "goal": goal,
        "weeks": 4,
        "load": 1980,
        "sessions": 22,
        "sports": ["跑步", "抱石", "登山"],
        "updated": "刚刚",
        "source": "AI",
    }


def metric_insight(metric: dict[str, Any]) -> dict[str, Any]:
    return metric.get("ai", {"text": "", "tags": []})
