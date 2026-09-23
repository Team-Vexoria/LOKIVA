import { useState, useEffect, useRef, useCallback } from 'react';

// Browser SpeechRecognition interface compatibility
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface UseVoiceInputOptions {
  onFinalTranscript?: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  lang?: string;
}

export interface UseVoiceInputResult {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  submitListening: () => void;
  cancelListening: () => void;
  resetTranscript: () => void;
  error: string | null;
  isSupported: boolean;
}

/**
 * Eliminates consecutive duplicate word sequences of any length (e.g. phrases, words)
 */
export function deduplicatePhrases(text: string): string {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) return text.trim();

  let changed = true;
  while (changed) {
    changed = false;
    for (let phraseLen = Math.floor(words.length / 2); phraseLen >= 1; phraseLen--) {
      for (let i = 0; i <= words.length - 2 * phraseLen; i++) {
        let isRepeat = true;
        for (let j = 0; j < phraseLen; j++) {
          if (words[i + j].toLowerCase() !== words[i + phraseLen + j].toLowerCase()) {
            isRepeat = false;
            break;
          }
        }
        if (isRepeat) {
          words.splice(i + phraseLen, phraseLen);
          changed = true;
          break;
        }
      }
      if (changed) break;
    }
  }

  return words.join(' ');
}

/**
 * Intelligent Speech Transcript Cleaner:
 * 1. Eliminates consecutive duplicate phrases and word stuttering
 * 2. Corrects common Indian English travel acoustic homophones
 * 3. Normalizes spacing and capitalization
 */
export function cleanSpeechTranscript(raw: string): string {
  if (!raw) return '';
  let text = deduplicatePhrases(raw);

  // Common Indian English travel acoustic & homophone corrections:
  // "give me identity" / "plan identity" / "2 days identity" -> "itinerary"
  text = text.replace(
    /\b(give me|make an?|plan an?|suggest an?|create an?|for an?|the|my|two days|2 days|3 days|three days|4 days|5 days|weekend)\s+identity\b/gi,
    '$1 itinerary'
  );
  text = text.replace(/\bidentity\s+for\s+(?:that|it|this|me)\b/gi, 'itinerary for that');
  text = text.replace(/\b(?:iterinary|iternary|itinary|itinery)\b/gi, 'itinerary');
  // "Hello Kiva" / "Hey Kiva" / "Hi Kiva" -> "Hello Lokiva"
  text = text.replace(/\b(hello|hey|hi)\s+kiva\b/gi, '$1 Lokiva');
  text = text.replace(/\bkiva\b/gi, 'Lokiva');
  // "for two version" / "two version" -> "for two persons"
  text = text.replace(/\b(for\s+)?(two|2|three|3|four|4|five|5)\s+version\b/gi, '$1$2 persons');

  // Normalize spaces
  text = text.replace(/\s+/g, ' ').trim();

  // Capitalize first letter
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return text;
}


