"""System endpoints: health, accounts, auth, full bootstrap payload."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import services
from ..database import get_db
from ..schemas import Account, LoginRequest, LoginResponse

router = APIRouter(prefix="/api", tags=["system"])

# Login accounts (mirrors the standalone login page; README §12).
ACCOUNTS: list[Account] = [
    Account(id="linyue", name="林越", handle="@linyue", role="多项目耐力 / 攀岩", initial="林"),
    Account(id="suning", name="苏宁", handle="@suning", role="马拉松 · 公路跑", initial="苏"),
    Account(id="chenyu", name="陈宇", handle="@chenyu", role="越野跑 · 登山", initial="陈"),
]


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/accounts", response_model=list[Account])
def accounts() -> list[Account]:
    return ACCOUNTS


@router.post("/auth/login", response_model=LoginResponse)
def login(req: LoginRequest) -> LoginResponse:
    # Stub auth — issues a deterministic dev token (README §12: real OAuth later).
    return LoginResponse(token=f"dev-token-{req.accountId}", accountId=req.accountId)


@router.get("/bootstrap")
def bootstrap(db: Session = Depends(get_db)) -> dict:
    """Full ApexData payload (README §7) for the frontend's initial load."""
    return services.bootstrap(db)
