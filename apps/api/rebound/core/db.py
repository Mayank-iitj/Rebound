import json
import uuid
from datetime import datetime, timezone
from typing import Generator

from sqlalchemy import (
    create_engine, Column, String, Integer, Float, Boolean,
    DateTime, Date, Text, ForeignKey, JSON
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from rebound.core.config import settings

Base = declarative_base()

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    email_hash = Column(String, unique=True, nullable=False)
    email_enc = Column(Text, nullable=False)
    role = Column(String, nullable=False, default="user")  # user, analyst, clinician, admin
    locale = Column(String, nullable=False, default="en")
    timezone = Column(String, nullable=False, default="Asia/Dubai")
    status = Column(String, nullable=False, default="active")  # active, paused, deleted
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Consent(Base):
    __tablename__ = "consents"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scope = Column(String, nullable=False)  # wearable, health_age, patient_app, weather_location, notifications, care_team_share, research_aggregate
    granted = Column(Boolean, nullable=False)
    policy_version = Column(String, nullable=False, default="1.0")
    ts = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Profile(Base):
    __tablename__ = "profiles"
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    display_name_enc = Column(Text)
    age_band = Column(String, default="25-34")
    gender_group = Column(String, default="prefer_not_to_say")
    nationality_group = Column(String, default="general")
    work_pattern = Column(String, default="day")  # day, night, rotating, outdoor, home, unemployed, other
    ramadan_observing = Column(Boolean, default=False)
    accessibility_tags = Column(JSON, default=list)  # e.g. ["wheelchair", "low_vision", "hearing", "low_literacy"]
    literacy_mode = Column(String, default="standard")  # standard, low_literacy_audio
    city = Column(String, default="Abu Dhabi")
    quiet_hours = Column(JSON, default=lambda: {"start": "22:00", "end": "07:00"})
    nudge_budget_per_day = Column(Integer, default=3)
    channels = Column(JSON, default=lambda: {"push": True, "email": False, "whatsapp": False, "sms": False})
    muted_techniques = Column(JSON, default=list)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class ContextEvent(Base):
    __tablename__ = "context_events"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    kind = Column(String, nullable=False)  # shift_swap, travel, illness, heat_alert, ramadan, family_event, work_crunch, pause, custom
    starts_on = Column(String, nullable=False)  # YYYY-MM-DD
    ends_on = Column(String)
    source = Column(String, nullable=False, default="user")  # user, weather, system
    note_enc = Column(Text)

class ActionCatalog(Base):
    __tablename__ = "action_catalog"
    id = Column(String, primary_key=True)  # e.g. mv_walk
    behavior = Column(String, nullable=False)  # movement, sleep, nutrition, smoking
    title = Column(JSON, nullable=False)  # {"en": "...", "ar": "...", "hi": "..."}
    instructions = Column(JSON, nullable=False)
    indoor = Column(Boolean, default=True)
    equipment = Column(JSON, default=list)
    accessibility_tags = Column(JSON, default=list)
    est_minutes = Column(JSON, nullable=False)  # {"min": 2, "std": 10, "stretch": 20}
    effort_cost = Column(Float, default=1.0)
    safety_notes = Column(JSON, default=dict)
    active = Column(Boolean, default=True)

class Goal(Base):
    __tablename__ = "goals"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    behavior = Column(String, nullable=False)
    text_enc = Column(Text, nullable=False)
    structured = Column(JSON, default=dict)
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Plan(Base):
    __tablename__ = "plans"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, default="draft")  # draft, active, archived
    survivability_score = Column(Float)
    survivability_detail = Column(JSON)
    committed_at = Column(DateTime(timezone=True))
    version = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class PlanAction(Base):
    __tablename__ = "plan_actions"
    id = Column(String, primary_key=True, default=generate_uuid)
    plan_id = Column(String, ForeignKey("plans.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal_id = Column(String, ForeignKey("goals.id"))
    catalog_id = Column(String, ForeignKey("action_catalog.id"), nullable=False)
    cue_text = Column(JSON, default=dict)  # {"en": "After wake up", "ar": "..."}
    window_start = Column(String, default="17:00")
    window_end = Column(String, default="19:00")
    days_of_week = Column(JSON, default=lambda: [1,2,3,4,5,6,7])
    fallback_catalog_id = Column(String, ForeignKey("action_catalog.id"))
    is_active = Column(Boolean, default=True)

class RecoveryRule(Base):
    __tablename__ = "recovery_rules"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    trigger = Column(JSON, nullable=False)  # {"context": "shift_swap", "condition": "missed_days>=2"}
    action = Column(JSON, nullable=False)   # {"level": "min", "catalog_id": "mv_stretch_2", "when": "first_day_off"}
    text_enc = Column(Text, nullable=False)
    origin_lapse_id = Column(String)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Checkin(Base):
    __tablename__ = "checkins"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    day = Column(String, nullable=False)  # YYYY-MM-DD
    mood_face = Column(Integer)  # 1..5
    sleep_hours = Column(Float)
    chips = Column(JSON, default=list)
    capacity = Column(Float)
    capacity_inputs = Column(JSON, default=list)
    suggested_level = Column(String, default="min")  # min, std, stretch

class DailyLog(Base):
    __tablename__ = "daily_logs"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_action_id = Column(String, ForeignKey("plan_actions.id", ondelete="CASCADE"), nullable=False)
    day = Column(String, nullable=False)
    level_done = Column(String, nullable=False)  # none, min, std, stretch
    source = Column(String, default="manual")
    logged_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class DailyState(Base):
    __tablename__ = "daily_state"
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    day = Column(String, primary_key=True)
    consistency_28d = Column(Float, nullable=False, default=0.0)
    eligible_days_28d = Column(Integer, nullable=False, default=28)
    grace_days_used_28d = Column(Integer, default=0)
    p_lapse_3d = Column(Float, default=0.1)
    feature_version = Column(String, default="v1.0")
    state = Column(String, default="ON_TRACK")  # ON_TRACK, AT_RISK, LAPSED, RESTARTING, PAUSED

class Signal(Base):
    __tablename__ = "signals"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    source = Column(String, nullable=False)
    kind = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String)
    observed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class LapseEvent(Base):
    __tablename__ = "lapse_events"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    detected_on = Column(String, nullable=False)
    resolved_on = Column(String)
    days_missed = Column(Integer, default=2)
    context_snapshot = Column(JSON, default=dict)
    barrier = Column(String)
    barrier_confidence = Column(Float)
    barrier_text_enc = Column(Text)
    recovery_days = Column(Integer)

class BCTTechnique(Base):
    __tablename__ = "bct_techniques"
    id = Column(String, primary_key=True)
    name = Column(JSON, nullable=False)
    plain_explanation = Column(JSON, nullable=False)
    evidence_level = Column(String, default="moderate")  # strong, moderate, emerging
    limits = Column(JSON, default=dict)
    incentive = Column(Boolean, default=False)

class NudgeTemplate(Base):
    __tablename__ = "nudge_templates"
    id = Column(String, primary_key=True)
    technique_id = Column(String, ForeignKey("bct_techniques.id"))
    slot = Column(String, nullable=False)  # morning, pre_window, evening, restart
    locale = Column(String, nullable=False, default="en")
    body = Column(Text, nullable=False)
    tags = Column(JSON, default=list)
    reading_level = Column(String, default="standard")

class NudgeDecision(Base):
    __tablename__ = "nudge_decisions"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    decided_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    slot = Column(String, nullable=False)
    eligible = Column(Boolean, nullable=False)
    send_prob = Column(Float, nullable=False)
    sent = Column(Boolean, nullable=False)
    arm = Column(String)
    template_id = Column(String)
    governor = Column(JSON, default=dict)
    context = Column(JSON, default=dict)

class NudgeOutcome(Base):
    __tablename__ = "nudge_outcomes"
    decision_id = Column(String, ForeignKey("nudge_decisions.id", ondelete="CASCADE"), primary_key=True)
    delivered = Column(Boolean, default=True)
    opened_at = Column(DateTime(timezone=True))
    dismissed_fast = Column(Boolean, default=False)
    muted_technique = Column(Boolean, default=False)
    completed_within_4h = Column(Boolean, default=False)
    completed_level = Column(String)

class BanditPosterior(Base):
    __tablename__ = "bandit_posteriors"
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    arm = Column(String, primary_key=True)
    alpha = Column(Float, default=1.0)
    beta = Column(Float, default=1.0)
    n = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class GovernorDecision(Base):
    __tablename__ = "governor_decisions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    subject_user_id = Column(String)
    surface = Column(String, nullable=False)
    decision = Column(String, nullable=False)  # allow, modify, block
    rule_ids = Column(JSON, default=list)
    policy_hash = Column(String, nullable=False)
    reason = Column(String)
    ts = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Anchor(Base):
    __tablename__ = "anchors"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name_enc = Column(Text, nullable=False)
    channel = Column(String, default="whatsapp")
    address_enc = Column(Text, nullable=False)
    verified_at = Column(DateTime(timezone=True))
    revoked_at = Column(DateTime(timezone=True))
    token_hash = Column(String, nullable=False)

class AnchorRequest(Base):
    __tablename__ = "anchor_requests"
    id = Column(String, primary_key=True, default=generate_uuid)
    anchor_id = Column(String, ForeignKey("anchors.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, nullable=False)
    template_id = Column(String, nullable=False)
    sent_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Cohort(Base):
    __tablename__ = "cohorts"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    program = Column(String, default="workplace")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class AggMetric(Base):
    __tablename__ = "agg_metrics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    cohort_id = Column(String, nullable=False)
    metric = Column(String, nullable=False)
    subgroup_key = Column(String, default="all")
    period = Column(String, nullable=False)
    n = Column(Integer, nullable=False)
    value = Column(Float)
    suppressed = Column(Boolean, nullable=False)
    epsilon = Column(Float, default=1.0)
    released_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class SimRun(Base):
    __tablename__ = "sim_runs"
    id = Column(String, primary_key=True, default=generate_uuid)
    created_by = Column(String)
    seed = Column(Integer, default=42)
    config = Column(JSON, default=dict)
    status = Column(String, default="done")
    result_uri = Column(String)
    summary = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    finished_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

# Engine & Session Setup
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

