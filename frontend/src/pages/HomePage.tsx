import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LokivaLandingHero } from '../components/landing/LokivaLandingHero';
import { PhotosMapsReviewsSection } from '../components/landing/PhotosMapsReviewsSection';
import { LivingHeritageShowcaseSection } from '../components/landing/LivingHeritageShowcaseSection';
import { TagUsSection } from '../components/landing/TagUsSection';
import { ExperienceCard } from '../components/experience/ExperienceCard';
import { SplitWords } from '../components/ui/SplitWords';
import { FaqSection } from '../components/faq/FaqSection';
import { LokivaMomentsSection } from '../components/moments/LokivaMomentsSection';
import { deduplicateExperienceList } from '../lib/imageDeduplicator';
import { api } from '../lib/api';
import { Experience } from '../types';
import {
  ArrowRight,
  CheckCircle2,
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

  // GSAP ScrollTrigger setup for section reveals
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

      const sections = gsap.utils.toArray<HTMLElement>('.reveal-section');

      sections.forEach((section) => {
        const words = section.querySelectorAll('.reveal-word');
        const staggerItems = section.querySelectorAll('.reveal-stagger-item');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            once: true,
          },
        });

        tl.fromTo(
          section,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
          }
        );

        if (words.length > 0) {
          tl.fromTo(
            words,
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.04,
              ease: 'power2.out',
            },
            '-=0.45'
          );
        }

        if (staggerItems.length > 0) {
          tl.fromTo(
            staggerItems,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: 'power2.out',
            },
            '-=0.3'
          );
        }
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
    <div ref={containerRef} className="min-h-screen bg-[#FAF7F2] text-[#12213B] space-y-16 sm:space-y-24 pb-24 overflow-hidden">
      {/* 1. LOKIVA EDITORIAL HERO & INTERACTIVE DEVICE FRAMES */}
      <LokivaLandingHero />

      {/* 2. PHOTOS, MAPS + REVIEWS (MINDTRIP IMAGE 1 INSPIRED SHOWCASE) */}
      <PhotosMapsReviewsSection />

      {/* 3. LIVING HERITAGE SHOWCASE (MINDTRIP IMAGE 2 INSPIRED WARM AESTHETIC & FLOATING CARDS) */}
      <LivingHeritageShowcaseSection />

      {/* 4. CURATED EXPERIENCES CATALOG (Preserved Verified Image URLs) */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-black uppercase tracking-wider text-[#C1443B]">
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

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none [-webkit-overflow-scrolling:touch]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#12213B] text-white shadow-sm'
                  : 'bg-white text-dusk-700 hover:text-ink border-2 border-[#DDD7CC]'
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
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LokivaMomentsSection experiences={experiences} selectedCity={selectedCity} />
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      <FaqSection />

      {/* 7. THE 11-SIGNAL CONTEXT ENGINE MANIFESTO */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border-2 border-[#D8CFC0] p-6 sm:p-10 lg:p-14 space-y-6 sm:space-y-8 shadow-sm">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C1443B]" />
              <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B]">
                Algorithmic Guarantees
              </span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-display font-black text-ink tracking-tight pt-1">
              <SplitWords text="The 11 Context Signals Checked on Every Solve" />
            </h3>
            <p className="text-xs sm:text-sm text-dusk-700 leading-relaxed font-medium">
              Every competitor ranks single items in isolation. LOKIVA evaluates all 11 signals simultaneously to guarantee your cultural plan works in real life.
            </p>
          </div>

          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs font-mono">
            {[
              { label: 'Time Window', desc: 'Exact hours before train or flight' },
              { label: 'Real Travel Time', desc: 'Pedestrian and auto-rickshaw buffers' },
              { label: 'Hard Budget Ceiling', desc: 'Strict ceiling, not an average sort' },
              { label: 'Hard Accessibility', desc: 'Step-free and wheelchair verified' },
              { label: 'Live Opening Hours', desc: 'Vetted slot fits inside your gap' },
              { label: 'Cultural Etiquette', desc: 'Dress codes and footwear rules' },
              { label: 'Explainability', desc: 'Honest "why this fits" sentence' },
              { label: 'Offline Resilience', desc: 'Functions when venue Wi-Fi drops' },
            ].map((sig, idx) => (
              <div
                key={idx}
                className="reveal-stagger-item p-4 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5] space-y-1"
              >
                <div className="flex items-center gap-1.5 text-ink font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{sig.label}</span>
                </div>
                <p className="text-[11px] text-dusk-600 leading-snug font-sans font-medium">{sig.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TAG US ON YOUR NEXT TRIP (COMMUNITY TRAVEL MOMENTS & SOCIAL HUB) */}
      <TagUsSection />
    </div>
  );
}

export default HomePage;
