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
  const ticketsCost = categoryBreakdown?.tickets ?? Math.round(totalCost * 0.65);
  const foodCost = categoryBreakdown?.food ?? Math.round(totalCost * 0.15);
  const transitCost = categoryBreakdown?.transit ?? Math.round(totalCost * 0.20);

  const safeTotal = Math.max(1, totalCost);
  const ticketsPercent = Math.min(100, Math.round((ticketsCost / safeTotal) * 100));
  const foodPercent = Math.min(100, Math.round((foodCost / safeTotal) * 100));
  const transitPercent = Math.max(0, 100 - ticketsPercent - foodPercent);

  const destinationWatermark = (tripDetails.destination || 'INDIA').toUpperCase();

  return (
    <header className="relative bg-[#FFFDF9] backdrop-blur-xl border border-[#E6DAC6] rounded-[32px] p-6 sm:p-8 shadow-sm overflow-hidden before:content-[''] before:absolute before:-left-4 before:top-1/2 before:-translate-y-1/2 before:w-8 before:h-8 before:bg-[#FAF6F0] before:rounded-full before:border-r before:border-[#E6DAC6] after:content-[''] after:absolute after:-right-4 after:top-1/2 after:-translate-y-1/2 after:w-8 after:h-8 after:bg-[#FAF6F0] after:rounded-full after:border-l after:border-[#E6DAC6] transition-all">
      {/* Oversized Watermarked Typography */}
      <div className="absolute -bottom-4 right-6 font-display font-black text-8xl sm:text-9xl text-[#3B2316]/[0.03] select-none pointer-events-none uppercase tracking-tighter">
        {destinationWatermark}
      </div>

      <div className="relative z-10 space-y-6">
        {/* Top Identification & Metadata Row */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left Column: Title & Magazine Masthead Sentence */}
          <div className="space-y-3 max-w-2xl">
            {/* Minimal Typographic Overline */}
            <div className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#B84A27]">
              CULTURAL ITINERARY MATRIX : EDITION 01
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-[#3B2316] tracking-tight">
                {tripDetails.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#7A5C49] font-sans leading-relaxed">
                Hand-curated regional experiences sequenced with verified local transit and crowd pacing.
              </p>
            </div>

            {/* Editorial Magazine Masthead Sentence (Zero Boxed Clutter) */}
            <div className="pt-1 text-xs sm:text-sm font-sans text-[#5C3D2E] leading-relaxed">
              Crafted for{' '}
              <span
                onClick={onEditTrip}
                className="border-b-2 border-[#D47A39]/50 text-[#3B2316] font-heading font-bold pb-0.5 hover:border-[#B84A27] transition-colors cursor-pointer"
              >
                {travelersCount} {travelersCount === 1 ? 'Solo Explorer' : 'Travelers'}
              </span>{' '}
              across{' '}
              <span
                onClick={onEditTrip}
                className="border-b-2 border-[#D47A39]/50 text-[#3B2316] font-heading font-bold pb-0.5 hover:border-[#B84A27] transition-colors cursor-pointer"
              >
                {tripDetails.destination}
              </span>{' '}
              from{' '}
              <span
                onClick={onEditTrip}
                className="border-b-2 border-[#D47A39]/50 text-[#3B2316] font-heading font-bold pb-0.5 hover:border-[#B84A27] transition-colors cursor-pointer"
              >
                {tripDetails.startDate} to {tripDetails.endDate}
              </span>
              {tripDetails.hotel ? (
                <>
                  , anchored around{' '}
                  <span
                    onClick={onEditTrip}
                    className="border-b-2 border-[#D47A39]/50 text-[#3B2316] font-heading font-bold pb-0.5 hover:border-[#B84A27] transition-colors cursor-pointer"
                  >
                    {tripDetails.hotel}
                  </span>
                  .
                </>
              ) : (
                '.'
              )}
            </div>
          </div>

          {/* Right Column: Pricing Overview & Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E6DAC6]">
            <div className="text-left sm:text-right space-y-0.5">
              <div className="text-xs font-meta uppercase tracking-wider text-[#7A5C49] font-bold">
                Total Estimated Spend
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-[#3B2316] tracking-tight">
                ₹{totalCost.toLocaleString('en-IN')}
              </div>
              <div className="text-xs font-meta text-[#8C6751] font-semibold">
                ₹{perPersonCost.toLocaleString('en-IN')} per person ({travelersCount} travelers)
              </div>

              {/* Warm Saffron Gold Budget Seal (Zero Green) */}
              <div className="pt-1.5 flex items-center sm:justify-end">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF2E0] text-[#9E5414] border border-[#F0D2A4] text-xs font-meta font-bold shadow-2xs">
                  <Target className="w-3.5 h-3.5 text-[#B5651D] shrink-0" />
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
                className="px-3.5 py-2 bg-[#FAF6F0] hover:bg-[#F3ECE1] border border-[#E6DAC6] text-[#3B2316] rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Pencil className="w-3.5 h-3.5 text-[#B84A27]" />
                <span>Edit Trip</span>
              </button>

              <button
                type="button"
                onClick={onShare}
                className="px-3.5 py-2 bg-gradient-to-r from-[#B84A27] to-[#D47A39] hover:opacity-95 text-[#FFFDF9] rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-102 active:scale-98"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={onPrint}
                className="p-2 bg-[#FAF6F0] hover:bg-[#F3ECE1] border border-[#E6DAC6] text-[#3B2316] rounded-xl text-xs transition cursor-pointer shadow-2xs"
                title="Print PDF Itinerary"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Multi-Segment Proportion Ribbon (Replacing 3-Column Box Grid) */}
        <div className="pt-5 mt-4 border-t border-[#E6DAC6] space-y-4">
          <div className="flex items-center justify-between text-xs font-heading font-bold text-[#3B2316]">
            <span>Category Budget Allocation</span>
            <span className="font-meta text-[#7A5C49] font-normal">Calculated across verified ground rates</span>
          </div>

          {/* Continuous Multi-Segment Proportion Ribbon */}
          <div className="h-3.5 w-full rounded-full overflow-hidden flex gap-1 bg-[#F3ECE1] p-0.5 border border-[#E6DAC6]">
            <div
              style={{ width: `${ticketsPercent}%` }}
              className="h-full bg-[#B84A27] rounded-full transition-all duration-700"
              title={`Experiences & Workshops: ${ticketsPercent}%`}
            />
            <div
              style={{ width: `${foodPercent}%` }}
              className="h-full bg-[#D98A36] rounded-full transition-all duration-700"
              title={`Regional Culinary: ${foodPercent}%`}
            />
            <div
              style={{ width: `${transitPercent}%` }}
              className="h-full bg-[#A67B5B] rounded-full transition-all duration-700"
              title={`Dedicated Transit: ${transitPercent}%`}
            />
          </div>

          {/* Flowing Asymmetric Editorial Callouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Callout 1: Experiences */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B84A27] shrink-0" />
                <span className="text-xs font-heading font-bold text-[#3B2316]">
                  Experiences &amp; Workshops
                </span>
                <span className="text-xs font-meta text-[#B84A27] font-bold">
                  {ticketsPercent}%
                </span>
              </div>
              <div className="text-xl font-display font-black text-[#3B2316] pl-4.5">
                ₹{ticketsCost.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] font-sans text-[#7A5C49] pl-4.5 leading-snug">
                Entrance fees, craft masterclasses and guild access
              </p>
            </div>

            {/* Callout 2: Culinary */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D98A36] shrink-0" />
                <span className="text-xs font-heading font-bold text-[#3B2316]">
                  Regional Culinary Trails
                </span>
                <span className="text-xs font-meta text-[#D98A36] font-bold">
                  {foodPercent}%
                </span>
              </div>
              <div className="text-xl font-display font-black text-[#3B2316] pl-4.5">
                ₹{foodCost.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] font-sans text-[#7A5C49] pl-4.5 leading-snug">
                Heritage breakfasts, thalis, tea houses and street trails
              </p>
            </div>

            {/* Callout 3: Transit */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A67B5B] shrink-0" />
                <span className="text-xs font-heading font-bold text-[#3B2316]">
                  Dedicated Heritage Transit
                </span>
                <span className="text-xs font-meta text-[#A67B5B] font-bold">
                  {transitPercent}%
                </span>
              </div>
              <div className="text-xl font-display font-black text-[#3B2316] pl-4.5">
                ₹{transitCost.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] font-sans text-[#7A5C49] pl-4.5 leading-snug">
                Point-to-point autos, e-rickshaws and dedicated cabs
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TripHeaderOverview;
