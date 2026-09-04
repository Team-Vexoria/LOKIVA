import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Experience } from '../../types';
import { MomentCard } from './MomentCard';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Compass,
  Utensils,
  Landmark,
  Trees,
  Palette,
  Moon,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface LokivaMomentsSectionProps {
  experiences: Experience[];
  selectedCity?: string;
  className?: string;
}

interface CategoryFilter {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MOMENT_CATEGORIES: CategoryFilter[] = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'food', label: 'Culinary', icon: Utensils },
  { id: 'culture', label: 'Heritage', icon: Landmark },
  { id: 'art', label: 'Crafts', icon: Palette },
  { id: 'nature', label: 'Nature', icon: Trees },
  { id: 'hidden_gems', label: 'Hidden Gems', icon: Sparkles },
];

export function LokivaMomentsSection({ experiences, selectedCity, className = '' }: LokivaMomentsSectionProps) {
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

  // Auto-Scroll & Interactive Scroll Controls
  const isHoveredRef = useRef(false);
  const isInteractingRef = useRef(false);
  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pauseAutoScroll = (ms: number = 2000) => {
    isInteractingRef.current = true;
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, ms);
  };

  // Hover + Mouse Wheel Scroll: translates wheel delta to horizontal carousel scrolling
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta !== 0) {
        e.preventDefault();
        pauseAutoScroll(2000);
        el.scrollLeft += delta;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Continuous Smooth Auto-Scroll to the Right (faster gliding pace)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || filteredMoments.length === 0) return;

    let animId: number;
    let lastTime = performance.now();
    const scrollSpeed = 1.8; // Smooth, noticeable gliding speed (px per ~16.6ms)

    const step = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      if (!isHoveredRef.current && !isInteractingRef.current && el) {
        el.scrollLeft += scrollSpeed * Math.min(delta / 16.67, 3);
        // Seamless reset when reaching right boundary
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 4) {
          el.scrollLeft = 0;
        }
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animId);
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, [filteredMoments.length]);

  // Carousel Manual Scroll Controls (Buttons)
  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    pauseAutoScroll(2500); // Pause RAF mutations so native smooth scrolling finishes cleanly
    const scrollAmount = direction === 'left' ? -380 : 380;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className={`py-6 sm:py-8 border-t border-paper-300 space-y-6 text-ink ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-paper-200 text-teal-800 rounded-full text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-marigold" />
            <span>Visual Cultural Discovery</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink tracking-tight">
            LOKIVA Moments
          </h2>

          <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
            See India through local eyes — street encounters, living craft workshops, and generational traditions.
          </p>
        </div>

        {/* Carousel Navigation Arrow Controls (Desktop) */}
        <div className="hidden sm:flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Previous moments"
            className="w-10 h-10 rounded-xl bg-white hover:bg-paper-200 active:scale-95 text-ink border border-paper-300 flex items-center justify-center transition shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Next moments"
            className="w-10 h-10 rounded-xl bg-white hover:bg-paper-200 active:scale-95 text-ink border border-paper-300 flex items-center justify-center transition shadow-2xs cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category Pills Strip (No scrollbar, concise labels) */}
      <div className="flex items-center gap-2 overflow-x-hidden flex-wrap border-t border-paper-200 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MOMENT_CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          const IconComponent = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-ink text-white shadow-sm scale-102 border border-ink'
                  : 'bg-paper-100 text-dusk-700 hover:text-ink hover:bg-paper-200 border border-paper-300'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-marigold' : 'text-dusk'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Horizontal Immersive Carousel (Auto-scrolls slowly to right, no visible scrollbar) */}
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
            className="mt-2 text-xs font-mono font-bold text-marigold hover:underline cursor-pointer"
          >
            View All Moments
          </button>
        </div>
      ) : (
        <div
          className="relative group/carousel"
          onMouseEnter={() => { isHoveredRef.current = true; }}
          onMouseLeave={() => { isHoveredRef.current = false; }}
        >
          {/* Side Floating Left Arrow */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-ink/85 hover:bg-ink text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition shadow-lg opacity-0 group-hover/carousel:opacity-100 cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Carousel Cards Container */}
          <div
            ref={scrollContainerRef}
            onMouseEnter={() => { isHoveredRef.current = true; }}
            onMouseLeave={() => { isHoveredRef.current = false; }}
            onTouchStart={() => { pauseAutoScroll(3000); }}
            onTouchEnd={() => { isHoveredRef.current = false; }}
            className="flex items-center gap-5 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredMoments.map((exp) => (
              <MomentCard key={exp.id} experience={exp} />
            ))}
          </div>

          {/* Side Floating Right Arrow */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-ink/85 hover:bg-ink text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition shadow-lg opacity-0 group-hover/carousel:opacity-100 cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
}
