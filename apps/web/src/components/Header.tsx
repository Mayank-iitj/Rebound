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

  return (
    <header className={`${isLanding ? 'bg-[#0B2030]/95 border-b border-[#F0E5D4]/15 text-[#F5EDE2]' : 'bg-white border-b border-sand-200 text-slate-900'} sticky top-0 z-40 backdrop-blur-md transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        <div
          onClick={() => setCurrentView('landing')}
          className="flex items-center space-x-2.5 cursor-pointer select-none"
        >
          <div className={`w-9 h-9 rounded-xl ${isLanding ? 'bg-[#C64A32] text-white shadow-xs' : 'bg-teal-700 text-white shadow-xs'} flex items-center justify-center`}>
            <HeartPulse className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-lg tracking-tight ${isLanding ? 'text-[#F5EDE2]' : 'text-teal-800'}`}>{t.appName}</span>
              <span className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-mono ${isLanding ? 'bg-[#C64A32]/20 text-[#E2705A] border border-[#C64A32]/40' : 'bg-teal-50 text-teal-700 border border-teal-200/60'}`}>
                ABU DHABI PILOT
              </span>
            </div>
            <p className={`text-[11px] ${isLanding ? 'text-[#F5EDE2]/60' : 'text-slate-500'}`}>{t.tagline}</p>
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
                isLanding 
                  ? 'bg-[#C64A32] hover:bg-[#A83D28] text-white border border-[#E2705A]/40' 
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30'
              }`}
            >
              <Trophy className={`w-3.5 h-3.5 ${isLanding ? 'text-amber-300' : 'text-amber-600'}`} />
              <span>3-Min Judge Tour</span>
            </button>
          )}

          {onOpenPitchDeck && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenPitchDeck();
              }}
              className={`hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                isLanding
                  ? 'bg-[#07141F] hover:bg-[#07141F]/80 text-[#F5EDE2] border border-[#F0E5D4]/20'
                  : 'bg-sand-100 hover:bg-sand-200 text-slate-700 border border-sand-300'
              }`}
            >
              <Presentation className={`w-3.5 h-3.5 ${isLanding ? 'text-[#E2705A]' : 'text-teal-700'}`} />
              <span>Pitch Deck</span>
            </button>
          )}

          {onOpenOnboarding && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenOnboarding();
              }}
              className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                isLanding
                  ? 'bg-[#F0E5D4]/10 hover:bg-[#F0E5D4]/20 text-[#F5EDE2] border border-[#F0E5D4]/20'
                  : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
              }`}
            >
              <PlusCircle className={`w-3.5 h-3.5 ${isLanding ? 'text-[#E2705A]' : 'text-teal-600'}`} />
              <span>+ Habit Twin</span>
            </button>
          )}
        </div>

        {/* View Mode Switcher (Landing vs App) */}
        <div className="flex items-center space-x-2">
          <div className={`flex items-center rounded-xl p-1 border text-xs font-semibold ${
            isLanding ? 'bg-[#07141F] border-[#F0E5D4]/20' : 'bg-sand-100 border-sand-200'
          }`}>
            <button
              onClick={() => setCurrentView('landing')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition ${
                currentView === 'landing'
                  ? 'bg-[#C64A32] text-white shadow-xs font-bold'
                  : isLanding ? 'text-[#F5EDE2]/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Landing</span>
            </button>
            <button
              onClick={() => setCurrentView('app')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition ${
                currentView === 'app'
                  ? 'bg-teal-700 text-white shadow-xs font-bold'
                  : isLanding ? 'text-[#F5EDE2]/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
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
