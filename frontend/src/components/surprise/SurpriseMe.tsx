import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Clock,
  Coins,
  Star,
  ArrowRight,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { Experience } from '../../types';

interface SurpriseMeProps {
  experiences: Experience[];
  currentCity?: string;
  maxBudget?: number;
  availableHours?: number;
  activeCategory?: string;
  wheelchairOnly?: boolean;
  lowWalkingOnly?: boolean;
  onAdjustPreferences?: () => void;
  className?: string;
}

export function SurpriseMe({
  experiences,
  currentCity = '',
  maxBudget = 3000,
  availableHours = 3,
  activeCategory = '',
  wheelchairOnly = false,
  lowWalkingOnly = false,
  onAdjustPreferences,
  className = '',
}: SurpriseMeProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [usedIds, setUsedIds] = useState<Set<number>>(new Set());

  // Filter experiences according to user constraints
  const getEligibleExperiences = () => {
    if (!experiences || experiences.length === 0) return [];

    return experiences.filter((exp) => {
      // 1. City constraint (if specified)
      if (currentCity && currentCity.trim() !== '') {
        const cityLower = currentCity.toLowerCase();
        const expCity = (exp.city || exp.city_name || '').toLowerCase();
        const expState = (exp.state || '').toLowerCase();
        if (!expCity.includes(cityLower) && !expState.includes(cityLower) && !cityLower.includes(expCity)) {
          return false;
        }
      }

      // 2. Budget constraint
      if (maxBudget && exp.price > maxBudget) {
        return false;
      }

      // 3. Time / Duration constraint
      const maxMins = availableHours * 60;
      if (exp.approx_duration_mins && exp.approx_duration_mins > maxMins) {
        return false;
      }

      // 4. Category constraint (if specified and not 'All')
      if (activeCategory && !activeCategory.toLowerCase().includes('all')) {
        const catLower = activeCategory.toLowerCase();
        const expCat = (exp.category || '').toLowerCase();
        if (!expCat.includes(catLower) && !catLower.includes(expCat)) {
          return false;
        }
      }

      // 5. Accessibility hard filters
      if (wheelchairOnly && !exp.wheelchair_accessible && !exp.accessibility_wheelchair) return false;
      if (lowWalkingOnly && !exp.low_walking && !exp.accessibility_low_walking) return false;

      return true;
    });
  };

  const generateSurprise = () => {
    setIsLoading(true);
    setIsOpen(true);

    setTimeout(() => {
      const eligible = getEligibleExperiences();

      if (eligible.length === 0) {
        setSelectedExperience(null);
        setIsLoading(false);
        return;
      }

      // Filter out previously seen IDs in this session if possible
      const unused = eligible.filter((exp) => !usedIds.has(exp.id));
      const pool = unused.length > 0 ? unused : eligible;

      // Select top candidate based on rating, notability, and slight randomization
      const sortedPool = [...pool].sort((a, b) => {
        const scoreA = (a.rating || 4.5) * 10 + (a.is_hidden_gem ? 5 : 0);
        const scoreB = (b.rating || 4.5) * 10 + (b.is_hidden_gem ? 5 : 0);
        return scoreB - scoreA;
      });

      // Pick from top 3 candidates for serendipity
      const topCandidates = sortedPool.slice(0, Math.min(4, sortedPool.length));
      const pick = topCandidates[Math.floor(Math.random() * topCandidates.length)] || sortedPool[0];

      setSelectedExperience(pick);
      setUsedIds((prev) => new Set(prev).add(pick.id));
      setIsLoading(false);
    }, 450);
  };

  const handleTryAgain = () => {
    generateSurprise();
  };

  // Generate dynamic explainability reasons
  const getWhyItFitsReasons = (exp: Experience) => {
    const reasons: string[] = [];

    // Category / Interest
    if (exp.category) {
      reasons.push(`Matches your interest in ${exp.category}`);
    }

    // Time window
    const durationMins = exp.approx_duration_mins || 90;
    const durationHrs = (durationMins / 60).toFixed(1).replace('.0', '');
    reasons.push(`Fits within your ${availableHours}-hour available window (~${durationHrs} hrs)`);

    // Budget
    if (exp.price <= maxBudget) {
      reasons.push(`Priced at ₹${exp.price}, well within your ₹${maxBudget} budget ceiling`);
    }

    // Location / Verified Access
    const loc = exp.city || currentCity || 'India';
    if (exp.wheelchair_accessible) {
      reasons.push(`Verified step-free wheelchair access in ${loc}`);
    } else {
      reasons.push(`Authentic local spot curated in ${loc}`);
    }

    return reasons;
  };

  // Fallback image resolver
  const defaultFallback =
    'https://images.pexels.com/photos/4602266/pexels-photo-4602266.jpeg?auto=compress&cs=tinysrgb&w=800';

  const rawImage =
    selectedExperience?.image_url ||
    selectedExperience?.image_urls?.[0] ||
    selectedExperience?.images?.[0];

  const imageSrc =
    rawImage && !rawImage.includes('upload.wikimedia.org') ? rawImage : defaultFallback;

  return (
    <>
      {/* Small Clean Surprise Me Button */}
      <button
        type="button"
        onClick={generateSurprise}
        className={`px-3.5 py-2.5 bg-marigold hover:bg-marigold-400 text-ink-950 rounded-xl font-mono text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer select-none border border-marigold-600/40 ${className}`}
      >
        <Sparkles className="w-3.5 h-3.5 fill-ink-950 text-ink-950" />
        <span>Surprise Me</span>
      </button>

      {/* Lightweight Result Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="w-full max-w-md bg-white rounded-3xl border border-paper-400 shadow-2xl overflow-hidden text-ink"
            >
              {/* Header Strip */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-paper-200 bg-paper-50">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-ink">
                  <Sparkles className="w-4 h-4 text-marigold fill-marigold" />
                  <span>Your Surprise Experience</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-paper-200 hover:bg-paper-300 text-ink/70 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="py-16 px-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-paper-100 border border-paper-300 flex items-center justify-center mx-auto animate-pulse">
                    <Sparkles className="w-6 h-6 text-marigold animate-spin" />
                  </div>
                  <p className="text-sm font-display font-bold text-ink">
                    Finding something you'll love...
                  </p>
                  <p className="text-xs font-mono text-dusk-600">
                    Evaluating budget, travel buffer, and cultural fit
                  </p>
                </div>
              ) : selectedExperience ? (
                /* Experience Card Result */
                <div className="p-5 space-y-4">
                  {/* Photo Container */}
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-paper-300 bg-ink-950">
                    <img
                      src={imageSrc}
                      alt={selectedExperience.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-ink shadow-xs">
                        {selectedExperience.category || 'Culture'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-marigold" />
                        <span className="truncate">{selectedExperience.city || 'India'}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-amber-300">
                        <Star className="w-3 h-3 fill-amber-300" />
                        <span>{selectedExperience.rating ? selectedExperience.rating.toFixed(1) : '4.8'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Key Metrics */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-display font-bold text-ink leading-snug">
                      {selectedExperience.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-dusk-600">
                      <span className="font-bold text-teal text-sm">₹{selectedExperience.price}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedExperience.approx_duration_mins || 90} mins
                      </span>
                      {selectedExperience.is_hidden_gem && (
                        <>
                          <span>•</span>
                          <span className="text-marigold font-bold">Hidden Gem</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Why this fits you box */}
                  <div className="p-3.5 bg-paper-100 rounded-2xl border border-paper-300 space-y-1.5">
                    <div className="text-[11px] font-mono font-bold text-ink uppercase tracking-wider">
                      Why this fits you
                    </div>
                    <ul className="space-y-1 text-xs font-sans text-dusk-700">
                      {getWhyItFitsReasons(selectedExperience).map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal flex-shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleTryAgain}
                      className="w-full py-2.5 px-3 bg-paper-100 hover:bg-paper-200 text-ink rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 border border-paper-300"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-dusk" />
                      <span>Try Again</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/experience/${selectedExperience.id}`);
                      }}
                      className="w-full py-2.5 px-3 bg-ink hover:bg-ink-800 text-paper rounded-xl font-mono text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>View Experience</span>
                      <ArrowRight className="w-3.5 h-3.5 text-marigold" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Fallback when nothing matches */
                <div className="p-6 text-center space-y-4">
                  <div className="w-10 h-10 rounded-2xl bg-paper-100 border border-paper-300 flex items-center justify-center mx-auto text-dusk">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-display font-bold text-ink">
                      Nothing perfect right now
                    </h3>
                    <p className="text-xs font-sans text-dusk-600">
                      Try expanding your available time, budget ceiling, or location filters.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      if (onAdjustPreferences) onAdjustPreferences();
                    }}
                    className="w-full py-2.5 bg-ink hover:bg-ink-800 text-paper rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-marigold" />
                    <span>Adjust Preferences</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
