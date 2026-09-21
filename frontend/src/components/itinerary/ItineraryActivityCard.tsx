import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Car,
  Footprints,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  ChevronDown,
  Trash2,
  ArrowUp,
  ArrowDown,
  Pencil,
  Check,
  Luggage,
  Sparkles,
  ShieldCheck,
  ExternalLink,
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
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState(activity.notes || '');
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [durationValue, setDurationValue] = useState(activity.visitDurationMinutes || 60);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const handleSaveNotes = () => {
    onUpdateNotes(noteText);
    setIsEditingNotes(false);
  };

  const handleSaveDuration = () => {
    onUpdateDuration?.(durationValue);
    setIsEditingDuration(false);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
          label: 'Confirmed Slot',
        };
      case 'available':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          icon: Bookmark,
          label: 'Available to Book',
        };
      case 'pending':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          icon: Clock,
          label: 'Pending Reservation',
        };
      case 'unavailable':
      default:
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          icon: AlertCircle,
          label: 'Walk-in Only',
        };
    }
  };

  const badgeInfo = getStatusBadge(activity.bookingStatus);
  const StatusIcon = badgeInfo.icon;
  const photo = activity.photos && activity.photos.length > 0 ? activity.photos[0] : null;

  return (
    <article
      id={`itinerary-stop-${activity.id}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`relative bg-white rounded-2xl border transition-all duration-300 p-4 sm:p-5 space-y-4 cursor-pointer ${
        isActive
          ? 'border-[#C1443B] ring-2 ring-[#FFC067] shadow-lg bg-[#FAF8F5]'
          : isHovered
          ? 'border-ink/50 shadow-md bg-white'
          : 'border-[#E5DFD5] shadow-2xs hover:border-[#12213B]/30'
      }`}
    >
      {/* Top Row: Stop Number, Time Range, Category & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5DFD5]">
        <div className="flex items-center gap-2 font-mono text-xs text-ink font-bold">
          {/* Stop Number Badge */}
          <span className="w-6 h-6 rounded-full bg-[#12213B] text-[#FFC067] text-[11px] font-mono font-bold flex items-center justify-center shrink-0 shadow-2xs">
            {index + 1}
          </span>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF7F2] rounded-lg text-ink border border-[#E5DFD5]">
            <Clock className="w-3.5 h-3.5 text-[#C1443B]" />
            <span>{activity.timeRange}</span>
          </div>

          <span className="text-dusk font-normal">·</span>
          <span className="text-dusk font-medium">{activity.duration}</span>
          <span className="text-dusk font-normal">·</span>
          <span className="text-[#C1443B] font-semibold">{activity.category}</span>
        </div>

        {/* Up / Down / Delete Quick Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={isFirst}
            className="p-1 rounded-lg border border-[#E5DFD5] hover:bg-[#FAF7F2] text-ink disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition"
            title="Move Earlier in Schedule"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={isLast}
            className="p-1 rounded-lg border border-[#E5DFD5] hover:bg-[#FAF7F2] text-ink disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition"
            title="Move Later in Schedule"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 rounded-lg border border-[#E5DFD5] hover:bg-rose-50 text-dusk hover:text-rose-600 cursor-pointer transition"
            title="Remove from Itinerary"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* Photo Thumbnail */}
        {photo && (
          <div className="sm:col-span-4 h-32 sm:h-36 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#E5DFD5] shrink-0">
            <img
              src={photo}
              alt={activity.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        {/* Details Column */}
        <div className={`${photo ? 'sm:col-span-8' : 'sm:col-span-12'} space-y-2.5`}>
          <div>
            <h4 className="text-base sm:text-lg font-heading font-bold text-ink leading-snug">
              {activity.title}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-dusk font-sans mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#C1443B] shrink-0" />
              <span className="truncate">{activity.location}</span>
            </div>
          </div>

          <p className="text-xs text-dusk leading-relaxed font-sans line-clamp-2">
            {activity.description}
          </p>

          {/* Key Inclusions Chips */}
          {activity.includes && activity.includes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {activity.includes.slice(0, 3).map((inc, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E5DFD5] text-[10px] font-mono text-ink"
                >
                  ✓ {inc}
                </span>
              ))}
            </div>
          )}

          {/* Pricing & Duration Adjust */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono border-t border-[#E5DFD5]">
            <div className="flex items-center gap-2">
              <span className="text-dusk text-[11px]">Est. Access:</span>
              <span className="font-bold text-ink">
                {activity.costPerPerson === 0 ? 'Free Open Heritage' : `₹${activity.costPerPerson} / person`}
              </span>
            </div>

            {/* Quick Duration Adjust */}
            <div className="flex items-center gap-1">
              {isEditingDuration ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="number"
                    min="30"
                    max="240"
                    step="15"
                    value={durationValue}
                    onChange={(e) => setDurationValue(parseInt(e.target.value, 10) || 60)}
                    className="w-16 px-1.5 py-0.5 border border-ink rounded text-xs font-mono text-center"
                  />
                  <span className="text-[10px] text-dusk">mins</span>
                  <button
                    onClick={handleSaveDuration}
                    className="px-2 py-0.5 bg-ink text-white rounded text-[10px] font-bold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingDuration(true);
                  }}
                  className="text-[11px] text-[#C1443B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Adjust ({activity.visitDurationMinutes || 60}m)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transit Connector to Next Activity */}
      {!isLast && (
        <div className="mt-3 pt-3 border-t border-dashed border-[#E5DFD5] flex items-center justify-between gap-2 text-[11px] font-mono text-dusk bg-[#FAF7F2] p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            {activity.transitMode === 'walking' ? (
              <Footprints className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <Car className="w-3.5 h-3.5 text-[#C1443B] shrink-0" />
            )}
            <span>{activity.gettingThere}</span>
          </div>
          {activity.transitCost > 0 && (
            <span className="font-bold text-ink shrink-0">~₹{activity.transitCost}</span>
          )}
        </div>
      )}
    </article>
  );
}
