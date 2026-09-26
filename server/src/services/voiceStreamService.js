import { WebSocketServer } from 'ws';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Transcribes accumulated audio chunks using Gemini Flash.
 * Translates Hindi/Hinglish/vernacular into natural English and corrects travel terms.
 */
async function transcribeAudioBuffer(buffer, mimeType = 'audio/webm', isInterim = false) {
  if (!buffer || buffer.length < 2000) {
    return '';
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return '';
  }

  const base64Audio = buffer.toString('base64');
  const cleanMime = (mimeType || 'audio/webm').split(';')[0].trim().toLowerCase();

  const candidateModels = [
    process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
  ];

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = isInterim
        ? `Quickly transcribe what the user is saying so far. If in Hindi/Hinglish, translate directly to natural English. Return ONLY words spoken without punctuation or explanation.`
        : `Accurately transcribe and translate this Indian travel audio into clean, natural English.
Rules:
1. Translate Hindi, Hinglish, Marathi, or vernacular Indian speech directly to natural English.
2. Correct Indian travel terms, destinations, city names, monuments (e.g. itinerary, Shimla, Jaipur, Bastar, Mall Road, Dham, thali, hotel, booking).
3. Eliminate repeated stuttering phrases.
4. If pure silence or no speech, output: [NO_SPEECH].
5. Return ONLY the clean final text. No quotes, markdown, or commentary.`;

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: cleanMime,
            data: base64Audio,
          },
        },
        { text: prompt },
      ]);

      const text = (result?.response?.text() || '').trim();
      const cleaned = text
        .replace(/^["'`]+|["'`]+$/g, '')
        .replace(/[\u2014\u2015]/g, ', ')
        .replace(/[\u2013]/g, '-')
        .replace(/--+/g, '-')
        .trim();

      if (cleaned === '[NO_SPEECH]' || cleaned.toLowerCase() === 'no speech') {
        return '';
      }

      return cleaned;
    } catch (err) {
      // Try next model candidate
      continue;
    }
  }

  return '';
}

/**
 * Initializes the real-time voice streaming WebSocket server.
 */
export function setupVoiceWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: '/voice-stream',
  });

  console.log('[VOICE-WS] Real-time voice WebSocket server ready on /voice-stream');

  wss.on('connection', (ws, req) => {
    let audioChunks = [];
    let currentMimeType = 'audio/webm';
    let interimTimer = null;
    let isProcessingInterim = false;
    let lastInterimTranscript = '';

    const runInterimTranscribe = async () => {
      if (isProcessingInterim || audioChunks.length === 0) return;
      isProcessingInterim = true;

      try {
        const combined = Buffer.concat(audioChunks);
        if (combined.length > 2500) {
          const partial = await transcribeAudioBuffer(combined, currentMimeType, true);
          if (partial && partial !== lastInterimTranscript && ws.readyState === ws.OPEN) {
            lastInterimTranscript = partial;
            ws.send(JSON.stringify({
              type: 'interim',
              transcript: partial,
            }));
          }
        }
      } catch (err) {
        // Suppress interim errors
      } finally {
        isProcessingInterim = false;
      }
    };

    ws.on('message', async (message, isBinary) => {
      try {
        if (!isBinary) {
          const textData = message.toString();
          const parsed = JSON.parse(textData);

          if (parsed.type === 'start') {
            audioChunks = [];
            currentMimeType = parsed.mimeType || 'audio/webm';
            lastInterimTranscript = '';

            // Run periodic interim transcription every 1 second for live stream feedback
            if (interimTimer) clearInterval(interimTimer);
            interimTimer = setInterval(runInterimTranscribe, 1000);

            ws.send(JSON.stringify({ type: 'ready' }));
            return;
          }

          if (parsed.type === 'stop') {
            if (interimTimer) {
              clearInterval(interimTimer);
              interimTimer = null;
            }

            const combined = Buffer.concat(audioChunks);
            ws.send(JSON.stringify({ type: 'transcribing' }));

            const finalTranscript = await transcribeAudioBuffer(combined, currentMimeType, false);
            
            if (ws.readyState === ws.OPEN) {
              ws.send(JSON.stringify({
                type: 'final',
                transcript: finalTranscript,
              }));
            }
            audioChunks = [];
            return;
          }

          if (parsed.type === 'cancel') {
            if (interimTimer) clearInterval(interimTimer);
            audioChunks = [];
            lastInterimTranscript = '';
            return;
          }
        } else {
          // Binary audio slice received from client MediaRecorder
          audioChunks.push(Buffer.from(message));
        }
      } catch (err) {
        console.error('[VOICE-WS] Message error:', err);
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: 'error', message: err.message }));
        }
      }
    });

    ws.on('close', () => {
      if (interimTimer) clearInterval(interimTimer);
      audioChunks = [];
    });

    ws.on('error', (err) => {
      console.error('[VOICE-WS] Socket error:', err);
      if (interimTimer) clearInterval(interimTimer);
      audioChunks = [];
    });
  });

  return wss;
}
