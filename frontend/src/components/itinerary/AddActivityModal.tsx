import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Clock, MapPin, Footprints, Car, Check, Sparkles } from 'lucide-react';
import { Experience } from '../../types';
import { ItineraryActivity, TimeOfDaySlot } from '../../types/itinerary';
import { USER_CURATED_PLACES } from '../../data/userVerifiedPlacesData';
import { ALL_LOKIVA_PLACES } from '../../data/places';
import { getHaversineDistanceKm } from '../../lib/itinerarySolver';
import { resolveImageUrl } from '../../lib/api';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  insertAfterIndex?: number;
  precedingStop?: ItineraryActivity | null;
  dayCity?: string;
  onAddActivity: (dayNumber: number, newActivity: ItineraryActivity, afterIndex?: number) => void;
}

export function AddActivityModal({
  isOpen,
  onClose,
  dayNumber,
  insertAfterIndex,
  precedingStop,
  dayCity = '',
  onAddActivity,
}: AddActivityModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeOfDaySlot>('Afternoon');

  // Candidate pool from the 5,000+ national places
  const allCandidates = useMemo(() => {
    const pool = USER_CURATED_PLACES.length > 0 ? USER_CURATED_PLACES : ALL_LOKIVA_PLACES;

    // Filter by city first if city is known
    let filtered = pool;
    if (dayCity && dayCity.trim()) {
      const c = dayCity.toLowerCase().trim();
      const cityMatches = pool.filter((p) => (p.city || '').toLowerCase().includes(c));
      if (cityMatches.length > 0) {
        filtered = cityMatches;
      }
    }

    // Compute proximity relative to preceding stop if available
    return filtered.map((place) => {
      let distKm = 2.5;
      if (precedingStop?.lat && precedingStop?.lng && place.latitude && place.longitude) {
        distKm = getHaversineDistanceKm(
          precedingStop.lat,
          precedingStop.lng,
          place.latitude,
          place.longitude
        );
      }
      return {
        ...place,
        distanceFromPreceding: distKm,
      };
    });
  }, [dayCity, precedingStop]);

  // Filter and sort candidates by distance from preceding stop
  const sortedAndFiltered = useMemo(() => {
    let list = [...allCandidates];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.city && p.city.toLowerCase().includes(q)) ||
          (p.area_name && p.area_name.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (selectedCategory) {
      const cat = selectedCategory.toLowerCase();
      list = list.filter((p) => (p.category || '').toLowerCase().includes(cat));
    }

    // Sort by proximity to preceding stop
    list.sort((a, b) => a.distanceFromPreceding - b.distanceFromPreceding);

    return list.slice(0, 40);
  }, [allCandidates, searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleSelectExperience = (exp: (typeof sortedAndFiltered)[0]) => {
    const durationMins = exp.duration_mins || exp.approx_duration_mins || 75;
    const isIndoor =
      (exp.category || '').toLowerCase().includes('craft') ||
      (exp.category || '').toLowerCase().includes('art') ||
      (exp.category || '').toLowerCase().includes('food') ||
      (exp.category || '').toLowerCase().includes('museum');

    const newAct: ItineraryActivity = {
      id: Date.now(),
      experienceId: exp.id,
      timeSlot: selectedSlot,
      timeRange: '02:00 PM - 03:30 PM',
      startTime: '02:00 PM',
      endTime: '03:30 PM',
      title: exp.title,
      category: exp.category || 'Living Heritage',
      location: exp.area_name || `${exp.city}, ${exp.state || ''}`,
      city: exp.city,
      state: exp.state,
      description: exp.description || exp.tagline || 'Curated cultural landmark experience.',
      duration: `${durationMins} mins`,
      durationMins,
      visitDurationMinutes: durationMins,
      transitToNextMinutes: 15,
      transitMode: exp.distanceFromPreceding <= 1.2 ? 'walking' : 'auto_rickshaw',
      transitDistanceKm: exp.distanceFromPreceding,
      includes: exp.tags || ['Local guide entry', 'Cultural orientation'],
      costPerPerson: exp.price || 0,
      bookingStatus: 'available',
      gettingThere:
        exp.distanceFromPreceding <= 1.2
          ? `Short ${Math.round(exp.distanceFromPreceding * 1000)}m walk`
          : `Scenic auto-rickshaw across ${exp.distanceFromPreceding} km`,
      transitCost: exp.distanceFromPreceding <= 1.2 ? 0 : Math.round(30 + exp.distanceFromPreceding * 15),
      whatToBring: ['Walking shoes', 'Camera', 'Refillable water'],
      photos: exp.image_urls && exp.image_urls.length > 0 ? exp.image_urls : [resolveImageUrl(exp.image_url)],
      wheelchair_accessible: exp.wheelchair_accessible,
      is_indoor: isIndoor,
      indoorOutdoor: isIndoor ? 'indoor' : 'outdoor',
      walkingDistanceMeters: exp.distanceFromPreceding <= 1.2 ? Math.round(exp.distanceFromPreceding * 1000) : 350,
      crowdLevel: (exp.review_count && exp.review_count > 500) ? 'peak' : 'moderate',
      coordinates: [exp.latitude || 26.9124, exp.longitude || 75.7873],
      lat: exp.latitude,
      lng: exp.longitude,
    };

    onAddActivity(dayNumber, newAct, insertAfterIndex);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-dusk hover:text-ink rounded-full hover:bg-white border border-transparent hover:border-[#E5DFD5] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 shrink-0">
          <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Proximity Discovery · Day {dayNumber}</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-ink">
            Add Cultural Stop
          </h3>
          {precedingStop && (
            <p className="text-xs font-mono text-dusk">
              📍 Sorted by shortest distance from: <strong>{precedingStop.title}</strong>
            </p>
          )}
        </div>

        {/* Search Input & Category Filters */}
        <div className="space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-dusk absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search temple, weaving guild, street food, palace..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E5DFD5] focus:border-ink rounded-xl text-xs sm:text-sm text-ink placeholder-dusk-400 focus:outline-none transition shadow-2xs font-sans"
            />
          </div>

          {/* Quick Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['', 'Food & Culinary', 'Art & Craft', 'Local Walks', 'Nature & Wildlife', 'Heritage & History'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-ink text-white font-semibold'
                    : 'bg-white text-ink border border-[#E5DFD5] hover:bg-[#FAF8F5]'
                }`}
              >
                {cat || 'All Categories'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Places List sorted by distance */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {sortedAndFiltered.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-dusk space-y-1">
              <p>No matching places found.</p>
              <p className="text-[11px] text-dusk-400">Try a different search keyword or category.</p>
            </div>
          ) : (
            sortedAndFiltered.map((place) => (
              <div
                key={place.id}
                onClick={() => handleSelectExperience(place)}
                className="p-3 sm:p-4 bg-white hover:bg-[#FAF8F5] border border-[#E5DFD5] hover:border-[#C1443B] rounded-xl flex items-center justify-between gap-4 transition group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-[#FAF7F2] shrink-0 border border-[#E5DFD5]">
                    <img
                      src={resolveImageUrl(place.image_url)}
                      alt={place.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#C1443B]">
                        {place.category || 'Culture'}
                      </span>
                      {place.distanceFromPreceding !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[10px] font-mono text-emerald-800 border border-emerald-200">
                          {place.distanceFromPreceding <= 1.2
                            ? `${Math.round(place.distanceFromPreceding * 1000)}m walk`
                            : `${place.distanceFromPreceding} km auto`}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-heading font-bold text-ink truncate group-hover:text-[#C1443B] transition-colors">
                      {place.title}
                    </h4>

                    <p className="text-[11px] font-sans text-dusk truncate">
                      {place.area_name || place.city}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <span className="text-xs font-mono font-bold text-ink block">
                    {place.price === 0 ? 'Free' : `₹${place.price}`}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1 bg-[#C1443B] text-white rounded-lg text-xs font-heading font-bold tracking-wide uppercase transition shadow-2xs group-hover:bg-[#a8362e]"
                  >
                    + Add Stop
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
