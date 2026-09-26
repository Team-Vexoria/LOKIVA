import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseVoiceInputOptions {
  onFinalTranscript?: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  lang?: string;
}

export interface UseVoiceInputResult {
  isListening: boolean;
  isTranscribing: boolean;
  recordingDuration: number;
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
 * Eliminates consecutive duplicate word sequences of any length
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
 * Clean and format speech transcript:
 * Normalizes spacing, capitalizes first letter, eliminates forbidden dashes
 */
export function cleanSpeechTranscript(raw: string): string {
  if (!raw) return '';
  let text = deduplicatePhrases(raw);

  // Common Indian English travel acoustic corrections:
  text = text.replace(
    /\b(give me|make an?|plan an?|suggest an?|create an?|for an?|the|my|two days|2 days|3 days|three days|4 days|5 days|weekend)\s+identity\b/gi,
    '$1 itinerary'
  );
  text = text.replace(/\bidentity\s+for\s+(?:that|it|this|me)\b/gi, 'itinerary for that');
  text = text.replace(/\b(?:iterinary|iternary|itinary|itinery|itenary)\b/gi, 'itinerary');
  text = text.replace(/\b(hello|hey|hi)\s+kiva\b/gi, '$1 Lokiva');
  text = text.replace(/\bkiva\b/gi, 'Lokiva');
  text = text.replace(/\b(for\s+)?(two|2|three|3|four|4|five|5)\s+version\b/gi, '$1$2 persons');

  // Strictly eliminate any forbidden dashes
  text = text
    .replace(/[\u2014\u2015]/g, ', ')
    .replace(/[\u2013]/g, '-')
    .replace(/--+/g, '-');

  // Normalize spaces
  text = text.replace(/\s+/g, ' ').trim();

  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return text;
}

/**
 * Converts a Blob to base64 Data URL string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Fallback REST Audio Transcription Pipeline
 */
async function callAiAudioTranslationApi(blob: Blob): Promise<string> {
  if (!blob || blob.size < 500) {
    return '';
  }

  try {
    const base64Data = await blobToBase64(blob);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const endpoints = [
      '/voice/transcribe',
      '/api/v1/voice/transcribe',
      'http://localhost:4000/voice/transcribe',
    ];

    let apiTranscript = '';

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio: base64Data,
            mimeType: blob.type || 'audio/webm',
          }),
          signal: controller.signal,
        });

        if (response.ok) {
          const json = await response.json();
          if (json?.transcript && typeof json.transcript === 'string') {
            apiTranscript = json.transcript.trim();
            break;
          }
        }
      } catch (endpointErr) {
        // Try next candidate
      }
    }

    clearTimeout(timeoutId);

    if (apiTranscript) {
      return cleanSpeechTranscript(apiTranscript);
    }
  } catch (backendErr) {
    console.warn('[VOICE-API] REST fallback notice:', backendErr);
  }

  return '';
}

/**
 * Real-Time Streaming Voice Input Hook
 * Combines zero-latency live browser speech recognition with real-time
 * WebSocket audio streaming to the backend Gemini AI translation engine.
 */
