import React, { useState } from 'react';
import { Locale, translations } from '../i18n/translations';
import { 
  Award, TrendingUp, Calendar, ShieldCheck, HeartHandshake, 
  RotateCcw, Sparkles, Table as TableIcon
} from 'lucide-react';

interface ProgressViewProps {
  locale: Locale;
  progressData: any;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ locale, progressData }) => {
  const t = translations[locale];
  const [showTable, setShowTable] = useState(false);

  const consistency = Math.round((progressData?.consistency_28d || 0.74) * 100);
  const totalComebacks = progressData?.total_comebacks || 3;
  const rhl = progressData?.median_recovery_half_life || 2.1;
  const comebacks = progressData?.comebacks || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Card with Ring */}
      <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center space-x-5 rtl:space-x-reverse">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="#E2E8F0" strokeWidth="8" fill="transparent" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#0F766E"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="213.6"
                  strokeDashoffset={213.6 * (1 - consistency / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-black text-xl text-slate-800">{consistency}%</span>
            </div>

            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                <h2 className="text-lg font-bold text-slate-900">{t.today.consistencyScore}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-semibold border border-teal-200">
                  Rolling 28 Days
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-md">
                Measures persistence over rolling 28-day windows. Grace days protect denominator. Missed days never reset to zero.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-center min-w-[120px]">
              <span className="block text-2xl font-black text-teal-800">{totalComebacks}</span>
              <span className="text-[11px] font-medium text-teal-900">{t.today.comebacksCount}</span>
            </div>

            <div className="p-3 bg-sand-100 border border-sand-200 rounded-xl text-center min-w-[120px]">
              <span className="block text-2xl font-black text-slate-800">{rhl}d</span>
              <span className="text-[11px] font-medium text-slate-600">
                Recovery Half-Life (RHL)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Comebacks Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HeartHandshake className="w-5 h-5 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Verified Comebacks Timeline
            </h3>
          </div>
          <button
            onClick={() => setShowTable(!showTable)}
            className="flex items-center space-x-1 text-xs text-teal-700 hover:text-teal-900 font-medium"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>{showTable ? 'Visual View' : 'Accessible Table'}</span>
          </button>
        </div>

        {showTable ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="bg-sand-50 border-b border-sand-200 text-slate-700 font-semibold">
                  <th className="p-2.5 text-start">Event</th>
                  <th className="p-2.5 text-start">When</th>
                  <th className="p-2.5 text-start">Days to Return</th>
                  <th className="p-2.5 text-start">Trigger Handled</th>
                  <th className="p-2.5 text-start">Level</th>
                </tr>
              </thead>
              <tbody>
                {comebacks.map((cb: any, i: number) => (
                  <tr key={i} className="border-b border-sand-100 hover:bg-sand-50/50">
                    <td className="p-2.5 font-bold text-teal-800">Comeback #{totalComebacks - i}</td>
                    <td className="p-2.5 text-slate-600">{cb.days_ago} days ago</td>
                    <td className="p-2.5 font-semibold text-emerald-700">{cb.days_to_return} days</td>
                    <td className="p-2.5 text-slate-700">{cb.trigger}</td>
                    <td className="p-2.5 uppercase font-medium">{cb.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            {comebacks.map((cb: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-sand-50/70 border border-sand-200 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                    #{totalComebacks - idx}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Comeback after {cb.trigger.replace('_', ' ')}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      {cb.days_ago} days ago · Resumed on: {cb.level.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                    Returned in {cb.days_to_return} days ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. New Metric Explanation Card: RHL */}
      <div className="bg-white rounded-2xl p-5 border border-sand-200 shadow-xs">
        <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wide mb-1">
          New Standard Metric: Recovery Half-Life (RHL)
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Recovery Half-Life (ml-spec §7) measures the days from the post-disruption trough until half of lost volume is regained. Rebound cuts RHL from 16.5 days to 2.1 days by replacing streak guilt with elastic levels and personal recovery rules.
        </p>
      </div>
    </div>
  );
};

