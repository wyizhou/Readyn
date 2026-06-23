"""Server-side training-load normalisation.

Different sports need different models — heart rate can't represent a climbing or
lifting session, and only cyclists have a power meter — so each activity's load
is computed by the model that fits its sport and then expressed in one comparable
unit (AU), tagged with how it was derived (``loadSrc``):

* run / hike / walk / swim → HR-TRIMP  (Banister, gender-weighted)
* ride                     → 功率 TSS  (Coggan Training Stress Score)
* climb                    → 主观 RPE  (session-RPE: RPE x minutes)
* strength                 → 容量 + RPE (session-RPE proxy)

Everything here is pure (no network, no device), so it unit-tests directly.
Mirrors the frontend ``loadSources`` taxonomy and the design's ``activity.loadSrc``.
"""

from __future__ import annotations

import math

# transform._SPORT_MAP bucket (icon/key) → load-source label.
LOAD_SRC_BY_SPORT: dict[str, str] = {
    "run": "HR-TRIMP",
    "hike": "HR-TRIMP",
    "walk": "HR-TRIMP",
    "swim": "HR-TRIMP",
    "bike": "功率 TSS",
    "climb": "主观 RPE",
    "strength": "容量 + RPE",
}

DEFAULT_LOAD_SRC = "HR-TRIMP"


def load_src_for(sport_key: str) -> str:
    """The load-source label a given sport's AU is derived from."""
    return LOAD_SRC_BY_SPORT.get(sport_key, DEFAULT_LOAD_SRC)


def hr_trimp(
    duration_s: float, avg_hr: float, resting_hr: float, max_hr: float, sex: str = "男"
) -> int:
    """Banister HR-TRIMP in AU. Returns 0 when inputs are missing/degenerate.

    TRIMP = minutes x HRr x (a x e^(b x HRr)); HRr = (avgHR - rest)/(max - rest).
    Gender weighting (Banister 1991): men a=0.64,b=1.92; women a=0.86,b=1.67.
    """
    try:
        minutes = float(duration_s) / 60.0
        denom = float(max_hr) - float(resting_hr)
        hrr = (float(avg_hr) - float(resting_hr)) / denom if denom > 0 else 0.0
    except (TypeError, ValueError):
        return 0
    if minutes <= 0 or denom <= 0:
        return 0
    hrr = min(max(hrr, 0.0), 1.0)
    if hrr <= 0:
        return 0
    weight = 0.86 * math.exp(1.67 * hrr) if sex == "女" else 0.64 * math.exp(1.92 * hrr)
    return round(minutes * hrr * weight)


def power_tss(duration_s: float, np: float, ftp: float) -> int:
    """Coggan Training Stress Score in AU. TSS = (s x NP x IF)/(FTP x 3600) x 100."""
    try:
        seconds = float(duration_s)
        np_ = float(np)
        ftp_ = float(ftp)
    except (TypeError, ValueError):
        return 0
    if seconds <= 0 or ftp_ <= 0 or np_ <= 0:
        return 0
    intensity = np_ / ftp_
    return round((seconds * np_ * intensity) / (ftp_ * 3600.0) * 100.0)


def srpe(duration_s: float, rpe: float) -> int:
    """Session-RPE load in AU = RPE (0-10) x duration in minutes."""
    try:
        minutes = float(duration_s) / 60.0
        r = float(rpe)
    except (TypeError, ValueError):
        return 0
    if minutes <= 0 or r <= 0:
        return 0
    return round(minutes * r)


def normalize_load(
    sport_key: str,
    *,
    duration_s: float = 0,
    avg_hr: float = 0,
    resting_hr: float = 0,
    max_hr: float = 0,
    sex: str = "男",
    np: float = 0,
    ftp: float = 0,
    rpe: float = 0,
) -> tuple[int, str]:
    """Compute one activity's normalised load and its source label.

    Returns ``(au, load_src)``; dispatches to the model that fits the sport.
    """
    src = load_src_for(sport_key)
    if src == "功率 TSS":
        au = power_tss(duration_s, np, ftp)
    elif src in ("主观 RPE", "容量 + RPE"):
        au = srpe(duration_s, rpe)
    else:
        au = hr_trimp(duration_s, avg_hr, resting_hr, max_hr, sex)
    return au, src
