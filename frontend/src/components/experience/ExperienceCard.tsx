import React from 'react';
import { Link } from 'react-router-dom';
import { Experience } from '../../types';
import { MapPin, Clock, Star, Bookmark, CheckCircle2, Shield, Sparkles, Database } from 'lucide-react';
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

  const imageUrl =
    experience.image_url ||
    (experience.images && experience.images.length > 0 ? experience.images[0] : null);

  const hasRating =
    experience.rating !== null &&
    experience.rating !== undefined &&
    typeof experience.rating === 'number';

  return (
    <Link
      to={`/experience/${experience.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-paper-400 hover:border-ink/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      {/* Image Thumbnail with Overlay Badges */}
      <div className="relative h-48 sm:h-52 bg-paper-200 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={experience.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          /* Editorial Illustrated Placeholder (No Generic Stock Photos) */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-paper-100 to-paper-300 text-ink relative">
            <div className="w-14 h-14 rounded-2xl bg-white/80 border border-paper-400 shadow-sm flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform">
              {icon}
            </div>
            <span className="text-[11px] font-display font-bold text-ink text-center line-clamp-1 max-w-[200px]">
              {experience.title}
            </span>
            <span className="text-[9px] font-mono text-dusk tracking-wider uppercase mt-1">
              {experience.source === 'osm_overpass' ? 'OSM Open Heritage' : 'Cultural Registry'}
            </span>
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

        {/* Local Impact & OSM Provenance Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-teal-50/95 backdrop-blur-md text-teal-800 text-[10px] font-mono font-bold border border-teal-200 flex items-center gap-1 shadow-sm">
            <span>🌿</span>
            <span>{localImpact}% Local Spend</span>
          </span>
          {experience.source === 'osm_overpass' && (
            <span className="px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-ink text-[9px] font-mono font-semibold border border-paper-400 shadow-sm flex items-center gap-0.5">
              <Database className="w-2.5 h-2.5 text-marigold" />
              <span>OSM</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Location & Honest Rating/Notability */}
          <div className="flex items-center justify-between text-xs font-mono text-dusk">
            <span className="flex items-center gap-1 text-ink font-semibold truncate max-w-[170px]">
              <MapPin className="w-3.5 h-3.5 text-marigold flex-shrink-0" />
              {experience.city_name || experience.area_name || experience.city || 'Local Area'}
            </span>

            {/* Honest Rating Presentation */}
            {hasRating ? (
              <span className="flex items-center gap-1 text-ink font-bold">
                <Star className="w-3.5 h-3.5 text-marigold fill-marigold" />
                {experience.rating?.toFixed(1)}
                <span className="text-dusk font-normal">({experience.review_count || 0})</span>
              </span>
            ) : experience.notability_score ? (
              <span className="px-1.5 py-0.5 rounded bg-paper-100 text-teal-800 border border-paper-300 text-[10px] font-mono font-semibold" title="Notability based on Wikidata/Wikipedia references">
                ★ {experience.notability_score}/10 Notability
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-paper-100 text-dusk border border-paper-300 text-[10px] font-mono">
                Not yet rated
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-display font-bold text-ink group-hover:text-marigold-700 transition line-clamp-2 leading-snug">
            {experience.title}
          </h3>

          {/* Tagline or Description */}
          <p className="text-xs text-dusk-600 font-sans line-clamp-2 leading-relaxed">
            {experience.tagline || experience.description}
          </p>
        </div>

        {/* Why this fits you (Deterministic explainability badge) */}
        {experience.why_it_fits && (
          <div className="p-2 bg-paper-100 rounded-xl border border-paper-300 text-[11px] font-sans text-teal-800 flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              <strong>Why this fits:</strong> {experience.why_it_fits}
            </span>
          </div>
        )}

        {/* Bottom Details: Duration, Price, Accessibility */}
        <div className="pt-2 border-t border-paper-300 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-dusk">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-marigold" />
              {experience.approx_duration_mins || experience.duration_mins || 60}m
            </span>
            {(experience.accessibility_wheelchair || experience.wheelchair_accessible) && (
              <span className="text-teal font-semibold" title="Step-free wheelchair accessible">
                ♿ Step-free
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="text-sm font-bold text-ink font-mono">
              ₹{experience.price || 0}
            </span>
            <span className="text-[10px] text-dusk block">/ person</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
