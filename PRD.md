# Rebound — Product Requirements Document (PRD)

Version 1.0 · Status: Ready for build · Owner: Mayank Sharma

## 1. Overview
Rebound is an adaptive behavior-change platform that helps people start, keep, and recover healthier behaviors (movement, sleep, nutrition, smoking reduction/cessation). Its design center is **the bad week**: it stress-tests plans before commitment, resizes them daily to real capacity, treats lapses as data rather than failure, and measures persistence and recovery instead of downloads or opens.

## 2. Problem Statement
- Awareness and information rarely sustain behavior change; motivation fluctuates and routines get disrupted.
- A single lapse often triggers shame and total disengagement ("what-the-hell effect"). Streaks and resets amplify this.
- Generic programs ignore language, culture, health literacy, shift work, disability, family context, and climate (e.g., Abu Dhabi summer heat, Ramadan).
- Existing ecosystem assets (screening, Health Age, wearables, patient apps, campaigns, gamification) lack an **adaptive loop** that learns what works per person, supports recovery, and measures sustained change.
- Risk of misuse: engagement tactics that manipulate, or data used punitively by employers/insurers.

## 3. Goals
| ID | Goal | Measure |
|----|------|---------|
| G1 | Make plans survive real life | Median Survivability Score ≥ 5/6 after patching; plan-level 28-day persistence |
| G2 | Make lapses recoverable | Recovery Half-Life (RHL) ≤ 3 days; ≥ 60% resume within 7 days |
| G3 | Personalize support without manipulation | Governor block-rate transparency; nudge opt-out < 10% |
| G4 | Equitable benefit | Equity gap (max–min persistence across groups, n ≥ k) ≤ 5 pp |
| G5 | Measure what matters | Dashboards for persistence, RHL, outcomes, retention, equity |

## 4. Non-Goals (MVP)
- Diagnosis, treatment, medication or nicotine-replacement dosing advice.
- Real integration with production health systems (stubbed adapters only).
- Native mobile apps (PWA only), payments, insurer/employer integrations beyond aggregate dashboards.
- Clinical-grade validation (design for it; do not claim it).

## 5. Personas
| Persona | Context | Needs | Rebound angle |
|---------|---------|-------|---------------|
| **Fatima, 34, night-shift nurse** (Arabic/English) | Rotating shifts, poor sleep, wants to move more | Plans that flex with shifts | Crash-Test with night-shift scenario; capacity from sleep; shift-aware windows |
| **Rajesh, 41, construction worker** (Hindi; low literacy) | Outdoor heat, smoker, long hours, shared phone | Voice/audio, icons, WhatsApp | Low-literacy mode, heat scenario, smoking-reduction plan, Anchor via WhatsApp |
| **Mariam, 29, office worker** (English/Arabic) | Sedentary, hydration/nutrition goals | Simple, non-judgmental help | Elastic plan, Flight Recorder |
| **Omar, 52, wheelchair user** (Arabic) | Limited access to standard exercise | Adapted movement | Adaptive action library, accessibility, no "steps" assumption |
| **Dr. Noor, program analyst** | Runs a workplace/community program | Aggregate impact & equity | k-anonymous dashboard, no individual data |
| **Care coordinator (consented view)** | Supports enrolled patients | Know who needs help, with consent | Consent-scoped lite clinician view |

## 6. User Journeys
**J1 Onboard → Crash-Test → Commit.** Language → consent (per data source) → choose 1–2 behaviors → goal in own words → constraints (shifts, Ramadan, mobility, budget) → generated plan (3 levels per action) → Crash-Test shows Survivability Score → one-tap patches → commit.
**J2 Daily loop.** Morning "How's today?" (1 tap) → capacity → suggested level → log completion (1 tap) → consistency score updates; no streak shaming.
**J3 Drift → Restart.** Hazard rises → plan downshifts to Minimum → channel/time adapts → non-judgmental message → restart in ≤ 2 minutes.
**J4 Lapse → Flight Recorder.** After a lapse: "What changed?" (context chips + 1 tap) → proposed recovery rule → user confirms/edits → applied to future plan.
**J5 Rescue Link.** User nominates an Anchor → on request, Anchor receives a pre-written nudge with zero data → user can revoke any time.
**J6 Control & exit.** Settings: goals, data sources, notification windows/budget, language, export, delete.
**J7 Program view.** Analyst opens aggregate dashboard: persistence, RHL, outcomes, retention, equity gap; small cells suppressed.

## 7. Functional Requirements
Priority: **P0** = MVP must, **P1** = MVP should, **P2** = stretch.

