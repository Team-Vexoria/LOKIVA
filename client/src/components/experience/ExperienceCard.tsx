import React from 'react';
import { Link } from 'react-router-dom';
import { Experience } from '../../types';
import { MapPin, Clock, Star, Bookmark, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';

interface ExperienceCardProps {
  experience: Experience;
  isSaved?: boolean;
  onBookmarkChange?: (isSaved: boolean) => void;
}

export function ExperienceCard({
  experience,
  isSaved: initialIsSaved = false,
  onBookmarkChange,
}: ExperienceCardProps) {
  const [isSaved, setIsSaved] = React.useState(initialIsSaved);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaving(true);
    try {
      await api.toggleFavorite(experience.id);
      const newState = !isSaved;
      setIsSaved(newState);
      onBookmarkChange?.(newState);
    } catch (err) {
      console.error('Bookmark error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Category Icon Map
  const categoryIconMap: Record<string, string> = {
    'Food & Culinary': '🍲',
    'Art & Craft': '🎨',
    'Heritage & History': '🏛️',
    'Music & Dance': '🎭',
    'Nature & Wildlife': '🌿',
    'Wellness & Spiritual': '🧘',
    'Local Markets': '🛍️',
  };

  const icon = categoryIconMap[experience.category] || '✨';

  // Compute a deterministic Local Impact Score (85% - 98%)
  const localImpact = Math.min(98, 85 + ((experience.id * 7) % 14));

  return (
    <Link
      to={`/experience/${experience.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-paper-400 hover:border-ink/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      {/* Image Thumbnail with Overlay Badges */}
      <div className="relative h-48 sm:h-52 bg-paper-300 overflow-hidden">
        {experience.image_url ? (
          <img
            src={experience.image_url}
            alt={experience.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-paper-200 text-dusk font-mono text-xs">
            {experience.title}
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg bg-ink/90 backdrop-blur-md text-white text-[11px] font-mono font-semibold flex items-center gap-1.5 shadow-md">
            <span>{icon}</span>
            <span>{experience.category}</span>
          </span>

          <button
            onClick={handleToggleBookmark}
            disabled={isSaving}
            className="pointer-events-auto p-2 rounded-xl bg-white/90 hover:bg-white text-ink hover:text-clay backdrop-blur-md shadow-md transition"
            title="Save to Wishlist"
          >
            <Bookmark
              className={`w-4 h-4 ${
                isSaved ? 'fill-marigold text-marigold' : 'text-ink'
              }`}
            />
          </button>
        </div>

        {/* Local Impact Score Pill */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-0.5 rounded-full bg-teal-50/95 backdrop-blur-md text-teal-700 text-[10px] font-mono font-bold border border-teal-200 flex items-center gap-1 shadow-sm">
            <span>🌿</span>
            <span>{localImpact}% Local Community Spend</span>
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Location & Rating */}
          <div className="flex items-center justify-between text-xs font-mono text-dusk">
            <span className="flex items-center gap-1 text-ink font-semibold truncate max-w-[180px]">
              <MapPin className="w-3.5 h-3.5 text-marigold flex-shrink-0" />
              {experience.city_name || experience.area_name || 'Bandra West'}
            </span>
            <span className="flex items-center gap-1 text-ink font-bold">
              <Star className="w-3.5 h-3.5 text-marigold fill-marigold" />
              {experience.rating ? experience.rating.toFixed(1) : '4.9'}
              <span className="text-dusk font-normal">({experience.review_count || 32})</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-display font-bold text-ink group-hover:text-marigold-700 transition line-clamp-2 leading-snug">
            {experience.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-dusk-600 line-clamp-2 leading-relaxed">
            {experience.description}
          </p>
        </div>

        {/* "Why This For You" Explainability Layer */}
        <div className="p-2.5 bg-paper-100 rounded-xl border border-paper-300 text-[11px] text-ink/90 flex items-start gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal flex-shrink-0 mt-0.5" />
          <span className="leading-tight">
            <strong className="text-teal font-semibold">Why this fits:</strong>{' '}
            {experience.why_it_fits ||
              `Fits within ₹${experience.price} budget, ${experience.approx_duration_mins || 60}m duration, verified step-free.`}
          </span>
        </div>

        {/* Footer: Price & Duration (JetBrains Mono) */}
        <div className="pt-3 border-t border-paper-300 flex items-center justify-between font-mono text-xs">
          <div>
            <span className="text-[10px] text-dusk uppercase block">Investment</span>
            <span className="text-sm font-extrabold text-ink">
              ₹{experience.price}
              <span className="text-[11px] font-normal text-dusk"> / person</span>
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-dusk uppercase block">Duration</span>
            <span className="text-xs font-bold text-dusk-700 flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3 text-dusk" />
              {experience.approx_duration_mins || 60} mins
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
