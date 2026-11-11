# Rebound — Testing & QA Strategy

Version 1.0

## 1. Test Pyramid
| Level | Tools | Scope | Target |
|-------|-------|-------|--------|
| Unit (API) | pytest, hypothesis | Domain modules: capacity, consistency, state machine, governor, bandit, crashtest, DP | ≥ 80% line coverage on `domain/`, 95% on `governor/` |
| Unit (Web) | vitest, Testing Library | Components, hooks, i18n | ≥ 70% |
| Contract | schemathesis, openapi-typescript diff | API vs OpenAPI; client types | 100% endpoints fuzzed in CI (smoke) |
| Integration | pytest + testcontainers (Postgres/Redis) | RLS, consent middleware, outbox, jobs | Critical paths |
| E2E | Playwright | Onboarding → Crash-Test → daily loop → lapse → recorder; AR RTL; low-literacy | Smoke on every PR; full nightly |
| Accessibility | axe-core in Playwright, manual SR (NVDA/VoiceOver), keyboard | All core screens, both themes, EN/AR | 0 critical/serious |
| Performance | k6, pytest-benchmark | API p95, crash-test latency, nudge tick | Meets TRD NFRs |
| Security | ZAP baseline, bandit, pip-audit, npm audit, gitleaks, Semgrep | Whole repo and deployed staging | No high/critical open |
| ML/Sim | pytest + golden files | Determinism, calibration, regret, ablations | See §5 |

## 2. Critical Test Suites

### 2.1 Governor (property-based)
- Generate random templates with forbidden lexicon (EN/AR/HI variants, leetspeak, spacing tricks) → must be blocked (R1).
- Budget invariants: for random schedules, no user exceeds budget/day or violates min gap and quiet hours (R2).
- Post-lapse tone: any message within 7 days post-lapse must be `supportive` tagged (R3).
- Consent invariants: no message uses data from non-consented scopes (R11).
- Fail-closed: injected exception in policy → no delivery.
- Policy hash: decisions always carry the current hash.

### 2.2 Consistency & State Machine
- Properties P1–P4 (ml-spec §2) with hypothesis.
- State transitions exhaustively tested against table in systemdesign.md §4, including pause/resume, grace days, DST boundaries, timezone changes.
- "No streak" test: schema and API responses contain no streak field (contract test fails if introduced).

### 2.3 Crash-Test
- Determinism: same seed → byte-identical result.
- Monotonicity: adding a fallback never reduces survival in sick/caregiver scenario under default params.
- Constraint tests: patches never increase Minimum duration or exceed `max_daily_minutes`.
- Performance: p95 < 3 s on CI reference runner (6 scenarios × 300 runs × 3 actions).
- Applicability: Ramadan scenario excluded when `ramadan_observing=false`.

### 2.4 Privacy
- RLS: user A cannot read/write user B rows (SQL-level tests with raw connections).
- `analytics_ro` cannot SELECT from any table except aggregates.
- DP/suppression: cells with n<20 are suppressed; released values distributionally consistent with Laplace (KS test on repeated runs); bucketed n only.
- Export/delete: export includes all user-scoped tables; delete removes all rows (verified by table scan), audit entries pseudonymized.
- Consent revocation: after revoke, next API/job call using scope returns `CONSENT_REQUIRED` within 60 s.
- Anchor: payload snapshot tests assert no data fields.

### 2.5 LLM Safety
- Golden set (≥ 150 cases): goal extraction, barrier classification, rule paraphrase (EN/AR/HI).
- Adversarial set (≥ 60): prompt injection, requests for dosing, self-harm text, attempts to alter system behavior → must result in schema-valid safe outputs or fallback.
- Offline mode: with `LLM_ENABLED=false` all flows complete using templates.
- Output validators reject anything outside taxonomy/catalog.

### 2.6 Internationalization
- Pseudo-localization build to catch truncation/hardcoded strings.
- Visual regression (Playwright screenshots) for EN/AR on 360, 768, 1280 px.
- ICU message tests for plurals; RTL mirrored component snapshots.
- Forbidden-lexicon scan across all locale files in CI.

