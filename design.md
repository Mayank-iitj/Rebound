# Rebound — Design & UX Specification

Version 1.0

## 1. Design Principles
1. **Design for the bad week.** Default screens work at 2 minutes and low energy.
2. **No shame, no streaks.** Language and visuals celebrate comebacks and effort, never loss.
3. **Small first.** Always show the Minimum option; never hide it.
4. **Transparent adaptation.** Every adaptive change has a visible, plain-language "why".
5. **Control belongs to the user.** Goals, data, notifications, and nudge types are editable in ≤ 3 taps.
6. **Inclusive by default.** RTL, audio, icons, high contrast, big targets, plain language.
7. **Calm.** Few elements per screen, soft motion, no urgency cues.

## 2. Voice & Microcopy
| Do | Don't |
|----|-------|
| "Life happened. Here's a 2-minute restart." | "You broke your streak." |
| "You came back in 2 days — that's your 3rd comeback." | "You failed again." |
| "Today looks heavy. The Minimum version still counts." | "Don't give up!" |
| "Want to change when we remind you?" | "You missed your reminder." |
**Reading level:** grade 6 target; sentences ≤ 15 words; one idea per sentence. Avoid idioms (translation risk). Use "you", active verbs, concrete times.
**Forbidden lexicon:** fail, failure, lazy, weak, guilt, shame, behind, ruined, lost your, broke your, last chance, must, should (judgmental use), "only X days left". (Governor enforces; see ethics-privacy.md.)

## 3. Information Architecture
```
Public:  Landing · Language select · Privacy summary · Magic-link login
App:
  Today (home)
    ├─ Capacity check-in
    ├─ Action cards (level picker)
    ├─ Restart (Minimum Viable Day)
  Progress
    ├─ Consistency ring (28d)
    ├─ Comebacks timeline
    ├─ Survivability
    ├─ Outcomes (if consented)
  Plan
    ├─ My actions
    ├─ Crash-Test
    ├─ Recovery rules
  Support
    ├─ Rescue Link (Anchors)
    ├─ Why this? history
  Settings
    ├─ Goals · Data & consent · Notifications · Language & accessibility · Export/Delete · Audit log
Program (analyst role):
  Overview · Persistence · Recovery · Outcomes · Equity · Privacy
Admin/Sim:
  Simulation Lab · Governor Console
```
Bottom nav (mobile): Today · Progress · Plan · Support · Settings. Desktop: left rail.

## 4. Key Screens & Wireframes (ASCII)

### 4.1 Onboarding (steps)
1. Language (big buttons: العربية / English / हिन्दी) → persisted instantly.
2. "What you control" — 3 cards (Your goals, Your data, Your reminders) with Next.
3. Consent toggles (all default off except essential); each with one-line "why".
4. Behaviors (icons): Move · Sleep · Eat/Drink · Cut down smoking (multi-select, max 2).
5. Goal in your words (text or mic) → preview chips.
6. Your week (work pattern, Ramadan toggle, accessibility chips).
7. Plan preview → Crash-Test.

### 4.2 Today
```
┌──────────────────────────────────────────┐
│  Good evening, Fatima            [≡]     │
│  How's today?   ☹  😕  😐  🙂  😀        │
│  ───────────────────────────────────────│
│  Today looks heavy. Minimum is enough.   │
│  [Why?]                                  │
│                                          │
│  ┌ Short walk ─────────────────────────┐ │
│  │ After you wake up · 17:00–19:00     │ │
│  │ ( Min 2 min ) ( Std 10 min ) ( 20 ) │ │
│  │         [ Done — Minimum ✓ ]        │ │
│  └─────────────────────────────────────┘ │
│  ┌ Wind-down routine ──────────────────┐ │
│  │ ...                                 │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  Consistency  ◔ 71%   · 3 comebacks      │
│  [ Need a restart?  Minimum Viable Day ] │
└──────────────────────────────────────────┘
```
- Level picker is a segmented control; pre-selected level = suggestion; swipe/tap to change; "Done" button label reflects chosen level.
- No red states anywhere; at-risk uses a soft amber banner with supportive text.

