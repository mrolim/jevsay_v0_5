import type { CanonicalActionId, JevDecisionResult } from './schemas';
import { RESPONSE_CATALOG } from './catalog';

let consecutiveFailures = 0;
let circuitOpenUntil = 0;

export async function evaluateJevSystemOne(
  query: string,
  env: { JEV_API_URL?: string; JEV_API_KEY?: string }
): Promise<JevDecisionResult> {
  const t0 = performance.now();
  const now = Date.now();

  // Circuit Breaker check
  if (now < circuitOpenUntil) {
    const fallback = deterministicLocalMatcher(query);
    fallback.decision_latency_ms = performance.now() - t0;
    fallback.is_fallback = true;
    return fallback;
  }

  const apiKey = env.JEV_API_KEY || "";
  const apiUrl = env.JEV_API_URL || "https://api.typesafe.ai/v1/systemone";

  // If no API Key configured, use Deterministic Local Matcher directly
  if (!apiKey) {
    const res = deterministicLocalMatcher(query);
    res.decision_latency_ms = performance.now() - t0;
    res.is_fallback = false;
    return res;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 350);

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query,
        choices: Object.keys(RESPONSE_CATALOG),
        evaluate_score: true,
        evaluate_noul: true
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const data = await resp.json() as any;
      consecutiveFailures = 0;
      return {
        choice_id: data.choice_id || "ACTION_OUT_OF_SCOPE",
        confidence: data.confidence ?? 0.95,
        sentiment_score: data.sentiment_score ?? 1,
        safety_passed: data.safety_passed ?? true,
        language: data.language || (/[a-zA-Z]{4,}/.test(query) ? "en" : "th"),
        decision_latency_ms: performance.now() - t0,
        is_fallback: false
      };
    } else {
      throw new Error(`Jev HTTP ${resp.status}`);
    }
  } catch (err) {
    consecutiveFailures++;
    if (consecutiveFailures >= 5) {
      circuitOpenUntil = Date.now() + 60_000; // Trip breaker for 60s
    }
    const fallback = deterministicLocalMatcher(query);
    fallback.decision_latency_ms = performance.now() - t0;
    fallback.is_fallback = true;
    return fallback;
  }
}

export function deterministicLocalMatcher(query: string): JevDecisionResult {
  const lower = query.toLowerCase().trim();

  // Detect English
  const isEn = /[a-zA-Z]{4,}/.test(query) && !/(suay|dee|krub|ka)/i.test(query);

  for (const [actionId, item] of Object.entries(RESPONSE_CATALOG)) {
    for (const kw of item.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        let score = 2;
        if (actionId === "ACTION_CALL_STAFF") score = 9;
        return {
          choice_id: actionId as CanonicalActionId,
          confidence: 0.96,
          sentiment_score: score,
          safety_passed: true,
          language: item.language,
          decision_latency_ms: 0.5,
          is_fallback: false
        };
      }
    }
  }

  // Fallback Out of Scope
  return {
    choice_id: "ACTION_OUT_OF_SCOPE",
    confidence: 0.55,
    sentiment_score: 1,
    safety_passed: true,
    language: isEn ? "en" : "th",
    decision_latency_ms: 0.5,
    is_fallback: false
  };
}
