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
        if (Array.isArray(list) && list.length > 0) {
          setSavedExperiences(list);
          // Sync with local storage cache
          try {
            localStorage.setItem('lokiva_saved_items', JSON.stringify(list));
          } catch {}
        } else {
          // If backend returns empty, check if user saved anything locally
          try {
            const local = JSON.parse(localStorage.getItem('lokiva_saved_items') || '[]');
            setSavedExperiences(Array.isArray(local) ? local : []);
          } catch {
            setSavedExperiences([]);
          }
        }
      } catch (err) {
        console.error('Error loading favorites from backend:', err);
        // Fallback strictly to locally saved items, never fake demo items
        try {
          const local = JSON.parse(localStorage.getItem('lokiva_saved_items') || '[]');
          setSavedExperiences(Array.isArray(local) ? local : []);
        } catch {
          setSavedExperiences([]);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadSaved();
  }, []);

  const handleRemoveFromSaved = (experienceId: number) => {
    setSavedExperiences((prev) => prev.filter((item) => item.id !== experienceId));
    try {
      const local = JSON.parse(localStorage.getItem('lokiva_saved_items') || '[]');
      const updated = Array.isArray(local) ? local.filter((item: any) => item.id !== experienceId) : [];
      localStorage.setItem('lokiva_saved_items', JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-ink py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E5DFD5] text-[#C1443B] rounded-full text-xs font-mono font-bold shadow-2xs">
            <Bookmark className="w-3.5 h-3.5 fill-[#C1443B]" />
            <span>Wishlist &amp; Shortlist</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-ink tracking-tight">
            Saved Cultural Experiences
          </h1>
          <p className="text-xs sm:text-sm text-dusk-600 font-sans font-medium">
            Workshops and heritage trails saved for your upcoming journeys.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-white border border-[#E5DFD5] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : savedExperiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedExperiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                isSaved={true}
                onBookmarkChange={(nowSaved) => {
                  if (!nowSaved) {
                    handleRemoveFromSaved(exp.id);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E5DFD5] p-8 sm:p-12 space-y-4 max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center mx-auto text-[#C1443B] shadow-2xs">
              <Bookmark className="w-7 h-7 text-[#C1443B]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-display font-black text-ink">No saved experiences yet</h3>
              <p className="text-xs sm:text-sm text-dusk-600 font-sans max-w-sm mx-auto leading-relaxed">
                Explore authentic artisan workshops, generational guilds, and heritage trails, and tap the bookmark icon on any card to save it here.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFC067] hover:bg-[#F5B24E] text-[#12213B] font-heading text-xs font-extrabold tracking-wide rounded-xl border border-[#E5A84B]/60 shadow-sm transition active:scale-[0.98] cursor-pointer"
              >
                <span>Explore 36 States</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
