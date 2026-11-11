import hashlib
import json
import re
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone

from rebound.policy.lexicons import (
    FORBIDDEN_SHAME_LOSS_EN,
    FORBIDDEN_SHAME_LOSS_AR,
    FORBIDDEN_SHAME_LOSS_HI,
    RED_FLAG_PATTERNS,
    MEDICATION_PATTERNS
)

POLICY_VERSION = "1.0.0"

# Compute deterministic SHA256 of policy rules
_RULES_SPEC = """
R1: No loss/shame framing: block templates tagged loss_frame/shame or containing shame lexicon
R2: Nudge budget & quiet hours compliance
R3: Post-lapse tone: supportive only within 7 days post-lapse
R4: Language and reading level match
R5: Technique mute respect
R6: Incentive cap & non-loss framing
R7: Red-flag medical / mental health escalation
R8: Sensitive inference ban
R9: No external individual disclosure
R10: Anchor zero-data payload
R11: Granular consent check
R12: Cultural & Ramadan appropriateness
R13: Exploration limit on emerging techniques
R14: Frequency safety: max 1 restart nudge per 24h
"""
POLICY_HASH = hashlib.sha256(_RULES_SPEC.strip().encode("utf-8")).hexdigest()[:16]

class GovernorResult:
    def __init__(self, decision: str, rule_ids: List[str], reason: str = "", modified_content: Optional[str] = None):
        self.decision = decision  # allow | modify | block
        self.rule_ids = rule_ids
        self.reason = reason
        self.modified_content = modified_content
        self.policy_hash = POLICY_HASH
        self.policy_version = POLICY_VERSION

    def to_dict(self) -> Dict[str, Any]:
        return {
            "decision": self.decision,
            "rule_ids": self.rule_ids,
            "reason": self.reason,
            "policy_hash": self.policy_hash,
            "policy_version": self.policy_version,
            "modified_content": self.modified_content
        }

def evaluate_governor(
    surface: str,                     # nudge | restart | recorder | anchor | export
    text: str,
    locale: str = "en",
    tags: Optional[List[str]] = None,
    user_context: Optional[Dict[str, Any]] = None
) -> GovernorResult:
    tags = tags or []
    ctx = user_context or {}
    text_lower = text.lower()
    
    # R7: Red-flag Escalation Check (Emergency / Symptoms / Crisis)
    for pattern in RED_FLAG_PATTERNS:
        if pattern.search(text):
            return GovernorResult(
                decision="block",
                rule_ids=["R7"],
                reason="Red-flag health or crisis signal detected. Coaching halted. Emergency resources provided: In UAE, call 998 for ambulance or 800-4673 (HOPE)."
            )

    # Medical Dosing / Prescription Prohibition
    for pattern in MEDICATION_PATTERNS:
        if pattern.search(text):
            return GovernorResult(
                decision="block",
                rule_ids=["R7", "MED_ADVICE_BAN"],
                reason="Direct medication or clinical dosing detected. Rebound supports healthy behaviors only."
            )

    # R1: No loss-framing or shame
    if "loss_frame" in tags or "shame" in tags:
        return GovernorResult(
            decision="block",
            rule_ids=["R1"],
            reason="Blocked by R1: Template contains forbidden loss-framing or shame tag."
        )

    all_forbidden = FORBIDDEN_SHAME_LOSS_EN + FORBIDDEN_SHAME_LOSS_AR + FORBIDDEN_SHAME_LOSS_HI
    for word in all_forbidden:
        if word in text_lower:
            return GovernorResult(
                decision="block",
                rule_ids=["R1"],
                reason=f"Blocked by R1: Message contains forbidden shaming or loss phrase: '{word}'."
            )

    # R2: Nudge budget & quiet hours
    budget_used = ctx.get("nudges_sent_today", 0)
    budget_limit = ctx.get("nudge_budget_per_day", 3)
    if budget_used >= budget_limit and surface == "nudge":
        return GovernorResult(
            decision="block",
            rule_ids=["R2"],
            reason=f"Blocked by R2: Daily nudge budget reached ({budget_used}/{budget_limit})."
        )

    quiet_hours = ctx.get("quiet_hours", {"start": "22:00", "end": "07:00"})
    current_time_str = ctx.get("current_time_str")
    if current_time_str and quiet_hours:
        start = quiet_hours.get("start", "22:00")
        end = quiet_hours.get("end", "07:00")
        if start > end:  # overnight window
            if current_time_str >= start or current_time_str < end:
                return GovernorResult(
                    decision="block",
                    rule_ids=["R2"],
                    reason="Blocked by R2: Message falls inside user's designated quiet hours."
                )
        else:
            if start <= current_time_str < end:
                return GovernorResult(
                    decision="block",
                    rule_ids=["R2"],
                    reason="Blocked by R2: Message falls inside user's designated quiet hours."
                )

    # R3: Post-lapse tone
    state = ctx.get("state", "ON_TRACK")
    if state in ("LAPSED", "RESTARTING"):
        if "supportive" not in tags and "restart" not in tags:
            return GovernorResult(
                decision="modify",
                rule_ids=["R3"],
                reason="Modified by R3: Swapped to supportive restart template during post-lapse recovery window.",
                modified_content="Life happens. Here is a gentle 2-minute restart to get back on track."
            )

    # R5: Technique mute
    technique_id = ctx.get("technique_id")
    muted_techniques = ctx.get("muted_techniques", [])
    if technique_id and technique_id in muted_techniques:
        return GovernorResult(
            decision="block",
            rule_ids=["R5"],
            reason=f"Blocked by R5: User has muted technique '{technique_id}'."
        )

    # R10: Anchor payload zero-data verification
    if surface == "anchor":
        forbidden_anchor_terms = ["steps", "walk", "sleep", "cigarettes", "weight", "lapse", "missed", "blood pressure"]
        for term in forbidden_anchor_terms:
            if term in text_lower:
                return GovernorResult(
                    decision="block",
                    rule_ids=["R10"],
                    reason="Blocked by R10: Anchor payloads must contain zero health or activity data."
                )

    # R11: Granular consent check
    required_scope = ctx.get("required_consent_scope")
    granted_consents = ctx.get("granted_consents", {})
    if required_scope and not granted_consents.get(required_scope, False):
        return GovernorResult(
            decision="block",
            rule_ids=["R11"],
            reason=f"Blocked by R11: Required consent scope '{required_scope}' is not granted by user."
        )

    # R14: Frequency safety for restart
    if surface == "restart" and ctx.get("restarts_sent_last_24h", 0) >= 1:
        return GovernorResult(
            decision="block",
            rule_ids=["R14"],
            reason="Blocked by R14: Maximum 1 restart nudge per 24 hours allowed."
        )

    return GovernorResult(decision="allow", rule_ids=[])
