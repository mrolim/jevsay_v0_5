import type { APIRoute } from 'astro';
import { RESPONSE_CATALOG } from '../../lib/catalog';
import type { CanonicalActionId } from '../../lib/schemas';

export const prerender = false;

// Generates a valid 24kHz 16-bit Mono WAV in pure JS with harmonic formant envelope
function generateProceduralSpeechWav(text: string): Uint8Array {
  const sampleRate = 24000;
  const charCount = Math.max(10, text.length);
  const durationSec = Math.max(1.2, Math.min(4.5, charCount * 0.055));
  const totalSamples = Math.floor(sampleRate * durationSec);
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = totalSamples * bytesPerSample;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF Chunk
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataSize, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt Subchunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);          // 16 for PCM
  view.setUint16(20, 1, true);           // Linear PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);          // 16 bits per sample

  // data Subchunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true);

  // Generate pleasant human vowel formant audio modulation for FFT lip-sync
  const syllables = Math.max(4, Math.floor(charCount * 0.4));
  const syllableLen = totalSamples / syllables;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const syllPos = (i % syllableLen) / syllableLen;
    // Bell curve envelope for each syllable
    const syllEnv = Math.sin(syllPos * Math.PI);
    // Base pitch (F0: 160Hz) + First Formant (F1: 700Hz) + Second Formant (F2: 1800Hz)
    const wave = (
      Math.sin(2 * Math.PI * 160 * t) * 0.5 +
      Math.sin(2 * Math.PI * 720 * t) * 0.3 +
      Math.sin(2 * Math.PI * 1850 * t) * 0.2
    );
    // Fade in/out at ends of audio
    const globalFade = Math.min(1.0, Math.min(i / 1200, (totalSamples - i) / 1200));
    const sample = Math.max(-1.0, Math.min(1.0, wave * syllEnv * globalFade * 0.7));
    const int16 = sample < 0 ? sample * 32768 : sample * 32767;
    view.setInt16(44 + i * 2, int16, true);
  }

  return new Uint8Array(buffer);
}

export const GET: APIRoute = async ({ url }) => {
  const actionId = (url.searchParams.get("action_id") || "ACTION_GREETING_WAI") as CanonicalActionId;
  const item = RESPONSE_CATALOG[actionId] || RESPONSE_CATALOG.ACTION_GREETING_WAI;

  const wavBytes = generateProceduralSpeechWav(item.text);

  return new Response(wavBytes, {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "public, max-age=31536000, immutable",
      "CF-Cache-Status": "HIT",
      "Access-Control-Allow-Origin": "*"
    }
  });
};
