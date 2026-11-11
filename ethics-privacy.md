# Rebound — Ethics, Governor & Privacy

Version 1.0. Compliance statements are design targets (UAE PDPL, ADHICS, DoH policies, GDPR-style principles); a formal legal/clinical review is required before any pilot.

## 1. Ethical Commitments
1. **Autonomy:** users control goals, data, notifications, and technique types.
2. **Non-manipulation:** no loss-framing, shame, fake scarcity, variable-reward slot-machine mechanics, or dark patterns.
3. **Transparency:** every adaptive decision has a "Why this?" with technique, evidence level, and limits.
4. **Non-punitive use:** individual data never used by employers, insurers, or others to penalize or price.
5. **Equity:** measure and report subgroup outcomes; fix gaps, don't hide them.
6. **Safety:** red-flag escalation; no diagnosis or medication dosing.
7. **Data minimization:** collect only what changes decisions; raw signals expire.

## 2. The Ethics Governor
A mandatory, versioned, pure-function policy layer on every outbound user-facing message (nudges, restart prompts, recovery-rule text, anchor messages, exports). Output: `allow | modify | block` + rule IDs. Fail-closed.

### Rule Catalog
| ID | Rule | Action |
|----|------|--------|
| R1 | **No loss/shame framing:** block templates tagged `loss_frame`/`shame`; lexicon match (EN/AR/HI) | block |
| R2 | **Nudge Budget:** ≤ user's budget/day (default 3), min 3 h gap, respect quiet hours | block/delay |
| R3 | **Post-lapse tone:** within 7 days after lapse only templates tagged `supportive` allowed | modify (swap template) |
| R4 | **Language/reading-level match** to user profile (locale, low-literacy) | modify |
| R5 | **Technique mute:** respect user's muted techniques | block |
| R6 | **Incentive cap:** material incentives only if program-enabled; ≤ small fixed cap; never loss-based; no pay-to-lose | block/modify |
| R7 | **Red-flag escalation:** text with symptoms/self-harm lexicon → stop coaching; show care/emergency resources; offer care-team share (consent) | block + escalate |
| R8 | **Sensitive inference ban:** never infer or display health conditions, religion, or sensitive traits in messages | block |
| R9 | **No external individual disclosure:** exports/webhooks/program endpoints may not contain individual-level identifiers | block |
| R10 | **Anchor payload:** only fixed templates, no health data, ≤ 1 request/day, user-initiated | block |
| R11 | **Consent check:** data used in message must be consented (e.g., no sleep-based message if wearable consent off) | block/modify |
| R12 | **Cultural settings:** respect Ramadan/prayer windows, modesty settings (imagery/action variants) | modify |
| R13 | **Exploration limit:** bandit exploration cannot choose arms with evidence_level `emerging` more than 10% of sends | modify |
| R14 | **Frequency safety:** never send more than 1 restart nudge/24 h; no urgency language ("last chance", "now or never") | block |

### Governor Design
- Policy as code (`policy.yaml` + Python rules); `policy_hash` stored with each decision.
- Each rule unit-tested; property tests generate adversarial templates (hypothesis) to ensure no forbidden lexicon passes.
- Admin Governor Console shows block rates by rule, top blocked patterns, and policy diffs; changes require 2-person review.
- Public policy summary at `/v1/docs/governor-policy` (transparency).

## 3. Consent Model
- Granular scopes (see data-model.md). Defaults: off except essential service.
- Consent text in plain language with examples ("We use your sleep to suggest lighter days when you're short on rest").
- Revocation: immediate stop of use; optional "delete data from this source".
- Re-consent on policy version change; clear change summaries.
- Care-team share and research-aggregate are separate, optional, revocable.

