"""Garmin China-region (connect.garmin.cn) integration.

``client``    — thin garminconnect wrapper: login (with MFA), token resume, raw fetch.
``transform`` — pure functions mapping Garmin payloads to README §7 ApexData shapes.
``sync``      — orchestrates login/resume + fetch + transform + persistence.
"""

from .client import GarminAuthError, GarminCNClient, NeedsMFA

__all__ = ["GarminCNClient", "GarminAuthError", "NeedsMFA"]
