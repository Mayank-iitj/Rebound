import React, { useEffect, useState, useRef } from 'react';
import { Locale } from '../i18n/translations';
import { 
  ArrowRight, Plus, Check, Heart, Shield, Sparkles, 
  Wind, Sun, Clock, Moon, Trophy, Presentation, ChevronRight,
  Activity, CheckCircle2, RefreshCw
} from 'lucide-react';
import { sound } from '../services/sound';

interface LandingPageViewProps {
  locale: Locale;
  onLaunchApp: () => void;
  onSelectPersona: (personaId: string) => void;
  onOpenJudgeTour?: () => void;
  onOpenPitchDeck?: () => void;
}

interface ScenarioCard {
  time: string;
  context: string;
  caption: string;
  action: string;
}

const SCENARIOS: ScenarioCard[] = [
  {
    time: '02:40 AM',
    context: 'night shift exhaustion',
    caption: 'ICU ward lights dim. Biometric fatigue peak.',
    action: 'Auto-switched to 2-min box breath'
  },
  {
    time: '01:15 PM',
    context: '44°C outdoor heatwave',
    caption: 'Mussafah industrial zone UV 11+ advisory.',
    action: 'Downsized 5k run to shaded hydration'
  },
  {
    time: '06:30 PM',
    context: 'energy crash after overtime',
    caption: 'Double screen fatigue, heavy back tension.',
    action: 'Scaled to 90s seated spine release'
  },
  {
    time: '08:00 AM',
    context: 'fasting routine transition',
    caption: 'Ramadan dawn pacing and spiritual focus.',
    action: 'Gentle sunrise contemplative stretch'
  },
  {
    time: '11:45 PM',
    context: 'calm bedtime nervous reset',
    caption: 'Racing thoughts after a high-stakes deadline.',
    action: 'Zero guilt somatic slow-down'
  }
];

