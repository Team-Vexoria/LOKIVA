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
  const accumulatedSpeechRef = useRef('');
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
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    isUserIntentListeningRef.current = false;
    const toSubmit = (explicitText !== undefined ? explicitText : currentLiveSpeechRef.current).trim();

    if (recognitionRef.current && isRecognizingRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      isRecognizingRef.current = false;
    }

    setIsListening(false);
    setInterimTranscript('');

    if (toSubmit) {
      console.log('[VOICE] Finalized speech submitted:', toSubmit);
      setTranscript(toSubmit);
      if (onFinalTranscriptRef.current) {
        onFinalTranscriptRef.current(toSubmit);
      }
    }

    accumulatedSpeechRef.current = '';
    currentLiveSpeechRef.current = '';
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
        let sessionFinal = '';
        let sessionInterim = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            sessionFinal += text + ' ';
          } else {
            sessionInterim += text;
          }
        }

        const combinedConfirmed = (accumulatedSpeechRef.current + ' ' + sessionFinal).trim();
        const totalFull = (combinedConfirmed + ' ' + sessionInterim).trim();

        if (sessionFinal.trim()) {
          accumulatedSpeechRef.current = combinedConfirmed;
        }

        if (totalFull) {
          currentLiveSpeechRef.current = totalFull;
          setTranscript(combinedConfirmed);
          setInterimTranscript(totalFull);
          if (onInterimTranscriptRef.current) {
            onInterimTranscriptRef.current(totalFull);
          }
        }

        // Reset silence debounce timer on every new vocalization
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Generous 3500ms pause window before auto-submitting
        if (totalFull.length > 0 && isUserIntentListeningRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            console.log('[VOICE] 3500ms silence detected, auto-submitting:', totalFull);
            finalizeAndSubmit(totalFull);
          }, 3500);
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

        // If user still intends to be recording, auto-restart to prevent Chrome mid-sentence drop
        if (isUserIntentListeningRef.current) {
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
    currentLiveSpeechRef.current = '';
    isUserIntentListeningRef.current = true;

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

  const stopListening = useCallback(() => {
    finalizeAndSubmit();
  }, [finalizeAndSubmit]);

  const cancelListening = useCallback(() => {
    isUserIntentListeningRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    if (recognitionRef.current && isRecognizingRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      isRecognizingRef.current = false;
    }
    setIsListening(false);
    setTranscript('');
    setInterimTranscript('');
    accumulatedSpeechRef.current = '';
    currentLiveSpeechRef.current = '';
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    accumulatedSpeechRef.current = '';
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
