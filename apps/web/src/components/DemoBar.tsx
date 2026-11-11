import React, { useState } from 'react';
import { Locale, translations } from '../i18n/translations';
import { Play, Flame, AlertCircle, RefreshCw, UserCheck, ShieldAlert, FastForward, Trophy, Volume2, VolumeX } from 'lucide-react';
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
  locale,
  setLocale,
  activePersona,
  setActivePersona,
  onLapseTriggered,
  onOpenGovernorModal,
  onRefreshData,
  onOpenJudgeTour
}) => {
  const t = translations[locale];
  const [dayOffset, setDayOffset] = useState(0);
  const [notif, setNotif] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) sound.playSuccess();
  };

  const handlePersonaChange = async (p: string) => {
    sound.playTap();
    setActivePersona(p);
    const res = await switchPersona(p);
    if (p === 'fatima') setLocale('ar');
    else if (p === 'rajesh') setLocale('hi');
    else if (p === 'omar') setLocale('ar');
    else setLocale('en');
    onRefreshData();
    showToast(`Switched persona to: ${p.toUpperCase()}`);
  };

  const handleAdvanceDay = () => {
    sound.playTap();
    setDayOffset(prev => prev + 1);
    onRefreshData();
    showToast(`Simulated calendar advanced +1 Day (Total: +${dayOffset + 1}d)`);
  };

  const handleSimulateLapse = async () => {
    sound.playTap();
    await simulateLapse();
    onLapseTriggered();
    showToast(`Simulated 2-day missed lapse. Restart & Flight Recorder activated!`);
  };

  const showToast = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  };

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-2 text-xs">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="px-2 py-0.5 rounded-sm bg-amber-500/20 text-amber-300 font-bold tracking-wide uppercase text-[10px] border border-amber-500/40">
            {t.demoBar.title}
          </span>

          {/* Judge Tour Button */}
          {onOpenJudgeTour && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenJudgeTour();
              }}
              className="flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-0.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-xs transition"
            >
              <Trophy className="w-3 h-3 text-slate-950" />
              <span>🏆 3-Min Judge Demo</span>
            </button>
          )}

          {/* Persona selector buttons */}
          <div className="flex items-center space-x-1 rtl:space-x-reverse bg-slate-800 p-0.5 rounded-md border border-slate-700">
            <button
              onClick={() => handlePersonaChange('fatima')}
              className={`px-2 py-0.5 rounded transition ${activePersona === 'fatima' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              فاطمة (Nurse)
            </button>
            <button
              onClick={() => handlePersonaChange('rajesh')}
              className={`px-2 py-0.5 rounded transition ${activePersona === 'rajesh' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              राजेश (Worker)
            </button>
            <button
              onClick={() => handlePersonaChange('omar')}
              className={`px-2 py-0.5 rounded transition ${activePersona === 'omar' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              عمر (Adaptive)
            </button>
            <button
              onClick={() => handlePersonaChange('mariam')}
              className={`px-2 py-0.5 rounded transition ${activePersona === 'mariam' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Mariam (Office)
            </button>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mute audio micro-interactions" : "Enable audio micro-interactions"}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            {soundEnabled ? <Volume2 className="w-3 h-3 text-teal-400" /> : <VolumeX className="w-3 h-3 text-slate-500" />}
          </button>

          <button
            onClick={handleAdvanceDay}
            className="flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <FastForward className="w-3 h-3 text-cyan-400" />
            <span>{t.demoBar.advanceDay} {dayOffset > 0 && `(+${dayOffset})`}</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              showToast("Injected Heat Alert: 44°C outdoor index applied.");
            }}
            className="flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{t.demoBar.injectDisruptor}</span>
          </button>

          <button
            onClick={handleSimulateLapse}
            className="flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-800/80 transition"
          >
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>{t.demoBar.simulateLapse}</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onOpenGovernorModal();
            }}
            className="flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/80 transition"
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>{t.demoBar.testGovernor}</span>
          </button>
        </div>
      </div>

      {notif && (
        <div className="max-w-6xl mx-auto mt-1 bg-teal-900/90 border border-teal-600 text-teal-100 px-3 py-1 rounded-sm text-center font-medium animate-fadeIn">
          {notif}
        </div>
      )}
    </div>
  );
};

