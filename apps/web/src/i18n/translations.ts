export type Locale = 'en' | 'ar' | 'hi';

export interface Translations {
  appName: string;
  tagline: string;
  tabs: {
    today: string;
    plan: string;
    flightRecorder: string;
    progress: string;
    support: string;
    program: string;
    simLab: string;
    governor: string;
    settings: string;
  };
  landing: {
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaApp: string;
    ctaCrashTest: string;
    statResilience: string;
    statRHL: string;
    statGovernor: string;
    statStreaks: string;
    pillarsTitle: string;
    pillarsSubtitle: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Title: string;
    pillar3Desc: string;
    pillar4Title: string;
    pillar4Desc: string;
    personasTitle: string;
    personasSubtitle: string;
    metricTitle: string;
    metricDesc: string;
    rhlRebound: string;
    rhlTraditional: string;
    persistenceRebound: string;
    persistenceTraditional: string;
  };
  demoBar: {
    title: string;
    persona: string;
    advanceDay: string;
    injectDisruptor: string;
    simulateLapse: string;
    testGovernor: string;
    resetDemo: string;
  };
  today: {
    greeting: string;
    capacityQuestion: string;
    capacityScore: string;
    whyCapacity: string;
    suggestedLevel: string;
    minEnough: string;
    restartTitle: string;
    restartBtn: string;
    consistencyScore: string;
    comebacksCount: string;
    graceDaysNotice: string;
    markDone: string;
    completed: string;
  };
  crashtest: {
    title: string;
    subtitle: string;
    gaugeTitle: string;
    runSim: string;
    running: string;
    survived: string;
    failed: string;
    dominantBlocker: string;
    suggestedPatches: string;
    applyPatch: string;
    applied: string;
    assumptionsBtn: string;
  };
  flightRecorder: {
    title: string;
    subtitle: string;
    replayTitle: string;
    question: string;
    proposedRule: string;
    acceptBtn: string;
    accepted: string;
    ruleActive: string;
    chips: {
      shift: string;
      heat: string;
      energy: string;
      time: string;
      family: string;
      travel: string;
    };
  };
  levels: {
    min: string;
    std: string;
    stretch: string;
  };
  common: {
    minutes: string;
    close: string;
    save: string;
    active: string;
    verified: string;
    evidence: string;
    limits: string;
  };
}