export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputResult {
  const { onFinalTranscript, onInterimTranscript, lang = 'en-IN' } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const isRecognizingRef = useRef(false);
  const isUserIntentListeningRef = useRef(false);
  const isSubmittingRef = useRef(false);

  // Cumulative confirmed speech across auto-restarts within the active voice turn
  const accumulatedSpeechRef = useRef('');
  // Confirmed final speech for the current recognition session
  const currentSessionConfirmedRef = useRef('');
  // Latest unified live speech string for the entire voice turn
  const currentLiveSpeechRef = useRef('');

  const silenceTimerRef = useRef<any>(null);
  const restartTimerRef = useRef<any>(null);
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  const onInterimTranscriptRef = useRef(onInterimTranscript);

  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
    onInterimTranscriptRef.current = onInterimTranscript;
  });

  const finalizeAndSubmit = useCallback((explicitText?: string) => {
    if (isSubmittingRef.current) return;
    if (!isUserIntentListeningRef.current && !explicitText) return;
    isSubmittingRef.current = true;
    isUserIntentListeningRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    const rawToSubmit = (explicitText !== undefined ? explicitText : currentLiveSpeechRef.current).trim();
    const toSubmit = cleanSpeechTranscript(rawToSubmit);

    // Instantly abort recognition to prevent trailing audio from restarting
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      isRecognizingRef.current = false;
    }

    setIsListening(false);
    setInterimTranscript('');
    accumulatedSpeechRef.current = '';
    currentSessionConfirmedRef.current = '';
    currentLiveSpeechRef.current = '';

    if (toSubmit) {
      console.log('[VOICE] Finalized clean speech submitted:', toSubmit);
      setTranscript(toSubmit);
      if (onFinalTranscriptRef.current) {
        onFinalTranscriptRef.current(toSubmit);
      }
    }

    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 400);
  }, []);

  useEffect(() => {
    // Check microphone permission
    if (navigator?.permissions?.query) {
      navigator.permissions
        .query({ name: 'microphone' as any })
        .then((permissionStatus) => {
          console.log('[VOICE] Microphone permission state:', permissionStatus.state);
        })
        .catch(() => {});
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      console.error('[VOICE] SpeechRecognition API is not supported in this browser');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('[VOICE] SpeechRecognition engine started');
        isRecognizingRef.current = true;
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let sessionConfirmed = '';
        let sessionInterim = '';

        // Iterate over the complete results list of THIS recognition session
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const segment = (res[0]?.transcript || '').trim();
          if (!segment) continue;

          if (res.isFinal) {
            sessionConfirmed = sessionConfirmed ? `${sessionConfirmed} ${segment}` : segment;
          } else {
            sessionInterim = sessionInterim ? `${sessionInterim} ${segment}` : segment;
          }
        }

        // Keep current session's confirmed text
        currentSessionConfirmedRef.current = sessionConfirmed;

        // Prefix with speech accumulated across earlier restarts in this same turn
        const prefix = accumulatedSpeechRef.current;
        const confirmedTurnRaw = prefix
          ? (sessionConfirmed ? `${prefix} ${sessionConfirmed}` : prefix)
          : sessionConfirmed;

        const liveTurnRaw = sessionInterim
          ? (confirmedTurnRaw ? `${confirmedTurnRaw} ${sessionInterim}` : sessionInterim)
          : confirmedTurnRaw;

        // Clean speech through deduplication and Indian travel homophone filter
        const cleanLive = cleanSpeechTranscript(liveTurnRaw);
        const cleanConfirmed = cleanSpeechTranscript(confirmedTurnRaw);

        if (cleanLive) {
          currentLiveSpeechRef.current = cleanLive;
          setTranscript(cleanConfirmed);
          setInterimTranscript(cleanLive);
          if (onInterimTranscriptRef.current) {
            onInterimTranscriptRef.current(cleanLive);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.log('[VOICE] recognition error status:', event.error);
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }
        setError(event.message || `Microphone error: ${event.error}`);
        isUserIntentListeningRef.current = false;
        isRecognizingRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        isRecognizingRef.current = false;
        console.log('[VOICE] recognition stream ended. userIntent:', isUserIntentListeningRef.current);

        // If user still intends to be recording, preserve all live speech captured so far
        if (isUserIntentListeningRef.current) {
          // Commit everything said up to this point so next session appends to it seamlessly
          if (currentLiveSpeechRef.current) {
            accumulatedSpeechRef.current = cleanSpeechTranscript(currentLiveSpeechRef.current);
            currentSessionConfirmedRef.current = '';
          }

          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isUserIntentListeningRef.current && !isRecognizingRef.current) {
              try {
                console.log('[VOICE] Restarting recognition stream to continue capturing speech');
                recognition.start();
                isRecognizingRef.current = true;
              } catch (startErr) {
                console.warn('[VOICE] Safe restart note:', startErr);
              }
            }
          }, 80);
          return;
        }

        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      setIsSupported(false);
      console.error('[VOICE] Speech recognition init error:', err);
      setError(err?.message || 'Failed to initialize speech recognition');
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      isRecognizingRef.current = false;
    };
  }, [lang, finalizeAndSubmit]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    accumulatedSpeechRef.current = '';
    currentSessionConfirmedRef.current = '';
    currentLiveSpeechRef.current = '';
    isUserIntentListeningRef.current = true;
    isSubmittingRef.current = false;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);

    if (!isRecognizingRef.current) {
      try {
        recognitionRef.current.start();
        isRecognizingRef.current = true;
        setIsListening(true);
      } catch (err: any) {
        console.warn('[VOICE] startListening caught:', err);
        if (err?.name === 'InvalidStateError') {
          isRecognizingRef.current = true;
          setIsListening(true);
        }
      }
    } else {
      setIsListening(true);
    }
  }, []);

  const submitListening = useCallback(() => {
    finalizeAndSubmit();
  }, [finalizeAndSubmit]);

  const cancelListening = useCallback(() => {
    isUserIntentListeningRef.current = false;
    isSubmittingRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      isRecognizingRef.current = false;
    }
    setIsListening(false);
    setInterimTranscript('');
    accumulatedSpeechRef.current = '';
    currentSessionConfirmedRef.current = '';
    currentLiveSpeechRef.current = '';
  }, []);

  const stopListening = useCallback(() => {
    if (isSubmittingRef.current) return;
    if (isUserIntentListeningRef.current && currentLiveSpeechRef.current.trim()) {
      finalizeAndSubmit();
    } else {
      cancelListening();
    }
  }, [finalizeAndSubmit, cancelListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    accumulatedSpeechRef.current = '';
    currentSessionConfirmedRef.current = '';
    currentLiveSpeechRef.current = '';
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    submitListening,
    cancelListening,
    resetTranscript,
    error,
    isSupported,
  };
}
