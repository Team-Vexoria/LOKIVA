import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  MapPin,
  Trash2,
  ArrowUp,
  ArrowDown,
  Pencil,
  Sparkles,
} from 'lucide-react';
import { ItineraryActivity, BookingStatus } from '../../types/itinerary';

interface ItineraryActivityCardProps {
  activity: ItineraryActivity;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isActive?: boolean;
  isHovered?: boolean;
  onUpdateStatus: (newStatus: BookingStatus) => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateDuration?: (newDurationMins: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

export function ItineraryActivityCard({
  activity,
  index,
  isFirst,
  isLast,
  isActive = false,
  isHovered = false,
  onUpdateStatus,
  onUpdateNotes,
  onUpdateDuration,
  onMoveUp,
  onMoveDown,
  onRemove,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: ItineraryActivityCardProps) {
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [durationValue, setDurationValue] = useState(activity.visitDurationMinutes || 60);

  const handleSaveDuration = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateDuration?.(durationValue);
    setIsEditingDuration(false);
  };

  const photo = activity.photos && activity.photos.length > 0 ? activity.photos[0] : null;
  const formattedIndex = String(index + 1).padStart(2, '0');

  return (
    <article
      id={`itinerary-stop-${activity.id}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`relative bg-white/90 backdrop-blur-xl border rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${
        isActive
          ? 'border-[#C85A32] ring-2 ring-[#FFC067]/80 shadow-lg bg-[#FAF8F5]'
          : isHovered
          ? 'border-[#1A1D20]/50 shadow-md bg-white'
          : 'border-[#E2D5BE] hover:border-[#C85A32]/60'
      }`}
    >
      {/* Watermarked Numerals in Top-Right Corner */}
      <div className="absolute top-2 right-4 font-display font-black text-6xl sm:text-7xl text-[#1A1D20]/[0.04] select-none pointer-events-none tracking-tighter">
        {formattedIndex}
      </div>

      <div className="relative z-10 space-y-4">
        {/* Top Control Bar: Category, Time Range, and Reorder Action Buttons */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E8DEC8]">
          <div className="flex items-center gap-2 flex-wrap font-meta text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4ED] text-[#C85A32] font-heading font-extrabold uppercase tracking-wide border border-[#E8DEC8]">
              {activity.category}
            </span>
            <div className="flex items-center gap-1 text-neutral-600 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{activity.timeRange || activity.startTime || 'Flexible'}</span>
            </div>
            <span className="text-neutral-300">·</span>
            <span className="text-neutral-500">{activity.duration || `${activity.visitDurationMinutes || 60} mins`}</span>
          </div>

          {/* Quick Action Reorder & Delete Buttons */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isFirst}
              className="p-1.5 rounded-xl border border-[#E8DEC8] hover:bg-[#FAF7F2] text-[#1A1D20] disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed transition"
              title="Move earlier in schedule"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onMoveDown}
              disabled={isLast}
              className="p-1.5 rounded-xl border border-[#E8DEC8] hover:bg-[#FAF7F2] text-[#1A1D20] disabled:opacity-25 cursor-pointer disabled:cursor-not-allowed transition"
              title="Move later in schedule"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 rounded-xl border border-[#E8DEC8] hover:bg-rose-50 text-neutral-500 hover:text-rose-600 cursor-pointer transition"
              title="Remove stop from itinerary"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Asymmetric Media & Content Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-5 items-start">
          {/* Photo with rounded-2xl and hover perspective */}
          {photo && (
            <div className="sm:col-span-5 h-36 sm:h-44 rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#E8DEC8] relative shrink-0 shadow-inner">
              <img
                src={photo}
                alt={activity.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-meta font-bold">
                {activity.category}
              </div>
            </div>
          )}

          {/* Details Column */}
          <div className={`${photo ? 'sm:col-span-7' : 'sm:col-span-12'} space-y-2`}>
            <div>
              <h4 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 leading-snug tracking-tight">
                {activity.title}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-meta mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                <span className="truncate">{activity.location}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-meta line-clamp-3">
              {activity.description}
            </p>

            {/* Key Inclusions Chips */}
            {activity.includes && activity.includes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {activity.includes.slice(0, 3).map((inc, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg bg-[#FAF7F2] border border-[#E8DEC8] text-[10px] font-meta text-neutral-700"
                  >
                    ✓ {inc}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Hairline Divider: Single 1px Border with Price Tag & Duration Adjust */}
        <div className="pt-3 border-t border-[#E8DEC8] flex flex-wrap items-center justify-between gap-3 text-xs font-meta">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 text-[11px]">Est. Access:</span>
            <span className="font-mono font-bold text-neutral-900">
              {activity.costPerPerson === 0 ? 'Free Open Heritage' : `₹${activity.costPerPerson.toLocaleString('en-IN')} / person`}
            </span>
          </div>

          {/* Quick Duration Stepper / Adjust Button */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {isEditingDuration ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="30"
                  max="240"
                  step="15"
                  value={durationValue}
                  onChange={(e) => setDurationValue(parseInt(e.target.value, 10) || 60)}
                  className="w-16 px-2 py-0.5 border border-[#E8DEC8] rounded-lg text-xs font-mono text-center bg-white"
                />
                <span className="text-[10px] text-neutral-500">mins</span>
                <button
                  type="button"
                  onClick={handleSaveDuration}
                  className="px-2 py-0.5 bg-[#C85A32] text-white rounded-lg text-[10px] font-bold cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingDuration(true)}
                className="text-[11px] text-[#C85A32] hover:text-[#a8362e] flex items-center gap-1 cursor-pointer font-bold transition"
              >
                <Pencil className="w-3 h-3" />
                <span>Adjust ({activity.visitDurationMinutes || 60}m)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default ItineraryActivityCard;
