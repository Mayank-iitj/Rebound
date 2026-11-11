import React, { useState } from 'react';
import { Locale, translations } from '../i18n/translations';
import { 
  Heart, ShieldCheck, MessageCircle, AlertCircle, Send, 
  HelpCircle, CheckCircle, UserCheck, Trash2, SlidersHorizontal
} from 'lucide-react';

interface SupportViewProps {
  locale: Locale;
}

export const SupportView: React.FC<SupportViewProps> = ({ locale }) => {
  const t = translations[locale];
  const [requestSent, setRequestSent] = useState(false);
  const [mutedTechnique, setMutedTechnique] = useState<string | null>(null);

  const handleSendAnchorRequest = () => {
    setRequestSent(true);
    setTimeout(() => setRequestSent(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Rescue Link (Anchor Nomination) */}
      <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="p-1 rounded-lg bg-teal-100 text-teal-800">
            <Heart className="w-5 h-5 text-teal-700" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {locale === 'ar' ? 'رابط النجدة والداعم الشخصي (Rescue Link)' : 'Rescue Link (Anchor Support)'}
            </h2>
            <p className="text-xs text-slate-500">
              {locale === 'ar' ? 'عيّن شخصاً مقرباً يمكنه إرسال تحية تشجيعية عند رغبتك دون الاطلاع على أي بيانات' : 'Nominate a trusted friend who can send a supportive hello when requested — with zero health data revealed.'}
            </p>
          </div>
        </div>

        {/* Anchor Profile Card */}
        <div className="p-4 rounded-xl bg-sand-50/80 border border-sand-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm">
              V
            </div>
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <h4 className="font-bold text-sm text-slate-900">Vikram (Friend)</h4>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 flex items-center space-x-1 rtl:space-x-reverse">
                  <UserCheck className="w-3 h-3" />
                  <span>{t.common.verified}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                WhatsApp · +971 50 *** 4567 · {locale === 'ar' ? 'تم التحقق' : 'Verified via SMS'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={handleSendAnchorRequest}
              disabled={requestSent}
              className={`flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                requestSent
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-teal-700 hover:bg-teal-800 text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {requestSent
                  ? (locale === 'ar' ? 'تم إرسال الطلب بنجاح ✓' : 'Hello Request Sent ✓')
                  : (locale === 'ar' ? 'طلب تحية تشجيعية' : 'Ask for a Hello')}
              </span>
            </button>
          </div>
        </div>

        {/* Zero Data Guarantee Badge */}
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start space-x-2.5 rtl:space-x-reverse text-xs text-emerald-950">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">
              {locale === 'ar' ? 'ضمان الخصوصية التامة (Governor R10):' : 'Zero Data Shared Guarantee (Governor R10):'}
            </span>
            <p className="text-emerald-900/90 leading-relaxed text-[11px]">
              {locale === 'ar'
                ? 'الرسالة التي يتلقاها صديقك ثابتة الصياغة: "مرحباً فيكرام، صديقك يسعده تلقي تحية لطيفة اليوم." لا تتم مشاركة أي بيانات صحية أو نشاط أو فترات انقطاع على الإطلاق.'
                : 'The payload sent to your Anchor contains zero activity, health, or failure data: "Hi Vikram, your friend would appreciate a quick friendly hello today." Controlled entirely by the user.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. "Why This?" Card (Evidence-based Nudges with Limits) */}
      <div className="bg-white rounded-2xl p-6 border border-sand-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <HelpCircle className="w-5 h-5 text-teal-700" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {locale === 'ar' ? 'بطاقة "لماذا هذا التنبيه؟" (الشفافية العلمية)' : '"Why This?" Evidence Card'}
            </h3>
            <p className="text-xs text-slate-500">
              {locale === 'ar' ? 'كل إشعار وتوجيه يوضح أصله العلمي وحدوده وضوابط كتمه' : 'Every nudge explains its behavior change technique, evidence level, and limits.'}
            </p>
          </div>
        </div>

        {/* Sample Why Card */}
        <div className="p-4 rounded-xl bg-sand-50/80 border border-sand-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand-200 pb-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-xs font-bold text-slate-900">
                BCT 8.7: {locale === 'ar' ? 'المهام المتدرجة (Graded Tasks)' : 'Graded Tasks'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                {t.common.evidence}: Strong
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">BCT Taxonomy v1 (Michie et al.)</span>
          </div>

          <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
            <p>
              <strong>{locale === 'ar' ? 'التفسير المبسط:' : 'Plain Explanation:'}</strong>{' '}
              {locale === 'ar'
                ? 'البدء بخطوات صغيرة جداً (دقيقتان) ثم التدرج التدريجي يبقي العادة ممكنة ويحميها من الانهيار عند انخفاض الطاقة.'
                : 'Starting with tiny micro-actions (2 minutes) and building gradually keeps consistency achievable on low-capacity days.'}
            </p>
            <p className="text-slate-600 bg-sand-100/70 p-2 rounded-lg border border-sand-200/60">
              <strong>{t.common.limits}:</strong>{' '}
              {locale === 'ar'
                ? 'قد يبدو التقدم بطيئاً في بعض الأسابيع، لكن الهدف هو صمود العادة الدائمة وليس الإرهاق المؤقت.'
                : 'Progress may feel slow initially; designed for resilience rather than short-term escalation.'}
            </p>
            <p className="text-[11px] text-teal-800 font-medium">
              <strong>{locale === 'ar' ? 'لماذا الآن؟' : 'Why Now?'}</strong>{' '}
              {locale === 'ar'
                ? 'تم اقتراح هذا التنبيه لأن ساعات نومك كانت 4.5 ساعات اليوم مع حرارة 42°C في أبوظبي.'
                : 'Selected because your sleep was 4.5h and local weather is 42°C, matching high fatigue criteria.'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-sand-200 text-xs">
            <span className="text-slate-500">
              {mutedTechnique ? (locale === 'ar' ? 'تم كتم هذه التقنية ✓' : 'Technique muted ✓') : ''}
            </span>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => setMutedTechnique('bct_8_7')}
                className="px-2.5 py-1 rounded-lg border border-sand-300 text-slate-600 hover:bg-sand-100 transition text-[11px]"
              >
                {locale === 'ar' ? 'كتم هذا النوع من الرسائل' : 'Mute This Technique'}
              </button>
              <button className="px-2.5 py-1 rounded-lg border border-sand-300 text-slate-600 hover:bg-sand-100 transition text-[11px]">
                {locale === 'ar' ? 'تقليل التكرار' : 'Fewer Reminders'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

