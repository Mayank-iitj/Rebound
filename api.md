# Rebound — API Specification (v1)

Base URL: `/v1` · Format: JSON (UTF-8) · Errors: RFC 7807 `application/problem+json` · OpenAPI served at `/openapi.json`, docs at `/docs`.

## 1. Conventions
- **Auth:** `Authorization: Bearer <access_jwt>`; refresh via httpOnly cookie. Roles: `user`, `analyst`, `clinician`, `admin`.
- **Idempotency:** all `POST`/`PUT` from clients include `Idempotency-Key: <uuid>`; repeated key returns the original response (24 h).
- **Locale:** `Accept-Language: en|ar|hi`; user locale used when authenticated.
- **Pagination:** `?limit=50&cursor=<opaque>`; responses include `next_cursor`.
- **Dates:** ISO 8601; `day` fields are `YYYY-MM-DD` in the user's timezone.
- **Rate limits:** headers `X-RateLimit-Limit/Remaining/Reset`; `429` with `Retry-After`.
- **Versioning:** URI major version; additive changes only within `v1`.

### Error shape
```json
{
  "type": "https://rebound.app/errors/consent-required",
  "title": "Consent required",
  "status": 403,
  "code": "CONSENT_REQUIRED",
  "detail": "Scope 'wearable' is not granted.",
  "instance": "/v1/signals/sync",
  "trace_id": "9f1c..."
}
```
Codes: `VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `CONSENT_REQUIRED`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `GOVERNOR_BLOCKED`, `SIM_TIMEOUT`, `INTERNAL`.

## 2. Auth & Identity
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/magic-link` | Request link `{email, locale}` → always `202` (uniform) |
| POST | `/auth/verify` | `{token}` → `{access_token, expires_in, user}` + refresh cookie |
| POST | `/auth/refresh` | Rotate refresh cookie → new access token |
| POST | `/auth/logout` | Revoke refresh |
| GET | `/me` | Current user + profile summary |

## 3. Onboarding, Profile, Consent
| Method | Path | Description |
|--------|------|-------------|
| POST | `/onboarding` | Create profile + initial consents |
| GET/PATCH | `/profile` | Read/update profile (language, work pattern, accessibility, quiet hours, budget, channels) |
| GET | `/consents` | Current consent state per scope |
| PUT | `/consents/{scope}` | `{granted: bool}` → records new ledger row, applies immediately |
| GET | `/audit` | User's own audit log (paginated) |

`POST /onboarding`
```json
{
  "locale": "ar",
  "timezone": "Asia/Dubai",
  "profile": {
    "work_pattern": "night",
    "ramadan_observing": true,
    "accessibility_tags": [],
    "literacy_mode": "standard",
    "age_band": "25-34"
  },
  "consents": { "notifications": true, "weather_location": true, "wearable": false, "health_age": false, "patient_app": false, "research_aggregate": true },
  "behaviors": ["sleep", "movement"]
}
```
Response `201`: `{ "user_id": "...", "next": "goals" }`

## 4. Goals & Plans
| Method | Path | Description |
|--------|------|-------------|
| POST | `/goals` | `{behavior, text}` → structured goal draft (confirm before saving) |
| POST | `/plans/draft` | Build draft plan from goals + constraints |
| GET | `/plans/{id}` | Plan with actions/levels |
| PATCH | `/plans/{id}` | Edit actions, windows, cues |
| POST | `/plans/{id}/crash-test` | Run simulation |
| GET | `/plans/{id}/crash-test/{run_id}` | Poll/fetch results |
| POST | `/plans/{id}/patches/{patch_id}/apply` | Apply suggested patch |
| POST | `/plans/{id}/commit` | Activate plan |
| GET | `/catalog/actions` | Filter by behavior, accessibility, indoor, equipment |

`POST /plans/draft`
```json
{
  "goals": [{"behavior":"movement","text":"I want to move more but I work nights","structured":{"metric":"active_days_per_week","target":4}}],
  "constraints": {
    "max_daily_minutes": 20,
    "indoor_only": false,
    "equipment": [],
    "preferred_windows": [{"start":"17:00","end":"19:00"}]
  }
}
```
Response `201`:
```json
{
  "plan_id": "7c1f...",
  "status": "draft",
  "actions": [
    {
      "id": "a1",
      "catalog_id": "mv_walk",
      "title": "Short walk",
      "cue": "After you wake up",
      "window": {"start":"17:00","end":"19:00"},
      "levels": {
        "min":    {"label":"2-minute walk around the room/hall", "minutes":2},
        "std":    {"label":"10-minute walk", "minutes":10},
        "stretch":{"label":"20-minute brisk walk", "minutes":20}
      },
      "fallback_catalog_id": "mv_stretch_2"
    }
  ]
}
```

