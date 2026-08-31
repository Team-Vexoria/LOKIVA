import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Experience } from '../types';
import { ExperienceCard } from '../components/experience/ExperienceCard';
import { Bookmark, Sparkles, ArrowRight } from 'lucide-react';

export function SavedPage() {
  const [savedExperiences, setSavedExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      try {
        const list = await api.getFavorites();
        if (list.length > 0) {
          setSavedExperiences(list);
        } else {
          // Fallback to top curated for demo
          const fallback = await api.getExperiences({ limit: 4 });
          setSavedExperiences(fallback);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSaved();
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-paper-400 text-teal rounded-full text-xs font-mono font-bold shadow-sm">
            <Bookmark className="w-3.5 h-3.5 text-marigold" />
            <span>Wishlist & Shortlist</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink">
            Saved Cultural Experiences
          </h1>
          <p className="text-xs text-dusk-600">
            Workshops and heritage trails saved for your upcoming journeys.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-white border border-paper-400 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : savedExperiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedExperiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} isSaved={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-paper-400 p-8 space-y-4">
            <Bookmark className="w-12 h-12 text-dusk-200 mx-auto" />
            <h3 className="text-lg font-display font-bold text-ink">No saved experiences yet</h3>
            <p className="text-xs text-dusk font-sans">Click the bookmark icon on any experience to save it here.</p>
            <Link
              to="/explore"
              className="inline-block px-5 py-2.5 bg-ink text-paper rounded-xl text-xs font-mono font-bold"
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
