from typing import Dict, Any, List, Tuple, Optional

def compute_capacity(
    mood_face: Optional[int] = None,          # 1..5
    sleep_hours: Optional[float] = None,      # e.g. 4.5
    work_pattern: str = "day",               # day, night, rotating, outdoor
    is_shift_swap: bool = False,
    is_crunch: bool = False,
    heat_index: Optional[float] = None,       # Celsius, e.g. 42
    is_outdoor_action: bool = False,
    is_travel: bool = False,
    is_illness: bool = False,
    negative_chips: Optional[List[str]] = None
) -> Tuple[float, List[str], str, str]:
    """
    Computes today's capacity C_t in [0, 1] per ml-spec §1 with missing input renormalization.
    Returns: (capacity_score, inputs_used, suggested_level, explanation)
    """
    weights = {}
    values = {}
    negative_chips = negative_chips or []

    # 1. Self-report mood face: (mood_face - 1) / 4
    if mood_face is not None and 1 <= mood_face <= 5:
        weights["self_report"] = 0.30
        values["self_report"] = (mood_face - 1) / 4.0

    # 2. Sleep hours: clip((sleep_h - 3) / (8 - 3), 0, 1)
    if sleep_hours is not None:
        weights["sleep_hours"] = 0.25
        norm_sleep = max(0.0, min(1.0, (sleep_hours - 3.0) / 5.0))
        values["sleep_hours"] = norm_sleep

    # 3. Workload / shift (only if pattern specified or crunch/shift-swap)
    if work_pattern in ("night", "rotating") or is_shift_swap or is_crunch:
        workload_pen = 0.0
        if work_pattern in ("night", "rotating"):
            workload_pen += 0.25
        if is_shift_swap:
            workload_pen += 0.35
        if is_crunch:
            workload_pen += 0.30
        weights["workload"] = 0.20
        values["workload"] = max(0.0, 1.0 - workload_pen)

    # 4. Heat stress (for outdoor actions only)
    if is_outdoor_action:
        weights["heat_index"] = 0.10
        hi = heat_index if heat_index is not None else 35.0
        heat_factor = max(0.0, min(1.0, (hi - 32.0) / 13.0))
        values["heat_index"] = 1.0 - heat_factor
    elif heat_index is not None and heat_index > 40.0:
        # High general heat can exert mild environmental drag
        weights["heat_index"] = 0.05
        values["heat_index"] = 0.65

    # 5. Travel / illness context (only when active)
    if is_travel or is_illness:
        weights["travel_illness"] = 0.10
        values["travel_illness"] = 0.0 if is_illness else 0.4

    # 6. Negative chips (only when chips provided)
    if negative_chips:
        weights["chips"] = 0.05
        n_chips = min(len(negative_chips), 3)
        values["chips"] = max(0.0, 1.0 - 0.15 * n_chips)

    # Renormalize over available inputs
    total_w = sum(weights.values())
    if total_w == 0:
        return 0.5, ["default"], "min", "Today's capacity set to default."

    raw_c = sum(weights[k] * values[k] for k in weights) / total_w
    c_score = round(max(0.05, min(1.0, raw_c)), 2)

    # Level suggestion:
    # C_t >= 0.70 -> std
    # 0.40 <= C_t < 0.70 -> min
    # C_t < 0.40 -> min + grace option
    if c_score >= 0.70:
        suggested = "std"
        expl = "High energy and favorable conditions today. Standard level is recommended."
    elif c_score >= 0.40:
        suggested = "min"
        expl = "A busy or tiring day ahead. Doing the Minimum version keeps momentum without burnout."
    else:
        suggested = "min"
        expl = "Low capacity day. The 2-minute Minimum is enough, or take an auto-grace day if needed."

    inputs_used = list(weights.keys())
    return c_score, inputs_used, suggested, expl

def compute_rolling_consistency(logs: List[Dict[str, Any]], window_size: int = 28) -> Tuple[float, int, int]:
    """
    ml-spec §2: 28-day rolling consistency score (NOT a streak).
    Credits: none=0.0, min=0.6, std=0.9, stretch=1.0.
    Up to 2 auto-grace days applied to missed days.
    Returns: (consistency_score, eligible_days, grace_days_used)
    """
    if not logs:
        return 0.0, window_size, 0

    recent_logs = logs[-window_size:]
    total_days = len(recent_logs)
    
    # Identify missed days for auto-grace application
    missed_count = sum(1 for l in recent_logs if l.get("level_done") in (None, "none") and not l.get("is_pause", False))
    grace_days_used = min(2, missed_count)
    
    eligible_days = max(1, total_days - grace_days_used)
    
    credits_sum = 0.0
    remaining_grace = grace_days_used
    for l in recent_logs:
        lvl = l.get("level_done", "none")
        if lvl == "stretch":
            credits_sum += 1.0
        elif lvl == "std":
            credits_sum += 0.9
        elif lvl == "min":
            credits_sum += 0.6
        else:
            if remaining_grace > 0 and not l.get("is_pause", False):
                remaining_grace -= 1
                # grace day excluded from denominator
                continue
            credits_sum += 0.0

    score = round(min(1.0, credits_sum / float(eligible_days)), 2)
    return score, eligible_days, grace_days_used