`POST /plans/{id}/crash-test`
```json
{ "scenarios": ["night_shift_week","ramadan","heatwave","travel","sick_caregiver","work_crunch"], "n_runs": 300, "seed": 42 }
```
Response `200` (or `202` + `run_id` if > 1.5 s, then SSE `/plans/{id}/crash-test/{run_id}/events`):
```json
{
  "run_id": "r9...",
  "seed": 42,
  "survivability": {"survived": 4, "total": 6, "score": 0.667},
  "scenarios": [
    {"id":"night_shift_week","survive_rate":0.41,"survived":false,"dominant_blocker":"time_window_blocked","recover_within_7d_rate":0.58},
    {"id":"heatwave","survive_rate":0.83,"survived":true,"dominant_blocker":null}
  ],
  "patches": [
    {"id":"p1","type":"shift_window","description":"Move walk to 17:00–19:00 on night-shift days","effort_cost":0.5,"predicted_delta":{"night_shift_week":+0.31},"new_score":0.833},
    {"id":"p2","type":"add_fallback","description":"Add 2-minute stretch fallback","effort_cost":0.3,"predicted_delta":{"sick_caregiver":+0.22}}
  ],
  "assumptions_url": "/v1/docs/sim-assumptions",
  "partial": false
}
```

## 5. Daily Loop
| Method | Path | Description |
|--------|------|-------------|
| GET | `/today` | Today's plan, capacity, suggested level, state, why-explanations |
| POST | `/checkins` | `{day, mood_face, sleep_hours?, chips?}` → capacity + suggestions |
| POST | `/logs` | `{plan_action_id, day, level_done}` → progress delta |
| DELETE | `/logs/{id}` | Undo |
| POST | `/pauses` | `{starts_on, ends_on?}` → no justification needed |
| DELETE | `/pauses/{id}` | Resume |
| GET | `/progress` | Consistency 28d, comebacks, trends, survivability history |
| GET | `/progress/comebacks` | List of lapses recovered with days-to-return |

`GET /today` response
```json
{
  "day": "2026-11-12",
  "state": "AT_RISK",
  "capacity": {"value": 0.38, "inputs": ["self_report","sleep_hours","heat_index"], "explanation": "You slept 4h and it's very hot, so we suggest the Minimum version today."},
  "actions": [
    {
      "plan_action_id": "a1",
      "suggested_level": "min",
      "options": {
        "min": {"label": "2-minute walk around the room", "minutes": 2},
        "std": {"label": "10-minute walk"},
        "stretch": {"label": "20-minute brisk walk"}
      },
      "completed": null
    }
  ],
  "consistency_28d": {"score": 0.71, "grace_days_left": 1},
  "restart_available": true,
  "nudge_budget": {"used": 1, "limit": 3}
}
```
(No `streak` field exists.)

## 6. Lapse & Flight Recorder
| Method | Path | Description |
|--------|------|-------------|
| POST | `/restart` | Start Minimum Viable Day now |
| GET | `/recorder/{lapse_id}` | 7-day timeline + context chips |
| POST | `/recorder/{lapse_id}/answer` | `{chip?, text?, voice_transcript?}` → barrier + proposed rule |
| GET | `/rules` | Active recovery rules |
| POST | `/rules` | Accept/create rule |
| PATCH/DELETE | `/rules/{id}` | Edit/remove |
| GET | `/signature` | Lapse Signature (top contexts), P1 |

`POST /recorder/{lapse_id}/answer` response
```json
{
  "barrier": {"value": "SHIFT_WORK", "confidence": 0.82},
  "proposed_rule": {
    "text": "If I miss two days after a night shift, I'll do the 2-minute stretch on my first day off.",
    "trigger": {"context": "shift_swap", "condition": "missed_days>=2"},
    "action": {"level": "min", "catalog_id": "mv_stretch_2", "when": "first_day_off"}
  },
  "governor": {"decision": "allow", "rule_ids": []}
}
```

