import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroScrollExperience } from '../components/landing/HeroScrollExperience';
import { DeviceMockupSection } from '../components/landing/DeviceMockupSection';
import { PhotosMapsReviewsSection } from '../components/landing/PhotosMapsReviewsSection';
import { LivingHeritageShowcaseSection } from '../components/landing/LivingHeritageShowcaseSection';
import { TagUsSection } from '../components/landing/TagUsSection';
import { ExperienceCard } from '../components/experience/ExperienceCard';
import { SplitWords } from '../components/ui/SplitWords';
import { FaqSection } from '../components/faq/FaqSection';
import { LokivaMomentsSection } from '../components/moments/LokivaMomentsSection';
import { ProjectVideoModal } from '../components/modals/ProjectVideoModal';
import { deduplicateExperienceList } from '../lib/imageDeduplicator';
import { api } from '../lib/api';
import { Experience } from '../types';
import {
  ArrowRight,
} from 'lucide-react';

import { USER_LANDING_PLACES } from '../data/userVerifiedPlacesData';

gsap.registerPlugin(ScrollTrigger);

export function HomePage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [experiences, setExperiences] = useState<Experience[]>(USER_LANDING_PLACES);
  const [selectedCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      try {
        const list = await api.getLandingExperiences();
        if (list && list.length > 0) {
          const merged = USER_LANDING_PLACES.map((curated) => {
            const match = list.find((item) =>
              item.title.toLowerCase().trim().includes(curated.title.toLowerCase().trim().slice(0, 15))
            );
            return match ? { ...curated, rating: match.rating || curated.rating, review_count: match.review_count || curated.review_count } : curated;
          });
          setExperiences(merged);
        }
      } catch (err) {
        console.warn('Using user curated landing experiences:', err);
      }
    }
    loadInitial();
  }, []);

  // GSAP ScrollTrigger setup for stacked-card parallax slide-over & section reveals
  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set('.reveal-section, .reveal-word, .reveal-stagger-item', {
          opacity: 1,
          y: 0,
        });
        return;
      }

      // 1. Stacked-card transitions with dedicated interaction buffer (Spain Collection standard)
      const panels = gsap.utils.toArray<HTMLElement>('.card-stack-wrapper .stack-panel');

      panels.forEach((panel, i) => {
        const nextPanel = panels[i + 1];
        if (!nextPanel) return;

        // 1. PIN THE CURRENT PANEL to give the user time to view & use it
        ScrollTrigger.create({
          trigger: panel,
          start: 'top top',
          end: '+=130vh', // Extended buffer so screen stays completely still & usable
          pin: true,
          pinSpacing: false, // Allows next panel to slide over it after the pause
          anticipatePin: 1,
        });

        // 2. SLIDE UP THE NEXT PANEL ONLY AFTER THE BUFFER ENDS
        gsap.fromTo(
          nextPanel,
          { yPercent: 100 },
          {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              start: 'top+=90vh top', // Start sliding up only after user scrolled through viewing buffer
              end: 'top+=150vh top',
              scrub: 1,
              onUpdate: (self) => {
                // Softly fade/scale down the outgoing panel content as it gets covered
                const content = panel.querySelector<HTMLElement>('.panel-content');
                if (content) {
                  gsap.to(content, {
                    opacity: 1 - self.progress * 0.35,
                    scale: 1 - self.progress * 0.02,
                    overwrite: 'auto',
                  });
                }
              },
            },
          }
        );
      });

      // 2. Inner stagger items reveal within each section
      const words = gsap.utils.toArray<HTMLElement>('.reveal-word');
      const staggerItems = gsap.utils.toArray<HTMLElement>('.reveal-stagger-item');

      words.forEach((word) => {
        gsap.fromTo(
          word,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: word,
              start: 'top 90%',
              once: true,
            },
          }
        );
      });

      staggerItems.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              once: true,
            },
          }
        );
      });
    }, containerRef);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [isLoading, experiences, activeCategory]);

  const categories = [
    'All',
    'Heritage & History',
    'Spiritual & Wellness',
    'Nature & Wildlife',
    'Art & Craft',
  ];

  const filteredExperiences =
    activeCategory === 'All'
      ? experiences
      : experiences.filter((e) => e.category === activeCategory);

  return (
    <main ref={containerRef} className="relative w-full min-h-screen bg-[#FAF7F2] text-[#12213B] overflow-x-clip">
      {/* 1. PINNED HERO + SHOWREEL (PANEL 0 - Spain Collection scroll architecture, GSAP pin) */}
      <HeroScrollExperience onWatchFilm={() => setIsVideoModalOpen(true)} />

      {/* 2. CARD-STACKED TRANSITION GROUP (ONLY between Video and Discover. Experience. Preserve.) */}
      <div className="card-stack-wrapper relative w-full">
        {/* Section A: Curated Cultural Journeys Showcase */}
        <section className="stack-panel relative z-10 bg-[#E8E2D9] min-h-screen flex flex-col justify-start overflow-hidden">
          <div className="panel-content w-full max-w-7xl mx-auto pt-4 sm:pt-6 pb-16 px-4">
            <DeviceMockupSection />
          </div>
        </section>

        {/* Section B: Photos, Maps + Reviews */}
        <section className="stack-panel relative z-20 bg-[#FAF7F2] min-h-screen rounded-t-[32px] sm:rounded-t-[44px] shadow-[0_-20px_50px_rgba(18,33,59,0.12)] border-t border-black/5 flex flex-col justify-start overflow-hidden">
          <div className="panel-content w-full max-w-7xl mx-auto pt-10 sm:pt-14 pb-16">
            <PhotosMapsReviewsSection />
          </div>
        </section>

        {/* Section C: Discover. Experience. Preserve. (Living Heritage Showcase - FINAL Stacked Section) */}
        <section className="stack-panel relative z-30 bg-[#FAF8F5] min-h-screen rounded-t-[32px] sm:rounded-t-[44px] shadow-[0_-20px_50px_rgba(18,33,59,0.12)] border-t border-black/5 flex flex-col justify-start overflow-hidden">
          <div className="panel-content w-full max-w-7xl mx-auto pt-10 sm:pt-14 pb-16">
            <LivingHeritageShowcaseSection />
          </div>
        </section>
      </div>

      {/* 3. STANDARD NATURAL DOCUMENT SCROLLING (NO animations, NO pins, 100% natural CSS flow) */}
      {/* 4. CURATED EXPERIENCES CATALOG */}
      <section className="relative z-30 bg-[#FAF7F2] py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B]">
              VERIFIED GROUND-TRUTH CATALOG
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-black text-ink tracking-tight">
              <SplitWords text="Explore Curated Cultural Experiences" />
            </h2>
            <p className="text-xs text-dusk-600 font-medium">
              Every venue vetted for authentic community spend, opening schedules, and direct high-resolution CDN imagery.
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs font-mono font-bold text-ink hover:text-[#C1443B] flex items-center gap-1.5 underline"
          >
            <span>View All 36 States</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#FFC067] text-[#12213B] font-extrabold shadow-sm shadow-[#FFC067]/35 border border-[#E5A84B]/60'
                  : 'bg-white text-dusk-700 hover:text-ink border-2 border-[#DDD7CC] hover:border-[#FFC067]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-paper-300 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredExperiences.map((exp) => (
              <div key={exp.id} className="reveal-stagger-item">
                <ExperienceCard experience={exp} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. LOKIVA MOMENTS */}
      <section className="relative z-30 bg-[#FAF8F5] py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LokivaMomentsSection experiences={experiences} selectedCity={selectedCity} />
      </section>

      {/* 6. TAG US ON YOUR NEXT TRIP */}
      <section className="relative z-30 bg-[#FAF7F2] py-16 sm:py-24">
        <TagUsSection />
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="relative z-30 bg-[#FAF8F5] py-16 sm:py-24 pb-24">
        <FaqSection />
      </section>

      {/* Shared Video Player Modal */}
      <ProjectVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </main>
  );
}

export default HomePage;
