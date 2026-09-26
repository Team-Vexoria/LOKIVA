import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  Car,
  Footprints,
  Plus,
  Compass,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { ItineraryDay, BookingStatus } from '../../types/itinerary';
import { SignatureAnchorHero } from './SignatureAnchorHero';
import { ItineraryActivityCard } from './ItineraryActivityCard';

interface ItineraryTimelineProps {
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

export function ItineraryTimeline({
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
}: ItineraryTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll linked progress line for vertical chrono-spine
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 30,
    restDelta: 0.001,
  });

  const totalDurationMins = day.activities.reduce(
    (sum, act) => sum + (act.visitDurationMinutes || 60) + (act.transitToNextMinutes || 15),
    0
  );
  const durationHours = (totalDurationMins / 60).toFixed(1);

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      {/* 1. Signature Cultural Anchor Hero Banner */}
      <SignatureAnchorHero
        day={day}
        onSetStartTime={onSetStartTime}
      />

      {/* 2. Continuous Vertical Chrono-Spine & Asymmetric Stop Cards */}
      <div className="relative pl-12 sm:pl-16 space-y-6 pt-2 pb-4">
        {/* Continuous Background Rail */}
        <div className="absolute left-4 sm:left-6 top-3 bottom-8 w-[2px] bg-[#E2D5BE] rounded-full" />

        {/* Scroll-Driven Dynamic Terracotta Progress Line */}
        <motion.div
          style={{ scaleY, originY: 0 }}
          className="absolute left-4 sm:left-6 top-3 bottom-8 w-[2px] bg-gradient-to-b from-[#C85A32] to-[#D99B43] rounded-full z-0"
        />

        {/* Sequential Stops */}
        {day.activities.map((activity, index) => {
          const isFirst = index === 0;
          const isLast = index === day.activities.length - 1;
          const isSelected = activeStopId === activity.id;
          const isHovered = hoveredStopId === activity.id;
          const formattedIndex = String(index + 1).padStart(2, '0');

          return (
            <div key={activity.id} className="relative">
              {/* Compass Stop Beacon Anchored on the Rail */}
              <div className="absolute -left-12 sm:-left-16 top-5 flex flex-col items-center z-10">
                {/* Outer Ring & Tactile Badge */}
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                    isSelected
                      ? 'bg-[#C85A32] text-white ring-4 ring-[#FFC067]/80 scale-110'
                      : isHovered
                      ? 'bg-[#FAF4ED] text-[#C85A32] border-2 border-[#C85A32]'
                      : 'bg-white text-[#C85A32] border-2 border-[#C85A32]'
                  }`}
                >
                  <span className={`font-heading font-black text-xs ${isSelected ? 'text-white' : 'text-[#C85A32]'}`}>
                    {formattedIndex}
                  </span>
                </motion.div>

                {/* Clean Timing Timestamp */}
                <span className="font-meta text-[10px] font-bold text-neutral-500 mt-1 whitespace-nowrap">
                  {activity.startTime || activity.timeRange?.split('-')[0]?.trim() || ''}
                </span>
              </div>

              {/* Asymmetric Magazine Stop Card */}
              <ItineraryActivityCard
                activity={activity}
                index={index}
                isFirst={isFirst}
                isLast={isLast}
                isActive={isSelected}
                isHovered={isHovered}
                onMouseEnter={() => onStopHover?.(activity.id)}
                onMouseLeave={() => onStopHover?.(null)}
                onClick={() => onStopSelect?.(activity.id)}
                onUpdateStatus={(newStatus) =>
                  onUpdateActivityStatus(day.dayNumber, activity.id, newStatus)
                }
                onUpdateNotes={(notes) =>
                  onUpdateActivityNotes(day.dayNumber, activity.id, notes)
                }
                onUpdateDuration={(durationMins) =>
                  onUpdateActivityDuration?.(day.dayNumber, activity.id, durationMins)
                }
                onMoveUp={() => onMoveActivity(day.dayNumber, index, index - 1)}
                onMoveDown={() => onMoveActivity(day.dayNumber, index, index + 1)}
                onRemove={() => onRemoveActivity(day.dayNumber, activity.id)}
              />

              {/* External Transit Connector Capsule & In-Between Insert Pill */}
              {!isLast && (
                <div className="my-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* External Transit Pill */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FAF6F0] border border-[#E6DAC6] shadow-2xs text-xs font-meta text-[#5C3D2E] hover:border-[#B84A27] transition-colors"
                  >
                    {activity.transitMode === 'walking' ? (
                      <Footprints className="w-3.5 h-3.5 text-[#B84A27] shrink-0" />
                    ) : (
                      <Car className="w-3.5 h-3.5 text-[#B84A27] shrink-0" />
                    )}
                    <span className="font-medium">
                      {activity.gettingThere || `Private transfer · ~${activity.transitToNextMinutes || 15} mins`}
                    </span>
                    {activity.transitCost > 0 && (
                      <span className="font-mono font-bold text-[#3B2316] bg-[#FFFDF9]/80 px-2 py-0.5 rounded-full border border-[#E6DAC6]">
                        ~₹{activity.transitCost.toLocaleString('en-IN')}
                      </span>
                    )}
                  </motion.div>

                  {/* Insert Stop Button Between Activities */}
                  <button
                    type="button"
                    onClick={() => onAddActivityClick(day.dayNumber, index)}
                    className="opacity-60 hover:opacity-100 transition-opacity self-start sm:self-auto px-3 py-1 bg-white hover:bg-[#FAF7F2] border border-[#E2D5BE] rounded-full text-[11px] font-meta font-bold text-[#C85A32] flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Insert place here"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Insert Stop</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Add Place Action Footer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#E2D5BE] flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onAddActivityClick(day.dayNumber)}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-[#C85A32] to-[#D99B43] hover:opacity-95 text-white font-heading font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cultural Place to Day {day.dayNumber}</span>
        </button>

        <span className="text-xs font-meta text-neutral-500">
          {day.activities.length} stops mapped · ~{durationHours} hours total
        </span>
      </div>
    </div>
  );
}

export default ItineraryTimeline;
