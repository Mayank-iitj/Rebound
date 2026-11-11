import random
import numpy as np
from typing import Dict, Any, List, Optional
from rebound.policy.governor_rules import evaluate_governor

DEFAULT_ARMS = [
    {"arm_id": "bct_1_4|morning|push", "technique_id": "bct_1_4", "slot": "morning", "channel": "push"},
    {"arm_id": "bct_8_7|morning|push", "technique_id": "bct_8_7", "slot": "morning", "channel": "push"},
    {"arm_id": "bct_7_1|pre_window|push", "technique_id": "bct_7_1", "slot": "pre_window", "channel": "push"},
    {"arm_id": "bct_2_3|evening|push", "technique_id": "bct_2_3", "slot": "evening", "channel": "push"},
    {"arm_id": "bct_13_5|restart|push", "technique_id": "bct_13_5", "slot": "restart", "channel": "push"},
    {"arm_id": "bct_3_1|restart|whatsapp", "technique_id": "bct_3_1", "slot": "restart", "channel": "whatsapp"}
]

def sample_nudge_decision(
    slot: str,
    user_state: str,
    fatigue_index: float = 0.0,
    muted_techniques: Optional[List[str]] = None,
    posteriors: Optional[Dict[str, Dict[str, float]]] = None
) -> Dict[str, Any]:
    muted_techniques = muted_techniques or []
    posteriors = posteriors or {}

    # 1. Micro-randomization probability pi
    pi_0 = 0.60
    delta = 0.0
    if fatigue_index > 0.5:
        delta -= 0.15
    if user_state in ("AT_RISK", "RESTARTING"):
        delta += 0.10

    pi = float(np.clip(pi_0 + delta, 0.20, 0.80))
    send_coin = bool(np.random.binomial(1, pi))

    # Filter eligible arms
    eligible_arms = [
        a for a in DEFAULT_ARMS
        if a["slot"] == slot and a["technique_id"] not in muted_techniques
    ]
    if not eligible_arms:
        eligible_arms = [a for a in DEFAULT_ARMS if a["technique_id"] not in muted_techniques]
    if not eligible_arms:
        return {"send": False, "pi": pi, "arm": None, "reason": "No eligible arms"}

    # 2. Thompson sampling over Beta posteriors
    sampled_values = []
    for a in eligible_arms:
        arm_id = a["arm_id"]
        post = posteriors.get(arm_id, {"alpha": 2.0, "beta": 2.0})
        alpha = max(1.0, post.get("alpha", 2.0))
        beta_val = max(1.0, post.get("beta", 2.0))
        theta = np.random.beta(alpha, beta_val)
        sampled_values.append((theta, a))

    sampled_values.sort(key=lambda x: x[0], reverse=True)
    chosen_arm = sampled_values[0][1]

    return {
        "send": send_coin,
        "pi": round(pi, 3),
        "arm": chosen_arm["arm_id"],
        "technique_id": chosen_arm["technique_id"],
        "slot": slot,
        "channel": chosen_arm["channel"]
    }

def build_why_card(technique_id: str, bct_data: Dict[str, Any], locale: str = "en") -> Dict[str, Any]:
    t_name = bct_data.get("name", {}).get(locale, bct_data.get("name", {}).get("en", "Behavior Support"))
    t_expl = bct_data.get("plain_explanation", {}).get(locale, bct_data.get("plain_explanation", {}).get("en", ""))
    t_limits = bct_data.get("limits", {}).get(locale, bct_data.get("limits", {}).get("en", "Keep it simple and doable."))
    ev = bct_data.get("evidence_level", "strong")

    return {
        "technique": {
            "id": technique_id,
            "name": t_name,
            "evidence_level": ev
        },
        "plain": t_expl,
        "limits": t_limits,
        "why_now": "Sent based on your recent activity window and today's capacity estimate.",
        "controls": {
            "mute_technique": True,
            "reduce_frequency": True
        }
    }

