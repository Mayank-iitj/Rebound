# Rebound — Content Library (Seed Spec)

Version 1.0. All user-facing text requires native-speaker and clinical-advisor review before pilot. Arabic/Hindi samples below are drafts for review. BCT numbers follow the BCT Taxonomy v1 (Michie et al., 2013); verify against the source before publishing.

## 1. Behaviour Change Techniques (BCT) Table
| ID | BCT | Plain explanation (EN) | Evidence level | Limits shown to user |
|----|-----|------------------------|----------------|----------------------|
| bct_1_1 | Goal setting (behaviour) | Picking a specific, small goal gives you something clear to aim for. | Strong | Goals that are too big can feel heavy; we keep them small. |
| bct_1_2 | Problem solving | Thinking through what gets in the way helps you plan around it. | Strong | Works best when you can name the barrier. |
| bct_1_4 | Action planning | Deciding when and where you'll act makes it easier to follow through. | Strong | Works best for simple actions; less help when days are unpredictable. |
| bct_1_5 | Review behaviour goal(s) | A quick review lets you adjust goals to fit real life. | Moderate | Reviews should stay short and kind. |
| bct_2_2 | Feedback on behaviour | Seeing what you did helps you notice progress. | Moderate | Can feel judging if framed badly; we focus on comebacks. |
| bct_2_3 | Self-monitoring of behaviour | Tracking what you do makes patterns visible. | Strong | Tracking can feel like a chore; keep it to one tap. |
| bct_3_1 | Social support (unspecified) | A supportive person can make it easier to restart. | Moderate | Only with your permission; your friend sees no data. |
| bct_7_1 | Prompts/cues | A reminder at the right moment helps you remember. | Moderate | Too many reminders cause fatigue; you set the limit. |
| bct_8_3 | Habit formation | Doing a small action in the same situation builds a habit. | Moderate | Habits take weeks; missing days is normal. |
| bct_8_7 | Graded tasks | Starting small and building up keeps things doable. | Moderate | Progress may be uneven. |
| bct_10_1 | Material incentive (behaviour) | A small reward can help in the early weeks. | Emerging | Effects may fade when rewards stop; optional. |
| bct_13_5 | Identity associated with changed behaviour | Seeing yourself as someone who comes back supports persistence. | Emerging | Evidence is still growing. |
| bct_15_3 | Focus on past success | Remembering times you managed it builds confidence. | Moderate | Only use real past successes. |
| bct_11_2 | Reduce negative emotions | Calming steps help when stress blocks action. | Moderate | Not a replacement for professional support. |
| bct_12_1 | Restructuring the physical environment | Changing your surroundings makes the action easier. | Moderate | Not always possible at home or work. |

## 2. Action Catalog (seed ≥ 40; sample)
Each action defines Min/Std/Stretch, minutes, indoor/outdoor, equipment, accessibility tags. `*` = seated/wheelchair-friendly.

### Movement
| ID | Title | Min | Std | Stretch | Tags |
|----|-------|-----|-----|---------|------|
| mv_walk | Walk | 2-min walk indoors | 10-min walk | 20-min brisk walk | outdoor/indoor |
| mv_stretch_2 | Stretch | 2 gentle stretches | 5-min stretch routine | 10-min mobility routine | indoor, no_equipment, seated_ok* |
| mv_chair_moves* | Seated movement | 10 seated arm circles | 5-min seated routine | 10-min seated routine with band | seated_ok*, wheelchair_ok* |
| mv_stairs | Stairs | 1 flight | 3 flights | 6 flights | indoor |
| mv_dance | Dance to one song | Sway to 30 sec | 1 song | 3 songs | indoor |
| mv_strength_home | Bodyweight strength | 3 sit-to-stands | 2×8 moves | 3×12 moves | no_equipment |

### Sleep
| ID | Title | Min | Std | Stretch |
|----|-------|-----|-----|---------|
| sl_screen_down | Screens down | Dim screen 10 min before bed | Screens off 30 min before bed | Screens off 60 min + book |
| sl_wind_down | Wind-down | 3 slow breaths | 10-min wind-down routine | 20-min routine |
| sl_wake_anchor | Wake-time anchor | Same wake time today | Wake time ±30 min for week | Add morning light 10 min |
| sl_shift_nap | Pre-shift rest | 10-min rest | 20-min nap (not too late) | Full pre-shift plan |
| sl_caffeine_cutoff | Caffeine cutoff | Skip one late coffee | No caffeine 6 h before sleep | Cutoff + water swap |