### F1 Onboarding & Consent (P0)
- Language select (EN, AR full; HI stretch), RTL automatic.
- Consent screens per data source (wearable, Health Age, patient app, weather/location coarse, notifications); each toggle independent; defaults off.
- Plain-language "what we use / why / how to turn off".
- **AC:** user can complete onboarding with zero optional data sources; consent records stored with timestamp/version; revoking a source stops its use within 1 minute and is shown in audit log.

### F2 Goal & Plan Builder (P0)
- Behaviors: movement, sleep, nutrition (hydration/meal timing/veg servings), smoking (reduction/cessation).
- Goal in free text → structured goal (LLM-assisted, schema-validated, user-confirmed).
- Plan = 1–3 actions; each has Minimum/Standard/Stretch levels, cue anchor ("after Maghrib"), time window, location type (indoor/outdoor), adaptation tags (wheelchair-friendly, no-equipment, low-literacy audio).
- **AC:** every action has all three levels; Minimum ≤ 5 minutes or ≤ 1 simple step; plan builder works without any health data.

### F3 Crash-Test (Habit Twin) (P0)
- Runs plan through scenario library (night-shift week, Ramadan, heatwave, travel, sick/caregiver, work crunch, social/cravings).
- Output: Survivability Score "k of n", per-scenario survive/fail with reason, ranked patch suggestions with effort cost.
- One-tap apply patch; re-run shows delta.
- **AC:** ≤ 3 s p95 for 6 scenarios × 300 runs; deterministic with seed; shows assumptions link; patches never increase daily Minimum duration.

### F4 Elastic Daily Plan (P0)
- Daily view shows suggested level with "why" (capacity inputs summarized).
- User can override level up or down; downshift is never penalized.
- Grace days: 2 per rolling 28 days auto-applied; user can declare pause (illness, travel, bereavement) without justification.
- **AC:** consistency score uses defined math (ml-spec §2); no streak counter exists in UI or API.

### F5 Check-in & Capacity Sensing (P0)
- 1-tap "How's today?" (5 faces/icons), optional sleep hours, optional context chips.
- Capacity score uses available inputs only (missing-weight renormalization); heat stress from public weather API (coarse location, consented).
- **AC:** capacity computed with only self-report; explanation text lists exactly which inputs were used.

### F6 Lapse Detection & Restart (P0)
- Daily hazard score from engagement and context features; **soft-risk** at p ≥ 0.5 triggers proactive downshift offer; **lapse** = ≥ 2 eligible missed days.
- Restart flow: "Minimum Viable Day" (≤ 2 min), tone-safe copy, no progress reset.
- **AC:** no UI text contains blame/loss lexicon (Governor-enforced); consistency score never drops to 0 solely due to a lapse; restart accessible in ≤ 2 taps from any screen.

### F7 Lapse Flight Recorder & Recovery Rules (P0)
- Blameless replay: timeline of last 7 days with context chips (shift swap, heat, travel pulled from events/weather/self-report), 1 question "What got in the way?".
- Barrier classification (taxonomy in ml-spec §6) → recovery-rule proposal (if-then), user edits/accepts; rules stored and surfaced when trigger context recurs.
- Lapse Signature view (P1): top 3 contexts preceding lapses.
- **AC:** completion in ≤ 20 s typical (≤ 3 taps); every accepted rule has trigger + action + level; rules editable/deletable.

### F8 Nudge Engine & "Why this?" (P0)
- Decision points (≤ 3/day by default): morning plan, pre-window cue, evening reflection.
- Micro-randomized send/no-send with logged propensity; arm selection by Thompson sampling over technique × slot × channel.
- Every nudge shows **Why this?**: BCT name, plain explanation, evidence level (Strong / Moderate / Emerging), known limits.
- **AC:** propensity logged for 100% decision points; Governor decision recorded; user can mute a technique ("Don't use this kind of message").

### F9 Ethics Governor (P0)
- Enforces rules R1–R12 (ethics-privacy.md): no loss-framing, no shaming, nudge budget, quiet hours, red-flag escalation, language match, incentive caps, aggregate-only external sharing.
- **AC:** property tests show zero loss-framed or shame-lexicon messages pass; Governor decision visible in admin/audit; "Governor blocked X" demo hook.

### F10 Rescue Link (P1)
- User nominates an Anchor (name + phone/WhatsApp); Anchor verifies via one-time token; can send only a pre-written nudge on user request; sees no data.
- **AC:** Anchor payload contains no health data; user can revoke immediately; every use is audit-logged.

### F11 Progress View (P0)
- Consistency score (28-day), recovery events ("You came back in 2 days — that's your 3rd comeback"), biomarker/behavior trend (if consented), Survivability over time.
- **AC:** language framed as capability/identity ("comeback"), not loss; accessible chart alternatives (table/text).

