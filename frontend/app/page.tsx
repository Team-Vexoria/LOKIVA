'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { DestinationSummary, CategorySummary, Experience } from '../types';
import { ExperienceCard } from '../components/ExperienceCard';
import {
  ScrollRevealContainer,
  ScrollRevealSection,
  ScrollRevealStagger,
  ScrollRevealItem,
  WordRevealHeading
} from '../components/animations/ScrollReveal';
import {
  ReKnitThreadProof,
  AccessibilityConstraintProof,
  ExplainabilityReceiptCard,
  ProviderCoPilotProof
} from '../components/proofs';
import {
  Sparkles,
  Search,
  Compass,
  MapPin,
  Clock,
  Coins,
  Footprints,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Heart,
  ChevronRight,
  CheckCircle2,
  Users,
  Layers,
  Utensils,
  Landmark,
  Palette,
  Trees,
  PartyPopper,
  Moon,
  ShoppingBag,
  Globe2,
  Building,
  User,
  Zap
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [trendingExperiences, setTrendingExperiences] = useState<Experience[]>([]);
  const [hiddenGems, setHiddenGems] = useState<Experience[]>([]);
  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Suggested multi-city demo prompts from architecture scenario
  const samplePrompts = [
    { label: 'Mumbai Food & Culture', prompt: "I'm with my parents in Mumbai. We have 4 hours, ₹2,000, want local food and culture, and low walking." },
    { label: 'Goa Beaches & Adventure', prompt: "What can I do in Goa under ₹3000 with adventure and hidden beaches?" },
    { label: 'Kochi Cultural Afternoon', prompt: "I have 3 hours in Kochi and want authentic cultural and spice experiences." },
    { label: 'Jaipur Crafts & Heritage', prompt: "I want heritage havelis and hand block printing in Jaipur with zero tourist traps." },
    { label: 'Rishikesh River & Yoga', prompt: "Find yoga, sound healing, and adventure experiences in Rishikesh." },
    { label: 'Near Me (GPS)', prompt: "Find authentic hidden gems near me within 5 km." }
  ];

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [dests, cats, trending, gems] = await Promise.all([
          api.getDestinations(12),
          api.getCategories(),
          api.getExperiences({ limit: 4 }),
          api.getExperiences({ is_hidden_gem: true, limit: 4 })
        ]);
        setDestinations(dests);
        setCategories(cats);
        setTrendingExperiences(trending);
        setHiddenGems(gems);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPrompt.trim()) return;
    router.push(`/ai-guide?prompt=${encodeURIComponent(searchPrompt)}`);
  };

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case 'food': return <Utensils className="w-5 h-5" />;
      case 'culture': return <Landmark className="w-5 h-5" />;
      case 'workshop': return <Palette className="w-5 h-5" />;
      case 'adventure': return <Compass className="w-5 h-5" />;
      case 'nature': return <Trees className="w-5 h-5" />;
      case 'shopping': return <ShoppingBag className="w-5 h-5" />;
      case 'nightlife': return <Moon className="w-5 h-5" />;
      case 'events': return <PartyPopper className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <ScrollRevealContainer
      dependencies={[destinations, categories, trendingExperiences, hiddenGems, isLoading]}
      className="space-y-20 pb-20 overflow-hidden"
    >
      {/* HERO SECTION: Headline + ReKnit Thread Centerpiece */}
      <ScrollRevealSection className="relative pt-10 pb-12 sm:pt-16 sm:pb-20 overflow-hidden">
        {/* Subtle Ambient Glows per Architecture Palette */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-lokiva-marigold/10 blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Top Headline Block */}
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-300 text-xs font-semibold backdrop-blur-md shadow-sm font-mono">
              <Sparkles className="w-3.5 h-3.5 text-lokiva-marigold animate-pulse" />
              <span>Intelligent Local Discovery & Live Re-Planning</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>

            {/* Main Display Headline with Word Stagger */}
            <WordRevealHeading
              as="h1"
              className="text-4xl sm:text-6xl font-black text-lokiva-paper tracking-tight leading-[1.1] font-display"
            >
              Your day, planned for how it{' '}
              <span className="text-lokiva-marigold underline decoration-lokiva-marigold/40 underline-offset-8">
                actually goes.
              </span>
            </WordRevealHeading>

            {/* Plain, Honest Subtitle */}
            <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              LOKIVA packs feasible plans around your real constraints — time, budget, distance, group, and accessibility — and rebuilds that plan the instant something changes.
            </p>
          </div>

          {/* AI Constraint Search Prompt Bar */}
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="relative p-2 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 focus-within:border-lokiva-marigold/60 focus-within:ring-4 focus-within:ring-lokiva-marigold/10 transition-all"
            >
              <div className="flex items-center gap-2.5 px-3 py-2 flex-1">
                <Search className="w-5 h-5 text-lokiva-marigold shrink-0" />
                <input
                  type="text"
                  value={searchPrompt}
                  onChange={(e) => setSearchPrompt(e.target.value)}
                  placeholder="Who you're with, time, budget & city (e.g. 2h in Bandra with parents under ₹1,500)..."
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl sm:rounded-2xl bg-lokiva-marigold hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-lokiva-marigold/20 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 font-mono"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Solve Feasible Plan</span>
              </button>
            </form>

            {/* 1-Click Multi-City Test Prompts */}
            <ScrollRevealStagger className="mt-3.5 flex items-center gap-1.5 flex-wrap justify-center text-xs">
              <span className="text-slate-400 text-[11px] font-mono font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-lokiva-marigold" /> Try scenario:
              </span>
              {samplePrompts.map((p, idx) => (
                <ScrollRevealItem
                  key={idx}
                  as="button"
                  onClick={() => setSearchPrompt(p.prompt)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition-all hover:text-white shadow-sm"
                >
                  {p.label}
                </ScrollRevealItem>
              ))}
            </ScrollRevealStagger>
          </div>

          {/* SIGNATURE INTERACTIVE CENTERPIECE: ReKnit Thread Proof */}
          <div className="pt-2 max-w-4xl mx-auto">
            <ReKnitThreadProof />
          </div>
        </div>
      </ScrollRevealSection>

      {/* LIVE PLATFORM PROOFS SECTION: Accessibility, Explainability & Provider Co-Pilot */}
      <ScrollRevealSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono font-bold text-lokiva-teal uppercase tracking-wider">
            Live Architecture Proofs
          </div>
          <WordRevealHeading
            as="h2"
            className="text-2xl sm:text-4xl font-black text-lokiva-paper font-display"
          >
            Every claim, proven live on the page.
          </WordRevealHeading>
          <p className="text-xs sm:text-sm text-slate-400">
            Interactive proofs of the constraint engine, explainability module, and provider co-pilot in action.
          </p>
        </div>

        {/* 3-Column Proofs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Proof 2: Accessibility Pre-Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-lokiva-teal">
              <span className="w-2 h-2 rounded-full bg-lokiva-teal" />
              <span>01 · Constraint Pre-Filter</span>
            </div>
            <AccessibilityConstraintProof />
          </div>

          {/* Proof 3: Explainability Receipt */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-lokiva-marigold">
              <span className="w-2 h-2 rounded-full bg-lokiva-marigold" />
              <span>02 · Explainability Receipt</span>
            </div>
            <ExplainabilityReceiptCard />
          </div>

          {/* Proof 4: Provider AI Co-Pilot */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>03 · Provider AI Co-Pilot</span>
            </div>
            <ProviderCoPilotProof />
          </div>
        </div>
      </ScrollRevealSection>

      {/* HOW ARE YOU USING LOKIVA: Role Portal Cards */}
      <ScrollRevealSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="text-xs font-mono font-bold text-lokiva-marigold uppercase tracking-wider">
            One Platform · Two Focused Portals
          </div>
          <WordRevealHeading
            as="h2"
            className="text-2xl sm:text-3xl font-black text-lokiva-paper font-display"
          >
            How are you using LOKIVA?
          </WordRevealHeading>
        </div>

        <ScrollRevealStagger className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Traveler Persona Card */}
          <ScrollRevealItem className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-700/80 hover:border-lokiva-marigold/50 shadow-xl transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-lokiva-marigold/10 text-lokiva-marigold flex items-center justify-center font-black text-lg shadow-sm border border-lokiva-marigold/20">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-lokiva-marigold/10 text-lokiva-marigold border border-lokiva-marigold/20">
                For Travelers
              </span>
              <h3 className="text-xl font-bold font-display text-lokiva-paper group-hover:text-lokiva-marigold transition-colors">
                Discover India, Your Way
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Deterministic constraint solving, interactive map routing, live weather re-planning, and authentic neighborhood gems suited to your budget and walking style.
              </p>
            </div>

            <Link
              href="/login/traveler"
              className="w-full py-3 rounded-2xl bg-lokiva-marigold hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 font-mono"
            >
              <span>Continue as Traveler</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </Link>
          </ScrollRevealItem>

          {/* Provider Persona Card */}
          <ScrollRevealItem className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-700/80 hover:border-lokiva-teal/50 shadow-xl transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-lokiva-teal/10 text-lokiva-teal flex items-center justify-center font-black text-lg shadow-sm border border-lokiva-teal/20">
                <Building className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-lokiva-teal/10 text-lokiva-teal border border-lokiva-teal/20">
                For Experience Creators
              </span>
              <h3 className="text-xl font-bold font-display text-lokiva-paper group-hover:text-lokiva-teal transition-colors">
                Reach More Travelers & Grow
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                List artisan masterclasses, culinary trails, and heritage walks. AI listing generator, live booking slots, demand alerts, and transparent local-impact scoring.
              </p>
            </div>

            <Link
              href="/login/provider"
              className="w-full py-3 rounded-2xl bg-lokiva-teal hover:bg-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 font-mono"
            >
              <span>Continue as Partner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollRevealItem>
        </ScrollRevealStagger>
      </ScrollRevealSection>

      {/* EXPLORE INDIA: Popular Destination Cards */}
      <ScrollRevealSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-lokiva-marigold uppercase tracking-wider flex items-center gap-1.5">
              <Globe2 className="w-4 h-4" />
              <span>Pan-India Discovery</span>
            </div>
            <WordRevealHeading
              as="h2"
              className="text-2xl sm:text-3xl font-black text-lokiva-paper mt-1 font-display"
            >
              Explore Destinations Across India
            </WordRevealHeading>
            <p className="text-xs sm:text-sm text-slate-400">
              Select any city to discover local artisans, neighborhood food walks, and customized itineraries
            </p>
          </div>

          <Link
            href="/destinations"
            className="inline-flex items-center gap-1 text-xs font-mono font-bold text-lokiva-marigold hover:text-amber-300 transition-colors"
          >
            <span>View All States & Cities</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Destination Cards Grid with Stagger Reveal */}
        <ScrollRevealStagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {destinations.map((dest) => {
            const stateSlug = dest.state_name.toLowerCase().replace(/\s+/g, '-');
            const citySlug = dest.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <ScrollRevealItem key={dest.id}>
                <Link
                  href={`/destination/${stateSlug}/${citySlug}`}
                  className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-700/80 hover:border-lokiva-marigold/50 transition-all duration-300 hover:shadow-xl hover:shadow-lokiva-marigold/10 flex flex-col justify-end h-48 sm:h-56 p-3 sm:p-4 select-none shadow-md block"
                >
                  <img
                    src={dest.image_url}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                  <div className="relative z-10 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lokiva-marigold bg-slate-900/80 px-2 py-0.5 rounded-full border border-lokiva-marigold/30 backdrop-blur-sm">
                      {dest.state_name}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-lokiva-marigold transition-colors leading-tight font-display">
                      {dest.name}
                    </h3>
                    <p className="text-[11px] text-slate-300 line-clamp-1 font-medium">
                      {dest.tagline}
                    </p>
                    <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 pt-0.5">
                      <span>{dest.experience_count} Experiences</span>
                    </div>
                  </div>
                </Link>
              </ScrollRevealItem>
            );
          })}
        </ScrollRevealStagger>
      </ScrollRevealSection>

      {/* EXPLORE BY EXPERIENCE TYPE */}
      <ScrollRevealSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-lokiva-marigold uppercase tracking-wider">
              Experience Verticals
            </div>
            <WordRevealHeading
              as="h2"
              className="text-2xl sm:text-3xl font-black text-lokiva-paper mt-1 font-display"
            >
              Explore by Interest & Travel Style
            </WordRevealHeading>
          </div>
          <Link
            href="/explore"
            className="text-xs font-mono font-bold text-lokiva-marigold hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid with Stagger Reveal */}
        <ScrollRevealStagger className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <ScrollRevealItem key={cat.key}>
              <Link
                href={`/explore?category=${cat.key}`}
                className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-700/80 hover:border-lokiva-marigold/50 hover:bg-slate-850 transition-all duration-300 group flex flex-col justify-between h-36 sm:h-40 shadow-md block"
              >
                <div className="w-10 h-10 rounded-2xl bg-lokiva-marigold/10 text-lokiva-marigold flex items-center justify-center group-hover:bg-lokiva-marigold group-hover:text-slate-950 transition-all shadow-sm border border-lokiva-marigold/20">
                  {getCategoryIcon(cat.key)}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-lokiva-marigold transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">{cat.count}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{cat.tagline}</p>
                </div>
              </Link>
            </ScrollRevealItem>
          ))}
        </ScrollRevealStagger>
      </ScrollRevealSection>

      {/* TRENDING ACROSS INDIA */}
      <ScrollRevealSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-lokiva-marigold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-lokiva-marigold" />
              <span>Trending Across India</span>
            </div>
            <WordRevealHeading
              as="h2"
              className="text-2xl sm:text-3xl font-black text-lokiva-paper mt-1 font-display"
            >
              Top Rated Local Experiences
            </WordRevealHeading>
          </div>
          <Link
            href="/explore"
            className="text-xs font-mono font-bold text-lokiva-marigold hover:text-amber-300 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Trending Cards Grid with Stagger Reveal */}
        <ScrollRevealStagger className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {trendingExperiences.map((exp) => (
            <ScrollRevealItem key={exp.id}>
              <ExperienceCard experience={exp} />
            </ScrollRevealItem>
          ))}
        </ScrollRevealStagger>
      </ScrollRevealSection>

      {/* FOOTER: Restrained & Quiet per Architecture §8 */}
      <ScrollRevealSection as="footer" className="border-t border-slate-800 pt-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold font-display text-lokiva-paper">LOKIVA</span>
            <span>· Your day, planned for how it actually goes.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <Link href="/login/traveler" className="hover:text-lokiva-marigold transition-colors">
              Traveler Login
            </Link>
            <Link href="/login/provider" className="hover:text-lokiva-teal transition-colors">
              Provider Portal
            </Link>
            <Link href="/login/admin" className="text-slate-500 hover:text-purple-400 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </ScrollRevealSection>
    </ScrollRevealContainer>
  );
}
