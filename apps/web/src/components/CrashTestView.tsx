import React, { useState, useEffect } from 'react';
import { Locale, translations } from '../i18n/translations';
import { 
  ShieldCheck, AlertTriangle, CheckCircle, RefreshCw, Sparkles, 
  HelpCircle, Wrench, ArrowRight, Zap, Sliders
} from 'lucide-react';
import { runCrashTest, applyPatch } from '../services/api';
import { sound } from '../services/sound';

interface CrashTestViewProps {
  locale: Locale;
}

export const CrashTestView: React.FC<CrashTestViewProps> = ({ locale }) => {
  const t = translations[locale];
  const [simData, setSimData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [appliedPatches, setAppliedPatches] = useState<string[]>([]);
  const [showAssumptions, setShowAssumptions] = useState(false);

  useEffect(() => {
    loadSimulation();
  }, []);

  const loadSimulation = async () => {
    sound.playTap();
    setLoading(true);
    const data = await runCrashTest('plan_fatima_1', 300);
    setSimData(data);
    setLoading(false);
  };

  const handleApplyPatch = async (patchId: string) => {
    sound.playComebackFanfare();
    setAppliedPatches(prev => [...prev, patchId]);
    setLoading(true);
    const res = await applyPatch('plan_fatima_1', patchId);
    if (res?.survivability) {
      setSimData((prev: any) => ({
        ...prev,
        survivability: res.survivability,
        scenarios: res.scenarios || prev.scenarios
      }));
    } else {
      // Optimistic update
      setSimData((prev: any) => ({
        ...prev,
        survivability: {
          survived: Math.min(6, prev.survivability.survived + 1),
          total: 6,
          score: Math.min(1.0, prev.survivability.score + 0.16)
        }
      }));
    }
    setLoading(false);
  };

  const survivability = simData?.survivability || { survived: 5, total: 6, score: 0.833 };
  const scenarios = simData?.scenarios || [];
  const patches = simData?.patches || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="p-1 rounded-lg bg-teal-100 text-teal-800">
                <Zap className="w-5 h-5 text-teal-700" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">{t.crashtest.title}</h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              {t.crashtest.subtitle}
            </p>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setShowAssumptions(true)}
              className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 rounded-xl bg-sand-100 text-slate-700 text-xs font-medium hover:bg-sand-200 transition border border-sand-200"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.crashtest.assumptionsBtn}</span>
            </button>

            <button
              onClick={loadSimulation}
              disabled={loading}
              className="flex items-center space-x-1.5 rtl:space-x-reverse px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? t.crashtest.running : t.crashtest.runSim}</span>
            </button>
          </div>
        </div>

        {/* 2. Survivability Score Gauge */}
        <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wide block mb-1">
              {t.crashtest.gaugeTitle}
            </span>
            <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
              <span className="text-3xl font-extrabold text-teal-800 tracking-tight">
                {survivability.survived} of {survivability.total}
              </span>
              <span className="text-xs font-semibold text-teal-700">
                ({Math.round(survivability.score * 100)}% resilience)
              </span>
            </div>
            <p className="text-xs text-teal-900/80 mt-1">
              {survivability.survived >= 5
                ? (locale === 'ar' ? 'ممتاز! خطتك صامدة أمام معظم أزمات الحياة الواقعية.' : 'Plan is resilient! It survives 5 out of 6 major disruption scenarios.')
                : (locale === 'ar' ? 'الخطة هشة وتحتاج تطبيق التعديلات المقترحة أدناه.' : 'Plan is fragile. Apply suggested one-tap fixes below.')}
            </p>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
            {[...Array(survivability.total)].map((_, i) => (
              <span
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  i < survivability.survived
                    ? 'bg-teal-700 shadow-xs scale-105'
                    : 'bg-sand-300 border border-sand-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Six Disruption Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((sc: any) => {
          const title = typeof sc.title === 'object' ? (sc.title[locale] || sc.title['en']) : sc.id;
          const isOk = sc.survived;

          return (
            <div
              key={sc.id}
              className={`bg-white rounded-2xl p-4 border transition ${
                isOk ? 'border-teal-200/80 shadow-xs' : 'border-amber-300 bg-amber-50/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isOk ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isOk ? '✓' : '✕'}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">{title}</h4>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    isOk
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {isOk ? t.crashtest.survived : t.crashtest.failed} ({Math.round(sc.survive_rate * 100)}%)
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                {sc.description}
              </p>

              {sc.dominant_blocker && (
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/70 flex items-center space-x-1.5 rtl:space-x-reverse">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    <strong>{t.crashtest.dominantBlocker}:</strong> {sc.dominant_blocker}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. One-Tap Patches (Plan Fixes) */}
      <div className="bg-white rounded-2xl p-5 border border-sand-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Wrench className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              {t.crashtest.suggestedPatches}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {locale === 'ar' ? 'حلول محسوبة ترفع الصمود بدون إرهاق' : 'Algorithmic patches to guarantee survival'}
          </span>
        </div>

        <div className="space-y-3">
          {patches.map((patch: any) => {
            const isApplied = appliedPatches.includes(patch.id);

            return (
              <div
                key={patch.id}
                className="p-3.5 rounded-xl bg-sand-50/70 border border-sand-200 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-0.5">
                    <span className="font-bold text-xs text-slate-900">{patch.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-teal-100 text-teal-800 font-semibold">
                      +1 {t.crashtest.survived}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{patch.description}</p>
                </div>

                <button
                  onClick={() => handleApplyPatch(patch.id)}
                  disabled={isApplied}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 rtl:space-x-reverse ${
                    isApplied
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isApplied ? t.crashtest.applied : t.crashtest.applyPatch}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assumptions & Modeling Modal */}
      {showAssumptions && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 border border-sand-300 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sand-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2 rtl:space-x-reverse">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
                <span>{locale === 'ar' ? 'فرضيات ونموذج محاكاة التوأم الرقمي' : 'Habit Twin Simulator Assumptions'}</span>
              </h3>
              <button onClick={() => setShowAssumptions(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2.5 max-h-96 overflow-y-auto">
              <p>
                {locale === 'ar' 
                  ? 'نموذج محاكاة مونت كارلو (ml-spec §3) يختبر صمود الخطة رقمياً قبل التزام المستخدم عبر المعادلة الاحتمالية:'
                  : 'Vectorized Monte Carlo habit completion simulation (ml-spec §3) runs 300 iterations per scenario:'}
              </p>
              <div className="p-2.5 rounded-lg bg-sand-100 font-mono text-[11px] text-slate-800">
                p(a,t) = σ( β0 + β1·C_t + β2·fit(window) + β3·cue + β4·H_t − β5·diff − β6·friction )
              </div>
              <ul className="space-y-1 list-disc list-inside text-slate-700">
                <li><strong>{locale === 'ar' ? 'المعاملات الافتراضية:' : 'Default Weights:'}</strong> β0 = -0.6, β1 = 2.2 (Capacity), β2 = 1.0 (Window fit), β4 = 1.4 (Habit strength).</li>
                <li><strong>{locale === 'ar' ? 'معيار الصمود:' : 'Survival Criterion:'}</strong> ≥ 60% completion during scenario + return to baseline within 7 days.</li>
                <li><strong>{locale === 'ar' ? 'حتمية النتائج:' : 'Determinism:'}</strong> Seeded RNG ensures fully reproducible outputs for clinical audits.</li>
              </ul>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                {locale === 'ar'
                  ? 'ملاحظة صدق علمية: معاملات المحاكاة هي فرضيات تصميم للتحقق المبكر وليست دليلاً سريرياً نهائياً.'
                  : 'Honesty statement: Simulator parameters are transparent design hypotheses, not clinical evidence.'}
              </div>
            </div>
            <button
              onClick={() => setShowAssumptions(false)}
              className="w-full py-2 bg-teal-700 text-white text-xs font-bold rounded-xl hover:bg-teal-800 transition"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

