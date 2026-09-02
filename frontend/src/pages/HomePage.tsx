import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReKnitThreadProof } from '../components/proofs/ReKnitThreadProof';
import { AccessibilityConstraintProof } from '../components/proofs/AccessibilityConstraintProof';
import { ExplainabilityReceiptCard } from '../components/proofs/ExplainabilityReceiptCard';
import { ProviderCopilotProof } from '../components/proofs/ProviderCopilotProof';
import { ExperienceCard } from '../components/experience/ExperienceCard';
import { SplitWords } from '../components/ui/SplitWords';
import { FaqSection } from '../components/faq/FaqSection';
import { LokivaMomentsSection } from '../components/moments/LokivaMomentsSection';
import { SurpriseMe } from '../components/surprise/SurpriseMe';
import { deduplicateExperienceList } from '../lib/imageDeduplicator';
import { api } from '../lib/api';
import { Experience } from '../types';
import {
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function HomePage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [availableHours, setAvailableHours] = useState(2);
  const [budgetCeiling, setBudgetCeiling] = useState(1500);
  const [wheelchairAccess, setWheelchairAccess] = useState(true);
  const [lowWalking, setLowWalking] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function loadInitial() {
      try {
        const list = await api.getExperiences({ limit: 8 });
        setExperiences(deduplicateExperienceList(list));
      } catch (err) {
        console.error('Failed to load initial experiences:', err);
      } finally {
        setIsLoading(false);
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

  const handleLaunchSolver = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/explore?city=${encodeURIComponent(selectedCity)}&hours=${availableHours}&budget=${budgetCeiling}&wheelchair=${wheelchairAccess}&walking=${lowWalking}`
    );
  };

  const categories = [
    'All',
    'Food & Culinary',
    'Art & Craft',
    'Heritage & History',
    'Music & Dance',
    'Nature & Wildlife',
  ];

  const filteredExperiences =
    activeCategory === 'All'
      ? experiences
      : experiences.filter((e) => e.category === activeCategory);

  return (
    <div ref={containerRef} className="min-h-screen bg-paper text-ink space-y-16 sm:space-y-20 pb-24 overflow-hidden">
      {/* 1. HERO SECTION WITH PROOF 01: REKNIT THREAD REDRAW */}
      <section className="reveal-section pt-8 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-ink tracking-tight leading-[1.1]">
            <SplitWords text="We don't rank places." />
            <br />
            <span className="text-marigold-600 italic">
              <SplitWords text="We pack feasible plans." />
            </span>
          </h1>

          <p className="text-sm sm:text-base text-dusk-600 leading-relaxed font-sans max-w-2xl mx-auto">
            Traditional travel apps give endless lists of uncoordinated spots. LOKIVA calculates your exact time, travel buffer, budget, and accessibility, and rebuilds your day instantly when reality changes.
          </p>
        </div>

        {/* Live Proof: ReKnit Thread Redraw */}
        <ReKnitThreadProof />
      </section>

      {/* 2. THE 3 INTERACTIVE ARCHITECTURE PROOFS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-dusk">
            Interactive Verification
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-ink">
            Don't trust our words. Test our logic live.
          </h2>
          <p className="text-xs text-dusk-600 font-sans">
            Interact with the algorithmic rules that govern LOKIVA before running your own journey.
          </p>
        </div>

        <div className="space-y-8">
          {/* Proof 02: Accessibility Hard Pre-Filter */}
          <div className="reveal-section">
            <AccessibilityConstraintProof />
          </div>

          {/* Proof 03: Explainability Slid-Out Receipt */}
          <div className="reveal-section">
            <ExplainabilityReceiptCard />
          </div>

          {/* Proof 04: Provider AI Co-Pilot Listing Assembly */}
          <div className="reveal-section">
            <ProviderCopilotProof />
          </div>
        </div>
      </section>

      {/* 3. TIME-BOXED MICRO-MOMENT SOLVER */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-10 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-paper-300">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal font-bold block">
                Micro-Moment Discovery
              </span>
              <h2 className="text-2xl font-display font-bold text-ink mt-0.5">
                <SplitWords text='"I have exactly ___ hours" Solver' />
              </h2>
            </div>
            <span className="text-xs font-mono text-dusk">
              Calculates real travel buffer + opening hours + budget ceiling
            </span>
          </div>

          <form onSubmit={handleLaunchSolver} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-dusk uppercase block">
                1. Context City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-paper-100 border border-paper-300 rounded-xl px-3 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-marigold"
              >
                <option value="Mumbai">Mumbai (Bandra West)</option>
                <option value="Jaipur">Jaipur (Pink City)</option>
                <option value="Kochi">Kochi (Fort Kochi)</option>
                <option value="Goa">Goa (Fontainhas Heritage)</option>
                <option value="Delhi">Delhi (Old Delhi & Mehrauli)</option>
                <option value="Varanasi">Varanasi (Ghats & Weavers)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-dusk uppercase">2. Available Window</span>
                <span className="font-extrabold text-marigold-700">{availableHours} Hours</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={availableHours}
                onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
                className="w-full h-2 bg-paper-300 rounded-lg appearance-none cursor-pointer accent-marigold"
              />
              <span className="text-[10px] text-dusk font-mono block">
                Includes transit and buffer
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-dusk uppercase">3. Hard Budget</span>
                <span className="font-extrabold text-teal">₹{budgetCeiling}</span>
              </div>
              <input
                type="range"
                min="300"
                max="5000"
                step="200"
                value={budgetCeiling}
                onChange={(e) => setBudgetCeiling(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-paper-300 rounded-lg appearance-none cursor-pointer accent-teal"
              />
              <span className="text-[10px] text-dusk font-mono block">
                Hard constraint ceiling
              </span>
            </div>

            <div className="flex flex-col justify-between space-y-2">
              <label className="text-xs font-mono font-bold text-dusk uppercase block">
                4. Hard Pre-Filters
              </label>
              <div className="flex items-center gap-3 text-xs font-mono">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-ink">
                  <input
                    type="checkbox"
                    checked={wheelchairAccess}
                    onChange={(e) => setWheelchairAccess(e.target.checked)}
                    className="rounded text-marigold focus:ring-marigold"
                  />
                  <span>Wheelchair</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-ink">
                  <input
                    type="checkbox"
                    checked={lowWalking}
                    onChange={(e) => setLowWalking(e.target.checked)}
                    className="rounded text-marigold focus:ring-marigold"
                  />
                  <span>Low Walking</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-ink hover:bg-ink-800 text-paper font-mono text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Pack Plan</span>
                  <ArrowRight className="w-3.5 h-3.5 text-marigold" />
                </button>

                <SurpriseMe
                  experiences={experiences}
                  currentCity={selectedCity}
                  maxBudget={budgetCeiling}
                  availableHours={availableHours}
                  wheelchairOnly={wheelchairAccess}
                  lowWalkingOnly={lowWalking}
                />
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* 4. VERIFIED EXPERIENCES CATALOG (229 VERIFIED LISTINGS) */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-dusk">
              Curated Cultural Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink">
              <SplitWords text="Verified Indian Cultural Experiences" />
            </h2>
            <p className="text-xs text-dusk-600">
              Each experience vetted for direct community spend, opening schedules, and step-free access.
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs font-mono font-bold text-ink hover:text-marigold flex items-center gap-1.5 underline"
          >
            <span>View All 229 Experiences</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-ink text-white shadow-sm'
                  : 'bg-white text-dusk hover:text-ink border border-paper-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards Grid with Sibling Cascade Stagger */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-paper-300 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredExperiences.map((exp) => (
              <div key={exp.id} className="reveal-stagger-item">
                <ExperienceCard experience={exp} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. LOKIVA MOMENTS - IMMERSIVE VISUAL EXPERIENCE DISCOVERY */}
      <LokivaMomentsSection experiences={experiences} selectedCity={selectedCity} />

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      <FaqSection />

      {/* 7. THE 11-SIGNAL CONTEXT ENGINE MANIFESTO */}
      <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-paper-400 p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-dusk">
              Algorithmic Guarantees
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-ink">
              <SplitWords text="The 11 Context Signals Checked on Every Solve" />
            </h3>
            <p className="text-xs text-dusk-600 leading-relaxed">
              Every competitor ranks single items in isolation. LOKIVA evaluates all 11 signals simultaneously to guarantee your plan works in real life.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-mono">
            {[
              { label: 'Time Window', desc: 'Exact hours before flight or dinner' },
              { label: 'Real Travel Time', desc: 'Isochrones with local auto traffic' },
              { label: 'Hard Budget Ceiling', desc: 'Not a sort filter, a strict ceiling' },
              { label: 'Hard Accessibility', desc: 'Wheelchair and sensory pre-filtered' },
              { label: 'Live Opening Hours', desc: 'Vetted slot fits inside your gap' },
              { label: 'Group Consensus', desc: 'Kids and elderly joint happiness' },
              { label: 'Explainability', desc: 'Honest "why this fits" sentence' },
              { label: 'Instant Re-Planning', desc: 'Rain and delay live adaptation' },
            ].map((sig, idx) => (
              <div
                key={idx}
                className="reveal-stagger-item p-4 bg-paper-100 rounded-2xl border border-paper-300 space-y-1"
              >
                <div className="flex items-center gap-1.5 text-ink font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                  <span>{sig.label}</span>
                </div>
                <p className="text-[11px] text-dusk leading-snug font-sans">{sig.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
