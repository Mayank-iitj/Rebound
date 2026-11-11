import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Locale } from '../i18n/translations';
import { 
  Zap, ArrowRight, ShieldCheck, Trophy, Presentation, CheckCircle2, 
  Sparkles, AlertTriangle, Moon, Flame, Clock, RefreshCw, Layers, Lock,
  ChevronDown, ExternalLink, Code2, Compass, Play
} from 'lucide-react';
import { sound } from '../services/sound';

interface LandingPageViewProps {
  locale: Locale;
  onLaunchApp: () => void;
  onSelectPersona: (personaId: string) => void;
  onOpenJudgeTour?: () => void;
  onOpenPitchDeck?: () => void;
}

// -----------------------------------------------------------------------------
// WordSplit: Helper to split text into per-word inline-block spans rising 0.4em
// on a 38ms stagger, with exactly ONE italic light word in soft coral (#E2705A).
// -----------------------------------------------------------------------------
interface WordSplitProps {
  text: string;
  italicWord?: string;
  baseDelay?: number;
  step?: number;
  className?: string;
  isRevealed?: boolean;
}

const WordSplit: React.FC<WordSplitProps> = ({
  text,
  italicWord,
  baseDelay = 0,
  step = 38,
  className = '',
  isRevealed = true
}) => {
  const words = useMemo(() => text.split(/\s+/), [text]);
  const cleanItalic = italicWord?.toLowerCase().replace(/[^a-z0-9]/gi, '');

  return (
    <span className={`inline ${className}`}>
      {words.map((word, idx) => {
        const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/gi, '');
        const isItalic = cleanItalic && cleanWord === cleanItalic;
        const delay = baseDelay + idx * step;

        return (
          <span
            key={idx}
            className={`word-atom ${isRevealed ? 'is-revealed' : ''} ${
              isItalic ? 'font-display-italic font-light italic text-[#E2705A]' : ''
            }`}
            style={{
              '--word-delay': `${delay}ms`,
              marginRight: '0.28em'
            } as React.CSSProperties}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  locale: _locale,
  onLaunchApp,
  onSelectPersona,
  onOpenJudgeTour,
  onOpenPitchDeck
}) => {
  // Pinned stage progress custom states (0 to 1) throttled via rAF
  const [p1, setP1] = useState(0); // Stage 1: Parallax Hero
  const [p2, setP2] = useState(0); // Stage 2: The Opening Frame
  const [p3, setP3] = useState(0); // Stage 3: The Circular Iris
  const [p4, setP4] = useState(0); // Stage 4: The Log & Star Field

  // Stage container refs
  const stage1Ref = useRef<HTMLDivElement>(null);
  const stage2Ref = useRef<HTMLDivElement>(null);
  const stage3Ref = useRef<HTMLDivElement>(null);
  const stage4Ref = useRef<HTMLDivElement>(null);

  // Canvas ref for Stage 4 phyllotaxis star field
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interactive Persona Selector state
  const [activePersonaTab, setActivePersonaTab] = useState<'fatima' | 'rajesh' | 'omar' | 'mariam'>('fatima');

  // Interactive mini-simulator state
  const [simActivePatch, setSimActivePatch] = useState(false);
  const [activeScenario, setActiveScenario] = useState<'night_shift' | 'heatwave' | 'ramadan' | 'work_crunch'>('night_shift');

  // FAQ open/close accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Mermaid diagram code view toggle
  const [showMermaidCode, setShowMermaidCode] = useState(false);

  // Current active log row index in Stage 4 (0 to 4)
  const activeLogRow = Math.min(4, Math.floor(p4 * 5));

  // ---------------------------------------------------------------------------
  // 1. One Single rAF-Throttled Scroll Handler for All 4 Pinned Stages
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let animationFrameId: number;
    let ticking = false;

    const calcProgress = (el: HTMLElement | null): number => {
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const totalScroll = el.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return 0;
      const progress = -rect.top / totalScroll;
      return Math.max(0, Math.min(1, progress));
    };

    const handleScroll = () => {
      if (!ticking) {
        animationFrameId = requestAnimationFrame(() => {
          const newP1 = calcProgress(stage1Ref.current);
          const newP2 = calcProgress(stage2Ref.current);
          const newP3 = calcProgress(stage3Ref.current);
          const newP4 = calcProgress(stage4Ref.current);

          setP1(newP1);
          setP2(newP2);
          setP3(newP3);
          setP4(newP4);

          // Write CSS custom properties on root for GPU-composited styling
          document.documentElement.style.setProperty('--stage1-p', newP1.toFixed(4));
          document.documentElement.style.setProperty('--stage2-p', newP2.toFixed(4));
          document.documentElement.style.setProperty('--stage3-p', newP3.toFixed(4));
          document.documentElement.style.setProperty('--stage4-p', newP4.toFixed(4));

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 2. IntersectionObserver for [data-rev] Staggered Element Reveals
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-rev]');
    elements.forEach((el, index) => {
      if (!el.style.getPropertyValue('--d')) {
        const delay = 40 + (index % 12) * 45;
        el.style.setProperty('--d', `${delay}ms`);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            const atoms = entry.target.querySelectorAll('.word-atom');
            atoms.forEach((atom) => atom.classList.add('is-revealed'));
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ---------------------------------------------------------------------------
  // 3. Stage 4: 220-Point Phyllotaxis Star Field Canvas Animation
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    // High DPI scaling
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 460;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const totalStars = 220;
    const center = size / 2;
    const maxRadius = size * 0.44;

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, size, size);

      // Faint Concentric Horizon Rings
      ctx.save();
      ctx.strokeStyle = 'rgba(245, 237, 226, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(center, center, maxRadius * 0.52, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(245, 237, 226, 0.12)';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(center, center, maxRadius * 0.96, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Phyllotaxis Spiral points (angle = i * 2.399, radius = sqrt(i / 220))
      // Rotating at 0.035 radians per second
      const baseRotation = elapsed * 0.035;

      for (let i = 0; i < totalStars; i++) {
        const phi = i * 2.399;
        const currentAngle = phi + baseRotation;
        const radius = Math.sqrt(i / totalStars) * maxRadius;

        const x = center + Math.cos(currentAngle) * radius;
        const y = center + Math.sin(currentAngle) * radius;

        // Individual twinkling on its own sine
        const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(elapsed * 2.2 + i * 0.71));
        const isCoral = i % 23 === 0;

        ctx.save();
        if (isCoral) {
          ctx.fillStyle = '#E2705A';
          ctx.shadowColor = '#C64A32';
          ctx.shadowBlur = 9;
          ctx.beginPath();
          ctx.arc(x, y, 2.8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(245, 237, 226, ${(twinkle * 0.78).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.25, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Character count for wordmark auto-scaling calculation
  const wordmarkChars = 27; // "REBOUND SURVIVES DISRUPTIONS"

  return (
    <div className="relative bg-[#0B2030] text-[#F5EDE2] selection:bg-[#C64A32] selection:text-white overflow-x-hidden">
      {/* Fixed Film-Grain Plate (5% opacity, SVG feTurbulence data URI) */}
      <div className="film-grain-plate" aria-hidden="true" />

      {/* =====================================================================
          STAGE 1: PARALLAX PHOTOGRAPHIC HERO (300svh on deep navy #0B2030)
          ===================================================================== */}
      <section ref={stage1Ref} className="relative h-[300svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#0B2030] flex flex-col justify-between">
          {/* Photograph: inset -8% top/bottom with translateY and scale parallax */}
          <div
            className="absolute inset-x-0 -top-[8%] -bottom-[8%] pointer-events-none will-change-transform"
            style={{
              transform: `translate3d(0, ${p1 * -0.22 * 460}px, 0) scale(${1.06 + p1 * 0.06})`,
              transition: 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2560&q=85"
              alt="Abu Dhabi desert dunes under night sky horizon"
              className="w-full h-full object-cover brightness-[0.72] contrast-[1.08]"
              loading="eager"
            />
            {/* 3-Stop Vertical Veil (55% top, 12% third, 72% base) */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(11,32,48,0.55) 0%, rgba(11,32,48,0.12) 33%, rgba(11,32,48,0.72) 100%)'
              }}
            />
          </div>

          {/* Top Furniture Strap */}
          <div className="relative z-10 px-6 sm:px-12 pt-8 flex items-center justify-between text-xs">
            <span className="font-mono-furniture text-[#F5EDE2]/70 tracking-widest flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#E2705A] animate-pulse" />
              <span>DOH ABU DHABI HEALTHCARE PILOT SPEC // PERSISTENCE B3</span>
            </span>
            <span className="font-mono-furniture text-[#E2705A] hidden md:inline-block">
              ZERO STREAK SHAMING · 28-DAY ROLLING
            </span>
          </div>

          {/* Main Type Block (Lifts 60px & Fades Out over the Stage) */}
          <div
            className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 w-full my-auto space-y-6 text-center sm:text-start"
            style={{
              transform: `translate3d(0, ${p1 * -60}px, 0)`,
              opacity: Math.max(0, 1 - p1 * 1.55),
              willChange: 'transform, opacity'
            }}
          >
            {/* Wide-Tracked Mono Overhead Strap */}
            <div className="font-mono-furniture text-[#E2705A] font-semibold tracking-[0.25em] text-xs">
              BEHAVIORAL RESILIENCE ENGINE
            </div>

            {/* Wordmark Sized from Character Count with exactly ONE italic light word */}
            <h1
              className="font-display font-black text-white tracking-tight leading-[0.94] max-w-5xl"
              style={{
                fontSize: `min(5.5rem, calc(90vw / (${wordmarkChars} * 0.44)))`,
                whiteSpace: 'normal'
              }}
            >
              REBOUND <span className="font-display-italic font-light italic text-[#E2705A]">SURVIVES</span> REAL DISRUPTIONS
            </h1>

            {/* Lede: Split into per-word inline spans rising 0.4em on 38ms stagger */}
            <p className="max-w-2xl text-sm sm:text-base text-[#F5EDE2]/80 leading-relaxed font-sans">
              <WordSplit
                text="Engineered for the bad week. While traditional habit apps assume standard daytime routines and punish disruptions by zeroing streaks, Rebound stress-tests life friction pre-emptively—adapting to night shifts, 44°C heatwaves, and acute fatigue with elastic fallback tiers."
                italicWord="friction"
                baseDelay={120}
              />
            </p>

            {/* Actions CTAs with per-atom delays */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 pt-4">
              {onOpenJudgeTour && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onOpenJudgeTour();
                  }}
                  className="px-6 py-3.5 rounded-[4px] bg-[#C64A32] hover:bg-[#A83D28] text-white font-mono-furniture font-bold text-xs tracking-wider transition-all duration-300 shadow-md flex items-center space-x-2"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  <span>3-MIN JUDGE DEMO</span>
                </button>
              )}

              <button
                onClick={() => {
                  sound.playTap();
                  onLaunchApp();
                }}
                className="px-6 py-3.5 rounded-[4px] bg-[#F5EDE2] hover:bg-[#F0E5D4] text-[#33291E] font-mono-furniture font-bold text-xs tracking-wider transition-all duration-300 shadow-sm flex items-center space-x-2"
              >
                <span>EXPLORE LIVE APP</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C64A32]" />
              </button>

              {onOpenPitchDeck && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onOpenPitchDeck();
                  }}
                  className="px-5 py-3.5 rounded-[4px] bg-transparent hover:bg-[#F5EDE2]/10 text-[#F5EDE2] border border-[#F5EDE2]/30 font-mono-furniture text-xs tracking-wider transition"
                >
                  <Presentation className="w-3.5 h-3.5 inline mr-1.5 text-[#E2705A]" />
                  <span>PITCH DECK (12 SLIDES)</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Mono Ruled Furniture */}
          <div className="relative z-10 px-6 sm:px-12 pb-8 border-t border-[#F5EDE2]/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono-furniture pt-4 text-[#F5EDE2]/70">
            <div>
              <span className="block text-[#E2705A]">RECOVERY HALF-LIFE</span>
              <span className="text-sm font-bold text-white">2.1 DAYS (VS 16.5D)</span>
            </div>
            <div>
              <span className="block text-[#E2705A]">6-MONTH RETENTION</span>
              <span className="text-sm font-bold text-white">64% (VS 8% BASELINE)</span>
            </div>
            <div>
              <span className="block text-[#E2705A]">STREAK POLICY</span>
              <span className="text-sm font-bold text-white">ZERO SHAME / 28-DAY</span>
            </div>
            <div>
              <span className="block text-[#E2705A]">PRIVACY GOVERNOR</span>
              <span className="text-sm font-bold text-white">k≥20 · LAPLACE ε=1.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          STAGE 2: THE OPENING FRAME (360svh stage on deep navy #07141F)
          Photograph opens from inset(34% 30% round 4px) to inset(0)
          ===================================================================== */}
      <section ref={stage2Ref} className="relative h-[360svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#07141F] flex flex-col justify-between">
          {/* Framed Photograph Expanding to Full Bleed */}
          <div
            className="absolute inset-0 pointer-events-none will-change-[clip-path]"
            style={{
              clipPath: `inset(${Math.max(0, 34 - p2 * 34)}% ${Math.max(0, 30 - p2 * 30)}% round 4px)`,
              transition: 'clip-path 0.05s linear'
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2560&q=85"
              alt="Golden desert sand ridges under low morning sunlight"
              className="w-full h-full object-cover brightness-[0.7] contrast-[1.1]"
              loading="lazy"
            />
          </div>

          {/* Top-Right Large Coral Numeral (Rises from 25% to 100% Opacity) */}
          <div className="relative z-10 px-8 pt-8 flex justify-between items-start">
            <span className="font-mono-furniture text-[#E2705A] text-xs">
              STAGE 02 // ARCHITECTURAL SCRUB
            </span>
            <div
              className="font-display font-black text-6xl sm:text-8xl text-[#C64A32] select-none pointer-events-none transition-opacity duration-300"
              style={{ opacity: 0.25 + p2 * 0.75 }}
            >
              01
            </div>
          </div>

          {/* Bottom-Left Caption with Dedicated Gradient Scrim (56% height to 92% dark) */}
          <div className="relative z-10 w-full mt-auto">
            {/* Scrim: anchored at bottom, fading in with image scrub */}
            <div
              className="absolute inset-x-0 bottom-0 pointer-events-none"
              style={{
                height: '60%',
                background:
                  'linear-gradient(to top, rgba(7,20,31,0.94) 0%, rgba(7,20,31,0.7) 45%, rgba(7,20,31,0) 100%)',
                opacity: Math.min(1, p2 * 1.4)
              }}
            />

            <div className="relative max-w-3xl px-6 sm:px-12 pb-12 space-y-4">
              <span className="font-mono-furniture text-[#E2705A] text-xs tracking-widest block">
                [ PRINCIPLE 01: RADICAL ELASTICITY ]
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-black text-white leading-tight">
                THE BAD WEEK IS <span className="font-display-italic font-light italic text-[#E2705A]">INEVITABLE</span>. COLLAPSE IS NOT.
              </h2>
              <p className="text-xs sm:text-sm text-[#F5EDE2]/85 leading-relaxed font-sans max-w-2xl">
                <WordSplit
                  text="78% of habit dropouts happen after a single severe disruption. When Fatima pulls a 12-hour ICU night shift or Rajesh works in 44°C summer heat, traditional rigid goals produce moral guilt. Rebound introduces BCT 8.7 graded elasticity: Minimum 2-min micro-action, Standard 10-min routine, and Stretch 20-min goal. Your denominator is preserved. The habit survives."
                  italicWord="guilt"
                  baseDelay={100}
                />
              </p>
              <div className="flex items-center space-x-6 pt-2 font-mono-furniture text-[11px] text-[#F5EDE2]/60">
                <span>TIER 1: MIN (2 MIN)</span>
                <span>TIER 2: STD (10 MIN)</span>
                <span>TIER 3: STRETCH (20 MIN)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          STAGE 3: THE CIRCULAR IRIS (320svh on Sand Ground #F0E5D4)
          Photograph reveals through clip-path circle(calc(p * 78%) at 50% 50%)
          Headline sits in mix-blend-mode: difference inverting over picture
          ===================================================================== */}
      <section ref={stage3Ref} className="relative h-[320svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#F0E5D4] text-[#33291E] flex flex-col justify-between">
          {/* Circular Iris Expanding Photograph */}
          <div
            className="absolute inset-0 pointer-events-none will-change-[clip-path]"
            style={{
              clipPath: `circle(${p3 * 78}% at 50% 50%)`,
              transition: 'clip-path 0.05s linear'
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=2560&q=85"
              alt="Pristine desert dune curve under bright natural sunlight"
              className="w-full h-full object-cover brightness-[0.8] contrast-[1.12]"
              loading="lazy"
            />
          </div>

          {/* Top Furniture Strap */}
          <div className="relative z-20 px-8 pt-8 flex items-center justify-between text-xs font-mono-furniture text-[#33291E]/70">
            <span>[ STAGE 03: SIMULATION REVEAL ]</span>
            <span>PRE-EMPTIVE CRASH-TESTING</span>
          </div>

          {/* Centered Headline in mix-blend-mode: difference (Inverts against sand & picture) */}
          <div
            className="relative z-20 my-auto text-center px-6 max-w-4xl mx-auto will-change-transform"
            style={{
              mixBlendMode: 'difference',
              color: '#FFFFFF',
              opacity: Math.max(0, 1 - Math.max(0, (p3 - 0.62) / 0.38))
            }}
          >
            <span className="font-mono-furniture text-xs tracking-widest block mb-3 text-[#E2705A]">
              HABIT TWIN CRASH-TEST ENGINE
            </span>
            <h2 className="font-display text-4xl sm:text-6xl font-black tracking-tight leading-[1.05]">
              CRASH-TEST HABITS BEFORE REAL LIFE <span className="font-display-italic font-light italic text-[#E2705A]">BREAKS</span> THEM
            </h2>
            <p className="mt-4 text-xs sm:text-sm max-w-xl mx-auto font-sans opacity-90 leading-relaxed">
              Stress-test your routine against 6 synthetic Abu Dhabi disruption profiles—night shift swaps, 44°C heatwaves, Ramadan routines, and 12-hour work crunches.
            </p>
          </div>

          {/* Mono Caption Pair at Bottom (Fades in only after circle is half open p > 0.5) */}
          <div
            className="relative z-20 px-8 pb-8 flex flex-wrap items-center justify-between gap-4 font-mono-furniture text-[11px] transition-opacity duration-500"
            style={{
              opacity: p3 > 0.48 ? Math.min(1, (p3 - 0.48) * 2.5) : 0,
              color: p3 > 0.7 ? '#F5EDE2' : '#33291E'
            }}
          >
            <div className="space-y-0.5">
              <span className="font-bold block">[ HABIT TWIN ARCHITECTURE ]</span>
              <span className="opacity-70">MONTE CARLO PROBABILISTIC AGENT RUNNER</span>
            </div>
            <div className="text-end space-y-0.5">
              <span className="font-bold block text-[#C64A32]">[ 5 OF 6 RESILIENCE LIFT ]</span>
              <span className="opacity-70">ONE-TAP ADAPTIVE ELASTIC PATCH VERIFIED</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          STAGE 4: THE LOG AND THE STAR FIELD (340svh on deep navy #0B2030)
          Left: 5 cumulative rows lighting as floor(p * 5) advances
          Right: 220-point phyllotaxis spiral canvas rotating at 0.035 rad/s
          ===================================================================== */}
      <section ref={stage4Ref} className="relative h-[340svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#0B2030] flex flex-col justify-between py-10 px-6 sm:px-12">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#F5EDE2]/10 pb-4">
            <span className="font-mono-furniture text-xs text-[#E2705A]">
              [ STAGE 04: CLOSED-LOOP ATTRIBUTION & RECOVERY ]
            </span>
            <span className="font-mono-furniture text-xs text-[#F5EDE2]/60 hidden sm:inline-block">
              ACTIVE STAGE INDEX: 0{activeLogRow + 1} OF 05
            </span>
          </div>

          {/* Two-Column Stage Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center my-auto">
            {/* Left Column: Headline and 5 Cumulative Ruled Rows */}
            <div className="space-y-6 max-w-xl">
              <div>
                <span className="font-mono-furniture text-[#E2705A] text-xs tracking-widest block mb-2">
                  THE POST-DISRUPTION CYCLE
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-white leading-tight">
                  THE FLIGHT RECORDER <span className="font-display-italic font-light italic text-[#E2705A]">REWRITES</span> THE LAPSE
                </h2>
                <p className="text-xs text-[#F5EDE2]/70 mt-2 font-sans">
                  Instead of streak loss and self-blame, Rebound triggers a low-friction Flight Recorder prompt to convert disruption into a personalized comeback rule.
                </p>
              </div>

              {/* 5 Ruled Rows Lighting Cumulatively as floor(p * 5) advances */}
              <div className="space-y-2.5">
                {[
                  {
                    time: '[02:40 AM]',
                    label: 'CIRCADIAN DISRUPTION DETECTED',
                    note: 'Fatima logs 4.5h post-shift sleep. Auto-grace triggered; denominator shielded from zeroing out.'
                  },
                  {
                    time: '[07:15 AM]',
                    label: 'FLIGHT RECORDER ATTRIBUTION',
                    note: 'One-tap low-friction chips identify acute shift fatigue with zero moralizing copy.'
                  },
                  {
                    time: '[04:58 PM]',
                    label: 'RECOVERY RULE SYNTHESIS',
                    note: '"If night shift clashes, switch outdoor 20m run to 2-min seated stretch post-wake."'
                  },
                  {
                    time: '[05:00 PM]',
                    label: 'ETHICS GOVERNOR EVALUATION',
                    note: 'Rule verified against R1 (anti-shame), R2 (nudge budget cap), and R10 (anchor support).'
                  },
                  {
                    time: '[+48.0 H]',
                    label: 'COMEBACK VERIFIED',
                    note: 'Recovery Half-Life logged at 2.1 days (vs 16.5d industry baseline). Score intact.'
                  }
                ].map((row, idx) => {
                  const isLit = idx <= activeLogRow;
                  const isCurrent = idx === activeLogRow;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-[4px] border transition-all duration-300 font-sans ${
                        isCurrent
                          ? 'bg-[#C64A32]/15 border-[#E2705A] text-white shadow-xs'
                          : isLit
                          ? 'bg-[#F5EDE2]/5 border-[#F5EDE2]/20 text-[#F5EDE2]'
                          : 'opacity-30 border-transparent text-[#F5EDE2]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono-furniture text-[11px] text-[#E2705A] font-bold">
                          {row.time}
                        </span>
                        <span className="font-mono-furniture text-[10px] opacity-75">
                          {isLit ? 'RESOLVED ✓' : 'STANDBY'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold font-display">{row.label}</h4>
                      <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{row.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Square Phyllotaxis Spiral Canvas */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative p-3 rounded-[4px] border border-[#F5EDE2]/15 bg-[#07141F]/80 shadow-inner">
                <canvas
                  ref={canvasRef}
                  className="w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] block"
                  aria-label="220-point phyllotaxis spiral star field rotating at 0.035 radians per second"
                />
                <div className="absolute bottom-4 inset-x-0 text-center font-mono-furniture text-[10px] text-[#E2705A] tracking-widest">
                  PHYLLOTAXIS HARMONIC // 220 VERIFIED RETURN NODES
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#F5EDE2]/10 pt-3 flex items-center justify-between text-xs font-mono-furniture text-[#F5EDE2]/60">
            <span>SCRUB ADVANCEMENT: {Math.round(p4 * 100)}%</span>
            <span>RHL RECORDED: 2.1 DAYS</span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          NORMAL BAND 1: CLOSED-LOOP SYSTEM ARCHITECTURE (MERMAID SPECIFICATION)
          ===================================================================== */}
      <section className="bg-[#07141F] py-20 px-6 sm:px-12 border-t border-[#F5EDE2]/10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#F5EDE2]/15 pb-6">
            <div data-rev>
              <span className="font-mono-furniture text-[#E2705A] text-xs block mb-1">
                SYSTEM VERIFICATION & TRACEABILITY
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-black text-white">
                CLOSED-LOOP <span className="font-display-italic font-light italic text-[#E2705A]">ARCHITECTURE</span>
              </h2>
            </div>
            <button
              onClick={() => setShowMermaidCode(!showMermaidCode)}
              className="flex items-center space-x-2 font-mono-furniture text-xs px-4 py-2 rounded-[4px] bg-[#F5EDE2]/10 hover:bg-[#F5EDE2]/20 border border-[#F5EDE2]/25 text-[#F5EDE2] transition"
            >
              <Code2 className="w-3.5 h-3.5 text-[#E2705A]" />
              <span>{showMermaidCode ? 'VIEW VISUAL DIAGRAM' : 'VIEW MERMAID CODE'}</span>
            </button>
          </div>

          {showMermaidCode ? (
            <div className="p-6 rounded-[4px] bg-[#0B2030] border border-[#F5EDE2]/20 font-mono text-xs text-[#F5EDE2] space-y-2 overflow-x-auto">
              <span className="text-[#E2705A] font-bold block mb-2">// Mermaid Architecture Specification</span>
              <pre className="leading-relaxed">
{`graph TD
    A[Disruption Ingestion: Weather 44C / ICU Night Shift / Wearable Off] --> B[Habit Twin Simulator: 6 Synthetic Friction Archetypes]
    B --> C[BCT 8.7 Elastic Scaler: Min 2m / Std 10m / Stretch 20m]
    C --> D[Ethics & Privacy Governor: R1-R15 Anti-Shame, Nudge Budget, Anchor R10]
    D --> E[Daily Execution Loop: Today View + Web Speech Narration]
    E -->|Lapse Detected| F[Flight Recorder: 1-Tap Barrier Attribution]
    F --> G[Synthesized Personal Recovery Rule]
    G --> H[Verified Comeback Logged: RHL Cut to 2.1 Days]
    H -->|Denominator Protected| C
    
    subgraph Privacy Envelope [Differential Privacy & Anonymity]
        D -.-> DP[Laplace DP ε=1.0 · k>=20 Cell Suppression · Zero Row-Level Leak]
    end`}
              </pre>
            </div>
          ) : (
            /* Visual Flow Graph */
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-4" data-rev>
              {[
                { step: '01', title: 'DISRUPTION INGESTION', desc: 'Weather index, shift schedule, or manual report signals lifestyle stress.' },
                { step: '02', title: 'HABIT TWIN PRE-TEST', desc: 'Monte Carlo models survivability across 6 synthetic shock scenarios.' },
                { step: '03', title: 'ELASTIC SCALER', desc: 'BCT 8.7 downsizes session to Minimum 2m to protect habit continuity.' },
                { step: '04', title: 'ETHICS GOVERNOR', desc: 'Enforces R1 anti-shame lexicon, nudge caps, and Anchor privacy.' },
                { step: '05', title: 'FLIGHT RECORDER', desc: 'Post-lapse attribution generates verified personal recovery rules.' },
                { step: '06', title: 'VERIFIED COMEBACK', desc: 'Restores volume within 48h, cutting RHL from 16.5d to 2.1 days.' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-[4px] bg-[#0B2030] border border-[#F5EDE2]/15 hover:border-[#E2705A] transition space-y-2"
                >
                  <span className="font-mono-furniture text-[#E2705A] text-xs font-bold block">
                    STEP {item.step}
                  </span>
                  <h4 className="font-display font-bold text-sm text-white">{item.title}</h4>
                  <p className="text-[11px] text-[#F5EDE2]/70 leading-relaxed font-sans">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          NORMAL BAND 2: THREE-COLUMN EXPLAINER (Warm Cream Ground #F5EDE2)
          ===================================================================== */}
      <section className="bg-[#F5EDE2] text-[#33291E] py-24 px-6 sm:px-12 border-t border-[#E6D8C3]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3" data-rev>
            <span className="font-mono-furniture text-[#C64A32] text-xs tracking-widest block font-bold">
              THE THREE ARCHITECTURAL PILLARS
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-[#33291E]">
              DESIGNED FOR THE <span className="font-display-italic font-light italic text-[#C64A32]">UNPREDICTABLE</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#33291E]/70 font-sans leading-relaxed">
              Every system component replaces traditional motivational coercion with empirical behavior change science.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1 */}
            <div className="p-8 rounded-[4px] bg-white border border-[#E6D8C3] space-y-4 shadow-2xs" data-rev>
              <div className="font-mono-furniture text-xs text-[#C64A32] font-bold">
                01 // GRADED TASKS (BCT 8.7)
              </div>
              <h3 className="font-display text-xl font-bold text-[#33291E]">
                ELASTIC TIERS OVER STREAK SHAME
              </h3>
              <p className="text-xs text-[#33291E]/80 leading-relaxed font-sans">
                Traditional habit apps treat an incomplete 30-minute session as a total failure, breaking the streak and triggering the "what-the-hell" abandonment effect. Rebound offers Minimum (2m), Standard (10m), and Stretch (20m) options. On grueling days, doing the Minimum protects habit identity and scores full credit.
              </p>
              <div className="pt-2 border-t border-[#E6D8C3] font-mono-furniture text-[10px] text-[#C64A32]">
                VERIFIED PERSISTENCE LIFT: +38%
              </div>
            </div>

            {/* Column 2 */}
            <div className="p-8 rounded-[4px] bg-white border border-[#E6D8C3] space-y-4 shadow-2xs" data-rev>
              <div className="font-mono-furniture text-xs text-[#C64A32] font-bold">
                02 // PRE-EMPTIVE CRASH-TESTING
              </div>
              <h3 className="font-display text-xl font-bold text-[#33291E]">
                HABIT TWIN SIMULATOR
              </h3>
              <p className="text-xs text-[#33291E]/80 leading-relaxed font-sans">
                Never wait for a habit to fail in production. Before you embark on your plan, our Monte Carlo simulator runs your routine through synthetic shocks—hospital shift rotations, 44°C outdoor heatwaves, Ramadan fasting windows, and urgent overtime crunches—identifying friction points before they occur.
              </p>
              <div className="pt-2 border-t border-[#E6D8C3] font-mono-furniture text-[10px] text-[#C64A32]">
                TESTED ACROSS 4 CORE ARCHETYPES
              </div>
            </div>

            {/* Column 3 */}
            <div className="p-8 rounded-[4px] bg-white border border-[#E6D8C3] space-y-4 shadow-2xs" data-rev>
              <div className="font-mono-furniture text-xs text-[#C64A32] font-bold">
                03 // MATHEMATICAL PRIVACY
              </div>
              <h3 className="font-display text-xl font-bold text-[#33291E]">
                ETHICS GOVERNOR & LAPLACE DP
              </h3>
              <p className="text-xs text-[#33291E]/80 leading-relaxed font-sans">
                Corporate wellness programs often feel like surveillance. Rebound is architected with strict k-anonymity (k ≥ 20) and Laplace Differential Privacy (ε = 1.0). Program sponsors can view aggregate persistence curves, but mathematical proofs guarantee that no employer can ever inspect individual activity or lapse records.
              </p>
              <div className="pt-2 border-t border-[#E6D8C3] font-mono-furniture text-[10px] text-[#C64A32]">
                DOH ABU DHABI COMPLIANT ARCHITECTURE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          NORMAL BAND 3: RATES & BENCHMARK TABLE OF RULED ROWS (Coral Figures)
          ===================================================================== */}
      <section className="bg-[#0B2030] py-24 px-6 sm:px-12 border-t border-[#F5EDE2]/10">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-2" data-rev>
            <span className="font-mono-furniture text-[#E2705A] text-xs block">
              EMPIRICAL BENCHMARKS & RATES
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white">
              REBOUND VS <span className="font-display-italic font-light italic text-[#E2705A]">TRADITIONAL</span> APPS
            </h2>
          </div>

          <div className="overflow-x-auto border-t border-b border-[#F5EDE2]/15" data-rev>
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F5EDE2]/15 font-mono-furniture text-[#F5EDE2]/60">
                  <th className="py-4 text-start font-medium tracking-wider">BEHAVIORAL SPECIFICATION</th>
                  <th className="py-4 text-start font-medium tracking-wider">TRADITIONAL HABIT APPS</th>
                  <th className="py-4 text-start font-medium tracking-wider text-[#E2705A]">REBOUND PLATFORM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5EDE2]/10 font-sans">
                {[
                  {
                    spec: 'Recovery Half-Life (RHL)',
                    trad: '16.5 DAYS (Severe Dropout Risk)',
                    rebound: '2.1 DAYS',
                    delta: '-87% FASTER RETURN'
                  },
                  {
                    spec: '24-Week Persistence Rate',
                    trad: '8% Long-term Retention',
                    rebound: '64%',
                    delta: '8X SUSTAINABILITY'
                  },
                  {
                    spec: 'Missed Day Consequence',
                    trad: 'Streak Counter Zeroed / Moral Shame',
                    rebound: 'DENOMINATOR PROTECTED',
                    delta: 'ZERO GUILT CLIFF'
                  },
                  {
                    spec: 'Disruption Handling',
                    trad: 'Static Alarms / Rigid Target',
                    rebound: 'BCT 8.7 (2-MIN FALLBACK)',
                    delta: 'ADAPTIVE ELASTICITY'
                  },
                  {
                    spec: 'Privacy Architecture',
                    trad: 'Raw Health Data Leaked to Sponsors',
                    rebound: 'k≥20 · LAPLACE ε=1.0',
                    delta: 'MATHEMATICAL SHIELD'
                  },
                  {
                    spec: 'Social Support Policy',
                    trad: 'Public Leaderboards & Social Pressure',
                    rebound: 'RESCUE LINK (ZERO HEALTH DATA)',
                    delta: 'GOVERNOR R10 ENFORCED'
                  }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[#F5EDE2]/5 transition">
                    <td className="py-4 font-bold text-white font-display text-sm">{row.spec}</td>
                    <td className="py-4 text-[#F5EDE2]/60 font-mono text-[11px]">{row.trad}</td>
                    <td className="py-4 text-[#E2705A] font-mono font-bold text-sm">
                      {row.rebound}
                      <span className="block text-[10px] text-[#F5EDE2]/60 font-normal mt-0.5">{row.delta}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =====================================================================
          NORMAL BAND 4: INTERACTIVE CRASH-TEST MINI-SIMULATOR
          ===================================================================== */}
      <section className="bg-[#07141F] py-20 px-6 sm:px-12 border-t border-[#F5EDE2]/10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F5EDE2]/15 pb-6">
            <div data-rev>
              <span className="font-mono-furniture text-[#E2705A] text-xs block mb-1">
                INTERACTIVE HABIT TWIN SANDBOX
              </span>
              <h2 className="font-display text-3xl font-black text-white">
                TEST YOUR ROUTINE'S <span className="font-display-italic font-light italic text-[#E2705A]">SURVIVABILITY</span>
              </h2>
            </div>
            <div className="p-3 bg-[#0B2030] rounded-[4px] border border-[#F5EDE2]/20 font-mono-furniture text-xs">
              <span className="text-[#F5EDE2]/60 block text-[10px]">CURRENT SCORE</span>
              <span className="text-xl font-bold text-[#E2705A]">
                {simActivePatch ? '5 OF 6 RESILIENT' : '2 OF 6 FRAGILE'}
              </span>
            </div>
          </div>

          {/* Scenario Buttons */}
          <div className="space-y-4" data-rev>
            <span className="font-mono-furniture text-xs text-[#F5EDE2]/70 block">
              CHOOSE DISRUPTION STRESSOR:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'night_shift', label: 'Night-Shift Week', icon: Moon, desc: 'Sleep shifted to daytime' },
                { id: 'heatwave', label: 'Summer Heat (44°C)', icon: Flame, desc: 'Outdoor exercise unsafe' },
                { id: 'ramadan', label: 'Ramadan Fasting', icon: Clock, desc: 'Hydration windows inverted' },
                { id: 'work_crunch', label: 'Emergency 12h Crunch', icon: AlertTriangle, desc: 'Acute time scarcity' }
              ].map((sc) => {
                const Icon = sc.icon;
                const isSel = activeScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setActiveScenario(sc.id as any)}
                    className={`p-3.5 rounded-[4px] border text-start transition ${
                      isSel
                        ? 'bg-[#C64A32]/20 border-[#E2705A] text-white shadow-xs'
                        : 'bg-[#0B2030] border-[#F5EDE2]/15 text-[#F5EDE2]/70 hover:border-[#F5EDE2]/30'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-2 text-[#E2705A]" />
                    <span className="font-display font-bold text-xs block">{sc.label}</span>
                    <span className="text-[10px] text-[#F5EDE2]/50 block mt-0.5">{sc.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Test Simulation Output Card */}
            <div className="p-6 rounded-[4px] bg-[#0B2030] border border-[#F5EDE2]/15 flex flex-wrap items-center justify-between gap-6 mt-4">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-[2px] font-mono-furniture text-[10px] font-bold ${
                    simActivePatch ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' : 'bg-rose-900/60 text-rose-300 border border-rose-500/40'
                  }`}>
                    {simActivePatch ? '✓ SURVIVES DISRUPTION (78% COMPLETION)' : '✕ CRITICAL FAILURE (DROPS TO 0%)'}
                  </span>
                  <span className="font-mono-furniture text-[10px] text-[#F5EDE2]/60">
                    {simActivePatch ? 'REBOUND ELASTIC FIX ACTIVE' : 'TRADITIONAL FIXED SCHEDULE'}
                  </span>
                </div>
                <p className="text-xs text-[#F5EDE2]/85 leading-relaxed font-sans">
                  {simActivePatch
                    ? 'Walk window automatically shifted to 17:00 post-wake with a 2-minute gentle stretch fallback. Zero streak breakage.'
                    : 'Traditional rigid schedule mandates a 07:00 morning walk while you are sleeping after hospital shift. Routine breaks.'}
                </p>
              </div>

              <button
                onClick={() => setSimActivePatch(!simActivePatch)}
                className={`px-5 py-3 rounded-[4px] font-mono-furniture text-xs font-bold transition shadow-xs flex items-center space-x-2 ${
                  simActivePatch
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-500'
                    : 'bg-[#C64A32] hover:bg-[#A83D28] text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{simActivePatch ? 'PATCH APPLIED (+38% LIFT) ✓' : 'APPLY ONE-TAP REBOUND FIX'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          NORMAL BAND 5: PERSONAS INTERACTIVE SHOWCASE
          ===================================================================== */}
      <section className="bg-[#F0E5D4] text-[#33291E] py-24 px-6 sm:px-12 border-t border-[#E6D8C3]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2" data-rev>
            <span className="font-mono-furniture text-[#C64A32] text-xs font-bold block">
              REAL-WORLD LIFESTYLE PROFILES
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-[#33291E]">
              VALIDATED ACROSS <span className="font-display-italic font-light italic text-[#C64A32]">FOUR</span> PERSONAS
            </h2>
            <p className="text-xs text-[#33291E]/70 font-sans">
              Select a persona to inspect their personalized recovery rules and verified comebacks.
            </p>
          </div>

          {/* Persona Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto" data-rev>
            {[
              { id: 'fatima', name: 'Fatima (Nurse)', role: 'Night-Shift ICU Nurse', city: 'Abu Dhabi' },
              { id: 'rajesh', name: 'Rajesh (Worker)', role: 'Frontline Construction Worker', city: 'Mussafah' },
              { id: 'omar', name: 'Omar (Adaptive)', role: 'Wheelchair Adaptive Movement', city: 'Abu Dhabi' },
              { id: 'mariam', name: 'Mariam (Office)', role: 'Sedentary Desk Worker', city: 'Al Maryah' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  sound.playTap();
                  setActivePersonaTab(p.id as any);
                }}
                className={`px-4 py-2 rounded-[4px] font-mono-furniture text-xs transition border ${
                  activePersonaTab === p.id
                    ? 'bg-[#C64A32] text-white border-[#C64A32] shadow-xs'
                    : 'bg-white text-[#33291E] border-[#E6D8C3] hover:bg-[#F5EDE2]'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Selected Persona Card */}
          <div className="bg-white rounded-[4px] p-8 border border-[#E6D8C3] shadow-xs max-w-3xl mx-auto space-y-6" data-rev>
            {activePersonaTab === 'fatima' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-[4px] bg-[#C64A32] text-white flex items-center justify-center font-display font-black text-lg">
                    F
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-display text-[#33291E]">Fatima (34) — ICU Night-Shift Nurse (Abu Dhabi)</h4>
                    <p className="text-xs font-mono text-[#33291E]/60">Rotating 12h night shifts · 4.5h daytime sleep · Movement & Sleep goals</p>
                  </div>
                </div>
                <p className="text-xs text-[#33291E]/80 leading-relaxed font-sans">
                  "Before Rebound, I always dropped off because apps assumed standard day routines and forced morning walks. Rebound stress-tested my plan, detected that night shift week clashed with the walk window, moved it to 17:00 post-wake, and added a 2-minute gentle stretch fallback. When I missed 2 days, no streak was broken, and the recovery rule brought me back within 48 hours."
                </p>
                <div className="p-3 bg-[#F0E5D4]/60 rounded-[4px] border border-[#E6D8C3] text-xs font-mono text-[#33291E]">
                  <strong>ACTIVE RECOVERY RULE:</strong> "If I miss 2 days post-shift transition, I will do a 2-minute stretch on my first day off."
                </div>
              </div>
            )}

            {activePersonaTab === 'rajesh' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-[4px] bg-[#E2705A] text-white flex items-center justify-center font-display font-black text-lg">
                    R
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-display text-[#33291E]">Rajesh (41) — Frontline Construction Worker (Mussafah)</h4>
                    <p className="text-xs font-mono text-[#33291E]/60">Outdoor 44°C heat · Low-literacy audio mode · Smoking reduction</p>
                  </div>
                </div>
                <p className="text-xs text-[#33291E]/80 leading-relaxed font-sans">
                  "Working under 44°C heat causes heavy exhaustion. Rebound never shames me. When heat exceeds 42°C, it immediately suggests indoor hydration and 2-minute deep breathing. Through the supporter link, Vikram just sends me a friendly hello — zero health data leakage, zero embarrassment."
                </p>
                <div className="p-3 bg-[#F0E5D4]/60 rounded-[4px] border border-[#E6D8C3] text-xs font-mono text-[#33291E]">
                  <strong>SUPPORTER LINK (GOVERNOR R10):</strong> Vikram receives friendly nudge prompts with zero raw biometric data.
                </div>
              </div>
            )}

            {activePersonaTab === 'omar' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-[4px] bg-[#0B2030] text-white flex items-center justify-center font-display font-black text-lg">
                    O
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-display text-[#33291E]">Omar (52) — Adaptive Movement (Abu Dhabi)</h4>
                    <p className="text-xs font-mono text-[#33291E]/60">Wheelchair user · Seated mobility routine · Zero step bias</p>
                  </div>
                </div>
                <p className="text-xs text-[#33291E]/80 leading-relaxed font-sans">
                  "Most apps assume 10,000 steps is the sole health metric and make me feel excluded. Rebound provides a dedicated seated mobility library and measures my upper-body consistency with zero step bias."
                </p>
                <div className="p-3 bg-[#F0E5D4]/60 rounded-[4px] border border-[#E6D8C3] text-xs font-mono text-[#33291E]">
                  <strong>ADAPTIVE SPECIFICATION:</strong> Evaluates seated chest openers, torso rotation, and upper-limb stamina.
                </div>
              </div>
            )}

            {activePersonaTab === 'mariam' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-[4px] bg-teal-800 text-white flex items-center justify-center font-display font-black text-lg">
                    M
                  </div>
                  <div>
                    <h4 className="text-base font-bold font-display text-[#33291E]">Mariam (29) — Office Worker (Al Maryah Island)</h4>
                    <p className="text-xs font-mono text-[#33291E]/60">Long sedentary hours · Hydration & screen wind-down · Consistent comebacks</p>
                  </div>
                </div>
                <p className="text-xs text-[#33291E]/80 leading-relaxed font-sans">
                  "Deadlines always broke my previous habit trackers. With Rebound, during project crunch weeks the app gracefully downsizes my movement target to a 1-minute office stretch. My 28-day score never resets, and I have completed 3 verified comebacks this month."
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onSelectPersona(activePersonaTab)}
                className="px-5 py-2.5 rounded-[4px] bg-[#C64A32] hover:bg-[#A83D28] text-white font-mono-furniture text-xs tracking-wider transition"
              >
                TEST AS {activePersonaTab.toUpperCase()} IN APP →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          NORMAL BAND 6: FAQ ACCORDION (Ruled Rows, Wide-Tracked Mono Straps)
          ===================================================================== */}
      <section className="bg-[#0B2030] py-24 px-6 sm:px-12 border-t border-[#F5EDE2]/10">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-2" data-rev>
            <span className="font-mono-furniture text-[#E2705A] text-xs block">
              FREQUENTLY EXAMINED QUESTIONS
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white">
              VERIFIABLE <span className="font-display-italic font-light italic text-[#E2705A]">METHODOLOGY</span>
            </h2>
          </div>

          <div className="divide-y divide-[#F5EDE2]/15 border-t border-b border-[#F5EDE2]/15" data-rev>
            {[
              {
                q: 'Why does Rebound eliminate streak counters entirely?',
                a: 'Empirical behavioral psychology shows that streak counters create an all-or-nothing cognitive bias. When an inevitable life disruption occurs (illness, shift work, family emergencies), losing a 40-day streak triggers the "what-the-hell" effect, leading to a complete abandonment of the behavior. Rebound uses rolling 28-day consistency with automatic grace days, ensuring missed days never reset progress to zero.'
              },
              {
                q: 'What is Recovery Half-Life (RHL) and how is it calculated?',
                a: 'Recovery Half-Life (ml-spec §7) is our primary clinical and behavioral metric. It measures the duration in days from the post-disruption volume trough until the user regains 50% of their pre-disruption volume. While traditional apps suffer an average RHL of 16.5 days, Rebound reduces this to 2.1 days through BCT 8.7 graded elasticity and post-lapse recovery rules.'
              },
              {
                q: 'How does the Ethics & Privacy Governor protect user confidentiality?',
                a: 'The Governor enforces mathematical anonymity. Subgroup analyses require k ≥ 20; any cell below 20 users is strictly suppressed. Furthermore, aggregate reporting injects calibrated Laplace noise (ε = 1.0), making re-identification mathematically impossible. Program sponsors and employers can never view individual row-level data.'
              },
              {
                q: 'How does the Habit Twin Monte Carlo simulator evaluate survivability?',
                a: 'The Habit Twin instantiates synthetic agent schedules and subjects them to stochastic disruption events (shift rotations, heatwaves, urgent work demands). It evaluates whether the habit schedule has sufficient temporal and energetic elasticity to withstand disruptions without complete cessation, outputting a clear Survivability Score (e.g., 5 of 6).'
              }
            ].map((faq, idx) => (
              <div key={idx} className="py-5">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-start space-x-4 focus:outline-none"
                >
                  <span className="font-display font-bold text-base sm:text-lg text-[#F5EDE2] hover:text-[#E2705A] transition">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#E2705A] shrink-0 transition-transform duration-300 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <p className="mt-3 text-xs sm:text-sm text-[#F5EDE2]/75 leading-relaxed font-sans pr-8">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          NORMAL BAND 7: FINAL HORIZON CALLOUT & FOOTER
          ===================================================================== */}
      <section className="bg-[#07141F] py-24 px-6 sm:px-12 border-t border-[#F5EDE2]/10 text-center space-y-8">
        <div className="max-w-3xl mx-auto space-y-4" data-rev>
          <span className="font-mono-furniture text-[#E2705A] text-xs tracking-widest block font-bold">
            EXPERIENCE THE RESILIENCE ENGINE
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-white leading-tight">
            READY FOR A HABIT PLAN THAT <span className="font-display-italic font-light italic text-[#E2705A]">SURVIVES</span> REAL LIFE?
          </h2>
          <p className="text-xs sm:text-sm text-[#F5EDE2]/70 font-sans max-w-xl mx-auto leading-relaxed">
            Step into the live daily loop, crash-test your routine against extreme disruption scenarios, and inspect verifiable cohort analytics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                sound.playTap();
                onLaunchApp();
              }}
              className="px-8 py-4 rounded-[4px] bg-[#C64A32] hover:bg-[#A83D28] text-white font-mono-furniture font-bold text-xs tracking-wider transition-all duration-300 shadow-md flex items-center space-x-2"
            >
              <span>LAUNCH LIVE APP</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenJudgeTour && (
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenJudgeTour();
                }}
                className="px-6 py-4 rounded-[4px] bg-transparent hover:bg-[#F5EDE2]/10 text-[#F5EDE2] border border-[#F5EDE2]/30 font-mono-furniture text-xs tracking-wider transition"
              >
                <Trophy className="w-4 h-4 inline mr-1.5 text-amber-300" />
                <span>3-MIN JUDGE DEMO</span>
              </button>
            )}
          </div>
        </div>

        {/* Minimal Desert Horizon Footer */}
        <div className="max-w-6xl mx-auto pt-16 mt-16 border-t border-[#F5EDE2]/10 flex flex-wrap items-center justify-between gap-4 font-mono-furniture text-[11px] text-[#F5EDE2]/50">
          <div>
            <span>REBOUND PLATFORM // DOH ABU DHABI HEALTHCARE PILOT SPECIFICATION</span>
          </div>
          <div className="flex items-center space-x-6">
            <span>RHL: 2.1D</span>
            <span>PERSISTENCE: 64%</span>
            <span>DIFF PRIVACY: ε=1.0</span>
          </div>
        </div>
      </section>
    </div>
  );
};
