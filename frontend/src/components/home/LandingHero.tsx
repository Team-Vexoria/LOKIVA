import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { TripOnboardingTakeover, TripContextAnswers } from '../onboarding/TripOnboardingTakeover';
import { DayPlanResponse } from '../../types';

interface LandingHeroProps {
  onOpenDiscovery?: () => void;
  onExploreAll?: () => void;
}

export function LandingHero({ onOpenDiscovery, onExploreAll }: LandingHeroProps = {}) {
  const navigate = useNavigate();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleOpenDiscovery = () => {
    if (onOpenDiscovery) {
      onOpenDiscovery();
    } else {
      setIsOnboardingOpen(true);
    }
  };

  const handleExploreAll = () => {
    if (onExploreAll) {
      onExploreAll();
    } else {
      navigate('/explore');
    }
  };

  const handlePlanGenerated = (answers: TripContextAnswers, plan: DayPlanResponse) => {
    navigate('/itinerary', { state: { solvedPlan: plan, solvedAnswers: answers } });
  };

  // Autoplay video muted when entering viewport
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              video.muted = true;
              video.play().catch(() => {});
            });
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative w-full h-screen min-h-screen flex flex-col justify-between pt-16 sm:pt-20 lg:pt-22 pb-0 overflow-hidden bg-[#FAF7F2]">
      {/* Onboarding Full-Screen Modal */}
      <TripOnboardingTakeover
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onPlanGenerated={handlePlanGenerated}
      />

      {/* Left Monument: Authentic Temple Gopuram (Natural Aspect Ratio) */}
      <div className="absolute left-2 sm:left-6 lg:left-8 xl:left-12 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 hidden sm:block">
        <img
          src="/assets/monuments/temple-gopuram-cutout.png"
          alt="Temple Gopuram"
          className="w-auto h-auto max-h-[220px] sm:max-h-[260px] lg:max-h-[300px] xl:max-h-[340px] object-contain opacity-65 lg:opacity-75 -rotate-2 filter drop-shadow-[0_8px_18px_rgba(18,33,59,0.06)]"
        />
      </div>

      {/* Right Monument: Authentic Taj Mahal (Natural Aspect Ratio) */}
      <div className="absolute right-2 sm:right-6 lg:right-8 xl:right-12 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 hidden sm:block">
        <img
          src="/assets/monuments/taj-mahal-cutout.png"
          alt="Taj Mahal"
          className="w-auto h-auto max-h-[200px] sm:max-h-[240px] lg:max-h-[280px] xl:max-h-[320px] object-contain opacity-65 lg:opacity-75 rotate-2 filter drop-shadow-[0_8px_18px_rgba(18,33,59,0.06)]"
        />
      </div>

      {/* CENTER EDITORIAL CONTENT BLOCK */}
      <div className="relative z-10 max-w-4xl 2xl:max-w-5xl mx-auto px-4 sm:px-6 text-center flex-1 flex flex-col justify-center items-center my-auto py-2">
        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#E8DEC8] bg-[#FAF7F2] shadow-2xs mb-3 sm:mb-4 lg:mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] animate-pulse" />
          <span className="font-meta text-[10px] sm:text-[11px] font-bold tracking-widest text-[#C85A32] uppercase">
            Pan-India Cultural Discovery Engine
          </span>
        </div>

        {/* Big Display Headline (Object Sans) */}
        <h1 className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1A1D20] tracking-tight leading-[1.12] max-w-3xl 2xl:max-w-4xl">
          Real Indian Cultural Experiences.{' '}
          <span className="relative inline-block text-[#C85A32]">
            Packed Around Your Exact Constraints.
            {/* Hand-drawn underline accent */}
            <svg
              className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-2 sm:h-3 text-[#D99B43] opacity-80 pointer-events-none"
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
        </h1>

        {/* Narrative Subtitle */}
        <p className="font-meta text-xs sm:text-sm md:text-base text-neutral-600 max-w-xl mx-auto mt-2.5 sm:mt-3.5 leading-relaxed">
          Discover authentic artisan guilds and living heritage, packed into feasible cultural circuits built around your time and budget.
        </p>

        {/* Registry Badge */}
        <div className="flex items-center justify-center gap-2 mt-2 sm:mt-2.5 font-meta text-[11px] sm:text-xs text-neutral-500 font-semibold tracking-wider uppercase">
          <span className="text-[#C85A32]">✦</span>
          <span>Curated Across 36 States &amp; Union Territories</span>
          <span className="text-[#C85A32]">✦</span>
        </div>

        {/* Action Button Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-5 sm:mt-6 lg:mt-7 w-full sm:w-auto relative">
          {/* Takes 60s Callout */}
          <div className="hidden md:flex items-center gap-1.5 absolute -left-24 top-1/2 -translate-y-1/2 font-sans font-bold text-xs text-[#C85A32]">
            <span>Takes 60s</span>
            <svg className="w-6 h-4 text-[#D99B43]" fill="none" viewBox="0 0 24 16" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 13s8-1 14-8m0 0l-4-1m4 1l-1 4" />
            </svg>
          </div>

          <button
            type="button"
            onClick={handleOpenDiscovery}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#D99B43] to-[#C85A32] text-white font-heading font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Plan Instant Micro-Itinerary</span>
            <span>&rarr;</span>
          </button>

          <button
            type="button"
            onClick={handleExploreAll}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white border border-[#E8DEC8] hover:border-[#C85A32] text-neutral-800 font-heading font-bold text-xs sm:text-sm tracking-wide shadow-2xs hover:shadow-md hover:bg-neutral-50 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#C85A32]" />
            <span>Explore 36 States</span>
          </button>
        </div>
      </div>

      {/* VIDEO PEEK FOLD (SUBTLE CURVED EDGE AT BOTTOM FOLD) */}
      <div className="relative w-full max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 mt-auto">
        <div className="w-full h-8 sm:h-10 lg:h-12 rounded-t-[24px] sm:rounded-t-[32px] overflow-hidden border-t-2 border-x-2 border-white/90 shadow-lg bg-neutral-900 relative group cursor-pointer">
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            poster="/assets/states/karnataka.jpg"
            className="w-full h-full object-cover object-center opacity-85 group-hover:opacity-100 transition-opacity"
          >
            <source src="/landing_video.mp4" type="video/mp4" />
            <source src="/assets/videos/hero-reel.mp4" type="video/mp4" />
          </video>
          {/* Subtle gradient to invite downward scroll */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/20 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

export default LandingHero;
