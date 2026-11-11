# Rebound — Data Model

PostgreSQL 16. All tables have `created_at timestamptz default now()`; mutable tables also `updated_at` and `version int default 1`. UUIDs via `gen_random_uuid()`.

## 1. Conventions
- `user_id` on every user-scoped table; RLS policy `USING (user_id = current_setting('app.user_id')::uuid)`.
- Free-text fields marked `ENC` are AES-GCM encrypted at the application layer (stored as `bytea`).
- No `streak` columns anywhere (ADR-007).
- Enumerations as Postgres `enum` types or `text` + `CHECK` for portability.

## 2. Identity, Consent, Audit
```sql
CREATE TYPE role_t AS ENUM ('user','analyst','clinician','admin');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash bytea UNIQUE NOT NULL,        -- HMAC of normalized email
  email_enc bytea NOT NULL,                -- ENC
  role role_t NOT NULL DEFAULT 'user',
  locale text NOT NULL DEFAULT 'en',
  timezone text NOT NULL DEFAULT 'Asia/Dubai',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('wearable','health_age','patient_app','weather_location','notifications','care_team_share','research_aggregate')),
  granted boolean NOT NULL,
  policy_version text NOT NULL,
  ts timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON consents (user_id, scope, ts DESC);
-- current state view: latest row per (user_id, scope)

CREATE TABLE audit_log (
  id bigserial PRIMARY KEY,
  actor_id uuid,                           -- user or role actor
  actor_role role_t,
  subject_user_id uuid,
  action text NOT NULL,                    -- e.g. consent.changed, export.requested, aggregate.release
  details jsonb NOT NULL DEFAULT '{}',
  prev_hash bytea,
  hash bytea NOT NULL,                     -- sha256(prev_hash || canonical(row))
  ts timestamptz NOT NULL DEFAULT now()
);
-- append-only: revoke UPDATE/DELETE; trigger blocks modification
```

## 3. Profile & Context
```sql
CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name_enc bytea,
  age_band text,                           -- '18-24','25-34',...
  gender_group text,                       -- optional; user-defined, used only for equity aggregates if consented
  nationality_group text,                  -- optional coarse group; equity aggregates only
  work_pattern text CHECK (work_pattern IN ('day','night','rotating','outdoor','home','unemployed','other')),
  ramadan_observing boolean DEFAULT false,
  accessibility_tags text[] DEFAULT '{}',  -- e.g. wheelchair, low_vision, hearing, low_literacy
  literacy_mode text DEFAULT 'standard' CHECK (literacy_mode IN ('standard','low_literacy_audio')),
  city text DEFAULT 'Abu Dhabi',
  quiet_hours jsonb DEFAULT '{"start":"22:00","end":"07:00"}',
  nudge_budget_per_day int DEFAULT 3 CHECK (nudge_budget_per_day BETWEEN 0 AND 6),
  channels jsonb DEFAULT '{"push":true,"email":false,"whatsapp":false,"sms":false}',
  muted_techniques text[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE context_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('shift_swap','travel','illness','heat_alert','ramadan','family_event','work_crunch','pause','custom')),
  starts_on date NOT NULL,
  ends_on date,
  source text NOT NULL CHECK (source IN ('user','weather','system')),
  note_enc bytea
);
CREATE INDEX ON context_events (user_id, starts_on);
```

