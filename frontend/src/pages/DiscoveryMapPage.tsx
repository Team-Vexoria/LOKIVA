import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IndiaDiscoveryMap } from '../components/map/IndiaDiscoveryMap';
import { api } from '../lib/api';
import { Experience } from '../types';
import {
  ArrowLeft,
  Map,
  Sparkles,
  Filter,
  Globe,
  Compass,
} from 'lucide-react';

export function DiscoveryMapPage() {
  const [allPlaces, setAllPlaces] = useState<Experience[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 5000],
    freeEntry: false,
    hiddenGems: false,
    rating: 0
  });

  // Load all places from backend
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const experiences = await api.getExperiences({ limit: 250 });
        setAllPlaces(experiences);
      } catch (error) {
        console.error('Failed to load experiences:', error);
      }
    };
    loadPlaces();
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Main Content */}
      <div className="pt-16 sm:pt-20">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  to="/"
                  className="flex items-center gap-1.5 text-dusk hover:text-marigold transition-colors text-xs font-mono font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Home</span>
                </Link>
                <span className="text-paper-400">/</span>
                <span className="text-xs font-mono text-dusk">Discovery Map</span>
                {allPlaces.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-teal/10 text-teal rounded-full text-[11px] font-mono font-bold border border-teal/20">
                    <Globe className="w-3 h-3" />
                    {allPlaces.length} cultural places
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-marigold" />
                <span className="text-xs font-mono uppercase tracking-wider text-teal font-bold">
                  Interactive Discovery
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink">
                Explore India Through Our Interactive Map
              </h1>
              <p className="text-sm text-dusk-600 max-w-2xl">
                Click on states to drill down, discover hidden gems, and visually plan your journey across India's rich cultural landscape.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters({ ...filters, freeEntry: !filters.freeEntry })}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors ${
                  filters.freeEntry
                    ? 'bg-teal/10 text-teal border border-teal/30'
                    : 'bg-paper-100 text-dusk border border-paper-400 hover:text-teal'
                }`}
              >
                Free Entry Only
              </button>
              <button
                onClick={() => setFilters({ ...filters, hiddenGems: !filters.hiddenGems })}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors ${
                  filters.hiddenGems
                    ? 'bg-marigold/10 text-marigold border border-marigold/30'
                    : 'bg-paper-100 text-dusk border border-paper-400 hover:text-marigold'
                }`}
              >
                Hidden Gems
              </button>
              <div className="relative">
                <button
                  className="px-3 py-1.5 bg-paper-100 text-dusk border border-paper-400 rounded-xl text-xs font-mono font-bold hover:text-ink transition-colors flex items-center gap-1.5"
                  onClick={() => {}}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter by Category</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map Container */}
        <div className="relative px-4 max-w-7xl mx-auto">
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-paper-400 shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-marigold/10 rounded-xl">
                  <Map className="w-5 h-5 text-marigold" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-ink">Interactive India Map</h2>
                  <p className="text-xs text-dusk">
                    Click & drag to navigate • Scroll to zoom • Click places for details
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs font-mono">
                <span className="text-dusk">Zoom Level:</span>
                <span className="font-bold text-ink">Normal</span>
                <span className="text-dusk">|</span>
                <span className="text-dusk">View:</span>
                <span className="font-bold text-ink">States</span>
              </div>
            </div>

            {/* The Interactive Map */}
            <div className="h-[600px] rounded-2xl overflow-hidden border border-paper-400">
              <IndiaDiscoveryMap
                initialView="all"
                enableZoom={true}
                showControls={true}
              />
            </div>
          </div>

          {/* Stats & Info Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-paper-400 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-marigold/10 rounded-lg">
                  <Sparkles className="w-4 h-4 text-marigold" />
                </div>
                <h3 className="text-sm font-display font-bold text-ink">Discovery Tips</h3>
              </div>
              <ul className="text-xs text-dusk-600 space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-marigold font-bold">•</span>
                  <span>Click states to zoom into districts</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-teal font-bold">•</span>
                  <span>Hover over pins for quick previews</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-clay font-bold">•</span>
                  <span>Click places for detailed cards & itinerary options</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-ink font-bold">•</span>
                  <span>Use controls on right for navigation</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-paper-400 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-teal/10 rounded-lg">
                  <Globe className="w-4 h-4 text-teal" />
                </div>
                <h3 className="text-sm font-display font-bold text-ink">Map Legend</h3>
              </div>
              <div className="text-xs text-dusk-600 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F0A63B]" />
                  <span>Paid Entry Places</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#1F7A6C]" />
                  <span>Free Entry Places</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-marigold" />
                  <span>Hidden Gems (Lesser-known)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-teal" />
                  <span>District Centers</span>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-paper-400 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-clay/10 rounded-lg">
                  <Compass className="w-4 h-4 text-clay" />
                </div>
                <h3 className="text-sm font-display font-bold text-ink">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                <Link
                  to="/explore"
                  className="block w-full text-center px-3 py-2 bg-paper-100 hover:bg-paper-200 text-ink border border-paper-400 rounded-xl text-xs font-mono font-bold transition-colors"
                >
                  Go to Direct Experience Search
                </Link>
                <Link
                  to="/itinerary"
                  className="block w-full text-center px-3 py-2 bg-ink hover:bg-ink-800 text-white rounded-xl text-xs font-mono font-bold transition-colors"
                >
                  Start Building Itinerary
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="block w-full text-center px-3 py-2 bg-white hover:bg-paper text-ink border border-paper-400 rounded-xl text-xs font-mono font-bold transition-colors"
                >
                  Reset Map View
                </button>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-marigold/5 via-teal/5 to-clay/5 rounded-2xl border border-paper-400 p-6 text-center">
            <h3 className="text-lg font-display font-bold text-ink mb-2">
              Ready to plan your journey?
            </h3>
            <p className="text-sm text-dusk-600 mb-4 max-w-2xl mx-auto">
              Found a place you like? Click "Explore Full Itinerary" on any place card to start building a detailed plan with our AI-powered itinerary builder.
            </p>
            <Link
              to="/itinerary"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink hover:bg-ink-800 text-white rounded-xl text-sm font-mono font-bold transition-colors shadow-sm"
            >
              <span>Start Planning with AI Guide</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiscoveryMapPage;
