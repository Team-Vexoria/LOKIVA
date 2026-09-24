import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseVoiceInputOptions {
  onFinalTranscript?: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  lang?: string;
}

export interface UseVoiceInputResult {
  isListening: boolean;
  isTranscribing: boolean;
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
 * Cleans extra whitespace from speech transcript
 */
export function cleanSpeechTranscript(raw: string): string {
  if (!raw) return '';
  return raw.replace(/\s+/g, ' ').trim();
}

/**
 * Transcribes audio via FastAPI faster-whisper backend
 */
async function transcribeWithFasterWhisper(blob: Blob): Promise<string | null> {
  try {
    const formData = new FormData();
    const isMp4 = blob.type.includes('mp4');
    const filename = isMp4 ? 'recording.mp4' : 'recording.webm';
    formData.append('file', blob, filename);

    console.log(`[VOICE] Submitting audio to /stt?task=translate (type: ${blob.type}, size: ${blob.size} bytes)...`);
    const res = await fetch('/stt?task=translate', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.text === 'string') {
        const text = data.text.trim();
        console.log(`[VOICE] faster-whisper translated result (${data.provider || 'local'}):`, text);
        return text;
      }
    } else {
      console.warn('[VOICE] /stt response status:', res.status);
    }
  } catch (err: any) {
    console.warn('[VOICE] faster-whisper request error:', err?.message || err);
  }
  return null;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputResult {
  const { onFinalTranscript, onInterimTranscript } = options;
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isSubmittingRef = useRef(false);

  const onFinalTranscriptRef = useRef(onFinalTranscript);
  const onInterimTranscriptRef = useRef(onInterimTranscript);

  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
    onInterimTranscriptRef.current = onInterimTranscript;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasMedia = Boolean(navigator?.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined');
      if (!hasMedia) {
        setIsSupported(false);
      }
    }
  }, []);

  const cleanupMedia = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    mediaRecorderRef.current = null;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      mediaStreamRef.current = null;
    }
  }, []);

  const processAndSubmitAudio = useCallback(async (audioBlob: Blob) => {
    setIsListening(false);
    setIsTranscribing(true);

    let extractedText = '';

    if (audioBlob && audioBlob.size > 500) {
      const whisperText = await transcribeWithFasterWhisper(audioBlob);
      if (whisperText && whisperText.trim()) {
        extractedText = whisperText.trim();
      }
    } else {
      console.warn('[VOICE] Audio blob is empty or too short:', audioBlob?.size);
    }

    const clean = cleanSpeechTranscript(extractedText);
    console.log('[VOICE] Final clean transcript resolved:', clean);

    setTranscript(clean);
    setInterimTranscript(clean);
    setIsTranscribing(false);
    isSubmittingRef.current = false;

    if (clean && onFinalTranscriptRef.current) {
      onFinalTranscriptRef.current(clean);
    } else if (!clean) {
      setError('Could not recognize speech. Please speak closer to your microphone and try again.');
    }
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    chunksRef.current = [];
    isSubmittingRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        cleanupMedia();
        processAndSubmitAudio(finalBlob);
      };

      // Request data in 100ms intervals
      recorder.start(100);
      setIsListening(true);
      console.log('[VOICE] MediaRecorder voice recording active with mimeType:', recorder.mimeType);
    } catch (err: any) {
      console.error('[VOICE] Microphone initialization error:', err);
      setError(err?.message || 'Could not open microphone. Please allow microphone access in browser settings.');
      setIsListening(false);
    }
  }, [cleanupMedia, processAndSubmitAudio]);

  const stopListening = useCallback(() => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      cleanupMedia();
      setIsListening(false);
    }
  }, [cleanupMedia]);

  const submitListening = useCallback(() => {
    stopListening();
  }, [stopListening]);

  const cancelListening = useCallback(() => {
    isSubmittingRef.current = false;
    cleanupMedia();
    chunksRef.current = [];
    setIsListening(false);
    setIsTranscribing(false);
    setInterimTranscript('');
  }, [cleanupMedia]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isTranscribing,
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
