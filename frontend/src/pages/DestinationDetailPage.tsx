import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { DestinationDetail, Experience, City } from '../types';
import { ExperienceCard } from '../components/experience/ExperienceCard';
import { deduplicateExperienceList } from '../lib/imageDeduplicator';
import {
  MapPin,
  ArrowLeft,
  Sparkles,
  Calendar,
  Compass,
  Sun,
  ShieldCheck,
  Landmark,
  Building2,
  ArrowRight,
} from 'lucide-react';

export function DestinationDetailPage() {
  const { state, city } = useParams<{ state: string; city?: string }>();
  const [cityData, setCityData] = useState<DestinationDetail | null>(null);
  const [stateCities, setStateCities] = useState<City[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const decodedState = state ? decodeURIComponent(state).trim() : '';
  const decodedCity = city ? decodeURIComponent(city).trim() : '';
  const isStateView = !decodedCity;

  useEffect(() => {
    async function loadData() {
      if (!decodedState) return;
      setIsLoading(true);

      try {
        if (!isStateView) {
          // 1. SPECIFIC CITY VIEW: /destination/:state/:city
          const [c, expList] = await Promise.all([
            api.getDestination(decodedState, decodedCity).catch(() => null),
            api.getExperiences({ city: decodedCity, limit: 30 }).catch(() => []),
          ]);

          if (c) {
            setCityData(c);
          } else {
            // Fallback: construct city data from params
            setCityData({
              id: 999,
              name: decodedCity,
              state_name: decodedState,
              state_code: decodedState.slice(0, 2).toUpperCase(),
              tagline: `Authentic cultural gateway to ${decodedState}`,
              description: `Discover verified local workshops, artisanal guilds, and authentic heritage walks in ${decodedCity}, packed into feasible micro-moment itineraries.`,
              best_time_to_visit: 'October to March',
              areas: [],
              top_experiences: [],
            });
          }

          setExperiences(deduplicateExperienceList(expList || []));
        } else {
          // 2. STATE VIEW: /destination/:state (e.g. /destination/Ladakh)
          const [citiesInState, stateExpList] = await Promise.all([
            api.getCities({ state_name: decodedState, limit: 50 }).catch(() => []),
            api.getExperiences({ state: decodedState, limit: 30 }).catch(() => []),
          ]);

          setStateCities(citiesInState || []);

          let combinedExperiences = stateExpList || [];
          // If state filter returned 0, try fetching by first city's experiences
          if (combinedExperiences.length === 0 && citiesInState && citiesInState.length > 0) {
            const firstCityExp = await api
              .getExperiences({ city: citiesInState[0].name, limit: 30 })
              .catch(() => []);
            combinedExperiences = firstCityExp;
          }

          setExperiences(deduplicateExperienceList(combinedExperiences));

          // Set synthetic state-level detail
          setCityData({
            id: 888,
            name: decodedState,
            state_name: decodedState,
            state_code: decodedState.slice(0, 2).toUpperCase(),
            tagline: `Living Heritage, Traditions & Cultural Enclaves of ${decodedState}`,
            description: `Explore centuries of living regional heritage, artisanal craft guilds, historic monuments, and authentic local food chapters across ${decodedState}.`,
            best_time_to_visit: 'Year-round / Seasonal',
            areas: [],
            top_experiences: [],
          });
        }
      } catch (err) {
        console.error('Failed to load destination details:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [decodedState, decodedCity, isStateView]);

  const categories = [
    'All',
    ...Array.from(new Set(experiences.map((e) => e.category).filter(Boolean))),
  ];

  const filteredExperiences =
    activeCategory === 'All'
      ? experiences
      : experiences.filter((e) => e.category === activeCategory);

  return (
    <div className="min-h-screen bg-paper text-ink py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-dusk-600">
          <Link to="/" className="hover:text-ink transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/destinations" className="hover:text-ink transition">
            Destinations
          </Link>
          <span>/</span>
          {isStateView ? (
            <span className="text-ink font-bold">{decodedState}</span>
          ) : (
            <>
              <Link
                to={`/destination/${encodeURIComponent(decodedState)}`}
                className="text-teal-700 font-bold hover:underline transition"
              >
                {decodedState}
              </Link>
              <span>/</span>
              <span className="text-ink font-bold">{decodedCity}</span>
            </>
          )}
        </div>

        {/* Hero Banner for Destination / State */}
        <div className="bg-ink text-paper rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-ink-800 border border-ink-700 text-marigold rounded-full text-xs font-mono font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>
                {isStateView ? `${decodedState} Cultural Gateway` : `${decodedState} Heritage Enclave`}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-paper-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-marigold" />
                <span>Best: {cityData?.best_time_to_visit || 'October to March'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-marigold" />
                <span>26°C Clear</span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
              {isStateView ? decodedState : decodedCity}
            </h1>
            <p className="text-sm sm:text-base text-marigold font-mono">
              {cityData?.tagline ||
                (isStateView
                  ? `Authentic regional discovery across ${decodedState}`
                  : `Authentic cultural gateway to ${decodedState}`)}
            </p>
            <p className="text-xs sm:text-sm text-dusk-100 max-w-3xl leading-relaxed font-sans">
              {cityData?.description ||
                cityData?.culture_summary ||
                `Discover verified local workshops, artisanal guilds, and authentic heritage walks in ${isStateView ? decodedState : decodedCity}, packed into feasible micro-moment itineraries.`}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-teal-100 border-t border-ink-700/60 pt-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>{experiences.length} Feasible Experiences</span>
            </span>
            {isStateView && stateCities.length > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-300" />
                  <span>{stateCities.length} Destination Enclaves</span>
                </span>
              </>
            )}
            <span>•</span>
            <span>Wheelchair & Low Walking Vetted</span>
            <span>•</span>
            <span>Live Artisan & Craft Studios</span>
          </div>
        </div>

        {/* If State View: Show Destination Enclaves in this State */}
        {isStateView && stateCities.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-ink">
                  Destination Enclaves in {decodedState}
                </h2>
                <p className="text-xs text-dusk-600 font-sans">
                  Select an enclave to explore local districts, neighborhood craft studios, and itineraries
                </p>
              </div>
              <span className="text-xs font-mono text-dusk">
                {stateCities.length} enclaves
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stateCities.map((ct) => (
                <Link
                  key={ct.id}
                  to={`/destination/${encodeURIComponent(decodedState)}/${encodeURIComponent(ct.name)}`}
                  className="group bg-white rounded-2xl border border-paper-400 p-5 shadow-sm hover:shadow-md hover:border-teal transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-teal font-bold bg-teal/10 px-2.5 py-0.5 rounded-full">
                        <MapPin className="w-3 h-3 text-marigold" />
                        <span>Enclave Hub</span>
                      </span>
                      <span className="text-xs font-mono text-dusk-500">
                        {ct.heritage_count || 6}+ Sites
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-bold text-ink group-hover:text-teal transition">
                      {ct.name}
                    </h3>
                    <p className="text-xs text-dusk-600 font-sans line-clamp-2">
                      {ct.tagline || ct.description || `Historic enclave in ${decodedState}`}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-paper-200 flex items-center justify-between text-xs font-mono text-teal font-bold group-hover:translate-x-1 transition-transform">
                    <span>Explore Enclave</span>
                    <ArrowRight className="w-3.5 h-3.5 text-marigold" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Categories Bar */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
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
              Vetted Cultural Experiences in {isStateView ? decodedState : decodedCity}
            </h2>
            <span className="text-xs font-mono text-dusk">
              Showing {filteredExperiences.length} of {experiences.length}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-white border border-paper-400 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredExperiences.length === 0 ? (
            <div className="bg-white rounded-3xl border border-paper-400 p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-paper-200 rounded-full flex items-center justify-center mx-auto text-ink">
                <Landmark className="w-6 h-6 text-dusk" />
              </div>
              <h3 className="text-lg font-display font-bold text-ink">
                No experiences listed yet for this category in {isStateView ? decodedState : decodedCity}
              </h3>
              <p className="text-xs text-dusk-600 max-w-md mx-auto">
                Explore our full catalogue of authentic micro-experiences or try switching categories.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveCategory('All')}
                  className="px-4 py-2 bg-ink text-white rounded-xl text-xs font-mono font-bold cursor-pointer"
                >
                  Show All Experiences
                </button>
                <Link
                  to="/destinations"
                  className="px-4 py-2 bg-white border border-paper-400 text-ink rounded-xl text-xs font-mono font-bold hover:bg-paper-100"
                >
                  Browse Destinations
                </Link>
              </div>
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