## 7. Nudges & Why
| Method | Path | Description |
|--------|------|-------------|
| GET | `/nudges` | Recent nudges received (user's own) |
| GET | `/nudges/{id}/why` | WhyCard: technique, plain explanation, evidence level, limits |
| POST | `/nudges/{id}/feedback` | `{type: opened|dismissed|helpful|not_helpful|mute_technique}` |
| PUT | `/nudges/preferences` | Budget, quiet hours, channels, muted techniques |
| POST | `/push/subscribe` | Web Push subscription |

`GET /nudges/{id}/why`
```json
{
  "technique": {"id":"bct_1_4","name":"Action planning","evidence_level":"strong"},
  "plain": "Deciding in advance when and where you'll act makes it easier to follow through.",
  "limits": "Works best for simple actions; may help less when your day is unpredictable.",
  "why_now": "You usually complete walks within 2 hours of an evening reminder.",
  "controls": {"mute_technique": true, "reduce_frequency": true}
}
```

## 8. Rescue Link
| Method | Path | Description |
|--------|------|-------------|
| POST | `/anchors` | `{name, channel, address}` → verification sent |
| POST | `/anchors/verify` | Public tokenized endpoint for the Anchor to confirm `{token}` |
| POST | `/anchors/{id}/request-nudge` | Sends templated message (no data) |
| DELETE | `/anchors/{id}` | Revoke immediately |

Anchor message (template, example): "Hi {anchor_name}, {user_name} would appreciate a quick hello today. No action needed beyond that."

## 9. Integrations (mock in MVP)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/signals/sync` | Pull signals from consented sources; `{source}` |
| GET | `/signals/summary` | Daily summaries (sleep, steps, etc.) |
| POST | `/signals/mock/seed` | `DEMO_MODE` only: generate persona data |

## 10. Settings, Export, Delete
| Method | Path | Description |
|--------|------|-------------|
| GET | `/export` | Starts export job → `202` + `job_id` |
| GET | `/export/{job_id}` | Download URL when ready |
| DELETE | `/account` | `{confirm: true}` → deletion (cooling-off optional) |

## 11. Program & Analytics (role `analyst`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/program/cohorts` | Cohorts the analyst may view |
| GET | `/program/{cohort_id}/metrics` | `?metric=persistence_6m&subgroup=language` → aggregate series |
| GET | `/program/{cohort_id}/equity` | Subgroup comparison + gap |
| GET | `/program/{cohort_id}/privacy` | k, epsilon, suppression stats |

Response sample
```json
{
  "cohort": "ADQ Pilot A",
  "metric": "persistence_6m",
  "series": [
    {"subgroup":"language:ar","n_bucket":"50-99","value":0.43,"suppressed":false},
    {"subgroup":"language:hi","n_bucket":"20-49","value":0.39,"suppressed":false},
    {"subgroup":"language:tl","n_bucket":"<20","value":null,"suppressed":true}
  ],
  "equity_gap": {"abs_pp": 4.0, "target_pp": 5.0, "status": "within_target"},
  "privacy": {"k_min": 20, "epsilon": 1.0}
}
```
No endpoint returns individual-level rows for this role.

## 12. Simulation Lab (role `analyst`/`admin`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/sim/runs` | `{seed, n_users, arms:["B0","B1","B2","B3"], disruption_rates, param_ranges}` → `202` |
| GET | `/sim/runs/{id}` | Status + summary (persistence curves, RHL distributions) |
| GET | `/sim/runs/{id}/export` | CSV/PNG download |

## 13. Care-Team (P2, role `clinician`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/care/patients` | Only patients with active `care_team_share` consent |
| GET | `/care/patients/{id}/summary` | Consistency, RHL, red-flag escalations (no free text) |

## 14. Webhooks & Events (outbound, optional)
`POST` to configured URL with HMAC signature header `X-Rebound-Signature`. Events: `lapse.detected`, `restart.completed` (aggregate/cohort-level only, no identifiers).

## 15. Health & Meta
`GET /healthz`, `GET /readyz`, `GET /v1/docs/sim-assumptions`, `GET /v1/docs/governor-policy` (public policy transparency).

## 16. Security Notes
- Every user-scoped endpoint enforces ownership + RLS.
- `analyst` tokens cannot call user-scoped endpoints.
- `GOVERNOR_BLOCKED` is returned only on user-authored content flows (e.g., custom rule text containing banned patterns), never for system nudges (those are silently handled).
