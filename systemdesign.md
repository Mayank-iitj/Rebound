# Rebound — System Design

Version 1.0. Runtime behavior, flows, state machines, and scaling.

## 1. Core Runtime Loop
```mermaid
flowchart LR
  A[Morning check-in] --> B[Capacity C_t]
  B --> C[Suggest level: Min/Std/Stretch]
  C --> D[User acts and logs]
  D --> E[Consistency score update]
  E --> F[Daily rollup: hazard + state machine]
  F -->|AT_RISK| G[Downshift offer + channel/time adapt]
  F -->|LAPSED| H[Restart + Flight Recorder]
  H --> I[Recovery rule saved]
  I --> B
  G --> B
```

## 2. Sequence: Onboarding → Crash-Test → Commit
```mermaid
sequenceDiagram
  participant U as User
  participant W as Web
  participant A as API
  participant L as LLM (optional)
  participant S as Simulator
  U->>W: Select language, consents, behaviors, goal text
  W->>A: POST /onboarding (profile, consents)
  A->>A: Persist profile + consent ledger + audit
  U->>W: Goal text + constraints
  W->>A: POST /plans/draft
  A->>L: Structured goal extraction (schema)
  L-->>A: Goal JSON (or fallback rules)
  A->>A: Select actions from catalog, build 3 levels
  A-->>W: Draft plan
  W->>A: POST /plans/{id}/crash-test
  A->>S: simulate(plan, profile, scenarios, seed)
  S-->>A: Survivability + patches
  A-->>W: Result
  U->>W: Apply patches, re-run
  W->>A: POST /plans/{id}/commit
  A-->>W: Plan committed + first-day schedule
```

## 3. Sequence: Daily Check-in and Level Suggestion
```mermaid
sequenceDiagram
  participant U as User
  participant W as Web
  participant A as API
  participant I as Integrations
  U->>W: Tap "How's today?" (+ optional sleep, chips)
  W->>A: POST /checkins
  A->>I: Fetch consented signals (sleep, heat index)
  I-->>A: Signals (or none)
  A->>A: Compute capacity C_t + explanation
  A-->>W: Suggested level per action + "why"
  U->>W: Complete action (tap level)
  W->>A: POST /logs (idempotency key)
  A->>A: Update consistency, comeback detection
  A-->>W: Updated progress
```

## 4. Lapse State Machine
```mermaid
stateDiagram-v2
  [*] --> ON_TRACK
  ON_TRACK --> AT_RISK: p_lapse_3d >= 0.5 OR capacity<0.4 for 2d
  AT_RISK --> ON_TRACK: >=1 completion at >=Min and p_lapse_3d < 0.35
  AT_RISK --> LAPSED: 2 consecutive eligible days with no >=Min completion
  ON_TRACK --> LAPSED: 2 consecutive eligible days with no >=Min completion
  LAPSED --> RESTARTING: user opens restart or completes any Min action
  RESTARTING --> ON_TRACK: 2 completions in 4 days
  RESTARTING --> LAPSED: 2 more missed days
  ON_TRACK --> PAUSED: user pause
  AT_RISK --> PAUSED: user pause
  LAPSED --> PAUSED: user pause
  PAUSED --> RESTARTING: user resumes
```
- **Eligible day:** not a grace day, not paused, within an active plan window.
- **Comeback event:** transition `RESTARTING → ON_TRACK`; stores days-to-return for RHL.
- No transition ever modifies historical consistency data.

## 5. Sequence: Lapse → Flight Recorder → Recovery Rule
```mermaid
sequenceDiagram
  participant J as Daily Rollup Job
  participant A as API
  participant U as User
  participant W as Web
  participant C as Barrier Classifier
  J->>J: Compute features, hazard, state
  J->>A: event lapse.detected
  A->>A: Governor-checked restart nudge
  A-->>U: Push: gentle restart (Minimum Viable Day)
  U->>W: Opens Flight Recorder
  W->>A: GET /recorder/{lapse_id}
  A-->>W: 7-day timeline + context chips
  U->>W: Taps "What got in the way?" (chip/free text/voice)
  W->>A: POST /recorder/{lapse_id}/answer
  A->>C: Classify barrier (rules, optional LLM)
  C-->>A: barrier + confidence
  A->>A: Generate recovery-rule proposal (template + optional LLM paraphrase)
  A-->>W: Proposed rule
  U->>W: Accept / edit
  W->>A: POST /rules
  A->>A: Persist; update Lapse Signature; adjust plan windows
```

