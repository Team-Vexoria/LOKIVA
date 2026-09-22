import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';

export interface VoiceResponseProps {
  text: string;
  autoPlay?: boolean;
  onFinishedSpeaking?: () => void;
  className?: string;
  categoryTag?: string;
}

/**
 * Selects the highest quality Indian English voice available in the browser.
 */
export function getIndianEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();

  // Best: exact en-IN locale match
  let match = voices.find((v) => v.lang === 'en-IN' || v.lang === 'en_IN');
  if (match) return match;

  // Known Indian-English voice names across platforms
  const knownNames = [
    'Microsoft Heera', // Windows, older
    'Microsoft Neerja', // Windows 10/11, natural-sounding
    'Google हिन्दी', // Android Chrome, Hindi/Indian
    'Veena', // macOS/iOS Indian English (female)
    'Rishi', // macOS Indian English (male)
  ];

  for (const name of knownNames) {
    match = voices.find((v) => v.name.includes(name));
    if (match) return match;
  }

  // Fallback: natural British English or international English voice
  return (
    voices.find((v) => v.lang.startsWith('en-IN')) ||
    voices.find((v) => v.lang === 'en-GB') ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null
  );
}

export const VoiceResponse: React.FC<VoiceResponseProps> = ({
  text,
  autoPlay = true,
  onFinishedSpeaking,
  className = '',
  categoryTag,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    if (!text || text.trim() === '') {
      return;
    }

    try {
      const cleanText = text.replace(/[\*\#_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-IN';

      // Pick the best Indian English voice across Windows, macOS, Android, and iOS
      const preferredVoice = getIndianEnglishVoice();
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onFinishedSpeaking) {
          onFinishedSpeaking();
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;

      if (autoPlay) {
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setIsSpeaking(false);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text, autoPlay, onFinishedSpeaking]);

  const handleToggleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utteranceRef.current);
    }
  };

  const handleReplay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (utteranceRef.current) {
      window.speechSynthesis.speak(utteranceRef.current);
    }
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
        <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-[#E5DFD5]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C1443B] animate-ping" />
          <span className="text-[11px] font-mono font-medium text-[#C1443B]">
            Speaking response...
          </span>
        </div>
      )}
    </div>
  );
};
