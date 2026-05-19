export type DecisionTier =
  | "inform"
  | "observe"
  | "guard_ready"
  | "rollback_ready"
  | "block_recommended";
export type DeliveryStatus = "ready" | "held";

export interface OperatorStep {
  [key: string]: unknown;
}

export interface ProtectionGuidance {
  [key: string]: unknown;
}

export interface SummaryResponse {
  id: string;
  deployment_id: string;
  verdict: string | null;
  confidence: string | null;
  recommended_action: string | null;
  recommended_action_detail: string | null;
  decision_tier: DecisionTier | null;
  rationale_summary: string | null;
  operator_steps: OperatorStep[];
  protection_guidance: ProtectionGuidance | null;
  affected_apis: string[];
  top_signals: string[];
  delivery_status: DeliveryStatus;
  delivery_hold_reason: string | null;
  external_delivery_ready: boolean;
  agent_ready: boolean;
  created_at: string;
}

export interface RecentDeploymentResponse {
  deployment_id: string;
  version: string | null;
  deployed_at: string;
  window_status: string;
}

export interface RecentDeploymentsResponse {
  items: RecentDeploymentResponse[];
}

export interface VerdictResult {
  verdict: string;
  decision_tier: DecisionTier;
  recommended_action: string;
  action_detail: string;
  rationale_summary: string;
  operator_steps: OperatorStep[];
  protection_guidance: ProtectionGuidance | null;
  affected_apis: string[];
  top_signals: string[];
  delivery_status: DeliveryStatus;
  delivery_hold_reason: string | null;
  external_delivery_ready: boolean;
  agent_ready: boolean;
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

export interface ListRecentDeploymentsReadyResult {
  status: "ready";
  deployments: RecentDeploymentResponse[];
}

export type ListRecentDeploymentsResult = ListRecentDeploymentsReadyResult | ErrorResult;
