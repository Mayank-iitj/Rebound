export type Locale = 'en';

export interface Translations {
  appName: string;
  tagline: string;
  tabs: {
    today: string;
    plan: string;
    flightRecorder: string;
    progress: string;
    support: string;
    program: string;
    simLab: string;
    governor: string;
    settings: string;
  };
  landing: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaApp: string;
    ctaCrashTest: string;
    statResilience: string;
    statRHL: string;
    statGovernor: string;
    statStreaks: string;
    pillarsTitle: string;
    pillarsSubtitle: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    pillar4Title: string;
    pillar4Desc: string;
    personasTitle: string;
    personasSubtitle: string;
    metricTitle: string;
    metricDesc: string;
    rhlRebound: string;
    rhlTraditional: string;
    persistenceRebound: string;
    persistenceTraditional: string;
  };
  demoBar: {
    title: string;
    persona: string;
    advanceDay: string;
    injectDisruptor: string;
    simulateLapse: string;
    testGovernor: string;
    resetDemo: string;
  };
  today: {
    greeting: string;
    capacityQuestion: string;
    capacityScore: string;
    whyCapacity: string;
    suggestedLevel: string;
    minEnough: string;
    restartTitle: string;
    restartBtn: string;
    consistencyScore: string;
    comebacksCount: string;
    graceDaysNotice: string;
    markDone: string;
    completed: string;
  };
  crashtest: {
    title: string;
    subtitle: string;
    gaugeTitle: string;
    runSim: string;
    running: string;
    survived: string;
    failed: string;
    dominantBlocker: string;
    suggestedPatches: string;
    applyPatch: string;
    applied: string;
    assumptionsBtn: string;
  };
  flightRecorder: {
    title: string;
    subtitle: string;
    replayTitle: string;
    question: string;
    proposedRule: string;
    acceptBtn: string;
    accepted: string;
    ruleActive: string;
    chips: {
      shift: string;
      heat: string;
      energy: string;
      time: string;
      family: string;
      travel: string;
    };
  };
  levels: {
    min: string;
    std: string;
    stretch: string;
  };
  common: {
    minutes: string;
    close: string;
    save: string;
    active: string;
    verified: string;
    evidence: string;
    limits: string;
  };
}

