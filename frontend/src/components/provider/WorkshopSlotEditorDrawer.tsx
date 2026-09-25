import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  DollarSign,
  Users,
  Sparkles,
  Accessibility,
  Languages,
  Package,
  Check,
  Plus,
  Minus,
} from 'lucide-react';
import { useProviderStore } from '../../store/useProviderStore';
import { WorkshopSlot } from '../../types/provider';

interface WorkshopSlotEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editingSlot?: WorkshopSlot | null;
}

const LANGUAGE_OPTIONS = ['Hindi', 'English', 'Marathi', 'Gujarati', 'French'];
const ACCESSIBILITY_OPTIONS = [
  'Step-Free Loom Access',
  'Wheelchair Ramp & Ground Floor',
  'Low Walking Pace',
  'Tactile & Sensory Guided',
  'Family & Child Friendly',
];
const MATERIAL_OPTIONS = [
  'Natural Indigo Dyes',
  'Raw Castor Pigment & Stylus',
  'Living Clay & Potters Wheel',
  'Take-Home Handcrafted Piece',
  'Chai & Heritage Hearth Snack',
];

export function WorkshopSlotEditorDrawer({
  isOpen,
  onClose,
  editingSlot,
}: WorkshopSlotEditorDrawerProps) {
  const listings = useProviderStore((s) => s.listings);
  const addWorkshopSlot = useProviderStore((s) => s.addWorkshopSlot);
  const updateSlotCapacityOrBookings = useProviderStore(
    (s) => s.updateSlotCapacityOrBookings
  );

  const [title, setTitle] = useState(
    editingSlot?.listingTitle ||
      listings[0]?.title ||
      'Master Rogan Fabric Painting & Castor Pigment Masterclass'
  );
  const [dayTime, setDayTime] = useState(
    editingSlot?.timeLabel || 'Tomorrow · 04:00 PM - 05:30 PM'
  );
  const [capacity, setCapacity] = useState<number>(
    editingSlot?.totalCapacity || 8
  );
  const [price, setPrice] = useState<number>(
    editingSlot?.basePricePerPerson || 1200
  );

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    'Hindi',
    'English',
  ]);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>([
    'Step-Free Loom Access',
    'Family & Child Friendly',
  ]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([
    'Natural Indigo Dyes',
    'Take-Home Handcrafted Piece',
  ]);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleAccessibility = (acc: string) => {
    setSelectedAccessibility((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlot) {
      updateSlotCapacityOrBookings(
        editingSlot.slotId,
        editingSlot.bookedSeats,
        capacity,
        price
      );
    } else {
      addWorkshopSlot({
        listingId: 'exp-' + Date.now(),
        listingTitle: title,
        timeLabel: dayTime,
        totalCapacity: capacity,
        bookedSeats: 0,
        basePricePerPerson: price,
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Slide-over Studio Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 max-w-xl w-full bg-[#FAF7F2] border-l border-[#E5DFD5] shadow-2xl z-50 flex flex-col justify-between overflow-y-auto font-sans"
          >
            {/* Header */}
            <div className="p-6 bg-white border-b border-[#E5DFD5] flex items-center justify-between sticky top-0 z-10">
              <div className="space-y-0.5">
                <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                  Workshop Studio Editor
                </span>
                <h3 className="text-xl font-display font-bold text-[#12213B]">
                  {editingSlot ? 'Edit Session & Seat Pricing' : 'Schedule New Craft Session'}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#FAF8F5] text-[#556275] hover:text-[#12213B] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
              {/* 1. Workshop Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block">
                  1. Workshop Listing
                </label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-[#E5DFD5] rounded-xl px-3.5 py-2.5 text-xs text-[#12213B] font-heading font-semibold focus:outline-none focus:border-[#C85A32]"
                >
                  {listings.map((l) => (
                    <option key={l.id} value={l.title}>
                      {l.title}
                    </option>
                  ))}
                  <option value="Custom Heritage Workshop Session">
                    + Custom Heritage Masterclass
                  </option>
                </select>
              </div>

              {/* 2. Time Slot & Batch */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block">
                  2. Session Date & Time Window
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Today · 05:00 PM - 06:30 PM',
                    'Tomorrow · 10:30 AM - 12:00 PM',
                    'Tomorrow · 02:00 PM - 03:30 PM',
                    'Tomorrow · 04:00 PM - 05:30 PM',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDayTime(preset)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-mono transition ${
                        dayTime === preset
                          ? 'bg-[#FAF4ED] border-[#C85A32] text-[#C85A32] font-bold shadow-2xs'
                          : 'bg-white text-[#12213B] border-[#E5DFD5] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Tactile Seat Capacity & Price Scrubbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Capacity Scrubber */}
                <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] space-y-2">
                  <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block">
                    Seat Capacity Cap
                  </label>
                  <div className="flex items-center justify-between bg-[#FAF8F5] p-1.5 rounded-xl border border-[#E5DFD5]">
                    <button
                      type="button"
                      onClick={() => setCapacity(Math.max(2, capacity - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-[#E5DFD5] text-[#12213B] flex items-center justify-center font-bold hover:bg-[#FAF4ED]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-sm font-mono font-extrabold text-[#12213B]">
                      {capacity} Guests Max
                    </div>
                    <button
                      type="button"
                      onClick={() => setCapacity(Math.min(20, capacity + 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-[#E5DFD5] text-[#12213B] flex items-center justify-center font-bold hover:bg-[#FAF4ED]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Base Price Scrubber */}
                <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] space-y-2">
                  <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block">
                    Base Price per Seat
                  </label>
                  <div className="flex items-center justify-between bg-[#FAF8F5] p-1.5 rounded-xl border border-[#E5DFD5]">
                    <button
                      type="button"
                      onClick={() => setPrice(Math.max(200, price - 100))}
                      className="w-8 h-8 rounded-lg bg-white border border-[#E5DFD5] text-[#12213B] flex items-center justify-center font-bold hover:bg-[#FAF4ED]"
                    >
                      -100
                    </button>
                    <div className="text-sm font-mono font-extrabold text-[#065F46]">
                      ₹{price} / seat
                    </div>
                    <button
                      type="button"
                      onClick={() => setPrice(Math.min(5000, price + 100))}
                      className="w-8 h-8 rounded-lg bg-white border border-[#E5DFD5] text-[#12213B] flex items-center justify-center font-bold hover:bg-[#FAF4ED]"
                    >
                      +100
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Languages Offered */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Spoken Languages</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGE_OPTIONS.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1 rounded-xl text-xs font-heading transition border ${
                          isSelected
                            ? 'bg-[#12213B] text-white border-[#12213B] font-bold shadow-2xs'
                            : 'bg-white text-[#12213B] border-[#E5DFD5] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Accessibility Compliance Tags */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block flex items-center gap-1.5">
                  <Accessibility className="w-3.5 h-3.5 text-[#065F46]" />
                  <span>Accessibility & Cultural Pacing</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ACCESSIBILITY_OPTIONS.map((acc) => {
                    const isSelected = selectedAccessibility.includes(acc);
                    return (
                      <button
                        key={acc}
                        type="button"
                        onClick={() => toggleAccessibility(acc)}
                        className={`px-3 py-1 rounded-xl text-xs font-heading transition border flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0] font-bold shadow-2xs'
                            : 'bg-white text-[#12213B] border-[#E5DFD5] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-[#065F46]" />}
                        <span>{acc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Materials Included */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#D99B43]" />
                  <span>Materials & Artifacts Provided</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {MATERIAL_OPTIONS.map((mat) => {
                    const isSelected = selectedMaterials.includes(mat);
                    return (
                      <button
                        key={mat}
                        type="button"
                        onClick={() => toggleMaterial(mat)}
                        className={`px-3 py-1 rounded-xl text-xs font-heading transition border flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#FAF4ED] text-[#C85A32] border-[#E8DEC8] font-bold shadow-2xs'
                            : 'bg-white text-[#12213B] border-[#E5DFD5] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-[#C85A32]" />}
                        <span>{mat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="p-6 bg-white border-t border-[#E5DFD5] flex items-center justify-between gap-3 sticky bottom-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#556275] border border-[#E5DFD5] rounded-xl text-xs font-heading font-bold transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-[#C85A32] hover:bg-[#B34322] text-white font-heading font-bold rounded-xl text-xs transition shadow-2xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Save & Publish Live Slot</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default WorkshopSlotEditorDrawer;
