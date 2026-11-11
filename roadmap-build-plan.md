# Rebound — Roadmap & Build Plan

Version 1.0. Everything needed to go from empty repo to demo-ready MVP.

## 1. Repository Structure
```
rebound/
├─ apps/
│  ├─ web/                      # Next.js PWA
│  │  ├─ app/[locale]/(public|app|program)/...
│  │  ├─ components/            # CapacityFaces, LevelPicker, WhyCard, ...
│  │  ├─ messages/{en,ar,hi}.json
│  │  ├─ lib/{api-client,i18n,a11y}.ts
│  │  └─ public/{audio,icons,manifest.json}
│  └─ api/
│     ├─ rebound/
│     │  ├─ main.py
│     │  ├─ core/{config,db,security,events,audit,idempotency}.py
│     │  ├─ modules/
│     │  │  ├─ identity/ profile/ plans/ capacity/ logs/ crashtest/
│     │  │  ├─ lapse/ recorder/ nudges/ governor/ anchors/
│     │  │  ├─ analytics/ sim/ integrations/
│     │  ├─ jobs/{daily_rollup,nudge_tick,outcomes,aggregate_release,purge}.py
│     │  └─ policy/{policy.yaml,lexicons/}
│     ├─ migrations/            # Alembic
│     └─ tests/
├─ packages/shared/             # openapi types, constants
├─ content/{catalog,bct,templates,scenarios}/   # YAML/JSON seeds
├─ docs/                        # this pack + model cards + ADRs
├─ infra/{docker-compose.yml,Dockerfile.*,terraform/}
├─ scripts/{seed.py,sim.py,export_openapi.sh}
├─ Makefile
└─ .github/workflows/ci.yml
```

## 2. Environment Variables (sample)
```
DATABASE_URL=postgresql+asyncpg://rebound:rebound@db:5432/rebound
REDIS_URL=redis://redis:6379/0
JWT_SECRET=...  JWT_ACCESS_TTL=900  REFRESH_TTL_DAYS=14
APP_ENC_KEY=base64:...   # AES-GCM key (from secret manager)
EMAIL_BACKEND=mailpit|resend  RESEND_API_KEY=
LLM_ENABLED=true  ANTHROPIC_API_KEY=  LLM_MODEL=...
WHATSAPP_MODE=stub|live
WEB_PUSH_VAPID_PUBLIC=  WEB_PUSH_VAPID_PRIVATE=
DP_EPSILON=1.0  K_MIN=20
NUDGE_MAX_PER_DAY=3  MRT_SEND_PROB=0.6
DEMO_MODE=true  SIM_DEFAULT_SEED=42
```

## 3. Milestones
| M | Name | Scope | Exit criteria |
|---|------|-------|---------------|
| M0 | Foundations | Repo, CI, Docker compose, auth (magic link), RLS skeleton, i18n shell (EN/AR), design tokens | Login works; CI green; RTL toggle works |
| M1 | Plan core | Profile/consent, action catalog seed, plan builder, plan UI, LevelPicker, check-in + capacity, logs, consistency score | Daily loop works end to end without nudges |
| M2 | Crash-Test | Scenario YAMLs, simulator, patch search, UI with gauge and patches | p95 < 3 s; determinism test; demo scenario for Fatima |
| M3 | Lapse engine | Daily rollup, hazard (synthetic-pretrained), state machine, restart flow, Flight Recorder, recovery rules | Lapse → restart → recorder → rule works; no-streak test green |
| M4 | Nudges + Governor | Decision ticks, MRT, bandit, templates, Why card, Governor R1–R14, push + email, WhatsApp stub | Governor property tests green; propensities logged |
| M5 | Analytics & Sim | Aggregates (k, DP), program dashboard, equity, Simulation Lab, study report | Reproducible sim; dashboard with suppression demo |
| M6 | Hardening & Demo | A11y pass, AR review, perf, security scan, seed personas, demo script, Rescue Link | Release criteria in PRD §14 met |

## 4. Compressed Schedule (example: 14 days, 2 builders)
| Day | Focus | Output |
|-----|-------|--------|
| 1 | M0: repo, CI, compose, auth, tokens, i18n/RTL | Skeleton running |
| 2 | Schema/migrations, RLS, consent middleware, profile, catalog seeds | DB + APIs |
| 3 | Plan builder + plan UI; LLM adapter + fallback | Draft plans |
| 4 | Check-in, capacity, logs, consistency; Today screen | Daily loop |
| 5 | Crash-Test engine + scenarios | Simulator CLI + API |
| 6 | Crash-Test UI + patches; caching | Gauge + fixes |
| 7 | Daily rollup, hazard, state machine; restart UI | Lapse engine |
| 8 | Flight Recorder + rules + barrier classifier | Recovery rules |
| 9 | Nudge engine, MRT, bandit, templates, Why card | Nudges |
| 10 | Governor rules + property tests + console | Ethics layer |
| 11 | Aggregates, DP, program dashboard, equity | Analytics |
| 12 | Simulation Lab + study run + report | Evidence slides |
| 13 | A11y/AR review, Rescue Link, perf/security pass | Hardening |
| 14 | Seed demo, rehearsals, buffer, docs polish | Demo-ready |
If time-boxed shorter: cut order — Rescue Link → Lapse Signature → care-team view → HI language → Simulation Lab UI (keep CLI + report).