export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputResult {
  const { onFinalTranscript, onInterimTranscript, lang = 'en-IN' } = options;
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isSupported = typeof window !== 'undefined' && !!(navigator?.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined');

  const isUserRecordingRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  const onInterimTranscriptRef = useRef(onInterimTranscript);
  const latestTranscriptRef = useRef('');
  const wsRef = useRef<WebSocket | null>(null);
  const finalReceivedRef = useRef(false);

  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
    onInterimTranscriptRef.current = onInterimTranscript;
  });

  // Stop MediaRecorder cleanly and collect all audio chunks into a Blob
  const stopRecordingAndGetBlob = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        if (audioChunksRef.current.length > 0) {
          const mime = recorder?.mimeType || 'audio/webm';
          resolve(new Blob(audioChunksRef.current, { type: mime }));
        } else {
          resolve(null);
        }
        return;
      }

      recorder.onstop = () => {
        try {
          const mime = recorder.mimeType || 'audio/webm';
          const finalBlob = new Blob(audioChunksRef.current, { type: mime });
          resolve(finalBlob);
        } catch {
          resolve(null);
        }
      };

      try {
        recorder.stop();
      } catch (err) {
        const mime = recorder?.mimeType || 'audio/webm';
        resolve(audioChunksRef.current.length > 0 ? new Blob(audioChunksRef.current, { type: mime }) : null);
      }
    });
  }, []);

  // Stop all microphone tracks & close socket cleanly
  const stopMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const finalizeAndSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return;
    if (!isUserRecordingRef.current) return;
    isSubmittingRef.current = true;
    isUserRecordingRef.current = false;
    finalReceivedRef.current = false;

    // Properly stop recorder and retrieve the complete audio blob
    const recordedBlob = await stopRecordingAndGetBlob();

    // Release microphone immediately
    stopMediaStream();

    setIsListening(false);
    setIsTranscribing(true);

    // 1. Notify WebSocket to finalize
    const socket = wsRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'stop' }));
    }

    // 2. Set timeout fallback: if socket doesn't return final within 2s, commit local transcript
    const fallbackTimeout = setTimeout(async () => {
      if (!finalReceivedRef.current) {
        const textToCommit = cleanSpeechTranscript(latestTranscriptRef.current || '');
        if (textToCommit && onFinalTranscriptRef.current) {
          onFinalTranscriptRef.current(textToCommit);
        } else if (recordedBlob && recordedBlob.size > 500) {
          try {
            const translatedText = await callAiAudioTranslationApi(recordedBlob);
            if (translatedText && onFinalTranscriptRef.current) {
              onFinalTranscriptRef.current(translatedText);
            }
          } catch (err) {
            console.warn('[VOICE] Fallback error:', err);
          }
        }
        setIsTranscribing(false);
      }
    }, 2000);

    // Clean up socket after transmission
    setTimeout(() => {
      clearTimeout(fallbackTimeout);
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
      setIsTranscribing(false);
      audioChunksRef.current = [];
      isSubmittingRef.current = false;
    }, 4500);
  }, [stopRecordingAndGetBlob, stopMediaStream]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Microphone recording is not supported in this browser.');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    latestTranscriptRef.current = '';
    setRecordingDuration(0);
    audioChunksRef.current = [];
    isUserRecordingRef.current = true;
    isSubmittingRef.current = false;
    finalReceivedRef.current = false;
    setIsTranscribing(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      // Initialize real-time WebSocket connection to /voice-stream
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const wsHost = isLocal ? 'localhost:4000' : window.location.host;
        const wsUrl = `${protocol}//${wsHost}/voice-stream`;
        console.log('[VOICE-WS] Connecting directly to:', wsUrl);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[VOICE-WS] Connected successfully to voice stream');
          ws.send(JSON.stringify({ type: 'start', mimeType }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'interim' && data.transcript) {
              const cleaned = cleanSpeechTranscript(data.transcript);
              latestTranscriptRef.current = cleaned;
              setInterimTranscript(cleaned);
              if (onInterimTranscriptRef.current) {
                onInterimTranscriptRef.current(cleaned);
              }
            } else if (data.type === 'final') {
              finalReceivedRef.current = true;
              const serverTxt = cleanSpeechTranscript(data.transcript || '');
              const finalTxt = serverTxt || cleanSpeechTranscript(latestTranscriptRef.current || '');
              if (finalTxt) {
                setTranscript(finalTxt);
                setInterimTranscript(finalTxt);
                if (onFinalTranscriptRef.current) {
                  onFinalTranscriptRef.current(finalTxt);
                }
              }
              setIsTranscribing(false);
            }
          } catch (err) {}
        };

        ws.onerror = (err) => {
          console.warn('[VOICE-WS] WebSocket connection notice (will use REST fallback if needed):', err);
        };
      } catch (wsErr) {
        console.warn('[VOICE-WS] Could not initialize WebSocket:', wsErr);
      }

      // Instant live visual feedback via SpeechRecognition while audio streams to Gemini
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = lang;

          recognition.onresult = (e: any) => {
            let liveText = '';
            for (let i = e.resultIndex; i < e.results.length; ++i) {
              liveText += e.results[i][0].transcript;
            }
            if (liveText && liveText.trim() && isUserRecordingRef.current) {
              const cleaned = cleanSpeechTranscript(liveText);
              latestTranscriptRef.current = cleaned;
              setInterimTranscript(cleaned);
              if (onInterimTranscriptRef.current) {
                onInterimTranscriptRef.current(cleaned);
              }
            }
          };

          recognition.start();
        } catch (e) {
          // Native recognition unavailable or permission denied
        }
      }

      // Start MediaRecorder with 150ms slices for low-latency streaming
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);

          // Stream binary chunk immediately over WebSocket if active
          const socket = wsRef.current;
          if (socket && socket.readyState === WebSocket.OPEN) {
            try {
              const arrayBuffer = await e.data.arrayBuffer();
              socket.send(arrayBuffer);
            } catch (streamErr) {
              console.warn('[VOICE] Stream chunk error:', streamErr);
            }
          }
        }
      };

      recorder.start(150);
      mediaRecorderRef.current = recorder;
      setIsListening(true);

      // Start elapsed recording duration timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingDuration(elapsed);
      }, 500);
    } catch (micErr: any) {
      console.error('[VOICE] Microphone access error:', micErr);
      setError('Could not access microphone. Please grant microphone permissions.');
      isUserRecordingRef.current = false;
      setIsListening(false);
      stopMediaStream();
    }
  }, [isSupported, lang, stopMediaStream]);

  const submitListening = useCallback(() => {
    // If the user already has spoken text from live SpeechRecognition or WebSocket interim,
    // commit it immediately and stop recording.
    const currentText = cleanSpeechTranscript(latestTranscriptRef.current || interimTranscript || transcript || '');
    if (currentText && currentText.trim()) {
      isUserRecordingRef.current = false;
      isSubmittingRef.current = false;
      finalReceivedRef.current = true;
      stopMediaStream();
      setIsListening(false);
      setIsTranscribing(false);
      setTranscript(currentText);
      setInterimTranscript(currentText);
      if (wsRef.current) {
        try {
          if (wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'stop' }));
          }
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
      if (onFinalTranscriptRef.current) {
        onFinalTranscriptRef.current(currentText);
      }
      return;
    }

    finalizeAndSubmit();
  }, [finalizeAndSubmit, interimTranscript, transcript, stopMediaStream]);

  const cancelListening = useCallback(() => {
    isUserRecordingRef.current = false;
    isSubmittingRef.current = false;
    finalReceivedRef.current = false;
    latestTranscriptRef.current = '';

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'cancel' }));
      }
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }

    stopMediaStream();
    setIsListening(false);
    setIsTranscribing(false);
    setRecordingDuration(0);
    setInterimTranscript('');
    audioChunksRef.current = [];
  }, [stopMediaStream]);

  const stopListening = useCallback(() => {
    if (isSubmittingRef.current) return;
    if (isUserRecordingRef.current) {
      const currentText = cleanSpeechTranscript(latestTranscriptRef.current || interimTranscript || '');
      if (currentText && currentText.trim()) {
        submitListening();
      } else {
        finalizeAndSubmit();
      }
    } else {
      cancelListening();
    }
  }, [submitListening, finalizeAndSubmit, cancelListening, interimTranscript]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    latestTranscriptRef.current = '';
    setRecordingDuration(0);
    audioChunksRef.current = [];
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      stopMediaStream();
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
      }
    };
  }, [stopMediaStream]);

  return {
    isListening,
    isTranscribing,
    recordingDuration,
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