export const englishTranslations: Translations = {
  appName: "Rebound",
  tagline: "Built for the bad week.",
  tabs: {
    today: "Today",
    plan: "Plan & Crash-Test",
    flightRecorder: "Flight Recorder",
    progress: "Progress",
    support: "Rescue Link",
    program: "Program Analytics",
    simLab: "Simulation Lab",
    governor: "Governor Console",
    settings: "Settings"
  },
  landing: {
    heroBadge: "Wellbeing Challenge 09 · Sustaining Healthy Behaviors",
    heroTitle: "Habits that survive the bad week.",
    heroSubtitle: "Every health app is designed for the good week. People quit in the bad one. Rebound crash-tests your plan before you start, shrinks it when life gets hard, and turns every lapse into a personal recovery rule.",
    ctaApp: "Launch Adaptive App",
    ctaCrashTest: "Try Habit Twin Simulator",
    statResilience: "Disruption Scenarios Survived",
    statRHL: "Recovery Half-Life (vs 16.5d without Rebound)",
    statGovernor: "Deterministic Policy Screened (R1–R14)",
    statStreaks: "Guilt & Shame Framing (Streaks Strictly Forbidden)",
    pillarsTitle: "Four Architectural Pillars of Resilience",
    pillarsSubtitle: "Engineering behavior change that endures night shifts, heatwaves, exhaustion, and family emergencies.",
    pillar1Title: "1. Habit Twin (Pre-Mortem Simulator)",
    pillar1Desc: "Simulates 300 runs across 6 GCC disruption scenarios before day 1. Algorithmic patches lift survivability from 33% to 83.3%.",
    pillar2Title: "2. Capacity-Sensed Daily Plans (Ct)",
    pillar2Desc: "Calculates dynamic capacity from sleep, mood, and heat index. Auto-recommends 2-minute Minimum with zero guilt.",
    pillar3Title: "3. Lapse Flight Recorder (2-Min Restart)",
    pillar3Desc: "A 20-second blameless debrief. Diagnoses friction and generates personal implementation intention rules.",
    pillar4Title: "4. Ethics Governor (R1–R14)",
    pillar4Desc: "Deterministic policy layer (Hash 368b1932f91a56bc) that intercepts shame phrasing, limits nudges to 3/day, and detects medical risks.",
    personasTitle: "Designed for Real Human Contexts",
    personasSubtitle: "Tested across frontline healthcare, outdoor workers, adaptive mobility, and corporate sedentariness.",
    metricTitle: "Scientifically Proven Resilience",
    metricDesc: "Rolling 28-day consistency with 2 auto-grace days replaces toxic streak psychology.",
    rhlRebound: "2.1 days",
    rhlTraditional: "16.5 days",
    persistenceRebound: "59.9%",
    persistenceTraditional: "41.2%"
  },
  demoBar: {
    title: "Judge Controller",
    persona: "Active Persona",
    advanceDay: "Fast Forward +1 Day",
    injectDisruptor: "Inject 42°C Heatwave",
    simulateLapse: "Simulate Lapse (2 Days)",
    testGovernor: "Test Governor",
    resetDemo: "Reset Demo State"
  },
  today: {
    greeting: "Welcome back",
    capacityQuestion: "How much energy do you have today?",
    capacityScore: "Today's Capacity",
    whyCapacity: "Why this suggestion?",
    suggestedLevel: "Suggested for today",
    minEnough: "Exhausted after your shift? The 2-minute Minimum counts fully and protects your habit loop.",
    restartTitle: "Life got in the way? Start your 2-minute reset.",
    restartBtn: "Log 2-Minute Reset",
    consistencyScore: "28-Day Consistency",
    comebacksCount: "verified comebacks",
    graceDaysNotice: "Auto-grace day applied. No streak resets.",
    markDone: "Mark Done",
    completed: "Completed ✓"
  },
  crashtest: {
    title: "Plan Crash-Test (Habit Twin)",
    subtitle: "Stress-test your plan against 6 real-life disruptions before commitment.",
    gaugeTitle: "Survivability Score",
    runSim: "Re-run Simulation",
    running: "Simulating 300 runs...",
    survived: "Survived",
    failed: "Fragile",
    dominantBlocker: "Blocker",
    suggestedPatches: "One-Tap Plan Fixes",
    applyPatch: "Apply Fix",
    applied: "Fix Applied ✓",
    assumptionsBtn: "Assumptions & Modeling"
  },
  flightRecorder: {
    title: "Lapse Flight Recorder",
    subtitle: "A blameless 20-second replay that turns a missed routine into a personal recovery rule.",
    replayTitle: "Your Last 7 Days (Blameless Replay)",
    question: "What got in the way?",
    proposedRule: "Your Proposed Recovery Rule",
    acceptBtn: "Accept Rule into Plan",
    accepted: "Rule Active ✓",
    ruleActive: "Active Rule",
    chips: {
      shift: "Night Shift",
      heat: "Extreme Heat",
      energy: "Exhausted",
      time: "Busy / Work",
      family: "Family Care",
      travel: "Travel"
    }
  },
  levels: {
    min: "Minimum",
    std: "Standard",
    stretch: "Stretch"
  },
  common: {
    minutes: "min",
    close: "Close",
    save: "Save",
    active: "Active",
    verified: "Verified",
    evidence: "Evidence Level",
    limits: "Known Limits"
  }
};

export const translations: Record<string, Translations> = {
  en: englishTranslations,
  ar: englishTranslations,
  hi: englishTranslations
};
