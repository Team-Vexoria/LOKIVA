import React, { useState } from 'react';
import { CheckSquare, Square, Clock, MapPin, Coins, ExternalLink } from 'lucide-react';
import { ItineraryDay } from '../../types/itinerary';

interface ItineraryListViewProps {
  days: ItineraryDay[];
}

export function ItineraryListView({ days }: ItineraryListViewProps) {
  const [completedIds, setCompletedIds] = useState<number[]>([]);

  const toggleComplete = (id: number) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-8 shadow-sm">
      <div className="space-y-1 pb-4 border-b border-paper-200">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-ink">
          Itinerary Checklist & Travel Outline
        </h2>
        <p className="text-xs text-dusk-600 font-sans">
          A minimalist text checklist optimized for fast scanning, printing, and on-the-go ticking.
        </p>
      </div>

      <div className="space-y-8">
        {days.map((day) => {
          const daySpend = day.activities.reduce((sum, act) => sum + act.costPerPerson, 0);

          return (
            <div key={day.dayNumber} className="space-y-4">
              {/* Day Section Header */}
              <div className="flex items-center justify-between pb-2 border-b border-paper-300">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-ink text-paper rounded font-mono font-bold text-xs">
                    DAY {day.dayNumber}
                  </span>
                  <span className="font-display font-bold text-base sm:text-lg text-ink">
                    {day.title}
                  </span>
                  <span className="text-xs font-mono text-dusk-500 hidden sm:inline">
                    ({day.date})
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-teal">
                  ₹{daySpend.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Activities Checklist Items */}
              <div className="space-y-2">
                {day.activities.map((act) => {
                  const isDone = completedIds.includes(act.id);

                  return (
                    <div
                      key={act.id}
                      onClick={() => toggleComplete(act.id)}
                      className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                        isDone
                          ? 'bg-paper-100 border-paper-300 opacity-60 line-through'
                          : 'bg-white hover:bg-paper-50 border-paper-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          className="mt-0.5 text-ink hover:text-marigold transition cursor-pointer"
                        >
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-teal" />
                          ) : (
                            <Square className="w-4 h-4 text-dusk-400" />
                          )}
                        </button>

                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-xs text-ink">
                              {act.timeRange}
                            </span>
                            <span className="text-dusk-400">·</span>
                            <span className="font-sans font-bold text-sm text-ink">
                              {act.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono text-dusk">
                            <span>{act.location}</span>
                            <span>·</span>
                            <span>{act.duration}</span>
                          </div>

                          {act.notes && (
                            <p className="text-xs font-sans text-amber-800 italic pt-0.5">
                              Note: {act.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono text-xs">
                        <span className="font-bold text-ink block">
                          {act.costPerPerson === 0 ? 'Free' : `₹${act.costPerPerson.toLocaleString('en-IN')}`}
                        </span>
                        <span className="text-[10px] text-dusk capitalize">
                          {act.bookingStatus}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
