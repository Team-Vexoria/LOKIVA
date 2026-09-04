import React from 'react';
import {
  Coins,
  TrendingUp,
  PieChart,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { ItineraryDay, ItineraryTripDetails } from '../../types/itinerary';

interface ItineraryBudgetViewProps {
  days: ItineraryDay[];
  tripDetails: ItineraryTripDetails;
}

export function ItineraryBudgetView({ days, tripDetails }: ItineraryBudgetViewProps) {
  const allActivities = days.flatMap((d) => d.activities);
  const totalExperiencesCost = allActivities.reduce((sum, act) => sum + act.costPerPerson, 0);
  const totalTransitCost = allActivities.reduce((sum, act) => sum + act.transitCost, 0);
  const totalMealsCost = days.length * 850 * tripDetails.travelers;
  const grandTotal = totalExperiencesCost + totalTransitCost + totalMealsCost;
  const perPersonCost = Math.round(grandTotal / Math.max(1, tripDetails.travelers));

  const budgetCeiling = tripDetails.totalBudgetLimit || 20000;
  const budgetUtilization = Math.min(100, Math.round((grandTotal / budgetCeiling) * 100));
  const isUnderBudget = grandTotal <= budgetCeiling;

  const expPercent = Math.round((totalExperiencesCost / Math.max(1, grandTotal)) * 100);
  const mealsPercent = Math.round((totalMealsCost / Math.max(1, grandTotal)) * 100);
  const transitPercent = Math.max(1, 100 - expPercent - mealsPercent);

  return (
    <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-8 shadow-sm">
      <div className="space-y-1 pb-4 border-b border-paper-200">
        <h2 className="text-xl sm:text-2xl font-display font-bold text-ink">
          Itinerary Budget & Expense Analysis
        </h2>
        <p className="text-xs text-dusk-600 font-sans">
          Comprehensive cost audit comparing activity tickets, regional dining, and local auto transfers.
        </p>
      </div>

      {/* Top Budget Meter Card */}
      <div className="p-6 bg-paper-100/80 rounded-2xl border border-paper-300 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-dusk">
              Budget Target vs Planned
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold text-ink">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-mono text-dusk">
                / ₹{budgetCeiling.toLocaleString('en-IN')} Target Limit
              </span>
            </div>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 self-start sm:self-auto ${
              isUnderBudget
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
          >
            {isUnderBudget ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Under Budget ({100 - budgetUtilization}% Headroom)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Over Budget by ₹{(grandTotal - budgetCeiling).toLocaleString('en-IN')}</span>
              </>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-3 w-full bg-paper-300 rounded-full overflow-hidden shadow-inner">
            <div
              style={{ width: `${Math.min(100, budgetUtilization)}%` }}
              className={`h-full transition-all duration-500 ${
                isUnderBudget ? 'bg-teal' : 'bg-amber-500'
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
      <div className="space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-ink">
          Spend by Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-paper-300 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-dusk font-bold">Experiences</span>
              <span className="w-3 h-3 rounded-full bg-teal" />
            </div>
            <div className="text-2xl font-display font-bold text-ink">
              ₹{totalExperiencesCost.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-mono text-dusk-600">
              {expPercent}% of total · {allActivities.length} admissions & guided tours
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-paper-300 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-dusk font-bold">Meals & Tea Stops</span>
              <span className="w-3 h-3 rounded-full bg-marigold" />
            </div>
            <div className="text-2xl font-display font-bold text-ink">
              ₹{totalMealsCost.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-mono text-dusk-600">
              {mealsPercent}% of total · est. ₹850/day per traveler
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-paper-300 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-dusk font-bold">Transit & Cabs</span>
              <span className="w-3 h-3 rounded-full bg-sand-400" />
            </div>
            <div className="text-2xl font-display font-bold text-ink">
              ₹{totalTransitCost.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-mono text-dusk-600">
              {transitPercent}% of total · scenic auto-rickshaw transfers
            </p>
          </div>
        </div>
      </div>

      {/* Day by Day Cost Comparison */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-ink">
          Day-by-Day Cost Comparison
        </h3>

        <div className="space-y-3">
          {days.map((day) => {
            const dayExp = day.activities.reduce((sum, a) => sum + a.costPerPerson, 0);
            const dayTransit = day.activities.reduce((sum, a) => sum + a.transitCost, 0);
            const dayTotal = dayExp + dayTransit + 850 * tripDetails.travelers;
            const barWidth = Math.max(10, Math.round((dayTotal / Math.max(1, grandTotal)) * 100 * 2));

            return (
              <div key={day.dayNumber} className="p-4 bg-paper-50 rounded-2xl border border-paper-300 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">Day {day.dayNumber}</span>
                    <span className="text-dusk">({day.date})</span>
                    <span className="text-dusk-400">·</span>
                    <span className="font-medium text-ink-700">{day.title}</span>
                  </div>
                  <span className="font-bold text-teal text-sm">
                    ₹{dayTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="h-2 w-full bg-paper-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, barWidth)}%` }}
                    className="h-full bg-ink rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
