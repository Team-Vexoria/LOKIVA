import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Clock, MapPin, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { Experience } from '../../types';
import { ItineraryActivity, TimeOfDaySlot } from '../../types/itinerary';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  onAddActivity: (dayNumber: number, newActivity: ItineraryActivity) => void;
}

export function AddActivityModal({
  isOpen,
  onClose,
  dayNumber,
  onAddActivity,
}: AddActivityModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableList, setAvailableList] = useState<Experience[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeOfDaySlot>('Afternoon');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const list = await api.getExperiences({ limit: 20 });
        setAvailableList(list || []);
      } catch (err) {
        console.error('Failed to load experiences for modal:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = availableList.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      (e.city && e.city.toLowerCase().includes(q)) ||
      (e.category && e.category.toLowerCase().includes(q))
    );
  });

  const handleSelectExperience = (exp: Experience) => {
    const slotTimes: Record<TimeOfDaySlot, string> = {
      Breakfast: '08:30 AM - 09:30 AM',
      Morning: '09:30 AM - 11:30 AM',
      Afternoon: '02:00 PM - 04:30 PM',
      Evening: '05:30 PM - 07:30 PM',
      Dinner: '08:00 PM - 09:30 PM',
    };

    const newAct: ItineraryActivity = {
      id: Date.now(),
      experienceId: exp.id,
      timeSlot: selectedSlot,
      timeRange: slotTimes[selectedSlot] || '02:00 PM - 04:00 PM',
      title: exp.title,
      category: exp.category || 'Culture & Heritage',
      location: exp.area_name || exp.city || 'Heritage District',
      description: exp.description || exp.tagline || 'Curated cultural landmark experience.',
      duration: `${exp.duration_mins || 90} mins`,
      durationMins: exp.duration_mins || 90,
      includes: ['Local guide entry', 'Cultural orientation'],
      costPerPerson: exp.price || 0,
      bookingStatus: 'available',
      gettingThere: `10-min scenic auto-rickshaw to ${exp.area_name || exp.city}`,
      transitTimeMins: 15,
      transitCost: 120,
      whatToBring: ['Walking shoes', 'Camera', 'Modest clothing'],
      notes: '',
      photos: exp.image_url ? [exp.image_url] : exp.image_urls || [],
    };

    onAddActivity(dayNumber, newAct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-paper-400 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-dusk hover:text-ink rounded-full hover:bg-paper-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 shrink-0">
          <span className="text-xs font-mono font-bold text-marigold uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Add to Day {dayNumber}</span>
          </span>
          <h3 className="text-2xl font-display font-bold text-ink">
            Add Cultural Experience
          </h3>
          <p className="text-xs text-dusk-600 font-sans">
            Select a verified micro-experience to slot into your travel schedule.
          </p>
        </div>

        {/* Slot Selection */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
          <span className="text-xs font-mono font-bold text-dusk shrink-0 mr-1">Time Slot:</span>
          {(['Morning', 'Breakfast', 'Afternoon', 'Evening', 'Dinner'] as TimeOfDaySlot[]).map(
            (slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  selectedSlot === slot
                    ? 'bg-ink text-paper shadow-2xs'
                    : 'bg-paper-100 text-dusk hover:text-ink border border-paper-300'
                }`}
              >
                {slot}
              </button>
            )
          )}
        </div>

        {/* Search Field */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-dusk absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search experiences by title, city, or craft..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-paper-50 border border-paper-300 rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-ink transition"
          />
        </div>

        {/* Experiences List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="py-12 text-center text-xs font-mono text-dusk">
              Loading curated experiences...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-dusk">
              No matching experiences found.
            </div>
          ) : (
            filtered.map((exp) => (
              <div
                key={exp.id}
                onClick={() => handleSelectExperience(exp)}
                className="p-3.5 bg-paper-50 hover:bg-paper-100 rounded-2xl border border-paper-300 flex items-center justify-between gap-4 cursor-pointer transition shadow-2xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {exp.image_url ? (
                    <img
                      src={exp.image_url}
                      alt={exp.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-paper-300"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-paper-200 shrink-0 border border-paper-300" />
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-ink block truncate group-hover:text-marigold transition">
                      {exp.title}
                    </span>
                    <span className="text-[11px] font-sans text-dusk block truncate">
                      {exp.area_name ? `${exp.area_name}, ` : ''}{exp.city}
                    </span>
                    <span className="text-[10px] font-mono text-teal block">
                      {exp.category} · {exp.duration_mins || 60} mins
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-ink block">
                    {exp.price ? `₹${exp.price}` : 'Free'}
                  </span>
                  <span className="text-[11px] font-mono text-marigold font-bold flex items-center justify-end gap-1 mt-1">
                    <span>+ Add</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
