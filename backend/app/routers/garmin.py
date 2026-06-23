"""Garmin China connector endpoints — connect (with MFA), sync, status.

Login secrets come from ``backend/.env`` by default (see app.config) so they are
never sent over the wire; a request body may override them for ad-hoc accounts.
On success the garminconnect auth token is cached in the DB and the password is
no longer required — ``/sync`` resumes from the token.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..garmin import GarminAuthError, GarminCNClient, NeedsMFA
from ..garmin.sync import sync_account
from ..models import Connector, GarminSession

router = APIRouter(prefix="/api/garmin", tags=["garmin"])

CONNECTOR_ID = "garmin-cn"

# In-process store for logins paused on MFA (dev single-process). Maps an opaque
# handle → (client, resume_state). Cleared once the code is submitted.
_PENDING_MFA: dict[str, tuple[GarminCNClient, Any]] = {}


class ConnectRequest(BaseModel):
    email: str | None = None
    password: str | None = None


class MfaRequest(BaseModel):
    mfaToken: str
    code: str


def _finalize(client: GarminCNClient, db: Session) -> dict[str, Any]:
    """Persist token, run an initial sync, flip the connector to connected."""
    session = db.get(GarminSession, CONNECTOR_ID)
    if session is None:
        session = GarminSession(connector_id=CONNECTOR_ID)
        db.add(session)
    session.token = client.dump()
    db.commit()

    summary = sync_account(client, db, CONNECTOR_ID)

    connector = db.get(Connector, CONNECTOR_ID)
    if connector is not None:
        connector.status = "connected"
        connector.records = str(summary.get("activities", 0))
        connector.sync = "刚刚"
        db.commit()
    return summary


# A stored token may be a pre-migration garth blob the garminconnect client can
# no longer parse. Surface that as "not connected" instead of pretending.
_STALE_TOKEN_MSG = "登录凭证已失效（可能是旧版本遗留的令牌），请重新连接佳明账号。"


def _invalidate_session(db: Session, session: GarminSession, message: str) -> None:
    """Drop an unusable token and flip the connector back to not-connected so
    /status stops falsely reporting 'connected'. Self-heals stale state."""
    session.token = None
    session.last_error = message
    connector = db.get(Connector, CONNECTOR_ID)
    if connector is not None:
        connector.status = "available"
        connector.sync = "—"
    db.commit()


@router.get("/status")
def status(db: Session = Depends(get_db)) -> dict[str, Any]:
    session = db.get(GarminSession, CONNECTOR_ID)
    # Don't trust mere token presence — a legacy garth token is unloadable. Verify
    # it parses (offline, no network) and self-heal the stale state if it doesn't.
    if session is not None and session.token and not GarminCNClient.token_loadable(session.token):
        _invalidate_session(db, session, _STALE_TOKEN_MSG)
    base = session.as_status() if session else {
        "connectorId": CONNECTOR_ID, "connected": False,
        "account": None, "lastSync": None, "lastError": None,
    }
    base["configured"] = get_settings().garmin_configured
    return base


@router.post("/connect")
def connect(body: ConnectRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    settings = get_settings()
    email = body.email or settings.garmin_cn_email
    password = body.password or settings.garmin_cn_password
    if not (email and password):
        raise HTTPException(
            status_code=400,
            detail="缺少佳明中国区账号凭证：请在 backend/.env 配置 GARMIN_CN_EMAIL / "
            "GARMIN_CN_PASSWORD，或在请求体中提供。",
        )

    client = GarminCNClient(domain=settings.garmin_domain)
    try:
        client.login(email, password)
    except NeedsMFA as mfa:
        token = uuid.uuid4().hex
        _PENDING_MFA[token] = (client, mfa.client_state)
        return {"needsMfa": True, "mfaToken": token}
    except GarminAuthError as exc:
        _record_error(db, str(exc))
        raise HTTPException(status_code=502, detail=f"佳明登录失败：{exc}") from exc

    return {"needsMfa": False, "connected": True, **_finalize(client, db)}


@router.post("/mfa")
def submit_mfa(body: MfaRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    pending = _PENDING_MFA.pop(body.mfaToken, None)
    if pending is None:
        raise HTTPException(status_code=400, detail="MFA 会话已过期，请重新发起连接。")
    client, state = pending
    try:
        client.resume_mfa(state, body.code)
    except GarminAuthError as exc:
        _record_error(db, str(exc))
        raise HTTPException(status_code=502, detail=f"MFA 验证失败：{exc}") from exc
    return {"connected": True, **_finalize(client, db)}


@router.post("/sync")
def sync(db: Session = Depends(get_db)) -> dict[str, Any]:
    session = db.get(GarminSession, CONNECTOR_ID)
    if session is None or not session.token:
        raise HTTPException(status_code=409, detail="尚未连接佳明账号，请先 /connect。")
    # A legacy/unparseable token can never sync — invalidate it (so /status is
    # honest) and ask the user to reconnect, rather than emitting a raw 502.
    if not GarminCNClient.token_loadable(session.token):
        _invalidate_session(db, session, _STALE_TOKEN_MSG)
        raise HTTPException(status_code=409, detail=_STALE_TOKEN_MSG)
    client = GarminCNClient(domain=get_settings().garmin_domain)
    try:
        client.load(session.token)
        return sync_account(client, db, CONNECTOR_ID)
    except GarminAuthError as exc:
        # Loadable token but the sync still failed (e.g. expired session or a
        # network blip). Record it but keep the token — it may be transient.
        _record_error(db, str(exc))
        raise HTTPException(
            status_code=502, detail=f"同步失败（令牌可能已过期，请重新连接）：{exc}"
        ) from exc


def _record_error(db: Session, message: str) -> None:
    session = db.get(GarminSession, CONNECTOR_ID)
    if session is None:
        session = GarminSession(connector_id=CONNECTOR_ID)
        db.add(session)
    session.last_error = message[:500]
    db.commit()
