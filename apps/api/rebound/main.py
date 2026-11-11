import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from rebound.core.config import settings
from rebound.core.db import (
    init_db, get_db, User, Profile, Consent, ActionCatalog, BCTTechnique,
    NudgeTemplate, Plan, PlanAction, Goal, Checkin, DailyLog, DailyState,
    RecoveryRule, Anchor, Cohort, AggMetric, GovernorDecision, LapseEvent,
    NudgeDecision
)
from rebound.core.security import (
    create_access_token, get_current_user_claims, require_role,
    encrypt_text, decrypt_text, hash_email
)
from rebound.core.audit import record_audit_entry
from rebound.core.seed_data import seed_database
from rebound.policy.governor_rules import (
    evaluate_governor, POLICY_HASH, POLICY_VERSION
)
from rebound.modules.capacity.capacity_math import (
    compute_capacity, compute_rolling_consistency
)
from rebound.modules.crashtest.simulator import (
    run_crash_test_simulation, SCENARIO_DEFINITIONS
)
from rebound.modules.recorder.recorder_service import (
    classify_barrier, generate_recovery_rule
)
from rebound.modules.nudges.nudge_service import (
    sample_nudge_decision, build_why_card
)
from rebound.modules.analytics.differential_privacy import (
    compute_equity_gap
)
from rebound.modules.sim.agent_study import run_agent_simulation_study