## 4. Plans
```sql
CREATE TYPE behavior_t AS ENUM ('movement','sleep','nutrition','smoking');

CREATE TABLE action_catalog (
  id text PRIMARY KEY,                     -- e.g. mv_walk_10
  behavior behavior_t NOT NULL,
  title jsonb NOT NULL,                    -- {"en":"...","ar":"..."}
  instructions jsonb NOT NULL,             -- per level and locale
  indoor boolean DEFAULT true,
  equipment text[] DEFAULT '{}',
  accessibility_tags text[] DEFAULT '{}',  -- supports: wheelchair_ok, seated_ok, no_equipment, audio_ok
  est_minutes jsonb NOT NULL,              -- {"min":2,"std":10,"stretch":20}
  effort_cost numeric NOT NULL DEFAULT 1,  -- used by patch search
  safety_notes jsonb DEFAULT '{}',
  active boolean DEFAULT true
);

CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  behavior behavior_t NOT NULL,
  text_enc bytea NOT NULL,                 -- user's own words
  structured jsonb NOT NULL,               -- {metric, target, timeframe, ...}
  status text DEFAULT 'active' CHECK (status IN ('active','paused','achieved','dropped')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  survivability_score numeric,             -- k/n stored as fraction
  survivability_detail jsonb,
  committed_at timestamptz,
  version int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE plan_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES goals(id),
  catalog_id text NOT NULL REFERENCES action_catalog(id),
  cue_text jsonb,                          -- {"en":"After Maghrib prayer"}
  window_start time,
  window_end time,
  days_of_week smallint[] DEFAULT '{1,2,3,4,5,6,7}',
  fallback_catalog_id text REFERENCES action_catalog(id),
  is_active boolean DEFAULT true
);
CREATE INDEX ON plan_actions (user_id, plan_id);

CREATE TABLE recovery_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trigger jsonb NOT NULL,                  -- {"context":"shift_swap","condition":"missed_days>=2"}
  action jsonb NOT NULL,                   -- {"level":"min","catalog_id":"mv_stretch_2","when":"first_day_off"}
  text_enc bytea NOT NULL,                 -- human-readable if-then
  origin_lapse_id uuid,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

## 5. Daily Operations
```sql
CREATE TABLE checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day date NOT NULL,
  mood_face smallint CHECK (mood_face BETWEEN 1 AND 5),
  sleep_hours numeric,
  chips text[] DEFAULT '{}',               -- e.g. tired, busy, pain, travel
  capacity numeric,                        -- C_t (0..1)
  capacity_inputs jsonb,                   -- explanation vector
  suggested_level text CHECK (suggested_level IN ('min','std','stretch')),
  UNIQUE (user_id, day)
);

CREATE TABLE daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_action_id uuid NOT NULL REFERENCES plan_actions(id) ON DELETE CASCADE,
  day date NOT NULL,
  level_done text NOT NULL CHECK (level_done IN ('none','min','std','stretch')),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','wearable','auto')),
  logged_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_action_id, day)
);
CREATE INDEX ON daily_logs (user_id, day);

CREATE TABLE daily_state (                 -- written by daily_rollup
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day date NOT NULL,
  consistency_28d numeric NOT NULL,
  eligible_days_28d int NOT NULL,
  grace_days_used_28d int NOT NULL DEFAULT 0,
  p_lapse_3d numeric,
  feature_version text,
  state text NOT NULL CHECK (state IN ('ON_TRACK','AT_RISK','LAPSED','RESTARTING','PAUSED')),
  PRIMARY KEY (user_id, day)
);

CREATE TABLE signals (                     -- wearable/health-age/patient-app (mock or live)
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source text NOT NULL,
  kind text NOT NULL,                      -- steps, sleep_hours, hr_rest, health_age, bp_sys, bp_dia, hba1c, weight_kg, cigarettes
  value numeric NOT NULL,
  unit text,
  observed_at timestamptz NOT NULL
);
CREATE INDEX ON signals (user_id, kind, observed_at DESC);
```

## 6. Lapse, Recorder, Nudges
```sql
CREATE TABLE lapse_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  detected_on date NOT NULL,
  resolved_on date,
  days_missed int,
  context_snapshot jsonb,                  -- chips, events, weather during lapse window
  barrier text,                            -- taxonomy value
  barrier_confidence numeric,
  barrier_text_enc bytea,
  recovery_days int                        -- days to return (for RHL)
);

CREATE TABLE bct_techniques (
  id text PRIMARY KEY,                     -- e.g. bct_1_4
  name jsonb NOT NULL,
  plain_explanation jsonb NOT NULL,
  evidence_level text CHECK (evidence_level IN ('strong','moderate','emerging')),
  limits jsonb NOT NULL,
  incentive boolean DEFAULT false
);

CREATE TABLE nudge_templates (
  id text PRIMARY KEY,
  technique_id text REFERENCES bct_techniques(id),
  slot text CHECK (slot IN ('morning','pre_window','evening','restart')),
  locale text NOT NULL,
  body text NOT NULL,
  tags text[] DEFAULT '{}',                -- gain_framed, neutral, identity, planning, social...
  reading_level text DEFAULT 'standard'
);

CREATE TABLE nudge_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  decided_at timestamptz NOT NULL DEFAULT now(),
  slot text NOT NULL,
  eligible boolean NOT NULL,
  send_prob numeric NOT NULL,              -- propensity pi
  sent boolean NOT NULL,
  arm text,                                -- technique|slot|channel
  template_id text,
  governor jsonb,                          -- {decision, rule_ids, policy_hash}
  context jsonb                            -- capacity, state, flags (for causal analysis)
);
CREATE INDEX ON nudge_decisions (user_id, decided_at DESC);