## 6. Sequence: Nudge Decision Point
```mermaid
sequenceDiagram
  participant T as Tick Job
  participant N as Nudge Engine
  participant G as Governor
  participant D as Delivery Adapter
  participant O as Outcome Job
  T->>N: user in window? budget left? consent ok?
  N->>N: MRT coin flip (log pi)
  alt send
    N->>N: Thompson sample arm
    N->>N: Render localized template
    N->>G: evaluate(candidate)
    G-->>N: allow/modify/block + rules
    N->>D: deliver (if not blocked)
  else no-send
    N->>N: log no-send decision
  end
  O->>O: after 4h: attribute outcome (logged >=Min?)
  O->>N: update posteriors, fatigue signals
```

## 7. Sequence: Rescue Link
```mermaid
sequenceDiagram
  participant U as User
  participant A as API
  participant G as Governor
  participant M as Messaging Adapter
  participant N as Anchor
  U->>A: POST /anchors (name, channel, address)
  A->>M: Send verification link (token)
  N->>A: Open link, confirm
  A-->>U: Anchor verified
  U->>A: POST /anchors/{id}/request-nudge
  A->>G: Check template, rate limit, consent
  G-->>A: allow
  A->>M: Send templated message (no data)
  M-->>N: "Your friend would love a quick hello today."
  A->>A: Audit log entry
```

## 8. Sequence: Aggregate Release (privacy)
```mermaid
sequenceDiagram
  participant J as aggregate_release job
  participant DB as Postgres
  participant P as Program Dashboard
  J->>DB: Compute metrics by cohort and subgroup (service role)
  J->>J: Suppress n<k, apply Laplace noise (epsilon per metric)
  J->>DB: Write agg_* tables
  P->>DB: Read agg_* via analytics_ro
```

## 9. Crash-Test Execution Design
1. Load scenario YAML (versioned) and plan; derive per-action schedule.
2. For each scenario: sample N=300 runs; per day compute capacity multiplier, window blocks, cue availability.
3. Per run: simulate completion probabilities with habit-strength dynamics (ml-spec §3).
4. Aggregate: survival rate per scenario, failure reasons (dominant blocker).
5. Patch search: generate candidate edits, re-simulate affected scenarios only, pick best marginal gain per effort.
6. Cache by hash; return partial progress via SSE if > 1.5 s.

## 10. Notification Channel Adaptation
Channel ladder per user: push → email → WhatsApp/SMS → coordinator-assisted (only if opted in). Rule: switch up the ladder after 3 consecutive ignored sends (no open/dismiss within 24 h) and user has authorized the next channel; switch back after 2 engagements. Channel changes are logged and visible in settings.

## 11. Time and Localization Handling
- Store UTC; evaluate windows in user's IANA timezone.
- Ramadan: computed from Hijri calendar library plus user toggle; shifts windows (iftar/suhoor); disables daytime hydration/eating actions as applicable.
- Daily rollup at user-local 02:00; DST-safe scheduling via per-user next-run times.

## 12. Concurrency and Idempotency
- All POSTs from client carry `Idempotency-Key`; server stores key → response for 24 h.
- Job handlers keyed by `(job_type, user_id, date)`; duplicate runs are no-ops.
- Optimistic concurrency (`version` column) on plans and rules to avoid lost updates.

## 13. Failure Modes
| Failure | Behavior |
|---------|----------|
| LLM timeout | Template fallback; mark `llm_fallback=true` |
| Weather API down | Use last cached heat index ≤ 6 h old, else skip heat input |
| Wearable sync gap | Capacity uses self-report only; explanation notes missing input |
| Push delivery failure | Retry; after 3 failures switch channel if authorized |
| Governor error | Fail closed (no nudge sent); alert |
| Simulation timeout | Return partial results flagged `partial=true` |

## 14. Scaling Notes
- Hot paths: check-in (write), today view (read), nudge tick (batch).
- Today view served from `v_today_plan` with Redis cache (30 s TTL, busted on writes).
- Nudge tick: batch users by shard; cap per-tick processing time; backpressure via queue depth alerts.
- Analytics read models refreshed incrementally.
