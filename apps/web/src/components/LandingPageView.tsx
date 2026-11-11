import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Locale } from '../i18n/translations';
import { 
  ArrowRight, Trophy, Presentation, CheckCircle2, 
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

  // Process Stage active step state (0 to 3) - syncs with scroll or click
  const [activeProcessStep, setActiveProcessStep] = useState(0);

  // Active Catalogue Item selected in Stage 2
  const [activePlateIndex, setActivePlateIndex] = useState(0);

  // Interactive Persona state
  const [activePersonaTab, setActivePersonaTab] = useState<'fatima' | 'rajesh' | 'omar' | 'mariam'>('fatima');

  // Interactive Mini-Simulator state
  const [simActivePatch, setSimActivePatch] = useState(false);
  const [activeScenario, setActiveScenario] = useState<'night_shift' | 'heatwave' | 'ramadan' | 'work_crunch'>('night_shift');

  // Mermaid diagram code view toggle
  const [showMermaidCode, setShowMermaidCode] = useState(false);

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

          // Update process step based on scroll scrub
          const derivedStep = Math.min(3, Math.floor(newP3 * 4));
          setActiveProcessStep(derivedStep);

          // Write CSS custom properties on root for GPU-composited styling
          document.documentElement.style.setProperty('--hero-y', `${newP1 * -35}px`);
          document.documentElement.style.setProperty('--hero-scale', `${1.0 - newP1 * 0.08}`);
          document.documentElement.style.setProperty('--hero-vignette', `${0.3 + newP1 * 0.4}`);

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
  // High visibility & contrast — never blank!
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (now: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const t = (now - startTime) / 1000;

      ctx.clearRect(0, 0, w, h);

      const totalLines = 46;
      const spacing = h / (totalLines + 2);

      for (let i = 0; i < totalLines; i++) {
        const isIce = i % 9 === 0;
        const baseY = (i + 1.2) * spacing;

        ctx.beginPath();
        for (let x = 0; x <= w; x += 16) {
          const s1 = Math.sin(x * 0.0035 + t * 0.45 + i * 0.3) * 16;
          const s2 = Math.sin(x * 0.0015 + t * 0.2 + i * 0.15) * 8;
          const y = baseY + s1 + s2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        if (isIce) {
          ctx.strokeStyle = '#B9E5F3';
          ctx.lineWidth = 1.75;
          ctx.shadowColor = '#B9E5F3';
          ctx.shadowBlur = 6;
        } else {
          ctx.strokeStyle = 'rgba(245, 245, 242, 0.22)'; // Crisp, visible hairlines
          ctx.lineWidth = 1.0;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 4. Stage 3: Process Diagram Canvas (Entirely Redrawn Per Step)
  // High contrast & vivid geometric animation
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = processCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();
    const size = 320;
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
          const pulse = Math.sin(elapsed * 2.5 + r * 0.7) * 8;
          const radius = (r * 22) + pulse;

          ctx.beginPath();
          ctx.arc(center, center, Math.max(4, radius), 0, Math.PI * 2);
          if (r === 3 || r === 5) {
            ctx.strokeStyle = '#B9E5F3';
            ctx.lineWidth = 2.0;
            ctx.shadowColor = '#B9E5F3';
            ctx.shadowBlur = 8;
          } else {
            ctx.strokeStyle = 'rgba(245, 245, 242, 0.35)';
            ctx.lineWidth = 1.2;
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Center capacity core
        ctx.beginPath();
        ctx.arc(center, center, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#B9E5F3';
        ctx.fill();
      }
      // MODE 1: 38-Point Phyllotaxis Spiral with 1 Lit Point Cycling (Searching)
      else if (activeProcessStep === 1) {
        const totalPoints = 38;
        const litIndex = Math.floor(elapsed * 10) % totalPoints;
        const maxR = size * 0.42;

        for (let q = 0; q < totalPoints; q++) {
          const angle = q * 2.399;
          const radius = Math.sqrt(q / totalPoints) * maxR;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;

          ctx.beginPath();
          if (q === litIndex) {
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#B9E5F3';
            ctx.shadowColor = '#B9E5F3';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(245, 245, 242, 0.45)';
            ctx.fill();
          }
        }
      }
      // MODE 2: 5x5 Grid with All Cells Struck Through Except One Ice (Editing)
      else if (activeProcessStep === 2) {
        const cols = 5;
        const rows = 5;
        const cellSize = 36;
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
              ctx.lineWidth = 2.0;
              ctx.stroke();
              // Inner glowing target dot
              ctx.beginPath();
              ctx.arc(x + cellSize / 2, y + cellSize / 2, 4.5, 0, Math.PI * 2);
              ctx.fillStyle = '#B9E5F3';
              ctx.shadowColor = '#B9E5F3';
              ctx.shadowBlur = 10;
              ctx.fill();
              ctx.shadowBlur = 0;
            } else {
              ctx.strokeStyle = 'rgba(245, 245, 242, 0.25)';
              ctx.lineWidth = 1.0;
              ctx.stroke();
              // Struck-through diagonal hairline
              ctx.beginPath();
              ctx.moveTo(x + 5, y + 5);
              ctx.lineTo(x + cellSize - 5, y + cellSize - 5);
              ctx.strokeStyle = 'rgba(245, 245, 242, 0.35)';
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
        ctx.strokeStyle = '#F5F5F2';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(center - 15, center);
        ctx.lineTo(center + 15, center);
        ctx.moveTo(center, center - 15);
        ctx.lineTo(center, center + 15);
        ctx.strokeStyle = 'rgba(185, 229, 243, 0.6)';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Pulsing center dot in ice blue
        const pulse = 5 + Math.sin(elapsed * 3.5) * 2.5;
        ctx.beginPath();
        ctx.arc(center, center, pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#B9E5F3';
        ctx.shadowColor = '#B9E5F3';
        ctx.shadowBlur = 12;
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

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = (window.innerHeight * 0.7) * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (now: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight * 0.7;
      const t = (now - startTime) / 1000;

      ctx.clearRect(0, 0, w, h);

      const totalLines = 26;
      const spacing = h / (totalLines + 1);

      for (let i = 0; i < totalLines; i++) {
        const isSage = i % 6 === 0;
        const baseY = (i + 0.8) * spacing;

        ctx.beginPath();
        for (let x = 0; x <= w; x += 18) {
          const s1 = Math.sin(x * 0.003 + t * 0.28 + i * 0.35) * 14;
          const y = baseY + s1;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        if (isSage) {
          ctx.strokeStyle = '#B8C0BC'; // Sage
          ctx.lineWidth = 1.75;
        } else {
          ctx.strokeStyle = 'rgba(9, 11, 12, 0.16)'; // Clear visible ink on paper
          ctx.lineWidth = 1.0;
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Character count calculation for wordmark auto-scaling
  const wordmarkChars = 18; // "REBOUND / RESILIENT"

  return (
    <div className="relative bg-[#F5F5F2] text-[#090B0C] selection:bg-[#B9E5F3] selection:text-[#090B0C] font-body-sans overflow-x-hidden no-radius">
      {/* =====================================================================
          STAGE 1: SERIF HERO ON FOUR VARIABLES (Tightly choreographed on #090B0C)
          No empty blank void!
          ===================================================================== */}
      <section ref={stage1Ref} className="relative min-h-[100svh] bg-[#090B0C] text-[#F5F5F2] flex flex-col justify-between py-8 sm:py-12">
        {/* Canvas: 46 drifting contour lines (every 9th line in ice blue) */}
        <canvas
          ref={heroCanvasRef}
          className="absolute inset-0 pointer-events-none w-full h-full"
          aria-hidden="true"
        />

        {/* Subtle radial vignette that deepens on scroll */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.3 + p1 * 0.35,
            background: 'radial-gradient(circle at 50% 50%, rgba(9,11,12,0.15) 0%, rgba(9,11,12,0.85) 90%)'
          }}
        />

        {/* Top Furniture Strap */}
        <div className="relative z-10 w-[91.5vw] max-w-[1360px] mx-auto flex items-center justify-between font-furniture-mono text-[10.5px] text-[#F5F5F2]/70 border-b border-[#F5F5F2]/15 pb-4">
          <span className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-[#B9E5F3] inline-block animate-pulse" />
            <span>REBOUND // DOH ABU DHABI HEALTHCARE RESILIENCE SPECIFICATION</span>
          </span>
          <span className="hidden md:inline-block text-[#B9E5F3]">
            BCT 8.7 GRADED ELASTICITY · ZERO STREAK SHAME
          </span>
        </div>

        {/* Main Wordmark Block (Grounded & Always Readable) */}
        <div
          className="relative z-10 w-[91.5vw] max-w-[1360px] mx-auto my-auto space-y-6 pt-10 pb-8"
          style={{
            transform: `translate3d(0, ${p1 * -35}px, 0) scale(${1.0 - p1 * 0.08})`,
            transition: 'transform 0.1s ease-out'
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
          <p className="max-w-2xl text-sm sm:text-base text-[#F5F5F2]/85 leading-relaxed font-body-sans font-light">
            <WordSplit
              text="Every health system is built for the ideal week. Patients drop out in the bad one. Rebound models real-world chaos pre-emptively—adapting to 12-hour night shifts, 44°C summer heatwaves, and acute exhaustion with elastic graded tiers, zero streak guilt, and verifiable 28-day persistence."
              italicPhrase="ideal week"
              baseDelay={80}
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

        {/* Bottom Mono Furniture Bar with Live Telemetry */}
        <div className="relative z-10 w-[91.5vw] max-w-[1360px] mx-auto pt-6 border-t border-[#F5F5F2]/15 grid grid-cols-2 sm:grid-cols-4 gap-4 font-furniture-mono text-[10.5px] text-[#F5F5F2]/75">
          <div>
            <span className="block text-[#B9E5F3]">RECOVERY HALF-LIFE</span>
            <span className="text-sm sm:text-base text-white font-serif">2.1 Days (vs 16.5d)</span>
          </div>
          <div>
            <span className="block text-[#B9E5F3]">24-WEEK RETENTION</span>
            <span className="text-sm sm:text-base text-white font-serif">64% (vs 8% Baseline)</span>
          </div>
          <div>
            <span className="block text-[#B9E5F3]">STREAK POLICY</span>
            <span className="text-sm sm:text-base text-white font-serif">Denominator Protected</span>
          </div>
          <div>
            <span className="block text-[#B9E5F3]">MATHEMATICAL PRIVACY</span>
            <span className="text-sm sm:text-base text-white font-serif">k≥20 · Laplace ε=1.0</span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          STAGE 2: HORIZONTAL CATALOGUE RAIL (Interactive on tinted paper #E9E8E4)
          5 drawn instrument-body plates with drifting f-holes & ice neck
          No blank voids!
          ===================================================================== */}
      <section ref={stage2Ref} className="relative bg-[#E9E8E4] py-16 sm:py-20 border-t border-[#090B0C]/10">
        <div className="w-[91.5vw] max-w-[1360px] mx-auto space-y-8">
          {/* Header & Mono Count at Top */}
          <div className="flex flex-wrap items-end justify-between border-b border-[#090B0C]/15 pb-4 gap-4">
            <div>
              <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60 block mb-1">
                STAGE 02 // GENERATED RESILIENCE CATALOGUE
              </span>
              <h2 className="font-serif-display text-3xl sm:text-5xl text-[#090B0C]">
                Five Core <span className="font-serif italic text-[#090B0C]/75">resilience</span> Plates
              </h2>
            </div>
            <div className="font-furniture-mono text-[10.5px] text-[#090B0C]/70 flex items-center space-x-3">
              <span>05 PROCEDURAL POLAR PLATES</span>
              <span className="w-1.5 h-1.5 bg-[#090B0C] inline-block" />
              <span>ACTIVE: 0{activePlateIndex + 1}</span>
            </div>
          </div>

          {/* Interactive Horizontal Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                id: '01',
                name: 'The Shift-Work Chamber',
                year: 'OPUS 2026.01',
                note: 'Recalibrates daytime sleep clashing with standard walk windows; activates 2-minute seated micro-action.',
                spec: 'ADAPTIVE SLEEP WINDOW // 17:00 POST-WAKE'
              },
              {
                id: '02',
                name: 'The 44°C Climate Inversion',
                year: 'OPUS 2026.02',
                note: 'Sensor-triggered indoor hydration and somatic breathwork when outdoor thermal index exceeds 40°C.',
                spec: 'ABU DHABI WEATHER API // THERMAL ESCAPE'
              },
              {
                id: '03',
                name: 'The Seated Adaptive Core',
                year: 'OPUS 2026.03',
                note: 'Dedicated upper-body wheelchair mobility library eliminating step-count bias entirely.',
                spec: 'ACCESSIBLE ZERO-STEP GAUGING // BCT 8.7'
              },
              {
                id: '04',
                name: 'The Blameless Flight Recorder',
                year: 'OPUS 2026.04',
                note: '20-second barrier attribution diagnosing fatigue or illness and generating verified If-Then rules.',
                spec: 'LAPSE DIAGNOSIS // 1-TAP IF-THEN RULE'
              },
              {
                id: '05',
                name: 'The 28-Day Consistency Ring',
                year: 'OPUS 2026.05',
                note: 'Rolling persistence ledger with automatic grace exclusions protecting denominator from shame.',
                spec: 'ROLLING 28D // ZERO STREAK CLIFF'
              }
            ].map((item, idx) => {
              // Polar body math: r(a) = R0 * (1 + c1*cos(2a) + c2*cos(4a))
              const seed = idx + 1;
              const c1 = 0.22 + seed * 0.03;
              const c2 = 0.12 - seed * 0.015;
              const isSelected = activePlateIndex === idx;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    sound.playTap();
                    setActivePlateIndex(idx);
                  }}
                  className={`cursor-pointer transition-all duration-300 p-5 bg-[#F5F5F2] border flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'border-[#090B0C] ring-1 ring-[#090B0C] shadow-sm'
                      : 'border-[#090B0C]/15 hover:border-[#090B0C]/40'
                  }`}
                >
                  {/* Top Plate Info */}
                  <div className="flex items-center justify-between font-furniture-mono text-[10.5px] text-[#090B0C]/60 border-b border-[#090B0C]/10 pb-2">
                    <span className={isSelected ? 'text-[#090B0C] font-bold' : ''}>PLATE {item.id}</span>
                    <span>{item.year}</span>
                  </div>

                  {/* SVG Drawn Plate */}
                  <div className="aspect-[4/5] w-full bg-[#E9E8E4]/80 border border-[#090B0C]/10 flex items-center justify-center p-3 relative overflow-hidden">
                    <svg
                      viewBox="0 0 200 250"
                      className="w-full h-full"
                      aria-hidden="true"
                    >
                      {/* Lobed Body Outline in clay #C9C3B9 */}
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
                        fill={isSelected ? '#C9C3B9' : '#DEDFDB'}
                        stroke="#090B0C"
                        strokeWidth="1.5"
                      />

                      {/* Ice Blue Neck Line */}
                      <line
                        x1="100"
                        y1="25"
                        x2="100"
                        y2="175"
                        stroke="#B9E5F3"
                        strokeWidth="2.0"
                      />

                      {/* Two Mirrored F-Holes */}
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

                    {isSelected && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-[#090B0C] text-white font-furniture-mono text-[9px]">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Name & Note */}
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-base sm:text-lg text-[#090B0C] leading-snug">
                      {item.name}
                    </h3>
                    <p className="font-body-sans text-xs text-[#090B0C]/75 leading-relaxed font-light">
                      {item.note}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#090B0C]/10 font-furniture-mono text-[9.5px] text-[#090B0C]/60 truncate">
                    {item.spec}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          STAGE 3: PROCESS STAGE WITH REDRAWN DIAGRAM (Interactive on #090B0C)
          4 modes with live interactive click/scroll triggers
          No blank voids!
          ===================================================================== */}
      <section ref={stage3Ref} className="relative bg-[#090B0C] text-[#F5F5F2] py-20 border-t border-[#F5F5F2]/10">
        <div className="w-[91.5vw] max-w-[1360px] mx-auto space-y-10">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#F5F5F2]/15 pb-4 gap-4">
            <div>
              <span className="font-furniture-mono text-[10.5px] text-[#B9E5F3] block mb-1">
                STAGE 03 // THE FOUR-STEP RESILIENCE CYCLE
              </span>
              <h2 className="font-serif-display text-3xl sm:text-5xl text-white">
                The process of <span className="font-serif italic text-[#B9E5F3]">recovery</span>
              </h2>
            </div>
            <div className="font-furniture-mono text-[10.5px] text-[#F5F5F2]/70 flex items-center space-x-3">
              <span>STEP 0{activeProcessStep + 1} OF 04</span>
              <span className="w-1.5 h-1.5 bg-[#B9E5F3] inline-block" />
              <span className="text-[#B9E5F3]">INTERACTIVE TELEMETRY ACTIVE</span>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Column: 4 Clickable / Scrollable Step Cards */}
            <div className="space-y-3">
              {[
                {
                  step: '01',
                  modeName: 'MODE 01 // CONCENTRIC PULSING RINGS (LISTENING)',
                  title: 'Capacity Sensing & Renormalization',
                  desc: 'Sensors detect 4.5h sleep or 42°C climate friction. Formula Ct dynamically rescales daily actions without moral penalty.',
                  metric: 'Ct = 0.38 · MINIMUM TIER (2 MIN)'
                },
                {
                  step: '02',
                  modeName: 'MODE 02 // 38-POINT PHYLLOTAXIS WITH 1 LIT NODE (SEARCHING)',
                  title: 'Habit Twin Friction Search',
                  desc: 'Monte Carlo synthetic agent runner tests 6 disruption scenarios, identifying catastrophic failure points pre-commitment.',
                  metric: 'SURVIVABILITY: 2/6 -> 5/6 (+38% LIFT)'
                },
                {
                  step: '03',
                  modeName: 'MODE 03 // 5X5 STRUCK GRID WITH 1 ICE ACCENT (EDITING)',
                  title: 'Ethics Governor Filtering',
                  desc: 'Deterministic policy hash intercepts dark patterns, shaming notifications, and caps daily nudges to 3 strictly.',
                  metric: 'POLICY HASH: 368b1932f91a56bc'
                },
                {
                  step: '04',
                  modeName: 'MODE 04 // SETTLED GEOMETRIC SQUARE (ARRIVAL)',
                  title: 'Blameless Flight Recorder & Arrival',
                  desc: 'One-tap barrier attribution synthesizes personal If-Then recovery rules, reducing Recovery Half-Life to 2.1 days.',
                  metric: 'RHL REDUCED FROM 16.5D TO 2.1 DAYS'
                }
              ].map((item, idx) => {
                const isSelected = activeProcessStep === idx;

                return (
                  <div
                    key={item.step}
                    onClick={() => {
                      sound.playTap();
                      setActiveProcessStep(idx);
                    }}
                    className={`p-4 border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'border-l-2 border-l-[#B9E5F3] border-t-[#F5F5F2]/25 border-r-[#F5F5F2]/25 border-b-[#F5F5F2]/25 bg-[#F5F5F2]/10 shadow-sm'
                        : 'border-[#F5F5F2]/10 bg-[#F5F5F2]/[0.02] hover:border-[#F5F5F2]/30 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 font-furniture-mono text-[10.5px]">
                      <span className={isSelected ? 'text-[#B9E5F3] font-bold' : 'text-[#F5F5F2]/60'}>
                        STEP {item.step} // {isSelected ? 'ACTIVE VIEW' : 'CLICK TO INSPECT'}
                      </span>
                      <span className="font-mono text-[10px] text-[#B9E5F3]/80">{item.metric}</span>
                    </div>
                    <h3 className="font-serif text-lg text-white">{item.title}</h3>
                    <p className="text-xs text-[#F5F5F2]/80 font-light mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Square Canvas REDRAWN ENTIRELY Per Step + Large Serif Numeral */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-full max-w-[380px] aspect-square p-6 border border-[#F5F5F2]/20 bg-[#090B0C] flex flex-col items-center justify-center shadow-lg">
                {/* Large Serif Index Numeral Counting 01 to 04 */}
                <div className="absolute top-4 right-6 font-serif-display text-5xl sm:text-6xl text-[#B9E5F3]/70 select-none">
                  0{activeProcessStep + 1}
                </div>

                <canvas
                  ref={processCanvasRef}
                  className="w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] block"
                  aria-label="Process diagram redrawn per step: concentric rings, phyllotaxis point field, struck grid, settled square"
                />

                <div className="absolute bottom-4 inset-x-0 text-center font-furniture-mono text-[10px] text-[#B9E5F3] tracking-widest px-4">
                  {activeProcessStep === 0 && 'CONCENTRIC PULSING RINGS // CAPACITY CT SENSING'}
                  {activeProcessStep === 1 && '38-POINT PHYLLOTAXIS // 1 LIT NODE CYCLING'}
                  {activeProcessStep === 2 && '5X5 STRUCK GRID // DETERMINISTIC GOVERNOR FILTER'}
                  {activeProcessStep === 3 && 'SETTLED GEOMETRIC SQUARE // VERIFIED COMEBACK'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          STAGE 4: PARALLAX PLATE AND CLOSING STATEMENT (Ground on #F5F5F2)
          Rich architectural summary - No blank canvas voids!
          ===================================================================== */}
      <section ref={stage4Ref} className="relative bg-[#F5F5F2] text-[#090B0C] py-20 border-t border-[#090B0C]/10 overflow-hidden">
        {/* Parallaxing 26 contour lines canvas behind */}
        <div className="absolute inset-0 pointer-events-none opacity-80">
          <canvas ref={closingCanvasRef} className="w-full h-full block" aria-hidden="true" />
        </div>

        <div className="relative z-10 w-[91.5vw] max-w-[1360px] mx-auto space-y-12">
          {/* Top Quote Block */}
          <div className="space-y-4 max-w-4xl">
            <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60 block tracking-widest">
              [ PRINCIPLE IV: THE VERIFIED COMEBACK ]
            </span>
            <h2 className="font-serif-display text-4xl sm:text-6xl text-[#090B0C] leading-tight">
              "A habit is not a consecutive streak of perfect days."{' '}
              <span className="font-serif italic text-[#090B0C]/75">
                It is an architecture that endures the bad ones.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#090B0C]/80 max-w-2xl font-light leading-relaxed">
              When fatigue strikes, our BCT 8.7 graded tier shrinks the target to 2 minutes. The habit identity remains continuous, the denominator is shielded, and the user returns without shame.
            </p>
          </div>

          {/* Four Populated Milestone Cards (Eliminates the empty canvas void!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 bg-[#E9E8E4]/90 border border-[#090B0C]/15 space-y-2">
              <span className="font-furniture-mono text-[10px] text-[#090B0C]/60 block">METRIC I</span>
              <span className="text-2xl font-serif text-[#090B0C] block">2.1 Days</span>
              <p className="text-xs text-[#090B0C]/75 font-light">Recovery Half-Life compressed from 16.5 days to 48 hours.</p>
            </div>

            <div className="p-6 bg-[#E9E8E4]/90 border border-[#090B0C]/15 space-y-2">
              <span className="font-furniture-mono text-[10px] text-[#090B0C]/60 block">METRIC II</span>
              <span className="text-2xl font-serif text-[#090B0C] block">64% vs 8%</span>
              <p className="text-xs text-[#090B0C]/75 font-light">24-week longitudinal adherence verified in 5,000 synthetic cohorts.</p>
            </div>

            <div className="p-6 bg-[#E9E8E4]/90 border border-[#090B0C]/15 space-y-2">
              <span className="font-furniture-mono text-[10px] text-[#090B0C]/60 block">METRIC III</span>
              <span className="text-2xl font-serif text-[#090B0C] block">Zero Guilt</span>
              <p className="text-xs text-[#090B0C]/75 font-light">Rolling 28-day consistency with 2 automatic grace exclusions.</p>
            </div>

            <div className="p-6 bg-[#E9E8E4]/90 border border-[#090B0C]/15 space-y-2">
              <span className="font-furniture-mono text-[10px] text-[#090B0C]/60 block">METRIC IV</span>
              <span className="text-2xl font-serif text-[#090B0C] block">k ≥ 20 · ε = 1.0</span>
              <p className="text-xs text-[#090B0C]/75 font-light">Laplace Differential Privacy strictly shielding shift workers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          NORMAL BAND 1: THREE-COLUMN STATEMENT (Paper Ground #F5F5F2)
          ===================================================================== */}
      <section className="bg-[#F5F5F2] text-[#090B0C] py-20 border-t border-[#090B0C]/10">
        <div className="w-[91.5vw] max-w-[1360px] mx-auto space-y-12">
          <div className="max-w-xl space-y-2" data-rev>
            <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60 block">
              THREE FOUNDATIONAL TENETS
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl text-[#090B0C]">
              Quiet <span className="font-serif italic text-[#090B0C]/70">rigor</span> over motivational noise
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-[#E9E8E4] border border-[#090B0C]/10 space-y-3" data-rev>
              <span className="font-furniture-mono text-[10.5px] text-[#090B0C]/60 block">
                01 // BCT 8.7
              </span>
              <h3 className="font-serif text-2xl text-[#090B0C]">
                Radical Elasticity
              </h3>
              <p className="text-xs text-[#090B0C]/75 font-light leading-relaxed">
                Traditional fitness and habit apps force arbitrary 30-minute thresholds. When a user completes 10 minutes instead, the streak counter resets to zero, causing the Abstinence Violation Effect. Rebound introduces three graded tiers: Minimum (2m), Standard (10m), and Stretch (20m). Minimum preserves the identity completely.
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
                A probabilistic Monte Carlo simulation engine that evaluates lifestyle feasibility before day one. It stress-tests schedules against shift rotations, 44°C climate stress, and acute fatigue, proposing greedy elastic patches that elevate survivability from 2 of 6 to 5 of 6.
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
                Enterprise wellness programs often disguise corporate surveillance. Rebound enforces k-anonymity (k ≥ 20) and Laplace Differential Privacy (ε = 1.0). Program sponsors view aggregate persistence, but individual row-level disclosures are mathematically impossible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          NORMAL BAND 2: TERMS TABLE OF RULED ROWS
          ===================================================================== */}
      <section className="bg-[#DEDFDB] text-[#090B0C] py-20 border-t border-[#090B0C]/10">
        <div className="w-[91.5vw] max-w-[1360px] mx-auto space-y-10">
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
      <section className="bg-[#F5F5F2] py-20 border-t border-[#090B0C]/10">
        <div className="w-[91.5vw] max-w-[1360px] mx-auto space-y-10">
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
          ===================================================================== */}
      <section className="bg-[#DEDFDB] text-[#090B0C] py-20 border-t border-[#090B0C]/10">
        <div className="w-[91.5vw] max-w-[1360px] mx-auto space-y-10">
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
              <details key={idx} className="group py-4 transition">
                <summary className="flex items-center justify-between cursor-pointer focus:outline-none">
                  <span className="font-serif text-lg sm:text-xl text-[#090B0C] group-hover:text-[#090B0C]/70 transition">
                    {faq.q}
                  </span>
                  <span className="faq-plus text-[#090B0C] shrink-0 ml-4" />
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-[#090B0C]/75 font-light leading-relaxed pr-8 font-body-sans">
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
        <div className="w-[91.5vw] max-w-[1360px] mx-auto space-y-10">
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