## 5. Work Breakdown (epics → key tasks)
**E1 Platform:** monorepo, CI/CD, docker, Alembic baseline, logging/tracing, error handling, idempotency middleware, rate limiting.
**E2 Identity & Consent:** magic-link, JWT/refresh, roles, consent ledger + middleware, audit hash chain, RLS policies, export/delete.
**E3 Plans:** action catalog, goal extraction (LLM + rules), plan builder, plan editing, commit, plan UI.
**E4 Daily loop:** check-in UI, capacity module, level suggestion, logs, undo, pauses/grace days, consistency + comebacks, Today/Progress UI.
**E5 Crash-Test:** scenario loader, vectorized simulator, survival logic, patch search, caching, SSE progress, UI, assumptions page.
**E6 Lapse & Recorder:** features, hazard train/serve, state machine, restart flow, recorder UI, barrier classifier, rule generator/store/matcher, signature (P1).
**E7 Nudges:** decision scheduler, eligibility, MRT, Thompson sampling, templates/i18n, delivery adapters (push/email/stub WhatsApp), outcome attribution, Why API/UI, preferences.
**E8 Governor:** policy engine, rules R1–R14, lexicons, property tests, console, policy transparency endpoint.
**E9 Analytics & Sim:** aggregate jobs, DP/suppression, program API/UI, equity metrics, agent-based simulator, report generator.
**E10 Inclusion & QA:** AR/HI content review, low-literacy mode + audio, a11y fixes, usability script, perf/security tests.
**E11 Integrations (mock):** wearable/health-age/patient-app adapters with synthetic generators; weather adapter.
**E12 Demo & Docs:** persona seeds, scripts, slides, README, model cards, ADRs.

## 6. Demo Data & Personas Seed
| Persona | Locale | Setup | Seeded history |
|---------|--------|-------|----------------|
| Fatima | ar | Night-shift nurse; movement + sleep; Ramadan toggle off by default | 45 days with 2 lapses around shift swaps; one recovery rule |
| Rajesh | hi (or en) | Outdoor worker; smoking reduction + hydration; low-literacy audio | Heatwave lapse; Anchor verified (mock) |
| Mariam | en | Office; hydration + movement | Smooth first month |
| Omar | ar | Wheelchair-friendly plan; sleep + seated movement | Low-capacity days; minimum-level success |
Plus 500 synthetic cohort users (varied subgroups) for dashboards with a deliberately small subgroup to showcase suppression.

## 7. Definition of Done (MVP)
See PRD §14 and testing-qa.md §9. Plus:
- One-command local run (`docker compose up && make seed`).
- Demo script runs without manual DB edits (`DEMO_MODE` time controls: advance day, trigger heatwave, force lapse).
- Public README with architecture diagram, how to run, how to demo, limitations.

## 8. Demo Controls (DEMO_MODE only)
Hidden admin panel: advance simulated day, inject context event (heatwave/shift swap/travel), force lapse, trigger nudge tick, reset persona, toggle Governor test mode (show blocked loss-framed template). All actions audit-logged and visibly flagged "DEMO".

## 9. Risk Register (delivery)
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Scope creep | H | H | Cut order in §4; P0/P1 tags in PRD |
| LLM instability | M | M | Template fallback; offline mode default for demo |
| Arabic UX quality | M | H | Early native review; real-device RTL tests from day 1 |
| Simulation seen as fake evidence | M | H | Label, sensitivity, ablation, honest slide |
| Time sink on mock integrations | M | M | Thin adapters, synthetic generators only |
| Deployment issues on event day | M | H | Pre-deployed staging; recorded backup demo video; local compose fallback |
| Performance of crash-test | L | M | Vectorize; cache; reduce runs to 200 in demo |

## 10. Post-MVP Roadmap
**Next (0–3 months):** real wearable/Health Age/patient-app connectors; native-speaker content expansion (HI, UR, ML, TL); passkeys; WhatsApp live; pilot protocol approvals; model refit with real data; care-team view.
**Later (3–12 months):** pharmacotherapy referral pathways with clinicians; community/peer cohorts with safeguards; workplace program kits; offline-first mobile apps; causal analytics (DR learner) for treatment-effect heterogeneity; multi-tenant program management; formal compliance certification.
**Principles that don't change:** no streaks, Governor mandatory, aggregate-only external sharing, user-controlled data.

## 11. Open Items to Resolve Before Pilot
1. Clinical governance and red-flag escalation pathway owners.
2. Data residency and hosting approvals.
3. Official integration specs/consent flows for Health Age, patient app, wearables.
4. Translation/localization vendor and review cadence.
5. IRB/ethics approval and pilot site agreements.
