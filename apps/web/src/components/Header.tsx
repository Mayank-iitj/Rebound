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

  return (
    <header className="bg-white border-b border-sand-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        <div
          onClick={() => setCurrentView('landing')}
          className="flex items-center space-x-2.5 rtl:space-x-reverse cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-xs">
            <HeartPulse className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="font-bold text-lg text-teal-800 tracking-tight">{t.appName}</span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium border border-teal-200/60">
                Abu Dhabi Pilot Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">{t.tagline}</p>
          </div>
        </div>

        {/* Center / Action Shortcuts */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {onOpenJudgeTour && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenJudgeTour();
              }}
              className="flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30 text-xs font-bold transition shadow-2xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>{locale === 'ar' ? 'جولة الحكّام (3 دقائق)' : '3-Min Judge Tour'}</span>
            </button>
          )}

          {onOpenPitchDeck && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenPitchDeck();
              }}
              className="hidden md:flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-slate-700 border border-sand-300 text-xs font-semibold transition"
            >
              <Presentation className="w-3.5 h-3.5 text-teal-700" />
              <span>{locale === 'ar' ? 'عرض الشرائح' : 'Pitch Deck'}</span>
            </button>
          )}

          {onOpenOnboarding && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenOnboarding();
              }}
              className="hidden lg:flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>{locale === 'ar' ? 'إنشاء توأم عادة' : '+ Habit Twin'}</span>
            </button>
          )}
        </div>

        {/* View Mode Switcher (Landing vs App) */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="flex items-center bg-sand-100 rounded-xl p-1 border border-sand-200 text-xs font-semibold">
            <button
              onClick={() => setCurrentView('landing')}
              className={`flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-lg transition ${
                currentView === 'landing'
                  ? 'bg-white text-teal-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'الصفحة' : 'Landing'}</span>
            </button>
            <button
              onClick={() => setCurrentView('app')}
              className={`flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 rounded-lg transition ${
                currentView === 'app'
                  ? 'bg-teal-700 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'التطبيق' : 'App'}</span>
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center bg-sand-100 rounded-lg p-0.5 border border-sand-200 text-xs">
            <button
              onClick={() => setLocale('en')}
              className={`px-2 py-1 rounded-md transition ${locale === 'en' ? 'bg-white text-teal-800 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale('ar')}
              className={`px-2 py-1 rounded-md transition font-medium ${locale === 'ar' ? 'bg-white text-teal-800 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              العربية
            </button>
            <button
              onClick={() => setLocale('hi')}
              className={`px-2 py-1 rounded-md transition font-medium ${locale === 'hi' ? 'bg-white text-teal-800 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
