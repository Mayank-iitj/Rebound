# Rebound — Documentation Pack

**Challenge:** Wellbeing · Challenge 09 — Sustaining Healthy Behaviors
**One-liner:** Every health app is designed for the good week. People quit in the bad one. Rebound crash-tests your plan before you start, shrinks it when life gets hard, and turns every lapse into a personal recovery rule.

## Document Index
| # | File | Purpose |
|---|------|---------|
| 1 | [PRD.md](PRD.md) | Product requirements, personas, features, acceptance criteria, metrics |
| 2 | [TRD.md](TRD.md) | Technical requirements, module specs, NFRs, security, ops |
| 3 | [techstack.md](techstack.md) | Chosen stack, versions, rationale, alternatives |
| 4 | [architecture.md](architecture.md) | Components, boundaries, deployment, diagrams |
| 5 | [systemdesign.md](systemdesign.md) | Runtime flows, sequence diagrams, scheduling, scaling |
| 6 | [data-model.md](data-model.md) | Full schema (DDL), indexes, RLS, retention |
| 7 | [api.md](api.md) | REST API contract with request/response examples |
| 8 | [ml-spec.md](ml-spec.md) | Capacity, Crash-Test simulator, lapse hazard, bandit, metrics math |
| 9 | [design.md](design.md) | UX principles, IA, wireframes, tokens, i18n/RTL, accessibility |
| 10 | [ethics-privacy.md](ethics-privacy.md) | Ethics Governor rules, consent, privacy, anti-misuse |
| 11 | [evaluation-plan.md](evaluation-plan.md) | Simulation study, pilot design, MRT, equity analysis |
| 12 | [testing-qa.md](testing-qa.md) | Test strategy, CI gates, golden sets |
| 13 | [content-library.md](content-library.md) | BCT library, templates (EN/AR), scenario library, lexicons |
| 14 | [roadmap-build-plan.md](roadmap-build-plan.md) | Repo structure, milestones, task breakdown, DoD, risks |
| 15 | [demo-and-pitch.md](demo-and-pitch.md) | Demo script, slide outline, judge Q&A, claims guardrails |

## Glossary
- **Elastic Plan** — each action has Minimum / Standard / Stretch levels; the day's level is chosen by capacity.
- **Capacity (C)** — 0–1 estimate of how much the user can do today (sleep, self-report, workload, heat, travel).
- **Consistency Score** — rolling 28-day score (not a streak). Missed days dent it; they never reset it.
- **Grace day** — day excluded from the denominator (2 per 28 days by default, plus user-declared pauses).
- **Lapse** — ≥2 consecutive eligible days without completing at least the Minimum level of a target action.
- **Crash-Test / Habit Twin** — Monte Carlo simulation of a plan against disruption scenarios.
- **Survivability Score** — number of applicable scenarios the plan survives, shown as "k of n".
- **Lapse Flight Recorder** — blameless ~20-second post-lapse replay that produces a personal recovery rule.
- **Recovery Rule** — user-confirmed if-then plan ("If X happens, I will do Y").
- **Lapse Signature** — learned per-user pattern of contexts that precede lapses.
- **Recovery Half-Life (RHL)** — days from the post-disruption trough until half the lost level is regained.
- **Nudge Budget** — user-visible daily cap on nudges.
- **Ethics Governor** — policy layer that allows, modifies, or blocks every outbound nudge.
- **Anchor / Rescue Link** — person the user nominates who can send a restart nudge, seeing no data.
- **BCT** — Behaviour Change Technique, from the BCT Taxonomy v1 (Michie et al., 2013).
- **MRT** — Micro-randomized trial: randomized nudge decisions at decision points with logged propensities.

## Status & Honesty Notes
- Integrations with Health Age, patient app and wearables are **interface-stubbed with synthetic data** in the MVP. Real connectors are post-MVP.
- Simulator parameters are **assumptions** for design validation, not clinical evidence.
- Medical content is limited to behavior-change support. Rebound does not diagnose, prescribe, or give medication dosing.
- Compliance (UAE PDPL, ADHICS, DoH policies) is a design target; formal review is out of MVP scope.
# Rebound
