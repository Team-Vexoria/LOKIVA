'use client';

import React from 'react';
import { CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface WhyFitsBadgeProps {
  bullets?: string[];
  reasons?: string[];
  score?: number;
  variant?: 'compact' | 'detailed';
}

export function WhyFitsBadge({ bullets, reasons, score, variant = 'compact' }: WhyFitsBadgeProps) {
  const items = bullets || reasons || [];
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-3 my-2 text-xs">
      <div className="flex items-center justify-between font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          <span>Why this fits you</span>
        </div>
        {score && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {Math.round(score * 100)}% match
          </span>
        )}
      </div>
      <ul className="space-y-1">
        {items.slice(0, variant === 'compact' ? 3 : 4).map((bullet, idx) => {
          const cleanText = bullet.replace(/^[✓\s-]+/, '');
          return (
            <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300 leading-snug">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{cleanText}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
