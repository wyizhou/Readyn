"""Pydantic request/response schemas (subset — the mutable contracts).

Field names intentionally mirror the frontend's camelCase contract (README §7)
so payloads round-trip without translation.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class ProfileSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    handle: str
    role: str
    disciplines: list[str]
    location: str
    since: str
    sex: str
    birth: str
    height: int
    restingHR: int
    maxHR: int
    goal: str
    targetWeight: float
    aiProvider: str
    aiBase: str
    aiKey: str
    aiModel: str


class WeightEntrySchema(BaseModel):
    date: str
    kg: float
    fat: float | None = None
    note: str | None = None


class Account(BaseModel):
    id: str
    name: str
    handle: str
    role: str
    initial: str


class LoginRequest(BaseModel):
    accountId: str
    password: str | None = None


class LoginResponse(BaseModel):
    token: str
    accountId: str


class ConnectorConfig(BaseModel):
    auto: bool | None = None
    frequency: str | None = None
    conflict: str | None = None
    backfill: bool | None = None
    mapping: dict[str, bool] | None = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    context: dict | None = None


class ChatResponse(BaseModel):
    role: str = "assistant"
    content: str


class PlanRequest(BaseModel):
    goal: str
    dialogue: list[ChatMessage] | None = None


class MetricInsightRequest(BaseModel):
    metricId: str


class SessionReviewRequest(BaseModel):
    activityId: str
