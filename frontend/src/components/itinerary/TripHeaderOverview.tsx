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
    <header className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Title & Key Metadata */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-sand-100 text-ink-700 border border-sand-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-marigold" />
              <span>Cultural Travel Plan</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px] font-mono font-semibold border border-teal-200">
              Verified & Coordinated
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-ink tracking-tight">
              {tripDetails.title}
            </h1>
            <p className="text-xs sm:text-sm text-dusk-600 font-sans">
              Hand-curated regional experiences sequenced with real local transit and crowd pacing.
            </p>
          </div>

          {/* Quick Details Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-ink">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-paper-100 rounded-xl border border-paper-300">
              <Calendar className="w-3.5 h-3.5 text-marigold" />
              <span>{tripDetails.startDate} – {tripDetails.endDate}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-paper-100 rounded-xl border border-paper-300">
              <MapPin className="w-3.5 h-3.5 text-teal" />
              <span>{tripDetails.destination}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-paper-100 rounded-xl border border-paper-300">
              <Users className="w-3.5 h-3.5 text-dusk" />
              <span>{tripDetails.travelers} {tripDetails.travelers === 1 ? 'Traveler' : 'Travelers'}</span>
            </div>

            {tripDetails.hotel && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-paper-100 rounded-xl border border-paper-300">
                <Building2 className="w-3.5 h-3.5 text-ink-500" />
                <span>Base: {tripDetails.hotel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing Overview & Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-end justify-between gap-5 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-paper-200">
          <div className="text-left sm:text-right space-y-0.5">
            <div className="text-xs font-mono uppercase tracking-wider text-dusk">
              Total Estimated Spend
            </div>
            <div className="text-3xl sm:text-4xl font-display font-black text-ink">
              ₹{totalCost.toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-mono text-teal font-medium">
              ₹{perPersonCost.toLocaleString('en-IN')} per person
            </div>
          </div>

          {/* Action Button Row */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onEditTrip}
              className="justify-center px-3.5 py-2.5 bg-paper-100 hover:bg-paper-200 text-ink rounded-xl font-mono text-xs font-bold transition border border-paper-300 flex items-center gap-2 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-dusk" />
              <span>Edit Trip</span>
            </button>

            <button
              type="button"
              onClick={onShare}
              className="justify-center px-3.5 py-2.5 bg-paper-100 hover:bg-paper-200 text-ink rounded-xl font-mono text-xs font-bold transition border border-paper-300 flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-dusk" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={onPrint}
              className="col-span-2 sm:col-span-1 justify-center px-4 py-2.5 bg-ink hover:bg-ink-800 text-paper rounded-xl font-mono text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-marigold" />
              <span>Export PDF / Print</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
