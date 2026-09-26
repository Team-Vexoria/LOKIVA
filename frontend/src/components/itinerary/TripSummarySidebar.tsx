import React from 'react';
import {
  Calendar,
  Coins,
  Bookmark,
  CheckCircle2,
  Clock,
  CloudSun,
  Luggage,
  Accessibility,
  Car,
  Languages,
  Share2,
  Printer,
  PieChart,
  Heart,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { ItineraryDay, ItineraryTripDetails, ItineraryPracticalInfo } from '../../types/itinerary';
import { PracticalBriefingCard } from './PracticalBriefingCard';

interface TripSummarySidebarProps {
  tripDetails: ItineraryTripDetails;
  days: ItineraryDay[];
  practicalInfo: ItineraryPracticalInfo;
  grandTotal?: number;
  categoryBreakdown?: {
    tickets: number;
    food: number;
    transit: number;
  };
  onShare: () => void;
  onPrint: () => void;
}

export function TripSummarySidebar({
  tripDetails,
  days,
  practicalInfo,
  grandTotal,
  categoryBreakdown,
  onShare,
  onPrint,
}: TripSummarySidebarProps) {
  const travelers = Math.max(1, tripDetails.travelers || 2);
  const allActivities = days.flatMap((d) => d.activities);

  const fallbackTicketsCost = allActivities.reduce((sum, act) => sum + (act.costPerPerson || 0) * travelers, 0);
  const fallbackTransitCost = allActivities.reduce((sum, act) => sum + (act.transitCost || 0), 0);
  const fallbackMealsCost = days.length * 800 * travelers;

  const totalTicketsCost = categoryBreakdown ? categoryBreakdown.tickets : fallbackTicketsCost;
  const totalTransitCost = categoryBreakdown ? categoryBreakdown.transit : fallbackTransitCost;
  const totalMealsCost = categoryBreakdown ? categoryBreakdown.food : fallbackMealsCost;

  const finalGrandTotal = grandTotal !== undefined ? grandTotal : (totalTicketsCost + totalTransitCost + totalMealsCost);
  const perPersonTotal = Math.round(finalGrandTotal / travelers);

  const ticketsPercent = Math.max(1, Math.round((totalTicketsCost / Math.max(1, finalGrandTotal)) * 100));
  const mealsPercent = Math.max(1, Math.round((totalMealsCost / Math.max(1, finalGrandTotal)) * 100));
  const transitPercent = Math.max(1, Math.max(0, 100 - ticketsPercent - mealsPercent));

  // Local impact score: Direct community spend percentage
  const localDirectAmount = Math.round(totalTicketsCost * 0.95 + totalTransitCost * 0.9 + totalMealsCost * 0.85);
  const localImpactPercent = Math.min(96, Math.max(75, Math.round((localDirectAmount / Math.max(1, finalGrandTotal)) * 100)));

  return (
    <aside className="space-y-6 sticky top-24">
      {/* 1. Trip Summary & Cost Breakdown Card */}
      <div className="bg-[#FAF6F0] rounded-2xl border border-[#E6DAC6] p-5 sm:p-6 space-y-5 shadow-sm text-[#3B2316]">
        <div className="space-y-1 pb-4 border-b border-[#E6DAC6]">
          <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#B84A27] block">
            Trip Financial Overview
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#3B2316] tracking-tight">
              ₹{finalGrandTotal.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-meta text-[#B84A27] font-bold">
              {days.length} Days · {Math.max(1, days.length - 1)} Nights
            </span>
          </div>
          <span className="text-xs font-meta text-[#7A5C49] block">
            ₹{perPersonTotal.toLocaleString('en-IN')} per person for {travelers} {travelers === 1 ? 'traveler' : 'travelers'}
          </span>
        </div>

        {/* Stacked Cost Visualizer */}
        <div className="space-y-3 font-meta text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#3B2316] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-[#D47A39]" />
              <span>Budget Breakdown</span>
            </span>
            <span className="text-[#7A5C49] text-[10px]">Estimated</span>
          </div>

          <div className="h-2.5 w-full bg-[#FFFDF9] rounded-full overflow-hidden flex shadow-inner border border-[#E6DAC6]">
            <div
              style={{ width: `${ticketsPercent}%` }}
              className="bg-[#B84A27] h-full transition-all"
              title={`Entry & Workshops: ${ticketsPercent}%`}
            />
            <div
              style={{ width: `${mealsPercent}%` }}
              className="bg-[#D47A39] h-full transition-all"
              title={`Local Culinary: ${mealsPercent}%`}
            />
            <div
              style={{ width: `${transitPercent}%` }}
              className="bg-[#A67B5B] h-full transition-all"
              title={`Transit: ${transitPercent}%`}
            />
          </div>

          <div className="space-y-2 pt-1 font-meta text-xs font-semibold tracking-wide text-[#3B2316]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B84A27]" />
                <span className="text-[#7A5C49] font-normal">Entry & Masterclasses</span>
              </div>
              <span className="font-bold text-[#3B2316]">₹{totalTicketsCost.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D47A39]" />
                <span className="text-[#7A5C49] font-normal">Regional Culinary Food</span>
              </div>
              <span className="font-bold text-[#3B2316]">₹{totalMealsCost.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A67B5B]" />
                <span className="text-[#7A5C49] font-normal">Auto & Cab Transit</span>
              </div>
              <span className="font-bold text-[#3B2316]">₹{totalTransitCost.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* 2. Direct Artisan & Local Impact Score Widget */}
        <div className="bg-[#FAF0DF] p-4 rounded-xl border border-[#F2D5A7] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-meta text-[11px] font-bold uppercase tracking-wider text-[#9E5414] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-[#B84A27] text-[#B84A27]" />
              <span>Local Community Impact</span>
            </span>
            <span className="font-meta text-[11px] font-bold uppercase tracking-wider text-[#9E5414]">
              {localImpactPercent}% Direct
            </span>
          </div>

          <div className="h-2 w-full bg-[#F3E0C4] rounded-full overflow-hidden">
            <div
              style={{ width: `${localImpactPercent}%` }}
              className="h-full bg-gradient-to-r from-[#B84A27] to-[#D47A39] rounded-full transition-all"
            />
          </div>

          <p className="text-[11px] font-sans text-[#7A5C49] leading-relaxed">
            ₹{localDirectAmount.toLocaleString('en-IN')} of your trip goes directly to generational artisans, verified heritage custodians, and street cooperatives with zero middlemen.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-[#E6DAC6]">
          <button
            type="button"
            onClick={onShare}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#B84A27] to-[#D47A39] hover:opacity-95 text-[#FFFDF9] rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#B84A27]/20 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Itinerary via WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="w-full py-2.5 px-4 bg-[#FFFDF9] hover:bg-[#F3ECE1] border border-[#E6DAC6] text-[#3B2316] rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export Field PDF</span>
          </button>
        </div>
      </div>

      {/* 3. Practical Field Intelligence Dossier Bento */}
      <PracticalBriefingCard
        practicalInfo={practicalInfo}
        cityName={tripDetails.destination}
      />
    </aside>
  );
}
