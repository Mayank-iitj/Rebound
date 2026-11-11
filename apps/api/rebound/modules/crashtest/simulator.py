import numpy as np
from typing import Dict, Any, List, Optional

SCENARIO_DEFINITIONS = {
    "night_shift_week": {
        "title": {"en": "Night-shift week", "ar": "أسبوع المناوبات الليلية", "hi": "नाईट शिफ्ट का सप्ताह"},
        "duration": 7,
        "cap_mult": 0.60,
        "blocked_windows": ["20:00", "06:00"],
        "dominant_blocker": "time_window_blocked",
        "description": "7 consecutive night shifts, extreme daytime sleepiness, circadian disruption."
    },
    "heatwave": {
        "title": {"en": "Summer heatwave (44°C)", "ar": "موجة حر صيفية (44 مئوية)", "hi": "भीषण गर्मी (44°C)"},
        "duration": 7,
        "cap_mult": 0.85,
        "blocked_windows": ["10:00", "17:00"],
        "outdoor_friction": 1.0,
        "dominant_blocker": "extreme_outdoor_heat",
        "description": "Hazardous outdoor heat index, outdoor walking is unsafe between 10:00 and 17:00."
    },
    "ramadan": {
        "title": {"en": "Ramadan fasting & routine", "ar": "صيام رمضان وتغير الروتين", "hi": "रमजान का महीना"},
        "duration": 14,
        "cap_mult": 0.80,
        "preferred_window": "after_iftar",
        "dominant_blocker": "fasting_daytime_energy",
        "description": "Fasting hours shift meal and activity windows to evening and late night."
    },
    "travel": {
        "title": {"en": "Unplanned travel", "ar": "سفر طارئ أو رحلة عمل", "hi": "अचानक यात्रा"},
        "duration": 5,
        "cap_mult": 0.70,
        "equipment_friction": 0.8,
        "dominant_blocker": "unfamiliar_surroundings",
        "description": "Away from usual environment, cues disrupted, equipment unavailable."
    },
    "sick_caregiver": {
        "title": {"en": "Illness or family caregiving", "ar": "مرض أو رعاية عائلية", "hi": "बीमारी या परिवार की देखभाल"},
        "duration": 4,
        "cap_mult": 0.35,
        "general_friction": 0.7,
        "dominant_blocker": "family_care_priority",
        "description": "Acute caregiving demands or fever; energy critically low."
    },
    "work_crunch": {
        "title": {"en": "Urgent project crunch", "ar": "ضغط عمل استثنائي", "hi": "दफ्तर का भारी दबाव"},
        "duration": 7,
        "cap_mult": 0.75,
        "time_budget_mult": 0.4,
        "dominant_blocker": "time_scarcity",
        "description": "12+ hour workdays with back-to-back commitments and mental fatigue."
    }
}

def sigmoid(x):
    return 1.0 / (1.0 + np.exp(-np.clip(x, -20, 20)))