### Nutrition / Hydration
| ID | Title | Min | Std | Stretch |
|----|-------|-----|-----|---------|
| nu_water | Water | 1 glass | 4 glasses spread across day | 8 glasses |
| nu_water_ramadan | Water (Ramadan) | 1 glass at iftar | 3 glasses between iftar and suhoor | 6 glasses |
| nu_veg | Add vegetables | 1 serving | 2 servings | 3+ servings |
| nu_swap_drink | Swap one sugary drink | Half-size | Swap once | Swap all sugary drinks |
| nu_meal_timing | Regular meal timing | Eat one meal at planned time | Two meals | All main meals |

### Smoking (reduction/cessation behaviors; no medication advice)
| ID | Title | Min | Std | Stretch |
|----|-------|-----|-----|---------|
| sm_delay | Delay a cigarette | Delay by 5 min | Delay by 15 min | Delay by 30 min |
| sm_trigger_swap | Swap a trigger routine | Swap one trigger | Swap morning trigger | Swap all main triggers |
| sm_craving_plan | Craving plan | Drink water + 10 breaths | 5-min walk | 10-min walk + call support person |
| sm_smokefree_zone | Smoke-free space | One smoke-free room/car | Home + car | Home + car + work breaks |
| sm_pharmacist_talk | Ask about support | Write a question for a pharmacist | Visit pharmacist/clinic | Book follow-up |

## 3. Message Templates (samples; tagged for Governor)
Tags: `supportive`, `neutral`, `planning`, `identity`, `social`, `restart`, `gain_framed`. Forbidden: `loss_frame`, `shame`.

| ID | Slot | Technique | EN | AR (draft) | Tags |
|----|------|-----------|----|-----------|------|
| t_m_plan_1 | morning | bct_1_4 | "Good morning. When will you do your {action} today? Pick a time that fits." | "صباح الخير. متى ستقوم بـ {action} اليوم؟ اختر وقتًا يناسبك." | planning, neutral |
| t_m_min_1 | morning | bct_8_7 | "Today can be small. {min_label} counts." | "اليوم يمكن أن يكون بسيطًا. {min_label} يُحسب أيضًا." | supportive, planning |
| t_p_cue_1 | pre_window | bct_7_1 | "Your window starts soon: {cue}. Ready for {min_label}?" | "اقترب وقتك: {cue}. هل أنت جاهز لـ {min_label}؟" | neutral |
| t_e_review_1 | evening | bct_2_3 | "How did today go? One tap is enough." | "كيف كان يومك؟ نقرة واحدة تكفي." | neutral, supportive |
| t_r_restart_1 | restart | bct_8_7 | "Life happens. Here's a 2-minute restart: {min_label}." | "الحياة تحدث. إليك بداية سريعة لدقيقتين: {min_label}." | supportive, restart |
| t_r_comeback_1 | restart | bct_13_5 | "You've come back {n} times. That's what builds lasting habits." | "لقد عدت {n} مرات. هذا ما يبني العادات الدائمة." | identity, supportive |
| t_e_success_1 | evening | bct_15_3 | "Last week you managed {example}. A smaller version today would still count." | "في الأسبوع الماضي نجحت في {example}. نسخة أصغر اليوم تُحسب أيضًا." | supportive |
| t_s_anchor_1 | restart | bct_3_1 | "Want to ask {anchor_name} for a quick hello? They won't see any health details." | "هل تريد أن تطلب من {anchor_name} تحية سريعة؟ لن يرى أي تفاصيل صحية." | social, supportive |
| t_m_heat_1 | morning | bct_12_1 | "It's very hot today. Try the indoor version: {indoor_label}." | "الجو حار جدًا اليوم. جرّب النسخة الداخلية: {indoor_label}." | supportive, neutral |
| t_m_ramadan_1 | pre_window | bct_1_4 | "After iftar is a good window for {action}. Want a gentle reminder at {time}?" | "بعد الإفطار وقت مناسب لـ {action}. هل تريد تذكيرًا لطيفًا في {time}؟" | planning, supportive |

