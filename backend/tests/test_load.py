"""Training-load normalisation engine (HR-TRIMP / power TSS / sRPE)."""

from __future__ import annotations

from app.garmin import load, transform


def test_hr_trimp_known_value() -> None:
    # 60 min, HRr = (150-50)/(190-50) = 0.714286.
    assert load.hr_trimp(3600, 150, 50, 190, "男") == 108
    # Gender weighting changes the curve (Banister women coefficients differ).
    assert load.hr_trimp(3600, 150, 50, 190, "女") == 121


def test_hr_trimp_degenerate_inputs_zero() -> None:
    assert load.hr_trimp(0, 150, 50, 190) == 0  # no duration
    assert load.hr_trimp(3600, 150, 190, 190) == 0  # max == rest
    assert load.hr_trimp(3600, 40, 50, 190) == 0  # avg below rest → clamped to 0


def test_power_tss_known_value() -> None:
    # 1h, NP 200, FTP 250 → IF 0.8 → TSS 64.
    assert load.power_tss(3600, 200, 250) == 64
    assert load.power_tss(3600, 200, 0) == 0  # no FTP
    assert load.power_tss(0, 200, 250) == 0  # no duration


def test_srpe_known_value() -> None:
    assert load.srpe(5400, 7) == 630  # 90 min x RPE 7
    assert load.srpe(5400, 0) == 0
    assert load.srpe(0, 7) == 0


def test_normalize_load_dispatches_by_sport() -> None:
    assert load.normalize_load("run", duration_s=3600, avg_hr=150, resting_hr=50, max_hr=190) == (
        108,
        "HR-TRIMP",
    )
    assert load.normalize_load("bike", duration_s=3600, np=200, ftp=250) == (64, "功率 TSS")
    assert load.normalize_load("climb", duration_s=5400, rpe=7) == (630, "主观 RPE")
    assert load.normalize_load("strength", duration_s=3900, rpe=7)[1] == "容量 + RPE"


def test_load_src_for_maps_each_family() -> None:
    assert load.load_src_for("run") == "HR-TRIMP"
    assert load.load_src_for("swim") == "HR-TRIMP"
    assert load.load_src_for("bike") == "功率 TSS"
    assert load.load_src_for("climb") == "主观 RPE"
    assert load.load_src_for("strength") == "容量 + RPE"
    assert load.load_src_for("unknown") == "HR-TRIMP"  # safe default


def test_activity_summary_carries_key_and_load_src() -> None:
    run = transform.activity_to_summary(
        {"activityType": {"typeKey": "running"}, "activityName": "晨跑", "averageHR": 150}
    )
    assert run["key"] == "run"
    assert run["loadSrc"] == "HR-TRIMP"
    ride = transform.activity_to_summary({"activityType": {"typeKey": "cycling"}})
    assert ride["key"] == "bike" and ride["loadSrc"] == "功率 TSS"
    climb = transform.activity_to_summary({"activityType": {"typeKey": "bouldering"}})
    assert climb["loadSrc"] == "主观 RPE"
