# Rebound — Evaluation Plan

Version 1.0. Measures **sustained change and recovery**, not downloads or opens.

## 1. Evaluation Layers
| Layer | Question | Method | Timing |
|-------|----------|--------|--------|
| L1 Design validation | Does the design logic beat streak-and-reminder under realistic disruptions? | Agent-based simulation (5,000 synthetic users) | MVP |
| L2 Component validation | Do hazard, capacity, and classifier perform and calibrate? | Offline eval on synthetic then real data | MVP → pilot |
| L3 Usability & inclusion | Can diverse users complete core flows? | Moderated tests (n=12–20), accessibility audit | Pre-pilot |
| L4 Nudge optimization | Which nudges help whom, when? | Micro-randomized trial (MRT) | Pilot |
| L5 Effectiveness | Does Rebound improve persistence and outcomes vs usual care? | Stepped-wedge or parallel randomized pilot | Pilot (3–6–12 months) |
| L6 Equity & safety | Are benefits equitable and harms avoided? | Subgroup analyses, adverse-event monitoring | Continuous |

## 2. Primary & Secondary Outcomes
**Primary:** 6-month persistence (ml-spec §7).
**Secondary:** RHL (median, KM-censored); resume-within-7-days; behavior change (active minutes/steps, sleep regularity, cigarettes/day, hydration/meal timing adherence); biomarkers (SBP/DBP, HbA1c, weight; Health Age delta) at 3/6/12 months where consented; retention (weekly meaningful use); survivability change after patching; plan-level Crash-Test calibration (does predicted survivability correlate with real lapses?).
**Process/guardrail:** opt-out, mute rate, fatigue index, complaints, Governor blocks, adverse events, accessibility completion rates.

## 3. L1 Simulation Study Protocol
**Population:** N=5,000 per run; attributes from configurable distributions (work pattern mix incl. 20% night/rotating, 25% outdoor, 15% low literacy, 8% mobility limitations, language mix AR/EN/HI/Other, baseline motivation Beta(2,3), self-efficacy Beta(2,2)).
**Disruptions:** Poisson rates per month — shift swap 1.0, heatwave days 1.5 (summer), travel 0.5, illness/caregiving 0.4, work crunch 0.7, Ramadan once per year.
**Arms:** B0 none · B1 streak+reminders (streak reset; response model: post-lapse dropout hazard ×1.6 after streak loss) · B2 Rebound without Crash-Test · B3 full Rebound (Crash-Test + Elastic + Flight Recorder + MRT/TS).
**Outcomes:** persistence curves (weeks 1–52), RHL distribution, resume-7d, dropout, equity gap.
**Replication:** 20 seeds; report mean and 95% interval.
**Sensitivity:** vary β coefficients ±30%, disruption rates ±50%, Rebound effect-size priors halved (pessimistic).
**Circularity guard:** report which assumptions drive B3's advantage (e.g., rigid plan penalty, graded task benefit) via ablation (B3 minus each component).
**Deliverables:** `sim_report.pdf`, CSVs, notebook, parameter sheet.
**Interpretation rule:** results support *design plausibility*; they are not evidence of real-world effectiveness.

## 4. L2 Model Evaluation
| Model | Metrics | Targets (initial) |
|-------|---------|-------------------|
| Lapse hazard | AUC, PR-AUC, Brier, calibration slope/intercept, subgroup calibration | AUC ≥ 0.70 on pilot data; slope in [0.8,1.2] per subgroup |
| Capacity | Correlation with next-day Min completion; ablation of inputs | Spearman ≥ 0.25 |
| Barrier classifier | Accuracy/F1 on golden set (EN/AR/HI), confidence calibration | Macro-F1 ≥ 0.75 |
| Bandit | Cumulative proximal reward vs fixed policy (off-policy IPS/DR estimates) | Non-inferior in week 1, superior by week 6 |
| Crash-Test | Rank correlation between predicted scenario survival and observed disruption outcomes | Report; no target for MVP |

