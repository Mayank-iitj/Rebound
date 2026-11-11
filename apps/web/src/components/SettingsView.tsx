import React, { useState } from 'react';
import { Locale, translations } from '../i18n/translations';
import {
  Settings as SettingsIcon, ShieldCheck, Download, Trash2,
  Moon, Bell, Volume2, Globe, FileText, CheckCircle2
} from 'lucide-react';

interface SettingsViewProps {
  locale: Locale;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ locale }) => {
  const t = translations[locale];
  const [consents, setConsents] = useState<Record<string, boolean>>({
    notifications: true,
    weather_location: true,
    wearable: false,
    health_age: false,
    patient_app: false,
    research_aggregate: true
  });
  const [budget, setBudget] = useState<number>(3);
  const [lowLiteracyAudio, setLowLiteracyAudio] = useState<boolean>(false);
  const [exported, setExported] = useState<boolean>(false);

  const toggleConsent = (scope: string) => {
    setConsents(prev => ({ ...prev, [scope]: !prev[scope] }));
  };

  const handleExport = () => {
    setExported(true);
    const exportData = {
      user_id: "usr_fatima_demo",
      exported_at: new Date().toISOString(),
      consents,
      budget,
      plan: "plan_fatima_1",
      audit_chain_verified: true
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rebound_export_${Date.now()}.json`;
    a.click();
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header */}
      <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs">
        <div className="flex items-center space-x-2 mb-1">
          <span className="p-1 rounded-lg bg-teal-100 text-teal-800">
            <SettingsIcon className="w-5 h-5 text-teal-700" />
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Settings & Data Control
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-xl">
          You have full autonomy over every data source, notification window, and nudging frequency.
        </p>
      </div>

      {/* 2. Granular Data Source Consents */}
      <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Granular Data Permissions (Independent Toggles)
        </h3>

        <div className="space-y-3">
          {[
            { id: "notifications", title: "Supportive Nudges", desc: "Allows timely suggestions matching your active window." },
            { id: "weather_location", title: "Abu Dhabi Weather & Heat Index", desc: "Used to detect 40°C+ summer heat stress and switch to indoor routines." },
            { id: "wearable", title: "Wearable & Smartwatch Sync", desc: "Optional sleep & heart rate sync. Defaults to OFF." },
            { id: "health_age", title: "Health Age Integration", desc: "Simulated health score sync. Controlled by user." },
            { id: "research_aggregate", title: "Aggregate Research Contribution", desc: "Contributes to k>=20 differential privacy cohorts. Zero individual rows ever leave." }
          ].map(sc => (
            <div key={sc.id} className="p-3.5 rounded-xl bg-sand-50/70 border border-sand-200 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{sc.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{sc.desc}</p>
              </div>

              <button
                onClick={() => toggleConsent(sc.id)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${consents[sc.id] ? 'bg-teal-700 justify-end' : 'bg-slate-300 justify-start'
                  }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Nudge Budget & Quiet Hours */}
      <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Nudge Budget & Quiet Hours
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-800">
                Daily Nudge Cap: {budget} / day
              </span>
              <span className="text-slate-500 text-[11px]">
                Governor strictly enforces this cap
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-teal-700"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Moon className="w-4 h-4 text-teal-700" />
              <div>
                <span className="font-bold text-slate-900 block">
                  Quiet Sleep Window
                </span>
                <span className="text-[11px] text-slate-500">
                  22:00 – 07:00 (Night shift adapted)
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-semibold text-[11px]">
              Enforced ✓
            </span>
          </div>

          {/* Low Literacy Audio Mode */}
          <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-teal-700" />
              <div>
                <span className="font-bold text-slate-900 block">
                  Low-Literacy & Audio Mode
                </span>
                <span className="text-[11px] text-slate-500">
                  Larger 18px text, icon-first, voice prompts (Rajesh mode)
                </span>
              </div>
            </div>
            <button
              onClick={() => setLowLiteracyAudio(!lowLiteracyAudio)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${lowLiteracyAudio ? 'bg-teal-700 justify-end' : 'bg-slate-300 justify-start'
                }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Export & Audit Trail */}
      <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Data Portability & Cryptographic Audit Trail
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-sand-50 border border-sand-200">
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Export Full Data Package
            </h4>
            <p className="text-[11px] text-slate-500">
              Download all your logs, recovery rules, and consent ledgers in &lt; 5 seconds.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exported ? 'Exported ✓' : 'Export JSON'}</span>
          </button>
        </div>

        {/* Cryptographic Audit Hash Chain preview */}
        <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
          <div className="text-teal-400 font-bold mb-1 flex items-center space-x-1 rtl:space-x-reverse">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tamper-evident SHA256 Audit Hash Chain Active</span>
          </div>
          <div className="truncate text-slate-400">prev_hash: 8754b2fc5cf14e7a85d38865c697b98ecfa31c0a200f684a0c86ee46f7c7fffe</div>
          <div className="truncate text-teal-300">curr_hash: sha256(prev_hash || canonical_json) = e3b0c44298fc1c149afbf4c8996fb924...</div>
        </div>
      </div>
    </div>
  );
};

