"""garth wrapper for the Garmin China cloud (connect.garmin.cn).

Everything the rest of the app needs goes through :class:`GarminCNClient`:

* ``login(email, password)``        — SSO login; raises :class:`NeedsMFA` if the
                                      account has 2-step verification enabled.
* ``resume_mfa(client_state, code)``— finish a login that returned ``NeedsMFA``.
* ``load(token)`` / ``dump()``      — restore / serialise the OAuth tokens so the
                                      password is only needed once.
* ``fetch_*``                       — thin ``connectapi`` calls returning raw
                                      Garmin JSON (kept dumb so transforms/tests
                                      operate on plain dicts).

garth itself is deprecated upstream but remains the pragmatic route to the China
region, which has no official open Health API. All network access is funnelled
through this class so the dependency can be swapped without touching callers.
"""

from __future__ import annotations

from typing import Any

import garth


class GarminAuthError(RuntimeError):
    """Login failed (bad credentials, region/network block, or garth error)."""


class NeedsMFA(Exception):
    """Login needs a 2FA code. Carries garth's opaque resume state."""

    def __init__(self, client_state: Any) -> None:
        super().__init__("Garmin account requires an MFA code")
        self.client_state = client_state


class GarminCNClient:
    """Authenticated handle to one Garmin China account."""

    def __init__(self, domain: str = "garmin.cn") -> None:
        self._g = garth.Client()
        self._g.configure(domain=domain)
        self._display_name: str | None = None

    # --- authentication -------------------------------------------------

    def login(self, email: str, password: str) -> None:
        """Username/password SSO login. Raises NeedsMFA or GarminAuthError."""
        try:
            result = self._g.login(email, password, return_on_mfa=True)
        except Exception as exc:  # garth raises a grab-bag of exceptions
            raise GarminAuthError(str(exc)) from exc
        if isinstance(result, tuple) and result and result[0] == "needs_mfa":
            raise NeedsMFA(result[1])

    def resume_mfa(self, client_state: Any, code: str) -> None:
        """Complete a login that previously raised :class:`NeedsMFA`."""
        try:
            self._g.resume_login(client_state, code)
        except Exception as exc:
            raise GarminAuthError(str(exc)) from exc

    def dump(self) -> str:
        """Serialise OAuth tokens to an opaque string for storage."""
        return self._g.dumps()

    def load(self, token: str) -> None:
        """Restore OAuth tokens produced by :meth:`dump`."""
        try:
            self._g.loads(token)
        except Exception as exc:
            raise GarminAuthError(f"stored token invalid: {exc}") from exc

    @property
    def display_name(self) -> str:
        if self._display_name is None:
            profile = self._g.connectapi("/userprofile-service/socialProfile") or {}
            self._display_name = profile.get("displayName") or profile.get("userName") or ""
        return self._display_name

    @property
    def account(self) -> str:
        profile = self._g.connectapi("/userprofile-service/socialProfile") or {}
        return profile.get("userName") or profile.get("displayName") or ""

    # --- raw fetchers (return Garmin JSON verbatim) ---------------------

    def fetch_social_profile(self) -> dict[str, Any]:
        return self._g.connectapi("/userprofile-service/socialProfile") or {}

    def fetch_personal_info(self) -> dict[str, Any]:
        return (
            self._g.connectapi("/userprofile-service/userprofile/personal-information") or {}
        )

    def fetch_activities(self, limit: int = 30, start: int = 0) -> list[dict[str, Any]]:
        path = f"/activitylist-service/activities/search/activities?limit={limit}&start={start}"
        return self._g.connectapi(path) or []

    def fetch_daily_summary(self, day: str) -> dict[str, Any]:
        path = f"/usersummary-service/usersummary/daily/{self.display_name}?calendarDate={day}"
        return self._g.connectapi(path) or {}

    def fetch_hrv(self, day: str) -> dict[str, Any]:
        return self._g.connectapi(f"/hrv-service/hrv/{day}") or {}

    def fetch_sleep(self, day: str) -> dict[str, Any]:
        path = (
            f"/wellness-service/wellness/dailySleepData/{self.display_name}"
            f"?date={day}&nonSleepBufferMinutes=60"
        )
        return self._g.connectapi(path) or {}

    def fetch_weight(self, start: str, end: str) -> dict[str, Any]:
        path = f"/weight-service/weight/dateRange?startDate={start}&endDate={end}"
        return self._g.connectapi(path) or {}

    def fetch_training_readiness(self, day: str) -> Any:
        return self._g.connectapi(f"/metrics-service/metrics/trainingreadiness/{day}") or []
