import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { DestinationDetail, Experience } from '../types';
import { ExperienceCard } from '../components/experience/ExperienceCard';
import { deduplicateExperienceList } from '../lib/imageDeduplicator';
import { MapPin, ArrowLeft, Sparkles, Clock, Calendar, Compass, Sun, ShieldCheck } from 'lucide-react';

export function DestinationDetailPage() {
  const { state, city } = useParams<{ state: string; city: string }>();
  const [cityData, setCityData] = useState<DestinationDetail | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    async function loadData() {
      if (!state || !city) return;
      try {
        const [c, expList] = await Promise.all([
          api.getDestination(state, city),
          api.getExperiences({ city, limit: 20 }),
        ]);
        setCityData(c);
        setExperiences(deduplicateExperienceList(expList));
      } catch (err) {
        console.error('Failed to load destination details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [state, city]);

  const categories = ['All', ...Array.from(new Set(experiences.map((e) => e.category).filter(Boolean)))];

  const filteredExperiences = activeCategory === 'All'
    ? experiences
    : experiences.filter((e) => e.category === activeCategory);

  return (
    <div className="min-h-screen bg-paper text-ink py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-dusk-600">
          <Link to="/destinations" className="hover:text-ink transition">
            Destinations
          </Link>
          <span>/</span>
          <span className="text-teal-700 font-bold">{state}</span>
          <span>/</span>
          <span className="text-ink font-bold">{city}</span>
        </div>

        {/* Hero Banner for Destination */}
        <div className="bg-ink text-paper rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-ink-800 border border-ink-700 text-marigold rounded-full text-xs font-mono font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>{state} Heritage Enclave</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-paper-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-marigold" />
                <span>Best: {cityData?.best_time_to_visit || 'October to March'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-marigold" />
                <span>28°C Clear</span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
              {city}
            </h1>
            <p className="text-sm sm:text-base text-marigold font-mono">
              {cityData?.tagline || `Authentic cultural gateway to ${state}`}
            </p>
            <p className="text-xs sm:text-sm text-dusk-100 max-w-3xl leading-relaxed font-sans">
              {cityData?.description || cityData?.culture_summary ||
                `Discover verified local workshops, artisanal guilds, and authentic heritage walks in ${city}, packed into feasible micro-moment itineraries.`}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-teal-100 border-t border-ink-700/60 pt-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>{experiences.length} Feasible Experiences</span>
            </span>
            <span>•</span>
            <span>Wheelchair & Low Walking Vetted</span>
            <span>•</span>
            <span>Live Artisan & Craft Studios</span>
          </div>
        </div>

        {/* Categories Bar */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-ink text-white shadow-sm'
                    : 'bg-white border border-paper-400 hover:bg-paper-200 text-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Experiences Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-ink">
              Vetted Cultural Experiences in {city}
            </h2>
            <span className="text-xs font-mono text-dusk">
              Showing {filteredExperiences.length} of {experiences.length}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-white border border-paper-400 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredExperiences.length === 0 ? (
            <div className="bg-white rounded-3xl border border-paper-400 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-paper-200 rounded-full flex items-center justify-center mx-auto text-2xl">
                🏛️
              </div>
              <h3 className="text-lg font-display font-bold text-ink">
                No experiences found in this category
              </h3>
              <p className="text-xs text-dusk-600 max-w-sm mx-auto">
                Try selecting "All" or explore other categories in {city}.
              </p>
              <button
                onClick={() => setActiveCategory('All')}
                className="px-4 py-2 bg-ink text-white rounded-xl text-xs font-mono font-bold"
              >
                Show All Experiences
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExperiences.map((exp) => (
                <ExperienceCard key={exp.id} experience={exp} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DestinationDetailPage;