### 2.7 Idempotency & Offline
- Duplicate POST with same Idempotency-Key returns identical response, no duplicate rows.
- Offline queue replays in order; conflict resolution tests (log edited on two devices).
- Service worker caching: stale-while-revalidate for static; no caching of authenticated JSON beyond today's plan.

## 3. CI/CD Quality Gates
Pipeline (GitHub Actions):
1. Lint & format (ruff, black, mypy, eslint, prettier, tsc).
2. Secret scan (gitleaks) + dependency audit.
3. Unit tests (API/Web) + coverage thresholds.
4. Contract tests (schemathesis) + OpenAPI diff (no breaking changes).
5. Integration tests (testcontainers).
6. Build images; run E2E smoke (Playwright) against compose.
7. a11y checks (axe) in E2E.
8. Governor lexicon scan on templates/locales.
9. Sim determinism & short ablation run (N=500).
10. Deploy to staging (main) → nightly full E2E + k6 + ZAP baseline.
Release blocked on any failed gate.

## 4. Manual QA Scripts
- **Persona walkthroughs:** Fatima (AR, night shift), Rajesh (HI, low-literacy audio, WhatsApp), Mariam (EN, hydration/office), Omar (AR, wheelchair-friendly plan). Each completes: onboarding, Crash-Test patch, 3 simulated days (good/bad/lapse), restart, recorder, rescue link, export, delete.
- **Bad-week drill:** simulate heatwave + travel; verify plan downshift, tone, consistency math, no red states.
- **Consent drill:** toggle each scope; verify behavior changes and audit entries.
- **Screen reader pass:** NVDA (Windows/Firefox), VoiceOver (iOS Safari), TalkBack (Android Chrome) on core loop.
- **Low-network:** throttled 3G; offline check-in; sync after reconnect.
- **Content review:** native AR/HI reviewers sign off on templates; clinical advisor signs off on red-flag lexicon.

## 5. ML & Simulation Test Specs
- **Hazard:** train/test split by user (no leakage); calibration plot per subgroup; fail build if slope outside [0.7,1.3] on synthetic validation.
- **Capacity:** unit tests for renormalization with missing inputs; monotonicity of C_t in each input.
- **Bandit:** simulated environment with known best arm; regret sublinear; posterior update unit tests; exploration floor respected; muted arms never chosen.
- **Sim reproducibility:** fixed seed regression test of summary stats within tolerance.
- **Ablation harness:** automatic B3 minus {Crash-Test, Elastic, Recorder, MRT/TS} to ensure each component contributes in baseline params (informational, not gating).

## 6. Performance & Load
- k6 scenarios: 1,000 concurrent users doing check-in + today view; 200 concurrent crash-tests (queueing behavior); nudge tick for 50k users shards.
- SLOs: API p95 < 300 ms; error rate < 0.5%; nudge tick completes within 5 min per shard; DB CPU < 70% at target load.
- Soak test: 6 hours at 30% load to check memory leaks and job drift.

## 7. Security Testing
- Authentication: magic-link brute-force/enumeration tests; token reuse; refresh rotation reuse detection.
- Authorization: IDOR tests on every resource; role escalation attempts; analyst token vs user endpoints.
- Injection: SQLi/XSS fuzz; LLM prompt injection (see 2.5); SSRF checks on adapters.
- Privacy attacks: small-cell inference attempts on program endpoints; differencing attacks across releases (validate budget accounting).
- Infrastructure: headers (CSP, HSTS), cookie flags, CORS allow-list, rate-limit effectiveness.

## 8. Defect Management
Severity: S1 (privacy/safety/data loss), S2 (core flow blocked), S3 (degraded), S4 (cosmetic). S1/S2 block release. All S1 incidents get a postmortem within 5 days.

## 9. Definition of Done (per feature)
- Acceptance criteria met and demonstrated.
- Unit + integration tests merged; E2E where user-facing.
- a11y checks pass in EN and AR.
- Governor/lexicon scan passes; copy reviewed.
- Telemetry/metrics added; dashboards updated.
- Docs/API/OpenAPI updated; migration tested up/down.
- Privacy impact note updated if data touched.
