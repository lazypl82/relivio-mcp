export type DecisionTier =
  | "inform"
  | "observe"
  | "guard_ready"
  | "rollback_ready"
  | "block_recommended";

export interface SummaryResponse {
  id: string;
  deployment_id: string;
  verdict: string | null;
  confidence: string | null;
  recommended_action: string | null;
  recommended_action_detail: string | null;
  decision_tier: DecisionTier | null;
  affected_apis: string[];
  top_signals: string[];
  created_at: string;
}

export interface VerdictResult {
  verdict: string;
  decision_tier: DecisionTier;
  recommended_action: string;
  action_detail: string;
  affected_apis: string[];
  top_signals: string[];
  deployment_id: string;
  created_at: string;
}

export interface PendingResult {
  status: "pending";
  reason: "observation_window_active";
  message: string;
  retry_after_hint_minutes: number;
}

export interface ErrorResult {
  status: "error";
  reason: "authentication_failed" | "server_unavailable";
  message: string;
}

export interface ReadyResult {
  status: "ready";
  verdict: VerdictResult;
}

export type GetVerdictResult = ReadyResult | PendingResult | ErrorResult;
