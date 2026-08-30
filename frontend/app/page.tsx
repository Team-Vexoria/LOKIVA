'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { DestinationSummary, CategorySummary, Experience } from '../types';
import { ExperienceCard } from '../components/ExperienceCard';
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
  User
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [trendingExperiences, setTrendingExperiences] = useState<Experience[]>([]);
  const [hiddenGems, setHiddenGems] = useState<Experience[]>([]);
  const [searchPrompt, setSearchPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Suggested multi-city demo prompts
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
    <div className="space-y-16 pb-20 overflow-hidden">
      {/* HERO SECTION: Discover India, Your Way */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-500/20 via-rose-500/20 to-amber-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>AI-Powered Local Discovery Across India</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.1]">
            Discover India,{' '}
            <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 dark:from-orange-400 dark:via-rose-400 dark:to-amber-300 bg-clip-text text-transparent">
              Your Way.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            From secret coastal alleyways and centuries-old artisan guilds to authentic regional culinary trails — LOKIVA finds experiences tailored to your time, budget, and travel style.
          </p>

          {/* AI Search Prompt Bar */}
          <div className="pt-4 max-w-3xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="relative p-2 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 focus-within:border-orange-500/60 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all"
            >
              <div className="flex items-center gap-2.5 px-3 py-2 flex-1">
                <Search className="w-5 h-5 text-orange-500 shrink-0" />
                <input
                  type="text"
                  value={searchPrompt}
                  onChange={(e) => setSearchPrompt(e.target.value)}
                  placeholder="Tell me who you're with, time, budget & city (e.g., 4h in Mumbai under ₹2,000)..."
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/30 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Find Experiences</span>
              </button>
            </form>

            {/* 1-Click Multi-City Test Prompts */}
            <div className="mt-4 flex items-center gap-1.5 flex-wrap justify-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-500" /> Try prompts:
              </span>
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchPrompt(p.prompt)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all hover:text-slate-900 dark:hover:text-white shadow-sm"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW ARE YOU USING LOKIVA: Role Portal Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="text-xs font-bold text-orange-500 uppercase tracking-wider">
            One Platform · Three Focused Experiences
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            How are you using LOKIVA?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Traveler Persona Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 shadow-xl transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-lg shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                For Travelers
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-500 transition-colors">
                Discover India, Your Way
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Personalized AI recommendations, interactive maps, day itineraries, and authentic hidden gems suited to your budget and walking style.
              </p>
            </div>

            <Link
              href="/login/traveler"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue as Traveler</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Provider Persona Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 shadow-xl transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg shadow-sm">
                <Building className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                For Experience Creators
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-500 transition-colors">
                Reach More Travelers & Grow
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                List artisan masterclasses, culinary trails, and heritage walks. Manage real-time bookings, scheduling slots, and audience analytics.
              </p>
            </div>

            <Link
              href="/login/provider"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue as Partner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* EXPLORE INDIA: Popular Destination Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1.5">
              <Globe2 className="w-4 h-4" />
              <span>Pan-India Discovery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              Explore Destinations Across India
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select any city to discover local artisans, neighborhood food walks, and customized itineraries
            </p>
          </div>

          <Link
            href="/destinations"
            className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            <span>View All States & Cities</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {destinations.map((dest) => {
            const stateSlug = dest.state_name.toLowerCase().replace(/\s+/g, '-');
            const citySlug = dest.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link
                key={dest.id}
                href={`/destination/${stateSlug}/${citySlug}`}
                className="group relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 flex flex-col justify-end h-48 sm:h-56 p-3 sm:p-4 select-none shadow-md"
              >
                <img
                  src={dest.image_url}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded-full border border-orange-500/30 backdrop-blur-sm">
                    {dest.state_name}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
                    {dest.name}
                  </h3>
                  <p className="text-[11px] text-slate-200 line-clamp-1 font-medium">
                    {dest.tagline}
                  </p>
                  <div className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1 pt-0.5">
                    <span>{dest.experience_count} Experiences</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* EXPLORE BY EXPERIENCE TYPE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-orange-500 uppercase tracking-wider">
              Experience Verticals
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              Explore by Interest & Travel Style
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs font-bold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={`/explore?category=${cat.key}`}
              className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 group flex flex-col justify-between h-36 sm:h-40 shadow-md"
            >
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                {getCategoryIcon(cat.key)}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-500 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">{cat.count}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{cat.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TRENDING ACROSS INDIA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>Trending Across India</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              Top Rated Local Experiences
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs font-bold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {trendingExperiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100">LOKIVA</span>
            <span>· Find the place. Feel the local.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/login/traveler" className="hover:text-orange-500 transition-colors">
              Traveler Login
            </Link>
            <Link href="/login/provider" className="hover:text-blue-500 transition-colors">
              Provider Portal
            </Link>
            <Link href="/login/admin" className="text-slate-400 hover:text-purple-500 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
