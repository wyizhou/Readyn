"""Analytical & catalog endpoints (README §7, §9)."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import services
from ..database import get_db
from ..models import Connector
from ..schemas import ConnectorConfig

router = APIRouter(prefix="/api", tags=["data"])


def _dataset(db: Session, key: str) -> Any:
    try:
        return services.get_dataset(db, key)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=f"dataset '{key}' not found") from exc


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)) -> dict[str, Any]:
    """Bundle the dashboard needs (readiness, PMC, recovery, structure, activities)."""
    return {
        "today": _dataset(db, "today"),
        "pmc": _dataset(db, "pmc"),
        "hrv": _dataset(db, "hrv"),
        "sleep": _dataset(db, "sleep"),
        "hrZones": _dataset(db, "hrZones"),
        "disciplineSplit": _dataset(db, "disciplineSplit"),
        "balance": _dataset(db, "balance"),
        "boulderPyramid": _dataset(db, "boulderPyramid"),
        "insights": _dataset(db, "insights"),
        "activities": _dataset(db, "activities"),
    }


@router.get("/metrics")
def metrics(db: Session = Depends(get_db)) -> dict[str, Any]:
    return _dataset(db, "metrics")


@router.get("/metrics/{metric_id}")
def metric(metric_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    all_metrics = _dataset(db, "metrics")
    if metric_id not in all_metrics:
        raise HTTPException(status_code=404, detail=f"metric '{metric_id}' not found")
    return all_metrics[metric_id]


@router.get("/activities")
def activities(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    return _dataset(db, "activities")


@router.get("/activities/{activity_id}")
def activity(activity_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    summary = next((a for a in _dataset(db, "activities") if a["id"] == activity_id), None)
    if summary is None:
        raise HTTPException(status_code=404, detail=f"activity '{activity_id}' not found")
    detail = _dataset(db, "activityDetails").get(activity_id, {})
    return {**summary, **detail}


@router.get("/training")
def training(db: Session = Depends(get_db)) -> dict[str, Any]:
    return {
        "plan": _dataset(db, "plan"),
        "workout": _dataset(db, "workout"),
        "calendar": _dataset(db, "calendar"),
        "calendarEvents": _dataset(db, "calendarEvents"),
        "unlinked": _dataset(db, "unlinked"),
        "linkTargets": _dataset(db, "linkTargets"),
    }


@router.get("/library")
def library(db: Session = Depends(get_db)) -> dict[str, Any]:
    return _dataset(db, "library")


@router.get("/templates/{template_id}")
def template(template_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    lib = _dataset(db, "library")
    tpl = next(
        (t for t in [*lib["running"], *lib["climbing"]] if t["id"] == template_id),
        None,
    )
    if tpl is None:
        raise HTTPException(status_code=404, detail=f"template '{template_id}' not found")
    detail = _dataset(db, "templateDetails").get(template_id, {})
    return {**tpl, **detail}


@router.get("/plans/{plan_id}")
def plan(plan_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    lib = _dataset(db, "library")
    found = next((p for p in lib["plans"] if p["id"] == plan_id), None)
    if found is None:
        raise HTTPException(status_code=404, detail=f"plan '{plan_id}' not found")
    return found


@router.get("/connectors")
def connectors(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    return services.get_connectors(db)


@router.get("/connectors/{connector_id}")
def connector(connector_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    found = db.get(Connector, connector_id)
    if found is None:
        raise HTTPException(status_code=404, detail=f"connector '{connector_id}' not found")
    return found.as_dict()


@router.put("/connectors/{connector_id}/config")
def update_connector_config(
    connector_id: str, config: ConnectorConfig, db: Session = Depends(get_db)
) -> dict[str, Any]:
    found = db.get(Connector, connector_id)
    if found is None:
        raise HTTPException(status_code=404, detail=f"connector '{connector_id}' not found")
    found.config = config.model_dump(exclude_none=True)
    db.commit()
    db.refresh(found)
    return found.as_dict()


@router.get("/schema")
def schema(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    return _dataset(db, "schema")