interface Testimonial {
  name: string;
  role: string;
  location: string;
  quote: string;
  handwritten: string;
  rotation: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Fatima Al-Mansoor',
    role: 'ICU Senior Specialist',
    location: 'Abu Dhabi',
    quote: 'On a 14-hour night shift, standard wellness apps notify you that your streak broke. Rebound simply whispered: take two breaths before sleeping. The streak didn’t break. My nervous system was actually respected.',
    handwritten: 'it never shamed me after ICU night shifts. — fatima',
    rotation: '-rotate-1'
  },
  {
    name: 'Rajesh Nair',
    role: 'Industrial Safety Engineer',
    location: 'Mussafah Zone',
    quote: 'When the midday heat index touched 48°C, Rebound proactively warned me and downshifted my daily run to hydration and recovery breathing under shaded cover. It treats humans as biological beings.',
    handwritten: 'hydration & quiet breathing in 44°C heat. — rajesh',
    rotation: 'rotate-1'
  },
  {
    name: 'Omar Farooq',
    role: 'Fintech Systems Analyst',
    location: 'Abu Dhabi Global Market',
    quote: 'I used to abandon habit trackers every time a product sprint wrecked my evenings. Rebound offered a 90-second seated wrist and spinal release at my desk. It met me where I genuinely was.',
    handwritten: 'seated mobility without step count pressure. — omar',
    rotation: '-rotate-1'
  },
  {
    name: 'Mariam Al-Kaabi',
    role: 'Public Sector Director',
    location: 'Al Maryah Island',
    quote: 'During high-intensity legislative weeks and fasting seasons, my physical energy ebbs. Rebound’s Habit Twin predicted my dip and preserved my momentum with restorative moments.',
    handwritten: 'a 1-minute stretch kept my habit alive. — mariam',
    rotation: 'rotate-1'
  }
];

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'how does rebound know when life gets chaotic?',
    a: 'Rebound uses passive contextual telemetry: biometric fatigue, heat index alerts (like Abu Dhabi summer warnings), and overtime schedules. When friction rises, your Habit Twin automatically adapts your commitments before you crash.'
  },
  {
    q: 'what is the 3-tier elastic habit architecture?',
    a: 'Every habit has three versions: Target (the ideal 20-minute flow on great days), Scaled (an 8-minute core focus when busy), and Restorative Minimum (a gentle 2-minute breath or micro-stretch when exhausted). All tiers preserve full streak integrity.'
  },
  {
    q: 'why zero shame streaks instead of traditional punishment?',
    a: 'Behavioral psychology proves that guilt triggers streak abandonment. Rebound replaces fragile counters with rolling 28-day resilience velocity and a Flight Recorder that blamelessly documents external disruptions.'
  },
  {
    q: 'how is my personal health and biometric data protected?',
    a: 'Your habit twin models and flight logs compute strictly on-device. An Ethics Governor ensures zero predatory engagement nudges, zero dark patterns, and absolute privacy.'
  }
];

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  locale: _locale,
  onLaunchApp,
  onSelectPersona,
  onOpenJudgeTour,
  onOpenPitchDeck
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [breathePhase, setBreathePhase] = useState<'breathe' | 'inhale' | 'hold' | 'exhale'>('breathe');
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [selectedPersonaTab, setSelectedPersonaTab] = useState<'fatima' | 'rajesh' | 'omar' | 'mariam'>('fatima');

  // Reveal-on-scroll observer with fail-safe immediate visibility
  useEffect(() => {
    const reveal = (el: Element) => {
      el.classList.add('is-revealed');
      el.classList.add('is-visible');
    };

    const elements = document.querySelectorAll('[data-rev]');

    // 1. Immediately reveal elements that are already in or near viewport
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 150) {
        reveal(el);
      }
    });

    // 2. Observe with IntersectionObserver
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              reveal(entry.target);
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: '60px 0px 60px 0px' }
      );

      elements.forEach((el) => observer?.observe(el));
    } else {
      elements.forEach(reveal);
    }

    // 3. Fallback: guarantee all sections are visible within 400ms
    const timer = setTimeout(() => {
      elements.forEach(reveal);
    }, 400);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, []);

  const handleBreatheClick = () => {
    sound.playTap();
    if (breathePhase === 'breathe') {
      setBreathePhase('inhale');
      setTimeout(() => setBreathePhase('hold'), 2000);
      setTimeout(() => setBreathePhase('exhale'), 4000);
      setTimeout(() => setBreathePhase('breathe'), 6000);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    sound.playSuccess();
    setEmailSubmitted(true);
    setEmailInput('');
  };

  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-[#292524] font-outfit selection:bg-[#FFB7B2] selection:text-stone-900 overflow-x-hidden pt-24 sm:pt-28 pb-16">
      {/* 35% Opacity Persistent SVG Grain Texture Overlay */}
      <div className="softly-grain-overlay" aria-hidden="true" />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 pt-8 pb-20 sm:pb-28 max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Ambient Floating Blobs */}
        <div
          aria-hidden="true"
          className="absolute -top-12 left-1/2 -translate-x-3/4 w-[340px] sm:w-[520px] h-[340px] sm:h-[520px] rounded-full bg-[#FFE4E1] opacity-60 blur-[100px] pointer-events-none animate-float-blob"
        />
        <div
          aria-hidden="true"
          className="absolute top-16 left-1/2 translate-x-12 w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] rounded-full bg-[#E6E6FA] opacity-60 blur-[100px] pointer-events-none animate-float-blob-reverse"
        />

        {/* Small Intro Badge */}
        <div className="animate-soft-in relative z-10 inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/80 border border-stone-200/80 shadow-2xs backdrop-blur-md mb-8">
          <div className="w-2 h-2 rounded-full bg-[#FFB7B2]" />
          <span className="text-xs font-medium tracking-normal text-[#78716C]">
            digital living room • adaptive habit resilience
          </span>
        </div>

        {/* Headline with Reenie Beanie cursive accent */}
        <h1
          className="animate-soft-in [animation-delay:100ms] relative z-10 text-[42px] sm:text-[64px] md:text-[76px] lg:text-[84px] font-normal leading-[1.05] tracking-tight max-w-4xl text-[#292524]"
        >
          gentle habits for the{' '}
          <span className="font-cursive text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#FFB7B2] font-normal lowercase inline-block -rotate-2 mx-1">
            unpredictable
          </span>{' '}
          days.
        </h1>

        {/* Sub-headline max 500px */}
        <p
          className="animate-soft-in [animation-delay:200ms] relative z-10 mt-6 text-base sm:text-lg md:text-xl text-[#78716C] max-w-[500px] leading-relaxed font-light"
        >
          When life gets heavy, traditional streaks shame you. Rebound automatically downsizes to 2-minute restorative moments so you never fall off.
        </p>

        {/* Dual CTA Buttons */}
        <div className="animate-soft-in [animation-delay:300ms] relative z-10 mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => {
              sound.playTap();
              onLaunchApp();
            }}
            className="px-8 py-3.5 rounded-full bg-[#FFB7B2] text-[#292524] font-medium text-base hover:brightness-95 transition-all shadow-soft-lg active:scale-95 flex items-center space-x-2"
          >
            <span>begin softly</span>
            <ArrowRight className="w-4 h-4 text-stone-800" />
          </button>

          {onOpenJudgeTour && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenJudgeTour();
              }}
              className="px-7 py-3.5 rounded-full bg-white border border-stone-200 text-[#292524] font-medium text-base hover:bg-stone-50 transition-all shadow-2xs active:scale-95 flex items-center space-x-2"
            >
              <Trophy className="w-4 h-4 text-[#78716C]" />
              <span>3-min tour</span>
            </button>
          )}

          {onOpenPitchDeck && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenPitchDeck();
              }}
              className="px-6 py-3.5 rounded-full bg-white/70 border border-stone-200/60 text-[#78716C] hover:text-[#292524] text-sm font-medium hover:bg-white transition shadow-2xs hidden sm:flex items-center space-x-2"
            >
              <Presentation className="w-4 h-4" />
              <span>pitch deck</span>
            </button>
          )}
        </div>

        {/* Micro reassurance notes */}
        <div className="animate-soft-in [animation-delay:400ms] relative z-10 mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[#78716C]">
          <span className="flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5 text-[#FFB7B2]" />
            <span>zero broken streaks</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5 text-[#FFB7B2]" />
            <span>biometric heatwave & shift sensing</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5 text-[#FFB7B2]" />
            <span>blameless flight recorder</span>
          </span>
        </div>
      </section>

      {/* Horizontal Scenario Scroll */}
      <section id="scenarios" className="py-12 sm:py-16 max-w-6xl mx-auto">
        <div className="px-4 sm:px-6 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
              adaptive moments
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-[#292524] mt-1">
              built for real human unpredictability.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#78716C] max-w-xs">
            Scroll horizontally to see how Rebound downshifts when extreme context strikes.
          </p>
        </div>

        {/* Scrollable Container with Cards (288px width, 160px height, rounded-3xl) */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-6 pb-6 pt-2">
            {SCENARIOS.map((card, idx) => (
              <div
                key={idx}
                className="w-[288px] min-w-[288px] h-[160px] bg-white rounded-3xl p-5 shadow-soft-lg border border-stone-100 flex flex-col justify-between transition-all duration-300 hover:shadow-soft-xl hover:-translate-y-1 group cursor-pointer select-none"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs sm:text-[13px] text-stone-400">
                    {card.time}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-[#E8EFE8] group-hover:bg-[#FFB7B2] transition-colors" />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-stone-800 leading-snug group-hover:text-[#FFB7B2] transition-colors">
                    {card.context}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                    {card.caption}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-medium text-stone-600">
                  <span className="text-emerald-700/80">{card.action}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Experience Preview: Three-Mockup Stacked Layout */}
      <section id="experience" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div data-rev className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
            the interface
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#292524] mt-2">
            tactile, minimalist,{' '}
            <span className="font-cursive text-4xl sm:text-5xl text-[#FFB7B2]">restorative</span>.
          </h2>
          <p className="text-sm sm:text-base text-[#78716C] mt-3">
            A serene sanctuary that meets your biological capacity rather than demanding infinite output.
          </p>
        </div>

        {/* 3-Mockup Stacked Layout */}
        <div className="relative flex items-center justify-center gap-4 sm:gap-6 pt-4 pb-12 overflow-hidden">
          {/* Left Phone Mockup: Sage #E8EFE8 bg, 280x580px, 80% opacity, +48px translateY */}
          <div
            data-rev
            className="w-[280px] h-[580px] rounded-[2.25rem] bg-[#E8EFE8] border-4 border-white shadow-soft-lg overflow-hidden relative z-10 translate-y-12 opacity-80 hidden md:flex flex-col p-5 select-none transition-all duration-500 hover:opacity-100 hover:scale-[1.02]"
          >
            {/* Phone Top Notch */}
            <div className="w-20 h-4 bg-stone-300/40 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-stone-600">Capacity Twin</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/70 text-stone-700">
                LIVE
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 shadow-2xs mb-4">
              <div className="text-[11px] text-stone-500">Current Biometric Friction</div>
              <div className="text-2xl font-semibold text-stone-800 mt-1">Fatigue 72%</div>
              <div className="w-full bg-stone-200/70 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#FFB7B2] h-full w-[72%] rounded-full" />
              </div>
              <p className="text-[10px] text-stone-500 mt-2">
                Shift overtime + heatwave detected. Autonomic downshift active.
              </p>
            </div>

            <div className="space-y-2 mt-auto">
              <div className="p-3 bg-white/70 rounded-xl text-xs flex items-center justify-between">
                <span className="text-stone-700">Target Tier</span>
                <span className="text-stone-400">20 min</span>
              </div>
              <div className="p-3 bg-white/70 rounded-xl text-xs flex items-center justify-between">
                <span className="text-stone-700">Scaled Tier</span>
                <span className="text-stone-400">8 min</span>
              </div>
              <div className="p-3 bg-white rounded-xl text-xs border border-emerald-300 font-medium flex items-center justify-between text-emerald-800">
                <span>Restorative Tier</span>
                <span>2 min</span>
              </div>
            </div>
          </div>

          {/* Center Phone Mockup: 300x620px, fully opaque, Coral pulsing button */}
          <div
            data-rev
            className="w-[300px] h-[620px] rounded-[2.5rem] bg-white border-4 border-stone-200/80 shadow-soft-xl overflow-hidden relative z-20 flex flex-col p-6 select-none"
          >
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-stone-200/80 rounded-full mx-auto mb-6" />

            {/* App Screen Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#FFB7B2] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="font-semibold text-sm text-[#292524]">rebound</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E8EFE8] text-emerald-800 font-medium">
                PROTECTED
              </span>
            </div>

            {/* Habit Status */}
            <div className="text-center my-auto">
              <span className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                today's gentle micro-moment
              </span>
              <h4 className="text-xl font-medium text-[#292524] mt-1">
                2-Min Somatic Breath
              </h4>
              <p className="text-xs text-stone-500 mt-1 max-w-[200px] mx-auto">
                No high effort required. Simply ground your breath.
              </p>

              {/* Pulsing Coral 'Breathe' Button */}
              <div className="my-8 flex flex-col items-center justify-center">
                <button
                  onClick={handleBreatheClick}
                  className="w-32 h-32 rounded-full bg-[#FFB7B2] shadow-soft-lg flex flex-col items-center justify-center animate-pulse-breathe cursor-pointer active:scale-95 transition-transform"
                >
                  <Wind className="w-6 h-6 text-[#292524] mb-1 opacity-80" />
                  <span className="font-outfit font-semibold text-sm text-[#292524] uppercase tracking-wider">
                    {breathePhase}
                  </span>
                </button>
                <span className="text-[11px] text-stone-400 mt-4">
                  tap to sync your pulse
                </span>
              </div>
            </div>

            {/* Bottom Card */}
            <div className="bg-[#FDFCF8] border border-stone-200/70 rounded-2xl p-3.5 mt-auto">
              <div className="flex items-center justify-between text-xs font-medium text-stone-700">
                <span>Flight Recorder</span>
                <span className="text-emerald-700 font-mono text-[10px]">Zero Guilt</span>
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                Day 19 of 28 rolling momentum preserved.
              </p>
            </div>
          </div>

          {/* Right Phone Mockup: Lavender #EFEDF4 bg, 280x580px, 80% opacity, +96px translateY */}
          <div
            data-rev
            className="w-[280px] h-[580px] rounded-[2.25rem] bg-[#EFEDF4] border-4 border-white shadow-soft-lg overflow-hidden relative z-10 translate-y-24 opacity-80 hidden lg:flex flex-col p-5 select-none transition-all duration-500 hover:opacity-100 hover:scale-[1.02]"
          >
            {/* Phone Top Notch */}
            <div className="w-20 h-4 bg-stone-300/40 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-stone-600">Flight Recorder</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/70 text-stone-700">
                AUDIT
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 shadow-2xs mb-4">
              <div className="text-[11px] text-stone-500">Blameless Logging</div>
              <div className="text-sm font-medium text-stone-800 mt-1">External Obstacle Attributed</div>
              <p className="text-[10px] text-stone-500 mt-1 leading-relaxed">
                "44°C Heat Index Advisory: running outdoors suspended. Restorative hydration recorded."
              </p>
            </div>

            <div className="space-y-2 mt-auto">
              <div className="p-3 bg-white/70 rounded-xl text-xs">
                <div className="font-medium text-stone-700">Ethics Governor</div>
                <div className="text-[10px] text-stone-500">No predatory streaks or red badges</div>
              </div>
              <div className="p-3 bg-white/70 rounded-xl text-xs">
                <div className="font-medium text-stone-700">Verified Comeback</div>
                <div className="text-[10px] text-stone-500">Momentum restored in 2 cycles</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Persona Living Room Explorer */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div data-rev className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-soft-lg border border-stone-200/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                interactive personas
              </span>
              <h3 className="text-2xl sm:text-3xl font-normal text-[#292524] mt-1">
                experience how rebound adapts for different lives.
              </h3>
            </div>
            {/* Persona Switcher Tabs */}
            <div className="flex items-center space-x-1.5 p-1 bg-stone-100/80 rounded-full self-start sm:self-auto overflow-x-auto no-scrollbar">
              {(['fatima', 'rajesh', 'omar', 'mariam'] as const).map((persona) => (
                <button
                  key={persona}
                  onClick={() => {
                    sound.playTap();
                    setSelectedPersonaTab(persona);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                    selectedPersonaTab === persona
                      ? 'bg-white text-[#292524] shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {persona}
                </button>
              ))}
            </div>
          </div>

          {/* Persona Card Detail */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-4">
              {selectedPersonaTab === 'fatima' && (
                <>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFE4E1] text-xs font-medium text-stone-800">
                    <Moon className="w-3.5 h-3.5" />
                    <span>ICU Nurse • Sheikh Shakhbout Medical City</span>
                  </div>
                  <h4 className="text-xl font-medium text-stone-900">
                    Irregular night shifts and biological circadian disruption.
                  </h4>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    When Fatima finishes a 14-hour trauma shift at 03:00 AM, standard wellness apps penalize her for missing daylight workout targets. Rebound detects her shift schedule and seamlessly dials the daily target down to a 2-minute seated restorative breath before sleep.
                  </p>
                </>
              )}
              {selectedPersonaTab === 'rajesh' && (
                <>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFE4E1] text-xs font-medium text-stone-800">
                    <Sun className="w-3.5 h-3.5" />
                    <span>Industrial Safety Supervisor • Mussafah Industrial Zone</span>
                  </div>
                  <h4 className="text-xl font-medium text-stone-900">
                    44°C+ summer heatwaves and heavy physical exertion.
                  </h4>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    When the summer heat index exceeds safe outdoor levels, Rajesh cannot run safely. Rebound's regional telemetry automatically converts his outdoor cardio habit to an electrolyte protocol and indoor lower-limb recovery stretch, keeping his habit identity intact without endangering health.
                  </p>
                </>
              )}
              {selectedPersonaTab === 'omar' && (
                <>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E6E6FA] text-xs font-medium text-stone-800">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Fintech Analyst • Abu Dhabi Global Market</span>
                  </div>
                  <h4 className="text-xl font-medium text-stone-900">
                    High-stakes financial audits and prolonged desk ergonomics.
                  </h4>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Audits mean 14-hour sedentary desk sessions. Rebound surfaces zero-effort micro-mobility: a 90-second spinal decompression right from the office chair that counts as a full completion on the habit timeline.
                  </p>
                </>
              )}
              {selectedPersonaTab === 'mariam' && (
                <>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E8EFE8] text-xs font-medium text-stone-800">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Public Sector Director • Al Maryah Island</span>
                  </div>
                  <h4 className="text-xl font-medium text-stone-900">
                    Ramadan fasting schedules and ministerial committees.
                  </h4>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Fasting shifts energy peaks to post-Iftar hours. Rebound reschedules her contemplative routines to align with suhoor and dawn stillness, honoring cultural rhythm without friction.
                  </p>
                </>
              )}

              <div className="pt-2">
                <button
                  onClick={() => {
                    sound.playTap();
                    onSelectPersona(selectedPersonaTab);
                    onLaunchApp();
                  }}
                  className="inline-flex items-center space-x-2 text-sm font-medium text-stone-900 hover:text-[#FFB7B2] transition-colors"
                >
                  <span>test {selectedPersonaTab}'s twin in app</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Elastic 3-Tier Pill Card */}
            <div className="bg-[#FDFCF8] border border-stone-200/70 rounded-2xl p-5 space-y-3">
              <div className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
                3-Tier Elastic Response
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 text-xs">
                <div className="font-semibold text-stone-800">Target (Full Capacity)</div>
                <div className="text-[11px] text-stone-500">20 min full routine</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-stone-200/70 text-xs">
                <div className="font-semibold text-stone-800">Scaled (Medium Friction)</div>
                <div className="text-[11px] text-stone-500">8 min core movement</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#E8EFE8] border border-emerald-300 text-xs">
                <div className="font-semibold text-emerald-900">Restorative (High Stress)</div>
                <div className="text-[11px] text-emerald-700">2 min minimum viable habit</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diary Entry Testimonials */}
      <section id="stories" className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6">
        <div data-rev className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
            reflections
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#292524] mt-2">
            diary entries from the{' '}
            <span className="font-cursive text-4xl sm:text-5xl text-[#FFB7B2]">pilot</span>.
          </h2>
          <p className="text-sm sm:text-base text-[#78716C] mt-3">
            Real stories of people who replaced toxic streak anxiety with self-compassionate habit longevity.
          </p>
        </div>

        {/* 2-column desktop / 1-column mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              data-rev
              className={`bg-white rounded-3xl p-7 sm:p-8 shadow-soft-lg border border-stone-100 flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01] ${t.rotation}`}
            >
              <div>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-light">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4">
                {/* Signature 32px horizontal line */}
                <div className="w-8 h-[2px] bg-stone-300 mb-3" />
                {/* Reenie Beanie 24px cursive text */}
                <div className="font-cursive text-2xl text-stone-500 font-normal">
                  {t.handwritten}
                </div>
                <div className="text-xs font-medium text-stone-400 mt-1">
                  {t.name} • {t.role}, {t.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section id="faq" className="py-16 max-w-3xl mx-auto px-4 sm:px-6">
        <div data-rev className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
            clarity
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal text-[#292524] mt-1">
            questions on gentle habits.
          </h2>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                data-rev
                className="bg-white rounded-2xl border border-stone-100 p-6 shadow-2xs transition-all"
              >
                <button
                  onClick={() => {
                    sound.playTap();
                    setOpenFaqIndex(isOpen ? null : idx);
                  }}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <span className="text-base sm:text-lg font-medium text-[#292524] group-hover:text-stone-900 transition-colors">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center transition-transform duration-300 ${
                      isOpen ? 'rotate-45 bg-[#FFE4E1]' : ''
                    }`}
                  >
                    <Plus className="w-4 h-4 text-stone-600" />
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-4 pt-3 border-t border-stone-100 text-sm text-[#78716C] leading-relaxed animate-fade-in font-light">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Waitlist / Platform Conversion Section */}
      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div
          data-rev
          className="relative bg-white rounded-[2.5rem] p-8 sm:p-14 shadow-soft-xl border border-stone-200/80 overflow-hidden text-center"
        >
          {/* High-blur floating gradients */}
          <div
            aria-hidden="true"
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#FFE4E1] opacity-60 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#E6E6FA] opacity-60 blur-3xl pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Dark stone #292524 rounded-square icon with coral dot */}
            <div className="w-14 h-14 rounded-2xl bg-[#292524] flex items-center justify-center shadow-soft-lg mb-6">
              <div className="w-3.5 h-3.5 rounded-full bg-[#FFB7B2]" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#292524] max-w-xl">
              step into a kinder{' '}
              <span className="font-cursive text-4xl sm:text-5xl md:text-6xl text-[#FFB7B2]">
                living room
              </span>
              .
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#78716C] max-w-md font-light leading-relaxed">
              Join mindful residents across Abu Dhabi and Dubai cultivating sustainable habits that survive chaotic days.
            </p>

            {/* Email Input & Submit */}
            <form onSubmit={handleEmailSubmit} className="mt-8 w-full max-w-md">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="enter your email address"
                  className="flex-1 px-5 py-3.5 rounded-full bg-stone-50 border border-stone-200 text-sm text-[#292524] placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#FFB7B2] transition"
                  disabled={emailSubmitted}
                />
                <button
                  type="submit"
                  disabled={emailSubmitted}
                  className="px-7 py-3.5 rounded-full bg-[#292524] text-white text-sm font-medium hover:bg-stone-800 hover:scale-[1.02] active:scale-95 transition-all shadow-soft-lg flex items-center justify-center space-x-1.5"
                >
                  {emailSubmitted ? (
                    <>
                      <Check className="w-4 h-4 text-[#FFB7B2]" />
                      <span>saved</span>
                    </>
                  ) : (
                    <span>get invite</span>
                  )}
                </button>
              </div>
              {emailSubmitted && (
                <p className="text-xs text-emerald-700 mt-3 animate-fade-in">
                  welcome to the living room. an invite will arrive shortly.
                </p>
              )}
            </form>

            {/* Direct App Launch Shortcut */}
            <div className="mt-8 pt-6 border-t border-stone-100 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-stone-600">
              <button
                onClick={() => {
                  sound.playTap();
                  onLaunchApp();
                }}
                className="hover:text-stone-900 transition flex items-center space-x-1"
              >
                <span>launch interactive app</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              {onOpenJudgeTour && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onOpenJudgeTour();
                  }}
                  className="hover:text-stone-900 transition flex items-center space-x-1"
                >
                  <span>launch judge tour</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-8 pb-12 text-center text-xs text-[#78716C] border-t border-stone-200/50 max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <div className="w-4 h-4 rounded-full bg-[#FFB7B2] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <span className="font-semibold text-stone-800 tracking-tight">rebound</span>
        </div>
        <p className="font-light">
          adaptive habit resilience • designed softly for human nervous systems
        </p>
        <p className="text-[11px] text-stone-400 mt-2">
          © {new Date().getFullYear()} Rebound Abu Dhabi Pilot. Zero dark patterns. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
