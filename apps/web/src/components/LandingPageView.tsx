import React, { useState } from 'react';
import { Locale, translations } from '../i18n/translations';
import { 
  HeartPulse, ShieldCheck, Zap, RotateCcw, Clock, ArrowRight, 
  CheckCircle2, Sparkles, AlertTriangle, Users, TrendingUp, Lock,
  ChevronRight, Play, Flame, Moon, Compass, HelpCircle, Award, Trophy, Presentation
} from 'lucide-react';
import { sound } from '../services/sound';

interface LandingPageViewProps {
  locale: Locale;
  onLaunchApp: () => void;
  onSelectPersona: (personaId: string) => void;
  onOpenJudgeTour?: () => void;
  onOpenPitchDeck?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  locale,
  onLaunchApp,
  onSelectPersona,
  onOpenJudgeTour,
  onOpenPitchDeck
}) => {
  const t = translations[locale];
  const [activePersonaTab, setActivePersonaTab] = useState<'fatima' | 'rajesh' | 'omar' | 'mariam'>('fatima');
  
  // Interactive mini-simulator state on landing page
  const [simActivePatch, setSimActivePatch] = useState(false);
  const [activeScenario, setActiveScenario] = useState('night_shift');

  const survivabilityCount = simActivePatch ? 5 : 2;

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative pt-6 sm:pt-12 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center px-4 space-y-6">
          {/* Pilot Badge */}
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            <span>{t.landing.heroBadge}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            {t.landing.heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.landing.heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {onOpenJudgeTour && (
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenJudgeTour();
                }}
                className="flex items-center space-x-2 rtl:space-x-reverse px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Trophy className="w-4 h-4 text-slate-950" />
                <span>🏆 3-Min Judge Demo</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playTap();
                onLaunchApp();
              }}
              className="flex items-center space-x-2 rtl:space-x-reverse px-6 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <span>{t.landing.ctaApp}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>

            {onOpenPitchDeck && (
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenPitchDeck();
                }}
                className="flex items-center space-x-2 rtl:space-x-reverse px-6 py-3.5 rounded-2xl bg-white hover:bg-sand-50 text-slate-800 font-bold text-sm border border-sand-300 shadow-2xs transition"
              >
                <Presentation className="w-4 h-4 text-teal-700" />
                <span>{locale === 'ar' ? 'عرض الشرائح' : 'Pitch Deck (12 Slides)'}</span>
              </button>
            )}

            <a
              href="#habit-twin"
              onClick={() => sound.playTap()}
              className="flex items-center space-x-2 rtl:space-x-reverse px-5 py-3.5 rounded-2xl bg-sand-100 hover:bg-sand-200 text-slate-700 font-semibold text-sm border border-sand-300/80 transition"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{t.landing.ctaCrashTest}</span>
            </a>
          </div>

          {/* Key Metric Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white border border-sand-200/80 shadow-xs text-center">
              <span className="block text-2xl sm:text-3xl font-black text-teal-800">5 of 6</span>
              <span className="text-xs text-slate-600 font-medium mt-0.5 block">{t.landing.statResilience}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sand-200/80 shadow-xs text-center">
              <span className="block text-2xl sm:text-3xl font-black text-teal-800">2.1 days</span>
              <span className="text-xs text-slate-600 font-medium mt-0.5 block">{t.landing.statRHL}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sand-200/80 shadow-xs text-center">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-700">100%</span>
              <span className="text-xs text-slate-600 font-medium mt-0.5 block">{t.landing.statGovernor}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sand-200/80 shadow-xs text-center">
              <span className="block text-2xl sm:text-3xl font-black text-slate-800">Zero</span>
              <span className="text-xs text-slate-600 font-medium mt-0.5 block">{t.landing.statStreaks}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Habit Twin Mini-Simulator */}
      <section id="habit-twin" className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand-200 pb-5">
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="p-1.5 rounded-xl bg-amber-100 text-amber-800">
                  <Zap className="w-5 h-5 text-amber-600" />
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {locale === 'ar' ? 'جرّب التوأم الرقمي الحي لاختبار الصمود' : 'Live Interactive Habit Twin Crash-Test'}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {locale === 'ar' 
                  ? 'شاهد كيف تسقط خطة العادة التقليدية أمام الأزمات، وكيف يرفعها تعديل ريبوند البسيط بنقرة واحدة إلى 5 من 6.'
                  : 'Watch a fragile plan fail real life disruptions, and see how Rebound\'s one-tap patch fixes it.'}
              </p>
            </div>

            {/* Live Survivability Score */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-2xl bg-sand-50 border border-sand-200">
              <div className="text-start">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                  {t.crashtest.gaugeTitle}
                </span>
                <span className="text-2xl font-black text-teal-800">
                  {survivabilityCount} of 6
                </span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                {[...Array(6)].map((_, i) => (
                  <span
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i < survivabilityCount ? 'bg-teal-700 scale-110 shadow-xs' : 'bg-sand-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Disruption Scenarios Toggle */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              {locale === 'ar' ? 'اختر سيناريو الأزمة لاختبار الخطة:' : 'Select Disruption Scenario to Test:'}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "night_shift", label: locale === 'ar' ? "أسبوع مناوبات ليلية" : "Night-Shift Week", icon: Moon, failReason: "Walk scheduled at 07:00 when asleep after shift." },
                { id: "heatwave", label: locale === 'ar' ? "موجة حر صيفية (44°C)" : "Summer Heat (44°C)", icon: Flame, failReason: "Outdoor heat index unsafe between 10:00–17:00." },
                { id: "ramadan", label: locale === 'ar' ? "صيام وتغير روتين رمضان" : "Ramadan Routine", icon: Clock, failReason: "Daytime hydration & energy windows shifted." },
                { id: "work_crunch", label: locale === 'ar' ? "ضغط عمل طارئ (12 ساعة)" : "Work Crunch (12h)", icon: AlertTriangle, failReason: "Time scarcity blocks standard 20-min session." }
              ].map((sc) => {
                const Icon = sc.icon;
                const isSelected = activeScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setActiveScenario(sc.id)}
                    className={`p-3 rounded-xl border text-start transition ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold shadow-xs'
                        : 'bg-sand-50/60 border-sand-200 text-slate-700 hover:bg-sand-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1.5 text-teal-700" />
                    <span className="text-xs block leading-tight">{sc.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Test Simulation Card */}
            <div className="p-4 rounded-2xl bg-sand-50/70 border border-sand-200 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    simActivePatch ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {simActivePatch ? '✓ SURVIVES DISRUPTION (78% completion)' : '✕ FRAGILE (Drops to 0%)'}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {simActivePatch ? 'Rebound Elastic Fix Active' : 'Traditional Habit App Schedule'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {simActivePatch
                    ? (locale === 'ar' ? 'تم نقل نافذة المشي إلى ما بعد الاستيقاظ (17:00) مع إتاحة بديل الإطالة لدقيقتين. الخطة تصمد بنجاح!' : 'Walk window shifted to post-wake (17:00) with 2-minute gentle stretch fallback. Plan thrives!')
                    : (locale === 'ar' ? 'الخطة التقليدية تجبرك على المشي في الصباح الباكر بينما أنت نائم بعد مناوبة ليلية شاقة. تفشل الخطة وتنقطع السلسلة.' : 'Traditional plan forces rigid 07:00 morning walk while you are sleeping after hospital shift. Routine breaks.')}
                </p>
              </div>

              {/* One-Tap Fix Button */}
              <button
                onClick={() => setSimActivePatch(!simActivePatch)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-2 rtl:space-x-reverse ${
                  simActivePatch
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-teal-700 hover:bg-teal-800 text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {simActivePatch
                    ? (locale === 'ar' ? 'تم تفعيل التعديل (+38% صمود) ✓' : 'Patch Applied (+38% Lift) ✓')
                    : (locale === 'ar' ? 'تطبيق تعديل ريبوند بنقرة واحدة' : 'Apply One-Tap Rebound Fix')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Four Radical Pillars */}
      <section className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.landing.pillarsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {t.landing.pillarsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Pillar 1 */}
          <div className="p-6 rounded-3xl bg-white border border-sand-200 shadow-xs space-y-3 hover:border-teal-300 transition">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t.landing.pillar1Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.landing.pillar1Desc}</p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-3xl bg-white border border-sand-200 shadow-xs space-y-3 hover:border-teal-300 transition">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5 text-teal-700" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t.landing.pillar2Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.landing.pillar2Desc}</p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-3xl bg-white border border-sand-200 shadow-xs space-y-3 hover:border-teal-300 transition">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5 text-blue-700" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t.landing.pillar3Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.landing.pillar3Desc}</p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-3xl bg-white border border-sand-200 shadow-xs space-y-3 hover:border-teal-300 transition">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t.landing.pillar4Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.landing.pillar4Desc}</p>
          </div>
        </div>
      </section>

      {/* 4. Personas Interactive Showcase */}
      <section className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.landing.personasTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {t.landing.personasSubtitle}
          </p>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
          {[
            { id: 'fatima', name: 'فاطمة (Nurse)', role: 'Night-Shift Nurse (Arabic)', city: 'Abu Dhabi' },
            { id: 'rajesh', name: 'राजेश (Worker)', role: 'Outdoor Heat & Smoking (Hindi)', city: 'Mussafah' },
            { id: 'omar', name: 'عمر (Adaptive)', role: 'Wheelchair Adaptive Movement', city: 'Abu Dhabi' },
            { id: 'mariam', name: 'Mariam (Office)', role: 'Sedentary Office & Hydration', city: 'Al Maryah' }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActivePersonaTab(p.id as any);
                onSelectPersona(p.id);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition border ${
                activePersonaTab === p.id
                  ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                  : 'bg-white text-slate-700 border-sand-200 hover:bg-sand-50'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Selected Persona Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-xs max-w-3xl mx-auto">
          {activePersonaTab === 'fatima' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg">
                  ف
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">فاطمة (Fatima, 34) — ممرضة مناوبات ليلية بأبوظبي</h4>
                  <p className="text-xs text-slate-500">Rotating night shifts · 4.5h daytime sleep · Movement & Sleep goals</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "قبل ريبوند، كنت أفشل دائماً لأن كل التطبيقات تفترض نوماً ليلياً عادياً وتطلب المشي صباحاً. ريبوند اختبر خطتي، واكتشف أن أسبوع المناوبات يعطل نافذة المشي، فنقلها تلقائياً إلى الساعة 17:00 بعد استيقاظي، وأضاف خيار الإطالة لدقيقتين. عندما انقطعت ليومين، لم تلمني السلسلة، وقاعدة التعافي أعادتني في 48 ساعة."
              </p>
              <div className="p-3 bg-sand-50 rounded-xl border border-sand-200 text-xs text-slate-700 font-medium">
                <strong>قاعدة التعافي النشطة لفاطمة:</strong> "إذا فاتني يومان بعد تبديل المناوبة الليلية، سأقوم بـ إطالة لدقيقتين في أول يوم إجازة."
              </div>
            </div>
          )}

          {activePersonaTab === 'rajesh' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
                  र
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">राजेश (Rajesh, 41) — निर्माण कार्यकर्ता (Construction Worker)</h4>
                  <p className="text-xs text-slate-500">Outdoor 44°C heat · Low-literacy audio mode · Smoking reduction</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "काम पर भारी गर्मी और थकान रहती है। रीबाउंड मुझे कभी दोष नहीं देता। जब गर्मी 42 डिग्री पार होती है, यह तुरंत कमरे के अंदर पानी पीने और 2 मिनट गहरी सांस लेने का सुझाव देता है। सहयोगी लिंक द्वारा विक्रम मुझे केवल एक दोस्ताना नमस्ते भेजता है — कोई शर्मिंदगी नहीं।"
              </p>
              <div className="p-3 bg-sand-50 rounded-xl border border-sand-200 text-xs text-slate-700 font-medium">
                <strong>राजेश का सहयोगी लिंक:</strong> विक्रम (मित्र) को शून्य स्वास्थ्य डेटा के साथ मित्रवत अनुस्मारक।
              </div>
            </div>
          )}

          {activePersonaTab === 'omar' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg">
                  ع
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">عمر (Omar, 52) — مستخدم الكرسي المتحرك (Wheelchair User)</h4>
                  <p className="text-xs text-slate-500">Adapted movement · Seated mobility routine · Zero step bias</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "معظم التطبيقات تفترض عدّ 10,000 خطوة كمعيار وحيد للصحة وتجعلني أشعر بالعجز. ريبوند يوفر مكتبة حركية مخصصة للجلوس والكرسي المتحرك، ويقيس التزامي بتمارين الجذع والذراعين دون أي تحيز لخطوات القدمين."
              </p>
            </div>
          )}

          {activePersonaTab === 'mariam' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                  M
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Mariam (29) — Office Worker (Al Maryah Island)</h4>
                  <p className="text-xs text-slate-500">Long sedentary hours · Hydration & screen wind-down · Consistent comebacks</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "Deadlines always broke my previous habit trackers. With Rebound, during project crunch weeks the app gracefully downsizes my movement target to a 1-minute office stretch. My 28-day score never resets, and I have completed 3 verified comebacks this month."
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. The New Metric: Recovery Half-Life */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-widest block">
              {t.landing.metricTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {locale === 'ar' ? 'عمر نصف التعافي: المقياس الحقيقي للصمود' : 'Recovery Half-Life: The Metric That Matters'}
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              {t.landing.metricDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-teal-800/40 border border-teal-500/30 space-y-2">
              <span className="text-xs text-teal-300 font-bold block uppercase tracking-wide">
                {t.landing.rhlRebound}
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-white">2.1 Days</span>
              <p className="text-xs text-teal-100/80">
                {locale === 'ar' 
                  ? 'بفضل الخطة المرنة وقواعد التعافي الشخصية، يعود المستخدم إلى عادته خلال 48 ساعة فقط بعد الأزمة.'
                  : 'Fast recovery without shame. Users regain 50% of lost volume in under 48 hours.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <span className="text-xs text-slate-400 font-bold block uppercase tracking-wide">
                {t.landing.rhlTraditional}
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-400">16.5 Days</span>
              <p className="text-xs text-slate-400">
                {locale === 'ar'
                  ? 'تصفير السلاسل والشعور بالذنب يسبب الانقطاع التام أو التأخر لأكثر من أسبوعين قبل المحاولة مجدداً.'
                  : 'Streak shaming and rigid targets cause dropout or a 2+ week delay before attempting to restart.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Bottom Final Launch Callout */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {locale === 'ar' ? 'جاهز لبناء خطة تصمد أمام الحياة الحقيقية؟' : 'Ready for a plan that survives real life?'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          {locale === 'ar'
            ? 'ابدأ الآن مع ريبوند واختبر خطتك مجاناً بأعلى معايير الخصوصية والأخلاقيات.'
            : 'Explore the live adaptive daily loop, test the Habit Twin simulator, and view verifiable cohort analytics.'}
        </p>
        <button
          onClick={onLaunchApp}
          className="inline-flex items-center space-x-2 rtl:space-x-reverse px-8 py-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
        >
          <span>{t.landing.ctaApp}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </section>
    </div>
  );
};

