# Rebound — Technical Requirements Document (TRD)

Version 1.0 · Companion to PRD.md

## 1. Technical Objectives
1. Deliver P0 features (F1–F9, F11–F13, F15) as a reliable, demo-stable MVP.
2. Make the learning loop **auditable**: every nudge decision logs context, arm, propensity, Governor verdict, outcome.
3. Make privacy and ethics **architectural**, not policy: row-level security, consent middleware, aggregate-only views, Governor as mandatory pipeline stage.
4. Keep the system modular so connectors and models can be swapped without touching clients.

## 2. System Constraints
- Modular monolith (FastAPI) + worker; single Postgres; Redis for queues/cache.
- Stateless API instances; all state in Postgres/Redis.
- Deterministic simulation (seeded) for reproducibility.
- LLM use is optional at runtime: system must function end-to-end with template fallbacks.

## 3. Module Specifications

### 3.1 Identity & Consent (`identity`)
- Auth: email magic link (MVP); passkeys and national-ID SSO as later adapters behind `AuthProvider` interface.
- Tokens: JWT access (15 min) + rotating refresh (14 days, httpOnly cookie, SameSite=Lax). Roles: `user`, `analyst`, `clinician`, `admin`.
- Consent: `consents(user_id, scope, granted, version, ts)`; scopes: `wearable`, `health_age`, `patient_app`, `weather_location`, `notifications`, `care_team_share`, `research_aggregate`.
- Middleware `require_consent(scope)` guards any code path reading scoped data; failure → 403 `CONSENT_REQUIRED`.

### 3.2 Profile & Context (`profile`, `context`)
- Stores language, culture flags (ramadan_observing), work pattern (day/night/rotating/outdoor), mobility/accessibility tags, literacy mode, coarse location (city-level).
- Context events: shift_swap, travel, illness, heat_alert, ramadan_window, family_event, custom; sourced from user input, weather API, calendar-lite (user-entered).

### 3.3 Plans (`plans`)
- Domain: Goal → Plan → Action → ActionLevel(min/std/stretch) → Schedule(window, cue).
- Action library (`action_catalog`) seeded with vetted actions per behavior, tagged for accessibility/indoor/equipment/time.
- Plan generation: deterministic catalog search + optional LLM to phrase (schema-bound). LLM may only select catalog items and fill allowed slots.

### 3.4 Capacity (`capacity`)
- Computes C_t per ml-spec §1; persists daily with input vector and explanation string.

### 3.5 Logging & Progress (`logs`, `progress`)
- `daily_logs` per action per day: level_done ∈ {none, min, std, stretch}, source (manual/wearable/auto), timestamp.
- Consistency Score per ml-spec §2; materialized daily by worker; recomputed on edits.

### 3.6 Crash-Test (`crashtest`)
- Pure-Python/Numpy simulator; vectorized over runs; scenario library in versioned YAML.
- Interface: `simulate(plan, profile, scenarios, n_runs, seed) -> CrashTestResult`.
- Patch search: greedy edits with effort cost; returns ranked patches with predicted delta.

### 3.7 Lapse & Risk (`lapse`)
- Daily job computes features and hazard probability p_lapse_3d.
- State machine: `ON_TRACK → AT_RISK → LAPSED → RESTARTING → ON_TRACK`. Transition rules in systemdesign.md §4.
- Emits events: `risk.raised`, `lapse.detected`, `restart.completed`.

### 3.8 Flight Recorder & Rules (`recorder`)
- Builds replay timeline; barrier classification (rule-based + LLM-assisted with schema); generates recovery-rule proposals; persists accepted rules; rule matcher triggers on context events.

### 3.9 Nudge Engine (`nudges`)
- Decision points scheduler → candidate generation (technique × slot × channel arms) → Thompson sampling → template selection/localization → Governor → delivery → outcome attribution (4 h window).
- Micro-randomization: send prob π_t ∈ [0.2, 0.8] (default 0.6), propensity logged.

### 3.10 Ethics Governor (`governor`)
- Pure function pipeline: `evaluate(candidate, user_state, policy) -> Decision{allow|modify|block, reasons[], rule_ids[]}`.
- Policies versioned; decisions persisted; policy hash stored with each decision.

### 3.11 Anchors (`anchors`)
- Token-based verification; outbound message from fixed template set; no data in payloads; rate limit 1 request/user/day by default.

### 3.12 Integrations (`integrations`)
- Adapter interfaces: `WearableAdapter`, `HealthAgeAdapter`, `PatientAppAdapter`, `WeatherAdapter`, `MessagingAdapter`, `LLMAdapter`. MVP implementations: Mock (synthetic generators), Open-Meteo weather, console/Mailpit email, WhatsApp stub (logs + simulator UI).

### 3.13 Analytics & Privacy (`analytics`)
- Separate DB role `analytics_ro` with access only to aggregate views.
- Metric computation jobs write to `agg_*` tables with k-suppression and Laplace noise at release time.
- Equity module computes subgroup metrics and gaps.

### 3.14 Simulation Lab (`sim`)
- Agent-based simulator (vectorized) with disruption processes; policy arms (B0–B3); outputs time series and CSV; seed-controlled.

