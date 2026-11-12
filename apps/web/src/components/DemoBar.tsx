import React, { useState, useEffect, useRef } from 'react';
import { Locale } from '../i18n/translations';
import { 
  Accessibility, Trophy, FastForward, Flame, AlertCircle, 
  ShieldAlert, Volume2, VolumeX, X, Check, Eye, Type, 
  Sparkles
} from 'lucide-react';
import { switchPersona, simulateLapse } from '../services/api';
import { sound } from '../services/sound';

interface DemoBarProps {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  activePersona: string;
  setActivePersona: (p: string) => void;
  onLapseTriggered: () => void;
  onOpenGovernorModal: () => void;
  onRefreshData: () => void;
  onOpenJudgeTour?: () => void;
}

export const DemoBar: React.FC<DemoBarProps> = ({
  locale: _locale,
  setLocale: _setLocale,
  activePersona,
  setActivePersona,
  onLapseTriggered,
  onOpenGovernorModal,
  onRefreshData,
  onOpenJudgeTour
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dayOffset, setDayOffset] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) sound.playSuccess();
    showToast(soundEnabled ? 'Audio feedback muted' : 'Audio micro-interactions enabled');
  };

  const toggleLargeText = () => {
    sound.playTap();
    const next = !largeText;
    setLargeText(next);
    document.documentElement.classList.toggle('large-text', next);
    showToast(next ? 'Large text enabled (+15%)' : 'Standard text size restored');
  };

  const toggleHighContrast = () => {
    sound.playTap();
    const next = !highContrast;
    setHighContrast(next);
    document.documentElement.classList.toggle('high-contrast', next);
    showToast(next ? 'High contrast mode enabled' : 'Standard contrast restored');
  };

  const toggleReducedMotion = () => {
    sound.playTap();
    const next = !reducedMotion;
    setReducedMotion(next);
    document.documentElement.classList.toggle('reduced-motion', next);
    showToast(next ? 'Reduced motion enabled' : 'Motion animations enabled');
  };

  const handlePersonaChange = async (p: string) => {
    sound.playTap();
    setActivePersona(p);
    await switchPersona(p);
    onRefreshData();
    showToast(`Switched active persona to ${p.toUpperCase()}`);
  };

  const handleAdvanceDay = () => {
    sound.playTap();
    setDayOffset(prev => prev + 1);
    onRefreshData();
    showToast(`Calendar advanced +1 Day (Total: +${dayOffset + 1}d)`);
  };

  const handleSimulateLapse = async () => {
    sound.playTap();
    await simulateLapse();
    onLapseTriggered();
    showToast('Simulated 2-day missed lapse. Restart & Flight Recorder activated!');
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 left-5 z-[10000] bg-stone-900 text-stone-100 text-xs px-4 py-2.5 rounded-2xl shadow-2xl border border-stone-700/80 flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="w-2 h-2 rounded-full bg-[#FFB7B2] animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Backdrop overlay when open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[9998] transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Floating Flyout Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Accessibility and Demo Controller"
          className="fixed bottom-20 left-4 sm:left-5 z-[9999] w-[340px] sm:w-[380px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar bg-[#1c1917] text-stone-100 rounded-3xl border border-stone-700/80 shadow-2xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-200 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-800">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#FFB7B2]/20 flex items-center justify-center border border-[#FFB7B2]/40">
                <Accessibility className="w-4 h-4 text-[#FFB7B2]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Accessibility & Judge Lab
                </h3>
                <p className="text-[10px] text-stone-400">
                  Full UX usability & interactive simulation
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section 1: Accessibility Controls */}
          <div className="py-3.5 border-b border-stone-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block mb-2.5">
              Accessibility Preferences
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={toggleLargeText}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                  largeText
                    ? 'bg-[#FFB7B2]/20 border-[#FFB7B2] text-white'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <Type className="w-3.5 h-3.5 text-[#FFB7B2]" />
                <span>Large Text</span>
              </button>

              <button
                onClick={toggleHighContrast}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                  highContrast
                    ? 'bg-[#FFB7B2]/20 border-[#FFB7B2] text-white'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-[#FFB7B2]" />
                <span>High Contrast</span>
              </button>

              <button
                onClick={toggleReducedMotion}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                  reducedMotion
                    ? 'bg-[#FFB7B2]/20 border-[#FFB7B2] text-white'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFB7B2]" />
                <span>Reduce Motion</span>
              </button>

              <button
                onClick={toggleSound}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-stone-800/60 border-stone-700/60 text-stone-400'
                }`}
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-stone-500" />
                )}
                <span>{soundEnabled ? 'Audio On' : 'Muted'}</span>
              </button>
            </div>
          </div>

          {/* Section 2: 3-Min Judge Demo Tour */}
          {onOpenJudgeTour && (
            <div className="py-3.5 border-b border-stone-800">
              <button
                onClick={() => {
                  sound.playTap();
                  setIsOpen(false);
                  onOpenJudgeTour();
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-stone-950" />
                  <span className="text-[13px]">Launch 3-Min Judge Tour</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-black/15 text-stone-950">
                  interactive
                </span>
              </button>
            </div>
          )}

          {/* Section 3: Persona Selection */}
          <div className="py-3.5 border-b border-stone-800">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block mb-2.5">
              Switch Persona Simulation
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'fatima', name: 'Fatima', role: 'Nurse (Shiftwork)' },
                { id: 'rajesh', name: 'Rajesh', role: 'Safety (44°C Heat)' },
                { id: 'omar', name: 'Omar', role: 'Fintech (Desk)' },
                { id: 'mariam', name: 'Mariam', role: 'Director (Ramadan)' }
              ].map((p) => {
                const isActive = activePersona.toLowerCase().includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePersonaChange(p.id)}
                    className={`p-2.5 rounded-2xl text-left border transition cursor-pointer ${
                      isActive
                        ? 'bg-teal-950/60 border-teal-500/60 text-white'
                        : 'bg-stone-800/50 border-stone-700/50 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{p.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-teal-400" />}
                    </div>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      {p.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Live Simulation Actions */}
          <div className="pt-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block mb-2.5">
              Live Scenario Injectors
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={handleAdvanceDay}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/60 text-stone-200 transition cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5 text-cyan-400" />
                <span>+1 Day {dayOffset > 0 && `(+${dayOffset})`}</span>
              </button>

              <button
                onClick={() => {
                  sound.playTap();
                  showToast('Injected Heat Alert: 44°C outdoor index applied.');
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/60 text-stone-200 transition cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>44°C Heatwave</span>
              </button>

              <button
                onClick={handleSimulateLapse}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-200 transition cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate 2d Lapse</span>
              </button>

              <button
                onClick={() => {
                  sound.playTap();
                  setIsOpen(false);
                  onOpenGovernorModal();
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-200 transition cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Test Governor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Accessibility Trigger Icon: Bottom-Left Extreme Corner */}
      <aside aria-label="Accessibility and Demo Controls" className="fixed bottom-5 left-5 z-[9999]">
        <button
          onClick={() => {
            sound.playTap();
            setIsOpen(!isOpen);
          }}
          aria-expanded={isOpen}
          aria-label="Open accessibility options and judge lab"
          title="Accessibility & Judge Demo Controller"
          className="relative w-12 h-12 rounded-full bg-[#1c1917] text-white shadow-2xl border border-stone-700/80 hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group focus:outline-hidden focus:ring-2 focus:ring-[#FFB7B2] cursor-pointer"
        >
          <Accessibility className="w-6 h-6 text-[#FFB7B2] group-hover:scale-110 transition-transform" />
          
          {/* Subtle indicator dot */}
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#FFB7B2] border-2 border-[#1c1917]" />
        </button>
      </aside>
    </>
  );
};
