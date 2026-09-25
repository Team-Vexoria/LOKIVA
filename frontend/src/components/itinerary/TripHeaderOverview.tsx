import React from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Coins,
  Share2,
  Printer,
  Pencil,
  Sparkles,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { ItineraryTripDetails } from '../../types/itinerary';

interface TripHeaderOverviewProps {
  tripDetails: ItineraryTripDetails;
  totalCost: number;
  onEditTrip: () => void;
  onShare: () => void;
  onPrint: () => void;
}

export function TripHeaderOverview({
  tripDetails,
  totalCost,
  onEditTrip,
  onShare,
  onPrint,
}: TripHeaderOverviewProps) {
  const perPersonCost = Math.round(totalCost / Math.max(1, tripDetails.travelers));

  return (
    <header className="bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] p-5 sm:p-7 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Title & Key Metadata */}
        <div className="space-y-3.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cultural Itinerary Matrix</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-mono font-semibold border border-emerald-200">
              Verified & Feasible
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-ink tracking-tight">
              {tripDetails.title}
            </h1>
            <p className="text-xs sm:text-sm text-dusk font-sans">
              Hand-curated regional experiences sequenced with real local transit and crowd pacing.
            </p>
          </div>

          {/* Quick Details Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-mono text-ink">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-[#E5DFD5]">
              <Calendar className="w-3.5 h-3.5 text-[#FFC067]" />
              <span>{tripDetails.startDate} to {tripDetails.endDate}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-[#E5DFD5]">
              <MapPin className="w-3.5 h-3.5 text-[#C1443B]" />
              <span>{tripDetails.destination}, {tripDetails.state}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-[#E5DFD5]">
              <Users className="w-3.5 h-3.5 text-dusk" />
              <span>{tripDetails.travelers} {tripDetails.travelers === 1 ? 'Traveler' : 'Travelers'}</span>
            </div>

            {tripDetails.hotel && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-[#E5DFD5]">
                <Building2 className="w-3.5 h-3.5 text-ink" />
                <span>Base: {tripDetails.hotel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing Overview & Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E5DFD5]">
          <div className="text-left sm:text-right space-y-0.5">
            <div className="text-xs font-mono uppercase tracking-wider text-dusk">
              Total Estimated Spend
            </div>
            <div className="text-2xl sm:text-3xl font-display font-black text-ink">
              ₹{totalCost.toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-mono text-emerald-800 font-medium">
              ₹{perPersonCost.toLocaleString('en-IN')} per person
            </div>
            {tripDetails.totalBudgetLimit ? (
              <div className="flex items-center sm:justify-end gap-1.5 pt-1 text-[11px] font-mono text-emerald-800 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>
                  {totalCost <= tripDetails.totalBudgetLimit
                    ? `Within your ₹${tripDetails.totalBudgetLimit.toLocaleString('en-IN')} budget`
                    : `Budget ceiling: ₹${tripDetails.totalBudgetLimit.toLocaleString('en-IN')}`}
                </span>
              </div>
            ) : null}
          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onEditTrip}
              className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] border border-[#E5DFD5] text-ink rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Trip</span>
            </button>

            <button
              type="button"
              onClick={onShare}
              className="px-3.5 py-2 bg-[#C1443B] hover:bg-[#a8362e] text-white rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-102 active:scale-98"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