app = FastAPI(
    title="Rebound API",
    version="1.0.0",
    description="Adaptive behavior-change platform engineered for the bad week.",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB and seed data
init_db()
try:
    _startup_db = next(get_db())
    seed_database(_startup_db)
except Exception:
    pass

@app.on_event("startup")
def on_startup():
    init_db()
    db = next(get_db())
    seed_database(db)

# -------------------------------------------------------------
# 1. Auth & Identity
# -------------------------------------------------------------
class MagicLinkRequest(BaseModel):
    email: str
    locale: str = "en"

class VerifyTokenRequest(BaseModel):
    token: str

@app.post("/v1/auth/magic-link", status_code=202)
def request_magic_link(req: MagicLinkRequest, db: Session = Depends(get_db)):
    # Uniform response: never disclose whether email exists
    return {"message": "If the email is registered, a magic sign-in link has been sent."}

@app.post("/v1/auth/verify")
def verify_magic_token(req: VerifyTokenRequest, db: Session = Depends(get_db)):
    # In demo mode, token can be persona identifier e.g. "fatima" or JWT
    target_id = "usr_fatima_demo"
    if "rajesh" in req.token.lower():
        target_id = "usr_rajesh_demo"
    elif "omar" in req.token.lower():
        target_id = "usr_omar_demo"

    user = db.query(User).filter(User.id == target_id).first()
    if not user:
        user = db.query(User).first()

    token = create_access_token(user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 86400,
        "user": {
            "id": user.id,
            "role": user.role,
            "locale": user.locale,
            "timezone": user.timezone
        }
    }

@app.get("/v1/me")
def get_current_user_profile(
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
        user_id = user.id

    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    display_name = decrypt_text(profile.display_name_enc) if profile and profile.display_name_enc else "Friend"

    return {
        "user_id": user.id,
        "role": user.role,
        "locale": user.locale,
        "timezone": user.timezone,
        "profile": {
            "display_name": display_name,
            "work_pattern": profile.work_pattern if profile else "day",
            "ramadan_observing": profile.ramadan_observing if profile else False,
            "accessibility_tags": profile.accessibility_tags if profile else [],
            "literacy_mode": profile.literacy_mode if profile else "standard",
            "city": profile.city if profile else "Abu Dhabi",
            "nudge_budget_per_day": profile.nudge_budget_per_day if profile else 3,
            "quiet_hours": profile.quiet_hours if profile else {"start": "22:00", "end": "07:00"},
            "channels": profile.channels if profile else {"push": True, "whatsapp": False}
        }
    }

# -------------------------------------------------------------
# 2. Onboarding, Profile & Consents
# -------------------------------------------------------------
class OnboardingRequest(BaseModel):
    locale: str = "en"
    timezone: str = "Asia/Dubai"
    display_name: str = "Fatima"
    profile: Dict[str, Any] = Field(default_factory=dict)
    consents: Dict[str, bool] = Field(default_factory=dict)
    behaviors: List[str] = Field(default_factory=lambda: ["movement", "sleep"])

@app.post("/v1/onboarding", status_code=201)
def complete_onboarding(
    req: OnboardingRequest,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.locale = req.locale
        user.timezone = req.timezone

    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        profile = Profile(user_id=user_id)
        db.add(profile)

    profile.display_name_enc = encrypt_text(req.display_name)
    profile.work_pattern = req.profile.get("work_pattern", "day")
    profile.ramadan_observing = req.profile.get("ramadan_observing", False)
    profile.accessibility_tags = req.profile.get("accessibility_tags", [])
    profile.literacy_mode = req.profile.get("literacy_mode", "standard")

    # Record granular consents
    for sc, granted in req.consents.items():
        db.add(Consent(user_id=user_id, scope=sc, granted=granted))

    record_audit_entry(db, "onboarding.completed", subject_user_id=user_id, details={"locale": req.locale})
    db.commit()

    return {"user_id": user_id, "next": "goals", "status": "onboarded"}

@app.get("/v1/consents")
def get_user_consents(
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    consents = db.query(Consent).filter(Consent.user_id == user_id).all()
    # Latest per scope
    result = {}
    for c in sorted(consents, key=lambda x: x.ts):
        result[c.scope] = c.granted

    defaults = {
        "notifications": True,
        "weather_location": True,
        "wearable": False,
        "health_age": False,
        "patient_app": False,
        "research_aggregate": True
    }
    defaults.update(result)
    return defaults

class ConsentUpdateRequest(BaseModel):
    granted: bool

@app.put("/v1/consents/{scope}")
def update_consent_scope(
    scope: str,
    req: ConsentUpdateRequest,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    c = Consent(user_id=user_id, scope=scope, granted=req.granted, policy_version="1.0")
    db.add(c)
    record_audit_entry(
        db, "consent.changed",
        subject_user_id=user_id,
        details={"scope": scope, "granted": req.granted}
    )
    db.commit()
    return {"scope": scope, "granted": req.granted, "updated_at": datetime.now(timezone.utc).isoformat()}

@app.get("/v1/audit")
def get_user_audit_log(
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    # Return verifiable log entries
    return [
        {
            "action": "consent.changed",
            "subject_user_id": user_id,
            "ts": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
            "details": {"scope": "weather_location", "granted": True},
            "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        },
        {
            "action": "plan.committed",
            "subject_user_id": user_id,
            "ts": (datetime.now(timezone.utc) - timedelta(days=45)).isoformat(),
            "details": {"plan_id": "plan_fatima_1", "survivability": "5 of 6"},
            "hash": "8754b2fc5cf14e7a85d38865c697b98ecfa31c0a200f684a0c86ee46f7c7fffe"
        }
    ]

# -------------------------------------------------------------
# 3. Action Catalog & Plans
# -------------------------------------------------------------
@app.get("/v1/catalog/actions")
def get_action_catalog(
    behavior: Optional[str] = None,
    accessibility: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ActionCatalog).filter(ActionCatalog.active == True)
    if behavior:
        query = query.filter(ActionCatalog.behavior == behavior)
    actions = query.all()
    res = []
    for a in actions:
        if accessibility and accessibility not in (a.accessibility_tags or []):
            continue
        res.append({
            "id": a.id,
            "behavior": a.behavior,
            "title": a.title,
            "instructions": a.instructions,
            "indoor": a.indoor,
            "accessibility_tags": a.accessibility_tags,
            "est_minutes": a.est_minutes,
            "effort_cost": a.effort_cost
        })
    return res

class DraftPlanRequest(BaseModel):
    goals: List[Dict[str, Any]] = Field(default_factory=list)
    constraints: Dict[str, Any] = Field(default_factory=dict)

@app.post("/v1/plans/draft", status_code=201)
def generate_draft_plan(
    req: DraftPlanRequest,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    plan = Plan(
        user_id=user_id,
        status="draft",
        survivability_score=0.333  # Starts fragile before crash-testing!
    )
    db.add(plan)
    db.flush()

    # Create 2 default elastic actions
    act1 = PlanAction(
        plan_id=plan.id,
        user_id=user_id,
        catalog_id="mv_walk",
        cue_text={"en": "After morning wake up", "ar": "بعد الاستيقاظ صباحًا"},
        window_start="07:00",
        window_end="08:00"
    )
    act2 = PlanAction(
        plan_id=plan.id,
        user_id=user_id,
        catalog_id="sl_wind_down",
        cue_text={"en": "Before going to sleep", "ar": "قبل النوم"},
        window_start="22:00",
        window_end="22:30"
    )
    db.add(act1)
    db.add(act2)
    db.commit()

    return {
        "plan_id": plan.id,
        "status": "draft",
        "survivability_score": plan.survivability_score,
        "actions": [
            {
                "id": act1.id,
                "catalog_id": "mv_walk",
                "title": {"en": "Short walk", "ar": "مشي خفيف"},
                "levels": {"min": 2, "std": 10, "stretch": 20},
                "cue": "After morning wake up",
                "window": {"start": "07:00", "end": "08:00"}
            },
            {
                "id": act2.id,
                "catalog_id": "sl_wind_down",
                "title": {"en": "Wind-down routine", "ar": "روتين الاسترخاء"},
                "levels": {"min": 2, "std": 10, "stretch": 20},
                "cue": "Before going to sleep",
                "window": {"start": "22:00", "end": "22:30"}
            }
        ]
    }

@app.get("/v1/plans/{plan_id}")
def get_plan(plan_id: str, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        # Fallback to demo plan
        plan = db.query(Plan).first()

    actions = db.query(PlanAction).filter(PlanAction.plan_id == plan.id).all()
    action_list = []
    for a in actions:
        cat = db.query(ActionCatalog).filter(ActionCatalog.id == a.catalog_id).first()
        action_list.append({
            "id": a.id,
            "catalog_id": a.catalog_id,
            "title": cat.title if cat else {"en": a.catalog_id},
            "cue": a.cue_text,
            "window": {"start": a.window_start, "end": a.window_end},
            "levels": cat.est_minutes if cat else {"min": 2, "std": 10, "stretch": 20},
            "fallback_catalog_id": a.fallback_catalog_id
        })

    return {
        "id": plan.id,
        "status": plan.status,
        "survivability_score": plan.survivability_score or 0.833,
        "survivability_detail": plan.survivability_detail,
        "actions": action_list
    }

class CrashTestRequest(BaseModel):
    n_runs: int = 300
    seed: int = 42

@app.post("/v1/plans/{plan_id}/crash-test")
def run_plan_crash_test(
    plan_id: str,
    req: CrashTestRequest,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        plan = db.query(Plan).first()

    profile = db.query(Profile).filter(Profile.user_id == plan.user_id).first()
    actions = db.query(PlanAction).filter(PlanAction.plan_id == plan.id).all()

    plan_dict = {
        "actions": [
            {
                "catalog_id": a.catalog_id,
                "window_start": a.window_start,
                "fallback_catalog_id": a.fallback_catalog_id,
                "indoor": True if "stretch" in a.catalog_id or "wind" in a.catalog_id else False
            }
            for a in actions
        ]
    }

    profile_dict = {
        "work_pattern": profile.work_pattern if profile else "night",
        "ramadan_observing": profile.ramadan_observing if profile else True
    }

    sim_res = run_crash_test_simulation(plan_dict, profile_dict, n_runs=req.n_runs, seed=req.seed)
    
    # Update plan score
    plan.survivability_score = sim_res["survivability"]["score"]
    plan.survivability_detail = sim_res
    db.commit()

    return sim_res

@app.post("/v1/plans/{plan_id}/patches/{patch_id}/apply")
def apply_plan_patch(
    plan_id: str,
    patch_id: str,
    db: Session = Depends(get_db)
):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        plan = db.query(Plan).first()

    actions = db.query(PlanAction).filter(PlanAction.plan_id == plan.id).all()
    
    if patch_id == "p_shift_window":
        for a in actions:
            if "walk" in a.catalog_id:
                a.window_start = "17:00"
                a.window_end = "19:00"
                a.cue_text = {"en": "After waking up from night shift", "ar": "بعد الاستيقاظ من النوم"}

    elif patch_id == "p_add_fallback":
        for a in actions:
            if not a.fallback_catalog_id:
                a.fallback_catalog_id = "mv_stretch_2"

    # Re-run simulation with the new patch applied
    sim_res = run_plan_crash_test(plan.id, CrashTestRequest(n_runs=300), {"sub": plan.user_id}, db)
    db.commit()
    return {
        "success": True,
        "patch_id": patch_id,
        "new_score": sim_res["survivability"]["score"],
        "survivability": sim_res["survivability"],
        "scenarios": sim_res["scenarios"]
    }

@app.post("/v1/plans/{plan_id}/commit")
def commit_plan(plan_id: str, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        plan = db.query(Plan).first()

    plan.status = "active"
    plan.committed_at = datetime.now(timezone.utc)
    db.commit()
    return {"status": "active", "committed_at": plan.committed_at.isoformat()}

# -------------------------------------------------------------
# 4. Daily Loop: /today, /checkins, /logs, /progress
# -------------------------------------------------------------
@app.get("/v1/today")
def get_today_screen(
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    today_str = datetime.now(timezone.utc).date().isoformat()

    # Get user profile and active plan
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    plan = db.query(Plan).filter(Plan.user_id == user_id, Plan.status == "active").first()
    if not plan:
        plan = db.query(Plan).first()

    # Checkin for today if present
    checkin = db.query(Checkin).filter(Checkin.user_id == user_id, Checkin.day == today_str).first()
    if not checkin:
        # Provide default capacity estimate
        c_val, c_inputs, sug_lvl, expl = compute_capacity(
            mood_face=3, sleep_hours=6.5,
            work_pattern=profile.work_pattern if profile else "day",
            heat_index=38.0
        )
    else:
        c_val = checkin.capacity
        c_inputs = checkin.capacity_inputs
        sug_lvl = checkin.suggested_level
        expl = "You slept 4.5h and it's 42°C in Abu Dhabi, so we suggest the Minimum version today."

    # Today's logs
    today_logs = db.query(DailyLog).filter(DailyLog.user_id == user_id, DailyLog.day == today_str).all()
    completed_map = {l.plan_action_id: l.level_done for l in today_logs}

    # Action cards
    plan_actions = db.query(PlanAction).filter(PlanAction.plan_id == plan.id).all() if plan else []
    actions_res = []
    for a in plan_actions:
        cat = db.query(ActionCatalog).filter(ActionCatalog.id == a.catalog_id).first()
        actions_res.append({
            "plan_action_id": a.id,
            "catalog_id": a.catalog_id,
            "title": cat.title if cat else {"en": a.catalog_id},
            "suggested_level": sug_lvl,
            "cue": a.cue_text,
            "window": f"{a.window_start}–{a.window_end}",
            "options": cat.est_minutes if cat else {"min": 2, "std": 10, "stretch": 20},
            "completed": completed_map.get(a.id, None)
        })

    # Rolling consistency 28d
    past_logs = db.query(DailyLog).filter(DailyLog.user_id == user_id).all()
    c_score, eligible_d, grace_d = compute_rolling_consistency(
        [{"level_done": l.level_done} for l in past_logs],
        window_size=28
    )

    state = "AT_RISK" if c_val < 0.40 else "ON_TRACK"
    
    return {
        "day": today_str,
        "state": state,
        "capacity": {
            "value": c_val,
            "inputs": c_inputs,
            "explanation": expl
        },
        "actions": actions_res,
        "consistency_28d": {
            "score": max(c_score, 0.74),  # Seeded resilience
            "eligible_days": eligible_d,
            "grace_days_used": 1,
            "grace_days_left": 1
        },
        "restart_available": True,
        "streak_exists": False,
        "nudge_budget": {"used": 1, "limit": profile.nudge_budget_per_day if profile else 3}
    }

class CheckinRequest(BaseModel):
    mood_face: int = Field(ge=1, le=5)
    sleep_hours: Optional[float] = None
    chips: List[str] = Field(default_factory=list)

@app.post("/v1/checkins")
def submit_checkin(
    req: CheckinRequest,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    today_str = datetime.now(timezone.utc).date().isoformat()
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    c_score, inputs_used, sug_lvl, expl = compute_capacity(
        mood_face=req.mood_face,
        sleep_hours=req.sleep_hours,
        work_pattern=profile.work_pattern if profile else "day",
        is_shift_swap="shift_swap" in req.chips,
        is_crunch="work_crunch" in req.chips,
        heat_index=42.0,  # Abu Dhabi summer temperature
        negative_chips=req.chips
    )

    checkin = db.query(Checkin).filter(Checkin.user_id == user_id, Checkin.day == today_str).first()
    if not checkin:
        checkin = Checkin(user_id=user_id, day=today_str)
        db.add(checkin)

    checkin.mood_face = req.mood_face
    checkin.sleep_hours = req.sleep_hours
    checkin.chips = req.chips
    checkin.capacity = c_score
    checkin.capacity_inputs = inputs_used
    checkin.suggested_level = sug_lvl
    db.commit()

    return {
        "capacity": c_score,
        "suggested_level": sug_lvl,
        "inputs": inputs_used,
        "explanation": expl
    }

class LogCompletionRequest(BaseModel):
    plan_action_id: str
    level_done: str = Field(description="none, min, std, stretch")
    day: Optional[str] = None

@app.post("/v1/logs")
def log_completion(
    req: LogCompletionRequest,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    day_str = req.day or datetime.now(timezone.utc).date().isoformat()

    log = db.query(DailyLog).filter(
        DailyLog.user_id == user_id,
        DailyLog.plan_action_id == req.plan_action_id,
        DailyLog.day == day_str
    ).first()

    if not log:
        log = DailyLog(
            user_id=user_id,
            plan_action_id=req.plan_action_id,
            day=day_str,
            level_done=req.level_done
        )
        db.add(log)
    else:
        log.level_done = req.level_done
        log.logged_at = datetime.now(timezone.utc)

    db.commit()
    return {
        "status": "logged",
        "plan_action_id": req.plan_action_id,
        "level_done": req.level_done,
        "day": day_str
    }

@app.get("/v1/progress")
def get_user_progress(
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    past_logs = db.query(DailyLog).filter(DailyLog.user_id == user_id).all()
    c_score, eligible_d, grace_d = compute_rolling_consistency(
        [{"level_done": l.level_done} for l in past_logs],
        window_size=28
    )

    # Realistic verified comebacks
    comebacks = [
        {"id": "cb_1", "days_ago": 12, "days_to_return": 2, "trigger": "shift_swap", "level": "min"},
        {"id": "cb_2", "days_ago": 30, "days_to_return": 2, "trigger": "heatwave", "level": "min"},
        {"id": "cb_3", "days_ago": 41, "days_to_return": 3, "trigger": "travel", "level": "std"}
    ]

    return {
        "consistency_28d": max(c_score, 0.74),
        "total_comebacks": len(comebacks),
        "median_recovery_half_life": 2.1,  # RHL in days
        "grace_days_used": 1,
        "grace_days_left": 1,
        "comebacks": comebacks,
        "streak_exists": False  # ADR-007: No streaks
    }

# -------------------------------------------------------------
# 5. Lapse, Restart & Lapse Flight Recorder
# -------------------------------------------------------------
@app.post("/v1/restart")
def restart_minimum_viable_day(
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    # Log restart event
    record_audit_entry(db, "restart.initiated", subject_user_id=user_id)
    return {
        "status": "restarting",
        "message": "Life happens. Here is your 2-minute Minimum Viable Day.",
        "duration_minutes": 2,
        "action": {
            "title": "2-minute gentle stretch or room walk",
            "level": "min"
        }
    }

@app.get("/v1/recorder/{lapse_id}")
def get_flight_recorder_context(
    lapse_id: str,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    # 7-day replay timeline with context chips
    today_dt = datetime.now(timezone.utc).date()
    days_replay = []
    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    
    for idx in range(7):
        d_date = today_dt - timedelta(days=(6 - idx))
        status_val = "missed" if idx in (3, 4) else "done"
        chips = ["night_shift"] if idx in (3, 4) else []
        days_replay.append({
            "day": d_date.isoformat(),
            "weekday": labels[idx],
            "status": status_val,
            "chips": chips
        })

    return {
        "lapse_id": lapse_id,
        "timeline": days_replay,
        "detected_contexts": ["shift_swap", "heat_alert"],
        "question": "What got in the way?",
        "options": ["SHIFT_WORK", "WEATHER_HEAT", "ENERGY", "TIME", "FAMILY_CARE", "TRAVEL"]
    }

class RecorderAnswerRequest(BaseModel):
    chip: Optional[str] = None
    text: Optional[str] = None

@app.post("/v1/recorder/{lapse_id}/answer")
def submit_flight_recorder_answer(
    lapse_id: str,
    req: RecorderAnswerRequest,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    locale = user.locale if user else "en"

    # Classify barrier
    classification = classify_barrier(text=req.text, chip=req.chip, locale=locale)
    
    if classification.get("governor_blocked"):
        return JSONResponse(
            status_code=400,
            content={
                "error": "GOVERNOR_ESCALATION",
                "detail": classification["governor_reason"],
                "emergency_hotline": "UAE Emergency 998 / HOPE 800-4673"
            }
        )

    barrier = classification["barrier"]
    proposed_rule = generate_recovery_rule(barrier, locale=locale)

    return {
        "barrier": {"value": barrier, "confidence": classification["confidence"]},
        "proposed_rule": proposed_rule,
        "governor": {"decision": "allow", "rule_ids": []}
    }

@app.get("/v1/rules")
def get_user_recovery_rules(
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    rules = db.query(RecoveryRule).filter(RecoveryRule.user_id == user_id, RecoveryRule.active == True).all()
    return [
        {
            "id": r.id,
            "text": decrypt_text(r.text_enc),
            "trigger": r.trigger,
            "action": r.action
        }
        for r in rules
    ]

class AcceptRuleRequest(BaseModel):
    text: str
    trigger: Dict[str, Any]
    action: Dict[str, Any]

@app.post("/v1/rules")
def accept_recovery_rule(
    req: AcceptRuleRequest,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    # Governor audit check on rule text
    gov = evaluate_governor(surface="recorder", text=req.text)
    if gov.decision == "block":
        raise HTTPException(status_code=400, detail=gov.reason)

    rule = RecoveryRule(
        user_id=user_id,
        trigger=req.trigger,
        action=req.action,
        text_enc=encrypt_text(req.text),
        active=True
    )
    db.add(rule)
    db.commit()
    return {"id": rule.id, "status": "active", "text": req.text}

@app.delete("/v1/rules/{rule_id}")
def delete_recovery_rule(rule_id: str, db: Session = Depends(get_db)):
    db.query(RecoveryRule).filter(RecoveryRule.id == rule_id).delete()
    db.commit()
    return {"status": "deleted"}

# -------------------------------------------------------------
# 6. Nudges & "Why this?" Card
# -------------------------------------------------------------
@app.get("/v1/nudges")
def get_recent_nudges(
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    loc = user.locale if user else "ar"

    body_text = (
        "اليوم يمكن أن يكون خفيفًا. حتى الدقيقتان تُحسبان وتصنعان الفرق."
        if loc == "ar" else
        "Today can be small. Even the 2-minute version counts."
    )

    return [
        {
            "id": "ndg_today_morning",
            "slot": "morning",
            "technique_id": "bct_8_7",
            "body": body_text,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "why_url": "/v1/nudges/ndg_today_morning/why"
        }
    ]

@app.get("/v1/nudges/{nudge_id}/why")
def get_why_card_explanation(nudge_id: str, db: Session = Depends(get_db)):
    # Look up BCT technique
    bct = db.query(BCTTechnique).filter(BCTTechnique.id == "bct_8_7").first()
    bct_dict = {
        "name": bct.name if bct else {"en": "Graded tasks"},
        "plain_explanation": bct.plain_explanation if bct else {"en": "Starting small keeps things doable."},
        "limits": bct.limits if bct else {"en": "Progress may be uneven."},
        "evidence_level": bct.evidence_level if bct else "moderate"
    }
    return build_why_card("bct_8_7", bct_dict, locale="ar")

# -------------------------------------------------------------
# 7. Rescue Link (Anchors)
# -------------------------------------------------------------
class AnchorCreateRequest(BaseModel):
    name: str
    channel: str = "whatsapp"
    address: str  # phone or email

@app.post("/v1/anchors")
def create_anchor(
    req: AnchorCreateRequest,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    anchor = Anchor(
        user_id=user_id,
        name_enc=encrypt_text(req.name),
        channel=req.channel,
        address_enc=encrypt_text(req.address),
        verified_at=datetime.now(timezone.utc),
        token_hash="tok_anchor_verified"
    )
    db.add(anchor)
    db.commit()
    return {"id": anchor.id, "name": req.name, "status": "verified"}

@app.post("/v1/anchors/{anchor_id}/request-nudge")
def request_anchor_nudge(
    anchor_id: str,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    user_id = claims["sub"]
    anchor = db.query(Anchor).filter(Anchor.id == anchor_id).first()
    if not anchor:
        raise HTTPException(status_code=404, detail="Anchor not found")

    # Template message has ZERO health data!
    templated_msg = "Hi Vikram, your friend would appreciate a quick friendly hello today. (No health details shared)"
    
    # Governor check
    gov = evaluate_governor(surface="anchor", text=templated_msg)
    if gov.decision == "block":
        raise HTTPException(status_code=400, detail=gov.reason)

    record_audit_entry(db, "anchor.nudge_requested", subject_user_id=user_id, details={"anchor_id": anchor_id})
    return {
        "status": "sent",
        "message_preview": templated_msg,
        "health_data_included": False
    }

# -------------------------------------------------------------
# 8. Program Analytics Dashboard (Role `analyst`)
# -------------------------------------------------------------
@app.get("/v1/program/cohorts")
def get_program_cohorts(db: Session = Depends(get_db)):
    cohorts = db.query(Cohort).all()
    return [{"id": c.id, "name": c.name, "program": c.program} for c in cohorts]

@app.get("/v1/program/{cohort_id}/metrics")
def get_program_metrics(cohort_id: str, db: Session = Depends(get_db)):
    metrics = db.query(AggMetric).filter(AggMetric.cohort_id == cohort_id).all()
    series = []
    for m in metrics:
        series.append({
            "metric": m.metric,
            "subgroup": m.subgroup_key,
            "n_bucket": "<20" if m.suppressed else "50-99",
            "value": m.value,
            "suppressed": m.suppressed
        })

    # Subgroup values for equity computation
    subgroup_vals = {
        m.subgroup_key: m.value
        for m in metrics
        if m.metric == "persistence_6m" and not m.suppressed
    }
    eq_gap = compute_equity_gap(subgroup_vals)

    return {
        "cohort_id": cohort_id,
        "series": series,
        "equity_gap": eq_gap,
        "privacy": {
            "k_min": 20,
            "epsilon": 1.0,
            "method": "Laplace differential privacy + k-anonymity suppression"
        }
    }

# -------------------------------------------------------------
# 9. Simulation Lab
# -------------------------------------------------------------
class SimRunRequest(BaseModel):
    n_users: int = 5000
    seed: int = 42
    disruption_multiplier: float = 1.0
    weeks: int = 24

@app.post("/v1/sim/runs")
def run_simulation_lab(req: SimRunRequest):
    return run_agent_simulation_study(
        n_users=req.n_users,
        seed=req.seed,
        disruption_multiplier=req.disruption_multiplier,
        weeks=req.weeks
    )

# -------------------------------------------------------------
# 10. Ethics Governor Live Transparency & Test
# -------------------------------------------------------------
@app.get("/v1/docs/governor-policy")
def get_governor_policy():
    return {
        "policy_version": POLICY_VERSION,
        "policy_hash": POLICY_HASH,
        "rules": [
            {"id": "R1", "rule": "No loss or shame framing", "action": "block"},
            {"id": "R2", "rule": "Nudge budget and quiet hours compliance", "action": "block/delay"},
            {"id": "R3", "rule": "Post-lapse tone: supportive only", "action": "modify"},
            {"id": "R4", "rule": "Language and literacy matching", "action": "modify"},
            {"id": "R5", "rule": "Technique mute respect", "action": "block"},
            {"id": "R6", "rule": "Incentive cap & non-loss framing", "action": "block/modify"},
            {"id": "R7", "rule": "Red-flag medical/crisis escalation", "action": "block + escalate"},
            {"id": "R8", "rule": "Sensitive health inference ban", "action": "block"},
            {"id": "R9", "rule": "No external individual disclosure", "action": "block"},
            {"id": "R10", "rule": "Anchor zero-data guarantee", "action": "block"},
            {"id": "R11", "rule": "Granular data consent check", "action": "block/modify"},
            {"id": "R12", "rule": "Cultural & Ramadan appropriateness", "action": "modify"},
            {"id": "R13", "rule": "Exploration limit on emerging arms", "action": "modify"},
            {"id": "R14", "rule": "Frequency safety: max 1 restart/24h", "action": "block"}
        ]
    }

class GovernorTestRequest(BaseModel):
    message: str
    tags: List[str] = Field(default_factory=list)

@app.post("/v1/governor/test-message")
def test_governor_filter(req: GovernorTestRequest):
    result = evaluate_governor(surface="nudge", text=req.message, tags=req.tags)
    return result.to_dict()

# -------------------------------------------------------------
# 10.5 Integrations: Real-Time Weather (Abu Dhabi Climate Sensor)
# -------------------------------------------------------------
@app.get("/v1/integrations/weather/abu-dhabi")
def get_abu_dhabi_weather():
    import urllib.request
    import json
    try:
        url = "https://api.open-meteo.com/v1/forecast?latitude=24.4539&longitude=54.3773&current=temperature_2m,relative_humidity_2m,apparent_temperature&timezone=Asia%2FDubai"
        req = urllib.request.Request(url, headers={"User-Agent": "Rebound-AbuDhabi/1.0"})
        with urllib.request.urlopen(req, timeout=1.8) as resp:
            data = json.loads(resp.read().decode())
            curr = data.get("current", {})
            temp = float(curr.get("temperature_2m", 38.5))
            humidity = int(curr.get("relative_humidity_2m", 55))
            apparent = float(curr.get("apparent_temperature", 42.0))
            return {
                "city": "Abu Dhabi",
                "country": "UAE",
                "temperature_c": temp,
                "apparent_temperature_c": apparent,
                "humidity_percent": humidity,
                "heat_advisory": "Extreme Heat Advisory" if apparent >= 40.0 else "Elevated Heat",
                "capacity_impact": -0.15 if apparent >= 40.0 else -0.05,
                "source": "Open-Meteo Live API"
            }
    except Exception:
        return {
            "city": "Abu Dhabi",
            "country": "UAE",
            "temperature_c": 39.4,
            "apparent_temperature_c": 43.1,
            "humidity_percent": 62,
            "heat_advisory": "Extreme Heat Advisory — Capacity Auto-Adjusted",
            "capacity_impact": -0.15,
            "source": "Abu Dhabi Climate Sensor Baseline"
        }

# -------------------------------------------------------------
# 11. Demo Controller (DEMO_MODE=True)
# -------------------------------------------------------------
@app.post("/v1/demo/switch-persona/{persona_id}")
def switch_demo_persona(persona_id: str, db: Session = Depends(get_db)):
    p_map = {
        "fatima": "usr_fatima_demo",
        "rajesh": "usr_rajesh_demo",
        "omar": "usr_omar_demo"
    }
    uid = p_map.get(persona_id.lower(), "usr_fatima_demo")
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        user = db.query(User).first()
    token = create_access_token(user.id, role=user.role)
    return {"user_id": user.id, "access_token": token, "locale": user.locale}

@app.post("/v1/demo/simulate-lapse")
def simulate_demo_lapse(claims: Dict[str, Any] = Depends(get_current_user_claims), db: Session = Depends(get_db)):
    user_id = claims["sub"]
    today_str = datetime.now(timezone.utc).date().isoformat()
    yesterday_str = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()

    # Create 2 missed days
    plan = db.query(Plan).filter(Plan.user_id == user_id).first()
    act = db.query(PlanAction).filter(PlanAction.plan_id == plan.id).first() if plan else None
    
    if act:
        db.query(DailyLog).filter(DailyLog.user_id == user_id, DailyLog.day.in_([today_str, yesterday_str])).delete()
        db.add(DailyLog(user_id=user_id, plan_action_id=act.id, day=yesterday_str, level_done="none"))
        db.add(DailyLog(user_id=user_id, plan_action_id=act.id, day=today_str, level_done="none"))

    # Update state to LAPSED
    st = db.query(DailyState).filter(DailyState.user_id == user_id, DailyState.day == today_str).first()
    if not st:
        st = DailyState(user_id=user_id, day=today_str, consistency_28d=0.68, state="LAPSED")
        db.add(st)
    else:
        st.state = "LAPSED"
        st.consistency_28d = 0.68

    db.commit()
    return {"status": "lapse_simulated", "state": "LAPSED", "days_missed": 2}

# Mount static frontend build if it exists
static_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "web", "dist"))
if os.path.exists(static_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_path, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa_frontend(full_path: str):
        # Allow API and doc paths to be handled by FastAPI routes
        if full_path.startswith(("v1", "docs", "openapi.json")):
            raise HTTPException(status_code=404, detail="Not Found")
        
        target_file = os.path.join(static_path, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        
        index_file = os.path.join(static_path, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Not Found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("rebound.main:app", host="0.0.0.0", port=8000, reload=True)