## 5. L3 Usability & Accessibility Study
- Participants: 12–20 across languages, literacy, age, disability (screen reader, motor, low vision), work patterns.
- Tasks: onboarding with consent, build plan, run Crash-Test, daily check-in/log, restart after lapse, Flight Recorder, export/delete, change notification settings.
- Metrics: task success, time-on-task, SUS, comprehension of "Why this?" and privacy controls (quiz), error rate, trust questions.
- Acceptance: ≥ 90% success on core loop; SUS ≥ 80; ≥ 80% correctly explain what data is used.

## 6. L4 Micro-Randomized Trial (MRT)
- **Design:** at each eligible decision point, randomize send/no-send with π ∈ [0.2,0.8]; among sends, arm chosen by TS (or randomized among arms in first 2 weeks for burn-in).
- **Primary proximal outcome:** logged ≥ Min within 4 h.
- **Analysis:** weighted & centered least squares (WCLS) / GEE with IPW; moderators: state (ON_TRACK/AT_RISK), capacity bin, slot, channel, language, work pattern.
- **Sample size (illustrative):** ≥ 100 participants × 42 days × ~2 decision points ≈ 8,400 decisions → detects an absolute 5 pp proximal effect with ~80% power under ICC ≈ 0.1 (verify with simulation before pilot).
- **Burden monitoring:** pause arms/slots with fatigue index > 0.6.

## 7. L5 Pilot Effectiveness Design
- **Design options:** (a) stepped-wedge across workplaces/clinics (preferred operationally), or (b) parallel RCT vs usual-care/information-only.
- **Eligibility:** adults 18+, targeting ≥ 1 of the four behaviors; exclusions per clinical advisor (e.g., acute conditions requiring supervised activity).
- **Duration:** 12 months with measurements at 1, 3, 6, 12 months.
- **Sample size (illustration):** to detect 6-month persistence of 45% vs 35% (p̄=0.40), α=0.05 two-sided, power 80%: n ≈ 2·(1.96+0.84)²·p̄(1−p̄)/Δ² ≈ 376 per arm; inflate 25% for attrition → ≈ 470 per arm. Adjust for clustering (design effect 1+(m−1)ICC) if workplace-clustered.
- **Analysis:** intention-to-treat; mixed models for repeated persistence windows; time-to-resume via Kaplan–Meier/Cox; missing data via multiple imputation with sensitivity (tipping point).
- **Ethics:** IRB/ethics approval; informed consent; DSMB-lite review for adverse events; data sharing plan; pre-registration of primary outcome.

## 8. Equity Analysis Plan
- Pre-specify subgroups: language, age band, gender (optional), nationality group (optional), work pattern, accessibility needs, literacy mode.
- Report: persistence, RHL, retention, outcome deltas per subgroup with CIs; equity gap and trend.
- Trigger rules: gap_abs > 5 pp for two consecutive months → remediation review (content, channel, outreach, accessibility fixes).
- Include interaction tests (treatment × subgroup) with caution about multiplicity.

## 9. Safety Monitoring
- Adverse events: self-reported injury during actions, distress flagged via R7, complaints about pressure/privacy.
- Weekly review of Governor blocks and red-flag escalations; monthly clinical advisor sign-off.
- Stopping rules: pause intervention variants showing harm signals (e.g., elevated dropout or distress in a subgroup).

## 10. Reporting Dashboard (program view)
Persistence (3/6/12 months), RHL median + KM curve, resume-7d, retention, outcome deltas, equity gap, fatigue/opt-out, privacy stats. Exports for evaluators (aggregate only).

## 11. Data Quality & Logging Requirements
- Every nudge: context snapshot, propensity, arm, Governor result, outcome.
- Every plan change: before/after, reason (user/system/patch/rule).
- Clock synchronization and timezone logging; event versioning for reproducibility.
- Data dictionary and analysis scripts under version control; analysis plan pre-registered before unblinding.

## 12. Timeline (indicative)
| Phase | Duration | Output |
|-------|----------|--------|
| MVP + simulation | Build window | Demo + sim report |
| Usability/accessibility study | 3–4 weeks | Findings + fixes |
| MRT burn-in | 6 weeks | Nudge policy v1 |
| Pilot enrollment + 12-month follow-up | 12–15 months | Effectiveness + equity report |
