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
} from 'lucide-react';
import { ItineraryDay, ItineraryTripDetails, ItineraryPracticalInfo } from '../../types/itinerary';

interface TripSummarySidebarProps {
  tripDetails: ItineraryTripDetails;
  days: ItineraryDay[];
  practicalInfo: ItineraryPracticalInfo;
  onShare: () => void;
  onPrint: () => void;
}

export function TripSummarySidebar({
  tripDetails,
  days,
  practicalInfo,
  onShare,
  onPrint,
}: TripSummarySidebarProps) {
  // Aggregate calculations
  const allActivities = days.flatMap((d) => d.activities);
  const totalExperiencesCost = allActivities.reduce((sum, act) => sum + act.costPerPerson, 0);
  const totalTransitCost = allActivities.reduce((sum, act) => sum + act.transitCost, 0);
  // Estimate realistic daily culinary spend (e.g. ~₹800/day/traveler for authentic regional meals)
  const totalMealsCost = days.length * 850 * tripDetails.travelers;
  const grandTotal = totalExperiencesCost + totalTransitCost + totalMealsCost;
  const perPersonTotal = Math.round(grandTotal / Math.max(1, tripDetails.travelers));

  // Percentage breakdown
  const expPercent = Math.round((totalExperiencesCost / Math.max(1, grandTotal)) * 100);
  const mealsPercent = Math.round((totalMealsCost / Math.max(1, grandTotal)) * 100);
  const transitPercent = Math.max(1, 100 - expPercent - mealsPercent);

  // Booking status counters
  const confirmedCount = allActivities.filter((a) => a.bookingStatus === 'confirmed').length;
  const pendingCount = allActivities.filter((a) => a.bookingStatus === 'pending').length;
  const availableCount = allActivities.filter((a) => a.bookingStatus === 'available').length;

  return (
    <aside className="space-y-6 sticky top-24">
      {/* Trip Summary Card */}
      <div className="bg-white rounded-3xl border border-paper-400 p-6 space-y-6 shadow-sm">
        <div className="space-y-1 pb-4 border-b border-paper-300">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-dusk block">
            Trip Summary
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-display font-bold text-ink">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-mono text-teal font-bold">
              {days.length} Days · {Math.max(1, days.length - 1)} Nights
            </span>
          </div>
          <span className="text-xs font-mono text-dusk-600 block">
            ₹{perPersonTotal.toLocaleString('en-IN')} per person for {tripDetails.travelers} {tripDetails.travelers === 1 ? 'traveler' : 'travelers'}
          </span>
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-marigold" />
              <span>Cost Breakdown</span>
            </span>
            <span className="text-dusk text-[10px]">Est. Totals</span>
          </div>

          {/* Visual Stacked Progress Bar */}
          <div className="h-2.5 w-full bg-paper-200 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${expPercent}%` }}
              className="bg-teal h-full transition-all"
              title={`Experiences: ${expPercent}%`}
            />
            <div
              style={{ width: `${mealsPercent}%` }}
              className="bg-marigold h-full transition-all"
              title={`Meals & Dining: ${mealsPercent}%`}
            />
            <div
              style={{ width: `${transitPercent}%` }}
              className="bg-sand-400 h-full transition-all"
              title={`Transport: ${transitPercent}%`}
            />
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal shrink-0" />
                <span className="text-ink">Experiences & Sites</span>
              </div>
              <span className="font-bold text-ink">
                ₹{totalExperiencesCost.toLocaleString('en-IN')} ({expPercent}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-marigold shrink-0" />
                <span className="text-ink">Regional Meals & Cafes</span>
              </div>
              <span className="font-bold text-ink">
                ₹{totalMealsCost.toLocaleString('en-IN')} ({mealsPercent}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sand-400 shrink-0" />
                <span className="text-ink">Local Rickshaws & Cabs</span>
              </div>
              <span className="font-bold text-ink">
                ₹{totalTransitCost.toLocaleString('en-IN')} ({transitPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Booking Status Breakdown */}
        <div className="space-y-3 pt-4 border-t border-paper-300 font-mono text-xs">
          <span className="font-bold text-ink uppercase tracking-wider text-[11px] block">
            Booking Status
          </span>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Confirmed Reservations</span>
              </div>
              <span className="font-bold">{confirmedCount}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending Approvals</span>
              </div>
              <span className="font-bold">{pendingCount}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-blue-50 text-blue-900 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                <span>Available to Book</span>
              </div>
              <span className="font-bold">{availableCount}</span>
            </div>
          </div>
        </div>

        {/* Practical Destination Info */}
        <div className="space-y-3 pt-4 border-t border-paper-300 text-xs">
          <span className="font-mono font-bold text-ink uppercase tracking-wider text-[11px] block">
            Practical Travel Info
          </span>

          <div className="space-y-2.5 text-ink-700 font-sans">
            <div className="flex items-start gap-2.5">
              <CloudSun className="w-4 h-4 text-marigold shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block font-mono text-ink text-[11px]">
                  Weather Forecast
                </span>
                <span className="text-dusk-600 text-xs">
                  {practicalInfo.temperature} · {practicalInfo.weatherSummary}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Luggage className="w-4 h-4 text-teal shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block font-mono text-ink text-[11px]">
                  Packing Advice
                </span>
                <span className="text-dusk-600 text-xs">
                  {practicalInfo.packingList.join(', ')}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Accessibility className="w-4 h-4 text-ink-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block font-mono text-ink text-[11px]">
                  Mobility & Access
                </span>
                <span className="text-dusk-600 text-xs">
                  {practicalInfo.accessibilityNotes}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Car className="w-4 h-4 text-teal shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block font-mono text-ink text-[11px]">
                  Local Transit
                </span>
                <span className="text-dusk-600 text-xs">
                  {practicalInfo.transitNotes}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Languages className="w-4 h-4 text-marigold shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block font-mono text-ink text-[11px]">
                  Languages
                </span>
                <span className="text-dusk-600 text-xs">
                  {practicalInfo.languages.join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-paper-300">
          <button
            type="button"
            onClick={onShare}
            className="w-full py-2.5 bg-paper-100 hover:bg-paper-200 text-ink rounded-xl font-mono text-xs font-bold transition border border-paper-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-dusk" />
            <span>Share with Travel Companions</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="w-full py-2.5 bg-ink hover:bg-ink-800 text-paper rounded-xl font-mono text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-marigold" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
