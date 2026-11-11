# Rebound — Demo Script, Pitch & Judge Q&A

Version 1.0

## 1. Positioning
**Tagline:** Built for the bad week.
**Problem line:** Health apps are designed for motivation. People quit when life interrupts.
**Solution line:** Rebound crash-tests your plan before you start, shrinks it when life gets hard, and turns every lapse into a personal recovery rule, with ethics enforced in the architecture.
**Why now / why here:** Abu Dhabi already has screening, Health Age, wearables, patient apps and campaigns. The missing piece is the adaptive loop that sustains change and recovers from lapses, and measures it.

## 2. Differentiators (say these out loud)
| Claim | Proof in demo |
|-------|---------------|
| First to **crash-test a plan** against real disruptions (night shifts, Ramadan, heat, travel) | Survivability 2/6 → 5/6 after one-tap patches |
| **Recovery is the product**: no streaks, rolling consistency, grace days, comebacks | Lapse → restart → score dips but never resets |
| **Learns what works** per person with logged propensities (micro-randomization) | "Why this?" card + learning view |
| **Ethics Governor** blocks manipulative or shaming messages by design | Live block of a loss-framed message |
| **Equity and privacy measured, not promised** | Dashboard gap + k-suppression + ε badge |
| **New metric: Recovery Half-Life** | Dashboard distribution, B1 vs B3 curves |

## 3. Three-Minute Demo Script
| Time | Screen | Say | Do |
|------|--------|-----|----|
| 0:00–0:20 | Title | "Every health app is designed for the good week. People quit in the bad one. Meet Rebound." | — |
| 0:20–0:50 | Onboarding (AR) | "Fatima is a night-shift nurse. She picks Arabic, controls every data source, and states her goal in her own words." | Toggle consents; speak goal |
| 0:50–1:30 | Crash-Test | "Before she commits, her plan runs through six bad weeks. It survives 2. Rebound shows why and fixes it." | Apply two patches; score → 5/6 |
| 1:30–2:00 | Today + Capacity | "Today she slept 4 hours and it's 44°C. Rebound suggests the Minimum. No guilt. It still counts." | Tap Minimum ✓; score changes slightly |
| 2:00–2:30 | Lapse → Restart → Flight Recorder | "After a shift swap she misses two days. No streak to lose. A 2-minute restart, then a 20-second replay turns the lapse into her own rule." | Accept rule |
| 2:30–2:45 | Why + Governor | "Every nudge explains itself. Watch the Governor block a shaming message." | Show blocked template in console |
| 2:45–3:00 | Program dashboard | "For programs: persistence, Recovery Half-Life and an equity gap, with small groups suppressed and noise added. Individual data never leaves." | Show suppression + equity bars |

**Backup plan:** pre-recorded 3-minute video; `DEMO_MODE` controls to force states; local compose fallback.

## 4. Five-Minute Extended Script (add-ons)
- Rajesh: low-literacy audio mode, Hindi, heat scenario, WhatsApp Rescue Link (stub) showing the Anchor receives no data.
- Simulation Lab: B0–B3 curves; ablation bar chart; sensitivity band; "SIMULATED" watermark.
- Accessibility: keyboard-only walkthrough and screen-reader snippet; RTL layout.

## 5. Slide Outline (12 slides)
1. **Title:** Rebound — built for the bad week.
2. **Problem:** information doesn't sustain change; lapses cause dropout; generic programs miss context; misuse risks.
3. **Insight:** failure comes from fragile plans, not weak motivation.
4. **Solution overview:** Crash-Test · Elastic Plan · Flight Recorder · Rescue Link · Governor.
5. **How it works (loop diagram):** check-in → capacity → level → log → rollup → risk → restart → recorder → rule.
6. **Crash-Test:** scenario cards, Survivability Score, patches.
7. **Learning & re-engagement:** hazard, state machine, MRT + Thompson sampling, channel ladder.
8. **Evidence-based & transparent:** BCT mapping, Why card, limits visible.
9. **Autonomy, inclusion, anti-misuse:** consent scopes, languages, accessibility, Governor, aggregate-only.
10. **Measurement:** persistence, RHL, outcomes, retention, equity gap; evaluation plan.
11. **Evidence so far:** simulation results with sensitivity/ablation and honest caveats.
12. **Roadmap & ask:** pilot, integrations (Health Age, wearables, patient app), clinical governance; call to action.

