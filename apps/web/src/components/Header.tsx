import React from 'react';
import { Locale, translations } from '../i18n/translations';
import { ShieldCheck, Globe, HeartPulse, Home, LayoutDashboard, Trophy, Presentation, PlusCircle } from 'lucide-react';
import { sound } from '../services/sound';

interface HeaderProps {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  activePersona: string;
  currentView: 'landing' | 'app';
  setCurrentView: (view: 'landing' | 'app') => void;
  onOpenJudgeTour?: () => void;
  onOpenPitchDeck?: () => void;
  onOpenOnboarding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  locale,
  setLocale,
  activePersona,
  currentView,
  setCurrentView,
  onOpenJudgeTour,
  onOpenPitchDeck,
  onOpenOnboarding
}) => {
  const t = translations[locale];

  const isLanding = currentView === 'landing';

  if (isLanding) {
    return (
      <header
        className="fixed top-0 inset-x-0 z-50 pointer-events-auto"
        style={{ mixBlendMode: 'difference', color: '#FFFFFF' }}
      >
        <div className="w-[91.5vw] max-w-[1360px] mx-auto py-3.5 flex items-center justify-between border-b border-white/20">
          <div
            onClick={() => setCurrentView('landing')}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <span className="font-serif text-2xl tracking-tight text-white font-normal">
              REBOUND
            </span>
            <span className="hidden sm:inline-block font-mono text-[10.5px] tracking-widest text-white/70 uppercase">
              // ADAPTIVE RESILIENCE
            </span>
          </div>

          <div className="flex items-center space-x-3 font-mono text-[10.5px] uppercase tracking-wider">
            {onOpenJudgeTour && (
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenJudgeTour();
                }}
                className="px-3.5 py-1.5 border border-white/40 hover:border-white text-white transition"
              >
                3-MIN TOUR
              </button>
            )}

            {onOpenPitchDeck && (
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenPitchDeck();
                }}
                className="hidden md:inline-block px-3.5 py-1.5 border border-white/40 hover:border-white text-white transition"
              >
                PITCH DECK
              </button>
            )}

            <button
              onClick={() => setCurrentView('app')}
              className="px-4 py-1.5 border border-white bg-white text-black font-semibold transition"
            >
              LAUNCH APP →
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-sand-200 text-slate-900 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        <div
          onClick={() => setCurrentView('landing')}
          className="flex items-center space-x-2.5 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-700 text-white shadow-xs flex items-center justify-center">
            <HeartPulse className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-teal-800 tracking-tight">{t.appName}</span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-mono bg-teal-50 text-teal-700 border border-teal-200/60">
                ABU DHABI PILOT
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{t.tagline}</p>
          </div>
        </div>

        {/* Center / Action Shortcuts */}
        <div className="flex items-center space-x-2">
          {onOpenJudgeTour && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenJudgeTour();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>3-Min Judge Tour</span>
            </button>
          )}

          {onOpenPitchDeck && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenPitchDeck();
              }}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition bg-sand-100 hover:bg-sand-200 text-slate-700 border border-sand-300"
            >
              <Presentation className="w-3.5 h-3.5 text-teal-700" />
              <span>Pitch Deck</span>
            </button>
          )}

          {onOpenOnboarding && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenOnboarding();
              }}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200"
            >
              <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>+ Habit Twin</span>
            </button>
          )}
        </div>

        {/* View Mode Switcher (Landing vs App) */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center rounded-xl p-1 border text-xs font-semibold bg-sand-100 border-sand-200">
            <button
              onClick={() => setCurrentView('landing')}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition text-slate-600 hover:text-slate-900"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Landing</span>
            </button>
            <button
              onClick={() => setCurrentView('app')}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition bg-teal-700 text-white shadow-xs font-bold"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">App</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
