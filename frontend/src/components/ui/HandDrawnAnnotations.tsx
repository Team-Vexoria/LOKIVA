import React from 'react';
import { motion } from 'framer-motion';

// Organic hand-drawn marker underline in warm Marigold (#F0A63B)
export function SquiggleUnderline({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`overflow-visible pointer-events-none ${className}`}
      preserveAspectRatio="none"
    >
      <motion.path
        d="M 3 14 C 45 4, 85 20, 130 11 C 175 3, 215 18, 255 10 C 265 8, 275 12, 277 13"
        stroke="#F0A63B"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      />
      <motion.path
        d="M 12 18 C 55 11, 100 21, 148 15 C 195 9, 235 19, 270 14"
        stroke="#F4BA44"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
}

// Hand-drawn curved arrow pointing to CTA
export function HandDrawnArrow({
  className = '',
}: {
  className?: string;
  direction?: 'down-right' | 'up-right' | 'right';
}) {
  return (
    <svg
      width="56"
      height="32"
      viewBox="0 0 56 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-[#F0A63B] pointer-events-none overflow-visible ${className}`}
    >
      {/* Curved stroke swooping toward target button */}
      <path
        d="M 4 8 C 22 4, 38 12, 50 22"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Hand-drawn arrowhead pointing directly into the button */}
      <path
        d="M 40 20 L 51 23 L 47 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// Hand-drawn loop/circle to highlight selected chips
export function HandDrawnCircle({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-visible ${className}`}
      preserveAspectRatio="none"
    >
      <motion.path
        d="M 8 26 C 6 10, 40 4, 80 5 C 110 6, 118 18, 114 34 C 110 46, 75 48, 30 46 C 12 45, 4 34, 14 18"
        stroke="#F0A63B"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </svg>
  );
}

// Decorative marker star / sparkle
export function HandDrawnSparkle({ className = '' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-[#F0A63B] pointer-events-none ${className}`}
    >
      <path
        d="M 12 2 Q 13 9 20 12 Q 13 15 12 22 Q 11 15 4 12 Q 11 9 12 2 Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Hand-drawn sketchy stamp badge (organic single-stroke outline, no generic dashed pill)
export function StampBadge({
  text = 'VERIFIED FEASIBLE',
  className = '',
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-flex items-center gap-1.5 px-3.5 py-1 text-[#1F7A6C] font-mono text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest transform -rotate-1 select-none ${className}`}
    >
      {/* Hand-drawn sketchy outline with organic wobble and imperfect corners */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        viewBox="0 0 240 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M 6 4 C 65 2, 175 3, 234 5 C 236 13, 235 23, 233 30 C 175 32, 65 31, 6 29 C 4 21, 5 11, 6 4 Z"
          stroke="#1F7A6C"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-85"
        />
        <path
          d="M 12 31 C 80 30, 160 32, 230 29"
          stroke="#1F7A6C"
          strokeWidth="1"
          strokeLinecap="round"
          className="opacity-45"
        />
      </svg>
      <span className="text-xs text-[#F0A63B] relative z-10">✦</span>
      <span className="relative z-10">{text}</span>
    </div>
  );
}

// Dotted trail progress bar for the 8 onboarding steps
export function HandDrawnProgressTrail({
  currentStep,
  totalSteps = 8,
  onStepClick,
}: {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
}) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-xl mx-auto py-2">
      <div className="flex items-center justify-between relative">
        {/* Connecting dotted trail */}
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-0.5 border-t-2 border-dashed border-[#5B6B8C]/30 z-0" />

        {steps.map((step) => {
          const isDone = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <button
              key={step}
              type="button"
              onClick={() => onStepClick && step < currentStep && onStepClick(step)}
              disabled={step > currentStep}
              className={`relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                isCurrent
                  ? 'bg-[#F0A63B] text-[#12213B] ring-4 ring-[#F0A63B]/25 scale-110 shadow-sm'
                  : isDone
                  ? 'bg-[#1F7A6C] text-white cursor-pointer hover:scale-105'
                  : 'bg-[#EEF1EE] text-[#5B6B8C] border border-[#D0D7CF]'
              }`}
            >
              {isDone ? '✓' : step}
            </button>
          );
        })}
      </div>
    </div>
  );
}
