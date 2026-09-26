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
    <div className="bg-[#FFFDF9] rounded-3xl border border-[#E6DAC6] p-6 sm:p-8 space-y-8 shadow-sm">
      <div className="space-y-1 pb-4 border-b border-[#E6DAC6]">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-[#3B2316]">
          Itinerary Checklist &amp; Travel Outline
        </h2>
        <p className="text-xs text-[#7A5C49] font-sans">
          A minimalist text checklist optimized for fast scanning, printing, and on-the-go ticking.
        </p>
      </div>

      <div className="space-y-8">
        {days.map((day) => {
          const daySpend = day.activities.reduce((sum, act) => sum + act.costPerPerson, 0);

          return (
            <div key={day.dayNumber} className="space-y-4">
              {/* Day Section Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E6DAC6]">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-gradient-to-r from-[#B84A27] to-[#D47A39] text-[#FFFDF9] rounded-lg font-heading font-extrabold text-xs shadow-2xs">
                    DAY {day.dayNumber}
                  </span>
                  <span className="font-display font-bold text-base sm:text-lg text-[#3B2316]">
                    {day.title}
                  </span>
                  <span className="text-xs font-mono text-[#7A5C49] hidden sm:inline">
                    ({day.date})
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#B84A27]">
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
                          ? 'bg-[#FAF6F0] border-[#E6DAC6] opacity-60 line-through'
                          : 'bg-[#FFFDF9] hover:bg-[#FAF6F0] border-[#E6DAC6] shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          className="mt-0.5 text-[#3B2316] hover:text-[#B84A27] transition cursor-pointer"
                        >
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-[#B84A27]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#A67B5B]" />
                          )}
                        </button>

                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#3B2316]">
                              {act.timeRange}
                            </span>
                            <span className="text-[#A67B5B]">·</span>
                            <span className="font-heading font-bold text-sm text-[#3B2316]">
                              {act.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono text-[#7A5C49]">
                            <span>{act.location}</span>
                            <span>·</span>
                            <span>{act.duration}</span>
                          </div>

                          {act.notes && (
                            <p className="text-xs font-sans text-[#9E5414] italic pt-0.5">
                              Note: {act.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono text-xs">
                        <span className="font-bold text-[#3B2316] block">
                          {act.costPerPerson === 0 ? 'Free' : `₹${act.costPerPerson.toLocaleString('en-IN')}`}
                        </span>
                        <span className="text-[10px] text-[#7A5C49] capitalize">
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
