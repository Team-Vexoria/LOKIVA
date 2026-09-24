import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, X, Globe, Loader2 } from 'lucide-react';

export interface VoiceRecordingSheetProps {
  elapsedTime?: string;
  interimTranscript?: string;
  isTranscribing?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const VoiceRecordingSheet: React.FC<VoiceRecordingSheetProps> = ({
  elapsedTime = '00:00',
  interimTranscript = '',
  isTranscribing = false,
  onCancel,
  onSubmit,
}) => {
  // Harmonic bar height wave profile for fluid audio frequency animation
  const barHeights = [
    40, 75, 25, 90, 60, 30, 85, 45, 100, 65, 35, 80, 50, 25, 95, 70, 30, 60, 85, 40, 70, 55, 90, 45, 80, 35, 65, 50,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto bg-[#FAF7F2]/95 backdrop-blur-xl border border-[#E8DEC8] rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden"
    >
      {/* Warm ambient breathing radial glow */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-[#F0A63B]/15 rounded-full blur-3xl"
        aria-hidden="true"
      />

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C85A32] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C85A32]" />
          </span>
          <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#12213B]">
            {isTranscribing ? 'Translating' : 'Listening'}
          </span>
          <span className="text-xs text-dusk-600 font-mono">{elapsedTime}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0A63B]/10 border border-[#F0A63B]/30 text-[11px] font-heading font-semibold text-[#8C3A00]">
          <Globe className="w-3 h-3 text-[#C85A32]" />
          <span>English &amp; हिंदी</span>
        </div>
      </div>

      {/* Spoken Text Display Area */}
      <div className="min-h-[40px] flex items-center my-2">
        {isTranscribing ? (
          <div className="flex items-center gap-2 text-[#C85A32] text-sm font-heading font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-[#C85A32]" />
            <span>Translating audio...</span>
          </div>
        ) : interimTranscript ? (
          <p className="font-heading font-semibold text-base sm:text-lg text-[#12213B] leading-snug">
            {interimTranscript}
          </p>
        ) : (
          <p className="text-dusk-400 text-xs sm:text-sm font-sans">
            Listening...
          </p>
        )}
      </div>

      {/* Animated Sound Wave Visualizer & Actions */}
      <div className="flex items-center justify-between gap-4 pt-2.5 border-t border-[#EFE8DC]">
        {/* Slender vertical frequency wave bars */}
        <div className="flex items-end gap-1 h-7 px-1">
          {barHeights.map((h, i) => (
            <motion.div
              key={i}
              className="w-1 bg-gradient-to-t from-[#F0A63B] to-[#C85A32] rounded-full"
              animate={{
                height: isTranscribing
                  ? ['20%', '35%', '20%']
                  : [`${Math.max(15, h * 0.2)}%`, `${h}%`, `${Math.max(15, h * 0.2)}%`],
              }}
              transition={{
                duration: isTranscribing ? 1.0 : 0.5 + (i % 6) * 0.08,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-dusk-700 hover:text-ink hover:bg-[#EFE8DC]/60 text-xs font-heading font-semibold transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isTranscribing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B34E28] text-white text-xs font-heading font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {isTranscribing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <span>Solve with AI</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FFC067]" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
