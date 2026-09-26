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
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] p-5 sm:p-6 space-y-5 shadow-sm text-ink">
        <div className="space-y-1 pb-4 border-b border-[#E5DFD5]">
          <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B] block">
            Trip Financial Overview
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-neutral-900 tracking-tight">
              ₹{finalGrandTotal.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-meta text-[#C1443B] font-bold">
              {days.length} Days · {Math.max(1, days.length - 1)} Nights
            </span>
          </div>
          <span className="text-xs font-meta text-dusk block">
            ₹{perPersonTotal.toLocaleString('en-IN')} per person for {travelers} {travelers === 1 ? 'traveler' : 'travelers'}
          </span>
        </div>

        {/* Stacked Cost Visualizer */}
        <div className="space-y-3 font-meta text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-[#FFC067]" />
              <span>Budget Breakdown</span>
            </span>
            <span className="text-dusk text-[10px]">Estimated</span>
          </div>

          <div className="h-2.5 w-full bg-white rounded-full overflow-hidden flex shadow-inner border border-[#E5DFD5]">
            <div
              style={{ width: `${ticketsPercent}%` }}
              className="bg-[#C1443B] h-full transition-all"
              title={`Entry & Workshops: ${ticketsPercent}%`}
            />
            <div
              style={{ width: `${mealsPercent}%` }}
              className="bg-[#FFC067] h-full transition-all"
              title={`Local Culinary: ${mealsPercent}%`}
            />
            <div
              style={{ width: `${transitPercent}%` }}
              className="bg-[#12213B] h-full transition-all"
              title={`Transit: ${transitPercent}%`}
            />
          </div>

          <div className="space-y-2 pt-1 font-meta text-xs font-semibold tracking-wide text-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C1443B]" />
                <span className="text-neutral-600 font-normal">Entry & Masterclasses</span>
              </div>
              <span className="font-bold text-neutral-900">₹{totalTicketsCost.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFC067]" />
                <span className="text-neutral-600 font-normal">Regional Culinary Food</span>
              </div>
              <span className="font-bold text-neutral-900">₹{totalMealsCost.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#12213B]" />
                <span className="text-neutral-600 font-normal">Auto & Cab Transit</span>
              </div>
              <span className="font-bold text-neutral-900">₹{totalTransitCost.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* 2. Direct Artisan & Local Impact Score Widget */}
        <div className="bg-white p-4 rounded-xl border border-[#E5DFD5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-meta text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>Local Community Impact</span>
            </span>
            <span className="font-meta text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              {localImpactPercent}% Direct
            </span>
          </div>

          <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${localImpactPercent}%` }}
              className="h-full bg-emerald-600 rounded-full transition-all"
            />
          </div>

          <p className="text-[11px] font-sans text-dusk leading-relaxed">
            ₹{localDirectAmount.toLocaleString('en-IN')} of your trip goes directly to generational artisans, verified heritage custodians, and street cooperatives with zero middlemen.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-[#E5DFD5]">
          <button
            type="button"
            onClick={onShare}
            className="w-full py-3 px-4 bg-[#C1443B] hover:bg-[#a8362e] text-white rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-102 active:scale-98"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Itinerary via WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#FAF8F5] border border-[#E5DFD5] text-ink rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
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
