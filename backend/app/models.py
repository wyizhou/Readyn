"""ORM models.

The genuinely mutable / first-class entities (profile, weight log, connectors)
are modelled as dedicated tables. The analytical & reference payloads from
README §7 (PMC, HRV, sleep, metrics, plan, calendar, …) are persisted in a
key/value ``datasets`` table as JSON — still durable in SQLite, seeded once.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import JSON, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Profile(Base):
    __tablename__ = "profile"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    name: Mapped[str] = mapped_column(String)
    handle: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String)
    disciplines: Mapped[list[str]] = mapped_column(JSON)
    location: Mapped[str] = mapped_column(String)
    since: Mapped[str] = mapped_column(String)
    sex: Mapped[str] = mapped_column(String)
    birth: Mapped[str] = mapped_column(String)
    height: Mapped[int] = mapped_column(Integer)
    restingHR: Mapped[int] = mapped_column(Integer)
    maxHR: Mapped[int] = mapped_column(Integer)
    goal: Mapped[str] = mapped_column(String)
    targetWeight: Mapped[float] = mapped_column(Float)
    aiProvider: Mapped[str] = mapped_column(String)
    aiBase: Mapped[str] = mapped_column(String)
    aiKey: Mapped[str] = mapped_column(String)
    aiModel: Mapped[str] = mapped_column(String)

    def as_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "handle": self.handle,
            "role": self.role,
            "disciplines": self.disciplines,
            "location": self.location,
            "since": self.since,
            "sex": self.sex,
            "birth": self.birth,
            "height": self.height,
            "restingHR": self.restingHR,
            "maxHR": self.maxHR,
            "goal": self.goal,
            "targetWeight": self.targetWeight,
            "aiProvider": self.aiProvider,
            "aiBase": self.aiBase,
            "aiKey": self.aiKey,
            "aiModel": self.aiModel,
        }


class WeightEntry(Base):
    __tablename__ = "weight_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    date: Mapped[str] = mapped_column(String, unique=True, index=True)
    kg: Mapped[float] = mapped_column(Float)
    fat: Mapped[float | None] = mapped_column(Float, nullable=True)
    note: Mapped[str | None] = mapped_column(String, nullable=True)

    def as_dict(self) -> dict[str, Any]:
        d: dict[str, Any] = {"date": self.date, "kg": self.kg}
        if self.fat is not None:
            d["fat"] = self.fat
        if self.note is not None:
            d["note"] = self.note
        return d


class Connector(Base):
    __tablename__ = "connectors"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    cat: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    icon: Mapped[str] = mapped_column(String)
    color: Mapped[str] = mapped_column(String)
    sync: Mapped[str] = mapped_column(String)
    metrics: Mapped[list[str]] = mapped_column(JSON)
    records: Mapped[str] = mapped_column(String)
    config: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    def as_dict(self) -> dict[str, Any]:
        d: dict[str, Any] = {
            "id": self.id,
            "name": self.name,
            "cat": self.cat,
            "status": self.status,
            "icon": self.icon,
            "color": self.color,
            "sync": self.sync,
            "metrics": self.metrics,
            "records": self.records,
        }
        if self.config is not None:
            d["config"] = self.config
        return d


class Dataset(Base):
    """Key/value store for the seeded analytical & reference payloads."""

    __tablename__ = "datasets"

    key: Mapped[str] = mapped_column(String, primary_key=True)
    value: Mapped[Any] = mapped_column(JSON)
