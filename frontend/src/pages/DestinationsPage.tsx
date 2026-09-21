import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MapPin,
  Compass,
  Building2,
  Play,
  Pause,
} from 'lucide-react';
import { SHOWCASE_DESTINATIONS, ShowcaseDestination } from '../data/destinationsShowcaseData';

export function DestinationsPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerProgress, setTimerProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentDestination = SHOWCASE_DESTINATIONS[activeIndex];
  const incomingDestination = incomingIndex !== null ? SHOWCASE_DESTINATIONS[incomingIndex] : null;

  // Queue cards: next 4 destinations wrapped with modulo arithmetic
  const queueCards = [1, 2, 3, 4].map((offset) => {
    const idx = (activeIndex + offset) % SHOWCASE_DESTINATIONS.length;
    return {
      destination: SHOWCASE_DESTINATIONS[idx],
      index: idx,
      offset,
    };
  });

  // GSAP Transition Next
  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const nextIndex = (activeIndex + 1) % SHOWCASE_DESTINATIONS.length;
    setIncomingIndex(nextIndex);

    const tl = gsap.timeline({
      onComplete: () => {
        setActiveIndex(nextIndex);
        setIncomingIndex(null);
        gsap.set(
          '.destination-title, .destination-tagline, .destination-desc, .destination-telemetry, .destination-actions, .destination-watermark',
          { y: 0, opacity: 1, clearProps: 'transform,opacity' }
        );
        gsap.set('.queue-card', { xPercent: 0, clearProps: 'transform' });
        setIsAnimating(false);
      },
    });

    // 1. Text Exit (Slide up and fade out)
    tl.to(
      '.destination-title',
      { y: -50, opacity: 0, duration: 0.35, ease: 'power2.in' },
      0
    )
      .to(
        '.destination-tagline, .destination-desc, .destination-telemetry, .destination-actions',
        { y: -30, opacity: 0, duration: 0.3, stagger: 0.04, ease: 'power2.in' },
        0
      )
      .to(
        '.destination-watermark',
        { y: -60, opacity: 0, duration: 0.4, ease: 'power2.in' },
        0
      );

    // 2. Queue Cards Slide Left in unison
    tl.to(
      '.queue-card',
      { xPercent: -110, duration: 0.75, ease: 'power3.inOut', stagger: 0.04 },
      0.08
    );

    // 3. Background crossfade and subtle zoom
    tl.fromTo(
      '.incoming-bg',
      { opacity: 0, scale: 1.06 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' },
      0.1
    );

    // 4. Incoming Text Entrance (Slide up from below)
    tl.fromTo(
      '.destination-title-incoming',
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      0.35
    )
      .fromTo(
        '.destination-tagline-incoming, .destination-desc-incoming, .destination-telemetry-incoming, .destination-actions-incoming',
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' },
        0.42
      )
      .fromTo(
        '.destination-watermark-incoming',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 0.04, duration: 0.6, ease: 'power3.out' },
        0.4
      );
  }, [activeIndex, isAnimating]);

  // GSAP Transition Prev
  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const prevIndex =
      (activeIndex - 1 + SHOWCASE_DESTINATIONS.length) % SHOWCASE_DESTINATIONS.length;
    setIncomingIndex(prevIndex);

    const tl = gsap.timeline({
      onComplete: () => {
        setActiveIndex(prevIndex);
        setIncomingIndex(null);
        gsap.set(
          '.destination-title, .destination-tagline, .destination-desc, .destination-telemetry, .destination-actions, .destination-watermark',
          { y: 0, opacity: 1, clearProps: 'transform,opacity' }
        );
        gsap.set('.queue-card', { xPercent: 0, clearProps: 'transform' });
        setIsAnimating(false);
      },
    });

    // 1. Text Exit (Slide down and fade out)
    tl.to(
      '.destination-title',
      { y: 50, opacity: 0, duration: 0.35, ease: 'power2.in' },
      0
    )
      .to(
        '.destination-tagline, .destination-desc, .destination-telemetry, .destination-actions',
        { y: 30, opacity: 0, duration: 0.3, stagger: 0.04, ease: 'power2.in' },
        0
      )
      .to(
        '.destination-watermark',
        { y: 60, opacity: 0, duration: 0.4, ease: 'power2.in' },
        0
      );

    // 2. Queue Cards Slide Right
    tl.to(
      '.queue-card',
      { xPercent: 110, duration: 0.75, ease: 'power3.inOut', stagger: 0.04 },
      0.08
    );

    // 3. Background crossfade and subtle zoom
    tl.fromTo(
      '.incoming-bg',
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' },
      0.1
    );

    // 4. Incoming Text Entrance (Slide down from above)
    tl.fromTo(
      '.destination-title-incoming',
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
      0.35
    )
      .fromTo(
        '.destination-tagline-incoming, .destination-desc-incoming, .destination-telemetry-incoming, .destination-actions-incoming',
        { y: -35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power3.out' },
        0.42
      )
      .fromTo(
        '.destination-watermark-incoming',
        { y: -60, opacity: 0 },
        { y: 0, opacity: 0.04, duration: 0.6, ease: 'power3.out' },
        0.4
      );
  }, [activeIndex, isAnimating]);

  // Jump to specific index
  const jumpToIndex = (targetIndex: number) => {
    if (targetIndex === activeIndex || isAnimating) return;
    setIsAnimating(true);
    setIncomingIndex(targetIndex);

    const tl = gsap.timeline({
      onComplete: () => {
        setActiveIndex(targetIndex);
        setIncomingIndex(null);
        gsap.set(
          '.destination-title, .destination-tagline, .destination-desc, .destination-telemetry, .destination-actions, .destination-watermark',
          { y: 0, opacity: 1, clearProps: 'transform,opacity' }
        );
        gsap.set('.queue-card', { xPercent: 0, clearProps: 'transform' });
        setIsAnimating(false);
      },
    });

    tl.to(
      '.destination-title, .destination-tagline, .destination-desc, .destination-telemetry, .destination-actions',
      { opacity: 0, y: -40, duration: 0.3, ease: 'power2.in' },
      0
    );

    tl.fromTo(
      '.incoming-bg',
      { opacity: 0, scale: 1.05 },
      { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out' },
      0.1
    );

    tl.fromTo(
      '.destination-title-incoming',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
      0.35
    ).fromTo(
      '.destination-tagline-incoming, .destination-desc-incoming, .destination-telemetry-incoming, .destination-actions-incoming',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.04, ease: 'power3.out' },
      0.4
    );
  };

  // 10-Second Auto-Advance Interval with smooth progress
  useEffect(() => {
    if (isPaused) return;

    const tickMs = 50;
    const totalMs = 10000;
    const increment = (tickMs / totalMs) * 100;

    const timer = setInterval(() => {
      setTimerProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, tickMs);

    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  // Reset timer progress whenever slide changes
  useEffect(() => {
    setTimerProgress(0);
  }, [activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Seconds remaining for countdown label
  const secondsRemaining = Math.max(1, Math.ceil(((100 - timerProgress) / 100) * 10));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none bg-black text-white z-20"
    >
      {/* ─── 1. FULL-BLEED BACKGROUND MEDIA CANVAS ──────────────────────────── */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden -z-10 pointer-events-none">
        {/* Active Background Layer */}
        <div className="absolute inset-0 w-full h-full">
          {currentDestination.bgVideo && activeIndex === 0 ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover filter contrast-105"
              src={currentDestination.bgVideo}
              poster={currentDestination.bgMedia}
            />
          ) : (
            <img
              src={currentDestination.bgMedia}
              alt={currentDestination.name}
              className="w-full h-full object-cover filter contrast-105"
            />
          )}
        </div>

        {/* Incoming Background Layer during active transition */}
        {incomingDestination && (
          <div className="incoming-bg absolute inset-0 w-full h-full z-10 opacity-0">
            <img
              src={incomingDestination.bgMedia}
              alt={incomingDestination.name}
              className="w-full h-full object-cover filter contrast-105"
            />
          </div>
        )}

        {/* Cinematic Scrim Gradient: ensures text readability on left while keeping right visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/25 z-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-20" />
      </div>

      {/* ─── 2. PAUSE / PLAY OPTION ON TOP ──────────────────────────────────── */}
      <div className="fixed top-4 sm:top-5 right-4 sm:right-8 z-40 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setIsPaused((prev) => !prev)}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/20 bg-black/60 hover:bg-black/85 hover:border-[#FFC067] text-white text-xs font-mono font-bold tracking-wider backdrop-blur-md transition-all cursor-pointer shadow-xl hover:scale-105 active:scale-95"
          title={isPaused ? 'Resume auto slideshow (10s)' : 'Pause auto slideshow'}
        >
          {isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 text-[#FFC067] fill-[#FFC067]" />
              <span className="uppercase text-[11px] text-[#FFC067]">Resume</span>
            </>
          ) : (
            <>
              {/* Circular 10s progress countdown ring */}
              <div className="relative w-4 h-4 flex items-center justify-center">
                <svg className="w-4 h-4 -rotate-90">
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-white/20"
                    fill="none"
                  />
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="#FFC067"
                    strokeWidth="2"
                    strokeDasharray={37.7}
                    strokeDashoffset={37.7 - (37.7 * timerProgress) / 100}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-[stroke-dashoffset] duration-75"
                  />
                </svg>
              </div>
              <Pause className="w-3.5 h-3.5 text-white/90" />
              <span className="uppercase text-[11px] text-white/90">
                Pause ({secondsRemaining}s)
              </span>
            </>
          )}
        </button>
      </div>

      {/* ─── 3. WATERMARK HOLLOW TYPOGRAPHY (BOTTOM-LEFT) ───────────────────── */}
      <div className="destination-watermark absolute left-6 sm:left-12 lg:left-20 bottom-8 sm:bottom-12 text-[13vw] font-display font-black uppercase text-white/[0.04] pointer-events-none select-none tracking-widest leading-none z-10 whitespace-nowrap overflow-hidden">
        {currentDestination.name}
      </div>
      {incomingDestination && (
        <div className="destination-watermark-incoming absolute left-6 sm:left-12 lg:left-20 bottom-8 sm:bottom-12 text-[13vw] font-display font-black uppercase text-white/[0.04] pointer-events-none select-none tracking-widest leading-none z-10 whitespace-nowrap overflow-hidden opacity-0">
          {incomingDestination.name}
        </div>
      )}

      {/* ─── 4. LEFT-SIDE CONTENT REVEAL ────────────────────────────────────── */}
      <div className="absolute left-6 sm:left-12 lg:left-20 top-[48%] -translate-y-1/2 max-w-xl z-20 pointer-events-auto pr-4">
        {/* Active Content Block */}
        {!incomingDestination ? (
          <div className="space-y-3 sm:space-y-4">
            <h1 className="destination-title text-5xl sm:text-7xl lg:text-8xl font-display font-black text-white uppercase tracking-tight leading-[0.92] drop-shadow-2xl">
              {currentDestination.name}
            </h1>

            <h3 className="destination-tagline text-lg sm:text-2xl font-heading font-bold text-[#FFC067] tracking-tight leading-snug drop-shadow">
              {currentDestination.tagline}
            </h3>

            <p className="destination-desc text-sm sm:text-base font-sans text-white/85 leading-relaxed max-w-lg">
              {currentDestination.description}
            </p>

            {/* Telemetry Bar */}
            <div className="destination-telemetry flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-white/70">
              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                <Building2 className="w-3.5 h-3.5 text-[#FFC067]" />
                <span>Capital: {currentDestination.capitalCity}</span>
              </span>

              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-[#C1443B]" />
                <span>{currentDestination.cityCount} Mapped Districts</span>
              </span>

              <span className="hidden sm:flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                <Compass className="w-3.5 h-3.5 text-white/60" />
                <span>{currentDestination.coordinates}</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="destination-actions flex items-center gap-3 pt-4">
              <Link
                to={`/explore?state=${encodeURIComponent(currentDestination.name)}`}
                className="destination-btn inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#C1443B] hover:bg-[#a8362e] text-white font-heading font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Explore {currentDestination.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to={`/itinerary?city=${encodeURIComponent(currentDestination.primaryCity)}`}
                className="destination-btn inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-heading font-bold text-xs sm:text-sm tracking-wider uppercase transition-all backdrop-blur-md hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Build Itinerary</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Incoming Content Block (during GSAP transition) */
          <div className="space-y-3 sm:space-y-4">
            <h1 className="destination-title-incoming text-5xl sm:text-7xl lg:text-8xl font-display font-black text-white uppercase tracking-tight leading-[0.92] drop-shadow-2xl">
              {incomingDestination.name}
            </h1>

            <h3 className="destination-tagline-incoming text-lg sm:text-2xl font-heading font-bold text-[#FFC067] tracking-tight leading-snug drop-shadow">
              {incomingDestination.tagline}
            </h3>

            <p className="destination-desc-incoming text-sm sm:text-base font-sans text-white/85 leading-relaxed max-w-lg">
              {incomingDestination.description}
            </p>

            <div className="destination-telemetry-incoming flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-white/70">
              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                <Building2 className="w-3.5 h-3.5 text-[#FFC067]" />
                <span>Capital: {incomingDestination.capitalCity}</span>
              </span>

              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-[#C1443B]" />
                <span>{incomingDestination.cityCount} Mapped Districts</span>
              </span>
            </div>

            <div className="destination-actions-incoming flex items-center gap-3 pt-4">
              <Link
                to={`/explore?state=${encodeURIComponent(incomingDestination.name)}`}
                className="destination-btn inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#C1443B] text-white font-heading font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-xl"
              >
                <span>Explore {incomingDestination.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ─── 5. RIGHT-SIDE CARD CAROUSEL (TRANSLATING QUEUE) ───────────────── */}
      <div className="absolute right-4 sm:right-10 lg:right-16 top-[48%] -translate-y-1/2 z-20 flex gap-4 sm:gap-6 items-center pointer-events-auto">
        {queueCards.map(({ destination, index, offset }) => (
          <div
            key={destination.id}
            onClick={() => jumpToIndex(index)}
            className={`queue-card relative w-36 sm:w-52 lg:w-60 h-[240px] sm:h-[340px] lg:h-[380px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/25 hover:border-[#FFC067] shadow-2xl transition-all duration-300 group cursor-pointer flex-shrink-0 backdrop-blur-sm bg-black/30 ${
              offset > 3 ? 'hidden xl:block' : ''
            }`}
          >
            {/* Thumbnail Image with error fallback */}
            <img
              src={destination.cardThumbnail}
              alt={destination.name}
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80';
              }}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
            />

            {/* Gradient Scrim on Card */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Top Numeric Index */}
            <span className="absolute top-3 left-3 text-[10px] sm:text-xs font-mono font-bold text-[#FFC067] bg-black/60 px-2 py-0.5 rounded border border-white/20 backdrop-blur-md">
              {String(index + 1).padStart(2, '0')}
            </span>

            {/* Bottom Card Title & Region */}
            <div className="absolute inset-x-0 bottom-0 p-4 space-y-1">
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#FFC067]">
                {destination.region}
              </span>
              <h4 className="text-base sm:text-xl font-display font-black text-white uppercase tracking-tight group-hover:text-[#FFC067] transition-colors line-clamp-1">
                {destination.name}
              </h4>
              <p className="text-[11px] font-mono text-white/75 truncate">
                {destination.primaryCity} • {destination.cityCount} Cities
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── 6. BOTTOM NAVIGATION CHEVRONS ─────────────────────────────────── */}
      <div className="absolute bottom-8 sm:bottom-12 right-6 sm:right-12 z-30 flex items-center gap-3 pointer-events-auto">
        <button
          onClick={handlePrev}
          disabled={isAnimating}
          className="w-12 h-12 rounded-full border border-white/30 bg-black/50 hover:bg-black/80 hover:border-[#FFC067] text-white hover:text-[#FFC067] flex items-center justify-center transition-all cursor-pointer backdrop-blur-md hover:scale-105 active:scale-95 disabled:opacity-50"
          aria-label="Previous Destination"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          disabled={isAnimating}
          className="w-12 h-12 rounded-full border border-white/30 bg-black/50 hover:bg-black/80 hover:border-[#FFC067] text-white hover:text-[#FFC067] flex items-center justify-center transition-all cursor-pointer backdrop-blur-md hover:scale-105 active:scale-95 disabled:opacity-50"
          aria-label="Next Destination"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