export const translations: Record<Locale, Translations> = {
  en: {
    appName: "Rebound",
    tagline: "Built for the bad week.",
    tabs: {
      today: "Today",
      plan: "Plan & Crash-Test",
      flightRecorder: "Flight Recorder",
      progress: "Progress",
      support: "Rescue Link",
      program: "Program Analytics",
      simLab: "Simulation Lab",
      governor: "Governor Console",
      settings: "Settings"
    },
    landing: {
      heroBadge: "Abu Dhabi Wellbeing Challenge 09 · Pilot Ready",
      heroTitle: "Built for the bad week.",
      heroSubtitle: "Every health app is designed for motivation. People quit when life interrupts. Rebound crash-tests your plan before you start, shrinks it when life gets hard, and turns every lapse into a personal recovery rule.",
      ctaApp: "Open Adaptive App",
      ctaCrashTest: "Try Habit Twin Simulator",
      statResilience: "Survivability Lift",
      statRHL: "Recovery Half-Life",
      statGovernor: "Ethics Governor",
      statStreaks: "Streaks Shamed",
      pillarsTitle: "Four Radical Pillars Built for Real Life",
      pillarsSubtitle: "Engineered specifically for shift workers, extreme summer heat, and inevitable life disruptions.",
      pillar1Title: "Habit Twin Crash-Test",
      pillar1Desc: "Stress-test your plan against 6 disruption scenarios before starting. One-tap patches elevate survivability from 2/6 to 5/6.",
      pillar2Title: "Elastic Capacity Sizing",
      pillar2Desc: "Daily capacity (Ct) resizes your action to 2-minute Minimum on low-sleep or high-heat days without guilt or penalties.",
      pillar3Title: "Lapse Flight Recorder",
      pillar3Desc: "A 20-second blameless replay converts every disruption into a personal recovery rule ('If X happens, I will do Y').",
      pillar4Title: "Ethics Governor & Privacy",
      pillar4Desc: "Mathematical prohibition on shaming, loss-framing, and individual surveillance. Differential privacy (k>=20, eps=1.0).",
      personasTitle: "Engineered for Diverse Realities",
      personasSubtitle: "Validated across night shifts, outdoor heat, accessibility, and workplace settings in Abu Dhabi.",
      metricTitle: "Measuring What Matters: Recovery Half-Life",
      metricDesc: "Traditional apps measure streaks and opens. Rebound measures how quickly you regain your routine after life interrupts.",
      rhlRebound: "2.1 days (Rebound)",
      rhlTraditional: "16.5 days (Traditional)",
      persistenceRebound: "64% 6-Month Persistence",
      persistenceTraditional: "8% Traditional Apps"
    },
    demoBar: {
      title: "Judge & Demo Bar",
      persona: "Persona",
      advanceDay: "+1 Day",
      injectDisruptor: "Heatwave",
      simulateLapse: "Simulate Lapse",
      testGovernor: "Test Governor",
      resetDemo: "Reset"
    },
    today: {
      greeting: "Good day",
      capacityQuestion: "How's today?",
      capacityScore: "Today's Capacity",
      whyCapacity: "Why this estimate?",
      suggestedLevel: "Suggested Level",
      minEnough: "Today looks heavy. The Minimum version is enough and still counts.",
      restartTitle: "Life happened. Need a 2-minute restart?",
      restartBtn: "Start Minimum Viable Day",
      consistencyScore: "28-Day Consistency",
      comebacksCount: "verified comebacks",
      graceDaysNotice: "Auto-grace day applied. No streak resets.",
      markDone: "Mark Done",
      completed: "Completed"
    },
    crashtest: {
      title: "Plan Crash-Test (Habit Twin)",
      subtitle: "Stress-test your plan against 6 real-life disruptions before commitment.",
      gaugeTitle: "Survivability Score",
      runSim: "Re-run Simulation",
      running: "Simulating 300 runs...",
      survived: "Survived",
      failed: "Fragile",
      dominantBlocker: "Blocker",
      suggestedPatches: "One-Tap Plan Fixes",
      applyPatch: "Apply Fix",
      applied: "Fix Applied ✓",
      assumptionsBtn: "Assumptions & Modeling"
    },
    flightRecorder: {
      title: "Lapse Flight Recorder",
      subtitle: "A blameless 20-second replay that turns a missed routine into a personal recovery rule.",
      replayTitle: "Your Last 7 Days (Blameless Replay)",
      question: "What got in the way?",
      proposedRule: "Your Proposed Recovery Rule",
      acceptBtn: "Accept Rule into Plan",
      accepted: "Rule Active ✓",
      ruleActive: "Active Rule",
      chips: {
        shift: "Night Shift",
        heat: "Extreme Heat",
        energy: "Exhausted",
        time: "Busy / Work",
        family: "Family Care",
        travel: "Travel"
      }
    },
    levels: {
      min: "Minimum",
      std: "Standard",
      stretch: "Stretch"
    },
    common: {
      minutes: "min",
      close: "Close",
      save: "Save",
      active: "Active",
      verified: "Verified",
      evidence: "Evidence Level",
      limits: "Known Limits"
    }
  },
  ar: {
    appName: "ريبوند (Rebound)",
    tagline: "صُمم للأسبوع الصعب.",
    tabs: {
      today: "اليوم",
      plan: "الخطة واختبار الصمود",
      flightRecorder: "مسجل التعافي",
      progress: "التقدم والعودة",
      support: "رابط النجدة (الداعم)",
      program: "لوحة تحليلات البرنامج",
      simLab: "مختبر المحاكاة",
      governor: "حاكم الأخلاقيات",
      settings: "الإعدادات والخصوصية"
    },
    landing: {
      heroBadge: "تحدي الرفاهية 09 في أبوظبي · جاهز للمرحلة التجريبية",
      heroTitle: "صُمم للأسبوع الصعب.",
      heroSubtitle: "كل تطبيقات الصحة صُممت للأسبوع الجيد. الناس يتركونها في الأسبوع الصعب. ريبوند يختبر خطتك مسبقاً قبل الالتزام، يقلصها لدقيقتين عند انخفاض الطاقة، ويحول كل تعثر إلى قاعدة تعافٍ شخصية.",
      ctaApp: "فتح التطبيق التكيفي",
      ctaCrashTest: "تجربة اختبار الصمود الحي",
      statResilience: "ارتفاع الصمود بعد التدعيم",
      statRHL: "سرعة استعادة التوازن (RHL)",
      statGovernor: "حاكم الأخلاقيات المعتمد",
      statStreaks: "تصفير السلاسل الشاقة",
      pillarsTitle: "أربعة ابتكارات معمارية صُممت للواقع",
      pillarsSubtitle: "هندسة مخصصة للعاملين بنظام المناوبات، حرارة الصيف الشديدة، والاضطرابات الحياتية الحتمية.",
      pillar1Title: "اختبار الصمود (التوأم الرقمي)",
      pillar1Desc: "اختبار صمود الخطة أمام 6 سيناريوهات أزمات حقيقية. التعديلات بنقرة واحدة ترفع الصمود من 2/6 إلى 5/6.",
      pillar2Title: "خطة مرنة وفق الطاقة اليومية",
      pillar2Desc: "تحديد مستوى اليوم (الحد الأدنى دقيقتان، القياسي، أو الممتد). عند قلة النوم أو الحر الشديد يُقترح الحد الأدنى دون لوم.",
      pillar3Title: "مسجل التعافي من الانقطاع",
      pillar3Desc: "مراجعة بدون لوم في 20 ثانية تحول التعثر إلى قاعدة تعافٍ شخصية ('إذا فاتني يومان بعد مناوبة، سأقوم بـ...').",
      pillar4Title: "حاكم الأخلاقيات والخصوصية",
      pillar4Desc: "منع قاطع للتلاعب ورسائل الذنب والشعور بالفشل. تقارير إجمالية مشفرة بالخصوصية التفاضلية (k≥20, ε=1.0).",
      personasTitle: "مصمم للواقع المتنوع في دولة الإمارات",
      personasSubtitle: "تم اختباره مع شخصيات تمثل المناوبات الليلية، العمل الخارجي في الصيف، والوصولية الشاملة.",
      metricTitle: "قياس ما يهم حقاً: عمر نصف التعافي (RHL)",
      metricDesc: "التطبيقات القديمة تقيس السلاسل المتواصلة فقط. ريبوند يقيس سرعة نهوضك واستعادة توازنك بعد الأزمة.",
      rhlRebound: "2.1 يوماً (ريبوند)",
      rhlTraditional: "16.5 يوماً (التطبيقات المعتادة)",
      persistenceRebound: "64% استمرارية على مدى 6 أشهر",
      persistenceTraditional: "8% في البرامج التقليدية"
    },
    demoBar: {
      title: "شريط التحكم بالتقييم والعرض",
      persona: "الشخصية",
      advanceDay: "تقديم يوم +1",
      injectDisruptor: "موجة حر",
      simulateLapse: "محاكاة انقطاع",
      testGovernor: "اختبار الحاكم",
      resetDemo: "إعادة ضبط"
    },
    today: {
      greeting: "أهلاً بك",
      capacityQuestion: "كيف تشعر اليوم؟",
      capacityScore: "طاقة اليوم المقدرة",
      whyCapacity: "لماذا هذا التقدير؟",
      suggestedLevel: "المستوى المقترح",
      minEnough: "يبدو اليوم حافلاً. النسخة البسيطة (دقيقتان) كافية وتُحسب تماماً.",
      restartTitle: "حدثت ظروف غير متوقعة؟ هل تحتاج بداية سريعة لدقيقتين؟",
      restartBtn: "ابدأ اليوم المصغر (Minimum Viable Day)",
      consistencyScore: "مؤشر الاستمرارية (28 يوماً)",
      comebacksCount: "عودات مسجلة بنجاح",
      graceDaysNotice: "يوم سماح تلقائي مُفعّل. لا يوجد تصفير أو عدادات شاقة.",
      markDone: "تسجيل الإنجاز",
      completed: "تم الإنجاز بنجاح"
    },
    crashtest: {
      title: "اختبار الصمود (التوأم الرقمي للعادة)",
      subtitle: "اختبر صمود خطتك أمام 6 أزمات واقعية (مناوبات، رمضان، حر، سفر) قبل الالتزام بها.",
      gaugeTitle: "معدل الصمود",
      runSim: "إعادة المحاكاة",
      running: "محاكاة 300 تكرار...",
      survived: "صامد بنجاح",
      failed: "هش ويحتاج تدعيماً",
      dominantBlocker: "العائق الأكبر",
      suggestedPatches: "حلول وتعديلات بنقرة واحدة",
      applyPatch: "تطبيق التعديل",
      applied: "تم تطبيق التعديل ✓",
      assumptionsBtn: "فرضيات ونموذج المحاكاة"
    },
    flightRecorder: {
      title: "مسجل التعافي من الانقطاع",
      subtitle: "مراجعة هادئة بدون لوم في 20 ثانية تحول الانقطاع إلى قاعدة تعافٍ شخصية.",
      replayTitle: "أيامك الـ 7 الأخيرة (مراجعة بدون لوم)",
      question: "ما الذي استجد واعترض طريقك؟",
      proposedRule: "قاعدة التعافي المقترحة لك",
      acceptBtn: "اعتماد القاعدة وإضافتها لخطتي",
      accepted: "القاعدة مفعلة ✓",
      ruleActive: "قاعدة نشطة",
      chips: {
        shift: "تبديل مناوبة ليلية",
        heat: "حرارة شديدة",
        energy: "إرهاق شديد",
        time: "انشغال مفاجئ",
        family: "رعاية عائلية طارئة",
        travel: "سفر وتنقل"
      }
    },
    levels: {
      min: "الحد الأدنى (بسيط)",
      std: "القياسي (معتاد)",
      stretch: "الممتد (طاقة عالية)"
    },
    common: {
      minutes: "دقيقة",
      close: "إغلاق",
      save: "حفظ",
      active: "نشط",
      verified: "مؤكد",
      evidence: "مستوى الأدلة العلمية",
      limits: "الحدود والضوابط"
    }
  },
  hi: {
    appName: "रीबाउंड (Rebound)",
    tagline: "मुश्किल सप्ताह के लिए निर्मित।",
    tabs: {
      today: "आज",
      plan: "क्रैश-टेस्ट योजना",
      flightRecorder: "रिकवरी रिकॉर्डर",
      progress: "प्रगति और वापसी",
      support: "सहयोगी लिंक",
      program: "प्रोग्राम एनालिटिक्स",
      simLab: "सिमुलेशन लैब",
      governor: "एथिक्स गवर्नर",
      settings: "सेटिंग्स"
    },
    landing: {
      heroBadge: "अबू धाबी वेलबीइंग चैलेंज 09 · पायलट हेतु तैयार",
      heroTitle: "मुश्किल सप्ताह के लिए निर्मित।",
      heroSubtitle: "अधिकांश स्वास्थ्य ऐप्स अच्छे दिनों के लिए बने हैं। लोग मुश्किल दिनों में छोड़ देते हैं। रीबाउंड शुरू करने से पहले आपकी योजना का क्रैश-टेस्ट करता है और हर रुकावट को एक व्यक्तिगत रिकवरी नियम में बदल देता है।",
      ctaApp: "ऐप खोलें",
      ctaCrashTest: "क्रैश-टेस्ट सिम्युलेटर देखें",
      statResilience: "सहनशीलता सुधार",
      statRHL: "वापसी की गति (RHL)",
      statGovernor: "सख्त एथिक्स गवर्नर",
      statStreaks: "दोषमुक्त निरंतरता",
      pillarsTitle: "वास्तविक जीवन के लिए चार ठोस आधार",
      pillarsSubtitle: "विशेष रूप से शिफ्ट वर्करों, भीषण गर्मी और जीवन की अप्रत्याशित बाधाओं के लिए तैयार।",
      pillar1Title: "शुरू करने से पहले क्रैश-टेस्ट",
      pillar1Desc: "6 वास्तविक संकटों के विरुद्ध आदत का तनाव-परीक्षण। 1-क्लिक सुधार सहनशीलता को 2/6 से 5/6 तक ले जाता है।",
      pillar2Title: "क्षमता अनुसार लचीली योजना",
      pillar2Desc: "कम नींद या गर्मी के दिनों में योजना बिना किसी अपराधबोध के 2 मिनट के न्यूनतम स्तर पर आ जाती है।",
      pillar3Title: "लैप्स फ्लाइट रिकॉर्डर",
      pillar3Desc: "20 सेकंड का बिना किसी दोष का अवलोकन जो रुकावट को आपके अपने नियम में बदल देता है।",
      pillar4Title: "एथिक्स गवर्नर और गोपनीयता",
      pillar4Desc: "अपराधबोध और शर्म पर तकनीकी प्रतिबंध। k≥20 और डिफ्रेंशियल प्राइवेसी द्वारा पूर्ण गोपनीयता।",
      personasTitle: "अबू धाबी की विविध वास्तविकताओं के लिए",
      personasSubtitle: "नाईट शिफ्ट, अत्यधिक गर्मी और सुगम्यता आवश्यकताओं के साथ मान्य।",
      metricTitle: "जो महत्वपूर्ण है उसे मापना: रिकवरी हाफ-लाइफ (RHL)",
      metricDesc: "अन्य ऐप्स केवल स्ट्रीक गिनते हैं। रीबाउंड यह मापता है कि रुकावट के बाद आप कितनी जल्दी संतुलन पाते हैं।",
      rhlRebound: "2.1 दिन (रीबाउंड)",
      rhlTraditional: "16.5 दिन (पारंपरिक ऐप्स)",
      persistenceRebound: "64% 6-महीने की निरंतरता",
      persistenceTraditional: "8% पारंपरिक ऐप्स में"
    },
    demoBar: {
      title: "डेमो और जज नियंत्रण",
      persona: "उपयोगकर्ता",
      advanceDay: "+1 दिन",
      injectDisruptor: "तेज धूप/लू",
      simulateLapse: "चूक दर्ज करें",
      testGovernor: "गवर्नर जांचें",
      resetDemo: "रीसेट"
    },
    today: {
      greeting: "नमस्ते",
      capacityQuestion: "आज का दिन कैसा लग रहा है?",
      capacityScore: "आज की क्षमता",
      whyCapacity: "यह अनुमान क्यों?",
      suggestedLevel: "सुझाया गया स्तर",
      minEnough: "आज का दिन भारी लग रहा है। 2 मिनट का छोटा स्तर भी काफी है और गिना जाएगा।",
      restartTitle: "जीवन में रुकावट आ गई? 2 मिनट की शुरुआत करें?",
      restartBtn: "2 मिनट का न्यूनतम दिन शुरू करें",
      consistencyScore: "28-दिवसीय निरंतरता",
      comebacksCount: "सफल वापसी दर्ज",
      graceDaysNotice: "छूट का दिन लागू। कोई स्ट्रीक शून्य नहीं होती।",
      markDone: "पूरा किया",
      completed: "सफलतापूर्वक पूरा ✓"
    },
    crashtest: {
      title: "आदत क्रैश-टेस्ट",
      subtitle: "वास्तविक जीवन की 6 रुकावटों के खिलाफ अपनी योजना का तनाव-परीक्षण करें।",
      gaugeTitle: "सहनशीलता स्कोर",
      runSim: "सिमुलेशन फिर से चलाएं",
      running: "300 रन चलाए जा रहे हैं...",
      survived: "सफल",
      failed: "नाजुक",
      dominantBlocker: "मुख्य बाधा",
      suggestedPatches: "एक-क्लिक सुधार",
      applyPatch: "सुधार लागू करें",
      applied: "सुधार लागू हुआ ✓",
      assumptionsBtn: "मॉडल की मान्यताएं"
    },
    flightRecorder: {
      title: "लैप्स फ्लाइट रिकॉर्डर",
      subtitle: "20 सेकंड का बिना किसी दोष का अवलोकन जो चूक को आपके अपने नियम में बदल देता है।",
      replayTitle: "आपके पिछले 7 दिन",
      question: "किस वजह से रुकावट आई?",
      proposedRule: "आपका प्रस्तावित रिकवरी नियम",
      acceptBtn: "योजना में नियम स्वीकार करें",
      accepted: "नियम सक्रिय ✓",
      ruleActive: "सक्रिय नियम",
      chips: {
        shift: "नाईट शिफ्ट",
        heat: "भारी गर्मी",
        energy: "थकान",
        time: "व्यस्तता",
        family: "परिवार की देखभाल",
        travel: "सफर"
      }
    },
    levels: {
      min: "न्यूनतम (2 मिनट)",
      std: "मानक (10 मिनट)",
      stretch: "विस्तार (20 मिनट)"
    },
    common: {
      minutes: "मिनट",
      close: "बंद करें",
      save: "सहेजें",
      active: "सक्रिय",
      verified: "सत्यापित",
      evidence: "साक्ष्य का स्तर",
      limits: "ज्ञात सीमाएं"
    }
  }
};

