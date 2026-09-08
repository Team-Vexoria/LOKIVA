import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, MapPin, Clock, Info } from 'lucide-react';

interface AccessibilityItem {
  id: string;
  title: string;
  area: string;
  category: string;
  duration: string;
  price: string;
  wheelchairAccessible: boolean;
  accessDetail: string;
}

export function AccessibilityConstraintProof() {
  const [wheelchairRequired, setWheelchairRequired] = useState(true);

  const items: AccessibilityItem[] = [
    {
      id: 'exp-1',
      title: 'Ranwar Village Heritage Stroll & Bakeries',
      area: 'Bandra West',
      category: 'Heritage Walk',
      duration: '45 mins',
      price: '₹350 / pax',
      wheelchairAccessible: true,
      accessDetail: 'Paved street level, zero steps, ramped heritage bakeries',
    },
    {
      id: 'exp-2',
      title: 'Mount Mary Historic Steps & Hilltop Vista',
      area: 'Mount Mary, Bandra',
      category: 'Scenic Trail',
      duration: '40 mins',
      price: '₹200 / pax',
      wheelchairAccessible: false,
      accessDetail: '42 stone steps, no elevator or ramp available',
    },
    {
      id: 'exp-3',
      title: 'Pali Hill Organic Pottery Atelier & Tea Lounge',
      area: 'Pali Hill, Bandra',
      category: 'Artisan Workshop',
      duration: '60 mins',
      price: '₹450 / pax',
      wheelchairAccessible: true,
      accessDetail: 'Ground floor entrance, 36" wide doorways, step-free',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md text-ink">
      {/* Proof Header & Filter Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-paper-300">
        <div className="space-y-1">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-dusk">
            Hard Pre-Filter: Filtered Before Scoring
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-ink">
            Accessibility as a Hard Constraint
          </h3>
        </div>

        {/* Toggle Switch */}
        <label className="flex items-center gap-3 cursor-pointer select-none bg-paper-100 p-2.5 px-4 rounded-2xl border border-paper-300 hover:bg-paper-200 transition">
          <div className="relative">
            <input
              type="checkbox"
              checked={wheelchairRequired}
              onChange={(e) => setWheelchairRequired(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors ${
                wheelchairRequired ? 'bg-teal' : 'bg-paper-400'
              }`}
            />
            <div
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                wheelchairRequired ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
          <span className="text-xs font-mono font-bold text-ink flex items-center gap-1.5">
            <span>Wheelchair Access Required</span>
          </span>
        </label>
      </div>

      {/* Proof Explanation Note */}
      <div className="p-3.5 bg-paper-100 rounded-2xl border border-paper-300 text-xs text-dusk-700 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
        <p className="font-sans leading-relaxed">
          Competitors rank accessibility alongside star ratings, meaning an inaccessible 5-star venue still gets suggested. In LOKIVA, inaccessible candidates are <strong>strictly filtered out of the solver</strong> before packing begins.
        </p>
      </div>

      {/* Cards Grid Showing Visible Rejection vs Feasibility */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item) => {
          const isFailing = wheelchairRequired && !item.wheelchairAccessible;

          return (
            <motion.div
              key={item.id}
              animate={{
                opacity: isFailing ? 0.45 : 1,
                scale: isFailing ? 0.97 : 1,
                y: isFailing ? 4 : 0,
              }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow-sm transition-colors ${
                isFailing
                  ? 'bg-paper-200 border-paper-400 grayscale'
                  : 'bg-paper-50 border-paper-300 hover:border-ink/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-dusk uppercase text-[10px]">{item.category}</span>
                  <span className="font-bold text-ink">{item.price}</span>
                </div>

                <h4 className="text-base font-display font-bold text-ink leading-snug">
                  {item.title}
                </h4>

                <div className="text-xs font-mono text-dusk flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-marigold" />
                    {item.area}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal" />
                    {item.duration}
                  </span>
                </div>

                <p className="text-xs text-dusk-600 font-sans leading-relaxed">
                  {item.accessDetail}
                </p>
              </div>

              {/* Status Badge */}
              <div
                className={`p-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 ${
                  isFailing
                    ? 'bg-clay-100 text-clay-900 border border-clay-300'
                    : 'bg-teal-50 text-teal-900 border border-teal-200'
                }`}
              >
                {isFailing ? (
                  <>
                    <XCircle className="w-4 h-4 text-clay" />
                    <span>Hard Filter Rejected (Steps)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-teal" />
                    <span>Feasible (Step-Free Verified)</span>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
