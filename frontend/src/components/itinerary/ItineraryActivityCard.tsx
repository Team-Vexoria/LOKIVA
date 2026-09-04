import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Car,
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
  ExternalLink,
} from 'lucide-react';
import { ItineraryActivity, BookingStatus } from '../../types/itinerary';

interface ItineraryActivityCardProps {
  activity: ItineraryActivity;
  isFirst: boolean;
  isLast: boolean;
  onUpdateStatus: (newStatus: BookingStatus) => void;
  onUpdateNotes: (notes: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function ItineraryActivityCard({
  activity,
  isFirst,
  isLast,
  onUpdateStatus,
  onUpdateNotes,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ItineraryActivityCardProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState(activity.notes || '');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const handleSaveNotes = () => {
    onUpdateNotes(noteText);
    setIsEditingNotes(false);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
          label: 'Confirmed',
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
          label: 'Waitlist Only',
        };
    }
  };

  const badgeInfo = getStatusBadge(activity.bookingStatus);
  const StatusIcon = badgeInfo.icon;

  const photo = activity.photos && activity.photos.length > 0 ? activity.photos[0] : null;

  return (
    <article className="relative bg-white rounded-2xl border border-paper-300 p-4 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4">
      {/* Top Row: Time, Category & Booking Status with Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-paper-200">
        <div className="flex items-center gap-2 font-mono text-xs text-ink font-bold">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sand-100 rounded-lg text-ink-800 border border-sand-200">
            <Clock className="w-3.5 h-3.5 text-marigold" />
            <span>{activity.timeRange}</span>
          </div>
          <span className="text-dusk-500">·</span>
          <span className="text-dusk-600 font-medium">{activity.duration}</span>
          <span className="text-dusk-500">·</span>
          <span className="text-teal font-semibold">{activity.category}</span>
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${badgeInfo.bg}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{badgeInfo.label}</span>
            <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          {isStatusMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white border border-paper-400 rounded-2xl shadow-xl z-30 py-1 font-mono text-xs">
              {(['confirmed', 'available', 'pending'] as BookingStatus[]).map((st) => {
                const info = getStatusBadge(st);
                const Icon = info.icon;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      onUpdateStatus(st);
                      setIsStatusMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-paper-100 transition cursor-pointer ${
                      activity.bookingStatus === st ? 'font-bold text-ink' : 'text-dusk'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Photo + Details */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {photo && (
          <div className="w-full sm:w-44 h-36 sm:h-auto rounded-xl overflow-hidden bg-paper-200 shrink-0 border border-paper-300">
            <img
              src={photo}
              alt={activity.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}

        <div className="space-y-2 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-display font-bold text-ink">
                {activity.title}
              </h3>
              <div className="flex items-center gap-1 text-xs text-dusk font-mono mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-teal shrink-0" />
                <span>{activity.location}</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-base sm:text-lg font-mono font-bold text-ink block">
                {activity.costPerPerson === 0 ? 'Free Entry' : `₹${activity.costPerPerson.toLocaleString('en-IN')}`}
              </span>
              <span className="text-[10px] font-mono text-dusk">per person</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-dusk-700 font-sans leading-relaxed">
            {activity.description}
          </p>

          {/* Includes checklist */}
          {activity.includes && activity.includes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-mono font-semibold text-dusk">Includes:</span>
              {activity.includes.map((inc, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-paper-100 rounded-md text-[11px] font-mono text-ink-800 border border-paper-200"
                >
                  ✓ {inc}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logistics & Practical Info Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-paper-200 text-xs font-mono">
        {/* Getting There */}
        <div className="p-3 bg-paper-50 rounded-xl border border-paper-200 space-y-1">
          <div className="flex items-center gap-1.5 text-teal font-bold text-[11px] uppercase tracking-wider">
            <Car className="w-3.5 h-3.5" />
            <span>Getting There</span>
          </div>
          <p className="text-ink text-xs font-sans leading-snug">
            {activity.gettingThere}
          </p>
          {activity.transitCost > 0 && (
            <span className="text-[10px] text-dusk block">
              Est. transit fare: ~₹{activity.transitCost}
            </span>
          )}
        </div>

        {/* What to Bring */}
        <div className="p-3 bg-paper-50 rounded-xl border border-paper-200 space-y-1">
          <div className="flex items-center gap-1.5 text-marigold-800 font-bold text-[11px] uppercase tracking-wider">
            <Luggage className="w-3.5 h-3.5 text-marigold" />
            <span>What to Bring / Wear</span>
          </div>
          <p className="text-ink text-xs font-sans leading-snug">
            {activity.whatToBring.join(', ')}
          </p>
        </div>
      </div>

      {/* Personal Notes Section */}
      <div className="pt-2">
        {isEditingNotes ? (
          <div className="space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add personal note (e.g. bring business cards, ask for guide Ramesh, arrive 15m early)..."
              rows={2}
              className="w-full p-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-ink transition"
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditingNotes(false)}
                className="px-3 py-1 rounded-lg text-xs font-mono text-dusk hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-ink text-paper rounded-lg text-xs font-mono font-bold flex items-center gap-1 hover:bg-ink-800 cursor-pointer"
              >
                <Check className="w-3 h-3 text-marigold" />
                <span>Save Note</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 bg-sand-50 rounded-xl border border-sand-200 text-xs font-mono">
            <div className="flex items-center gap-2 text-ink-800">
              <Pencil className="w-3.5 h-3.5 text-sand-500 shrink-0" />
              <span className="font-sans text-dusk-700 italic">
                {activity.notes && activity.notes.trim().length > 0
                  ? activity.notes
                  : 'Add a personal note or reminder...'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingNotes(true)}
              className="text-[11px] font-bold text-teal hover:underline cursor-pointer shrink-0 ml-2"
            >
              {activity.notes ? 'Edit' : '+ Add Note'}
            </button>
          </div>
        )}
      </div>

      {/* Card Action Controls: Reorder & Remove */}
      <div className="flex items-center justify-between pt-1 border-t border-paper-100 text-xs font-mono text-dusk">
        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              type="button"
              onClick={onMoveUp}
              title="Move earlier"
              className="p-1 hover:bg-paper-200 rounded text-dusk hover:text-ink cursor-pointer transition"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}
          {!isLast && (
            <button
              type="button"
              onClick={onMoveDown}
              title="Move later"
              className="p-1 hover:bg-paper-200 rounded text-dusk hover:text-ink cursor-pointer transition"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="text-[11px] font-mono text-rose-700 hover:text-rose-900 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Remove Activity</span>
        </button>
      </div>
    </article>
  );
}
