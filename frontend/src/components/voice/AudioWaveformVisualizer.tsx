import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface AudioWaveformVisualizerProps {
  isActive: boolean;
  className?: string;
  barCount?: number;
}

/**
 * Real-time Audio Waveform Visualizer
 * Connects directly to the user microphone stream via Web Audio API's AnalyserNode
 * to render live, amplitude-responsive frequency bars with LOKIVA terracotta/marigold palette.
 */
export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  isActive,
  className = '',
  barCount = 18,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [amplitudes, setAmplitudes] = useState<number[]>(() => new Array(barCount).fill(4));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive || typeof window === 'undefined') {
      // Cleanup on inactive
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setAmplitudes(new Array(barCount).fill(4));
      return;
    }

    let isSubscribed = true;

    async function initAudioStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!isSubscribed) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64; // 32 frequency bins
        analyser.smoothingTimeConstant = 0.75;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateWaveform = () => {
          if (!isSubscribed || !analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);

          // Sample bins across the vocal range (roughly bins 2 through 20)
          const newAmps: number[] = [];
          const step = Math.max(1, Math.floor(20 / barCount));

          for (let i = 0; i < barCount; i++) {
            const index = Math.min(2 + i * step, bufferLength - 1);
            const rawVal = dataArray[index] || 0;
            // Map 0-255 to min height 4px, max height 34px
            const normalized = Math.max(4, Math.round((rawVal / 255) * 34));
            newAmps.push(normalized);
          }

          setAmplitudes(newAmps);

          if (!shouldReduceMotion) {
            animationFrameRef.current = requestAnimationFrame(updateWaveform);
          }
        };

        animationFrameRef.current = requestAnimationFrame(updateWaveform);
      } catch (err) {
        console.warn('[Waveform] Could not connect mic audio analyser:', err);
        // Fallback to subtle idle state
        if (isSubscribed) {
          setAmplitudes(new Array(barCount).fill(6));
        }
      }
    }

    initAudioStream();

    return () => {
      isSubscribed = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isActive, barCount, shouldReduceMotion]);

  // Palette distribution across the bars: alternating terracotta, marigold, and amber tones
  const getBarColor = (index: number, amp: number) => {
    const isPeak = amp > 18;
    if (isPeak) return 'bg-[#C1443B]'; // Terracotta on vocal bursts
    if (index % 3 === 0) return 'bg-[#C1443B]'; // Terracotta
    if (index % 3 === 1) return 'bg-[#F0A63B]'; // Marigold
    return 'bg-[#E5A93C]'; // Warm amber
  };

  return (
    <div
      className={`flex items-center justify-center gap-[3px] sm:gap-1 h-9 px-1 ${className}`}
      aria-hidden="true"
    >
      {amplitudes.map((amp, idx) => (
        <span
          key={idx}
          className={`w-[3px] sm:w-1 rounded-full transition-all duration-75 ${getBarColor(idx, amp)}`}
          style={{
            height: `${amp}px`,
            opacity: amp > 6 ? 1 : 0.45,
          }}
        />
      ))}
    </div>
  );
};