## 6. One-Page Summary (for submission form)
**Rebound** is an adaptive behavior-change engine for movement, sleep, nutrition and smoking reduction. Users build tiny, elastic plans (Minimum/Standard/Stretch) that are **crash-tested** against realistic disruptions (night shifts, Ramadan, heat, travel, illness, work crunch) and patched before commitment. A daily capacity signal resizes the plan to the person's real day. When engagement drifts or a lapse occurs, Rebound downshifts without blame, offers a two-minute restart, and runs a 20-second **Lapse Flight Recorder** that converts the lapse into a personal if-then recovery rule. A micro-randomized nudge engine learns which techniques, timing and channels work per person; every nudge shows its behavior-change rationale, evidence level and limits. An **Ethics Governor** enforces anti-manipulation rules, nudge budgets, red-flag escalation and aggregate-only external reporting. Outcomes are measured as persistence, **Recovery Half-Life**, behavior/biomarker change, retention and an explicit **equity gap**, with k-anonymity and differential privacy on program dashboards.

## 7. Judge Q&A (prepared answers)
**Q: How is this different from habit apps with streaks and reminders?**
A: Streaks punish the first lapse; we remove streaks entirely and measure comebacks. We also stress-test the plan before commitment, which no mainstream app does, and we learn from every lapse through a personal recovery rule.

**Q: Is the Crash-Test just made-up numbers?**
A: It's a transparent simulator with documented assumptions and sensitivity ranges. It's a design aid for plan robustness, not a clinical prediction. In the pilot we measure whether predicted survivability correlates with real lapses and recalibrate.

**Q: What evidence do you have that it works?**
A: Today: a simulation study with ablations and a pessimistic parameter set, which supports design plausibility. We state clearly it isn't clinical evidence. The evaluation plan is a micro-randomized trial for nudges and a stepped-wedge pilot with 6- and 12-month persistence and equity endpoints.

**Q: How do you prevent manipulation or punitive use by employers/insurers?**
A: Architecture, not promises: aggregate-only program role, k ≥ 20, differential privacy, no individual endpoints, an Ethics Governor that blocks shame/loss framing and enforces a user-set nudge budget, plus contractual terms prohibiting use for pricing or employment decisions.

**Q: How do you handle privacy with wearables and health data?**
A: Granular consent per source, off by default, revocable instantly. Raw signals expire after 90 days. Row-level security, encrypted free text, hash-chained audit log, user-visible audit and export/delete.

**Q: What about languages and low literacy?**
A: Arabic and English fully, Hindi next, with native review. A low-literacy mode with icon-first UI, audio instructions and WhatsApp-friendly flows. Capacity and plans work without any wearable.

**Q: Why would users stay engaged without gamification?**
A: We rely on competence and autonomy: small wins, visible comebacks, personal recovery rules and relevance to their real week. Optional gamification and small incentives are allowed but visible, capped and non-punitive.

**Q: What does the LLM do, and what if it's wrong?**
A: It helps with goal structuring, barrier classification and phrasing within strict schemas and allow-listed actions. Outputs are validated, pass the Governor, and the user confirms. The system works fully with templates if the LLM is off.

**Q: How do you integrate with the Abu Dhabi ecosystem?**
A: Adapter interfaces for Health Age, patient app journeys, wearables and campaigns. The MVP uses mocks with the same contracts; pilots plug in real sources under consent and governance.

**Q: How do you ensure equity?**
A: Subgroup metrics are first-class: persistence, RHL, retention and calibration by language, age, work pattern and accessibility need. A gap above 5 pp triggers a remediation playbook (content, channel, outreach, accessibility fixes).

**Q: What are the limits?**
A: No diagnosis or medication advice; red-flag escalation to care. Simulator results are not efficacy. Some behaviors (e.g., cessation) need clinician-led support; Rebound complements, not replaces, care.

**Q: What would you do with 6 more months?**
A: Real connectors, pilot with a workplace and a clinic, refit models on real data, expand languages, and publish equity and effectiveness results.

## 8. Claims Guardrails
**Do say:** "design validation by simulation", "pilot-ready", "built to measure persistence and recovery".
**Don't say:** "clinically proven", "reduces disease", "AI predicts your health", "guarantees adherence".
Label all synthetic data and simulated charts. Disclose mocked integrations.

## 9. Demo Environment Checklist
- [ ] Staging + local fallback both seeded; `DEMO_MODE=true`.
- [ ] Browser profiles for AR/EN; device in RTL; screen reader tested.
- [ ] Time controls tested: advance day, trigger heatwave, force lapse, force Governor demo.
- [ ] Sim study run cached; slides include final figures with intervals.
- [ ] Backup video exported; slides offline copy.
- [ ] README and docs links in submission; repo clean; secrets removed.
- [ ] Rehearsed twice with a timer (3:00 limit).

## 10. Submission Package
Pitch deck (PDF) · 3-minute demo video · live URL + credentials for judges · repo with README · this docs pack · simulation report · one-page summary (§6).