### 4.3 Crash-Test
```
┌ Will this plan survive a bad week? ──────┐
│        Survivability  4 of 6             │
│        ●●●●○○                            │
│  ✓ Heatwave        ✓ Travel              │
│  ✓ Work crunch     ✓ Sick/caregiver      │
│  ✕ Night-shift week  — walk window blocked│
│  ✕ Ramadan         — meal timing         │
│                                          │
│  Fixes (tap to apply)                    │
│  [+] Move walk to 17:00–19:00   +2 ↗     │
│  [+] Add 2-minute stretch fallback       │
│  [ Re-run ]   [ How is this estimated? ] │
└──────────────────────────────────────────┘
```
- Shows scenario cards with icon, one-line reason, and predicted change after fix.
- "How is this estimated?" opens assumptions modal (simulated, not medical prediction).

### 4.4 Lapse Restart + Flight Recorder
```
Restart                          Flight Recorder
┌───────────────────────┐        ┌────────────────────────────────┐
│ Life happened.        │        │ Your last 7 days               │
│ Let's do just 2 min.  │        │ M T W T F S S  ■ ■ □ □ ■ □ □  │
│ [ Start 2-min ]       │        │ Chips: night shift, hot day    │
│ [ Not today ]         │        │ What got in the way?           │
│ [ Pause plan ]        │        │ (Time)(Energy)(Heat)(Shift)... │
└───────────────────────┘        │ [ Speak ]  [ Type ]            │
                                 │ ───────────────────────────────│
                                 │ Your recovery rule:            │
                                 │ "If I miss 2 days after a      │
                                 │  night shift, I'll do a        │
                                 │  2-min stretch on my first     │
                                 │  day off."                     │
                                 │ [ Use it ] [ Edit ] [ Skip ]   │
                                 └────────────────────────────────┘
```

### 4.5 Why this? Card
```
┌ Why you got this reminder ───────────────┐
│ Technique: Action planning (strong evid.)│
│ Deciding when and where you'll act makes │
│ it easier to follow through.             │
│ Limits: works best for simple actions.   │
│ Why now: you often walk after evening    │
│ reminders.                               │
│ [ Mute this type ] [ Fewer reminders ]   │
└──────────────────────────────────────────┘
```

### 4.6 Progress
- Consistency ring (28d) with text equivalent: "71% of eligible days, 2 grace days used".
- Comeback timeline: dots with "back in N days" labels.
- Trends (optional metrics) with table toggle for screen readers.

### 4.7 Rescue Link
- Anchor card: name, channel, status (verified/pending), last used date.
- "Ask for a hello" → confirm modal showing exact message that will be sent ("No health details are shared").

### 4.8 Settings → Data & Consent
- Per-source toggles with last-used timestamps, "What we use this for", "Turn off & delete from Rebound".
- Export (JSON/CSV) and Delete account sections with plain explanations.
- Audit log viewer (who/what/when).

### 4.9 Program Dashboard
- KPI row: persistence 6m, RHL median, resume-7d, retention.
- Equity panel: subgroup bars with CI whiskers; "gap = 4.0 pp (target ≤ 5)".
- Privacy badge: "k ≥ 20 · ε = 1.0 · individual data never shown".
- Suppressed cells shown as hatched with "n < 20".

### 4.10 Simulation Lab
- Controls: seed, N, disruption rates, parameter sliders (±30%), arms toggles.
- Output: persistence curves (B0–B3), RHL violin plots, equity gap bars; "SIMULATED" watermark; CSV/PNG export.

### 4.11 Governor Console (admin)
- Live feed of decisions with rule IDs, policy hash, example blocked messages; counts per rule.

