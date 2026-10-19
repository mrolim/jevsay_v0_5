import type { APIRoute } from 'astro';
import type { KioskInputPayload, KioskActionPayload } from '../../lib/schemas';
import { RESPONSE_CATALOG } from '../../lib/catalog';
import { checkLocalProfanity, checkPromptInjection, resolvePrecedenceLadder } from '../../lib/safetyFilter';
import { evaluateJevSystemOne } from '../../lib/jevEngine';

export const prerender = false;

// In-memory rate limiting per Worker isolate (15 requests/minute per IP — ADR-0005)
const ipRateMap = new Map<string, { count: number; resetAt: number }>();

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Kiosk-Token"
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  const t0 = performance.now();
  const now = Date.now();
  const ip = clientAddress || request.headers.get("cf-connecting-ip") || "unknown";

  // Read Cloudflare Runtime Env (supports @astrojs/cloudflare locals.runtime.env and import.meta.env)
  const runtimeEnv = (locals as any)?.runtime?.env || (import.meta as any).env || {};

  // 1. Shared Secret Client Token Verification (ADR-0005)
  const expectedToken = runtimeEnv.X_KIOSK_TOKEN || "jevsay-kiosk-secret-2026";
  const clientToken = request.headers.get("x-kiosk-token");
  if (clientToken && clientToken !== expectedToken) {
    return new Response(JSON.stringify({ error: "Unauthorized: Invalid X-Kiosk-Token" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }
    });
  }

  // 2. IP Rate Limiting Check (15 requests/min per IP — ADR-0005)
  let record = ipRateMap.get(ip);
  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: now + 60_000 };
    ipRateMap.set(ip, record);
  } else {
    record.count++;
    if (record.count > 15) {
      return new Response(JSON.stringify({ error: "Too Many Requests (Rate limit: 15 req/min per IP)" }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS }
      });
    }
  }

  try {
    const body = (await request.json()) as KioskInputPayload;
    const query = body.content || "";
    const turnId = body.turn_id || `turn-${Date.now()}`;

    // 3. Safety & Injection Checks
    const isProfane = checkLocalProfanity(query);
    const isInjection = checkPromptInjection(query);

    // 4. Jev Decision Brain
    const jevResult = await evaluateJevSystemOne(query, runtimeEnv);

    // 5. Precedence Ladder Resolution
    const resolvedActionId = resolvePrecedenceLadder(isProfane, isInjection, jevResult);
    const item = RESPONSE_CATALOG[resolvedActionId];

    // 6. Build Universal Contract v2.0 KioskActionPayload
    const internalComputeMs = performance.now() - t0;
    const payload: KioskActionPayload = {
      schema_version: "2.0.0",
      turn_id: turnId,
      action_id: resolvedActionId,
      interrupt_policy: item.interrupt_policy,
      priority: item.priority,
      look_at_normalized: item.look_at,
      subtitles: {
        text: item.text,
        language: item.language
      },
      audio_meta: {
        audio_id: `aud-${resolvedActionId.toLowerCase()}`,
        audio_url: `/api/tts?action_id=${resolvedActionId}`,
        is_cached: true,
        sample_rate: 24000,
        channels: 1,
        bit_depth: 16,
        duration_ms: Math.min(5000, Math.max(1200, item.text.length * 55))
      },
      suggested_actions: resolvedActionId === "ACTION_OUT_OF_SCOPE" ? [
        { label: "📍 ทางไปห้องน้ำ", action_id: "ACTION_POINT_EAST_WING", query: "ห้องน้ำไปทางไหน" },
        { label: "🛗 ทางไปลิฟต์", action_id: "ACTION_POINT_WEST_WING", query: "ลิฟต์อยู่ตรงไหน" },
        { label: "🏷️ ดูโปรโมชั่น", action_id: "ACTION_SHOW_PROMO_CARD", query: "ดูโปรโมชั่นวันนี้" },
        { label: "🛎️ ติดต่อพนักงาน", action_id: "ACTION_CALL_STAFF", query: "เรียกพนักงานช่วยเหลือ" }
      ] : undefined,
      viseme_track: null,
      telemetry: {
        internal_compute_ms: Math.round(internalComputeMs * 100) / 100,
        external_jev_api_ms: Math.round(jevResult.decision_latency_ms * 100) / 100,
        tts_lookup_ms: 0.1
      },
      status: jevResult.is_fallback ? "FALLBACK" : "SUCCESS"
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        ...CORS_HEADERS
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }
    });
  }
};
