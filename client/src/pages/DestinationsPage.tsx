import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { State, City } from '../types';
import { MapPin, Compass, ArrowRight, Sparkles } from 'lucide-react';

export function DestinationsPage() {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const [statesData, citiesData] = await Promise.all([
          api.getStates(),
          api.getCities(),
        ]);
        setStates(statesData);
        setCities(citiesData);
      } catch (err) {
        console.error('Failed to load destinations:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDestinations();
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-paper-400 text-teal rounded-full text-xs font-mono font-bold shadow-sm">
            <Compass className="w-3.5 h-3.5 text-marigold" />
            <span>Pan-India Cultural Hubs</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-ink">
            15 Indian States & Heritage Enclaves
          </h1>
          <p className="text-xs sm:text-sm text-dusk-600 font-sans">
            From the Portuguese quarters of Fontainhas in Goa to the blue pottery ateliers of Sanganer and the spice wharfs of Fort Kochi.
          </p>
        </div>

        {/* States & Cities Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white border border-paper-400 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {states.map((state) => {
              const stateCities = cities.filter((c) => c.state_id === state.id);
              return (
                <div
                  key={state.id}
                  className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-7 space-y-4 shadow-sm hover:shadow-xl hover:border-ink/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-paper-200 text-teal-700">
                        {stateCities.length} Enclaves Vetted
                      </span>
                      <span className="text-[11px] font-mono text-dusk">
                        {state.experience_count || 16} Experiences
                      </span>
                    </div>

                    <h3 className="text-2xl font-display font-bold text-ink">
                      {state.name}
                    </h3>
                    <p className="text-xs text-dusk-600 line-clamp-2 leading-relaxed">
                      {state.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-paper-300">
                    <div className="flex flex-wrap gap-1.5">
                      {stateCities.map((city) => (
                        <Link
                          key={city.id}
                          to={`/destination/${encodeURIComponent(state.name)}/${encodeURIComponent(city.name)}`}
                          className="px-2.5 py-1 bg-paper-100 hover:bg-ink hover:text-paper rounded-lg text-xs font-mono text-ink transition flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3 text-marigold" />
                          <span>{city.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
