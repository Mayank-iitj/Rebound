<div align="center">

# 🔄 REBOUND
### The Resilience Platform for Healthy Habits · Engineered for the Bad Week

[![Challenge](https://img.shields.io/badge/Wellbeing_Hackathon-Challenge_09-0d9488?style=for-the-badge&logo=target)](https://github.com/Mayank-iitj/Rebound)
[![Backend](https://img.shields.io/badge/FastAPI-Python_3.12-38bdf8?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/React_18-TypeScript_·_Vite-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![Policy](https://img.shields.io/badge/Ethics_Governor-v1.0.0_(Hash:_368b1932)-f59e0b?style=for-the-badge&logo=shield)](http://localhost:8000/docs)
[![Compliance](https://img.shields.io/badge/UAE_PDPL-ADHICS_Aligned-10b981?style=for-the-badge&logo=security)](file:///ethics-privacy.md)
[![Deploy to Render](https://img.shields.io/badge/Deploy_to-Render-46e3b7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)
[![Tests](https://img.shields.io/badge/Automated_Tests-17%2F17_PASSED-emerald?style=for-the-badge&logo=checkmarx)](file:///apps/api/tests)

<p align="center">
  <b>Every health app is designed for the good week. People quit in the bad one.</b><br/>
  Rebound crash-tests your habit before commitment, dynamically shrinks actions during exhaustion, and turns every multi-day lapse into an actionable, blameless recovery rule.
</p>

[**🚀 Launch Platform**](#-quick-start--single-command-launch) •
[**🏆 3-Minute Judge Tour**](#-3-minute-hackathon-judge-evaluation-tour) •
[**📊 Interactive Pitch Deck**](#-interactive-12-slide-pitch-deck) •
[**🏛️ Architecture**](#%EF%B8%8F-system-architecture--data-flows) •
[**🧪 Evidence & Science**](#-behavioral-science--mathematical-rigor) •
[**📑 Spec Index**](#-complete-specification-index)

---

</div>

## 📌 Executive Summary

Modern habit trackers suffer from the **Abstinence Violation Effect (AVE)**: when a user faces a 12-hour hospital night shift, illness, or an extreme 42°C heatwave, their daily streak resets to zero. Over **80% of wellness app users abandon habits permanently** after their first multi-day break.

**Rebound re-architects behavior change from rigidity to resilience:**
1. **Pre-Mortem Habit Twin:** Simulates 6 real-world disruption scenarios before day 1; greedy algorithmic patches lift survivability from 33% to 83.3%.
2. **Dynamic Capacity Sensing ($C_t$):** Renormalizes missing sensor streams to recommend elastic actions (**Minimum: 2 min**, **Standard: 10 min**, **Stretch: 20 min**) with 0 guilt.
3. **Blameless Lapse Flight Recorder:** A 20-second diagnostic classifies barriers into external friction and generates personal If-Then recovery rules with 1 tap.
4. **Deterministic Ethics Governor (R1–R14):** A tamper-evident policy layer running policy hash `368b1932f91a56bc` that blocks toxic shame framing, caps nudges at 3/day, and detects medical red flags.
5. **Differential Privacy ($k \ge 20, \epsilon=1.0$):** Workplace and cohort analytics aggregated safely for public health without deanonymizing shift workers or individuals.

---

## ⚡ Key Differentiators: Rebound vs Traditional Trackers

| Feature | Traditional Trackers (Apple Fitness, Duolingo, Habitica) | 🔄 Rebound Platform |
|:---|:---|:---|
| **Lapse Handling** | Counter resets to 0; "You failed!" shame notifications | **2-Minute Restart**; 20-second Flight Recorder synthesizes recovery rules |
| **Commitment** | Blind target setting without stress-testing | **Habit Twin Simulator**; pre-tests against 6 disruption scenarios |
| **Daily Targets** | Static goals (e.g. 10,000 steps rain or shine) | **Elastic 3-tier actions** sized to daily capacity ($C_t$) |
| **Fatigue / Disruption** | Demands willpower regardless of 4.5h sleep or 42°C heat | **Minimum (2 min)** counts 100% towards consistency |
| **Metric of Success** | Fragile consecutive day streaks | **Rolling 28-day consistency** with auto-grace exclusions & comebacks |
| **Social / Support** | Public leaderboards, social shame | **Rescue Link** (Anchor receives: "Fatima asked for a hello" — zero health data leaked) |
| **Safety & Dark Patterns**| Urgency nudges ("Hurry! 1 hour left!") | **Ethics Governor (R1–R14)** deterministically blocks shame & dark patterns |

---

## 🏛️ System Architecture & Data Flows

Rebound is architected as a high-performance, closed-loop resilience engine built on **FastAPI**, **SQLite/PostgreSQL**, and **React 18 / Tailwind CSS**:

```mermaid
flowchart TD
    subgraph Client ["Client Presentation Tier (React 18 + Vite + TypeScript)"]
        UI["Executive UI / Native Arabic RTL / Hindi"]
        Demo["Judge Demo Controller (Personas + Time Travel)"]
        Sound["Web Audio Synthesizer (Micro-Interactions)"]
        TTS["Web Speech API Narration (Accessibility)"]
    end

    subgraph API ["Application Services (FastAPI Gateway)"]
        TodaySvc["Today & Capacity Engine (C_t)"]
        SimEngine["Habit Twin Pre-Mortem Simulator"]
        FlightSvc["Lapse Flight Recorder & Barrier Classifier"]
        BanditSvc["MRT Micro-Randomizer (Thompson Sampling)"]
        WeatherSvc["Open-Meteo Abu Dhabi Climate Sensor"]
    end

    subgraph Security ["Deterministic Safety & Governance"]
        Gov["Ethics Governor Engine (R1–R14)"]
        Audit["SHA-256 Tamper-Evident Audit Hash Chain"]
        DP["Laplace Differential Privacy (k >= 20, eps=1.0)"]
    end

    subgraph Persistence ["Persistence Tier (SQLAlchemy ORM)"]
        DB[(rebound.db / PostgreSQL)]
    end

    Client -->|REST API + Bearer JWT| API
    API --> Security
    Security --> Gov
    Gov -->|Allowed / Blocked| API
    API --> DB
    Security --> Audit
```

### The Closed-Loop Daily Behavioral Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Fatima (Night Nurse)
    participant UI as Rebound Web Client
    participant Cap as Capacity Engine
    participant Gov as Ethics Governor (R1-R14)
    participant Log as Consistency Ledger

    User->>UI: Opens app after 12h night shift (4.5h sleep, 42°C Abu Dhabi heat)
    UI->>Cap: POST /v1/checkins (Mood face: 2/5, Sleep: 4.5h, Abu Dhabi Sensor)
    Cap-->>UI: Capacity C_t = 0.38 (Auto-suggests 2-minute "Minimum" action)
    User->>UI: 1-Tap Logs 2-minute gentle walking
    UI->>Log: POST /v1/logs (Level: "min")
    Log-->>UI: Consistency: 74% (Counts 100% · Rolling 28-day ring updated)
    Note over Gov: Outbound nudge screened against R1-R14
    Gov-->>User: "Great job keeping momentum alive today." (Zero guilt, 0 streak shame)
```

---

## 🏆 3-Minute Hackathon Judge Evaluation Tour

When evaluating Rebound, follow this streamlined 180-second sequence (or click **`🏆 3-Min Judge Demo`** at the top of the interface):

```mermaid
graph LR
    S1["1. Fatima's Context<br/>(Arabic RTL + Consents)"] --> S2["2. Habit Twin<br/>(2/6 to 5/6 Crash Lift)"]
    S2 --> S3["3. Capacity Sensing<br/>(42°C Heat -> Minimum)"]
    S3 --> S4["4. Flight Recorder<br/>(Lapse -> If-Then Rule)"]
    S4 --> S5["5. Ethics Governor<br/>(Shame Blocked in Real Time)"]
    S5 --> S6["6. Enterprise DP<br/>(+18.7 pp Synthetic Study)"]

    style S1 fill:#0f766e,stroke:#14b8a6,stroke-width:2px,color:#fff
    style S2 fill:#0f766e,stroke:#14b8a6,stroke-width:2px,color:#fff
    style S3 fill:#0f766e,stroke:#14b8a6,stroke-width:2px,color:#fff
    style S4 fill:#0f766e,stroke:#14b8a6,stroke-width:2px,color:#fff
    style S5 fill:#0f766e,stroke:#14b8a6,stroke-width:2px,color:#fff
    style S6 fill:#0f766e,stroke:#14b8a6,stroke-width:2px,color:#fff
```

### Tour Step-by-Step Details:
1. **Fatima’s Context (`Today` Tab):**
   - Operating in authentic Arabic RTL (`dir="rtl"`), Fatima is an ICU nurse in Abu Dhabi.
   - Her rolling consistency is **74%** with 2 comebacks recorded. Streaks are strictly prohibited by ADR-007.
2. **Habit Twin Pre-Mortem Simulator (`Plan` Tab):**
   - Click **Run Crash-Test** (300 Monte Carlo runs). Notice initial survivability is **2 of 6** (fragile under summer heatwaves & night shifts).
   - Click **"Apply All Recommended Patches"** $\to$ survivability immediately jumps to **5 of 6 (83.3%)** before day 1!
3. **Dynamic Capacity Sensing ($C_t$):**
   - Notice the live Abu Dhabi climate badge: **39.4°C (Feels like 43.1°C)**.
   - Senses 4.5h sleep and extreme heat $\to$ automatically shrinks target to the 2-minute "Minimum". Logging it plays a completion chime and increments the 28-day ring.
4. **Blameless Lapse Flight Recorder (`Flight Recorder` Tab):**
   - Click **"Simulate Lapse (2 Days)"** in the top Demo Bar.
   - Rebound opens a 20-second flight recorder: *"What got in the way?"*
   - Select **"Hospital Night Shift"** $\to$ automatically synthesizes: *"If double shift, then do 2m seated ankle pumps."* Click **Accept** $\to$ verified comeback fanfare plays!
5. **Real-Time Ethics Governor (`Governor` Tab):**
   - Type or test a toxic shaming message: *"You failed your streak yesterday, don't be lazy!"*
   - Watch the Governor intercept it live with Rule **R1**, authenticated against deterministic policy hash `368b1932f91a56bc`.
6. **Program Dashboard & Sim Lab (`Program` & `Sim Lab` Tabs):**
   - Workplace aggregate KPIs automatically apply $k \ge 20$ suppression badges.
   - Sim Lab shows 5,000 synthetic agents over 24 weeks: Rebound (B3) delivers **+18.7 pp persistence** and slashes Recovery Half-Life from **16.5 days to 2.1 days**.

---

## 📊 Interactive 12-Slide Pitch Deck

Rebound includes a complete, interactive 12-slide executive presentation built directly into the web application:
- **Navigation:** Click the **Pitch Deck** button in the header, or press `←` and `→` arrow keys.
- **Presenter Notes:** Click **"Show Speaker Notes"** to reveal talking points and behavioral research citations.
- **Deep-Links:** Each slide includes a direct link jumping directly into the live interactive product feature.

```mermaid
graph TD
    Slide1["1. Title & Value Prop"] --> Slide2["2. The Bad Week Problem"]
    Slide2 --> Slide3["3. Resilience Beats Rigidity"]
    Slide3 --> Slide4["4. The 4 Pillars"]
    Slide4 --> Slide5["5. Habit Twin Crash-Testing"]
    Slide5 --> Slide6["6. Capacity Sensing & MRT"]
    Slide6 --> Slide7["7. Flight Recorder"]
    Slide7 --> Slide8["8. Ethics Governor (R1-R14)"]
    Slide8 --> Slide9["9. Rolling 28-Day Consistency"]
    Slide9 --> Slide10["10. 5,000-Agent Sim Lab"]
    Slide10 --> Slide11["11. Privacy & Abu Dhabi Pilot"]
    Slide11 --> Slide12["12. Roadmap & The Ask"]
```

---

## 🧪 Behavioral Science & Mathematical Rigor

### 1. Deterministic Capacity Sensing Formula ($C_t$)
Capacity renormalizes missing weights so unmonitored sensors never unfairly penalize the user (ADR-004):
$$C_t = \frac{w_{\text{self}} \cdot s + w_{\text{sleep}} \cdot f(\text{sleep}) + w_{\text{heat}} \cdot g(\text{heat})}{\sum w_{\text{active}}}$$

### 2. Rolling 28-Day Consistency (No Streaks)
$$Score_{28} = \frac{\sum_{d=1}^{28} \mathbf{1}_{\{\text{level}(d) \in \{\text{min}, \text{std}, \text{stretch}\}\}}}{28 - \text{GraceDaysUsed}}$$
- Auto-grace days: up to 2 days per rolling 28-day window are automatically excluded from the denominator during illness, travel, or caregiving emergencies without penalty.

### 3. Recovery Half-Life (RHL)
The time (in days) required to recover to $\ge 50\%$ of baseline engagement following a multi-day disruption:
$$\text{RHL} = \text{median}(\Delta t_{\text{recovery}}) = 2.1 \text{ days (vs } 16.5 \text{ days for traditional apps)}$$

### 4. Differential Privacy ($k \ge 20, \epsilon=1.0$)
Aggregate statistics protect individual shift workers and vulnerable cohorts using Laplace noise:
$$\tilde{X} = X + \text{Laplace}\left(0, \frac{\Delta f}{\epsilon}\right) \quad \text{for all } n \ge 20$$
Cohorts with $n < 20$ are strictly suppressed with a visible security shield badge.

---

## 👥 Personas & Inclusivity

| Persona | Language / Mode | Context & Constraints | Primary Feature Used |
|:---|:---|:---|:---|
| **فاطمة (Fatima)** | Arabic (Native RTL) | Night ICU Nurse in Abu Dhabi; 12h shifts; summer heat | Habit Twin night-shift patch & Minimum 2-min wind-down |
| **राजेश (Rajesh)** | Hindi (Low-Literacy) | Outdoor construction worker; high physical strain | Audio Read-Aloud (Web Speech API) & Hydration rhythm |
| **عمر (Omar)** | Arabic (Adaptive) | Wheelchair user; limited lower-body mobility | Seated mobility catalog & adaptive indoor exercise |
| **Mariam** | English | Corporate knowledge worker; prolonged sedentariness | Desk mobility micro-actions & calendar crunch detection |

---

## 🚀 Quick Start & Single-Command Launch

### 1. Unified Launch (Python 3.12)
Launch the entire platform with one command:
```bash
python run.py
```
This automatically boots the FastAPI backend, initializes the database, executes startup seeds, and serves the pre-compiled React frontend at:
- 🌐 **Web Client & Landing Page:** [http://localhost:8000](http://localhost:8000)
- 📚 **Interactive Swagger / OpenAPI Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- 🛡️ **Ethics Governor Hash Verification:** `368b1932f91a56bc`

### 2. Running Automated Tests
```bash
# Run Core Algorithm tests (Capacity math, Bandit, Differential Privacy)
$env:PYTHONPATH="apps/api"; python apps/api/tests/test_rebound_core.py

# Run Full Integration & DB test suite
$env:PYTHONPATH="apps/api"; python apps/api/tests/test_full_suite.py
```
*Result: 17 of 17 tests pass in < 2 seconds.*

### 3. Building the Frontend
```bash
cd apps/web
pnpm install
pnpm build
```
*Compiles Vite bundle to `apps/web/dist` in ~6.5s.*

### 4. 🌐 Deploy to Render (Combined Frontend + Backend · Free Tier)

Rebound is pre-configured for **Render's Free Web Service** hosting both the FastAPI backend and the interactive React SPA from a single service:

#### Option A: One-Click Render Blueprint (Recommended)
1. Fork or push this repository to your GitHub account.
2. Log into [Render.com](https://render.com) and click **New +** $\to$ **Blueprint**.
3. Select your repository. Render will automatically detect [`render.yaml`](file:///render.yaml) and configure:
   - **Environment:** Python 3.12
   - **Build Command:** `./render-build.sh`
   - **Start Command:** `python run.py`
   - **Plan:** Free
4. Click **Apply**. Render will build and deploy your unified app with free HTTPS!

#### Option B: Manual Web Service Setup
1. In Render Dashboard, click **New +** $\to$ **Web Service**.
2. Connect your repo and set:
   - **Language:** Python 3
   - **Build Command:** `./render-build.sh`
   - **Start Command:** `python run.py`
   - **Instance Type:** Free
3. Add Environment Variable:
   - `DEMO_MODE`: `true`
4. Click **Create Web Service**.

---

### 5. Docker Deployment
```bash
docker compose -f infra/docker-compose.yml up --build
```

---

## 📑 Complete Specification Index

| # | Spec Document | Description |
|---|:---|:---|
| 1 | [PRD.md](file:///PRD.md) | Product requirements, personas, features, acceptance criteria |
| 2 | [TRD.md](file:///TRD.md) | Technical requirements, module specs, NFRs, security architecture |
| 3 | [techstack.md](file:///techstack.md) | Architectural choices, version pinning, rationale |
| 4 | [architecture.md](file:///architecture.md) | System components, deployment boundaries, ADRs 001–009 |
| 5 | [systemdesign.md](file:///systemdesign.md) | Runtime sequence diagrams, scheduling, scalability |
| 6 | [data-model.md](file:///data-model.md) | Declarative schema (DDL), indexes, RLS, retention rules |
| 7 | [api.md](file:///api.md) | REST API contract with OpenAPI definitions |
| 8 | [ml-spec.md](file:///ml-spec.md) | Capacity math, Monte Carlo simulator, Beta-Bernoulli Thompson sampling |
| 9 | [design.md](file:///design.md) | UX design principles, wireframes, RTL, accessibility tokens |
| 10 | [ethics-privacy.md](file:///ethics-privacy.md) | Governor rules R1–R14, UAE PDPL, ADHICS, cryptographic audit trail |
| 11 | [evaluation-plan.md](file:///evaluation-plan.md) | 5,000-agent longitudinal study, pilot design, equity metrics |
| 12 | [testing-qa.md](file:///testing-qa.md) | Automated testing strategy, CI gates, golden datasets |
| 13 | [content-library.md](file:///content-library.md) | Michie BCT library, multilingual templates (EN/AR/HI), scenarios |
| 14 | [roadmap-build-plan.md](file:///roadmap-build-plan.md) | Implementation breakdown, DoD, risks |
| 15 | [demo-and-pitch.md](file:///demo-and-pitch.md) | 3-minute judge script, 12-slide outline, judge Q&A, claim boundaries |

---

<div align="center">

**Rebound** · Wellbeing Challenge 09 · Built with resilience for real human lives.  
*Abu Dhabi Pilot Ready · UAE PDPL & ADHICS Compliant*

</div>
