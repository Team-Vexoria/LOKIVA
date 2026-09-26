import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowRight, Sparkles } from 'lucide-react';
import { TripOnboardingTakeover, TripContextAnswers } from '../onboarding/TripOnboardingTakeover';
import { DayPlanResponse } from '../../types';

const CYCLING_CONSTRAINTS = [
  '₹20,000 Strict Ceiling',
  'Step-Free Temple Access',
  'Real Auto Buffers Added',
  'Zero Tourist Traps',
  'Generational Guilds Only',
];

// ─────────────────────────────────────────────────────────────────────────────
// TransparentMonumentFlank
// Renders real Indian monuments with automatic alpha knockout and sacred halo
// ─────────────────────────────────────────────────────────────────────────────
function TransparentMonumentFlank({
  imageUrl,
  fallbackUrl,
  alt,
  side,
  motionX,
  motionY,
}: {
  imageUrl: string;
  fallbackUrl: string;
  alt: string;
  side: 'left' | 'right';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  motionX?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  motionY?: any;
}) {
  const [processedSrc, setProcessedSrc] = React.useState<string>(imageUrl);

  React.useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Strip bright sky / white / pale background pixels to 100% transparent alpha
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Detect sky-blue, pale white, or light gray studio backdrop pixels
          const isBrightWhite = r > 230 && g > 230 && b > 225;
          const isSkyBlue = b > r + 15 && b > 145 && g > 135;
          const isPaleSky = r > 190 && g > 205 && b > 215;

          if (isBrightWhite || isSkyBlue || isPaleSky) {
            data[i + 3] = 0; // Make background pixel completely transparent
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setProcessedSrc(canvas.toDataURL('image/png'));
      } catch {
        // If CORS blocks pixel manipulation, use the image directly
        setProcessedSrc(imageUrl);
      }
    };

    img.onerror = () => {
      setProcessedSrc(fallbackUrl);
    };
  }, [imageUrl, fallbackUrl]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        ...(side === 'left' ? { left: '-30px' } : { right: '-30px' }),
        transform: `translateY(-50%) rotate(${side === 'left' ? '-8deg' : '8deg'})`,
        width: 'clamp(260px, 28vw, 440px)',
        height: 'clamp(340px, 36vw, 540px)',
        zIndex: 10,
        pointerEvents: 'none',
      }}
      className="flex items-center justify-center"
    >
      {/* Sacred Geometry Sun Halo Behind the Transparent Monument (NO RECTANGULAR BOX) */}
      <div className="absolute w-56 h-56 sm:w-64 sm:h-64 xl:w-72 xl:h-72 rounded-full border border-dashed border-[#B84A27]/25 animate-[spin_60s_linear_infinite]" />
      <div className="absolute w-44 h-44 sm:w-52 sm:h-52 xl:w-60 xl:h-60 rounded-full bg-gradient-to-tr from-[#D99B43]/15 via-[#B84A27]/10 to-transparent blur-2xl" />

      {/* Monument Cutout: Motion layer with 3D parallax nudge */}
      <motion.div
        style={{
          x: motionX,
          y: motionY,
          WebkitMaskImage:
            side === 'left'
              ? 'radial-gradient(ellipse 92% 85% at 35% 48%, rgba(0,0,0,1) 55%, rgba(0,0,0,0.7) 78%, rgba(0,0,0,0) 100%)'
              : 'radial-gradient(ellipse 92% 85% at 65% 48%, rgba(0,0,0,1) 55%, rgba(0,0,0,0.7) 78%, rgba(0,0,0,0) 100%)',
          maskImage:
            side === 'left'
              ? 'radial-gradient(ellipse 92% 85% at 35% 48%, rgba(0,0,0,1) 55%, rgba(0,0,0,0.7) 78%, rgba(0,0,0,0) 100%)'
              : 'radial-gradient(ellipse 92% 85% at 65% 48%, rgba(0,0,0,1) 55%, rgba(0,0,0,0.7) 78%, rgba(0,0,0,0) 100%)',
        }}
        initial={{
          opacity: 0,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full h-full flex items-end justify-center overflow-visible"
      >
        <img
          src={processedSrc}
          alt={alt}
          className="w-full h-full object-contain object-bottom drop-shadow-[0_22px_35px_rgba(59,35,22,0.18)] sepia-[0.22] contrast-[1.08] saturate-[1.1]"
        />
      </motion.div>
    </div>
  );
}

