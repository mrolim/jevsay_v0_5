export type CanonicalActionId =
  | "ACTION_GREETING_WAI"
  | "ACTION_POINT_EAST_WING"
  | "ACTION_POINT_WEST_WING"
  | "ACTION_SHOW_PROMO_CARD"
  | "ACTION_INFO_RETAIL"
  | "ACTION_CALL_STAFF"
  | "ACTION_POLITE_REFUSAL"
  | "ACTION_POINT_EXIT"
  | "ACTION_OUT_OF_SCOPE"
  | "ACTION_BOW_THANKYOU";

export interface KioskInputPayload {
  schema_version: "2.0.0";
  session_id: string;
  turn_id: string;
  input_type: "text" | "simulated_audio";
  content: string;
  client_metadata?: {
    device?: string;
    client_sent_epoch_ms?: number;
  };
}

export interface JevDecisionResult {
  choice_id: CanonicalActionId;
  confidence: number;
  sentiment_score: number;
  safety_passed: boolean;
  language: "th" | "en";
  decision_latency_ms: number;
  is_fallback: boolean;
}

export interface KioskActionPayload {
  schema_version: "2.0.0";
  turn_id: string;
  action_id: CanonicalActionId;
  interrupt_policy: "queue" | "blend" | "hard_cut";
  priority: number;
  look_at_normalized: {
    x: number;
    y: number;
    distance_norm: number;
  };
  subtitles: {
    text: string;
    language: "th" | "en";
  };
  audio_meta: {
    audio_id: string;
    audio_url: string;
    is_cached: boolean;
    sample_rate: 24000;
    channels: 1;
    bit_depth: 16;
    duration_ms: number;
  };
  suggested_actions?: Array<{
    label: string;
    action_id: CanonicalActionId;
    query: string;
  }>;
  viseme_track: null;
  telemetry: {
    internal_compute_ms: number;
    external_jev_api_ms: number;
    tts_lookup_ms: number;
  };
  status: "SUCCESS" | "DEGRADED" | "FALLBACK" | "ERROR";
}
