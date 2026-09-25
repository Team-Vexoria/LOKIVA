import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Compass, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  SquiggleUnderline,
  HandDrawnArrow,
  StampBadge,
} from '../ui/HandDrawnAnnotations';
import { TripOnboardingTakeover, TripContextAnswers } from '../onboarding/TripOnboardingTakeover';
import { DayPlanResponse } from '../../types';

gsap.registerPlugin(ScrollTrigger);

interface HeroScrollExperienceProps {
  onOpenPlanner?: () => void;
}

export function HeroScrollExperience({}: HeroScrollExperienceProps) {
  const navigate = useNavigate();

  // ─── Onboarding state ──────────────────────────────────────────────────────
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [solvedPlan, setSolvedPlan] = useState<{
    answers: TripContextAnswers;
    plan: DayPlanResponse;
  } | null>(null);
  const handlePlanGenerated = (answers: TripContextAnswers, plan: DayPlanResponse) => {
    setSolvedPlan({ answers, plan });
    // Navigate directly to /itinerary so user sees and edits their curated plan
    navigate('/itinerary');
  };

  // ─── GSAP refs ─────────────────────────────────────────────────────────────
  const pinContainerRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const mediaCardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayTextRef = useRef<HTMLDivElement>(null);

  // ─── Native Scroll Tracking for Scroll-Triggered Video Playback ───────────
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.pause();
    }

    const checkPlayback = () => {
      const vid = videoRef.current;
      if (!vid) return;
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const vh = window.innerHeight;

      // Only play once the user has begun scrolling down (scrollY >= 50px) to reveal the video
      // and pause when at the top hero section or past the pinned showcase section (vh * 2.2)
      if (scrollY >= 50 && scrollY < vh * 2.2) {
        if (vid.paused) {
          vid.muted = true;
          const playPromise = vid.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        }
      } else {
        if (!vid.paused) {
          vid.pause();
        }
      }
    };

    window.addEventListener('scroll', checkPlayback, { passive: true });
    window.addEventListener('resize', checkPlayback, { passive: true });
    // Check initial position (will pause if at top)
    checkPlayback();

    return () => {
      window.removeEventListener('scroll', checkPlayback);
      window.removeEventListener('resize', checkPlayback);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // PINNED HERO + EXPANDING FULLSCREEN VIDEO TIMELINE
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinContainerRef.current,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 0.3,
          anticipatePin: 1,
          snap: {
            snapTo: [0, 1],
            delay: 0.05,
            duration: { min: 0.2, max: 0.35 },
            ease: 'power2.inOut',
          },
        },
      });

      tl
        // 1. Hero text fades out and floats up on first scroll touch
        .to(
          heroContentRef.current,
          { opacity: 0, y: -25, ease: 'power2.out', duration: 0.1 },
          0
        )

        // 2. Video card expands directly to 100vw x 100vh full screen in first 10% of scroll
        .to(
          mediaCardRef.current,
          {
            top: '0%',
            left: '0%',
            right: '0%',
            borderRadius: '0px',
            boxShadow: 'none',
            ease: 'power3.out',
            duration: 0.12,
          },
          0
        )

        // 3. Overlay text appears smoothly on full screen
        .fromTo(
          overlayTextRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, ease: 'power2.out', duration: 0.15 },
          0.08
        );
    }, pinContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    /* ─── PINNED HERO + SHOWREEL SECTION ─────────────────────────────────── */
    <section
      ref={pinContainerRef}
      className="relative w-full h-screen overflow-hidden bg-[#FAF7F2]"
    >
      {/* Onboarding modal (full-screen takeover, outside scroll flow) */}
      <TripOnboardingTakeover
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onPlanGenerated={handlePlanGenerated}
      />

          {/* ── HERO CONTENT (fades out / floats up during scrub) ─────────────── */}
          <div
            ref={heroContentRef}
            className="absolute inset-x-0 top-0 z-10 flex flex-col items-center text-center pt-20 sm:pt-24 px-4 pointer-events-auto"
          >
          {/* Decorative monument cutouts - background layer */}
          <div
            className="pointer-events-none select-none absolute inset-0 overflow-hidden hidden lg:block"
            aria-hidden="true"
          >
            <div className="absolute left-0 xl:left-4 top-20 lg:top-24 xl:top-28 w-36 lg:w-44 xl:w-52 -rotate-3">
              <img
                src="/assets/monuments/hawa-mahal-cutout.png"
                alt=""
                loading="lazy"
                className="w-full h-auto object-contain opacity-60 filter drop-shadow-[0_8px_18px_rgba(18,33,59,0.06)]"
              />
            </div>
            <div className="absolute right-0 xl:right-4 top-20 lg:top-24 xl:top-28 w-36 lg:w-40 xl:w-48 -rotate-2">
              <img
                src="/assets/monuments/taj-mahal-cutout.png"
                alt=""
                loading="lazy"
                className="w-full h-auto object-contain opacity-60 filter drop-shadow-[0_8px_18px_rgba(18,33,59,0.06)]"
              />
            </div>
          </div>

          {/* Stamp badge */}
          <div className="flex items-center justify-center gap-2 mb-3 relative z-10">
            <StampBadge text="PAN-INDIA CULTURAL DISCOVERY ENGINE" />
          </div>

          {/* Headline */}
          <h1 className="relative z-10 text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-[#12213B] tracking-tight leading-[1.12] max-w-3xl mx-auto">
            <span>Real Indian Cultural Experiences.</span>
            <br />
            <span className="relative inline-block mt-1">
              <span>Packed Around Your </span>
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#C1443B] via-[#E25C34] to-[#F59E0B]">
                Exact Constraints.
                <SquiggleUnderline className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-4 sm:h-5" />
              </span>
            </span>
          </h1>

          {/* Supporting line */}
          <p className="relative z-10 pt-3 text-sm sm:text-base text-[#5B6B8C] font-sans max-w-xl mx-auto leading-relaxed px-2">
            India's living artisan guilds, sacred stepwells, and vernacular heritage are scattered across oral lore. LOKIVA evaluates real street transit buffers, opening schedules, and budget limits to build cultural micro-circuits that actually work.
          </p>

          {/* Verification line */}
          <div className="relative z-10 flex items-center justify-center gap-2 pt-2 text-xs font-heading font-bold text-[#5B6B8C] tracking-wider uppercase">
            <MapPin className="w-3.5 h-3.5 text-[#C1443B]" />
            <span>Curated Across</span>
            <span className="font-mono text-[#12213B] font-extrabold text-sm">36</span>
            <span>States &amp; Union Territories</span>
          </div>

          {/* CTAs */}
          <div className="relative z-10 pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
            <div className="relative inline-flex items-center w-full sm:w-auto justify-center">
              <div className="hidden md:flex items-center gap-1 absolute -left-24 top-1/2 -translate-y-1/2 pointer-events-none select-none">
                <span className="font-display italic text-xs font-bold text-[#C1443B] transform -rotate-6 whitespace-nowrap">
                  Takes 60s
                </span>
                <HandDrawnArrow className="w-11 h-6 -mr-1 text-[#C1443B]" />
              </div>
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(true)}
                className="w-full sm:w-auto justify-center px-8 py-3.5 rounded-2xl bg-[#FFC067] hover:bg-[#F5B24E] text-[#12213B] font-heading text-sm sm:text-base font-extrabold tracking-wide transition-all duration-200 shadow-lg shadow-[#FFC067]/35 hover:shadow-xl border border-[#E5A84B]/60 flex items-center gap-3 active:scale-[0.98] cursor-pointer group"
              >
                <span>{solvedPlan ? 'Adjust Your Micro-Circuit' : 'Plan Instant Micro-Itinerary'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FFF9EE] text-[#12213B] font-heading text-sm font-bold tracking-wide border border-[#DDD7CC] hover:border-[#FFC067] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Compass className="w-4 h-4 text-[#C1443B] group-hover:scale-110 transition-transform" />
              <span>Explore 36 States</span>
            </button>
          </div>
        </div>

        {/* ── EXPANDING MEDIA CARD ──────────────────────────────────────────── */}
        {/* Absolutely positioned inside the h-screen pinned section.
            Initial insets create a ~70vw x 55vh centered-bottom card.
            GSAP animates top/left/right to 0% making it fill 100vw x 100vh.
            bottom stays at 0 throughout - card grows UPWARD (Spain Collection style). */}
        <div
          ref={mediaCardRef}
          className="absolute overflow-hidden will-change-transform z-20"
          style={{
            top: '93%',
            left: '8%',
            right: '8%',
            bottom: '0%',
            borderRadius: '24px 24px 0px 0px',
            boxShadow: '0 -8px 30px rgba(18, 33, 59, 0.12)',
          }}
        >
          {/* Scroll-Triggered Landing Video */}
          <video
            ref={videoRef}
            src="/landing_video.mp4"
            autoPlay={false}
            playsInline
            muted
            loop
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Minimal scrim so the video remains completely visible in full screen */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

          {/* Overlay text: almost transparent LOKIVA watermark + crisp non-transparent text below */}
          <div
            ref={overlayTextRef}
            className="absolute bottom-8 sm:bottom-14 inset-x-0 z-10 text-center px-4 pointer-events-none flex flex-col items-center justify-center"
            style={{ opacity: 0 }}
          >
            {/* Almost transparent LOKIVA text as requested */}
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-[0.25em] uppercase text-white/20 select-none drop-shadow-sm">
              LOKIVA
            </h2>

            {/* Non-transparent crisp concise texts below */}
            <div className="mt-1.5 sm:mt-2 space-y-1">
              <p className="text-xs sm:text-sm font-heading font-extrabold uppercase tracking-widest text-[#FFC067] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Living Heritage &bull; Real Transit Hours
              </p>
              <p className="text-xs sm:text-sm md:text-base font-sans font-semibold text-white tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-lg mx-auto">
                Where living traditions meet curated cultural micro-circuits.
              </p>
            </div>
          </div>
        </div>
    </section>
  );
}

export default HeroScrollExperience;