### F12 Settings & Data Control (P0)
- Edit goals, pause/resume, notification windows & budget, channel preferences, language, low-literacy mode, mute techniques, data-source toggles, export (JSON/CSV), delete account.
- **AC:** export in < 10 s; delete is irreversible after 7-day cooling-off option (immediate in demo mode); audit log viewable by the user.

### F13 Program Dashboard (P0)
- Aggregate-only: persistence (3/6/12-month windows when data exists), RHL distribution, resume-within-7-days, behavior/biomarker change, retention, equity gap with subgroup bars, opt-out/fatigue indicators.
- k ≥ 20 suppression + Laplace noise (ε=1 per release); visible privacy badge.
- **AC:** no endpoint returns individual-level rows to program role; suppressed cells shown as "n<20".

### F14 Care-Team View, Consent-Scoped (P2)
- Patient-initiated share of summary (consistency, RHL, red-flag escalations) with named clinician/coordinator; revocable.

### F15 Simulation Lab (P0 for judges)
- Runs the agent-based study (5,000 synthetic users) comparing baselines; produces persistence curves and RHL distributions; parameter sensitivity sliders.
- **AC:** reproducible by seed; clear "simulated" watermark; exports PNG/CSV.

## 8. Requirement Traceability
| Challenge requirement | Features |
|---|---|
| 1 Adaptive personal plans | F2, F3, F4, F5 |
| 2 Continuous learning & re-engagement | F6, F7, F8, F10 |
| 3 Evidence-based behavior support (rationale + limits visible) | F8 (Why this?), content-library BCTs |
| 4 Autonomy & inclusion; avoid manipulation/punitive use | F1, F9, F12, design.md i18n/a11y, F13 aggregate-only |
| 5 Sustained outcome measurement | F11, F13, F15, evaluation-plan.md |

## 9. Success Metrics
**North star:** 6-month persistence (share of rolling 4-week windows meeting target ≥ Minimum on ≥ 60% of eligible days).
**Supporting:** RHL; resume-within-7-days; behavior/biomarker delta; retention (meaningful use: ≥ 1 log/week); equity gap; opt-out rate; nudge fatigue (mute/dismiss rate); survivability uplift after patching.
**Guardrails:** complaint rate; Governor blocks per 1,000 candidate nudges; notification volume per user; zero individual-level external disclosures.

## 10. Scope Cut Lines
- **MVP demo-complete:** F1–F9, F11, F12, F13, F15, one real-time end-to-end flow for Fatima and one for Rajesh.
- **MVP should:** F10 Rescue Link (WhatsApp stub/mock), Lapse Signature.
- **Later:** F14, real connectors, native apps, additional languages, pharmacotherapy referral flows, richer cohorts, causal analytics.

## 11. Assumptions
1. Users have a phone with a browser; wearable optional.
2. Programs or clinics provide a controlled onboarding channel (QR/link).
3. Health Age, wearable, and patient app data will be available via later adapters; MVP ships mocks with documented interface contracts.
4. Public weather API is acceptable with coarse location only.

## 12. Dependencies
LLM provider (structured output), email/SMS/WhatsApp provider (stub in MVP), weather API, hosting (Vercel/Render/Neon or equivalent), translation review by native speakers (AR/HI).

## 13. Risks
| Risk | Impact | Mitigation |
|---|---|---|
| Simulator assumptions seen as evidence | Credibility | Label as simulated; sensitivity analysis; no clinical claims |
| LLM hallucination in plans/messages | Safety | Schema-constrained output, template fallback, Governor, allow-listed actions |
| Notification fatigue | Retention | Nudge Budget, MRT learns send/no-send, mute techniques |
| Cultural missteps | Trust | Native review, culture settings, user-editable defaults |
| Data misuse by third parties | Ethics | Aggregate-only, DP, no individual endpoints, contractual guardrails |
| Over-claiming medical benefit | Safety/legal | Guardrail copy; red-flag escalation; no dosing |

## 14. Release Criteria (MVP)
- All P0 ACs pass in automated or scripted manual tests.
- Governor property tests green; zero blame/loss strings in shipped templates.
- Accessibility: axe zero critical issues; keyboard-only and screen-reader pass on core flows; AR RTL review complete.
- Demo environment seeded; simulation study reproducible by seed.
- Docs complete; privacy notice and consent text approved.

## 15. Open Questions
1. Which official wearable/Health Age interfaces and consent schemes will be available for pilot?
2. Preferred languages beyond EN/AR for first pilot cohort?
3. Clinical governance: who approves content and red-flag rules?
4. Data residency requirements for the pilot environment?
