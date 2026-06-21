"""AI integration points (README §10). Canned responses for now — swap for a
real model using the user's configured provider/key."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import services
from ..database import get_db
from ..schemas import (
    ChatRequest,
    ChatResponse,
    MetricInsightRequest,
    PlanRequest,
    SessionReviewRequest,
)

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    return ChatResponse(content=services.chat_reply([m.model_dump() for m in req.messages]))


@router.post("/plan")
def plan(req: PlanRequest) -> dict[str, Any]:
    return services.generate_plan(req.goal)


@router.get("/insights")
def insights(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    try:
        return services.get_dataset(db, "insights")
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="insights not found") from exc


@router.post("/session-review")
def session_review(req: SessionReviewRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    try:
        details = services.get_dataset(db, "activityDetails")
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="activityDetails not found") from exc
    detail = details.get(req.activityId)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"activity '{req.activityId}' not found")
    return detail.get("ai", {})


@router.post("/metric-insight")
def metric_insight(req: MetricInsightRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    try:
        metrics = services.get_dataset(db, "metrics")
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="metrics not found") from exc
    metric = metrics.get(req.metricId)
    if metric is None:
        raise HTTPException(status_code=404, detail=f"metric '{req.metricId}' not found")
    return services.metric_insight(metric)
