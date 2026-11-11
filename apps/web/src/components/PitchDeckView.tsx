import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Play, Presentation, CheckCircle2, 
  Sparkles, ShieldAlert, Cpu, Heart, BarChart3, FlaskConical, FileText,
  Activity, ArrowUpRight, Award, Compass, Sun, Eye, EyeOff, RotateCcw
} from 'lucide-react';
import { sound } from '../services/sound';

interface PitchDeckViewProps {
  onNavigateTab: (tabId: string) => void;
  onSelectPersona?: (personaId: string) => void;
}

interface Slide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  speakerNotes: string;
  jumpTab?: string;
  jumpLabel?: string;
}

export const PitchDeckView: React.FC<PitchDeckViewProps> = ({ onNavigateTab, onSelectPersona }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex]);

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      sound.playTap();
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      sound.playTap();
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const slides: Slide[] = [
    // Slide 1
    {
      id: 1,
      badge: "Hackathon Challenge 09 · Executive Presentation",
      title: "Rebound",
      subtitle: "The Resilience Platform for Healthy Habits Built for the Bad Week",
      jumpTab: "today",
      jumpLabel: "Open Live Application",
      speakerNotes: "Welcome judges. Rebound re-architects behavior change for the real world. Every habit app works on the good week; Rebound is engineered to keep users going on the bad week.",
      content: (
        <div className="space-y-6 text-center max-w-2xl mx-auto py-8">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Wellbeing Challenge 09: Sustaining Healthy Behaviors</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Habits that survive shift work, heatwaves, and exhausted days.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Eliminating streak shame with dynamic capacity sensing, Monte Carlo pre-mortem crash testing, and blameless 20-second recovery loops.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4 text-left">
            <div className="bg-sand-50 p-4 rounded-2xl border border-sand-200">
              <span className="text-2xl font-black text-teal-700">+18.7 pp</span>
              <p className="text-xs text-slate-600 font-medium mt-1">24-Week Persistence Lift over standard app baseline</p>
            </div>
            <div className="bg-sand-50 p-4 rounded-2xl border border-sand-200">
              <span className="text-2xl font-black text-emerald-700">2.1 Days</span>
              <p className="text-xs text-slate-600 font-medium mt-1">Recovery Half-Life (vs 16.5d without Rebound)</p>
            </div>
            <div className="bg-sand-50 p-4 rounded-2xl border border-sand-200">
              <span className="text-2xl font-black text-amber-700">0 Streaks</span>
              <p className="text-xs text-slate-600 font-medium mt-1">Strictly blameless 28-day rolling consistency</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2
    {
      id: 2,
      badge: "The Problem Space",
      title: "The 'Bad Week' Drop-Off Trap",
      subtitle: "Why 80% of healthy habits collapse within 30 days",
      jumpTab: "today",
      jumpLabel: "See Elastic Solution",
      speakerNotes: "The fitness and wellness app market is flooded with streak-based trackers. But streak counters create the Abstinence Violation Effect (AVE): miss one day, feel like a failure, uninstall.",
      content: (
        <div className="grid sm:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Current habit apps are designed for ideal conditions.</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              When a user faces a 12-hour hospital night shift, a 42°C Abu Dhabi heatwave, illness, or Ramadan fasting, rigid goals break:
            </p>
            <div className="space-y-2">
              <div className="flex items-start space-x-2 text-xs text-rose-800 bg-rose-50 p-3 rounded-xl border border-rose-200">
                <span className="font-bold text-base leading-none">✕</span>
                <span><strong>Streak Fragility:</strong> Miss 1 day $\to$ counter resets to zero. Cognitive collapse ensues.</span>
              </div>
              <div className="flex items-start space-x-2 text-xs text-rose-800 bg-rose-50 p-3 rounded-xl border border-rose-200">
                <span className="font-bold text-base leading-none">✕</span>
                <span><strong>Toxic Guilt Framing:</strong> 'You missed your goal!' 'Don't break the chain!' promotes churn.</span>
              </div>
              <div className="flex items-start space-x-2 text-xs text-rose-800 bg-rose-50 p-3 rounded-xl border border-rose-200">
                <span className="font-bold text-base leading-none">✕</span>
                <span><strong>All-or-Nothing Rigidity:</strong> Demanding 10,000 steps on 4 hours of sleep is clinically unsafe.</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 border border-slate-800">
            <span className="text-xs uppercase tracking-wider text-rose-400 font-mono font-bold">The Abstinence Violation Effect</span>
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-center">
              <div className="text-3xl font-black text-rose-400">80% Drop-off</div>
              <div className="text-xs text-slate-300 mt-1">Occurs on the very first multi-day lapse</div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "When people perceive a lapse as total failure rather than an expected disruption, they abandon the behavior entirely." — Marlatt & Gordon, Relapse Prevention
            </p>
          </div>
        </div>
      )
    },

    // Slide 3
    {
      id: 3,
      badge: "The Behavioral Insight",
      title: "Resilience Beats Rigidity",
      subtitle: "Elasticity is the missing link in long-term habit formation",
      speakerNotes: "The scientific breakthrough of Rebound is elastic adaptation. Lowering the bar during an emergency doesn't kill the habit; it protects the neural cue-routine loop.",
      content: (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-sand-50 p-5 rounded-2xl border border-sand-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">1</div>
              <h4 className="font-bold text-slate-900 text-sm">Elastic Scaling</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every action has 3 calibrated tiers: Minimum (2m), Standard (10m), Stretch (20m). Minimum counts 100% on low-capacity days.
              </p>
            </div>
            <div className="bg-sand-50 p-5 rounded-2xl border border-sand-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">2</div>
              <h4 className="font-bold text-slate-900 text-sm">Pre-Mortem Testing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simulating life disruptions before committing lets users discover failure points and install algorithmic patches proactively.
              </p>
            </div>
            <div className="bg-sand-50 p-5 rounded-2xl border border-sand-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">3</div>
              <h4 className="font-bold text-slate-900 text-sm">Blameless Attribution</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Classifying friction into external barriers (shift work, family care) transforms failure into personal if-then implementation rules.
              </p>
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl text-xs text-teal-900 flex items-center space-x-3 rtl:space-x-reverse">
            <CheckCircle2 className="w-6 h-6 text-teal-700 shrink-0" />
            <span>
              <strong>Scientific Foundation:</strong> Operationalizes BCT 1.2 (Problem Solving), BCT 1.4 (Action Planning), and BCT 8.7 (Behavioral Graded Tasks) from Michie's Behavior Change Technique Taxonomy v1.
            </span>
          </div>
        </div>
      )
    },

    // Slide 4
    {
      id: 4,
      badge: "Solution Architecture",
      title: "The 4 Core Pillars of Rebound",
      subtitle: "A fully integrated, closed-loop resilience system",
      jumpTab: "plan",
      jumpLabel: "Try Habit Twin",
      speakerNotes: "Here are the four pillars of Rebound: Habit Twin, Elastic Plans, Lapse Flight Recorder, and the Ethics Governor.",
      content: (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200 space-y-2">
            <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm">
              <Cpu className="w-4 h-4 text-teal-600" />
              <span>1. Habit Twin Simulator</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monte Carlo pre-mortem stress testing across 6 disruption scenarios (Night Shifts, Heatwave, Ramadan, Sickness). Greedy auto-patching before day 1.
            </p>
          </div>
          <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200 space-y-2">
            <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm">
              <Sun className="w-4 h-4 text-teal-600" />
              <span>2. Capacity-Sensed Daily Plans</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dynamic capacity formula $C_t$ renormalizes missing weights. Auto-recommends Minimum (2m) without human willpower friction when tired or hot.
            </p>
          </div>
          <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200 space-y-2">
            <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm">
              <RotateCcw className="w-4 h-4 text-teal-600" />
              <span>3. Lapse Flight Recorder</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              20-second blameless reflection. Classifies 14 friction barriers $\to$ creates concrete If-Then recovery rules with 1 tap. Celebrates verified comebacks.
            </p>
          </div>
          <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200 space-y-2">
            <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-teal-600" />
              <span>4. Real-Time Ethics Governor</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deterministic policy hash (368b1932f91a56bc) executing Rules R1–R14. Blocks shame phrasing, limits nudges to 3/day, and detects medical risks.
            </p>
          </div>
        </div>
      )
    },

    // Slide 5
    {
      id: 5,
      badge: "Engineered Reality",
      title: "Pillar 1: Habit Twin Pre-Mortem Simulator",
      subtitle: "Vectorized Monte Carlo crash-testing with instant algorithmic patches",
      jumpTab: "plan",
      jumpLabel: "Open Habit Twin",
      speakerNotes: "Let's dive into Pillar 1. Users test their plan against 6 stress scenarios. In Fatima's case, high survivability is attained through indoor seated micro-movement patches.",
      content: (
        <div className="space-y-4">
          <div className="bg-sand-50 p-4 rounded-2xl border border-sand-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Pre-Mortem Survivability Gauge</span>
              <div className="text-2xl font-black text-teal-800 mt-0.5">5 of 6 Scenarios Survived (83.3%)</div>
              <p className="text-xs text-slate-500 mt-1">Lifted from 2/6 (33%) with 1-Tap Indoor & Shift Window Patches</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono bg-teal-100 text-teal-800 px-2 py-1 rounded-md font-bold">N=300 Runs</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
              <span className="font-bold text-emerald-900 block">Night-Shift Week</span>
              <span className="text-emerald-700">78% survived · Post-shift evening cue</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
              <span className="font-bold text-emerald-900 block">Summer Heatwave</span>
              <span className="text-emerald-700">85% survived · AC indoor hallway route</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
              <span className="font-bold text-emerald-900 block">Ramadan Fasting</span>
              <span className="text-emerald-700">82% survived · Post-iftar hydration window</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">
            *Algorithmic patch search uses greedy optimization to identify the single action modification that maximizes survivability across all 6 scenarios simultaneously.
          </p>
        </div>
      )
    },

    // Slide 6
    {
      id: 6,
      badge: "Adaptive Intelligence",
      title: "Pillar 2: Capacity Sensing & MRT Nudges",
      subtitle: "Beta-Bernoulli Thompson sampling bandit with deterministic missing-weight math",
      jumpTab: "today",
      jumpLabel: "Inspect Today's Ct",
      speakerNotes: "The daily plan senses capacity Ct dynamically. When data streams are absent, weights automatically renormalize. MRT micro-randomization selects the optimal BCT arm without nagging.",
      content: (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-2xl font-mono text-xs space-y-3">
            <div className="text-teal-400 font-bold text-sm">Deterministic Capacity Formula (ADR-004):</div>
            <div className="p-3 bg-slate-800 rounded-lg text-amber-200 overflow-x-auto">
              C_t = (w_self · s + w_sleep · f(sleep) + w_heat · g(heat)) / sum(w_active)
            </div>
            <p className="text-slate-400 font-sans text-xs">
              When workload or weather data is unavailable, Rebound renormalizes the denominator so missing sensors never bias capacity downward.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-sand-50 rounded-xl border border-sand-200">
              <span className="font-bold text-slate-800 block">MRT Micro-Randomization</span>
              <p className="text-slate-600 mt-1">Nudges triggered with probability $\pi \le 0.4$, respecting strict daily budget (max 3/day) to prevent alert fatigue.</p>
            </div>
            <div className="p-3 bg-sand-50 rounded-xl border border-sand-200">
              <span className="font-bold text-slate-800 block">Beta-Bernoulli Thompson Sampling</span>
              <p className="text-slate-600 mt-1">Learns which BCT technique (e.g. Identity vs Implementation Intention) drives engagement for each user persona.</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 7
    {
      id: 7,
      badge: "Behavioral Breakthrough",
      title: "Pillar 3: Blameless Lapse Flight Recorder",
      subtitle: "Turning the bad week into permanent resilience assets",
      jumpTab: "flightRecorder",
      jumpLabel: "Open Flight Recorder",
      speakerNotes: "When a lapse occurs, traditional apps display red broken streak badges. Rebound opens a 20-second flight recorder: 'What got in the way?' and converts the barrier into an if-then rule.",
      content: (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-sand-50 p-4 rounded-2xl border border-sand-200 space-y-2">
              <span className="text-xs font-bold text-teal-700 uppercase">20-Second Flight Recorder</span>
              <h4 className="font-bold text-slate-900 text-sm">14-Barrier Diagnostic</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Categorizes root friction (e.g., Hospital Double Shift, Joint Pain, Heat Index, Family Emergency). Never attributes failure to weak willpower or lack of discipline.
              </p>
            </div>
            <div className="bg-sand-50 p-4 rounded-2xl border border-sand-200 space-y-2">
              <span className="text-xs font-bold text-teal-700 uppercase">If-Then Rule Generator</span>
              <h4 className="font-bold text-slate-900 text-sm">Algorithmic Recovery Rules</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatically synthesizes an active implementation intention: <em>"If double shift, then do 2m seated ankle pumps before sleep."</em> Accepted with 1 tap.
              </p>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <span className="font-semibold">Fatima's Verified Comebacks: 2 Recorded</span>
            <span className="font-bold text-emerald-700 font-mono">Recovery Time: 1.8 Days</span>
          </div>
        </div>
      )
    },

    // Slide 8
    {
      id: 8,
      badge: "Safety & Governance",
      title: "Pillar 4: Real-Time Ethics Governor (R1–R14)",
      subtitle: "Hard algorithmic boundary preventing dark patterns and shame",
      jumpTab: "governor",
      jumpLabel: "Test Governor Sandbox",
      speakerNotes: "The Ethics Governor is a standalone policy evaluation layer with a deterministic cryptographic policy hash. It protects users from toxic habit psychology.",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 text-white p-3 rounded-xl font-mono text-xs">
            <span>Deterministic Policy Hash: <strong className="text-teal-400">368b1932f91a56bc</strong></span>
            <span className="text-slate-400">Policy v1.0.0</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 bg-sand-50 rounded-xl border border-sand-200">
              <span className="font-bold text-rose-700 block">R1: Shame Block</span>
              <p className="text-slate-600 text-[11px] mt-0.5">Strictly blocks 'fail', 'streak loss', 'lazy' in EN/AR/HI.</p>
            </div>
            <div className="p-2.5 bg-sand-50 rounded-xl border border-sand-200">
              <span className="font-bold text-rose-700 block">R3: Daily Budget</span>
              <p className="text-slate-600 text-[11px] mt-0.5">Hard cap of 3 nudges/day across all channels.</p>
            </div>
            <div className="p-2.5 bg-sand-50 rounded-xl border border-sand-200">
              <span className="font-bold text-rose-700 block">R7: Crisis Safety</span>
              <p className="text-slate-600 text-[11px] mt-0.5">Detects red flags $\to$ immediate crisis helpline redirect.</p>
            </div>
            <div className="p-2.5 bg-sand-50 rounded-xl border border-sand-200">
              <span className="font-bold text-rose-700 block">R8: Dark Patterns</span>
              <p className="text-slate-600 text-[11px] mt-0.5">Forbids artificial urgency ('Only 1 hour left!').</p>
            </div>
            <div className="p-2.5 bg-sand-50 rounded-xl border border-sand-200">
              <span className="font-bold text-rose-700 block">R11: Medical Boundaries</span>
              <p className="text-slate-600 text-[11px] mt-0.5">Prohibits drug dosage or diagnostic claims.</p>
            </div>
            <div className="p-2.5 bg-sand-50 rounded-xl border border-sand-200">
              <span className="font-bold text-rose-700 block">R14: Rescue Link</span>
              <p className="text-slate-600 text-[11px] mt-0.5">Anchor ping guarantees 0 health data leakage.</p>
            </div>
          </div>
        </div>
      )
    },

    // Slide 9
    {
      id: 9,
      badge: "Scientific Rigor",
      title: "Novel Metrics: 28-Day Rolling & Recovery Half-Life",
      subtitle: "Why streak counters are obsolete and harmful",
      jumpTab: "progress",
      jumpLabel: "View Consistency Ring",
      speakerNotes: "Rebound introduces two scientifically grounded metrics: Rolling 28-Day Consistency with auto-grace exclusions, and Recovery Half-Life (RHL).",
      content: (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200 space-y-3">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">Metric 1: Rolling 28-Day Consistency</span>
            <div className="text-3xl font-black text-slate-900">74% Consistent</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculated as completed days divided by eligible non-grace days over the rolling 28-day window. Includes up to 2 auto-grace days per month for sick or travel events without penalty.
            </p>
          </div>
          <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200 space-y-3">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">Metric 2: Recovery Half-Life (RHL)</span>
            <div className="text-3xl font-black text-teal-700">2.1 Days</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The median days required to resume regular action following a multi-day lapse. While industry standards average 16.5 days of disengagement, Rebound users return in 2.1 days.
            </p>
          </div>
        </div>
      )
    },

    // Slide 10
    {
      id: 10,
      badge: "Validation & Evidence",
      title: "5,000-Agent Synthetic Simulation Study",
      subtitle: "24-week longitudinal comparison across 4 design variants",
      jumpTab: "simLab",
      jumpLabel: "Inspect Sim Lab",
      speakerNotes: "To validate Rebound at scale, we conducted a 5,000-agent synthetic cohort simulation comparing static apps (B0), elastic plans alone (B1), elastic + flight recorder (B2), and full Rebound (B3).",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 bg-sand-50 rounded-xl border border-sand-200">
              <span className="text-slate-500 font-mono block">B0: Static</span>
              <span className="text-lg font-bold text-slate-700">41.2%</span>
              <span className="text-[10px] text-slate-500 block">24w Persistence</span>
            </div>
            <div className="p-3 bg-sand-50 rounded-xl border border-sand-200">
              <span className="text-slate-500 font-mono block">B1: Elastic</span>
              <span className="text-lg font-bold text-slate-700">49.8%</span>
              <span className="text-[10px] text-slate-500 block">+8.6 pp</span>
            </div>
            <div className="p-3 bg-sand-50 rounded-xl border border-sand-200">
              <span className="text-slate-500 font-mono block">B2: +Recorder</span>
              <span className="text-lg font-bold text-slate-700">55.1%</span>
              <span className="text-[10px] text-slate-500 block">+13.9 pp</span>
            </div>
            <div className="p-3 bg-teal-50 rounded-xl border border-teal-300">
              <span className="text-teal-800 font-mono font-bold block">B3: Rebound</span>
              <span className="text-lg font-bold text-teal-800">59.9%</span>
              <span className="text-[10px] text-teal-700 font-bold block">+18.7 pp Lift</span>
            </div>
          </div>
          <div className="p-3 bg-sand-50 rounded-xl border border-sand-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Equity Gap between Shift Workers and Standard Workers:</span>
            <span className="font-bold text-emerald-700 font-mono">Narrowed from 14.2 pp $\to$ 3.0 pp</span>
          </div>
          <p className="text-[10px] text-slate-400 text-center font-mono uppercase">
            SIMULATED SYNTHETIC DATA — FOR DESIGN & POLICY VALIDATION ONLY
          </p>
        </div>
      )
    },

    // Slide 11
    {
      id: 11,
      badge: "Enterprise & Governance",
      title: "Privacy, Compliance & Abu Dhabi Pilot Ready",
      subtitle: "Differential privacy, UAE PDPL, and ADHICS alignment",
      jumpTab: "program",
      jumpLabel: "Open Program Dashboard",
      speakerNotes: "Rebound was built from day one for enterprise and public health pilots in Abu Dhabi. Aggregate metrics feature differential privacy and k-anonymity.",
      content: (
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-sand-50 p-4 rounded-2xl border border-sand-200 space-y-2">
            <span className="font-bold text-teal-800 text-sm block">Differential Privacy ($k \ge 20, \epsilon=1.0$)</span>
            <p className="text-slate-600 leading-relaxed">
              Program dashboards automatically suppress cohorts under 20 individuals, ensuring shift workers or minority roles can never be re-identified. Laplace noise protects aggregated stats.
            </p>
          </div>
          <div className="bg-sand-50 p-4 rounded-2xl border border-sand-200 space-y-2">
            <span className="font-bold text-teal-800 text-sm block">UAE PDPL & ADHICS Compliance</span>
            <p className="text-slate-600 leading-relaxed">
              Local data residency ready. Granular consent switches per telemetry source (health data, calendar, location) and complete single-click cryptographic data erasure.
            </p>
          </div>
          <div className="bg-sand-50 p-4 rounded-2xl border border-sand-200 space-y-2">
            <span className="font-bold text-teal-800 text-sm block">Multilingual RTL & Low-Literacy</span>
            <p className="text-slate-600 leading-relaxed">
              Genuine Arabic RTL design, Hindi support, and Web Speech API audio narration for outdoor and frontline workers (Rajesh persona).
            </p>
          </div>
          <div className="bg-sand-50 p-4 rounded-2xl border border-sand-200 space-y-2">
            <span className="font-bold text-teal-800 text-sm block">Rescue Link (Zero Health Leak)</span>
            <p className="text-slate-600 leading-relaxed">
              User can request a personal checkin from their chosen Anchor. The Anchor receives only: "Fatima asked for a hello today", with zero health or adherence data exposed.
            </p>
          </div>
        </div>
      )
    },

    // Slide 12
    {
      id: 12,
      badge: "The Ask & Roadmap",
      title: "Next Steps: 6-Month Pilot Deployment",
      subtitle: "Ready for institutional deployment with Abu Dhabi healthcare partners",
      jumpTab: "today",
      jumpLabel: "Explore Full App",
      speakerNotes: "Thank you judges. Rebound is fully built, tested, and validated. We are asking for pilot deployment support with Abu Dhabi healthcare and frontline organizations.",
      content: (
        <div className="space-y-6 max-w-xl mx-auto text-center py-4">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-teal-700">The Pilot Proposal</span>
            <h3 className="text-2xl font-black text-slate-900">120-Day Frontline Healthcare Pilot</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deploying Rebound with 250 ICU nurses and shift workers across Abu Dhabi health networks to measure Recovery Half-Life and sustained physical activity.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-left">
            <div className="bg-sand-50 p-3 rounded-xl border border-sand-200">
              <span className="font-bold text-teal-800 text-xs block">Month 1–2</span>
              <span className="text-[11px] text-slate-600">Cohort onboarding & wearable telemetry pairing</span>
            </div>
            <div className="bg-sand-50 p-3 rounded-xl border border-sand-200">
              <span className="font-bold text-teal-800 text-xs block">Month 3–4</span>
              <span className="text-[11px] text-slate-600">Disruption event monitoring & flight recorder evaluation</span>
            </div>
            <div className="bg-sand-50 p-3 rounded-xl border border-sand-200">
              <span className="font-bold text-teal-800 text-xs block">Month 5–6</span>
              <span className="text-[11px] text-slate-600">Longitudinal persistence & health outcome reporting</span>
            </div>
          </div>
          <div className="p-4 bg-teal-700 text-white rounded-2xl shadow-sm text-sm font-semibold flex items-center justify-between">
            <span>Ready for evaluation across all Challenge 09 criteria</span>
            <Award className="w-5 h-5 text-amber-300 shrink-0" />
          </div>
        </div>
      )
    }
  ];

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="space-y-4">
      {/* Deck Controls Top Bar */}
      <div className="bg-white rounded-2xl p-4 border border-sand-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Presentation className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Interactive Hackathon Pitch Deck</h2>
            <p className="text-xs text-slate-500">12 Slides · Keyboard Arrow Navigation Supported</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* Speaker Notes Toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              showNotes ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-white text-slate-700 border-sand-300 hover:bg-sand-50'
            }`}
          >
            {showNotes ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
            <span>{showNotes ? 'Hide Speaker Notes' : 'Show Speaker Notes'}</span>
          </button>

          {/* Jump to Live Feature button */}
          {currentSlide.jumpTab && (
            <button
              onClick={() => {
                sound.playTap();
                onNavigateTab(currentSlide.jumpTab!);
              }}
              className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition"
            >
              <span>{currentSlide.jumpLabel || 'Jump to Feature'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-sand-200 shadow-sm min-h-[500px] flex flex-col justify-between">
        
        {/* Slide Header */}
        <div className="border-b border-sand-100 pb-4 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-mono font-bold text-teal-700 uppercase tracking-wider">{currentSlide.badge}</span>
            <span className="font-mono bg-sand-100 px-2.5 py-1 rounded-full font-bold text-slate-700">
              Slide {currentSlide.id} of {slides.length}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{currentSlide.title}</h1>
          <p className="text-sm text-slate-500 mt-1">{currentSlide.subtitle}</p>
        </div>

        {/* Slide Interactive Body */}
        <div className="flex-1 flex flex-col justify-center">
          {currentSlide.content}
        </div>

        {/* Presenter Speaker Notes Drawer */}
        {showNotes && (
          <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 animate-in fade-in duration-150">
            <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 block mb-1">
              🎙️ Presenter Script & Talking Points:
            </span>
            <p className="leading-relaxed font-sans">{currentSlide.speakerNotes}</p>
          </div>
        )}

        {/* Slide Footer Navigation */}
        <div className="mt-8 pt-4 border-t border-sand-100 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className={`flex items-center space-x-1 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold border transition ${
              currentSlideIndex === 0
                ? 'opacity-30 cursor-not-allowed border-sand-200 text-slate-400'
                : 'bg-white text-slate-700 border-sand-300 hover:bg-sand-50 shadow-2xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Slide Dots */}
          <div className="hidden sm:flex items-center space-x-1.5 rtl:space-x-reverse">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  sound.playTap();
                  setCurrentSlideIndex(idx);
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlideIndex
                    ? 'w-6 bg-teal-700'
                    : 'w-2 bg-sand-300 hover:bg-sand-400'
                }`}
                title={`Jump to slide ${s.id}: ${s.title}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentSlideIndex === slides.length - 1}
            className={`flex items-center space-x-1 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold border transition ${
              currentSlideIndex === slides.length - 1
                ? 'opacity-30 cursor-not-allowed border-sand-200 text-slate-400'
                : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