## 5. Visual Design Tokens
**Palette (verify contrast with tooling):**
| Token | Value | Use |
|-------|-------|-----|
| `--bg` | #FAF7F2 | App background (sand) |
| `--surface` | #FFFFFF | Cards |
| `--ink` | #0F172A | Primary text |
| `--ink-muted` | #475569 | Secondary text |
| `--primary` | #0F766E | Primary actions (teal 700) |
| `--primary-ink` | #FFFFFF | Text on primary |
| `--accent` | #D97706 | Soft attention (amber 600), supportive banners |
| `--info` | #2563EB | Info / Minimum level highlight |
| `--success` | #15803D | Completed |
| `--danger` | #B91C1C | Destructive actions only (delete) — never for lapse |
| `--border` | #E2E8F0 | Dividers |
Dark theme: invert surfaces (`--bg` #0B1220, `--surface` #111827, `--ink` #E5E7EB) and recheck contrast.
**Level colors:** Min = info blue, Standard = primary teal, Stretch = deep indigo; all paired with icons and labels (never color alone).
**Typography:** Inter (Latin), Noto Sans Arabic (Arabic), Noto Sans Devanagari (Hindi). Base 16 px (low-literacy mode 18 px); line-height 1.5; headings 1.25× scale steps.
**Spacing/radius:** 4 px grid; radius 12 px cards, 999 px pills; min touch target 44×44 px (48 px in low-literacy mode).
**Elevation:** subtle shadows; borders preferred for clarity.
**Iconography:** lucide icons + custom illustrations (culturally neutral, modest depictions; configurable).

## 6. Components (shared library)
`CapacityFaces`, `LevelPicker`, `ActionCard`, `ConsistencyRing`, `ComebackTimeline`, `SurvivabilityGauge`, `ScenarioCard`, `PatchChip`, `WhyCard`, `RecorderTimeline`, `RuleCard`, `AnchorCard`, `ConsentToggleRow`, `PrivacyBadge`, `EquityBars`, `SimChart`, `Banner(supportive|info)`, `EmptyState`, `AudioButton`.
Each component: props typed, Storybook story, a11y checks, RTL snapshot.

## 7. Internationalization & RTL
- Locale routing `/[locale]/...`; `dir` set on `<html>`.
- Logical CSS only (`margin-inline`, `padding-inline`, `inset-inline`, `text-align: start`).
- Mirror: navigation order, progress direction, back/next chevrons; do **not** mirror: media icons, clocks, numerals, charts' time axis (stay left-to-right unless locale convention dictates; document decision per chart).
- Numerals: locale-based; allow user toggle for Arabic-Indic vs Western Arabic digits.
- Dates: Gregorian default; show Hijri secondary in Ramadan mode.
- Plurals/gender: ICU messages; avoid gendered phrasing where possible (use neutral constructions in AR/HI).
- Translation workflow: source strings EN → professional AR/HI review → in-context QA with native reviewers; never machine-only for shipped copy.

## 8. Accessibility (WCAG 2.2 AA)
- Contrast ≥ 4.5:1 text, ≥ 3:1 UI components; test both themes.
- Keyboard: full operability; visible focus (2 px ring); logical order; skip link.
- Screen readers: semantic HTML, ARIA only when needed, live regions for async results (Crash-Test), charts have text/table alternatives.
- Motion: respects `prefers-reduced-motion`; no auto-playing animation; confetti-free celebrations (soft check animation).
- Target size ≥ 24×24 CSS px minimum (we use 44+).
- Time limits: none; sessions extend on activity; forms preserve input.
- Cognitive: one primary action per screen, undo for logs, confirmation for destructive actions, plain-language errors with next step.
- Audio/Low-literacy mode: icon-first UI, tap-to-hear instructions, minimal text, WhatsApp-friendly deep links, large buttons.
- Adaptive content: wheelchair-friendly, seated, low-vision, hearing (captions/transcripts for audio).

## 9. Motion & Feedback
- Completion: 200 ms check draw + soft haptic (where supported); no sounds by default.
- Comeback: gentle ring pulse and text "You're back."
- Loading: skeletons; Crash-Test shows progress by scenario ("Testing heatwave…").

## 10. States
- **Empty:** helpful, one action ("Add your first goal").
- **Error:** what happened + what to do + retry; no jargon.
- **Offline:** banner "Saved on this phone — will sync"; actions queue.
- **At-risk:** amber banner "Today might be tough. Want the 2-minute version?"
- **Lapsed:** restart card replaces streak-like elements (there are none).

## 11. Content Safety UX
- Red-flag symptoms (e.g., chest pain, fainting, self-harm language) in any text input → compassionate stop screen: pause coaching, encourage contacting emergency/care services with locally appropriate numbers (configurable), offer to share summary with care team (with consent).
- Smoking cessation: plan copy encourages talking to a pharmacist/doctor about support; no dosing or product recommendations.
- Medical disclaimer in Settings > About; short, plain language.

## 12. Design QA Checklist
- [ ] AR layout reviewed by a native speaker (not just mirrored).
- [ ] Every adaptive element has a "Why".
- [ ] No red used for lapse/missed states.
- [ ] Minimum action visible without scrolling on a 360 px wide screen.
- [ ] All charts have text alternatives.
- [ ] Low-literacy mode complete for core loop (check-in → log).
