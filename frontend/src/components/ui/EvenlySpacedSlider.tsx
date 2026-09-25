import React, { useMemo, useCallback } from 'react';

export interface Milestone {
  value: number;
  label: string;
}

interface EvenlySpacedSliderProps {
  milestones: Milestone[];
  value: number;
  onChange: (val: number) => void;
  /** Snap dragged values to this increment (e.g. 1 for days, 500 for currency) */
  granularity?: number;
  ariaLabel?: string;
}

/**
 * EvenlySpacedSlider
 *
 * Solves the non-linear milestone clustering problem via piecewise interpolation:
 *
 * Visual layer: milestones are placed at evenly spaced percentages
 *   tick_i  =  (i / (n - 1)) * 100 %
 *
 * Value layer: dragging inside interval [i, i+1] interpolates the real value
 *   val = milestones[i].value + progress * (milestones[i+1].value - milestones[i].value)
 *
 * This means:
 *   - Ticks never cluster together regardless of how non-linear milestone values are
 *   - Dragging feels continuous and smooth within each interval
 *   - The thumb sits directly under the closest label when at a milestone value
 */
export function EvenlySpacedSlider({
  milestones,
  value,
  onChange,
  granularity = 1,
  ariaLabel,
}: EvenlySpacedSliderProps) {
  const n = milestones.length;
  const slicePercent = 100 / (n - 1);

  // ── 1. Real value → visual percentage (0-100) ──────────────────────────────
  const percentage = useMemo(() => {
    if (value <= milestones[0].value) return 0;
    if (value >= milestones[n - 1].value) return 100;

    // Find which interval [i, i+1] the value lives in
    let idx = 0;
    for (let i = 0; i < n - 1; i++) {
      if (value >= milestones[i].value && value <= milestones[i + 1].value) {
        idx = i;
        break;
      }
    }

    const valStart = milestones[idx].value;
    const valEnd   = milestones[idx + 1].value;
    const progress = valEnd === valStart ? 0 : (value - valStart) / (valEnd - valStart);

    return idx * slicePercent + progress * slicePercent;
  }, [value, milestones, n, slicePercent]);

  // ── 2. Visual percentage → real interpolated value ─────────────────────────
  const handleRangeChange = useCallback(
    (targetPercent: number) => {
      const rawIdx  = targetPercent / slicePercent;
      const idx     = Math.min(Math.floor(rawIdx), n - 2);
      const progress = (targetPercent - idx * slicePercent) / slicePercent;

      const valStart = milestones[idx].value;
      const valEnd   = milestones[idx + 1].value;
      let computed   = valStart + progress * (valEnd - valStart);

      // Snap to granularity then clamp to full range
      computed = Math.round(computed / granularity) * granularity;
      onChange(Math.max(milestones[0].value, Math.min(milestones[n - 1].value, computed)));
    },
    [milestones, n, slicePercent, granularity, onChange]
  );

  return (
    <div className="relative w-full py-2 select-none">
      {/* ── Track ─────────────────────────────────────────────── */}
      <div className="relative w-full h-2 rounded-full bg-[#EFE8DC]">
        {/* Filled portion */}
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-[#C85A32] pointer-events-none transition-all duration-75"
          style={{ width: `${percentage}%` }}
        />

        {/* Invisible native input - 0 to 100 as percentage units */}
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={percentage}
          onChange={(e) => handleRangeChange(parseFloat(e.target.value))}
          aria-label={ariaLabel}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 m-0"
        />

        {/* Custom visual thumb */}
        <div
          className="absolute top-1/2 z-10 w-5 h-5 rounded-full bg-[#C85A32] border-2 border-white shadow-md pointer-events-none transition-all duration-75"
          style={{ left: `${percentage}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      {/* ── Evenly spaced tick marks and labels ───────────────── */}
      <div className="relative w-full mt-4" style={{ height: '1.875rem' }}>
        {milestones.map((m, idx) => {
          // Visual position: always evenly distributed regardless of value scale
          const tickPct  = (idx / (n - 1)) * 100;
          const isActive = value >= m.value;
          const isExact  = Math.abs(value - m.value) < granularity;

          // Keep edge labels inside the container
          let translateX = '-50%';
          if (idx === 0)     translateX = '0%';
          if (idx === n - 1) translateX = '-100%';

          return (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange(m.value)}
              className="absolute top-0 flex flex-col items-center cursor-pointer group"
              style={{ left: `${tickPct}%`, transform: `translateX(${translateX})` }}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full mb-1.5 transition-colors duration-150 ${
                  isActive ? 'bg-[#C85A32]' : 'bg-[#D5CAB8]'
                }`}
              />
              <span
                className={`text-[11px] font-mono whitespace-nowrap transition-colors duration-150 ${
                  isExact
                    ? 'text-[#C85A32] font-semibold underline underline-offset-4'
                    : 'text-[#8A8177] group-hover:text-[#12213B]'
                }`}
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
