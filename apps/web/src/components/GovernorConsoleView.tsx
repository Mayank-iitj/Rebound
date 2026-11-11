import React, { useState } from 'react';
import { Locale, translations } from '../i18n/translations';
import { 
  ShieldAlert, ShieldCheck, CheckCircle2, XCircle, AlertCircle, 
  Terminal, Play, RefreshCw, Lock, Sparkles
} from 'lucide-react';
import { testGovernorMessage } from '../services/api';
import { sound } from '../services/sound';

interface GovernorConsoleViewProps {
  locale: Locale;
}

export const GovernorConsoleView: React.FC<GovernorConsoleViewProps> = ({ locale }) => {
  const t = translations[locale];
  const [testText, setTestText] = useState<string>("You broke your streak and failed yesterday. Don't be lazy, hurry up!");
  const [testResult, setTestResult] = useState<any>(null);
  const [evaluating, setEvaluating] = useState<boolean>(false);

  const handleTest = async () => {
    setEvaluating(true);
    const res = await testGovernorMessage(testText);
    setTestResult(res);
    if (res?.decision === 'block') {
      sound.playShieldAlert();
    } else {
      sound.playSuccess();
    }
    setEvaluating(false);
  };

  const handleSetSample = (sample: string) => {
    setTestText(sample);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="p-1 rounded-lg bg-teal-100 text-teal-800">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'ar' ? 'حاكم الأخلاقيات ومنع التلاعب (Ethics Governor)' : 'Ethics Governor & Policy Console'}
            </h2>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-mono bg-sand-100 px-2.5 py-1 rounded-md text-slate-700 border border-sand-200">
            <Lock className="w-3.5 h-3.5 text-teal-700" />
            <span>Policy Hash: 368b1932f91a56bc</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          {locale === 'ar'
            ? 'طبقة أمان برمجية حتمية تُقيّم كل رسالة وتنبيه خارج من النظام قبل وصوله للمستخدم. تمنع لغة الذنب ولوم فقدان السلاسل وتفرض حدود الإشعارات وساعات الهدوء.'
            : 'A deterministic, pure-function policy enforcement layer that screens all outbound nudges, messages, and rules. Fails closed against shaming, urgency, and manipulative patterns.'}
        </p>
      </div>

      {/* 2. Interactive Message Testing Sandbox (Live Demo) */}
      <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5 rtl:space-x-reverse">
            <Terminal className="w-4 h-4 text-teal-700" />
            <span>{locale === 'ar' ? 'منصة اختبار وتدقيق النصوص المباشرة' : 'Live Policy Filter Sandbox'}</span>
          </h3>
          <span className="text-xs text-slate-500">
            {locale === 'ar' ? 'جرّب كتابة أي رسالة شائعة في تطبيقات العادات' : 'Test any habit app reminder copy'}
          </span>
        </div>

        {/* Preset Sample Buttons */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-slate-500 self-center me-1">{locale === 'ar' ? 'عينات سريعة:' : 'Quick tests:'}</span>
          <button
            onClick={() => handleSetSample("You broke your streak and failed yesterday. Don't be lazy, hurry up!")}
            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition font-medium text-[11px]"
          >
            ❌ Shame / Streak Loss
          </button>
          <button
            onClick={() => handleSetSample("I am experiencing severe chest pain and cannot breathe.")}
            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition font-medium text-[11px]"
          >
            🚨 Red-Flag Emergency (R7)
          </button>
          <button
            onClick={() => handleSetSample("لقد فشلت في تحقيق هدفك وكسرت السلسلة")}
            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition font-medium text-[11px]"
          >
            ❌ Arabic Shame Lexicon
          </button>
          <button
            onClick={() => handleSetSample("Today can be small. The 2-minute Minimum version counts fully.")}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition font-medium text-[11px]"
          >
            ✓ Rebound Supportive Copy
          </button>
        </div>

        <div className="space-y-3">
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl border border-sand-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-600 bg-sand-50/50"
            placeholder="Type a message to test against Governor rules R1-R14..."
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Evaluated against R1 (Anti-Shame), R2 (Budget), R7 (Red Flag), R10 (Anchor), R14 (Urgency)
            </span>
            <button
              onClick={handleTest}
              disabled={evaluating}
              className="flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{evaluating ? 'Evaluating...' : (locale === 'ar' ? 'فحص بالذكاء والأخلاقيات' : 'Run Governor Evaluation')}</span>
            </button>
          </div>
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border transition-all ${
              testResult.decision === 'block'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {testResult.decision === 'block' ? (
                  <XCircle className="w-5 h-5 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
                <span className="font-extrabold text-sm uppercase tracking-wider">
                  Decision: {testResult.decision.toUpperCase()}
                </span>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-sm bg-white/80 border border-slate-300">
                Rule IDs: {testResult.rule_ids?.join(', ') || 'NONE'}
              </span>
            </div>

            <p className="text-xs leading-relaxed font-medium">
              {testResult.reason || (locale === 'ar' ? 'النص متوافق تماماً مع جميع ضوابط ومبادئ الأخلاقيات المعتمدة.' : 'Message complies with all ethical rules. No forbidden loss framing detected.')}
            </p>
          </div>
        )}
      </div>

      {/* 3. Rule Catalog (R1 to R14) */}
      <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          {locale === 'ar' ? 'فهرس قواعد حاكم الأخلاقيات (R1 – R14)' : 'Governor Rule Catalog (R1 – R14)'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { id: "R1", name: "No loss or shame framing", action: "BLOCK", desc: "Forbids guilt, streak broken, 'fail', 'weak', or shaming lexicon in EN/AR/HI." },
            { id: "R2", name: "Nudge budget & quiet hours", action: "BLOCK", desc: "Enforces max 3 nudges/day and stops all sends during designated sleep windows." },
            { id: "R3", name: "Post-lapse supportive tone", action: "MODIFY", desc: "Forces supportive, restart-oriented copy within 7 days after missed days." },
            { id: "R4", name: "Language & literacy match", action: "MODIFY", desc: "Adapts reading level to 6th grade and switches to audio mode for low-literacy." },
            { id: "R5", name: "Technique mute enforcement", action: "BLOCK", desc: "Respects user mute preferences immediately with zero cooldown." },
            { id: "R6", name: "Incentive caps & no pay-to-lose", action: "BLOCK", desc: "No loss-based financial stakes or predatory gamification mechanics." },
            { id: "R7", name: "Red-flag medical escalation", action: "ESCALATE", desc: "Detects crisis/chest pain, halts behavioral coaching, surfaces UAE 998 hotline." },
            { id: "R10", name: "Anchor zero-data payload", action: "BLOCK", desc: "Guarantees social rescue messages share zero activity, biomarker, or lapse data." }
          ].map(r => (
            <div key={r.id} className="p-3 rounded-xl bg-sand-50/70 border border-sand-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{r.id}: {r.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm ${
                  r.action === 'BLOCK' ? 'bg-rose-100 text-rose-800' : r.action === 'ESCALATE' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {r.action}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

