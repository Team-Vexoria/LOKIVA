import React, { useState, useRef, useMemo } from 'react';
import { Experience } from '../../types';
import { MomentCard } from './MomentCard';
import { ChevronLeft, ChevronRight, Sparkles, Compass } from 'lucide-react';

interface LokivaMomentsSectionProps {
  experiences: Experience[];
  selectedCity?: string;
}

interface CategoryFilter {
  id: string;
  label: string;
  emoji: string;
}

const MOMENT_CATEGORIES: CategoryFilter[] = [
  { id: 'all', label: 'All Moments', emoji: '✨' },
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'culture', label: 'Culture', emoji: '🎭' },
  { id: 'adventure', label: 'Adventure', emoji: '🏔' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'art', label: 'Art & Workshops', emoji: '🎨' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌙' },
  { id: 'hidden_gems', label: 'Hidden Gems', emoji: '💎' },
];

export function LokivaMomentsSection({ experiences, selectedCity }: LokivaMomentsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Curate a rich, diverse Pan-India distribution across cities & categories
  const filteredMoments = useMemo(() => {
    if (!experiences || experiences.length === 0) return [];

    let filtered = experiences.filter((exp) => {
      if (activeCategory === 'all') return true;
      if (activeCategory === 'hidden_gems') return exp.is_hidden_gem;

      const cat = (exp.category || '').toLowerCase();
      if (activeCategory === 'food') return cat.includes('food') || cat.includes('culinary');
      if (activeCategory === 'culture') return cat.includes('culture') || cat.includes('heritage') || cat.includes('history');
      if (activeCategory === 'adventure') return cat.includes('adventure') || cat.includes('sport') || cat.includes('trek');
      if (activeCategory === 'nature') return cat.includes('nature') || cat.includes('wildlife') || cat.includes('beach');
      if (activeCategory === 'art') return cat.includes('art') || cat.includes('craft') || cat.includes('workshop');
      if (activeCategory === 'nightlife') return cat.includes('night') || cat.includes('evening') || cat.includes('sunset') || cat.includes('music');
      return true;
    });

    // If all moments are selected and no specific city is locked, interleave cities to prevent 6 identical city cards in a row
    if (!selectedCity || selectedCity.trim() === '') {
      const cityBuckets: Record<string, Experience[]> = {};
      filtered.forEach((exp) => {
        const cityKey = exp.city || exp.city_name || 'India';
        if (!cityBuckets[cityKey]) cityBuckets[cityKey] = [];
        cityBuckets[cityKey].push(exp);
      });

      const interleaved: Experience[] = [];
      const cities = Object.keys(cityBuckets);
      let maxLen = 0;
      cities.forEach((c) => {
        if (cityBuckets[c].length > maxLen) maxLen = cityBuckets[c].length;
      });

      for (let i = 0; i < maxLen; i++) {
        for (const c of cities) {
          if (cityBuckets[c][i]) {
            interleaved.push(cityBuckets[c][i]);
          }
        }
      }
      return interleaved.slice(0, 24);
    } else {
      // Prioritize selected city
      const cityLower = selectedCity.toLowerCase();
      return [...filtered].sort((a, b) => {
        const aMatch = (a.city || '').toLowerCase().includes(cityLower) ? 1 : 0;
        const bMatch = (b.city || '').toLowerCase().includes(cityLower) ? 1 : 0;
        return bMatch - aMatch;
      });
    }
  }, [experiences, activeCategory, selectedCity]);

  // Carousel Scroll Controls
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -360 : 360;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Clean White Dashboard Card Container (Matching LOKIVA Aesthetic) */}
      <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 shadow-sm space-y-6 text-ink">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-100 border border-paper-300 text-teal rounded-full text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-marigold" />
              <span>Visual Cultural Discovery</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-display font-bold text-ink tracking-tight leading-tight">
              LOKIVA Moments
            </h2>

            <p className="text-sm sm:text-base font-display italic text-marigold-700 font-medium">
              See India through local eyes.
            </p>

            <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
              Discover food, culture, adventure, art and hidden gems through experiences worth remembering.
            </p>
          </div>

          {/* Carousel Navigation Arrow Controls (Desktop) */}
          <div className="hidden sm:flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Previous moments"
              className="w-10 h-10 rounded-2xl bg-paper-100 hover:bg-ink hover:text-white text-ink border border-paper-300 flex items-center justify-center transition shadow-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Next moments"
              className="w-10 h-10 rounded-2xl bg-paper-100 hover:bg-ink hover:text-white text-ink border border-paper-300 flex items-center justify-center transition shadow-xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-t border-paper-200 pt-4">
          {MOMENT_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-marigold text-ink-950 shadow-sm scale-102 border border-marigold-600'
                    : 'bg-paper-100 text-dusk-700 hover:text-ink hover:bg-paper-200 border border-paper-300'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Horizontal Immersive Carousel */}
        {filteredMoments.length === 0 ? (
          <div className="text-center py-16 bg-paper-50 rounded-2xl border border-dashed border-paper-400 space-y-2">
            <Compass className="w-8 h-8 text-dusk mx-auto" />
            <p className="text-sm font-display font-bold text-ink">
              No moments found for this category
            </p>
            <p className="text-xs font-mono text-dusk">
              Try switching categories or exploring all moments across India.
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-2 text-xs font-mono font-bold text-marigold hover:underline"
            >
              View All Moments
            </button>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-paper-400"
          >
            {filteredMoments.map((exp) => (
              <MomentCard key={exp.id} experience={exp} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
