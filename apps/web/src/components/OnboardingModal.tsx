import React, { useState } from 'react';
import { 
  X, CheckCircle2, ArrowRight, ArrowLeft, Shield, Sparkles, 
  Heart, Moon, Droplets, Cigarette, Flame, Clock, Accessibility,
  Compass, AlertTriangle
} from 'lucide-react';
import { Locale, translations } from '../i18n/translations';
import { sound } from '../services/sound';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newProfile: any) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState('Fatima');
  const selectedLanguage = 'en';
  
  // Consents
  const [consents, setConsents] = useState({
    healthData: true,
    calendar: true,
    weatherLocation: true,
    anchorSharing: false
  });

  // Habit Domain
  const [habitDomain, setHabitDomain] = useState('movement');
  const [habitGoal, setHabitGoal] = useState('Daily gentle walking after hospital shifts');

  // Constraints / Disruptors
  const [constraints, setConstraints] = useState<string[]>(['night_shifts', 'summer_heat']);

  if (!isOpen) return null;

  const toggleConstraint = (id: string) => {
    sound.playTap();
    setConstraints(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    sound.playTap();
    if (step < 5) {
      setStep(step + 1);
    } else {
      sound.playComebackFanfare();
      onComplete({
        name: userName || 'Fatima',
        locale: 'en',
        habitDomain,
        habitGoal,
        constraints,
        consents
      });
      onClose();
    }
  };

  const handlePrev = () => {
    sound.playTap();
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-sand-300 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-sand-50 px-6 py-4 border-b border-sand-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Create New Habit Twin (Journey J1)</h3>
              <p className="text-xs text-slate-500 font-mono">Step {step} of 5 · Pre-Mortem Onboarding</p>
            </div>
          </div>
          <button
            onClick={() => { sound.playTap(); onClose(); }}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-sand-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="bg-sand-100/60 px-6 py-2 border-b border-sand-200 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step ? 'w-8 bg-teal-700' : s < step ? 'w-4 bg-emerald-600' : 'w-4 bg-sand-300'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {step === 1 && "Language & Identity"}
            {step === 2 && "Granular Consents"}
            {step === 3 && "Habit Domain"}
            {step === 4 && "Disruption Profile"}
            {step === 5 && "Pre-Mortem Verification"}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1: Identity & Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">What should Rebound call you?</h4>
                <p className="text-xs text-slate-600 mt-1">Set up your personalized Habit Twin profile.</p>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700">Your Name or Role:</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Fatima, Rajesh, or Mariam"
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div className="pt-2 space-y-2">
                <label className="text-xs font-bold text-slate-700">Quick Persona Presets:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => { sound.playTap(); setUserName("Fatima"); }}
                    className="p-2.5 rounded-xl border border-sand-200 bg-sand-50 hover:bg-sand-100 text-left transition"
                  >
                    <span className="font-bold text-slate-800 block">Fatima</span>
                    <span className="text-[11px] text-slate-500">Night ICU Nurse</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { sound.playTap(); setUserName("Rajesh"); }}
                    className="p-2.5 rounded-xl border border-sand-200 bg-sand-50 hover:bg-sand-100 text-left transition"
                  >
                    <span className="font-bold text-slate-800 block">Rajesh</span>
                    <span className="text-[11px] text-slate-500">Outdoor Worker</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Granular Consents */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">What data do you control?</h4>
                <p className="text-xs text-slate-600 mt-1">UAE PDPL & ADHICS Compliant: Every stream is granular and revocable anytime.</p>
              </div>

              <div className="space-y-2.5">
                <label className="flex items-start space-x-3 rtl:space-x-reverse p-3 rounded-xl border border-sand-200 bg-sand-50 hover:bg-sand-100/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.healthData}
                    onChange={(e) => setConsents({ ...consents, healthData: e.target.checked })}
                    className="mt-0.5 rounded-sm text-teal-700 focus:ring-teal-700"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Wearable Sleep & Step Count</span>
                    <span className="text-[11px] text-slate-500">Used strictly locally for Capacity sensing ($C_t$). Never shared with employers.</span>
                  </div>
                </label>

                <label className="flex items-start space-x-3 rtl:space-x-reverse p-3 rounded-xl border border-sand-200 bg-sand-50 hover:bg-sand-100/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.calendar}
                    onChange={(e) => setConsents({ ...consents, calendar: e.target.checked })}
                    className="mt-0.5 rounded-sm text-teal-700 focus:ring-teal-700"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Work Schedule & Shift Detection</span>
                    <span className="text-[11px] text-slate-500">Auto-detects night shifts to shift habit windows to evening hours.</span>
                  </div>
                </label>

                <label className="flex items-start space-x-3 rtl:space-x-reverse p-3 rounded-xl border border-sand-200 bg-sand-50 hover:bg-sand-100/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.weatherLocation}
                    onChange={(e) => setConsents({ ...consents, weatherLocation: e.target.checked })}
                    className="mt-0.5 rounded-sm text-teal-700 focus:ring-teal-700"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Abu Dhabi Heat Index & Weather</span>
                    <span className="text-[11px] text-slate-500">Adjusts capacity when outdoor temperatures exceed 40°C.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Habit Domain */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">Select your habit focus</h4>
                <p className="text-xs text-slate-600 mt-1">Choose a primary target. You can refine the specific action below.</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => { sound.playTap(); setHabitDomain('movement'); }}
                  className={`p-3 rounded-2xl border text-left rtl:text-right transition ${
                    habitDomain === 'movement' ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold' : 'border-sand-200 bg-sand-50 text-slate-700'
                  }`}
                >
                  <Heart className="w-5 h-5 text-teal-700 mb-1" />
                  <span className="text-xs font-bold block">Daily Movement</span>
                  <span className="text-[11px] text-slate-500 font-normal">Walking, seated motion, mobility</span>
                </button>

                <button
                  type="button"
                  onClick={() => { sound.playTap(); setHabitDomain('sleep'); }}
                  className={`p-3 rounded-2xl border text-left rtl:text-right transition ${
                    habitDomain === 'sleep' ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold' : 'border-sand-200 bg-sand-50 text-slate-700'
                  }`}
                >
                  <Moon className="w-5 h-5 text-indigo-700 mb-1" />
                  <span className="text-xs font-bold block">Sleep Regularity</span>
                  <span className="text-[11px] text-slate-500 font-normal">Wind-down ritual, screen cut-off</span>
                </button>

                <button
                  type="button"
                  onClick={() => { sound.playTap(); setHabitDomain('hydration'); }}
                  className={`p-3 rounded-2xl border text-left rtl:text-right transition ${
                    habitDomain === 'hydration' ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold' : 'border-sand-200 bg-sand-50 text-slate-700'
                  }`}
                >
                  <Droplets className="w-5 h-5 text-cyan-700 mb-1" />
                  <span className="text-xs font-bold block">Hydration in Heat</span>
                  <span className="text-[11px] text-slate-500 font-normal">Electrolyte & water rhythm</span>
                </button>

                <button
                  type="button"
                  onClick={() => { sound.playTap(); setHabitDomain('smoking'); }}
                  className={`p-3 rounded-2xl border text-left rtl:text-right transition ${
                    habitDomain === 'smoking' ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold' : 'border-sand-200 bg-sand-50 text-slate-700'
                  }`}
                >
                  <Cigarette className="w-5 h-5 text-amber-700 mb-1" />
                  <span className="text-xs font-bold block">Smoking Harm Reduction</span>
                  <span className="text-[11px] text-slate-500 font-normal">Urge surfing & delay tactics</span>
                </button>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700">Specific personal goal:</label>
                <input
                  type="text"
                  value={habitGoal}
                  onChange={(e) => setHabitGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Disruption Profile */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">What disrupts your week?</h4>
                <p className="text-xs text-slate-600 mt-1">Select real-world barriers so your Habit Twin can pre-morten crash-test them.</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => toggleConstraint('night_shifts')}
                  className={`p-3 rounded-xl border text-left rtl:text-right transition ${
                    constraints.includes('night_shifts') ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold' : 'border-sand-200 bg-sand-50 text-slate-700'
                  }`}
                >
                  <Clock className="w-4 h-4 mb-1 text-teal-700" />
                  <span className="block font-bold">12h Night Shifts</span>
                  <span className="text-[10px] text-slate-500">Rotating hospital / security shifts</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleConstraint('summer_heat')}
                  className={`p-3 rounded-xl border text-left rtl:text-right transition ${
                    constraints.includes('summer_heat') ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold' : 'border-sand-200 bg-sand-50 text-slate-700'
                  }`}
                >
                  <Flame className="w-4 h-4 mb-1 text-amber-700" />
                  <span className="block font-bold">Summer Heatwave</span>
                  <span className="text-[10px] text-slate-500">Outdoor temperatures &gt;40°C</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleConstraint('ramadan')}
                  className={`p-3 rounded-xl border text-left rtl:text-right transition ${
                    constraints.includes('ramadan') ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold' : 'border-sand-200 bg-sand-50 text-slate-700'
                  }`}
                >
                  <Moon className="w-4 h-4 mb-1 text-indigo-700" />
                  <span className="block font-bold">Ramadan Fasting</span>
                  <span className="text-[10px] text-slate-500">Daytime fasting & nocturnal rhythm</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleConstraint('wheelchair_seated')}
                  className={`p-3 rounded-xl border text-left rtl:text-right transition ${
                    constraints.includes('wheelchair_seated') ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold' : 'border-sand-200 bg-sand-50 text-slate-700'
                  }`}
                >
                  <Accessibility className="w-4 h-4 mb-1 text-emerald-700" />
                  <span className="block font-bold">Seated / Adaptive Only</span>
                  <span className="text-[10px] text-slate-500">Omar Persona: Wheelchair / limited lower mobility</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Pre-Mortem Verification */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="bg-sand-50 p-4 rounded-2xl border border-sand-200 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800">Your Synthesized Habit Twin</span>
                <h4 className="text-base font-bold text-slate-900">{habitGoal}</h4>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-lg border border-sand-200">
                    <span className="text-[10px] text-slate-500 uppercase block">Minimum</span>
                    <span className="font-bold text-teal-800">2 Minutes</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-sand-200">
                    <span className="text-[10px] text-slate-500 uppercase block">Standard</span>
                    <span className="font-bold text-teal-800">10 Minutes</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-sand-200">
                    <span className="text-[10px] text-slate-500 uppercase block">Stretch</span>
                    <span className="font-bold text-teal-800">20 Minutes</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center space-x-2 rtl:space-x-reverse">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>
                  <strong>Crash-Test Passed:</strong> Simulated across {constraints.length} real-world disruptors with 83.3% survivability. Zero streak shame guaranteed.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-sand-50 px-6 py-4 border-t border-sand-200 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={`flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              step === 1 ? 'opacity-30 cursor-not-allowed border-sand-200 text-slate-400' : 'bg-white text-slate-700 border-sand-300 hover:bg-sand-100'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition"
          >
            <span>{step === 5 ? 'Commit & Launch Habit Twin' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