Hindi drafts (review): "आज छोटा रखें। {min_label} भी गिना जाएगा।" · "जीवन में ऐसा होता है। 2 मिनट की छोटी शुरुआत: {min_label}।"

Template rules: ≤ 20 words; at most one action; includes always-available Minimum; no urgency words; reading-level checked (Flesch-Kincaid grade ≤ 6 for EN).

## 4. Scenario Library (YAML spec samples)
```yaml
version: 1.0
scenarios:
  - id: night_shift_week
    applies_if: {work_pattern: [night, rotating]}
    duration_days: 7
    capacity_multiplier: {mean: 0.6, sd: 0.1}
    blocked_windows: ["20:00-06:00"]
    cue_unavailable: ["after_wake_morning"]
    friction: {outdoor: 0.2}
  - id: ramadan
    applies_if: {ramadan_observing: true}
    duration_days: 14
    capacity_multiplier: {mean: 0.8, sd: 0.1}
    window_shift: {daytime_eating_actions: blocked, preferred: "after_iftar"}
    friction: {hydration_daytime: 1.0}
  - id: heatwave
    applies_if: {season: hot_or_outdoor_pattern: true}
    duration_days: 7
    capacity_multiplier: {mean: 0.85, sd: 0.05}
    blocked_windows: ["10:00-17:00"]
    friction: {outdoor: 1.0}
  - id: travel
    duration_days: 5
    capacity_multiplier: {mean: 0.7, sd: 0.1}
    cue_unavailable: ["home_based_cues"]
    friction: {equipment: 0.8}
  - id: sick_caregiver
    duration_days: 4
    capacity_multiplier: {mean: 0.3, sd: 0.1}
    friction: {all: 0.4}
  - id: work_crunch
    duration_days: 7
    time_budget_multiplier: 0.4
    capacity_multiplier: {mean: 0.75, sd: 0.1}
  - id: social_craving   # smoking only
    applies_if: {behavior: smoking}
    duration_days: 5
    trigger_multiplier: 2.0
```
Scenario updates require version bump and re-run of regression tests.

## 5. Barrier → Recovery Rule Templates
| Barrier | EN rule template |
|---------|-----------------|
| TIME | "If my day gets busy, I'll do {min_label} right after {anchor_cue}." |
| ENERGY | "If I'm very tired, I'll choose {min_label} and rest after." |
| SHIFT_WORK | "If I miss two days after a night shift, I'll do {min_label} on my first day off." |
| WEATHER_HEAT | "If it's very hot, I'll switch to {indoor_label} at {time}." |
| TRAVEL | "When I travel, I'll do {travel_label} at {cue}." |
| FAMILY_CARE | "If family needs me, I'll do {min_label} when they're settled." |
| PAIN_ILLNESS | "If I feel unwell, I'll pause and check in again when I feel better." (no exercise prescription; red-flag check first) |
| FORGOT | "I'll set a reminder at {time} and put {cue_object} where I can see it." |
| MOTIVATION | "If I don't feel like it, I'll start with just {tiny_label} and decide after." |
| ACCESS_FACILITIES_FOOD | "If the usual place is closed, I'll do {no_equipment_label}." |
| COST | "I'll use free options: {free_label}." |
| SOCIAL_PRESSURE | "If friends are around, I'll tell them my plan and ask for support, or do {discreet_label}." |

## 6. Lexicons (maintain in repo; reviewed by native speakers)
- **Forbidden (shame/loss/pressure):** fail, failure, lazy, weak, guilt, ashamed, behind, ruined, broke your, lost your, last chance, don't give up, you must, hurry, only N left (EN); Arabic/Hindi equivalents curated by reviewers.
- **Red-flag (R7):** chest pain, can't breathe, fainted, faint, severe pain, bleeding, suicidal, kill myself, self-harm, overdose, abuse, unsafe at home; plus locale variants and common misspellings. On match: stop coaching, show care/emergency guidance, offer to contact care team (with consent).
- **Medication/dosing detector:** drug names + dose/unit patterns → block any generated text.

## 7. Content Governance
- Every content item has: owner, reviewer, locale reviewers, last review date, version.
- Review cadence: quarterly; immediate on incident.
- A/B testing allowed only for templates passing Governor and reviewed by ethics reviewer.
- Content changelog published in Settings > About.
