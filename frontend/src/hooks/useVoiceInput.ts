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

  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
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

        if (currentFinal) {
          const trimmed = currentFinal.trim();
          latestTranscriptRef.current = trimmed;
          setTranscript(trimmed);
          setInterimTranscript('');
          if (onFinalTranscript) {
            onFinalTranscript(trimmed);
          }
        } else {
          setInterimTranscript(currentInterim);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      setIsSupported(false);
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
  }, [lang, onFinalTranscript]);

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