export function LandingHero({
  onOpenDiscovery,
  onExploreAll,
}: {
  onOpenDiscovery?: () => void;
  onExploreAll?: () => void;
}) {
  const navigate = useNavigate();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const handlePlanGenerated = (answers: TripContextAnswers, plan: DayPlanResponse) => {
    navigate('/itinerary');
  };

  const handlePrimaryClick = () => {
    if (onOpenDiscovery) {
      onOpenDiscovery();
    } else {
      setIsOnboardingOpen(true);
    }
  };

  const handleExploreClick = () => {
    if (onExploreAll) {
      onExploreAll();
    } else {
      navigate('/explore');
    }
  };

  // Cycling text state (unboxed kinetic text morph)
  const [constraintIndex, setConstraintIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setConstraintIndex((prev) => (prev + 1) % CYCLING_CONSTRAINTS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Smooth 3D Mouse Parallax for Diagonal Video Portals
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 28, stiffness: 110 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const leftTranslateX = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);
  const leftTranslateY = useTransform(smoothY, [-0.5, 0.5], [-14, 14]);
  const leftRotate = useTransform(smoothX, [-0.5, 0.5], [-15, -10]);

  const rightTranslateX = useTransform(smoothX, [-0.5, 0.5], [16, -16]);
  const rightTranslateY = useTransform(smoothY, [-0.5, 0.5], [14, -14]);
  const rightRotate = useTransform(smoothX, [-0.5, 0.5], [10, 15]);

  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);

  // Auto-play flank videos reliably with multiple trigger listeners
  useEffect(() => {
    const playFlanks = () => {
      if (leftVideoRef.current) {
        leftVideoRef.current.muted = true;
        leftVideoRef.current.play().catch(() => {});
      }
      if (rightVideoRef.current) {
        rightVideoRef.current.muted = true;
        rightVideoRef.current.play().catch(() => {});
      }
    };
    playFlanks();
    const timer = setTimeout(playFlanks, 150);
    const events = ['click', 'touchstart', 'scroll', 'mousemove', 'mouseenter'];
    events.forEach((ev) => window.addEventListener(ev, playFlanks, { once: true, passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, playFlanks));
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-[calc(100vh-4.5rem)] flex flex-col justify-between pt-6 sm:pt-8 pb-0 bg-[#FAF6F0] overflow-hidden select-none"
    >
      {/* Onboarding Full-Screen Modal Takeover */}
      <TripOnboardingTakeover
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onPlanGenerated={handlePlanGenerated}
      />

      {/* Subtle Warm Topographic Contour Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04] text-[#5C3D2E]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        fill="none"
      >
        <path d="M-100 180 C320 120, 620 340, 1540 90" stroke="currentColor" strokeWidth="1.5" />
        <path d="M-100 380 C420 260, 820 520, 1540 260" stroke="currentColor" strokeWidth="1.5" />
        <path d="M-100 660 C260 510, 760 760, 1540 540" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      {/* Warm Ambient Saffron Glow Behind Center Copy */}
      <div className="absolute top-[36%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[340px] bg-gradient-to-tr from-[#D99B43]/15 via-[#B84A27]/10 to-transparent rounded-full blur-[110px] pointer-events-none" />

      {/* LEFT DIAGONAL MONUMENT CUTOUT: 3D Canva-Style Hawa Mahal Cutout */}
      <TransparentMonumentFlank
        side="left"
        imageUrl="/monument_hawa_mahal.png"
        fallbackUrl="/monument_hawa_mahal.jpg"
        alt="Hawa Mahal Jaipur 3D Canva-Style Cutout"
        motionX={leftTranslateX}
        motionY={leftTranslateY}
      />

      {/* RIGHT DIAGONAL MONUMENT CUTOUT: 3D Canva-Style India Gate Cutout */}
      <TransparentMonumentFlank
        side="right"
        imageUrl="/monument_india_gate.png"
        fallbackUrl="/monument_india_gate.jpg"
        alt="India Gate 3D Canva-Style Cutout"
        motionX={rightTranslateX}
        motionY={rightTranslateY}
      />

      {/* ── CENTER EDITORIAL HERO ARCHITECTURE (NO TABULAR PILL BOXES) ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center flex-1 flex flex-col justify-center items-center my-auto py-2">
        {/* 1. NON-TABULAR ARCHITECTURAL MASTHEAD (Replaces Top White Pill Box) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mb-5"
        >
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: 44 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="h-[1px] bg-gradient-to-r from-transparent to-[#B84A27]"
          />
          <span className="font-meta text-[11px] sm:text-xs font-bold tracking-[0.22em] text-[#B84A27] uppercase flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rotate-45 bg-[#D99B43]" />
            Pan-India Cultural Discovery Engine
            <span className="inline-block w-1.5 h-1.5 rotate-45 bg-[#D99B43]" />
          </span>
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: 44 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="h-[1px] bg-gradient-to-l from-transparent to-[#B84A27]"
          />
        </motion.div>

        {/* 2. MAIN DISPLAY HEADLINE (Deep Roasted Espresso #3B2316 instead of Cold Black) */}
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-[62px] text-[#3B2316] tracking-tight leading-[1.1] max-w-3xl">
          Real Indian Cultural Experiences.{' '}
          <span className="block mt-1 sm:mt-2">
            Packed Around Your{' '}
            <span className="relative inline-block text-[#B84A27]">
              Exact Constraints.
              <svg
                className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-2.5 sm:h-3 text-[#D99B43] opacity-90 pointer-events-none"
                viewBox="0 0 250 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 9C50 3 150 2 247 8"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </span>
        </h1>

        {/* 3. UNBOXED KINETIC BLUR-MORPH CALLOUT (Replaces the Yellow Pill Box) */}
        <div className="h-9 flex items-center justify-center mt-4 sm:mt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={constraintIndex}
              initial={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex items-center gap-3 font-heading italic text-sm sm:text-base font-bold text-[#A63E1E] tracking-wide"
            >
              <span className="text-[#D99B43] font-normal not-italic">✦</span>
              <span className="border-b border-dashed border-[#D99B43]/70 pb-0.5">
                {CYCLING_CONSTRAINTS[constraintIndex]}
              </span>
              <span className="text-[#D99B43] font-normal not-italic">✦</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. NARRATIVE SUBTITLE & EDITORIAL FOOTNOTE */}
        <p className="font-meta text-xs sm:text-base text-[#5C3D2E] max-w-xl mx-auto mt-2 leading-relaxed">
          Discover authentic artisan guilds and living heritage, packed into feasible cultural circuits built around your time and budget.
        </p>

        <div className="mt-2.5 font-meta text-[11px] sm:text-xs text-[#8C6751] font-semibold tracking-[0.16em] uppercase">
          Curated Across{' '}
          <span className="text-[#B84A27] font-extrabold underline decoration-[#D99B43]/60 underline-offset-4">
            36 States & Union Territories
          </span>
        </div>

        {/* 5. CLEAN NON-TABULAR LUXURY ACTION STAGE (Fixes Wrapped Text & Broken Pill) */}
        <div className="mt-7 sm:mt-8 flex flex-col items-center gap-4 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
            {/* Primary Action Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrimaryClick}
              className="w-full sm:w-auto whitespace-nowrap px-8 py-4 rounded-full bg-gradient-to-r from-[#B84A27] via-[#C85A32] to-[#D98A36] text-[#FFFDF9] font-heading font-extrabold text-sm sm:text-[15px] tracking-wide shadow-[0_14px_30px_-8px_rgba(184,74,39,0.45)] hover:shadow-[0_18px_38px_-6px_rgba(184,74,39,0.6)] transition-all cursor-pointer flex items-center justify-center gap-2.5"
            >
              <span>Plan Instant Micro-Itinerary</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </motion.button>

            {/* Secondary Action Button: Guaranteed Single Line (whitespace-nowrap) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExploreClick}
              className="w-full sm:w-auto whitespace-nowrap px-7 py-4 rounded-full bg-[#F5EDE0]/90 hover:bg-[#FFFDF9] border border-[#DFCBB2] hover:border-[#B84A27] text-[#3B2316] font-heading font-bold text-sm sm:text-[15px] tracking-wide shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#B84A27] shrink-0" />
              <span>Explore 36 States</span>
            </motion.button>
          </div>

          {/* Non-Tabular Editorial Signature & AI Concierge Redirect */}
          <button
            type="button"
            onClick={() => navigate('/ai-guide')}
            className="flex items-center gap-2.5 text-[#7A5C49] hover:text-[#3B2316] font-meta text-xs sm:text-[13px] italic transition-all cursor-pointer group"
          >
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F2E5D5] group-hover:bg-[#B84A27] text-[#9E4726] group-hover:text-[#FFFDF9] not-italic font-bold text-[11px] tracking-wider uppercase transition-all shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D99B43] group-hover:text-[#FFFDF9] transition-colors" />
              <span>Instant AI Solver</span>
            </span>
            <span className="group-hover:underline underline-offset-4 transition-all">
              Solves verified micro-circuits in ~60 seconds with zero tourist markups →
            </span>
          </button>
        </div>
      </div>

      {/* ── PRESERVED BOTTOM VIDEO PEEK FOLD ── */}
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 mt-auto pointer-events-none z-10">
        <div className="w-full h-20 sm:h-28 lg:h-36 rounded-t-[32px] sm:rounded-t-[44px] overflow-hidden border-t-4 border-x-4 border-[#FFFDF9] shadow-2xl bg-[#3B2316] relative">
          <video
            src="/landing_video.mp4"
            poster="/lokiva_background.avif"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#3B2316]/30" />
        </div>
      </div>
    </section>
  );
}

export default LandingHero;
