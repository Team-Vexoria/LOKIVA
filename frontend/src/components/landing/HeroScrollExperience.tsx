import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, ArrowRight, Compass, MapPin } from 'lucide-react';
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
  onWatchFilm?: () => void;
  onOpenPlanner?: () => void;
}

export function HeroScrollExperience({ onWatchFilm }: HeroScrollExperienceProps) {
  const navigate = useNavigate();

  // ─── Onboarding state (was in LokivaLandingHero, now lives here) ───────────
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [solvedPlan, setSolvedPlan] = useState<{
    answers: TripContextAnswers;
    plan: DayPlanResponse;
  } | null>(null);
  const handlePlanGenerated = (answers: TripContextAnswers, plan: DayPlanResponse) => {
    setSolvedPlan({ answers, plan });
  };

  // ─── GSAP refs ─────────────────────────────────────────────────────────────
  const pinContainerRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const mediaCardRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLDivElement>(null);
  const overlayTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinContainerRef.current,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      tl
        // 1. Hero text fades out and floats up
        .to(
          heroContentRef.current,
          { opacity: 0, y: -40, ease: 'power1.out', duration: 0.4 },
          0
        )

        // 2. Card expands: top + left + right insets collapse to 0, border-radius → 0
        .to(
          mediaCardRef.current,
          {
            top: '0%',
            left: '0%',
            right: '0%',
            borderRadius: '0px',
            boxShadow: '0 0px 0px rgba(0, 0, 0, 0)',
            ease: 'power2.inOut',
            duration: 1,
          },
          0
        )

        // 3. Overlay text appears mid-scrub
        .fromTo(
          overlayTextRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, ease: 'power1.out', duration: 0.6 },
          0.3
        )

        // 4. Play button appears mid-scrub
        .fromTo(
          playButtonRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, ease: 'power1.out', duration: 0.6 },
          0.3
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
            className="absolute inset-x-0 top-0 z-10 flex flex-col items-center text-center pt-8 sm:pt-10 px-4 pointer-events-auto"
          >
          {/* Decorative monument cutouts - background layer */}
          <div
            className="pointer-events-none select-none absolute inset-0 overflow-hidden hidden lg:block"
            aria-hidden="true"
          >
            <div className="absolute left-0 xl:left-4 top-4 w-36 lg:w-44 xl:w-52 -rotate-3">
              <img
                src="/assets/monuments/hawa-mahal-cutout.png"
                alt=""
                loading="lazy"
                className="w-full h-auto object-contain opacity-60 filter drop-shadow-[0_8px_18px_rgba(18,33,59,0.06)]"
              />
            </div>
            <div className="absolute right-0 xl:right-4 top-2 w-36 lg:w-40 xl:w-48 -rotate-2">
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
            top: '85%',
            left: '8%',
            right: '8%',
            bottom: '0%',
            borderRadius: '24px 24px 0px 0px',
            boxShadow: '0 -8px 30px rgba(18, 33, 59, 0.12)',
          }}
        >
          {/* Background image */}
          <img
            src="/lokiva_background.avif"
            alt="Snowy Himalayan mountain passes with an illuminated winding path"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
          />

          {/* Dark scrim (always present at low opacity) */}
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />

          {/* Play button (fades in during scrub) */}
          <div
            ref={playButtonRef}
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={onWatchFilm}
              className="group relative flex items-center justify-center cursor-pointer"
              title="Watch Film"
            >
              <span className="absolute w-24 h-24 rounded-full bg-white/20 animate-ping" />
              <span className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                <Play className="w-7 h-7 fill-white ml-1" />
              </span>
            </button>
          </div>

          {/* Overlay text - bottom-left, fades in during scrub */}
          <div
            ref={overlayTextRef}
            className="absolute bottom-10 left-10 right-10 sm:bottom-14 sm:left-14 z-10 text-white"
            style={{ opacity: 0 }}
          >
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-lg max-w-3xl">
              Where Ancient Passes Meet Living Traditions.
            </h2>
            <p className="text-sm sm:text-base text-white/80 font-sans font-medium leading-relaxed max-w-2xl mt-3 drop-shadow-md">
              From high Himalayan ridges to generational artisan guilds, LOKIVA packages unscripted cultural heritage around your real transit hours.
            </p>
          </div>
        </div>
    </section>
  );
}

export default HeroScrollExperience;
