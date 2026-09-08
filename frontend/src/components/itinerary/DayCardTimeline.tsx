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
} from 'lucide-react';
import { ItineraryDay, BookingStatus } from '../../types/itinerary';
import { ItineraryActivityCard } from './ItineraryActivityCard';

interface DayCardTimelineProps {
  day: ItineraryDay;
  totalDays: number;
  onUpdateActivityStatus: (dayNumber: number, activityId: number, status: BookingStatus) => void;
  onUpdateActivityNotes: (dayNumber: number, activityId: number, notes: string) => void;
  onMoveActivity: (dayNumber: number, fromIndex: number, toIndex: number) => void;
  onRemoveActivity: (dayNumber: number, activityId: number) => void;
  onAddActivityClick: (dayNumber: number) => void;
  onRemoveDay: (dayNumber: number) => void;
}

export function DayCardTimeline({
  day,
  totalDays,
  onUpdateActivityStatus,
  onUpdateActivityNotes,
  onMoveActivity,
  onRemoveActivity,
  onAddActivityClick,
  onRemoveDay,
}: DayCardTimelineProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const dayTotalCost = day.activities.reduce((sum, act) => sum + act.costPerPerson, 0);
  const totalDurationMins = day.activities.reduce((sum, act) => sum + act.durationMins + act.transitTimeMins, 0);
  const durationHours = (totalDurationMins / 60).toFixed(1);

  return (
    <section className="bg-white rounded-3xl border border-paper-400 overflow-hidden shadow-sm transition-all hover:shadow-md">
      {/* Day Top Bar with Day Label, Date & Total Cost */}
      <div className="p-6 sm:p-7 bg-paper-100/70 border-b border-paper-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-dusk font-bold">
            <span className="px-2.5 py-0.5 bg-ink text-paper rounded-md">
              DAY {day.dayNumber}
            </span>
            <span>—</span>
            <span>{day.date}</span>
            <span className="text-dusk-400">|</span>
            <span>{day.dayOfWeek}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-bold text-ink">
            {day.title}
          </h2>
        </div>

        <div className="flex items-center gap-4 justify-between sm:justify-end">
          <div className="text-left sm:text-right">
            <span className="text-xs font-mono uppercase tracking-wider text-dusk block">
              Day Total
            </span>
            <span className="text-xl sm:text-2xl font-display font-black text-teal">
              ₹{dayTotalCost.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-white hover:bg-paper-200 border border-paper-300 text-dusk hover:text-ink transition cursor-pointer"
            title={isCollapsed ? 'Expand Day' : 'Collapse Day'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-6 sm:p-8 space-y-8">
          {/* Day Hero Image (Anchor visual experience) */}
          {day.heroImage && (
            <div className="relative rounded-2xl overflow-hidden h-56 sm:h-72 w-full bg-paper-300 border border-paper-300 shadow-inner group">
              <img
                src={day.heroImage}
                alt={day.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs font-mono font-bold text-marigold uppercase tracking-wider">
                  Featured Day Milestone
                </span>
                <h3 className="text-lg sm:text-2xl font-display font-bold text-white drop-shadow-sm">
                  {day.title}
                </h3>
              </div>
            </div>
          )}

          {/* Activities List */}
          <div className="space-y-6">
            {day.activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                {/* Interstitial Transit Indicator between stops */}
                {index > 0 && (
                  <div className="flex items-center gap-3 pl-4 sm:pl-8 text-xs font-mono text-dusk-600">
                    <div className="w-0.5 h-6 bg-paper-400 border-l border-dashed border-paper-400 ml-3" />
                    <div className="flex items-center gap-2 px-3 py-1 bg-paper-100 rounded-full border border-paper-200">
                      <Car className="w-3.5 h-3.5 text-teal" />
                      <span>{activity.gettingThere}</span>
                    </div>
                  </div>
                )}

                <ItineraryActivityCard
                  activity={activity}
                  isFirst={index === 0}
                  isLast={index === day.activities.length - 1}
                  onUpdateStatus={(newStatus) =>
                    onUpdateActivityStatus(day.dayNumber, activity.id, newStatus)
                  }
                  onUpdateNotes={(notes) =>
                    onUpdateActivityNotes(day.dayNumber, activity.id, notes)
                  }
                  onMoveUp={() => onMoveActivity(day.dayNumber, index, index - 1)}
                  onMoveDown={() => onMoveActivity(day.dayNumber, index, index + 1)}
                  onRemove={() => onRemoveActivity(day.dayNumber, activity.id)}
                />
              </React.Fragment>
            ))}
          </div>

          {/* Day Summary & Hotel Anchor Footer */}
          <div className="pt-4 border-t border-paper-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                <span className="font-bold text-ink">
                  Day Total: ₹{dayTotalCost.toLocaleString('en-IN')}
                </span>
                <span className="text-dusk-400">·</span>
                <span className="text-dusk">
                  Active Duration: ~{durationHours} hrs
                </span>
                {day.hotel && (
                  <>
                    <span className="text-dusk-400">·</span>
                    <div className="flex items-center gap-1 text-ink-700">
                      <Building2 className="w-3.5 h-3.5 text-ink-500" />
                      <span>Base Hotel: {day.hotel}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAddActivityClick(day.dayNumber)}
                className="px-3.5 py-2 bg-paper-100 hover:bg-paper-200 text-ink rounded-xl font-mono text-xs font-bold border border-paper-300 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-marigold" />
                <span>Add Activity</span>
              </button>

              {totalDays > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveDay(day.dayNumber)}
                  className="px-3 py-2 text-rose-700 hover:text-rose-900 font-mono text-xs flex items-center gap-1 hover:underline cursor-pointer"
                  title="Remove this entire day"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete Day</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
