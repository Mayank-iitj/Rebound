import React, { useState } from 'react';
import { Locale, translations } from '../i18n/translations';
import { 
  RotateCcw, Sparkles, Check, ArrowRight, ShieldCheck, 
  MessageSquare, Mic, AlertCircle, PlusCircle, Trash2
} from 'lucide-react';
import { answerFlightRecorder, acceptRule } from '../services/api';
import { sound } from '../services/sound';

interface FlightRecorderViewProps {
  locale: Locale;
}

export const FlightRecorderView: React.FC<FlightRecorderViewProps> = ({ locale }) => {
  const t = translations[locale];
  const [selectedChip, setSelectedChip] = useState<string>("shift");
  const [customText, setCustomText] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [classifiedBarrier, setClassifiedBarrier] = useState<string>("SHIFT_WORK");
  const [proposedRule, setProposedRule] = useState<any>({
    text: locale === 'ar'
      ? "إذا فاتني يومان بعد تبديل المناوبة الليلية، سأقوم بـ إطالة لدقيقتين في أول يوم إجازة."
      : "If I miss two days after a night shift, I will do a 2-minute gentle stretch on my first day off.",
    trigger: { context: "shift_swap", condition: "missed_days>=2" },
    action: { level: "min", catalog_id: "mv_stretch_2", when: "first_day_off" }
  });
  const [isAccepted, setIsAccepted] = useState<boolean>(true);
  const [activeRules, setActiveRules] = useState<any[]>([
    {
      id: "rule_1",
      text: locale === 'ar'
        ? "إذا فاتني يومان بعد تبديل المناوبة الليلية، سأقوم بـ إطالة لدقيقتين في أول يوم إجازة."
        : "If I miss two days after a night shift, I will do a 2-minute gentle stretch on my first day off.",
      barrier: "SHIFT_WORK"
    }
  ]);

  const handleChipSelect = async (chipKey: string) => {
    setSelectedChip(chipKey);
    setAnalyzing(true);
    const chipMapping: Record<string, string> = {
      shift: "SHIFT_WORK",
      heat: "WEATHER_HEAT",
      energy: "ENERGY",
      time: "TIME",
      family: "FAMILY_CARE",
      travel: "TRAVEL"
    };
    const b = chipMapping[chipKey] || "SHIFT_WORK";
    const res = await answerFlightRecorder('lapse_fatima_demo', b);
    setClassifiedBarrier(b);
    if (res?.proposed_rule) {
      setProposedRule(res.proposed_rule);
      setIsAccepted(false);
    }
    setAnalyzing(false);
  };

  const handleAnalyzeText = async () => {
    if (!customText.trim()) return;
    setAnalyzing(true);
    const res = await answerFlightRecorder('lapse_fatima_demo', undefined, customText);
    if (res?.barrier) {
      setClassifiedBarrier(res.barrier.value);
    }
    if (res?.proposed_rule) {
      setProposedRule(res.proposed_rule);
      setIsAccepted(false);
    }
    setAnalyzing(false);
  };

  const handleAcceptRule = async () => {
    sound.playComebackFanfare();
    setIsAccepted(true);
    await acceptRule(proposedRule.text, proposedRule.trigger, proposedRule.action);
    setActiveRules(prev => [...prev, { id: `rule_${Date.now()}`, text: proposedRule.text, barrier: classifiedBarrier }]);
  };

  const handleDeleteRule = (id: string) => {
    setActiveRules(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs">
        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
          <span className="p-1 rounded-lg bg-teal-100 text-teal-800">
            <RotateCcw className="w-5 h-5 text-teal-700" />
          </span>
          <h2 className="text-xl font-bold text-slate-900">{t.flightRecorder.title}</h2>
        </div>
        <p className="text-xs text-slate-600 max-w-xl">
          {t.flightRecorder.subtitle}
        </p>

        {/* 2. 7-Day Blameless Replay Timeline */}
        <div className="mt-5 p-4 rounded-xl bg-sand-50/80 border border-sand-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              {t.flightRecorder.replayTitle}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {locale === 'ar' ? 'أسبوع تبديل المناوبة والحرارة' : 'Shift swap & heat week'}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {[
              { day: "Mon", status: "done", chip: null },
              { day: "Tue", status: "done", chip: null },
              { day: "Wed", status: "done", chip: null },
              { day: "Thu", status: "missed", chip: locale === 'ar' ? "مناوبة" : "Shift" },
              { day: "Fri", status: "missed", chip: locale === 'ar' ? "حر 44°" : "44°C" },
              { day: "Sat", status: "done", chip: locale === 'ar' ? "عودة" : "Back" },
              { day: "Sun", status: "done", chip: null }
            ].map((d, i) => (
              <div key={i} className="flex flex-col items-center p-2 rounded-xl bg-white border border-sand-200 shadow-xs">
                <span className="text-[11px] font-medium text-slate-500 mb-1">{d.day}</span>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    d.status === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {d.status === 'done' ? '✓' : '—'}
                </span>
                {d.chip && (
                  <span className="text-[10px] mt-1.5 px-1 py-0.2 rounded-sm bg-sand-100 text-slate-700 font-medium truncate max-w-full">
                    {d.chip}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. "What Got in the Way?" Classification & Rule Proposal */}
      <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-1">{t.flightRecorder.question}</h3>
          <p className="text-xs text-slate-500">
            {locale === 'ar' ? 'اختر العائق أو اكتبه لتحويله فوراً إلى قاعدة تعافٍ' : 'Select or describe the blocker to generate an automated if-then rule.'}
          </p>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(t.flightRecorder.chips).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleChipSelect(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                selectedChip === key
                  ? 'bg-teal-700 text-white border-teal-800 font-bold shadow-xs'
                  : 'bg-sand-50 text-slate-700 border-sand-200 hover:bg-sand-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Free text input */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse pt-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={locale === 'ar' ? 'أو صف ما حدث بكلماتك (مثال: أسبوع مناوبات ليلية شاقة)...' : 'Or describe what happened in your own words...'}
            className="flex-1 px-3.5 py-2 rounded-xl text-xs border border-sand-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-sand-50/50"
          />
          <button
            onClick={handleAnalyzeText}
            disabled={analyzing}
            className="px-3.5 py-2 rounded-xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition disabled:opacity-50"
          >
            {analyzing ? '...' : (locale === 'ar' ? 'تحليل' : 'Analyze')}
          </button>
        </div>

        {/* 4. Generated Recovery Rule Card */}
        <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 uppercase tracking-wide">
              {t.flightRecorder.proposedRule} ({classifiedBarrier})
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-medium">
              Ethics Governor: ALLOW ✓
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-teal-200/80 text-xs font-medium text-slate-800 leading-relaxed shadow-2xs">
            "{proposedRule.text}"
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-teal-800/80">
              {locale === 'ar' ? 'سيتم تفعيل هذه القاعدة تلقائياً عند تكرار نفس الظرف في المستقبل' : 'This rule will automatically trigger whenever this situation recurs.'}
            </span>

            <button
              onClick={handleAcceptRule}
              disabled={isAccepted}
              className={`flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                isAccepted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-teal-700 hover:bg-teal-800 text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isAccepted ? t.flightRecorder.accepted : t.flightRecorder.acceptBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Active Recovery Rules Inventory */}
      <div className="bg-white rounded-2xl p-5 border border-sand-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          {locale === 'ar' ? 'قواعد التعافي النشطة في خطتك' : 'Active Recovery Rules'} ({activeRules.length})
        </h3>

        <div className="space-y-2.5">
          {activeRules.map((r) => (
            <div
              key={r.id}
              className="p-3 rounded-xl bg-sand-50/80 border border-sand-200 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                <span className="font-medium text-slate-800">"{r.text}"</span>
              </div>
              <button
                onClick={() => handleDeleteRule(r.id)}
                className="text-slate-400 hover:text-rose-600 transition p-1"
                title="Delete rule"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

