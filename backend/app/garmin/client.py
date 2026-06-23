"""garminconnect wrapper for the Garmin China cloud (connect.garmin.cn).

Everything the rest of the app needs goes through :class:`GarminCNClient`:

* ``login(email, password)``        — SSO login; raises :class:`NeedsMFA` if the
                                      account has 2-step verification enabled.
* ``resume_mfa(client_state, code)``— finish a login that returned ``NeedsMFA``.
* ``load(token)`` / ``dump()``      — restore / serialise the auth tokens so the
                                      password is only needed once.
* ``fetch_*``                       — thin ``connectapi`` calls returning raw
                                      Garmin JSON (kept dumb so transforms/tests
                                      operate on plain dicts).

This used to wrap ``garth``, which upstream self-deprecated and no longer
maintains (https://github.com/matin/garth/discussions/222). We now wrap
``garminconnect`` (PyPI ``garminconnect``): it ships its own HTTP layer
(``curl_cffi`` + ``ua-generator``, impersonating a real browser TLS fingerprint
to survive Garmin's bot defences), natively supports the China region via
``is_cn=True``, and is actively maintained.

The raw fetchers deliberately go through ``Garmin.connectapi`` with the exact
Connect REST paths the old garth client used, rather than garminconnect's named
helpers (``get_weigh_ins``/``get_user_profile`` hit *different* endpoints with
*different* response shapes). That keeps the payloads byte-identical to before,
so :mod:`app.garmin.transform` needs no changes. All network access is funnelled
through this one class so the dependency can be swapped without touching callers.
"""

from __future__ import annotations

from typing import Any

from garminconnect import Garmin


class GarminAuthError(RuntimeError):
    """Login failed (bad credentials, region/network block, or library error)."""


class NeedsMFA(Exception):
    """Login needs a 2FA code. Carries garminconnect's opaque resume state."""

    def __init__(self, client_state: Any) -> None:
        super().__init__("Garmin account requires an MFA code")
        self.client_state = client_state


class GarminCNClient:
    """Authenticated handle to one Garmin China account."""

    def __init__(self, domain: str = "garmin.cn") -> None:
        # garminconnect selects the China cloud via is_cn rather than a domain
        # string; keep the ``domain`` argument for call-site compatibility.
        self._is_cn = "cn" in domain.lower()
        self._g = Garmin(is_cn=self._is_cn, return_on_mfa=True)
        self._display_name: str | None = None

    # --- authentication -------------------------------------------------

    def login(self, email: str, password: str) -> None:
        """Username/password SSO login. Raises NeedsMFA or GarminAuthError."""
        # Credentials are constructor args in garminconnect, so rebuild the
        # handle with them before logging in.
        self._g = Garmin(
            email=email, password=password, is_cn=self._is_cn, return_on_mfa=True
        )
        try:
            # With return_on_mfa, login() yields (mfa_status, resume_state):
            # mfa_status is truthy ("needs_mfa") when a 2FA code is required,
            # otherwise (None, None) on a clean login.
            mfa_status, client_state = self._g.login()
        except Exception as exc:  # garminconnect raises a grab-bag of exceptions
            raise GarminAuthError(str(exc)) from exc
        if mfa_status:
            raise NeedsMFA(client_state)

    def resume_mfa(self, client_state: Any, code: str) -> None:
        """Complete a login that previously raised :class:`NeedsMFA`."""
        try:
            self._g.resume_login(client_state, code)
        except Exception as exc:
            raise GarminAuthError(str(exc)) from exc

    def dump(self) -> str:
        """Serialise auth tokens to an opaque string for storage."""
        return self._g.client.dumps()

    def load(self, token: str) -> None:
        """Restore auth tokens produced by :meth:`dump`."""
        try:
            self._g.client.loads(token)
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
