# Rebound — ML & Algorithm Specification

Version 1.0. All parameters are **design assumptions** unless fitted from data; they are labeled and configurable. Nothing here is a clinical claim.

## 1. Capacity Score (C_t)
Purpose: estimate today's capacity (0–1) to choose a level.

Inputs (each normalized to 0–1, higher = more capacity):
| Input | Source | Weight w |
|-------|--------|---------:|
| `self` = (mood_face−1)/4 | check-in | 0.30 |
| `sleep` = clip((sleep_h−3)/(8−3),0,1) | check-in or wearable | 0.25 |
| `load` = 1 − workload (shift length/crunch event; night shift after-shift flag) | context + profile | 0.20 |
| `heat` = 1 − clip((HI−32)/(45−32),0,1) (outdoor actions only; indoor actions use 1) | weather API | 0.10 |
| `travel_ill` = 0 if travel/illness event active else 1 | context events | 0.10 |
| `chips` = 1 − 0.15·(#negative chips, max 3) | check-in | 0.05 |

Formula: `C_t = Σ(w_i·x_i) / Σ(w_i over available inputs)`; missing inputs drop out (renormalization). Self-report alone is sufficient.

Level suggestion (per action, `h` = action difficulty modifier 0–0.1 added for Stretch):
- `C_t ≥ 0.70` → Standard (Stretch offered only if user opted in and last 7 days ≥ 85% Standard+)
- `0.40 ≤ C_t < 0.70` → Minimum offered first; Standard available
- `C_t < 0.40` → Minimum + "or take a grace day" option

Explanation string generated from the top two contributing inputs (templated, localized).

## 2. Consistency Score (rolling 28 days, no streaks)
Day credit per target action: none = 0; min = 0.6; std = 0.9; stretch = 1.0 (rewards showing up on hard days more than escalating).
Eligible days exclude: pauses, auto grace days (up to 2 per rolling 28 days, applied to missed days only, earliest first), days before plan start.

`consistency_28d = Σ credit_d / (#eligible_days)` averaged across active actions weighted by priority.

Properties (tested): (P1) monotone non-decreasing in any day's completion; (P2) a single missed eligible day reduces the score by at most 1/#eligible; (P3) score never forced to 0 by a lapse if any completion in window; (P4) no state carries from outside the 28-day window.

**Comeback:** transition RESTARTING → ON_TRACK; `recovery_days` = days from lapse detection to first completion ≥ Min.

## 3. Crash-Test Simulator (Habit Twin)

### 3.1 Completion model
For each day t and action a in a run:
```
p(a,t) = σ( β0 + β1·C_t + β2·fit(window,a,t) + β3·cue(a,t) + β4·H_t − β5·diff(level) − β6·friction(a,t) )
done ~ Bernoulli(p)    # level chosen = policy(C_t) (elastic) or fixed (baseline)
H_{t+1} = H_t + α·(done − H_t)    # habit strength, α=0.06, H_0=0.1
```
- `fit` ∈ [0,1]: overlap between scheduled window and free time (scenario can block windows).
- `cue` ∈ {0,1}: cue available (e.g., "after Maghrib" unavailable while traveling).
- `diff(level)`: min=0.0, std=0.8, stretch=1.6.
- `friction`: equipment unavailable, outdoor in heat, etc.
- Default coefficients (assumptions): β0=−0.6, β1=2.2, β2=1.0, β3=0.9, β4=1.4, β5=1.0, β6=1.1. User-adjustable in Simulation Lab sensitivity mode; ranges ±30%.

### 3.2 Scenario Library (versioned YAML; see content-library.md §4)
Each scenario defines: duration (7–14 days), per-day capacity multiplier m_t, blocked windows, cue availability, friction modifiers, extra triggers (for smoking), start day.
Applicability: scenario is applied only if relevant (e.g., Ramadan only if `ramadan_observing`; night-shift only if work pattern night/rotating; heatwave only if outdoor/hot-season/city).

### 3.3 Survival Definition
A run **survives** scenario s if both:
1. (during) ≥ 60% of eligible scenario days have completion ≥ Min on at least one target action per behavior, and
2. (after) returns to ≥ baseline (mean of 7 pre-scenario days) within 7 days post-scenario.
Scenario is **survived** if ≥ 70% of runs survive. `Survivability Score = survived_scenarios / applicable_scenarios` (displayed as k of n).

### 3.4 Patch Search (greedy)
Candidate edit types: `shift_window`, `add_fallback` (micro-action), `swap_cue`, `indoor_variant`, `reduce_frequency`, `split_session`, `add_rule_precommit` (pre-commit recovery rule).
Algorithm:
```
current = plan
for step in 1..3:
  for edit in candidates(current, failed_scenarios):
      gain = score(current + edit, affected_scenarios) − score(current, affected_scenarios)
      value = gain / edit.effort_cost
  apply best positive-value edit; stop if score ≥ target (default 5/6) or no positive value
```
Constraint: patches may not increase Minimum duration or total daily time above user's `max_daily_minutes`.
Determinism: RNG seeded by `(plan_hash, seed)`; cache by `(plan_hash, profile_hash, scenario_version, seed)`.
Complexity: vectorized over runs (shape: runs × days × actions); target < 3 s for 6 scenarios × 300 runs × ≤ 3 actions.

## 4. Lapse Hazard Model
**Target:** `y_t = 1` if a lapse (2 consecutive eligible misses) begins within the next 3 days.
**Features (daily):** days since last completion; 7-day completion rate and slope; capacity mean and trend (3d); check-in missing streak (days without check-in); notification dismiss rate (7d); sleep deficit; context flags (shift_swap, travel, illness, heat_alert); time since plan commit; prior lapses count; level downshift count; weekend flag.
**Model:** discrete-time logistic regression (L2), isotonic calibration; threshold at 0.5 for AT_RISK (configurable).
**Cold start:** pretrain on synthetic simulator data (clearly flagged); replace/update with real data weekly (offline refit) once ≥ 2,000 user-days available.
**Monitoring:** calibration slope/intercept, AUC (on rolling holdout), drift (PSI on key features), subgroup calibration (equity).
**Explainability:** top 3 contributing features rendered as plain-language reasons (never shown as blame).

## 5. Nudge Personalization (MRT + Thompson Sampling)

### 5.1 Decision points
Up to three per day: `morning`, `pre_window` (30 min before action window), `evening`. Each is evaluated if: within user's allowed hours, budget left, consent granted, not PAUSED (restart nudges excepted when user opted in).

### 5.2 Micro-randomization
`send ~ Bernoulli(π)` with `π = clip(π0 + δ, 0.2, 0.8)`, `π0=0.6`; δ reduces by 0.1 if user's fatigue index > 0.5 (recent mutes/dismisses), increases by 0.1 if state = AT_RISK (and budget allows). Log π with every decision (inverse-propensity analysis later).

### 5.3 Arms
`arm = technique × slot × channel`; MVP techniques (≈ 6): action planning (1.4), prompts/cues (7.1), self-monitoring feedback (2.3), graded task prompts (8.7), social support request (3.1, only with Anchor), identity/comeback reinforcement (13.5/15.3). Channels per user availability.

### 5.4 Thompson sampling with hierarchical prior
Per user-arm posterior Beta(α, β). Prior from cohort stratum (language × work pattern × behavior): `α0 = κ·p̂_c`, `β0 = κ·(1−p̂_c)`, κ = 8. Sample θ_arm ~ Beta; choose argmax among Governor-eligible arms. Epsilon floor 5% uniform among eligible arms for continued exploration.

### 5.5 Reward and outcomes
Proximal reward `r = 1` if action logged ≥ Min within 4 h of delivery; else 0. Negative signals recorded separately: `dismissed_fast` (<5 s), `muted_technique`, `opt_out`. A fast-dismiss subtracts 0.5 from the update (α unchanged, β += 0.5). Mute technique: arm removed for that user.
Confounding control: because sends are randomized, causal effect of sending vs not sending can be estimated per slot/state; arm comparisons are conditional on send.

### 5.6 Safety rails
Max sends/day = budget; min gap between nudges 3 h; no nudges within 2 h of a user's "I did it" log for the same action; restart nudge exempt from fatigue downweight but still Governor-checked.

## 6. Barrier Classification & Recovery Rules

### 6.1 Taxonomy
`TIME`, `ENERGY`, `MOOD`, `PAIN_ILLNESS`, `TRAVEL`, `FAMILY_CARE`, `WEATHER_HEAT`, `SHIFT_WORK`, `ACCESS_FACILITIES_FOOD`, `COST`, `FORGOT`, `MOTIVATION`, `SOCIAL_PRESSURE`, `OTHER`.

### 6.2 Classifier
1. Chip selection → direct mapping (confidence 0.9).
2. Context auto-evidence: active events (shift_swap → SHIFT_WORK, heat_alert → WEATHER_HEAT, travel → TRAVEL, illness → PAIN_ILLNESS) add prior 0.6.
3. Free text/voice → LLM with JSON schema `{barrier, confidence, rationale_short}`; fallback keyword model per locale. Output validated against taxonomy; confidence < 0.5 → ask user to pick chip.
4. `PAIN_ILLNESS` with red-flag lexicon (chest pain, fainting, self-harm etc.) → **Governor R7 escalation** (see ethics-privacy.md); no coaching content produced.

### 6.3 Recovery-rule generation
Rule = `{trigger, action, level, when}`. Template per barrier, e.g. SHIFT_WORK → "If I miss two days after a night shift, I'll do [fallback micro-action] on my first day off." LLM may only paraphrase within schema and locale; output goes through Governor and user confirmation. Rules are applied by the plan engine: when trigger context recurs, today's suggestion shifts to the rule's action/level and the rule is shown as "Your plan for this".

### 6.4 Lapse Signature (P1)
Per user, compute lift of lapse onset given context flags: `lift_c = P(lapse_next3d | c) / P(lapse_next3d)` with Laplace smoothing; show top 3 with n ≥ 3 occurrences; used as hazard features.

## 7. Metrics Definitions
- **Persistence (P_w):** for window length 28 days, share of windows where `consistency_28d ≥ 0.6` (≥ Min on ≥ 60% eligible days). 6-month persistence = fraction of the user's rolling windows in months 1–6 meeting the threshold (alt: window at month 6 only; report both).
- **Recovery Half-Life (RHL):** for a disruption starting day d0 (lapse detected or scenario): `B` = mean daily credit over 14 days before; `S_t` = 3-day smoothed credit; trough `T = min S_t` in 14 days after d0; `RHL = min{ t − t_trough : S_t ≥ T + 0.5·(B − T) }`; if never, censored at 28 days. Report median with Kaplan–Meier for censoring.
- **Resume-within-7:** share of lapses with first ≥ Min completion within 7 days of detection.
- **Behavior/biomarker change:** difference from baseline (mean of first 14 days or first measurement) to month-3/6; outcomes include steps/active minutes, sleep regularity (SD of sleep midpoint), cigarettes/day, SBP/DBP, HbA1c, weight, Health Age delta (where consented).
- **Retention:** active = ≥ 1 log or check-in in the week; retention at 3/6/12 months.
- **Equity gap:** for metric M and subgroups g with n ≥ k: `gap_abs = max_g M_g − min_g M_g`; `gap_rel = gap_abs / mean_g M_g`. Target `gap_abs ≤ 5 pp`. Bootstrap CIs.
- **Fatigue index:** exponentially weighted mean of (dismiss_fast + 2·mute + 3·opt_out) per sent nudge over 14 days.

## 8. Differential Privacy & Suppression
- k-anonymity floor: suppress any cell with `n < k` (k=20).
- Release noise: Laplace(b = Δ/ε) with ε = 1.0 per metric per release; sensitivities: proportions Δ = 1/n (clamped), counts Δ = 1, medians via bounded smooth-sensitivity approximation or exponential mechanism.
- Budget accounting: monthly composition per cohort (advanced composition or simple sum documented); budget ledger table in `agg_metrics.epsilon`.
- Post-processing: clamp [0,1] for proportions; round for display; never publish exact n (use buckets 20–49, 50–99, 100+).

## 9. Agent-Based Simulation Study
- Population: N=5,000 synthetic users with attributes sampled from configurable distributions (work patterns, language, accessibility, baseline motivation, self-efficacy).
- Disruptions: Poisson processes per scenario type with user-specific rates; durations from scenario library.
- Arms: **B0** no support; **B1** streak + fixed reminders (streak resets, shame-neutral-to-negative response modeled as higher post-lapse dropout probability); **B2** Rebound without Crash-Test; **B3** full Rebound.
- Outcomes: persistence curves, RHL, resume-7, dropout, equity gap across subgroups.
- Sensitivity: sweep key parameters ±30%; report ranges; include "pessimistic" parameter set where Rebound effects shrink by half.
- Honesty: simulator encodes design assumptions (e.g., strains from rigid plans); report as design validation, not efficacy.

## 10. Model Cards (required artifacts)
For hazard model, capacity function, bandit, barrier classifier: intended use, inputs, assumptions, evaluation, subgroup performance, limitations, update cadence, owner. Stored in `docs/model-cards/`.
