import numpy as np
from typing import Dict, Any, List, Optional, Tuple

K_ANONYMITY_MIN = 20
DEFAULT_EPSILON = 1.0

def apply_differential_privacy_and_suppression(
    true_value: Optional[float],
    true_n: int,
    metric_type: str = "proportion",  # proportion | count | duration
    epsilon: float = DEFAULT_EPSILON,
    seed: Optional[int] = None
) -> Tuple[Optional[float], bool, str]:
    """
    Applies k-anonymity (n >= 20 floor) and Laplace differential privacy noise per ml-spec §8.
    Returns: (noisy_value, suppressed_boolean, n_bucket_string)
    """
    # 1. k-anonymity suppression
    if true_n < K_ANONYMITY_MIN:
        return None, True, "<20"

    # Bucket n for disclosure limitation
    if true_n < 50:
        n_bucket = "20-49"
    elif true_n < 100:
        n_bucket = "50-99"
    elif true_n < 250:
        n_bucket = "100-249"
    else:
        n_bucket = "250+"

    if true_value is None:
        return None, True, n_bucket

    # 2. Laplace mechanism
    rng = np.random.default_rng(seed)
    if metric_type == "proportion":
        # Sensitivity Delta = 1 / true_n
        scale = (1.0 / true_n) / epsilon
        noise = rng.laplace(0.0, scale)
        noisy = float(np.clip(true_value + noise, 0.0, 1.0))
        return round(noisy, 3), False, n_bucket
    elif metric_type == "duration":
        # e.g. RHL in days
        scale = 0.5 / epsilon
        noise = rng.laplace(0.0, scale)
        noisy = max(0.5, true_value + noise)
        return round(noisy, 1), False, n_bucket
    else:
        scale = 1.0 / epsilon
        noise = rng.laplace(0.0, scale)
        return round(true_value + noise, 2), False, n_bucket

def compute_equity_gap(subgroup_values: Dict[str, float]) -> Dict[str, Any]:
    """
    Computes absolute and relative equity gap across subgroups with n >= 20.
    Target: abs_gap <= 5 pp (0.05).
    """
    valid_vals = [v for v in subgroup_values.values() if v is not None]
    if not valid_vals:
        return {"abs_pp": 0.0, "status": "insufficient_data"}

    min_v = min(valid_vals)
    max_v = max(valid_vals)
    gap_pp = round((max_v - min_v) * 100.0, 1)

    return {
        "abs_pp": gap_pp,
        "target_pp": 5.0,
        "min_group_value": round(min_v, 3),
        "max_group_value": round(max_v, 3),
        "status": "within_target" if gap_pp <= 5.0 else "gap_alert"
    }

