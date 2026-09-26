import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseVoiceInputOptions {
  onFinalTranscript?: (text: string) => void;
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
  text = text.replace(/\b(?:iterinary|iternary|itinary|itinery)\b/gi, 'itinerary');
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
 * External AI API Audio Translation & Transcription Pipeline:
 * Sends the audio recording to backend Gemini 3.6 Flash Multimodal Audio API
 * with automatic fallback to client-side Puter.js Whisper AI.
 */
async function callAiAudioTranslationApi(blob: Blob): Promise<string> {
  if (!blob || blob.size < 500) {
    return '';
  }

  // Tier 1: Backend Gemini Flash Multimodal Audio API (/voice/transcribe)
  try {
    const base64Data = await blobToBase64(blob);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

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
            audioBase64: base64Data,
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
        // Try next endpoint candidate
        console.log("Endpoint uncaught error")
      }
    }

    clearTimeout(timeoutId);

    if (apiTranscript) {
      console.log('[VOICE-API] Gemini Audio Translation API output:', apiTranscript);
      return cleanSpeechTranscript(apiTranscript);
    }
  } catch (backendErr) {
    console.warn('[VOICE-API] Backend Gemini transcribe notice:', backendErr);
  }

  // Tier 2: Puter.js Whisper AI Fallback (OpenAI Whisper speech-to-text API)
  try {
    const puter = (window as any).puter;
    if (puter?.ai?.speech2txt) {
      console.log('[VOICE-API] Invoking Puter.js Whisper speech-to-text API...');
      const whisperPromise = puter.ai.speech2txt(blob, { model: 'whisper-1' });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Whisper timeout')), 5000)
      );

      const whisperRes: any = await Promise.race([whisperPromise, timeoutPromise]);
      const rawWhisper = typeof whisperRes === 'string' ? whisperRes : whisperRes?.text;
      if (rawWhisper && typeof rawWhisper === 'string' && rawWhisper.trim()) {
        console.log('[VOICE-API] Puter Whisper API output:', rawWhisper.trim());
        return cleanSpeechTranscript(rawWhisper.trim());
      }
    }
  } catch (puterErr) {
    console.warn('[VOICE-API] Puter speech2txt notice:', puterErr);
  }

  return '';
}

/**
 * 100% API-Driven Voice Input Hook:
 * Records microphone audio locally and sends to external AI API for translation and transcription.
 * Strictly eliminates native browser SpeechRecognition to prevent premature cutoffs and split messages.
 */
export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputResult {
  const { onFinalTranscript } = options;
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

  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
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
          console.log("[VOICE] Audio Chunks Don't Exist.")
          resolve(null);
        }
        return;
      }

      recorder.onstop = () => {
        try {
          const mime = recorder.mimeType || 'audio/webm';
          const finalBlob = new Blob(audioChunksRef.current, { type: mime });
          console.log('[VOICE] MediaRecorder closed. Chunks count:', audioChunksRef.current.length, 'Total bytes:', finalBlob.size);
          resolve(finalBlob);
          console.log(finalBlob)
        } catch {
          resolve(null);
        }
      };

      try {
        recorder.stop();
      } catch (err) {
        console.warn('[VOICE] MediaRecorder stop notice:', err);
        const mime = recorder?.mimeType || 'audio/webm';
        resolve(audioChunksRef.current.length > 0 ? new Blob(audioChunksRef.current, { type: mime }) : null);
      }
    });
  }, []);

  // Stop all microphone stream tracks cleanly
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

    // Properly stop recorder and retrieve the complete, valid audio blob
    const recordedBlob = await stopRecordingAndGetBlob();
    console.log(recordedBlob)

    // Release microphone tracks immediately
    stopMediaStream();

    setIsListening(false);
    setIsTranscribing(true);

    try {
      if (recordedBlob && recordedBlob.size > 500) {
        console.log('[VOICE] Sending full recording to AI translation and transcription API...');
        const translatedText = await callAiAudioTranslationApi(recordedBlob);

        if (translatedText) {
          console.log('[VOICE] API translation successful:', translatedText);
          setTranscript(translatedText);
          setInterimTranscript(translatedText);
          if (onFinalTranscriptRef.current) {
            onFinalTranscriptRef.current(translatedText);
          }
        } else {
          console.warn('[VOICE] API returned empty translation (silence or unintelligible noise)');
          setError('No clear speech detected. Please speak closer to your microphone.');
        }
      } else {
        console.log('[VOICE] Audio recording was too short or empty');
      }
    } catch (err: any) {
      console.warn('[VOICE] Finalize error:', err);
      setError('Voice translation failed. Please try again or type your message.');
    } finally {
      setIsTranscribing(false);
      audioChunksRef.current = [];
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 300);
    }
  }, [stopRecordingAndGetBlob, stopMediaStream]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Microphone recording is not supported in this browser.');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setRecordingDuration(0);
    audioChunksRef.current = [];
    isUserRecordingRef.current = true;
    isSubmittingRef.current = false;
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

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsListening(true);
      console.log('[VOICE] Pure MediaRecorder active with format:', mimeType);

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
  }, [isSupported, stopMediaStream]);

  const submitListening = useCallback(() => {
    finalizeAndSubmit();
  }, [finalizeAndSubmit]);

  const cancelListening = useCallback(() => {
    isUserRecordingRef.current = false;
    isSubmittingRef.current = false;
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
      finalizeAndSubmit();
    } else {
      cancelListening();
    }
  }, [finalizeAndSubmit, cancelListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setRecordingDuration(0);
    audioChunksRef.current = [];
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      stopMediaStream();
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
