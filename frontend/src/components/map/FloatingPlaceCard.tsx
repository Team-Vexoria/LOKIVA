import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Star, Clock, IndianRupee, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Experience } from '../../types';

interface FloatingPlaceCardProps {
  place: Experience;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  stateName?: string;
  districtName?: string;
}

export function FloatingPlaceCard({
  place,
  isOpen,
  onClose,
  position,
  stateName,
  districtName
}: FloatingPlaceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Auto-close on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const cardVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 10,
      rotateX: -10
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 10,
      transition: {
        duration: 0.2
      }
    }
  };

  // Category badge colors
  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      'heritage': { bg: 'bg-clay/10', text: 'text-clay' },
      'culture': { bg: 'bg-clay/10', text: 'text-clay' },
      'spiritual': { bg: 'bg-teal/10', text: 'text-teal' },
      'nature': { bg: 'bg-green-100', text: 'text-green-700' },
      'food': { bg: 'bg-orange-100', text: 'text-orange-700' },
      'workshop': { bg: 'bg-purple-100', text: 'text-purple-700' },
      'adventure': { bg: 'bg-red-100', text: 'text-red-700' },
      'shopping': { bg: 'bg-blue-100', text: 'text-blue-700' },
      'nightlife': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
      'hidden_gem': { bg: 'bg-marigold/10', text: 'text-marigold' },
    };
    return colors[category.toLowerCase()] || { bg: 'bg-paper-200', text: 'text-dusk' };
  };

  const categoryColors = getCategoryColor(place.category);

  // Get first image from images array
  const imageUrl = place.images && place.images.length > 0 ? place.images[0] : 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={cardRef}
            className="relative bg-white rounded-3xl border border-paper-400 shadow-2xl overflow-hidden max-w-lg w-full"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full text-dusk hover:text-ink transition-colors shadow-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={imageUrl}
                alt={place.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />

              {/* Hidden Gem Badge */}
              {place.is_hidden_gem && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-marigold text-white rounded-full text-xs font-mono font-bold shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hidden Gem</span>
                </div>
              )}

              {/* Location Badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-ink rounded-full text-xs font-mono font-bold shadow-lg">
                <MapPin className="w-3.5 h-3.5 text-teal" />
                <span>{place.city}, {place.state}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Category Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${categoryColors.bg} ${categoryColors.text} capitalize`}>
                  {place.category}
                </span>
                {place.rating && (
                  <div className="flex items-center gap-1 text-xs font-mono text-dusk">
                    <Star className="w-3.5 h-3.5 fill-marigold text-marigold" />
                    <span className="font-bold text-ink">{place.rating}</span>
                    {place.review_count && (
                      <span className="text-dusk-600">({place.review_count})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-display font-bold text-ink leading-tight">
                {place.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-dusk-600 leading-relaxed">
                {place.description}
              </p>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-paper-300">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-teal" />
                  <div>
                    <p className="text-xs text-dusk-600">Entry Fee</p>
                    <p className="text-sm font-mono font-bold text-ink">
                      {place.price === 0 ? 'Free' : `₹${place.price}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-marigold" />
                  <div>
                    <p className="text-xs text-dusk-600">Duration</p>
                    <p className="text-sm font-mono font-bold text-ink">
                      {place.duration_mins} min
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {place.tags && place.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {place.tags.slice(0, 5).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-paper-100 text-dusk text-xs font-mono rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <Link
                to={`/experience/${place.id}`}
                className="block w-full py-3 px-4 bg-ink hover:bg-teal text-white rounded-xl text-sm font-mono font-bold transition-colors shadow-sm text-center flex items-center justify-center gap-2"
              >
                <span>View Full Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Tooltip component for hover preview
interface PlacePreviewTooltipProps {
  place: Experience;
  position: { x: number; y: number };
}

export function PlacePreviewTooltip({ place, position }: PlacePreviewTooltipProps) {
  return (
    <motion.div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y + 10
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl border border-paper-400 shadow-xl p-3 max-w-xs">
        <h4 className="text-sm font-display font-bold text-ink mb-1">{place.title}</h4>
        <p className="text-xs text-dusk-600 mb-2 line-clamp-2">{place.description}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-teal">
            {place.price === 0 ? 'Free Entry' : `₹${place.price}`}
          </span>
          <span className="text-dusk-600">{place.duration_mins} min</span>
        </div>
      </div>
    </motion.div>
  );
}