CREATE TABLE nudge_outcomes (
  decision_id uuid PRIMARY KEY REFERENCES nudge_decisions(id) ON DELETE CASCADE,
  delivered boolean,
  opened_at timestamptz,
  dismissed_fast boolean,                  -- <5s
  muted_technique boolean,
  completed_within_4h boolean,
  completed_level text
);

CREATE TABLE bandit_posteriors (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  arm text NOT NULL,
  alpha numeric NOT NULL,
  beta numeric NOT NULL,
  n int NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, arm)
);

CREATE TABLE governor_decisions (          -- also embedded in nudge_decisions; separate for non-nudge uses
  id bigserial PRIMARY KEY,
  subject_user_id uuid,
  surface text NOT NULL,                   -- nudge, anchor, recorder_copy, export
  decision text NOT NULL CHECK (decision IN ('allow','modify','block')),
  rule_ids text[] NOT NULL,
  policy_hash text NOT NULL,
  ts timestamptz DEFAULT now()
);
```

## 7. Anchors
```sql
CREATE TABLE anchors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name_enc bytea NOT NULL,
  channel text NOT NULL CHECK (channel IN ('whatsapp','sms','email')),
  address_enc bytea NOT NULL,
  verified_at timestamptz,
  revoked_at timestamptz,
  token_hash bytea NOT NULL
);

CREATE TABLE anchor_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anchor_id uuid NOT NULL REFERENCES anchors(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  template_id text NOT NULL,
  sent_at timestamptz DEFAULT now()
);
```

## 8. Analytics (aggregate only; readable by `analytics_ro`)
```sql
CREATE TABLE cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  program text,                            -- workplace / community / clinic
  created_at timestamptz DEFAULT now()
);
CREATE TABLE cohort_members (cohort_id uuid REFERENCES cohorts(id), user_id uuid REFERENCES users(id), PRIMARY KEY (cohort_id, user_id));

CREATE TABLE agg_metrics (
  id bigserial PRIMARY KEY,
  cohort_id uuid NOT NULL,
  metric text NOT NULL,                    -- persistence_6m, rhl_median, resume_7d, retention_3m, outcome_delta_bp, equity_gap
  subgroup_key text NOT NULL DEFAULT 'all',-- language:ar, age:25-34, ...
  period text NOT NULL,                    -- '2026-11'
  n int NOT NULL,                          -- true n retained internally; API exposes bucket only
  value numeric,                           -- noisy value, NULL if suppressed
  suppressed boolean NOT NULL,
  epsilon numeric,
  released_at timestamptz DEFAULT now()
);
GRANT SELECT ON agg_metrics TO analytics_ro;
-- analytics_ro has no access to any other table
```

## 9. Simulation
```sql
CREATE TABLE sim_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES users(id),
  seed bigint NOT NULL,
  config jsonb NOT NULL,                   -- arms, n_users, disruption rates, parameter ranges
  status text DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed')),
  result_uri text,
  summary jsonb,
  created_at timestamptz DEFAULT now(),
  finished_at timestamptz
);
```

## 10. Retention & Deletion
| Data | Retention |
|------|-----------|
| `signals` raw | 90 days → rolled into `daily_state`/summary |
| `daily_logs`, `checkins` | life of account + 12 months |
| `nudge_*` | 12 months |
| `audit_log` | 24 months (hash chain retained; subject linkage removed on deletion) |
| `agg_metrics` | indefinite (no identifiers) |
| Account deletion | Hard delete user-scoped rows via cascade within 7 days (immediate in `DEMO_MODE`); audit entries pseudonymized |

## 11. Row-Level Security Pattern
```sql
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_isolation ON daily_logs
  USING (user_id = current_setting('app.user_id', true)::uuid);
-- API sets: SET LOCAL app.user_id = '<uuid>' per transaction.
-- Worker uses role with BYPASSRLS limited to specific jobs; every worker query scoped by explicit user_id.
-- analytics_ro: no RLS needed (only aggregate table access).
```

## 12. Seed Data
`make seed` generates 6 personas × 90 days of history plus 500 synthetic users for dashboards. Deterministic via seed. Includes action catalog (~40 actions), BCT table (≥ 12), templates (EN/AR), scenario YAMLs.
