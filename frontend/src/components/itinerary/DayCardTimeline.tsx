import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Car,
  Plus,
  Trash2,
  Pencil,
  Building2,
  Coins,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MapPin,
  RotateCcw,
} from 'lucide-react';
import { ItineraryDay, BookingStatus } from '../../types/itinerary';
import { ItineraryActivityCard } from './ItineraryActivityCard';

interface DayCardTimelineProps {
  day: ItineraryDay;
  totalDays: number;
  activeStopId?: number | null;
  hoveredStopId?: number | null;
  onUpdateActivityStatus: (dayNumber: number, activityId: number, status: BookingStatus) => void;
  onUpdateActivityNotes: (dayNumber: number, activityId: number, notes: string) => void;
  onUpdateActivityDuration?: (dayNumber: number, activityId: number, durationMins: number) => void;
  onMoveActivity: (dayNumber: number, fromIndex: number, toIndex: number) => void;
  onRemoveActivity: (dayNumber: number, activityId: number) => void;
  onAddActivityClick: (dayNumber: number, afterIndex?: number) => void;
  onSetStartTime?: (dayNumber: number, startTime: string) => void;
  onStopHover?: (stopId: number | null) => void;
  onStopSelect?: (stopId: number) => void;
}

export function DayCardTimeline({
  day,
  totalDays,
  activeStopId,
  hoveredStopId,
  onUpdateActivityStatus,
  onUpdateActivityNotes,
  onUpdateActivityDuration,
  onMoveActivity,
  onRemoveActivity,
  onAddActivityClick,
  onSetStartTime,
  onStopHover,
  onStopSelect,
}: DayCardTimelineProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditingStart, setIsEditingStart] = useState(false);
  const [startTimeInput, setStartTimeInput] = useState(day.dayStartTime || '08:30');

  const dayTotalCost = day.activities.reduce((sum, act) => sum + act.costPerPerson, 0);
  const totalDurationMins = day.activities.reduce(
    (sum, act) => sum + act.visitDurationMinutes + act.transitToNextMinutes,
    0
  );
  const durationHours = (totalDurationMins / 60).toFixed(1);

  const handleSaveStartTime = () => {
    onSetStartTime?.(day.dayNumber, startTimeInput);
    setIsEditingStart(false);
  };

  return (
    <section className="bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] overflow-hidden shadow-sm transition-all hover:shadow-md">
      {/* Day Top Bar */}
      <div className="p-5 sm:p-6 bg-white border-b border-[#E5DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 font-meta text-xs font-medium tracking-wide text-neutral-600">
            <span className="px-2.5 py-0.5 bg-[#FAF7F2] text-[#C1443B] font-extrabold border border-[#E5DFD5] rounded-md tracking-wider">
              DAY {day.dayNumber}
            </span>
            <span>·</span>
            <span className="text-neutral-800 font-semibold">{day.date}</span>
            <span>|</span>
            <span className="text-neutral-800 font-semibold">{day.dayOfWeek}</span>

            {/* Start Time Config */}
            <span className="text-neutral-500 font-normal">· Starts at:</span>
            {isEditingStart ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="time"
                  value={startTimeInput}
                  onChange={(e) => setStartTimeInput(e.target.value)}
                  className="px-1.5 py-0.5 border border-ink rounded text-xs font-meta"
                />
                <button
                  onClick={handleSaveStartTime}
                  className="px-2 py-0.5 bg-[#C85A32] text-white rounded text-[10px] font-bold cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingStart(true)}
                className="text-[#C1443B] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                title="Adjust Day Start Time"
              >
                <span>{day.dayStartTime || '08:30 AM'}</span>
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-ink tracking-tight">
            {day.title}
          </h2>
        </div>

        <div className="flex items-center gap-4 justify-between sm:justify-end">
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-mono uppercase tracking-wider text-dusk block">
              Day Total Access
            </span>
            <span className="text-xl sm:text-2xl font-display font-bold text-[#12213B]">
              ₹{dayTotalCost.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#E5DFD5] border border-[#E5DFD5] text-ink transition cursor-pointer"
            title={isCollapsed ? 'Expand Day' : 'Collapse Day'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Day Hero Image */}
          {day.heroImage && (
            <div className="relative rounded-2xl overflow-hidden h-48 sm:h-64 w-full bg-[#FAF7F2] border border-[#E5DFD5] shadow-inner group">
              <img
                src={day.heroImage}
                alt={day.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#FFC067]">
                  Signature Cultural Anchor
                </span>
                <h3 className="text-lg sm:text-xl font-display font-bold text-white drop-shadow-sm">
                  {day.activities[0]?.title || day.title}
                </h3>
              </div>
            </div>
          )}

          {/* Activities Sequential List */}
          <div className="space-y-4">
            {day.activities.map((act, index) => (
              <div key={act.id} className="relative">
                <ItineraryActivityCard
                  activity={act}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === day.activities.length - 1}
                  isActive={activeStopId === act.id}
                  isHovered={hoveredStopId === act.id}
                  onMouseEnter={() => onStopHover?.(act.id)}
                  onMouseLeave={() => onStopHover?.(null)}
                  onClick={() => onStopSelect?.(act.id)}
                  onUpdateStatus={(newStatus) =>
                    onUpdateActivityStatus(day.dayNumber, act.id, newStatus)
                  }
                  onUpdateNotes={(notes) =>
                    onUpdateActivityNotes(day.dayNumber, act.id, notes)
                  }
                  onUpdateDuration={(durationMins) =>
                    onUpdateActivityDuration?.(day.dayNumber, act.id, durationMins)
                  }
                  onMoveUp={() => onMoveActivity(day.dayNumber, index, index - 1)}
                  onMoveDown={() => onMoveActivity(day.dayNumber, index, index + 1)}
                  onRemove={() => onRemoveActivity(day.dayNumber, act.id)}
                />

                {/* Insert Stop Button Between Cards */}
                <div className="flex justify-center my-2">
                  <button
                    onClick={() => onAddActivityClick(day.dayNumber, index)}
                    className="opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity px-3 py-1 bg-white hover:bg-[#FAF7F2] border border-[#E5DFD5] rounded-full text-[11px] font-mono text-[#C1443B] flex items-center gap-1 shadow-xs cursor-pointer"
                    title="Insert place here"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Insert Stop Here</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Add Activity Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E5DFD5]">
            <button
              onClick={() => onAddActivityClick(day.dayNumber)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-dashed border-ink hover:border-[#C1443B] bg-white hover:bg-[#FAF8F5] text-ink hover:text-[#C1443B] font-heading font-bold text-xs sm:text-sm tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
            >
              <Plus className="w-4 h-4 text-[#C1443B]" />
              <span>Add Cultural Place to Day {day.dayNumber}</span>
            </button>

            <span className="text-xs font-mono text-dusk">
              {day.activities.length} stops mapped · ~{durationHours} hours total
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
