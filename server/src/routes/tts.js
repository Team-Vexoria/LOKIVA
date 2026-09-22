import express from 'express';

export const ttsRouter = express.Router();

// Fallback voice ID if none configured: default ElevenLabs Indian English / multilingual voice
const DEFAULT_INDIAN_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Default voice or replace with custom Indian voice ID

/**
 * Status endpoint to check whether hosted ElevenLabs TTS is configured.
 */
ttsRouter.get(['/synthesize/status', '/status'], (req, res) => {
  const isConfigured = Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_API_KEY.trim() !== '');
  return res.json({
    configured: isConfigured,
    voice_id: process.env.ELEVENLABS_VOICE_ID || DEFAULT_INDIAN_VOICE_ID,
    engine: isConfigured ? 'elevenlabs' : 'browser_fallback',
  });
});

/**
 * POST /voice/synthesize
 * Synthesizes speech using ElevenLabs multilingual neural TTS.
 * Returns raw audio/mpeg stream directly to client without saving to disk.
 */
ttsRouter.post(['/synthesize', '/voice/synthesize'], async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'text is required' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY ? process.env.ELEVENLABS_API_KEY.trim() : '';
    const voiceId = process.env.ELEVENLABS_VOICE_ID ? process.env.ELEVENLABS_VOICE_ID.trim() : DEFAULT_INDIAN_VOICE_ID;

    if (!apiKey) {
      console.warn('[TTS-API] ELEVENLABS_API_KEY is not configured in server/.env');
      return res.status(502).json({
        error: 'tts_unconfigured',
        detail: 'ELEVENLABS_API_KEY not configured',
      });
    }

    // Clean text of any markdown symbols
    const cleanText = text.replace(/[\*\#_]/g, '').trim();

    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`;

    console.time('[LATENCY] ElevenLabs generation');
    const response = await fetch(elevenLabsUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_flash_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      console.timeEnd('[LATENCY] ElevenLabs generation');
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = errorText;
      }
      console.error('[TTS-API] ElevenLabs call failed');
      console.error('[TTS-API] Status:', response.status);
      console.error('[TTS-API] Response data:', JSON.stringify(errorData, null, 2));
      console.error('[TTS-API] Response headers:', Object.fromEntries(response.headers.entries()));
      return res.status(502).json({
        error: 'tts_failed',
        status: response.status,
        detail: errorData,
      });
    }

    // Stream raw audio directly to the client
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');

    const arrayBuffer = await response.arrayBuffer();
    console.timeEnd('[LATENCY] ElevenLabs generation');
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (err) {
    console.error('[TTS-API] ElevenLabs call failed');
    console.error('[TTS-API] err.message:', err.message);
    if (err.response) {
      console.error('[TTS-API] Status:', err.response.status);
      console.error('[TTS-API] Response data:', err.response.data);
      console.error('[TTS-API] Response headers:', err.response.headers);
    } else {
      console.error('[TTS-API] Full error object:', err);
    }
    return res.status(502).json({ error: 'tts_failed', detail: err.message });
  }
});
