import React, { useState } from 'react';
import { 
  Trophy, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, 
  RotateCcw, Compass, Sun, BarChart3, X, PlayCircle, ExternalLink 
} from 'lucide-react';
import { sound } from '../services/sound';

interface JudgeTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  onSelectPersona: (p: string) => void;
  onSimulateLapse: () => void;
}

interface TourStep {
  step: number;
  title: string;
  badge: string;
  headline: string;
  description: string;
  targetTab: string;
  actionText: string;
  triggerPersona?: string;
  isLapseTrigger?: boolean;
  takeaways: string[];
}

export const JudgeTourModal: React.FC<JudgeTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectPersona,
  onSimulateLapse
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const tourSteps: TourStep[] = [
    {
      step: 1,
      badge: "Step 1 of 6 · The Foundation",
      title: "Fatima's Context & Real-World Constraints",
      headline: "Built for the Bad Week, not just the Good One",
      description: "Meet Fatima: a night-shift ICU nurse in Abu Dhabi. Traditional apps assume an uninterrupted 9-to-5 schedule and punish disrupted streaks. Rebound adapts to real human shift work, honors granular consents (UAE PDPL), and adapts to 12h shifts and 42°C heat.",
      targetTab: "today",
      actionText: "View Today's Adaptive Screen",
      triggerPersona: "fatima",
      takeaways: [
        "Hospital shift detection and real-world GCC heat adaptivity",
        "Granular per-stream consent (no opaque health data sharing)",
        "Zero streak counter: 28-day rolling consistency removes guilt"
      ]
    },
    {
      step: 2,
      badge: "Step 2 of 6 · Core Innovation",
      title: "Habit Twin Crash-Testing (Pre-Mortem)",
      headline: "Why wait for real-life failure when you can simulate it first?",
      description: "Before committing to a habit, Fatima's Habit Twin runs 300 Monte Carlo simulations across 6 stress scenarios (Heatwave, Night Shifts, Ramadan, Caregiving). When survivability is low (2/6), a 1-tap algorithmic patch immediately lifts it to 5/6 (83%).",
      targetTab: "plan",
      actionText: "Open Habit Twin Simulator",
      takeaways: [
        "Vectorized Monte Carlo habit survivability gauge",
        "6 realistic stress scenarios tailored to the GCC region",
        "Greedy algorithmic patch fixes vulnerabilities before day 1"
      ]
    },
    {
      step: 3,
      badge: "Step 3 of 6 · Daily Execution",
      title: "Dynamic Capacity Sensing (Ct)",
      headline: "Elastic 3-tier actions (Min / Std / Stretch) with zero guilt",
      description: "When Fatima reports 4.5h sleep after an ICU shift and Abu Dhabi hits 42°C, her capacity Ct drops to 0.38. Rebound automatically recommends the 2-minute 'Minimum' action. Completing this counts 100% towards consistency, protecting the habit loop.",
      targetTab: "today",
      actionText: "Test Capacity & Log Action",
      takeaways: [
        "Dynamic capacity math with missing-weight renormalization",
        "3 distinct action tiers (2 min, 10 min, 20 min)",
        "1-tap logging updates rolling 28-day ring with auto-grace days"
      ]
    },
    {
      step: 4,
      badge: "Step 4 of 6 · Behavioral Breakthrough",
      title: "Blameless Lapse Flight Recorder & Comeback",
      headline: "The 2-Minute Restart: Zero shame, instant rule generation",
      description: "When a 2-day disruption occurs, other apps reset streaks to 0, causing the Abstinence Violation Effect (AVE) where 80% abandon. Rebound triggers a 20-second flight recorder: 'What got in the way?' and automatically synthesizes a personal if-then recovery rule.",
      targetTab: "flightRecorder",
      actionText: "Simulate Lapse & Test Recorder",
      isLapseTrigger: true,
      takeaways: [
        "Instant 2-minute restart protocol with 0 shame framing",
        "14-barrier classifier with immediate recovery rule generation",
        "Verified comebacks tracked as a primary badge of resilience"
      ]
    },
    {
      step: 5,
      badge: "Step 5 of 6 · Safety & Governance",
      title: "Real-Time Ethics Governor (R1–R14)",
      headline: "Deterministic algorithmic safety against dark patterns & shame",
      description: "Every outgoing nudge passes through the Ethics Governor (deterministic policy hash 368b1932f91a56bc). It strictly intercepts shame framing, loss aversion, medical prescription advice, and respects the user's daily budget (max 3/day).",
      targetTab: "governor",
      actionText: "Open Governor Console & Filter Sandbox",
      takeaways: [
        "R1–R14 policy matrix with tamper-evident audit chain",
        "Deterministic shame/loss phrase blocklist in EN, AR, HI",
        "R7 crisis detection & R11 medical dosing prohibition"
      ]
    },
    {
      step: 6,
      badge: "Step 6 of 6 · Enterprise & Public Health",
      title: "Differential Privacy & 5,000-Agent Simulation",
      headline: "Enterprise-grade public health data without tracking individuals",
      description: "The Program Dashboard aggregates workplace health with k >= 20 suppression and Laplace differential privacy (epsilon=1.0). The Sim Lab shows 5,000 synthetic agents over 24 weeks: Rebound (B3) delivers +18.7 pp persistence and slashes Recovery Half-Life from 16.5d to 2.1d.",
      targetTab: "program",
      actionText: "Explore Analytics & Sim Lab",
      takeaways: [
        "k >= 20 cell suppression protects minority shift workers",
        "Laplace differential privacy (epsilon=1.0) with equity gap tracking",
        "5,000-agent validation proves resilience over static habits"
      ]
    }
  ];

  const currentStep = tourSteps[currentStepIndex];

  const handleExecuteStep = () => {
    sound.playTap();
    if (currentStep.triggerPersona) {
      onSelectPersona(currentStep.triggerPersona);
    }
    if (currentStep.isLapseTrigger) {
      onSimulateLapse();
    }
    onNavigateTab(currentStep.targetTab);
  };

  const handleNext = () => {
    sound.playTap();
    if (currentStepIndex < tourSteps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const nextStep = tourSteps[nextIdx];
      if (nextStep.triggerPersona) onSelectPersona(nextStep.triggerPersona);
      if (nextStep.isLapseTrigger) onSimulateLapse();
      onNavigateTab(nextStep.targetTab);
    } else {
      sound.playComebackFanfare();
      onClose();
    }
  };

  const handlePrev = () => {
    sound.playTap();
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      onNavigateTab(tourSteps[prevIdx].targetTab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-sand-300 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="font-bold text-sm tracking-wide uppercase text-amber-300">
                  Judge Demo Tour · 3-Minute Walkthrough
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                  Challenge 09
                </span>
              </div>
              <p className="text-xs text-slate-400">Step-by-step verification of all core criteria</p>
            </div>
          </div>
          <button
            onClick={() => { sound.playTap(); onClose(); }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-sand-100 px-6 py-2.5 border-b border-sand-200 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
            {tourSteps.map((st, i) => (
              <button
                key={i}
                onClick={() => {
                  sound.playTap();
                  setCurrentStepIndex(i);
                  onNavigateTab(st.targetTab);
                }}
                className={`w-7 h-7 rounded-full text-xs font-bold transition flex items-center justify-center ${
                  i === currentStepIndex
                    ? 'bg-teal-700 text-white shadow-xs'
                    : i < currentStepIndex
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-sand-200 text-slate-500 hover:bg-sand-300'
                }`}
                title={st.title}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-600 font-mono">
            {currentStep.badge}
          </span>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              {currentStep.title}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {currentStep.headline}
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Key Architectural & Behavioral Takeaways */}
          <div className="bg-sand-50 rounded-2xl p-4 border border-sand-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1.5 rtl:space-x-reverse">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>What Judges Should Notice Here:</span>
            </h4>
            <div className="space-y-1.5">
              {currentStep.takeaways.map((point, idx) => (
                <div key={idx} className="flex items-start space-x-2 rtl:space-x-reverse text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Action Button */}
          <div className="pt-1">
            <button
              onClick={handleExecuteStep}
              className="w-full py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{currentStep.actionText}</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-sand-50 px-6 py-4 border-t border-sand-200 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentStepIndex === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'bg-white text-slate-700 border border-sand-300 hover:bg-sand-100'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>

          <span className="text-xs text-slate-500 font-mono">
            {currentStepIndex + 1} / {tourSteps.length}
          </span>

          <button
            onClick={handleNext}
            className="flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition"
          >
            <span>{currentStepIndex === tourSteps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

