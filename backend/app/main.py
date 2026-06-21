"""Readyn API — FastAPI application factory + entrypoint.

Run locally:  uvicorn app.main:app --reload
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models  # noqa: F401  (ensure models register on Base before create_all)
from .database import Base, SessionLocal, engine
from .routers import ai, data, profile, settings, system
from .seed import seed_if_empty


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="Readyn API",
        version="0.1.0",
        description="运动数据分析平台后端 — README §7 data shapes, §9–10 endpoints.",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(system.router)
    app.include_router(profile.router)
    app.include_router(data.router)
    app.include_router(ai.router)
    app.include_router(settings.router)
    return app


app = create_app()