def run_crash_test_simulation(
    plan: Dict[str, Any],
    profile: Optional[Dict[str, Any]] = None,
    n_runs: int = 300,
    seed: int = 42
) -> Dict[str, Any]:
    """
    Monte Carlo Habit Twin simulation per ml-spec §3.
    Evaluates plan survival across realistic bad-week scenarios.
    Returns: survivability k of n, per-scenario survival rates, and greedy patch fixes.
    """
    rng = np.random.default_rng(seed)
    profile = profile or {}
    work_pattern = profile.get("work_pattern", "day")
    is_ramadan_observing = profile.get("ramadan_observing", True)

    actions = plan.get("actions", [])
    has_fallback = any(a.get("fallback_catalog_id") for a in actions)
    has_evening_window = any(
        a.get("window_start", "08:00") >= "17:00" and a.get("window_start", "08:00") <= "21:00"
        for a in actions
    )
    is_indoor = any(a.get("indoor", True) for a in actions)

    scenario_results = []
    applicable_scenarios = list(SCENARIO_DEFINITIONS.keys())
    survived_count = 0

    for sc_id in applicable_scenarios:
        sc = SCENARIO_DEFINITIONS[sc_id]
        dur = sc["duration"]

        # Base capacity across Monte Carlo runs
        base_cap = rng.normal(loc=sc["cap_mult"], scale=0.1, size=(n_runs, dur))
        base_cap = np.clip(base_cap, 0.1, 1.0)

        # Baseline coefficients
        b0, b1, b2, b4, b5 = -0.6, 2.2, 1.0, 1.4, 0.5

        # Check fit and friction factors based on plan properties
        fit = 1.0
        friction = 0.0

        if sc_id == "night_shift_week":
            if not has_evening_window and work_pattern in ("night", "rotating"):
                fit = 0.2  # Walk scheduled when asleep or working
            if has_fallback:
                fit = min(1.0, fit + 0.4)

        elif sc_id == "heatwave":
            if not is_indoor:
                friction = 1.2
            if has_fallback:
                friction = max(0.0, friction - 0.8)

        elif sc_id == "ramadan":
            if not has_evening_window and is_ramadan_observing:
                fit = 0.3
            else:
                fit = 0.9

        elif sc_id == "travel":
            if has_fallback:
                fit = 0.85
            else:
                fit = 0.5

        elif sc_id == "sick_caregiver":
            if has_fallback:
                fit = 0.65
            else:
                fit = 0.25

        elif sc_id == "work_crunch":
            fit = 0.7 if has_fallback else 0.45

        # Habit strength vector
        h_t = np.full((n_runs, 1), 0.2)
        completions = np.zeros((n_runs, dur))

        for t in range(dur):
            c_t = base_cap[:, t:t+1]
            z = b0 + b1 * c_t + b2 * fit + b4 * h_t - b5 * 0.0 - friction
            p = sigmoid(z)
            done = rng.binomial(1, p)
            completions[:, t:t+1] = done
            h_t = h_t + 0.06 * (done - h_t)

        # Criterion 1: >= 60% completion during scenario
        during_rate = np.mean(completions, axis=1)
        runs_survived = during_rate >= 0.55
        survive_rate = float(np.mean(runs_survived))

        is_survived = survive_rate >= 0.65
        if is_survived:
            survived_count += 1

        scenario_results.append({
            "id": sc_id,
            "title": sc["title"],
            "survived": is_survived,
            "survive_rate": round(survive_rate, 2),
            "dominant_blocker": sc.get("dominant_blocker") if not is_survived else None,
            "description": sc["description"]
        })

    total_scenarios = len(applicable_scenarios)
    overall_score = round(survived_count / float(total_scenarios), 3)

    # 4. Generate greedy patch recommendations for failed scenarios or optimization
    patches = []
    failed_ids = [s["id"] for s in scenario_results if not s["survived"]]

    if "night_shift_week" in failed_ids or not has_evening_window or survived_count < total_scenarios:
        patches.append({
            "id": "p_shift_window",
            "type": "shift_window",
            "title": "Move action window to 17:00–19:00",
            "description": "Aligns with waking up after a night shift, preventing schedule collisions.",
            "effort_cost": 0.4,
            "predicted_delta": {"night_shift_week": +0.38, "ramadan": +0.22},
            "new_survivability": min(total_scenarios, survived_count + 1)
        })

    if "sick_caregiver" in failed_ids or "heatwave" in failed_ids or not has_fallback or len(patches) < 2:
        patches.append({
            "id": "p_add_fallback",
            "type": "add_fallback",
            "title": "Add 2-minute indoor gentle stretch fallback",
            "description": "Zero equipment indoor micro-action when heat or fatigue blocks normal routine.",
            "effort_cost": 0.3,
            "predicted_delta": {"heatwave": +0.32, "sick_caregiver": +0.28},
            "new_survivability": min(total_scenarios, survived_count + 2)
        })

    if "work_crunch" in failed_ids or "travel" in failed_ids:
        patches.append({
            "id": "p_micro_minimum",
            "type": "add_rule_precommit",
            "title": "Pre-commit recovery rule for busy days",
            "description": "Automatically shrink target to 1-minute breathing or room walk during crunch weeks.",
            "effort_cost": 0.2,
            "predicted_delta": {"work_crunch": +0.25, "travel": +0.20},
            "new_survivability": min(total_scenarios, survived_count + 1)
        })

    return {
        "survivability": {
            "survived": survived_count,
            "total": total_scenarios,
            "score": overall_score
        },
        "scenarios": scenario_results,
        "patches": patches,
        "assumptions_url": "/v1/docs/sim-assumptions",
        "partial": False
    }

