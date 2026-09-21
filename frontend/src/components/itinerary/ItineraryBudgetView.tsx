import React from 'react';
import {
  Coins,
  TrendingUp,
  PieChart,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Heart,
} from 'lucide-react';
import { ItineraryDay, ItineraryTripDetails, ItineraryPracticalInfo } from '../../types/itinerary';

interface ItineraryBudgetViewProps {
  days: ItineraryDay[];
  tripDetails: ItineraryTripDetails;
  practicalInfo?: ItineraryPracticalInfo;
}

export function ItineraryBudgetView({ days, tripDetails }: ItineraryBudgetViewProps) {
  const travelers = Math.max(1, tripDetails.travelers || 2);
  const allActivities = days.flatMap((d) => d.activities);
  const totalExperiencesCost = allActivities.reduce(
    (sum, act) => sum + (act.costPerPerson || 0) * travelers,
    0
  );
  const totalTransitCost = allActivities.reduce((sum, act) => sum + (act.transitCost || 0), 0);
  const totalMealsCost = days.length * 800 * travelers;
  const grandTotal = totalExperiencesCost + totalTransitCost + totalMealsCost;
  const perPersonCost = Math.round(grandTotal / travelers);

  const budgetCeiling = tripDetails.totalBudgetLimit || 25000;
  const budgetUtilization = Math.min(100, Math.round((grandTotal / budgetCeiling) * 100));
  const isUnderBudget = grandTotal <= budgetCeiling;

  const expPercent = Math.max(1, Math.round((totalExperiencesCost / Math.max(1, grandTotal)) * 100));
  const mealsPercent = Math.max(1, Math.round((totalMealsCost / Math.max(1, grandTotal)) * 100));
  const transitPercent = Math.max(1, 100 - expPercent - mealsPercent);

  const localDirectAmount = Math.round(
    totalExperiencesCost * 0.95 + totalTransitCost * 0.9 + totalMealsCost * 0.85
  );
  const localImpactPercent = Math.min(
    96,
    Math.max(75, Math.round((localDirectAmount / Math.max(1, grandTotal)) * 100))
  );

  return (
    <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] p-5 sm:p-7 space-y-6 shadow-sm text-ink">
      <div className="space-y-1 pb-4 border-b border-[#E5DFD5]">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-ink">
          Itinerary Budget & Financial Audit
        </h2>
        <p className="text-xs text-dusk font-sans">
          Comprehensive cost audit comparing activity tickets, regional dining, and local auto transfers.
        </p>
      </div>

      {/* Top Budget Meter Card */}
      <div className="p-5 bg-white rounded-xl border border-[#E5DFD5] space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-dusk">
              Budget Target vs Planned Total
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-black text-ink">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-mono text-dusk">
                / ₹{budgetCeiling.toLocaleString('en-IN')} Target Limit
              </span>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 self-start sm:self-auto ${
              isUnderBudget
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            {isUnderBudget ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Under Target ({100 - budgetUtilization}% Headroom)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Exceeds Target by ₹{(grandTotal - budgetCeiling).toLocaleString('en-IN')}</span>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-3 w-full bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E5DFD5]">
            <div
              style={{ width: `${Math.min(100, budgetUtilization)}%` }}
              className={`h-full transition-all duration-500 ${
                isUnderBudget ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-dusk pt-0.5">
            <span>₹0</span>
            <span>{budgetUtilization}% Allocated</span>
            <span>₹{budgetCeiling.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
        <div className="bg-white p-4 rounded-xl border border-[#E5DFD5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink">Cultural Experiences</span>
            <span className="font-mono text-[#C1443B] font-bold">{expPercent}%</span>
          </div>
          <div className="text-xl font-display font-bold text-ink">
            ₹{totalExperiencesCost.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-dusk">
            Entry tickets, workshops, and verified guided walks.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5DFD5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink">Regional Dining</span>
            <span className="font-mono text-[#FFC067] font-bold">{mealsPercent}%</span>
          </div>
          <div className="text-xl font-display font-bold text-ink">
            ₹{totalMealsCost.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-dusk">
            Authentic breakfast, thali meals, and tea stalls.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5DFD5] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-ink">Local Transit</span>
            <span className="font-mono text-[#12213B] font-bold">{transitPercent}%</span>
          </div>
          <div className="text-xl font-display font-bold text-ink">
            ₹{totalTransitCost.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-dusk">
            Auto-rickshaws, metered taxis, and boat transfers.
          </p>
        </div>
      </div>

      {/* Local Impact Banner */}
      <div className="p-4 bg-white rounded-xl border border-[#E5DFD5] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-emerald-600 shrink-0 fill-emerald-50" />
          <div className="space-y-0.5">
            <strong className="text-xs font-heading font-bold text-ink block">
              {localImpactPercent}% Direct Local Heritage Impact
            </strong>
            <p className="text-[11px] text-dusk">
              Approximately ₹{localDirectAmount.toLocaleString('en-IN')} goes directly to artisan guilds and local hosts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
