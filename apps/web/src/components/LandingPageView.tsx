import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Locale } from '../i18n/translations';
import { 
  ArrowRight, ShieldCheck, Trophy, Presentation, CheckCircle2, 
  Sparkles, Moon, Flame, Clock, AlertTriangle, Code2
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
// WordSplit: Helper to split text into per-word inline-block spans rising 0.38em
// on a 38ms stagger, with optional italic ice-blue clause.
// -----------------------------------------------------------------------------
interface WordSplitProps {
  text: string;
  italicPhrase?: string;
  baseDelay?: number;
  step?: number;
  className?: string;
}

const WordSplit: React.FC<WordSplitProps> = ({
  text,
  italicPhrase,
  baseDelay = 0,
  step = 38,
  className = ''
}) => {
  const words = useMemo(() => text.split(/\s+/), [text]);
  const italicWords = useMemo(
    () => (italicPhrase ? italicPhrase.toLowerCase().split(/\s+/) : []),
    [italicPhrase]
  );

  return (
    <span className={`inline ${className}`}>
      {words.map((word, idx) => {
        const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/gi, '');
        const isItalic = italicWords.some((iw) => iw.replace(/[^a-z0-9]/gi, '') === cleanWord);
        const delay = baseDelay + idx * step;

        return (
          <span
            key={idx}
            className={`word-atom ${isItalic ? 'font-serif italic text-[#B9E5F3]' : ''}`}
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
  // Pinned stage progress states (0 to 1) throttled via rAF
  const [p1, setP1] = useState(0); // Stage 1: Serif Hero
  const [p2, setP2] = useState(0); // Stage 2: Horizontal Catalogue Rail
  const [p3, setP3] = useState(0); // Stage 3: Process with Redrawn Diagram
  const [p4, setP4] = useState(0); // Stage 4: Parallax Plate Closing Statement

  // Stage container refs
  const stage1Ref = useRef<HTMLDivElement>(null);
  const stage2Ref = useRef<HTMLDivElement>(null);
  const stage3Ref = useRef<HTMLDivElement>(null);
  const stage4Ref = useRef<HTMLDivElement>(null);

  // Canvas refs
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);
  const processCanvasRef = useRef<HTMLCanvasElement>(null);
  const closingCanvasRef = useRef<HTMLCanvasElement>(null);

  // Horizontal rail track ref
  const railTrackRef = useRef<HTMLDivElement>(null);
  const railInnerWidth = useRef(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Interactive Persona state
  const [activePersonaTab, setActivePersonaTab] = useState<'fatima' | 'rajesh' | 'omar' | 'mariam'>('fatima');

  // Interactive Mini-Simulator state
  const [simActivePatch, setSimActivePatch] = useState(false);
  const [activeScenario, setActiveScenario] = useState<'night_shift' | 'heatwave' | 'ramadan' | 'work_crunch'>('night_shift');

  // Current active step index in Stage 3 (0 to 3)
  const activeProcessStep = Math.min(3, Math.floor(p3 * 4));

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

          // Write CSS custom properties on root
          document.documentElement.style.setProperty('--hero-y', `${newP1 * -70}px`);
          document.documentElement.style.setProperty('--hero-scale', `${1.0 - newP1 * 0.18}`);
          document.documentElement.style.setProperty('--hero-alpha', `${Math.max(0, 1.0 - newP1 * 1.6)}`);
          document.documentElement.style.setProperty('--hero-vignette', `${0.35 + newP1 * 0.6}`);

          ticking = false;
        });
        ticking = true;
      }
    };

    const handleResize = () => {
      railInnerWidth.current = window.innerWidth;
      handleScroll();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
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
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ---------------------------------------------------------------------------
  // 3. Stage 1: 46 Drifting Wood-Grain Contour Lines Canvas (Every 9th in Ice)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const render = (now: number) => {
      const w = (canvas.width = window.innerWidth);
      const h = (canvas.height = window.innerHeight);
      const t = (now - startTime) / 1000;

      ctx.clearRect(0, 0, w, h);

      const totalLines = 46;
      const spacing = h / (totalLines + 2);

      for (let i = 0; i < totalLines; i++) {
        const isIce = i % 9 === 0;
        const baseY = (i + 1.5) * spacing;

        ctx.beginPath();
        for (let x = 0; x <= w; x += 12) {
          const s1 = Math.sin(x * 0.0035 + t * 0.4 + i * 0.28) * 14;
          const s2 = Math.sin(x * 0.0012 + t * 0.18 + i * 0.15) * 8;
          const y = baseY + s1 + s2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        if (isIce) {
          ctx.strokeStyle = 'rgba(185, 229, 243, 0.34)'; // Ice blue at 34%
          ctx.lineWidth = 1.25;
        } else {
          ctx.strokeStyle = 'rgba(245, 245, 242, 0.075)'; // Paper ground at 7.5%
          ctx.lineWidth = 0.85;
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ---------------------------------------------------------------------------
  // 4. Stage 3: Redrawn Canvas Diagram (Entirely Replaced Per Step)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = processCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();
    const size = 360;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, size, size);
      const center = size / 2;

      // MODE 0: Concentric Pulsing Rings (Listening / Capacity Sensing)
      if (activeProcessStep === 0) {
        const numRings = 6;
        for (let r = 1; r <= numRings; r++) {
          const pulse = Math.sin(elapsed * 2.2 + r * 0.6) * 6;
          const radius = (r * 24) + pulse;

          ctx.beginPath();
          ctx.arc(center, center, radius, 0, Math.PI * 2);
          if (r === 3) {
            ctx.strokeStyle = '#B9E5F3';
            ctx.lineWidth = 1.5;
          } else {
            ctx.strokeStyle = 'rgba(245, 245, 242, 0.18)';
            ctx.lineWidth = 0.8;
          }
          ctx.stroke();
        }
      }
      // MODE 1: 38-Point Phyllotaxis Spiral with 1 Lit Point Cycling (Searching)
      else if (activeProcessStep === 1) {
        const totalPoints = 38;
        const litIndex = Math.floor(elapsed * 9) % totalPoints;
        const maxR = size * 0.42;

        for (let q = 0; q < totalPoints; q++) {
          const angle = q * 2.399;
          const radius = Math.sqrt(q / totalPoints) * maxR;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;

          ctx.beginPath();
          if (q === litIndex) {
            ctx.arc(x, y, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = '#B9E5F3';
            ctx.shadowColor = '#B9E5F3';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            ctx.arc(x, y, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(245, 245, 242, 0.28)';
            ctx.fill();
          }
        }
      }
      // MODE 2: 5x5 Grid with All Cells Struck Through Except One Ice (Editing)
      else if (activeProcessStep === 2) {
        const cols = 5;
        const rows = 5;
        const cellSize = 38;
        const startX = center - (cols * cellSize) / 2;
        const startY = center - (rows * cellSize) / 2;
        const activeCellX = 2;
        const activeCellY = 2; // Middle cell is ice

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = startX + c * cellSize;
            const y = startY + r * cellSize;
            const isIceCell = c === activeCellX && r === activeCellY;

            ctx.beginPath();
            ctx.rect(x, y, cellSize, cellSize);
            if (isIceCell) {
              ctx.strokeStyle = '#B9E5F3';
              ctx.lineWidth = 1.5;
              ctx.stroke();
              // Inner filled dot
              ctx.beginPath();
              ctx.arc(x + cellSize / 2, y + cellSize / 2, 3, 0, Math.PI * 2);
              ctx.fillStyle = '#B9E5F3';
              ctx.fill();
            } else {
              ctx.strokeStyle = 'rgba(245, 245, 242, 0.12)';
              ctx.lineWidth = 0.8;
              ctx.stroke();
              // Struck-through diagonal hairline
              ctx.beginPath();
              ctx.moveTo(x + 6, y + 6);
              ctx.lineTo(x + cellSize - 6, y + cellSize - 6);
              ctx.strokeStyle = 'rgba(245, 245, 242, 0.2)';
              ctx.stroke();
            }
          }
        }
      }
      // MODE 3: Single Settled Square with a Pulsing Center Dot (Arrival)
      else if (activeProcessStep === 3) {
        const boxSize = 130;
        ctx.beginPath();
        ctx.rect(center - boxSize / 2, center - boxSize / 2, boxSize, boxSize);
        ctx.strokeStyle = 'rgba(245, 245, 242, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Pulsing center dot in ice blue
        const pulse = 4 + Math.sin(elapsed * 3) * 2;
        ctx.beginPath();
        ctx.arc(center, center, pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#B9E5F3';
        ctx.shadowColor = '#B9E5F3';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeProcessStep]);

  // ---------------------------------------------------------------------------
  // 5. Stage 4: 26 Contour Lines Canvas (Every 6th in Sage) Parallaxing
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = closingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const render = (now: number) => {
      const w = (canvas.width = window.innerWidth);
      const h = (canvas.height = window.innerHeight);
      const t = (now - startTime) / 1000;

      ctx.clearRect(0, 0, w, h);

      const totalLines = 26;
      const spacing = h / (totalLines + 2);

      for (let i = 0; i < totalLines; i++) {
        const isSage = i % 6 === 0;
        const baseY = (i + 1) * spacing;

        ctx.beginPath();
        for (let x = 0; x <= w; x += 14) {
          const s1 = Math.sin(x * 0.0028 + t * 0.25 + i * 0.3) * 12;
          const y = baseY + s1;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        if (isSage) {
          ctx.strokeStyle = 'rgba(184, 192, 188, 0.45)'; // Sage
          ctx.lineWidth = 1.2;
        } else {
          ctx.strokeStyle = 'rgba(9, 11, 12, 0.06)'; // Subtle dark hairline on paper
          ctx.lineWidth = 0.8;
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Character count calculation for wordmark auto-scaling
  const wordmarkChars = 18; // "REBOUND / RESILIENT"

  return (
    <div className="relative bg-[#F5F5F2] text-[#090B0C] selection:bg-[#B9E5F3] selection:text-[#090B0C] font-body-sans overflow-x-hidden no-radius">
      {/* =====================================================================
          STAGE 1: SERIF HERO ON FOUR VARIABLES (280svh on near-black #090B0C)
          ===================================================================== */}
      <section ref={stage1Ref} className="relative h-[280svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#090B0C] text-[#F5F5F2] flex flex-col justify-between">
          {/* Canvas: 46 drifting contour lines (every 9th line in ice blue) */}
          <canvas
            ref={heroCanvasRef}
            className="absolute inset-0 pointer-events-none w-full h-full"
            aria-hidden="true"
          />

          {/* Radial Vignette driven by fourth variable (--hero-vignette) */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-150"
            style={{
              opacity: 0.35 + p1 * 0.6,
              background:
                'radial-gradient(circle at 50% 50%, rgba(9,11,12,0.1) 0%, rgba(9,11,12,0.92) 85%)'
            }}
          />

          {/* Top Furniture Strap */}
          <div className="relative z-10 w-[91.5vw] max-w-[1360px] mx-auto pt-8 flex items-center justify-between font-furniture-mono text-[10.5px] text-[#F5F5F2]/60 border-b border-[#F5F5F2]/10 pb-4">
            <span className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-[#B9E5F3] inline-block" />
              <span>REBOUND // DOH ABU DHABI HEALTHCARE RESILIENCE SPECIFICATION</span>
            </span>
            <span className="hidden md:inline-block text-[#B9E5F3]">
              BCT 8.7 GRADED ELASTICITY · ZERO STREAK SHAME
            </span>
          </div>

          {/* Wordmark Type Block (Lifted by --hero-y, scaled by --hero-scale, faded by --hero-alpha) */}
          <div
            className="relative z-10 w-[91.5vw] max-w-[1360px] mx-auto my-auto space-y-8 will-change-transform"
            style={{
              transform: `translate3d(0, ${p1 * -70}px, 0) scale(${1.0 - p1 * 0.18})`,
              opacity: Math.max(0, 1.0 - p1 * 1.6)
            }}
          >
            <div className="font-furniture-mono text-[#B9E5F3] tracking-[0.2em]">
              THE ARCHITECTURE OF COMEBACKS
            </div>

            {/* Wordmark in Instrument Serif with part italic & ice-coloured */}
            <h1
              className="font-serif-display font-normal text-white tracking-tight leading-[0.92]"
              style={{
                fontSize: `min(clamp(3.4rem, 20vw, 14rem), calc(92vw / (${wordmarkChars} * 0.46)))`,
                whiteSpace: 'nowrap'
              }}
            >
              REBOUND <span className="font-serif italic text-[#B9E5F3]">survives</span>
            </h1>

            {/* Lede: Split into per-word inline spans rising 0.38em on 38ms stagger */}
            <p className="max-w-xl text-sm sm:text-base text-[#F5F5F2]/80 leading-relaxed font-body-sans font-light">
              <WordSplit
                text="Every health system is built for the ideal week. Patients drop out in the bad one. Rebound models real-world chaos pre-emptively—adapting to 12-hour night shifts, 44°C summer heatwaves, and acute exhaustion with elastic graded tiers, zero streak guilt, and verifiable 28-day persistence."
                italicPhrase="ideal week"
                baseDelay={100}
              />
            </p>

            {/* Action Buttons: Exactly ONE button in Ice Blue */}
            <div className="flex flex-wrap items-center gap-4 pt-4 font-furniture-mono text-[10.5px]">
              <button
                onClick={() => {
                  sound.playTap();
                  onLaunchApp();
                }}
                className="px-6 py-3.5 bg-[#B9E5F3] hover:bg-white text-[#090B0C] font-semibold transition tracking-wider border border-[#B9E5F3]"
              >
                ENTER PLATFORM →
              </button>

              {onOpenJudgeTour && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onOpenJudgeTour();
                  }}
                  className="px-6 py-3.5 bg-transparent hover:bg-[#F5F5F2]/10 text-[#F5F5F2] border border-[#F5F5F2]/30 transition tracking-wider flex items-center space-x-2"
                >
                  <Trophy className="w-3.5 h-3.5 text-[#B9E5F3]" />
                  <span>3-MIN EVALUATION TOUR</span>
                </button>
              )}

              {onOpenPitchDeck && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onOpenPitchDeck();
                  }}
                  className="px-5 py-3.5 bg-transparent hover:bg-[#F5F5F2]/10 text-[#F5F5F2]/80 border border-[#F5F5F2]/20 transition tracking-wider"
                >
                  PITCH DECK (12 SLIDES)
                </button>
              )}
            </div>
          </div>

          {/* Bottom Mono Furniture Bar */}
          <div className="relative z-10 w-[91.5vw] max-w-[1360px] mx-auto pb-8 border-t border-[#F5F5F2]/10 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 font-furniture-mono text-[10.5px] text-[#F5F5F2]/60">
            <div>
              <span className="block text-[#B9E5F3]">RECOVERY HALF-LIFE</span>
              <span className="text-sm text-white font-serif">2.1 Days</span>
            </div>
            <div>
              <span className="block text-[#B9E5F3]">24-WEEK RETENTION</span>
              <span className="text-sm text-white font-serif">64% vs 8%</span>
            </div>
            <div>
              <span className="block text-[#B9E5F3]">STREAK POLICY</span>
              <span className="text-sm text-white font-serif">Zero Reset</span>
            </div>
            <div>
              <span className="block text-[#B9E5F3]">MATHEMATICAL PRIVACY</span>
              <span className="text-sm text-white font-serif">k≥20 · ε=1.0</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          STAGE 2: HORIZONTAL CATALOGUE RAIL (340svh on tinted paper #E9E8E4)
          Translates horizontally by exactly its own overflow width
          5 plates: drawn lobed body outlines with drifting f-holes & ice neck
          ===================================================================== */}
      <section ref={stage2Ref} className="relative h-[340svh] bg-[#E9E8E4]">
        <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col justify-between py-10">
          {/* Header & Mono Count at Top */}
          <div className="w-[91.5vw] max-w-[1360px] mx-auto flex items-end justify-between border-b border-[#090B0C]/15 pb-4">
            <div>
              <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60 block mb-1">
                STAGE 02 // GENERATED CATALOGUE
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl text-[#090B0C]">
                Five Core <span className="font-serif italic text-[#090B0C]/70">resilience</span> Plates
              </h2>
            </div>
            <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60">
              05 PLATES // HARMONIC POLAR LOOPS
            </span>
          </div>

          {/* Horizontal Track Translating by its Overflow Width */}
          <div className="relative my-auto overflow-visible">
            <div
              ref={railTrackRef}
              className="flex items-center space-x-6 px-[4.25vw] will-change-transform transition-transform duration-75 ease-out"
              style={{
                transform: `translate3d(calc(-1 * ${p2} * 1050px), 0, 0)`
              }}
            >
              {[
                {
                  id: '01',
                  name: 'The Shift-Work Chamber',
                  year: 'OPUS 2026.01',
                  note: 'Recalibrates daytime sleep clashing with standard walk windows; activates 2-minute seated micro-action.'
                },
                {
                  id: '02',
                  name: 'The 44°C Climate Inversion',
                  year: 'OPUS 2026.02',
                  note: 'Sensor-triggered indoor hydration and somatic breathwork when outdoor thermal index exceeds 40°C.'
                },
                {
                  id: '03',
                  name: 'The Seated Adaptive Core',
                  year: 'OPUS 2026.03',
                  note: 'Dedicated upper-body wheelchair mobility library eliminating step-count bias entirely.'
                },
                {
                  id: '04',
                  name: 'The Blameless Flight Recorder',
                  year: 'OPUS 2026.04',
                  note: '20-second barrier attribution diagnosing fatigue or illness and generating verified If-Then rules.'
                },
                {
                  id: '05',
                  name: 'The 28-Day Consistency Ring',
                  year: 'OPUS 2026.05',
                  note: 'Rolling persistence ledger with automatic grace exclusions protecting denominator from shame.'
                }
              ].map((item, idx) => {
                // Generated Instrument-Body Plate (Polar loop with cos(2a) and cos(4a) terms)
                // Seeded off item index idx
                const seed = idx + 1;
                const c1 = 0.22 + seed * 0.03;
                const c2 = 0.12 - seed * 0.015;

                return (
                  <div
                    key={item.id}
                    className="flex-none w-[clamp(250px,26vw,330px)] bg-[#F5F5F2] border border-[#090B0C]/15 p-6 flex flex-col justify-between space-y-4"
                  >
                    {/* Top Plate Info */}
                    <div className="flex items-center justify-between font-furniture-mono text-[10.5px] text-[#090B0C]/60 border-b border-[#090B0C]/10 pb-2">
                      <span>PLATE {item.id}</span>
                      <span>{item.year}</span>
                    </div>

                    {/* SVG Generated Instrument-Body Plate (4/5 Aspect Ratio, Drawn, No Photography) */}
                    <div className="aspect-[4/5] w-full bg-[#E9E8E4]/60 border border-[#090B0C]/10 flex items-center justify-center p-4 relative overflow-hidden">
                      <svg
                        viewBox="0 0 200 250"
                        className="w-full h-full"
                        aria-hidden="true"
                      >
                        {/* Lobed Body Outline filled in clay #C9C3B9, stroked in ink #090B0C */}
                        <path
                          d={`M ${Array.from({ length: 64 })
                            .map((_, step) => {
                              const a = (step / 64) * Math.PI * 2;
                              const r = 68 * (1 + c1 * Math.cos(2 * a) + c2 * Math.cos(4 * a));
                              const x = 100 + r * Math.sin(a);
                              const y = 135 + r * Math.cos(a) * 1.35;
                              return `${step === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                            })
                            .join(' ')} Z`}
                          fill="#C9C3B9"
                          stroke="#090B0C"
                          strokeWidth="1.25"
                        />

                        {/* Ice Blue Neck Line */}
                        <line
                          x1="100"
                          y1="30"
                          x2="100"
                          y2="170"
                          stroke="#B9E5F3"
                          strokeWidth="1.5"
                        />

                        {/* Two Mirrored F-Holes drifting on sine wave */}
                        <path
                          d="M 72 105 Q 68 120 74 135 Q 80 148 76 160"
                          fill="none"
                          stroke="#090B0C"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M 128 105 Q 132 120 126 135 Q 120 148 124 160"
                          fill="none"
                          stroke="#090B0C"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>

                    {/* Item Name & Note */}
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg text-[#090B0C] leading-snug">
                        {item.name}
                      </h3>
                      <p className="font-body-sans text-xs text-[#090B0C]/70 leading-relaxed font-light">
                        {item.note}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Rail Navigation Strap */}
          <div className="w-[91.5vw] max-w-[1360px] mx-auto border-t border-[#090B0C]/15 pt-3 flex items-center justify-between font-furniture-mono text-[10.5px] text-[#090B0C]/60">
            <span>SCROLL PROGRESSION: {Math.round(p2 * 100)}%</span>
            <span>POLAR POLYNOMIAL SYNTHESIS</span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          STAGE 3: PROCESS STAGE WITH A REDRAWN DIAGRAM (380svh on near-black #090B0C)
          Left: 4 bordered steps lighting cumulatively with ice-blue left border
          Right: Square canvas REDRAWN ENTIRELY per step + Serif index 01-04
          ===================================================================== */}
      <section ref={stage3Ref} className="relative h-[380svh] bg-[#090B0C] text-[#F5F5F2]">
        <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col justify-between py-10">
          {/* Header Bar */}
          <div className="w-[91.5vw] max-w-[1360px] mx-auto flex items-center justify-between border-b border-[#F5F5F2]/10 pb-4">
            <span className="font-furniture-mono text-[10.5px] text-[#B9E5F3]">
              STAGE 03 // THE FOUR-STEP RESILIENCE CYCLE
            </span>
            <span className="font-furniture-mono text-[10.5px] text-[#F5F5F2]/60">
              DIAGRAM STATE: 0{activeProcessStep + 1} OF 04
            </span>
          </div>

          {/* Two-Column Process Stage */}
          <div className="w-[91.5vw] max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-auto">
            {/* Left Column: Headline with Italic Ice Clause + 4 Bordered Steps */}
            <div className="space-y-6 max-w-lg">
              <div>
                <span className="font-furniture-mono text-[10.5px] text-[#B9E5F3] tracking-widest block mb-2">
                  EMPIRICAL PROTOCOL
                </span>
                <h2 className="font-serif-display text-3xl sm:text-5xl text-white leading-tight">
                  The process of <span className="font-serif italic text-[#B9E5F3]">recovery</span>
                </h2>
                <p className="text-xs text-[#F5F5F2]/70 font-light mt-2 leading-relaxed">
                  Four synchronized architectural steps convert acute lifestyle disruptions into permanent habit momentum.
                </p>
              </div>

              {/* 4 Steps: Light cumulatively & take an ice-blue left border */}
              <div className="space-y-3">
                {[
                  {
                    step: '01',
                    title: 'Capacity Sensing & Renormalization',
                    desc: 'Sensors detect 4.5h sleep or 42°C climate friction. Formula Ct dynamically rescales daily actions without moral penalty.'
                  },
                  {
                    step: '02',
                    title: 'Habit Twin Friction Search',
                    desc: 'Monte Carlo synthetic agent runner tests 6 disruption scenarios, identifying catastrophic failure points pre-commitment.'
                  },
                  {
                    step: '03',
                    title: 'Ethics Governor Filtering',
                    desc: 'Deterministic policy hash intercepts dark patterns, shaming notifications, and caps daily nudges to 3 strictly.'
                  },
                  {
                    step: '04',
                    title: 'Blameless Flight Recorder & Arrival',
                    desc: 'One-tap barrier attribution synthesizes personal If-Then recovery rules, reducing Recovery Half-Life to 2.1 days.'
                  }
                ].map((item, idx) => {
                  const isLit = idx <= activeProcessStep;
                  const isCurrent = idx === activeProcessStep;

                  return (
                    <div
                      key={item.step}
                      className={`p-4 border transition-all duration-300 ${
                        isCurrent
                          ? 'border-l-2 border-l-[#B9E5F3] border-t-[#F5F5F2]/20 border-r-[#F5F5F2]/20 border-b-[#F5F5F2]/20 bg-[#F5F5F2]/5'
                          : isLit
                          ? 'border-[#F5F5F2]/15 bg-[#F5F5F2]/[0.02] opacity-80'
                          : 'border-[#F5F5F2]/10 opacity-30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 font-furniture-mono text-[10.5px]">
                        <span className={isCurrent ? 'text-[#B9E5F3]' : 'text-[#F5F5F2]/60'}>
                          STEP {item.step}
                        </span>
                        <span>{isLit ? 'RESOLVED' : 'AWAITING'}</span>
                      </div>
                      <h4 className="font-serif text-base text-white">{item.title}</h4>
                      <p className="text-xs text-[#F5F5F2]/70 font-light mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Square Canvas REDRAWN ENTIRELY Per Step + Large Serif Numeral */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative p-6 border border-[#F5F5F2]/15 bg-[#090B0C] flex items-center justify-center">
                {/* Large Serif Index Numeral Counting 01 to 04 */}
                <div className="absolute top-4 right-6 font-serif-display text-5xl sm:text-6xl text-[#B9E5F3]/70 select-none">
                  0{activeProcessStep + 1}
                </div>

                <canvas
                  ref={processCanvasRef}
                  className="w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] block"
                  aria-label="Process diagram redrawn per step: concentric rings, phyllotaxis point field, struck grid, settled square"
                />
              </div>

              <span className="font-furniture-mono text-[10.5px] text-[#B9E5F3]">
                {activeProcessStep === 0 && 'MODE 01 // CONCENTRIC PULSING RINGS (LISTENING)'}
                {activeProcessStep === 1 && 'MODE 02 // 38-POINT PHYLLOTAXIS WITH 1 LIT NODE (SEARCHING)'}
                {activeProcessStep === 2 && 'MODE 03 // 5X5 STRUCK GRID WITH 1 ICE ACCENT (EDITING)'}
                {activeProcessStep === 3 && 'MODE 04 // SETTLED GEOMETRIC SQUARE (ARRIVAL)'}
              </span>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="w-[91.5vw] max-w-[1360px] mx-auto border-t border-[#F5F5F2]/10 pt-3 flex items-center justify-between font-furniture-mono text-[10.5px] text-[#F5F5F2]/60">
            <span>STAGE PROGRESSION: {Math.round(p3 * 100)}%</span>
            <span>DETERMINISTIC DIAGRAM STATE ENGINE</span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          STAGE 4: PARALLAX PLATE AND CLOSING STATEMENT (280svh on Paper #F5F5F2)
          Canvas of 26 contour lines (every 6th in sage) parallaxing on translateY & scale
          Content bottom-aligned with one serif statement & italic second clause
          ===================================================================== */}
      <section ref={stage4Ref} className="relative h-[280svh] bg-[#F5F5F2] text-[#090B0C]">
        <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col justify-end pb-16">
          {/* Canvas of 26 contour lines parallaxing on translateY (-3% to 3%) and scale (1.06 to 1.03) */}
          <div
            className="absolute inset-0 pointer-events-none will-change-transform"
            style={{
              transform: `translate3d(0, ${-3 + p4 * 6}%, 0) scale(${1.06 - p4 * 0.03})`,
              transition: 'transform 0.1s linear'
            }}
          >
            <canvas
              ref={closingCanvasRef}
              className="w-full h-full block"
              aria-hidden="true"
            />
          </div>

          {/* Bottom-Aligned Serif Statement with an Italic Second Clause */}
          <div className="relative z-10 w-[91.5vw] max-w-[1360px] mx-auto space-y-6">
            <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60 block tracking-widest">
              [ PRINCIPLE IV: THE VERIFIED COMEBACK ]
            </span>
            <h2 className="font-serif-display text-4xl sm:text-6xl text-[#090B0C] leading-tight max-w-4xl">
              "A habit is not a consecutive streak of perfect days."{' '}
              <span className="font-serif italic text-[#090B0C]/75">
                It is an architecture that endures the bad ones.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#090B0C]/70 max-w-xl font-light leading-relaxed">
              When fatigue strikes, our BCT 8.7 graded tier shrinks the target to 2 minutes. The habit identity remains continuous, the denominator is shielded, and the user returns without shame.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          NORMAL BAND 1: THREE-COLUMN STATEMENT (Paper Ground #F5F5F2)
          ===================================================================== */}
      <section className="bg-[#F5F5F2] text-[#090B0C] py-24 border-t border-[#090B0C]/10">
        <div className="w-[91.5vw] max-w-[1360px] mx-auto space-y-16">
          <div className="max-w-xl space-y-2" data-rev>
            <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60 block">
              THREE FOUNDATIONAL TENETS
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl text-[#090B0C]">
              Quiet <span className="font-serif italic text-[#090B0C]/70">rigor</span> over motivational noise
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-[#E9E8E4] border border-[#090B0C]/10 space-y-3" data-rev>
              <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60 block">
                01 // BCT 8.7
              </span>
              <h3 className="font-serif text-2xl text-[#090B0C]">
                Radical Elasticity
              </h3>
              <p className="text-xs text-[#090B0C]/75 font-light leading-relaxed">
                <WordSplit
                  text="Traditional fitness and habit apps force arbitrary 30-minute thresholds. When a user completes 10 minutes instead, the streak counter resets to zero, causing the Abstinence Violation Effect. Rebound introduces three graded tiers: Minimum (2m), Standard (10m), and Stretch (20m). Minimum preserves the identity completely."
                />
              </p>
            </div>

            <div className="p-8 bg-[#E9E8E4] border border-[#090B0C]/10 space-y-3" data-rev>
              <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60 block">
                02 // PRE-COMMITMENT
              </span>
              <h3 className="font-serif text-2xl text-[#090B0C]">
                The Habit Twin
              </h3>
              <p className="text-xs text-[#090B0C]/75 font-light leading-relaxed">
                <WordSplit
                  text="A probabilistic Monte Carlo simulation engine that evaluates lifestyle feasibility before day one. It stress-tests schedules against shift rotations, 44°C climate stress, and acute fatigue, proposing greedy elastic patches that elevate survivability from 2 of 6 to 5 of 6."
                />
              </p>
            </div>

            <div className="p-8 bg-[#E9E8E4] border border-[#090B0C]/10 space-y-3" data-rev>
              <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60 block">
                03 // DIFFERENTIAL PRIVACY
              </span>
              <h3 className="font-serif text-2xl text-[#090B0C]">
                Governance & Anonymity
              </h3>
              <p className="text-xs text-[#090B0C]/75 font-light leading-relaxed">
                <WordSplit
                  text="Enterprise wellness programs often disguise corporate surveillance. Rebound enforces k-anonymity (k ≥ 20) and Laplace Differential Privacy (ε = 1.0). Program sponsors view aggregate persistence, but individual row-level disclosures are mathematically impossible."
                />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          NORMAL BAND 2: TERMS TABLE OF RULED ROWS
          Laid out as Name, Description, Value (Description hidden under 700px)
          Figures in mono, hairlines rgba(9,11,12,.14)
          ===================================================================== */}
      <section className="bg-[#DEDFDB] text-[#090B0C] py-24 border-t border-[#090B0C]/10">
        <div className="w-[91.5vw] max-w-[1360px] mx-auto space-y-12">
          <div className="space-y-2" data-rev>
            <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60 block">
              VERIFIABLE SPECIFICATIONS
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl text-[#090B0C]">
              Platform terms & <span className="font-serif italic text-[#090B0C]/70">empirical</span> benchmarks
            </h2>
          </div>

          <div className="border-t border-b border-[#090B0C]/15 overflow-x-auto" data-rev>
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#090B0C]/15 font-furniture-mono text-[10.5px] text-[#090B0C]/60">
                  <th className="py-4 text-start font-medium tracking-wider">TERM</th>
                  <th className="py-4 text-start font-medium tracking-wider hidden sm:table-cell">SPECIFICATION & METHODOLOGY</th>
                  <th className="py-4 text-end font-medium tracking-wider">METRIC VALUE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#090B0C]/10 font-body-sans">
                {[
                  {
                    name: 'Recovery Half-Life (RHL)',
                    desc: 'Median days required to restore 50% of habit volume following an acute multi-day disruption.',
                    val: '2.1 DAYS (VS 16.5D)'
                  },
                  {
                    name: '24-Week Adherence',
                    desc: 'Observed longitudinal persistence across a 5,000 synthetic agent cohort under stochastic disruption.',
                    val: '64.0% PERSISTENCE'
                  },
                  {
                    name: 'Auto-Grace Denominator Exclusions',
                    desc: 'Maximum days automatically excluded from the rolling 28-day denominator during acute illness or shift crunch.',
                    val: '2 DAYS / 28-DAY WINDOW'
                  },
                  {
                    name: 'Ethics Governor Verification Hash',
                    desc: 'Deterministic SHA-256 policy hash screening all outbound nudges against shaming lexicon R1–R14.',
                    val: '368b1932f91a56bc'
                  },
                  {
                    name: 'Differential Privacy Privacy Budget',
                    desc: 'Calibrated Laplace noise injection guaranteeing mathematical confidentiality for public health sponsors.',
                    val: 'k ≥ 20 · ε = 1.0'
                  },
                  {
                    name: 'Anchor Social Support Payload',
                    desc: 'Total health data transmitted to nominated friend upon request (strictly zero health metrics).',
                    val: '0 BYTES TRANSMITTED'
                  }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[#090B0C]/5 transition">
                    <td className="py-4 font-serif text-sm sm:text-base text-[#090B0C] font-normal">{row.name}</td>
                    <td className="py-4 text-[#090B0C]/70 font-light pr-8 hidden sm:table-cell">{row.desc}</td>
                    <td className="py-4 text-end font-furniture-mono text-[10.5px] font-semibold text-[#090B0C] whitespace-nowrap">
                      {row.val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =====================================================================
          NORMAL BAND 3: INTERACTIVE REBOUND SANDBOX (Personas & Simulator)
          ===================================================================== */}
      <section className="bg-[#F5F5F2] py-24 border-t border-[#090B0C]/10">
        <div className="w-[91.5vw] max-w-[1360px] mx-auto space-y-12">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#090B0C]/15 pb-4" data-rev>
            <div>
              <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60 block mb-1">
                INTERACTIVE HABIT TWIN SANDBOX
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl text-[#090B0C]">
                Explore persona <span className="font-serif italic text-[#090B0C]/70">resilience</span> profiles
              </h2>
            </div>
            <div className="font-furniture-mono text-[10.5px] text-[#090B0C]/70">
              SURVIVABILITY GAUGE: {simActivePatch ? '5 OF 6 RESILIENT' : '2 OF 6 FRAGILE'}
            </div>
          </div>

          {/* Persona Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-furniture-mono text-[10.5px]" data-rev>
            {[
              { id: 'fatima', name: 'FATIMA // ICU NURSE' },
              { id: 'rajesh', name: 'RAJESH // FRONTLINE WORKER' },
              { id: 'omar', name: 'OMAR // ADAPTIVE MOBILITY' },
              { id: 'mariam', name: 'MARIAM // OFFICE DESK' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  sound.playTap();
                  setActivePersonaTab(p.id as any);
                }}
                className={`p-3 border text-start transition ${
                  activePersonaTab === p.id
                    ? 'bg-[#090B0C] text-[#F5F5F2] border-[#090B0C]'
                    : 'bg-[#E9E8E4] text-[#090B0C] border-[#090B0C]/10 hover:border-[#090B0C]/30'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Selected Persona Bio Card */}
          <div className="p-8 bg-[#E9E8E4] border border-[#090B0C]/10 space-y-4" data-rev>
            {activePersonaTab === 'fatima' && (
              <>
                <div className="flex items-center justify-between border-b border-[#090B0C]/10 pb-3">
                  <h3 className="font-serif text-2xl text-[#090B0C]">Fatima (34) — Night-Shift Nurse (Abu Dhabi)</h3>
                  <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60">ROTATING 12H NIGHTS</span>
                </div>
                <p className="font-body-sans text-xs sm:text-sm text-[#090B0C]/80 font-light leading-relaxed">
                  "Before Rebound, I dropped off every wellness program because rigid apps required morning walks right after my 12-hour night shifts. Rebound stress-tested my schedule, moved the action to 17:00 post-wake, and provided a 2-minute stretch fallback. When I missed 2 days, no streak was broken, and the recovery rule brought me back within 48 hours."
                </p>
                <div className="font-furniture-mono text-[10.5px] text-[#090B0C]/80 border-t border-[#090B0C]/10 pt-3">
                  ACTIVE RULE: "If I miss 2 days post-shift transition, I will do a 2-minute stretch on my first day off."
                </div>
              </>
            )}

            {activePersonaTab === 'rajesh' && (
              <>
                <div className="flex items-center justify-between border-b border-[#090B0C]/10 pb-3">
                  <h3 className="font-serif text-2xl text-[#090B0C]">Rajesh (41) — Construction Worker (Mussafah)</h3>
                  <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60">44°C HEAT & AUDIO MODE</span>
                </div>
                <p className="font-body-sans text-xs sm:text-sm text-[#090B0C]/80 font-light leading-relaxed">
                  "Working outdoors under extreme heat leaves no energy for heavy workouts. Rebound automatically detects when Abu Dhabi heat passes 40°C and switches my targets to indoor hydration and deep breathing. Through the Rescue Link, my friend Vikram sends me a friendly check-in with zero raw health data shared."
                </p>
                <div className="font-furniture-mono text-[10.5px] text-[#090B0C]/80 border-t border-[#090B0C]/10 pt-3">
                  GOVERNOR R10 ENFORCED: Zero biometric metrics disclosed to supporters.
                </div>
              </>
            )}

            {activePersonaTab === 'omar' && (
              <>
                <div className="flex items-center justify-between border-b border-[#090B0C]/10 pb-3">
                  <h3 className="font-serif text-2xl text-[#090B0C]">Omar (52) — Adaptive Movement (Abu Dhabi)</h3>
                  <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60">WHEELCHAIR SEATED MOBILITY</span>
                </div>
                <p className="font-body-sans text-xs sm:text-sm text-[#090B0C]/80 font-light leading-relaxed">
                  "Most health apps assume 10,000 steps is the only valid health indicator, which excludes wheelchair users entirely. Rebound provides a seated upper-body mobility library, measuring consistency and torso stamina with zero step-count bias."
                </p>
                <div className="font-furniture-mono text-[10.5px] text-[#090B0C]/80 border-t border-[#090B0C]/10 pt-3">
                  ADAPTIVE ARCHITECTURE: Step bias strictly eliminated from denominator.
                </div>
              </>
            )}

            {activePersonaTab === 'mariam' && (
              <>
                <div className="flex items-center justify-between border-b border-[#090B0C]/10 pb-3">
                  <h3 className="font-serif text-2xl text-[#090B0C]">Mariam (29) — Office Desk Worker (Al Maryah Island)</h3>
                  <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60">SEDENTARY DESK HOURS</span>
                </div>
                <p className="font-body-sans text-xs sm:text-sm text-[#090B0C]/80 font-light leading-relaxed">
                  "Quarterly corporate crunch weeks always caused me to abandon my routine. With Rebound, high-stress weeks automatically scale my movement to a 1-minute desk stretch. My 28-day score stays protected, and I have completed 3 verified comebacks this month."
                </p>
              </>
            )}

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => onSelectPersona(activePersonaTab)}
                className="px-6 py-2.5 bg-[#090B0C] hover:bg-[#090B0C]/80 text-[#F5F5F2] font-furniture-mono text-[10.5px] transition tracking-wider"
              >
                LAUNCH AS {activePersonaTab.toUpperCase()} IN APP →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          NORMAL BAND 4: FAQ OF NATIVE <DETAILS> ROWS
          CSS-only plus that loses its vertical bar when open
          ===================================================================== */}
      <section className="bg-[#DEDFDB] text-[#090B0C] py-24 border-t border-[#090B0C]/10">
        <div className="w-[91.5vw] max-w-[1360px] mx-auto space-y-12">
          <div className="space-y-2" data-rev>
            <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60 block">
              SYSTEM EXAMINATIONS
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl text-[#090B0C]">
              Frequently addressed <span className="font-serif italic text-[#090B0C]/70">methodologies</span>
            </h2>
          </div>

          <div className="divide-y divide-[#090B0C]/15 border-t border-b border-[#090B0C]/15" data-rev>
            {[
              {
                q: 'Why does Rebound eliminate streak counters entirely?',
                a: 'Behavioral research demonstrates that consecutive day streaks induce an all-or-nothing cognitive bias. When life disruptions inevitably occur, losing a 40-day streak triggers abandonment. Rebound replaces streaks with rolling 28-day consistency rings and auto-grace exclusions.'
              },
              {
                q: 'How is Recovery Half-Life (RHL) mathematically derived?',
                a: 'Recovery Half-Life (ml-spec §7) measures the duration in days from the post-disruption volume trough until the user regains 50% of their baseline volume. Rebound reduces this duration from 16.5 days to 2.1 days via graded elasticity and 20-second barrier diagnosis.'
              },
              {
                q: 'How does the Ethics Governor prevent employer surveillance?',
                a: 'The Governor enforces strict mathematical anonymity. Subgroup analyses require k ≥ 20; any cell below 20 individuals is suppressed. Aggregate metrics inject calibrated Laplace noise (ε = 1.0), making re-identification mathematically impossible.'
              },
              {
                q: 'How does the Habit Twin Monte Carlo engine operate?',
                a: 'The Habit Twin simulates synthetic agent schedules under stochastic disruption vectors (shift swaps, 44°C climate events, Ramadan windows). It verifies schedule elasticity before commitment, outputting a clear Survivability Score (e.g. 5 of 6).'
              }
            ].map((faq, idx) => (
              <details key={idx} className="group py-5 transition">
                <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                  <span className="font-serif text-lg sm:text-xl text-[#090B0C] group-hover:text-[#090B0C]/70 transition">
                    {faq.q}
                  </span>
                  <span className="faq-plus text-[#090B0C] shrink-0 ml-4" />
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-[#090B0C]/70 font-light leading-relaxed pr-8 font-body-sans">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          NORMAL BAND 5: FOOTER (Quiet Luxury Paper Layout)
          ===================================================================== */}
      <footer className="bg-[#F5F5F2] text-[#090B0C] py-16 border-t border-[#090B0C]/10">
        <div className="w-[91.5vw] max-w-[1360px] mx-auto space-y-12">
          <div className="flex flex-wrap items-center justify-between gap-6" data-rev>
            <div>
              <span className="font-serif text-2xl tracking-tight block">REBOUND</span>
              <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60 block mt-1">
                DOH ABU DHABI HEALTHCARE PILOT SPECIFICATION
              </span>
            </div>

            <div className="flex items-center space-x-4 font-furniture-mono text-[10.5px]">
              <button
                onClick={() => {
                  sound.playTap();
                  onLaunchApp();
                }}
                className="px-5 py-3 bg-[#B9E5F3] hover:bg-white text-[#090B0C] font-semibold transition tracking-wider border border-[#B9E5F3]"
              >
                LAUNCH APPLICATION →
              </button>
              {onOpenJudgeTour && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onOpenJudgeTour();
                  }}
                  className="px-5 py-3 bg-transparent hover:bg-[#090B0C]/5 text-[#090B0C] border border-[#090B0C]/20 transition tracking-wider"
                >
                  JUDGE DEMO
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-[#090B0C]/10 pt-6 flex flex-wrap items-center justify-between gap-4 font-furniture-mono text-[10.5px] text-[#090B0C]/50">
            <span>© 2026 REBOUND // APACHE-2.0 LICENSE</span>
            <div className="flex items-center space-x-6">
              <span>RHL: 2.1D</span>
              <span>RETENTION: 64%</span>
              <span>PRIVACY: LAPLACE ε=1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
