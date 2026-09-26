import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Users,
  Building2,
  Target,
  Pencil,
  Share2,
  Printer,
  Sparkles,
  Ticket,
  Utensils,
  Car,
} from 'lucide-react';
import { ItineraryTripDetails } from '../../types/itinerary';

interface TripHeaderOverviewProps {
  tripDetails: ItineraryTripDetails;
  totalCost: number;
  categoryBreakdown?: {
    tickets: number;
    food: number;
    transit: number;
  };
  onEditTrip: () => void;
  onShare: () => void;
  onPrint: () => void;
}

export function TripHeaderOverview({
  tripDetails,
  totalCost,
  categoryBreakdown,
  onEditTrip,
  onShare,
  onPrint,
}: TripHeaderOverviewProps) {
  const travelersCount = Math.max(1, tripDetails.travelers || 2);
  const perPersonCost = Math.round(totalCost / travelersCount);
  const budgetLimit = tripDetails.totalBudgetLimit || 25000;
  const budgetUtilization = Math.min(100, Math.round((totalCost / budgetLimit) * 100));

  // Category breakdown calculations
  const ticketsCost = categoryBreakdown?.tickets ?? Math.round(totalCost * 0.50);
  const foodCost = categoryBreakdown?.food ?? Math.round(totalCost * 0.32);
  const transitCost = categoryBreakdown?.transit ?? Math.round(totalCost * 0.18);

  const safeTotal = Math.max(1, totalCost);
  const ticketsPercent = Math.min(100, Math.round((ticketsCost / safeTotal) * 100));
  const foodPercent = Math.min(100, Math.round((foodCost / safeTotal) * 100));
  const transitPercent = Math.min(100, Math.round((transitCost / safeTotal) * 100));

  const destinationWatermark = (tripDetails.destination || 'INDIA').toUpperCase();

  return (
    <header className="relative bg-white/90 backdrop-blur-xl border border-[#E2D5BE] rounded-[32px] p-6 sm:p-8 shadow-xl overflow-hidden before:content-[''] before:absolute before:-left-4 before:top-1/2 before:-translate-y-1/2 before:w-8 before:h-8 before:bg-[#FAF7F2] before:rounded-full before:border-r before:border-[#E2D5BE] after:content-[''] after:absolute after:-right-4 after:top-1/2 after:-translate-y-1/2 after:w-8 after:h-8 after:bg-[#FAF7F2] after:rounded-full after:border-l after:border-[#E2D5BE] transition-all">
      {/* Oversized Watermarked Typography */}
      <div className="absolute -bottom-4 right-6 font-display font-black text-8xl sm:text-9xl text-[#1A1D20]/[0.03] select-none pointer-events-none uppercase tracking-tighter">
        {destinationWatermark}
      </div>

      <div className="relative z-10 space-y-6">
        {/* Top Identification & Metadata Row */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left Column: Title & Key Metadata */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Cultural Itinerary Matrix</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-mono font-semibold border border-emerald-200">
                Verified & Feasible
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-[#1A1D20] tracking-tight">
                {tripDetails.title}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 font-sans leading-relaxed">
                Hand-curated regional experiences sequenced with verified local transit and crowd pacing.
              </p>
            </div>

            {/* Quick Details Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-meta text-[#1A1D20]">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] rounded-xl border border-[#E8DEC8]">
                <Calendar className="w-3.5 h-3.5 text-[#D99B43]" />
                <span>{tripDetails.startDate} to {tripDetails.endDate}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] rounded-xl border border-[#E8DEC8]">
                <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>{tripDetails.destination}, {tripDetails.state}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] rounded-xl border border-[#E8DEC8]">
                <Users className="w-3.5 h-3.5 text-neutral-500" />
                <span>{tripDetails.travelers} {tripDetails.travelers === 1 ? 'Traveler' : 'Travelers'}</span>
              </div>

              {tripDetails.hotel && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] rounded-xl border border-[#E8DEC8]">
                  <Building2 className="w-3.5 h-3.5 text-[#1A1D20]" />
                  <span>Base: {tripDetails.hotel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pricing Overview & Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E8DEC8]">
            <div className="text-left sm:text-right space-y-0.5">
              <div className="text-xs font-meta uppercase tracking-wider text-neutral-500 font-bold">
                Total Estimated Spend
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-[#1A1D20] tracking-tight">
                ₹{totalCost.toLocaleString('en-IN')}
              </div>
              <div className="text-xs font-mono text-emerald-800 font-semibold">
                ₹{perPersonCost.toLocaleString('en-IN')} per person ({travelersCount} travelers)
              </div>

              {/* Budget Accuracy Barometer */}
              <div className="pt-1.5 flex items-center sm:justify-end">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-mono font-bold shadow-2xs">
                  <Target className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>
                    {budgetUtilization}% Budget Utilization (₹{totalCost.toLocaleString('en-IN')} / ₹{budgetLimit.toLocaleString('en-IN')})
                  </span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto pt-1">
              <button
                type="button"
                onClick={onEditTrip}
                className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F3EAD8] border border-[#E2D5BE] text-[#1A1D20] rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Pencil className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Edit Trip</span>
              </button>

              <button
                type="button"
                onClick={onShare}
                className="px-3.5 py-2 bg-gradient-to-r from-[#C85A32] to-[#D99B43] hover:opacity-95 text-white rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-102 active:scale-98"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={onPrint}
                className="p-2 bg-[#FAF7F2] hover:bg-[#F3EAD8] border border-[#E2D5BE] text-[#1A1D20] rounded-xl text-xs transition cursor-pointer shadow-2xs"
                title="Print PDF Itinerary"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Architectural Hairline Financial Ledger (No Nested Boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E8DEC8] pt-6 mt-6 border-t border-dashed border-[#E2D5BE]">
          {/* Column 1: Experiences & Master Workshops */}
          <div className="py-3 md:py-0 md:px-5 first:pl-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#1A1D20]">
                <Ticket className="w-4 h-4 text-[#C85A32]" />
                <span>Experiences & Workshops</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#C85A32]">
                {ticketsPercent}%
              </span>
            </div>
            <div className="text-lg font-mono font-black text-[#1A1D20]">
              ₹{ticketsCost.toLocaleString('en-IN')}
            </div>
            <div className="w-full h-1.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E8DEC8]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${ticketsPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-[#C85A32] rounded-full"
              />
            </div>
            <div className="text-[11px] font-meta text-neutral-500">
              Verified entrance fees and guild craft sessions
            </div>
          </div>

          {/* Column 2: Regional Culinary & Food Trails */}
          <div className="py-3 md:py-0 md:px-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#1A1D20]">
                <Utensils className="w-4 h-4 text-[#D99B43]" />
                <span>Regional Culinary Trails</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#D99B43]">
                {foodPercent}%
              </span>
            </div>
            <div className="text-lg font-mono font-black text-[#1A1D20]">
              ₹{foodCost.toLocaleString('en-IN')}
            </div>
            <div className="w-full h-1.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E8DEC8]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${foodPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-[#D99B43] rounded-full"
              />
            </div>
            <div className="text-[11px] font-meta text-neutral-500">
              Iconic heritage breakfast, thalis, and street food
            </div>
          </div>

          {/* Column 3: Dedicated Heritage Transit */}
          <div className="py-3 md:py-0 md:px-5 last:pr-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#1A1D20]">
                <Car className="w-4 h-4 text-[#1A1D20]" />
                <span>Dedicated Heritage Transit</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#1A1D20]">
                {transitPercent}%
              </span>
            </div>
            <div className="text-lg font-mono font-black text-[#1A1D20]">
              ₹{transitCost.toLocaleString('en-IN')}
            </div>
            <div className="w-full h-1.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E8DEC8]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${transitPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-[#1A1D20] rounded-full"
              />
            </div>
            <div className="text-[11px] font-meta text-neutral-500">
              Point-to-point auto, e-rickshaws, and private cabs
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TripHeaderOverview;
