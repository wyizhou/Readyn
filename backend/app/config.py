"""Runtime configuration.

Secrets (the Garmin China account credentials) are read from the environment or
a local ``backend/.env`` file — never committed (see ``.gitignore``). garth logs
into ``connect.garmin.cn`` with these; the resulting OAuth tokens are cached so
the password is not needed on every sync.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Garmin China region (connect.garmin.cn). Domain is overridable so the same
    # code path serves the international cloud (garmin.com) if ever needed.
    garmin_cn_email: str = ""
    garmin_cn_password: str = ""
    garmin_domain: str = "garmin.cn"

    @property
    def garmin_configured(self) -> bool:
        return bool(self.garmin_cn_email and self.garmin_cn_password)


@lru_cache
def get_settings() -> Settings:
    return Settings()
