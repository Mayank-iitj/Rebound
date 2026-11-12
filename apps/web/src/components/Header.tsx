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
      <header className="fixed top-4 sm:top-5 inset-x-0 z-50 pointer-events-none px-4">
        <div className="w-[calc(100%-32px)] max-w-4xl mx-auto bg-white/70 backdrop-blur-[20px] border border-stone-200/70 rounded-full px-4 sm:px-6 py-2.5 shadow-soft-lg flex items-center justify-between pointer-events-auto">
          {/* Circular logo with Coral #FFB7B2 and white dot */}
          <div
            onClick={() => {
              sound.playTap();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
          >
            <div className="w-7 h-7 rounded-full bg-[#FFB7B2] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
            <span className="font-outfit font-semibold text-base tracking-tight text-[#292524]">
              rebound
            </span>
          </div>

          {/* Text links in 14px Outfit Medium */}
          <nav className="hidden md:flex items-center space-x-6 text-[14px] font-outfit font-medium text-[#78716C]">
            <a href="#scenarios" className="hover:text-[#292524] transition-colors">scenarios</a>
            <a href="#experience" className="hover:text-[#292524] transition-colors">experience</a>
            <a href="#stories" className="hover:text-[#292524] transition-colors">stories</a>
            <a href="#faq" className="hover:text-[#292524] transition-colors">faq</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2.5">
            {onOpenJudgeTour && (
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenJudgeTour();
                }}
                className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-outfit font-medium text-[#78716C] hover:text-[#292524] hover:bg-stone-100/70 transition"
              >
                3-min tour
              </button>
            )}
            <button
              onClick={() => {
                sound.playTap();
                setCurrentView('app');
              }}
              className="px-4 py-2 rounded-full bg-[#292524] text-white font-outfit text-xs sm:text-sm font-medium hover:bg-stone-800 transition-all shadow-xs active:scale-95"
            >
              enter living room →
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
