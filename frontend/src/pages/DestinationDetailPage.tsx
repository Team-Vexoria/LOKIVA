import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { City, DestinationDetail, Experience } from '../types';
import { ExperienceCard } from '../components/experience/ExperienceCard';
import { MapPin, ArrowLeft, Sparkles, Clock, Calendar } from 'lucide-react';

export function DestinationDetailPage() {
  const { state, city } = useParams<{ state: string; city: string }>();
  const [cityData, setCityData] = useState<DestinationDetail | City | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!state || !city) return;
      try {
        const [c, expList] = await Promise.all([
          api.getDestination(state, city),
          api.getExperiences({ city, limit: 12 }),
        ]);
        setCityData(c);
        setExperiences(expList);
      } catch (err) {
        console.error('Failed to load destination details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [state, city]);

  return (
    <div className="min-h-screen bg-paper text-ink py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Back Link */}
        <Link
          to="/destinations"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-dusk hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Destinations</span>
        </Link>

        {/* Hero Banner for Destination with Pexels Background Cover */}
        <div className="bg-ink text-paper rounded-3xl p-8 sm:p-12 space-y-4 shadow-2xl relative overflow-hidden group">
          {cityData?.image_url && (
            <div className="absolute inset-0 z-0">
              <img
                src={cityData.image_url}
                alt={city}
                className="w-full h-full object-cover opacity-35 scale-105 group-hover:scale-100 transition-transform duration-700 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
            </div>
          )}

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-ink/80 backdrop-blur-md border border-ink-700 text-marigold rounded-full text-xs font-mono font-bold">
              <MapPin className="w-3.5 h-3.5" />
              <span>{state} Heritage Enclave</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white">
              {city}
            </h1>

            <p className="text-xs sm:text-sm text-dusk-100 max-w-2xl leading-relaxed font-sans">
              {cityData?.description ||
                `Discover verified local workshops, artisanal guilds, and authentic heritage walks in ${city}, packed into feasible micro-moment itineraries.`}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-teal-100">
              <span>{experiences.length} Feasible Experiences</span>
              <span>•</span>
              <span>Wheelchair & Low Walking Vetted</span>
            </div>
          </div>
        </div>

        {/* Experiences Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-ink">
            Vetted Cultural Experiences in {city}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-white border border-paper-400 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {experiences.map((exp) => (
                <ExperienceCard key={exp.id} experience={exp} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
