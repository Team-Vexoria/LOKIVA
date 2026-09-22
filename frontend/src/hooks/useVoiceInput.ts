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
  lang?: string;
}

export interface UseVoiceInputResult {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
  isSupported: boolean;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputResult {
  const { onFinalTranscript, lang = 'en-IN' } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const latestTranscriptRef = useRef('');
  const hasDispatchedTranscriptRef = useRef(false);
  const onFinalTranscriptRef = useRef(onFinalTranscript);

  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
  });

  useEffect(() => {
    // Check microphone permission explicitly on mount
    if (navigator?.permissions?.query) {
      navigator.permissions
        .query({ name: 'microphone' as any })
        .then((permissionStatus) => {
          console.log('[VOICE] permission status:', permissionStatus.state);
          permissionStatus.onchange = () => {
            console.log('[VOICE] permission status:', permissionStatus.state);
          };
        })
        .catch((permErr) => {
          console.warn('[VOICE] Permission query not supported or failed:', permErr);
        });
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      console.error('[VOICE] SpeechRecognition API is not supported in this browser environment');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('[VOICE] recognition started');
        hasDispatchedTranscriptRef.current = false;
        latestTranscriptRef.current = '';
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            currentFinal += text;
          } else {
            currentInterim += text;
          }
        }

        const transcriptText = (currentFinal || currentInterim).trim();
        console.log('[VOICE] onresult fired, transcript:', transcriptText);

        if (transcriptText) {
          latestTranscriptRef.current = transcriptText;
        }

        if (currentFinal) {
          const trimmed = currentFinal.trim();
          hasDispatchedTranscriptRef.current = true;
          setTranscript(trimmed);
          setInterimTranscript('');
          if (onFinalTranscriptRef.current) {
            onFinalTranscriptRef.current(trimmed);
          }
        } else {
          setInterimTranscript(currentInterim);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.log('[VOICE] error fired:', event.error);
        console.error('[VOICE] recognition error:', event.error);
        // 'no-speech' is a normal timeout event when user stays quiet
        if (event.error === 'no-speech') {
          setIsListening(false);
          setInterimTranscript('');
          return;
        }
        if (event.error === 'aborted') {
          setIsListening(false);
          return;
        }
        setError(event.message || `Microphone error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('[VOICE] recognition ended');
        setIsListening(false);
        setInterimTranscript('');

        // If speech was captured but ended before isFinal was marked, dispatch it now
        if (!hasDispatchedTranscriptRef.current && latestTranscriptRef.current) {
          const captured = latestTranscriptRef.current;
          hasDispatchedTranscriptRef.current = true;
          setTranscript(captured);
          if (onFinalTranscriptRef.current) {
            onFinalTranscriptRef.current(captured);
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      setIsSupported(false);
      console.error('[VOICE] Failed to initialize speech recognition:', err);
      setError(err?.message || 'Failed to initialize speech recognition');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    latestTranscriptRef.current = '';

    try {
      recognitionRef.current.start();
    } catch (err: any) {
      // If already started, restart
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 100);
      } catch (innerErr: any) {
        setError(innerErr?.message || 'Could not start microphone');
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    latestTranscriptRef.current = '';
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error,
    isSupported,
  };
}
