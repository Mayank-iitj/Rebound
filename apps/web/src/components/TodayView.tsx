import React, { useState, useEffect } from 'react';
import { Locale, translations } from '../i18n/translations';
import { 
  CheckCircle2, Clock, Sparkles, AlertCircle, Info, RefreshCw, 
  Flame, Moon, Shield, Award, ArrowUpRight, HelpCircle, ThermometerSun
} from 'lucide-react';
import { submitCheckin, logAction, fetchAbuDhabiWeather } from '../services/api';
import { sound } from '../services/sound';

interface TodayViewProps {
  locale: Locale;
  todayData: any;
  onRefresh: () => void;
  onOpenRecorder: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({ locale, todayData, onRefresh, onOpenRecorder }) => {
  const t = translations[locale];
  const [selectedMood, setSelectedMood] = useState<number>(todayData?.capacity?.value ? Math.round(todayData.capacity.value * 4) + 1 : 2);
  const [sleepHours, setSleepHours] = useState<number>(4.5);
  const [selectedChips, setSelectedChips] = useState<string[]>(["tired", "shift_swap"]);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [actionLevels, setActionLevels] = useState<Record<string, string>>({});
  const [completedActions, setCompletedActions] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    fetchAbuDhabiWeather().then(w => setWeatherData(w));
  }, []);

  useEffect(() => {
    if (todayData?.actions) {
      const initLevels: Record<string, string> = {};
      const initCompleted: Record<string, string> = {};
      todayData.actions.forEach((a: any) => {
        initLevels[a.plan_action_id] = a.suggested_level || "min";
        if (a.completed) initCompleted[a.plan_action_id] = a.completed;
      });
      setActionLevels(initLevels);
      setCompletedActions(initCompleted);
    }
  }, [todayData]);

  const handleMoodSelect = async (faceVal: number) => {
    sound.playTap();
    setSelectedMood(faceVal);
    setIsSubmitting(true);
    await submitCheckin(faceVal, sleepHours, selectedChips);
    setIsSubmitting(false);
    onRefresh();
  };

  const handleToggleChip = async (chipId: string) => {
    sound.playTap();
    const updated = selectedChips.includes(chipId)
      ? selectedChips.filter(c => c !== chipId)
      : [...selectedChips, chipId];
    setSelectedChips(updated);
    await submitCheckin(selectedMood, sleepHours, updated);
    onRefresh();
  };

  const handleLog = async (actionId: string, level: string) => {
    sound.playSuccess();
    setCompletedActions(prev => ({ ...prev, [actionId]: level }));
    await logAction(actionId, level);
    onRefresh();
  };

  const capacityVal = todayData?.capacity?.value || 0.38;
  const consistencyScore = Math.round((todayData?.consistency_28d?.score || 0.74) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Daily Capacity Sensing Card */}
      <div className="bg-white rounded-2xl p-5 border border-sand-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.today.capacityQuestion}</h2>
            <p className="text-xs text-slate-500">
              {locale === 'ar' ? 'نقرة واحدة تكفي لتحديد طاقة اليوم وتعديل الخطة تلقائياً' : 'One tap sizes today\'s plan to real life. No pressure.'}
            </p>
          </div>
          <button
            onClick={() => setShowWhyModal(true)}
            className="flex items-center space-x-1 rtl:space-x-reverse text-xs text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60 font-medium hover:bg-teal-100 transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.today.whyCapacity}</span>
          </button>
        </div>

        {/* 5 Mood Faces */}
        <div className="flex items-center justify-between max-w-md mx-auto mb-5 bg-sand-50/70 p-2 rounded-xl border border-sand-200/60">
          {[
            { val: 1, icon: "☹", label: locale === 'ar' ? "مرهق جداً" : "Drained" },
            { val: 2, icon: "😕", label: locale === 'ar' ? "متعب" : "Heavy" },
            { val: 3, icon: "😐", label: locale === 'ar' ? "عادي" : "Okay" },
            { val: 4, icon: "🙂", label: locale === 'ar' ? "جيد" : "Good" },
            { val: 5, icon: "😀", label: locale === 'ar' ? "ممتاز" : "High" }
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => handleMoodSelect(item.val)}
              className={`flex flex-col items-center p-2 rounded-xl transition ${
                selectedMood === item.val
                  ? 'bg-white shadow-xs border-2 border-teal-600 scale-105'
                  : 'hover:bg-sand-100 text-slate-600'
              }`}
            >
              <span className="text-2xl leading-none mb-1">{item.icon}</span>
              <span className="text-[11px] font-medium text-slate-600">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Context Chips (Disruptor signals) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-sand-100">
          <span className="text-xs font-medium text-slate-500 me-1">{locale === 'ar' ? 'سياق اليوم:' : 'Today\'s context:'}</span>
          {[
            { id: "tired", label: locale === 'ar' ? "قلة نوم" : "Short sleep (4.5h)" },
            { id: "shift_swap", label: locale === 'ar' ? "مناوبة ليلية" : "Night shift" },
            { id: "heat", label: locale === 'ar' ? "حرارة شديدة (42°C)" : "Summer heat (42°C)" },
            { id: "travel", label: locale === 'ar' ? "سفر / تنقل" : "Travel" }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => handleToggleChip(chip.id)}
              className={`text-xs px-2.5 py-1 rounded-full border transition ${
                selectedChips.includes(chip.id)
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                  : 'bg-sand-50 text-slate-600 border-sand-200 hover:bg-sand-100'
              }`}
            >
              {chip.label} {selectedChips.includes(chip.id) ? '✓' : '+'}
            </button>
          ))}
        </div>

        {/* Capacity Output Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start space-x-3 rtl:space-x-reverse">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                {t.today.capacityScore}: {Math.round(capacityVal * 100)}% ({todayData?.capacity?.value < 0.4 ? (locale === 'ar' ? 'يوم خفيف' : 'Light Capacity') : 'Optimal'})
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {locale === 'ar' ? 'نقترح الحد الأدنى (دقيقتان)' : 'Minimum Suggested (2 min)'}
              </span>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              {todayData?.capacity?.explanation || t.today.minEnough}
            </p>
          </div>
        </div>

        {/* Live Abu Dhabi Climate Sensor Badge */}
        {weatherData && (
          <div className="mt-3 px-3 py-2 bg-sand-100/80 rounded-xl border border-sand-200/80 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse font-medium">
              <ThermometerSun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>{weatherData.city}, {weatherData.country}:</strong> {weatherData.temperature_c}°C (Feels like {weatherData.apparent_temperature_c}°C) · Humidity {weatherData.humidity_percent}%
              </span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold text-[10px]">
                {weatherData.heat_advisory}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {weatherData.source}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Soft-Risk / Restart Banner */}
      {todayData?.restart_available && (
        <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-xl bg-teal-700/80 flex items-center justify-center text-teal-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-teal-50">{t.today.restartTitle}</h3>
              <p className="text-xs text-teal-200 font-normal">
                {locale === 'ar' ? 'لا خوف من فوات الأيام. ابدأ بـ دقيقتين فقط وسيحافظ على استمراريتك.' : 'No streak to lose. A 2-minute reset keeps your momentum fully alive.'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => handleLog(todayData?.actions?.[0]?.plan_action_id || 'act1', 'min')}
              className="px-3 py-1.5 rounded-xl bg-white text-teal-900 text-xs font-bold hover:bg-teal-50 transition shadow-xs"
            >
              {t.today.restartBtn} (2 {t.common.minutes}) ✓
            </button>
            <button
              onClick={onOpenRecorder}
              className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-teal-100 text-xs font-medium border border-teal-600/80 transition"
            >
              {t.tabs.flightRecorder} (20s)
            </button>
          </div>
        </div>
      )}

      {/* 3. Elastic Action Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            {locale === 'ar' ? 'مهام خطتك المرنة لليوم' : 'Today\'s Elastic Actions'}
          </h3>
          <span className="text-xs text-slate-500">
            {locale === 'ar' ? 'اختر المستوى المناسب لطاقتك' : 'Choose level matching your capacity'}
          </span>
        </div>

        {todayData?.actions?.map((action: any) => {
          const actId = action.plan_action_id;
          const currentLevel = actionLevels[actId] || "min";
          const isDone = completedActions[actId];
          const title = typeof action.title === 'object' ? (action.title[locale] || action.title['en']) : action.title;
          const cue = typeof action.cue === 'object' ? (action.cue[locale] || action.cue['en']) : action.cue;

          return (
            <div
              key={actId}
              className={`bg-white rounded-2xl p-5 border transition ${
                isDone ? 'border-emerald-300 bg-emerald-50/20' : 'border-sand-200 shadow-xs'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <h4 className="font-bold text-base text-slate-900">{title}</h4>
                    {isDone && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                        {t.today.completed} ({currentLevel.toUpperCase()})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center space-x-2 rtl:space-x-reverse mt-0.5">
                    <span>{cue}</span>
                    <span>·</span>
                    <span className="font-medium text-slate-600">{action.window}</span>
                  </p>
                </div>

                {/* Level Picker Segmented Control */}
                <div className="bg-sand-100 p-1 rounded-xl flex items-center space-x-1 rtl:space-x-reverse border border-sand-200 text-xs">
                  <button
                    onClick={() => setActionLevels(prev => ({ ...prev, [actId]: 'min' }))}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      currentLevel === 'min'
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.levels.min} ({action.options?.min || 2} {t.common.minutes})
                  </button>
                  <button
                    onClick={() => setActionLevels(prev => ({ ...prev, [actId]: 'std' }))}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      currentLevel === 'std'
                        ? 'bg-teal-700 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.levels.std} ({action.options?.std || 10} {t.common.minutes})
                  </button>
                  <button
                    onClick={() => setActionLevels(prev => ({ ...prev, [actId]: 'stretch' }))}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      currentLevel === 'stretch'
                        ? 'bg-indigo-700 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.levels.stretch} ({action.options?.stretch || 20} {t.common.minutes})
                  </button>
                </div>
              </div>

              {/* Action completion button */}
              <div className="pt-2 flex items-center justify-between border-t border-sand-100">
                <span className="text-xs text-slate-500">
                  {currentLevel === 'min' 
                    ? (locale === 'ar' ? 'النسخة البسيطة: دقيقتان كافية لبناء عادة صامدة' : 'Minimum level: 2 minutes protects your consistency')
                    : currentLevel === 'std' 
                    ? (locale === 'ar' ? 'المستوى المعتاد لليوم' : 'Standard daily target') 
                    : (locale === 'ar' ? 'تحدي إضافي لطاقة عالية' : 'Stretch level for high-energy days')}
                </span>
                
                <button
                  onClick={() => handleLog(actId, currentLevel)}
                  className={`flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                    isDone
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isDone ? `${t.today.completed} ✓` : `${t.today.markDone} — ${currentLevel.toUpperCase()}`}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Consistency Ring (No Streaks!) */}
      <div className="bg-white rounded-2xl p-5 border border-sand-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#0F766E"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="163.3"
                strokeDashoffset={163.3 * (1 - consistencyScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-bold text-sm text-slate-800">{consistencyScore}%</span>
          </div>

          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <h4 className="font-bold text-sm text-slate-900">{t.today.consistencyScore}</h4>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-semibold border border-teal-200/60">
                3 {t.today.comebacksCount}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.today.graceDaysNotice}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-600 bg-sand-50 p-2.5 rounded-xl border border-sand-200/80 max-w-xs">
          <span className="font-semibold text-teal-800 block mb-0.5">
            {locale === 'ar' ? 'فلسفة ريبوند: لا عدادات شاقة' : 'Zero streak-shaming:'}
          </span>
          {locale === 'ar' 
            ? 'الانقطاع يخدش المعدل قليلاً لكنه لا يعيدك للصفر أبداً. العودة السريعة هي الإنجاز الحقيقي.'
            : 'Missed days slightly dip the 28-day score; they never reset it. We measure comebacks, not streaks.'}
        </div>
      </div>

      {/* Why Capacity Modal */}
      {showWhyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-sand-300 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sand-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2 rtl:space-x-reverse">
                <Info className="w-5 h-5 text-teal-700" />
                <span>{locale === 'ar' ? 'كيف يحسب ريبوند طاقة اليوم؟' : 'How Rebound estimates Capacity'}</span>
              </h3>
              <button onClick={() => setShowWhyModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2.5">
              <p>
                {locale === 'ar'
                  ? 'يقوم النموذج الرياضي (ml-spec §1) بدمج المدخلات المصرح بها وإعادة موازنة الأوزان فوراً دون الحاجة لأي جهاز قابل للارتداء:'
                  : 'Our deterministic formula (ml-spec §1) combines consented signals with missing-weight renormalization:'}
              </p>
              <ul className="space-y-1 list-disc list-inside text-slate-700">
                <li><strong>{locale === 'ar' ? 'التقييم الذاتي (30%):' : 'Self-Report (30%):'}</strong> {selectedMood}/5 face.</li>
                <li><strong>{locale === 'ar' ? 'ساعات النوم (25%):' : 'Sleep (25%):'}</strong> {sleepHours}h ({sleepHours < 5 ? 'Short rest deficit' : 'Adequate'}).</li>
                <li><strong>{locale === 'ar' ? 'طبيعة العمل والمناوبة (20%):' : 'Workload (20%):'}</strong> {selectedChips.includes('shift_swap') ? 'Night shift rotation active' : 'Standard'}.</li>
                <li><strong>{locale === 'ar' ? 'مؤشر الحرارة البيئية (10%):' : 'Heat Stress (10%):'}</strong> 42°C in Abu Dhabi (outdoor activities downshifted).</li>
              </ul>
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-[11px]">
                {locale === 'ar' 
                  ? 'الشفافية الكاملة: لم يتم التنبؤ بأي تشخيص طبي أو سريري. التقدير هو مساعد تصميم فقط لمرونة خطتك.'
                  : 'Design transparency: This is a behavioral heuristic, not a medical prediction.'}
              </div>
            </div>
            <button
              onClick={() => setShowWhyModal(false)}
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

