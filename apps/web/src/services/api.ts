const API_BASE = '/v1';

export async function fetchToday() {
  try {
    const res = await fetch(`${API_BASE}/today`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('API /today offline, using state');
  }
  return {
    day: new Date().toISOString().split('T')[0],
    state: "AT_RISK",
    capacity: {
      value: 0.38,
      inputs: ["self_report", "sleep_hours", "heat_index"],
      explanation: "You slept 4.5h and it's 42°C in Abu Dhabi, so we suggest the Minimum version today."
    },
    actions: [
      {
        plan_action_id: "act_fatima_walk",
        catalog_id: "mv_walk",
        title: { en: "Short walk", ar: "مشي خفيف", hi: "हल्की सैर" },
        suggested_level: "min",
        cue: { en: "After waking up", ar: "بعد الاستيقاظ من النوم" },
        window: "17:00–19:00",
        options: { min: 2, std: 10, stretch: 20 },
        completed: null
      },
      {
        plan_action_id: "act_fatima_winddown",
        catalog_id: "sl_wind_down",
        title: { en: "Wind-down routine", ar: "روتين الاسترخاء", hi: "सोने से पहले शांति" },
        suggested_level: "min",
        cue: { en: "Before day sleep", ar: "قبل النوم الصباحي" },
        window: "07:30–08:30",
        options: { min: 2, std: 10, stretch: 20 },
        completed: null
      }
    ],
    consistency_28d: {
      score: 0.74,
      eligible_days: 28,
      grace_days_used: 1,
      grace_days_left: 1
    },
    restart_available: true,
    nudge_budget: { used: 1, limit: 3 }
  };
}

export async function submitCheckin(moodFace: number, sleepHours: number, chips: string[]) {
  try {
    const res = await fetch(`${API_BASE}/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood_face: moodFace, sleep_hours: sleepHours, chips })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return {
    capacity: moodFace <= 2 ? 0.35 : 0.72,
    suggested_level: moodFace <= 2 ? "min" : "std",
    inputs: ["self_report", "sleep_hours", "heat_index"],
    explanation: moodFace <= 2 
      ? "Low energy detected. The 2-minute Minimum counts fully today."
      : "Good energy today! Standard level recommended."
  };
}

export async function logAction(planActionId: string, levelDone: string) {
  try {
    const res = await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_action_id: planActionId, level_done: levelDone })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "logged", plan_action_id: planActionId, level_done: levelDone };
}

export async function runCrashTest(planId: string = 'plan_fatima_1', nRuns: number = 300) {
  try {
    const res = await fetch(`${API_BASE}/plans/${planId}/crash-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n_runs: nRuns, seed: 42 })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return {
    survivability: { survived: 5, total: 6, score: 0.833 },
    scenarios: [
      { id: "night_shift_week", survived: true, survive_rate: 0.78, dominant_blocker: null, description: "Night-shift week with adapted evening window" },
      { id: "heatwave", survived: true, survive_rate: 0.85, dominant_blocker: null, description: "Summer heatwave with indoor gentle stretch fallback" },
      { id: "ramadan", survived: true, survive_rate: 0.82, dominant_blocker: null, description: "Ramadan fasting with post-iftar action scheduling" },
      { id: "travel", survived: true, survive_rate: 0.74, dominant_blocker: null, description: "In-room travel movement variant" },
      { id: "work_crunch", survived: true, survive_rate: 0.71, dominant_blocker: null, description: "1-minute micro-action applied during peak deadlines" },
      { id: "sick_caregiver", survived: false, survive_rate: 0.42, dominant_blocker: "family_care_priority", description: "Caregiving emergency requires temporary grace pause" }
    ],
    patches: [
      {
        id: "p_shift_window",
        type: "shift_window",
        title: "Move walk to 17:00–19:00",
        description: "Aligns with waking up after a night shift, preventing schedule collisions.",
        effort_cost: 0.4,
        new_survivability: 5
      },
      {
        id: "p_add_fallback",
        type: "add_fallback",
        title: "Add 2-minute indoor gentle stretch fallback",
        description: "Zero equipment indoor micro-action when heat or fatigue blocks normal routine.",
        effort_cost: 0.3,
        new_survivability: 6
      }
    ]
  };
}

export async function applyPatch(planId: string = 'plan_fatima_1', patchId: string) {
  try {
    const res = await fetch(`${API_BASE}/plans/${planId}/patches/${patchId}/apply`, {
      method: 'POST'
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { success: true, patch_id: patchId, new_score: 0.833 };
}

export async function answerFlightRecorder(lapseId: string, chip?: string, text?: string) {
  try {
    const res = await fetch(`${API_BASE}/recorder/${lapseId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chip, text })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return {
    barrier: { value: "SHIFT_WORK", confidence: 0.88 },
    proposed_rule: {
      text: "إذا فاتني يومان بعد تبديل المناوبة الليلية، سأقوم بـ إطالة لدقيقتين في أول يوم إجازة.",
      trigger: { context: "shift_swap", condition: "missed_days>=2" },
      action: { level: "min", catalog_id: "mv_stretch_2", when: "first_day_off" }
    },
    governor: { decision: "allow", rule_ids: [] }
  };
}

export async function acceptRule(ruleText: string, trigger: any, action: any) {
  try {
    const res = await fetch(`${API_BASE}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: ruleText, trigger, action })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { id: "rule_new", status: "active", text: ruleText };
}

export async function fetchProgress() {
  try {
    const res = await fetch(`${API_BASE}/progress`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return {
    consistency_28d: 0.74,
    total_comebacks: 3,
    median_recovery_half_life: 2.1,
    grace_days_used: 1,
    grace_days_left: 1,
    comebacks: [
      { id: "cb_1", days_ago: 12, days_to_return: 2, trigger: "shift_swap", level: "min" },
      { id: "cb_2", days_ago: 30, days_to_return: 2, trigger: "heatwave", level: "min" },
      { id: "cb_3", days_ago: 41, days_to_return: 3, trigger: "travel", level: "std" }
    ]
  };
}

export async function fetchProgramMetrics() {
  try {
    const res = await fetch(`${API_BASE}/program/coh_adq_workplace/metrics`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return {
    cohort_id: "coh_adq_workplace",
    series: [
      { metric: "persistence_6m", subgroup: "all", n_bucket: "250+", value: 0.44, suppressed: false },
      { metric: "persistence_6m", subgroup: "language:ar", n_bucket: "250+", value: 0.45, suppressed: false },
      { metric: "persistence_6m", subgroup: "language:en", n_bucket: "100-249", value: 0.43, suppressed: false },
      { metric: "persistence_6m", subgroup: "language:hi", n_bucket: "50-99", value: 0.42, suppressed: false },
      { metric: "persistence_6m", subgroup: "language:tl", n_bucket: "<20", value: null, suppressed: true },
      { metric: "rhl_median", subgroup: "all", n_bucket: "250+", value: 2.3, suppressed: false },
      { metric: "rhl_median", subgroup: "language:ar", n_bucket: "250+", value: 2.1, suppressed: false },
      { metric: "rhl_median", subgroup: "language:en", n_bucket: "100-249", value: 2.4, suppressed: false },
      { metric: "rhl_median", subgroup: "language:hi", n_bucket: "50-99", value: 2.5, suppressed: false },
      { metric: "rhl_median", subgroup: "language:tl", n_bucket: "<20", value: null, suppressed: true },
      { metric: "resume_7d", subgroup: "all", n_bucket: "250+", value: 0.68, suppressed: false }
    ],
    equity_gap: {
      abs_pp: 3.0,
      target_pp: 5.0,
      min_group_value: 0.42,
      max_group_value: 0.45,
      status: "within_target"
    },
    privacy: {
      k_min: 20,
      epsilon: 1.0,
      method: "Laplace differential privacy + k-anonymity suppression"
    }
  };
}

export async function fetchSimStudy(users: number = 5000, seed: number = 42, disruption: number = 1.0) {
  try {
    const res = await fetch(`${API_BASE}/sim/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n_users: users, seed, disruption_multiplier: disruption })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return {
    seed,
    n_users: users,
    watermark: "SIMULATED SYNTHETIC DATA — FOR DESIGN VALIDATION ONLY",
    curves: {
      weeks: [1, 4, 8, 12, 16, 20, 24],
      B0_Fixed: [0.85, 0.58, 0.38, 0.24, 0.16, 0.11, 0.08],
      B1_Reminders: [0.88, 0.64, 0.46, 0.32, 0.22, 0.16, 0.12],
      B2_ElasticOnly: [0.90, 0.77, 0.65, 0.55, 0.47, 0.41, 0.36],
      B3_ReboundFull: [0.94, 0.88, 0.82, 0.77, 0.72, 0.68, 0.64]
    },
    recovery_half_life: {
      B0_Fixed: 16.5,
      B1_Reminders: 12.0,
      B2_ElasticOnly: 5.2,
      B3_ReboundFull: 2.3
    },
    resume_within_7d: {
      B0_Fixed: 0.22,
      B1_Reminders: 0.31,
      B2_ElasticOnly: 0.52,
      B3_ReboundFull: 0.69
    },
    equity: {
      B0_Fixed: { gap_pp: 14.8, status: "severe_inequity" },
      B1_Reminders: { gap_pp: 11.2, status: "high_inequity" },
      B2_ElasticOnly: { gap_pp: 6.8, status: "moderate_gap" },
      B3_ReboundFull: { gap_pp: 3.4, status: "within_target_under_5pp" }
    },
    ablations: [
      { component: "Full Rebound (B3)", persistence_6m: 0.64, rhl_days: 2.3 },
      { component: "Without Crash-Test (no pre-commit test)", persistence_6m: 0.53, rhl_days: 3.5 },
      { component: "Without Flight Recorder (no recovery rules)", persistence_6m: 0.50, rhl_days: 4.4 },
      { component: "Without Elastic Levels (standard only)", persistence_6m: 0.42, rhl_days: 7.1 }
    ]
  };
}

export async function testGovernorMessage(message: string, tags: string[] = []) {
  try {
    const res = await fetch(`${API_BASE}/governor/test-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, tags })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  
  const lower = message.toLowerCase();
  if (lower.includes('fail') || lower.includes('streak') || lower.includes('lazy') || lower.includes('فشل')) {
    return {
      decision: "block",
      rule_ids: ["R1"],
      reason: "Blocked by R1: Message contains forbidden shaming or loss phrase.",
      policy_hash: "368b1932f91a56bc",
      policy_version: "1.0.0"
    };
  }
  return {
    decision: "allow",
    rule_ids: [],
    policy_hash: "368b1932f91a56bc",
    policy_version: "1.0.0"
  };
}

export async function switchPersona(personaId: string) {
  try {
    const res = await fetch(`${API_BASE}/demo/switch-persona/${personaId}`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { user_id: `usr_${personaId}_demo`, locale: personaId === 'rajesh' ? 'hi' : personaId === 'fatima' ? 'ar' : 'en' };
}

export async function simulateLapse() {
  try {
    const res = await fetch(`${API_BASE}/demo/simulate-lapse`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "lapse_simulated", state: "LAPSED", days_missed: 2 };
}

export async function fetchAbuDhabiWeather() {
  try {
    const res = await fetch(`${API_BASE}/integrations/weather/abu-dhabi`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return {
    city: "Abu Dhabi",
    country: "UAE",
    temperature_c: 39.4,
    apparent_temperature_c: 43.1,
    humidity_percent: 62,
    heat_advisory: "Extreme Heat Advisory — Capacity Auto-Adjusted",
    capacity_impact: -0.15,
    source: "Abu Dhabi Climate Sensor Baseline"
  };
}


