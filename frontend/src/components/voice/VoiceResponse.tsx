import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';
import {
  getPreferredVoice,
  loadVoicesAsync,
  getVoiceStatusLabel,
  checkHostedTTSConfigured,
  speakWithElevenLabsOrFallback,
  PlaybackController,
  VoiceStatusInfo,
} from '../../lib/tts';

export interface VoiceResponseProps {
  text: string;
  autoPlay?: boolean;
  onFinishedSpeaking?: () => void;
  className?: string;
  categoryTag?: string;
}

export { getPreferredVoice as getIndianEnglishVoice };

export const VoiceResponse: React.FC<VoiceResponseProps> = ({
  text,
  autoPlay = true,
  onFinishedSpeaking,
  className = '',
  categoryTag,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatusInfo | null>(null);
  const playbackControllerRef = useRef<PlaybackController | null>(null);

  const speakText = (content: string) => {
    if (!content || content.trim() === '') return;

    if (playbackControllerRef.current) {
      playbackControllerRef.current.stop();
      playbackControllerRef.current = null;
    }

    playbackControllerRef.current = speakWithElevenLabsOrFallback({
      text: content,
      onStart: () => {
        setIsSpeaking(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        playbackControllerRef.current = null;
        if (onFinishedSpeaking) {
          onFinishedSpeaking();
        }
      },
      onError: () => {
        setIsSpeaking(false);
        playbackControllerRef.current = null;
      },
      onEngineUsed: (engine) => {
        setVoiceStatus(getVoiceStatusLabel(engine));
      },
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsSupported(false);
      return;
    }

    let isMounted = true;
    loadVoicesAsync().then(async () => {
      if (!isMounted) return;
      const isConfigured = await checkHostedTTSConfigured();
      if (!isMounted) return;
      setVoiceStatus(getVoiceStatusLabel(isConfigured ? 'elevenlabs' : 'browser_fallback'));

      if (autoPlay && text && text.trim() !== '') {
        speakText(text);
      }
    });

    return () => {
      isMounted = false;
      if (playbackControllerRef.current) {
        playbackControllerRef.current.stop();
        playbackControllerRef.current = null;
      }
    };
  }, [text, autoPlay]);

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      if (playbackControllerRef.current) {
        playbackControllerRef.current.stop();
        playbackControllerRef.current = null;
      }
      setIsSpeaking(false);
    } else {
      speakText(text);
    }
  };

  const handleReplay = () => {
    speakText(text);
  };

  if (!text) return null;

  return (
    <div
      className={`relative bg-[#FAF7F2] border border-[#E5DFD5] rounded-2xl p-4 shadow-sm transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#C1443B]/10 flex items-center justify-center text-[#C1443B]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-heading font-bold text-ink uppercase tracking-wider">
            Lokiva Voice Assistant
          </span>
          {categoryTag && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF0E6] text-[#C1443B] border border-[#E5DFD5]">
              {categoryTag}
            </span>
          )}
        </div>

        {isSupported && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleSpeak}
              title={isSpeaking ? 'Mute' : 'Play audio'}
              className={`p-1.5 rounded-lg border transition ${
                isSpeaking
                  ? 'bg-[#C1443B] text-white border-[#C1443B] animate-pulse'
                  : 'bg-white text-ink hover:text-[#C1443B] border-[#E5DFD5]'
              }`}
            >
              {isSpeaking ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleReplay}
              title="Replay speech"
              className="p-1.5 rounded-lg bg-white text-ink hover:text-[#C1443B] border border-[#E5DFD5] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <p className="text-sm font-sans text-ink leading-relaxed whitespace-pre-wrap">
        {text}
      </p>

      {isSpeaking && (
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#E5DFD5]/60">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C1443B] animate-ping" />
            <span className="text-[11px] font-mono font-medium text-[#C1443B]">
              Speaking response...
            </span>
          </div>
          {voiceStatus && (
            <span className="text-[10px] font-mono text-dusk-500">
              {voiceStatus.name}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
