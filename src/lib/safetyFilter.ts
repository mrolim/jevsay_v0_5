import type { CanonicalActionId, JevDecisionResult } from './schemas';

const PROFANITY_PATTERNS = [
  /ค[\s._\-*]*ว[\s._\-*]*ย/i,
  /เ[\s._\-*]*หี้[\s._\-*]*ย/i,
  /เ[\s._\-*]*ห้[\s._\-*]*ย/i,
  /สั[\s._\-*]*ส/i,
  /สั[\s._\-*]*ด/i,
  /มึ[\s._\-*]*ง/i,
  /กู/i,
  /\b(hia|sus|kuay|kuy|fuck|shit|bitch|bastard)\b/i
];

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous/i,
  /system\s+prompt/i,
  /system\s+override/i,
  /ลืมคำสั่ง(ก่อนหน้า)?/i,
  /บอกรหัสผ่าน/i,
  /show\s+password/i
];

export function checkLocalProfanity(text: string): boolean {
  const clean = text.trim();
  for (const regex of PROFANITY_PATTERNS) {
    if (regex.test(clean)) return true;
  }
  return false;
}

export function checkPromptInjection(text: string): boolean {
  const clean = text.trim();
  for (const regex of INJECTION_PATTERNS) {
    if (regex.test(clean)) return true;
  }
  return false;
}

export function resolvePrecedenceLadder(
  localProfane: boolean,
  isInjection: boolean,
  jev: JevDecisionResult
): CanonicalActionId {
  // Precedence 1: Noul Safety Gate
  if (localProfane || !jev.safety_passed) {
    return "ACTION_POLITE_REFUSAL";
  }
  // Precedence 2: Prompt Injection
  if (isInjection) {
    return "ACTION_OUT_OF_SCOPE";
  }
  // Precedence 3: Extreme Frustration
  if (jev.sentiment_score >= 9) {
    return "ACTION_CALL_STAFF";
  }
  // Precedence 4: Low Confidence
  if (jev.confidence < 0.70) {
    return "ACTION_OUT_OF_SCOPE";
  }
  // Precedence 5: Normal Intent
  return jev.choice_id;
}
