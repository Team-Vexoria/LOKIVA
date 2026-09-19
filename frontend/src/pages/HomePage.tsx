import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LokivaLandingHero } from '../components/landing/LokivaLandingHero';
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
  Compass,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Mic,
  QrCode,
  Layers,
  MapPin,
  Award,
  AlertTriangle,
  Zap,
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

      {/* 2. ARCHITECTURAL COMPARISON: THE CULTURAL DISCOVERY PARADOX (LIGHT ARCHITECTURAL AESTHETIC) */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border-2 border-[#D8CFC0] p-6 sm:p-10 lg:p-14 shadow-sm space-y-8">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C1443B]" />
              <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B]">
                Structural Comparison
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-ink tracking-tight pt-1">
              <SplitWords text="The Cultural Discovery Paradox" />
            </h2>
            <p className="text-sm sm:text-base text-dusk-700 leading-relaxed font-sans font-medium pt-1">
              Over 88% of Indian travel spend is trapped in hotel aggregators and commercial bus loops, leaving centuries of artisan heritage unindexed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Card 1: Commercial OTAs */}
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border-2 border-[#E5DFD5] space-y-4 reveal-stagger-item flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-black text-[#C1443B] uppercase tracking-wider">
                    COMMERCIAL OTAs
                  </span>
                  <AlertTriangle className="w-4 h-4 text-[#C1443B]" />
                </div>
                <h3 className="text-xl font-heading font-black text-ink">
                  Aggregator Monoculture
                </h3>
                <p className="text-xs sm:text-sm text-dusk-700 leading-relaxed font-sans font-medium">
                  Platforms prioritize corporate hotel commissions and generic mass tours. They have zero incentive to index a 400-year-old silk handloom weaver or a ₹350 pottery studio.
                </p>
              </div>
              <div className="pt-4 border-t-2 border-[#E5DFD5] text-xs font-heading font-bold text-dusk-700 space-y-1">
                <div>• 0% Grassroots Artisan Spend</div>
                <div>• Crowded Generic Monument Loops</div>
              </div>
            </div>

            {/* Card 2: Generic AI Chatbots */}
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border-2 border-[#E5DFD5] space-y-4 reveal-stagger-item flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-black text-[#D97706] uppercase tracking-wider">
                    GENERIC AI CHATBOTS
                  </span>
                  <Clock className="w-4 h-4 text-[#D97706]" />
                </div>
                <h3 className="text-xl font-heading font-black text-ink">
                  Context-Blind Routing
                </h3>
                <p className="text-xs sm:text-sm text-dusk-700 leading-relaxed font-sans font-medium">
                  Vanilla LLMs hallucinate non-existent museums, recommend sacred temples during afternoon prayer closures, and assume navigating Chandni Chowk takes 6 minutes instead of 45.
                </p>
              </div>
              <div className="pt-4 border-t-2 border-[#E5DFD5] text-xs font-heading font-bold text-dusk-700 space-y-1">
                <div>• Temporal & Prayer Closures Missed</div>
                <div>• Impossible Transit Times</div>
              </div>
            </div>

            {/* Card 3: The LOKIVA Solution (Warm Sandstone Architectural Light Surface) */}
            <div className="p-6 rounded-2xl bg-white border-2 border-[#C1443B] shadow-lg shadow-[#C1443B]/10 space-y-4 reveal-stagger-item flex flex-col justify-between relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-black text-[#C1443B] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#C1443B]" />
                    <span>LOKIVA STANDARD</span>
                  </span>
                  <span className="text-[11px] font-heading font-bold text-ink-700 bg-[#FAF4ED] px-2.5 py-0.5 rounded-full border border-[#E8DCCB]">
                    Recommended
                  </span>
                </div>
                <h3 className="text-xl font-heading font-black text-ink">
                  Deterministic + Neural Engine
                </h3>
                <p className="text-xs sm:text-sm text-dusk-700 leading-relaxed font-sans font-medium">
                  Gemini 1.5 routes strictly from our curated 1,080 ground-truth catalog, calculating minute-by-minute schedules with realistic pedestrian friction, opening schedules, and direct UPI checkout.
                </p>
              </div>
              <div className="pt-4 border-t-2 border-[#E8DCCB] text-xs font-heading font-bold text-ink space-y-1">
                <div className="flex items-center gap-1.5 text-ink-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Ground-Truth Verified Catalog</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct Artisan Vernacular Connect</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW LOKIVA WORKS IN 3 STEPS (HIGH-CONTRAST MODERN TYPOGRAPHY) */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C1443B]" />
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B]">
              Execution Pipeline
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-ink tracking-tight pt-1">
            <SplitWords text="How LOKIVA Solves Your Journey" />
          </h2>
          <p className="text-xs sm:text-sm text-dusk-700 font-sans font-medium">
            From fragmented street reality to an executable, minute-by-minute itinerary in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-[#D8CFC0] shadow-xs space-y-3 reveal-stagger-item">
            <div className="w-10 h-10 rounded-lg bg-[#12213B] text-white flex items-center justify-center font-heading font-black text-base">
              01
            </div>
            <h4 className="text-xl font-heading font-black text-ink">
              Declare Constraints
            </h4>
            <p className="text-xs sm:text-sm text-dusk-700 leading-relaxed font-sans font-medium">
              Declare your available hours (e.g. 3.5h before an evening train), budget ceiling in INR, and mobility requirements (wheelchair, step-free, low-walking).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-[#D8CFC0] shadow-xs space-y-3 reveal-stagger-item">
            <div className="w-10 h-10 rounded-lg bg-[#12213B] text-white flex items-center justify-center font-heading font-black text-base">
              02
            </div>
            <h4 className="text-xl font-heading font-black text-ink">
              Mathematical Optimization
            </h4>
            <p className="text-xs sm:text-sm text-dusk-700 leading-relaxed font-sans font-medium">
              Spatial pre-filter checks Haversine distance and live opening hours. Gemini 1.5 Flash optimizes waypoints with real-world pedestrian and rickshaw transit buffers.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-[#D8CFC0] shadow-xs space-y-3 reveal-stagger-item">
            <div className="w-10 h-10 rounded-lg bg-[#12213B] text-white flex items-center justify-center font-heading font-black text-base">
              03
            </div>
            <h4 className="text-xl font-heading font-black text-ink">
              Vernacular Connect & Pass
            </h4>
            <p className="text-xs sm:text-sm text-dusk-700 leading-relaxed font-sans font-medium">
              Chat directly with rural master artisans in their regional dialect via WhatsApp, complete simulated UPI instant payment, and print cryptographic QR admission passes.
            </p>
          </div>
        </div>
      </section>

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
    </div>
  );
}

export default HomePage;
