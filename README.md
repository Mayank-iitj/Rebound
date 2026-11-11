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

## Quick Start & Running the Platform

### 1. One-Command Launch (FastAPI + Embedded Web Application)
Launch the full platform with a single command:
```bash
python run.py
```
This automatically initializes the database, seeds test personas (Fatima, Rajesh, Omar, Mariam) with 45+ days of history and 500 cohort records with privacy suppression, and serves:
- **Interactive Web App & Landing Page:** [http://localhost:8000](http://localhost:8000)
- **Interactive Pitch Deck (12 Slides):** Accessible via Header or `/deck` tab
- **Swagger / OpenAPI Interactive Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Ethics Governor Policy Hash:** `368b1932f91a56bc`

---

## 🏆 3-Minute Hackathon Judge Evaluation Guide

To experience why Rebound dominates Challenge 09 in 180 seconds flat:

1. **Launch the 3-Minute Tour:**
   - Click the prominent **`🏆 3-Min Judge Demo`** button in the floating top demo bar.
   - The interactive guide steps through each core innovation with live feedback and audio chimes.

2. **Step 1: Fatima’s Context (Arabic RTL, Hospital Shift Worker)**
   - Notice native Arabic RTL layout, 12h night shift detection, and granular consent switches (UAE PDPL/ADHICS).
   - Rolling 28-day consistency ring shows **74%** with zero toxic streak shame.

3. **Step 2: Habit Twin Pre-Mortem Simulator (`Plan` tab)**
   - Notice the Monte Carlo survivability gauge (**2 of 6** on fragile plan).
   - Click **"Apply All Recommended Patches"** $\to$ watch survivability instantly jump to **5 of 6 (83.3%)** before day 1!

4. **Step 3: Dynamic Capacity Sensing ($C_t$) (`Today` tab)**
   - Live Abu Dhabi weather badge shows **39.4°C (Feels like 43.1°C)**.
   - High heat + 4.5h sleep automatically shrinks today's action to the 2-minute "Minimum". Logging it counts 100%.

5. **Step 4: Blameless Lapse Flight Recorder (`Flight Recorder` tab)**
   - Click **"Simulate Lapse (2 Days)"** in the top demo bar $\to$ triggers the 20-second flight recorder.
   - Select "Hospital Night Shift" $\to$ automatically synthesizes a concrete If-Then recovery rule. Click **Accept** $\to$ celebrates verified comeback with audio fanfare!

6. **Step 5: Real-Time Ethics Governor (`Governor` tab)**
   - Test message with toxic shame (*"You failed your streak, don't be lazy!"*) $\to$ Governor intercepts and blocks with Rule **R1**.
   - Audit trail recorded in tamper-evident SHA-256 hash chain.

7. **Step 6: Enterprise Analytics & 5,000-Agent Simulation (`Program` & `Sim Lab` tabs)**
   - View workplace KPIs with $k \ge 20$ cell suppression and Laplace differential privacy ($\epsilon=1.0$).
   - In Sim Lab, review the 24-week longitudinal study: Rebound (B3) delivers **+18.7 pp persistence lift** and reduces Recovery Half-Life from **16.5 days down to 2.1 days**.

---

### Running Automated Test Suites

```bash
# Core algorithm tests (Governor, Capacity math, Bandit, Differential Privacy)
$env:PYTHONPATH="apps/api"; python apps/api/tests/test_rebound_core.py

# Full API integration test suite
$env:PYTHONPATH="apps/api"; python apps/api/tests/test_full_suite.py
```
*All 17 automated tests run and pass in under 2 seconds.*

---

### Production Web Build
```bash
cd apps/web
pnpm build
```
*Compiles cleanly with Vite into `apps/web/dist` with 0 warnings or errors.*