## 4. Privacy by Design Controls
| Control | Implementation |
|---------|----------------|
| Data minimization | No contact lists, no precise location (city-level only); optional demographics only for equity aggregates, user-controlled |
| Purpose limitation | Scopes mapped to features; middleware enforces |
| Access control | RBAC + RLS; analyst role limited to aggregates |
| Encryption | TLS; at-rest provider encryption; app-level encryption for free-text |
| Aggregation | k ≥ 20, Laplace ε=1, bucketed n |
| Retention | Raw signals 90 days; nudge logs 12 months; account deletion cascades |
| Auditability | Hash-chained audit log; user can view their own |
| Portability | JSON/CSV export |
| Vendor control | LLM calls minimized: no direct identifiers in prompts; user text redacted for names/phones; provider data-use settings = no training |

## 5. LLM Safety Controls
- No raw user free text in system prompts; user text is delimited as data.
- Output constrained by JSON schema; validated; unsafe content filter; fallback templates.
- No medical advice generation: prompts forbid diagnosis/dosing; post-filter detects drug names + dosing patterns and blocks.
- Prompt-injection tests included in CI (golden adversarial set).
- Logging: store prompt/response hashes + schema outputs; raw text retained only if user consents to "help improve" (default off).

## 6. Safeguards for Sensitive Behaviors
- **Smoking:** supports reduction/cessation behaviors, craving-management, environment changes; recommends consulting a pharmacist/doctor for pharmacological support; no dosing.
- **Nutrition/weight:** avoid calorie-restriction pressure; no body-shaming; if signs of disordered-eating language are detected → R7 flow.
- **Sleep:** no clinical sleep-disorder claims; suggest clinician if persistent severe issues.
- **Mental health language:** compassionate stop screen and resource list; no counseling attempts.

## 7. Anti-Misuse Architecture
| Misuse | Control |
|--------|---------|
| Employer pressure to participate or disclose | Program role sees only aggregates; no individual endpoints; contract guidance in docs |
| Insurer use for pricing | No data sharing; terms prohibit; DP outputs only |
| Dark-pattern engagement growth | Governor rules R1/R2/R13/R14; MRT metrics track fatigue not just opens |
| Re-identification via small cells | k-suppression, noise, bucketed n; query budget |
| Anchor stalking | Templated messages, user-initiated only, revocation, rate limit |
| Bias in recommendations | Subgroup calibration/outcome audits; equity gap alerts |

## 8. Fairness & Inclusion Plan
- Collect optional demographics with explicit purpose and opt-in; allow "prefer not to say."
- Audit hazard calibration and nudge effects by subgroup (language, age band, work pattern, accessibility needs).
- Threshold alerts when gap_abs > 5 pp or calibration slope outside [0.8, 1.2] for a subgroup.
- Remediation playbook: content variants, channel changes, outreach, human support options.
- Accessibility acceptance tests are part of release criteria.

## 9. Governance
- **Roles:** Product Owner, Clinical Advisor (content/red flags), Privacy Lead, Security Lead, Ethics Reviewer.
- **Change control:** Governor policy, content library, scenario library, red-flag lexicon require review + version bump.
- **Incident response:** privacy incident runbook (detect, contain, assess, notify per regulation, remediate, learn); target notification timelines per applicable law.
- **User rights:** access, correction, deletion, portability, objection — supported in-app with documented SLAs.
- **Research use:** only with `research_aggregate` consent; IRB/ethics approval required for any human-subject study (see evaluation-plan.md).

## 10. Transparency Artifacts
- Plain-language privacy notice (1 page) and "How Rebound decides" explainer.
- Governor policy summary page.
- Simulator assumptions page.
- Model cards (hazard, capacity, bandit, classifier).
- Public changelog of policy/content changes.

## 11. Ethical Risk Register
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Users feel surveilled | M | H | Minimal data, visible controls, audit log |
| Over-reliance on app | M | M | Support fading, human escalation paths, caps |
| Cultural insensitivity | M | H | Native review, configurable settings, community testing |
| False reassurance on health | L | H | Clear scope, red-flag escalation, no diagnosis |
| Incentive crowding-out intrinsic motivation | M | M | Small, optional, time-limited incentives; emphasize autonomy |
| Algorithmic inequity | M | H | Subgroup audits, equity targets, remediation |