## 4. Non-Functional Requirements
| Area | Requirement |
|------|-------------|
| Performance | API p95 < 300 ms (non-sim); Crash-Test p95 < 3 s (6 scenarios × 300 runs); dashboard queries p95 < 800 ms on 100k users synthetic |
| Availability | Demo: 99% during event; Pilot target 99.5% |
| Scalability | 10k DAU on a single API/worker pair via horizontal scaling; nudge scheduler sharded by user hash |
| Reliability | At-least-once job processing; idempotent handlers; outbox pattern for deliveries |
| Security | OWASP ASVS L2 targets; RLS; field-level encryption for free text; CSP; rate limits |
| Privacy | Data minimization; consent gating; DP aggregates; retention policy (data-model.md §6) |
| Accessibility | WCAG 2.2 AA; keyboard & screen-reader; reduced motion; RTL |
| i18n | ICU message format; next-intl; EN/AR full, HI stretch; no string concatenation |
| Observability | Structured logs, traces, metrics; per-nudge audit trail; Governor dashboard |
| Maintainability | 80% unit coverage on domain modules; typed (TS strict, mypy strict on core) |

## 5. Security Requirements
1. **AuthN/Z:** short-lived JWT; refresh rotation + reuse detection; role-based route guards; per-resource ownership checks (also enforced by Postgres RLS using `SET app.user_id`).
2. **Data protection:** TLS 1.2+; encryption at rest (provider-managed) + app-level AES-GCM for free-text fields (`barrier_text`, `goal_text`, `notes`); key in KMS/secret manager; key rotation procedure documented.
3. **Audit:** append-only `audit_log` with hash chain (`prev_hash`, `hash`); logs data access by non-user roles, consent changes, exports, deletes, Governor policy changes.
4. **Input handling:** pydantic validation; output encoding; LLM prompt-injection defenses (no user text in system prompts without delimiting; tool-less; schema-validated output; content filters).
5. **Rate limiting:** per-IP and per-user (Redis token bucket): auth 5/min, API 120/min, nudge feedback 60/min, anchor requests 1/day.
6. **Secrets:** env via secret manager; no secrets in repo; pre-commit secret scan.
7. **Dependencies:** lockfiles; Dependabot/Renovate; `pip-audit`, `npm audit` in CI.
8. **Backups & DR:** daily PITR-capable backups; RPO ≤ 15 min, RTO ≤ 4 h (pilot).
9. **Threat model highlights:** (a) insider/analyst reidentification → aggregate-only role & DP; (b) anchor abuse → templated payload, rate limit, revocation; (c) LLM jailbreaks → constrained outputs + Governor; (d) enumeration of users via magic-link → uniform responses, throttling.

## 6. Data & Retention (summary)
Raw wearable signals 90 days then daily summaries; nudge logs 12 months; audit 24 months; deletion on request within 7 days (immediate in demo); aggregates retained without identifiers. Full DDL in data-model.md.

## 7. Scheduling & Jobs
| Job | Cadence | Notes |
|-----|---------|-------|
| `capacity_refresh` | hourly + on check-in | merges new signals |
| `daily_rollup` | 02:00 user-local | consistency, state machine, lapse hazard |
| `nudge_decision_tick` | every 15 min | evaluates decision points inside user windows |
| `outcome_attribution` | every 15 min | closes 4 h windows, updates posteriors |
| `weather_fetch` | 3 h | city-level cache |
| `aggregate_release` | daily 03:30 UTC | k-suppress + noise, writes agg tables |
| `retention_purge` | daily | raw signals/old logs |
| `model_refit` | weekly | hazard model refit on rolling data (offline for MVP) |

## 8. Configuration & Feature Flags
Env-driven config (pydantic Settings). Flags: `LLM_ENABLED`, `ANCHORS_ENABLED`, `WHATSAPP_MODE=stub|live`, `DP_EPSILON`, `K_MIN`, `NUDGE_MAX_PER_DAY`, `MRT_SEND_PROB`, `DEMO_MODE` (time acceleration, immediate delete), `SIM_DEFAULT_SEED`.

## 9. Error Handling Conventions
Problem+JSON (RFC 7807). Error codes: `CONSENT_REQUIRED`, `GOVERNOR_BLOCKED`, `VALIDATION_ERROR`, `RATE_LIMITED`, `NOT_FOUND`, `CONFLICT`, `SIM_TIMEOUT`, `LLM_UNAVAILABLE` (never user-facing; fallback used). Client displays friendly localized messages; never exposes stack traces.

## 10. Internationalization & Accessibility Implementation
- `next-intl` with ICU; `dir="rtl"` for Arabic; logical CSS properties (`margin-inline-start`), mirrored icons only where directional.
- Fonts: Inter + Noto Sans Arabic; numerals: allow Eastern Arabic via locale setting.
- Audio mode: pre-generated TTS for Minimum-level instructions in supported languages; text-first fallback.
- Components built on Radix primitives; focus management and ARIA tested; charts have table/text alternatives.

## 11. Testing Requirements
See testing-qa.md. CI gates: lint, types, unit, contract (OpenAPI), E2E smoke, a11y (axe), security scan, Governor property tests, sim determinism test.

## 12. Deployment Requirements
Containerized (Docker). Environments: `local` (compose), `staging`, `demo/prod`. IaC optional (Terraform later). Blue/green or rolling deploys; DB migrations via Alembic with expand/contract policy.

## 13. Acceptance of Technical Debt (MVP)
Accepted: mock adapters, single-region deploy, no multi-tenant isolation beyond RLS, offline weekly model refit, manual translation review. Not accepted: bypassable Governor, individual-level endpoints for analytics roles, unlogged nudges.
