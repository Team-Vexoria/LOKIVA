import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Coins, Bookmark, CheckCircle2 } from 'lucide-react';
import { ItineraryDay, ItineraryActivity } from '../../types/itinerary';

interface ItineraryMapViewProps {
  days: ItineraryDay[];
}

export function ItineraryMapView({ days }: ItineraryMapViewProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | 'all'>('all');
  const [activeActivity, setActiveActivity] = useState<ItineraryActivity | null>(null);

  const displayedDays =
    selectedDayIndex === 'all' ? days : [days[selectedDayIndex as number]];

  const allDisplayedActivities = displayedDays.flatMap((d) =>
    d.activities.map((act) => ({ ...act, dayNumber: d.dayNumber }))
  );

  return (
    <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Map Header & Day Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-ink">
            Itinerary Route & Geographic Map
          </h2>
          <p className="text-xs text-dusk-600 font-sans">
            Visual sequence of stops plotted with estimated auto-rickshaw transit buffers.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedDayIndex('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
              selectedDayIndex === 'all'
                ? 'bg-ink text-paper shadow-2xs'
                : 'bg-paper-100 text-dusk hover:text-ink border border-paper-300'
            }`}
          >
            All Days
          </button>
          {days.map((day, idx) => (
            <button
              key={day.dayNumber}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                selectedDayIndex === idx
                  ? 'bg-ink text-paper shadow-2xs'
                  : 'bg-paper-100 text-dusk hover:text-ink border border-paper-300'
              }`}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Schematic Route Canvas */}
      <div className="relative w-full h-96 sm:h-[420px] bg-[#EEF1EE] rounded-2xl border border-paper-400 overflow-hidden p-6 flex flex-col justify-between">
        {/* Subtle Map Grid Background Pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #12213B 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Route Connector Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <polyline
            points={allDisplayedActivities
              .map((_, i) => {
                const step = 100 / (allDisplayedActivities.length + 1);
                const x = (i + 1) * step;
                const y = 30 + (i % 2 === 0 ? 30 : 15);
                return `${x}%,${y}%`;
              })
              .join(' ')}
            fill="none"
            stroke="#D85A38"
            strokeWidth="3"
            strokeDasharray="6,6"
            className="animate-pulse"
          />
        </svg>

        {/* Plotted Stops Pins */}
        <div className="relative z-10 w-full h-full flex items-center justify-between px-4 sm:px-12">
          {allDisplayedActivities.map((act, idx) => {
            const isSelected = activeActivity?.id === act.id;
            const isEven = idx % 2 === 0;

            return (
              <div
                key={act.id}
                className="relative flex flex-col items-center cursor-pointer group"
                style={{ transform: `translateY(${isEven ? '40px' : '-40px'})` }}
                onClick={() => setActiveActivity(act)}
              >
                {/* Pin Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow-md transition-transform duration-200 group-hover:scale-115 ${
                    isSelected
                      ? 'bg-marigold text-ink ring-4 ring-marigold/30'
                      : 'bg-ink text-paper'
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Pin Label */}
                <div className="mt-2 text-center max-w-[110px]">
                  <span className="text-[11px] font-mono font-bold text-ink block truncate">
                    {act.title}
                  </span>
                  <span className="text-[10px] font-mono text-dusk-600 block">
                    Day {act.dayNumber} · {act.timeRange.split('-')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stop Details Floating Overlay Card */}
        {activeActivity && (
          <div className="relative z-20 self-center max-w-md w-full bg-white rounded-2xl border border-paper-400 p-4 shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
            {activeActivity.photos && activeActivity.photos.length > 0 && (
              <img
                src={activeActivity.photos[0]}
                alt={activeActivity.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-paper-300"
              />
            )}
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-ink truncate">
                  {activeActivity.title}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveActivity(null)}
                  className="text-dusk hover:text-ink text-xs font-mono cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-dusk">
                <Clock className="w-3 h-3 text-marigold" />
                <span>{activeActivity.timeRange}</span>
                <span>·</span>
                <span className="text-teal font-bold">
                  {activeActivity.costPerPerson === 0 ? 'Free' : `₹${activeActivity.costPerPerson}`}
                </span>
              </div>
              <p className="text-[11px] text-dusk-700 font-sans truncate">
                {activeActivity.gettingThere}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chronological Stop Sequence List */}
      <div className="space-y-3">
        <h3 className="text-sm font-mono font-bold text-ink uppercase tracking-wider">
          Geographic Stop Sequence
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allDisplayedActivities.map((act, idx) => (
            <div
              key={act.id}
              onClick={() => setActiveActivity(act)}
              className="p-3 bg-paper-50 hover:bg-paper-100 rounded-xl border border-paper-300 flex items-start gap-3 cursor-pointer transition"
            >
              <span className="w-6 h-6 rounded-full bg-ink text-paper font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="space-y-0.5 min-w-0">
                <span className="text-xs font-mono font-bold text-ink block truncate">
                  {act.title}
                </span>
                <span className="text-[11px] font-sans text-dusk block truncate">
                  {act.location}
                </span>
                <span className="text-[10px] font-mono text-teal block">
                  Day {act.dayNumber} · {act.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
